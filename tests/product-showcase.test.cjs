/**
 * Independent source-preservation and pure-state checks for the public showcase.
 * Owner: ShowcaseReleaseVerifier reads the repository and runs production owners
 * in bounded Node VM fixtures. It never starts a browser, server, or publication.
 * Access: node tests/product-showcase.test.cjs. The baseline is a real Git commit;
 * failures exit nonzero. This evidence does not certify rendered layout or touch.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { HomeIntroOnceVerifier } = require('./vesa-home-intro-once.cjs');

/** Minimal inert element for owner-method tests; it does not simulate rendering. */
class BoundedElement {
  /** Own attributes, listener records and direct descendants for a single fixture. */
  constructor() {
    this.nodes=new Map();this.listeners=new Map();this.attributes=new Map();
    this.style={};this.dataset={};this.hidden=false;this.open=false;this.isConnected=true;
    this.focuses=0;this.src='';this.href='';this.inert=false;
    const classes=new Set();
    this.classList={add:(...names)=>names.forEach(name=>classes.add(name)),remove:(...names)=>names.forEach(name=>classes.delete(name)),contains:name=>classes.has(name)};
  }
  /** Resolve only explicitly registered fixture descendants. */
  querySelector(selector) {return this.nodes.get(selector)||null}
  /** A bounded containment model for controller keyboard fixtures. */
  contains(node) {return node===this||[...this.nodes.values()].includes(node)}
  /** Record scoped listeners and honor their AbortSignal when dispatched. */
  addEventListener(type,handler,options={}) {
    const records=this.listeners.get(type)||[];records.push({handler,options});this.listeners.set(type,records);
  }
  /** Invoke a known synthetic event; browser propagation and default behavior are excluded. */
  emit(type,event={}) {for(const {handler,options}of this.listeners.get(type)||[])if(!options.signal?.aborted)handler(event)}
  /** Store/access native-like attribute state used by the feature owners. */
  setAttribute(name,value) {this.attributes.set(name,String(value))}
  getAttribute(name) {return this.attributes.get(name)??null}
  removeAttribute(name) {this.attributes.delete(name);if(name==='src')this.src=''}
  /** Track focus calls for restoration assertions without a browser focus model. */
  focus() {this.focuses++}
  /** Expose only the owner-specific ancestor requested by a test. */
  closest(selector) {return selector==='[inert]'&&this.inert?this:null}
  /** Keep a bounded rectangle for dialog-backdrop tests. */
  getBoundingClientRect() {return {left:10,right:610,top:10,bottom:510,width:600,height:500}}
  /** Model native dialog state and its close notification, not its visual top layer. */
  showModal() {this.open=true}
  close() {if(this.open){this.open=false;this.emit('close')}}
}

/** Own release evidence and immutable fixture inputs; no shared production state. */
class ShowcaseReleaseVerifier {
  static BASELINE = '0bcb37bf722eab4ce03d7560a7b693aa21468f74';

  /** Bind repository and manifest; all later writes are stdout evidence only. */
  constructor(root) {
    this.root = root;
    this.records = JSON.parse(this.read('product-showcase/catalogue.json'));
    this.report = {
      baseline: ShowcaseReleaseVerifier.BASELINE,
      scope: 'source parity, pure catalogue/navigation and bounded controller fixtures; browser proof is separate',
    };
  }

  /** Read one repository-owned source as UTF-8; a missing required file fails. */
  read(relative) { return fs.readFileSync(path.join(this.root, relative), 'utf8'); }

  /** Read immutable baseline bytes from Git, without checking out or changing refs. */
  baseline(relative) {
    return execFileSync('git', ['show', `${ShowcaseReleaseVerifier.BASELINE}:${relative}`], {
      cwd: this.root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024,
    });
  }

