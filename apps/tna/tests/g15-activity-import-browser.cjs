/**
 * GMR-04B real Chromium E2E. The activity table count is scoped separately
 * from the new GMR-04C reviewed predecessor detail grid. Bundled XLSX and
 * authenticated local browser. Only synthetic garment-business test inputs.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const XLSX=require('../vendor/xlsx.full.min.js');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const schedule=require('../src/scheduling.js');
const root=path.resolve(__dirname,'../../..');
const user={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function book(){
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
    ['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory'],
    ['GMR15 BUYER','GMR15 FACTORY','GMR15-KNIT','GMR15-PO',2500,'2026-12-25']
  ]),'Orders');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
    ['Activity Ref','Activity','Owner','Waiting For','Planned Start','Planned Finish',
      'Revised Finish','Actual Finish','Duration','Status','Evidence','Authorizing Party',
      'Source Document','Predecessors','Remarks'],
    ['O01','Enquiry / inquiry received','merchant','','2026-10-05','2026-10-06',
      '','2026-10-06',0,'completed','ENQUIRY-EVIDENCE','','','','Received'],
    ['O02','Costing & consumption confirmation','commercial','','2026-10-07','2026-10-09',
      '','',2,'in-progress','','','','O01','Review costing'],
    ['D05','Fit sample submit','sample-room','buyer','2026-10-10','2026-10-12',
      '2026-10-15','',0,'awaiting-approval','','buyer','SOURCE-REVISED-15','O02','Local office follow-up']
  ]),'Activities');
  return Buffer.from(XLSX.write(wb,{type:'buffer',bookType:'xlsx'}));
}
async function run(){
  const server=http.createServer((req,res)=>{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    try{
      if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
        '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json'}[path.extname(file)]||'application/octet-stream';
      res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),user);
  const page=await context.newPage(),errors=[],outside=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('request',req=>{if(!req.url().startsWith(base))outside.push(req.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.vesa-workspace').count(),1);
    await page.locator('[data-vesa-menu=File]').click();
    await page.locator('[data-menu-action="Import Excel TNA"]').click();
    await page.locator('#tnaWorkbookFile').setInputFiles({
      name:'gmr15-actual-knit.xlsx',
      mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer:book()
    });
    await page.locator('[data-import-preview=file]').click();
    await page.locator('#tnaWorkbookMapping').waitFor({state:'visible'});
    assert.equal(await page.locator('[name=sheetName]').inputValue(),'Orders');
    await page.locator('[name=templateId]').selectOption('knit');
    await page.locator('[name=includeActivities]').check();
    assert.equal(await page.locator('[name=activitySheetName]').inputValue(),'Activities','review suggests actual activities tab');
    assert.equal(await page.locator('[name=activityHeaderRow]').inputValue(),'1');
    assert.equal(await page.locator('[name="activity-map-activityRef"]').inputValue(),'0');
    assert.equal(await page.locator('[name="activity-map-predecessors"]').inputValue(),'13');
    await page.locator('[name=fsZeroConfirmed]').check();
    await page.locator('#tnaWorkbookMapping button[type=submit]').click();
    assert.equal(await page.locator('#tnaWorkbookDecision [data-activity-bind-line]').count(),0,'all source refs matched');
    assert.equal(await page.locator('#tnaWorkbookDecision section[aria-label="Reviewed Excel activities"] .tna-import-row-preview').first().locator('tbody tr').count(),3,
      'count the activity grid only; the separate reviewed predecessor grid is expected');
    assert.match(await page.locator('#tnaWorkbookDecision').innerText(),/2 FS\/0 links/);
    assert.equal(await page.locator('#tnaWorkbookActivityConsent').count(),1);
    assert.equal(await page.locator('#tnaWorkbookDuplicateConsent').count(),0);
    assert.equal(await page.locator('#tnaWorkbookConfirm').count(),1);
    await page.locator('#tnaWorkbookConfirm').click();
    assert.match(await page.locator('#tnaImportReviewFeedback').innerText(),/check the confirmation/);
    assert.equal(await page.locator('#tnaMerchSheet').count(),0,'review cannot create a phantom draft');
    await page.locator('#tnaWorkbookConsent').check();
    await page.locator('#tnaWorkbookConfirm').click();
    assert.match(await page.locator('#tnaImportReviewFeedback').innerText(),/activity and dependency review/);
    await page.locator('#tnaWorkbookActivityConsent').check();
    await page.locator('#tnaWorkbookConfirm').click();
    await page.locator('#tnaMerchSheet').waitFor({state:'visible'});
    assert.match(await page.locator('#tnaDialog').innerText(),/Reviewed Excel activities/);
    const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records);
    assert.equal(records.length,1);
    const plan=records[0].plan;
    assert.equal(plan.order.styles[0].styleNo,'GMR15-KNIT');
    assert.equal(plan.recordStatus,'draft');
    assert.equal(plan.revision,0);
    assert.equal(plan.baselineSnapshots.length,0);
    assert.equal(plan.edges.length,2);
    assert.equal(schedule.validateGraph(plan.tasks,plan.edges).ok,true);
    assert.equal(domain.validatePlan(plan).ok,true);
    assert.equal(plan.tasks.find(x=>x.templateRef==='O01').dates.actualFinish,'2026-10-06');
    assert.equal(plan.tasks.find(x=>x.templateRef==='O01').status,'completed');
    assert.equal(plan.tasks.find(x=>x.templateRef==='D05').dates.currentTargetFinish,'2026-10-15');
    assert.equal(plan.tasks.find(x=>x.templateRef==='D05').waitingFor,'buyer');
    assert.equal(plan.auditEvents.at(-1).eventType,'reviewed-workbook-activities-new-draft');
    assert.equal(plan.auditEvents.at(-1).details.edgeCount,2);
    assert.equal(plan.auditEvents.at(-2).details.skippedActivities,false);
    assert.deepEqual(storage.importCopy(storage.exportCopy(plan)),plan);
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action=continue]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    assert.match(await page.locator('#tnaMerchSheet').innerText(),/GMR15-KNIT/);
    assert.match(await page.locator('#tnaMerchSheet').innerText(),/2026-10-15/);
    await page.setViewportSize({width:390,height:844});
    const sizing=await page.evaluate(()=>({w:innerWidth,body:document.body.scrollWidth,doc:document.documentElement.scrollWidth}));
    assert.ok(sizing.body<=sizing.w+2&&sizing.doc<=sizing.w+2,'TNA remains mobile width-safe');
    assert.deepEqual(errors,[],'browser did not throw JS exceptions');
    assert.deepEqual(outside,[],'no off-origin requests during import');
    console.log('TNA GMR-04B browser PASS: genuine knit Excel activities, FS edges, protected new draft, save/reopen/mobile');
  }finally{
    await context.close();await browser.close();await new Promise(r=>server.close(r));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
