/* APP-15 pure layout and local-rights guard for user-picked concept board assets.
 * This checks only entered metadata; it never certifies image ownership or loads a remote URL.
 */
(function(root){
'use strict';
class VesaProductBoardLayout{
 static txt(v){return typeof v==='string'?v.trim():'';}
 static val(v,max=350){return!!this.txt(v)&&this.txt(v).length<=max;}
 static date(v){return root.VesaProductConceptRegister?.date(v)===true;}
 static countBytes(uri){
  const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(uri||'');
  if(!match)return null;
  const data=match[2],pad=data.endsWith('==')?2:data.endsWith('=')?1:0;
  return data.length%4===0?(data.length/4)*3-pad:null;
 }
 static checkCard(c,colourways){
  const e=[];
  if(!this.val(c?.id,180)||!this.val(c?.sourceRef))e.push('Board card needs source identity');
  if(!Number.isSafeInteger(c?.position)||c.position<1||c.position>24)
   e.push('Card must have explicit bounded layout position');
  if(!['image','note','colourway'].includes(c?.kind))e.push('Card kind must be sourced image, note or colourway');
  if(c?.kind==='note'&&(!this.val(c?.text,1500)))e.push('Note card needs content');
  if(c?.kind==='colourway'&&!colourways.some(x=>x.id===c.colourwayId))
   e.push('Colourway card must cite a real draft colourway');
  if(c?.kind==='image'){
   if(!['self-created','licensed','permission-recorded'].includes(c.rightsBasis)||
    !this.val(c.rightsSourceRef)||!this.val(c.localAssetRef))
    e.push('Local image requires declared rights and evidence; never assume buyer image license');
   if(!['contain','cover'].includes(c.objectFit))e.push('Image must declare aspect-preserving contain or cover');
   if(!Number.isSafeInteger(c.pixelWidth)||!Number.isSafeInteger(c.pixelHeight)||
    c.pixelWidth<1||c.pixelHeight<1||c.pixelWidth>10000||c.pixelHeight>10000)
    e.push('Local image needs valid supplied dimensions; no invented layout geometry');
   const bytes=this.countBytes(c.dataUrl);
   if(bytes===null||bytes<1||bytes>350000||c.imageBytes!==bytes)
    e.push('Only bounded device-picked PNG/JPEG/WebP image data are allowed (350KB per image)');
  }
  if(c?.kind!=='image'&&c?.dataUrl)e.push('Non-image card cannot load media');
  for(const k of ['caption','altText'])if(c?.[k]!==undefined&&
   (typeof c[k]!=='string'||c[k].length>1000))e.push('Card accessible description oversized');
  return e;
 }
 static check(board,colourways=[]){
  const e=[];
  for(const k of ['id','title','sourceRef','reviewedBy'])if(!this.val(board?.[k]))
   e.push('Board requires sourced '+k);
  if(!this.date(board?.sourceDate))e.push('Board needs source date');
  if(!['single','grid-2','grid-3'].includes(board?.layout))
   e.push('Board layout must be explicitly chosen');
  if(!['16:9','4:3','1:1'].includes(board?.aspect))e.push('Board aspect must be explicitly selected');
  if(!Array.isArray(board?.cards)||board.cards.length>24)e.push('Board cards missing or exceed local limit');
  else{
   const ids=new Set(),positions=new Set();
   let imageBytes=0;
   for(const c of board.cards){
    e.push(...this.checkCard(c,colourways));
    if(ids.has(c?.id)||positions.has(c?.position))e.push('Duplicate board card identity or position');
    ids.add(c?.id);positions.add(c?.position);
    if(c?.kind==='image')imageBytes+=Number.isSafeInteger(c.imageBytes)?c.imageBytes:0;
   }
   if(imageBytes>800000)e.push('Board image budget exceeds 800KB; resize locally');
  }
  return e;
 }
 static plan(board,colourways=[]){
  const checked=this.check(board,colourways);if(checked.length)throw Error(checked.join('; '));
  return{aspect:board.aspect,columns:{single:1,'grid-2':2,'grid-3':3}[board.layout],
   cards:board.cards.slice().sort((a,b)=>a.position-b.position).map(c=>({
    id:c.id,kind:c.kind,position:c.position,fit:c.kind==='image'?c.objectFit:null,
    sourceRef:c.sourceRef,notApproved:true}))};
 }
}
root.VesaProductBoardLayout=VesaProductBoardLayout;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductBoardLayout;
})(typeof globalThis!=='undefined'?globalThis:this);
