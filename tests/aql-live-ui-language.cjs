/** Synthetic browser proof: real AQL home, language-only settings, and unsaved input. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
class AqlLiveLanguageProof{
 static ROOT=path.resolve(__dirname,'..');
 static server(){return http.createServer((req,res)=>{let file=path.join(this.ROOT,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.gif':'image/gif','.png':'image/png','.svg':'image/svg+xml'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});}
 static async run(){const server=this.server();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({headless:true});
 try{for(const width of [390,1440]){const ctx=await browser.newContext({viewport:{width,height:920},serviceWorkers:'block'});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/login/');await page.locator('[data-pref-language]').selectOption('en');await page.locator('#loginSubmit').click();await page.waitForURL(u=>u.pathname==='/apps/');await page.goto(base+'/apps/aql/');const heading=page.locator('[data-aql-ui="What are you inspecting today?"]');await heading.waitFor({timeout:30000});const settings=page.locator('[data-vesa-user]');if(!await settings.isVisible())await page.locator('[data-vesa-mobile-menu]').click();await settings.click();const dialog=page.locator('dialog[data-vesa-settings]');await dialog.waitFor();const choice=dialog.locator('[data-pref-language]');const before=await page.evaluate(()=>JSON.stringify(window.__vesaApp?.p||null));const theme=await page.evaluate(()=>VesaPrefs.read().theme);for(const [locale,expected] of [['en','What are you inspecting today?'],['bn','আজ কী পরিদর্শন করছেন?'],['hi','आज आप किसका निरीक्षण कर रहे हैं?'],['ta','இன்று எதை ஆய்வு செய்கிறீர்கள்?'],['es','¿Qué vas a inspeccionar hoy?']]){await choice.selectOption(locale);await page.waitForFunction(({text})=>document.querySelector('[data-aql-ui="What are you inspecting today?"]')?.textContent===text,{text:expected});assert.equal(await page.evaluate(()=>VesaPrefs.read().language),locale);assert.equal(await page.evaluate(()=>VesaPrefs.read().theme),theme);assert.equal(await page.evaluate(()=>JSON.stringify(window.__vesaApp?.p||null)),before);}
 await dialog.locator('footer button').click();
 assert.equal(await page.locator('[data-aql-ui="Start stage inspection"]').first().textContent(),'Iniciar inspección de etapa');
 assert.equal(await page.locator('[data-aql-ui="Inspect with confidence."]').first().textContent(),'Inspecciona con confianza.');
 await page.locator('[data-aql-ui="Start stage inspection"]').first().click();
 const input=page.locator('#dialogBody [name="buyer"]');await input.waitFor({timeout:12000});await input.fill('SYNTHETIC BUYER 123');await page.evaluate(()=>VesaPrefs.setLanguage('ta'));
 assert.equal(await input.inputValue(),'SYNTHETIC BUYER 123','unsaved form value preserved');
 assert.equal(await page.evaluate(()=>JSON.stringify(window.__vesaApp?.p||null)),before,'no inspection state change');
 console.log('AQL_RENDERED_LANGUAGE_PASS viewport='+width+' five languages, actual workspace and form value; errors='+JSON.stringify(errors.slice(0,5)));
 await ctx.close();}}
 finally{await browser.close();await new Promise(r=>server.close(r));}}
}
AqlLiveLanguageProof.run().catch(e=>{console.error(e);process.exitCode=1;});
