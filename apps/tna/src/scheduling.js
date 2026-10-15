(function(root){
  'use strict';
  const ENGINE_VERSION='TNA360-SCHEDULE-0.4.1';
  const MS_PER_DAY=86400000;
  const DEFAULT_CALENDAR={calendarId:'default',name:'Default Monday-Friday',workingWeek:[1,2,3,4,5],holidays:[],shutdowns:[],revision:0};
  const pad=n=>String(n).padStart(2,'0');
  /**
   * Validate an exact Gregorian YYYY-MM-DD civil date in UTC. A format-only
   * check lets 2026-02-30 silently normalize to March, which would create
   * fabricated delivery and approval dates. Retain years 0000–9999 without
   * Date.UTC's special 1900 offset for years 0–99.
   */
  function assertDate(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))
      throw new Error('Invalid civil date: '+value);
    const ticks=Date.parse(value+'T00:00:00Z');
    if(!Number.isFinite(ticks)||new Date(ticks).toISOString().slice(0,10)!==value)
      throw new Error('Invalid civil date: '+value);
  }
  function toDay(value){assertDate(value);return Math.floor(Date.parse(value+'T00:00:00Z')/MS_PER_DAY);}
  function fromDay(day){
    const dt=new Date(day*MS_PER_DAY);
    return `${String(dt.getUTCFullYear()).padStart(4,'0')}-${pad(dt.getUTCMonth()+1)}-${pad(dt.getUTCDate())}`;
  }
  function weekday(value){const day=typeof value==='number'?value:toDay(value);return new Date(day*MS_PER_DAY).getUTCDay();}
  function normalizeCalendar(calendar={}){return {...DEFAULT_CALENDAR,...calendar,workingWeek:calendar.workingWeek||DEFAULT_CALENDAR.workingWeek,holidays:calendar.holidays||[],shutdowns:calendar.shutdowns||[]};}
  /**
   * A configuration with no valid weekday would make the scheduler's
   * next/previous-working-date loops infinite. Reject it before iteration;
   * do not silently replace explicit [] with a guessed Mon–Fri calendar.
   */
  function assertWorkingWeek(calendar){
    const week=calendar?.workingWeek;
    if(!Array.isArray(week)||!week.length||
      week.some(day=>!Number.isInteger(day)||day<0||day>6))
      throw new Error('Calendar requires a valid nonempty working week (weekday 0–6).');
  }
  function isWorkingDate(date,calendar=DEFAULT_CALENDAR){
    const cal=normalizeCalendar(calendar);
    assertDate(date);assertWorkingWeek(cal);
    return cal.workingWeek.includes(weekday(date))&&!cal.holidays.includes(date)&&!cal.shutdowns.includes(date);
  }
  function nextWorkingDate(date,calendar=DEFAULT_CALENDAR,include=true){let day=toDay(date)+(include?0:1);while(!isWorkingDate(fromDay(day),calendar))day+=1;return fromDay(day);}
  function previousWorkingDate(date,calendar=DEFAULT_CALENDAR,include=true){let day=toDay(date)-(include?0:1);while(!isWorkingDate(fromDay(day),calendar))day-=1;return fromDay(day);}
  function shiftDate(date,amount,calendar=DEFAULT_CALENDAR,basis='working'){
    assertDate(date);if(!Number.isInteger(amount))throw new Error('Shift amount must be an integer.');
    if(amount===0)return basis==='working'?nextWorkingDate(date,calendar,true):date;
    if(basis==='calendar')return fromDay(toDay(date)+amount);
    let current=date,remaining=Math.abs(amount),dir=amount>0?1:-1;
    while(remaining>0){current=fromDay(toDay(current)+dir);if(isWorkingDate(current,calendar))remaining-=1;}
    return current;
  }
  function finishFromStart(start,duration,calendar=DEFAULT_CALENDAR,basis='working'){
    if(duration==null||duration==='')return null;
    if(duration<0)throw new Error('Duration cannot be negative.');
    if(duration===0)return nextWorkingDate(start,calendar,true);
    return shiftDate(nextWorkingDate(start,calendar,true),duration-1,calendar,basis);
  }
  function startFromFinish(finish,duration,calendar=DEFAULT_CALENDAR,basis='working'){
    if(duration==null||duration==='')return null;
    if(duration<0)throw new Error('Duration cannot be negative.');
    if(duration===0)return previousWorkingDate(finish,calendar,true);
    return shiftDate(previousWorkingDate(finish,calendar,true),-(duration-1),calendar,basis);
  }
  function compareDate(a,b){return toDay(a)-toDay(b);}
  function maxDate(values){return values.filter(Boolean).sort(compareDate).at(-1)||null;}
  function minDate(values){return values.filter(Boolean).sort(compareDate)[0]||null;}
  function calendarResolver(options={}){
    const primary=normalizeCalendar(options.calendar||options.calendars?.[0]||DEFAULT_CALENDAR);
    const calendars=new Map((options.calendars||[]).map(calendar=>[calendar.calendarId,normalizeCalendar(calendar)]));
    if(primary.calendarId&&!calendars.has(primary.calendarId))calendars.set(primary.calendarId,primary);
    return {primary,forTask(task){return task?.calendarId?calendars.get(task.calendarId)||null:primary;},revisions:[...calendars.values()].map(calendar=>calendar.revision||0)};
  }
  /**
   * Count working dates on the open-start/closed-end civil-date interval.
   * A contractual endpoint may fall on a nonworking date. Walking only from
   * working day to working day can skip that endpoint forever; iterate civil
   * dates instead and count only the explicitly configured working dates.
   * Preserve signed weekday-to-weekday results and calendar-day basis.
   */
  function workdayDifference(start,end,calendar=DEFAULT_CALENDAR,basis='working'){
    assertDate(start);assertDate(end);
    if(start===end)return 0;
    if(basis==='calendar')return toDay(end)-toDay(start);
    if(basis!=='working')throw new Error('Workday difference requires working or calendar basis.');
    const cal=normalizeCalendar(calendar);
    assertWorkingWeek(cal);
    const dir=compareDate(start,end)<0?1:-1;
    const first=dir>0?toDay(start):toDay(end);
    const last=dir>0?toDay(end):toDay(start);
    let count=0;
    for(let day=first+1;day<=last;day++){
      if(isWorkingDate(fromDay(day),cal))count++;
    }
    return dir*count;
  }
  function validateGraph(tasks=[],edges=[]){
    const errors=[],warnings=[],ids=new Set(tasks.map(t=>t.taskId));
    if(ids.size!==tasks.length)errors.push('Duplicate task IDs.');
    const seen=new Set();
    // GMR-18: reject untyped/fractional dependencies at the graph boundary.
    // The importer already emits whole-day lag and an explicit basis. Keep
    // missing legacy lag as zero, but never silently convert malformed data.
    for(const edge of edges){
      if(!edge||typeof edge!=='object'){
        errors.push('Invalid dependency entry.');continue;
      }
      if(!ids.has(edge.predecessorTaskId)||!ids.has(edge.successorTaskId))errors.push('Dependency references a missing task.');
      if(edge.predecessorTaskId===edge.successorTaskId)errors.push('Dependency cannot link a task to itself.');
      const key=[edge.predecessorTaskId,edge.successorTaskId,edge.relation||'FS'].join('|');
      if(seen.has(key))errors.push('Duplicate dependency: '+key);
      seen.add(key);
      if(!['FS','SS','FF','SF'].includes(edge.relation||'FS'))errors.push('Unsupported relation: '+edge.relation);
      const lag=edge.lagUnits==null||edge.lagUnits===''?0:edge.lagUnits;
      if(!Number.isInteger(lag))errors.push('Dependency lag must be a whole number of days: '+key+'.');
      if(edge.lagBasis!=null&&edge.lagBasis!==''&&!['working','calendar'].includes(edge.lagBasis))
        errors.push('Unsupported dependency lag basis: '+key+'.');
      if(Number.isInteger(lag)&&lag<0&&edge.allowLead!==true)
        errors.push('Negative lead requires allowLead on dependency '+key+'.');
    }
    const incoming=new Map(tasks.map(t=>[t.taskId,0])),outgoing=new Map(tasks.map(t=>[t.taskId,[]]));
    edges.forEach(edge=>{
      if(!edge||!ids.has(edge.predecessorTaskId)||!ids.has(edge.successorTaskId))return;
      incoming.set(edge.successorTaskId,(incoming.get(edge.successorTaskId)||0)+1);
      outgoing.get(edge.predecessorTaskId)?.push(edge);
    });
    const queue=tasks.filter(t=>incoming.get(t.taskId)===0).map(t=>t.taskId),order=[];
    while(queue.length){const id=queue.shift();order.push(id);for(const edge of outgoing.get(id)||[]){incoming.set(edge.successorTaskId,incoming.get(edge.successorTaskId)-1);if(incoming.get(edge.successorTaskId)===0)queue.push(edge.successorTaskId);}}
    if(order.length!==tasks.length)errors.push('Dependency graph contains a cycle.');
    return {ok:errors.length===0,errors,warnings,order};
  }
  function schedule(tasks=[],edges=[],options={}){
    const calendars=calendarResolver(options),calendar=calendars.primary;
    const startDate=options.startDate||null,requiredDate=options.requiredDate||null,asOfDate=options.asOfDate||null;
    const errors=[],warnings=[],missingInputs=[];
    if(!startDate)missingInputs.push('startDate');
    // Missing durations are unknown inputs. Explicitly malformed durations
    // are INVALID; they must not reach date shifting as NaN/fractions or get
    // rounded/coerced into an invented garment production schedule.
    for(const task of tasks){
      if(task.durationUnits==null||task.durationUnits==='')missingInputs.push('duration:'+task.taskId);
      else if(!Number.isInteger(task.durationUnits)||task.durationUnits<0)
        errors.push('Duration must be a non-negative whole number of days: '+task.taskId+'.');
      if(task.durationBasis!=null&&task.durationBasis!==''&&
        !['working','calendar'].includes(task.durationBasis))
        errors.push('Unsupported duration basis: '+task.taskId+'.');
      if(!calendars.forTask(task))missingInputs.push('calendar:'+task.taskId);
    }
    const graph=validateGraph(tasks,edges);
    errors.push(...graph.errors);
    if(errors.length||missingInputs.length)return {engineVersion:ENGINE_VERSION,validity:errors.length?'invalid':'incomplete',missingInputs,errors,warnings,constraintViolations:[],taskResults:{},project:{criticalPaths:[],scheduleConfidence:'unavailable'},generatedAt:new Date().toISOString(),calendarRevisions:calendars.revisions};
    const byId=new Map(tasks.map(t=>[t.taskId,t]));
    const incoming=new Map(tasks.map(t=>[t.taskId,[]])),outgoing=new Map(tasks.map(t=>[t.taskId,[]]));
    edges.forEach(edge=>{incoming.get(edge.successorTaskId).push(edge);outgoing.get(edge.predecessorTaskId).push(edge);});
    const result={};
    for(const id of graph.order){
      const task=byId.get(id),taskCalendar=calendars.forTask(task),basis=task.durationBasis||'working',duration=Number(task.durationUnits||0),candidates=[];
      if(!incoming.get(id).length)candidates.push(nextWorkingDate(startDate,taskCalendar,true));
      for(const edge of incoming.get(id)){
        const predecessorTask=byId.get(edge.predecessorTaskId),pred=result[edge.predecessorTaskId],lag=edge.lagUnits||0,relation=edge.relation||'FS';
        const sameDayMilestone=Number(predecessorTask.durationUnits)===0&&predecessorTask.milestoneEvent==='start-of-day';
        if(relation==='FS')candidates.push(shiftDate(pred.earlyFinish,lag+(sameDayMilestone?0:1),taskCalendar,edge.lagBasis||basis));
        if(relation==='SS')candidates.push(shiftDate(pred.earlyStart,lag,taskCalendar,edge.lagBasis||basis));
        if(relation==='FF')candidates.push(startFromFinish(shiftDate(pred.earlyFinish,lag,taskCalendar,edge.lagBasis||basis),duration,taskCalendar,basis));
        if(relation==='SF')candidates.push(startFromFinish(shiftDate(pred.earlyStart,lag,taskCalendar,edge.lagBasis||basis),duration,taskCalendar,basis));
      }
      const earlyStart=maxDate(candidates),earlyFinish=finishFromStart(earlyStart,duration,taskCalendar,basis);
      result[id]={taskId:id,earlyStart,earlyFinish,blockingPredecessors:incoming.get(id).map(e=>e.predecessorTaskId),explanation:[`Earliest dates calculated from ${incoming.get(id).length||'project'} predecessor(s).`]};
    }
    // SS and SF may let a predecessor finish AFTER its successor. The
    // contractual project endpoint therefore constrains every task, not
    // only graph-terminal tasks. FS-only networks remain unchanged.
    const forecastDate=maxDate(tasks.map(task=>result[task.taskId].earlyFinish));
    const endDate=requiredDate||forecastDate;
    for(const id of graph.order.slice().reverse()){
      const task=byId.get(id),taskCalendar=calendars.forTask(task),basis=task.durationBasis||'working',duration=Number(task.durationUnits||0),constraints=[endDate];
      for(const edge of outgoing.get(id)){
        const succ=result[edge.successorTaskId],lag=edge.lagUnits||0,relation=edge.relation||'FS';
        const sameDayMilestone=Number(task.durationUnits)===0&&task.milestoneEvent==='start-of-day';
        if(relation==='FS')constraints.push(shiftDate(succ.lateStart,-lag-(sameDayMilestone?0:1),taskCalendar,edge.lagBasis||basis));
        // SS constrains the predecessor's latest START, not its finish.
        // Convert that allowed START to its actual inclusive finish once.
        if(relation==='SS')constraints.push(finishFromStart(shiftDate(succ.lateStart,-lag,taskCalendar,edge.lagBasis||basis),duration,taskCalendar,basis));
        if(relation==='FF')constraints.push(shiftDate(succ.lateFinish,-lag,taskCalendar,edge.lagBasis||basis));
        // SF constrains predecessor START from successor FINISH. The
        // inverse is finishFromStart; startFromFinish double-subtracts.
        if(relation==='SF')constraints.push(finishFromStart(shiftDate(succ.lateFinish,-lag,taskCalendar,edge.lagBasis||basis),duration,taskCalendar,basis));
      }
      const lateFinish=minDate(constraints),lateStart=startFromFinish(lateFinish,duration,taskCalendar,basis);
      const totalFloat=workdayDifference(result[id].earlyStart,lateStart,taskCalendar,basis);
      const successorStarts=outgoing.get(id).map(edge=>result[edge.successorTaskId].earlyStart);
      const freeFloat=successorStarts.length?Math.max(0,workdayDifference(shiftDate(result[id].earlyFinish,1,taskCalendar,basis),minDate(successorStarts),taskCalendar,basis)):totalFloat;
      const isCritical=totalFloat<=0;
      const isOverdue=asOfDate?compareDate(asOfDate,result[id].earlyFinish)>0&&!['completed','approved','waived','not-applicable'].includes(task.status):false;
      result[id]={...result[id],lateStart,lateFinish,floatDays:totalFloat,freeFloatDays:freeFloat,isCritical,isNearCritical:totalFloat>0&&totalFloat<=Number(options.nearCriticalDays||0),isOverdue,risk:totalFloat<0?'delayed':isOverdue?'delayed':isCritical?'at-risk':'on-track'};
    }
    const criticalPaths=[],traceStack=tasks.filter(t=>!incoming.get(t.taskId).length&&result[t.taskId].isCritical).reverse().map(task=>({id:task.taskId,path:[]}));
    while(traceStack.length){
      const {id,path}=traceStack.pop(),nextPath=[...path,id],criticalSuccessors=(outgoing.get(id)||[]).filter(edge=>result[edge.successorTaskId].isCritical);
      if(!criticalSuccessors.length)criticalPaths.push(nextPath);
      else for(const edge of criticalSuccessors.slice().reverse())traceStack.push({id:edge.successorTaskId,path:nextPath});
    }
    const workingDaysEarlyOrLate=requiredDate?workdayDifference(requiredDate,forecastDate,calendar,'working'):0;
    const constraintViolations=requiredDate&&workingDaysEarlyOrLate>0?[{type:'required-date-miss',requiredDate,forecastDate,workingDaysLate:workingDaysEarlyOrLate,explanation:`Forecast is ${workingDaysEarlyOrLate} working day(s) later than the required project endpoint.`}]:[];
    return {engineVersion:ENGINE_VERSION,validity:'valid',missingInputs,errors,warnings,constraintViolations,taskResults:result,project:{selectedDeadlineType:requiredDate?'requiredDate':'forecastDate',requiredDate:requiredDate||null,forecastDate,workingDaysEarlyOrLate,criticalPaths,scheduleConfidence:'deterministic'},generatedAt:new Date().toISOString(),calendarRevisions:calendars.revisions};
  }
  const api={ENGINE_VERSION,DEFAULT_CALENDAR,toDay,fromDay,isWorkingDate,nextWorkingDate,previousWorkingDate,shiftDate,finishFromStart,startFromFinish,workdayDifference,validateGraph,schedule};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaScheduling=api;
})(typeof globalThis!=='undefined'?globalThis:this);
