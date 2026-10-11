globalThis.localStorage={
  data:new Map(),
  getItem(key){return this.data.has(key)?this.data.get(key):null;},
  setItem(key,value){this.data.set(key,String(value));},
  removeItem(key){this.data.delete(key);}
};
globalThis.VesaTnaDomain=require('../src/domain.js');
const domain=globalThis.VesaTnaDomain;
const storage=require('../src/storage.js');
const assert=require('assert/strict');

const input={
  templateId:'knit',buyerName:'Order Master Buyer',factoryName:'Order Master Factory',brand:'Order Master Brand',styleNo:'STYLE-F06',poNumber:'PO-F06',totalQty:1000,unit:'pcs',
  destinationMarket:'United Kingdom',portOfLoading:'Chattogram',portOfDischarge:'Felixstowe',incoterm:'FOB',shipmentMethod:'Sea',sizeRange:'S–L',
  orderConfirmedOn:'2026-10-01',poReceivedOn:'2026-10-02',buyerRequiredExFactory:'2026-12-01',buyerRequiredETD:'2026-12-04',buyerRequiredETA:'2027-01-05',destinationRequiredDate:'2027-01-08',
  colorSizeBreakdown:'Navy | S | 200\nNavy | M | 300\nIvory | M | 250\nIvory | L | 250'
};
const snapshot=JSON.parse(JSON.stringify(input));
const plan=domain.createPlan(input,{ownerUserId:'f06-user'});

assert.deepEqual(input,snapshot,'F06 normalization must not mutate entered input.');
assert.equal(plan.validation.ok,true,plan.validation.errors.join(' '));
assert.deepEqual(plan.order.colorSizeBreakdown,[
  {color:'Navy',size:'S',quantity:200},{color:'Navy',size:'M',quantity:300},{color:'Ivory',size:'M',quantity:250},{color:'Ivory',size:'L',quantity:250}
]);
assert.deepEqual(plan.order.styles[0].colorways,['Navy','Ivory']);
assert.equal(plan.order.styles[0].sizeRange,'S–L');
assert.equal(plan.order.portOfLoading,'Chattogram');
assert.equal(plan.order.portOfDischarge,'Felixstowe');
assert.equal(plan.commitments.buyerRequiredETD,'2026-12-04');
assert.equal(plan.commitments.buyerRequiredETA,'2027-01-05');
assert.equal(plan.commitments.destinationRequiredDate,'2027-01-08');
assert.equal(plan.validation.warnings.some(message=>/breakdown totals/i.test(message)),false);

const mismatch=domain.createPlan({...input,totalQty:1001});
assert.match(mismatch.validation.warnings.join(' '),/totals 1000, not the order quantity 1001/);
const malformed=domain.createPlan({...input,colorSizeBreakdown:'Navy | S | 100\nNavy | S | 200\nIvory | M | unknown'});
assert.equal(malformed.validation.ok,false);
assert.match(malformed.validation.errors.join(' '),/duplicates Navy \/ S/);
assert.match(malformed.validation.errors.join(' '),/positive whole quantity/);

storage.savePlan(plan,'f06-user');
const reopened=storage.loadPlan(plan.recordId,'f06-user');
assert.deepEqual(reopened.order,plan.order,'F06 current-schema save/reopen must preserve the complete order master.');
assert.deepEqual(reopened.commitments,plan.commitments,'F06 current-schema save/reopen must preserve target dates.');
const portable=storage.importCopy(storage.exportCopy(plan));
assert.deepEqual(portable.order,plan.order,'F06 saved-copy round trip must preserve additive order fields.');

const legacy=JSON.parse(JSON.stringify(plan));
legacy.schemaVersion='TNA360-ORDERPLAN-1.0.0';
delete legacy.integrationReferences;
delete legacy.order.portOfLoading;
delete legacy.order.portOfDischarge;
legacy.order.colorSizeBreakdown=[];
legacy.order.styles[0].colorways=[];
const migrated=storage.migratePlan(legacy).plan;
assert.equal(migrated.schemaVersion,domain.SCHEMA_VERSION);
assert.equal(migrated.order.portOfLoading,undefined,'Legacy migration must not invent a loading port.');
assert.equal(migrated.order.portOfDischarge,undefined,'Legacy migration must not invent a discharge port.');
assert.deepEqual(migrated.order.colorSizeBreakdown,[],'Legacy migration must preserve an absent breakdown as empty.');

console.log('TNA F06 order master passed: structured breakdown, ports, target dates, validation, 1.1.0 round trip and 1.0.0 compatibility');
