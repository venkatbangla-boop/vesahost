/**
 * F19 real Chromium path: one VESA shell, original/alternate calendar editors,
 * source-backed option, saved R12 typed XLSX/PDF, local revision and reopen.
 * Synthetic test accounts and orders only, no provider or external network.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('playwright'),XLSX=require('../vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
async function tools(page){const menu=page.locator('[data-vesa-menu="Tools"]');if(!await menu.isVisible())await page.locator('[data-vesa-mobile-menu]').click();await menu.click();}
async function edit(page,values,week){
  for(const [name,value] of Object.entries(values))await page.locator('#tnaCalendarForm [name="'+name+'"]').fill(value);
  for(const day of week)await page.locator('#tnaCalendarForm input[name="workingWeek"][value="'+day+'"]').check();
  await page.locator('#tnaCalendarForm input[name="confirmed"]').check();
  await page.locator('#tnaCalendarForm button[type="submit"]').click();
  await page.locator('#tnaCalendarForm').waitFor({state:'detached'});
}
async function run(){
  const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const ctx=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await ctx.addInitScript(s=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(s)),session);
  const page=await ctx.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    for(const [name,value] of Object.entries({buyerName:'Synthetic Calendar Buyer',factoryName:'Synthetic Calendar Factory',styleNo:'STYLE-F19',poNumber:'PO-F19',totalQty:'1000',orderConfirmedOn:'2026-10-12',buyerRequiredExFactory:'2027-02-16'}))await page.locator('#tnaWizard [name="'+name+'"]').fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.locator('[data-edit-calendar]').click();
    await edit(page,{name:'Synthetic base M-F',timezone:'Asia/Dhaka',sourceReference:'SYN-BASE-2026',reason:'Factory weekly review for synthetic case',holidays:'2026-10-20'},[1,2,3,4,5]);
    await page.locator('[data-add-alt-calendar]').click();
    assert.equal(await page.locator('#tnaCalendarForm input[name="workingWeek"]:checked').count(),0,'Alternative must start with no assumed working week.');
    await edit(page,{name:'Synthetic alt Sun-Fri',timezone:'Asia/Dhaka',sourceReference:'SYN-ALT-2026',reason:'Separate calendar evidence fixture'},[0,1,2,3,4,5]);
    const source=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(source.calendars.length,2);
    assert.equal(source.calendars[0].name,'Synthetic base M-F');
    assert.equal(source.calendars[1].name,'Synthetic alt Sun-Fri');
    assert(source.tasks.every(task=>task.calendarId==='default'));
    assert.equal(source.approvals.length,0);
    const baseline=JSON.stringify(source.baselineSnapshots);
    const altId=source.calendars[1].calendarId;
    await page.locator('#tnaAlternativeScenarioForm [name="confirmedAlternativeCalendarId"]').selectOption(altId);
    await page.locator('#tnaAlternativeScenarioForm [name="name"]').fill('F19 Calendar option');
    await page.locator('#tnaAlternativeScenarioForm button[type="submit"]').click();
    await page.locator('.tna-scenario-result').waitFor();
    const result=await page.locator('.tna-scenario-result').innerText();
    assert.match(result,/Civil days earlier|Calendar days earlier/i);
    assert.match(result,/working-day gain is not comparable/i);
    await page.locator('[data-save-scenario]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(saved.scenarioBranches.length,1);
    assert.equal(saved.scenarioBranches[0].status,'preview');
    assert.equal(JSON.stringify(saved.baselineSnapshots),baseline);
    assert(saved.tasks.every(task=>task.calendarId==='default'));
    await tools(page);await page.locator('[data-menu-action="Prepare Report"]').click();
    await page.locator('#tnaReportType').selectOption('R12');
    await page.locator('.tna-r12-report').waitFor();
    assert.equal(await page.locator('.tna-r12-comparison tbody tr').count(),18);
    const reportText=await page.locator('.tna-r12-report').innerText();
    assert.match(reportText,/Civil calendar days gained/i);
    assert.match(reportText,/Different factory working weeks/i);
    const event=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const dl=await event,excelPath=path.join(output,'tna-f19-alternate-calendar.xlsx');
    fs.mkdirSync(output,{recursive:true});await dl.saveAs(excelPath);
    const wb=XLSX.read(fs.readFileSync(excelPath),{type:'buffer'});
    assert.equal(wb.Sheets['Scenario Comparison'].C18.t,'n');
    assert.equal(wb.Sheets['Scenario Comparison'].C9.t,'s');
    await page.setViewportSize({width:390,height:844});
    const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    assert(geometry.doc<=geometry.inner+1&&geometry.body<=geometry.inner+1);
    await page.locator('.tna-r12-report').screenshot({path:path.join(output,'tna-f19-r12-mobile.png')});
    await page.emulateMedia({media:'print'});
    await page.pdf({path:path.join(output,'tna-f19-r12-print.pdf'),printBackground:true,preferCSSPageSize:true,landscape:true});
    assert(fs.statSync(path.join(output,'tna-f19-r12-print.pdf')).size>3000);
    await page.emulateMedia({media:'screen'});
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.setViewportSize({width:1280,height:900});
    const translations=[['en','Alternative Factory Calendar'],['bn','বিকল্প কারখানা ক্যালেন্ডার'],['hi','वैकल्पिक फैक्ट्री कैलेंडर'],['ta','மாற்று Factory Calendar']];
    for(const [lang,label] of translations){
      await page.locator('[data-vesa-user]').click();
      const settings=page.locator('[data-vesa-settings]');
      await settings.locator('[data-pref-language]').selectOption(lang);
      await page.waitForFunction(language=>document.documentElement.lang===language,lang);
      await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
      assert.match(await page.locator('[data-add-alt-calendar]').innerText(),lang==='en'?/Record another factory calendar/:lang==='bn'?/অন্য ফ্যাক্টরি/:lang==='hi'?/अलग फैक्ट्री/:/மாற்று Factory/);
      assert.equal(await page.locator('#tnaAlternativeScenarioForm').count(),1,lang+': alternative choice should remain in planner.');
      await page.locator('[data-add-alt-calendar]').click();
      assert.equal(await page.locator('#tnaDialogTitle').innerText(),label);
      await page.locator('#tnaDialog .tna-dialog-head button').click();
    }
    await page.setViewportSize({width:1280,height:900});
    await page.locator('#tnaAlternativeScenarioForm button[type="submit"]').click();
    await page.locator('[data-apply-scenario]').click();
    await page.locator('#tnaScenarioApply [name="reason"]').fill('Locally reviewed alternative, not buyer approval');
    await page.locator('#tnaScenarioApply [name="confirm"]').check();
    await page.locator('#tnaScenarioApply button[type="submit"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const applied=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert(applied.tasks.every(task=>task.calendarId===altId));
    assert.equal(applied.scenarioBranches.length,1);
    assert.equal(applied.scenarioBranches[0].status,'applied');
    assert.equal(JSON.stringify(applied.baselineSnapshots),baseline);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const reopened=await page.evaluate(()=>VesaTnaStorage.loadPlan(JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].recordId,'qa-vesaent-com'));
    assert(reopened.tasks.every(task=>task.calendarId===altId));
    assert.equal(reopened.scenarioBranches[0].status,'applied');
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log('TNA F19 BROWSER PASS: default/alternate source entry, local R12 A/B, typed Excel, 390px PDF, EN/BN/HI/TA, save/apply/reopen and no external calls.');
  }finally{await ctx.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
