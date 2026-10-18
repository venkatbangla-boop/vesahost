/**
 * Chess Beast 360 real screenshot + responsive geometry acceptance.
 *
 * Owner: visual QA only. Each synthetic test uses a disposable local browser
 * context and source served from the checked-out branch. No external access,
 * no real game records or manual screenshot edits.
 *
 * Usage: node tests/chess-beast-visual.cjs
 * With CHESS_IMAGE_LOG=1 it emits two tiny screenshot JPEGs for manual review.
 */
'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

class ChessBeastVisualQA {
  constructor() {
    this.root=path.resolve(__dirname,'..');
    this.server=null;this.browser=null;this.origin='';
  }
  async start() {
    this.server=http.createServer((req,res)=>{
      try{
        let p=path.resolve(this.root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
        if(!p.startsWith(this.root+path.sep))return res.writeHead(403).end();
        if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
        const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(p)]||'application/octet-stream';
        res.writeHead(200,{'Content-Type':type}).end(fs.readFileSync(p));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.origin='http://127.0.0.1:'+this.server.address().port;
    this.browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  }
  async inspect(width,height) {
    const ctx=await this.browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(this.origin+'/apps/chess-360/',{waitUntil:'domcontentloaded'});
    await page.locator('#chessboard .square').first().waitFor();
    await page.locator('#btnTopStartPause').click();
    await page.waitForTimeout(300);
    const geometry=await page.evaluate(()=>{
      const bound=id=>{
        const r=document.getElementById(id)?.getBoundingClientRect();
        return r&&{left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width)};
      };
      return {
        viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        board:bound('boardFrame'),startButton:bound('btnTopStartPause'),
        header:bound('btnOpenNewGame'),panel:bound('rightSidebarDrawer'),
        title:document.title,squareCount:document.querySelectorAll('#chessboard .square').length,
        bodyTheme:document.body.className,
        motion:document.querySelector('#beastFxMode')?.value,
        background:getComputedStyle(document.body).backgroundColor
      };
    });
    assert.equal(geometry.squareCount,64);
    assert.ok(geometry.scrollWidth<=width+4,width+'px width overflow '+JSON.stringify(geometry));
    assert.ok(geometry.board.left>=-4&&geometry.board.right<=width+4,'board extends off screen '+width);
    assert.equal(await page.locator('#appTitleText').textContent(),'Chess Beast 360');
    assert.equal(await page.locator('#appSubText').textContent(),'Powered by EGENVA');
    assert.deepEqual(errors,[]);
    if([390,1440].includes(width)) {
      const directory=path.join(process.cwd(),'output/chess-beast-v2');
      fs.mkdirSync(directory,{recursive:true});
      const image=await page.screenshot({type:'jpeg',quality:55,fullPage:false});
      fs.writeFileSync(path.join(directory,'chess-'+width+'.jpg'),image);
      if(process.env.CHESS_IMAGE_LOG==='1')console.log('CHESS_VISUAL_IMAGE_'+width+'_BASE64 '+image.toString('base64'));
    }
    await ctx.close();
    return {width,geometry};
  }
  async run() {
    await this.start();
    try{
      const results=[];
      for(const [w,h] of [[320,760],[390,844],[768,900],[1440,900]])results.push(await this.inspect(w,h));
      console.log('CHESS_BEAST_VISUAL_PASS '+JSON.stringify(results));
    }finally{
      await this.browser?.close();
      if(this.server)await new Promise(resolve=>this.server.close(resolve));
    }
  }
}
new ChessBeastVisualQA().run().catch(e=>{console.error(e);process.exitCode=1;});
