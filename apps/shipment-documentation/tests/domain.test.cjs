/* APP-07 sourced packing, invoice, dispatch, document version and recoverability proof. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
class ShipmentDomainProof {
 static run(){
  const dir=path.resolve(__dirname,'..'),memory=new Map();
  const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  const sandbox={module:{exports:{}},localStorage,Date,Math,JSON};sandbox.globalThis=sandbox;
  for(const file of ['src/domain/shipment-engine.js','src/data/local-record-port.js','src/reports/report-model.js'])
   vm.runInNewContext(fs.readFileSync(path.join(dir,file),'utf8'),sandbox,{filename:file});
  const E=sandbox.VesaShipmentEngine,S=sandbox.VesaShipmentStore,R=sandbox.VesaShipmentReports;
  assert.equal(E.version,'VESA-SHIPDOC360-1');
  assert.equal(E.decimal('1.2345',4),12345n);
  assert.equal(E.decimal('-1.00'),null);assert.equal(E.decimal('1.00001',4),null);
  assert(!E.date('2026-02-29'));assert(E.date('2026-10-17'));
  assert.equal(E.display(-156n),'-1.56');
  assert.equal(E.lineAmount(1,'2.5050','line-half-up-2'),251n);
  assert.equal(E.lineAmount(1,'2.5050','line-down-2'),250n);
  assert.equal(E.lineAmount(1,'2.5050',''),null);
  const demo=E.demo(),copy=JSON.stringify(demo),x=E.analyze(demo,'2026-10-17');
  assert(x.ok,x.errors.join('\n'));assert.equal(x.invoiceQty,50);
  assert.equal(x.invoiceAmount,'125.00');assert.equal(x.packingQty,50);
  assert.equal(x.cartonCount,2);assert.equal(x.declaredCbm,'0.1100');
  assert.equal(x.declaredNetKg,'19.000');assert.equal(x.declaredGrossKg,'20.800');
  assert.equal(x.packingMatched,true);assert.equal(x.latestPackingReviewed,true);
  assert.equal(x.dispatchedQty,20);assert.equal(x.dispatchLines[0].unshipped,null);
  assert.equal(x.release,'DRAFT / NEEDS INFORMATION','Never auto-declare customs or carrier release.');
  assert.equal(JSON.stringify(demo),copy,'Projection must preserve source record.');
  const noSource=E.copy(demo);noSource.lines[0].invoiceSource='';
  assert(!E.analyze(noSource).ok);
  const missingUnit=E.copy(demo);missingUnit.lines[0].rounding='';
  assert(!E.analyze(missingUnit).ok);
  const badControl=E.copy(demo);badControl.header.invoiceControl='126.00';
  assert.equal(E.analyze(badControl).invoiceValueMatched,false);
  assert(E.analyze(badControl).notes.some(s=>s.includes('HOLD')));
  const doubleCarton=E.copy(demo);doubleCarton.packing[1].cartonId='ctn-001';
  assert(!E.analyze(doubleCarton).ok);
  const extraPacked=E.copy(demo);extraPacked.packing[0].pieces=60;
  assert(!E.analyze(extraPacked).ok);
  const wrongWeight=E.copy(demo);wrongWeight.packing[0].grossKg='6.000';
  assert(!E.analyze(wrongWeight).ok);
  const snapshotBad=E.copy(demo);snapshotBad.packingSnapshots[0].controlCbm='0.1000';
  assert(!E.analyze(snapshotBad).ok);
  const immutable=E.copy(demo),frozen=JSON.stringify(immutable.packingSnapshots[0]);
  immutable.packing[0].pieces=19;
  assert.equal(JSON.stringify(immutable.packingSnapshots[0]),frozen);
  assert.equal(E.analyze(immutable).latestPackingReviewed,false);
  const split=E.copy(demo);split.dispatches.push({id:'DISP-2',lineId:'L1',pieces:30,
   date:'2026-10-14',carrierRef:'SYNTHETIC CARRIER 2',sourceRef:'SYNTHETIC SHIPPING RECORD 2',actor:'QA'});
  assert(E.analyze(split).ok);
  assert.equal(E.analyze(split).dispatchedQty,50);
  const over=E.copy(split);over.dispatches.push({id:'DISP-3',lineId:'L1',pieces:1,
   date:'2026-10-15',carrierRef:'SYNTHETIC CARRIER 3',sourceRef:'SYNTHETIC ACTUAL 3',actor:'QA'});
  assert(!E.analyze(over).ok,'Actual dispatch cannot exceed prepared packing or invoiced line.');
  const ack=E.copy(demo);ack.documents[0].status='acknowledged';
  assert(!E.analyze(ack).ok,'Bank/carrier acceptance cannot be inferred.');
  ack.documents[0].ackActor='SYNTHETIC FORWARDER';
  ack.documents[0].ackDate='2026-10-16';ack.documents[0].ackEvidence='DEMO ACK LETTER';
  assert(E.analyze(ack).ok);
  ack.documents.push({id:'DOC2',kind:'invoice',versionNo:2,status:'revised',
    documentRef:'DEMO INVOICE VERSION TWO',sourceRef:'DEMO AMEND SOURCE',
    actor:'SYNTHETIC REVIEWER',date:'2026-10-18',
    parentId:'DOC1',ackActor:'',ackDate:'',ackEvidence:''});
  assert(E.analyze(ack).ok);
  assert.equal(E.analyze(ack).currentDocuments[0].versionNo,2);
  const dupVer=E.copy(ack);dupVer.documents[1].versionNo=1;assert(!E.analyze(dupVer).ok);
  const prior=E.copy(ack);prior.documents[1].parentId='MISSING';assert(!E.analyze(prior).ok);
  const noCarrier=E.copy(demo);noCarrier.transport.etd='2026-10-12';
  assert(!E.analyze(noCarrier).ok,'ETD without carrier date convention/source fails');
  const missingOrigin=E.copy(demo);missingOrigin.header.originEvidence='';
  assert(!E.analyze(missingOrigin).ok);
  const r=E.reviewedReference(demo,{verifiedBy:'SYNTHETIC REVIEWER',
    verifiedAt:'2026-10-17',checked:true});
  assert.equal(r.displaySnapshot.notCustomsRelease,true);
  assert.equal(r.displaySnapshot.locallyReviewedOnly,true);
  assert.equal(r.displaySnapshot.dispatchPieces,20);
  assert.throws(()=>E.reviewedReference(demo,{verifiedBy:'QA',verifiedAt:'2026-10-17'}),/review/);
  const store=new S('qa@vesa.invalid'),saved=E.copy(demo);saved.mode='local';
  store.save(saved);assert.equal(store.load(saved.id).lines.length,1);
  const before=memory.get(store.key),file=S.encode(saved);
  assert.deepEqual(JSON.parse(JSON.stringify(S.decode(file))),saved);
  assert.throws(()=>S.decode(file.replace('2.5000','9.5000')),/altered/);
  assert.throws(()=>S.decode('{}'),/altered|unsupported/);
  assert.equal(memory.get(store.key),before);
  const old=E.copy(saved);old.version='UNSUPPORTED-OLD';
  assert.throws(()=>store.save(old),/Unsupported/);
  assert.equal(memory.get(store.key),before);
  const books=R.sheets(saved,E.analyze(saved,'2026-10-17'));
  assert.deepEqual(Object.keys(books),['Shipment Summary','Commercial Invoice Draft',
    'Packing List','Shipment Reconciliation','Dispatch Register','Document Checklist',
    'Document Version History','Packing Revision History','Transport ETA','Manual App References']);
  assert.equal(R.excelRows('Commercial Invoice Draft',books['Commercial Invoice Draft'])[1][5],50);
  assert.equal(R.excelRows('Commercial Invoice Draft',books['Commercial Invoice Draft'])[1][6],2.5);
  assert.equal(R.excelRows('Commercial Invoice Draft',books['Commercial Invoice Draft'])[1][7],125);
  assert.equal(R.excelRows('Commercial Invoice Draft',[['Price'],['=BAD']])[1][0],"'=BAD");
  assert(R.html({...saved,header:{...saved.header,shipper:'<img src=x onerror=1>'}},
     E.analyze(saved)).includes('&lt;img src=x onerror=1&gt;'));
  console.log('SHIPMENT-360 DOMAIN PASS: sourced 4dp price/2dp invoice, duplicate cartons, lot dispatch partials, packing snapshot control and history, third-party ACK gate, revision history, portable recovery and Excel/HTML safety.');
 }
}
ShipmentDomainProof.run();