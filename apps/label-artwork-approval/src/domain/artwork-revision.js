/* APP-10 owns only local artwork/label version and source evidence.
 * Never mutates Tech Pack, Sampling, PPM or AQL and never asserts legal accuracy.
 */
(function(root){
'use strict';
class VesaArtworkRevision {
 static version='VESA-LABEL-ARTWORK-360-1';
 static format='VESA-LABEL-ARTWORK-COPY-1';
 static text(v){return typeof v==='string'?v.trim():'';}
 static valid(v,max=250){return !!this.text(v)&&this.text(v).length<=max;}
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static id(prefix='ART'){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static date(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v))return false;const t=Date.parse(v+'T00:00:00Z');
  return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v;}
 static create(seed={}){
  const now=new Date().toISOString();
  return{version:this.version,id:this.id(),revision:0,createdAt:now,updatedAt:now,status:'DRAFT — SOURCE REVIEW ONLY',
   header:{style:this.text(seed.style),colour:this.text(seed.colour),size:this.text(seed.size),
    itemType:this.text(seed.itemType),placement:this.text(seed.placement),sourceRef:this.text(seed.sourceRef)},
   revisions:[],comments:[],decisions:[],audit:[]};
 }
 static checkHeader(h){
  const errors=[];
  for(const k of ['style','colour','size','itemType','placement','sourceRef'])
   if(!this.valid(h?.[k]))errors.push('Artwork record requires sourced '+k);
  if(h?.itemType&&!['label','barcode','care-label','print','embroidery','other'].includes(h.itemType))
   errors.push('Artwork type must be one of the locally described categories');
  return errors;
 }
 static checkRevision(v){
  const errors=[];
  for(const k of ['id','artworkRef','sourceRef'])if(!this.valid(v?.[k],350))errors.push('Revision needs '+k+' source');
  if(!Number.isSafeInteger(v?.number)||v.number<1||v.number>1000)errors.push('Revision number must be positive and bounded');
  if(!this.date(v?.sourceDate))errors.push('Revision requires exact source date');
  if(v?.notes!==undefined&&(typeof v.notes!=='string'||v.notes.length>4000))errors.push('Revision notes oversized');
  if(!root.VesaLabelSpec)errors.push('Label measurement and barcode guard missing');
  else errors.push(...root.VesaLabelSpec.check(v?.spec));
  return errors;
 }
 static validate(p){
  const errors=[];
  if(!p||p.version!==this.version||!this.valid(p.id,180)||!Number.isSafeInteger(p.revision)||p.revision<0||
   !['revisions','comments','decisions','audit'].every(k=>Array.isArray(p[k])))
   return{ok:false,errors:['Unsupported artwork revision record/version']};
  if(p.status!=='DRAFT — SOURCE REVIEW ONLY')errors.push('Cannot invent buyer approval or legal label release');
  errors.push(...this.checkHeader(p.header));
  try{if(JSON.stringify(p).length>2097152)errors.push('Artwork source record exceeds 2MB bound');}catch{errors.push('Artwork record is not serializable');}
  if(p.revisions.length>200||p.comments.length>2000||p.decisions.length>2000||p.audit.length>5000)errors.push('Artwork evidence count too large');
  const seen=new Set();
  for(let i=0;i<p.revisions.length;i++){
   const v=p.revisions[i];errors.push(...this.checkRevision(v));
   if(seen.has(v?.id))errors.push('Duplicate artwork revision identity');seen.add(v?.id);
   if(v?.number!==i+1)errors.push('Artwork revision numbers must be sequential and source-ordered');
  }
  if(p.audit.length!==p.revision)errors.push('Revision audit chain must append one event per change');
  for(let i=0;i<p.audit.length;i++){
   const a=p.audit[i];if(a?.revision!==i+1||!this.valid(a.action,250)||!this.valid(a.at,80))errors.push('Malformed immutable revision audit');
  }
  if((p.comments.length||p.decisions.length)&&!root.VesaArtworkReviewState)
   errors.push('Revision-specific review checker unavailable');
  else if(root.VesaArtworkReviewState)
   errors.push(...root.VesaArtworkReviewState.validateEvents(p));
  return{ok:errors.length===0,errors};
 }
 static appendRevision(p,input){
  const initial=this.validate(p);if(!initial.ok)throw Error(initial.errors.join('; '));
  const next=this.copy(p);
  const entry=this.copy({...input,id:input?.id||this.id('ART-REV'),
    number:next.revisions.length+1});
  const problems=this.checkRevision(entry);if(problems.length)throw Error(problems.join('; '));
  next.revisions.push(entry);next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'New sourced artwork revision',recordId:entry.id});
  const result=this.validate(next);if(!result.ok)throw Error(result.errors.join('; '));
  return next;
 }
 static latest(p){return p.revisions.at(-1)||null;}
}
root.VesaArtworkRevision=VesaArtworkRevision;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaArtworkRevision;
})(typeof globalThis!=='undefined'?globalThis:this);
