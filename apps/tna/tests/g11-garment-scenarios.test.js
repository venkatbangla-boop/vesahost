const assert = require('assert').strict;
const domain = require('../src/domain.js');
const scheduling = require('../src/scheduling.js');
const operations = require('../src/operations.js');

const cases = [
  {
    id: 'KNIT', input: { templateId: 'knit', fabricRoute: 'local-manufactured', processFlags: ['print'], orderConfirmedOn: '2026-01-05' },
    holiday: '2026-01-26', taskCount: 106, requiredDate: '2026-06-09', anchors: { O01: ['2026-01-05', '2026-01-05'], FA06: ['2026-02-26', '2026-02-26'], S04: ['2026-06-02', '2026-06-02'] }, requiredRefs: ['D17', 'C08']
  },
  {
    id: 'WOVEN-IMPORTED', input: { templateId: 'woven', fabricRoute: 'imported-finished', orderConfirmedOn: '2026-02-02' },
    holiday: '2026-02-16', taskCount: 99, requiredDate: '2026-06-30', anchors: { O01: ['2026-02-02', '2026-02-02'], FP13: ['2026-04-07', '2026-04-09'], S04: ['2026-06-23', '2026-06-23'] }, requiredRefs: ['FP13']
  },
  {
    id: 'DENIM-WASH', input: { templateId: 'denim', fabricRoute: 'imported-greige', processFlags: ['wash'], orderConfirmedOn: '2026-03-02' },
    holiday: '2026-03-26', taskCount: 106, requiredDate: '2026-08-06', anchors: { O01: ['2026-03-02', '2026-03-02'], D19: ['2026-04-13', '2026-04-13'], FA06: ['2026-04-23', '2026-04-23'], P04: ['2026-07-02', '2026-07-02'], P05: ['2026-07-03', '2026-07-03'], S04: ['2026-07-30', '2026-07-30'] }, requiredRefs: ['D19', 'D20', 'FP13', 'P04', 'P05']
  }
];

const results = new Map();
for (const fixture of cases) {
  const plan = domain.createPlan({
    ...fixture.input, buyerName: 'Synthetic Scenario Buyer', factoryName: 'Synthetic Scenario Factory', styleNo: `STYLE-${fixture.id}`, poNumber: `PO-${fixture.id}`, totalQty: 1000,
    buyerRequiredExFactory: fixture.requiredDate, colorSizeBreakdown: 'Navy | S | 250\nNavy | M | 250\nIvory | S | 250\nIvory | M | 250'
  }, { ownerUserId: 'synthetic-scenario-user' });
  const calendar = { calendarId: 'default', workingWeek: [1, 2, 3, 4, 5], holidays: [fixture.holiday], shutdowns: [], revision: 1 };
  const before = JSON.stringify(plan);
  const result = scheduling.schedule(plan.tasks, plan.edges, { calendar, calendars: [calendar], startDate: fixture.input.orderConfirmedOn, requiredDate: fixture.requiredDate });
  assert.equal(result.validity, 'valid', `${fixture.id} full schedule must be valid.`);
  assert.equal(plan.tasks.length, fixture.taskCount, `${fixture.id} full template activity count must remain frozen for this fixture.`);
  assert.equal(result.project.forecastDate, fixture.requiredDate, `${fixture.id} manually computed final date must match.`);
  assert.equal(result.project.workingDaysEarlyOrLate, 0, `${fixture.id} must meet its explicit fixture endpoint exactly.`);
  assert.equal(result.project.criticalPaths[0].length, fixture.taskCount, `${fixture.id} sequential full plan must retain every activity in its controlling chain.`);
  assert(plan.tasks.every(task => /^\d{4}-\d{2}-\d{2}$/.test(result.taskResults[task.taskId].earlyStart) && /^\d{4}-\d{2}-\d{2}$/.test(result.taskResults[task.taskId].earlyFinish)), `${fixture.id} every applicable activity must receive an exact civil date.`);
  for (const reference of fixture.requiredRefs) assert(plan.tasks.some(task => task.templateRef === reference), `${fixture.id} must include required conditional activity ${reference}.`);
  for (const [reference, expected] of Object.entries(fixture.anchors)) {
    const task = plan.tasks.find(item => item.templateRef === reference);
    assert.deepEqual([result.taskResults[task.taskId].earlyStart, result.taskResults[task.taskId].earlyFinish], expected, `${fixture.id} ${reference} manually computed dates must match.`);
  }
  assert.equal(JSON.stringify(plan), before, `${fixture.id} calculation must not mutate the full order plan.`);
  results.set(fixture.id, { plan, result });
}

let shipmentPlan = results.get('DENIM-WASH').plan;
const firstLot = domain.addShipmentLot(shipmentPlan, { lotReference: 'DENIM-LOT-1', poNumber: 'PO-DENIM-WASH', plannedQty: 600, packedQty: 600, passedQty: 600, shippedQty: 600, actualExFactory: '2026-07-30', ETD: '2026-08-01', ETA: '2026-08-20', inspectionRef: 'SYNTHETIC-AQL-LOT-1' }, { actorId: 'synthetic-scenario-user', createdAt: '2026-07-30T06:00:00.000Z' });
assert(firstLot.ok, `Partial shipment lot 1 must validate: ${firstLot.error || ''}`);
const secondLot = domain.addShipmentLot(firstLot.plan, { lotReference: 'DENIM-LOT-2', poNumber: 'PO-DENIM-WASH', plannedQty: 400, packedQty: 300, passedQty: 300, shippedQty: 0, forecastExFactory: '2026-08-06', ETD: '2026-08-08', ETA: '2026-08-27', inspectionRef: 'SYNTHETIC-AQL-LOT-2' }, { actorId: 'synthetic-scenario-user', createdAt: '2026-07-30T06:05:00.000Z' });
assert(secondLot.ok, `Partial shipment lot 2 must validate: ${secondLot.error || ''}`);
const shipment = operations.reconcileShipmentLots(1000, secondLot.plan.shipmentLots, { inspectionPassed: true });
assert.equal(shipment.ok, true, 'Reviewed partial-shipment quantities must reconcile.');
assert.equal(shipment.plannedQty, 1000, 'Both lots must allocate the full 1,000-piece order.');
assert.equal(shipment.shippedQty, 600, 'Only the first 600-piece lot is shipped.');
assert.equal(shipment.remainingQty, 400, 'The exact unshipped order balance must remain 400 pieces.');
assert.equal(shipment.wholeOrderShipped, false, 'A partial shipment must not close the whole order.');
assert.deepEqual(shipment.poTotals, { 'PO-DENIM-WASH': 1000 }, 'Lot allocations must reconcile to the exact PO quantity.');
assert.deepEqual(secondLot.plan.shipmentLots.map(lot => [lot.lotReference, lot.actualExFactory, lot.forecastExFactory, lot.ETD, lot.ETA]), [
  ['DENIM-LOT-1', '2026-07-30', null, '2026-08-01', '2026-08-20'],
  ['DENIM-LOT-2', null, '2026-08-06', '2026-08-08', '2026-08-27']
], 'Partial lots must preserve actual, forecast, ETD and ETA as independent entered dates.');

console.log('TNA G11 representative garment scenarios passed: full knit, woven/imported, denim/wash schedules and 1,000-piece partial-shipment reconciliation');
