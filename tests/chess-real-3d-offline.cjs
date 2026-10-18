/**
 * Full offline premium 3D acceptance. No mock cache: installs the actual
 * app-owned Chess service worker, disconnects Chromium from all networks,
 * reloads and lazy-loads the 7 MB CC0 glTF + Three.js PBR scene offline.
 * Independently exercises the real chess route, not a standalone mock.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
async function run(){
  const server=http.createServer((req,res)=>{
    try{
      const uri=new URL(req.url,'http://127.0.0.1');
      let file=path.resolve(root,'.'+decodeURIComponent(uri.pathname));
      if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
      if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      const ext=path.extname(file);
      const type={
        '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
        '.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg',
        '.gltf':'model/gltf+json','.bin':'application/octet-stream'
      }[ext]||'application/octet-stream';
      res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
      res.end(fs.readFileSync(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const browser=await chromium.launch({headless:true,
    executablePath:process.env.CHROMIUM_PATH||undefined,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
  const ctx=await browser.newContext({
    viewport:{width:390,height:844},serviceWorkers:'allow',reducedMotion:'reduce'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  const url='http://127.0.0.1:'+server.address().port+'/apps/chess-360/';
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#chessboard .square').first().waitFor();
    const ready=await page.evaluate(async()=>{
      const registration=await navigator.serviceWorker.ready;
      if(!registration.active)throw Error('Chess SW not active');
      return {scope:registration.scope,state:registration.active.state};
    });
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:30000});
    const assets=await page.evaluate(async()=>{
      const keys=await caches.keys();
      const chess=keys.filter(k=>k.startsWith('chess-beast-v2-'));
      if(!chess.length)throw Error('Chess static cache did not install');
      const cache=await caches.open(chess[chess.length-1]);
      const list=await cache.keys();
      const paths=list.map(x=>new URL(x.url).pathname);
      const expected=[
        'chess-real-3d-studio.mjs','three.core.js','GLTFLoader.js',
        'chess_set_1k.gltf','chess_set.bin','chess_set_board_diff_1k.jpg',
        'chess_set_pieces_white_diff_1k.jpg','chess_set_pieces_black_diff_1k.jpg'
      ];
      for(const name of expected)if(!paths.some(p=>p.endsWith('/'+name)))
        throw Error('Missing offline studio asset '+name);
      return {cache:chess[chess.length-1],count:paths.length};
    });
    assert.ok(assets.count>=29,'All 3D files pre-cached');
    await page.locator('#btn3DDirect').click();
    await page.waitForFunction(()=>window.__chessBeastStudioState?.().ready,{timeout:30000});
    const online=await page.evaluate(()=>window.__chessBeastStudioState());
    assert.equal(online.pieceCount,32);
    assert.equal(online.loadedModels,12);

    await ctx.setOffline(true);
    assert.equal(await page.evaluate(()=>navigator.onLine),false,'Browser truly disconnected');
    await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#chessboard .square').first().waitFor();
    await page.locator('#btn3DDirect').click();
    await page.waitForFunction(()=>window.__chessBeastStudioState?.().ready,{timeout:30000});
    const offline=await page.evaluate(()=>window.__chessBeastStudioState());
    assert.equal(offline.active,true);
    assert.equal(offline.pieceCount,32);
    assert.equal(offline.loadedModels,12);
    assert.equal(offline.assetsOffline,true);
    assert.equal(await page.locator('#chessStudioCanvas').isVisible(),true);
    assert.deepEqual(errors,[],'No uncaught exceptions while entirely offline');
    console.log('CHESS_REAL_3D_FULL_OFFLINE_RELOAD_PASS '+JSON.stringify({
      serviceWorker:ready.state,cache:assets.cache,assetCount:assets.count,
      offlineLoadedMeshes:offline.loadedModels,offlinePieces:offline.pieceCount,
      renderedFrames:offline.frames}));
  }finally{
    await ctx.setOffline(false);
    await ctx.close();await browser.close();
    await new Promise(ok=>server.close(ok));
  }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
