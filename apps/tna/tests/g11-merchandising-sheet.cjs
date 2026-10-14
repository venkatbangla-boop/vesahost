/**
 * TNA GMR-01 real checkout browser acceptance: garment master sheet before
 * navigation cards, complete knit/woven rows, edit path, locale, recovery,
 * four responsive widths and shared VESA shell. Synthetic records only.
 * Run with NODE_PATH/CHROMIUM_PATH and Playwright on a checkout.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-15T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.html':'text/html','.js':'application/javascript','.css':'text/css',
  '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg',
  '.json':'application/json'})[path.extname(file)]||'application/octet-stream';

async function run(){
  const web=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep))return response.writeHead(403).end();
    try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});
      response.end(fs.readFileSync(file));
    }catch{response.writeHead(404).end();}
  });
  await new Promise(resolve=>web.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+web.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:880}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.vesa-workspace').count(),1,'one platform shell');
    assert.equal(await page.locator('#tnaMerchSheet').count(),0,'no phantom business sheet before opening a draft');

    await page.locator('[data-action="practice"]').click();
    const training=page.locator('#tnaMerchSheet');
    await training.waitFor({state:'visible'});
    assert.match(await training.innerText(),/DENIM-PRACTICE/);
    assert.ok((await training.locator('tbody tr').count())>30,'training shows all denim activities');
    assert.ok((await page.locator('#tnaMain').evaluate(node=>node.innerHTML.indexOf('tnaMerchSheet')<node.innerHTML.indexOf('TNA home actions'))),'active garment sheet precedes home cards');
    assert.match(await training.innerText(),/Needs Information/,'unverified data is not guessed');
    assert.equal(await page.locator('.vesa-workspace').count(),1,'training does not duplicate page header');

    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    const values={buyerName:'KNIT TEST BUYER',factoryName:'KNIT TEST FACTORY',
      styleNo:'KNIT-TEST-SHEET',poNumber:'KNIT-PO-10',totalQty:'1000',
      buyerRequiredExFactory:'2026-12-20',orderConfirmedOn:'2026-10-12',
      fabricSpec:'100% cotton single jersey',sizeRange:'S-XXL',
      colorSizeBreakdown:'Navy | M | 500\nWhite | L | 500'};
    await page.locator('[name="templateId"]').selectOption('knit');
    for(const [key,value] of Object.entries(values))await page.locator('[name="'+key+'"]').fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    const sheet=page.locator('#tnaMerchSheet');
    await sheet.waitFor({state:'visible'});
    assert.match(await sheet.innerText(),/KNIT TEST BUYER/);
    assert.match(await sheet.innerText(),/KNIT-PO-10/);
    assert.match(await sheet.innerText(),/100% cotton single jersey/);
    const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')).plan);
    assert.equal(await sheet.locator('tbody tr').count(),before.tasks.length,'no sliced rows');
    assert.ok(await sheet.locator('[data-tna-ref="FP02"]').count()===1,'fabric booking activity');
    assert.ok(await sheet.locator('[data-tna-ref="D05"]').count()===1,'fit submission activity');

    await sheet.locator('[data-tna-sheet-asof]').fill('2026-10-15');
    await page.locator('[data-tna-sheet-filter]').selectOption('overdue');
    assert.match(await sheet.innerText(),/No activities match this view/,'missing dates do not invent overdue');
    await page.locator('[data-tna-sheet-filter]').selectOption('all');
    const beforeEdit=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')).plan);
    await page.locator('#tnaMerchSheet [data-edit-task]').first().click();
    await page.locator('#tnaTaskEdit [name="nextStatus"]').selectOption('in-progress');
    await page.locator('#tnaTaskEdit button[type=submit]').click();
    const afterEdit=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')).plan);
    assert.equal(afterEdit.tasks[0].status,'in-progress','activity edited through the original domain editor');
    assert.equal(afterEdit.tasks[0].dates.baselineFinish,beforeEdit.tasks[0].dates.baselineFinish,'original baseline unchanged');
    assert.equal(afterEdit.schemaVersion,beforeEdit.schemaVersion,'saved schema unchanged');
    assert.equal(await page.locator('#tnaMerchSheet tbody tr').count(),afterEdit.tasks.length);

    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="open"]').click();
    await page.locator('[data-open-record]').first().click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    assert.match(await page.locator('#tnaMerchSheet').innerText(),/KNIT TEST BUYER/);
    assert.equal(await page.locator('#tnaMerchSheet tbody tr').count(),afterEdit.tasks.length,'stored data still complete');

    const rawBefore=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
    for(const lang of ['bn','hi','ta','en']){
      await page.evaluate(code=>{
        const next=VesaPrefs.write({...VesaPrefs.read(),language:code});
        VesaPrefs.apply(next);
        window.dispatchEvent(new Event('vesa-preferences-change'));
      },lang);
      await page.waitForFunction(code=>document.documentElement.lang===code,lang);
      assert.equal(await page.locator('#tnaMerchSheet [data-tna-sheet-filter]').count(),1,lang+' one sheet filter');
    }
    assert.equal(await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com')),rawBefore,'locale changes leave source data untouched');

    for(const width of [320,390,768,1280]){
      await page.setViewportSize({width,height:860});
      await page.locator('#tnaMerchSheet').waitFor({state:'visible'});
      const overflow=await page.evaluate(()=>({body:document.body.scrollWidth,doc:document.documentElement.scrollWidth,width:innerWidth}));
      assert.ok(overflow.body<=width+2&&overflow.doc<=width+2,'garment sheet no horizontal page overflow at '+width);
      if(width===390)await page.locator('#tnaMerchSheet').screenshot({path:path.join(root,'output','tna-gmr-390.png')}).catch(()=>{});
    }
    assert.deepEqual(errors,[],'no uncaught JavaScript errors');
    assert.deepEqual(external,[],'no runtime external requests');
    console.log('TNA GMR browser PASS: complete master sheet, update via domain, save/reload, locales, mobile, shared shell');
  }finally{
    await context.close();await browser.close();await new Promise(resolve=>web.close(resolve));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
