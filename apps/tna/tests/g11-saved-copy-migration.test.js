globalThis.localStorage={
  data:new Map(),
  getItem(key){return this.data.has(key)?this.data.get(key):null;},
  setItem(key,value){this.data.set(key,String(value));},
  removeItem(key){this.data.delete(key);}
};
globalThis.VesaTnaDomain=require('../src/domain.js');
const storage=require('../src/storage.js');
const domain=globalThis.VesaTnaDomain;
const assert=require('assert/strict');

const initial=domain.createPlan({
  templateId:'knit',buyerName:'Migration Buyer',factoryName:'Migration Factory',styleNo:'STYLE-MIGRATE',poNumber:'PO-MIGRATE',totalQty:1200,
  orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-20'
},{ownerUserId:'qa@vesaent.com'});
initial.tasks[0].dates.baselineStart='2026-10-01';
initial.tasks[0].dates.baselineFinish='2026-10-01';
initial.tasks[0].proofRefs.push('EVIDENCE-MIGRATION-1');
const frozen=domain.freezeBaseline(initial,{actorId:'qa@vesaent.com',reason:'Migration fixture baseline'});
assert.equal(frozen.ok,true);
const current=frozen.plan;
current.revisionEvents.push({eventId:'revision-migration-fixture',eventType:'controlled-target-change',revision:0,actorId:'qa@vesaent.com',createdAt:'2026-10-02T00:00:00.000Z',reason:'Fixture history'});

const legacy=JSON.parse(JSON.stringify(current));
legacy.schemaVersion='TNA360-ORDERPLAN-1.0.0';
delete legacy.integrationReferences;
const legacySnapshot=JSON.parse(JSON.stringify(legacy));
const legacyPayload={format:storage.FORMAT,schemaVersion:legacy.schemaVersion,storageVersion:storage.STORAGE_VERSION,exportedAt:'2026-10-03T00:00:00.000Z',checksum:storage.checksum(JSON.stringify(legacy)),record:legacy};
const imported=storage.importCopy(JSON.stringify(legacyPayload));

assert.deepEqual(legacy,legacySnapshot,'G11 migration must not mutate the old saved-copy input.');
assert.equal(imported.schemaVersion,domain.SCHEMA_VERSION);
assert.deepEqual(imported.integrationReferences,[]);
for(const key of ['recordId','createdAt','updatedAt','revision','commitments','tasks','baselineSnapshots','revisionEvents','auditEvents','evidenceReferences']){
  assert.deepEqual(imported[key],legacySnapshot[key],`G11 migration must preserve ${key}.`);
}

const user='migration-user';
const recordKey=`vesa.tna360.records.${user}`;
localStorage.setItem(recordKey,JSON.stringify({storageVersion:storage.STORAGE_VERSION,records:[{recordId:legacy.recordId,updatedAt:'2026-10-03T00:00:00.000Z',buyer:legacy.order.buyerName,style:legacy.order.styles[0].styleNo,po:legacy.order.poNumbers[0],plan:legacy}]}));
const loaded=storage.loadPlan(legacy.recordId,user);
assert.equal(loaded.schemaVersion,domain.SCHEMA_VERSION);
const persisted=JSON.parse(localStorage.getItem(recordKey));
assert.equal(persisted.records[0].plan.schemaVersion,domain.SCHEMA_VERSION,'G11 local reopen must persist the migrated schema atomically.');
assert.equal(persisted.records[0].updatedAt,'2026-10-03T00:00:00.000Z','G11 migration must not falsify the last user save time.');

const autoKey=`vesa.tna360.autosave.${user}`;
localStorage.setItem(autoKey,JSON.stringify({savedAt:'2026-10-03T01:00:00.000Z',plan:legacy}));
const recovered=storage.recoverAutosave(user);
assert.equal(recovered.plan.schemaVersion,domain.SCHEMA_VERSION);
assert.equal(JSON.parse(localStorage.getItem(autoKey)).plan.schemaVersion,domain.SCHEMA_VERSION);
assert.equal(recovered.savedAt,'2026-10-03T01:00:00.000Z','G11 autosave migration must preserve its recorded save time.');

const future=JSON.parse(JSON.stringify(legacyPayload));
future.record.schemaVersion='TNA360-ORDERPLAN-99.0.0';
future.schemaVersion=future.record.schemaVersion;
future.checksum=storage.checksum(JSON.stringify(future.record));
assert.throws(()=>storage.importCopy(JSON.stringify(future)),/Unsupported TNA plan schema/);

console.log('TNA G11 saved-copy migration passed: 1.0.0 -> 1.1.0, preserved baseline/history/evidence, persisted reload/autosave, rejected future schema');
