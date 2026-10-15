/**
 * GMR-06 real Chromium/SheetJS proof. Factory day is a user-selected as-of
 * civil date, not machine clock, forecast inference or a server action.
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
const user={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function syntheticPlan(){
 const plan=domain.createPlan({
   templateId:'woven',buyerName:'R03 FACTORY BUYER',factoryName:'R03 FACTORY',
   styleNo:'R03-WOVEN-STYLE',poNumber:'R03-PO',totalQty:2400,
   buyerRequiredExFactory:'2026-12-20'
 },{ownerUserId:user.userKey});
 function set(ref,patch){
   const task=plan.tasks.find(t=>t.templateRef===ref);
   assert.ok(task,'source task '+ref);
   const dates=patch.dates,priorDates={...task.dates};
   Object.assign(task,patch);
   if(dates)task.dates={...priorDates,...dates};
 }
 set('O01',{status:'in-progress',ownerParty:'merchant',waitingFor:'factory',
   dates:{baselineFinish:'2026-10-11',currentTargetFinish:'2026-10-14'},
   delayReason:'FACTORY-DELAY-SOURCE',followUpNote:'FACTORY-CHECK-WITH-VENDOR',
   proofRefs:['SOURCE-REF-14']});
 set('D05',{status:'awaiting-approval',ownerParty:'sample-room',waitingFor:'buyer',
   dates:{baselineFinish:'2026-10-13',currentTargetFinish:'2026-10-15'},
   followUpNote:'Need buyer sample response'});
 set('D08',{status:'in-progress',ownerParty:'merchant',
   dates:{baselineFinish:'2026-10-19',currentTargetFinish:'2026-10-22'}});
 set('Q07',{status:'completed',ownerParty:'quality',
   dates:{baselineFinish:'2026-10-05',actualFinish:'2026-10-15'},
   proofRefs:['SOURCE-FINAL-INSPECTION']});
 set('D14',{status:'approved',ownerParty:'buyer',
   dates:{baselineFinish:'2026-10-01',actualFinish:'2026-10-14'},proofRefs:['SOURCE-OLD-PP']});
 set('D15',{status:'not-started',dates:{baselineFinish:'2026-10-23'}});
 set('O02',{status:'not-started',ownerParty:'',dates:{
   baselineStart:null,baselineFinish:null,currentTargetStart:null,currentTargetFinish:null}});
 return plan;
}
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json',
 '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream';
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=syntheticPlan(),unchanged=JSON.stringify(plan);
 const original={storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:plan.recordId,updatedAt:'2026-10-15T06:00:00.000Z',buyer:plan.order.buyerName,
  style:plan.order.styles[0].styleNo,po:plan.order.poNumbers[0],plan
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
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
   args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({session,records})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));
  if(!localStorage.getItem('vesa.tna360.records.'+session.userKey))
   localStorage.setItem('vesa.tna360.records.'+session.userKey,JSON.stringify(records));
 },{session:user,records:original});
 const page=await context.newPage(),errors=[],external=[],downloads=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(!request.url().startsWith(origin))external.push(request.url());});
 page.on('download',event=>downloads.push(event.suggestedFilename()));
 try{
  await page.goto(origin+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R03');
  assert.equal(await page.locator('#tnaReportAsOfWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaReportAsOf').inputValue(),'',
    'no automatically invented browser-clock as-of date');
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a valid as-of date/);
  assert.equal(await page.locator('.tna-report-daily-table').count(),0,'unselected R03 has no source rows');
  await page.locator('[data-report-action="excel"]').click();
  assert.equal(downloads.length,0,'cannot download R03 without review date');
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.locator('body.tna-printing-report').count(),0,
    'cannot print without explicit source review date');
  await page.locator('#tnaReportAsOf').fill('2026-10-15');
  await page.locator('#tnaReportAsOf').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('.tna-report-preview');
  await preview.waitFor({state:'visible'});
  assert.match(await preview.innerText(),/Review as-of date: 2026-10-15/);
  for(const section of ['overdue','today','nextSeven','needsDate'])
   assert.equal(await preview.locator('[data-daily-group="'+section+'"]').count(),1,section);
  const over=await preview.locator('[data-daily-group="overdue"]').innerText();
  assert.match(over,/O01/);
  assert.match(over,/FACTORY-DELAY-SOURCE/);
  assert.match(over,/FACTORY-CHECK-WITH-VENDOR/);
  assert.match(over,/SOURCE-REF-14/);
  const today=await preview.locator('[data-daily-group="today"]').innerText();
  assert.match(today,/D05/);
  assert.match(today,/Q07/);
  assert.match(await preview.locator('[data-daily-group="nextSeven"]').innerText(),/D08/);
  assert.match(await preview.locator('[data-daily-group="needsDate"]').innerText(),/O02/);
  assert.ok(!(await preview.innerText()).includes('D15'),'future +8 not included');
  await preview.screenshot({path:path.join(output,'tna-g18-factory-daily-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const jsonFile=await jsonEvent;
  const jsonPath=path.join(output,'tna-g18-daily-actions.json');
  await jsonFile.saveAs(jsonPath);
  const model=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(model.reportId,'R03');
  assert.equal(model.factoryDaily.asOfDate,'2026-10-15');
  assert.equal(model.factoryDaily.counts.overdue,1);
  assert.ok(model.factoryDaily.counts.today>=2);
  assert.equal(model.factoryDaily.counts.nextSeven,1);
  assert.ok(model.factoryDaily.undatedCount>50);
  const excelEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const xlsx=await excelEvent,workbookPath=path.join(output,'tna-g18-factory-daily.xlsx');
  await xlsx.saveAs(workbookPath);
  const workbook=XLSX.read(fs.readFileSync(workbookPath),{type:'buffer',cellFormula:true});
  assert.deepEqual(workbook.SheetNames,
    ['Report Summary','Order Summary','Report Activities','Factory Daily Actions','Missing Action Dates','Report Notes']);
  const actionRows=XLSX.utils.sheet_to_json(workbook.Sheets['Factory Daily Actions'],{header:1,raw:true});
  const late=actionRows.find(row=>row[1]==='O01');
  assert.ok(late&&typeof late[4]==='number'&&typeof late[5]==='number'&&typeof late[6]==='number');
  assert.equal(late[11],'FACTORY-DELAY-SOURCE');
  assert.equal(late[14],'SOURCE-REF-14');
  const gaps=XLSX.utils.sheet_to_json(workbook.Sheets['Missing Action Dates'],{header:1,raw:true});
  assert.ok(gaps.some(row=>row[1]==='O02'));
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdfPath=path.join(output,'tna-g18-factory-daily.pdf');
  await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.__factoryPrintCalled=false;window.print=()=>{window.__factoryPrintCalled=true;};});
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.evaluate(()=>window.__factoryPrintCalled),true,'existing Print Report invokes browser print');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  assert.equal(fs.readFileSync(pdfPath).subarray(0,5).toString(),'%PDF-');
  const pdfPages=(fs.readFileSync(pdfPath).toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
  assert.ok(pdfPages>=2,'complete factory actions are printable across pages');
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
    'vesa.tna360.records.'+user.userKey);
  assert.equal(JSON.stringify(stored),unchanged,'report generation never edits saved TNA');
  await page.locator('#tnaReportType').selectOption('R02');
  assert.equal(await page.locator('#tnaReportAsOfWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-buyer').count(),1,'old R02 stays isolated');
  await page.locator('#tnaReportType').selectOption('R01');
  assert.equal(await page.locator('.tna-report-master').count(),1,'R01 factory master unchanged');
  await page.locator('#tnaReportType').selectOption('R03');
  assert.equal(await page.locator('#tnaReportAsOf').inputValue(),'2026-10-15','date retained in active dialog only');
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>({w:innerWidth,b:document.body.scrollWidth,d:document.documentElement.scrollWidth}));
  assert.ok(dims.b<=dims.w+2&&dims.d<=dims.w+2,'mobile page has no outer overflow');
  const grids=await page.locator('.tna-report-daily-scroll').evaluateAll(nodes=>nodes.map(x=>({
   width:x.clientWidth,parent:x.parentElement.clientWidth
  })));
  assert.ok(grids.every(x=>x.width<=x.parent+2),'wide data grids scroll inside report, not page');
  assert.deepEqual(errors,[],'no browser script error');
  assert.deepEqual(external,[],'no external network requests');
  console.log('TNA GMR-06 R03 browser PASS: explicit as-of gate, due groups, real Excel/JSON/PDF, responsive, R01/R02 parity, source immutable');
 }finally{await context.close();await browser.close();await new Promise(r=>server.close(r));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
