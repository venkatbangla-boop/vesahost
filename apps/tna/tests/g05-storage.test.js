globalThis.localStorage = {
  data: new Map(),
  failOnKey: null,
  getItem(key){ return this.data.has(key) ? this.data.get(key) : null; },
  setItem(key,value){ if (this.failOnKey === key) throw new Error('quota simulated'); this.data.set(key, String(value)); },
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

const oldSchema = JSON.parse(copy);
oldSchema.record.schemaVersion = 'TNA360-ORDERPLAN-0.0.0';
oldSchema.schemaVersion = oldSchema.record.schemaVersion;
oldSchema.checksum = storage.checksum(JSON.stringify(oldSchema.record));
assert.throws(() => storage.importCopy(JSON.stringify(oldSchema)), 'G05 unsupported saved-copy schema must be rejected.');

const mismatchedSchema = JSON.parse(copy);
mismatchedSchema.schemaVersion = 'TNA360-ORDERPLAN-1.0.0';
assert.throws(() => storage.importCopy(JSON.stringify(mismatchedSchema)), 'G05 mismatched saved-copy schema metadata must be rejected.');

assert.throws(() => storage.importPreview('A'.repeat(storage.MAX_BYTES + 1)), 'G05 oversized import text must be rejected.');

const adminKey = 'vesa.tna360.records.admin@vesa';
const beforeQuotaBox = localStorage.getItem(adminKey);
const quotaPlan = JSON.parse(JSON.stringify(plan));
quotaPlan.recordId = 'tna-quota-check';
quotaPlan.order.styles[0].styleNo = 'STYLE-QUOTA';
localStorage.failOnKey = adminKey;
assert.throws(() => storage.savePlan(quotaPlan, 'admin@vesa'), 'G05 quota failure must be reported.');
localStorage.failOnKey = null;
assert(localStorage.getItem(adminKey) === beforeQuotaBox, 'G05 quota failure must preserve previous saved box.');
assert(!localStorage.data.has(adminKey + '.tmp'), 'G05 quota failure must clean temporary storage key.');

localStorage.setItem('vesa.tna360.records.legacy', JSON.stringify({storageVersion:'OLD-TNA-STORAGE', records:[]}));
assert.throws(() => storage.listPlans('legacy'), 'G05 unsupported local storage schema must be rejected instead of silently migrated.');

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

const XLSX = require('../vendor/xlsx.full.min.js');
const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.aoa_to_sheet([
  ['Buyer', 'Factory', 'Style', 'PO', 'Quantity', 'Buyer Required Ex-Factory'],
  ['Buyer', 'Factory', 'STYLE-XLSX', 'PO-XLSX', 100, '10/11/26']
]);
sheet.C2.f = 'CONCAT("BAD")';
XLSX.utils.book_append_sheet(workbook, sheet, 'TNA');
const workbookBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const workbookPreview = storage.importWorkbookPreview(workbookBuffer, 'sample.xlsx');
assert(workbookPreview.workbook.sheetName === 'TNA', 'G05 workbook preview should report the source sheet.');
assert(workbookPreview.mapping.styleNo === 2, 'G05 workbook preview should map style header.');
assert(workbookPreview.formulaCells.some(cell => cell.column === 'C2'), 'G05 workbook preview should flag formula cells.');
assert(workbookPreview.ambiguousDates.length === 1, 'G05 workbook preview should flag ambiguous dates.');
assert.throws(() => storage.importWorkbookPreview(workbookBuffer, 'sample.xlsm'), 'G05 macro-enabled workbook names must be rejected.');

const formulaPlan = JSON.parse(JSON.stringify(plan));
formulaPlan.order.buyerName = '=HYPERLINK("bad")';
const csv = storage.exportCsv(formulaPlan);
assert(csv.includes('\'=HYPERLINK'), 'G05 CSV export should neutralize formula injection.');

const exportedWorkbook = storage.exportWorkbook(formulaPlan);
const exportedSheet = XLSX.read(exportedWorkbook, { type: 'buffer' }).Sheets['TNA Summary'];
assert(exportedSheet.A2.v.startsWith("'=HYPERLINK"), 'G05 workbook export should neutralize formula injection.');

console.log('TNA G05 storage/import checks passed');
