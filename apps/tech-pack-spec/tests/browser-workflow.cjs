/** APP-03 Chromium: synthetic POM + grade + revision + local copy + report. */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
class TechPackBrowserProof {
 async run(){
  const server=http.createServer((req,res)=>{
   const request=decodeURIComponent(new URL(req.url,'http://test.local').pathname);
   let file=path.resolve(root,'.'+request);
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':({'.js':'application/javascript','.css':'text/css','.html':'text/html',
     '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'})[path.extname(file)]||
     'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
   headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
    email:'techqa@vesaent.com',name:'Synthetic Tech QA',role:'admin',userKey:'techqa-vesaent-com',
    loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),jsErrors=[],outside=[];
  page.on('pageerror',error=>jsErrors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(host))outside.push(request.url());});
  const click=async action=>page.locator('[data-action="'+action+'"]').first().click();
  const enter=async values=>{for(const [key,value] of Object.entries(values)){
    const field=page.locator('#specDialog [name="'+key+'"]');
    if(await field.evaluate(element=>element.tagName==='SELECT'))await field.selectOption(String(value));
    else await field.fill(String(value));
  }};
  const submit=async()=>{
   await page.locator('#specDialog button[type="submit"]').click();
   await page.locator('#specDialog[open]').waitFor({state:'hidden',timeout:8000});
  };
  const saved=async()=>page.evaluate(()=>{
    const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.tech-pack-spec.records.v1.'));
    return JSON.parse(localStorage.getItem(key)).records[0];
  });
  try{
   await page.goto(host+'/apps/',{waitUntil:'domcontentloaded'});
   const link=page.locator('a[href="/apps/tech-pack-spec/"]');
   assert.equal(await link.count(),1,'New tech pack route must be listed once in VESA App Centre.');
   await link.click();
   await page.locator('[data-action=new]').waitFor();
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   await click('new');
   await enter({style:'SYN-T001',fabric:'SYNTHETIC JERSEY',category:'Men T-shirt',
    gender:'Men',season:'SYN-2026',source:'SYNTHETIC TECH PACK',
    sizes:'S,M,L,XL,XXL',baseSize:'M',precision:'2',rounding:'half-up',
    photoRef:'NO PRIVATE ART'});
   await submit();
   await click('add-pom');
   await enter({code:'CHEST',name:'Chest at 1 inch below armhole',location:'1 inch below underarm',
    geometry:'girth',basis:'flat',unit:'cm',baseValue:'50.0000',
    baseSource:'SYNTHETIC SOURCE POM 01',reviewedBy:'Synthetic Reviewer',
    reviewDate:'2026-10-17',toleranceMinus:'1.0',tolerancePlus:'1.5',
    toleranceSource:'SYNTHETIC APPROVED TOL',toleranceReviewedBy:'Synthetic Reviewer'});
   await page.locator('#specDialog [name=reviewed]').check();
   await page.locator('#specDialog [name=toleranceReviewed]').check();await submit();
   await click('grades');
   for(const [from,to] of [['S','M'],['M','L'],['L','XL'],['XL','XXL']]){
    await click('add-grade');
    await enter({fromSize:from,toSize:to,delta:'2.0000',
      gradeSource:'SYNTHETIC GRADE SHEET',reviewedBy:'Synthetic Reviewer',reviewDate:'2026-10-17'});
    await page.locator('#specDialog [name=reviewed]').check();await submit();
   }
   await click('poms');
   const text=await page.locator('.sp-card').last().innerText();
   for(const n of ['48.00','50.00','52.00','54.00','56.00','47.00','49.50'])
    assert(text.includes(n),'Size measurement missing '+n);
   await click('bom');await click('add-bom');
   await enter({kind:'construction',description:'SYNTHETIC SEAM INSTRUCTION',
    source:'SYNTHETIC CONSTRUCTION SHEET',photoRef:'PHOTO REFERENCE ONLY',note:'Practice text'});
   await submit();
   await click('approve');
   await enter({approver:'SYNTHETIC APPROVER',evidence:'SYNTHETIC BUYER SIGNATURE DOC',
    effective:'2026-10-17',reason:'Synthetic first signed technical revision'});
   await page.locator('#specDialog [name=reviewed]').check();await submit();
   await click('save');
   let record=await saved();assert.equal(record.poms.length,1);
   assert.equal(record.grades.length,4);assert.equal(record.revisions.length,1);
   const snapshot=JSON.stringify(record.revisions[0]);
   await click('bom');await click('edit-bom');
   await enter({description:'SYNTHETIC NEW SEAM NOTE'});await submit();
   record=await saved();assert.equal(JSON.stringify(record.revisions[0]),snapshot);
   await click('revisions');assert.match(await page.locator('.sp-card').last().innerText(),/Changed since recorded revision/);
   await page.reload({waitUntil:'domcontentloaded'});await click('continue');
   assert.equal((await saved()).bom[0].description,'SYNTHETIC NEW SEAM NOTE');
   await click('reports');
   fs.mkdirSync(output,{recursive:true});
   const excelEvent=page.waitForEvent('download');await click('excel');
   const excel=await excelEvent,excelPath=path.join(output,'techspec-app03-synthetic.xlsx');
   await excel.saveAs(excelPath);const workbook=XLSX.read(fs.readFileSync(excelPath),{type:'buffer'});
   assert(workbook.SheetNames.includes('Measurement Specification'));
   assert(workbook.SheetNames.includes('Revision Comparison'));
   assert.equal(workbook.Sheets['Measurement Specification'].E2.t,'n');
   assert.equal(workbook.Sheets['Measurement Specification'].E2.v,48);
   const pdfPath=path.join(output,'techspec-app03-synthetic.pdf');
   await page.pdf({path:pdfPath,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdfPath).size>3500);
   const copyEvent=page.waitForEvent('download');await click('download');
   const portable=path.join(output,'techspec-app03-synthetic.vesaspec');
   await (await copyEvent).saveAs(portable);
   const before=await saved();
   await click('home');await click('upload');
   await page.locator('#specFile').setInputFiles(portable);
   await page.locator('#specDialog[open]').waitFor();await page.locator('#specClose').click();
   const sizes=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.tech-pack-spec.records.v1.'));
    return JSON.parse(localStorage.getItem(key)).records.map(r=>r.id);});
   assert.equal(sizes.length,2);
   assert(sizes.includes(before.id));
   const corrupt=path.join(output,'techspec-app03-bad.vesaspec');
   fs.writeFileSync(corrupt,fs.readFileSync(portable,'utf8').replace('"50.0000"','"40.0000"'));
   const backup=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.tech-pack-spec.records.v1.'));return localStorage.getItem(key);});
   await page.locator('#specFile').setInputFiles(corrupt);
   await page.locator('#specDialog[open]').waitFor();
   assert.match(await page.locator('#specDialogBody').innerText(),/altered or unsupported/);
   await page.locator('#specClose').click();
   const afterBad=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.tech-pack-spec.records.v1.'));return localStorage.getItem(key);});
   assert.equal(afterBad,backup);
   for(const size of [320,390,768,1280]){
    await page.setViewportSize({width:size,height:850});
    assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=size+1,size+'px body overflow');
   }
   await page.setViewportSize({width:390,height:850});
   await page.screenshot({path:path.join(output,'techspec-app03-mobile.png')});
   await page.setViewportSize({width:1280,height:900});
   for(const [lang,label] of [['en','Measurement Points'],['bn','মাপের পয়েন্ট'],
     ['hi','माप बिंदु'],['ta','POM அளவுகள்']]){
    const beforeLanguage=JSON.stringify(await saved());
    await page.locator('[data-vesa-user]').click();
    const prefs=page.locator('[data-vesa-settings]');
    await prefs.locator('[data-pref-language]').selectOption(lang);
    await page.waitForFunction(x=>document.documentElement.lang===x,lang);
    await page.keyboard.press('Escape');await prefs.waitFor({state:'hidden'});
    assert.match(await page.locator('.sp-tabs').innerText(),new RegExp(label));
    assert.equal(JSON.stringify(await saved()),beforeLanguage);
   }
   await page.reload({waitUntil:'domcontentloaded'});await click('continue');
   assert.equal((await saved()).revisions.length,1);
   assert.deepEqual(jsErrors,[]);
   assert.deepEqual(outside,[]);
   console.log('APP-03 CHROMIUM PASS: sourced POM and S-XXL grades/tolerances, immutable revisions, BOM, XLSX/PDF, safe saved-copy restore, 320/390/768/1280, four languages and no remote requests.');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
 }
}
new TechPackBrowserProof().run().catch(error=>{console.error(error);process.exitCode=1;});
