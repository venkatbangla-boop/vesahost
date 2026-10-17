/** APP-02 G4: exercise 10 real commission sections as fictional workbench.
 * No actual order, buyer or financial data; existing ledger tests run separately.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const out=path.join(root,'output','playwright','commission-g4-workbench');
const stages=['summary','agreement','lines','exclusions','earnings','invoices','receipts','adjustments','history','reports'];
const widths=[320,390,1440];
const synthetic={email:'commission-qa@vesa.invalid',name:'Synthetic Review',role:'admin',
 userKey:'commission-qa',loginAt:'2026-10-18T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css',
 '.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.jpg':'image/jpeg'};
function server(){
 return http.createServer((req,res)=>{
  const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   const file=fs.statSync(f).isDirectory()?path.join(f,'index.html'):f;
   const stat=fs.statSync(file);res.writeHead(200,{
    'Content-Type':types[path.extname(file)]||'application/octet-stream',
    'Cache-Control':'no-store','Content-Length':stat.size});
   fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(404).end();}
 });
}
async function runOne(browser,base,width){
 const context=await browser.newContext({viewport:{width,height:width<=390?844:900},
  deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(data=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(data)),synthetic);
 const page=await context.newPage(),errors=[],requestFailed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',req=>requestFailed.push(req.url()));
 const stored=()=>page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage)
    .filter(([k])=>k.startsWith('vesa.order-commission.records.v1.')))));
 try{
  await page.goto(base+'/apps/order-commission/',{waitUntil:'domcontentloaded'});
  await page.locator('#commissionWorkTitle').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'single VESA global shell');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'six menus');
  const desk=page.locator('.com-desk'),steps=desk.locator('.com-desk-step');
  assert.equal(await steps.count(),10,'ten real commissioned work stages visible');
  assert.equal(await desk.locator('.com-desk-lane').count(),3,'three finance stages');
  const all=await steps.evaluateAll(ns=>ns.map(x=>Math.round(x.getBoundingClientRect().height)));
  assert.ok(all.every(x=>x>=44),width+' work steps >=44px: '+all);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth))<=width+1,
   width+' home no horizontal overflow');
  const help=page.locator('.com-local-info');
  assert.equal(await help.count(),1,'local data info accessible');
  assert.equal(await page.locator('.com-local-info .com-warning').count(),0,
   'local notes use accessible disclosure, not repeated giant alert');
  await help.locator('summary').click();
  assert.match(await help.innerText(),/Synthetic records only/);
  await help.locator('summary').click();
  const original=await stored();
  await page.screenshot({path:path.join(out,'commission-desk-'+width+'.png'),
   animations:'disabled',fullPage:false});
  for(const tab of stages){
   await page.locator('[data-action=preview-'+tab+']').click();
   const active=page.locator('.com-tabs [data-action="'+tab+'"][aria-current=true]');
   await active.waitFor({state:'visible'});
   const v=await page.evaluate(()=>({
    section:document.querySelector('.com-tabs [aria-current=true]')?.dataset.action,
    count:document.querySelectorAll('.com-tabs [data-action]').length,
    disabled:document.querySelector('#commissionMain [data-action=save]')?.disabled,
    practice:document.querySelector('#commissionMain')?.textContent?.includes('Synthetic practice')
   }));
   assert.equal(v.section,tab,width+' '+tab+' deep links into the existing real panel');
   assert.equal(v.count,10,width+'/'+tab+' all sections still available');
   assert.equal(v.disabled,true,width+'/'+tab+' financial save blocked for fictional practice');
   assert.equal(v.practice,true,width+'/'+tab+' clearly labelled synthetic practice');
   assert.equal(await stored(),original,'preview never writes financial records');
   if(width===390&&tab==='receipts'){
    await page.screenshot({path:path.join(out,'commission-receipts-390.png'),
     animations:'disabled',fullPage:false});
   }
   await page.locator('[data-action=home]').first().click();
   await steps.first().waitFor({state:'visible'});
  }
  if(width===390){
   for(const [lang,text] of [['bn','কমিশনের কাজের ধাপ দেখুন'],
                             ['hi','कमीशन के चरण देखें'],
                             ['ta','கமிஷன் வேலைப் படிகள்'],
                             ['en','Follow the commission cycle']]){
    const setting=page.locator('[data-vesa-user]');
    if(!(await setting.isVisible())){
      await page.locator('[data-vesa-mobile-menu]').click();
    }
    await setting.click();
    const dialog=page.locator('[data-vesa-settings]');
    await dialog.waitFor({state:'visible'});
    await dialog.locator('[data-pref-language]').selectOption(lang);
    await dialog.locator('footer button').click();
    assert.equal(await page.locator('#commissionWorkTitle').textContent(),text,
      'Expected '+lang+' finance workflow translation');
    assert.equal(await page.locator('.com-desk-step').count(),10,
      'Keep ten steps in language '+lang);
    assert.equal(await stored(),original,'Settings cannot mutate financial records');
   }
   await page.screenshot({path:path.join(out,'commission-language-390.png'),
    animations:'disabled',fullPage:false});
  }
  await page.emulateMedia({media:'print'});
  assert.equal(await desk.evaluate(x=>getComputedStyle(x).display),'none',
   'Home guide never appears in commission printable ledger');
  assert.deepEqual(errors,[],width+' browser script errors');
  assert.deepEqual(requestFailed,[],width+' failed same-origin fetch');
  console.log('COMMISSION_G4_VIEW '+JSON.stringify({width,steps:10,lanes:3,
    actionsOpened:10,minTouch:Math.min(...all),storageSafe:true,errors:errors.length}));
 }finally{await context.close();}
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const httpServer=server();await new Promise(resolve=>httpServer.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+httpServer.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  for(const width of widths)await runOne(browser,base,width);
  console.log('COMMISSION G4 PASS 3 sizes, 30 task links, 4 languages, immutability and print');
 }finally{
  await browser.close();await new Promise(resolve=>httpServer.close(resolve));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
