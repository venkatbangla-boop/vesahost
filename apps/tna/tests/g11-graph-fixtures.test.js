const assert = require('assert').strict;
const scheduling = require('../src/scheduling.js');

const cal = { calendarId: 'factory', workingWeek: [1, 2, 3, 4, 5], holidays: [], shutdowns: [], revision: 1 };
const task = (taskId, durationUnits, extra = {}) => ({ taskId, durationUnits, durationBasis: 'working', status: 'not-started', calendarId: 'factory', ...extra });
const edge = (predecessorTaskId, successorTaskId, relation = 'FS', lagUnits = 0, extra = {}) => ({ edgeId: `${predecessorTaskId}-${successorTaskId}-${relation}`, predecessorTaskId, successorTaskId, relation, lagUnits, lagBasis: 'working', ...extra });

const diamondTasks = [task('A', 2), task('B', 3), task('C', 2), task('D', 1)];
const diamondEdges = [edge('A', 'B'), edge('A', 'C'), edge('B', 'D'), edge('C', 'D')];
const diamond = scheduling.schedule(diamondTasks, diamondEdges, { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-19' });
assert.equal(diamond.validity, 'valid', 'GPH-01 diamond graph must be valid.');
assert.deepEqual(diamond.project.criticalPaths, [['A', 'B', 'D']], 'GPH-01 must identify the controlling path.');
assert.equal(diamond.taskResults.C.floatDays, 1, 'GPH-01 non-controlling C must have one workday float.');

for (const badEdges of [
  [edge('A', 'A')],
  [edge('A', 'MISSING')],
  [edge('A', 'B'), edge('B', 'A')]
]) {
  const tasksBefore = JSON.stringify(diamondTasks), edgesBefore = JSON.stringify(badEdges);
  const rejected = scheduling.schedule(diamondTasks, badEdges, { calendars: [cal], calendar: cal, startDate: '2026-10-12' });
  assert.equal(rejected.validity, 'invalid', 'GPH-02 malformed graph must be rejected atomically.');
  assert.deepEqual(rejected.taskResults, {}, 'GPH-02 rejected graph must not emit a partial schedule.');
  assert.equal(JSON.stringify(diamondTasks), tasksBefore, 'GPH-02 rejection must preserve task input.');
  assert.equal(JSON.stringify(badEdges), edgesBefore, 'GPH-02 rejection must preserve edge input.');
}

const relationTasks = [task('S', 2), task('FS', 1), task('SS', 1), task('FF', 1), task('SF', 1), task('LEAD', 1)];
const relationResult = scheduling.schedule(relationTasks, [
  edge('S', 'FS'), edge('S', 'SS', 'SS', 1), edge('S', 'FF', 'FF', 1), edge('S', 'SF', 'SF', 1), edge('S', 'LEAD', 'FS', -1, { allowLead: true })
], { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-20' });
assert.equal(relationResult.taskResults.FS.earlyStart, '2026-10-14', 'GPH-03 FS+0 must start after predecessor finish.');
assert.equal(relationResult.taskResults.SS.earlyStart, '2026-10-13', 'GPH-03 SS+1 must use predecessor start.');
assert.equal(relationResult.taskResults.FF.earlyFinish, '2026-10-14', 'GPH-03 FF+1 must constrain successor finish.');
assert.equal(relationResult.taskResults.SF.earlyFinish, '2026-10-13', 'GPH-03 SF+1 must constrain successor finish from predecessor start.');
assert.equal(relationResult.taskResults.LEAD.earlyStart, '2026-10-13', 'GPH-03 an explicitly allowed one-day lead must overlap safely.');
assert.equal(scheduling.validateGraph(relationTasks, [edge('S', 'LEAD', 'FS', -1)]).ok, false, 'GPH-03 an unapproved lead must be rejected.');

const equalRoutes = scheduling.schedule([task('ROOT', 1), task('B1', 2), task('B2', 2), task('END', 1)], [edge('ROOT', 'B1'), edge('ROOT', 'B2'), edge('B1', 'END'), edge('B2', 'END')], { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-15' });
assert.deepEqual(equalRoutes.project.criticalPaths, [['ROOT', 'B1', 'END'], ['ROOT', 'B2', 'END']], 'GPH-04 both equal controlling routes must be identified.');

const conflict = scheduling.schedule([task('LONG', 5)], [], { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-14' });
assert.equal(conflict.taskResults.LONG.floatDays, -2, 'GPH-05 impossible required date must create negative float.');
assert.deepEqual(conflict.constraintViolations.map(item => item.type), ['required-date-miss'], 'GPH-05 deadline conflict must be explicitly classified.');
assert.match(conflict.constraintViolations[0].explanation, /2 working day/, 'GPH-05 violation must explain the exact miss.');

const missing = scheduling.schedule([task('UNKNOWN', null), task('NO-CALENDAR', 1, { calendarId: 'unknown' })], [], { calendars: [cal], calendar: cal, startDate: '2026-10-12' });
assert.equal(missing.validity, 'incomplete', 'GPH-06 missing duration/calendar must remain Needs Information.');
assert(missing.missingInputs.includes('duration:UNKNOWN') && missing.missingInputs.includes('calendar:NO-CALENDAR'), 'GPH-06 must name every missing input without guessing.');

const startMilestone = scheduling.schedule([task('GATE', 0, { milestoneEvent: 'start-of-day' }), task('WORK', 1)], [edge('GATE', 'WORK')], { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-12' });
const endMilestone = scheduling.schedule([task('GATE', 0, { milestoneEvent: 'end-of-day' }), task('WORK', 1)], [edge('GATE', 'WORK')], { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-13' });
assert.equal(startMilestone.taskResults.WORK.earlyStart, '2026-10-12', 'GPH-07 start-of-day milestone must permit explicit same-day handoff.');
assert.equal(endMilestone.taskResults.WORK.earlyStart, '2026-10-13', 'GPH-07 end-of-day milestone must hand off next workday.');

const overdue = scheduling.schedule(diamondTasks, diamondEdges, { calendars: [cal], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-19', asOfDate: '2026-10-16' });
assert.equal(overdue.taskResults.C.isOverdue, true, 'GPH-08 late open noncritical work must be overdue.');
assert.equal(overdue.taskResults.C.isCritical, false, 'GPH-08 overdue must remain distinct from criticality.');

const supplier = { calendarId: 'supplier', workingWeek: [1, 2, 3, 4, 5], holidays: ['2026-10-13'], shutdowns: [], revision: 2 };
const mixed = scheduling.schedule([task('SUP', 2, { calendarId: 'supplier' }), task('FACTORY', 2), task('JOIN', 1)], [edge('SUP', 'JOIN'), edge('FACTORY', 'JOIN')], { calendars: [cal, supplier], calendar: cal, startDate: '2026-10-12', requiredDate: '2026-10-16' });
assert.equal(mixed.taskResults.SUP.earlyFinish, '2026-10-14', 'GPH-09 supplier predecessor must retain its holiday calendar.');
assert.equal(mixed.taskResults.JOIN.earlyStart, '2026-10-15', 'GPH-09 multi-predecessor join must use the latest feasible handoff on its own calendar.');
assert.deepEqual(mixed.taskResults.JOIN.blockingPredecessors, ['SUP', 'FACTORY'], 'GPH-09 must retain both predecessor identities.');


// GMR-19: a long predecessor of SS/SF can outlast its short successor.
// Project forecast must take the LAST actual task finish rather than only
// terminal nodes. Reverse bounds must use start -> inclusive finish once.
for (const relation of ['SS','SF']) {
  const source=[task('LONG',5),task('SHORT',1)];
  const link=[edge('LONG','SHORT',relation,0)];
  const before=JSON.stringify({source,link});
  const network=scheduling.schedule(source,link,{calendars:[cal],calendar:cal,
    startDate:'2026-10-12',requiredDate:'2026-10-16'});
  assert.equal(network.validity,'valid',relation+' is a supported precedence');
  assert.equal(network.taskResults.LONG.earlyFinish,'2026-10-16');
  assert.equal(network.taskResults.SHORT.earlyFinish,'2026-10-12');
  assert.equal(network.project.forecastDate,'2026-10-16',
    relation+' cannot hide unfinished predecessor work behind a short successor');
  assert.equal(network.taskResults.LONG.lateStart,'2026-10-12',
    relation+' predecessor must finish by the buyer-selected endpoint');
  assert.equal(network.taskResults.LONG.floatDays,0);
  assert.equal(network.taskResults.LONG.isCritical,true);
  assert.equal(network.taskResults.SHORT.floatDays,4);
  assert.deepEqual(network.project.criticalPaths,[['LONG']]);
  assert.equal(JSON.stringify({source,link}),before,'Never mutate source network');
  const missed=scheduling.schedule(source,link,{calendars:[cal],calendar:cal,
    startDate:'2026-10-12',requiredDate:'2026-10-14'});
  assert.equal(missed.project.forecastDate,'2026-10-16');
  assert.equal(missed.project.workingDaysEarlyOrLate,2);
  assert.equal(missed.taskResults.LONG.floatDays,-2);
  assert.equal(missed.constraintViolations[0].type,'required-date-miss');
}
for(const relation of ['SS','SF']){
  const network=scheduling.schedule([task('ROOT',2),task('SUCCESSOR',1)],
    [edge('ROOT','SUCCESSOR',relation,1)],
    {calendars:[cal],calendar:cal,startDate:'2026-10-12',requiredDate:'2026-10-16'});
  assert.equal(network.taskResults.ROOT.lateStart,'2026-10-15',
    relation+'+1 predecessor latest start is Thursday, not Wednesday');
  assert.equal(network.taskResults.ROOT.lateFinish,'2026-10-16');
  assert.equal(network.taskResults.ROOT.floatDays,3,
    relation+'+1 source task has three working days of contractual slack');
}
assert.equal(diamond.project.forecastDate,'2026-10-19',
  'The original accepted FS diamond milestone forecast must not drift.');
assert.equal(diamond.taskResults.C.floatDays,1,
  'The original FS routing float must stay one working day.');


// GMR-20: free float is relation-specific (FS/SS successor start;
// FF/SF successor finish) and is limited by project float.
const freeFloatCases=[
  {relation:'FS',source:2,independent:4,expected:2},
  {relation:'SS',source:2,independent:3,expected:3},
  {relation:'FF',source:2,independent:3,expected:2},
  {relation:'SF',source:2,independent:3,expected:3}
];
for(const c of freeFloatCases){
  const source=[task('P',c.source),task('R',c.independent),task('Q',1)];
  const links=[edge('P','Q',c.relation,0),edge('R','Q','FS',0)];
  const original=JSON.stringify({source,links});
  const forecast=scheduling.schedule(source,links,{calendar:cal,calendars:[cal],
    startDate:'2026-10-12',requiredDate:'2026-10-16'});
  assert.equal(forecast.validity,'valid');
  assert.equal(forecast.taskResults.P.freeFloatDays,c.expected,
    c.relation+' should have source-based free float with another path controlling Q');
  assert.equal(JSON.stringify({source,links}),original,'Source graph must remain immutable');
}
const lagged=scheduling.schedule([task('P',2),task('Q',1)],
  [edge('P','Q','FS',1)],{calendar:cal,calendars:[cal],
    startDate:'2026-10-12',requiredDate:'2026-10-16'});
assert.equal(lagged.taskResults.Q.earlyStart,'2026-10-15');
assert.equal(lagged.taskResults.P.freeFloatDays,0,
  'FS +1 lag is binding; do not invent one unused buffer day.');
const bounded=scheduling.schedule([task('P',2),task('R',3),task('Q',1)],
  [edge('P','Q','SS',0),edge('R','Q','FS',0)],{calendar:cal,calendars:[cal],
    startDate:'2026-10-12'});
assert.equal(bounded.taskResults.P.floatDays,2);
assert.equal(bounded.taskResults.P.freeFloatDays,2,
  'No committed due date: free float cannot exceed current project float.');
assert.equal(diamond.taskResults.C.freeFloatDays,1,
  'GPH-01 FS/zero source route free float remains one day.');
assert.equal(mixed.taskResults.SUP.freeFloatDays,null,
  'GPH-09 mixed supplier/factory calendar must not invent free-float precision.');
assert(mixed.warnings.some(x=>x.includes('free float unavailable')),
  'GPH-09 mixed source uncertainty must be explicit in warnings.');

console.log('TNA G11 GPH-01-GPH-09 fixtures passed: graph rejection, relations/lead, critical routes, deadline conflict, missing inputs, milestones, overdue and mixed calendars');
