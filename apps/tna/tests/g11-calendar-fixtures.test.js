const assert = require('assert').strict;
const { spawnSync } = require('child_process');
const path = require('path');
const scheduling = require('../src/scheduling.js');

const factory = { calendarId: 'factory', workingWeek: [0, 1, 2, 3, 4], holidays: [], shutdowns: [], revision: 4 };
const supplier = { calendarId: 'supplier', workingWeek: [1, 2, 3, 4, 5], holidays: ['2026-10-13'], shutdowns: [], revision: 9 };

assert.equal(scheduling.shiftDate('2026-10-16', 1, supplier, 'working'), '2026-10-19', 'CAL-01 Friday +1 must be Monday.');
assert.equal(scheduling.shiftDate('2026-10-12', 1, supplier, 'working'), '2026-10-14', 'CAL-02 must skip a confirmed holiday.');
assert.equal(scheduling.shiftDate('2026-10-14', 1, { ...supplier, holidays: [], shutdowns: ['2026-10-15'] }, 'working'), '2026-10-16', 'CAL-02 must skip a confirmed shutdown.');

const calendarsBefore = JSON.stringify([supplier, factory]);
const mixed = scheduling.schedule([
  { taskId: 'SUPPLIER', calendarId: 'supplier', durationUnits: 2, durationBasis: 'working', status: 'not-started' },
  { taskId: 'FACTORY', calendarId: 'factory', durationUnits: 1, durationBasis: 'working', status: 'not-started' }
], [
  { edgeId: 'handoff', predecessorTaskId: 'SUPPLIER', successorTaskId: 'FACTORY', relation: 'FS', lagUnits: 0, lagBasis: 'working' }
], { calendars: [supplier, factory], calendar: supplier, startDate: '2026-10-12', requiredDate: '2026-10-15' });
assert.equal(mixed.validity, 'valid', 'CAL-03 mixed-calendar schedule must be valid.');
assert.equal(mixed.taskResults.SUPPLIER.earlyFinish, '2026-10-14', 'CAL-03 supplier task must retain its own holiday calendar.');
assert.equal(mixed.taskResults.FACTORY.earlyStart, '2026-10-15', 'CAL-03 handoff must use the successor factory calendar.');
assert.deepEqual(mixed.calendarRevisions, [9, 4], 'CAL-03 provenance must retain both calendar revisions.');
assert.equal(JSON.stringify([supplier, factory]), calendarsBefore, 'CAL-03 scheduling must not mutate calendar inputs.');

const missingCalendar = scheduling.schedule([
  { taskId: 'UNKNOWN', calendarId: 'missing', durationUnits: 1, durationBasis: 'working', status: 'not-started' }
], [], { calendars: [supplier], calendar: supplier, startDate: '2026-10-12' });
assert.equal(missingCalendar.validity, 'incomplete', 'An explicit unknown calendar must fail closed.');
assert(missingCalendar.missingInputs.includes('calendar:UNKNOWN'), 'Unknown task calendar must be named as missing.');

const modulePath = path.resolve(__dirname, '../src/scheduling.js');
const probe = `const s=require(${JSON.stringify(modulePath)});process.stdout.write(JSON.stringify([s.shiftDate('2026-03-06',1,{workingWeek:[1,2,3,4,5]},'working'),s.finishFromStart('2028-02-28',2,{workingWeek:[1,2,3,4,5]},'calendar')]));`;
const civilResults = ['Pacific/Honolulu', 'Pacific/Kiritimati'].map(TZ => {
  const child = spawnSync(process.execPath, ['-e', probe], { env: { ...process.env, TZ }, encoding: 'utf8' });
  assert.equal(child.status, 0, `CAL-04 ${TZ} probe must exit successfully: ${child.stderr}`);
  return child.stdout;
});
assert.equal(civilResults[0], civilResults[1], 'CAL-04 civil dates must not drift across opposite-side timezones or DST.');
assert.equal(civilResults[0], '["2026-03-09","2028-02-29"]', 'CAL-04 timezone probe must preserve exact civil dates.');

assert.equal(scheduling.shiftDate('2026-12-31', 1, supplier, 'working'), '2027-01-01', 'CAL-05 year-end shift must be exact.');
assert.equal(scheduling.finishFromStart('2028-02-28', 2, supplier, 'calendar'), '2028-02-29', 'CAL-05 leap-day finish must be exact.');
assert.equal(scheduling.finishFromStart('2026-10-12', 0, supplier, 'working'), '2026-10-12', 'CAL-05 zero-day milestone must remain on its event date.');

console.log('TNA G11 CAL-01-CAL-05 fixtures passed: workweek, exceptions, mixed calendars, timezone/DST, leap/year-end/milestone');
