/** Shared keyboard, landmark, status and reduced-motion proof for all VESA routes. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const output=path.join(root,'output','playwright');
const widths=[390,1280];
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-13T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const store={version:1,users:[{email:'qa@vesaent.com',name:'QA User',role:'admin',salt:'fixture',passwordHash:'fixture',blocked:false,demo:true,createdAt:'2026-10-13T00:00:00.000Z'}],events:[]};
const routes=[
  {id:'login',path:'/login/',authenticated:false,ready:()=>!!document.querySelector('#vesaMainContent')},
  {id:'apps',path:'/apps/',authenticated:true,ready:()=>!!document.querySelector('.vesa-workspace')},
  {id:'admin',path:'/admin/',authenticated:true,ready:()=>!!document.querySelector('.vesa-workspace')},
  {id:'tna',path:'/apps/tna/',authenticated:true,ready:()=>!!document.querySelector('.vesa-workspace')&&!!document.querySelector('#tnaMain')},
  {id:'ppm',path:'/apps/ppm/',authenticated:true,ready:()=>typeof app!=='undefined'&&!!document.querySelector('.vesa-workspace')},
  {id:'aql',path:'/apps/aql/',authenticated:true,ready:()=>!!document.querySelector('.vesa-workspace')&&!!document.querySelector('#vesa-welcome')}
];
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream';

function server(){return http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});}

async function skip(page,label){
  await page.evaluate(()=>document.activeElement?.blur());
  await page.keyboard.press('Tab');
  const active=await page.evaluate(()=>{const link=document.querySelector('.vesa-skip-link'),style=getComputedStyle(link);return {skip:document.activeElement?.matches('.vesa-skip-link'),tag:document.activeElement?.tagName,id:document.activeElement?.id,classes:document.activeElement?.className,link:{tabIndex:link?.tabIndex,display:style.display,visibility:style.visibility,rects:link?.getClientRects().length}};});
  assert.equal(active.skip,true,`${label}: skip link is first keyboard stop (${JSON.stringify(active)})`);
  const box=await page.locator('.vesa-skip-link').boundingBox();
  assert.ok(box&&box.height>=44&&box.y>=0,`${label}: focused skip link is visible and touch-sized`);
  if(['login@390','apps@390'].includes(label)) await page.screenshot({path:path.join(output,`vesa-accessibility-${label.split('@')[0]}-skip-focus-390.png`)});
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement?.id===new URL(document.querySelector('.vesa-skip-link').href).hash.slice(1)),true,`${label}: skip link focuses its current target`);
}

async function probe(browser,base,route,width){
  const context=await browser.newContext({viewport:{width,height:Math.max(844,Math.round(width*.8))},reducedMotion:'reduce'});
  if(route.authenticated)await context.addInitScript(({session,store})=>{localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify(store));},{session,store});
  const page=await context.newPage();const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  await page.goto(`${base}${route.path}`,{waitUntil:'domcontentloaded'});await page.waitForFunction(route.ready,null,{timeout:30000});
  const label=`${route.id}@${width}`;
  await skip(page,label);
  if(route.id==='aql'){
    await page.locator('#vesa-enter').click();await page.waitForFunction(()=>!!window.__vesaApp&&!document.getElementById('app').hidden);
    await page.waitForFunction(()=>document.activeElement?.matches('#app h1, #app main'));
    await page.locator('.vesa-skip-link').focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.querySelector('#app:not([hidden]) main')===document.activeElement),true,`${label}: skip target follows AQL entrance-to-workspace transition`);
  }
  const evidence=await page.evaluate(({authenticated,platform})=>{
    const visible=node=>{const style=getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length};
    const visibleMains=[...document.querySelectorAll('main')].filter(visible);
    const unnamed=platform?[...document.querySelectorAll('button,a[href],input,select,textarea')].filter(visible).filter(node=>{
      const labelled=node.getAttribute('aria-label')||node.getAttribute('aria-labelledby')||node.labels?.length||node.textContent?.trim()||node.getAttribute('title')||node.getAttribute('alt')||node.querySelector?.('img[alt]')?.getAttribute('alt');
      return !labelled;
    }).map(node=>node.outerHTML.slice(0,160)):[];
    const shell=document.querySelector('.vesa-workspace');const saved=shell?.querySelector('[data-vesa-saved]');const mobile=shell?.querySelector('[data-vesa-mobile-menu]');
    return {visibleMains:visibleMains.length,unnamed,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,skipTransition:getComputedStyle(document.querySelector('.vesa-skip-link')).transitionDuration,shell:authenticated?{header:shell?.tagName,nav:shell?.querySelector('nav')?.getAttribute('aria-label'),current:shell?.querySelector('[aria-current="page"]')?.textContent?.trim(),status:[saved?.getAttribute('role'),saved?.getAttribute('aria-live'),saved?.getAttribute('aria-atomic')],controls:mobile?.getAttribute('aria-controls'),controlled:!!document.getElementById(mobile?.getAttribute('aria-controls'))}:null};
  },{authenticated:route.authenticated,platform:['login','apps','admin'].includes(route.id)});
  assert.equal(evidence.visibleMains,1,`${label}: one visible main landmark`);
  assert.deepEqual(evidence.unnamed,[],`${label}: platform controls have accessible names`);
  assert.ok(evidence.documentWidth<=width+1&&evidence.bodyWidth<=width+1,`${label}: no horizontal overflow`);
  assert.equal(evidence.scrollBehavior,'auto',`${label}: reduced motion disables smooth scrolling`);
  assert.equal(evidence.skipTransition,'0s',`${label}: reduced motion disables skip animation`);
  if(route.authenticated){assert.equal(evidence.shell.header,'HEADER',`${label}: shared header landmark`);assert.equal(evidence.shell.nav,'VESA workspace menu',`${label}: labelled navigation`);assert.ok(evidence.shell.current,`${label}: current page is exposed`);assert.deepEqual(evidence.shell.status,['status','polite','true'],`${label}: polite atomic save status`);assert.equal(evidence.shell.controlled,true,`${label}: mobile Menu controls a real drawer`);}
  if(width===390&&['login','apps'].includes(route.id))await page.screenshot({path:path.join(output,`vesa-accessibility-${route.id}-skip-390.png`),fullPage:true});
  if(width===1280&&route.id==='aql')await page.screenshot({path:path.join(output,'vesa-accessibility-aql-workspace-1280.png'),fullPage:true});
  assert.deepEqual(errors,[],`${label}: no page errors`);assert.deepEqual(external,[],`${label}: no external requests`);
  await context.close();
}

async function run(){
  fs.mkdirSync(output,{recursive:true});const web=server();await new Promise(resolve=>web.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${web.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  try{for(const width of widths)for(const route of routes)await probe(browser,base,route,width);}finally{await browser.close();await new Promise(resolve=>web.close(resolve));}
  console.log('VESA accessibility passed: six routes at 390/1280, first-stop skip focus, dynamic AQL target, one main, labelled platform controls/navigation, live save status, reduced motion, no overflow/external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
