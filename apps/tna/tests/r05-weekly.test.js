/**
 * R05 Weekly TNA: deterministic source, civil-week and Excel integration proof.
 * This is synthetic knit/woven data only. No buyer approval, commercial value,
 * external notification or live factory calendar is created by this test.
 * Invoke with: node apps/tna/tests/r05-weekly.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaWeeklyReportProof {
  /** Prepare an immutable confirmed baseline and independently recorded task updates. */
  static fixture(templateId='knit'){
    const plan=domain.createPlan({
      templateId,buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'WEEKLY-TEST',poNumber:'PO-WEEK',totalQty:700,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-11-30'
    },{ownerUserId:'synthetic-weekly'});
    assert(plan.tasks.length>18,'Garment fixture needs real template task records.');
    plan.tasks[0].dates.currentTargetFinish='2026-10-14';
    plan.tasks[3].dates.currentTargetFinish='2026-10-05';
    plan.tasks[9].dates.currentTargetFinish='2026-10-12';
    const baseline=domain.freezeBaseline(plan,{actorId:'synthetic-weekly',reason:'Synthetic immutable baseline'});
    assert.equal(baseline.ok,true);
    const next=baseline.plan,t=next.tasks;
    t[0].status='completed';t[0].dates.currentTargetFinish='2026-10-16';
    t[0].dates.forecastFinish='2026-10-15';t[0].dates.actualFinish='2026-10-15';
    t[1].status='completed';t[1].dates.actualFinish='2026-10-09';
    t[2].status='completed';t[2].dates.actualFinish='2026-10-03';
    t[3].status='in-progress';t[3].dates.currentTargetFinish='2026-10-13';
    t[3].recoveryAction='  =SUM(1,2)';t[3].ownerParty='=PRIVATE-TEST-OWNER';
    t[3].title='  =SUM(3,4)';
    t[4].dates.currentTargetFinish='2026-10-16';
    t[5].dates.currentTargetFinish='2026-10-18';
    t[6].dates.currentTargetFinish='2026-10-19';
    t[7].dates.currentTargetFinish='2026-10-25';
    t[8].dates.currentTargetFinish='2026-10-26';
    t[9].dates.currentTargetFinish='2026-02-30'; // Must NOT fall back to valid frozen date.
    t[11].dates.currentTargetFinish='2026-10-20';
    t[11].status='awaiting-approval';t[11].taskKind='gate';t[11].ownerParty='buyer';
    t[12].status='approved';t[12].dates.currentTargetFinish='2026-10-13';
    t[13].status='completed';t[13].dates.actualFinish=null;
    t[14].status='completed';t[14].dates.actualFinish='2026-10-20';
    t[15].status='waived';t[15].dates.currentTargetFinish='2026-10-13';
    t[16].status='not-applicable';t[16].dates.currentTargetFinish='2026-10-13';
    next.revisionEvents.push({eventId:'SYN-REV-1',eventType:'task-followup-updated',
      createdAt:'2026-10-15T00:00:00.000Z',
      details:{taskId:t[3].taskId,reason:'PRIVATE_INTERNAL_FOLLOWUP_NOT_IN_WEEKLY'}});
    next.order.commercialNotes='PRIVATE_FOB_USD_NOT_IN_WEEKLY';
    return next;
  }

  /** Verify exact as-of grouping, immutable evidence, local recovery and actual XLSX data. */
  static run(){
    for(const templateId of ['knit','woven']){
      const plan=this.fixture(templateId),frozen=JSON.stringify(plan);
      const opts={reportId:'R05',generatedAt:'2026-10-15T19:30:00.000Z',
        timezone:'Asia/Dhaka',language:'en'};
      const model=reports.buildReportModel(plan,opts),weekly=model.weeklyTna;
      assert.equal(weekly.schema,'VESA-TNA-WEEKLY-1');
      assert.equal(weekly.validity,'valid');
      assert.equal(weekly.asOfDate,'2026-10-16','Timezone must advance past UTC midnight.');
      assert.equal(weekly.timeBasis,'ISO-Monday-Sunday-civil');
      assert.deepEqual(weekly.week,{
        previousStart:'2026-10-05',previousEnd:'2026-10-11',
        start:'2026-10-12',end:'2026-10-18',
        nextStart:'2026-10-19',nextEnd:'2026-10-25'});
      assert.equal(model.reportId,'R05');
      assert(model.audience.includes('Local merchandiser'));
      assert(model.notes.some(note=>note.includes('Do not send to buyer')));
      const ref=index=>plan.tasks[index].templateRef;
      const includes=(key,index)=>weekly.groups[key].some(row=>row.ref===ref(index));
      assert(includes('completedThisWeek',0));
      assert(includes('completedPreviousWeek',1));
      assert(!includes('completedThisWeek',2),'Older completion cannot be moved into current week.');
      assert.equal(weekly.excludedEarlierCompleted,1);
      assert(includes('missed',3));
      assert.equal(weekly.groups.missed.find(row=>row.ref===ref(3)).lateDays,3);
      assert(includes('dueThisWeek',4)&&includes('dueThisWeek',5));
      assert(includes('dueNextWeek',6)&&includes('dueNextWeek',7)&&includes('dueNextWeek',11));
      assert(!includes('dueNextWeek',8),'Later week activity cannot be in next 7-day period.');
      assert(weekly.excludedLaterOpen>=1);
      assert(includes('needsInformation',9)&&includes('needsInformation',10));
      assert(!includes('missed',9),'Invalid current date must not use valid frozen baseline as fallback.');
      assert(includes('approvalPending',11),'Recorded pending gate must be surfaced.');
      assert(!includes('approvalPending',12),'Locally approved gate must not be called pending.');
      assert(includes('needsInformation',13),'Completed without actual date is not a verified completion.');
      assert(includes('needsInformation',14),'Future actual cannot prove completion as-of the report date.');
      for(const key of ['missed','dueThisWeek','dueNextWeek'])
        assert(!includes(key,12)&&!includes(key,15)&&!includes(key,16),'Closed tasks excluded from actionable due groups.');
      const recovery=weekly.groups.recordedRecovery.find(row=>row.ref===ref(3));
      assert(recovery&&recovery.recoveryProposal==='  =SUM(1,2)');
      assert.equal(recovery.recoveryAgreement,weekly.labels.agreed);
      assert.deepEqual(weekly.verifiedRecoveryAgreements,[],
        'Neither a written proposal nor an applied local scenario establishes agreement.');
      assert(!JSON.stringify(weekly).includes('PRIVATE_INTERNAL_FOLLOWUP_NOT_IN_WEEKLY'));
      assert(!JSON.stringify(weekly).includes('PRIVATE_FOB_USD_NOT_IN_WEEKLY'));
      assert.equal(JSON.stringify(plan),frozen,'Report must never mutate status, actual, baseline, or audit.');
      const sameDayUtc=reports.buildReportModel(plan,{...opts,timezone:'UTC'}).weeklyTna;
      assert.equal(sameDayUtc.asOfDate,'2026-10-15');
      assert.equal(sameDayUtc.groups.missed.find(row=>row.ref===ref(3)).lateDays,2);
      const saturday=reports.buildReportModel(plan,{...opts,asOfDate:'2026-10-17'}).weeklyTna;
      assert.equal(saturday.week.start,'2026-10-12','Explicit as-of must remain in current ISO week.');
      const sunday=reports.buildReportModel(plan,{...opts,asOfDate:'2026-10-18'}).weeklyTna;
      const monday=reports.buildReportModel(plan,{...opts,asOfDate:'2026-10-19'}).weeklyTna;
      assert.equal(sunday.week.start,'2026-10-12');
      assert.equal(monday.week.start,'2026-10-19','ISO Monday boundary must roll without local DST assumptions.');
      assert(monday.groups.missed.some(row=>row.ref===ref(5)),'Sunday due becomes missed after Monday.');
      for(const bad of [{timezone:'No/SuchZone'},{generatedAt:'invalid',asOfDate:undefined},
        {asOfDate:'2026-02-30'},{timezone:''}]){
        const invalid=reports.buildReportModel(plan,{...opts,...bad}).weeklyTna;
        assert.equal(invalid.validity,'incomplete','Bad as-of/timezone must fail closed.');
        assert.equal(invalid.counts.missed,0);
        assert.equal(invalid.week,null);
      }
      for(const language of ['en','bn','hi','ta']){
        const translated=reports.buildReportModel(plan,{...opts,language}).weeklyTna;
        assert.equal(translated.validity,'valid');
        assert.equal(translated.counts.missed,weekly.counts.missed);
        assert(translated.labels.sections.dueNextWeek&&translated.labels.sections.recordedRecovery);
        assert.equal(translated.labels.columns.length,13);
        assert.equal(JSON.stringify(plan),frozen);
      }
      const xlsx=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(xlsx.SheetNames,
        ['Report Summary','Order Summary','Report Activities','Report Notes','Weekly Actions']);
      const weeklySheet=xlsx.Sheets['Weekly Actions'];
      const rows=XLSX.utils.sheet_to_json(weeklySheet,{header:1,raw:false});
      const groups=Object.values(weekly.counts).reduce((sum,val)=>sum+val,0);
      assert.equal(rows.length,groups+1,'All section entries must be present in weekly Excel, without silent truncation.');
      assert.equal(rows[0][5],'Original baseline');
      assert.equal(rows[0][9],'Status');
      assert(weeklySheet['!autofilter']?.ref);
      const actualRow=rows.findIndex(row=>row[1]===ref(0))+1;
      assert(actualRow>1);
      assert.equal(weeklySheet['I'+actualRow].t,'n','Completed actual must be a typed Excel date.');
      assert.equal(weeklySheet['I'+actualRow].z,'yyyy-mm-dd');
      const missedRow=rows.findIndex(row=>row[1]===ref(3)&&row[0]==='Past due as of today')+1;
      assert(missedRow>1,'Overdue group must be labeled.');
      assert.equal(weeklySheet['K'+missedRow].t,'n','Late days must remain numeric.');
      assert.equal(weeklySheet['K'+missedRow].v,3);
      assert.equal(weeklySheet['G'+missedRow].t,'n','Current target must remain a typed date.');
      assert(weeklySheet['D'+missedRow].t==='s'&&weeklySheet['D'+missedRow].v.startsWith("'"),
        'Whitespace-prefixed formulas in task titles must remain inert in weekly Excel.');
      assert(weeklySheet['E'+missedRow].t==='s'&&weeklySheet['E'+missedRow].v.startsWith("'"),
        'Formula-like responsible party must remain inert.');
      const proposalRow=rows.findIndex(row=>row[1]===ref(3)&&row[0]===weekly.labels.sections.recordedRecovery)+1;
      assert(weeklySheet['M'+proposalRow].v.startsWith("'"),
        'Whitespace-prefixed recovery formulas must remain inert workbook text.');
      for(const sheet of Object.values(xlsx.Sheets)){
        for(const cell of Object.values(sheet)){
          assert(!cell?.f,'No imported text should be interpreted as a live spreadsheet formula.');
        }
      }
      const meta=XLSX.utils.sheet_to_json(xlsx.Sheets['Report Summary'],{header:1,raw:false});
      assert(meta.some(row=>row[0]==='Weekly as-of date'&&row[1]==='2026-10-16'));
      assert(meta.some(row=>row[0]==='Week range'&&row[1]==='2026-10-12 to 2026-10-18'));
      const missing=reports.buildReportModel(plan,{...opts,timezone:'Bad/Zone'});
      const unknown=XLSX.read(storage.exportReportWorkbook(missing),{type:'buffer'});
      assert.equal(unknown.Sheets['Weekly Actions'].A2.v,'Needs Information');
      assert(!unknown.Sheets['Weekly Actions'].G2,'Unknown time zone must not export calculated due dates.');
      assert.equal(JSON.stringify(plan),frozen);
      const other=reports.buildReportModel(plan,{reportId:'R02',language:'en'});
      assert(!other.weeklyTna,'R05 internal recovery may not bleed into buyer R02.');
      assert(!JSON.stringify(other).includes('  =SUM(1,2)'),'Buyer R02 report must not expose internal recovery.');
    }
    console.log('TNA R05 weekly PASS: source-complete and pending groups, ISO/timezone weeks, no false recovery agreement, EN/BN/HI/TA, typed Excel, formula safety, R02 privacy.');
  }
}

TnaWeeklyReportProof.run();
