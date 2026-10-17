/* APP-14 reviewed typed AQL/Shipment/PO evidence and draft source report security; all synthetic. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),memory=new Map(),localStorage={
 getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const ctx={module:{exports:{}},Date,Math,JSON,BigInt,localStorage};ctx.globalThis=ctx;vm.createContext(ctx);
for(const s of ['src/domain/claim-register.js','src/domain/exposure-ledger.js','src/domain/settlement-history.js',
 'src/domain/reviewed-reference.js','src/data/saved-copy-codec.js','src/data/local-record-port.js',
 'src/reports/report-model.js'])vm.runInContext(fs.readFileSync(path.join(base,s),'utf8'),ctx,{filename:s});
const E=ctx.VesaClaimRegister,M=ctx.VesaClaimExposure,S=ctx.VesaClaimSettlementHistory,
 Ref=ctx.VesaClaimReviewedReference,C=ctx.VesaClaimsCopyCodec,Store=ctx.VesaClaimsLocalStore,R=ctx.VesaClaimsReportModel;
const head={caseNumber:'SYN CASE 1',buyer:'SYN BUYER LTD',supplier:'SYN SUPPLIER',
 poNo:'SYN PO-123',shipmentRef:'SYN SHIP-1',claimCategory:'SYN ALLEGED SHORT SHIPMENT',
 openedDate:'2026-10-17',sourceRef:'SYN ORIGINAL CASE SOURCE',
 allegationSummary:'SYN alleged quantity',reviewedBy:'SYN QA',reviewDate:'2026-10-17'};
let p=E.create(head);
p=E.append(p,'finding',{id:'SYN FINDING',category:'SHORT QTY',description:'SYN 20 PCS SHORT',
 affectedQty:20,quantityUnit:'pieces',sourceRef:'SYN SOURCE NOTE',sourceDate:'2026-10-17',
 reviewedBy:'SYN INSPECTOR',reviewDate:'2026-10-17',valueReviewState:'locally-reviewed-claim-value',
 allegedAmount:'125.50',currency:'USD',amountSourceRef:'SYN BASIS',
 amountReviewedBy:'SYN FINANCE',amountReviewDate:'2026-10-17'});
p=E.append(p,'agreement',{id:'SYN AGREEMENT 1',currency:'USD',agreedAmount:'80.00',
 agreementDate:'2026-10-17',sourceRef:'SYN AGREEMENT DOCUMENT',
 externalAuthorityRef:'SYN SIGNED TWO-PARTY DOC',externallyNamedParty:'SYN BUYER+SUPPLIER',
 reviewedBy:'SYN LOCAL REVIEW',reviewDate:'2026-10-17',
 authorityState:'outside-party-evidence-entered-locally'});
p=E.append(p,'settlement',{id:'SYN DRAFT CREDIT',agreementId:'SYN AGREEMENT 1',
 kind:'draft-credit',amount:'20.00',currency:'USD',recordedDate:'2026-10-17',
 sourceRef:'SYN CREDIT MEMO DRAFT',reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17'});
p=E.append(p,'settlement',{id:'SYN RECEIPT',agreementId:'SYN AGREEMENT 1',
 kind:'documented-receipt',amount:'30.00',currency:'USD',recordedDate:'2026-10-17',
 sourceRef:'SYN RECEIPT DOCUMENT',reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17',
 actualReceiptRef:'SYN RECEIPT 001',receiptReviewedBy:'SYN REVIEWER',receiptReviewDate:'2026-10-17'});
const legacy=C.encode(p);assert.equal(C.decode(legacy).manualReferences,undefined);
const src=(kind,patch={})=>({
 sourceApp:{aql:'aql',shipment:'VESA Shipment & Documentation 360',po:'VESA Purchase Order 360'}[kind],
 recordType:{aql:'InspectionRef',shipment:'ShipmentFile',po:'PurchaseOrder'}[kind],
 recordId:'SYN-'+kind+'-1',revisionId:'R2',sourceDate:'2026-10-16',
 verifiedBy:'SYN SOURCE REVIEWER',verifiedAt:'2026-10-17T09:00:00Z',
 displaySnapshot:{buyer:head.buyer,poNo:head.poNo,
  inspectionId:kind==='aql'?'SYN INSPECTION 1':undefined,
  stageId:kind==='aql'?'FINAL':undefined,outcome:kind==='aql'?'FAIL':undefined,
  evidenceOnly:true,notAuthenticated:true},
 ...patch});
const aql=src('aql'),ship=src('shipment'),po=src('po');
assert(Ref.sourceValid(aql,'aql'));assert(Ref.sourceValid(ship,'shipment'));assert(Ref.sourceValid(po,'po'));
assert(!Ref.sourceValid(po,'aql'));assert(!Ref.sourceValid(ship,'po'));
const review={localReviewer:'SYN INDEPENDENT CASE REVIEWER',localReviewDate:'2026-10-17',identityConfirmed:true};
assert.throws(()=>Ref.append(p,'aql',src('aql',{displaySnapshot:{...aql.displaySnapshot,buyer:'WRONG BUYER'}}),review),/exact buyer/);
assert.throws(()=>Ref.append(p,'shipment',src('shipment',{displaySnapshot:{...ship.displaySnapshot,poNo:'WRONG PO'}}),review),/exact buyer/);
assert.throws(()=>Ref.append(p,'po',po,{...review,identityConfirmed:false}),/human review/);
p=Ref.append(p,'aql',aql,review);p=Ref.append(p,'shipment',ship,review);p=Ref.append(p,'po',po,review);
assert.equal(p.manualReferences.length,3);
assert.throws(()=>Ref.append(p,'po',po,review),/Duplicate manually reviewed original source revision/);
assert.equal(E.localStatus(p).state,'open','Read-only AQL fail must not admit liability or close claim');
const store=new Store('synthetic@example.invalid');store.save(p);
const prior=JSON.stringify(store.load(p.id));
const bad=E.copy(p);bad.manualReferences[0].source.displaySnapshot.poNo='FORGED PO';
assert.equal(E.validate(bad).ok,false);assert.throws(()=>store.save(bad),/Manual AQL\/Shipment\/PO evidence/);
const hashed=JSON.parse(C.encode(p));hashed.record.manualReferences[1].source.displaySnapshot.buyer='OTHER';
hashed.hash=C.hash(JSON.stringify(hashed.record));
assert.throws(()=>C.decode(JSON.stringify(hashed)),/Manual AQL\/Shipment\/PO evidence/);
assert.equal(JSON.stringify(store.load(p.id)),prior);
assert.equal(C.decode(legacy).manualReferences,undefined,'M2 legacy copies remain accepted');
const rows=R.rows(p,'2026-10-17');
assert.equal(rows['Alleged Claim Findings'][1][5],'125.50');
assert.equal(rows['Alleged Exposure by Currency'][1][1],'125.50');
assert.equal(rows['Agreement Balances by Currency'][1][2],'80.00');
assert.equal(rows['Agreement Balances by Currency'][1][3],'30.00');
assert.equal(rows['Agreement Balances by Currency'][1][4],'50.00');
assert.equal(rows['Manual Review Snapshots'].length,4);
assert.equal(R.excelRows('Alleged Claim Findings',rows['Alleged Claim Findings'])[1][3],20);
assert.equal(R.excelRows('Alleged Claim Findings',rows['Alleged Claim Findings'])[1][5],125.5);
assert.equal(R.excelRows('Agreement Balances by Currency',rows['Agreement Balances by Currency'])[1][4],50);
assert.equal(R.formulaSafe('=HYPERLINK("bad")'),"'=HYPERLINK(\"bad\")");
assert.equal(R.formulaSafe('@cmd'),"'@cmd");
const evil=E.copy(p);evil.header.sourceRef='<img src=x onerror=1>';
const html=R.html(evil,'2026-10-17');
assert(html.includes('&lt;img src=x onerror=1&gt;')&&!html.includes('<img src=x'));
assert(html.includes('NOT legal liability')&&html.includes('NOT actual receipt'));
assert.throws(()=>R.rows(p,'2026-02-30'),/exact source review as-of date/);
assert.equal(S.reconcile(p).byAgreement[0].caseAutomaticallyClosed,false);
console.log('CLAIMS M3 REPORT/REFERENCE PASS: synthetic exact buyer/PO AQL/Shipment/PO source review, old copy compatibility, forged/wrong-case atomic refusal, escaped HTML, formula-safe numeric Excel, separate claim/settlement values and immutable AQL.');
