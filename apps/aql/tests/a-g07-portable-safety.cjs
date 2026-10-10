const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

function expect(condition, message) {
  assert.ok(condition, message);
}

const start = html.indexOf('class ProjectTransfer');
const end = html.indexOf('/** Read-only report composer.', start);
expect(start >= 0 && end > start, 'A-G07 ProjectTransfer source is missing.');

const sandbox = { atob, Blob, FileReader: class FileReader {} };
vm.runInNewContext(`${html.slice(start, end)}\nthis.__exports = { ProjectTransfer };`, sandbox, { filename: htmlPath });
const { ProjectTransfer } = sandbox.__exports;

const decoded = ProjectTransfer.decode('data:text/plain;base64,dmVzYQ==');
expect(decoded.size === 4 && decoded.type === 'text/plain', 'A-G07 valid embedded attachment did not decode.');
assert.throws(
  () => ProjectTransfer.decode('not-a-data-url'),
  /Invalid embedded attachment/,
  'A-G07 malformed embedded attachment was accepted',
);

for (const requiredText of [
  "static FORMAT='VESA360-PROJECT'",
  'PortableInspection.checkBudget(project)',
  'if(raw.version!==1)throw Error',
  'raw.files.length>5000',
  'Project exceeds the 200 MB import limit.',
  'Duplicate embedded file identities.',
  'Attachment integrity mismatch:',
  'Attachment byte size mismatch:',
  "next=DomainValue.id('ASSET')",
  "p.meta.locked=false",
  "p.rules.confirmed=false",
  "Imported as new draft",
  "if(file.size>280*1024*1024)",
  "if(/Security|NotAllowed|NotSupported/.test(name)",
  "if(/Quota/.test(name))return 'quota'",
  'Previously saved records were not deleted',
  'Export before closing',
  'No database is deleted or reset',
  'Restore as new draft',
  'Original evidence bytes are retained',
]) {
  expect(html.includes(requiredText), `A-G07 portable/safety guard is missing: ${requiredText}`);
}

console.log('AQL A-G07 portable transfer and save-safety contract checks passed');
