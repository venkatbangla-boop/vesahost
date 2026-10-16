/** G11 authenticated browser proof for stored/reflected markup and import preview safety. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../../..');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';
const hostile='<img id="tna-xss" src="x" onerror="globalThis.__tnaXss=1"><script>globalThis.__tnaXss=2</script>';

async function menu(page,name){
  const item=page.locator(`[data-vesa-menu="${name}"]`);
  if(!await item.isVisible())await page.locator('[data-vesa-mobile-menu]').click();
  await item.waitFor({state:'visible'});await item.click();
}
async function run(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  try{
    await page.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.VesaTnaStorage&&globalThis.VesaTnaDomain);
    await page.evaluate(value=>{const plan=VesaTnaDomain.createPlan({templateId:'knit',buyerName:value,factoryName:'Synthetic Factory',styleNo:`STYLE-${value}`,poNumber:'PO-SECURITY',totalQty:500,orderConfirmedOn:'2026-10-10',buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'qa-vesaent-com'});VesaTnaStorage.savePlan(VesaTnaStorage.importCopy(VesaTnaStorage.exportCopy(plan)),'qa-vesaent-com');},hostile);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    assert.equal(await page.locator('#tna-xss').count(),0,'stored markup must not create an executable element');
    assert.equal(await page.evaluate(()=>globalThis.__tnaXss),undefined,'stored markup event/script must not execute');
    assert.match(await page.locator('.tna-plan-head').innerText(),/<img id="tna-xss"/, 'stored markup should remain visible as inert user text');

    await menu(page,'Tools');
    await page.locator('[data-menu-action="Prepare Report"]').click();
    assert.equal(await page.locator('#tnaReportPreview #tna-xss').count(),0,'report markup must remain inert');
    assert.match(await page.locator('#tnaReportPreview').innerText(),/<script>globalThis.__tnaXss=2<\/script>/,'report should preserve hostile-looking input as plain text');
    await page.keyboard.press('Escape');

    await menu(page,'File');
    await page.locator('[data-menu-action="Import Excel TNA"]').click();
    await page.locator('#tnaImportText').fill(`Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory\n${hostile},Factory,=HYPERLINK("bad"),PO,500,10/11/26`);
    const beforeImport=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
    await page.locator('#tnaImportReadText').click();
    await page.locator('#tnaImportReview [role="alert"]').waitFor();
    assert.equal(await page.locator('#tnaImportReview #tna-xss').count(),0,'untrusted worksheet text must never render as an executable element');
    assert.match(await page.locator('#tnaImportReview [role="alert"]').innerText(),/Formula-looking or unsafe source value found/i,
      'the current G08 parser must reject hostile script/formula cells before mapping or saving');
    assert.equal(await page.locator('#tnaImpCreate').count(),0,'hostile table must not offer Create New Draft');
    assert.equal(await page.evaluate(()=>globalThis.__tnaXss),undefined,'hostile import must not execute event/script payloads');
    // A syntactically clean but ambiguous source date is reviewed separately,
    // never resolved from a guessed DD/MM or MM/DD convention.
    await page.locator('#tnaImportText').fill('Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory\nSafe Buyer,Safe Factory,STYLE-SEC,PO-SEC,500,10/11/26');
    await page.locator('#tnaImportReadText').click();
    await page.locator('#tnaImpFormat').waitFor();
    await page.waitForFunction(()=>document.querySelector('#tnaImportReview .tna-import-errors')?.textContent?.includes('invalid or unreviewed date'));
    assert.match(await page.locator('#tnaImportReview').innerText(),/invalid or unreviewed date/,'ambiguous date must demand human date-format review');
    assert.equal(await page.locator('#tnaImpCreate').isDisabled(),true,'ambiguous dates must not create an order');
    assert.equal(await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com')),beforeImport,
      'reviewing malicious or ambiguous input must not alter saved records');
    const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,wide:[...document.querySelectorAll('*')].filter(node=>node.getBoundingClientRect().right>innerWidth+1||node.scrollWidth>node.clientWidth+1).slice(0,8).map(node=>({tag:node.tagName,id:node.id,className:String(node.className||''),left:Math.round(node.getBoundingClientRect().left),right:Math.round(node.getBoundingClientRect().right),clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,text:String(node.textContent||'').slice(0,80)}))}));
    assert.ok(geometry.doc<=geometry.inner+1&&geometry.body<=geometry.inner+1,`security surfaces must not overflow at 390px: ${JSON.stringify(geometry)}`);
    const output=path.join(root,'output','playwright');fs.mkdirSync(output,{recursive:true});await page.locator('#tnaDialog').screenshot({path:path.join(output,'tna-g11-security-import-mobile.png')});
    assert.deepEqual(errors,[],'security browser probe must have no uncaught page errors');
    assert.deepEqual(external,[],'local-only TNA security probe must make no external network requests');
    console.log('TNA G11 security UI passed: saved-copy stored markup, report and import preview stayed inert; formula/date warnings, 390px, zero external requests/page errors');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
