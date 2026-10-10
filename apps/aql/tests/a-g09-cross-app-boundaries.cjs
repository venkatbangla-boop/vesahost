const fs = require('fs');
const assert = require('assert/strict');

const aql = fs.readFileSync('apps/aql/index.html', 'utf8');
const catalogue = fs.readFileSync('js/app-catalogue.js', 'utf8');
const preferences = fs.readFileSync('js/preferences.js', 'utf8');
const integrationSpec = fs.readFileSync('docs/aql/05_ARCHITECTURE_SECURITY_INTEGRATION.md', 'utf8');

function expect(condition, message) {
  assert.ok(condition, message);
}

for (const route of [
  "id:'aql'",
  "route:'/apps/aql/'",
  "id:'ppm'",
  "route:'/apps/ppm/'",
  "id:'tna'",
  "route:'/apps/tna/'",
]) {
  expect(catalogue.includes(route), `A-G09 shared catalogue route is missing: ${route}`);
}
for (const label of ['openAql', 'openPpm', 'openTna', 'vesa.app.language', 'vesa-preferences-change']) {
  expect(preferences.includes(label), `A-G09 shared preference contract is missing: ${label}`);
}

for (const contract of [
  "InspectionRef = {tenantId, orderId, sourceApp:'aql', inspectionId, stageId, revision, outcome, generatedAt, verifiedAt, verifierId}",
  'ReportRef = {type, inspectionId, version, audience, hashOrReference, approvedBy}',
  'PPM can view AQL result only through explicit authorized lookup, not auto-mark sample approval.',
  'TNA may reflect a final-inspection actual date if verified, but not overwrite original baseline',
  'no cross-app `localStorage` reads or direct AQL table rewrites by PPM/TNA',
]) {
  expect(integrationSpec.includes(contract), `A-G09 integration boundary is missing: ${contract}`);
}

for (const boundary of [
  'No cloud server is bundled.',
  'Import always opens as a separate draft.',
  'Quality OS signals never release a shipment automatically.',
  'Remote JSON pulled for review',
  'Connected snapshot opened as separate review draft',
]) {
  expect(aql.includes(boundary), `A-G09 AQL boundary marker is missing: ${boundary}`);
}

expect(!aql.includes("localStorage.getItem('ppm"), 'A-G09 AQL source reads a PPM local-storage namespace directly.');
expect(!aql.includes("localStorage.getItem('tna"), 'A-G09 AQL source reads a TNA local-storage namespace directly.');
expect(aql.includes('sourceTrace'), 'A-G09 source trace remains an explicit local record field.');
expect(aql.includes('reportDate'), 'A-G09 report/date fields remain distinct from cross-app milestone updates.');

console.log('AQL A-G09 shared reference and cross-app boundary contract checks passed');
