/**
 * Chess Beast V2 scenario tests against actual interactive browser screens.
 *
 * Owner: synthetic QA; disposable HTTP server, localStorage and browser
 * contexts. Exercises gesture, keyboard, saved-copy compatibility and
 * background AI lifecycles without altering real user games.
 *
 * Run: node tests/chess-beast-deep-browser.cjs
 */
'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

class ChessBeastDeepBrowserQA {
  constructor() {
    this.root=path.resolve(__dirname,'..');
    this.browser=null;this.server=null;this.url='';
  }
  async start() {
    this.server=http.createServer((request,response)=>{
      try{
        const url=new URL(request.url,'http://127.0.0.1');
        let p=path.resolve(this.root,'.'+decodeURIComponent(url.pathname));
        if(!p.startsWith(this.root+path.sep))return response.writeHead(403).end();
        if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
        const ext=path.extname(p);
        const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'}[ext]||'application/octet-stream';
        response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(p));
      }catch{response.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.url='http://127.0.0.1:'+this.server.address().port+'/apps/chess-360/';
    this.browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  }
  async open(opts) {
    const context=await this.browser.newContext({...opts,serviceWorkers:'block'});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(this.url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#chessboard .square').first().waitFor({timeout:16000});
    await page.waitForFunction(()=>window.__chessBeastPerformance?.().workerSupported===true);
    assert.equal(await page.locator('#chessboard .square').count(),64);
    return {page,context,errors};
  }
  async setMode(page,mode,level=2) {
    await page.locator('#btnOpenNewGame').click();
    await page.locator('#modalModeRow [data-mode="'+mode+'"]').click();
    const tier=page.locator('#modalLevelRow [data-lvl="'+level+'"]');
    if(await tier.count())await tier.click();
    await page.locator('#btnConfirmStartGame').click();
    await page.locator('#newGameModal').waitFor({state:'hidden'});
  }
  async plyCount(page) {
    return page.evaluate(()=>Number(document.getElementById('moveRewindScrubber').value));
  }
  async move(page,from,to) {
    await page.locator('#chessboard [data-sq="'+from+'"]').click();
    await page.locator('#chessboard [data-sq="'+to+'"]').click();
  }
  async testTouchVaultAndKeyboard() {
    const {page,context,errors}=await this.open({
      viewport:{width:390,height:844},hasTouch:true,isMobile:true,
      reducedMotion:'reduce',deviceScaleFactor:2
    });
    try{
      await this.setMode(page,'pvp',1);
      const fresh=await page.locator('#fenInputBox').inputValue();
      assert.match(fresh,/ w /);
      await page.evaluate(()=>{
        const source=document.querySelector('#chessboard [data-sq="52"]');
        const target=document.querySelector('#chessboard [data-sq="36"]');
        const s=source.getBoundingClientRect(),t=target.getBoundingClientRect();
        const opts={pointerId:17,isPrimary:true,pointerType:'touch',bubbles:true,cancelable:true};
        source.dispatchEvent(new PointerEvent('pointerdown',{...opts,clientX:s.x+s.width/2,clientY:s.y+s.height/2}));
        source.dispatchEvent(new PointerEvent('pointermove',{...opts,clientX:t.x+t.width/2,clientY:t.y+t.height/2}));
        window.dispatchEvent(new PointerEvent('pointerup',{...opts,clientX:t.x+t.width/2,clientY:t.y+t.height/2}));
      });
      assert.equal(await this.plyCount(page),1,'Drag e2 to e4 must play one move only');
      await page.locator('#chessboard [data-sq="12"]').focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.sq),'28','Keyboard roving focus survives redraw');
      await page.keyboard.press('Enter');
      assert.equal(await this.plyCount(page),2,'Keyboard e7-e5');
      await page.locator('#btnQuickSaveMatch').click();
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('chess3_offline_games_vault_v1'))[0]);
      assert.equal(saved.gameMode,'pvp','Record includes nonbreaking optional mode');
      assert.equal(saved.uciHistory.length,2,'Both moves persisted');
      await page.locator('#btnTopReset').click();
      await page.locator('#cardResumeLast').click();
      assert.equal(await page.locator('#fenInputBox').inputValue(),saved.fen,'Restored exact position');
      assert.equal(await this.plyCount(page),2,'Rewind state preserved');
      await page.waitForTimeout(650);
      assert.equal(await this.plyCount(page),2,'Saved game is safely paused');
      assert.match(await page.locator('#topStartPauseText').textContent(),/resume|continue/i);
      await page.locator('#btnTopStartPause').click();
      await this.move(page,62,45); // g1-f3
      assert.equal(await this.plyCount(page),3,'Resume works without forcing AI');
      assert.deepEqual(errors,[],'No touch/keyboard/vault uncaught errors');
      const viewport=await page.evaluate(()=>({
        width:document.documentElement.scrollWidth,screen:window.innerWidth
      }));
      assert.ok(viewport.width<=viewport.screen+8,'No mobile horizontal page overflow');
      return {mobile:'390px',touchDrag:true,keyboard:true,save:true,restore:true,paused:true};
    }finally{await context.close();}
  }
  async testSavedCopyInjection() {
    const {page,context,errors}=await this.open({viewport:{width:390,height:844},reducedMotion:'reduce'});
    try{
      await page.evaluate(()=>{
        const game={
          id:'legacy_1',title:'<img src=x onerror="window.__injected=true">',
          date:'Recently',category:'serious',variant:'standard',aiLevel:2,
          humanColor:'w',whiteTime:599,blackTime:600,
          baseTimeSeconds:600,incrementSeconds:0,
          fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          startFen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          uciHistory:[],moveCount:0
        };
        localStorage.setItem('chess3_offline_games_vault_v1',JSON.stringify([game]));
      });
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#cardResumeLast').waitFor({state:'visible'});
      await page.locator('#btnOpenVaultTab').click();
      assert.equal(await page.locator('#savedGamesVaultList img').count(),0,'Untrusted title cannot inject HTML');
      assert.equal(await page.evaluate(()=>window.__injected===true),false);
      await page.locator('#cardResumeLast').click({force:true});
      const fen=await page.locator('#fenInputBox').inputValue();
      assert.match(fen,/ w KQkq /,'Legacy saved copy restored');
      await page.waitForTimeout(250);
      assert.deepEqual(errors,[]);
      return {legacy:true,safeTitle:true};
    }finally{await context.close();}
  }
  async testAiArena() {
    const {page,context,errors}=await this.open({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    try{
      await page.evaluate(()=>{
        window.__stallMax=0;
        window.__lastBeat=performance.now();
        window.__beat=setInterval(()=>{
          const n=performance.now();window.__stallMax=Math.max(window.__stallMax,n-window.__lastBeat);
          window.__lastBeat=n;
        },35);
      });
      await this.setMode(page,'aivsai',2);
      await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=10,
        null,{timeout:40000});
      const before=await this.plyCount(page);
      await page.locator('#btnTopStartPause').click();
      await page.waitForTimeout(900);
      const after=await this.plyCount(page);
      assert.equal(after,before,'Pause freezes current AI-vs-AI history');
      assert.equal(await page.evaluate(()=>window.__chessBeastPerformance().aiInFlight),false);
      const perf=await page.evaluate(()=>{
        clearInterval(window.__beat);return {
          maxEventLoopDelay:window.__stallMax,
          fallbackCount:window.__chessBeastPerformance().fallbackCount,
          lastSearchMs:window.__chessBeastPerformance().lastSearchMs
        };
      });
      assert.ok(perf.maxEventLoopDelay<900,'Main UI freezes while engines move: '+perf.maxEventLoopDelay);
      await page.locator('#btnTopStartPause').click();
      await page.waitForFunction((target)=>Number(document.getElementById('moveRewindScrubber').value)>target,
        before,{timeout:12000});
      await page.locator('#btnTopReset').click();
      assert.equal(await this.plyCount(page),0,'Reset clears game');
      await page.waitForTimeout(800);
      assert.equal(await this.plyCount(page),0,'Stale worker move cannot appear after reset');
      assert.deepEqual(errors,[]);
      return {arena:true,plies:before,eventLoop:perf};
    }finally{await context.close();}
  }
  async testAnalysisAndCancellation() {
    const {page,context,errors}=await this.open({viewport:{width:320,height:760},reducedMotion:'reduce'});
    try{
      await this.setMode(page,'ai',6);
      await page.locator('#btnHint').click();
      await page.waitForFunction(()=>window.__chessBeastPerformance().aiInFlight===false,
        null,{timeout:10000});
      assert.ok(await page.locator('#statBestMoveVal').textContent(),'Hint responded');
      await page.locator('#btnAnalyzeNow').click();
      await page.locator('#btnTopReset').click();
      await page.waitForTimeout(950);
      assert.equal(await page.evaluate(()=>window.__chessBeastPerformance().aiInFlight),false);
      assert.equal(await this.plyCount(page),0,'Reset during AI analysis stays fresh');
      assert.deepEqual(errors,[]);
      return {width:320,hint:true,analysisCancel:true};
    }finally{await context.close();}
  }
  async run() {
    await this.start();
    try{
      const results=[];
      results.push(await this.testTouchVaultAndKeyboard());
      results.push(await this.testSavedCopyInjection());
      results.push(await this.testAiArena());
      results.push(await this.testAnalysisAndCancellation());
      console.log('CHESS_BEAST_DEEP_REAL_BROWSER_PASS '+JSON.stringify(results));
    }finally{
      await this.browser?.close();
      if(this.server)await new Promise(resolve=>this.server.close(resolve));
    }
  }
}
new ChessBeastDeepBrowserQA().run().catch(error=>{console.error(error);process.exitCode=1;});
