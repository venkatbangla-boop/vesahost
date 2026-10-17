/* APP-09 immutable local evidence ledger and pure stage-specific projections.
 * Does not authorize PPM GO, AQL accept, TNA completion or real capacity claim.
 */
(function(root){
'use strict';
class ProductionDailyLedger {
 static flow(){if(!root.VesaProductionStageFlow||!root.VesaProductionWipBalance)throw Error('Production domain dependencies missing');return root.VesaProductionStageFlow;}
 static create(header){const E=this.flow();const now=new Date().toISOString();return {
  version:E.version,id:E.id('PROD'),revision:0,createdAt:now,updatedAt:now,
  header:E.copy(header),observations:[],stageOpenings:[],stageTargets:[],audit:[]};}
 static validate(record){const E=this.flow(),errors=[];
  if(!record||record.version!==E.version||!E.text(record.id)||!Number.isSafeInteger(record.revision)||record.revision<0||
   !['observations','stageOpenings','stageTargets','audit'].every(k=>Array.isArray(record[k]))){return {ok:false,errors:['Unsupported production ledger or version']};}
  errors.push(...E.errorsHeader(record.header));
  const bytes=JSON.stringify(record);if(bytes.length>2097152)errors.push('Production ledger exceeds safe record limit');
  if(record.observations.length>5000||record.stageOpenings.length>2000||record.stageTargets.length>2000)errors.push('Production evidence row limit reached');
  const allIds=new Set(),observations=new Map(),active=new Map(),targetIds=new Set(),targetActive=new Map(),openings=new Map();
  for(const opening of record.stageOpenings){
   errors.push(...E.errorsOpening(opening));const key=E.axis(opening);
   if(openings.has(key))errors.push('Repeated opening WIP for stage/line/lot/unit');
   openings.set(key,opening);
  }
  for(const target of record.stageTargets){
   errors.push(...E.errorsTarget(target));const key=E.axis(target);
   if(!E.text(target.id)||targetIds.has(target.id))errors.push('Missing/duplicate source target identity');
   targetIds.add(target.id);
   const existing=targetActive.get(key);
   if(existing&&(target.supersedes!==existing.id||!E.text(target.amendmentReason)||!E.text(target.amendmentSource)))
    errors.push('Source target revision requires former target ID, reason and written source');
   if(!existing&&target.supersedes)errors.push('Target amendment has no prior matching source');
   targetActive.set(key,target);
  }
  for(const row of record.observations){
   errors.push(...E.errorsObservation(row));if(allIds.has(row.id))errors.push('Duplicate observation ID');
   allIds.add(row.id);const key=E.dayKey(row),prior=active.get(key);
   if(prior){
    if(row.supersedes!==prior.id||!E.text(row.correctionReason)||!E.text(row.correctionSource))
     errors.push('Duplicate stage/day/shift/line/lot without explicit correction chain');
    if(prior.status==='locally-reviewed'&&row.status!=='locally-reviewed')
     errors.push('Cannot silently replace locally reviewed evidence with an unreviewed correction');
   }else if(row.supersedes)errors.push('Orphan production correction or changed identity');
   observations.set(row.id,row);active.set(key,row);
  }
  const keys=new Set([...openings.keys(),...targetActive.keys(),...[...active.values()].map(x=>E.axis(x))]),groups=[];
  for(const key of keys){
   const [stage,line,lot,unit]=key.split('\u001f');
   const all=[...active.values()].filter(x=>E.axis(x)===key),reviewed=all.filter(x=>x.status==='locally-reviewed');
   let good=0;for(const row of reviewed){good+=row.good;if(!Number.isSafeInteger(good))errors.push('Cumulative stage good exceeds safe integer range');}
   let wip;
   try{wip=root.VesaProductionWipBalance.calculate(openings.get(key)?.opening??null,reviewed);}catch(e){errors.push(stage+'/'+line+': '+e.message);wip={closing:null,pending:'Invalid source movements'};}
   const target=targetActive.get(key)||null;
   let balance=null;
   try{balance=root.VesaProductionWipBalance.targetBalance(target?.quantity??null,good);}catch(e){errors.push(e.message);}
   groups.push({stage,line,lot,unit,locallyReviewedGood:good,unreviewedDays:all.length-reviewed.length,
    sourceTarget:target?.quantity??null,remaining:balance,wip,
    targetProvenance:target?.sourceRef||null,notAQLRelease:true,notTnaCompletion:true});
  }
  return {ok:errors.length===0,errors,groups,activeCount:active.size,
   draft:true,status:'DRAFT / SOURCE-REVIEW ONLY',notApprovedShipment:true};
 }
 static appendObservation(record,event){const E=this.flow();
  const proposed=E.copy(record);proposed.observations.push(E.copy(event));proposed.revision++;
  proposed.updatedAt=new Date().toISOString();proposed.audit.push({revision:proposed.revision,at:proposed.updatedAt,
   action:event.supersedes?'Document production correction':'Record stage daily observation',recordId:event.id});
  const result=this.validate(proposed);if(!result.ok)throw Error(result.errors.join('; '));
  return proposed;
 }
 static appendTarget(record,target){const E=this.flow(),next=E.copy(record);
  next.stageTargets.push(E.copy(target));next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'Append source target revision',recordId:target.id});
  const result=this.validate(next);if(!result.ok)throw Error(result.errors.join('; '));return next;
 }
 static appendOpening(record,opening){const E=this.flow(),next=E.copy(record);
  next.stageOpenings.push(E.copy(opening));next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'Record reviewed opening WIP source'});
  const result=this.validate(next);if(!result.ok)throw Error(result.errors.join('; '));return next;
 }
}
root.VesaProductionDailyLedger=ProductionDailyLedger;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionDailyLedger;
})(typeof globalThis!=='undefined'?globalThis:this);
