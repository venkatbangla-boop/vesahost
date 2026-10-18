/** APP-01 real Chromium end-to-end; all fixture values are synthetic. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
class PackingBrowserProof{
 async run(){
  const server=http.createServer((req,res)=>{
   let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const ctx=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await ctx.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
    email:'qa@vesaent.com',name:'Synthetic QA',role:'admin',userKey:'qa-vesaent-com',
    loginAt:'2026-10-16T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'})));
  const page=await ctx.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith(host))external.push(req.url());});
  const f=async values=>{for(const [k,v] of Object.entries(values)){const el=page.locator('#packDialog [name="'+k+'"]');
    if(await el.evaluate(e=>e.tagName==='SELECT'))await el.selectOption(String(v));else await el.fill(String(v));}};
  const submit=async()=>{await page.locator('#packDialog form button[type=submit]').click();await page.locator('#packDialog[open]').waitFor({state:'hidden'});};
  const act=async k=>{await page.locator('[data-action="'+k+'"]').first().click();};
  const stored=async()=>page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.packing-container.records.v1.'));return JSON.parse(localStorage.getItem(key)).records[0];});
  try{
   await page.goto(host+'/apps/',{waitUntil:'domcontentloaded'});
   const route=page.locator('a[href="/apps/packing-container/"]');
   assert.equal(await route.count(),1,'Packing app must appear once in VESA App Centre.');
   await route.click();
   await page.locator('[data-action=new]').waitFor();
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('.vesa-workspace__brand img').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   // G5: Form opens on the first editable field, not the dialog Close button.
   await act('new');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'buyer','New plan focuses Buyer field');
   await page.keyboard.press('Escape');
   await page.locator('#packDialog[open]').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.activeElement?.dataset?.action==='new');
   await act('new');await f({buyer:'SYNTHETIC BUYER',factory:'SYNTHETIC FACTORY',po:'0000-PO',style:'MOCK-TEE',source:'SYNTHETIC PO SOURCE'});await submit();
   await act('add-line');await f({style:'MOCK-TEE',color:'Navy',size:'M',qty:40,source:'TEST-LINE-1'});await submit();
   await act('add-line');await f({style:'MOCK-TEE',color:'Navy',size:'L',qty:20,source:'TEST-LINE-2'});await submit();
   await act('cartons');await act('add-carton');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'code','Carton dialog focuses first Code field');
   await f({code:'TEST-BOX',length:60,width:40,height:30,unit:'cm',gross:10,net:9,weightUnit:'kg',source:'TEST-BOX SOURCE'});await submit();
   await act('packs');await act('add-pack');
   await f({full:2,start:'0001',end:'0002',packSource:'TEST PACK SOURCE'});
   const qty=page.locator('#packDialog input[name^="q_"]');assert.equal(await qty.count(),2);
   await qty.nth(0).fill('20');await qty.nth(1).fill('10');await submit();
   await act('summary');assert.match(await page.locator('.pack-grid').innerText(),/0\.144/);
   await act('save');let p=await stored();
   assert.equal(p.meta.po,'0000-PO');assert.equal(p.packConfigs[0].cartonStart,'0001');
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   await act('containers');await act('add-scene');
   await f({name:'SYNTHETIC CONTAINER',type:'20ft SYNTHETIC',length:600,width:235,height:235,
     doorWidth:225,doorHeight:225,unit:'cm',payload:20000,weightUnit:'kg',headroom:10,
     source:'TEST CONTAINER SOURCE - NOT ACTUAL',verifiedBy:'Synthetic reviewer'});
   await page.locator('#packDialog [name=sourceConfirmed]').check();await submit();
   assert.match(await page.locator('.pack-table').innerText(),/physical fit not verified/i);
   await act('loads');await act('add-load');await f({loaded:1,date:'2026-10-16',evidence:'TEST LOADING INPUT'});await submit();
   p=await stored();assert.equal(p.loadEntries.length,1);
   // A local revision freeze must survive Save and reload without suggesting
   // buyer acceptance. Editing afterward creates a draft without losing history.
   await act('freeze');
   await f({reason:'SYNTHETIC frozen packing review'});
   await submit();
   p=await stored();assert.equal(p.status,'frozen-local');
   assert.equal(p.frozenSnapshots.length,1);
   const immutable=JSON.stringify(p.frozenSnapshots[0]);
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   p=await stored();assert.equal(p.status,'frozen-local');
   await act('meta');await f({buyer:'SYNTHETIC BUYER MODIFIED'});await submit();
   p=await stored();assert.equal(p.status,'draft');
   assert.equal(JSON.stringify(p.frozenSnapshots[0]),immutable);
   await act('reports');assert.match(await page.locator('.pack-report').innerText(),/NOT a physical loadability/i);
   const dlEvent=page.waitForEvent('download');await act('excel');
   fs.mkdirSync(output,{recursive:true});const dl=await dlEvent,local=path.join(output,'packing-app01-test.xlsx');await dl.saveAs(local);
   const book=XLSX.read(fs.readFileSync(local),{type:'buffer'});
   assert.deepEqual(book.SheetNames,['Packing Config','Carton List','CBM & Weight','Container Comparison','Packing Balance','Draft Load Plan']);
   assert.equal(book.Sheets['Carton List'].A2.t,'s');assert.equal(book.Sheets['Carton List'].A2.v,'0001');
   assert.equal(book.Sheets['CBM & Weight'].B4.t,'n');
   // Real printable artifact (the shared app header is intentionally absent
   // from print). This verifies browser print CSS rather than a static mock.
   const pdfPath=path.join(output,'packing-app01-print.pdf');
   await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdfPath).size>3500,'Draft report PDF was not generated.');
   const copyEvent=page.waitForEvent('download');await act('download');
   const copy=await copyEvent,copyPath=path.join(output,'packing-app01-test.vesapack');
   await copy.saveAs(copyPath);
   const beforeCopy=await page.evaluate(()=>{
     const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.packing-container.records.v1.'));
     return JSON.parse(localStorage.getItem(key)).records.map(p=>p.id);
   });
   assert.equal(beforeCopy.length,1);
   await act('home');
   await act('upload');
   await page.locator('#packFile').setInputFiles(copyPath);
   await page.locator('.pack-tabs').waitFor();
   const afterCopy=await page.evaluate(()=>{
     const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.packing-container.records.v1.'));
     return JSON.parse(localStorage.getItem(key)).records.map(p=>p.id);
   });
   assert.equal(afterCopy.length,2,'Opening an existing saved copy must create a separate, auditable local record.');
   assert(afterCopy.includes(beforeCopy[0]),'Opening a copy may not replace the original plan.');
   const corruptedPath=path.join(output,'packing-app01-corrupt.vesapack');
   fs.writeFileSync(corruptedPath,fs.readFileSync(copyPath,'utf8').replace('"0001"','"9999"'));
   const savedBeforeReject=await page.evaluate(()=>{
     const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.packing-container.records.v1.'));
     return localStorage.getItem(key);
   });
   await page.locator('#packFile').setInputFiles(corruptedPath);
   await page.locator('#packDialog[open]').waitFor();
   assert.match(await page.locator('#packDialogBody').innerText(),/altered|not supported/i);
   const savedAfterReject=await page.evaluate(()=>{
     const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.packing-container.records.v1.'));
     return localStorage.getItem(key);
   });
   assert.equal(savedAfterReject,savedBeforeReject,'Corrupted copy must not modify either saved record.');
   await page.locator('#packClose').click();
   await page.setViewportSize({width:390,height:844});
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=391);
   await page.screenshot({path:path.join(output,'packing-app01-mobile.png')});
   await page.setViewportSize({width:320,height:720});
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=321);
   await act('summary');await act('meta');
   assert.equal(await page.evaluate(()=>document.activeElement?.name),'buyer','320px Edit Plan opens on Buyer');
   assert((await page.locator('#packDialog').evaluate(el=>el.getBoundingClientRect().width))<=320,
    '320px edit dialog fits viewport');
   await page.keyboard.press('Escape');
   await page.locator('#packDialog[open]').waitFor({state:'hidden'});
   await page.setViewportSize({width:768,height:1024});
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=769);
   await page.setViewportSize({width:1280,height:900});
   for(const [lang,label] of [['en','Packing Configurations'],['bn','প্যাকিং কনফিগারেশন'],['hi','पैकिंग कॉन्फ़िगरेशन'],['ta','Packing வகைகள்']]){
    const snap=JSON.stringify(await stored());
    await page.locator('[data-vesa-user]').click();
    const setting=page.locator('[data-vesa-settings]');await setting.locator('[data-pref-language]').selectOption(lang);
    await page.waitForFunction(l=>document.documentElement.lang===l,lang);
    await page.keyboard.press('Escape');await setting.waitFor({state:'hidden'});
    await act('packs');assert.match(await page.locator('.pack-tabs').innerText(),new RegExp(label));
    assert.equal(JSON.stringify(await stored()),snap,'Language cannot change data.');
   }
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');p=await stored();
   assert.equal(p.packConfigs[0].cartonStart,'0001');assert.equal(p.loadEntries[0].cartonCount,1);
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   console.log('APP-01 CHROMIUM PASS: shared shell, PO, mixed cartons, immutable freeze, real PDF, reload, source scenarios, manual loading, typed XLSX, portable restore, corrupt-copy rejection, 320/390/768 and four languages, no network.');
  }finally{await ctx.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
 }
}
new PackingBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});
