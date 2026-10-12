/** One VESA TNA adapter proof: exactly one platform shell owner at every required viewport. */
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

async function inspect(page,width){
  await page.locator('.vesa-workspace').waitFor({state:'visible'});
  const evidence=await page.evaluate(()=>{
    const visible=element=>!!element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden'&&element.getClientRects().length>0;
    const selectors=['.vesa-workspace','.app-user-bar','.tna-commandbar'];
    const topOwners=selectors.flatMap(selector=>[...document.querySelectorAll(selector)].filter(visible).map(element=>({selector,position:getComputedStyle(element).position})));
    return {
      shellCount:document.querySelectorAll('.vesa-workspace').length,
      visibleChromeLogos:[...document.querySelectorAll('.vesa-workspace__brand img,.app-user-bar img,.tna-commandbar img')].filter(visible).length,
      legacyAuthBars:document.querySelectorAll('.app-user-bar').length,
      legacyCommandBars:document.querySelectorAll('.tna-commandbar').length,
      menus:[...document.querySelectorAll('[data-vesa-menu]')].map(node=>node.textContent.trim()),
      settings:document.querySelectorAll('[data-vesa-user]').length,
      admin:document.querySelectorAll('[data-vesa-admin]').length,
      logout:document.querySelectorAll('[data-vesa-logout]').length,
      saveStates:document.querySelectorAll('[data-vesa-saved]').length,
      appCentre:document.querySelector('.vesa-workspace__app-centre')?.getAttribute('href'),
      currentApp:document.querySelector('.vesa-workspace__app-current')?.getAttribute('href'),
      topOwners,
      innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth
    };
  });
  assert.equal(evidence.shellCount,1,`${width}: one shared shell DOM owner`);
  assert.equal(evidence.visibleChromeLogos,1,`${width}: one visible VESA logo in application chrome`);
  assert.equal(evidence.legacyAuthBars,0,`${width}: no legacy authenticated bar`);
  assert.equal(evidence.legacyCommandBars,0,`${width}: no TNA universal command duplicate`);
  assert.deepEqual(evidence.menus,menuOrder,`${width}: one ordered universal menu system`);
  assert.equal(evidence.settings,1,`${width}: one Settings entry`);
  assert.equal(evidence.admin,1,`${width}: one authorized Admin entry`);
  assert.equal(evidence.logout,1,`${width}: one Logout entry`);
  assert.equal(evidence.saveStates,1,`${width}: one save-state owner`);
  assert.equal(evidence.appCentre,'/apps/',`${width}: App Centre breadcrumb`);
  assert.equal(evidence.currentApp,'/apps/tna/',`${width}: current-app breadcrumb`);
  assert.deepEqual(evidence.topOwners,[{selector:'.vesa-workspace',position:'sticky'}],`${width}: one visible sticky top-level owner`);
  assert.ok(evidence.documentWidth<=evidence.innerWidth+1&&evidence.bodyWidth<=evidence.innerWidth+1,`${width}: no horizontal page overflow`);

  if(width<=767){
    const trigger=page.locator('[data-vesa-mobile-menu]');
    assert.ok((await trigger.boundingBox()).height>=44,`${width}: Menu touch target`);
    await trigger.click();
    assert.equal(await page.locator('.vesa-workspace').getAttribute('data-menu-open'),'true',`${width}: Menu opens`);
    for(const selector of ['[data-vesa-user]','[data-vesa-admin]','[data-vesa-logout]'])await page.locator(selector).waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-mobile-menu]')),true,`${width}: Escape returns focus`);
  }
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
      await page.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
      await inspect(page,width);
      if(width===390||width===1280)await page.screenshot({path:path.join(output,`vesa-unified-tna-${width}.png`)});

      if(width===390){
        await page.evaluate(()=>{const plan=VesaTnaDomain.createPlan({templateId:'knit',buyerName:'Unified Shell Buyer',factoryName:'Unified Shell Factory',styleNo:'STYLE-SHELL',poNumber:'PO-SHELL',totalQty:100,buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'qa-vesaent-com'});VesaTnaStorage.savePlan(plan,'qa-vesaent-com');});
        const before=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
        await page.setViewportSize({width:1280,height:900});
        await page.locator('[data-vesa-user]').click();
        const settings=page.locator('[data-vesa-settings]');await settings.waitFor({state:'visible'});
        await settings.locator('[data-pref-language]').selectOption('bn');
        await settings.locator('[data-pref-theme]').selectOption('pure-mono');
        await settings.locator('footer button').click();
        assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-user]')),true,'Settings returns focus');
        assert.equal(await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com')),before,'language/theme changes preserve TNA records exactly');
      }

      if(width===1280){
        const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
        assert.equal(await page.evaluate(()=>visualViewport.scale),2,'desktop page scale reaches 200%');
        assert.equal(await page.evaluate(()=>document.querySelectorAll('.vesa-workspace').length),1,'200% scale retains one shell owner');
        await page.screenshot({path:path.join(output,'vesa-unified-tna-200-percent.png')});
        await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
      }

      assert.deepEqual(errors,[],`${width}: no uncaught page errors`);
      assert.deepEqual(external,[],`${width}: no external requests`);
      await context.close();
    }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log('TNA unified shell passed: exact one-logo/header/account/menu ownership at 320/360/390/768/1024/1280/1440, 200% scale, mobile keyboard, language/theme record immutability, zero external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
