/* APP-14 per-browser local user boundary, untrusted saved-copy and revision atomic proof (synthetic). */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),memory=new Map(),localStorage={
 getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v)),
 removeItem:k=>memory.delete(k)};
const env={module:{exports:{}},Date,Math,JSON,BigInt,localStorage};env.globalThis=env;vm.createContext(env);
for(const name of ['src/domain/claim-register.js','src/domain/exposure-ledger.js',
 'src/domain/settlement-history.js','src/data/saved-copy-codec.js','src/data/local-record-port.js'])
 vm.runInContext(fs.readFileSync(path.join(base,name),'utf8'),env,{filename:name});
const E=env.VesaClaimRegister,C=env.VesaClaimsCopyCodec,S=env.VesaClaimsLocalStore;
const a=new S('synthetic1@example.invalid'),b=new S('synthetic2@example.invalid');
assert.notEqual(a.key,b.key);assert(a.key.startsWith('vesa.claims-disputes.records.v1.'));
const h={caseNumber:'SYN CLAIM',buyer:'SYN BUYER',supplier:'SYN SUPPLIER',poNo:'SYN-PO-1',
 shipmentRef:'SYN-SHP-1',claimCategory:'SYN SHORTAGE',openedDate:'2026-10-17',
 sourceRef:'SYN SOURCE',allegationSummary:'SYN ALLEGED SHORTAGE',reviewedBy:'SYN QA',reviewDate:'2026-10-17'};
let p=E.create(h);a.save(p);
assert.equal(a.list().length,1);assert.equal(b.list().length,0);assert.equal(a.load(p.id).revision,0);
const original=C.encode(p),decoded=C.decode(original);
assert.equal(JSON.stringify(decoded),JSON.stringify(p));
assert.throws(()=>C.decode(original.replace('SYN CLAIM','FORGED CLAIM')),/Altered\/unsupported/);
assert.throws(()=>C.decode('{broken'),/Unrecognized saved claim/);
assert.throws(()=>C.decode('x'.repeat(C.maxLength+1)),/safety limit/);
const forged=JSON.parse(original);forged.record.authority='LEGALLY ACCEPTED';
forged.hash=C.hash(JSON.stringify(forged.record));
assert.throws(()=>C.decode(JSON.stringify(forged)),/cannot certify liability/);
const before=memory.get(a.key);
assert.equal(a.load(p.id).header.buyer,'SYN BUYER');
assert.equal(memory.get(a.key),before,'Rejected file never modifies old local records');
p=E.append(p,'finding',{id:'SYN F1',category:'SYN FABRIC CLAIM',description:'SYN OBSERVED SHADE ISSUE',
 affectedQty:3,quantityUnit:'pieces',sourceRef:'SYN QA PHOTO REFERENCE',
 sourceDate:'2026-10-17',reviewedBy:'SYN QA',reviewDate:'2026-10-17',
 valueReviewState:'needs-information',allegedAmount:null});
a.save(p);
const stale=E.create(h);stale.id=p.id;
assert.throws(()=>a.save(stale),/Older local claim revision/);
const mismatch=E.copy(p);mismatch.findings[0].liabilityAdmitted=true;
assert.throws(()=>a.save(mismatch),/cannot admit liability/);
assert.equal(a.load(p.id).findings.length,1);
const fork=E.copy(p);fork.id=E.id('CASE-COPY');fork.revision++;fork.updatedAt=new Date().toISOString();
fork.audit.push({revision:fork.revision,at:fork.updatedAt,
 action:'Separate local saved-copy restore, original unchanged',recordId:fork.id});
a.save(fork);assert.equal(a.list().length,2);assert.equal(b.list().length,0);
assert.equal(a.load(p.id).revision,1,'Original audit unaffected by restored copy');
const good=memory.get(a.key);memory.set(a.key,'{invalid');
assert.throws(()=>a.read(),/Existing claim source damaged/);
assert.equal(memory.get(a.key),'{invalid','Invalid local store never deleted or reinitialized');
memory.set(a.key,good);assert.equal(a.list().length,2);
console.log('CLAIMS M2 LOCAL SAVED COPY PASS: user namespace isolation, exact portable restore, tamper/unsupported/corrupt/old-revision atomic guards, separate copy and immutable original.');
