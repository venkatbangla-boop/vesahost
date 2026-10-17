/* APP-10 real Chromium. Synthetic local artwork/version/preview only, no external approvals. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output','playwright');
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify({email:'synthetic-artwork@vesaent.com',name:'SYNTHETIC ARTWORK',role:'admin',userKey:'synthetic-artwork-vesaent-com',loginAt:'2026-10-17T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'})));
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>{const url=req.url();if(!url.startsWith(base)&&!url.startsWith('blob:'+base+'/'))external.push(url);});
 const act=async name=>page.locator('[data-action="'+name+'"]').first().click();
 const fill=async data=>{for(const [key,value] of Object.entries(data)){
  const el=page.locator('#laDialog [name="'+key+'"]');if(!await el.count())throw Error('Artwork form missing '+key);
  if(await el.evaluate(x=>x.tagName==='SELECT'))await el.selectOption(String(value));else await el.fill(String(value));
 }};
 const submit=async()=>{await page.locator('#laDialog form button[type=submit]').click();await page.locator('#laDialog[open]').waitFor({state:'hidden',timeout:10000});};
 const records=()=>page.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('vesa.label-artwork-approval.records.v1.'));return k?JSON.parse(localStorage.getItem(k)).records:[];});
 try{
  fs.mkdirSync(out,{recursive:true});
  await page.goto(base+'/apps/label-artwork-approval/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="new"]').waitFor({timeout:12000});
  assert.equal(await page.locator('.vesa-workspace').count(),1,'One VESA shared shell');
  assert.equal(await page.locator('[data-vesa-menu]').count(),6,'Six global menus');
  assert.match(await page.locator('body').innerText(),/NON-COMMERCIAL PERSONAL DEMO/i);
  await act('new');await fill({style:'SYN-STYLE-01',colour:'Navy',size:'M',itemType:'care-label',placement:'left-neck seam',sourceRef:'SYN TECHPACK'});await submit();
  assert.equal((await records()).length,1);assert.equal((await records())[0].status,'DRAFT — SOURCE REVIEW ONLY');
  await act('add-revision');await fill({artworkRef:'SYN ARTWORK REV 1',sourceDate:'2026-10-17',sourceRef:'SYN FILE REGISTER',
   width:'4',height:'5',unit:'cm',dimensionSourceRef:'SYN LABEL POM',washCareText:'Synthetic wash care only',
   contentSourceRef:'SYN WASH CARE SOURCE',symbology:'ean-13',barcodeValue:'4006381333932',barcodeSourceRef:'SYN GTIN DOC'});await submit();
  assert.equal((await records())[0].revisions.length,1);
  assert.match(await page.locator('.la-table').innerText(),/Invalid supplied barcode check digit/);
  assert.match(await page.locator('body').innerText(),/NOT independently verified|GS1 ownership|label validation/i);
  const firstId=(await records())[0].revisions[0].id;
  await act('reviews');await act('add-comment');await fill({revisionId:firstId,reviewer:'SYN REVIEWER',reviewerRole:'internal',
   reviewDate:'2026-10-17',sourceRef:'SYN COMMENT FILE',comment:'Synthetic label care source requires confirmation'});await submit();
  assert.equal((await records())[0].comments.length,1);
  await act('add-decision');await fill({revisionId:firstId,reviewer:'SYN INTERNAL REVIEWER',reviewerRole:'internal',
   reviewDate:'2026-10-17',sourceRef:'SYN INTERNAL REVIEW',decision:'buyer-approval-evidence-recorded',authorityRef:'SYN BUYER MAIL'});
  const beforeBad=JSON.stringify(await records());
  await page.locator('#laDialog form button[type=submit]').click();
  assert.match(await page.locator('#laDialog [role=alert]').innerText(),/Buyer decision can only/);
  assert.equal(JSON.stringify(await records()),beforeBad,'Invalid source evidence cannot alter saved records');
  await fill({reviewer:'SYN BUYER CONTACT',reviewerRole:'buyer',sourceRef:'SYN SIGNED BUYER EMAIL',authorityRef:'SYN BUYER EVIDENCE'});await submit();
  assert.match(await page.locator('body').innerText(),/NOT INDEPENDENTLY VERIFIED/);
  assert.equal((await records())[0].decisions.length,1);
  await act('revisions');await act('add-revision');
  await fill({artworkRef:'SYN ARTWORK REV 2',sourceDate:'2026-10-17',sourceRef:'SYN NEW ARTWORK SOURCE',
   width:'42',height:'55',unit:'mm',dimensionSourceRef:'SYN NEW SOURCE'});await submit();
  assert.equal((await records())[0].revisions.length,2);
  assert.equal((await records())[0].decisions[0].revisionId,firstId,'Previous decision remains linked to REV1 only');
  await act('summary');assert.match(await page.locator('.la-warning').last().innerText(),/PENDING MATCHING REVISION REVIEW/);
  await act('preview');await act('preview-select');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAJ+lFwAAAABJRU5ErkJggg==','base64');
  await page.locator('#laPreviewFile').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:png});
  await page.locator('.la-preview').waitFor();assert.match(await page.locator('body').innerText(),/synthetic\.png/);
  const localBefore=JSON.stringify(await records());
  await act('preview-select');await page.locator('#laPreviewFile').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg></svg>')});
  await page.locator('#laDialog[open]').waitFor();assert.match(await page.locator('#laDialogBody').innerText(),/validated PNG\/JPEG/);
  await page.locator('#laDialogClose').click();assert.equal(JSON.stringify(await records()),localBefore);
  await act('preview-clear');assert.equal(await page.locator('.la-preview').count(),0);
  assert(!JSON.stringify(await records()).includes('data:image'),'No image data may persist in local saved records');
  await act('save');const beforeReload=JSON.stringify((await records())[0]);
  await page.reload({waitUntil:'domcontentloaded'});await act('continue');assert.equal(JSON.stringify((await records())[0]),beforeReload);
  const download=page.waitForEvent('download');await act('download');
  const file=path.join(out,'artwork-app10-synthetic.vesaart');await(await download).saveAs(file);
  const json=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(json.record.revisions.length,2);assert.equal(json.format,'VESA-LABEL-ARTWORK-COPY-1');
  await act('home');await act('upload');await page.locator('#laCopyFile').setInputFiles(file);
  await page.locator('#laDialog[open]').waitFor();await page.locator('#laDialogClose').click();
  assert.equal((await records()).length,2,'Restore creates a separate copy without overwriting');
  const broken=path.join(out,'artwork-app10-corrupt.vesaart');fs.writeFileSync(broken,fs.readFileSync(file,'utf8').replace('SYN-STYLE-01','UNAUTHORIZED-STYLE'));
  const preserved=JSON.stringify(await records());await page.locator('#laCopyFile').setInputFiles(broken);
  await page.locator('#laDialog[open]').waitFor();assert.match(await page.locator('#laDialogBody').innerText(),/altered\/unsupported/);
  await page.locator('#laDialogClose').click();assert.equal(JSON.stringify(await records()),preserved);
  // M3 user-chosen locally reviewed Tech Pack source; never read sibling private data.
  const proof={sourceApp:'VESA Tech Pack & Spec 360',recordType:'SpecRevision',recordId:'SYN-SPEC-1',
   revisionId:'R3',sourceDate:'2026-10-16',verifiedBy:'SYN SOURCE REVIEWER',verifiedAt:'2026-10-17T08:00:00Z',
   displaySnapshot:{style:'SYN-STYLE-01',colour:'Navy',size:'M',sourceOnly:true}};
  const proofFile=path.join(out,'artwork-app10-reviewed-tech.json');fs.writeFileSync(proofFile,JSON.stringify(proof));
  await act('references');await act('reference-select');await fill({refKind:'tech'});await submit();
  await page.locator('#laReferenceFile').setInputFiles(proofFile);
  await page.locator('#laDialog[open]').waitFor();
  await fill({localReviewer:'SYN LOCAL TECH REVIEWER',localReviewDate:'2026-10-17'});
  await page.locator('#laDialog [name="identityConfirmed"]').check();await submit();
  assert.equal((await records())[0].manualReferences.length,1,'Reference must append one source snapshot');
  assert.match(await page.locator('.la-table').innerText(),/SYN-SPEC-1/);
  const wrong=path.join(out,'artwork-app10-wrong-source.json');
  fs.writeFileSync(wrong,JSON.stringify({...proof,recordId:'SYN WRONG',displaySnapshot:{style:'OTHER-STYLE',colour:'Navy',size:'M'}}));
  const beforeWrong=JSON.stringify(await records());
  await act('reference-select');await fill({refKind:'tech'});await submit();
  await page.locator('#laReferenceFile').setInputFiles(wrong);
  await page.locator('#laDialog[open]').waitFor();
  assert.match(await page.locator('#laDialogBody').innerText(),/Source owner or style\/colour\/size does not match current artwork/);
  await page.locator('#laDialogClose').click();
  assert.equal(JSON.stringify(await records()),beforeWrong,'Wrong-style source import cannot alter saved records');
  await act('history');assert.match(await page.locator('.la-table').innerText(),/New sourced artwork revision/);
  await act('reports');const reportText=await page.locator('.la-report').innerText();
  assert.match(reportText,/DRAFT \/ SOURCE REVIEW ONLY/);
  assert.match(reportText,/Version Differences/);
  assert.match(reportText,/SYN-SPEC-1/);
  assert.match(reportText,/Invalid supplied barcode check digit/);
  assert.match(reportText,/NOT INDEPENDENTLY VERIFIED/);
  const dlXlsx=page.waitForEvent('download');await act('excel');const xlsx=await dlXlsx;
  const xlsxPath=path.join(out,'artwork-app10-source-report.xlsx');await xlsx.saveAs(xlsxPath);
  assert.equal(fs.readFileSync(xlsxPath).subarray(0,2).toString(),'PK','Report must be a real zipped Excel workbook');
  assert(fs.statSync(xlsxPath).size>2500,'Excel workbook must contain sourced data');
  const pdf=await page.pdf({printBackground:true,format:'A4',landscape:true});
  assert(pdf.subarray(0,4).toString()==='%PDF'&&pdf.length>10000);fs.writeFileSync(path.join(out,'artwork-app10-workspace-draft.pdf'),pdf);
  for(const width of [320,360,390,640,768,1024,1280,1440]){
   await page.setViewportSize({width,height:880});const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert(scroll<=width+1,width+'px Artwork page overflow '+scroll);
   if([390,768,1280].includes(width))await page.screenshot({path:path.join(out,'artwork-app10-'+width+'.png')});
  }
  await page.setViewportSize({width:1280,height:900});
  const labels=[['en','Artwork Revisions'],['bn','আর্টওয়ার্ক সংস্করণ'],['hi','आर्टवर्क संस्करण'],['ta','Artwork பதிப்புகள்']];
  for(const [language,label] of labels){
   const oldData=JSON.stringify(await records());
   await page.locator('[data-vesa-user]').click();const settings=page.locator('[data-vesa-settings]');
   await settings.locator('[data-pref-language]').selectOption(language);
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language);
   await page.keyboard.press('Escape');await settings.waitFor({state:'hidden'});
   assert((await page.locator('.la-tabs').innerText()).includes(label),'Missing localized artwork tabs for '+language);
   assert.equal(JSON.stringify(await records()),oldData,'Language cannot alter customer values/IDs');
  }
  await act('home');await act('new');await page.locator('#laDialog[open]').waitFor();
  await page.keyboard.press('Escape');await page.locator('#laDialog[open]').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.action),'new','Escape must restore prior button focus');
  assert.deepEqual(errors,[],'No unhandled JS errors');assert.deepEqual(external,[],'No external requests');
  console.log('ARTWORK M3 CHROMIUM PASS: revision-specific source decisions, stale review invalidation, GTIN warning, safe ephemeral PNG/JPEG preview, local Save/Restore tamper guards, four languages, 320-1440 px one shell, zero external requests.');
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
