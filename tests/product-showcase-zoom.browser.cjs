/**
 * Browser regression for removal of main-model zoom.
 * Owner: ZoomBrowserAcceptance verifies real DOM, iframe routing and Chromium
 * touch interactions, using a disposable local server only.
 * Access: node tests/product-showcase-zoom.browser.cjs after installing Playwright.
 * No production data, accounts, sessions, service worker or website are modified.
 * Chromium touch dispatch is an emulator, NOT a physical Android device test.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

class ZoomBrowserAcceptance {
  /** Isolate all test state to one process-owned browser and local server. */
  constructor() {
    this.root=path.resolve(__dirname,'..');this.server=null;this.browser=null;
    this.cases=[];this.out=path.join(this.root,'output','showcase-zoom');
    fs.mkdirSync(this.out,{recursive:true});
  }
  /** Serve static repo files with no external requests or storage side effects. */
  async start() {
    this.server=http.createServer((req,res)=>{
      try {
        const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
        let file=path.resolve(this.root,'.'+pathname);
        // The repository root is the homepage; accept it while rejecting traversal.
        if(file!==this.root&&!file.startsWith(this.root+path.sep))return res.writeHead(403).end();
        if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
        const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
          '.json':'application/json','.webp':'image/webp','.png':'image/png',
          '.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon',
          '.mp4':'video/mp4','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
        res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.base='http://127.0.0.1:'+this.server.address().port;
    this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
      headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  }
  /** Verify source/current central image is stable, decoded and visible. */
  async mainReady(page,id) {
    await page.waitForFunction(expected=>
      document.querySelector('#experience')?.dataset.sceneReady==='true'&&
      document.querySelector('#style-id')?.textContent===expected,id,{timeout:25000});
    assert.equal(await page.locator('.hero').count(),1);
  }
  /** Main-model clicks are inert; navigation and the index still work. */
  async desktop() {
    const context=await this.browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],hdRequests=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(request.url().includes('/hd-assets/'))hdRequests.push(request.url());});
    try {
      await page.goto(this.base+'/product-showcase/?item=K27',{waitUntil:'domcontentloaded'});
      await this.mainReady(page,'K27');
      assert.equal(await page.locator('#zoom-dialog,#expand-view').count(),0);
      assert.notEqual(await page.locator('.hero').evaluate(el=>getComputedStyle(el).cursor),'zoom-in');
      await page.locator('.hero').click();
      await page.locator('.hero').dblclick();
      await page.locator('#scene').press('Enter');
      assert.equal(await page.locator('dialog[open]').count(),0);
      assert.equal(await page.locator('#style-id').textContent(),'K27');
      assert.deepEqual(hdRequests,[]);
      await page.locator('#next').click();
      await this.mainReady(page,'K28');
      await page.locator('#open-index').click();
      assert.equal(await page.locator('#index-dialog').evaluate(el=>el.open),true);
      await page.locator('#close-index').click();
      assert.deepEqual(errors,[]);
      this.cases.push('desktop no zoom; next and index work');
    }finally{await context.close();}
  }
  /** Touch and legacy zoom URL do not open an overlay. */
  async mobileStandalone() {
    const context=await this.browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(this.base+'/product-showcase/?mode=modal&zoom=1&group=baby&item=K28',{waitUntil:'domcontentloaded'});
      await this.mainReady(page,'K28');
      await page.locator('.hero').tap();
      await page.locator('.hero').tap();
      assert.equal(await page.locator('dialog[open]').count(),0);
      assert.equal(await page.locator('#style-id').textContent(),'K28');
      assert.deepEqual(errors,[]);
      this.cases.push('mobile no zoom');
    }finally{await context.close();}
  }
  /** Embedded model taps are inert; normal homepage product links still open. */
  async homepage() {
    const context=await this.browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(this.base+'/#product-showcase',{waitUntil:'domcontentloaded'});
      await page.locator('#product-showcase').scrollIntoViewIfNeeded();
      const inline=page.frameLocator('#vesa-showcase-inline');
      await inline.locator('#experience[data-scene-ready="true"]').waitFor({timeout:30000});
      const before=await inline.locator('#style-id').textContent();
      await inline.locator('.hero').tap();
      assert.equal(await page.locator('#vesa-showcase-dialog').evaluate(el=>el.open),false);
      assert.equal(await inline.locator('dialog[open]').count(),0);
      assert.equal(await inline.locator('#style-id').textContent(),before);
      await page.locator('a[data-vesa-product]').first().click();
      await page.locator('#vesa-showcase-dialog[open]').waitFor({timeout:15000});
      await page.locator('#vesa-showcase-close').tap();
      assert.equal(await page.locator('#vesa-showcase-dialog').evaluate(el=>el.open),false);
      assert.deepEqual(errors,[]);
      this.cases.push('homepage no image zoom; product links work');
    }finally{await context.close();}
  }
  /** Independent test proof with cleanup, never a physical Android claim. */
  async run() {
    await this.start();
    try{await this.desktop();await this.mobileStandalone();await this.homepage();}
    finally{await this.browser.close();await new Promise(resolve=>this.server.close(resolve));}
    console.log('VESA_NO_ZOOM_BROWSER_PASS '+JSON.stringify({cases:this.cases,
      physicalAndroid:false,scope:'Chromium desktop and touch emulation'}));
  }
}
new ZoomBrowserAcceptance().run().catch(error=>{
  console.error('VESA_NO_ZOOM_BROWSER_FAIL',error);process.exitCode=1;
});
