/* Browser acceptance: synthetic-only pdfme export, saved template and offline reload. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
class PdfStudioAcceptance{
 async run(){
  const browser=await chromium.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'allow'});
   await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'test@example.invalid',name:'Demo',role:'user',expiresAt:'2099-01-01T00:00:00.000Z'})));
   const page=await context.newPage(),errors=[],remote=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765/'))remote.push(r.url());});
   await page.goto('http://127.0.0.1:8765/apps/pdf-template-studio/',{waitUntil:'load'});
   await page.locator('#pdfStudioState').getByText('Local PDF designer ready.').waitFor({timeout:60000});
   const frame=page.frameLocator('#pdfStudioEditor');
   const templateDownload=frame.locator('#save');
   const d1=page.waitForEvent('download');await templateDownload.click();const first=await d1;
   assert.match(first.suggestedFilename(),/\.json$/);
   const savedPath=await first.path();assert.ok(savedPath);
   await frame.locator('#open').setInputFiles(savedPath);
   await frame.locator('#status').getByText('Template opened locally.').waitFor({timeout:10000});
   const d2=page.waitForEvent('download',{timeout:90000});
   await frame.locator('#pdf').click();const pdf=await d2;
   assert.match(pdf.suggestedFilename(),/\.pdf$/);
   const bytes=require('node:fs').readFileSync(await pdf.path());
   assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
   assert.ok(bytes.length>500,'PDF should contain actual page data');
   await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:90000}).catch(async()=>{
    await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:90000});
   });
   await context.setOffline(true);await page.reload({waitUntil:'load'});
   await page.locator('#pdfStudioState').getByText('Local PDF designer ready.').waitFor({timeout:60000});
   assert.deepEqual(remote,[],'external requests not permitted');
   assert.deepEqual(errors,[],'browser console errors not permitted');
   console.log('PDFME_DESIGNER_SAVE_REOPEN_EXPORT_OFFLINE_PASS');
   await context.close();
  }finally{await browser.close();}
 }
}
new PdfStudioAcceptance().run().catch(e=>{console.error(e);process.exitCode=1;});