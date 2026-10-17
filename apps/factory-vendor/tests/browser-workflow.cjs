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
  await page.goto(host+'/apps/factory-vendor/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="new"]').waitFor({timeout:12000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'Only one VESA shared shell');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'Six global menus in one header');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/i);
  await act('new');await fill({vendorName:'SYNTHETIC VENDOR LTD',country:'BD',sourceRef:'SYNTHETIC DECLARATION DOC'});await submit();
  assert.equal((await rows()).length,1);assert.equal((await rows())[0].status,'INTERNAL DRAFT — NOT CERTIFIED');
  await act('add-site');await fill({siteName:'SYNTHETIC SITE A',country:'BD',process:'Knit garment manufacturing',sourceRef:'SYN SITE DOCUMENT'});await submit();
  assert.equal((await rows())[0].sites.length,1);
  const site=(await rows())[0].sites[0];
  await act('add-site');await fill({siteName:'SYNTHETIC SITE A',country:'BD',process:'Knit garment manufacturing',sourceRef:'SYN DUPLICATE SITE'});
  await page.locator('#fvDialog form button[type=submit]').click();
  assert.match(await page.locator('#fvDialog [role=alert]').innerText(),/Duplicate factory site/);
  await page.locator('#fvDialogClose').click();assert.equal((await rows())[0].sites.length,1,'Duplicate cannot persist');
  await act('add-capability');await fill({siteId:site.id,category:'Knit Polo',unit:'pieces',declaredMonthlyCapacity:'100000',
   asOfDate:'2026-10-16',sourceRef:'SYN DECLARED CATEGORY',capacitySourceRef:'SYN SIGNED CAPACITY STATEMENT',
   reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',moq:'5000',leadDays:'60',leadDaysSource:'SYN DECLARED LEAD DAYS'});await submit();
  const cap=(await rows())[0].capabilities[0];assert.equal(cap.declaredMonthlyCapacity,100000);assert.equal(cap.unit,'pieces');
  await act('add-certificate');await fill({siteId:site.id,scheme:'SYNTHETIC BSCI DOCUMENT',issuer:'SYNTHETIC ISSUER',
   documentRef:'SYN-CERT-2026',sourceRef:'SYN CERT DOCUMENT',issueDate:'2026-01-01',expiryDate:'2026-09-30',
   reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',documentStatus:'document-supplied'});await submit();
  await act('documents');await page.evaluate(()=>{window.VesaFactoryVendor360.asOf='2026-10-17';window.VesaFactoryVendor360.render();});
  assert.match(await page.locator('.fv-table').innerText(),/expired-by-dates/);
  assert.match(await page.locator('body').innerText(),/NOT independent compliance verification/i);
  assert(!(await page.locator('.fv-table').innerText()).includes('COMPLIANT'));
  await act('add-review');await fill({siteId:site.id,reviewer:'SYN LOCAL REVIEWER',checklistRef:'SYN ONBOARD CHECKLIST',
   sourceRef:'SYN REVIEW REPORT',reviewDate:'2026-10-17',internalOutcome:'needs-information'});await submit();
  await act('add-performance');await fill({siteId:site.id,metric:'On-time reviewed count',unit:'orders',
   sourceRef:'SYN PERFORMANCE REGISTER',reviewer:'SYN REVIEWER',periodFrom:'2026-09-01',periodTo:'2026-09-30',
   reviewDate:'2026-10-17',numerator:'8',denominator:'10'});await submit();
  const record=(await rows())[0];assert.equal(record.revision,5);assert.equal(record.certificates.length,1);assert.equal(record.reviews.length,1);assert.equal(record.performance.length,1);
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
  await act('reports');assert.match(await page.locator('body').innerText(),/Draft reports and controlled read-only references/);
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
  await page.setViewportSize({width:1280,height:900});
  const languages=[['en','Factory Sites'],['bn','কারখানা সাইট'],['hi','फैक्ट्री साइट'],['ta','Factory இடங்கள்']];
  for(const [language,label] of languages){
   const before=JSON.stringify(await rows());
   await page.locator('[data-vesa-user]').click();const settings=page.locator('[data-vesa-settings]');
   await settings.locator('[data-pref-language]').selectOption(language);
   await page.waitForFunction(l=>document.documentElement.lang===l,language);
   await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
   assert((await page.locator('.fv-tabs').innerText()).includes(label),'Missing app localization for '+language);
   assert.equal(JSON.stringify(await rows()),before,'Language must not translate or mutate evidence');
  }
  await act('home');await act('new');await page.locator('#fvDialog[open]').waitFor();
  await page.keyboard.press('Escape');await page.locator('#fvDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Escape restores opening button focus');
  assert.equal((await rows()).length,tested.length);
  assert.deepEqual(errors,[],'No JS page errors');assert.deepEqual(external,[],'Never make external requests');
  console.log('FACTORY VENDOR M2 CHROMIUM PASS: sourced site/capability/certificate expiry/internal review/period metric, duplicate atomicity, save/reload, portable copy/corrupt isolation, 4 languages, one shell, 320-1440 px, no third-party approval or hidden requests.');
 }finally{await context.close();await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
