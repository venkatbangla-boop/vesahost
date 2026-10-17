/* APP-10 draft-only artwork source/revision report; no barcode issuance or legal approval.
 * Pure model, escaped HTML and formula-safe Excel numeric columns.
 */
(function(root){
'use strict';
class VesaArtworkReportModel{
 static escape(v){return String(v??'Needs Information').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static safeExcel(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(p){
  const E=root.VesaArtworkRevision,L=root.VesaLabelSpec,D=root.VesaArtworkReviewState;
  const validation=E.validate(p);if(!validation.ok)throw Error(validation.errors.join('; '));
  const state=D.effective(p),rev=new Map(p.revisions.map(v=>[v.id,v.number]));
  const last=p.revisions.at(-1)||null;
  const versions=p.revisions.map(v=>{
   const spec=v.spec||{},bar=spec.barcode?L.barcodeStatus(spec.barcode):null;
   return[v.number,v.id,v.sourceDate,v.artworkRef,v.sourceRef,
    L.number(spec.width),L.number(spec.height),spec.unit||null,
    Number.isSafeInteger(spec.repeatCount)?spec.repeatCount:null,
    spec.dimensionSourceRef||null,spec.repeatSourceRef||null,bar?.warning||'Needs Information',
    spec.washCareText||null,spec.fiberText||null,spec.countryText||null,
    spec.contentSourceRef||null,'DRAFT SOURCE ONLY'];
  });
  const comparison=[];
  for(let i=1;i<p.revisions.length;i++){
   const from=p.revisions[i-1],to=p.revisions[i],fields=['artworkRef','width','height','unit','method','colourRef','repeatCount','washCareText','fiberText','countryText','barcode'];
   const f=field=>field==='artworkRef'?from.artworkRef:field==='barcode'?JSON.stringify(from.spec?.barcode??null):from.spec?.[field];
   const t=field=>field==='artworkRef'?to.artworkRef:field==='barcode'?JSON.stringify(to.spec?.barcode??null):to.spec?.[field];
   for(const key of fields)if(String(f(key)??'')!==String(t(key)??''))
    comparison.push([from.number,to.number,key,String(f(key)??'Needs Information'),String(t(key)??'Needs Information'),'MUST RE-REVIEW; PRIOR DECISION IS NOT CURRENT']);
  }
  const notices=[];
  if(!last)notices.push(['No source-backed artwork revision recorded','Needs Information']);
  else {
   if(!p.decisions.some(d=>d.revisionId===last.id))notices.push(['Latest artwork revision has no recorded matching review decision','Needs Information']);
   if(last.spec?.barcode){
    const b=L.barcodeStatus(last.spec.barcode);
    notices.push([b.warning,'Check digit only; GS1 ownership and scan NOT verified']);
   }
   if(['washCareText','fiberText','countryText'].some(k=>!!L.text(last.spec?.[k])))
    notices.push(['Care, fiber and country text taken from source, not legally validated','Regional requirements Needs Information']);
  }
  if(!(p.manualReferences||[]).length)notices.push(['No manually reviewed Tech Pack/Sampling snapshot','No automatic sibling reads']);
  return {
   'Source and Status':[['Field','Value'],['Style',p.header.style],['Colour',p.header.colour],['Size',p.header.size],
    ['Artwork category',p.header.itemType],['Placement',p.header.placement],['Source reference',p.header.sourceRef],
    ['Local revision',p.revision],['Current artwork status',state.status],['Buyer authority independently verified','NO'],
    ['GS1 number issued','NO'],['Regulatory textile care legally verified','NO']],
   'Artwork Versions':[['Revision','Revision ID','Source Date','Artwork File Reference','Evidence','Width','Height','Unit',
    'Repeat Count','Dimensions Source','Repeat Source','Barcode Check Warning','Care Text','Fiber Text','Country Text',
    'Content Source','Authority'],...versions],
   'Version Differences':[['From revision','To revision','Field changed','Previous source value','New source value','Status'],...comparison],
   'Review Comments':[['Revision','Reviewer','Role','Review Date','Comment','Evidence'],...p.comments.map(c=>[rev.get(c.revisionId)||null,c.reviewer,c.reviewerRole,c.reviewDate,c.comment,c.sourceRef])],
   'Review Decisions':[['Revision','Reviewer','Claimed Role','Review Date','Recorded State','Decision Source','Claimed Authority','External Approval'],...p.decisions.map(d=>[rev.get(d.revisionId)||null,d.reviewer,d.reviewerRole,d.reviewDate,d.decision,d.sourceRef,d.authorityRef||null,'NOT INDEPENDENTLY VERIFIED'])],
   'Evidence and Exceptions':[['Issue','Authority boundary'],...notices],
   'Manual Read-Only Sources':[['Kind','Source App','Source Record','Source Revision','Source Date','Local Reviewer','Review Date','Authority'],...(p.manualReferences||[]).map(r=>[r.kind,r.source.sourceApp,r.source.recordId,r.source.revisionId,r.source.sourceDate,r.localReviewer,r.localReviewDate,'LOCAL REVIEW ONLY, NO EXTERNAL APPROVAL'])],
   'Revision Audit':[['Local revision','Timestamp','Action','Evidence ID'],...p.audit.map(a=>[a.revision,a.at,a.action,a.recordId||''])]
  };
 }
 static html(p){
  return '<article class="la-report"><h2>Label &amp; Artwork Approval 360 — DRAFT / SOURCE REVIEW ONLY</h2>'+
    '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. An uploaded artwork, matching barcode check digit or recorded buyer-role source does NOT verify GS1 ownership, label compliance, buyer/PPM/AQL/Sampling approval or physical print quality.</p>'+
    Object.entries(this.rows(p)).map(([name,table])=>'<section class="la-report-section"><h3>'+this.escape(name)+'</h3><div class="la-scroll"><table class="la-table"><thead><tr>'+table[0].map(k=>'<th>'+this.escape(k)+'</th>').join('')+'</tr></thead><tbody>'+
      table.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+this.escape(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>').join('')+'</article>';
 }
 static numericColumn(name,j){
  return({
   'Artwork Versions':new Set([0,5,6,8]),
   'Version Differences':new Set([0,1]),
   'Review Comments':new Set([0]),'Review Decisions':new Set([0]),
   'Revision Audit':new Set([0])
  }[name]||new Set()).has(j);
 }
 static excelRows(name,rows){
  return rows.map((row,i)=>row.map((v,j)=>{
   if(i>0&&this.numericColumn(name,j)&&typeof v==='number'&&Number.isFinite(v))return v;
   if(i>0&&name==='Source and Status'&&row[0]==='Local revision'&&typeof v==='number')return v;
   return this.safeExcel(v===undefined||v===null||v===''?'Needs Information':v);
  }));
 }
}
root.VesaArtworkReportModel=VesaArtworkReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaArtworkReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
