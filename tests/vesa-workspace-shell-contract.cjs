const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const shell = fs.readFileSync(path.join(root, 'js', 'vesa-workspace-shell.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'vesa-workspace.css'), 'utf8');
function assert(condition, message) { if (!condition) throw new Error(message); }

assert(shell.includes('class VesaWorkspaceShell'), 'platform shell class missing');
assert(shell.includes("['Home', 'File', 'Edit', 'View', 'Tools', 'Help']"), 'universal menu order changed');
assert(shell.includes('Saved on this device') && shell.includes('Could not save'), 'save state vocabulary missing');
assert(shell.includes('descriptor') && shell.includes('callbacks'), 'descriptor/callback boundary missing');
assert(!/\b(?:tna|ppm|aql)\b/i.test(shell), 'platform shell must not hard-code an app id');
assert(css.includes('.vesa-workspace') && css.includes('--vesa-brand'), 'shared shell CSS/tokens missing');
assert((css.match(/position:\s*sticky/g) || []).length === 1, 'shared shell must own one sticky region');
const runtime = { window: {} };
vm.runInNewContext(shell, runtime, { filename: 'js/vesa-workspace-shell.js' });
assert(runtime.window.VesaWorkspaceShell.MENU_ORDER.join('|') === 'Home|File|Edit|View|Tools|Help', 'runtime menu order changed');
assert(runtime.window.VesaWorkspaceShell.descriptor({ id: 'future-app', name: 'Future App' }).route === '/apps/', 'descriptor default route changed');
assert(runtime.window.VesaWorkspaceShell.SAVE_STATES.failed.includes('download a saved copy'), 'runtime save state vocabulary changed');
for (const file of ['apps/tna/index.html', 'apps/ppm/index.html', 'apps/aql/index.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert(source.includes('vesa-workspace.css'), `${file} does not load shared workspace CSS`);
  assert(source.includes('vesa-workspace-shell.js'), `${file} does not load shared workspace shell`);
}
console.log('VESA workspace shell contract passed: neutral descriptor API, six-menu order, save vocabulary, scoped tokens, and three route registrations');
