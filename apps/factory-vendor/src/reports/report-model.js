/* APP-08 draft factory reports. Certificate dates are not accreditation.
 * HTML is escaped; formula-like XLSX strings are prefixed, numeric counts stay numeric.
 */
(function(root){
'use strict';
class FactoryVendorReportModel{
 static escape(v){return String(v??'Needs Information').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;':'&quot;',"'":'&#39;'}[c]));}
 static safeCell(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(record,asOf){
  const P=root.VesaFactoryVendorProfile,C=root.VesaFactoryCertificationEvidence;
  const checked=P.validate(record);
  if(!checked.ok)throw Error(checked.errors.join('; '));
  if(!P.date(asOf))throw Error('Report as-of date must be real and explicit');
  const site=id=>record.sites.find(s=>s.id===id)?.siteName||'Needs Information';
  const certified=record.certificates.map(x=>({...x,dateState:C.dateState(x,asOf).dateState}));
  const exceptions=[];
  for(const s of record.sites){
   if(!record.capabilities.some(c=>c.siteId===s.id))exceptions.push([s.siteName,'No dated declared product capability','Needs Information']);
   if(!record.certificates.some(c=>c.siteId===s.id))exceptions.push([s.siteName,'No source certificate document','Needs Information']);
   if(!record.reviews.some(v=>v.siteId===s.id))exceptions.push([s.siteName,'No internal onboarding review','Needs Information']);
  }
  for(const c of record.capabilities)if(c.declaredMonthlyCapacity===null||c.declaredMonthlyCapacity===undefined)
   exceptions.push([site(c.siteId),'Declared category '+c.category+' has no sourced capacity','Needs Information']);
  for(const c of certified)if(c.dateState!=='inside-documented-date-range-only'||c.documentStatus!=='document-supplied')
   exceptions.push([site(c.siteId),c.scheme+' document '+c.dateState+'/'+c.documentStatus,'Not an authority compliance outcome']);
  for(const v of record.reviews)if(v.internalOutcome!=='internal-reviewed')
   exceptions.push([site(v.siteId),'Internal onboarding '+v.internalOutcome,'Not buyer acceptance']);
  return{
   'Factory Profile':[['Field','Source value'],['Vendor name',record.header.vendorName],['Country',record.header.country],
    ['Vendor source',record.header.sourceRef],['Local revision',record.revision],
    ['Status','INTERNAL DRAFT — NOT CERTIFIED'],['Certificate authority','NEVER INFERRED'],['Report as of',asOf]],
   'Factory Sites':[['Site','Country','Declared process','Source'],...record.sites.map(s=>[s.siteName,s.country,s.process,s.sourceRef])],
   'Declared Capacity':[['Site','Garment category','Declared monthly capacity','Unit','As of','Category source','Capacity document','Reviewed by','Review date','MOQ','Lead days','Lead source','Authority'],...record.capabilities.map(c=>[site(c.siteId),c.category,c.declaredMonthlyCapacity??null,c.unit,c.asOfDate,c.sourceRef,c.capacitySourceRef||'Needs Information',c.reviewedBy,c.reviewDate,c.moq??null,c.leadDays??null,c.leadDaysSource||'Needs Information','DECLARED ONLY; NOT GUARANTEED'])],
   'Certificate Date Register':[['Site','Scheme','Claimed issuer','Document','Source','Issue','Expiry','Document state','Date-only state','Review date','Authority'],...certified.map(c=>[site(c.siteId),c.scheme,c.issuer,c.documentRef,c.sourceRef,c.issueDate,c.expiryDate,c.documentStatus,c.dateState,c.reviewDate,'NOT EXTERNALLY CERTIFIED'])],
   'Internal Onboarding':[['Site','Internal reviewer','Review date','Checklist','Source','Internal outcome','Buyer approval'],...record.reviews.map(v=>[site(v.siteId),v.reviewer,v.reviewDate,v.checklistRef,v.sourceRef,v.internalOutcome,'NOT GIVEN'])],
   'Period Performance':[['Site','Metric','Unit','Period from','Period to','Count','Denominator','Rate','Source','Reviewer','Review date'],...record.performance.map(v=>[site(v.siteId),v.metric,v.unit,v.periodFrom,v.periodTo,v.numerator,v.denominator,v.numerator/v.denominator,v.sourceRef,v.reviewer,v.reviewDate])],
   'Exceptions and Missing':[['Site','Evidence issue','Authority boundary'],...exceptions],
   'Manual Read-Only Sources':[['Site','Source type','Source App','Source ID','Revision','Source date','Locally reviewed by','Review date','Authority'],...(record.manualReferences||[]).map(v=>[site(v.siteId),v.kind,v.source.sourceApp,v.source.recordId,v.source.revisionId,v.source.sourceDate,v.localReviewer,v.localReviewDate,'LOCAL COPY; NOT APPROVAL'])],
   'Revision History':[['Revision','At','Action','Evidence ID'],...record.audit.map(a=>[a.revision,a.at,a.action,a.recordId||''])]
  };
 }
 static html(record,asOf){
  const content=this.rows(record,asOf);
  return '<article class="fv-report"><h2>Factory &amp; Vendor 360 — DRAFT / INTERNAL REVIEW ONLY</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Declared capacity is not guaranteed production. Dates/issuer/received certificate documents DO NOT establish BSCI, WRAP, ISO, buyer or independent compliance approval. Internal onboarding cannot approve a factory.</p>'+
   Object.entries(content).map(([label,table])=>'<section class="fv-report-section"><h3>'+this.escape(label)+'</h3><div class="fv-scroll"><table class="fv-table"><thead><tr>'+table[0].map(h=>'<th>'+this.escape(h)+'</th>').join('')+'</tr></thead><tbody>'+
    table.slice(1).map(row=>'<tr>'+row.map(val=>'<td>'+this.escape(val)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>').join('')+
   '</article>';
 }
 static numeric(name,column){
  return({'Factory Profile':new Set(), 'Factory Sites':new Set(),
   'Declared Capacity':new Set([2,9,10]),'Certificate Date Register':new Set(),
   'Internal Onboarding':new Set(),'Period Performance':new Set([5,6,7]),
   'Exceptions and Missing':new Set(),'Manual Read-Only Sources':new Set(),
   'Revision History':new Set([0])}[name]||new Set()).has(column);
 }
 static excelRows(name,table){
  return table.map((row,i)=>row.map((v,j)=>{
   if(i>0&&this.numeric(name,j)&&typeof v==='number'&&Number.isFinite(v))return v;
   if(name==='Factory Profile'&&i>0&&row[0]==='Local revision'&&typeof v==='number')return v;
   return this.safeCell(v===null||v===undefined||v===''?'Needs Information':v);
  }));
 }
}
root.VesaFactoryVendorReportModel=FactoryVendorReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryVendorReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
