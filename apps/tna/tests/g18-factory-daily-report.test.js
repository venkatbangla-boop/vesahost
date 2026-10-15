/**
 * GMR-06 R03 factory action model + actual SheetJS Excel source regression.
 * Synthetic knit/woven sources; source dates, actions, proof never invented.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const domain=require('../src/domain.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const asOf='2026-10-15';
const sheets=['Report Summary','Order Summary','Report Activities','Factory Daily Actions','Missing Action Dates','Report Notes'];
function source(profile='knit'){
 const plan=domain.createPlan({
  templateId:profile,buyerName:'SYNTHETIC FACTORY BUYER',factoryName:'SYNTHETIC FACTORY',
  styleNo:'R03-FACTORY-STYLE',poNumber:'R03-PO',totalQty:1200,
  buyerRequiredExFactory:'2026-12-20'
 },{ownerUserId:'test-factory'});
 const update=(ref,fields)=>{
  const task=plan.tasks.find(t=>t.templateRef===ref);
  assert.ok(task,'required garment task '+ref);
  Object.assign(task,fields);
  return task;
 };
 update('O01',{status:'blocked',ownerParty:'fabric-team',waitingFor:'fabric-supplier',
  dates:{...plan.tasks.find(t=>t.templateRef==='O01').dates,baselineFinish:'2026-10-13',
    currentTargetFinish:'2026-10-14'},delayReason:'SOURCE-DELAY-REASON',
  followUpNote:'SOURCE-FOLLOWUP-ORDER',recoveryAction:'SOURCE-RECOVERY-ORDER',
  proofRefs:['PROOF-REF-10']});
 update('D05',{status:'awaiting-approval',ownerParty:'sample-room',waitingFor:'buyer',
  dates:{...plan.tasks.find(t=>t.templateRef==='D05').dates,
    baselineFinish:'2026-10-13',currentTargetFinish:'2026-10-15'},
  followUpNote:'SOURCE-REMIND-BUYER',proofRefs:['FIT-SUBMIT-REF']});
 update('D08',{status:'in-progress',ownerParty:'merchant',
  dates:{...plan.tasks.find(t=>t.templateRef==='D08').dates,
    baselineFinish:'2026-10-19',currentTargetFinish:'2026-10-22'}});
 update('D11',{status:'in-progress',ownerParty:'technical',
  dates:{...plan.tasks.find(t=>t.templateRef==='D11').dates,
    baselineFinish:'2026-10-12',currentTargetFinish:'2026-02-30'}});
 update('D14',{status:'approved',ownerParty:'buyer',
  dates:{...plan.tasks.find(t=>t.templateRef==='D14').dates,
    baselineFinish:'2026-10-10',actualFinish:'2026-10-14'}});
 update('D15',{status:'not-started',
  dates:{...plan.tasks.find(t=>t.templateRef==='D15').dates,
    baselineFinish:'2026-10-23'}});
 update('Q07',{status:'completed',ownerParty:'quality',proofRefs:['QC-PROOF-15'],
  dates:{...plan.tasks.find(t=>t.templateRef==='Q07').dates,
    baselineFinish:'2026-10-01',actualFinish:'2026-10-15'}});
 update('O02',{status:'not-started',ownerParty:'',waitingFor:'',delayReason:''});
 plan.validation={ok:true,errors:[],warnings:['TEST-INTERNAL-SOURCE-VALIDATION']};
 return plan;
}
test('R03 cannot be prepared or exported without an explicit valid civil as-of date',()=>{
 const plan=source();
 for(const d of [undefined,'','2026-02-30','15/10/2026','2026-13-01','2026-10-15T00:00:00Z']){
  const model=reports.buildReportModel(plan,{reportId:'R03',asOfDate:d,language:'en'});
  assert.equal(model.factoryDaily.ready,false,String(d));
  assert.equal(model.factoryDaily.asOfDate,null);
  assert.equal(model.factoryDaily.rows.length,0);
  assert.equal(model.tasks.length,0,'report data not disclosed before date selected');
  assert.ok(model.warnings.includes(model.factoryDaily.labels.selectDate));
  assert.throws(()=>storage.exportReportWorkbook(model),/Select a valid as-of date/);
 }
});
test('separate overdue, today, next seven days and unscheduled rows use only sourced civil dates',()=>{
 for(const profile of ['knit','woven']){
  const plan=source(profile),old=JSON.stringify(plan);
  const model=reports.buildReportModel(plan,{reportId:'R03',asOfDate:asOf,language:'en',
    generatedAt:'2026-10-15T08:00:00.000Z',timezone:'Asia/Dhaka'});
  const d=model.factoryDaily;
  assert.equal(d.ready,true);
  assert.equal(d.asOfDate,asOf);
  assert.ok(d.sections.overdue.some(x=>x.ref==='O01'));
  assert.ok(d.sections.today.some(x=>x.ref==='D05'));
  assert.ok(d.sections.today.some(x=>x.ref==='Q07'),'actual completion on review date is Today, not overdue');
  assert.ok(!d.sections.overdue.some(x=>x.ref==='Q07'));
  assert.ok(d.sections.nextSeven.some(x=>x.ref==='D08'),'exactly +7 calendar days included');
  assert.ok(!d.rows.some(x=>x.ref==='D15'),'+8 days excluded');
  assert.ok(!d.rows.some(x=>x.ref==='D14'),'old approved task not actionable');
  assert.ok(d.sections.needsDate.some(x=>x.ref==='O02'));
  assert.ok(d.sections.needsDate.some(x=>x.ref==='D11'),'invalid revised date never falls back silently');
  assert.equal(d.sections.needsDate.find(x=>x.ref==='D11').due,null);
  assert.ok(d.warnings.some(w=>w.includes('invalid source date')));
  assert.ok(d.missingOwnerCount>=1);
  assert.ok(d.counts.needsDate>=1);
  assert.deepEqual(d.rows,[...d.sections.overdue,...d.sections.today,...d.sections.nextSeven,
    ...d.sections.needsDate],'group order is stable and source-only');
  const late=d.sections.overdue.find(x=>x.ref==='O01');
  assert.equal(late.due,'2026-10-14');
  assert.equal(late.original,'2026-10-13');
  assert.equal(late.revised,'2026-10-14');
  assert.equal(late.department,'fabric-team');
  assert.equal(late.waiting,'fabric-supplier');
  assert.equal(late.reason,'SOURCE-DELAY-REASON');
  assert.equal(late.followup,'SOURCE-FOLLOWUP-ORDER');
  assert.equal(late.recovery,'SOURCE-RECOVERY-ORDER');
  assert.equal(late.proof,'PROOF-REF-10');
  assert.equal(model.tasks.length,d.rows.length);
  assert.ok(model.tasks.every(x=>x.risk==='needs-information'));
  assert.ok(d.warnings.some(w=>w.includes('factory holidays')));
  assert.equal(JSON.stringify(plan),old,'building report cannot change any saved source record');
 }
});
test('R03 locales preserve source values and stable status IDs but localize visible report sections',()=>{
 const plan=source('woven'),before=JSON.stringify(plan);
 const labels=[];
 for(const language of ['en','bn','hi','ta']){
  const m=reports.buildReportModel(plan,{reportId:'R03',asOfDate:asOf,language});
  assert.equal(m.factoryDaily.ready,true);
  for(const key of ['asOf','selectDate','overdue','today','nextSeven','needsDate','department',
    'reason','followup','proof','calendar','unknown','missingOwner'])
   assert.ok(m.factoryDaily.labels[key],language+': '+key);
  const o=m.factoryDaily.rows.find(t=>t.ref==='O01');
  assert.equal(o.reason,'SOURCE-DELAY-REASON');
  assert.equal(o.followup,'SOURCE-FOLLOWUP-ORDER');
  assert.equal(o.status,'blocked');
  assert.ok(o.statusDisplay);
  assert.equal(m.tasks.find(t=>t.ref==='O01').status,'blocked','API status IDs remain stable');
  labels.push(m.factoryDaily.labels.today);
 }
 assert.equal(new Set(labels).size,4,'all four languages show distinct daily heading');
 assert.equal(JSON.stringify(plan),before);
});
test('genuine Excel R03 workbook uses typed review/target dates, correct sections and formula-safe remarks',()=>{
 const p=source();
 const first=p.tasks.find(t=>t.templateRef==='O01');
 first.followUpNote='\t=HYPERLINK("https://evil.invalid","order")';
 const before=JSON.stringify(p);
 for(const language of ['en','bn','hi','ta']){
  const m=reports.buildReportModel(p,{reportId:'R03',asOfDate:asOf,language});
  const book=XLSX.read(storage.exportReportWorkbook(m),{type:'buffer',cellFormula:true,cellStyles:true});
  assert.deepEqual(book.SheetNames,sheets);
  const meta=XLSX.utils.sheet_to_json(book.Sheets['Report Summary'],{header:1,raw:true});
  const reviewRow=meta.find(row=>row[0]===m.factoryDaily.labels.asOf);
  assert.ok(reviewRow&&typeof reviewRow[1]==='number','review date is a real Excel date');
  const actions=XLSX.utils.sheet_to_json(book.Sheets['Factory Daily Actions'],{header:1,raw:true});
  const overdue=actions.find(row=>row[1]==='O01');
  assert.ok(overdue,language);
  for(const col of [4,5,6])assert.equal(typeof overdue[col],'number',language+' typed date column '+col);
  assert.equal(overdue[9],m.factoryDaily.sections.overdue.find(x=>x.ref==='O01').statusDisplay);
  assert.ok(String(overdue[12]).trim().startsWith("'"),'formula-like follow-up never runs as a formula');
  const dated=XLSX.utils.sheet_to_json(book.Sheets['Missing Action Dates'],{header:1,raw:true});
  assert.ok(dated.some(row=>row[1]==='D11'&&row[4]===m.factoryDaily.labels.unknown),
    'invalid revised source date stays Needs Information');
  assert.ok(dated.some(row=>row[1]==='O02'&&row[3]===m.factoryDaily.labels.unknown));
  assert.equal(book.Sheets['Factory Daily Actions']['!autofilter'].ref,book.Sheets['Factory Daily Actions']['!ref']);
  for(const [sheetName,sheet] of Object.entries(book.Sheets))
   for(const [addr,cell] of Object.entries(sheet))
    if(!addr.startsWith('!'))assert.equal(cell.f,undefined,sheetName+' '+addr+' must contain no formula');
 }
 assert.equal(JSON.stringify(p),before);
});
test('R01 factory, R02 buyer, R04-R12 and portable storage stay unchanged',()=>{
 const p=source(),old=JSON.stringify(p);
 const r01=reports.buildReportModel(p,{reportId:'R01'});
 const r02=reports.buildReportModel(p,{reportId:'R02'});
 assert.equal(r01.factoryDaily,undefined);
 assert.equal(r02.factoryDaily,undefined);
 assert.equal(r01.tasks.length,p.tasks.length);
 assert.equal(r02.masterSheet,null);
 assert.deepEqual(XLSX.read(storage.exportReportWorkbook(r01),{type:'buffer'}).SheetNames,
  ['Report Summary','Order Summary','Report Activities','Master TNA','Report Notes']);
 assert.deepEqual(XLSX.read(storage.exportReportWorkbook(r02),{type:'buffer'}).SheetNames,
  ['Report Summary','Order Summary','Report Activities','Buyer Milestones','Buyer Actions','Report Notes']);
 for(const id of reports.catalogue('en').map(x=>x.id).filter(x=>!['R01','R02','R03'].includes(x))){
  const m=reports.buildReportModel(p,{reportId:id});
  assert.equal(m.tasks.length,p.tasks.length,id);
  assert.equal(m.factoryDaily,undefined,id);
  assert.deepEqual(XLSX.read(storage.exportReportWorkbook(m),{type:'buffer'}).SheetNames,
    ['Report Summary','Order Summary','Report Activities','Report Notes'],id);
 }
 const oldPlan=domain.createPlan({templateId:'knit',buyerName:'PORTABLE BUYER',factoryName:'PORTABLE FACTORY',
   styleNo:'OLD-STYLE',poNumber:'OLD-PO',totalQty:100,buyerRequiredExFactory:'2026-12-20'});
 assert.deepEqual(storage.importCopy(storage.exportCopy(oldPlan)),oldPlan,
   'previously valid saved copies remain portable');
 assert.equal(JSON.stringify(p),old);
});
