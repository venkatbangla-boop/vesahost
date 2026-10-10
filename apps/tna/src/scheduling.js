(function(root){
  'use strict';
  const ENGINE_VERSION='TNA360-SCHEDULE-0.3.0';
  const MS_PER_DAY=86400000;
  const DEFAULT_CALENDAR={calendarId:'default',name:'Default Monday-Friday',workingWeek:[1,2,3,4,5],holidays:[],shutdowns:[],revision:0};
  const pad=n=>String(n).padStart(2,'0');
  function assertDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))throw new Error('Invalid civil date: '+value);}
  function toDay(value){assertDate(value);const [y,m,d]=value.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/MS_PER_DAY);}
  function fromDay(day){const dt=new Date(day*MS_PER_DAY);return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth()+1)}-${pad(dt.getUTCDate())}`;}
  function weekday(value){const day=typeof value==='number'?value:toDay(value);return new Date(day*MS_PER_DAY).getUTCDay();}
  function normalizeCalendar(calendar={}){return {...DEFAULT_CALENDAR,...calendar,workingWeek:calendar.workingWeek||DEFAULT_CALENDAR.workingWeek,holidays:calendar.holidays||[],shutdowns:calendar.shutdowns||[]};}
  function isWorkingDate(date,calendar=DEFAULT_CALENDAR){const cal=normalizeCalendar(calendar);assertDate(date);return cal.workingWeek.includes(weekday(date))&&!cal.holidays.includes(date)&&!cal.shutdowns.includes(date);}
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
  function workdayDifference(start,end,calendar=DEFAULT_CALENDAR,basis='working'){
    assertDate(start);assertDate(end);if(start===end)return 0;
    if(basis==='calendar')return toDay(end)-toDay(start);
    const dir=compareDate(start,end)<0?1:-1;let current=start,count=0;
    while(current!==end){current=shiftDate(current,dir,calendar,'working');count+=dir;}
    return count;
  }
  function validateGraph(tasks=[],edges=[]){
    const errors=[],warnings=[],ids=new Set(tasks.map(t=>t.taskId));
    if(ids.size!==tasks.length)errors.push('Duplicate task IDs.');
    const seen=new Set();
    for(const edge of edges){
      if(!ids.has(edge.predecessorTaskId)||!ids.has(edge.successorTaskId))errors.push('Dependency references a missing task.');
      if(edge.predecessorTaskId===edge.successorTaskId)errors.push('Dependency cannot link a task to itself.');
      const key=[edge.predecessorTaskId,edge.successorTaskId,edge.relation||'FS'].join('|');
      if(seen.has(key))errors.push('Duplicate dependency: '+key);
      seen.add(key);
      if(!['FS','SS','FF','SF'].includes(edge.relation||'FS'))errors.push('Unsupported relation: '+edge.relation);
      if((edge.lagUnits||0)<0&&!edge.allowLead)errors.push('Negative lead requires allowLead on dependency '+key+'.');
    }
    const incoming=new Map(tasks.map(t=>[t.taskId,0])),outgoing=new Map(tasks.map(t=>[t.taskId,[]]));
    edges.forEach(edge=>{incoming.set(edge.successorTaskId,(incoming.get(edge.successorTaskId)||0)+1);outgoing.get(edge.predecessorTaskId)?.push(edge);});
    const queue=tasks.filter(t=>incoming.get(t.taskId)===0).map(t=>t.taskId),order=[];
    while(queue.length){const id=queue.shift();order.push(id);for(const edge of outgoing.get(id)||[]){incoming.set(edge.successorTaskId,incoming.get(edge.successorTaskId)-1);if(incoming.get(edge.successorTaskId)===0)queue.push(edge.successorTaskId);}}
    if(order.length!==tasks.length)errors.push('Dependency graph contains a cycle.');
    return {ok:errors.length===0,errors,warnings,order};
  }
  function schedule(tasks=[],edges=[],options={}){
    const calendar=normalizeCalendar(options.calendar||DEFAULT_CALENDAR);
    const startDate=options.startDate||null,requiredDate=options.requiredDate||null,asOfDate=options.asOfDate||null;
    const errors=[],warnings=[],missingInputs=[];
    if(!startDate)missingInputs.push('startDate');
    for(const task of tasks)if(task.durationUnits==null||task.durationUnits===''||task.durationUnits<0)missingInputs.push('duration:'+task.taskId);
    const graph=validateGraph(tasks,edges);
    errors.push(...graph.errors);
    if(errors.length||missingInputs.length)return {engineVersion:ENGINE_VERSION,validity:errors.length?'invalid':'incomplete',missingInputs,errors,warnings,taskResults:{},project:{criticalPaths:[],scheduleConfidence:'unavailable'},generatedAt:new Date().toISOString(),calendarRevisions:[calendar.revision||0]};
    const byId=new Map(tasks.map(t=>[t.taskId,t]));
    const incoming=new Map(tasks.map(t=>[t.taskId,[]])),outgoing=new Map(tasks.map(t=>[t.taskId,[]]));
    edges.forEach(edge=>{incoming.get(edge.successorTaskId).push(edge);outgoing.get(edge.predecessorTaskId).push(edge);});
    const result={};
    for(const id of graph.order){
      const task=byId.get(id),basis=task.durationBasis||'working',duration=Number(task.durationUnits||0),candidates=[];
      if(!incoming.get(id).length)candidates.push(nextWorkingDate(startDate,calendar,true));
      for(const edge of incoming.get(id)){
        const pred=result[edge.predecessorTaskId],lag=edge.lagUnits||0,relation=edge.relation||'FS';
        if(relation==='FS')candidates.push(shiftDate(pred.earlyFinish,lag+1,calendar,edge.lagBasis||basis));
        if(relation==='SS')candidates.push(shiftDate(pred.earlyStart,lag,calendar,edge.lagBasis||basis));
        if(relation==='FF')candidates.push(startFromFinish(shiftDate(pred.earlyFinish,lag,calendar,edge.lagBasis||basis),duration,calendar,basis));
        if(relation==='SF')candidates.push(startFromFinish(shiftDate(pred.earlyStart,lag,calendar,edge.lagBasis||basis),duration,calendar,basis));
      }
      const earlyStart=maxDate(candidates),earlyFinish=finishFromStart(earlyStart,duration,calendar,basis);
      result[id]={taskId:id,earlyStart,earlyFinish,blockingPredecessors:incoming.get(id).map(e=>e.predecessorTaskId),explanation:[`Earliest dates calculated from ${incoming.get(id).length||'project'} predecessor(s).`]};
    }
    const terminalIds=tasks.filter(t=>!outgoing.get(t.taskId).length).map(t=>t.taskId);
    const forecastDate=maxDate(terminalIds.map(id=>result[id].earlyFinish));
    const endDate=requiredDate||forecastDate;
    for(const id of graph.order.slice().reverse()){
      const task=byId.get(id),basis=task.durationBasis||'working',duration=Number(task.durationUnits||0),constraints=[];
      if(!outgoing.get(id).length)constraints.push(endDate);
      for(const edge of outgoing.get(id)){
        const succ=result[edge.successorTaskId],lag=edge.lagUnits||0,relation=edge.relation||'FS';
        if(relation==='FS')constraints.push(shiftDate(succ.lateStart,(-lag)-1,calendar,edge.lagBasis||basis));
        if(relation==='SS')constraints.push(startFromFinish(shiftDate(succ.lateStart,-lag,calendar,edge.lagBasis||basis),duration,calendar,basis));
        if(relation==='FF')constraints.push(shiftDate(succ.lateFinish,-lag,calendar,edge.lagBasis||basis));
        if(relation==='SF')constraints.push(startFromFinish(shiftDate(succ.lateFinish,-lag,calendar,edge.lagBasis||basis),duration,calendar,basis));
      }
      const lateFinish=minDate(constraints),lateStart=startFromFinish(lateFinish,duration,calendar,basis);
      const totalFloat=workdayDifference(result[id].earlyStart,lateStart,calendar,basis);
      const successorStarts=outgoing.get(id).map(edge=>result[edge.successorTaskId].earlyStart);
      const freeFloat=successorStarts.length?Math.max(0,workdayDifference(shiftDate(result[id].earlyFinish,1,calendar,basis),minDate(successorStarts),calendar,basis)):totalFloat;
      const isCritical=totalFloat<=0;
      const isOverdue=asOfDate?compareDate(asOfDate,result[id].earlyFinish)>0&&!['completed','approved','waived','not-applicable'].includes(task.status):false;
      result[id]={...result[id],lateStart,lateFinish,floatDays:totalFloat,freeFloatDays:freeFloat,isCritical,isNearCritical:totalFloat>0&&totalFloat<=Number(options.nearCriticalDays||0),isOverdue,risk:totalFloat<0?'delayed':isOverdue?'delayed':isCritical?'at-risk':'on-track'};
    }
    const criticalPaths=[];
    function trace(id,path=[]){const nextPath=[...path,id];const critSucc=(outgoing.get(id)||[]).filter(edge=>result[edge.successorTaskId].isCritical);if(!critSucc.length){criticalPaths.push(nextPath);return;}critSucc.forEach(edge=>trace(edge.successorTaskId,nextPath));}
    tasks.filter(t=>!incoming.get(t.taskId).length&&result[t.taskId].isCritical).forEach(t=>trace(t.taskId));
    const workingDaysEarlyOrLate=requiredDate?workdayDifference(requiredDate,forecastDate,calendar,'working'):0;
    return {engineVersion:ENGINE_VERSION,validity:'valid',missingInputs,errors,warnings,taskResults:result,project:{selectedDeadlineType:requiredDate?'requiredDate':'forecastDate',requiredDate:requiredDate||null,forecastDate,workingDaysEarlyOrLate,criticalPaths,scheduleConfidence:'deterministic'},generatedAt:new Date().toISOString(),calendarRevisions:[calendar.revision||0]};
  }
  const api={ENGINE_VERSION,DEFAULT_CALENDAR,toDay,fromDay,isWorkingDate,nextWorkingDate,previousWorkingDate,shiftDate,finishFromStart,startFromFinish,workdayDifference,validateGraph,schedule};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaScheduling=api;
})(typeof globalThis!=='undefined'?globalThis:this);
