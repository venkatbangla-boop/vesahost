/**
 * P-G05 conditional sub-slice proof for existing PPM follow-up/evidence/history owners.
 * Purpose: prove the additive follow-up contract, legacy-safe codec and existing
 * action, evidence and bounded change-history behavior before UI work begins.
 * Access: node apps/ppm/tests/p-g05-followups.cjs
 * Failure: preserve the conditional verdict; do not infer UI or notification behavior.
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
const C = vm.runInContext('({PpmRecordFactory,ActionTrackerManager,ChangeReviewEngine,BackupCodec,RecordHistory,RelevanceEngine,CoverageEngine,AppController})', context);
const record = C.PpmRecordFactory.create();
assert.equal(record.followUpSchema, 1);
assert.deepEqual(JSON.parse(JSON.stringify(record.meetingMinutes)), { chairedBy: '', agenda: '', decisions: '', notes: '', acknowledgedAt: '', attachmentsRefs: [] });
assert.deepEqual(JSON.parse(JSON.stringify([record.exceptions, record.actionEscalation, record.meetingVersions])), [[], [], []]);
const tracker = new C.ActionTrackerManager();
tracker.sync(record, 'O05', 'Buyer comments remain open.', 'ACTION');
assert.equal(record.actions.length, 1);
Object.assign(record.actions[0], { action: 'Confirm disposition with buyer.', owner: 'Merchandising', dueDate: '2026-10-12', evidence: 'Buyer comment log', status: 'In Progress' });
tracker.sync(record, 'O05', 'Buyer comments remain open.', 'OK');
assert.equal(record.actions[0].status, 'Closed', 'closing a checkpoint closes its linked action but does not rewrite the checkpoint status');
record.statuses.O05 = 'ACTION';
assert.equal(record.statuses.O05, 'ACTION');
record.photos.evidence.fabricShade = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const changes = new C.ChangeReviewEngine();
changes.review(record, 'QA Lead', 'Initial follow-up baseline.');
record.meta.bomRev = 'BOM-R2';
assert.equal(changes.diff(record).some(x => x.key === 'meta.bomRev'), true);
record.changeReview.history[0].note = 'History remains bounded and reviewer-attributed.';
Object.assign(record.meetingMinutes, { chairedBy: 'QA Lead', agenda: 'Open buyer comments', decisions: 'Hold O05 pending buyer disposition.', notes: 'No release override.', acknowledgedAt: '2026-10-10T12:00:00.000Z', attachmentsRefs: ['EVIDENCE:buyer-comment-log'] });
record.exceptions.push({ id: 'EXC-O05-1', checkpointId: 'O05', buyerPolicyRef: 'BUYER-POLICY-7', scope: 'O05 only', accountableParty: 'Merchandising', authorizedBy: 'Buyer QA', authorityType: 'Buyer written authority', approvedDate: '2026-10-10', evidence: 'EVIDENCE:buyer-waiver-1', permittedUntil: '2026-10-20', status: 'Recorded' });
record.actionEscalation.push({ actionId: record.actions[0].id, escalationLevel: 'Level 1', escalationOwner: 'Merchandising Manager', reason: 'Buyer response overdue.', time: '2026-10-10T13:00:00.000Z', nextReviewDate: '2026-10-11', dateSource: 'Calendar days; buyer comment log dated 2026-10-09' });
const snapshot = JSON.parse(JSON.stringify(record));
snapshot.meetingVersions = [];
record.meetingVersions.push({ id: 'MTGV-001', parentId: '', amendmentReason: 'Initial finalized meeting record.', approvalsInvalidated: [], signedAt: '2026-10-10T14:00:00.000Z', snapshot });
const coverage = new C.CoverageEngine(new C.RelevanceEngine());
const readinessBefore = JSON.stringify(coverage.compute(record));
record.exceptions[0].status = 'Active';
assert.equal(JSON.stringify(coverage.compute(record)), readinessBefore, 'authority records must not override checkpoint readiness');
const history = new C.RecordHistory();
history.reset(record);
record.actions[0].evidence = 'Updated buyer comment log';
history.capture(record);
assert.equal(history.move(-1).actions[0].evidence, 'Buyer comment log');
const codec = new C.BackupCodec();
const roundTrip = codec.decode(JSON.parse(codec.encode(record)));
assert.equal(roundTrip.actions[0].owner, 'Merchandising');
assert.equal(roundTrip.actions[0].dueDate, '2026-10-12');
assert.equal(roundTrip.actions[0].evidence, 'Updated buyer comment log');
assert.equal(roundTrip.photos.evidence.fabricShade, record.photos.evidence.fabricShade);
assert.equal(roundTrip.changeReview.history[0].reviewer, 'QA Lead');
assert.equal(roundTrip.meetingMinutes.attachmentsRefs[0], 'EVIDENCE:buyer-comment-log');
assert.equal(roundTrip.exceptions[0].authorizedBy, 'Buyer QA');
assert.equal(roundTrip.actionEscalation[0].dateSource, 'Calendar days; buyer comment log dated 2026-10-09');
assert.equal(Object.hasOwn(roundTrip.actionEscalation[0], 'notificationSent'), false, 'local metadata must never claim a notification was sent');
assert.equal(roundTrip.meetingVersions[0].snapshot.release.decision, record.release.decision);
assert.deepEqual(JSON.parse(JSON.stringify(roundTrip.meetingVersions[0].snapshot.meetingVersions)), [], 'snapshots cannot recursively contain amendment history');

const legacy = JSON.parse(JSON.stringify(record));
delete legacy.followUpSchema; delete legacy.meetingMinutes; delete legacy.exceptions; delete legacy.actionEscalation; delete legacy.meetingVersions;
const migrated = codec.decode(legacy);
assert.equal(migrated.followUpSchema, 1);
assert.deepEqual(JSON.parse(JSON.stringify([migrated.exceptions, migrated.actionEscalation, migrated.meetingVersions])), [[], [], []]);
const directLegacy = JSON.parse(JSON.stringify(legacy));
C.AppController.prototype.ensureCompatibility.call({ record: directLegacy });
assert.equal(directLegacy.followUpSchema, 1);
assert.deepEqual(JSON.parse(JSON.stringify(directLegacy.meetingMinutes)), { chairedBy: '', agenda: '', decisions: '', notes: '', acknowledgedAt: '', attachmentsRefs: [] });

const rejects = mutate => { const candidate = JSON.parse(JSON.stringify(record)); mutate(candidate); assert.throws(() => codec.decode(candidate)); };
rejects(x => { x.followUpSchema = 2; });
rejects(x => { x.meetingMinutes.attachmentsRefs = Array.from({ length: 31 }, (_, i) => `REF-${i}`); });
rejects(x => { x.exceptions[0].checkpointId = 'UNKNOWN'; });
rejects(x => { x.exceptions.push({ ...x.exceptions[0] }); });
rejects(x => { x.actionEscalation[0].actionId = 'UNKNOWN'; });
rejects(x => { x.meetingVersions[0].snapshot.meetingVersions = [x.meetingVersions[0]]; });
rejects(x => { x.meetingVersions.push({ ...x.meetingVersions[0], id: 'MTGV-002', parentId: 'MTGV-MISSING' }); });

console.log('PPM P-G05 contract proof passed: legacy defaults, minutes, authority, escalation/date-source and bounded full-record amendment snapshots round-trip with strict malformed-reference guards');
