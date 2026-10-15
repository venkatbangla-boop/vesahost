/**
 * TNA GMR-04A: real XLSX reader, reviewed order-row mapping and NEW DRAFT
 * invariants. All data synthetic; repository/local browser fixtures unchanged.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const XLSX=require('../vendor/xlsx.full.min.js');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const importer=require('../src/import-review.js');
function fixture(rows,sheet='Orders'){
  const book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet(rows),sheet);
  return XLSX.write(book,{type:'buffer',bookType:'xlsx'});
}
const headers=['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory','Fabric Details','GSM','Order Confirmed On'];
const baseRow=['SYNTHETIC BUYER','SYNTHETIC FACTORY','KNIT-SRC-001','PO-001',1200,'2026-11-25','100% Cotton Jersey',175,'2026-10-19'];
function review(snapshot,sheetName='Orders',settings={}){
 const details=importer.describe(snapshot,sheetName,settings.headerRow||1);
 return importer.review(snapshot,{
   sheetName,headerRow:settings.headerRow||1,recordRow:settings.recordRow||2,
   mapping:settings.mapping||details.mapping,dateFormat:settings.dateFormat||'iso',
   basis:settings.basis||'calendar',templateId:settings.templateId||'knit'
 },settings.existingPlans||[]);
}
test('real knit Excel creates a separate unsanctioned draft, no imported approval',()=>{
 const buffer=fixture([headers,baseRow]);
 const snap=importer.parseWorkbook(buffer,'supplier-order.xlsx');
 assert.deepEqual(snap.sheetNames,['Orders']);
 const out=review(snap);
 assert.equal(out.ready,true,out.errors.join('; '));
 assert.equal(out.proposal.totalQty,1200);
 assert.equal(out.proposal.fabricWeightGsm,175);
 assert.equal(out.proposal.buyerRequiredExFactory,'2026-11-25');
 const p=importer.createNewDraft(out,{ownerUserId:'qa'});
 assert.equal(p.order.buyerName,'SYNTHETIC BUYER');
 assert.equal(p.order.productProfile,'knit');
 assert.equal(p.order.fabricWeightGsm,175);
 assert.equal(p.commitments.buyerRequiredExFactory,'2026-11-25');
 assert.equal(p.commitments.orderConfirmedOn,'2026-10-19');
 assert.equal(p.recordStatus,'draft');
 assert.equal(p.revision,0);
 assert.equal(p.baselineSnapshots.length,0);
 assert.ok(p.tasks.every(t=>t.status==='not-started'&&t.dates.actualFinish===null));
 assert.equal(p.auditEvents.at(-1).details.originalFileNotStored,true);
 assert.equal(p.auditEvents.at(-1).details.skippedActivities,true);
 assert.equal(domain.validatePlan(p).ok,true);
 assert.deepEqual(storage.importCopy(storage.exportCopy(p)),p,'old saved-copy codec round trips new draft');
 const other=importer.createNewDraft(out,{ownerUserId:'qa'});
 assert.notEqual(p.recordId,other.recordId,'fresh ID every confirmation');
});
test('user chooses a worksheet, header row, data row and woven template explicitly',()=>{
 const workbook=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Notes'],['Not an order']]),'Readme');
 const reordered=['Heading not at row 1'];
 const columns=['Factory','PO','Quantity','Style','Buyer','Buyer Required Ex-Factory'];
 const first=['Factory One','PO-100',700,'SHIRT-A','Buyer A','15/11/2026'];
 const second=['Factory Two','PO-200',800,'SHIRT-B','Buyer B','21/11/2026'];
 XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([reordered,columns,first,second]),'Purchase Orders');
 const snap=importer.parseWorkbook(XLSX.write(workbook,{type:'buffer',bookType:'xlsx'}),'woven-orders.xlsx');
 assert.deepEqual(importer.suggestWorksheet(snap),{row:2,score:18,name:'Purchase Orders'});
 assert.equal(importer.suggestHeaderRow(snap,'Readme').row,1);
 const out=review(snap,'Purchase Orders',{headerRow:2,recordRow:4,dateFormat:'dmy',basis:'working',templateId:'woven'});
 assert.equal(out.ready,true,out.errors.join(' '));
 assert.equal(out.proposal.styleNo,'SHIRT-B');
 assert.equal(out.proposal.poNumber,'PO-200');
 assert.equal(out.proposal.totalQty,800);
 assert.equal(out.proposal.buyerRequiredExFactory,'2026-11-21');
 assert.equal(out.proposal.leadTimeBasis,'working');
 assert.ok(out.warnings.some(x=>x.includes('one order row')));
 const plan=importer.createNewDraft(out,{ownerUserId:'qa'});
 assert.equal(plan.templateId,'woven');
 assert.equal(plan.commitments.leadTimeBasis,'working');
 assert.equal(plan.calendars[0].source,'user-not-configured','no fabricated factory calendar');
});
test('dates never guessed: slash source needs a selected basis, invalid dates fail closed',()=>{
 const row=baseRow.slice();row[5]='10/11/2026';row[8]='';
 const snap=importer.parseWorkbook(fixture([headers,row]),'dates.xlsx');
 assert.equal(review(snap).ready,false,'ISO cannot treat a slash date as ISO');
 const dmy=review(snap,'Orders',{dateFormat:'dmy'});
 const mdy=review(snap,'Orders',{dateFormat:'mdy'});
 assert.equal(dmy.proposal.buyerRequiredExFactory,'2026-11-10');
 assert.equal(mdy.proposal.buyerRequiredExFactory,'2026-10-11');
 assert.equal(review(snap,'Orders',{dateFormat:'dmy',basis:'unconfigured'}).ready,false);
 assert.throws(()=>importer.parseDate('2026-02-30','iso'),/real calendar day/);
});
test('actual Excel numeric date requires explicit Excel option, not implicit locale conversion',()=>{
 const serial=XLSX.SSF.parse_date_code(46324);
 assert.ok(serial?.y>2020);
 const row=baseRow.slice();row[5]=46324;row[8]='';
 const book=fixture([headers,row]);
 const snap=importer.parseWorkbook(book,'numeric-dates.xlsx');
 assert.equal(review(snap).ready,false);
 const out=review(snap,'Orders',{dateFormat:'excel'});
 assert.equal(out.ready,true,out.errors.join('; '));
 assert.match(out.proposal.buyerRequiredExFactory,/^\d{4}-\d{2}-\d{2}$/);
});
test('formula cells beyond first twenty lines are rejected, with original workbook unchanged',()=>{
 const rows=[headers,baseRow,...Array.from({length:23},(_,i)=>['Buyer '+i,'Factory','S'+i,'PO'+i,50,'2026-11-29'])];
 const workbook=XLSX.utils.book_new();
 const sheet=XLSX.utils.aoa_to_sheet(rows);
 sheet['D25']={t:'n',f:'2+3',v:5};
 XLSX.utils.book_append_sheet(workbook,sheet,'Orders');
 const snap=importer.parseWorkbook(XLSX.write(workbook,{type:'buffer',bookType:'xlsx'}),'long.xlsx');
 assert.ok(snap.sheets.Orders.formulaCells.includes('D25'));
 assert.equal(review(snap).ready,false,'even formulas in later worksheet rows block the selected import');
});
test('unsafe cell text, negative quantity and multi-column reuse reject import',()=>{
 for(const [field,value] of [
   [0,'=HYPERLINK("https://bad.test","BUYER")'],[1,'javascript:alert(1)'],[3,'<script>alert(2)</script>'],[4,-900]
 ]){
   const row=baseRow.slice();row[field]=value;
   const snap=importer.parseWorkbook(fixture([headers,row]),'bad.xlsx');
   assert.equal(review(snap).ready,false,'unsafe field '+field);
 }
 const snap=importer.parseWorkbook(fixture([headers,baseRow]),'bad-map.xlsx');
 const mapping={...importer.describe(snap,'Orders').mapping,poNumber:2};
 assert.equal(review(snap,'Orders',{mapping}).ready,false,'same Excel column cannot represent both style and PO');
});
test('duplicate order identity requires separate explicit consent; never mutates old signed plan',()=>{
 const snap=importer.parseWorkbook(fixture([headers,baseRow]),'duplicate.xlsx');
 const original=domain.createPlan({templateId:'knit',buyerName:'SYNTHETIC BUYER',
   factoryName:'SYNTHETIC FACTORY',styleNo:'KNIT-SRC-001',poNumber:'PO-001',totalQty:1200});
 const before=JSON.stringify(original);
 const out=review(snap,'Orders',{existingPlans:[original]});
 assert.equal(out.ready,true);
 assert.equal(out.duplicate,true);
 assert.ok(out.warnings.some(x=>x.includes('Matching buyer')));
 const p=importer.createNewDraft(out,{ownerUserId:'qa'});
 assert.notEqual(p.recordId,original.recordId);
 assert.equal(JSON.stringify(original),before);
});
test('macro and unsupported extensions, huge files, unsupported mappings reject before writes',()=>{
 const book=fixture([headers,baseRow]);
 for(const extension of ['.xlsm','.xls','.csv','.html'])assert.throws(
   ()=>importer.parseWorkbook(book,'untrusted'+extension),/xlsx/i);
 assert.throws(()=>importer.parseWorkbook(Buffer.alloc(2097153), 'large.xlsx'),/2 MB/i);
 const snap=importer.parseWorkbook(book,'small.xlsx');
 assert.equal(review(snap,'Orders',{templateId:'no-such-template'}).ready,false);
 const mapping={...importer.describe(snap,'Orders').mapping,buyerName:-1};
 assert.equal(review(snap,'Orders',{mapping}).ready,false);
 assert.throws(()=>importer.createNewDraft({ready:false}),/Review valid/i);
});
test('four-language import action labels exist without translating data values',()=>{
 for(const lang of ['en','bn','hi','ta']){
   const words=importer.LOCALES[lang];
   for(const k of ['title','sheet','header','dataRow','date','basis','profile','map','review','confirm','warning','consent'])
     assert.ok(words[k],lang+' '+k);
 }
});
