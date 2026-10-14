/**
 * GMR-02 real browser integration on an actual repo checkout.
 * Synthetic order only: source-required LC, guarded revision, local autosave,
 * immutable actual dates, copy and reopened records. No external requests.
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
const mime=file=>({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
const readSaved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')).plan);
async function run(){
  const server=http.createServer((req,res)=>{
    const name=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);
    let file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});
      res.end(fs.readFileSync(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:860},acceptDownloads:true});
  await context.addInitScript(s=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(s)),session);
  const page=await context.newPage(),errors=[],offOrigin=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(base))offOrigin.push(r.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-action=new]').click();
    await page.locator('[data-wizard-tab=full]').click();
    const fields={buyerName:'GMR-02 Synthetic Buyer',factoryName:'GMR-02 Synthetic Factory',
      styleNo:'GMR02-KNIT',poNumber:'GMR02-PO',totalQty:'2400',
      buyerRequiredExFactory:'2026-12-20',fabricSpec:'Single jersey cotton'};
    for(const [k,v] of Object.entries(fields))await page.locator('[name="'+k+'"]').fill(v);
    await page.locator('#tnaWizard button[type=submit]').click();
    await page.locator('#tnaMerchSheet').waitFor({state:'visible'});
    const original=await readSaved(page);
    assert.equal(original.order.fabricWeightGsm,null);
    assert.equal(original.commitments.masterLcStatus,'unknown');
    assert.equal(await page.locator('.vesa-workspace').count(),1);

    await page.locator('[data-tna-order-details]').click();
    await page.locator('#tnaOrderDetails [name=fabricWeightGsm]').fill('210');
    await page.locator('#tnaOrderDetails [name=masterLcStatus]').selectOption('opened');
    await page.locator('#tnaOrderDetails [name=sourceRef]').fill('LC register');
    await page.locator('#tnaOrderDetails [name=reason]').fill('Bank opening checked');
    await page.locator('#tnaOrderDetails button[type=submit]').click();
    assert.match(await page.locator('#tnaEditError').innerText(),/date and its document reference/i,
      'Opened LC cannot be claimed without date and proof');
    assert.equal((await readSaved(page)).order.fabricWeightGsm,null,'invalid combined edit is atomic');
    await page.locator('#tnaOrderDetails [name=masterLcOpenedOn]').fill('2026-11-15');
    await page.locator('#tnaOrderDetails [name=masterLcProofRef]').fill('BANK-LC-015');
    await page.locator('#tnaOrderDetails button[type=submit]').click();
    const LC=await readSaved(page);
    assert.equal(LC.order.fabricWeightGsm,210);
    assert.equal(LC.commitments.masterLcStatus,'opened');
    assert.equal(LC.commitments.masterLcOpenedOn,'2026-11-15');
    assert.equal(LC.commitments.masterLcProofRef,'BANK-LC-015');
    assert.match(await page.locator('#tnaMerchSheet').innerText(),/210/);
    assert.match(await page.locator('#tnaMerchSheet').innerText(),/BANK-LC-015|2026-11-15/);

    const taskId=LC.tasks[0].taskId;
    await page.locator('#tnaMerchSheet [data-edit-task]').first().click();
    await page.locator('#tnaTaskEdit [name=ownerParty]').fill('Bangladesh merchandiser');
    await page.locator('#tnaTaskEdit [name=waitingFor]').selectOption('local-office');
    await page.locator('#tnaTaskEdit [name=plannedDate]').fill('2026-11-02');
    await page.locator('#tnaTaskEdit [name=revisedDate]').fill('2026-11-07');
    await page.locator('#tnaTaskEdit [name=nextStatus]').selectOption('awaiting-approval');
    await page.locator('#tnaTaskEdit [name=reason]').fill('Local approval schedule updated');
    await page.locator('#tnaTaskEdit button[type=submit]').click();
    assert.match(await page.locator('#tnaEditError').innerText(),/evidence source and the authorizing party/i);
    assert.equal((await readSaved(page)).tasks[0].ownerParty,original.tasks[0].ownerParty,
      'failed date revision keeps original saved task');
    await page.locator('#tnaTaskEdit [name=sourceRef]').fill('LOCAL-OFFICE-EVIDENCE-01');
    await page.locator('#tnaTaskEdit [name=authorityParty]').selectOption('local-office');
    await page.locator('#tnaTaskEdit button[type=submit]').click();
    const changed=await readSaved(page);
    assert.equal(changed.tasks[0].taskId,taskId);
    assert.equal(changed.tasks[0].ownerParty,'Bangladesh merchandiser');
    assert.equal(changed.tasks[0].waitingFor,'local-office');
    assert.equal(changed.tasks[0].dates.baselineFinish,'2026-11-02');
    assert.equal(changed.tasks[0].dates.currentTargetFinish,'2026-11-07');
    assert.equal(changed.tasks[0].status,'awaiting-approval');
    assert.equal(changed.tasks[0].dates.actualFinish,null);
    assert.equal(changed.revision,2,'two recorded revisions for LC and activity');
    assert.deepEqual(changed.baselineSnapshots,original.baselineSnapshots);

    await page.locator('[data-tna-sheet-filter]').selectOption('local');
    assert.equal(await page.locator('#tnaMerchSheet tbody tr').count(),1,'explicit waiting field powers local-office filter');
    await page.locator('[data-tna-sheet-filter]').selectOption('all');
    await page.locator('#tnaMerchSheet [data-edit-task]').first().click();
    await page.locator('#tnaTaskEdit [name=nextStatus]').selectOption('approved');
    await page.locator('#tnaTaskEdit [name=reason]').fill('Approval claimed without evidence');
    await page.locator('#tnaTaskEdit button[type=submit]').click();
    assert.match(await page.locator('#tnaEditError').innerText(),/requires a new evidence reference/i);
    assert.equal((await readSaved(page)).tasks[0].status,'awaiting-approval','no invented buyer approval');
    await page.locator('#tnaTaskEdit [name=nextStatus]').selectOption('completed');
    await page.locator('#tnaTaskEdit [name=actualDate]').fill('2026-11-09');
    await page.locator('#tnaTaskEdit [name=evidenceRef]').fill('QC-LOG-REAL-DATE');
    await page.locator('#tnaTaskEdit [name=reason]').fill('Completion confirmed in synthetic report');
    await page.locator('#tnaTaskEdit button[type=submit]').click();
    const done=await readSaved(page);
    assert.equal(done.tasks[0].status,'completed');
    assert.equal(done.tasks[0].dates.actualFinish,'2026-11-09');
    assert.equal(done.tasks[0].dates.baselineFinish,'2026-11-02');

    await page.locator('#tnaMerchSheet [data-edit-task]').first().click();
    await page.locator('#tnaTaskEdit [name=actualDate]').fill('2026-11-10');
    await page.locator('#tnaTaskEdit [name=evidenceRef]').fill('FALSE-CORRECTION');
    await page.locator('#tnaTaskEdit [name=reason]').fill('Change history improperly');
    await page.locator('#tnaTaskEdit button[type=submit]').click();
    assert.match(await page.locator('#tnaEditError').innerText(),/Recorded actual completion is immutable/i);
    assert.equal((await readSaved(page)).tasks[0].dates.actualFinish,'2026-11-09');
    await page.locator('#tnaDialog .tna-dialog-head button').click();

    await page.locator('[data-action=save]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action=open]').click();
    await page.locator('[data-open-record]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    assert.equal(await page.locator('#tnaMerchSheet tbody tr').count(),done.tasks.length);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(saved.order.fabricWeightGsm,210);
    assert.equal(saved.tasks[0].dates.actualFinish,'2026-11-09');
    assert.equal(saved.tasks[0].waitingFor,'local-office');
    assert.ok(saved.revisionEvents.some(e=>e.eventType==='merchandising-task-revised'));
    await page.setViewportSize({width:390,height:844});
    const width=await page.evaluate(()=>({body:document.body.scrollWidth,html:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(width.body<=391&&width.html<=391,'TNA 390px remains within viewport');
    assert.deepEqual(errors,[]);
    assert.deepEqual(offOrigin,[]);
    console.log('TNA GMR-02 real browser PASS: LC evidence, edit rollback, task revisions, immutable actual, save/reopen and mobile');
  }finally{
    await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
  }
}
run().catch(err=>{console.error(err);process.exitCode=1;});
