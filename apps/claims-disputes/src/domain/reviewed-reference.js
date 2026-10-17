/* APP-14 manually uploaded, locally reviewed AQL, Shipment or PO source envelopes.
 * Native AQL InspectionRef may need explicit HUMAN envelope preparation. No sibling storage, original edits,
 * legal/QA source authentication, supplier liability or bank receipt certification.
 */
(function(root){
'use strict';
class VesaClaimReviewedReference{
 static text(v){return typeof v==='string'?v.trim():'';}
 static date(v){return root.VesaClaimRegister.date(v);}
 static dateTime(v){return this.date(v)||(typeof v==='string'&&
  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v)));}
 static owner(kind,ref){
  const app=this.text(ref?.sourceApp),type=this.text(ref?.recordType);
  if(kind==='aql')return(/^(?:VESA\s+)?AQL(?:\s+360)?$/i.test(app)||app.toLowerCase()==='aql')&&type==='InspectionRef';
  if(kind==='shipment')return /^(?:VESA\s+)?Shipment\s*&\s*Documentation(?:\s+360)?$/i.test(app)&&type==='ShipmentFile';
  if(kind==='po')return /^(?:VESA\s+)?Purchase Order(?:\s+360)?$/i.test(app)&&type==='PurchaseOrder';
  return false;
 }
 static sourceValid(ref,kind){
  if(!ref||typeof ref!=='object'||Array.isArray(ref)||!this.owner(kind,ref))return false;
  if(['sourceApp','recordType','recordId','revisionId','verifiedBy'].some(k=>
   !this.text(ref[k])||this.text(ref[k]).length>180))return false;
  if(!this.date(ref.sourceDate)||!this.dateTime(ref.verifiedAt)||
   !ref.displaySnapshot||typeof ref.displaySnapshot!=='object'||Array.isArray(ref.displaySnapshot))
   return false;
  if(kind==='aql'&&(!this.text(ref.displaySnapshot.inspectionId)||
   !this.text(ref.displaySnapshot.stageId)||!this.text(ref.displaySnapshot.outcome)))
   return false;
  if(ref.externallyAuthenticated===true||ref.autoBuyerApproved===true||ref.changesOriginal===true)return false;
  try{return JSON.stringify(ref).length<=120000;}catch{return false;}
 }
 static matchesCase(ref,p){
  const snap=ref?.displaySnapshot,h=p?.header;
  if(!snap||!h)return false;
  const po=this.text(snap.poNo)||this.text(snap.poNumber);
  const buyer=this.text(snap.buyer)||this.text(snap.buyerName);
  return!!po&&!!buyer&&po.toUpperCase()===this.text(h.poNo).toUpperCase()&&
   buyer.toUpperCase()===this.text(h.buyer).toUpperCase();
 }
 static validateList(p){
  if(p.manualReferences===undefined)return[];
  if(!Array.isArray(p.manualReferences)||p.manualReferences.length>25)
   return['Local claim source evidence exceeds 25-item safety limit'];
  const errors=[],unique=new Set(),ids=new Set();
  for(const row of p.manualReferences){
   const kind=row?.kind,ref=row?.source,valid=['aql','shipment','po'].includes(kind)&&
    this.sourceValid(ref,kind)&&this.matchesCase(ref,p);
   if(!valid||!this.text(row?.id)||this.text(row.id).length>180||ids.has(row.id)||
    !this.text(row.localReviewer)||this.text(row.localReviewer).length>180||
    !this.date(row.localReviewDate)||row.identityConfirmed!==true)
    errors.push('Manual AQL/Shipment/PO evidence requires exact buyer + PO and separate dated human review');
   const key=[kind,this.text(ref?.recordId),this.text(ref?.revisionId)].join('\u001f');
   if(unique.has(key))errors.push('Duplicate manually reviewed original source revision');
   unique.add(key);ids.add(row?.id);
  }
  return errors;
 }
 static append(p,kind,ref,review){
  const E=root.VesaClaimRegister;
  if(!E||!this.sourceValid(ref,kind)||!this.matchesCase(ref,p)||
   !this.text(review?.localReviewer)||this.text(review.localReviewer).length>180||
   !this.date(review?.localReviewDate)||review.identityConfirmed!==true)
   throw Error('Locally reviewed typed AQL/Shipment/PO source, exact buyer + PO and human review required');
  const next=E.copy(p);next.manualReferences??=[];
  next.manualReferences.push({id:E.id('CLM-REF'),kind,source:E.copy(ref),
   localReviewer:this.text(review.localReviewer),localReviewDate:review.localReviewDate,
   identityConfirmed:true});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,
   action:'User-reviewed '+kind.toUpperCase()+' original source (NO AQL CHANGE, LIABILITY OR PAYMENT AUTHORIZATION)',
   recordId:next.manualReferences.at(-1).id});
  const result=E.validate(next);if(!result.ok)throw Error(result.errors.join('; '));
  return next;
 }
}
root.VesaClaimReviewedReference=VesaClaimReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
