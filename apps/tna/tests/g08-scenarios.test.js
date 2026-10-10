const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..', '..', '..');
globalThis.VesaTnaScheduling = require('../src/scheduling.js');
globalThis.VesaTnaOperations = require('../src/operations.js');
const domain = require('../src/domain.js');
const scenarios = require('../src/scenarios.js');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const plan = domain.createPlan({
  templateId: 'knit', buyerName: 'Buyer Scenario', factoryName: 'Factory Scenario', styleNo: 'STYLE-SCN', poNumber: 'PO-SCN', totalQty: 1000,
  orderConfirmedOn: '2026-10-12', buyerRequiredExFactory: '2026-12-15'
}, { ownerUserId: 'admin@vesa' });
const task = plan.tasks.find(item => Number(item.durationUnits) > 2);
assert(task, 'G08 fixture requires a duration task.');
const before = JSON.stringify(plan);
const preview = scenarios.previewScenario(plan, {
  name: 'Add verified sewing support',
  durationAdjustments: [{ taskId: task.taskId, durationUnits: task.durationUnits - 2, reason: 'Add verified extra line' }],
  capacity: { plannedQty: 1000, completedQty: 200, verifiedDailyOutput: 400 }
}, { actorId: 'admin@vesa', createdAt: '2026-10-10T07:35:00.000Z' });
assert(preview.ok, 'G08 SCN-01 preview should succeed.');
assert(JSON.stringify(plan) === before, 'G08 SCN-01 preview must not mutate the live plan.');
assert(preview.branch.baseRevision === plan.revision, 'G08 scenario should record base revision.');
assert(preview.branch.capacity.status === 'calculated', 'G08 scenario should calculate only from verified capacity input.');
assert(preview.previewPlan.tasks.find(item => item.taskId === task.taskId).durationUnits === task.durationUnits - 2, 'G08 preview plan should show changed duration.');
assert(plan.tasks.find(item => item.taskId === task.taskId).durationUnits === task.durationUnits, 'G08 live task duration must remain unchanged after preview.');

const blockedApply = scenarios.applyScenario(plan, preview.branch, { actorId: 'admin@vesa', reason: 'Missing confirmation' });
assert(!blockedApply.ok && blockedApply.error.includes('explicit confirmation'), 'G08 SCN-02 apply should require explicit confirmation.');
const applied = scenarios.applyScenario(plan, preview.branch, { actorId: 'admin@vesa', reason: 'Buyer approved recovery route', confirm: true, createdAt: '2026-10-10T07:40:00.000Z' });
assert(applied.ok, 'G08 SCN-02 confirmed apply should succeed.');
assert(applied.plan.revision === plan.revision + 1, 'G08 applying a scenario should create a new revision.');
assert(applied.plan.baselineSnapshots.length === plan.baselineSnapshots.length, 'G08 applying a scenario must not rewrite baseline snapshots.');
assert(applied.plan.scenarioBranches[0].status === 'applied', 'G08 applied scenario should be retained with applied status.');
assert(applied.plan.revisionEvents.some(event => event.eventType === 'scenario-applied'), 'G08 scenario apply should create revision evidence.');

const planA = { ...plan, recordId: 'A', order: { ...plan.order, styles: [{ styleNo: 'STYLE-A' }], poNumbers: ['PO-A'] }, operations: [{ operationId: 'sew-a', datedCapacityEntries: [{ resourceId: 'line-1', date: '2026-10-20', allocatedLines: 2, availableLines: 3 }] }] };
const planB = { ...plan, recordId: 'B', order: { ...plan.order, styles: [{ styleNo: 'STYLE-B' }], poNumbers: ['PO-B'] }, operations: [{ operationId: 'sew-b', datedCapacityEntries: [{ resourceId: 'line-1', date: '2026-10-20', allocatedLines: 2, availableLines: 3 }] }] };
const conflicts = scenarios.detectPortfolioCapacityConflicts([planA, planB]);
assert(!conflicts.ok && conflicts.conflicts[0].overAllocatedBy === 1, 'G08 portfolio should expose shared line over-allocation without double-booking.');
assert(conflicts.conflicts[0].orders.length === 2, 'G08 capacity conflict should preserve both order references.');

const index = read('apps/tna/index.html');
const worker = read('service-worker.js');
assert(index.includes('./src/scenarios.js?v=0.8.0'), 'G08 scenarios script should be loaded by TNA route.');
assert(worker.includes('./apps/tna/src/scenarios.js'), 'G08 scenarios script should be cached for local use.');
console.log('TNA G08 scenario checks passed');
