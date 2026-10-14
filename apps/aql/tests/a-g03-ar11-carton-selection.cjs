/** AR11 pure contract: explicit eligible cartons, manual/automatic/combined provenance and immutable history. */
const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const classSource = name => {
  const start = html.indexOf(`class ${name}`);
  assert.ok(start >= 0, `${name} source is missing`);
  const next = html.indexOf('class ', start + name.length + 6);
  return html.slice(start, next < 0 ? html.length : next);
};
const sandbox = { Date, console };
vm.runInNewContext(`${classSource('DomainValue')}\n${classSource('CartonSelectionEngine')}\nthis.out={DomainValue,CartonSelectionEngine};`, sandbox, { filename: htmlPath });
const { CartonSelectionEngine: Engine } = sandbox.out;

const ids = Engine.parseUniverse('001-003, CTN-007..CTN-009; SPECIAL-A');
assert.deepEqual(Array.from(ids), ['001', '002', '003', 'CTN-007', 'CTN-008', 'CTN-009', 'SPECIAL-A']);
assert.throws(() => Engine.parseUniverse('010-001'), /ascending/);
assert.throws(() => Engine.parseUniverse('0001-6001'), /5,000/);

const entropy = [0xffffffff, 5, 4, 3, 2, 1, 0];
const drawn = Engine.draw(['C1', 'C2', 'C3', 'C4'], 3, () => entropy.shift());
assert.equal(new Set(drawn).size, 3);
assert.ok(drawn.every(id => ['C1', 'C2', 'C3', 'C4'].includes(id)));
assert.throws(() => Engine.draw(['C1', 'C1'], 1, () => 0), /unique/);

const carton = (id, number) => ({ id, number, selected: false, checkScope: {} });
const project = { cartons: [carton('A', '001'), carton('B', '002'), carton('C', '003'), carton('D', '004')], cartonSelection: Engine.fresh() };
Engine.apply(project, { sourceReference: 'PACK-LIST-R7', requiredCount: 2, policyType: 'internal-uniform', policyReference: '', inspector: 'Inspector One', remarks: 'Judgement selection', manualIds: ['A', 'C'], autoFill: false, at: '2026-10-14T10:00:00.000Z' });
assert.equal(project.cartonSelection.method, 'manual');
assert.deepEqual(Array.from(project.cartonSelection.selections, row => [row.cartonNumber, row.origin]), [['001', 'manual'], ['003', 'manual']]);
assert.deepEqual(Array.from(project.cartons, row => row.selected), [true, false, true, false]);

assert.throws(() => Engine.apply(project, { sourceReference: 'PACK-LIST-R8', requiredCount: 3, inspector: 'Inspector One', manualIds: ['B'], autoFill: true }), /Confirm replacement/);
assert.throws(() => Engine.apply(project, { sourceReference: 'PACK-LIST-R8', requiredCount: 3, inspector: 'Inspector One', manualIds: ['B'], autoFill: true, confirmReplace: true }), /reason/);
Engine.apply(project, { sourceReference: 'PACK-LIST-R8', requiredCount: 3, policyType: 'internal-uniform', policyReference: '', inspector: 'Inspector Two', remarks: 'Damage-risk carton retained manually', manualIds: ['B'], autoFill: true, confirmReplace: true, regenerationReason: 'Packing list revision changed', at: '2026-10-14T11:00:00.000Z' }, () => 0);
assert.equal(project.cartonSelection.method, 'combined');
assert.equal(project.cartonSelection.selections.length, 3);
assert.equal(project.cartonSelection.selections.filter(row => row.origin === 'manual').length, 1);
assert.equal(project.cartonSelection.selections.filter(row => row.origin === 'automatic').length, 2);
assert.ok(!project.cartonSelection.selections.filter(row => row.origin === 'automatic').some(row => row.cartonId === 'B'));
assert.equal(project.cartonSelection.history.length, 1);
assert.deepEqual(Array.from(project.cartonSelection.history[0].selections, row => row.cartonNumber), ['001', '003']);
assert.equal(project.cartonSelection.history[0].reason, 'Packing list revision changed');

assert.throws(() => Engine.apply({ cartons: [carton('A', '001')], cartonSelection: Engine.fresh() }, { sourceReference: 'PACK', requiredCount: 1, policyType: 'buyer-approved', inspector: 'I', manualIds: ['A'], autoFill: false }), /policy reference/);
assert.throws(() => Engine.apply({ cartons: [carton('A', '001')], cartonSelection: Engine.fresh() }, { sourceReference: 'PACK', requiredCount: 1, inspector: 'I', manualIds: ['MISSING'], autoFill: false }), /outside the eligible list/);

for (const required of ['Carton Selection', 'Auto Fill Remaining', 'Internal uniform method (not buyer-certified)', 'Manual selection', 'Carton selection record', 'does not calculate garment sample size']) {
  assert.ok(html.includes(required), `AR11 visible/report boundary is missing: ${required}`);
}
console.log('AQL AR11 carton-selection contract passed: ranges preserve IDs; manual, uniform automatic and combined draws retain distinct provenance and replacement history');
