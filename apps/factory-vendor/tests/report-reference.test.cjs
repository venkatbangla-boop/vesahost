/* APP-08 reviewed reference and draft reports: no automatic certification or buyer approval. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),memory=new Map();
const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const ctx={module:{exports:{}},JSON,Math,Date,localStorage};ctx.globalThis=ctx;vm.createContext(ctx);
for(const p of ['domain/vendor-profile.js','domain/certification-evidence.js','domain/capability-matcher.js',
 'domain/reviewed-reference.js','data/saved-copy-codec.js','data/local-record-port.js','reports/report-model.js'])
 vm.runInContext(fs.readFileSync(path.join(base,'src',p),'utf8'),ctx,{filename:p});
const P=ctx.VesaFactoryVendorProfile,Ref=ctx.VesaFactoryVendorReviewedReference,
 Cert=ctx.VesaFactoryCertificationEvidence,R=ctx.VesaFactoryVendorReportModel,
 Codec=ctx.VesaFactoryVendorCopyCodec,Store=ctx.VesaFactoryVendorLocalStore;
let record=P.create({vendorName:'SYNTHETIC VENDOR',country:'BD',sourceRef:'SYN DECLARATION'});
record.mode='local';record=P.append(record,'site',{id:'SYN-SITE',siteName:'SYN FACTORY',country:'BD',
 process:'Knitting',sourceRef:'SYN SITE SOURCE'});
record=P.append(record,'capability',{id:'SYN-CAP',siteId:'SYN-SITE',category:'Polo',unit:'pieces',
 declaredMonthlyCapacity:1000,capacitySourceRef:'SYN CAPACITY SOURCE',sourceRef:'SYN CATEGORY SOURCE',
 reviewedBy:'SYN REVIEWER',asOfDate:'2026-10-16',reviewDate:'2026-10-17',moq:500});
record=P.append(record,'certificate',{id:'SYN-CERT',siteId:'SYN-SITE',scheme:'SYN BSCI DOCUMENT',
 issuer:'SYN DOCUMENT ISSUER',documentRef:'SYN REF',sourceRef:'SYN DOCUMENT',
 issueDate:'2026-01-01',expiryDate:'2026-09-30',reviewDate:'2026-10-17',
 reviewedBy:'SYN DOCUMENT REVIEWER',documentStatus:'document-supplied'});
record=P.append(record,'review',{id:'SYN-REVIEW',siteId:'SYN-SITE',reviewer:'SYN REVIEWER',
 checklistRef:'SYN CHECKLIST',sourceRef:'SYN INSPECTION NOTES',reviewDate:'2026-10-17',
 internalOutcome:'needs-information'});
record=P.append(record,'performance',{id:'SYN-METRIC',siteId:'SYN-SITE',metric:'On time',unit:'orders',
 sourceRef:'SYN METRIC SOURCE',reviewer:'SYN REVIEWER',
 periodFrom:'2026-09-01',periodTo:'2026-09-30',reviewDate:'2026-10-17',
 numerator:8,denominator:10});
assert.equal(P.validate(record).ok,true);
const oldCopy=Codec.encode(record),oldRestored=Codec.decode(oldCopy);
assert.equal(oldRestored.manualReferences,undefined,'Old .vesavendor must open without upgrade');
const po={sourceApp:'VESA Purchase Order 360',recordType:'PurchaseOrder',recordId:'PO-SYN-1',
 revisionId:'REV-1',sourceDate:'2026-10-16',verifiedBy:'SYN SOURCE REVIEWER',
 verifiedAt:'2026-10-17T08:00:00Z',displaySnapshot:{factory:'SYN FACTORY',poNo:'PO-SYN'}};
const prod={sourceApp:'VESA Production Tracker 360',recordType:'ProductionStageSnapshot',
 recordId:'PROD-SYN',revisionId:'R1',sourceDate:'2026-10-17',verifiedBy:'SYN PLANNER',
 verifiedAt:'2026-10-17',displaySnapshot:{stage:'sewing',line:'SYN LINE',poNo:'PO-SYN',notAqlRelease:true}};
const reviewer={siteId:'SYN-SITE',localReviewer:'SYN LOCAL REVIEWER',localReviewDate:'2026-10-17',identityConfirmed:true};
assert(Ref.sourceValid(po,'po'));assert(!Ref.sourceValid(po,'production'));
assert(Ref.sourceValid(prod,'production'));assert(!Ref.sourceValid({...po,sourceApp:'not PO approval'},'po'));
assert.throws(()=>Ref.append(record,'po',{...po,displaySnapshot:{factory:'OTHER FACTORY'}},reviewer),/Matching typed/);
assert.throws(()=>Ref.append(record,'po',po,{...reviewer,identityConfirmed:false}),/Matching typed/);
assert.throws(()=>Ref.append(record,'po',po,{...reviewer,localReviewDate:'2026-02-30'}),/Matching typed/);
let next=Ref.append(record,'po',po,reviewer);
next=Ref.append(next,'production',prod,reviewer);
assert.equal(next.manualReferences.length,2);assert.equal(next.revision,record.revision+2);
assert.throws(()=>Ref.append(next,'po',po,reviewer),/Duplicate reviewed source/);
const copy=Codec.encode(next),restored=Codec.decode(copy);
assert.equal(restored.manualReferences[0].source.recordId,'PO-SYN-1');
const store=new Store('synthetic@invalid.example');store.save(next);
const before=JSON.stringify(store.load(next.id));
const malicious=P.clone(next);malicious.manualReferences[0].source.displaySnapshot.factory='OTHER FACTORY';
assert.equal(P.validate(malicious).ok,false);
assert.throws(()=>store.save(malicious),/manual PO\/Production source/);
const fake=JSON.parse(copy);fake.record.manualReferences[1].siteId='FORGED SITE';
fake.hash=Codec.hash(JSON.stringify(fake.record));
assert.throws(()=>Codec.decode(JSON.stringify(fake)),/manual PO\/Production source/);
assert.throws(()=>Codec.decode(copy.replace('PO-SYN-1','FORGED-PO')),/altered\/unsupported/);
assert.equal(JSON.stringify(store.load(next.id)),before,'Invalid copies do not mutate stored record');
const rows=R.rows(next,'2026-10-17');
const cert=rows['Certificate Date Register'];
assert.equal(cert[1][8],'expired-by-dates');
assert.equal(cert[1][10],'NOT EXTERNALLY CERTIFIED');
assert.equal(Cert.dateState(next.certificates[0],'2026-10-17').notComplianceApproval,true);
assert.equal(rows['Declared Capacity'][1][2],1000);
assert.equal(rows['Declared Capacity'][1][12],'DECLARED ONLY; NOT GUARANTEED');
assert.equal(R.excelRows('Declared Capacity',rows['Declared Capacity'])[1][2],1000);
assert.equal(R.excelRows('Period Performance',rows['Period Performance'])[1][7],0.8);
assert.equal(rows['Exceptions and Missing'].length>=3,true,'Expired doc and internal pending must appear');
assert.equal(rows['Manual Read-Only Sources'].length,3);
assert.equal(R.safeCell('=HYPERLINK("bad")'),"\'=HYPERLINK(\"bad\")");
assert.equal(R.safeCell('@evil'),"'@evil");
const injected=P.clone(next);injected.header.vendorName='<img src=x onerror=alert(1)>';
const html=R.html(injected,'2026-10-17');
assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert(!html.includes('<img src=x'));
assert(html.includes('DRAFT / INTERNAL REVIEW ONLY')&&html.includes('NEVER INFERRED'));
assert.throws(()=>R.rows(next,'2026-02-30'),/as-of date/);
console.log('FACTORY M3 REPORT/REFERENCE PASS: legacy copies, two typed source owners, source identity/duplicate/tamper atomicity, safe XLSX numeric/formula cells, certificate expiry vs authority, HTML escape and draft-only reports.');
