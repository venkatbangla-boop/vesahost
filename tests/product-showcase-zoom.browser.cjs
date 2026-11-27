/**
 * Full browser regression for the hidden full-screen product zoom.
 * Owner: ZoomBrowserAcceptance verifies real DOM, iframe routing and Chromium
 * touch-pointer/wheel interactions, using a disposable local server only.
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
  /** Desktop cursor/scroll/double click and close must not change the item. */
  async desktop() {
    const context=await this.browser.newContext({viewport:{width:1440,height:900},
      serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(this.base+'/product-showcase/?item=K27',{waitUntil:'domcontentloaded'});
      await this.mainReady(page,'K27');
      assert.equal(await page.locator('#expand-view').isVisible(),false,'No visible zoom toolbar');
      assert.equal(await page.locator('.hero').evaluate(el=>getComputedStyle(el).cursor),'zoom-in');
      await page.locator('.hero').click();
      await page.locator('#zoom-dialog[open]').waitFor({timeout:10000});
      assert.match(await page.locator('#zoom-image').getAttribute('src'),/\/K27\.webp$/);
      assert.equal(await page.locator('#experience').getAttribute('data-playback'),'paused');
      const bounds=await page.locator('#zoom-dialog').boundingBox();
      assert.ok(bounds.width>=1439&&bounds.height>=899,'Full viewport zoom overlay');
      await page.locator('#zoom-surface').hover();
      await page.mouse.wheel(0,-900);
      await page.waitForFunction(()=>document.querySelector('#zoom-surface')?.dataset.zoomed==='true');
      await page.locator('#zoom-surface').dblclick({position:{x:700,y:430}});
      await page.waitForFunction(()=>document.querySelector('#zoom-surface')?.dataset.zoomed==='false');
      await page.locator('#zoom-close').click();
      assert.equal(await page.locator('#zoom-dialog').evaluate(el=>el.open),false);
      assert.equal(await page.locator('#style-id').textContent(),'K27');
      assert.equal(await page.locator('#experience').getAttribute('data-playback'),'paused');
      await page.screenshot({path:path.join(this.out,'desktop-after-close.png'),animations:'disabled'});
      assert.deepEqual(errors,[],'Desktop show/zoom/close has no page errors');
      this.cases.push('desktop standalone hover, wheel, double click, close');
    }finally{await context.close();}
  }
  /** Real emulated touch streams: pinch, pan, double tap, close and item hold. */
  async mobileStandalone() {
    const context=await this.browser.newContext({viewport:{width:390,height:844},
      isMobile:true,hasTouch:true,deviceScaleFactor:2,
      serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(this.base+'/product-showcase/?group=baby&item=K28',{waitUntil:'domcontentloaded'});
      await this.mainReady(page,'K28');
      await page.locator('.hero').tap();
      await page.locator('#zoom-dialog[open]').waitFor({timeout:12000});
      assert.match(await page.locator('#zoom-image').getAttribute('src'),/\/K28\.webp$/);
      const surface=await page.locator('#zoom-surface').boundingBox();
      const cx=surface.x+surface.width/2,cy=surface.y+surface.height/2;
      const session=await context.newCDPSession(page);
      await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[
        {x:cx-45,y:cy},{x:cx+45,y:cy}]});
      await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[
        {x:cx-110,y:cy},{x:cx+110,y:cy}]});
      await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForFunction(()=>document.querySelector('#zoom-surface')?.dataset.zoomed==='true',{timeout:6000}).catch(()=>{});
      assert.equal(await page.locator('#zoom-surface').getAttribute('data-zoomed'),'true','Pinch enlarged garment');
      await page.touchscreen.tap(cx,cy);
      await page.waitForTimeout(70);
      await page.touchscreen.tap(cx,cy);
      await page.waitForFunction(()=>document.querySelector('#zoom-surface')?.dataset.zoomed==='false',{timeout:6000}).catch(()=>{});
      assert.equal(await page.locator('#zoom-surface').getAttribute('data-zoomed'),'false','Double-tap reset');
      await page.locator('#zoom-close').tap();
      assert.equal(await page.locator('#zoom-dialog').evaluate(el=>el.open),false);
      assert.equal(await page.locator('#style-id').textContent(),'K28','Same baby garment after close');
      assert.equal(await page.locator('#experience').getAttribute('data-playback'),'paused');
      await page.screenshot({path:path.join(this.out,'mobile-after-close.png'),animations:'disabled'});
      assert.deepEqual(errors,[],'Touch inspect should not trigger page errors');
      this.cases.push('mobile standalone pinch, double-tap, close');
    }finally{await context.close();}
  }
  /** Homepage iframe must route main tap to a real viewport-sized parent dialog. */
  async homepage() {
    const context=await this.browser.newContext({viewport:{width:390,height:844},
      isMobile:true,hasTouch:true,deviceScaleFactor:2,
      serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(this.base+'/#product-showcase',{waitUntil:'domcontentloaded'});
      await page.locator('#product-showcase').scrollIntoViewIfNeeded();
      const inline=page.frameLocator('#vesa-showcase-inline');
      await inline.locator('.hero').waitFor({timeout:30000});
      await inline.locator('#experience[data-scene-ready="true"]').waitFor({timeout:30000});
      const before=await inline.locator('#style-id').textContent();
      await inline.locator('.hero').tap();
      await page.locator('#vesa-showcase-dialog[open][data-zoom="true"]').waitFor({timeout:15000});
      const frame=page.frameLocator('#vesa-showcase-modal-frame');
      await frame.locator('#zoom-dialog[open]').waitFor({timeout:25000});
      assert.equal(await frame.locator('#style-id').textContent(),before);
      assert.equal(await frame.locator('#zoom-close').isVisible(),false,'Only parent X in homepage fullscreen');
      assert.equal(await page.locator('#vesa-showcase-close').isVisible(),true,'Accessible Close in parent');
      const dialog=await page.locator('#vesa-showcase-dialog').boundingBox();
      assert.ok(dialog.width>=389&&dialog.height>=843,'Homepage zoom fills phone viewport');
      await page.locator('#vesa-showcase-close').tap();
      assert.equal(await page.locator('#vesa-showcase-dialog').evaluate(el=>el.open),false);
      assert.equal(await inline.locator('#style-id').textContent(),before,'Close restored original item');
      await page.screenshot({path:path.join(this.out,'homepage-touch-after-close.png'),animations:'disabled'});
      assert.deepEqual(errors,[],'Homepage host must not throw');
      this.cases.push('homepage iframe touch expands fullscreen and restores same item');
    }finally{await context.close();}
  }
  /** Independent test proof with cleanup, never a physical Android claim. */
  async run() {
    await this.start();
    try{await this.desktop();await this.mobileStandalone();await this.homepage();}
    finally{await this.browser.close();await new Promise(resolve=>this.server.close(resolve));}
    console.log('VESA_HIDDEN_ZOOM_BROWSER_PASS '+JSON.stringify({cases:this.cases,
      physicalAndroid:false,scope:'Chromium desktop and touch emulation'}));
  }
}
new ZoomBrowserAcceptance().run().catch(error=>{
  console.error('VESA_HIDDEN_ZOOM_BROWSER_FAIL',error);process.exitCode=1;
});
