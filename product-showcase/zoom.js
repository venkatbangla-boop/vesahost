/**
 * ProductZoom owns one temporary, full-viewport garment inspection surface.
 * Access: ShowcaseBootstrap creates one instance for its document; open(record)
 * accepts only an already-validated catalogue record and returns a boolean.
 * It never changes slideshow/catalogue/history, persists data, or fetches remote
 * images. State is confined to zoom scale (1..4), pan offset and active pointers.
 * Pointer capture and event listeners end on close/destroy. The parent iframe
 * bridge remains responsible for showing a browser-viewport-sized host dialog.
 */
class ProductZoom {
  /** Attach one local modal, with separate state for each open/close lifecycle. */
  constructor(root,{onClose=null}={}) {
    this.root=root;this.dialog=root.querySelector('#zoom-dialog');
    this.surface=root.querySelector('#zoom-surface');
    this.image=root.querySelector('#zoom-image');
    this.closeButton=root.querySelector('#zoom-close');
    this.events=new AbortController();
    this.onClose=typeof onClose==='function'?onClose:null;
    this.level=1;this.x=0;this.y=0;this.pointers=new Map();
    this.pinch=null;this.drag=null;this.lastTap=null;this.destroyed=false;
    this.hdFallback=null;
    this.listen(this.closeButton,'click',()=>this.dialog.close());
    this.listen(this.dialog,'close',()=>this.finished());
    // A missing or undecodable zoom copy must not strand the original garment.
    this.listen(this.image,'error',()=>{
      const original=this.hdFallback;
      if(!this.dialog.open||!original||
          this.image.getAttribute('src')!==original.replace('/assets/','/hd-assets/'))return;
      this.hdFallback=null;
      this.image.src=original;
    });
    this.listen(this.surface,'pointerdown',event=>this.pointerDown(event));
    this.listen(this.surface,'pointermove',event=>this.pointerMove(event));
    this.listen(this.surface,'pointerup',event=>this.pointerEnd(event));
    this.listen(this.surface,'pointercancel',event=>this.pointerEnd(event,true));
    this.listen(this.surface,'dblclick',event=>{
      if(event.sourceCapabilities?.firesTouchEvents)return;
      this.zoomAt(this.level>1.1?1:2,event.clientX,event.clientY);
    });
    this.listen(this.surface,'wheel',event=>{
      if(!this.dialog.open)return;
      event.preventDefault();
      this.zoomAt(this.level*Math.exp(-event.deltaY*.002),event.clientX,event.clientY);
    },{passive:false});
    this.listen(window,'resize',()=>this.clampAndPaint(),{passive:true});
  }
  /** Bind listeners to the owner's abort signal so detached frames cannot retain them. */
  listen(target,type,handler,options={}) {
    target.addEventListener(type,handler,{...options,signal:this.events.signal});
  }
  /** Open only reviewed first-party WebP image paths, never an arbitrary URL. */
  open(record) {
    if(this.destroyed||!record||!/^\/product-showcase\/assets\/[MLK]\d{2}\.webp$/.test(record.image))return false;
    if(this.dialog.open)return true;
    this.reset();
    // Only the 91 reviewed legacy IDs have HD copies. Native K29-K58 stay unchanged.
    const [,group,digits]=record.image.match(/\/([MLK])(\d{2})\.webp$/);
    const number=Number(digits);
    const legacy=number>=1&&number<=({M:34,L:29,K:28}[group]);
    this.hdFallback=legacy?record.image:null;
    this.image.src=legacy?record.image.replace('/assets/','/hd-assets/'):record.image;
    this.image.alt=record.name+' garment, zoomable full-screen view';
    this.surface.setAttribute('aria-label','Zoom '+record.name+'. Pinch or double tap to enlarge; drag to inspect.');
    this.dialog.showModal();
    this.surface.focus({preventScroll:true});
    return true;
  }
  /** Clear per-photo pan, scale and gesture ownership on every new inspection. */
  reset() {
    this.level=1;this.x=0;this.y=0;this.pinch=null;this.drag=null;
    this.pointers.clear();this.lastTap=null;this.hdFallback=null;this.paint();
  }
  /** Render compositor-only transforms; no layout work occurs on animation frames. */
  paint() {
    this.image.style.transform='translate3d('+this.x+'px,'+this.y+'px,0) scale('+this.level+')';
    this.surface.dataset.zoomed=this.level>1.001?'true':'false';
  }
  /** Bound panning within the magnified viewport so the model cannot be lost. */
  clampAndPaint() {
    const rect=this.surface.getBoundingClientRect();
    const mx=Math.max(0,(this.level-1)*rect.width/2);
    const my=Math.max(0,(this.level-1)*rect.height/2);
    this.x=Math.max(-mx,Math.min(mx,this.x));this.y=Math.max(-my,Math.min(my,this.y));
    this.paint();
  }
  /**
   * Zoom around a screen-space focal point. Preserve the image coordinate under
   * the pointer, then clamp; 1x always recenters without adding a reset control.
   */
  zoomAt(next,clientX,clientY) {
    if(!this.dialog.open)return;
    const rect=this.surface.getBoundingClientRect(),prior=this.level;
    this.level=Math.max(1,Math.min(4,next));
    if(this.level<=1.001){this.level=1;this.x=0;this.y=0;}
    else {
      const fx=clientX-rect.left-rect.width/2,fy=clientY-rect.top-rect.height/2;
      const ratio=this.level/prior;
      this.x=fx+(this.x-fx)*ratio;this.y=fy+(this.y-fy)*ratio;
    }
    this.clampAndPaint();
  }
  /** Create a new pinch anchor from two owned active pointers. */
  pinchAnchor() {
    const [a,b]=[...this.pointers.values()];
    if(!a||!b)return null;
    return {distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),level:this.level};
  }
  /** Capture only pointers on the zoom surface, never buttons or page navigation. */
  pointerDown(event) {
    if(!this.dialog.open||event.button>0)return;
    this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(this.surface.setPointerCapture)this.surface.setPointerCapture(event.pointerId);
    if(this.pointers.size===2){this.pinch=this.pinchAnchor();this.drag=null;this.lastTap=null;}
    else if(this.pointers.size===1){
      this.drag={x:event.clientX,y:event.clientY,panX:this.x,panY:this.y};
    }
  }
  /** Two fingers pinch; one finger drags only after enlargement. */
  pointerMove(event) {
    if(!this.dialog.open||!this.pointers.has(event.pointerId))return;
    this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(this.pointers.size>=2&&this.pinch) {
      const [a,b]=[...this.pointers.values()];
      const distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
      this.zoomAt(this.pinch.level*distance/this.pinch.distance,(a.x+b.x)/2,(a.y+b.y)/2);
    } else if(this.pointers.size===1&&this.drag&&this.level>1) {
      this.x=this.drag.panX+event.clientX-this.drag.x;
      this.y=this.drag.panY+event.clientY-this.drag.y;
      this.clampAndPaint();
    }
    if(event.cancelable)event.preventDefault();
  }
  /** Release gesture state safely; touch double-tap toggles 2x/1x. */
  pointerEnd(event,cancelled=false) {
    const initial=this.pointers.get(event.pointerId);
    if(!initial)return;
    const moved=this.drag?Math.hypot(event.clientX-this.drag.x,event.clientY-this.drag.y):999;
    const wasPinching=this.pinch!==null;
    this.pointers.delete(event.pointerId);
    if(this.surface.hasPointerCapture?.(event.pointerId))this.surface.releasePointerCapture(event.pointerId);
    if(wasPinching) {
      this.pinch=null;this.lastTap=null;
      const rest=[...this.pointers.values()][0];
      this.drag=rest?{...rest,panX:this.x,panY:this.y}:null;
      return;
    }
    if(this.pointers.size===0) {
      this.drag=null;
      if(!cancelled&&event.pointerType==='touch'&&moved<15) {
        const now=performance.now();
        if(this.lastTap&&now-this.lastTap.at<380&&
           Math.hypot(event.clientX-this.lastTap.x,event.clientY-this.lastTap.y)<38){
          this.zoomAt(this.level>1.1?1:2,event.clientX,event.clientY);this.lastTap=null;
        } else this.lastTap={x:event.clientX,y:event.clientY,at:now};
      }
    }
  }
  /** Native dialog close (button/Escape) restores the parent without changing the item. */
  finished() {
    this.reset();this.image.removeAttribute('src');
    if(!this.destroyed)this.onClose?.();
  }
  /** Abort all events and restore an inert closed surface during frame teardown. */
  destroy() {
    if(this.destroyed)return;
    this.destroyed=true;this.events.abort();
    if(this.dialog.open)this.dialog.close();
    this.onClose=null;this.reset();this.image.removeAttribute('src');
  }
}
