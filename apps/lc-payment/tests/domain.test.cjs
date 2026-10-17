/** LC360 pure source, maturity, debit/credit, document and saved-copy tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
class LCUnitProof{
 static load(){
  const text=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
  const script=text.match(/<script>\s*(\(function\(global\)[\s\S]*?)<\/script>/);
  assert(script,'LC source classes must be testable independently.');
  const local=new Map(),localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,String(v)),removeItem:k=>local.delete(k)};
  const ctx={module:{exports:{}},localStorage,Date,Math,JSON};ctx.globalThis=ctx;
  vm.runInNewContext(script[1],ctx,{filename:'lc360-inline.js'});
  return {...ctx.module.exports,local};
 }
 static test(){
  const {LCPolicyEngine:E,LCStore:S,LCReport:R,local,VERSION}=this.load();
  assert.equal(VERSION,'VESA-LCPAY360-1');
  assert.equal(E.cents('1.235'),null);assert.equal(E.cents('-5'),null);
  assert.equal(E.cents('200.50'),20050n);
  assert.equal(E.signed(-257n),'-2.57');
  assert.equal(E.date('2026-02-30'),false);
  const p=E.sample(),baseline=JSON.stringify(p),calc=E.calculate(p,'2027-01-05');
  assert.equal(calc.ok,true,calc.errors.join('; '));
  assert.equal(calc.lcValue,'10000.00');assert.equal(calc.originalValue,'10000.00');
  assert.equal(calc.obligations[0].maturity,'2026-12-09');
  assert.equal(calc.obligations[0].settled,'1200.00');
  assert.equal(calc.obligations[0].open,'3800.00');
  assert.equal(calc.overdue[0].open,'3800.00');
  assert.equal(JSON.stringify(p),baseline,'LC domain projection must not modify original.');
  const missingEvent=JSON.parse(baseline);missingEvent.events.bl=null;
  assert.equal(E.calculate(missingEvent).obligations[0].maturity,null,
    'No default BL date, even with declared 60 days.');
  const missingDays=JSON.parse(baseline);missingDays.obligations[0].term.days=null;
  assert.equal(E.calculate(missingDays).obligations[0].maturity,null);
  const missingCalendar=JSON.parse(baseline);missingCalendar.obligations[0].term.convention='';
  assert.equal(E.calculate(missingCalendar).obligations[0].maturity,null);
  const maturity=JSON.parse(baseline),term=maturity.obligations[0].term;
  term.days=5;term.convention='business';term.includeStart=false;
  assert.equal(E.calculate(maturity).obligations[0].maturity,null,
    'Business calendar is required before calculating.');
  term.weekendDays=[5,6];term.holidays=['2026-10-12'];
  term.calendarSource='SYNTHETIC WEEKEND AND HOLIDAY TERMS';
  term.calendarReviewer='Synthetic banking tester';term.calendarReviewDate='2026-10-17';
  term.nonbusinessStart='hold';
  assert.equal(E.calculate(maturity).obligations[0].maturity,'2026-10-18');
  term.includeStart=true;assert.equal(E.calculate(maturity).obligations[0].maturity,null,
    'A nonbusiness event date cannot be included without an approved adjustment.');
  term.nonbusinessStart='next-business';
  assert.equal(E.calculate(maturity).obligations[0].maturity,'2026-10-18');
  const amend=JSON.parse(baseline);
  amend.amendments.push({id:'A1',direction:'increase',amount:'1500.00',status:'pending',
    date:'2026-10-11',sourceRef:'SYNTHETIC PENDING',actor:'Reviewer'});
  assert.equal(E.calculate(amend).lcValue,'10000.00','Pending amendment cannot increase LC value.');
  amend.amendments[0].status='approved';amend.amendments[0].approvedBy='SYNTHETIC BANK';
  amend.amendments[0].approvedOn='2026-10-11';amend.amendments[0].approvalEvidence='TEST-SIGNED-AMENDMENT';
  assert.equal(E.calculate(amend).lcValue,'11500.00');
  amend.amendments.push({id:'A2',direction:'decrease',amount:'12000.00',status:'approved',
    date:'2026-10-12',sourceRef:'TEST-REDUCTION',actor:'Test bank',approvedBy:'Test bank',
    approvedOn:'2026-10-12',approvalEvidence:'TEST-SIGNED'});
  assert(!E.calculate(amend).ok,'LC reductions cannot result in negative value.');
  const settled=JSON.parse(baseline);
  settled.settlements.push({id:'S2',obligationId:'O1',kind:'credit-note',amount:'200.00',
    currency:'USD',date:'2026-10-17',reference:'TEST-CREDIT',sourceRef:'TEST-SIGNED-CREDIT',
    actor:'Test reviewer'});
  assert.equal(E.calculate(settled).obligations[0].open,'3600.00');
  settled.settlements.push({id:'S3',obligationId:'O1',kind:'reversal',amount:'50.00',
    currency:'USD',date:'2026-10-17',reference:'TEST-REVERSAL',sourceRef:'TEST-BANK-REVERSAL',
    actor:'Test reviewer'});
  assert.equal(E.calculate(settled).obligations[0].open,'3650.00');
  settled.settlements.push({id:'S4',obligationId:'O1',kind:'payment',amount:'5000.00',
    currency:'USD',date:'2026-10-17',reference:'TEST-OVERPAID',sourceRef:'TEST-OVERPAY',
    actor:'Test reviewer'});
  assert(!E.calculate(settled).ok,'Overpayment must be blocked.');
  const fx=JSON.parse(baseline);
  fx.settlements[0].currency='EUR';fx.settlements[0].amount='1000.00';
  assert(!E.calculate(fx).ok,'FX rate cannot be defaulted.');
  fx.settlements[0].fxRate='1.25000000';fx.settlements[0].fxDate='2026-10-16';
  fx.settlements[0].fxSource='SYNTHETIC FX BANK QUOTE';fx.settlements[0].fxRounding='half-up';
  assert.equal(E.calculate(fx).obligations[0].settled,'1250.00');
  fx.settlements[0].fxSource='';assert(!E.calculate(fx).ok);
  const mismatch=JSON.parse(baseline);
  mismatch.documents[0].linkedObligationId='O1';
  mismatch.documents[0].documentAmount='5100.00';
  mismatch.documents[0].documentCurrency='USD';
  mismatch.documents[0].amountSource='SYNTHETIC INVOICE DOCUMENT';
  const compared=E.calculate(mismatch);
  assert.equal(compared.ok,true,compared.errors.join('; '));
  assert.match(compared.documentComparisons[0].status,/MISMATCH/);
  assert(compared.notes.some(x=>x.includes('Document discrepancy')));
  const noSource=JSON.parse(JSON.stringify(mismatch));
  noSource.documents[0].amountSource='';
  assert(!E.calculate(noSource).ok);
  const noDays=JSON.parse(baseline);noDays.obligations[0].term.days=' ';
  assert.equal(E.calculate(noDays).obligations[0].maturity,null);
  const docs=JSON.parse(baseline);docs.documents[0].status='accepted';
  docs.documents[0].acceptedDate='2026-10-17';
  assert(!E.calculate(docs).ok,'Bank acceptance must be explicitly sourced.');
  docs.documents[0].acceptedEvidence='TEST BANK LETTER';
  assert(E.calculate(docs).ok);
  const charges=JSON.parse(baseline);charges.bankCharges.push({id:'C1',amount:'25.00',currency:'USD',
    date:'2026-10-16',reference:'SYNTHETIC CHARGE',sourceRef:'SYNTHETIC BANK DEBIT',
    actor:'SYNTHETIC OPERATOR'});
  assert.equal(E.calculate(charges).obligations[0].open,'3800.00',
    'Fees are not automatically netted from the beneficiary obligation.');
  const po={sourceApp:'VESA Purchase Order 360',recordType:'PurchaseOrder',
    recordId:'TEST-PO-1',revisionId:'REV-01',sourceDate:'2026-10-17',
    verifiedBy:'SYNTHETIC PO REVIEWER',verifiedAt:'2026-10-17',
    displaySnapshot:{poNo:'TEST-PO',buyer:'SYNTHETIC BUYER',factory:'SYNTHETIC FACTORY',
      currency:'USD',totalPieces:60,totalAmount:'165.00',
      sourceLines:[{style:'TEST',color:'Navy',size:'M',quantity:40,unitFob:'2.50'}]}};
  assert.equal(E.validPOReference(po),true);
  const alteredRef=JSON.parse(JSON.stringify(po));alteredRef.displaySnapshot.totalAmount='-5.00';
  assert.equal(E.validPOReference(alteredRef),false);
  const withPo=JSON.parse(baseline);withPo.header.poReference=po;
  assert.equal(E.calculate(withPo).ok,true);
  const store=new S('test@vesa.invalid'),valid=JSON.parse(baseline);
  valid.mode='local';store.save(valid);
  assert.equal(store.load(valid.id).obligations.length,1);
  const first=local.get(store.key),portable=S.encode(valid);
  assert.deepEqual(JSON.parse(JSON.stringify(S.decode(portable))),valid);
  assert.throws(()=>S.decode(portable.replace('"5000.00"','"7000.00"')),/altered/);
  assert.throws(()=>S.decode('{}'),/unsupported/);
  assert.equal(local.get(store.key),first);
  const invalid=JSON.parse(JSON.stringify(valid));invalid.version='OLD-INCOMPATIBLE';
  assert.throws(()=>store.save(invalid),/Unsupported/);
  assert.equal(local.get(store.key),first,'Failed import/save may not alter earlier records.');
  const sheets=R.sheets(valid,E.calculate(valid,'2027-01-05'));
  assert.deepEqual(Object.keys(sheets),['LC Register','Amendments','Maturity Calendar',
    'Document Checklist','Payment Obligations','Settlement Ledger',
    'Overdue and Forecast','Bank Charges','Manual PO Reference']);
  assert.equal(sheets['Maturity Calendar'][1][7],'2026-12-09');
  const numeric=R.excelRows('LC Register',sheets['LC Register']);
  assert.equal(numeric[9][1],10000,'LC current figure should have true Excel numeric type.');
  assert.equal(R.excelRows('LC Register',[['Field','Value'],['LC ID','=HYPERLINK']])[1][1],"'=HYPERLINK");
  console.log('LC-360 DOMAIN PASS: no default usance/calendar, source dates, synthetic business day, bank amendments, partial settlement/credit/reversal, explicit FX, documents, bank charges, atomic local copy, typed Excel.');
 }
}
LCUnitProof.test();
