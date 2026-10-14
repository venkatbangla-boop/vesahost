const assert = require('assert/strict');
const fs = require('fs');

const tracker = fs.readFileSync('docs/aql/06_EXECUTION_TRACKER.md', 'utf8');
const startMarker = '<!-- AQL_35_AREA_MATRIX_START -->';
const endMarker = '<!-- AQL_35_AREA_MATRIX_END -->';
const start = tracker.indexOf(startMarker);
const end = tracker.indexOf(endMarker);
assert.ok(start >= 0 && end > start, 'A-G04 35-area evidence matrix markers are missing');

const section = tracker.slice(start + startMarker.length, end);
const rows = [...section.matchAll(/^\| (\d{2}) \| ([^|]+) \| ([A-Z_]+) \| ([^|]+) \| ([^|]+) \|$/gm)].map(match => ({
  id: match[1],
  area: match[2].trim(),
  verdict: match[3],
  evidence: match[4].trim(),
  remaining: match[5].trim(),
}));

assert.equal(rows.length, 35, 'A-G04 evidence matrix must contain exactly 35 area rows');
assert.deepEqual(rows.map(row => row.id), Array.from({ length: 35 }, (_, index) => String(index + 1).padStart(2, '0')), 'A-G04 area IDs must be unique and sequential');
const allowed = new Set(['PROVEN_LOCAL', 'CONDITIONAL', 'DEFERRED_BY_SCOPE', 'BLOCKED_EXTERNAL']);
for (const row of rows) {
  assert.ok(row.area, `A-G04 area ${row.id} has no name`);
  assert.ok(allowed.has(row.verdict), `A-G04 area ${row.id} has an unsupported verdict`);
  assert.ok(row.evidence && row.evidence !== '—', `A-G04 area ${row.id} has no evidence`);
  assert.ok(row.remaining && row.remaining !== '—', `A-G04 area ${row.id} has no remaining-work boundary`);
}

const counts = rows.reduce((out, row) => ({ ...out, [row.verdict]: (out[row.verdict] || 0) + 1 }), {});
assert.deepEqual(counts, { PROVEN_LOCAL: 29, CONDITIONAL: 4, DEFERRED_BY_SCOPE: 1, BLOCKED_EXTERNAL: 1 }, 'A-G04 honest-status counts changed without tracker review');
assert.equal(rows.find(row => row.id === '03').verdict, 'PROVEN_LOCAL', 'laboratory records must retain their accepted local decision/evidence/reopen proof');
assert.equal(rows.find(row => row.id === '26').verdict, 'CONDITIONAL', 'packing/carton area must remain conditional without approved randomization policy');
assert.equal(rows.find(row => row.id === '31').verdict, 'PROVEN_LOCAL', 'stage reports must retain their accepted local catalogue/sandbox/print-window evidence');
assert.equal(rows.find(row => row.id === '33').verdict, 'DEFERRED_BY_SCOPE', 'native wrappers must remain deferred under the Free-only contract');
assert.equal(rows.find(row => row.id === '35').verdict, 'BLOCKED_EXTERNAL', 'real factory pilot must not be represented as local proof');

console.log('AQL A-G04 35-area evidence matrix passed: 35/35 unique rows, 29 proven local, 4 conditional, 1 deferred by scope, 1 external blocker');
