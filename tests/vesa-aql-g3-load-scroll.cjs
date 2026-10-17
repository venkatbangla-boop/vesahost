/** Browser-only AQL cold-load and scroll lab. No production code changes.
 * 11.8MB HTML stays identical. These measurements are NOT field INP or UX UAT.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output','aql-g3-perf');
const conf=[{w:390,h:844,cpu:4},{w:1440,h:900,cpu:1}];
const session={email:'aql-perf@vesa.invalid',name:'SYN QA',role:'admin',
 userKey:'aql-perf',loginAt:'2026-10-18T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript',
 '.json':'application/json','.ico':'image/x-icon','.png':'image/png',
 '.svg':'image/svg+xml','.jpg':'image/jpeg','.ttf':'font/ttf'};
const cases=[];
function server(){
 return http.createServer((req,res)=>{
  let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
   const st=fs.statSync(f);res.writeHead(200,{
     'Content-Type':mime[path.extname(f)]||'application/octet-stream',
     'Cache-Control':'no-store','Content-Length':st.size});
   fs.createReadStream(f).pipe(res);
  }catch{res.writeHead(404).end();}
 });
}
async function profile(browser,base,p,iteration){
 const context=await browser.newContext({viewport:{width:p.w,height:p.h},
  deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(s=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(s)),session);
 await context.addInitScript(()=>{
  window.__aqlLab={long:[],shifts:[],lcp:null};
  try{new PerformanceObserver(list=>list.getEntries().forEach(e=>window.__aqlLab.long.push(e.duration)))
    .observe({type:'longtask',buffered:true});}catch{}
  try{new PerformanceObserver(list=>list.getEntries().forEach(e=>{
   if(!e.hadRecentInput)window.__aqlLab.shifts.push(e.value);
  })).observe({type:'layout-shift',buffered:true});}catch{}
  try{new PerformanceObserver(list=>list.getEntries().forEach(e=>window.__aqlLab.lcp=e.startTime))
    .observe({type:'largest-contentful-paint',buffered:true});}catch{}
 });
 const page=await context.newPage(),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',q=>failed.push(q.url()));
 const cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:p.cpu});
 const begun=Date.now();
 try{
  const response=await page.goto(base+'/apps/aql/',{waitUntil:'domcontentloaded',timeout:90000});
  assert.equal(response.status(),200);
  const navMs=Date.now()-begun;
  await page.locator('#vesa-enter').waitFor({state:'visible',timeout:45000});
  const entryReadyMs=Date.now()-begun;
  await page.locator('#vesa-enter').click();
  await page.waitForFunction(()=>!!window.__vesaApp&&!document.getElementById('app').hidden,
    null,{timeout:60000});
  const homeReadyMs=Date.now()-begun;
  await page.locator('[data-action="demo-menu"]').first().click();
  await page.locator('[data-action="demo"][data-kind="apparel"]').click();
  await page.waitForFunction(()=>window.__vesaApp?.p?.meta?.demo===true,null,{timeout:60000});
  const inspectionReadyMs=Date.now()-begun;
  const details=await page.evaluate(async()=>{
   const doc=document.documentElement;
   const top=doc.scrollHeight-innerHeight;
   const readings=[];
   for(let n=0;n<=5;n++){
    const start=performance.now();
    window.scrollTo({top:Math.floor(top*n/5),behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    readings.push({position:n,height:window.scrollY,frameWaitMs:Math.round(performance.now()-start)});
   }
   const perf=window.__aqlLab||{};
   const nav=performance.getEntriesByType('navigation')[0]||{};
   const paint=performance.getEntriesByType('paint').find(x=>x.name==='first-contentful-paint');
   return {
    navigation:{responseEndMs:Math.round(nav.responseEnd||0),
      dclMs:Math.round(nav.domContentLoadedEventEnd||0),
      loadMs:Math.round(nav.loadEventEnd||0),
      decodedHTMLBytes:nav.decodedBodySize||null},
    fcpMs:paint?.startTime?Math.round(paint.startTime):null,
    lcpMs:perf.lcp?Math.round(perf.lcp):null,
    longTaskCount:perf.long.length,
    longTaskTotalMs:Math.round(perf.long.reduce((a,b)=>a+b,0)),
    longTaskMaxMs:Math.round(Math.max(0,...perf.long)),
    layoutShiftScore:Number(perf.shifts.reduce((a,b)=>a+b,0).toFixed(3)),
    domNodes:document.getElementsByTagName('*').length,
    imagesInDOM:document.images.length,
    pageHeight:doc.scrollHeight,pageWidth:doc.scrollWidth,
    usedHeapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,
    scroll:readings
   };
  });
  assert.ok(details.pageWidth<=p.w+1,'no AQL viewport horizontal overflow');
  assert.deepEqual(errors,[],'AQL has no uncaught errors during synthetic inspection');
  assert.deepEqual(failed,[],'no failed local requests');
  await page.evaluate(()=>window.scrollTo(0,0));
  const screenshot='aql-'+p.w+'-'+iteration+'.png';
  await page.screenshot({path:path.join(out,screenshot),fullPage:false,animations:'disabled'});
  const result={width:p.w,height:p.h,cpuThrottle:p.cpu,iteration,navMs,entryReadyMs,
   homeReadyMs,inspectionReadyMs,errors,requestFailures:failed,screenshot,details};
  cases.push(result);
  console.log('AQL_G3_METRIC '+JSON.stringify(result));
 }finally{
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1}).catch(()=>{});
  await context.close();
 }
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const srv=server();await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+srv.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--enable-precise-memory-info']});
 try{
  for(const p of conf)for(let trial=1;trial<=2;trial++)await profile(browser,base,p,trial);
  const report={kind:'AQL 11.8MB local cold-context Chromium lab - NOT field device or approval',
    sha:process.env.GITHUB_SHA||'local',
    rawHTMLBytes:fs.statSync(path.join(root,'apps/aql/index.html')).size,
    cases,limitations:['Local HTTP uncompressed static file; not real Github Pages transport',
    'CPU throttle is synthetic and not equivalent to a real Android/iOS handset',
    'Frame waits are not INP/scroll jank measurement',
    'Static source immutable and user records isolated synthetic']};
  fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(report,null,2));
  console.log('AQL_G3_LAB_SUCCESS '+JSON.stringify({cases:cases.length,
   rawHTML:report.rawHTMLBytes,errors:cases.flatMap(x=>x.errors).length}));
 }finally{
  await browser.close();await new Promise(ok=>srv.close(ok));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
