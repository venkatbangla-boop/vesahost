/** F44 browser proof for localized plain-language help, recovery guidance and record immutability. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../../..');
const output=path.join(root,'output','playwright');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const cases=[
  {language:'en',labels:['How to Use','Glossary','Example','About','Data & Backup Help']},
  {language:'bn',labels:['কীভাবে ব্যবহার করবেন','শব্দের অর্থ','উদাহরণ','এই app সম্পর্কে','Data ও backup সহায়তা']},
  {language:'hi',labels:['कैसे उपयोग करें','शब्दों का अर्थ','उदाहरण','इस app के बारे में','Data और backup सहायता']},
  {language:'ta',labels:['எப்படி பயன்படுத்துவது','சொற்களின் பொருள்','உதாரணம்','இந்த app பற்றி','Data மற்றும் backup உதவி']}
];
const topicIds=['how','glossary','example','about','backup'];
const forbidden=/\b(?:JSON|CSV|IndexedDB|schema|checkpoint|stack trace|G\d{2}|test id)\b/i;
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';

async function openShellMenu(page,name){
  const mobile=page.locator('[data-vesa-mobile-menu]'),menu=page.locator(`[data-vesa-menu="${name}"]`);
  if(!await menu.isVisible())await mobile.click();
  await menu.waitFor({state:'visible'});await menu.click();
}
async function setLanguage(page,language){
  await page.setViewportSize({width:1280,height:900});
  await page.locator('[data-vesa-user]').click();
  const settings=page.locator('[data-vesa-settings]');await settings.waitFor({state:'visible'});
  await settings.locator('[data-pref-language]').selectOption(language);
  await page.waitForFunction(value=>document.documentElement.lang===value,language);
  await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
}

async function run(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  try{
    await page.goto(`${base}/apps/tna/`,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>{const plan=VesaTnaDomain.createPlan({templateId:'knit',buyerName:'Help Buyer',factoryName:'Help Factory',styleNo:'STYLE-F44',poNumber:'PO-F44',totalQty:500,buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'qa-vesaent-com'});VesaTnaStorage.savePlan(plan,'qa-vesaent-com');});
    const storedBefore=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));

    for(const item of cases){
      await setLanguage(page,item.language);
      await page.setViewportSize({width:390,height:844});
      await openShellMenu(page,'Help');
      const buttons=page.locator('#tnaDialogBody [data-menu-action^="help-"]');
      assert.deepEqual(await buttons.allTextContents(),item.labels,`${item.language}: all five help topics must be localized.`);
      assert.doesNotMatch(await page.locator('#tnaDialog').innerText(),forbidden,`${item.language}: help menu must avoid developer jargon.`);
      await page.keyboard.press('Escape');await page.locator('#tnaDialog').waitFor({state:'hidden'});
      assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-menu="Help"]')),true,`${item.language}: closing Help must return keyboard focus.`);

      for(const id of topicIds){
        await openShellMenu(page,'Help');
        await page.locator(`[data-menu-action="help-${id}"]`).click();
        const topic=page.locator(`[data-help-topic="${id}"]`);await topic.waitFor();
        const body=await topic.innerText();
        assert.ok(body.length>80,`${item.language}/${id}: help topic must contain useful guidance.`);
        assert.doesNotMatch(body,forbidden,`${item.language}/${id}: help topic must avoid developer jargon.`);
        if(id==='backup')assert.match(body,/Save TNA|save|Save|சேம|सहे|সংর|backup|Backup/i,`${item.language}: backup help must include a recovery action.`);
        const geometry=await page.evaluate(()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,dialog:document.getElementById('tnaDialog').scrollWidth,dialogClient:document.getElementById('tnaDialog').clientWidth}));
        assert.ok(geometry.doc<=geometry.inner+1&&geometry.body<=geometry.inner+1&&geometry.dialog<=geometry.dialogClient+1,`${item.language}/${id}: help must not overflow at 390px.`);
        if(item.language==='bn'&&id==='backup'){
          fs.mkdirSync(output,{recursive:true});
          await page.locator('#tnaDialog').screenshot({path:path.join(output,'tna-g11-f44-help-bengali-mobile.png')});
        }
        await page.keyboard.press('Escape');await page.locator('#tnaDialog').waitFor({state:'hidden'});
        assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-vesa-menu="Help"]')),true,`${item.language}/${id}: closing a topic must return keyboard focus.`);
      }
    }

    await setLanguage(page,'en');
    await openShellMenu(page,'File');
    assert.doesNotMatch(await page.locator('#tnaDialog').innerText(),forbidden,'File menu guidance must avoid developer jargon.');
    await page.locator('[data-menu-action="Open Saved Copy"]').click();
    assert.doesNotMatch(await page.locator('#tnaDialog').innerText(),forbidden,'Saved-copy recovery dialog must avoid developer jargon.');
    await page.keyboard.press('Escape');
    await openShellMenu(page,'File');await page.locator('[data-menu-action="Import Excel TNA"]').click();
    assert.doesNotMatch(await page.locator('#tnaDialog').innerText(),forbidden,'Import recovery dialog must avoid developer jargon.');
    await page.keyboard.press('Escape');

    const storedAfter=await page.evaluate(()=>localStorage.getItem('vesa.tna360.records.qa-vesaent-com'));
    assert.equal(storedAfter,storedBefore,'Reading help and changing presentation language must not mutate saved orders.');
    assert.deepEqual(errors,[],'F44 help flow must have no uncaught page errors.');
    assert.deepEqual(external,[],'F44 help flow must make no external requests.');
    console.log('TNA F44 help passed: 5 topics × EN/BN/HI/TA, recovery guidance, plain routine dialogs, immutable record, 390px, zero external requests/page errors');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
