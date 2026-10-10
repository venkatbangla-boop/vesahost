const fs = require('fs');

const html = fs.readFileSync('apps/aql/index.html', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('AQL_G02_WORKFLOW_PATCH_2026_10_10'), 'A-G02 workflow adapter marker is missing');
assert(html.includes('What should I check next?'), 'Guided six-step prompt is missing');
for (const label of ['New Inspection', 'Continue Last', 'Open Saved', 'Practice Example', 'Open Saved Copy']) {
  assert(html.includes(label), `Home action is missing: ${label}`);
}
for (const handler of ['continueLast', 'openSavedInspection', 'makeAnotherCopy']) {
  assert(html.includes(`InspectionApp.prototype.${handler}`), `A-G02 handler is missing: ${handler}`);
}
assert(html.includes("copy.meta.parentId=source.meta.id"), 'Editable copy does not retain source lineage');
assert(html.includes("copy.meta.locked=false"), 'Editable copy does not clear the locked state');
assert(html.includes("PRACTICE-'+id.slice"), 'Practice copies are not kept in the practice identity space');
assert(html.includes('InspectionApp.STEPS.map'), 'The complete six-step navigator is not represented in the guide');
assert(html.includes('StageCatalog.stages'), 'The 13-stage workflow source remains available');
assert(html.includes('static AC='), 'Frozen AQL acceptance table source is missing');

console.log('AQL A-G02 workflow contract checks passed');
