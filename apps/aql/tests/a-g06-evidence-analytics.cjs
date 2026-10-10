const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

function expect(condition, message) {
  assert.ok(condition, message);
}

const domainStart = html.indexOf('class DomainValue');
const domainEnd = html.indexOf('/** Schema owner:', domainStart);
const numberStart = html.indexOf('class MeasurementNumber');
const numberEnd = html.indexOf('/** Explicit aggregate measurement policy.', numberStart);
const measurementStart = html.indexOf('class MeasurementEngine');
const measurementEnd = html.indexOf('/** Pure overall-result owner.', measurementStart);
expect(domainStart >= 0 && domainEnd > domainStart, 'A-G06 DomainValue source is missing.');
expect(numberStart >= 0 && numberEnd > numberStart, 'A-G06 measurement parser source is missing.');
expect(measurementStart >= 0 && measurementEnd > measurementStart, 'A-G06 measurement engine source is missing.');

const sandbox = {};
vm.runInNewContext(
  `${html.slice(domainStart, domainEnd)}\n${html.slice(numberStart, numberEnd)}\n${html.slice(measurementStart, measurementEnd)}\nthis.__exports = { MeasurementNumber, MeasurementEngine };`,
  sandbox,
  { filename: htmlPath },
);
const { MeasurementNumber, MeasurementEngine } = sandbox.__exports;

const base = {
  pom: 'Chest width',
  spec: '50',
  minus: '1',
  plus: '1',
  unit: 'cm',
  required: 3,
  inputMode: 'actual',
  extraMode: 'actual',
  extra: '',
};

const clean = MeasurementEngine.evaluate({ ...base, actuals: '49,50,51' });
expect(clean.min === 49 && clean.max === 51, 'A-G06 tolerance bounds changed.');
expect(clean.result === 'PASS' && clean.oot === 0, 'A-G06 in-tolerance measurement did not pass.');

const outOfTolerance = MeasurementEngine.evaluate({ ...base, actuals: '49,50,52' });
expect(outOfTolerance.result === 'FAIL' && outOfTolerance.initialOOT === 1, 'A-G06 OOT measurement did not fail.');
expect(outOfTolerance.initial.length === 3, 'A-G06 original actual readings were not retained.');

const incomplete = MeasurementEngine.evaluate({ ...base, actuals: '49,not-a-reading,51' });
expect(incomplete.result === 'PENDING', 'A-G06 malformed/incomplete measurement did not remain pending.');
expect(incomplete.issues.some(issue => issue.includes('Invalid actual value')), 'A-G06 malformed reading was not reported.');
expect(MeasurementNumber.tokens('49,not-a-reading,51').raw.length === 3, 'A-G06 raw measurement tokens were not preserved.');

const additional = MeasurementEngine.evaluate(
  { ...base, actuals: '49,52,50', extra: '50,50,50' },
  {
    measurementRule: 'additional',
    initialOOTLimit: 1,
    additional: 3,
    extraMaxOOT: 0,
    extraAcceptance: 'additional',
    additionalScope: 'same-pom-variant',
    additionalReference: 'BUYER-MEASURE-REV-2',
  },
);
expect(additional.result === 'PASS' && additional.conditional, 'A-G06 approved additional-reading path changed.');
expect(additional.initialOOT === 1 && additional.extraOOT === 0, 'A-G06 initial/additional OOT counts changed.');

for (const requiredText of [
  'MeasurementPolicy',
  'numerator,denominator,rate',
  'No complete measurement denominator is available.',
  'checked,defects,oot,rate',
  'These are descriptive local-history metrics. They do not replace AQL decisions or prove causation.',
  'doc.assetId&&!p.assets.some(a=>a.id===doc.assetId)',
  'copyPreviousEvidence',
  'mapping.has(doc.assetId)',
  'sampleId',
  'cartonId',
  'if(!v.identity||!v.owner||!v.action)throw Error',
  'Verification, effectiveness and closure evidence are required',
  'p[key].length>50000',
  'photos.slice(0,4)',
  'aria-label',
]) {
  expect(html.includes(requiredText), `A-G06 evidence/source guard is missing: ${requiredText}`);
}

console.log('AQL A-G06 measurement, evidence-link, CAPA and analytics contract checks passed');
