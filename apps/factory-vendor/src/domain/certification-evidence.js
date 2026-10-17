/* APP-08 certificate records contain documentary claims, never a compliance verdict. */
(function(root){
'use strict';
class FactoryCertificationEvidence{
 static check(doc,sites){const E=root.VesaFactoryVendorProfile,errors=[];
  for(const key of ['id','siteId','scheme','issuer','documentRef','sourceRef','reviewedBy'])
   if(!E.validText(doc?.[key],220))errors.push('Missing certificate document evidence: '+key);
  if(!sites.has(doc?.siteId))errors.push('Certificate must belong to one known factory site');
  if(!E.date(doc?.issueDate)||!E.date(doc?.expiryDate)||doc.issueDate>doc.expiryDate)
   errors.push('Certificate requires sourced issue and expiration dates');
  if(!E.date(doc?.reviewDate))errors.push('Local certificate review date must be explicit');
  if(!['document-supplied','source-unconfirmed','document-rejected'].includes(doc?.documentStatus))
   errors.push('Certificate status may only describe received documentation');
  return errors;
 }
 static dateState(doc,asOf){const E=root.VesaFactoryVendorProfile;
  if(!E.date(asOf))throw Error('Certificate as-of date is required');
  if(!doc||!E.date(doc.issueDate)||!E.date(doc.expiryDate)||doc.issueDate>doc.expiryDate)
   return{dateState:'needs-information',notComplianceApproval:true};
  if(asOf<doc.issueDate)return{dateState:'not-effective-by-dates',notComplianceApproval:true};
  if(asOf>doc.expiryDate)return{dateState:'expired-by-dates',notComplianceApproval:true};
  return{dateState:'inside-documented-date-range-only',notComplianceApproval:true};
 }
 static evaluateRecord(record,asOf){const E=root.VesaFactoryVendorProfile,check=E.validate(record);
  if(!check.ok)throw Error(check.errors.join('; '));
  return record.certificates.map(c=>({siteId:c.siteId,scheme:c.scheme,documentRef:c.documentRef,
   sourceRef:c.sourceRef,documentStatus:c.documentStatus,...this.dateState(c,asOf),
   // Locally supplied document and dates never establish valid issuing authority.
   authorityVerified:false,buyerAccepted:false}));
 }
}
root.VesaFactoryCertificationEvidence=FactoryCertificationEvidence;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryCertificationEvidence;
})(typeof globalThis!=='undefined'?globalThis:this);
