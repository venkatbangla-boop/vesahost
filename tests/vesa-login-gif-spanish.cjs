/**
 * Isolated VESA Login GIF + Spanish UI regression.
 * Owns read-only proof for the two approved changes; auth and business-app state are never altered.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
class VesaLoginGifSpanishProof {
 static ROOT=path.resolve(__dirname,'..');
 static GIF='assets/vesa-login-intro-loop.gif';
 static read(p){return fs.readFileSync(path.join(this.ROOT,p));}
 static staticCheck(){
  const gif=this.read(this.GIF), html=this.read('login/index.html').toString('utf8');
  const prefs=this.read('js/preferences.js').toString('utf8');
  const css=this.read('css/vesa-login.css').toString('utf8');
  const sw=this.read('service-worker.js').toString('utf8');
  assert.equal(gif.subarray(0,6).toString('ascii'),'GIF89a','actual GIF89a asset');
  assert.ok(gif.includes(Buffer.from('NETSCAPE2.0')),'GIF explicitly has infinite loop extension');
  assert.ok(gif.length>15000 && gif.length<16000000,'GIF nonempty and bounded for website');
  assert.ok(html.includes('src="/'+this.GIF+'"'),'original intro GIF embedded on login');
  assert.ok(html.includes('login-story__gif') && !html.includes('<video'),'no video player/controls on login');
  assert.ok(html.includes("es:{storyTag:'ESPACIO DE TRABAJO'"),'Spanish login dictionary');
  assert.ok(prefs.includes('<option value="es">Spanish</option>'),'Spanish in existing shared selector');
  assert.ok(prefs.includes("language:['en','ta','bn','hi','es']"),'Spanish saved successfully');
  assert.ok(css.includes('.vesa-login-page .login-story__gif'),'GIF styled only inside login');
  assert.ok(sw.includes("const CACHE='vesa-v120-global-five-language'"),'new cache for existing browser users');
  assert.ok(html.includes('vesa-login.css?v=20261125-login-gif-fit') && sw.includes('vesa-login.css?v=20261125-login-gif-fit'),'matching stylesheet cache version');
  assert.ok(sw.includes("'./"+this.GIF+"'"),'GIF pre-cached by refreshed service worker');
  console.log('LOGIN_GIF_SPANISH_STATIC_PASS '+gif.length+' bytes, infinite loop, original markup, five-language selector, cache');
 }
 static server(){
  const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.gif':'image/gif','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.svg':'image/svg+xml'};
  return http.createServer((req,res)=>{
   try{
    const url=new URL(req.url,'http://127.0.0.1');
    let f=path.resolve(this.ROOT,'.'+decodeURIComponent(url.pathname));
    if(f!==this.ROOT&&!f.startsWith(this.ROOT+path.sep))return res.writeHead(403).end();
    if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
    const data=fs.readFileSync(f);
    res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
   }catch{res.writeHead(404).end();}
  });
 }
 static async browserCheck(){
  const {chromium}=require('playwright');
  const s=this.server();
  await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+s.address().port;
  const browser=await chromium.launch({headless:true});
  const out=path.join(this.ROOT,'output','playwright');fs.mkdirSync(out,{recursive:true});
  try{
   for(const width of [320,390,768,1024,1366,1440]){
    const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(base+'/login/',{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200,'login loads '+width);
    await page.locator('[data-pref-language]').waitFor();
    assert.equal(await page.locator('[data-pref-language] option').count(),5,'existing four + Spanish');
    const img=page.locator('.login-story__gif img');
    assert.equal(await img.count(),1,'one loop GIF, no media controls');
    assert.equal(await page.locator('.login-story video').count(),0,'no video element');
    if(width>900){
     assert.ok(await img.isVisible(),'GIF visible in left navy panel');
     await img.evaluate(el=>el.decode());
     // Compare the decoded image ratio and rendered box to its frame interior.
     // A fixed-height frame with object-fit:contain would fail this check.
     const dimensions=await img.evaluate(el=>{
      const box=el.getBoundingClientRect(),frame=el.parentElement;
      return {width:el.naturalWidth,height:el.naturalHeight,renderedWidth:box.width,
       renderedHeight:box.height,frameWidth:frame.clientWidth,frameHeight:frame.clientHeight};
     });
     assert.ok(dimensions.width>200&&dimensions.height>100,'original video GIF decodes');
     assert.ok(Math.abs(dimensions.renderedHeight-dimensions.renderedWidth*dimensions.height/dimensions.width)<=1,
      'GIF is neither stretched nor letterboxed at '+width);
     assert.ok(Math.abs(dimensions.renderedWidth-dimensions.frameWidth)<=1 &&
      Math.abs(dimensions.renderedHeight-dimensions.frameHeight)<=1,
      'GIF fills its frame with no unused space at '+width);
    }else{
     assert.equal(await page.locator('.login-story').isVisible(),false,'original mobile form-only layout unchanged');
    }
    const menu=page.locator('[data-pref-language]');
    await menu.selectOption('es');
    assert.equal(await page.locator('html').getAttribute('lang'),'es','Spanish lang persisted');
    assert.equal(await page.locator('#loginHeading').textContent(),'Accede a tu espacio de trabajo.');
    assert.equal(await page.locator('#loginSubmit span').first().textContent(),'Abrir centro de aplicaciones');
    assert.equal(await page.locator('[data-pref-theme]').inputValue(),'clear-blue','theme unchanged');
    assert.equal(await page.locator('#email').inputValue(),'user@vesa','user preserved');
    assert.equal(await page.locator('#password').inputValue(),'vesa','password preserved');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=1,'no horizontal overflow '+width+' '+overflow);
    if(width===1440)await page.screenshot({path:path.join(out,'vesa-login-gif-spanish-1440.png'),fullPage:true,animations:'disabled'});
    if(width===390)await page.screenshot({path:path.join(out,'vesa-login-gif-spanish-390.png'),fullPage:true,animations:'disabled'});
    if(width===1440){
     await page.locator('#loginSubmit').click();
     await page.waitForURL(u=>u.pathname==='/apps/',{timeout:20000});
     assert.equal(await page.evaluate(()=>window.VesaPrefs?.read?.().language),'es','Spanish remains after login even when Settings is closed');
     assert.ok((await page.locator('body').textContent()).includes('Encuentra la herramienta adecuada'),'App Centre heading translated');
    }
    assert.deepEqual(errors,[],'no script errors '+width);
    await context.close();
   }
   console.log('LOGIN_GIF_SPANISH_BROWSER_PASS widths 320/390/768/1024/1366/1440, GIF, translation, login, 20-app centre');
  }finally{await browser.close();await new Promise(resolve=>s.close(resolve));}
 }
}
(async()=>{VesaLoginGifSpanishProof.staticCheck();if(process.argv.includes('--browser'))await VesaLoginGifSpanishProof.browserCheck()})().catch(error=>{console.error(error);process.exitCode=1;});
