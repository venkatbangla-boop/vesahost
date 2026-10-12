/** One VESA AQL adapter proof: entrance, home and inspection share one platform shell. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const widths=[320,360,390,768,1024,1280,1440];
const menuOrder=['Home','File','Edit','View','Tools','Help'];
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-12T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';

async function inspectShell(page,width,view){
  await page.locator('.vesa-workspace').waitFor({state:'visible'});
  const evidence=await page.evaluate(()=>{
    const visible=element=>!!element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden'&&element.getClientRects().length>0;
    const position=selector=>{const node=document.querySelector(selector);return node&&visible(node)?getComputedStyle(node).position:null;};
    return {
      shellCount:document.querySelectorAll('.vesa-workspace').length,
      visibleLogos:[...document.querySelectorAll('.vesa-workspace__brand img,.entry-logo,.brand-row img,.brand-mark,.app-user-bar img')].filter(visible).length,
      legacyAuthBars:document.querySelectorAll('.app-user-bar').length,
      menus:[...document.querySelectorAll('[data-vesa-menu]')].map(node=>node.textContent.trim()),
      settings:document.querySelectorAll('[data-vesa-user]').length,
      admin:document.querySelectorAll('[data-vesa-admin]').length,
      logout:document.querySelectorAll('[data-vesa-logout]').length,
      saveStates:document.querySelectorAll('[data-vesa-saved]').length,
      duplicateSettings:[...document.querySelectorAll('[data-action="settings"]')].filter(visible).length,
      appCentre:document.querySelector('.vesa-workspace__app-centre')?.getAttribute('href'),
      currentApp:document.querySelector('.vesa-workspace__app-current')?.getAttribute('href'),
      shellTop:document.querySelector('.vesa-workspace')?.getBoundingClientRect().top,
      topbarTag:document.querySelector('.topbar')?.tagName||null,
      legacySaveHidden:document.querySelector('#saveState')?.hidden??null,
      positions:{shell:position('.vesa-workspace'),topbar:position('.topbar'),sidebar:position('.sidebar'),mobileNav:position('.mobile-nav'),releaseMenu:position('#aqlReleaseMenu')},
      brandRows:document.querySelectorAll('.brand-row').length,
      entranceLogoVisible:visible(document.querySelector('.entry-logo')),
      entranceTopVisible:visible(document.querySelector('.entry-top')),
      floatingOwners:[...document.querySelectorAll('#m45-fab,#m46-fab,#m50-fab,.m45-floating')].filter(visible).length,
      innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth
    };
  });
  const prefix=`${view} ${width}`;
  assert.equal(evidence.shellCount,1,`${prefix}: one shell DOM owner`);
  assert.equal(evidence.visibleLogos,1,`${prefix}: one visible VESA logo`);
  assert.equal(evidence.legacyAuthBars,0,`${prefix}: no legacy auth bar`);
  assert.deepEqual(evidence.menus,menuOrder,`${prefix}: ordered universal menu`);
  assert.equal(evidence.settings,1,`${prefix}: one platform Settings entry`);
  assert.equal(evidence.admin,1,`${prefix}: one Admin entry`);
  assert.equal(evidence.logout,1,`${prefix}: one Logout entry`);
  assert.equal(evidence.saveStates,1,`${prefix}: one visible save owner`);
  assert.equal(evidence.duplicateSettings,0,`${prefix}: no visible AQL Settings duplicate`);
  assert.equal(evidence.appCentre,'/apps/',`${prefix}: App Centre breadcrumb`);
  assert.equal(evidence.currentApp,'/apps/aql/',`${prefix}: current app breadcrumb`);
  assert.ok(Math.abs(evidence.shellTop)<=1,`${prefix}: shell is visible at viewport top`);
  assert.equal(evidence.positions.shell,'sticky',`${prefix}: shared shell is the sticky owner`);
  assert.notEqual(evidence.positions.topbar,'sticky',`${prefix}: AQL context bar is not sticky`);
  assert.notEqual(evidence.positions.topbar,'fixed',`${prefix}: AQL context bar is not fixed`);
  assert.notEqual(evidence.positions.sidebar,'sticky',`${prefix}: workflow rail is not sticky`);
  assert.notEqual(evidence.positions.sidebar,'fixed',`${prefix}: workflow rail is not fixed`);
  assert.notEqual(evidence.positions.mobileNav,'sticky',`${prefix}: mobile workflow is not sticky`);
  assert.notEqual(evidence.positions.mobileNav,'fixed',`${prefix}: mobile workflow is not fixed`);
  assert.equal(evidence.floatingOwners,0,`${prefix}: duplicate fixed tool launchers are hidden`);
  assert.ok(evidence.documentWidth<=evidence.innerWidth+1&&evidence.bodyWidth<=evidence.innerWidth+1,`${prefix}: no horizontal page overflow`);
  return evidence;
}

async function run(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  fs.mkdirSync(output,{recursive:true});
  try{
    for(const width of widths){
      const context=await browser.newContext({viewport:{width,height:900}});
      await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
      const page=await context.newPage(),errors=[],external=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
      await page.goto(`${base}/apps/aql/`,{waitUntil:'domcontentloaded'});

      const entrance=await inspectShell(page,width,'entrance');
      assert.equal(entrance.entranceLogoVisible,false,`${width}: entrance logo duplicate is hidden`);
      assert.equal(entrance.entranceTopVisible,false,`${width}: entrance brand header duplicate is hidden`);
      if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-unified-aql-entrance-${width}.png`)});

      await page.locator('#vesa-enter').click();
      await page.waitForFunction(()=>!!window.__vesaApp&&!document.getElementById('app').hidden);
      const home=await inspectShell(page,width,'home');
      assert.equal(home.brandRows,0,`${width}: no internal AQL brand row`);
      assert.equal(home.topbarTag,'SECTION',`${width}: inspection context is not a second header`);
      assert.equal(home.legacySaveHidden,true,`${width}: compatibility save output is hidden`);
      if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-unified-aql-home-${width}.png`)});

      await page.locator('[data-action="demo-menu"]').first().click();
      await page.locator('[data-action="demo"][data-kind="apparel"]').click();
      await page.waitForFunction(()=>!!window.__vesaApp?.p&&window.__vesaApp.p.meta.demo===true);
      const before=await page.evaluate(()=>JSON.stringify(window.__vesaApp.p));
      await inspectShell(page,width,'inspection');
      if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-unified-aql-inspection-${width}.png`)});

      if(width<=767){
        const trigger=page.locator('[data-vesa-mobile-menu]');
        assert.ok((await trigger.boundingBox()).height>=44,`${width}: Menu touch target`);
        await trigger.click();
        assert.equal(await page.locator('.vesa-workspace').getAttribute('data-menu-open'),'true',`${width}: Menu opens`);
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-mobile-menu]')),true,`${width}: Escape returns focus`);
      }

      if(width===390){
        await page.setViewportSize({width:1280,height:900});
        await page.locator('[data-vesa-user]').click();
        const settings=page.locator('[data-vesa-settings]');await settings.waitFor({state:'visible'});
        await settings.locator('[data-pref-language]').selectOption('bn');
        await settings.locator('[data-pref-theme]').selectOption('pure-mono');
        await settings.locator('footer button').click();
        assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-user]')),true,'Settings returns focus');
        assert.equal(await page.evaluate(()=>JSON.stringify(window.__vesaApp.p)),before,'platform preferences preserve AQL inspection exactly');
      }

      if(width===1280){
        await page.locator('[data-vesa-menu="File"]').click();
        await page.locator('#dialog').waitFor({state:'visible'});
        assert.match(await page.locator('#dialogTitle').textContent(),/File/,'File callback opens AQL menu');
        await page.keyboard.press('Escape');
        const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
        assert.equal(await page.evaluate(()=>visualViewport.scale),2,'desktop page scale reaches 200%');
        assert.equal(await page.evaluate(()=>document.querySelectorAll('.vesa-workspace').length),1,'200% scale retains one shell owner');
        await page.screenshot({path:path.join(output,'vesa-unified-aql-200-percent.png')});
        await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
      }

      assert.deepEqual(errors,[],`${width}: no uncaught page errors`);
      assert.deepEqual(external,[],`${width}: no external requests`);
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log('AQL unified shell passed: entrance/home/inspection one-logo/header/account/menu ownership at 320/360/390/768/1024/1280/1440, 200% scale, mobile keyboard, preference record immutability, zero external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
