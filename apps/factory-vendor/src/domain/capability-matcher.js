/* APP-08 declared category/site matching only. Capacity is not production availability. */
(function(root){
'use strict';
class FactoryCapabilityMatcher{
 static match(record,criteria,asOf){const E=root.VesaFactoryVendorProfile;
  const check=E.validate(record);if(!check.ok)throw Error(check.errors.join('; '));
  if(!E.validText(criteria?.category)||!E.validText(criteria?.siteId)||!E.date(asOf))
   throw Error('Choose exact site, garment category and source as-of date');
  const candidates=record.capabilities.filter(c=>c.siteId===criteria.siteId&&c.category.toUpperCase()===criteria.category.trim().toUpperCase()&&c.asOfDate<=asOf);
  if(!candidates.length)return {found:false,declaredCapacity:null,unit:null,sourceRef:null,needsExternalVerification:true,buyerApproved:false,reason:'Needs sourced site/category declaration'};
  const latest=[...candidates].sort((a,b)=>b.asOfDate.localeCompare(a.asOfDate)||b.reviewDate.localeCompare(a.reviewDate))[0];
  return{found:true,siteId:latest.siteId,category:latest.category,declaredCapacity:latest.declaredMonthlyCapacity??null,
   declaredPeriod:'monthly',unit:latest.unit,sourceRef:latest.sourceRef,capacitySourceRef:latest.capacitySourceRef||null,
   asOfDate:latest.asOfDate,reviewDate:latest.reviewDate,needsExternalVerification:true,buyerApproved:false,
   notActualProduction:true,reason:'Locally reviewed self-declared capacity; not guaranteed allocation'};
 }
 static metric(record,metricId){const E=root.VesaFactoryVendorProfile,a=E.validate(record);
  if(!a.ok)throw Error(a.errors.join('; '));const m=record.performance.find(x=>x.id===metricId);
  if(!m)return null;return {siteId:m.siteId,metric:m.metric,periodFrom:m.periodFrom,periodTo:m.periodTo,
   ratio:m.numerator/m.denominator,numerator:m.numerator,denominator:m.denominator,unit:m.unit,
   sourceRef:m.sourceRef,notBuyerApproved:true};
 }
}
root.VesaFactoryCapabilityMatcher=FactoryCapabilityMatcher;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryCapabilityMatcher;
})(typeof globalThis!=='undefined'?globalThis:this);
