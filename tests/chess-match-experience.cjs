/**
 * Chess Match Experience regression: terminal results, PDF, customization,
 * browser reload recovery and native AI levels. Synthetic game data only.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
async function run(){
 const server=http.createServer((req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
   if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   res.writeHead(200,{'Content-Type':({'.js':'text/javascript','.css':'text/css','.html':'text/html'}[path.extname(file)]||'application/octet-stream'),'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const url='http://127.0.0.1:'+server.address().port+'/apps/chess-360/';
 try{
  for(const width of [390,1440]){
   const ctx=await browser.newContext({viewport:{width,height:850},acceptDownloads:true,serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);
   await page.locator('#chessboard .square').first().waitFor();
   // every control accessible at phone and desktop widths
   if(width<=1180)await page.locator('#btnMobileMore').click();
   await page.locator('#btnOpenCustomize').click();
   assert.equal(await page.locator('#chessCustomizeModal').getAttribute('aria-hidden'),'false');
   await page.locator('#chessPrefMotion').selectOption('off');
   await page.locator('#chessPrefCapture').selectOption('off');
   await page.locator('#chessPrefDifficulty').selectOption('1');
   await page.locator('#btnApplyCustomize').click();
   assert.equal(await page.locator('#beastFxMode').inputValue(),'off');
   assert.equal(await page.evaluate(()=>localStorage.getItem('chess_beast_capture_fx')),'off');
   assert.equal(await page.locator('#chessCustomizeModal').getAttribute('aria-hidden'),'true');
   await page.locator('#btnOpenNewGame').click();
   await page.locator('#modalModeRow [data-mode="pvp"]').click();
   await page.locator('#btnConfirmStartGame').click();
   const move=async(from,to)=>{
     await page.locator('#chessboard [data-sq="'+from+'"]').click();
     await page.locator('#chessboard [data-sq="'+to+'"]').click();
   };
   // Fool's mate: 1.f3 e5 2.g4 Qh4#
   await move(53,45);await move(12,28);await move(54,38);await move(3,39);
   await page.locator('#gameOverModal.open').waitFor({timeout:10000});
   assert.match(await page.locator('#gameOverHeadline').innerText(),/Black Wins/i);
   assert.match(await page.locator('#gameOverScorecardBox').innerText(),/0-1/);
   assert.equal(await page.locator('#gameOverModal').getAttribute('aria-hidden'),'false');
   const pending=page.waitForEvent('download');
   await page.locator('#btnResultPdf').click();
   const download=await pending, bytes=fs.readFileSync(await download.path());
   assert.equal(bytes.toString('latin1',0,8),'%PDF-1.4');
   assert.match(bytes.toString('latin1'),/xref\s+0/);
   assert.ok(bytes.length>1200,'PDF should contain report content');
   await page.locator('#btnCloseGameOver').click();
   assert.equal(await page.locator('#gameOverModal').getAttribute('aria-hidden'),'true');
   const current=await page.locator('#fenInputBox').inputValue();
   await page.reload();
   await page.locator('#chessResumeNotice').waitFor();
   await page.locator('#chessResumeNotice button').first().click();
   assert.equal(await page.locator('#fenInputBox').inputValue(),current,'restores ended full position');
   assert.deepEqual(errors,[],'No JS errors');
   const geom=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
   assert.ok(geom.scroll<=geom.width+10,'no horizontal overflow');
   console.log('CHESS_MATCH_EXPERIENCE_PASS',width,bytes.length);
   await ctx.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1});
