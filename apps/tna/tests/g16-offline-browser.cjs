/**
 * G16 actual Chromium OFFLINE proof of the personal-synthetic TNA demo.
 * Owns an isolated localhost HTTP server, browser context and fictitious order.
 * No live buyer data, external service, provider login or physical UAT involved.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
class TnaOfflineChromiumProof {
  static root=path.resolve(__dirname,'../../..');
  static output=path.join(this.root,'output','playwright');
  static session={email:'qa@vesaent.com',name:'SYN QA',role:'admin',
    userKey:'qa-vesaent-com',loginAt:'2026-10-17T00:00:00Z',
    expiresAt:'2099-01-01T00:00:00Z'};
  static mime(file){
    return ({'.css':'text/css','.html':'text/html','.js':'application/javascript',
      '.json':'application/json','.ico':'image/x-icon','.png':'image/png',
      '.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
      '.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream';
  }
  /** Serve source bytes exactly with no-store; no Pages or external network. */
  static async serve(){
    const server=http.createServer((req,res)=>{
      const pathname=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);
      let file=path.resolve(this.root,'.'+pathname);
      if(!file.startsWith(this.root+path.sep))return res.writeHead(403).end();
      try{
        if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
        res.writeHead(200,{'Content-Type':this.mime(file),'Cache-Control':'no-store'});
        res.end(fs.readFileSync(file));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    return server;
  }
  static async run(){
    const server=await this.serve(),base='http://127.0.0.1:'+server.address().port;
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
      headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
    const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
    await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',
      JSON.stringify(value)),this.session);
    const page=await context.newPage(),errors=[],external=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
    try{
      fs.mkdirSync(this.output,{recursive:true});
      await page.goto(base+'/apps/tna/',{waitUntil:'load'});
      await page.waitForFunction(()=>!!window.VesaTnaStorage&&!!window.VesaTnaDomain);
      const ready=await page.evaluate(async()=>{
        const reg=await navigator.serviceWorker.ready;
        return {scope:reg.scope,active:reg.active?.scriptURL||''};
      });
      assert.equal(ready.scope,base+'/apps/tna/','Dedicated worker scope must not own siblings');
      assert.equal(ready.active,base+'/apps/tna/service-worker.js');
      await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL?.endsWith(
        '/apps/tna/service-worker.js'),null,{timeout:25000});
      await page.evaluate(async()=>{
        const root=await caches.open('vesa-v83-product-development-personal-demo');
        await root.put('/synthetic-tna-worker-root-preservation',
          new Response('root static-cache preserved'));
        const ppm=await caches.open('vesa-ppm-existing-fixture');
        await ppm.put('/synthetic-tna-worker-ppm-preservation',new Response('ppm preserved'));
        const aql=await caches.open('vesa-aql-existing-fixture');
        await aql.put('/synthetic-tna-worker-aql-preservation',new Response('aql preserved'));
      });
      const pre=await page.evaluate(async()=>{
        const cache=await caches.open('vesa-tna-20261017-g17-merch-v1');
        return (await cache.keys()).map(request=>request.url);
      });
      assert(pre.length>=25,'Install must precache complete bundle before claiming clients');
      assert(pre.some(x=>x.includes('/apps/tna/src/merchandising-sheet.js?v=0.3.1-merch-g17')));
      assert(pre.some(x=>x.includes('/apps/tna/src/offline-register.js?v=0.1.0-merch-g16')));
      assert(pre.some(x=>x.endsWith('/assets/vesa-logo-black.png')));
      await page.evaluate(()=>{
        const plan=VesaTnaDomain.createPlan({
          templateId:'knit',buyerName:'SYN OFFLINE BUYER',
          factoryName:'SYN OFFLINE FACTORY',
          styleNo:'SYN-OFFLINE-G16',poNumber:'SYN-PO-G16',totalQty:1000,
          orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2027-02-10',
          fabricSpec:'SYN COTTON 180 GSM'
        },{ownerUserId:'qa-vesaent-com'});
        const result=VesaTnaStorage.savePlan(plan,'qa-vesaent-com');
        if(result?.ok===false)throw Error('Synthetic plan did not save locally');
      });
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL?.endsWith(
        '/apps/tna/service-worker.js'));
      // Disconnect the real HTTP server from the browser. All subsequent static
      // HTML/JS/CSS/XLSX file bytes must be answered by the scoped TNA worker.
      await context.setOffline(true);
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('[data-action=open]').click();
      await page.locator('[data-open-record]').first().click();
      await page.locator('#tnaDialog .tna-dialog-head button').click();
      const sheet=page.locator('#tnaMerchSheet');
      await sheet.waitFor();
      assert.match(await sheet.innerText(),/SYN OFFLINE BUYER/);
      assert.match(await sheet.innerText(),/SYN OFFLINE FACTORY/);
      const count=await page.evaluate(()=>VesaTnaStorage.listPlans('qa-vesaent-com')[0].plan?.tasks?.length
        ||VesaTnaStorage.listPlans('qa-vesaent-com')[0].tasks?.length);
      const shown=await sheet.locator('[data-tna-sheet-task]').count();
      assert(shown>100,'All apparel activities must reopen when totally offline');
      if(Number.isInteger(count)&&count>0)assert.equal(shown,count);
      const workbookEvent=page.waitForEvent('download');
      await sheet.locator('[data-tna-merch-excel]').click();
      const download=await workbookEvent;
      const filename=path.join(this.output,'tna-g16-offline-master-sheet.xlsx');
      await download.saveAs(filename);
      const bytes=fs.readFileSync(filename);
      assert.equal(bytes.subarray(0,2).toString(),'PK','Offline XLSX is a real workbook');
      const XLSX=require('../vendor/xlsx.full.min.js');
      const book=XLSX.read(bytes,{type:'buffer'});
      assert.deepEqual(book.SheetNames,['Order Summary','Activity Master',
        'Colour Size','Planning Revisions']);
      assert.equal(XLSX.utils.sheet_to_json(book.Sheets['Activity Master'],
        {header:1,raw:true}).length,shown+1);
      // A local reviewer can revise an existing task while offline. Autosave and
      // portable Save Now remain browser-local; no approval is synthesized.
      await sheet.locator('[data-edit-task-dates]').first().click();
      await page.locator('#tnaPlanningDateForm [name=currentTargetFinish]').fill('2026-11-02');
      await page.locator('#tnaPlanningDateForm [name=sourceRef]').fill('SYN OFFLINE DATED MEETING NOTE');
      await page.locator('#tnaPlanningDateForm [name=sourceDate]').fill('2026-10-17');
      await page.locator('#tnaPlanningDateForm [name=reason]').fill('SYN offline revision before sync');
      await page.locator('#tnaPlanningDateForm button[type=submit]').click();
      await page.locator('#tnaPlanningDateForm').waitFor({state:'hidden'});
      assert.match(await sheet.innerText(),/SYN OFFLINE DATED MEETING NOTE/);
      await page.locator('[data-action=save]').click();
      await page.locator('#tnaDialog .tna-dialog-head button').click();
      await page.screenshot({path:path.join(this.output,'tna-g16-offline-390.png')});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('[data-action=open]').click();
      await page.locator('[data-open-record]').first().click();
      await page.locator('#tnaDialog .tna-dialog-head button').click();
      assert.match(await sheet.innerText(),/SYN OFFLINE DATED MEETING NOTE/);
      assert.match(await sheet.innerText(),/2026-11-02/);
      const preserved=await page.evaluate(async()=>{
        const entries=[
          ['vesa-v83-product-development-personal-demo','/synthetic-tna-worker-root-preservation'],
          ['vesa-ppm-existing-fixture','/synthetic-tna-worker-ppm-preservation'],
          ['vesa-aql-existing-fixture','/synthetic-tna-worker-aql-preservation']
        ];
        return Promise.all(entries.map(async([name,url])=>!!await(await caches.open(name)).match(url)));
      });
      assert.deepEqual(preserved,[true,true,true],'Must preserve all other cache namespaces');
      assert.deepEqual(errors,[],'No JavaScript exceptions while totally offline');
      assert.deepEqual(external,[],'Zero external network requests');
      console.log('TNA G16 REAL CHROMIUM OFFLINE PASS: exact scoped worker, complete static bundle,'+
        ' disconnected reload, all garment rows, offline XLSX, sourced date revisions,'+
        ' browser Save/Open across offline reload, preserved root/PPM/AQL caches, no external network.');
    }finally{
      await context.setOffline(false);
      await context.close();
      await browser.close();
      await new Promise(resolve=>server.close(resolve));
    }
  }
}
TnaOfflineChromiumProof.run().catch(error=>{console.error(error);process.exitCode=1;});
