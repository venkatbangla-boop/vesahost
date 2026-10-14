const assert = require('assert/strict');
const fs = require('fs');

const tracker = fs.readFileSync('docs/aql/06_EXECUTION_TRACKER.md', 'utf8');
const startMarker = '<!-- AQL_60_REQUIREMENT_MATRIX_START -->';
const endMarker = '<!-- AQL_60_REQUIREMENT_MATRIX_END -->';
const start = tracker.indexOf(startMarker);
const end = tracker.indexOf(endMarker);
assert.ok(start >= 0 && end > start, 'A-G11 A01-A60 evidence matrix markers are missing');

const section = tracker.slice(start + startMarker.length, end);
const rows = [...section.matchAll(/^\| (A\d{2}) \| ([^|]+) \| ([A-Z_]+) \| ([^|]+) \| ([^|]+) \|$/gm)].map(match => ({
  id: match[1],
  requirement: match[2].trim(),
  verdict: match[3],
  evidence: match[4].trim(),
  remaining: match[5].trim(),
}));

assert.equal(rows.length, 60, 'A-G11 evidence matrix must contain exactly 60 requirement rows');
assert.deepEqual(rows.map(row => row.id), Array.from({ length: 60 }, (_, index) => `A${String(index + 1).padStart(2, '0')}`), 'A-G11 requirement IDs must be unique and sequential');
const allowed = new Set(['PROVEN_LOCAL', 'CONDITIONAL', 'DEFERRED_BY_SCOPE', 'BLOCKED_EXTERNAL']);
for (const row of rows) {
  assert.ok(row.requirement, `${row.id} has no requirement name`);
  assert.ok(allowed.has(row.verdict), `${row.id} has an unsupported verdict`);
  assert.ok(row.evidence && row.evidence !== '—', `${row.id} has no current evidence`);
  assert.ok(row.remaining && row.remaining !== '—', `${row.id} has no remaining-work boundary`);
}

const counts = rows.reduce((out, row) => ({ ...out, [row.verdict]: (out[row.verdict] || 0) + 1 }), {});
assert.deepEqual(counts, { PROVEN_LOCAL: 54, CONDITIONAL: 3, DEFERRED_BY_SCOPE: 2, BLOCKED_EXTERNAL: 1 }, 'A-G11 honest-status counts changed without tracker review');
for (const id of ['A03', 'A25', 'A57']) assert.equal(rows.find(row => row.id === id).verdict, 'CONDITIONAL', `${id} must retain its missing authority boundary`);
for (const id of ['A09', 'A48']) assert.equal(rows.find(row => row.id === id).verdict, 'PROVEN_LOCAL', `${id} AR11 local evidence must remain proven`);
for (const id of ['A56', 'A58']) assert.equal(rows.find(row => row.id === id).verdict, 'DEFERRED_BY_SCOPE', `${id} must remain deferred under the Free-only contract`);
assert.equal(rows.find(row => row.id === 'A60').verdict, 'BLOCKED_EXTERNAL', 'A60 factory acceptance must not be represented as local proof');

console.log('AQL A-G11 requirement matrix passed: A01-A60 unique, 54 proven local, 3 conditional, 2 deferred by scope, 1 external blocker');
