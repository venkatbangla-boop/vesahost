/**
 * Chess Beast 360 — visual animation, mobile pointer interaction and effects.
 *
 * Owner: UI only. ChessEngine exclusively owns rules/legal move state, and
 * ChessBeastSearchCoordinator exclusively owns AI. This class owns disposable
 * gesture/floating visual state and the user's visual-effect preference.
 * No saved chess-game keys, move history or clock data are written here.
 */
'use strict';
class ChessBeastVisualController {
  constructor({board,onDrop,canMove,onSelect}) {
    this.board=board;
    this.onDrop=onDrop;
    this.canMove=canMove;
    this.onSelect=onSelect;
    this.pointerId=null;
    this.start=null;
    this.origin=null;
    this.ghost=null;
    this.suppressClickUntil=0;
    this.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.coarsePointer=window.matchMedia('(pointer: coarse)');
    this.storageKey='chess_beast_effects_v2';
    this.effectMode=this.restoreEffectMode();
    this.installTouchHandlers();
    this.installKeyboardHandlers();
    this.installPreferences();
  }
  restoreEffectMode(){
    try{
      const stored=window.localStorage.getItem(this.storageKey);
      if(['off','subtle','full'].includes(stored))return stored;
    }catch{}
    return this.coarsePointer.matches||this.reducedMotion.matches?'off':'subtle';
  }
  installPreferences(){
    const parent=document.querySelector('.topbar-right-tools');
    if(!parent)return;
    const box=document.createElement('label');
    box.className='beast-fx-control';
    const title=document.createElement('span');
    title.textContent='Motion';
    const select=document.createElement('select');
    select.setAttribute('aria-label','Move animation and visual effects');
    select.id='beastFxMode';
    for(const [value,label] of [['off','Minimal'],['subtle','Smooth'],['full','Expressive']]){
      const option=document.createElement('option');
      option.value=value;option.textContent=label;select.appendChild(option);
    }
    select.value=this.effectMode;
    select.addEventListener('change',()=>{
      this.effectMode=select.value;
      try{localStorage.setItem(this.storageKey,this.effectMode)}catch{}
    });
    box.append(title,select);
    parent.append(box);
  }
  installTouchHandlers(){
    // Event delegation survives the legacy board's 64-square DOM rerenders.
    this.board.addEventListener('pointerdown',event=>{
      if(!['touch','pen'].includes(event.pointerType)||!event.isPrimary)return;
      const square=event.target.closest('[data-sq]');
      if(!square||!this.canMove(Number(square.dataset.sq)))return;
      this.pointerId=event.pointerId;
      this.origin=Number(square.dataset.sq);
      this.start={x:event.clientX,y:event.clientY,rect:square.getBoundingClientRect(),square};
    },{passive:true});
    this.board.addEventListener('pointermove',event=>{
      if(this.pointerId!==event.pointerId||!this.start)return;
      if(!this.ghost){
        const delta=Math.hypot(event.clientX-this.start.x,event.clientY-this.start.y);
        if(delta<10)return;
        const svg=this.start.square.querySelector('.piece-svg');
        if(!svg)return;
        this.ghost=document.createElement('div');
        this.ghost.className='beast-drag-ghost';
        this.ghost.style.width=this.start.rect.width+'px';
        this.ghost.style.height=this.start.rect.height+'px';
        this.ghost.appendChild(svg.cloneNode(true));
        document.body.appendChild(this.ghost);
        this.start.square.classList.add('touch-dragging');
      }
      this.placeGhost(event.clientX,event.clientY);
      if(event.cancelable)event.preventDefault();
    },{passive:false});
    this.board.addEventListener('pointerup',event=>{
      if(this.pointerId!==event.pointerId)return;
      const moved=!!this.ghost,from=this.origin;
      this.resetPointer();
      if(!moved)return; // Native tap-to-select stays unchanged.
      this.suppressClickUntil=performance.now()+360;
      const hit=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-sq]');
      if(hit&&this.board.contains(hit)){
        const to=Number(hit.dataset.sq);
        if(from!==to)this.onDrop(from,to);
      }
    });
    this.board.addEventListener('pointercancel',()=>this.resetPointer());
    this.board.addEventListener('click',event=>{
      if(performance.now()<this.suppressClickUntil){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },true);
  }
  placeGhost(x,y){
    if(!this.ghost||!this.start)return;
    const w=this.start.rect.width;
    this.ghost.style.left=(x-w/2)+'px';
    this.ghost.style.top=(y-w/2)+'px';
  }
  resetPointer(){
    if(this.ghost)this.ghost.remove();
    if(this.start?.square?.isConnected)this.start.square.classList.remove('touch-dragging');
    this.ghost=null;this.start=null;this.origin=null;this.pointerId=null;
  }
  installKeyboardHandlers(){
    this.board.addEventListener('keydown',event=>{
      const current=event.target.closest('.square');
      if(!current)return;
      const cells=Array.from(this.board.children);
      const idx=cells.indexOf(current);
      if(idx<0)return;
      let next=idx;
      if(event.key==='ArrowLeft')next=idx-1;
      else if(event.key==='ArrowRight')next=idx+1;
      else if(event.key==='ArrowUp')next=idx-8;
      else if(event.key==='ArrowDown')next=idx+8;
      else if(event.key==='Enter'||event.key===' '){
        event.preventDefault();this.onSelect(Number(current.dataset.sq));return;
      }else return;
      event.preventDefault();
      const target=cells[next];
      if(target)target.focus({preventScroll:true});
    });
  }
  prepareMove(move){
    // FLIP overlay is independent of game logic and never blocks next turn.
    if(this.effectMode==='off'||this.reducedMotion.matches)return null;
    const from=this.board.querySelector('[data-sq="'+move.from+'"]');
    const to=this.board.querySelector('[data-sq="'+move.to+'"]');
    const svg=from?.querySelector('.piece-svg');
    if(!from||!to||!svg)return null;
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
    if(a.width<8||b.width<8)return null;
    const flyer=document.createElement('div');
    flyer.className='beast-flyer';
    flyer.style.left=a.left+'px';flyer.style.top=a.top+'px';
    flyer.style.width=a.width+'px';flyer.style.height=a.height+'px';
    flyer.appendChild(svg.cloneNode(true));
    const dx=b.left-a.left,dy=b.top-a.top;
    return ()=>{
      if(!this.board.isConnected)return;
      document.body.appendChild(flyer);
      const dest=this.board.querySelector('[data-sq="'+move.to+'"] .piece-svg');
      if(dest)dest.style.opacity='0';
      const duration=this.effectMode==='full'?188:138;
      const animation=flyer.animate([
        {transform:'translate3d(0,0,0) scale(1)',opacity:1},
        {transform:'translate3d('+dx+'px,'+dy+'px,0) scale(.98)',opacity:.95}
      ],{duration,easing:'cubic-bezier(.22,.8,.27,1)',fill:'forwards'});
      const cleanup=()=>{
        flyer.remove();
        if(dest?.isConnected)dest.style.opacity='';
      };
      animation.finished.then(cleanup,cleanup);
      setTimeout(cleanup,duration+500);
    };
  }
}
window.ChessBeastVisualController=ChessBeastVisualController;
