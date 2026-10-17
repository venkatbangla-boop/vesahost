/** VESA PO-360 deterministic domain, exact money, evidence and recovery tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
class PurchaseOrderDomainProof{
 static load(){
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
  const match=html.match(/<script>\s*(\(function\(global\)[\s\S]*?)<\/script>/);
  assert(match,'One HTML must contain the PO engine.');
  const memory=new Map();
  const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  const sandbox={module:{exports:{}},localStorage,Date,Math,JSON};sandbox.globalThis=sandbox;
  vm.runInNewContext(match[1],sandbox,{filename:'po-360-inline.js'});
  return {...sandbox.module.exports,memory};
 }
 static prove(){
  const {PurchaseOrderEngine:E,PurchaseOrderStore:S,PurchaseOrderReport:R,memory,VERSION}=this.load();
  assert.equal(VERSION,'VESA-PO360-PLAN-1');
  assert.equal(E.parse('2.5000'),25000n);assert.equal(E.parse('2.50001'),null);
  assert.equal(E.parse('-2.00'),null);
  assert.equal(E.money(16500n),'165.00');
  assert.equal(E.date('2026-02-30'),false);assert.equal(E.date('2026-10-17'),true);
  assert.equal(E.currency('USD'),true);assert.equal(E.currency('usd'),false);
  assert.equal(E.lineValue({quantity:1,unitFob:'0.0050'},'line-half-up-2'),1n);
  assert.equal(E.lineValue({quantity:1,unitFob:'0.0050'},'line-down-2'),0n);
  const demo=E.demo(),copy=JSON.stringify(demo),calc=E.validate(demo);
  assert.equal(calc.ok,true,calc.errors.join('\n'));
  assert.equal(calc.quantity,60);assert.equal(calc.amount,'165.00');
  assert.equal(calc.controlReconciled,true);
  assert.equal(calc.balances[0].unshipped,null,'Without complete source, shipment balance remains unknown.');
  assert.equal(JSON.stringify(demo),copy,'Calculation must not mutate buyer source.');
  const entry=E.create({...demo.header,declaredQty:60,declaredAmount:'165.00'});
  assert(E.validate(entry).ok,'Buyer PO totals may precede line-by-line entry.');
  assert.equal(E.validate(entry).controlReconciled,false);
  entry.lines.push(JSON.parse(JSON.stringify(demo.lines[0])));
  assert.equal(E.validate(entry).ok,true,'Intermediate line entry remains editable.');
  assert.equal(E.validate(entry).controlReconciled,false,'Partially entered lines cannot authorize a revision.');
  entry.lines.push(JSON.parse(JSON.stringify(demo.lines[1])));
  assert.equal(E.validate(entry).controlReconciled,true);
  entry.lines[0].unitFob='9.9999';assert.equal(E.validate(entry).controlReconciled,false);
  entry.lines[0].unitFob='2.5000';
  const duplicate=JSON.parse(copy);duplicate.lines.push({...duplicate.lines[0],id:'DUP'});
  assert(E.validate(duplicate).errors.some(x=>x.includes('Duplicate style/colour/size')));
  const intentional=JSON.parse(copy);
  intentional.lines[0].splitId='A';intentional.lines[1].size='M';intentional.lines[1].splitId='B';
  assert.equal(E.validate(intentional).ok,true,'Distinct sourced split IDs permit a legitimate intentional split.');
  intentional.lines.push({...intentional.lines[1],id:'L3',splitId:'B'});
  assert(E.validate(intentional).errors.some(x=>x.includes('Duplicate style/colour/size')),
    'Three-way split cannot reuse a lot ID.');
  const wrong=JSON.parse(copy);wrong.lines[0].quantity=80;
  assert.equal(E.validate(wrong).controlReconciled,false);
  const quantityBad=JSON.parse(copy);quantityBad.lines[0].quantity=1.5;
  assert(!E.validate(quantityBad).ok);
  const unitBad=JSON.parse(copy);unitBad.lines[0].unitFob='-0.1234';
  assert(!E.validate(unitBad).ok);
  const overflow=JSON.parse(copy);overflow.lines[0].quantity=1e11;
  assert(!E.validate(overflow).ok);
  const p=JSON.parse(copy);p.mode='local';
  p.shipments.push({id:'SHIP1',lineId:'L1',quantity:10,date:'2026-10-17',
    sourceRef:'SYNTHETIC SHIPMENT SOURCE',actor:'Test merchandiser',documentRef:'TEST-BL'});
  p.cancelled.push({id:'CAN1',lineId:'L1',quantity:5,date:'2026-10-17',
    sourceRef:'SYNTHETIC CANCEL DOCUMENT',actor:'Test merchandiser',documentRef:'TEST-CANCEL'});
  assert.equal(E.validate(p).balances[0].unshipped,null,'Shipment ledger is not complete merely because one BL exists.');
  p.header.ledgerComplete=true;p.header.ledgerSource='TEST COMPLETE SHIPPING REGISTER';
  assert.equal(E.validate(p).balances[0].unshipped,25);
  p.shipments.push({id:'SHIP2',lineId:'L1',quantity:30,date:'2026-10-18',
    sourceRef:'SYNTHETIC OVERLOAD',actor:'QA',documentRef:'TEST-OVER'});
  assert(!E.validate(p).ok,'Shipped + cancelled > ordered must reject.');
  p.shipments.pop();
  const unknown=JSON.parse(JSON.stringify(p));unknown.header.ledgerSource='';
  assert(!E.validate(unknown).ok);
  const amend={id:'AM1',reason:'TEST CHANGE',requestedBy:'SYNTHETIC BUYER',
    date:'2026-10-17',sourceRef:'TEST AMEND DOCUMENT',status:'pending'};
  p.amendments.push(amend);
  assert(E.validate(p).ok);
  p.amendments[0].status='acknowledged';
  assert(!E.validate(p).ok,'Acknowledgment cannot be silently inferred.');
  p.acknowledgments.push({id:'A1',amendmentId:'AM1',actor:'Test factory',
    date:'2026-10-18',sourceRef:'TEST FACTORY ACK'});
  assert(E.validate(p).ok,'Separate dated ACK establishes only locally entered status.');
  const snapshot={header:JSON.parse(JSON.stringify(p.header)),
    lines:JSON.parse(JSON.stringify(p.lines)),cancelled:JSON.parse(JSON.stringify(p.cancelled)),
    shipments:JSON.parse(JSON.stringify(p.shipments))};
  p.revisions.push({id:'R1',recordRevision:1,at:'2026-10-17T00:00:00.000Z',
    authority:'SYNTHETIC PO BUYER',effectiveDate:'2026-10-17',documentRef:'SYNTHETIC SIGNED PO',snapshot});
  const frozen=JSON.stringify(p.revisions[0]);
  p.header.packingInstructionRef='UPDATED SYNTHETIC PACKING SOURCE';
  assert.equal(JSON.stringify(p.revisions[0]),frozen,'Signed source snapshots never mutate with working header.');
  assert(E.compare(p,p.revisions[0]).some(x=>x.field==='header'));
  const store=new S('synthetic@vesa.test');store.save(p);assert.equal(store.load(p.id).revisions.length,1);
  const originalStore=memory.get(store.key),packet=S.encode(p);
  assert.deepEqual(JSON.parse(JSON.stringify(S.decode(packet))),p);
  assert.throws(()=>S.decode(packet.replace('"2.5000"','"3.5000"')),/altered/);
  assert.throws(()=>S.decode('{}'),/unsupported/);
  const incompatible=JSON.parse(JSON.stringify(p));incompatible.version='PO-OLD-UNSAFE';
  assert.throws(()=>store.save(incompatible),/Unsupported/);
  assert.equal(memory.get(store.key),originalStore,'Malformed copy must not replace local PO.');
  const sheets=R.sheets(p,E.validate(p),E.compare(p,p.revisions[0]));
  assert.deepEqual(Object.keys(sheets),['PO Summary','Style Colour Size','PO Balance','Amendment Register',
    'Acknowledgements','Buyer vs Factory Confirmation','PO Version Comparison','Source Revisions','Manual Shipment Sources']);
  assert.equal(E.validate(demo).factoryComparison[0].factory,null);
  const separate=JSON.parse(copy);
  separate.factoryConfirmation={quantity:58,amount:'164.00',currency:'USD',
    shipFrom:'2026-10-22',shipToDate:'2026-11-10',acknowledgedBy:'SYNTHETIC FACTORY',
    acknowledgedOn:'2026-10-17',documentRef:'SYNTHETIC FACTORY ACK',
    sourceRef:'SYNTHETIC FACTORY STATEMENT',reviewedBy:'SYNTHETIC REVIEWER',reviewedOn:'2026-10-17'};
  const result=E.validate(separate);
  assert.equal(result.ok,true,result.errors.join('; '));
  assert.equal(result.factoryComparison[0].difference,-2);
  assert.equal(result.factoryComparison[1].difference,'-1.00');
  assert.equal(result.factoryComparison[3].difference,'Dates differ');
  const missing=JSON.parse(JSON.stringify(separate));missing.factoryConfirmation.sourceRef='';
  assert.equal(E.validate(missing).ok,false,'Factory statement must have a distinct source.');
  const differentCurrency=JSON.parse(JSON.stringify(separate));
  differentCurrency.factoryConfirmation.currency='EUR';
  assert.equal(E.validate(differentCurrency).factoryComparison[1].difference,null,
    'Different factory currency is not automatically converted.');
  const factorySheet=R.sheets(separate,result,[])['Buyer vs Factory Confirmation'];
  assert.equal(factorySheet[1][3],-2);assert.equal(factorySheet[2][3],'-1.00');
  const legacy=JSON.parse(copy);delete legacy.factoryConfirmation;
  assert.equal(E.validate(legacy).ok,true,'Previous saved PO versions remain supported.');
  const numeric=R.excelRows('Style Colour Size',sheets['Style Colour Size']);
  assert.equal(numeric[1][4],40);assert.equal(numeric[1][5],2.5);assert.equal(numeric[1][6],100);
  assert.equal(R.excelRows('PO Summary',[['Field','Value'],['PO Number','=FAKE']])[1][1],"'=FAKE");
  console.log('PO-360 DOMAIN PASS: explicit buyer terms, sourced 4dp FOB, half-up/down, staged size controls, mixed/split IDs, over-ship/cancel, ledger source gating, ACK, revision snapshots, Excel and safe saved-copy.');
 }
}
PurchaseOrderDomainProof.prove();
