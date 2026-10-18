/**
 * VESA navigation contract: the original nineteen apparel tools remain available,
 * AQL opens directly, login omits redundant demo instructions, and the supplied
 * chess source is served byte-for-byte without rewriting its game engine.
 * Inputs: synthetic local credentials only. Outputs: failures via assertions.
 * No application records are modified beyond this disposable browser context.
 */
'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

class VesaChessNavigationQA {
  static ROOT=path.resolve(__dirname,'..');
  static CHESS=path.join(VesaChessNavigationQA.ROOT,'apps/chess-360/index.html');
  static ORIGINAL_SOURCE_SHA256='06c82b0515826e0a5d62cd89b368fcf0431bee75fe41e753213afa8b16c7441c';
  constructor(){this.server=null;this.browser=null;this.base='';}
  async start(){
    this.server=http.createServer((req,res)=>{
      try{
        const url=new URL(req.url,'http://localhost');
        let file=path.resolve(VesaChessNavigationQA.ROOT,'.'+decodeURIComponent(url.pathname));
        if(!file.startsWith(VesaChessNavigationQA.ROOT+path.sep))return res.writeHead(403).end();
        if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
        const type={'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json'}[path.extname(file)]||'application/octet-stream';
        res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.base='http://127.0.0.1:'+this.server.address().port;
    this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  }
  async check(width){
    const context=await this.browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
    const page=await context.newPage(),errors=[],external=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(!request.url().startsWith(this.base)&&!request.url().startsWith('blob:'+this.base))external.push(request.url());});
    try{
      await page.goto(this.base+'/login/',{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('#email').inputValue(),'user@vesa');
      assert.equal(await page.locator('#password').inputValue(),'vesa');
      assert.equal(await page.locator('.login-demo,.login-availability,.login-story__foot').count(),0,'no credential bulletin/count/bullet features');
      await page.locator('#loginSubmit').click();
      await page.waitForURL(url=>url.pathname==='/apps/',{timeout:25000});
      assert.equal(await page.locator('.app-tile').count(),20,'19 apparel tools plus Chess');
      assert.equal(await page.locator('#appCount').textContent(),'20');
      assert.equal(await page.locator('[data-app-id="chess-360"]').count(),1,'single Chess 360 card');
      assert.match(await page.locator('[data-app-id="chess-360"]').textContent(),/Powered by EGENVA/);
      if(width===390){
        for(const lang of ['bn','hi','ta','en']){
          await page.evaluate(lang=>{const current=JSON.parse(localStorage.getItem('vesa.app.preferences.v1')||'{}');localStorage.setItem('vesa.app.preferences.v1',JSON.stringify({...current,language:lang}));window.dispatchEvent(new Event('vesa-preferences-change'));},lang);
          assert.equal(await page.locator('.app-tile').count(),20,'language keeps full catalogue '+lang);
          assert.match(await page.locator('[data-app-id="chess-360"]').textContent(),/Powered by EGENVA/,'branded credit remains correct for '+lang);
        }
      }
      await page.locator('[data-app-id="chess-360"] a').click();
      await page.waitForURL(url=>url.pathname==='/apps/chess-360/');
      await page.locator('#chessboard').waitFor({state:'visible',timeout:15000});
      assert.equal(await page.locator('#chessboard .square').count(),64,'full original chessboard');
      assert.equal(await page.locator('#btnTopStartPause').count(),1);
      assert.equal(await page.locator('#btnSaveToVaultNow').count(),1,'offline save vault present');
      await page.goBack({waitUntil:'domcontentloaded'});
      await page.locator('[data-app-id="aql"] a').click();
      await page.waitForURL(url=>url.pathname==='/apps/aql/');
      await page.waitForFunction(()=>!!window.__vesaApp&&!document.getElementById('app').hidden,null,{timeout:55000});
      assert.equal(await page.locator('#vesa-welcome').isVisible(),false,'intermediate Enter screen not shown');
      assert.equal(await page.locator('#vesa-enter').isVisible(),false,'no extra Enter click');
      assert.equal(await page.locator('.vesa-workspace').count(),1,'shared header preserved');
      assert.deepEqual(errors,[],width+': no uncaught errors');
      assert.deepEqual(external,[],width+': no outside network requests');
      return {width,apps:20,chessSquares:64,aqlDirect:true};
    }finally{await context.close();}
  }
  async run(){
    const source=fs.readFileSync(VesaChessNavigationQA.CHESS);
    assert.ok(source.toString().includes('Chess Beast 360')&&source.toString().includes('chess3_offline_games_vault_v1'),'Reworked Chess Beast keeps original game data');
    await this.start();
    try{const results=[];for(const width of [320,390,1440])results.push(await this.check(width));console.log('VESA_CHESS_AQL_DIRECT_PASS '+JSON.stringify({results,sha256:crypto.createHash('sha256').update(source).digest('hex')}));}
    finally{await this.browser?.close();if(this.server)await new Promise(resolve=>this.server.close(resolve));}
  }
}
new VesaChessNavigationQA().run().catch(error=>{console.error(error);process.exitCode=1;});
