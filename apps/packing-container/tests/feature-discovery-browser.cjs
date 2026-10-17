/** APP-01 G4 feature access: eight real tabs discoverable from Home.
 * Uses synthetic practice only. No writing or changing user packing records. */
'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright','packing-feature-discovery');
const tabIds=['summary','order','cartons','packs','containers','loads','reports','revision'];
const screenWidths=[320,390,1440];
const session={email:'packing-g4@vesa.invalid',name:'Synthetic Packing QA',role:'admin',
 userKey:'packing-g4',loginAt:'2026-10-18T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript',
 '.ico':'image/x-icon','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
function server(){
 return http.createServer((req,res)=>{
  let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
   res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream',
    'Cache-Control':'no-store','Content-Length':fs.statSync(f).size});
   fs.createReadStream(f).pipe(res);
  }catch{res.writeHead(404).end();}
 });
}
async function runCase(browser,base,width){
 const context=await browser.newContext({viewport:{width,height:width<500?844:900},
  deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(s=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(s)),session);
 const page=await context.newPage(),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',e=>failed.push(e.url()));
 try{
  await page.goto(base+'/apps/packing-container/',{waitUntil:'domcontentloaded'});
  const preview=page.locator('#packingMain .pack-explore-action');
  await preview.first().waitFor({state:'visible',timeout:20000});
  assert.equal(await preview.count(),8,'All eight approved working sections are visible');
  assert.equal(await page.locator('.vesa-workspace').count(),1,'One shared platform shell');
  assert.equal(await page.locator('.pack-explorer-kicker').count(),1);
  const heights=await preview.evaluateAll(nodes=>nodes.map(el=>Math.round(el.getBoundingClientRect().height)));
  assert(heights.every(h=>h>=44),width+'px preview touch buttons are usable '+heights);
  const pageSize=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert(pageSize<=width+1,width+'px home horizontal overflow '+pageSize);
  assert.equal(await page.getByText('NON-COMMERCIAL PERSONAL DEMO.',{exact:true}).count(),0,
   'No oversized repeated warning displacing actual app work');
  const stored=()=>page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage)
   .filter(([key])=>key.startsWith('vesa.packing-container.records.v1.')))));
  const baseline=await stored();
  await page.screenshot({path:path.join(out,'pack-home-'+width+'.png'),animations:'disabled'});
  for(const tab of tabIds){
   await page.locator('[data-action="preview-'+tab+'"]').click();
   const active=page.locator('.pack-tabs [data-action="'+tab+'"][aria-current="true"]');
   await active.waitFor({state:'visible'});
   const snapshot=await page.evaluate(()=>({
    section:document.querySelector('.pack-tabs [aria-current="true"]')?.dataset.action,
    practice:document.querySelector('#packingMain')?.textContent?.includes('TEST-PO-0001'),
    tabs:document.querySelectorAll('.pack-tabs [data-action]').length,
    saveDisabled:document.querySelector('#packingMain [data-action="save"]')?.disabled
   }));
   assert.equal(snapshot.section,tab,width+'/'+tab+' action deep-links to actual editor');
   assert.equal(snapshot.practice,true,width+'/'+tab+' only fictional source/example');
   assert.equal(snapshot.tabs,8,width+'/'+tab+' has all opened module tabs');
   assert.equal(snapshot.saveDisabled,true,width+'/'+tab+' practice cannot be committed');
   assert.equal(await stored(),baseline,width+'/'+tab+' does not mutate any prior packing records');
   if(width===390&&tab==='containers')
    await page.screenshot({path:path.join(out,'pack-container-workflow-390.png'),animations:'disabled'});
   await page.locator('[data-action="home"]').first().click();
   await preview.first().waitFor({state:'visible'});
  }
  if(width===390){
   await page.locator('[data-vesa-user]').click();
   const preferences=page.locator('[data-vesa-settings]');
   await preferences.waitFor({state:'visible'});
   await preferences.locator('[data-pref-language]').selectOption('ta');
   await preferences.locator('footer button').click();
   await page.locator('#packExploreTitle').waitFor({state:'visible'});
   assert.equal(await page.locator('#packExploreTitle').textContent(),'8 வேலைப் பகுதிகளைப் பாருங்கள்');
   assert.equal(await stored(),baseline,'Tamil preference switch does not alter packing records');
   await page.screenshot({path:path.join(out,'pack-home-tamil-390.png'),animations:'disabled'});
  }
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.pack-explorer').evaluate(x=>getComputedStyle(x).display),'none',
   'Feature explorer must not appear in packing print report');
  assert.deepEqual(errors,[],width+' no browser script errors');
  assert.deepEqual(failed,[],width+' no local request failures');
  console.log('PACK_G4_FEATURE '+JSON.stringify({width,buttons:8,opened:8,
   minimumTouchHeight:Math.min(...heights),savedRecordsChanged:false,errors:errors.length}));
 }finally{await context.close();}
}
async function run(){
 fs.mkdirSync(out,{recursive:true});
 const s=server();await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
 const host='http://127.0.0.1:'+s.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  for(const width of screenWidths)await runCase(browser,host,width);
  console.log('PACK_G4_PASS 3 viewports, 24 real section links, Tamil, print, 44px and immutable synthetic records');
 }finally{await browser.close();await new Promise(ok=>s.close(ok));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
