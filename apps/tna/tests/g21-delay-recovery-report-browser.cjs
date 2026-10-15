/**
 * GMR-09 R06 actual authenticated Chromium, local saved records, XLSX and PDF.
 * Internal source data stays gated until management-only confirmation.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),XLSX=require('../vendor/xlsx.full.min.js');
const domain=require('../src/domain.js'),storage=require('../src/storage.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function source(){
 const plan=domain.createPlan({templateId:'woven',buyerName:'R06 QA BUYER',
  factoryName:'R06 QA INTERNAL FACTORY',styleNo:'R06-WOVEN-STYLE',
  poNumber:'R06-PO',totalQty:2200,buyerRequiredExFactory:'2026-12-20'},
  {ownerUserId:session.userKey});
 const task=ref=>{const t=plan.tasks.find(x=>x.templateRef===ref);assert.ok(t,ref);return t;};
 const d=task('D05');d.status='blocked';d.waitingFor='buyer';
 d.dates.baselineFinish='2026-10-10';d.dates.currentTargetFinish='2026-10-13';
 d.dates.forecastFinish='2026-10-18';d.delayReason='SYNTHETIC-FACTORY-DELAY-INTERNAL';
 d.recoveryAction='SYNTHETIC-PROPOSE-RETRY-NOT-APPROVED';
 d.proofRefs=['PRIVATE-SOURCE-REF-002'];
 const fit=task('D08');fit.status='approved';fit.dates.baselineFinish='2026-10-12';
 fit.dates.actualFinish='2026-10-14';
 const sew=task('P01');sew.status='in-progress';sew.recoveryAction='TRY-EXTRA-ROOM';
 plan.edges.push({edgeId:'BROWSER-G21-SS',predecessorTaskId:d.taskId,
  successorTaskId:sew.taskId,relation:'SS',lagUnits:2,
  lagBasis:'working',calendarPolicy:'successor'});
 plan.approvals=[{approvalId:'BROWSER-APPROVAL',itemName:'Fit decision',
  responseStatus:'approved',submittedDate:'2026-10-13',decisionDate:'2026-10-14',
  authorizedReviewerId:'qa-reviewer',evidenceRef:'SECRET-REVIEW-PROOF',
  requiredForTaskIds:[fit.taskId]}];
 plan.scenarioBranches=[{scenarioId:'BROWSER-SCENARIO',
  baseRecordId:plan.recordId,name:'Source recorded recovery option',
  status:'applied',baseRevision:0,
  createdAt:'2026-10-13T05:00:00Z',appliedAt:'2026-10-14T05:00:00Z',
  changes:{durationAdjustments:[{taskId:d.taskId,durationUnits:1}]},
  scenarioForecastDate:'2026-10-17',workingDaysGained:5}];
 return plan;
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=source(),unchanged=JSON.stringify(plan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:plan.recordId,updatedAt:'2026-10-15T06:00:00.000Z',buyer:plan.order.buyerName,
  style:plan.order.styles[0].styleNo,po:plan.order.poNumbers[0],plan}]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const mime=({'.css':'text/css','.html':'text/html','.js':'application/javascript',
    '.json':'application/json','.png':'image/png','.svg':'image/svg+xml',
    '.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({session,records})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));
  if(!localStorage.getItem('vesa.tna360.records.'+session.userKey))
   localStorage.setItem('vesa.tna360.records.'+session.userKey,JSON.stringify(records));
 },{session,records});
 const page=await context.newPage(),errors=[],external=[],downloads=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(origin))external.push(r.url());});
 page.on('download',e=>downloads.push(e.suggestedFilename()));
 try{
  await page.goto(origin+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R06');
  assert.equal(await page.locator('#tnaDelayReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaDelayAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaDelayManagement').isChecked(),false);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Choose a valid review date/);
  assert.equal(await page.locator('[data-delay-part]').count(),0,
   'internal content must not render before consent');
  assert.ok(!(await page.locator('.tna-report-preview').innerText()).includes('R06 QA INTERNAL FACTORY'));
  await page.locator('[data-report-action="excel"]').click();
  await page.locator('[data-report-action="download"]').click();
  await page.locator('[data-report-action="print"]').click();
  assert.equal(downloads.length,0,'unreviewed R06 cannot leave browser');
  assert.equal(await page.locator('body.tna-printing-report').count(),0);
  await page.locator('#tnaDelayAsOf').fill('2026-10-15');
  await page.locator('#tnaDelayAsOf').dispatchEvent('change');
  assert.match(await page.locator('#tnaReportGate').innerText(),/confirm management-only use/);
  await page.locator('#tnaDelayManagement').check();
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('.tna-report-preview');
  assert.match(await preview.innerText(),/SYNTHETIC-FACTORY-DELAY-INTERNAL/);
  assert.match(await preview.innerText(),/PROPOSE-RETRY-NOT-APPROVED/);
  assert.match(await preview.innerText(),/Source recorded recovery option/);
  assert.match(await preview.innerText(),/Fit decision/);
  assert.ok((await preview.innerText()).includes('not buyer approval'));
  assert.equal(await preview.locator('[data-delay-part]').count(),3);
  assert.equal(await preview.locator('[data-delay-scenarios]').count(),1);
  assert.equal(await preview.locator('[data-delay-approvals]').count(),1);
  await preview.screenshot({path:path.join(output,'tna-g21-delay-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const json=await jsonEvent,jsonFile=path.join(output,'tna-g21-delay.json');
  await json.saveAs(jsonFile);
  const model=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
  assert.equal(model.reportId,'R06');assert.equal(model.delayRecovery.ready,true);
  assert.equal(model.delayRecovery.asOfDate,'2026-10-15');
  assert.ok(model.delayRecovery.issues.some(row=>row.ref==='D05'&&
    row.targetChangeDays===3&&row.successors.includes('P01')));
  assert.ok(model.delayRecovery.scenarios.some(item=>item.state==='applied'));
  assert.ok(!JSON.stringify(model).includes('SECRET-REVIEW-PROOF'),
    'only approval presence, not private evidence ID, is exported');
  const excelEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await excelEvent,xlsxFile=path.join(output,'tna-g21-delay.xlsx');
  await excel.saveAs(xlsxFile);
  const book=XLSX.read(fs.readFileSync(xlsxFile),{type:'buffer',cellFormula:true});
  assert.deepEqual(book.SheetNames,[
    'Report Summary','Order Summary','Report Activities','Delay Actions',
    'Delay Follow-up','Dependency Links','Recovery Scenarios','Approval Records','Report Notes']);
  const dates=XLSX.utils.sheet_to_json(book.Sheets['Delay Actions'],{header:1,raw:true});
  const blocked=dates.find(row=>row[0]==='D05');
  assert.ok(blocked&&typeof blocked[4]==='number'&&typeof blocked[5]==='number'&&typeof blocked[6]==='number');
  assert.equal(blocked[9],3);
  const approval=XLSX.utils.sheet_to_json(book.Sheets['Approval Records'],{header:1,raw:true});
  assert.ok(approval.some(row=>row[0]==='Fit decision'&&typeof row[4]==='number'));
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g21-delay.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.__r06Printed=false;window.print=()=>{window.__r06Printed=true;};});
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.evaluate(()=>window.__r06Printed),true);
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.locator('#tnaReportType').selectOption('R02');
  assert.equal(await page.locator('#tnaDelayReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-buyer').count(),1);
  assert.ok(!(await page.locator('.tna-report-buyer').innerText()).includes('SYNTHETIC-FACTORY-DELAY-INTERNAL'));
  await page.locator('#tnaReportType').selectOption('R05');
  assert.equal(await page.locator('#tnaWeeklyReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaDelayReviewWrap').isVisible(),false);
  await page.locator('#tnaReportType').selectOption('R06');
  assert.equal(await page.locator('#tnaDelayAsOf').inputValue(),'2026-10-15');
  assert.equal(await page.locator('#tnaDelayManagement').isChecked(),true);
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,
    document.documentElement.scrollWidth]);
  assert.ok(dims[1]<=dims[0]+2&&dims[2]<=dims[0]+2,'no page overflow on mobile');
  const scrolls=await page.locator('.tna-report-delay-scroll').evaluateAll(nodes=>
    nodes.map(n=>[n.clientWidth,n.parentElement.clientWidth]));
  assert.ok(scrolls.every(([w,parent])=>w<=parent+2),'wide report scrolls inside dialog');
  const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).records[0].plan,
    'vesa.tna360.records.'+session.userKey);
  assert.equal(JSON.stringify(stored),unchanged,'report remains completely read-only');
  assert.deepEqual(errors,[],'no JS errors');assert.deepEqual(external,[],'no external network calls');
  console.log('TNA GMR-09 R06 Chromium PASS: consent gate, management source, scenario/approval provenance, Excel, JSON, PDF, mobile, preserved R02/R05 and saved data');
 }finally{
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
