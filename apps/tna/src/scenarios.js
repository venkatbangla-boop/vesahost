(function(root){
  'use strict';
  const ENGINE_VERSION='TNA360-SCENARIO-0.9.0';
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
    const result=scheduling.schedule(plan.tasks||[],plan.edges||[],{calendar:plan.calendars?.[0],calendars:plan.calendars||[],startDate:start,requiredDate:required,asOfDate:start,nearCriticalDays:3});
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
  function applyCalendarChanges(plan,changes=[]){
    const errors=[];
    for(const change of changes){
      const calendar=(plan.calendars||[]).find(item=>item.calendarId===change.calendarId);
      if(!calendar){errors.push('Scenario references a missing calendar.');continue;}
      for(const key of ['weekendDays','holidays','shutdowns'])if(change[key]!=null){
        if(!Array.isArray(change[key]))errors.push(`Scenario ${key} must be a list.`);
        else calendar[key]=[...new Set(change[key].map(clean).filter(Boolean))];
      }
      if(change.name!=null)calendar.name=clean(change.name)||calendar.name;
      calendar.revision=Number(calendar.revision||0)+1;
    }
    return errors;
  }
  function applyRouteChanges(plan,changes=[]){
    const errors=[];
    for(const change of changes){
      const task=(plan.tasks||[]).find(item=>item.taskId===change.taskId);
      if(!task){errors.push('Scenario route references a missing task.');continue;}
      if(change.calendarId!=null&&!plan.calendars?.some(item=>item.calendarId===change.calendarId)){errors.push('Scenario route references a missing calendar.');continue;}
      if(change.ownerParty!=null)task.ownerParty=clean(change.ownerParty)||task.ownerParty;
      if(change.calendarId!=null)task.calendarId=clean(change.calendarId);
      task.recoveryAction=clean(change.reason)||'Scenario route adjustment';
    }
    return errors;
  }
  function applyCapacityChanges(plan,changes=[]){
    const errors=[];
    for(const change of changes){
      const operation=(plan.operations||[]).find(item=>item.operationId===change.operationId);
      if(!operation){errors.push('Scenario capacity change references a missing operation.');continue;}
      const resourceId=clean(change.resourceId),date=clean(change.date);
      if(!resourceId||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)){errors.push('Scenario capacity change needs a resource and date.');continue;}
      const values=['allocatedLines','availableLines'].map(key=>Number(change[key]));
      if(values.some(value=>!Number.isFinite(value)||value<0)){errors.push('Scenario capacity values must be non-negative numbers.');continue;}
      operation.datedCapacityEntries=Array.isArray(operation.datedCapacityEntries)?operation.datedCapacityEntries:[];
      const existing=operation.datedCapacityEntries.find(item=>item.resourceId===resourceId&&item.date===date);
      const next={...(existing||{}),resourceId,date,allocatedLines:values[0],availableLines:values[1],scenarioAdjusted:true};
      if(existing)Object.assign(existing,next);else operation.datedCapacityEntries.push(next);
    }
    return errors;
  }
  function applyScenarioChanges(plan,input={}){
    return [
      ...applyDurationAdjustments(plan,input.durationAdjustments||[]),
      ...applyCalendarChanges(plan,input.calendarChanges||[]),
      ...applyRouteChanges(plan,input.routeChanges||[]),
      ...applyCapacityChanges(plan,input.capacityChanges||[])
    ];
  }
  function capacityPreview(plan,input={}){
    if(!input.capacity)return {status:'not-entered',reason:'No verified capacity change was entered.'};
    const result=operations?.verifiedRateDays?.({plannedQty:input.capacity.plannedQty??plan?.order?.totalQty,completedQty:input.capacity.completedQty||0,verifiedDailyOutput:input.capacity.verifiedDailyOutput});
    return result||{status:'needs-information',reason:'Capacity engine is not loaded.'};
  }
  function resourceEntries(plan){
    return (plan?.operations||[]).flatMap(operation=>(operation.datedCapacityEntries||[]).map(entry=>({...entry,recordId:plan.recordId,style:plan.order?.styles?.[0]?.styleNo||'',po:plan.order?.poNumbers?.[0]||'',operationId:operation.operationId||null})));
  }
  function resourceLoadPreview(plan){
    const entries=resourceEntries(plan);
    const checked=operations?.checkSharedCapacity?.(entries)||{ok:true,overAllocations:[]};
    return {entries,ok:checked.ok,overAllocations:checked.overAllocations||[],totalEntries:entries.length};
  }
  function forecastProvenance(plan,schedule){
    const raw=schedule?.raw;
    return {status:schedule?.status||'needs-information',engineVersion:raw?.engineVersion||null,inputRevision:Number(plan?.revision||0),calculatedAt:raw?.generatedAt||null,calendarRevisions:raw?.calendarRevisions||[],warnings:raw?.warnings||[],missingInputs:raw?.missingInputs||[],sourceTaskIds:schedule?.criticalTaskIds||[]};
  }
  function compareScenario(baseSchedule,scenarioSchedule,baseLoad,scenarioLoad,calendar){
    const baseCritical=baseSchedule?.criticalTaskIds||[],scenarioCritical=scenarioSchedule?.criticalTaskIds||[];
    const changedCriticalTaskIds=[...new Set([...baseCritical,...scenarioCritical])].filter(id=>baseCritical.includes(id)!==scenarioCritical.includes(id));
    const gained=baseSchedule?.status==='calculated'&&scenarioSchedule?.status==='calculated'?scheduling.workdayDifference(scenarioSchedule.forecastDate,baseSchedule.forecastDate,calendar||undefined,'working'):null;
    return {baseForecastDate:baseSchedule?.forecastDate||null,scenarioForecastDate:scenarioSchedule?.forecastDate||null,workingDaysGained:gained,criticalTaskIdsBefore:baseCritical,criticalTaskIdsAfter:scenarioCritical,changedCriticalTaskIds,resourceEntriesBefore:baseLoad?.totalEntries||0,resourceEntriesAfter:scenarioLoad?.totalEntries||0,resourceConflictsBefore:baseLoad?.overAllocations?.length||0,resourceConflictsAfter:scenarioLoad?.overAllocations?.length||0};
  }
  function previewScenario(plan,input={},context={}){
    if(!plan||!Array.isArray(plan.tasks))return {ok:false,error:'A valid TNA plan is required.'};
    const base=clone(plan),candidate=clone(plan),violations=applyScenarioChanges(candidate,input);
    const baseSchedule=planSchedule(base),scenarioSchedule=planSchedule(candidate);
    const capacity=capacityPreview(candidate,input);
    if(capacity.status&&capacity.status!=='calculated'&&capacity.status!=='not-entered')violations.push(capacity.message||capacity.reason||'Capacity remains Needs Information.');
    const baseLoad=resourceLoadPreview(base),scenarioLoad=resourceLoadPreview(candidate);
    if(!scenarioLoad.ok)violations.push('Shared resource capacity remains over-allocated in this scenario.');
    const comparison=compareScenario(baseSchedule,scenarioSchedule,baseLoad,scenarioLoad,candidate.calendars?.[0]);
    const branch={scenarioId:input.scenarioId||makeId('scenario'),name:clean(input.name)||'Recovery scenario',engineVersion:ENGINE_VERSION,createdAt:context.createdAt||now(),createdBy:context.actorId||plan.ownerUserId||'local-browser-user',baseRecordId:plan.recordId,baseRevision:plan.revision||0,status:violations.length?'needs-review':'preview',changes:clone(input),baseForecastDate:comparison.baseForecastDate,scenarioForecastDate:comparison.scenarioForecastDate,workingDaysGained:comparison.workingDaysGained,baseScheduleStatus:baseSchedule.status,scenarioScheduleStatus:scenarioSchedule.status,capacity,changedCriticalTaskIds:comparison.changedCriticalTaskIds,resourceLoad:scenarioLoad,comparison,forecastProvenance:forecastProvenance(candidate,scenarioSchedule),violations};
    return {ok:true,branch,previewPlan:candidate,baseSchedule,scenarioSchedule,baseLoad,scenarioLoad,comparison,violations};
  }
  function applyScenario(plan,branch,context={}){
    if(!context.confirm)return {ok:false,error:'Apply Scenario requires explicit confirmation.'};
    if(!clean(context.reason))return {ok:false,error:'Apply Scenario requires a revision reason.'};
    if(!branch||!branch.scenarioId)return {ok:false,error:'A previewed scenario branch is required.'};
    if((plan.revision||0)!==(branch.baseRevision||0))return {ok:false,error:'Scenario base revision no longer matches the current TNA.'};
    const next=clone(plan),timestamp=context.createdAt||now();
    const errors=applyScenarioChanges(next,branch.changes||{});
    if(errors.length)return {ok:false,error:errors.join(' ')};
    next.revision=Number(next.revision||0)+1;
    next.updatedAt=timestamp;
    next.scenarioBranches=[...(next.scenarioBranches||[]),{...clone(branch),status:'applied',appliedAt:timestamp,appliedBy:context.actorId||next.ownerUserId,applyReason:clean(context.reason)}];
    next.revisionEvents=[...(next.revisionEvents||[]),{eventId:makeId('revision'),eventType:'scenario-applied',revision:next.revision,actorId:context.actorId||next.ownerUserId,createdAt:timestamp,reason:clean(context.reason),details:{scenarioId:branch.scenarioId,baseRevision:branch.baseRevision,workingDaysGained:branch.workingDaysGained}}];
    next.auditEvents=[...(next.auditEvents||[]),{eventId:makeId('audit'),eventType:'scenario-applied',actorId:context.actorId||next.ownerUserId,createdAt:timestamp,details:{scenarioId:branch.scenarioId}}];
    return {ok:true,plan:next};
  }
  function detectPortfolioCapacityConflicts(plans=[]){
    const entries=plans.flatMap(resourceEntries),grouped=new Map();
    for(const entry of entries){
      const key=[entry.resourceId,entry.date].join('|');
      const item=grouped.get(key)||{resourceId:entry.resourceId,date:entry.date,allocatedLines:0,availableLines:Number(entry.availableLines||0),orders:[]};
      item.allocatedLines+=Number(entry.allocatedLines||0);
      item.availableLines=Math.min(item.availableLines||Number(entry.availableLines||0),Number(entry.availableLines||0));
      item.orders.push({recordId:entry.recordId,style:entry.style,po:entry.po,allocatedLines:Number(entry.allocatedLines||0),operationId:entry.operationId});
      grouped.set(key,item);
    }
    const loads=[...grouped.values()];
    const conflicts=loads.filter(item=>item.allocatedLines>item.availableLines).map(item=>({...item,overAllocatedBy:item.allocatedLines-item.availableLines}));
    return {ok:conflicts.length===0,conflicts,loads,entriesCount:entries.length};
  }
  function filterPortfolioPlans(plans=[],filters={}){
    return plans.filter(plan=>{
      const order=plan.order||{};
      const buyer=clean(order.buyerName),factory=clean(order.factoryName),po=(order.poNumbers||[]).map(clean);
      return (!filters.buyer||buyer===filters.buyer)&&(!filters.factory||factory===filters.factory)&&(!filters.po||po.includes(filters.po));
    });
  }
  function portfolioSummary(plans=[],filters={}){
    const visible=filterPortfolioPlans(plans,filters),capacity=detectPortfolioCapacityConflicts(visible),conflictIds=new Set(capacity.conflicts.flatMap(item=>item.orders.map(order=>order.recordId)));
    const orders=visible.map(plan=>{const schedule=planSchedule(plan);const shipment=operations?.reconcileShipmentLots?.(plan.order?.totalQty,plan.shipmentLots||[],{inspectionPassed:plan.finalInspectionDecision?.status==='passed'})||null;return {recordId:plan.recordId,style:plan.order?.styles?.[0]?.styleNo||'',buyer:plan.order?.buyerName||'',factory:plan.order?.factoryName||'',po:plan.order?.poNumbers?.[0]||'',revision:Number(plan.revision||0),forecastDate:schedule.forecastDate||null,forecastStatus:schedule.status,risk:conflictIds.has(plan.recordId)?'capacity-conflict':schedule.workingDaysEarlyOrLate>0?'delayed':schedule.status==='calculated'?'calculated':'needs-information',shipment,forecastProvenance:forecastProvenance(plan,schedule)};});
    return {filters,orders,capacity,accessibleOrderCount:orders.length,conflictCount:capacity.conflicts.length};
  }
  const api={ENGINE_VERSION,previewScenario,applyScenario,detectPortfolioCapacityConflicts,filterPortfolioPlans,portfolioSummary,forecastProvenance};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaScenarios=api;
})(typeof globalThis!=='undefined'?globalThis:this);
