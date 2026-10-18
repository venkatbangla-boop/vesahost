/**
 * Chess Beast 360 — LIVE-quality Real 3D + both sidebar hide/reopen gate.
 * Browser work is performed against actual static app, not a mocked board.
 * Confirms the HUD and true sculpted PBR scene remain usable after layout
 * changes at phone/tablet/desktop/67%-zoom-equivalent CSS viewports.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
const SCREENSHOTS=path.join(ROOT,'output/chess-real3d-panel');
const CONTENT_TYPES={
 '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
 '.css':'text/css','.jpg':'image/jpeg','.png':'image/png',
 '.svg':'image/svg+xml','.gltf':'model/gltf+json','.bin':'application/octet-stream',
 '.json':'application/json'
};
async function webServer(){
 const server=http.createServer((req,res)=>{
  try{
   const request=new URL(req.url,'http://localhost');
   let file=path.resolve(ROOT,'.'+decodeURIComponent(request.pathname));
   if(!file.startsWith(ROOT+path.sep))return res.writeHead(403).end();
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   res.writeHead(200,{'Content-Type':CONTENT_TYPES[path.extname(file)]||'application/octet-stream',
      'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {server,url:'http://127.0.0.1:'+server.address().port+'/apps/chess-360/'};
}
async function inspect(page){
 return page.evaluate(()=>{
  const rect=id=>{
   const node=document.getElementById(id),r=node?.getBoundingClientRect();
   return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null;
  };
  const diag=window.__chessBeastStudioState?.()||{};
  return {viewport:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,
   leftHidden:document.body.classList.contains('chess-left-hidden'),
   rightHidden:document.body.classList.contains('drawer-collapsed'),
   board:rect('boardFrame'),canvas:rect('chessStudioCanvas'),hud:rect('chess3DHud'),
   rightPanel:rect('rightSidebarDrawer'),
   hudButtons:['btnCameraQuickRotate','btnCameraQuickShowcase','btnCameraQuickReset'].map(rect),
   camera:window.__chessBeastOrbitState?.(),studio:{ready:diag.ready,active:diag.active,
    models:diag.loadedModels,pieces:diag.pieceCount,frames:diag.frames}};
 });
}
function overlap(a,b){
 if(!a||!b)return false;
 return a.x < b.x+b.w-1&&a.x+a.w > b.x+1&&
  a.y < b.y+b.h-1&&a.y+a.h>b.y+1;
}
async function checkHud(page,width,mode){
 const d=await inspect(page);
 assert.equal(d.overflow<=8,true,mode+': document overflows viewport '+JSON.stringify(d));
 assert.ok(d.studio.ready&&d.studio.active&&d.studio.models===12&&d.studio.pieces===32,
   mode+': true GPU 3D scene lost '+JSON.stringify(d.studio));
 assert.ok(d.board?.w>=245&&d.canvas?.w>=245,mode+': board too small '+JSON.stringify(d.board));
 assert.ok(d.hud&&d.board&&d.hud.x>=d.board.x-1&&d.hud.x+d.hud.w<=d.board.x+d.board.w+1,
   mode+': camera HUD left/right outside board '+JSON.stringify(d));
 assert.ok(d.hud.y>=d.board.y-1&&d.hud.y+d.hud.h<=d.board.y+d.board.h+1,
   mode+': camera HUD vertical clipping '+JSON.stringify(d));
 for(const b of d.hudButtons)assert.ok(b.w>=45&&b.h>=35,
    mode+': too-small 3D button '+JSON.stringify(b));
 for(let i=0;i<d.hudButtons.length;i++)for(let j=i+1;j<d.hudButtons.length;j++)
   assert.ok(!overlap(d.hudButtons[i],d.hudButtons[j]),
     mode+': camera buttons overlap '+JSON.stringify(d.hudButtons));
 if(width>1180&&!d.rightHidden)assert.ok(d.board.x+d.board.w<=d.rightPanel.x+3,
   mode+': board overlaps right panel '+JSON.stringify(d));
 return d;
}
async function choose3D(page){
 await page.locator('#btn3DDirect').click();
 await page.waitForFunction(()=>{
  const s=window.__chessBeastStudioState?.();
  return s?.active&&s.ready&&s.pieceCount===32&&s.frames>=1;
 },null,{timeout:40000});
}
async function move3D(page,sq){
 const pt=await page.evaluate(n=>window.__chessBeastReal3DSquare(n),sq);
 assert.ok(pt&&Number.isFinite(pt.x)&&Number.isFinite(pt.y),'Square projection is valid '+sq);
 assert.equal(await page.evaluate(p=>window.__chessBeastReal3DPick(p.x,p.y),pt),sq,
   '3D square picking after sidebar reflow '+sq);
 await page.mouse.click(pt.x,pt.y);
}
async function testViewport(browser,url,width,height){
 const context=await browser.newContext({
  viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#chessboard .square').first().waitFor();
  await page.locator('#btnOpenNewGame').click();
  await page.locator('#modalModeRow [data-mode="pvp"]').click();
  await page.locator('#btnConfirmStartGame').click();
  await page.locator('#newGameModal').waitFor({state:'hidden'});
  await choose3D(page);
  await page.locator('#btnCameraQuickShowcase').click();
  await page.waitForFunction(()=>window.__chessBeastOrbitState?.().tilt===48);
  const starting=await checkHud(page,width,'initial');
  await page.locator('#btnCollapseDrawerInside').click();
  await page.waitForFunction(()=>document.body.classList.contains('drawer-collapsed'));
  assert.equal(await page.locator('#btnEdgeDrawerHandle').isVisible(),true,
    'Missing usable Show Game Panel button');
  const afterRight=await checkHud(page,width,'hide-right');
  if(width<=1180)await page.locator('#btnMobileMore').click();
  await page.locator('#btnHideLeftPanel').click();
  await page.waitForFunction(()=>document.body.classList.contains('chess-left-hidden'));
  assert.equal(await page.locator('#btnShowLeftPanel').isVisible(),true,'Missing Show Menu');
  await page.locator('#boardFrame').scrollIntoViewIfNeeded();
  const both=await checkHud(page,width,'hide-both');
  // Right camera controls must remain usable even with BOTH side panels hidden.
  await page.locator('#btnCameraQuickRotate').click();
  assert.equal(await page.locator('#btnCameraQuickRotate').getAttribute('aria-pressed'),
    'true','Rotate must work without side panels');
  await page.locator('#btnCameraQuickRotate').click();
  await page.locator('#btnCameraQuickReset').click();
  await page.waitForFunction(()=>window.__chessBeastOrbitState?.().tilt===26);
  const afterReset=await inspect(page);
  assert.equal(afterReset.camera.spin,0,'Reset returns classic orientation');
  assert.equal(afterReset.camera.yaw,0,'Reset returns classic yaw');
  // A move on the actual volumetric game board must still enter ChessEngine
  // after both panel hide operations (no invisible overlay steals the click).
  await move3D(page,52);
  await move3D(page,36);
  await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=1);
  const moves=Number(await page.locator('#moveRewindScrubber').inputValue());
  assert.equal(moves,1,'One human chess move after hiding both panels');
  if([390,1366,2040].includes(width)){
   fs.mkdirSync(SCREENSHOTS,{recursive:true});
   await page.screenshot({path:path.join(SCREENSHOTS,'panel-hidden-'+width+'.png'),
     animations:'disabled'});
  }
  await page.locator('#btnShowLeftPanel').click();
  await page.waitForFunction(()=>!document.body.classList.contains('chess-left-hidden'));
  await page.locator('#btnEdgeDrawerHandle').click();
  await page.waitForFunction(()=>!document.body.classList.contains('drawer-collapsed'));
  const restored=await checkHud(page,width,'restored');
  assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),moves,
    'Panel restoration changed chess move history');
  assert.deepEqual(errors,[],'Uncaught UI errors at '+width+'px');
  console.log('CHESS_REAL3D_PANEL_PASS '+JSON.stringify({
   width,height,startingBoard:Math.round(starting.board.w),
   rightHiddenBoard:Math.round(afterRight.board.w),
   bothHiddenBoard:Math.round(both.board.w),
   restoredBoard:Math.round(restored.board.w),
   cameraAccessible:true,pickedMove:moves,models:restored.studio.models,
   pieces:restored.studio.pieces
  }));
 }finally{await context.close();}
}
async function main(){
 const {server,url}=await webServer();
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROMIUM_PATH||undefined,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  for(const [w,h] of [[390,844],[1024,768],[1366,768],[2040,1110]])
   await testViewport(browser,url,w,h);
 }finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
