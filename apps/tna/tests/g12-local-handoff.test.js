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
const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'../../..');
const plan=domain.createPlan({
  templateId:'knit',buyerName:'Handoff Buyer',factoryName:'Handoff Factory',styleNo:'STYLE-G12',poNumber:'PO-G12',totalQty:600,
  destinationMarket:'United Kingdom',portOfLoading:'Chattogram',portOfDischarge:'Felixstowe',sizeRange:'S–L',incoterm:'FOB',shipmentMethod:'Sea',
  orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-01',buyerRequiredETD:'2026-12-04',buyerRequiredETA:'2027-01-05',
  colorSizeBreakdown:'Navy | S | 200\nNavy | M | 200\nNavy | L | 200'
},{ownerUserId:'handoff-user'});
plan.tasks[0].dates.baselineStart='2026-10-01';
plan.tasks[0].dates.baselineFinish='2026-10-01';
plan.tasks[0].dates.actualFinish='2026-10-01';
plan.evidenceReferences.push({id:'HANDOFF-EVIDENCE-1',kind:'synthetic'});
const frozen=domain.freezeBaseline(plan,{actorId:'handoff-user',reason:'G12 migration rehearsal'});
assert.equal(frozen.ok,true);
const candidate=frozen.plan,candidateSnapshot=JSON.parse(JSON.stringify(candidate));

storage.savePlan(candidate,'handoff-user');
const currentCopy=storage.exportCopy(candidate);
const currentRestored=storage.importCopy(currentCopy);
assert.deepEqual(currentRestored,candidateSnapshot,'Current saved-copy backup/restore must be lossless.');

const legacy=JSON.parse(JSON.stringify(candidate));
legacy.schemaVersion='TNA360-ORDERPLAN-1.0.0';
delete legacy.integrationReferences;
delete legacy.order.portOfLoading;
delete legacy.order.portOfDischarge;
legacy.order.colorSizeBreakdown=[];
legacy.order.styles[0].colorways=[];
const legacySnapshot=JSON.parse(JSON.stringify(legacy));
const legacyPayload={format:storage.FORMAT,schemaVersion:legacy.schemaVersion,storageVersion:storage.STORAGE_VERSION,exportedAt:'2026-10-11T17:00:00.000Z',checksum:storage.checksum(JSON.stringify(legacy)),record:legacy};
const migrated=storage.importCopy(JSON.stringify(legacyPayload));
assert.deepEqual(legacy,legacySnapshot,'Migration dry run must not mutate the source backup.');
assert.equal(migrated.schemaVersion,domain.SCHEMA_VERSION);
for(const key of ['recordId','createdAt','updatedAt','revision','commitments','tasks','baselineSnapshots','revisionEvents','auditEvents','evidenceReferences'])assert.deepEqual(migrated[key],legacySnapshot[key],`Migration dry run must preserve ${key}.`);
assert.deepEqual(migrated.integrationReferences,[]);
assert.equal(migrated.order.portOfLoading,undefined,'Migration must not invent a loading port.');

const storedBefore=localStorage.getItem('vesa.tna360.records.handoff-user');
const corrupt=JSON.parse(currentCopy);corrupt.checksum='corrupt';
assert.throws(()=>storage.importCopy(JSON.stringify(corrupt)),/checksum/i);
assert.equal(localStorage.getItem('vesa.tna360.records.handoff-user'),storedBefore,'Rejected restore must preserve the good saved record.');

const index=fs.readFileSync(path.join(root,'apps/tna/index.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const readiness=fs.readFileSync(path.join(root,'docs/VESA_360_RELEASE_READINESS.md'),'utf8');
const localAssets=[...index.matchAll(/(?:src|href)="(\.\/[^"?]+)(?:\?[^" ]*)?"/g)].map(match=>match[1]);
assert.ok(localAssets.length>=10,'Release inventory must find the local TNA bundle assets.');
for(const asset of localAssets)assert.ok(worker.includes(`'./apps/tna/${asset.slice(2)}'`),`Offline inventory is missing ${asset}.`);
assert.match(worker,/vesa-v68-platform-g09/,'Release inventory must pin the tested service-worker cache.');
assert.match(readiness,/\*\*Local handoff candidate:\*\* `87f1e2a` \(latest runtime implementation: `87f1e2a`\)/,'Runbook must pin the accepted local baseline and latest runtime SHA.');
assert.match(readiness,/\*\*Decision:\*\* \*\*HOLD — not ready for production deployment\*\*/,'Runbook must retain the release HOLD.');
assert.match(readiness,/Not staged, not deployed, not live-verified, not authorized/,'Runbook must distinguish local evidence from production state.');
assert.match(readiness,/Microsoft Excel desktop-reader inspection remains unproven/,'Runbook must retain the genuine Excel-reader gap.');
assert.match(readiness,/Real phones\/tablets, independent screen-reader review, physical factory acceptance/,'Runbook must retain physical and independent accessibility gaps.');
assert.match(readiness,/DEFERRED_BY_SCOPE/,'Runbook must retain provider-dependent scope boundaries.');

console.log(`TNA G12 local handoff passed: current backup restore, 1.0.0 migration dry run, corrupt-restore preservation and ${localAssets.length} offline assets`);
