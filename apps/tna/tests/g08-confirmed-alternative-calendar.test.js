/**
 * F19 group 1: local source-confirmed alternative calendar is an immutable,
 * same-order candidate used for preview ONLY. Synthetic records prove weekend
 * differences, date comparability, stale/forged guards and saved state safety.
 * Run through Node 22 in the feature-branch CI, never customer data.
 */
'use strict';
const assert=require('node:assert/strict');
globalThis.VesaTnaScheduling=require('../src/scheduling.js');
globalThis.VesaTnaOperations=require('../src/operations.js');
const domain=require('../src/domain.js');
const scenarios=require('../src/scenarios.js');

class ConfirmedAlternateCalendarProof {
  /** New order requires real calendar input, not assumed weekdays or holidays. */
  static plan(templateId){
    return domain.createPlan({templateId,buyerName:'Synthetic Buyer',
      factoryName:'Synthetic Factory',styleNo:'SYN-'+templateId,
      poNumber:'F19-'+templateId,totalQty:1000,orderConfirmedOn:'2026-10-12',
      buyerRequiredExFactory:'2027-02-16'}, {ownerUserId:'synthetic-reviewer'});
  }
  /** A synthetic source reference is NOT an independently verified factory. */
  static input(values={}){
    return {name:'Synthetic alternative',workingWeek:[0,1,2,3,4,5],
      holidays:[],shutdowns:[],timezone:'Asia/Dhaka',
      sourceReference:'Synthetic reviewed workweek evidence',
      reason:'Record separate local what-if calendar',confirmed:true,...values};
  }
  static confirmDefault(plan){
    const result=domain.updateFactoryCalendar(plan,this.input({
      name:'Synthetic default',workingWeek:[1,2,3,4,5],
      holidays:['2026-10-20'],reason:'Confirm synthetic default'}),{
      actorId:'synthetic-reviewer'});
    assert.equal(result.ok,true,result.error);
    return result.plan;
  }
  /** Exercise user-local provenance, previews and forbidden release for 3 families. */
  static run(){
    for(const templateId of ['knit','woven','denim']){
      const fresh=this.plan(templateId),unconfirmed=JSON.stringify(fresh);
      assert.equal(domain.addConfirmedAlternativeCalendar(fresh,this.input()).ok,false);
      assert.equal(JSON.stringify(fresh),unconfirmed);
      const original=this.confirmDefault(fresh),before=JSON.stringify(original);
      for(const invalid of [
        {confirmed:false},{sourceReference:''},{workingWeek:[]},
        {workingWeek:[1,1]},{workingWeek:[7]},{holidays:['2026-02-30']},
        {holidays:['2026-10-20'],shutdowns:['2026-10-20']},
        {timezone:'Bogus/Invalid'},{reason:''}
      ]){
        const bad=domain.addConfirmedAlternativeCalendar(original,this.input(invalid));
        assert.equal(bad.ok,false,JSON.stringify(invalid));
        assert.equal(JSON.stringify(original),before);
      }
      const recorded=domain.addConfirmedAlternativeCalendar(original,this.input(),{
        actorId:'synthetic-reviewer'});
      assert.equal(recorded.ok,true,recorded.error);
      const withAlternative=recorded.plan,alt=recorded.calendar;
      assert.equal(alt.calendarKind,'confirmed-alternative');
      assert.equal(alt.orderRecordId,original.recordId);
      assert.equal(alt.basedOnCalendarRevision,original.calendars[0].revision);
      assert.equal(alt.approvalScope,'local-source-confirmation-only');
      assert.notEqual(alt.calendarId,'default');
      assert.deepEqual(withAlternative.calendars[0],original.calendars[0],
        'Never overwrite original calendar.');
      assert.deepEqual(withAlternative.tasks,original.tasks,'No task change until preview.');
      assert.deepEqual(withAlternative.baselineSnapshots,original.baselineSnapshots);
      assert.deepEqual(withAlternative.approvals,original.approvals);
      assert.equal(withAlternative.revision,original.revision+1);
      assert(withAlternative.revisionEvents.at(-1).eventType==='alternate-factory-calendar-recorded');
      const snapshot=JSON.stringify(withAlternative);
      const preview=scenarios.previewScenario(withAlternative,{
        name:'Reviewed synthetic alternate',confirmedAlternativeCalendarId:alt.calendarId});
      assert.equal(preview.ok,true);
      assert.equal(preview.branch.status,'preview',preview.violations.join('; '));
      assert.equal(preview.baseSchedule.status,'calculated');
      assert.equal(preview.scenarioSchedule.status,'calculated');
      assert.equal(preview.branch.calendarComparisonBasis,'civil-days-only');
      assert.equal(preview.branch.workingDaysGained,null,
        'Different workweeks cannot have comparable working-day savings.');
      assert(Number.isInteger(preview.branch.calendarDaysGained));
      assert(preview.previewPlan.tasks.every(t=>t.calendarId===alt.calendarId));
      assert.equal(JSON.stringify(withAlternative),snapshot,
        'A/B simulation cannot mutate saved source or baseline.');
      const blocked=scenarios.applyScenario(withAlternative,preview.branch,{
        confirm:true,reason:'Even explicit apply is blocked until UI/report proof'});
      assert.equal(blocked.ok,false);
      assert(blocked.error.includes('preview-only'));
      const forged=scenarios.previewScenario(withAlternative,{
        confirmedAlternativeCalendarId:'alt-calendar-not-reviewed'});
      assert.equal(forged.branch.status,'needs-review');
      assert.equal(forged.branch.scenarioForecastDate,null);
      const raw=scenarios.previewScenario(withAlternative,{
        confirmedAlternativeCalendarId:alt.calendarId,
        calendarChanges:[{calendarId:'default',holidays:['2027-02-15']}]});
      assert.equal(raw.branch.status,'needs-review');
      assert.equal(raw.branch.workingDaysGained,null);
      assert.equal(raw.scenarioSchedule.status,'needs-information');
      const stale=domain.updateFactoryCalendar(withAlternative,this.input({
        workingWeek:[1,2,3,4,5],reason:'Change source default calendar'}),{
        actorId:'synthetic-reviewer'});
      assert.equal(stale.ok,true,stale.error);
      assert.equal(scenarios.previewScenario(stale.plan,{
        confirmedAlternativeCalendarId:alt.calendarId}).branch.status,'needs-review',
        'New default calendar revision invalidates previous alternative.');
      const wrong=structuredClone(withAlternative);
      wrong.calendars[1].orderRecordId='different-private-order';
      assert.equal(scenarios.previewScenario(wrong,{
        confirmedAlternativeCalendarId:alt.calendarId}).branch.status,'needs-review');
      const notConfirmed=structuredClone(withAlternative);
      notConfirmed.calendars[1].source='user-not-configured';
      assert.equal(scenarios.previewScenario(notConfirmed,{
        confirmedAlternativeCalendarId:alt.calendarId}).branch.status,'needs-review');
      const otherRequired=structuredClone(withAlternative);
      otherRequired.calendars[1].holidays=['2027-02-16'];
      assert.equal(scenarios.previewScenario(otherRequired,{
        confirmedAlternativeCalendarId:alt.calendarId}).branch.status,'needs-review',
        'An alternative with nonworking buyer-required date must fail closed.');
      const spoofRoute=scenarios.previewScenario(withAlternative,{
        routeChanges:[{taskId:withAlternative.tasks[0].taskId,calendarId:alt.calendarId}]});
      assert.equal(spoofRoute.branch.status,'needs-review',
        'Calendar selection cannot bypass source/binding checks via route form.');
      const equal=domain.addConfirmedAlternativeCalendar(original,this.input({
        workingWeek:[1,2,3,4,5],holidays:['2026-10-20']}),{
        actorId:'synthetic-reviewer'});
      assert.equal(equal.ok,true,equal.error);
      const equalPreview=scenarios.previewScenario(equal.plan,{
        confirmedAlternativeCalendarId:equal.calendar.calendarId});
      assert.equal(equalPreview.branch.status,'preview',equalPreview.violations.join('; '));
      assert.equal(equalPreview.branch.calendarComparisonBasis,'same-confirmed-calendar');
      assert.equal(equalPreview.branch.calendarDaysGained,0);
      assert.equal(equalPreview.branch.workingDaysGained,0);
      assert.equal(JSON.stringify(original),before);
      assert.equal(JSON.stringify(withAlternative),snapshot);
    }
    console.log('TNA F19 GROUP 1 PASS: knit/woven/denim distinct confirmed alternative, local revision/provenance, civil-day only cross-basis, forged/stale/raw blocked, immutable source and apply held.');
  }
}
ConfirmedAlternateCalendarProof.run();
