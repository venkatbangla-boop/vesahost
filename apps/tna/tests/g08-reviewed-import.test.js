/**
 * G08 staged Excel/CSV TNA import: pure preview, explicit source mapping,
 * duplicate and dependency review, local NEW-draft save only, old record
 * immutability, formula/date/macro protection and portable saved copies.
 * Synthetic data only. node apps/tna/tests/g08-reviewed-import.test.js
 */
'use strict';
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
globalThis.VesaTnaDomain=domain;globalThis.VesaTnaStorage=storage;
const imports=require('../src/import-review.js');
globalThis.localStorage={
  values:new Map(),
  getItem(key){return this.values.has(key)?this.values.get(key):null;},
  setItem(key,val){this.values.set(key,String(val));},
  removeItem(key){this.values.delete(key);}
};

class TnaG08ReviewedImportProof {
  static setup(){
    const user='g08-synthetic-user',old=domain.createPlan({
      templateId:'knit',buyerName:'Synthetic Buyer',
      factoryName:'Synthetic Factory',styleNo:'G08-STYLE',
      poNumber:'PO-G08',totalQty:1200,orderConfirmedOn:'2026-10-16',
      buyerRequiredExFactory:'2026-11-22'}, {ownerUserId:user});
    storage.savePlan(old,user);
    return {user,old,oldSaved:JSON.stringify(storage.loadPlan(old.recordId,user))};
  }
  static review(stage,user,changes={}){
    const s=imports.suggested(stage);
    return imports.review(stage,{
      ...s,templateId:'knit',unit:'pcs',durationBasis:'working',
      dateFormat:'dmy',dependencyMode:'source',relation:'FS',...changes
    },{ownerUserId:user,existing:storage.listPlans(user)});
  }
  static workbook(){
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
      ['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory','Order Confirmed On'],
      ['Synthetic Buyer','Synthetic Factory','G08-STYLE','PO-G08',1200,'2026-11-22','2026-10-16']
    ]),'Order Summary');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
      ['Ref','Activity','Owner','Current','Predecessor','Duration','Status','Notes'],
      ['O01','Order receipt','merchant','2026-10-17','',2,'not-started','Reviewed local work'],
      ['O02','PO review','factory','2026-10-20','O01',3,'in-progress','Buyer source not authenticated']
    ]),'Master TNA');
    return XLSX.write(wb,{type:'buffer',bookType:'xlsx'});
  }
  static run(){
    const {user,old,oldSaved}=this.setup();
    for(const lang of ['en','bn','hi','ta']){
      const l=imports.labels(lang);
      assert(l.intro&&l.create&&l.accept&&l.conflicts&&l.fail);
    }
    const csv='Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory,Order Confirmed On,Ref,Activity,Current,Predecessor,Duration,Status,Notes\n'+
      'Synthetic Buyer,Synthetic Factory,G08-STYLE,PO-G08,1200,22/11/2026,16/10/2026,O01,Order receipt,17/10/2026,,2,not-started,"Reviewed, with comma"\n'+
      'Synthetic Buyer,Synthetic Factory,G08-STYLE,PO-G08,1200,22/11/2026,16/10/2026,O02,PO review,20/10/2026,O01,3,in-progress,Follow up';
    const stage=imports.parseText(csv,'synthetic.csv');
    assert.equal(stage.sheets.length,1);
    assert.equal(stage.sheets[0].rows.length,3);
    assert.equal(stage.sheets[0].rows[1][13],'Reviewed, with comma');
    const s=imports.suggested(stage);
    assert.equal(s.orderSheet,0);
    assert.equal(s.taskSheet,0);
    assert.equal(s.orderMap.poNumber,3);
    assert.equal(s.taskMap.taskRef,7);
    assert.equal(s.taskMap.predecessor,10);
    let review=this.review(stage,user);
    assert.equal(review.ok,true,review.errors.join(' / '));
    assert.equal(review.summary.matched,2);
    assert.equal(review.summary.sourceTaskRows,2);
    assert.equal(review.plan.mode,'local');
    assert.equal(review.plan.recordStatus,'draft');
    assert.equal(review.plan.revision,0);
    assert.deepEqual(review.plan.baselineSnapshots,[]);
    assert.deepEqual(review.plan.approvals,[]);
    assert.equal(review.plan.order.totalQty,1200);
    assert.equal(review.plan.commitments.buyerRequiredExFactory,'2026-11-22');
    assert.equal(review.plan.commitments.orderConfirmedOn,'2026-10-16');
    assert.equal(review.plan.importReview.unverifiedAuthority,true);
    assert.equal(review.existingCount,1);
    assert(review.warnings.some(x=>x.includes('Similar saved PO/style')));
    assert.equal(review.plan.edges.length,1,'Use ONLY entered source predecessor.');
    assert.equal(review.plan.edges[0].relation,'FS');
    assert.equal(review.plan.tasks.find(t=>t.templateRef==='O01').dates.currentTargetFinish,'2026-10-17');
    assert.equal(review.plan.tasks.find(t=>t.templateRef==='O02').status,'in-progress');
    assert.equal(review.plan.tasks.find(t=>t.templateRef==='O01').importSourceNote,'Reviewed, with comma');
    assert.equal(JSON.stringify(storage.loadPlan(old.recordId,user)),oldSaved,
      'Review must never write or alter existing local records.');
    assert.throws(()=>imports.commitNewDraft(review,{user,confirm:false}),/Confirm/);
    assert.throws(()=>imports.commitNewDraft(review,{user:'another-profile',confirm:true}),/profile/);
    assert.equal(storage.listPlans(user).length,1);
    const saved=imports.commitNewDraft(review,{user,confirm:true});
    assert.equal(saved.saved.recordId,review.plan.recordId);
    assert.notEqual(saved.saved.recordId,old.recordId);
    assert.equal(storage.listPlans(user).length,2);
    assert.equal(JSON.stringify(storage.loadPlan(old.recordId,user)),oldSaved);
    assert.equal(saved.plan.tasks.find(t=>t.templateRef==='O01').dates.currentTargetFinish,'2026-10-17');
    assert.equal(storage.importCopy(storage.exportCopy(saved.plan)).recordId,saved.plan.recordId);
    assert.throws(()=>imports.commitNewDraft(review,{user,confirm:true}),/already exists/);
    const wbstage=imports.parseWorkbook(this.workbook(),'synthetic-g08.xlsx');
    assert.deepEqual(wbstage.sheets.map(s=>s.name),['Order Summary','Master TNA']);
    const ws=imports.suggested(wbstage);
    assert.equal(ws.orderSheet,0);
    assert.equal(ws.taskSheet,1);
    const wreview=this.review(wbstage,user,{dateFormat:'iso'});
    assert.equal(wreview.ok,true,wreview.errors.join(' / '));
    assert.equal(wreview.summary.matched,2);
    assert.equal(wreview.plan.order.totalQty,1200);
    assert.equal(wreview.plan.tasks.find(t=>t.templateRef==='O02').durationUnits,3);
    assert.equal(wreview.plan.edges.length,1);
    const workbook=XLSX.read(this.workbook(),{type:'buffer'});
    workbook.Sheets['Master TNA'].D2.f='TODAY()';
    assert.throws(()=>imports.parseWorkbook(XLSX.write(workbook,{type:'buffer',bookType:'xlsx'}),
      'synthetic-g08.xlsx'),/Formula/);
    assert.throws(()=>imports.parseWorkbook(this.workbook(),'synthetic.xlsm'),/macro-free/);
    assert.throws(()=>imports.parseText(csv.replace('Synthetic Buyer','=HYPERLINK("bad")')),
      /Formula-looking/);
    assert.throws(()=>imports.parseText(csv.replace('Follow up','<script>alert(1)</script>')),
      /Formula-looking/);
    assert.throws(()=>imports.parseText(csv+'\n'.repeat(3)+
      Array.from({length:251},()=> 'A,B,C').join('\n')),/Too many rows/);
    const noFormat=this.review(stage,user,{dateFormat:'iso'});
    assert.equal(noFormat.ok,false);
    assert(noFormat.errors.some(x=>x.includes('date')));
    const clash=this.review(imports.parseText(csv.replace('O02,PO review','O01,PO review')),
      user);
    assert.equal(clash.ok,false);
    const multi=this.review(imports.parseText(csv.replace('G08-STYLE,PO-G08,1200,22/11/2026,16/10/2026,O02',
      'G08-STYLE,OTHER-PO,1200,22/11/2026,16/10/2026,O02')),user);
    assert.equal(multi.ok,false);
    assert(multi.errors.some(x=>x.includes('More than one order')));
    const unknown=imports.parseText(csv.replace('O02,PO review','NEW-77,New custom activity'));
    const notMatched=this.review(unknown,user);
    assert.equal(notMatched.ok,false);
    assert.equal(notMatched.unmatched.length,1);
    const custom=this.review(unknown,user,{taskOverrides:{3:'custom'}});
    assert.equal(custom.ok,true,custom.errors.join(' / '));
    assert(custom.plan.tasks.some(t=>t.templateRef==='CUSTOM-IMPORT-3'));
    assert.equal(custom.plan.edges.length,1);
    const ignored=this.review(unknown,user,{taskOverrides:{3:'ignore'}});
    assert.equal(ignored.ok,true,ignored.errors.join(' / '));
    assert.equal(ignored.summary.ignored,1);
    const missingPredecessor=this.review(imports.parseText(csv.replace(',O01,3,in-progress',
      ',UNLISTED,3,in-progress')),user);
    assert.equal(missingPredecessor.ok,false);
    assert(missingPredecessor.errors.some(x=>x.includes('Unknown predecessor')));
    const cyclic=this.review(imports.parseText(csv.replace(
      '17/10/2026,,2,not-started','17/10/2026,O02,2,not-started')),user);
    assert.equal(cyclic.ok,false);
    assert(cyclic.errors.some(x=>x.includes('cycle')));
    const approvals=this.review(imports.parseText(csv.replace('3,in-progress','3,approved')),user);
    assert.equal(approvals.ok,false);
    assert(approvals.errors.some(x=>x.includes('separate verified action')));
    const noDeps=this.review(stage,user,{dependencyMode:''});
    assert.equal(noDeps.ok,false);
    assert(noDeps.errors.some(x=>x.includes('dependency')));
    const sourceNoLinks=this.review(stage,user,{dependencyMode:'none'});
    assert.equal(sourceNoLinks.ok,true);
    assert.equal(sourceNoLinks.plan.edges.length,0);
    assert.equal(JSON.stringify(storage.loadPlan(old.recordId,user)),oldSaved);
    assert.equal(storage.listPlans(user).length,2);
    console.log('TNA G08 PASS: reviewed CSV and real two-sheet XLSX, explicit date/dependency/task mapping, unmatched custom/ignore, formula/macro/script/duplicates/cycles/approval guard, new-ID saved draft and legacy saved-copy recovery, 4-language labels, original saved record immutable.');
  }
}
TnaG08ReviewedImportProof.run();
