/** Read-only VESA public SEO gate. App engines, sessions and intro are frozen. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
class VesaSeoGate {
 static root=path.resolve(__dirname,'..');
 static base='https://vesaent.com';
 static routes=['/','/about/','/apparel-sourcing/','/sourcing-bangladesh/','/sourcing-india/','/privacy.html','/terms.html'];
 static filename(route){return route==='/'?'index.html':route.endsWith('/')?route.slice(1)+'index.html':route.slice(1)}
 static read(route){return fs.readFileSync(path.join(this.root,this.filename(route)),'utf8')}
 static staticProof(){
  const html=this.read('/'),sitemap=fs.readFileSync(path.join(this.root,'sitemap.xml'),'utf8');
  assert.ok(html.includes('assets/vesa-intro-landscape.mp4?v=2')&&html.includes('assets/vesa-intro-portrait.mp4?v=2'),'original intro video retained');
  const homeSchema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org=homeSchema['@graph'].find(x=>x['@type']==='Organization');
  const site=homeSchema['@graph'].find(x=>x['@type']==='WebSite');
  assert.equal(org.alternateName,'VESA');assert.ok(site.alternateName.includes('VESA'));
  for(const route of this.routes){
   const page=this.read(route);
   assert.ok(page.includes('href="'+this.base+route+'"'),'canonical '+route);
   assert.ok(/<meta name="description" content="[^"]+"/.test(page),'description '+route);
   assert.equal((page.match(/<h1(?:\s|>)/g)||[]).length,1,'single H1 '+route);
   assert.ok(sitemap.includes('<loc>'+this.base+route+'</loc>'),'sitemap includes '+route);
  }
  assert.ok(!sitemap.includes('/apps/')&&!sitemap.includes('/login/'),'exclude app/login from sitemap');
  for(const route of this.routes.slice(1,5)){
   assert.ok(html.includes('href="'+route+'"'),'homepage link '+route);
   const page=this.read(route);
   assert.ok(page.includes('application/ld+json'),'structured data '+route);
   const data=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
   assert.ok(data['@graph'].some(x=>x['@type']==='BreadcrumbList'),'breadcrumbs '+route);
  }
  assert.ok(fs.readFileSync(path.join(this.root,'robots.txt'),'utf8').includes(this.base+'/sitemap.xml'),'robots sitemap matches canonical');
  const sw=fs.readFileSync(path.join(this.root,'service-worker.js'),'utf8');
  assert.ok(sw.includes('vesa-v117-rollback20-brand-seo'),'cache version bumped');
  assert.ok(sw.includes('ROLLBACK_DISCOVERY_PATHS'),'app routing preserved');
  console.log('SEO_STATIC_PASS 7 canonical routes, 4 landing pages, brand schema, sitemap, intro and cache');
 }
 static server(){return http.createServer((req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://local').pathname);let f=path.resolve(this.root,'.'+p);if(f!==this.root&&!f.startsWith(this.root+path.sep))return res.writeHead(403).end();if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg'};res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(fs.readFileSync(f));}catch{res.writeHead(404).end()}})}
 static async browserProof(){const {chromium}=require('playwright'),server=this.server();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch();try{const base='http://127.0.0.1:'+server.address().port;for(const width of [320,390,768,1440]){const ctx=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',reducedMotion:'reduce'});for(const route of this.routes.slice(1,5)){const page=await ctx.newPage(),errors=[];page.on('pageerror',err=>errors.push(err.message));const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.site-header .brand img').count(),1);assert.ok(await page.locator('.site-header .brand img').evaluate(el=>el.complete&&el.naturalWidth>0),'logo loaded');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,route+' '+width+' overflow '+overflow);if(width<820){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false')}assert.deepEqual(errors,[]);await page.close()}await ctx.close()}console.log('SEO_BROWSER_PASS 4 routes across 320/390/768/1440 layouts')}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}}
}
(async()=>{VesaSeoGate.staticProof();if(process.argv.includes('--browser'))await VesaSeoGate.browserProof()})().catch(e=>{console.error(e);process.exitCode=1});
