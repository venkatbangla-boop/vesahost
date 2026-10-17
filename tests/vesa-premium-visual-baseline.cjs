/**
 * VESA premium visual baseline — read-only screenshot and performance inventory.
 *
 * This is an evidence collector, NOT a UI acceptance test and NOT an auth
 * security check. Every protected page uses a fresh synthetic local session.
 * Captures 23 route entries at 390/1440 pixels, three vertical positions,
 * plus tablet/wide/zoom previews. Never mutates saved user data or business rules.
 * Screenshot PNGs and manifest live in CI artifacts; only small labelled
 * contact sheets are emitted to job logs for human-visible comparative review.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

class VesaPremiumVisualBaseline {
  static ROOT=path.resolve(__dirname,'..');
  static OUTPUT=path.join(VesaPremiumVisualBaseline.ROOT,'output','premium-visual-baseline');
  static SESSION=Object.freeze({
    email:'synthetic-qa@vesa.invalid',name:'Synthetic QA',role:'admin',
    userKey:'synthetic-qa',loginAt:'2026-10-18T00:00:00.000Z',
    expiresAt:'2099-01-01T00:00:00.000Z'
  });
  static STORE=Object.freeze({version:1,users:[{
    email:'synthetic-qa@vesa.invalid',name:'Synthetic QA',role:'admin',
    salt:'synthetic-only',passwordHash:'synthetic-only',blocked:false,
    demo:true,createdAt:'2026-10-18T00:00:00.000Z'
  }],events:[]});
  static APP_IDS=Object.freeze([
    'aql','ppm','tna','costing','packing-container','order-commission',
    'tech-pack-spec','purchase-order','lc-payment','sampling-approval',
    'fabric-trims','shipment-documentation','production-tracker',
    'factory-vendor','label-artwork-approval','buyer-crm',
    'fabric-supplier-comparison','claims-disputes','product-development'
  ]);
  static PAGES=Object.freeze([
    {id:'login',route:'/login/',isPublic:true},
    {id:'app-centre',route:'/apps/',isPublic:false},
    {id:'admin',route:'/admin/',isPublic:false},
    ...VesaPremiumVisualBaseline.APP_IDS.map(id=>({
      id,route:'/apps/'+id+'/',isPublic:false
    }))
  ]);
  static VIEWPORTS=Object.freeze([
    {id:'phone-390',width:390,height:844,scale:1},
    {id:'desktop-1440',width:1440,height:900,scale:1}
  ]);
  static EXTRAS=Object.freeze([
    {id:'phone-small-320',width:320,height:740,scale:1},
    {id:'tablet-768',width:768,height:1024,scale:1},
    {id:'desktop-wide-1920',width:1920,height:1080,scale:1}
  ]);
  static MEDIA=Object.freeze({
    '.html':'text/html; charset=utf-8','.js':'application/javascript',
    '.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json',
    '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml',
    '.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon',
    '.mp4':'video/mp4','.webm':'video/webm','.txt':'text/plain'
  });
  constructor(){
    this.results=[];
    this.contactItems={'phone-390':[],'desktop-1440':[]};
    this.failures=[];
    this.networkErrors=[];
  }
  server(){
    return http.createServer((req,res)=>{
      let url;
      try{url=new URL(req.url,'http://localhost');}
      catch{res.writeHead(400).end();return;}
      if(url.pathname.includes('\0')){res.writeHead(400).end();return;}
      let file=path.resolve(VesaPremiumVisualBaseline.ROOT,'.'+decodeURIComponent(url.pathname));
      if(file!==VesaPremiumVisualBaseline.ROOT &&
         !file.startsWith(VesaPremiumVisualBaseline.ROOT+path.sep)){
        res.writeHead(403).end();return;
      }
      try{
        let stat=fs.statSync(file);
        if(stat.isDirectory()){
          file=path.join(file,'index.html');stat=fs.statSync(file);
        }
        if(!stat.isFile())throw Error('not a file');
        res.writeHead(200,{
          'Content-Type':VesaPremiumVisualBaseline.MEDIA[path.extname(file)]||'application/octet-stream',
          'Content-Length':stat.size,'Cache-Control':'no-store'
        });
        fs.createReadStream(file).pipe(res);
      }catch{
        res.writeHead(404,{'Content-Type':'text/plain'}).end('not found');
      }
    });
  }
  syntheticSession(){
    return ({session,store})=>{
      localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));
      localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify(store));
    };
  }
  async capture(browser,base,entry,viewport,{positions=['top','middle','bottom'],contact=false}={}){
    const id=entry.id+'__'+viewport.id;
    const context=await browser.newContext({
      viewport:{width:viewport.width,height:viewport.height},
      deviceScaleFactor:1,serviceWorkers:'block',
      reducedMotion:'reduce',acceptDownloads:false
    });
    const errors=[],requests=[],start=Date.now(),shots=[],consoleErrors=[];
    if(!entry.isPublic)await context.addInitScript(this.syntheticSession(),{
      session:VesaPremiumVisualBaseline.SESSION,store:VesaPremiumVisualBaseline.STORE
    });
    await context.addInitScript(()=>{
      window.__vesaPerf={longTasks:[],layoutShifts:[],lcp:0};
      try{
        new PerformanceObserver(list=>list.getEntries().forEach(e=>{
          window.__vesaPerf.longTasks.push(Math.round(e.duration));
        })).observe({type:'longtask',buffered:true});
        new PerformanceObserver(list=>list.getEntries().forEach(e=>{
          if(!e.hadRecentInput)window.__vesaPerf.layoutShifts.push(e.value);
        })).observe({type:'layout-shift',buffered:true});
        new PerformanceObserver(list=>list.getEntries().forEach(e=>{
          window.__vesaPerf.lcp=Math.round(e.startTime);
        })).observe({type:'largest-contentful-paint',buffered:true});
      }catch{}
    });
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(String(error.message).slice(0,250)));
    page.on('console',message=>{
      if(message.type()==='error')consoleErrors.push(message.text().slice(0,250));
    });
    page.on('requestfailed',request=>{
      requests.push({url:request.url().slice(0,220),failure:request.failure()?.errorText||''});
    });
    let loadError=null,loadStatus=null;
    try{
      const response=await page.goto(base+entry.route,{waitUntil:'domcontentloaded',timeout:60000});
      loadStatus=response?.status()||null;
      if(!entry.isPublic)await page.locator('.vesa-workspace').waitFor({
        state:'visible',timeout:18000
      }).catch(()=>{});
      await page.waitForTimeout(600);
      // Freeze moving hero and pause videos for deterministic screenshot visuals.
      await page.evaluate(()=>{
        document.querySelectorAll('video').forEach(video=>{
          try{video.pause()}catch{}
        });
      });
      for(const position of positions){
        if(position==='middle')await page.evaluate(()=>{
          window.scrollTo(0,Math.floor(
            (document.documentElement.scrollHeight-window.innerHeight)/2
          ));
        });
        if(position==='bottom')await page.evaluate(()=>{
          window.scrollTo(0,document.documentElement.scrollHeight);
        });
        await page.waitForTimeout(110);
        const filename=id+'__'+position+'.png';
        const file=path.join(VesaPremiumVisualBaseline.OUTPUT,filename);
        const buffer=await page.screenshot({path:file,animations:'disabled',timeout:30000});
        shots.push(filename);
        if(contact&&position==='top'){
          this.contactItems[viewport.id].push({
            id:entry.id,data:buffer.toString('base64')
          });
        }
      }
    }catch(e){loadError=String(e.message).slice(0,500);}
    let dom={};
    try{
      dom=await page.evaluate(()=>{
        const rects=[...document.querySelectorAll('button,input,select,textarea,a')]
          .filter(el=>{
            const style=getComputedStyle(el);
            return style.display!=='none'&&style.visibility!=='hidden'&&
              el.getClientRects().length>0;
          })
          .map(el=>Math.round(el.getBoundingClientRect().height));
        const navigation=performance.getEntriesByType('navigation')[0]||{};
        const paints=performance.getEntriesByType('paint');
        const fp=paints.find(e=>e.name==='first-contentful-paint');
        const p=window.__vesaPerf||{};
        const logos=[...document.querySelectorAll('img[alt*="VESA"],.vesa-workspace__brand img')]
          .filter(el=>getComputedStyle(el).display!=='none'&&el.getClientRects().length).length;
        return {
          documentWidth:document.documentElement.scrollWidth,
          bodyWidth:document.body.scrollWidth,
          documentHeight:document.documentElement.scrollHeight,
          minControlHeight:rects.length?Math.min(...rects):null,
          visibleControls:rects.length,
          inputCount:document.querySelectorAll('input:not([type=hidden])').length,
          forms:document.forms.length,buttons:document.querySelectorAll('button').length,
          links:document.querySelectorAll('a[href]').length,
          dialogs:document.querySelectorAll('dialog,[role=dialog]').length,
          domElements:document.getElementsByTagName('*').length,
          shellCount:document.querySelectorAll('.vesa-workspace').length,
          visibleLogoCandidates:logos,
          readyState:document.readyState,
          navigationDclMs:Math.round(navigation.domContentLoadedEventEnd||0),
          fcpMs:Math.round(fp?.startTime||0),labLcpMs:p.lcp||null,
          labCls:(p.layoutShifts||[]).reduce((a,b)=>a+b,0),
          longTaskCount:(p.longTasks||[]).length,
          longTaskTotalMs:(p.longTasks||[]).reduce((a,b)=>a+b,0),
          longTaskMaxMs:Math.max(0,...(p.longTasks||[]))
        };
      });
    }catch(e){dom.error=String(e.message).slice(0,220);}
    const result={
      id:entry.id,route:entry.route,viewport:viewport.id,
      width:viewport.width,height:viewport.height,sourceSha:process.env.GITHUB_SHA||'local',
      browser:'playwright-chromium',login:'synthetic-local-session-only',
      timestamp:new Date().toISOString(),httpStatus:loadStatus,
      elapsedMs:Date.now()-start,shotCount:shots.length,shots,
      pageErrors:errors,consoleErrors:consoleErrors.slice(0,10),
      failedRequests:requests.slice(0,10),loadError,dom
    };
    this.results.push(result);
    if(loadStatus!==200||loadError||shots.length!==positions.length)
      this.failures.push({id,loadStatus,loadError,shots});
    await context.close();
    return result;
  }
  async contactSheet(browser,kind,items){
    if(!items.length)return;
    const cols=4,cellWidth=390,cellHeight=267,header=33;
    const sheet=await browser.newPage({viewport:{width:1600,height:900}});
    const base64=await sheet.evaluate(async({items,cols,cellWidth,cellHeight,header})=>{
      const rows=Math.ceil(items.length/cols);
      const canvas=document.createElement('canvas');
      canvas.width=cols*cellWidth;canvas.height=rows*cellHeight;
      const ctx=canvas.getContext('2d',{alpha:false});
      ctx.fillStyle='#edf1f4';ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let i=0;i<items.length;i++){
        const item=items[i],col=i%cols,row=Math.floor(i/cols),
          x=col*cellWidth,y=row*cellHeight;
        ctx.fillStyle='#16253c';ctx.fillRect(x,y,cellWidth,header);
        ctx.fillStyle='#fff';ctx.font='bold 15px Arial';
        ctx.fillText(item.id,x+12,y+22,cellWidth-24);
        const img=new Image();
        await new Promise(resolve=>{
          img.onload=resolve;img.onerror=resolve;
          img.src='data:image/png;base64,'+item.data;
        });
        if(img.width&&img.height){
          const maxWidth=cellWidth-8,maxHeight=cellHeight-header-8,
            ratio=Math.min(maxWidth/img.width,maxHeight/img.height),
            drawWidth=img.width*ratio,drawHeight=img.height*ratio;
          ctx.fillStyle='#fff';ctx.fillRect(x+4,y+header+4,maxWidth,maxHeight);
          ctx.drawImage(img,x+4+(maxWidth-drawWidth)/2,
            y+header+4,drawWidth,drawHeight);
        }
      }
      return canvas.toDataURL('image/jpeg',.49).split(',')[1];
    },{items,cols,cellWidth,cellHeight,header});
    const file='contact-'+kind+'.jpg';
    fs.writeFileSync(path.join(VesaPremiumVisualBaseline.OUTPUT,file),Buffer.from(base64,'base64'));
    console.log('CONTACT_'+kind+'_BEGIN');
    // CI log chunking allows a reviewer to reconstruct a compact contact sheet.
    for(let i=0;i<base64.length;i+=30000)
      console.log('CONTACT_'+kind+'_PART:'+base64.slice(i,i+30000));
    console.log('CONTACT_'+kind+'_END');
    await sheet.close();
  }
  async run(){
    fs.mkdirSync(VesaPremiumVisualBaseline.OUTPUT,{recursive:true});
    const server=this.server();
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base='http://127.0.0.1:'+server.address().port;
    const browser=await chromium.launch({
      executablePath:process.env.CHROMIUM_PATH||undefined,
      headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']
    });
    try{
      for(const viewport of VesaPremiumVisualBaseline.VIEWPORTS){
        for(const entry of VesaPremiumVisualBaseline.PAGES){
          const result=await this.capture(browser,base,entry,viewport,{
            positions:['top','middle','bottom'],contact:true
          });
          console.log('BASELINE '+entry.id+' '+viewport.id+' '+result.shotCount+
            ' screenshots, DOM '+(result.dom.domElements??'?')+
            ', status '+result.httpStatus+', errors '+result.pageErrors.length);
        }
        await this.contactSheet(browser,viewport.id,this.contactItems[viewport.id]);
      }
      // Additional edge viewport previews do not multiply every heavy route.
      for(const viewport of VesaPremiumVisualBaseline.EXTRAS){
        for(const entry of VesaPremiumVisualBaseline.PAGES.filter(x=>
          ['login','app-centre','aql','ppm','tna'].includes(x.id)
        )){
          await this.capture(browser,base,entry,viewport,{positions:['top']});
        }
      }
      const expected=VesaPremiumVisualBaseline.PAGES.length*2*3+5*3;
      const total=this.results.reduce((sum,x)=>sum+x.shotCount,0);
      const manifest={
        title:'VESA 360 premium design baseline, NOT acceptance',
        scope:'Login and authenticated workspaces only: public home excluded',
        expectedScreenshots:expected,actualScreenshots:total,
        sourceSha:process.env.GITHUB_SHA||'local',
        generatedAt:new Date().toISOString(),
        humanScreenshotReview:'NOT YET REVIEWED',
        limitations:[
          'Initial and scroll screenshot positions; full action/form/report states still need dedicated journey captures',
          'Chromium lab results are not physical iOS/Android or field Core Web Vitals',
          'No claim that all visibly present features were clicked or approved',
          'Synthetic browser local session; no real credential or private record'
        ],
        cases:this.results,failures:this.failures
      };
      fs.writeFileSync(path.join(VesaPremiumVisualBaseline.OUTPUT,
        'manifest.json'),JSON.stringify(manifest,null,2));
      console.log('BASELINE_SUMMARY '+JSON.stringify({
        expected,actual:total,views:this.results.length,
        failedViews:this.failures.length,
        aql:this.results.filter(r=>r.id==='aql').map(r=>({
          viewport:r.viewport,dom:r.dom.domElements,fcpMs:r.dom.fcpMs,
          labLcpMs:r.dom.labLcpMs,longTaskTotalMs:r.dom.longTaskTotalMs,
          height:r.dom.documentHeight,errors:r.pageErrors.length
        }))
      }));
      if(total<expected||this.failures.length)
        throw Error('Baseline incomplete. Inspect manifest failures; no acceptance inferred.');
    }finally{
      await browser.close();
      await new Promise(resolve=>server.close(resolve));
    }
  }
}
new VesaPremiumVisualBaseline().run().catch(error=>{
  console.error('BASELINE_ERROR',error);
  process.exitCode=1;
});
