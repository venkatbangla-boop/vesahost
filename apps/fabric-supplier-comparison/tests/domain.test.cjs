/* APP-12 synthetic source evidence: no guessed conversions, charge inclusion, FX or supplier choice. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../src/domain');
const env={module:{exports:{}},Date,Math,JSON,BigInt};env.globalThis=env;vm.createContext(env);
for(const s of ['quote-normalization.js','comparability-gate.js','landed-scenario.js'])
 vm.runInContext(fs.readFileSync(path.join(dir,s),'utf8'),env,{filename:s});
const Q=env.VesaSupplierQuote,G=env.VesaSupplierComparability,L=env.VesaSupplierLanded;
const seed={article:'SYN FABRIC POLO PIQUE',composition:'SYN 100% COTTON',gsm:'210',width:'68.0000',
 widthUnit:'in',construction:'PIQUE KNIT',shrinkageBasis:'SYN TEST AFTER WASH',shrinkage:'4.0000',
 sourceRef:'SYN TECH PACK REV-A',reviewedBy:'SYN LOCAL SOURCE REVIEWER',reviewDate:'2026-10-17',
 requestedTradeTerm:'FOB',requestedDeliveryTerm:'SYN LOCAL DELIVERY POINT'};
let p=Q.create(seed);
assert.equal(Q.validate(p).ok,true);
assert.equal(Q.parse('1.2500'),12500n);
assert.equal(Q.parse('0.0001'),1n);
assert.equal(Q.parse('0'),null);
assert.equal(Q.parse('-1.0000'),null);
assert.equal(Q.parse('1.23456'),null);
assert.equal(Q.fmt(12505n),'1.2505');
const offer=(id,price='1.2000',changes={})=>({
 id,supplier:'SYN SUPPLIER '+id,article:seed.article,composition:seed.composition,
 gsm:seed.gsm,width:seed.width,widthUnit:seed.widthUnit,construction:seed.construction,
 shrinkageBasis:seed.shrinkageBasis,shrinkage:seed.shrinkage,
 quoteRef:'SYN QUOTE '+id,quoteDate:'2026-10-16',validTo:'2026-11-30',unitPrice:price,
 currency:'USD',unit:'yd',moq:1000,moqUnit:'yd',leadDays:28,
 tradeTerm:'FOB',origin:'SYN ORIGIN',deliveryTerm:seed.requestedDeliveryTerm,
 specSourceRef:'SYN QUOTE TECH SPEC',qualitySourceRef:'SYN SUPPLIER QC DOC',
 qualityEquivalence:'locally-reviewed-equivalent',qualityReviewedBy:'SYN MERCHANDISER',
 qualityReviewDate:'2026-10-17',sourceRef:'SYN SIGNED QUOTE SOURCE',...changes
});
p=Q.append(p,'offer',offer('SYN-OFFER-1','1.2000'));
assert.equal(p.revision,1);
assert.equal(G.gate(p,'SYN-OFFER-1','2026-10-17').status,'COMPARABLE');
const p1=JSON.stringify(p);
assert.throws(()=>Q.append(p,'offer',offer('SYN-OFFER-1','0.2000')),/Duplicate supplier source identity/);
assert.equal(JSON.stringify(p),p1,'Failed duplicate append must preserve original');
p=Q.append(p,'offer',offer('SYN-OFFER-CHEAP','0.4000',{gsm:'180',construction:'SINGLE JERSEY'}));
assert.equal(G.gate(p,'SYN-OFFER-CHEAP','2026-10-17').status,'NOT COMPARABLE');
assert(G.gate(p,'SYN-OFFER-CHEAP','2026-10-17').issues.some(x=>x.includes('gsm')));
assert.equal(G.gate(p,'SYN-OFFER-1','2026-12-01').status,'NOT COMPARABLE','Never recommend expired source');
assert(G.gate(p,'SYN-OFFER-1','2026-12-01').issues.some(x=>x.includes('EXPIRED')));
const charges=(overrides={})=>Object.fromEntries(['freight','duty','tax','lc'].map((kind,i)=>{
 const state={state:'amount',amount:['0.2000','0.1000','0.0500','0.0500'][i],
  unit:'yd',currency:'USD',sourceRef:'SYN LOCAL '+kind+' DOCUMENT',reviewedBy:'SYN REVIEWER',
  reviewDate:'2026-10-17'};
 return[kind,{...state,...(overrides[kind]||{})}];
}));
const scenario=(id,offerId,other={})=>({id,offerId,asOfDate:'2026-10-17',targetUnit:'yd',
 targetCurrency:'USD',rounding:'half-up-4',reviewedBy:'SYN LOCAL COST REVIEW',
 reviewDate:'2026-10-17',sourceRef:'SYN LANDED SCENARIO SOURCE',charges:charges(),...other});
p=Q.append(p,'scenario',scenario('SYN-SCENARIO-1','SYN-OFFER-1'));
const landed=L.evaluate(p,'SYN-SCENARIO-1');
assert.equal(landed.status,'COMPARABLE — SOURCE ONLY',JSON.stringify(landed));
assert.equal(landed.quotedInput,'1.2000');assert.equal(landed.landedInput,'1.6000');
assert.equal(landed.confirmedPurchase,false);assert.equal(landed.supplierApproved,false);
p=Q.append(p,'scenario',scenario('SYN-SCENARIO-CHEAP','SYN-OFFER-CHEAP'));
assert.equal(L.evaluate(p,'SYN-SCENARIO-CHEAP').status,'NOT COMPARABLE',
 'Incompatible cheaper fabric never wins');
p=Q.append(p,'offer',offer('SYN-OFFER-2','1.0000'));
p=Q.append(p,'scenario',scenario('SYN-SCENARIO-2','SYN-OFFER-2'));
const rank=L.comparison(p,'2026-10-17');
assert.equal(rank.ranked.length,2);assert.equal(rank.ranked[0].offerId,'SYN-OFFER-2');
assert.equal(rank.winner,null);assert.equal(rank.purchaseDecision,null);
assert.equal(rank.excluded.length,1);
const original=JSON.stringify(p);
assert.throws(()=>Q.append(p,'scenario',scenario('BAD-CHARGES','SYN-OFFER-1',{charges:{freight:{state:'amount',amount:'0',unit:'yd',currency:'USD',sourceRef:'SYN',reviewedBy:'SYN',reviewDate:'2026-10-17'}}})),/freight must be positive/);
assert.equal(JSON.stringify(p),original,'Invalid charges must not change sourced records');
p=Q.append(p,'scenario',scenario('SYN-MISSING-FREIGHT','SYN-OFFER-1',{charges:{duty:charges().duty,tax:charges().tax,lc:charges().lc}}));
assert.equal(L.evaluate(p,'SYN-MISSING-FREIGHT').status,'NEEDS INFORMATION');
assert.equal(L.evaluate(p,'SYN-MISSING-FREIGHT').landedInput,null);
p=Q.append(p,'offer',offer('SYN-CNY-OFFER','10.0000',{currency:'CNY'}));
p=Q.append(p,'scenario',scenario('SYN-FX-UNKNOWN','SYN-CNY-OFFER',{charges:charges({freight:{state:'not-applicable',sourceRef:'SYN DOCUMENT',reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',amount:undefined}})}));
assert.equal(L.evaluate(p,'SYN-FX-UNKNOWN').status,'NEEDS INFORMATION');
const fx={fromCurrency:'CNY',toCurrency:'USD',numerator:'0.1000',denominator:'1.0000',
 sourceRef:'SYN WRITTEN EXCHANGE RATE',sourceDate:'2026-10-17',
 reviewedBy:'SYN FINANCE',rounding:'half-up-4'};
p=Q.append(p,'scenario',scenario('SYN-FX-DOCUMENTED','SYN-CNY-OFFER',{fx}));
assert.equal(L.evaluate(p,'SYN-FX-DOCUMENTED').landedInput,'1.4000',
 'FX entered as sourced factor, never fetched or assumed');
const ratio={fromUnit:'kg',toUnit:'yd',numerator:'2.0000',denominator:'1.0000',
 sourceRef:'SYN FABRIC LAB SOURCE',reviewedBy:'SYN QA',reviewDate:'2026-10-17',rounding:'half-up-4'};
p=Q.append(p,'offer',offer('SYN-KG-OFFER','1.0000',{unit:'kg',moqUnit:'kg'}));
p=Q.append(p,'scenario',scenario('SYN-KG-UNKNOWN','SYN-KG-OFFER'));
assert.equal(L.evaluate(p,'SYN-KG-UNKNOWN').status,'NEEDS INFORMATION');
p=Q.append(p,'scenario',scenario('SYN-KG-UNMEASURED','SYN-KG-OFFER',{conversion:ratio}));
assert.equal(L.evaluate(p,'SYN-KG-UNMEASURED').status,'NOT COMPARABLE',
 'No guessed GSM/width needed for mass/length conversion');
const measured={...ratio,measuredGsm:'210.0000',measuredWidth:'68',widthUnit:'in',measurementSourceRef:'SYN LAB REPORT'};
p=Q.append(p,'scenario',scenario('SYN-KG-MEASURED','SYN-KG-OFFER',{conversion:measured}));
assert.equal(L.evaluate(p,'SYN-KG-MEASURED').landedInput,'2.4000',
 'Synthetic ratio is explicitly source-entered, never a claimed physical standard');
p=Q.append(p,'decision',{id:'SYN-INTERNAL-NOTE',offerId:'SYN-OFFER-1',
 reviewer:'SYN REVIEWER',reviewDate:'2026-10-17',sourceRef:'SYN EVALUATION NOTE',
 state:'internally-preferred-for-review'});
assert.equal(p.status,'INTERNAL SOURCE COMPARISON — NO SUPPLIER APPROVAL');
assert.throws(()=>Q.append(p,'decision',{id:'SYN-FORGED-APPROVAL',offerId:'SYN-OFFER-1',
 reviewer:'SYN REVIEWER',reviewDate:'2026-10-17',sourceRef:'SYN',state:'internally-preferred-for-review',supplierApproved:true}),/cannot auto-select\/approve supplier/);
assert.equal(p.audit.at(-1).revision,p.revision);
assert.equal(Q.validate(p).ok,true);
console.log('FABRIC SUPPLIER M1 DOMAIN PASS: exact dated source spec & offers, incompatible/expired gate, charge applicability and missing freight, documented FX/unit ratio only, no garment FOB/purchase decision; all fixtures synthetic.');
