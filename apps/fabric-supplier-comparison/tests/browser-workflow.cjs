/* APP-12 real Chromium synthetic sourced quote/landed/local copy and VESA shell proof. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({
  email:'synthetic-supplier@vesaent.com',name:'SYNTHETIC SUPPLIER',role:'admin',
  userKey:'synthetic-supplier-vesaent-com',loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',x=>errors.push(x.message));
 page.on('request',x=>{if(!x.url().startsWith(base))external.push(x.url());});
 const act=async key=>page.locator('[data-action="'+key+'"]').first().click();
 const fill=async obj=>{for(const [k,v] of Object.entries(obj)){
  const el=page.locator('#fsDialog [name="'+k+'"]');
  if(!await el.count())throw Error('Missing source form field '+k);
  if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(v));else await el.fill(String(v));
 }};
 const submit=async()=>{await page.locator('#fsDialog form button[type=submit]').click();
  await page.locator('#fsDialog[open]').waitFor({state:'hidden',timeout:12000});};
 const records=()=>page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('vesa.fabric-supplier-comparison.records.v1.'));
  return key?JSON.parse(localStorage.getItem(key)).records:[];});
 try{
  fs.mkdirSync(out,{recursive:true});
  await page.goto(base+'/apps/fabric-supplier-comparison/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="new"]').waitFor({timeout:14000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'Only shared VESA header');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'Global Home/File/Edit/View/Tools/Help');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/);
  await act('new');await fill({
   article:'SYN COTTON PIQUE',composition:'SYN 100% COTTON',gsm:'210',width:'68',
   widthUnit:'in',construction:'PIQUE KNIT',shrinkageBasis:'SYN AFTER WASH TEST',
   shrinkage:'4',sourceRef:'SYN TECHPACK SPEC',reviewedBy:'SYN QA REVIEWER',reviewDate:'2026-10-17',
   requestedTradeTerm:'FOB',requestedDeliveryTerm:'SYN DELIVERY POINT'
  });await submit();
  assert.equal((await records()).length,1);assert.match((await records())[0].status,/NO SUPPLIER APPROVAL/);
  const offerData={supplier:'SYN SUPPLIER A',quoteRef:'SYN QUOTE A',quoteDate:'2026-10-16',validTo:'2026-11-30',
   article:'SYN COTTON PIQUE',composition:'SYN 100% COTTON',gsm:'210',width:'68',
   widthUnit:'in',construction:'PIQUE KNIT',shrinkageBasis:'SYN AFTER WASH TEST',shrinkage:'4',
   unitPrice:'1.2000',currency:'USD',unit:'yd',moq:'1000',moqUnit:'yd',leadDays:'30',
   tradeTerm:'FOB',origin:'SYN PLACE',deliveryTerm:'SYN DELIVERY POINT',
   specSourceRef:'SYN ORIGINAL SPEC',qualitySourceRef:'SYN LAB REVIEW',
   qualityEquivalence:'locally-reviewed-equivalent',qualityReviewedBy:'SYN QC MERCHANDISER',
   qualityReviewDate:'2026-10-17',sourceRef:'SYN SIGNED QUOTE'};
  await act('add-offer');await fill(offerData);await submit();
  assert.equal((await records())[0].offers.length,1);
  const offer1=(await records())[0].offers[0].id;
  await act('add-offer');await fill({...offerData,supplier:'SYN CHEAP DIFFERENT GSM',quoteRef:'SYN QUOTE B',
    gsm:'180',unitPrice:'0.5000',sourceRef:'SYN SECOND QUOTE'});await submit();
  assert.equal((await records())[0].offers.length,2);
  await act('matrix');
  assert.match(await page.locator('.fs-table').first().innerText(),/NOT COMPARABLE/);
  assert.match(await page.locator('.fs-table').first().innerText(),/MISMATCH: gsm/);
  await act('scenarios');await act('add-scenario');
  const fees={};for(const [k,v]of [['freight','0.2000'],['duty','0.1000'],['tax','0.0500'],['lc','0.0500']]){
   fees[k+'State']='amount';fees[k+'Amount']=v;fees[k+'SourceRef']='SYN '+k+' COST PROOF';
   fees[k+'ReviewedBy']='SYN FINANCE';fees[k+'ReviewDate']='2026-10-17';
  }
  await fill({offerId:offer1,asOfDate:'2026-10-17',targetUnit:'yd',targetCurrency:'USD',
   rounding:'half-up-4',sourceRef:'SYN CHARGE BASIS',reviewedBy:'SYN FINANCE',
   reviewDate:'2026-10-17',...fees});await submit();
  assert.equal((await records())[0].scenarios.length,1);
  assert.match(await page.locator('.fs-table').innerText(),/1\.6000/);
  await act('add-scenario');await fill({offerId:offer1,asOfDate:'2026-10-17',
   targetUnit:'yd',targetCurrency:'USD',rounding:'half-up-4',
   sourceRef:'SYN INCOMPLETE TRANSPORT',reviewedBy:'SYN FINANCE',
   reviewDate:'2026-10-17'});await submit();
  assert.equal((await records())[0].scenarios.length,2);
  assert.match(await page.locator('.fs-table').innerText(),/NEEDS INFORMATION/);
  await act('decisions');await act('add-decision');await fill({offerId:offer1,
   state:'internally-preferred-for-review',reviewer:'SYN SOURCING',
   reviewDate:'2026-10-17',sourceRef:'SYN REVIEW NOTE'});await submit();
  assert.match((await records())[0].status,/NO SUPPLIER APPROVAL/);
  assert.equal((await records())[0].decisions.length,1);
  // M3 user-selected local Tech Pack source, no reads of sibling app private storage.
  const fabricSpec=(await records())[0].requirement;
  const ref={sourceApp:'VESA Tech Pack & Spec 360',recordType:'TechPackSpecSnapshot',
   recordId:'SYN-TECH-SOURCE-1',revisionId:'REV-A',sourceDate:'2026-10-16',
   verifiedBy:'SYN TECH REVIEWER',verifiedAt:'2026-10-17T08:00:00Z',
   displaySnapshot:{fabricSpec,sourceOnly:true}};
  const refPath=path.join(out,'supplier-app12-reviewed-tech.json');
  fs.writeFileSync(refPath,JSON.stringify(ref));
  await act('references');await act('reference-select');await fill({refKind:'tech'});await submit();
  await page.locator('#fsReferenceFile').setInputFiles(refPath);
  await page.locator('#fsDialog[open]').waitFor();
  await fill({localReviewer:'SYN INDEPENDENT REVIEWER',localReviewDate:'2026-10-17'});
  await page.locator('#fsDialog [name="identityConfirmed"]').check();await submit();
  assert.equal((await records())[0].manualReferences.length,1);
  assert.match(await page.locator('.fs-table').innerText(),/SYN-TECH-SOURCE-1/);
  const wrongPath=path.join(out,'supplier-app12-wrong-tech.json');
  fs.writeFileSync(wrongPath,JSON.stringify({...ref,recordId:'SYN-WRONG',
   displaySnapshot:{fabricSpec:{...fabricSpec,gsm:'180'}}}));
  const safeBefore=JSON.stringify(await records());
  await act('reference-select');await fill({refKind:'tech'});await submit();
  await page.locator('#fsReferenceFile').setInputFiles(wrongPath);
  await page.locator('#fsDialog[open]').waitFor();
  assert.match(await page.locator('#fsDialogBody').innerText(),/Source type or exact fabric article\/GSM\/width\/composition does not match/);
  await page.locator('#fsDialogClose').click();
  assert.equal(JSON.stringify(await records()),safeBefore,'Wrong-source fabric cannot change saved comparison');
  const old=JSON.stringify((await records())[0]);await act('save');
  await page.reload({waitUntil:'domcontentloaded'});await act('continue');
  assert.equal(JSON.stringify((await records())[0]),old,'Reload must preserve source values');
  const dl=page.waitForEvent('download');await act('download');const file=await dl;
  const savedPath=path.join(out,'supplier-app12-synthetic.vesasup');await file.saveAs(savedPath);
  const backup=JSON.parse(fs.readFileSync(savedPath,'utf8'));
  assert.equal(backup.format,'VESA-FABRIC-SUPPLIER-COPY-1');
  await act('home');await act('upload');await page.locator('#fsCopyFile').setInputFiles(savedPath);
  await page.locator('#fsDialog[open]').waitFor();await page.locator('#fsDialogClose').click();
  assert.equal((await records()).length,2,'Restored source must be separate saved copy');
  const corrupt=path.join(out,'supplier-app12-corrupt.vesasup');
  fs.writeFileSync(corrupt,fs.readFileSync(savedPath,'utf8').replace('SYN COTTON PIQUE','FORGED FABRIC'));
  const before=JSON.stringify(await records());
  await page.locator('#fsCopyFile').setInputFiles(corrupt);
  await page.locator('#fsDialog[open]').waitFor();
  assert.match(await page.locator('#fsDialogBody').innerText(),/altered\/unsupported/);
  await page.locator('#fsDialogClose').click();
  assert.equal(JSON.stringify(await records()),before,'Tampered saved copy cannot alter records');
  await act('matrix');assert.match(await page.locator('.fs-table').last().innerText(),/1\.6000/);
  await act('history');assert.match(await page.locator('.fs-table').innerText(),/Locally sourced offer/);
  await act('reports');
  const reportText=await page.locator('.fs-report').innerText();
  assert.match(reportText,/DRAFT \/ SOURCE REVIEW ONLY/);
  assert.match(reportText,/SYN-TECH-SOURCE-1/);
  assert.match(reportText,/NOT COMPARABLE/);
  assert.match(reportText,/1\.6000/);
  assert.match(reportText,/No automatic|NOT supplier certification|NOT SUPPLIER APPROVAL/i);
  const xlPromise=page.waitForEvent('download');await act('excel');const xl=await xlPromise;
  const xlPath=path.join(out,'supplier-app12-comparison.xlsx');await xl.saveAs(xlPath);
  assert.equal(fs.readFileSync(xlPath).subarray(0,2).toString(),'PK','Real Excel workbook requires ZIP format');
  assert(fs.statSync(xlPath).size>2500);
  const pdf=await page.pdf({printBackground:true,format:'A4',landscape:true});
  assert(pdf.subarray(0,4).toString()==='%PDF'&&pdf.length>6500);
  fs.writeFileSync(path.join(out,'supplier-app12-workspace-draft.pdf'),pdf);
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:880});
   const sw=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(sw<=width+1,width+'px supplier page horizontal overflow '+sw);
   if([390,768,1280].includes(width))await page.screenshot({path:path.join(out,'supplier-app12-'+width+'.png')});
  }
  await page.setViewportSize({width:1280,height:900});
  const locales=[['en','Supplier Offers'],['bn','সাপ্লায়ার অফার'],['hi','सप्लायर ऑफर'],['ta','Supplier விலைகள்']];
  for(const [lang,label]of locales){
   const snapshot=JSON.stringify(await records());
   await page.locator('[data-vesa-user]').click();
   const prefs=page.locator('[data-vesa-settings]');await prefs.locator('[data-pref-language]').selectOption(lang);
   await page.waitForFunction(l=>document.documentElement.lang===l,lang);
   await page.keyboard.press('Escape');await prefs.waitFor({state:'hidden'});
   assert((await page.locator('.fs-tabs').innerText()).includes(label),'Missing source UI language '+lang);
   assert.equal(JSON.stringify(await records()),snapshot,'Changing language may not mutate source prices');
  }
  await act('home');await act('new');await page.locator('#fsDialog[open]').waitFor();
  await page.keyboard.press('Escape');await page.locator('#fsDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Escape restores opener focus');
  assert.deepEqual(errors,[],'No uncaught browser JS errors');
  assert.deepEqual(external,[],'No hidden remote network requests or supplier data uploads');
  console.log('FABRIC SUPPLIER M3 CHROMIUM PASS: sourced offers and GSM mismatch, explicit landed/missing charge, no automatic supplier, local Save/Open and corrupt isolation, four languages, mobile CSS, single shared VESA shell and no external requests.');
 }finally{await context.close();await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(err=>{console.error(err);process.exitCode=1;});
