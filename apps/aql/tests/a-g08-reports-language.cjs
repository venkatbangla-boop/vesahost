const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const preferences = fs.readFileSync('js/preferences.js', 'utf8');

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
  "['measurements','Measurement report']",
  "['packing','Packing / barcode report']",
  "['capa','CAPA / reinspection report']",
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
]) {
  expect(html.includes(requiredText) || preferences.includes(requiredText), `A-G08 report/language/accessibility guard is missing: ${requiredText}`);
}

console.log('AQL A-G08 report, language and accessibility contract checks passed');
