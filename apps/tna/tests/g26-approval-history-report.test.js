/**
 * GMR-14 R11: approval chronology, buyer/factory privacy and typed XLSX.
 * Uses synthetic OrderPlans. No approval, saved copy or workflow is written.
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const history=require('../src/approval-history-report.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const secrets=['PRIVATE-REVIEW-AUTHORITY','PRIVATE-FOB-PRICE','PRIVATE-AQL-NUMBER',
 'PRIVATE-FIT-EVIDENCE','PRIVATE-BUYER-REVIEWER','PRIVATE-REJECTION-REMARK',
 'PRIVATE-ACTUAL-ACTOR','PRIVATE-INTERNAL-TITLE','PRIVATE-PAYMENT-LC'];
const review={reportId:'R11',approvalAsOfDate:'2026-10-15',approvalAudience:'buyer',
 approvalBuyerConsent:true,approvalAuthorityRef:secrets[0],
 generatedAt:'2026-10-15T10:00:00Z',timezone:'Asia/Dhaka'};
function fixture(profile='knit'){
 const p=domain.createPlan({templateId:profile,buyerName:'R11 BUYER',factoryName:'R11 FACTORY',
  styleNo:'STYLE-R11',poNumber:'PO-R11',totalQty:100,buyerRequiredExFactory:'2026-11-15'},
  {ownerUserId:'qa'});
 const by=ref=>p.tasks.find(t=>t.templateRef===ref);
 const fit=by('D08'),pp=by('D14'),internal=by('O03'),future=by('D16');
 assert.ok(fit&&pp&&internal&&future);
 fit.title=secrets[7];fit.status='approved';
 pp.status='awaiting-approval';
 internal.title=secrets[8];internal.status='approved';
 p.order.commercialNotes=secrets[1];p.commitments.masterLcProofRef=secrets[8];
 p.approvals=[
  {approvalId:'APR-FIT',itemName:secrets[7],revision:2,
   submittedDate:'2026-10-11',receivedDate:'2026-10-12',
   responseStatus:'approved',decisionDate:'2026-10-14',
   authorizedReviewerId:secrets[4],evidenceRef:secrets[3],
   returnComments:secrets[5],requiredForTaskIds:[fit.taskId],
   resubmissionSequence:[
    {submittedDate:'2026-10-03',receivedDate:'2026-10-04',
     decisionDate:'2026-10-05',responseStatus:'rejected',returnComments:secrets[5]},
    {submittedDate:'2026-10-08',receivedDate:'2026-10-09',
     responseStatus:'submitted',evidenceRef:secrets[3]}
   ]},
  {approvalId:'APR-INTERNAL',itemName:secrets[8],responseStatus:'approved',
   submittedDate:'2026-10-11',decisionDate:'2026-10-12',
   decidedBy:secrets[6],evidenceRef:secrets[2],requiredForTaskIds:[internal.taskId]},
  {approvalId:'APR-PP',itemName:'PP sample decision',responseStatus:'approved',
   submittedDate:'2026-10-12',evidenceRef:secrets[3],requiredForTaskIds:[pp.taskId]},
  {approvalId:'APR-FUTURE',itemName:'Artwork decision',responseStatus:'approved',
   submittedDate:'2026-10-20',decisionDate:'2026-10-22',
   decidedBy:secrets[4],evidenceRef:secrets[3],requiredForTaskIds:[future.taskId]}
 ];
 p.revisionEvents.push(
  {eventId:'EVT1',eventType:'merchandising-task-revised',revision:2,
   actorId:secrets[6],createdAt:'2026-10-12T08:25:00Z',
   details:{taskId:fit.taskId,changes:{status:{before:'awaiting-approval',after:'approved'}},
     reason:secrets[5],sourceRef:secrets[3],authorityParty:secrets[4]}},
  {eventId:'EVT2',eventType:'task-status-changed',revision:3,
   actorId:secrets[6],createdAt:'2026-10-13T08:25:00Z',
   details:{taskId:pp.taskId,nextStatus:'awaiting-approval',reason:secrets[5]}},
  {eventId:'EVT3',eventType:'merchandising-task-revised',revision:4,
   actorId:secrets[6],createdAt:'2026-10-13T08:25:00Z',
   details:{taskId:internal.taskId,changes:{status:{after:'approved'}},reason:secrets[5]}});
 return p;
}
const model=(p,opts={})=>reports.buildReportModel(p,{...review,...opts});
function noSecrets(value){
 const text=typeof value==='string'?value:JSON.stringify(value);
 for(const x of secrets)assert.ok(!text.includes(x),'secret leaked '+x);
}
test('R11 default-deny: missing date/audience/consent/authority, invalid or practice source',()=>{
 const p=fixture(),original=JSON.stringify(p);
 for(const extras of [
  {approvalAsOfDate:''},{approvalAsOfDate:'2026-02-30'},
  {approvalAudience:''},{approvalBuyerConsent:false},
  {approvalAuthorityRef:''},{approvalAudience:'factory'},
  {approvalAudience:'factory',approvalFactoryConsent:false},
  {approvalAudience:'public'}
 ]){
  const m=model(p,extras),r=m.approvalHistory;
  assert.equal(r.ready,false);assert.equal(r.records.length,0);
  assert.equal(r.rounds.length,0);assert.equal(r.revisions.length,0);
  assert.equal(m.tasks.length,0);assert.equal(m.order.buyer,r.labels.missing);
  assert.equal(m.source.recordId,null);noSecrets(m);
  assert.throws(()=>storage.exportReportWorkbook(m),/review|approval|date/i);
 }
 const training={...p,mode:'practice'};
 assert.equal(model(training).approvalHistory.ready,false);
 assert.equal(JSON.stringify(p),original);
});
test('R11 buyer allowlist screens unrelated records and private details, preserves source rounds',()=>{
 for(const profile of ['knit','woven']){
  const p=fixture(profile),original=JSON.stringify(p),m=model(p),h=m.approvalHistory;
  assert.equal(h.ready,true);assert.equal(h.mode,'buyer');
  assert.equal(h.counts.records,2,'buyer only FIT and PP; unrelated and future records excluded');
  assert.equal(h.counts.roundEntries,2,'array entries not fabricated official round numbers');
  assert.deepEqual(h.rounds.map(x=>x.sequencePosition),[1,2]);
  assert.deepEqual(h.rounds.map(x=>x.assessment),[h.labels.rejectedState,h.labels.pendingState]);
  assert.equal(h.records[0].assessment,h.labels.approvedState);
  assert.equal(h.records[0].submitted,'2026-10-11');
  assert.equal(h.records[0].received,'2026-10-12');
  assert.equal(h.records[0].decision,'2026-10-14');
  assert.equal(h.records[1].assessment,h.labels.incomplete,'approved claim missing decision/authority');
  assert.equal(h.records[1].decision,null);
  assert.equal(h.counts.revisions,2);
  assert.ok(h.pending.some(row=>row.ref==='D14'));
  assert.equal(m.order.factory,h.labels.missing);
  assert.equal(m.source.recordId,null);
  assert.ok(!JSON.stringify(h).includes('O03'));
  assert.ok(h.warnings.includes(h.labels.noRoundProof));
  assert.ok(h.warnings.includes(h.labels.noClearance));
  noSecrets(m);assert.equal(JSON.stringify(p),original);
 }
});
test('R11 factory audience requires independent confirmation, includes internal linked records',()=>{
 const p=fixture();
 const denied=model(p,{approvalAudience:'factory',approvalBuyerConsent:true,
  approvalFactoryConsent:false});
 assert.equal(denied.approvalHistory.ready,false,'buyer consent cannot open factory view');
 const h=model(p,{approvalAudience:'factory',approvalBuyerConsent:false,
  approvalFactoryConsent:true}).approvalHistory;
 assert.equal(h.ready,true);assert.equal(h.counts.records,3);
 assert.ok(h.records.some(row=>row.refs.includes('O03')));
 assert.ok(h.revisions.some(row=>row.ref==='O03'));
 assert.ok(h.warnings.includes(h.labels.noPrivacy));
 noSecrets(h);
});
test('R11 invalid, future, undated, waived-without-authority decisions do not turn into approval',()=>{
 const p=fixture(),r=p.approvals[0];
 const bad=[{decisionDate:'2026-10-22'},
   {decisionDate:'2026-02-30'},
   {decisionDate:null},
   {submittedDate:'2026-10-15',decisionDate:'2026-10-14'},
   {evidenceRef:''},
   {authorizedReviewerId:''},
   {responseStatus:'waived',waiverReason:'PRIVATE-WAIVER',authorizedReviewerId:''}
 ];
 for(const delta of bad){
  const q=JSON.parse(JSON.stringify(p));Object.assign(q.approvals[0],delta);
  const h=model(q).approvalHistory;
  assert.notEqual(h.records[0].assessment,h.labels.approvedState,JSON.stringify(delta));
 }
 const future=p.approvals[3];
 assert.ok(future.submittedDate>'2026-10-15');
 assert.equal(model(p).approvalHistory.records.some(x=>x.refs.includes('D16')),false);
});
test('R11 typed workbook sections never export proof, raw task/comment/reviewer or finance',()=>{
 const p=fixture(),old=JSON.stringify(p),m=model(p),buf=storage.exportReportWorkbook(m);
 assert.deepEqual([...buf.subarray(0,2)],[80,75]);
 const book=XLSX.read(buf,{type:'buffer'});
 assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
  'Approval Decisions','Resubmission Entries','Recorded Task Revisions','Pending Approvals','Report Notes']);
 const rows=XLSX.utils.sheet_to_json(book.Sheets['Approval Decisions'],{header:1,raw:true});
 assert.equal(rows.length,3);
 assert.equal(typeof rows[1][3],'number');assert.equal(typeof rows[1][5],'number');
 assert.equal(rows[2][5],'Needs Information');
 const rounds=XLSX.utils.sheet_to_json(book.Sheets['Resubmission Entries'],{header:1,raw:true});
 assert.equal(rounds[1][1],1);assert.equal(rounds[2][1],2);
 const audit=XLSX.utils.sheet_to_json(book.Sheets['Recorded Task Revisions'],{header:1,raw:true});
 assert.equal(typeof audit[1][3],'number');
 const cells=Object.values(book.Sheets).flatMap(s=>Object.entries(s)
  .filter(([key])=>!key.startsWith('!')).map(([,v])=>v.v));
 noSecrets(cells);noSecrets(m);assert.equal(JSON.stringify(p),old);
});
test('R11 all four locales, R01–R10 and R12 isolation, saved copy preservation',()=>{
 const p=fixture();
 const names=new Set(),original=JSON.stringify(p);
 for(const language of ['en','bn','hi','ta']){
  const report=model(p,{language});
  assert.equal(report.approvalHistory.ready,true);
  assert.ok(report.approvalHistory.labels.selectReview.length>10);
  names.add(report.approvalHistory.labels.title);
  noSecrets(report);
 }
 assert.equal(names.size,4);
 for(const id of ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R12']){
  const m=reports.buildReportModel(p,{reportId:id});
  assert.equal(m.approvalHistory,undefined);
 }
 const old=domain.createPlan({templateId:'woven',buyerName:'OLD BUYER',factoryName:'OLD FACTORY',
  styleNo:'OLD STYLE',poNumber:'OLD-PO',totalQty:100});
 assert.deepEqual(storage.importCopy(storage.exportCopy(old)),old);
 assert.equal(JSON.stringify(p),original);
});
