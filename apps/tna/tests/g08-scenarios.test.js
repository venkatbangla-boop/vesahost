const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..', '..', '..');
globalThis.VesaTnaScheduling = require('../src/scheduling.js');
globalThis.VesaTnaOperations = require('../src/operations.js');
const domain = require('../src/domain.js');
const operations = require('../src/operations.js');
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

const advancedPlan = JSON.parse(JSON.stringify(plan));
advancedPlan.operations = [{ operationId: 'sew-advanced', datedCapacityEntries: [{ resourceId: 'line-1', date: '2026-10-20', allocatedLines: 2, availableLines: 3 }] }];
const advancedBefore = JSON.stringify(advancedPlan);
const advancedPreview = scenarios.previewScenario(advancedPlan, {
  name: 'Alternate line and calendar',
  durationAdjustments: [{ taskId: task.taskId, durationUnits: Math.max(0, task.durationUnits - 1), reason: 'Verified alternate route' }],
  calendarChanges: [{ calendarId: 'default', holidays: ['2026-10-20'] }],
  routeChanges: [{ taskId: task.taskId, ownerParty: 'alternate-sewing-line', calendarId: 'default', reason: 'Approved route review' }],
  capacityChanges: [{ operationId: 'sew-advanced', resourceId: 'line-1', date: '2026-10-20', allocatedLines: 2, availableLines: 4 }]
}, { actorId: 'admin@vesa', createdAt: '2026-10-10T07:45:00.000Z' });
assert(advancedPreview.ok, 'G08 alternative calendar/route preview should succeed.');
assert(JSON.stringify(advancedPlan) === advancedBefore, 'G08 alternative preview must not mutate operations or calendar.');
assert(advancedPreview.previewPlan.calendars[0].holidays.includes('2026-10-20'), 'G08 scenario should carry an explicit holiday change.');
assert(advancedPreview.previewPlan.operations[0].datedCapacityEntries[0].availableLines === 4, 'G08 scenario should compare entered resource capacity.');
assert(advancedPreview.branch.forecastProvenance.inputRevision === advancedPlan.revision, 'G08 forecast provenance should identify the source revision.');

const filtered = scenarios.portfolioSummary([planA, planB], { buyer: 'Buyer Scenario' });
assert(filtered.accessibleOrderCount === 2 && filtered.conflictCount === 1, 'G08 portfolio summary should preserve filters and shared conflict count.');
assert(filtered.orders[0].forecastProvenance.inputRevision === plan.revision, 'G08 portfolio rows should expose forecast provenance.');
const filteredPo = scenarios.portfolioSummary([planA, planB], { po: 'PO-B' });
assert(filteredPo.accessibleOrderCount === 1 && filteredPo.orders[0].po === 'PO-B', 'G08 portfolio summary should narrow rows by PO filter.');

const split = operations.reconcileShipmentLots(1000, [
  { lotReference: 'LOT-1', plannedQty: 600, packedQty: 600, passedQty: 600, shippedQty: 600, poAllocation: [{ poNumber: 'PO-SCN', qty: 600 }] },
  { lotReference: 'LOT-2', plannedQty: 400, packedQty: 400, passedQty: 400, shippedQty: 0, poAllocation: [{ poNumber: 'PO-SCN', qty: 400 }] }
], { inspectionPassed: true });
assert(split.ok && split.remainingQty === 400 && !split.wholeOrderShipped, 'G08 split shipment should reconcile partial shipped quantity.');
assert(split.poTotals['PO-SCN'] === 1000, 'G08 split shipment should reconcile PO allocation totals.');
const badSplit = operations.reconcileShipmentLots(1000, [{ lotReference: 'LOT-BAD', plannedQty: 600, packedQty: 601, passedQty: 600, shippedQty: 0 }], { inspectionPassed: true });
assert(!badSplit.ok && badSplit.errors.some(error => error.includes('packed quantity exceeds')), 'G08 split shipment should reject inconsistent lot quantities.');

