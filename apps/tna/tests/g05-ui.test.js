const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../src/bootstrap.js'), 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requiredFragments = [
  "actionCard('save'",
  "actionCard('open'",
  "actionCard('download'",
  "actionCard('copy'",
  "function openSavedList()",
  "function loadSavedRecord(recordId)",
  "function openSavedCopyDialog()",
  "function importSavedCopyText(value)",
  "function openImportPreview()",
  "storage.savePlan(state.currentPlan,userKey())",
  "storage.loadPlan(recordId,userKey())",
  "storage.importCopy(value)",
  "storage.importPreview(document.getElementById('tnaImportText').value)",
  "storage.importWorkbookPreview(reader.result,file.name)",
  "Macro-enabled files are rejected"
];

for (const fragment of requiredFragments) {
  assert(source.includes(fragment), `G05 UI contract missing: ${fragment}`);
}

const openActionBody = source.match(/function openAction\(action\)\{([^]+?)\}\r?\n  function openWizard/);
assert(openActionBody, 'G05 UI contract could not locate openAction body.');
for (const route of ['saveNow()', 'continueLast()', 'openSavedList()', 'openSavedCopyDialog()', 'downloadCopy()']) {
  assert(openActionBody[1].includes(route), `G05 action card does not route to ${route}.`);
}

const openMenuBody = source.match(/function openMenu\(name\)\{([^]+?)\}\r?\n  function openAction/);
assert(openMenuBody, 'G05 UI contract could not locate openMenu body.');
for (const route of ['openSavedList()', 'saveNow()', 'downloadCopy()', 'openSavedCopyDialog()', 'openImportPreview()']) {
  assert(openMenuBody[1].includes(route), `G05 File menu does not route to ${route}.`);
}

console.log('TNA G05 UI contract checks passed');

