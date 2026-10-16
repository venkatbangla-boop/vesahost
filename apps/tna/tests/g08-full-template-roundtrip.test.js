/**
 * G08 importable full-task Excel template round-trip, typed date/quantity,
 * source-only task graph and explicit different-record save. Synthetic only.
 * Run: node apps/tna/tests/g08-full-template-roundtrip.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
globalThis.VesaTnaDomain=domain;
globalThis.VesaTnaStorage=storage;
const imports=require('../src/import-review.js');
globalThis.localStorage={
  values:new Map(),
  getItem(k){return this.values.has(k)?this.values.get(k):null;},
  setItem(k,v){this.values.set(k,String(v));},
  removeItem(k){this.values.delete(k);}
};
class TnaG08TemplateRoundTripProof {
  static source(templateId,user){
    const plan=domain.createPlan({
      templateId,buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',
      styleNo:'STYLE-G08-'+templateId,poNumber:'PO-G08-'+templateId,
      totalQty:1200,unit:'pcs',
      orderConfirmedOn:'2026-10-16',buyerRequiredExFactory:'2026-11-22'
    },{ownerUserId:user});
    plan.tasks[1].dates.currentTargetFinish='2026-10-20';
    plan.tasks[2].dates.baselineFinish='2026-10-19';
    plan.tasks[2].dates.actualFinish='2026-10-21';
    plan.tasks[2].status='approved'; // Deliberate unverified local claim.
    plan.tasks[3].importSourceNote='PRIVATE CUSTOMER INTERNAL NOTE';
    return plan;
  }
  static options(stage,profile,user){
    return {config:{...imports.suggested(stage),templateId:profile,
      dateFormat:'excel',unit:'pcs',durationBasis:'working',
      dependencyMode:'source',relation:'FS'},
      context:{ownerUserId:user,existing:storage.listPlans(user)}};
  }
  static run(){
    const user='synthetic-g08-template';
    assert.equal(typeof storage.exportImportTemplateWorkbook,'function');
    for(const language of ['en','bn','hi','ta']){
      const c=imports.labels(language);
      assert(c.blankTemplate&&c.currentTemplate&&c.templateType&&c.templateNotice);
    }
    for(const profile of ['knit','woven','denim','sweater','outerwear']){
      const source=this.source(profile,user),sourceBytes=JSON.stringify(source);
      storage.savePlan(source,user);
      const raw=storage.exportImportTemplateWorkbook(source,{blank:false,language:'en'});
      const book=XLSX.read(raw,{type:'buffer',cellFormula:true,cellNF:true,cellStyles:true});
      assert.deepEqual(book.SheetNames,['Order Summary','Master TNA','Import Guide']);
      const os=book.Sheets['Order Summary'],ws=book.Sheets['Master TNA'];
      assert.equal(os.A1.v,'Buyer');
      assert.equal(os.D2.v,'PO-G08-'+profile);
      assert.equal(os.E2.t,'n');
      assert.equal(os.E2.v,1200);
      assert.equal(os.F2.t,'n');
      assert.equal(os.G2.t,'n');
      assert.equal(os.F2.z,'yyyy-mm-dd');
      assert.equal(ws.A1.v,'Ref');
      assert.equal(ws.K1.v,'Predecessor');
      assert.equal(ws['!cols'][1].wch,55);
      assert.equal(XLSX.utils.sheet_to_json(ws,{header:1}).length,source.tasks.length+1);
      assert.equal(ws.F3.t,'n');
      assert.equal(ws.E4.t,'n');
      assert.equal(ws.G4.t,'n');
      assert.equal(ws.F3.z,'yyyy-mm-dd');
      assert.equal(ws.J4.v,'not-started',
        'Old local approval must not be promoted as an imported approval.');
      assert(ws.L5===undefined||ws.L5.v==='',
        'Empty Excel cells are fine; confidential note text must remain excluded.');
      assert(!JSON.stringify(book.Sheets).includes('PRIVATE CUSTOMER INTERNAL NOTE'));
      assert(!Object.values(book.Sheets).some(sheet=>
        Object.values(sheet).some(cell=>cell?.f)), 'No formulas in downloaded workbook.');
      const stage=imports.parseWorkbook(raw,'TNA-'+profile+'.xlsx');
      const suggestion=imports.suggested(stage);
      assert.equal(suggestion.orderSheet,0);
      assert.equal(suggestion.taskSheet,1);
      assert.equal(suggestion.taskMap.predecessor,10);
      const {config,context}=this.options(stage,profile,user);
      const review=imports.review(stage,config,context);
      assert.equal(review.ok,true,review.errors.join('; '));
      assert.equal(review.summary.matched,source.tasks.length);
      assert.equal(review.plan.tasks.length,source.tasks.length);
      assert.equal(review.plan.edges.length,source.edges.length,
        'Source FS predecessor graph must survive full task workbook.');
      assert.equal(review.plan.commitments.buyerRequiredExFactory,'2026-11-22');
      assert.equal(review.plan.commitments.orderConfirmedOn,'2026-10-16');
      assert.equal(review.plan.tasks[1].dates.currentTargetFinish,'2026-10-20');
      assert.equal(review.plan.tasks[2].dates.baselineFinish,'2026-10-19');
      assert.equal(review.plan.tasks[2].dates.actualFinish,'2026-10-21');
      assert.equal(review.plan.tasks[2].status,'not-started');
      assert.deepEqual(review.plan.baselineSnapshots,[]);
      assert.deepEqual(review.plan.approvals,[]);
      assert.equal(review.existingCount,1);
      assert.equal(review.plan.importReview.unverifiedAuthority,true);
      const wrongFormat=imports.review(stage,{...config,dateFormat:'iso'},context);
      assert.equal(wrongFormat.ok,false);
      assert(wrongFormat.errors.some(e=>e.includes('date')));
      assert.throws(()=>imports.commitNewDraft(review,{user,confirm:false}),/Confirm/);
      const saved=imports.commitNewDraft(review,{user,confirm:true});
      assert.notEqual(saved.plan.recordId,source.recordId);
      assert.equal(saved.plan.recordStatus,'draft');
      assert.equal(saved.plan.revision,0);
      assert.equal(saved.plan.importReview.activitySheet,'Master TNA');
      assert.equal(JSON.stringify(storage.loadPlan(source.recordId,user)),sourceBytes);
      assert.equal(storage.importCopy(storage.exportCopy(saved.plan)).recordId,saved.plan.recordId);
    }
    const blank=domain.createPlan({templateId:'woven'},{ownerUserId:user});
    const blankBytes=storage.exportImportTemplateWorkbook(blank,{blank:true,language:'ta'});
    const emptyBook=XLSX.read(blankBytes,{type:'buffer'});
    assert.deepEqual(emptyBook.SheetNames,['Order Summary','Master TNA','Import Guide']);
    assert.equal(emptyBook.Sheets['Order Summary'].E2?.v??'', '',
      'Blank quantity cannot be fabricated.');
    assert.equal(emptyBook.Sheets['Order Summary'].F2?.v??'', '',
      'Blank buyer ex-factory cannot be fabricated.');
    assert.equal(emptyBook.Sheets['Master TNA'].H2?.v??'', '',
      'Blank garment template must not populate unverified durations.');
    assert.equal(emptyBook.Sheets['Master TNA'].K2?.v??'', '',
      'Blank garment template must not assume verified predecessors.');
    const blankStage=imports.parseWorkbook(blankBytes,'blank-woven.xlsx'),
      {config,context}=this.options(blankStage,'woven',user);
    const incomplete=imports.review(blankStage,config,context);
    assert.equal(incomplete.ok,false,'Blank template has no verified order identity.');
    assert(incomplete.errors.some(e=>e.includes('Missing order value')));
    assert.throws(()=>imports.commitNewDraft(incomplete,{confirm:true,user}),
      /unresolved/);
    const mixed=this.source('knit',user);
    mixed.order.poNumbers.push('PO-SECOND');
    assert.throws(()=>storage.exportImportTemplateWorkbook(mixed),/Separate PO/);
    const advanced=this.source('woven',user);
    advanced.edges[0].relation='SS';
    assert.throws(()=>storage.exportImportTemplateWorkbook(advanced),/Advanced dependency/);
    const practice=this.source('knit',user);
    practice.mode='practice';
    assert.throws(()=>storage.exportImportTemplateWorkbook(practice),/Practice/);
    const formulaSource=this.source('knit',user);
    formulaSource.order.buyerName='=HYPERLINK("bad")';
    const escaped=XLSX.read(storage.exportImportTemplateWorkbook(formulaSource),
      {type:'buffer',cellFormula:true});
    assert(escaped.Sheets['Order Summary'].A2.v.startsWith("'="));
    assert(!Object.values(escaped.Sheets).some(sheet=>
      Object.values(sheet).some(c=>c?.f)));
    console.log('TNA G08 TEMPLATE PASS: knit/woven/denim/sweater/outerwear full-task real XLSX roundtrip, 4-language labels, typed quantity and dates, source FS graph, no imported approval/baseline, blank source fail-closed, multi-PO and non-FS rejected, same-PO separate saved/reopened record, formula-neutral text.');
  }
}
TnaG08TemplateRoundTripProof.run();
