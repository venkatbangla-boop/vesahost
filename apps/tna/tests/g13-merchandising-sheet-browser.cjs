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
  // G14: the date button owns a human-source planning revision, never a buyer approval.
  await sheet.locator('[data-edit-task-dates]').first().click();
  await page.locator('#tnaPlanningDateForm [name=baselineFinish]').fill('2026-10-14');
  await page.locator('#tnaPlanningDateForm [name=currentTargetFinish]').fill('2026-10-15');
  await page.locator('#tnaPlanningDateForm [name=forecastFinish]').fill('2026-10-18');
  await page.locator('#tnaPlanningDateForm [name=sourceRef]').fill('SYN MERCH SOURCE NOTE-01');
  await page.locator('#tnaPlanningDateForm [name=sourceDate]').fill('2026-10-17');
  await page.locator('#tnaPlanningDateForm [name=reason]').fill('SYN internal order planning update');
  await page.locator('#tnaPlanningDateForm button[type=submit]').click();
  await page.locator('#tnaPlanningDateForm').waitFor({state:'hidden'});
  assert.equal((await stored()).tasks[0].dates.baselineFinish,'2026-10-14');
  assert.equal((await stored()).tasks[0].dates.currentTargetFinish,'2026-10-15');
  assert.equal((await stored()).tasks[0].dates.forecastFinish,'2026-10-18');
  assert.equal((await stored()).tasks[0].dates.actualFinish,null);
  assert.equal((await stored()).tasks[0].status,'not-started');
  assert.equal((await stored()).revisionEvents.at(-1).eventType,'sourced-task-finish-dates-revised');
  assert.match(await sheet.innerText(),/SYN MERCH SOURCE NOTE-01/);
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
  assert.equal((await stored()).tasks[0].dates.currentTargetFinish,'2026-10-15');
  assert.equal((await stored()).revisionEvents.at(-2).eventType,'sourced-task-finish-dates-revised');
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
   // G17: the actual source-backed date editor, not just the sheet heading,
   // must switch language while preserving task IDs, dates and buyer decisions.
   const labelByLanguage={
    en:['Edit sourced planning dates','Source document / dated meeting note','Save reviewed date change'],
    bn:['উৎস যাচাই করে পরিকল্পনার তারিখ বদলান','উৎস নথি / তারিখসহ মিটিং নোট','যাচাই করা তারিখ সেভ করুন'],
    hi:['स्रोत देखकर योजना की तारीख बदलें','स्रोत दस्तावेज़ / तारीख वाला मीटिंग नोट','समीक्षित तारीख सेव करें'],
    ta:['ஆதாரத்துடன் திட்டத் தேதியை மாற்று','ஆதார ஆவணம் / தேதியிட்ட மீட்டிங் குறிப்பு','சரிபார்த்த தேதியைச் சேமி']
   };
   await sheet.locator('[data-edit-task-dates]').first().click();
   const dialog=page.locator('#tnaDialog');
   const form=dialog.locator('#tnaPlanningDateForm');await form.waitFor();
   const visible=await dialog.innerText();
   for(const label of labelByLanguage[lang])
    assert(visible.toLocaleLowerCase(lang).includes(label.toLocaleLowerCase(lang)),
      lang+': missing translated date-dialog label: '+label);
   for(const name of ['baselineFinish','currentTargetFinish','forecastFinish',
    'sourceRef','sourceDate','reason'])assert.equal(await form.locator('[name="'+name+'"]').count(),1);
   await page.keyboard.press('Escape');await form.waitFor({state:'hidden'});
   assert.equal(JSON.stringify(await stored()),beforeLang,lang+': opening translated dialog must not alter order');
  }
  // M3: actual device-local XLSX and isolated Chromium A4 print proof; never a real buyer file.
  await page.setViewportSize({width:1280,height:900});
  const xlsxWait=page.waitForEvent('download');
  await sheet.locator('[data-tna-merch-excel]').click();
  const xlsxDownload=await xlsxWait;
  const workbookFile=path.join(out,'tna-g13-merch-sheet-draft.xlsx');
  await xlsxDownload.saveAs(workbookFile);
  const workbookBytes=fs.readFileSync(workbookFile);
  assert.equal(workbookBytes.subarray(0,2).toString(),'PK','Must be an actual XLSX ZIP');
  const XLSX=require('../vendor/xlsx.full.min.js');
  const book=XLSX.read(workbookBytes,{type:'buffer'});
  assert.deepEqual(book.SheetNames,['Order Summary','Activity Master','Colour Size','Planning Revisions']);
  const activity=XLSX.utils.sheet_to_json(book.Sheets['Activity Master'],{header:1,raw:true});
  assert.equal(activity.length,total+1,'Every existing garment task must be in the local XLSX');
  assert.equal(activity[1][4],'2026-10-14');
  assert.equal(activity[1][5],'2026-10-15');
  assert.equal(activity[1][6],'2026-10-18');
  assert.equal(activity[1][7],'2026-10-18');
  assert.equal(activity[1][8],4,'Actual calendar delay calculated only from entered dates');
  assert.match(activity[1][10],/SYN MERCH SOURCE NOTE-01/);
  const revisions=XLSX.utils.sheet_to_json(book.Sheets['Planning Revisions'],{header:1,raw:true});
  assert.equal(revisions.length,4,'All dated before/after human revisions appear');
  const localBeforePrint=JSON.stringify(await stored());
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.body.classList.add('tna-printing-merch-sheet'));
  const paper=await page.evaluate(()=>{
   const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&el.getClientRects().length>0;
   const target=document.getElementById('tnaMerchSheet');
   return {sheet:visible(target),hero:visible(document.querySelector('.tna-hero')),
    oldReport:visible(document.querySelector('.tna-report-preview')),
    rows:document.querySelectorAll('.tna-merch-table tbody tr').length,
    controls:visible(document.querySelector('.tna-merch-outputs')),
    tableRight:document.querySelector('.tna-merch-table')?.getBoundingClientRect().right,
    pageRight:document.getElementById('tnaMain')?.getBoundingClientRect().right};
  });
  assert.equal(paper.sheet,true,'Only Master Sheet visible on local print');
  assert.equal(paper.hero,false,'Decorative TNA home must not print');
  assert.equal(paper.oldReport,false,'Older R01–R12 previews must not mix with sheet');
  assert.equal(paper.rows,total,'All garment activities remain printable');
  assert.equal(paper.controls,false,'Download/Print controls hidden in PDF');
  assert(paper.tableRight<=paper.pageRight+2,'Printed activity table must fit the local document width');
  const pdf=await page.pdf({format:'A4',landscape:true,printBackground:true});
  assert.equal(pdf.subarray(0,4).toString(),'%PDF');
  assert(pdf.length>7000,'A4 PDF must be nonempty');
  fs.writeFileSync(path.join(out,'tna-g13-merch-sheet-draft.pdf'),pdf);
  await page.evaluate(()=>document.body.classList.remove('tna-printing-merch-sheet'));
  await page.emulateMedia({media:'screen'});
  assert.equal(JSON.stringify(await stored()),localBeforePrint,'Export/print never mutate plan');
  for(const width of [320,360,390,768,1024,1280,1440]){
   await page.setViewportSize({width,height:880});
   const measure=await page.evaluate(()=>document.documentElement.scrollWidth);
   if(measure>width+1){
    const culprits=await page.evaluate(()=>[...document.querySelectorAll('body *')]
     .filter(el=>{const b=el.getBoundingClientRect();return b.right>innerWidth+1&&
       !el.closest('.tna-merch-scroll')&&getComputedStyle(el).display!=='none'})
     .slice(0,18).map(el=>{const b=el.getBoundingClientRect();return {
       tag:el.tagName,selector:el.className?.toString()?.slice(0,90),
       left:b.left,right:b.right,width:b.width,scrollWidth:el.scrollWidth,
       parent:el.parentElement?.className?.toString()?.slice(0,65)};}));
    console.error('MOBILE OVERFLOW DEBUG',JSON.stringify({width,measure,culprits}));
   }
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
