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
const C = vm.runInContext('({PpmRecordFactory,ActionTrackerManager,ChangeReviewEngine,FollowUpService,BackupCodec,RecordHistory,RelevanceEngine,CoverageEngine,AppController})', context);
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
assert.equal(Object.isFrozen(roundTrip.meetingVersions[0].snapshot), true, 'decoded finalized snapshots are immutable in active state');

const followups = new C.FollowUpService();
assert.deepEqual(JSON.parse(JSON.stringify(followups.aging({ dueDate: '2026-10-10' }, '2026-10-13', { basis: 'calendar-days', source: 'Calendar days' }))), { basis: 'calendar-days', source: 'Calendar days', daysFromDue: 3, status: 'Overdue' });
assert.deepEqual(JSON.parse(JSON.stringify(followups.aging({ dueDate: '2026-10-13' }, '2026-10-10', { basis: 'working-days', source: 'Factory calendar FC-7', rangeStart: '2026-10-01', rangeEnd: '2026-10-31', workingDates: ['2026-10-11', '2026-10-12', '2026-10-13'] }))), { basis: 'working-days', source: 'Factory calendar FC-7', daysFromDue: -3, status: 'Upcoming' });
assert.throws(() => followups.aging({ dueDate: '2026-10-10' }, '2026-10-13', { basis: 'calendar-days', source: '' }));
assert.throws(() => followups.aging({ dueDate: '2026-10-10' }, '2026-10-13', { basis: 'working-days', source: 'Partial', rangeStart: '2026-10-11', rangeEnd: '2026-10-31', workingDates: [] }));

const finalized = C.PpmRecordFactory.create();
finalized.locked = true;
finalized.updatedAt = '2026-10-10T14:00:00.000Z';
finalized.release = { decision: 'GO', notes: 'Approved parent.' };
finalized.signatures.factory = { image: record.photos.evidence.fabricShade, name: 'Factory signer', designation: 'QA', date: '2026-10-10', time: '14:00' };
finalized.approvals.push({ id: 'APR-PP-1', label: 'PP sample', required: true, status: 'Approved', approvedBy: 'Buyer QA', date: '2026-10-10', reference: 'PP-1', notes: '', photo: '', photoRevision: '' });
finalized.meetingMinutes.acknowledgedAt = '2026-10-10T14:00:00.000Z';
const amendment = followups.amend(finalized, { reason: 'BOM revision changed.', at: '2026-10-11T09:00:00.000Z' });
assert.equal(finalized.locked, true, 'amendment creation must not mutate its finalized parent');
assert.equal(finalized.release.decision, 'GO');
assert.equal(amendment.locked, false);
assert.deepEqual(JSON.parse(JSON.stringify(amendment.release)), { decision: '', notes: '' });
assert.deepEqual(JSON.parse(JSON.stringify(amendment.signatures)), {});
assert.equal(amendment.approvals[0].status, 'Pending');
assert.equal(amendment.approvals[0].approvedBy, '');
assert.equal(amendment.meetingMinutes.acknowledgedAt, '');
assert.deepEqual(JSON.parse(JSON.stringify(amendment.meetingVersions[0].approvalsInvalidated)), ['APR-PP-1']);
assert.equal(amendment.meetingVersions[0].snapshot.release.decision, 'GO');
assert.equal(Object.isFrozen(amendment.meetingVersions[0].snapshot), true);
const reopenedAmendment = codec.decode(JSON.parse(codec.encode(amendment)));
assert.equal(reopenedAmendment.approvals[0].status, 'Pending');
assert.equal(reopenedAmendment.meetingVersions[0].snapshot.release.decision, 'GO');
assert.equal(Object.isFrozen(reopenedAmendment.meetingVersions[0].snapshot), true);
amendment.locked = true;
amendment.release = { decision: 'HOLD', notes: 'Amended meeting reviewed.' };
const secondAmendment = followups.amend(amendment, { reason: 'Second controlled revision.', at: '2026-10-12T09:00:00.000Z' });
assert.equal(secondAmendment.meetingVersions[1].parentId, secondAmendment.meetingVersions[0].id);
assert.equal(Object.isFrozen(secondAmendment.meetingVersions[0].snapshot), true, 'earlier snapshots remain immutable after another amendment');
assert.throws(() => followups.amend(C.PpmRecordFactory.create(), { reason: 'Not finalized.', at: '2026-10-11T09:00:00.000Z' }));

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
