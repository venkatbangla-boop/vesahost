const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('apps/aql/index.html', 'utf8');
const sw = fs.readFileSync('apps/aql/service-worker.js', 'utf8');
const rootSw = fs.readFileSync('service-worker.js', 'utf8');
const ppmCss = fs.readFileSync('apps/ppm/workspace.css', 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(html.includes('AQL_RELEASE_PATCH_2026_10_09'), 'AQL release patch is missing');
assert(html.includes('Home') && html.includes('File') && html.includes('Edit') && html.includes('View') && html.includes('Tools') && html.includes('Help'), 'AQL menu labels are missing');
assert(html.includes('New Inspection') && html.includes('Continue Last Inspection') && html.includes('Open Saved Inspection') && html.includes('Practice Example') && html.includes('Open Saved Copy'), 'Home actions are incomplete');
assert(html.includes('Save Now') && html.includes('Make Another Copy') && html.includes('Download Saved Copy') && html.includes('Prepare Report') && html.includes('Share Report'), 'Plain-language file/report actions are incomplete');
assert(html.includes('Bengali') && html.includes('Hindi') && html.includes('Tamil'), 'Guidance language options are incomplete');
assert(html.includes('PRACTICE-') && html.includes('Practice Example - fictional data only'), 'Practice isolation markers are missing');
assert(html.includes("String(row.stages||'')"), 'Competency import guard is missing');
assert(html.includes('cleanId') && html.includes('clone.import(raw.masters)'), 'Master import hardening is missing');

new vm.Script(sw, { filename: 'apps/aql/service-worker.js' });
assert(sw.includes("vesa-aql-2026-10-10-3"), 'AQL cache version is missing');
assert(sw.includes("url.pathname.startsWith('/apps/aql/')"), 'AQL service worker scope guard is missing');

new vm.Script(rootSw, { filename: 'service-worker.js' });
assert(rootSw.includes("path.startsWith('/apps/aql')"), 'Root service worker does not exclude AQL');
assert(rootSw.includes("path.startsWith('/apps/ppm')"), 'Root service worker does not exclude PPM');

assert(/#fileMenu\{[^}]*position:(sticky|fixed)/.test(ppmCss), 'PPM menu is not sticky or fixed');
assert(/#fileMenu\{[^}]*z-index:1300/.test(ppmCss), 'PPM menu z-index was not raised');

console.log('AQL release contract checks passed');
