/**
 * Independent category-disclosure checks for the121-product release. This verifier
 * executes production owners in bounded DOM fixtures; it never starts a browser,
 * alters images, writes application state, or publishes. Rendered proof is separate.
 * Access: node tests/product-showcase-category.test.cjs from the repository root.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

/** Minimal tree/listener fixture exposing only the navigation owner's DOM needs. */
class CategoryElement {
  constructor(document,tag='div') {
    this.document=document;this.ownerDocument=document;this.tag=tag;this.children=[];this.listeners=new Map();
    this.attrs=new Map();this.dataset={};this.style={};this.hidden=false;
    this.rect={left:0,top:0,width:1200,height:50,right:1200,bottom:50};
    this.classList={toggle(){}};
  }
  append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node)}}
  replaceChildren(...nodes){this.children=[];this.append(...nodes)}
  setAttribute(name,value){this.attrs.set(name,String(value))}
  getAttribute(name){return this.attrs.get(name)??null}
  removeAttribute(name){this.attrs.delete(name)}
  addEventListener(type,handler,options={}){
    const list=this.listeners.get(type)||[];list.push({handler,signal:options.signal});this.listeners.set(type,list);
  }
  emit(type,event={}){for(const row of this.listeners.get(type)||[])if(!row.signal?.aborted)row.handler({target:this,...event})}
  contains(node){return node===this||this.children.some(child=>child.contains(node))}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null}
  querySelectorAll(selector){
    const result=[];
    for(const child of this.children){
      if(selector.startsWith('#')&&child.id===selector.slice(1)||selector==='button[data-item]'&&child.dataset.item||selector==='button[data-zone]'&&child.dataset.zone)result.push(child);
      result.push(...child.querySelectorAll(selector));
    }
    return result;
  }
  closest(selector){
    if(selector==='button[data-item]'&&this.dataset.item||selector==='.collection-trigger'&&this.className==='collection-trigger')return this;
    return this.parent?.closest(selector)||null;
  }
  focus(){this.document.activeElement=this;this.emit('focus')}
  matches(selector){return selector===':focus-visible'&&this.document.keyboard===true}
  getBoundingClientRect(){return this.rect}
}

