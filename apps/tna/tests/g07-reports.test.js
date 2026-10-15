const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..', '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const reports = require('../src/reports.js');
const storage = require('../src/storage.js');
const XLSX = require('../vendor/xlsx.full.min.js');
const domain = require('../src/domain.js');
const bootstrap = read('apps/tna/src/bootstrap.js');
const index = read('apps/tna/index.html');
const worker = read('service-worker.js');
const css = read('apps/tna/assets/tna.css');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const coverage = reports.assertLanguageCoverage();
assert(coverage.ok, `G07 language coverage missing: ${coverage.missing.join(', ')}`);
assert(reports.REPORT_TYPES.length === 12, 'G07 must define R01-R12 report types.');

const plan = domain.createPlan({
  templateId: 'knit', buyerName: 'Buyer Report', factoryName: 'Factory Report', styleNo: 'STYLE-RPT', poNumber: 'PO-RPT', totalQty: 900,
  orderConfirmedOn: '2026-10-12', buyerRequiredExFactory: '2026-12-15'
}, { ownerUserId: 'admin@vesa' });
const before = JSON.stringify(plan);

for (const lang of ['en', 'bn', 'hi', 'ta']) {
  const catalogue = reports.catalogue(lang);
  assert(catalogue.length === 12, `G07 ${lang} catalogue should expose 12 reports.`);
  assert(catalogue[0].id === 'R01' && catalogue[11].id === 'R12', `G07 ${lang} catalogue should preserve R01-R12 IDs.`);
  const seen = new Set();
  for (const item of catalogue) {
    const model = reports.buildReportModel(plan, { reportId: item.id, language: lang, generatedAt: '2026-10-10T07:10:00.000Z', timezone: 'Asia/Dhaka' });
    seen.add(model.reportId);
    assert(model.schema === 'VESA-TNA-REPORT-1', `G07 ${lang} ${item.id} should use the report schema.`);
    assert(model.generatedLabel && model.timezone === 'Asia/Dhaka', `G07 ${lang} ${item.id} should preserve generated date/timezone metadata.`);
    assert(model.order.buyer === 'Buyer Report' && model.order.style === 'STYLE-RPT', `G07 ${lang} ${item.id} must not translate typed buyer/style values.`);
    assert(model.tasks.length === plan.tasks.length, `G07 ${lang} ${item.id} report model should include every activity.`);
    assert(model.labels.noFabrication && model.labels.shareFallback && model.labels.printFallback, `G07 ${lang} ${item.id} should include report fallback notes.`);
    assert(model.tasks.every(task => ['not-started','in-progress','blocked','submitted','approved','rejected','completed','waived','not-applicable'].includes(task.status)), `G07 ${lang} ${item.id} must preserve stable status IDs.`);
    const jsonExport = JSON.stringify(model, null, 2);
    assert(jsonExport.includes(item.id) && jsonExport.includes('Buyer Report') && jsonExport.includes('STYLE-RPT'), `G07 ${lang} ${item.id} JSON export should preserve report and order identity.`);
    const workbook = XLSX.read(storage.exportReportWorkbook(model), { type: 'buffer', cellStyles: true });
    assert(workbook.SheetNames.includes('Report Summary') && workbook.SheetNames.includes('Order Summary') && workbook.SheetNames.includes('Report Activities') && workbook.SheetNames.includes('Report Notes'), `G07 ${lang} ${item.id} workbook export should include all required report sheets.`);
    assert(workbook.Sheets['Report Activities']['!cols']?.[1]?.wch >= 40, `G07 ${lang} ${item.id} workbook should provide a readable activity column width.`);
    assert(workbook.Sheets['Report Activities']['!autofilter']?.ref, `G07 ${lang} ${item.id} workbook should provide an activity filter range.`);
  }
  assert(seen.size === 12, `G07 ${lang} should expose every R01-R12 report exactly once.`);
}
assert(JSON.stringify(plan) === before, 'G07 report generation must not mutate the TNA plan.');

