/** APP-02 real Chromium finance workflow using synthetic written evidence only. */
'use strict';
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),XLSX=require('../../../js/vendor/xlsx.full.min.js');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
class CommissionBrowserProof{
 async run(){
  const server=http.createServer((req,res)=>{
   let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const host='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
    email:'synthetic@vesaent.com',name:'Synthetic Reviewer',role:'admin',userKey:'synthetic-vesaent-com',
    loginAt:'2026-10-16T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(host))external.push(r.url());});
  const click=async action=>page.locator('[data-action="'+action+'"]').first().click();
  const enter=async entries=>{for(const [k,v] of Object.entries(entries)){
    const field=page.locator('#comDialog [name="'+k+'"]');if(!await field.count())throw Error('Missing input '+k);
    if(await field.evaluate(e=>e.tagName==='SELECT'))await field.selectOption(String(v));
    else await field.fill(String(v));
  }};
  const submit=async()=>{await page.locator('#comDialog form button[type=submit]').click();await page.locator('#comDialog[open]').waitFor({state:'hidden'});};
  const saved=async()=>page.evaluate(()=>{const key=Object.keys(localStorage).find(x=>x.startsWith('vesa.order-commission.records.v1.'));return JSON.parse(localStorage.getItem(key)).records[0];});
  try{
   await page.goto(host+'/apps/',{waitUntil:'domcontentloaded'});
   const link=page.locator('a[href="/apps/order-commission/"]');
   assert.equal(await link.count(),1,'Commission must appear exactly once in App Centre.');
   await link.click();
   await page.locator('[data-action=new]').waitFor();
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   assert.equal(await page.locator('[data-vesa-menu]').count(),6);
   await click('new');
   await enter({buyer:'SYNTHETIC BUYER',factory:'SYNTHETIC FACTORY',po:'SYN-PO-001',
    style:'SYN-TEE',source:'SYNTHETIC PO PAPER'});await submit();
   await click('edit-agreement');
   await enter({source:'SYNTHETIC AGREEMENT',effective:'2026-10-01',rate:'3',
    currency:'USD',basis:'total-fob',rounding:'total-half-up-2',
    debtor:'factory',milestone:'SYNTHETIC GOODS SHIPPED',reviewer:'Synthetic reviewer'});
   await page.locator('#comDialog input[name=confirmed]').check();await submit();
   await click('lines');await click('add-line');
   await enter({po:'SYN-PO-001',style:'SYN-TEE',lineBasis:'total-fob',
    fobMode:'quantity-unit',quantity:'1000',unitFob:'2.5000',
    currency:'USD',lineSource:'SYNTHETIC FOB SOURCE'});await submit();
   await click('summary');
   assert.match(await page.locator('.com-metrics').innerText(),/75\.00/);
   await click('earnings');await click('add-earning');
   await enter({amount:'50.00',currency:'USD',milestone:'SYNTHETIC GOODS SHIPPED',
    date:'2026-10-12',evidence:'SYNTHETIC SHIPPING EVIDENCE',actor:'Synthetic reviewer'});
   await submit();
   await click('invoices');await click('add-invoice');
   await enter({invoiceNo:'SYN-INV-01',amount:'40.00',currency:'USD',invoiceStatus:'issued',
    issuedOn:'2026-10-13',dueDate:'2026-10-14',issuedBy:'Synthetic director',
    source:'SYNTHETIC ISSUED INVOICE'});await submit();
   await click('receipts');await click('add-receipt');
   await enter({receiptRef:'SYN-TRANSFER-01',date:'2026-10-15',amount:'20.00',
    receiptCurrency:'USD',evidence:'SYNTHETIC RECEIPT EVIDENCE',actor:'Synthetic finance'});
   const firstOption=await page.locator('#comDialog [name=invoiceChoice] option').nth(1).getAttribute('value');
   await page.locator('#comDialog [name=invoiceChoice]').selectOption(firstOption);await submit();
   await click('adjustments');await click('add-adjustment');
   await enter({amount:'5.00',currency:'USD',date:'2026-10-16',
    contractRef:'SYNTHETIC CREDIT TERMS',creditReason:'SYNTHETIC CONTRACT CREDIT',
    actor:'Synthetic finance'});await submit();
   await click('summary');
   const metrics=await page.locator('.com-metrics').innerText();
   for(const num of ['75.00','50.00','40.00','20.00','5.00','25.00'])assert(metrics.includes(num),num);
   await click('save');const original=await saved();
   assert.equal(original.agreement.ratePercent,'3');
   assert.equal(original.receipts.length,1);
   assert.equal(original.earnings.length,1);
   await page.reload({waitUntil:'domcontentloaded'});await click('continue');
   assert.equal((await saved()).invoices[0].status,'issued');
   await click('reports');
   assert.match(await page.locator('.com-report').innerText(),/Expected Earned Paid/);
   fs.mkdirSync(out,{recursive:true});
   const dlEvent=page.waitForEvent('download');await click('excel');
   const download=await dlEvent;const local=path.join(out,'commission-app02-synthetic.xlsx');await download.saveAs(local);
   const book=XLSX.read(fs.readFileSync(local),{type:'buffer'});
   assert(book.SheetNames.includes('Receipt Reconciliation'));
   assert.equal(book.Sheets['Expected Earned Paid'].B2.t,'n');
   assert.equal(book.Sheets['Expected Earned Paid'].B2.v,75);
   assert.equal(book.Sheets['Expected Earned Paid'].B7.v,25);
   const pdf=path.join(out,'commission-app02-report.pdf');
   await page.pdf({path:pdf,printBackground:true,landscape:true,preferCSSPageSize:true});
   assert(fs.statSync(pdf).size>3500);
   const copyEvent=page.waitForEvent('download');await click('download');
   const savedFile=await copyEvent,portable=path.join(out,'commission-app02-synthetic.vesacommission');
   await savedFile.saveAs(portable);assert(JSON.parse(fs.readFileSync(portable,'utf8')).hash);
   await page.setViewportSize({width:390,height:844});
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=391);
   await page.screenshot({path:path.join(out,'commission-app02-mobile.png')});
   await page.setViewportSize({width:320,height:720});
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=321);
   await page.setViewportSize({width:768,height:1024});
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=769);
   await page.setViewportSize({width:1280,height:900});
   for(const [language,label] of [['en','Receipts'],['bn','প্রাপ্তি'],['hi','प्राप्तियां'],['ta','பெறப்பட்ட தொகை']]){
    const before=JSON.stringify(await saved());
    await page.locator('[data-vesa-user]').click();const settings=page.locator('[data-vesa-settings]');
    await settings.locator('[data-pref-language]').selectOption(language);
    await page.waitForFunction(v=>document.documentElement.lang===v,language);
    await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
    assert.match(await page.locator('.com-tabs').innerText(),new RegExp(label));
    assert.equal(JSON.stringify(await saved()),before);
   }
   await page.reload({waitUntil:'domcontentloaded'});await click('continue');
   assert.equal((await saved()).receipts[0].amount,'20.00');
   assert.deepEqual(errors,[]);
   assert.deepEqual(external,[]);
   console.log('APP-02 CHROMIUM PASS: one VESA shell, explicit terms/FOB, sourced earned and issued invoice, paid/credit reconciliation, typed Excel, printable PDF, saved reload, EN/BN/HI/TA and 320/390/768, no external calls.');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
 }
}
new CommissionBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});
