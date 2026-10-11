/** G11 read-only browser proof for login, App Centre, direct routes and return links. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../../..');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';

async function run(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const external=[],errors=[];
  try{
    const anonymous=await browser.newContext({viewport:{width:390,height:844}});
    const anonPage=await anonymous.newPage();
    anonPage.on('pageerror',error=>errors.push(`anonymous: ${error.message}`));
    anonPage.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
    await anonPage.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await anonPage.waitForURL(url=>url.pathname==='/login/'&&url.searchParams.get('next')==='/apps/tna/');
    const loginText=await anonPage.locator('body').innerText();
    assert.match(loginText,/APP CENTRE/i,'anonymous TNA entry must show the App Centre login context.');
    assert.match(loginText,/Login/i,'anonymous TNA entry must reach the visible login page.');
    await anonymous.close();

    const context=await browser.newContext({viewport:{width:1280,height:800}});
    await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(`authenticated: ${error.message}`));
    page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
    await page.goto(`${base}/apps/`,{waitUntil:'domcontentloaded'});
    const routes=await page.locator('#appCatalogue a').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname).sort());
    assert.deepEqual(routes,['/apps/aql/','/apps/ppm/','/apps/tna/'],'App Centre must expose exactly the registered AQL, PPM and TNA routes.');

    for(const route of routes){
      await page.goto(`${base}${route}`,{waitUntil:'domcontentloaded',timeout:120000});
      if(route==='/apps/aql/'){
        const enter=page.locator('#vesa-enter');
        if(await enter.count())await enter.click();
      }
      await page.locator('.vesa-workspace').waitFor({state:'visible',timeout:120000});
      assert.equal(await page.locator('.vesa-workspace__brand').getAttribute('href'),'/',`${route} must retain the VESA Home link.`);
      assert.equal(await page.locator('.vesa-workspace__app').getAttribute('href'),route,`${route} must retain its app breadcrumb link.`);
      assert.equal(await page.locator('.app-user-bar a[href="/apps/"]').getAttribute('href'),'/apps/',`${route} must retain the App Centre return link.`);
    }
    await page.locator('.app-user-bar a[href="/apps/"]').click();
    await page.waitForURL(url=>url.pathname==='/apps/');
    assert.equal(await page.locator('#appCatalogue .app-tile').count(),3,'the in-app App Centre link must return to all three registered apps.');
    assert.deepEqual(errors,[],'route regression must have no uncaught page errors');
    assert.deepEqual(external,[],'route regression must make no external requests');
    console.log('TNA G11 route regression passed: anonymous login return, App Centre AQL/PPM/TNA cards, direct routes, Home/App Centre links, zero external requests/page errors');
    await context.close();
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
