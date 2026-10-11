/**
 * P-G08 typed sibling-record reference contract.
 * Access: node apps/ppm/tests/p-g08-references.cjs
 * Scope: pure PPM schema/codec only; no DOM, network or sibling-store access.
 */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../..');
const context=vm.createContext({console,crypto:require('crypto').webcrypto,structuredClone,Date,window:{},document:{},setTimeout,clearTimeout,atob});
for(const file of ['core.js','planning-services.js','record-services.js'])vm.runInContext(fs.readFileSync(path.join(root,'apps/ppm',file),'utf8'),context,{filename:file});
const C=vm.runInContext('({PpmRecordFactory,BackupCodec,RelevanceEngine,CoverageEngine,ValidationEngine,AppController})',context),plain=value=>JSON.parse(JSON.stringify(value));
const codec=new C.BackupCodec(),record=C.PpmRecordFactory.create(),coverage=new C.CoverageEngine(new C.RelevanceEngine()),validation=new C.ValidationEngine(new C.RelevanceEngine(),coverage);
assert.deepEqual(plain(record.linkedOrders),[],'new meetings default to no inferred sibling links');
const beforeDecision=plain({release:record.release,coverage:coverage.compute(record),readiness:validation.readiness(record)}),beforeSource=plain(record);
const tna={id:'LINK-TNA-001',sourceApp:'tna',sourceRecordId:'ORDER-2026-001',sourceVersion:'7',updatedAt:'2026-10-11T02:00:00.000Z',verifiedBy:'PPM Planner',verifiedAt:'2026-10-11T02:05:00.000Z',mappingPolicy:'tna-milestone-reference-v1',details:{orderId:'ORDER-2026-001',style:'STYLE-REF-1',po:'PO-REF-1',milestoneId:'MILESTONE-PPM',approvedRevision:'7'}};
const aql={id:'LINK-AQL-001',sourceApp:'aql',sourceRecordId:'VE-20261011-ABC123',sourceVersion:'R2',updatedAt:'2026-10-11T03:00:00.000Z',verifiedBy:'Factory QA',verifiedAt:'2026-10-11T03:10:00.000Z',mappingPolicy:'aql-inspection-reference-v1',details:{inspectionId:'VE-20261011-ABC123',stage:'Final inspection',recordVersion:'R2',reportReference:'AQL-REPORT-REF-2',decision:'NOT CONFORMED',decisionAt:'2026-10-11T02:55:00.000Z'}};
record.linkedOrders=[plain(tna),plain(aql)];
const input=plain(record),roundTrip=codec.decode(JSON.parse(codec.encode(record)));
assert.deepEqual(plain(roundTrip.linkedOrders),[tna,aql]);
assert.deepEqual(plain(record),input,'codec round-trip must not mutate the active PPM or its source references');
assert.deepEqual(plain({release:roundTrip.release,coverage:coverage.compute(roundTrip),readiness:validation.readiness(roundTrip)}),beforeDecision,'quoted sibling references cannot change PPM readiness or release');
const snapshot=plain(record);snapshot.meetingVersions=[];record.meetingVersions=[{id:'MTGV-LINK-1',parentId:'',amendmentReason:'Preserve explicit source references.',approvalsInvalidated:[],signedAt:'2026-10-11T03:15:00.000Z',snapshot}];
const withSnapshot=codec.decode(JSON.parse(codec.encode(record)));
assert.deepEqual(plain(withSnapshot.meetingVersions[0].snapshot.linkedOrders),[tna,aql]);
assert.equal(Object.isFrozen(withSnapshot.meetingVersions[0].snapshot.linkedOrders),true);

const legacy=plain(beforeSource);delete legacy.linkedOrders;
assert.deepEqual(plain(codec.decode(legacy).linkedOrders),[],'legacy records migrate to an empty reference list');
C.AppController.prototype.ensureCompatibility.call({record:legacy});assert.deepEqual(plain(legacy.linkedOrders),[],'direct legacy activation adds only an empty reference list');
const rejects=mutate=>{const candidate=plain(roundTrip);mutate(candidate);assert.throws(()=>codec.decode(candidate));};
rejects(x=>x.linkedOrders.push(plain(x.linkedOrders[0])));
rejects(x=>x.linkedOrders[1].id=x.linkedOrders[0].id);
rejects(x=>x.linkedOrders[0].sourceRecordId='OTHER-ORDER');
rejects(x=>x.linkedOrders[0].mappingPolicy='copy-tna-dates');
rejects(x=>x.linkedOrders[0].details.inspectionId='AQL-IN-TNA');
rejects(x=>x.linkedOrders[1].sourceVersion='R3');
rejects(x=>x.linkedOrders[1].details.decision='');
rejects(x=>x.linkedOrders[0].verifiedAt='');
rejects(x=>x.linkedOrders=Array.from({length:31},(_,index)=>({...plain(tna),id:`LINK-TNA-${index}`,details:{...plain(tna.details),milestoneId:`M-${index}`}})));

for(const file of ['core.js','record-services.js']){
  const source=fs.readFileSync(path.join(root,'apps/ppm',file),'utf8');
  assert.doesNotMatch(source,/indexedDB\.open\([^)]*(?:tna|aql)|fetch\(|XMLHttpRequest|apps\/(?:tna|aql)/i,`${file} introduced forbidden sibling-store or network access`);
}
console.log('PPM P-G08 reference contract passed: bounded TNA/AQL provenance, legacy migration, portable/snapshot round-trip, duplicate/malformed rejection, unchanged PPM decisions and zero sibling-store/network access');
