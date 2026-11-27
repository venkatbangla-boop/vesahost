/**
 * MotionExperience coordinates one isolated product viewer.
 * Owner: selection, input modality, playback holds, observers and an optional RAF.
 * Access: construct with reviewed records and optional initial group/item/playing/
 * onSelection/onSettled values, then start(); the bootstrap may call select or
 * setSuspended. Selection and image readiness callbacks are distinct boundaries.
 * Catalogue data stays immutable, SceneDirector owns three visual layers and
 * GarmentDetails owns only the selected model's alpha mask and annotations.
 * No homepage DOM, history, network requests or persistent storage is accessed.
 */
class MotionExperience {
  /**
   * Wire one root without starting effects. Invalid initial selections retain a
   * valid catalogue item. onSelection receives a frozen {group,item} snapshot;
   * onSettled receives (ready,snapshot) only for the current render, never stale work.
   * destroy() releases listeners, observers, image work and animation handles.
   */
  constructor(root,records,options={}) {
    this.root=root; this.catalogue=new GarmentCatalogue(records);
    this.state=new CarouselState(this.catalogue); this.state.selectId('M16');
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.director=new SceneDirector(root,this.reduced); this.details=new GarmentDetails(root);
    this.scene=root.querySelector('#scene'); this.dialog=root.querySelector('#index-dialog');
    this.search=root.querySelector('#search'); this.grid=root.querySelector('#index-grid');
    this.progress=root.querySelector('#progress'); this.buttons=new Map(); this.events=new AbortController();
    this.playing=options.playing!==false&&!this.reduced.matches;
    this.duration=6000; this.elapsed=0; this.last=0; this.frame=0;
    this.down=null; this.wheelAt=0; this.keyboardFocus=false; this.inputMode='pointer';
    this.resumeFocusNode=null; this.hovered=false; this.hoverOverride=false;
    this.visible=true; this.windowActive=true; this.externalSuspended=false;
    this.started=false; this.destroyed=false; this.startPromise=null;
    this.renderVersion=0; this.resizeObserver=null; this.intersectionObserver=null;
    this.onSelection=typeof options.onSelection==='function'?options.onSelection:null;
    this.onSettled=typeof options.onSettled==='function'?options.onSettled:null;
    if(options.group||options.item)this.select(options.group||'all',options.item||null);
  }
  /** Return a read-only route snapshot; callers cannot mutate navigation state. */
  get selection() {return Object.freeze({group:this.state.group,item:this.state.current.id})}
  /** Attach an owner-scoped listener, automatically removed by destroy(). */
  listen(target,type,handler,options={}) {
    target.addEventListener(type,handler,{...options,signal:this.events.signal});
  }
  /**
   * Bind persistent controls once and resolve after the first central image settles.
   * Keys and gestures stay within this viewer; only visibility/focus are observed
   * on its own document/window. Repeated starts return the original promise.
   */
  start() {
    if(this.started||this.destroyed)return this.startPromise||Promise.resolve(false);
    this.started=true;
    const tabs=this.root.querySelector('#chapters');
    const names={all:'All',men:"Men's",ladies:"Ladies'",boys:'Boys',girls:'Girls',baby:'Baby'};
    for(const [group,label]of Object.entries(names)) {
      const button=document.createElement('button');button.type='button';button.dataset.group=group;
      button.setAttribute('aria-pressed','false');button.textContent=label;
      this.listen(button,'click',()=>this.group(group));tabs.append(button);this.buttons.set(group,button);
    }
    this.listen(this.root.querySelector('#previous'),'click',()=>this.step(-1));
    this.listen(this.root.querySelector('#next'),'click',()=>this.step(1));
    this.listen(this.root.querySelector('#play'),'click',()=>this.togglePlay());
    this.listen(this.root.querySelector('#open-index'),'click',()=>this.openIndex());
    this.listen(this.root.querySelector('#close-index'),'click',()=>this.dialog.close());
    this.listen(this.dialog,'close',()=>{this.elapsed=0;this.reconcileMotion()});
    this.listen(this.search,'input',()=>this.renderIndex(this.search.value));
    this.listen(this.grid,'click',event=>this.chooseIndexItem(event));
    this.listen(this.scene,'click',event=>this.chooseNeighbor(event));
    // GarmentDetails handles the control first; bubbling exposes its completed state.
    this.listen(this.root.querySelector('#garment-switch'),'click',()=>this.reconcileMotion());
    this.listen(this.root,'keydown',event=>this.onKeyDown(event));
    this.listen(this.root,'pointerdown',event=>{
      this.inputMode='pointer';this.keyboardFocus=false;this.resumeFocusNode=null;
      if(!event.target.closest('#play'))this.hoverOverride=false;
      this.reconcileMotion();
    },{capture:true});
    this.listen(this.root,'focusin',event=>{
      const keyboard=this.inputMode==='keyboard'||event.target.matches(':focus-visible');
      if(keyboard&&event.target!==this.resumeFocusNode) {
        // Keyboard exploration is a durable stop, not a hold that resumes on blur.
        this.keyboardFocus=true;this.playing=false;this.hoverOverride=false;
      }
      this.reconcileMotion();
    });
    this.listen(this.root,'focusout',()=>{
      queueMicrotask(()=>{
        if(this.destroyed)return;
        if(!this.root.contains(document.activeElement)) {
          this.keyboardFocus=false;this.resumeFocusNode=null;
        }
        this.reconcileMotion();
      });
    });
    this.listen(this.root,'pointerenter',event=>{
      if(event.pointerType==='mouse') {this.hovered=true;this.hoverOverride=false;this.reconcileMotion()}
    });
    this.listen(this.scene,'pointerdown',event=>this.beginGesture(event));
    this.listen(this.scene,'pointerup',event=>this.endGesture(event));
    this.listen(this.scene,'pointercancel',()=>{this.down=null});
    this.listen(this.root,'pointermove',event=>this.onPointerMove(event));
    this.listen(this.root,'pointerleave',()=>{
      this.hovered=false;this.hoverOverride=false;this.director.parallax(0,0);this.down=null;
      if(!this.details.pinned)this.details.clear();
      this.reconcileMotion();
    });
    this.listen(this.scene,'wheel',event=>{
      if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)||Math.abs(event.deltaX)<15)return;
      event.preventDefault();const now=performance.now();
      if(now-this.wheelAt>650) {this.wheelAt=now;this.step(event.deltaX>0?1:-1)}
    },{passive:false});
    this.listen(document,'visibilitychange',()=>{
      if(document.hidden)this.director.settle();
      this.reconcileMotion();
    });
    this.listen(window,'blur',()=>{this.windowActive=false;this.reconcileMotion()});
    this.listen(window,'focus',()=>{this.windowActive=true;this.reconcileMotion()});
    this.listen(this.reduced,'change',()=>{
      if(this.reduced.matches) {this.playing=false;this.director.settle()}
      this.reconcileMotion();
    });
    this.listen(window,'scroll',()=>{if(this.details.inspecting)this.details.position()},{passive:true});
    this.listen(this.root,'vesa:destroy',()=>this.destroy());
    this.observeLayout();this.startPromise=this.render(1,true);return this.startPromise;
  }
  /** Select a safely rendered index result. Searching may cross the current group. */
  chooseIndexItem(event) {
    const button=event.target.closest('.index-item');
    if(!button||!this.grid.contains(button)||!this.catalogue.get(button.dataset.id))return;
    const item=this.catalogue.get(button.dataset.id);
    const group=this.state.group==='all'||this.state.group===item.group?this.state.group:'all';
    this.dialog.close();this.select(group,item.id);
  }
  /**
   * Select a neighboring model without inspecting its clothing. Move focus to the
   * persistent scene before the transient side button is removed during a render.
   */
  chooseNeighbor(event) {
    const button=event.target.closest('.side-model[data-select-id]');
    if(!button||!this.scene.contains(button)||this.destroyed)return;
    const id=button.dataset.selectId;
    if(!this.catalogue.get(id))return;
    event.preventDefault();this.down=null;this.details.clear();
    this.scene.focus({preventScroll:true});
    const direction=Number(button.dataset.pos)<0?-1:1;
    this.select(this.state.group,id,direction);
  }
  /**
   * Observe viewport/layout boundaries. Offscreen and held scenes have no RAF clock.
   * Static annotations are positioned only when a relevant layout/scroll changes.
   */
  observeLayout() {
    if(typeof ResizeObserver==='function') {
      this.resizeObserver=new ResizeObserver(()=>{
        if(!this.destroyed&&this.details.inspecting)this.details.position();
      });
      this.resizeObserver.observe(this.root);this.resizeObserver.observe(this.scene);
    }
    if(typeof IntersectionObserver==='function') {
      this.intersectionObserver=new IntersectionObserver(entries=>{
        const entry=entries.find(item=>item.target===this.root);
        if(!entry||this.destroyed)return;
        this.visible=entry.isIntersecting&&entry.intersectionRatio>=.1;
        if(!this.visible)this.director.settle();
        this.reconcileMotion();
      },{threshold:[0,.1]});
      this.intersectionObserver.observe(this.root);
    }
  }
  /**
   * Handle keys only in this root. Ordinary controls retain native behavior.
   * Keyboard exploration permanently pauses rotation until explicit Play. Space
   * on the scene and activation of Play keep their actual toggle semantics.
   */
  onKeyDown(event) {
    if(event.defaultPrevented)return;
    this.inputMode='keyboard';
    const control=event.target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="textbox"]');
    const playActivation=event.target===this.root.querySelector('#play')&&
      (event.key==='Enter'||event.code==='Space'||event.key===' ');
    if(playActivation)return;
    if(!this.dialog.open&&!control&&event.code==='Space') {
      event.preventDefault();this.togglePlay();return;
    }
    this.resumeFocusNode=null;this.keyboardFocus=true;this.playing=false;this.hoverOverride=false;
    this.reconcileMotion();
    if(this.dialog.open)return;
    if(event.key==='Escape') {this.details.clear();this.reconcileMotion();return}
    if(control)return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft') {
      event.preventDefault();this.step(event.key==='ArrowRight'?1:-1);
    }
  }
  /** Capture main-area gestures; side buttons, controls and vertical scrolling stay native. */
  beginGesture(event) {
    if(event.target.closest('button, input, textarea, select, a'))return;
    this.down={x:event.clientX,y:event.clientY,id:event.pointerId};
    if(typeof this.scene.setPointerCapture==='function')this.scene.setPointerCapture(event.pointerId);
  }
  /** Resolve a dominant horizontal swipe or a tap on the decoded main model only. */
  endGesture(event) {
    if(!this.down||this.down.id!==event.pointerId)return;
    const dx=event.clientX-this.down.x,dy=event.clientY-this.down.y;this.down=null;
    if(this.scene.hasPointerCapture?.(event.pointerId))this.scene.releasePointerCapture(event.pointerId);
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)this.step(dx<0?1:-1);
    else if(Math.abs(dx)<12&&Math.abs(dy)<12&&this.director.ready) {
      this.details.tap(event);this.reconcileMotion();
    }
  }
  /** Use settled central geometry for mouse labels; side previews are navigation only. */
  onPointerMove(event) {
    if(event.pointerType!=='mouse'||this.dialog.open)return;
    const rect=this.scene.getBoundingClientRect();
    this.director.parallax((event.clientX-rect.left)/rect.width*2-1,(event.clientY-rect.top)/rect.height*2-1);
    if(event.target.closest('.side-model')) {
      if(!this.details.pinned)this.details.clear();
    } else if(!this.down&&this.director.ready)this.details.hover(event);
    this.reconcileMotion();
  }
  /**
   * Render a selection and its reviewed neighbors. Persistent garment controls
   * retain focus, including when a one-piece item hides Top/Bottom. A render token
   * prevents stale asynchronous arrivals from changing playback or annotation state.
   * Resolves true only if this version's central model became ready.
   */
  render(direction=1,initial=false) {
    if(this.destroyed)return Promise.resolve(false);
    const version=++this.renderVersion,current=this.state.current,index=this.state.index,count=this.state.items.length;
    const focused=document.activeElement,focusedZone=this.root.querySelector('#garment-switch').contains(focused);
    const arrival=this.director.show(current,this.state.neighborhood(),direction,initial);
    this.details.update(current);
    if(focusedZone&&(focused.hidden||!focused.isConnected)) {
      const replacement=this.root.querySelector('#garment-switch button:not([hidden])');
      (replacement||this.scene).focus({preventScroll:true});
    }
    this.root.querySelector('#count').textContent=String(index+1).padStart(2,'0');
    this.root.querySelector('#total').textContent=' / '+count;
    for(const [group,button]of this.buttons) {
      button.classList.toggle('active',group===this.state.group);
      button.setAttribute('aria-pressed',String(group===this.state.group));
    }
    const announcement=this.root.querySelector('#announcement');
    announcement.setAttribute('aria-live',this.playing&&!this.keyboardFocus?'off':'polite');
    announcement.textContent=current.name+', product '+(index+1)+' of '+count;
    this.elapsed=0;this.updateProgress();this.reconcileMotion();
    if(this.onSelection)this.onSelection(this.selection);
    return Promise.resolve(arrival).then(ready=>{
      if(this.destroyed||version!==this.renderVersion)return false;
      if(this.details.inspecting)this.details.position();
      this.reconcileMotion();
      if(this.onSettled)this.onSettled(Boolean(ready),this.selection);
      return Boolean(ready);
    });
  }
  /** Advance circularly in the selected group without changing the source catalogue. */
  step(direction) {
    if(this.destroyed)return;
    this.state.step(direction);return this.render(direction);
  }
  /** Select a group; repeated activation does not replay its current image. */
  group(group) {
    if(group!==this.state.group)return this.select(group);
    return false;
  }
  /**
   * Apply a validated route or neighbor selection, atomically. An item outside the
   * requested group is rejected rather than silently opening a different category.
   * Before start this only initializes state; afterward it renders changed selections.
   */
  select(group,id=null,direction=1) {
    if(this.destroyed||!Object.hasOwn(this.catalogue.groups,group))return false;
    const record=id?this.catalogue.get(id):null;
    if(id&&(!record||(group!=='all'&&record.group!==group)))return false;
    const before=this.selection;
    this.state.selectGroup(group);
    if(record)this.state.selectId(record.id);
    const changed=before.group!==this.state.group||before.item!==this.state.current.id;
    if(this.started&&changed)this.render(direction);
    return true;
  }
  /**
   * Hold the viewer while a parent modal is active. This does not overwrite an
   * explicit Play/Pause choice. Hidden views settle and discard any pointer gesture.
   */
  setSuspended(value) {
    if(this.destroyed||typeof value!=='boolean')return;
    this.externalSuspended=value;
    if(value) {this.down=null;this.director.settle()}
    this.reconcileMotion();
  }
  /**
   * Explicit Play clears inspection and keyboard holds. It may override the current
   * hover/focus until the next hover entry, pointer action or keyboard navigation.
   * Pause settles in-flight animation without disabling future manual transitions.
   */
  togglePlay() {
    this.playing=!this.playing;this.elapsed=0;
    if(this.playing) {
      this.details.clear();this.keyboardFocus=false;
      this.resumeFocusNode=document.activeElement;this.hoverOverride=this.hovered;
      this.windowActive=true;
    } else this.director.settle();
    this.updateProgress();this.reconcileMotion();
  }
  /** Compute effective playback; parent suspension and visibility always win. */
  get canRun() {
    return this.started&&!this.destroyed&&this.playing&&!document.hidden&&this.windowActive&&
      this.visible&&!this.externalSuspended&&!this.dialog.open&&!this.keyboardFocus&&
      (!this.hovered||this.hoverOverride)&&!this.details.inspecting&&this.director.ready;
  }
  /** Keep the control's accessible name aligned to the user's playback preference. */
  syncPlay() {
    const button=this.root.querySelector('#play');
    button.setAttribute('aria-label',this.playing?'Pause slideshow':'Play slideshow');
    button.title=this.playing&&!this.canRun?'Slideshow held while you inspect or navigate':
      (this.playing?'Pause slideshow':'Play slideshow');
    this.root.querySelector('#play-icon').setAttribute('d',this.playing?'M9 5v14M15 5v14':'M8 5l12 7-12 7z');
  }
  /** Reconcile pause reasons centrally. A held viewer retains no recurring RAF. */
  reconcileMotion() {
    if(this.destroyed)return;
    const running=this.canRun;
    this.director.setAmbientPaused(!running);
    this.root.dataset.playback=this.playing?(running?'playing':'held'):'paused';this.syncPlay();
    if(!running) {if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0}
    else if(!this.frame)this.frame=requestAnimationFrame(time=>this.tick(time));
  }
  /** Paint a compositor-friendly timeline; no per-frame layout measurement is needed. */
  updateProgress() {
    this.progress.style.width='100%';this.progress.style.transformOrigin='left center';
    this.progress.style.transform='scaleX('+Math.min(1,this.elapsed/this.duration)+')';
  }
  /** Run one eligible clock frame. New slide dwell time begins after image settlement. */
  tick(now) {
    this.frame=0;
    if(!this.canRun) {this.reconcileMotion();return}
    const delta=this.last?Math.min(now-this.last,100):0;this.last=now;this.elapsed+=delta;
    if(this.elapsed>=this.duration)this.step(1);
    else {this.updateProgress();this.frame=requestAnimationFrame(time=>this.tick(time))}
  }
  /** Open the local catalogue dialog after settling the main image and clearing details. */
  openIndex() {
    this.director.settle();this.details.clear();this.search.value='';this.renderIndex('');
    if(!this.dialog.open)this.dialog.showModal();
    this.search.focus();this.reconcileMotion();
  }
  /**
   * Render names as text and load thumbnails lazily. Delegated selection avoids
   * retaining listeners on cards discarded by a search, and empty searches stay local.
   */
  renderIndex(query) {
    const found=this.catalogue.search(query);this.grid.replaceChildren();
    this.root.querySelector('#empty').hidden=found.length>0;
    for(const item of found) {
      const button=document.createElement('button');button.type='button';button.className='index-item';button.dataset.id=item.id;
      const image=document.createElement('img');image.src=item.image;image.alt='';image.loading='lazy';image.decoding='async';
      const code=document.createElement('small');code.textContent=item.id+' / '+this.catalogue.groups[item.group];
      const name=document.createElement('b');name.textContent=item.name;
      button.append(image,code,name);this.grid.append(button);
    }
  }
  /** Idempotently release all local runtime resources; catalogue and host DOM stay intact. */
  destroy() {
    if(this.destroyed)return;
    this.destroyed=true;this.renderVersion++;this.events.abort();
    if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;
    this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();
    if(this.dialog.open)this.dialog.close();
    this.details.destroy();this.director.destroy();this.buttons.clear();
    this.onSelection=null;this.onSettled=null;
  }
}
