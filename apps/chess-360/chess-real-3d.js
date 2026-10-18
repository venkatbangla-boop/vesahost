/* Chess Beast 360 — true offline WebGL 3D. No remote scripts or duplicate chess rules. */
(function(root){
  'use strict';
  const Model=root.ChessBeast3DGeometry,TAU=Math.PI*2;
  const norm=v=>{const q=Math.hypot(...v)||1;return v.map(n=>n/q);};
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const matMul=(a,b)=>{const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;};
  const projection=(f,aspect,near,far)=>{const k=1/Math.tan(f/2),o=new Float32Array(16);o[0]=k/aspect;o[5]=k;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=2*near*far/(near-far);return o;};
  const look=(eye)=>{
    const z=norm(sub(eye,[0,.15,0])),x=norm(cross([0,1,0],z)),y=cross(z,x);
    return {eye,right:x,up:y,forward:z.map(v=>-v),matrix:Float32Array.from([
      x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,
      -dot(x,eye),-dot(y,eye),-dot(z,eye),1])};
  };
  const COLORS={frame:[.21,.105,.060],trim:[.46,.265,.13],light:[.82,.66,.44],
    dark:[.30,.155,.082],w:[.93,.85,.71],b:[.125,.12,.12],
    shadow:[.027,.02,.012],selected:[.05,.89,.59],last:[.98,.77,.29],
    legal:[.18,.75,.92],check:[1,.13,.19]};
  const vs=[
    'precision mediump float;',
    'attribute vec3 aPosition;attribute vec3 aNormal;',
    'uniform mat4 uMvp;uniform vec3 uOffset;',
    'varying vec3 vNorm;varying vec3 vPos;',
    'void main(){vec3 p=aPosition+uOffset;vPos=p;vNorm=aNormal;gl_Position=uMvp*vec4(p,1.);}'
  ].join('\n');
  const fs=[
    'precision mediump float;',
    'varying vec3 vNorm;varying vec3 vPos;',
    'uniform vec3 uColor;uniform vec3 uEye;',
    'uniform float uAlpha;uniform float uGrain;uniform float uGloss;',
    'void main(){',
    'vec3 N=normalize(vNorm),L=normalize(vec3(-.4,.83,.5)),V=normalize(uEye-vPos);',
    'float d=max(dot(N,L),0.),f=max(dot(N,normalize(vec3(.7,.7,-.4))),0.);',
    'float h=pow(max(dot(reflect(-L,N),V),0.),30.);',
    'float grain=sin(vPos.x*40.+sin(vPos.z*9.)*2.)*.036+sin(vPos.z*22.)*.02;',
    'vec3 col=uColor*(.44+.45*d+.14*f+grain*uGrain)+vec3(.85,.71,.54)*h*.36*uGloss+vec3(.022);',
    'gl_FragColor=vec4(clamp(col,0.,1.),uAlpha);}'
  ].join('\n');
  function shaders(gl){
    const make=(type,source)=>{
      const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('3D shader: '+gl.getShaderInfoLog(s));
      return s;
    };
    const pr=gl.createProgram(),a=make(gl.VERTEX_SHADER,vs),b=make(gl.FRAGMENT_SHADER,fs);
    gl.attachShader(pr,a);gl.attachShader(pr,b);gl.linkProgram(pr);
    gl.deleteShader(a);gl.deleteShader(b);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error('3D program: '+gl.getProgramInfoLog(pr));
    const attr=n=>gl.getAttribLocation(pr,n),uni=n=>gl.getUniformLocation(pr,n);
    return {pr,pos:attr('aPosition'),norm:attr('aNormal'),mvp:uni('uMvp'),
      offset:uni('uOffset'),color:uni('uColor'),eye:uni('uEye'),
      alpha:uni('uAlpha'),grain:uni('uGrain'),gloss:uni('uGloss')};
  }
  const plane=()=>({vertexCount:6,positions:Float32Array.from([
    -.49,0,-.49,.49,0,.49,.49,0,-.49,
    -.49,0,-.49,-.49,0,.49,.49,0,.49]),
    normals:Float32Array.from(Array(6).fill([0,1,0]).flat())});
  const disc=()=>{const p=[],n=[];for(let i=0;i<32;i++){const a=i*TAU/32,b=(i+1)*TAU/32;
    p.push(0,0,0,.41*Math.cos(b),0,.41*Math.sin(b),.41*Math.cos(a),0,.41*Math.sin(a));
    n.push(0,1,0,0,1,0,0,1,0);}
    return {positions:Float32Array.from(p),normals:Float32Array.from(n),vertexCount:p.length/3};
  };
  class Real3D {
    constructor({canvas,frame,onSquareClick}){
      if(!Model)throw Error('Missing 3D piece meshes');
      this.canvas=canvas;this.frame=frame;this.onSquareClick=onSquareClick;
      this.gl=null;this.webgl=null;this.buffers={};this.enabled=false;this.supported=null;
      this.pieces=[];this.cam={tilt:26,yaw:0,spin:0};this.state={};
      this.frames=0;this.pending=0;this.viewInfo=null;this.press=null;this.error='';
      this.initEvents();
    }
    initEvents(){
      root.addEventListener('chess-beast-camera-change',e=>{this.cam={...this.cam,...e.detail};this.request();});
      root.addEventListener('resize',()=>this.request());
      if(root.ResizeObserver)new ResizeObserver(()=>this.request()).observe(this.frame);
      this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.error='WebGL context lost';this.fallback();});
      this.canvas.addEventListener('webglcontextrestored',()=>{this.gl=null;this.webgl=null;this.buffers={};this.supported=null;});
      this.canvas.addEventListener('pointerdown',e=>{
        if(!this.enabled||!e.isPrimary||e.button===2||this.rotating())return;
        this.press={id:e.pointerId,sq:this.pick(e.clientX,e.clientY),x:e.clientX,y:e.clientY};
        e.stopPropagation();
      });
      this.canvas.addEventListener('pointerup',e=>{
        const start=this.press;this.press=null;
        if(!this.enabled||!start||this.rotating()||start.id!==e.pointerId)return;
        const target=this.pick(e.clientX,e.clientY);
        if(target<0)return;
        if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>13&&start.sq>=0&&start.sq!==target){
          this.onSquareClick(start.sq);this.onSquareClick(target);
        }else this.onSquareClick(target);
        e.preventDefault();e.stopPropagation();
      });
      this.canvas.addEventListener('pointercancel',()=>{this.press=null;});
      this.canvas.addEventListener('click',e=>{if(this.enabled)e.preventDefault();});
    }
    rotating(){return !!root.__chessBeastOrbitState?.().rotateMode;}
    compile(){
      if(this.supported===false)return false;
      if(this.gl)return true;
      try{
        const gl=this.canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,
          stencil:false,preserveDrawingBuffer:true,powerPreference:'default'});
        if(!gl)throw Error('WebGL unavailable');
        this.gl=gl;this.webgl=shaders(gl);
        const models={...Model.board(),...Model.builds(),plane:plane(),shadow:disc()};
        for(const [type,mesh] of Object.entries(models)){
          const p=gl.createBuffer(),n=gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,mesh.positions,gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,mesh.normals,gl.STATIC_DRAW);
          this.buffers[type]={p,n,count:mesh.vertexCount};
        }
        this.supported=true;return true;
      }catch(e){this.error=String(e?.message||e);this.supported=false;
        console.warn('Chess real 3D fallback to accessible 2D:',this.error);return false;}
    }
    enable(on){
      if(!on){this.enabled=false;this.canvas.hidden=true;document.body.classList.remove('real3d-active');return true;}
      if(!this.compile()){this.fallback();return false;}
      this.enabled=true;this.canvas.hidden=false;document.body.classList.add('real3d-active');
      this.request();return true;
    }
    fallback(){
      this.enabled=false;this.canvas.hidden=true;
      document.body.classList.remove('real3d-active','board-3d');
      document.getElementById('btnToggle3D')?.classList.remove('active-toggle');
      const bar=document.getElementById('chessCameraControls');if(bar)bar.hidden=true;
    }
    sync(board,state={}){
      if(!Array.isArray(board)||board.length!==64)return;
      this.pieces=[];
      board.forEach((p,sq)=>{
        if(p&&Model.TYPES.includes(p.type)&&['w','b'].includes(p.color))
          this.pieces.push({id:sq+':'+p.color+p.type,sq,type:p.type,color:p.color});
      });
      this.state={...state};this.request();
    }
    request(){
      if(!this.enabled||this.pending||document.hidden)return;
      this.pending=requestAnimationFrame(()=>{this.pending=0;this.render();});
    }
    view(){
      const az=((Number(this.cam.yaw)||0)+(Number(this.cam.spin)||0)+(this.state.flipped?180:0))*Math.PI/180;
      const elev=(72-Math.max(0,Math.min(65,Number(this.cam.tilt)||26))*.38)*Math.PI/180;
      const radius=14.6,eye=[radius*Math.cos(elev)*Math.sin(az),radius*Math.sin(elev),radius*Math.cos(elev)*Math.cos(az)];
      const basis=look(eye),aspect=this.canvas.width/this.canvas.height||1,fov=48*Math.PI/180;
      return {...basis,aspect,fov,mvp:matMul(projection(fov,aspect,.08,70),basis.matrix)};
    }
    draw(name,color,translation=[0,0,0],alpha=1,grain=0,gloss=1){
      const gl=this.gl,p=this.webgl,b=this.buffers[name];if(!b)return;
      gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.enableVertexAttribArray(p.pos);
      gl.vertexAttribPointer(p.pos,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.enableVertexAttribArray(p.norm);
      gl.vertexAttribPointer(p.norm,3,gl.FLOAT,false,0,0);
      gl.uniform3fv(p.color,color);gl.uniform3fv(p.offset,translation);
      gl.uniform1f(p.alpha,alpha);gl.uniform1f(p.grain,grain);gl.uniform1f(p.gloss,gloss);
      gl.drawArrays(gl.TRIANGLES,0,b.count);
    }
    render(){
      const gl=this.gl;if(!this.enabled||!gl||gl.isContextLost())return;
      const r=this.canvas.getBoundingClientRect();if(r.width<30||r.height<30)return;
      const dpr=Math.min(2,root.devicePixelRatio||1),
        width=Math.max(1,Math.min(1400,Math.round(r.width*dpr))),
        height=Math.max(1,Math.min(1400,Math.round(r.height*dpr)));
      if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearColor(.082,.116,.13,1);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      const prog=this.webgl,view=this.view();this.viewInfo=view;
      gl.useProgram(prog.pr);gl.uniformMatrix4fv(prog.mvp,false,view.mvp);gl.uniform3fv(prog.eye,view.eye);
      gl.depthMask(true);
      for(const [name,color,grain,gloss] of [
        ['frame',COLORS.frame,1,.82],['trim',COLORS.trim,1,.90],
        ['light',COLORS.light,1,.67],['dark',COLORS.dark,1,.72]])this.draw(name,color,[0,0,0],1,grain,gloss);
      gl.depthMask(false);
      const st=this.state,legal=Array.isArray(st.legal)?st.legal:[];
      for(const sq of new Set([st.lastFrom,st.lastTo,st.selected,st.check,...legal])){
        if(!Number.isInteger(sq)||sq<0||sq>63)continue;
        const color=sq===st.check?COLORS.check:sq===st.selected?COLORS.selected:legal.includes(sq)?COLORS.legal:COLORS.last;
        this.draw('plane',color,[(sq&7)-3.5,.143,(sq>>3)-3.5],.30,0,0);
      }
      for(const m of this.pieces)this.draw('shadow',COLORS.shadow,[(m.sq&7)-3.5,.142,(m.sq>>3)-3.5],.38,0,0);
      gl.depthMask(true);
      for(const m of this.pieces)this.draw(m.type,COLORS[m.color],[(m.sq&7)-3.5,.14,(m.sq>>3)-3.5],1,0,m.color==='w'?1:.92);
      gl.flush();this.frames++;
    }
    pick(clientX,clientY){
      const view=this.viewInfo;if(!view)return -1;
      const r=this.canvas.getBoundingClientRect();
      if(!r.width||!r.height)return -1;
      const x=2*(clientX-r.left)/r.width-1,y=1-2*(clientY-r.top)/r.height;
      const spread=Math.tan(view.fov/2);
      const ray=norm(view.forward.map((v,i)=>v+view.right[i]*x*spread*view.aspect+view.up[i]*y*spread));
      if(Math.abs(ray[1])<1e-6)return -1;
      const t=(.14-view.eye[1])/ray[1];if(t<0)return -1;
      const col=Math.floor(view.eye[0]+ray[0]*t+4),row=Math.floor(view.eye[2]+ray[2]*t+4);
      return row>=0&&row<8&&col>=0&&col<8?(row<<3)|col:-1;
    }
    squareScreen(sq){
      const view=this.viewInfo;if(!view)return null;
      const q=[(sq&7)-3.5,.14,(sq>>3)-3.5,1],v=[0,0,0,0],m=view.mvp;
      for(let row=0;row<4;row++)for(let k=0;k<4;k++)v[row]+=m[k*4+row]*q[k];
      if(!v[3])return null;
      const r=this.canvas.getBoundingClientRect();
      return {x:r.left+(v[0]/v[3]+1)*r.width/2,y:r.top+(1-v[1]/v[3])*r.height/2};
    }
    diagnostics(){
      return {enabled:this.enabled,supported:this.supported,
        frames:this.frames,pieceCount:this.pieces.length,
        white:this.pieces.filter(p=>p.color==='w').length,
        black:this.pieces.filter(p=>p.color==='b').length,
        distinctInstances:new Set(this.pieces.map(p=>p.sq)).size,
        meshTypes:Object.keys(this.buffers).filter(k=>Model.TYPES.includes(k)),
        boardTiles:64,realSolidMeshes:true,angle:{...this.cam},
        flipped:!!this.state.flipped,webglWidth:this.canvas.width,webglHeight:this.canvas.height,
        error:this.error};
    }
  }
  root.ChessBeastReal3D=Real3D;
})(window);
