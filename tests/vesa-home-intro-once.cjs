/**
 * Verify the bounded first-visit intro repair using actual inline/deferred sources.
 * HomeIntroOnceVerifier owns immutable Git baselines, source reconstruction and
 * scenario assertions. IntroFixture owns synthetic DOM/media/storage/timers only.
 * Run: node tests/vesa-home-intro-once.cjs. No browser, network, persistent browser
 * storage, repository writes or deployment runs here. A failure exits nonzero;
 * passing fixtures prove state/lifecycle contracts, not rendered browser layout.
 */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');

/** Inert element/event boundary. Every instance belongs to one isolated fixture. */
class IntroElement {
  /** Retain only the attributes/events the actual intro source consumes. */
  constructor(name,log) {
    this.name=name;this.log=log;this.dataset={};this.attributes=new Map();
    this.listeners=new Map();this.classes=new Set();this.isConnected=true;
    this.hidden=false;this.textContent='';this.style={};this._inert=false;
    this.classList={
      add:(...values)=>{for(const value of values){this.classes.add(value);this.log.push({type:'class-add',name:this.name,value})}},
      remove:(...values)=>{for(const value of values)this.classes.delete(value)},
      contains:value=>this.classes.has(value),
      toggle:(value,force)=>{const add=force===undefined?!this.classes.has(value):force;add?this.classes.add(value):this.classes.delete(value);return add}
    };
  }
  /** Record homepage locking so bypass tests can detect even temporary inert writes. */
  set inert(value){this._inert=value;this.log.push({type:'inert',name:this.name,value})}
  get inert(){return this._inert}
  /** Store accessible control state without simulating a layout engine. */
  setAttribute(name,value){this.attributes.set(name,String(value))}
  getAttribute(name){return this.attributes.get(name)??null}
  /** Retain/remove exact listener identity, including explicit lifecycle cleanup. */
  addEventListener(type,handler){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(handler)}
  removeEventListener(type,handler){this.listeners.get(type)?.delete(handler)}
  /** Dispatch one explicit fixture event; native browser defaults are outside this test. */
  emit(type,fields={}){for(const handler of [...(this.listeners.get(type)||[])])handler({type,target:this,...fields})}
  /** Model detachment, while keeping a test reference to inspect the released overlay. */
  remove(){this.isConnected=false;this.log.push({type:'remove',name:this.name})}
}

/** Synthetic origin storage; supports sharing values across fresh document fixtures. */
class IntroStorage {
  /** Own operation evidence and injected failures; never read the real browser profile. */
  constructor(values,log,options={}){this.values=values;this.log=log;this.options=options}
  /** Record reads and optionally reproduce SecurityError-like denied access. */
  getItem(key){this.log.push({type:'storage-get',key});if(this.options.readError)throw Error('Storage read blocked');return this.values.get(key)??null}
  /** Record writes before mutating; quota/read-only failures must prevent intro display. */
  setItem(key,value){this.log.push({type:'storage-set',key,value});if(this.options.writeError)throw Error('Storage write blocked');this.values.set(key,String(value))}
  /** Expose destructive operations solely so assertions catch accidental use. */
  removeItem(key){this.log.push({type:'storage-remove',key});this.values.delete(key)}
  clear(){this.log.push({type:'storage-clear'});this.values.clear()}
}

