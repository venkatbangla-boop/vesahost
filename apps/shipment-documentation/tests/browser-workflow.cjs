/* APP-07 actual Chromium shipment flow with only synthetic, non-commercial inputs. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
class ShipmentBrowserProof{
 async run(){
  const server=http.createServer((req,res)=>{
   const pathURL=decodeURIComponent(new URL(req.url,'http://test').pathname);
   let file=path.resolve(root,'.'+pathURL);
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const type={'.html':'text/html','.css':'text/css','.js':'application/javascript',
      '.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}[path.extname(file)]||
      'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
   headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',
   JSON.stringify({email:'synthetic-shipping@vesaent.com',name:'SYNTHETIC SHIP QA',
    role:'admin',userKey:'synthetic-shipping-vesaent-com',
    loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith(host))external.push(req.url());});
  const act=async action=>page.locator('[data-action="'+action+'"]').first().click();
  const fill=async fields=>{
   for(const [k,v] of Object.entries(fields)){
    const el=page.locator('#sdDialog [name="'+k+'"]');
    if(!await el.count())throw Error('Missing shipment source input '+k);
    if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(v));
    else await el.fill(String(v));
   }
  };
  const submit=async()=>{
   await page.locator('#sdDialog form button[type=submit]').click();
   await page.locator('#sdDialog[open]').waitFor({state:'hidden',timeout:10000});
  };
  const saved=async()=>page.evaluate(()=>{
   const key=Object.keys(localStorage).find(x=>x.startsWith('vesa.shipment-documentation.records.v1.'));
   return JSON.parse(localStorage.getItem(key)).records;
  });
  try{
   await page.goto(host+'/apps/shipment-documentation/',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action=new]').waitFor({timeout:12000});
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   // Eight real panels from Home. Fictional draft data never creates a
   // customer order, shipping release, bank evidence or local saved record.
   const stages=['summary','invoice','packing','dispatches','documents','transport','revisions','reports'];
   const previews=page.locator('.sd-journey [data-action="preview"]');
   const noStoredShipment=()=>page.evaluate(()=>Object.keys(localStorage).every(k=>!k.startsWith('vesa.shipment-documentation.records.v1.')));
   assert.equal(await previews.count(),8);
   assert(await noStoredShipment(),'Home starts without persisted shipment');
   fs.mkdirSync(out,{recursive:true});
   for(const width of [320,390,1440]){
    await page.setViewportSize({width,height:850});
    assert.equal(await previews.count(),8,width+'px eight original stages');
    const g=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
     actions:[...document.querySelectorAll('.sd-journey .sd-btn')].map(x=>x.getBoundingClientRect().height)}));
    assert(g.scroll<=g.width+1,width+'px no document overflow');
    assert(g.actions.every(n=>n>=44),width+'px touch actions at least 44px');
    await page.screenshot({path:path.join(out,'ship-app07-g4-home-'+width+'.png'),fullPage:true});
   }
   await page.setViewportSize({width:390,height:850});
   for(const stage of stages){
    await page.locator('.sd-journey [data-action="preview"][data-id="'+stage+'"]').click();
    assert.equal(await page.locator('.sd-tabs [data-action="'+stage+'"]').getAttribute('aria-current'),'true',stage+' original panel');
    assert.match(await page.locator('#sdMain').innerText(),/SYNTHETIC PRACTICE/,stage+' is fictional');
    assert(await page.locator('#sdMain [data-action="save"]').isDisabled(),stage+' cannot save');
    if(stage==='invoice')assert.match(await page.locator('.sd-card').last().innerText(),/DEMO-PO-LINE-M/);
    if(stage==='packing')assert.match(await page.locator('.sd-card').last().innerText(),/CTN-001/);
    if(stage==='documents')assert.match(await page.locator('.sd-card').last().innerText(),/DEMO-INVOICE-V1/);
    if(stage==='revisions')assert.match(await page.locator('.sd-card').last().innerText(),/PACK-REV1/);
    if(stage==='reports')await page.screenshot({path:path.join(out,'ship-app07-g4-mobile-report.png'),fullPage:true});
    assert(await noStoredShipment(),stage+' does not create shipment records');
    await act('home');
   }
   await page.setViewportSize({width:1280,height:900});
   assert(await noStoredShipment(),'Practice previews never write saved records');
   // G5-09: shipment forms start with source fields, not the Close control.
   await act('new');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'poNo','New shipment focuses sourced PO');
   await page.keyboard.press('Escape');
   await page.locator('#sdDialog[open]').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.activeElement?.dataset?.action==='new');
   assert(await noStoredShipment(),'Escaped draft must not create shipment files');
   await act('new');
   await fill({poNo:'SYN-PO-SHIP-001',buyer:'SYNTHETIC BUYER',
    shipper:'SYNTHETIC FACTORY',consignee:'SYNTHETIC CONSIGNEE',
    invoiceNo:'SYN-COMINV-001',currency:'USD',incoterm:'FOB',
    sourceRef:'SYNTHETIC BUYER SHIPPING REQUIREMENTS',
    invoiceControl:'125.00',invoiceControlSource:'SYNTHETIC CONTROL INVOICE',
    invoiceDate:'2026-10-14',originCountry:'Bangladesh',
    originEvidence:'SYNTHETIC ORIGIN DOCUMENT',
    hsCode:'DEMO HS CODE',hsEvidence:'SYNTHETIC CLASSIFICATION DOCUMENT'});
   await submit();
   await act('add-line');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'poLineRef','Invoice line starts at source reference');
   await fill({poLineRef:'SYN-PO-LINE-M',style:'SYNTHETIC TEE',
    colour:'Navy',size:'M',lot:'LOT-A',pieces:'50',unitPrice:'2.5000',
    rounding:'line-half-up-2',invoiceSource:'SYNTHETIC SIGNED PO FOB'});
   await submit();
   await act('invoice');
   assert.match(await page.locator('.sd-card').last().innerText(),/SYN-PO-LINE-M/);
   await act('packing');
   for(const [id,pcs,net,gross,cbm] of [
    ['SYN-CTN-001','20','8.000','8.800','0.0440'],
    ['SYN-CTN-002','30','11.000','12.000','0.0660']]){
    await act('add-carton');
    assert.equal(await page.evaluate(()=>document.activeElement?.name),'line','Carton form starts at invoice-line choice');
    await fill({cartonId:id,pieces:pcs,netKg:net,grossKg:gross,
      cbm,sourceRef:'SYNTHETIC APPROVED CARTON DETAILS'});await submit();
   }
   const baseline=JSON.stringify((await saved())[0].packing);
   await act('review-packing');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'revisionId','Packing review starts at signed-source revision');
   await fill({revisionId:'SYN-PACK-REV-1',reviewer:'SYNTHETIC SHIPPING REVIEWER',
    reviewDate:'2026-10-15',sourceRef:'SYNTHETIC SIGNED PACKING SOURCE',
    controlCartons:'2',controlPieces:'50',controlNetKg:'19.000',
    controlGrossKg:'20.800',controlCbm:'0.1100'});await submit();
   assert.equal((await saved())[0].packingSnapshots.length,1);
   assert.equal(JSON.stringify((await saved())[0].packingSnapshots[0].cartons),baseline);
   // Wrong carton count is visibly rejected without replacing immutable packing.
   await act('review-packing');
   await fill({revisionId:'SYN-PACK-BAD',reviewer:'SYNTHETIC SHIPPING REVIEWER',
    reviewDate:'2026-10-16',sourceRef:'SYNTHETIC INCORRECT PACKING',
    controlCartons:'3',controlPieces:'50',controlNetKg:'19.000',
    controlGrossKg:'20.800',controlCbm:'0.1100'});
   await page.locator('#sdDialog form button[type=submit]').click();
   assert.match(await page.locator('#sdDialog [role=alert]').innerText(),/carton.count|carton-count/i);
   await page.locator('#sdClose').click();
   assert.equal((await saved())[0].packingSnapshots.length,1);
   await act('dispatches');await act('add-dispatch');
   await fill({pieces:'20',dispatchDate:'2026-10-16',
    carrierRef:'SYNTHETIC DISPATCH NOTE',actor:'SYNTHETIC DISPATCH TEAM',
    sourceRef:'SYNTHETIC WAREHOUSE GATE PASS'});await submit();
   await act('documents');await act('add-document');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'kind','Document editor starts at document kind');
   await fill({kind:'invoice',versionNo:'1',status:'draft',
    documentRef:'SYNTHETIC COMM INV V1',date:'2026-10-14',
    actor:'SYNTHETIC MERCHANDISER',sourceRef:'SYNTHETIC INVOICE FILE'});await submit();
   await act('add-document');
   await fill({kind:'invoice',versionNo:'2',status:'acknowledged',
    documentRef:'SYNTHETIC COMM INV V2',date:'2026-10-17',
    actor:'SYNTHETIC MERCHANDISER',sourceRef:'SYNTHETIC REVISED INVOICE',
    ackActor:'SYNTHETIC FORWARDER',ackDate:'2026-10-17',
    ackEvidence:'SYNTHETIC ACK EMAIL'});
   const previous=(await saved())[0].documents[0].id;
   await page.locator('#sdDialog [name=parentId]').selectOption(previous);
   await submit();
   const docs=(await saved())[0].documents;assert.equal(docs.length,2);
   assert.equal(docs[0].status,'draft','First document evidence cannot be rewritten.');
   assert.equal(docs[1].status,'acknowledged');
   await act('transport');await act('transport-entry');
   await fill({bookingRef:'SYNTHETIC-BOOK-20',bookingSource:'SYNTHETIC BOOKING NOTE',
    carrier:'SYNTHETIC SHIPPING LINE',vessel:'SYNTHETIC VESSEL',
    portLoad:'SYNTHETIC ORIGIN PORT',portDischarge:'SYNTHETIC DESTINATION PORT',
    etd:'2026-10-20',eta:'2026-11-15',dateBasis:'calendar',
    dateSource:'SYNTHETIC CARRIER SCHEDULE',
    blRef:'SYNTHETIC BL',blSource:'SYNTHETIC BL DOCUMENT',
    transportDispatchDate:'2026-10-16',
    transportDispatchSource:'SYNTHETIC RELEASE NOTE',
    transportActor:'SYNTHETIC TRANSPORT REVIEWER'});await submit();
   await act('complete-ledger');
   await page.locator('#sdDialog [name=completeLedger]').check();
   await fill({ledgerSource:'SYNTHETIC COMPLETE DISPATCH REGISTER'});await submit();
   await act('summary');const summary=await page.locator('.sd-grid').innerText();
   for(const value of ['50','125.00','20','2'])assert(summary.includes(value));
   const state=await page.evaluate(()=>window.VesaShipment360.E.analyze(window.VesaShipment360.current));
   assert.equal(state.packingMatched,true);assert.equal(state.invoiceValueMatched,true);
   assert.equal(state.dispatchLines[0].unshipped,30);
   assert.equal(state.release,'DRAFT / NEEDS INFORMATION');
   await act('reference-export');
   await fill({localReviewer:'SYNTHETIC LOCAL REVIEWER',localReviewDate:'2026-10-17'});
   await page.locator('#sdDialog [name=confirm]').check();
   const refEvent=page.waitForEvent('download');await submit();
   fs.mkdirSync(out,{recursive:true});
   const refPath=path.join(out,'ship-app07-reviewed-reference.json');
   await (await refEvent).saveAs(refPath);
   const reference=JSON.parse(fs.readFileSync(refPath,'utf8'));
   assert.equal(reference.recordType,'ShipmentFile');
   assert.equal(reference.displaySnapshot.notCustomsRelease,true);
   assert.equal(reference.displaySnapshot.notAQLRelease,true);
   assert.equal(reference.displaySnapshot.dispatchPieces,20);
   await act('save');const prior=(await saved())[0];
   assert.equal(prior.documents.length,2);
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   assert.equal((await saved())[0].packingSnapshots.length,1);
   await act('reports');
   const report=await page.locator('.sd-report').innerText();
   assert.match(report,/DRAFT ONLY/);assert.match(report,/SYN-PACK-REV-1/);
   const excelEvent=page.waitForEvent('download');await act('excel');
   const excelPath=path.join(out,'ship-app07-synthetic.xlsx');
   await (await excelEvent).saveAs(excelPath);
   const book=XLSX.read(fs.readFileSync(excelPath),{type:'buffer'});
   assert.deepEqual(book.SheetNames,['Shipment Summary','Commercial Invoice Draft',
    'Packing List','Shipment Reconciliation','Dispatch Register','Document Checklist',
    'Document Version History','Packing Revision History','Transport ETA',
    'Manual App References']);
   assert.equal(book.Sheets['Commercial Invoice Draft'].F2.t,'n');
   assert.equal(book.Sheets['Commercial Invoice Draft'].F2.v,50);
   assert.equal(book.Sheets['Commercial Invoice Draft'].G2.v,2.5);
   assert.equal(book.Sheets['Commercial Invoice Draft'].H2.v,125);
   const pdfPath=path.join(out,'ship-app07-synthetic.pdf');
   await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdfPath).size>3500);
   const copyEvent=page.waitForEvent('download');await act('download');
   const portable=path.join(out,'ship-app07-synthetic.vesaship');
   await (await copyEvent).saveAs(portable);
   await act('home');await act('upload');
   await page.locator('#sdFile').setInputFiles(portable);
   await page.locator('#sdDialog[open]').waitFor();await page.locator('#sdClose').click();
   assert.equal((await saved()).length,2);
   const invalid=path.join(out,'ship-app07-corrupted.vesaship');
   fs.writeFileSync(invalid,fs.readFileSync(portable,'utf8').replace('SYN-CTN-001','ATTACKED-CARTON'));
   const beforeBad=JSON.stringify(await saved());
   await page.locator('#sdFile').setInputFiles(invalid);
   await page.locator('#sdDialog[open]').waitFor();
   assert.match(await page.locator('#sdDialogBody').innerText(),/altered\/unsupported/);
   await page.locator('#sdClose').click();
   assert.equal(JSON.stringify(await saved()),beforeBad);
   for(const width of [320,360,390,768,1024,1280,1440]){
    await page.setViewportSize({width,height:850});
    const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert(scroll<=width+1,width+'px document overflow '+scroll);
    if(width===768)await page.screenshot({path:path.join(out,'ship-app07-tablet.png')});
    if(width===1440)await page.screenshot({path:path.join(out,'ship-app07-wide-desktop.png')});
   }
   // 1280 CSS-px display at browser zoom 200% has a 640 CSS-px
   // effective layout viewport; testing this viewport avoids CSS zoom
   // changing scrollWidth's coordinate basis and giving a false failure.
   await page.setViewportSize({width:640,height:900});
   const effectiveZoomScroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(effectiveZoomScroll<=641,
    '200% effective layout width produced horizontal overflow '+effectiveZoomScroll);
   await page.screenshot({path:path.join(out,'ship-app07-zoom-200-equivalent.png')});
   // Direct mobile edit-form test supplements the eight opened sections.
   await page.setViewportSize({width:320,height:720});
   await act('summary');await act('header');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'poNo','320px shipment header starts at PO');
   assert((await page.locator('#sdDialog').evaluate(el=>el.getBoundingClientRect().width))<=320,
    '320px shipment header modal stays within viewport');
   await page.screenshot({path:path.join(out,'ship-app07-header-edit-320.png')});
   await page.keyboard.press('Escape');
   await page.locator('#sdDialog[open]').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.activeElement?.dataset?.action==='header');
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(out,'ship-app07-mobile.png')});
   await page.setViewportSize({width:1280,height:900});
   for(const [language,label] of [['en','Draft Invoice'],['bn','খসড়া ইনভয়েস'],
    ['hi','ड्राफ्ट इनवॉइस'],['ta','Draft Invoice']]){
    const stateBefore=JSON.stringify(await saved());
    await page.locator('[data-vesa-user]').click();
    const settings=page.locator('[data-vesa-settings]');
    await settings.locator('[data-pref-language]').selectOption(language);
    await page.waitForFunction(x=>document.documentElement.lang===x,language);
    await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
    assert.match(await page.locator('.sd-tabs').innerText(),new RegExp(label));
    await act('home');
    const headings={en:'Explore eight shipping work steps',bn:'শিপমেন্টের আটটি কাজের ধাপ',
     hi:'शिपमेंट के आठ कार्य चरण',ta:'Shipment Documents — எட்டு வேலைப் பகுதிகள்'};
    assert.equal(await page.locator('#sdJourneyTitle').innerText(),headings[language]);
    assert.equal(await page.locator('.sd-journey [data-action="preview"]').count(),8);
    await act('continue');
    assert.equal(JSON.stringify(await saved()),stateBefore,'Switching language, Home and Continue does not mutate source.');
   }
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   assert.equal((await saved())[0].documents.length,2);
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   console.log('SHIPMENT-360 CHROMIUM PASS: sourced PO invoice, carton/CBM draft controls, immutable packing and document revisions, independent dispatch/BL, evidence-gated status, XLSX/PDF, reviewed reference, corrupted-copy atomicity, 4 languages, 320/390/768/1280 and zero external requests.');
  }finally{await context.close();await browser.close();await new Promise(done=>server.close(done));}
 }
}
new ShipmentBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});
