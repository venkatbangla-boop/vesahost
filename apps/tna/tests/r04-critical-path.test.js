/**
 * R04 Critical Path verification against the existing scheduling/CPM engine.
 * Synthetic knit/woven fixtures only: no user order, buyer promise or backend.
 * Run: node apps/tna/tests/r04-critical-path.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const scheduling=require('../src/scheduling.js');
globalThis.VesaTnaScheduling=scheduling;
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaCriticalPathProof {
  /** Four real template tasks with one branch; only existing engine owns float math. */
  static fixture(templateId='knit'){
    const plan=domain.createPlan({
      templateId,buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'R04-'+templateId,poNumber:'SYN-CPM',totalQty:1000,
      orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2026-10-20'
    },{ownerUserId:'synthetic-cpm'});
    plan.tasks=plan.tasks.slice(0,4);
    for(const [i,task] of plan.tasks.entries()){
      task.durationUnits=[2,3,2,1][i];
      task.durationBasis='working';
    }
    const [a,b,c,d]=plan.tasks;
    plan.edges=[[a,b],[a,c],[b,d],[c,d]].map(([from,to],i)=>({
      edgeId:'CPM-'+i,predecessorTaskId:from.taskId,successorTaskId:to.taskId,
      relation:'FS',lagUnits:0,lagBasis:'working',calendarPolicy:'successor'
    }));
    return plan;
  }
  /** All scheduling claims require explicit local provenance, but not a third-party attestation. */
  static confirm(plan){
    return domain.updateFactoryCalendar(plan,{
      name:'Synthetic test factory',workingWeek:[1,2,3,4,5],holidays:['2026-10-15'],
      shutdowns:[],timezone:'Asia/Dhaka',sourceReference:'Synthetic factory calendar REV A',
      reason:'Fixture calendar intentionally provided',confirmed:true
    },{actorId:'synthetic-cpm'});
  }
  /** Assert complete engine parity and fail-closed missing calendar/date information. */
  static run(){
    for(const template of ['knit','woven']){
      const draft=this.fixture(template),original=JSON.stringify(draft);
      const unknown=reports.buildReportModel(draft,{reportId:'R04',language:'en'});
      assert.equal(unknown.criticalPath.validity,'incomplete');
      assert.equal(unknown.criticalPath.rows.length,0);
      assert(unknown.criticalPath.missingInputs.some(v=>v.includes('user-confirmed')||v.includes('User-confirmed')),'Default Mon–Fri calendar must never be accepted as factory-confirmed.');
      assert.equal(JSON.stringify(draft),original,'R04 must not mutate unconfirmed draft.');
      const confirmed=this.confirm(draft);
      assert.equal(confirmed.ok,true,'Reviewed synthetic calendar should validate.');
      const plan=confirmed.plan,source=JSON.stringify(plan);
      const model=reports.buildReportModel(plan,{reportId:'R04',language:'en'});
      const result=model.criticalPath;
      assert.equal(result.schema,'VESA-TNA-CPM-1');
      assert.equal(result.validity,'valid');
      assert.equal(result.audience,'management');
      assert.equal(result.planningStart,'2026-10-12');
      assert.equal(result.requiredDate,'2026-10-20');
      assert.equal(result.rows.length,4);
      const direct=scheduling.schedule(plan.tasks,plan.edges,{
        calendar:plan.calendars[0],calendars:plan.calendars,
        startDate:'2026-10-12',requiredDate:'2026-10-20',nearCriticalDays:0
      });
      assert.equal(direct.validity,'valid');
      assert.equal(result.forecastDate,direct.project.forecastDate,'Forecast must be owned by frozen engine.');
      assert.equal(result.workingDaysEarlyOrLate,direct.project.workingDaysEarlyOrLate,'Buyer required vs forecast offset must use working-day engine.');
      for(const [i,task] of plan.tasks.entries()){
        const row=result.rows[i],eng=direct.taskResults[task.taskId];
        assert.equal(row.ref,task.templateRef);
        assert.equal(row.earlyStart,eng.earlyStart);
        assert.equal(row.earlyFinish,eng.earlyFinish);
        assert.equal(row.lateStart,eng.lateStart);
        assert.equal(row.lateFinish,eng.lateFinish);
        assert.equal(row.totalFloat,eng.floatDays);
        assert.equal(row.freeFloat,eng.freeFloatDays);
        assert.equal(row.isCritical,eng.isCritical);
        assert.equal(row.owner,task.ownerParty);
      }
      const refs=new Map(plan.tasks.map(t=>[t.taskId,t.templateRef]));
      assert.deepEqual(result.criticalPaths,direct.project.criticalPaths.map(path=>path.map(id=>refs.get(id))));
      assert.deepEqual(result.constraintViolations,direct.constraintViolations);
      assert.equal(JSON.stringify(plan),source,'Projection cannot change committed factory calendar or frozen records.');
      const excel=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true});
      assert.deepEqual(excel.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Critical Path']);
      const sheet=excel.Sheets['Critical Path'];
      const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false});
      assert.equal(rows.length,5,'R04 Excel must include all four task results and one header.');
      assert.equal(sheet.D2.t,'n','Early-start must be an actual typed Excel date.');
      assert.equal(sheet.E2.t,'n','Early-finish must be typed date.');
      assert.equal(sheet.F2.t,'n','Late-finish must be typed date.');
      assert.equal(sheet.G2.t,'n','Total float must be numeric.');
      assert.equal(sheet.H2.t,'n','Free float must be numeric.');
      assert.equal(sheet.D2.z,'yyyy-mm-dd');
      assert(sheet['!autofilter']?.ref,'Critical Path worksheet must support filtering.');
      assert(!JSON.stringify(model).includes('Synthetic secret cost'),'R04 never fabricates commercial values.');
      const buyer=reports.buildReportModel(plan,{reportId:'R02'});
      assert(!buyer.criticalPath);
      assert(!XLSX.read(storage.exportReportWorkbook(buyer),{type:'buffer'}).SheetNames.includes('Critical Path'));
      for(const language of ['en','bn','hi','ta']){
        const localized=reports.buildReportModel(plan,{reportId:'R04',language});
        assert.equal(localized.criticalPath.validity,'valid');
        assert.equal(localized.criticalPath.labels.labels.length,12);
        assert(localized.criticalPath.labels.noZero&&localized.criticalPath.labels.noViolations);
      }
      const missingDate=JSON.parse(JSON.stringify(plan));
      missingDate.commitments.buyerRequiredExFactory=null;
      assert.equal(reports.buildReportModel(missingDate,{reportId:'R04'}).criticalPath.validity,'incomplete');
      const absentCalendar=JSON.parse(JSON.stringify(plan));
      absentCalendar.tasks[0].calendarId='unconfirmed-supplier-calendar';
      const invalid=reports.buildReportModel(absentCalendar,{reportId:'R04'}).criticalPath;
      assert.equal(invalid.validity,'incomplete','All task calendars require explicit source, not default fallback.');
      const missingDuration=JSON.parse(JSON.stringify(plan));
      missingDuration.tasks[0].durationUnits=null;
      assert.equal(reports.buildReportModel(missingDuration,{reportId:'R04'}).criticalPath.validity,'incomplete');
      const invalidZone=JSON.parse(JSON.stringify(plan));
      delete invalidZone.calendars[0].timezone;
      assert.equal(reports.buildReportModel(invalidZone,{reportId:'R04'}).criticalPath.validity,'incomplete');
      const incompleteBook=XLSX.read(storage.exportReportWorkbook(unknown),{type:'buffer'});
      assert.equal(incompleteBook.Sheets['Critical Path'].A2.v,'Needs Information');
      assert.equal(incompleteBook.Sheets['Critical Path'].D2,undefined,'Unverified dates may not be exported as estimated commitments.');
    }
    console.log('TNA R04 Critical Path proof PASS: explicit calendar gate, real CPM parity, knit/woven, missing data, typed Excel, four languages, R02 isolation.');
  }
}
TnaCriticalPathProof.run();
