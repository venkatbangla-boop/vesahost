const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

function expect(condition, message) {
  assert.ok(condition, message);
}

const start = html.indexOf('class StageCatalog');
const end = html.indexOf('class StageWorkspace', start);
expect(start >= 0 && end > start, 'A-G05 stage domain source is missing.');

const sandbox = { MeasurementEngine: { test: () => 'PASS' } };
vm.runInNewContext(
  `${html.slice(start, end)}\nthis.__exports = { StageCatalog, StageDecision };`,
  sandbox,
  { filename: htmlPath },
);
const { StageCatalog, StageDecision } = sandbox.__exports;

function row(module, values = {}) {
  return {
    module,
    identity: `${module.toUpperCase()}-A-G05`,
    reference: 'BUYER-REV-1',
    status: 'Pass',
    ...values,
  };
}

const prefinal = StageCatalog.fresh('prefinal');
expect(prefinal.stage === 'prefinal' && prefinal.checks.length === 11, 'A-G05 pre-final checklist changed');
const prefinalReadiness = StageDecision.record(row('readiness', {
  production: 100,
  packed: 100,
  minProduction: 90,
  minPacked: 90,
  shipment: 1000,
  packingRevision: 'PL-REV-2',
}), '2026-10-10');
expect(prefinalReadiness.pending.length === 0 && prefinalReadiness.failures.length === 0, 'A-G05 valid pre-final readiness remained blocked');

const blockedReadiness = StageDecision.record(row('readiness', {
  production: 100,
  packed: 40,
  minProduction: 90,
  minPacked: 90,
}), '2026-10-10');
expect(blockedReadiness.failures.some(issue => issue.includes('packed below approved readiness threshold')), 'A-G05 pre-final readiness threshold did not fail');

const incompleteRework = StageDecision.record(row('rework', {
  defect: 'Original seam defect',
  repairRequired: 'Yes',
  repair: 'Pending',
  rechecker: '',
  recheck: 'Pending',
  disposition: 'Hold',
  quantity: 1,
}), '2026-10-10');
expect(incompleteRework.pending.some(issue => issue.includes('Repair incomplete')), 'A-G05 incomplete rework repair was not pending');
expect(incompleteRework.pending.some(issue => issue.includes('Recheck / disposition incomplete')), 'A-G05 incomplete rework verification was not pending');

const acceptedRework = StageDecision.record(row('rework', {
  defect: 'Original seam defect',
  repairRequired: 'Yes',
  repair: 'Yes',
  rechecker: 'Quality Reviewer',
  recheck: 'Pass',
  disposition: 'Accept',
  quantity: 1,
}), '2026-10-10');
expect(acceptedRework.pending.length === 0 && acceptedRework.failures.length === 0, 'A-G05 accepted rework did not remain clean');

const loadingMismatch = StageDecision.record(row('loading', {
  expected: 10,
  loaded: 9,
  piecesExpected: 1000,
  piecesLoaded: 900,
  seal: 'SEAL-1',
  start: '2026-10-10T08:00',
  end: '2026-10-10T10:00',
  handover: 'Forwarder acknowledged',
  before: 'asset-before',
  after: 'asset-after',
}), '2026-10-10');
expect(loadingMismatch.failures.some(issue => issue.includes('expected / loaded mismatch')), 'A-G05 carton loading mismatch was not a failure');
expect(loadingMismatch.failures.some(issue => issue.includes('piecesExpected / piecesLoaded mismatch')), 'A-G05 piece loading mismatch was not a failure');

const loadingComplete = StageDecision.record(row('loading', {
  expected: 10,
  loaded: 10,
  piecesExpected: 1000,
  piecesLoaded: 1000,
  seal: 'SEAL-1',
  start: '2026-10-10T08:00',
  end: '2026-10-10T10:00',
  handover: 'Forwarder acknowledged',
  before: 'asset-before',
  after: 'asset-after',
}), '2026-10-10');
expect(loadingComplete.pending.length === 0 && loadingComplete.failures.length === 0, 'A-G05 complete loading record did not remain clean');

for (const requiredText of [
  "stage==='rework'",
  'Original defect is retained',
  'Reinspection after rework',
  'Create a separate reinspection?',
  'Final Random Inspection',
  'FinalAQLInspectionEngine',
  'Factory acknowledgement',
  'critical finding cannot pass without closure evidence',
  'findings were not received',
  'Verification and effectiveness evidence required',
  'Before / empty photo asset IDs',
  'Final seal photo asset IDs',
]) {
  expect(html.includes(requiredText), `A-G05 source guard or workflow marker is missing: ${requiredText}`);
}

console.log('AQL A-G05 readiness, rework, reinspection and loading contract checks passed');
