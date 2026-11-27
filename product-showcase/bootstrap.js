/**
 * ShowcaseBootstrap is the viewer's only browser entry and host-message adapter.
 * It loads one same-origin catalogue, owns URL entry selection, and wires the
 * isolated MotionExperience. The parent page alone owns its full-window dialog.
 * There is no persistent state, authentication or arbitrary URL/message forwarding.
 * start() is called once by the defer-script entry below; destroy() cancels fetch,
 * listeners, measurements and controller resources when the document is discarded.
 */
class ShowcaseBootstrap {
  /**
   * Bind a viewer root and normalize its display mode before asynchronous work.
   * Only inline/modal modes are accepted; all other values become a normal page.
   * A same-origin parent must independently validate this document's window.
   */
  constructor(root) {
    this.root=root;this.status=root.querySelector('#load-status');
    this.events=new AbortController();this.fetchController=new AbortController();
    this.mode=['inline','modal'].includes(new URLSearchParams(location.search).get('mode'))
      ?new URLSearchParams(location.search).get('mode'):'page';
    this.root.dataset.mode=this.mode;
    this.experience=null;this.records=null;this.heightObserver=null;
    this.frame=0;this.lastHeight=0;this.fetchTimer=0;
    this.suspended=false;this.started=false;this.destroyed=false;this.readySent=false;
    this.channel='vesa-product-showcase';this.protocol=1;
  }
  /** Attach a listener to this document's lifecycle without publishing global state. */
  listen(target,type,handler,options={}) {
    target.addEventListener(type,handler,{...options,signal:this.events.signal});
  }
  /**
   * Fetch the lightweight manifest, validate local asset boundaries, and wait for
   * the initial main model to settle before signalling ready. Fetch/JSON failures
   * show a concise local error; parent links remain valid fallback navigation.
   */
  async start() {
    if(this.started||this.destroyed)return;
    this.started=true;
    this.root.dataset.loadState='loading';this.root.setAttribute('aria-busy','true');
    this.status.hidden=false;this.status.textContent='Loading products…';
    this.listen(window,'message',event=>this.onMessage(event));
    this.listen(window,'keydown',event=>this.onEscape(event),{capture:true});
    this.listen(this.root.querySelector('#expand-view'),'click',()=>{
      if(this.mode==='inline'&&this.experience)this.send('expand',this.experience.selection);
    });
    this.listen(window,'pagehide',event=>{
      if(event.persisted)this.experience?.setSuspended(true);
      else this.destroy();
    });
    this.listen(window,'pageshow',event=>{
      if(event.persisted&&!this.destroyed) {
        this.experience?.setSuspended(this.suspended);this.measureSoon();
      }
    });
    this.listen(this.root,'vesa:destroy',()=>this.destroy());
    this.observeHeight();
    try {
      const source=new URL('catalogue.json?v=20261127-1',location.href);
      this.fetchTimer=window.setTimeout(()=>this.fetchController.abort(),15000);
      const response=await fetch(source.href,{credentials:'same-origin',signal:this.fetchController.signal});
      if(!response.ok)throw new Error('Catalogue request failed');
      const records=await response.json();
      this.validateAssets(records);
      if(this.destroyed)return;
      this.records=records;
      const initial=this.routeSelection(records);
      this.experience=new MotionExperience(this.root,records,{
        ...initial,playing:this.mode!=='modal',
        onSelection:selection=>this.onSelection(selection),
        onSettled:(ready,selection)=>this.onSettled(ready,selection)
      });
      this.experience.setSuspended(this.suspended);
      await this.experience.start();
    } catch(error) {
      if(this.destroyed)return;
      this.root.setAttribute('aria-busy','false');this.root.dataset.loadState='error';
      this.status.hidden=false;
      this.status.textContent='Products could not be loaded. Please refresh this view.';
      for(const button of this.root.querySelectorAll('button'))button.disabled=true;
      this.measureSoon();
    } finally {
      clearTimeout(this.fetchTimer);this.fetchTimer=0;
    }
  }
  /**
   * Guard the network boundary. Names are rendered as text by the controller;
   * model URLs must be exactly the feature's own reviewed ID-derived WebP paths.
   * GarmentCatalogue separately verifies the complete 91-item/group coverage.
   */
  validateAssets(records) {
    if(!Array.isArray(records)||records.length!==91)throw new Error('Invalid catalogue');
    const groups=new Set(['men','ladies','boys','girls','baby']);
    for(const item of records) {
      if(!item||typeof item.id!=='string'||!(/^[MLK]\d{2}$/).test(item.id)||
        typeof item.name!=='string'||item.name.length>180||!groups.has(item.group)||
        item.image!=='/product-showcase/assets/'+item.id+'.webp') {
        throw new Error('Invalid product asset');
      }
    }
  }
  /**
   * Resolve only known query values. A group-only URL starts within that group;
   * a mismatched item cannot escape its requested group. A bare page starts M16.
   * Kids is a friendly entry alias for the first boys collection, with girls/baby
   * still reachable through the permanent collection controls.
   */
  routeSelection(records) {
    const params=new URLSearchParams(location.search);
    const allowed=new Set(['all','men','ladies','boys','girls','baby']);
    let group=params.get('group')||'all';
    if(group==='kids')group='boys';
    if(!allowed.has(group))group='all';
    const requested=params.get('item');
    const item=records.find(record=>record.id===requested&&(group==='all'||record.group===group));
    if(item)return {group,item:item.id};
    return {group,item:group==='all'?'M16':records.find(record=>record.group===group).id};
  }
  /**
   * Reflect selection in the standalone URL without adding history entries. Embed
   * modes report the same bounded snapshot to their host. URL failures (for example
   * a restrictive embedding policy) do not break product navigation.
   */
  onSelection(selection) {
    if(this.destroyed)return;
    if(this.mode==='page') {
      const url=new URL(location.href);
      url.searchParams.delete('mode');
      if(selection.group==='all')url.searchParams.delete('group');
      else url.searchParams.set('group',selection.group);
      url.searchParams.set('item',selection.item);
      try {history.replaceState(history.state,'',url.href)} catch(error) { /* Viewer remains usable without URL synchronization. */ }
    }
    this.send('selection',selection);this.measureSoon();
  }
  /**
   * Announce readiness after the first current image settles, including recovery
   * from a failed first image or selection changed during startup. Stale decodes
   * never call this boundary, and subsequent navigation never repeats host ready.
   */
  onSettled(ready,selection) {
    if(this.destroyed)return;
    this.root.setAttribute('aria-busy','false');
    this.root.dataset.loadState=ready?'ready':'image-error';this.status.hidden=ready;
    if(!ready)this.status.textContent='Image unavailable. Choose another product.';
    if(ready&&!this.readySent) {this.readySent=true;this.send('ready',selection)}
    this.measureSoon();
  }
  /** Send only to this frame's same-origin parent; a standalone page sends nothing. */
  send(type,fields={}) {
    if(window.parent===window||this.destroyed)return;
    window.parent.postMessage({channel:this.channel,version:this.protocol,type,...fields},location.origin);
  }
  /**
   * Accept only the exact parent window, origin and protocol. Values are validated
   * again by MotionExperience; messages never become markup or navigation URLs.
   * Suspension may arrive during catalogue loading and is applied after startup.
   */
  onMessage(event) {
    if(window.parent===window||event.source!==window.parent||event.origin!==location.origin)return;
    const data=event.data;
    if(!data||typeof data!=='object'||data.channel!==this.channel||data.version!==this.protocol)return;
    if(data.type==='suspend'&&typeof data.value==='boolean') {
      this.suspended=data.value;this.experience?.setSuspended(data.value);
    } else if(data.type==='select'&&this.experience&&typeof data.group==='string'&&
      (data.item==null||typeof data.item==='string')) {
      this.experience.select(data.group,data.item||null);
    } else if(data.type==='restore-focus'&&this.mode==='inline') {
      this.root.querySelector('#expand-view').focus({preventScroll:true});
    }
  }
  /**
   * Escape first closes the local product index through its native dialog behavior.
   * Only an Escape that began outside that index requests the parent modal close,
   * preventing one keypress from dismissing both nested browsing contexts.
   */
  onEscape(event) {
    if(event.key!=='Escape'||event.defaultPrevented||this.mode!=='modal'||window.parent===window)return;
    if(this.root.querySelector('#index-dialog').open)return;
    event.preventDefault();event.stopPropagation();this.send('close');
  }
  /** Observe only intrinsic root size; iframe viewport height is never used as content height. */
  observeHeight() {
    if(this.mode!=='inline')return;
    if(typeof ResizeObserver==='function') {
      this.heightObserver=new ResizeObserver(()=>this.measureSoon());
      this.heightObserver.observe(this.root);
    }
    this.listen(window,'resize',()=>this.measureSoon(),{passive:true});
    this.measureSoon();
  }
  /** Coalesce layout notifications into one measurement rather than a recurring frame loop. */
  measureSoon() {
    if(this.mode!=='inline'||this.destroyed||this.frame)return;
    this.frame=requestAnimationFrame(()=>{
      this.frame=0;
      if(this.destroyed)return;
      const height=Math.ceil(this.root.getBoundingClientRect().height)+2;
      if(!Number.isFinite(height)||height<240||height>1800||height===this.lastHeight)return;
      this.lastHeight=height;this.send('height',{height});
    });
  }
  /** Cancel owned work once; stale fetch/image completions cannot revive this viewer. */
  destroy() {
    if(this.destroyed)return;
    this.destroyed=true;this.events.abort();this.fetchController.abort();
    clearTimeout(this.fetchTimer);
    if(this.frame)cancelAnimationFrame(this.frame);
    this.frame=0;this.heightObserver?.disconnect();this.experience?.destroy();
  }
}
// Defer-script entry: a single local owner, with no application object exposed on window.
(()=>{
  const root=document.querySelector('#experience');
  if(root)new ShowcaseBootstrap(root).start();
})();
