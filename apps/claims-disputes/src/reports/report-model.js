/* APP-14 case DRAFT only. Escapes untrusted text, preserves sourced currency and source review,
 * protects Excel formula-prefix cells. Report does not certify legal/bank settlement or alter AQL.
 */
(function(root){
'use strict';
class VesaClaimsReportModel{
 static escape(v){return String(v??'Needs Information').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static formulaSafe(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(p,asOf){
  const E=root.VesaClaimRegister,M=root.VesaClaimExposure,S=root.VesaClaimSettlementHistory;
  const v=E.validate(p);if(!v.ok)throw Error(v.errors.join('; '));
  if(!E.date(asOf))throw Error('Case report requires exact source review as-of date');
  const h=p.header,expo=M.summarize(p),recon=S.reconcile(p),status=E.localStatus(p),gaps=[];
  if(!p.findings.length)gaps.push(['Claim has no sourced finding','Needs Information']);
  for(const f of expo.unknownFindings)gaps.push(['Claim '+f.findingId+' amount missing',f.reason]);
  if(!p.evidence.length&&!(p.manualReferences||[]).length)
   gaps.push(['No original AQL/Shipment/PO reference','Source snapshot must be locally reviewed']);
  if(!p.responses.length)gaps.push(['No source-recorded outside-party response','Liability/responsible party NOT INFERRED']);
  if(!p.agreements.length)gaps.push(['No sourced signed/agreed amount','Alleged amount remains disputed, not payable']);
  for(const s of p.settlements)if(s.kind==='draft-credit')
   gaps.push(['Draft credit '+s.id+' is not a receipt','Do not offset documented agreed balance']);
  for(const b of recon.byAgreement)if(b.outstandingAgainstDocumentedAgreement!=='0.00')
   gaps.push(['Agreement '+b.agreementId+' still has sourced outstanding balance',
    b.currency+' '+b.outstandingAgainstDocumentedAgreement+' — NOT BANK VERIFIED']);
  return{
   'Claim Case Source':[['Field','Locally entered value'],['Case',h.caseNumber],['Buyer',h.buyer],
    ['Supplier',h.supplier],['PO source ID',h.poNo],['Shipment source ID',h.shipmentRef],
    ['Claim category',h.claimCategory],['Alleged issue',h.allegationSummary],
    ['Raised date',h.openedDate],['Case source',h.sourceRef],['Locally reviewed by',h.reviewedBy],
    ['Local review date',h.reviewDate],['As-of date',asOf],['Case revision',p.revision],
    ['Manually entered state',status.state],['Legal or buyer liability confirmed','NO'],
    ['Actual bank execution independently authenticated','NO'],['Original AQL updated','NO']],
   'Alleged Claim Findings':[['Finding ID','Category','Description','Affected Quantity','Unit','Alleged Value',
    'Currency','Local review basis','Amount source','Original source','Source date','External liability'],
    ...p.findings.map(f=>[f.id,f.category,f.description,f.affectedQty,f.quantityUnit,
     f.allegedAmount||null,f.currency||null,f.valueReviewState,
     f.amountSourceRef||null,f.sourceRef,f.sourceDate,'NOT ADMITTED'])],
   'Alleged Exposure by Currency':[['Currency','Locally sourced alleged total','Admitted liability','FX conversion'],
    ...expo.byCurrency.map(x=>[x.currency,x.sourceReviewedAllegedExposure,'NO','NONE'])],
   'Read-Only Source Evidence':[['Evidence ID','Source App','Record Type','Original ID','Revision',
    'Human Summary','Original Source','Source Date','Local Reviewer'],
    ...p.evidence.map(x=>[x.id,x.sourceApp,x.recordType,x.recordId,x.revisionId,
     x.summary,x.sourceRef,x.sourceDate,x.reviewedBy])],
   'Outside-Party Responses':[['Entry ID','Party','Received Date','Stance','Source Summary',
    'Original Document','Local Reviewer','Liability Inferred'],
    ...p.responses.map(x=>[x.id,x.party,x.receivedDate,x.stance,x.summary,
     x.sourceRef,x.reviewedBy,'NO'])],
   'Recorded Claim Agreements':[['Agreement ID','Original Currency','Separately Agreed Amount',
    'Agreement Source Date','Outside Named Party','Outside Authority Source','Local Reviewer',
    'Local Review Date','Authority Meaning'],
    ...p.agreements.map(a=>[a.id,a.currency,a.agreedAmount,a.agreementDate,a.externallyNamedParty,
     a.externalAuthorityRef,a.reviewedBy,a.reviewDate,'SOURCE ENTERED / NOT AUTHENTICATED'])],
   'Settlement Event Sources':[['Event ID','Agreement','Type','Currency','Amount','Date',
    'Document Source','Receipt Source (if actual)','External Payment Verified'],
    ...p.settlements.map(x=>[x.id,x.agreementId,x.kind,x.currency,x.amount,x.recordedDate,
     x.sourceRef,x.actualReceiptRef||null,'NO'])],
   'Agreement Balances by Currency':[['Agreement','Currency','Locally agreed',
    'Actual receipt docs reviewed','Outstanding against sourced agreement',
    'Draft credit excluded','Bank/Legal Confirmation'],
    ...recon.byAgreement.map(b=>[b.agreementId,b.currency,b.agreedSourceAmount,
     b.sourceReviewedActualReceipts,b.outstandingAgainstDocumentedAgreement,
     b.proposedCreditDrafts.map(x=>x.proposedAmount).join(', ')||null,'NOT VERIFIED'])],
   'Manual Review Snapshots':[['Kind','Source App','Original Record ID','Original Revision',
    'Original Date','Original Reviewer','Local Reviewer','Review Date','Source Status'],
    ...(p.manualReferences||[]).map(x=>[x.kind,x.source.sourceApp,x.source.recordId,
     x.source.revisionId,x.source.sourceDate,x.source.verifiedBy,x.localReviewer,
     x.localReviewDate,'HUMAN-REVIEWED ONLY / ORIGINAL UNCHANGED'])],
   'Local Status Evidence':[['Event ID','Source Entered State','Decision Date','Reviewer',
    'Outside Authority Reference','Source Document','Does Not Automatically Settle'],
    ...p.decisions.map(d=>[d.id,d.newState,d.decisionDate,d.reviewedBy,
     d.externalAuthorityRef||null,d.decisionSourceRef,'YES'])],
   'Unresolved Sources':[['Local evidence gap','Meaning'],...gaps],
   'Immutable Event Audit':[['Revision','Timestamp','Action','Source ID'],
    ...p.audit.map(a=>[a.revision,a.at,a.action,a.recordId||null])]
  };
 }
 static html(p,asOf){
  return'<article class="clm-report"><h2>VESA Claims &amp; Disputes 360 — DRAFT / SOURCE REVIEW ONLY</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Alleged values are NOT legal liability, a failed AQL is NOT automatic admission, a draft credit is NOT actual receipt, and no bank settlement, buyer signature, payment execution, legal decision or AQL modification is certified. All references are locally uploaded, source-labelled, and not externally authenticated.</p>'+
   Object.entries(this.rows(p,asOf)).map(([name,rows])=>'<section class="clm-report-section"><h3>'+this.escape(name)+
    '</h3><div class="clm-scroll"><table class="clm-table"><thead><tr>'+rows[0].map(x=>'<th>'+this.escape(x)+'</th>').join('')+
    '</tr></thead><tbody>'+rows.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+this.escape(v)+
    '</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>').join('')+'</article>';
 }
 static numeric(name,col){
  return ({
   'Alleged Claim Findings':new Set([3,5]),
   'Alleged Exposure by Currency':new Set([1]),
   'Recorded Claim Agreements':new Set([2]),
   'Settlement Event Sources':new Set([4]),
   'Agreement Balances by Currency':new Set([2,3,4]),
   'Immutable Event Audit':new Set([0])
  }[name]||new Set()).has(col);
 }
 static excelRows(name,rows){
  return rows.map((row,i)=>row.map((value,j)=>{
   if(i>0&&typeof value==='number'&&Number.isSafeInteger(value))return value;
   if(i>0&&this.numeric(name,j)&&typeof value==='string'&&/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value))
    return Number(value);
   if(name==='Claim Case Source'&&i>0&&row[0]==='Case revision'&&typeof value==='number')return value;
   return this.formulaSafe(value===undefined||value===null||value===''?'Needs Information':value);
  }));
 }
}
root.VesaClaimsReportModel=VesaClaimsReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimsReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
