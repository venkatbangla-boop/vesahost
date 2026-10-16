/**
 * G08 direct scenario safety: unverified alternative holidays must not cause
 * an endless civil-date comparison, an approved recovery, or a source write.
 * Uses only synthetic local factory plans and existing domain confirmation.
 */
'use strict';
const assert=require('node:assert/strict');
globalThis.VesaTnaScheduling=require('../src/scheduling.js');
globalThis.VesaTnaOperations=require('../src/operations.js');
const domain=require('../src/domain.js');
const scenarios=require('../src/scenarios.js');

class ScenarioCalendarSafetyProof {
  /** Create a draft with deliberately UNCONFIRMED factory working days. */
  static fixture(templateId){
    return domain.createPlan({templateId,buyerName:'Synthetic Buyer',
      factoryName:'Synthetic Factory',styleNo:'SYN-'+templateId,
      poNumber:'PO-'+templateId,totalQty:1000,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-15'
    },{ownerUserId:'synthetic-calendar-reviewer'});
  }
  /** Standard existing source-confirmation owner, not a new calendar rule. */
  static confirm(plan){
    const r=domain.updateFactoryCalendar(plan,{name:'Synthetic factory',
      workingWeek:[1,2,3,4,5],holidays:['2026-10-20'],shutdowns:[],
      timezone:'Asia/Dhaka',sourceReference:'Synthetic calendar proof',
      reason:'Factory calendar test fixture',confirmed:true},
    {actorId:'synthetic-calendar-reviewer'});
    assert.equal(r.ok,true,r.error);
    return r.plan;
  }
  static run(){
    for(const templateId of ['knit','woven','denim']){
      const plan=this.fixture(templateId);
      const task=plan.tasks.find(t=>Number(t.durationUnits)>2);
      assert(task);
      const source=JSON.stringify(plan);
      const change={durationAdjustments:[
        {taskId:task.taskId,durationUnits:task.durationUnits-1}]};
      const unconfirmed=scenarios.previewScenario(plan,change);
      assert.equal(unconfirmed.ok,true);
      assert.equal(unconfirmed.baseSchedule.status,'needs-information');
      assert.equal(unconfirmed.scenarioSchedule.status,'needs-information');
      assert.equal(unconfirmed.branch.workingDaysGained,null);
      assert.equal(unconfirmed.branch.scenarioForecastDate,null);
      assert.equal(JSON.stringify(plan),source);
      const durationRevision=scenarios.applyScenario(plan,unconfirmed.branch,{
        confirm:true,reason:'Local duration only, not buyer approval',
        actorId:'synthetic-calendar-reviewer'});
      assert.equal(durationRevision.ok,true,
        'Explicit local duration edits remain possible without claiming forecast.');
      assert.equal(durationRevision.plan.revision,plan.revision+1);
      assert.equal(JSON.stringify(plan),source);
      const accepted=this.confirm(plan),acceptedJson=JSON.stringify(accepted);
      const normal=scenarios.previewScenario(accepted,change);
      assert.equal(normal.ok,true);
      assert.equal(normal.baseSchedule.status,'calculated');
      assert.equal(normal.scenarioSchedule.status,'calculated');
      assert.equal(typeof normal.branch.workingDaysGained,'number');
      const alternate=scenarios.previewScenario(accepted,{
        calendarChanges:[{calendarId:'default',holidays:['2026-12-15']}]});
      assert.equal(alternate.ok,true);
      assert.equal(alternate.branch.status,'needs-review');
      assert(alternate.branch.violations.some(x=>x.includes('Factory Working Calendar')));
      assert.equal(alternate.branch.scenarioForecastDate,null);
      assert.equal(alternate.branch.workingDaysGained,null);
      assert.deepEqual(alternate.previewPlan.calendars,accepted.calendars,
        'Preview must not make proposed holidays effective.');
      assert.deepEqual(alternate.branch.changes.calendarChanges[0].holidays,
        ['2026-12-15'],'Source proposal is retained for manual review.');
      assert.equal(scenarios.applyScenario(accepted,alternate.branch,{
        confirm:true,reason:'Unconfirmed holiday cannot be accepted'}).ok,false);
      const forged={...alternate.branch,status:'preview',violations:[]};
      assert.equal(scenarios.applyScenario(accepted,forged,{
        confirm:true,reason:'Forged preview'}).ok,false);
      assert.equal(scenarios.applyScenario(accepted,{
        ...normal.branch,baseRecordId:'PRIVATE-OTHER-ORDER'},{
        confirm:true,reason:'Wrong order'}).ok,false);
      const malformed=scenarios.previewScenario(accepted,{calendarChanges:'text'});
      assert.equal(malformed.ok,true);
      assert.equal(malformed.branch.status,'needs-review');
      assert.equal(malformed.branch.workingDaysGained,null);
      const wrongWeek=scenarios.previewScenario(accepted,{
        calendarChanges:[{calendarId:'default',workingWeek:[],
          holidays:['2026-02-30']}]});
      assert.equal(wrongWeek.ok,true);
      assert.equal(wrongWeek.branch.status,'needs-review');
      assert.deepEqual(wrongWeek.previewPlan.calendars,accepted.calendars);
      const impossible=structuredClone(accepted);
      impossible.calendars[0].workingWeek=[];
      assert.equal(scenarios.previewScenario(impossible,change).baseSchedule.status,
        'needs-information');
      const invalidHoliday=structuredClone(accepted);
      invalidHoliday.calendars[0].holidays=['2026-02-30'];
      assert.equal(scenarios.previewScenario(invalidHoliday,change).baseSchedule.status,
        'needs-information');
      const badRate=scenarios.previewScenario(accepted,{
        ...change,capacity:{plannedQty:1000,verifiedDailyOutput:-1}});
      assert.equal(badRate.branch.status,'needs-review');
      assert.equal(scenarios.applyScenario(accepted,badRate.branch,{
        confirm:true,reason:'Unreviewed rate'}).ok,false);
      assert.equal(JSON.stringify(accepted),acceptedJson);
    }
    console.log('TNA G08 SCENARIO CALENDAR PASS: knit/woven/denim no guessed default factory dates, user-confirmed duration CPM retained, alternate/malformed calendar proposals and spoofed release withheld, source & baseline untouched.');
  }
}
ScenarioCalendarSafetyProof.run();
