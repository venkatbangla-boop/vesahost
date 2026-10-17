/* APP-11 draft-only locally generated buyer reports. No contact transmission, FX, PO or consent authority.
 * HTML escapes untrusted fields; XLSX text protects formula prefixes and numeric columns stay numbers.
 */
(function(root){
'use strict';
class VesaCRMReportModel{
 static escape(v){return String(v??'Needs Information').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static excelCell(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(record,asOf){
  const E=root.VesaBuyerDirectory,O=root.VesaCRMOpportunityState,F=root.VesaCRMFollowupScheduler;
  const c=E.validate(record);if(!c.ok)throw Error(c.errors.join('; '));
  if(!E.date(asOf))throw Error('CRM report needs exact as-of date');
  const pipe=O.pipeline(record),tasks=F.evaluate(record,asOf);
  const enquiries=new Map(record.enquiries.map(x=>[x.id,x]));
  const missing=[];
  if(!record.contacts.length)missing.push(['No locally reviewed contact evidence','Needs Information']);
  if(!record.enquiries.length)missing.push(['No sourced enquiry','Needs Information']);
  if(!record.opportunities.length)missing.push(['No sourced opportunity','Needs Information']);
  for(const c of record.contacts)if(c.consentStatus!=='local-consent-evidence-recorded')
   missing.push(['Contact '+c.contactName+' consent status: '+c.consentStatus,'LEGAL BASIS NOT VERIFIED']);
  for(const o of pipe.unknown)missing.push(['Opportunity '+o.opportunityId+' has no source-entered amount',o.reason]);
  for(const t of tasks)if(t.localState==='overdue')missing.push(['Overdue on-screen follow-up '+t.followupId,'NO EMAIL/SMS SENT']);
  return{
   'Buyer Source Profile':[['Field','Source-only value'],
    ['Organization',record.header.organizationName],['Territory',record.header.territory],['Organization source',record.header.sourceRef],
    ['Local revision',record.revision],['As-of date',asOf],['Status',record.status],['Confirmed PO','NOT CREATED'],
    ['Contact consent legally verified','NO'],['CRM private storage','LOCAL BROWSER (NOT ENCRYPTED/SERVER AUTH)']],
   'Private Contact Register':[['Contact','Role','Email','Phone','Source','Privacy/Consent Evidence','Local consent claim','Review date','Reviewer'],...record.contacts.map(x=>[
    x.contactName,x.role,x.email||null,x.phone||null,x.sourceRef,x.privacySourceRef,x.consentStatus,x.reviewDate,x.reviewedBy])],
   'Buyer Enquiries':[['Enquiry ID','Category','Style request','Requested quantity','Unit','Source date','Source'],...record.enquiries.map(x=>[
    x.id,x.category,x.styleRequest||null,x.requestedQuantity??null,x.unit||null,x.sourceDate,x.sourceRef])],
   'Source Opportunity Pipeline':[['Opportunity ID','Enquiry ID','Enquiry category','Stage (local)','Stage evidence','Stage date','Entered amount','Currency','Money source','Reviewed by','Amount review date','Order authority'],...record.opportunities.map(x=>{
    const v=O.latestStage(record,x.id);return[x.id,x.enquiryId,enquiries.get(x.enquiryId)?.category||null,v.stage,v.stageSourceRef,v.asOfDate,
     x.amount||null,x.currency||null,x.amountSourceRef||null,x.amountReviewedBy||null,x.amountReviewDate||null,'NOT CONFIRMED PO'];})],
   'Source Amounts by Currency':[['Currency','Exact entered source total','Meaning','FX or probability'],...pipe.byCurrency.map(x=>[
    x.currency,x.sourceAmount,'NOT REVENUE / NOT ORDER','NO FX / NO PROBABILITY'])],
   'Local Follow-up Calendar':[['Followup ID','Link type','Linked record','Local owner','Created date','Due date','Days until due','Local status','Evidence','Notification'],...record.followups.map((f,i)=>[
    f.id,f.linkType,f.linkId,f.owner,f.createdDate,f.dueDate,tasks[i].daysUntilDue,tasks[i].localState,f.sourceRef,'NONE SENT'])],
   'Missing and Exceptions':[['Local evidence gap','Authority / status'],...missing],
   'Manual Read-Only References':[['Type','Source App','Record ID','Source revision','Source date','Source reviewer','Local reviewer','Local review date','Authority'],...(record.manualReferences||[]).map(x=>[
    x.kind,x.source.sourceApp,x.source.recordId,x.source.revisionId,x.source.sourceDate,x.source.verifiedBy,x.localReviewer,x.localReviewDate,'READ-ONLY / NOT APPROVAL'])],
   'Change History':[['Revision','Date/time','Action','Source item'],...record.audit.map(a=>[a.revision,a.at,a.action,a.recordId||null])]
  };
 }
 static html(p,asOf){
  return '<article class="crm-report"><h2>Buyer CRM 360 — DRAFT / SOURCE REVIEW ONLY</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Locally entered contacts are private to this browser and NOT protected by server-side authentication/encryption. Obtain a lawful basis for real contacts. Source-entered pipeline is NOT confirmed purchase orders, revenue, foreign-exchange conversion or estimated win probability. No email or SMS has been sent.</p>'+
   Object.entries(this.rows(p,asOf)).map(([name,rows])=>'<section class="crm-report-section"><h3>'+this.escape(name)+'</h3><div class="crm-scroll"><table class="crm-table"><thead><tr>'+rows[0].map(k=>'<th>'+this.escape(k)+'</th>').join('')+'</tr></thead><tbody>'+
    rows.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+this.escape(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>').join('')+'</article>';
 }
 static numeric(name,j){
  return({'Buyer Enquiries':new Set([3]),'Local Follow-up Calendar':new Set([6]),
   'Change History':new Set([0])}[name]||new Set()).has(j);
 }
 static excelRows(name,table){
  return table.map((row,i)=>row.map((v,j)=>{
   if(i>0&&this.numeric(name,j)&&typeof v==='number'&&Number.isSafeInteger(v))return v;
   if(i>0&&name==='Buyer Source Profile'&&row[0]==='Local revision'&&typeof v==='number')return v;
   if(i>0&&name==='Source Amounts by Currency'&&j===1&&typeof v==='string'&&
    /^(?:0|[1-9]\d{0,9})\.\d{2}$/.test(v))return Number(v);
   return this.excelCell(v===null||v===undefined||v===''?'Needs Information':v);
  }));
 }
}
root.VesaCRMReportModel=VesaCRMReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaCRMReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
