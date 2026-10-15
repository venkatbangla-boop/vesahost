/**
 * GMR-14 R11: real authenticated Chromium review, buyer/factory isolation,
 * typed XLSX, JSON, print PDF, mobile, immutable local TNA and old-report parity.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),domain=require('../src/domain.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function fixture(){
 const plan=domain.createPlan({templateId:'woven',buyerName:'R11 LIVE BUYER',
  factoryName:'R11 LIVE FACTORY',styleNo:'R11-WOVEN',poNumber:'PO-R11',totalQty:100,
  unit:'pcs',buyerRequiredExFactory:'2026-11-16'},{ownerUserId:session.userKey});
 const fit=plan.tasks.find(t=>t.templateRef==='D08');
 const internal=plan.tasks.find(t=>t.templateRef==='O03');
 const pp=plan.tasks.find(t=>t.templateRef==='D14');
 assert.ok(fit&&internal&&pp);
 pp.status='awaiting-approval';
 fit.title='SECRET-PRIVATE-TASK-COMMENT';
 internal.title='SECRET-PRIVATE-FOB';
 plan.order.commercialNotes='SECRET-PRIVATE-COMMISSION';
 plan.commitments.masterLcProofRef='SECRET-PRIVATE-LC';
 plan.approvals=[
  {approvalId:'APP-01',itemName:'SECRET-PRIVATE-APPROVAL',responseStatus:'approved',
   submittedDate:'2026-10-11',receivedDate:'2026-10-12',decisionDate:'2026-10-14',
   decidedBy:'SECRET-PRIVATE-REVIEWER',evidenceRef:'SECRET-PRIVATE-PROOF',
   requiredForTaskIds:[fit.taskId],revision:1,
   resubmissionSequence:[{submittedDate:'2026-10-09',decisionDate:'2026-10-10',
     responseStatus:'rejected',returnComments:'SECRET-PRIVATE-REJECTION'}]},
  {approvalId:'APP-INTERNAL',itemName:'SECRET-PRIVATE-FOB',
   responseStatus:'approved',submittedDate:'2026-10-09',decisionDate:'2026-10-12',
   decidedBy:'SECRET-PRIVATE-REVIEWER',evidenceRef:'SECRET-PRIVATE-PROOF',
   requiredForTaskIds:[internal.taskId]}
 ];
 plan.revisionEvents.push({eventId:'R11-CHANGE-1',eventType:'merchandising-task-revised',
  revision:2,createdAt:'2026-10-13T05:00:00Z',actorId:'SECRET-PRIVATE-ACTOR',
  details:{taskId:fit.taskId,changes:{status:{before:'submitted',after:'approved'}},
   reason:'SECRET-PRIVATE-COMMENT',authorityParty:'SECRET-PRIVATE-REVIEWER'}});
 return plan;
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=fixture(),before=JSON.stringify(plan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{recordId:plan.recordId,
  updatedAt:'2026-10-15T06:00:00Z',buyer:plan.order.buyerName,
  style:plan.order.styles?.[0]?.styleNo,po:plan.order.poNumbers?.[0],plan}]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
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
 const clean=(data,where)=>{
  const text=typeof data==='string'?data:JSON.stringify(data);
  for(const value of ['SECRET-PRIVATE-TASK-COMMENT','SECRET-PRIVATE-FOB',
   'SECRET-PRIVATE-COMMISSION','SECRET-PRIVATE-LC','SECRET-PRIVATE-APPROVAL',
   'SECRET-PRIVATE-REVIEWER','SECRET-PRIVATE-PROOF','SECRET-PRIVATE-REJECTION',
   'SECRET-PRIVATE-ACTOR','SECRET-PRIVATE-COMMENT','PRIVATE-REVIEW-REFERENCE'])
    assert.ok(!text.includes(value),where+' leaked '+value);
 };
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R11');
  assert.equal(await page.locator('#tnaApprovalReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaApprovalAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaApprovalAudience').inputValue(),'');
  assert.equal(await page.locator('#tnaApprovalBuyerConsent').isChecked(),false);
  assert.equal(await page.locator('[data-approval-report-part]').count(),0);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a valid review date/);
  for(const action of ['download','excel','print','share'])
   await page.locator('[data-report-action="'+action+'"]').click();
  assert.equal(downloads.length,0);
  await page.locator('#tnaApprovalAsOf').fill('2026-10-15');
  await page.locator('#tnaApprovalAudience').selectOption('buyer');
  assert.equal(await page.locator('#tnaApprovalBuyerConsentWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaApprovalFactoryConsentWrap').isVisible(),false);
  await page.locator('#tnaApprovalBuyerConsent').check();
  await page.locator('#tnaApprovalAuthority').fill('PRIVATE-REVIEW-REFERENCE');
  await page.locator('#tnaApprovalAuthority').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const outputNode=page.locator('#tnaReportPreview');
  const visible=await outputNode.innerText();
  assert.match(visible,/Fit approval/);
  assert.match(visible,/R11 LIVE BUYER/);
  assert.ok(!visible.includes('R11 LIVE FACTORY'),'buyer audience must not expose factory context');
  assert.ok(!visible.includes('O03'),'private internal PO/FOB milestone is not buyer-facing');
  assert.match(visible,/Sequence position is the source array position/);
  clean(visible,'buyer preview');
  assert.equal(await outputNode.locator('[data-approval-report-part="decisions"] tbody tr').count(),1);
  assert.equal(await outputNode.locator('[data-approval-report-part="rounds"] tbody tr').count(),1);
  assert.equal(await outputNode.locator('[data-approval-report-part="revisions"] tbody tr').count(),1);
  await outputNode.screenshot({path:path.join(output,'tna-g26-approval-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const json=await jsonEvent,jsonPath=path.join(output,'tna-g26-approval-buyer.json');
  await json.saveAs(jsonPath);
  const model=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(model.reportId,'R11');assert.equal(model.approvalHistory.mode,'buyer');
  assert.equal(model.approvalHistory.counts.records,1);
  assert.equal(model.source.recordId,null);
  clean(model,'buyer JSON');
  const xlsxEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await xlsxEvent,xlsxPath=path.join(output,'tna-g26-approval.xlsx');
  await excel.saveAs(xlsxPath);
  const book=XLSX.read(fs.readFileSync(xlsxPath),{type:'buffer'});
  assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
   'Approval Decisions','Resubmission Entries','Recorded Task Revisions',
   'Pending Approvals','Report Notes']);
  const decisions=XLSX.utils.sheet_to_json(book.Sheets['Approval Decisions'],{header:1,raw:true});
  assert.equal(decisions.length,2);assert.equal(typeof decisions[1][3],'number');
  clean(Object.values(book.Sheets).flatMap(sh=>XLSX.utils.sheet_to_json(sh,{header:1,raw:true})),'buyer XLSX');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g26-approval.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,document.documentElement.scrollWidth]);
  assert.ok(dims[1]<=dims[0]+2&&dims[2]<=dims[0]+2,'page overflows 390px width');
  assert.equal(await page.locator('.tna-report-approval-scroll').evaluateAll(nodes=>
   nodes.every(node=>node.clientWidth<=node.parentElement.clientWidth+2)),true);
  await page.locator('#tnaApprovalAudience').selectOption('factory');
  assert.equal(await page.locator('#tnaApprovalFactoryConsentWrap').isVisible(),true);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a valid review date/);
  assert.equal(await page.locator('[data-approval-report-part]').count(),0);
  await page.locator('#tnaApprovalFactoryConsent').check();
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  assert.equal(await page.locator('[data-approval-report-part="decisions"] tbody tr').count(),2);
  const factoryPreview=await outputNode.innerText();
  assert.ok(factoryPreview.includes('R11 LIVE FACTORY'));
  clean(factoryPreview,'factory preview');
  await page.locator('#tnaReportType').selectOption('R10');
  assert.equal(await page.locator('#tnaApprovalReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-portfolio').count(),1);
  const saved=await page.evaluate(user=>JSON.parse(localStorage.getItem('vesa.tna360.records.'+user)).records[0].plan,session.userKey);
  assert.equal(JSON.stringify(saved),before,'R11 must not change source saved plan');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('TNA GMR-14 R11 Chromium PASS: buyer/factory gate, history/rounds, typed Excel, JSON, PDF, mobile, privacy, saved orders');
 }finally{await context.close();await browser.close();await new Promise(done=>server.close(done))}
}
run().catch(error=>{console.error(error);process.exitCode=1});
