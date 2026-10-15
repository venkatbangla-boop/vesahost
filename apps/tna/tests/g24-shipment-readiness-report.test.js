/**
 * GMR-12 R09: source-only, quality/shipping restricted report acceptance.
 * Synthetic knit/woven data; no domain or historic record changes.
 */
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const domain=require('../src/domain.js'),reports=require('../src/reports.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const review={reportId:'R09',language:'en',asOfDate:'2026-10-15',
 qualityConfirmed:true,qualityAuthorityRef:'PRIVATE-QUALITY-AUTHORITY',
 generatedAt:'2026-10-15T08:00:00Z'};
function fixture(templateId='knit'){
 const p=domain.createPlan({templateId,buyerName:'R09 BUYER',factoryName:'R09 FACTORY',
  poNumber:'PO-1',styleNo:'S-1',totalQty:100,unit:'pcs',buyerRequiredExFactory:'2026-11-16'},
  {ownerUserId:'r09-fixture'});
 p.order.commercialNotes='PRIVATE-COMMISSION-PRICE';
 p.shipmentLots=[
 {lotId:'L1',lotReference:'LOT-1',plannedQty:60,packedQty:50,passedQty:45,
  shippedQty:20,unit:'pcs',poAllocation:[{poNumber:'PO-1',qty:60}],
  requestedExFactory:'2026-10-13',currentExFactory:'2026-10-14',
  forecastExFactory:'2026-10-15',actualExFactory:'2026-10-14',
  ETD:'2026-10-17',ETA:'2026-11-02',
  bookingRef:'PRIVATE-BOOKING-NUMBER',inspectionRef:'PRIVATE-INSPECTION-NUMBER'},
 {lotId:'L2',lotReference:'LOT-2',plannedQty:40,packedQty:30,passedQty:20,
  shippedQty:0,unit:'pcs',poAllocation:[{poNumber:'PO-1',qty:40}],
  requestedExFactory:'2026-10-19',forecastExFactory:'2026-10-20',
  actualExFactory:'2026-10-18'}
 ];
 const t=p.tasks.find(x=>x.templateRef==='Q08');
 assert.ok(t,'template must contain Q08');
 t.status='completed';t.proofRefs=['PRIVATE-FINAL-AQL-SCAN'];
 t.dates.actualFinish='2026-10-13';t.dates.currentTargetFinish='2026-10-15';
 p.integrationReferences=[{sourceApp:'ppm',recordedStatus:'GO',
  sourceRecordId:'PRIVATE-PPM-ID'},
 {sourceApp:'aql',recordedStatus:'CONFORMED',sourceRecordId:'PRIVATE-AQL-ID'}];
 return p;
}
const model=(p,extra={})=>reports.buildReportModel(p,{...review,...extra});
function noSecrets(v){
 const s=JSON.stringify(v);
 for(const secret of ['PRIVATE-QUALITY-AUTHORITY','PRIVATE-COMMISSION-PRICE',
 'PRIVATE-BOOKING-NUMBER','PRIVATE-INSPECTION-NUMBER',
 'PRIVATE-FINAL-AQL-SCAN','PRIVATE-PPM-ID','PRIVATE-AQL-ID'])
  assert.ok(!s.includes(secret),'secret leaked: '+secret);
}
test('R09 date, consent and authority must be explicit; gated context stays private',()=>{
 for(const templateId of ['knit','woven']){
  const p=fixture(templateId),original=JSON.stringify(p);
  for(const x of [{},{asOfDate:review.asOfDate},{asOfDate:review.asOfDate,qualityConfirmed:true},
   {asOfDate:review.asOfDate,qualityAuthorityRef:'AUTH'},
   {asOfDate:'2026-02-30',qualityConfirmed:true,qualityAuthorityRef:'AUTH'},
   {asOfDate:'2026-11-99',qualityConfirmed:true,qualityAuthorityRef:'AUTH'}]){
   const m=reports.buildReportModel(p,{reportId:'R09',...x}),s=m.shipmentReadiness;
   assert.equal(s.ready,false);
   assert.deepEqual(s.lots,[]);assert.deepEqual(m.tasks,[]);
   for(const key of ['buyer','factory','po','style','quantity'])assert.equal(m.order[key],s.labels.missing);
   assert.throws(()=>storage.exportReportWorkbook(m),/review|date|quality|shipping/i);
   noSecrets(m);
  }
  assert.equal(JSON.stringify(p),original);
 }
});
test('R09 knit and woven preserve source quantities, four ex-factory types and distinct ETD/ETA',()=>{
 for(const templateId of ['knit','woven']){
  const p=fixture(templateId),before=JSON.stringify(p),m=model(p),s=m.shipmentReadiness;
  assert.equal(s.ready,true);
  assert.deepEqual(s.summary,{ordered:100,unit:'pcs',planned:100,packed:80,passed:65,shipped:20,
   unplanned:0,unshipped:80,sourceOnly:true});
  assert.equal(s.lots[0].actual,'2026-10-14');
  assert.equal(s.lots[1].actual,null,'future actual and zero shipped are withheld');
  assert.equal(s.lots[0].requested,'2026-10-13');
  assert.equal(s.lots[0].current,'2026-10-14');
  assert.equal(s.lots[0].forecast,'2026-10-15');
  assert.equal(s.lots[0].etd,'2026-10-17');
  assert.equal(s.lots[0].eta,'2026-11-02');
  assert.equal(s.milestones.find(x=>x.ref==='Q08').actual,'2026-10-13');
  assert.equal(s.links[0].recordedStatus,'GO');
  assert.equal(s.links[1].recordedStatus,'CONFORMED');
  assert.ok(s.warnings.some(w=>w.includes('do not independently authorize shipment')));
  assert.equal(JSON.stringify(p),before);noSecrets(m);
 }
});
test('R09 invalid units, allocations and source dates never fabricate whole-order totals',()=>{
 const p=fixture();
 for(const edit of [
  x=>x.shipmentLots[0].poAllocation[0].qty=59,
  x=>x.shipmentLots[0].unit='kg',
  x=>x.shipmentLots[1].passedQty=31,
  x=>x.shipmentLots[1].plannedQty=null,
  x=>x.shipmentLots[1].lotReference='LOT-1'
 ]){
  const next=JSON.parse(JSON.stringify(p));edit(next);
  assert.equal(model(next).shipmentReadiness.summary,null);
 }
 const d=fixture();d.shipmentLots[0].actualExFactory='2026-10-30';
 assert.equal(model(d).shipmentReadiness.lots[0].actual,null);
 const n=fixture();n.tasks.find(x=>x.templateRef==='Q08').proofRefs=[];
 assert.equal(model(n).shipmentReadiness.milestones.find(x=>x.ref==='Q08').actual,null);
});
test('R09 real typed Excel with separate shipment/PO/PPM-AQL sheets and private data omitted',()=>{
 const p=fixture(),before=JSON.stringify(p),m=model(p);
 const bytes=storage.exportReportWorkbook(m);
 assert.deepEqual([...bytes.subarray(0,2)],[80,75]);
 const workbook=XLSX.read(bytes,{type:'buffer'});
 assert.deepEqual(workbook.SheetNames,['Report Summary','Order Summary','Report Activities',
  'Shipment Lots','PO Allocations','Shipping Milestones','PPM AQL References','Report Notes']);
 const rows=XLSX.utils.sheet_to_json(workbook.Sheets['Shipment Lots'],{header:1,raw:true});
 assert.equal(rows[1][1],60);assert.equal(rows[1][2],50);assert.equal(rows[1][3],45);
 assert.equal(rows[1][4],20);assert.equal(typeof rows[1][6],'number');
 assert.equal(typeof rows[1][9],'number');
 const cells=Object.values(workbook.Sheets).flatMap(sh=>Object.entries(sh)
  .filter(([key])=>!key.startsWith('!')).map(([,v])=>v.v));
 noSecrets(cells);noSecrets(m);
 assert.equal(JSON.stringify(p),before);
});
test('R09 all languages present, no accidental exposure to other report adapters',()=>{
 const p=fixture();
 for(const language of ['en','bn','hi','ta']){
  const m=model(p,{language});
  assert.equal(m.shipmentReadiness.ready,true);
  assert.ok(m.shipmentReadiness.labels.selectReview.length>10);
  assert.equal(m.shipmentReadiness.labels.noClearance.length>15,true);
  noSecrets(m);
 }
 for(const id of ['R02','R03','R04','R05','R06','R07','R08']){
  const m=reports.buildReportModel(p,{reportId:id,language:'en'});
  assert.equal(m.shipmentReadiness,undefined);
 }
});
