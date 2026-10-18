/**
 * VESA 360 Chromium real-screen audit: all 19 routes, real open actions,
 * section navigation and synthetic 390/1440px screenshots. Not human UAT.
 * Fresh browser state per case; no third-party data or cross-app mutation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
class VesaNineteenScreenAudit {
 static ROOT=path.resolve(__dirname,'..');
 static OUT=path.join(VesaNineteenScreenAudit.ROOT,'output','vesa-19-real-screens');
 static IDS=['aql','ppm','tna','costing','packing-container','order-commission',
  'tech-pack-spec','purchase-order','lc-payment','sampling-approval','fabric-trims',
  'shipment-documentation','production-tracker','factory-vendor','label-artwork-approval',
  'buyer-crm','fabric-supplier-comparison','claims-disputes','product-development'];
 constructor(){this.cases=[];this.blockers=[];}
 async openServer(){
  this.server=http.createServer((req,res)=>{
   try{
    const u=new URL(req.url,'http://localhost');
    let f=path.resolve(VesaNineteenScreenAudit.ROOT,'.'+decodeURIComponent(u.pathname));
    if(!f.startsWith(VesaNineteenScreenAudit.ROOT+path.sep))return res.writeHead(403).end();
    if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');
    const ext=path.extname(f);
    const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
      '.json':'application/json','.png':'image/png','.ico':'image/x-icon',
      '.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg'}[ext]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(fs.readFileSync(f));
   }catch{res.writeHead(404).end();}
  });
  await new Promise(r=>this.server.listen(0,'127.0.0.1',r));
  this.base='http://127.0.0.1:'+this.server.address().port;
  this.browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,
   headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
  fs.mkdirSync(VesaNineteenScreenAudit.OUT,{recursive:true});
 }
 async snap(page,id,width,name){
  const file=id+'-'+width+'-'+name.replace(/[^a-z0-9-]/gi,'-')+'.png';
  await page.screenshot({path:path.join(VesaNineteenScreenAudit.OUT,file),
   timeout:25000,animations:'disabled'});
  return file;
 }
 async firstButton(page,selectors){
  for(const sel of selectors){
   const list=page.locator(sel);
   for(let n=0;n<Math.min(12,await list.count());n++){
    const el=list.nth(n);
    if(await el.isVisible().catch(()=>false) && await el.isEnabled().catch(()=>false))return el;
   }
  }
  return null;
 }
 async inspect(id,width){
  const context=await this.browser.newContext({viewport:{width,height:860},
    serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
  await context.addInitScript(()=>{
   localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
    email:'visual-qa@vesa.invalid',name:'SYNTHETIC QA',role:'admin',
    userKey:'synthetic-qa',loginAt:'2026-10-18T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'}));
   localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify({version:1,users:[],events:[]}));
  });
  const page=await context.newPage(),errors=[];
  const report={id,width,shots:[],opened:'none',tabs:[],issues:errors};
  page.on('pageerror',e=>errors.push('runtime: '+String(e.message).slice(0,220)));
  try{
   const res=await page.goto(this.base+'/apps/'+id+'/',{waitUntil:'domcontentloaded',timeout:60000});
   report.status=res?.status();
   await page.locator('.vesa-workspace').first().waitFor({state:'visible',timeout:18000});
   report.shell=await page.locator('.vesa-workspace').count();
   report.menus=await page.locator('[data-vesa-menu]').count();
   await page.waitForTimeout(250);
   report.shots.push(await this.snap(page,id,width,'home'));
   const btn=await this.firstButton(page,['button[data-action="preview"]',
      'button[data-action="practice"]','button[data-command="practice"]',
      'button[data-cmd="practice"]',
      '#homeScreen [data-command="new"]','[data-action="demo-menu"]','#vesa-enter']);
   if(btn){
    report.opened=(await btn.getAttribute('data-action'))||
      (await btn.getAttribute('data-command'))||
      (await btn.getAttribute('data-cmd'))||(await btn.getAttribute('id'));
    try{
     await btn.click({timeout:8000});
     if(id==='aql'){
      const entry=await this.firstButton(page,['[data-action="demo-menu"]']);
      if(entry){
       await entry.click({timeout:5000});
       const demo=await this.firstButton(page,['[data-action="demo"][data-kind="apparel"]']);
       if(demo)await demo.click({timeout:5000});
      }
     }
     await page.waitForTimeout(220);
     report.shots.push(await this.snap(page,id,width,'opened'));
    }catch(e){errors.push('Open action '+String(e.message).slice(0,230));}
   }
   // Costing uses its original data-cmd/data-section UI rather than data-action.
   const costing=id==='costing';
   const nav=page.locator(costing?'.costing-section-tabs button[data-section]':
     'nav[class*="tabs"] button[data-action]');
   for(let n=0;n<Math.min(14,await nav.count());n++){
    const act=await nav.nth(n).getAttribute(costing?'data-section':'data-action');
    if(!act||report.tabs.includes(act))continue;
    report.tabs.push(act);
    try{
     const selector=costing?'.costing-section-tabs button[data-section="'+act+'"]':
      'nav[class*="tabs"] button[data-action="'+act+'"]';
     const tab=page.locator(selector).first();
     if(!await tab.isVisible())continue;
     await tab.click({timeout:7500});
     report.shots.push(await this.snap(page,id,width,'section-'+act));
    }catch(e){errors.push('Section '+act+' '+String(e.message).slice(0,220));}
   }
   report.metrics=await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,
    h1:document.querySelector('h1')?.textContent?.trim()?.slice(0,100)||'',
    forms:document.forms.length,dialogs:document.querySelectorAll('dialog').length,
    buttons:document.querySelectorAll('button').length,
    locale:document.documentElement.lang
   }));
   if(report.metrics.scrollWidth>width+1)errors.push('Overflow '+report.metrics.scrollWidth+' at '+width);
   if(id==='costing'){
    const valid=report.opened==='practice'&&report.tabs.length===7&&report.shots.length===9;
    if(!valid)this.blockers.push({id,width,reason:'Costing Home and all seven original sections must open'});
    if(report.metrics.h1!=='Costing 360')this.blockers.push({id,width,reason:'Short Costing page title lost'});
   }
   if(report.status!==200||report.shell!==1||report.menus!==6)
    this.blockers.push({id,width,status:report.status,shell:report.shell,menus:report.menus});
  }catch(e){
   errors.push('Cannot open workspace: '+String(e.message).slice(0,250));
   this.blockers.push({id,width,fatal:String(e.message).slice(0,250)});
  }finally{
   this.cases.push(report);
   console.log('SCREEN_AUDIT '+JSON.stringify({
    id,width,status:report.status,shell:report.shell,menus:report.menus,
    opened:report.opened,tabs:report.tabs,screens:report.shots.length,
    issues:errors.slice(0,3)}));
   await context.close();
  }
 }
 async run(){
  await this.openServer();
  try{
   for(const id of VesaNineteenScreenAudit.IDS)
    for(const width of [390,1440])await this.inspect(id,width);
   fs.writeFileSync(path.join(VesaNineteenScreenAudit.OUT,'manifest.json'),
    JSON.stringify({source:process.env.GITHUB_SHA||'local',
     note:'19-app 38 real-browser opened route audit, not comprehensive form or human acceptance',
     cases:this.cases,blockers:this.blockers},null,2));
   if(this.cases.length!==38||this.blockers.length)
    throw Error('19 app opened route blocker '+JSON.stringify(this.blockers).slice(0,1600));
   console.log('SCREEN_AUDIT_DONE '+JSON.stringify({routes:19,cases:38,
    screenshots:this.cases.reduce((n,v)=>n+v.shots.length,0),
    issueSessions:this.cases.filter(v=>v.issues.length).length}));
  }finally{
   await this.browser.close();
   await new Promise(r=>this.server.close(r));
  }
 }
}
new VesaNineteenScreenAudit().run().catch(e=>{console.error(e);process.exitCode=1;});