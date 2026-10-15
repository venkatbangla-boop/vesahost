/**
 * GMR-12 R09 real authenticated Chromium: explicit gate, source-only lot
 * quantities, typed Excel/JSON, print PDF, mobile and saved-record immutability.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),domain=require('../src/domain.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function fixture(){
 const p=domain.createPlan({templateId:'woven',buyerName:'R09 QA BUYER',factoryName:'R09 QA FACTORY',
  styleNo:'R09-WOVEN',poNumber:'R09-PO',totalQty:100,unit:'pcs',
  buyerRequiredExFactory:'2026-11-10'},{ownerUserId:session.userKey});
 p.shipmentLots=[{lotId:'L1',lotReference:'SPLIT-01',plannedQty:60,packedQty:50,passedQty:40,
  shippedQty:10,poAllocation:[{poNumber:'R09-PO',qty:60}],unit:'pcs',
  requestedExFactory:'2026-10-15',currentExFactory:'2026-10-16',
  forecastExFactory:'2026-10-17',actualExFactory:'2026-10-14',
  ETD:'2026-10-20',ETA:'2026-11-01',bookingRef:'PRIVATE-BOOKING-ID',inspectionRef:'PRIVATE-AQL-ID'},
 {lotId:'L2',lotReference:'SPLIT-02',plannedQty:40,packedQty:30,passedQty:20,
  shippedQty:0,poAllocation:[{poNumber:'R09-PO',qty:40}],unit:'pcs'}];
 p.order.commercialNotes='PRIVATE-FOB-COMMISSION';
 p.integrationReferences=[{sourceApp:'aql',recordedStatus:'CONFORMED',sourceRecordId:'PRIVATE-SOURCE-AQL'}];
 return p;
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=fixture(),before=JSON.stringify(plan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{recordId:plan.recordId,
  updatedAt:'2026-10-15T06:00:00.000Z',buyer:plan.order.buyerName,
  style:'R09-WOVEN',po:'R09-PO',plan}]};
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
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
 const clean=value=>{
  const text=typeof value==='string'?value:JSON.stringify(value);
  for(const secret of ['PRIVATE-BOOKING-ID','PRIVATE-AQL-ID','PRIVATE-SOURCE-AQL','PRIVATE-FOB-COMMISSION',
   'PRIVATE-REVIEW-AUTHORITY'])assert.ok(!text.includes(secret),'R09 leaked '+secret);
 };
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R09');
  assert.equal(await page.locator('#tnaShipmentReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaShipmentAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaShipmentConsent').isChecked(),false);
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a valid quality/);
  assert.equal(await page.locator('[data-shipment-part="lots"] tbody tr').count(),0);
  for(const key of ['excel','download','print','share'])
   await page.locator('[data-report-action="'+key+'"]').click();
  await page.locator('#tnaShipmentAsOf').fill('2026-10-15');
  await page.locator('#tnaShipmentConsent').check();
  assert.match(await page.locator('#tnaReportGate').innerText(),/authority source reference/);
  await page.locator('#tnaShipmentAuthorityRef').fill('PRIVATE-REVIEW-AUTHORITY');
  await page.locator('#tnaShipmentAuthorityRef').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const preview=page.locator('.tna-report-shipment');
  const text=await preview.innerText();
  assert.match(text,/SPLIT-01/);assert.match(text,/SPLIT-02/);
  assert.match(text,/do not independently authorize shipment/);
  clean(text);
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const json=await jsonEvent,jsonPath=path.join(output,'tna-g24-shipment.json');
  await json.saveAs(jsonPath);
  const report=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(report.shipmentReadiness.ready,true);
  assert.deepEqual(report.shipmentReadiness.summary,{ordered:100,unit:'pcs',planned:100,
   packed:80,passed:60,shipped:10,unplanned:0,unshipped:90,sourceOnly:true});
  clean(report);
  const xlsxEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const excel=await xlsxEvent,xlsxPath=path.join(output,'tna-g24-shipment.xlsx');
  await excel.saveAs(xlsxPath);
  const book=XLSX.read(fs.readFileSync(xlsxPath),{type:'buffer'});
  assert.deepEqual(book.SheetNames,['Report Summary','Order Summary','Report Activities',
   'Shipment Lots','PO Allocations','Shipping Milestones','PPM AQL References','Report Notes']);
  const cells=XLSX.utils.sheet_to_json(book.Sheets['Shipment Lots'],{header:1,raw:true});
  assert.equal(cells[1][1],60);assert.equal(cells[1][4],10);
  assert.equal(typeof cells[1][6],'number');clean(Object.values(book.Sheets).map(sh=>XLSX.utils.sheet_to_json(sh,{header:1,raw:true})));
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g24-shipment.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,document.documentElement.scrollWidth]);
  assert.ok(dims[1]<=dims[0]+2&&dims[2]<=dims[0]+2,'mobile page overflow');
  await page.locator('#tnaReportType').selectOption('R08');
  assert.equal(await page.locator('#tnaShipmentReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-material-lc').count(),1);
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).records[0].plan,
   'vesa.tna360.records.'+session.userKey);
  assert.equal(JSON.stringify(saved),before,'R09 never changes stored OrderPlan');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('GMR-12 R09 real Chromium PASS: gate, source lots, XLSX, JSON, PDF, mobile, isolation, saved records');
 }finally{await context.close();await browser.close();await new Promise(done=>server.close(done))}
}
run().catch(e=>{console.error(e);process.exitCode=1});
