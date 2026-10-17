/** APP-05 real Chromium: local LC lifecycle and synthetic source evidence only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
class LCBrowserProof{
 async run(){
  const server=http.createServer((req,res)=>{
   const url=decodeURIComponent(new URL(req.url,'http://local').pathname);
   let file=path.resolve(root,'.'+url);
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript',
      '.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
    headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
   email:'synthetic-lc@vesaent.com',name:'SYNTHETIC LC QA',role:'admin',userKey:'synthetic-lc-vesaent-com',
   loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',e=>{if(!e.url().startsWith(host))external.push(e.url());});
  const act=async key=>page.locator('[data-action="'+key+'"]').first().click();
  const enter=async data=>{for(const [k,v] of Object.entries(data)){
   const node=page.locator('#lcDialog [name="'+k+'"]');
   if(!await node.count())throw Error('Missing LC field '+k);
   if(await node.evaluate(el=>el.tagName==='SELECT'))await node.selectOption(String(v));
   else await node.fill(String(v));
  }};
  const submit=async()=>{await page.locator('#lcDialog form button[type=submit]').click();
    await page.locator('#lcDialog[open]').waitFor({state:'hidden',timeout:8000});};
  const saved=async()=>page.evaluate(()=>{
   const k=Object.keys(localStorage).find(x=>x.startsWith('vesa.lc-payment.records.v1.'));
   return JSON.parse(localStorage.getItem(k)).records;
  });
  try{
   await page.goto(host+'/apps/lc-payment/',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action=new]').waitFor();
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   await act('new');
   await enter({lcType:'master',lcNo:'SYN-MASTER-LC-001',applicant:'SYNTHETIC BUYER',
     beneficiary:'SYNTHETIC FACTORY',issuingBank:'SYNTHETIC BANK A',
     advisingBank:'SYNTHETIC BANK B',currency:'USD',amount:'10000.00',
     openingDate:'2026-10-01',expiryDate:'2027-04-30',
     source:'SYNTHETIC SIGNED LC TERMS'});await submit();
   await act('events');await act('event');
   await enter({eventType:'bl',date:'2026-10-10',actor:'SYNTHETIC REVIEWER',
     source:'SYNTHETIC BL DOCUMENT'});await submit();
   await act('obligations');await act('add-obligation');
   await enter({direction:'payable',amount:'5000.00',currency:'USD',
     counterparty:'SYNTHETIC FACTORY',invoiceRef:'SYNTHETIC INVOICE',
     shipmentRef:'SYNTHETIC BL',source:'SYNTHETIC PAYABLE CONTRACT',
     startEvent:'bl',days:'60',inclusion:'no',convention:'calendar',
     termSource:'SYNTHETIC WRITTEN 60-DAY TERMS'});await submit();
   await act('obligations');
   assert.match(await page.locator('.lc-card').last().innerText(),/2026-12-09/);
   await act('amendments');await act('add-amendment');
   await enter({amountType:'increase',amount:'1000.00',date:'2026-10-14',
     actor:'SYNTHETIC COMMERCIAL',source:'SYNTHETIC LC AMENDMENT',
     status:'approved',approvedBy:'SYNTHETIC BANK',approvedOn:'2026-10-15',
     approvalEvidence:'SYNTHETIC BANK ACCEPTANCE'});await submit();
   await act('documents');await act('add-document');
   await enter({docName:'SYNTHETIC BL',docStatus:'discrepant',date:'2026-10-15',
     actor:'SYNTHETIC DOC TEAM',bankRef:'SYNTHETIC BANK REF',
     source:'SYNTHETIC BANK DISCREPANCY',discrepancy:'SYNTHETIC NAME DIFFERENCE'});
   const obValue=await page.locator('#lcDialog [name=linkedObligation] option').nth(1).getAttribute('value');
   await enter({linkedObligation:obValue,documentAmount:'5100.00',documentCurrency:'USD',
     amountSource:'SYNTHETIC INVOICE AMOUNT SOURCE'});await submit();
   await act('settlements');await act('add-settlement');
   const opts=page.locator('#lcDialog [name=obligation] option');
   assert.equal(await opts.count(),1);
   await enter({kind:'payment',amount:'1200.00',currency:'USD',
     date:'2026-10-17',reference:'SYNTHETIC BANK STATEMENT',
     actor:'SYNTHETIC FINANCE',source:'SYNTHETIC PAYMENT PROOF'});await submit();
   await act('add-settlement');
   await enter({kind:'credit-note',amount:'100.00',currency:'USD',
     date:'2026-10-18',reference:'SYNTHETIC CREDIT NOTE',
     actor:'SYNTHETIC FINANCE',source:'SYNTHETIC CREDIT PROOF'});await submit();
   await act('charges');await act('add-charge');
   await enter({amount:'25.00',currency:'USD',date:'2026-10-18',
     reference:'SYNTHETIC BANK FEE',actor:'SYNTHETIC FINANCE',
     source:'SYNTHETIC BANK CHARGE',note:'Not automatically netted'});await submit();
   await act('summary');
   const stats=await page.locator('.lc-grid').innerText();
   for(const x of ['11000.00','3700.00'])assert(stats.includes(x),'Expected financial total '+x);
   // The LC may consume only an explicitly reviewed PO reference JSON file.
   fs.mkdirSync(out,{recursive:true});
   const poRef={sourceApp:'VESA Purchase Order 360',recordType:'PurchaseOrder',
     recordId:'SYN-PO-ID',revisionId:'SYN-PO-REV-1',sourceDate:'2026-10-17',
     verifiedBy:'SYNTHETIC PO REVIEWER',verifiedAt:'2026-10-17',
     displaySnapshot:{poNo:'SYN-PO-01',buyer:'SYNTHETIC BUYER',factory:'SYNTHETIC FACTORY',
       currency:'USD',totalPieces:60,totalAmount:'165.00',sourceLines:[]}};
   const poPath=path.join(out,'lc-app05-reviewed-po.json');fs.writeFileSync(poPath,JSON.stringify(poRef));
   await act('import-po');await page.locator('#lcPoRefFile').setInputFiles(poPath);
   await page.locator('#lcDialog form[data-form=po-import]').waitFor();
   await enter({localReviewer:'SYNTHETIC LOCAL REVIEWER',localReviewedAt:'2026-10-17'});
   await page.locator('#lcDialog [name=confirm]').check();await submit();
   await act('save');
   assert.equal((await saved())[0].header.poReference.recordId,'SYN-PO-ID');
   assert.equal((await saved())[0].amendments[0].status,'approved');
   assert.equal((await saved())[0].documents[0].status,'discrepant');
   await act('reports');assert.match(await page.locator('.lc-report').innerText(),/DOCUMENT VALUE MISMATCH/);
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   assert.equal((await saved())[0].settlements.length,2);
   await act('reports');fs.mkdirSync(out,{recursive:true});
   const excelEvent=page.waitForEvent('download');await act('excel');
   const dl=await excelEvent,excelPath=path.join(out,'lc-app05-synthetic.xlsx');
   await dl.saveAs(excelPath);
   const wb=XLSX.read(fs.readFileSync(excelPath),{type:'buffer'});
   assert.deepEqual(wb.SheetNames,['LC Register','Amendments','Maturity Calendar',
     'Document Checklist','Payment Obligations','Settlement Ledger',
     'Overdue and Forecast','Bank Charges','Manual PO Reference']);
   assert.equal(wb.Sheets['LC Register'].B10.t,'n');
   assert.equal(wb.Sheets['LC Register'].B10.v,11000);
   assert.equal(wb.Sheets['Maturity Calendar'].H2.v,'2026-12-09');
   const pdf=path.join(out,'lc-app05-synthetic.pdf');
   await page.pdf({path:pdf,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdf).size>3500);
   const backupEvent=page.waitForEvent('download');await act('download');
   const portable=path.join(out,'lc-app05-synthetic.vesalc');
   await (await backupEvent).saveAs(portable);
   await act('home');await act('upload');
   await page.locator('#lcFile').setInputFiles(portable);
   await page.locator('#lcDialog[open]').waitFor();
   await page.locator('#lcClose').click();
   assert.equal((await saved()).length,2);
   const corrupted=path.join(out,'lc-app05-bad.vesalc');
   fs.writeFileSync(corrupted,fs.readFileSync(portable,'utf8').replace('"1200.00"','"9900.00"'));
   const before=JSON.stringify(await saved());
   await page.locator('#lcFile').setInputFiles(corrupted);
   await page.locator('#lcDialog[open]').waitFor();
   assert.match(await page.locator('#lcDialogBody').innerText(),/altered or unsupported/);
   await page.locator('#lcClose').click();
   assert.equal(JSON.stringify(await saved()),before);
   for(const width of [320,390,768,1280]){
    await page.setViewportSize({width,height:850});
    assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width+1,width+'px overflow');
   }
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(out,'lc-app05-mobile.png')});
   await page.setViewportSize({width:1280,height:900});
   for(const [lang,label] of [['en','Payment Obligations'],['bn','পেমেন্ট দায়'],
     ['hi','भुगतान दायित्व'],['ta','Payment Obligations']]){
    const state=JSON.stringify(await saved());
    await page.locator('[data-vesa-user]').click();
    const settings=page.locator('[data-vesa-settings]');
    await settings.locator('[data-pref-language]').selectOption(lang);
    await page.waitForFunction(x=>document.documentElement.lang===x,lang);
    await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
    assert.match(await page.locator('.lc-tabs').innerText(),new RegExp(label));
    assert.equal(JSON.stringify(await saved()),state);
   }
   await page.reload({waitUntil:'domcontentloaded'});await act('continue');
   assert.equal((await saved())[0].settlements.length,2);
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   console.log('LC-360 CHROMIUM PASS: source LC, dates/60d, bank amendment, disputed document, 2 settlements, separate bank charges, XLSX/PDF, local and backup restore, corrupt rejection, four languages and 320/390/768/1280.');
  }finally{await context.close();await browser.close();await new Promise(done=>server.close(done));}
 }
}
new LCBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});
