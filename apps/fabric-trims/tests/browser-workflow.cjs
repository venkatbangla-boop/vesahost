/* APP-06 synthetic real-browser BOM/lot/QC/shortage acceptance. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
class FabricBrowserTest {
 async run(){
  const server=http.createServer((req,res)=>{
   const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
   let file=path.resolve(root,'.'+pathname);
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript',
     '.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml',
     '.json':'application/json'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
   headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
   email:'synthetic-fabric@vesaent.com',name:'SYNTHETIC MATERIAL QA',role:'admin',
   userKey:'synthetic-fabric-vesaent-com',loginAt:'2026-10-17T00:00:00Z',
   expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith(host))remote.push(req.url());});
  const act=async key=>page.locator('[data-action="'+key+'"]').first().click();
  const fill=async data=>{
   for(const [key,value] of Object.entries(data)){
    const el=page.locator('#ftDialog [name="'+key+'"]');
    if(!await el.count())throw Error('Missing fabric form '+key);
    if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(value));
    else await el.fill(String(value));
   }
  };
  const submit=async()=>{
   await page.locator('#ftDialog form button[type=submit]').click();
   await page.locator('#ftDialog[open]').waitFor({state:'hidden',timeout:9000});
  };
  const saved=async()=>page.evaluate(()=>{
   const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.fabric-trims.records.v1.'));
   return JSON.parse(localStorage.getItem(key)).records;
  });
  try{
   await page.goto(host+'/apps/',{waitUntil:'domcontentloaded'});
   const link=page.locator('a[href="/apps/fabric-trims/"]');
   assert.equal(await link.count(),1,'Material app should be registered exactly once.');
   await link.click();
   await page.locator('[data-action=new]').waitFor({timeout:9000});
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   // Original stage previews cannot fabricate QC release or change stock.
   const steps=['summary','materials','requirements','bookings','receipts','allocations','reservations','exceptions','reports'];
   const previews=page.locator('.ft-journey [data-action="preview"]');
   const noStoredRecords=()=>page.evaluate(()=>Object.keys(localStorage).every(k=>!k.startsWith('vesa.fabric-trims.records.v1.')));
   assert.equal(await previews.count(),9);
   assert(await noStoredRecords(),'No material record before preview');
   fs.mkdirSync(out,{recursive:true});
   for(const width of [320,390,1440]){
    await page.setViewportSize({width,height:850});
    assert.equal(await previews.count(),9,width+'px all nine task links');
    const bounds=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
      heights:[...document.querySelectorAll('.ft-journey .ft-btn')].map(n=>n.getBoundingClientRect().height)}));
    assert(bounds.scroll<=bounds.width+1,width+'px home no overflow');
    assert(bounds.heights.every(h=>h>=44),width+'px touch actions');
    await page.screenshot({path:path.join(out,'fabric-g4-home-'+width+'.png'),fullPage:true});
   }
   await page.setViewportSize({width:390,height:850});
   for(const step of steps){
    await page.locator('.ft-journey [data-action="preview"][data-id="'+step+'"]').click();
    assert.equal(await page.locator('.ft-tabs [data-action="'+step+'"]').getAttribute('aria-current'),'true',step+' real section');
    assert.match(await page.locator('#ftMain').innerText(),/SYNTHETIC PRACTICE/,step+' remains fictional');
    assert(await page.locator('#ftMain [data-action="save"]').isDisabled(),step+' cannot save');
    assert(await noStoredRecords(),step+' does not create stock');
    if(step==='reports')await page.screenshot({path:path.join(out,'fabric-g4-mobile-report.png')});
    await act('home');
   }
   await page.setViewportSize({width:1280,height:900});
   assert(await noStoredRecords(),'Nine previews never create stock or QC data');
   // G5-08: Original first-field focus/keyboard Escape before source entry.
   await act('new');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'poNo','New BOM record focuses PO number');
   await page.keyboard.press('Escape');
   await page.locator('#ftDialog[open]').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.activeElement?.dataset?.action==='new');
   assert(await noStoredRecords(),'Escaping uncommitted BOM must not write local inventory');
   await act('new');
   await fill({poNo:'SYN-PO-FAB-01',style:'SYN-TEE',buyer:'SYNTHETIC BUYER',
    factory:'SYNTHETIC FACTORY',bomRevision:'BOM-V1',
    bomSource:'SYNTHETIC APPROVED BOM',requiredDate:'2026-11-15',
    calendarBasis:'calendar',calendarSource:'SYNTHETIC BUYER DELIVERY CALENDAR'});
   await submit();
   await act('item');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'kind','Material form focuses documented material type');
   await fill({kind:'fabric',description:'SYNTHETIC COTTON JERSEY',unit:'kg',
    composition:'100% Cotton',gsm:'180',width:'68',widthUnit:'in',
    construction:'Single Jersey',sourceRef:'SYNTHETIC TECH PACK FABRIC'});
   await submit();
   await act('requirements');await act('requirement');
   await fill({colour:'Navy',size:'M',approvedRequired:'560.0000',
    sourceRef:'SYNTHETIC APPROVED BOM QUANTITY',orderPieces:'1000',
    consumptionPerPiece:'0.5500',consumptionSource:'SYNTHETIC FABRIC CONSUMPTION',
    wastagePct:'2.0000',wastageSource:'SYNTHETIC WASTAGE APPROVAL',
    demandRounding:'half-up-4',targetLot:'LOT-A',targetShade:'NAVY-1'});
   await submit();
   await act('bookings');await act('booking');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'item','Supplier booking focuses material choice');
   await fill({supplier:'SYNTHETIC YARN/FABRIC SUPPLIER',bookingRef:'SYN-BOOK-01',
    orderedQty:'600.0000',unit:'kg',committedDate:'2026-11-10',
    lot:'LOT-A',shade:'NAVY-1',sourceRef:'SYNTHETIC SUPPLIER BOOKING'});
   await submit();
   await act('receipts');await act('receipt');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'bookingRef','Goods receipt starts at source booking');
   await fill({receiptRef:'SYN-GRN-001',date:'2026-11-08',
    qty:'400.0000',rejected:'10.0000',lot:'LOT-A',shade:'NAVY-1',
    qaStatus:'pending',sourceRef:'SYNTHETIC WAREHOUSE GRN'});
   await submit();
   await act('allocations');await act('allocation');
   await fill({allocationQty:'300.0000',date:'2026-11-09',
    sourceRef:'SYNTHETIC MATERIAL ALLOCATION'});
   await page.locator('#ftDialog form button[type=submit]').click();
   assert.match(await page.locator('#ftDialog [role=alert]').innerText(),/QA release/i);
   await page.locator('#ftClose').click();
   assert.equal((await saved())[0].allocations.length,0,'Pending QC cannot move into stock.');
   await act('receipts');await act('qa-review');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'qaStatus','QC review focuses explicit source decision');
   await fill({qaStatus:'approved',qaDate:'2026-11-09',qaActor:'SYNTHETIC QA PERSON',
    qaSource:'SYNTHETIC QA RELEASE NOTE'});await submit();
   await act('allocations');await act('allocation');
   await fill({allocationQty:'300.0000',date:'2026-11-09',
    sourceRef:'SYNTHETIC MATERIAL ALLOCATION'});await submit();
   await act('reservations');
   // Browser-proven DOM and controller state, not a guessed fix for a disappearing control.
   const debugReserve=await page.evaluate(()=>({
    section:window.VesaFabric360?.section,
    qa:window.VesaFabric360?.current?.receipts?.map(r=>r.qaStatus),
    receipts:window.VesaFabric360?.current?.receipts?.length,
    allocations:window.VesaFabric360?.current?.allocations?.length,
    actions:[...document.querySelectorAll('#ftMain [data-action]')].map(n=>n.dataset.action),
    alerts:[...document.querySelectorAll('[role=alert]')].map(n=>n.textContent.slice(0,240)),
    title:document.querySelector('#ftMain .ft-card:last-child h2')?.textContent
   }));
   assert(await page.locator('[data-action="reservation"]').count(),
    'Material reserve action missing: '+JSON.stringify(debugReserve));
   await act('reservation');
   await fill({otherPo:'SYN-OTHER-PO-02',reservationQty:'80.0000',
    date:'2026-11-10',sourceRef:'SYNTHETIC OTHER PO RESERVE'});await submit();
   await act('exceptions');
   assert.match(await page.locator('.ft-card').last().innerText(),/260.0000/);
   assert.match(await page.locator('.ft-card').last().innerText(),/10.0000/);
   // Move back from Exceptions to the reservation register before editing.
   // The action button exists only inside its own inline VESA workspace section.
   await act('reservations');
   await act('reservation');
   await fill({otherPo:'SYN-OTHER-PO-03',reservationQty:'20.0000',
    date:'2026-11-11',sourceRef:'SYNTHETIC EXCESS RESERVATION'});
   await page.locator('#ftDialog form button[type=submit]').click();
   assert.match(await page.locator('#ftDialog [role=alert]').innerText(),/Negative stock|double allocation/);
   await page.locator('#ftClose').click();
   assert.equal((await saved())[0].reservations.length,1);
   const receiptBaseline=JSON.stringify((await saved())[0].receipts);
   await act('summary');await act('header');
   await fill({bomRevision:'BOM-V2',bomSource:'SYNTHETIC REVISED BUYER BOM'});await submit();
   assert.equal(JSON.stringify((await saved())[0].receipts),receiptBaseline,
    'New BOM revision must never rewrite earlier actual GRN or QA status.');
   const derived=await page.evaluate(()=>{
    const app=window.VesaFabric360;return app.E.calculate(app.current);
   });
   assert.equal(derived.requirementsStatus[0].readiness,'review-needed');
   await act('reference-export');
   await fill({reviewer:'SYNTHETIC LOCAL MATERIAL REVIEWER',reviewDate:'2026-11-16'});
   await page.locator('#ftDialog [name=reviewed]').check();
   const refEvent=page.waitForEvent('download');await submit();
   fs.mkdirSync(out,{recursive:true});
   const refPath=path.join(out,'fabric-app06-reference.json');
   await (await refEvent).saveAs(refPath);
   const reference=JSON.parse(fs.readFileSync(refPath,'utf8'));
   assert.equal(reference.displaySnapshot.notPPMGo,true);
   assert.equal(reference.displaySnapshot.notTnaCompletion,true);
   assert.equal(reference.displaySnapshot.lines[0].shortage,'260.0000');
   await act('reports');
   const excelEvent=page.waitForEvent('download');await act('excel');
   const xlsPath=path.join(out,'fabric-app06-synthetic.xlsx');
   await (await excelEvent).saveAs(xlsPath);
   const book=XLSX.read(fs.readFileSync(xlsPath),{type:'buffer'});
   assert.deepEqual(book.SheetNames,['Order Material Summary','Material Master',
     'BOM Requirements','Supplier Bookings','Goods Receipt QC','Lot Allocation',
     'Other PO Reservations','Receipt Availability','Shortage Readiness',
     'Delivery Exceptions','Manual Source References']);
   assert.equal(book.Sheets['BOM Requirements'].E2.t,'n');
   assert.equal(book.Sheets['BOM Requirements'].E2.v,560);
   const pdf=path.join(out,'fabric-app06-synthetic.pdf');
   await page.pdf({path:pdf,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdf).size>3500);
   const copyEvent=page.waitForEvent('download');await act('download');
   const portable=path.join(out,'fabric-app06-synthetic.vesafabric');
   await (await copyEvent).saveAs(portable);
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   assert.equal((await saved())[0].receipts.length,1);
   assert.equal((await saved())[0].allocations.length,1);
   await act('home');await act('upload');
   await page.locator('#ftFile').setInputFiles(portable);
   await page.locator('#ftDialog[open]').waitFor();await page.locator('#ftClose').click();
   assert.equal((await saved()).length,2);
   const bad=path.join(out,'fabric-app06-corrupt.vesafabric');
   fs.writeFileSync(bad,fs.readFileSync(portable,'utf8').replace('SYN-GRN-001','CHANGED-GRN'));
   const before=JSON.stringify(await saved());
   await page.locator('#ftFile').setInputFiles(bad);
   await page.locator('#ftDialog[open]').waitFor();
   assert.match(await page.locator('#ftDialogBody').innerText(),/altered\/unsupported/);
   await page.locator('#ftClose').click();
   assert.equal(JSON.stringify(await saved()),before);
   for(const width of [320,390,768,1280,1440]){
    await page.setViewportSize({width,height:840});
    assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width+1,width+'px page overflow');
   }
   // Mobile test opens the real editable BOM header, not just the landing page.
   await page.setViewportSize({width:320,height:720});
   await act('summary');await act('header');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'poNo','320px BOM edit starts at PO number');
   assert((await page.locator('#ftDialog').evaluate(el=>el.getBoundingClientRect().width))<=320,
    '320px BOM editor fits viewport');
   await page.screenshot({path:path.join(out,'fabric-app06-header-dialog-320.png')});
   await page.keyboard.press('Escape');
   await page.locator('#ftDialog[open]').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.activeElement?.dataset?.action==='header');
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(out,'fabric-app06-mobile.png')});
   await page.setViewportSize({width:1280,height:900});
   for(const [lang,label] of [['en','BOM Requirements'],['bn','বিওএম চাহিদা'],
    ['hi','BOM जरूरत'],['ta','BOM Requirements']]){
    const history=JSON.stringify(await saved());
    await page.locator('[data-vesa-user]').click();
    const settings=page.locator('[data-vesa-settings]');
    await settings.locator('[data-pref-language]').selectOption(lang);
    await page.waitForFunction(x=>document.documentElement.lang===x,lang);
    await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
    assert.match(await page.locator('.ft-tabs').innerText(),new RegExp(label));
    await act('home');
    const titles={en:'Explore nine Fabric & Trims work steps',bn:'ফ্যাব্রিক ও ট্রিমসের নয়টি ধাপ',
      hi:'फैब्रिक और ट्रिम्स के नौ चरण',ta:'Fabric & Trims — ஒன்பது வேலைப் பகுதிகள்'};
    assert.equal(await page.locator('#ftJourneyTitle').innerText(),titles[lang]);
    assert.equal(await page.locator('.ft-journey [data-action="preview"]').count(),9);
    await act('continue');
    assert.equal(JSON.stringify(await saved()),history);
   }
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   assert.equal((await saved())[0].reservations.length,1);
   assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
   console.log('FABRIC-360 CHROMIUM PASS: BOM demand, supplier booking, pending QC hold, source approval, allocation and reservation, overstock rejection, stale BOM, XLSX/PDF, reviewed TNA/PPM reference, local/corrupt copy, EN/BN/HI/TA and 320–1280 pixels.');
  }finally{await context.close();await browser.close();await new Promise(done=>server.close(done));}
 }
}
new FabricBrowserTest().run().catch(e=>{console.error(e);process.exitCode=1;});
