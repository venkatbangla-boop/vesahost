/**
 * GMR-11 R08 commercial-only material/LC source and genuine Excel tests.
 * Synthetic knit/woven orders; financial and QC assertions are source-only.
 */
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const domain=require('../src/domain.js'),report=require('../src/reports.js');
const materialLc=require('../src/material-lc-report.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const DATE='2026-10-15';
const SHEETS=['Report Summary','Order Summary','Report Activities','Master LC Review',
 'Material Sources','Sourcing Milestones','Report Notes'];
const SECRETS=['PRIVATE-LC-PROOF-DOCUMENT','PRIVATE-SUPPLIER-QC-SCAN',
 'PRIVATE-BUYER-APPROVAL-EVIDENCE','PRIVATE-FOB-COMMISSION-PRICE',
 'PRIVATE-COMMERCIAL-AUTHORITY','PRIVATE-FACTORY-REMARK','PRIVATE-ACCOUNT-NUMBER'];
const options={reportId:'R08',language:'en',asOfDate:DATE,commercialConfirmed:true,
 commercialAuthorityRef:SECRETS[4],generatedAt:'2026-10-15T08:00:00Z',timezone:'Asia/Dhaka'};
function fixture(profile='knit'){
 const p=domain.createPlan({templateId:profile,buyerName:'R08 SYNTHETIC BUYER',
  factoryName:'R08 COMMERCIAL FACTORY',styleNo:'R08-STYLE',poNumber:'R08-PO',
  totalQty:2400,fabricPayment:'b2b-lc',trimPayment:'b2b-lc',buyerRequiredExFactory:'2026-12-20'}, {ownerUserId:'r08-qa'});
 p.commitments.masterLcStatus='opened';
 p.commitments.masterLcOpenedOn='2026-10-10';
 p.commitments.masterLcProofRef=SECRETS[0];
 p.order.commercialNotes=SECRETS[3];
 p.order.fabricSpec='100% COTTON INTERNAL DETAIL';
 p.materials=[
  {materialId:'FAB-01',category:'fabric',supplier:'SOURCE FABRIC SUPPLIER',country:'China',
   requiredQty:1250.5,unit:'kg',bookingDate:'2026-10-07',
   paymentMethod:'b2b-lc',masterLcRef:SECRETS[6],
   b2bLcApplicationDate:'2026-10-08',b2bLcOpenDate:'2026-10-12',
   inHouseDate:'2026-10-13',QCDate:'2026-10-14',shortageQty:120.5,
   evidenceRefs:[SECRETS[1]],remarks:SECRETS[5],price:9999},
  {materialId:'TRM-02',category:'trims',supplier:'SOURCE TRIM SUPPLIER',country:'Bangladesh',
   requiredQty:2400,unit:'sets',bookingDate:'2026-10-08',
   paymentMethod:'b2b-lc',masterLcRef:'',b2bLcApplicationDate:'2026-10-11',
   b2bLcOpenDate:null,inHouseDate:null,QCDate:null,shortageQty:null,
   evidenceRefs:[],remarks:SECRETS[3],fabricPrice:9999},
  {materialId:'ACC-03',category:'accessory',supplier:'LOCAL ACCESSORY',country:'Bangladesh',
   requiredQty:2400,unit:'pcs',bookingDate:'2026-10-09',
   paymentMethod:'tt',b2bLcApplicationDate:null,b2bLcOpenDate:null,
   inHouseDate:'2026-10-13',QCDate:null,shortageQty:0,
   evidenceRefs:['SRC-ACCESSORY-BOOKING']}
 ];
 p.suppliers=[{supplierId:'S-PRIVATE',price:SECRETS[3],bankAccount:SECRETS[6]}];
 p.approvals=[{approvalId:'APP-PRIVATE',evidenceRef:SECRETS[2]}];
 function update(ref,fields){
  const task=p.tasks.find(t=>t.templateRef===ref);
  assert.ok(task,profile+' '+ref);
  const old={...task.dates};
  Object.assign(task,fields);
  if(fields.dates)task.dates={...old,...fields.dates};
 }
 update('FP02',{status:'completed',proofRefs:['SOURCE-FABRIC-BOOKING'],dates:{
  baselineFinish:'2026-10-08',currentTargetFinish:'2026-10-09',
  forecastFinish:'2026-10-10',actualFinish:'2026-10-09'}});
 update('FP15',{status:'completed',proofRefs:['SOURCE-WAREHOUSE-ARRIVAL'],dates:{
  baselineFinish:'2026-10-12',actualFinish:'2026-10-13'}});
 update('FP16',{status:'in-progress',proofRefs:['QC-REVIEW-INCOMPLETE'],dates:{
  baselineFinish:'2026-10-14',actualFinish:'2026-10-14'}});
 update('FP17',{status:'blocked',proofRefs:[],dates:{
  baselineFinish:'2026-10-15'}});
 update('TR05',{status:'completed',proofRefs:['TRIM-SUPPLIER-BOOKING'],dates:{
  baselineFinish:'2026-10-10',actualFinish:'2026-10-11'}});
 update('TR07',{status:'not-started',proofRefs:[],dates:{
  baselineFinish:'2026-10-19'}});
 update('TR12',{status:'in-progress',proofRefs:[],dates:{
  baselineFinish:'2026-10-16',actualFinish:'2026-10-17'}});
 return p;
}
const build=(p,o={})=>report.buildReportModel(p,{...options,...o});
function noSecrets(v,description){
 const txt=typeof v==='string'?v:JSON.stringify(v);
 for(const secret of SECRETS)assert.ok(!txt.includes(secret),description+' leaked '+secret);
 assert.ok(!txt.includes('9999'),description+' leaked source price');
 assert.ok(!txt.includes('O03'),description+' leaked FOB activity');
}
test('R08 fail-closed gate: only explicit as-of, consent and nonempty commercial authority',()=>{
 for(const profile of ['knit','woven']){
  const p=fixture(profile),before=JSON.stringify(p);
  for(const o of [
   {},{asOfDate:DATE},{asOfDate:DATE,commercialConfirmed:true},
   {asOfDate:DATE,commercialAuthorityRef:'authority-ref'},
   {asOfDate:DATE,commercialConfirmed:false,commercialAuthorityRef:'authority-ref'},
   {asOfDate:DATE,commercialConfirmed:true,commercialAuthorityRef:' '},
   {asOfDate:'2026-02-30',commercialConfirmed:true,commercialAuthorityRef:'authority-ref'},
   {asOfDate:'2026-13-10',commercialConfirmed:true,commercialAuthorityRef:'authority-ref'},
   {asOfDate:'2026-10-15T08:00Z',commercialConfirmed:true,commercialAuthorityRef:'authority-ref'}
  ]){
   const m=report.buildReportModel(p,{reportId:'R08',...o});
   const q=m.materialLcReport;
   assert.equal(q.ready,false,JSON.stringify(o));
   assert.equal(q.master,null);assert.deepEqual(q.materials,[]);
   assert.deepEqual(q.milestones,[]);assert.deepEqual(m.tasks,[]);
   for(const key of ['buyer','factory','style','po','quantity','requiredExFactory'])
    assert.equal(m.order[key],q.labels.missing,'source order context is private');
   noSecrets(m,'gated R08');
   assert.throws(()=>storage.exportReportWorkbook(m),/commercial|review|date|authority/i);
  }
  assert.equal(JSON.stringify(p),before);
 }
 assert.equal(materialLc.project(fixture(),{language:'en'}).ready,false);
});
test('knit and woven distinguish source Master LC from two supplier B2B LCs, QC date != accepted',()=>{
 for(const profile of ['knit','woven']){
  const p=fixture(profile),original=JSON.stringify(p);
  const m=build(p),d=m.materialLcReport;
  assert.equal(d.ready,true);assert.equal(d.asOfDate,DATE);
  assert.equal(d.master.status,'opened');
  assert.equal(d.master.openedOn,'2026-10-10');
  assert.equal(d.master.evidenceRecorded,true);
  assert.equal(d.master.sourceDocumented,true,'source date and document ref recorded, not bank authenticated');
  assert.ok(d.warnings.includes(d.labels.masterWarning));
  assert.equal(d.materials.length,3);
  const fabric=d.materials.find(x=>x.ref==='FAB-01');
  const trims=d.materials.find(x=>x.ref==='TRM-02');
  const accessory=d.materials.find(x=>x.ref==='ACC-03');
  assert.equal(fabric.supplier,'SOURCE FABRIC SUPPLIER');
  assert.equal(fabric.country,'China');
  assert.equal(fabric.requiredQty,1250.5);
  assert.equal(fabric.shortageQty,120.5);
  assert.equal(fabric.booking,'2026-10-07');
  assert.equal(fabric.application,'2026-10-08');
  assert.equal(fabric.b2bOpened,'2026-10-12');
  assert.equal(fabric.b2bState,d.labels.openedReported);
  assert.equal(fabric.inHouse,'2026-10-13');
  assert.equal(fabric.qcDate,'2026-10-14');
  assert.equal(fabric.qcState,d.labels.qcUnknown);
  assert.equal(fabric.readiness,d.labels.notReady);
  assert.equal(fabric.masterLcAssociated,true);
  assert.equal(fabric.sourceEvidenceRecorded,true);
  assert.equal(trims.application,'2026-10-11');
  assert.equal(trims.b2bOpened,null);
  assert.equal(trims.b2bState,d.labels.applied,'supplier application is NOT opened');
  assert.equal(trims.qcState,d.labels.qcPending);
  assert.equal(trims.shortageQty,null);
  assert.equal(accessory.b2bState,d.labels.notApplicable);
  assert.equal(accessory.shortageQty,0,'explicit recorded zero distinct from missing');
  assert.equal(accessory.qcState,d.labels.qcPending);
  assert.deepEqual(d.counts,{materials:3,shortages:1,missingQc:2});
  assert.equal(m.tasks.length,d.milestones.length);
  const booked=d.milestones.find(x=>x.ref==='FP02');
  assert.equal(booked.actual,'2026-10-09');
  assert.equal(booked.current,'2026-10-09');
  assert.equal(booked.forecast,'2026-10-10');
  assert.equal(d.milestones.find(x=>x.ref==='FP16').actual,null,
   'QC task in progress cannot be treated as passed');
  assert.equal(d.milestones.find(x=>x.ref==='TR12').actual,null,
   'future/incomplete task cannot be actual');
  assert.ok(d.warnings.some(x=>x.includes(d.labels.noActual)));
  assert.ok(!JSON.stringify(m).includes('PRIVATE-SUPPLIER-QC-SCAN'));
  noSecrets(m,'R08 source model');
  assert.equal(JSON.stringify(p),original);
 }
});
test('Master LC cancelled, pending, future, missing reference, invalid date never get authenticated',()=>{
 const p=fixture('knit');
 p.commitments.masterLcStatus='cancelled';
 const cancel=build(p).materialLcReport;
 assert.equal(cancel.master.sourceDocumented,false);
 assert.equal(cancel.master.status,'cancelled');
 assert.equal(cancel.master.state,cancel.labels.masterCancelled);
 p.commitments.masterLcStatus='pending';
 const pending=build(p).materialLcReport;
 assert.equal(pending.master.sourceDocumented,false);
 p.commitments.masterLcStatus='opened';
 p.commitments.masterLcProofRef='';
 const missing=build(p).materialLcReport;
 assert.equal(missing.master.sourceDocumented,false);
 assert.equal(missing.master.state,missing.labels.masterUnknown);
 p.commitments.masterLcProofRef='SOURCE-REF';
 p.commitments.masterLcOpenedOn='2026-11-08';
 const future=build(p).materialLcReport;
 assert.equal(future.master.openedOn,null);
 assert.equal(future.master.sourceDocumented,false);
 assert.ok(future.warnings.some(x=>x.includes(future.labels.invalidDate)));
 p.commitments.masterLcOpenedOn='2026-02-30';
 const invalid=build(p).materialLcReport;
 assert.equal(invalid.master.openedOn,null);
 assert.equal(invalid.master.sourceDocumented,false);
});
test('Future B2B opening, TT contradiction and malformed shortages cannot create false readiness',()=>{
 const p=fixture();
 const fabric=p.materials[0],trim=p.materials[1],accessory=p.materials[2];
 fabric.b2bLcOpenDate='2026-10-20';
 fabric.inHouseDate='2026-02-30';
 fabric.QCDate='2026-10-20';
 fabric.requiredQty=-20;
 fabric.shortageQty='0'; // not a verified number
 trim.b2bLcOpenDate='2026-02-30';
 accessory.b2bLcOpenDate='2026-10-14'; // TT with B2B opened is contradictory
 const d=build(p).materialLcReport;
 const fab=d.materials.find(x=>x.ref==='FAB-01');
 assert.equal(fab.b2bOpened,null);assert.equal(fab.b2bState,d.labels.applied);
 assert.equal(fab.requiredQty,null);assert.equal(fab.shortageQty,null);
 assert.equal(fab.inHouse,null);assert.equal(fab.qcDate,null);
 const tr=d.materials.find(x=>x.ref==='TRM-02');
 assert.equal(tr.b2bOpened,null);assert.equal(tr.b2bState,d.labels.applied);
 const acc=d.materials.find(x=>x.ref==='ACC-03');
 assert.equal(acc.b2bState,d.labels.invalidLc);
 assert.ok(d.warnings.some(x=>x.includes(d.labels.invalidLc)));
 assert.ok(d.warnings.some(x=>x.includes(d.labels.invalidQty)));
 assert.ok(d.warnings.some(x=>x.includes(d.labels.invalidDate)));
});
test('4 languages genuine XLSX: supplier rows typed numeric/date, no source proof ID/formulas/prices',()=>{
 const p=fixture('woven');
 const t=p.materials[0];
 t.supplier=' \t=HYPERLINK("https://unsafe.invalid","supplier")';
 const before=JSON.stringify(p);
 for(const language of ['en','bn','hi','ta']){
  const m=build(p,{language}),d=m.materialLcReport;
  assert.equal(d.ready,true);
  for(const key of ['asOf','consent','accessRef','master','masterStatus','masterDate',
   'b2b','application','opened','b2bState','supplier','category','required',
   'inHouse','qc','shortage','notReady','noAutomatic','notes'])
   assert.ok(d.labels[key],language+' missing '+key);
  const b=XLSX.read(storage.exportReportWorkbook(m),{type:'buffer',cellFormula:true});
  assert.deepEqual(b.SheetNames,SHEETS);
  const master=XLSX.utils.sheet_to_json(b.Sheets['Master LC Review'],{header:1,raw:true});
  assert.equal(master[1][0],'opened');assert.ok(typeof master[1][1]==='number');
  const mats=XLSX.utils.sheet_to_json(b.Sheets['Material Sources'],{header:1,raw:true});
  const fab=mats.find(x=>x[0]==='FAB-01');
  assert.ok(fab);
  assert.equal(fab[6],1250.5);assert.equal(fab[8],120.5);
  for(const index of [9,10,11,13,14])assert.ok(typeof fab[index]==='number','typed date '+index);
  assert.ok(fab[2].trimStart().startsWith("'"),'Excel formula-safe supplier');
  const trim=mats.find(x=>x[0]==='TRM-02');
  assert.equal(trim[11],d.labels.missing,'no invented B2B open date');
  const mile=XLSX.utils.sheet_to_json(b.Sheets['Sourcing Milestones'],{header:1,raw:true});
  const book=mile.find(x=>x[0]==='FP02');
  assert.ok(typeof book[3]==='number'&&typeof book[4]==='number'&&typeof book[5]==='number'&&typeof book[6]==='number');
  const summary=XLSX.utils.sheet_to_json(b.Sheets['Report Summary'],{header:1,raw:true});
  assert.ok(summary.some(row=>row[0]===d.labels.asOf&&typeof row[1]==='number'));
  assert.equal(b.Sheets['Material Sources']['!autofilter'].ref,b.Sheets['Material Sources']['!ref']);
  for(const [name,sheet] of Object.entries(b.Sheets))
   for(const [addr,cell] of Object.entries(sheet))
    if(!addr.startsWith('!'))assert.equal(cell.f,undefined,name+'/'+addr+' formula disallowed');
  noSecrets(Object.values(b.Sheets).flatMap(sheet=>Object.entries(sheet)
   .filter(([addr])=>!addr.startsWith('!')).map(([,cell])=>cell.v)),language+' XLSX');
  noSecrets(m,language+' model');
 }
 assert.equal(JSON.stringify(p),before);
});
test('no material inputs is Needs Information; old saved copies and R01-R07 report contracts remain isolated',()=>{
 const p=fixture('knit');p.materials=[];
 const d=build(p).materialLcReport;
 assert.equal(d.ready,true);assert.deepEqual(d.materials,[]);
 assert.ok(d.warnings.includes(d.labels.noData));
 const before=JSON.stringify(p);
 assert.deepEqual(storage.importCopy(storage.exportCopy(p)),p);
 for(const id of ['R01','R02','R03','R04','R05','R06','R07']){
  const options={reportId:id,language:'en',asOfDate:DATE,
   managementConfirmed:id==='R06',
   productionAudience:id==='R07'?'internal':undefined,internalConfirmed:id==='R07',
   ...(id==='R05'?{weekStart:'2026-10-12',weekEnd:'2026-10-18',reviewDate:DATE}:{})};
  const model=report.buildReportModel(p,options);
  assert.equal(model.materialLcReport,undefined,id+' unchanged');
 }
 assert.equal(JSON.stringify(p),before);
});
