/*
 * Marker Lab browser acceptance. Tests live SVGnest initialization, one VESA
 * global shell, absence of remote requests, and same-device offline reload.
 * Synthetic session and temporary browser profile only; no commercial data.
 */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
class MarkerLabBrowserProof {
 constructor(){this.base='http://127.0.0.1:8765';this.errors=[];this.external=[];this.browser=null;this.context=null;}
 async run(){
  try {
   this.browser=await chromium.launch({headless:true});
   this.context=await this.browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
   await this.context.addInitScript(()=>{
    localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'demo@example.invalid',name:'Demo Tester',role:'user',expiresAt:'2099-01-01T00:00:00.000Z'}));
   });
   const page=await this.context.newPage();
   page.on('pageerror',error=>this.errors.push(error.message));
   page.on('request',request=>{if(!request.url().startsWith(this.base))this.external.push(request.url());});
   await page.goto(this.base+'/apps/marker-lab/',{waitUntil:'load'});
   await page.locator('#markerState').getByText(/editor is ready/).waitFor({timeout:20000});
   assert.equal(await page.locator('.vesa-workspace').count(),1);
   await page.frameLocator('#nestEditor').locator('#demo').click();
   assert.ok(await page.frameLocator('#nestEditor').locator('#start').count()===1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'mobile overflow');
   assert.deepEqual(this.external,[]);
   assert.deepEqual(this.errors,[]);
   await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null,{timeout:20000}).catch(async()=>{await page.reload();await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null,{timeout:20000});});
   await this.context.setOffline(true);
   await page.reload({waitUntil:'load'});
   await page.locator('#markerState').getByText(/editor is ready/).waitFor({timeout:20000});
   assert.equal(await page.frameLocator('#nestEditor').locator('#demo').count(),1);
   assert.deepEqual(this.errors,[]);
   console.log('MARKER_LAB_REAL_BROWSER_MOBILE_OFFLINE_PASS');
  } finally {await this.context?.close();await this.browser?.close();}
 }
}
new MarkerLabBrowserProof().run().catch(e=>{console.error(e);process.exitCode=1;});