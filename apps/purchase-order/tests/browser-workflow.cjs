/** APP-04 real Chromium PO flow with synthetic evidence only; no remote records. */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
class PurchaseOrderBrowserProof{
 async run(){
  const server=http.createServer((req,res)=>{
    const p=decodeURIComponent(new URL(req.url,'http://local').pathname);
    let file=path.resolve(root,'.'+p);
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    try{
      if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      const mime={'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png',
        '.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json'}[path.extname(file)]||'application/octet-stream';
      res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
    args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
    email:'po-test@vesaent.com',name:'SYNTHETIC QA',role:'admin',userKey:'po-test-vesaent-com',
    loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),errors=[],outside=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('request',req=>{if(!req.url().startsWith(host))outside.push(req.url());});
  const act=async name=>page.locator('[data-action="'+name+'"]').first().click();
  const enter=async data=>{
    for(const [k,v] of Object.entries(data)){
      const field=page.locator('#poDialog [name="'+k+'"]');
      if(!await field.count())throw Error('Missing PO field '+k);
      if(await field.evaluate(el=>el.tagName==='SELECT'))await field.selectOption(String(v));
      else await field.fill(String(v));
    }
  };
  const submit=async()=>{
    await page.locator('#poDialog form button[type="submit"]').click();
    await page.locator('#poDialog[open]').waitFor({state:'hidden',timeout:8000});
  };
  const records=async()=>page.evaluate(()=>{
    const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.purchase-order.records.v1.'));
    return JSON.parse(localStorage.getItem(key)).records;
  });
  try{
    await page.goto(host+'/apps/',{waitUntil:'domcontentloaded'});
    const link=page.locator('a[href="/apps/purchase-order/"]');
    assert.equal(await link.count(),1,'The purchase order personal demo must appear exactly once.');
    await link.click();
    await page.locator('[data-action="new"]').waitFor();
    assert.equal(await page.locator('.vesa-workspace').count(),1);
    assert.equal(await page.locator('[data-vesa-menu]').count(),6);
    // G4: the seven real sections are reachable from Home in fictional read-only mode.
    const stages=['summary','lines','confirmation','amendments','shipments','revisions','reports'];
    const previews=page.locator('.po-journey [data-action="preview"]');
    const noPO=()=>page.evaluate(()=>Object.keys(localStorage).every(k=>!k.startsWith('vesa.purchase-order.records.v1.')));
    assert.equal(await previews.count(),7);
    assert(await noPO(),'No PO is saved before exploring practice.');
    fs.mkdirSync(output,{recursive:true});
    for(const width of [320,390,1440]){
      await page.setViewportSize({width,height:850});
      assert.equal(await previews.count(),7,width+'px seven task controls visible.');
      const box=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,
        heights:[...document.querySelectorAll('.po-journey .po-btn')].map(el=>el.getBoundingClientRect().height)}));
      assert(box.scroll<=box.width+1,width+'px no body overflow');
      assert(box.heights.every(v=>v>=44),width+'px touch controls at least 44px');
      await page.screenshot({path:path.join(output,'po-g4-home-'+width+'.png'),fullPage:true});
    }
    await page.setViewportSize({width:390,height:850});
    for(const stage of stages){
      await page.locator('.po-journey [data-action="preview"][data-id="'+stage+'"]').click();
      assert.equal(await page.locator('.po-tabs [data-action="'+stage+'"]').getAttribute('aria-current'),'true',stage+' opens the genuine section');
      assert.match(await page.locator('#poMain').innerText(),/SYNTHETIC PRACTICE/,stage+' visibly fictional');
      assert(await page.locator('#poMain [data-action="save"]').isDisabled(),stage+' practice cannot save');
      assert(await noPO(),stage+' never creates a browser PO');
      if(stage==='reports')await page.screenshot({path:path.join(output,'po-g4-mobile-draft-reports.png')});
      await act('home');
    }
    await page.setViewportSize({width:1280,height:900});
    assert(await noPO(),'No business records after seven practice previews');
    // G5: real editable PO dialog focus, Escape and return to its original opener.
    await act('new');
    assert.equal(await page.evaluate(()=>document.activeElement?.name),'poNo','New PO focuses PO Number');
    await page.keyboard.press('Escape');
    await page.locator('#poDialog[open]').waitFor({state:'hidden'});
    await page.waitForFunction(()=>document.activeElement?.dataset?.action==='new');
    await act('new');
    await enter({poNo:'SYN-PO-01',buyer:'SYNTHETIC BUYER',issuer:'SYNTHETIC MERCHANDISER',
      factory:'SYNTHETIC FACTORY',shipTo:'SYNTHETIC PORT',
      currency:'USD',incoterm:'FOB',orderDate:'2026-10-01',
      shipFrom:'2026-10-20',shipToDate:'2026-11-15',source:'SYNTHETIC SIGNED PO',
      rounding:'line-half-up-2',declaredQty:'60',declaredAmount:'165.00',
      sizeRatioRef:'SYNTHETIC SIZE RATIO',packingInstructionRef:'SYNTHETIC PACKING REF'});
    await submit();
    for(const [size,qty,price] of [['M','40','2.5000'],['L','20','3.2500']]){
      await act('add-line');
      assert.equal(await page.evaluate(()=>document.activeElement?.name),'style','PO line form focuses Style');
      await enter({style:'SYNTHETIC TEE',color:'Navy',size,quantity:qty,unitFob:price,
        source:'SYNTHETIC LINE SOURCE'});await submit();
    }
    await act('summary');
    const summary=await page.locator('.po-grid').innerText();
    assert.match(summary,/60/);assert.match(summary,/165\.00/);
    await act('save');
    let p=(await records())[0];
    assert.equal(p.header.poNo,'SYN-PO-01');
    assert.equal(p.lines.length,2);
    // Header reopening must preserve original PO document source; nothing is fabricated.
    await act('meta');
    assert.equal(await page.locator('#poDialog [name="source"]').inputValue(),'SYNTHETIC SIGNED PO');
    await page.locator('#poClose').click();
    await act('amendments');await act('add-amendment');
    await enter({reason:'SYNTHETIC DATE CORRECTION',requestedBy:'SYNTHETIC BUYER',
      date:'2026-10-17',source:'SYNTHETIC AMEND SOURCE'});await submit();
    await act('acknowledge');
    await enter({ackBy:'SYNTHETIC FACTORY',date:'2026-10-18',document:'SYNTHETIC WRITTEN ACK'});
    await submit();
    p=(await records())[0];assert.equal(p.amendments[0].status,'acknowledged');
    assert.equal(p.acknowledgments.length,1);
    await act('confirmation');
    assert.match(await page.locator('.po-card').last().innerText(),/Needs Information/);
    await act('factory-entry');
    await enter({factoryQty:'58',factoryAmount:'164.00',factoryCurrency:'USD',
      factoryShipFrom:'2026-10-22',factoryShipTo:'2026-11-15',
      ackBy:'SYNTHETIC FACTORY',ackDate:'2026-10-18',
      document:'SYNTHETIC FACTORY LETTER',source:'SYNTHETIC FACTORY STATEMENT',
      reviewer:'Synthetic reviewer',reviewedOn:'2026-10-18'});await submit();
    await act('confirmation');
    assert.match(await page.locator('.po-card').last().innerText(),/Dates differ/);
    assert.equal((await records())[0].factoryConfirmation.quantity,58);
    await act('shipments');await act('add-shipment');
    await enter({quantity:'10',date:'2026-10-19',document:'SYNTHETIC INVOICE BL',
      source:'SYNTHETIC SHIP SOURCE',actor:'SYNTHETIC REVIEWER'});await submit();
    await act('add-cancel');
    await enter({quantity:'2',date:'2026-10-19',document:'SYNTHETIC CANCEL REFERENCE',
      source:'SYNTHETIC CANCEL SOURCE',actor:'SYNTHETIC REVIEWER'});await submit();
    p=(await records())[0];assert.equal(p.shipments.length,1);
    assert.equal(p.cancelled.length,1);assert.equal(p.header.ledgerComplete,false);
    await act('complete-ledger');
    await enter({ledgerSource:'SYNTHETIC FULL SHIPPING REGISTER'});
    await page.locator('#poDialog [name="ledger"]').check();await submit();
    await act('summary');
    assert.match(await page.locator('.po-grid').innerText(),/48/);
    await act('record-revision');
    await enter({authority:'SYNTHETIC BUYER SIGNATURE',effective:'2026-10-19',
      document:'SYNTHETIC FIRST PO REVISION',reason:'Reviewed example source'});
    await page.locator('#poDialog [name="reviewed"]').check();await submit();
    p=(await records())[0];assert.equal(p.revisions.length,1);
    const frozen=JSON.stringify(p.revisions[0]);
    await act('meta');
    await enter({packingInstructionRef:'SYNTHETIC REVISED PACK REF'});await submit();
    p=(await records())[0];assert.equal(JSON.stringify(p.revisions[0]),frozen);
    await act('revisions');
    const referenceEvent=page.waitForEvent('download');
    await act('export-reference');
    await enter({verifiedBy:'SYNTHETIC SOURCE REVIEWER',verifiedAt:'2026-10-20'});
    await page.locator('#poDialog [name=sourceReviewed]').check();await submit();
    const reviewFile=path.join(output,'po-app04-reviewed-reference.json');
    fs.mkdirSync(output,{recursive:true});
    await (await referenceEvent).saveAs(reviewFile);
    const ref=JSON.parse(fs.readFileSync(reviewFile,'utf8'));
    assert.deepEqual(Object.keys(ref),['sourceApp','recordType','recordId','revisionId','sourceDate',
      'verifiedBy','verifiedAt','displaySnapshot']);
    assert.equal(ref.displaySnapshot.totalPieces,60);
    assert.equal(ref.displaySnapshot.totalAmount,'165.00');
    assert.equal(ref.displaySnapshot.sourceLines[0].quantity,40);
    assert.equal(ref.displaySnapshot.localReviewOnly,true);
    await page.reload({waitUntil:'domcontentloaded'});await act('continue');
    p=(await records())[0];assert.equal(p.header.packingInstructionRef,'SYNTHETIC REVISED PACK REF');
    await act('reports');
    fs.mkdirSync(output,{recursive:true});
    const fileEvent=page.waitForEvent('download');await act('excel');
    const dl=await fileEvent,excelPath=path.join(output,'po-app04-synthetic.xlsx');
    await dl.saveAs(excelPath);
    const book=XLSX.read(fs.readFileSync(excelPath),{type:'buffer'});
    assert.deepEqual(book.SheetNames,['PO Summary','Style Colour Size','PO Balance','Amendment Register',
      'Acknowledgements','Buyer vs Factory Confirmation','PO Version Comparison','Source Revisions','Manual Shipment Sources']);
    assert.equal(book.Sheets['Style Colour Size'].E2.t,'n');
    assert.equal(book.Sheets['Style Colour Size'].E2.v,40);
    assert.equal(book.Sheets['Style Colour Size'].F2.v,2.5);
    assert.equal(book.Sheets['Style Colour Size'].G2.v,100);
    const pdfPath=path.join(output,'po-app04-print.pdf');
    await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
    assert(fs.statSync(pdfPath).size>3500);
    const copyEvent=page.waitForEvent('download');await act('download');
    const savedFile=await copyEvent,portable=path.join(output,'po-app04-synthetic.vesapo');
    await savedFile.saveAs(portable);
    assert(JSON.parse(fs.readFileSync(portable,'utf8')).checksum);
    await act('home');await act('upload');
    await page.locator('#poFile').setInputFiles(portable);
    await page.locator('#poDialog[open]').waitFor();await page.locator('#poClose').click();
    const imported=await records();assert.equal(imported.length,2);
    assert.notEqual(imported[0].id,imported[1].id);
    const bad=path.join(output,'po-app04-corrupt.vesapo');
    fs.writeFileSync(bad,fs.readFileSync(portable,'utf8').replace('"3.2500"','"9.2500"'));
    const beforeBad=JSON.stringify(await records());
    await page.locator('#poFile').setInputFiles(bad);
    await page.locator('#poDialog[open]').waitFor();
    assert.match(await page.locator('#poDialogBody').innerText(),/altered or unsupported/i);
    await page.locator('#poClose').click();
    assert.equal(JSON.stringify(await records()),beforeBad);
    for(const width of [320,390,768,1280,1440]){
      await page.setViewportSize({width,height:844});
      const doc=await page.evaluate(()=>document.documentElement.scrollWidth);
      assert(doc<=width+1,width+'px body has overflow '+doc);
    }
    await page.setViewportSize({width:320,height:720});
    await act('summary');await act('meta');
    assert.equal(await page.evaluate(()=>document.activeElement?.name),'poNo','320px PO header opens at number');
    assert((await page.locator('#poDialog').evaluate(el=>el.getBoundingClientRect().width))<=320,
     '320px PO header dialog remains in viewport');
    await page.screenshot({path:path.join(output,'po-app04-edit-320.png')});
    await page.keyboard.press('Escape');
    await page.locator('#poDialog[open]').waitFor({state:'hidden'});
    await page.waitForFunction(()=>document.activeElement?.dataset?.action==='meta');
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(output,'po-app04-mobile.png')});
    await page.setViewportSize({width:1280,height:900});
    for(const [language,label] of [['en','Style / Colour / Size'],['bn','স্টাইল / রঙ / সাইজ'],
      ['hi','स्टाइल / रंग / साइज'],['ta','Style / Colour / Size']]){
      const before=JSON.stringify(await records());
      await page.locator('[data-vesa-user]').click();
      const settings=page.locator('[data-vesa-settings]');
      await settings.locator('[data-pref-language]').selectOption(language);
      await page.waitForFunction(x=>document.documentElement.lang===x,language);
      await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
      assert.match(await page.locator('.po-tabs').innerText(),new RegExp(label));
      await act('home');
      const titles={en:'Explore seven PO work steps',bn:'PO-এর সাতটি কাজের ধাপ',
        hi:'PO के सात कार्य चरण',ta:'PO-வின் ஏழு வேலைப் பகுதிகள்'};
      assert.equal(await page.locator('#poJourneyTitle').innerText(),titles[language]);
      assert.equal(await page.locator('.po-journey [data-action="preview"]').count(),7);
      await act('continue');
      assert.equal(JSON.stringify(await records()),before,'Language/Home/Continue preserve immutable PO data.');
    }
    await page.reload({waitUntil:'domcontentloaded'});await act('continue');
    assert.equal((await records())[0].revisions.length,1);
    assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);
    console.log('PO-360 CHROMIUM PASS: explicit source/order/line controls, ACK, shipment ledger, immutable revision, native Excel/PDF, portable copy and corruption rejection, 4 languages, 320/390/768/1280 and zero external requests.');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
 }
}
new PurchaseOrderBrowserProof().run().catch(error=>{console.error(error);process.exitCode=1;});
