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
const themes=['clear-blue','pure-mono','midnight-mono','forest-yellow','warm-ivory'];
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
  if(id==='apps'){
    const expected=['aql','ppm','tna','costing','packing-container','order-commission',
      'tech-pack-spec','purchase-order','lc-payment','sampling-approval','fabric-trims',
      'shipment-documentation','production-tracker','factory-vendor','label-artwork-approval',
      'buyer-crm','fabric-supplier-comparison','claims-disputes','product-development','chess-360','marker-lab','artwork-cad-studio','pdf-template-studio']
      .map(slug=>'/apps/'+slug+'/').sort();
    assert.deepEqual(await page.locator('#appCatalogue a[href^="/apps/"]')
      .evaluateAll(nodes=>nodes.map(x=>x.getAttribute('href')).sort()),
      expected,`${id}@${width}: all 23 routes retained without duplicate cards`);
    assert.equal(await page.locator('.app-tile').count(),23,'all 23 workspaces render');
    if(width>=1280){
      const view=await page.evaluate(()=>{
        const catalogue=document.getElementById('appCatalogue'),
          groups=[...catalogue.querySelectorAll('.app-group')],
          tiles=[...catalogue.querySelectorAll('.app-tile')],
          firstAction=tiles[0].querySelector('.app-tile-open');
        return {
          layout:getComputedStyle(catalogue).display,
          firstWidth:tiles[0].getBoundingClientRect().width,
          firstGroupBottom:groups[0].getBoundingClientRect().bottom,
          nextGroupTop:groups[1].getBoundingClientRect().top,
          actionHeight:firstAction.getBoundingClientRect().height,
          actions:[...catalogue.querySelectorAll('.app-tile-open span:first-child')].map(x=>x.textContent.trim()),
          homepageCss:[...document.querySelectorAll('link[rel=stylesheet]')].some(x=>x.href.includes('/css/style.css'))
        };
      });
      assert.equal(view.layout,'block','desktop category sections must stack full width');
      assert.ok(view.firstWidth>=280,'desktop app card must not be compressed: '+view.firstWidth);
      assert.ok(view.nextGroupTop>=view.firstGroupBottom,'desktop groups must not share a row');
      assert.ok(view.actionHeight>=44,'desktop app action remains clickable');
      assert.equal(view.homepageCss,false,'App Centre must not inherit public website CSS');
      assert.ok(view.actions.every(x=>x.startsWith('Open ')),'desktop app actions use one readable label');
    }
    assert.equal(await page.locator('#appCatalogue h3').evaluateAll(nodes=>
      nodes.every(n=>!/^VESA\s/i.test(n.textContent.trim()))),true,
      'one logo in header; no repeated VESA prefix on visible card names');
    await page.locator('#appSearch').fill('claims-disputes');
    assert.equal(await page.locator('.app-tile').count(),1,'app search finds exact route');
    assert.equal(await page.locator('[data-app-id="claims-disputes"]').count(),1,'claim app discovered');
    await page.locator('#appSearch').fill('not-a-real-vesa-app-123');
    assert.equal(await page.locator('.app-tile').count(),0,'no false search matches');
    await page.locator('#appClear').click();
    assert.equal(await page.locator('.app-tile').count(),23,'clear restores the catalogue');
    await page.locator('[data-app-group="orders"]').click();
    assert.equal(await page.locator('.app-tile').count(),4,'orders group has four apps');
    assert.equal(await page.locator('[data-app-group="orders"]').getAttribute('aria-pressed'),'true','active filter announced');
    await page.locator('[data-app-group="all"]').click();
    assert.equal(await page.locator('.app-tile').count(),23,'all group restores all apps');
  }
  if(id==='admin'){
    assert.equal(await page.locator('.admin-grid').count(),1,'admin content retained');
    assert.equal(await page.locator('.admin-panel').count(),3,'three usable panels');
    assert.equal(await page.locator('#userForm input').count(),3,'all existing form inputs remain');
    assert.equal(await page.locator('#userForm select').count(),1,'role selector remains');
    assert.equal(await page.locator('#downloadEvents').count(),1,'history export remains');
    const design=await page.evaluate(()=>{
      const grid=document.querySelector('.admin-grid');
      const card=document.querySelector('.admin-panel');
      return {
        columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        css:[...document.querySelectorAll('link[rel=stylesheet]')].map(x=>x.getAttribute('href')),
        actionHeight:document.querySelector('#userForm button[type=submit]').getBoundingClientRect().height,
        cardWidth:card.getBoundingClientRect().width
      };
    });
    assert.equal(design.css.some(x=>x.includes('/css/style.css')),false,'admin cannot load homepage CSS');
    assert.equal(design.columns,width>920?2:1,'desktop and mobile use intentional panel grids');
    assert.ok(design.actionHeight>=44,'admin create action is touch accessible');
    assert.ok(design.cardWidth>=Math.min(260,width-48),'admin form is readable width');
  }
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
    if(id==='apps'){
      assert.equal(await page.locator('#appSearch').getAttribute('placeholder'),'অ্যাপ, কাজ বা রিপোর্ট খুঁজুন…','Bengali search text follows Settings');
      assert.equal(await page.locator('.app-tile').count(),23,'language change retains all apps');
    }
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

function luminance(hex){
  const channels=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255).map(value=>value<=.03928?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
}

function contrast(a,b){
  const first=luminance(a),second=luminance(b);
  return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);
}

function contrastCss(a,b){
  const light=value=>{
    const channels=(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number).map(channel=>channel/255).map(channel=>channel<=.03928?channel/12.92:((channel+.055)/1.055)**2.4);
    assert.equal(channels.length,3,`unsupported computed color: ${value}`);
    return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
  };
  const first=light(a),second=light(b);
  return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);
}

