/* APP-09 actual Chromium local production UI proof. Synthetic inputs only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const requestPath=decodeURIComponent(new URL(req.url,'http://local').pathname);
  let f=path.resolve(root,'.'+requestPath);if(!f.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
   const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}[path.extname(f)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(f));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const host='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'synthetic-prodn@vesaent.com',name:'SYNTHETIC PRODUCTION',role:'admin',userKey:'synthetic-prodn-vesaent-com',loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],outside=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(host))outside.push(r.url());});
 const act=async name=>page.locator('[data-action="'+name+'"]').first().click();
 const fill=async fields=>{for(const [key,val] of Object.entries(fields)){
  const el=page.locator('#ptDialog [name="'+key+'"]');if(!await el.count())throw Error('Missing production form field: '+key);
  if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(val));else await el.fill(String(val));
 }};
 const submit=async()=>{await page.locator('#ptDialog form button[type=submit]').click();await page.locator('#ptDialog[open]').waitFor({state:'hidden',timeout:10000});};
 const rows=()=>page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.production-tracker.records.v1.'));return JSON.parse(localStorage.getItem(key)).records;});
 try{
  await page.goto(host+'/apps/production-tracker/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="new"]').waitFor({timeout:12000});
  assert.equal(await page.locator('.vesa-workspace').count(),1);
  assert.equal(await page.locator('[data-vesa-menu]').count(),6);
  await act('new');await fill({poNo:'SYN-PROD-PO',style:'SYN-POLO',colour:'Navy',size:'M',lot:'SYN-LOT-A',factory:'SYN FACTORY',unit:'pieces',sourceRef:'SYNTHETIC SIGNED PLAN'});await submit();
  assert.equal((await rows())[0].header.poNo,'SYN-PROD-PO');
  const axis={stage:'cutting',line:'SYN-LINE-01',lot:'SYN-LOT-A',unit:'pieces'};
  await act('opening-form');await fill({...axis,opening:'0',sourceRef:'SYN OPENING WIP',reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17'});await submit();
  await act('target-form');await fill({...axis,quantity:'50',sourceRef:'SYN TARGET REFERENCE',declaredAuthority:'SYN PLAN AUTHORITY',sourceDate:'2026-10-16',reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17'});await submit();
  const daily={...axis,date:'2026-10-17',shift:'Day',good:'20',verifiedIn:'25',verifiedOut:'20',verifiedRejects:'1',rework:'2',
   sourceRef:'SYN DAY STAGE REGISTER',actor:'SYN SHIFT LEAD',status:'locally-reviewed',reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',reviewSource:'SYN DAILY REVIEW',handoffRef:'SYN INPUT PASS',outRef:'SYN OUT REGISTER',rejectRef:'SYN REJECT REGISTER'};
  await act('daily-form');await fill(daily);await submit();
  const snap=await page.evaluate(()=>window.VesaProduction360.L.validate(window.VesaProduction360.current));
  assert(snap.ok);assert.equal(snap.groups[0].locallyReviewedGood,20);assert.equal(snap.groups[0].wip.closing,4);assert.equal(snap.groups[0].remaining,30);
  await act('daily-form');await fill(daily);await page.locator('#ptDialog form button[type=submit]').click();
  assert.match(await page.locator('#ptDialog [role=alert]').innerText(),/Duplicate stage\/day\/shift/);
  await page.locator('#ptDialogClose').click();assert.equal((await rows())[0].observations.length,1,'Duplicate must not persist');
  await act('daily');await act('correct-form');await fill({good:'15',verifiedOut:'15',correctionReason:'SYN corrected count',correctionSource:'SYN revised tally'});await submit();
  const revised=await rows();assert.equal(revised[0].observations.length,2);assert.equal(revised[0].observations[0].good,20);
  const x=await page.evaluate(()=>window.VesaProduction360.L.validate(window.VesaProduction360.current));
  assert.equal(x.groups[0].locallyReviewedGood,15);assert.equal(x.groups[0].wip.closing,9);
  await act('save');await page.reload({waitUntil:'domcontentloaded'});await act('continue');
  assert.equal((await rows())[0].observations.length,2);
  const d=page.waitForEvent('download');await act('download');fs.mkdirSync(out,{recursive:true});
  const copy=path.join(out,'prod-app09-synthetic.vesaprod');await(await d).saveAs(copy);
  await act('home');await act('upload');await page.locator('#ptCopyFile').setInputFiles(copy);
  await page.locator('#ptDialog[open]').waitFor();await page.locator('#ptDialogClose').click();
  assert.equal((await rows()).length,2,'Separate restore must preserve both records');
  const broken=path.join(out,'prod-app09-corrupted.vesaprod');fs.writeFileSync(broken,fs.readFileSync(copy,'utf8').replace('SYN-PROD-PO','CORRUPTED-PO'));
  const prior=JSON.stringify(await rows());await page.locator('#ptCopyFile').setInputFiles(broken);
  await page.locator('#ptDialog[open]').waitFor();assert.match(await page.locator('#ptDialogBody').innerText(),/altered\/unsupported/);
  await page.locator('#ptDialogClose').click();assert.equal(JSON.stringify(await rows()),prior);
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:850});const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(scroll<=width+1,width+'px viewport overflow: '+scroll);
   if(width===390||width===768)await page.screenshot({path:path.join(out,'prod-app09-'+width+'.png')});
  }
  await page.setViewportSize({width:1280,height:900});
  for(const [language,label] of [['en','Daily Output'],['bn','দৈনিক উৎপাদন'],['hi','दैनिक उत्पादन'],['ta','தினசரி உற்பத்தி']]){
   const state=JSON.stringify(await rows());await page.locator('[data-vesa-user]').click();
   const settings=page.locator('[data-vesa-settings]');await settings.locator('[data-pref-language]').selectOption(language);
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language);
   await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
   assert((await page.locator('.pt-tabs').innerText()).includes(label));
   assert.equal(JSON.stringify(await rows()),state,'Language switch must not change original production evidence');
  }
  assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);
  console.log('PRODUCTION M2 CHROMIUM PASS: one shared shell, staged source daily/WIP/correction workflow, auto-save/reload, separate portable recovery, corrupt rejection, 4 languages, 320-1440 and no outside requests.');
 }finally{await context.close();await browser.close();await new Promise(done=>server.close(done));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
