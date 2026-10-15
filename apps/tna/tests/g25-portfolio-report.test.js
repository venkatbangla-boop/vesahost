/**
 * GMR-13 R10 read-only management portfolio: synthetic multi-buyer,
 * multi-factory, multi-PO, privacy, saved-copy and genuine typed Excel tests.
 */
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const domain=require('../src/domain.js'),reports=require('../src/reports.js');
const portfolio=require('../src/portfolio-report.js'),storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const DATE='2026-10-15';
const secrets=['PRIVATE-MASTER-LC-PROOF','PRIVATE-FOB-COMMISSION','PRIVATE-FACTORY-REMARK',
 'PRIVATE-FIT-PROOF','PRIVATE-MANAGEMENT-AUTHORITY','PRIVATE-SUPPLIER-PRICE'];
const review={reportId:'R10',asOfDate:DATE,language:'en',managementConfirmed:true,
 portfolioAuthorityRef:secrets[4],portfolioSelectedIds:[],portfolioPlans:[],
 generatedAt:'2026-10-15T08:00:00Z',timezone:'Asia/Dhaka'};
const mk=(profile,buyer,factory,po,qty)=>{
 const plan=domain.createPlan({templateId:profile,buyerName:buyer,factoryName:factory,
  styleNo:'STYLE-'+po,poNumber:po,totalQty:qty,unit:'pcs',
  buyerRequiredExFactory:'2026-10-12'},{ownerUserId:'qa'});
 plan.order.commercialNotes=secrets[1];plan.order.fabricSpec=secrets[5];
 plan.commitments.masterLcProofRef=secrets[0];
 plan.order.poNumbers=po==='PO-ONE'?['PO-ONE','PO-TWO']:['PO-THREE'];
 plan.order.styles=[{styleNo:'STYLE-'+po},{styleNo:'STYLE-SECOND'}];
 const ppm=plan.tasks.find(t=>t.templateRef==='PP08');
 if(ppm){ppm.status='blocked';ppm.title=secrets[2];ppm.delayReason=secrets[2];ppm.dates.currentTargetFinish='2026-10-10';}
 const sample=plan.tasks.find(t=>t.templateRef==='D14');
 if(sample){sample.status='awaiting-approval';sample.proofRefs=[secrets[3]];
  sample.dates.currentTargetFinish='2026-10-16';}
 const s04=plan.tasks.find(t=>t.templateRef==='S04');
 if(s04){s04.status='completed';s04.proofRefs=['SOURCE-HANDOVER-PROOF'];
  s04.dates.actualFinish='2026-10-14';s04.dates.forecastFinish='2026-10-13';}
 return plan;
};
function pair(){
 const a=mk('knit','BUYER EAST','FACTORY 1','PO-ONE',900);
 const b=mk('woven','BUYER EAST','FACTORY 2','PO-THREE',800);
 return [a,b];
}
const build=(plans,extra={})=>reports.buildReportModel(plans[0],{...review,
 portfolioSelectedIds:plans.map(p=>p.recordId),portfolioPlans:plans,...extra});
