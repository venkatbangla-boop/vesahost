/* APP-11 independent reviewed and source-labelled local Purchase Order / manual Costing references.
 * Never reads Costing/PO private storage, contacts remote endpoints or asserts order authority.
 */
(function(root){
'use strict';
class VesaCRMReviewedReference{
 static text(v){return typeof v==='string'?v.trim():'';}
 static date(v){return typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;}
 static datetime(v){return this.date(v)||(typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v)));}
 static owner(kind,ref){
  const app=this.text(ref?.sourceApp),type=this.text(ref?.recordType);
  if(kind==='po')return /^(?:VESA\s+)?Purchase Order(?:\s+360)?$/i.test(app)&&type==='PurchaseOrder';
  if(kind==='costing')return /^(?:VESA\s+)?Costing(?:\s+360)?$/i.test(app)&&type==='CostingQuoteSnapshot';
  return false;
 }
 static sourceValid(ref,kind){
  if(!ref||typeof ref!=='object'||Array.isArray(ref)||!this.owner(kind,ref))return false;
  if(['sourceApp','recordType','recordId','revisionId','verifiedBy'].some(k=>!this.text(ref[k])||this.text(ref[k]).length>180))return false;
  if(!this.date(ref.sourceDate)||!this.datetime(ref.verifiedAt)||!ref.displaySnapshot||
   typeof ref.displaySnapshot!=='object'||Array.isArray(ref.displaySnapshot))return false;
  try{return JSON.stringify(ref).length<=120000;}catch{return false;}
 }
 static matchesBuyer(ref,p){
  const s=ref?.displaySnapshot,head=p?.header;
  if(!s||!head)return false;
  const buyer=this.text(s.buyer)||this.text(s.buyerName)||this.text(s.organizationName);
  return !!buyer&&buyer.toUpperCase()===this.text(head.organizationName).toUpperCase();
 }
 static validateList(record){
  if(record.manualReferences===undefined)return [];
  if(!Array.isArray(record.manualReferences)||record.manualReferences.length>20)return ['Buyer CRM manual references exceed safe 20-item limit'];
  const errors=[],ids=new Set(),versions=new Set();
  for(const entry of record.manualReferences){
   const kind=entry?.kind,src=entry?.source;
   if(!entry||typeof entry!=='object'||Array.isArray(entry)||!['po','costing'].includes(kind)||
    !this.text(entry.id)||this.text(entry.id).length>180||ids.has(entry.id)||
    !this.text(entry.localReviewer)||this.text(entry.localReviewer).length>180||
    !this.date(entry.localReviewDate)||entry.identityConfirmed!==true||
    !this.sourceValid(src,kind)||!this.matchesBuyer(src,record))
     errors.push('Local source must match exact buyer, typed PO/manual Costing source and dated human review');
   const version=[kind,this.text(src?.recordId),this.text(src?.revisionId)].join('\u001f');
   if(versions.has(version))errors.push('Duplicate local source revision');
   ids.add(entry?.id);versions.add(version);
  }
  return errors;
 }
 static append(record,kind,ref,review){
  const E=root.VesaBuyerDirectory;
  if(!E||!this.sourceValid(ref,kind)||!this.matchesBuyer(ref,record)||
   !this.text(review?.localReviewer)||this.text(review.localReviewer).length>180||
   !this.date(review?.localReviewDate)||review?.identityConfirmed!==true)
   throw Error('Exact matching buyer PO/manual Costing source, explicit local reviewer/date and identity confirmation required');
  const next=E.copy(record);next.manualReferences??=[];
  next.manualReferences.push({id:E.id('CRM-SOURCE'),kind,source:E.copy(ref),localReviewer:this.text(review.localReviewer),
   localReviewDate:review.localReviewDate,identityConfirmed:true});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,
   action:'Attached user-reviewed '+kind.toUpperCase()+' source (NOT ORDER/QUOTE APPROVAL)',
   recordId:next.manualReferences.at(-1).id});
  const checked=E.validate(next);if(!checked.ok)throw Error(checked.errors.join('; '));
  return next;
 }
}
root.VesaCRMReviewedReference=VesaCRMReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaCRMReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
