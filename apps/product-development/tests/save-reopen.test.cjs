/* APP-15 M2 source-only local namespace and fail-closed, separate portable concept copies. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),memory=new Map();
const localStorage={getItem:k=>memory.has(k)?memory.get(k):null,
 setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const ctx={module:{exports:{}},Date,Math,JSON,localStorage};ctx.globalThis=ctx;vm.createContext(ctx);
for(const s of ['src/domain/concept-register.js','src/domain/board-layout.js','src/domain/revision-history.js',
 'src/data/saved-copy-codec.js','src/data/local-record-port.js'])
 vm.runInContext(fs.readFileSync(path.join(root,s),'utf8'),ctx,{filename:s});
const E=ctx.VesaProductConceptRegister,S=ctx.VesaProductLocalStore,C=ctx.VesaProductCopyCodec;
const a=new S('synthetic1@example.invalid'),b=new S('synthetic2@example.invalid');
assert.notEqual(a.key,b.key);assert(a.key.startsWith('vesa.product-development.records.v1.'));
let p=E.demo();a.save(p);assert.equal(a.list().length,1);assert.equal(b.list().length,0);
assert.equal(JSON.stringify(a.load(p.id)),JSON.stringify(p));
const encoded=C.encode(p);assert.equal(JSON.stringify(C.decode(encoded)),JSON.stringify(p));
assert.throws(()=>C.decode(encoded.replace('DEMO COASTAL','FORGED PRIVATE')),/Altered or unsupported/);
assert.throws(()=>C.decode('{broken'),/Unrecognized/);
assert.throws(()=>C.decode('x'.repeat(C.maxLength+1)),/2MB/);
const forged=JSON.parse(encoded);forged.record.status='BULK APPROVED';
forged.hash=C.hash(JSON.stringify(forged.record));
assert.throws(()=>C.decode(JSON.stringify(forged)),/must not infer buyer acceptance/);
const before=memory.get(a.key);
assert.equal(a.load(p.id).header.conceptName,'DEMO COASTAL POLO CAPSULE');
assert.equal(memory.get(a.key),before,'Bad import cannot alter device records');
const same=E.copy(p);same.header.conceptName='INJECTED SAME REV';
assert.throws(()=>a.save(same),/must not infer|diverges|Different same-version/);
assert.equal(memory.get(a.key),before);
const stale=E.create({conceptName:'SYN STALE',category:'TEE',season:'SYN',market:'SYN',
 sourceRef:'SYN',reviewedBy:'SYN',reviewDate:'2026-10-17'});stale.id=p.id;
assert.throws(()=>a.save(stale),/Older concept revision/);
const fork=E.copy(p);fork.id=E.id('CONCEPT-COPY');fork.revision++;
fork.updatedAt=new Date().toISOString();fork.audit.push({id:E.id('AUDIT'),
 revision:fork.revision,at:fork.updatedAt,action:'Separate local saved copy opened',recordId:fork.id});
a.save(fork);assert.equal(a.list().length,2);assert.equal(b.list().length,0);
assert.equal(a.load(p.id).revision,2);
const preserved=memory.get(a.key);memory.set(a.key,'{bad');
assert.throws(()=>a.read(),/damaged/);
assert.equal(memory.get(a.key),'{bad','Never auto-clear damaged local saved records');
memory.set(a.key,preserved);assert.equal(a.list().length,2);
console.log('PRODUCT DEVELOPMENT M2 LOCAL SAVE/OPEN PASS: namespaced source-only concepts, byte round-trip, explicit separate restore, stale/conflict and corrupt/oversize/forged atomic refusal.');