const bnModel = reports.buildReportModel(plan, { reportId: 'R01', language: 'bn', generatedAt: '2026-10-10T07:10:00.000Z', timezone: 'Asia/Dhaka' });
const taModel = reports.buildReportModel(plan, { reportId: 'R12', language: 'ta', generatedAt: '2026-10-10T07:10:00.000Z', timezone: 'Asia/Dhaka' });
assert(taModel.reportId === 'R12' && taModel.source.recordId === plan.recordId, 'G07 R12 report model should keep source identity.');
assert(bnModel.labels.noFabrication.includes('Needs Information'), 'G07 reports must include no-fabrication note.');

for (const model of [bnModel, taModel]) {
  const workbookBuffer = storage.exportReportWorkbook(model);
  const workbook = XLSX.read(workbookBuffer, { type: 'buffer', cellStyles: true });
  for (const sheet of ['Report Summary', 'Order Summary', 'Report Activities', 'Report Notes']) {
    assert(workbook.SheetNames.includes(sheet), `G07 report workbook missing sheet: ${sheet}`);
  }
  const summaryRows = XLSX.utils.sheet_to_json(workbook.Sheets['Report Summary'], { header: 1, raw: false });
  assert(summaryRows.flat().includes(model.reportId), 'G07 report workbook should preserve report ID.');
  const orderRows = XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'], { header: 1, raw: false });
  assert(orderRows.flat().includes('Buyer Report') && orderRows.flat().includes('STYLE-RPT'), 'G07 report workbook should preserve typed order values.');
}

for (const fragment of [
  './assets/tna.css?v=0.11.1',
  './src/reports.js?v=0.7.2',
  './src/storage.js?v=0.11.0',
  './src/bootstrap.js',
  "'./apps/tna/src/reports.js'",
  'const reports=globalThis.VesaTnaReports',
  'function openReportPanel',
  'markReportPrint',
  'Download report data',
  'Download report Excel',
  'Print report',
  'Share fallback',
  'A shared link is unavailable in local mode.',
  '.tna-report-preview',
  '@media print',
  '@page',
  'body.tna-printing-report .tna-dialog',
  'break-inside:avoid'
]) {
  const haystack = fragment.includes('apps/tna') ? worker : fragment.startsWith('./') ? index : fragment.startsWith('.') || fragment.startsWith('@') || fragment.includes('tna-printing-report') || fragment.includes('break-inside') ? css : bootstrap;
  assert(haystack.includes(fragment), `G07 report UI integration missing: ${fragment}`);
}
assert(!bootstrap.includes('model.tasks.slice(0,10)'), 'G07 printable report preview must not silently truncate activities.');


