/**
 * GMR-03 export proof: the R01 garment report/XLSX must agree with the
 * read-only master sheet and never disclose internal LC/notes to R02-R12.
 * Uses the bundled real XLSX reader; desktop Excel human UAT stays pending.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const domain=require('../src/domain.js');
const {TnaMerchandisingSheet}=require('../src/merchandising-sheet.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const base={templateId:'woven',buyerName:'SYNTHETIC BUYER',factoryName:'SYNTHETIC FACTORY',
  styleNo:'WOVEN-GMR03',poNumber:'GMR03-PO',totalQty:2400,buyerRequiredExFactory:'2026-12-23'};
function example(profile){
  let p=domain.createPlan({...base,templateId:profile},{ownerUserId:'qa'});
  p=domain.reviseMerchandisingOrder(p,{fabricWeightGsm:210,masterLcStatus:'opened',
    masterLcOpenedOn:'2026-11-15',masterLcProofRef:'SOURCE-MASTER-LC-15',
    sourceRef:'BANK-REG-15',reason:'Verified synthetic bank advice'}).plan;
  assert.ok(p);
  const first=p.tasks[0];
  const result=domain.reviseMerchandisingTask(p,first.taskId,{
    ownerParty:'merchandising',waitingFor:'buyer',nextStatus:'completed',
    plannedDate:'2026-11-06',revisedDate:'2026-11-10',actualDate:'2026-11-12',
    evidenceRef:'SOURCE-COMPLETION-12',sourceRef:'SOURCE-REVISED-10',authorityParty:'buyer',
    reason:'Sample follow-up and revised planning source checked'
  });
  assert.equal(result.ok,true,result.error);
  return result.plan;
}
test('knit and woven R01 export exactly their complete real task counts and typed business cells',()=>{
  for(const profile of ['knit','woven']){
    const p=example(profile),before=JSON.stringify(p);
    const view=new TnaMerchandisingSheet().snapshot(p,{language:'en'});
    const model=reports.buildReportModel(p,{reportId:'R01',language:'en',
      generatedAt:'2026-10-15T08:00:00.000Z',timezone:'Asia/Dhaka'});
    assert.equal(model.masterSheet.rows.length,p.tasks.length);
    assert.deepEqual(model.masterSheet.rows.map(x=>x.ref),view.rows.map(x=>x.ref));
    assert.equal(model.masterSheet.rows[0].planned,view.rows[0].planned);
    assert.equal(model.masterSheet.rows[0].revised,view.rows[0].revised);
    assert.equal(model.masterSheet.rows[0].actual,view.rows[0].actual);
    assert.equal(model.masterSheet.rows[0].delayDays,2);
    assert.equal(model.masterSheet.order.fabricWeightGsm,210);
    assert.equal(model.masterSheet.order.masterLcStatus,'opened');
    assert.equal(model.masterSheet.order.masterLcProofRef,'SOURCE-MASTER-LC-15');
    const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellStyles:true,cellFormula:true});
    assert.deepEqual(workbook.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Master TNA','Report Notes']);
    const rows=XLSX.utils.sheet_to_json(workbook.Sheets['Master TNA'],{header:1,raw:true});
    assert.equal(rows.length,p.tasks.length+1);
    assert.equal(rows[0].length,13);
    assert.equal(rows[1][0],view.rows[0].stage);
    assert.equal(rows[1][1],view.rows[0].title);
    assert.equal(typeof rows[1][3],'number','baseline date must be genuine Excel serial date');
    assert.equal(typeof rows[1][4],'number','revised date must be genuine Excel serial date');
    assert.equal(typeof rows[1][6],'number','actual date must be genuine Excel serial date');
    assert.equal(rows[1][7],2,'calendar-day delay must be typed numeric');
    assert.equal(rows[1][10],'SOURCE-COMPLETION-12');
    assert.equal(workbook.Sheets['Master TNA']['!autofilter'].ref,workbook.Sheets['Master TNA']['!ref']);
    assert.ok(workbook.Sheets['Master TNA']['!cols'][1].wch>=40);
    const order=XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1,raw:true});
    assert.equal(order[1][4],2400,'quantity is typed number');
    const gsm=order.find(row=>row[0]==='Fabric GSM');
    assert.equal(gsm[1],210,'fabric GSM typed number');
    assert.equal(typeof order.find(row=>row[0]==='Master LC opened')[1],'number',
      'master LC opening must be genuine Excel serial date');
    assert.equal(JSON.stringify(p),before,'building/exporting report never mutates source records');
  }
});
test('approved audience boundaries: R02-R12 omit internal garment/LC master projection',()=>{
  const plan=example('knit');
  for(const {id} of reports.catalogue('en')){
    if(id==='R01')continue;
    if(id==='R04'){
      const notReady=reports.buildReportModel(plan,{reportId:id,language:'en'});
      assert.equal(notReady.criticalPath.ready,false,'R04 cannot manufacture criticality from unreviewed actual source');
      assert.throws(()=>storage.exportReportWorkbook(notReady),/Critical|review|source|CPM|R04/i);
      continue;
    }
    const model=reports.buildReportModel(plan,{reportId:id,language:'en',asOfDate:id==='R03'?'2026-10-15':undefined,...(id==='R05'?{weekStart:'2026-10-12',weekEnd:'2026-10-18',reviewDate:'2026-10-15'}:{}),...(id==='R06'?{asOfDate:'2026-10-15',managementConfirmed:true}:{}),...(id==='R07'?{asOfDate:'2026-10-15',productionAudience:'internal',internalConfirmed:true}:{}),generatedAt:'2026-10-15T08:00:00.000Z'});
    assert.equal(model.masterSheet,null,id+' must not gain internal master sheet');
    assert.ok(!JSON.stringify(model).includes('SOURCE-MASTER-LC-15'));
    const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer'});
    assert.deepEqual(workbook.SheetNames,
      id==='R02'?['Report Summary','Order Summary','Report Activities','Buyer Milestones','Buyer Actions','Report Notes']:
        id==='R03'?['Report Summary','Order Summary','Report Activities','Factory Daily Actions','Missing Action Dates','Report Notes']:
        id==='R05'?['Report Summary','Order Summary','Report Activities','Weekly TNA','Confirmed Recovery','Report Notes']:
        id==='R06'?['Report Summary','Order Summary','Report Activities','Delay Actions','Delay Follow-up','Dependency Links','Recovery Scenarios','Approval Records','Report Notes']:
        id==='R07'?['Report Summary','Order Summary','Report Activities','Production Stages','Production Events','Operation Snapshots','Report Notes']:
        ['Report Summary','Order Summary','Report Activities','Report Notes'],id+' approved audience workbook shape');
  }
});
test('Bengali, Hindi and Tamil report workbook headers localize but never mutate buyer/style or date sources',()=>{
  const plan=example('woven'),original=JSON.stringify(plan);
  for(const language of ['en','bn','hi','ta']){
    const model=reports.buildReportModel(plan,{reportId:'R01',language,generatedAt:'2026-10-15T08:00:00.000Z'});
    const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer'});
    const headers=XLSX.utils.sheet_to_json(workbook.Sheets['Master TNA'],{header:1})[0];
    assert.equal(headers[0],model.masterSheet.labels.stage);
    const orders=XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1});
    assert.ok(orders.flat().includes('SYNTHETIC BUYER'));
  }
  assert.equal(JSON.stringify(plan),original);
});
test('formula-looking buyer/activity/source text, even with leading whitespace, cannot create Excel formulas',()=>{
  const plan=example('knit');
  plan.order.buyerName=' \t=HYPERLINK("https://evil.test","Buyer")';
  plan.tasks[1].title='\n +SUM(1,1)';
  plan.tasks[0].followUpNote=' \n@HYPERLINK()';
  const model=reports.buildReportModel(plan,{reportId:'R01',language:'en'});
  const workbook=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellFormula:true});
  for(const name of workbook.SheetNames){
    for(const [address,cell] of Object.entries(workbook.Sheets[name])){
      if(address[0]==='!')continue;
      assert.equal(cell.f,undefined,name+' '+address+' must not contain executable formula');
    }
  }
  const orderRows=XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1,raw:true});
  assert.ok(String(orderRows[1][0]).startsWith("'"),'dangerous buyer cell is escaped');
  const taskRows=XLSX.utils.sheet_to_json(workbook.Sheets['Master TNA'],{header:1,raw:true});
  assert.ok(String(taskRows[2][1]).startsWith("'"),'dangerous activity is escaped');
  assert.ok(String(taskRows[1][11]).startsWith("'"),'dangerous remarks are escaped');
});
test('legacy optional fields are shown as unknown, not synthetic bank or fabric facts',()=>{
  const p=example('woven');
  delete p.order.fabricWeightGsm;
  delete p.commitments.masterLcStatus;
  delete p.commitments.masterLcOpenedOn;
  delete p.commitments.masterLcProofRef;
  const model=reports.buildReportModel(p,{reportId:'R01',language:'en'});
  assert.equal(model.masterSheet.order.fabricWeightGsm,null);
  assert.equal(model.masterSheet.order.masterLcStatus,null);
  assert.equal(model.masterSheet.order.masterLcOpenedOn,null);
  const rows=XLSX.utils.sheet_to_json(
    XLSX.read(storage.exportReportWorkbook(model),{type:'buffer'}).Sheets['Order Summary'],
    {header:1,raw:false});
  assert.equal(rows.find(row=>row[0]==='Fabric GSM')[1],'Needs Information');
  assert.equal(rows.find(row=>row[0]==='Master LC status')[1],'Needs Information');
});
