globalThis.VesaTnaScheduling = require('../src/scheduling.js');
const ops = require('../src/operations.js');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const cal = { calendarId: 'bd', workingWeek: [1, 2, 3, 4, 5], holidays: [], shutdowns: [] };

const commercial = ops.compareCommercial({
  orderConfirmedOn: '2026-10-01',
  masterLcOpenedOn: '2026-10-10',
  leadTimeAnchor: 'LC-open',
  leadTimeBasis: 'calendar',
  contractualLeadDays: 60,
  buyerRequiredExFactory: '2026-12-05'
}, [
  { materialId: 'fabric-1', category: 'fabric', masterLcRef: 'MLC-001', b2bLcApplicationDate: '2026-10-12', b2bLcOpenDate: '2026-10-20' },
  { materialId: 'trim-1', category: 'trims', b2bLcOpenDate: '2026-10-25' }
], cal);
assert(commercial.lead.status === 'calculated', 'COM-01 should calculate only from selected LC-open anchor.');
assert(commercial.lead.sourceDate === '2026-10-10', 'COM-01 must not silently switch to PO/order date.');
assert(commercial.lead.contractualDate === '2026-12-09', 'COM-01 60 calendar days from LC open should be deterministic.');
assert(commercial.discrepancies.length === 1, 'COM-01 buyer vs contractual discrepancy should be visible.');
assert(commercial.b2bLcMilestones.length === 2 && commercial.masterLcOpenedOn === '2026-10-10', 'COM-02 B2B LC milestones must stay distinct from master LC.');
assert(ops.contractualLead({ leadTimeAnchor: 'LC-open', contractualLeadDays: 60 }, cal).status === 'needs-information', 'Missing LC date must fail closed.');

assert(ops.approvalState({ itemName: 'PP sample', submittedDate: '2026-10-01', responseStatus: 'submitted' }).status === 'pending', 'APR-01 submitted sample is not approved.');
assert(ops.approvalState({ responseStatus: 'approved', evidenceRef: 'ev-1', delegatedLocalOfficeAllowed: true }).status === 'approved', 'APR-02 delegated approval must require explicit authorization and evidence.');
assert(ops.approvalState({ responseStatus: 'approved' }).status === 'blocked', 'Approval without evidence must be blocked.');
assert(ops.approvalState({ responseStatus: 'waived', waiverReason: 'Buyer email', evidenceRef: 'ev-2' }).status === 'waived', 'APR-03 waiver must preserve written reason and evidence.');

assert(ops.materialReadiness({ materialId: 'fabric', inHouseDate: '2026-10-12' }).status === 'blocked', 'Material in-house alone must not release cutting.');
assert(ops.materialReadiness({ materialId: 'fabric', inHouseDate: '2026-10-12', QCDate: '2026-10-13', shortageQty: 0 }).status === 'ready', 'Fabric in-house + QC + no shortage should be ready.');

const cap = ops.verifiedRateDays({ plannedQty: 18000, completedQty: 3000, verifiedDailyOutput: 1500 });
assert(cap.status === 'calculated' && cap.workingDays === 10 && cap.remainingQty === 15000, 'CAP-01 should calculate 10 working days remaining.');
assert(ops.smvCapacity({ operators: 25, netMinutesPerOperatorPerDay: 480, efficiencyFraction: 0.70, standardMinutesPerUnit: 12 }).grossUnitsPerDay === 700, 'CAP-02 SMV fixture should calculate 700 pcs/day.');
assert(ops.verifiedRateDays({ plannedQty: 100, completedQty: 0, verifiedDailyOutput: 0 }).status === 'needs-information', 'CAP-03 zero rate must not produce a fake finish date.');
assert(!ops.validateOperationQuantity({ qtyInput: 100, qtyCompleted: 90, qtyRejected: 20, qtyWip: 0 }).ok, 'CAP-05 quantity conservation should reject over-counting.');
assert(ops.validateOperationQuantity({ qtyInput: 100, qtyCompleted: 80, qtyRejected: 5, qtyReworked: 5, qtyWip: 20 }).ok, 'CAP-05 documented rework can reconcile WIP without double counting.');
const shared = ops.checkSharedCapacity([
  { resourceId: 'line-1', date: '2026-10-12', allocatedLines: 2, availableLines: 3 },
  { resourceId: 'line-1', date: '2026-10-12', allocatedLines: 2, availableLines: 3 }
]);
assert(!shared.ok && shared.overAllocations[0].allocatedLines === 4, 'CAP-04 shared line over-allocation should be reported.');

const partial = ops.shipmentSummary(1000, [
  { lotId: 'L1', lotReference: 'Lot 1', plannedQty: 600, packedQty: 600, passedQty: 600, shippedQty: 600 },
  { lotId: 'L2', lotReference: 'Lot 2', plannedQty: 400, packedQty: 300, passedQty: 300, shippedQty: 0 }
], { status: 'passed' });
assert(partial.ok && !partial.wholeOrderShipped && partial.remainingQty === 400, 'SHP-01 partial shipment must not close the whole order.');
const blockedShipment = ops.shipmentSummary(1000, [{ lotId: 'L1', plannedQty: 1000, packedQty: 1000, passedQty: 1000, shippedQty: 1000 }], { status: 'pending' });
assert(!blockedShipment.ok && blockedShipment.errors.some(error => error.includes('final inspection')), 'SHP-02 final inspection not passed must block release.');
const lotTimeline = ops.lotTimeline({ lotId: 'L1', actualExFactory: '2026-11-20', ETD: '2026-11-22', ETA: '2026-12-05', bookingRef: 'BK-1', inspectionRef: 'AQL-1' });
assert(lotTimeline.actualExFactory !== lotTimeline.ETD && lotTimeline.ETD !== lotTimeline.ETA, 'SHP lot dates must keep ex-factory, ETD and ETA distinct.');

const forecast = ops.rollingForecast([], { forecastDate: '2026-12-02', sourceRevision: 3, reason: 'Verified output updated', calculatedAt: '2026-10-10T05:00:00Z' });
assert(forecast.ok && forecast.history.length === 1 && forecast.history[0].sourceRevision === 3, 'Rolling forecast should append provenance without mutating old history.');
const risk = ops.riskReasons({
  approval: ops.approvalState({ itemName: 'PP sample', submittedDate: '2026-10-01', responseStatus: 'submitted' }),
  material: ops.materialReadiness({ inHouseDate: '2026-10-12' }),
  capacity: ops.verifiedRateDays({ plannedQty: 100, completedQty: 0, verifiedDailyOutput: 0 }),
  schedule: { workingDaysEarlyOrLate: 3 }
});
assert(risk.some(item => item.type === 'approval') && risk.some(item => item.type === 'forecast-late'), 'Risk reasons should show both blocked gates and forecast-late reasons.');

console.log('TNA G04 operational engine checks passed');
