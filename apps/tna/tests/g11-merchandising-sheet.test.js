/**
 * TNA-GMR-01: garment-sheet pure projection and no-data-fabrication regression.
 * Run: node --test apps/tna/tests/g11-merchandising-sheet.test.js
 * Source and stored plan stay read-only; browser-specific interactions are separate.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const domain=require('../src/domain.js');
const {TnaMerchandisingSheet,LANGUAGES,FILTERS,COLUMNS}=require('../src/merchandising-sheet.js');

const input=(templateId)=>({templateId,buyerName:'SYNTHETIC BUYER',factoryName:'SYNTHETIC FACTORY',
  styleNo:'GMR-TEST-'+templateId,poNumber:'PO-TEST-'+templateId,totalQty:1000,
  orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2026-12-01'});
const sheet=new TnaMerchandisingSheet();
const clone=value=>JSON.parse(JSON.stringify(value));

test('knit and woven render all approved task instances without replacing calculation rules',()=>{
  for(const templateId of ['knit','woven']){
    const plan=domain.createPlan(input(templateId),{ownerUserId:'test-user'});
    const unchanged=JSON.stringify(plan);
    const data=sheet.snapshot(plan);
    const html=sheet.render(plan);
    assert.ok(data.rows.length>30,'full garment task list rather than a first-12 sample');
    assert.equal(data.rows.length,plan.tasks.length);
    assert.equal((html.match(/data-tna-ref=/g)||[]).length,plan.tasks.length);
    assert.equal((html.match(/data-edit-task=/g)||[]).length,plan.tasks.length);
    assert.match(html,/Master Sheet/);
    assert.match(html,/SYNTHETIC BUYER/);
    assert.match(html,/PO-TEST-/);
    assert.match(html,/GSM/);
    assert.match(html,/Master LC opened/);
    assert.match(html,/Required ex-factory/);
    assert.match(html,/data-tna-sheet-asof/);
    assert.equal(JSON.stringify(plan),unchanged,'render must never mutate domain records');
  }
});
test('missing dates, GSM, master LC and unsourced schedule remain unknown',()=>{
  const plan=domain.createPlan(input('knit'));
  const first=plan.tasks[0];
  const candidate={validity:'valid',taskResults:{[first.taskId]:{earlyFinish:'2026-10-22',isCritical:true}}};
  const view=sheet.snapshot(plan,{asOfDate:'2026-10-15',scheduled:candidate});
  assert.equal(view.rows[0].forecast,null,'unconfirmed calendar blocks inferred forecast');
  assert.equal(view.rows[0].critical,false,'unconfirmed calendar blocks inferred criticality');
  assert.equal(view.rows[0].delayDays,null);
  const html=sheet.render(plan,{asOfDate:'2026-10-15',scheduled:candidate});
  assert.match(html,/Needs Information/);
  assert.match(html,/Factory calendar is not confirmed/);
  assert.ok(!html.includes('2026-10-22'));
  assert.equal(view.counts.overdue,0,'unknown targets must not be called overdue');
});
test('explicit date-only review correctly separates overdue, this-week and actual delay',()=>{
  const plan=domain.createPlan(input('knit'));
  const [late,week,finished]=plan.tasks;
  late.dates.currentTargetFinish='2026-10-14';
  late.waitingFor='buyer';
  week.dates.currentTargetFinish='2026-10-16';
  week.waitingFor='local-office';
  finished.dates.baselineFinish='2026-10-13';
  finished.dates.currentTargetFinish='2026-10-14';
  finished.dates.actualFinish='2026-10-16';
  finished.status='completed';
  const asOf='2026-10-15';
  const all=sheet.snapshot(plan,{asOfDate:asOf});
  assert.equal(all.counts.overdue,1);
  assert.equal(all.counts.week,1);
  assert.equal(all.counts.buyer,1);
  assert.equal(all.counts.local,1);
  assert.equal(all.rows[2].delayDays,2);
  assert.equal(all.rows[2].planned,'2026-10-13','original baseline must remain distinct');
  assert.equal(all.rows[2].revised,'2026-10-14');
  assert.equal(all.rows[2].actual,'2026-10-16');
  for(const [filter,ref] of [['overdue',late.templateRef],['week',week.templateRef],['buyer',late.templateRef],['local',week.templateRef]]){
    const out=sheet.snapshot(plan,{asOfDate:asOf,filter});
    assert.deepEqual(out.selected.map(x=>x.ref),[ref]);
  }
  assert.equal(sheet.snapshot(plan,{asOfDate:'',filter:'overdue'}).selected.length,0,'no fabricated today');
});
test('confirmed calendar and valid schedule may expose calculated critical chain only',()=>{
  const plan=domain.createPlan(input('woven'));
  const a=plan.tasks[0];
  a.dates.currentTargetFinish='2026-10-20';
  const calculation={validity:'valid',taskResults:{[a.taskId]:{earlyFinish:'2026-10-20',isCritical:true}}};
  plan.calendars[0].source='reviewed-factory-calendar';
  const one=sheet.snapshot(plan,{scheduled:calculation,filter:'critical'});
  assert.equal(one.hasConfirmedCalendar,true);
  assert.equal(one.selected.length,1);
  assert.equal(one.selected[0].forecast,'2026-10-20');
  assert.equal(one.selected[0].onTrack,true);
  assert.equal(sheet.snapshot(plan,{scheduled:{...calculation,validity:'incomplete'},filter:'critical'}).selected.length,0);
});
test('all four languages have complete labels; text is escaped rather than interpreted',()=>{
  const plan=domain.createPlan({...input('knit'),buyerName:'<img src=x onerror=alert(1)>'});
  plan.tasks[0].title='<script>alert(2)</script>';
  const original=clone(plan);
  for(const l of ['en','bn','hi','ta']){
    const labels=LANGUAGES[l];
    for(const key of [...COLUMNS,'title','intro','missing','asOf','buyer','factory','po','style','fabric','gsm','exFactory','shipment'])
      assert.ok(labels[key],l+' missing translation '+key);
    for(const key of FILTERS)assert.ok(labels.filters[key],l+' missing filter '+key);
    for(const status of domain.STATUSES)assert.ok(labels.statuses[status],l+' missing status '+status);
    const html=sheet.render(plan,{language:l});
    assert.ok(!html.includes('<script>alert(2)</script>'));
    assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(html.includes('&lt;img'));
  }
  assert.deepEqual(plan,original,'language switching must not mutate buyer text, dates or status IDs');
});
test('root service worker inventories both local view assets and TNA still uses one shell',()=>{
  const root=path.resolve(__dirname,'../../..');
  const html=fs.readFileSync(path.join(root,'apps/tna/index.html'),'utf8');
  const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'apps/tna/assets/merchandising-sheet.css'),'utf8');
  assert.match(html,/merchandising-sheet\.js\?v=0\.2\.0/);
  assert.match(html,/merchandising-sheet\.css\?v=0\.1\.1/);
  assert.match(worker,/apps\/tna\/src\/merchandising-sheet\.js/);
  assert.match(worker,/apps\/tna\/assets\/merchandising-sheet\.css/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(html,/vesa-workspace-shell\.js/);
  assert.equal((html.match(/<header class="vesa-workspace"/g)||[]).length,0);
});
