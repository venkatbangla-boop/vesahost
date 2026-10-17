/* APP-11 portable backup and CRM-only per-user browser storage proof. Synthetic data. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),mem=new Map();
const localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const ctx={module:{exports:{}},localStorage,Date,Math,JSON,BigInt};ctx.globalThis=ctx;vm.createContext(ctx);
for(const p of ['src/domain/buyer-directory.js','src/domain/opportunity-state.js','src/domain/followup-scheduler.js',
 'src/data/saved-copy-codec.js','src/data/local-record-port.js'])
 vm.runInContext(fs.readFileSync(path.join(base,p),'utf8'),ctx,{filename:p});
const E=ctx.VesaBuyerDirectory,S=ctx.VesaBuyerCRMLocalStore,C=ctx.VesaBuyerCRMCopyCodec;
const a=new S('synthetic-A@example.invalid'),b=new S('synthetic-B@example.invalid');
assert.notEqual(a.key,b.key);assert(a.key.startsWith('vesa.buyer-crm.records.v1.'));
let p=E.create({organizationName:'SYN BUYER',territory:'SYN TERRITORY',sourceRef:'SYN ORG SOURCE'});p.mode='local';
a.save(p);assert.equal(a.list().length,1);assert.equal(b.list().length,0);
p=E.append(p,'contact',{id:'SYN CONTACT-1',contactName:'SYN CONTACT',role:'SYN ROLE',sourceRef:'SYN DOCUMENT',
 privacySourceRef:'SYN PRIVACY SOURCE',reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',consentStatus:'needs-information'});
a.save(p);assert.equal(a.load(p.id).contacts.length,1);assert.equal(b.list().length,0);
const source=C.encode(p),restored=C.decode(source);
assert.equal(restored.id,p.id);assert.equal(restored.contacts[0].contactName,'SYN CONTACT');
const before=localStorage.getItem(a.key);
assert.throws(()=>C.decode(source.replace('SYN BUYER','FORGED BUYER')),/altered\/unsupported/);
assert.throws(()=>C.decode('{broken'),/unreadable/);
assert.throws(()=>C.decode('x'.repeat(C.maxLength+1)),/limit/);
const spoof=JSON.parse(source);spoof.record.status='CONFIRMED BUYER PO';spoof.hash=C.hash(JSON.stringify(spoof.record));
assert.throws(()=>C.decode(JSON.stringify(spoof)),/cannot claim confirmed PO/);
const older=E.create({organizationName:'SYN BUYER',territory:'SYN TERRITORY',sourceRef:'SYN ORG SOURCE'});older.id=p.id;
assert.throws(()=>a.save(older),/Older CRM copy/);
const fake=E.copy(p);fake.contacts[0].consentStatus='consented';
assert.throws(()=>a.save(fake),/Consent basis/);
assert.equal(localStorage.getItem(a.key),before,'Tampered/old saved copies cannot change existing CRM records');
const cloned=E.copy(p);cloned.id=E.id('BUY-COPY');cloned.revision++;
cloned.audit.push({revision:cloned.revision,at:new Date().toISOString(),action:'Separate copy recovered',recordId:cloned.id});
a.save(cloned);assert.equal(a.list().length,2);assert.equal(b.list().length,0);
const good=localStorage.getItem(a.key);mem.set(a.key,'{bad');
assert.throws(()=>a.read(),/Existing CRM data damaged/);assert.equal(localStorage.getItem(a.key),'{bad');mem.set(a.key,good);
console.log('BUYER CRM M2 SAVE/RESTORE PASS: namespace isolation, source-validated contacts, old revision refusal, corruption and forged backup atomicity, separate saved copy.');
