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
      if(width===390)assert.ok(geometry.scrollWidth>geometry.clientWidth,'Mobile nine-column sheet must allow internal horizontal scrolling');
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
    assert.equal(recovered.tasks[0].dates.currentTargetFinish,'2026-10-18','Editing another task must not overwrite original target finish');
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
      await this.verifyLanguages();
      await this.verifyResponsive();
      await this.verifyLastActivityEdit();
      await this.openSyntheticOrder('woven');
      await this.verifyResponsive();
      assert.deepEqual(this.errors,[],'No uncaught browser exceptions');
      assert.deepEqual(this.external,[],'No remote network requests');
      console.log('TNA merchandising sheet browser PASS: knit/woven, all task rows, four languages, dates, edits, local reopen, responsive 390/1280, no external requests');
    }finally{await this.close();}
  }
}

new TnaMerchandisingSheetBrowserProof().run().catch(error=>{console.error(error);process.exitCode=1;});
