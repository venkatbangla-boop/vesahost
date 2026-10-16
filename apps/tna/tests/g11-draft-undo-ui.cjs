/**
 * F31 authenticated real Chromium workflow, both English and Tamil command
 * labels, 390px mobile menu, saved local follow-up and audit-preserving replay.
 * Synthetic data only. No external app or cloud data.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA',role:'admin',userKey:'qa-vesaent-com',
  loginAt:'2026-10-11T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'};
const mime=file=>({'.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream';
async function menu(page,action){
  const button=page.locator('[data-vesa-menu="Edit"]');
  if(!await button.isVisible())await page.locator('[data-vesa-mobile-menu]').click();
  await button.click();
  await page.locator('[data-menu-action="'+action+'"]').click();
}
async function getPlan(page){
  return page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
}
async function run(){
  const server=http.createServer((req,res)=>{
    const name=decodeURIComponent(new URL(req.url,'http://vesa.test').pathname);
    let file=path.resolve(root,'.'+name);
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
  page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
  try{
    await page.goto(base+'/apps/tna/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    for(const [name,value] of Object.entries({buyerName:'F31 synthetic buyer',
      factoryName:'F31 synthetic factory',styleNo:'STYLE-F31',poNumber:'PO-F31',
      totalQty:'120',orderConfirmedOn:'2026-10-12',
      buyerRequiredExFactory:'2026-12-20'}))
      await page.locator('#tnaWizard [name="'+name+'"]').fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const before=await getPlan(page),id=before.tasks[0].taskId;
    await page.locator('[data-edit-task]').first().click();
    await page.locator('#tnaFollowupEdit [name="ownerParty"]').fill('FINISHING TEAM');
    await page.locator('#tnaFollowupEdit [name="currentTargetFinish"]').fill('2026-11-16');
    await page.locator('#tnaFollowupEdit [name="note"]').fill('Synthetic updated finish');
    await page.locator('#tnaFollowupEdit button[type="submit"]').click();
    const changed=await getPlan(page);
    assert.equal(changed.tasks[0].ownerParty,'FINISHING TEAM');
    const auditCount=changed.auditEvents.length;
    await menu(page,'Undo');
    assert.match(await page.locator('#tnaDialogBody').innerText(),/Previous draft follow-up restored/i);
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const undone=await getPlan(page);
    assert.equal(undone.tasks[0].taskId,id);
    assert.equal(undone.tasks[0].ownerParty,before.tasks[0].ownerParty);
    assert.equal(undone.tasks[0].dates.currentTargetFinish,before.tasks[0].dates.currentTargetFinish);
    assert.equal(undone.auditEvents.length,auditCount+1);
    assert.equal(undone.revisionEvents.length,changed.revisionEvents.length+1);
    assert.deepEqual(undone.baselineSnapshots,changed.baselineSnapshots);
    await page.setViewportSize({width:390,height:844});
    await menu(page,'Redo');
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    const redone=await getPlan(page);
    assert.equal(redone.tasks[0].ownerParty,'FINISHING TEAM');
    assert.equal(redone.tasks[0].dates.currentTargetFinish,'2026-11-16');
    assert.equal(redone.auditEvents.length,auditCount+2);
    for(const [lang,label] of [['bn','শেষ খসড়া'],['hi','पिछला ड्राफ्ट'],['ta','கடைசி வரைவு']]){
      await page.setViewportSize({width:1280,height:900});
      await page.locator('[data-vesa-user]').click();
      const settings=page.locator('[data-vesa-settings]');
      await settings.locator('[data-pref-language]').selectOption(lang);
      await page.waitForFunction(value=>document.documentElement.lang===value,lang);
      await page.keyboard.press('Escape');
      await menu(page,'Redo');
      await page.locator('#tnaDialogBody').getByText(/No recent draft follow-up/).waitFor();
      await page.locator('#tnaDialog .tna-dialog-head button').click();
      const current=await getPlan(page);
      assert.equal(current.tasks[0].ownerParty,'FINISHING TEAM');
      const button=page.locator('[data-vesa-menu="Edit"]');
      await button.click();
      assert.match(await page.locator('[data-menu-action="Undo"]').innerText(),new RegExp(label));
      await page.keyboard.press('Escape');
    }
    await page.setViewportSize({width:390,height:844});
    const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth}));
    assert(geometry.doc<=geometry.inner+1);
    fs.mkdirSync(output,{recursive:true});
    await page.screenshot({path:path.join(output,'tna-f31-draft-history-mobile.png')});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await menu(page,'Undo');
    await page.locator('#tnaDialogBody').getByText(/No recent draft follow-up/).waitFor();
    const reopened=await getPlan(page);
    assert.equal(reopened.tasks[0].ownerParty,'FINISHING TEAM');
    assert.deepEqual(errors,[]);
    assert.deepEqual(external,[]);
    console.log('TNA F31 Chromium PASS: Edit Undo/Redo, named save and audit history, 390px, BN/HI/TA labels, session reset on reload, no network.');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
