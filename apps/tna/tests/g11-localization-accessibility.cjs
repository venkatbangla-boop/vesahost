/**
 * G11 four-language, keyboard, responsive/theme and civil-date invariants.
 * Uses only synthetic browser-local data and does not exercise a provider.
 */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
const cases=[
  {language:'en',theme:'clear-blue',width:360,title:'Plan every order without guessing.',heading:'Order context'},
  {language:'bn',theme:'midnight-mono',width:390,title:'অনুমান ছাড়া প্রতিটি order plan করুন.',heading:'অর্ডার প্রসঙ্গ'},
  {language:'hi',theme:'forest-yellow',width:768,title:'हर order को बिना guess किए plan करें.',heading:'ऑर्डर संदर्भ'},
  {language:'ta',theme:'warm-ivory',width:1280,title:'Guess இல்லாமல் ஒவ்வொரு order-ஐயும் plan பண்ணுங்கள்.',heading:'ஆர்டர் விவரம்'}
];

function serve(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server)));
}
async function openShellMenu(page,name){
  const mobile=page.locator('[data-vesa-mobile-menu]');
  const menu=page.locator(`[data-vesa-menu="${name}"]`);
  if(!await menu.isVisible())await mobile.click();
  await menu.waitFor({state:'visible'});
  await menu.click();
}
async function timezoneProbe(browser,base,timezoneId){
  const context=await browser.newContext({timezoneId,viewport:{width:1280,height:800}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage();
  await page.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.VesaTnaScheduling&&globalThis.VesaTnaNotificationRules&&globalThis.VesaTnaReports);
  const result=await page.evaluate(()=>{
    const plan=VesaTnaDomain.createPlan({templateId:'knit',buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',styleNo:'STYLE-G11-I18N',poNumber:'PO-G11-I18N',totalQty:1200,orderConfirmedOn:'2026-10-10',buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'qa-vesaent-com'});
    plan.tasks[0].dates.currentTargetFinish='2026-10-09';
    plan.tasks[1].dates.currentTargetFinish='2026-10-10';
    plan.tasks[2].dates.currentTargetFinish='2026-10-15';
    const schedule=VesaTnaScheduling.schedule(plan.tasks,plan.edges,{calendar:plan.calendars[0],startDate:'2026-10-10',requiredDate:'2026-12-20',asOfDate:'2026-10-10',nearCriticalDays:3});
    const alerts=VesaTnaNotificationRules.buildInAppAlerts(plan,{asOfDate:'2026-10-10',upcomingDays:7});
    const report=VesaTnaReports.buildReportModel(plan,{reportId:'R01',language:'en',generatedAt:'2026-10-11T18:30:00.000Z',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone});
    const scheduleRows=plan.tasks.map(task=>{const row=schedule.taskResults[task.taskId];return {ref:task.templateRef,earlyStart:row?.earlyStart,earlyFinish:row?.earlyFinish,lateStart:row?.lateStart,lateFinish:row?.lateFinish,floatDays:row?.floatDays,freeFloatDays:row?.freeFloatDays,isCritical:row?.isCritical,isNearCritical:row?.isNearCritical,isOverdue:row?.isOverdue,risk:row?.risk};});
    const refById=Object.fromEntries(plan.tasks.map(task=>[task.taskId,task.templateRef])),project=schedule.project;
    const stableProject={selectedDeadlineType:project.selectedDeadlineType,requiredDate:project.requiredDate,forecastDate:project.forecastDate,workingDaysEarlyOrLate:project.workingDaysEarlyOrLate,scheduleConfidence:project.scheduleConfidence,criticalPaths:project.criticalPaths.map(path=>path.map(id=>refById[id]))};
    return {timezone:report.timezone,schedule:{validity:schedule.validity,project:stableProject,rows:scheduleRows},alerts:alerts.map(({templateRef,rule,dueDate,asOfDate})=>({templateRef,rule,dueDate,asOfDate})),reportDates:report.tasks.map(({ref,baseline,current,forecast,actual,status})=>({ref,baseline,current,forecast,actual,status})),order:report.order};
  });
  await context.close();
  return result;
}

async function run(){
  const server=await serve(),base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.VesaTnaStorage&&document.querySelector('.vesa-workspace'));
    await page.evaluate(()=>{const plan=VesaTnaDomain.createPlan({templateId:'knit',buyerName:'Synthetic Buyer বাংলা हिन्दी தமிழ்',factoryName:'Synthetic Factory',styleNo:'STYLE-G11-I18N',poNumber:'PO-G11-I18N',totalQty:1200,orderConfirmedOn:'2026-10-10',buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'qa-vesaent-com'});plan.tasks[0].status='blocked';plan.tasks[0].dates.currentTargetFinish='2026-10-09';VesaTnaStorage.savePlan(plan,'qa-vesaent-com');});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const storedBefore=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));

    await page.setViewportSize({width:360,height:844});
    const mobile=page.locator('[data-vesa-mobile-menu]');
    await mobile.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('.vesa-workspace').getAttribute('data-menu-open'),'true','keyboard Enter must open the mobile workspace menu');
    assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-menu="Home"]')),true,'mobile menu must move focus to its first command');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.vesa-workspace').getAttribute('data-menu-open'),'false','Escape must close the mobile workspace menu');
    assert.equal(await mobile.getAttribute('aria-expanded'),'false','Escape must expose the closed mobile-menu state to assistive technology');
    assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-mobile-menu]')),true,'mobile-menu Escape must return focus');

    for(const item of cases){
      await page.setViewportSize({width:1280,height:900});
      const settings=page.locator('[data-vesa-user]');
      await settings.focus();await page.keyboard.press('Enter');
      const dialog=page.locator('[data-vesa-settings]');
      await dialog.waitFor({state:'visible'});
      await dialog.locator('[data-pref-language]').selectOption(item.language);
      await dialog.locator('[data-pref-theme]').selectOption(item.theme);
      await page.waitForFunction(({language,theme,title})=>document.documentElement.lang===language&&document.documentElement.dataset.vesaTheme===theme&&document.querySelector('.tna-hero h1')?.textContent===title,item);
      await page.keyboard.press('Escape');
      await dialog.waitFor({state:'hidden'});
      assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-user]')),true,`${item.language}: Settings Escape must return focus`);
      await page.setViewportSize({width:item.width,height:900});
      await page.waitForFunction(width=>innerWidth===width,item.width);
      const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
      assert.ok(geometry.doc<=geometry.inner+1&&geometry.body<=geometry.inner+1,`${item.language}@${item.width}: no horizontal page overflow`);
      assert.equal(await page.locator('.tna-plan-head').getByText('STYLE-G11-I18N',{exact:false}).count()>0,true,`${item.language}: user-entered style remains visible`);
      assert.match(await page.locator('.tna-plan-head').innerText(),/Synthetic Buyer বাংলা हिन्दी தமிழ்/,`${item.language}: multilingual entered buyer is not translated`);
      await openShellMenu(page,'Tools');
      await page.locator('[data-menu-action="Prepare Report"]').click();
      assert.equal(await page.locator('#tnaReportPreview h3').first().textContent(),item.heading,`${item.language}: report heading follows selected language`);
      assert.match(await page.locator('#tnaReportPreview').innerText(),/STYLE-G11-I18N/,`${item.language}: report preserves typed style`);
      await page.keyboard.press('Escape');
      await page.locator('#tnaDialog').waitFor({state:'hidden'});
      if(item.language==='bn'||item.language==='ta')await page.screenshot({path:path.join(output,`tna-g11-${item.language}-${item.theme}-${item.width}.png`),fullPage:true});
    }

    await page.setViewportSize({width:1280,height:900});
    const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
    assert.equal(await page.evaluate(()=>visualViewport.scale),2,'desktop browser page scale should be 200%');
    await page.screenshot({path:path.join(output,'tna-g11-ta-200-percent.png'),fullPage:true});
    await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});

    const storedAfter=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
    assert.equal(storedAfter,storedBefore,'language, theme, responsive and keyboard presentation changes must not mutate the saved TNA');
    assert.deepEqual(errors,[],'language/theme matrix must not emit uncaught page errors');

    const west=await timezoneProbe(browser,base,'Pacific/Honolulu');
    const east=await timezoneProbe(browser,base,'Pacific/Kiritimati');
    assert.equal(west.timezone,'Pacific/Honolulu');assert.equal(east.timezone,'Pacific/Kiritimati');
    assert.deepEqual(east.schedule,west.schedule,'date-only schedule results must be invariant across opposite-side timezones');
    assert.deepEqual(east.alerts,west.alerts,'explicit as-of alert classification must be timezone invariant');
    assert.deepEqual(east.reportDates,west.reportDates,'report business dates/statuses must be timezone invariant');
    assert.deepEqual(east.order,west.order,'report order values must be timezone invariant');
    assert.ok(west.alerts.some(item=>item.rule==='overdue-action'&&item.asOfDate==='2026-10-10'),'explicit as-of date must drive overdue classification');
    console.log('TNA G11 language/accessibility passed: EN/BN/HI/TA, 360/390/768/1280, 200% scale, light/dark themes, keyboard focus, immutable saved data, Honolulu/Kiritimati civil-date invariants');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
fs.mkdirSync(output,{recursive:true});
run().catch(error=>{console.error(error);process.exitCode=1;});
