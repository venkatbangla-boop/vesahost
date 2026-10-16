/**
 * F25 real Chromium proof for source-confirmed date scale, baseline snapshot,
 * actual/target/forecast differentiation, nonworking days and mobile access.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-11T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript',
  '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream';
async function run(){
  const server=http.createServer((req,res)=>{
    const url=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);
    let file=path.resolve(root,'.'+url);
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});
      res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
    headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(s=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(s)),session);
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    for(const [name,value] of Object.entries({buyerName:'F25 Synthetic Buyer',
      factoryName:'F25 Synthetic Factory',styleNo:'F25-STYLE',
      poNumber:'F25-PO',totalQty:'100',
      orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2027-02-18'}))
      await page.locator('#tnaWizard [name="'+name+'"]').fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    assert.equal(await page.locator('.tna-date-scale-segment[data-kind="forecast"]').count(),0,
      'No unconfirmed factory working calendar may produce visible forecast.');
    await page.evaluate(()=>{
      const source=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;
      source.tasks[0].dates.baselineStart='2026-10-12';
      source.tasks[0].dates.baselineFinish='2026-10-13';
      source.tasks[1].dates.baselineStart='2026-10-14';
      source.tasks[1].dates.baselineFinish='2026-10-21';
      const cal=VesaTnaDomain.updateFactoryCalendar(source,{
        name:'F25 Synthetic M-F',timezone:'Asia/Dhaka',workingWeek:[1,2,3,4,5],
        holidays:['2026-10-15'],shutdowns:[],
        sourceReference:'F25 SYNTHETIC reviewed weekday source',confirmed:true,
        reason:'Synthetic calendar for timeline test'},{actorId:'qa-vesaent-com'});
      if(!cal.ok)throw Error(cal.error);
      const frozen=VesaTnaDomain.freezeBaseline(cal.plan,{
        actorId:'qa-vesaent-com',reason:'Synthetic original planning baseline'});
      if(!frozen.ok)throw Error(frozen.errors.join(', '));
      const p=frozen.plan;
      p.tasks[0].dates.currentTargetFinish='2026-10-16';
      p.tasks[1].dates.currentTargetFinish='2026-10-22';
      p.tasks[0].dates.actualFinish='2026-10-14';
      VesaTnaStorage.savePlan(p,'qa-vesaent-com');
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    assert(await page.locator('.tna-date-scale').isVisible());
    const view=page.locator('.tna-date-scale');
    for(const kind of ['baseline','target','forecast','actual'])
      assert(await view.locator('[data-kind="'+kind+'"]').count()>0,kind+' requires an actual source.');
    assert(await view.locator('.tna-date-offday').count()>0,
      'Only confirmed working calendars may shade actual nonworking dates.');
    const baselines=await view.locator('[data-kind="baseline"]').evaluateAll(nodes=>
      nodes.slice(0,2).map(node=>parseFloat(node.style.left)));
    assert(baselines.length>=2&&baselines[1]>baselines[0],
      'Later baseline must appear to the right on genuine civil date scale.');
    const printLabels=await view.locator('.tna-date-scale-legend').innerText();
    assert.match(printLabels,/Original confirmed baseline/);
    assert.match(await view.innerText(),/After/);
    assert(await page.locator('[aria-label="Accessible TNA timeline table filtered view"]').count()>0);
    await page.setViewportSize({width:390,height:844});
    assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=391);
    fs.mkdirSync(out,{recursive:true});
    await view.screenshot({path:path.join(out,'tna-f25-date-scaled-timeline-mobile.png')});
    await page.setViewportSize({width:1280,height:900});
    const before=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
    await page.locator('[data-vesa-user]').click();
    await page.locator('[data-vesa-settings] [data-pref-language]').selectOption('ta');
    await page.waitForFunction(()=>document.documentElement.lang==='ta');
    await page.keyboard.press('Escape');
    assert.match(await page.locator('.tna-date-scale').innerText(),/தேதி அடிப்படையிலான/);
    assert.equal(await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com')),before,
      'Language change must not edit signed dates.');
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log('TNA F25 Chromium PASS: real UTC civil dates, baseline/target/forecast/actual, confirmed holiday shading, 390px scroll, Tamil and immutable saved order.');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
