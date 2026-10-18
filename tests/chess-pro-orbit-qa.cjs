/**
 * Chess Beast PRO / 360° Orbit
 * Real Chromium + emulated Android touch, WebKit + emulated iPhone.
 * Reads and writes only synthetic disposable browser profiles.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit,devices}=require('playwright');
const root=path.resolve(__dirname,'..');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
class ChessProQA {
  async start(){
    this.server=http.createServer((request,response)=>{
      try{
        const url=new URL(request.url,'http://127.0.0.1');
        let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
        if(!file.startsWith(root+path.sep))return response.writeHead(403).end();
        if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
        const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
        response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
      }catch(error){response.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.url='http://127.0.0.1:'+this.server.address().port+'/apps/chess-360/';
    this.chromium=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  }
  async open(browser,profile){
    const context=await browser.newContext({...profile,serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(this.url,{waitUntil:'domcontentloaded',timeout:35000});
    await page.locator('#chessboard .square').first().waitFor({timeout:15000});
    assert.equal(await page.locator('#chessboard .square').count(),64);
    return {page,context,errors};
  }
  async newGame(page,mode='pvp',level=1){
    await page.locator('#btnOpenNewGame').click();
    await page.locator('#modalLevelRow [data-lvl="'+level+'"]').click();
    await page.locator('#modalModeRow [data-mode="'+mode+'"]').click();
    await page.locator('#btnConfirmStartGame').click();
    await page.locator('#newGameModal').waitFor({state:'hidden'});
  }
  async move(page,from,to){
    await page.locator('#chessboard [data-sq="'+from+'"]').click();
    await page.locator('#chessboard [data-sq="'+to+'"]').click();
  }
  async desktop(){
    const {page,context,errors}=await this.open(this.chromium,{viewport:{width:1440,height:900}});
    try{
      assert.equal(await page.locator('#btnQuietMode').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('#companionPetCard').isVisible(),false,'Focus hides pet');
      assert.equal(await page.locator('#chessCameraControls').isVisible(),false,'2D hides orbit controls');
      await this.newGame(page,'pvp',6);
      await this.move(page,52,36);
      assert.equal(await page.locator('#arrowsLayerGroup line').count(),0,'No unsolicited arrows, even in Expert');
      assert.equal(await page.locator('#chessboard .square.last-move').count(),2,'Last move highlighted');
      await page.locator('#chessboard [data-sq="12"]').click();
      assert.ok(await page.locator('#chessboard .move-dot').count()>0,'Legal dots remain for level 6');
      assert.equal(await page.locator('#chessboard .move-dot').first().isVisible(),true);
      await page.locator('#btnToggle3D').click();
      assert.equal(await page.locator('#chessCameraControls').isVisible(),true,'Camera toolbar visible in 3D');
      await page.locator('#btnCameraRotate').click();
      assert.equal(await page.locator('#btnCameraRotate').getAttribute('aria-pressed'),'true');
      const before=Number(await page.locator('#moveRewindScrubber').inputValue());
      const box=await page.locator('#boardFrame').boundingBox();
      assert.ok(box&&box.width>120);
      const px=box.x+box.width*.5,py=box.y+box.height*.5;
      await page.mouse.move(px,py);
      await page.mouse.down();
      await page.mouse.move(px+110,py+38,{steps:9});
      await page.mouse.up();
      await page.waitForTimeout(200);
      const orbit=await page.evaluate(()=>window.__chessBeastOrbitState());
      assert.ok(orbit.yaw>35,'Drag rotates 3D yaw');
      assert.ok(orbit.tilt>26,'Drag changes tilt');
      assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),before,'Rotation must never play a chess move');
      await page.locator('#btnCameraSpinRight').click();
      let orbit2=await page.evaluate(()=>window.__chessBeastOrbitState());
      assert.equal(Math.round((orbit2.spin+360)%360),45,'Spin 45 degrees');
      await page.locator('#btnCameraReset').click();
      orbit2=await page.evaluate(()=>window.__chessBeastOrbitState());
      assert.equal(Math.round(orbit2.yaw),0);
      assert.equal(Math.round(orbit2.spin),0);
      await page.locator('#btnCameraRotate').click();
      assert.equal(await page.locator('#btnCameraRotate').getAttribute('aria-pressed'),'false');
      await page.locator('#btnToggle3D').click();
      await this.move(page,12,28);
      assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),2,'Piece moves work after rotating');
      await page.locator('#btnQuietMode').click();
      assert.equal(await page.locator('#companionPetCard').isVisible(),true);
      await page.locator('#btnQuietMode').click();
      assert.equal(await page.locator('#companionPetCard').isVisible(),false);
      await page.locator('#btnOpenCustomize').click();
      assert.equal(await page.locator('#chessPrefAutoArrows').inputValue(),'off');
      await page.locator('#chessPrefAutoArrows').selectOption('on');
      await page.locator('#chessPrefQuiet').selectOption('off');
      await page.locator('#btnApplyCustomize').click();
      assert.ok(await page.locator('#arrowsLayerGroup line').count()>=1,'User opts into last-move arrow');
      await page.locator('#btnResign').click();
      assert.equal(await page.locator('#chessResignModal').isVisible(),true,'Resign confirmation');
      await page.locator('#btnCancelResign').click();
      assert.equal(await page.locator('#chessResignModal').isVisible(),false);
      assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),2);
      await page.locator('#btnResign').click();
      await page.locator('#btnConfirmResign').click();
      await page.locator('#gameOverModal.open').waitFor();
      assert.match(await page.locator('#gameOverReason').innerText(),/resigned/i);
      await page.reload();
      await page.locator('#chessResumeNotice').waitFor({timeout:7000});
      await page.locator('#chessResumeNotice button').first().click();
      assert.ok(Number(await page.locator('#moveRewindScrubber').inputValue())>=2);
      assert.deepEqual(errors,[],'No desktop JS exceptions');
      const rect=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));
      assert.ok(rect.content<=rect.viewport+8,'No desktop x overflow');
      console.log('CHESS_PRO_DESKTOP_PASS '+JSON.stringify({orbit,restored:true,aria:true,arrows:true}));
    }finally{await context.close();}
  }
  async mobile(browser,name,profile){
    const {page,context,errors}=await this.open(browser,profile);
    try{
      await this.newGame(page,'pvp',1);
      await page.locator('#btnToggle3D').click();
      assert.equal(await page.locator('#chessCameraControls').isVisible(),true,name+' sees orbit toolbar');
      await page.locator('#btnCameraRotate').click();
      const box=await page.locator('#boardFrame').boundingBox();
      const x=box.x+box.width/2,y=box.y+box.height/2;
      await page.evaluate(({x,y})=>{
        const el=document.querySelector('#chessboard [data-sq="36"]');
        const start={pointerId:21,pointerType:'touch',isPrimary:true,bubbles:true,cancelable:true};
        el.dispatchEvent(new PointerEvent('pointerdown',{...start,clientX:x,clientY:y}));
        window.dispatchEvent(new PointerEvent('pointermove',{...start,clientX:x+110,clientY:y+27}));
        window.dispatchEvent(new PointerEvent('pointerup',{...start,clientX:x+110,clientY:y+27}));
      },{x,y});
      await page.waitForTimeout(140);
      const camera=await page.evaluate(()=>window.__chessBeastOrbitState());
      assert.ok(camera.yaw>60,'Touch orbit rotates yaw on '+name);
      assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),0,'Touch rotate does not move chess pieces');
      await page.locator('#btnCameraReset').click();
      await page.locator('#btnCameraRotate').click();
      await page.locator('#btnToggle3D').click();
      await this.move(page,52,36);
      assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),1,name+' legal chess tap');
      assert.equal(await page.locator('#arrowsLayerGroup line').count(),0);
      const rect=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));
      assert.ok(rect.content<=rect.viewport+10,name+' no x overflow: '+JSON.stringify(rect));
      assert.deepEqual(errors,[],name+' no JS exceptions');
      console.log('CHESS_PRO_MOBILE_PASS '+JSON.stringify({name,camera,rect}));
    }finally{await context.close();}
  }
  async sixLevels(){
    const {page,context,errors}=await this.open(this.chromium,{viewport:{width:1280,height:850}});
    const measurements=[];
    try{
      for(let level=1;level<=6;level++){
        await this.newGame(page,'aivsai',level);
        await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=4,null,{timeout:45000});
        const info=await page.evaluate(()=>({
          moves:Number(document.getElementById('moveRewindScrubber').value),
          perf:window.__chessBeastPerformance(),
          arrows:document.querySelectorAll('#arrowsLayerGroup line').length
        }));
        assert.ok(info.moves>=4,'AI vs AI needs real moves, level '+level);
        assert.equal(info.arrows,0,'No unwanted AI arrows at level '+level);
        measurements.push({level,moves:info.moves,elapsedMs:info.perf.lastSearchMs,worker:info.perf.workerSupported});
        await page.locator('#btnTopReset').click();
      }
      assert.deepEqual(errors,[],'All levels have no JS errors');
      console.log('CHESS_PRO_SIX_LEVELS_WORKER_PASS '+JSON.stringify(measurements));
    }finally{await context.close();}
  }
  async run(){
    await this.start();
    try{
      await this.desktop();
      await this.mobile(this.chromium,'Android Chrome emulation',
        {...devices['Pixel 7'],viewport:{width:412,height:915}});
      this.webkit=await webkit.launch({headless:true});
      await this.mobile(this.webkit,'iPhone WebKit emulation',
        {...devices['iPhone 13'],viewport:{width:390,height:844}});
      await this.sixLevels();
    }finally{
      await this.webkit?.close();await this.chromium?.close();
      await new Promise(resolve=>this.server.close(resolve));
    }
  }
}
new ChessProQA().run().catch(err=>{console.error(err);process.exitCode=1;});
