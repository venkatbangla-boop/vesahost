/**
 * GMR-02 immutable source-backed garment activity/order revision tests.
 * Run with Node test; all values are synthetic, no user data or browser mocks
 * beyond a disposable localStorage Map. Engine and storage contracts are real.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const local=new Map();
globalThis.localStorage={
  getItem:key=>local.has(key)?local.get(key):null,
  setItem:(key,value)=>local.set(key,String(value)),
  removeItem:key=>local.delete(key)
};
const input={templateId:'knit',buyerName:'SYNTHETIC BUYER',factoryName:'SYNTHETIC FACTORY',
  styleNo:'GMR02-STYLE',poNumber:'GMR02-PO',totalQty:1500,buyerRequiredExFactory:'2026-12-31'};
const make=()=>domain.createPlan(input,{ownerUserId:'synthetic-user'});
const task=plan=>plan.tasks[0];

test('schema 1.1.0 and untouched legacy records remain valid',()=>{
  const plan=make(),older=structuredClone(plan);
  delete older.order.fabricWeightGsm;
  delete older.commitments.masterLcStatus;
  delete older.commitments.masterLcProofRef;
  for(const row of older.tasks)delete row.waitingFor;
  assert.equal(domain.SCHEMA_VERSION,'TNA360-ORDERPLAN-1.1.0');
  assert.equal(domain.validatePlan(older).ok,true);
  storage.savePlan(older,'legacy-user');
  const back=storage.loadPlan(older.recordId,'legacy-user');
  assert.deepEqual(back,older,'load must not inject new values into original records');
  assert.deepEqual(storage.importCopy(storage.exportCopy(older)),older,'old-copy round trip exact');
});
test('new order captures explicit GSM and separately evidenced Master LC',()=>{
  const source=make(),before=JSON.stringify(source);
  const result=domain.reviseMerchandisingOrder(source,{fabricWeightGsm:'210',masterLcStatus:'opened',
    masterLcOpenedOn:'2026-11-02',masterLcProofRef:'MASTER-LC-DOC-02',
    sourceRef:'Factory LC register',reason:'Opened against checked banking advice'},{actorId:'qa-merch',expectedRevision:0});
  assert.equal(result.ok,true,result.error);
  assert.equal(result.plan.order.fabricWeightGsm,210);
  assert.equal(result.plan.commitments.masterLcStatus,'opened');
  assert.equal(result.plan.commitments.masterLcOpenedOn,'2026-11-02');
  assert.equal(result.plan.commitments.masterLcProofRef,'MASTER-LC-DOC-02');
  assert.equal(result.plan.revision,1);
  assert.equal(result.plan.revisionEvents.at(-1).details.sourceVerification,'user-entered-unverified');
  assert.equal(JSON.stringify(source),before,'source plan must remain immutable');
  assert.deepEqual(storage.importCopy(storage.exportCopy(result.plan)),result.plan);
  assert.equal(domain.reviseMerchandisingOrder(result.plan,{fabricWeightGsm:210},{expectedRevision:0}).ok,false,'stale edit refused');
});
test('GSM/LC fail-closed for negative, invalid date, unsupported or unevidenced opened',()=>{
  const p=make(),reason='reviewed',sourceRef='LC register';
  const change={reason,sourceRef};
  for(const candidate of [
    {fabricWeightGsm:-3},
    {fabricWeightGsm:'not-a-number'},
    {masterLcStatus:'buyer-approved'},
    {masterLcStatus:'opened',masterLcOpenedOn:'2026-10-31'},
    {masterLcStatus:'opened',masterLcOpenedOn:'2026-02-31',masterLcProofRef:'LC-1'},
    {masterLcStatus:'not-applicable',masterLcOpenedOn:'2026-11-01'}
  ]){
    const res=domain.reviseMerchandisingOrder(p,{...change,...candidate});
    assert.equal(res.ok,false,JSON.stringify(candidate));
  }
  assert.equal(domain.reviseMerchandisingOrder(p,{fabricWeightGsm:195,reason:'x'}).ok,false,'no source means no edit');
  assert.equal(p.order.fabricWeightGsm,null);
  assert.equal(p.revision,0);
});
test('confirmed LC contractual anchor is not overwritten by an order-detail edit',()=>{
  let p=make();
  p=domain.reviseMerchandisingOrder(p,{masterLcStatus:'opened',masterLcOpenedOn:'2026-11-01',
    masterLcProofRef:'LC-DOC-1',reason:'opened',sourceRef:'bank advice'}).plan;
  const baseline=domain.freezeBaseline(p,{actorId:'user',reason:'confirmed'});
  assert.equal(baseline.ok,true);
  const before=structuredClone(baseline.plan.baselineSnapshots);
  const res=domain.reviseMerchandisingOrder(baseline.plan,{masterLcOpenedOn:'2026-11-03',
    reason:'bank correction',sourceRef:'bank amendment'});
  assert.equal(res.ok,false);
  assert.deepEqual(baseline.plan.baselineSnapshots,before);
});
test('owner/waiting party revision records exact changes and powers distinct follow-ups',()=>{
  const p=make(),id=task(p).taskId;
  const res=domain.reviseMerchandisingTask(p,id,{
    ownerParty:'merchandising',waitingFor:'local-office',nextStatus:'awaiting-approval',
    reason:'Local office holding fit approval'}, {actorId:'qa-merch',expectedRevision:0});
  assert.equal(res.ok,true,res.error);
  assert.equal(res.plan.tasks[0].ownerParty,'merchandising');
  assert.equal(res.plan.tasks[0].waitingFor,'local-office');
  assert.equal(res.plan.tasks[0].status,'awaiting-approval');
  assert.equal(res.plan.revision,1);
  assert.equal(res.plan.revisionEvents.at(-1).eventType,'merchandising-task-revised');
  assert.equal(p.tasks[0].ownerParty,'merchant','source untouched');
  assert.equal(domain.reviseMerchandisingTask(res.plan,id,{waitingFor:'buyer',reason:'x'},{expectedRevision:0}).ok,false,'stale form rejected');
});
test('planned draft change allowed with audit; locked signed baseline cannot be changed',()=>{
  const p=make(),id=task(p).taskId;
  const draft=domain.reviseMerchandisingTask(p,id,{plannedDate:'2026-11-01',reason:'Draft plan from factory'});
  assert.equal(draft.ok,true,draft.error);
  assert.equal(draft.plan.tasks[0].dates.baselineFinish,'2026-11-01');
  const frozen=domain.freezeBaseline(draft.plan,{actorId:'qa'});
  assert.equal(frozen.ok,true);
  const hold=structuredClone(frozen.plan.baselineSnapshots);
  const invalid=domain.reviseMerchandisingTask(frozen.plan,id,{plannedDate:'2026-11-04',reason:'Attempted overwrite'});
  assert.equal(invalid.ok,false);
  assert.deepEqual(frozen.plan.baselineSnapshots,hold);
  assert.equal(frozen.plan.tasks[0].dates.baselineFinish,'2026-11-01');
});
test('revised target requires source AND named authority; original baseline remains frozen',()=>{
  const p=make(),id=task(p).taskId;
  const a=domain.reviseMerchandisingTask(p,id,{plannedDate:'2026-11-01',reason:'Original plan'});
  const frozen=domain.freezeBaseline(a.plan,{actorId:'qa'});
  const missing=domain.reviseMerchandisingTask(frozen.plan,id,{revisedDate:'2026-11-06',reason:'Factory update'});
  assert.equal(missing.ok,false);
  const revised=domain.reviseMerchandisingTask(frozen.plan,id,{
    revisedDate:'2026-11-06',reason:'New documented ex-factory preparation target',
    sourceRef:'signed change request 6',authorityParty:'buyer'});
  assert.equal(revised.ok,true,revised.error);
  assert.equal(revised.plan.tasks[0].dates.currentTargetFinish,'2026-11-06');
  assert.equal(revised.plan.tasks[0].dates.baselineFinish,'2026-11-01');
  assert.deepEqual(revised.plan.baselineSnapshots,frozen.plan.baselineSnapshots);
  assert.equal(revised.plan.revisionEvents.at(-1).details.authorityParty,'buyer');
});
test('actual finish and completion need evidence and cannot silently be overwritten',()=>{
  const p=make(),id=task(p).taskId;
  assert.equal(domain.reviseMerchandisingTask(p,id,{nextStatus:'completed',actualDate:'2026-11-10',reason:'Completed'}).ok,false);
  assert.equal(domain.reviseMerchandisingTask(p,id,{actualDate:'2026-11-10',reason:'x',evidenceRef:'QC'}) .ok,false);
  const good=domain.reviseMerchandisingTask(p,id,{nextStatus:'completed',actualDate:'2026-11-10',
    evidenceRef:'QC-LOG-1',reason:'Checked actual completion'});
  assert.equal(good.ok,true,good.error);
  assert.deepEqual(good.plan.tasks[0].proofRefs,['QC-LOG-1']);
  assert.equal(domain.reviseMerchandisingTask(good.plan,id,{actualDate:'2026-11-11',
    evidenceRef:'CORRECTION',reason:'Correction'}).ok,false);
  assert.equal(good.plan.tasks[0].dates.actualFinish,'2026-11-10');
});
test('approval cannot be implied by deadline or the task owner',()=>{
  const p=make(),id=task(p).taskId;
  assert.equal(domain.reviseMerchandisingTask(p,id,{nextStatus:'approved',reason:'Date passed'}).ok,false);
  assert.equal(domain.reviseMerchandisingTask(p,id,{nextStatus:'approved',evidenceRef:'x',reason:'buyer says yes'}).ok,false);
  const approved=domain.reviseMerchandisingTask(p,id,{nextStatus:'approved',evidenceRef:'BUYER-MAIL-7',
    authorityParty:'buyer',reason:'Document reference entered'});
  assert.equal(approved.ok,true,approved.error);
  assert.equal(approved.plan.tasks[0].status,'approved');
  assert.equal(approved.plan.revisionEvents.at(-1).details.sourceVerification,'user-entered-unverified');
});
test('invalid civil dates, waiting parties, unauthorized waivers and empty owner fail',()=>{
  const p=make(),id=task(p).taskId;
  for(const data of [
    {plannedDate:'2026-02-30',reason:'x'},
    {revisedDate:'2026-10-10',reason:'x'},
    {waitingFor:'Mexico-approved',reason:'x'},
    {ownerParty:'',reason:'x'},
    {nextStatus:'waived',reason:'x'},
    {nextStatus:'not-applicable',reason:'x'}
  ])assert.equal(domain.reviseMerchandisingTask(p,id,data).ok,false,JSON.stringify(data));
});
test('new data survive save/reload/copy while corrupt saved copy cannot replace good record',()=>{
  let p=make();
  p=domain.reviseMerchandisingOrder(p,{fabricWeightGsm:'200',masterLcStatus:'pending',
    reason:'Fabric sheet confirmed',sourceRef:'FABRIC-SPEC-1'}).plan;
  p=domain.reviseMerchandisingTask(p,task(p).taskId,{ownerParty:'factory',waitingFor:'buyer',
    reason:'Waiting for reviewed submission'}).plan;
  storage.savePlan(p,'gmr-user');
  const recovered=storage.loadPlan(p.recordId,'gmr-user');
  assert.deepEqual(recovered,p);
  const copy=storage.exportCopy(recovered);
  assert.deepEqual(storage.importCopy(copy),p);
  const broken=JSON.parse(copy);broken.record.order.fabricWeightGsm=400;
  assert.throws(()=>storage.importCopy(JSON.stringify(broken)),/checksum/i);
  assert.equal(storage.loadPlan(p.recordId,'gmr-user').order.fabricWeightGsm,200);
});
