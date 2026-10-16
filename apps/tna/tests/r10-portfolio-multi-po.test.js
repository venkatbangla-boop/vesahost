/**
 * R10 Portfolio/Multi-PO: real local-user snapshot, provenance-gated CPM,
 * source-backed PO allocations, privacy boundary and typed Excel.
 * Synthetic plans only. Run: node apps/tna/tests/r10-portfolio-multi-po.test.js
 */
'use strict';
const assert=require('node:assert/strict');
globalThis.localStorage={
  entries:new Map(),
  getItem(k){return this.entries.has(k)?this.entries.get(k):null;},
  setItem(k,v){this.entries.set(k,String(v));},
  removeItem(k){this.entries.delete(k);}
};
const domain=require('../src/domain.js');
globalThis.VesaTnaDomain=domain;
globalThis.VesaTnaScheduling=require('../src/scheduling.js');
const storage=require('../src/storage.js');
const reports=require('../src/reports.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaPortfolioSourceProof {
  /** Every test plan has explicit local owner and buyer/PO context. */
  static plan(style,po,qty,owner='same-owner',tenant=null){
    return domain.createPlan({
      templateId:'knit',buyerName:'Synthetic Buyer',
      factoryName:'Synthetic Factory',styleNo:style,poNumber:po,totalQty:qty,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-10-20'
    },{ownerUserId:owner,tenantId:tenant});
  }
  /** Reuse exact R04 confirmed-calendar validator instead of guessed weekdays. */
  static confirmedDraft(){
    let plan=this.plan('SYN-CPM-A','SYN-PO-A',1000);
    plan.tasks=plan.tasks.slice(0,4);
    for(const [i,task] of plan.tasks.entries()){
      task.durationUnits=[2,3,2,1][i];
      task.durationBasis='working';
      task.dates.currentTargetFinish=['2026-10-08','2026-10-10','2026-10-12','2026-10-16'][i];
      task.status='in-progress';
    }
    const [a,b,c,d]=plan.tasks;
    plan.edges=[[a,b],[a,c],[b,d],[c,d]].map(([from,to],i)=>({
      edgeId:'P-R10-'+i,predecessorTaskId:from.taskId,successorTaskId:to.taskId,
      relation:'FS',lagUnits:0,lagBasis:'working',calendarPolicy:'successor'
    }));
    const confirmation=domain.updateFactoryCalendar(plan,{
      name:'Synthetic factory',workingWeek:[1,2,3,4,5],
      holidays:[],shutdowns:[],timezone:'Asia/Dhaka',
      sourceReference:'Synthetic local calendar evidence',confirmed:true,
      reason:'Synthetic report proof'
    },{actorId:'same-owner'});
    assert.equal(confirmation.ok,true);
    plan=confirmation.plan;
    const frozen=domain.freezeBaseline(plan,{
      actorId:'same-owner',reason:'Synthetic frozen required date'
    });
    assert.equal(frozen.ok,true);
    plan=frozen.plan;
    plan.commitments.buyerRequiredExFactory='2026-10-22';
    plan.tasks[0].status='blocked';
    plan.tasks[1].status='awaiting-approval';
    plan.tasks[2].dates.currentTargetFinish='2026-10-17';
    return plan;
  }
  static run(){
    const user='synthetic-user-1',otherUser='other-local-profile';
    const anchor=this.confirmedDraft();
    const second=this.plan('SYN-STYLE-B','SYN-PO-B',300);
    second.order.poNumbers=['SYN-PO-B','SYN-PO-B-2'];
    second.order.unit='kg';
    second.tasks[0].dates.currentTargetFinish='2026-10-14';
    second.tasks[0].status='blocked';
    const foreignOwner=this.plan('PRIVATE FOREIGN OWNER','PRIVATE-PO',500,'another-owner');
    const foreignTenant=this.plan('PRIVATE TENANT','PRIVATE-TENANT-PO',100,'same-owner','tenant-other');
    const foreignUser=this.plan('PRIVATE USER KEY','PRIVATE-USER-PO',100,'same-owner');
    for(const p of [anchor,second,foreignOwner,foreignTenant])storage.savePlan(p,user);
    storage.savePlan(foreignUser,otherUser);
    const boxKey='vesa.tna360.records.'+user;
    const originalBox=localStorage.getItem(boxKey);
    const snapshot=storage.portfolioSnapshot(anchor.recordId,user);
    assert.equal(snapshot.status,'ok');
    assert.equal(snapshot.scope,'same-user-local-saved');
    assert.equal(snapshot.plans.length,2,'Local owner/tenant filter must fail closed.');
    assert.equal(snapshot.excludedCount,2);
    assert.equal(snapshot.savedCount,4);
    assert.equal(localStorage.getItem(boxKey),originalBox,
      'Read-only portfolio reader must not migrate or update saved data.');
    assert(!JSON.stringify(snapshot).includes('PRIVATE FOREIGN OWNER'));
    assert(!JSON.stringify(snapshot).includes('PRIVATE TENANT'));
    assert(!JSON.stringify(snapshot).includes('PRIVATE USER KEY'));
    const opts={reportId:'R10',language:'en',timezone:'Asia/Dhaka',
      asOfDate:'2026-10-16',generatedAt:'2026-10-16T05:00:00Z',portfolioSnapshot:snapshot};
    const model=reports.buildReportModel(anchor,opts),p=model.portfolio;
    assert.equal(p.schema,'VESA-TNA-PORTFOLIO-1');
    assert.equal(p.validity,'valid');
    assert.equal(p.orders.length,2);
    assert.equal(p.counts.visibleOrders,2);
    assert.equal(p.counts.visiblePoReferences,3);
    assert.equal(p.counts.excludedLocalRecords,2);
    assert.equal(p.poRows.length,3);
    assert.equal(p.poRows[0].allocatedQty,1000,'Single PO uses source order total.');
    assert.equal(p.poRows[1].allocatedQty,null,'Multi-PO cannot divide order total.');
    assert.equal(p.poRows[2].allocatedQty,null);
    assert.equal(p.orders[0].originalRequired,'2026-10-20');
    assert.equal(p.orders[0].currentRequired,'2026-10-22');
    assert.equal(p.orders[0].cpmState,'valid');
    assert(p.orders[0].cpmForecast,'Confirmed CPM must come from unchanged R04 engine.');
    assert.equal(p.orders[0].nextAction.criticalBasis?typeof p.orders[0].nextAction.criticalBasis:'','string');
    assert.equal(p.orders[0].risk,p.labels.blocked);
    assert.equal(p.orders[1].cpmState,'incomplete');
    assert.equal(p.orders[1].cpmForecast,null,'Unconfirmed calendar MUST NOT create forecast.');
    assert.equal(p.orders[1].orderQty,300);
    assert.equal(p.orders[1].unit,'kg');
    assert(p.orders[0].taskBlockers>=2);
    assert(p.actions.some(a=>a.status==='blocked'));
    assert.equal(p.noExternalAuthority,true);
    assert(!JSON.stringify(model).includes('PRIVATE FOREIGN OWNER'));
    assert(!JSON.stringify(model).includes('PRIVATE TENANT'));
    assert(!JSON.stringify(model).includes('PRIVATE USER KEY'));
    assert.equal(model.source.recordId,null,'Portfolio model never reuses a private plan record ID as a report source.');
    assert.equal(model.tasks.length,0,'No raw activity export.');
    assert.equal(model.order.buyer,p.labels.neutral);
    for(const language of ['en','bn','hi','ta']){
      const local=reports.buildReportModel(anchor,{...opts,language}).portfolio;
      assert.equal(local.counts.visibleOrders,2);
      assert.equal(local.labels.headers.length,14);
      assert.equal(local.labels.poHeaders.length,7);
      assert.equal(local.labels.actionHeaders.length,7);
      assert(local.labels.basis&&local.labels.unknown);
    }
    const byPo=reports.buildReportModel(anchor,{...opts,portfolioFilter:{po:'SYN-PO-B-2'}}).portfolio;
    assert.equal(byPo.counts.visibleOrders,1);
    assert.equal(byPo.orders[0].style,'SYN-STYLE-B');
    assert.equal(byPo.poRows.length,2,'PO filter selects the order, not a guessed allocated PO quantity.');
    assert.equal(reports.buildReportModel(anchor,{...opts,portfolioFilter:{buyer:'Not in scope'}}).portfolio.orders.length,0);
    const without=reports.buildReportModel(anchor,{...opts,portfolioSnapshot:null}).portfolio;
    assert.equal(without.validity,'incomplete');
    assert.equal(without.orders.length,0);
    assert.equal(storage.portfolioSnapshot('not-saved',user).status,'anchor-not-saved');
    const wrong=reports.buildReportModel(anchor,{...opts,timezone:'Invalid/Timezone'}).portfolio;
    assert.equal(wrong.validity,'incomplete');
    assert.equal(wrong.orders.length,0);
    const future=reports.buildReportModel(anchor,{...opts,asOfDate:'2026-02-30'}).portfolio;
    assert.equal(future.validity,'incomplete');
    const external=reports.buildReportModel(anchor,{...opts,audienceMode:'buyer'});
    assert.equal(external.portfolio.validity,'restricted');
    assert.deepEqual(external.portfolio.orders,[]);
    assert.deepEqual(external.tasks,[]);
    for(const token of ['SYN-CPM-A','SYN-PO-A','SYN-STYLE-B',
      'Synthetic Buyer','PRIVATE-PO','same-owner']){
      assert(!JSON.stringify(external).includes(token),'External summary leak '+token);
    }
    const book=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true,cellFormula:true});
    assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes',
      'Portfolio Orders','Portfolio PO','Portfolio Actions']);
    const orderSheet=book.Sheets['Portfolio Orders'];
    assert.equal(orderSheet.E2.t,'n');
    assert.equal(orderSheet.E2.v,1000);
    assert.equal(orderSheet.H2.t,'n');
    assert.equal(orderSheet.H2.z,'yyyy-mm-dd');
    assert.equal(orderSheet.I2.t,'n');
    assert.equal(orderSheet.J2.t,'n','Confirmed CPM must be real typed date.');
    assert.equal(orderSheet.J3.t,'s','Unconfirmed CPM must remain Needs Information.');
    assert.equal(book.Sheets['Portfolio PO'].E3.t,'s','No invented per-PO allocations.');
    assert.equal(book.Sheets['Portfolio Actions'].E2.t,'n');
    assert(!Object.values(book.Sheets).some(sheet=>Object.values(sheet).some(cell=>cell?.f)),
      'Never export executable spreadsheet formulas.');
    const buyerBook=XLSX.read(storage.exportReportWorkbook(external),{type:'buffer'});
    assert(!JSON.stringify(buyerBook.Sheets).includes('SYN-CPM-A'));
    const malicious=structuredClone(anchor);
    malicious.order.buyerName='=HYPERLINK("private")';
    const maliciousPlanSnapshot={...snapshot,plans:[malicious,second]};
    const escaped=reports.buildReportModel(malicious,{...opts,portfolioSnapshot:maliciousPlanSnapshot});
    const escapedBook=XLSX.read(storage.exportReportWorkbook(escaped),{type:'buffer'});
    assert(escapedBook.Sheets['Portfolio Orders'].A2.v.startsWith("'"),
      'Untrusted buyer text may never execute formulas.');
    assert.equal(localStorage.getItem(boxKey),originalBox,'Reports and Excel never mutate saved records.');
    console.log('TNA R10 PASS: actual same-user bucket and owner/tenant isolation, immutable migrated snapshots, knit/CPM calendar gate, multi-PO no quantity guesses, EN/BN/HI/TA, typed formula-safe Excel and external privacy.');
  }
}
TnaPortfolioSourceProof.run();
