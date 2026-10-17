/* TNA G14: domain-owned, append-only, human-source task planning-date revisions.
 * Non-mutating failure paths; baseline and buyer approval never inferred.
 */
'use strict';
const assert=require('node:assert/strict'),Domain=require('../src/domain.js');
const input={templateId:'knit',buyerName:'SYN MERCH BUYER',factoryName:'SYN FACTORY',
 styleNo:'SYN TNA G14',poNumber:'SYN PO G14',totalQty:1000,
 orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2027-02-10'};
let source=Domain.createPlan(input,{ownerUserId:'synthetic-user'});
const id=source.tasks[0].taskId,second=source.tasks[1].taskId;
const context={sourceRef:'SYN LOCAL OFFICE DATED TNA NOTE',sourceDate:'2026-10-17',
 reason:'SYN confirmed internal planning sequence',actorId:'synthetic-user'};
const original=JSON.stringify(source);
for(const [name,changes,ctx] of [
 ['no source',{currentTargetFinish:'2026-10-20'},{...context,sourceRef:''}],
 ['no reviewer',{currentTargetFinish:'2026-10-20'},{...context,actorId:''}],
 ['no reason',{currentTargetFinish:'2026-10-20'},{...context,reason:''}],
 ['false date',{forecastFinish:'2026-02-29'},context],
 ['unsupported actual',{actualFinish:'2026-10-16'},context],
 ['unsupported status',{status:'approved'},context],
 ['empty date',{baselineFinish:''},context],
 ['same dates',{},context]
]){
 const response=Domain.reviseTaskPlanningDates(source,id,changes,ctx);
 assert.equal(response.ok,false,name+' must reject');
 assert.equal(JSON.stringify(source),original,name+' must not mutate existing source');
}
assert.equal(Domain.reviseTaskPlanningDates(source,'MISSING',{baselineFinish:'2026-10-14'},context).ok,false);
assert.equal(Domain.reviseTaskPlanningDates({...source,mode:'practice'},id,{baselineFinish:'2026-10-14'},context).ok,false);
const updated=Domain.reviseTaskPlanningDates(source,id,{
 baselineFinish:'2026-10-14',currentTargetFinish:'2026-10-16',forecastFinish:'2026-10-20'
},context);
assert.equal(updated.ok,true,updated.error);
assert.equal(JSON.stringify(source),original,'Original source remains immutable');
assert.deepEqual(updated.changes.map(c=>c.field),['baselineFinish','currentTargetFinish','forecastFinish']);
assert.equal(updated.plan.tasks[0].dates.actualFinish,null,'Actual not invented');
assert.equal(updated.plan.tasks[0].status,'not-started','No auto buyer gate approval');
assert.equal(updated.plan.tasks[0].dates.currentTargetFinish,'2026-10-16');
assert.equal(updated.plan.tasks[0].dates.forecastFinish,'2026-10-20');
assert.equal(updated.plan.tasks[1].taskId,second,'Unrelated task untouched');
assert.equal(updated.plan.revision,1);
assert.equal(updated.plan.revisionEvents.at(-1).eventType,'sourced-task-finish-dates-revised');
assert.deepEqual(updated.plan.revisionEvents.at(-1).details.changes.map(c=>c.before),[null,null,null]);
assert(updated.plan.tasks[0].proofRefs.includes(context.sourceRef));
assert.equal(Domain.validatePlan(updated.plan).ok,true);
const prior=JSON.stringify(updated.plan);
const freeze=Domain.freezeBaseline(updated.plan,{actorId:'synthetic-user',reason:'SYN local initial baseline'});
assert.equal(freeze.ok,true);
assert.equal(freeze.plan.baselineSnapshots[0].taskDates[0].dates.baselineFinish,'2026-10-14');
assert.equal(JSON.stringify(updated.plan),prior,'Freeze itself must not change old revision');
const beforeLocked=JSON.stringify(freeze.plan);
const illegal=Domain.reviseTaskPlanningDates(freeze.plan,id,{baselineFinish:'2026-10-19'},context);
assert.equal(illegal.ok,false,'Post-freeze baseline is immutable');
assert.equal(JSON.stringify(freeze.plan),beforeLocked);
const forecast=Domain.reviseTaskPlanningDates(freeze.plan,id,{
 currentTargetFinish:'2026-10-21',forecastFinish:'2026-10-23'
},{...context,reason:'SYN updated verified factory sequence'});
assert.equal(forecast.ok,true,forecast.error);
assert.equal(forecast.plan.tasks[0].dates.baselineFinish,'2026-10-14');
assert.equal(forecast.plan.baselineSnapshots[0].taskDates[0].dates.currentTargetFinish,'2026-10-16');
assert.equal(forecast.plan.baselineSnapshots[0].taskDates[0].dates.forecastFinish,'2026-10-20');
assert.equal(forecast.plan.tasks[0].dates.currentTargetFinish,'2026-10-21');
assert.equal(forecast.plan.tasks[0].dates.forecastFinish,'2026-10-23');
assert.equal(forecast.plan.revisionEvents.length,freeze.plan.revisionEvents.length+1);
assert.equal(forecast.plan.revisionEvents.at(-1).details.changes[0].before,'2026-10-16');
assert.equal(forecast.plan.revisionEvents.at(-1).details.changes[0].after,'2026-10-21');
assert.equal(forecast.plan.tasks[0].status,'not-started');
assert.equal(forecast.plan.tasks[0].dates.actualFinish,null);
assert.equal(Domain.validatePlan(forecast.plan).ok,true);
const status=Domain.updateTaskStatus(forecast.plan,id,'completed',{
 actualDate:'2026-10-25',actorId:'synthetic-user',evidenceRef:'SYN ACTUAL FACTORY REPORT'});
assert.equal(status.ok,true);
assert.equal(status.plan.tasks[0].dates.actualFinish,'2026-10-25');
assert.equal(status.plan.tasks[0].dates.baselineFinish,'2026-10-14');
assert.equal(forecast.plan.tasks[0].dates.actualFinish,null);
console.log('TNA G14 SOURCED PLAN DATE PASS: before/after evidence, exact civil date validation, locked baseline, draft source, status/actual immutability and old schema.');
