/**
 * R07 production source, privacy, and typed Excel proof. Synthetic fixtures only.
 * Run: node apps/tna/tests/r07-production-status.test.js
 */
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaProductionReportProof {
  /** Model real recorded operations separately from capacity-only empty records. */
  static fixture(templateId){
    const plan=domain.createPlan({
      templateId,buyerName:'Training Buyer',factoryName:'PRIVATE FACTORY R07',
      styleNo:'R07-STYLE',poNumber:'R07-PO',totalQty:1000,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-10'
    },{ownerUserId:'production-proof'});
    const completion=plan.tasks.find(t=>t.templateRef==='C06');
    assert(completion);
    completion.dates.currentTargetFinish='2026-10-15';
    const frozen=domain.freezeBaseline(plan,{actorId:'production-proof',reason:'Synthetic baseline'});
    assert(frozen.ok);
    const next=frozen.plan;
    const byRef=ref=>next.tasks.find(t=>t.templateRef===ref);
    byRef('C04').status='completed';byRef('C04').dates.actualFinish='2026-10-10';
    byRef('C06').status='completed';byRef('C06').dates.actualFinish='2026-10-14';
    byRef('C06').dates.currentTargetFinish='2026-10-16';
    byRef('C06').dates.forecastFinish='2026-10-13';
    byRef('P01').status='completed';byRef('P01').dates.actualFinish='2026-10-12';
    byRef('P03').status='completed';byRef('P03').dates.actualFinish='2026-10-20';
    next.operations.push({
      operationId:'OP-CUT',type:'cut',lotId:'LOT-1',
      qtyInput:100,qtyCompleted:70,qtyRejected:5,qtyReworked:0,qtyWip:15,
      unit:'pcs',dailyActuals:[],datedCapacityEntries:[],remarks:'PRIVATE INTERNAL SHIFT'
    },{
      operationId:'OP-SEW',type:'sew',lotId:'LOT-2',
      qtyInput:80,qtyCompleted:40,qtyRejected:3,qtyReworked:3,qtyWip:20,
      unit:'pcs',dailyActuals:[],datedCapacityEntries:[]
    },{
      operationId:'OP-PACK',type:'pack',lotId:'',qtyInput:0,qtyCompleted:0,
      qtyRejected:0,qtyReworked:0,qtyWip:0,unit:'pcs',
      dailyActuals:[],datedCapacityEntries:[{date:'2026-10-16',resourceId:'LINE-PRIVATE',allocatedLines:1,availableLines:2}]
    });
    next.order.commercialNotes='PRIVATE FOB $999';
    return next;
  }
  static run(){
    for(const templateId of ['knit','denim']){
      const plan=this.fixture(templateId),original=JSON.stringify(plan);
      const options={reportId:'R07',language:'en',generatedAt:'2026-10-16T10:00:00.000Z',
        timezone:'Asia/Dhaka',asOfDate:'2026-10-16'};
      const model=reports.buildReportModel(plan,options),p=model.productionStatus;
      assert.equal(p.schema,'VESA-TNA-PRODUCTION-1');
      assert.equal(p.validity,'valid');
      assert.equal(p.stageRows.length,4);
      assert.equal(p.operationRows.length,3);
      assert.equal(p.stageRows[0].startActual,'2026-10-10');
      assert.equal(p.stageRows[0].finishActual,'2026-10-14');
      assert.equal(p.stageRows[0].confirmedBaseline,'2026-10-15');
      assert.equal(p.stageRows[0].currentTarget,'2026-10-16');
      assert.equal(p.stageRows[0].forecastFinish,'2026-10-13');
      assert.equal(p.stageRows[0].input,100);
      assert.equal(p.stageRows[0].completed,70);
      assert.equal(p.stageRows[0].remainingWithinInput,10);
      assert.equal(p.stageRows[1].input,80);
      assert.equal(p.stageRows[1].remainingWithinInput,20);
      assert.equal(p.stageRows[1].finishActual,null,'Future actual is not completed as of report day.');
      assert.equal(p.stageRows[1].completionAfterAsOf,true);
      assert.equal(p.stageRows[2].completed,null,'No finishing source cannot become zero output.');
      assert.equal(p.stageRows[3].completed,null,'Capacity-only zero is NOT recorded packing output.');
      assert.equal(p.counts.withRecordedOutput,2);
      assert(p.stageRows.every(row=>row.verifiedDailyOutput===null&&row.projectedFinish===null),
        'No unsourced production rate or projected finish is allowed.');
      const unknown=reports.buildReportModel(plan,{...options,timezone:''}).productionStatus;
      assert.equal(unknown.validity,'incomplete');
      assert.equal(unknown.stageRows.length,0);
      const future=reports.buildReportModel(plan,{...options,asOfDate:'2026-02-30'}).productionStatus;
      assert.equal(future.validity,'incomplete');
      for(const language of ['en','bn','hi','ta']){
        const local=reports.buildReportModel(plan,{...options,language}).productionStatus;
        assert.equal(local.counts.withRecordedOutput,2);
        assert(local.labels.stages.cut&&local.labels.controlConsent&&local.labels.rateMissing);
      }
      const duplicated=structuredClone(plan);
      duplicated.operations.push({...duplicated.operations[0],operationId:'OP-CUT-2'});
      const duplicate=reports.buildReportModel(duplicated,options).productionStatus;
      assert.equal(duplicate.stageRows[0].completed,null,'Duplicate lot cannot be aggregated twice.');
      assert.equal(duplicate.stageRows[0].quantityScope,'unreconciled');
      const invalid=structuredClone(plan);
      invalid.operations[0].qtyCompleted=9999;
      const blocked=reports.buildReportModel(invalid,options).productionStatus;
      assert.equal(blocked.stageRows[0].completed,null);
      assert.equal(blocked.operationRows[0].sourceStatus,blocked.labels.invalidSource);
      const buyerBlocked=reports.buildReportModel(plan,{...options,audienceMode:'buyer',
        recipientReviewed:false,authorizationSourceRef:'Buyer email'}),blockedJson=JSON.stringify(buyerBlocked);
      assert.equal(buyerBlocked.productionStatus.validity,'restricted');
      assert.equal(buyerBlocked.productionStatus.stageRows.length,0);
      assert(!blockedJson.includes('PRIVATE FACTORY')&&!blockedJson.includes('PRIVATE FOB'));
      assert(!blockedJson.includes('OP-CUT')&&!blockedJson.includes('LINE-PRIVATE'));
      const buyer=reports.buildReportModel(plan,{...options,audienceMode:'buyer',
        recipientReviewed:true,authorizationSourceRef:'Internal buyer permission reviewed'});
      assert.equal(buyer.productionStatus.validity,'valid');
      assert.equal(buyer.productionStatus.stageRows.length,4);
      assert.equal(buyer.productionStatus.stageRows[0].completed,70);
      assert.equal(buyer.productionStatus.operationRows.length,0);
      assert.equal(buyer.tasks.length,0,'Buyer common workbook/activity export must be allowlisted.');
      const buyerJson=JSON.stringify(buyer);
      for(const forbidden of ['PRIVATE FACTORY','PRIVATE FOB','PRIVATE INTERNAL SHIFT','OP-CUT',
        'LOT-1','LINE-PRIVATE','Internal buyer permission reviewed','production-proof']){
        assert(!buyerJson.includes(forbidden),'Buyer data leak: '+forbidden);
      }
      assert.equal(buyer.source.recordId,null,'Private storage ID excluded.');
      const wb=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(wb.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Production Stages','Recorded Operations']);
      const stages=wb.Sheets['Production Stages'];
      assert.equal(stages.B2.t,'n');
      assert.equal(stages.C2.t,'n');
      assert.equal(stages.F2.t,'n');
      assert.equal(stages.F2.v,70);
      assert.equal(stages.K2.v,10);
      assert.equal(stages.F5.t,'s','Capacity-only packing output is text Needs Information.');
      assert.equal(stages.B2.z,'yyyy-mm-dd');
      const buyerExcel=XLSX.read(storage.exportReportWorkbook(buyer),{type:'buffer'});
      assert.deepEqual(buyerExcel.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Production Stages']);
      const xlsxBuyerJson=JSON.stringify(buyerExcel.Sheets);
      for(const forbidden of ['PRIVATE FACTORY','PRIVATE FOB','OP-CUT','LOT-1','LINE-PRIVATE']){
        assert(!xlsxBuyerJson.includes(forbidden));
      }
      const blockedExcel=XLSX.read(storage.exportReportWorkbook(buyerBlocked),{type:'buffer'});
      assert.equal(blockedExcel.Sheets['Production Stages'].A2.v,buyerBlocked.productionStatus.labels.unknown);
      assert.equal(JSON.stringify(plan),original,'Projection/export cannot mutate saved plan.');
      const r06=reports.buildReportModel(plan,{...options,reportId:'R06'});
      assert(!r06.productionStatus,'R07 source must not leak into prior report.');
    }
    console.log('TNA R07 PASS: knit/denim four stages, dates as-of, recorded quantity, capacity-zero exclusion, lot conflicts, invalid quantity, EN/BN/HI/TA, buyer privacy, typed XLSX and source immutability.');
  }
}
TnaProductionReportProof.run();