/** Own one fresh catalogue, event graph and evidence report; no production writes. */
class CategoryReleaseVerifier {
  constructor(root){this.root=root;this.records=JSON.parse(this.read('catalogue.json'));this.results={}}
  read(file){return fs.readFileSync(path.join(this.root,'product-showcase',file),'utf8')}
  fixture(){
    const document={activeElement:null,keyboard:false};
    const events=new CategoryElement(document);document.addEventListener=events.addEventListener.bind(events);document.events=events;
    document.createElement=tag=>new CategoryElement(document,tag);
    document.createElementNS=(_,tag)=>document.createElement(tag);
    const window=new CategoryElement(document);window.innerWidth=1280;
    const timers=new Map();let nextTimer=1;
    window.setTimeout=callback=>{const id=nextTimer++;timers.set(id,callback);return id};
    const media=new CategoryElement(document);media.matches=true;
    const context=vm.createContext({document,window,AbortController,matchMedia:()=>media,clearTimeout:id=>timers.delete(id),queueMicrotask:callback=>callback()});
    vm.runInContext(this.read('catalogue.js')+'\n'+this.read('category-navigation.js')+'\n'+this.read('garment-details.js')+'\n'+this.read('experience.js')+'\nthis.Owners={GarmentCatalogue,CarouselState,CategoryNavigation,GarmentDetails,MotionExperience};',context);
    const root=new CategoryElement(document);
    for(const id of ['collection-controls','collection-panel','collection-list','collection-panel-title','browse-collection','close-collection']){
      const node=new CategoryElement(document);node.id=id;root.append(node);
    }
    root.querySelector('#collection-panel').rect={left:0,width:720};
    const selected=[],holds=[],catalogue=new context.Owners.GarmentCatalogue(this.records);
    const navigation=new context.Owners.CategoryNavigation(root,catalogue,{onSelect:(group,id)=>selected.push({group,id,closed:!navigation.isOpen}),onOpenChange:open=>holds.push(open)});
    navigation.start();
    return {navigation,catalogue,root,document,window,media,timers,selected,holds,owners:context.Owners};
  }
  /** Every source ID must be visible exactly once in its category and in All. */
  coverage(f){
    const counts={men:34,ladies:29,boys:22,girls:22,baby:14};
    for(const [group,count]of Object.entries(counts)){
      const expected=this.records.filter(row=>row.group===group).map(row=>row.id);
      const actual=Array.from(f.navigation.sections(group)).flatMap(section=>Array.from(section.items,row=>row.id));
      assert.equal(actual.length,count);assert.deepEqual(actual,expected,group+' family coverage');
    }
    const all=Array.from(f.navigation.sections('all')).flatMap(section=>Array.from(section.items,row=>row.id));
    assert.equal(new Set(all).size,121);assert.deepEqual(all.sort(),this.records.map(row=>row.id).sort());
    const cycle=Array.from(f.catalogue.presentationItems(),row=>row.id);
    assert.equal(new Set(cycle).size,121);
    assert.deepEqual(cycle.slice(0,5),['M16','L02','K02','K14','K26']);assert.equal(cycle.at(-1),'K25');
    assert.equal(f.navigation.buttons.size,6);this.results.coverage={total:121,groups:counts,mixed_initial_cycle:cycle.slice(0,5)};
  }
  /** Exercise actual registered hover, selection, keyboard and dismissal handlers. */
  interactions(f){
    const {navigation:n,document,root,selected,timers}=f;
    n.buttons.get('men').emit('pointerenter',{pointerType:'mouse'});
    assert.equal(n.openGroup,'men');assert.equal(selected.length,0,'Hover must never select a product');
    assert.equal(n.list.querySelectorAll('button[data-item]').length,34);
    const choice=n.list.querySelectorAll('button[data-item]').find(node=>node.dataset.item==='M34');
    n.list.emit('click',{target:choice});assert.deepEqual(selected.at(-1),{group:'men',id:'M34',closed:true});
    for(const row of this.records){
      n.open(row.group);const button=n.list.querySelectorAll('button[data-item]').find(node=>node.dataset.item===row.id);
      assert.ok(button);n.list.emit('click',{target:button});assert.deepEqual(selected.at(-1),{group:row.group,id:row.id,closed:true});
    }
    n.buttons.get('baby').rect={left:1000,width:200};n.buttons.get('baby').emit('pointerenter',{pointerType:'mouse'});
    assert.equal(n.panel.style.left,'480px','Rightmost menu remains within1200px navigation');
    root.emit('pointerleave',{pointerType:'mouse'});assert.equal(timers.size,1);
    root.emit('pointerenter');assert.equal(timers.size,0,'Entering menu bridge cancels pending close');
    n.close();n.buttons.get('girls').emit('click');assert.equal(n.pinned,true);
    const escape={key:'Escape',preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};
    document.events.emit('keydown',escape);assert.equal(n.isOpen,false);assert.equal(document.activeElement,n.buttons.get('girls'));
    n.open('boys');document.events.emit('pointerdown',{target:new CategoryElement(document)});assert.equal(n.isOpen,false);
    f.window.innerWidth=390;f.media.matches=false;n.buttons.get('baby').emit('click');
    assert.equal(n.isOpen,true);assert.equal(n.panel.style.left,'0px');assert.equal(n.list.querySelectorAll('button[data-item]').length,14);
    n.browse.emit('click');assert.deepEqual(selected.at(-1),{group:'baby',id:null,closed:true});
    n.open('girls');n.destroy();assert.equal(n.events.signal.aborted,true);assert.equal(n.isOpen,false);assert.equal(timers.size,0);
    this.results.interactions={all121_item_choices:true,hover_without_selection:true,rightmost_panel_bounds:true,hover_bridge:true,escape_focus_return:true,outside_click:true,mobile_tap:true,collection_browse:true,cleanup:true};
  }
  /**
   * Execute the production annotation constructor/update for every manifest row.
   * This fixture replaces only image decoding; actual zone selection, reset and
   * control labels must work without invented companions or missing new IDs.
   * Assertions are catalogue invariants, not a copy of the production band table.
   */
  annotations(){
    const f=this.fixture(),root=new CategoryElement(f.document);
    for(const id of ['garment-switch','detail-summary','garment-callout','garment-pin','garment-line','callout-path','detail-hint','detail-announcement']){
      const node=new CategoryElement(f.document);node.id=id;root.append(node);
    }
    const controls=root.querySelector('#garment-switch');
    for(const key of ['top','bottom','one']){
      const button=new CategoryElement(f.document,'button');button.dataset.zone=key;controls.append(button);
    }
    const details=new f.owners.GarmentDetails(root);
    // Pixel decoding is independently covered by the asset gate and browser review.
    details.prepareMask=()=>Promise.resolve(false);
    const productIds=new Set(['K38','K48','K55','K58']);
    for(const record of this.records){
      details.update(record);
      assert.equal(details.record,record);
      assert.ok(details.zones.length>=1&&details.zones.length<=2,record.id+' zone count');
      assert.equal(details.zones.filter(zone=>zone.primary).length,1,record.id+' primary garment');
      assert.equal(new Set(details.zones.map(zone=>zone.key)).size,details.zones.length);
      let previousEnd=0;
      for(const zone of details.zones){
        assert.ok(Number.isFinite(zone.start)&&Number.isFinite(zone.end)&&zone.start>=previousEnd&&zone.end>zone.start&&zone.end<=1,record.id+' ordered normalized bands');
        assert.ok(typeof zone.name==='string'&&zone.name.trim(),record.id+' supported garment name');
        if(zone.primary)assert.equal(zone.name,record.name,record.id+' exact primary name');
        previousEnd=zone.end;
      }
      const visible=controls.querySelectorAll('button[data-zone]').filter(button=>!button.hidden);
      assert.equal(visible.length,details.zones.length,record.id+' visible inspection controls');
      for(const button of visible){
        const zone=details.zones.find(item=>item.key===button.dataset.zone);
        assert.equal(button.getAttribute('aria-label'),'Inspect '+zone.kind.toLowerCase()+': '+zone.name);
      }
      if(productIds.has(record.id)){
        assert.equal(record.presentation,'product');
        assert.equal(details.zones.length,1,record.id+' has no invented companion');
        assert.equal(details.zones[0].key,'one');assert.equal(details.zones[0].kind,'Product');
        assert.equal(visible[0].textContent,'Product',record.id+' product-only control label');
      }
    }
    assert.throws(()=>details.update({...this.records[0],id:'K59'}),/Missing garment annotation/);
    details.destroy();f.navigation.destroy();
    assert.equal(details.listeners.signal.aborted,true);
    this.results.annotations={actual_updates:121,valid_ordered_bands:true,one_primary_per_record:true,product_only_ids:[...productIds],product_only_controls:true,unknown_ids_fail_closed:true};
  }
  /**
   * Exercise the actual playback predicate with the actual disclosure lifecycle.
   * The bounded state begins eligible; opening/closing may gate execution but
   * must never overwrite an explicit pause or a parent suspension preference.
   */
  playback(){
    const f=this.fixture(),navigation=f.navigation;
    f.document.hidden=false;
    const state={started:true,destroyed:false,playing:true,windowActive:true,visible:true,externalSuspended:false,dialog:{open:false},navigation,keyboardFocus:false,hovered:false,hoverOverride:false,details:{inspecting:false},director:{ready:true}};
    const canRun=Object.getOwnPropertyDescriptor(f.owners.MotionExperience.prototype,'canRun').get;
    assert.equal(canRun.call(state),true);
    navigation.open('boys','hover');assert.equal(canRun.call(state),false);assert.equal(state.playing,true);
    navigation.close();assert.equal(canRun.call(state),true);
    state.playing=false;
    navigation.open('girls');navigation.close();assert.equal(canRun.call(state),false);assert.equal(state.playing,false);
    state.playing=true;state.externalSuspended=true;
    navigation.open('baby');navigation.close();assert.equal(canRun.call(state),false);
    assert.equal(state.externalSuspended,true);assert.equal(state.playing,true);
    state.externalSuspended=false;assert.equal(canRun.call(state),true);
    navigation.destroy();
    this.results.playback={actual_canRun_predicate:true,menu_holds_execution:true,closing_restores_only_eligible_playback:true,explicit_pause_preserved:true,parent_suspension_preserved:true};
  }
  /** Check the shipped DOM boundary and inline-height contract separately from fixtures. */
  markup(){
    const html=this.read('index.html'),css=this.read('styles.css');
    assert.equal((html.match(/id="chapters"/g)||[]).length,1);
    assert.ok(html.indexOf('id="chapters"')<html.indexOf('class="presentation"'));
    assert.ok(!html.includes('Review preview')&&!html.includes('review-proposal'));
    assert.ok(css.includes('.vesa-showcase.with-collections[data-mode="inline"] { height: auto; min-height: 0; }'));
    assert.ok(!this.read('bootstrap.js').includes('review-embedded-assets'));
    this.results.markup={one_top_category_menu:true,no_preview_banner_or_embedded_adapters:true,intrinsic_inline_height:true};
  }
  run(){const f=this.fixture();this.coverage(f);this.interactions(f);this.annotations();this.playback();this.markup();return {verdict:'accepted',scope:'bounded Node fixtures; browser proof separate',...this.results}}
}
try{process.stdout.write(JSON.stringify(new CategoryReleaseVerifier(path.resolve(__dirname,'..')).run(),null,2)+'\n')}
catch(error){process.stderr.write(error.stack+'\n');process.exitCode=1}
