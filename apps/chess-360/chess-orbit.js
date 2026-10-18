/**
 * Chess Beast 360 — lightweight, offline CSS 3D camera.
 *
 * A deliberate "Rotate board" mode prevents orbit gestures from stealing
 * chess piece moves. Alt + primary-button drag is the desktop shortcut.
 * No WebGL, remote resources, animation loops or saved game data.
 */
(function(){
  'use strict';
  const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
  const norm=n=>((n%360)+360)%360;
  class ChessBeastOrbitController {
    constructor(options){
      this.frame=options.frame;
      this.toolbar=options.toolbar;
      this.modeButton=options.modeButton;
      this.resetButton=options.resetButton;
      this.showcaseButton=options.showcaseButton;
      this.quickModeButton=document.getElementById('btnCameraQuickRotate');
      this.quickShowcaseButton=document.getElementById('btnCameraQuickShowcase');
      this.quickResetButton=document.getElementById('btnCameraQuickReset');
      this.leftButton=options.leftButton;
      this.rightButton=options.rightButton;
      this.readout=options.readout;
      this.tiltSlider=options.tiltSlider;
      this.tiltLabel=options.tiltLabel;
      this.key='chess_beast_orbit_camera_v1';
      this.state={tilt:26,yaw:0,spin:0};
      this.dragMode=false;
      this.pointer=null;
      this.activeId=null;
      this.suppressClickUntil=0;
      this.raf=0;
      this.is3D=false;
      this.load();
      this.install();
      this.render();
      this.sync3D();
    }
    load(){
      try{
        const data=JSON.parse(localStorage.getItem(this.key)||'null');
        if(data && Number.isFinite(Number(data.tilt))&&Number.isFinite(Number(data.yaw))&&Number.isFinite(Number(data.spin))){
          this.state={tilt:clamp(Number(data.tilt),0,65),yaw:norm(Number(data.yaw)),spin:norm(Number(data.spin))};
        }
      }catch{}
    }
    save(){try{localStorage.setItem(this.key,JSON.stringify(this.state));}catch{}}
    render(){
      this.raf=0;
      const root=document.documentElement.style;
      root.setProperty('--beast-orbit-tilt',this.state.tilt.toFixed(2)+'deg');
      root.setProperty('--beast-orbit-yaw',this.state.yaw.toFixed(2)+'deg');
      root.setProperty('--beast-orbit-spin',this.state.spin.toFixed(2)+'deg');
      if(this.readout){
        this.readout.value='Tilt '+Math.round(this.state.tilt)+'° · Orbit '+Math.round(this.state.yaw)+'° · Spin '+Math.round(this.state.spin)+'°';
        this.readout.textContent=this.readout.value;
      }
      window.dispatchEvent(new CustomEvent('chess-beast-camera-change',{detail:{...this.state}}));
      if(this.tiltSlider){this.tiltSlider.value=String(Math.round(this.state.tilt));}
      if(this.tiltLabel){this.tiltLabel.textContent=Math.round(this.state.tilt)+'°';}
      // Sync camera preset indicator after drag, spin, reload, Showcase or Reset.
      const showcase=Math.abs(this.state.tilt-48)<.1&&
        Math.abs(this.state.yaw-10)<.1&&Math.abs(this.state.spin-8)<.1;
      this.quickShowcaseButton?.setAttribute('aria-pressed',String(this.is3D&&showcase));
    }
    draw(){if(!this.raf)this.raf=requestAnimationFrame(()=>this.render());}
    sync3D(){
      this.is3D=document.body.classList.contains('board-3d');
      if(this.toolbar)this.toolbar.hidden=!this.is3D;
      if(!this.is3D){
        this.dragMode=false;this.finish();
      }
      this.syncButton();
      this.draw();
    }
    syncButton(){
      document.body.classList.toggle('beast-camera-drag-mode',this.dragMode&&this.is3D);
      this.modeButton?.setAttribute('aria-pressed',String(this.dragMode&&this.is3D));
      this.quickModeButton?.setAttribute('aria-pressed',String(this.dragMode&&this.is3D));
      if(this.quickModeButton)this.quickModeButton.title=this.dragMode&&this.is3D?
        'Rotation ON. Drag the board to orbit; tap again to move pieces.':
        'Rotation OFF. Click to orbit by mouse or touch.';
      if(this.modeButton)this.modeButton.textContent=this.dragMode&&this.is3D?'✓ Rotate: ON':'↻ Rotate board';
    }
    setMode(active){
      if(active&&!this.is3D)document.getElementById('btnToggle3D')?.click();
      this.dragMode=Boolean(active);
      if(!this.dragMode)this.finish();
      this.syncButton();
    }
    reset(){
      this.state={tilt:26,yaw:0,spin:0};
      this.quickShowcaseButton?.setAttribute('aria-pressed','false');
      this.save();this.draw();this.syncButton();
    }
    showcase(){
      // Three-quarter product-view preset, visually closer to the approved
      // wood-board demo. This changes only the camera, never the game state.
      this.state={tilt:48,yaw:10,spin:8};
      this.quickShowcaseButton?.setAttribute('aria-pressed',String(this.is3D));
      this.save();this.draw();this.syncButton();
    }
    adjust({tilt=0,yaw=0,spin=0}){
      this.state.tilt=clamp(this.state.tilt+tilt,0,65);
      this.state.yaw=norm(this.state.yaw+yaw);
      this.state.spin=norm(this.state.spin+spin);
      this.draw();
    }
    install(){
      this.modeButton?.addEventListener('click',()=>this.setMode(!this.dragMode));
      this.resetButton?.addEventListener('click',()=>this.reset());
      this.showcaseButton?.addEventListener('click',()=>this.showcase());
      this.quickModeButton?.addEventListener('click',()=>this.setMode(!this.dragMode));
      this.quickShowcaseButton?.addEventListener('click',()=>this.showcase());
      this.quickResetButton?.addEventListener('click',()=>this.reset());
      this.leftButton?.addEventListener('click',()=>{this.adjust({spin:-45});this.save();});
      this.rightButton?.addEventListener('click',()=>{this.adjust({spin:45});this.save();});
      this.tiltSlider?.addEventListener('input',e=>{
        this.state.tilt=clamp(Number(e.target.value),0,65);this.draw();this.save();
      });
      this.modeButton?.addEventListener('keydown',e=>{
        let delta=null;
        if(e.key==='ArrowLeft')delta={yaw:-15};
        else if(e.key==='ArrowRight')delta={yaw:15};
        else if(e.key==='ArrowUp')delta={tilt:-5};
        else if(e.key==='ArrowDown')delta={tilt:5};
        if(delta){e.preventDefault();this.adjust(delta);this.save();}
      });
      this.frame.addEventListener('pointerdown',event=>{
        const altDrag=event.pointerType==='mouse'&&event.button===0&&event.altKey;
        const orbitMode=this.dragMode&&this.is3D&&(event.button===0||event.pointerType==='touch'||event.pointerType==='pen');
        if(!this.is3D||!event.isPrimary||this.pointer||!(altDrag||orbitMode))return;
        // Do not interfere with a new-game overlay's Start / Setup controls.
        if(event.target.closest('button,input,select,a'))return;
        this.pointer={x:event.clientX,y:event.clientY,shift:Boolean(event.shiftKey),moved:false};
        this.activeId=event.pointerId;
        this.frame.classList.add('beast-orbit-moving');
        event.preventDefault();event.stopImmediatePropagation();
      },true);
      window.addEventListener('pointermove',event=>{
        if(this.activeId!==event.pointerId||!this.pointer)return;
        const dx=event.clientX-this.pointer.x,dy=event.clientY-this.pointer.y;
        this.pointer.x=event.clientX;this.pointer.y=event.clientY;
        this.pointer.moved=this.pointer.moved||Math.abs(dx)+Math.abs(dy)>1;
        if(event.shiftKey||this.pointer.shift){
          this.adjust({spin:dx*0.9,tilt:dy*.33});
        }else{
          this.adjust({yaw:dx*.9,tilt:dy*.33});
        }
        if(event.cancelable)event.preventDefault();
        event.stopImmediatePropagation();
      },true);
      const end=event=>{
        if(this.activeId!==event.pointerId||!this.pointer)return;
        this.suppressClickUntil=performance.now()+450;
        this.finish();this.save();
        if(event.cancelable)event.preventDefault();
        event.stopImmediatePropagation();
      };
      window.addEventListener('pointerup',end,true);
      window.addEventListener('pointercancel',end,true);
      this.frame.addEventListener('click',event=>{
        // A camera HUD button is an intentional click, not a board move.
        // When Rotate mode is ON, an unconditional capture listener would
        // swallow the very button press needed to turn Rotate OFF.
        if(event.target.closest('button,input,select,a'))return;
        if(this.is3D&&(this.dragMode||performance.now()<this.suppressClickUntil)){
          event.preventDefault();event.stopImmediatePropagation();
        }
      },true);
      this.frame.addEventListener('contextmenu',event=>{
        if(this.dragMode&&this.is3D)event.preventDefault();
      },true);
      document.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&this.dragMode)this.setMode(false);
      });
    }
    finish(){
      this.pointer=null;this.activeId=null;
      this.frame.classList.remove('beast-orbit-moving');
    }
    debug(){return Object.freeze({
      enabled:this.is3D,rotateMode:this.dragMode,...this.state
    });}
  }
  window.ChessBeastOrbitController=ChessBeastOrbitController;
})();
