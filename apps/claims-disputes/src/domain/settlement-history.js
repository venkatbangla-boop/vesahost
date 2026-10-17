/* APP-14 explicitly sourced agreement vs proposed credit vs documentary receipt.
 * No automatic bank transfer, liability admission, signed settlement or closed status.
 */
(function(root){
'use strict';
class VesaClaimSettlementHistory{
 static agreementErrors(a){
  const E=root.VesaClaimRegister,M=root.VesaClaimExposure,errors=[];
  for(const k of ['id','sourceRef','externalAuthorityRef','externallyNamedParty','reviewedBy'])
   if(!E.valid(a?.[k],500))errors.push('Agreement must separately cite '+k);
  if(!E.date(a?.agreementDate)||!E.date(a?.reviewDate))
   errors.push('Documented agreement and local reviewer dates required');
  if(M.parse(a?.agreedAmount)===null||!M.currency(a?.currency))
   errors.push('Source agreement requires exact positive amount and original currency');
  if(a?.authorityState!=='outside-party-evidence-entered-locally')
   errors.push('Agreement is a human-labelled external source, not presumed from inspection');
  if(a?.paymentConfirmed===true||a?.bankTransferExecuted===true||a?.supplierLiabilityInferred===true)
   errors.push('Agreement is not bank receipt, payment execution or inferred legal liability');
  return errors;
 }
 static settlementErrors(x,agreements){
  const E=root.VesaClaimRegister,M=root.VesaClaimExposure,errors=[];
  for(const k of ['id','agreementId','sourceRef','reviewedBy'])
   if(!E.valid(x?.[k],500))errors.push('Settlement event needs '+k);
  if(!['documented-receipt','draft-credit'].includes(x?.kind))
   errors.push('Only independently recorded receipt or non-payment draft credit are supported');
  if(!E.date(x?.recordedDate)||!E.date(x?.reviewDate))
   errors.push('Settlement event requires dated source and human review');
  if(M.parse(x?.amount)===null||!M.currency(x?.currency))
   errors.push('Settlement event requires exact positive source amount and currency');
  const agreement=agreements.get(x?.agreementId);
  if(!agreement||agreement.currency!==x?.currency)errors.push('Settlement must link to same-currency documentary agreement');
  if(agreement&&x?.recordedDate<agreement.agreementDate)errors.push('Settlement event predates source agreement');
  if(x?.kind==='documented-receipt'&&(!E.valid(x?.actualReceiptRef)||
   !E.valid(x?.receiptReviewedBy)||!E.date(x?.receiptReviewDate)))
   errors.push('Count receipt only with distinct actual receipt ID/source and dated review');
  if(x?.kind==='draft-credit'&&x?.actualReceiptRef)
   errors.push('Proposed credit/debit note draft cannot be treated as actual receipt');
  if(x?.bankPaymentExecuted===true||x?.bankAuthenticated===true||x?.claimAutomaticallyClosed===true)
   errors.push('Source-only settlement event cannot claim bank execution/authentication or automatic case closure');
  return errors;
 }
 static reconciliationErrors(p){
  const M=root.VesaClaimExposure,totals=new Map(),receipts=new Set(),errors=[];
  for(const x of p.settlements){
   if(x.kind!=='documented-receipt')continue;
   if(x.actualReceiptRef){
    const key=x.agreementId+'\u001f'+x.actualReceiptRef;
    if(receipts.has(key))errors.push('Duplicate actual receipt source must not be counted twice');
    receipts.add(key);
   }
   const n=M.parse(x.amount);if(n!==null)totals.set(x.agreementId,(totals.get(x.agreementId)||0n)+n);
  }
  for(const a of p.agreements){
   const cap=M.parse(a.agreedAmount),paid=totals.get(a.id)||0n;
   if(cap!==null&&paid>cap)errors.push('Source-counted documented receipts exceed locally entered agreement; no overpayment inference');
  }
  return errors;
 }
 static reconcile(p){
  const E=root.VesaClaimRegister,M=root.VesaClaimExposure;const check=E.validate(p);
  if(!check.ok)throw Error(check.errors.join('; '));
  const result=p.agreements.map(a=>{
   const paid=p.settlements.filter(x=>x.agreementId===a.id&&x.kind==='documented-receipt')
    .reduce((sum,x)=>sum+M.parse(x.amount),0n);
   const drafts=p.settlements.filter(x=>x.agreementId===a.id&&x.kind==='draft-credit')
    .map(x=>({settlementId:x.id,proposedAmount:x.amount,currency:x.currency,
     notActualSettlement:true,sourceRef:x.sourceRef}));
   return{agreementId:a.id,currency:a.currency,agreedSourceAmount:M.fmt(M.parse(a.agreedAmount)),
    sourceReviewedActualReceipts:M.fmt(paid),
    outstandingAgainstDocumentedAgreement:M.fmt(M.parse(a.agreedAmount)-paid),
    proposedCreditDrafts:drafts,localDocumentationOnly:true,
    notBankAuthenticated:true,notLegalSettlementCertification:true,
    caseAutomaticallyClosed:false,sourceRef:a.sourceRef,externalAuthorityRef:a.externalAuthorityRef};
  });
  return{byAgreement:result,noAutomaticPayment:true,noAutomaticClosure:true,
   noCrossCurrencyAddition:true,disputedAmountsNotSettled:true};
 }
}
root.VesaClaimSettlementHistory=VesaClaimSettlementHistory;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimSettlementHistory;
})(typeof globalThis!=='undefined'?globalThis:this);
