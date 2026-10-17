/* APP-14 pure synthetic case ownership, source evidence and no automatic payment or liability. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'../src/domain'),env={module:{exports:{}},Date,Math,JSON,BigInt};
env.globalThis=env;vm.createContext(env);
for(const n of ['claim-register.js','exposure-ledger.js','settlement-history.js'])
 vm.runInContext(fs.readFileSync(path.join(base,n),'utf8'),env,{filename:n});
const E=env.VesaClaimRegister,M=env.VesaClaimExposure,S=env.VesaClaimSettlementHistory;
let p=E.create({caseNumber:'SYN-CLAIM-001',buyer:'SYN BUYER',supplier:'SYN FACTORY',
 poNo:'SYN-PO-9',shipmentRef:'SYN SHIPMENT-2',claimCategory:'SHORT SHIPMENT',
 openedDate:'2026-10-16',sourceRef:'SYN CASE DOCUMENT',allegationSummary:'SYN ALLEGED SHORT QTY',
 reviewedBy:'SYN MERCHANDISER',reviewDate:'2026-10-17'});
assert.equal(E.validate(p).ok,true);
assert.equal(E.localStatus(p).state,'open');
assert.equal(M.parse('120.50'),12050n);assert.equal(M.fmt(12050n),'120.50');
assert.equal(M.parse('0'),null);assert.equal(M.parse('-5'),null);assert.equal(M.parse('0.001'),null);
const f=(id,currency,amount)=>({id,category:'SYN SHORTAGE',description:'SYN OBSERVED QTY DIFFERENCE',
 affectedQty:20,quantityUnit:'pieces',sourceRef:'SYN PACKING EVIDENCE',sourceDate:'2026-10-16',
 reviewedBy:'SYN LOCAL QA',reviewDate:'2026-10-17',valueReviewState:'locally-reviewed-claim-value',
 allegedAmount:amount,currency,amountSourceRef:'SYN DOCUMENTED PRICE BASIS',
 amountReviewedBy:'SYN FINANCE',amountReviewDate:'2026-10-17'});
p=E.append(p,'finding',f('SYN-F1','USD','125.50'));
p=E.append(p,'finding',f('SYN-F2','EUR','20.00'));
p=E.append(p,'finding',{id:'SYN-UNKNOWN',category:'SYN QC COMPLAINT',
 description:'SYN COLOR VARIATION SOURCE',affectedQty:5,quantityUnit:'pieces',
 sourceRef:'SYN QA NOTE',sourceDate:'2026-10-16',reviewedBy:'SYN QA',
 reviewDate:'2026-10-17',valueReviewState:'needs-information',allegedAmount:null});
const exp=M.summarize(p);
assert.equal(exp.byCurrency.length,2);
assert.equal(exp.byCurrency.find(x=>x.currency==='USD').sourceReviewedAllegedExposure,'125.50');
assert.equal(exp.byCurrency.find(x=>x.currency==='EUR').sourceReviewedAllegedExposure,'20.00');
assert.equal(exp.unknownFindings.length,1);assert.equal(exp.officialLiability,null);
assert.equal(exp.noCrossCurrencyAddition,true);
const history0=JSON.stringify(p);
assert.throws(()=>E.append(p,'finding',{...f('SYN-F1','USD','1.00')}),/Duplicate immutable claim evidence ID/);
assert.throws(()=>E.append(p,'finding',{...f('SYN-F4','USD','0.0001')}),/exact amount/);
assert.throws(()=>E.append(p,'finding',{...f('SYN-F4','USD','10.00'),liabilityAdmitted:true}),/cannot admit liability/);
assert.equal(JSON.stringify(p),history0,'Invalid append does not mutate original case');
p=E.append(p,'evidence',{id:'SYN-AQL-REF',sourceApp:'AQL',recordType:'InspectionRef',
 recordId:'SYN AQL-FINAL',revisionId:'R2',sourceRef:'SYN AQL INSPECTION EXPORT',
 summary:'SYN AQL FINAL FAILED; liability still disputed',sourceDate:'2026-10-15',
 reviewedBy:'SYN QA',reviewDate:'2026-10-17'});
assert.equal(E.localStatus(p).state,'open','AQL result does not automatically change local legal state');
assert.throws(()=>E.append(p,'evidence',{id:'SYN-FALSE',sourceApp:'AQL',recordType:'InspectionRef',
 recordId:'SYN AQL',revisionId:'R1',sourceRef:'SYN',summary:'SYN',sourceDate:'2026-10-15',
 reviewedBy:'SYN',reviewDate:'2026-10-17',changesAQL:true}),/cannot edit inspection/);
p=E.append(p,'response',{id:'SYN-REPLY-1',party:'SYN SUPPLIER',
 summary:'SYN supplier disputes quantity allegation',
 sourceRef:'SYN LOCAL CORRESPONDENCE COPY',receivedDate:'2026-10-17',
 reviewedBy:'SYN CASE OWNER',reviewDate:'2026-10-17',stance:'disputed'});
assert.equal(E.localStatus(p).state,'open','Disputed letter is not automatically a legal decision');
const agreement={id:'SYN-AGREED-USD',currency:'USD',agreedAmount:'80.00',
 agreementDate:'2026-10-17',sourceRef:'SYN SIGNED CLAIM SETTLEMENT EXCERPT',
 externalAuthorityRef:'SYN TWO PARTY SIGNED DOC',externallyNamedParty:'SYN BUYER+SUPPLIER',
 reviewedBy:'SYN FINANCE REVIEWER',reviewDate:'2026-10-17',
 authorityState:'outside-party-evidence-entered-locally'};
p=E.append(p,'agreement',agreement);
assert.equal(S.reconcile(p).byAgreement[0].outstandingAgainstDocumentedAgreement,'80.00');
assert.equal(E.localStatus(p).state,'open','Adding agreement does not auto-change case status');
const drafted={id:'SYN-DRAFT-CREDIT',agreementId:agreement.id,kind:'draft-credit',
 amount:'20.00',currency:'USD',recordedDate:'2026-10-17',sourceRef:'SYN DRAFT CREDIT NOTE',
 reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17'};
p=E.append(p,'settlement',drafted);
assert.equal(S.reconcile(p).byAgreement[0].outstandingAgainstDocumentedAgreement,'80.00','Draft credit is NOT payment');
const settled={id:'SYN-ACTUAL-RECEIPT',agreementId:agreement.id,kind:'documented-receipt',
 amount:'30.00',currency:'USD',recordedDate:'2026-10-17',sourceRef:'SYN LOCAL RECEIPT SOURCE',
 reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17',
 actualReceiptRef:'SYN RECEIPT COPY 001',receiptReviewedBy:'SYN RECEIPT REVIEWER',
 receiptReviewDate:'2026-10-17'};
p=E.append(p,'settlement',settled);
const rec=S.reconcile(p);
assert.equal(rec.byAgreement[0].agreedSourceAmount,'80.00');
assert.equal(rec.byAgreement[0].sourceReviewedActualReceipts,'30.00');
assert.equal(rec.byAgreement[0].outstandingAgainstDocumentedAgreement,'50.00');
assert.equal(rec.byAgreement[0].caseAutomaticallyClosed,false);
assert.equal(rec.byAgreement[0].notBankAuthenticated,true);
assert.equal(E.localStatus(p).state,'open');
const before=JSON.stringify(p);
assert.throws(()=>E.append(p,'settlement',{...settled,id:'SYN-DUP-RECEIPT'}),/Duplicate actual receipt source/);
assert.throws(()=>E.append(p,'settlement',{...settled,id:'SYN-EXCESS',actualReceiptRef:'SYN RECEIPT 002',amount:'51.00'}),/exceed/);
assert.throws(()=>E.append(p,'settlement',{...settled,id:'SYN-OTHER-CUR',currency:'EUR'}),/same-currency/);
assert.equal(JSON.stringify(p),before);
assert.throws(()=>E.append(p,'decision',{id:'SYN-FALSE-AGREEMENT',newState:'agreed',
 reviewedBy:'SYN REVIEW',decisionDate:'2026-10-17',reviewDate:'2026-10-17',
 decisionSourceRef:'SYN',externalAuthorityRef:'',externallyNamedParty:''}),/outside-party authority evidence/);
p=E.append(p,'decision',{id:'SYN-IN-REVIEW',newState:'in-review',
 reviewedBy:'SYN REVIEW',decisionDate:'2026-10-17',reviewDate:'2026-10-17',
 decisionSourceRef:'SYN MANUAL CASE REVIEW'});
assert.equal(E.localStatus(p).state,'in-review');
p=E.append(p,'decision',{id:'SYN-AGREEMENT-STATE',newState:'agreed',
 reviewedBy:'SYN CASE REVIEW',decisionDate:'2026-10-17',reviewDate:'2026-10-17',
 decisionSourceRef:'SYN CASE AGREED LOG',externalAuthorityRef:'SYN TWO PARTY EXTERNAL DOC',
 externallyNamedParty:'SYN BUYER+SUPPLIER'});
assert.equal(E.localStatus(p).state,'agreed');
assert.equal(E.localStatus(p).externallyAuthenticated,false);
assert.equal(E.localStatus(p).bankSettlementNotified,false);
const decisionPre=JSON.stringify(p);
assert.throws(()=>E.append(p,'decision',{id:'SYN-AUTO-CLOSE',newState:'closed',
 reviewedBy:'SYN',decisionDate:'2026-10-17',reviewDate:'2026-10-17',
 decisionSourceRef:'SYN',externalAuthorityRef:'SYN',externallyNamedParty:'SYN',
 liabilityAdmittedAutomatically:true}),/Closure requires/);
assert.equal(JSON.stringify(p),decisionPre);
assert.equal(E.validate(p).ok,true);
assert.equal(p.audit.at(-1).revision,p.revision);
assert.equal(p.authority,'LOCAL CLAIM SOURCE ONLY — NO LIABILITY, BANK SETTLEMENT OR AQL ALTERATION');
console.log('CLAIMS & DISPUTES M1 PURE DOMAIN PASS: immutable AQL/Shipment/PO refs, exact separate alleged currencies, disputed correspondence, signed-source local agreement, draft credit != receipt, partial balance never auto-closes, no legal/bank authority; all synthetic.');
