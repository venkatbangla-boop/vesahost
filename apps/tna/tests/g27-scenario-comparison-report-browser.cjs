/**
 * GMR-15 R12 authenticated Chromium: explicit same-base A/B, gated and source
 * only, genuine browser XLSX/JSON/PDF, mobile and old saved-record parity.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),domain=require('../src/domain.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function fixture(){
 const plan=domain.createPlan({templateId:'woven',buyerName:'R12 LIVE BUYER',
  factoryName:'R12 LIVE FACTORY',styleNo:'R12-WOVEN',poNumber:'PO-R12',totalQty:100,
  unit:'pcs',orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2027-02-15'},
  {ownerUserId:session.userKey});
 plan.order.commercialNotes='PRIVATE-SCENARIO-FOB';
 plan.commitments.masterLcProofRef='PRIVATE-SCENARIO-LC';
 const task=plan.tasks.find(x=>x.durationUnits>3);
 assert.ok(task);
 task.title='PRIVATE-SCENARIO-ACTOR-REMARK';
 return {plan,task};
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const {plan,task}=fixture(),before=JSON.stringify(plan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{recordId:plan.recordId,
  updatedAt:'2026-10-15T06:00:00Z',buyer:plan.order.buyerName,
  style:plan.order.styles?.[0]?.styleNo,po:plan.order.poNumbers?.[0],plan}]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const mime=({'.css':'text/css','.html':'text/html','.js':'application/javascript',
    '.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({session,records})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));
  if(!localStorage.getItem('vesa.tna360.records.'+session.userKey))
   localStorage.setItem('vesa.tna360.records.'+session.userKey,JSON.stringify(records));
 },{session,records});
 const page=await context.newPage(),errors=[],external=[],downloads=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 page.on('download',dl=>downloads.push(dl.suggestedFilename()));
 const clean=(value,where)=>{
  const text=typeof value==='string'?value:JSON.stringify(value);
  for(const secret of ['PRIVATE-SCENARIO-FOB','PRIVATE-SCENARIO-LC',
   'PRIVATE-SCENARIO-ACTOR-REMARK','PRIVATE-PLANNER-AUTHORITY'])
   assert.ok(!text.includes(secret),where+' leaked '+secret);
 };
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R12');
  assert.equal(await page.locator('#tnaScenarioReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaScenarioReviewAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaScenarioPlannerConsent').isChecked(),false);
  assert.equal(await page.locator('#tnaScenarioTaskA').inputValue(),'');
  assert.equal(await page.locator('[data-scenario-report-part]').count(),0);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Choose a valid review date/);
  for(const action of ['download','excel','print','share'])
   await page.locator('[data-report-action="'+action+'"]').click();
  assert.equal(downloads.length,0);
  await page.locator('#tnaScenarioReviewAsOf').fill('2026-10-15');
  await page.locator('#tnaScenarioPlannerConsent').check();
  await page.locator('#tnaScenarioCalendarReviewed').check();
  await page.locator('#tnaScenarioAuthority').fill('PRIVATE-PLANNER-AUTHORITY');
  await page.locator('#tnaScenarioTaskA').selectOption(task.taskId);
  await page.locator('#tnaScenarioDurationA').fill(String(task.durationUnits-2));
  await page.locator('#tnaScenarioTaskB').selectOption(task.taskId);
  assert.match(await page.locator('#tnaReportGate').innerText(),/both explicitly entered options/);
  await page.locator('#tnaScenarioDurationB').fill(String(task.durationUnits-1));
  await page.locator('#tnaScenarioDurationB').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('#tnaReportPreview'),text=await preview.innerText();
  assert.match(text,/Recovery A/);assert.match(text,/Recovery B/);
  assert.match(text,/SAME saved\/current input revision|SAME|same current|SAME CURRENT|same current/i);
  assert.match(text,/do NOT independently authenticate buyer approval/);
  assert.match(text,/R12 LIVE BUYER/);
  assert.equal(await preview.locator('[data-scenario-report-part="forecasts"] tbody tr').count(),3);
  assert.equal(await preview.locator('[data-scenario-report-part="inputs"] tbody tr').count(),2);
  assert.equal(await preview.locator('[data-scenario-report-part="paths"] tbody tr').count(),2);
  clean(text,'preview');
  await preview.screenshot({path:path.join(output,'tna-g27-scenario-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const json=await jsonEvent,jsonPath=path.join(output,'tna-g27-scenario.json');
  await json.saveAs(jsonPath);
  const model=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(model.reportId,'R12');assert.equal(model.scenarioComparison.ready,true);
  assert.deepEqual(model.scenarioComparison.alternatives.map(a=>a.optionDuration),
   [task.durationUnits-2,task.durationUnits-1]);
  assert.equal(model.scenarioComparison.base.revision,plan.revision);
  assert.equal(model.source.recordId,null);clean(model,'JSON');
  const xEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await xEvent,xPath=path.join(output,'tna-g27-scenario.xlsx');
  await excel.saveAs(xPath);
  const book=XLSX.read(fs.readFileSync(xPath),{type:'buffer'});
  assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
   'Scenario Overview','Scenario Inputs','Critical Path Changes','Applied Scenario History','Report Notes']);
  const rows=XLSX.utils.sheet_to_json(book.Sheets['Scenario Inputs'],{header:1,raw:true});
  assert.equal(rows[1][3],task.durationUnits-2);
  assert.equal(rows[2][3],task.durationUnits-1);
  const summary=XLSX.utils.sheet_to_json(book.Sheets['Scenario Overview'],{header:1,raw:true});
  const forecast=summary.find(r=>r[0]===model.scenarioComparison.labels.forecast);
  assert.equal(typeof forecast[1],'number');
  clean(Object.values(book.Sheets).flatMap(sh=>XLSX.utils.sheet_to_json(sh,{header:1,raw:true})),'Excel');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g27-scenario.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,document.documentElement.scrollWidth]);
  assert.ok(dims[1]<=dims[0]+2&&dims[2]<=dims[0]+2,'390px mobile page overflow');
  assert.equal(await page.locator('.tna-report-scenario-scroll').evaluateAll(nodes=>
   nodes.every(node=>node.clientWidth<=node.parentElement.clientWidth+2)),true);
  await page.locator('#tnaReportType').selectOption('R11');
  assert.equal(await page.locator('#tnaScenarioReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-approval').count(),1);
  const saved=await page.evaluate(u=>JSON.parse(localStorage.getItem('vesa.tna360.records.'+u)).records[0].plan,session.userKey);
  assert.equal(JSON.stringify(saved),before);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('TNA GMR-15 R12 Chromium PASS: explicit independent same-base A/B, typed XLSX/JSON/PDF, 390px, saved order immutable');
 }finally{await context.close();await browser.close();await new Promise(done=>server.close(done))}
}
run().catch(err=>{console.error(err);process.exitCode=1});
