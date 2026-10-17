/* APP-09 M2 source-preserving browser record codec tests (Node sandbox). */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),memory=new Map();
const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const context={module:{exports:{}},Math,Date,JSON,localStorage:storage};context.globalThis=context;
vm.createContext(context);
for(const p of ['src/domain/stage-flow.js','src/domain/wip-balance.js','src/domain/daily-output-ledger.js',
 'src/data/saved-copy-codec.js','src/data/local-record-port.js'])
 vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),context,{filename:p});
const L=context.VesaProductionDailyLedger,C=context.VesaProductionCopyCodec,S=context.VesaProductionLocalStore;
const header={poNo:'SYN-M2-PO',style:'SYN-POLO',colour:'Black',size:'M',lot:'SYN-A',factory:'SYN FACTORY',unit:'pieces',sourceRef:'SYNTHETIC ORDER'};
const a=L.create(header);a.mode='local';const store=new S('synthetic-user@invalid.local');
assert(store.key.startsWith('vesa.production-tracker.records.v1.'));
store.save(a);assert.equal(store.list().length,1);assert.equal(store.load(a.id).header.poNo,'SYN-M2-PO');
const original=memory.get(store.key),file=C.encode(a),roundtrip=C.decode(file);
assert.equal(roundtrip.id,a.id);assert.equal(roundtrip.header.sourceRef,a.header.sourceRef);
assert.throws(()=>C.decode(file.replace('SYN-M2-PO','ATTACKED-PO')),/altered/);
assert.throws(()=>C.decode('{}'),/altered|unsupported/);
assert.throws(()=>C.decode('{oops'),/not readable/);
assert.equal(memory.get(store.key),original,'Invalid backup must not touch local records');
const bad=JSON.parse(JSON.stringify(a));bad.header.unit='';assert.throws(()=>store.save(bad),/unit/);
const wrong=JSON.parse(JSON.stringify(a));wrong.version='OLD-VERSION';assert.throws(()=>store.save(wrong),/Unsupported/);
assert.equal(memory.get(store.key),original,'Invalid record must not replace saved record');
const future=JSON.parse(JSON.stringify(a));future.revision=2;store.save(future);
assert.throws(()=>store.save(a),/Older production revision/);
assert.equal(store.load(a.id).revision,2);
console.log('PRODUCTION M2 SAVE/COPY PASS: scoped local key, validate-before-write, revision downgrade guard, checksum/corrupt restore atomicity.');
