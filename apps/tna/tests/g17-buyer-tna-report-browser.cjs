/**
 * GMR-05 R02 genuine Chromium buyer audience test.
 * Authenticated local TNA, no external service or source customer data.
 * Exercises preview, download (JSON and real XLSX), and browser print PDF.
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
const privateStrings=['BROWSER-PRIVATE-FACTORY','BROWSER-SECRET-LC-PROOF','BROWSER-PRIVATE-FOB','BROWSER-HIDDEN-TASK-NOTE','BROWSER-PRIVATE-EVIDENCE'];
function seededRecords(){
 const plan=domain.createPlan({
  templateId:'knit',buyerName:'SYNTHETIC BUYER R02',factoryName:privateStrings[0],
  styleNo:'STYLE-GMR-R02',poNumber:'PO-GMR-R02',totalQty:2200,buyerRequiredExFactory:'2026-12-20'
 },{ownerUserId:session.userKey});
 plan.order.commercialNotes=privateStrings[2];
 plan.commitments.masterLcProofRef=privateStrings[1];
 plan.validation={ok:true,errors:[],warnings:[privateStrings[2]]};
 const fit=plan.tasks.find(t=>t.templateRef==='D08');
 fit.title=privateStrings[3];
 fit.followUpNote=privateStrings[3];
 fit.proofRefs=[privateStrings[4]];
 fit.waitingFor='buyer';
 fit.status='awaiting-approval';
 fit.dates.baselineFinish='2026-11-10';
 fit.dates.currentTargetFinish='2026-11-14';
 fit.dates.forecastFinish='2026-11-16';
 plan.tasks.find(t=>t.templateRef==='O03').title=privateStrings[2];
 return {storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:plan.recordId,updatedAt:'2026-10-15T05:00:00.000Z',
  buyer:'SYNTHETIC BUYER R02',style:'STYLE-GMR-R02',po:'PO-GMR-R02',plan
 }]};
}
const mime=p=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png',
 '.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json','.ttf':'font/ttf'})[path.extname(p)]||'application/octet-stream';
function assertSafe(input,message){
 const text=String(input);
 for(const secret of privateStrings)assert.ok(!text.includes(secret),message+' leaked '+secret);
 assert.ok(!text.includes('O03'),message+' included commercial FOB stage');
 assert.ok(!text.includes('Master LC evidence'),message+' included internal LC');
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const original=seededRecords(),originalJson=JSON.stringify(original.records[0].plan);
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);
  let target=path.resolve(root,'.'+pathname);
  if(!target.startsWith(root+path.sep))return res.writeHead(403).end();
  try{
   if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');
   res.writeHead(200,{'Content-Type':mime(target),'Cache-Control':'no-store'}).end(fs.readFileSync(target));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({auth,records})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(auth));
  if(!localStorage.getItem('vesa.tna360.records.'+auth.userKey))
   localStorage.setItem('vesa.tna360.records.'+auth.userKey,JSON.stringify(records));
 },{auth:session,records:original});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R02');
  const preview=page.locator('#tnaReportPreview .tna-report-preview');
  await preview.waitFor({state:'visible'});
  assert.equal(await preview.locator('.tna-report-buyer-table').count(),3,'two milestone and one buyer action table');
  const firstCount=await preview.locator('[data-buyer-part="1"] tbody tr').count();
  assert.ok(firstCount>12&&firstCount<original.records[0].plan.tasks.length,
    'buyer-safe view contains a bounded milestone subset, not every internal task');
  const previewText=await preview.innerText();
  assert.match(previewText,/Buyer milestones/);
  assert.match(previewText,/Buyer actions/);
  assert.match(previewText,/2026-11-14/);
  assert.match(previewText,/2026-11-16/);
  assert.match(previewText,/Buyer response requested/);
  assert.match(previewText,/Needs Information/);
  assertSafe(previewText,'R02 HTML report');
  const dimensions=await preview.evaluate(el=>({
   w:el.clientWidth,full:el.scrollWidth,
   tables:[...el.querySelectorAll('.tna-report-buyer-scroll')].map(e=>({w:e.clientWidth,parent:e.parentElement.clientWidth}))
  }));
  assert.ok(dimensions.full<=dimensions.w+2,'desktop buyer preview should not overflow');
  assert.ok(dimensions.tables.every(x=>x.w<=x.parent+2));
  await preview.screenshot({path:path.join(output,'tna-g17-r02-buyer-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const jsonFile=await jsonEvent;
  const jsonPath=path.join(output,'tna-g17-r02-buyer-data.json');
  await jsonFile.saveAs(jsonPath);
  const text=fs.readFileSync(jsonPath,'utf8'),downloaded=JSON.parse(text);
  assertSafe(text,'R02 downloaded data');
  assert.equal(downloaded.reportId,'R02');
  assert.equal(downloaded.masterSheet,null);
  assert.equal(downloaded.buyerTna.buyerConfirmedTarget,null);
  const excelEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await excelEvent;
  const excelPath=path.join(output,'tna-g17-r02-buyer.xlsx');
  await excel.saveAs(excelPath);
  const workbook=XLSX.read(fs.readFileSync(excelPath),{type:'buffer',cellFormula:true});
  assert.deepEqual(workbook.SheetNames,
   ['Report Summary','Order Summary','Report Activities','Buyer Milestones','Buyer Actions','Report Notes']);
  const cells=Object.values(workbook.Sheets).flatMap(sheet=>
   Object.entries(sheet).filter(([key])=>!key.startsWith('!')).map(([,cell])=>String(cell.v??''))).join(' / ');
  assertSafe(cells,'R02 real XLSX');
  const milestones=XLSX.utils.sheet_to_json(workbook.Sheets['Buyer Milestones'],{header:1,raw:true});
  const fit=milestones.find(row=>row[0]==='D08');
  assert.ok(fit&&typeof fit[2]==='number'&&typeof fit[3]==='number'&&typeof fit[4]==='number',
    'R02 real Excel uses typed dates');
  const order=XLSX.utils.sheet_to_json(workbook.Sheets['Order Summary'],{header:1,raw:true});
  assert.equal(order[1][1],'Needs Information','never export private factory name');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdfPath=path.join(output,'tna-g17-r02-buyer-print.pdf');
  await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'}); // Restore interactive controls after PDF proof.
  assert.equal(await page.locator('#tnaReportType').isVisible(),true,
    'report controls become interactive again after print proof');
  const pdf=fs.readFileSync(pdfPath);
  assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
  const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
  assert.ok(pages>=1,'print route must create at least one PDF page');
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
    'vesa.tna360.records.'+session.userKey);
  assert.equal(JSON.stringify(stored),originalJson,'report cannot mutate buyer or factory records');
  await page.locator('#tnaReportType').selectOption('R01');
  assert.equal(await page.locator('.tna-report-master').count(),1,'factory R01 stays available separately');
  await page.locator('#tnaReportType').selectOption('R02');
  await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>({w:innerWidth,b:document.body.scrollWidth,d:document.documentElement.scrollWidth}));
  assert.ok(mobile.b<=mobile.w+2&&mobile.d<=mobile.w+2,'buyer preview should not create page overflow on mobile');
  assertSafe(await preview.innerText(),'mobile R02 preview');
  assert.deepEqual(errors,[],'no browser JavaScript exception');
  assert.deepEqual(external,[],'no external requests');
  console.log('TNA GMR-05 R02 browser PASS: buyer-safe preview/JSON/typed Excel/print PDF, mobile and R01 parity, old record immutable');
 }finally{await context.close();await browser.close();await new Promise(r=>server.close(r));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
