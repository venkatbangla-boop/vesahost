/* APP-15 immutable, source-labelled brief revisions and explicit PROPOSAL-ONLY decisions.
 * Buyer approval, bulk readiness, quoting and writes into Tech Pack belong to other owners.
 */
(function(root){
'use strict';
class VesaProductRevisionHistory{
 static E(){if(!root.VesaProductConceptRegister)throw Error('Concept registry unavailable');
  return root.VesaProductConceptRegister;}
 static keys=['conceptName','category','season','market','silhouette','brief','requestedBuyer'];
 static changes(before,after){return this.keys.filter(k=>before[k]!==after[k]).map(k=>({
   field:k,before:before[k],after:after[k]}));}
 static checkRevision(r){
  const E=this.E(),errors=[];
  for(const k of ['id','sourceRef','reviewedBy','summary'])
   if(!E.valid(r?.[k],1000))errors.push('Concept revision requires '+k);
  if(!E.date(r?.sourceDate))errors.push('Concept revision requires exact source date');
  if(!Number.isSafeInteger(r?.number)||r.number<1)errors.push('Invalid concept revision number');
  if(!r?.before||!r?.after||!Array.isArray(r?.changed)||!r.changed.length)
   errors.push('Concept revision must preserve before and after source snapshots');
  else{
   for(const k of this.keys)if(!E.optional(r.before[k],4000)||!E.optional(r.after[k],4000))
    errors.push('Oversized revision snapshot');
   if(JSON.stringify(this.changes(r.before,r.after))!==JSON.stringify(r.changed))
    errors.push('Concept revision change list does not match preserved snapshots');
   if(E.header(r.after).length)errors.push('Revised concept must preserve sourced required header');
  }
  return errors;
 }
 static checkDecision(d){
  const E=this.E(),errors=[];
  for(const k of ['id','actor','sourceRef','authorityRef','comments'])if(!E.valid(d?.[k],4000))
   errors.push('Proposal review requires entered '+k);
  if(!E.date(d?.decisionDate))errors.push('Review needs exact dated evidence');
  if(!['internal','buyer-claimed','factory-claimed'].includes(d?.party))
   errors.push('Review party must be explicitly labelled');
  if(!['review-requested','changes-requested','selected-for-next-draft','rejected-proposal'].includes(d?.state))
   errors.push('No automatic buyer/technical/bulk approval transition');
  if(d?.verifiedExternally===true||d?.productionApproved===true||d?.buyerApproved===true)
   errors.push('Local proposal review is NOT externally certified approval');
  return errors;
 }
 static check(p){
  const e=[];
  let prior=JSON.stringify(p.originalHeader);
  for(let i=0;i<p.revisions.length;i++){
   const r=p.revisions[i];e.push(...this.checkRevision(r));
   if(r?.number!==i+1)e.push('Concept revision sequence gap');
   if(JSON.stringify(r?.before)!==prior)e.push('Concept revision did not preserve previous snapshot');
   prior=JSON.stringify(r?.after);
  }
  if(prior!==JSON.stringify(p.header))e.push('Current brief diverges from immutable sourced revisions');
  for(const d of p.decisions)e.push(...this.checkDecision(d));
  return e;
 }
 static revise(p,data){
  const E=this.E(),start=E.validate(p);if(!start.ok)throw Error(start.errors.join('; '));
  const patch=data?.changes;
  if(!patch||typeof patch!=='object'||Array.isArray(patch)||!Object.keys(patch).length||
   Object.keys(patch).some(k=>!this.keys.includes(k)))
   throw Error('Only sourced concept brief fields may be revised');
  const next=E.copy(p),before=E.copy(p.header),after=E.copy(before);
  for(const [k,v] of Object.entries(patch)){
   if(typeof v!=='string'||v.length>4000)throw Error('Revised value must be bounded local text');
   after[k]=v.trim();
  }
  const changed=this.changes(before,after);
  if(!changed.length)throw Error('Unchanged brief cannot fabricate a new revision');
  const r={id:data.id||E.id('CONCEPT-REV'),number:next.revisions.length+1,
   before,after,changed,sourceRef:data.sourceRef,reviewedBy:data.reviewedBy,
   sourceDate:data.sourceDate,summary:data.summary};
  const e=this.checkRevision(r);if(e.length)throw Error(e.join('; '));
  next.header=after;next.revisions.push(r);next.revision++;
  next.updatedAt=new Date().toISOString();next.audit.push({id:E.id('AUDIT'),revision:next.revision,
   at:next.updatedAt,action:'Sourced concept brief revision (proposal only)',recordId:r.id});
  const validated=E.validate(next);if(!validated.ok)throw Error(validated.errors.join('; '));
  return next;
 }
 static decide(p,data){
  const E=this.E(),v=E.validate(p);if(!v.ok)throw Error(v.errors.join('; '));
  const d=E.copy({...data,id:data?.id||E.id('CONCEPT-DEC')});
  const errors=this.checkDecision(d);if(errors.length)throw Error(errors.join('; '));
  const next=E.copy(p);next.decisions.push(d);next.revision++;
  next.updatedAt=new Date().toISOString();next.audit.push({id:E.id('AUDIT'),revision:next.revision,
   at:next.updatedAt,action:'Manual local proposal review; no buyer/TechPack/PO approval',recordId:d.id});
  const done=E.validate(next);if(!done.ok)throw Error(done.errors.join('; '));
  return next;
 }
}
root.VesaProductRevisionHistory=VesaProductRevisionHistory;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductRevisionHistory;
})(typeof globalThis!=='undefined'?globalThis:this);
