/* Real Chromium G13 M1: UI, safe local state, controlled edit, four languages, mobile.
 * Every record is fictional. No external connector or buyer file is accessed.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'SYN QA',role:'admin',
 userKey:'qa-vesaent-com',loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript',
 '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon',
 '.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream';
async function run(){
 const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://test.local').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep))return response.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{response.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',
  JSON.stringify(value)),session);
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem(
  'vesa.tna360.autosave.qa-vesaent-com')).plan);
 try{
  fs.mkdirSync(out,{recursive:true});
  await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action=new]').click();
  await page.locator('[data-wizard-tab=full]').click();
  for(const [name,value] of Object.entries({
   buyerName:'SYN MERCH BUYER',factoryName:'SYN KNIT FACTORY',styleNo:'SYN-STYLE-KNIT',
   poNumber:'SYN-PO-KNIT',totalQty:'1000',buyerRequiredExFactory:'2027-02-10',
   orderConfirmedOn:'2026-10-01',fabricSpec:'SYN 210 GSM COTTON SINGLE JERSEY',
   colorSizeBreakdown:'Navy | S | 250\nNavy | M | 350\nBlack | L | 400'
  }))await page.locator('#tnaWizard [name="'+name+'"]').fill(value);
  await page.locator('#tnaWizard button[type=submit]').click();
  const sheet=page.locator('#tnaMerchSheet');await sheet.waitFor();
  assert.match(await sheet.innerText(),/SYN MERCH BUYER/);
  assert.match(await sheet.innerText(),/SYN KNIT FACTORY/);
  assert.match(await sheet.innerText(),/SYN 210 GSM COTTON SINGLE JERSEY/);
  const total=(await stored()).tasks.length;
  assert.equal(await sheet.locator('[data-tna-sheet-task]').count(),total,'All applicable rows, not first 12');
  assert.equal(await page.locator('.vesa-workspace').count(),1);
  const before=JSON.stringify(await stored());
  await page.locator('#tnaMerchAsOf').fill('2026-10-17');
  await page.locator('[data-tna-merch-filter=overdue]').click();
  assert.match(await sheet.innerText(),/No sourced activities match/);
  assert.equal(await sheet.locator('[data-tna-sheet-task]').count(),0);
  await page.locator('[data-tna-merch-filter=all]').click();
  assert.equal(JSON.stringify(await stored()),before,'Filters may not change a TNA plan');
  assert.equal(await sheet.locator('[data-tna-sheet-task]').count(),total);
  await sheet.locator('[data-edit-task]').first().click();
  await page.locator('#tnaTaskEdit [name=nextStatus]').selectOption('completed');
  await page.locator('#tnaTaskEdit [name=actualDate]').fill('2026-10-18');
  await page.locator('#tnaTaskEdit button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#tnaMerchSheet')?.textContent?.includes('2026-10-18'));
  assert.equal((await stored()).tasks[0].dates.actualFinish,'2026-10-18');
  assert.equal((await stored()).tasks[0].status,'completed');
  await page.locator('[data-action=save]').click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-action=open]').click();
  await page.locator('[data-open-record]').first().click();
  await page.locator('#tnaDialog .tna-dialog-head button').click();
  assert.match(await sheet.innerText(),/2026-10-18/);
  assert.equal(await sheet.locator('[data-tna-sheet-task]').count(),total);
  for(const [lang,title] of [['en','Garment TNA Master Sheet'],['bn','গার্মেন্টস TNA মাস্টার শিট'],
   ['hi','गारमेंट TNA मास्टर शीट'],['ta','கார்மெண்ட் TNA மாஸ்டர் ஷீட்']]){
   const beforeLang=JSON.stringify(await stored());
   await page.locator('[data-vesa-user]').click();
   const settings=page.locator('[data-vesa-settings]');await settings.waitFor({state:'visible'});
   await settings.locator('[data-pref-language]').selectOption(lang);
   await page.waitForFunction(({title,lang})=>document.documentElement.lang===lang&&
    document.querySelector('#tnaMerchSheet h3')?.textContent===title,{title,lang});
   await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
   assert.equal(JSON.stringify(await stored()),beforeLang,'Language cannot translate source records');
  }
  for(const width of [320,360,390,768,1024,1280,1440]){
   await page.setViewportSize({width,height:880});
   const measure=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(measure<=width+1,width+'px page overflow: '+measure);
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await sheet.locator('table').count(),1);
   if([390,1280].includes(width))
    await page.screenshot({path:path.join(out,'tna-g13-merch-sheet-'+width+'.png'),fullPage:false});
  }
  assert.deepEqual(errors,[],'Uncaught Chromium errors');
  assert.deepEqual(external,[],'Remote/media requests prohibited');
  console.log('TNA G13 M1 REAL CHROMIUM PASS: all rows, manual date/filters, existing edit, local Save/Open, 4 languages, 320–1440 widths, one shell, zero remote.');
 }finally{await context.close();await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(err=>{console.error(err);process.exitCode=1;});
