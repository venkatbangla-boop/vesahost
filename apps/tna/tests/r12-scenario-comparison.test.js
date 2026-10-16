/**
 * R12 Scenario Comparison: locally entered A/B options, valid current-revision
 * CPM, historically applied branches, capacity/calendars fail closed, four
 * languages, typed Excel, external privacy and immutable saved plans.
 * Synthetic data ONLY. Run: node apps/tna/tests/r12-scenario-comparison.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
globalThis.VesaTnaDomain=domain;
const scheduling=require('../src/scheduling.js');
globalThis.VesaTnaScheduling=scheduling;
const scenarios=require('../src/scenarios.js');
globalThis.VesaTnaScenarios=scenarios;
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaScenarioComparisonProof {
  /** A tiny real task graph with two competing paths and a confirmed calendar. */
  static plan(templateId){
    let p=domain.createPlan({templateId,buyerName:'SYNTHETIC BUYER',
      factoryName:'PRIVATE FACTORY R12',styleNo:'R12-STYLE',poNumber:'R12-PO',
      totalQty:900,orderConfirmedOn:'2026-10-12',
      buyerRequiredExFactory:'2026-10-30'}, {ownerUserId:'r12-synthetic'});
    p.tasks=p.tasks.slice(0,4);
    for(const [i,t] of p.tasks.entries()){
      t.durationUnits=[2,3,2,1][i];t.durationBasis='working';
    }
    const [a,b,c,d]=p.tasks;
    p.edges=[[a,b],[a,c],[b,d],[c,d]].map(([from,to],i)=>({
      edgeId:'R12-'+i,predecessorTaskId:from.taskId,successorTaskId:to.taskId,
      relation:'FS',lagUnits:0,lagBasis:'working',calendarPolicy:'successor'}));
    const confirmed=domain.updateFactoryCalendar(p,{
      name:'Synthetic weekday factory',workingWeek:[1,2,3,4,5],
      holidays:['2026-10-15'],shutdowns:[],timezone:'Asia/Dhaka',
      sourceReference:'Locally confirmed synthetic calendar',
      confirmed:true,reason:'Synthetic scenario proof'
    },{actorId:'r12-synthetic'});
    assert.equal(confirmed.ok,true);
    p=confirmed.plan;
    const frozen=domain.freezeBaseline(p,{actorId:'r12-synthetic',
      reason:'Synthetic initial commitment'});
    assert.equal(frozen.ok,true);
    p=frozen.plan;
    p.commitments.buyerRequiredExFactory='2026-11-02';
    return p;
  }
  static options(extra={}){
    return {reportId:'R12',language:'en',timezone:'Asia/Dhaka',
      asOfDate:'2026-10-16',generatedAt:'2026-10-16T05:00:00Z',...extra};
  }
  /** Source true working-day diffs are recalculated by unchanged R04 engine. */
  static run(){
    for(const templateId of ['knit','woven','denim']){
      const plan=this.plan(templateId),before=JSON.stringify(plan);
      const one=plan.tasks[1],two=plan.tasks[2];
      const drafts={A:{taskId:one.taskId,durationUnits:'1'},
        B:{taskId:two.taskId,durationUnits:'6'}};
      const selected={A:'draft',B:'draft'};
      const model=reports.buildReportModel(plan,
        this.options({scenarioSelections:selected,scenarioDrafts:drafts}));
      const r=model.scenarioComparison;
      assert.equal(r.schema,'VESA-TNA-SCENARIO-COMPARISON-1');
      assert.equal(r.validity,'valid');
      assert.equal(r.base.validity,'valid');
      assert.equal(r.originalRequired,'2026-10-30');
      assert.equal(r.currentRequired,'2026-11-02');
      assert.equal(r.options.length,2);
      assert(r.options.every(o=>o.status==='calculated-local'),
        'Strict source-backed CPM must verify both locally proposed options.');
      assert(r.options.every(o=>o.buyerAgreementVerified===false));
      assert.equal(r.buyerAgreementVerified,false);
      assert.equal(r.capacityFeasibilityVerified,false);
      assert.equal(r.costImpact,null);
      assert.equal(r.options[0].inputs[0].before,3);
      assert.equal(r.options[0].inputs[0].after,1);
      assert.equal(r.options[1].inputs[0].before,2);
      assert.equal(r.options[1].inputs[0].after,6);
      assert.equal(r.options[0].baseForecast,r.base.forecastDate);
      assert.equal(r.options[1].baseForecast,r.base.forecastDate);
      assert(r.options.every(o=>typeof o.optionForecast==='string'));
      assert(r.options.every(o=>typeof o.workdaysGained==='number'));
      assert(r.options[0].workdaysGained>=0,'Shorter path cannot create negative improvement.');
      assert(r.options[1].workdaysGained<=0,'Longer competing path cannot improve finish.');
      const independentPreview=scenarios.previewScenario(plan,{
        durationAdjustments:[{taskId:two.taskId,durationUnits:6}]});
      assert.equal(independentPreview.ok,true);
      const baseCpm=reports.buildReportModel(plan,{reportId:'R04'}).criticalPath;
      const candidateCpm=reports.buildReportModel(independentPreview.previewPlan,
        {reportId:'R04'}).criticalPath;
      const beforeCritical=new Set(baseCpm.rows.filter(row=>row.isCritical).map(row=>row.ref));
      const afterCritical=new Set(candidateCpm.rows.filter(row=>row.isCritical).map(row=>row.ref));
      const expectedChange=[...new Set([...beforeCritical,...afterCritical])]
        .filter(ref=>beforeCritical.has(ref)!==afterCritical.has(ref));
      assert.deepEqual(r.options[1].changedCriticalRefs,expectedChange,
        'Changed critical path must match independent strict R04 computation; a different duration does not guarantee a different controlling task.');
      assert.equal(r.changes.length,2);
      assert(!JSON.stringify(model).includes('PRIVATE-PRICE'),
        'No rate or cost savings invented.');
      for(const language of ['en','bn','hi','ta']){
        const translated=reports.buildReportModel(plan,
          this.options({language,scenarioSelections:selected,scenarioDrafts:drafts}))
          .scenarioComparison;
        assert.equal(translated.options.length,2);
        assert.equal(translated.options[0].workdaysGained,r.options[0].workdaysGained);
        assert.equal(translated.options[1].optionForecast,r.options[1].optionForecast);
        assert.equal(translated.labels.headers.length,4);
        assert.equal(translated.labels.changes.length,5);
        assert.equal(translated.labels.warnings.length,3);
        assert(translated.labels.noGain&&translated.labels.restricted);
      }
      const noInput=reports.buildReportModel(plan,this.options()).scenarioComparison;
      assert.equal(noInput.validity,'valid');
      assert.deepEqual(noInput.options,[]);
      assert(noInput.warnings.includes(noInput.labels.noScenario));
      const unconfirmed=domain.createPlan({templateId,
        buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',styleNo:'SYN-UNCONFIRMED',
        poNumber:'PO-U',totalQty:99,orderConfirmedOn:'2026-10-12',
        buyerRequiredExFactory:'2026-10-20'},
      {ownerUserId:'unconfirmed-local'});
      const invalidDraft=reports.buildReportModel(unconfirmed,
        this.options({scenarioSelections:{A:'draft',B:''},
          scenarioDrafts:{A:{taskId:unconfirmed.tasks[1].taskId,durationUnits:'1'}}})).scenarioComparison;
      assert.equal(invalidDraft.base.validity,'incomplete');
      assert.equal(invalidDraft.options[0].optionForecast,null);
      assert.equal(invalidDraft.options[0].workdaysGained,null);
      assert.equal(invalidDraft.options[0].status,'incomplete');
      const zeroDuration=reports.buildReportModel(plan,
        this.options({scenarioSelections:{A:'draft',B:''},
          scenarioDrafts:{A:{taskId:one.taskId,durationUnits:'0'}}})).scenarioComparison;
      assert.equal(zeroDuration.options[0].inputs[0].after,0,
        'Explicit zero duration must remain zero, not missing.');
      const blankDuration=reports.buildReportModel(plan,
        this.options({scenarioSelections:{A:'draft',B:''},
          scenarioDrafts:{A:{taskId:one.taskId,durationUnits:''}}})).scenarioComparison;
      assert.equal(blankDuration.options[0].status,'incomplete');
      assert.equal(blankDuration.options[0].workdaysGained,null);
      const badTime=reports.buildReportModel(plan,this.options({timezone:''})).scenarioComparison;
      assert.equal(badTime.validity,'incomplete');
      assert.deepEqual(badTime.options,[]);
      const invalidDate=reports.buildReportModel(plan,this.options({asOfDate:'2026-02-30'})).scenarioComparison;
      assert.equal(invalidDate.validity,'incomplete');
      assert.deepEqual(invalidDate.options,[]);
      // Do not execute unconfirmed holiday edits through the frozen planning
      // engine. R12 must reject this raw saved proposal before recomputation.
      const calendarDraft={scenarioId:'R12-CALENDAR',name:'Calendar proposal',
        status:'preview',baseRecordId:plan.recordId,baseRevision:plan.revision,
        changes:{calendarChanges:[{calendarId:'default',holidays:['2026-10-20']}]}};
      const withCalendar=structuredClone(plan);
      withCalendar.scenarioBranches=[calendarDraft];
      const calendarReport=reports.buildReportModel(withCalendar,this.options()).scenarioComparison;
      assert.equal(calendarReport.options[0].status,'calendar-unconfirmed');
      assert.equal(calendarReport.options[0].workdaysGained,null);
      assert.equal(calendarReport.options[0].optionForecast,null);
      const first=scenarios.previewScenario(plan,{
        scenarioId:'R12-A',name:'=HYPERLINK("preview")',
        durationAdjustments:[{taskId:one.taskId,durationUnits:1}]},
      {actorId:'synthetic',createdAt:'2026-10-14T05:00:00Z'});
      const second=scenarios.previewScenario(plan,{
        scenarioId:'R12-B',name:'Recovery B - extra duration',
        durationAdjustments:[{taskId:two.taskId,durationUnits:6}]},
      {actorId:'synthetic',createdAt:'2026-10-14T05:00:00Z'});
      assert(first.ok&&second.ok);
      const stored=structuredClone(plan);
      stored.scenarioBranches=[first.branch,second.branch];
      const storedReport=reports.buildReportModel(stored,this.options()).scenarioComparison;
      assert.equal(storedReport.options.length,2);
      assert.equal(storedReport.options[0].name,'=HYPERLINK("preview")');
      assert.equal(storedReport.options[0].status,'calculated-local');
      assert.equal(storedReport.options[1].status,'calculated-local');
      const stale=structuredClone(stored);
      stale.scenarioBranches[1].baseRevision=999;
      assert.equal(reports.buildReportModel(stale,this.options()).scenarioComparison.options[1].status,'stale');
      const mismatched=structuredClone(stored);
      mismatched.scenarioBranches[0].baseRecordId='PRIVATE OTHER RECORD';
      assert.equal(reports.buildReportModel(mismatched,this.options()).scenarioComparison.options[0].status,'stale');
      const duplicate=structuredClone(stored);
      duplicate.scenarioBranches[1].scenarioId=duplicate.scenarioBranches[0].scenarioId;
      const duplicateReport=reports.buildReportModel(duplicate,this.options()).scenarioComparison;
      assert(duplicateReport.options.every(o=>o.status!=='calculated-local'),
        'Duplicate branch IDs must never re-evaluate arbitrary candidate source.');
      const applied=scenarios.applyScenario(plan,first.branch,{
        confirm:true,reason:'Internal synthetic revision — not buyer agreed',
        actorId:'synthetic-planner',createdAt:'2026-10-15T08:00:00Z'});
      assert(applied.ok);
      assert.equal(applied.plan.revision,plan.revision+1);
      assert.equal(applied.plan.scenarioBranches.length,1);
      const historical=reports.buildReportModel(applied.plan,this.options()).scenarioComparison;
      assert.equal(historical.options[0].status,'historic-applied');
      assert.equal(historical.options[0].locallyApplied,true);
      assert.equal(historical.options[0].appliedRevision,applied.plan.revision);
      assert.equal(historical.options[0].optionForecast,null,
        'Historical option cannot be recomputed from current mutated base.');
      assert.equal(historical.options[0].workdaysGained,null);
      assert.equal(historical.options[0].recordedBaseForecast,first.branch.baseForecastDate);
      assert.equal(historical.options[0].recordedOptionForecast,first.branch.scenarioForecastDate);
      assert.equal(historical.options[0].buyerAgreementVerified,false);
      const withoutEvent=structuredClone(applied.plan);
      withoutEvent.revisionEvents=withoutEvent.revisionEvents.filter(x=>x.eventType!=='scenario-applied');
      const noLineage=reports.buildReportModel(withoutEvent,this.options()).scenarioComparison;
      assert.equal(noLineage.options[0].status,'historic-unverified');
      assert.equal(noLineage.options[0].locallyApplied,false);
      const buyer=reports.buildReportModel(stored,
        this.options({audienceMode:'buyer'}));
      const factory=reports.buildReportModel(stored,
        this.options({audienceMode:'factory'}));
      for(const blocked of [buyer,factory]){
        assert.equal(blocked.scenarioComparison.validity,'restricted');
        assert.deepEqual(blocked.scenarioComparison.options,[]);
        assert.deepEqual(blocked.scenarioComparison.changes,[]);
        assert.deepEqual(blocked.tasks,[]);
        assert.equal(blocked.source.recordId,null);
        const raw=JSON.stringify(blocked);
        for(const token of ['PRIVATE FACTORY R12','SYNTHETIC BUYER','R12-STYLE',
          '=HYPERLINK("preview")','R12-A','synthetic-planner'])
          assert(!raw.includes(token),'Blocked external model leaked '+token);
      }
      const wb=XLSX.read(storage.exportReportWorkbook(model),
        {type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(wb.SheetNames,['Report Summary','Order Summary','Report Activities',
        'Report Notes','Scenario Comparison','Scenario Inputs','Scenario Warnings']);
      const sheet=wb.Sheets['Scenario Comparison'];
      assert.equal(sheet.B3.t,'n','Locally frozen original is a typed date.');
      assert.equal(sheet.B4.t,'n','Current required is typed date.');
      assert.equal(sheet.B5.t,'n','Strict CPM base finish is typed date.');
      assert.equal(sheet.C5.t,'n');
      assert.equal(sheet.D5.t,'n');
      assert.equal(sheet.C7.t,'n');
      assert.equal(sheet.D7.t,'n');
      assert.equal(sheet.B3.z,'yyyy-mm-dd');
      assert.equal(wb.Sheets['Scenario Inputs'].C2.t,'n');
      assert.equal(wb.Sheets['Scenario Inputs'].D2.t,'n');
      assert.equal(wb.Sheets['Scenario Inputs'].D2.v,1);
      for(const tab of Object.values(wb.Sheets))
        assert(!Object.values(tab).some(c=>c?.f),'No report may execute Excel formulas.');
      const blockedWb=XLSX.read(storage.exportReportWorkbook(buyer),{type:'buffer'});
      assert(!JSON.stringify(blockedWb.Sheets).includes('PRIVATE FACTORY R12'));
      assert(!JSON.stringify(blockedWb.Sheets).includes('R12-A'));
      const previous=reports.buildReportModel(plan,{...this.options(),reportId:'R11'});
      assert(!previous.scenarioComparison,'Older R11 source/report schema unchanged.');
      assert.equal(JSON.stringify(plan),before,'Pure preview/reports/XLSX never mutate source TNA.');
    }
    console.log('TNA R12 PASS: knit/woven/denim current-revision A/B strict CPM, zero/blank, changed critical refs, locally applied history not replayed, stale/duplicate/calendar blocked, four languages, typed formula-inert Excel, restricted external models and source immutability.');
  }
}
TnaScenarioComparisonProof.run();