function rgb(hex){
  return `rgb(${[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)).join(', ')})`;
}

async function themeProbe(browser,base,theme,route,id,authenticated){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(({theme,session,store,authenticated})=>{
    localStorage.setItem('vesa.app.preferences.v1',JSON.stringify({version:1,settings:{theme,language:'en',density:'comfortable',font:'modern'},updatedAt:'2026-10-12T00:00:00.000Z'}));
    localStorage.setItem('vesa360-personal-appearance-v1',JSON.stringify({version:1,settings:{theme,followDevice:false,font:'modern',text:'standard',density:'comfortable',layout:'guided',striping:true,stickyColumns:true,motion:'system',reportStyle:'classic',reportFont:'classic',reportSize:'standard',reportSpacing:'comfortable',reportAccent:'blue'}}));
    if(authenticated){localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify(store));}
  },{theme,session,store,authenticated});
  const page=await context.newPage();const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  await page.goto(`${base}${route}`,{waitUntil:'domcontentloaded'});
  const evidence=await page.evaluate(({id})=>{
    const root=getComputedStyle(document.documentElement);
    const card=document.querySelector(id==='login'?'.auth-card':id==='apps'?'.app-tile':'.admin-panel');
    const shell=document.querySelector('.vesa-workspace');
    const visible=node=>{const style=getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length};
    const controls=[...document.querySelectorAll('.app-centre-page :is(button,.btn,.input,select)')].filter(visible).map(node=>node.getBoundingClientRect().height);
    return {
      theme:document.documentElement.dataset.vesaTheme,
      tokens:{canvas:root.getPropertyValue('--canvas').trim(),paper:root.getPropertyValue('--paper').trim(),ink:root.getPropertyValue('--ink').trim(),muted:root.getPropertyValue('--muted').trim()},
      bodyFont:getComputedStyle(document.body).fontFamily,
      sharedFont:root.getPropertyValue('--ui').trim().replaceAll('"',''),
      cardBackground:getComputedStyle(card).backgroundColor,
      cardRadius:getComputedStyle(card).borderRadius,
      shellColor:shell?getComputedStyle(shell).color:null,
      shellLogoFilter:shell?getComputedStyle(shell.querySelector('.vesa-workspace__brand img')).filter:null,
      cardColor:getComputedStyle(card).color,
      primary:[...document.querySelectorAll(id==='apps'?'.app-tile-open':'.btn.primary')].filter(visible).slice(0,1).map(node=>({color:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor}))[0],
      minControlHeight:Math.min(...controls),
      documentWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth
    };
  },{id});
  assert.equal(evidence.theme,theme,`${id}/${theme}: selected theme applied`);
  assert.ok(contrast(evidence.tokens.ink,evidence.tokens.paper)>=4.5,`${id}/${theme}: primary text contrast`);
  assert.ok(contrast(evidence.tokens.muted,evidence.tokens.paper)>=4.5,`${id}/${theme}: muted text contrast`);
  assert.match(evidence.bodyFont,/Segoe UI/i,`${id}/${theme}: shared body typography`);
  assert.equal(evidence.cardBackground,rgb(evidence.tokens.paper),`${id}/${theme}: card uses shared surface token`);
  assert.equal(evidence.cardColor,rgb(evidence.tokens.ink),`${id}/${theme}: card uses shared text token`);
  if(authenticated)assert.equal(evidence.shellColor,rgb(evidence.tokens.ink),`${id}/${theme}: shell uses shared text token`);
  if(authenticated&&['midnight-mono','forest-yellow'].includes(theme))assert.notEqual(evidence.shellLogoFilter,'none',`${id}/${theme}: dark shell logo remains visible`);
  assert.ok(evidence.primary,`${id}/${theme}: visible primary action exists`);
  assert.ok(contrastCss(evidence.primary.color,evidence.primary.background)>=4.5,`${id}/${theme}: primary action contrast`);
  assert.equal(evidence.cardRadius,'14px',`${id}/${theme}: shared card radius`);
  assert.ok(evidence.minControlHeight>=44,`${id}/${theme}: visible controls meet 44px target`);
  assert.ok(evidence.documentWidth<=1281&&evidence.bodyWidth<=1281,`${id}/${theme}: no horizontal overflow`);
  assert.deepEqual(errors,[],`${id}/${theme}: no page errors`);assert.deepEqual(external,[],`${id}/${theme}: no external requests`);
  if(theme==='midnight-mono')await page.screenshot({path:path.join(output,`vesa-platform-${id}-midnight-mono.png`),fullPage:true});
  await context.close();
}

async function run(){
  fs.mkdirSync(output,{recursive:true});const web=server();await new Promise(resolve=>web.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${web.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  try{
    for(const width of widths){await loginProbe(browser,base,width);await authenticatedProbe(browser,base,width,'/apps/','apps');await authenticatedProbe(browser,base,width,'/admin/','admin');}
    await zoomProbe(browser,base);
    for(const theme of themes){await themeProbe(browser,base,theme,'/login/','login',false);await themeProbe(browser,base,theme,'/apps/','apps',true);await themeProbe(browser,base,theme,'/admin/','admin',true);}
  }
  finally{await browser.close();await new Promise(resolve=>web.close(resolve));}
  console.log('VESA platform pages passed: Login/App Centre/Admin one-brand ownership at 320/360/390/768/1024/1280/1440, 200% scale, all five themes, shared tokens/44px controls, mobile keyboard, Settings immutability, zero external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
