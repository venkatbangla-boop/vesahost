const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const starter = path.join(root, 'templates', 'vesa-next-app');
const read = name => fs.readFileSync(path.join(starter, name), 'utf8');

for (const name of ['README.md', 'app-registration.example.js', 'workspace-adapter.example.js', 'record-port.example.js', 'ACCEPTANCE.md']) {
  assert.ok(fs.existsSync(path.join(starter, name)), `missing ${name}`);
}

const registration = { module: { exports: {} } };
vm.runInNewContext(read('app-registration.example.js'), registration);
const { catalogueEntry, openLabels } = registration.module.exports;
assert.equal(catalogueEntry.route, '/apps/next-app/');
assert.deepEqual(Object.keys(openLabels).sort(), ['bn', 'en', 'hi', 'ta']);

const adapter = read('workspace-adapter.example.js');
for (const marker of ['VesaWorkspaceShell', "contentTarget: '#nextAppMain'", 'callbacks', 'app-user-bar']) assert.ok(adapter.includes(marker));
for (const duplicate of ['<header', '<nav', 'VESA logo']) assert.ok(!adapter.includes(duplicate));

const port = read('record-port.example.js');
for (const marker of ['VESA-NEXT-APP-SAVED-COPY', 'MAX_BYTES', 'structuredClone', 'safeSpreadsheetCell']) assert.ok(port.includes(marker));

const acceptance = read('ACCEPTANCE.md');
for (const marker of ['Home / File / Edit / View / Tools / Help', 'English, Bengali, Hindi and Tamil', 'browser reload', 'TNA, PPM, AQL', 'secrets']) assert.ok(acceptance.includes(marker));

const catalogue = fs.readFileSync(path.join(root, 'js', 'app-catalogue.js'), 'utf8');
assert.ok(!catalogue.includes("id:'next-app'"), 'starter must not register an unapproved app');

console.log('VESA next-app starter passed: shared shell, catalogue/i18n, local saved-copy, report safety and cross-app acceptance boundaries are reusable without registering a domain');
