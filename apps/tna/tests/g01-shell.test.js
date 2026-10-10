const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..', '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const index = read('apps/tna/index.html');
const bootstrap = read('apps/tna/src/bootstrap.js');
const css = read('apps/tna/assets/tna.css');
const catalogue = read('js/app-catalogue.js');
const preferences = read('js/preferences.js');
const worker = read('service-worker.js');

new vm.Script(bootstrap, { filename: 'apps/tna/src/bootstrap.js' });

assert(index.includes('data-auth-guard="app"'), 'TNA route must be protected by the existing app auth guard.');
assert(index.includes('/js/preferences.js'), 'TNA route must load shared preferences.');
assert(index.includes('src/domain.js'), 'TNA route must load its domain model before the UI bootstrap.');
assert(index.includes('src/bootstrap.js'), 'TNA route must load its bootstrap module.');
assert(catalogue.includes("id:'tna'"), 'App catalogue must register TNA.');
assert(catalogue.includes("route:'/apps/tna/'"), 'App catalogue must point TNA to /apps/tna/.');
assert(catalogue.includes("openLabelKey:'openTna'"), 'App catalogue must use the openTna preference label.');
assert((preferences.match(/openTna/g) || []).length === 4, 'Preferences must define openTna in all supported languages.');
assert(worker.includes("'./apps/tna/'"), 'Root service worker must precache the TNA route shell.');
assert(worker.includes("'./apps/tna/assets/tna.css'"), 'Root service worker must include TNA CSS.');
assert(worker.includes("'./apps/tna/src/domain.js'"), 'Root service worker must include TNA domain model.');
assert(worker.includes("'./apps/tna/src/bootstrap.js'"), 'Root service worker must include TNA bootstrap.');
assert(worker.includes("path.startsWith('/apps/tna')"), 'Root service worker must not serve stale cached TNA app HTML.');

for (const label of ['New TNA', 'Continue Last TNA', 'Open Saved TNA', 'Practice Example', 'Open Saved Copy', 'All Orders']) {
  assert(bootstrap.includes(label), `TNA home action missing: ${label}`);
}
for (const menu of ['HOME', 'FILE', 'EDIT', 'VIEW', 'TOOLS', 'HELP']) {
  assert(bootstrap.includes(menu), `TNA command menu missing: ${menu}`);
}
assert(bootstrap.includes('Local — this browser'), 'TNA must clearly state local browser storage status.');
assert(bootstrap.includes('Connected collaboration is blocked'), 'TNA must honestly disclose cloud dependency status.');
assert(css.includes('.tna-commandbar'), 'TNA CSS must define command bar styling.');
assert(css.includes('@media(max-width:850px)') && css.includes('@media(max-width:540px)'), 'TNA CSS must include responsive rules.');

console.log('TNA G01 shell checks passed');
