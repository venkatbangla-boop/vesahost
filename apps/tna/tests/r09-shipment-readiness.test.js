/**
 * R09 shipment readiness pure source, release fail-closed, privacy and XLSX.
 * Synthetic knit and denim only; never output real company order/quality data.
 * Run: node apps/tna/tests/r09-shipment-readiness.test.js
 */
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaShipmentReadinessProof {
  static plan(templateId){
    const plan=domain.createPlan({templateId,buyerName:'Synthetic Buyer R09',
      factoryName:'PRIVATE FACTORY R09',styleNo:'R09-STYLE',
      poNumber:'R09-PO',totalQty:1000,orderConfirmedOn:'2026-10-01',
      buyerRequiredExFactory:'2026-11-30'},
    {ownerUserId:'r09-synthetic'});
    plan.shipmentLots=[
      {lotId:'lot-1',lotReference:'LOT-R09-A',status:'partial',plannedQty:600,
        packedQty:550,passedQty:500,shippedQty:400,unit:'pcs',
        poAllocation:[{poNumber:'R09-PO',qty:600}],bookingRef:'=PRIVATE_BOOKING',
        inspectionRef:'CONFIDENTIAL-AQL-REFERENCE',factory:'SECRET FACTORY',
        requestedExFactory:'2026-10-13',currentExFactory:'2026-10-14',
        forecastExFactory:'2026-10-15',actualExFactory:'2026-10-14',
        ETD:'2026-10-18',ETA:'2026-11-08'},
      {lotId:'lot-2',lotReference:'LOT-R09-B',status:'packed',plannedQty:400,
        packedQty:200,passedQty:100,shippedQty:0,unit:'pcs',
        poAllocation:[{poNumber:'R09-PO',qty:400}],
        requestedExFactory:'2026-10-13',currentExFactory:'2026-10-17',
        forecastExFactory:'2026-10-20',actualExFactory:'2026-10-21',
        ETD:'2026-10-24',ETA:'2026-11-13'}
    ];
    const identity={buyer:plan.order.buyerName,factory:plan.order.factoryName,
      po:'R09-PO',style:'R09-STYLE'};
    plan.integrationReferences=[
      {id:'ppm-r09',sourceApp:'ppm',sourceSchema:'VESA-PPM:2',sourceVersion:'V5',
        sourceRecordId:'ppm-source-1',recordedStatus:'GO',verifiedBy:'Local checker',
        verifiedAt:'2026-10-15T05:30:00.000Z',orderIdentity:identity},
      {id:'aql-r09',sourceApp:'aql',sourceSchema:'VESA360-PROJECT:1',sourceVersion:'1',
        sourceRecordId:'aql-source-1',recordedStatus:'CONFORMED',verifiedBy:'Local checker',
        verifiedAt:'2026-10-15T05:30:00.000Z',orderIdentity:identity}
    ];
    for(const [ref,date] of [['PP08','2026-10-10'],['Q07','2026-10-12'],
      ['Q08','2026-10-13'],['PK05','2026-10-14'],['S01','2026-10-14'],
      ['S04','2026-10-14'],['S08','2026-10-15']]){
      const task=plan.tasks.find(t=>t.templateRef===ref);
      if(task){task.status='completed';task.dates.actualFinish=date;}
    }
    plan.order.commercialNotes='PRIVATE COMMISSION 7%';
    return plan;
  }
  static run(){
    for(const templateId of ['knit','denim']){
      const plan=this.plan(templateId),before=JSON.stringify(plan);
      const opts={reportId:'R09',generatedAt:'2026-10-16T05:00:00.000Z',
        timezone:'Asia/Dhaka',asOfDate:'2026-10-16',language:'en'};
      const model=reports.buildReportModel(plan,opts),r=model.shipmentReadiness;
      assert.equal(r.schema,'VESA-TNA-SHIPMENT-1');
      assert.equal(r.validity,'valid');
      assert.equal(r.lots.length,2);
      assert.equal(r.gates.length,12);
      assert.equal(r.integrations.length,2);
      assert.equal(r.totals.orderQty,1000);
      assert.equal(r.totals.planned,1000);
      assert.equal(r.totals.packed,750);
      assert.equal(r.totals.passed,600);
      assert.equal(r.totals.shipped,400);
      assert.equal(r.totals.balanceAgainstOrder,600);
      assert.equal(r.totals.unallocated,0);
      assert.equal(r.lots[0].remainingWithinLot,200);
      assert.equal(r.lots[0].bookingRef,'=PRIVATE_BOOKING');
      assert.equal(r.lots[0].bookingConfirmed,false);
      assert.equal(r.lots[0].inspectionPassedVerified,false);
      assert.equal(r.lots[0].dispatchReleased,false);
      assert.equal(r.lots[0].enteredActualExFactory,'2026-10-14');
      assert.equal(r.lots[0].actualRecordedAsOf,true);
      assert.equal(r.lots[0].ETD,'2026-10-18');
      assert.equal(r.lots[0].ETA,'2026-11-08');
      assert.equal(r.lots[1].actualRecordedAsOf,false);
      assert.equal(r.lots[1].dateWarning,r.labels.future);
      assert.equal(r.integrations[0].recordedDecision,'GO');
      assert.equal(r.integrations[1].recordedDecision,'CONFORMED');
      assert(r.integrations.every(x=>x.releaseAuthorityVerified===false));
      assert.equal(r.releaseAuthorized,false);
      assert.equal(r.externalDecisionsVerified,false);
      assert(r.errors.some(e=>e.includes('final inspection pass')),
        'Existing engine must block recorded shipment without a verified pass.');
      assert.equal(r.gates.find(x=>x.ref==='Q08').verifiedDecision,false);
      const planNoLots=structuredClone(plan);planNoLots.shipmentLots=[];
      const noLots=reports.buildReportModel(planNoLots,opts).shipmentReadiness;
      assert.equal(noLots.totals,null,'No lots is not a recorded shipped zero.');
      assert(noLots.warnings.includes(noLots.labels.noLots));
      const malformed=structuredClone(plan);malformed.shipmentLots[0].shippedQty=800;
      const wrong=reports.buildReportModel(malformed,opts).shipmentReadiness;
      assert.equal(wrong.validity,'incomplete');
      assert.equal(wrong.totals,null,'Invalid accepted balance cannot be summed.');
      assert.equal(wrong.lots[0].shippedQty,null);
      const badPo=structuredClone(plan);badPo.shipmentLots[0].poAllocation=[{poNumber:'OTHER-PRIVATE-PO',qty:600}];
      assert.equal(reports.buildReportModel(badPo,opts).shipmentReadiness.totals,null);
      const duplicate=structuredClone(plan);duplicate.shipmentLots[1].lotReference='lot-r09-a';
      assert.equal(reports.buildReportModel(duplicate,opts).shipmentReadiness.totals,null);
      const missing=structuredClone(plan);delete missing.shipmentLots[0].passedQty;
      assert.equal(reports.buildReportModel(missing,opts).shipmentReadiness.totals,null);
      const unresolved=structuredClone(plan);unresolved.integrationReferences[1].orderIdentity.style='WRONG-STYLE';
      const evaluated=reports.buildReportModel(unresolved,opts).shipmentReadiness;
      assert.equal(evaluated.integrations[1].recordedDecision,null,
        'Mismatched AQL identity cannot be promoted even to linked source status.');
      const invalidZone=reports.buildReportModel(plan,{...opts,timezone:''}).shipmentReadiness;
      assert.equal(invalidZone.validity,'incomplete');
      assert.deepEqual(invalidZone.lots,[]);
      const invalidDate=reports.buildReportModel(plan,{...opts,asOfDate:'2026-02-30'}).shipmentReadiness;
      assert.equal(invalidDate.validity,'incomplete');
      for(const lang of ['en','bn','hi','ta']){
        const localized=reports.buildReportModel(plan,{...opts,language:lang}).shipmentReadiness;
        assert.equal(localized.totals.shipped,400);
        assert(localized.labels.lotHeaders.length===12&&localized.labels.dateHeaders.length===8);
        assert(localized.labels.hold&&localized.labels.restricted);
      }
      const blocked=reports.buildReportModel(plan,{...opts,audienceMode:'buyer'});
      assert.equal(blocked.shipmentReadiness.validity,'restricted');
      assert.deepEqual(blocked.shipmentReadiness.lots,[]);
      assert.equal(blocked.tasks.length,0);
      assert.equal(blocked.source.recordId,null);
      const blockedText=JSON.stringify(blocked);
      for(const needle of ['PRIVATE FACTORY R09','LOT-R09-A','R09-STYLE',
        'PRIVATE COMMISSION','=PRIVATE_BOOKING','CONFIDENTIAL-AQL-REFERENCE',
        'Local checker','ppm-source-1','aql-source-1']){
        assert(!blockedText.includes(needle),'External report leaks: '+needle);
      }
      const wb=XLSX.read(storage.exportReportWorkbook(model),
        {type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(wb.SheetNames,['Report Summary','Order Summary',
        'Report Activities','Report Notes','Shipment Lots','Shipment Dates',
        'Shipment Gates','Shipment PO Allocation']);
      const lots=wb.Sheets['Shipment Lots'];
      assert.equal(lots.D2.t,'n');
      assert.equal(lots.D2.v,600);
      assert.equal(lots.G2.v,400);
      assert.equal(lots.H2.v,200);
      assert(lots.J2.v.startsWith("'"),'Formula-like booking is inert text.');
      const dates=wb.Sheets['Shipment Dates'];
      assert.equal(dates.E2.t,'n');
      assert.equal(dates.E2.z,'yyyy-mm-dd');
      assert.equal(dates.F2.t,'n');
      const gates=wb.Sheets['Shipment Gates'];
      assert.equal(gates.E2.t,'n','PP08 locally entered as-of actual serial.');
      assert.equal(gates.E2.z,'yyyy-mm-dd');
      const po=wb.Sheets['Shipment PO Allocation'];
      assert.equal(po.C2.v,600);
      for(const sheet of Object.values(wb.Sheets))
        assert(!Object.values(sheet).some(cell=>cell?.f),'Never export live Excel formulas.');
      const external=XLSX.read(storage.exportReportWorkbook(blocked),{type:'buffer'});
      assert(!JSON.stringify(external.Sheets).includes('LOT-R09-A'));
      assert(!JSON.stringify(external.Sheets).includes('PRIVATE FACTORY R09'));
      const previous=reports.buildReportModel(plan,{...opts,reportId:'R08'});
      assert(!previous.shipmentReadiness,'Earlier R08 contract unchanged.');
      assert.equal(JSON.stringify(plan),before,'R09 projection/export must not mutate records.');
    }
    console.log('TNA R09 PASS: knit/denim lot/PO reconciliations, unverified local PPM/AQL, final inspection release gate, civil dates, EN/BN/HI/TA, restricted buyer JSON, typed formula-safe Excel, immutability.');
  }
}
TnaShipmentReadinessProof.run();
