/* APP-10 explicit locally reviewed Tech Pack/Sampling source snapshots.
 * No access to other apps' private records and no buyer/regulatory certification.
 */
(function(root){
'use strict';
class VesaArtworkReviewedReference{
 static text(v){return typeof v==='string'?v.trim():'';}
 static date(v){return typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;}
 static dateTime(v){return this.date(v)||(typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v)));}
 static owner(kind,app){
  const s=this.text(app);
  return kind==='tech'?/^(?:VESA\s+)?Tech Pack\s*&\s*Spec(?:\s+360)?$/i.test(s):
   kind==='sampling'?/^(?:VESA\s+)?Sampling\s*&\s*Approval(?:\s+360)?$/i.test(s):false;
 }
 static sourceValid(ref,kind){
  if(!ref||typeof ref!=='object'||Array.isArray(ref)||!this.owner(kind,ref.sourceApp))return false;
  if(['sourceApp','recordType','recordId','revisionId','verifiedBy'].some(k=>!this.text(ref[k])||this.text(ref[k]).length>180))return false;
  if(kind==='sampling'&&ref.recordType!=='SamplingApprovalRegister')return false;
  if(!this.date(ref.sourceDate)||!this.dateTime(ref.verifiedAt))return false;
  if(!ref.displaySnapshot||typeof ref.displaySnapshot!=='object'||Array.isArray(ref.displaySnapshot))return false;
  try{return JSON.stringify(ref).length<=120000;}catch{return false;}
 }
 static matchesRecord(ref,record){
  const snap=ref?.displaySnapshot,head=record?.header;
  if(!snap||!head)return false;
  const sourceStyle=this.text(snap.style)||this.text(snap.styleNo);
  if(!sourceStyle||sourceStyle.toUpperCase()!==this.text(head.style).toUpperCase())return false;
  const same=(a,b)=>this.text(a).toUpperCase()===this.text(b).toUpperCase();
  if(this.text(snap.colour)&&!same(snap.colour,head.colour))return false;
  if(this.text(snap.color)&&!same(snap.color,head.colour))return false;
  if(this.text(snap.size)&&!same(snap.size,head.size))return false;
  return true;
 }
 static validateList(record){
  if(record.manualReferences===undefined)return [];
  const refs=record.manualReferences;
  if(!Array.isArray(refs)||refs.length>12)return ['Artwork read-only sources require a bounded list (maximum 12)'];
  const errors=[],ids=new Set(),versions=new Set();
  for(const e of refs){
   const kind=e?.kind,ref=e?.source;
   if(!e||typeof e!=='object'||Array.isArray(e)||!['tech','sampling'].includes(kind)||
    !this.text(e.id)||this.text(e.id).length>180||ids.has(e.id)||
    !this.text(e.localReviewer)||this.text(e.localReviewer).length>180||
    !this.date(e.localReviewDate)||e.identityConfirmed!==true||
    !this.sourceValid(ref,kind)||!this.matchesRecord(ref,record))
     errors.push('Manual Tech Pack/Sampling source requires exact style and independent dated local review');
   const key=[kind,this.text(ref?.recordId),this.text(ref?.revisionId)].join('\u001f');
   if(versions.has(key))errors.push('Duplicate locally reviewed source revision');
   ids.add(e?.id);versions.add(key);
  }
  return errors;
 }
 static append(record,kind,source,review){
  const E=root.VesaArtworkRevision;
  if(!E||!this.sourceValid(source,kind)||!this.matchesRecord(source,record)||
   !this.text(review?.localReviewer)||this.text(review.localReviewer).length>180||
   !this.date(review?.localReviewDate)||review?.identityConfirmed!==true)
   throw Error('Matching source style, Tech Pack/Sampling type and separate local reviewer/date confirmation required');
  const next=E.copy(record);next.manualReferences??=[];
  next.manualReferences.push({id:E.id('ART-LOCAL-SOURCE'),kind,
   source:E.copy(source),localReviewer:this.text(review.localReviewer),localReviewDate:review.localReviewDate,identityConfirmed:true});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,
   action:'Locally reviewed '+kind+' source attached (not an approval)',recordId:next.manualReferences.at(-1).id});
  const checked=E.validate(next);if(!checked.ok)throw Error(checked.errors.join('; '));
  return next;
 }
}
root.VesaArtworkReviewedReference=VesaArtworkReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaArtworkReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
