/* APP-04 domain SSOT: sample requests, rounds, comments, decisions and revision provenance.
 * Pure calculations only. No DOM, browser persistence, private sibling reads or fabricated approvals.
 */
(function(root){
'use strict';
class SamplingEngine {
 static version='VESA-SAMPLING360-1';
 static format='VESA-SAMPLING360-COPY-1';
 static text(x){return String(x??'').trim();}
 static date(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
   const time=Date.parse(s+'T00:00:00Z');return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===s;}
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static id(prefix='SA'){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static referenceValid(ref){
   if(ref==null)return true;
   return typeof ref==='object'&&!Array.isArray(ref)&&
     ['sourceApp','recordType','recordId','revisionId'].every(k=>this.text(ref[k]))&&
     this.date(ref.sourceDate)&&this.text(ref.verifiedBy)&&this.date(ref.verifiedAt)&&
     ref.displaySnapshot&&typeof ref.displaySnapshot==='object'&&
     JSON.stringify(ref).length<=160000;
 }
 static create(seed={},practice=false){
  const now=new Date().toISOString();
  return {version:this.version,id:this.id('SREQ'),revision:0,mode:practice?'practice':'local',
   createdAt:now,updatedAt:now,header:{
    buyer:this.text(seed.buyer),poNo:this.text(seed.poNo),style:this.text(seed.style),
    factory:this.text(seed.factory),requirementsSource:this.text(seed.requirementsSource),
    currentTechRevision:this.text(seed.currentTechRevision),
    currentTechSource:this.text(seed.currentTechSource),
    currentArtworkRevision:this.text(seed.currentArtworkRevision),
    currentArtworkSource:this.text(seed.currentArtworkSource),
    poReference:null,techReference:null,artworkReference:null},
   categories:[],rounds:[],decisions:[],revisionRequests:[],audit:[]};
 }
 static demo(){
  const p=this.create({buyer:'SYNTHETIC BUYER',poNo:'DEMO-PO-01',style:'DEMO-TEE',
   factory:'SYNTHETIC FACTORY',requirementsSource:'DEMO BUYER REQUIREMENT REGISTER',
   currentTechRevision:'SPEC-V1',currentTechSource:'SYNTHETIC TECH REVIEW',
   currentArtworkRevision:'ART-V1',currentArtworkSource:'SYNTHETIC ARTWORK REVIEW'},true);
  p.categories=[{id:'CAT-FIT',name:'Fit Sample',sourceRef:'DEMO BUYER FIT REQUEST',required:true,
   buyerAuthority:'SYNTHETIC BUYER TECHNICAL TEAM'},
   {id:'CAT-PP',name:'PP Sample',sourceRef:'DEMO BUYER PP REQUEST',required:true,
   buyerAuthority:'SYNTHETIC BUYER APPROVAL DEPARTMENT'}];
  p.rounds=[{id:'R1',categoryId:'CAT-FIT',round:1,physicalId:'DEMO-FIT-001',
   colour:'Navy',size:'M',quantity:2,requestDate:'2026-10-01',requiredDate:'2026-10-10',
   calendarBasis:'calendar',calendarSource:'DEMO BUYER CALENDAR',
   sentDate:'2026-10-05',dispatchSource:'DEMO DHL RECEIPT',
   receivedDate:'2026-10-07',receiptSource:'DEMO BUYER RECEIPT',
   techRevision:'SPEC-V1',techSource:'SYNTHETIC TECH REVIEW',
   artworkRevision:'ART-V1',artworkSource:'SYNTHETIC ARTWORK REVIEW'},
   {id:'R2',categoryId:'CAT-FIT',round:2,physicalId:'DEMO-FIT-002',
   colour:'Navy',size:'M',quantity:2,requestDate:'2026-10-11',requiredDate:'2026-10-17',
   calendarBasis:'calendar',calendarSource:'DEMO BUYER CALENDAR',
   sentDate:'2026-10-12',dispatchSource:'DEMO DHL RECEIPT 2',
   receivedDate:'2026-10-13',receiptSource:'DEMO BUYER RECEIPT 2',
   techRevision:'SPEC-V1',techSource:'SYNTHETIC TECH REVIEW',
   artworkRevision:'ART-V1',artworkSource:'SYNTHETIC ARTWORK REVIEW'}];
  p.decisions=[
   {id:'D1',roundId:'R1',status:'rejected',actor:'SYNTHETIC BUYER APPROVER',
    party:'buyer',date:'2026-10-09',authority:'SYNTHETIC BUYER SIGNING RULE',
    evidence:'DEMO REJECTION EMAIL',comments:'SYNTHETIC FIT COMMENT: SHOULDER',
    fileRef:'DEMO PHOTO REF'},
   {id:'D2',roundId:'R2',status:'approved',actor:'SYNTHETIC BUYER APPROVER',
    party:'buyer',date:'2026-10-15',authority:'SYNTHETIC BUYER SIGNING RULE',
    evidence:'DEMO APPROVAL EMAIL',comments:'SYNTHETIC FIT APPROVED',
    fileRef:'DEMO APPROVED PHOTO'}];
  p.revisionRequests=[{id:'REV1',fromRoundId:'R1',reason:'SYNTHETIC FIT CORRECTION',
   requestedBy:'SYNTHETIC BUYER',date:'2026-10-10',evidence:'DEMO REVISE REQUEST',
   nextRoundId:'R2'}];
  return p;
 }
 static validate(p){
  const errors=[],notes=[];
  if(!p||p.version!==this.version||!p.header||!Array.isArray(p.categories)||
    !Array.isArray(p.rounds)||!Array.isArray(p.decisions)||
    !Array.isArray(p.revisionRequests)||!Array.isArray(p.audit))
    return {ok:false,errors:['Unsupported sampling saved record.'],notes};
  if(!this.text(p.id)||!Number.isSafeInteger(p.revision)||p.revision<0||
    JSON.stringify(p).length>2097152)errors.push('Sampling record ID/revision/size invalid.');
  const h=p.header,mandatory=['buyer','poNo','style','factory','requirementsSource'];
  if(mandatory.some(k=>!this.text(h[k])))
    errors.push('Buyer, PO, style, factory and buyer-defined requirement source are required.');
  if((this.text(h.currentTechRevision)&&!this.text(h.currentTechSource))||
    (this.text(h.currentArtworkRevision)&&!this.text(h.currentArtworkSource)))
    errors.push('Current spec/artwork revision requires a written version source.');
  for(const ref of [h.poReference,h.techReference,h.artworkReference])
    if(!this.referenceValid(ref))errors.push('Cross-app reference needs typed source identity and reviewed version.');
  const ids=new Set(),categories=new Map(),rounds=new Map(),byCategory=new Map();
  const pushId=(obj,label)=>{if(!this.text(obj?.id)||ids.has(obj.id))errors.push('Duplicate or missing '+label+' ID.');
    ids.add(obj?.id);};
  for(const c of p.categories){
   pushId(c,'category');if(!this.text(c.name)||!this.text(c.sourceRef)||!this.text(c.buyerAuthority)||
      typeof c.required!=='boolean')errors.push('Buyer-defined category needs source, required/applicability and expected buyer authority.');
   const lowered=this.text(c.name).toLowerCase();
   if([...categories.values()].some(v=>this.text(v.name).toLowerCase()===lowered))
     errors.push('Same buyer-defined sample category entered twice.');
   categories.set(c.id,c);byCategory.set(c.id,[]);
  }
  for(const r of p.rounds){
   pushId(r,'round');const cat=categories.get(r.categoryId);
   if(!cat)errors.push('Round must belong to an existing buyer-defined category.');
   if(!Number.isSafeInteger(r.round)||r.round<1||r.round>1000||
     !this.text(r.physicalId)||!this.text(r.colour)||!this.text(r.size)||
     !Number.isSafeInteger(r.quantity)||r.quantity<1||r.quantity>1000000)
     errors.push('Round needs unique positive round number, physical sample, colour, size and quantity.');
   if(!this.date(r.requestDate))errors.push('Sample request date requires explicit source.');
   if(r.requiredDate&&(!this.date(r.requiredDate)||!['calendar','business'].includes(r.calendarBasis)||
     !this.text(r.calendarSource)))errors.push('Due date requires dated buyer calendar basis and source.');
   if(r.sentDate&&(!this.date(r.sentDate)||!this.text(r.dispatchSource)))errors.push('Dispatch requires dated courier evidence.');
   if(r.receivedDate&&(!this.date(r.receivedDate)||!this.text(r.receiptSource)))
     errors.push('Buyer receipt requires dated receipt evidence.');
   if(r.receivedDate&&!r.sentDate)errors.push('Receipt cannot precede undocumented dispatch.');
   if(r.sentDate&&r.requestDate&&r.sentDate<r.requestDate)errors.push('Dispatch precedes request date.');
   if(r.receivedDate&&r.sentDate&&r.receivedDate<r.sentDate)errors.push('Receipt precedes dispatch date.');
   if((this.text(r.techRevision)&&!this.text(r.techSource))||
      (this.text(r.artworkRevision)&&!this.text(r.artworkSource)))
     errors.push('Submission revision needs separate spec or artwork evidence.');
   if(cat){
    const prior=byCategory.get(cat.id);
    if(prior.some(x=>x.round===r.round))errors.push('Buyer category round number must be unique.');
    prior.push(r);
   }
   rounds.set(r.id,r);
  }
  for(const [catId,rr] of byCategory){
   const sorted=[...rr].sort((a,b)=>a.round-b.round);
   for(let k=1;k<sorted.length;k++)
    if(sorted[k].round!==sorted[k-1].round+1)notes.push('Category '+catId+': round numbers have gaps; verify original history.');
  }
  for(const d of p.decisions){
   pushId(d,'decision');const r=rounds.get(d.roundId);
   if(!r||!['buyer','factory','technical'].includes(d.party)||
      !['approved','rejected','commented','needs-information'].includes(d.status)||
      !this.date(d.date)||!this.text(d.actor)||!this.text(d.authority)||
      !this.text(d.evidence))
    errors.push('Decision/comment requires linked round, status, actor, authority, date and evidence.');
   if(d.status==='approved'&&d.party==='buyer'&&(!r?.receivedDate||!r.receiptSource))
    errors.push('Buyer approval cannot be claimed before sourced buyer sample receipt.');
   if(d.date&&r?.requestDate&&d.date<r.requestDate)errors.push('Decision date predates sample request.');
   if(d.status==='commented'&&!this.text(d.comments))errors.push('Comment status needs the actual written comment.');
  }
  for(const rev of p.revisionRequests){
   pushId(rev,'revision request');
   if(!rounds.has(rev.fromRoundId)||!this.date(rev.date)||!this.text(rev.reason)||
      !this.text(rev.requestedBy)||!this.text(rev.evidence))
    errors.push('Revision request needs prior round, dated source, requester and reason.');
   if(rev.nextRoundId&&(!rounds.has(rev.nextRoundId)||
      rounds.get(rev.nextRoundId).categoryId!==rounds.get(rev.fromRoundId)?.categoryId||
      rounds.get(rev.nextRoundId).round<=rounds.get(rev.fromRoundId)?.round))
    errors.push('Revision request must link to a later round in the same sample category.');
  }
  return {ok:errors.length===0,errors,notes};
 }
 static status(p,categoryId,asOf=''){
  const category=p.categories.find(x=>x.id===categoryId);
  if(!category)return {status:'needs-information',issue:'Buyer category missing'};
  const relevant=p.rounds.filter(r=>r.categoryId===categoryId).sort((a,b)=>a.round-b.round);
  const last=relevant.at(-1);
  if(!last)return {categoryId,category:category.name,required:category.required,
   status:'needs-information',issue:'No sample requested',round:null,roundId:null,
   overdue:null,stale:false,requiredDate:null,calendarBasis:null,lastDecisionId:null,
   approver:null,approvedOn:null};
  const linked=p.decisions.filter(d=>d.roundId===last.id);
  const decision=linked.at(-1)||null;
  let status='pending',issue='',stale=false;
  if(decision){
   if(decision.status==='approved'){
    status=decision.party==='buyer'&&decision.actor&&decision.authority&&decision.evidence&&last.receivedDate?
     'approved':'needs-information';
    if(status!=='approved')issue='Factory/technical decision is not buyer approval';
   }else status=decision.status;
  }else if(last.receivedDate)status='pending-review';
  else if(last.sentDate)status='submitted';
  else status='draft';
  for(const [key,headKey] of [['techRevision','currentTechRevision'],['artworkRevision','currentArtworkRevision']]){
   if(this.text(p.header[headKey])&&this.text(last[key])&&
      this.text(p.header[headKey])!==this.text(last[key]))stale=true;
  }
  if(stale&&status==='approved'){status='stale-review';issue='Current linked source revision differs from approved sample';}
  else if(stale){issue='Linked source revision changed; repeat sample review';}
  const knownDate=Boolean(last.requiredDate&&this.date(last.requiredDate)&&
    ['calendar','business'].includes(last.calendarBasis)&&this.text(last.calendarSource)&&this.date(asOf));
  const overdue=knownDate?(asOf>last.requiredDate&&!['approved'].includes(status)):null;
  return {categoryId,category:category.name,required:category.required,
   status,issue,stale,round:last.round,roundId:last.id,
   lastDecisionId:decision?.id||null,approver:decision?.party==='buyer'&&status==='approved'?decision.actor:null,
   approvedOn:decision?.party==='buyer'&&status==='approved'?decision.date:null,
   overdue,requiredDate:last.requiredDate||null,calendarBasis:last.calendarBasis||null};
 }
 static summarize(p,asOf=''){
  const checked=this.validate(p);
  const statuses=Array.isArray(p?.categories)?p.categories.map(c=>this.status(p,c.id,asOf)):[];
  return {...checked,statuses,totalRequests:p?.categories?.length||0,
   rounds:p?.rounds?.length||0,
   buyerApproved:statuses.filter(s=>s.status==='approved').length,
   stale:statuses.filter(s=>s.status==='stale-review').length,
   overdue:statuses.filter(s=>s.overdue===true).length,
   unresolved:statuses.filter(s=>s.required&&s.status!=='approved').length};
 }
 static reviewedReference(p,review,asOf=''){
  const calc=this.summarize(p,asOf);
  if(!calc.ok)throw Error(calc.errors.join('\n'));
  if(review?.checked!==true||!this.text(review?.verifiedBy)||!this.date(review?.verifiedAt))
    throw Error('Manual source reviewer and explicit review date required.');
  const snapshot={poNo:p.header.poNo,buyer:p.header.buyer,style:p.header.style,
   factory:p.header.factory,requirementsSource:p.header.requirementsSource,
   currentTechRevision:p.header.currentTechRevision||'Needs Information',
   currentArtworkRevision:p.header.currentArtworkRevision||'Needs Information',
   categories:calc.statuses.map(x=>({category:x.category,required:x.required,
    status:x.status,round:x.round,roundId:x.roundId,lastDecisionId:x.lastDecisionId,
    approver:x.approver,approvedOn:x.approvedOn,stale:x.stale,
    overdue:x.overdue,sourceRevisionKnown:!x.stale})),
   localReviewOnly:true,notPPMGo:true,externalBuyerApprovalNotAuthenticated:true};
  return {sourceApp:'VESA Sampling & Approval 360',recordType:'SamplingApprovalRegister',
   recordId:p.id,revisionId:String(p.revision),sourceDate:p.updatedAt.slice(0,10),
   verifiedBy:this.text(review.verifiedBy),verifiedAt:review.verifiedAt,displaySnapshot:snapshot};
 }
}
root.VesaSamplingEngine=SamplingEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=SamplingEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
