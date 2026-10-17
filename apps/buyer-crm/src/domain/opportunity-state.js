/* APP-11 sourced opportunities only; never compute chance, confirmed PO or foreign exchange. */
(function(root){
'use strict';
class VesaCRMOpportunityState{
 static text(x){return typeof x==='string'?x.trim():'';}
 static parseCents(input){
  if(typeof input!=='string'||!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(input))return null;
  const p=input.split('.');return BigInt(p[0])*100n+BigInt((p[1]||'').padEnd(2,'0'));
 }
 static money(cents){const n=BigInt(cents);return(n/100n).toString()+'.'+(n%100n).toString().padStart(2,'0');}
 static check(o,enquiries){
  const E=root.VesaBuyerDirectory,errors=[];
  for(const k of ['id','enquiryId','stage','stageSourceRef','reviewedBy'])if(!E.valid(o?.[k],250))errors.push('Opportunity requires sourced '+k);
  if(!enquiries.has(o?.enquiryId))errors.push('Opportunity must belong to one recorded enquiry');
  if(!E.date(o?.reviewDate))errors.push('Opportunity requires explicit local review date');
  if(o?.confirmedPO===true||o?.buyerApproved===true||o?.probability!==undefined)
   errors.push('Opportunity stage cannot confirm PO, buyer approval or guessed chance');
  const amount=o?.amount;
  if(amount!==null&&amount!==undefined&&amount!==''){
   if(this.parseCents(amount)===null||!/^[A-Z]{3}$/.test(o.currency||'')||
    !E.valid(o.amountSourceRef)||!E.valid(o.amountReviewedBy)||!E.date(o.amountReviewDate))
    errors.push('Pipeline amount needs exact entered decimal, ISO currency and separately reviewed source evidence');
  }else if(o?.currency&& !/^[A-Z]{3}$/.test(o.currency))errors.push('Currency must use ISO-style 3-letter code');
  return errors;
 }
 static checkStage(s,opportunities){
  const E=root.VesaBuyerDirectory,errors=[];
  for(const k of ['id','opportunityId','stage','sourceRef','reviewedBy'])
   if(!E.valid(s?.[k],250))errors.push('Stage amendment requires sourced '+k);
  if(!opportunities.has(s?.opportunityId)||!E.date(s?.reviewDate))
   errors.push('Stage amendment needs matching opportunity and review date');
  if(s?.confirmedPO===true||s?.probability!==undefined)
   errors.push('Stage amendment cannot create confirmed PO or inferred probabilities');
  return errors;
 }
 static latestStage(record,opportunityId){
  const o=record.opportunities.find(x=>x.id===opportunityId);
  if(!o)return null;
  const events=record.stageChanges.filter(x=>x.opportunityId===opportunityId);
  const last=events.at(-1);
  return {stage:last?.stage||o.stage,stageSourceRef:last?.sourceRef||o.stageSourceRef,
   asOfDate:last?.reviewDate||o.reviewDate,confirmationOfOrder:false,
   winProbability:null,externallyVerified:false};
 }
 static pipeline(record){
  const E=root.VesaBuyerDirectory,check=E.validate(record);if(!check.ok)throw Error(check.errors.join('; '));
  const sums=new Map();const unknown=[];
  for(const o of record.opportunities){
   if(this.parseCents(o.amount)===null){
    unknown.push({opportunityId:o.id,reason:'Monetary value Needs Information',notConfirmedOrder:true});continue;
   }
   const key=o.currency;const prev=sums.get(key)||0n;sums.set(key,prev+this.parseCents(o.amount));
  }
  return {byCurrency:[...sums].map(([currency,cents])=>({currency,sourceAmount:this.money(cents),
   notRevenue:true,notConfirmedOrders:true,probabilityApplied:false})),
   unknown,notForecast:true,noCurrencyConversion:true,buyerApproved:false};
 }
}
root.VesaCRMOpportunityState=VesaCRMOpportunityState;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaCRMOpportunityState;
})(typeof globalThis!=='undefined'?globalThis:this);
