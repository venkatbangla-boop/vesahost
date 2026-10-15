/**
 * GMR-09 R06: source-only management delay/recovery projection and real XLSX.
 * Synthetic knit/woven facts; no guessed dates, working-day or CPM impact.
 */
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const reports=require('../src/reports.js'),delay=require('../src/delay-recovery-report.js');
const domain=require('../src/domain.js'),storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const expected=['Report Summary','Order Summary','Report Activities','Delay Actions',
 'Delay Follow-up','Dependency Links','Recovery Scenarios','Approval Records','Report Notes'];
const asOf='2026-10-15';
function fixture(profile='knit'){
 const plan=domain.createPlan({templateId:profile,
  buyerName:'SYNTHETIC MANAGEMENT BUYER',factoryName:'PRIVATE MANAGEMENT FACTORY',
  styleNo:'R06-MANAGEMENT-STYLE',poNumber:'R06-PO',totalQty:2400,
  orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-20'},
  {ownerUserId:'qa-management'});
 function task(ref){const t=plan.tasks.find(x=>x.templateRef===ref);assert.ok(t,profile+'/'+ref);return t;}
 const edit=(ref,fields)=>{const t=task(ref),d={...t.dates};
  Object.assign(t,fields);if(fields.dates)t.dates={...d,...fields.dates};return t;};
 edit('D05',{status:'blocked',waitingFor:'buyer',ownerParty:'sample-room',
  delayReason:'RECORDED-SOURCE-LAB-REJECTION',recoveryAction:'PROPOSE-RETEST-NOT-AGREED',
  proofRefs:['INTERNAL-APPROVAL-ID'],dates:{baselineFinish:'2026-10-09',
   currentTargetFinish:'2026-10-13',forecastFinish:'2026-10-16'}});
 edit('D08',{status:'approved',proofRefs:['AUTHENTICATED-IN-SOURCE-NOT-INDEPENDENT'],
  dates:{baselineFinish:'2026-10-12',actualFinish:'2026-10-15'}});
 edit('P01',{status:'in-progress',recoveryAction:'PROPOSE-EXTRA-LINE',
  dates:{baselineFinish:null,currentTargetFinish:null}});
 edit('D11',{status:'in-progress',delayReason:'SOURCE-REVISED-INVALID',
  dates:{baselineFinish:'2026-10-09',currentTargetFinish:'2026-02-30'}});
 edit('D14',{status:'completed',delayReason:'EARLY-SOURCE-FINISH',
  dates:{baselineFinish:'2026-10-20',currentTargetFinish:'2026-10-18',
   actualFinish:'2026-10-17'}});
 edit('D15',{status:'in-progress',recoveryAction:'REVIEW-ARTWORK',
  dates:{baselineFinish:'2026-10-22'}});
 edit('Q07',{status:'in-progress',delayReason:'SOURCE-STATUS-CONFLICT',
  dates:{baselineFinish:'2026-10-10',actualFinish:'2026-10-11'}});
 const start=task('D05'),end=task('P01');
 plan.edges.push({edgeId:'R06-ADDED-SS',predecessorTaskId:start.taskId,
  successorTaskId:end.taskId,relation:'SS',lagUnits:2,lagBasis:'working',calendarPolicy:'successor'});
 plan.approvals=[
  {approvalId:'APR-FIT',itemName:'Fit sample decision',responseStatus:'approved',
   submittedDate:'2026-10-11',decisionDate:'2026-10-14',
   authorizedReviewerId:'reviewer-local',evidenceRef:'PRIVATE-EVIDENCE-DO-NOT-EXPORT',
   requiredForTaskIds:[task('D08').taskId]},
  {approvalId:'APR-PP',itemName:'PP sample decision',responseStatus:'pending',
   submittedDate:'2026-10-12',requiredForTaskIds:[task('D05').taskId]}
 ];
 plan.scenarioBranches=[
  {scenarioId:'REC-SC-01',baseRecordId:plan.recordId,
   baseRevision:plan.revision,name:'Recorded shorter sample test',
   status:'preview',createdAt:'2026-10-13T06:00:00Z',
   changes:{durationAdjustments:[{taskId:start.taskId,durationUnits:2}],
    routeChanges:[{taskId:end.taskId,ownerParty:'factory'}],calendarChanges:[],capacityChanges:[]},
   baseForecastDate:'2026-10-24',scenarioForecastDate:'2026-10-20',
   workingDaysGained:4},
  {scenarioId:'REC-SC-02',baseRecordId:plan.recordId,
   baseRevision:plan.revision,name:'Locally applied plan',
   status:'applied',createdAt:'2026-10-13T06:00:00Z',appliedAt:'2026-10-14T06:00:00Z',
   changes:{durationAdjustments:[],routeChanges:[],calendarChanges:[{calendarId:'default'}],
    capacityChanges:[{operationId:'local-op',date:'2026-10-14'}]},
   baseForecastDate:'2026-10-24',scenarioForecastDate:'2026-10-19',
   workingDaysGained:5}
 ];
 plan.commitments.masterLcProofRef='CONFIDENTIAL-LC-PROOF';
 plan.order.commercialNotes='PRIVATE-FOB-MARGIN-NOTE';
 return plan;
}
const make=(p,options={})=>reports.buildReportModel(p,{reportId:'R06',
 managementConfirmed:true,asOfDate:asOf,language:'en',
 generatedAt:'2026-10-15T08:00:00.000Z',timezone:'Asia/Dhaka',...options});
test('R06 requires explicit management-use consent and strict civil as-of date',()=>{
 for(const profile of ['knit','woven']){
  const p=fixture(profile),before=JSON.stringify(p);
  for(const opts of [{},{asOfDate:asOf},{managementConfirmed:true},
   {managementConfirmed:true,asOfDate:'2026-02-30'},
   {managementConfirmed:true,asOfDate:'2026-13-01'},
   {managementConfirmed:true,asOfDate:'2026-10-15T00:00:00Z'},
   {managementConfirmed:false,asOfDate:asOf}]){
   const model=reports.buildReportModel(p,{reportId:'R06',...opts});
   assert.equal(model.delayRecovery.ready,false);
   assert.equal(model.tasks.length,0,'no task details before management consent');
   assert.equal(model.delayRecovery.issues.length,0);
   assert.equal(model.delayRecovery.scenarios.length,0);
   assert.equal(model.delayRecovery.approvals.length,0);
   assert.equal(model.order.factory,model.delayRecovery.labels.unknown);
   assert.equal(model.order.buyer,model.delayRecovery.labels.unknown);
   assert.equal(model.order.style,model.delayRecovery.labels.unknown);
   assert.equal(model.order.po,model.delayRecovery.labels.unknown);
   assert.ok(!JSON.stringify(model).includes('RECORDED-SOURCE-LAB-REJECTION'));
   assert.throws(()=>storage.exportReportWorkbook(model),/management|review|date/i);
  }
  assert.equal(JSON.stringify(p),before);
 }
 assert.equal(delay.project(fixture(),{language:'en'}).ready,false);
});
test('R06 dated knit/woven issues, signed differences, blocked owners, reason and downstream graph links',()=>{
 for(const profile of ['knit','woven']){
  const p=fixture(profile),before=JSON.stringify(p),model=make(p),d=model.delayRecovery;
  assert.equal(d.ready,true);
  assert.equal(d.asOfDate,asOf);
  assert.equal(model.audience,'Management');
  assert.equal(model.order.factory,'PRIVATE MANAGEMENT FACTORY');
  assert.equal(model.masterSheet,null,'no R01 master projection');
  const blocked=d.issues.find(x=>x.ref==='D05');
  assert.equal(blocked.original,'2026-10-09');
  assert.equal(blocked.current,'2026-10-13');
  assert.equal(blocked.forecast,'2026-10-16');
  assert.equal(blocked.actual,null);
  assert.equal(blocked.due,'2026-10-13');
  assert.equal(blocked.waiting,'buyer');
  assert.equal(blocked.cause,'RECORDED-SOURCE-LAB-REJECTION');
  assert.equal(blocked.recovery,'PROPOSE-RETEST-NOT-AGREED');
  assert.equal(blocked.targetChangeDays,4,'signed calendar-day delta');
  assert.equal(blocked.forecastChangeDays,3);
  assert.equal(blocked.actualChangeDays,null);
  assert.ok(blocked.indicators.includes(d.labels.overdue));
  assert.ok(blocked.indicators.includes(d.labels.blocked));
  assert.ok(blocked.successors.includes('P01'),'SS source link acknowledged');
  assert.ok(d.warnings.includes(d.labels.linkedCaution),
   'linkage must not be presented as proven delayed impact');
  const actual=d.issues.find(x=>x.ref==='D08');
  assert.equal(actual.actualChangeDays,3,'actual late is dated source only');
  assert.ok(actual.indicators.includes(d.labels.actualLate));
  const early=d.issues.find(x=>x.ref==='D14');
  assert.equal(early.targetChangeDays,-2,'earlier revised date keeps negative sign');
  assert.equal(early.actualChangeDays,-1,'actual date earlier than source target');
  const invalid=d.issues.find(x=>x.ref==='D11');
  assert.equal(invalid.current,null);
  assert.equal(invalid.due,null,'invalid revised date never falls back to original');
  assert.ok(invalid.indicators.includes(d.labels.undated));
  assert.ok(d.warnings.some(x=>x.includes(d.labels.invalidDate)));
  assert.ok(d.warnings.some(x=>x.includes(d.labels.dateConflict)));
  assert.ok(d.counts.blocked>=1);
  assert.ok(d.counts.overdue>=1);
  assert.ok(d.counts.missingTarget>=1);
  assert.equal(model.tasks.length,d.issues.length);
  assert.equal(JSON.stringify(p),before,'pure read-only management model');
 }
});
test('scenario application is local, not buyer consent; approvals are source-checked not authenticated',()=>{
 const p=fixture(),m=make(p),d=m.delayRecovery;
 assert.equal(d.scenarios.length,2);
 const preview=d.scenarios.find(s=>s.scenarioId==='REC-SC-01');
 assert.equal(preview.state,'preview');
 assert.equal(preview.counts.durationAdjustments,1);
 assert.equal(preview.counts.routeChanges,1);
 assert.deepEqual(preview.relatedRefs,['D05','P01']);
 assert.equal(preview.baseRevision,0);
 const applied=d.scenarios.find(s=>s.scenarioId==='REC-SC-02');
 assert.equal(applied.state,'applied');
 assert.equal(applied.appliedAt,'2026-10-14T06:00:00Z');
 assert.equal(applied.counts.calendarChanges,1);
 assert.equal(applied.counts.capacityChanges,1);
 const serialized=JSON.stringify(d);
 assert.ok(!serialized.includes('2026-10-24'),'stored preview working forecast not presented as confirmed');
 assert.ok(!serialized.includes('workingDaysGained'),'no fabricated scenario feasibility');
 assert.ok(d.warnings.includes(d.labels.scenarioCaution));
 assert.equal(d.approvals.length,2);
 const approved=d.approvals.find(x=>x.item==='Fit sample decision');
 assert.equal(approved.state,'approved','local approvalState engine reused, not reimplemented');
 assert.equal(approved.evidenceRecorded,true);
 assert.equal(approved.authorityRecorded,true);
 assert.equal(approved.decision,'2026-10-14');
 assert.deepEqual(approved.relatedRefs,['D08']);
 assert.ok(d.warnings.includes(d.labels.approvalCaution));
 assert.ok(!JSON.stringify(m).includes('PRIVATE-EVIDENCE-DO-NOT-EXPORT'),
  'source evidence ID is not duplicated in report');
 const pending=d.approvals.find(x=>x.item==='PP sample decision');
 assert.equal(pending.state,'pending');
 assert.equal(pending.evidenceRecorded,false);
});
test('all four languages localize bounded R06; genuine workbook keeps typed Excel dates and formula safety',()=>{
 const p=fixture(),original=JSON.stringify(p);
 for(const language of ['en','bn','hi','ta']){
  const model=make(p,{language}),d=model.delayRecovery;
  assert.equal(d.ready,true);
  for(const key of ['asOf','consent','selectReview','source','calendar',
   'headingIssues','headingScenarios','headingApprovals','linkedCaution',
   'scenarioCaution','approvalCaution','targetChange','forecastChange','actualChange']){
   assert.ok(d.labels[key],language+' '+key);
  }
  assert.ok(d.issues.length>=5);
  const book=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellFormula:true});
  assert.deepEqual(book.SheetNames,expected);
  const dates=XLSX.utils.sheet_to_json(book.Sheets['Delay Actions'],{header:1,raw:true});
  const blocked=dates.find(row=>row[0]==='D05');
  assert.ok(blocked&&typeof blocked[4]==='number'&&typeof blocked[5]==='number'&&typeof blocked[6]==='number');
  assert.equal(blocked[9],4);assert.equal(blocked[10],3);
  const early=dates.find(row=>row[0]==='D14');assert.equal(early[9],-2);
  const invalid=dates.find(row=>row[0]==='D11');assert.equal(invalid[5],d.labels.unknown);
  const follow=XLSX.utils.sheet_to_json(book.Sheets['Delay Follow-up'],{header:1,raw:true});
  assert.ok(follow.some(row=>row[0]==='D05'&&String(row[4]).includes('PROPOSE')));
  const links=XLSX.utils.sheet_to_json(book.Sheets['Dependency Links'],{header:1,raw:true});
  assert.ok(links.some(row=>row[0]==='D05'&&row[1]==='P01'&&row[2]===d.labels.linkedCaution));
  const scenarios=XLSX.utils.sheet_to_json(book.Sheets['Recovery Scenarios'],{header:1,raw:true});
  assert.ok(scenarios.some(row=>row[0]==='Recorded shorter sample test'&&row[5]===1));
  const approval=XLSX.utils.sheet_to_json(book.Sheets['Approval Records'],{header:1,raw:true});
  const fit=approval.find(row=>row[0]==='Fit sample decision');
  assert.ok(fit&&typeof fit[3]==='number'&&typeof fit[4]==='number');
  assert.ok(!JSON.stringify(fit).includes('PRIVATE-EVIDENCE'));
  const summary=XLSX.utils.sheet_to_json(book.Sheets['Report Summary'],{header:1,raw:true});
  assert.ok(summary.some(row=>row[0]===d.labels.asOf&&typeof row[1]==='number'));
  assert.equal(book.Sheets['Delay Actions']['!autofilter'].ref,book.Sheets['Delay Actions']['!ref']);
  for(const [name,sheet] of Object.entries(book.Sheets))
   for(const [address,cell] of Object.entries(sheet))
    if(!address.startsWith('!'))assert.equal(cell.f,undefined,language+': '+name+'/'+address);
 }
 assert.equal(JSON.stringify(p),original);
});
test('untrusted management source strings are inert in Excel; portable saved copies and prior R01-R05 unchanged',()=>{
 const p=fixture('woven'),t=p.tasks.find(t=>t.templateRef==='D05');
 t.title=' \t=HYPERLINK("https://bad.test","click")';
 t.delayReason=' \n+SUM(1,2)';t.recoveryAction='\t@SUM(2,2)';
 const prior=JSON.stringify(p),model=make(p);
 const book=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellFormula:true});
 const rows=XLSX.utils.sheet_to_json(book.Sheets['Delay Actions'],{header:1,raw:true});
 const row=rows.find(r=>r[0]==='D05');
 assert.ok(row[1].trimStart().startsWith("'"),'source formula escaped');
 const causes=XLSX.utils.sheet_to_json(book.Sheets['Delay Follow-up'],{header:1,raw:true});
 const cause=causes.find(r=>r[0]==='D05');
 assert.ok(cause[3].trimStart().startsWith("'"));
 for(const s of Object.values(book.Sheets))
  for(const [address,cell] of Object.entries(s))
   if(!address.startsWith('!'))assert.equal(cell.f,undefined);
 assert.deepEqual(storage.importCopy(storage.exportCopy(p)),p);
 for(const id of ['R01','R02','R03','R04','R05']){
  const m=reports.buildReportModel(p,{reportId:id,language:'en',
   asOfDate:id==='R03'?asOf:undefined,
   ...(id==='R05'?{weekStart:'2026-10-12',weekEnd:'2026-10-18',reviewDate:asOf}:{})});
  assert.equal(m.delayRecovery,undefined,id+' isolated');
 }
 assert.equal(JSON.stringify(p),prior);
});