  /** Parse known HTML attribute syntax for source checks; this is not a DOM parser. */
  attributes(markup) {
    const result = {};
    for (const match of markup.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      result[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
    }
    return result;
  }

  /**
   * Preserve the last accepted live release as the exact new-feature patch scope.
   * The older immutable showcase baseline remains independently verified by
   * homepage(), cache(), catalogue() and first-visit intro proof below.
   */
  frozenFiles() {
    const scopeBaseline='dcef0cbb5764eaf221ccd3d5ba600d495435be5e';
    const oldFiles=new Set(execFileSync('git',['ls-tree','-r','--name-only',scopeBaseline],{cwd:this.root,encoding:'utf8',maxBuffer:4*1024*1024}).trim().split('\n'));
    const changed=execFileSync('git',['diff','--name-only',scopeBaseline,'--'],{cwd:this.root,encoding:'utf8',maxBuffer:4*1024*1024}).trim().split('\n').filter(Boolean);
    const allowed=new Set(['index.html','service-worker.js','product-showcase/index.html','product-showcase/styles.css','product-showcase/host.css','product-showcase/experience.js','product-showcase/bootstrap.js','product-showcase/host.js','tests/product-showcase.test.cjs']);
    for(const file of changed.filter(file=>oldFiles.has(file)))assert.ok(allowed.has(file),'Unexpected original-file change: '+file);
    const present=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:this.root,encoding:'utf8',maxBuffer:4*1024*1024}).trim().split('\n').filter(Boolean);
    const added=present.filter(file=>!oldFiles.has(file));
    const newFiles=new Set(['product-showcase/zoom.js','tests/product-showcase-zoom.browser.cjs','.github/workflows/vesa-showcase-zoom.yml']);
    for(const file of added)assert.ok(newFiles.has(file),'Unapproved added path: '+file);
    assert.equal(this.read('js/vesa-home-intro.js'),this.baseline('js/vesa-home-intro.js'),'First-visit controller is frozen');
    assert.equal(HomeIntroOnceVerifier.gate(this.read('index.html'))[1],HomeIntroOnceVerifier.gate(this.baseline('index.html'))[1],'First-visit gate is frozen');
    this.report.original_files={tracked_baseline:oldFiles.size,changed:changed.filter(file=>oldFiles.has(file)),all_other_original_paths_unchanged:true,original_intro_gate_and_controller_unchanged:true,added_paths_within_locked_scope:true};
  }

  /** Recreate the exact previous homepage from its two approved substitutions. */
  homepage() {
    const html=this.read('index.html');
    let restored=HomeIntroOnceVerifier.replaceOnce(html,'data-target="121"','data-target="91"','Category example count');
    restored=HomeIntroOnceVerifier.replaceOnce(restored,'/product-showcase/host.css?v=20261128-zoom1','/product-showcase/host.css?v=20261127-2','Zoom host stylesheet version');
    restored=HomeIntroOnceVerifier.replaceOnce(restored,'/product-showcase/host.js?v=20261128-zoom1','/product-showcase/host.js?v=20261127-1','Showcase host cache version');
    assert.equal(restored,this.baseline('index.html'),'Homepage changed beyond the count and host version');
    const portfolio=html.indexOf('id="portfolio"'),section=html.indexOf('id="product-showcase"'),matrix=html.indexOf('id="capability-matrix"');
    assert.ok(portfolio>=0&&section>portfolio&&matrix>section,'Original insertion position is preserved');
    for(const [,markup]of html.matchAll(/<a\b([^>]*\bdata-vesa-product\b[^>]*)>/g)) {
      const attrs=this.attributes(markup),url=new URL(attrs.href.replaceAll('&amp;','&'),'https://vesaent.com/');
      const item=this.records.find(record=>record.id===url.searchParams.get('item'));
      assert.ok(item&&item.group===url.searchParams.get('group'),'Original product deep link remains valid');
    }
    this.report.homepage={previous_source_exactly_recreated:true,only_category_count_and_host_version_changed:true,insertion_position_preserved:true};
  }

  /** Only advance the existing cache identity; media, precache and routing stay frozen. */
  cache() {
    const after=this.read('service-worker.js');
    const restored=HomeIntroOnceVerifier.replaceOnce(after,"const CACHE='vesa-v128-showcase-hidden-zoom';","const CACHE='vesa-v123-home-intro-once';",'Showcase cache identity');
    assert.equal(restored,this.baseline('service-worker.js'),'Service-worker policy changed');
    this.report.cache={before:'vesa-v123-home-intro-once',after:'vesa-v128-showcase-hidden-zoom',all_other_bytes_unchanged:true};
  }

  /** Compile actual modules without running entry points; checks current bytes only. */
  syntax() {
    const files = ['catalogue.js', 'category-navigation.js', 'director.js', 'garment-details.js', 'zoom.js', 'experience.js', 'bootstrap.js', 'host.js'];
    for (const file of files) new vm.Script(this.read('product-showcase/' + file), {filename: file});
    this.report.syntax_modules = files;
  }

  /** Preserve the reviewed annotation owner and its stable element-ID contract. */
  viewerContract() {
    const hash=createHash('sha256').update(this.read('product-showcase/garment-details.js')).digest('hex');
    const map=/this\.looks=Object.freeze\(\{[\s\S]*?\n    \}\);/;
    assert.equal(this.read('product-showcase/garment-details.js').match(map)?.[0],this.baseline('product-showcase/garment-details.js').match(map)?.[0],'Original91 garment annotations changed');
    const html=this.read('product-showcase/index.html');
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,'Viewer IDs are unique');
    const required=['experience','open-index','copy','chapter','headline','style-name','style-id','garment-switch','detail-hint','detail-summary','detail-kind','detail-role','detail-name','scene','actor-stage','garment-callout','callout-kind','callout-role','callout-name','garment-pin','garment-line','callout-path','chapters','count','total','progress','previous','play','play-icon','next','announcement','detail-announcement','index-dialog','index-title','index-note','close-index','search','index-grid','empty'];
    for(const id of required)assert.ok(ids.includes(id),'Retained viewer ID: '+id);
    assert.ok(!/\.gif\b|<video\b/i.test(html),'Presentation uses individual static assets');
    this.report.viewer={annotation_owner_sha256:hash,reviewed_control_ids_retained:required.length,unique_ids:true};
  }

  /** Exercise complete traversal, collection boundaries, search and invalid commands. */
  catalogue() {
    const context = vm.createContext({});
    vm.runInContext(this.read('product-showcase/catalogue.js') + '\nthis.api={GarmentCatalogue,CarouselState};', context);
    const {GarmentCatalogue, CarouselState} = context.api;
    const catalogue = new GarmentCatalogue(this.records);
    const groups = {all: 121, men: 34, ladies: 29, boys: 22, girls: 22, baby: 14};
    let visits = 0, selections = 0;
    for (const [group, count] of Object.entries(groups)) {
      const state = new CarouselState(catalogue);
      assert.equal(state.selectGroup(group), true);
      const ids = Array.from(catalogue.presentationItems(group), item => item.id);
      assert.equal(ids.length, count);
      state.selectId(ids[0]);
      for (const id of ids) {
        assert.equal(state.current.id, id);
        const neighbors = state.neighborhood();
        assert.equal(new Set(neighbors.map(entry => entry.item.id)).size, neighbors.length);
        for (const offset of [-1, 0, 1]) assert.ok(neighbors.some(entry => entry.pos === offset), 'Available primary neighbors');
        assert.ok(neighbors.every(entry => entry.item.group === group || group === 'all'));
        state.step(1); visits++;
      }
      assert.equal(state.current.id, ids[0]);
      state.step(-1); assert.equal(state.current.id, ids.at(-1));
      state.step(count * 3 + 1); assert.equal(state.current.id, ids[0]);
      const old = {group: state.group, index: state.index};
      assert.equal(state.selectGroup('invalid'), false);
      assert.equal(state.selectId('M999'), false);
      assert.deepEqual({group: state.group, index: state.index}, old);
      for (const record of this.records) {
        const selected = new CarouselState(catalogue);
        selected.selectGroup(group);
        assert.equal(selected.selectId(record.id), true);
        assert.equal(selected.current.id, record.id);
        assert.equal(selected.group, group === 'all' || group === record.group ? group : 'all');
        selected.selectGroup(record.group);
        assert.equal(selected.current.id, record.id);
        selections++;
      }
    }
    for (const record of this.records) {
      assert.deepEqual(Array.from(catalogue.search(' ' + record.id.toLowerCase() + ' '), row => row.id), [record.id]);
      assert.ok(catalogue.search(record.name).some(row => row.id === record.id));
    }
    assert.equal(catalogue.search('no-such-product-93815').length, 0);
    assert.equal(catalogue.search('').length, 121);
    assert.ok(Object.isFrozen(catalogue.records) && catalogue.records.every(Object.isFrozen));
    assert.throws(() => new GarmentCatalogue(this.records.slice(1)), /Incomplete/);
    this.report.catalogue = {groups, slide_visits: visits, collection_selections: selections, id_and_name_search_cases: 242, wrap_invalid_selection_and_immutability: true};
  }

  /** Test host trust boundaries and reversible modal state with inert owned frames. */
  host() {
    const document=new BoundedElement();document.body=new BoundedElement();document.hidden=false;
    document.body.style.overflow='clip';
    const window=new BoundedElement();window.scrollX=7;window.scrollY=1380;
    const timers=new Map(),scrolls=[],sent=[];let nextTimer=1;
    window.setTimeout=callback=>{const id=nextTimer++;timers.set(id,callback);return id};
    window.scrollTo=options=>scrolls.push(options);
    const location={origin:'https://vesaent.com',href:'https://vesaent.com/',assign:href=>{location.assigned=href}};
    const observers=[];
    class Observer {
      constructor(callback) {this.callback=callback;this.disconnected=false;observers.push(this)}
      observe(target) {this.target=target}
      disconnect() {this.disconnected=true}
    }
    const context=vm.createContext({URL,URLSearchParams,AbortController,document,window,location,IntersectionObserver:Observer,clearTimeout:id=>timers.delete(id)});
    vm.runInContext(this.read('product-showcase/host.js')+'\nthis.Owner=ShowcaseHost;',context);
    const section=new BoundedElement(),dialog=new BoundedElement();
    for(const id of ['vesa-showcase-inline','vesa-showcase-loading','vesa-showcase-fallback'])section.nodes.set('#'+id,new BoundedElement());
    for(const id of ['vesa-showcase-modal-frame','vesa-showcase-close','vesa-showcase-full-page'])dialog.nodes.set('#'+id,new BoundedElement());
    const host=new context.Owner(section,dialog);
    for(const frame of [host.inline,host.modal])frame.contentWindow={postMessage:(data,origin)=>sent.push({frame,data,origin})};
    const envelope=(type,fields={})=>({channel:'vesa-product-showcase',version:1,type,...fields});
    const deliver=(frame,type,fields={})=>host.onMessage({origin:location.origin,source:frame.contentWindow,data:envelope(type,fields)});
    for(const record of this.records) {
      const url=host.url({group:record.group,item:record.id},'modal');
      assert.equal(url.origin,location.origin);assert.equal(url.pathname,'/product-showcase/');
      assert.equal(url.searchParams.get('item'),record.id);assert.equal(url.searchParams.get('group'),record.group);
    }
    for(const item of ['M00','M35','L30','K59','m01','M1','../../M01','javascript:alert(1)','<img src=x>']) {
      const url=host.url({group:'https://evil.invalid',item});
      assert.equal(url.href,'https://vesaent.com/product-showcase/');
    }
    host.start();host.start();assert.equal(observers.length,1,'Host starts once');
    assert.equal(host.loaded,false,'Inline frame remains unloaded before proximity');
    observers[0].callback([{target:section,isIntersecting:true}]);
    assert.equal(host.loaded,true);assert.equal(new URL(host.inline.src).searchParams.get('mode'),'inline');
    const prior=host.inline.style.height;
    for(const override of [
      {origin:'https://evil.invalid'}, {source:{}},
      {data:{channel:'other',version:1,type:'height',height:900}},
      {data:envelope('height',{height:900,version:2})}, {data:null},
    ]) host.onMessage({origin:location.origin,source:host.inline.contentWindow,data:envelope('height',{height:900}),...override});
    assert.equal(host.inline.style.height,prior,'Untrusted messages have no effect');
    deliver(host.inline,'height',{height:12});assert.equal(host.inline.style.height,'360px');
    deliver(host.inline,'height',{height:9000});assert.equal(host.inline.style.height,'1800px');
    deliver(host.inline,'height',{height:Infinity});assert.equal(host.inline.style.height,'1800px');
    deliver(host.inline,'ready',{group:'men',item:'M16'});
    assert.equal(host.loading.hidden,true);assert.equal(host.fallback.hidden,true);assert.equal(timers.size,0);
    const invoker=new BoundedElement();section.inert=true;
    host.open({group:'men',item:'M06'},invoker);assert.equal(dialog.open,false,'Intro inert state respected');section.inert=false;
    host.open({group:'men',item:'M06'},invoker);
    assert.equal(dialog.open,true);assert.equal(document.body.style.overflow,'hidden');
    assert.equal(new URL(host.modal.src).searchParams.get('item'),'M06');
    assert.equal(sent.at(-1).data.type,'suspend');assert.equal(sent.at(-1).data.value,true);
    deliver(host.modal,'height',{height:777});assert.equal(host.inline.style.height,'1800px');
    deliver(host.modal,'selection',{group:'ladies',item:'L29'});
    assert.equal(new URL(host.pageLink.href).searchParams.get('item'),'L29');
    deliver(host.modal,'close');
    assert.equal(dialog.open,false);assert.equal(host.modal.src,'');
    assert.equal(document.body.style.overflow,'clip');assert.equal(invoker.focuses,1);
    assert.deepEqual({...scrolls.at(-1)},{left:7,top:1380,behavior:'instant'});
    const closedLink=host.pageLink.href;deliver(host.modal,'selection',{group:'men',item:'M01'});
    assert.equal(host.pageLink.href,closedLink,'Closed modal cannot mutate host');
    deliver(host.inline,'expand',{group:'girls',item:'K20'});assert.equal(dialog.open,true);
    dialog.close();assert.equal(sent.at(-1).data.type,'restore-focus');
    const link=new BoundedElement();link.href='https://vesaent.com/product-showcase/?group=men&item=M06';
    link.closest=selector=>selector==='a[data-vesa-product]'?link:null;
    const event=extra=>({target:link,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true},...extra});
    for(const extra of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]) {
      const e=event(extra);document.emit('click',e);assert.equal(e.defaultPrevented,false);assert.equal(dialog.open,false);
    }
    for(const href of ['https://evil.invalid/product-showcase/','https://vesaent.com/apps/aql/']) {
      link.href=href;const e=event();document.emit('click',e);assert.equal(e.defaultPrevented,false);
    }
    link.href='https://vesaent.com/product-showcase/?group=boys&item=K01';
    const accepted=event();document.emit('click',accepted);assert.equal(accepted.defaultPrevented,true);assert.equal(dialog.open,true);dialog.close();
    assert.ok(sent.every(message=>message.origin===location.origin),'All postMessage targets exact origin');
    window.emit('pagehide',{persisted:true});
    assert.equal(host.events.signal.aborted,false,'BFCache pagehide retains host listeners');
    window.emit('pageshow',{persisted:true});
    const resumed=event();document.emit('click',resumed);
    assert.equal(resumed.defaultPrevented,true);assert.equal(dialog.open,true,'Category popup works after BFCache return');dialog.close();
    host.destroy();assert.equal(host.events.signal.aborted,true);assert.equal(observers[0].disconnected,true);
    this.report.host={route_records:121,invalid_item_cases:9,trusted_frames_only:true,height_bounds:true,lazy_load:true,intro_inert_preserved:true,modal_focus_scroll_overflow_restored:true,native_modifier_and_external_links_preserved:true,bfcache_host_survives:true};
  }

  /** Verify the child route/asset/message boundary without network or browser APIs. */
  bootstrap() {
    const document=new BoundedElement(),window=new BoundedElement(),parent={messages:[],postMessage(data,origin){this.messages.push({data,origin})}};
    window.parent=parent;
    const location={origin:'https://vesaent.com',href:'https://vesaent.com/product-showcase/',search:''};
    const context=vm.createContext({URL,URLSearchParams,AbortController,document,window,location});
    vm.runInContext(this.read('product-showcase/bootstrap.js')+'\nthis.Owner=ShowcaseBootstrap;',context);
    const root=new BoundedElement();
    for(const id of ['load-status','expand-view','index-dialog','scene'])root.nodes.set('#'+id,new BoundedElement());
    const owner=new context.Owner(root),route=query=>{location.search=query;return {...owner.routeSelection(this.records)}};
    assert.deepEqual(route(''),{group:'all',item:'M16'});
    let routes=1;
    for(const record of this.records) {
      assert.deepEqual(route('?group='+record.group+'&item='+record.id),{group:record.group,item:record.id});
      assert.deepEqual(route('?item='+record.id),{group:'all',item:record.id});routes+=2;
    }
    for(const group of ['men','ladies','boys','girls','baby']) {
      assert.deepEqual(route('?group='+group),{group,item:this.records.find(row=>row.group===group).id});routes++;
    }
    assert.deepEqual(route('?group=men&item=L29'),{group:'men',item:'M01'});
    assert.deepEqual(route('?group=unknown&item=missing'),{group:'all',item:'M16'});
    assert.deepEqual(route('?group=kids'),{group:'boys',item:'K01'});
    owner.validateAssets(this.records);
    for(const image of ['https://evil.invalid/M01.webp','javascript:alert(1)','data:image/png;base64,x','/product-showcase/assets/../M01.webp','/apps/aql/data.json']) {
      const altered=this.records.map((record,index)=>index?record:{...record,image});
      assert.throws(()=>owner.validateAssets(altered),/Invalid product asset/);
    }
    const suspensions=[];owner.experience={setSuspended:value=>suspensions.push(value)};
    const message={channel:'vesa-product-showcase',version:1,type:'suspend',value:true};
    for(const override of [{origin:'https://evil.invalid'},{source:{}},{data:{...message,version:2}},{data:{...message,value:'true'}},{data:null}]) {
      owner.onMessage({origin:location.origin,source:parent,data:message,...override});
    }
    assert.equal(suspensions.length,0);
    owner.onMessage({origin:location.origin,source:parent,data:message});assert.deepEqual(suspensions,[true]);
    owner.mode='inline';owner.onMessage({origin:location.origin,source:parent,data:{...message,type:'restore-focus'}});
    assert.equal(root.querySelector('#scene').focuses,1);
    owner.mode='modal';const index=root.querySelector('#index-dialog');
    const escape=()=>({key:'Escape',defaultPrevented:false,preventDefault(){this.defaultPrevented=true},stopPropagation(){this.stopped=true}});
    index.open=true;const first=escape();owner.onEscape(first);assert.equal(first.defaultPrevented,false);assert.equal(parent.messages.length,0);
    index.open=false;const second=escape();owner.onEscape(second);assert.equal(second.defaultPrevented,true);assert.equal(parent.messages.at(-1).data.type,'close');
    assert.ok(parent.messages.every(message=>message.origin===location.origin));
    parent.messages.length=0;
    owner.onSettled(false,{group:'men',item:'M01'});assert.equal(root.dataset.loadState,'image-error');assert.equal(parent.messages.length,0);
    owner.onSettled(true,{group:'men',item:'M02'});assert.equal(root.dataset.loadState,'ready');assert.equal(owner.status.hidden,true);
    owner.onSettled(true,{group:'men',item:'M03'});assert.equal(parent.messages.length,1);assert.equal(parent.messages[0].data.type,'ready');assert.equal(parent.messages[0].data.item,'M02');
    this.report.bootstrap={known_route_cases:routes+3,invalid_asset_urls_rejected:5,parent_origin_source_version_and_value_guards:true,nested_index_escape_preserved:true,failed_image_recovers_and_ready_sent_once:true};
  }

  /** Exercise actual playback eligibility, selection atomicity and keyboard methods. */
  experience() {
    const document={hidden:false,activeElement:null},root=new BoundedElement();
    for(const id of ['scene','index-dialog','search','index-grid','progress','play','play-icon','chapters'])root.nodes.set('#'+id,new BoundedElement());
    const frames=new Map();let nextFrame=1;
    class Director {
      constructor(){this.ready=true;this.settles=0}
      settle(){this.settles++}
      setAmbientPaused(value){this.paused=value}
    }
    class Details {constructor(){this.inspecting=false}clear(){this.inspecting=false}}
    const context=vm.createContext({document,AbortController,SceneDirector:Director,GarmentDetails:Details,matchMedia:()=>({matches:false}),requestAnimationFrame:callback=>{const id=nextFrame++;frames.set(id,callback);return id},cancelAnimationFrame:id=>frames.delete(id)});
    vm.runInContext(this.read('product-showcase/catalogue.js')+'\n'+this.read('product-showcase/experience.js')+'\nthis.Owner=MotionExperience;',context);
    const owner=new context.Owner(root,this.records,{group:'men',item:'M06'});
    assert.deepEqual({...owner.selection},{group:'men',item:'M06'});
    assert.equal(owner.select('men','L29'),false);assert.equal(owner.select('unknown','M06'),false);
    assert.deepEqual({...owner.selection},{group:'men',item:'M06'},'Invalid selection is atomic');
    owner.started=true;owner.reconcileMotion();assert.equal(owner.canRun,true);assert.equal(frames.size,1);
    owner.setSuspended(true);assert.equal(owner.canRun,false);assert.equal(owner.playing,true);assert.equal(frames.size,0);
    owner.setSuspended('false');assert.equal(owner.externalSuspended,true);
    owner.setSuspended(false);assert.equal(owner.canRun,true);assert.equal(frames.size,1);
    owner.togglePlay();assert.equal(owner.playing,false);owner.setSuspended(true);owner.setSuspended(false);assert.equal(owner.playing,false);assert.equal(frames.size,0);
    owner.togglePlay();assert.equal(owner.canRun,true);
    for(const hold of [()=>{document.hidden=true},()=>{owner.visible=false},()=>{owner.windowActive=false},()=>{owner.dialog.open=true},()=>{owner.details.inspecting=true},()=>{owner.hovered=true}]) {
      hold();owner.reconcileMotion();assert.equal(owner.canRun,false);assert.equal(frames.size,0);
      document.hidden=false;owner.visible=true;owner.windowActive=true;owner.dialog.open=false;owner.details.inspecting=false;owner.hovered=false;
      owner.reconcileMotion();assert.equal(owner.canRun,true);
    }
    const keys=[],scene=root.querySelector('#scene'),button=root.querySelector('#play');
    scene.closest=()=>null;button.closest=()=>button;owner.step=direction=>keys.push(direction);
    const key=(target,key,code=key)=>({target,key,code,defaultPrevented:false,preventDefault(){this.defaultPrevented=true}});
    const arrow=key(scene,'ArrowRight');owner.onKeyDown(arrow);
    assert.deepEqual(keys,[1]);assert.equal(arrow.defaultPrevented,true);assert.equal(owner.playing,false);assert.equal(owner.keyboardFocus,true);
    owner.onKeyDown(key(button,'ArrowLeft'));assert.deepEqual(keys,[1],'Buttons retain native arrow behavior');
    owner.keyboardFocus=false;owner.reconcileMotion();assert.equal(owner.playing,false,'Keyboard pause persists after focus leaves');
    const space=key(scene,' ','Space');owner.onKeyDown(space);assert.equal(space.defaultPrevented,true);assert.equal(owner.playing,true);assert.equal(owner.canRun,true);
    owner.setSuspended(true);assert.equal(owner.canRun,false);assert.equal(frames.size,0);
    this.report.experience={atomic_group_selection:true,external_suspension_preserves_play_preference:true,hidden_offscreen_blur_dialog_hover_inspection_holds:true,held_views_have_no_raf:true,keyboard_pause_durable:true,scene_arrows_and_space:true,button_native_keys_preserved:true};
  }

  /** Resolve image arrivals out of order and prove stale work cannot publish readiness. */
  async renderRaces() {
    const document={hidden:false,activeElement:null},root=new BoundedElement(),arrivals=[],settled=[];
    for(const id of ['scene','index-dialog','search','index-grid','progress','play','play-icon','garment-switch','count','total','announcement'])root.nodes.set('#'+id,new BoundedElement());
    root.querySelector('#garment-switch').contains=()=>false;
    class Director {
      constructor(){this.ready=false}
      show(record){return new Promise(resolve=>arrivals.push({id:record.id,resolve}))}
      settle(){}
      setAmbientPaused(){}
      destroy(){}
    }
    class Details {constructor(){this.inspecting=false}update(){}destroy(){}}
    const context=vm.createContext({document,AbortController,SceneDirector:Director,GarmentDetails:Details,matchMedia:()=>({matches:false}),requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}});
    vm.runInContext(this.read('product-showcase/catalogue.js')+'\n'+this.read('product-showcase/experience.js')+'\nthis.Owner=MotionExperience;',context);
    const owner=new context.Owner(root,this.records,{playing:false,onSettled:(ready,snapshot)=>settled.push({ready,...snapshot})});owner.started=true;
    const first=owner.render();owner.state.step(1);const second=owner.render();
    arrivals[0].resolve(true);assert.equal(await first,false);assert.equal(settled.length,0,'Superseded startup does not publish readiness');
    arrivals[1].resolve(true);assert.equal(await second,true);assert.deepEqual(settled,[{ready:true,group:'all',item:'L02'}]);
    owner.state.step(1);const failure=owner.render();arrivals[2].resolve(false);assert.equal(await failure,false);assert.equal(settled.at(-1).ready,false);
    owner.state.step(1);const recovery=owner.render();arrivals[3].resolve(true);assert.equal(await recovery,true);assert.equal(settled.at(-1).item,'K14');assert.equal(settled.at(-1).ready,true);
    owner.state.step(1);const late=owner.render();owner.destroy();arrivals[4].resolve(true);assert.equal(await late,false);assert.equal(settled.length,3,'Destroyed owner cannot publish a late arrival');
    this.report.render_races={stale_initial_arrival_ignored:true,current_failure_and_recovery_reported:true,destroyed_arrival_ignored:true};
  }

  /** Run all declared independent gates and return their evidence; no UI claims. */
  async run() {
    this.frozenFiles();
    this.homepage();
    this.cache();
    this.syntax();
    this.viewerContract();
    this.catalogue();
    this.host();
    this.bootstrap();
    this.experience();
    await this.renderRaces();
    const intro=new HomeIntroOnceVerifier(this.root);
    intro.gateScenarios();intro.repeatedVisits();
    await intro.lifecycleScenarios();await intro.mediaScenarios();
    this.report.intro_regression={gate_scenarios:intro.report.scenarios,unchanged_first_visit_behavior:true};
    this.report.verdict = 'accepted';
    return this.report;
  }
}

new ShowcaseReleaseVerifier(path.resolve(__dirname, '..')).run().then(report=>{
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}).catch(error=>{
  process.stderr.write(`SHOWCASE_VERIFICATION_FAILED: ${error.stack || error}\n`);
  process.exitCode = 1;
});
