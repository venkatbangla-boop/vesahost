/* APP-11 Buyer CRM: source-owned buyer organization, contact, enquiry and immutable activity.
 * Pure data functions. No browser API, paid provider, remote contact sync or automatic PO.
 */
(function(root){
'use strict';
class VesaBuyerDirectory{
 static version='VESA-BUYER-CRM-360-1';
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static text(v){return typeof v==='string'?v.trim():'';}
 static valid(v,max=240){return !!this.text(v)&&this.text(v).length<=max;}
 static id(prefix='CRM'){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static date(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v))return false;const d=Date.parse(v+'T00:00:00Z');return Number.isFinite(d)&&new Date(d).toISOString().slice(0,10)===v;}
 static whole(v){return Number.isSafeInteger(v)&&v>=0&&v<=1000000000;}
 static create(h={}){
  const now=new Date().toISOString();
  return{version:this.version,id:this.id('BUY'),revision:0,createdAt:now,updatedAt:now,
   status:'LOCAL SOURCE ONLY — NOT BUYER-APPROVED PO',
   header:{organizationName:this.text(h.organizationName),territory:this.text(h.territory),sourceRef:this.text(h.sourceRef)},
   contacts:[],enquiries:[],opportunities:[],stageChanges:[],followups:[],audit:[]};
 }
 static checkContact(c){
  const e=[];for(const k of ['id','contactName','role','sourceRef','privacySourceRef','reviewedBy'])
   if(!this.valid(c?.[k],300))e.push('Contact requires sourced '+k);
  if(!this.date(c?.reviewDate))e.push('Contact review date required');
  if(!['needs-information','local-consent-evidence-recorded','source-says-no-consent'].includes(c?.consentStatus))
   e.push('Consent basis must be reported from source, not invented');
  for(const k of ['email','phone','notes'])if(c?.[k]!==undefined&&(typeof c[k]!=='string'||c[k].length>1000))e.push('Contact information oversized');
  return e;
 }
 static checkEnquiry(q){
  const e=[];for(const k of ['id','category','sourceRef'])if(!this.valid(q?.[k],350))e.push('Enquiry requires source '+k);
  if(!this.date(q?.sourceDate))e.push('Enquiry source date required');
  if(q?.requestedQuantity!==null&&q?.requestedQuantity!==undefined){
   if(!this.whole(q.requestedQuantity)||!this.valid(q.unit))e.push('Sourced request quantity requires integer and exact unit');
  }
  if(q?.styleRequest!==undefined&&(typeof q.styleRequest!=='string'||q.styleRequest.length>500))e.push('Enquiry style text oversized');
  return e;
 }
 static normalized(s){return this.text(s).toUpperCase().replace(/\s+/g,' ');}
 static potentialDuplicateOrganization(list,candidate){
  const name=this.normalized(candidate?.organizationName),territory=this.normalized(candidate?.territory);
  if(!name||!territory)return[];
  return list.filter(x=>{
   const h=x?.header||x;
   return this.normalized(h?.organizationName)===name&&this.normalized(h?.territory)===territory;
  }).map(x=>x?.id||null);
 }
 static potentialDuplicateContact(record,candidate){
  const key=this.normalized(candidate?.contactName),role=this.normalized(candidate?.role);
  return record.contacts.filter(x=>this.normalized(x.contactName)===key&&this.normalized(x.role)===role)
   .map(x=>x.id);
 }
 static validate(p){
  const errors=[];
  if(!p||p.version!==this.version||!this.valid(p.id,180)||!Number.isSafeInteger(p.revision)||p.revision<0||
   !['contacts','enquiries','opportunities','stageChanges','followups','audit'].every(k=>Array.isArray(p[k])))
   return{ok:false,errors:['Unsupported Buyer CRM source record/version']};
  if(p.status!=='LOCAL SOURCE ONLY — NOT BUYER-APPROVED PO')errors.push('CRM must not claim confirmed PO or buyer certification');
  // Optional M3 manually reviewed PO/Costing source copies. Legacy M2 saved records remain valid.
  if(p.manualReferences!==undefined){
   if(!root.VesaCRMReviewedReference)errors.push('CRM reviewed-source engine is unavailable');
   else errors.push(...root.VesaCRMReviewedReference.validateList(p));
  }
  for(const key of ['organizationName','territory','sourceRef'])if(!this.valid(p.header?.[key],350))errors.push('Buyer organization needs sourced '+key);
  try{if(JSON.stringify(p).length>2097152)errors.push('CRM record exceeds local safe limit');}catch{errors.push('CRM record cannot be copied');}
  for(const [key,max]of Object.entries({contacts:500,enquiries:1000,opportunities:1000,stageChanges:4000,followups:4000,audit:10000}))
   if(p[key].length>max)errors.push('Too many '+key+' source items');
  const ids=new Set(),enquiries=new Set(),opps=new Set(),contactKeys=new Set();
  for(const c of p.contacts){
   errors.push(...this.checkContact(c));const k=this.normalized(c?.contactName)+'/'+this.normalized(c?.role);
   if(contactKeys.has(k))errors.push('Possible duplicate contact needs human review; no silent merge');
   contactKeys.add(k);
   if(ids.has(c?.id))errors.push('Duplicate CRM ID');ids.add(c?.id);
  }
  for(const q of p.enquiries){
   errors.push(...this.checkEnquiry(q));
   if(ids.has(q?.id))errors.push('Duplicate CRM ID');ids.add(q?.id);enquiries.add(q?.id);
  }
  for(const o of p.opportunities){
   if(!root.VesaCRMOpportunityState)errors.push('Opportunity engine missing');
   else errors.push(...root.VesaCRMOpportunityState.check(o,enquiries));
   if(ids.has(o?.id))errors.push('Duplicate CRM ID');ids.add(o?.id);opps.add(o?.id);
  }
  for(const s of p.stageChanges){
   if(!root.VesaCRMOpportunityState)errors.push('Stage source validator missing');
   else errors.push(...root.VesaCRMOpportunityState.checkStage(s,opps));
   if(ids.has(s?.id))errors.push('Duplicate CRM ID');ids.add(s?.id);
  }
  for(const f of p.followups){
   if(!root.VesaCRMFollowupScheduler)errors.push('Follow-up engine missing');
   else errors.push(...root.VesaCRMFollowupScheduler.check(f,enquiries,opps));
   if(ids.has(f?.id))errors.push('Duplicate CRM ID');ids.add(f?.id);
  }
  if(p.audit.length!==p.revision)errors.push('CRM revision audit count must match local revision');
  for(let i=0;i<p.audit.length;i++)if(p.audit[i]?.revision!==i+1||!this.valid(p.audit[i]?.action,250)||!this.valid(p.audit[i]?.at,120))
   errors.push('CRM audit history must remain sequential and append-only');
  return{ok:errors.length===0,errors};
 }
 static append(p,kind,input){
  const group={contact:'contacts',enquiry:'enquiries',opportunity:'opportunities',stage:'stageChanges',followup:'followups'}[kind];
  if(!group)throw Error('Unknown buyer data type');
  const checked=this.validate(p);if(!checked.ok)throw Error(checked.errors.join('; '));
  const next=this.copy(p),entry=this.copy(input);
  if(!entry.id)entry.id=this.id('CRM-'+kind.toUpperCase());
  next[group].push(entry);next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'New local '+kind+' source evidence',recordId:entry.id});
  const valid=this.validate(next);if(!valid.ok)throw Error(valid.errors.join('; '));
  return next;
 }
}
root.VesaBuyerDirectory=VesaBuyerDirectory;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaBuyerDirectory;
})(typeof globalThis!=='undefined'?globalThis:this);
