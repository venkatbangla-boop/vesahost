/**
 * VESA TNA GMR-07 R04: deterministic, deliberately bounded operator-reviewed
 * critical path. No background calendar assumptions or fake buyer approvals.
 */
'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const domain=require('../src/domain.js');
const scheduling=require('../src/scheduling.js');
const critical=require('../src/critical-path-report.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');
const sheetNames=['Report Summary','Order Summary','Report Activities','Critical Path',
  'Predecessor Links','Gate Issues','CPM Review','Report Notes'];
const review={startAnchor:'orderConfirmedOn',weekKey:'mon-fri',exceptionDates:'',
 calendarConfirmed:true,durationsReviewed:true,dependenciesReviewed:true,endpointReviewed:true};
function fixture(profile='knit',required='2026-10-19'){
 const plan=domain.createPlan({templateId:profile,buyerName:'SYNTHETIC CPM BUYER',
  factoryName:'SYNTHETIC CPM FACTORY',styleNo:'R04-MODEL',poNumber:'PO-CPM',
  totalQty:1000,orderConfirmedOn:'2026-10-12',poReceivedOn:'2026-10-13',
  buyerRequiredExFactory:required},{ownerUserId:'qa-cpm'});
 const refs=['O01','D05','D08','S04'];
 const taskMap=new Map(plan.tasks.map(t=>[t.templateRef,t]));
 plan.tasks=refs.map((ref,i)=>{
  const task=taskMap.get(ref);
  assert.ok(task,profile+' requires '+ref);
  task.durationUnits=[2,3,2,1][i];
  task.durationBasis='working';
  task.status='not-started';
  return task;
 });
 const id=ref=>taskMap.get(ref).taskId;
 plan.edges=[['O01','D05'],['O01','D08'],['D05','S04'],['D08','S04']].map(([a,b],i)=>({
  edgeId:'cpm-'+i,predecessorTaskId:id(a),successorTaskId:id(b),relation:'FS',
  lagUnits:0,lagBasis:'working',calendarPolicy:'successor'
 }));
 plan.validation=domain.validatePlan(plan);
 assert.equal(plan.validation.ok,true,plan.validation.errors.join('; '));
 return plan;
}
function m(plan,extra={},language='en'){
 return reports.buildReportModel(plan,{reportId:'R04',language,
  generatedAt:'2026-10-15T06:00:00.000Z',timezone:'Asia/Dhaka',
  criticalReview:{...review,...extra}});
}
test('R04 requires an actual source start, reviewed working week/exceptions/durations/FS links and ex-factory event',()=>{
 const p=fixture(),before=JSON.stringify(p);
 const blank=reports.buildReportModel(p,{reportId:'R04'});
 assert.equal(blank.criticalPath.ready,false);
 assert.deepEqual(blank.tasks,[]);
 assert.equal(blank.criticalPath.forecastDate,null);
 assert.equal(blank.criticalPath.bufferWorkdays,null);
 assert.throws(()=>storage.exportReportWorkbook(blank),/source|review|CPM|Critical/i);
 const modifications=[
  {startAnchor:'bad-start'}, {startAnchor:''}, {weekKey:''},
  {calendarConfirmed:false},{durationsReviewed:false},
  {dependenciesReviewed:false},{endpointReviewed:false},
  {exceptionDates:'2026-02-30'},{exceptionDates:'2026-10-15;2026-10-15'},
  {nearCriticalDays:'nan'},{nearCriticalDays:'-2'},{nearCriticalDays:'61'}
 ];
 for(const change of modifications){
  const model=m(p,change);
  assert.equal(model.criticalPath.ready,false,JSON.stringify(change));
  assert.equal(model.criticalPath.forecastDate,null);
  assert.equal(model.tasks.length,0);
  assert.throws(()=>storage.exportReportWorkbook(model),/source|review|CPM|Critical/i);
 }
 assert.equal(JSON.stringify(p),before,'no gate attempt mutates source');
});
test('real knit and woven source branch CPM-01 has exact FS/0 controlling chain and C float',()=>{
 for(const profile of ['knit','woven']){
  const p=fixture(profile),before=JSON.stringify(p);
  for(const language of ['en','bn','hi','ta']){
   const model=m(p,{nearCriticalDays:'1'},language);
   const cp=model.criticalPath;
   assert.equal(cp.ready,true,language+' '+profile+' '+cp.missingInputs.join('; '));
   assert.equal(cp.engineVersion,scheduling.ENGINE_VERSION);
   assert.equal(cp.endpointRef,'S04');
   assert.equal(cp.startDate,'2026-10-12');
   assert.equal(cp.requiredDate,'2026-10-19');
   assert.equal(cp.forecastDate,'2026-10-19');
   assert.equal(cp.bufferWorkdays,0);
   assert.equal(cp.workingWeek,'Monday–Friday');
   assert.deepEqual(cp.criticalChains,[['O01','D05','S04']],
     'independent driving chain must pick longer sampling route');
   assert.equal(cp.rows.length,4);
   const byRef=new Map(cp.rows.map(row=>[row.ref,row]));
   assert.equal(byRef.get('O01').earlyStart,'2026-10-12');
   assert.equal(byRef.get('O01').earlyFinish,'2026-10-13');
   assert.equal(byRef.get('D05').earlyStart,'2026-10-14');
   assert.equal(byRef.get('D05').earlyFinish,'2026-10-16');
   assert.equal(byRef.get('D08').earlyFinish,'2026-10-15');
   assert.equal(byRef.get('D08').totalFloat,1);
   assert.equal(byRef.get('D08').nearCritical,true,'threshold 1 is explicit source review');
   assert.equal(byRef.get('D08').drivesExFactory,false);
   assert.equal(byRef.get('S04').earlyFinish,'2026-10-19');
   assert.equal(model.masterSheet,null);
   assert.equal(model.tasks.length,4);
   assert.deepEqual(model.tasks.map(t=>t.status),['not-started','not-started','not-started','not-started']);
   assert.ok(cp.warnings.some(s=>s.includes(cp.labels.notProduction)));
   assert.ok(cp.labels.headingDrivers&&cp.labels.tf&&cp.labels.ff&&cp.labels.forecast);
  }
  assert.equal(JSON.stringify(p),before,'reports must not modify source plan');
 }
});
test('date-missed source due, explicitly reviewed holidays and slack retain signed buffer',()=>{
 const p=fixture('woven'),before=JSON.stringify(p);
 let cp=m(p,{exceptionDates:'2026-10-15'}).criticalPath;
 assert.equal(cp.ready,true);
 assert.equal(cp.forecastDate,'2026-10-20');
 assert.equal(cp.bufferWorkdays,-1,'one reviewed working-day late, no baseline mutation');
 assert.equal(cp.rows.find(row=>row.ref==='S04').totalFloat,-1);
 assert.equal(cp.criticalChains[0].join('>'),'O01>D05>S04');
 assert.ok(cp.warnings.some(w=>w.includes(cp.labels.negative)));
 const early=fixture('woven','2026-10-21');
 cp=m(early).criticalPath;
 assert.equal(cp.ready,true);
 assert.equal(cp.forecastDate,'2026-10-19');
 assert.equal(cp.bufferWorkdays,2,'available buffer must not erase driving chain');
 assert.deepEqual(cp.criticalChains,[['O01','D05','S04']]);
 cp=m(p,{weekKey:'sun-thu'}).criticalPath;
 assert.equal(cp.ready,true,'source-reviewed Bangladesh workweek choice is supported');
 assert.notEqual(cp.workingWeek,'Monday–Friday');
 assert.equal(JSON.stringify(p),before);
});
test('gate conditions stay labelled as source-reported, never grant false approval',()=>{
 const p=fixture();
 const fit=p.tasks.find(task=>task.templateRef==='D08');
 fit.status='awaiting-approval';
 const entry=m(p).criticalPath;
 assert.equal(entry.ready,true);
 assert.ok(entry.gateIssues.some(issue=>issue.ref==='D08'&&issue.status==='awaiting-approval'));
 assert.ok(entry.warnings.some(w=>w.includes(entry.labels.headingGates)));
 fit.status='approved';
 fit.proofRefs=[];
 const evidence=m(p).criticalPath;
 assert.ok(evidence.gateIssues.some(issue=>issue.ref==='D08'));
 fit.proofRefs=['REVIEWED-FIT-DECISION-REF'];
 assert.ok(!m(p).criticalPath.gateIssues.some(issue=>issue.ref==='D08'));
});
test('mixed dependency relations, lag, actuals, multi-calendar, orphan tasks and split lots fail closed',()=>{
 function blocked(mutate,label){
  const p=fixture();const src=JSON.stringify(p);mutate(p);
  const before=JSON.stringify(p);
  const c=m(p).criticalPath;
  assert.equal(c.ready,false,label);
  assert.equal(c.forecastDate,null,label);
  assert.equal(c.bufferWorkdays,null,label);
  assert.ok(c.missingInputs.length||c.unsupported.length,label+' must explain why unavailable');
  assert.deepEqual(c.criticalChains,[]);
  assert.equal(JSON.stringify(p),before,label+' must be pure');
  assert.notEqual(JSON.stringify(p),src,label+' test mutation must actually be effective');
 }
 blocked(p=>{p.edges[0].relation='SS';},'mixed SS');
 blocked(p=>{p.edges[0].relation='FF';},'mixed FF');
 blocked(p=>{p.edges[0].relation='SF';},'mixed SF');
 blocked(p=>{p.edges[0].lagUnits=2;},'nonzero lag');
 blocked(p=>{p.edges[0].lagUnits=-1;p.edges[0].allowLead=true;},'negative lead');
 blocked(p=>{p.tasks[0].durationUnits=null;},'unknown duration');
 blocked(p=>{p.tasks[1].durationBasis='calendar';},'different day basis');
 blocked(p=>{p.tasks[0].calendarId='supplier';},'mixed calendars');
 blocked(p=>{p.tasks[0].dates.actualFinish='2026-10-13';},'actuals ignored by schedule engine');
 blocked(p=>{p.constraints.push({type:'fixed-start',date:'2026-10-14'});},'fixed constraints');
 blocked(p=>{p.shipmentLots.push({lotId:'LOT-A',plannedQty:1});},'split lot');
 blocked(p=>{const extra=domain.createPlan({templateId:'knit'}).tasks.find(x=>x.templateRef==='O03');p.tasks.push(extra);},'orphan before S04');
 blocked(p=>{p.tasks=p.tasks.filter(t=>t.templateRef!=='S04');},'missing ex-factory endpoint');
});
test('R04 spreadsheet genuinely typed, source-escaped and identical to R04 model across four locales',()=>{
 const p=fixture('knit'),before=JSON.stringify(p);
 const late=p.tasks.find(t=>t.templateRef==='D05');
 late.title=' =HYPERLINK("https://invalid.example","test")';
 for(const language of ['en','bn','hi','ta']){
  const model=m(p,{},language);
  assert.equal(model.criticalPath.ready,true);
  const book=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellStyles:true,cellFormula:true});
  assert.deepEqual(book.SheetNames,sheetNames);
  const pathRows=XLSX.utils.sheet_to_json(book.Sheets['Critical Path'],{header:1,raw:true});
  const row=pathRows.find(r=>r[0]==='D05');
  assert.ok(row);
  for(const i of [4,5,6,7])assert.equal(typeof row[i],'number','CPM cells must be real Excel date serials');
  assert.equal(row[8],0,'total float must be numeric');
  assert.equal(row[9],0,'free float must be numeric');
  assert.ok(row[1].trimStart().startsWith("'"),'untrusted title must not be Excel formula');
  const main=XLSX.utils.sheet_to_json(book.Sheets['Report Summary'],{header:1,raw:true});
  const required=main.find(r=>r[0]===model.criticalPath.labels.required);
  assert.ok(required&&typeof required[1]==='number');
  const sheet=book.Sheets['Critical Path'];
  assert.equal(sheet['!autofilter'].ref,sheet['!ref']);
  const links=XLSX.utils.sheet_to_json(book.Sheets['Predecessor Links'],{header:1,raw:true});
  assert.equal(links.length,5);
  assert.ok(links.some(edge=>edge[0]==='D05'&&edge[1]==='S04'&&edge[3]===0));
  for(const [name,ws] of Object.entries(book.Sheets))
   for(const [address,cell] of Object.entries(ws))
    if(!address.startsWith('!'))assert.equal(cell.f,undefined,name+'/'+address+' no formula injection');
 }
 assert.notEqual(JSON.stringify(p),before,'synthetic fixture was intentionally changed before report');
});
test('frozen R01/R02/R03 and R08-R12 report/shipment source and old saved copies remain compatible',()=>{
 const p=fixture(),before=JSON.stringify(p);
 const simple={R01:['Report Summary','Order Summary','Report Activities','Master TNA','Report Notes'],
 R02:['Report Summary','Order Summary','Report Activities','Buyer Milestones','Buyer Actions','Report Notes'],
 R03:['Report Summary','Order Summary','Report Activities','Factory Daily Actions','Missing Action Dates','Report Notes']};
 for(const id of ['R01','R02','R03']){
  const opts={reportId:id,asOfDate:id==='R03'?'2026-10-15':undefined};
  const m=reports.buildReportModel(p,opts);
  assert.equal(m.criticalPath,undefined,id+' isolated');
  assert.deepEqual(XLSX.read(storage.exportReportWorkbook(m),{type:'buffer'}).SheetNames,simple[id]);
 }
 for(const id of reports.catalogue('en').map(x=>x.id).filter(x=>+x.slice(1)>=8)){
  const m=reports.buildReportModel(p,{reportId:id});
  assert.equal(m.criticalPath,undefined);
  assert.deepEqual(XLSX.read(storage.exportReportWorkbook(m),{type:'buffer'}).SheetNames,
   ['Report Summary','Order Summary','Report Activities','Report Notes']);
 }
 const old=domain.createPlan({templateId:'knit',buyerName:'OLD BUYER',factoryName:'OLD FACTORY',
  styleNo:'OLD-STYLE',poNumber:'OLD-PO',totalQty:100,buyerRequiredExFactory:'2026-12-31'});
 assert.deepEqual(storage.importCopy(storage.exportCopy(old)),old);
 assert.equal(JSON.stringify(p),before);
});
