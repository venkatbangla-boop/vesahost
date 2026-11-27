/**
 * SceneDirector owns the three-layer model stage: one inspectable centre image and
 * two adjacent navigation previews. MotionExperience supplies immutable records;
 * this owner never changes selection. Pending image work is versioned, and only the
 * latest successful central decode may expose garment hit targets or finish motion.
 */
class SceneDirector {
  /**
   * Bind one iframe-local root and reduced-motion query; construction starts no
   * animation. show() owns the stage lifecycle, settle() finishes a transition, and
   * destroy() invalidates pending decodes and releases the retained DOM/animations.
   */
  constructor(root, reduced) {
    this.root=root; this.reduced=reduced;
    this.stage=root.querySelector('#actor-stage'); this.scene=root.querySelector('#scene');
    this.active=null; this.animations=[]; this.version=0;
    this.ready=false; this.decoded=false; this.destroyed=false;
    this.ambientPaused=false; this.settleRequested=false;
    this.directions=Object.freeze({
      men:{rgb:'158,154,137',chapter:"Men's apparel"},
      ladies:{rgb:'178,155,145',chapter:"Ladies' apparel"},
      boys:{rgb:'148,162,174',chapter:"Boys' apparel"},
      girls:{rgb:'174,157,168',chapter:"Girls' apparel"},
      baby:{rgb:'183,167,137',chapter:'Baby apparel'}
    });
  }
  /**
   * Build a detached cast from a main record and the immediately adjacent records.
   * Preview buttons expose only selection IDs; the controller handles navigation.
   * Each asset remains one individual model. Main-only .hero is the detail contract.
   */
  makeCast(record, neighbors) {
    const cast=document.createElement('div'); cast.className='cast active';
    const entries=[...neighbors.filter(entry=>Math.abs(entry.pos)===1),{item:record,pos:0}];
    const seen=new Set();
    for(const {item,pos} of entries) {
      if(!item||seen.has(item.id))continue;
      seen.add(item.id);
      const actor=document.createElement(pos===0?'div':'button');
      actor.className=pos===0?'actor hero':'actor side-model';
      actor.dataset.id=item.id; actor.dataset.pos=String(pos);
      if(pos!==0) {
        actor.type='button'; actor.dataset.selectId=item.id;
        actor.setAttribute('aria-label',`${pos<0?'Previous':'Next'} product: ${item.name}`);
        actor.title=item.name; actor.dataset.imageReady='false';
      }
      const image=document.createElement('img'); image.src=item.image;
      image.alt=pos===0?item.name+' model':'';
      image.draggable=false; image.decoding='async';
      actor.append(image); cast.append(actor);
    }
    return cast;
  }
  /** Cancel retained WAAPI handles; stylesheet positions are their final resting poses. */
  cancelAnimations() {
    for(const animation of this.animations)animation.cancel();
    this.animations=[];
  }
  /**
   * Snapshot only the previous cast's computed poses before replacing its nodes.
   * All actor boxes share the same base dimensions, so matching IDs can interpolate
   * from their previous transform without measuring or reshaping the original asset.
   */
  previousPoses() {
    const poses=new Map();
    for(const actor of this.active?.querySelectorAll('.actor')||[]) {
      const image=actor.querySelector('img');
      const actorStyle=getComputedStyle(actor), imageStyle=getComputedStyle(image);
      poses.set(actor.dataset.id,{
        transform:actorStyle.transform, opacity:imageStyle.opacity, filter:imageStyle.filter
      });
    }
    return poses;
  }
  /**
   * Decode a preview independently. Slow or failed neighbours never hold the main
   * product hostage; a failed preview is hidden and disabled instead of showing a
   * broken-image icon. Version checks prevent late callbacks touching a newer cast.
   */
  preparePreview(actor, version) {
    const image=actor.querySelector('img');
    image.decode().then(()=>{
      if(this.destroyed||version!==this.version)return;
      actor.dataset.imageReady='true';
    }).catch(()=>{
      if(this.destroyed||version!==this.version)return;
      actor.hidden=true; actor.disabled=true;
    });
  }
  /**
   * Display one record and its neighbours; resolves true only for the latest settled
   * central image. Matching IDs move between side and centre in a 600ms transition.
   * Source data, image pixels and user play preference are never modified. Failed main
   * decoding produces a readable local error; later selection can recover normally.
   */
  async show(record, neighbors=[], direction=1, initial=false) {
    if(this.destroyed)return false;
    const version=++this.version;
    this.cancelAnimations();
    const previous=this.previousPoses();
    this.ready=false; this.decoded=false; this.settleRequested=false;
    if(this.active) {
      this.active.classList.remove('active');
      for(const button of this.active.querySelectorAll('.side-model'))button.disabled=true;
    }
    this.root.dataset.sceneReady='false'; this.stage.setAttribute('aria-busy','true');
    const next=this.makeCast(record,neighbors), image=next.querySelector('.hero img');
    const art=this.directions[record.group];
    this.root.style.setProperty('--scene-rgb',art.rgb);
    this.root.querySelector('#chapter').textContent=art.chapter;
    this.root.querySelector('#style-id').textContent=record.id;
    this.root.querySelector('#style-name').textContent=record.name;
    for(const actor of next.querySelectorAll('.side-model'))this.preparePreview(actor,version);
    try { await image.decode(); }
    catch(error) {
      if(version!==this.version||this.destroyed)return false;
      this.active=null;
      const message=document.createElement('p'); message.className='scene-error';
      message.setAttribute('role','status');
      message.textContent='Image unavailable. Please select another product.';
      this.stage.replaceChildren(message); this.stage.setAttribute('aria-busy','false');
      return false;
    }
    if(version!==this.version||this.destroyed)return false;
    this.stage.replaceChildren(next); this.active=next; this.decoded=true;
    if(!initial&&!this.reduced.matches&&!this.settleRequested&&typeof next.animate==='function') {
      const sign=direction<0?-1:1;
      for(const actor of next.querySelectorAll('.actor')) {
        const img=actor.querySelector('img'), pos=Number(actor.dataset.pos);
        const actorStyle=getComputedStyle(actor), imageStyle=getComputedStyle(img);
        const end={transform:actorStyle.transform,opacity:imageStyle.opacity,filter:imageStyle.filter};
        const from=previous.get(actor.dataset.id)||{
          transform:pos===0?`translateX(${sign*22}px) scale(.97)`:`translateX(${pos*110}%) translateY(-20px) scale(.62)`,
          opacity:'0',filter:end.filter
        };
        const options={duration:600,easing:'cubic-bezier(.22,.72,.2,1)',fill:'both'};
        this.animations.push(actor.animate([{transform:from.transform},{transform:end.transform}],options));
        this.animations.push(img.animate([
          {opacity:from.opacity,filter:from.filter},{opacity:end.opacity,filter:end.filter}
        ],options));
      }
      await Promise.allSettled(this.animations.map(animation=>animation.finished));
    }
    if(version!==this.version||this.destroyed)return false;
    this.settle(); return true;
  }
  /**
   * Finish the active transition immediately. An unresolved decode remains unready;
   * its current token is retained so it can finish without starting another entrance.
   */
  settle() {
    this.settleRequested=true; this.cancelAnimations();
    if(this.destroyed||!this.decoded)return;
    this.ready=true; this.root.dataset.sceneReady='true'; this.stage.setAttribute('aria-busy','false');
  }
  /** Pause background lighting/parallax independently of catalogue and play preference. */
  setAmbientPaused(paused) {
    this.ambientPaused=paused||this.reduced.matches;
    this.root.dataset.motionPaused=String(this.ambientPaused);
    if(this.ambientPaused) {
      this.root.style.setProperty('--px','0px'); this.root.style.setProperty('--py','0px');
    }
  }
  /** React with the background only; the selected model keeps stable alpha-hit geometry. */
  parallax(x,y) {
    if(this.destroyed||this.reduced.matches||this.ambientPaused)return;
    this.root.style.setProperty('--px',`${Math.max(-1,Math.min(1,x))*7}px`);
    this.root.style.setProperty('--py',`${Math.max(-1,Math.min(1,y))*4}px`);
  }
  /** Idempotently invalidate image callbacks and release owned animation/DOM resources. */
  destroy() {
    if(this.destroyed)return;
    this.destroyed=true; this.version++; this.ready=false;
    this.cancelAnimations(); this.setAmbientPaused(true); this.stage.replaceChildren(); this.active=null;
  }
}