// R01 master worksheet: exact source-backed dates/dependencies, never internal notes.
const fixture=domain.createPlan({
  templateId:'woven',buyerName:'Report Buyer',factoryName:'Report Factory',styleNo:'R01-CHECK',
  poNumber:'PO-R01',totalQty:900,orderConfirmedOn:'2026-10-15',buyerRequiredExFactory:'2026-12-20'
},{ownerUserId:'synthetic-editor'});
fixture.tasks[0].dates.currentTargetFinish='2026-11-04';
const frozen=domain.freezeBaseline(fixture,{actorId:'synthetic-editor',reason:'Synthetic baseline'});
assert(frozen.ok,'R01 Master TNA fixture must preserve a confirmed baseline.');
const amended=domain.updateTaskFollowup(frozen.plan,frozen.plan.tasks[0].taskId,{
  ownerParty:'Factory Merchandiser',currentTargetFinish:'2026-11-06',
  forecastFinish:'2026-11-10',note:'Restricted internal follow-up text'
},{actorId:'synthetic-editor'});
assert(amended.ok,'R01 Master TNA follow-up fixture must validate.');
const report=reports.buildReportModel(amended.plan,{reportId:'R01',language:'en'});
const rows=report.masterTna?.rows||[];
assert(rows.length===amended.plan.tasks.length,'R01 Master TNA must export every activity.');
assert(rows[0].stage===amended.plan.tasks[0].stage,'Stage must come from the garment template.');
assert(rows[0].baseline==='2026-11-04','Original baseline must come from immutable confirmed history.');
assert(rows[0].target==='2026-11-06'&&rows[0].forecast==='2026-11-10','Current and forecast dates must remain separate.');
assert(rows[0].calendarDaysLate===4&&rows[0].comparedTo==='forecast','Calendar delay must use source dates and a named basis.');
assert(rows[0].owner==='Factory Merchandiser','Source owner must survive R01 projection.');
assert(rows[1].dependencies.includes(amended.plan.tasks[0].templateRef),'Predecessor must come from the real dependency edges.');
assert(!JSON.stringify(report).includes('Restricted internal follow-up text'),'R01 export must not disclose internal revision notes.');
assert(JSON.stringify(frozen.plan.baselineSnapshots)===JSON.stringify(amended.plan.baselineSnapshots),'R01 projection cannot rewrite baseline.');
const xlsx=XLSX.read(storage.exportReportWorkbook(report),{type:'buffer',cellNF:true});
assert.deepEqual(xlsx.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Master TNA'],'R01 adds a master worksheet without removing existing exports.');
const worksheet=xlsx.Sheets['Master TNA'];
const grid=XLSX.utils.sheet_to_json(worksheet,{header:1,raw:false});
assert(grid.length===rows.length+1,'Master sheet needs every activity plus exact headers.');
assert(grid[0].includes('Original baseline')&&grid[0].includes('Predecessor refs'),'Merchandising fields must be identifiable.');
assert(grid[1][3]==='Factory Merchandiser','Excel owner must match report.');
assert(grid[1][4]==='2026-11-04'&&grid[1][5]==='2026-11-06'&&grid[1][6]==='2026-11-10','Excel dates must display exact civil values.');
assert(worksheet.E2.t==='n'&&worksheet.F2.t==='n'&&worksheet.G2.t==='n','Excel actual dates must be typed numeric date cells, not arbitrary text.');
assert(grid[1][8]==='4','Excel late calendar days must equal observed source difference.');
assert(worksheet['!autofilter']?.ref,'Master worksheet must support normal merchandiser filtering.');
const buyer=reports.buildReportModel(amended.plan,{reportId:'R02',language:'en'});
assert(!buyer.masterTna,'Buyer report must not inherit factory Master TNA material.');
assert(!XLSX.read(storage.exportReportWorkbook(buyer),{type:'buffer'}).SheetNames.includes('Master TNA'),'Buyer workbook must not expose R01 master sheet.');
const unknownReport=reports.buildReportModel(plan,{reportId:'R01',language:'en'});
assert(unknownReport.masterTna.rows[0].calendarDaysLate===null,'Absent date evidence cannot be reported as zero lateness.');
const unknownFile=XLSX.read(storage.exportReportWorkbook(unknownReport),{type:'buffer'});
assert(unknownFile.Sheets['Master TNA'].E2.v==='Needs Information','Missing baseline must remain visibly unknown in Excel.');
const hostile=domain.createPlan({templateId:'knit',buyerName:'Report Buyer',factoryName:'Report Factory',styleNo:'CLEAN',poNumber:'CLEAN'});
hostile.tasks[0].title='=HYPERLINK("https://not-executed.example","click")';
const harmless=reports.buildReportModel(hostile,{reportId:'R01'});
const cleanXlsx=XLSX.read(storage.exportReportWorkbook(harmless),{type:'buffer'});
assert(cleanXlsx.Sheets['Master TNA'].C2.t==='s'&&cleanXlsx.Sheets['Master TNA'].C2.v.startsWith("'="),'Untrusted activity text must never become an Excel formula.');


console.log('TNA G07 report language checks passed');
