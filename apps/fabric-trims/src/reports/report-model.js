/* APP-06 offline report projection. No vendor selection, supplier price or QC is inferred. */
(function(root){
'use strict';
class FabricReports {
 static htmlSafe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 static sheetSafe(v){if(typeof v==='number'&&Number.isFinite(v))return v;
  return /^[=+\-@\t\r]/.test(String(v??''))?"'"+String(v):String(v??'');}
 static sheets(p,x){
  const item=id=>p.items.find(i=>i.id===id);
  const booking=id=>p.bookings.find(i=>i.id===id);
  const receipt=id=>p.receipts.find(i=>i.id===id);
  return {
   'Order Material Summary':[['Source field','Recorded value'],
    ['PO',p.header.poNo],['Style',p.header.style],['Buyer',p.header.buyer],
    ['Factory',p.header.factory],['Current BOM',p.header.bomRevision],
    ['BOM document',p.header.bomSource],['Approved material date',p.header.requiredDate||'Needs Information'],
    ['Working calendar source',p.header.calendarSource||'Needs Information'],
    ['BOM requirement count',p.requirements.length],['Outstanding requirement count',x.outstanding],
    ['Receipts without QA approval',x.missingQA]],
   'Material Master':[['Material','Type','Composition','GSM','Width (source basis)','Construction',
    'Purchase unit','Source'],
    ...p.items.map(i=>[i.description,i.kind,i.composition||'Needs Information',
      i.gsm||'Needs Information',i.width||'Needs Information',
      i.construction||'Needs Information',i.unit,i.sourceRef])],
   'BOM Requirements':[['Material','Colour','Size','BOM revision','Approved required',
    'Purchase unit','Order pieces','Consumption per piece','Wastage %','Calculated use','Source'],
    ...p.requirements.map(req=>{
     const b=x.requirementsStatus.find(z=>z.requirementId===req.id)||{};
     return [item(req.itemId)?.description||'Unknown',req.colour,req.size,req.bomRevision,
      req.approvedRequired,req.unit,req.orderPieces??'Needs Information',
      req.consumptionPerPiece||'Needs Information',
      req.wastagePct||'Needs Information',b.consumptionEstimate??'Needs Information',req.sourceRef];
    })],
   'Supplier Bookings':[['Material','Supplier','Booking number','Booked qty','Unit',
    'Committed date','Lot','Shade','Booking source','Conversion source'],
    ...p.bookings.map(b=>[item(b.itemId)?.description||'Unknown',b.supplier,b.bookingRef,
     b.orderedQty,b.unit,b.committedDate||'Needs Information',b.lot||'Needs Information',
     b.shade||'Needs Information',b.sourceRef,b.conversion?.sourceRef||'Needs Information'])],
   'Goods Receipt QC':[['GRN','Supplier booking','Received qty','Rejected qty','Unit','Lot',
    'Shade','Arrival date','QA status','QA document','QA reviewer','Release date'],
    ...p.receipts.map(r=>[r.receiptRef,booking(r.bookingId)?.bookingRef||'Unknown',
     r.qty,r.rejected,r.unit,r.lot,r.shade,r.date,r.qaStatus,
     r.qaSource||'Needs Information',r.qaActor||'Needs Information',
     r.qaDate||'Needs Information'])],
   'Lot Allocation':[['GRN','PO / colour / size','Allocated qty','Unit','Date','Source'],
    ...p.allocations.map(a=>{
     const req=p.requirements.find(x=>x.id===a.requirementId);
     return [receipt(a.receiptId)?.receiptRef||'Unknown',
       [p.header.poNo,req?.colour||'Unknown',req?.size||'Unknown'].join(' / '),
       a.qty,a.unit,a.date,a.sourceRef];
    })],
   'Other PO Reservations':[['GRN','Other PO','Quantity','Unit','Date','Source'],
    ...p.reservations.map(r=>[receipt(r.receiptId)?.receiptRef||'Unknown',r.otherPo,
     r.qty,r.unit||'Needs Information',r.date,r.sourceRef])],
   'Receipt Availability':[['GRN','Lot','Shade','Approved / converted',
    'Allocated','Reserved other PO','Net available','QA status','Unit'],
    ...x.receiptBalances.map(v=>[v.receiptRef,v.lot,v.shade,
     v.approved??'Needs Information',v.allocated,v.otherReserved,
     v.netAvailable??'Needs Information',v.qaStatus,v.unit||'Needs Information'])],
   'Shortage Readiness':[['Colour','Size','Required','Allocated','Shortage',
     'Unit','BOM revision status','Readiness','Lot','Shade','Evidence source'],
    ...x.requirementsStatus.map(b=>[b.colour,b.size,b.approved??'Needs Information',
     b.confirmed,b.shortage??'Needs Information',b.unit,b.staleBom?'Review needed':'Current',
     b.readiness,b.targetLot||'Needs Information',b.targetShade||'Needs Information',b.source])],
   'Delivery Exceptions':[['Supplier','Committed','Compared date','Calendar variance days',
    'Status'],
    ...x.deliveryExceptions.map(d=>[d.supplier,d.commit||'Needs Information',
     d.comparedDate||'Needs Information',d.varianceDays??'Needs Information',d.status])],
   'Manual Source References':[['Source owner','Locally attached versioned source'],
    ['Tech Pack',p.header.techReference?JSON.stringify(p.header.techReference):'Needs Information'],
    ['Purchase Order',p.header.poReference?JSON.stringify(p.header.poReference):'Needs Information']]
  };
 }
 static html(p,x){
  const e=this.htmlSafe,sheets=this.sheets(p,x);
  return '<article class="ft-report"><h2>VESA Fabric & Trims 360 — Source-Based Report</h2>'+
   '<p>PERSONAL NON-COMMERCIAL SYNTHETIC DEMO. Quantities depend on entered BOM and QA sources; no factory/PPM/TNA release is inferred.</p>'+
   Object.entries(sheets).map(([name,rows])=>
    '<section class="ft-report-section"><h3>'+e(name)+'</h3><div class="ft-scroll"><table class="ft-table">'+
     '<thead><tr>'+rows[0].map(c=>'<th>'+e(c)+'</th>').join('')+'</tr></thead><tbody>'+
     rows.slice(1,2501).map(row=>'<tr>'+row.map(c=>'<td>'+e(c??'Needs Information')+'</td>').join('')+
     '</tr>').join('')+'</tbody></table></div></section>').join('')+'</article>';
 }
 static excelRows(name,rows){
  const numeric=['Order Material Summary','BOM Requirements','Supplier Bookings',
   'Goods Receipt QC','Lot Allocation','Other PO Reservations','Receipt Availability',
   'Shortage Readiness','Delivery Exceptions'];
  return rows.map((row,i)=>row.map((v,j)=>{
   if(typeof v==='number'&&Number.isFinite(v))return v;
   const indexes={
    'BOM Requirements':[4,6,7,8,9],
    'Supplier Bookings':[3],
    'Goods Receipt QC':[2,3],
    'Lot Allocation':[2],
    'Other PO Reservations':[2],
    'Receipt Availability':[3,4,5,6],
    'Shortage Readiness':[2,3,4],
    'Delivery Exceptions':[3]
   };
   const valid=numeric.includes(name)&&i>0&&(indexes[name]||[]).includes(j)&&
    typeof v==='string'&&/^\d+(?:\.\d{1,4})?$/.test(v);
   return valid?Number(v):this.sheetSafe(v);
  }));
 }
}
root.VesaFabricReports=FabricReports;
if(typeof module!=='undefined'&&module.exports)module.exports=FabricReports;
})(typeof globalThis!=='undefined'?globalThis:this);
