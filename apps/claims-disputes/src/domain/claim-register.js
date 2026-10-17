/* APP-14 owned local claim case, documentary findings/responses/decisions.
 * Pure source history: no AQL, Shipment, PO or LC mutations, no legal authority or payment provider.
 */
(function(root){
'use strict';
class VesaClaimRegister{
 static version='VESA-CLAIMS-DISPUTES-360-1';
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static text(v){return typeof v==='string'?v.trim():'';}
 static valid(v,max=280){return !!this.text(v)&&this.text(v).length<=max;}
 static date(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v))return false;
  const t=Date.parse(v+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v;}
 static id(prefix='CLM'){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static create(h={}){
  const now=new Date().toISOString();
  return{version:this.version,id:this.id('CASE'),revision:0,mode:'local',createdAt:now,updatedAt:now,
   authority:'LOCAL CLAIM SOURCE ONLY — NO LIABILITY, BANK SETTLEMENT OR AQL ALTERATION',
   header:{caseNumber:this.text(h.caseNumber),buyer:this.text(h.buyer),supplier:this.text(h.supplier),
    poNo:this.text(h.poNo),shipmentRef:this.text(h.shipmentRef),claimCategory:this.text(h.claimCategory),
    openedDate:this.text(h.openedDate),sourceRef:this.text(h.sourceRef),
    allegationSummary:this.text(h.allegationSummary),reviewedBy:this.text(h.reviewedBy),
    reviewDate:this.text(h.reviewDate)},
   findings:[],evidence:[],responses:[],agreements:[],settlements:[],decisions:[],audit:[]};
 }
 static evidenceErrors(e){
  const out=[];
  for(const key of ['id','sourceApp','recordType','recordId','revisionId','sourceRef','summary','reviewedBy'])
   if(!this.valid(e?.[key],500))out.push('Read-only evidence requires '+key);
  if(!this.date(e?.sourceDate)||!this.date(e?.reviewDate))
   out.push('Evidence requires sourced and human review dates');
  if(e?.changesAQL===true||e?.buyerApproved===true||e?.externallyAuthenticated===true)
   out.push('Claim evidence cannot edit inspection/confirm buyer approval or external authentication');
  return out;
 }
 static responseErrors(x){
  const out=[];
  for(const k of ['id','party','summary','sourceRef','reviewedBy'])
   if(!this.valid(x?.[k],700))out.push('Source correspondence requires '+k);
  if(!this.date(x?.receivedDate)||!this.date(x?.reviewDate))out.push('Correspondence needs received and reviewed dates');
  if(!['pending','disputed','proposed','acknowledged-receipt-only'].includes(x?.stance))
   out.push('Correspondence statement must be a source-entered non-authoritative stance');
  if(x?.liabilityAdmitted===true||x?.messageSent===true||x?.legallyBinding===true)
   out.push('Local response cannot claim liability admission, message delivery or legal agreement');
  return out;
 }
 static decisionErrors(d,record){
  const errors=[];
  for(const k of ['id','reviewedBy','decisionSourceRef'])
   if(!this.valid(d?.[k],350))errors.push('Claim local decision needs '+k);
  if(!this.date(d?.decisionDate)||!this.date(d?.reviewDate))
   errors.push('Local claim decision needs exact dated evidence');
  if(!['open','in-review','agreed','rejected','closed'].includes(d?.newState))
   errors.push('Claim state must be source-entered open/in-review/agreed/rejected/closed');
  if(['agreed','rejected','closed'].includes(d?.newState)&&
   (!this.valid(d?.externalAuthorityRef)||!this.valid(d?.externallyNamedParty)))
   errors.push('Agreement/rejection/closure needs explicitly claimed outside-party authority evidence');
  if(d?.newState==='closed'&&!['documented-settlement','documented-rejection','documented-withdrawal'].includes(d?.closureBasis))
   errors.push('Closure requires an explicit documentary basis, never receipt or AQL inference');
  if(d?.newState==='agreed'&&!record.agreements.length)
   errors.push('Agreed local state requires recorded separately sourced settlement agreement');
  if(d?.liabilityAdmittedAutomatically===true||d?.bankPaymentConfirmedAutomatically===true)
   errors.push('No automatic liability admission or bank settlement from local state');
  return errors;
 }
 static validate(p){
  const errors=[];
  if(!p||p.version!==this.version||!this.valid(p.id,180)||
   !Number.isSafeInteger(p.revision)||p.revision<0||
   !['findings','evidence','responses','agreements','settlements','decisions','audit'].every(k=>Array.isArray(p[k])))
   return{ok:false,errors:['Unsupported Claims record, version or append-only state']};
  if(p.authority!=='LOCAL CLAIM SOURCE ONLY — NO LIABILITY, BANK SETTLEMENT OR AQL ALTERATION')
   errors.push('A Claims local record cannot certify liability, AQL results or actual bank transfer');
  for(const k of ['caseNumber','buyer','supplier','poNo','shipmentRef','claimCategory',
   'sourceRef','allegationSummary','reviewedBy'])
   if(!this.valid(p.header?.[k],800))errors.push('Claim header needs sourced '+k);
  if(!this.date(p.header?.openedDate)||!this.date(p.header?.reviewDate))
   errors.push('Claim opening and local review dates required');
  try{if(JSON.stringify(p).length>2097152)errors.push('Local claim record exceeds portable safety limit');}
  catch{errors.push('Claim record is not serializable');}
  const caps={findings:1500,evidence:2000,responses:2000,agreements:120,settlements:2500,decisions:2000,audit:10000};
  for(const [k,max]of Object.entries(caps))if(p[k].length>max)errors.push('Excessive claim '+k+' entries');
  const ids=new Set(),agreements=new Map(),currencies=new Set();
  for(const x of p.findings){
   if(!root.VesaClaimExposure)errors.push('Claim exposure source engine missing');
   else errors.push(...root.VesaClaimExposure.findingErrors(x));
   if(ids.has(x?.id))errors.push('Duplicate immutable claim evidence ID');ids.add(x?.id);
  }
  for(const x of p.evidence){errors.push(...this.evidenceErrors(x));
   if(ids.has(x?.id))errors.push('Duplicate immutable claim evidence ID');ids.add(x?.id);}
  for(const x of p.responses){errors.push(...this.responseErrors(x));
   if(ids.has(x?.id))errors.push('Duplicate immutable claim evidence ID');ids.add(x?.id);}
  for(const x of p.agreements){
   if(!root.VesaClaimSettlementHistory)errors.push('Claim settlement history validator unavailable');
   else errors.push(...root.VesaClaimSettlementHistory.agreementErrors(x));
   if(currencies.has(x?.currency))errors.push('Multiple current agreements in same currency require future explicit signed revision policy');
   currencies.add(x?.currency);
   if(ids.has(x?.id))errors.push('Duplicate immutable claim evidence ID');ids.add(x?.id);
   agreements.set(x?.id,x);
  }
  for(const x of p.settlements){
   if(!root.VesaClaimSettlementHistory)errors.push('Claim settlement history validator unavailable');
   else errors.push(...root.VesaClaimSettlementHistory.settlementErrors(x,agreements));
   if(ids.has(x?.id))errors.push('Duplicate immutable claim evidence ID');ids.add(x?.id);
  }
  if(root.VesaClaimSettlementHistory)errors.push(...root.VesaClaimSettlementHistory.reconciliationErrors(p));
  for(const x of p.decisions){
   errors.push(...this.decisionErrors(x,p));
   if(ids.has(x?.id))errors.push('Duplicate immutable claim evidence ID');ids.add(x?.id);
  }
  if(p.audit.length!==p.revision)errors.push('Claim revision and audit event count differ');
  for(let i=0;i<p.audit.length;i++)if(p.audit[i]?.revision!==i+1||
   !this.valid(p.audit[i]?.action,300)||!this.valid(p.audit[i]?.at,100))
   errors.push('Append-only claim audit events must be chronological and sequential');
  return{ok:errors.length===0,errors};
 }
 static append(p,kind,input){
  const group={finding:'findings',evidence:'evidence',response:'responses',agreement:'agreements',
   settlement:'settlements',decision:'decisions'}[kind];
  if(!group)throw Error('Unknown local claim evidence type');
  const before=this.validate(p);if(!before.ok)throw Error(before.errors.join('; '));
  const next=this.copy(p),entry=this.copy({...input,id:input?.id||this.id('CLM-'+kind.toUpperCase())});
  next[group].push(entry);next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,
   action:'Source-reviewed '+kind+' appended; NOT external liability/payment confirmation',recordId:entry.id});
  const checked=this.validate(next);if(!checked.ok)throw Error(checked.errors.join('; '));
  return next;
 }
 static localStatus(p){
  const v=this.validate(p);if(!v.ok)throw Error(v.errors.join('; '));
  const last=p.decisions.at(-1);
  return{state:last?.newState||'open',localEvidenceOnly:true,sourceRef:last?.decisionSourceRef||p.header.sourceRef,
   externallyAuthenticated:false,AQLChanged:false,bankSettlementNotified:false,
   notAutomaticClose:true};
 }
}
root.VesaClaimRegister=VesaClaimRegister;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimRegister;
})(typeof globalThis!=='undefined'?globalThis:this);
