/** SVG Studio isolated real-browser and offline acceptance; synthetic session only. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
class ArtworkStudioBrowserProof {
 constructor(){this.errors=[];this.remote=[];this.base='http://127.0.0.1:8765';}
 async run(){
  const browser=await chromium.launch({headless:true});
  try {
   const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
   await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'qa@example.invalid',name:'QA User',role:'admin',expiresAt:'2099-01-01T00:00:00.000Z'})));
   const page=await context.newPage();
   page.on('pageerror',e=>this.errors.push(e.message));
   page.on('request',r=>{if(!r.url().startsWith(this.base))this.remote.push(r.url());});
   await page.goto(this.base+'/apps/artwork-cad-studio/',{waitUntil:'load'});
   await page.locator('#artworkStatus').getByText(/Local SVG drawing editor loaded/).waitFor({timeout:30000});
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   await page.frameLocator('#svgEditFrame').locator('#svgcanvas').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true);
   await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null,{timeout:45000}).catch(async()=>{
    await page.reload({waitUntil:'load'});await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null,{timeout:45000});
   });
   assert.deepEqual(this.remote,[],'No external requests');
   assert.deepEqual(this.errors,[],'No JS exceptions');
   await context.setOffline(true);
   await page.reload({waitUntil:'load'});
   await page.frameLocator('#svgEditFrame').locator('#svgcanvas').waitFor();
   await page.locator('#artworkStatus').getByText(/Local SVG drawing editor loaded/).waitFor({timeout:30000});
   assert.deepEqual(this.errors,[],'Offline JS exceptions');
   console.log('SVG_STUDIO_MOBILE_OFFLINE_PASS');
   await context.close();
  } finally{await browser.close();}
 }
}
new ArtworkStudioBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});