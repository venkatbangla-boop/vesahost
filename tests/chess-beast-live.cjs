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
 'apps/chess-360/sw.js','js/app-catalogue.js','service-worker.js'
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
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
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
        measurements.push({width,moves:2,aiMs:state.performance.lastSearchMs});
      }finally{await context.close()}
    }
  }finally{await browser.close()}
  console.log('CHESS_BEAST_LIVE_BROWSER_PASS '+JSON.stringify({sha,host,measurements}));
}
(async()=>{await verifyAssets();await verifyGame()})().catch(e=>{console.error(e);process.exitCode=1;});
