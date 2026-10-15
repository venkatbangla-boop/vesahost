/**
 * GMR-10 R07 real source-only production status and genuine XLSX tests.
 * Synthetic garment plans only. Never authenticate a buyer, guess daily
 * output, count lot shipments as production or replace the signed TNA.
 */
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const domain=require('../src/domain.js'),reports=require('../src/reports.js');
const storage=require('../src/storage.js'),project=require('../src/production-status-report.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const DATE='2026-10-15';
const SHARED_SHEETS=['Report Summary','Order Summary','Report Activities','Production Stages','Production Events'];
const NOTES='Report Notes';
const INTERNAL_SHEETS=[...SHARED_SHEETS,'Operation Snapshots',NOTES];
const BUYER_SHEETS=[...SHARED_SHEETS,NOTES];
const SECRETS=['PRIVATE-FACTORY-IDENTITY','PRIVATE-FOB-LC-MARGIN','PRIVATE-OPERATOR-COMMENT',
 'PRIVATE-REJECT-SOURCE','PRIVATE-RATE-EVIDENCE','PRIVATE-BUYER-AUTHORIZATION',
 'PRIVATE-APPROVAL-REFERENCE','PRIVATE-SUPPLIER-IDENTITY','PRIVATE-RAW-TASK-TITLE'];
function fixture(templateId='knit'){
 const p=domain.createPlan({templateId,buyerName:'R07 TEST BUYER',
  factoryName:SECRETS[0],styleNo:'R07-STYLE',poNumber:'R07-PO',
  totalQty:2400,buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'qa'});
 p.order.commercialNotes=SECRETS[1];p.order.fabricSpec=SECRETS[2];
 p.commitments.masterLcProofRef=SECRETS[1];
 p.materials=[{supplier:SECRETS[7],remarks:SECRETS[2]}];
 p.approvals=[{itemName:SECRETS[1],evidenceRef:SECRETS[6]}];
 const task=ref=>{const t=p.tasks.find(x=>x.templateRef===ref);assert.ok(t,templateId+' '+ref);return t;};
 const edit=(ref,fields)=>{const t=task(ref),before={...t.dates};
  Object.assign(t,fields);if(fields.dates)t.dates={...before,...fields.dates};return t;};
 edit('C04',{status:'completed',proofRefs:['SOURCE-CUT-START'],
  dates:{baselineFinish:'2026-10-09',actualFinish:'2026-10-11'}});
 edit('C05',{status:'in-progress',proofRefs:['SOURCE-QTY-CUT'],
  quantity:{required:2400,completed:400,unit:'pcs'},
  title:SECRETS[8],followUpNote:SECRETS[2],dates:{currentTargetFinish:'2026-10-16'}});
 edit('C06',{status:'in-progress',dates:{
  baselineFinish:'2026-10-19',currentTargetFinish:'2026-10-20',forecastFinish:'2026-10-21'}});
 edit('P01',{status:'completed',proofRefs:['SOURCE-SEW-START'],
  dates:{baselineFinish:'2026-10-10',actualFinish:'2026-10-12'}});
 edit('P02',{status:'in-progress',proofRefs:['SOURCE-SEW-QUANTITY'],
  quantity:{required:2400,completed:180,unit:'pcs'}});
 edit('P03',{status:'in-progress',dates:{baselineFinish:'2026-10-24'}});
 edit('P07',{status:'in-progress',dates:{baselineFinish:'2026-10-25'}});
 edit('P08',{status:'completed',proofRefs:['SOURCE-FINISH-END'],
  quantity:{required:2400,completed:200,unit:'pcs'},
  dates:{baselineFinish:'2026-10-27',actualFinish:'2026-10-14'}});
 edit('PK02',{status:'in-progress',dates:{baselineFinish:'2026-10-28'}});
 edit('PK03',{status:'in-progress',quantity:{required:2400,completed:30,unit:'pcs'},
  proofRefs:[],dates:{baselineFinish:'2026-10-29'}});
 edit('PK04',{status:'not-started',dates:{baselineFinish:'2026-10-30'}});
 p.operations=[
  {operationId:'CUT-1',type:'cut',lotId:null,unit:'pcs',
   qtyInput:1000,qtyCompleted:800,qtyRejected:50,qtyReworked:0,qtyWip:100,
   sourceNotes:SECRETS[2],proofRefs:[SECRETS[3]],
   verifiedDailyOutput:200,rateReviewed:true,rateEvidenceRef:SECRETS[4],
   rateAsOfDate:'2026-10-14',datedCapacityEntries:[],dailyActuals:[]},
  {operationId:'SEW-CAPACITY-ONLY',type:'sew',lotId:null,unit:'pcs',
   qtyInput:0,qtyCompleted:0,qtyRejected:0,qtyReworked:0,qtyWip:0,
   datedCapacityEntries:[{resourceId:'SEW-1',date:DATE,allocatedLines:1,availableLines:2}]},
  {operationId:'PACK-1',type:'pack',lotId:null,unit:'pcs',
   qtyInput:100,qtyCompleted:90,qtyRejected:0,qtyReworked:0,qtyWip:10,
   notes:SECRETS[2],datedCapacityEntries:[],dailyActuals:[]}
 ];
 p.shipmentLots=[{lotId:'LOT-1',lotReference:'LOT-1',plannedQty:600,
  packedQty:580,passedQty:570,shippedQty:560,factory:SECRETS[0],
  poAllocation:[{poNumber:'R07-PO',qty:600}]}];
 p.quantityLedger=[{ref:'UNREVIEWED',remarks:SECRETS[2],completedQty:9999}];
 return p;
}
const make=(p,options={})=>reports.buildReportModel(p,{
 reportId:'R07',language:'en',asOfDate:DATE,productionAudience:'internal',
 internalConfirmed:true,generatedAt:'2026-10-15T08:00:00.000Z',
 timezone:'Asia/Dhaka',...options});
function ensureSafe(value,where){
 const raw=typeof value==='string'?value:JSON.stringify(value);
 for(const secret of SECRETS)assert.ok(!raw.includes(secret),where+' leaked '+secret);
 assert.ok(!raw.includes('O03'),where+' leaked commercial activity');
 assert.ok(!raw.includes('Master LC evidence'),where+' leaked finance label');
}
test('R07 cannot print/export pre-consent, invalid review dates, unselected audience, or buyer missing approval source',()=>{
 for(const template of ['knit','woven']){
  const p=fixture(template),before=JSON.stringify(p);
  const cases=[
   {},{asOfDate:DATE},{asOfDate:DATE,productionAudience:'internal'},
   {asOfDate:DATE,productionAudience:'internal',internalConfirmed:false},
   {asOfDate:'2026-02-30',productionAudience:'internal',internalConfirmed:true},
   {asOfDate:'2026-10-15T08:00Z',productionAudience:'internal',internalConfirmed:true},
   {asOfDate:DATE,productionAudience:'buyer',buyerShareConfirmed:true},
   {asOfDate:DATE,productionAudience:'buyer',authorizationRef:'PRIVATE-BUYER-AUTHORIZATION'},
   {asOfDate:DATE,productionAudience:'buyer',buyerShareConfirmed:true,authorizationRef:'   '}
  ];
  for(const item of cases){
   const m=reports.buildReportModel(p,{reportId:'R07',...item});
   assert.equal(m.productionStatus.ready,false);
   assert.deepEqual(m.productionStatus.stages,[]);
   assert.deepEqual(m.productionStatus.operations,[]);
   assert.equal(m.tasks.length,0);
   assert.equal(m.order.factory,m.productionStatus.labels.unknown);
   assert.equal(m.order.buyer,m.productionStatus.labels.unknown);
   assert.equal(m.order.style,m.productionStatus.labels.unknown);
   assert.equal(m.order.po,m.productionStatus.labels.unknown);
   ensureSafe(m,'R07 unreviewed');
   assert.throws(()=>storage.exportReportWorkbook(m),/date|audience|review|select/i);
  }
  assert.equal(JSON.stringify(p),before);
 }
});
test('knit and woven: canonical four-stage evidence, source-only balances, rate days but NO projected end',()=>{
 for(const template of ['knit','woven']){
  const p=fixture(template),before=JSON.stringify(p);
  const m=make(p),d=m.productionStatus;
  assert.equal(d.ready,true);assert.equal(d.mode,'internal');
  assert.deepEqual(d.stages.map(s=>s.key),['cutting','sewing','finishing','packing']);
  assert.equal(d.asOfDate,DATE);
  const cut=d.stages[0];
  assert.equal(cut.actualStart,'2026-10-11');
  assert.equal(cut.actualFinish,null);
  assert.equal(cut.original,'2026-10-19');
  assert.equal(cut.revised,'2026-10-20');
  assert.equal(cut.forecast,'2026-10-21');
  assert.equal(cut.required,2400);assert.equal(cut.completed,400);
  assert.equal(cut.remaining,2000);assert.equal(cut.unit,'pcs');
  assert.equal(cut.rate,200);assert.equal(cut.days,10);
  assert.equal(cut.projectedFinish,null,'unknown work calendar and gate cannot become calendar forecast');
  const sew=d.stages[1];
  assert.equal(sew.completed,180);assert.equal(sew.remaining,2220);
  assert.equal(sew.rate,null);assert.equal(sew.days,null);
  assert.equal(sew.operations.length,0,'capacity-entry zero placeholders are NOT zero production');
  const fin=d.stages[2];
  assert.equal(fin.actualFinish,'2026-10-14');
  assert.equal(fin.completed,200);assert.equal(fin.remaining,2200);
  const pack=d.stages[3];
  assert.equal(pack.required,null);assert.equal(pack.completed,null);assert.equal(pack.remaining,null,
   'quantity lacking task proof stays unknown');
  assert.equal(d.operations.length,2,'only entered operation snapshots, not empty capacity');
  const op=d.operations.find(x=>x.ref==='CUT-1');
  assert.equal(op.input,1000);assert.equal(op.completed,800);assert.equal(op.rejected,50);
  assert.equal(op.wip,100);assert.equal(op.unaccounted,50);
  assert.equal(d.operations.find(x=>x.ref==='PACK-1').unaccounted,0);
  assert.ok(!JSON.stringify(m).includes('UNREVIEWED'),'unknown ledger schema excluded from production totals');
  assert.ok(!JSON.stringify(m).includes('9999'),'lot/ledger values cannot enter production balance');
  assert.equal(m.tasks.length,4);
  assert.equal(m.masterSheet,null);
  assert.equal(JSON.stringify(p),before);
 }
});
test('buyer audience: explicit consent, proof existence, no private factory/LC/evidence/operation/lot leakage',()=>{
 const p=fixture('woven'),before=JSON.stringify(p);
 const m=make(p,{productionAudience:'buyer',internalConfirmed:false,
  buyerShareConfirmed:true,authorizationRef:SECRETS[5]});
 const d=m.productionStatus;
 assert.equal(d.ready,true);assert.equal(d.mode,'buyer');
 assert.equal(m.order.factory,d.labels.unknown);
 assert.equal(m.audience,d.labels.buyer);
 assert.equal(d.authorization,'operator-attested buyer scope');
 assert.deepEqual(d.operations,[]);
 assert.ok(d.stages.every(x=>x.operations.length===0));
 assert.equal(d.stages[0].rate,null,'internal reviewed rate never enters buyer report');
 assert.equal(d.stages[0].days,null);
 assert.equal(d.stages[0].required,2400);
 assert.equal(d.stages[0].remaining,2000);
 assert.equal(d.stages[3].completed,null);
 assert.equal(m.tasks.length,4);
 assert.ok(m.tasks.every(x=>x.owner===''&&x.risk==='needs-information'));
 ensureSafe(m,'R07 buyer JSON');
 const workbook=XLSX.read(storage.exportReportWorkbook(m),{type:'buffer',cellFormula:true});
 assert.deepEqual(workbook.SheetNames,BUYER_SHEETS);
 assert.equal(XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1})[1][1],d.labels.unknown);
 ensureSafe(Object.values(workbook.Sheets).flatMap(sh=>
  Object.entries(sh).filter(([k])=>!k.startsWith('!')).map(([,cell])=>cell.v)),
 'R07 buyer XLSX');
 assert.equal(JSON.stringify(p),before);
});
test('invalid/unsupported quantity, dates, rate or units fail closed without inventing stage completion',()=>{
 const p=fixture();
 const cut=p.tasks.find(t=>t.templateRef==='C05'),finish=p.tasks.find(t=>t.templateRef==='C06');
 cut.quantity.completed=2600;
 const op=p.operations[0];
 op.verifiedDailyOutput=500;
 op.rateReviewed=false;
 finish.status='completed';finish.proofRefs=[];
 finish.dates.actualFinish='2026-10-14';
 const model=make(p),d=model.productionStatus;
 assert.equal(d.stages[0].required,null);
 assert.equal(d.stages[0].remaining,null);
 assert.equal(d.stages[0].days,null);
 assert.equal(d.stages[0].actualFinish,null);
 assert.ok(d.warnings.some(s=>s.includes(d.labels.invalidQty)));
 assert.ok(d.warnings.some(s=>s.includes(d.labels.invalidDate)));
 cut.quantity.completed=300;
 cut.quantity.unit='sets';
 assert.equal(make(p).productionStatus.stages[0].remaining,null,
  'pieces must not be converted to sets by guessing');
 cut.quantity.unit='pcs';
 cut.quantity.completed=300;
 op.rateReviewed=true;op.rateEvidenceRef='';
 assert.equal(make(p).productionStatus.stages[0].rate,null);
 op.rateEvidenceRef='SOURCE';op.rateAsOfDate='2026-10-16';
 assert.equal(make(p).productionStatus.stages[0].days,null,'future reviewed rate is not available as-of');
 op.rateAsOfDate='2026-10-14';
 p.operations.push({...op,operationId:'CUT-2',lotId:'LOT-2'});
 assert.equal(make(p).productionStatus.stages[0].days,null,
  'multi-operation rates cannot be projected as a single order throughput');
 assert.equal(make(p).productionStatus.stages[0].projectedFinish,null);
});
test('four languages: dated, numeric XLSX; no injection formulas; buyers never get operation worksheet',()=>{
 const p=fixture('knit'),before=JSON.stringify(p);
 const cut=p.operations[0];cut.operationId=' \t=HYPERLINK("https://bad.invalid","op")';
 for(const lang of ['en','bn','hi','ta']){
  const m=make(p,{language:lang}),d=m.productionStatus;
  assert.equal(d.ready,true);
  for(const key of ['asOf','choose','internal','buyer','internalConsent',
   'buyerConsent','buyerReference','required','completed','remaining','rate','days',
   'projected','noLotAggregation','noAccess','noRate','notActual']){
   assert.ok(d.labels[key],lang+': '+key);
  }
  const w=XLSX.read(storage.exportReportWorkbook(m),{type:'buffer',cellStyles:true,cellFormula:true});
  assert.deepEqual(w.SheetNames,INTERNAL_SHEETS);
  const rows=XLSX.utils.sheet_to_json(w.Sheets['Production Stages'],{header:1,raw:true});
  const cutting=rows[1];
  assert.equal(cutting[0],d.stages[0].title);
  assert.equal(cutting[8],2400);assert.equal(cutting[9],400);assert.equal(cutting[10],2000);
  assert.equal(cutting[12],200);assert.equal(cutting[13],10);
  assert.ok(typeof cutting[3]==='number'&&typeof cutting[4]==='number'&&typeof cutting[5]==='number');
  assert.ok(typeof cutting[6]==='number','event dates should be real typed Excel dates');
  assert.equal(cutting[14],d.labels.unknown);
  assert.equal(w.Sheets['Production Stages']['!autofilter'].ref,w.Sheets['Production Stages']['!ref']);
  const events=XLSX.utils.sheet_to_json(w.Sheets['Production Events'],{header:1,raw:true});
  assert.ok(events.some(x=>x[1]==='C04'&&typeof x[3]==='number'));
  const opRows=XLSX.utils.sheet_to_json(w.Sheets['Operation Snapshots'],{header:1,raw:true});
  const suspicious=opRows.find(x=>String(x[0]).includes('HYPERLINK'));
  assert.ok(suspicious&&suspicious[0].trimStart().startsWith("'"),'formula-like operation ID escaped');
  const summary=XLSX.utils.sheet_to_json(w.Sheets['Report Summary'],{header:1,raw:true});
  assert.ok(summary.find(x=>x[0]===d.labels.asOf&&typeof x[1]==='number'));
  for(const [name,sheet] of Object.entries(w.Sheets))
   for(const [address,cell] of Object.entries(sheet))
    if(!address.startsWith('!'))assert.equal(cell.f,undefined,'no formula in '+lang+':'+name+'/'+address);
 }
 assert.equal(JSON.stringify(p),before);
});
test('R07 does not alter old saved copies, TNA schema, PPM/AQL engines or R01-R06 isolation',()=>{
 const p=fixture('woven'),before=JSON.stringify(p);
 assert.deepEqual(storage.importCopy(storage.exportCopy(p)),p);
 for(const id of ['R01','R02','R03','R04','R05','R06']){
  const m=reports.buildReportModel(p,{reportId:id,language:'en',
   asOfDate:['R03','R06'].includes(id)?DATE:undefined,
   managementConfirmed:id==='R06',
   ...(id==='R05'?{weekStart:'2026-10-12',weekEnd:'2026-10-18',reviewDate:DATE}:{})});
  assert.equal(m.productionStatus,undefined,id+' must never gain R07 data');
 }
 assert.equal(make(p).source.recordId,p.recordId);
 assert.equal(JSON.stringify(p),before);
});
