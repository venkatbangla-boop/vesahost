/* APP-09: explicit user-reviewed TNA / PO copies; no sibling reads.
 * A source reference is a local statement, not a remote approval or signature.
 */
(function(root){
'use strict';
class ProductionReviewedReference {
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static trim(v){return typeof v==='string'?v.trim():'';}
 static date(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(Date.parse(s+'T00:00:00Z')).toISOString().slice(0,10)===s;}
 static datetime(s){return this.date(s)||(typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(s)&&Number.isFinite(Date.parse(s)));}
 static owner(kind,sourceApp){
  const name=this.trim(sourceApp);
  return kind==='po'?/^(?:VESA\s+)?Purchase\s*[- ]\s*Order(?:\s+360)?$/i.test(name):
   kind==='tna'?/^(?:VESA\s+)?TNA(?:\s+360)?$/i.test(name):false;
 }
 static sourcedPo(ref){
  const snapshot=ref?.displaySnapshot;
  return this.trim(snapshot?.poNo)||this.trim(snapshot?.poNumber)||'';
 }
 static matchesRecord(ref,record){
  const sourced=this.sourcedPo(ref);
  return !sourced||sourced.toUpperCase()===this.trim(record?.header?.poNo).toUpperCase();
 }
 static sourceValid(ref,kind){
  if(!ref||typeof ref!=='object'||Array.isArray(ref)||!this.owner(kind,ref.sourceApp))return false;
  if(['sourceApp','recordType','recordId','revisionId','verifiedBy'].some(k=>!this.trim(ref[k])||this.trim(ref[k]).length>180))return false;
  if(!this.date(ref.sourceDate)||!this.datetime(ref.verifiedAt))return false;
  if(!ref.displaySnapshot||typeof ref.displaySnapshot!=='object'||Array.isArray(ref.displaySnapshot))return false;
  try{return JSON.stringify(ref).length<=120000;}catch{return false;}
 }
 static validateList(record){
  const refs=record?.manualReferences;if(refs===undefined)return [];
  if(!Array.isArray(refs)||refs.length>12)return ['Production references must be a bounded list'];
  const ids=new Set(),sources=new Set(),errors=[];
  for(const entry of refs){
   if(!entry||typeof entry!=='object'||!this.trim(entry.id)||this.trim(entry.id).length>128||ids.has(entry.id)||!['po','tna'].includes(entry.kind)||
      !this.date(entry.localReviewDate)||!this.trim(entry.localReviewer)||this.trim(entry.localReviewer).length>180||
      !this.sourceValid(entry.source,entry.kind)||!this.matchesRecord(entry.source,record))
    errors.push('Manual PO/TNA reference requires matching typed source and independent local review');
   if(entry?.source){
    const sourceKey=[entry.kind,entry.source.recordId,entry.source.revisionId].join('\u001f');
    if(sources.has(sourceKey))errors.push('Duplicate reviewed source version cannot be recorded twice');
    sources.add(sourceKey);
   }
   ids.add(entry?.id);
  }
  return errors;
 }
 static append(record,kind,ref,review){
  if(!this.sourceValid(ref,kind)||!this.matchesRecord(ref,record)||
   !this.trim(review?.localReviewer)||this.trim(review?.localReviewer).length>180||!this.date(review?.localReviewDate))
   throw Error('Matching reviewed local PO/TNA source file, reviewer and review date required');
  const E=root.VesaProductionStageFlow,next=E.copy(record);next.manualReferences??=[];
  next.manualReferences.push({id:E.id('LOCAL-REF'),kind,source:this.copy(ref),localReviewer:this.trim(review.localReviewer),localReviewDate:review.localReviewDate});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'Append read-only locally reviewed '+kind.toUpperCase()+' source',recordId:next.manualReferences.at(-1).id});
  const L=root.VesaProductionDailyLedger,analysis=L.validate(next);if(!analysis.ok)throw Error(analysis.errors.join('; '));
  return next;
 }
 static exportStage(record,groupIndex,review){
  const E=root.VesaProductionStageFlow,L=root.VesaProductionDailyLedger,a=L.validate(record),i=Number(groupIndex);
  if(!a.ok||!Number.isSafeInteger(i)||i<0||i>=a.groups.length||!this.trim(review?.verifiedBy)||!this.date(review?.verifiedAt))throw Error('Choose a valid stage and complete dated local reference review');
  const g=a.groups[i];return {sourceApp:'VESA Production Tracker 360',recordType:'ProductionStageSnapshot',recordId:record.id,revisionId:String(record.revision),sourceDate:record.updatedAt.slice(0,10),verifiedBy:this.trim(review.verifiedBy),verifiedAt:review.verifiedAt,
   displaySnapshot:{poNo:record.header.poNo,style:record.header.style,colour:record.header.colour,size:record.header.size,
    stage:g.stage,line:g.line,lot:g.lot,unit:g.unit,locallyReviewedGood:g.locallyReviewedGood,
    reviewedOpeningWip:g.wip.opening,closingWip:g.wip.closing,sourceTarget:g.sourceTarget,remaining:g.remaining,
    evidenceOnly:true,notAqlRelease:true,notPpmApproval:true,notTnaCompletion:true,notShipmentApproval:true}};
 }
}
root.VesaProductionReviewedReference=ProductionReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
