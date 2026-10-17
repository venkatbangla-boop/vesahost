/* APP-12 conservative source-match gate. A low quoted price cannot override GSM/width/term/quality mismatches. */
(function(root){
'use strict';
class VesaSupplierComparability{
 static norm(v){return typeof v==='string'?v.trim().replace(/\s+/g,' ').toUpperCase():'';}
 static gate(record,offerId,asOf){
  const Q=root.VesaSupplierQuote;
  const checked=Q.validate(record);
  if(!checked.ok)throw Error(checked.errors.join('; '));
  if(!Q.date(asOf))throw Error('Comparison needs exact source as-of date');
  const o=record.offers.find(v=>v.id===offerId);
  if(!o)return{status:'NOT COMPARABLE',issues:['No sourced supplier offer'],buyerApproved:false,supplierCertified:false};
  const h=record.requirement,issues=[];
  for(const k of ['article','composition','construction','shrinkageBasis'])
   if(this.norm(h[k])!==this.norm(o[k]))issues.push('MISMATCH: '+k+' source specification');
  for(const k of ['gsm','width','shrinkage'])
   if(Q.parse(h[k],k!=='shrinkage')!==Q.parse(o[k],k!=='shrinkage'))
    issues.push('MISMATCH: '+k+' sourced measured value');
  if(h.widthUnit!==o.widthUnit)issues.push('NOT COMPARABLE: declared width units differ (no implied conversion)');
  if(this.norm(h.requestedTradeTerm)!==this.norm(o.tradeTerm))
   issues.push('NOT COMPARABLE: trade term differs; no assumed Incoterm landed treatment');
  if(this.norm(h.requestedDeliveryTerm)!==this.norm(o.deliveryTerm))
   issues.push('NOT COMPARABLE: delivery term differs');
  if(o.quoteDate>asOf)issues.push('Quotation source date is after comparison as-of');
  if(o.validTo<asOf)issues.push('EXPIRED OFFER: date-specific source no longer valid');
  if(o.qualityEquivalence!=='locally-reviewed-equivalent'||!Q.valid(o.qualityReviewedBy)||
   !Q.date(o.qualityReviewDate))
   issues.push('NEEDS INFORMATION: no separate local quality/test equivalence review');
  if(o.qualityEquivalence==='not-equivalent')issues.push('NOT COMPARABLE: local quality review reports difference');
  return {status:issues.length?'NOT COMPARABLE':'COMPARABLE',
   offerId:o.id,issues,moq:o.moq,moqUnit:o.moqUnit,leadDays:o.leadDays,origin:o.origin,
   quoteDate:o.quoteDate,validTo:o.validTo,sourceRef:o.sourceRef,
   matchedBySourceOnly:true,buyerApproved:false,supplierCertified:false,
   notStockBooking:true,noAutomaticSelection:true};
 }
 static matrix(record,asOf){
  const Q=root.VesaSupplierQuote,a=Q.validate(record);
  if(!a.ok)throw Error(a.errors.join('; '));
  return record.offers.map(o=>this.gate(record,o.id,asOf));
 }
}
root.VesaSupplierComparability=VesaSupplierComparability;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierComparability;
})(typeof globalThis!=='undefined'?globalThis:this);
