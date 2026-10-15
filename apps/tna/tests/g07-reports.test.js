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
    const model = reports.buildReportModel(plan, { reportId: item.id, asOfDate: item.id==='R03'?'2026-10-10':undefined,
      ...(item.id==='R05'?{weekStart:'2026-10-05',weekEnd:'2026-10-11',reviewDate:'2026-10-10'}:{}),
      ...(item.id==='R06'?{asOfDate:'2026-10-10',managementConfirmed:true}:{}),
      ...(item.id==='R07'?{asOfDate:'2026-10-10',productionAudience:'internal',internalConfirmed:true}:{}),
      ...(item.id==='R08'?{asOfDate:'2026-10-10',commercialConfirmed:true,commercialAuthorityRef:'REVIEWED-COMMERCIAL-AUTHORITY'}:{}),
      ...(item.id==='R09'?{asOfDate:'2026-10-10',qualityConfirmed:true,qualityAuthorityRef:'REVIEWED-QUALITY-AUTHORITY'}:{}),
      ...(item.id==='R10'?{asOfDate:'2026-10-10',managementConfirmed:true,portfolioAuthorityRef:'REVIEWED-MANAGEMENT-AUTHORITY',portfolioSelectedIds:[plan.recordId],portfolioPlans:[plan]}:{}),
      ...(item.id==='R11'?{approvalAsOfDate:'2026-10-10',approvalAudience:'factory',approvalFactoryConsent:true,approvalAuthorityRef:'REVIEWED-FACTORY-AUTHORITY'}:{}),
      ...(item.id==='R12'?{scenarioAsOfDate:'2026-10-15',scenarioPlannerConsent:true,scenarioCalendarReviewed:true,scenarioAuthorityRef:'REVIEWED-PLANNER-SOURCE',scenarioTaskA:plan.tasks.find(t=>t.durationUnits>0).taskId,scenarioDurationA:'1',scenarioTaskB:plan.tasks.find(t=>t.durationUnits>0).taskId,scenarioDurationB:'2'}:{}),
      criticalReview:item.id==='R04'?{startAnchor:'orderConfirmedOn',weekKey:'mon-fri',exceptionDates:'',calendarConfirmed:true,
        durationsReviewed:true,dependenciesReviewed:true,endpointReviewed:true}:undefined,
      language: lang, generatedAt: '2026-10-10T07:10:00.000Z', timezone: 'Asia/Dhaka' });
    seen.add(model.reportId);
    assert(model.schema === 'VESA-TNA-REPORT-1', `G07 ${lang} ${item.id} should use the report schema.`);
    assert(model.generatedLabel && model.timezone === 'Asia/Dhaka', `G07 ${lang} ${item.id} should preserve generated date/timezone metadata.`);
    assert(item.id==='R10'?model.order.style==='Portfolio'&&model.portfolioReport?.ready:model.order.buyer === 'Buyer Report' && model.order.style === 'STYLE-RPT', `G07 ${lang} ${item.id} must not translate typed buyer/style values.`);
    assert(item.id === 'R02' ? model.tasks.length <= plan.tasks.length && !!model.buyerTna : item.id==='R03' ? model.tasks.length <= plan.tasks.length && !!model.factoryDaily?.ready : item.id==='R04' ? model.tasks.length <= plan.tasks.length && !!model.criticalPath?.ready : item.id==='R05' ? model.tasks.length <= plan.tasks.length && !!model.weeklyTna?.ready : item.id==='R06' ? model.tasks.length <= plan.tasks.length && !!model.delayRecovery?.ready : item.id==='R07' ? model.tasks.length <= plan.tasks.length && !!model.productionStatus?.ready : item.id==='R08' ? model.tasks.length <= plan.tasks.length && !!model.materialLcReport?.ready : item.id==='R09' ? model.tasks.length <= plan.tasks.length && !!model.shipmentReadiness?.ready : item.id==='R10' ? model.tasks.length <= plan.tasks.length && !!model.portfolioReport?.ready : item.id==='R11' ? model.tasks.length <= plan.tasks.length && !!model.approvalHistory?.ready : item.id==='R12' ? model.tasks.length===0 && !!model.scenarioComparison?.ready : model.tasks.length === plan.tasks.length, `G07 ${lang} ${item.id} must respect its approved audience scope.`);
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
assert(taModel.reportId === 'R12' && taModel.source.recordId === null && !taModel.scenarioComparison?.ready, 'G07 R12 must withhold source identity and data before planner review.');
assert(bnModel.labels.noFabrication.includes('Needs Information'), 'G07 reports must include no-fabrication note.');

assert.throws(()=>storage.exportReportWorkbook(taModel),/Scenario|options|date|Review|தேர்வு/i,
  'G07 R12 unreviewed reports must not export source order fields.');
for (const model of [bnModel]) {
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
  './assets/tna.css?v=0.15.0',
  './src/reports.js?v=0.18.0',
  './src/storage.js?v=0.20.0',
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

console.log('TNA G07 report language checks passed');
