/**
 * R02 Buyer TNA data-minimization contract proof.
 * Synthetic garment records only. No real buyer, cloud access, emails or
 * authority assertions; exported JSON and every XLSX sheet are audited.
 * Run: node apps/tna/tests/r02-buyer-milestones.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaBuyerMilestoneDisclosureProof {
  /** Populate commercial and internal sentinels that must never cross R02. */
  static fixture(templateId='knit'){
    const plan=domain.createPlan({
      templateId,buyerName:'Synthetic Buyer',factoryName:'PRIVATE_FACTORY_NAME',
      styleNo:'BUYER-R02',poNumber:'PO-R02',totalQty:2400,
      orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2026-12-20'
    },{ownerUserId:'PRIVATE_USER_EMAIL'});
    plan.order.commercialNotes='PRIVATE_FOB_USD_SECRET';
    plan.order.vendor='PRIVATE_AGENT';
    plan.order.sourcingAgent='PRIVATE_COMMISSION';
    plan.order.currency='PRIVATE_CURRENCY';
    plan.order.fabricSpec='PRIVATE_FABRIC_PRICE';
    plan.order.totalQty=2400;

    plan.validation.warnings.push('PRIVATE_FACTORY_RISK');
    plan.suppliers.push({supplierName:'PRIVATE_SUPPLIER'});
    plan.materials.push({fabricPrice:'PRIVATE_MATERIAL_PRICE'});
    plan.evidenceReferences.push({externalReference:'PRIVATE_EVIDENCE_KEY'});
    plan.revisionEvents.push({details:{reason:'PRIVATE_FOLLOWUP_TEXT'}});
    plan.approvals.push({partyRequiredToApprove:'PRIVATE_APPROVAL_AUTHORITY',evidenceRef:'PRIVATE_APPROVAL_PROOF'});
    const byRef=ref=>plan.tasks.find(task=>task.templateRef===ref);
    assert(byRef('D08')&&byRef('D14')&&byRef('S04'),'Synthetic garment fixture lacks buyer milestones.');
    byRef('D08').dates.currentTargetFinish='2026-11-15';
    byRef('D08').dates.forecastFinish='2026-11-20';
    byRef('D08').ownerParty='PRIVATE_FACTORY_OWNER';
    byRef('D08').title='PRIVATE_TASK_TITLE';
    byRef('D08').delayReason='PRIVATE_BUYER_DELAY_REASON';
    byRef('D08').proofRefs.push('PRIVATE_EVIDENCE_ID');
    byRef('D14').dates.currentTargetFinish='2026-11-23';
    byRef('D14').status='awaiting-approval';
    byRef('S04').dates.currentTargetFinish='2026-12-17';
    byRef('S04').dates.forecastFinish='2026-12-22';
    byRef('S04').status='completed';
    byRef('S04').dates.actualFinish='2026-12-19';
    const frozen=domain.freezeBaseline(plan,{actorId:'PRIVATE_ACTOR',reason:'PRIVATE_BASELINE_REASON'});
    assert(frozen.ok,'Synthetic baseline must validate.');
    const current=frozen.plan;
    current.unknownFields=['PRIVATE_UNKNOWN_FIELDS'];
    const fit=current.tasks.find(task=>task.templateRef==='D08');
    fit.dates.currentTargetFinish='2026-11-18';
    fit.dates.forecastFinish='2026-11-23';
    fit.status='approved';
    fit.proofRefs.push('PRIVATE_APPROVAL_EVIDENCE');
    return current;
  }

  /** Confirm only stable public refs and source dates reach JSON and Excel. */
  static run(){
    const secrets=[
      'PRIVATE_FACTORY_NAME','PRIVATE_FOB_USD_SECRET','PRIVATE_AGENT',
      'PRIVATE_COMMISSION','PRIVATE_CURRENCY','PRIVATE_FABRIC_PRICE',
      'PRIVATE_USER_EMAIL','PRIVATE_UNKNOWN_FIELDS','PRIVATE_FACTORY_RISK',
      'PRIVATE_SUPPLIER','PRIVATE_MATERIAL_PRICE','PRIVATE_EVIDENCE_KEY',
      'PRIVATE_FOLLOWUP_TEXT','PRIVATE_APPROVAL_AUTHORITY','PRIVATE_APPROVAL_PROOF',
      'PRIVATE_FACTORY_OWNER','PRIVATE_TASK_TITLE','PRIVATE_BUYER_DELAY_REASON',
      'PRIVATE_EVIDENCE_ID','PRIVATE_BASELINE_REASON','PRIVATE_ACTOR','PRIVATE_APPROVAL_EVIDENCE'
    ];
    for(const garment of ['knit','woven']){
      const plan=this.fixture(garment),before=JSON.stringify(plan);
      const opts={reportId:'R02',language:'en',generatedAt:'2026-10-15T06:30:00.000Z',timezone:'Asia/Dhaka'};
      const model=reports.buildReportModel(plan,opts),buyer=model.buyerTna;
      assert.equal(model.schema,'VESA-TNA-REPORT-1');
      assert.equal(model.reportId,'R02');
      assert.equal(buyer.schema,'VESA-TNA-BUYER-1');
      assert.equal(buyer.audience,'buyer-preview-needs-recipient-review');
      assert.equal(model.source.recordId,null,'Buyer JSON must not reveal private local UUID.');
      assert.equal(model.order.factory,buyer.labels.notShared,'Buyer output must exclude source factory name.');
      assert.equal(model.order.buyer,'Synthetic Buyer');
      assert.equal(model.order.style,'BUYER-R02');
      assert.equal(model.order.po,'PO-R02');
      assert.equal(model.order.quantity,2400);
      assert.equal(buyer.labels.missingLegend.includes('date is not entered'),true,'Buyer print must explain compact missing dates.');
      assert.equal(model.order.requiredExFactory,'2026-12-20');
      assert.equal(buyer.forecastExFactory,'2026-12-22');
      assert.equal(buyer.actualExFactory,'2026-12-19');
      assert.equal(buyer.verifiedTarget,null,'Signed buyer target cannot be inferred from an internal baseline.');
      assert.equal(buyer.targetVerification,buyer.labels.unverified);
      assert(buyer.rows.length>10&&buyer.rows.length<plan.tasks.length,'Report must show only allowlisted public milestones.');
      const refs=new Set(buyer.rows.map(row=>row.ref));
      for(const unwanted of ['O03','O09','FP03','FP04','TR06','TR07','FP15','PPM','CUSTOM-O']){
        assert(!refs.has(unwanted),'Internal commercial milestone must be excluded: '+unwanted);
      }
      for(const item of buyer.rows){
        assert(item.title&&item.ref&&item.targetVerification===buyer.labels.shortVerification);
        assert(!Object.prototype.hasOwnProperty.call(item,'proofRefs'),'No raw proof IDs allowed.');
        assert(!Object.prototype.hasOwnProperty.call(item,'ownerParty'),'No raw internal party names allowed.');
      }
      const fit=buyer.rows.find(row=>row.ref==='D08');
      assert.equal(fit.original,'2026-11-15','First baseline snapshot must remain distinct.');
      assert.equal(fit.target,'2026-11-18','Changed current target must remain distinct.');
      assert.equal(fit.forecast,'2026-11-23','Only a real entered forecast may display.');
      assert.equal(fit.actual,null,'Approval cannot create an actual finish date.');
      assert(fit.explanation.includes('5 calendar days'));
      assert(fit.statusLabel.includes('locally')&&fit.targetVerification===buyer.labels.shortVerification,
        'Recorded local approval cannot be called externally verified.');
      const pending=buyer.requiredActions.find(row=>row.ref==='D14');
      assert(pending&&pending.action===buyer.labels.requested,'Pending buyer review must be clearly conditional.');
      const prepared=JSON.stringify(model);
      for(const token of secrets)assert(!prepared.includes(token),'Restricted field leaked to R02 JSON: '+token);
      assert.equal(JSON.stringify(plan),before,'Buyer report must never mutate raw saved plan.');
      const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true});
      assert.deepEqual(workbook.SheetNames,
        ['Report Summary','Order Summary','Report Activities','Report Notes','Buyer Milestones'],
        'Buyer-safe writer retains common sheet names and adds one explicit buyer sheet.');
      const rows=XLSX.utils.sheet_to_json(workbook.Sheets['Buyer Milestones'],{header:1,raw:false});
      assert.equal(rows.length,buyer.rows.length+1);
      assert.equal(rows[0][0],'Ref');
      assert.equal(rows[0][9],'Target verification');
      const index=buyer.rows.findIndex(row=>row.ref==='D08')+2;
      const cells=workbook.Sheets['Buyer Milestones'];
      assert.equal(cells['C'+index].t,'n','Recorded original dates must be actual Excel dates.');
      assert.equal(cells['D'+index].t,'n');
      assert.equal(cells['E'+index].t,'n');
      assert.equal(cells['C'+index].z,'yyyy-mm-dd');
      assert.equal(cells['D'+index].z,'yyyy-mm-dd');
      assert.equal(cells['E'+index].z,'yyyy-mm-dd');
      assert(cells['!autofilter']?.ref,'Buyer Milestones sheet must be filterable.');
      assert.equal(workbook.Sheets['Order Summary'].D2.t,'n','Buyer quantity must remain numeric.');
      assert.equal(workbook.Sheets['Order Summary'].F2.t,'n','Required ex-factory must be a typed Excel date.');
      for(const [name,sheet] of Object.entries(workbook.Sheets)){
        const serialized=JSON.stringify(sheet);
        for(const token of secrets)assert(!serialized.includes(token),'Restricted field leaked to R02 worksheet '+name+': '+token);
      }
      for(const language of ['en','bn','hi','ta']){
        const localized=reports.buildReportModel(plan,{...opts,language});
        assert.equal(localized.buyerTna.rows.length,buyer.rows.length,language+': milestone set must remain stable.');
        assert.equal(localized.buyerTna.labels.cols.length,10);
        assert.equal(localized.buyerTna.verifiedTarget,null);
        assert.equal(localized.buyerTna.order.style,'BUYER-R02');
        assert.notEqual(localized.buyerTna.rows[0].title,'PRIVATE_TASK_TITLE');
        assert(!secrets.some(token=>JSON.stringify(localized).includes(token)));
      }
      const raw=reports.buildReportModel(plan,{reportId:'R01'});
      assert.equal(raw.tasks.length,plan.tasks.length,'R01 Master TNA must remain unfiltered.');
      assert(!raw.buyerTna,'Non-buyer reports must not gain the R02 projection.');
      assert.equal(JSON.stringify(plan),before);
    }
    const hostile=this.fixture('knit');
    hostile.order.buyerName=' =HYPERLINK("http://untrusted.test","BUYER")';
    hostile.order.styles[0].styleNo='  +SUM(1,2)';
    hostile.order.poNumbers[0]='@SUM(2,2)';
    const attack=reports.buildReportModel(hostile,{reportId:'R02'});
    const sheet=XLSX.read(storage.exportReportWorkbook(attack),{type:'buffer'}).Sheets['Order Summary'];
    for(const key of ['A2','B2','C2']){
      assert(sheet[key].t==='s'&&sheet[key].v.trimStart().startsWith("'"),
        'Buyer-entered spreadsheet text must be inert even with leading whitespace: '+key);
    }
    const bad=this.fixture('knit');bad.commitments.buyerRequiredExFactory='2026-02-30';
    bad.tasks.find(item=>item.templateRef==='S04').dates.forecastFinish=null;
    const unknown=reports.buildReportModel(bad,{reportId:'R02'}).buyerTna;
    assert.equal(unknown.verifiedTarget,null);
    assert.equal(unknown.order.requiredExFactory,unknown.labels.unknown);
    assert.equal(unknown.forecastExFactory,null);
    assert(unknown.warnings.includes(unknown.labels.gapTarget)&&unknown.warnings.includes(unknown.labels.gapForecast));
    console.log('TNA R02 buyer-safe milestones PASS: allowlist, no internal leakage, recorded vs verified dates, Excel, four languages, formula defense.');
  }
}
TnaBuyerMilestoneDisclosureProof.run();
