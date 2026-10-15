/**
 * GMR-15 R12 source-backed same-revision scenario A/B report regression.
 * Synthetic knit/woven plans; real engine results, immutability and privacy.
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const scenarios=require('../src/scenarios.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const secrets=['PRIVATE-PLAN-AUTHORITY','PRIVATE-FOB-COMMISSION','PRIVATE-PRIVATE-TITLE',
  'PRIVATE-SOURCE-ACTOR','PRIVATE-SCENARIO-REASON','PRIVATE-MASTER-LC'];
function plan(profile='knit'){
 const p=domain.createPlan({templateId:profile,buyerName:'R12 BUYER',
  factoryName:'R12 FACTORY',styleNo:'R12-STYLE',poNumber:'R12-PO',totalQty:100,
  orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2027-02-15'},
  {ownerUserId:'test-planner'});
 p.order.commercialNotes=secrets[1];
 p.commitments.masterLcProofRef=secrets[5];
 const task=p.tasks.find(x=>x.durationUnits>2);
 assert.ok(task);
 task.title=secrets[2];
 return {p,task};
}
function opts(task,more={}){
 return {reportId:'R12',language:'en',scenarioAsOfDate:'2026-10-15',
  scenarioPlannerConsent:true,scenarioCalendarReviewed:true,
  scenarioAuthorityRef:secrets[0],scenarioTaskA:task.taskId,
  scenarioDurationA:String(task.durationUnits-2),scenarioTaskB:task.taskId,
  scenarioDurationB:String(task.durationUnits-1),
  generatedAt:'2026-10-15T10:00:00Z',timezone:'Asia/Dhaka',...more};
}
const clean=value=>{const text=typeof value==='string'?value:JSON.stringify(value);
 for(const secret of secrets)assert.ok(!text.includes(secret),'private leaked: '+secret);
};
test('R12 deny-by-default gates do not expose order/task data or permit Excel',()=>{
 const {p,task}=plan(),before=JSON.stringify(p);
 for(const extras of [
  {scenarioAsOfDate:''},{scenarioAsOfDate:'2026-02-30'},
  {scenarioPlannerConsent:false},{scenarioCalendarReviewed:false},
  {scenarioAuthorityRef:' '},{scenarioTaskA:''},{scenarioTaskB:'missing'},
  {scenarioDurationA:''},{scenarioDurationB:'-1'},
  {scenarioDurationB:'0.5'},{scenarioDurationA:'99999'}
 ]){
  const m=reports.buildReportModel(p,opts(task,extras)),r=m.scenarioComparison;
  assert.equal(r.ready,false,JSON.stringify(extras));
  assert.deepEqual(r.alternatives,[]);
  assert.equal(m.tasks.length,0);
  for(const key of ['buyer','factory','po','style','quantity'])
   assert.equal(m.order[key],'Needs Information',key);
  assert.equal(m.source.recordId,null);
  assert.throws(()=>storage.exportReportWorkbook(m),/Review|scenario|options|date/i);
  clean(m);
 }
 assert.equal(reports.buildReportModel({...p,mode:'practice'},opts(task)).scenarioComparison.ready,false);
 assert.equal(JSON.stringify(p),before);
});
test('R12 immutable knit and woven same-base A/B using real scenario engine, no fabrication',()=>{
 for(const profile of ['knit','woven']){
  const {p,task}=plan(profile),before=JSON.stringify(p);
  const expectedA=scenarios.previewScenario(p,{name:'Recovery A',durationAdjustments:[
   {taskId:task.taskId,durationUnits:task.durationUnits-2,reason:'R12 candidate review'}]},
   {actorId:'r12-readonly',createdAt:'2026-10-15T10:00:00Z'});
  const expectedB=scenarios.previewScenario(p,{name:'Recovery B',durationAdjustments:[
   {taskId:task.taskId,durationUnits:task.durationUnits-1,reason:'R12 candidate review'}]},
   {actorId:'r12-readonly',createdAt:'2026-10-15T10:00:00Z'});
  const m=reports.buildReportModel(p,opts(task)),r=m.scenarioComparison;
  assert.equal(r.ready,true);
  assert.equal(r.alternatives.length,2);
  const [a,b]=r.alternatives;
  assert.equal(a.baseRevision,p.revision);assert.equal(b.baseRevision,p.revision);
  assert.equal(a.optionDuration,task.durationUnits-2);
  assert.equal(b.optionDuration,task.durationUnits-1);
  assert.equal(a.forecast,expectedA.branch.scenarioForecastDate);
  assert.equal(b.forecast,expectedB.branch.scenarioForecastDate);
  assert.equal(a.gained,expectedA.branch.workingDaysGained);
  assert.equal(b.gained,expectedB.branch.workingDaysGained);
  assert.equal(r.base.forecast,expectedA.branch.baseForecastDate);
  assert.equal(r.base.required,'2027-02-15');
  assert.ok(r.warnings.includes(r.labels.noProof));
  assert.ok(r.warnings.includes(r.labels.noMutation));
  assert.ok(r.warnings.includes(r.labels.calendarUnconfigured));
  assert.equal(r.history.length,0);
  assert.equal(m.source.recordId,null);
  assert.equal(JSON.stringify(p),before);
  clean(m);
 }
});
test('R12 genuine locally applied history must match event and remain separate from comparison',()=>{
 const {p,task}=plan();
 const source=scenarios.previewScenario(p,{name:'PRIVATE-SCENARIO-REASON',
  durationAdjustments:[{taskId:task.taskId,durationUnits:task.durationUnits-1,
   reason:'PRIVATE-SCENARIO-REASON'}]}, {actorId:secrets[3],createdAt:'2026-10-13T09:00:00Z'});
 assert.ok(source.ok);
 const out=scenarios.applyScenario(p,source.branch,{actorId:secrets[3],
  reason:secrets[4],confirm:true,createdAt:'2026-10-14T09:00:00Z'});
 assert.equal(out.ok,true);
 const after=out.plan,original=JSON.stringify(after);
 const r=reports.buildReportModel(after,opts(task)).scenarioComparison;
 assert.equal(r.ready,true);assert.equal(r.history.length,1);
 assert.equal(r.history[0].baseRevision,p.revision);
 assert.equal(r.history[0].appliedRevision,after.revision);
 assert.equal(r.history[0].appliedOn,'2026-10-14');
 assert.ok(r.warnings.includes(r.labels.noHistory));
 const removed=JSON.parse(JSON.stringify(after));removed.revisionEvents=[];
 const missing=reports.buildReportModel(removed,opts(task)).scenarioComparison;
 assert.equal(missing.history.length,0);
 assert.ok(missing.warnings.includes(missing.labels.historyMismatch));
 const future=reports.buildReportModel(after,opts(task,{scenarioAsOfDate:'2026-10-13'})).scenarioComparison;
 assert.equal(future.history.length,0);
 assert.equal(JSON.stringify(after),original);
 clean(r);clean(missing);
});
test('R12 typed XLSX contains base, options, changed refs, applied history, no private fields',()=>{
 const {p,task}=plan(),before=JSON.stringify(p);
 const m=reports.buildReportModel(p,opts(task));
 const bytes=storage.exportReportWorkbook(m);
 assert.deepEqual([...bytes.subarray(0,2)],[80,75]);
 const book=XLSX.read(bytes,{type:'buffer'});
 assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
  'Scenario Overview','Scenario Inputs','Critical Path Changes',
  'Applied Scenario History','Report Notes']);
 const rows=XLSX.utils.sheet_to_json(book.Sheets['Scenario Inputs'],{header:1,raw:true});
 assert.equal(rows[1][2],task.durationUnits);
 assert.equal(rows[1][3],task.durationUnits-2);
 assert.equal(rows[2][3],task.durationUnits-1);
 assert.equal(typeof rows[1][2],'number');
 const forecasts=XLSX.utils.sheet_to_json(book.Sheets['Scenario Overview'],{header:1,raw:true});
 assert.equal(typeof forecasts.find(x=>x[0]===m.scenarioComparison.labels.revision)[1],'number');
 const dateRow=forecasts.find(x=>x[0]===m.scenarioComparison.labels.forecast);
 assert.equal(typeof dateRow[1], 'number');
 clean(Object.values(book.Sheets).flatMap(s=>Object.entries(s)
  .filter(([key])=>!key.startsWith('!')).map(([,v])=>v.v)));
 assert.equal(JSON.stringify(p),before);
});
test('R12 EN/BN/HI/TA labels and other report isolation preserve old copy contract',()=>{
 const {p,task}=plan(),before=JSON.stringify(p),titles=new Set();
 for(const language of ['en','bn','hi','ta']){
  const m=reports.buildReportModel(p,opts(task,{language}));
  assert.equal(m.scenarioComparison.ready,true);
  titles.add(m.scenarioComparison.labels.title);
  assert.ok(m.scenarioComparison.labels.select.length>10);
  clean(m);
 }
 assert.equal(titles.size,4);
 for(const id of ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11'])
  assert.equal(reports.buildReportModel(p,{reportId:id}).scenarioComparison,undefined);
 const previous=domain.createPlan({templateId:'woven',buyerName:'Old buyer',
  factoryName:'Old factory',styleNo:'S-OLD',poNumber:'PO-OLD',totalQty:50});
 assert.deepEqual(storage.importCopy(storage.exportCopy(previous)),previous);
 assert.equal(JSON.stringify(p),before);
});
