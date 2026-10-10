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

function classSource(name) {
  const start = html.indexOf(`class ${name}`);
  expect(start >= 0, `Source class ${name} is missing.`);
  const next = html.indexOf('class ', start + name.length + 6);
  return html.slice(start, next < 0 ? html.length : next);
}

// Extract only the shipped pure owners. This test intentionally leaves the large
// UI coordinator, storage adapters and network boundary out of the VM.
const domainSource = ['DomainValue', 'SamplingEngine', 'AllocationEngine', 'PlanApproval']
  .map(classSource)
  .join('\n');
const sandbox = { console, Date };
vm.runInNewContext(
  `${domainSource}\nthis.__exports = { DomainValue, SamplingEngine, AllocationEngine, PlanApproval };`,
  sandbox,
  { filename: htmlPath },
);

const { SamplingEngine, AllocationEngine, PlanApproval } = sandbox.__exports;

const expectedCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R'];
const expectedSizes = [2, 3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250, 2000];
const expectedLevels = ['S-1', 'S-2', 'S-3', 'S-4', 'I', 'II', 'III'];
const expectedAqls = ['0.65', '1.0', '1.5', '2.5', '4.0', '6.5'];

expect(JSON.stringify(SamplingEngine.CODES) === JSON.stringify(expectedCodes), 'A-G03 code chart changed');
expect(JSON.stringify(SamplingEngine.SIZES) === JSON.stringify(expectedSizes), 'A-G03 sample-size chart changed');
expect(JSON.stringify(SamplingEngine.LEVELS) === JSON.stringify(expectedLevels), 'A-G03 inspection levels changed');
expect(JSON.stringify(SamplingEngine.AQLS) === JSON.stringify(expectedAqls), 'A-G03 AQL options changed');
expect(SamplingEngine.LOTS.length === 15, 'A-G03 lot-band count changed');
expect(SamplingEngine.LOTS.at(-1)[0] === Infinity, 'A-G03 final lot band must remain open-ended');

function rules(overrides = {}) {
  return {
    groupBy: 'combined',
    basis: 'occurrences',
    unitClass: 'highest',
    level: 'III',
    plan: 'reference',
    major: '6.5',
    minor: '6.5',
    critical: 0,
    reference: 'BUYER-AQL-REV-1',
    custom: {},
    ...overrides,
  };
}

function planFor(lot, level = 'III', overrides = {}) {
  return SamplingEngine.plan({ key: 'ALL', lot, lines: [] }, rules({ level, ...overrides }));
}

// Verify both sides of every lot-band boundary, including the open-ended band,
// without introducing a new chart or an alternative standard interpretation.
let previous = 0;
for (const [index, [upper, sequence]] of SamplingEngine.LOTS.entries()) {
  const lower = previous + 1;
  const atLower = planFor(lower);
  const atUpper = planFor(Number.isFinite(upper) ? upper : lower);
  const expectedCode = sequence[expectedLevels.indexOf('III')];
  expect(atLower.code === expectedCode, `A-G03 lower boundary ${lower} returned ${atLower.code}`);
  expect(atUpper.code === expectedCode, `A-G03 upper boundary ${upper} returned ${atUpper.code}`);
  expect(atUpper.n === expectedSizes[expectedCodes.indexOf(expectedCode)], `A-G03 sample n changed at ${upper}`);
  if (Number.isFinite(upper)) {
    const next = SamplingEngine.LOTS[index + 1][1][expectedLevels.indexOf('III')];
    expect(planFor(upper + 1).code === next, `A-G03 transition after ${upper} returned the wrong code`);
    previous = upper;
  }
}

// Null cells remain explicit unsupported plans; numeric Ac cells remain usable
// without inventing a Re value in the application layer.
for (const code of SamplingEngine.CODES) {
  for (const [index, aql] of SamplingEngine.AQLS.entries()) {
    const sequenceIndex = SamplingEngine.LOTS.findIndex(([, sequence]) => sequence.includes(code));
    const sequence = SamplingEngine.LOTS[sequenceIndex][1];
    const level = expectedLevels[sequence.indexOf(code)];
    const lot = Number.isFinite(SamplingEngine.LOTS[sequenceIndex][0])
      ? SamplingEngine.LOTS[sequenceIndex][0]
      : 500001;
    const result = planFor(lot, level, { major: aql, minor: aql });
    const cell = SamplingEngine.AC[code][index];
    if (cell === null) {
      expect(result.issues.some(issue => issue.includes('unsupported')), `A-G03 null cell ${code}/${aql} became calculable`);
    } else {
      expect(result.major === cell && result.minor === cell, `A-G03 Ac cell ${code}/${aql} changed`);
    }
  }
}

expect(JSON.stringify(AllocationEngine.distribute([{ qty: 3 }, { qty: 2 }], 3)) === '[2,1]', 'A-G03 allocation tie-break changed');
expectThrow(() => AllocationEngine.distribute([{ qty: 2 }], 3), 'Sample exceeds available lot');

const project = {
  scope: { minimumCoverage: 0, minCartons: '' },
  orders: [{ id: 'L1', po: 'PO-1', item: 'STYLE-1', color: 'Navy', size: 'M', qty: 8, group: '' }],
  rules: rules(),
  planApproval: {
    standard: 'Buyer legacy table',
    edition: '2026 buyer revision 1',
    scheme: 'Single normal',
    reference: 'BUYER-AQL-REV-1',
    approvedBy: '',
    approvedAt: '',
    signature: '',
  },
};
expectThrow(() => PlanApproval.approve(project, ''), 'Standard, edition, source and reviewer are required');
PlanApproval.approve(project, 'Quality Reviewer');
expect(project.rules.confirmed === true, 'A-G03 approved plan did not confirm criteria');
expect(project.planApproval.approvedBy === 'Quality Reviewer', 'A-G03 reviewer was not stored');
expect(project.planApproval.approvedAt, 'A-G03 approval time was not stored');
expect(project.planApproval.signature, 'A-G03 approval signature was not stored');
expect(PlanApproval.issues(project).length === 0, 'A-G03 approved plan still reports provenance issues');

for (const requiredText of [
  'Sampling authorisation',
  'Standard / buyer table name',
  'Edition / revision',
  'Approved table / instruction source',
  'Reviewer who verified each plan',
  'Inspection timing record',
  'Manual timing: actual start, end, timezone and reason',
]) {
  expect(html.includes(requiredText), `A-G03 visible provenance/timing field is missing: ${requiredText}`);
}

console.log('AQL A-G03 sampling and provenance contract checks passed');
