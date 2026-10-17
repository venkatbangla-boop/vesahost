/* APP-11 on-screen follow-up only: explicit date and owner, no mail/SMS or background scheduler. */
(function(root){
'use strict';
class VesaCRMFollowupScheduler{
 static check(f,enquiries,opps){
  const E=root.VesaBuyerDirectory,errors=[];
  for(const k of ['id','linkType','linkId','owner','sourceRef'])
   if(!E.valid(f?.[k],240))errors.push('Follow-up requires explicit '+k);
  if(!E.date(f?.dueDate)||!E.date(f?.createdDate))errors.push('Follow-up needs sourced date-only timeline');
  if(!['enquiry','opportunity'].includes(f?.linkType)||
   !(f?.linkType==='enquiry'?enquiries:opps).has(f?.linkId))
   errors.push('Follow-up link must match a known enquiry or opportunity');
  if(!['open','done','cancelled'].includes(f?.status))
   errors.push('Follow-up is local open/done/cancelled only');
  if(f?.status!=='open'&&(!E.date(f?.closedDate)||!E.valid(f?.outcomeSourceRef)))
   errors.push('Closed follow-up must cite date and explicit outcome source');
  if(f?.status==='open'&&(f?.closedDate||f?.outcomeSourceRef))
   errors.push('Open follow-up cannot have completed evidence');
  if(f?.reminderSent===true||f?.contactedExternally===true)
   errors.push('Static CRM cannot claim external message delivery');
  return errors;
 }
 static evaluate(record,asOf){
  const E=root.VesaBuyerDirectory,a=E.validate(record);
  if(!a.ok)throw Error(a.errors.join('; '));
  if(!E.date(asOf))throw Error('Choose an exact as-of date to view local follow-ups');
  const today=Date.parse(asOf+'T00:00:00Z');
  return record.followups.map(f=>{
   const days=(Date.parse(f.dueDate+'T00:00:00Z')-today)/86400000;
   return{followupId:f.id,linkType:f.linkType,linkId:f.linkId,owner:f.owner,dueDate:f.dueDate,
    daysUntilDue:days,localState:f.status==='open'?(days<0?'overdue':days===0?'due-today':'upcoming'):f.status,
    contactedExternally:false,notificationSent:false,sourceRef:f.sourceRef};
  });
 }
}
root.VesaCRMFollowupScheduler=VesaCRMFollowupScheduler;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaCRMFollowupScheduler;
})(typeof globalThis!=='undefined'?globalThis:this);
