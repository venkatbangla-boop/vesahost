/* APP-07 read-only document reporting. Never label draft data legal originals. */
(function(root){
'use strict';
class ShipmentReports {
 static safe(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static excelValue(v){if(typeof v==='number'&&Number.isFinite(v))return v;
  return /^[=+\-@\t\r]/.test(String(v??''))?"'"+String(v):String(v??'');}
 static sheets(p,x){
  const line=id=>p.lines.find(l=>l.id===id);
  const unknown=v=>v===null||v===undefined||v===''?'Needs Information':v;
  return {
   'Shipment Summary':[['Field','Source value'],
    ['PO',p.header.poNo],['Buyer',p.header.buyer],['Shipper',p.header.shipper],
    ['Consignee',p.header.consignee],['Draft invoice no.',p.header.invoiceNo],
    ['Currency',p.header.currency],['Incoterm',p.header.incoterm],
    ['Invoice source amount',unknown(p.header.invoiceControl)],
    ['Invoice calculated amount',x.invoiceAmount],
    ['Invoice reconciliation',x.invoiceValueMatched?'Matches sourced control':'HOLD — source control mismatch'],
    ['Invoice pieces',x.invoiceQty],['Packed pieces',x.packingQty],
    ['Source-dispatched pieces',x.dispatchedQty],['Cartons',x.cartonCount],
    ['Declared net kg',x.declaredNetKg],['Declared gross kg',x.declaredGrossKg],
    ['Declared CBM',x.declaredCbm],
    ['Latest reviewed packing version',x.latestPackingReviewed?'Matched':'Needs new reviewed snapshot'],
    ['Shipment status',x.release],['Requirements source',p.header.sourceRef]],
   'Commercial Invoice Draft':[['Style','Colour','Size','Lot','PO line source','Pieces',
    'Unit price (4dp)','Invoice value (2dp)','Currency','Invoice price source','Rounding'],
    ...p.lines.map(l=>{
     const d=x.dispatchLines.find(v=>v.lineId===l.id);
     return [l.style,l.colour,l.size,l.lot,l.poLineRef,l.pieces,l.unitPrice,
      d?.amount??'Needs Information',p.header.currency,l.invoiceSource,l.rounding];
    }),
    ['TOTAL','','','','',x.invoiceQty,'',x.invoiceAmount,p.header.currency,'DRAFT ONLY',''] ],
   'Packing List':[['Carton','Style','Colour','Size','Lot','PO line','Pieces','Net kg','Gross kg',
     'CBM m³','Packing source'],
    ...p.packing.map(c=>{
     const l=line(c.lineId)||{};
     return [c.cartonId,l.style,l.colour,l.size,l.lot,l.poLineRef,c.pieces,
      c.netKg,c.grossKg,c.cbm,c.sourceRef];
    }),
    ['TOTAL','','','','','',x.packingQty,x.declaredNetKg,x.declaredGrossKg,
      x.declaredCbm,'DRAFT / REVIEWED SNAPSHOT SEPARATE']],
   'Shipment Reconciliation':[['PO line','Style/lot','Invoice pcs','Packed pcs','Dispatched actual',
     'Unshipped (only if complete ledger)','Invoice amount','Source'],
    ...x.dispatchLines.map(l=>[l.lineId,l.style+' / '+l.lot,l.invoiced,l.packed,
     l.dispatched,l.unshipped??'Needs Information',l.amount,l.source])],
   'Dispatch Register':[['Line','Actual pieces','Date','Carrier/BL reference','Dispatch actor','Source'],
    ...p.dispatches.map(d=>[d.lineId,d.pieces,d.date,d.carrierRef,d.actor,d.sourceRef])],
   'Document Checklist':[['Document','Current version','Current status','Recorded date','Document ref',
     'Separate acknowledgement'],
    ...x.currentDocuments.map(d=>[d.kind,d.versionNo,d.status,d.date,d.documentRef,
      d.ack?'Source-entered acknowledgment':'Needs Information'])],
   'Document Version History':[['Kind','Version','State','Document ref','Date','Source','Actor',
     'Previous version ID','Acknowledged by','Acknowledged on','Acknowledgment evidence'],
    ...p.documents.map(d=>[d.kind,d.versionNo,d.status,d.documentRef,d.date,d.sourceRef,
      d.actor,unknown(d.parentId),unknown(d.ackActor),unknown(d.ackDate),unknown(d.ackEvidence)])],
   'Packing Revision History':[['Revision','Reviewed by','Reviewed date','Packing source','Carton control',
     'Piece control','Net kg control','Gross kg control','CBM control','Frozen carton list'],
    ...p.packingSnapshots.map(s=>[s.revisionId,s.reviewer,s.reviewedDate,s.sourceRef,
      s.cartonCount,s.controlPieces,s.controlNetKg,s.controlGrossKg,s.controlCbm,
      JSON.stringify(s.cartons)])],
   'Transport ETA':[['Field','Document source'],
    ['Carrier',unknown(p.transport.carrier)],['Booking',unknown(p.transport.bookingRef)],
    ['Booking source',unknown(p.transport.bookingSource)],
    ['Vessel',unknown(p.transport.vessel)],['Loading port',unknown(p.transport.portLoad)],
    ['Discharge port',unknown(p.transport.portDischarge)],
    ['ETD',unknown(p.transport.etd)],['ETA',unknown(p.transport.eta)],
    ['Date convention',unknown(p.transport.dateBasis)],
    ['Date source',unknown(p.transport.dateSource)],
    ['BL reference',unknown(p.transport.blRef)],['BL source',unknown(p.transport.blSource)],
    ['Dispatch date',unknown(p.transport.dispatchDate)],
    ['Dispatch source',unknown(p.transport.dispatchSource)],
    ['Origin',unknown(p.header.originCountry)],['Origin authority',unknown(p.header.originEvidence)],
    ['HS code',unknown(p.header.hsCode)],['HS authority',unknown(p.header.hsEvidence)]],
   'Manual App References':[['Source owner','Snapshot (read only)'],
    ...[['Purchase Order',p.header.poReference],['Packing',p.header.packingReference],
      ['AQL',p.header.aqlReference],['LC & Payment',p.header.lcReference]]
      .map(([owner,v])=>[owner,v?JSON.stringify(v):'Needs Information'])]
  };
 }
 static html(p,analysis){
  const escape=this.safe;
  return '<article class="sd-report"><h2>Shipment & Documentation 360 — DRAFT ONLY</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. This is not a signed customs/bank invoice, B/L, AQL release or carrier acknowledgment.</p>'+
   Object.entries(this.sheets(p,analysis)).map(([name,rows])=>
    '<section class="sd-report-section"><h3>'+escape(name)+'</h3>'+
     '<div class="sd-scroll"><table class="sd-table"><thead><tr>'+
     rows[0].map(x=>'<th>'+escape(x)+'</th>').join('')+'</tr></thead><tbody>'+
     rows.slice(1,2501).map(row=>'<tr>'+row.map(value=>
      '<td>'+escape(value??'Needs Information')+'</td>').join('')+'</tr>').join('')+
     '</tbody></table></div></section>').join('')+'</article>';
 }
 static excelRows(name,rows){
  const numeric={
   'Shipment Summary':new Set(['Invoice source amount','Invoice calculated amount',
    'Invoice pieces','Packed pieces','Source-dispatched pieces','Cartons','Declared net kg',
    'Declared gross kg','Declared CBM']),
   'Commercial Invoice Draft':new Set([5,6,7]),
   'Packing List':new Set([6,7,8,9]),
   'Shipment Reconciliation':new Set([2,3,4,5,6]),
   'Dispatch Register':new Set([1]),
   'Document Checklist':new Set([1]),
   'Document Version History':new Set([1]),
   'Packing Revision History':new Set([4,5,6,7,8])
  };
  return rows.map((row,i)=>row.map((v,j)=>{
   const count=i>0&&(name==='Shipment Summary'&&j===1&&numeric[name].has(row[0])||
     typeof numeric[name]!=='undefined'&&name!=='Shipment Summary'&&numeric[name].has(j));
   if(count&&typeof v==='string'&&/^\d{1,12}(?:\.\d{1,4})?$/.test(v))return Number(v);
   if(count&&typeof v==='number'&&Number.isFinite(v))return v;
   return this.excelValue(v);
  }));
 }
}
root.VesaShipmentReports=ShipmentReports;
if(typeof module!=='undefined'&&module.exports)module.exports=ShipmentReports;
})(typeof globalThis!=='undefined'?globalThis:this);