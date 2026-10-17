/**
 * G3 visual and main-thread audit of OPEN TNA, PPM and AQL workspaces.
 * No application source or approved business engine is mutated.
 * All entries are synthetic and live in isolated browser contexts.
 * Screenshots and JSON report are artifacts only, not public site files.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const out=path.join(root,'output','g3-active-ux');
const sizes=[{name:'phone-390',width:390,height:844},
 {name:'desktop-1440',width:1440,height:900},
 {name:'phone-320',width:320,height:740},
 {name:'desktop-1920',width:1920,height:1080}];
const session={email:'g3-synthetic@vesa.invalid',name:'SYN G3 QA',role:'admin',
 userKey:'g3-synthetic',loginAt:'2026-10-18T00:00:00.000Z',
 expiresAt:'2099-01-01T00:00:00.000Z'};
const mime={'.html':'text/html','.js':'application/javascript',
 '.css':'text/css','.json':'application/json','.svg':'image/svg+xml',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.woff2':'font/woff2',
 '.ico':'image/x-icon','.webp':'image/webp','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const cases=[];
const exceptions=[];
function server(){
 return http.createServer((req,res)=>{
  let file;
  try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local.test').pathname));}
  catch{res.writeHead(400).end();return;}
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const stat=fs.statSync(file);
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream',
     'Cache-Control':'no-store','Content-Length':stat.size});
   fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(404).end();}
 });
}
function safe(name){return String(name).replace(/[^a-z0-9_-]/gi,'_');}
async function metrics(page){
 return page.evaluate(()=>{
  const perf=window.__g3Metrics||{};
  const elems=[...document.querySelectorAll('a,button,input,select,textarea,[role=button]')].filter(e=>{
   const s=getComputedStyle(e),r=e.getBoundingClientRect();
   return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
  });
  const resources=performance.getEntriesByType('resource');
  const nav=performance.getEntriesByType('navigation')[0];
  const fcp=performance.getEntriesByType('paint').find(e=>e.name==='first-contentful-paint');
  const ls=perf.layoutShifts||[];
  return {
    documentHeight:document.documentElement.scrollHeight,
    scrollWidth:document.documentElement.scrollWidth,
    viewportWidth:innerWidth,
    domElements:document.getElementsByTagName('*').length,
    focusableCount:elems.length,
    targetsUnder44:elems.filter(e=>e.getBoundingClientRect().height<44).length,
    visibleLabels:document.querySelectorAll('label').length,
    visibleInputs:elems.filter(e=>/^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName)).length,
    dialogs:document.querySelectorAll('dialog,[role=dialog]').length,
    shellCount:document.querySelectorAll('.vesa-workspace').length,
    resourceCount:resources.length,
    resourceDecodedBytes:Math.round(resources.reduce((n,x)=>n+(x.decodedBodySize||0),0)),
    appNavDclMs:Math.round(nav?.domContentLoadedEventEnd||0),
    fcpMs:Math.round(fcp?.startTime||0),
    labLcpMs:perf.lcp||null,
    labCls:ls.reduce((a,b)=>a+b,0),
    longTaskCount:(perf.longTasks||[]).length,
    longTaskTotalMs:Math.round((perf.longTasks||[]).reduce((a,b)=>a+b,0)),
    longTaskMaxMs:Math.round(Math.max(0,...(perf.longTasks||[]))),
    usedHeapBytes:performance.memory?.usedJSHeapSize||null
  };
 });
}
async function screenshot(page,app,view,size,position){
 await page.evaluate(pos=>{
  const height=document.documentElement.scrollHeight-innerHeight;
  window.scrollTo({top:Math.floor(pos==='top'?0:pos==='middle'?height*.5:height),behavior:'instant'});
 },position);
 await page.waitForTimeout(120);
 const filename=safe(app+'-'+view+'-'+size.name+'-'+position)+'.png';
 await page.screenshot({path:path.join(out,filename),animations:'disabled',fullPage:false,timeout:40000});
 return filename;
}
async function visit(page,app,view,size,positions=['top','middle','bottom']){
 const before=await metrics(page);
 const paths=[];
 for(const pos of positions)paths.push(await screenshot(page,app,view,size,pos));
 const after=await metrics(page);
 cases.push({app,view,device:size.name,width:size.width,height:size.height,
  before,after,paths});
 console.log('G3_FRAME '+JSON.stringify({app,view,device:size.name,shots:paths.length,
  dom:after.domElements,height:after.documentHeight,under44:after.targetsUnder44,
  longTaskTotalMs:after.longTaskTotalMs,errors:exceptions.length}));
}
async function runTNA(page,size){
 await page.locator('[data-action=new]').waitFor({state:'visible',timeout:25000});
 await visit(page,'tna','home',size,['top']);
 await page.locator('[data-action=new]').first().click();
 await page.locator('[data-wizard-tab=full]').click();
 const data={buyerName:'SYN QA BUYER',factoryName:'SYN QA FACTORY',
  styleNo:'SYN-UX-STYLE',poNumber:'SYN-UX-PO',totalQty:'1000',
  buyerRequiredExFactory:'2027-02-10',orderConfirmedOn:'2026-10-01',
  fabricSpec:'SYN 210 GSM COTTON',colorSizeBreakdown:'Navy | S | 500\nBlack | M | 500'};
 for(const key of Object.keys(data)){
  await page.locator('#tnaWizard [name="'+key+'"]').fill(data[key]);
 }
 await page.locator('#tnaWizard button[type=submit]').click();
 await page.locator('#tnaMerchSheet [data-tna-sheet-task]').first().waitFor({state:'attached',timeout:30000});
 await visit(page,'tna','master-sheet',size);
 await page.locator('#tnaMerchSheet [data-edit-task-dates]').first().click();
 await page.locator('#tnaPlanningDateForm').waitFor({state:'visible'});
 await visit(page,'tna','date-dialog',size,['top']);
}
async function runPPM(page,size){
 await page.waitForFunction(()=>typeof app!=='undefined'&&document.body.classList.contains('at-home'),{timeout:25000});
 await visit(page,'ppm','home',size,['top']);
 await page.locator('#homeScreen [data-command="new"]').click();
 await page.waitForFunction(()=>!document.body.classList.contains('at-home')&&!!app.record,{timeout:30000});
 const count=await page.locator('#masterCount').textContent();
 if(count!=='168')throw Error('PPM checkpoint identities diverged: '+count);
 await visit(page,'ppm','editor',size);
 await page.locator('#knowledgeBtn').click();
 await page.locator('#modalBody .knowledge-box').first().waitFor({state:'visible'});
 await visit(page,'ppm','guide',size,['top']);
}
async function runAQL(page,size){
 await page.locator('#vesa-enter').waitFor({state:'visible',timeout:25000});
 await visit(page,'aql','entrance',size,['top']);
 await page.locator('#vesa-enter').click();
 await page.waitForFunction(()=>!!window.__vesaApp&&!document.getElementById('app').hidden,{timeout:30000});
 await visit(page,'aql','home',size,['top']);
 await page.locator('[data-action="demo-menu"]').first().click();
 await page.locator('[data-action="demo"][data-kind="apparel"]').click();
 await page.waitForFunction(()=>!!window.__vesaApp?.p&&window.__vesaApp.p.meta.demo===true,{timeout:30000});
 await visit(page,'aql','inspection',size);
}
async function inspect(browser,base,app,size){
 const context=await browser.newContext({viewport:{width:size.width,height:size.height},
  deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
 await context.addInitScript(()=>{
  window.__g3Metrics={longTasks:[],layoutShifts:[],lcp:null};
  try{
   new PerformanceObserver(list=>list.getEntries().forEach(e=>window.__g3Metrics.longTasks.push(e.duration)))
    .observe({type:'longtask',buffered:true});
   new PerformanceObserver(list=>list.getEntries().forEach(e=>{
    if(!e.hadRecentInput)window.__g3Metrics.layoutShifts.push(e.value);
   })).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>list.getEntries().forEach(e=>window.__g3Metrics.lcp=Math.round(e.startTime)))
    .observe({type:'largest-contentful-paint',buffered:true});
  }catch{}
 });
 const page=await context.newPage(),errors=[],fails=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',q=>fails.push(q.url()+' '+q.failure()?.errorText));
 try{
  const response=await page.goto(base+'/apps/'+app+'/',{waitUntil:'domcontentloaded',timeout:60000});
  if(response?.status()!==200)throw Error('Unexpected HTTP '+response?.status());
  if(app==='tna')await runTNA(page,size);
  else if(app==='ppm')await runPPM(page,size);
  else await runAQL(page,size);
  if(errors.length)throw Error(app+'/'+size.name+' runtime errors: '+JSON.stringify(errors.slice(0,5)));
  if(fails.length)console.warn('G3_REQUESTS '+app+'/'+size.name+' '+JSON.stringify(fails.slice(0,5)));
 }catch(e){
  exceptions.push({app,device:size.name,error:String(e.message).slice(0,550),pageErrors:errors});
  console.error('G3_CAPTURE_ERROR '+app+'/'+size.name+' '+String(e.message).slice(0,550));
 }finally{await context.close();}
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const service=server();await new Promise(ok=>service.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+service.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  for(const size of sizes)for(const app of ['tna','ppm','aql'])await inspect(browser,base,app,size);
  const sourceSizes=Object.fromEntries(['tna','ppm','aql'].map(name=>[name,
   fs.statSync(path.join(root,'apps',name,'index.html')).size]));
  const report={
   date:new Date().toISOString(),sha:process.env.GITHUB_SHA||'local',
   kind:'G3 synthetic active-workflow visual/performance audit - not human UAT',
   sourceSizes,views:cases.length,screenshots:cases.reduce((n,c)=>n+c.paths.length,0),
   caveats:['Chromium only, no physical device or field INP', 'No actual user/factory approval',
    'Screenshots measure initial/active form/scroll visual; deeper save/report paths remain for follow-up',
    'All local browser records isolated synthetic fixtures'],
   exceptions,cases
  };
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(report,null,2));
  console.log('G3_SUMMARY '+JSON.stringify({views:report.views,screenshots:report.screenshots,
   sourceSizes,exceptions}));
  if(exceptions.length)process.exitCode=1;
 }finally{await browser.close();await new Promise(ok=>service.close(ok));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
