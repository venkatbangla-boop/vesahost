globalThis.localStorage = {
  data: new Map(),
  getItem(key){ return this.data.has(key) ? this.data.get(key) : null; },
  setItem(key,value){ this.data.set(key, String(value)); },
  removeItem(key){ this.data.delete(key); }
};
globalThis.VesaTnaDomain = require('../src/domain.js');
const storage = require('../src/storage.js');
const domain = globalThis.VesaTnaDomain;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const plan = domain.createPlan({
  templateId: 'knit',
  buyerName: 'Buyer',
  factoryName: 'Factory',
  styleNo: 'STYLE-SAVE',
  poNumber: 'PO-SAVE',
  totalQty: 1000,
  buyerRequiredExFactory: '2026-11-30'
}, { ownerUserId: 'admin@vesa' });

const saved = storage.savePlan(plan, 'admin@vesa');
assert(saved.recordId === plan.recordId, 'G05 save should return saved record summary.');
assert(storage.listPlans('admin@vesa').length === 1, 'G05 list should include saved TNA.');
assert(storage.loadPlan(plan.recordId, 'admin@vesa').order.styles[0].styleNo === 'STYLE-SAVE', 'G05 reopen should recover exact style.');
assert(storage.autosave(plan, 'admin@vesa'), 'G05 autosave should accept a valid plan.');
assert(storage.recoverAutosave('admin@vesa').plan.recordId === plan.recordId, 'G05 recovery should return autosaved plan.');

const copy = storage.exportCopy(plan);
const reopened = storage.importCopy(copy);
assert(reopened.recordId === plan.recordId, 'G05 saved copy round-trip should preserve record ID.');
assert.throws = (fn, msg) => { let thrown = false; try { fn(); } catch { thrown = true; } if (!thrown) throw new Error(msg); };
const corrupt = copy.replace('"format":"VESA-TNA"', '"format":"BAD"');
assert.throws(() => storage.importCopy(corrupt), 'G05 corrupt saved copy must be rejected.');

const history = storage.createHistory(plan);
const changed = JSON.parse(JSON.stringify(plan));
changed.order.buyerName = 'Buyer changed';
const pushed = storage.pushHistory(history, changed);
assert(storage.undo(pushed).present.order.buyerName === 'Buyer', 'G05 undo should restore previous draft.');
assert(storage.redo(storage.undo(pushed)).present.order.buyerName === 'Buyer changed', 'G05 redo should restore next draft.');

const preview = storage.importPreview('Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory\nBuyer,Factory,=STYLE,PO,100,10/11/26');
assert(preview.mapping.buyerName === 0 && preview.mapping.totalQty === 4, 'G05 import preview should map familiar headers.');
assert(preview.formulaCells.length === 1, 'G05 formula-like import cells should be blocked.');
assert(preview.ambiguousDates.length === 1, 'G05 ambiguous dates should require mapping.');

const formulaPlan = JSON.parse(JSON.stringify(plan));
formulaPlan.order.buyerName = '=HYPERLINK("bad")';
const csv = storage.exportCsv(formulaPlan);
assert(csv.includes('\'=HYPERLINK'), 'G05 CSV export should neutralize formula injection.');

console.log('TNA G05 storage/import checks passed');
