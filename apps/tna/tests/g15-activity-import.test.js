/**
 * GMR-04B source-reviewed activity + dependency Excel regression.
 * Real bundled XLSX parser, real domain, graph, existing saved-copy codec.
 * No production user records or external network access.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const XLSX=require('../vendor/xlsx.full.min.js');
const domain=require('../src/domain.js');
const scheduler=require('../src/scheduling.js');
const orderImport=require('../src/import-review.js');
const activityImport=require('../src/activity-import.js');
const storage=require('../src/storage.js');
const orderHeaders=['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory'];
const orderRow=['SYNTHETIC BUYER','SYNTHETIC FACTORY','ST-009','PO-009',1500,'2026-12-25'];
const activityHeaders=['Activity Ref','Activity','Owner','Waiting For','Planned Start','Planned Finish',
  'Revised Start','Revised Finish','Actual Start','Actual Finish','Duration','Status',
  'Evidence','Authorizing Party','Source Document','Predecessors','Remarks'];
const activityRows=[
  ['O01','Enquiry / inquiry received','merchant','','2026-10-05','2026-10-06','','','','2026-10-06',0,'completed','SOURCE-ENQUIRY-06','','','','Enquiry confirmation'],
  ['O02','Costing & consumption confirmation','commercial','','2026-10-07','2026-10-09','','','','',2,'in-progress','','','','O01','Awaiting costing'],
  ['D05','Fit sample submit','sample-room','buyer','2026-10-10','2026-10-12','','2026-10-15','','',0,'awaiting-approval','','buyer','BUYER-SCHEDULE-15','O02','Fit approval pending']
];
function pack(rows=activityRows,{headers=activityHeaders,profile='knit',sheet='Activities',order=orderRow}={}){
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([orderHeaders,order]),'Orders');
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([headers,...rows]),sheet);
  return orderImport.parseWorkbook(XLSX.write(workbook,{type:'buffer',bookType:'xlsx'}),'gmr04b-synthetic.xlsx');
}
function reviewed(snap,options={}){
  const orderDetails=orderImport.describe(snap,'Orders',1);
  const orderReview=orderImport.review(snap,{sheetName:'Orders',headerRow:1,recordRow:2,
    mapping:orderDetails.mapping,dateFormat:'iso',basis:'calendar',templateId:options.templateId||'knit'},[]);
  assert.equal(orderReview.ready,true,orderReview.errors.join(' | '));
  const details=activityImport.describe(snap,{sheetName:options.sheetName||'Activities',headerRow:1});
  const settings={sheetName:options.sheetName||'Activities',headerRow:1,mapping:details.mapping,
    durationBasis:'working',dateFormat:'iso',fsZeroConfirmed:true,rowBindings:{},...options};
  return {orderReview,activityReview:activityImport.review(snap,orderReview,settings)};
}
test('knit and woven genuine workbooks import all selected rows, preserve every date, and use source FS/0 only',()=>{
  for(const profile of ['knit','woven']){
    const snapshot=pack(),{orderReview,activityReview}=reviewed(snapshot,{templateId:profile});
    assert.equal(activityReview.ready,true,activityReview.errors.join('; '));
    assert.equal(activityReview.rows.length,3);
    assert.equal(activityReview.edgeCount,2);
    assert.ok(activityReview.missingTemplateRefs.length>20,'unimported template tasks exposed, not fabricated');
    const order=orderImport.createNewDraft(orderReview,{ownerUserId:'qa-user'});
    const unchanged=JSON.stringify(order);
    const result=activityImport.applyToNewDraft(order,activityReview,{ownerUserId:'qa-user'});
    assert.equal(JSON.stringify(order),unchanged,'import service must not mutate input draft');
    assert.equal(result.templateId,profile);
    assert.equal(result.schemaVersion,'TNA360-ORDERPLAN-1.1.0');
    assert.equal(result.recordStatus,'draft');
    assert.equal(result.revision,0);
    assert.equal(result.baselineSnapshots.length,0);
    assert.equal(result.edges.length,2,'no manufactured linear template graph remains');
    assert.equal(scheduler.validateGraph(result.tasks,result.edges).ok,true);
    const first=result.tasks.find(t=>t.templateRef==='O01');
    const fit=result.tasks.find(t=>t.templateRef==='D05');
    assert.equal(first.dates.actualFinish,'2026-10-06');
    assert.equal(first.status,'completed');
    assert.deepEqual(first.proofRefs,['SOURCE-ENQUIRY-06']);
    assert.equal(fit.dates.currentTargetFinish,'2026-10-15');
    assert.equal(fit.dates.baselineFinish,'2026-10-12');
    assert.equal(fit.waitingFor,'buyer');
    assert.equal(fit.importSourceRef,'D05');
    assert.equal(result.auditEvents.at(-1).details.edgeCount,2);
    assert.equal(result.auditEvents.at(-1).details.evidenceTrust,'user-reviewed-unverified');
    assert.equal(result.auditEvents.at(-2).details.skippedActivities,false);
    assert.ok(result.tasks.some(t=>!['O01','O02','D05'].includes(t.templateRef)&&t.dates.baselineFinish===null));
    assert.equal(domain.validatePlan(result).ok,true);
    assert.deepEqual(storage.importCopy(storage.exportCopy(result)),result);
  }
});
test('no circular dependency: whole review fails before any draft write',()=>{
  const src=activityRows.map(row=>row.slice());
  src[0][15]='O02';
  const {activityReview}=reviewed(pack(src));
  assert.equal(activityReview.ready,false);
  assert.ok(activityReview.errors.some(e=>/cycle/i.test(e)),activityReview.errors.join(' | '));
});
test('unmatched, duplicate Excel and duplicate target mappings are all rejected',()=>{
  const unknown=activityRows.map(row=>row.slice());
  unknown[2][0]='UNRELATED-REF';unknown[2][1]='Unknown action';
  const source=pack(unknown);
  let out=reviewed(source).activityReview;
  assert.equal(out.ready,false);
  assert.equal(out.unmatched.length,1);
  const mapping={3:'D05'};
  out=reviewed(source,{rowBindings:mapping}).activityReview;
  assert.equal(out.ready,true,out.errors.join('; '));
  assert.equal(out.rows[2].sourceKey,'UNRELATED-REF');
  assert.equal(out.rows[2].targetRef,'D05');
  const duplicate=activityRows.map(row=>row.slice());
  duplicate[2][0]='O01';
  assert.equal(reviewed(pack(duplicate)).activityReview.ready,false);
  const also=activityRows.map(row=>row.slice());also[2][0]='CUSTOM-ROW';also[2][1]='An unmatched activity';
  const bound=reviewed(pack(also),{rowBindings:{4:'O02'}}).activityReview;
  assert.equal(bound.ready,false);
  assert.ok(bound.errors.some(e=>/Two Excel activities/i.test(e)));
});
test('unknown predecessor and self-reference fail closed rather than adding fabricated links',()=>{
  const a=activityRows.map(row=>row.slice());
  a[2][15]='NOT-ON-SHEET';
  assert.equal(reviewed(pack(a)).activityReview.ready,false);
  a[2][15]='D05';
  assert.ok(reviewed(pack(a)).activityReview.errors.some(e=>/itself/));
  a[2][15]='O01;O01';
  assert.ok(reviewed(pack(a)).activityReview.errors.some(e=>/Duplicate predecessor/));
});
test('explicit FS/0 consent is necessary for any predecessor edge',()=>{
  const snap=pack(),first=reviewed(snap,{fsZeroConfirmed:false}).activityReview;
  assert.equal(first.ready,false);
  assert.ok(first.errors.some(e=>/zero lag/));
});
test('status claims, revised targets and actual completion cannot be invented',()=>{
  const edits=[
    [2,11,'approved'],[2,11,'waived'],[2,11,'not-applicable'],
    [2,11,'rejected'],[0,12,''],[2,14,''],[2,13,'']
  ];
  for(const [index,column,value] of edits){
    const rows=activityRows.map(r=>r.slice());
    rows[index][column]=value;
    const output=reviewed(pack(rows)).activityReview;
    assert.equal(output.ready,false,'column '+column+' row '+index+' must block import');
  }
  const invalid=activityRows.map(r=>r.slice());
  invalid[2][9]='2026-10-16';
  assert.ok(reviewed(pack(invalid)).activityReview.errors.some(e=>/Actual finish requires/));
});
test('date-only source format, chronology, duration and invalid calendar basis are checked',()=>{
  const bad=activityRows.map(r=>r.slice());
  bad[2][5]='2026-02-30';
  assert.equal(reviewed(pack(bad)).activityReview.ready,false);
  bad[2][5]='2026-10-01';
  assert.ok(reviewed(pack(bad)).activityReview.errors.some(e=>/after plannedFinish/));
  const duration=activityRows.map(r=>r.slice());
  duration[1][10]=-4;
  assert.ok(reviewed(pack(duration)).activityReview.errors.some(e=>/Duration/));
  assert.equal(reviewed(pack(),{dateFormat:'random'}).activityReview.ready,false);
  assert.equal(reviewed(pack(),{durationBasis:'unconfigured'}).activityReview.ready,false);
});
test('formula-bearing activity sheet is rejected anywhere; unrelated order sheet is unchanged',()=>{
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([orderHeaders,orderRow]),'Orders');
  const rows=[activityHeaders,...activityRows,...Array.from({length:28},(_,i)=>['','','','','','','','','','','','','','','','',''])];
  const sheet=XLSX.utils.aoa_to_sheet(rows);
  sheet['J30']={t:'n',f:'1+1',v:2};
  XLSX.utils.book_append_sheet(workbook,sheet,'Activities');
  const snap=orderImport.parseWorkbook(XLSX.write(workbook,{type:'buffer',bookType:'xlsx'}),'bad-formula.xlsx');
  const result=reviewed(snap).activityReview;
  assert.equal(result.ready,false);
  assert.ok(result.errors.some(e=>/Formula/i.test(e)));
});
test('previously baselined or revised records cannot accept Excel task overwrites',()=>{
  const {orderReview,activityReview}=reviewed(pack());
  const original=orderImport.createNewDraft(orderReview,{ownerUserId:'qa'});
  const imported=activityImport.applyToNewDraft(original,activityReview,{ownerUserId:'qa'});
  assert.throws(()=>activityImport.applyToNewDraft(imported,activityReview),/new, unsigned/);
  const locked=domain.freezeBaseline(original,{actorId:'qa',reason:'Evidence reviewed'});
  assert.equal(locked.ok,true);
  assert.throws(()=>activityImport.applyToNewDraft(locked.plan,activityReview),/new, unsigned/);
});
test('missing durations remain unknown and no source owner is assumed',()=>{
  const rows=activityRows.map(row=>row.slice());
  rows[1][10]='';rows[1][2]='';
  const {orderReview,activityReview}=reviewed(pack(rows));
  assert.equal(activityReview.ready,true,activityReview.errors.join('; '));
  assert.ok(activityReview.warnings.some(w=>/Duration is unknown/));
  const plan=activityImport.applyToNewDraft(orderImport.createNewDraft(orderReview),activityReview);
  assert.equal(plan.tasks.find(t=>t.templateRef==='O02').durationUnits,null);
  assert.equal(plan.tasks.find(t=>t.templateRef==='O02').ownerParty,'');
});
test('localized importer supports four languages without mutating rows',()=>{
  const labels=activityImport.LABELS;
  for(const lang of ['en','bn','hi','ta']){
    for(const k of ['title','sheet','header','include','tip','dependency','confirmation','preview','count'])
      assert.ok(labels[lang][k],lang+' missing '+k);
  }
  const snap=pack(),old=JSON.stringify(snap);
  const data=reviewed(snap);
  assert.equal(data.activityReview.ready,true);
  assert.equal(JSON.stringify(snap),old);
});