/** Synthetic document/media lifecycle. Timers and promises advance only when requested. */
class IntroFixture {
  /** Build one independent document from route, navigation, storage and media options. */
  constructor(options={}) {
    this.options=options;this.log=[];this.timers=new Map();this.nextTimer=1;this.mediaCalls=[];
    this.values=options.values||new Map([['vesa.auth.session','keep-session'],['vesa.saved.order','keep-order']]);
    this.originalValues=new Map(this.values);this.storage=new IntroStorage(this.values,this.log,options);
    this.root=new IntroElement('root',this.log);
    this.window=new IntroElement('window',this.log);this.document=new IntroElement('document',this.log);
    this.document.documentElement=this.root;this.document.referrer=options.referrer||'';this.document.hidden=false;
    this.location=new URL(options.href||'https://vesaent.com/');
    this.originalUrl=this.location.href;this.scroll={x:7,y:options.scrollY??1380};this.navigationCalls=[];
    this.background=['header.site-header','main','footer.site-footer'].map(name=>new IntroElement(name,this.log));
    this.nodes=new Map();
    for(const id of ['vesaHomeIntro','vesaIntroVideo','vesaIntroRecovery','vesaIntroAction','vesaIntroMessage','vesaIntroSound','vesaIntroSoundIcon','vesaIntroSoundLabel','vesaIntroSkip'])this.nodes.set(id,new IntroElement(id,this.log));
    this.video=this.nodes.get('vesaIntroVideo');this.overlay=this.nodes.get('vesaHomeIntro');
    this.video.paused=true;this.video.ended=false;this.video.readyState=4;this.video.muted=false;this.video.volume=1;
    this.video.pause=()=>{this.video.paused=true;this.log.push({type:'pause'})};
    this.video.play=()=>{
      const index=this.mediaCalls.length;
      this.mediaCalls.push({muted:this.video.muted,seen:this.values.get(HomeIntroOnceVerifier.KEY)});
      this.log.push({type:'play'});
      const outcome=options.playPlan?.[index]||'resolve';
      if(outcome==='reject')return Promise.reject(Error('Playback blocked'));
      if(outcome==='pending')return new Promise(resolve=>{this.resolvePlayback=resolve});
      this.video.paused=false;return Promise.resolve();
    };
    this.document.getElementById=id=>options.missing===id?null:this.nodes.get(id)||null;
    this.document.querySelector=selector=>this.background.find(node=>node.name===selector)||null;
    this.window.document=this.document;this.window.location=this.location;
    this.window.performance={getEntriesByType:()=>{if(options.navigationError)throw Error('Navigation timing blocked');return [{type:options.navigation||'navigate'}]}};
    Object.defineProperty(this.window,'localStorage',{get:()=>{if(options.accessError)throw Error('Storage unavailable');return options.missingStorage?undefined:this.storage}});
    this.history={pushState:(...args)=>this.navigationCalls.push(['pushState',...args]),replaceState:(...args)=>this.navigationCalls.push(['replaceState',...args])};
    this.window.history=this.history;
    this.window.scrollTo=(...args)=>this.navigationCalls.push(['scrollTo',...args]);
    this.window.scrollX=this.scroll.x;this.window.scrollY=this.scroll.y;
    this.context=vm.createContext({
      window:this.window,document:this.document,location:this.location,history:this.history,URL,
      matchMedia:()=>({matches:!!options.reduced}),
      setTimeout:(callback,delay)=>{const id=this.nextTimer++;this.timers.set(id,{callback,delay});return id},
      clearTimeout:id=>this.timers.delete(id)
    });
  }
  /** Execute the actual head script exactly once for this document. */
  gate(source){vm.runInContext(source,this.context,{filename:'index.html#vesa-home-intro-gate'})}
  /** Execute the actual deferred page entry without importing test replacements. */
  controller(source){vm.runInContext(source,this.context,{filename:'js/vesa-home-intro.js'})}
  /** Drain the finite native-promise fallback chain without sleeping or running timers. */
  async settlePromises(){for(let i=0;i<8;i++)await Promise.resolve()}
  /** Run only timers with the requested delay, retaining other pending lifecycle work. */
  runDelay(delay){for(const [id,timer]of [...this.timers])if(timer.delay===delay){this.timers.delete(id);timer.callback()}}
  /** Check browser records and navigation isolation after each meaningful scenario. */
  assertBoundaries(expectedUrl=this.originalUrl) {
    for(const [key,value]of this.originalValues)if(key!==HomeIntroOnceVerifier.KEY)assert.equal(this.values.get(key),value,'Unrelated saved value changed: '+key);
    assert.ok([...this.values.keys()].every(key=>this.originalValues.has(key)||key===HomeIntroOnceVerifier.KEY),'Only the intro preference may be added');
    const operations=this.log.filter(row=>row.type.startsWith('storage-'));
    assert.ok(operations.every(row=>['storage-get','storage-set'].includes(row.type)&&row.key===HomeIntroOnceVerifier.KEY),'No unrelated or destructive storage operations');
    assert.ok(operations.filter(row=>row.type==='storage-set').every(row=>row.value==='1'),'Persistent preference contains only the stable boolean marker');
    assert.deepEqual(this.navigationCalls,[],'No history or scripted scroll changes');
    assert.equal(this.location.href,expectedUrl,'Original URL/hash is preserved');
    assert.equal(this.window.scrollX,this.scroll.x);assert.equal(this.window.scrollY,this.scroll.y);
  }
  /** Assert that lifecycle release cannot leave an invisible input/scroll blocker. */
  assertReleased() {
    assert.equal(this.overlay.isConnected,false,'Overlay detached');
    assert.equal(this.root.classList.contains('vesa-intro-pending'),false,'Root scroll lock removed');
    assert.ok(this.background.every(node=>node.inert===false),'Homepage regions unlocked');
    assert.equal(this.timers.size,0,'No fade/stall timer retained');
    assert.equal(this.window.listeners.get('hashchange')?.size||0,0,'Hash listener released');
    assert.equal(this.window.listeners.get('pagehide')?.size||0,0,'Page departure listener released');
  }
}

