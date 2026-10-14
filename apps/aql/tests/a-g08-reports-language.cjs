const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const preferences = fs.readFileSync('js/preferences.js', 'utf8');
const tracker = fs.readFileSync('docs/aql/06_EXECUTION_TRACKER.md', 'utf8');

function expect(condition, message) {
  assert.ok(condition, message);
}

const domainStart = html.indexOf('class DomainValue');
const domainEnd = html.indexOf('/** Schema owner:', domainStart);
const reportStart = html.indexOf('class ReportComposer');
const reportEnd = html.indexOf('/** Read-only shipment report sections.', reportStart);
const academyStart = html.indexOf('class KnowledgeAcademy');
const academyEnd = html.indexOf('class GuidedInspection', academyStart);
expect(domainStart >= 0 && domainEnd > domainStart, 'A-G08 DomainValue source is missing.');
expect(reportStart >= 0 && reportEnd > reportStart, 'A-G08 ReportComposer source is missing.');
expect(academyStart >= 0 && academyEnd > academyStart, 'A-G08 KnowledgeAcademy source is missing.');

const sandbox = {};
vm.runInNewContext(
  `${html.slice(domainStart, domainEnd)}\n${html.slice(reportStart, reportEnd)}\n${html.slice(academyStart, academyEnd)}\nthis.__exports = { ReportComposer, KnowledgeAcademy };`,
  sandbox,
  { filename: htmlPath },
);
const { ReportComposer, KnowledgeAcademy } = sandbox.__exports;

const escaped = ReportComposer.table(['Finding'], [['<script>alert(1)</script> & buyer text']]);
expect(!escaped.includes('<script>'), 'A-G08 report table emitted unescaped user text.');
expect(escaped.includes('&lt;script&gt;') && escaped.includes('&amp;'), 'A-G08 report table did not HTML-escape user text.');
expect(ReportComposer.validImage('javascript:alert(1)') === '', 'A-G08 report image guard accepted a script URL.');
expect(ReportComposer.validImage('data:image/png;base64,AAAA') === 'data:image/png;base64,AAAA', 'A-G08 valid image data was rejected.');

expect(KnowledgeAcademy.TASKS.length === 12, 'A-G08 guided report/evidence task count changed.');
for (const language of ['en', 'bn', 'hi', 'ta']) {
  const labels = KnowledgeAcademy.LABELS[language];
  expect(labels && ['how', 'clear', 'issue', 'unsure', 'unable', 'next', 'identity', 'confirm', 'saved'].every(k => String(labels[k] || '').trim()), `A-G08 authored guidance is incomplete for ${language}.`);
}
const rawUserValue = 'Buyer <North> / PO-42';
expect(rawUserValue === 'Buyer <North> / PO-42', 'A-G08 fixture accidentally mutated a raw user value.');

for (const requiredText of [
  "['buyer','Standard buyer report']",
  "['technical','Full technical report']",
  "['exceptions','Exception-focused report']",
  "['snapshot','Executive snapshot']",
  "['photos','Photo evidence']",
  "['sampling','Sampling plan & allocation']",
  "['defects','Defect breakdown / Pareto']",
  "['followup','Factory quality follow-up']",
  "['chain','Rework / reinspection chain']",
  "['loading','Container loading']",
  "['audit','Supplier quality audit']",
  "['fabric-roll','Fabric roll inspection']",
  "['materials','Incoming materials / shade']",
  "['production-control','Cutting / IPC / Inline']",
  "['readiness-control','Endline & Pre-Final Readiness']",
  "['measurements','Measurement report']",
  "['packing','Packing / barcode report']",
  "['capa','CAPA tracker']",
  'Print / Save PDF',
  'sandbox="allow-same-origin allow-modals"',
  'alt="${e(a.caption)}"',
  'role="img" aria-label=',
  'role="tablist" aria-label="Appearance settings"',
  'role="tabpanel" aria-labelledby=',
  'class="skip-link"',
  'button:focus-visible',
  'Full technical instructions remain in English',
  'Labels and inspection data were not changed.',
  "['en','ta','bn','hi'].includes(lang)",
  'vesa-preferences-change',
  'root.lang=s.language',
  "sampling:['orders','sampling']",
  "defects:['orders','sampling','defects']",
  "followup:['defects','capa']",
  "chain:[]",
  "presetTitles={sampling:'Sampling Plan & Allocation',defects:'Defect Breakdown / Pareto',followup:'Factory Quality Follow-Up',chain:'Rework / Reinspection Chain',capa:'CAPA Tracker'}",
  "['Lot','Qty','Code','Required sample','Allocated','Checked'",
  "['Rank','Category','Observed finding','Severity','Recorded row quantity'",
  "['Issue','Containment','Root cause','Corrective action','Owner','Due','Recorded status','Verification','Effectiveness','Closure evidence','Selected evidence references','Lifecycle review']",
  "['Record type','Source record','Finding / issue','Severity / quantity','Corrective action','Owner','Due','Recorded status','Selected evidence references','Lifecycle review']",
  "['Reinspection row','Source collection','Source record','Source project','Source report','Source revision','Carried-forward issue','Recorded status'",
  "['Container','Truck','Condition','Cleanliness','Damage / water / odour','Expected cartons','Loaded cartons'",
  "['Finding record','Clause / finding','System area','Criterion / revision','Objective evidence','Category','Owner','Due','CAPA reference','Verification'",
  "['Acknowledgement record','Representative','Designation','Findings received','Recorded response','Comments','Corrective-action statement'",
  "['Roll record','Roll ID','Mill','Batch / dye lot','Ticket','Invoice quantity','Received quantity','Ticket length m'",
  "['Incoming record','Material / lot','Material path','Supplier / mill','PO / material code','Batch','GRN / invoice reference'",
  "['Shade record','Record identity','Approved standard','Lab dip / strike-off','Light source','Roll / dye lot'",
  "['Source record',...fields.map(field=>field.label),'Calculated DHU','Calculated defective %'",
  "module==='endline'?['Calculated DHU','Calculated defective %','Calculated RFT %']:['Production margin vs approved minimum','Packing margin vs approved minimum','RFT not applicable']",
  "['buyer','technical','exceptions','packing','sampling','defects']",
]) {
  expect(html.includes(requiredText) || preferences.includes(requiredText), `A-G08 report/language/accessibility guard is missing: ${requiredText}`);
}

expect(html.includes('id="m45-report-verification"'), 'A-G08 visible report verification token is missing.');
expect(!html.includes('window.VESA_REPORT_TOKEN='), 'A-G08 report decorator must not append executable token script.');
expect(html.includes('role="region" aria-label="${this.e(title)} table" tabindex="0"'), 'A-G08 report table sections must remain named keyboard-focusable regions.');
const reportRows = [...tracker.matchAll(/^\| (AR\d{2}) \| ([^|]+) \| (PROVEN_LOCAL|CONDITIONAL) \|/gm)];
expect(reportRows.length === 15, 'A-G08 AR01-AR15 reconciliation must retain exactly 15 auditable rows.');
expect(new Set(reportRows.map(row => row[1])).size === 15, 'A-G08 AR01-AR15 reconciliation contains duplicate report IDs.');
for (const id of ['AR01', 'AR02', 'AR03', 'AR04', 'AR05', 'AR06', 'AR07', 'AR08', 'AR09', 'AR10', 'AR12', 'AR13', 'AR14', 'AR15']) expect(reportRows.some(row => row[1] === id && row[3] === 'PROVEN_LOCAL'), `${id} local report evidence status changed.`);

console.log('AQL A-G08 report, language and accessibility contract checks passed');
