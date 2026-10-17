/* APP-10 deterministic synthetic version, label and review authority boundary tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={module:{exports:{}},Date,Math,JSON};ctx.globalThis=ctx;vm.createContext(ctx);
for(const p of ['src/domain/label-spec.js','src/domain/artwork-revision.js','src/domain/review-state.js'])
 vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),ctx,{filename:p});
const E=ctx.VesaArtworkRevision,L=ctx.VesaLabelSpec,D=ctx.VesaArtworkReviewState;
assert(L.barcodeStatus({symbology:'ean-13',value:'4006381333931'}).valid,'Valid EAN13 must calculate GS1 Mod-10');
const invalid=L.barcodeStatus({symbology:'ean-13',value:'4006381333932'});
assert.equal(invalid.valid,false);assert.match(invalid.warning,/Invalid supplied barcode/);
assert.equal(invalid.notScannerCertified,true);assert.equal(invalid.gs1OwnershipVerified,false);
assert.equal(L.barcodeStatus({symbology:'upc-a',value:'036000291452'}).valid,true);
assert.equal(L.barcodeStatus({symbology:'gtin-8',value:'96385074'}).valid,true);
assert(L.check({width:'4',height:'5',unit:'cm',dimensionSourceRef:'SYN TECH PACK'}).length===0);
assert(L.check({width:'4',height:'5',unit:'not-unit'}).length>0);
assert(L.check({repeatCount:5}).length>0);
assert(L.check({washCareText:'Cold Wash'}).length>0,'Wash care needs supplied document source');
let record=E.create({style:'SYN-STYLE',colour:'Navy',size:'M',itemType:'care-label',
 placement:'inside-left-neck',sourceRef:'SYN LABEL SOURCE'});
assert(E.validate(record).ok);
const first={id:'REV-1',sourceDate:'2026-10-16',artworkRef:'SYN-ARTWORK-REV1',
 sourceRef:'SYN SUBMISSION',notes:'SYN-DRAFT',spec:{width:'4',height:'5',unit:'cm',
 dimensionSourceRef:'SYN SOURCED LABEL DIMENSIONS',method:'woven',colourRef:'SYN WHITE',
 washCareText:'SYN WASH CARE ONLY',contentSourceRef:'SYN CARE INSTRUCTION SOURCE',
 barcode:{symbology:'ean-13',value:'4006381333932',sourceRef:'SYN USER NUMBER'}}};
record=E.appendRevision(record,first);
assert.equal(E.validate(record).ok,true);
assert.equal(record.revisions[0].number,1);
assert.equal(L.describe(record.revisions[0].spec).barcode.valid,false,'Bad check digit retained as WARNING');
assert.equal(L.describe(record.revisions[0].spec).regulatoryVerified,false);
const afterRevOne=JSON.stringify(record.revisions[0]);
record=D.append(record,'comment',{id:'COMMENT-1',revisionId:'REV-1',reviewer:'SYN INTERNAL',
 reviewerRole:'internal',sourceRef:'SYN COMMENT SHEET',reviewDate:'2026-10-17',
 comment:'Buyer care label details require source confirmation'});
record=D.append(record,'decision',{id:'DEC-1',revisionId:'REV-1',reviewer:'SYN INTERNAL',
 reviewerRole:'internal',sourceRef:'SYN INTERNAL CHECKLIST',reviewDate:'2026-10-17',
 decision:'internal-reviewed'});
assert.match(D.effective(record).status,/PENDING/,'Internal review cannot approve buyer');
const snapshot=JSON.stringify(record),priorRev=record.revision;
assert.throws(()=>D.append(record,'decision',{revisionId:'REV-1',reviewer:'SYN INTERNAL',reviewerRole:'internal',
 sourceRef:'SYN MISREP',reviewDate:'2026-10-17',decision:'buyer-approval-evidence-recorded',
 authorityRef:'SYN BUYER REF'}),/Buyer decision can only/);
assert.equal(JSON.stringify(record),snapshot);
assert.equal(record.revision,priorRev);
record=D.append(record,'decision',{id:'DEC-BUY-1',revisionId:'REV-1',reviewer:'SYN BUYER CONTACT',
 reviewerRole:'buyer',authorityRef:'SYN SIGNED BUYER MAIL SOURCE',sourceRef:'SYN DECISION MAIL',
 reviewDate:'2026-10-17',decision:'buyer-approval-evidence-recorded'});
const claim=D.effective(record);
assert.equal(claim.revisionId,'REV-1');assert.match(claim.status,/NOT INDEPENDENTLY VERIFIED/);
assert.equal(claim.buyerAuthorityVerified,false);
assert.equal(record.status,'DRAFT — SOURCE REVIEW ONLY');
const oldDecision=JSON.stringify(record.decisions);
record=E.appendRevision(record,{id:'REV-2',sourceDate:'2026-10-17',
 artworkRef:'SYN ARTWORK REV 2',sourceRef:'SYN REVISED SOURCE',
 spec:{width:'42',height:'55',unit:'mm',dimensionSourceRef:'SYN NEW LABEL SPEC'}});
assert.equal(record.revisions.length,2);
assert.equal(JSON.stringify(record.revisions[0]),afterRevOne,'Old source revision never changes');
assert.equal(JSON.stringify(record.decisions),oldDecision,'Old review evidence is preserved');
assert.equal(D.effective(record).revisionId,'REV-2');
assert.match(D.effective(record).status,/PENDING/,'New revision invalidates old evidence for current use');
assert.throws(()=>E.appendRevision(record,{...first,sourceDate:'2026-10-17'}),/Duplicate artwork revision/);
assert.throws(()=>E.appendRevision(record,{...first,id:'REV-BAD',spec:{width:'20',height:'9',unit:'mm',washCareText:'Do not wash'}}),/source reference/);
const tampered=E.copy(record);tampered.decisions[0].revisionId='UNKNOWN';
assert.equal(E.validate(tampered).ok,false,'Invalid imported source references must fail');
const malformed=E.copy(record);malformed.status='BUYER APPROVED';
assert.equal(E.validate(malformed).ok,false,'Source authority cannot be fabricated');
assert.equal(E.validate(record).ok,true);
assert.equal(record.audit.at(-1).revision,record.revision);
console.log('ARTWORK M1 DOMAIN PASS: sourced immutable versions/comments, exact revision buyer evidence boundary, barcode warning not issuance, explicit unit/care provenance, duplicate/malformed atomicity, old review invalidation.');
