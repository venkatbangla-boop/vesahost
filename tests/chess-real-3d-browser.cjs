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
    const ctx=await browser.newContext({...profile,serviceWorkers:'block',reducedMotion:profile.reducedMotion||'reduce'});
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
    // Scene loading and GPU first render are scheduled on separate frames.
    // WebKit can resolve the GLTF promise before its next RAF; wait for
    // actual rendered proof rather than sampling in that brief gap.
    await page.waitForFunction(()=>window.__chessBeastStudioState?.().frames>=1,
      null,{timeout:20000});
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
  async loadPracticeFen(page,fen,count){
    // Exercise the app's ACTUAL validated FEN loader (no test-only engine).
    await page.evaluate(v=>{
      const field=document.getElementById('customFenInput');
      field.value=v;
      document.getElementById('btnLoadFen').click();
    },fen);
    await page.waitForFunction(n=>window.__chessBeastStudioState().pieceCount===n,count);
    assert.equal((await page.evaluate(()=>window.__chessBeastStudioState())).pieceCount,count);
  }
  async showcaseVisual(page){
    await page.locator('#btnCameraShowcase').click();
    await page.waitForFunction(()=>{
      const cam=window.__chessBeastOrbitState();
      return Math.round(cam.tilt)===48&&Math.round(cam.yaw)===10&&Math.round(cam.spin)===8;
    },null,{timeout:5000});
    await page.waitForTimeout(220);
    const view=await page.evaluate(()=>{
      const r=document.getElementById('chessStudioCanvas').getBoundingClientRect();
      return {rect:{x:r.x,y:r.y,w:r.width,h:r.height},
        points:[0,7,56,63].map(n=>window.__chessBeastReal3DSquare(n)),
        pieceCount:window.__chessBeastStudioState().pieceCount,
        persisted:JSON.parse(localStorage.getItem('chess_beast_orbit_camera_v1')||'null')};
    });
    assert.equal(view.pieceCount,32,'Showcase changes camera only, not chess position');
    assert.equal(Math.round(view.persisted.tilt),48,'Showcase preference saved');
    for(const [i,p] of view.points.entries())
      assert.ok(p.x>=view.rect.x&&p.x<=view.rect.x+view.rect.w&&
        p.y>=view.rect.y&&p.y<=view.rect.y+view.rect.h,
        'Showcase must keep square '+[0,7,56,63][i]+' in the camera '+JSON.stringify(view));
    fs.mkdirSync(imageDir,{recursive:true});
    await page.screenshot({path:path.join(imageDir,'real-sculpted-showcase-1440.png'),
      animations:'disabled'});
    await page.locator('#btnCameraReset').click();
    await page.waitForFunction(()=>window.__chessBeastOrbitState().spin===0);
    console.log('CHESS_REAL_3D_SHOWCASE_PASS '+JSON.stringify({pose:view.persisted,pieces:view.pieceCount}));
  }
  async diagonalVisualCheck(page){
    // The owner-approved reference is a three-quarter view. Capture an
    // honest screenshot of the ACTUAL SCULPTED playable WebGL scene, not a
    // generated image, with camera yaw/spin set through user-visible controls.
    await page.locator('#btnCameraSpinRight').click();
    await page.waitForFunction(()=>Math.round(window.__chessBeastOrbitState().spin)===45);
    await page.waitForTimeout(350);
    const corners=await page.evaluate(()=>{
      const board=document.getElementById('chessStudioCanvas').getBoundingClientRect();
      return {canvas:{x:board.x,y:board.y,w:board.width,h:board.height},
        squares:[0,7,56,63].map(sq=>window.__chessBeastReal3DSquare(sq))};
    });
    for(const [i,pos] of corners.squares.entries()){
      assert.ok(pos&&pos.x>corners.canvas.x&&pos.x<corners.canvas.x+corners.canvas.w&&
        pos.y>corners.canvas.y&&pos.y<corners.canvas.y+corners.canvas.h,
        '45° 3D camera must keep edge square '+[0,7,56,63][i]+' visible '+JSON.stringify(corners));
    }
    fs.mkdirSync(imageDir,{recursive:true});
    await page.screenshot({path:path.join(imageDir,'real-sculpted-cc0-diagonal-1440.png'),
      animations:'disabled'});
    await page.locator('#btnCameraReset').click();
    await page.waitForFunction(()=>Math.round(window.__chessBeastOrbitState().spin)===0);
    console.log('CHESS_REAL_3D_CINEMATIC_VIEW_PASS 45-degree live orbit; 64 squares remain visible');
  }
  async special3DMoves(page){
    // Castling must move a real King mesh and its real Rook mesh without
    // duplicates or stale square identities.
    await this.loadPracticeFen(page,'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',6);
    let pieces=(await page.evaluate(()=>window.__chessBeastStudioState())).pieceSquares;
    assert.ok(pieces.some(p=>p.sq===60&&p.type==='K'&&p.color==='w'));
    assert.ok(pieces.some(p=>p.sq===63&&p.type==='R'&&p.color==='w'));
    await this.mouseSquare(page,60);await this.mouseSquare(page,62);
    await page.waitForFunction(()=>window.__chessBeastStudioState().pieceSquares.some(
      p=>p.sq===62&&p.type==='K'&&p.color==='w'));
    pieces=(await page.evaluate(()=>window.__chessBeastStudioState())).pieceSquares;
    assert.ok(pieces.some(p=>p.sq===61&&p.type==='R'&&p.color==='w'),'Castle moves physical rook');
    assert.ok(!pieces.some(p=>p.sq===63&&p.color==='w'),'Old rook square is emptied');
    assert.equal(pieces.length,6);
    await page.locator('#btnUndo').click();
    await page.waitForFunction(()=>window.__chessBeastStudioState().pieceSquares.some(
      p=>p.sq===60&&p.type==='K'&&p.color==='w'));
    pieces=(await page.evaluate(()=>window.__chessBeastStudioState())).pieceSquares;
    assert.ok(pieces.some(p=>p.sq===63&&p.type==='R'&&p.color==='w'),
      'Undo restores sculpted rook to h1');

    // Promotion must REPLACE the pawn geometry with a Queen model.
    await this.loadPracticeFen(page,'4k3/P7/8/8/8/8/8/4K3 w - - 0 1',3);
    await this.mouseSquare(page,8);await this.mouseSquare(page,0);
    await page.locator('#promotionModal.open').waitFor();
    const first=page.locator('#promoChoicesGrid .promo-btn').first();
    assert.ok((await first.textContent()).includes('Queen'),'Explicit Queen option');
    await first.click();
    await page.waitForFunction(()=>window.__chessBeastStudioState().pieceSquares.some(
      p=>p.sq===0&&p.type==='Q'&&p.color==='w'));
    pieces=(await page.evaluate(()=>window.__chessBeastStudioState())).pieceSquares;
    assert.equal(pieces.length,3);
    assert.ok(!pieces.some(p=>p.type==='P'&&p.color==='w'));

    const original=await page.evaluate(()=>window.__chessBeastReal3DSquare(0));
    await page.locator('#btnFlip').click();
    await page.waitForFunction(()=>window.__chessBeastStudioState().flipped);
    const flipped=await page.evaluate(()=>window.__chessBeastReal3DSquare(0));
    assert.ok(Math.abs(original.x-flipped.x)>20,'Flip rotates actual 3D camera');
    const screenPick=await page.evaluate(v=>window.__chessBeastReal3DPick(v.x,v.y),flipped);
    assert.equal(screenPick,0,'Board square mapping survives 180-degree flip');

    // 3D -> 2D -> 3D must never reset the chess position.
    await page.locator('#btn3DDirect').click();
    await page.waitForFunction(()=>!window.__chessBeastReal3DState().enabled);
    assert.equal(await page.locator('#chessStudioCanvas').isVisible(),false);
    await page.locator('#btn3DDirect').click();
    await page.waitForFunction(()=>window.__chessBeastStudioState().active);
    assert.ok((await page.evaluate(()=>window.__chessBeastStudioState())).pieceSquares
      .some(p=>p.sq===0&&p.type==='Q'),'Position preserved through view toggle');
    console.log('CHESS_REAL_3D_SPECIAL_MOVES_PASS castle/undo/promotion/flip/toggle');
  }
  async webglFallback(page){
    const result=await page.evaluate(()=>{
      const canvas=document.getElementById('chessStudioCanvas');
      const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
      const ext=gl&&gl.getExtension('WEBGL_lose_context');
      if(ext){ext.loseContext();return 'hardware extension';}
      canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
      return 'synthetic context loss';
    });
    await page.waitForFunction(()=>!window.__chessBeastStudioState().active);
    assert.equal(await page.locator('#chessStudioCanvas').isVisible(),false);
    assert.equal(await page.locator('#chessReal3DCanvas').isVisible(),true,
      'Working original WebGL board remains usable after studio context loss');
    assert.equal(await page.locator('#btn3DDirect').getAttribute('aria-pressed'),'true',
      '3D fallback remains clearly enabled');
    console.log('CHESS_REAL_3D_CONTEXT_FALLBACK_PASS '+result);
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
      if(width===1440)await this.showcaseVisual(page);
      if(width===1440){
        fs.mkdirSync(imageDir,{recursive:true});
        await page.waitForTimeout(1650); // Let nonessential toast leave the frame.
        await page.screenshot({path:path.join(imageDir,'real-3d-starting-1440.png'),animations:'disabled'});
      }
      if(width===1440){
        await this.orbit(page);
        await this.match(page);
        await this.diagonalVisualCheck(page);
        await this.special3DMoves(page);
        await this.webglFallback(page);
      }
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
  async runMotion(browser){
    const {page,ctx,errors}=await this.open(browser,{
      viewport:{width:1366,height:850},reducedMotion:'no-preference'
    });
    try{
      await this.enable(page);
      await this.verifyStudio(page,1366);
      await page.locator('#btnOpenNewGame').click();
      await page.locator('#modalModeRow [data-mode="pvp"]').click();
      await page.locator('#btnConfirmStartGame').click();
      await page.locator('#newGameModal').waitFor({state:'hidden'});
      async function motion(mode){
        await page.evaluate(value=>{
          const sel=document.getElementById('beastFxMode');
          if(!sel)throw Error('User-accessible motion control missing');
          sel.value=value;sel.dispatchEvent(new Event('change',{bubbles:true}));
        },mode);
      }
      await motion('subtle');
      await this.mouseSquare(page,52);await this.mouseSquare(page,36);
      await page.waitForFunction(()=>window.__chessBeastStudioState().animatedMoves>=1);
      await page.waitForFunction(()=>window.__chessBeastStudioState().animationsActive===0);
      let state=await page.evaluate(()=>window.__chessBeastStudioState());
      assert.ok(state.animationFrames>=1,'Actual model transforms interpolated');
      assert.equal(state.moveAnimationMs,140);
      const count=state.animatedMoves;
      await motion('off');
      await this.mouseSquare(page,12);await this.mouseSquare(page,28);
      state=await page.evaluate(()=>window.__chessBeastStudioState());
      assert.equal(state.moveAnimationMs,0,'Animation OFF preference honored');
      assert.equal(state.animatedMoves,count,'OFF causes instant move, not a 3D tween');
      await motion('full');
      await this.mouseSquare(page,51);await this.mouseSquare(page,35);
      await page.waitForFunction(n=>window.__chessBeastStudioState().animatedMoves>n,count);
      state=await page.evaluate(()=>window.__chessBeastStudioState());
      assert.equal(state.moveAnimationMs,188,'Expressive uses user-selected animation duration');
      assert.deepEqual(errors,[],'3D tween caused no page exceptions');
      console.log('CHESS_REAL_3D_ANIMATIONS_PASS '+JSON.stringify({
        frames:state.animationFrames,animatedMoves:state.animatedMoves,
        subtleMs:140,expressiveMs:188,offSupported:true}));
    }finally{await ctx.close();}
  }
  async switchTo3DMidGame(browser){
    // Regression for users who play in 2D first, then activate real 3D.
    // Public release validates this same sequence after the AI moves.
    const {page,ctx,errors}=await this.open(browser,{viewport:{width:1366,height:900}});
    try{
      await page.locator('#btnOpenNewGame').click();
      await page.locator('#modalModeRow [data-mode="pvp"]').click();
      await page.locator('#btnConfirmStartGame').click();
      await page.locator('#newGameModal').waitFor({state:'hidden'});
      for(const sq of [52,36,12,28])await page.locator('#chessboard [data-sq="'+sq+'"]').click();
      assert.equal(Number(await page.locator('#moveRewindScrubber').inputValue()),2);
      await this.enable(page);
      const studio=await this.verifyStudio(page,1366);
      assert.equal(studio.pieceCount,32);
      assert.ok(studio.pieceSquares.some(p=>p.sq===36&&p.color==='w'&&p.type==='P'));
      assert.ok(studio.pieceSquares.some(p=>p.sq===28&&p.color==='b'&&p.type==='P'));
      assert.deepEqual(errors,[],'Enabling premium PBR midway did not cause JS errors');
      console.log('CHESS_REAL_3D_MIDGAME_SWITCH_PASS 2D to sculpted 3D after e4 e5');
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
          const el=document.getElementById('chessStudioCanvas');
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
      await this.runMotion(browser);
      await this.switchTo3DMidGame(browser);
      await this.runWebkit();
    }finally{await browser.close();await new Promise(resolve=>this.server.close(resolve));}
  }
}
new Real3DQa().run().catch(e=>{console.error(e);process.exitCode=1;});
