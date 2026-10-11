/**
 * P-G07 PR01-PR10 report catalogue and immutable export proof.
 * Access: NODE_PATH=<playwright package> CHROMIUM_PATH=<chromium> node this-file
 * Scope: disposable synthetic meeting only; no customer data or browser-store deletion.
 */
const assert=require('assert/strict');
const http=require('http');
const fs=require('fs');
const path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-11T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon'})[path.extname(file)]||'application/octet-stream';

async function run(){
  const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file))}catch{response.writeHead(404).end()}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(value=>localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(value)),session);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/ppm/`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>typeof app!=='undefined'&&app.record&&document.querySelector('.vesa-workspace'));
    const baseline=await page.evaluate(async()=>{
      await app.newRecord();
      Object.assign(app.record.meta,{style:'PG07-STYLE-অপরিবর্তিত-अपरिवर्तित-மாறாதது',po:'PO-PG07',buyer:'Buyer বাংলা हिन्दी தமிழ்',factory:'Factory বাংলা हिन्दी தமிழ்',meetingDate:'2026-10-11'});
      const role=Object.keys(app.record.participants)[0];app.record.participants[role]={present:true,name:'Attendee বাংলা हिन्दी தமிழ்'};
      app.record.customCheckpoints=[{id:'CUST-PG07',section:'order',label:'User label বাংলা हिन्दी தமிழ்',hint:'User guidance বাংলা हिन्दी தமிழ்',critical:true}];
      app.record.statuses['CUST-PG07']='ACTION';app.record.remarks['CUST-PG07']='User evidence বাংলা हिन्दी தமிழ்';
      app.record.actions=[{id:'ACT-PG07',checkpointId:'CUST-PG07',issue:'User issue বাংলা हिन्दी தமிழ்',action:'User action বাংলা हिन्दी தமிழ்',owner:'Owner বাংলা हिन्दी தமிழ்',dueDate:'2026-10-15',evidence:'REF-PG07-EVIDENCE',status:'Open'}];
      app.record.approvals=[{id:'APR-PG07',label:'Synthetic buyer approval',required:true,status:'Pending',approvedBy:'',date:'',reference:'REF-PG07-APPROVAL',notes:'Awaiting supplied authority.',photo:'',photoRevision:''}];
      app.record.measurements=[{pom:'Chest',spec:'50',tol:'',tolMinus:'1',tolPlus:'1',actual:'52',unit:'cm',method:'Synthetic method',risk:'Synthetic risk',remark:'Synthetic measurement remark',checkRequired:true}];
      app.record.meetingMinutes={chairedBy:'Chair বাংলা हिन्दी தமிழ்',agenda:'Agenda বাংলা हिन्दी தமிழ்',decisions:'Decision বাংলা हिन्दी தமிழ்',notes:'Notes বাংলা हिन्दी தமிழ்',acknowledgedAt:'',attachmentsRefs:['REF-PG07-MINUTES']};
      app.record.release={decision:'HOLD',notes:'Release note বাংলা हिन्दी தமிழ்'};
      app.record.signatures={factory:{image:'',name:'Synthetic Signer',designation:'QA',date:'2026-10-11',time:'08:00'}};
      app.planning.changes.review(app.record,'QA User','Synthetic controlled baseline.');app.record.meta.bomRev='BOM-PG07-R2';
      app.renderAll();await app.save(true);return JSON.stringify(app.record);
    });
    const expected={PR01:['Executive summary','Production Release Decision','Attendance & Minutes','Custom Checkpoint & Evidence'],PR02:['One-Page Buyer Summary'],PR03:['Factory Action List'],PR04:['Approvals'],PR05:['Measurement check'],PR06:['What changed?'],PR07:['Production Release Decision'],PR08:['Management Blocker Summary'],PR09:['Attendance & Minutes'],PR10:['Custom Checkpoint & Evidence']};
    const languages={en:null,bn:/[\u0980-\u09ff]/,hi:/[\u0900-\u097f]/,ta:/[\u0b80-\u0bff]/},proofs={};
    for(const language of Object.keys(languages)){
      proofs[language]=await page.evaluate(async({language,expected})=>{
        app.changeLanguage(language);
        const missing=language==='en'?[]:PPM_REPORT_KEYS.filter(key=>!PPM_SENTENCES[key]?.[language]);
        const catalog=app.reports.catalog(),reports={};
        for(const report of catalog){
          const blob=await app.reports.pdf(app.record,report.id);
          reports[report.id]={size:blob.size,titles:app.reports.pageTitles.slice(),authored:app.reports.authoredText.slice()};
        }
        app.exportMenu();
        const selector={options:[...document.querySelectorAll('#reportMode option')].map(option=>option.textContent),doc:document.documentElement.scrollWidth,body:document.body.scrollWidth};
        app.closeModal();
        return {catalog,reports,missing,selector,record:JSON.stringify(app.record),sentinels:{style:app.record.meta.style,buyer:app.record.meta.buyer,label:app.record.customCheckpoints[0].label,action:app.record.actions[0].action,notes:app.record.meetingMinutes.notes}};
      },{language,expected});
      const proof=proofs[language];
      assert.deepEqual(proof.catalog.map(report=>report.id),Object.keys(expected));
      assert.deepEqual(proof.missing,[],`${language} report dictionary has missing keys`);
      for(const [id,titles] of Object.entries(expected)){
        assert.ok(proof.reports[id].size>1000,`${language} ${id} PDF is unexpectedly small`);
        for(const title of titles){
          const localized=await page.evaluate(({title,language})=>{app.locale.set(language);return app.locale.sentence(title,title)},{title,language});
          assert.ok(proof.reports[id].titles.includes(localized),`${language} ${id} missing ${localized}`);
        }
        if(languages[language])assert.ok(proof.reports[id].authored.some(text=>languages[language].test(text)),`${language} ${id} has no localized authored report text`);
      }
      assert.equal(proof.record,baseline,`${language} report generation changed the active meeting`);
      assert.deepEqual(proof.sentinels,{style:'PG07-STYLE-অপরিবর্তিত-अपरिवर्तित-மாறாதது',buyer:'Buyer বাংলা हिन्दी தமிழ்',label:'User label বাংলা हिन्दी தமிழ்',action:'User action বাংলা हिन्दी தமிழ்',notes:'Notes বাংলা हिन्दी தமிழ்'});
      assert.equal(proof.selector.options.filter(label=>/^PR\d{2}/.test(label)).length,10);
      if(languages[language])assert.ok(proof.selector.options.slice(0,10).every(label=>languages[language].test(label)),`${language} selector title was not localized`);
      assert.ok(proof.selector.doc<=391&&proof.selector.body<=391,`${language} selector overflowed 390px viewport`);
    }
    const output=path.join(root,'output','playwright');fs.mkdirSync(output,{recursive:true});
    const themes=['clear-blue','midnight-mono','pure-mono'],printHashes={};
    for(const language of Object.keys(languages)){
      printHashes[language]=[];
      for(const theme of themes){
        await page.setViewportSize({width:320,height:844});
        await page.evaluate(({language,theme})=>{
          document.documentElement.style.zoom='1';window.scrollTo(0,0);
          const preferences=VesaPrefs.write({...VesaPrefs.read(),language,theme});
          VesaPrefs.apply(preferences);VesaPrefs.translate();app.changeLanguage(language);
          document.getElementById('printBtn').focus();app.exportMenu();
        },{language,theme});
        await page.waitForFunction(()=>document.activeElement?.id==='modalClose');
        const mobile=await page.evaluate(()=>{
          const modal=document.querySelector('#modalBackdrop .modal'),active=document.activeElement,style=getComputedStyle(active),label=document.getElementById(modal.getAttribute('aria-labelledby'));
          const primary=getComputedStyle(document.getElementById('makePdf')),rgb=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number),luminance=value=>{const channels=rgb(value).map(channel=>{channel/=255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4});return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]},lighter=Math.max(luminance(primary.color),luminance(primary.backgroundColor)),darker=Math.min(luminance(primary.color),luminance(primary.backgroundColor));
          return {role:modal.getAttribute('role'),ariaModal:modal.getAttribute('aria-modal'),name:label?.textContent?.trim(),active:active.id,outline:parseFloat(style.outlineWidth),primaryContrast:(lighter+.05)/(darker+.05),doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,client:document.documentElement.clientWidth,theme:document.documentElement.dataset.vesaTheme,language:document.documentElement.lang,record:JSON.stringify(app.record)};
        });
        assert.equal(mobile.role,'dialog');assert.equal(mobile.ariaModal,'true');assert.ok(mobile.name);assert.equal(mobile.active,'modalClose');assert.ok(mobile.outline>=3,'report dialog focus is not visibly outlined');assert.ok(mobile.primaryContrast>=4.5,`${language}/${theme} primary report action contrast was ${mobile.primaryContrast}`);assert.ok(mobile.doc<=mobile.client+1&&mobile.body<=mobile.client+1,`${language}/${theme} overflowed 320px`);assert.equal(mobile.theme,theme);assert.equal(mobile.language,language);assert.equal(mobile.record,baseline);
        await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'shareSummary',`${language}/${theme} did not wrap focus to the last report action`);
        await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'modalClose',`${language}/${theme} did not trap focus in the report dialog`);
        await page.screenshot({path:path.join(output,`ppm-p-g07-${language}-${theme}-320.png`)});
        await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement?.id),'printBtn',`${language}/${theme} did not return focus after closing the report dialog`);

        await page.setViewportSize({width:1280,height:900});
        await page.evaluate(()=>{document.documentElement.style.zoom='2';window.scrollTo(0,0);document.getElementById('printBtn').focus();app.exportMenu()});
        await page.waitForFunction(()=>document.activeElement?.id==='modalClose');
        const zoom=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,client:document.documentElement.clientWidth,modal:document.querySelector('#modalBackdrop .modal').getBoundingClientRect().toJSON()}));
        assert.ok(zoom.body<=zoom.client+1,`${language}/${theme} report surface overflowed at 200% zoom: ${JSON.stringify(zoom)}`);assert.ok(zoom.modal.left>=0&&zoom.modal.right<=1281,`${language}/${theme} report dialog clipped at 200% zoom: ${JSON.stringify(zoom)}`);
        await page.screenshot({path:path.join(output,`ppm-p-g07-${language}-${theme}-zoom200.png`)});
        await page.keyboard.press('Escape');

        const print=await page.evaluate(async language=>{
          document.documentElement.style.zoom='1';const pages=await app.reports.build(app.record,'summary'),canvas=pages[0],data=canvas.toDataURL('image/png'),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261;
          for(let y=0;y<canvas.height;y+=8)for(let x=0;x<canvas.width;x+=8){if(y<170&&x>1450)continue;const index=(y*canvas.width+x)*4;hash^=pixels[index];hash=Math.imul(hash,16777619);hash^=pixels[index+1];hash=Math.imul(hash,16777619);hash^=pixels[index+2];hash=Math.imul(hash,16777619)}
          const sample={en:'VESA',bn:'বাংলা',hi:'हिन्दी',ta:'தமிழ்'}[language];
          return {hash:hash>>>0,bytes:data.length,width:canvas.width,height:canvas.height,evidence:app.reports.renderEvidence,fontReady:document.fonts.check('16px Arial, Bengali, Devanagari, Tamil, sans-serif',sample),record:JSON.stringify(app.record)};
        },language);
        assert.ok(print.bytes>10000&&print.width===2244&&print.height===1587,`${language}/${theme} printable canvas is invalid`);assert.equal(print.evidence.logo,true);assert.equal(print.evidence.watermark,'VESA Enterprise Inc.');assert.equal(print.evidence.footer,'Powered by EGENVA');assert.ok(print.evidence.pageCount>=1);assert.deepEqual(print.evidence.pageNumbers,Array.from({length:print.evidence.pageCount},(_,index)=>`${index+1}/${print.evidence.pageCount}`));assert.equal(print.fontReady,true,`${language}/${theme} report font was not ready`);assert.equal(print.record,baseline);printHashes[language].push(print.hash);
        if(theme==='clear-blue'){const png=await page.evaluate(()=>app.reports.pages[0].toDataURL('image/png').split(',')[1]);fs.writeFileSync(path.join(output,`ppm-p-g07-${language}-print.png`),Buffer.from(png,'base64'))}
      }
      assert.equal(new Set(printHashes[language]).size,1,`${language} printable output changed with the UI theme`);
    }
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.documentElement.style.zoom='1';window.scrollTo(0,0);app.changeLanguage('ta');app.exportMenu()});await page.waitForFunction(()=>document.activeElement?.id==='modalClose');await page.screenshot({path:path.join(output,'ppm-p-g07-report-catalogue-390.png')});
    assert.deepEqual(errors,[]);
    console.log('PPM P-G07 report coverage passed: 40 PDFs; 12 language/theme checks at 320px and 200% zoom; dialog focus/name/return; local Indic fonts; logo/watermark/footer/page markers; theme-independent print canvases; immutable multilingual values; zero page errors');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(error=>{console.error(error);process.exitCode=1});
