/* APP-04 browser acceptance: real Chromium, synthetic sources, no hidden networks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
class SamplingBrowserProof{
 async run(){
  const server=http.createServer((req,res)=>{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   let file=path.resolve(root,'.'+pathname);
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
     '.json':'application/json','.png':'image/png','.ico':'image/x-icon',
     '.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
   args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
   email:'synthetic-sampling@vesaent.com',name:'SYNTHETIC QA',role:'admin',
   userKey:'synthetic-sampling-vesaent-com',loginAt:'2026-10-17T00:00:00Z',
   expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',request=>{if(!request.url().startsWith(host))external.push(request.url());});
  const action=async(name,id)=>page.locator('[data-action="'+name+'"]'+(id?'[data-id="'+id+'"]':'')).first().click();
  const put=async values=>{for(const [name,value] of Object.entries(values)){
    const el=page.locator('#saDialog [name="'+name+'"]');
    if(!await el.count())throw Error('Missing form input '+name);
    if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(value));
    else await el.fill(String(value));
  }};
  const submit=async()=>{
   await page.locator('#saDialog form button[type=submit]').click();
   await page.locator('#saDialog[open]').waitFor({state:'hidden',timeout:9000});
  };
  const saved=async()=>page.evaluate(()=>{
   const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.sampling-approval.records.v1.'));
   return JSON.parse(localStorage.getItem(key)).records;
  });
  try{
   await page.goto(host+'/apps/sampling-approval/',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action=new]').waitFor({timeout:9000});
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   await action('new');
   await put({buyer:'SYNTHETIC BUYER',poNo:'SYN-PO-123',style:'SYN-TEE',
     factory:'SYNTHETIC FACTORY',requirementsSource:'SYNTHETIC BUYER SAMPLE PLAN',
     currentTechRevision:'SPEC-V1',currentTechSource:'SYNTHETIC TECH REV SOURCE',
     currentArtworkRevision:'ART-V1',currentArtworkSource:'SYNTHETIC ARTWORK SOURCE'});await submit();
   assert.equal((await saved())[0].categories.length,0);
   // Fit is defined by buyer evidence, not a global auto-required template.
   await action('category');
   await put({categoryName:'Fit Sample',categorySource:'SYNTHETIC BUYER FIT REQUIREMENT',
    buyerAuthority:'SYNTHETIC BUYER TECH DEPARTMENT'});
   await page.locator('#saDialog [name=requiredFlag]').check();await submit();
   await action('category');
   await put({categoryName:'PP Sample',categorySource:'SYNTHETIC BUYER PP REQUIREMENT',
    buyerAuthority:'SYNTHETIC BUYER PRODUCTION TEAM'});
   await page.locator('#saDialog [name=requiredFlag]').check();await submit();
   await action('round');
   await put({roundNo:'1',physicalId:'SYN-FIT-001',colour:'Navy',size:'M',quantity:'2',
    requestDate:'2026-10-01',requiredDate:'2026-10-10',calendarBasis:'calendar',
    calendarSource:'SYNTHETIC BUYER SAMPLE CALENDAR'});await submit();
   await action('rounds');await action('dispatch');
   await put({sentDate:'2026-10-04',dispatchSource:'SYNTHETIC TRACKING REF 001'});await submit();
   await action('rounds');await action('receipt');
   await put({receivedDate:'2026-10-05',receiptSource:'SYNTHETIC BUYER RECEIPT 001'});await submit();
   await action('decision');
   await put({decisionStatus:'rejected',decisionParty:'buyer',actor:'SYNTHETIC BUYER',
    decisionDate:'2026-10-06',authority:'SYNTHETIC BUYER APPROVER SOURCE',
    decisionEvidence:'SYNTHETIC BUYER EMAIL 001',
    comments:'SYNTHETIC: shoulder fit correction required'});await submit();
   await action('revision');
   await put({revisionReason:'SYNTHETIC SHOULDER FIT REWORK',
    revisionBy:'SYNTHETIC BUYER',revisionDate:'2026-10-07',
    revisionEvidence:'SYNTHETIC BUYER REVISE MESSAGE'});await submit();
   await action('rounds');await action('round');
   await put({roundNo:'2',physicalId:'SYN-FIT-002',colour:'Navy',size:'M',quantity:'2',
    requestDate:'2026-10-08',requiredDate:'2026-10-16',calendarBasis:'calendar',
    calendarSource:'SYNTHETIC BUYER SAMPLE CALENDAR'});await submit();
   await action('rounds');
   await action('dispatch',null);
   await put({sentDate:'2026-10-10',dispatchSource:'SYNTHETIC TRACKING REF 002'});await submit();
   await action('rounds');
   await action('receipt',null);
   await put({receivedDate:'2026-10-12',receiptSource:'SYNTHETIC BUYER RECEIPT 002'});await submit();
   await action('rounds');
   const second=(await saved())[0].rounds[1].id;
   await action('decision',second);
   await put({decisionStatus:'approved',decisionParty:'buyer',actor:'SYNTHETIC BUYER APPROVER',
    decisionDate:'2026-10-14',authority:'SYNTHETIC BUYER APPROVAL MATRIX',
    decisionEvidence:'SYNTHETIC SIGNED APPROVAL EMAIL',
    comments:'SYNTHETIC FIT ACCEPTED'});await submit();
   let p=(await saved())[0];
   assert.equal(p.decisions.length,2);assert.equal(p.decisions[0].status,'rejected');
   const frozen=JSON.stringify(p.decisions[0]);
   await action('summary');
   assert.match(await page.locator('.sa-grid').innerText(),/2/);
   assert.equal(await page.locator('body').getAttribute('data-vesa-workspace'),null);
   // A new tech revision invalidates effective buyer approval; prior signed comment stays unchanged.
   await action('header');await put({currentTechRevision:'SPEC-V2',
     currentTechSource:'SYNTHETIC TECH REVISION V2'});await submit();
   p=(await saved())[0];
   assert.equal(JSON.stringify(p.decisions[0]),frozen);
   const derived=await page.evaluate(()=>{
    const app=window.VesaSampling360;return app.E.summarize(app.current,'2026-10-18');
   });
   assert.equal(derived.statuses[0].status,'stale-review');
   assert.equal(derived.buyerApproved,0);
   assert.equal(derived.unresolved,2);
   await action('asof');await put({asOf:'2026-10-18'});await submit();
   await action('exceptions');
   assert.match(await page.locator('.sa-card').last().innerText(),/Stale|Review/i);
   // Safe reviewed reference; no self-issued PPM GO.
   await action('reference-export');
   await put({reviewer:'SYNTHETIC LOCAL SOURCE REVIEWER',reviewDate:'2026-10-18'});
   await page.locator('#saDialog [name=reviewed]').check();
   const refEvent=page.waitForEvent('download');await submit();
   fs.mkdirSync(out,{recursive:true});
   const refPath=path.join(out,'sampling-app04-reviewed-reference.json');
   await (await refEvent).saveAs(refPath);
   const ref=JSON.parse(fs.readFileSync(refPath,'utf8'));
   assert.equal(ref.displaySnapshot.notPPMGo,true);
   assert.equal(ref.displaySnapshot.categories[0].status,'stale-review');
   assert.equal(ref.displaySnapshot.categories[1].status,'needs-information');
   assert.equal(ref.sourceApp,'VESA Sampling & Approval 360');
   await action('reports');
   const xlsEvent=page.waitForEvent('download');await action('excel');
   const xlsPath=path.join(out,'sampling-app04-synthetic.xlsx');
   await (await xlsEvent).saveAs(xlsPath);
   const workbook=XLSX.read(fs.readFileSync(xlsPath),{type:'buffer'});
   assert.deepEqual(workbook.SheetNames,['Request Summary','Buyer Categories','Submission Tracker',
     'Approval Comments','Revision Overdue','Revision Requests','Evidence Register','Manual Cross-App Refs']);
   assert.equal(workbook.Sheets['Submission Tracker'].F2.t,'n');
   assert.equal(workbook.Sheets['Submission Tracker'].F2.v,2);
   const pdfPath=path.join(out,'sampling-app04-report.pdf');
   await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdfPath).size>3500);
   const copyEvent=page.waitForEvent('download');await action('download');
   const portable=path.join(out,'sampling-app04-synthetic.vesasampling');
   await (await copyEvent).saveAs(portable);
   await page.reload({waitUntil:'domcontentloaded'});await action('continue');
   assert.equal((await saved())[0].revisionRequests.length,1);
   assert.equal((await saved())[0].decisions.length,2);
   await action('home');await action('upload');
   await page.locator('#saFile').setInputFiles(portable);
   await page.locator('#saDialog[open]').waitFor();
   await page.locator('#saClose').click();
   assert.equal((await saved()).length,2);
   const corrupted=path.join(out,'sampling-app04-corrupt.vesasampling');
   fs.writeFileSync(corrupted,fs.readFileSync(portable,'utf8').replace('SYN-FIT-002','ALTERED SAMPLE'));
   const before=JSON.stringify(await saved());
   await page.locator('#saFile').setInputFiles(corrupted);
   await page.locator('#saDialog[open]').waitFor();
   assert.match(await page.locator('#saDialogBody').innerText(),/altered\/unsupported/i);
   await page.locator('#saClose').click();
   assert.equal(JSON.stringify(await saved()),before);
   for(const width of [320,390,768,1280]){
    await page.setViewportSize({width,height:840});
    const measured=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert(measured<=width+1,width+'px body overflow '+measured);
   }
   await page.setViewportSize({width:390,height:845});
   await page.screenshot({path:path.join(out,'sampling-app04-mobile.png')});
   await page.setViewportSize({width:1280,height:900});
   for(const [language,word] of [['en','Buyer Categories'],['bn','ক্রেতার স্যাম্পল বিভাগ'],
    ['hi','खरीदार सैंपल श्रेणी'],['ta','Buyer Categories']]){
    const records=JSON.stringify(await saved());
    await page.locator('[data-vesa-user]').click();
    const settings=page.locator('[data-vesa-settings]');
    await settings.locator('[data-pref-language]').selectOption(language);
    await page.waitForFunction(lang=>document.documentElement.lang===lang,language);
    await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
    assert.match(await page.locator('.sa-tabs').innerText(),new RegExp(word));
    assert.equal(JSON.stringify(await saved()),records,'Language switching must preserve source history.');
   }
   await page.reload({waitUntil:'domcontentloaded'});await action('continue');
   assert.equal((await saved())[0].decisions[0].status,'rejected');
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   console.log('SAMPLING-360 CHROMIUM PASS: buyer category and rounds, dispatch/receipt, reject/resubmit/approve, stale source revision, immutable history, XLSX/PDF, reviewed reference, corruption and restore, EN/BN/HI/TA, responsive and zero external requests.');
  }finally{await context.close();await browser.close();await new Promise(ok=>server.close(ok));}
 }
}
new SamplingBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});
