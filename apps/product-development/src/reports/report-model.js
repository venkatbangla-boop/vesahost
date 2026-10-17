/* APP-15 draft style/board/line-sheet output model. User text escaped and Excel formula prefixes protected.
 * Uploaded media remain local data URIs, validated by the Product Development board engine;
 * nothing implies copyright clearance, approved garment measurements, buyer order or pricing.
 */
(function(root){
'use strict';
class VesaProductReportModel{
 static esc(v){return String(v===undefined||v===null||v===''?'Needs Information':v).replace(/[&<>"']/g,c=>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static safe(v){const s=String(v??'');return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
 static rows(p){
  const E=root.VesaProductConceptRegister,v=E.validate(p);
  if(!v.ok)throw Error(v.errors.join('; '));
  const s=E.summarize(p),gaps=[];
  if(!p.colourways.length)gaps.push(['Colourways','Needs Information']);
  if(!p.boards.length)gaps.push(['Proposal board','Needs Information']);
  if(!p.decisions.length)gaps.push(['Local concept review','Needs Information']);
  if(!(p.manualReferences||[]).length)
   gaps.push(['Tech Pack draft source link','No user-reviewed original supplied; no automatic sibling read']);
  for(const b of p.boards)for(const card of b.cards)if(card.kind==='image')
   gaps.push(['Image '+card.localAssetRef,'Rights source entered locally, not independently authenticated']);
  return{
   'Source Concept Brief':[['Field','Source-entered draft value'],
    ['Concept',p.header.conceptName],['Category',p.header.category],['Season',p.header.season],
    ['Market',p.header.market],['Silhouette',p.header.silhouette],['Original Source',p.header.sourceRef],
    ['Reviewer',p.header.reviewedBy],['Review date',p.header.reviewDate],
    ['Original brief',p.originalHeader.brief],['Current brief',p.header.brief],
    ['Local proposal state',s.status],['Revision',p.revision],
    ['Buyer approval','NOT VERIFIED'],['Final technical specification','NOT PROVIDED'],
    ['Price/MOQ/PO','NOT PROVIDED'],['Artwork rights','NOT AUTHENTICATED']],
   'Colourway Matrix':[['Colourway ID','Name','User-supplied colour reference','Reference source',
    'Proposed material','Material source','Silhouette','Source date','Draft status'],
    ...p.colourways.map(c=>[c.id,c.name,c.colourRef||null,c.colourSourceRef||null,
     c.materialProposal||null,c.materialSourceRef||null,c.silhouette||null,c.sourceDate,
     'PROPOSAL ONLY'])],
   'Style Development Board':[['Board ID','Title','Layout','Aspect','Source','Date','Cards','Rights status'],
    ...p.boards.map(b=>[b.id,b.title,b.layout,b.aspect,b.sourceRef,b.sourceDate,b.cards.length,
     b.cards.some(x=>x.kind==='image')?'ENTERED LOCALLY / NOT AUTHENTICATED':'NO ORIGINAL ARTWORK'])],
   'Board Cards and Image Evidence':[['Board','Card type','Position','Description','Original source',
    'Rights basis','Rights evidence','Local asset','Pixels','Media retained only on this browser'],
    ...p.boards.flatMap(b=>b.cards.map(c=>[b.title,c.kind,c.position,
     c.kind==='note'?c.text:c.kind==='colourway'?p.colourways.find(x=>x.id===c.colourwayId)?.name:
     c.caption||c.altText||'Local image',
     c.sourceRef,c.rightsBasis||null,c.rightsSourceRef||null,c.localAssetRef||null,
     c.kind==='image'?c.pixelWidth+' × '+c.pixelHeight:null,'YES — NO NETWORK SYNC']))],
   'Collection Line Sheet':[['Concept','Season','Market','Colourway','Proposed material',
    'No approved price/quantity/spec'],
    ...p.colourways.map(c=>[p.header.conceptName,p.header.season,p.header.market,c.name,
     c.materialProposal||null,'NOT APPROVED'])],
   'Requested Fit Technical Sampling':[['ID','Type','Requested work','Source','Source date','Status'],
    ...p.tasks.map(x=>[x.id,x.kind,x.description,x.sourceRef,x.sourceDate,x.state])],
   'Concept Revision Comparison':[['Revision','Field','Old source text','New source text',
    'Revision source','Reviewer','Date'],
    ...p.revisions.flatMap(r=>r.changed.map(x=>[r.number,x.field,x.before,x.after,
     r.sourceRef,r.reviewedBy,r.sourceDate]))],
   'Local Concept Review Decisions':[['State','Party','Reviewer','Decision date',
    'Source','Claimed authority','Notes','External approval inferred'],
    ...p.decisions.map(d=>[d.state,d.party,d.actor,d.decisionDate,d.sourceRef,
     d.authorityRef,d.comments,'NO'])],
   'Manually Reviewed Tech Pack Drafts':[['Type','Original source app','Draft style','Original record ID',
    'Revision','Source date','Locally reviewed by','Local review date','Authorized production'],
    ...(p.manualReferences||[]).map(r=>[r.kind,r.source.sourceApp,r.source.displaySnapshot.style,
     r.source.recordId,r.source.revisionId,r.source.sourceDate,r.localReviewer,r.localReviewDate,'NO'])],
   'Missing or Unverified Sources':[['Source gap','Meaning'],...gaps],
   'Immutable Concept History':[['Revision','Timestamp','Local action','Source ID'],
    ...p.audit.map(a=>[a.revision,a.at,a.action,a.recordId||null])]
  };
 }
 static html(p){
  const boards=p.boards.map(b=>'<section class="pd-report-board"><h3>'+this.esc(b.title)+
   ' · '+this.esc(b.aspect)+'</h3><p>Source: '+this.esc(b.sourceRef)+
   ' / User-reviewed only, not buyer-approved artwork</p><div class="pd-board-cards">'+
   b.cards.map(c=>'<div class="pd-board-card">'+
    (c.kind==='image'?'<figure><img class="pd-image" loading="eager" src="'+this.esc(c.dataUrl)+
     '" alt="'+this.esc(c.altText||c.caption||'Source labelled local image')+
     '" style="object-fit:'+this.esc(c.objectFit)+'"><figcaption>'+this.esc(c.caption||c.localAssetRef)+
     '</figcaption></figure>':c.kind==='note'?'<p>'+this.esc(c.text)+'</p>':
     '<p>'+this.esc(p.colourways.find(x=>x.id===c.colourwayId)?.name)+'</p>')+
    '</div>').join('')+'</div></section>').join('');
  const tables=Object.entries(this.rows(p)).map(([name,rows])=>
   '<section class="pd-report-section"><h3>'+this.esc(name)+'</h3><div class="pd-scroll"><table class="pd-table"><thead><tr>'+
   rows[0].map(v=>'<th>'+this.esc(v)+'</th>').join('')+'</tr></thead><tbody>'+
   rows.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+this.esc(v)+'</td>').join('')+
   '</tr>').join('')+'</tbody></table></div></section>').join('');
  return'<article class="pd-report"><h2>VESA Product Development 360 — DRAFT BUYER PROPOSAL ONLY</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Source-only concepts/boards; no authenticated image rights, buyer artwork permission, approved measurements, Pantone, price, MOQ, production/sample release or PO. Manual Tech Pack references are not official acceptance.</p>'+
   boards+tables+'</article>';
 }
 static excelRows(name,rows){
  const numeric={'Style Development Board':new Set([6]),
   'Board Cards and Image Evidence':new Set([2]),
   'Concept Revision Comparison':new Set([0]),
   'Immutable Concept History':new Set([0])}[name]||new Set();
  return rows.map((row,i)=>row.map((v,j)=>{
   if(i>0&&typeof v==='number'&&Number.isSafeInteger(v))return v;
   if(i>0&&numeric.has(j)&&typeof v==='string'&&/^(0|[1-9]\d{0,5})$/.test(v))return Number(v);
   if(name==='Source Concept Brief'&&i>0&&row[0]==='Revision'&&typeof v==='number')return v;
   return this.safe(v===undefined||v===null||v===''?'Needs Information':v);
  }));
 }
}
root.VesaProductReportModel=VesaProductReportModel;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductReportModel;
})(typeof globalThis!=='undefined'?globalThis:this);
