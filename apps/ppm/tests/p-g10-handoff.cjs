/** P-G10 evidence-only handoff guard. It does not authorize staging or deployment. */
const assert = require('assert/strict');
const fs = require('fs');

const tracker = fs.readFileSync('docs/ppm/06_EXECUTION_TRACKER.md', 'utf8');
const progress = fs.readFileSync('VESA_PROGRESS.md', 'utf8');
const readiness = fs.readFileSync('docs/VESA_360_RELEASE_READINESS.md', 'utf8');
const eligibility = fs.readFileSync('docs/platform/VESA_GITHUB_FREE_ONLY_ELIGIBILITY.md', 'utf8');
const rows = [...tracker.matchAll(/^P(\d{2}) \| (accepted|conditional|blocked|rejected|not-started) \| ([^|]+) \| ([^|]+) \| ([0-9a-f]{7}) \| (.+)$/gm)];

assert.equal(rows.length, 52, 'P-G10 must retain exactly 52 feature dispositions.');
assert.deepEqual(rows.map(row => Number(row[1])), Array.from({ length: 52 }, (_, index) => index + 1), 'P-G10 feature IDs must be unique and sequential.');
assert.deepEqual(rows.reduce((counts, row) => { counts[row[2]] = (counts[row[2]] || 0) + 1; return counts; }, {}), { accepted: 49, blocked: 2, conditional: 1 });
assert.equal(rows.find(row => row[1] === '49')[2], 'blocked');
assert.equal(rows.find(row => row[1] === '50')[2], 'blocked');
assert.equal(rows.find(row => row[1] === '52')[2], 'conditional');

for (const complete of [
  'Every P01–P52 feature has evidence-backed disposition; no silent omission.',
  'Full PPM tests; AQL tests; login/App Centre/TNA checks where available.',
  'Screenshot set 320/360/390/768/1024/1280/1440 and scroll/modal/report.',
]) assert.ok(tracker.includes(`- [x] ${complete}`), `Missing proven local P-G10 row: ${complete}`);
for (const external of [
  'Independent/user review of release behavior, backup migration and rollback.',
  'User expressly approved production deployment (otherwise do not deploy).',
  'After approved deploy, cache/version and live checks recorded with exact commit.',
]) assert.ok(tracker.includes(`- [ ] ${external}`), `External P-G10 row must remain open: ${external}`);

assert.ok(tracker.includes('P-G10 RELEASE REMAINS BLOCKED'));
assert.ok(progress.includes('P-G10 | Full acceptance and release authorization | BLOCKED / LOCAL HANDOFF PROVEN'));
assert.ok(eligibility.includes('P-G10 | ACTIVE — LOCAL SLICE ONLY | CONDITIONAL / LOCAL HANDOFF PROVEN'));
assert.ok(readiness.includes('Local PPM state'));
assert.ok(readiness.includes('**Decision:** **HOLD — not ready for production deployment**'));
assert.ok(readiness.includes('Not staged, not deployed, not live-verified, not authorized'));

console.log('PPM P-G10 handoff passed: 52 dispositions, local test/visual/rollback evidence complete, external review/release/deploy rows remain open');
