/* APP-04 immutable sample rounds, buyer authority, source schedule and restore tests. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
class SamplingDomainTest{
 static run(){
  const root=path.resolve(__dirname,'..'),memory=new Map(),localStorage={
   getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  const context={module:{exports:{}},Date,Math,JSON,localStorage};context.globalThis=context;
  for(const relative of ['src/domain/sampling-engine.js','src/data/local-record-port.js','src/reports/report-model.js']){
   vm.runInNewContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
  }
  const E=context.VesaSamplingEngine,S=context.VesaSamplingStore,R=context.VesaSamplingReports;
  assert.equal(E.version,'VESA-SAMPLING360-1');
  assert(!E.date('2026-02-30'));assert(E.date('2026-10-17'));
  const demo=E.demo(),original=JSON.stringify(demo),valid=E.validate(demo);
  assert.equal(valid.ok,true,valid.errors.join('\n'));
  let result=E.summarize(demo,'2026-10-17');
  assert.equal(result.rounds,2);assert.equal(result.buyerApproved,1);
  assert.equal(result.unresolved,1,'A required PP sample must not auto-approve');
  assert.equal(result.statuses[0].status,'approved');
  assert.equal(result.statuses[1].status,'needs-information');
  assert.equal(JSON.stringify(demo),original,'Domain calculations must not mutate documents.');
  const rejected=E.copy(demo);rejected.rounds.pop();rejected.decisions.pop();
  rejected.revisionRequests=[];assert.equal(E.status(rejected,'CAT-FIT').status,'rejected');
  const resubmitted=E.copy(demo);
  assert.equal(resubmitted.decisions[0].status,'rejected');
  assert.equal(E.status(resubmitted,'CAT-FIT').status,'approved');
  resubmitted.header.currentTechRevision='SPEC-V2';
  resubmitted.header.currentTechSource='SYNTHETIC TECH PACK REVISION V2';
  result=E.summarize(resubmitted,'2026-10-20');
  assert.equal(result.statuses[0].status,'stale-review');
  assert.equal(result.stale,1);
  assert.equal(result.buyerApproved,0);
  assert.equal(result.statuses[0].overdue,true);
  assert.equal(result.statuses[1].overdue,null,'Unknown due date must not become overdue.');
  const unknownCalendar=E.copy(resubmitted);
  unknownCalendar.rounds[1].calendarSource='';
  assert(!E.validate(unknownCalendar).ok,'Due date without buyer calendar must be held.');
  assert.equal(E.status(unknownCalendar,'CAT-FIT','2026-10-21').overdue,null);
  const fakeFactory=E.copy(demo);fakeFactory.decisions.at(-1).party='factory';
  assert.equal(E.status(fakeFactory,'CAT-FIT').status,'needs-information',
   'Factory may not self-approve buyer sample.');
  const missingActor=E.copy(demo);missingActor.decisions.at(-1).authority='';
  assert(!E.validate(missingActor).ok,'Buyer approval needs actual authority provenance.');
  assert.equal(E.status(missingActor,'CAT-FIT').status,'needs-information');
  const duplicate=E.copy(demo);duplicate.rounds[1].round=1;
  assert(!E.validate(duplicate).ok,'Round numbers unique per category.');
  const duplicateCat=E.copy(demo);duplicateCat.categories[1].name='fit sample';
  assert(!E.validate(duplicateCat).ok,'Buyer category name unique within request.');
  const issue=E.copy(demo);issue.revisionRequests[0].nextRoundId='R1';
  assert(!E.validate(issue).ok,'Revision may link only forward to later round.');
  const wrongReceipt=E.copy(demo);wrongReceipt.rounds[1].receivedDate='2026-10-01';
  assert(!E.validate(wrongReceipt).ok,'Buyer receipt before dispatch rejected.');
  const manual=E.create({buyer:'BUYER SOURCE',poNo:'PO-ONE',style:'STYLE ONE',
   factory:'FACTORY ONE',requirementsSource:'SIGNED BUYER CATEGORY MATRIX'});
  assert(E.validate(manual).ok);
  assert.equal(E.summarize(manual).buyerApproved,0);
  assert.throws(()=>E.reviewedReference(manual,{verifiedBy:'User',verifiedAt:'2026-10-17'}),/review/);
  const reference=E.reviewedReference(demo,{verifiedBy:'Local tester',verifiedAt:'2026-10-17',checked:true},'2026-10-17');
  assert.equal(reference.recordType,'SamplingApprovalRegister');
  assert.equal(reference.displaySnapshot.notPPMGo,true);
  assert.equal(reference.displaySnapshot.categories[0].status,'approved');
  assert.equal(reference.displaySnapshot.categories[1].status,'needs-information');
  const store=new S('synthetic@vesa.test'),saved=E.copy(demo);saved.mode='local';
  store.save(saved);assert.equal(store.load(saved.id).rounds.length,2);
  const previous=memory.get(store.key),portable=S.encode(saved);
  assert.deepEqual(JSON.parse(JSON.stringify(S.decode(portable))),saved);
  assert.throws(()=>S.decode(portable.replace('SPEC-V1','SPEC-ATTACK')),/altered/);
  assert.throws(()=>S.decode('{}'),/unsupported/);
  assert.equal(memory.get(store.key),previous);
  const old=E.copy(saved);old.version='UNRELATED';
  assert.throws(()=>store.save(old),/Unsupported/);
  assert.equal(memory.get(store.key),previous);
  const data=R.rows(saved,E.summarize(saved,'2026-10-17'));
  assert.deepEqual(Object.keys(data),['Request Summary','Buyer Categories','Submission Tracker',
   'Approval Comments','Revision Overdue','Revision Requests','Evidence Register','Manual Cross-App Refs']);
  assert.equal(data['Submission Tracker'][1][5],2);
  assert.equal(R.excelRows('Buyer Categories',[['Category'],['=HYPERLINK("bad")']])[1][0],
    '\'=HYPERLINK("bad")');
  assert(R.html({...saved,header:{...saved.header,style:'<script>alert(1)</script>'}},
    E.summarize(saved)).includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  console.log('SAMPLING-360 DOMAIN PASS: sourced category and round histories, rejection/resubmit, stale revisions, buyer-only approvals, overdue calendar guard, copy integrity, source report and Excel injection defenses.');
 }
}
SamplingDomainTest.run();
