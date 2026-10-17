/** APP-03 G4: test actual synthetic POM projection, six working tabs, record safety. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright','techpack-g4-chart');
const sizes=[320,390,1440],tabs=['summary','poms','grades','bom','revisions','reports'];
const session={email:'techpack-g4@vesa.invalid',name:'Synthetic Tech QA',role:'admin',
 userKey:'techpack-g4',loginAt:'2026-10-18T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
 '.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.jpg':'image/jpeg'};
function server(){
 return http.createServer((req,res)=>{
  const q=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!q.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   const f=fs.statSync(q).isDirectory()?path.join(q,'index.html'):q;
   const size=fs.statSync(f).size;
   res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream',
    'Content-Length':size,'Cache-Control':'no-store'});
   fs.createReadStream(f).pipe(res);
  }catch{res.writeHead(404).end();}
 });
}
async function check(browser,base,width){
 const context=await browser.newContext({viewport:{width,height:width<500?844:900},
  deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(record=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(record)),session);
 const page=await context.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push(r.url()));
 const saved=()=>page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage)
  .filter(([k])=>k.startsWith('vesa.tech-pack-spec.records.v1.')))));
 try{
  await page.goto(base+'/apps/tech-pack-spec/',{waitUntil:'domcontentloaded'});
  await page.locator('#techLabTitle').waitFor({state:'visible',timeout:22000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'one shared VESA header');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'six platform menu buttons');
  const lab=page.locator('.sp-lab'),buttons=lab.locator('.sp-lab-action');
  assert.equal(await buttons.count(),6,'all six actual TechPack modules');
  const values=await lab.locator('.sp-lab-table tbody td').allTextContents();
  assert.deepEqual(values.map(x=>x.trim()),['48.00','50.00','52.00'],
    'S-M-L targets MUST come from source-approved synthetic +/-2cm demo, never static markup');
  const header=await lab.locator('.sp-lab-table thead th').allTextContents();
  assert.deepEqual(header.slice(-3).map(x=>x.trim()),['S','M','L'],'size series from engine fixture');
  const heights=await buttons.evaluateAll(items=>items.map(x=>Math.round(x.getBoundingClientRect().height)));
  assert.ok(heights.every(x=>x>=44),width+'px all buttons touch-usable '+heights);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth))<=width+1,
   width+' no horizontal overflow');
  const note=page.locator('.sp-local-info');assert.equal(await note.count(),1);
  await note.locator('summary').click();
  assert.match(await note.innerText(),/Local technical draft/);
  await note.locator('summary').click();
  const before=await saved();
  await page.screenshot({path:path.join(out,'techpack-specimen-'+width+'.png'),
   animations:'disabled',fullPage:false});
  for(const tab of tabs){
   await page.locator('[data-action=preview-'+tab+']').click();
   await page.locator('.sp-tabs [data-action="'+tab+'"][aria-current=true]')
     .waitFor({state:'visible'});
   const current=await page.evaluate(()=>({
    section:document.querySelector('.sp-tabs [aria-current=true]')?.dataset.action,
    tabs:document.querySelectorAll('.sp-tabs [data-action]').length,
    practice:document.querySelector('#specMain')?.textContent?.includes('SYNTHETIC PRACTICE'),
    saveDisabled:document.querySelector('#specMain [data-action=save]')?.disabled
   }));
   assert.equal(current.section,tab,width+' '+tab+' navigated to real working panel');
   assert.equal(current.tabs,6,'all six panels still present');
   assert.equal(current.practice,true,'practice explicitly fictional');
   assert.equal(current.saveDisabled,true,'no saved record from practice mode');
   assert.equal(await saved(),before,'preview never writes saved tech specifications');
   if(width===390&&tab==='poms')await page.screenshot({
    path:path.join(out,'techpack-pom-editor-390.png'),animations:'disabled',fullPage:false});
   await page.locator('[data-action=home]').first().click();
   await buttons.first().waitFor({state:'visible'});
  }
  if(width===390){
   const languages=[
    ['bn','সাইজ চার্ট দেখে নিন'],
    ['hi','साइज़ चार्ट कैसे बनता है'],
    ['ta','சைஸ் சார்ட் எப்படி வருகிறது?'],
    ['en','See the size chart in action']
   ];
   for(const [code,label] of languages){
    const setting=page.locator('[data-vesa-user]');
    if(!(await setting.isVisible()))await page.locator('[data-vesa-mobile-menu]').click();
    await setting.click();
    const dia=page.locator('[data-vesa-settings]');
    await dia.waitFor({state:'visible'});
    await dia.locator('[data-pref-language]').selectOption(code);
    await dia.locator('footer button').click();
    assert.equal(await page.locator('#techLabTitle').textContent(),label,
      code+' chart copy is translated');
    assert.equal(await buttons.count(),6,'original work tabs retained after locale changes');
    assert.equal(await saved(),before,'no tech spec mutation from locale');
   }
   await page.screenshot({path:path.join(out,'techpack-tamil-roundtrip-390.png'),
    animations:'disabled',fullPage:false});
  }
  await page.emulateMedia({media:'print'});
  assert.equal(await lab.evaluate(x=>getComputedStyle(x).display),'none',
    'synthetic tutorial is excluded from printed technical specification');
  assert.deepEqual(errors,[],width+' no runtime page errors');
  assert.deepEqual(failures,[],width+' no failed requests');
  console.log('TECHPACK_G4_VIEW '+JSON.stringify({width,projection:values,steps:6,
   opened:6,minTouch:Math.min(...heights),savedChanged:false}));
 }finally{await context.close();}
}
async function main(){
 fs.mkdirSync(out,{recursive:true});const app=server();
 await new Promise(ok=>app.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+app.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  for(const width of sizes)await check(browser,base,width);
  console.log('TECHPACK G4 PASS 3 screens, actual source projected POM, 18 links, 4 languages, local safety, print');
 }finally{await browser.close();await new Promise(ok=>app.close(ok));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
