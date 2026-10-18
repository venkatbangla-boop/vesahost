/**
 * Chess Beast V2 offline acceptance against a real installed service worker.
 *
 * Owner: synthetic QA. Creates a disposable local HTTP server / Chromium
 * profile, checks 5 app-scoped assets and genuine offline AI play/resume.
 * Never touches users' browser storage, real PPM/AQL/TNA or external services.
 */
'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

class ChessBeastOfflineQA {
  constructor(){this.root=path.resolve(__dirname,'..');this.server=null;this.browser=null;this.url='';}
  async start(){
    this.server=http.createServer((req,res)=>{
      try{
        let p=path.resolve(this.root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));
        if(!p.startsWith(this.root+path.sep))return res.writeHead(403).end();
        if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
        const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(p)]||'application/octet-stream';
        res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(p));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.url='http://127.0.0.1:'+this.server.address().port+'/apps/chess-360/';
    this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
  }
  async run(){
    await this.start();
    const ctx=await this.browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.goto(this.url,{waitUntil:'load',timeout:30000});
      const sw=await page.evaluate(async()=>{
        const r=await navigator.serviceWorker.ready;
        await new Promise((resolve,reject)=>{
          const deadline=setTimeout(()=>reject(Error('Scope controller timeout')),15000);
          const check=()=>{if(navigator.serviceWorker.controller){
            clearTimeout(deadline);resolve();
          }};
          navigator.serviceWorker.addEventListener('controllerchange',check,{once:true});check();
        });
        const names=await caches.keys();
        const cache=await caches.open(names.find(x=>x.startsWith('chess-beast-v2-')));
        const assets=await cache.keys();
        return {scope:r.scope,script:r.active?.scriptURL,assets:assets.map(x=>new URL(x.url).pathname)};
      });
      assert.ok(sw.scope.endsWith('/apps/chess-360/'),JSON.stringify(sw));
      assert.ok(sw.script.endsWith('/apps/chess-360/sw.js'));
      for(const file of ['/index.html','/chess-beast.css','/chess-beast-ui.js','/chess-ai-worker.js']){
        assert.ok(sw.assets.some(a=>a.endsWith(file)),'Not in offline cache '+file);
      }
      await ctx.setOffline(true);
      await page.reload({waitUntil:'domcontentloaded',timeout:30000});
      await page.locator('#chessboard .square').first().waitFor({timeout:15000});
      assert.equal(await page.locator('#chessboard .square').count(),64);
      assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('liveTickerStrip')).display),'flex','Offline app-specific CSS loaded');
      await page.locator('#btnTopStartPause').click();
      await page.locator('#chessboard [data-sq="52"]').click();
      await page.locator('#chessboard [data-sq="36"]').click();
      await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=2,
        null,{timeout:15000});
      const stat=await page.evaluate(()=>window.__chessBeastPerformance());
      assert.equal(stat.fallbackCount,0,'Original AI Worker executes offline from cache');
      await page.locator('#btnQuickSaveMatch').click();
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('chess3_offline_games_vault_v1')).length);
      assert.ok(saved>=1,'Offline game saved locally');
      await page.reload({waitUntil:'domcontentloaded',timeout:15000});
      await page.locator('#cardResumeLast').waitFor({state:'visible',timeout:15000});
      assert.deepEqual(errors,[],'No browser errors during offline play');
      console.log('CHESS_BEAST_OFFLINE_PASS '+JSON.stringify({scope:sw.scope,assets:sw.assets.length,aiFallback:stat.fallbackCount,saved,offlineResume:true}));
    }finally{
      await ctx.close();await this.browser?.close();
      if(this.server)await new Promise(resolve=>this.server.close(resolve));
    }
  }
}
new ChessBeastOfflineQA().run().catch(e=>{console.error(e);process.exitCode=1;});
