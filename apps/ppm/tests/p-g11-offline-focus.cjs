/** G3 PPM browser bundle proof with prior cache and no network, synthetic only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
 '.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.json':'application/json',
 '.ttf':'font/ttf','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const session={email:'ppm-offline@vesa.invalid',name:'Synthetic Offline QA',role:'admin',
 userKey:'ppm-offline',expiresAt:'2099-01-01T00:00:00.000Z',loginAt:'2026-10-18T00:00:00.000Z'};
function serve(){
 return http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const bytes=fs.readFileSync(file);
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':bytes.length}).end(bytes);
  }catch{res.writeHead(404).end();}
 });
}
async function run(){
 const instance=serve();await new Promise(ok=>instance.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+instance.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/apps/ppm/',{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>typeof app!=='undefined'&&document.body.classList.contains('at-home'),null,{timeout:30000});
  await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL?.endsWith('/apps/ppm/service-worker.js'),null,{timeout:30000});
  const ready=await page.evaluate(async()=>{
   const all=await caches.keys(),cache=await caches.open('vesa-ppm-5.1.5-shell-7');
   return {all,urls:(await cache.keys()).map(request=>request.url)};
  });
  assert(ready.all.includes('vesa-ppm-5.1.5-shell-7'),'new scoped bundle installed');
  assert(ready.urls.some(s=>s.includes('workspace.css?v=5.1.5-g3-focus')),'new CSS precached');
  assert(ready.urls.some(s=>s.includes('section-focus.js?v=5.1.5-g3-focus')),'controller precached');
  // An old visitor can retain older caches. A legacy stylesheet may NEVER
  // override the new focused-section workflow after the new worker activates.
  await page.evaluate(async()=>{
   const old=await caches.open('vesa-ppm-5.1.5-shell-6');
   await old.put(new Request('/apps/ppm/workspace.css?v=5.1.5'),
    new Response('body.ppm-section-focus #sectionsRoot>.section-card{display:block!important}',{
     headers:{'Content-Type':'text/css'}}));
  });
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.body.classList.contains('at-home'),null,{timeout:30000});
  await page.locator('#homeScreen [data-command=new]').click();
  await page.waitForFunction(()=>document.body.classList.contains('ppm-section-focus'),null,{timeout:30000});
  const evidence=await page.evaluate(()=>({
   mounted:document.querySelectorAll('.checkpoint').length,
   visible:[...document.querySelectorAll('#sectionsRoot>.section-card')]
     .filter(el=>getComputedStyle(el).display!=='none').length,
   css:document.querySelector('link[href*="workspace.css"]')?.getAttribute('href'),
   actions:document.querySelectorAll('#sectionNav [data-target]').length,
   savedRecords:localStorage.getItem('vesa.appcentre.session.v1')!==null
  }));
  assert.equal(evidence.mounted,168,'all source checkpoints remain present offline');
  assert.equal(evidence.visible,1,'new focus mode survives complete network loss');
  assert.equal(evidence.css,'workspace.css?v=5.1.5-g3-focus','new CSS URL wins over old cache');
  assert.equal(evidence.actions,16,'all section-navigation buttons remain');
  assert.equal(evidence.savedRecords,true,'local browser session remains available');
  assert.deepEqual(errors,[],'no runtime JS errors');
  console.log('PPM G3 OFFLINE PASS '+JSON.stringify(evidence));
 }finally{
  await context.close();await browser.close();await new Promise(ok=>instance.close(ok));
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
