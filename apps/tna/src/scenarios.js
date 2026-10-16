(function(root){
  'use strict';
  const ENGINE_VERSION='TNA360-SCENARIO-0.9.0';
  const scheduling=root.VesaTnaScheduling||(typeof require==='function'?require('./scheduling.js'):null);
  const operations=root.VesaTnaOperations||(typeof require==='function'?require('./operations.js'):null);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const clean=value=>String(value??'').trim();
  const now=()=>new Date().toISOString();
  const makeId=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;


  /**
   * Owns the legacy Recovery editor's calendar input safety boundary.
   * The only authorized editable factory-calendar path is domain's separate
   * confirmed calendar form. An unreviewed alternate holiday/weekend MUST NOT
   * be applied to a scenario, compared across unlike calendars, or used to
   * derive invented working-day savings. This owner reads but never mutates.
   */
  class TnaScenarioCalendarGuard {
    /** Exact ISO civil date check; rejects malformed or impossible inputs. */
    static validDate(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
      const [year,month,day]=value.split('-').map(Number);
      const d=new Date(Date.UTC(year,month-1,day));
      return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
    }
    /** Missing user-confirmed calendar is not a source of forecast dates. */
    static confirmedIssue(plan){
      const calendars=Array.isArray(plan?.calendars)?plan.calendars:[];
      const refs=new Set((plan?.tasks||[]).map(t=>t.calendarId||'default'));
      refs.add('default');
      for(const ref of refs){
        const c=calendars.find(x=>x?.calendarId===ref);
        if(!c)return 'The selected factory/task working calendar is missing.';
        if(c.source!=='user-confirmed'||!c.sourceReference||
          !Array.isArray(c.workingWeek)||!c.workingWeek.length||
          c.workingWeek.length>7||
          c.workingWeek.some(d=>!Number.isInteger(d)||d<0||d>6)||
          new Set(c.workingWeek).size!==c.workingWeek.length)
          return 'Confirm source-backed factory working days using Factory Working Calendar before calculating a recovery forecast.';
        for(const field of ['holidays','shutdowns']){
          const dates=c[field]||[];
          if(!Array.isArray(dates)||dates.length>366||
            dates.some(d=>!this.validDate(d))||new Set(dates).size!==dates.length)
            return 'Recorded factory holiday or shutdown dates need correction before scheduling.';
        }
        if((c.holidays||[]).some(d=>(c.shutdowns||[]).includes(d)))
          return 'A date cannot be both a factory holiday and shutdown.';
      }
      const start=plan?.commitments?.orderConfirmedOn||plan?.commitments?.poReceivedOn;
      const required=plan?.commitments?.buyerRequiredExFactory;
      if(start&&!this.validDate(start)||required&&!this.validDate(required))
        return 'Review the order start and buyer-required civil dates before scheduling.';
      return null;
    }
    /** Calendar proposals are staged for review but never used as accepted inputs. */
    static proposedIssue(input={}){
      const changes=input?.calendarChanges;
      if(changes===undefined||changes===null)return null;
      if(!Array.isArray(changes))
        return 'Proposed calendar changes must be a reviewed list.';
      if(!changes.length)return null;
      return 'Recovery calendar changes cannot be calculated or applied as verified factory working days. Review the source, holidays and working week in Factory Working Calendar first.';
    }
    /**
     * Verify the same-order, same-default-revision candidate and local written
     * provenance before any preview uses its working days. Form-level fields
     * cannot impersonate confirmation; only domain-recorded candidates qualify.
     */
    static alternativeIssue(plan,input={}){
      if(!Object.prototype.hasOwnProperty.call(input,'confirmedAlternativeCalendarId'))return null;
      const id=input.confirmedAlternativeCalendarId;
      if(typeof id!=='string'||!id.trim())return 'Select a recorded, locally confirmed alternative factory calendar.';
      const primary=plan?.calendars?.find(item=>item.calendarId==='default');
      const candidate=plan?.calendars?.find(item=>item.calendarId===id);
      if(!primary||!candidate||candidate.calendarKind!=='confirmed-alternative'||
        candidate.source!=='user-confirmed'||!candidate.confirmedAt||
        !candidate.confirmedBy||!candidate.sourceReference||
        candidate.approvalScope!=='local-source-confirmation-only'||
        candidate.orderRecordId!==plan.recordId||
        candidate.basedOnCalendarId!=='default'||
        candidate.basedOnCalendarRevision!==primary.revision||
        candidate.basedOnConfirmedAt!==primary.confirmedAt)
        return 'The selected alternative is missing, stale or not locally source-confirmed for this order.';
      if((plan.tasks||[]).some(task=>(task.calendarId||'default')!=='default'))
        return 'Separate task calendars require their own reviewed route; no combined calendar gain can be calculated.';
      if(Array.isArray(input.routeChanges)&&input.routeChanges.some(change=>change?.calendarId&&change.calendarId!=='default'))
        return 'Do not combine a factory alternative with a separate task-calendar route.';
      const check=this.confirmedIssue({...plan,tasks:[{calendarId:id}]});
      if(check)return check;
      const required=plan?.commitments?.buyerRequiredExFactory;
      if(required&&!scheduling.isWorkingDate(required,candidate))
        return 'Buyer-required date is not a working day on the selected alternative; confirm a comparable date before forecasting.';
      return null;
    }
    /** Only equal confirmed date bases can yield a working-day difference. */
    static sameBasis(a,b){
      return !!a&&!!b&&a.source==='user-confirmed'&&b.source==='user-confirmed'&&
        a.timezone===b.timezone&&
        ['workingWeek','holidays','shutdowns'].every(key=>
          JSON.stringify((a[key]||[]).slice().sort())===JSON.stringify((b[key]||[]).slice().sort()));
    }
    /** Protect legacy workdayDifference from a nonworking endpoint loop. */
    static comparable(calendar,start,end){
      return calendar?.source==='user-confirmed'&&
        this.validDate(start)&&this.validDate(end)&&
        typeof scheduling?.isWorkingDate==='function'&&
        scheduling.isWorkingDate(start,calendar) &&
        scheduling.isWorkingDate(end,calendar);
    }
  }

  function planSchedule(plan,primaryCalendarId='default'){
    const start=plan?.commitments?.orderConfirmedOn||plan?.commitments?.poReceivedOn;
    const required=plan?.commitments?.buyerRequiredExFactory;
    if(!scheduling)return {status:'needs-information',reason:'Scheduling engine is not loaded.'};
    if(!start||!required)return {status:'needs-information',reason:'Explicit order start and buyer required ex-factory dates are required.'};
    const calendarIssue=TnaScenarioCalendarGuard.confirmedIssue(plan);
    if(calendarIssue)return {status:'needs-information',reason:calendarIssue};
    const assignedIds=new Set((plan.tasks||[]).map(task=>task.calendarId||'default'));
    const effectiveId=primaryCalendarId==='default'&&assignedIds.size===1?
      [...assignedIds][0]:primaryCalendarId;
    const primary=plan.calendars.find(item=>item.calendarId===effectiveId);
    if(!primary)return {status:'needs-information',reason:'Selected scenario factory calendar is missing.'};
    if(primaryCalendarId!=='default'&&!scheduling.isWorkingDate(required,primary))
      return {status:'needs-information',reason:'Required ex-factory date needs a confirmed working-day basis on the alternative calendar.'};
    try{
      const result=scheduling.schedule(plan.tasks||[],plan.edges||[],{calendar:primary,calendars:plan.calendars||[],startDate:start,requiredDate:required,asOfDate:start,nearCriticalDays:3});
      if(result.validity!=='valid')return {status:'blocked',reason:[...(result.errors||[]),...(result.missingInputs||[])].join('; ')||'Schedule is invalid.',raw:result};
      return {status:'calculated',forecastDate:result.project.forecastDate,workingDaysEarlyOrLate:result.project.workingDaysEarlyOrLate,criticalTaskIds:Object.values(result.taskResults||{}).filter(item=>item.isCritical).map(item=>item.taskId),raw:result};
    }catch{return {status:'needs-information',reason:'Recovery schedule could not be safely calculated; review calendar and source dates.'};}
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
  function applyCalendarChanges(_plan,changes=[]){
    const issue=TnaScenarioCalendarGuard.proposedIssue({calendarChanges:changes});
    return issue?[issue]:[];
  }
  function applyRouteChanges(plan,changes=[]){
    const errors=[];
    for(const change of changes){
      const task=(plan.tasks||[]).find(item=>item.taskId===change.taskId);
      if(!task){errors.push('Scenario route references a missing task.');continue;}
      if(change.calendarId!=null&&!plan.calendars?.some(item=>item.calendarId===change.calendarId)){errors.push('Scenario route references a missing calendar.');continue;}
      if(change.calendarId!=null&&change.calendarId!==task.calendarId&&change.calendarId!=='default'){
        errors.push('Select a reviewed alternative factory calendar through the dedicated calendar choice, not a route change.');continue;
      }
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
  /**
   * Preview-only: swap default-calendar task references to an already recorded
   * alternative. Never rewrite stored calendar objects or signed task dates.
   * Applying such a selection to live records is deliberately blocked until
   * the separate UI/acceptance group has independently proved save/report.
   */
  function selectConfirmedAlternative(plan,input={}){
    if(!Object.prototype.hasOwnProperty.call(input,'confirmedAlternativeCalendarId'))return [];
    const issue=TnaScenarioCalendarGuard.alternativeIssue(plan,input);
    if(issue)return [issue];
    for(const task of plan.tasks||[])if((task.calendarId||'default')==='default')
      task.calendarId=input.confirmedAlternativeCalendarId;
    return [];
  }
  function applyScenarioChanges(plan,input={}){
    if(!input||typeof input!=='object'||Array.isArray(input))
      return ['Scenario changes must be a reviewed object.'];
    for(const key of ['durationAdjustments','calendarChanges','routeChanges','capacityChanges'])
      if(input[key]!=null&&!Array.isArray(input[key]))
        return ['Scenario '+key+' must be a reviewed list.'];
    return [
      ...applyDurationAdjustments(plan,input.durationAdjustments||[]),
      ...applyCalendarChanges(plan,input.calendarChanges||[]),
      ...applyRouteChanges(plan,input.routeChanges||[]),
      ...applyCapacityChanges(plan,input.capacityChanges||[]),
      ...selectConfirmedAlternative(plan,input)
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
  function compareScenario(baseSchedule,scenarioSchedule,baseLoad,scenarioLoad,calendar,canCompare=true){
    const baseCritical=baseSchedule?.criticalTaskIds||[],scenarioCritical=scenarioSchedule?.criticalTaskIds||[];
    const changedCriticalTaskIds=[...new Set([...baseCritical,...scenarioCritical])].filter(id=>baseCritical.includes(id)!==scenarioCritical.includes(id));
    let gained=null;
    if(canCompare&&baseSchedule?.status==='calculated'&&
      scenarioSchedule?.status==='calculated'&&
      TnaScenarioCalendarGuard.comparable(calendar,
        scenarioSchedule.forecastDate,baseSchedule.forecastDate)){
      try{gained=scheduling.workdayDifference(
        scenarioSchedule.forecastDate,baseSchedule.forecastDate,calendar,'working');}
      catch{gained=null;}
    }
    let calendarDaysGained=null;
    if(baseSchedule?.status==='calculated'&&scenarioSchedule?.status==='calculated'&&
      TnaScenarioCalendarGuard.validDate(baseSchedule.forecastDate)&&
      TnaScenarioCalendarGuard.validDate(scenarioSchedule.forecastDate))
      calendarDaysGained=scheduling.toDay(baseSchedule.forecastDate)-scheduling.toDay(scenarioSchedule.forecastDate);
    return {baseForecastDate:baseSchedule?.forecastDate||null,scenarioForecastDate:scenarioSchedule?.forecastDate||null,workingDaysGained:gained,calendarDaysGained,criticalTaskIdsBefore:baseCritical,criticalTaskIdsAfter:scenarioCritical,changedCriticalTaskIds,resourceEntriesBefore:baseLoad?.totalEntries||0,resourceEntriesAfter:scenarioLoad?.totalEntries||0,resourceConflictsBefore:baseLoad?.overAllocations?.length||0,resourceConflictsAfter:scenarioLoad?.overAllocations?.length||0};
  }
  function previewScenario(plan,input={},context={}){
    if(!plan||!Array.isArray(plan.tasks))return {ok:false,error:'A valid TNA plan is required.'};
    if(!input||typeof input!=='object'||Array.isArray(input))return {ok:false,error:'Scenario changes must be a reviewed object.'};
    const base=clone(plan),candidate=clone(plan),violations=applyScenarioChanges(candidate,input);
    const selectionIssue=TnaScenarioCalendarGuard.alternativeIssue(plan,input);
    const heldCalendar=TnaScenarioCalendarGuard.proposedIssue(input)||selectionIssue;
    const selectedId=typeof input.confirmedAlternativeCalendarId==='string'?
      input.confirmedAlternativeCalendarId:'';
    const baseSchedule=planSchedule(base);
    const scenarioSchedule=heldCalendar||violations.length?
      {status:'needs-information',reason:heldCalendar||violations.join('; ')}:
      planSchedule(candidate,selectedId||'default');
    const capacity=capacityPreview(candidate,input);
    if(capacity.status&&capacity.status!=='calculated'&&capacity.status!=='not-entered')violations.push(capacity.message||capacity.reason||'Capacity remains Needs Information.');
    const baseLoad=resourceLoadPreview(base),scenarioLoad=resourceLoadPreview(candidate);
    if(!scenarioLoad.ok)violations.push('Shared resource capacity remains over-allocated in this scenario.');
    const routeCalendarChanged=Array.isArray(input.routeChanges)&&
      input.routeChanges.some(x=>x?.calendarId!=null);
    const baseCalendar=base.calendars?.find(item=>item.calendarId==='default');
    const alternateCalendar=candidate.calendars?.find(item=>item.calendarId===selectedId);
    const sameCalendarBasis=!selectedId||TnaScenarioCalendarGuard.sameBasis(baseCalendar,alternateCalendar);
    const canCompare=!heldCalendar&&!routeCalendarChanged&&sameCalendarBasis;
    const comparison=compareScenario(baseSchedule,scenarioSchedule,baseLoad,scenarioLoad,
      baseCalendar,canCompare);
    const branch={scenarioId:input.scenarioId||makeId('scenario'),name:clean(input.name)||'Recovery scenario',engineVersion:ENGINE_VERSION,createdAt:context.createdAt||now(),createdBy:context.actorId||plan.ownerUserId||'local-browser-user',baseRecordId:plan.recordId,baseRevision:plan.revision||0,status:violations.length?'needs-review':'preview',changes:clone(input),baseForecastDate:comparison.baseForecastDate,scenarioForecastDate:comparison.scenarioForecastDate,workingDaysGained:comparison.workingDaysGained,
      calendarDaysGained:comparison.calendarDaysGained,
      calendarComparisonBasis:selectedId?(sameCalendarBasis?'same-confirmed-calendar':'civil-days-only'):'unchanged',
      baseScheduleStatus:baseSchedule.status,scenarioScheduleStatus:scenarioSchedule.status,capacity,changedCriticalTaskIds:comparison.changedCriticalTaskIds,resourceLoad:scenarioLoad,comparison,forecastProvenance:forecastProvenance(candidate,scenarioSchedule),violations};
    return {ok:true,branch,previewPlan:candidate,baseSchedule,scenarioSchedule,baseLoad,scenarioLoad,comparison,violations};
  }
  /**
   * Independently recompute a selected alternative before a saved preview
   * or local apply. A caller cannot create factory approval by spoofing a
   * preview status, a gain, a forecast or a stale candidate reference.
   * Non-alternative legacy recovery branches retain their existing path.
   */
  function confirmedAlternativeBranchIssue(plan,branch){
    const changes=branch?.changes||{};
    if(!Object.prototype.hasOwnProperty.call(changes,'confirmedAlternativeCalendarId'))
      return null;
    const issue=TnaScenarioCalendarGuard.alternativeIssue(plan,changes);
    if(issue)return issue;
    const recalculated=previewScenario(plan,changes,{actorId:plan.ownerUserId});
    if(!recalculated.ok||recalculated.violations.length||
      recalculated.branch.status!=='preview'||
      recalculated.baseSchedule.status!=='calculated'||
      recalculated.scenarioSchedule.status!=='calculated')
      return 'The selected alternative calendar needs a valid, source-confirmed comparison before saving or applying.';
    for(const key of ['baseForecastDate','scenarioForecastDate',
      'workingDaysGained','calendarDaysGained','calendarComparisonBasis']){
      if(branch[key]!==recalculated.branch[key])
        return 'The alternative comparison has changed; preview it again before saving or applying.';
    }
    return null;
  }
  /**
   * Preserve a preview for the current revision and R12 selection. This is
   * scenario metadata only: tasks, calendar, frozen baseline, approvals and
   * buyer commitment remain untouched. No buyer/factory acceptance implied.
   * A saved option does not change the live planning revision.
   */
  function saveScenarioPreview(plan,branch,context={}){
    if(!plan||!Array.isArray(plan.tasks)||!branch||!branch.scenarioId)
      return {ok:false,error:'A current previewed scenario is required.'};
    if(branch.baseRecordId!==plan.recordId||
      branch.baseRevision!==(plan.revision||0)||
      branch.status!=='preview'||!Array.isArray(branch.violations)||
      branch.violations.length)
      return {ok:false,error:'Preview belongs to another order, revision or needs review.'};
    if((plan.scenarioBranches||[]).some(item=>item.scenarioId===branch.scenarioId))
      return {ok:false,error:'This scenario option is already recorded.'};
    const issue=TnaScenarioCalendarGuard.proposedIssue(branch.changes||{})||
      confirmedAlternativeBranchIssue(plan,branch);
    if(issue)return {ok:false,error:issue};
    const next=clone(plan),timestamp=context.createdAt||now(),
      actorId=clean(context.actorId)||next.ownerUserId||'local-browser-user';
    next.scenarioBranches=[...(next.scenarioBranches||[]),
      {...clone(branch),savedAt:timestamp,savedBy:actorId,status:'preview'}];
    next.updatedAt=timestamp;
    next.auditEvents=[...(next.auditEvents||[]),{eventId:makeId('audit'),
      eventType:'scenario-preview-saved',actorId,createdAt:timestamp,
      details:{scenarioId:branch.scenarioId,baseRevision:branch.baseRevision,
        confirmedAlternativeCalendarId:branch.changes?.confirmedAlternativeCalendarId||null}}];
    return {ok:true,plan:next};
  }
  function applyScenario(plan,branch,context={}){
    if(!context.confirm)return {ok:false,error:'Apply Scenario requires explicit confirmation.'};
    if(!clean(context.reason))return {ok:false,error:'Apply Scenario requires a revision reason.'};
    if(!branch||!branch.scenarioId)return {ok:false,error:'A previewed scenario branch is required.'};
    if((plan.revision||0)!==(branch.baseRevision||0))return {ok:false,error:'Scenario base revision no longer matches the current TNA.'};
    if(branch.baseRecordId!==plan.recordId)return {ok:false,error:'Scenario belongs to a different TNA record.'};
    if(branch.status!=='preview'||(Array.isArray(branch.violations)&&branch.violations.length))
      return {ok:false,error:'Scenario has unresolved review issues; it cannot be applied.'};
    const calendarIssue=TnaScenarioCalendarGuard.proposedIssue(branch.changes||{});
    if(calendarIssue)return {ok:false,error:calendarIssue};
    const alternativeIssue=confirmedAlternativeBranchIssue(plan,branch);
    if(alternativeIssue)return {ok:false,error:alternativeIssue};
    const next=clone(plan),timestamp=context.createdAt||now();
    const errors=applyScenarioChanges(next,branch.changes||{});
    if(errors.length)return {ok:false,error:errors.join(' ')};
    next.revision=Number(next.revision||0)+1;
    next.updatedAt=timestamp;
    const applied={...clone(branch),status:'applied',appliedAt:timestamp,
      appliedBy:context.actorId||next.ownerUserId,applyReason:clean(context.reason)};
    const alreadyRecorded=(next.scenarioBranches||[]).some(item=>item.scenarioId===branch.scenarioId);
    next.scenarioBranches=alreadyRecorded?
      next.scenarioBranches.map(item=>item.scenarioId===branch.scenarioId?applied:item):
      [...(next.scenarioBranches||[]),applied];
    next.revisionEvents=[...(next.revisionEvents||[]),{eventId:makeId('revision'),eventType:'scenario-applied',revision:next.revision,actorId:context.actorId||next.ownerUserId,createdAt:timestamp,reason:clean(context.reason),details:{scenarioId:branch.scenarioId,baseRevision:branch.baseRevision,workingDaysGained:branch.workingDaysGained,
      calendarDaysGained:branch.calendarDaysGained??null,
      confirmedAlternativeCalendarId:branch.changes?.confirmedAlternativeCalendarId||null}}];
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
  const api={ENGINE_VERSION,previewScenario,saveScenarioPreview,applyScenario,detectPortfolioCapacityConflicts,filterPortfolioPlans,portfolioSummary,forecastProvenance};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaScenarios=api;
})(typeof globalThis!=='undefined'?globalThis:this);
