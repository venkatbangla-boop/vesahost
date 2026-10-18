/**
 * Diagnostic-only LIVE public release test for production 3D initialization.
 * No customer data, synthetic fresh browser contexts. Inspect console/CORS/
 * Content-Type and WebGL readiness with no assumptions about the result.
 */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const base='https://vesaent.com/apps/chess-360/';
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader'
  ]});
  try{
    for(const width of [1440,390]){
      const ctx=await browser.newContext({
        viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await ctx.newPage();
      const errors=[],requests=[],consoles=[],responses=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')consoles.push(m.type()+': '+m.text());});
      page.on('requestfailed',r=>requests.push(r.url()+' '+JSON.stringify(r.failure())));
      page.on('response',r=>{if(r.status()>=400)responses.push(r.status()+' '+r.url());});
      try{
        await page.goto(base+'?public-3d-debug='+Date.now(),{waitUntil:'domcontentloaded',timeout:40000});
        await page.locator('#chessboard .square').first().waitFor();
        const files={};
        for(const part of [
          'chess-real-3d-studio.mjs','vendor/three.module.js',
          'vendor/GLTFLoader.js','assets/real3d/chess_set_1k.gltf'
        ]){
          try{
            const response=await page.request.get(base+part+'?ts='+Date.now());
            files[part]={status:response.status(),mime:response.headers()['content-type'],
              bytes:(await response.body()).length};
          }catch(e){files[part]={error:e.message};}
        }
        if(width===1440){
          // Exact public acceptance journey: first e4, wait for AI's move,
          // then switch to Real 3D. This is distinct from startup mode.
          await page.locator('#btnTopStartPause').click();
          await page.locator('#chessboard [data-sq="52"]').click();
          await page.locator('#chessboard [data-sq="36"]').click();
          await page.waitForFunction(()=>
            Number(document.getElementById('moveRewindScrubber').value)>=2,
            null,{timeout:22000});
          console.log('PUBLIC_AFTER_AI_BEFORE_3D '+JSON.stringify(
            await page.evaluate(()=>({scrubber:document.getElementById('moveRewindScrubber').value,
              status:document.getElementById('matchStatus')?.textContent,
              playing:document.getElementById('btnTopStartPause')?.textContent}))));
        }
        await page.locator('#btn3DDirect').click();
        let history=[];
        for(let i=0;i<25;i++){
          const snapshot=await page.evaluate(()=>({
            camera:window.__chessBeastOrbitState?.(),
            procedural:window.__chessBeastReal3DState?.(),
            studio:window.__chessBeastStudioState?.(),
            status:document.getElementById('chessReal3DStatus')?.textContent,
            board3d:document.body.classList.contains('board-3d'),
            real3d:document.body.classList.contains('real3d-active')
          }));
          if(i%5===0||snapshot.studio?.ready||/unavailable/.test(snapshot.status||'')){
            history.push({afterSec:i,studio:snapshot.studio,status:snapshot.status,
              procedural:snapshot.procedural?.supported,board3d:snapshot.board3d});
          }
          if(snapshot.studio?.ready || /unavailable/.test(snapshot.status||''))break;
          await page.waitForTimeout(1000);
        }
        const result=await page.evaluate(()=>({
          camera:window.__chessBeastOrbitState?.(),
          proc:window.__chessBeastReal3DState?.(),
          studio:window.__chessBeastStudioState?.(),
          status:document.getElementById('chessReal3DStatus')?.textContent
        }));
        const out=path.resolve('output/chess-real3d-public-debug');
        fs.mkdirSync(out,{recursive:true});
        await page.screenshot({path:path.join(out,'live-3d-debug-'+width+'.png'),animations:'disabled'});
        console.log('CHESS_REAL3D_PUBLIC_DEBUG '+JSON.stringify({
          width,files,history,result,errors,requests,consoles,responses
        }).slice(0,16500));
      }finally{await ctx.close();}
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