const capacityEntry = domain.addCapacityEntry(plan, {
  type: 'sew', operationId: 'sew-reviewed', resourceId: 'line-reviewed', date: '2026-10-21', allocatedLines: 4, availableLines: 3, lotId: 'LOT-1'
}, { actorId: 'admin@vesa', createdAt: '2026-10-10T07:50:00.000Z' });
assert(capacityEntry.ok && capacityEntry.plan.operations[0].datedCapacityEntries[0].allocatedLines === 4, 'G08 reviewed capacity entry should be recorded on a cloned operation.');
assert(capacityEntry.warnings.some(warning => warning.includes('exceeds the available lines')), 'G08 capacity uncertainty should remain visible as an explicit warning.');
assert(plan.operations.length === 0 && capacityEntry.plan.revision === plan.revision + 1, 'G08 capacity entry must not mutate the source plan and must create a revision.');
const duplicateCapacity = domain.addCapacityEntry(capacityEntry.plan, {
  type: 'sew', operationId: 'sew-reviewed', resourceId: 'line-reviewed', date: '2026-10-21', allocatedLines: 1, availableLines: 3
});
assert(!duplicateCapacity.ok && duplicateCapacity.error.includes('already exists'), 'G08 duplicate dated capacity entry should be rejected.');
const overlapCapacity = domain.addCapacityEntry(capacityEntry.plan, {
  type: 'pack', operationId: 'pack-reviewed', resourceId: 'line-reviewed', date: '2026-10-21', allocatedLines: 2, availableLines: 3
});
assert(overlapCapacity.ok && overlapCapacity.warnings.some(warning => warning.includes('Another operation')), 'G08 overlapping operation capacity should be retained with a review warning.');
const frozen = domain.freezeBaseline(domain.createPlan({
  templateId: 'woven', buyerName: 'Buyer Lot', factoryName: 'Factory Lot', styleNo: 'STYLE-LOT', poNumber: 'PO-LOT', totalQty: 1000,
  orderConfirmedOn: '2026-10-12', buyerRequiredExFactory: '2026-12-15'
}, { ownerUserId: 'admin@vesa' }), { actorId: 'admin@vesa', reason: 'Reviewed baseline' });
assert(frozen.ok, 'G08 shipment fixture baseline should be confirmable.');
const lotEntry = domain.addShipmentLot(frozen.plan, {
  lotReference: 'LOT-REVIEWED', poNumber: 'PO-LOT', plannedQty: 600, packedQty: 500, passedQty: 500, shippedQty: 400,
  requestedExFactory: '2026-12-01', ETD: '2026-12-03', ETA: '2026-12-08', inspectionRef: 'INS-REVIEW', status: 'partial'
}, { actorId: 'admin@vesa', createdAt: '2026-10-10T07:55:00.000Z' });
assert(lotEntry.ok && lotEntry.plan.shipmentLots[0].remainingQty === 200, 'G08 reviewed shipment lot should preserve lot quantities and remaining balance.');
assert(lotEntry.plan.baselineSnapshots.length === frozen.plan.baselineSnapshots.length && lotEntry.plan.revisionEvents.some(event => event.eventType === 'shipment-lot-recorded'), 'G08 shipment lot must preserve baseline and record revision evidence.');
const invalidLot = domain.addShipmentLot(lotEntry.plan, { lotReference: 'LOT-BAD-ENTRY', poNumber: 'PO-LOT', plannedQty: 500, packedQty: 500, passedQty: 500, shippedQty: 0 });
assert(!invalidLot.ok && invalidLot.error.includes('cannot exceed the ordered quantity'), 'G08 over-order shipment lots should be rejected.');
const badPoAllocation = domain.addShipmentLot(lotEntry.plan, { lotReference: 'LOT-BAD-PO', poNumber: 'PO-LOT', plannedQty: 100, packedQty: 0, passedQty: 0, shippedQty: 0, poAllocation: [{ poNumber: 'PO-LOT', qty: 99 }] });
assert(!badPoAllocation.ok && badPoAllocation.error.includes('PO allocation'), 'G08 inconsistent PO allocation should be rejected.');

const index = read('apps/tna/index.html');
const bootstrap = read('apps/tna/src/bootstrap.js');
const worker = read('service-worker.js');
assert(index.includes('./src/scenarios.js?v=0.8.0'), 'G08 scenarios script should be loaded by TNA route.');
assert(bootstrap.includes('Compare a recovery option') && bootstrap.includes('data-apply-scenario'), 'G08 scenario comparison/apply UI should be visible in the plan workspace.');
assert(bootstrap.includes('Portfolio & shared capacity') && bootstrap.includes('Split shipment reconciliation'), 'G08 advanced portfolio and split shipment views should be visible.');
assert(bootstrap.includes('Enter reviewed capacity') && bootstrap.includes('Add shipment lot') && bootstrap.includes('Shipment Lots'), 'G08 reviewed capacity and shipment-lot entry UI should be visible.');
assert(bootstrap.includes('data-portfolio-po') && bootstrap.includes('PO · '), 'G08 portfolio UI should expose PO management filters.');
assert(worker.includes('./apps/tna/src/scenarios.js'), 'G08 scenarios script should be cached for local use.');
console.log('TNA G08 scenario checks passed');
