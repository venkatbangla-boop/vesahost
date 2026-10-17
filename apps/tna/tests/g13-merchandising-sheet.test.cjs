/* Source-only G13: synthetic knit, woven, denim; no buyer or bank approval. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Model=require('../src/merchandising-sheet.js');
const Domain=require('../src/domain.js'),Schedule=require('../src/scheduling.js');
const source=fs.readFileSync(path.resolve(__dirname,'../src/merchandising-sheet.js'),'utf8');
assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|indexedDB|localStorage|sessionStorage)\b/);
assert.equal(Model.FILTERS.length,8);
assert.equal(Model.date('2026-02-29'),null);
assert.equal(Model.date('2028-02-29'),'2028-02-29');
assert.equal(Model.daysBetween('2026-10-15','2026-10-19'),4);
assert.equal(Model.daysBetween(null,'2026-10-19'),null);
const plans=[];
for(const templateId of ['knit','woven','denim']){
 const plan=Domain.createPlan({templateId,orderConfirmedOn:'2026-10-01',
  buyerName:'SYNTHETIC <Buyer>',factoryName:'SYNTHETIC Factory',
  styleNo:'SYN-STYLE-'+templateId,poNumber:'SYN-PO-'+templateId,
  buyerRequiredExFactory:'2027-02-10',totalQty:1000,fabricSpec:'SYN FABRIC 210 GSM',
  colorSizeBreakdown:'Navy | S | 250\nNavy | M | 350\nBlack | L | 400',
  commercialNotes:'<script>alert(1)</script>'},{ownerUserId:'synthetic-merch-user'});
 assert(Domain.validatePlan(plan).ok,'Valid original '+templateId+' schema');
 const before=JSON.stringify(plan);
 const result=Schedule.schedule(plan.tasks,plan.edges,{calendar:plan.calendars[0],
  calendars:plan.calendars,startDate:plan.commitments.orderConfirmedOn,
  requiredDate:plan.commitments.buyerRequiredExFactory});
 assert.equal(result.validity,'valid');
 const rows=Model.rows(plan,result);
 assert.equal(rows.length,plan.tasks.length);
 assert(rows.some(row=>row.critical===true));
 assert(rows.every(row=>row.baseline===null&&row.target===null&&row.forecast===null&&row.actual===null&&row.delay===null));
 assert.equal(Model.filterRows(rows,'overdue','').length,0);
 assert.equal(Model.filterRows(rows,'week','2026-10-17').length,0);
 for(const [language,title] of [['en','Garment TNA Master Sheet'],['bn','গার্মেন্টস TNA মাস্টার শিট'],
  ['hi','गारमेंट TNA मास्टर शीट'],['ta','கார்மெண்ட் TNA மாஸ்டர் ஷீட்']]){
  const html=Model.render(plan,result,{language,filter:'all'});
  assert(html.includes(title));
  assert(html.includes('SYN-PO-'+templateId)&&html.includes('SYN FABRIC 210 GSM'));
  assert(html.includes('data-tna-sheet-task'));
  assert(html.includes('aria-label="Full garment TNA activity sheet"'));
  assert(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert(!html.includes('<script>alert(1)</script>'));
  assert(html.includes('Needs Information'),'Unknown GSM/approval/LC cannot be invented');
 }
 assert.equal(JSON.stringify(plan),before,'Pure read-only sheet');
 plans.push(plan);
}
const p=plans[0],one=p.tasks[0],two=p.tasks[1];
one.dates.baselineFinish='2026-10-10';
one.dates.currentTargetFinish='2026-10-14';
one.dates.forecastFinish='2026-10-16';
one.dates.actualFinish='2026-10-18';
one.status='completed';
one.proofRefs=['SYN TASK COMPLETION EVIDENCE'];one.delayReason='SYN internal status note';
two.dates.baselineFinish='2026-10-20';two.dates.currentTargetFinish='2026-10-21';
two.status='awaiting-approval';two.ownerParty='buyer';
const before=JSON.stringify(p),rows=Model.rows(p,null);
assert.equal(rows[0].delay,8);
assert.equal(rows[1].delay,1);
assert.equal(rows[0].actual,'2026-10-18');
assert.equal(rows[0].forecast,'2026-10-16');
assert.equal(rows[0].target,'2026-10-14');
assert.equal(rows[0].baseline,'2026-10-10');
assert.equal(Model.filterRows(rows,'overdue','2026-10-17').some(r=>r.task.taskId===one.taskId),false);
assert.equal(Model.filterRows(rows,'week','2026-10-17').some(r=>r.task.taskId===two.taskId),true);
assert.equal(Model.filterRows(rows,'buyerWait','2026-10-17').some(r=>r.task.taskId===two.taskId),true);
assert.equal(Model.filterRows(rows,'localWait','2026-10-17').length,0);
assert.equal(Model.filterRows(rows,'critical','2026-10-17').length,0);
const html=Model.render(p,null,{language:'en',filter:'all',asOf:'2026-10-17'});
for(const x of ['SYN TASK COMPLETION EVIDENCE','2026-10-10','2026-10-14','2026-10-16','2026-10-18'])assert(html.includes(x));
assert.equal(JSON.stringify(p),before);
console.log('TNA G13 Master Sheet Node PASS: synthetic knit/woven/denim, source dates & criticals, eight filters, four languages, XSS escaping, no domain mutation.');
