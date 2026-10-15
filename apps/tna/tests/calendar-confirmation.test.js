/**
 * Calendar 360 TNA domain proof: factory working days are entered facts, never
 * default business assumptions. Run on Node before any Chromium/GitHub release.
 * Owns only fake localStorage + synthetic records; no actual buyer information.
 */
'use strict';
const assert=require('node:assert/strict');
globalThis.localStorage={
  data:new Map(),
  getItem(key){return this.data.get(key)??null;},
  setItem(key,value){this.data.set(key,String(value));},
  removeItem(key){this.data.delete(key);}
};
const domain=require('../src/domain.js');
globalThis.VesaTnaDomain=domain;
const storage=require('../src/storage.js');
const scheduling=require('../src/scheduling.js');

class TnaFactoryCalendarProof {
  /** Stable, complete test draft (no assumed factory calendar). */
  static plan(){
    return domain.createPlan({
      templateId:'knit',buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'SYN-CAL',poNumber:'SYN-CAL-PO',totalQty:900,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-15'
    },{ownerUserId:'qa-calendar'});
  }
  /** A source statement for the test only, not evidence of an actual factory. */
  static entry(overrides={}){
    return {name:'Synthetic factory work schedule',timezone:'Asia/Dhaka',
      workingWeek:[0,1,2,3,4,5],
      holidays:['2026-10-21','2028-02-29'],
      shutdowns:['2026-10-22'],
      sourceReference:'Synthetic document REV A (testing only)',
      reason:'Weekly schedule received from synthetic factory',confirmed:true,...overrides};
  }
  /** Verify immutable domain transitions, strict ISO calendars and portable copies. */
  static run(){
    const draft=this.plan();
    assert.equal(draft.calendars[0].source,'user-not-configured');
    assert.equal(draft.calendars[0].workingWeek,undefined,'Do not invent a Monday-Friday calendar when creating an order.');
    const baseline=domain.freezeBaseline(draft,{actorId:'qa-calendar',reason:'Synthetic baseline'});
    assert.equal(baseline.ok,true);
    const source=baseline.plan,sourceCopy=JSON.stringify(source),frozen=JSON.stringify(source.baselineSnapshots);
    const first=domain.updateFactoryCalendar(source,this.entry(),{actorId:'qa-calendar'});
    assert.equal(first.ok,true,'A reviewed calendar with explicit weekdays/zone/source should be accepted.');
    assert.equal(JSON.stringify(source),sourceCopy,'Calendar save must not mutate input.');
    assert.equal(JSON.stringify(first.plan.baselineSnapshots),frozen,'Baseline snapshots may not change.');
    assert.deepEqual(first.plan.approvals,source.approvals,'No buyer approvals may be manufactured.');
    assert.deepEqual(first.plan.tasks,source.tasks,'Calendar save must not alter task dates or statuses.');
    const calendar=first.plan.calendars[0];
    assert.equal(calendar.source,'user-confirmed');
    assert.equal(calendar.sourceReference,'Synthetic document REV A (testing only)');
    assert.equal(calendar.timezone,'Asia/Dhaka');
    assert.deepEqual(calendar.workingWeek,[0,1,2,3,4,5]);
    assert.deepEqual(calendar.weekendDays,[6]);
    assert.deepEqual(calendar.holidays,['2026-10-21','2028-02-29']);
    assert.deepEqual(calendar.shutdowns,['2026-10-22']);
    assert.equal(calendar.revision,1);
    assert.equal(calendar.confirmedBy,'qa-calendar');
    assert(first.plan.revisionEvents.at(-1).eventType==='factory-calendar-confirmed');
    assert(first.plan.auditEvents.at(-1).eventType==='factory-calendar-confirmed');
    const finish=scheduling.finishFromStart('2026-10-19',4,calendar,'working');
    assert.equal(finish,'2026-10-25','Working-day schedule must skip entered holiday, shutdown and Saturday.');
    for(const bad of [
      {confirmed:false},{workingWeek:[]},{workingWeek:[1,1]},{workingWeek:[7]},
      {timezone:'Invalid/Zone'},{sourceReference:''},{reason:''},{name:''},
      {holidays:['2026-02-30']},{holidays:['2026-10-21','2026-10-21']},
      {shutdowns:['2026-10-21']},{holidays:[] ,shutdowns:['bogus']},
      {workingWeek:'Monday-Friday'}, {holidays:'2026-10-21'}
    ]){
      const before=JSON.stringify(first.plan);
      const rejected=domain.updateFactoryCalendar(first.plan,this.entry(bad));
      assert.equal(rejected.ok,false,'Bad factory weekday/date/source should fail closed: '+JSON.stringify(bad));
      assert.equal(JSON.stringify(first.plan),before,'Rejected calendar edit must not mutate the source.');
    }
    const revision=domain.updateFactoryCalendar(first.plan,this.entry({
      workingWeek:[1,2,3,4,5],holidays:[],shutdowns:[],
      sourceReference:'Synthetic updated REV B',reason:'Factory corrected working days'
    }),{actorId:'qa-calendar'});
    assert.equal(revision.ok,true,'Changing an entered calendar must be possible with revision proof.');
    assert.equal(revision.plan.calendars[0].revision,2);
    assert.deepEqual(revision.plan.calendars[0].weekendDays,[0,6]);
    assert.equal(revision.plan.calendars[0].sourceReference,'Synthetic updated REV B');
    assert.equal(JSON.stringify(revision.plan.baselineSnapshots),frozen);
    const actor='qa-calendar';
    storage.savePlan(first.plan,actor);
    storage.autosave(first.plan,actor);
    const restored=storage.loadPlan(first.plan.recordId,actor);
    assert.deepEqual(restored.calendars[0],calendar,'Named saved records must retain the exact recorded calendar.');
    assert.deepEqual(storage.recoverAutosave(actor).plan.calendars[0],calendar,'Autosave must retain holiday details.');
    const portable=storage.importCopy(storage.exportCopy(first.plan));
    assert.deepEqual(portable.calendars[0],calendar,'Existing portable saved-copy format must retain calendar and source.');
    assert.equal(portable.schemaVersion,domain.SCHEMA_VERSION,'No schema migration may be invented.');
    assert.equal(JSON.stringify(portable.baselineSnapshots),frozen);
    const woven=domain.createPlan({
      templateId:'woven',buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'SYN-WOVEN',poNumber:'SYN-WOVEN-PO',totalQty:200,buyerRequiredExFactory:'2026-12-15'
    },{ownerUserId:actor});
    const wovenResult=domain.updateFactoryCalendar(woven,this.entry(),{actorId:actor});
    assert.equal(wovenResult.ok,true,'Calendar editing must work in both knit and woven templates.');
    assert.equal(woven.calendars[0].source,'user-not-configured','Other saved plans may not receive a shared calendar by accident.');
    console.log('TNA factory calendar proof PASS: validation, weekdays, holidays, shutdowns, history, baseline, knit/woven and saved copies.');
  }
}
TnaFactoryCalendarProof.run();
