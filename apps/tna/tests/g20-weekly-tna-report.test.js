/**
 * GMR-08 R05 source-only weekly TNA and real Excel workbook tests.
 * Synthetic knit/woven garment facts; no inferred dates, buyer approval or
 * disclosure of factory/FOB/LC/internal evidence and recovery notes.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const weekly=require('../src/weekly-report.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const sheets=['Report Summary','Order Summary','Report Activities','Weekly TNA','Confirmed Recovery','Report Notes'];
const week={weekStart:'2026-10-12',weekEnd:'2026-10-18',reviewDate:'2026-10-16'};
const secrets=['PRIVATE-FACTORY-NAME','PRIVATE-FOB-MARGIN','PRIVATE-LC-EVIDENCE',
 'PRIVATE-FABRIC-COMMENT','PRIVATE-TASK-TITLE','PRIVATE-APPROVAL-PROOF',
 'PRIVATE-RECOVERY-NOTE','PRIVATE-SUPPLIER-EVIDENCE','PRIVATE-VALIDATION-NOTE'];
function fixture(profile='knit'){
 const plan=domain.createPlan({templateId:profile,buyerName:'WEEKLY BUYER',
  factoryName:secrets[0],styleNo:'R05-WEEKLY-STYLE',poNumber:'R05-PO',
  totalQty:2400,buyerRequiredExFactory:'2026-12-20'},
  {ownerUserId:'weekly-qa'});
 plan.order.commercialNotes=secrets[1];
 plan.order.fabricSpec=secrets[3];
 plan.commitments.masterLcProofRef=secrets[2];
 plan.unknownFields=[secrets[8]];
 plan.validation={ok:true,errors:[],warnings:[secrets[8]]};
 plan.approvals=[{itemName:secrets[3],evidenceRef:secrets[5]}];
 plan.materials=[{supplier:secrets[7],remarks:secrets[3]}];
 function update(ref,fields){
  const task=plan.tasks.find(t=>t.templateRef===ref);
  assert.ok(task,'synthetic source '+ref+' in '+profile);
  const oldDates={...task.dates};
  Object.assign(task,fields);
  if(fields.dates)task.dates={...oldDates,...fields.dates};
  return task;
 }
 update('D05',{status:'completed',proofRefs:['FIT-SOURCE'],dates:{
  baselineFinish:'2026-10-12',actualFinish:'2026-10-14'}});
 update('D08',{status:'awaiting-approval',waitingFor:'buyer',title:secrets[4],
  ownerParty:secrets[3],followUpNote:secrets[3],delayReason:secrets[3],
  proofRefs:[secrets[5]],recoveryAction:secrets[6],dates:{
   baselineFinish:'2026-10-13',currentTargetFinish:'2026-10-15'}});
 update('PP06',{status:'in-progress',dates:{baselineFinish:'2026-10-16'}});
 update('C04',{status:'not-started',dates:{baselineFinish:'2026-10-18'}});
 update('P01',{status:'not-started',dates:{baselineFinish:'2026-10-19'}});
 update('P03',{status:'not-started',dates:{baselineFinish:'2026-10-25'}});
 update('PK02',{status:'not-started',dates:{baselineFinish:'2026-10-26'}});
 update('D14',{status:'approved',dates:{baselineFinish:'2026-10-11',actualFinish:'2026-10-11'}});
 update('FA05',{status:'approved',dates:{baselineFinish:'2026-10-18',actualFinish:'2026-10-18'}});
 update('D11',{status:'in-progress',dates:{
  baselineFinish:'2026-10-13',currentTargetFinish:'2026-02-30'}});
 update('O03',{status:'blocked',title:secrets[1],waitingFor:'buyer',
  recoveryAction:secrets[1],dates:{currentTargetFinish:'2026-10-14'}});
 return plan;
}
function assertPrivateAbsent(value,where){
 const serialized=typeof value==='string'?value:JSON.stringify(value);
 for(const token of secrets)assert.ok(!serialized.includes(token),where+' leaked '+token);
 assert.ok(!serialized.includes('O03'),where+' leaked internal FOB activity');
 assert.ok(!serialized.includes('Master LC evidence'),where+' leaked LC label');
}
function acceptedRecovery(){
 return {ref:'D08',shareApproved:true,
  publicAction:'Buyer-safe reviewed fit response by 20 October',
  confirmedBy:'Authorized agent representative',
  agreedOn:'2026-10-14',evidenceRef:'CONFIDENTIAL-REF-CHECKED-NOT-SHARED'};
}
test('R05 requires explicitly selected and valid calendar week plus independent review date',()=>{
 const plan=fixture();
 for(const options of [
  {},{...week,weekStart:''},{...week,weekEnd:'2026-10-19'},
  {...week,weekEnd:'2026-02-30'},{...week,weekStart:'2026-02-30'},
  {...week,reviewDate:'2026-10-11'},{...week,reviewDate:'2026-13-02'}
 ]){
  const model=reports.buildReportModel(plan,{reportId:'R05',...options});
  assert.equal(model.weeklyTna.ready,false,JSON.stringify(options));
  assert.equal(model.tasks.length,0,'no unsafely unbounded source rows');
  assert.ok(model.warnings.includes(model.weeklyTna.labels.selectDates));
  assert.throws(()=>storage.exportReportWorkbook(model),/Select|date|week/i);
  assertPrivateAbsent(model,'unselected JSON');
 }
 assert.equal(weekly.project(plan,{language:'en'}).ready,false);
});
test('knit/woven weekly windows use source actuals and revised due, never browser clock or forecast for missed',()=>{
 for(const profile of ['knit','woven']){
  const plan=fixture(profile),before=JSON.stringify(plan);
  const model=reports.buildReportModel(plan,{reportId:'R05',language:'en',...week,
   generatedAt:'2026-10-16T09:00:00.000Z',timezone:'Asia/Dhaka'});
  const w=model.weeklyTna;
  assert.equal(w.ready,true);
  assert.equal(w.weekStart,week.weekStart);
  assert.equal(w.weekEnd,week.weekEnd);
  assert.equal(w.reviewDate,week.reviewDate);
  assert.ok(w.sections.completed.some(x=>x.ref==='D05'&&x.actual==='2026-10-14'));
  assert.ok(!w.sections.completed.some(x=>x.ref==='D14'),'prior-week actual not counted');
  assert.ok(!w.sections.completed.some(x=>x.ref==='FA05'),'future actual not counted');
  assert.ok(w.sections.missed.some(x=>x.ref==='D08'&&x.due==='2026-10-15'));
  assert.ok(w.sections.missed.some(x=>x.ref==='PP06'&&x.due==='2026-10-16'));
  assert.ok(!w.sections.missed.some(x=>x.ref==='C04'),'future due is not yet missed');
  assert.ok(w.sections.nextWeek.some(x=>x.ref==='P01'&&x.due==='2026-10-19'));
  assert.ok(w.sections.nextWeek.some(x=>x.ref==='P03'&&x.due==='2026-10-25'));
  assert.ok(!w.rows.some(x=>x.ref==='PK02'));
  assert.ok(w.sections.approvals.some(x=>x.ref==='D08'));
  assert.ok(!w.rows.some(x=>x.ref==='O03'));
  assert.ok(w.candidates.some(x=>x.ref==='D08'));
  assert.ok(!w.candidates.some(x=>x.ref==='O03'));
  assert.ok(w.missingDueCount>0);
  assert.ok(w.warnings.some(x=>x.includes('Invalid')));
  assert.equal(w.sections.recoveries.length,0,'source recovery note is NOT a signed agreement');
  assert.equal(model.order.factory,w.labels.unknown);
  assert.equal(model.masterSheet,null);
  assertPrivateAbsent(model,profile+' model');
  assert.equal(JSON.stringify(plan),before,'report is a pure read-only projection');
 }
});
test('four localized weekly report audiences and source provenance remain bounded',()=>{
 const plan=fixture(),before=JSON.stringify(plan);
 for(const lang of ['en','bn','hi','ta']){
  const model=reports.buildReportModel(plan,{reportId:'R05',language:lang,...week});
  const w=model.weeklyTna;
  assert.equal(w.ready,true);
  for(const key of ['weekStart','weekEnd','reviewDate','completed','missed','nextWeek',
   'approvals','recoveries','selectDates','shareLabel','sourceRef','recoveryNotice']){
   assert.ok(w.labels[key],lang+' locale '+key);
  }
  assert.ok(w.sections.completed.some(x=>x.ref==='D05'));
  assert.ok(w.sections.missed.some(x=>x.ref==='D08'));
  assert.ok(w.sections.nextWeek.some(x=>x.ref==='P01'));
  assert.ok(w.sections.approvals.some(x=>x.ref==='D08'));
  const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer'});
  assert.deepEqual(workbook.SheetNames,sheets);
  assertPrivateAbsent(Object.values(workbook.Sheets).flatMap(sheet=>
   Object.entries(sheet).filter(([address])=>!address.startsWith('!')).map(([,cell])=>cell.v)),
   lang+' Excel');
  assertPrivateAbsent(model,lang+' JSON');
 }
 assert.equal(JSON.stringify(plan),before);
});
test('explicit separately agreed recovery is review-only; no evidence reference is disclosed',()=>{
 const p=fixture(),prior=JSON.stringify(p);
 const recovery=acceptedRecovery();
 const model=reports.buildReportModel(p,{reportId:'R05',language:'en',...week,
  recoveryConfirmations:[recovery]});
 const w=model.weeklyTna;
 assert.equal(w.ready,true);
 assert.equal(w.sections.recoveries.length,1);
 const row=w.sections.recoveries[0];
 assert.equal(row.ref,'D08');
 assert.equal(row.publicAction,recovery.publicAction);
 assert.equal(row.agreementDate,recovery.agreedOn);
 assert.equal(row.confirmedBy,recovery.confirmedBy);
 assert.equal(row.evidenceRecorded,w.labels.agreementProof);
 assert.ok(!JSON.stringify(model).includes(recovery.evidenceRef),'proof ID is checked, not exposed');
 const book=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellFormula:true});
 assert.deepEqual(book.SheetNames,sheets);
 assert.equal(book.Sheets['Weekly TNA']['!autofilter'].ref,book.Sheets['Weekly TNA']['!ref']);
 const weekRows=XLSX.utils.sheet_to_json(book.Sheets['Weekly TNA'],{header:1,raw:true});
 const completed=weekRows.find(x=>x[1]==='D05');
 const missed=weekRows.find(x=>x[1]==='D08');
 const due=weekRows.find(x=>x[1]==='P01');
 assert.ok(typeof completed[7]==='number','actual date must be true Excel date');
 assert.ok(typeof missed[8]==='number','revised due must be true Excel date');
 assert.ok(typeof due[8]==='number','next-week date must be true Excel date');
 const agreed=XLSX.utils.sheet_to_json(book.Sheets['Confirmed Recovery'],{header:1,raw:true});
 assert.equal(agreed.length,2);
 assert.equal(agreed[1][0],'D08');
 assert.equal(agreed[1][2],recovery.publicAction);
 assert.ok(typeof agreed[1][3]==='number','agreement date must be typed Excel');
 const meta=XLSX.utils.sheet_to_json(book.Sheets['Report Summary'],{header:1,raw:true});
 for(const key of ['weekStart','weekEnd','reviewDate'])
  assert.ok(meta.find(r=>r[0]===w.labels[key]&&typeof r[1]==='number'));
 for(const [sheetName,ws] of Object.entries(book.Sheets))
  for(const [address,cell] of Object.entries(ws))
   if(!address.startsWith('!'))assert.equal(cell.f,undefined,'no formulas '+sheetName+'/'+address);
 assertPrivateAbsent(model,'recovery JSON');
 assertPrivateAbsent(Object.values(book.Sheets).flatMap(ws=>
  Object.entries(ws).filter(([k])=>!k.startsWith('!')).map(([,c])=>c.v)),'recovery XLSX');
 assert.equal(JSON.stringify(p),prior);
});
test('unconfirmed/invalid/rejected recovery cannot be exported or mislabelled agreed',()=>{
 const plan=fixture(),good=acceptedRecovery();
 for(const bad of [
  {...good,evidenceRef:''},{...good,confirmedBy:''},{...good,publicAction:''},
  {...good,agreedOn:'2026-10-17'},{...good,agreedOn:'2026-02-30'},
  {...good,publicAction:'x'.repeat(241)},
  {...good,ref:'O03'},{...good,ref:'UNKNOWN'}
 ]){
  const model=reports.buildReportModel(plan,{reportId:'R05',...week,recoveryConfirmations:[bad]});
  assert.equal(model.weeklyTna.ready,false,JSON.stringify(bad));
  assert.equal(model.tasks.length,0,'invalid agreement must fail closed');
  assert.ok(model.warnings.includes(model.weeklyTna.labels.badRecovery));
  assert.throws(()=>storage.exportReportWorkbook(model),/week|date/i);
 }
 const model=reports.buildReportModel(plan,{reportId:'R05',...week,
  recoveryConfirmations:[{...good,shareApproved:false}]});
 assert.equal(model.weeklyTna.ready,false,'unapproved user entries cannot be supplied as agreed recovery');
 const noConsent=reports.buildReportModel(plan,{reportId:'R05',...week});
 assert.equal(noConsent.weeklyTna.sections.recoveries.length,0);
});
test('old TNA saved copies and source task/LC schema remain frozen by weekly report',()=>{
 const p=fixture('woven'),before=JSON.stringify(p);
 const copy=storage.exportCopy(p);
 assert.deepEqual(storage.importCopy(copy),p);
 const model=reports.buildReportModel(p,{reportId:'R05',...week});
 assert.equal(model.source.recordId,p.recordId);
 assert.equal(model.source.schemaVersion,p.schemaVersion);
 assert.equal(JSON.stringify(p),before);
 for(const id of ['R01','R02','R03','R04']){
  const other=reports.buildReportModel(p,{reportId:id,
   asOfDate:id==='R03'?'2026-10-15':undefined});
  assert.equal(other.weeklyTna,undefined,id);
 }
});
