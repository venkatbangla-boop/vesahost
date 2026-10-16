/**
 * F25 source regression — visual bars must use actual date-only positions,
 * immutable baseline, current/actual and confirmed calendar forecast.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../../..');
const js=fs.readFileSync(path.join(root,'apps/tna/src/bootstrap.js'),'utf8');
const css=fs.readFileSync(path.join(root,'apps/tna/assets/tna.css'),'utf8');
assert(js.includes('class TnaDateScaledTimeline'));
for(const anchor of ['baselineSnapshots?.[0]','sourceReference','confirmedAt',
  "data-kind=","scheduling.fromDay(day)","TnaDateScaledTimeline.view(plan,ganttRows,data.scheduled,state.language)"])
  assert(js.includes(anchor),'Missing date-scale source '+anchor);
assert(!js.includes('--tna-bar:${Math.min(100,Math.max(8,(row.result?.floatDays??0)+12))}'),
  'Fake float-based Gantt bars must be removed.');
assert(css.includes('.tna-date-scale-scroll{max-width:100%;overflow-x:auto'));
assert(css.includes('.tna-date-offday'));
console.log('TNA F25 SOURCE PASS: actual date-axis, confirmed-only CPM bars and scoped mobile scroll.');
