/**
 * TNA G10 visible manual reference workflow.
 * Synthetic local records only; no sibling store, network, approval or notification claim.
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

async function tools(page){
  const mobile=page.locator('[data-vesa-mobile-menu]');
  if(await mobile.isVisible())await mobile.click();
  await page.locator('[data-vesa-menu="Tools"]').click();
  await page.locator('[data-menu-action="Linked Records"]').click();
  await page.locator('#tnaLinkedRecordForm').waitFor();
}

async function run(){
  const source=fs.readFileSync(path.join(root,'apps/tna/src/bootstrap.js'),'utf8');
  const slice=source.slice(source.indexOf('function linkedRecordCards'),source.indexOf('function continueLast'));
  for(const forbidden of [/indexedDB/i,/XMLHttpRequest/i,/fetch\s*\(/i,/localStorage/i])assert.doesNotMatch(slice,forbidden);
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    for(const [name,value] of Object.entries({buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',styleNo:'STYLE-G10-UI',poNumber:'PO-G10-UI',totalQty:'1200',buyerRequiredExFactory:'2026-12-20',orderConfirmedOn:'2026-10-10'}))await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    await page.locator('[data-edit-task]').first().click();
    await page.locator('[name="nextStatus"]').selectOption('blocked');
    await page.locator('#tnaTaskEdit button[type="submit"]').click();
    await page.locator('[data-tna-alert="blocked-action"]').first().waitFor();
    fs.mkdirSync(output,{recursive:true});
    await page.locator('[aria-label="In-app action alerts"]').screenshot({path:path.join(output,'tna-g10-in-app-alerts-mobile.png')});
    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await tools(page);
    assert.equal(await page.locator('#tnaLinkedEmpty').isVisible(),true);

    await page.locator('[name="sourceRecordId"]').fill('PPM-G10-UI');
    await page.locator('[name="sourceVersion"]').fill('5.1.5');
    await page.locator('[name="verifiedBy"]').fill('Synthetic Reviewer');
    await page.locator('[name="verifiedAt"]').fill('2026-10-11T10:20');
    await page.locator('[name="sourceSchema"]').fill('VESA-PPM:99');
    await page.locator('#tnaLinkedRecordForm button[type="submit"]').click();
    await page.locator('#tnaLinkedStatus').getByText(/unsupported or stale/i).waitFor();
    assert.equal(await page.locator('[data-linked-reference]').count(),0);

    await page.locator('[name="sourceSchema"]').fill('VESA-PPM:2');
    await page.locator('[name="recordedStatus"]').selectOption('GO');
    await page.locator('#tnaLinkedRecordForm button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('[data-linked-reference]').length===1);
    assert.match(await page.locator('[data-linked-reference]').innerText(),/PPM recorded GO/);
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(stored.integrationReferences.length,1);
    assert.ok(stored.tasks.some(task=>task.status==='blocked')&&stored.tasks.every(task=>!['approved','completed'].includes(task.status)));

    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await tools(page);
    assert.match(await page.locator('[data-linked-reference]').innerText(),/PPM-G10-UI/);
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('[data-remove-linked]').click();
    await page.locator('#tnaLinkedEmpty').waitFor();
    const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(after.integrationReferences.length,0);
    assert.ok(after.tasks.some(task=>task.status==='blocked')&&after.tasks.every(task=>!['approved','completed'].includes(task.status)));
    const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    assert.ok(geometry.doc<=geometry.inner+1&&geometry.body<=geometry.inner+1);
    await page.locator('#tnaDialog').screenshot({path:path.join(output,'tna-g10-linked-records-mobile.png')});
    assert.deepEqual(errors,[]);
    console.log('TNA G10 UI passed: in-app blocked alert, stale rejection, add/save/reopen/remove, unchanged task decisions, 390px and console');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
