/** APP-03 tests: garment POMs and signed grade paths with no assumed buyer policy. */
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
class TechPackUnitProof {
 static load(){
  const source=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
  const code=source.match(/<script>\s*(\(function\(global\)[\s\S]*?)<\/script>/);
  assert(code,'Single HTML must contain independently testable domain engine.');
  const store=new Map(),localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const ctx={module:{exports:{}},localStorage,Date,Math,JSON};ctx.globalThis=ctx;
  vm.runInNewContext(code[1],ctx,{filename:'apps/tech-pack-spec/index.html'});
  return {...ctx.module.exports,store};
 }
 static prove(){
  const {GarmentSpecEngine:E,TechSpecStore:S,TechSpecReport:R,store,VERSION}=this.load();
  assert.equal(VERSION,'VESA-TECHSPEC-1');
  const blank=E.make({style:'TEST-STYLE',fabric:'SYNTHETIC FABRIC',category:'T-shirt',
   gender:'Men',season:'TEST',sourceRef:'MOCK SOURCE',
   sizes:['S','M','L','XL','XXL'],baseSize:'M',precision:2,rounding:'half-up'});
  assert.equal(E.validate(blank).ok,true);
  assert.equal(E.project(blank).cells.length,0);
  assert.equal(E.scaled('1.23456'),null);
  assert.equal(E.scaled('-1.5000',true),-15000n);
  assert.equal(E.text(E.scaled('1.235'),2,'half-up'),'1.24');
  assert.equal(E.text(E.scaled('1.235'),2,'down'),'1.23');
  assert.equal(E.date('2026-02-30'),false);assert.equal(E.date('2026-10-17'),true);
  const sample=E.practice(),original=JSON.stringify(sample),project=E.project(sample);
  assert.equal(E.validate(sample).ok,true);
  assert.deepEqual(JSON.parse(JSON.stringify(project.cells.map(x=>x.target))),['48.00','50.00','52.00']);
  assert.deepEqual(JSON.parse(JSON.stringify(project.cells.map(x=>x.lower))),['47.00','49.00','51.00']);
  assert.deepEqual(JSON.parse(JSON.stringify(project.cells.map(x=>x.upper))),['49.50','51.50','53.50']);
  assert.equal(project.cells[0].basis,'flat');
  assert.equal(JSON.stringify(sample),original,'Pure projection cannot mutate a POM.');
  const noGrade=JSON.parse(original);noGrade.grades[0].reviewed=false;
  assert.equal(E.project(noGrade).cells[0].target,null,'Grade without written review cannot infer smaller sizes.');
  assert.equal(E.project(noGrade).cells[1].target,'50.00','Base POM stays separate.');
  const noBase=JSON.parse(original);noBase.poms[0].baseReviewed=false;
  assert(E.project(noBase).cells.every(x=>x.target===null),'No reviewed base must suppress all targets.');
  const noTolerance=JSON.parse(original);noTolerance.poms[0].toleranceReviewed=false;
  assert(E.project(noTolerance).cells.every(x=>x.lower===null),'Tolerance without review is Needs Information.');
  const duplicate=JSON.parse(original);duplicate.poms.push({...duplicate.poms[0],id:'P2'});
  assert(E.validate(duplicate).errors.some(x=>x.includes('Duplicate')));
  const duplicatedGrades=JSON.parse(original);duplicatedGrades.grades.push({...duplicatedGrades.grades[0],id:'G3'});
  assert(!E.validate(duplicatedGrades).ok);
  const wrongGrade=JSON.parse(original);wrongGrade.grades[0].toSize='L';
  assert(!E.validate(wrongGrade).ok);
  const mismatchedUnit=JSON.parse(original);mismatchedUnit.grades[0].unit='in';
  assert(!E.validate(mismatchedUnit).ok);
  const invalidPrecision=JSON.parse(original);invalidPrecision.meta.precision=null;
  assert(!E.validate(invalidPrecision).ok);
  const missingSource=JSON.parse(original);missingSource.poms[0].baseSource='';
  assert(!E.validate(missingSource).ok);
  const outIn=E.project(sample,{unit:'in'}).cells[1];
  assert.equal(outIn.unit,'in');
  assert.equal(outIn.target,'19.69');
  const cm=E.scaled('50.0000'),roundTrip=E.convert(E.convert(cm,'cm','in'),'in','cm');
  assert((roundTrip-cm<=1n&&roundTrip-cm>=-1n),'Four-decimal unit conversion roundtrip must retain precision.');
  const noConvert=E.project(sample,{basis:'circumference'}).cells[1];
  assert.equal(noConvert.target,null,'Never infer garment flat↔circumference.');
  const girth=JSON.parse(original);
  Object.assign(girth.poms[0],{conversionReviewed:true,
   conversionSource:'SYNTHETIC 2X GIRTH RULE',conversionBy:'Test Reviewer'});
  assert.equal(E.validate(girth).ok,true);
  assert.equal(E.project(girth,{basis:'circumference'}).cells[1].target,'100.00');
  const manual=JSON.parse(original);manual.mode='local';
  manual.revisions=[{id:'REV1',recordRevision:1,recordedAt:'2026-10-17T00:00:00Z',
    approver:'Synthetic approver',evidenceRef:'SYNTHETIC SIGNED REV',effectiveDate:'2026-10-17',
    snapshot:{meta:JSON.parse(JSON.stringify(manual.meta)),poms:JSON.parse(JSON.stringify(manual.poms)),
     grades:JSON.parse(JSON.stringify(manual.grades)),bom:JSON.parse(JSON.stringify(manual.bom))}}];
  assert.equal(E.validate(manual).ok,true);
  const frozen=JSON.stringify(manual.revisions[0]);
  manual.poms[0].baseValue='51.0';
  assert.equal(JSON.stringify(manual.revisions[0]),frozen);
  const changes=E.compare(manual,manual.revisions[0]);
  assert(changes.some(x=>x.field==='poms'));
  const local=new S('synthetic@vesa.test');local.save(manual);
  assert.equal(local.load(manual.id).poms[0].baseValue,'51.0');
  const packet=S.encode(manual);
  assert.deepEqual(JSON.parse(JSON.stringify(S.decode(packet))),manual);
  assert.throws(()=>S.decode(packet.replace('"51.0"','"41.0"')),/altered/);
  assert.throws(()=>S.decode('{}'),/unsupported/);
  const snapshot=store.get(local.key);
  const legacy=JSON.parse(JSON.stringify(manual));legacy.version='NOT-ALLOWED';
  assert.throws(()=>local.save(legacy),/Unsupported/);
  assert.equal(store.get(local.key),snapshot,'Malformed import/save cannot overwrite local data.');
  assert.equal(R.excelRows([['Text'],['=SYNTHETIC']], 'Order Source')[1][0],"'=SYNTHETIC");
  const rows=R.sheets(manual,E.project(manual),changes);
  assert.deepEqual(Object.keys(rows),['Measurement Specification','Grading','Tolerance Matrix',
   'BOM Construction','Revision Comparison','Revision History','Order Source']);
  const excel=R.excelRows(rows['Measurement Specification'],'Measurement Specification');
  assert.equal(excel[2][4],51,'Base POM output is typed numeric.');
  console.log('APP-03 DOMAIN PASS: source POM, signed S/M/L grading, asymmetric tolerances, cm/in and explicit girth conversion, missing policies, immutable revisions, checksum-copy and typed Excel.');
 }
}
TechPackUnitProof.prove();
