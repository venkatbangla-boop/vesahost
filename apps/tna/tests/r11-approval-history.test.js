/**
 * R11 source-only approval history, as-of decision evidence, review rounds,
 * recorded revision events, PPM/AQL independence and typed/fail-closed export.
 * Synthetic knit & denim plans; never use real buyer decisions.
 * Run: node apps/tna/tests/r11-approval-history.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
globalThis.VesaTnaDomain=domain;
globalThis.VesaTnaOperations=require('../src/operations.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaApprovalHistoryProof {
  /** Reviewed source fields are mere saved claims, not external authentication. */
  static fixture(templateId){
    const plan=domain.createPlan({
      templateId,buyerName:'SYNTHETIC BUYER',factoryName:'PRIVATE FACTORY R11',
      styleNo:'R11-STYLE',poNumber:'R11-PO',totalQty:1000,
      orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-11-30'
    },{ownerUserId:'r11-synthetic'});
    const ref=plan.tasks[0].taskId;
    plan.approvals=[
      {approvalId:'R11-FIT',itemName:'=HYPERLINK("sneaky")',
        revision:2,partyRequiredToApprove:'Mexico Buyer',
        authorizedReviewerId:'buyer-reviewer-1',decidedBy:'buyer-reviewer-1',
        delegatedLocalOfficeAllowed:false,submittedDate:'2026-10-11',
        receivedDate:'2026-10-12',decisionDate:'2026-10-14',
        responseStatus:'approved',evidenceRef:'=DANGEROUS_EVIDENCE',
        requiredForTaskIds:[ref],
        returnComments:'PRIVATE RECOMMENDATION',
        resubmissionSequence:[
          {submittedDate:'2026-10-02',receivedDate:'2026-10-03',
            decisionDate:'2026-10-04',responseStatus:'rejected',
            decidedBy:'buyer-reviewer-1',returnComments:'First rejection'},
          {submittedDate:'2026-10-06',receivedDate:'2026-10-07',
            decisionDate:'2026-10-08',responseStatus:'rejected',
            decidedBy:'buyer-reviewer-1',returnComments:'Second rejection'}
        ]},
      {approvalId:'R11-WAIVE',itemName:'Local office PP waiver',
        revision:1,partyRequiredToApprove:'Mexico Buyer',
        authorizedReviewerId:'reviewer-2',decidedBy:'local-delegate',
        delegatedLocalOfficeAllowed:true,submittedDate:'2026-10-11',
        decisionDate:'2026-10-15',responseStatus:'waived',
        waiverReason:'Written waiver accepted locally, EXTERNAL CLAIM UNVERIFIED',
        evidenceRef:'evidence-waiver',requiredForTaskIds:[plan.tasks[1].taskId],
        resubmissionSequence:[]},
      {approvalId:'R11-NO-PROOF',itemName:'Lab dip',
        revision:0,partyRequiredToApprove:'Buyer',
        authorizedReviewerId:'buyer-reviewer-3',decidedBy:'buyer-reviewer-3',
        submittedDate:'2026-10-07',decisionDate:'2026-10-12',
        responseStatus:'approved',evidenceRef:null,resubmissionSequence:[]},
      {approvalId:'R11-FUTURE',itemName:'Label artwork',
        revision:3,partyRequiredToApprove:'Buyer',
        authorizedReviewerId:'buyer-4',decidedBy:'buyer-4',
        submittedDate:'2026-10-15',decisionDate:'2026-10-21',
        responseStatus:'approved',evidenceRef:'future-proof',
        resubmissionSequence:[]},
      {approvalId:'R11-PENDING',itemName:'=2+2',
        revision:1,submittedDate:'2026-10-15',
        responseStatus:'submitted',resubmissionSequence:[]},
      {approvalId:'R11-MISMATCH',itemName:'=DANGEROUS-WASH',
        revision:1,partyRequiredToApprove:'Buyer',
        authorizedReviewerId:'reviewer-5',decidedBy:'different-person',
        submittedDate:'2026-10-12',decisionDate:'2026-10-15',
        responseStatus:'approved',evidenceRef:'evidence-5',resubmissionSequence:[]}
    ];
    plan.revisionEvents.push(
      {eventId:'REV-R11-1',eventType:'approval-submitted',revision:2,
        actorId:'agent-source',createdAt:'2026-10-12T06:00:00Z',
        reason:'=HYPERLINK("bad-reason")',details:{approvalId:'R11-FIT'}},
      {eventId:'REV-R11-2',eventType:'task-status-changed',revision:2,
        actorId:'local-factory',createdAt:'2026-10-15T09:00:00Z',
        details:{taskId:ref,nextStatus:'approved',reason:'Task entry only'}},
      {eventId:'REV-R11-3',eventType:'shipment-lot-recorded',revision:2,
        actorId:'shipping',createdAt:'2026-10-15T09:00:00Z'}
    );
    plan.order.commercialNotes='VERY PRIVATE FOB COMMISSION';
    return plan;
  }
  static run(){
    for(const templateId of ['knit','denim']){
      const plan=this.fixture(templateId),source=JSON.stringify(plan);
      const opts={reportId:'R11',language:'en',generatedAt:'2026-10-16T05:00:00Z',
        timezone:'Asia/Dhaka',asOfDate:'2026-10-16'};
      const model=reports.buildReportModel(plan,opts),ap=model.approvalHistory;
      assert.equal(ap.schema,'VESA-TNA-APPROVAL-HISTORY-1');
      assert.equal(ap.validity,'valid');
      assert.equal(ap.records.length,6);
      assert.equal(ap.rounds.length,2);
      assert.equal(ap.revisions.length,2,'Only approval-related source revision events.');
      assert.equal(ap.counts.approvalRecords,6);
      assert.equal(ap.counts.sourceRoundEntries,2);
      assert.equal(ap.counts.localApprovalClaims,2);
      assert.equal(ap.counts.externallyVerified,0);
      assert.equal(ap.independentlyApproved,false);
      assert.equal(ap.records[0].recordedResponse,'approved');
      assert.equal(ap.records[0].localConsistency,'approved');
      assert.equal(ap.records[0].asOfStatus,ap.labels.localApproved);
      assert.equal(ap.records[0].externallyVerified,false);
      assert.equal(ap.records[0].linkedTasks[0],plan.tasks[0].templateRef);
      assert.equal(ap.records[0].decisionDate,'2026-10-14');
      assert.equal(ap.rounds[0].recordedResponse,'rejected');
      assert.equal(ap.rounds[0].asOfStatus,ap.labels.localRejected);
      assert.equal(ap.rounds[1].asOfStatus,ap.labels.localRejected);
      assert.equal(ap.rounds[0].sourceEntry,1,'Ordinal is source array position only.');
      assert.equal(ap.rounds[1].sourceEntry,2);
      assert.equal(ap.records[1].asOfStatus,ap.labels.localWaived);
      assert.equal(ap.records[1].delegationClaimRecorded,true);
      assert.equal(ap.records[1].externallyVerified,false);
      assert.equal(ap.records[2].asOfStatus,ap.labels.incomplete,
        'Buyer-approved claim without evidence is incomplete.');
      assert.equal(ap.records[3].asOfStatus,ap.labels.future,
        'Future decision is not an approval as of the report day.');
      assert.equal(ap.records[4].asOfStatus,ap.labels.pending,
        'Submission alone is pending, not approved.');
      assert.equal(ap.records[5].asOfStatus,ap.labels.inconsistent,
        'Non-delegated inconsistent reviewers cannot pass.');
      assert(ap.revisions.some(e=>e.eventType==='task-status-changed'&&
        e.asOfState===ap.labels.notDecision),'Task status never becomes authority.');
      assert.equal(ap.revisions.find(e=>e.eventType==='approval-submitted').externallyVerified,false);
      for(const language of ['en','bn','hi','ta']){
        const translated=reports.buildReportModel(plan,{...opts,language}).approvalHistory;
        assert.equal(translated.records.length,6);
        assert.equal(translated.rounds.length,2);
        assert.equal(translated.revisions.length,2);
        assert.equal(translated.labels.headings.length,14);
        assert.equal(translated.labels.roundHeadings.length,10);
        assert.equal(translated.labels.eventHeadings.length,7);
        assert(translated.labels.localApproved&&translated.labels.noAuthority);
      }
      const empty=reports.buildReportModel({...plan,approvals:[],revisionEvents:[]},opts).approvalHistory;
      assert.equal(empty.validity,'valid');
      assert.equal(empty.records.length,0);
      assert(empty.warnings.includes(empty.labels.empty));
      const noZone=reports.buildReportModel(plan,{...opts,timezone:''}).approvalHistory;
      assert.equal(noZone.validity,'incomplete');
      assert.deepEqual(noZone.records,[]);
      const badDate=reports.buildReportModel(plan,{...opts,asOfDate:'2026-02-30'}).approvalHistory;
      assert.equal(badDate.validity,'incomplete');
      const duplicate=structuredClone(plan);
      duplicate.approvals.push({...duplicate.approvals[0],itemName:'Duplicate approval row'});
      const repeated=reports.buildReportModel(duplicate,opts).approvalHistory;
      assert.equal(repeated.records[0].asOfStatus,repeated.labels.inconsistent);
      assert.equal(repeated.records.at(-1).asOfStatus,repeated.labels.inconsistent);
      assert.equal(repeated.records[0].authorityClaimRecorded,false);
      const missingDate=structuredClone(plan);
      missingDate.approvals[0].decisionDate=null;
      assert.equal(reports.buildReportModel(missingDate,opts).approvalHistory.records[0].asOfStatus,
        ap.labels.incomplete,'Claim without dated decision cannot be approved.');
      const buyer=reports.buildReportModel(plan,{...opts,audienceMode:'buyer'});
      const factory=reports.buildReportModel(plan,{...opts,audienceMode:'factory'});
      for(const external of [buyer,factory]){
        assert.equal(external.approvalHistory.validity,'restricted');
        assert.deepEqual(external.approvalHistory.records,[]);
        assert.deepEqual(external.approvalHistory.rounds,[]);
        assert.deepEqual(external.approvalHistory.revisions,[]);
        assert.deepEqual(external.tasks,[]);
        assert.equal(external.source.recordId,null);
        for(const forbidden of ['SYNTHETIC BUYER','PRIVATE FACTORY R11','R11-STYLE',
          'VERY PRIVATE FOB','R11-FIT','buyer-reviewer-1','=DANGEROUS_EVIDENCE',
          'agent-source','Task entry only']){
          assert(!JSON.stringify(external).includes(forbidden),
            'External source leakage: '+forbidden);
        }
      }
      const xlsx=XLSX.read(storage.exportReportWorkbook(model),
        {type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(xlsx.SheetNames,['Report Summary','Order Summary','Report Activities',
        'Report Notes','Approval Records','Approval Rounds','Approval Revisions']);
      const sheet=xlsx.Sheets['Approval Records'];
      assert.equal(sheet.B2.t,'n');
      assert.equal(sheet.B2.v,2);
      assert.equal(sheet.D2.t,'n');
      assert.equal(sheet.E2.t,'n');
      assert.equal(sheet.F2.t,'n');
      assert.equal(sheet.F2.z,'yyyy-mm-dd');
      assert(sheet.A2.v.startsWith("'"),
        'Formula-looking approval item must be inert text.');
      assert(sheet.K2.v.startsWith("'"),
        'Formula-looking evidence must be inert text.');
      assert.equal(xlsx.Sheets['Approval Rounds'].B2.v,1);
      assert.equal(xlsx.Sheets['Approval Rounds'].C2.t,'n');
      assert.equal(xlsx.Sheets['Approval Revisions'].B2.v,2);
      const e=xlsx.Sheets['Approval Revisions'];
      assert(e.F2.v.startsWith("'"),'Formula-looking revision comment must be inert.');
      for(const worksheet of Object.values(xlsx.Sheets)){
        assert(!Object.values(worksheet).some(cell=>cell?.f),
          'Workbook must have no executed formula cells.');
      }
      const restrictedXlsx=XLSX.read(storage.exportReportWorkbook(buyer),{type:'buffer'});
      assert.deepEqual(restrictedXlsx.SheetNames,xlsx.SheetNames);
      assert.equal(restrictedXlsx.Sheets['Approval Records'].A2.v,
        buyer.approvalHistory.labels.external);
      assert(!JSON.stringify(restrictedXlsx.Sheets).includes('PRIVATE FACTORY R11'));
      assert(!JSON.stringify(restrictedXlsx.Sheets).includes('R11-FIT'));
      const previous=reports.buildReportModel(plan,{...opts,reportId:'R10'});
      assert(!previous.approvalHistory);
      assert.equal(JSON.stringify(plan),source,
        'Approval history/Excel must NEVER mutate source plans or decisions.');
    }
    console.log('TNA R11 PASS: knit/denim 2 rejected rounds, dated local approval/waiver vs independent authority, missing evidence, reviewer mismatch, future/pending, linked revisions, four languages, blocked external JSON/XLSX, typed inert workbook, source immutability.');
  }
}
TnaApprovalHistoryProof.run();
