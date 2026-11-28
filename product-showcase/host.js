/**
 * Public homepage bridge for the isolated product viewer. ShowcaseHost owns only
 * its two frames, the parent dialog, launch links and transient scroll/focus holds.
 * Catalogue/rendering stay inside product-showcase/. No auth, storage, site theme
 * or intro state is modified. Every frame message checks both origin and source.
 */
class ShowcaseHost {
  /** Bind the dedicated insertion/dialog. start() installs listeners; destroy()
   * releases them. Dependencies are native DOM, URL and same-origin postMessage. */
  constructor(section, dialog) {
    this.section=section; this.dialog=dialog;
    this.inline=section.querySelector('#vesa-showcase-inline');
    this.modal=dialog.querySelector('#vesa-showcase-modal-frame');
    this.closeButton=dialog.querySelector('#vesa-showcase-close');
    this.pageLink=dialog.querySelector('#vesa-showcase-full-page');
    this.loading=section.querySelector('#vesa-showcase-loading');
    this.fallback=section.querySelector('#vesa-showcase-fallback');
    this.events=new AbortController(); this.observer=null; this.started=false;
    this.loaded=false; this.visible=false; this.invoker=null; this.scroll=null;
    this.previousOverflow=''; this.loadTimer=0; this.inlineSelection={group:'all',item:'M16'};
  }
  /** Add a lifecycle-owned listener without changing any existing homepage listener. */
  listen(target,type,handler,options={}) {
    target.addEventListener(type,handler,{...options,signal:this.events.signal});
  }
  /** Validate an entry request. The child independently checks catalogue membership.
   * Unknown groups/IDs cannot become executable URLs, selectors or HTML. */
  selection(input={}) {
    const groups=new Set(['all','men','ladies','boys','girls','baby']);
    const group=groups.has(input.group)?input.group:'all';
    const raw=String(input.item||'');
    const limits={M:34,L:29,K:58};
    const valid=/^[MLK]\d{2}$/.test(raw)&&Number(raw.slice(1))>=1&&Number(raw.slice(1))<=limits[raw[0]];
    return {group,item:valid?raw:''};
  }
  /** Build a same-origin route from validated selection; never forward arbitrary URLs. */
  url(input,mode='page') {
    const state=this.selection(input),url=new URL('/product-showcase/',location.origin);
    if(mode!=='page')url.searchParams.set('mode',mode);
    if(state.group!=='all')url.searchParams.set('group',state.group);
    if(state.item)url.searchParams.set('item',state.item);
    return url;
  }
  /** Mount once. Native anchors retain full-page and modifier-click behavior even
   * if this enhancement or a frame fails. Loading begins near the insertion only. */
  start() {
    if(this.started)return; this.started=true;
    this.listen(document,'click',event=>{
      const link=event.target.closest?.('a[data-vesa-product]');
      if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
      const url=new URL(link.href,location.href);
      if(url.origin!==location.origin||url.pathname!=='/product-showcase/'||typeof this.dialog.showModal!=='function')return;
      event.preventDefault();
      this.open({group:url.searchParams.get('group'),item:url.searchParams.get('item')},link);
    });
    this.listen(window,'message',event=>this.onMessage(event));
    this.listen(this.closeButton,'click',()=>this.dialog.close());
    this.listen(this.dialog,'close',()=>this.restore());
    this.listen(this.dialog,'click',event=>{
      if(event.target!==this.dialog)return;
      const r=this.dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.dialog.close();
    });
    this.listen(this.inline,'pointerenter',()=>document.body.classList.add('vesa-showcase-pointer'));
    this.listen(this.inline,'pointerleave',()=>document.body.classList.remove('vesa-showcase-pointer'));
    this.listen(document,'visibilitychange',()=>this.suspendInline());
    if(typeof IntersectionObserver==='function') {
      this.observer=new IntersectionObserver(entries=>{
        const entry=entries.find(item=>item.target===this.section);if(!entry)return;
        this.visible=entry.isIntersecting;
        if(this.visible)this.load();
        this.suspendInline();
      },{rootMargin:'360px 0px',threshold:0});
      this.observer.observe(this.section);
    } else {this.visible=true;this.load()}
    this.listen(window,'pagehide',event=>{
      // Back/forward cache retains the document and its listeners for a later return.
      if(event.persisted){
        if(this.loaded)this.send(this.inline,'suspend',{value:true});
        if(this.dialog.open)this.send(this.modal,'suspend',{value:true});
      } else this.destroy();
    });
    this.listen(window,'pageshow',event=>{
      if(!event.persisted)return;
      this.suspendInline();
      if(this.dialog.open)this.send(this.modal,'suspend',{value:document.hidden});
    });
  }
  /** Start only the inline viewer, not the entire image collection. A failed initialization
   * exposes a genuine standalone link; a late successful ready message clears it. */
  load() {
    if(this.loaded)return;this.loaded=true;
    this.inline.src=this.url(this.inlineSelection,'inline').href;
    this.loadTimer=window.setTimeout(()=>{
      this.loading.hidden=true;this.fallback.hidden=false;
    },20000);
  }
  /** Send a bounded message to an owned frame's exact origin. No wildcard targets. */
  send(frame,type,fields={}) {
    frame.contentWindow?.postMessage({channel:'vesa-product-showcase',version:1,type,...fields},location.origin);
  }
  /** Keep the background viewer still while a modal/hidden page owns attention. */
  suspendInline() {
    if(this.loaded)this.send(this.inline,'suspend',{value:this.dialog.open||!this.visible||document.hidden});
  }
  /** Dispatch messages only from the currently owned windows. Height is bounded
   * and accepted only from the inline frame; popup selection updates its fallback link. */
  onMessage(event) {
    if(event.origin!==location.origin)return;
    const data=event.data;
    if(!data||data.channel!=='vesa-product-showcase'||data.version!==1)return;
    const inline=event.source===this.inline.contentWindow;
    const modal=event.source===this.modal.contentWindow&&this.dialog.open;
    if(!inline&&!modal)return;
    if(data.type==='height'&&inline&&Number.isFinite(data.height)) {
      const height=Math.ceil(Math.min(1800,Math.max(360,data.height)));
      this.inline.style.height=height+'px';return;
    }
    if(data.type==='ready') {
      if(inline){clearTimeout(this.loadTimer);this.loading.hidden=true;this.fallback.hidden=true;this.suspendInline()}
      else this.send(this.modal,'suspend',{value:false});
    }
    if(data.type==='selection'||data.type==='ready') {
      const selected=this.selection(data);
      if(inline)this.inlineSelection=selected;
      if(modal)this.pageLink.href=this.url(selected).href;
    }
    if(data.type==='close'&&modal)this.dialog.close();
  }
  /** Open a user-requested product in a parent-owned modal. Focus and scroll are
   * saved before native showModal(); the original intro's inert state is respected. */
  open(input,invoker) {
    if(this.dialog.open||this.section.closest('[inert]'))return;
    const selected=this.selection(input);
    if(typeof this.dialog.showModal!=='function'){location.assign(this.url(selected).href);return}
    this.invoker=invoker;this.scroll={x:window.scrollX,y:window.scrollY};
    this.previousOverflow=document.body.style.overflow;
    this.pageLink.href=this.url(selected).href;
    this.closeButton.setAttribute('aria-label','Close product showcase');
    this.modal.src=this.url(selected,'modal').href;
    this.dialog.showModal();
    document.body.style.overflow='hidden';
    document.body.classList.add('vesa-showcase-modal-open');
    this.closeButton.focus({preventScroll:true});this.suspendInline();
  }
  /** Restore the exact caller/scroll and release the popup document. Parent and
   * iframe do not retain competing animations or change the homepage URL/history. */
  restore() {
    document.body.style.overflow=this.previousOverflow;
    document.body.classList.remove('vesa-showcase-modal-open','vesa-showcase-pointer');
    this.modal.removeAttribute('src');this.suspendInline();
    if(this.invoker?.isConnected)this.invoker.focus({preventScroll:true});
    if(this.scroll)window.scrollTo({left:this.scroll.x,top:this.scroll.y,behavior:'instant'});
    // A launcher inside the inline document must recover its own keyboard focus.
    if(this.invoker===this.inline)this.send(this.inline,'restore-focus');
    this.invoker=null;this.scroll=null;
  }
  /** Release listeners, observer and pending fallback timer when leaving the page. */
  destroy() {
    this.events.abort();this.observer?.disconnect();clearTimeout(this.loadTimer);
    if(this.dialog.open){this.dialog.close();this.restore()}
  }
}
// This entry point intentionally exposes no instance or mutable state on window.
(()=>{
  const section=document.querySelector('#product-showcase'),dialog=document.querySelector('#vesa-showcase-dialog');
  if(section&&dialog)new ShowcaseHost(section,dialog).start();
})();
