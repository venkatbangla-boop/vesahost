/**
 * GMR-04A real Chromium proof: actual uploaded XLSX with chosen worksheet,
 * header/date/mapping and explicit duplicate/new-draft confirmation.
 * Synthetic data only; existing browser records must never be overwritten.
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
const root=path.resolve(__dirname,'../../..');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function workbook(){
  const book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['Help'],['Select the Orders sheet']]),'Readme');
  const rows=[
    ['Synthetic order workbook: approved input dates require review'],
    ['Factory','PO','Qty','Style','Buyer','Buyer Required Ex-Factory','Fabric','GSM'],
    ['FACTORY-TEST','PO-TEST-44',1200,'WOVEN-TEST-44','BUYER-TEST','21/11/2026','100% Cotton Twill',230],
    ['SECOND FACTORY','OTHER-PO',500,'OTHER-STYLE','OTHER BUYER','26/11/2026','Canvas',190]
  ];
  XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet(rows),'Orders');
  return XLSX.write(book,{type:'buffer',bookType:'xlsx'});
}
function localBox(existing){return {storageVersion:storage.STORAGE_VERSION,records:[
  {recordId:existing.recordId,updatedAt:'2026-10-12T05:20:00.000Z',
   buyer:existing.order.buyerName,style:existing.order.styles[0].styleNo,
   po:existing.order.poNumbers[0],plan:existing}
]};}
async function run(){
 const original=domain.createPlan({templateId:'woven',buyerName:'BUYER-TEST',
  factoryName:'FACTORY-TEST',styleNo:'WOVEN-TEST-44',poNumber:'PO-TEST-44',
  totalQty:1200,buyerRequiredExFactory:'2026-11-18'},{ownerUserId:session.userKey});
 const originalText=JSON.stringify(original);
 const server=http.createServer((req,res)=>{
   let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
     const ext=path.extname(file);
     const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
       '.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.json':'application/json'}[ext]||'application/octet-stream';
     res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});res.end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:860}});
 await context.addInitScript(({auth,records})=>{
   localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(auth));
   localStorage.setItem('vesa.tna360.records.'+auth.userKey,JSON.stringify(records));
 },{auth:session,records:localBox(original)});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 try{
   await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action=continue]').click();
   await page.locator('#tnaDialog .tna-dialog-head button').click();
   assert.match(await page.locator('#tnaMerchSheet').innerText(),/WOVEN-TEST-44/);

   await page.locator('[data-vesa-menu=File]').click();
   await page.locator('[data-menu-action="Import Excel TNA"]').click();
   await page.locator('#tnaWorkbookFile').setInputFiles({name:'woven-source.xlsx',
     mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:workbook()});
   await page.locator('[data-import-preview=file]').click();
   await page.locator('#tnaWorkbookMapping').waitFor({state:'visible'});
   await page.locator('#tnaWorkbookMapping [name=sheetName]').selectOption('Orders');
   await page.locator('#tnaWorkbookMapping [name=headerRow]').fill('2');
   await page.locator('#tnaWorkbookMapping [name=headerRow]').press('Tab');
   await page.locator('#tnaWorkbookMapping [name=dateFormat]').selectOption('dmy');
   await page.locator('#tnaWorkbookMapping [name=basis]').selectOption('working');
   await page.locator('#tnaWorkbookMapping [name=templateId]').selectOption('woven');
   await page.locator('#tnaWorkbookMapping button[type=submit]').click();
   assert.match(await page.locator('#tnaWorkbookDecision').innerText(),/Matching buyer \+ style \+ PO exists/);
   assert.match(await page.locator('#tnaWorkbookDecision').innerText(),/Activities, statuses, approvals and predecessor links are NOT imported/);
   assert.equal(await page.locator('#tnaWorkbookConsent').count(),1);
   await page.locator('#tnaWorkbookConfirm').click();
   assert.match(await page.locator('#tnaImportReviewFeedback').innerText(),/check the confirmation/);
   assert.equal(await page.locator('#tnaMerchSheet').count(),1,'active original order remains open during preview');
   const unchanged=await page.evaluate(id=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records
     .find(x=>x.recordId===id).plan,original.recordId);
   assert.equal(JSON.stringify(unchanged),originalText,'no existing record was changed by review');

   await page.locator('#tnaWorkbookConsent').check();
   await page.locator('#tnaWorkbookConfirm').click();
   assert.match(await page.locator('#tnaImportReviewFeedback').innerText(),/Matching existing order/);
   await page.locator('#tnaWorkbookDuplicateConsent').check();
   await page.locator('#tnaWorkbookConfirm').click();
   await page.locator('#tnaMerchSheet').waitFor({state:'visible'});
   assert.match(await page.locator('#tnaDialog').innerText(),/A separate, unsigned TNA draft/);
   const all=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records);
   assert.equal(all.length,2,'old record retained plus exactly one new record');
   const newest=all[0].plan;
   assert.notEqual(newest.recordId,original.recordId);
   assert.equal(newest.order.buyerName,'BUYER-TEST');
   assert.equal(newest.order.factoryName,'FACTORY-TEST');
   assert.equal(newest.order.styles[0].styleNo,'WOVEN-TEST-44');
   assert.equal(newest.order.totalQty,1200);
   assert.equal(newest.order.fabricWeightGsm,230);
   assert.equal(newest.commitments.buyerRequiredExFactory,'2026-11-21');
   assert.equal(newest.commitments.leadTimeBasis,'working');
   assert.equal(newest.recordStatus,'draft');
   assert.equal(newest.baselineSnapshots.length,0);
   assert.ok(newest.tasks.every(t=>t.status==='not-started'));
   assert.equal(newest.auditEvents.at(-1).eventType,'reviewed-workbook-new-draft');
   assert.equal(newest.auditEvents.at(-1).details.skippedActivities,true);
   assert.equal(JSON.stringify(all[1].plan),originalText,'saved original unchanged after new draft');

   await page.locator('#tnaDialog .tna-dialog-head button').click();
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('[data-action=continue]').click();
   await page.locator('#tnaDialog .tna-dialog-head button').click();
   assert.match(await page.locator('#tnaMerchSheet').innerText(),/2026-11-21/);
   const opened=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
   assert.equal(opened.recordId,newest.recordId);
   assert.deepEqual(storage.importCopy(storage.exportCopy(opened)),opened,'saved copy remains compatible');
   await page.setViewportSize({width:390,height:844});
   const sizing=await page.evaluate(()=>({w:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
   assert.ok(sizing.body<=sizing.w+1&&sizing.html<=sizing.w+1,'mobile page no unexpected horizontal scroll');
   assert.deepEqual(errors,[],'no browser script exceptions');
   assert.deepEqual(external,[],'no off-origin network calls');
   console.log('TNA GMR-04A browser PASS: real XLSX sheet mapping, explicit duplicate consent, new draft/save/reopen, original immutable');
 }finally{
   await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
