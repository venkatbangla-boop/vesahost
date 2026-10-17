/* TNA G15: locally prepared Master Sheet workbook, formula safety and print isolation.
 * Source-only demo; no browser files or user orders are uploaded.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Domain=require('../src/domain.js'),Model=require('../src/merchandising-sheet.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const plan=Domain.createPlan({
 templateId:'woven',buyerName:'SYN BUYER =NO_FORMULA',factoryName:'SYN FACTORY',
 styleNo:'SYN-WOVEN-XL',poNumber:'SYN-PO-123',totalQty:1000,
 buyerRequiredExFactory:'2027-01-31',fabricSpec:'SYN COTTON 190 GSM',
 colorSizeBreakdown:'Navy | M | 500\nWhite | L | 500'
},{ownerUserId:'synthetic-merch'});
plan.tasks[0].title='=HYPERLINK("malicious","wrong")';
plan.tasks[0].delayReason='@=UNTRUSTED';
const original=JSON.stringify(plan);
const source={sourceRef:'SYN SELF-DATED TRACKING SHEET',sourceDate:'2026-10-17',
 actorId:'synthetic-merch',reason:'SYN review note'};
const changed=Domain.reviseTaskPlanningDates(plan,plan.tasks[0].taskId,{
 baselineFinish:'2026-10-17',currentTargetFinish:'2026-10-19',forecastFinish:'2026-10-21'
},source);
assert(changed.ok,changed.error);
const tables=Model.workbookTables(changed.plan,null);
assert.deepEqual(Object.keys(tables),['Order Summary','Activity Master','Colour Size','Planning Revisions']);
assert.equal(tables['Activity Master'].length,plan.tasks.length+1,'All activity rows exported, no truncation');
assert.equal(tables['Colour Size'].length,3);
assert.equal(tables['Planning Revisions'].length,4,'Date revisions retain each before/after field');
assert.equal(tables['Activity Master'][1][2],"'=HYPERLINK(\"malicious\",\"wrong\")");
assert.equal(tables['Activity Master'][1][12],"'@=UNTRUSTED");
assert.equal(tables['Activity Master'][1][4],'2026-10-17');
assert.equal(tables['Activity Master'][1][5],'2026-10-19');
assert.equal(tables['Activity Master'][1][6],'2026-10-21');
assert.equal(tables['Activity Master'][1][7],'Needs Information');
assert.equal(tables['Activity Master'][1][8],4,'Explicit forecast-baseline calendar days numeric');
assert.equal(tables['Activity Master'][1][9],'not-started');
assert.equal(tables['Order Summary'].find(row=>row[0]==='GSM — separately verified')[1],'Needs Information');
assert.equal(Model.excelCell('+FORMULA'),"'+FORMULA");
assert.equal(Model.excelCell('-INJECT'),"'-INJECT");
assert.equal(Model.excelCell('=SUM(1,1)'),"'=SUM(1,1)");
assert.equal(Model.excelCell('@INDIRECT'),"'@INDIRECT");
assert.equal(Model.excelCell('  =HIDDEN'),"'  =HIDDEN");
assert.equal(Model.excelCell('2026-10-17'),'2026-10-17');
assert.equal(Model.excelCell(-3),-3,'Numeric negatives are safe typed values');
assert.equal(JSON.stringify(plan),original,'Workbook does not mutate original plan');
const book=XLSX.utils.book_new();
for(const [name,rows] of Object.entries(tables)){
 const sheet=XLSX.utils.aoa_to_sheet(rows);
 XLSX.utils.book_append_sheet(book,sheet,name);
}
const buffer=XLSX.write(book,{bookType:'xlsx',type:'buffer'});
assert.equal(buffer.subarray(0,2).toString(),'PK');
const reopened=XLSX.read(buffer,{type:'buffer'});
assert.deepEqual(reopened.SheetNames,['Order Summary','Activity Master','Colour Size','Planning Revisions']);
assert.equal(reopened.Sheets['Activity Master'].I2.v,4);
assert.equal(reopened.Sheets['Activity Master'].I2.t,'n');
assert.equal(reopened.Sheets['Activity Master'].C2.t,'s');
assert(!reopened.Sheets['Activity Master'].C2.f,'Untrusted source must never execute a formula');
const ui=fs.readFileSync(path.resolve(__dirname,'../src/bootstrap.js'),'utf8');
const css=fs.readFileSync(path.resolve(__dirname,'../assets/tna.css'),'utf8');
for(const x of ['function downloadMerchSheetExcel','function printMerchSheet','data-tna-merch-excel','data-tna-merch-print'])assert(ui.includes(x));
for(const x of ['body.tna-printing-merch-sheet .tna-merch-sheet','tna-merch-table thead','body.tna-printing-report .tna-merch-sheet'])assert(css.includes(x));
console.log('TNA G15 workbook/print contract PASS: all source rows, typed delay, four local sheets, formula guard, historical revisions and original R01–R12 isolation.');
