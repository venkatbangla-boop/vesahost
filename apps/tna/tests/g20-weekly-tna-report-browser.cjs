/** GMR-08 real Chromium R05 review, privacy, Excel, print and mobile proof. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const XLSX=require('../vendor/xlsx.full.min.js'),domain=require('../src/domain.js'),storage=require('../src/storage.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const auth={email:'qa@vesaent.com',name:'QA User',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const plan=domain.createPlan({templateId:'woven',buyerName:'WEEKLY QA BUYER',
  factoryName:'PRIVATE-WEEK-FACTORY',styleNo:'R05-WOVEN',poNumber:'R05-PO',
  totalQty:2200,buyerRequiredExFactory:'2026-12-20'},{ownerUserId:auth.userKey});
 const set=(ref,fields)=>{const t=plan.tasks.find(t=>t.templateRef===ref);assert.ok(t,ref);
  const d={...t.dates};Object.assign(t,fields);if(fields.dates)t.dates={...d,...fields.dates};};
 set('D05',{status:'completed',dates:{baselineFinish:'2026-10-12',actualFinish:'2026-10-14'}});
 set('D08',{status:'awaiting-approval',waitingFor:'buyer',
  title:'PRIVATE-SOURCE-TITLE',recoveryAction:'PRIVATE-SOURCE-RECOVERY',
  followUpNote:'PRIVATE-FACTORY-COMMENT',dates:{baselineFinish:'2026-10-14',currentTargetFinish:'2026-10-15'}});
 set('P01',{status:'not-started',dates:{baselineFinish:'2026-10-19'}});
 set('O03',{status:'blocked',title:'PRIVATE-FOB-PRICE',dates:{baselineFinish:'2026-10-13'}});
 const before=JSON.stringify(plan),records={storageVersion:storage.STORAGE_VERSION,records:[{
  recordId:plan.recordId,updatedAt:'2026-10-15T00:00:00.000Z',
  buyer:plan.order.buyerName,style:'R05-WOVEN',po:'R05-PO',plan}]};
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://vesa.test').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const mime=({'.html':'text/html','.js':'application/javascript','.css':'text/css',
    '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(({auth,records})=>{
  localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(auth));
  localStorage.setItem('vesa.tna360.records.'+auth.userKey,JSON.stringify(records));
 },{auth,records});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(origin))external.push(r.url());});
 try{
  await page.goto(origin+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="continue"]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Prepare Report"]').click();
  await page.locator('#tnaReportType').selectOption('R05');
  assert.equal(await page.locator('#tnaWeeklyReviewWrap').isVisible(),true);
  assert.equal(await page.locator('#tnaReportWeekStart').inputValue(),'');
  assert.match(await page.locator('#tnaReportGate').innerText(),/Select valid week/);
  await page.locator('[data-report-action="excel"]').click();
  await page.locator('[data-report-action="print"]').click();
  assert.equal(await page.locator('body.tna-printing-report').count(),0,'invalid dates block print');
  const fill=async(id,value)=>{await page.locator(id).fill(value);await page.locator(id).dispatchEvent('change');};
  await fill('#tnaReportWeekStart','2026-10-12');
  await fill('#tnaReportWeekEnd','2026-10-18');
  await fill('#tnaReportReviewDate','2026-10-16');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  for(const name of ['completed','missed','nextWeek','approvals','recoveries'])
   assert.equal(await page.locator('[data-weekly-group="'+name+'"]').count(),1,name);
  assert.match(await page.locator('[data-weekly-group="completed"]').innerText(),/D05/);
  assert.match(await page.locator('[data-weekly-group="missed"]').innerText(),/D08/);
  assert.match(await page.locator('[data-weekly-group="nextWeek"]').innerText(),/P01/);
  const recovery=page.locator('[data-weekly-recovery-ref="D08"]');
  assert.equal(await recovery.count(),1);
  await recovery.locator('summary').click();
  await recovery.locator('[name="shareApproved"]').check();
  await recovery.locator('[name="publicAction"]').fill('Buyer-safe agreed sample decision');
  await recovery.locator('[name="confirmedBy"]').fill('Reviewed agent');
  await recovery.locator('[name="agreedOn"]').fill('2026-10-14');
  await recovery.locator('[name="evidenceRef"]').fill('PRIVATE-CONFIDENTIAL-PROOF');
  await recovery.locator('[name="evidenceRef"]').dispatchEvent('change');
  assert.equal(await page.locator('#tnaReportGate').innerText(),'');
  assert.match(await page.locator('[data-weekly-group="recoveries"]').innerText(),/Buyer-safe agreed/);
  const jsonEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="download"]').click();
  const json=await jsonEvent;const jsonFile=path.join(output,'tna-g20-weekly.json');await json.saveAs(jsonFile);
  const model=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
  assert.equal(model.weeklyTna.ready,true);
  assert.equal(model.weeklyTna.counts.recoveries,1);
  const excelEvent=page.waitForEvent('download');
  await page.locator('[data-report-action="excel"]').click();
  const xlsx=await excelEvent;const file=path.join(output,'tna-g20-weekly.xlsx');await xlsx.saveAs(file);
  const book=XLSX.read(fs.readFileSync(file),{type:'buffer',cellFormula:true});
  assert.ok(book.SheetNames.includes('Weekly TNA')&&book.SheetNames.includes('Confirmed Recovery'));
  const rows=XLSX.utils.sheet_to_json(book.Sheets['Confirmed Recovery'],{header:1,raw:true});
  assert.ok(rows.some(row=>row[0]==='D08'&&typeof row[3]==='number'));
  for(const value of [JSON.stringify(model),JSON.stringify(XLSX.utils.sheet_to_json(book.Sheets['Weekly TNA'],{header:1})),
   JSON.stringify(rows),await page.locator('.tna-report-preview').innerText()])
   for(const secret of ['PRIVATE-WEEK-FACTORY','PRIVATE-SOURCE-TITLE','PRIVATE-SOURCE-RECOVERY',
    'PRIVATE-FACTORY-COMMENT','PRIVATE-FOB-PRICE','PRIVATE-CONFIDENTIAL-PROOF'])
    assert.ok(!value.includes(secret),'must not leak '+secret);
  await page.screenshot({path:path.join(output,'tna-g20-weekly-preview.png')});
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
  const pdf=path.join(output,'tna-g20-weekly.pdf');
  await page.pdf({path:pdf,landscape:true,printBackground:true,preferCSSPageSize:true});
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  const widths=await page.evaluate(()=>[innerWidth,document.body.scrollWidth,document.documentElement.scrollWidth]);
  assert.ok(widths[1]<=widths[0]+2&&widths[2]<=widths[0]+2,'no mobile outer overflow');
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
   'vesa.tna360.records.'+auth.userKey);
  assert.equal(JSON.stringify(saved),before,'R05 cannot mutate saved source');
  assert.deepEqual(errors,[],'no JS runtime errors');assert.deepEqual(external,[],'no external requests');
  console.log('TNA GMR-08 R05 Chromium PASS: week selection, buyer-safe recovery, genuine Excel, PDF, mobile, immutable source');
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
