/**
 * F31 unsigned draft follow-up Undo/Redo with protected approvals/baseline and
 * append-only source revisions. No customer data or network, Node 22 fixture.
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
globalThis.VesaTnaDomain=domain;
const storage=require('../src/storage.js');
class TnaF31DraftHistoryProof {
  static create(){
    return domain.createPlan({templateId:'knit',buyerName:'F31 TEST BUYER',
      factoryName:'SYNTHETIC',styleNo:'F31-TEST',poNumber:'F31-PO',
      totalQty:500,orderConfirmedOn:'2026-10-12',
      buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'f31-test'});
  }
  static follow(plan,taskId,owner,date,note='Synthetic follow-up'){
    const r=domain.updateTaskFollowup(plan,taskId,{ownerParty:owner,
      currentTargetFinish:date,forecastFinish:'',note},{actorId:'f31-test'});
    assert.equal(r.ok,true,r.error);return r.plan;
  }
  static run(){
    const ledger=new storage.TnaDraftFollowupHistory();
    const start=this.create(),id=start.tasks[0].taskId;
    const first=this.follow(start,id,'CUTTING TEAM','2026-11-16');
    assert.equal(ledger.record(start,first,id),true);
    assert.equal(ledger.available(first,'undo'),true);
    assert.equal(ledger.available(first,'redo'),false);
    let saves=0,active=first;
    const persist=(next,previous)=>{assert.equal(previous.recordId,start.recordId);saves++;};
    let a=ledger.move(active,'undo','f31-test',persist);
    assert.equal(a.ok,true,a.error);active=a.plan;
    assert.equal(active.tasks[0].ownerParty,start.tasks[0].ownerParty);
    assert.equal(active.tasks[0].dates.currentTargetFinish,start.tasks[0].dates.currentTargetFinish);
    assert.equal(active.revisionEvents.length,first.revisionEvents.length+1);
    assert.match(active.revisionEvents.at(-1).details.reason,/Undo previous unsigned/);
    assert.equal(JSON.stringify(start.baselineSnapshots),JSON.stringify(active.baselineSnapshots));
    assert.equal(ledger.available(active,'redo'),true);
    a=ledger.move(active,'redo','f31-test',persist);
    assert.equal(a.ok,true,a.error);active=a.plan;
    assert.equal(active.tasks[0].ownerParty,'CUTTING TEAM');
    assert.equal(active.tasks[0].dates.currentTargetFinish,'2026-11-16');
    assert.equal(active.revisionEvents.length,first.revisionEvents.length+2);
    assert.equal(saves,2);
    const second=this.follow(active,id,'FINISHING TEAM','2026-11-17');
    assert.equal(ledger.record(active,second,id),true);
    assert.equal(ledger.available(second,'undo'),true);
    const rejected=ledger.move(second,'undo','f31-test',()=>{throw Error('quota');});
    assert.equal(rejected.ok,false);
    assert.equal(ledger.available(second,'undo'),true,'Failed save must not consume undo.');
    assert.equal(second.tasks[0].ownerParty,'FINISHING TEAM');
    a=ledger.move(second,'undo','f31-test',persist);
    assert.equal(a.ok,true);active=a.plan;
    assert.equal(active.tasks[0].ownerParty,'CUTTING TEAM');
    a=ledger.move(active,'undo','f31-test',persist);
    assert.equal(a.ok,true);active=a.plan;
    assert.equal(active.tasks[0].ownerParty,start.tasks[0].ownerParty);
    a=ledger.move(active,'redo','f31-test',persist);
    assert.equal(a.ok,true);active=a.plan;
    const third=this.follow(active,id,'QA TEAM','2026-11-18');
    assert.equal(ledger.record(active,third,id),true);
    assert.equal(ledger.available(third,'redo'),false,'New edit clears redo chain.');
    const changedOther=domain.updateTaskStatus(third,third.tasks[1].taskId,'blocked',
      {actorId:'f31-test'});
    assert.equal(changedOther.ok,true);
    assert.equal(ledger.move(changedOther.plan,'undo','f31-test',persist).ok,false,
      'Out-of-band change must not be lost.');
    const separately=new storage.TnaDraftFollowupHistory();
    assert.equal(separately.record(start,first,id),true);
    const confirmed=domain.freezeBaseline(first,{actorId:'f31-test',reason:'Synthetic source'});
    assert.equal(confirmed.ok,true);
    assert.equal(separately.move(confirmed.plan,'undo','f31-test',persist).ok,false,
      'Confirmed baseline is protected.');
    const signed=domain.updateTaskStatus(start,id,'completed',{actorId:'f31-test',
      actualDate:'2026-11-16'});
    assert.equal(signed.ok,true);
    assert.equal(new storage.TnaDraftFollowupHistory().record(start,signed.plan,id),false,
      'Completion is not a draft follow-up.');
    assert.equal(new storage.TnaDraftFollowupHistory().record(start,first,'unknown-id'),false);
    assert.equal(new storage.TnaDraftFollowupHistory().move(this.create(),'undo',
      'f31-test',persist).ok,false,'History cannot bleed into another order.');
    console.log('TNA F31 Node PASS: unsigned draft follow-up undo/redo, append-only audit, redo truncation, stored failure, baseline/status and cross-order guards.');
  }
}
TnaF31DraftHistoryProof.run();
