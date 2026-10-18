/**
 * Chess Beast 360 — public Pages exact-byte and real-browser release verification.
 * Synthetic browser profile; no real customer data or account integration.
 */
'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const host=(process.env.CHESS_PUBLIC_ORIGIN||'https://vesaent.com').replace(/\/+$/,'');
const sha=process.env.CHESS_EXPECTED_SHA||'unknown';
const repo=path.resolve(__dirname,'..');
const assets=[
 'apps/chess-360/index.html','apps/chess-360/chess-ai-worker.js',
 'apps/chess-360/chess-beast-ui.js','apps/chess-360/chess-beast.css',
 'apps/chess-360/chess-report.js','apps/chess-360/chess-match-experience.css',
 'apps/chess-360/chess-orbit.js','apps/chess-360/chess-pro-ux.css',
 'apps/chess-360/chess-panel-ui.js','apps/chess-360/chess-panel-ui.css',
 'apps/chess-360/sw.js','js/app-catalogue.js','service-worker.js',
 'apps/chess-360/chess-real-3d.js',
 'apps/chess-360/chess-real-3d-models.js',
 'apps/chess-360/chess-real-3d.css',
 'apps/chess-360/chess-real-3d-studio.mjs',
 'apps/chess-360/vendor/three.module.js',
 'apps/chess-360/vendor/three.core.js',
 'apps/chess-360/vendor/GLTFLoader.js',
 'apps/chess-360/vendor/BufferGeometryUtils.js',
 'apps/chess-360/vendor/THREE_LICENSE_MIT.txt',
 'apps/chess-360/assets/real3d/chess_set_1k.gltf',
 'apps/chess-360/assets/real3d/chess_set.bin',
 'apps/chess-360/assets/real3d/MANIFEST.json',
 'apps/chess-360/assets/real3d/LICENSE_CC0.txt',
 ...['pieces_white_nor_gl','pieces_white_diff','pieces_white_arm',
     'board_nor_gl','board_diff','board_arm',
     'pieces_black_nor_gl','pieces_black_diff','pieces_black_arm']
     .map(name=>'apps/chess-360/assets/real3d/textures/chess_set_'+name+'_1k.jpg')
];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
async function assetResult(name){
  const r=await fetch(host+'/'+name+'?verify='+encodeURIComponent(sha),{
    signal:AbortSignal.timeout(18000),headers:{'Cache-Control':'no-cache'}
  });
  if(!r.ok)throw Error(name+' returned HTTP '+r.status);
  const actual=Buffer.from(await r.arrayBuffer());
  const expected=fs.readFileSync(path.join(repo,name));
  if(hash(expected)!==hash(actual))throw Error(name+' bytes differ: expected '+hash(expected)+' received '+hash(actual));
}
async function verifyAssets(){
  let errors=[];
  for(let attempt=1;attempt<=9;attempt++){
    errors=[];
    for(const name of assets){
      try{await assetResult(name)}catch(e){errors.push(String(e.message||e))}
    }
    if(!errors.length){
      console.log('CHESS_BEAST_LIVE_BYTES_PASS '+JSON.stringify({sha,host,files:assets.length,attempt}));
      return;
    }
    console.warn('LIVE_ASSETS_RETRY '+attempt+' '+errors.join(' ; ').slice(0,1200));
    if(attempt<9)await sleep(15000);
  }
  throw Error('Public asset parity is not verified: '+errors.join(' ; '));
}
async function verifyGame(){
  const browser=await chromium.launch({headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
  const measurements=[];
  try{
    for(const width of [390,1440]){
      const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      try{
        const response=await page.goto(host+'/apps/chess-360/?verify='+sha,{waitUntil:'domcontentloaded',timeout:40000});
        assert.equal(response?.status(),200);
        await page.locator('#chessboard .square').first().waitFor({timeout:25000});
        assert.equal(await page.locator('#chessboard .square').count(),64);
        assert.equal(await page.locator('#appSubText').textContent(),'Powered by EGENVA');
        await page.locator('#btnTopStartPause').click();
        await page.locator('#chessboard [data-sq="52"]').click();
        await page.locator('#chessboard [data-sq="36"]').click();
        await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=2,
          null,{timeout:20000});
        const state=await page.evaluate(()=>({
          performance:window.__chessBeastPerformance(),
          viewport:window.innerWidth,
          scrollWidth:document.documentElement.scrollWidth
        }));
        assert.equal(state.performance.fallbackCount,0,'Public AI worker fallback');
        assert.ok(state.scrollWidth<=state.viewport+4,'Public page horizontal overflow');
        assert.deepEqual(errors,[],'Public game JS errors');
        // Production-only PBR studio proof, not the simplified CSS 3D view.
        await page.locator('#btn3DDirect').click();
        await page.waitForFunction(()=>{
          const s=window.__chessBeastStudioState?.();
          return !!s?.ready&&!!s?.active&&s.pieceCount>=30&&s.frames>=1;
        },null,{timeout:30000});
        const studio=await page.evaluate(()=>window.__chessBeastStudioState());
        assert.equal(studio.loadedModels,12,'All six licensed piece shapes on both sides');
        assert.equal(studio.assetsOffline,true,'Licensed PBR assets vendored locally');
        assert.equal(studio.remoteRuntimeRequests,0,'No external model requests');
        assert.equal(await page.locator('#chessStudioCanvas').isVisible(),true);
        // Verify one-click demo camera on the actual deployed website.
        await page.locator('#btnCameraShowcase').click();
        await page.waitForFunction(()=>Math.round(window.__chessBeastOrbitState()?.tilt)===48);
        const canvas=await page.locator('#chessStudioCanvas').boundingBox();
        assert.ok(canvas?.width>250,'Live physically rendered 3D canvas');
        const out=path.join(repo,'output/chess-public');
        fs.mkdirSync(out,{recursive:true});
        await page.screenshot({path:path.join(out,'real3d-live-'+width+'.png'),animations:'disabled'});
        assert.deepEqual(errors,[],'Public 3D shader or model loading error at '+width);
        measurements.push({width,moves:2,aiMs:state.performance.lastSearchMs,
          real3DModels:studio.loadedModels,real3DPieces:studio.pieceCount,
          offlineLocalModels:true});
      }finally{await context.close()}
    }
  }finally{await browser.close()}
  console.log('CHESS_BEAST_LIVE_BROWSER_PASS '+JSON.stringify({sha,host,measurements}));
}
(async()=>{await verifyAssets();await verifyGame()})().catch(e=>{console.error(e);process.exitCode=1;});
