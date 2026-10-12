/** One VESA proof for standalone Login plus authenticated App Centre and Admin pages. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const output=path.join(root,'output','playwright');
const widths=[320,360,390,768,1024,1280,1440];
const menuOrder=['Home','File','Edit','View','Tools','Help'];
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-12T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const store={version:1,users:[{email:'qa@vesaent.com',name:'QA User',role:'admin',salt:'fixture',passwordHash:'fixture',blocked:false,demo:true,createdAt:'2026-10-12T00:00:00.000Z'}],events:[]};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream';

function server(){
  const instance=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);
    let file=path.resolve(root,`.${pathname}`);
    if(!file.startsWith(root+path.sep))return response.writeHead(403).end();
    try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}
    catch{response.writeHead(404).end();}
  });
  return instance;
}

async function geometry(page,width,label){
  const result=await page.evaluate(()=>({innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,logos:[...document.querySelectorAll('img[alt*="VESA"],.vesa-workspace__brand img')].filter(node=>{const style=getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length}).length}));
  assert.ok(result.documentWidth<=width+1&&result.bodyWidth<=width+1,`${label}@${width}: no horizontal overflow (${result.documentWidth}/${result.bodyWidth})`);
  assert.equal(result.logos,1,`${label}@${width}: exactly one visible VESA logo`);
}

async function loginProbe(browser,base,width){
  const context=await browser.newContext({viewport:{width,height:Math.max(844,Math.round(width*.8))}});
  const page=await context.newPage();const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  await page.goto(`${base}/login/`,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('.vesa-workspace,.app-user-bar').count(),0,`login@${width}: no authenticated header`);
  assert.equal(await page.locator('.auth-logo').count(),1,`login@${width}: one standalone brand owner`);
  assert.equal(await page.locator('#loginForm').count(),1,`login@${width}: one login form`);
  await geometry(page,width,'login');
  if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-platform-login-${width}.png`),fullPage:true});
  assert.deepEqual(errors,[],`login@${width}: no page errors`);assert.deepEqual(external,[],`login@${width}: no external requests`);
  await context.close();
}

async function authenticatedProbe(browser,base,width,route,id){
  const context=await browser.newContext({viewport:{width,height:Math.max(844,Math.round(width*.8))}});
  await context.addInitScript(({session,store})=>{localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify(store));},{session,store});
  const page=await context.newPage();const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  await page.goto(`${base}${route}`,{waitUntil:'domcontentloaded'});
  const shell=page.locator('.vesa-workspace');await shell.waitFor({state:'visible'});
  assert.equal(await shell.count(),1,`${id}@${width}: one shared shell`);
  assert.equal(await page.locator('.app-user-bar,.auth-logo').count(),0,`${id}@${width}: no legacy or content logo owner`);
  assert.deepEqual(await shell.locator('[data-vesa-menu]').allTextContents(),menuOrder,`${id}@${width}: menu order`);
  assert.equal(await shell.locator('[data-vesa-user]').count(),1,`${id}@${width}: one Settings owner`);
  assert.equal(await shell.locator('[data-vesa-admin]').count(),1,`${id}@${width}: one Admin owner`);
  assert.equal(await shell.locator('[data-vesa-logout]').count(),1,`${id}@${width}: one Logout owner`);
  assert.equal(await shell.locator('[data-vesa-saved]').count(),1,`${id}@${width}: one state owner`);
  assert.equal(await page.evaluate(()=>[...document.querySelectorAll('.vesa-workspace,.app-user-bar')].filter(node=>['sticky','fixed'].includes(getComputedStyle(node).position)).length),1,`${id}@${width}: one sticky header`);
  if(id==='apps')assert.equal(await page.locator('#appCatalogue .app-tile').count(),3,`${id}@${width}: registered catalogue cards`);
  if(id==='admin')assert.equal(await page.locator('.admin-grid').count(),1,`${id}@${width}: admin content retained`);
  await geometry(page,width,id);
  if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-platform-${id}-${width}.png`),fullPage:true});
  if(width<=900){
    const mobile=shell.locator('[data-vesa-mobile-menu]');await mobile.click();
    assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-menu]')),true,`${id}@${width}: menu focuses first command`);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-mobile-menu]')),true,`${id}@${width}: Escape returns focus`);
  }else{
    const before=await page.evaluate(()=>localStorage.getItem('vesa.appcentre.store.v1'));
    await shell.locator('[data-vesa-user]').click();
    const dialog=page.locator('[data-vesa-settings]');await dialog.waitFor({state:'visible'});
    await dialog.locator('[data-pref-language]').selectOption('bn');await dialog.locator('[data-pref-theme]').selectOption('pure-mono');
    await dialog.locator('footer button').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('vesa.appcentre.store.v1')),before,`${id}@${width}: preferences preserve auth/user store`);
    assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-user]')),true,`${id}@${width}: Settings returns focus`);
  }
  assert.deepEqual(errors,[],`${id}@${width}: no page errors`);assert.deepEqual(external,[],`${id}@${width}: no external requests`);
  await context.close();
}

async function zoomProbe(browser,base){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(({session,store})=>{localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify(store));},{session,store});
  const page=await context.newPage();await page.goto(`${base}/apps/`,{waitUntil:'domcontentloaded'});await page.locator('.vesa-workspace').waitFor({state:'visible'});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
  assert.equal(await page.evaluate(()=>visualViewport.scale),2,'App Centre reaches 200% browser scale');
  assert.equal(await page.locator('.vesa-workspace').count(),1,'App Centre at 200% retains one shell owner');
  await page.screenshot({path:path.join(output,'vesa-platform-apps-200-percent.png'),fullPage:true});await context.close();
}

async function run(){
  fs.mkdirSync(output,{recursive:true});const web=server();await new Promise(resolve=>web.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${web.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  try{for(const width of widths){await loginProbe(browser,base,width);await authenticatedProbe(browser,base,width,'/apps/','apps');await authenticatedProbe(browser,base,width,'/admin/','admin');}await zoomProbe(browser,base);}
  finally{await browser.close();await new Promise(resolve=>web.close(resolve));}
  console.log('VESA platform pages passed: Login/App Centre/Admin one-brand ownership at 320/360/390/768/1024/1280/1440, 200% scale, mobile keyboard, Settings immutability, zero external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