/**
 * Read-only acceptance owner for one intro eligibility patch. Actual source is
 * reconstructed against a fixed Git baseline, then exercised in fresh VM fixtures.
 * The exported static homepage normalizer is also used by the showcase guard so
 * its original preservation proof gains only this explicitly bounded exception.
 */
class HomeIntroOnceVerifier {
  static BASELINE='f847ae5fbe2b2a5c502be25f4d1efc8b6e7376f5';
  static KEY='vesa.home.intro.seen.v1';
  // Pin this reviewed patch; later intro edits require a new bounded compatibility decision.
  static GATE_SHA256='c372a5e7864e8c6822f597a51d9dd1128c5c514ea47722714ca4235ad83e8613';
  static CONTROLLER_SHA256='71c1e24299e4952ad5c07d2a3bad2a3eb8b7b3dc8ebba2610e6f28434eba7cc4';
  /** Bind local source files; construction performs no scenario or mutation. */
  constructor(root) {
    this.root=root;this.html=this.read('index.html');this.controllerSource=this.read('js/vesa-home-intro.js');
    this.gateSource=HomeIntroOnceVerifier.gate(this.html)[1];
    this.report={baseline:HomeIntroOnceVerifier.BASELINE,scope:'Exact source preservation and Node VM state/lifecycle fixtures; browser proof is separate',scenarios:[]};
  }
  /** Read a current text file and fail explicitly if the approved source is missing. */
  read(relative){return fs.readFileSync(path.join(this.root,relative),'utf8')}
  /** Read the exact immutable baseline without touching the checkout or Git refs. */
  baseline(relative){return execFileSync('git',['show',HomeIntroOnceVerifier.BASELINE+':'+relative],{cwd:this.root,encoding:'utf8',maxBuffer:30*1024*1024})}
  /** Require a singular named gate boundary before extracting code for actual execution. */
  static gate(source) {
    const matches=[...source.matchAll(/<script id="vesa-home-intro-gate">([\s\S]*?)<\/script>/g)];
    assert.equal(matches.length,1,'Exactly one early intro decision owner');
    assert.match(matches[0][1],/class HomeIntroVisitGate\b/);
    assert.equal(createHash('sha256').update(matches[0][1]).digest('hex'),HomeIntroOnceVerifier.GATE_SHA256,'Early gate changed beyond the reviewed first-visit patch');
    return matches[0];
  }
  /** Reverse one exact approved replacement; unknown/multiple occurrences fail closed. */
  static replaceOnce(source,from,to,label) {
    assert.equal(source.split(from).length-1,1,label+' must occur exactly once');
    return source.replace(from,to);
  }
  /** Reverse only the gate, intro-video attributes and v4 script URL, preserving all other bytes. */
  static restoreHomepage(source) {
    const gate=HomeIntroOnceVerifier.gate(source);
    let restored=source.replace(gate[0],'<script>document.documentElement.classList.add("vesa-intro-pending");</script>');
    restored=HomeIntroOnceVerifier.replaceOnce(restored,'<video class="vesa-home-intro__video" id="vesaIntroVideo" playsinline webkit-playsinline preload="none" disablepictureinpicture aria-hidden="true">','<video class="vesa-home-intro__video" id="vesaIntroVideo" autoplay playsinline webkit-playsinline preload="auto" disablepictureinpicture aria-hidden="true">','Intro video eligibility attributes');
    return HomeIntroOnceVerifier.replaceOnce(restored,'<script src="js/vesa-home-intro.js?v=4" defer></script>','<script src="js/vesa-home-intro.js?v=3" defer></script>','Versioned deferred intro entry');
  }
  /** Reverse the approved controller additions without masking original media/control code. */
  restoreController(source) {
    const changes=[
      ['/**\n * Homepage film page entry. The early HomeIntroVisitGate owns visit persistence;\n * this existing closure owns only media controls, the overlay and content release.\n * A permitted first visit retains the original film, sound fallback, Skip and fade.\n * Other visits release immediately without making the homepage inert or playing.\n */','/* The original 10-second film must finish before the already-rendered homepage is revealed. */'],
      ["  // Consume the head decision, not the marker it just wrote for the first visit.\n  if(root.dataset.vesaIntroDecision!=='play'||location.hash){\n    video.pause();overlay.remove();root.classList.remove('vesa-intro-pending');return;\n  }\n",''],
      ["  let completed=false,recoveryMode='',safetyTimer,releaseTimer;","  let completed=false,recoveryMode='',safetyTimer;"],
      ['    clearTimeout(safetyTimer);clearTimeout(releaseTimer);\n',''],
      ["    window.removeEventListener('hashchange',onSectionNavigation);\n    window.removeEventListener('pagehide',openSiteImmediately);\n",''],
      ["    releaseTimer=setTimeout(release,matchMedia('(prefers-reduced-motion: reduce)').matches?170:980);","    setTimeout(release,matchMedia('(prefers-reduced-motion: reduce)').matches?170:980);"],
      ['  // Skip, unavailable-media recovery, or navigation releases even during the final fade.','  // Only an explicit user Skip (or unavailable-video recovery) bypasses the end-frame fade.'],
      ['    if(completed&&!overlay.isConnected)return;','    if(completed)return;'],
      ['  /** Preserve section navigation and its native URL/scroll behavior during playback. */\n  function onSectionNavigation(){if(location.hash)openSiteImmediately();}\n',''],
      ["  window.addEventListener('hashchange',onSectionNavigation);\n  window.addEventListener('pagehide',openSiteImmediately);\n",'']
    ];
    let restored=source;
    for(const [from,to]of changes)restored=HomeIntroOnceVerifier.replaceOnce(restored,from,to,'Approved intro-controller change');
    assert.ok(restored.endsWith('\n'),'New controller has a final newline');
    return restored.slice(0,-1);
  }
  /** Prove exact approved runtime transformations; reusable by the older showcase guard. */
  sourcePreservation() {
    assert.equal(HomeIntroOnceVerifier.restoreHomepage(this.html),this.baseline('index.html'),'Homepage changed beyond approved intro boundaries');
    assert.equal(this.restoreController(this.controllerSource),this.baseline('js/vesa-home-intro.js'),'Original film, audio, recovery, Skip or fade code drifted');
    assert.equal(createHash('sha256').update(this.controllerSource).digest('hex'),HomeIntroOnceVerifier.CONTROLLER_SHA256,'Controller changed beyond the reviewed first-visit patch');
    const oldWorker=this.baseline('service-worker.js'),worker=this.read('service-worker.js');
    let restored=HomeIntroOnceVerifier.replaceOnce(worker,"const CACHE='vesa-v123-home-intro-once';","const CACHE='vesa-v122-product-showcase';",'Intro cache identity');
    restored=HomeIntroOnceVerifier.replaceOnce(restored,"'./js/vesa-home-intro.js?v=4'","'./js/vesa-home-intro.js?v=3'",'Intro precache URL');
    assert.equal(restored,oldWorker,'Service-worker policy or unrelated precache entries changed');
    assert.ok(this.html.indexOf('id="vesa-home-intro-gate"')<this.html.indexOf('html.vesa-intro-pending'),'Decision precedes scroll-lock styles');
    assert.ok(this.html.indexOf('id="vesa-home-intro-gate"')<this.html.indexOf('<body'),'Decision precedes intro markup');
    const video=this.html.match(/<video\b[^>]*\bid="vesaIntroVideo"[^>]*>/)?.[0];
    assert.ok(video&&!/\bautoplay\b/.test(video)&&/\bpreload="none"/.test(video),'Intro cannot autoplay or preload independently of the gate');
    this.report.source={homepage_exactly_reconstructed:true,controller_exactly_reconstructed:true,worker_only_cache_and_intro_url:true,early_gate_before_lock:true,gate_sha256:createHash('sha256').update(this.gateSource).digest('hex'),controller_sha256:createHash('sha256').update(this.controllerSource).digest('hex')};
    return this.report.source;
  }
  /** Freeze all baseline paths except the three runtime files and this compatibility test. */
  lockedScope() {
    const tracked=new Set(execFileSync('git',['ls-tree','-r','--name-only',HomeIntroOnceVerifier.BASELINE],{cwd:this.root,encoding:'utf8',maxBuffer:4*1024*1024}).trim().split('\n'));
    const changed=execFileSync('git',['diff','--name-only',HomeIntroOnceVerifier.BASELINE,'--'],{cwd:this.root,encoding:'utf8',maxBuffer:4*1024*1024}).trim().split('\n').filter(Boolean);
    const expected=['index.html','js/vesa-home-intro.js','service-worker.js','tests/product-showcase.test.cjs'].sort();
    assert.deepEqual(changed.filter(file=>tracked.has(file)).sort(),expected,'Original path changes exceed the approved intro patch');
    const present=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:this.root,encoding:'utf8',maxBuffer:4*1024*1024}).trim().split('\n').filter(Boolean);
    const added=present.filter(file=>!tracked.has(file));
    for(const file of added)assert.ok(file==='tests/vesa-home-intro-once.cjs'||file==='docs/website/INTRO_FIRST_VISIT_RELEASE.md'||file.startsWith('docs/website/intro-first-visit/'),'Unapproved added path: '+file);
    this.report.scope_preservation={changed_original_paths:expected,all_other_original_paths_unchanged:true,added_paths:added};
  }
  /** Exercise independent first-document decisions and storage/API failure boundaries. */
  gateScenarios() {
    const cases=[
      ['fresh bare homepage',{},'play'],
      ['fresh index document',{href:'https://vesaent.com/index.html'},'play'],
      ['fresh campaign URL',{href:'https://vesaent.com/?campaign=launch'},'play'],
      ['external arrival',{referrer:'https://example.com/article'},'play'],
      ['seen visitor',{seen:true},'skip'],
      ['first section visit',{href:'https://vesaent.com/#portfolio'},'skip'],
      ['first product section visit',{href:'https://vesaent.com/?campaign=launch#product-showcase'},'skip'],
      ['unknown fragment',{href:'https://vesaent.com/#unrecognized'},'skip'],
      ['fresh reload',{navigation:'reload'},'skip'],
      ['fresh back-forward',{navigation:'back_forward'},'skip'],
      ['same-origin return',{referrer:'https://vesaent.com/product-showcase/'},'skip'],
      ['non-home route',{href:'https://vesaent.com/login/'},'skip'],
      ['storage getter blocked',{accessError:true},'skip'],
      ['storage missing',{missingStorage:true},'skip'],
      ['storage read blocked',{readError:true},'skip'],
      ['storage write blocked',{writeError:true},'skip'],
      ['navigation API throws',{navigationError:true},'skip']
    ];
    for(const [name,options,expected]of cases) {
      const fixture=new IntroFixture(options);
      if(options.seen)fixture.values.set(HomeIntroOnceVerifier.KEY,'1');
      fixture.gate(this.gateSource);
      assert.equal(fixture.root.dataset.vesaIntroDecision,expected,name);
      assert.equal(fixture.root.classList.contains('vesa-intro-pending'),expected==='play',name);
      if(expected==='play') {
        assert.equal(fixture.values.get(HomeIntroOnceVerifier.KEY),'1',name+': visit recorded');
        const write=fixture.log.findIndex(row=>row.type==='storage-set');
        const lock=fixture.log.findIndex(row=>row.type==='class-add'&&row.value==='vesa-intro-pending');
        assert.ok(write>=0&&lock>write,name+': persistence precedes display');
      }
      fixture.controller(this.controllerSource);
      if(expected==='skip') {
        fixture.assertReleased();assert.equal(fixture.mediaCalls.length,0,name+': no playback');
        assert.ok(!fixture.log.some(row=>row.type==='inert'),name+': bypass never locks the homepage');
      } else {
        assert.equal(fixture.mediaCalls.length,1,name+': permitted initial playback');
        assert.equal(fixture.mediaCalls[0].seen,'1',name+': stored before playback');
        fixture.nodes.get('vesaIntroSkip').emit('click');fixture.assertReleased();
      }
      fixture.assertBoundaries();this.report.scenarios.push(name);
    }
  }
  /** Share only the preference between fresh documents to model refresh/new-tab/return. */
  repeatedVisits() {
    for(const firstHash of ['', '#portfolio']) {
      const values=new Map([['vesa.auth.session','keep-session']]);
      const first=new IntroFixture({values,href:'https://vesaent.com/'+firstHash});
      first.gate(this.gateSource);assert.equal(values.get(HomeIntroOnceVerifier.KEY),'1','First visit recorded before controller starts');
      for(const navigation of ['reload','back_forward','navigate']) {
        const next=new IntroFixture({values,navigation});next.gate(this.gateSource);next.controller(this.controllerSource);
        assert.equal(next.root.dataset.vesaIntroDecision,'skip');assert.equal(next.mediaCalls.length,0);next.assertReleased();next.assertBoundaries();
      }
      first.controller(this.controllerSource);
      if(!firstHash) {
        assert.equal(first.mediaCalls.length,1,'Per-document decision permits first playback despite the already-written marker');
        first.nodes.get('vesaIntroSkip').emit('click');
      }
      first.assertReleased();first.assertBoundaries();
      this.report.scenarios.push(firstHash?'first deep link then bare reload/back/visit':'refresh during first visit and later new document');
    }
    const race=new IntroFixture();race.gate(this.gateSource);race.location.hash='#portfolio';race.controller(this.controllerSource);
    assert.equal(race.mediaCalls.length,0);race.assertReleased();race.assertBoundaries(race.location.href);
    const noGate=new IntroFixture();noGate.controller(this.controllerSource);noGate.assertReleased();assert.equal(noGate.mediaCalls.length,0);noGate.assertBoundaries();
    this.report.scenarios.push('hash added between head and deferred entry','missing head decision bypasses');
  }
  /** Prove complete-film fades and navigation/Skip interruption both release all blockers. */
  async lifecycleScenarios() {
    for(const reduced of [false,true]) {
      const fixture=new IntroFixture({reduced});fixture.gate(this.gateSource);fixture.controller(this.controllerSource);await fixture.settlePromises();
      fixture.video.emit('ended');assert.equal(fixture.overlay.isConnected,true,'A premature ended event cannot finish an unfinished film');
      fixture.video.ended=true;fixture.video.paused=true;fixture.video.emit('ended');
      assert.equal(fixture.overlay.isConnected,true,'Last frame remains through the fade');
      assert.equal(fixture.overlay.classList.contains('is-exiting'),true);
      assert.equal(fixture.overlay.getAttribute('aria-hidden'),'true');
      assert.ok(fixture.background.every(node=>node.inert));assert.equal(fixture.timers.size,1);
      fixture.runDelay(reduced?170:980);fixture.assertReleased();fixture.assertBoundaries();
      this.report.scenarios.push(reduced?'reduced-motion completed-film fade':'normal completed-film fade');
    }
    for(const duringFade of [false,true])for(const trigger of ['skip','hashchange','pagehide']) {
      const fixture=new IntroFixture();fixture.gate(this.gateSource);fixture.controller(this.controllerSource);await fixture.settlePromises();
      if(duringFade){fixture.video.ended=true;fixture.video.emit('ended');assert.equal(fixture.timers.size,1)}
      let expectedUrl=fixture.originalUrl;
      if(trigger==='skip')fixture.nodes.get('vesaIntroSkip').emit('click');
      else {
        if(trigger==='hashchange'){fixture.location.hash='#portfolio';expectedUrl=fixture.location.href}
        fixture.window.emit(trigger,{persisted:true});
      }
      fixture.assertReleased();assert.equal(fixture.video.paused,true);fixture.assertBoundaries(expectedUrl);
      const plays=fixture.mediaCalls.length;
      fixture.document.emit('visibilitychange');fixture.video.emit('ended');fixture.window.emit('pageshow',{persisted:true});
      await fixture.settlePromises();assert.equal(fixture.mediaCalls.length,plays,'Released/BFCache document cannot replay');
      fixture.assertReleased();
      this.report.scenarios.push(trigger+(duringFade?' during final fade':' during playback'));
    }
    const pending=new IntroFixture({playPlan:['pending']});pending.gate(this.gateSource);pending.controller(this.controllerSource);
    pending.window.emit('pagehide',{persisted:true});pending.assertReleased();pending.resolvePlayback();await pending.settlePromises();
    pending.assertReleased();assert.equal(pending.mediaCalls.length,1,'Late initial play resolution cannot revive playback');pending.assertBoundaries();
    this.report.scenarios.push('late playback promise after page departure');
  }
  /** Preserve existing sound fallback, explicit user controls, stalled/error recovery and timeouts. */
  async mediaScenarios() {
    const audible=new IntroFixture();audible.gate(this.gateSource);audible.controller(this.controllerSource);await audible.settlePromises();
    assert.equal(audible.mediaCalls[0].muted,false);assert.equal(audible.video.volume,.85);assert.equal(audible.video.loop,false);assert.equal(audible.video.playbackRate,1);
    audible.nodes.get('vesaIntroSound').emit('click');assert.equal(audible.video.muted,true);
    audible.nodes.get('vesaIntroSound').emit('click');assert.equal(audible.video.muted,false);
    audible.nodes.get('vesaIntroSkip').emit('click');audible.assertReleased();audible.assertBoundaries();
    const fallback=new IntroFixture({playPlan:['reject','resolve']});fallback.gate(this.gateSource);fallback.controller(this.controllerSource);await fallback.settlePromises();
    assert.deepEqual(fallback.mediaCalls.map(call=>call.muted),[false,true],'Audible autoplay rejection retains muted retry');
    fallback.nodes.get('vesaIntroSkip').emit('click');fallback.assertReleased();fallback.assertBoundaries();
    const blocked=new IntroFixture({playPlan:['reject','reject','resolve']});blocked.gate(this.gateSource);blocked.controller(this.controllerSource);await blocked.settlePromises();
    assert.equal(blocked.overlay.classList.contains('is-paused'),true);assert.equal(blocked.nodes.get('vesaIntroRecovery').hidden,false);
    blocked.nodes.get('vesaIntroAction').emit('click');await blocked.settlePromises();assert.equal(blocked.mediaCalls.length,3);
    blocked.nodes.get('vesaIntroSkip').emit('click');blocked.assertReleased();blocked.assertBoundaries();
    const failed=new IntroFixture();failed.gate(this.gateSource);failed.controller(this.controllerSource);await failed.settlePromises();
    failed.video.emit('error');assert.equal(failed.overlay.classList.contains('is-error'),true);
    assert.equal(failed.nodes.get('vesaIntroAction').textContent,'Open VESA website');
    failed.nodes.get('vesaIntroAction').emit('click');failed.assertReleased();failed.assertBoundaries();
    const stalled=new IntroFixture();stalled.gate(this.gateSource);stalled.controller(this.controllerSource);await stalled.settlePromises();
    stalled.video.readyState=2;stalled.video.emit('stalled');assert.equal(stalled.timers.size,1);
    stalled.runDelay(10000);assert.equal(stalled.overlay.classList.contains('is-paused'),true);
    stalled.video.emit('stalled');stalled.video.emit('playing');assert.equal(stalled.timers.size,0,'Resumed playback cancels stall timer');
    stalled.video.emit('stalled');stalled.nodes.get('vesaIntroSkip').emit('click');stalled.assertReleased();stalled.assertBoundaries();
    for(const missing of ['vesaHomeIntro','vesaIntroVideo']) {
      const fixture=new IntroFixture({missing});fixture.gate(this.gateSource);fixture.controller(this.controllerSource);
      assert.equal(fixture.root.classList.contains('vesa-intro-pending'),false);assert.equal(fixture.mediaCalls.length,0);
      assert.ok(!fixture.log.some(row=>row.type==='inert'));fixture.assertBoundaries();
    }
    this.report.scenarios.push('sound controls and normal playback preserved','audible rejection muted fallback','blocked playback explicit recovery','unavailable media recovery','stall timer cleanup','missing overlay/video unlocks');
  }
  /** Run source and behavioral proof once, returning serializable evidence for release review. */
  async run() {
    this.sourcePreservation();this.lockedScope();this.gateScenarios();this.repeatedVisits();
    await this.lifecycleScenarios();await this.mediaScenarios();
    this.report.scenario_count=this.report.scenarios.length;this.report.verdict='accepted';return this.report;
  }
}

module.exports={HomeIntroOnceVerifier};
// Native CLI entry only; importers reuse the bounded source normalizer without executing scenarios.
if(require.main===module)new HomeIntroOnceVerifier(path.resolve(__dirname,'..')).run().then(report=>{
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}).catch(error=>{
  process.stderr.write('HOME_INTRO_VERIFICATION_FAILED: '+(error.stack||error)+'\n');process.exitCode=1;
});
