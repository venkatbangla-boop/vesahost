/* APP-15 actual Chromium source-only concept/board/revision/decision, portable restore and 4 languages. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const kinds={'.html':'text/html','.js':'application/javascript','.css':'text/css',
    '.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml','.ico':'image/x-icon'};
   res.writeHead(200,{'Content-Type':kinds[path.extname(file)]||'application/octet-stream',
    'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
  email:'synthetic-product@vesaent.com',name:'SYN DESIGNER',role:'admin',
  userKey:'synthetic-product-vesaent-com',loginAt:'2026-10-17T00:00:00Z',
  expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
 const action=async(name,id)=>page.locator('[data-action="'+name+'"]'+(id?'[data-id="'+id+'"]':'')).first().click();
 const fill=async fields=>{for(const [name,value] of Object.entries(fields)){
  const el=page.locator('#pdDialog [name="'+name+'"]');
  assert(await el.count(),'Missing Product Development field '+name);
  if(await el.evaluate(n=>n.tagName==='SELECT'))await el.selectOption(String(value));
  else await el.fill(String(value));
 }};
 const submit=async()=>{await page.locator('#pdDialog form button[type=submit]').click();
  await page.locator('#pdDialog[open]').waitFor({state:'hidden',timeout:12000});};
 const records=()=>page.evaluate(()=>{
  const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.product-development.records.v1.'));
  return key?JSON.parse(localStorage.getItem(key)).records:[];});
 try{
  fs.mkdirSync(out,{recursive:true});
  await page.goto(base+'/apps/product-development/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action=new]').waitFor({timeout:14000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'Only one VESA global shell');
  assert.equal(await page.locator('.vesa-workspace__brand img').count(),1,'Only one workspace logo');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'One universal six-command menu');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/);
  await action('new');await fill({
   conceptName:'SYN CLASSIC TEE LINE',category:'T-SHIRT',season:'SYN SEASON',market:'SYN MEXICO MARKET',
   sourceRef:'SYN DESIGN BRIEF',reviewedBy:'SYN PRODUCT TEAM',reviewDate:'2026-10-17',
   silhouette:'SYN CLASSIC',brief:'SYN concept only no sizes',requestedBuyer:'SYN BUYER REF'});
  await submit();
  assert.equal((await records()).length,1);assert.equal((await records())[0].revision,0);
  assert.equal((await records())[0].status,'DRAFT PROPOSAL — NOT BUYER APPROVED / NOT PRODUCTION READY');
  await action('colourways');await action('add-colourway');await fill({
   name:'SYN NAVY IDEA',sourceRef:'SYN DESIGN PALETTE',sourceDate:'2026-10-17',
   reviewedBy:'SYN DESIGNER',colourRef:'SYN COLOR C1',colourSourceRef:'SYN BRIEF CARD',
   materialProposal:'SYN COTTON SINGLE JERSEY',materialSourceRef:'SYN DESIGN IDEA',
   silhouette:'SYN REGULAR',notes:'SYN draft only'});await submit();
  assert.equal((await records())[0].colourways.length,1);
  const cid=(await records())[0].colourways[0].id;
  await action('tasks');await action('add-task');await fill({
   kind:'fit',description:'SYN request fit exploration',sourceRef:'SYN DESIGN FILE',
   sourceDate:'2026-10-17',reviewedBy:'SYN PRODUCT TEAM'});await submit();
  assert.equal((await records())[0].tasks[0].state,'requested-not-approved');
  await action('boards');await action('add-board');await fill({
   titleBoard:'SYN CAPSULE BOARD',layout:'grid-2',aspect:'16:9',sourceRef:'SYN BOARD DIRECTION',
   sourceDate:'2026-10-17',reviewedBy:'SYN DESIGNER',boardNote:'SYN mood and shape',
   boardColourway:cid});await submit();
  assert.equal((await records())[0].boards.length,1);
  assert.equal((await records())[0].boards[0].cards.length,2);
  assert.match(await page.locator('.pd-board').innerText(),/SYN NAVY IDEA/);
  await action('revisions');await action('revise');await fill({
   brief:'SYN second round concept review, no buyer signoff',sourceRef:'SYN REV NOTE',
   sourceDate:'2026-10-17',reviewedBy:'SYN DESIGNER',comments:'SYN internal changes'});await submit();
  assert.equal((await records())[0].revisions.length,1);
  assert.equal((await records())[0].revisions[0].before.brief,'SYN concept only no sizes');
  await action('decisions');await action('decide');await fill({
   state:'selected-for-next-draft',party:'internal',actor:'SYN PRODUCT OWNER',
   authorityRef:'SYN LOCAL REVIEW AUTHORITY',sourceRef:'SYN REVIEW NOTES',
   decisionDate:'2026-10-17',comments:'SYN PROPOSAL selected for next draft only'});await submit();
  assert.equal((await records())[0].decisions.length,1);
  assert.equal((await records())[0].status,'DRAFT PROPOSAL — NOT BUYER APPROVED / NOT PRODUCTION READY');
  await action('summary');
  assert.match(await page.locator('.pd-card').last().innerText(),/SYN second round concept review/);
  const kept=JSON.stringify((await records())[0]);await action('save');
  await page.reload({waitUntil:'domcontentloaded'});await action('continue');
  assert.equal(JSON.stringify((await records())[0]),kept,'Browser save/reload/Continue preserves draft');
  const savedDownload=page.waitForEvent('download');await action('download');const download=await savedDownload;
  const savedPath=path.join(out,'product-app15-synthetic.vesaproduct');await download.saveAs(savedPath);
  assert.equal(JSON.parse(fs.readFileSync(savedPath,'utf8')).format,'VESA-PRODUCT-DEVELOPMENT-COPY-1');
  await action('home');await action('upload');await page.locator('#pdSavedFile').setInputFiles(savedPath);
  await page.locator('#pdDialog[open]').waitFor();await page.locator('#pdDialogClose').click();
  assert.equal((await records()).length,2,'Import preserves earlier record as separate fork');
  const wrongPath=path.join(out,'product-app15-corrupt.vesaproduct');
  fs.writeFileSync(wrongPath,fs.readFileSync(savedPath,'utf8').replace('SYN CLASSIC TEE','FORGED STYLE TEE'));
  const beforeInvalid=JSON.stringify(await records());
  await page.locator('#pdSavedFile').setInputFiles(wrongPath);
  await page.locator('#pdDialog[open]').waitFor();
  assert.match(await page.locator('#pdDialogBody').innerText(),/Altered or unsupported/);
  await page.locator('#pdDialogClose').click();
  assert.equal(JSON.stringify(await records()),beforeInvalid,'Corrupted saved copy cannot change source records');
  await action('history');assert.match(await page.locator('.pd-table').innerText(),/Sourced concept brief revision/);
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:870});
   const measured=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(measured<=width+1,width+'px Product Development overflow: '+measured);
   if([390,768,1280].includes(width))
    await page.screenshot({path:path.join(out,'product-app15-'+width+'.png')});
  }
  await page.setViewportSize({width:1280,height:900});
  for(const [lang,label] of [['en','Proposed Colourways'],['bn','প্রস্তাবিত রং'],
   ['hi','प्रस्तावित रंग'],['ta','முன்மொழியப்பட்ட நிறங்கள்']]){
   const before=JSON.stringify(await records());
   await page.locator('[data-vesa-user]').click();
   const dialog=page.locator('[data-vesa-settings]');
   await dialog.locator('[data-pref-language]').selectOption(lang);
   await page.waitForFunction(expected=>document.documentElement.lang===expected,lang);
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   assert((await page.locator('.pd-tabs').innerText()).includes(label),'Missing locale '+lang);
   assert.equal(JSON.stringify(await records()),before,'Language cannot translate source or mutate concept data');
  }
  await action('home');await action('new');await page.locator('#pdDialog[open]').waitFor();
  await page.keyboard.press('Escape');await page.locator('#pdDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Escape restores opener focus');
  await action('practice');await action('colourways');
  assert(await page.locator('[data-action=save]').isDisabled(),'Synthetic practice cannot alter saved concepts');
  assert.equal((await records()).length,2,'Practice cannot silently create a record');
  assert.deepEqual(errors,[],'No uncaught Chromium errors');
  assert.deepEqual(external,[],'No remote requests or hidden media/customer uploads');
  console.log('PRODUCT DEVELOPMENT M2 REAL CHROMIUM PASS: single VESA shell, sourced concept/colourway/board/tasks, immutable brief and local proposal decisions, Save/Continue/Download/Open separate copy, corruption rejection, EN/BN/HI/TA, 320–1440 and zero external requests.');
 }finally{
  await context.close();await browser.close();await new Promise(ok=>server.close(ok));
 }
}
run().catch(err=>{console.error(err);process.exitCode=1;});
