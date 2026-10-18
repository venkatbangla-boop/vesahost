/**
 * Chess Beast 360 — TRUE WebGL chess release gate.
 * Separate triangle meshes must render; CSS transforms alone do not pass.
 * Exercises real app game state, orbit, capture and fallback at mobile/desktop.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit,devices}=require('playwright');
const root=path.resolve(__dirname,'..');
const imageDir=path.join(root,'output/chess-real-3d');
class Real3DQa{
  async start(){
    this.server=http.createServer((req,res)=>{
      try{
        const url=new URL(req.url,'http://127.0.0.1');
        let f=path.resolve(root,'.'+decodeURIComponent(url.pathname));
        if(!f.startsWith(root+path.sep))return res.writeHead(403).end();
        if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
        const ext=path.extname(f);
        res.writeHead(200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.jpg':'image/jpeg','.gltf':'model/gltf+json'}[ext]||'application/octet-stream','Cache-Control':'no-store'}).end(fs.readFileSync(f));
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>this.server.listen(0,'127.0.0.1',resolve));
    this.url='http://127.0.0.1:'+this.server.address().port+'/apps/chess-360/';
  }
  async open(browser,profile){
    const ctx=await browser.newContext({...profile,serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e.message)));
    await page.goto(this.url,{waitUntil:'domcontentloaded'});
    await page.locator('#chessboard .square').first().waitFor();
    await page.waitForFunction(()=>window.__chessBeastReal3DState&&window.__chessBeastOrbitState);
    return {page,ctx,errors};
  }
  async enable(page){
    assert.equal(await page.locator('#btn3DDirect').isVisible(),true,'Real 3D toggle discoverable');
    await page.locator('#btn3DDirect').click();
    await page.waitForFunction(()=>window.__chessBeastReal3DState().frames>0,{timeout:18000});
    const state=await page.evaluate(()=>window.__chessBeastReal3DState());
    assert.equal(state.enabled,true,'WebGL enabled');
    assert.equal(state.supported,true,'Genuine WebGL renderer');
    assert.equal(state.realSolidMeshes,true,'Individually modeled solids');
    assert.equal(state.boardTiles,64);
    assert.equal(state.pieceCount,32);
    assert.equal(state.distinctInstances,32);
    assert.equal(state.white,16);assert.equal(state.black,16);
    assert.deepEqual(state.meshTypes.sort(),['B','K','N','P','Q','R']);
    assert.ok(state.webglWidth>=250,'Meaningful canvas size');
    assert.equal(await page.locator('#chessCameraControls').isVisible(),true,'Camera controls visible');
    assert.equal(await page.locator('#chessReal3DCanvas').isVisible(),true,'Canvas visible');
    assert.equal(await page.locator('#btn3DDirect').getAttribute('aria-pressed'),'true');
    const colors=await page.evaluate(()=>{
      const canvas=document.getElementById('chessReal3DCanvas');
      const gl=canvas.getContext('webgl'),p=new Uint8Array(4),result=[];
      for(const [x,y] of [[.14,.14],[.5,.5],[.8,.7],[.5,.9]]){
        gl.readPixels(Math.floor(canvas.width*x),Math.floor(canvas.height*y),1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);
        result.push([...p]);
      }
      return result;
    });
    assert.ok(new Set(colors.map(x=>x.join(','))).size>1,'Pixels prove actual 3D rendering not blank canvas');
    const foreground=await page.evaluate(()=>{
      const a=window.__chessBeastReal3DSquare(56),b=window.__chessBeastReal3DSquare(63);
      const box=document.getElementById('chessReal3DCanvas').getBoundingClientRect();
      return {fraction:Math.abs(b.x-a.x)/box.width,nearLeft:a.x,nearRight:b.x,width:box.width};
    });
    assert.ok(foreground.fraction>.68,
      'Cinematic perspective board must fill most of the view, not look tiny '+JSON.stringify(foreground));
    return state;
  }
  async verifyStudio(page,width){
    await page.waitForFunction(()=>{
      const state=window.__chessBeastStudioState?.();
      const text=document.getElementById('chessReal3DStatus')?.textContent||'';
      return state?.ready||/unavailable/.test(text);
    },null,{timeout:40000});
    const state=await page.evaluate(()=>window.__chessBeastStudioState());
    assert.equal(state.ready,true,'Licensed sculpted 3D did not load '+width+' '+JSON.stringify(state));
    assert.equal(state.active,true,'High-quality 3D overlay not visible');
    assert.equal(state.loadedModels,12,'Six licensed sculpts for each side');
    assert.equal(state.pieceCount,32,'Each chess piece must be its own real 3D mesh instance');
    assert.equal(state.assetsOffline,true);
    assert.equal(state.remoteRuntimeRequests,0,'No runtime CDN downloads');
    assert.equal(state.shadowMap,true,'Directional soft shadows');
    assert.ok(state.frames>=1,'Physically lit Three.js scene rendered at least once');
    assert.ok(state.width>=250&&state.height>=250,'Canvas remains readable');
    assert.equal(await page.locator('#chessStudioCanvas').isVisible(),true);
    const probe=await page.evaluate(()=>{
      const canvas=document.getElementById('chessStudioCanvas');
      const pixels=document.createElement('canvas');
      pixels.width=canvas.width;pixels.height=canvas.height;
      const ctx=pixels.getContext('2d');
      ctx.drawImage(canvas,0,0);
      const samples=[[.25,.5],[.5,.5],[.76,.68],[.55,.86]]
        .map(([x,y])=>[...ctx.getImageData(Math.floor(pixels.width*x),
          Math.floor(pixels.height*y),1,1).data]);
      return {samples,rawWidth:canvas.width,rawHeight:canvas.height};
    });
    assert.ok(new Set(probe.samples.map(row=>row.join(','))).size>=2,'Studio render is not blank');
    fs.mkdirSync(imageDir,{recursive:true});
    if(width===1440)await page.screenshot({
      path:path.join(imageDir,'real-sculpted-cc0-1440.png'),
      animations:'disabled'});
    if(width===390)await page.screenshot({
      path:path.join(imageDir,'real-sculpted-cc0-mobile-390.png'),
      animations:'disabled'});
    console.log('CHESS_REAL_3D_STUDIO_PASS '+JSON.stringify({width,...state}));
    return state;
  }
  async mouseSquare(page,sq){
    const p=await page.evaluate(n=>window.__chessBeastReal3DSquare(n),sq);
    assert.ok(p&&Number.isFinite(p.x)&&Number.isFinite(p.y),'3D projection exists '+sq);
    const pick=await page.evaluate(v=>window.__chessBeastReal3DPick(v.x,v.y),p);
    assert.equal(pick,sq,'perspective ray pick maps to engine square '+sq);
    await page.mouse.click(p.x,p.y);
  }
  async match(page){
    await page.locator('#btnOpenNewGame').click();
    await page.locator('#modalModeRow [data-mode="pvp"]').click();
    await page.locator('#btnConfirmStartGame').click();
    await page.locator('#newGameModal').waitFor({state:'hidden'});
    await this.mouseSquare(page,52);await this.mouseSquare(page,36); // e2-e4
    await this.mouseSquare(page,12);await this.mouseSquare(page,28); // e7-e5
    await this.mouseSquare(page,51);await this.mouseSquare(page,35); // d2-d4
    await this.mouseSquare(page,28);await this.mouseSquare(page,35); // exd4
    await page.waitForFunction(()=>window.__chessBeastReal3DState().pieceCount===31);
    const moves=Number(await page.locator('#moveRewindScrubber').inputValue());
    assert.equal(moves,4,'Exactly four real chess plies');
    assert.equal((await page.evaluate(()=>window.__chessBeastReal3DState())).pieceCount,31);
    await page.locator('#btnUndo').click();
    await page.waitForFunction(()=>window.__chessBeastReal3DState().pieceCount===32);
    assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),3);
  }
  async orbit(page){
    const before=await page.evaluate(()=>window.__chessBeastReal3DSquare(52));
    await page.locator('#btnCameraRotate').click();
    assert.equal(await page.locator('#btnCameraRotate').getAttribute('aria-pressed'),'true');
    const box=await page.locator('#chessReal3DCanvas').boundingBox(),x=box.x+box.width*.5,y=box.y+box.height*.5;
    const old=Number(await page.locator('#moveRewindScrubber').inputValue());
    await page.mouse.move(x,y);
    await page.mouse.down();
    await page.mouse.move(x+86,y+24,{steps:6});
    await page.mouse.up();
    await page.waitForFunction(()=>window.__chessBeastReal3DState().angle.yaw>30);
    const after=await page.evaluate(()=>window.__chessBeastReal3DSquare(52));
    assert.ok(Math.abs(before.x-after.x)>3,'Real projected 3D pieces move under orbit camera');
    assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),old,'Orbit did not play a move');
    await page.locator('#btnCameraReset').click();
    await page.waitForFunction(()=>Math.round(window.__chessBeastReal3DState().angle.yaw)===0);
    const reset=await page.evaluate(()=>window.__chessBeastReal3DState());
    assert.equal(Math.round(reset.angle.yaw),0,'Reset camera');
    await page.locator('#btnCameraRotate').click();
    assert.equal(await page.locator('#btnCameraRotate').getAttribute('aria-pressed'),'false');
  }
  async runChromium(browser,width,height){
    const {page,ctx,errors}=await this.open(browser,{viewport:{width,height}});
    try{
      const initial=await this.enable(page);
      const studio=await this.verifyStudio(page,width);
      if(width===1440){
        fs.mkdirSync(imageDir,{recursive:true});
        await page.waitForTimeout(1650); // Let nonessential toast leave the frame.
        await page.screenshot({path:path.join(imageDir,'real-3d-starting-1440.png'),animations:'disabled'});
      }
      if(width===1440){await this.orbit(page);await this.match(page);}
      if(width===390){
        const start=await page.evaluate(()=>window.__chessBeastReal3DState());
        await page.reload();
        await page.locator('#chessboard .square').first().waitFor();
        assert.equal(await page.locator('#chessReal3DCanvas').isVisible(),false,'Default reliable 2D preserved on reload');
        await this.enable(page);
        const end=await page.evaluate(()=>window.__chessBeastReal3DState());
        assert.equal(start.pieceCount,end.pieceCount);
      }
      fs.mkdirSync(imageDir,{recursive:true});
      await page.screenshot({path:path.join(imageDir,'real-3d-'+width+'.png'),animations:'disabled'});
      const dimensions=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
      assert.ok(dimensions.scrollWidth<=dimensions.viewport+8,'3D does not overflow viewport '+width);
      assert.deepEqual(errors,[],'No 3D page JavaScript exceptions '+width);
      console.log('CHESS_REAL_3D_CHROMIUM_PASS '+JSON.stringify({width,...initial,dimensions}));
    }finally{await ctx.close();}
  }
  async runWebkit(){
    const browser=await webkit.launch({headless:true});
    try{
      const {page,ctx,errors}=await this.open(browser,{...devices['iPhone 13'],viewport:{width:390,height:844}});
      try{
        const state=await this.enable(page);
        assert.equal(state.pieceCount,32);
        const studio=await this.verifyStudio(page,390);
        await page.locator('#btnCameraRotate').click();
        const box=await page.locator('#chessReal3DCanvas').boundingBox();
        const x=box.x+box.width*.5,y=box.y+box.height*.5;
        await page.evaluate(({x,y})=>{
          const el=document.getElementById('chessReal3DCanvas');
          const data={bubbles:true,cancelable:true,pointerId:14,isPrimary:true,pointerType:'touch',button:0};
          el.dispatchEvent(new PointerEvent('pointerdown',{...data,clientX:x,clientY:y}));
          window.dispatchEvent(new PointerEvent('pointermove',{...data,clientX:x+75,clientY:y+20}));
          window.dispatchEvent(new PointerEvent('pointerup',{...data,clientX:x+75,clientY:y+20}));
        },{x,y});
        await page.waitForFunction(()=>window.__chessBeastReal3DState().angle.yaw>20);
        assert.deepEqual(errors,[]);
        console.log('CHESS_REAL_3D_IPHONE_WEBKIT_PASS '+JSON.stringify(await page.evaluate(()=>window.__chessBeastReal3DState())));
      }finally{await ctx.close();}
    }finally{await browser.close();}
  }
  async run(){
    await this.start();
    const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,
      args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
    try{
      await this.runChromium(browser,1440,900);
      await this.runChromium(browser,390,844);
      await this.runWebkit();
    }finally{await browser.close();await new Promise(resolve=>this.server.close(resolve));}
  }
}
new Real3DQa().run().catch(e=>{console.error(e);process.exitCode=1;});
