/**
 * GMR-04C: actual XLSX custom garment activities and per-edge FS/SS/FF/SF,
 * signed lag/lead & chosen working/calendar basis. Synthetic records only.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const XLSX=require('../vendor/xlsx.full.min.js');
const domain=require('../src/domain.js');
const scheduling=require('../src/scheduling.js');
const saved=require('../src/storage.js');
const orderImport=require('../src/import-review.js');
const activityImport=require('../src/activity-import.js');
const ORDERS=[
  ['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory'],
  ['SYNTHETIC BUYER','SYNTHETIC FACTORY','SHIRT-900','PO-900',1500,'2026-12-25']
];
const HEADERS=['Activity Ref','Activity','Owner','Planned Start','Planned Finish','Duration',
  'Status','Predecessors','Stage','Task Kind','Remarks','Evidence','Authorizing Party','Source Document'];
const ROWS=[
  ['O01','Enquiry / inquiry received','merchant','2026-10-01','2026-10-02',0,'in-progress','','','','Buyer enquiry','','',''],
  ['O02','Costing & consumption confirmation','merchant','2026-10-03','2026-10-05',2,'in-progress',
    'O01|SS|+2|working','','','Costing source','','',''],
  ['SAMP-LOCAL','Buyer-nominated sample inspection','sample-room','2026-10-06','2026-10-08',1,'in-progress',
    'O02|FF|1|calendar','D','milestone','Custom checkpoint','','',''],
  ['D05','Fit sample submit','sample-room','2026-10-09','2026-10-11',0,'not-started',
    'SAMP-LOCAL|SF|-1|working','','','Fit scheduled','','','']
];
function fixture(data=ROWS,opts={}){
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ORDERS), 'Orders');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([HEADERS,...data]), 'Activities');
  return orderImport.parseWorkbook(XLSX.write(wb,{type:'buffer',bookType:'xlsx'}),'gmr16-synthetic.xlsx');
}
function review(data=ROWS,options={}){
  const snapshot=fixture(data);
  const orderHeaders=orderImport.describe(snapshot,'Orders',1);
  const orderCheck=orderImport.review(snapshot,{sheetName:'Orders',headerRow:1,recordRow:2,
    mapping:orderHeaders.mapping,dateFormat:'iso',basis:'calendar',templateId:options.templateId||'knit'},[]);
  assert.equal(orderCheck.ready,true,orderCheck.errors.join(' / '));
  const settings={sheetName:'Activities',headerRow:1,
    mapping:activityImport.describe(snapshot,{sheetName:'Activities',headerRow:1}).mapping,
    dateFormat:'iso',durationBasis:'working',fsZeroConfirmed:false,advancedLinksConfirmed:true,
    rowBindings:{4:'__CUSTOM__'},...options};
  const activityCheck=activityImport.review(snapshot,orderCheck,settings);
  return {snapshot,orderCheck,activityCheck,settings};
}
test('actual knit/woven XLSX source can create a custom task with stable source reference and each explicit relation',()=>{
 for(const templateId of ['knit','woven']){
   const {orderCheck,activityCheck,snapshot}=review(ROWS,{templateId});
   assert.equal(activityCheck.ready,true,activityCheck.errors.join('; '));
   assert.equal(activityCheck.edgeCount,3);
   assert.equal(activityCheck.legacyEdgeCount,0);
   assert.equal(activityCheck.advancedEdgeCount,3);
   assert.equal(activityCheck.customRows.length,1);
   const original=orderImport.createNewDraft(orderCheck,{ownerUserId:'qa-owner'});
   const originalJson=JSON.stringify(original),snapshotJson=JSON.stringify(snapshot);
   const result=activityImport.applyToNewDraft(original,activityCheck,{ownerUserId:'qa-owner'});
   assert.equal(JSON.stringify(original),originalJson,'no source draft mutation');
   assert.equal(JSON.stringify(snapshot),snapshotJson,'no source workbook mutation');
   const task=result.tasks.find(t=>t.importSourceRef==='SAMP-LOCAL');
   assert.ok(task,'custom task persisted');
   assert.equal(task.templateRef,'CUSTOM-D-SAMP-LOCAL');
   assert.equal(task.stageCode,'D');
   assert.equal(task.taskKind,'milestone');
   assert.equal(task.applicability,'optional');
   assert.equal(task.durationUnits,1);
   assert.equal(task.ownerParty,'sample-room');
   assert.equal(result.edges.length,3);
   assert.deepEqual(result.edges.map(e=>[e.relation,e.lagUnits,e.lagBasis,e.allowLead||false]),
    [['SS',2,'working',false],['FF',1,'calendar',false],['SF',-1,'working',true]]);
   assert.equal(scheduling.validateGraph(result.tasks,result.edges).ok,true);
   assert.equal(domain.validatePlan(result).ok,true);
   assert.equal(result.revision,0);
   assert.equal(result.recordStatus,'draft');
   assert.equal(result.baselineSnapshots.length,0);
   assert.equal(result.auditEvents.at(-1).details.customSources[0],'SAMP-LOCAL');
   assert.equal(result.auditEvents.at(-1).details.advancedEdgeCount,3);
   assert.equal(result.auditEvents.at(-1).details.originalFileNotStored,true);
   assert.deepEqual(saved.importCopy(saved.exportCopy(result)),result,'version 1.1.0 saved-copy parity');
   assert.throws(()=>activityImport.applyToNewDraft(result,activityCheck),/only once/);
 }
});
test('plain GMR-04B FS/zero link still requires existing separate consent',()=>{
 const withPlain=ROWS.map(row=>row.slice());withPlain[1][7]='O01';
 let parsed=review(withPlain);
 assert.equal(parsed.activityCheck.ready,false);
 assert.ok(parsed.activityCheck.errors.some(s=>s.includes('plain predecessor')));
 parsed=review(withPlain,{fsZeroConfirmed:true});
 assert.equal(parsed.activityCheck.ready,true,parsed.activityCheck.errors.join('; '));
 assert.deepEqual(parsed.activityCheck.edges[0],{source:'O01',target:'O02',relation:'FS',
    lagUnits:0,lagBasis:'working',allowLead:false,mode:'legacy'});
});
test('custom activity must be explicitly selected, never inferred from an unmatched title',()=>{
 const unbound=review(ROWS,{rowBindings:{}});
 assert.equal(unbound.activityCheck.ready,false);
 assert.ok(unbound.activityCheck.unmatched.some(t=>t.sourceKey==='SAMP-LOCAL'));
 const invalid=ROWS.map(row=>row.slice()); invalid[2][8]='';
 assert.ok(review(invalid).activityCheck.errors.some(s=>s.includes('sourced Stage')));
 invalid[2][8]='D';invalid[2][9]='';
 assert.ok(review(invalid).activityCheck.errors.some(s=>s.includes('Task Kind')));
 invalid[2][9]='unknown-kind';
 assert.ok(review(invalid).activityCheck.errors.some(s=>s.includes('Task Kind')));
});
test('mapping a canonical task to a second custom row cannot hijack its identity',()=>{
 const changed=ROWS.map(row=>row.slice());
 changed[2][0]='D05';changed[2][8]='D';changed[2][9]='work';
 assert.equal(review(changed).activityCheck.ready,false);
 assert.ok(review(changed).activityCheck.errors.some(s=>/Existing template activity/.test(s)));
});
test('each advanced edge needs its own relation, signed lag and day basis; no invented values',()=>{
 const bad=[
  ['O01|SS||working',/signed lag/],['O01|SS|2|',/working or calendar/],
  ['O01|XX|2|working',/Unsupported dependency relation/],
  ['O01|SS|many|working',/signed lag/],['O01|SS|2|fortnight',/working or calendar/],
  ['O01|SS|3651|working',/between/],['O01|SS|-3651|working',/between/],
  ['O01|SS|2',/REF\|FS\/SS\/FF\/SF/],['O01|SS|2|working;O01|FS|0|calendar',/Duplicate predecessor/]
 ];
 for(const [edge,expected] of bad){
   const altered=ROWS.map(row=>row.slice());altered[1][7]=edge;
   const checked=review(altered).activityCheck;
   assert.equal(checked.ready,false,edge);
   assert.ok(checked.errors.some(e=>expected.test(e)),edge+' '+checked.errors.join(' / '));
 }
});
test('advanced links are refused without a separate source-confirmation checkbox',()=>{
 const out=review(ROWS,{advancedLinksConfirmed:false}).activityCheck;
 assert.equal(out.ready,false);
 assert.ok(out.errors.some(e=>/Confirm all explicit dependency/.test(e)));
});
test('unknown, duplicate and self-referenced activity dependencies block the entire import',()=>{
 const cases=[
  [1,'NOT-IN-SHEET|FS|0|working',/unknown\/unmapped predecessor/],
  [1,'O02|FS|0|working',/itself/],
  [1,'O01|SS|2|working;O01|FF|0|working',/Duplicate predecessor/]
 ];
 for(const [i,link,expected] of cases){
   const altered=ROWS.map(row=>row.slice());altered[i][7]=link;
   const checked=review(altered).activityCheck;
   assert.equal(checked.ready,false);
   assert.ok(checked.errors.some(e=>expected.test(e)),checked.errors.join(' / '));
 }
});
test('reviewed SS/FF/SF source that forms a graph cycle must be rejected before save',()=>{
 const altered=ROWS.map(row=>row.slice());
 altered[0][7]='D05|SS|0|working';
 const out=review(altered).activityCheck;
 assert.equal(out.ready,false);
 assert.ok(out.errors.some(s=>/cycle/.test(s)),out.errors.join(' / '));
});
test('new custom title and stage/kind never override verified existing template tasks',()=>{
 const original=ROWS.map(row=>row.slice());
 original[2][10]='<script>evil()</script>';
 const checked=review(original).activityCheck;
 assert.equal(checked.ready,false);
 assert.ok(checked.errors.some(e=>/unsafe/i.test(e)));
});
test('reviewed dates and status evidence remain separate for custom tasks',()=>{
 const altered=ROWS.map(row=>row.slice());
 altered[2][6]='completed';
 assert.ok(review(altered).activityCheck.errors.some(e=>/Completed task needs actual finish/.test(e)));
 altered[2][6]='approved';
 assert.ok(review(altered).activityCheck.errors.some(e=>/Approval\/waiver requires evidence/.test(e)));
});
test('unsigned-only freeze and revision protections remain operative',()=>{
 const {orderCheck,activityCheck}=review();
 const original=orderImport.createNewDraft(orderCheck,{ownerUserId:'qa'});
 const locked=domain.freezeBaseline(original,{actorId:'qa'});
 assert.equal(locked.ok,true);
 assert.throws(()=>activityImport.applyToNewDraft(locked.plan,activityCheck),/only once/);
 const revised=JSON.parse(JSON.stringify(original));revised.revision=1;
 assert.throws(()=>activityImport.applyToNewDraft(revised,activityCheck),/only once/);
});
test('locales include advanced custom and relationship guidance without translating workbook contents',()=>{
 for(const lang of ['en','bn','hi','ta'])
  for(const key of ['custom','advanced','format','links','customCount'])
   assert.ok(activityImport.LABELS[lang][key],lang+': '+key);
});
