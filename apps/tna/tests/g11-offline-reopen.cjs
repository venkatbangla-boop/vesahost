/**
 * F42 real local Chromium test: installed app shell survives offline navigation,
 * editable named-order record, safe backup and Excel export; reconnect/reopen.
 * Synthetic fixture only; no real customer source or external provider.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream';
async function run(){
  const server=http.createServer((req,res)=>{
    const pathName=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);
    let file=path.resolve(root,'.'+pathName);
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});
      res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
    headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},
    acceptDownloads:true,serviceWorkers:'allow'});
  await context.addInitScript(s=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(s)),session);
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(async()=>{
      const reg=await navigator.serviceWorker.getRegistration('./');
      return reg?.active?.scriptURL.endsWith('/apps/tna/service-worker.js');
    },null,{timeout:25000});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    const registered=await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL);
    assert(registered.endsWith('/apps/tna/service-worker.js'));
    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    for(const [name,value] of Object.entries({
      buyerName:'F42 Synthetic Buyer',factoryName:'F42 Synthetic Factory',
      styleNo:'F42-STYLE',poNumber:'F42-PO',totalQty:'250',
      orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2026-12-18'
    }))await page.locator('#tnaWizard [name="'+name+'"]').fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const first=await page.evaluate(()=>JSON.parse(localStorage.getItem(
      'vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    const id=first.recordId;
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded',timeout:25000});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.locator('[data-edit-task]').first().click();
    await page.locator('#tnaFollowupEdit [name="ownerParty"]').fill('Offline QA team');
    await page.locator('#tnaFollowupEdit [name="note"]').fill('Synthetic offline source note');
    await page.locator('#tnaFollowupEdit button[type="submit"]').click();
    const updated=await page.evaluate(()=>JSON.parse(localStorage.getItem(
      'vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(updated.recordId,id);
    assert.equal(updated.tasks[0].ownerParty,'Offline QA team');
    assert(updated.auditEvents.length>first.auditEvents.length);
    assert.deepEqual(updated.baselineSnapshots,first.baselineSnapshots);
    await page.locator('[data-action="download"]').click();
    await page.locator('#tnaDialog #tnaDialogBody').getByText(/Portable copy prepared/i).waitFor();
    const portable=await page.evaluate(()=>{
      const box=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
      const text=VesaTnaStorage.exportCopy(box.records[0].plan);
      return VesaTnaStorage.importCopy(text);
    });
    assert.equal(portable.recordId,id);
    assert.equal(portable.tasks[0].ownerParty,'Offline QA team');
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const fileEvent=page.waitForEvent('download');
    await page.locator('[data-vesa-mobile-menu]').click();
    await page.locator('[data-vesa-menu="Tools"]').click();
    await page.locator('[data-menu-action="Prepare Report"]').click();
    await page.locator('[data-report-action="excel"]').click();
    const dl=await fileEvent;
    fs.mkdirSync(output,{recursive:true});
    const xlsxPath=path.join(output,'tna-f42-offline-report.xlsx');
    await dl.saveAs(xlsxPath);
    const wb=XLSX.read(fs.readFileSync(xlsxPath),{type:'buffer'});
    assert(wb.SheetNames.includes('Order Summary'));
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.screenshot({path:path.join(output,'tna-f42-offline-saved-mobile.png')});
    const geo=await page.evaluate(()=>({page:document.documentElement.scrollWidth,width:innerWidth}));
    assert(geo.page<=geo.width+1);
    await context.setOffline(false);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem(
      'vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(restored.recordId,id);
    assert.equal(restored.tasks[0].ownerParty,'Offline QA team');
    assert.deepEqual(errors,[]);
    assert.deepEqual(external,[]);
    console.log('TNA F42 Chromium PASS: scoped install/cache, real offline reload, task edit/save, checksum recovery, XLSX export, 390px, online reopen and zero external requests.');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
