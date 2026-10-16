/** APP-02 source-based commission domain; no default commercial policy. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
class CommissionDomainProof{
 static bootstrap(){
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
  const js=html.match(/<script>\s*(\(function\(global\)[\s\S]*?)<\/script>/);
  assert(js,'Single HTML commission engine must be testable.');
  const data=new Map(),localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  const ctx={module:{exports:{}},localStorage,Date,Math,JSON};ctx.globalThis=ctx;
  vm.runInNewContext(js[1],ctx,{filename:'apps/order-commission/index.html'});
  return {...ctx.module.exports,data};
 }
 static check(){
  const {CommissionMoney:M,CommissionDomain:D,CommissionStore:S,CommissionReport:R,data}=this.bootstrap();
  assert.equal(M.parse('1.235',2),null);
  assert.equal(M.parse('-1',2),null);
  assert.equal(M.cents(M.parse('20.50')), '20.50');
  assert.equal(M.iso('2026-02-30'),false);
  assert.equal(M.iso('2026-10-16'),true);
  assert.equal(M.rate('3'),30000n);
  assert.equal(M.rate('0'),null);
  assert.equal(M.rate('101'),null);
  const blank=D.blank({buyer:'SYNTHETIC BUYER',po:'P1'});
  assert.equal(blank.agreement.ratePercent,'');
  assert.equal(D.analyze(blank).expected,null,'Never invent source or commission %.');
  const demo=D.demo(),demoOriginal=JSON.stringify(demo);
  assert.equal(D.analyze(demo).expected,'75.00');
  assert.equal(D.analyze(demo).earned,'0.00');
  assert.equal(D.analyze(demo).outstanding,'0.00');
  for(const [rate,expected] of [['2','50.00'],['3','75.00'],['4','100.00']]){
   const p=JSON.parse(demoOriginal);p.agreement.ratePercent=rate;
   assert.equal(D.analyze(p).expected,expected,rate+'% is input only, never a default.');
  }
  const down=JSON.parse(demoOriginal);down.agreement.rounding='total-down-2';
  down.lines[0].quantity=1;down.lines[0].unitFob='0.5000';down.agreement.ratePercent='1';
  assert.equal(D.analyze(down).expected,'0.00');
  down.agreement.rounding='total-half-up-2';assert.equal(D.analyze(down).expected,'0.01');
  const p=JSON.parse(demoOriginal);p.mode='local';
  p.earnings=[{id:'E1',amount:'50.00',currency:'USD',milestone:p.agreement.earnedRule,
    date:'2026-10-13',evidenceRef:'SYNTHETIC EARNED CHECK',actor:'Synthetic operator'}];
  p.invoices=[{id:'I1',invoiceNo:'TEST-COM-01',amount:'40.00',currency:'USD',status:'issued',
    issuedOn:'2026-10-14',dueDate:'2026-10-15',
    sourceRef:'SYNTHETIC ISSUED INVOICE',issuedBy:'Test operator'}];
  p.receipts=[{id:'R1',ref:'TEST-TRANSFER',amount:'20.00',currency:'USD',date:'2026-10-16',
    evidenceRef:'SYNTHETIC BANK EVIDENCE',actor:'Finance test',invoiceId:'I1'}];
  p.adjustments=[{id:'A1',amount:'5.00',currency:'USD',date:'2026-10-16',contractRef:'SYNTHETIC CREDIT CONTRACT',
    reason:'Explicit test deduction',actor:'Test reviewer'}];
  const calc=D.analyze(p,'2026-10-16');
  assert.equal(calc.ok,true,calc.errors.join('; '));
  assert.equal(calc.expected,'75.00');assert.equal(calc.earned,'50.00');
  assert.equal(calc.invoiced,'40.00');assert.equal(calc.received,'20.00');
  assert.equal(calc.adjustment,'5.00');assert.equal(calc.outstanding,'25.00');
  assert.equal(calc.overdue[0].open,'20.00');assert.equal(calc.overdue[0].invoiceNo,'TEST-COM-01');
  p.receipts.push({id:'R2',ref:'TEST-EUR-TRANSFER',amount:'12.00',currency:'EUR',date:'2026-10-16',
    fxRate:'1.25000000',fxDate:'2026-10-16',fxSource:'SYNTHETIC FX WRITTEN QUOTE',
    evidenceRef:'SYNTHETIC MULTICURRENCY RECEIPT',actor:'Finance test',invoiceId:'I1'});
  assert.equal(D.analyze(p,'2026-10-16').received,'35.00');
  assert.equal(D.analyze(p,'2026-10-16').outstanding,'10.00');
  assert.equal(D.analyze(p,'2026-10-16').overdue[0].open,'5.00');
  p.receipts[1].fxSource='';assert(!D.analyze(p).ok,'Unsourced FX must fail.');
  p.receipts[1].fxSource='SYNTHETIC FX SOURCE';
  p.receipts[1].fxRate='0';assert(!D.analyze(p).ok,'Zero FX not acceptable.');
  p.receipts[1].fxRate='1.25000000';
  p.receipts[1].amount='30.00';assert(!D.analyze(p).ok,'Overpayment must fail.');
  p.receipts[1].amount='12.00';
  const wrongCurrency=JSON.parse(JSON.stringify(p));wrongCurrency.lines[0].currency='BDT';
  assert(!D.analyze(wrongCurrency).ok);
  const wrongBasis=JSON.parse(JSON.stringify(p));wrongBasis.lines[0].basis='received-fob';
  assert(!D.analyze(wrongBasis).ok);
  const missingMilestone=JSON.parse(JSON.stringify(p));missingMilestone.earnings[0].milestone='';
  assert(!D.analyze(missingMilestone).ok);
  const duplicate=JSON.parse(JSON.stringify(p));duplicate.invoices.push({...duplicate.invoices[0],id:'I2'});
  assert(!D.analyze(duplicate).ok);
  const exclusion=JSON.parse(demoOriginal);exclusion.exclusions=[{id:'X1',amount:'25.00',
    date:'2026-10-15',contractSource:'SYNTHETIC EXCLUSION SOURCE',reason:'Excluded in terms'}];
  assert.equal(D.analyze(exclusion).expected,'74.25');
  const edited=JSON.parse(demoOriginal);edited.agreement.currency='';
  assert.equal(D.analyze(edited).expected,null,'Currency unverified means no expectation.');
  const store=new S('synthetic@example.org');
  S.validate(p);store.save(p);const storedText=data.get(store.key);
  const saved=store.open(p.id);assert.equal(saved.invoices[0].status,'issued');
  const packet=S.encode(p);assert.deepEqual(JSON.parse(JSON.stringify(S.decode(packet))),p);
  assert.throws(()=>S.decode(packet.replace('"20.00"','"90.00"')),/altered/);
  assert.throws(()=>S.decode('{}'),/unsupported/);
  const invalid=JSON.parse(JSON.stringify(p));invalid.version='LEGACY-INCOMPATIBLE';
  assert.throws(()=>store.save(invalid),/Unsupported/);
  assert.equal(data.get(store.key),storedText);
  const rows=R.sheets(p,D.analyze(p,'2026-10-16'));
  assert.equal(rows['Expected Earned Paid'][1][1],75);
  assert.equal(rows['Expected Earned Paid'][2][1],50);
  assert.equal(rows['Overdue'][1][2],5);
  assert.equal(R.csvSafe('=HYPERLINK("https://fake")'),"'=HYPERLINK(\"https://fake\")");
  assert.equal(R.csvSafe('@BAD'),"'@BAD");
  assert.equal(JSON.stringify(demo),demoOriginal,'Projection must not mutate source.');
  console.log('APP-02 DOMAIN PASS: no default rate, explicit 2/3/4%, fixed-decimal rounding, source basis, earned/invoiced/received/credits, overdue, manual FX, overpayment rejection, saved-copy integrity and formula safety.');
 }
}
CommissionDomainProof.check();
