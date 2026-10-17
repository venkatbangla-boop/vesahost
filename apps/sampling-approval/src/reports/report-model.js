/* APP-04 report projection. All tables are derived from record source facts.
 * Escaping is mandatory for HTML and formula-like spreadsheet values.
 */
(function(root){
'use strict';
class SamplingReports {
 static safe(text){return String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static excelSafe(value){if(typeof value==='number'&&Number.isFinite(value))return value;
   return /^[=+\-@\t\r]/.test(String(value??''))?"'"+String(value):String(value??'');}
 static rows(p,analysis){
  const cat=id=>p.categories.find(x=>x.id===id);
  const round=id=>p.rounds.find(x=>x.id===id);
  const categories=analysis.statuses||[],valid=x=>x||'Needs Information';
  return {
   'Request Summary':[['Field','Value'],['Buyer',p.header.buyer],['PO number',p.header.poNo],
    ['Style',p.header.style],['Factory',p.header.factory],
    ['Buyer requirements source',p.header.requirementsSource],
    ['Current tech revision',valid(p.header.currentTechRevision)],
    ['Current tech source',valid(p.header.currentTechSource)],
    ['Current artwork revision',valid(p.header.currentArtworkRevision)],
    ['Current artwork source',valid(p.header.currentArtworkSource)],
    ['Buyer categories',p.categories.length],['Recorded rounds',p.rounds.length],
    ['Buyer-approved current',analysis.buyerApproved],['Stale approvals',analysis.stale],
    ['Unresolved required',analysis.unresolved]],
   'Buyer Categories':[['Category','Buyer requirement source','Required by buyer','Expected buyer authority',
      'Current status','Latest round','Latest decision evidence ID'],
      ...p.categories.map(c=>{
       const s=categories.find(x=>x.categoryId===c.id)||{};
       return [c.name,c.sourceRef,c.required?'Yes':'No',c.buyerAuthority,
         valid(s.status),s.round??'Needs Information',s.lastDecisionId||'Needs Information'];
      })],
   'Submission Tracker':[['Category','Round','Physical sample ID','Colour','Size','Pieces','Request date',
    'Required date','Calendar source','Dispatched','Courier evidence','Buyer received','Buyer receipt source',
    'Tech revision','Artwork revision','Tech source','Artwork source'],
    ...p.rounds.map(r=>[cat(r.categoryId)?.name||'Unknown buyer category',r.round,r.physicalId,
     r.colour,r.size,r.quantity,r.requestDate,valid(r.requiredDate),valid(r.calendarSource),
     valid(r.sentDate),valid(r.dispatchSource),valid(r.receivedDate),valid(r.receiptSource),
     valid(r.techRevision),valid(r.artworkRevision),valid(r.techSource),valid(r.artworkSource)])],
   'Approval Comments':[['Category','Round','Decision status','Deciding party','Approver/Commenter',
     'Date','Authority document','Decision evidence','Written comments','File reference'],
    ...p.decisions.map(d=>{
     const r=round(d.roundId)||{};
     return [cat(r.categoryId)?.name||'Unknown',r.round||'Unknown',
      d.status,d.party,d.actor,d.date,d.authority,d.evidence,valid(d.comments),valid(d.fileRef)];
    })],
   'Revision Overdue':[['Category','Required','Current round','Status','Overdue from source',
     'Stale linked revision','Required date','Calendar basis','Issue'],
    ...categories.map(s=>[s.category,s.required?'Yes':'No',s.round??'Needs Information',
      s.status,s.overdue===null?'Needs Information':s.overdue?'Overdue':'Not overdue',
      s.stale?'Review needed':'Current',valid(s.requiredDate),valid(s.calendarBasis),valid(s.issue)])],
   'Revision Requests':[['From category','From round','Requested by','Request date','Reason','Evidence',
     'Next documented round'],
    ...p.revisionRequests.map(q=>{
      const from=round(q.fromRoundId);
      return [cat(from?.categoryId)?.name||'Unknown',from?.round||'Unknown',
       q.requestedBy,q.date,q.reason,q.evidence,round(q.nextRoundId)?.round||'Needs Information'];
    })],
   'Evidence Register':[['Kind','Sample/round','Date','Evidence/source','Actor'],
    ...p.rounds.flatMap(r=>[
      ['Dispatch',r.physicalId,valid(r.sentDate),valid(r.dispatchSource),'Courier/submitter'],
      ['Receipt',r.physicalId,valid(r.receivedDate),valid(r.receiptSource),'Buyer receipt evidence']]),
    ...p.decisions.map(d=>['Approval/comment',round(d.roundId)?.physicalId||'Unknown',
      d.date,d.evidence,d.actor]),
    ...p.revisionRequests.map(q=>['Revision request',round(q.fromRoundId)?.physicalId||'Unknown',
      q.date,q.evidence,q.requestedBy])],
   'Manual Cross-App Refs':[['Type','Review snapshot (not an approval)'],
    ...[['PO',p.header.poReference],['Tech Pack',p.header.techReference],
     ['Artwork',p.header.artworkReference]].map(([name,reference])=>
      [name,reference?JSON.stringify(reference):'Needs Information'])]
  };
 }
 static html(p,analysis){
  const sheets=this.rows(p,analysis),escape=this.safe;
  return '<article class="sa-print"><h2>VESA Sampling & Approval 360 — source-based report</h2>'+
    '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Buyer approvals shown are manually recorded sources, not authenticated buyer signatures or PPM GO.</p>'+
    Object.entries(sheets).map(([name,rows])=>
     '<section class="sa-report-section"><h3>'+escape(name)+'</h3><div class="sa-scroll"><table class="sa-table">'+
      '<thead><tr>'+rows[0].map(x=>'<th>'+escape(x)+'</th>').join('')+'</tr></thead>'+
      '<tbody>'+rows.slice(1,2501).map(row=>'<tr>'+row.map(x=>'<td>'+escape(x??'Needs Information')+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div></section>').join('')+'</article>';
 }
 static excelRows(_name,rows){return rows.map((row,i)=>row.map(x=>
  i>0&&typeof x==='number'&&Number.isFinite(x)?x:this.excelSafe(x)));}
}
root.VesaSamplingReports=SamplingReports;
if(typeof module!=='undefined'&&module.exports)module.exports=SamplingReports;
})(typeof globalThis!=='undefined'?globalThis:this);
