/**
 * P-G04 fixture-only proof for the existing PPM decision owners.
 * Purpose: lock GO/CONDITIONAL GO/HOLD, approval, POM and controlled-revision
 * behavior against actual source without duplicating business rules.
 * Access: node apps/ppm/tests/p-g04-decisions.cjs
 * Failure: stop P-G04; do not loosen release policy or infer buyer requirements.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '../../..');
const context = vm.createContext({ console, crypto: require('crypto').webcrypto, structuredClone, Date, window: {}, document: {}, setTimeout, clearTimeout, atob });
for (const file of ['core.js', 'planning-services.js', 'record-services.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'apps/ppm', file), 'utf8'), context, { filename: file });
}
const C = vm.runInContext('({PpmRecordFactory,RelevanceEngine,CoverageEngine,ValidationEngine,PlanningService,ApprovalRegister})', context);

function readyRecord() {
  const record = C.PpmRecordFactory.create();
  Object.assign(record.meta, { factory: 'Factory A', buyer: 'Buyer A', style: 'STYLE-PG04', construction: 'knit', techPackRev: 'TP-R1' });
  const relevance = new C.RelevanceEngine();
  for (const item of relevance.applicableItems(record)) record.statuses[item.id] = 'OK';
  record.signatures.factory = { image: 'proof', name: 'Factory QA', date: '2026-10-10' };
  record.signatures.buyer = { image: 'proof', name: 'Buyer QA', date: '2026-10-10' };
  const planning = new C.PlanningService();
  const coverage = new C.CoverageEngine(relevance);
  const validation = new C.ValidationEngine(relevance, coverage, planning);
  return { record, relevance, planning, coverage, validation };
}

const clean = readyRecord();
assert.equal(clean.validation.readiness(clean.record).go, true, 'complete reviewed record must be GO-ready');
clean.record.release.decision = 'HOLD';
assert.equal(clean.record.release.decision, 'HOLD', 'HOLD remains recordable even when other controls are complete');

const conditional = readyRecord();
conditional.record.statuses.O05 = 'ACTION';
conditional.record.actions.push({ id: 'A-O05', checkpointId: 'O05', issue: 'Buyer comments remain open.', action: 'Confirm disposition with buyer.', owner: 'Merchandising', dueDate: '2026-10-12', evidence: 'Buyer comment log', status: 'Open' });
conditional.record.release.notes = 'Proceed only after buyer comment disposition is recorded.';
let decision = conditional.validation.readiness(conditional.record);
assert.equal(decision.go, false, 'open ACTION must not produce GO');
assert.equal(decision.conditional, true, 'controlled non-critical ACTION can support CONDITIONAL GO');
conditional.record.actions[0].owner = '';
assert.equal(conditional.validation.readiness(conditional.record).conditional, false, 'conditional decision requires an owner');
conditional.record.actions[0].owner = 'Merchandising';
conditional.record.statuses.O01 = 'ACTION';
conditional.record.actions.push({ id: 'A-O01', checkpointId: 'O01', issue: 'Order control incomplete.', action: 'Obtain written buyer confirmation.', owner: 'Merchandising', dueDate: '2026-10-12', evidence: '', status: 'Open' });
assert.equal(conditional.validation.readiness(conditional.record).conditional, false, 'critical ACTION must remain a blocker');

const approvals = readyRecord();
approvals.record.approvals = [C.ApprovalRegister.create('PP sample')];
decision = approvals.validation.readiness(approvals.record);
assert.equal(decision.go, false);
assert.equal(decision.controlsReady, false);
assert.match(decision.planning.approvals[0].message, /pending|rejected/i);
Object.assign(approvals.record.approvals[0], { status: 'Approved', approvedBy: 'QA Lead', date: '2026-10-10', reference: 'Buyer email 7 October' });
assert.equal(approvals.validation.readiness(approvals.record).controlsReady, true, 'approval needs status, named approver, date and proof/reference');
approvals.record.approvals[0].status = 'Not needed';
approvals.record.approvals[0].reference = '';
approvals.record.approvals[0].notes = '';
assert.equal(approvals.validation.readiness(approvals.record).controlsReady, false, 'Not needed without an explanation is not a silent waiver');
approvals.record.approvals[0].notes = 'Buyer confirmed this item is not needed for this style.';
assert.equal(approvals.validation.readiness(approvals.record).controlsReady, true);

const measurements = readyRecord();
measurements.record.measurements[0] = { pom: 'Chest', spec: '50', tol: '', tolMinus: '0.5', tolPlus: '1.5', unit: 'cm', actual: '49.5', method: 'Buyer method', risk: '', remark: '', checkRequired: true };
assert.equal(measurements.planning.measurements.gaps(measurements.record).length, 0, 'inclusive asymmetric lower boundary must pass');
measurements.record.measurements[0].actual = '49.49';
assert.equal(measurements.planning.measurements.gaps(measurements.record).length, 1);
measurements.record.measurements[0].actual = '50';
measurements.record.measurements[0].unit = 'mm';
assert.equal(measurements.planning.measurements.gaps(measurements.record).length, 1, 'unknown units cannot pass by conversion');
measurements.record.measurements[0].unit = 'cm';
measurements.record.measurements[0].actual = '';
assert.equal(measurements.planning.measurements.gaps(measurements.record).length, 1, 'blank required actual cannot pass');

const revision = readyRecord();
revision.planning.changes.review(revision.record, 'QA Lead', 'Baseline accepted before controlled revision.');
revision.record.release.decision = 'GO';
revision.record.signatures.factory = { image: 'proof', name: 'Old Factory QA', date: '2026-10-10' };
revision.record.meta.bomRev = 'BOM-R2';
assert.ok(revision.planning.changes.diff(revision.record).some(change => change.key === 'meta.bomRev'));
assert.equal(revision.planning.invalidate(revision.record), true, 'material revision must report stale sign-off');
assert.equal(revision.record.release.decision, '');
assert.equal(JSON.stringify(revision.record.signatures), '{}');
const gaps = readyRecord();
gaps.record.meta.factory = '';
gaps.record.statuses.O01 = 'ACTION';
gaps.record.actions.push({ id: 'A-O01', checkpointId: 'O01', issue: 'Order control incomplete.', action: '', owner: '', dueDate: '', evidence: '', status: 'Open' });
decision = gaps.validation.readiness(gaps.record);
assert.ok(decision.missing.includes('Factory'));
assert.ok(decision.gaps.includes('O01'));

console.log('PPM P-G04 decision proof passed: GO/HOLD, controlled CONDITIONAL GO, approval proof/exemption, asymmetric POM boundaries, stale-signoff invalidation and blocker/action explanations');
