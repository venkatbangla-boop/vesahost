/**
 * P-G00 fixture-only baseline for the existing PPM source.
 * Purpose: lock the real 168 checkpoint identities, profile/process catalogue
 * and current/V4 backup contract before any PPM domain rewrite.
 * Access: node apps/ppm/tests/p-g00-baseline.cjs
 * Failure: stop the gate; do not change checkpoint meanings or saved-record data.
 */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');

const root=path.resolve(__dirname,'../../..');
const context=vm.createContext({console,crypto:require('crypto').webcrypto,structuredClone,Date,window:{},document:{},setTimeout,clearTimeout,atob});
for(const file of ['core.js','planning-services.js','record-services.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'apps/ppm',file),'utf8'),context,{filename:file});
}

const tuples=vm.runInContext('SECTION_SCHEMA.flatMap(section=>section.items.map(item=>({section:section.id,id:item[0],label:item[1],critical:item[2]||0,hint:item[3]||""})))',context);
const profileIds=JSON.parse(JSON.stringify(vm.runInContext('Object.keys(PROFILE_MAP)',context)));
const processes=JSON.parse(JSON.stringify(vm.runInContext('Object.entries(PROCESS_OPTIONS).map(([id,value])=>({id,code:value[0],label:value[1]}))',context)));
const PpmRecordFactory=vm.runInContext('PpmRecordFactory',context);
const BackupCodec=vm.runInContext('BackupCodec',context);
const RelevanceEngine=vm.runInContext('RelevanceEngine',context);
const DemoDataBuilder=vm.runInContext('DemoDataBuilder',context);
const appVersion=vm.runInContext('APP_VERSION',context);

const tupleHash=crypto.createHash('sha256').update(JSON.stringify(tuples)).digest('hex');
assert.equal(tuples.length,168,'PPM master checkpoint count changed');
assert.equal(tupleHash,'4248a7bf5154583c813c50998b3d281d7879e6ba80eb275f5a05a4b2b65df3ad','PPM checkpoint tuple identity changed');
assert.deepEqual(profileIds,['','tshirt','polo','shirt','hoodie','sweatshirt','trouser','shorts','jeans','dress','skirt','jacket','active_top','active_bottom','sweater','intimate','kids_tshirt','uniform','custom']);
assert.deepEqual(processes,[
  {id:'0',code:'print',label:'Print'},
  {id:'1',code:'embroidery',label:'Embroidery'},
  {id:'2',code:'heatTransfer',label:'Heat Transfer'},
  {id:'3',code:'garmentWash',label:'Garment Wash'},
  {id:'4',code:'garmentDye',label:'Garment Dye'},
  {id:'5',code:'denimEffects',label:'Denim Effects / Laser'},
  {id:'6',code:'bonding',label:'Bonding / No-sew'},
  {id:'7',code:'seamSeal',label:'Seam Sealing'},
  {id:'8',code:'coating',label:'Coating / Lamination'},
  {id:'9',code:'fusing',label:'Fusing'},
  {id:'10',code:'quilting',label:'Quilting / Padding'},
  {id:'11',code:'specialFinish',label:'Special Finish'}
]);

const fresh=PpmRecordFactory.create();
assert.equal(appVersion,'5.1.5');
assert.deepEqual(Object.keys(fresh.statuses),JSON.parse(JSON.stringify(tuples.map(tuple=>tuple.id))));
assert.equal(fresh.approvals.length,0);
assert.equal(fresh.measurements.length,6);
assert.equal(JSON.stringify(fresh.changeReview),JSON.stringify({baseline:null,history:[]}));

const codec=new BackupCodec();
const portable=JSON.parse(codec.encode(fresh));
assert.deepEqual({format:portable.format,schema:portable.schema,version:portable.record.version},{format:'VESA-PPM',schema:2,version:'5.1.5'});
assert.equal(JSON.stringify(codec.decode(portable).statuses),JSON.stringify(fresh.statuses));

const legacy=JSON.parse(JSON.stringify(fresh));
legacy.version='4.1.1';
delete legacy.approvals;
delete legacy.changeReview;
legacy.measurements=legacy.measurements.map(({pom,spec,tol,method,risk,remark})=>({pom,spec,tol,method,risk,remark}));
const migrated=codec.decode(legacy);
assert.equal(migrated.version,appVersion);
assert.equal(JSON.stringify(migrated.approvals),JSON.stringify([]));
assert.equal(migrated.changeReview.baseline,null);
assert.equal(migrated.measurements[0].checkRequired,false);

const training=new DemoDataBuilder(new RelevanceEngine()).build();
assert.equal(training.locked,false);
assert.equal(training.meta.style,'TS-SAMPLE-001');
assert.equal(training.release.decision,'HOLD');
assert.equal(Object.keys(training.statuses).length,168);

console.log(`PPM P-G00 baseline passed: ${tuples.length} checkpoint tuples, ${profileIds.length} profiles, ${processes.length} processes, current schema 2/V${appVersion}, V4 migration and training fixture`);
