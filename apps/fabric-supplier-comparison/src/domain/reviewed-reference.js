/* APP-12 manually user-reviewed source snapshots only; no sibling localStorage reads or inferred material approvals. */
(function(root){
'use strict';
class VesaSupplierReviewedReference{
 static text(v){return typeof v==='string'?v.trim():'';}
 static date(s){const Q=root.VesaSupplierQuote;return Q.date(s);}
 static dateTime(s){return this.date(s)||(typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(s)&&Number.isFinite(Date.parse(s)));}
 static sourceOwner(kind,ref){
  const a=this.text(ref?.sourceApp),t=this.text(ref?.recordType);
  return kind==='tech'?(/^(?:VESA\s+)?Tech Pack\s*&\s*Spec(?:\s+360)?$/i.test(a)&&t==='TechPackSpecSnapshot'):
   kind==='material'?(/^(?:VESA\s+)?Fabric\s*&\s*Trims(?:\s+360)?$/i.test(a)&&t==='MaterialReadiness'):false;
 }
 static sourceValid(ref,kind){
  if(!ref||typeof ref!=='object'||Array.isArray(ref)||!this.sourceOwner(kind,ref))return false;
  if(['sourceApp','recordType','recordId','revisionId','verifiedBy'].some(k=>!this.text(ref[k])||this.text(ref[k]).length>190))return false;
  if(!this.date(ref.sourceDate)||!this.dateTime(ref.verifiedAt)||
   !ref.displaySnapshot||typeof ref.displaySnapshot!=='object'||Array.isArray(ref.displaySnapshot))return false;
  try{return JSON.stringify(ref).length<=120000;}catch{return false;}
 }
 static matchesRequirement(ref,p){
  const Q=root.VesaSupplierQuote,h=p?.requirement;
  const spec=ref?.displaySnapshot?.materialSpec||ref?.displaySnapshot?.fabricSpec||ref?.displaySnapshot?.spec;
  if(!spec||!h||typeof spec!=='object'||Array.isArray(spec))return false;
  for(const k of ['article','composition','construction','shrinkageBasis'])
   if(this.text(spec[k]).toUpperCase()!==this.text(h[k]).toUpperCase()||!this.text(spec[k]))return false;
  for(const k of ['gsm','width','shrinkage'])
   if(Q.parse(spec[k],k!=='shrinkage')===null||Q.parse(spec[k],k!=='shrinkage')!==Q.parse(h[k],k!=='shrinkage'))
    return false;
  return spec.widthUnit===h.widthUnit&&['mm','cm','in'].includes(spec.widthUnit);
 }
 static validateList(p){
  if(p.manualReferences===undefined)return[];
  if(!Array.isArray(p.manualReferences)||p.manualReferences.length>20)return['Comparison manual source limit exceeded (max 20)'];
  const errors=[],ids=new Set(),revisions=new Set();
  for(const e of p.manualReferences){
   const kind=e?.kind,ref=e?.source;
   if(!e||typeof e!=='object'||Array.isArray(e)||!['tech','material'].includes(kind)||
    !this.text(e.id)||this.text(e.id).length>180||ids.has(e.id)||
    !this.text(e.localReviewer)||this.text(e.localReviewer).length>180||
    !this.date(e.localReviewDate)||e.identityConfirmed!==true||
    !this.sourceValid(ref,kind)||!this.matchesRequirement(ref,p))
    errors.push('Local spec source requires exact fabric article/GSM/width/unit/composition and dated human review');
   const key=[kind,this.text(ref?.recordId),this.text(ref?.revisionId)].join('\u001f');
   if(revisions.has(key))errors.push('Duplicate manually reviewed material source revision');
   ids.add(e?.id);revisions.add(key);
  }
  return errors;
 }
 static append(p,kind,ref,review){
  const Q=root.VesaSupplierQuote;
  if(!Q||!this.sourceValid(ref,kind)||!this.matchesRequirement(ref,p)||
   !this.text(review?.localReviewer)||this.text(review.localReviewer).length>180||
   !this.date(review?.localReviewDate)||review?.identityConfirmed!==true)
   throw Error('Exact matching Tech Pack/Fabric & Trims source and explicit independent local reviewer/date required');
  const next=Q.copy(p);next.manualReferences??=[];
  next.manualReferences.push({id:Q.id('FS-SOURCE'),kind,source:Q.copy(ref),localReviewer:this.text(review.localReviewer),
   localReviewDate:review.localReviewDate,identityConfirmed:true});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,
   action:'User reviewed '+kind+' source added (NOT SUPPLIER APPROVAL)',recordId:next.manualReferences.at(-1).id});
  const checked=Q.validate(next);if(!checked.ok)throw Error(checked.errors.join('; '));
  return next;
 }
}
root.VesaSupplierReviewedReference=VesaSupplierReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
