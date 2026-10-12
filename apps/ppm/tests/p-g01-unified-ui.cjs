/** One VESA PPM adapter proof: home and editor have one platform shell owner. */
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

async function inspect(page,width,view){
  await page.locator('.vesa-workspace').waitFor({state:'visible'});
  const evidence=await page.evaluate(()=>{
    const visible=element=>!!element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden'&&element.getClientRects().length>0;
    const topSelectors=['.vesa-workspace','.app-user-bar','.topbar','#fileMenu','.section-nav-wrap','.left-rail','.footer-bar','.ppm-update'];
    return {
      shellCount:document.querySelectorAll('.vesa-workspace').length,
      visibleChromeLogos:[...document.querySelectorAll('.vesa-workspace__brand img,.app-user-bar img,.topbar .brand img,#homeScreen>header img')].filter(visible).length,
      legacyAuthBars:document.querySelectorAll('.app-user-bar').length,
      homeHeaders:document.querySelectorAll('#homeScreen>header').length,
      topbarBrands:document.querySelectorAll('.topbar .brand').length,
      menus:[...document.querySelectorAll('[data-vesa-menu]')].map(node=>node.textContent.trim()),
      settings:document.querySelectorAll('[data-vesa-user]').length,
      admin:document.querySelectorAll('[data-vesa-admin]').length,
      logout:document.querySelectorAll('[data-vesa-logout]').length,
      saveStates:document.querySelectorAll('[data-vesa-saved]').length,
      legacySaveHidden:document.querySelector('#saveState')?.hidden,
      appCentre:document.querySelector('.vesa-workspace__app-centre')?.getAttribute('href'),
      currentApp:document.querySelector('.vesa-workspace__app-current')?.getAttribute('href'),
      shellTop:document.querySelector('.vesa-workspace')?.getBoundingClientRect().top,
      visibleTopOwners:topSelectors.flatMap(selector=>[...document.querySelectorAll(selector)].filter(visible).filter(element=>getComputedStyle(element).position==='sticky'||getComputedStyle(element).position==='fixed').map(element=>selector)),
      topbarTag:document.querySelector('.topbar')?.tagName,
      sectionPosition:getComputedStyle(document.querySelector('.section-nav-wrap')).position,
      railPosition:getComputedStyle(document.querySelector('.left-rail')).position,
      footerPosition:getComputedStyle(document.querySelector('.footer-bar')).position,
      updatePositions:[...document.querySelectorAll('.ppm-update')].map(node=>getComputedStyle(node).position),
      innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth
    };
  });
  const prefix=`${view} ${width}`;
  assert.equal(evidence.shellCount,1,`${prefix}: one shell DOM owner`);
  assert.equal(evidence.visibleChromeLogos,1,`${prefix}: one visible chrome logo`);
  assert.equal(evidence.legacyAuthBars,0,`${prefix}: no legacy auth bar`);
  assert.equal(evidence.homeHeaders,0,`${prefix}: no branded home header`);
  assert.equal(evidence.topbarBrands,0,`${prefix}: no editor brand duplicate`);
  assert.deepEqual(evidence.menus,menuOrder,`${prefix}: ordered universal menu`);
  assert.equal(evidence.settings,1,`${prefix}: one Settings entry`);
  assert.equal(evidence.admin,1,`${prefix}: one Admin entry`);
  assert.equal(evidence.logout,1,`${prefix}: one Logout entry`);
  assert.equal(evidence.saveStates,1,`${prefix}: one visible save owner`);
  assert.equal(evidence.legacySaveHidden,true,`${prefix}: compatibility save output is hidden`);
  assert.equal(evidence.appCentre,'/apps/',`${prefix}: App Centre breadcrumb`);
  assert.equal(evidence.currentApp,'/apps/ppm/',`${prefix}: current app breadcrumb`);
  assert.ok(Math.abs(evidence.shellTop)<=1,`${prefix}: shell is visible at the viewport top`);
  assert.deepEqual(evidence.visibleTopOwners,['.vesa-workspace'],`${prefix}: one fixed/sticky page owner`);
  assert.equal(evidence.topbarTag,'SECTION',`${prefix}: editor context is not a second header`);
  assert.equal(evidence.sectionPosition,'static',`${prefix}: section navigation flows with content`);
  assert.equal(evidence.railPosition,'static',`${prefix}: rail flows with content`);
  assert.equal(evidence.footerPosition,'static',`${prefix}: footer flows with content`);
  assert.ok(evidence.updatePositions.every(position=>position==='static'),`${prefix}: update notice flows with content`);
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
      await page.goto(`${base}/apps/ppm/`,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>typeof app!=='undefined'&&document.body.classList.contains('at-home'));
      await inspect(page,width,'home');
      if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-unified-ppm-home-${width}.png`)});

      await page.locator('#homeScreen [data-command="new"]').click();
      await page.waitForFunction(()=>!document.body.classList.contains('at-home'));
      await page.evaluate(async width=>{app.record.meta.style=`PPM-SHELL-${width}`;app.record.meta.factory='Unified Shell Factory';app.populateBindings();await app.save(true);},width);
      await page.waitForFunction(()=>document.querySelector('[data-vesa-saved]')?.textContent==='Saved on this device');
      await inspect(page,width,'editor');
      if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-unified-ppm-editor-${width}.png`)});

      if(width<=767){
        const trigger=page.locator('[data-vesa-mobile-menu]');
        assert.ok((await trigger.boundingBox()).height>=44,`${width}: Menu touch target`);
        await trigger.click();
        assert.equal(await page.locator('.vesa-workspace').getAttribute('data-menu-open'),'true',`${width}: Menu opens`);
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-mobile-menu]')),true,`${width}: Escape returns focus`);
      }

      if(width===390){
        const before=await page.evaluate(()=>JSON.stringify(app.record));
        await page.setViewportSize({width:1280,height:900});
        await page.locator('[data-vesa-user]').click();
        const settings=page.locator('[data-vesa-settings]');await settings.waitFor({state:'visible'});
        await settings.locator('[data-pref-language]').selectOption('bn');
        await settings.locator('[data-pref-theme]').selectOption('pure-mono');
        await settings.locator('footer button').click();
        assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-user]')),true,'Settings returns focus');
        assert.equal(await page.evaluate(()=>JSON.stringify(app.record)),before,'platform preferences preserve PPM record exactly');
      }

      if(width===1280){
        await page.locator('[data-vesa-menu="File"]').click();
        assert.equal(await page.locator('#modalBody').getByRole('button',{name:'Open Saved PPM'}).count(),1,'File callback opens PPM menu');
        await page.keyboard.press('Escape');
        const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
        assert.equal(await page.evaluate(()=>visualViewport.scale),2,'desktop page scale reaches 200%');
        assert.equal(await page.evaluate(()=>document.querySelectorAll('.vesa-workspace').length),1,'200% scale retains one shell owner');
        await page.screenshot({path:path.join(output,'vesa-unified-ppm-200-percent.png')});
        await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
      }

      assert.deepEqual(errors,[],`${width}: no uncaught page errors`);
      assert.deepEqual(external,[],`${width}: no external requests`);
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log('PPM unified shell passed: home/editor one-logo/header/account/menu ownership at 320/360/390/768/1024/1280/1440, 200% scale, mobile keyboard, preference record immutability, zero external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
