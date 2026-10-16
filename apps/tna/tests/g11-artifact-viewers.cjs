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
    const printedHeaders=await page.locator('.tna-report-master-table thead th').allTextContents();
    for(const header of ['Original baseline','Current target','Forecast','Actual','Depends on']){
      assert(printedHeaders.includes(header),'R01 print preview must retain source-backed column: '+header);
    }
    assert.equal(await page.locator('.tna-report-master-table tbody tr').count(),stored.records[0].plan.tasks.length,'Printable Master TNA must include every activity.');
    assert.ok(await page.locator('.tna-report-master-legend').isVisible(),'Print preview must explain unknown date values.');
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
    assert.deepEqual(workbook.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Master TNA']);
    const activityRows=XLSX.utils.sheet_to_json(workbook.Sheets['Report Activities'],{header:1,raw:false});
    assert.equal(activityRows.length,stored.records[0].plan.tasks.length+1,'Excel report must contain every activity plus its header.');
    assert.ok(workbook.Sheets['Report Activities']['!cols'][1].wch>=40,'Excel report must retain a readable activity column width.');
    const garmentRows=XLSX.utils.sheet_to_json(workbook.Sheets['Master TNA'],{header:1,raw:false});
    assert.equal(garmentRows.length,stored.records[0].plan.tasks.length+1,'R01 master worksheet must contain every task, not a truncated sample.');
    assert(garmentRows[0].includes('Predecessor refs'),'Master worksheet must include source-backed dependency column.');

    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const printLayout=await page.locator('.tna-report-master-table').evaluate(table=>{
      const parent=table.parentElement;
      return {tableWidth:table.getBoundingClientRect().width,containerWidth:parent.getBoundingClientRect().width,
        headerDisplay:getComputedStyle(table.tHead).display};
    });
    assert.ok(printLayout.tableWidth<=printLayout.containerWidth+1,'Printed Master TNA table must fit the page width.');
    assert.equal(printLayout.headerDisplay,'table-header-group','Master TNA headers must repeat on printed pages.');

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
    // Restore screen media before selecting a new report: print CSS hides inputs.
    await page.emulateMedia({media:'screen'});
    // R03 has a distinct departmental report; the same loaded legacy plan remains untouched.
    await page.locator('#tnaReportType').selectOption('R03');
    await page.locator('.tna-factory-daily-preview').waitFor();
    assert.equal(await page.locator('.tna-daily-report-table tbody tr').count(),stored.records[0].plan.tasks.length,
      'R03 must show every open task with missing-date facts, not invent deadlines.');
    assert.ok(await page.locator('.tna-daily-report-note').first().isVisible(),'The daily report must explain its as-of date.');
    const r03Table=await page.locator('.tna-daily-scroll').first().evaluate(element=>{
      return {container:element.clientWidth,scroll:element.scrollWidth};
    });
    assert(r03Table.scroll>=r03Table.container,'Wide daily follow-up tables must remain internally scrollable.');
    const dailyDownload=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const dailyArtifact=await dailyDownload;
    const dailyPath=path.join(output,'tna-r03-factory-daily-viewer.xlsx');
    await dailyArtifact.saveAs(dailyPath);
    const dailyWorkbook=XLSX.read(fs.readFileSync(dailyPath),{type:'buffer',cellStyles:true});
    assert.deepEqual(dailyWorkbook.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Factory Daily Action']);
    const dailyRows=XLSX.utils.sheet_to_json(dailyWorkbook.Sheets['Factory Daily Action'],{header:1,raw:false});
    assert.equal(dailyRows.length,stored.records[0].plan.tasks.length+1,'R03 workbook preserves all open activities.');
    assert(dailyRows[0].includes('Due finish')&&dailyRows[0].includes('Evidence refs'),'R03 must retain departmental evidence headings.');
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const dailyPrintGeometry=await page.locator('.tna-daily-report-table').first().evaluate(table=>({
      tableWidth:table.getBoundingClientRect().width,parentWidth:table.parentElement.getBoundingClientRect().width,
      headers:getComputedStyle(table.tHead).display
    }));
    assert(dailyPrintGeometry.tableWidth<=dailyPrintGeometry.parentWidth+1,'R03 printed daily table must fit page width.');
    assert.equal(dailyPrintGeometry.headers,'table-header-group','R03 print must repeat table headers.');
    const r03PdfPath=path.join(output,'tna-r03-daily-print-viewer.pdf');
    await page.pdf({path:r03PdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const dailyPdf=fs.readFileSync(r03PdfPath);
    assert.equal(dailyPdf.subarray(0,5).toString(),'%PDF-','R03 report must yield real browser print PDF.');
    const dailyPages=(dailyPdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert(dailyPages>=2,'R03 many-activity PDF must span multiple pages with repeatable headings.');
    const dailyViewer=await context.newPage();
    await dailyViewer.goto(pathToFileURL(r03PdfPath).href,{waitUntil:'load'});
    await dailyViewer.screenshot({path:path.join(output,'tna-r03-factory-daily-print.png')});
    const opened=await dailyViewer.evaluate(()=>location.href.startsWith('file:')||document.querySelectorAll('embed').length>0);
    assert(opened,'Chromium viewer must open the R03 multi-page PDF.');
    await dailyViewer.close();
    console.log('TNA R03 Chromium daily report passed: group rows, real Excel, printable PDF, no clipping.');
    // Browser R02 proof: download bytes must contain only vetted buyer milestones.
    // This is an explicit local preview, NOT authorization to send to any buyer.
    await page.emulateMedia({media:'screen'});
    await page.locator('#tnaReportType').selectOption('R02');
    await page.locator('.tna-buyer-report').waitFor();
    const buyerHeaders=await page.locator('.tna-buyer-milestone-table thead th').allTextContents();
    for(const heading of ['Buyer milestone','Current target','Forecast','Buyer response','Target verification']){
      assert(buyerHeaders.includes(heading),'R02 buyer report must identify '+heading);
    }
    const buyerRowCount=await page.locator('.tna-buyer-milestone-table tbody tr').count();
    assert(buyerRowCount>10&&buyerRowCount<stored.records[0].plan.tasks.length,
      'R02 must expose a curated, source-backed buyer milestone subset, not internal operations.');
    assert.ok(await page.locator('.tna-buyer-review-note').isVisible(),
      'Manual recipient review warning is mandatory on buyer print.');
    const buyerPreview=await page.locator('.tna-report-preview').innerText();
    assert(!buyerPreview.includes('Synthetic Migration Factory'),
      'Buyer report must not display source factory identity.');
    assert(buyerPreview.includes('Not included in buyer report'),
      'R02 order summary must explain omission of factory data.');
    const buyerDataPromise=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const buyerData=await buyerDataPromise;
    const buyerJsonPath=path.join(output,'tna-r02-buyer-milestones-viewer.json');
    await buyerData.saveAs(buyerJsonPath);
    const buyerModel=JSON.parse(fs.readFileSync(buyerJsonPath,'utf8'));
    assert.equal(buyerModel.buyerTna.schema,'VESA-TNA-BUYER-1');
    assert.equal(buyerModel.source.recordId,null,'Buyer JSON must not disclose local record UUID.');
    assert.equal(buyerModel.tasks.length,buyerRowCount);
    assert(!JSON.stringify(buyerModel).includes('Synthetic Migration Factory'),
      'Buyer report data download cannot bypass the privacy projection.');
    const buyerExcelPromise=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const buyerExcel=await buyerExcelPromise;
    const buyerXlsxPath=path.join(output,'tna-r02-buyer-milestones-viewer.xlsx');
    await buyerExcel.saveAs(buyerXlsxPath);
    const buyerWorkbook=XLSX.read(fs.readFileSync(buyerXlsxPath),{type:'buffer',cellStyles:true});
    assert.deepEqual(buyerWorkbook.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Report Notes','Buyer Milestones'],
      'R02 downloaded workbook must contain only the four sanitized common sheets and buyer milestones.');
    const buyerRows=XLSX.utils.sheet_to_json(buyerWorkbook.Sheets['Buyer Milestones'],{header:1,raw:false});
    assert.equal(buyerRows.length,buyerRowCount+1);
    assert(!JSON.stringify(buyerWorkbook.Sheets).includes('Synthetic Migration Factory'),
      'Buyer XLSX download cannot disclose factory identity.');
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const buyerPrintLayout=await page.locator('.tna-buyer-milestone-table').evaluate(table=>({
      tableWidth:table.getBoundingClientRect().width,
      containerWidth:table.parentElement.getBoundingClientRect().width,
      headers:getComputedStyle(table.tHead).display
    }));
    assert(buyerPrintLayout.tableWidth<=buyerPrintLayout.containerWidth+1,
      'R02 print must fit the page container.');
    assert.equal(buyerPrintLayout.headers,'table-header-group',
      'Buyer milestone headers must repeat when printing long garment TNAs.');
    const buyerPdfPath=path.join(output,'tna-r02-buyer-milestones-viewer.pdf');
    await page.pdf({path:buyerPdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const buyerPdf=fs.readFileSync(buyerPdfPath);
    assert.equal(buyerPdf.subarray(0,5).toString(),'%PDF-','R02 must generate real Chromium PDF bytes.');
    const buyerPages=(buyerPdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert(buyerPages>=1,'R02 PDF needs at least one actual printable page.');
    const buyerViewer=await context.newPage();
    await buyerViewer.goto(pathToFileURL(buyerPdfPath).href,{waitUntil:'load'});
    await buyerViewer.screenshot({path:path.join(output,'tna-r02-buyer-pdf-preview.png')});
    const pdfOpened=await buyerViewer.evaluate(()=>location.href.startsWith('file:')||document.querySelectorAll('embed').length>0);
    assert(pdfOpened,'Chromium PDF viewer must open the real buyer-safe PDF.');
    await buyerViewer.close();
    await page.emulateMedia({media:'screen'});
    console.log('TNA R02 Chromium buyer report PASS: sanitized JSON/Excel, curated milestones, source privacy, buyer PDF '+buyerPages+' page(s), no clipping.');


    // R05 source-absent proof: an old migrated TNA must NOT invent any weekly due date.
    await page.locator('#tnaReportType').selectOption('R05');
    await page.locator('.tna-weekly-report').waitFor();
    assert.ok(await page.locator('.tna-weekly-restriction').isVisible(),
      'Internal report must warn that it is not recipient-authorized.');
    assert.equal(await page.locator('.tna-weekly-section').count(),8,
      'Weekly print must show the entire named weekly action group taxonomy.');
    const openUndatedRows=await page.locator('.tna-weekly-section').last().locator('tbody tr').count();
    assert.equal(openUndatedRows,stored.records[0].plan.tasks.length,
      'Old TNA with no dates must show every open task needing a date, never fake overdue.');
    const firstWeeklyGroup=await page.locator('.tna-weekly-section').nth(2).innerText();
    assert(firstWeeklyGroup.includes('(0)'),'R05 must not invent overdue activities for an undated saved record.');
    const weeklyDataPromise=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const weeklyData=await weeklyDataPromise;
    const weeklyJsonPath=path.join(output,'tna-r05-weekly-viewer.json');
    await weeklyData.saveAs(weeklyJsonPath);
    const weeklyModel=JSON.parse(fs.readFileSync(weeklyJsonPath,'utf8'));
    assert.equal(weeklyModel.weeklyTna.schema,'VESA-TNA-WEEKLY-1');
    assert.equal(weeklyModel.weeklyTna.validity,'valid');
    assert.equal(weeklyModel.weeklyTna.counts.missed,0);
    assert(weeklyModel.audience.includes('Local merchandiser'),'R05 cannot advertise buyer/factory recipient authorization.');
    const weeklyExcelPromise=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const weeklyExcel=await weeklyExcelPromise;
    const weeklyXlsxPath=path.join(output,'tna-r05-weekly-viewer.xlsx');
    await weeklyExcel.saveAs(weeklyXlsxPath);
    const weeklyWorkbook=XLSX.read(fs.readFileSync(weeklyXlsxPath),{type:'buffer',cellStyles:true});
    assert.deepEqual(weeklyWorkbook.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Report Notes','Weekly Actions']);
    const weeklySheetRows=XLSX.utils.sheet_to_json(weeklyWorkbook.Sheets['Weekly Actions'],{header:1,raw:false});
    assert.equal(weeklySheetRows.length,stored.records[0].plan.tasks.length+1,
      'Weekly worksheet must include all undated open actions and meaningful headings.');
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const weeklyGeometry=await page.locator('.tna-weekly-table').first().evaluate(table=>({
      actual:table.getBoundingClientRect().width,available:table.parentElement.getBoundingClientRect().width,
      display:getComputedStyle(table.tHead).display
    }));
    assert(weeklyGeometry.actual<=weeklyGeometry.available+1,'Weekly report must fit printable container.');
    assert.equal(weeklyGeometry.display,'table-header-group',
      'Long weekly reports must repeat table headers on printed pages.');
    const weeklyPdfPath=path.join(output,'tna-r05-weekly-viewer.pdf');
    await page.pdf({path:weeklyPdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const weeklyPdf=fs.readFileSync(weeklyPdfPath);
    assert.equal(weeklyPdf.subarray(0,5).toString(),'%PDF-');
    const weeklyPages=(weeklyPdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert(weeklyPages>=2,'All undated activities in the R05 PDF should span multiple printable pages.');
    const weeklyViewer=await context.newPage();
    await weeklyViewer.goto(pathToFileURL(weeklyPdfPath).href,{waitUntil:'load'});
    await weeklyViewer.screenshot({path:path.join(output,'tna-r05-weekly-pdf-preview.png')});
    assert(await weeklyViewer.evaluate(()=>location.href.startsWith('file:')),
      'Real Chromium PDF viewer must open the weekly print file.');
    await weeklyViewer.close();
    await page.emulateMedia({media:'screen'});
    // Probe explicit SOURCE-ENTERED dates in a copied synthetic browser plan.
    // Do not change local storage or active page state: this test proves that
    // read-only report projection is pure and preserves the migrated saved copy.
    const regroup=await page.evaluate(userKey=>{
      const key='vesa.tna360.records.'+userKey;
      const current=JSON.parse(localStorage.getItem(key)).records[0].plan;
      const unchanged=JSON.stringify(current),plan=JSON.parse(unchanged);
      const today=new Date();
      const day=Math.floor(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate())/86400000);
      const iso=offset=>new Date((day+offset)*86400000).toISOString().slice(0,10);
      const nextMonday=7-((today.getUTCDay()+6)%7);
      plan.tasks[0].status='completed';plan.tasks[0].dates.actualFinish=iso(0);
      plan.tasks[1].dates.currentTargetFinish=iso(-1);
      plan.tasks[2].dates.currentTargetFinish=iso(nextMonday);
      plan.tasks[3].status='awaiting-approval';plan.tasks[3].taskKind='gate';
      plan.tasks[3].ownerParty='buyer';
      plan.tasks[4].recoveryAction='Synthetic proposal — not buyer agreed';
      const projection=VesaTnaReports.buildReportModel(plan,{
        reportId:'R05',language:'en',timezone:'UTC',generatedAt:new Date().toISOString()
      }).weeklyTna;
      if(JSON.stringify(current)!==unchanged)throw new Error('Browser fixture mutated saved plan');
      return projection;
    },session.userKey);
    assert(regroup.groups.completedThisWeek.some(row=>row.ref===stored.records[0].plan.tasks[0].templateRef),
      'Actual finish today must appear in this-week completed section.');
    assert(regroup.groups.missed.some(row=>row.ref===stored.records[0].plan.tasks[1].templateRef),
      'Recorded yesterday-due activity must appear as missed.');
    assert(regroup.groups.dueNextWeek.some(row=>row.ref===stored.records[0].plan.tasks[2].templateRef),
      'Recorded next-Monday activity must appear in next-week group.');
    assert(regroup.groups.approvalPending.some(row=>row.ref===stored.records[0].plan.tasks[3].templateRef));
    assert(regroup.groups.recordedRecovery.some(row=>row.ref===stored.records[0].plan.tasks[4].templateRef));
    assert.deepEqual(regroup.verifiedRecoveryAgreements,[]);
    console.log('TNA R05 Chromium weekly report PASS: source-free Needs Date, real Excel/JSON, printable '+weeklyPages+'-page PDF, browser-cloned completed/overdue/next-week/pending/recovery source cases, no clipping.');


    // R06 uses the same migrated local order without inventing a baseline or
    // waiting party. Verify actual browser JSON/Excel/PDF bytes and print fit.
    await page.locator('#tnaReportType').selectOption('R06');
    await page.locator('.tna-delay-report').waitFor();
    assert.ok(await page.locator('.tna-delay-restriction').isVisible());
    assert.equal(await page.locator('.tna-delay-table').first().locator('tbody tr').count(),
      stored.records[0].plan.tasks.length);
    const r06JsonEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const r06Json=await r06JsonEvent,r06JsonPath=path.join(output,'tna-r06-delay-recovery-viewer.json');
    await r06Json.saveAs(r06JsonPath);
    const r06Model=JSON.parse(fs.readFileSync(r06JsonPath,'utf8'));
    assert.equal(r06Model.delayRecovery.schema,'VESA-TNA-DELAY-1');
    assert.equal(r06Model.delayRecovery.validity,'valid');
    assert.equal(r06Model.delayRecovery.counts.missingOriginal,stored.records[0].plan.tasks.length);
    assert.equal(r06Model.delayRecovery.counts.positiveVariance,0);
    assert.deepEqual(r06Model.delayRecovery.verifiedExternalAgreements,[]);
    const r06ExcelEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const r06Excel=await r06ExcelEvent,r06ExcelPath=path.join(output,'tna-r06-delay-recovery-viewer.xlsx');
    await r06Excel.saveAs(r06ExcelPath);
    const r06Workbook=XLSX.read(fs.readFileSync(r06ExcelPath),{type:'buffer'});
    assert.deepEqual(r06Workbook.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Report Notes','Delay & Recovery','Recovery Options']);
    assert.equal(XLSX.utils.sheet_to_json(r06Workbook.Sheets['Delay & Recovery'],{header:1,raw:false}).length,
      stored.records[0].plan.tasks.length+1);
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const r06Layout=await page.locator('.tna-delay-table').first().evaluate(table=>({
      actual:table.getBoundingClientRect().width,
      available:table.parentElement.getBoundingClientRect().width,
      headings:getComputedStyle(table.tHead).display
    }));
    assert(r06Layout.actual<=r06Layout.available+1,'R06 report print width must fit.');
    assert.equal(r06Layout.headings,'table-header-group','R06 print must repeat table headings.');
    const r06PdfPath=path.join(output,'tna-r06-delay-recovery-viewer.pdf');
    await page.pdf({path:r06PdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const r06Pdf=fs.readFileSync(r06PdfPath);
    assert.equal(r06Pdf.subarray(0,5).toString(),'%PDF-');
    const r06Pages=(r06Pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert(r06Pages>=2,'All R06 source rows must print across actual PDF pages.');
    const r06Viewer=await context.newPage();
    await r06Viewer.goto(pathToFileURL(r06PdfPath).href,{waitUntil:'load'});
    assert(await r06Viewer.evaluate(()=>location.href.startsWith('file:')));
    await r06Viewer.screenshot({path:path.join(output,'tna-r06-delay-recovery-pdf-preview.png')});
    await r06Viewer.close();
    await page.emulateMedia({media:'screen'});
    const unchangedR06=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
      'vesa.tna360.records.'+session.userKey);
    assert.equal(JSON.stringify(unchangedR06),JSON.stringify(stored.records[0].plan),
      'R06 preview and export must not modify the reopened TNA record.');
    console.log('TNA R06 browser PASS: genuine local JSON/Excel, read-only migrated order, '+r06Pages+'-page PDF, repeating table headings, no clipping.');


    // R07 real Chromium proof on an unchanged migrated TNA. Capacity-only data
    // must not become production or a fabricated throughput/ship-date promise.
    await page.locator('#tnaReportType').selectOption('R07');
    await page.locator('.tna-production-report').waitFor();
    assert(await page.locator('#tnaR07Controls').isVisible());
    assert.equal(await page.locator('.tna-production-table').first().locator('tbody tr').count(),4);
    const prodDownload=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const prodJson=await prodDownload,prodJsonPath=path.join(output,'tna-r07-production.json');
    await prodJson.saveAs(prodJsonPath);
    const prodModel=JSON.parse(fs.readFileSync(prodJsonPath,'utf8'));
    assert.equal(prodModel.productionStatus.schema,'VESA-TNA-PRODUCTION-1');
    assert.equal(prodModel.productionStatus.counts.withRecordedOutput,0);
    assert(prodModel.productionStatus.stageRows.every(row=>row.completed===null&&row.projectedFinish===null));
    const prodExcelEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const prodExcel=await prodExcelEvent,prodXlsx=path.join(output,'tna-r07-production.xlsx');
    await prodExcel.saveAs(prodXlsx);
    const prodWorkbook=XLSX.read(fs.readFileSync(prodXlsx),{type:'buffer'});
    assert.deepEqual(prodWorkbook.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Report Notes','Production Stages','Recorded Operations']);
    assert.equal(XLSX.utils.sheet_to_json(prodWorkbook.Sheets['Production Stages'],{header:1,raw:false}).length,5);
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const prodLayout=await page.locator('.tna-production-table').first().evaluate(table=>({
      width:table.getBoundingClientRect().width,
      holder:table.parentElement.getBoundingClientRect().width,
      headers:getComputedStyle(table.tHead).display
    }));
    assert(prodLayout.width<=prodLayout.holder+1,'R07 printed production table must fit.');
    assert.equal(prodLayout.headers,'table-header-group');
    const prodPdfPath=path.join(output,'tna-r07-production.pdf');
    await page.pdf({path:prodPdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    assert.equal(fs.readFileSync(prodPdfPath).subarray(0,5).toString(),'%PDF-');
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const prodViewer=await context.newPage();
    await prodViewer.goto(pathToFileURL(prodPdfPath).href,{waitUntil:'load'});
    assert(await prodViewer.evaluate(()=>location.href.startsWith('file:')));
    await prodViewer.screenshot({path:path.join(output,'tna-r07-production-pdf-viewer.png')});
    await prodViewer.close();
    await page.emulateMedia({media:'screen'});
    await page.locator('#tnaR07AudienceMode').selectOption('buyer');
    assert((await page.locator('.tna-production-report').innerText()).includes('withheld'));
    const buyerBlockedDownload=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const buyerBlockedFile=await buyerBlockedDownload;
    const buyerBlockedPath=path.join(output,'tna-r07-buyer-blocked.json');
    await buyerBlockedFile.saveAs(buyerBlockedPath);
    assert.equal(JSON.parse(fs.readFileSync(buyerBlockedPath,'utf8')).productionStatus.stageRows.length,0);
    await page.locator('#tnaR07Reviewed').check();
    await page.locator('#tnaR07Source').fill('Synthetic manual recipient review');
    const buyerApprovedDownload=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const approvedBuyerFile=await buyerApprovedDownload;
    const approvedBuyerPath=path.join(output,'tna-r07-buyer-reviewed.json');
    await approvedBuyerFile.saveAs(approvedBuyerPath);
    const reviewedModel=JSON.parse(fs.readFileSync(approvedBuyerPath,'utf8'));
    assert.equal(reviewedModel.productionStatus.stageRows.length,4);
    assert.equal(reviewedModel.tasks.length,0);
    assert.equal(reviewedModel.productionStatus.operationRows.length,0);
    assert(!JSON.stringify(reviewedModel).includes('Synthetic Migration Factory'));
    const buyerExcelEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const buyerExcelArtifact=await buyerExcelEvent;
    const buyerExcelPath=path.join(output,'tna-r07-buyer-reviewed.xlsx');
    await buyerExcelArtifact.saveAs(buyerExcelPath);
    const r07BuyerWorkbook=XLSX.read(fs.readFileSync(buyerExcelPath),{type:'buffer'});
    assert.deepEqual(r07BuyerWorkbook.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Report Notes','Production Stages']);
    assert(!JSON.stringify(r07BuyerWorkbook.Sheets).includes('Synthetic Migration Factory'));
    await page.setViewportSize({width:390,height:844});
    const prodMobile=await page.evaluate(()=>({
      width:document.documentElement.scrollWidth,screen:document.documentElement.clientWidth,
      holder:document.querySelector('.tna-production-scroll')?.clientWidth,
      scroll:document.querySelector('.tna-production-scroll')?.scrollWidth
    }));
    assert(prodMobile.width<=prodMobile.screen+1,'R07 mobile must not cause document overflow.');
    assert(prodMobile.scroll>=prodMobile.holder);
    await page.setViewportSize({width:1280,height:900});
    const browserSource=await page.evaluate(()=>{
      const original=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;
      const text=JSON.stringify(original),copy=JSON.parse(text);
      copy.operations=[{operationId:'PRIVATE-OP',type:'cut',lotId:'PRIVATE-LOT',
        qtyInput:100,qtyCompleted:55,qtyRejected:5,qtyReworked:0,qtyWip:20,
        unit:'pcs',dailyActuals:[]}];
      const model=VesaTnaReports.buildReportModel(copy,{reportId:'R07',
        language:'en',generatedAt:'2026-10-16T05:00:00Z',timezone:'UTC',
        audienceMode:'buyer',recipientReviewed:true,authorizationSourceRef:'synthetic user reviewed'});
      if(JSON.stringify(original)!==text)throw Error('Saved TNA changed by report probe');
      return model;
    });
    assert.equal(browserSource.productionStatus.stageRows[0].completed,55);
    assert(!JSON.stringify(browserSource).includes('PRIVATE-OP'));
    assert(!JSON.stringify(browserSource).includes('PRIVATE-LOT'));
    const postR07=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
      'vesa.tna360.records.'+session.userKey);
    assert.equal(JSON.stringify(postR07),JSON.stringify(stored.records[0].plan));
    console.log('TNA R07 Chromium PASS: JSON/XLSX/PDF, buyer review + blocked preview, 390px, source projection, unchanged local record.');


    // R08 internal source register on the unchanged migrated browser record:
    // missing supplier/LC inputs remain visibly unknown; do not invent banks.
    await page.locator('#tnaReportType').selectOption('R08');
    await page.locator('.tna-material-report').waitFor();
    assert(await page.locator('.tna-material-notice').isVisible());
    assert.equal(await page.locator('.tna-material-table').first().locator('tbody tr').count(),1);
    const materialDownload=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const materialJson=await materialDownload,materialJsonPath=path.join(output,'tna-r08-material-lc.json');
    await materialJson.saveAs(materialJsonPath);
    const materialModel=JSON.parse(fs.readFileSync(materialJsonPath,'utf8'));
    assert.equal(materialModel.materialLc.schema,'VESA-TNA-MATERIAL-LC-1');
    assert.equal(materialModel.materialLc.materials.length,0);
    assert.equal(materialModel.materialLc.masterLc.bankAuthenticated,false);
    const materialExcelEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const materialExcel=await materialExcelEvent,materialExcelPath=path.join(output,'tna-r08-material-lc.xlsx');
    await materialExcel.saveAs(materialExcelPath);
    const materialWb=XLSX.read(fs.readFileSync(materialExcelPath),{type:'buffer'});
    assert.deepEqual(materialWb.SheetNames,
      ['Report Summary','Order Summary','Report Activities','Report Notes','Material & LC','LC Milestones']);
    assert.equal(materialWb.Sheets['Material & LC'].A2.v,'No fabric/trims source records entered');
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const materialLayout=await page.locator('.tna-material-table').first().evaluate(table=>({
      width:table.getBoundingClientRect().width,
      container:table.parentElement.getBoundingClientRect().width,
      heading:getComputedStyle(table.tHead).display
    }));
    assert(materialLayout.width<=materialLayout.container+1,'R08 printed table must fit.');
    assert.equal(materialLayout.heading,'table-header-group');
    const materialPdfPath=path.join(output,'tna-r08-material-lc.pdf');
    await page.pdf({path:materialPdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    assert.equal(fs.readFileSync(materialPdfPath).subarray(0,5).toString(),'%PDF-');
    const materialViewer=await context.newPage();
    await materialViewer.goto(pathToFileURL(materialPdfPath).href,{waitUntil:'load'});
    assert(await materialViewer.evaluate(()=>location.href.startsWith('file:')));
    await materialViewer.screenshot({path:path.join(output,'tna-r08-material-lc-pdf-viewer.png')});
    await materialViewer.close();
    await page.emulateMedia({media:'screen'});
    await page.setViewportSize({width:390,height:844});
    const materialMobile=await page.evaluate(()=>({
      documentWidth:document.documentElement.scrollWidth,
      viewportWidth:document.documentElement.clientWidth,
      tableWidth:document.querySelector('.tna-material-scroll')?.scrollWidth,
      holderWidth:document.querySelector('.tna-material-scroll')?.clientWidth
    }));
    assert(materialMobile.documentWidth<=materialMobile.viewportWidth+1);
    assert(materialMobile.tableWidth>=materialMobile.holderWidth);
    await page.setViewportSize({width:1280,height:900});
    const syntheticMaterial=await page.evaluate(()=>{
      const original=JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan;
      const unchanged=JSON.stringify(original),clone=JSON.parse(unchanged);
      clone.commitments.masterLcOpenedOn='2026-10-10';
      clone.materials=[{materialId:'SYN-FAB',category:'fabric',supplier:'=PRIVATE-SUPPLIER',
        requiredQty:200,unit:'kg',bookingDate:'2026-10-09',b2bLcApplicationDate:'2026-10-11',
        b2bLcOpenDate:null,inHouseDate:'2026-10-12',shortageQty:5}];
      const projected=VesaTnaReports.buildReportModel(clone,{reportId:'R08',
        language:'en',generatedAt:'2026-10-16T05:00:00Z',timezone:'UTC'});
      const denied=VesaTnaReports.buildReportModel(clone,{reportId:'R08',
        language:'en',generatedAt:'2026-10-16T05:00:00Z',timezone:'UTC',audienceMode:'buyer'});
      if(JSON.stringify(original)!==unchanged)throw Error('R08 material probe changed local record.');
      return {projected,denied};
    });
    assert.equal(syntheticMaterial.projected.materialLc.materials[0].b2bOpenDate,null);
    assert.equal(syntheticMaterial.projected.materialLc.materials[0].qcAccepted,false);
    assert.equal(syntheticMaterial.denied.materialLc.validity,'restricted');
    assert(!JSON.stringify(syntheticMaterial.denied).includes('SYN-FAB'));
    const materialAfter=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
      'vesa.tna360.records.'+session.userKey);
    assert.equal(JSON.stringify(materialAfter),JSON.stringify(stored.records[0].plan));
    console.log('TNA R08 Chromium PASS: local blank-source, JSON/XLSX/PDF, typed LC, external blocked, mobile 390px, no data mutation.');


    // R09 local shipment readiness stays read-only on reopened migrated plans.
    // No lots / inspection references means no presumed release or shipment.
    await page.locator('#tnaReportType').selectOption('R09');
    await page.locator('.tna-shipment-report').waitFor();
    assert(await page.locator('.tna-shipment-notice').isVisible());
    assert.equal(await page.locator('.tna-shipment-lots tbody tr').count(),1);
    const r09Download=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const r09Json=await r09Download,r09Path=path.join(output,'tna-r09-shipment.json');
    await r09Json.saveAs(r09Path);
    const r09Model=JSON.parse(fs.readFileSync(r09Path,'utf8'));
    assert.equal(r09Model.shipmentReadiness.schema,'VESA-TNA-SHIPMENT-1');
    assert.equal(r09Model.shipmentReadiness.lots.length,0);
    assert.equal(r09Model.shipmentReadiness.totals,null);
    assert.equal(r09Model.shipmentReadiness.releaseAuthorized,false);
    assert(r09Model.shipmentReadiness.warnings.includes(r09Model.shipmentReadiness.labels.noLots));
    const r09ExcelEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const r09Excel=await r09ExcelEvent,r09ExcelPath=path.join(output,'tna-r09-shipment.xlsx');
    await r09Excel.saveAs(r09ExcelPath);
    const r09Wb=XLSX.read(fs.readFileSync(r09ExcelPath),{type:'buffer'});
    assert.deepEqual(r09Wb.SheetNames,['Report Summary','Order Summary',
      'Report Activities','Report Notes','Shipment Lots','Shipment Dates',
      'Shipment Gates','Shipment PO Allocation']);
    assert.equal(r09Wb.Sheets['Shipment Lots'].A2.v,'No shipment lots recorded');
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const r09Layout=await page.locator('.tna-shipment-lots').evaluate(table=>({
      width:table.getBoundingClientRect().width,
      holder:table.parentElement.getBoundingClientRect().width,
      repeatingHeader:getComputedStyle(table.tHead).display
    }));
    assert(r09Layout.width<=r09Layout.holder+1,'R09 print table must fit page width.');
    assert.equal(r09Layout.repeatingHeader,'table-header-group');
    const r09PdfPath=path.join(output,'tna-r09-shipment.pdf');
    await page.pdf({path:r09PdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    const r09Pdf=fs.readFileSync(r09PdfPath);
    assert.equal(r09Pdf.subarray(0,5).toString(),'%PDF-');
    const r09Viewer=await context.newPage();
    await r09Viewer.goto(pathToFileURL(r09PdfPath).href,{waitUntil:'load'});
    assert(await r09Viewer.evaluate(()=>location.href.startsWith('file:')));
    await r09Viewer.screenshot({path:path.join(output,'tna-r09-shipment-pdf-viewer.png')});
    await r09Viewer.close();
    await page.emulateMedia({media:'screen'});
    await page.setViewportSize({width:390,height:844});
    const r09Mobile=await page.evaluate(()=>({
      doc:document.documentElement.scrollWidth,screen:document.documentElement.clientWidth,
      table:document.querySelector('.tna-shipment-scroll')?.scrollWidth,
      holder:document.querySelector('.tna-shipment-scroll')?.clientWidth
    }));
    assert(r09Mobile.doc<=r09Mobile.screen+1);
    assert(r09Mobile.table>=r09Mobile.holder);
    await page.setViewportSize({width:1280,height:900});
    // Direct browser runtime source copy tests a real entered lot; never save.
    const r09Browser=await page.evaluate(()=>{
      const key='vesa.tna360.records.qa-vesaent-com';
      const original=JSON.parse(localStorage.getItem(key)).records[0].plan;
      const before=JSON.stringify(original),p=JSON.parse(before);
      p.shipmentLots=[{lotId:'synth-ship',lotReference:'R09-ONLY-LOCAL',
        plannedQty:2400,packedQty:1800,passedQty:1700,shippedQty:100,
        poAllocation:[{poNumber:'PO-G11-VIEW',qty:2400}],
        bookingRef:'UNVERIFIED BOOKING',inspectionRef:'PRIVATE-LOCAL-AQL'}];
      const options={reportId:'R09',language:'en',timezone:'Asia/Dhaka',
        generatedAt:'2026-10-16T05:00:00Z',asOfDate:'2026-10-16'};
      const report=VesaTnaReports.buildReportModel(p,options);
      const blocked=VesaTnaReports.buildReportModel(p,{...options,audienceMode:'buyer'});
      if(JSON.stringify(original)!==before)throw Error('R09 modified local order.');
      return {report,blocked};
    });
    assert.equal(r09Browser.report.shipmentReadiness.totals.shipped,100);
    assert.equal(r09Browser.report.shipmentReadiness.releaseAuthorized,false);
    assert(r09Browser.report.shipmentReadiness.errors.some(e=>e.includes('final inspection pass')));
    assert.equal(r09Browser.blocked.shipmentReadiness.validity,'restricted');
    assert(!JSON.stringify(r09Browser.blocked).includes('R09-ONLY-LOCAL'));
    const r09Unchanged=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
      'vesa.tna360.records.'+session.userKey);
    assert.equal(JSON.stringify(r09Unchanged),JSON.stringify(stored.records[0].plan));
    console.log('TNA R09 Chromium PASS: internal empty-source, actual JSON/XLSX/PDF viewer, mobile, unverified lot dispatch gated, buyer blocked, saved copy immutable.');


    // R10 previews only saved compatible orders from this user profile; raw
    // practice, other local user keys and unconfirmed CPM are never promoted.
    await page.locator('#tnaReportType').selectOption('R10');
    await page.locator('.tna-portfolio-report').waitFor();
    assert(await page.locator('#tnaR10Controls').isVisible());
    assert.equal(await page.locator('.tna-portfolio-orders tbody tr').count(),1,
      'Current saved local order is visible without creating synthetic extras.');
    const portfolioSavedBefore=await page.evaluate(k=>localStorage.getItem(k),
      'vesa.tna360.records.'+session.userKey);
    // Seed synthetic saved records in the SAME user key; restore at test end.
    await page.evaluate(k=>{
      const another=VesaTnaDomain.createPlan({
        templateId:'knit',buyerName:'Synthetic Buyer Second',factoryName:'Synthetic Factory Second',
        styleNo:'SYNTHETIC-PORTFOLIO-2',poNumber:'SYN-PO-2',totalQty:500,
        orderConfirmedOn:'2026-10-01',buyerRequiredExFactory:'2026-10-30'
      },{ownerUserId:'qa@vesaent.com'});
      VesaTnaStorage.savePlan(another,k);
      const different=VesaTnaDomain.createPlan({
        templateId:'knit',buyerName:'PRIVATE DIFFERENT OWNER',
        factoryName:'PRIVATE FACTORY',styleNo:'PRIVATE-OTHER-STYLE',
        poNumber:'PRIVATE-OTHER-PO',totalQty:120
      },{ownerUserId:'unrelated-owner'});
      VesaTnaStorage.savePlan(different,k);
      const anotherProfile=VesaTnaDomain.createPlan({
        templateId:'knit',buyerName:'PRIVATE OTHER LOGIN',
        factoryName:'PRIVATE FACTORY',styleNo:'PRIVATE-LOGIN-STYLE',
        poNumber:'PRIVATE-LOGIN-PO',totalQty:120
      },{ownerUserId:'qa@vesaent.com'});
      VesaTnaStorage.savePlan(anotherProfile,'another-user-profile');
    },session.userKey);
    // The existing report model rereads the same-profile saved snapshot on each action.
    await page.locator('[data-report-action="preview"]').click();
    assert.equal(await page.locator('.tna-portfolio-orders tbody tr').count(),2,
      'R10 includes two saved orders, excludes a different local owner.');
    const r10Download=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const r10Json=await r10Download,r10JsonPath=path.join(output,'tna-r10-portfolio.json');
    await r10Json.saveAs(r10JsonPath);
    const r10Model=JSON.parse(fs.readFileSync(r10JsonPath,'utf8'));
    assert.equal(r10Model.portfolio.schema,'VESA-TNA-PORTFOLIO-1');
    assert.equal(r10Model.portfolio.orders.length,2);
    assert.equal(r10Model.portfolio.counts.excludedLocalRecords,1);
    assert.equal(r10Model.portfolio.counts.unverifiedCpm,2);
    assert(r10Model.portfolio.orders.every(x=>x.cpmForecast===null));
    assert(!JSON.stringify(r10Model).includes('PRIVATE DIFFERENT OWNER'));
    assert(!JSON.stringify(r10Model).includes('PRIVATE OTHER LOGIN'));
    const r10ExcelEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="excel"]').click();
    const r10Xlsx=await r10ExcelEvent,r10XlsxPath=path.join(output,'tna-r10-portfolio.xlsx');
    await r10Xlsx.saveAs(r10XlsxPath);
    const r10Book=XLSX.read(fs.readFileSync(r10XlsxPath),{type:'buffer'});
    assert.deepEqual(r10Book.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes',
      'Portfolio Orders','Portfolio PO','Portfolio Actions']);
    assert.equal(XLSX.utils.sheet_to_json(r10Book.Sheets['Portfolio Orders'],{header:1,raw:false}).length,3);
    assert(!JSON.stringify(r10Book.Sheets).includes('PRIVATE DIFFERENT OWNER'));
    await page.emulateMedia({media:'print'});
    await page.evaluate(()=>document.body.classList.add('tna-printing-report'));
    const r10Print=await page.locator('.tna-portfolio-orders').evaluate(table=>({
      width:table.getBoundingClientRect().width,
      holder:table.parentElement.getBoundingClientRect().width,
      heading:getComputedStyle(table.tHead).display
    }));
    assert(r10Print.width<=r10Print.holder+1,'R10 print must fit without clipping.');
    assert.equal(r10Print.heading,'table-header-group');
    const r10PdfPath=path.join(output,'tna-r10-portfolio.pdf');
    await page.pdf({path:r10PdfPath,printBackground:true,preferCSSPageSize:true,landscape:true});
    await page.evaluate(()=>document.body.classList.remove('tna-printing-report'));
    assert.equal(fs.readFileSync(r10PdfPath).subarray(0,5).toString(),'%PDF-');
    const r10Viewer=await context.newPage();
    await r10Viewer.goto(pathToFileURL(r10PdfPath).href,{waitUntil:'load'});
    assert(await r10Viewer.evaluate(()=>location.href.startsWith('file:')));
    await r10Viewer.screenshot({path:path.join(output,'tna-r10-portfolio-pdf-viewer.png')});
    await r10Viewer.close();
    await page.emulateMedia({media:'screen'});
    await page.setViewportSize({width:390,height:844});
    const r10Mobile=await page.evaluate(()=>({
      doc:document.documentElement.scrollWidth,
      viewport:document.documentElement.clientWidth,
      table:document.querySelector('.tna-portfolio-scroll')?.scrollWidth,
      container:document.querySelector('.tna-portfolio-scroll')?.clientWidth
    }));
    assert(r10Mobile.doc<=r10Mobile.viewport+1);
    assert(r10Mobile.table>=r10Mobile.container);
    await page.setViewportSize({width:1280,height:900});
    // Reopen the same VESA report dialog to populate all saved-order filter options.
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await openTools(page);
    await page.locator('[data-menu-action="Prepare Report"]').click();
    await page.locator('#tnaReportType').selectOption('R10');
    await page.locator('#tnaR10Buyer').selectOption('Synthetic Buyer Second');
    assert.equal(await page.locator('.tna-portfolio-orders tbody tr').count(),1);
    const r10FilterEvent=page.waitForEvent('download');
    await page.locator('[data-report-action="download"]').click();
    const filterDownload=await r10FilterEvent,filterPath=path.join(output,'tna-r10-portfolio-filter.json');
    await filterDownload.saveAs(filterPath);
    const filtered=JSON.parse(fs.readFileSync(filterPath,'utf8')).portfolio;
    assert.equal(filtered.counts.visibleOrders,1);
    assert.equal(filtered.orders[0].style,'SYNTHETIC-PORTFOLIO-2');
    // Restore the original real-browser synthetic local saved copy byte-for-byte.
    await page.evaluate(({key,text})=>localStorage.setItem(key,text),{
      key:'vesa.tna360.records.'+session.userKey,text:portfolioSavedBefore
    });
    const afterPortfolio=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].plan,
      'vesa.tna360.records.'+session.userKey);
    assert.equal(JSON.stringify(afterPortfolio),JSON.stringify(stored.records[0].plan));
    console.log('TNA R10 Chromium PASS: two same-owner local saved orders, other-owner and other-login segregation, filters, real typed XLSX/JSON/PDF viewer, print and 390px, restored source.');

    assert.deepEqual(errors,[]);
    console.log(`TNA G11 browser artifacts passed: migrated reload, ${activityRows.length-1} Excel activities, ${pageCount}-page PDF opened in Chromium viewer, no horizontal clipping or page errors`);
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
