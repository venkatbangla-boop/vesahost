/**
 * Chess Beast 360 — licensed sculpted Chess Studio.
 * Pinned offline Three.js (MIT) and Poly Haven Chess Set (Riley Queen, CC0).
 * Loaded lazily ONLY after user chooses Real 3D. No CDN, cloud, analytics.
 * The existing ChessEngine remains the only source of moves and results.
 */
import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

const TYPE={pawn:'P',rook:'R',knight:'N',bishop:'B',queen:'Q',king:'K'};
const key=(color,type)=>color+type;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function woodTexture(tone,seed){
  const width=256,height=256,c=document.createElement('canvas');c.width=width;c.height=height;
  const ctx=c.getContext('2d'),img=ctx.createImageData(width,height);
  let rnd=seed>>>0;
  const random=()=>{rnd=(1664525*rnd+1013904223)>>>0;return rnd/4294967295};
  const phase=Array.from({length:height},()=>random()*2-1);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const channel=(x+y*width)*4;
    // Long directional wood fibers with subtle irregularity, no exaggerated
    // repeating sinusoid. Deliberate variation between walnut and maple.
    const broad=Math.sin(y*.063+Math.sin(x*.026+seed)*.49)*7.8;
    const thin=Math.sin(y*.74+phase[y]*.28+Math.sin(x*.09)*.16)*3.8;
    const fine=Math.sin(y*2.1+x*.019+seed)*2.1;
    const jitter=(random()-.5)*9;
    const variation=broad+thin+fine+jitter;
    for(let i=0;i<3;i++)img.data[channel+i]=clamp(tone[i]+variation,0,255);
    img.data[channel+3]=255;
  }
  ctx.putImageData(img,0,0);
  const texture=new THREE.CanvasTexture(c);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.RepeatWrapping;
  texture.anisotropy=4;
  return texture;
}
function finishMaterial(source,color){
  if(Array.isArray(source))return source.map(m=>finishMaterial(m,color));
  const mat=new THREE.MeshPhysicalMaterial({
    color:source?.color||new THREE.Color(color==='w'?0xf5e7cb:0x282627),
    map:source?.map||null,
    normalMap:source?.normalMap||null,
    roughnessMap:source?.roughnessMap||null,
    metalnessMap:source?.metalnessMap||null,
    aoMap:source?.aoMap||null,
    roughness:color==='w'?.36:.29,metalness:0,
    clearcoat:.68,clearcoatRoughness:.20,
    specularIntensity:1.0,
    side:THREE.FrontSide
  });
  return mat;
}
function prepPrototype(node,color){
  const model=node.clone(true);
  model.position.set(0,0,0);
  model.traverse(obj=>{
    if(obj.isMesh){
      obj.material=finishMaterial(obj.material,color);
      obj.castShadow=true;obj.receiveShadow=true;
    }
  });
  return model;
}
export class ChessBeast3DStudio {
  constructor({canvas,frame,onSquareClick,getOrbit}){
    this.canvas=canvas;this.frame=frame;
    this.onSquareClick=onSquareClick;this.getOrbit=getOrbit;
    this.renderer=null;this.scene=null;this.camera=null;
    this.ready=false;this.active=false;this.error='';
    this.prototypes={};this.instances=new Map();this.board=[];
    this.highlights=[];this.state={};this.flipped=false;
    this.pieces=[];this.frames=0;this.anim=0;this.pointer=null;
    this.raycaster=new THREE.Raycaster();
    this.ndc=new THREE.Vector2();this.mapPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.247);
    this.hitWorld=new THREE.Vector3();
    this.fitted=false;this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    this.loadStarted=performance.now();
    this.onCamera=()=>{this.schedule();};
    window.addEventListener('chess-beast-camera-change',this.onCamera);
    window.addEventListener('resize',()=>this.schedule());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.schedule();});
    if('ResizeObserver' in window)new ResizeObserver(()=>this.schedule()).observe(frame);
    this.installPointer();
    this.canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault();this.error='WebGL context lost';this.active=false;
      this.canvas.hidden=true;
      window.dispatchEvent(new Event('chess-studio-fallback'));
    });
  }
  installPointer(){
    const c=this.canvas;
    c.addEventListener('pointerdown',e=>{
      if(!this.active||this.getOrbit()?.rotateMode||!e.isPrimary||e.button>0)return;
      this.pointer={id:e.pointerId,x:e.clientX,y:e.clientY,sq:this.pick(e.clientX,e.clientY)};
      e.stopPropagation();
    });
    c.addEventListener('pointerup',e=>{
      const prev=this.pointer;this.pointer=null;
      if(!this.active||this.getOrbit()?.rotateMode||!prev||prev.id!==e.pointerId)return;
      const dest=this.pick(e.clientX,e.clientY);
      if(dest<0)return;
      const drag=Math.hypot(e.clientX-prev.x,e.clientY-prev.y)>12;
      if(drag&&prev.sq>=0&&prev.sq!==dest){
        this.onSquareClick(prev.sq);this.onSquareClick(dest);
      }else this.onSquareClick(dest);
      e.preventDefault();e.stopPropagation();
    });
    c.addEventListener('pointercancel',()=>{this.pointer=null;});
    c.addEventListener('click',e=>{if(this.active)e.preventDefault();});
  }
  makeBoard(){
    const boardGroup=new THREE.Group(),colorTrim=0x81502a;
    const lower=new THREE.Mesh(new THREE.BoxGeometry(8.7,.38,8.7),
      new THREE.MeshPhysicalMaterial({color:0x442516,roughness:.48,clearcoat:.39}));
    lower.position.y=-.04;lower.castShadow=true;lower.receiveShadow=true;
    boardGroup.add(lower);
    const lip=new THREE.Mesh(new THREE.BoxGeometry(8.52,.07,8.52),
      new THREE.MeshPhysicalMaterial({color:colorTrim,metalness:.15,roughness:.24,clearcoat:.74}));
    lip.position.y=.165;lip.castShadow=true;lip.receiveShadow=true;boardGroup.add(lip);
    const maple=woodTexture([214,175,119],42),walnut=woodTexture([111,62,35],142);
    const materials=[
      new THREE.MeshPhysicalMaterial({map:maple,roughness:.43,clearcoat:.53,clearcoatRoughness:.20}),
      new THREE.MeshPhysicalMaterial({map:walnut,roughness:.39,clearcoat:.56,clearcoatRoughness:.18})
    ];
    const cube=new THREE.BoxGeometry(.999,.055,.999);
    for(let row=0;row<8;row++)for(let col=0;col<8;col++){
      const sq=(row<<3)|col,tile=new THREE.Mesh(cube,materials[(row+col)%2]);
      tile.position.set(col-3.5,.218,row-3.5);
      tile.castShadow=false;tile.receiveShadow=true;
      tile.userData.square=sq;boardGroup.add(tile);this.board.push(tile);
    }
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),
      new THREE.MeshStandardMaterial({color:0x151c1c,roughness:.87,metalness:.04}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.242;
    ground.receiveShadow=true;this.scene.add(ground);
    this.scene.add(boardGroup);
    this.mapPlane.constant=-.247;
    const light1=new THREE.DirectionalLight(0xffedcf,3.2);
    light1.position.set(-3.5,10,6);
    light1.castShadow=true;
    light1.shadow.mapSize.set(1024,1024);
    light1.shadow.camera.left=-8;light1.shadow.camera.right=8;
    light1.shadow.camera.top=8;light1.shadow.camera.bottom=-8;
    light1.shadow.camera.near=.5;light1.shadow.camera.far=28;
    light1.shadow.bias=-.00016;light1.shadow.normalBias=.018;
    light1.shadow.radius=3;
    this.scene.add(light1);
    const fill=new THREE.DirectionalLight(0xcce4ff,2.0);fill.position.set(5,7,-5);this.scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffd9af,1.05);rim.position.set(2,5,10);this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xf5faff,0x58402d,1.6));
    this.scene.add(new THREE.AmbientLight(0xffffff,.35));
  }
  async load(){
    if(this.ready)return true;
    const renderer=new THREE.WebGLRenderer({
      canvas:this.canvas,antialias:true,alpha:true,stencil:false,
      powerPreference:'default',preserveDrawingBuffer:true
    });
    renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.18;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x111a1c,0);
    this.renderer=renderer;
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(49,1,.07,100);
    this.makeBoard();
    const gltf=await new GLTFLoader().loadAsync('./assets/real3d/chess_set_1k.gltf');
    const count={w:0,b:0};
    gltf.scene.traverse(obj=>{
      const m=/^piece_(pawn|rook|knight|bishop|queen|king)_(white|black)/i.exec(obj.name||'');
      if(!m)return;
      const color=m[2].toLowerCase()==='white'?'w':'b';
      const type=TYPE[m[1].toLowerCase()],id=key(color,type);
      if(!this.prototypes[id]){
        this.prototypes[id]=prepPrototype(obj,color);
        count[color]++;
      }
    });
    for(const color of ['w','b'])for(const type of ['P','R','N','B','Q','K']){
      if(!this.prototypes[key(color,type)])throw Error('Licensed model missing '+color+type);
    }
    this.ready=true;
    this.loadedMs=performance.now()-this.loadStarted;
    this.sync(this.pieces,this.state);
    return true;
  }
  enable(on){
    this.active=Boolean(on&&this.ready&&!this.error);
    this.canvas.hidden=!this.active;
    if(this.active)this.schedule();
    return this.active;
  }
  sync(board,state={}){
    this.pieces=Array.isArray(board)?board.slice():[];
    this.state={...state};
    if(!this.ready)return;
    const desired=new Map();
    this.pieces.forEach((p,sq)=>{
      if(!p||!TYPE[p.type?.toLowerCase()]&&!'KQRBNP'.includes(p.type))return;
      const color=p.color,type=p.type,id=sq+':'+color+type;
      const proto=this.prototypes[key(color,type)];if(!proto)return;
      let obj=this.instances.get(id);
      if(!obj){
        obj=proto.clone(true);obj.scale.setScalar(17.27);
        obj.userData.square=sq;obj.userData.color=color;obj.userData.type=type;
        obj.traverse(m=>{if(m.isMesh){m.userData.square=sq;m.castShadow=true;m.receiveShadow=true;}});
        this.scene.add(obj);
      }
      obj.position.set((sq&7)-3.5,.247,(sq>>3)-3.5);
      desired.set(id,obj);
    });
    for(const [id,obj] of this.instances)if(!desired.has(id))this.scene.remove(obj);
    this.instances=desired;
    this.highlights.forEach(o=>this.scene.remove(o));this.highlights=[];
    const highlights=[
      [state.lastFrom,0xf7c84b,.23],[state.lastTo,0xf7c84b,.23],
      [state.selected,0x4ce0b4,.29],[state.check,0xff4444,.43],
      ...(Array.isArray(state.legal)?state.legal.map(sq=>[sq,0x43cce1,.24]):[])
    ];
    for(const [sq,color,opacity] of highlights){
      if(!Number.isInteger(sq)||sq<0||sq>63)continue;
      const quad=new THREE.Mesh(new THREE.PlaneGeometry(.98,.98),
        new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,
          side:THREE.DoubleSide}));
      quad.rotation.x=-Math.PI/2;
      quad.position.set((sq&7)-3.5,.249,(sq>>3)-3.5);
      this.scene.add(quad);this.highlights.push(quad);
    }
    this.schedule();
  }
  cameraPose(){
    const orbit=this.getOrbit()||{tilt:26,yaw:0,spin:0};
    const a=((orbit.yaw||0)+(orbit.spin||0)+(this.state.flipped?180:0))*Math.PI/180;
    const elev=(59-clamp(orbit.tilt||26,0,65)*.55)*Math.PI/180;
    const half=4.45*(Math.abs(Math.cos(a))+Math.abs(Math.sin(a)));
    const radius=(half/Math.tan(49*Math.PI/360)+half*Math.cos(elev))*1.045;
    this.camera.position.set(radius*Math.cos(elev)*Math.sin(a),
      radius*Math.sin(elev),radius*Math.cos(elev)*Math.cos(a));
    this.camera.lookAt(0,.27,0);this.camera.updateMatrixWorld();
  }
  resize(){
    const rect=this.canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return false;
    const w=Math.round(rect.width),h=Math.round(rect.height);
    if(this.w!==w||this.h!==h){
      this.w=w;this.h=h;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
      this.renderer.setSize(w,h,false);
    }
    return true;
  }
  render(){
    if(!this.active||document.hidden||!this.ready||!this.resize())return;
    this.cameraPose();this.renderer.render(this.scene,this.camera);this.frames++;
  }
  schedule(){
    if(!this.active||this.anim)return;
    this.anim=requestAnimationFrame(()=>{this.anim=0;this.render();});
  }
  setRay(x,y){
    const rect=this.canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return false;
    this.ndc.set(2*(x-rect.left)/rect.width-1,1-2*(y-rect.top)/rect.height);
    this.raycaster.setFromCamera(this.ndc,this.camera);
    return true;
  }
  pick(x,y){
    if(!this.ready||!this.setRay(x,y))return -1;
    const meshes=[...this.instances.values()];
    const hit=this.raycaster.intersectObjects(meshes,true);
    if(hit.length){
      let obj=hit[0].object;
      while(obj){
        if(Number.isInteger(obj.userData?.square))return obj.userData.square;
        obj=obj.parent;
      }
    }
    if(this.raycaster.ray.intersectPlane(this.mapPlane,this.hitWorld)){
      const col=Math.floor(this.hitWorld.x+4),row=Math.floor(this.hitWorld.z+4);
      if(row>=0&&row<8&&col>=0&&col<8)return(row<<3)|col;
    }
    return -1;
  }
  squareScreen(sq){
    if(!this.ready)return null;
    this.cameraPose();const r=this.canvas.getBoundingClientRect();
    const pos=new THREE.Vector3((sq&7)-3.5,.249,(sq>>3)-3.5).project(this.camera);
    return {x:r.left+(pos.x+1)*r.width/2,y:r.top+(1-pos.y)*r.height/2};
  }
  diagnostics(){
    return {ready:this.ready,active:this.active,frames:this.frames,
      license:'CC0 Poly Haven Riley Queen',source:'local verified 1K glTF',
      loadedMs:Math.round(this.loadedMs||0),
      assetsOffline:true,remoteRuntimeRequests:0,
      loadedModels:Object.keys(this.prototypes).length,
      pieceCount:this.instances.size,shadowMap:!!this.renderer?.shadowMap.enabled,
      width:this.w||0,height:this.h||0,error:this.error};
  }
}
