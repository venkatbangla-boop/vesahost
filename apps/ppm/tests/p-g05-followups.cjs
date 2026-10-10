/**
 * P-G05 conditional sub-slice proof for existing PPM follow-up/evidence/history owners.
 * Purpose: prove the currently shipped action, evidence, codec and bounded change-history
 * behavior while making missing Phase-2 enhancement schemas explicit.
 * Access: node apps/ppm/tests/p-g05-followups.cjs
 * Failure: preserve the conditional verdict; do not infer aging, waiver or amendment behavior.
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
const C = vm.runInContext('({PpmRecordFactory,ActionTrackerManager,ChangeReviewEngine,BackupCodec,RecordHistory})', context);
const record = C.PpmRecordFactory.create();
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
assert.equal(Object.hasOwn(roundTrip, 'meetingMinutes'), false, 'meeting minutes enhancement is not present and must not be fabricated');
assert.equal(Object.hasOwn(roundTrip, 'actionEscalation'), false, 'action aging/escalation enhancement is not present and must remain an explicit gap');
assert.equal(Object.hasOwn(roundTrip, 'meetingVersions'), false, 'immutable amendment snapshots are not present and must remain an explicit gap');

console.log('PPM P-G05 conditional proof passed: action owner/due/evidence/status, photo and history round-trip are preserved; minutes, escalation and amendment schemas remain explicit gaps');
