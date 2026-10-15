/**
 * GMR-05 R02: buyer-safe report model and genuine XLSX regression.
 * Synthetic inputs only. Treat every source field as potentially private,
 * including an ostensibly buyer-facing template task's edited title or proof.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const expectedSheets=['Report Summary','Order Summary','Report Activities','Buyer Milestones','Buyer Actions','Report Notes'];
const secrets=[
 'SECRET-FACTORY-IDENTITY','SECRET-LC-PROOF-999','SECRET-FOB-MARGIN-PRICE',
 'SECRET-FACTORY-COMMENTS','SECRET-EDITED-MILESTONE-NAME',
 'SECRET-APPROVAL-PROOF','SECRET-INTERNAL-VALIDATION','SECRET-B2B-PAYMENT'
];
function fixture(profile='knit'){
 const plan=domain.createPlan({
   templateId:profile,buyerName:'SYNTHETIC BUYER',factoryName:secrets[0],
   styleNo:'BUYER-R02-STYLE',poNumber:'BUYER-R02-PO',totalQty:2400,
   buyerRequiredExFactory:'2026-12-15'
 },{ownerUserId:'qa-agent'});
 plan.order.commercialNotes=secrets[2];
 plan.order.fabricSpec=secrets[3];
 plan.order.pricingDetails=secrets[2];
 plan.commitments.masterLcProofRef=secrets[1];
 plan.commitments.masterLcStatus=secrets[7];
 plan.unknownFields=[secrets[6]];
 plan.validation={ok:true,errors:[],warnings:[secrets[6]]};
 plan.materials=[{note:secrets[7]}];
 plan.approvals=[{decisionDate:'2026-10-05',evidenceRef:secrets[5]}];
 const fit=plan.tasks.find(task=>task.templateRef==='D08');
 assert.ok(fit,'synthetic garment profile should contain canonical fit approval');
 fit.title=secrets[4];
 fit.ownerParty=secrets[3];
 fit.followUpNote=secrets[3];
 fit.delayReason=secrets[3];
 fit.proofRefs=[secrets[5]];
 fit.waitingFor='buyer';
 fit.status='awaiting-approval';
 fit.dates.baselineFinish='2026-11-12';
 fit.dates.currentTargetFinish='2026-11-16';
 fit.dates.forecastFinish='2026-11-18';
 fit.dates.actualFinish=null;
 const pp=plan.tasks.find(task=>task.templateRef==='D14');
 if(pp){
   pp.status='approved'; // no authorized approval evidence: only source-reported
   pp.ownerParty='buyer'; // owner alone must not fabricate buyer action
   pp.waitingFor='';
 }
 const finance=plan.tasks.find(task=>task.templateRef==='O03');
 assert.ok(finance);
 finance.title=secrets[2];
 finance.waitingFor='buyer';
 finance.dates.currentTargetFinish='2026-12-19';
 return plan;
}
function checkNoDisclosure(payload,label){
 const text=typeof payload==='string'?payload:JSON.stringify(payload);
 for(const secret of secrets)assert.ok(!text.includes(secret),label+' exposed '+secret);
 assert.ok(!text.includes('O03'),label+' exposed private FOB activity');
 assert.ok(!text.includes('Master LC evidence'),label+' exposed finance LC label');
}
test('R02 only includes canonical buyer milestones, explicit buyer actions, no source secrets for knit/woven and all four languages',()=>{
 for(const profile of ['knit','woven']){
  for(const lang of ['en','bn','hi','ta']){
   const plan=fixture(profile),before=JSON.stringify(plan);
   const model=reports.buildReportModel(plan,{reportId:'R02',language:lang,
     generatedAt:'2026-10-15T05:00:00.000Z',timezone:'Asia/Dhaka'});
   assert.equal(model.reportId,'R02');
   assert.equal(model.masterSheet,null,'factory master sheet must not be projected');
   assert.equal(model.order.factory,model.buyerTna.labels.unknown);
   assert.equal(model.order.buyer,'SYNTHETIC BUYER');
   assert.equal(model.order.style,'BUYER-R02-STYLE');
   assert.equal(model.order.quantity,2400);
   assert.equal(model.order.requiredExFactory,'2026-12-15');
   assert.equal(model.buyerTna.requestedExFactory,'2026-12-15');
   assert.equal(model.buyerTna.buyerConfirmedTarget,null,
     'no independent buyer-verified target is available in local source');
   assert.ok(model.buyerTna.milestones.length>15);
   assert.ok(model.buyerTna.milestones.every(row=>row.ref&&row.title&&!row.title.includes('SECRET')));
   assert.ok(model.buyerTna.milestones.every(row=>row.verification));
   assert.ok(model.buyerTna.actions.some(row=>row.ref==='D08'));
   assert.ok(!model.buyerTna.actions.some(row=>row.ref==='D14'),
     'template owner buyer alone is NOT a source-confirmed buyer action');
   assert.ok(!model.buyerTna.actions.some(row=>row.ref==='O03'),
     'finance action even with buyer waiting state is forbidden');
   const fit=model.buyerTna.milestones.find(row=>row.ref==='D08');
   assert.equal(fit.original,'2026-11-12');
   assert.equal(fit.current,'2026-11-16');
   assert.equal(fit.forecast,'2026-11-18');
   assert.equal(fit.actual,null);
   assert.ok(fit.buyerAction);
   assert.ok(fit.verification.includes(model.buyerTna.labels.recorded));
   const approved=model.buyerTna.milestones.find(row=>row.ref==='D14');
   if(approved)assert.match(approved.status,/reported|উৎস|दर्ज|பதிவு/i);
   assert.ok(model.warnings.some(w=>w===model.buyerTna.labels.noTarget));
   assert.equal(model.tasks.length,model.buyerTna.milestones.length);
   assert.ok(model.tasks.every(task=>['not-started','in-progress','submitted','awaiting-approval','approved','rejected','blocked','completed','waived','not-applicable'].includes(task.status)),
     'backward-compatible report task status IDs must not be replaced by display translations');
   assert.ok(model.tasks.every(t=>!t.owner&&t.risk==='needs-information'));
   checkNoDisclosure(model,profile+' '+lang+' JSON');
   assert.equal(JSON.stringify(plan),before,'pure buyer projection cannot mutate stored TNA');
  }
 }
});
test('R02 Excel has typed milestone dates, requested actions and zero private cells/formulas',()=>{
 const plan=fixture(),original=JSON.stringify(plan);
 for(const lang of ['en','bn','hi','ta']){
  const model=reports.buildReportModel(plan,{reportId:'R02',language:lang,generatedAt:'2026-10-15T05:00:00.000Z'});
  const workbook=XLSX.read(storage.exportReportWorkbook(model),
    {type:'buffer',cellFormula:true,cellStyles:true});
  assert.deepEqual(workbook.SheetNames,expectedSheets);
  assert.equal(workbook.Sheets['Buyer Milestones']['!autofilter'].ref,
    workbook.Sheets['Buyer Milestones']['!ref']);
  assert.ok(workbook.Sheets['Buyer Milestones']['!cols'][1].wch>=40);
  const rows=XLSX.utils.sheet_to_json(workbook.Sheets['Buyer Milestones'],{header:1,raw:true});
  assert.equal(rows[0][1],model.buyerTna.labels.milestone);
  assert.equal(rows.length,model.buyerTna.milestones.length+1);
  const fit=rows.find(row=>row[0]==='D08');
  assert.ok(fit&&typeof fit[2]==='number'&&typeof fit[3]==='number'&&typeof fit[4]==='number',
    'source civil dates must become genuine typed Excel dates');
  assert.equal(fit[6],model.buyerTna.milestones.find(x=>x.ref==='D08').status);
  const acts=XLSX.utils.sheet_to_json(workbook.Sheets['Buyer Actions'],{header:1,raw:true});
  assert.ok(acts.some(row=>row[0]==='D08'));
  assert.equal(acts.find(row=>row[0]===model.buyerTna.labels.confirmed)[1],
    model.buyerTna.labels.unknown,'verified target stays unknown');
  const order=XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1,raw:true});
  assert.equal(order[1][1],model.buyerTna.labels.unknown,'factory name cannot be in buyer workbook');
  assert.equal(order[1][4],2400,'quantity must remain numeric');
  checkNoDisclosure(Object.values(workbook.Sheets).flatMap(sheet=>
    Object.entries(sheet).filter(([key])=>!key.startsWith('!')).map(([,value])=>value.v)),
    lang+' Excel');
  for(const [name,sheet] of Object.entries(workbook.Sheets))
   for(const [cell,value] of Object.entries(sheet))
    if(!cell.startsWith('!'))assert.equal(value.f,undefined,lang+' '+name+' '+cell+' should not contain formulas');
 }
 assert.equal(JSON.stringify(plan),original,'Excel cannot modify TNA records');
});
test('no buyer follow-up and bad dates stay Needs Information; never invent signed approval',()=>{
 const plan=fixture();
 for(const task of plan.tasks)task.waitingFor='';
 const fit=plan.tasks.find(t=>t.templateRef==='D08');
 fit.dates.forecastFinish='2026-02-30'; // invalid civil day
 const model=reports.buildReportModel(plan,{reportId:'R02',language:'en'});
 assert.equal(model.buyerTna.actions.length,0);
 assert.ok(model.warnings.includes(model.buyerTna.labels.noActions));
 assert.equal(model.buyerTna.milestones.find(row=>row.ref==='D08').forecast,null);
 assert.equal(model.buyerTna.buyerConfirmedTarget,null);
 checkNoDisclosure(model,'No-source decision');
});
test('buyer-facing order identity is formula-escaped in real workbook without corrupting legitimate quantity',()=>{
 const plan=fixture();
 plan.order.buyerName=' \t=HYPERLINK("https://evil.test","Buyer")';
 const workbook=XLSX.read(storage.exportReportWorkbook(reports.buildReportModel(plan,{reportId:'R02'})),
  {type:'buffer',cellFormula:true});
 const first=XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1,raw:true})[1];
 assert.ok(String(first[0]).startsWith("'"),'source formula text must remain inert');
 assert.equal(first[4],2400);
 for(const sheet of Object.values(workbook.Sheets))
  for(const cell of Object.values(sheet))assert.equal(cell.f,undefined);
});
test('R01 remains full factory master and R08-R12 remain prior generic report models/workbooks',()=>{
 const plan=fixture('woven');
 const r01=reports.buildReportModel(plan,{reportId:'R01',language:'en'});
 assert.equal(r01.buyerTna,undefined);
 assert.equal(r01.tasks.length,plan.tasks.length);
 assert.equal(r01.masterSheet.order.masterLcProofRef,secrets[1]);
 assert.equal(r01.order.factory,secrets[0]);
 const r01Workbook=XLSX.read(storage.exportReportWorkbook(r01),{type:'buffer'});
 assert.deepEqual(r01Workbook.SheetNames,
  ['Report Summary','Order Summary','Report Activities','Master TNA','Report Notes']);
 for(const id of reports.catalogue('en').map(x=>x.id).filter(id=>!['R01','R02','R03','R04','R05','R06','R07'].includes(id))){
  const m=reports.buildReportModel(plan,{reportId:id});
  assert.equal(m.buyerTna,undefined,id);
  assert.equal(m.tasks.length,plan.tasks.length,id);
  const w=XLSX.read(storage.exportReportWorkbook(m),{type:'buffer'});
  assert.deepEqual(w.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes'],id);
 }
});
test('buyer report preview is structurally isolated from internal R01 HTML and print has repeated headings',()=>{
 const root=path.resolve(__dirname,'../../..');
 const bootstrap=fs.readFileSync(path.join(root,'apps/tna/src/bootstrap.js'),'utf8');
 const css=fs.readFileSync(path.join(root,'apps/tna/assets/tna.css'),'utf8');
 assert.ok(bootstrap.includes('if(model.buyerTna)html+=buyerReportPreview(model.buyerTna)'));
 assert.ok(bootstrap.includes('data-buyer-part'));
 assert.ok(bootstrap.includes('sourceDisclosure'));
 assert.ok(css.includes('.tna-report-buyer-table thead{display:table-header-group}'));
 assert.ok(css.includes('body.tna-printing-report .tna-report-buyer'));
});
