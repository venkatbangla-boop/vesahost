/** APP-01 deterministic source-only packing/calculation, persistence and export tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
class PackingEngineProof{
 static runtime(){
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
  const match=html.match(/<script>\s*(\(function\(root\)[\s\S]*?)<\/script>/);
  assert(match,'Domain must be accessible inside one HTML.');
  const data=new Map(),localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  const ctx={module:{exports:{}},localStorage,Date,Math,JSON};ctx.globalThis=ctx;
  vm.runInNewContext(match[1],ctx,{filename:'app01-inline.js'});
  return {...ctx.module.exports,data};
 }
 static test(){
  const {PackingMath:M,PackingStore:S,PackingReport:R,data}=this.runtime();
  assert.equal(M.cartonsNeeded(101,30),4);assert.equal(M.cartonsNeeded(90,30),3);
  assert.equal(M.cartonsNeeded(90,0),null);assert.equal(M.validDate('2026-02-30'),false);
  assert.equal(M.validDate('2026-10-16'),true);
  assert.equal(M.m(1000,'mm'),1);assert(Math.abs(M.m(10,'in')-.254)<1e-12);
  assert(Math.abs(M.kg(10,'lb')-4.5359237)<1e-8);
  const p=M.sample(),snapshot=JSON.stringify(p),calc=M.analyze(p);
  assert.equal(calc.ok,true,calc.errors.join(','));
  assert.equal(calc.totalPieces,180);assert.equal(calc.totalCartons,6);
  assert(Math.abs(calc.totalCbm-.432)<1e-9);assert.equal(calc.totalGrossKg,66);
  assert.equal(calc.totalRemaining,0);
  assert.equal(JSON.stringify(p),snapshot,'No source mutation allowed.');
  const rows=R.rows(p,calc);assert.equal(rows['Carton List'][1][0],'0001');
  assert.equal(rows['Carton List'][6][0],'0006');
  const partial=JSON.parse(snapshot);partial.orderLines[0].quantity=125;partial.orderLines[1].quantity=65;
  partial.packConfigs[0].cartonEnd='0007';
  partial.packConfigs[0].partialComposition=[{lineId:'L1',pieces:5},{lineId:'L2',pieces:5}];
  partial.packConfigs[0].partialGrossWeight=4.5;
  const mixed=M.analyze(partial);assert.equal(mixed.ok,true,mixed.errors.join(','));
  assert.equal(mixed.totalPieces,190);assert.equal(mixed.totalCartons,7);
  assert(Math.abs(mixed.totalCbm-.504)<1e-9);assert.equal(mixed.totalGrossKg,70.5);
  assert.equal(R.rows(partial,mixed)['Carton List'][7][3],10);
  partial.packConfigs[0].partialGrossWeight=null;assert.equal(M.analyze(partial).totalGrossKg,null);
  const over=JSON.parse(snapshot);over.orderLines[0].quantity=90;assert(!M.analyze(over).ok);
  const overlap=JSON.parse(snapshot);overlap.packConfigs.push({...overlap.packConfigs[0],id:'PACK2'});
  assert(M.analyze(overlap).errors.some(e=>e.includes('overlap')));
  const wrong=JSON.parse(snapshot);wrong.packConfigs[0].cartonEnd='0007';assert(!M.analyze(wrong).ok);
  const zero=JSON.parse(snapshot);zero.cartonSpecs[0].length=0;assert(!M.analyze(zero).ok);
  const badQty=JSON.parse(snapshot);badQty.orderLines.push({...badQty.orderLines[0],id:'DUPE'});
  assert(!M.analyze(badQty).ok);
  const scen={id:'SC1',name:'SYNTHETIC 40HC',type:'40HC SAMPLE ONLY',length:1200,width:235,height:260,
   doorWidth:220,doorHeight:235,unit:'cm',payload:20000,weightUnit:'kg',
   headroomPercent:10,sourceRef:'SYNTHETIC TEST',verifiedBy:'SYNTHETIC REVIEWER',sourceConfirmed:false};
  const s=JSON.parse(snapshot);s.containerScenarios=[scen];
  assert.equal(M.analyze(s).containers[0].status,'Needs Information');
  scen.sourceConfirmed=true;
  assert.equal(M.analyze(s).containers[0].volumeEligible,true,'Confirmed synthetic record permits only mathematical checks.');
  s.containerScenarios[0].sourceConfirmed=true;
  assert.equal(M.analyze(s).containers[0].volumeEligible,true);
  assert.equal(M.analyze(s).containers[0].weightEligible,true);
  assert.equal(M.analyze(s).containers[0].doorEligible,true);
  assert.match(M.analyze(s).containers[0].status,/physical fit not verified/i);
  s.containerScenarios[0].payload=50;assert.equal(M.analyze(s).containers[0].weightEligible,false);
  s.containerScenarios[0].payload=20000;
  s.containerScenarios[0].doorWidth=20;assert.equal(M.analyze(s).containers[0].doorEligible,false);
  s.containerScenarios[0].doorWidth=220;
  s.loadEntries=[{id:'LD1',scenarioId:'SC1',configId:'P1',cartonCount:7,date:'2026-10-16',evidenceRef:'TEST'}];
  assert(!M.analyze(s).ok);s.loadEntries[0].cartonCount=1;assert(M.analyze(s).ok);
  const doubleLoad=JSON.parse(snapshot);
  doubleLoad.containerScenarios=[
   {id:'SC1',name:'SYNTHETIC A',type:'20ft test',sourceConfirmed:false},
   {id:'SC2',name:'SYNTHETIC B',type:'20ft test',sourceConfirmed:false}];
  doubleLoad.loadEntries=[
   {id:'LOAD-A',scenarioId:'SC1',configId:'P1',cartonCount:4,
     date:'2026-10-16',evidenceRef:'SOURCE-A'},
   {id:'LOAD-B',scenarioId:'SC2',configId:'P1',cartonCount:3,
     date:'2026-10-16',evidenceRef:'SOURCE-B'}];
  assert(M.analyze(doubleLoad).errors.some(e=>e.includes('across all container')),
    'One carton lot must never be loaded twice across alternative scenarios.');
  doubleLoad.loadEntries[1].cartonCount=2;
  assert.equal(M.analyze(doubleLoad).ok,true,'Exact six cartons may be reconciled across entries.');
  const store=new S('test@example.org'),valid=JSON.parse(snapshot);
  valid.mode='local';store.save(valid);const persisted=data.get(store.key);
  const token=S.encode(valid);assert.deepEqual(JSON.parse(JSON.stringify(S.decode(token))),valid);
  assert.throws(()=>S.decode(token.replace('"0001"','"9001"')),/altered/);
  assert.throws(()=>S.decode('{}'),/not supported/);
  assert.equal(data.get(store.key),persisted,'Bad restore must not touch saved data.');
  assert.equal(R.csvSafe('=1+2'),"'=1+2");
  assert.equal(R.csvSafe('-SHEET'),"'-SHEET");
  assert.equal(R.csvSafe('@HYPERLINK'),"'@HYPERLINK");
  assert.equal(R.csvSafe(15),15);
  console.log('APP-01 DOMAIN PASS: cm/mm/in kg/lb, mixed/partial, carton ID zeroes, overship, overlap, CBM, source container gating, loading, bad restore and spreadsheet safety.');
 }
}
PackingEngineProof.test();
