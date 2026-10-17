/* APP-08 manually imported, independently reviewed, READ-ONLY source snapshots.
 * Never opens another app's storage or claims vendor/buyer/compliance authority.
 */
(function(root){
'use strict';
class FactoryVendorReviewedReference{
 static text(x){return typeof x==='string'?x.trim():'';}
 static date(x){return typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&Number.isFinite(Date.parse(x+'T00:00:00Z'))&&new Date(Date.parse(x+'T00:00:00Z')).toISOString().slice(0,10)===x;}
 static time(x){return this.date(x)||(typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+\-]\d\d:\d\d)$/.test(x)&&Number.isFinite(Date.parse(x)));}
 static kindMatches(kind,source){
  const app=this.text(source?.sourceApp),type=this.text(source?.recordType);
  return kind==='po'?/^(?:VESA\s+)?Purchase Order(?:\s+360)?$/i.test(app)&&['PurchaseOrder','PORevision'].includes(type):
   kind==='production'?/^(?:VESA\s+)?Production Tracker(?:\s+360)?$/i.test(app)&&type==='ProductionStageSnapshot':false;
 }
 static sourceValid(source,kind){
  if(!source||typeof source!=='object'||Array.isArray(source)||!this.kindMatches(kind,source))return false;
  if(['sourceApp','recordType','recordId','revisionId','verifiedBy'].some(k=>!this.text(source[k])||this.text(source[k]).length>180))return false;
  if(!this.date(source.sourceDate)||!this.time(source.verifiedAt)||!source.displaySnapshot||
   typeof source.displaySnapshot!=='object'||Array.isArray(source.displaySnapshot))return false;
  try{return JSON.stringify(source).length<=120000;}catch{return false;}
 }
 static siteMatch(source,record,siteId){
  const site=record.sites.find(x=>x.id===siteId),s=source?.displaySnapshot;
  if(!site||!s)return false;
  const same=(a,b)=>this.text(a).toUpperCase()===this.text(b).toUpperCase();
  if(s.siteId&&!same(s.siteId,site.id))return false;
  if(s.siteName&&!same(s.siteName,site.siteName))return false;
  if(s.vendorId&&!same(s.vendorId,record.id))return false;
  if(s.factory&&!same(s.factory,site.siteName)&&!same(s.factory,record.header.vendorName))return false;
  return true;
 }
 static validateList(record){
  if(record.manualReferences===undefined)return [];
  const refs=record.manualReferences,err=[],ids=new Set(),versions=new Set();
  if(!Array.isArray(refs)||refs.length>20)return ['Reviewed references require a bounded list (max 20)'];
  for(const entry of refs){
   const k=entry?.kind,s=entry?.source;
   if(!entry||typeof entry!=='object'||Array.isArray(entry)||!['po','production'].includes(k)||
    !this.text(entry.id)||this.text(entry.id).length>180||ids.has(entry.id)||
    !this.text(entry.localReviewer)||this.text(entry.localReviewer).length>180||
    !this.date(entry.localReviewDate)||entry.identityConfirmed!==true||
    !this.sourceValid(s,k)||!this.siteMatch(s,record,entry.siteId))
     err.push('A manual PO/Production source needs exact site identity, typed evidence and independent dated local review');
   const version=[k,this.text(s?.recordId),this.text(s?.revisionId)].join('\u001f');
   if(versions.has(version))err.push('Duplicate reviewed source revision');
   ids.add(entry?.id);versions.add(version);
  }
  return err;
 }
 static append(record,kind,source,review){
  const P=root.VesaFactoryVendorProfile;
  if(!P||!this.sourceValid(source,kind)||!this.siteMatch(source,record,review?.siteId)||
   !this.text(review?.localReviewer)||this.text(review.localReviewer).length>180||
   !this.date(review?.localReviewDate)||review?.identityConfirmed!==true)
   throw Error('Matching typed PO/Production source, confirmed site and independent local reviewer/date required');
  const next=P.clone(record);next.manualReferences??=[];
  next.manualReferences.push({id:P.id('FV-REF'),kind,siteId:review.siteId,source:P.clone(source),
   localReviewer:this.text(review.localReviewer),localReviewDate:review.localReviewDate,identityConfirmed:true});
  next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'Append read-only locally reviewed '+kind.toUpperCase()+' source',
   recordId:next.manualReferences.at(-1).id});
  const a=P.validate(next);if(!a.ok)throw Error(a.errors.join('; '));
  return next;
 }
}
root.VesaFactoryVendorReviewedReference=FactoryVendorReviewedReference;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryVendorReviewedReference;
})(typeof globalThis!=='undefined'?globalThis:this);
