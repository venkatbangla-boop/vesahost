/* APP-08 — source-declared vendor/site identity and immutable local record history.
 * A local declaration is NOT official compliance, certification or factory capacity.
 * No browser, DOM, sibling-app imports, private contacts or cloud dependencies.
 */
(function(root){
'use strict';
class FactoryVendorProfile{
 static version='VESA-FACTORY-VENDOR-360-1';
 static text(x){return typeof x==='string'?x.trim():'';}
 static clone(x){return JSON.parse(JSON.stringify(x));}
 static id(pre){return pre+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static date(s){if(typeof s!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s))return false;
  const ms=Date.parse(s+'T00:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===s;}
 static whole(n){return Number.isSafeInteger(n)&&n>=0&&n<=100000000;}
 static validText(s,max=180){return !!this.text(s)&&s.length<=max;}
 static create(input={}){const now=new Date().toISOString();return {
  version:this.version,id:this.id('FVD'),revision:0,createdAt:now,updatedAt:now,
  header:{vendorName:this.text(input.vendorName),country:this.text(input.country),sourceRef:this.text(input.sourceRef)},
  sites:[],capabilities:[],certificates:[],reviews:[],performance:[],audit:[],status:'INTERNAL DRAFT — NOT CERTIFIED'};
 }
 static validateHeader(h){const errors=[];for(const key of ['vendorName','country','sourceRef'])
  if(!this.validText(h?.[key],250))errors.push('Missing or oversized vendor source: '+key);
  return errors;}
 static checkSite(s){const errors=[];
  for(const key of ['id','siteName','country','process','sourceRef'])if(!this.validText(s?.[key],250))errors.push('Missing sourced site field: '+key);
  return errors;}
 static checkCapability(c,sites){const errors=[];
  for(const key of ['id','siteId','category','unit','sourceRef','reviewedBy'])if(!this.validText(c?.[key],250))errors.push('Capability needs sourced field: '+key);
  if(!sites.has(c?.siteId))errors.push('Capability must reference a known factory site');
  if(!this.date(c?.asOfDate)||!this.date(c?.reviewDate))errors.push('Declared capacity needs source and review dates');
  if(c?.declaredMonthlyCapacity!==null&&c?.declaredMonthlyCapacity!==undefined&&!this.whole(c.declaredMonthlyCapacity))
   errors.push('Declared monthly capacity requires nonnegative, integer quantity with exact unit');
  if(c?.declaredMonthlyCapacity!==null&&c?.declaredMonthlyCapacity!==undefined&&this.whole(c.declaredMonthlyCapacity)&&!this.validText(c.capacitySourceRef))
   errors.push('Capacity quantity needs separate documented capacity evidence');
  if(c?.moq!==undefined&&c.moq!==null&&!this.whole(c.moq))errors.push('MOQ requires a valid documented whole quantity');
  if(c?.leadDays!==undefined&&c.leadDays!==null&&(!this.whole(c.leadDays)||!this.validText(c.leadDaysSource)))
   errors.push('Lead time needs exact sourced days without assumed calendars');
  return errors;}
 static checkReview(r,sites){const errors=[];
  for(const key of ['id','siteId','reviewer','checklistRef','sourceRef'])if(!this.validText(r?.[key],250))errors.push('Onboarding review needs local documented '+key);
  if(!sites.has(r?.siteId)||!this.date(r?.reviewDate))errors.push('Onboarding review site/date invalid');
  if(!['needs-information','internal-reviewed','hold'].includes(r?.internalOutcome))errors.push('Onboarding outcome must remain internal only');
  return errors;}
 static checkPerformance(m,sites){const errors=[];
  for(const key of ['id','siteId','metric','unit','sourceRef','reviewer'])if(!this.validText(m?.[key],220))errors.push('Performance metric missing scoped source: '+key);
  if(!sites.has(m?.siteId)||!this.date(m?.periodFrom)||!this.date(m?.periodTo)||m.periodFrom>m.periodTo||!this.date(m?.reviewDate))
   errors.push('Performance period / review evidence invalid');
  if(!this.whole(m?.numerator)||!Number.isSafeInteger(m?.denominator)||m.denominator<1||m.denominator>100000000)
   errors.push('Performance ratio requires explicit sourced numerator and nonzero denominator');
  if(this.whole(m?.numerator)&&this.whole(m?.denominator)&&m.numerator>m.denominator)
   errors.push('Ratio numerator cannot exceed defined denominator');
  return errors;}
 static validate(record){const errors=[];
  if(!record||record.version!==this.version||!this.validText(record.id)||!Number.isSafeInteger(record.revision)||record.revision<0||
   !['sites','capabilities','certificates','reviews','performance','audit'].every(k=>Array.isArray(record[k])))
   return{ok:false,errors:['Unsupported Factory & Vendor record/version']};
  errors.push(...this.validateHeader(record.header));
  if(record.status!=='INTERNAL DRAFT — NOT CERTIFIED')errors.push('Factory profile cannot claim certification or final buyer approval');
  try{if(JSON.stringify(record).length>2097152)errors.push('Factory profile exceeds local copy limit');}catch{errors.push('Factory profile is not a portable record');}
  const caps={sites:500,capabilities:2500,certificates:2000,reviews:2000,performance:4000,audit:10000};
  for(const[k,max]of Object.entries(caps))if(record[k].length>max)errors.push('Too many vendor source entries: '+k);
  const sites=new Map(),seen=new Set();
  for(const s of record.sites){errors.push(...this.checkSite(s));const key=[this.text(s.siteName).toUpperCase(),this.text(s.country).toUpperCase()].join('/');
   if(seen.has(key)||sites.has(s.id))errors.push('Duplicate factory site ID or identity');seen.add(key);sites.set(s.id,s);}
  const ids=new Set(),certificateDocs=new Set();for(const kind of ['capabilities','certificates','reviews','performance']){
   for(const v of record[kind]){
    if(ids.has(v.id))errors.push('Duplicate vendor evidence ID across records');ids.add(v.id);
    if(kind==='capabilities')errors.push(...this.checkCapability(v,sites));
    if(kind==='certificates'){
     const docKey=[v.siteId,v.scheme,v.documentRef].map(x=>this.text(x).toUpperCase()).join('\u001f');
     if(certificateDocs.has(docKey))errors.push('Duplicate certificate source document for site/scheme');
     certificateDocs.add(docKey);
     if(!root.VesaFactoryCertificationEvidence)errors.push('Certification evidence validator unavailable');
     else errors.push(...root.VesaFactoryCertificationEvidence.check(v,sites));
    }
    if(kind==='reviews')errors.push(...this.checkReview(v,sites));
    if(kind==='performance')errors.push(...this.checkPerformance(v,sites));
   }
  }
  if(record.audit.length&&record.audit.at(-1)?.revision!==record.revision)errors.push('Audit revision chain does not match current revision');
  return{ok:errors.length===0,errors};
 }
 static append(record,kind,entry){const array={site:'sites',capability:'capabilities',certificate:'certificates',review:'reviews',performance:'performance'}[kind];
  if(!array)throw Error('Unknown factory record type');
  const copy=this.clone(record);copy[array].push(this.clone(entry));copy.revision++;copy.updatedAt=new Date().toISOString();
  copy.audit.push({revision:copy.revision,at:copy.updatedAt,action:'Recorded sourced '+kind+' evidence',recordId:entry?.id||''});
  const result=this.validate(copy);if(!result.ok)throw Error(result.errors.join('; '));return copy;}
}
root.VesaFactoryVendorProfile=FactoryVendorProfile;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryVendorProfile;
})(typeof globalThis!=='undefined'?globalThis:this);
