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
  const COLORS={frame:[.24,.125,.073],trim:[.51,.29,.16],light:[.83,.68,.47],
    dark:[.32,.18,.11],w:[.96,.88,.72],b:[.265,.245,.22],
    shadow:[.027,.02,.012],selected:[.05,.89,.59],last:[.98,.77,.29],
    legal:[.18,.75,.92],check:[1,.13,.19]};
  // Offline microfacet material model: two broad studio key/fill lights,
  // clear lacquer highlights, rough walnut, and radial contact shadow falloff.
  // This is an original shader, not a claim of Three.js or Blender.
  const vs=[
    'precision highp float;',
    'attribute vec3 aPosition;attribute vec3 aNormal;',
    'uniform mat4 uMvp;uniform vec3 uOffset;',
    'varying vec3 vNorm;varying vec3 vPos;varying vec3 vLocal;',
    'void main(){vec3 p=aPosition+uOffset;vPos=p;vLocal=aPosition;',
    'vNorm=aNormal;gl_Position=uMvp*vec4(p,1.);}'
  ].join('\n');
  const fs=[
    'precision highp float;',
    'varying vec3 vNorm;varying vec3 vPos;varying vec3 vLocal;',
    'uniform vec3 uColor;uniform vec3 uEye;',
    'uniform float uAlpha;uniform float uGrain;uniform float uGloss;',
    'uniform float uRoughness;uniform float uShadow;',
    'const float PI=3.14159265;',
    'float GGX(float nh,float a2){float d=nh*nh*(a2-1.0)+1.0;return a2/(PI*d*d+.0001);}',
    'float Smith(float nv,float rough){float k=(rough+1.0)*(rough+1.0)/8.0;return nv/(nv*(1.0-k)+k+.0001);}',
    'vec3 lighting(vec3 N,vec3 V,vec3 L,vec3 light,vec3 color,float rough){',
    'vec3 H=normalize(V+L);float nl=max(dot(N,L),0.0),nv=max(dot(N,V),0.001);',
    'float nh=max(dot(N,H),0.0),vh=max(dot(V,H),0.0),a=rough*rough;',
    'float spec=GGX(nh,a*a)*Smith(nv,rough)*Smith(nl,rough)/(4.0*nv*nl+.0001);',
    'vec3 F=.045*vec3(1.0)+(vec3(1.0)-vec3(.045))*pow(1.0-vh,5.0);',
    'return ((color/PI)*(vec3(1.0)-F)+F*spec)*light*nl;',
    '}',
    'void main(){',
    'if(uShadow>.5){float radius=length(vLocal.xz);',
    'float soft=1.0-smoothstep(.065,.41,radius);',
    'gl_FragColor=vec4(.025,.017,.011,uAlpha*soft*soft);return;}',
    'vec3 N=normalize(vNorm),V=normalize(uEye-vPos);',
    'vec3 albedo=uColor;',
    // Fine directional fibers with mild ring variations, not exaggerated waves
    'if(uGrain>.5){float line=sin(vPos.z*89.0+sin(vPos.x*1.5)*.55)*.011;',
    'float fiber=sin(vPos.z*30.0+sin(vPos.x*2.4)*.35)*.018;',
    'float ring=sin(vPos.z*8.0+vPos.x*2.2)*.024;',
    'float pores=sin(vPos.x*127.0)*sin(vPos.z*117.0)*.005;',
    'albedo*=1.0+line+fiber+ring+pores;}',
    'float rough=max(.09,min(.97,uRoughness));',
    'vec3 key=lighting(N,V,normalize(vec3(-.48,.87,.32)),vec3(2.55,2.3,2.04),albedo,rough);',
    'vec3 fill=lighting(N,V,normalize(vec3(.65,.68,-.37)),vec3(.85,1.0,1.15),albedo,rough);',
    'vec3 back=lighting(N,V,normalize(vec3(.2,.48,.85)),vec3(.25,.31,.39),albedo,rough);',
    'float ndv=max(dot(N,V),0.0),fres=pow(1.0-ndv,3.0);',
    'vec3 softbox=vec3(.18,.20,.22)*fres*(.50+(1.0-rough)*.6);',
    'vec3 lit=albedo*(vec3(.18,.185,.19)+.14*max(N.y,0.0))+key+fill+back+softbox;',
    'lit=lit/(vec3(1.0)+lit*.38);',
    'lit=pow(max(lit,vec3(0.0)),vec3(.82));',
    'gl_FragColor=vec4(clamp(lit,0.0,1.0),uAlpha);}',
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
      alpha:uni('uAlpha'),grain:uni('uGrain'),gloss:uni('uGloss'),
      roughness:uni('uRoughness'),shadow:uni('uShadow')};
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
      document.addEventListener('visibilitychange',()=>{
        if(!document.hidden && this.enabled)this.request();
      });
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
        const gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,
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
      this.enabled=false;this.canvas.hidden=true;this.press=null;
      document.body.classList.remove('real3d-active','board-3d');
      document.getElementById('btnToggle3D')?.classList.remove('active-toggle');
      document.getElementById('btn3DDirect')?.setAttribute('aria-pressed','false');
      const state=document.getElementById('chess3DDirectState');if(state)state.textContent='OFF';
      const bar=document.getElementById('chessCameraControls');if(bar)bar.hidden=true;
      root.dispatchEvent(new Event('chess-real3d-fallback'));
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
      const elev=(59-Math.max(0,Math.min(65,Number(this.cam.tilt)||26))*.55)*Math.PI/180;
      // A lower cinematic orbit angle and close framing. The adaptive
      // radius increases slightly for diagonal views to keep all pieces visible.
      const baseHalf=4.15*(Math.abs(Math.cos(az))+Math.abs(Math.sin(az)));
      const radius=(baseHalf/Math.tan(49*Math.PI/360)+baseHalf*Math.cos(elev))*1.025;
      const eye=[radius*Math.cos(elev)*Math.sin(az),radius*Math.sin(elev),radius*Math.cos(elev)*Math.cos(az)];
      const basis=look(eye),aspect=this.canvas.width/this.canvas.height||1,fov=49*Math.PI/180;
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
      const wood=['frame','trim','light','dark'].includes(name);
      gl.uniform1f(p.shadow,name==='shadow'?1:0);
      gl.uniform1f(p.roughness,name==='shadow'||name==='plane'?1:
        wood?(name==='trim'?.34:.55):(name==='K'||name==='Q'?.19:.25));
      gl.drawArrays(gl.TRIANGLES,0,b.count);
    }
    render(){
      const gl=this.gl;if(!this.enabled||!gl||gl.isContextLost())return;
      const r=this.canvas.getBoundingClientRect();if(r.width<30||r.height<30)return;
      const dpr=Math.min(2,root.devicePixelRatio||1),
        width=Math.max(1,Math.min(1400,Math.round(r.width*dpr))),
        height=Math.max(1,Math.min(1400,Math.round(r.height*dpr)));
      if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);
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
