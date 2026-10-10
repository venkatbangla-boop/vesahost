/**
 * P-G05 authored-copy localization proof.
 * Access: NODE_PATH=<playwright package> CHROMIUM_PATH=<chromium> node this-file
 * Scope: app-authored follow-up/amendment copy only; entered values and IDs never translate.
 */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright');
const session = { email:'qa@vesaent.com', name:'QA User', role:'admin', userKey:'qa-vesaent-com', loginAt:'2026-10-11T00:00:00.000Z', expiresAt:'2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css':'text/css', '.html':'text/html', '.js':'application/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.webmanifest':'application/manifest+json', '.ico':'image/x-icon' })[path.extname(file)] || 'application/octet-stream';
const keys = [
  'Follow-Up','followUpHelp','Meeting minutes','Chaired by','Agenda','Decisions','Notes','SAVE MINUTES',
  'Action aging and escalation','Action','No due date','Review date','Day basis','Calendar days','Date source',
  'REVIEW ACTION AGE','Choose an action, review date and named source.','Escalation level','Escalation owner',
  'Recorded time','Next review date','Reason','RECORD ESCALATION','Recorded escalations','Date source:',
  'Next review:','Authority / exception evidence','This records supplied authority evidence only. It does not approve a waiver, change a checkpoint, or release production.',
  'Checkpoint','Buyer policy / source','Accountable party','Authorized by','Authority type','Approval date',
  'Permitted until (optional)','Status','Scope','Evidence reference','RECORD AUTHORITY EVIDENCE','Policy/source:',
  'Accountable:','Evidence:','Until','Meeting attachment references',
  'Enter a filename, approved document ID, or secure-location reference. This records a reference only; no file is uploaded.',
  'Attachment reference','ADD REFERENCE','REMOVE REFERENCE','Amend / Version History',
  'Controlled Amendment / Version History','Prior finalized version','Recorded decision:','approval requires fresh evidence',
  'Finalize the current meeting before creating another controlled amendment. Existing version history remains available below.',
  'Reason for amendment','Amendment time','CREATE CONTROLLED AMENDMENT','Prior finalized meetings',
  'Confirm that fresh release, signatures and approval evidence are required.'
];

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
      Object.assign(app.record.meta,{style:'STYLE-USER-অপরিবর্তিত',po:'PO-USER-123'});
      app.record.actions=[{id:'ACT-I18N',checkpointId:'O05',issue:'USER ACTION বাংলা हिन्दी தமிழ்',owner:'Owner User',dueDate:'2026-10-10',action:'USER CORRECTIVE ACTION',evidence:'USER EVIDENCE',status:'Open',conditions:''}];
      app.record.meetingMinutes={chairedBy:'USER CHAIR',agenda:'USER AGENDA',decisions:'USER DECISION বাংলা हिन्दी தமிழ்',notes:'USER NOTES',acknowledgedAt:'',attachmentsRefs:['USER-FILE-রেফারেন্স.pdf']};
      app.record.actionEscalation=[{actionId:'ACT-I18N',escalationLevel:'USER LEVEL',escalationOwner:'USER OWNER',reason:'USER REASON',time:'2026-10-11T01:00:00.000Z',nextReviewDate:'2026-10-12',dateSource:'USER DATE SOURCE'}];
      app.record.exceptions=[{id:'EXC-I18N',checkpointId:'O05',buyerPolicyRef:'USER POLICY',scope:'USER SCOPE',accountableParty:'USER PARTY',authorizedBy:'USER AUTHORIZER',authorityType:'USER AUTHORITY',approvedDate:'2026-10-10',evidence:'USER AUTH EVIDENCE',permittedUntil:'2026-10-20',status:'Active'}];
      app.record.approvals=[{id:'APR-I18N',label:'USER APPROVAL',required:true,status:'Approved',approvedBy:'USER APPROVER',date:'2026-10-10',reference:'USER-REF',notes:'',photo:'',photoRevision:'REV-I18N'}];
      app.record.release={decision:'GO',notes:'USER RELEASE NOTE'};app.record.signatures={factory:{name:'USER SIGNER'}};app.record.locked=true;
      app.record=app.planning.followups.amend(app.record,{reason:'USER AMENDMENT REASON বাংলা हिन्दी தமிழ்',at:'2026-10-11T01:30:00.000Z'});
      Object.assign(app.record.meetingMinutes,{chairedBy:'USER CHAIR',agenda:'USER AGENDA',decisions:'USER DECISION বাংলা हिन्दी தமிழ்',notes:'USER NOTES',attachmentsRefs:['USER-FILE-রেফারেন্স.pdf']});
      app.record.actionEscalation=[{actionId:'ACT-I18N',escalationLevel:'USER LEVEL',escalationOwner:'USER OWNER',reason:'USER REASON',time:'2026-10-11T01:00:00.000Z',nextReviewDate:'2026-10-12',dateSource:'USER DATE SOURCE'}];
      app.record.exceptions=[{id:'EXC-I18N',checkpointId:'O05',buyerPolicyRef:'USER POLICY',scope:'USER SCOPE',accountableParty:'USER PARTY',authorizedBy:'USER AUTHORIZER',authorityType:'USER AUTHORITY',approvedDate:'2026-10-10',evidence:'USER AUTH EVIDENCE',permittedUntil:'2026-10-20',status:'Active'}];
      app.renderAll();return JSON.stringify(app.record);
    });
    const scripts={bn:/[\u0980-\u09ff]/,hi:/[\u0900-\u097f]/,ta:/[\u0b80-\u0bff]/};
    for(const language of ['en','bn','hi','ta']){
      const result=await page.evaluate(({language,keys})=>{
        app.changeLanguage(language);app.command('follow-up');
        const missing=language==='en'?[]:keys.filter(key=>!PPM_SENTENCES[key]?.[language]);
        return {missing,title:document.getElementById('modalTitle').textContent,body:document.getElementById('modalBody').textContent,decision:document.getElementById('minutesDecisions').value,ref:document.querySelector('.attachment-list [data-entered-text]').textContent,authority:document.querySelector('.authority-list h4').textContent,record:JSON.stringify(app.record),doc:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth};
      },{language,keys});
      assert.deepEqual(result.missing,[]);
      if(language!=='en'){assert.match(result.title,scripts[language]);assert.match(result.body,scripts[language])}
      assert.equal(result.decision,'USER DECISION বাংলা हिन्दी தமிழ்');
      assert.match(result.ref,/USER-FILE-রেফারেন্স\.pdf/);
      assert.match(result.authority,/O05 · Active/);assert.equal(result.record,baseline);
      assert.ok(result.doc<=391&&result.bodyWidth<=391);
      await page.evaluate(()=>app.command('amend'));
      const amendment=await page.evaluate(()=>({title:document.getElementById('modalTitle').textContent,body:document.getElementById('modalBody').textContent,reason:document.querySelector('.amendment-history [data-entered-text]').textContent,record:JSON.stringify(app.record),doc:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
      if(language!=='en'){assert.match(amendment.title,scripts[language]);assert.match(amendment.body,scripts[language])}
      assert.equal(amendment.reason,'USER AMENDMENT REASON বাংলা हिन्दी தமிழ்');assert.equal(amendment.record,baseline);assert.ok(amendment.doc<=391&&amendment.bodyWidth<=391);
      if(language==='bn'||language==='ta'){fs.mkdirSync(output,{recursive:true});await page.locator('#modalBackdrop .modal').screenshot({path:path.join(output,`ppm-p-g05-amendment-${language}-390.png`)})}
    }
    assert.deepEqual(errors,[]);
    console.log('PPM P-G05 localization passed: complete follow-up/amendment keys in EN/BN/HI/TA, entered values and IDs unchanged, 390px overflow and console');
  }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(error=>{console.error(error);process.exitCode=1});
