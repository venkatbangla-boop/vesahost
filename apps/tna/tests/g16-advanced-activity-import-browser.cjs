/**
 * GMR-04C real Chromium: select custom activity from actual local XLSX,
 * accept individually sourced SS/FF/SF signed-lag dependencies, save & reopen.
 * Uses actual repository checkout and synthetic local records only.
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
const scheduler=require('../src/scheduling.js');
const root=path.resolve(__dirname,'../../..');
const user={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function makeWorkbook(){
 const book=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([
  ['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory'],
  ['GMR16 BUYER','GMR16 FACTORY','WOVEN-GMR16','GMR16-PO',1800,'2026-12-25']
 ]),'Orders');
 XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([
  ['Activity Ref','Activity','Owner','Planned Start','Planned Finish','Duration',
    'Status','Predecessors','Stage','Task Kind'],
  ['O01','Enquiry / inquiry received','merchant','2026-10-01','2026-10-02',0,'in-progress','','',''],
  ['O02','Costing & consumption confirmation','merchant','2026-10-03','2026-10-05',2,'in-progress',
    'O01|SS|2|working','',''],
  ['LOCAL-CHECK','Buyer-nominated fabric review','quality','2026-10-06','2026-10-08',1,'in-progress',
    'O02|FF|1|calendar','FA','milestone'],
  ['D05','Fit sample submit','sample-room','2026-10-09','2026-10-11',0,'not-started',
    'LOCAL-CHECK|SF|-1|working','','']
 ]),'Activities');
 return Buffer.from(XLSX.write(book,{type:'buffer',bookType:'xlsx'}));
}
async function run(){
 const old=domain.createPlan({templateId:'woven',buyerName:'OLDER BUYER',factoryName:'OLD FACTORY',
  styleNo:'OLD-SAFE',poNumber:'OLD-PO',totalQty:1000,buyerRequiredExFactory:'2026-11-30'},
  {ownerUserId:user.userKey});
 const oldJson=JSON.stringify(old);
 const stored={storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:old.recordId,updatedAt:'2026-10-14T00:00:00.000Z',buyer:old.order.buyerName,
  style:'OLD-SAFE',po:'OLD-PO',plan:old
 }]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
     '.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
   args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:860}});
 await context.addInitScript(({auth,records})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(auth));
  if(!localStorage.getItem('vesa.tna360.records.'+auth.userKey))
   localStorage.setItem('vesa.tna360.records.'+auth.userKey,JSON.stringify(records));
 },{auth:user,records:stored});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-vesa-menu=File]').click();
  await page.locator('[data-menu-action="Import Excel TNA"]').click();
  await page.locator('#tnaWorkbookFile').setInputFiles({
   name:'gmr16-woven.xlsm.xlsx',
   mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   buffer:makeWorkbook()
  });
  await page.locator('[data-import-preview=file]').click();
  await page.locator('#tnaWorkbookMapping').waitFor({state:'visible'});
  await page.locator('[name=templateId]').selectOption('woven');
  await page.locator('[name=includeActivities]').check();
  assert.equal(await page.locator('[name=activitySheetName]').inputValue(),'Activities');
  assert.equal(await page.locator('[name="activity-map-stageCode"]').inputValue(),'8');
  assert.equal(await page.locator('[name="activity-map-taskKind"]').inputValue(),'9');
  assert.equal(await page.locator('[name="activity-map-predecessors"]').inputValue(),'7');
  await page.locator('[name=advancedLinksConfirmed]').check();
  await page.locator('#tnaWorkbookMapping button[type=submit]').click();
  assert.equal(await page.locator('[data-activity-bind-line="4"]').count(),1);
  assert.equal(await page.locator('#tnaWorkbookConfirm').count(),0,'unmapped custom row cannot be confirmed');
  const originallySaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records);
  assert.equal(originallySaved.length,1,'review remains purely in memory');
  assert.equal(JSON.stringify(originallySaved[0].plan),oldJson,'pre-existing business record is untouched');
  await page.locator('[data-activity-bind-line="4"]').selectOption('__CUSTOM__');
  await page.locator('#tnaWorkbookMapping button[type=submit]').click();
  assert.equal(await page.locator('#tnaWorkbookDecision [data-activity-bind-line]').count(),0);
  const preview=await page.locator('#tnaWorkbookDecision').innerText();
  assert.match(preview,/3 Reviewed dependency links/);
  assert.match(preview,/LOCAL-CHECK/);
  assert.match(preview,/1.*Review their sourced Stage and Task Kind/s);
  assert.match(preview,/SS \/ 2 working/);
  assert.match(preview,/FF \/ 1 calendar/);
  assert.match(preview,/SF \/ -1 working/);
  assert.equal(await page.locator('#tnaWorkbookActivityConsent').count(),1);
  await page.locator('#tnaWorkbookConfirm').click();
  assert.match(await page.locator('#tnaImportReviewFeedback').innerText(),/check the confirmation/);
  await page.locator('#tnaWorkbookConsent').check();
  await page.locator('#tnaWorkbookActivityConsent').check();
  await page.locator('#tnaWorkbookConfirm').click();
  await page.locator('#tnaMerchSheet').waitFor({state:'visible'});
  const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records);
  assert.equal(records.length,2);
  const newest=records[0].plan;
  assert.equal(JSON.stringify(records[1].plan),oldJson,'existing order never overwritten');
  assert.equal(newest.order.styles[0].styleNo,'WOVEN-GMR16');
  assert.equal(newest.recordStatus,'draft');
  assert.equal(newest.revision,0);
  assert.equal(newest.baselineSnapshots.length,0);
  assert.equal(newest.edges.length,3);
  assert.equal(domain.validatePlan(newest).ok,true);
  assert.equal(scheduler.validateGraph(newest.tasks,newest.edges).ok,true);
  assert.equal(newest.tasks.find(t=>t.importSourceRef==='LOCAL-CHECK').templateRef,'CUSTOM-FA-LOCAL-CHECK');
  assert.deepEqual(newest.edges.map(e=>[e.relation,e.lagUnits,e.lagBasis,e.allowLead||false]),
    [['SS',2,'working',false],['FF',1,'calendar',false],['SF',-1,'working',true]]);
  assert.deepEqual(storage.importCopy(storage.exportCopy(newest)),newest);
  assert.equal(newest.auditEvents.at(-1).details.advancedEdgeCount,3);
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-action=continue]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  assert.match(await page.locator('#tnaMerchSheet').innerText(),/WOVEN-GMR16/);
  const reopened=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
  assert.equal(reopened.recordId,newest.recordId);
  assert.equal(reopened.edges.length,3);
  await page.setViewportSize({width:390,height:844});
  const widths=await page.evaluate(()=>({w:innerWidth,b:document.body.scrollWidth,d:document.documentElement.scrollWidth}));
  assert.ok(widths.b<=widths.w+2&&widths.d<=widths.w+2,'mobile viewport does not overflow');
  assert.deepEqual(errors,[],'browser script exceptions');
  assert.deepEqual(external,[],'no external requests');
  console.log('TNA GMR-04C Chromium PASS: local XLSX, user-mapped custom Stage/Kind, SS/FF/SF signed lag, untouched old record, save/reopen');
 }finally{
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
