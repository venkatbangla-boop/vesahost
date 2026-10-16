/**
 * F19 alternative calendar: same-order local preview, save/reopen, R12 A/B,
 * typed civil-day Excel and explicit apply. Synthetic records only.
 */
'use strict';
const assert=require('node:assert/strict');
globalThis.localStorage={data:new Map(),getItem(k){return this.data.get(k)??null;},setItem(k,v){this.data.set(k,String(v));},removeItem(k){this.data.delete(k);}};
const domain=require('../src/domain.js');globalThis.VesaTnaDomain=domain;
const scheduling=require('../src/scheduling.js');globalThis.VesaTnaScheduling=scheduling;
globalThis.VesaTnaOperations=require('../src/operations.js');
const scenarios=require('../src/scenarios.js');globalThis.VesaTnaScenarios=scenarios;
const storage=require('../src/storage.js'),reports=require('../src/reports.js'),XLSX=require('../vendor/xlsx.full.min.js');
class F19ComparisonAcceptance {
  static entry(week=[1,2,3,4,5],source='SYN-REVIEWED',override={}){
    return {name:'Synthetic factory '+source,workingWeek:week,holidays:[],shutdowns:[],
      timezone:'Asia/Dhaka',sourceReference:source,reason:'Synthetic source comparison',
      confirmed:true,...override};
  }
  static run(){
    for(const family of ['knit','woven','denim']){
      let plan=domain.createPlan({templateId:family,buyerName:'SYNTHETIC BUYER',
        factoryName:'SYNTHETIC FACTORY',styleNo:'STYLE-F19',poNumber:'PO-F19',
        totalQty:1000,orderConfirmedOn:'2026-10-12',
        buyerRequiredExFactory:'2027-02-16'}, {ownerUserId:'f19-qa'});
      const defaultCalendar=domain.updateFactoryCalendar(plan,this.entry([1,2,3,4,5],
        'F19-BASE',{holidays:['2026-10-20']}),{actorId:'f19-qa'});
      assert.equal(defaultCalendar.ok,true,defaultCalendar.error);plan=defaultCalendar.plan;
      const frozen=domain.freezeBaseline(plan,{actorId:'f19-qa',reason:'Synthetic baseline'});
      assert.equal(frozen.ok,true,frozen.error);plan=frozen.plan;
      const initial=JSON.stringify(plan),baseline=JSON.stringify(plan.baselineSnapshots);
      const alternative=domain.addConfirmedAlternativeCalendar(plan,
        this.entry([0,1,2,3,4,5],'F19-ALTERNATIVE'),{actorId:'f19-qa'});
      assert.equal(alternative.ok,true,alternative.error);plan=alternative.plan;
      const altId=alternative.calendar.calendarId;
      const before=JSON.stringify(plan);
      const preview=scenarios.previewScenario(plan,{
        name:'F19 synthetic changed working week',confirmedAlternativeCalendarId:altId});
      assert.equal(preview.branch.status,'preview',preview.violations.join('; '));
      assert.equal(preview.baseSchedule.status,'calculated');
      assert.equal(preview.scenarioSchedule.status,'calculated');
      assert.equal(preview.branch.workingDaysGained,null);
      assert(Number.isInteger(preview.branch.calendarDaysGained));
      assert.equal(JSON.stringify(plan),before);
      const saved=scenarios.saveScenarioPreview(plan,preview.branch,{actorId:'f19-qa'});
      assert.equal(saved.ok,true,saved.error);
      assert.equal(saved.plan.revision,plan.revision);
      assert.equal(JSON.stringify(saved.plan.baselineSnapshots),baseline);
      assert.deepEqual(saved.plan.tasks,plan.tasks);
      storage.savePlan(saved.plan,'f19-qa');
      const reopened=storage.loadPlan(plan.recordId,'f19-qa');
      assert.equal(reopened.scenarioBranches.length,1);
      assert.equal(reopened.calendars.length,2);
      const portable=storage.importCopy(storage.exportCopy(reopened));
      assert.deepEqual(portable.scenarioBranches,reopened.scenarioBranches);
      assert.deepEqual(portable.calendars,reopened.calendars);
      for(const language of ['en','bn','hi','ta']){
        const model=reports.buildReportModel(reopened,{
          reportId:'R12',language,timezone:'Asia/Dhaka',
          asOfDate:'2026-10-16',generatedAt:'2026-10-16T08:00:00Z',
          scenarioSelections:{A:preview.branch.scenarioId,B:''}});
        const r=model.scenarioComparison,selected=r.options[0];
        assert.equal(selected.status,'calculated-local',language+': '+selected.reason);
        assert.equal(selected.optionForecast,preview.branch.scenarioForecastDate);
        assert.equal(selected.baseForecast,preview.branch.baseForecastDate);
        assert.equal(selected.workdaysGained,null);
        assert.equal(selected.calendarDaysGained,preview.branch.calendarDaysGained);
        assert.equal(selected.calendarComparisonBasis,r.labels.crossBasis);
        assert.equal(selected.inputs.length,1);
        assert.equal(selected.inputs[0].kind,r.labels.fields.calendar);
        assert.equal(r.buyerAgreementVerified,false);
        assert.equal(r.costImpact,null);
        assert.equal(r.capacityFeasibilityVerified,false);
        const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true,cellFormula:true});
        assert.equal(workbook.Sheets['Scenario Comparison'].C18.t,'n',
          language+': civil days should remain a typed number (even zero).');
        assert.equal(workbook.Sheets['Scenario Comparison'].C18.v,preview.branch.calendarDaysGained);
        assert.equal(workbook.Sheets['Scenario Comparison'].C9.t,'s',
          language+': cross-calendar workday gain must remain text Needs Information.');
        assert.equal(workbook.Sheets['Scenario Comparison'].C19.v,r.labels.crossBasis);
        assert.equal(model.scenarioComparison.options.length,1);
        const restricted=reports.buildReportModel(reopened,{
          reportId:'R12',language,timezone:'Asia/Dhaka',
          asOfDate:'2026-10-16',audienceMode:'buyer',
          scenarioSelections:{A:preview.branch.scenarioId}});
        assert.deepEqual(restricted.scenarioComparison.options,[]);
      }
      const applied=scenarios.applyScenario(reopened,preview.branch,{
        confirm:true,reason:'Synthetic local planning review, not Buyer agreement',
        actorId:'f19-qa'});
      assert.equal(applied.ok,true,applied.error);
      assert.equal(applied.plan.revision,reopened.revision+1);
      assert.equal(applied.plan.scenarioBranches.length,1);
      assert(applied.plan.tasks.every(task=>task.calendarId===altId));
      assert.equal(JSON.stringify(applied.plan.baselineSnapshots),baseline);
      assert.deepEqual(applied.plan.approvals,reopened.approvals);
      assert.deepEqual(applied.plan.calendars,reopened.calendars);
      storage.savePlan(applied.plan,'f19-qa');
      const afterReload=storage.loadPlan(applied.plan.recordId,'f19-qa');
      assert.equal(afterReload.scenarioBranches[0].status,'applied');
      assert(afterReload.tasks.every(task=>task.calendarId===altId));
      assert.equal(afterReload.revisionEvents.at(-1).details.confirmedAlternativeCalendarId,altId);
      assert.equal(JSON.stringify(plan),before);
      assert.notEqual(initial,before);
    }
    console.log('F19 R12 LOCAL PASS: knit/woven/denim provenance, save/reopen/portable, four-language A/B, typed calendar days, unverifiable workday gain withheld, local revision and immutable baselines.');
  }
}
F19ComparisonAcceptance.run();
