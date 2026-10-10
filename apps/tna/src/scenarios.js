(function(root){
  'use strict';
  const ENGINE_VERSION='TNA360-SCENARIO-0.8.0';
  const scheduling=root.VesaTnaScheduling||(typeof require==='function'?require('./scheduling.js'):null);
  const operations=root.VesaTnaOperations||(typeof require==='function'?require('./operations.js'):null);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const clean=value=>String(value??'').trim();
  const now=()=>new Date().toISOString();
  const makeId=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  function planSchedule(plan){
    const start=plan?.commitments?.orderConfirmedOn||plan?.commitments?.poReceivedOn;
    const required=plan?.commitments?.buyerRequiredExFactory;
    if(!scheduling)return {status:'needs-information',reason:'Scheduling engine is not loaded.'};
    if(!start||!required)return {status:'needs-information',reason:'Explicit order start and buyer required ex-factory dates are required.'};
    const result=scheduling.schedule(plan.tasks||[],plan.edges||[],{calendar:plan.calendars?.[0],startDate:start,requiredDate:required,asOfDate:start,nearCriticalDays:3});
    if(result.validity!=='valid')return {status:'blocked',reason:[...(result.errors||[]),...(result.missingInputs||[])].join('; ')||'Schedule is invalid.',raw:result};
    return {status:'calculated',forecastDate:result.project.forecastDate,workingDaysEarlyOrLate:result.project.workingDaysEarlyOrLate,criticalTaskIds:Object.values(result.taskResults||{}).filter(item=>item.isCritical).map(item=>item.taskId),raw:result};
  }
  function applyDurationAdjustments(plan,adjustments=[]){
    const errors=[];
    for(const change of adjustments){
      const task=(plan.tasks||[]).find(item=>item.taskId===change.taskId);
      if(!task){errors.push('Scenario references a missing task.');continue;}
      const nextDuration=Number(change.durationUnits);
      if(!Number.isFinite(nextDuration)||nextDuration<0){errors.push('Scenario duration must be a non-negative number.');continue;}
      task.durationUnits=nextDuration;
      task.recoveryAction=clean(change.reason)||'Scenario duration adjustment';
    }
    return errors;
  }
  function capacityPreview(plan,input={}){
    if(!input.capacity)return {status:'not-entered',reason:'No verified capacity change was entered.'};
    const result=operations?.verifiedRateDays?.({plannedQty:input.capacity.plannedQty??plan?.order?.totalQty,completedQty:input.capacity.completedQty||0,verifiedDailyOutput:input.capacity.verifiedDailyOutput});
    return result||{status:'needs-information',reason:'Capacity engine is not loaded.'};
  }
  function previewScenario(plan,input={},context={}){
    if(!plan||!Array.isArray(plan.tasks))return {ok:false,error:'A valid TNA plan is required.'};
    const base=clone(plan),candidate=clone(plan);
    const violations=applyDurationAdjustments(candidate,input.durationAdjustments||[]);
    const baseSchedule=planSchedule(base);
    const scenarioSchedule=planSchedule(candidate);
    const capacity=capacityPreview(candidate,input);
    if(capacity.status&&capacity.status!=='calculated'&&capacity.status!=='not-entered')violations.push(capacity.message||capacity.reason||'Capacity remains Needs Information.');
    const gained=baseSchedule.status==='calculated'&&scenarioSchedule.status==='calculated'?scheduling.workdayDifference(scenarioSchedule.forecastDate,baseSchedule.forecastDate,candidate.calendars?.[0],'working'):null;
    const branch={scenarioId:input.scenarioId||makeId('scenario'),name:clean(input.name)||'Recovery scenario',engineVersion:ENGINE_VERSION,createdAt:context.createdAt||now(),createdBy:context.actorId||plan.ownerUserId||'local-browser-user',baseRecordId:plan.recordId,baseRevision:plan.revision||0,status:violations.length?'needs-review':'preview',changes:clone(input),baseForecastDate:baseSchedule.forecastDate||null,scenarioForecastDate:scenarioSchedule.forecastDate||null,workingDaysGained:gained==null?null:gained,baseScheduleStatus:baseSchedule.status,scenarioScheduleStatus:scenarioSchedule.status,capacity,changedCriticalTaskIds:scenarioSchedule.criticalTaskIds||[],violations};
    return {ok:true,branch,previewPlan:candidate,baseSchedule,scenarioSchedule,violations};
  }
  function applyScenario(plan,branch,context={}){
    if(!context.confirm)return {ok:false,error:'Apply Scenario requires explicit confirmation.'};
    if(!clean(context.reason))return {ok:false,error:'Apply Scenario requires a revision reason.'};
    if(!branch||!branch.scenarioId)return {ok:false,error:'A previewed scenario branch is required.'};
    if((plan.revision||0)!==(branch.baseRevision||0))return {ok:false,error:'Scenario base revision no longer matches the current TNA.'};
    const next=clone(plan),timestamp=context.createdAt||now();
    const errors=applyDurationAdjustments(next,branch.changes?.durationAdjustments||[]);
    if(errors.length)return {ok:false,error:errors.join(' ')};
    next.revision=Number(next.revision||0)+1;
    next.updatedAt=timestamp;
    next.scenarioBranches=[...(next.scenarioBranches||[]),{...clone(branch),status:'applied',appliedAt:timestamp,appliedBy:context.actorId||next.ownerUserId,applyReason:clean(context.reason)}];
    next.revisionEvents=[...(next.revisionEvents||[]),{eventId:makeId('revision'),eventType:'scenario-applied',revision:next.revision,actorId:context.actorId||next.ownerUserId,createdAt:timestamp,reason:clean(context.reason),details:{scenarioId:branch.scenarioId,baseRevision:branch.baseRevision,workingDaysGained:branch.workingDaysGained}}];
    next.auditEvents=[...(next.auditEvents||[]),{eventId:makeId('audit'),eventType:'scenario-applied',actorId:context.actorId||next.ownerUserId,createdAt:timestamp,details:{scenarioId:branch.scenarioId}}];
    return {ok:true,plan:next};
  }
  function detectPortfolioCapacityConflicts(plans=[]){
    const entries=[];
    for(const plan of plans){
      for(const op of plan.operations||[]){
        for(const entry of op.datedCapacityEntries||[]){
          entries.push({...entry,recordId:plan.recordId,style:plan.order?.styles?.[0]?.styleNo||'',po:plan.order?.poNumbers?.[0]||'',operationId:op.operationId||null});
        }
      }
    }
    const grouped=new Map();
    for(const entry of entries){
      const key=[entry.resourceId,entry.date].join('|');
      const item=grouped.get(key)||{resourceId:entry.resourceId,date:entry.date,allocatedLines:0,availableLines:Number(entry.availableLines||0),orders:[]};
      item.allocatedLines+=Number(entry.allocatedLines||0);
      item.availableLines=Math.min(item.availableLines||Number(entry.availableLines||0),Number(entry.availableLines||0));
      item.orders.push({recordId:entry.recordId,style:entry.style,po:entry.po,allocatedLines:Number(entry.allocatedLines||0),operationId:entry.operationId});
      grouped.set(key,item);
    }
    const conflicts=[...grouped.values()].filter(item=>item.allocatedLines>item.availableLines).map(item=>({...item,overAllocatedBy:item.allocatedLines-item.availableLines}));
    return {ok:conflicts.length===0,conflicts,entriesCount:entries.length};
  }
  const api={ENGINE_VERSION,previewScenario,applyScenario,detectPortfolioCapacityConflicts};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaScenarios=api;
})(typeof globalThis!=='undefined'?globalThis:this);
