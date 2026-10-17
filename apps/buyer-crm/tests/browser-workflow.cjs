/* APP-11 actual Chromium synthetic contacts, enquiries, opportunity/source stage and local followups. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'synthetic-crm@vesaent.com',name:'SYNTHETIC CRM',role:'admin',userKey:'synthetic-crm-vesaent-com',loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 const act=async name=>page.locator('[data-action="'+name+'"]').first().click();
 const fill=async values=>{for(const [key,v]of Object.entries(values)){
  const el=page.locator('#crmDialog [name="'+key+'"]');if(!await el.count())throw Error('CRM form missing '+key);
  if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(v));else await el.fill(String(v));
 }};
 const submit=async()=>{await page.locator('#crmDialog form button[type=submit]').click();await page.locator('#crmDialog[open]').waitFor({state:'hidden',timeout:10000});};
 const records=()=>page.evaluate(()=>{const key=Object.keys(localStorage).find(x=>x.startsWith('vesa.buyer-crm.records.v1.'));return key?JSON.parse(localStorage.getItem(key)).records:[];});
 try{
  fs.mkdirSync(output,{recursive:true});await page.goto(base+'/apps/buyer-crm/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="new"]').waitFor({timeout:12000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'Exactly one global VESA shell');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'Six universal menu commands');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/i);
  await act('new');await fill({organizationName:'SYNTHETIC BUYER LTD',territory:'SYN TERRITORY',sourceRef:'SYN BUYER REGISTER'});await submit();
  assert.equal((await records()).length,1);assert.match((await records())[0].status,/NOT BUYER-APPROVED PO/);
  await act('add-contact');await fill({contactName:'SYN LOCAL CONTACT',role:'SYN MERCHANDISER',email:'synthetic@example.invalid',
   sourceRef:'SYN CONTACT SOURCE',privacySourceRef:'SYN PRIVACY REGISTER',reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',consentStatus:'needs-information'});await submit();
  assert.equal((await records())[0].contacts.length,1);
  await act('add-contact');await fill({contactName:'SYN LOCAL CONTACT',role:'SYN MERCHANDISER',email:'synthetic@example.invalid',
   sourceRef:'SYN DUP SOURCE',privacySourceRef:'SYN PRIVACY REGISTER',reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',consentStatus:'needs-information'});
  const beforeDup=JSON.stringify(await records());await page.locator('#crmDialog form button[type=submit]').click();
  assert.match(await page.locator('#crmDialog [role=alert]').innerText(),/Possible duplicate contact/);
  await page.locator('#crmDialogClose').click();assert.equal(JSON.stringify(await records()),beforeDup,'No silent contact merge');
  await act('add-enquiry');await fill({category:'Knit Polo',styleRequest:'SYN POLO STYLE',sourceDate:'2026-10-16',sourceRef:'SYN ENQUIRY',requestedQuantity:'1000',unit:'pieces'});await submit();
  const eq=(await records())[0].enquiries[0];assert.equal(eq.requestedQuantity,1000);
  await act('add-opportunity');await fill({enquiryId:eq.id,stage:'Buyer costing request',stageSourceRef:'SYN STAGE DOC',reviewedBy:'SYN PLANNER',reviewDate:'2026-10-17',
   amount:'1250.50',currency:'USD',amountSourceRef:'SYN BUYER ESTIMATE',amountReviewedBy:'SYN REVIEWER',amountReviewDate:'2026-10-17'});await submit();
  const o=(await records())[0].opportunities[0];assert.equal(o.amount,'1250.50');
  assert.match(await page.locator('.crm-table').first().innerText(),/1250\.50/);
  await act('add-stage');await fill({opportunityId:o.id,stage:'Buyer discussion',sourceRef:'SYN CALL NOTES',reviewedBy:'SYN OWNER',reviewDate:'2026-10-17'});await submit();
  assert.equal((await records())[0].opportunities[0].stage,'Buyer costing request','Stage amendment must not rewrite source');
  await act('add-followup');await fill({linkedItem:'opportunity|'+o.id,owner:'SYN FOLLOWUP OWNER',createdDate:'2026-10-15',dueDate:'2026-10-16',sourceRef:'SYN FOLLOWUP REGISTER',followupStatus:'open'});await submit();
  await page.evaluate(()=>{window.VesaBuyerCRM360.asOf='2026-10-17';window.VesaBuyerCRM360.render();});
  assert.match(await page.locator('.crm-table').innerText(),/overdue/);
  assert.match(await page.locator('body').innerText(),/does not send reminders, emails or SMS/);
  assert.equal((await records())[0].followups.length,1);
  const saveData=JSON.stringify((await records())[0]);await act('save');await page.reload({waitUntil:'domcontentloaded'});await act('continue');
  assert.equal(JSON.stringify((await records())[0]),saveData);
  const promise=page.waitForEvent('download');await act('download');const download=await promise;
  const savedPath=path.join(output,'crm-app11-synthetic.vesacrm');await download.saveAs(savedPath);
  const contents=JSON.parse(fs.readFileSync(savedPath,'utf8'));assert.equal(contents.format,'VESA-BUYER-CRM-COPY-1');
  await act('home');await act('upload');await page.locator('#crmCopyFile').setInputFiles(savedPath);
  await page.locator('#crmDialog[open]').waitFor();await page.locator('#crmDialogClose').click();
  assert.equal((await records()).length,2,'Recovery must create a separate local buyer record');
  const broken=path.join(output,'crm-app11-forged.vesacrm');fs.writeFileSync(broken,fs.readFileSync(savedPath,'utf8').replace('SYNTHETIC BUYER LTD','FORGED BUYER'));
  const prior=JSON.stringify(await records());await page.locator('#crmCopyFile').setInputFiles(broken);
  await page.locator('#crmDialog[open]').waitFor();assert.match(await page.locator('#crmDialogBody').innerText(),/altered\/unsupported/);
  await page.locator('#crmDialogClose').click();assert.equal(JSON.stringify(await records()),prior);
  await act('history');assert.match(await page.locator('.crm-table').innerText(),/New local/);
  await act('reports');assert.match(await page.locator('body').innerText(),/report|அறிக்க|রিপোর্ট|रिपोर्ट/i);
  const pdf=await page.pdf({printBackground:true,format:'A4',landscape:true});
  assert(pdf.subarray(0,4).toString()==='%PDF'&&pdf.length>8000);fs.writeFileSync(path.join(output,'crm-app11-workspace-draft.pdf'),pdf);
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:880});const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(scroll<=width+1,width+'px Buyer CRM overflow: '+scroll);
   if([390,768,1280].includes(width))await page.screenshot({path:path.join(output,'crm-app11-'+width+'.png')});
  }
  await page.setViewportSize({width:1280,height:900});
  const translations=[['en','Buyer Contacts'],['bn','বায়ার যোগাযোগ'],['hi','बायर संपर्क'],['ta','Buyer தொடர்புகள்']];
  for(const [lang,label]of translations){const old=JSON.stringify(await records());await page.locator('[data-vesa-user]').click();
   const panel=page.locator('[data-vesa-settings]');await panel.locator('[data-pref-language]').selectOption(lang);
   await page.waitForFunction(l=>document.documentElement.lang===l,lang);
   await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
   assert((await page.locator('.crm-tabs').innerText()).includes(label),'Missing CRM locale tab '+lang);
   assert.equal(JSON.stringify(await records()),old,'Language must not mutate buyer records');
  }
  await act('home');await act('new');await page.locator('#crmDialog[open]').waitFor();await page.keyboard.press('Escape');
  await page.locator('#crmDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Modal should restore opener focus');
  assert.deepEqual(errors,[],'No unhandled browser JS errors');assert.deepEqual(external,[],'No off-host requests');
  console.log('BUYER CRM M2 CHROMIUM PASS: synthetic org/contact privacy, duplicate guard, enquiry/opportunity sourced amount, immutable stage, local overdue followup, save/restore/corruption, four languages, 320-1440 no overflow, no outside requests.');
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
