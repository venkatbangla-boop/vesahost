/* APP-10 comments and explicit revision-specific local decision evidence.
 * A claimed buyer source is NOT authenticated buyer approval or sample sign-off.
 */
(function(root){
'use strict';
class VesaArtworkReviewState{
 static roles=['internal','factory','buyer'];
 static decisions=['needs-information','changes-required','internal-reviewed','buyer-approval-evidence-recorded'];
 static text(v){return typeof v==='string'?v.trim():'';}
 static checkEvent(ev,kind,revisionIds){
  const E=root.VesaArtworkRevision,errors=[];
  if(!ev||typeof ev!=='object'||Array.isArray(ev))return['Review event must be a sourced record'];
  for(const field of ['id','revisionId','reviewer','sourceRef'])
   if(!E.valid(ev[field],300))errors.push('Review event missing '+field);
  if(!E.date(ev.reviewDate))errors.push('Review needs exact date');
  if(!revisionIds.has(ev.revisionId))errors.push('Review must match an existing artwork revision');
  if(!this.roles.includes(ev.reviewerRole))errors.push('Review needs internal/factory/buyer role');
  if(kind==='comment'){
   if(!E.valid(ev.comment,4000))errors.push('Review comment requires sourced text');
  }else{
   if(!this.decisions.includes(ev.decision))errors.push('Unknown review evidence state');
   if(ev.decision==='buyer-approval-evidence-recorded'&&
     (ev.reviewerRole!=='buyer'||!E.valid(ev.authorityRef,300)))
    errors.push('Buyer decision can only be recorded with named buyer-role and separate authority source evidence');
  }
  return errors;
 }
 static validateEvents(p){
  const errors=[],ids=new Set(),revIds=new Set(p.revisions.map(v=>v.id));
  for(const kind of ['comments','decisions'])for(const ev of p[kind]){
   if(ids.has(ev?.id))errors.push('Duplicate review event ID');
   ids.add(ev?.id);
   errors.push(...this.checkEvent(ev,kind==='comments'?'comment':'decision',revIds));
  }
  return errors;
 }
 static append(p,kind,input){
  const E=root.VesaArtworkRevision;
  if(!['comment','decision'].includes(kind))throw Error('Unknown artwork review action');
  const previous=E.validate(p);if(!previous.ok)throw Error(previous.errors.join('; '));
  const next=E.copy(p),ev=E.copy({...input,id:input?.id||E.id('ART-REVIEW')});
  const errors=this.checkEvent(ev,kind,new Set(next.revisions.map(v=>v.id)));
  if(errors.length)throw Error(errors.join('; '));
  next[kind==='comment'?'comments':'decisions'].push(ev);
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,
   action:kind==='comment'?'Review comment evidence':'Recorded review decision source (NOT external approval)',
   recordId:ev.id});
  const checked=E.validate(next);if(!checked.ok)throw Error(checked.errors.join('; '));
  return next;
 }
 static effective(p){
  const E=root.VesaArtworkRevision;const valid=E.validate(p);
  if(!valid.ok)throw Error(valid.errors.join('; '));
  const latest=E.latest(p);
  if(!latest)return{revisionId:null,status:'NEEDS INFORMATION',sourceOnly:true,buyerAuthorityVerified:false};
  const decisions=p.decisions.filter(d=>d.revisionId===latest.id);
  const mostRecent=decisions.at(-1);
  if(!mostRecent||mostRecent.decision!=='buyer-approval-evidence-recorded')
   return{revisionId:latest.id,status:'PENDING MATCHING REVISION REVIEW',sourceOnly:true,buyerAuthorityVerified:false,
    previousVersionCannotAuthorize:true};
  return{revisionId:latest.id,status:'BUYER DECISION EVIDENCE RECORDED (NOT INDEPENDENTLY VERIFIED)',
   sourceOnly:true,buyerAuthorityVerified:false,reviewer:mostRecent.reviewer,evidenceRef:mostRecent.sourceRef,
   authorityRef:mostRecent.authorityRef,reviewDate:mostRecent.reviewDate,
   previousVersionCannotAuthorize:true};
 }
}
root.VesaArtworkReviewState=VesaArtworkReviewState;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaArtworkReviewState;
})(typeof globalThis!=='undefined'?globalThis:this);
