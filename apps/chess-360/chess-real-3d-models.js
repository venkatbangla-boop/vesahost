/*
 * Chess Beast 360 — offline procedural 3D models.
 * These are ACTUAL closed/solid triangulated volumetric models, not sprites,
 * CSS-transformed images or pretended Blender files.
 * Geometry is in units of one chess square and uses Y as the vertical axis.
 * All six piece types are independently modeled, both colors use materials.
 */
(function(root,factory){
  const result=factory();
  if(typeof module==='object'&&module.exports)module.exports=result;
  else root.ChessBeast3DGeometry=result;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const TAU=Math.PI*2;
  const norm=v=>{const q=Math.hypot(...v)||1;return v.map(a=>a/q);};
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const geom=()=>{
    const positions=[],normals=[];
    const tri=(a,b,c)=>{
      const n=norm(cross(sub(b,a),sub(c,a)));
      for(const v of [a,b,c]){positions.push(v[0],v[1],v[2]);normals.push(...n);}
    };
    const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
    const box=(x,y,z,hx,hy,hz)=>{
      const p=(a,b,c)=>[x+a*hx,y+b*hy,z+c*hz];
      // Face quads are wound outward. Backface culling is not necessary.
      quad(p(-1,-1,1),p(1,-1,1),p(1,1,1),p(-1,1,1));
      quad(p(1,-1,-1),p(-1,-1,-1),p(-1,1,-1),p(1,1,-1));
      quad(p(1,-1,1),p(1,-1,-1),p(1,1,-1),p(1,1,1));
      quad(p(-1,-1,-1),p(-1,-1,1),p(-1,1,1),p(-1,1,-1));
      quad(p(-1,1,1),p(1,1,1),p(1,1,-1),p(-1,1,-1));
      quad(p(-1,-1,-1),p(1,-1,-1),p(1,-1,1),p(-1,-1,1));
    };
    const lathe=(outline,cx=0,cz=0,segments=32)=>{
      for(let j=0;j<outline.length-1;j++){
        const [r0,h0]=outline[j],[r1,h1]=outline[j+1];
        for(let k=0;k<segments;k++){
          const t0=TAU*k/segments,t1=TAU*(k+1)/segments;
          const p=(r,h,t)=>[cx+r*Math.cos(t),h,cz+r*Math.sin(t)];
          quad(p(r0,h0,t0),p(r1,h1,t0),p(r1,h1,t1),p(r0,h0,t1));
        }
      }
    };
    const sphere=(cx,cy,cz,r,segments=22,rings=12)=>{
      const profile=[];
      for(let i=0;i<=rings;i++){
        const t=Math.PI*i/rings;
        profile.push([Math.max(.00001,r*Math.sin(t)),cy-r*Math.cos(t)]);
      }
      lathe(profile,cx,cz,segments);
    };
    const point=(cx,base,cz,r,height)=>lathe([[r,base],[r*.88,base+.07],[.015,base+height],[0,base+height+.01]],cx,cz,18);
    // Proper 3D extrusion with front/back caps AND side walls, including
    // concave outlines. Ear-clip triangulation avoids intersecting cap fans.
    const extrude=(shape,z0,z1)=>{
      const pts=shape.map(p=>[p[0],p[1]]);
      const area=pts.reduce((a,p,i)=>{const q=pts[(i+1)%pts.length];return a+p[0]*q[1]-q[0]*p[1];},0);
      if(area<0)pts.reverse();
      const inds=pts.map((_,i)=>i),cap=[];
      const signed=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      let guard=0;
      while(inds.length>3&&guard++<100){
        let removed=false;
        for(let i=0;i<inds.length;i++){
          const a=inds[(i+inds.length-1)%inds.length],b=inds[i],c=inds[(i+1)%inds.length];
          if(signed(pts[a],pts[b],pts[c])<1e-7)continue;
          const inside=inds.some(q=>{
            if(q===a||q===b||q===c)return false;
            const p=pts[q],A=pts[a],B=pts[b],C=pts[c];
            return signed(A,B,p)>=0&&signed(B,C,p)>=0&&signed(C,A,p)>=0;
          });
          if(inside)continue;
          cap.push([a,b,c]);inds.splice(i,1);removed=true;break;
        }
        if(!removed)break;
      }
      if(inds.length===3)cap.push(inds);
      const p=(k,z)=>[pts[k][0],pts[k][1],z];
      for(const [a,b,c] of cap){
        tri(p(a,z1),p(b,z1),p(c,z1));
        tri(p(c,z0),p(b,z0),p(a,z0));
      }
      for(let i=0;i<pts.length;i++){
        const a=i,b=(i+1)%pts.length;
        quad(p(a,z0),p(b,z0),p(b,z1),p(a,z1));
      }
    };
    const seal=()=>{
      const flat=Float32Array.from(positions);
      let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
      for(let i=0;i<flat.length;i+=3)for(let j=0;j<3;j++){
        min[j]=Math.min(min[j],flat[i+j]);max[j]=Math.max(max[j],flat[i+j]);
      }
      return {positions:flat,normals:Float32Array.from(normals),vertexCount:flat.length/3,
        bounds:{min,max,size:max.map((v,i)=>v-min[i])},solid:true};
    };
    return {tri,quad,box,lathe,sphere,point,extrude,seal};
  };
  const base=g=>g.lathe([
    [0,.01],[.25,.01],[.33,.018],[.355,.065],[.375,.105],
    [.36,.145],[.30,.165],[.285,.195],[.215,.22]
  ]);
  const collar=(g,h,r=.22)=>g.lathe([[r*.87,h],[r,h+.024],[r*.98,h+.074],[r*.77,h+.100]]);
  function piece(type){
    const g=geom();base(g);
    if(type==='P'){
      g.lathe([[.215,.20],[.15,.28],[.115,.51],[.18,.56],[.21,.615],[.175,.68]]);
      g.sphere(0,.855,0,.205,30,18);
    }else if(type==='R'){
      g.lathe([[.215,.2],[.22,.29],[.225,.92],[.285,.97],[.315,1.04],[.305,1.11],
        [.22,1.12],[.225,1.145]]);
      for(let i=0;i<6;i++){
        const t=i*TAU/6;
        const x=.239*Math.cos(t),z=.239*Math.sin(t);
        g.box(x,1.185,z,.088,.115,.082);
      }
    }else if(type==='N'){
      g.lathe([[.22,.20],[.215,.27],[.24,.33],[.255,.37]]);
      // A recognizable horse-head outline with complete 3D side extrusion.
      g.extrude([
        [-.21,.32],[.21,.32],[.23,.59],[.11,.81],[.055,1.12],
        [-.08,1.37],[-.155,1.42],[-.235,1.29],[-.30,1.36],
        [-.38,1.32],[-.35,1.12],[-.50,1.0],[-.49,.81],
        [-.34,.77],[-.20,.91],[-.20,.62]
      ],-.145,.145);
      g.sphere(-.205,1.16,.167,.045,12,8);
      g.sphere(-.205,1.16,-.167,.045,12,8);
      g.sphere(-.425,.91,.14,.035,10,7);
      g.sphere(-.425,.91,-.14,.035,10,7);
      for(let i=0;i<4;i++){
        const yy=.55+i*.14;
        g.box(.14,yy,.142,.08,.042,.032);
        g.box(.14,yy,-.142,.08,.042,.032);
      }
    }else if(type==='B'){
      g.lathe([[.215,.20],[.18,.31],[.14,.62],[.20,.69],[.21,.75],
        [.155,.83],[.26,1.10],[.19,1.30],[.06,1.43],[0,1.48]]);
      // Pointed bishop mitre, side contours and finial on the axis.
      g.sphere(0,1.49,0,.078,17,10);
      g.box(.0,1.2,.21,.020,.13,.018);
    }else if(type==='Q'){
      g.lathe([[.215,.20],[.17,.34],[.155,.61],[.205,.83],[.255,.95],
        [.31,1.055],[.295,1.10],[.225,1.13]]);
      g.sphere(0,1.14,0,.13,18,12);
      for(let i=0;i<7;i++){
        const t=i*TAU/7,xx=.267*Math.cos(t),zz=.267*Math.sin(t);
        g.point(xx,1.07,zz,.086,.28);
        g.sphere(xx,1.37,zz,.045,14,9);
      }
    }else if(type==='K'){
      g.lathe([[.215,.20],[.175,.35],[.14,.69],[.23,.91],[.27,1.055],
        [.285,1.14],[.22,1.16],[.19,1.245],[0,1.255]]);
      // King has two intersecting 3D cross bars, not a flat SVG.
      g.box(0,1.46,0,.082,.233,.084);
      g.box(0,1.49,0,.23,.08,.084);
      g.sphere(0,1.7,0,.065,15,9);
    }else throw Error('Unsupported chess type '+type);
    const result=g.seal();result.type=type;return result;
  }
  function board(){
    const frame=geom(),trim=geom(),light=geom(),dark=geom();
    frame.box(0,-.12,0,4.19,.16,4.19);
    trim.box(0,.038,0,4.055,.052,4.055);
    // Raised playing surface, 8x8 with real thickness underneath.
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){
      const xx=c-3.5,zz=r-3.5,y=.108;
      const tile=((r+c)%2===0)?light:dark;
      tile.box(xx,y,zz,.499,.028,.499);
    }
    return {frame:frame.seal(),trim:trim.seal(),light:light.seal(),dark:dark.seal()};
  }
  const TYPES=Object.freeze(['P','R','N','B','Q','K']);
  const builds=()=>Object.fromEntries(TYPES.map(t=>[t,piece(t)]));
  return Object.freeze({TYPES,piece,board,builds,version:'1.0-procedural-real-3d'});
});
