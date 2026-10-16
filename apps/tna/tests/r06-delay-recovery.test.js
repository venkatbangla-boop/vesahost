/**
 * R06 management-only Delay & Recovery deterministic and Excel contract.
 * Run: node apps/tna/tests/r06-delay-recovery.test.js
 * All fixture data are synthetic; no browser records, buyer decisions or prices.
 */
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaDelayRecoveryProof {
  /** Confirm an immutable baseline, then add independently synthetic updates. */
  static fixture(templateId){
    const p=domain.createPlan({
      templateId,buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'R06-TEST',poNumber:'SYN-PO-R06',totalQty:900,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-11-30'
    },{ownerUserId:'r06-proof'});
    assert(p.tasks.length>15);
    p.tasks[0].dates.currentTargetFinish='2026-10-10';
    p.tasks[1].dates.currentTargetFinish='2026-10-12';
    p.tasks[3].dates.currentTargetFinish='2026-10-13';
    const confirmed=domain.freezeBaseline(p,{actorId:'r06-proof',reason:'Synthetic confirmed baseline'});
    assert.equal(confirmed.ok,true);
    const plan=confirmed.plan,t=plan.tasks;
    t[0].dates.currentTargetFinish='2026-10-12';
    t[0].dates.forecastFinish='2026-10-16';
    t[0].status='in-progress';
    t[0].delayReason='  =SUM(1,2)';
    t[0].title='  =SUM(4,5)';
    t[0].recoveryAction='  +PRIVATE_PROPOSAL';
    t[1].status='completed';
    t[1].dates.actualFinish='2026-10-14';
    t[1].dates.forecastFinish='2026-10-20';
    t[3].status='completed';
    t[3].dates.actualFinish='2026-10-20';
    t[4].dates.currentTargetFinish='2026-02-30'; // Invalid, never invent an alternative.
    plan.scenarioBranches=[
      {scenarioId:'A',name:'  =PRIVATE_OPTION',status:'applied',baseRecordId:plan.recordId,baseForecastDate:'2026-11-01',
        scenarioForecastDate:'2026-10-30',workingDaysGained:2},
      {scenarioId:'B',name:'No audit event',status:'applied',baseRecordId:plan.recordId,baseForecastDate:'2026-11-01',scenarioForecastDate:'2026-10-31'},
      {scenarioId:'C',name:'Pending preview',status:'preview',baseRecordId:plan.recordId}
    ];
    plan.revisionEvents.push({eventId:'synthetic-applied',eventType:'scenario-applied',details:{scenarioId:'A'}});
    plan.order.commercialNotes='PRIVATE_FOB_MUST_NOT_BE_PROMOTED_TO_APPROVAL';
    return plan;
  }
  /** Assert time-gated source dates and actual Excel cell types, not mock workbook data. */
  static run(){
    for(const templateId of ['knit','denim']){
      const plan=this.fixture(templateId),before=JSON.stringify(plan);
      const opts={reportId:'R06',generatedAt:'2026-10-16T04:00:00.000Z',
        timezone:'Asia/Dhaka',asOfDate:'2026-10-16',language:'en'};
      const model=reports.buildReportModel(plan,opts),d=model.delayRecovery;
      assert.equal(model.reportId,'R06');
      assert.equal(d.schema,'VESA-TNA-DELAY-1');
      assert.equal(d.validity,'valid');
      assert.equal(d.audience,'local-management-review');
      assert.equal(d.rows.length,plan.tasks.length);
      assert.equal(d.asOfDate,'2026-10-16');
      assert.deepEqual(d.verifiedExternalAgreements,[]);
      assert.equal(d.rows[0].original,'2026-10-10');
      assert.equal(d.rows[0].target,'2026-10-12');
      assert.equal(d.rows[0].forecast,'2026-10-16');
      assert.equal(d.rows[0].varianceDays,6);
      assert.equal(d.rows[0].comparedTo,d.labels.forecast);
      assert.equal(d.rows[0].enteredCause,'=SUM(1,2)');
      assert.equal(d.rows[0].waitingParty,null,'Owner cannot become waiting party.');
      assert(d.rows[0].possibleDownstreamRefs.includes(plan.tasks[1].templateRef));
      assert.equal(d.rows[0].agreementVerified,false);
      assert.equal(d.rows[1].varianceDays,2);
      assert.equal(d.rows[1].comparedTo,d.labels.actual);
      assert.equal(d.rows[3].actualAsOf,false,'A future actual cannot prove historic completion.');
      assert(d.rows[3].gaps.includes(d.labels.futureActual));
      assert.equal(d.rows[4].due,null,'Invalid current target must not fall back to invented due.');
      assert.equal(d.scenarios.length,3);
      assert.equal(d.scenarios[0].locallyApplied,true);
      assert.equal(d.scenarios[1].locallyApplied,false,'Branch flag without audit event is not applied.');
      assert.equal(d.scenarios[2].locallyApplied,false);
      assert(d.scenarios.every(row=>row.externalAgreement===null));
      assert.equal(d.counts.localScenarioApplications,1);
      for(const lang of ['en','bn','hi','ta']){
        const translated=reports.buildReportModel(plan,{...opts,language:lang});
        assert.equal(translated.delayRecovery.counts.positiveVariance,d.counts.positiveVariance);
        assert(translated.delayRecovery.labels.columns[0]);
        assert(translated.delayRecovery.labels.disclosure);
      }
      for(const bad of [{timezone:''},{timezone:'Invalid/Zone'},{asOfDate:'2026-02-30'},{generatedAt:'not-a-date',asOfDate:undefined}]){
        const failure=reports.buildReportModel(plan,{...opts,...bad}).delayRecovery;
        assert.equal(failure.validity,'incomplete');
        assert.equal(failure.rows.length,0);
      }
      const wb=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(wb.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Delay & Recovery','Recovery Options']);
      const sheet=wb.Sheets['Delay & Recovery'];
      const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false});
      assert.equal(rows.length,plan.tasks.length+1);
      assert.equal(sheet.E2.t,'n');
      assert.equal(sheet.D2.t,'n');
      assert.equal(sheet.F2.t,'n');
      assert.equal(sheet.H2.t,'n','Variance must be numeric in Excel.');
      assert.equal(sheet.H2.v,6);
      assert.equal(sheet.D2.z,'yyyy-mm-dd');
      assert(sheet.B2.v.startsWith("'"),'Formula-like task title must be escaped.');
      assert(sheet.K2.v.startsWith("'"),'Formula-like delay reason must be escaped.');
      assert(sheet.N2.v.startsWith("'"),'Formula-like recovery proposal must be escaped.');
      const scenarios=wb.Sheets['Recovery Options'];
      assert(scenarios.B2.v.includes('buyer/factory'),'Locally applied scenario cannot be claimed agreed.');
      assert(scenarios.A2.v.startsWith("'"),'Option title may not execute as Excel formula.');
      assert.equal(scenarios.C2.t,'n');
      assert.equal(scenarios.D2.t,'n');
      assert.equal(scenarios.E2.t,'n');
      for(const table of Object.values(wb.Sheets)){
        assert(!Object.values(table).some(cell=>cell?.f),'No spreadsheet formula may be inserted.');
      }
      assert.equal(JSON.stringify(plan),before,'Report + workbook must not mutate the order.');
      const buyer=reports.buildReportModel(plan,{...opts,reportId:'R02'});
      assert(!buyer.delayRecovery);
      assert(!JSON.stringify(buyer).includes('PRIVATE_PROPOSAL'));
      assert(!JSON.stringify(buyer).includes('PRIVATE_FOB_MUST_NOT_BE_PROMOTED_TO_APPROVAL'));
    }
    console.log('TNA R06 Delay & Recovery PASS: knit/woven immutable dates, timezones, causes, scenarios/audit lineage, no false agreement, EN/BN/HI/TA, typed safe Excel, buyer isolation.');
  }
}
TnaDelayRecoveryProof.run();
