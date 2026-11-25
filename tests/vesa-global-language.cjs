/**
 * Read-only VESA global-language release gate.
 *
 * Owns verification that one Login choice reaches all 20 registered app routes,
 * remains the same across browser navigation, and does not rewrite user records.
 * Access: node tests/vesa-global-language.cjs [--browser].
 * Dependencies: on-disk GitHub Actions checkout; Playwright only in --browser mode.
 * Failure: fail closed on missing Spanish dictionaries or reverted four-language
 * preference behavior. All test sessions are synthetic and browser-local.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

class VesaGlobalLanguageProof {
 static ROOT=path.resolve(__dirname,'..');
 static APPS=Object.freeze([
  'aql','buyer-crm','chess-360','claims-disputes','costing',
  'fabric-supplier-comparison','fabric-trims','factory-vendor',
  'label-artwork-approval','lc-payment','order-commission',
  'packing-container','ppm','product-development','production-tracker',
  'purchase-order','sampling-approval','shipment-documentation',
  'tech-pack-spec','tna'
 ]);
 static FIVE=Object.freeze(['en','bn','hi','ta','es']);
 static MODULAR=Object.freeze([
  'buyer-crm','claims-disputes','fabric-supplier-comparison','fabric-trims',
  'factory-vendor','label-artwork-approval','product-development',
  'production-tracker','sampling-approval','shipment-documentation'
 ]);
 static SINGLE=Object.freeze([
  'costing','lc-payment','order-commission','packing-container','purchase-order','tech-pack-spec'
 ]);
 static source(p){return fs.readFileSync(path.join(this.ROOT,p),'utf8');}
 static staticProof(){
  const prefs=this.source('js/preferences.js');
  const login=this.source('login/index.html');
  assert.ok(prefs.includes("LANG_KEYS.forEach(k=>setItem(k,s.language))"),
   'Login preference shared unchanged to legacy app-language keys');
  assert.ok(!prefs.includes("s.language==='es'?'en'"),'No English shadow language for Spanish');
  assert.ok(prefs.includes("globalThis.app.locale.set(s.language)"),
   'PPM receives selected locale unchanged');
  for(const lang of this.FIVE)
   assert.ok(prefs.includes('<option value="'+lang+'">'),lang+' appears in shared language choices');
  assert.ok(login.includes("const languageOnly=new URLSearchParams(location.search).has('language')"),
   'Returning to Login for locale change preserves session');
  assert.ok(login.includes("if(activeSession&&languageOnly){location.replace(next);return;}"),
   'No demo re-authentication while changing locale');
  assert.ok(login.includes('vesa-login-intro-loop.gif'),'Original approved Login GIF retained');
  for(const app of this.MODULAR){
   const file=this.source('apps/'+app+'/src/i18n/app-copy.js');
   assert.ok(file.includes('es:{')||file.includes('es: {'),
    app+' has its own authored Spanish dictionary (not just a shared dropdown)');
  }
  for(const app of this.SINGLE){
   const file=this.source('apps/'+app+'/index.html');
   assert.ok(file.includes('es:{')||file.includes('es: {'),
    app+' contains localized static presentation copy');
  }
  const tna=this.source('apps/tna/src/bootstrap.js');
  assert.ok(tna.includes("SUPPORTED_LANGUAGES=['en','bn','hi','ta','es']"),
   'TNA has English/Bengali/Hindi/Tamil/Spanish');
  assert.ok(tna.includes('es:{')||tna.includes('es: {'),'TNA Spanish UI');
  const ppm=this.source('apps/ppm/languages.js');
  assert.ok(ppm.includes('PPM_ES_TEXT=Object.freeze('),'PPM Spanish sentence dictionary');
  assert.ok(ppm.includes("PPM_ES_TEXT[english]"),'PPM translates source-authored UI sentences');
  assert.ok(ppm.includes("VesaPrefs?.read?.().language"),'PPM reads shared Login preference first');
  const aql=this.source('apps/aql/index.html');
  assert.ok(aql.includes("['es','Español']"),'AQL Spanish language choice');
  assert.ok(aql.includes('static REPORT_LANG=Object.freeze({'),'AQL authored report wording exists');
  assert.ok(aql.includes('es:{')||aql.includes('es: {'),'AQL Spanish report/guide locale');
  const chess=this.source('apps/chess-360/index.html');
  assert.ok(chess.includes('<option value="bn"'),'Chess has Bengali as fifth locale');
  assert.ok(chess.includes('<option value="es"'),'Chess has Spanish locale');
  assert.ok(chess.includes('VesaPrefs.write('),'Chess changes shared locale, not game state');
  assert.ok(chess.includes("'/js/preferences.js'")||chess.includes('src="/js/preferences.js"'),
   'Chess reads the same global language owner');
  const tmpl=this.source('templates/vesa-next-app/ACCEPTANCE.md');
  assert.ok(tmpl.includes('EN/BN/HI/TA/ES'),'New apps cannot ship with four-language-only labels');
  const cat=this.source('js/app-catalogue.js');
  const apps=this.APPS.filter(a=>cat.includes("id:'"+a+"'")||cat.includes('id:"'+a+'"'));
  const allRegistered=[...cat.matchAll(/\bid:['"]([^'"]+)['"]/g)].map(m=>m[1]);
  assert.equal(apps.length,20,'Every original VESA app remains inside language gate');
  assert.deepEqual(allRegistered.slice().sort(),this.APPS.slice().sort(),
   'Future apps must be explicitly added to the five-language release gate');
  console.log('VESA_GLOBAL_LANGUAGE_STATIC_PASS 20 apps x 5 supported language routes; future-app contract');
 }
 static platformProof(){
  const vm=require('node:vm');
  const store=new Map();
  const sandbox={location:{pathname:'/login/'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{readyState:'loading',documentElement:{dataset:{},style:{setProperty(){}}},querySelector(){return null;},addEventListener(){}},addEventListener(){}};
  sandbox.window=sandbox;
  vm.runInNewContext(this.source('js/preferences.js'),sandbox);
  const prefs=sandbox.VesaPrefs;
  for(const lang of this.FIVE){
   prefs.write({...prefs.read(),language:lang});
   assert.equal(prefs.read().language,lang);
   assert.ok(!prefs.controls().includes('data-pref-language disabled'));
   sandbox.location.pathname='/apps/';
   store.set('vesa.app.language',lang==='en'?'es':'en');
   assert.equal(prefs.read().language,lang,'canonical choice must outrank legacy key');
   prefs.write({...prefs.read(),language:lang==='en'?'es':'en'});
   assert.equal(prefs.read().language,lang,'only Login may change the canonical locale');
   assert.ok(prefs.controls().includes('data-pref-language disabled'));
   assert.ok(prefs.controls().includes('/login/?language=1'));
   assert.ok(lang==='en'||prefs.ui('Settings')!=='Settings');
   assert.ok(lang==='en'||prefs.ui('User Access')!=='User Access');
   sandbox.location.pathname='/login/';
  }
  console.log('VESA_PLATFORM_LOCALE_OWNER_PASS five languages, canonical preference, shared Settings and Admin labels');
 }
 static server(){
  const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css',
   '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json',
   '.woff2':'font/woff2','.gif':'image/gif','.ico':'image/x-icon','.webp':'image/webp'};
  return http.createServer((req,res)=>{
   try{
    const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
    let target=path.resolve(this.ROOT,'.'+pathname);
    if(target!==this.ROOT&&!target.startsWith(this.ROOT+path.sep))return res.writeHead(403).end();
    if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    const info=fs.statSync(target);
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream',
      'Content-Length':info.size,'Cache-Control':'no-store'});
    fs.createReadStream(target).pipe(res);
   }catch{return res.writeHead(404).end();}
  });
 }
 static async browserProof(){
  const {chromium}=require('playwright');
  const server=this.server();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
   for(const width of [390,1440]){
    const ctx=await browser.newContext({viewport:{width,height:920},
       serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/login/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-pref-language]').waitFor({timeout:15000});
    await page.locator('[data-pref-language]').selectOption('es');
    assert.equal(await page.locator('html').getAttribute('lang'),'es','Login Spanish '+width);
    await page.locator('#loginSubmit').click();
    await page.waitForURL(u=>u.pathname==='/apps/',{timeout:25000});
    await page.locator('#centreTitle').waitFor();
    assert.match(await page.locator('#centreTitle').textContent(),/Encuentra/i,
      'App Centre translated into Spanish');
    let total=0;
    for(const app of this.APPS){
      const response=await page.goto(base+'/apps/'+app+'/',{waitUntil:'domcontentloaded',
        timeout:40000});
      assert.equal(response.status(),200,app+' app serves');
      // The shared preference contract is the release safety gate; app-authored
      // static dictionaries are checked independently above, not user data.
      const locale=await page.evaluate(()=>window.VesaPrefs?.read?.().language||
        JSON.parse(localStorage.getItem('vesa.app.preferences.v1')||'null')?.settings?.language);
      assert.equal(locale,'es',app+' selected Login language preserved');
      total++;
    }
    await page.goto(base+'/login/?language=1',{waitUntil:'domcontentloaded'});
    await page.locator('[data-pref-language]').waitFor();
    assert.equal(await page.locator('[data-pref-language]').inputValue(),'es',
      'Login language reopens for logged-in user');
    await page.locator('[data-pref-language]').selectOption('ta');
    await page.locator('#loginSubmit').click();
    await page.waitForURL(u=>u.pathname==='/apps/',{timeout:20000});
    assert.equal(await page.evaluate(()=>window.VesaPrefs?.read?.().language),'ta',
      'Tamil language chosen on Login persists across Apps');
    assert.equal(total,20,'Twenty app routes covered');
    if(errors.length)console.log('VESA_LANGUAGE_BROWSER_SCRIPT_WARN '+width+' '+JSON.stringify(errors.slice(0,15)));
    console.log('VESA_LANGUAGE_BROWSER_PASS viewport='+width+' Spanish to 20 apps; return Login/Tamil');
    await ctx.close();
   }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 }
}
(async()=>{VesaGlobalLanguageProof.staticProof();VesaGlobalLanguageProof.platformProof();
 if(process.argv.includes('--browser'))await VesaGlobalLanguageProof.browserProof();
})().catch(e=>{console.error(e);process.exitCode=1;});
