/* APP-14 real Chromium synthetic case, disputed vs agreed balance, atomic source copies and EN/BN/HI/TA. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',
  JSON.stringify({email:'synthetic-claims@vesaent.com',name:'SYNTHETIC CLAIMS',role:'admin',
   userKey:'synthetic-claims-vesaent-com',loginAt:'2026-10-17T00:00:00Z',
   expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 const action=async key=>page.locator('[data-action="'+key+'"]').first().click();
 const fill=async values=>{for(const [k,v]of Object.entries(values)){
  const el=page.locator('#clmDialog [name="'+k+'"]');
  if(!await el.count())throw Error('Claims source form missing '+k);
  if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(v));else await el.fill(String(v));
 }};
 const submit=async()=>{await page.locator('#clmDialog form button[type=submit]').click();
  await page.locator('#clmDialog[open]').waitFor({state:'hidden',timeout:12000});};
 const records=()=>page.evaluate(()=>{
  const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.claims-disputes.records.v1.'));
  return key?JSON.parse(localStorage.getItem(key)).records:[];});
 try{
  fs.mkdirSync(out,{recursive:true});
  await page.goto(base+'/apps/claims-disputes/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action=new]').waitFor({timeout:14000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'One shared VESA global shell');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'One six-command universal menu');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/);
  await action('new');await fill({
   caseNumber:'SYN CLAIM-001',buyer:'SYN BUYER',supplier:'SYN SUPPLIER',poNo:'SYN-PO-1',
   shipmentRef:'SYN-SHIP-1',claimCategory:'SYN SHORT SHIPMENT',
   openedDate:'2026-10-17',sourceRef:'SYN CLAIM DOSSIER',
   allegationSummary:'SYN alleged 20 pieces short',reviewedBy:'SYN CLAIM OWNER',
   reviewDate:'2026-10-17'});await submit();
  assert.equal((await records()).length,1);assert.match((await records())[0].authority,/NO LIABILITY/);
  await action('add-finding');await fill({
   category:'SYN SHORTAGE',description:'SYN CARTON DISCREPANCY',
   affectedQty:'20',quantityUnit:'pieces',sourceRef:'SYN CARTON COUNT SOURCE',
   sourceDate:'2026-10-17',reviewedBy:'SYN QA',reviewDate:'2026-10-17',
   valueReviewState:'locally-reviewed-claim-value',allegedAmount:'125.50',currency:'USD',
   amountSourceRef:'SYN CLAIM VALUE CALC',amountReviewedBy:'SYN FINANCE',
   amountReviewDate:'2026-10-17'});await submit();
  assert.equal((await records())[0].findings.length,1);
  await action('add-finding');await fill({
   category:'SYN MATERIAL SHADE',description:'SYN under review',
   affectedQty:'5',quantityUnit:'pieces',sourceRef:'SYN QA NOTE',
   sourceDate:'2026-10-17',reviewedBy:'SYN QA',reviewDate:'2026-10-17',
   valueReviewState:'needs-information'});await submit();
  assert.equal((await records())[0].findings.length,2);
  await action('summary');
  assert.match(await page.locator('.clm-card').last().innerText(),/125\.50/);
  assert.match(await page.locator('.clm-card').last().innerText(),/Unvalued Findings/);
  await action('evidence');await action('add-evidence');await fill({
   sourceApp:'AQL',recordType:'InspectionRef',recordId:'SYN-AQL-1',revisionId:'R2',
   sourceRef:'SYN AQL SOURCE EXPORT',evidenceSummary:'SYN AQL finding, liability not admitted',
   sourceDate:'2026-10-17',reviewedBy:'SYN INSPECTOR',reviewDate:'2026-10-17'});await submit();
  assert.equal((await records())[0].evidence.length,1);
  await action('responses');await action('add-response');await fill({
   party:'SYN SUPPLIER',responseSummary:'SYN supplier disputes short quantity',
   receivedDate:'2026-10-17',sourceRef:'SYN SUPPLIER MESSAGE COPY',
   reviewedBy:'SYN MERCHANDISER',reviewDate:'2026-10-17',stance:'disputed'});await submit();
  assert.equal((await records())[0].responses.length,1);
  await action('agreements');await action('add-agreement');await fill({
   agreedAmount:'80.00',currency:'USD',agreementDate:'2026-10-17',
   sourceRef:'SYN SIGNED AGREEMENT SOURCE',externalAuthorityRef:'SYN EXTERNAL SIGNED DOCUMENT',
   externallyNamedParty:'SYN BUYER AND SUPPLIER',reviewedBy:'SYN REVIEWER',
   reviewDate:'2026-10-17'});await submit();
  const agreedId=(await records())[0].agreements[0].id;
  assert.equal((await records())[0].agreements.length,1);
  await action('settlements');await action('add-settlement');await fill({
   agreementId:agreedId,kind:'draft-credit',amount:'20.00',currency:'USD',
   recordedDate:'2026-10-17',sourceRef:'SYN DRAFT CREDIT MEMO',
   reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17'});await submit();
  assert.equal((await records())[0].settlements.length,1);
  await action('add-settlement');await fill({
   agreementId:agreedId,kind:'documented-receipt',amount:'30.00',currency:'USD',
   recordedDate:'2026-10-17',sourceRef:'SYN ACTUAL RECEIPT SOURCE',
   reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17',
   actualReceiptRef:'SYN RECEIPT 001',receiptReviewedBy:'SYN RECEIPT REVIEW',
   receiptReviewDate:'2026-10-17'});await submit();
  assert.equal((await records())[0].settlements.length,2);
  await action('summary');
  assert.match(await page.locator('.clm-card').last().innerText(),/50\.00/,'Partial locally evidenced receipt leaves balance');
  assert.equal(await page.evaluate(()=>window.VesaClaims360.E.localStatus(window.VesaClaims360.current).state),'open',
   'Partial receipt cannot auto-close/auto-agree claim');
  await action('decisions');await action('add-decision');await fill({
   newState:'agreed',decisionDate:'2026-10-17',decisionSourceRef:'SYN CASE DECISION REGISTER',
   reviewedBy:'SYN CLAIM REVIEW',reviewDate:'2026-10-17',
   externalAuthorityRef:'SYN EXTERNAL SIGNED AUTHORITY',externallyNamedParty:'SYN BUYER+SUPPLIER',
   closureBasis:''});await submit();
  assert.equal(await page.evaluate(()=>window.VesaClaims360.E.localStatus(window.VesaClaims360.current).state),'agreed');
  // M3 user-selected AQL InspectionRef envelope: no sibling private storage and no AQL alteration.
  const source={sourceApp:'aql',recordType:'InspectionRef',recordId:'SYN-AQL-1',
   revisionId:'R2',sourceDate:'2026-10-16',verifiedBy:'SYN AQL REVIEWER',
   verifiedAt:'2026-10-17T08:00:00Z',
   displaySnapshot:{buyer:'SYN BUYER',poNo:'SYN-PO-1',inspectionId:'SYN-INSPECTION-1',
    stageId:'FINAL',outcome:'FAIL',evidenceOnly:true,notBuyerApproved:true}};
  const sourcePath=path.join(out,'claims-app14-aql-envelope.json');
  fs.writeFileSync(sourcePath,JSON.stringify(source));
  await action('references');await action('reference-select');await fill({refKind:'aql'});await submit();
  await page.locator('#clmReferenceFile').setInputFiles(sourcePath);
  await page.locator('#clmDialog[open]').waitFor();
  await fill({localReviewer:'SYN INDEPENDENT LOCAL REVIEWER',localReviewDate:'2026-10-17'});
  await page.locator('#clmDialog [name="identityConfirmed"]').check();await submit();
  assert.equal((await records())[0].manualReferences.length,1);
  assert.match(await page.locator('.clm-table').innerText(),/SYN-AQL-1/);
  const wrongPath=path.join(out,'claims-app14-wrong-case.json');
  fs.writeFileSync(wrongPath,JSON.stringify({...source,recordId:'SYN-FALSE',
   displaySnapshot:{...source.displaySnapshot,buyer:'UNRELATED BUYER'}}));
  const beforeInvalid=JSON.stringify(await records());
  await action('reference-select');await fill({refKind:'aql'});await submit();
  await page.locator('#clmReferenceFile').setInputFiles(wrongPath);
  await page.locator('#clmDialog[open]').waitFor();
  assert.match(await page.locator('#clmDialogBody').innerText(),/Typed source owner, buyer identity or PO does not match/);
  await page.locator('#clmDialogClose').click();
  assert.equal(JSON.stringify(await records()),beforeInvalid,'Wrong source case cannot change saved claim');
  const saved=JSON.stringify((await records())[0]);await action('save');
  await page.reload({waitUntil:'domcontentloaded'});await action('continue');
  assert.equal(JSON.stringify((await records())[0]),saved,'Full claim evidence must survive reload');
  const dlPromise=page.waitForEvent('download');await action('download');const dl=await dlPromise;
  const copy=path.join(out,'claims-app14-synthetic.vesaclaim');await dl.saveAs(copy);
  assert.equal(JSON.parse(fs.readFileSync(copy,'utf8')).format,'VESA-CLAIMS-DISPUTES-COPY-1');
  await action('home');await action('upload');await page.locator('#clmCopyFile').setInputFiles(copy);
  await page.locator('#clmDialog[open]').waitFor();await page.locator('#clmDialogClose').click();
  assert.equal((await records()).length,2,'Portable copy must open separately');
  const broken=path.join(out,'claims-app14-forged.vesaclaim');
  fs.writeFileSync(broken,fs.readFileSync(copy,'utf8').replace('SYN BUYER','FORGED BUYER'));
  const before=JSON.stringify(await records());
  await page.locator('#clmCopyFile').setInputFiles(broken);
  await page.locator('#clmDialog[open]').waitFor();
  assert.match(await page.locator('#clmDialogBody').innerText(),/Altered\/unsupported/);
  await page.locator('#clmDialogClose').click();
  assert.equal(JSON.stringify(await records()),before,'Forged source must not change saved cases');
  await action('history');assert.match(await page.locator('.clm-table').innerText(),/Source-reviewed finding/);
  await action('reports');
  const report=await page.locator('.clm-report').innerText();
  assert.match(report,/DRAFT \/ SOURCE REVIEW ONLY/);
  assert.match(report,/SYN-AQL-1/);
  assert.match(report,/125\.50/);
  assert.match(report,/50\.00/);
  assert.match(report,/NOT legal liability|NOT actual receipt/);
  const excelDownload=page.waitForEvent('download');await action('excel');const excel=await excelDownload;
  const excelPath=path.join(out,'claims-app14-draft.xlsx');await excel.saveAs(excelPath);
  assert.equal(fs.readFileSync(excelPath).subarray(0,2).toString(),'PK','Real Excel workbook ZIP');
  assert(fs.statSync(excelPath).size>2500);
  const pdf=await page.pdf({format:'A4',printBackground:true,landscape:true});
  assert.equal(pdf.subarray(0,4).toString(),'%PDF');
  fs.writeFileSync(path.join(out,'claims-app14-workspace-draft.pdf'),pdf);
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:850});
   const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(actual<=width+1,width+'px claims horizontal overflow '+actual);
   if([390,768,1280].includes(width))await page.screenshot({path:path.join(out,'claims-app14-'+width+'.png')});
  }
  await page.setViewportSize({width:1280,height:900});
  for(const [lang,expected]of [['en','Alleged Findings'],['bn','অভিযোগের তথ্য'],['hi','दावे के तथ्य'],['ta','Claim Findings']]){
   const state=JSON.stringify(await records());
   await page.locator('[data-vesa-user]').click();
   const settings=page.locator('[data-vesa-settings]');await settings.locator('[data-pref-language]').selectOption(lang);
   await page.waitForFunction(l=>document.documentElement.lang===l,lang);
   await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
   assert((await page.locator('.clm-tabs').innerText()).includes(expected),'Incomplete '+lang+' Claims locale');
   assert.equal(JSON.stringify(await records()),state,'Language cannot mutate source amounts/claims');
  }
  await action('home');await action('new');await page.locator('#clmDialog[open]').waitFor();
  await page.keyboard.press('Escape');await page.locator('#clmDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Escape restores opener focus');
  assert.deepEqual(errors,[],'No uncaught Chromium errors');
  assert.deepEqual(external,[],'No outside requests or uploads of case records');
  console.log('CLAIMS M3 REAL CHROMIUM PASS: case/finding/AQL evidence and disputed reply, separate signed agreement/draft credit/documented partial receipt, explicit decision, no auto-close, Save/Open/corrupt copy, four languages, 320–1440px, shared shell, zero remote providers.');
 }finally{await context.close();await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(err=>{console.error(err);process.exitCode=1;});
