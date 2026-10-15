const scheduling = require('../src/scheduling.js');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const cal = { calendarId: 'bd-default', workingWeek: [1, 2, 3, 4, 5], holidays: [], shutdowns: [], revision: 1 };

assert(scheduling.nextWorkingDate('2026-10-10', cal, true) === '2026-10-12', 'CAL-01 weekend should roll to Monday.');
assert(scheduling.shiftDate('2026-10-16', 1, cal, 'working') === '2026-10-19', 'CAL-01 Friday +1 working day should be Monday.');
const holidayCal = { ...cal, holidays: ['2026-10-15'], revision: 2 };
assert(scheduling.shiftDate('2026-10-14', 1, holidayCal, 'working') === '2026-10-16', 'CAL-02 holiday should be skipped.');
assert(scheduling.finishFromStart('2028-02-28', 2, cal, 'calendar') === '2028-02-29', 'CAL-05 leap-day calendar duration should be exact.');
assert(scheduling.finishFromStart('2026-10-12', 0, cal, 'working') === '2026-10-12', 'CAL-05 zero-day milestone should stay on its date.');

const tasks = [
  { taskId: 'A', title: 'A', durationUnits: 2, durationBasis: 'working', status: 'not-started' },
  { taskId: 'B', title: 'B', durationUnits: 3, durationBasis: 'working', status: 'not-started' },
  { taskId: 'C', title: 'C', durationUnits: 2, durationBasis: 'working', status: 'not-started' },
  { taskId: 'D', title: 'D', durationUnits: 1, durationBasis: 'working', status: 'not-started' }
];
const edges = [
  { edgeId: 'AB', predecessorTaskId: 'A', successorTaskId: 'B', relation: 'FS', lagUnits: 0, lagBasis: 'working' },
  { edgeId: 'AC', predecessorTaskId: 'A', successorTaskId: 'C', relation: 'FS', lagUnits: 0, lagBasis: 'working' },
  { edgeId: 'BD', predecessorTaskId: 'B', successorTaskId: 'D', relation: 'FS', lagUnits: 0, lagBasis: 'working' },
  { edgeId: 'CD', predecessorTaskId: 'C', successorTaskId: 'D', relation: 'FS', lagUnits: 0, lagBasis: 'working' }
];
const result = scheduling.schedule(tasks, edges, { calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-19', asOfDate: '2026-10-10' });
assert(result.validity === 'valid', `GPH-01 should be valid: ${result.errors.join(', ')}`);
assert(result.taskResults.A.earlyStart === '2026-10-12', 'A starts Monday 2026-10-12.');
assert(result.taskResults.A.earlyFinish === '2026-10-13', 'A finishes Tuesday 2026-10-13.');
assert(result.taskResults.B.earlyStart === '2026-10-14', 'B starts Wednesday 2026-10-14.');
assert(result.taskResults.B.earlyFinish === '2026-10-16', 'B finishes Friday 2026-10-16.');
assert(result.taskResults.C.earlyFinish === '2026-10-15', 'C finishes Thursday 2026-10-15.');
assert(result.taskResults.D.earlyStart === '2026-10-19', 'D starts Monday 2026-10-19.');
assert(result.taskResults.C.floatDays === 1, 'C should have 1 working day routing float.');
assert(JSON.stringify(result.project.criticalPaths) === JSON.stringify([['A', 'B', 'D']]), 'A→B→D should be the controlling path.');

const holidayResult = scheduling.schedule(tasks, edges, { calendar: holidayCal, startDate: '2026-10-12', requiredDate: '2026-10-19' });
assert(holidayResult.taskResults.B.earlyFinish === '2026-10-19', 'Holiday fixture B should finish Monday 2026-10-19.');
assert(holidayResult.taskResults.D.earlyFinish === '2026-10-20', 'Holiday fixture D should finish Tuesday 2026-10-20.');
assert(holidayResult.project.workingDaysEarlyOrLate === 1, 'Holiday fixture should slip 1 working day.');
assert(holidayResult.taskResults.D.floatDays === -1, 'Holiday fixture should expose negative float without changing baseline.');

const invalid = scheduling.validateGraph(tasks, [{ edgeId: 'self', predecessorTaskId: 'A', successorTaskId: 'A', relation: 'FS', lagUnits: 0 }]);
assert(!invalid.ok && invalid.errors.some(error => error.includes('itself')), 'GPH-02 self-link must be rejected.');
const missing = scheduling.schedule([{ taskId: 'X', durationUnits: null, status: 'not-started' }], [], { calendar: cal, startDate: '2026-10-12' });
assert(missing.validity === 'incomplete' && missing.missingInputs.includes('duration:X'), 'GPH-06 missing duration should be incomplete, not guessed.');

// GMR-16: buyer deadlines can land on a weekend; calendar arithmetic
// must terminate without rolling signed contractual targets or baselines.
const strict = require('node:assert/strict');
strict.equal(scheduling.workdayDifference('2026-10-16', '2026-10-18', cal, 'working'), 0,
  'Friday-to-Sunday has zero intervening working days.');
strict.equal(scheduling.workdayDifference('2026-10-18', '2026-10-19', cal, 'working'), 1,
  'Sunday-to-Monday is exactly one working day.');
strict.equal(scheduling.workdayDifference('2026-10-19', '2026-10-18', cal, 'working'), -1,
  'The reverse deadline comparison retains its sign.');
strict.equal(scheduling.workdayDifference('2026-10-16', '2026-10-19', cal, 'working'), 1,
  'Friday-to-Monday remains one working day as before.');
strict.equal(scheduling.workdayDifference('2026-10-16', '2026-10-18', cal, 'calendar'), 2,
  'Calendar-day difference must still count weekend days.');
strict.equal(scheduling.workdayDifference('2026-10-14', '2026-10-16', holidayCal, 'working'), 1,
  'Declared holiday must never be counted as a working day.');
strict.throws(()=>scheduling.workdayDifference('2026-10-12','2026-10-15',
  {...cal,workingWeek:[]},'working'),/nonempty working week/i,
  'Empty workweek must not be misrepresented as zero float.');
const weekendDue=scheduling.schedule(tasks,edges,{
  calendar:cal,startDate:'2026-10-12',requiredDate:'2026-10-18'
});
strict.equal(weekendDue.validity,'valid','Weekend buyer target remains a valid contractual date.');
strict.equal(weekendDue.project.forecastDate,'2026-10-19',
  'The forecast stays on the computed Monday without rewriting buyer target.');
strict.equal(weekendDue.project.requiredDate,'2026-10-18',
  'Buyer Sunday deadline stays unchanged in report provenance.');
strict.equal(weekendDue.project.workingDaysEarlyOrLate,1,
  'The Monday forecast is one factory working day late against Sunday delivery.');

const mixed = [
  { taskId: 'S', durationUnits: 2, durationBasis: 'working', status: 'not-started' },
  { taskId: 'SS', durationUnits: 1, durationBasis: 'working', status: 'not-started' },
  { taskId: 'FF', durationUnits: 1, durationBasis: 'working', status: 'not-started' },
  { taskId: 'SF', durationUnits: 1, durationBasis: 'working', status: 'not-started' }
];
const mixedEdges = [
  { edgeId: 'ss', predecessorTaskId: 'S', successorTaskId: 'SS', relation: 'SS', lagUnits: 1, lagBasis: 'working' },
  { edgeId: 'ff', predecessorTaskId: 'S', successorTaskId: 'FF', relation: 'FF', lagUnits: 1, lagBasis: 'working' },
  { edgeId: 'sf', predecessorTaskId: 'S', successorTaskId: 'SF', relation: 'SF', lagUnits: 1, lagBasis: 'working' }
];
const mixedResult = scheduling.schedule(mixed, mixedEdges, { calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-16' });
assert(mixedResult.taskResults.SS.earlyStart === '2026-10-13', 'GPH-03 SS +1 should start one workday after predecessor start.');
assert(mixedResult.taskResults.FF.earlyFinish === '2026-10-14', 'GPH-03 FF +1 should finish one workday after predecessor finish.');
assert(mixedResult.taskResults.SF.earlyFinish === '2026-10-13', 'GPH-03 SF +1 should finish one workday after predecessor start.');

console.log('TNA G03 scheduling checks passed');
