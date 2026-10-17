/* APP-12 source-only comparative landed input, NOT a garment FOB, tax/legal advice, vendor selection or purchase order. */
(function(root){
'use strict';
class VesaSupplierLanded{
 static costs=['freight','duty','tax','lc'];
 static checkScenario(sc,offers){
  const Q=root.VesaSupplierQuote,errors=[];
  if(!Q.valid(sc?.id)||!Q.valid(sc?.offerId)||!offers.has(sc.offerId))
   errors.push('Scenario needs identified sourced offer');
  if(!Q.date(sc?.asOfDate)||!Q.date(sc?.reviewDate)||
   !Q.valid(sc?.sourceRef)||!Q.valid(sc?.reviewedBy))
   errors.push('Scenario needs explicit as-of date, reviewer and documentary source');
  if(!Q.unit(sc?.targetUnit)||!Q.currency(sc?.targetCurrency))
   errors.push('Scenario requires exact target unit and ISO-style 3-letter currency');
  if(!['half-up-4','down-4'].includes(sc?.rounding))
   errors.push('Scenario requires documented decimal rounding treatment');
  if(sc?.charges!==undefined){
   if(!sc.charges||typeof sc.charges!=='object'||Array.isArray(sc.charges))
    errors.push('Documentary charges must be source-labelled objects');
   else for(const [kind,item] of Object.entries(sc.charges)){
    if(!this.costs.includes(kind)){errors.push('Unapproved landed-charge component '+kind);continue;}
    if(!item||!['amount','not-applicable'].includes(item.state)||!Q.valid(item.sourceRef)||
     !Q.valid(item.reviewedBy)||!Q.date(item.reviewDate))
     errors.push(kind+' charge requires explicit applicability and source evidence');
    if(item?.state==='amount'&&(Q.parse(item.amount)===null||
     item.currency!==sc.targetCurrency||item.unit!==sc.targetUnit))
     errors.push(kind+' must be positive per matching target unit/currency; no implicit conversion');
    if(item?.state==='not-applicable'&&item.amount!==undefined)
     errors.push(kind+' not-applicable may not conceal an amount');
   }
  }
  if(sc?.fx!==undefined&&sc.fx!==null){
   const fx=sc.fx;
   if(!Q.currency(fx.fromCurrency)||fx.toCurrency!==sc.targetCurrency||
    Q.parse(fx.numerator)===null||Q.parse(fx.denominator)===null||
    !Q.valid(fx.sourceRef)||!Q.date(fx.sourceDate)||
    fx.sourceDate>sc.asOfDate||!Q.valid(fx.reviewedBy)||!['half-up-4','down-4'].includes(fx.rounding))
    errors.push('FX requires explicit positive sourced factor, currency direction, date and rounding');
  }
  if(sc?.conversion!==undefined&&sc.conversion!==null){
   const cv=sc.conversion;
   if(!Q.unit(cv.fromUnit)||cv.toUnit!==sc.targetUnit||!Q.valid(cv.sourceRef)||
    !Q.valid(cv.reviewedBy)||!Q.date(cv.reviewDate)||Q.parse(cv.numerator)===null||
    Q.parse(cv.denominator)===null||!['half-up-4','down-4'].includes(cv.rounding))
    errors.push('Unit conversion requires explicit positive source factor and signed review basis');
  }
  return errors;
 }
 static ratio(value,numerator,denominator,rounding){
  const Q=root.VesaSupplierQuote,n=Q.parse(numerator),d=Q.parse(denominator);
  if(typeof value!=='bigint'||n===null||d===null||
   !['half-up-4','down-4'].includes(rounding))return null;
  const total=value*n,q=total/d,rem=total%d;
  return rounding==='half-up-4'&&rem*2n>=d?q+1n:q;
 }
 static evaluate(record,scenarioId){
  const Q=root.VesaSupplierQuote,G=root.VesaSupplierComparability;
  const checked=Q.validate(record);if(!checked.ok)throw Error(checked.errors.join('; '));
  const sc=record.scenarios.find(s=>s.id===scenarioId);
  if(!sc)return{status:'NEEDS INFORMATION',issues:['No sourced landed comparison scenario'],vendorApproved:false};
  const offer=record.offers.find(o=>o.id===sc.offerId),source=G.gate(record,offer.id,sc.asOfDate);
  const base={scenarioId:sc.id,offerId:offer.id,supplier:offer.supplier,
   asOfDate:sc.asOfDate,targetUnit:sc.targetUnit,targetCurrency:sc.targetCurrency,
   supplierApproved:false,confirmedPurchase:false,garmentFOB:false,officialTaxVerified:false,
   conversionSourceOnly:true,sourceRef:sc.sourceRef};
  if(source.status!=='COMPARABLE')return {...base,status:'NOT COMPARABLE',issues:source.issues,landedInput:null};
  const unit=Q.conversion(Q.parse(offer.unitPrice),offer.unit,sc.targetUnit,sc.conversion);
  if(unit.status!=='COMPARABLE')return {...base,status:unit.status,issues:[unit.reason],landedInput:null};
  let quote=unit.value;
  if(offer.currency!==sc.targetCurrency){
   if(!sc.fx||sc.fx.fromCurrency!==offer.currency)return{...base,status:'NEEDS INFORMATION',
    issues:['No source-confirmed dated FX direction from offer currency to scenario currency'],landedInput:null};
   quote=this.ratio(quote,sc.fx.numerator,sc.fx.denominator,sc.fx.rounding);
   if(quote===null)return{...base,status:'NEEDS INFORMATION',issues:['Invalid source FX factor'],landedInput:null};
  }
  let sum=quote;const details=[];const missing=[];
  for(const kind of this.costs){
   const charge=sc.charges?.[kind];
   if(!charge){missing.push(kind+' source applicability/charge is Needs Information');continue;}
   if(charge.state==='not-applicable'){details.push({kind,value:null,sourceRef:charge.sourceRef,notApplicable:true});continue;}
   const value=Q.parse(charge.amount);if(value===null||charge.currency!==sc.targetCurrency||
    charge.unit!==sc.targetUnit){missing.push(kind+' per-unit amount/currency Needs Information');continue;}
   sum+=value;
   details.push({kind,value:Q.fmt(value),sourceRef:charge.sourceRef,notApplicable:false});
  }
  if(missing.length)return{...base,status:'NEEDS INFORMATION',issues:missing,landedInput:null,
   knownOfferPrice:Q.fmt(quote),knownSourceCharges:details};
  return{...base,status:'COMPARABLE — SOURCE ONLY',issues:[],
   landedInput:Q.fmt(sum),quotedInput:Q.fmt(quote),charges:details,notRevenue:true,
   noAutomaticSelection:true,noAssumedFreightTaxLC:true};
 }
 static comparison(record,asOf){
  const Q=root.VesaSupplierQuote;if(!Q.date(asOf))throw Error('Comparative price list needs exact as-of date');
  const views=record.scenarios.filter(s=>s.asOfDate===asOf).map(s=>this.evaluate(record,s.id));
  const eligible=views.filter(s=>s.status==='COMPARABLE — SOURCE ONLY');
  const ranked=[...eligible].sort((a,b)=>{
   const av=Q.parse(a.landedInput),bv=Q.parse(b.landedInput);
   return av<bv?-1:av>bv?1:a.offerId.localeCompare(b.offerId);
  }).map((item,i)=>({...item,priceOnlyRank:i+1,notASelection:true}));
  return {asOf,sourceOnly:true,ranked,excluded:views.filter(s=>s.status!=='COMPARABLE — SOURCE ONLY'),
   winner:null,approvedSupplier:null,purchaseDecision:null,
   notCostingFOB:true,needsHumanQualityAndTermsReview:true};
 }
}
root.VesaSupplierLanded=VesaSupplierLanded;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierLanded;
})(typeof globalThis!=='undefined'?globalThis:this);
