const assert = require('assert').strict;
const operations = require('../src/operations.js');

const missingDueDate = operations.riskReasons({
  approval: { status: 'approved' },
  material: { status: 'ready' },
  capacity: { status: 'calculated' },
  schedule: { workingDaysEarlyOrLate: 0 }
});
assert.deepEqual(missingDueDate.map(item => item.type), ['due-date'], 'RSK-01 missing due date must be the explicit risk reason.');
assert.equal(missingDueDate[0].status, 'needs-information', 'RSK-01 missing due date must be Needs Information, not green.');

const multiple = operations.riskReasons({
  dueDate: '2026-10-20',
  approval: { status: 'blocked', reason: 'Buyer approval is pending.' },
  material: { status: 'ready' },
  capacity: { status: 'calculated' },
  schedule: { workingDaysEarlyOrLate: 3 }
});
assert.deepEqual(multiple.map(item => item.type), ['approval', 'forecast-late'], 'RSK-02 blocked gate and late forecast must both remain visible.');
assert.match(multiple[0].reason, /approval is pending/i, 'RSK-02 must retain the gate explanation.');
assert.match(multiple[1].reason, /3 working day/i, 'RSK-02 must retain the exact schedule explanation.');

console.log('TNA G11 RSK-01-RSK-02 fixtures passed: missing due date is Needs Information and simultaneous risks remain explained');
