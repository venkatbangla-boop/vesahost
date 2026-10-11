/**
 * P-G06 saved-copy, recovery and storage-failure browser proof.
 * Access: NODE_PATH=<playwright package> CHROMIUM_PATH=<chromium> node this-file
 * Scope: disposable synthetic records only; no customer data or browser-store deletion.
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
    const source=await page.evaluate(async()=>{
      await app.newRecord();
      Object.assign(app.record.meta,{style:'PG06-SOURCE',po:'PO-PG06',buyer:'Synthetic Buyer',factory:'Synthetic Factory'});
      app.record.statuses.O05='ACTION';
      app.record.actions=[{id:'ACT-PG06',checkpointId:'O05',issue:'Synthetic saved-copy action.',action:'Retain exact evidence.',owner:'QA User',dueDate:'2026-10-15',evidence:'PG06-EVIDENCE',status:'Open'}];
      app.record.meetingMinutes={chairedBy:'QA User',agenda:'Recovery proof',decisions:'PRESERVE-THIS-VALUE',notes:'Synthetic only',acknowledgedAt:'',attachmentsRefs:['PG06-REFERENCE.pdf']};
      app.renderAll();await app.save(true);await app.recovery.save(app.record,true);
      return {id:app.record.id,raw:app.codec.encode(app.record),semantic:{style:app.record.meta.style,action:app.record.actions[0].evidence,decision:app.record.meetingMinutes.decisions,reference:app.record.meetingMinutes.attachmentsRefs[0]}};
    });
    const invalidCases=[
      {name:'malformed.vesappm',buffer:Buffer.from('{broken')},
      {name:'future.vesappm',buffer:Buffer.from(JSON.stringify({...JSON.parse(source.raw),schema:999}))},
      {name:'corrupt-image.vesappm',buffer:Buffer.from(JSON.stringify((()=>{const value=JSON.parse(source.raw);value.record.photos.style='data:image/png;base64,iVBORw0KGgo=';return value})()))},
      {name:'oversized.vesappm',buffer:Buffer.alloc(24*1024*1024+1,0x20)}
    ];
    for(const item of invalidCases){
      const before=await page.evaluate(()=>JSON.stringify(app.record));
      await page.locator('#importInput').setInputFiles({name:item.name,mimeType:'application/json',buffer:item.buffer});
      await page.waitForTimeout(80);
      assert.equal(await page.evaluate(()=>JSON.stringify(app.record)),before,`${item.name} changed the active meeting`);
      assert.equal(await page.evaluate(async id=>(await app.repo.get(id)).meta.style,source.id),'PG06-SOURCE');
    }
    await page.locator('#importInput').setInputFiles({name:'current.vesappm',mimeType:'application/json',buffer:Buffer.from(source.raw)});
    await page.waitForFunction(id=>app.record.id!==id&&app.record.meta.style==='PG06-SOURCE',source.id);
    const current=await page.evaluate(async sourceId=>({id:app.record.id,sourceStillThere:(await app.repo.get(sourceId)).meta.style,semantic:{style:app.record.meta.style,action:app.record.actions[0].evidence,decision:app.record.meetingMinutes.decisions,reference:app.record.meetingMinutes.attachmentsRefs[0]}}),source.id);
    assert.notEqual(current.id,source.id);assert.equal(current.sourceStillThere,'PG06-SOURCE');assert.deepEqual(current.semantic,source.semantic);
    const legacy=await page.evaluate(()=>{const value=U.clone(app.record);value.version='4.1.1';delete value.approvals;delete value.changeReview;delete value.followUpSchema;delete value.meetingMinutes;delete value.exceptions;delete value.actionEscalation;delete value.meetingVersions;return JSON.stringify(value)});
    const beforeLegacyId=await page.evaluate(()=>app.record.id);
    await page.locator('#importInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(legacy)});
    await page.waitForFunction(id=>app.record.id!==id,beforeLegacyId);
    assert.deepEqual(await page.evaluate(()=>({version:app.record.version,minutes:app.record.meetingMinutes,followUpSchema:app.record.followUpSchema})),{version:'5.1.5',minutes:{chairedBy:'',agenda:'',decisions:'',notes:'',acknowledgedAt:'',attachmentsRefs:[]},followUpSchema:1});
    const recovery=await page.evaluate(async()=>{
      app.record.meta.style='PG06-RECOVERY-POINT';app.record.release={decision:'HOLD',notes:'Synthetic hold'};app.record.signatures={factory:{image:'',name:'Synthetic signer',designation:'QA',date:'2026-10-11',time:'02:00'}};await app.save(true);await app.recovery.save(app.record,true);const parent=app.record.id;app.record.meta.style='PG06-LATER-EDIT';await app.save(true);await app.recoveryMenu();return {parent,rows:document.querySelectorAll('[data-recover]').length};
    });
    assert.ok(recovery.rows>0);await page.locator('[data-recover]',{hasText:'PG06-RECOVERY-POINT'}).first().click();await page.waitForFunction(parent=>app.record.id!==parent&&app.record.meta.style==='PG06-RECOVERY-POINT',recovery.parent);
    assert.deepEqual(await page.evaluate(()=>({locked:app.record.locked,release:app.record.release,signatures:Object.keys(app.record.signatures),parentExists:!!app.repo.get})),{locked:false,release:{decision:'',notes:''},signatures:[],parentExists:true});
    const failed=await page.evaluate(async()=>{const id=app.record.id,durableBefore=await app.repo.get(id),save=app.repo.save;app.record.meta.style='PG06-UNSAVED-QUOTA';app.repo.save=async()=>{throw Error('QuotaExceededError')};const ok=await app.save(true);app.repo.save=save;const durableAfter=await app.repo.get(id);await app.storage();return {ok,memory:app.record.meta.style,durableBefore:durableBefore.meta.style,durableAfter:durableAfter.meta.style,local:document.getElementById('saveState').textContent,shell:document.querySelector('[data-vesa-saved]').textContent,rescue:!!document.querySelector('#modalBody [data-command="backup"]'),doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}});
    assert.equal(failed.ok,false);assert.equal(failed.memory,'PG06-UNSAVED-QUOTA');assert.equal(failed.durableAfter,failed.durableBefore);assert.match(failed.local,/SAVE FAILED/);assert.equal(failed.shell,'Could not save — download a saved copy');assert.equal(failed.rescue,true);assert.ok(failed.doc<=391&&failed.body<=391);
    assert.deepEqual(errors,[]);
    console.log('PPM P-G06 recovery passed: current/V4 reopen, atomic malformed/future/oversized/corrupt-image rejection, recovery-as-new-draft and quota rescue at 390px');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(error=>{console.error(error);process.exitCode=1});
