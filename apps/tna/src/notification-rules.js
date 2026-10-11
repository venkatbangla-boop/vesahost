(function(root){
  'use strict';

  const CONTRACT_VERSION='TNA360-NOTIFICATION-RULES-1';
  const CLOSED_STATUSES=new Set(['completed','approved','waived','not-applicable']);
  const EXTERNAL_CHANNELS=new Set(['email','push','sms','whatsapp']);
  const copy=value=>JSON.parse(JSON.stringify(value));
  const civil=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))throw new Error('Alert evaluation requires an explicit YYYY-MM-DD as-of date.');return Math.floor(Date.parse(`${value}T00:00:00Z`)/86400000)};
  const dueDate=task=>task?.dates?.currentTargetFinish||task?.dates?.forecastFinish||task?.dates?.baselineFinish||'';

  function buildInAppAlerts(plan,options={}){
    if(!plan||!Array.isArray(plan.tasks))throw new Error('Alert evaluation requires a valid TNA plan.');
    const asOfDate=String(options.asOfDate||''),asOf=civil(asOfDate),upcomingDays=Number.isInteger(options.upcomingDays)&&options.upcomingDays>=0&&options.upcomingDays<=30?options.upcomingDays:7;
    const alerts=[];
    for(const task of plan.tasks){
      if(CLOSED_STATUSES.has(task.status))continue;
      const date=dueDate(task),days=date?civil(date)-asOf:null;
      let rule='',severity='info';
      if(task.status==='blocked'){rule='blocked-action';severity='high';}
      else if(days!==null&&days<0){rule='overdue-action';severity='high';}
      else if(days===0){rule='due-today';severity='medium';}
      else if(days!==null&&days<=upcomingDays){rule='upcoming-action';severity='low';}
      if(!rule)continue;
      const id=`${plan.recordId}:${task.taskId}:${rule}:${asOfDate}`;
      alerts.push({id,dedupeKey:id,contractVersion:CONTRACT_VERSION,recordId:plan.recordId,taskId:task.taskId,templateRef:task.templateRef,title:task.title,ownerParty:task.ownerParty,status:task.status,dueDate:date,asOfDate,rule,severity,message:rule==='blocked-action'?`${task.templateRef} is blocked and needs reviewed action.`:rule==='overdue-action'?`${task.templateRef} is overdue from ${date}.`:rule==='due-today'?`${task.templateRef} is due today.`:`${task.templateRef} is due on ${date}.`});
      if(alerts.length>=100)break;
    }
    return alerts;
  }

  function inQuietHours(hour,start,end){
    if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(start)||start<0||start>23||!Number.isInteger(end)||end<0||end>23)throw new Error('Quiet hours require integer hours from 0 to 23.');
    if(start===end)return false;
    return start<end?hour>=start&&hour<end:hour>=start||hour<end;
  }

  function prepareDelivery(alert,policy,recipient,context={}){
    if(!alert?.dedupeKey||!alert.recordId)return {ok:false,code:'INVALID_ALERT',message:'A validated alert is required.'};
    if(!policy||policy.enabled!==true)return {ok:false,code:'POLICY_DISABLED',message:'Notification policy is disabled.'};
    const channel=String(policy.channel||'in-app').toLowerCase();
    if(EXTERNAL_CHANNELS.has(channel))return {ok:false,code:'EXTERNAL_DEPENDENCY',message:'External notification delivery is not configured.'};
    if(channel!=='in-app')return {ok:false,code:'UNSUPPORTED_CHANNEL',message:'Notification channel is not supported.'};
    if(!recipient?.userId||recipient.enabled!==true||!Array.isArray(recipient.allowedRecordIds)||!recipient.allowedRecordIds.includes(alert.recordId))return {ok:false,code:'UNAUTHORIZED_RECIPIENT',message:'Recipient is not authorized for this TNA.'};
    const quiet=policy.quietHours||{start:22,end:7},localHour=context.localHour;
    if(inQuietHours(localHour,quiet.start,quiet.end))return {ok:false,code:'QUIET_HOURS',message:'Alert is held during configured quiet hours.'};
    const deliveredKeys=new Set(context.deliveredKeys||[]);
    if(deliveredKeys.has(alert.dedupeKey))return {ok:false,code:'DUPLICATE',message:'This alert was already delivered for the current as-of date.'};
    return {ok:true,intent:{intentId:`in-app:${alert.dedupeKey}:${recipient.userId}`,channel:'in-app',recipientUserId:recipient.userId,recordId:alert.recordId,alertId:alert.id,dedupeKey:alert.dedupeKey,createdAt:String(context.createdAt||''),message:alert.message}};
  }

  const api={CONTRACT_VERSION,CLOSED_STATUSES,EXTERNAL_CHANNELS,dueDate,buildInAppAlerts,inQuietHours,prepareDelivery};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaNotificationRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
