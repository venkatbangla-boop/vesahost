/* APP-12 synthetic per-identity local storage, portable copy and tampering isolation. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),memory=new Map();
const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const ctx={module:{exports:{}},localStorage,Date,Math,JSON,BigInt};ctx.globalThis=ctx;vm.createContext(ctx);
for(const x of ['src/domain/quote-normalization.js','src/domain/comparability-gate.js','src/domain/landed-scenario.js',
 'src/data/saved-copy-codec.js','src/data/local-record-port.js'])
 vm.runInContext(fs.readFileSync(path.join(base,x),'utf8'),ctx,{filename:x});
const E=ctx.VesaSupplierQuote,C=ctx.VesaSupplierCopyCodec,S=ctx.VesaSupplierLocalStore;
const a=new S('synthetic1@example.invalid'),b=new S('synthetic2@example.invalid');
assert.notEqual(a.key,b.key);assert(a.key.startsWith('vesa.fabric-supplier-comparison.records.v1.'));
let p=E.create({article:'SYN COTTON PIQUE',composition:'SYN 100% COTTON',gsm:'210',
 width:'68',widthUnit:'in',construction:'PIQUE',shrinkageBasis:'SYN WASH LAB',
 shrinkage:'4',sourceRef:'SYN TECH',reviewedBy:'SYN QA',reviewDate:'2026-10-17',
 requestedTradeTerm:'FOB',requestedDeliveryTerm:'SYN PORT'});p.mode='local';
a.save(p);assert.equal(a.list().length,1);assert.equal(b.list().length,0);
const v=C.encode(p),restore=C.decode(v);assert.equal(restore.id,p.id);
assert.equal(JSON.stringify(restore),JSON.stringify(p));
const old=localStorage.getItem(a.key);
assert.throws(()=>C.decode(v.replace('SYN COTTON PIQUE','FORGED CHEAP FABRIC')),/altered\/unsupported/);
assert.throws(()=>C.decode('{bad'),/unreadable/);
assert.throws(()=>C.decode('x'.repeat(C.maxLength+1)),/safe browser file size/);
const forged=JSON.parse(v);forged.record.status='PREFERRED SUPPLIER CERTIFIED';
forged.hash=C.hash(JSON.stringify(forged.record));
assert.throws(()=>C.decode(JSON.stringify(forged)),/No automatic supplier selection/);
assert.equal(localStorage.getItem(a.key),old,'Rejected copies must not erase original');
const older=E.create({...p.requirement});older.id=p.id;

p=E.append(p,'offer',{id:'SYN-OFFER-1',supplier:'SYN SUPPLIER',article:p.requirement.article,
 composition:p.requirement.composition,gsm:p.requirement.gsm,width:p.requirement.width,
 widthUnit:'in',construction:p.requirement.construction,shrinkageBasis:p.requirement.shrinkageBasis,
 shrinkage:p.requirement.shrinkage,quoteRef:'SYN SIGNED QUOTE',quoteDate:'2026-10-17',validTo:'2026-11-17',
 unitPrice:'2.0000',currency:'USD',unit:'yd',moq:1000,moqUnit:'yd',leadDays:30,
 tradeTerm:'FOB',origin:'SYN SOURCE COUNTRY',deliveryTerm:'SYN PORT',specSourceRef:'SYN SPEC',
 qualitySourceRef:'SYN LAB',qualityEquivalence:'needs-information',
 qualityReviewedBy:'',qualityReviewDate:'',sourceRef:'SYN ACTUAL OFFER SOURCE'});
a.save(p);

assert.equal(a.load(p.id).offers.length,1);
assert.throws(()=>a.save(older),/Older supplier source/);
const broken=E.copy(p);broken.offers[0].currency='X';
assert.throws(()=>a.save(broken),/3-letter currency/);
const before=localStorage.getItem(a.key);
const clone=E.copy(p);clone.id=E.id('FSR-COPY');clone.revision++;clone.updatedAt=new Date().toISOString();
clone.audit.push({revision:clone.revision,at:clone.updatedAt,action:'Separate copied source opened',recordId:clone.id});
a.save(clone);assert.equal(a.list().length,2);assert.equal(b.list().length,0);
const good=localStorage.getItem(a.key);memory.set(a.key,'{bad');
assert.throws(()=>a.read(),/Existing supplier copies damaged/);
assert.equal(localStorage.getItem(a.key),'{bad');memory.set(a.key,good);
assert.equal(a.load(p.id).offers.length,1);
assert(before.includes('SYN-OFFER-1'));
console.log('FABRIC SUPPLIER M2 COPY/STORE PASS: isolated user/browser namespace, exact restore, tamper/revision/invalid source atomic guards, separate copy with no overwrite.');
