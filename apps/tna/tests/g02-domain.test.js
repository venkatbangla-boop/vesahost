const domain = require('../src/domain.js');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requiredProfiles = ['knit','hoodie','woven','denim','sweater','dress','outerwear','activewear','kidswear','intimates','uniform','custom'];
for (const id of requiredProfiles) {
  assert(domain.TEMPLATE_PROFILES[id], `Missing template profile: ${id}`);
}

const requiredRefs = [
  'O01','O12','D01','D20','FA01','FA10','FP01','FP17','TR01','TR14',
  'PP01','PP10','C01','C10','P01','P10','Q01','Q08','PK01','PK05','S01','S10'
];
for (const ref of requiredRefs) {
  assert(domain.ACTIVITY_LIBRARY.some(activity => activity.templateRef === ref), `Missing activity library reference: ${ref}`);
}
assert(domain.ACTIVITY_LIBRARY.length >= 100, 'Activity library should cover the full 02 lifecycle.');

const baseInput = {
  templateId: 'knit',
  buyerName: 'Buyer A',
  factoryName: 'Factory A',
  styleNo: 'ST-001',
  poNumber: 'PO-001',
  totalQty: 1000,
  buyerRequiredExFactory: '2026-11-30',
  fabricRoute: 'local-manufactured',
  processFlags: ['print']
};
const knit = domain.createPlan(baseInput, { ownerUserId: 'admin@vesa' });
assert(knit.schemaVersion === domain.SCHEMA_VERSION, 'Plan schema version mismatch.');
assert(knit.validation.ok, `Knit plan should validate: ${knit.validation.errors.join(', ')}`);
assert(knit.unknownFields.length === 0, 'Complete quick input should not have required unknowns.');
assert(knit.tasks.some(task => task.templateRef === 'D17'), 'Print process should include strike-off submission.');
assert(knit.tasks.some(task => task.templateRef === 'C08'), 'Print process should include panel processing issue.');
assert(knit.tasks.every(task => domain.DATE_KEYS.every(key => Object.prototype.hasOwnProperty.call(task.dates, key))), 'Tasks must keep separate baseline/current/forecast/actual date fields.');
assert(knit.edges.length === knit.tasks.length - 1, 'G02 dependency shape should chain generated tasks without scheduling dates.');

const incomplete = domain.createPlan({ templateId: 'woven', buyerName: 'Buyer B' });
assert(incomplete.unknownFields.includes('Factory'), 'Missing factory should be reported as Needs Information.');
assert(incomplete.unknownFields.includes('Style'), 'Missing style should be reported as Needs Information.');
assert(incomplete.validation.warnings.length >= 1, 'Incomplete draft should warn without inventing inputs.');

const invalidQty = domain.createPlan({ ...baseInput, totalQty: -5 });
assert(!invalidQty.validation.ok, 'Negative quantity must fail validation.');

const denim = domain.createPlan({ ...baseInput, templateId: 'denim', processFlags: ['wash'], fabricRoute: 'local-manufactured' });
assert(denim.tasks.some(task => task.templateRef === 'D19'), 'Denim/wash should include wash standard submission.');
assert(denim.tasks.some(task => task.templateRef === 'P04'), 'Denim/wash should include garment wash start.');

const sweater = domain.createPlan({ ...baseInput, templateId: 'sweater' });
assert(!sweater.tasks.some(task => task.stageCode === 'C'), 'Sweater template must not force standard cutting by default.');
assert(sweater.tasks.some(task => task.templateRef === 'FP05'), 'Sweater template should include yarn availability.');

const baseline = domain.freezeBaseline(knit, { actorId: 'admin@vesa', reason: 'Initial approval' });
assert(baseline.ok, `Complete draft should baseline: ${(baseline.errors || []).join(', ')}`);
assert(baseline.plan.baselineSnapshots.length === 1, 'Baseline confirmation should append exactly one immutable snapshot.');
const changedTask = baseline.plan.tasks[0];
changedTask.dates.currentTargetFinish = '2026-11-01';
assert(baseline.plan.baselineSnapshots[0].taskDates[0].dates.currentTargetFinish === null, 'Changing current target must not mutate baseline snapshot.');

const needsEvidence = domain.updateTaskStatus(knit, knit.tasks.find(task => task.taskKind === 'gate').taskId, 'approved', {});
assert(!needsEvidence.ok, 'Approved gate must require evidenceRef.');
const completed = domain.updateTaskStatus(knit, knit.tasks[0].taskId, 'completed', { actualDate: '2026-10-10', actorId: 'admin@vesa' });
assert(completed.ok, 'Completed milestone with actual date should be accepted.');
assert(completed.plan.tasks[0].dates.actualFinish === '2026-10-10', 'Completion must update actualFinish only.');

const custom = domain.addCustomTask(knit, { title: 'Buyer-mandated hangtag approval', stageCode: 'TR', ownerParty: 'buyer', durationUnits: 0 }, { actorId: 'admin@vesa' });
assert(custom.ok, `Custom task should validate: ${(custom.errors || []).join(', ')}`);
const added = custom.plan.tasks[custom.plan.tasks.length - 1];
assert(added.templateRef.startsWith('CUSTOM'), 'Custom task should keep an auditable custom template reference.');
assert(added.stageCode === 'TR', 'Custom task should preserve selected stage.');
assert(custom.plan.revisionEvents.some(event => event.eventType === 'custom-task-added'), 'Custom task should append revision history.');

console.log('TNA G02 domain checks passed');