const clean=value=>{
 const text=typeof value==='string'?value:JSON.stringify(value);
 for(const secret of secrets)assert.ok(!text.includes(secret),'private source data leaked '+secret);
};
test('R10 cannot output selected/unselected order data without exact date/consent/authority/IDs',()=>{
 const plans=pair(),before=JSON.stringify(plans),A=plans[0],ids=plans.map(p=>p.recordId);
 for(const override of [
  {asOfDate:''},{asOfDate:'2026-02-30'},{asOfDate:'2026-10-15T10:00Z'},
  {managementConfirmed:false},{portfolioAuthorityRef:' '},
  {portfolioSelectedIds:[]},{portfolioSelectedIds:[ids[0],ids[0]]},
  {portfolioSelectedIds:[ids[0],'FOREIGN-ORDER']},
  {portfolioPlans:[plans[0]]},
  {portfolioPlans:[plans[0],{...plans[1],mode:'practice'}]}
 ]){
  const m=build(plans,override),p=m.portfolioReport;
  assert.equal(p.ready,false,JSON.stringify(override));
  assert.deepEqual(p.orders,[]);assert.deepEqual(p.actions,[]);assert.deepEqual(m.tasks,[]);
  assert.equal(m.order.buyer,'Selected saved orders');
  assert.equal(m.source.recordId,null);
  assert.ok(!JSON.stringify(m).includes('BUYER EAST'));
  clean(m);
  assert.throws(()=>storage.exportReportWorkbook(m),/Choose|review|orders/i);
 }
 assert.equal(JSON.stringify(plans),before);
 assert.equal(portfolio.project([A],{}).ready,false);
});
test('R10 multiple orders and PO references are distinct; source follow-up never equals CPM/release',()=>{
 const plans=pair(),before=JSON.stringify(plans),m=build(plans),p=m.portfolioReport;
 assert.equal(p.ready,true);assert.equal(p.summary.orders,2);
 assert.equal(p.summary.poReferences,3,'one order with two PO numbers contributes one order quantity');
 assert.equal(p.summary.buyers,1);assert.equal(p.summary.factories,2);
 assert.equal(p.summary.blockedOrders,2);assert.equal(p.summary.waitingApprovalOrders,2);
 assert.equal(p.orders[0].quantity,900);assert.equal(p.orders[1].quantity,800);
 assert.match(p.orders[0].po,/PO-ONE, PO-TWO/);
 assert.equal(p.orders[0].due,'2026-10-12');
 assert.equal(p.orders[0].forecast,'2026-10-13');
 assert.equal(p.orders[0].actual,'2026-10-14','status/date/proof source, NOT carrier confirmation');
 assert.equal(p.orders[0].blocked,1);assert.equal(p.orders[0].waiting,1);
 assert.equal(p.actions[0].ref,'PP08');assert.equal(p.actions[0].window,'blockedWindow');
 assert.equal(p.groups.filter(g=>g.type===p.labels.buyer)[0].count,2);
 assert.ok(p.warnings.includes(p.labels.noCpm));assert.ok(p.warnings.includes(p.labels.noShip));
 assert.equal(m.source.mode,'browser-local-portfolio');
 assert.equal(JSON.stringify(plans),before);clean(m);
});
test('R10 unknown data stays unknown: missing date, qty, buyer approval and source proof cannot be inferred',()=>{
 const a=pair()[0];
 a.order.totalQty=null;a.commitments.buyerRequiredExFactory='2026-02-30';
 const shipment=a.tasks.find(t=>t.templateRef==='S04');
 shipment.proofRefs=[];shipment.dates.actualFinish='2026-10-20';
 const p=build([a]).portfolioReport;
 assert.equal(p.ready,true);assert.equal(p.orders[0].due,null);
 assert.equal(p.orders[0].quantity,null);assert.equal(p.orders[0].actual,null);
 assert.equal(p.summary.orders,1);assert.ok(p.warnings.includes(p.labels.noDates));
 assert.ok(p.warnings.includes(p.labels.onlyOne));
});
test('R10 genuine Excel has typed source quantities and dates, groups, actions; no formulas or private data',()=>{
 const plans=pair(),before=JSON.stringify(plans),m=build(plans);
 const buf=storage.exportReportWorkbook(m);
 assert.deepEqual([...buf.subarray(0,2)],[80,75]);
 const book=XLSX.read(buf,{type:'buffer'});
 assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
  'Portfolio Orders','Portfolio Follow-ups','Portfolio Groups','Report Notes']);
 const rows=XLSX.utils.sheet_to_json(book.Sheets['Portfolio Orders'],{header:1,raw:true});
 assert.equal(rows.length,3);assert.equal(rows[1][5],900);
 assert.equal(typeof rows[1][9],'number','date must remain numeric in Excel');
 assert.equal(typeof rows[1][10],'number');
 assert.equal(typeof rows[1][11],'number');
 const groups=XLSX.utils.sheet_to_json(book.Sheets['Portfolio Groups'],{header:1,raw:true});
 assert.ok(groups.some(r=>r[1]==='BUYER EAST'&&r[2]===2));
 clean(Object.values(book.Sheets).flatMap(sheet=>Object.entries(sheet)
  .filter(([address])=>!address.startsWith('!')).map(([,cell])=>cell.v)));
 assert.equal(JSON.stringify(plans),before);clean(m);
});
test('R10 four language controls and cross-report isolation, no leaked authority',()=>{
 const plans=pair();
 const titles=new Set();
 for(const language of ['en','bn','hi','ta']){
  const m=build(plans,{language});
  assert.equal(m.portfolioReport.ready,true);
  assert.ok(m.portfolioReport.labels.select.length>12);
  assert.ok(m.portfolioReport.labels.consent.length>20);
  titles.add(m.portfolioReport.labels.title);clean(m);
 }
 assert.ok(titles.size>=3,'portfolio title should localize');
 for(const id of ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R11','R12']){
  const m=reports.buildReportModel(plans[0],{reportId:id});
  assert.equal(m.portfolioReport,undefined);
 }
});
test('R10 read-only storage preserves v1.0 saved copies and refuses other user, missing, practice and duplicates',()=>{
 const plans=pair(),other=mk('denim','OTHER PRIVATE BUYER','OTHER FACTORY','OTHER-PO',200);
 const practice=mk('knit','PRACTICE BUYER','PRACTICE FACTORY','PRACTICE',100);
 practice.mode='practice';
 const legacy=JSON.parse(JSON.stringify(plans[0]));
 legacy.schemaVersion='TNA360-ORDERPLAN-1.0.0';delete legacy.integrationReferences;
 const memory=new Map();
 const key=user=>'vesa.tna360.records.'+user;
 const box=rows=>JSON.stringify({storageVersion:storage.STORAGE_VERSION,
  records:rows.map(plan=>({recordId:plan.recordId,plan}))});
 memory.set(key('qa'),box([legacy,plans[1],practice]));
 memory.set(key('other-user'),box([other]));
 const prior=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),
  removeItem:k=>memory.delete(k)};
 try{
  const original=memory.get(key('qa'));
  const loaded=storage.readPortfolioSnapshots(plans.map(p=>p.recordId),'qa');
  assert.equal(loaded.length,2);assert.equal(loaded[0].schemaVersion,domain.SCHEMA_VERSION);
  assert.equal(loaded[0].recordId,plans[0].recordId);
  assert.equal(memory.get(key('qa')),original,'no migration write/read side effects');
  assert.equal(memory.get(key('other-user')),box([other]),'other user storage unchanged');
  assert.throws(()=>storage.readPortfolioSnapshots([other.recordId],'qa'),/unavailable/);
  assert.throws(()=>storage.readPortfolioSnapshots([practice.recordId],'qa'),/not available/);
  assert.throws(()=>storage.readPortfolioSnapshots([plans[0].recordId,plans[0].recordId],'qa'),/distinct/);
  assert.deepEqual(storage.readPortfolioSnapshots([plans[1].recordId],'qa'),[plans[1]]);
 }finally{globalThis.localStorage=prior}
});
