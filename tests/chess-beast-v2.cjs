/**
 * Chess Beast 360 — independent domain parity, background AI and UX regression.
 *
 * Ownership: this synthetic browser test only. Reads static source and drives
 * a disposable Chromium context; never writes real game saves, account data or
 * external services. Public API: `node tests/chess-beast-v2.cjs`.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const vm=require('node:vm');
const {chromium}=require('playwright');

class ChessBeastV2QA {
  constructor(){this.root=path.resolve(__dirname,'..');this.server=null;this.browser=null;this.base='';}
  verifyDomainParity(){
    const html=fs.readFileSync(path.join(this.root,'apps/chess-360/index.html'),'utf8');
    const worker=fs.readFileSync(path.join(this.root,'apps/chess-360/chess-ai-worker.js'),'utf8');
    const from=html.indexOf('  const FILES =');
    const to=html.indexOf('  /* =========================================================================\n   * 4. UI CONTROLLER',from);
    assert.ok(from>0&&to>from,'audited core anchors retained');
    const core=html.slice(from,to);
    assert.ok(worker.includes(core),'worker runs precisely the same ChessEngine as UI');
    new vm.Script(worker,{filename:'chess-ai-worker.js'});
    const blocks=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
    for(const block of blocks)new vm.Script(block,{filename:'chess-inline.js'});
    assert.ok(worker.includes('class ChessBeastWorkerService'));
    assert.ok(html.includes('class ChessBeastSearchCoordinator'));
  }
  async serve(){
    this.server=http.createServer((req,res)=>{
      try{
        const url=new URL(req.url,'http://localhost');
        let f=path.resolve(this.root,'.'+decodeURIComponent(url.pathname));
        if(!f.startsWith(this.root+path.sep))return res.writeHead(403).end();
        if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
        const ext=path.extname(f),type={'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml'}[ext]||'application/octet-stream';
        res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(f));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.base='http://127.0.0.1:'+this.server.address().port;
    this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox'],headless:true});
  }
  async verify(width){
    const ctx=await this.browser.newContext({viewport:{width,height:880},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.goto(this.base+'/apps/chess-360/',{waitUntil:'domcontentloaded'});
      await page.locator('#chessboard .square').first().waitFor();
      assert.equal(await page.locator('#chessboard .square').count(),64);
      assert.equal(await page.evaluate(()=>window.__chessBeastPerformance().workerSupported),true);
      await page.evaluate(()=>{
        window.__frames=[];window.__lastFrame=performance.now();
        window.__frameTimer=setInterval(()=>{
          const now=performance.now();
          window.__frames.push(now-window.__lastFrame);
          window.__lastFrame=now;
        },20);
      });
      await page.locator('#btnTopStartPause').click();
      await page.locator('#chessboard [data-sq="52"]').click();
      await page.locator('#chessboard [data-sq="36"]').click();
      await page.waitForFunction(()=>window.__chessBeastPerformance().lastSearchMs>0
        ||window.__chessBeastPerformance().fallbackCount>0,{},{timeout:12500});
      await page.waitForTimeout(450);
      const perf=await page.evaluate(()=>{
        clearInterval(window.__frameTimer);
        return {maxFrameGap:Math.max(...window.__frames,0),...window.__chessBeastPerformance()};
      });
      assert.ok(perf.maxFrameGap<900,'main thread stalled '+perf.maxFrameGap+'ms on '+width+'px');
      assert.equal(await page.locator('#chessboard .square').count(),64);
      assert.deepEqual(errors,[],'Uncaught errors at '+width+'px');
      return {width,perf};
    }finally{await ctx.close();}
  }
  async run(){
    this.verifyDomainParity();
    await this.serve();
    try{
      const results=[];
      for(const width of [320,390,1440])results.push(await this.verify(width));
      console.log('CHESS_BEAST_V2_BACKGROUND_WORKER_PASS '+JSON.stringify(results));
    }finally{
      await this.browser?.close();
      if(this.server)await new Promise(resolve=>this.server.close(resolve));
    }
  }
}
new ChessBeastV2QA().run().catch(e=>{console.error(e);process.exitCode=1;});
