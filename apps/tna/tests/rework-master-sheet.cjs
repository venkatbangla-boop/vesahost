/**
 * Browser proof for the revised garment Time & Action master sheet.
 * Owns only a temporary localhost static server and synthetic browser data.
 * It must never communicate with real buyers, factory records or remote APIs.
 * Run with CHROMIUM_PATH set to the installed Playwright Chromium executable.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');

class TnaMerchandisingSheetBrowserProof {
  constructor() {
    this.root=path.resolve(__dirname,'../../..');
    this.server=null;
    this.browser=null;
    this.context=null;
    this.page=null;
    this.errors=[];
    this.external=[];
    this.session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
  }

  /** Starts the real, local-file server and an isolated authenticated browser. */
  async start() {
    const mime={'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.ico':'image/x-icon'};
    this.server=http.createServer((request,response)=>{
      const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);
      let file=path.resolve(this.root,'.'+pathname);
      if(!file.startsWith(this.root+path.sep))return response.writeHead(403).end();
      try {
        if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
        response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
        response.end(fs.readFileSync(file));
      }catch{return response.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.base='http://127.0.0.1:'+this.server.address().port;
    this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
    this.context=await this.browser.newContext({viewport:{width:1280,height:900}});
    await this.context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),this.session);
    this.page=await this.context.newPage();
    this.page.on('pageerror',error=>this.errors.push(error.message));
    this.page.on('request',request=>{if(!request.url().startsWith(this.base))this.external.push(request.url());});
    await this.page.goto(this.base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    await this.page.waitForFunction(()=>globalThis.VesaTnaDomain&&globalThis.VesaTnaStorage&&document.querySelector('.vesa-workspace'));
  }

  /** Creates known synthetic values through the existing domain engine and reopens from local storage. */
  async openSyntheticOrder(templateId) {
    await this.page.evaluate(id=>{
      const draft=VesaTnaDomain.createPlan({templateId:id,buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',styleNo:'STYLE-'+id.toUpperCase(),poNumber:'PO-'+id.toUpperCase(),totalQty:2000,orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-15'},{ownerUserId:'qa-vesaent-com'});
      const first=draft.tasks[0];
      const completed=VesaTnaDomain.updateTaskStatus(draft,first.taskId,'completed',{actualDate:'2026-10-22',actorId:'qa-vesaent-com',reason:'Synthetic status note'});
      if(!completed.ok)throw new Error(completed.error);
      const plan=completed.plan;
      plan.tasks[0].dates.currentTargetFinish='2026-10-18';
      plan.tasks[0].dates.forecastFinish='2026-10-21';
      plan.tasks[0].delayReason='Synthetic supplier hold';
      plan.approvals.push({approvalId:'SYN-'+id,requiredForTaskIds:[first.taskId],partyRequiredToApprove:'Bangladesh local office',responseStatus:'approved',decidedBy:'Synthetic BD reviewer',evidenceRef:'SYN-EVID-'+id});
      VesaTnaStorage.savePlan(plan,'qa-vesaent-com');
    },templateId);
    await this.page.reload({waitUntil:'domcontentloaded'});
    await this.page.locator('[data-action="continue"]').click();
    await this.page.locator('#tnaDialog .tna-dialog-head button').click();
    await this.page.locator('.tna-master-activities').waitFor();
    const stored=await this.page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    this.templateId=templateId;
    assert.equal(stored.templateId,templateId,'Most recent plan must be the selected garment profile');
    assert.equal(await this.page.locator('.tna-master-activities [data-edit-task]').count(),stored.tasks.length,'Every garment activity requires an accessible edit action');
    assert.equal(await this.page.locator('.tna-master-activities [role="row"]').count(),stored.tasks.length+1,'One header and every task row must render');
    assert.equal(await this.page.locator('.tna-activity-heading [role="columnheader"]').count(),12,'Twelve truthful business columns must remain visible to assistive technology');
    const firstRow=await this.page.locator('.tna-master-activities [role="row"]').nth(1).innerText();
    for(const value of ['2026-10-18','2026-10-21','2026-10-22','4 (','Bangladesh local office','Synthetic BD reviewer','SYN-EVID-'+templateId,'Synthetic status note','Synthetic supplier hold'])assert.ok(firstRow.includes(value),'Stored field missing from first task row: '+value);
    const unrelatedRow=await this.page.locator('.tna-master-activities [role="row"]').nth(2).innerText();
    assert.ok(!unrelatedRow.includes('Bangladesh local office'),'Approval authority must not spread to an unlinked task');
    return stored;
  }

  /**
   * Real browser proof that the factory chooses days, date exceptions and a
   * source rather than inheriting the engine's synthetic weekday defaults.
   * Confirms named-save/reload/portable recovery for both garment templates.
   */
  async verifyFactoryCalendar(){
    const card=this.page.locator('.tna-calendar-panel');
    await card.waitFor();
    const missingByLanguage={en:'Needs Information',bn:'তথ্য প্রয়োজন',hi:'जानकारी चाहिए',ta:'தகவல் தேவை'};
    const currentLanguage=await this.page.evaluate(()=>document.documentElement.lang);
    assert.ok((await card.innerText()).includes(missingByLanguage[currentLanguage]||missingByLanguage.en),
      'Unconfigured factory calendar must stay unknown in the selected language.');
    await card.locator('[data-edit-calendar]').click();
    const form=this.page.locator('#tnaCalendarForm');
    await form.waitFor({state:'visible'});
    assert.equal(await form.locator('[name="workingWeek"]:checked').count(),0,
      'Unconfirmed calendar cannot silently preselect Monday-Friday.');
    await form.locator('[name="name"]').fill('Synthetic '+this.templateId+' production calendar');
    await form.locator('[name="timezone"]').fill('Asia/Dhaka');
    await form.locator('[name="sourceReference"]').fill('Synthetic Calendar Document REV A');
    await form.locator('[name="holidays"]').fill('2026-10-21\n2028-02-29');
    await form.locator('[name="shutdowns"]').fill('2026-10-22');
    await form.locator('[name="reason"]').fill('Factory documents reviewed for synthetic proof');
    for(const day of [0,1,2,3,4,5])await form.locator('[name="workingWeek"][value="'+day+'"]').check();
    await form.locator('[name="confirmed"]').check();
    await form.locator('button[type="submit"]').click();
    await this.page.locator('#tnaCalendarForm').waitFor({state:'detached'});
    const named=await this.page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    const calendar=named.calendars.find(item=>item.calendarId==='default');
    assert.equal(calendar.source,'user-confirmed','Saved order must record user source not invented factory verification.');
    assert.equal(calendar.sourceReference,'Synthetic Calendar Document REV A');
    assert.equal(calendar.timezone,'Asia/Dhaka');
    assert.deepEqual(calendar.workingWeek,[0,1,2,3,4,5]);
    assert.deepEqual(calendar.holidays,['2026-10-21','2028-02-29']);
    assert.deepEqual(calendar.shutdowns,['2026-10-22']);
    assert.equal(calendar.revision,1);
    assert.equal(named.revisionEvents.at(-1).eventType,'factory-calendar-confirmed');
    const roundTrip=await this.page.evaluate(()=>{
      const saved=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;
      const copy=VesaTnaStorage.importCopy(VesaTnaStorage.exportCopy(saved));
      return {calendar:copy.calendars[0],baseline:copy.baselineSnapshots,approvals:copy.approvals};
    });
    assert.deepEqual(roundTrip.calendar,calendar,'Downloaded copy must retain the reviewed factory calendar.');
    assert.deepEqual(roundTrip.baseline,named.baselineSnapshots,'Calendar input must not affect baseline.');
    assert.deepEqual(roundTrip.approvals,named.approvals,'Calendar input must not invent buyer approvals.');
    await this.page.reload({waitUntil:'domcontentloaded'});
    await this.page.locator('[data-action="continue"]').click();
    await this.page.locator('#tnaDialog .tna-dialog-head button').click();
    assert.ok((await this.page.locator('.tna-calendar-panel').innerText()).includes('Synthetic Calendar Document REV A'),
      'The named TNA calendar must survive a full browser restart.');
  }

  /**
   * Real browser evidence for verified R04: only after the local user has
   * recorded a factory calendar. The report never grants a buyer approval.
   */
  async verifyCriticalPathReport(){
    const mobile=this.page.locator('[data-vesa-mobile-menu]');
    if(await mobile.isVisible())await mobile.click();
    await this.page.locator('[data-vesa-menu="Tools"]').click();
    await this.page.locator('[data-menu-action="Prepare Report"]').click();
    await this.page.locator('#tnaReportType').selectOption('R04');
    await this.page.locator('.tna-cpm-print').waitFor();
    const named=await this.page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    const report=await this.page.evaluate(()=>{
      const plan=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;
      return VesaTnaReports.buildReportModel(plan,{reportId:'R04',language:document.documentElement.lang});
    });
    assert.equal(report.criticalPath.validity,'valid','Only a confirmed calendar activates the R04 CPM calculation.');
    assert.equal(await this.page.locator('.tna-cpm-table tbody tr').count(),named.tasks.length,
      'R04 must include every underlying activity, not a truncated dashboard excerpt.');
    assert.equal(await this.page.locator('.tna-cpm-table thead th').count(),10);
    assert.deepEqual(report.criticalPath.rows.map(row=>row.ref),named.tasks.map(task=>task.templateRef));
    const before=JSON.stringify(named);
    await this.page.emulateMedia({media:'print'});
    await this.page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const geometry=await this.page.locator('.tna-cpm-table').evaluate(table=>({
      width:table.getBoundingClientRect().width,
      limit:table.parentElement.getBoundingClientRect().width,
      heading:getComputedStyle(table.tHead).display
    }));
    assert.ok(geometry.width<=geometry.limit+1,'R04 printed table must not overflow its page container.');
    assert.equal(geometry.heading,'table-header-group','R04 print must repeat column headers.');
    const folder=path.join(this.root,'output','playwright');
    fs.mkdirSync(folder,{recursive:true});
    const pdfPath=path.join(folder,'tna-r04-'+this.templateId+'.pdf');
    await this.page.pdf({path:pdfPath,landscape:true,printBackground:true,preferCSSPageSize:true});
    assert.equal(fs.readFileSync(pdfPath).subarray(0,5).toString(),'%PDF-','R04 must produce a real Chromium PDF.');
    await this.page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    await this.page.emulateMedia({media:'screen'});
    await this.page.locator('#tnaDialog .tna-dialog-head button').click();
    const after=await this.page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan));
    assert.equal(after,before,'R04 preview and print must be pure and preserve saved local orders.');
  }

  /** Proves each supported language changes labels but never changes a saved business record. */
  async verifyLanguages() {
    const before=await this.page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
    const labels=[['en','Target finish'],['bn','লক্ষ্য সমাপ্তি'],['hi','लक्षित समाप्ति'],['ta','இலக்கு முடிவு']];
    for(const [language,label] of labels) {
      await this.page.locator('[data-vesa-user]').click();
      const settings=this.page.locator('[data-vesa-settings]');
      await settings.waitFor({state:'visible'});
      await settings.locator('[data-pref-language]').selectOption(language);
      await this.page.waitForFunction(lang=>document.documentElement.lang===lang,language);
      await this.page.keyboard.press('Escape');
      await settings.waitFor({state:'hidden'});
      assert.ok(await this.page.locator('.tna-activity-heading').getByText(label,{exact:true}).count(),language+': translated target column must render');
      const names={en:'Responsible party',bn:'দায়িত্বপ্রাপ্ত পক্ষ',hi:'जिम्मेदार पक्ष',ta:'பொறுப்பான தரப்பு'};
      await this.page.locator('.tna-master-activities [data-edit-task]').first().click();
      assert.ok(await this.page.locator('#tnaFollowupEdit').getByText(names[language],{exact:false}).count(),language+': follow-up editor label must match selected language');
      await this.page.locator('#tnaDialog .tna-dialog-head button').click();
      const calendarLabel={en:'Calendar name',bn:'ক্যালেন্ডারের নাম',hi:'कैलेंडर का नाम',ta:'நாட்காட்டி பெயர்'};
      await this.page.locator('[data-edit-calendar]').click();
      const calendarForm=this.page.locator('#tnaCalendarForm');
      assert.ok(await calendarForm.getByText(calendarLabel[language],{exact:false}).count(),
        language+': factory calendar form must translate its name label.');
      assert.equal(await calendarForm.locator('[name="workingWeek"]:checked').count(),6,
        language+': confirmed working days may not change during translation.');
      await this.page.locator('#tnaDialog .tna-dialog-head button').click();

    }
    assert.equal(await this.page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com')),before,'Language changes must not change any saved TNA record');
  }

  /** Confirms the sheet scrolls inside its panel on mobile without page overflow. */
  async verifyResponsive() {
    for(const width of [390,1280]) {
      await this.page.setViewportSize({width,height:900});
      const geometry=await this.page.evaluate(()=>{
        const table=document.querySelector('.tna-sheet-scroll');
        return {pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,scrollWidth:table.scrollWidth,clientWidth:table.clientWidth};
      });
      assert.ok(geometry.pageWidth<=geometry.viewport+1,width+': page must not overflow horizontally');
      if(width===390){
        assert.ok(geometry.scrollWidth<=geometry.clientWidth+1,'Mobile activity cards must not require a hidden horizontal edit column');
        const card=await this.page.locator('.tna-activity-table [role="row"]:not(.tna-activity-heading)').first();
        assert.equal(await card.locator('.tna-sheet-cell-label').count(),12,'All twelve mobile fields must have localized visible labels');
        assert.equal(await card.locator('[data-edit-task]').count(),1,'Mobile first card must have one visible edit action');
        assert.equal(await this.page.locator('.tna-activity-heading').isVisible(),false,'Desktop-only table header must be hidden in mobile card view');
      }
      // Screenshots contain synthetic order values only; they are CI evidence, not public deployment.
      const folder=path.join(this.root,'output','playwright');
      fs.mkdirSync(folder,{recursive:true});
      await this.page.locator('.tna-master-activities h3').scrollIntoViewIfNeeded();
      await this.page.screenshot({path:path.join(folder,'tna-rework-'+this.templateId+'-'+width+'.png')});
    }
  }

  /** Editing the last activity must use the existing domain status and autosave routes. */
  async verifyLastActivityEdit() {
    const last=this.page.locator('.tna-master-activities [data-edit-task]').last();
    await last.click();
    await this.page.locator('#tnaTaskEdit select[name="nextStatus"]').selectOption('completed');
    await this.page.locator('#tnaTaskEdit [name="actualDate"]').fill('2026-11-30');
    await this.page.locator('#tnaTaskEdit button[type="submit"]').click();
    const lastRow=await this.page.locator('.tna-master-activities [role="row"]').last().innerText();
    assert.ok(lastRow.includes('2026-11-30'),'Last activity edit must be reflected in the visible sheet');
    const recovered=await this.page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')).plan);
    assert.equal(recovered.tasks.at(-1).dates.actualFinish,'2026-11-30','Existing autosave must preserve last activity edit');
    const named=await this.page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(named.tasks.at(-1).dates.actualFinish,'2026-11-30','Existing saved order must retain status edit without a second Save Now.');
    assert.equal(named.tasks.at(-1).status,'completed','Named record must also preserve the status transition.');
    assert.equal(recovered.tasks[0].dates.currentTargetFinish,'2026-10-18','Editing another task must not overwrite original target finish');
  }

  async verifyFollowupEdit(){
    const before=await this.page.evaluate(()=>{const named=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;const draft=JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')||'null')?.plan;return draft?.recordId===named.recordId?draft:named;});
    await this.page.locator('.tna-master-activities [data-edit-task]').last().click();
    const form=this.page.locator('#tnaFollowupEdit');
    await form.waitFor();
    await form.locator('[name="ownerParty"]').fill('Bangladesh Follow-up Team');
    await form.locator('[name="currentTargetFinish"]').fill('2026-11-29');
    await form.locator('[name="forecastFinish"]').fill('2026-12-04');
    await form.locator('[name="note"]').fill('Factory weekly follow-up confirmed');
    await form.locator('button[type="submit"]').click();
    const after=await this.page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    const lastTask=after.tasks.at(-1),oldTask=before.tasks.at(-1);
    assert.equal(lastTask.ownerParty,'Bangladesh Follow-up Team');
    assert.equal(lastTask.dates.currentTargetFinish,'2026-11-29');
    assert.equal(lastTask.dates.forecastFinish,'2026-12-04');
    assert.equal(lastTask.dates.actualFinish,oldTask.dates.actualFinish,'Actual may not be overwritten.');
    assert.equal(lastTask.status,oldTask.status,'Follow-up cannot grant approval or alter status.');
    assert.deepEqual(after.baselineSnapshots,before.baselineSnapshots,'Baseline cannot change.');
    assert.deepEqual(after.approvals,before.approvals,'Approvals cannot be fabricated.');
    assert.equal(after.revisionEvents.at(-1).details.reason,'Factory weekly follow-up confirmed');
    const record=await this.page.evaluate(()=>{
      const plan=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;
      const reopened=VesaTnaStorage.importCopy(VesaTnaStorage.exportCopy(plan));
      const model=VesaTnaReports.buildReportModel(reopened,{reportId:'R01',language:'en'});
      const task=model.tasks.at(-1);
      const workbook=XLSX.read(VesaTnaStorage.exportReportWorkbook(model),{type:'buffer'});
      const rows=XLSX.utils.sheet_to_json(workbook.Sheets['Report Activities'],{header:1,raw:false});
      return {saved:reopened.tasks.at(-1),report:task,excel:rows.at(-1)};
    });
    assert.equal(record.saved.ownerParty,'Bangladesh Follow-up Team','Backup round-trip must retain owner.');
    assert.equal(record.report.owner,'Bangladesh Follow-up Team','Report must retain owner.');
    assert.equal(record.report.current,'2026-11-29','Report must retain target.');
    assert.equal(record.report.forecast,'2026-12-04','Report must retain forecast.');
    assert.ok(record.excel.includes('Bangladesh Follow-up Team'),'Excel must retain owner.');
    assert.ok(record.excel.includes('2026-11-29'),'Excel must retain target.');
    assert.ok(record.excel.includes('2026-12-04'),'Excel must retain forecast.');

  }
  /** Closes the runtime even when an assertion fails. */
  async close() {
    if(this.context)await this.context.close();
    if(this.browser)await this.browser.close();
    if(this.server)await new Promise(resolve=>this.server.close(resolve));
  }

  async run() {
    try {
      await this.start();
      await this.openSyntheticOrder('knit');
      await this.verifyFactoryCalendar();
      await this.verifyCriticalPathReport();
      await this.verifyLanguages();
      await this.verifyResponsive();
      await this.verifyLastActivityEdit();
      await this.verifyFollowupEdit();
      await this.openSyntheticOrder('woven');
      await this.verifyFactoryCalendar();
      await this.verifyCriticalPathReport();
      await this.verifyResponsive();
      await this.verifyFollowupEdit();
      assert.deepEqual(this.errors,[],'No uncaught browser exceptions');
      assert.deepEqual(this.external,[],'No remote network requests');
      console.log('TNA merchandising sheet browser PASS: knit/woven, all task rows, four languages, dates, follow-ups, Excel, portable copies, edits, local reopen, responsive 390/1280, no external requests');
    }finally{await this.close();}
  }
}

new TnaMerchandisingSheetBrowserProof().run().catch(error=>{console.error(error);process.exitCode=1;});
