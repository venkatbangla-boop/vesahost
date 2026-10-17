/* APP-12 privacy-safe DRAFT SOURCE REPORT; no supplier accreditation, fiscal advice or automatic PO.
 * Escape HTML and keep supplier inputs as explicitly entered values with exact units/currencies.
 */
(function(root){
'use strict';
class VesaSupplierReportModel{
 static escape(v){return String(v??'Needs Information').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));}
 static formulaSafe(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(p,asOf){
  const Q=root.VesaSupplierQuote,G=root.VesaSupplierComparability,L=root.VesaSupplierLanded;
  const chk=Q.validate(p);if(!chk.ok)throw Error(chk.errors.join('; '));
  if(!Q.date(asOf))throw Error('Supplier report requires an exact as-of date');
  const req=p.requirement,byId=new Map(p.offers.map(o=>[o.id,o])),gated=G.matrix(p,asOf);
  const gateBy=new Map(gated.map(x=>[x.offerId,x])),landed=p.scenarios.map(s=>L.evaluate(p,s.id));
  const comp=L.comparison(p,asOf),alerts=[];
  if(p.offers.length<2)alerts.push(['Less than two sourced offers','Needs Information before meaningful comparison']);
  if(!(p.manualReferences||[]).length)alerts.push(['No user-reviewed Tech Pack/Materials material-spec snapshot',
   'No automatic Tech Pack/Fabric & Trims data reads']);
  for(const g of gated)for(const issue of g.issues||[])alerts.push([byId.get(g.offerId)?.supplier||g.offerId,issue]);
  for(const s of landed)if(s.status!=='COMPARABLE — SOURCE ONLY')
   for(const issue of s.issues||[])alerts.push([s.supplier,issue]);
  if(p.offers.length&&!p.scenarios.length)alerts.push(['No fully sourced landed-cost scenarios','Freight/Duty/Tax/LC and FX applicability not assumed']);
  return{
   'Material Requirement':[['Field','Source-only value'],['Article',req.article],
    ['Composition',req.composition],['GSM',req.gsm],['Width',req.width+' '+req.widthUnit],
    ['Construction',req.construction],['Shrinkage basis',req.shrinkageBasis],
    ['Shrinkage declared',req.shrinkage],['Source',req.sourceRef],
    ['Locally reviewed by',req.reviewedBy],['Reviewed date',req.reviewDate],
    ['Comparison trade term',req.requestedTradeTerm],['Delivery term',req.requestedDeliveryTerm],
    ['As-of date',asOf],['Local event revision',p.revision],
    ['Status',p.status],['Supplier approved','NO'],['FOB garment costing calculated','NO']],
   'Supplier Source Offers':[['Offer ID','Supplier','Quotation Ref','Quote Date','Valid To','Article','Composition','GSM',
    'Width','Width Unit','Construction','Shrinkage Basis','Shrinkage','Unit Price','Currency','Price Unit',
    'MOQ','MOQ Unit','Lead Days','Trade Term','Origin','Delivery Term','Quality Review','Quality Source',
    'Main Source'],...p.offers.map(o=>[o.id,o.supplier,o.quoteRef,o.quoteDate,o.validTo,o.article,o.composition,o.gsm,
    o.width,o.widthUnit,o.construction,o.shrinkageBasis,o.shrinkage,o.unitPrice,o.currency,o.unit,
    o.moq,o.moqUnit,o.leadDays,o.tradeTerm,o.origin,o.deliveryTerm,
    o.qualityEquivalence||'Needs Information',o.qualitySourceRef,o.sourceRef])],
   'Comparability Gate':[['Supplier','Source Quote ID','As-Of Date','Status','Reasons/Exceptions','MOQ','MOQ Unit','Lead Days',
    'Vendor Certified','Automatic Choice'],...gated.map(g=>[byId.get(g.offerId)?.supplier||null,g.offerId,asOf,
    g.status,(g.issues||[]).join('; ')||'Source match recorded only',g.moq??null,g.moqUnit||null,g.leadDays??null,'NO','NO'])],
   'Landed Source Scenarios':[['Scenario','Offer ID','Supplier','As-Of Date','Target Unit','Currency',
    'Offer Price (converted only if sourced)','Landed Input (only if complete)','Status','Missing/Exception',
    'FX source','Unit ratio source','Freight source','Duty source','Tax source','LC source','Approved Purchase'],
    ...p.scenarios.map((s,i)=>{const result=landed[i],o=byId.get(s.offerId);
     return[s.id,s.offerId,o?.supplier||null,s.asOfDate,s.targetUnit,s.targetCurrency,
      result.quotedInput||result.knownOfferPrice||null,result.landedInput||null,result.status,
      (result.issues||[]).join('; ')||'Source-only arithmetic',s.fx?.sourceRef||null,
      s.conversion?.sourceRef||null,s.charges?.freight?.sourceRef||null,s.charges?.duty?.sourceRef||null,
      s.charges?.tax?.sourceRef||null,s.charges?.lc?.sourceRef||null,'NO'];})],
   'Conditional Price Order':[['Conditional Price Rank','Offer ID','Supplier','Landed Input','Currency','Per Unit',
    'Approval'],...comp.ranked.map(s=>[s.priceOnlyRank,s.offerId,s.supplier,s.landedInput,s.targetCurrency,s.targetUnit,
     'INTERNAL COMPARISON, NO SUPPLIER APPROVAL'])],
   'Locally Recorded Decisions':[['Offer ID','Reviewer','Review Date','Local State','Source','External Approval'],
    ...p.decisions.map(d=>[d.offerId,d.reviewer,d.reviewDate,d.state,d.sourceRef,'NOT VERIFIED'])],
   'Reviewed Source Snapshots':[['Kind','Source App','Record','Revision','Source Date','Source Reviewer',
    'Local Reviewer','Review Date','Source Validity'],...(p.manualReferences||[]).map(x=>[
     x.kind,x.source.sourceApp,x.source.recordId,x.source.revisionId,x.source.sourceDate,
     x.source.verifiedBy,x.localReviewer,x.localReviewDate,'LOCAL REVIEW ONLY'])],
   'Open Information Gaps':[['Material or offer','Missing/Non-comparable source'],...alerts],
   'Revision Audit':[['Local Revision','Timestamp','Action','Source ID'],
    ...p.audit.map(a=>[a.revision,a.at,a.action,a.recordId||null])]
  };
 }
 static html(p,asOf){
  const rows=this.rows(p,asOf);
  return '<article class="fs-report"><h2>Fabric &amp; Supplier Comparison 360 — DRAFT / SOURCE REVIEW ONLY</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Quoted prices, source-entered FX, conversion factors, tax, freight and LC charges are NOT externally verified. Fabric GSM, width and construction mismatches are NOT COMPARABLE. A conditional low-cost rank is NOT supplier certification, a purchase authorization, approved buyer BOM, physical material booking, or final garment FOB.</p>'+
   Object.entries(rows).map(([name,data])=>'<section class="fs-report-section"><h3>'+this.escape(name)+'</h3><div class="fs-scroll"><table class="fs-table"><thead><tr>'+data[0].map(k=>'<th>'+this.escape(k)+'</th>').join('')+'</tr></thead><tbody>'+
    data.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+this.escape(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>').join('')+
   '</article>';
 }
 static numeric(name,column){
  return({
   'Supplier Source Offers':new Set([7,8,12,13,16,18]),
   'Comparability Gate':new Set([5,7]),
   'Landed Source Scenarios':new Set([6,7]),
   'Conditional Price Order':new Set([0,3]),
   'Revision Audit':new Set([0])
  }[name]||new Set()).has(column);
 }
 static excelRows(name,table){
  return table.map((row,i)=>row.map((v,j)=>{
   if(i>0&&typeof v==='number'&&Number.isSafeInteger(v))return v;
   if(i>0&&this.numeric(name,j)&&typeof v==='string'&&/^(?:0|[1-9]\d{0,9})(?:\.\d{1,4})?$/.test(v)){
    const n=Number(v);if(Number.isFinite(n)&&n<=1e9)return n;
   }
   if(name==='Material Requirement'&&i>0&&row[0]==='Local event revision'&&typeof v==='number')return v;
   return this.formulaSafe(v===undefined||v===null||v===''?'Needs Information':v);
  }));
 }
}
root.VesaSupplierReportModel=VesaSupplierReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
