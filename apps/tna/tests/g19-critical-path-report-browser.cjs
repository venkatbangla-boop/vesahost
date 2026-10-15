/**
 * GMR-07 real Chromium: user-selected source anchors, calendar and reviewed
 * assumptions; R04 never prints/exports fabricated CPM before confirmation.
 * Exercises the genuine VESA login/session shell and bundled XLSX.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const XLSX=require('../vendor/xlsx.full.min.js');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function buildFixture(){
 const plan=domain.createPlan({templateId:'woven',buyerName:'CPM BROWSER BUYER',
  factoryName:'CPM BROWSER FACTORY',styleNo:'R04-CPM-WOVEN',poNumber:'R04-PO',
  totalQty:2400,orderConfirmedOn:'2026-10-12',poReceivedOn:'2026-10-13',
  buyerRequiredExFactory:'2026-10-19'},{ownerUserId:session.userKey});
 const original=new Map(plan.tasks.map(t=>[t.templateRef,t]));
 const ids=['O01','D05','D08','S04'];
 plan.tasks=ids.map((id,i)=>{const task=original.get(id);assert.ok(task,id);task.durationUnits=[2,3,2,1][i];return task;});
 const make=(a,b,n)=>({edgeId:'R04-EDGE-'+n,predecessorTaskId:original.get(a).taskId,
   successorTaskId:original.get(b).taskId,relation:'FS',lagUnits:0,
   lagBasis:'working',calendarPolicy:'successor'});
 plan.edges=[make('O01','D05',1),make('O01','D08',2),make('D05','S04',3),make('D08','S04',4)];
 plan.tasks.find(t=>t.templateRef==='D08').status='awaiting-approval';
 plan.validation=domain.validatePlan(plan);
 assert.equal(plan.validation.ok,true,plan.validation.errors.join('; '));
 return plan;
}
function mime(file){return({'.css':'text/css','.html':'text/html','.js':'application/javascript',
 '.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon',
 '.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream';}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const originalPlan=buildFixture(),unchanged=JSON.stringify(originalPlan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{
   recordId:originalPlan.recordId,updatedAt:'2026-10-15T06:00:00.000Z',
   buyer:originalPlan.order.buyerName,style:'R04-CPM-WOVEN',
   po:'R04-PO',plan:originalPlan
 }]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({auth,data})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(auth));
  if(!localStorage.getItem('vesa.tna360.records.'+auth.userKey))
   localStorage.setItem('vesa.tna360.records.'+auth.userKey,JSON.stringify(data));
 },{auth:session,data:records});
 const page=await context.newPage(),pageErrors=[],external=[],downloads=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
 page.on('download',d=>downloads.push(d.suggestedFilename()));
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R04');
  assert.equal(await page.locator('#tnaCriticalReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaReportAsOfWrap').isVisible(),false);
  assert.equal(await page.locator('[name="criticalStartAnchor"]').inputValue(),'',
   'source start is not silently selected');
  assert.equal(await page.locator('[name="criticalWeek"]').inputValue(),'',
   'calendar is not guessed');
  assert.equal(await page.locator('.tna-report-critical-table').count(),0);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a real source start date/);
  await page.locator('[data-report-action="excel"]').click();
  await page.locator('[data-report-action="print"]').click();
  assert.equal(downloads.length,0,'unreviewed R04 cannot be downloaded');
  assert.equal(await page.locator('body.tna-printing-report').count(),0,'unreviewed cannot be printed');
  await page.locator('[name="criticalStartAnchor"]').selectOption('orderConfirmedOn');
  await page.locator('[name="criticalWeek"]').selectOption('mon-fri');
  for(const name of ['criticalCalendarConfirmed','criticalDurationsReviewed',
    'criticalDependenciesReviewed','criticalEndpointReviewed'])
   await page.locator('[name="'+name+'"]').check();
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('.tna-report-preview');
  assert.match(await preview.innerText(),/Calculated ex-factory: 2026-10-19/);
  assert.match(await preview.innerText(),/O01 → D05 → S04/);
  assert.match(await preview.innerText(),/Recorded gate issues/);
  assert.equal(await preview.locator('.tna-report-critical-table').count(),2);
  assert.equal(await preview.locator('[data-critical-part="1"] tbody tr').count(),4);
  const rows=await preview.locator('[data-critical-part="2"] tbody tr').allInnerTexts();
  assert.ok(rows.some(t=>t.includes('D08')&&t.includes('1')),'non-controlling route has 1 working day float');
  await preview.screenshot({path:path.join(output,'tna-g19-r04-critical-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const jsonDownload=await jsonEvent;
  const jsonPath=path.join(output,'tna-g19-r04-critical.json');
  await jsonDownload.saveAs(jsonPath);
  const model=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(model.reportId,'R04');
  assert.equal(model.criticalPath.ready,true);
  assert.deepEqual(model.criticalPath.criticalChains,[['O01','D05','S04']]);
  assert.equal(model.criticalPath.bufferWorkdays,0);
  assert.ok(model.criticalPath.gateIssues.some(item=>item.ref==='D08'));
  assert.equal(model.criticalPath.review.calendarConfirmed,true);
  const xlsxEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const xlsx=await xlsxEvent,bookPath=path.join(output,'tna-g19-r04-critical.xlsx');
  await xlsx.saveAs(bookPath);
  const workbook=XLSX.read(fs.readFileSync(bookPath),{type:'buffer',cellFormula:true});
  assert.deepEqual(workbook.SheetNames,['Report Summary','Order Summary','Report Activities',
    'Critical Path','Predecessor Links','Gate Issues','CPM Review','Report Notes']);
  const list=XLSX.utils.sheet_to_json(workbook.Sheets['Critical Path'],{header:1,raw:true});
  const fit=list.find(row=>row[0]==='D05');
  assert.ok(fit&&typeof fit[4]==='number'&&typeof fit[8]==='number');
  assert.ok(XLSX.utils.sheet_to_json(workbook.Sheets['Gate Issues'],{header:1,raw:true})
    .some(row=>row[0]==='D08'));
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdfPath=path.join(output,'tna-g19-r04-critical.pdf');
  await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  assert.equal(fs.readFileSync(pdfPath).subarray(0,5).toString(),'%PDF-');
  const pages=(fs.readFileSync(pdfPath).toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
  assert.ok(pages>=1,'R04 printed PDF has pages');
  await page.evaluate(()=>{window.__criticalPrinted=false;window.print=()=>{window.__criticalPrinted=true;};});
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.evaluate(()=>window.__criticalPrinted),true,'existing print action');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
   'vesa.tna360.records.'+session.userKey);
  assert.equal(JSON.stringify(saved),unchanged,'R04 report must never rewrite saved TNA');
  await page.locator('#tnaReportType').selectOption('R02');
  assert.equal(await page.locator('#tnaCriticalReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-buyer').count(),1,'R02 buyer privacy view intact');
  await page.locator('#tnaReportType').selectOption('R01');
  assert.equal(await page.locator('.tna-report-master').count(),1,'R01 source master intact');
  await page.locator('#tnaReportType').selectOption('R03');
  assert.equal(await page.locator('#tnaReportAsOfWrap').isVisible(),true,'R03 review-date control intact');
  await page.locator('#tnaReportType').selectOption('R04');
  assert.equal(await page.locator('#tnaCriticalReviewWrap').isVisible(),true);
  await page.setViewportSize({width:390,height:844});
  const sizes=await page.evaluate(()=>({w:innerWidth,b:document.body.scrollWidth,d:document.documentElement.scrollWidth}));
  assert.ok(sizes.b<=sizes.w+2&&sizes.d<=sizes.w+2,'mobile page does not overflow');
  const grids=await page.locator('.tna-report-critical-scroll').evaluateAll(elements=>elements.map(e=>({
   child:e.clientWidth,parent:e.parentElement.clientWidth
  })));
  assert.ok(grids.every(x=>x.child<=x.parent+2),'wide CPM table scrolls inside its report');
  assert.deepEqual(pageErrors,[],'no JavaScript errors');
  assert.deepEqual(external,[],'no external requests');
  console.log('TNA GMR-07 R04 Chromium PASS: reviewed calendar/source gates, branch float, original order, genuine Excel/JSON/PDF and mobile');
 }finally{await context.close();await browser.close();await new Promise(done=>server.close(done));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
