/** Premium Login: real Chromium and WebKit, synthetic demo account. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output','playwright','premium-login');
const widths=[320,360,390,768,1024,1280,1440,1920];
const themes=['clear-blue','pure-mono','midnight-mono','forest-yellow','warm-ivory'];
const languages=['en','bn','hi','ta'];
const id='user@vesa',secret='vesa';
function server(){
 const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript',
   '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
 return http.createServer((req,res)=>{
   const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   let file=path.resolve(root,'.'+name);
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   try{
     if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
     const stat=fs.statSync(file);
     res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
     fs.createReadStream(file).pipe(res);
   }catch{res.writeHead(404).end();}
 });
}
async function open(browser,base,route='/login/',width=390){
 const context=await browser.newContext({viewport:{width,height:width===320?740:width<600?844:900},deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
 await page.goto(base+route,{waitUntil:'domcontentloaded'});
 await page.locator('[data-vesa-pref-controls]').waitFor({state:'visible',timeout:15000});
 return {page,context,errors,external};
}
async function layout(browser,engine,base,width){
 const {page,context,errors,external}=await open(browser,base,'/login/',width);
 const q=await page.evaluate(()=>{
   const shown=el=>getComputedStyle(el).display!=='none'&&el.getClientRects().length;
   const controls=[...document.querySelectorAll('#loginForm button,#loginForm input,[data-vesa-pref-controls] select')].filter(shown);
   return {
     scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,
     card:Math.round(document.querySelector('.auth-card').getBoundingClientRect().width),
     story:!!shown(document.querySelector('.login-story')),
     heights:controls.map(x=>Math.round(x.getBoundingClientRect().height)),
     brand:[...document.querySelectorAll('.auth-logo img')].filter(shown).length,
     oldBar:document.querySelectorAll('.vesa-workspace,.app-user-bar').length,
     styles:[...document.querySelectorAll('link[rel=stylesheet]')].map(x=>x.getAttribute('href')),
     bodyFont:getComputedStyle(document.body).fontFamily
   };
 });
 const n=engine+'/'+width;
 assert.equal(q.brand,1,n+': one logo');
 assert.equal(q.oldBar,0,n+': no duplicate nav');
 assert.ok(q.scroll<=width+1&&q.body<=width+1,n+': horizontal overflow '+q.scroll);
 assert.ok(q.card>=Math.min(278,width-34),n+': login panel is not tiny '+q.card);
 assert.equal(q.story,width>900,n+': adaptive split panel');
 assert.ok(q.heights.every(h=>h>=44),n+': touch/control sizing '+q.heights);
 assert.equal(q.styles.some(x=>x.includes('/css/style.css')),false,n+': no homepage styles');
 assert.equal(await page.locator('#email').inputValue(),id,n+': demo username prefilled');
 assert.equal(await page.locator('#password').inputValue(),secret,n+': demo password prefilled');
 assert.equal(await page.locator('#demoUserId').textContent(),id,n+': visible user ID');
 assert.equal(await page.locator('#demoPassword').textContent(),secret,n+': visible password');
 assert.match(q.bodyFont,/Segoe UI/i,n+': shared typography');
 assert.deepEqual(errors,[],n+': errors');
 assert.deepEqual(external,[],n+': no external requests');
 if([320,390,1440,1920].includes(width))
   await page.screenshot({path:path.join(out,'login-'+engine+'-'+width+'.png'),fullPage:true,animations:'disabled'});
 await context.close();
 return {engine,width,card:q.card,minControl:Math.min(...q.heights)};
}
async function preferenceAndFailure(browser,base){
 const {page,context,errors}=await open(browser,base);
 const input=page.locator('#password'),toggle=page.locator('#passwordToggle');
 await toggle.click();
 assert.equal(await input.getAttribute('type'),'text','Show reveals public demo input');
 assert.equal(await toggle.getAttribute('aria-pressed'),'true','Show state accessible');
 await toggle.click();
 assert.equal(await input.getAttribute('type'),'password','Hide masks input');
 for(const lang of languages){
   await page.locator('[data-pref-language]').selectOption(lang);
   assert.equal(await page.locator('html').getAttribute('lang'),lang,'document language '+lang);
   assert.ok((await page.locator('#loginHeading').textContent()).length>7,'localized heading '+lang);
   assert.equal(await input.inputValue(),secret,'password not translated '+lang);
 }
 await page.locator('[data-pref-language]').selectOption('en');
 for(const theme of themes){
   await page.locator('[data-pref-theme]').selectOption(theme);
   assert.equal(await page.locator('html').getAttribute('data-vesa-theme'),theme,'theme '+theme);
   assert.equal(await page.locator('.auth-card').evaluate(n=>getComputedStyle(n).borderRadius),'14px','card theme '+theme);
 }
 await page.screenshot({path:path.join(out,'login-dark-390.png'),fullPage:true,animations:'disabled'});
 await page.locator('#password').fill('incorrect-demo');
 await page.locator('#loginSubmit').click();
 await page.locator('#authMessage.bad').waitFor({state:'visible'});
 assert.match(await page.locator('#authMessage').textContent(),/not correct/i,'wrong password message');
 assert.equal(await page.locator('#loginSubmit').isEnabled(),true,'submit re-enabled');
 assert.equal(new URL(page.url()).pathname,'/login/','invalid stays at login');
 assert.deepEqual(errors,[],'no page errors after preferences/failed login');
 await context.close();
}
async function signIn(browser,base,route,expected){
 const {page,context,errors,external}=await open(browser,base,route);
 await page.locator('#loginSubmit').click();
 await page.waitForURL(url=>url.pathname===expected,{timeout:30000});
 await page.locator('.vesa-workspace').waitFor({state:'visible',timeout:20000});
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('vesa.appcentre.session.v1')||'null'));
 assert.equal(s?.email,id,'demo user created genuine session');
 assert.equal(s?.role,'user','not admin');
 assert.deepEqual(errors,[],'no browser errors on sign-in');
 assert.deepEqual(external,[],'no external requests on sign-in');
 await context.close();
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const httpServer=server();
 await new Promise(resolve=>httpServer.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+httpServer.address().port;
 const browsers=[],results=[];
 try{
   browsers.push({id:'chromium',browser:await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']})});
   browsers.push({id:'webkit',browser:await webkit.launch({headless:true})});
   for(const item of browsers){
     for(const width of (item.id==='chromium'?widths:[390,1440]))
       results.push(await layout(item.browser,item.id,base,width));
   }
   await preferenceAndFailure(browsers[0].browser,base);
   await signIn(browsers[0].browser,base,'/login/','/apps/');
   await signIn(browsers[0].browser,base,'/login/?next=%2Fapps%2Fproduct-development%2F','/apps/product-development/');
   await signIn(browsers[0].browser,base,'/login/?next=https%3A%2F%2Foffsite.invalid%2F','/apps/');
   await signIn(browsers[1].browser,base,'/login/','/apps/');
   await signIn(browsers[1].browser,base,'/login/?next=%2Fapps%2Fbuyer-crm%2F','/apps/buyer-crm/');
   fs.writeFileSync(path.join(out,'login-proof.json'),JSON.stringify({sha:process.env.GITHUB_SHA||'local',results},null,2));
   console.log('PREMIUM_LOGIN_PROOF '+JSON.stringify({views:results.length,chromiumWidths:widths,webkitWidths:[390,1440],themes,languages,minControl:Math.min(...results.map(x=>x.minControl)),flows:5}));
 }finally{
   for(const item of browsers)await item.browser.close();
   await new Promise(resolve=>httpServer.close(resolve));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
