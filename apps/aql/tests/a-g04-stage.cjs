const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

function expect(condition, message) {
  assert.ok(condition, message);
}

function expectThrow(action, message) {
  assert.throws(action, error => String(error.message).includes(message), message);
}

const start = html.indexOf('class StageCatalog');
const end = html.indexOf('class StageWorkspace', start);
expect(start >= 0 && end > start, 'A-G04 stage domain source is missing.');

// Evaluate only the shipped stage definitions and pure decision owners. The UI,
// repository, browser and saved-record adapters remain outside this contract.
const stageSource = html.slice(start, end);
const sandbox = {
  MeasurementEngine: { test: () => 'PASS' },
};
vm.runInNewContext(
  `${stageSource}\nthis.__exports = { StageCatalog, StageDecision };`,
  sandbox,
  { filename: htmlPath },
);

const { StageCatalog, StageDecision } = sandbox.__exports;

const expectedStages = {
  incoming: 'incoming',
  fabric: 'roll',
  ipc: 'ipc',
  cutting: 'cutting',
  inline: 'inline',
  endline: 'endline',
  prefinal: 'readiness',
  final: 'readiness',
  rework: 'rework',
  reinspection: 'readiness',
  loading: 'loading',
  monitor: 'monitor',
  audit: 'audit',
};

expect(Object.keys(StageCatalog.stages).length === 13, 'A-G04 stage count changed');
for (const [stage, module] of Object.entries(expectedStages)) {
  expect(StageCatalog.stages[stage][1] === module, `A-G04 ${stage} main module changed`);
  const fresh = StageCatalog.fresh(stage);
  expect(fresh.stage === stage && fresh.records.length === 0, `A-G04 ${stage} does not start with empty records`);
  expect(fresh.checks.length > 0 && fresh.checks.every(check => check.status === 'Pending'), `A-G04 ${stage} checklist is not pending by default`);
}

for (const module of ['incoming', 'roll', 'shade', 'lab', 'ipc', 'cutting', 'inline', 'endline', 'readiness', 'monitor']) {
  const fields = StageCatalog.fields(module);
  expect(fields.some(field => field.required), `A-G04 ${module} has no required identity field`);
  expect(fields.every(field => field.key && field.label && field.type), `A-G04 ${module} has an incomplete field definition`);
}

function row(module, values = {}) {
  return {
    module,
    identity: `${module.toUpperCase()}-01`,
    reference: 'BUYER-REV-1',
    status: 'Pass',
    ...values,
  };
}

const cleanRecords = [
  row('incoming'),
  row('roll', {
    length: 1000,
    widthStart: 100,
    widthMiddle: 100,
    widthEnd: 100,
    limit: 1,
    method: 'Approved 4-point method / REV-1',
    basis: '100 m²',
    defects: '10,Oil,2,3',
  }),
  row('shade', { delta: '' }),
  row('lab', {
    method: 'Buyer method',
    revision: 'REV-1',
    criterion: 'Buyer criterion',
    actual: 'Pass',
    reviewer: 'Quality Reviewer',
    testStatus: 'Pass',
  }),
  row('ipc'),
  row('cutting'),
  row('inline', { inspected: 100, defective: 2, occurrences: 3, repair: 2, recheck: 2, passRepair: 2 }),
  row('endline', { inspected: 100, defective: 2, occurrences: 2, firstPass: 98, repair: 2, recheck: 2, passRepair: 2 }),
  row('readiness', { production: 100, packed: 100, minProduction: 90, minPacked: 90 }),
  row('monitor', { order: 100, cut: 100, sew: 95, finish: 90, pack: 80 }),
];

for (const record of cleanRecords) {
  const result = StageDecision.record(record, '2026-10-10');
  expect(result.pending.length === 0 && result.failures.length === 0, `A-G04 clean ${record.module} record did not remain clean`);
}

const inline = StageDecision.record(row('inline', { inspected: 10, defective: 11, occurrences: 11 }), '2026-10-10');
expect(inline.pending.some(issue => issue.includes('Defective units exceed inspected')), 'A-G04 inline quantity guard is absent');

const endline = StageDecision.record(row('endline', { inspected: 10, defective: 2, occurrences: 2, firstPass: 7 }), '2026-10-10');
expect(endline.pending.some(issue => issue.includes('First-pass accepted + defective must equal inspected')), 'A-G04 endline reconciliation guard is absent');

const roll = StageDecision.record(row('roll', {
  length: 1000,
  widthStart: 100,
  widthMiddle: 100,
  widthEnd: 100,
  limit: 0.1,
  method: 'Approved 4-point method / REV-1',
  basis: '100 m²',
  defects: '10,Oil,2,3',
}), '2026-10-10');
expect(roll.failures.some(issue => issue.includes('Fabric point density exceeds approved limit')), 'A-G04 fabric density failure is absent');

const lab = StageDecision.record(row('lab', {
  method: 'Buyer method',
  revision: 'REV-1',
  criterion: 'Buyer criterion',
  actual: 'Failed',
  reviewer: 'Quality Reviewer',
  testStatus: 'Fail',
}), '2026-10-10');
expect(lab.failures.some(issue => issue.includes('Laboratory test failed')), 'A-G04 laboratory failure is absent');

const readiness = StageDecision.record(row('readiness', { production: 80, packed: 100, minProduction: 90, minPacked: 90 }), '2026-10-10');
expect(readiness.failures.some(issue => issue.includes('production below approved readiness threshold')), 'A-G04 readiness threshold failure is absent');

const monitor = StageDecision.record(row('monitor', { order: 100, cut: 100, sew: 95, finish: 90, pack: 110 }), '2026-10-10');
expect(monitor.pending.some(issue => issue.includes('Packed quantity exceeds order')), 'A-G04 production balance guard is absent');

expectThrow(() => StageCatalog.fresh('unsupported-stage'), 'Select an inspection stage');
for (const requiredText of [
  'StageCatalog.stages',
  'Stage records',
  'Stage checklist',
  'Stage report / PDF',
  'Order quality journey',
  'StageReviewPolicy',
]) {
  expect(html.includes(requiredText), `A-G04 stage workflow source is missing: ${requiredText}`);
}

console.log('AQL A-G04 stage workflow contract checks passed');
