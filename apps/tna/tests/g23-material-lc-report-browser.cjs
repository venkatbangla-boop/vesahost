/**
 * GMR-11 R08 authenticated Chromium acceptance: commercial-only gate,
 * sourced Master vs supplier B2B events, actual XLSX/JSON/printed PDF, mobile,
 * report isolation and preservation of locally saved orders.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),domain=require('../src/domain.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const SECRETS=['PRIVATE-LC-DOCUMENT-PROOF','PRIVATE-B2B-APPLICATION-PROOF',
 'PRIVATE-FABRIC-QC-DOCUMENT','PRIVATE-FACTORY-MATERIAL-REMARK',
 'PRIVATE-COMMERCIAL-AUTHORITY','PRIVATE-FOB-COMMISSION-PRICE',
 'PRIVATE-BANK-ACCOUNT-ID'];
function fixture(){
 const p=domain.createPlan({templateId:'woven',buyerName:'R08 BROWSER BUYER',
  factoryName:'R08 SOURCE FACTORY',styleNo:'R08-WOVEN',poNumber:'R08-PO',
  totalQty:2400,buyerRequiredExFactory:'2026-12-20'},
  {ownerUserId:session.userKey});
 p.commitments.masterLcStatus='opened';
 p.commitments.masterLcOpenedOn='2026-10-10';
 p.commitments.masterLcProofRef=SECRETS[0];
 p.order.commercialNotes=SECRETS[5];
 p.materials=[
  {materialId:'F-01',category:'fabric',supplier:'R08 SOURCE FABRIC SUPPLIER',
   country:'China',paymentMethod:'b2b-lc',requiredQty:1300.5,
   unit:'kg',bookingDate:'2026-10-08',masterLcRef:SECRETS[6],
   b2bLcApplicationDate:'2026-10-10',b2bLcOpenDate:'2026-10-12',
   inHouseDate:'2026-10-13',QCDate:'2026-10-14',shortageQty:70.5,
   evidenceRefs:[SECRETS[2]],remarks:SECRETS[3],price:'PRIVATE-PRICE'},
  {materialId:'T-02',category:'trims',supplier:'R08 TRIM SOURCE',
   country:'Bangladesh',paymentMethod:'b2b-lc',requiredQty:2400,
   unit:'sets',bookingDate:'2026-10-11',b2bLcApplicationDate:'2026-10-13',
   b2bLcOpenDate:null,inHouseDate:null,QCDate:null,shortageQty:null,
   evidenceRefs:[SECRETS[1]],remarks:SECRETS[3]}
 ];
 const task=ref=>{const t=p.tasks.find(x=>x.templateRef===ref);assert.ok(t,ref);return t;};
 const fp=task('FP15');fp.status='completed';fp.proofRefs=['PRIVATE-FABRIC-INHOUSE-PROOF'];
 fp.dates.baselineFinish='2026-10-12';fp.dates.actualFinish='2026-10-13';
 const tr=task('TR07');tr.status='not-started';tr.proofRefs=[];
 tr.dates.baselineFinish='2026-10-17';
 const qc=task('FP16');qc.status='in-progress';qc.dates.actualFinish='2026-10-14';
 qc.proofRefs=['PRIVATE-QC-CHECK-NOT-PASSED'];
 p.suppliers=[{supplierId:'S-01',bankAccount:SECRETS[6]}];
 return p;
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=fixture(),before=JSON.stringify(plan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:plan.recordId,updatedAt:'2026-10-15T06:00:00.000Z',
  buyer:plan.order.buyerName,style:'R08-WOVEN',po:'R08-PO',plan}]};
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
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
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
 const noSecrets=(value,where)=>{
  const text=typeof value==='string'?value:JSON.stringify(value);
  for(const secret of SECRETS)assert.ok(!text.includes(secret),where+' leaked '+secret);
  assert.ok(!text.includes('PRIVATE-PRICE'),where+' leaked source price');
  assert.ok(!text.includes('PRIVATE-FABRIC-INHOUSE-PROOF'),where+' leaked task evidence');
 };
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R08');
  assert.equal(await page.locator('#tnaMaterialReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaMaterialAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaMaterialConsent').isChecked(),false);
  assert.equal(await page.locator('#tnaMaterialAuthorityRef').inputValue(),'');
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a valid review date/);
  assert.equal(await page.locator('[data-material-group]').count(),0,
   'sensitive suppliers hidden until commercial review');
  assert.ok(!(await page.locator('.tna-report-preview').innerText()).includes('R08 SOURCE FABRIC SUPPLIER'));
  for(const action of ['excel','download','print','share'])
   await page.locator('[data-report-action="'+action+'"]').click();
  assert.equal(downloads.length,0,'unauthorized report cannot export');
  assert.equal(await page.locator('body.tna-printing-report').count(),0);
  await page.locator('#tnaMaterialAsOf').fill('2026-10-15');
  await page.locator('#tnaMaterialAsOf').dispatchEvent('change');
  await page.locator('#tnaMaterialConsent').check();
  assert.match(await page.locator('#tnaReportGate').innerText(),/authority source reference/);
  await page.locator('#tnaMaterialAuthorityRef').fill(SECRETS[4]);
  await page.locator('#tnaMaterialAuthorityRef').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('.tna-report-preview');
  const text=await preview.innerText();
  assert.match(text,/R08 SOURCE FABRIC SUPPLIER/);
  assert.match(text,/R08 TRIM SOURCE/);
  assert.match(text,/OPENING NOT VERIFIED/,'application must not say LC opened');
  assert.match(text,/bank verification NOT ESTABLISHED/);
  assert.match(text,/QC date recorded, pass\/fail decision NOT verified/);
  assert.ok(text.includes('70.5'));
  noSecrets(text,'commercial preview');
  for(const kind of ['sources','lc','readiness'])
   assert.equal(await preview.locator('[data-material-group="'+kind+'"]').count(),1);
  assert.equal(await preview.locator('[data-material-milestones]').count(),1);
  await preview.screenshot({path:path.join(output,'tna-g23-material-preview.png')});
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const jsonDl=await jsonEvent,jsonFile=path.join(output,'tna-g23-material.json');
  await jsonDl.saveAs(jsonFile);
  const m=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
  assert.equal(m.reportId,'R08');assert.equal(m.materialLcReport.ready,true);
  assert.equal(m.materialLcReport.master.status,'opened');
  assert.equal(m.materialLcReport.master.openedOn,'2026-10-10');
  assert.equal(m.materialLcReport.materials.find(x=>x.ref==='T-02').b2bOpened,null);
  assert.equal(m.materialLcReport.materials.find(x=>x.ref==='T-02').b2bState,
   m.materialLcReport.labels.applied);
  assert.equal(m.materialLcReport.materials.find(x=>x.ref==='F-01').qcState,
   m.materialLcReport.labels.qcUnknown);
  noSecrets(m,'commercial JSON');
  const excelEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await excelEvent,file=path.join(output,'tna-g23-material.xlsx');
  await excel.saveAs(file);
  const book=XLSX.read(fs.readFileSync(file),{type:'buffer',cellFormula:true});
  assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
   'Master LC Review','Material Sources','Sourcing Milestones','Report Notes']);
  const master=XLSX.utils.sheet_to_json(book.Sheets['Master LC Review'],{header:1,raw:true});
  assert.ok(master[1][0]==='opened'&&typeof master[1][1]==='number');
  const mat=XLSX.utils.sheet_to_json(book.Sheets['Material Sources'],{header:1,raw:true});
  const fabric=mat.find(x=>x[0]==='F-01');
  assert.ok(fabric&&fabric[6]===1300.5&&fabric[8]===70.5);
  for(const pos of [9,10,11,13,14])assert.equal(typeof fabric[pos],'number','Excel date '+pos);
  const trims=mat.find(x=>x[0]==='T-02');
  assert.ok(trims&&trims[11]===m.materialLcReport.labels.missing);
  noSecrets(Object.values(book.Sheets).flatMap(sh=>Object.entries(sh)
   .filter(([address])=>!address.startsWith('!')).map(([,cell])=>cell.v)),
   'commercial XLSX');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g23-material.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.__r08Printed=false;window.print=()=>{window.__r08Printed=true;};});
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.evaluate(()=>window.__r08Printed),true,'real browser print action wired');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.locator('#tnaReportType').selectOption('R02');
  assert.equal(await page.locator('#tnaMaterialReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-buyer').count(),1);
  assert.ok(!(await page.locator('.tna-report-buyer').innerText()).includes('R08 SOURCE FABRIC SUPPLIER'));
  await page.locator('#tnaReportType').selectOption('R07');
  assert.equal(await page.locator('#tnaProdReviewWrap').isVisible(),true);
  await page.locator('#tnaReportType').selectOption('R08');
  assert.equal(await page.locator('#tnaMaterialAsOf').inputValue(),'2026-10-15');
  assert.equal(await page.locator('#tnaMaterialConsent').isChecked(),true);
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,
   document.documentElement.scrollWidth]);
  assert.ok(dims[1]<=dims[0]+2&&dims[2]<=dims[0]+2,'no mobile page horizontal overflow');
  const tableWidths=await page.locator('.tna-report-material-scroll').evaluateAll(nodes=>
   nodes.map(n=>[n.clientWidth,n.parentElement.clientWidth]));
  assert.ok(tableWidths.every(([w,max])=>w<=max+2),'wide material tables remain inside dialog');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).records[0].plan,
   'vesa.tna360.records.'+session.userKey);
  assert.equal(JSON.stringify(saved),before,'R08 never mutates TNA source');
  assert.deepEqual(errors,[],'no browser errors');
  assert.deepEqual(external,[],'no external network calls');
  console.log('TNA GMR-11 R08 Chromium PASS: commercial date/authority/consent gate, Master/B2B separation, source QC, privacy, typed Excel/JSON/PDF/mobile and unchanged records');
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(err=>{console.error(err);process.exitCode=1;});
