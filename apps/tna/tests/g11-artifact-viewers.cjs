/**
 * TNA G11 real-browser proof for migrated local reopen and report artifacts.
 * Generates synthetic evidence only; no customer data, network sync or provider claim.
 */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';

function legacyBox(){
  const plan=domain.createPlan({templateId:'knit',buyerName:'Synthetic Migration Buyer',factoryName:'Synthetic Migration Factory',styleNo:'STYLE-G11-VIEW',poNumber:'PO-G11-VIEW',totalQty:2400,orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-12-20'},{ownerUserId:session.email});
  plan.schemaVersion='TNA360-ORDERPLAN-1.0.0';
  delete plan.integrationReferences;
  return {storageVersion:storage.STORAGE_VERSION,records:[{recordId:plan.recordId,updatedAt:'2026-10-11T05:20:00.000Z',buyer:plan.order.buyerName,style:plan.order.styles[0].styleNo,po:plan.order.poNumbers[0],plan}]};
}

async function openTools(page){
  const mobile=page.locator('[data-vesa-mobile-menu]');
  if(await mobile.isVisible())await mobile.click();
  await page.locator('[data-vesa-menu="Tools"]').click();
}

async function run(){
  fs.mkdirSync(output,{recursive:true});
  const seeded=legacyBox();
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(({auth,box})=>{localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(auth));localStorage.setItem(`vesa.tna360.records.${auth.userKey}`,JSON.stringify(box));},{auth:session,box:seeded});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    let stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),`vesa.tna360.records.${session.userKey}`);
    assert.equal(stored.records[0].plan.schemaVersion,domain.SCHEMA_VERSION,'Browser reopen must persist the migrated schema.');
    assert.equal(stored.records[0].plan.order.styles[0].styleNo,'STYLE-G11-VIEW');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="continue"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),`vesa.tna360.records.${session.userKey}`);
    assert.equal(stored.records[0].plan.schemaVersion,domain.SCHEMA_VERSION,'Migrated record must reopen after a full browser reload.');

    await openTools(page);
    await page.locator('[data-menu-action="Prepare Report"]').click();
    await page.locator('.tna-report-preview').waitFor();
    const previewGeometry=await page.locator('.tna-report-preview').evaluate(preview=>({scrollWidth:preview.scrollWidth,clientWidth:preview.clientWidth,rows:[...preview.querySelectorAll('[role="row"]')].map(row=>({scrollWidth:row.scrollWidth,clientWidth:row.clientWidth}))}));
    assert.ok(previewGeometry.scrollWidth<=previewGeometry.clientWidth+1,'Report preview must not clip horizontally.');
    assert.ok(previewGeometry.rows.every(row=>row.scrollWidth<=row.clientWidth+1),'Report rows must not clip horizontally.');
    await page.locator('.tna-report-preview').screenshot({path:path.join(output,'tna-g11-report-preview-desktop.png')});

    const downloadPromise=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const download=await downloadPromise;
    const workbookPath=path.join(output,'tna-g11-report-viewer.xlsx');
    await download.saveAs(workbookPath);
    const workbook=XLSX.read(fs.readFileSync(workbookPath),{type:'buffer',cellFormula:true,cellStyles:true});
    assert.deepEqual(workbook.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes']);
    const activityRows=XLSX.utils.sheet_to_json(workbook.Sheets['Report Activities'],{header:1,raw:false});
    assert.equal(activityRows.length,stored.records[0].plan.tasks.length+1,'Excel report must contain every activity plus its header.');
    assert.ok(workbook.Sheets['Report Activities']['!cols'][1].wch>=40,'Excel report must retain a readable activity column width.');

    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const pdfPath=path.join(output,'tna-g11-report-viewer.pdf');
    await page.pdf({path:pdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const pdf=fs.readFileSync(pdfPath);
    assert.ok(pdf.subarray(0,5).toString()==='%PDF-','G11 browser print output must be a PDF.');
    const pageCount=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert.ok(pageCount>=2,`G11 full activity report should span multiple pages; received ${pageCount}.`);
    const pdfViewer=await context.newPage();
    await pdfViewer.goto(pathToFileURL(pdfPath).href,{waitUntil:'load'});
    await pdfViewer.waitForTimeout(1500);
    await pdfViewer.screenshot({path:path.join(output,'tna-g11-pdf-viewer-page-1.png')});
    const viewerState=await pdfViewer.evaluate(()=>({url:location.href,embeds:document.querySelectorAll('embed').length,bodyText:document.body?.innerText||''}));
    assert.ok(viewerState.url.startsWith('file:')||viewerState.embeds>0,'Chromium PDF viewer must open the generated file.');
    await pdfViewer.bringToFront();
    await pdfViewer.mouse.click(900,700);
    for(let index=1;index<pageCount;index++)await pdfViewer.keyboard.press('PageDown');
    await pdfViewer.waitForTimeout(1000);
    await pdfViewer.screenshot({path:path.join(output,'tna-g11-pdf-viewer-last-page.png')});
    await pdfViewer.close();
    assert.deepEqual(errors,[]);
    console.log(`TNA G11 browser artifacts passed: migrated reload, ${activityRows.length-1} Excel activities, ${pageCount}-page PDF opened in Chromium viewer, no horizontal clipping or page errors`);
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
