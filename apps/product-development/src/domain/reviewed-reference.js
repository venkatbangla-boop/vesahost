/* APP-15 optional typed MANUALLY selected Tech Pack DRAFT reference.
 * Neither this local envelope nor its reviewer metadata authenticates buyer/Tech Pack approval.
 * No sibling localStorage/IndexedDB access or automatic Tech Pack mutation.
 */
(function(root){
'use strict';
class VesaProductReviewedReference{
 static text(v){return typeof v==='string'?v.trim():'';}
 static valid(v,max=350){return!!this.text(v)&&this.text(v).length<=max;}
 static date(v){return root.VesaProductConceptRegister?.date(v)===true;}
 static instant(v){return typeof v==='string'&&
  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(v)&&
  Number.isFinite(Date.parse(v));}
 static sourceValid(ref){
  if(!ref||typeof ref!=='object'||Array.isArray(ref))return false;
  if(!/^(?:VESA\s+)?Tech Pack\s*&\s*Spec(?:\s+360)?$/i.test(this.text(ref.sourceApp))||
   ref.recordType!=='TechPackDraft')return false;
  for(const k of ['sourceApp','recordId','revisionId','verifiedBy'])
   if(!this.valid(ref[k],180))return false;
  if(!this.date(ref.sourceDate)||!this.instant(ref.verifiedAt)||
   !ref.displaySnapshot||typeof ref.displaySnapshot!=='object'||Array.isArray(ref.displaySnapshot))
   return false;
  const snap=ref.displaySnapshot;
  if(!this.valid(snap.style)||!this.valid(snap.proposedConceptId,180)||
   snap.draftOnly!==true||snap.buyerApproved===true||snap.productionReady===true||
   snap.priceConfirmed===true)return false;
  if(ref.externallyAuthenticated===true||ref.autoBuyerApproved===true||ref.changesOriginal===true)
   return false;
  try{return JSON.stringify(ref).length<=120000;}catch{return false;}
 }
 static matches(ref,record){
  return!!record&&this.sourceValid(ref)&&
   this.text(ref.displaySnapshot.proposedConceptId)===this.text(record.id);
 }
 static validateList(record){
  if(record.manualReferences===undefined)return[];
  const list=record.manualReferences;
  if(!Array.isArray(list)||list.length>12)return ['Product draft reference exceeds 12 source limit'];
  const errors=[],ids=new Set(),versions=new Set();
  for(const row of list){
   const src=row?.source;
   if(!this.valid(row?.id,180)||ids.has(row.id)||!this.valid(row?.localReviewer)||
    !this.date(row?.localReviewDate)||row?.identityConfirmed!==true||
    !this.matches(src,record)||row?.kind!=='tech-pack-draft')
    errors.push('Tech Pack draft link requires exact concept ID, original and dated local human review');
   const pair=[this.text(src?.recordId),this.text(src?.revisionId)].join('\u001f');
   if(versions.has(pair))errors.push('Duplicate source draft revision not allowed');
   ids.add(row?.id);versions.add(pair);
  }
  return errors;
 }
 static append(record,source,review){
  const E=root.VesaProductConceptRegister;
  if(!E||!this.matches(source,record)||!this.valid(review?.localReviewer)||
   !this.date(review?.localReviewDate)||review?.identityConfirmed!==true)
   throw Error('Choose a matching user-reviewed Tech Pack draft and confirm independent local source/date');
  const next=E.copy(record);next.manualReferences??=[];
  next.manualReferences.push({id:E.id('CONCEPT-TECH-REF'),kind:'tech-pack-draft',source:E.copy(source),
   localReviewer:this.text(review.localReviewer),localReviewDate:review.localReviewDate,
   identityConfirmed:true});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({id:E.id('AUDIT'),revision:next.revision,at:next.updatedAt,
   action:'User-linked local Tech Pack draft reference; no buyer approval or source write',
   recordId:next.manualReferences.at(-1).id});
  const v=E.validate(next);if(!v.ok)throw Error(v.errors.join('; '));
  return next;
 }
}
root.VesaProductReviewedReference=VesaProductReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
