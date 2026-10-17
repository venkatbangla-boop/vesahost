/* APP-10 browser-local saved-copy isolation and atomic restore, synthetic sources only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),memory=new Map();
const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const ctx={module:{exports:{}},Date,Math,JSON,localStorage:storage};ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['src/domain/label-spec.js','src/domain/artwork-revision.js','src/domain/review-state.js',
 'src/data/saved-copy-codec.js','src/data/local-record-port.js'])
 vm.runInContext(fs.readFileSync(path.join(base,name),'utf8'),ctx,{filename:name});
const E=ctx.VesaArtworkRevision,D=ctx.VesaArtworkReviewState,C=ctx.VesaArtworkCopyCodec,S=ctx.VesaArtworkLocalStore;
const a=new S('synthetic-a@vesa.local'),b=new S('synthetic-b@vesa.local');
assert(a.key.startsWith('vesa.label-artwork-approval.records.v1.'));assert.notEqual(a.key,b.key);
let p=E.create({style:'SYN-ART',colour:'Navy',size:'M',itemType:'label',placement:'neck',sourceRef:'SYN TECH SOURCE'});
assert.equal(a.save(p),p.id);assert.equal(a.list().length,1);assert.equal(b.list().length,0);
p=E.appendRevision(p,{id:'SYN-REV1',sourceDate:'2026-10-17',artworkRef:'SYN ART FILE',sourceRef:'SYN ART DOCUMENT',
 spec:{width:'4',height:'5',unit:'cm',dimensionSourceRef:'SYN TECH DIMENSIONS'}});a.save(p);
assert.equal(a.load(p.id).revisions.length,1);
const backup=C.encode(p),restored=C.decode(backup);
assert.equal(restored.revisions[0].id,'SYN-REV1');
const snapshot=storage.getItem(a.key);
assert.throws(()=>C.decode(backup.replace('SYN-ART','UNAUTHORIZED-ART')),/altered\/unsupported/);
assert.throws(()=>C.decode('{invalid-json'),/unreadable/);
assert.throws(()=>C.decode('X'.repeat(C.maxLength+1)),/safe size/);
const forged=JSON.parse(backup);forged.record.status='BUYER APPROVED';forged.hash=C.hash(JSON.stringify(forged.record));
assert.throws(()=>C.decode(JSON.stringify(forged)),/Cannot invent buyer approval/);
const bad=E.copy(p);bad.revisions[0].spec.dimensionSourceRef='';
assert.throws(()=>a.save(bad),/Dimensions require original source/);
const old=E.create(p.header);old.id=p.id;
assert.throws(()=>a.save(old),/Older artwork evidence/);
assert.equal(storage.getItem(a.key),snapshot,'Invalid actions cannot modify saved records');
let separate=E.copy(restored);separate.id=E.id('ART-COPY');separate.revision++;separate.updatedAt=new Date().toISOString();
separate.audit.push({revision:separate.revision,at:separate.updatedAt,action:'Recovered separate local saved copy',recordId:separate.id});
a.save(separate);assert.equal(a.list().length,2);assert.equal(b.list().length,0);
const latest=storage.getItem(a.key);memory.set(a.key,'{bad');
assert.throws(()=>a.read(),/storage is damaged/);assert.equal(storage.getItem(a.key),'{bad');memory.set(a.key,latest);
let reviewed=D.append(p,'decision',{id:'DEC1',revisionId:'SYN-REV1',reviewer:'SYN INTERNAL',reviewerRole:'internal',
 reviewDate:'2026-10-17',sourceRef:'SYN INTERNAL REVIEW',decision:'internal-reviewed'});
a.save(reviewed);assert.equal(a.load(p.id).decisions[0].decision,'internal-reviewed');
assert.match(D.effective(a.load(p.id)).status,/PENDING/);
console.log('ARTWORK M2 LOCAL COPY PASS: isolated browser key, immutable saved versions, checksum/corruption/oversize atomicity, independent restore and no fabricated buyer approval.');
