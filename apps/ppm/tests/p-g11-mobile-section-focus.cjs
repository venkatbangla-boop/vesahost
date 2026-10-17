/** PPM G3: focused mobile section navigation without changing 168 decisions. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const out=path.join(root,'output','playwright','ppm-g3-focus');
const widths=[320,390,768,1280];
const session={email:'g3-ppm@vesa.invalid',name:'Synthetic PPM QA',role:'admin',
 userKey:'g3-ppm',loginAt:'2026-10-18T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json',
 '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.ico':'image/x-icon',
 '.webmanifest':'application/manifest+json'};
function serve(){
 return http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const stat=fs.statSync(file);
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream',
    'Cache-Control':'no-store','Content-Length':stat.size});
   fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(404).end();}
 });
}
function geometry(){
 const root=document.getElementById('sectionsRoot'),
 sections=[...root.querySelectorAll(':scope > .section-card')];
 const visible=sections.filter(n=>getComputedStyle(n).display!=='none');
 const buttons=[...document.querySelectorAll('.section-nav-wrap .nav-chip, #ppmSectionExpand, .checkpoint .status-btn')]
  .filter(n=>getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().height>0);
 return {
  master:document.getElementById('masterCount')?.textContent,
  total:root.querySelectorAll('.checkpoint').length,
  sections:sections.length,visibleSections:visible.map(s=>s.id),
  bodyClass:document.body.classList.contains('ppm-section-focus'),
  docHeight:document.documentElement.scrollHeight,docWidth:document.documentElement.scrollWidth,
  minButtonHeight:buttons.length?Math.min(...buttons.map(x=>Math.round(x.getBoundingClientRect().height))):null,
  buttonText:document.getElementById('ppmSectionExpand')?.textContent,
  buttonHidden:document.getElementById('ppmSectionExpand')?.hidden,
  selectedNav:[...document.querySelectorAll('#sectionNav [aria-pressed=true]')].map(x=>x.dataset.target)
 };
}
async function runCase(browser,base,width){
 const context=await browser.newContext({viewport:{width,height:width<=390?844:900},
  deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>requests.push(r.url()));
 try{
  await page.goto(base+'/apps/ppm/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof app!=='undefined'&&document.body.classList.contains('at-home'),
   null,{timeout:30000});
  await page.locator('#homeScreen [data-command=new]').click();
  await page.waitForFunction(()=>!document.body.classList.contains('at-home')&&
   !!document.querySelector('#sectionsRoot > .section-card'),null,{timeout:30000});
  await page.waitForTimeout(130);
  const first=await page.evaluate(geometry);
  assert.equal(first.master,'168','PPM master identity count unchanged at '+width);
  assert.equal(first.total,168,'All master checkpoint elements remain mounted at '+width);
  assert.equal(first.sections,11,'Original eleven checkpoint sections retained at '+width);
  assert.ok(first.docWidth<=width+1,width+' no page overflow '+first.docWidth);
  if(width<=767){
   assert.equal(first.bodyClass,true,width+' focused section display enabled');
   assert.equal(first.visibleSections.length,1,width+' one section visible on entry');
   assert.equal(first.buttonHidden,false,width+' All sections action discoverable');
   assert.ok(first.minButtonHeight>=44,width+' nav/status touch targets '+first.minButtonHeight);
   assert.equal(first.selectedNav.length,1,width+' one selected section chip');
   assert.ok(first.docHeight<22000,width+' shorten previously 26k+ mobile editor: '+first.docHeight);
   const before=await page.evaluate(()=>JSON.stringify(app.record));
   const nextId=await page.locator('#sectionNav [data-target]').nth(1).getAttribute('data-target');
   await page.locator('#sectionNav [data-target]').nth(1).click();
   await page.waitForFunction(id=>document.querySelector('#sectionsRoot>.ppm-section-selected')?.id===id,nextId);
   const changed=await page.evaluate(geometry);
   assert.deepEqual(changed.visibleSections,[nextId],width+' selects requested section only');
   assert.equal(await page.evaluate(()=>JSON.stringify(app.record)),before,
    width+' selecting sections does not change record');
   await page.locator('#ppmSectionExpand').click();
   const all=await page.evaluate(geometry);
   assert.equal(all.visibleSections.length,11,width+' explicit All sections restores all 168');
   assert.equal(all.bodyClass,false,width+' no hidden sections in Show all');
   await page.locator('#ppmSectionExpand').click();
   const focused=await page.evaluate(geometry);
   assert.equal(focused.visibleSections.length,1,width+' return to section focus');
   await page.locator('[data-filter=critical]').click();
   assert.equal((await page.evaluate(geometry)).bodyClass,false,
    width+' filters restore full sections so matches are not hidden');
   assert.equal(await page.locator('.checkpoint').count(),168,'filters preserve checklist DOM');
   await page.evaluate(()=>app.changeLanguage('ta'));
   assert.equal(await page.locator('#ppmSectionExpand').textContent(),'ஒரு பகுதி',
    'Tamil section control follows current language');
   await page.screenshot({path:path.join(out,'ppm-g3-mobile-'+width+'.png'),
    fullPage:false,animations:'disabled'});
   await page.emulateMedia({media:'print'});
   const printed=await page.evaluate(()=>[...document.querySelectorAll('#sectionsRoot > .section-card')]
    .every(el=>getComputedStyle(el).display!=='none'));
   assert.equal(printed,true,'screen focus never hides print sections');
  }else{
   assert.equal(first.bodyClass,false,width+' desktop never hides sections');
   assert.equal(first.visibleSections.length,11,width+' desktop keeps all sections visible');
   assert.equal(first.buttonHidden,true,width+' mobile task focus control not shown on desktop');
   await page.screenshot({path:path.join(out,'ppm-g3-desktop-'+width+'.png'),
    fullPage:false,animations:'disabled'});
  }
  assert.deepEqual(errors,[],width+' no JavaScript errors');
  assert.deepEqual(requests,[],width+' no failed requests');
  console.log('PPM_G3_FOCUS '+JSON.stringify({width,firstHeight:first.docHeight,
   all168:first.total,initialSections:first.visibleSections.length,
   visibleControlsMin:first.minButtonHeight,errors:errors.length}));
 }finally{await context.close();}
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const web=serve();await new Promise(resolve=>web.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+web.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,
 args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  for(const width of widths)await runCase(browser,base,width);
  console.log('PPM G3 PASS mobile section navigation, 168 untouched, 4 viewports, locale, print and no overflow');
 }finally{await browser.close();await new Promise(resolve=>web.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
