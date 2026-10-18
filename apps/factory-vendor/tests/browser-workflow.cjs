/* APP-08 real Chromium synthetic journey: source-declared site/capacity/documents,
 * browser-local saved copies and EN/BN/HI/TA; no buyer/compliance approval.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let target=path.resolve(root,'.'+raw);if(!target.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');
   const ext=path.extname(target),type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.woff2':'font/woff2'}[ext]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(target));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const host='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'synthetic-vendor@vesaent.com',name:'SYNTHETIC VENDOR',role:'admin',userKey:'synthetic-vendor-vesaent-com',loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(!req.url().startsWith(host))external.push(req.url());});
 const act=async name=>page.locator('[data-action="'+name+'"]').first().click();
 const fill=async data=>{for(const [key,val] of Object.entries(data)){
  const el=page.locator('#fvDialog [name="'+key+'"]');if(!await el.count())throw Error('Factory form missing input '+key);
  if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(val));else await el.fill(String(val));
 }};
 const submit=async()=>{await page.locator('#fvDialog form button[type=submit]').click();await page.locator('#fvDialog[open]').waitFor({state:'hidden',timeout:10000});};
 const rows=()=>page.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('vesa.factory-vendor.records.v1.'));return k?JSON.parse(localStorage.getItem(k)).records:[];});
 try{
  fs.mkdirSync(out,{recursive:true});
  await page.goto(host+'/apps/',{waitUntil:'domcontentloaded'});
  const route=page.locator('#appCatalogue a[href="/apps/factory-vendor/"]');
  await route.waitFor({timeout:12000});
  assert.equal(await route.count(),1,'One exact Factory App Centre card');
  assert.match(await route.innerText(),/Factory.*Vendor/i);
  await route.click();
  assert(page.url().endsWith('/apps/factory-vendor/'),'App Centre must open the Factory workspace');
  await page.locator('[data-action="new"]').waitFor({timeout:12000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'Only one VESA shared shell');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'Six global menus in one header');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/i);
  // G4 read-only nine-stage discovery. Never turn a document into compliance.
  const stageNames=['summary','sites','capabilities','documents','onboarding','performance','references','reports','history'];
  const previews=page.locator('.fv-journey [data-action="preview"]');
  assert.equal(await previews.count(),9);
  assert.equal((await rows()).length,0,'No stored vendor before practice');
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:860});
   const g=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,
    actions:[...document.querySelectorAll('.fv-journey .fv-btn')].map(x=>x.getBoundingClientRect().height)}));
   assert(g.scroll<=g.w+1,width+'px no overflow');
   assert(g.actions.length===9&&g.actions.every(x=>x>=44),width+'px nine touch targets');
   await page.screenshot({path:path.join(out,'factory-app08-g4-home-'+width+'.png'),fullPage:true});
  }
  await page.setViewportSize({width:390,height:860});
  for(const stage of stageNames){
   await page.locator('.fv-journey [data-action="preview"][data-id="'+stage+'"]').click();
   assert.equal(await page.locator('.fv-tabs [data-action="'+stage+'"]').getAttribute('aria-current'),'true');
   assert.match(await page.locator('#fvMain').innerText(),/SYNTHETIC PRACTICE/);
   assert(await page.locator('#fvMain [data-action="save"]').isDisabled());
   const facts=await page.evaluate(()=>{
    const app=window.VesaFactoryVendor360,p=app.current;
    return {status:p.status,check:app.E.validate(p).ok,sites:p.sites.length,
     capability:app.Match.match(p,{category:'Knit Polo',siteId:'DEMO-SITE-1'},'2026-10-18'),
     documents:app.C.evaluateRecord(p,'2026-10-18'),
     internalOutcome:p.reviews[0].internalOutcome,performance:app.Match.metric(p,'DEMO-PERF-1')};
   });
   assert(facts.check,stage+' practice must validate');
   assert.equal(facts.status,'INTERNAL DRAFT — NOT CERTIFIED');
   assert.equal(facts.sites,1);assert.equal(facts.capability.declaredCapacity,100000);
   assert.equal(facts.capability.buyerApproved,false);
   assert.equal(facts.documents[0].documentStatus,'source-unconfirmed');
   assert.equal(facts.documents[0].dateState,'expired-by-dates');
   assert.equal(facts.documents[0].authorityVerified,false);
   assert.equal(facts.documents[0].buyerAccepted,false);
   assert.equal(facts.internalOutcome,'needs-information');
   assert.equal(facts.performance.ratio,0.8);
   assert.equal((await rows()).length,0,stage+' preview must not save any vendor');
   if(stage==='reports')await page.screenshot({path:path.join(out,'factory-app08-g4-mobile-report.png'),fullPage:true});
   await act('home');
  }
  await act('practice');
  assert.equal(await page.locator('.fv-tabs [data-action="summary"]').getAttribute('aria-current'),'true');
  assert.equal((await rows()).length,0);
  await act('home');await page.setViewportSize({width:1280,height:900});

  // G5-11: actual vendor edit forms start on source fields and restore focus.
  await act('new');
  assert.equal(await page.evaluate(()=>document.activeElement?.name),'vendorName','New Vendor focuses name');
  await page.keyboard.press('Escape');await page.locator('#fvDialog[open]').waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.activeElement?.dataset?.action==='new');
  assert.equal((await rows()).length,0,'Escaped incomplete vendor must not create local records');
  await act('new');await fill({vendorName:'SYNTHETIC VENDOR LTD',country:'BD',sourceRef:'SYNTHETIC DECLARATION DOC'});await submit();
  assert.equal((await rows()).length,1);assert.equal((await rows())[0].status,'INTERNAL DRAFT — NOT CERTIFIED');
  await act('add-site');
  assert.equal(await page.evaluate(()=>document.activeElement?.name),'siteName','Site form focuses site identity');
  await fill({siteName:'SYNTHETIC SITE A',country:'BD',process:'Knit garment manufacturing',sourceRef:'SYN SITE DOCUMENT'});await submit();
  assert.equal((await rows())[0].sites.length,1);
  const site=(await rows())[0].sites[0];
  await act('add-site');await fill({siteName:'SYNTHETIC SITE A',country:'BD',process:'Knit garment manufacturing',sourceRef:'SYN DUPLICATE SITE'});
  await page.locator('#fvDialog form button[type=submit]').click();
  assert.match(await page.locator('#fvDialog [role=alert]').innerText(),/Duplicate factory site/);
  await page.locator('#fvDialogClose').click();assert.equal((await rows())[0].sites.length,1,'Duplicate cannot persist');
  await act('add-capability');
  assert.equal(await page.evaluate(()=>document.activeElement?.name),'siteId','Capacity form focuses factory site');
  await fill({siteId:site.id,category:'Knit Polo',unit:'pieces',declaredMonthlyCapacity:'100000',
   asOfDate:'2026-10-16',sourceRef:'SYN DECLARED CATEGORY',capacitySourceRef:'SYN SIGNED CAPACITY STATEMENT',
   reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',moq:'5000',leadDays:'60',leadDaysSource:'SYN DECLARED LEAD DAYS'});await submit();
  const cap=(await rows())[0].capabilities[0];assert.equal(cap.declaredMonthlyCapacity,100000);assert.equal(cap.unit,'pieces');
  await act('add-certificate');
  assert.equal(await page.evaluate(()=>document.activeElement?.name),'siteId','Certificate form focuses evidence site');
  await fill({siteId:site.id,scheme:'SYNTHETIC BSCI DOCUMENT',issuer:'SYNTHETIC ISSUER',
   documentRef:'SYN-CERT-2026',sourceRef:'SYN CERT DOCUMENT',issueDate:'2026-01-01',expiryDate:'2026-09-30',
   reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',documentStatus:'document-supplied'});await submit();
  await act('documents');await page.evaluate(()=>{window.VesaFactoryVendor360.asOf='2026-10-17';window.VesaFactoryVendor360.render();});
  assert.match(await page.locator('.fv-table').innerText(),/expired-by-dates/);
  assert.match(await page.locator('body').innerText(),/NOT independent compliance verification/i);
  assert(!(await page.locator('.fv-table').innerText()).includes('COMPLIANT'));
  await act('onboarding');await act('add-review');await fill({siteId:site.id,reviewer:'SYN LOCAL REVIEWER',checklistRef:'SYN ONBOARD CHECKLIST',
   sourceRef:'SYN REVIEW REPORT',reviewDate:'2026-10-17',internalOutcome:'needs-information'});await submit();
  await act('performance');await act('add-performance');await fill({siteId:site.id,metric:'On-time reviewed count',unit:'orders',
   sourceRef:'SYN PERFORMANCE REGISTER',reviewer:'SYN REVIEWER',periodFrom:'2026-09-01',periodTo:'2026-09-30',
   reviewDate:'2026-10-17',numerator:'8',denominator:'10'});await submit();
  // User-selected, explicit local reviewed source. No sibling browser storage reads.
  const goodRef={sourceApp:'VESA Purchase Order 360',recordType:'PurchaseOrder',recordId:'SYN-PO-LOCAL-1',
   revisionId:'R1',sourceDate:'2026-10-16',verifiedBy:'SYN SOURCE CHECKER',verifiedAt:'2026-10-17T08:00:00Z',
   displaySnapshot:{factory:'SYNTHETIC SITE A',poNo:'SYN-PO-10'}};
  const refFile=path.join(out,'factory-app08-reviewed-po.json');fs.writeFileSync(refFile,JSON.stringify(goodRef));
  await act('references');await act('reference-select');
  await fill({refKind:'po'});await submit();
  await page.locator('#fvReferenceFile').setInputFiles(refFile);
  await page.locator('#fvDialog[open]').waitFor();
  await fill({siteId:site.id,localReviewer:'SYN LOCAL REFERENCE REVIEWER',localReviewDate:'2026-10-17'});
  await page.locator('#fvDialog [name="identityConfirmed"]').check();
  await submit();assert.equal((await rows())[0].manualReferences.length,1);
  assert.match(await page.locator('body').innerText(),/SYN-PO-LOCAL-1/);
  const incorrect={...goodRef,sourceApp:'FAKE BUYER APPROVAL',recordId:'UNSUPPORTED'};
  const badRef=path.join(out,'factory-app08-unapproved-source.json');fs.writeFileSync(badRef,JSON.stringify(incorrect));
  const sourceBefore=JSON.stringify(await rows());
  await act('reference-select');await fill({refKind:'po'});await submit();
  await page.locator('#fvReferenceFile').setInputFiles(badRef);
  await page.locator('#fvDialog[open]').waitFor();
  assert.match(await page.locator('#fvDialogBody').innerText(),/Source owner or evidence fields are incomplete/);
  await page.locator('#fvDialogClose').click();
  assert.equal(JSON.stringify(await rows()),sourceBefore,'Bad source must never alter saved vendor data');
  const record=(await rows())[0];assert.equal(record.revision,6);assert.equal(record.certificates.length,1);assert.equal(record.reviews.length,1);assert.equal(record.performance.length,1);
  const initial=JSON.stringify(record);await act('save');await page.reload({waitUntil:'domcontentloaded'});await act('continue');
  assert.equal(JSON.stringify((await rows())[0]),initial,'Reload and Continue do not change source');
  const download=page.waitForEvent('download');await act('download');
  const file=path.join(out,'factory-app08-synthetic.vesavendor');await(await download).saveAs(file);
  const portable=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(portable.record.status,'INTERNAL DRAFT — NOT CERTIFIED');
  await act('home');await act('upload');await page.locator('#fvCopyFile').setInputFiles(file);
  await page.locator('#fvDialog[open]').waitFor();await page.locator('#fvDialogClose').click();
  assert.equal((await rows()).length,2,'Restore must preserve original record separately');
  const broken=path.join(out,'factory-app08-corrupted.vesavendor');fs.writeFileSync(broken,fs.readFileSync(file,'utf8').replace('SYNTHETIC VENDOR LTD','CORRUPTED VENDOR'));
  const saved=JSON.stringify(await rows());await page.locator('#fvCopyFile').setInputFiles(broken);
  await page.locator('#fvDialog[open]').waitFor();assert.match(await page.locator('#fvDialogBody').innerText(),/altered\/unsupported/);
  await page.locator('#fvDialogClose').click();assert.equal(JSON.stringify(await rows()),saved);
  await act('history');assert.match(await page.locator('.fv-table').innerText(),/Recorded sourced/);
  await act('reports');await page.evaluate(()=>{window.VesaFactoryVendor360.asOf='2026-10-17';window.VesaFactoryVendor360.render();});
  const reportText=await page.locator('.fv-report').innerText();
  assert.match(reportText,/DRAFT \/ INTERNAL REVIEW ONLY/);
  assert.match(reportText,/expired-by-dates/);
  assert.match(reportText,/DECLARED ONLY/);
  assert.match(reportText,/SYN-PO-LOCAL-1/);
  const xlsxPromise=page.waitForEvent('download');
  await act('excel');const xlsx=await xlsxPromise;
  const xlsxPath=path.join(out,'factory-app08-draft-report.xlsx');await xlsx.saveAs(xlsxPath);
  assert(fs.readFileSync(xlsxPath).subarray(0,2).toString()==='PK','Excel workbook must be a ZIP-based xlsx');
  assert(fs.statSync(xlsxPath).size>2500,'Excel workbook must contain data');
  const pdf=await page.pdf({printBackground:true,format:'A4',landscape:true});
  assert(pdf.subarray(0,4).toString()==='%PDF'&&pdf.length>10000);
  fs.writeFileSync(path.join(out,'factory-app08-workspace-draft.pdf'),pdf);
  const tested=await rows();
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:880});
   const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(scroll<=width+1,width+'px Factory page overflow: '+scroll);
   if([390,768,1280].includes(width))await page.screenshot({path:path.join(out,'factory-app08-'+width+'.png')});
  }
  // Real 320px new-vendor modal, beyond opened landing-page width screenshots.
  await page.setViewportSize({width:320,height:720});
  await act('home');await act('new');
  assert.equal(await page.evaluate(()=>document.activeElement?.name),'vendorName','Mobile Vendor form focuses name');
  assert((await page.locator('#fvDialog').evaluate(el=>el.getBoundingClientRect().width))<=320,
   'Vendor 320px dialog fits screen');
  await page.screenshot({path:path.join(out,'factory-app08-new-dialog-320.png')});
  await page.keyboard.press('Escape');await page.locator('#fvDialog[open]').waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.activeElement?.dataset?.action==='new');
  await act('continue');
  await page.setViewportSize({width:1280,height:900});
  const languages=[['en','Factory Sites'],['bn','কারখানা সাইট'],['hi','फैक्ट्री साइट'],['ta','Factory இடங்கள்']];
  for(const [language,label] of languages){
   const before=JSON.stringify(await rows());
   await page.locator('[data-vesa-user]').click();const settings=page.locator('[data-vesa-settings]');
   await settings.locator('[data-pref-language]').selectOption(language);
   await page.waitForFunction(l=>document.documentElement.lang===l,language);
   await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
   assert((await page.locator('.fv-tabs').innerText()).includes(label),'Missing app localization for '+language);
   await act('home');
   const headings={en:'Explore nine factory and vendor steps',bn:'ফ্যাক্টরি ও ভেন্ডরের নয়টি ধাপ',
    hi:'फैक्ट्री और वेंडर के नौ चरण',ta:'Factory & Vendor — ஒன்பது வேலைப் பகுதிகள்'};
   assert.equal(await page.locator('#fvJourneyTitle').innerText(),headings[language]);
   assert.equal(await page.locator('.fv-journey [data-action="preview"]').count(),9);
   await act('continue');
   assert.equal(JSON.stringify(await rows()),before,'Languages and Home/Continue preserve source evidence');
  }
  await act('home');await act('new');await page.locator('#fvDialog[open]').waitFor();
  await page.keyboard.press('Escape');await page.locator('#fvDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Escape restores opening button focus');
  assert.equal((await rows()).length,tested.length);
  assert.deepEqual(errors,[],'No JS page errors');assert.deepEqual(external,[],'Never make external requests');
  console.log('FACTORY VENDOR M3 CHROMIUM PASS: sourced vendor, expiring certificate as date-only, internal onboarding, optional reviewed PO reference, bad-source atomicity, XLSX numeric workbook, PDF, Save/Open, EN BN HI TA, 320-1440 widths, no third-party approval or network.');
 }finally{await context.close();await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
