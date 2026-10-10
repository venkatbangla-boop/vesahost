const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..', '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const reports = require('../src/reports.js');
const domain = require('../src/domain.js');
const bootstrap = read('apps/tna/src/bootstrap.js');
const index = read('apps/tna/index.html');
const worker = read('service-worker.js');
const css = read('apps/tna/assets/tna.css');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const coverage = reports.assertLanguageCoverage();
assert(coverage.ok, `G07 language coverage missing: ${coverage.missing.join(', ')}`);
assert(reports.REPORT_TYPES.length === 12, 'G07 must define R01-R12 report types.');
for (const lang of ['en', 'bn', 'hi', 'ta']) {
  const catalogue = reports.catalogue(lang);
  assert(catalogue.length === 12, `G07 ${lang} catalogue should expose 12 reports.`);
  assert(catalogue[0].id === 'R01' && catalogue[11].id === 'R12', `G07 ${lang} catalogue should preserve R01-R12 IDs.`);
}

const plan = domain.createPlan({
  templateId: 'knit', buyerName: 'Buyer Report', factoryName: 'Factory Report', styleNo: 'STYLE-RPT', poNumber: 'PO-RPT', totalQty: 900,
  orderConfirmedOn: '2026-10-12', buyerRequiredExFactory: '2026-12-15'
}, { ownerUserId: 'admin@vesa' });
const before = JSON.stringify(plan);
const bnModel = reports.buildReportModel(plan, { reportId: 'R01', language: 'bn', generatedAt: '2026-10-10T07:10:00.000Z', timezone: 'Asia/Dhaka' });
const taModel = reports.buildReportModel(plan, { reportId: 'R12', language: 'ta', generatedAt: '2026-10-10T07:10:00.000Z', timezone: 'Asia/Dhaka' });
assert(JSON.stringify(plan) === before, 'G07 report generation must not mutate the TNA plan.');
assert(bnModel.order.buyer === 'Buyer Report' && bnModel.order.style === 'STYLE-RPT', 'G07 must not translate typed buyer/style values.');
assert(taModel.reportId === 'R12' && taModel.source.recordId === plan.recordId, 'G07 R12 report model should keep source identity.');
assert(bnModel.labels.noFabrication.includes('Needs Information'), 'G07 reports must include no-fabrication note.');
assert(taModel.labels.shareFallback && taModel.labels.printFallback, 'G07 reports must include print/share fallback text.');
assert(bnModel.tasks.every(task => ['not-started','in-progress','blocked','submitted','approved','rejected','completed','waived','not-applicable'].includes(task.status)), 'G07 must preserve stable status IDs.');

for (const fragment of [
  './src/reports.js?v=0.7.0',
  "'./apps/tna/src/reports.js'",
  'const reports=globalThis.VesaTnaReports',
  'function openReportPanel',
  'Download report JSON',
  'Share fallback',
  'Cloud shared links are blocked until authenticated backend storage is authorized.',
  '.tna-report-preview',
  '@media print'
]) {
  const haystack = fragment.includes('apps/tna') ? worker : fragment.startsWith('./src/') ? index : fragment.startsWith('.') || fragment.startsWith('@media') ? css : bootstrap;
  assert(haystack.includes(fragment), `G07 report UI integration missing: ${fragment}`);
}

console.log('TNA G07 report language checks passed');
