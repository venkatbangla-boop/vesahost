/* Fabric & Trims 360 deterministic BOM/stock/QC/lot/restore proof. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
class FabricTest{
 static prove(){
  const root=path.resolve(__dirname,'..'),memory=new Map();
  const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  const context={module:{exports:{}},localStorage,Date,Math,JSON};context.globalThis=context;
  for(const file of ['src/domain/material-engine.js','src/data/local-record-port.js','src/reports/report-model.js'])
    vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const E=context.VesaFabricEngine,S=context.VesaFabricStore,R=context.VesaFabricReports;
  assert.equal(E.version,'VESA-FABRIC-TRIMS-1');
  assert.equal(E.parse('1.2345'),12345n);
  assert.equal(E.parse('-4.5'),null);
  assert.equal(E.parse('1.23456'),null);
  assert.equal(E.qty(-12345n),'-1.2345');
  assert.equal(E.date('2026-02-30'),false);
  const p=E.sample(),original=JSON.stringify(p),x=E.calculate(p,'2026-11-16');
  assert.equal(x.ok,true,x.errors.join('\n'));
  assert.equal(x.requirementsStatus[0].approved,'560.0000');
  assert.equal(x.requirementsStatus[0].consumptionEstimate,'561.0000');
  assert(x.notes.some(n=>n.includes('calculated consumption differs')),
    'BOM mismatch must be surfaced, not silently replaced.');
  assert.equal(x.requirementsStatus[0].confirmed,'300.0000');
  assert.equal(x.requirementsStatus[0].shortage,'260.0000');
  assert.equal(x.receiptBalances[0].approved,'390.0000');
  assert.equal(x.receiptBalances[0].netAvailable,'90.0000');
  assert.equal(x.deliveryExceptions[0].varianceDays,-5);
  assert.equal(JSON.stringify(p),original,'No mutation during pure calculations.');
  const extra=E.copy(p);
  extra.reservations.push({id:'RES1',receiptId:'RC1',otherPo:'DEMO-OTHER-PO',
    qty:'80.0000',unit:'kg',date:'2026-11-09',sourceRef:'SYNTHETIC RESERVATION'});
  assert.equal(E.calculate(extra).receiptBalances[0].netAvailable,'10.0000');
  extra.reservations[0].qty='100.0000';
  assert(!E.calculate(extra).ok,'Cannot double allocate beyond QA-approved stock.');
  const wrongShade=E.copy(p);wrongShade.receipts[0].shade='NAVY-2';
  assert(!E.calculate(wrongShade).ok,'Do not pool different shade receipts.');
  const duplicateGrn=E.copy(p);duplicateGrn.receipts.push({...duplicateGrn.receipts[0],id:'RC2'});
  assert(!E.calculate(duplicateGrn).ok,'Duplicate GRN rejected.');
  const qa=E.copy(p);qa.receipts[0].qaStatus='pending';qa.receipts[0].qaSource='';
  assert(!E.calculate(qa).ok,'No allocation of pending QA receipt.');
  qa.allocations=[];const pending=E.calculate(qa);
  assert.equal(pending.ok,true);
  assert.equal(pending.receiptBalances[0].approved,'0.0000');
  assert.equal(pending.requirementsStatus[0].shortage,'560.0000');
  const overReceipt=E.copy(p);overReceipt.receipts[0].qty='700.0000';
  assert(!E.calculate(overReceipt).ok,'Receive above booked qty requires distinct amended source.');
  const conversion=E.copy(p);conversion.bookings[0].unit='yd';
  conversion.receipts[0].unit='yd';conversion.receipts[0].qty='400.0000';
  conversion.receipts[0].rejected='10.0000';
  assert(!E.calculate(conversion).ok,'Allocations blocked without sourced yd/kg conversion.');
  conversion.bookings[0].conversion={fromUnit:'yd',toUnit:'kg',
    numerator:'0.8000',denominator:'1.0000',rounding:'half-up-4',
    sourceRef:'SYNTHETIC WIDTH AND MASS CONVERSION REVIEW'};
  const converted=E.calculate(conversion);
  assert.equal(converted.ok,true,converted.errors.join('\n'));
  assert.equal(converted.receiptBalances[0].approved,'312.0000');
  assert.equal(converted.receiptBalances[0].netAvailable,'12.0000');
  const absentCalendar=E.copy(p);absentCalendar.header.calendarBasis='business';
  assert.equal(E.calculate(absentCalendar).deliveryExceptions[0].varianceDays,null,
    'No guessed business-day variance.');
  const stale=E.copy(p);stale.header.bomRevision='BOM-V2';
  stale.header.bomSource='DEMO SOURCE REV 2';
  assert.equal(E.calculate(stale).requirementsStatus[0].readiness,'review-needed');
  const estimate=E.demand({...p.requirements[0],wastageSource:''});
  assert.equal(estimate,null,'No auto wastage.');
  assert.throws(()=>E.reviewedReference(p,{verifiedBy:'Reviewer',verifiedAt:'2026-11-16'}),
    /review/);
  const ref=E.reviewedReference(p,{verifiedBy:'Reviewer',verifiedAt:'2026-11-16',checked:true});
  assert.equal(ref.displaySnapshot.notPPMGo,true);
  assert.equal(ref.displaySnapshot.notTnaCompletion,true);
  assert.equal(ref.displaySnapshot.lines[0].shortage,'260.0000');
  const store=new S('synthetic-test@vesa.invalid'),record=E.copy(p);record.mode='local';
  store.save(record);assert.equal(store.load(record.id).receipts.length,1);
  const before=memory.get(store.key),copy=S.encode(record);
  assert.deepEqual(JSON.parse(JSON.stringify(S.decode(copy))),record);
  assert.throws(()=>S.decode(copy.replace('LOT-A','LOT-ATTACK')),/altered/);
  assert.equal(memory.get(store.key),before,'Failed recovery is atomic.');
  const invalid=E.copy(record);invalid.version='OLD-INVALID';
  assert.throws(()=>store.save(invalid),/Unsupported/);
  assert.equal(memory.get(store.key),before);
  const sheets=R.sheets(record,E.calculate(record));
  assert.deepEqual(Object.keys(sheets),['Order Material Summary','Material Master',
    'BOM Requirements','Supplier Bookings','Goods Receipt QC','Lot Allocation',
    'Other PO Reservations','Receipt Availability','Shortage Readiness',
    'Delivery Exceptions','Manual Source References']);
  assert.equal(R.excelRows('BOM Requirements',sheets['BOM Requirements'])[1][4],560);
  assert.equal(R.excelRows('Material Master',[['Material'],['=HYPERLINK("http://x")']])[1][0],
    '\'=HYPERLINK("http://x")');
  assert(R.html({...record,header:{...record.header,style:'<script>x</script>'}},
    E.calculate(record)).includes('&lt;script&gt;x&lt;/script&gt;'));
  console.log('FABRIC-360 DOMAIN PASS: source BOM/consumption, no default wastage/yd-kg, QA-gated per-receipt balance, shade separation, reservations, booked variance, stale BOM, atomic recovery and safe Excel.');
 }
}
FabricTest.prove();
