/**
 * GMR-10 R07 authenticated Chromium proof: internal/buyer audience switching,
 * fail-closed gate, actual local XLSX/JSON/PDF, mobile and old source parity.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),domain=require('../src/domain.js');
const storage=require('../src/storage.js'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
function source(){
 const p=domain.createPlan({templateId:'woven',buyerName:'R07 BROWSER BUYER',
  factoryName:'PRIVATE-BROWSER-FACTORY',styleNo:'R07-STYLE',poNumber:'R07-PO',
  totalQty:2400,buyerRequiredExFactory:'2026-12-20'},{ownerUserId:session.userKey});
 const get=ref=>{const t=p.tasks.find(x=>x.templateRef===ref);assert.ok(t,ref);return t;};
 const cut=get('C05');
 cut.status='in-progress';cut.title='PRIVATE-EDITED-CUTTING-TITLE';
 cut.quantity={required:2400,completed:400,unit:'pcs'};
 cut.proofRefs=['PRIVATE-CUTTING-PROOF'];
 get('C04').status='completed';get('C04').proofRefs=['PRIVATE-CUTTING-START-PROOF'];
 get('C04').dates.actualFinish='2026-10-11';
 get('C06').status='in-progress';
 get('C06').dates.baselineFinish='2026-10-19';
 get('C06').dates.currentTargetFinish='2026-10-20';
 get('C06').dates.forecastFinish='2026-10-21';
 const sew=get('P02');sew.quantity={required:2400,completed:300,unit:'pcs'};
 sew.proofRefs=['PRIVATE-SEW-PROOF'];
 const pack=get('PK03');pack.quantity={required:2400,completed:50,unit:'pcs'};
 pack.proofRefs=[];pack.delayReason='PRIVATE-FACTORY-REMARK';
 p.order.commercialNotes='PRIVATE-MARGIN-FOB-LC';
 p.commitments.masterLcProofRef='PRIVATE-MASTER-LC';
 p.materials=[{supplier:'PRIVATE-SUPPLIER-LOCATION',sourceRef:'PRIVATE-MATERIAL-PROOF'}];
 p.operations=[
  {operationId:'R07-OP-CUT',type:'cut',lotId:null,unit:'pcs',
   qtyInput:1000,qtyCompleted:800,qtyRejected:50,qtyReworked:0,qtyWip:100,
   verifiedDailyOutput:200,rateReviewed:true,rateEvidenceRef:'PRIVATE-RATE-SOURCE',
   rateAsOfDate:'2026-10-14',dailyActuals:[],datedCapacityEntries:[],
   notes:'PRIVATE-OPERATOR-COMMENT'},
  {operationId:'R07-OP-EMPTY',type:'sew',unit:'pcs',lotId:null,
   qtyInput:0,qtyCompleted:0,qtyRejected:0,qtyReworked:0,qtyWip:0,
   datedCapacityEntries:[{date:'2026-10-15',resourceId:'SEW-1',
    allocatedLines:1,availableLines:2}]}
 ];
 p.shipmentLots=[{lotId:'SHIP-1',lotReference:'SHIP-1',plannedQty:500,
  packedQty:480,passedQty:460,shippedQty:440,
  poAllocation:[{poNumber:'R07-PO',qty:500}],factory:'PRIVATE-BROWSER-FACTORY'}];
 return p;
}
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=source(),original=JSON.stringify(plan);
 const records={storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:plan.recordId,updatedAt:'2026-10-15T06:00:00.000Z',
  buyer:plan.order.buyerName,style:'R07-STYLE',po:'R07-PO',plan}]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
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
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
 page.on('download',d=>downloads.push(d.suggestedFilename()));
 const forbidden=['PRIVATE-BROWSER-FACTORY','PRIVATE-EDITED-CUTTING-TITLE',
  'PRIVATE-CUTTING-PROOF','PRIVATE-FACTORY-REMARK','PRIVATE-MARGIN-FOB-LC',
  'PRIVATE-MASTER-LC','PRIVATE-SUPPLIER-LOCATION','PRIVATE-MATERIAL-PROOF',
  'PRIVATE-RATE-SOURCE','PRIVATE-OPERATOR-COMMENT','PRIVATE-BUYER-SHARE-REF'];
 const noSecrets=(value,where)=>{const s=typeof value==='string'?value:JSON.stringify(value);
  for(const secret of forbidden)assert.ok(!s.includes(secret),where+' leaked '+secret);};
 try{
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R07');
  assert.equal(await page.locator('#tnaProdReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaProdAsOf').inputValue(),'');
  assert.equal(await page.locator('#tnaProdMode').inputValue(),'');
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select a valid review date/);
  assert.equal(await page.locator('[data-production-part]').count(),0);
  assert.ok(!(await page.locator('.tna-report-preview').innerText()).includes('PRIVATE-BROWSER-FACTORY'));
  for(const action of ['excel','download','print','share'])await page.locator('[data-report-action="'+action+'"]').click();
  assert.equal(downloads.length,0,'unselected audience cannot export/print');
  assert.equal(await page.locator('body.tna-printing-report').count(),0);
  await page.locator('#tnaProdAsOf').fill('2026-10-15');
  await page.locator('#tnaProdAsOf').dispatchEvent('change');
  await page.locator('#tnaProdMode').selectOption('internal');
  assert.equal(await page.locator('#tnaProdInternalWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaProdBuyerWrap').isVisible(),false);
  assert.equal(await page.locator('[data-production-operations]').count(),0);
  await page.locator('#tnaProdInternalConsent').check();
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  assert.equal(await page.locator('[data-production-part]').count(),2);
  assert.equal(await page.locator('[data-production-operations]').count(),1);
  const internal=await page.locator('.tna-report-preview').innerText();
  assert.ok(internal.includes('PRIVATE-BROWSER-FACTORY'));
  assert.ok(internal.includes('R07-OP-CUT'),'internal op ID present');
  assert.ok(!internal.includes('PRIVATE-OPERATOR-COMMENT'),'free-text op notes excluded');
  assert.ok(internal.includes('10'),'verified rate days present');
  assert.ok(!internal.includes('PRIVATE-MASTER-LC'),'LC evidence not duplicated');
  await page.screenshot({path:path.join(output,'tna-g22-production-internal.png')});
  const first=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const download=await first,internalFile=path.join(output,'tna-g22-production-internal.xlsx');
  await download.saveAs(internalFile);
  const iw=XLSX.read(fs.readFileSync(internalFile),{type:'buffer'});
  assert.ok(iw.SheetNames.includes('Operation Snapshots'));
  const stageRows=XLSX.utils.sheet_to_json(iw.Sheets['Production Stages'],{header:1,raw:true});
  assert.equal(stageRows[1][8],2400);assert.equal(stageRows[1][9],400);
  assert.equal(stageRows[1][10],2000);assert.equal(stageRows[1][13],10);
  assert.ok(typeof stageRows[1][6]==='number','typed Excel source event date');
  await page.locator('#tnaProdMode').selectOption('buyer');
  assert.equal(await page.locator('#tnaProdInternalWrap').isVisible(),false);
  assert.equal(await page.locator('#tnaProdBuyerWrap').isVisible(),true);
  assert.ok(!(await page.locator('.tna-report-preview').innerText()).includes('PRIVATE-BROWSER-FACTORY'));
  assert.equal(await page.locator('[data-production-operations]').count(),0);
  await page.locator('#tnaProdBuyerConsent').check();
  assert.match(await page.locator('#tnaReportGate').innerText(),/authorization source reference/);
  await page.locator('#tnaProdBuyerRef').fill('PRIVATE-BUYER-SHARE-REF');
  await page.locator('#tnaProdBuyerRef').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  const buyerText=await page.locator('.tna-report-preview').innerText();
  noSecrets(buyerText,'R07 browser buyer preview');
  assert.equal(await page.locator('[data-production-operations]').count(),0);
  assert.match(buyerText,/Buyer output contains canonical stages/);
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const json=await jsonEvent,jsonFile=path.join(output,'tna-g22-production-buyer.json');
  await json.saveAs(jsonFile);
  const model=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
  assert.equal(model.reportId,'R07');assert.equal(model.productionStatus.mode,'buyer');
  assert.equal(model.productionStatus.stages.length,4);
  assert.equal(model.productionStatus.operations.length,0);
  assert.equal(model.productionStatus.stages[0].rate,null);
  assert.equal(model.order.factory,model.productionStatus.labels.unknown);
  noSecrets(model,'R07 browser buyer JSON');
  const excelEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const buyerDownload=await excelEvent,buyerFile=path.join(output,'tna-g22-production-buyer.xlsx');
  await buyerDownload.saveAs(buyerFile);
  const bw=XLSX.read(fs.readFileSync(buyerFile),{type:'buffer',cellFormula:true});
  assert.ok(bw.SheetNames.includes('Production Stages'));
  assert.ok(!bw.SheetNames.includes('Operation Snapshots'));
  noSecrets(Object.values(bw.Sheets).flatMap(sheet=>
   Object.entries(sheet).filter(([key])=>!key.startsWith('!')).map(([,cell])=>cell.v)),
   'R07 buyer XLSX');
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g22-production-buyer.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.__productionPrinted=false;window.print=()=>{window.__productionPrinted=true}});
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.evaluate(()=>window.__productionPrinted),true,'real print action is wired');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.locator('#tnaReportType').selectOption('R02');
  assert.equal(await page.locator('#tnaProdReviewWrap').isVisible(),false);
  assert.equal(await page.locator('.tna-report-buyer').count(),1,'R02 buyer remains isolated');
  await page.locator('#tnaReportType').selectOption('R06');
  assert.equal(await page.locator('#tnaDelayReviewWrap').isVisible(),true);
  await page.locator('#tnaReportType').selectOption('R07');
  assert.equal(await page.locator('#tnaProdMode').inputValue(),'buyer');
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,
    document.documentElement.scrollWidth]);
  assert.ok(dims[1]<=dims[0]+2&&dims[2]<=dims[0]+2,'no mobile horizontal page overflow');
  const bounds=await page.locator('.tna-report-production-scroll').evaluateAll(nodes=>
    nodes.map(node=>[node.clientWidth,node.parentElement.clientWidth]));
  assert.ok(bounds.every(([a,b])=>a<=b+2),'tables scroll inside report dialog');
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
    'vesa.tna360.records.'+session.userKey);
  assert.equal(JSON.stringify(saved),original,'R07 does not mutate the source record');
  assert.deepEqual(errors,[],'no browser page errors');
  assert.deepEqual(external,[],'no third-party network calls');
  console.log('TNA GMR-10 R07 Chromium PASS: explicit consent, buyer-safe projection, sourced stage dates/quantities/rate, genuine Excel/JSON/PDF, mobile and unchanged records');
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
