/**
 * Chess casual-phone browser acceptance.
 * Owns read-only geometry/interaction assertions in disposable Chromium; no
 * production game state, backend or user storage is touched.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
class ChessCasualMobileQA {
 constructor(){this.root=path.resolve(__dirname,'..');this.server=null;this.browser=null;}
 async boot(){
  this.server=http.createServer((req,res)=>{
   try{
    let p=path.resolve(this.root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!p.startsWith(this.root+path.sep))return res.writeHead(403).end();
    if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
    res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(p)]||'application/octet-stream'}).end(fs.readFileSync(p));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
  this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 }
 async phone(width,height){
  const ctx=await this.browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
   await page.goto('http://127.0.0.1:'+this.server.address().port+'/apps/chess-360/',{waitUntil:'domcontentloaded'});
   await page.locator('#chessboard .square').first().waitFor({timeout:25000});
   assert.equal(await page.locator('#chessboard .square').count(),64);
   assert.equal(await page.locator('#topStyleBadge').isVisible(),false);
   assert.equal(await page.locator('#chessCasualBar').isVisible(),true);
   assert.equal(await page.locator('#btn3DDirect').isVisible(),true);
   const data=await page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width}};
    return {scrollWidth:document.documentElement.scrollWidth,board:rect('#boardFrame'),player:rect('#bottomPlayerCard'),bar:rect('#chessCasualBar'),screen:innerWidth};
   });
   assert.ok(data.scrollWidth<=width+5,'No horizontal overflow '+JSON.stringify(data));
   assert.ok(data.board.bottom<=data.player.top+5,'Board/player order '+JSON.stringify(data));
   assert.ok(data.player.bottom<=data.bar.top+5,'Player/review order '+JSON.stringify(data));
   assert.ok(data.bar.bottom<=height+135,'Review stays near board '+JSON.stringify(data));
   await page.locator('#btnTopStartPause').click();
   await page.locator('#chessboard [data-sq="52"]').click();
   await page.locator('#chessboard [data-sq="36"]').click();
   await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=2,null,{timeout:20000});
   await page.locator('#chessCasualBar [data-chess-forward="btnStepFirst"]').click();
   await page.waitForFunction(()=>document.getElementById('moveRewindScrubber').value==='0');
   await page.locator('#chessCasualBar [data-chess-forward="btnStepLast"]').click();
   await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=1);
   await page.locator('#chessCasualSave').click();
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('chess3_offline_games_vault_v1')||'[]').length)>=1);
   assert.deepEqual(errors,[]);
   console.log('CHESS_CASUAL_MOBILE_PASS '+JSON.stringify({width,height,barBottom:Math.round(data.bar.bottom)}));
  }finally{await ctx.close();}
 }
 async run(){
  await this.boot();
  try{for(const [w,h] of [[320,700],[360,780],[390,844],[412,915]])await this.phone(w,h);}
  finally{await this.browser.close();await new Promise(resolve=>this.server.close(resolve));}
 }
}
new ChessCasualMobileQA().run().catch(error=>{console.error(error);process.exitCode=1;});
