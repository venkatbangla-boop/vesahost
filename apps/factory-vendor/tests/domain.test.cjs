/* APP-08 synthetic source-only domain acceptance; no real factory details. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const folder=path.resolve(__dirname,'..');const env={module:{exports:{}},JSON,Math,Date};env.globalThis=env;
vm.createContext(env);
for(const file of ['vendor-profile.js','certification-evidence.js','capability-matcher.js'])
 vm.runInContext(fs.readFileSync(path.join(folder,'src/domain',file),'utf8'),env,{filename:file});
const E=env.VesaFactoryVendorProfile,C=env.VesaFactoryCertificationEvidence,M=env.VesaFactoryCapabilityMatcher;
let v=E.create({vendorName:'SYNTHETIC GARMENT VENDOR',country:'BD',sourceRef:'SYNTHETIC DECLARATION'});
assert(E.validate(v).ok);assert.equal(v.capabilities.length,0);
const site={id:'SYN-SITE-1',siteName:'SYN FACTORY SITE',country:'BD',process:'knit garments',sourceRef:'SYN SITE DECLARATION'};
v=E.append(v,'site',site);assert.equal(v.revision,1);
const snapshot=JSON.stringify(v.sites[0]);
assert.throws(()=>E.append(v,'site',{...site,id:'SYN-SITE-DUP'}),/Duplicate factory site/);
assert.equal(JSON.stringify(v.sites[0]),snapshot,'Invalid append cannot mutate baseline');
const capability={id:'CAP-1',siteId:'SYN-SITE-1',category:'Knit Polo',unit:'pieces',declaredMonthlyCapacity:100000,
 asOfDate:'2026-10-16',sourceRef:'SYN GENERAL DECLARATION',capacitySourceRef:'SYN MONTHLY CAPACITY DOCUMENT',reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',moq:5000,leadDays:60,leadDaysSource:'SYN LEAD SOURCE'};
v=E.append(v,'capability',capability);
assert.throws(()=>E.append(v,'capability',{...capability,id:'CAP-NO-SOURCE',capacitySourceRef:''}),/documented capacity evidence/);
assert.throws(()=>E.append(v,'capability',{...capability,id:'CAP-BAD-SITE',siteId:'SYN-SITE-OTHER'}),/known factory site/);
assert.throws(()=>E.append(v,'capability',{...capability,id:'CAP-NO-LEAD',leadDaysSource:''}),/Lead time/);
const match=M.match(v,{siteId:'SYN-SITE-1',category:'Knit Polo'},'2026-10-17');
assert.equal(match.declaredCapacity,100000);assert.equal(match.notActualProduction,true);
assert.equal(match.buyerApproved,false);assert.equal(match.needsExternalVerification,true);
assert.equal(M.match(v,{siteId:'SYN-OTHER',category:'Knit Polo'},'2026-10-17').found,false);
assert.equal(M.match(v,{siteId:'SYN-SITE-1',category:'Denim Shirts'},'2026-10-17').found,false);
assert.equal(M.match(v,{siteId:'SYN-SITE-1',category:'Knit Polo'},'2026-10-15').found,false);
const certificate={id:'CERT-1',siteId:'SYN-SITE-1',scheme:'BSCI (synthetic reference only)',issuer:'SYNTHETIC ISSUER',
 documentRef:'SYN-CERT-REF',sourceRef:'SYN DOCUMENT COPY',issueDate:'2026-01-01',expiryDate:'2026-09-30',reviewDate:'2026-10-17',
 reviewedBy:'SYN LOCAL REVIEWER',documentStatus:'document-supplied'};
v=E.append(v,'certificate',certificate);
assert.equal(C.dateState(certificate,'2026-10-17').dateState,'expired-by-dates');
assert.equal(C.dateState(certificate,'2025-12-31').dateState,'not-effective-by-dates');
assert.equal(C.dateState(certificate,'2026-06-01').dateState,'inside-documented-date-range-only');
assert.equal(C.dateState(null,'2026-10-17').dateState,'needs-information');
assert.throws(()=>C.dateState(certificate,'2026-02-30'),/as-of date/);
const certificateAnalysis=C.evaluateRecord(v,'2026-10-17');assert.equal(certificateAnalysis[0].authorityVerified,false);
assert.equal(certificateAnalysis[0].buyerAccepted,false);
assert.throws(()=>E.append(v,'certificate',{...certificate,id:'CERT-2'}),/Duplicate certificate/);
assert.throws(()=>E.append(v,'certificate',{...certificate,id:'CERT-DATE',documentRef:'SYN-OTHER-CERT',expiryDate:'2025-01-01'}),/issue and expiration/);
assert.throws(()=>E.append(v,'certificate',{...certificate,id:'CERT-FALSE',documentRef:'SYN-FALSE',documentStatus:'BSCI-certified'}),/only describe received/);
const review={id:'REVIEW-1',siteId:'SYN-SITE-1',reviewer:'SYN INTERNAL',checklistRef:'SYN ONBOARD CHECKLIST',sourceRef:'SYN INTERNAL FINDINGS',reviewDate:'2026-10-17',internalOutcome:'needs-information'};
v=E.append(v,'review',review);
assert.throws(()=>E.append(v,'review',{...review,id:'REVIEW-2',internalOutcome:'approved factory'}),/internal only/);
const performance={id:'PERF-1',siteId:'SYN-SITE-1',metric:'on-time source-reviewed count',unit:'orders',sourceRef:'SYN PERIOD REGISTER',reviewer:'SYN REVIEWER',reviewDate:'2026-10-17',periodFrom:'2026-09-01',periodTo:'2026-09-30',numerator:8,denominator:10};
v=E.append(v,'performance',performance);
const metric=M.metric(v,'PERF-1');assert.equal(metric.ratio,0.8);assert.equal(metric.notBuyerApproved,true);
assert.throws(()=>E.append(v,'performance',{...performance,id:'PERF-ZERO',denominator:0}),/nonzero denominator/);
assert.throws(()=>E.append(v,'performance',{...performance,id:'PERF-NOPERIOD',periodTo:'2026-08-01'}),/Performance period/);
assert.throws(()=>E.append(v,'performance',{...performance,id:'PERF-OVER',numerator:12}),/Ratio numerator/);
assert.equal(v.revision,5);assert.equal(v.audit.length,5);
const previous=E.clone(v);const forged=E.clone(v);forged.status='BSCI COMPLIANT / APPROVED';
assert.equal(E.validate(forged).ok,false);assert.equal(E.validate(v).ok,true);
assert.equal(JSON.stringify(v),JSON.stringify(previous),'All bad edits leave previous record immutable');
const fake=E.clone(v);fake.certificates[0].documentRef='';assert.equal(E.validate(fake).ok,false);
const missingSite=E.clone(v);missingSite.sites=[];assert.equal(E.validate(missingSite).ok,false);
assert(!E.date('2026-02-29'),'Invalid day in nonleap year rejected');
assert(E.date('2028-02-29'),'Leap day allowed');
console.log('FACTORY VENDOR M1 DOMAIN PASS: source-only site, category capacity, dated certificate alert, internal review, period denominator, immutable atomic rejects, no fake compliance or actual production.');
