/**
 * Chess Beast 360 — ergonomic sidebar release gate.
 * Executes the actual DOM on real Chromium at zoom-equivalent wide viewports,
 * laptop, tablet, and phone, plus WebKit mobile.
 */
'use strict';
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit,devices}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/chess-beast-v2');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const box=async(loc)=>loc.boundingBox();
class ChessPanelQA{
 async server(){
  this.host=http.createServer((req,res)=>{
    try{
      let loc=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));
      if(!loc.startsWith(root+path.sep))return res.writeHead(403).end();
      if(fs.statSync(loc).isDirectory())loc=path.join(loc,'index.html');
      const mime={'.js':'application/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml'}[path.extname(loc)]||'application/octet-stream';
      res.writeHead(200,{'Cache-Control':'no-store','Content-Type':mime}).end(fs.readFileSync(loc));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>this.host.listen(0,'127.0.0.1',resolve));
  this.origin='http://127.0.0.1:'+this.host.address().port+'/apps/chess-360/';
 }
 async open(browser,profile){
  const context=await browser.newContext({...profile,serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(this.origin,{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#chessboard .square').first().waitFor({timeout:18000});
  await page.waitForFunction(()=>typeof window.__chessPanelDiagnostics==='function');
  await page.waitForTimeout(100);
  return {page,context,errors};
 }
 async verifyStructure(page,width){
  assert.equal(await page.locator('#chessboard .square').count(),64,'board untouched '+width);
  const data=await page.evaluate(()=>{
    const d=window.__chessPanelDiagnostics(),rect=id=>{
      const el=document.querySelector(id);if(!el)return null;
      const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
    };
    const tabs=[...document.querySelectorAll('.tabs-header [data-tab]')].map(el=>{
      const r=el.getBoundingClientRect();
      return {name:el.textContent.trim(),left:r.left,right:r.right,width:r.width,scrollWidth:el.scrollWidth};
    });
    const brand=document.getElementById('appTitleText'),sub=document.getElementById('appSubText');
    return {...d,
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      board:rect('#boardFrame'),leftBar:rect('.topbar'),rightBar:rect('.sidebar-panel'),
      brand:{w:brand.clientWidth,scroll:brand.scrollWidth,word:brand.textContent},
      subtitle:{w:sub.clientWidth,scroll:sub.scrollWidth},
      tabs,
      textFont:parseFloat(getComputedStyle(document.querySelector('.tabs-header [data-tab]')).fontSize),
      statFont:parseFloat(getComputedStyle(document.getElementById('gameStatusTitle')).fontSize),
      movesFont:parseFloat(getComputedStyle(document.querySelector('.moves-table .move-cell')||document.querySelector('#movesScrollBox')).fontSize),
      primaryButtons:[...document.querySelectorAll('.right-dock-footer .board-controls button')].map(x=>x.id)
    };
  });
  assert.equal(data.scrollWidth<=data.viewport+7,true,'horizontal overflow '+width+' '+JSON.stringify(data));
  assert.ok(data.brand.scroll<=data.brand.w+3,'brand text clipped '+width+' '+JSON.stringify(data.brand));
  assert.ok(data.subtitle.scroll<=data.subtitle.w+3,'brand credit clipped '+width+' '+JSON.stringify(data.subtitle));
  assert.equal(data.moveHistoryUnderGame,true,'move history inside Game tab '+width);
  assert.equal(data.extraToolsFolded,true,'extra analysis folded by default '+width);
  assert.equal(data.tabs.length,3,'only three visible section tabs');
  assert.deepEqual(data.primaryButtons,['btnUndo','btnHint','btnFlip','btnResign']);
  assert.ok(data.textFont>=12.5,'tab text readable '+width);
  assert.ok(data.statFont>=13,'match status readable '+width);
  for(let i=1;i<data.tabs.length;i++){
    assert.ok(data.tabs[i-1].right<=data.tabs[i].left+1,'tabs overlap '+width);
    assert.ok(data.tabs[i].width>=57,'tab too narrow '+width);
    assert.ok(data.tabs[i].scrollWidth<=data.tabs[i].width+4,'tab label clipped '+width);
  }
  if(width>1180){
    assert.ok(data.leftBar.right<=data.board.left+2,'left/board overlap '+width);
    assert.ok(data.board.right<=data.rightBar.left+2,'board/right overlap '+width);
    assert.ok(data.rightBar.width>=300,'right unreadable width '+width);
  }else{
    assert.ok(data.board.bottom<=data.rightBar.top+5,'board/sidebar vertical overlap '+width);
  }
  return data;
 }
 async tabs(page){
  const toggle=async(tab,expected)=>{
    await page.locator('.tabs-header [data-tab="'+tab+'"]').click();
    assert.equal(await page.locator('#'+expected).isVisible(),true,expected+' visible');
    assert.equal(await page.locator('.tabs-header [data-tab="'+tab+'"]').getAttribute('aria-selected'),'true');
  };
  await toggle('tabLevels','tabLevels');
  await page.locator('.chess-view-entry').click();
  assert.equal(await page.locator('#tabKnowledge').isVisible(),true,'3D/Look accessible from Setup');
  assert.equal(await page.locator('[data-tab="tabLevels"]').first().getAttribute('aria-selected'),'true','Setup remains highlighted');
  await toggle('tabLevels','tabLevels');
  await toggle('tabTools','tabTools');
  assert.equal(await page.locator('#savedGamesVaultList').count(),1,'saved vault preserved');
  await toggle('tabPlay','tabPlay');
  await page.locator('#chessMoreTools summary').click();
  assert.equal(await page.locator('#btnToggleThreats').isVisible(),true,'advanced threat control retained');
  assert.equal(await page.locator('#btnAnalyzeNow').isVisible(),true,'position analysis retained');
  await page.locator('#chessMoreTools summary').click();
  assert.equal(await page.locator('#chessMoreTools').evaluate(x=>x.open),false);
 }
 async hide(page,width){
  if(width<=1180){
    await page.locator('#btnMobileMore').click();
    assert.equal(await page.locator('#btnMobileMore').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#btnHideLeftPanel').isVisible(),true);
  }
  await page.locator('#btnHideLeftPanel').click();
  assert.equal(await page.locator('#btnShowLeftPanel').isVisible(),true);
  assert.equal(await page.locator('.topbar').isVisible(),false);
  await page.locator('#btnShowLeftPanel').click();
  assert.equal(await page.locator('.topbar').isVisible(),true);
  if(width<=1180 && !(await page.locator('#btnHideLeftPanel').isVisible())){
    await page.locator('#btnMobileMore').click();
  }
  const before=await page.locator('#boardFrame').boundingBox();
  await page.locator('#btnCollapseDrawerInside').click();
  assert.equal(await page.locator('#rightSidebarDrawer').isVisible(),false);
  assert.equal(await page.locator('#btnEdgeDrawerHandle').isVisible(),true);
  const state=await page.evaluate(()=>window.__chessPanelDiagnostics());
  assert.equal(state.rightHidden,true,'right state closed');
  assert.equal(await page.locator('#btnEdgeDrawerHandle').evaluate(x=>getComputedStyle(x).writingMode),'horizontal-tb','edge tab not vertical/center');
  const handle=await box(page.locator('#btnEdgeDrawerHandle'));
  const placement=await page.evaluate(()=>{
    const el=document.getElementById('btnEdgeDrawerHandle'),st=getComputedStyle(el);
    return {top:st.top,position:st.position,transform:st.transform,rectTop:el.getBoundingClientRect().top,
      scrollY:scrollY,viewport:innerHeight,bodyClass:document.body.className};
  });
  assert.equal(placement.position,'fixed','reopen button must stay pinned to viewport '+JSON.stringify(placement));
  const nearTop=handle.y<170;
  const nearBottom=handle.y+handle.height>placement.viewport-170;
  assert.ok(nearTop||nearBottom,
    'reopen handle must be top/bottom anchored, never centered: '+JSON.stringify({handle,placement}));
  await page.locator('#btnEdgeDrawerHandle').click();
  assert.equal(await page.locator('#rightSidebarDrawer').isVisible(),true);
  const after=await page.locator('#boardFrame').boundingBox();
  assert.ok(after.width>0&&before.width>0);
 }
 async testViewport(browser,width,height){
  const {page,context,errors}=await this.open(browser,{viewport:{width,height}});
  try{
    const data=await this.verifyStructure(page,width);
    await this.tabs(page);
    await this.hide(page,width);
    if(width===1366||width===390||width===2040){
      fs.mkdirSync(out,{recursive:true});
      await page.screenshot({path:path.join(out,'chess-layout-'+width+'.jpg'),type:'jpeg',quality:75,fullPage:false,animations:'disabled'});
    }
    if(width===1366||width===390){
      await page.locator('#btnTopStartPause').click();
      await page.locator('#chessboard [data-sq="52"]').click();
      await page.locator('#chessboard [data-sq="36"]').click();
      await page.waitForFunction(()=>Number(document.getElementById('moveRewindScrubber').value)>=1);
      assert.ok(await page.locator('#tabPlay #movesTableBody tr').count()>=1,'history visible after move');
    }
    assert.deepEqual(errors,[],'JS page errors '+width);
    console.log('CHESS_PANEL_VIEW_PASS '+JSON.stringify({width,height,left:data.leftBar?.width,right:data.rightBar?.width,board:data.board?.width,fonts:[data.textFont,data.statFont],tabs:data.tabs.map(t=>t.name)}));
  }finally{await context.close();}
 }
 async browserMobile(){
  const browser=await webkit.launch({headless:true});
  try{
    const {page,context,errors}=await this.open(browser,{...devices['iPhone 13'],viewport:{width:390,height:844}});
    try{
      await this.verifyStructure(page,390);
      await this.tabs(page);await this.hide(page,390);
      assert.deepEqual(errors,[],'iPhone WebKit sidebar script errors');
      console.log('CHESS_PANEL_IPHONE_WEBKIT_PASS');
    }finally{await context.close();}
  }finally{await browser.close();}
 }
 async run(){
  await this.server();
  const chromiumBrowser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    for(const [width,height] of [[320,760],[390,844],[768,850],[1024,800],[1200,768],[1366,768],[1440,900],[2040,1110]]){
      await this.testViewport(chromiumBrowser,width,height);
    }
    await this.browserMobile();
  }finally{await chromiumBrowser.close();await new Promise(resolve=>this.host.close(resolve));}
 }
}
new ChessPanelQA().run().catch(error=>{console.error(error);process.exitCode=1});
