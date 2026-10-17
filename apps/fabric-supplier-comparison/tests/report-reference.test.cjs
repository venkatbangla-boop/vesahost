/* APP-12 M3 exact material source and non-authoritative report Excel/HTML tests, all synthetic. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),memory=new Map(),store={
 getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const ctx={module:{exports:{}},localStorage:store,Date,Math,JSON,BigInt};ctx.globalThis=ctx;vm.createContext(ctx);
for(const s of ['src/domain/quote-normalization.js','src/domain/comparability-gate.js','src/domain/landed-scenario.js',
 'src/domain/reviewed-reference.js','src/data/saved-copy-codec.js','src/data/local-record-port.js','src/reports/report-model.js'])
 vm.runInContext(fs.readFileSync(path.join(base,s),'utf8'),ctx,{filename:s});
const Q=ctx.VesaSupplierQuote,G=ctx.VesaSupplierComparability,L=ctx.VesaSupplierLanded,
 Ref=ctx.VesaSupplierReviewedReference,C=ctx.VesaSupplierCopyCodec,S=ctx.VesaSupplierLocalStore,R=ctx.VesaSupplierReportModel;
const fabric={article:'SYN PIQUE',composition:'SYN 100% COTTON',gsm:'210',width:'68',widthUnit:'in',
 construction:'PIQUE KNIT',shrinkageBasis:'SYN LAB WASH',shrinkage:'4',
 sourceRef:'SYN ORIGINAL TECH',reviewedBy:'SYN QA',reviewDate:'2026-10-17',
 requestedTradeTerm:'FOB',requestedDeliveryTerm:'SYN DELIVERY'};
let p=Q.create(fabric);p.mode='local';
p=Q.append(p,'offer',{id:'SYN-OFFER-1',supplier:'SYN SUPPLIER A',
 article:fabric.article,composition:fabric.composition,gsm:fabric.gsm,width:fabric.width,
 widthUnit:fabric.widthUnit,construction:fabric.construction,shrinkageBasis:fabric.shrinkageBasis,
 shrinkage:fabric.shrinkage,quoteRef:'SYN QUOTE',quoteDate:'2026-10-16',validTo:'2026-11-16',
 unitPrice:'1.2000',currency:'USD',unit:'yd',moq:1000,moqUnit:'yd',leadDays:28,
 tradeTerm:'FOB',origin:'SYN ORIGIN',deliveryTerm:'SYN DELIVERY',
 specSourceRef:'SYN SUPPLIER SPEC',qualitySourceRef:'SYN QC',qualityEquivalence:'locally-reviewed-equivalent',
 qualityReviewedBy:'SYN SOURCING',qualityReviewDate:'2026-10-17',sourceRef:'SYN OFFER EVIDENCE'});
const charge=(kind,amount)=>({state:'amount',amount,unit:'yd',currency:'USD',
 sourceRef:'SYN '+kind+' RATE',reviewedBy:'SYN FINANCE',reviewDate:'2026-10-17'});
p=Q.append(p,'scenario',{id:'SYN-SC-1',offerId:'SYN-OFFER-1',
 asOfDate:'2026-10-17',targetUnit:'yd',targetCurrency:'USD',rounding:'half-up-4',
 sourceRef:'SYN LANDED BASIS',reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',
 charges:{freight:charge('FREIGHT','0.2000'),duty:charge('DUTY','0.1000'),
  tax:charge('TAX','0.0500'),lc:charge('LC','0.0500')}});
const legacy=C.encode(p);assert.equal(C.decode(legacy).manualReferences,undefined,'M2 no-ref saved copy valid');
const ref=(kind,extra={})=>({
 sourceApp:kind==='tech'?'VESA Tech Pack & Spec 360':'VESA Fabric & Trims 360',
 recordType:kind==='tech'?'TechPackSpecSnapshot':'MaterialReadiness',
 recordId:'SYN-'+kind+'-1',revisionId:'R2',sourceDate:'2026-10-16',
 verifiedBy:'SYN SOURCE REVIEWER',verifiedAt:'2026-10-17T08:00:00Z',
 displaySnapshot:{materialSpec:{...fabric},sourceOnly:true},...extra});
const tech=ref('tech'),mat=ref('material');
assert(Ref.sourceValid(tech,'tech'));assert(Ref.sourceValid(mat,'material'));
assert(!Ref.sourceValid(tech,'material'));assert(!Ref.sourceValid(mat,'tech'));
const reviewer={localReviewer:'SYN INDEPENDENT LOCAL SOURCE REVIEWER',localReviewDate:'2026-10-17',identityConfirmed:true};
assert.throws(()=>Ref.append(p,'tech',ref('tech',{displaySnapshot:{materialSpec:{...fabric,gsm:'180'}}}),reviewer),/Exact matching Tech Pack/);
assert.throws(()=>Ref.append(p,'material',ref('material',{displaySnapshot:{materialSpec:{...fabric,width:'72'}}}),reviewer),/Exact matching Tech Pack/);
assert.throws(()=>Ref.append(p,'tech',tech,{...reviewer,identityConfirmed:false}),/human reviewer/);
p=Ref.append(p,'tech',tech,reviewer);p=Ref.append(p,'material',mat,reviewer);
assert.equal(p.manualReferences.length,2);
assert.throws(()=>Ref.append(p,'tech',tech,reviewer),/Duplicate manually reviewed material source revision/);
const local=new S('synthetic@invalid.example');local.save(p);
const prior=JSON.stringify(local.load(p.id));
const bad=Q.copy(p);bad.manualReferences[0].source.displaySnapshot.materialSpec.composition='NOT MATCH';
assert.equal(Q.validate(bad).ok,false);assert.throws(()=>local.save(bad),/Local spec source/);
const rehashed=JSON.parse(C.encode(p));rehashed.record.manualReferences[1].source.displaySnapshot.materialSpec.width='90';
rehashed.hash=C.hash(JSON.stringify(rehashed.record));
assert.throws(()=>C.decode(JSON.stringify(rehashed)),/Local spec source/);
assert.equal(JSON.stringify(local.load(p.id)),prior,'Invalid user source must never mutate local records');
assert.equal(C.decode(legacy).manualReferences,undefined,'Older untouched portable source has no injected reference');
const rows=R.rows(p,'2026-10-17');
assert.equal(rows['Supplier Source Offers'][1][13],'1.2000');
assert.equal(rows['Landed Source Scenarios'][1][7],'1.6000');
assert.equal(rows['Conditional Price Order'][1][1],'SYN-OFFER-1');
assert.equal(rows['Reviewed Source Snapshots'].length,3);
assert.equal(R.excelRows('Supplier Source Offers',rows['Supplier Source Offers'])[1][13],1.2);
assert.equal(R.excelRows('Landed Source Scenarios',rows['Landed Source Scenarios'])[1][7],1.6);
assert.equal(R.excelRows('Supplier Source Offers',rows['Supplier Source Offers'])[1][16],1000);
assert.equal(R.formulaSafe('=SUM(A1)'),"'=SUM(A1)");
assert.equal(R.formulaSafe('@cmd'),"'@cmd");
const hostile=Q.copy(p);hostile.requirement.sourceRef='<img src=x onerror=1>';
const html=R.html(hostile,'2026-10-17');
assert(html.includes('&lt;img src=x onerror=1&gt;')&&!html.includes('<img src=x'));
assert(html.includes('NOT supplier certification'));
assert.throws(()=>R.rows(p,'2026-02-30'),/exact as-of date/);
assert.equal(L.comparison(p,'2026-10-17').winner,null);
console.log('FABRIC SUPPLIER M3 REPORT/REFERENCE PASS: old saved copies, typed exact spec source/ref validation, duplicate/mismatch/tamper atomicity, HTML escaping, numeric/formula-safe Excel and no auto supplier approval.');
