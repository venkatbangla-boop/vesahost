(function(root){
  'use strict';
  const ENGINE_VERSION='TNA360-OPS-0.4.0';
  const scheduling=root.VesaTnaScheduling||(typeof require==='function'?require('./scheduling.js'):null);
  const clean=value=>String(value??'').trim();
  const unknown=(code,message)=>({status:'needs-information',code,message});
  function contractualLead(commitments={},calendar){
    const anchor=commitments.leadTimeAnchor;
    const days=Number(commitments.contractualLeadDays);
    const basis=commitments.leadTimeBasis||'calendar';
    const sourceDate=anchor==='LC-open'?commitments.masterLcOpenedOn:anchor==='PO-confirmed'?commitments.orderConfirmedOn:anchor==='deposit-received'?commitments.depositReceivedOn:commitments.otherLeadAnchorDate;
    if(!anchor||anchor==='unknown')return unknown('missing-anchor','Contractual lead anchor is not selected.');
    if(!sourceDate)return unknown('missing-anchor-date','Selected contractual lead anchor date is missing.');
    if(!Number.isFinite(days)||days<0)return unknown('missing-lead-days','Contractual lead days must be a non-negative number.');
    return {status:'calculated',anchor,sourceDate,basis,contractualDate:scheduling.shiftDate(sourceDate,days,calendar,basis)};
  }
  function compareCommercial(commitments={},materials=[],calendar){
    const lead=contractualLead(commitments,calendar);
    const discrepancies=[];
    if(lead.status==='calculated'&&commitments.buyerRequiredExFactory){
      const delta=scheduling.workdayDifference(commitments.buyerRequiredExFactory,lead.contractualDate,calendar,'working');
      if(delta!==0)discrepancies.push({type:'buyer-vs-contract',buyerRequiredExFactory:commitments.buyerRequiredExFactory,contractualDate:lead.contractualDate,workingDayDelta:delta});
    }
    const b2b=materials.filter(material=>clean(material.b2bLcOpenDate)||clean(material.b2bLcApplicationDate)).map(material=>({materialId:material.materialId,category:material.category,masterLcRef:material.masterLcRef||null,b2bLcOpenDate:material.b2bLcOpenDate||null}));
    return {lead,discrepancies,b2bLcMilestones:b2b,masterLcOpenedOn:commitments.masterLcOpenedOn||null};
  }
  function approvalState(approval={}){
    if(approval.responseStatus==='approved'){
      if(!approval.evidenceRef)return {status:'blocked',reason:'Approved decision requires evidence.'};
      if(!approval.decidedBy&&!approval.authorizedReviewerId&&!approval.delegatedLocalOfficeAllowed)return {status:'blocked',reason:'Approved decision requires authorized reviewer or explicit delegated authority.'};
      return {status:'approved',reason:'Approved with recorded authority and evidence.'};
    }
    if(approval.responseStatus==='waived'){
      if(!approval.returnComments&&!approval.waiverReason)return {status:'blocked',reason:'Waiver requires written reason.'};
      if(!approval.evidenceRef)return {status:'blocked',reason:'Waiver requires evidence.'};
      return {status:'waived',reason:'Waived with reason and evidence.'};
    }
    if(approval.responseStatus==='rejected')return {status:'rejected',reason:'Rejected; resubmission or controlled revision required.'};
    if(approval.submittedDate&&!approval.decisionDate)return {status:'pending',reason:'Submitted but not approved.'};
    return {status:'needs-information',reason:'Approval submission/decision is missing.'};
  }
  function materialReadiness(material={}){
    if(!material.inHouseDate)return {status:'needs-information',reason:'Material is not recorded in-house.'};
    if(!material.QCDate)return {status:'blocked',reason:'Material in-house but QC not passed/reviewed.'};
    if(Number(material.shortageQty||0)>0)return {status:'blocked',reason:'Material shortage remains: '+material.shortageQty};
    return {status:'ready',reason:'In-house, QC recorded and no shortage.'};
  }
  function verifiedRateDays({plannedQty,completedQty=0,verifiedDailyOutput}={}){
    const planned=Number(plannedQty),completed=Number(completedQty),rate=Number(verifiedDailyOutput);
    if(!Number.isFinite(planned)||planned<0)return unknown('invalid-planned-qty','Planned quantity must be a non-negative number.');
    if(!Number.isFinite(completed)||completed<0)return unknown('invalid-completed-qty','Completed quantity must be a non-negative number.');
    if(!Number.isFinite(rate)||rate<=0)return unknown('missing-rate','Verified daily output must be greater than zero.');
    const remaining=Math.max(0,planned-completed);
    return {status:'calculated',remainingQty:remaining,workingDays:Math.ceil(remaining/rate),verifiedDailyOutput:rate};
  }
  function smvCapacity({operators,netMinutesPerOperatorPerDay,efficiencyFraction,standardMinutesPerUnit}={}){
    const values=[operators,netMinutesPerOperatorPerDay,efficiencyFraction,standardMinutesPerUnit].map(Number);
    if(values.some(value=>!Number.isFinite(value)||value<=0))return unknown('missing-smv-input','Operators, minutes, efficiency and SMV/SAM must be positive verified inputs.');
    const [ops,minutes,efficiency,smv]=values;
    return {status:'calculated',grossUnitsPerDay:Math.floor((ops*minutes*efficiency)/smv)};
  }
  function validateOperationQuantity(op={}){
    const input=Number(op.qtyInput||0),completed=Number(op.qtyCompleted||0),rejected=Number(op.qtyRejected||0),reworked=Number(op.qtyReworked||0),wip=Number(op.qtyWip||0);
    if([input,completed,rejected,reworked,wip].some(value=>!Number.isFinite(value)||value<0))return {ok:false,error:'Operation quantities must be non-negative numbers.'};
    if(completed+rejected+wip>input+reworked)return {ok:false,error:'Completed + rejected + WIP cannot exceed input plus documented rework.'};
    return {ok:true,remainingQty:Math.max(0,input+reworked-completed-rejected-wip)};
  }
  function checkSharedCapacity(entries=[]){
    const byDate=new Map(),overAllocations=[];
    for(const entry of entries){
      const key=[entry.resourceId,entry.date].join('|');
      const used=(byDate.get(key)?.allocatedLines||0)+Number(entry.allocatedLines||0);
      const available=Number(entry.availableLines||0);
      byDate.set(key,{resourceId:entry.resourceId,date:entry.date,allocatedLines:used,availableLines:available});
    }
    for(const item of byDate.values())if(item.allocatedLines>item.availableLines)overAllocations.push(item);
    return {ok:overAllocations.length===0,overAllocations};
  }
  function shipmentSummary(orderQty,lots=[],inspectionDecision={}){
    const planned=lots.reduce((sum,lot)=>sum+Number(lot.plannedQty||0),0);
    const shipped=lots.reduce((sum,lot)=>sum+Number(lot.shippedQty||0),0);
    const passed=lots.reduce((sum,lot)=>sum+Number(lot.passedQty||0),0);
    const errors=[];
    for(const lot of lots){
      if(Number(lot.shippedQty||0)>Number(lot.passedQty||0))errors.push('Lot '+(lot.lotReference||lot.lotId)+' shipped quantity exceeds passed quantity.');
      if(Number(lot.shippedQty||0)>Number(lot.packedQty||0))errors.push('Lot '+(lot.lotReference||lot.lotId)+' shipped quantity exceeds packed quantity.');
    }
    if(inspectionDecision.status!=='passed'&&shipped>0)errors.push('Shipment cannot be released without verified final inspection pass.');
    return {ok:errors.length===0,orderQty:Number(orderQty||0),plannedQty:planned,passedQty:passed,shippedQty:shipped,remainingQty:Math.max(0,Number(orderQty||0)-shipped),wholeOrderShipped:shipped>=Number(orderQty||0),errors};
  }
  /*
   * Purpose: reconcile split shipment lots against the ordered quantity and each
   * lot's packed/passed/shipped evidence.
   * Access: pure calculation; callers provide an immutable order/lots snapshot.
   * Output: totals, PO allocation roll-up, warnings and blocking errors.
   * Failure: missing/invalid quantities remain Needs Information; no shipment is
   * auto-completed and no AQL/PPM decision is inferred.
   */
  function reconcileShipmentLots(orderQty,lots=[],options={}){
    const ordered=Number(orderQty);
    const errors=[],warnings=[],poTotals={};
    if(!Number.isFinite(ordered)||ordered<0)errors.push('Ordered quantity must be a non-negative number.');
    let planned=0,packed=0,passed=0,shipped=0;
    for(const lot of lots){
      const ref=lot.lotReference||lot.lotId||'Unnamed lot';
      const values={plannedQty:Number(lot.plannedQty),packedQty:Number(lot.packedQty||0),passedQty:Number(lot.passedQty||0),shippedQty:Number(lot.shippedQty||0)};
      if(!Number.isFinite(values.plannedQty)||values.plannedQty<0)errors.push(`${ref}: planned quantity is missing or invalid.`);
      for(const key of ['packedQty','passedQty','shippedQty'])if(!Number.isFinite(values[key])||values[key]<0)errors.push(`${ref}: ${key} must be a non-negative number.`);
      if(values.packedQty>values.plannedQty)errors.push(`${ref}: packed quantity exceeds planned quantity.`);
      if(values.passedQty>values.packedQty)errors.push(`${ref}: passed quantity exceeds packed quantity.`);
      if(values.shippedQty>values.passedQty)errors.push(`${ref}: shipped quantity exceeds passed quantity.`);
      planned+=Number.isFinite(values.plannedQty)?values.plannedQty:0;
      packed+=Number.isFinite(values.packedQty)?values.packedQty:0;
      passed+=Number.isFinite(values.passedQty)?values.passedQty:0;
      shipped+=Number.isFinite(values.shippedQty)?values.shippedQty:0;
      const allocations=Array.isArray(lot.poAllocation)?lot.poAllocation:[];
      const allocated=allocations.reduce((sum,item)=>sum+Number(item.qty||0),0);
      if(allocations.length&&allocated!==values.plannedQty)errors.push(`${ref}: PO allocation must equal the lot planned quantity.`);
      for(const item of allocations){
        const po=String(item.poNumber||'Unassigned PO');
        const qty=Number(item.qty||0);
        if(!Number.isFinite(qty)||qty<0)errors.push(`${ref}: PO allocation for ${po} is invalid.`);
        poTotals[po]=(poTotals[po]||0)+(Number.isFinite(qty)?qty:0);
      }
    }
    if(Number.isFinite(ordered)&&planned>ordered)errors.push('Planned lot quantity exceeds the ordered quantity.');
    if(Number.isFinite(ordered)&&shipped>ordered)errors.push('Shipped lot quantity exceeds the ordered quantity.');
    const allocationTotal=Object.values(poTotals).reduce((sum,value)=>sum+value,0);
    if(lots.length&&allocationTotal!==planned)errors.push('PO allocations do not reconcile to total planned lot quantity.');
    if(!lots.length)warnings.push('No shipment lots entered; split shipment readiness remains Needs Information.');
    if(!options.inspectionPassed&&shipped>0)errors.push('Shipment cannot be released without a verified final inspection pass.');
    const remaining=Number.isFinite(ordered)?Math.max(0,ordered-shipped):null;
    return {ok:errors.length===0,status:errors.length?'blocked':lots.length?'calculated':'needs-information',orderQty:Number.isFinite(ordered)?ordered:null,plannedQty:planned,packedQty:packed,passedQty:passed,shippedQty:shipped,remainingQty:remaining,unplannedQty:Number.isFinite(ordered)?Math.max(0,ordered-planned):null,wholeOrderPlanned:Number.isFinite(ordered)&&planned===ordered,wholeOrderShipped:Number.isFinite(ordered)&&shipped===ordered,poTotals,errors,warnings};
  }
  function rollingForecast(history=[],forecast={}){
    if(!forecast.forecastDate||!forecast.sourceRevision)return {ok:false,error:'Forecast date and source revision are required.'};
    return {ok:true,history:[...history,{forecastDate:forecast.forecastDate,sourceRevision:forecast.sourceRevision,reason:forecast.reason||'',calculatedAt:forecast.calculatedAt||new Date().toISOString(),engineVersion:ENGINE_VERSION}]};
  }
  function riskReasons({approval,material,capacity,schedule}={}){
    const reasons=[];
    if(approval&&['blocked','pending','rejected','needs-information'].includes(approval.status))reasons.push({type:'approval',status:approval.status,reason:approval.reason});
    if(material&&material.status!=='ready')reasons.push({type:'material',status:material.status,reason:material.reason});
    if(capacity&&capacity.status!=='calculated')reasons.push({type:'capacity',status:capacity.status,reason:capacity.message});
    if(schedule&&Number(schedule.workingDaysEarlyOrLate)>0)reasons.push({type:'forecast-late',status:'delayed',reason:`Forecast is ${schedule.workingDaysEarlyOrLate} working day(s) later than required.`});
    return reasons;
  }
  function lotTimeline(lot={}){
    return {lotId:lot.lotId||null,requestedExFactory:lot.requestedExFactory||null,currentExFactory:lot.currentExFactory||null,forecastExFactory:lot.forecastExFactory||null,actualExFactory:lot.actualExFactory||null,ETD:lot.ETD||null,ETA:lot.ETA||null,bookingRef:lot.bookingRef||null,inspectionRef:lot.inspectionRef||null,status:lot.status||'open'};
  }
  const api={ENGINE_VERSION,contractualLead,compareCommercial,approvalState,materialReadiness,verifiedRateDays,smvCapacity,validateOperationQuantity,checkSharedCapacity,shipmentSummary,reconcileShipmentLots,rollingForecast,riskReasons,lotTimeline};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaOperations=api;
})(typeof globalThis!=='undefined'?globalThis:this);
