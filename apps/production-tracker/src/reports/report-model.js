/* APP-09 source-only draft production exports: escaped HTML / formula-safe Excel. */
(function(root){
'use strict';
class ProductionReportModel {
 static escape(v){return String(v??'Needs Information').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static excelCell(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(record,analysis){
  const E=root.VesaProductionStageFlow,active=new Map();for(const o of record.observations)active.set(E.dayKey(o),o);
  const last=[...active.values()];
  const groups=new Map(analysis.groups.map(g=>[E.axis(g),g]));
  const running=new Map();
  const trend=last.filter(o=>o.status==='locally-reviewed')
   .sort((a,b)=>a.date.localeCompare(b.date)||a.stage.localeCompare(b.stage)||
    a.line.localeCompare(b.line)||a.shift.localeCompare(b.shift))
   .map(o=>{
    const axis=E.axis(o),sum=(running.get(axis)||0)+o.good;running.set(axis,sum);
    const target=groups.get(axis)?.sourceTarget??null;
    return [o.stage,o.line,o.lot,o.unit,o.date,o.shift,o.good,sum,target,
     target===null?null:target-sum,o.sourceRef];
   });
  const exceptions=analysis.groups.flatMap(g=>{
   const notices=[];
   if(g.unreviewedDays)notices.push(g.unreviewedDays+' daily entries await local review');
   if(g.sourceTarget===null)notices.push('Source target Needs Information');
   if(g.wip.closing===null)notices.push('Opening WIP Needs Information');
   if(g.remaining!==null&&g.remaining<0)notices.push('Output exceeds documented stage target');
   return notices.map(note=>[g.stage,g.line,g.lot,g.unit,note,'NOT AQL / PPM / TNA RELEASE']);
  });
  return {
   'Source & Status':[['Field','Value'],['PO reference',record.header.poNo],['Style',record.header.style],['Colour',record.header.colour],['Size',record.header.size],['Lot',record.header.lot],['Factory',record.header.factory],['Unit',record.header.unit],['PO/plan evidence',record.header.sourceRef],['Current source revision',record.revision],['Status',analysis.status],['AQL/PPM/TNA approval','NOT GIVEN BY THIS APP']],
   'Daily Good by Stage':[['Stage','Line','Lot','Unit','Date','Shift','Status','Good output','Rework','Source','Review evidence'],...last.map(o=>[o.stage,o.line,o.lot,o.unit,o.date,o.shift,o.status,o.good,o.rework,o.sourceRef,o.reviewSource||'Needs Information'])],
   'Stage WIP & Balance':[['Stage','Line','Lot','Unit','Local reviewed good','Opening WIP','Verified in','Verified out','Rejected','Closing WIP','Stage target','Remaining','Source'],...analysis.groups.map(g=>[g.stage,g.line,g.lot,g.unit,g.locallyReviewedGood,g.wip.opening,g.wip.verifiedIn,g.wip.verifiedOut,g.wip.verifiedRejects,g.wip.closing,g.sourceTarget,g.remaining,g.targetProvenance||'Needs Information'])],
   'Target vs Actual Trend':[['Stage','Line','Lot','Unit','Date','Shift','Good output','Stage cumulative good','Stage target','Remaining','Evidence'],...trend],
   'Exceptions & Missing Evidence':[['Stage','Line','Lot','Unit','Evidence gap / difference','Authority warning'],...exceptions],
   'Source Targets':[['Stage','Line','Lot','Unit','Quantity','Source','Declared authority','Source date','Review date','Supersedes','Amendment reason','Amendment source'],...record.stageTargets.map(t=>[t.stage,t.line,t.lot,t.unit,t.quantity,t.sourceRef,t.declaredAuthority,t.sourceDate,t.reviewDate,t.supersedes||'Original',t.amendmentReason||'',t.amendmentSource||''])],
   'Revision & Corrections':[['Revision','Time','Action','Record identity'],...record.audit.map(a=>[a.revision,a.at,a.action,a.recordId||''])],
   'Manual Read-Only Sources':[['Owner','Source App','Record ID','Source version','Local reviewer','Local review date','Local-only boundary'],...(record.manualReferences||[]).map(r=>[r.kind,r.source.sourceApp,r.source.recordId,r.source.revisionId,r.localReviewer,r.localReviewDate,'READ-ONLY COPY; NOT APPROVAL'])]
  };
 }
 static html(record,analysis){
  return '<article class="pt-report"><h2>Production Tracker 360 — DRAFT / SOURCE-REVIEW ONLY</h2><p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Local records are not buyer/PPM/AQL/TNA approval, certified output, shipment readiness or a factory-signed document.</p>'+Object.entries(this.rows(record,analysis)).map(([name,table])=>'<section class="pt-report-section"><h3>'+this.escape(name)+'</h3><div class="pt-scroll"><table class="pt-table"><thead><tr>'+table[0].map(v=>'<th>'+this.escape(v)+'</th>').join('')+'</tr></thead><tbody>'+table.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+this.escape(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>').join('')+'</article>';
 }
 static numericColumn(name,j){return {'Source & Status':new Set(), 'Daily Good by Stage':new Set([7,8]),'Stage WIP & Balance':new Set([4,5,6,7,8,9,10,11]),'Target vs Actual Trend':new Set([6,7,8,9]),'Source Targets':new Set([4]),'Revision & Corrections':new Set([0]),'Manual Read-Only Sources':new Set()}[name]?.has(j)??false;}
 static excelRows(name,rows){return rows.map((row,i)=>row.map((v,j)=>{
  if(i>0&&this.numericColumn(name,j)&&typeof v==='number'&&Number.isSafeInteger(v))return v;
  if(i>0&&name==='Source & Status'&&row[0]==='Current source revision')return typeof v==='number'?v:this.excelCell(v);
  return this.excelCell(v===null||v===undefined||v===''?'Needs Information':v);
 }));}
}
root.VesaProductionReportModel=ProductionReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
