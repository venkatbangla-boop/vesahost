/** F06 authenticated browser proof for Full Plan capture, local save/reopen and responsive rendering. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';

async function run(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  try{
    await page.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="new"]').click();
    await page.locator('[data-wizard-tab="full"]').click();
    const values={buyerName:'F06 Buyer',factoryName:'F06 Factory',styleNo:'STYLE-F06-UI',poNumber:'PO-F06-UI',totalQty:'1000',buyerRequiredExFactory:'2026-12-01',orderConfirmedOn:'2026-10-01',brand:'F06 Brand',destinationMarket:'United Kingdom',portOfLoading:'Chattogram',portOfDischarge:'Felixstowe',buyerRequiredETD:'2026-12-04',buyerRequiredETA:'2027-01-05',destinationRequiredDate:'2027-01-08',sizeRange:'S–L',incoterm:'FOB',shipmentMethod:'Sea',colorSizeBreakdown:'Navy | S | 200\nNavy | M | 300\nIvory | M | 250\nIvory | L | 250'};
    for(const [name,value] of Object.entries(values))await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('#tnaWizard button[type="submit"]').click();
    const summary=page.locator('[aria-label="Order master"]');
    await summary.waitFor();
    assert.match(await summary.innerText(),/Chattogram/);
    assert.match(await summary.innerText(),/Felixstowe/);
    assert.equal(await page.locator('[aria-label="Color and size breakdown"] [role="row"]').count(),5);
    let stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.autosave.qa-vesaent-com')).plan);
    assert.deepEqual(stored.order.colorSizeBreakdown.map(row=>[row.color,row.size,row.quantity]),[['Navy','S',200],['Navy','M',300],['Ivory','M',250],['Ivory','L',250]]);
    assert.equal(stored.order.portOfLoading,'Chattogram');
    assert.equal(stored.commitments.destinationRequiredDate,'2027-01-08');

    await page.locator('[data-action="save"]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-action="open"]').click();
    await page.locator('[data-open-record]').click();
    await page.locator('#tnaDialog .tna-dialog-head button').click();
    await page.setViewportSize({width:390,height:844});
    await page.locator('[aria-label="Order master"]').waitFor();
    const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    assert.ok(geometry.doc<=geometry.inner+1&&geometry.body<=geometry.inner+1,'F06 order master must not overflow at 390px.');
    stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.tna360.records.qa-vesaent-com')).records[0].plan);
    assert.equal(stored.order.portOfDischarge,'Felixstowe');
    assert.equal(stored.order.colorSizeBreakdown.reduce((sum,row)=>sum+row.quantity,0),1000);
    fs.mkdirSync(output,{recursive:true});
    await page.addStyleTag({content:'.app-user-bar,.tna-commandbar{display:none!important}'});
    await page.locator('[aria-label="Order master"]').screenshot({path:path.join(output,'tna-g11-f06-order-master-mobile.png')});
    assert.deepEqual(errors,[],'F06 browser flow must have no uncaught page errors.');
    assert.deepEqual(external,[],'F06 browser flow must make no external requests.');
    console.log('TNA F06 browser passed: Full Plan ports/color-size/target dates, save/reload/reopen, 390px, zero external requests/page errors');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
