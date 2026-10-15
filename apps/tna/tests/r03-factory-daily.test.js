/**
 * Deterministic R03 Factory Daily Action contract proof.
 * Owns synthetic garment cases only. The source plan, baseline history,
 * all buyer reports and the existing storage schema must remain immutable.
 * Run: node apps/tna/tests/r03-factory-daily.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class FactoryDailyActionProof {
  /** Build a synthetic garment plan; no real buyer or factory details are used. */
  static fixture(){
    const plan=domain.createPlan({
      templateId:'knit',buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'SYN-R03',poNumber:'PO-R03',totalQty:1200,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-20'
    },{ownerUserId:'synthetic-qa'});
    const tasks=plan.tasks;
    assert.ok(tasks.length>=8,'Knit template requires eight or more real source activities.');
    tasks[0].dates.currentTargetFinish='2026-10-13';
    tasks[0].delayReason='Waiting for supplier confirmation';
    tasks[0].proofRefs=['  =SUM(1,2)','EVID-R03-001'];
    tasks[1].dates.currentTargetFinish='2026-10-15';
    tasks[2].dates.currentTargetFinish='2026-10-16';
    tasks[3].dates.currentTargetFinish='2026-10-22';
    tasks[4].dates.currentTargetFinish='2026-10-23';
    tasks[6].dates.baselineFinish='2026-10-14';
    tasks[7].dates.currentTargetFinish='2026-10-10';
    tasks[7].dates.actualFinish='2026-10-09';
    tasks[7].status='completed';
    plan.revisionEvents.push({
      eventId:'SYN-R03-REV',eventType:'task-followup-updated',
      revision:plan.revision,actorId:'synthetic-qa',
      createdAt:'2026-10-14T00:00:00.000Z',
      details:{taskId:tasks[1].taskId,reason:'Internal note: factory samples delayed'}
    });

    return plan;
  }

  /** Run source-backed deadlines, unknown-state, language and Excel tests. */
  static run(){
    const plan=this.fixture();
    const frozen=JSON.stringify(plan);
    const model=reports.buildReportModel(plan,{
      reportId:'R03',language:'en',generatedAt:'2026-10-14T19:30:00.000Z',timezone:'Asia/Dhaka'
    });
    const daily=model.factoryDailyAction;
    assert.equal(model.reportId,'R03');
    assert.equal(model.audience,'Departments');
    assert.equal(daily.schema,'VESA-TNA-DAILY-1');
    assert.equal(daily.asOfDate,'2026-10-15','Asia/Dhaka must advance the UTC timestamp to the correct civil day.');
    assert.equal(daily.timeBasis,'calendar-days');
    assert.equal(daily.horizonDays,7);
    assert.equal(daily.groups.overdue[0].calendarDaysFromToday,-2,'Overdue is a negative signed calendar offset.');
    assert.equal(daily.groups.overdue[0].due,'2026-10-13');
    assert.equal(daily.groups.overdue[0].dateSource,'current-target');
    assert.equal(daily.groups.overdue[0].delayReason,'Waiting for supplier confirmation');
    assert.deepEqual(daily.groups.overdue[0].proofRefs,['=SUM(1,2)','EVID-R03-001']);
    assert(daily.groups.overdue.some(row=>row.ref===plan.tasks[6].templateRef&&row.dateSource==='baseline-finish'));
    assert(daily.groups.today.some(row=>row.ref===plan.tasks[1].templateRef&&row.followupNote==='Internal note: factory samples delayed'));
    assert(daily.groups.nextSeven.some(row=>row.ref===plan.tasks[2].templateRef&&row.calendarDaysFromToday===1));
    assert(daily.groups.nextSeven.some(row=>row.ref===plan.tasks[3].templateRef&&row.calendarDaysFromToday===7));
    assert(daily.groups.later.some(row=>row.ref===plan.tasks[4].templateRef&&row.calendarDaysFromToday===8));
    assert(daily.groups.needsInformation.some(row=>row.ref===plan.tasks[5].templateRef&&row.due===null));
    const listed=Object.values(daily.groups).flat();
    assert(!listed.some(row=>row.ref===plan.tasks[7].templateRef),'Completed tasks are not outstanding daily action.');
    assert.equal(daily.excludedClosed,1);
    assert.equal(daily.totalOpen,plan.tasks.length-1,'No unfinished source task may silently disappear.');
    const inUtc=reports.buildReportModel(plan,{reportId:'R03',language:'en',generatedAt:'2026-10-14T19:30:00.000Z',timezone:'UTC'});
    assert.equal(inUtc.factoryDailyAction.asOfDate,'2026-10-14','As-of time must respect the stated report timezone.');
    assert(inUtc.factoryDailyAction.groups.nextSeven.some(row=>row.ref===plan.tasks[1].templateRef),'Same due date changes group across midnight timezones.');
    const invalidZone=reports.buildReportModel(plan,{reportId:'R03',generatedAt:'2026-10-14T19:30:00.000Z',timezone:'Invalid/Zone'});
    assert.equal(invalidZone.factoryDailyAction.asOfDate,null);
    assert.equal(invalidZone.factoryDailyAction.counts.overdue,0,'Unknown timezone cannot create overdue tasks.');
    const invalidSource=JSON.parse(JSON.stringify(plan));
    invalidSource.tasks[0].dates.currentTargetFinish='2026-02-30';
    const invalidReport=reports.buildReportModel(invalidSource,{reportId:'R03',asOfDate:'2026-10-15',timezone:'Asia/Dhaka'});
    assert(invalidReport.factoryDailyAction.groups.needsInformation.some(row=>row.ref===plan.tasks[0].templateRef),'Invalid input cannot be guessed to a date.');
    for(const language of ['en','bn','hi','ta']){
      const localized=reports.buildReportModel(plan,{reportId:'R03',language,asOfDate:'2026-10-15',timezone:'Asia/Dhaka'});
      assert(localized.factoryDailyAction.labels.columns.length===11,language+': 11 contract columns are required.');
      assert(localized.factoryDailyAction.labels.groups.overdue&&localized.factoryDailyAction.labels.groups.nextSeven,language+': bucket labels are required.');
      assert.equal(localized.factoryDailyAction.asOfDate,'2026-10-15');
    }
    const buyer=reports.buildReportModel(plan,{reportId:'R02',timezone:'Asia/Dhaka'});
    assert(!buyer.factoryDailyAction,'Buyer must not receive internal Factory Daily Action projections.');
    assert(!JSON.stringify(buyer).includes('Internal note: factory samples delayed'),'Buyer report must not expose internal follow-up text.');
    assert(!JSON.stringify(buyer).includes('EVID-R03-001'),'Buyer report must not expose factory proof references.');
    const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true});
    assert.deepEqual(workbook.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Factory Daily Action']);
    const sheet=workbook.Sheets['Factory Daily Action'];
    const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false});
    assert.equal(rows.length,daily.totalOpen+1,'The daily workbook must retain every open task and its header.');
    assert.equal(rows[0][0],'Due group');
    assert.equal(rows[0][4],'Due finish');
    assert.equal(rows[1][0],'Overdue','The most overdue activity must be first.');
    assert.equal(rows[1][1],plan.tasks[0].templateRef);
    assert.equal(rows[1][4],'2026-10-13','Due dates must retain the exact civil day.');
    assert.equal(sheet.E2.t,'n','Confirmed ISO due dates must become typed Excel dates.');
    assert.equal(sheet.E2.z,'yyyy-mm-dd');
    assert.equal(sheet.G2.t,'n','Calendar day difference must remain numeric.');
    assert.equal(sheet.G2.v,-2);
    assert.equal(sheet.K2.t,'s','Evidence references must be inert text.');
    assert(sheet.K2.v.startsWith("'=SUM(1,2)"),'Spreadsheet formulas must be exported as inert text.');
    assert(sheet['!autofilter']?.ref,'Factory follow-up workbook needs a working filter.');
    const summary=XLSX.utils.sheet_to_json(workbook.Sheets['Report Summary'],{header:1,raw:false});
    assert(summary.some(row=>row[0]==='Action as-of date'&&row[1]==='2026-10-15'),'Timezone-aware as-of date must be visible in Excel.');
    const buyerWorkbook=XLSX.read(storage.exportReportWorkbook(buyer),{type:'buffer'});
    assert(!buyerWorkbook.SheetNames.includes('Factory Daily Action'),'Buyer-facing Excel must not include internal action notes.');
    const unknownRow=rows.find(row=>row[1]===plan.tasks[5].templateRef);
    assert(unknownRow&&unknownRow[4]==='Needs Information','Missing due dates must remain marked unknown in the workbook.');
    const outsideRow=rows.find(row=>row[1]===plan.tasks[4].templateRef);
    assert(outsideRow&&outsideRow[0]==='Later than 7 days','Later activity must be explicitly accounted for.');
    assert(!rows.some(row=>row[1]===plan.tasks[7].templateRef),'Completed task must not be presented as open action.');

    assert.equal(JSON.stringify(plan),frozen,'R03 must never change source plan or stored records.');
    console.log('TNA R03 Factory Daily Action tests passed: source dates, timezone, privacy, Excel, languages');
  }
}

FactoryDailyActionProof.run();
