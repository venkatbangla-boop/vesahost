/**
 * GMR-13 R10 authenticated real Chromium: direct portfolio screen, explicit
 * order selection, privacy, real multi-order Excel/JSON/PDF, mobile and storage.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),domain=require('../src/domain.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function order(buyer,factory,po,qty,templateId='knit'){
 const p=domain.createPlan({templateId,buyerName:buyer,factoryName:factory,
  styleNo:'STYLE-'+po,poNumber:po,totalQty:qty,unit:'pcs',
  buyerRequiredExFactory:'2026-10-20'},{ownerUserId:session.userKey});
 p.order.commercialNotes='PRIVATE-FOB-COMMISSION';
 p.commitments.masterLcProofRef='PRIVATE-MASTER-LC';
 const action=p.tasks.find(t=>t.templateRef==='PP08');
 if(action){action.status='blocked';action.title='PRIVATE-FACTORY-REMARK';
  action.dates.currentTargetFinish='2026-10-14';action.proofRefs=['PRIVATE-PPM-PROOF'];}
 return p;
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const a=order('BUYER INCLUDED','FACTORY NORTH','PO-A',600);
 a.order.poNumbers=['PO-A','PO-B'];
 const b=order('BUYER INCLUDED','FACTORY SOUTH','PO-C',400,'woven');
 const c=order('BUYER EXCLUDED','FACTORY WEST','PO-SECRET',123,'denim');
 const practice=order('TRAINING ONLY','PRACTICE FACTORY','PRACTICE-PO',10);
 practice.mode='practice';
 const other=order('OTHER USER SECRET','OTHER FACTORY','USER-SECRET-PO',999);
 const saved=[a,b,c,practice].map(p=>({recordId:p.recordId,updatedAt:'2026-10-15T06:00:00Z',
  buyer:p.order.buyerName,style:p.order.styles?.[0]?.styleNo,po:p.order.poNumbers?.[0],plan:p}));
 const records={storageVersion:storage.STORAGE_VERSION,records:saved};
 const otherBox={storageVersion:storage.STORAGE_VERSION,records:[{recordId:other.recordId,plan:other}]};
 const prior=JSON.stringify(records),priorOther=JSON.stringify(otherBox);
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const mime=({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json',
    '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({session,records,otherBox})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));
  if(!localStorage.getItem('vesa.tna360.records.'+session.userKey))
   localStorage.setItem('vesa.tna360.records.'+session.userKey,JSON.stringify(records));
  localStorage.setItem('vesa.tna360.records.other-person',JSON.stringify(otherBox));
 },{session,records,otherBox});
 const page=await context.newPage(),errors=[],external=[],downloads=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
 page.on('download',dl=>downloads.push(dl.suggestedFilename()));
 const noSecrets=(value,where)=>{
  const txt=typeof value==='string'?value:JSON.stringify(value);
  for(const secret of ['PRIVATE-FOB-COMMISSION','PRIVATE-MASTER-LC','PRIVATE-FACTORY-REMARK',
   'PRIVATE-PPM-PROOF','PRIVATE-REVIEW-AUTHORITY','BUYER EXCLUDED','PO-SECRET',
   'OTHER USER SECRET','USER-SECRET-PO','TRAINING ONLY'])
   assert.ok(!txt.includes(secret),where+' leaked '+secret);
 };
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('[data-tna-portfolio-report]').count(),1);
  await page.locator('[data-tna-portfolio-report]').click();
  assert.equal(await page.locator('#tnaReportType').inputValue(),'R10');
  assert.equal(await page.locator('#tnaPortfolioReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaPortfolioAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaPortfolioConsent').isChecked(),false);
  assert.equal(await page.locator('[data-portfolio-report-record]').count(),3,
   'practice is not offered in management report selector');
  assert.equal(await page.locator('[data-portfolio-report-record]:checked').count(),0);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Choose saved orders/);
  assert.equal(await page.locator('[data-portfolio-report-part]').count(),0);
  for(const action of ['excel','download','print','share'])
   await page.locator('[data-report-action="'+action+'"]').click();
  assert.equal(downloads.length,0);
  await page.locator('#tnaPortfolioAsOf').fill('2026-10-15');
  await page.locator('#tnaPortfolioConsent').check();
  await page.locator('#tnaPortfolioAuthority').fill('PRIVATE-REVIEW-AUTHORITY');
  await page.locator('#tnaPortfolioAuthority').dispatchEvent('change');
  assert.match(await page.locator('#tnaReportGate').innerText(),/Choose saved orders/);
  await page.locator('[data-portfolio-report-record][value="'+a.recordId+'"]').check();
  await page.locator('[data-portfolio-report-record][value="'+b.recordId+'"]').check();
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('.tna-report-preview'),previewText=await preview.innerText();
  assert.match(previewText,/PO-A, PO-B/);assert.match(previewText,/PO-C/);
  assert.match(previewText,/BUYER INCLUDED/);assert.match(previewText,/FACTORY SOUTH/);
  assert.match(previewText,/cross-order critical path/);
  noSecrets(previewText,'R10 preview');
  assert.equal(await preview.locator('[data-portfolio-report-part="identity"] tbody tr').count(),2);
  assert.equal(await preview.locator('[data-portfolio-report-part="dates"] tbody tr').count(),2);
  assert.equal(await preview.locator('[data-portfolio-report-part="groups"]').count(),1);
  await preview.screenshot({path:path.join(output,'tna-g25-portfolio-preview.png')});
  const event=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const dl=await event,jsonPath=path.join(output,'tna-g25-portfolio.json');
  await dl.saveAs(jsonPath);
  const model=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(model.reportId,'R10');assert.equal(model.portfolioReport.summary.orders,2);
  assert.equal(model.portfolioReport.summary.poReferences,3);
  assert.equal(model.source.recordId,null,'unselected current order never attributed');
  noSecrets(model,'R10 JSON');
  const xEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await xEvent,xPath=path.join(output,'tna-g25-portfolio.xlsx');
  await excel.saveAs(xPath);
  const book=XLSX.read(fs.readFileSync(xPath),{type:'buffer'});
  assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
   'Portfolio Orders','Portfolio Follow-ups','Portfolio Groups','Report Notes']);
  const cells=XLSX.utils.sheet_to_json(book.Sheets['Portfolio Orders'],{header:1,raw:true});
  assert.equal(cells.length,3);assert.equal(cells[1][5],600);assert.equal(cells[2][5],400);
  assert.equal(typeof cells[1][9],'number');
  noSecrets(Object.values(book.Sheets).flatMap(sh=>XLSX.utils.sheet_to_json(sh,{header:1,raw:true})),'R10 Excel');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g25-portfolio.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  const dimensions=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,document.documentElement.scrollWidth]);
  assert.ok(dimensions[1]<=dimensions[0]+2&&dimensions[2]<=dimensions[0]+2,'mobile page overflow');
  const contained=await page.locator('.tna-report-portfolio-scroll').evaluateAll(nodes=>
   nodes.every(node=>node.clientWidth<=node.parentElement.clientWidth+2));
  assert.equal(contained,true,'wide tables must scroll inside dialog');
  const after=await page.evaluate(k=>localStorage.getItem(k),'vesa.tna360.records.'+session.userKey);
  assert.equal(after,prior,'R10 export never writes saved orders');
  assert.equal(await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.other-person')),priorOther);
  assert.deepEqual(errors,[],'no browser errors');assert.deepEqual(external,[],'no external network');
  console.log('TNA GMR-13 R10 Chromium PASS: local multi-order selector, deny-by-default, XLSX/JSON/PDF/mobile, privacy, unchanged user records');
 }finally{await context.close();await browser.close();await new Promise(done=>server.close(done))}
}
run().catch(err=>{console.error(err);process.exitCode=1});
