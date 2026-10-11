'use strict';
/**
 * Pure PPM collaboration boundary. It defines shapes and fail-closed client guards;
 * it is not server authorization and is not loaded by the offline app yet.
 * Access: future guarded P-G09 adapter only. Inputs/outputs are cloned and no token,
 * storage, DOM or domain-engine access is permitted. Failures return stable codes.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PpmCollaborationContracts=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const CONTRACT_VERSION='vesa-ppm-collaboration-v1';
  const ROLES=Object.freeze(['tenant-admin','ppm-editor','ppm-approver','read-only']);
  const ACTIONS=Object.freeze(['meeting.update','meeting.finalize','approval.submit','notification.request']);
  const ERROR_CODES=Object.freeze({EXTERNAL_DEPENDENCY:'EXTERNAL_DEPENDENCY',INVALID_CONFIG:'INVALID_CONFIG',INVALID_SESSION:'INVALID_SESSION',FORBIDDEN:'FORBIDDEN',INVALID_COMMAND:'INVALID_COMMAND',CONFLICT:'CONFLICT',REMOTE_REQUEST_FAILED:'REMOTE_REQUEST_FAILED'});
  const result=(ok,code='',message='',value={})=>({ok,code,message,...value});
  const plain=value=>value&&typeof value==='object'&&!Array.isArray(value);
  const text=(value,max=200)=>typeof value==='string'&&value.length>0&&value.length<=max;
  const id=value=>text(value,200)&&/^[A-Za-z0-9._:-]+$/.test(value);
  const iso=value=>text(value,40)&&Number.isFinite(Date.parse(value));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const hasSecret=(value,seen=new Set())=>{if(!value||typeof value!=='object'||seen.has(value))return false;seen.add(value);return Object.entries(value).some(([key,child])=>/(?:token|secret|password|authorization|cookie)/i.test(key)||hasSecret(child,seen))};
  const uniqueIds=value=>Array.isArray(value)&&value.length<=500&&value.every(id)&&new Set(value).size===value.length;

  function connectionStatus(config,session){
    if(!config?.enabled)return result(false,ERROR_CODES.EXTERNAL_DEPENDENCY,'Secure collaboration is not configured.',{mode:'local'});
    if(!text(config.baseUrl,500)||!/^https:\/\//.test(config.baseUrl)||/[?#]$/.test(config.baseUrl))return result(false,ERROR_CODES.INVALID_CONFIG,'Secure collaboration needs an approved HTTPS service.',{mode:'local'});
    const valid=validateSession(session);if(!valid.ok)return {...valid,mode:'local'};
    return result(true,'','',{mode:'connected'});
  }
  function validateSession(session){
    if(!plain(session)||!id(session.tenantId)||!id(session.userId)||!id(session.membershipId)||!ROLES.includes(session.role)||!iso(session.expiresAt)||Date.parse(session.expiresAt)<=Date.now())return result(false,ERROR_CODES.INVALID_SESSION,'A current server session is required.');
    if(!uniqueIds(session.meetingIds)||!uniqueIds(session.factoryIds)||!uniqueIds(session.buyerIds)||!text(session.accessToken,8000))return result(false,ERROR_CODES.INVALID_SESSION,'The server session is missing explicit access scope.');
    return result(true);
  }
  function validateMeeting(meeting){
    return plain(meeting)&&id(meeting.meetingId)&&id(meeting.tenantId)&&id(meeting.factoryId)&&id(meeting.buyerId)&&Number.isInteger(meeting.revision)&&meeting.revision>=0;
  }
  function canAccessMeeting(session,meeting){
    const valid=validateSession(session);if(!valid.ok)return valid;
    if(!validateMeeting(meeting)||meeting.tenantId!==session.tenantId)return result(false,ERROR_CODES.FORBIDDEN,'This meeting is outside the authorized tenant.');
    if(!session.meetingIds.includes(meeting.meetingId)&&!session.factoryIds.includes(meeting.factoryId)&&!session.buyerIds.includes(meeting.buyerId))return result(false,ERROR_CODES.FORBIDDEN,'This meeting is outside the authorized scope.');
    return result(true);
  }
  function validateCommand(command){
    if(!plain(command)||command.contractVersion!==CONTRACT_VERSION||!id(command.requestId)||!id(command.tenantId)||!id(command.meetingId)||!id(command.actorUserId)||!id(command.membershipId)||!ACTIONS.includes(command.action)||!Number.isInteger(command.expectedRevision)||command.expectedRevision<0||!iso(command.commandAt)||!plain(command.payload)||hasSecret(command.payload))return result(false,ERROR_CODES.INVALID_COMMAND,'The collaboration command is incomplete or unsafe.');
    return result(true);
  }
  function createCommand(input,session,meeting){
    const access=canAccessMeeting(session,meeting);if(!access.ok)return access;
    const command={contractVersion:CONTRACT_VERSION,requestId:input?.requestId,tenantId:session.tenantId,meetingId:meeting.meetingId,actorUserId:session.userId,membershipId:session.membershipId,action:input?.action,expectedRevision:input?.expectedRevision,commandAt:input?.commandAt,payload:clone(input?.payload||{})};
    const valid=validateCommand(command);return valid.ok?result(true,'','',{command}):valid;
  }
  function authorizeCommand(session,meeting,command){
    const access=canAccessMeeting(session,meeting);if(!access.ok)return access;
    const valid=validateCommand(command);if(!valid.ok)return valid;
    if(command.tenantId!==session.tenantId||command.meetingId!==meeting.meetingId||command.actorUserId!==session.userId||command.membershipId!==session.membershipId)return result(false,ERROR_CODES.FORBIDDEN,'The command actor or meeting scope does not match the session.');
    if(command.expectedRevision!==meeting.revision)return result(false,ERROR_CODES.CONFLICT,'The meeting revision changed. Manual review is required.');
    if(session.role==='read-only')return result(false,ERROR_CODES.FORBIDDEN,'This role cannot change a meeting.');
    if(command.action==='meeting.finalize'&&!['tenant-admin','ppm-approver'].includes(session.role))return result(false,ERROR_CODES.FORBIDDEN,'This role cannot finalize a meeting.');
    if(command.action==='approval.submit'){
      if(!['tenant-admin','ppm-approver'].includes(session.role))return result(false,ERROR_CODES.FORBIDDEN,'This role cannot submit approval.');
      if(!id(command.payload.authorityVersion)||!text(command.payload.evidenceReference,500)||!['approved','rejected'].includes(command.payload.decision))return result(false,ERROR_CODES.INVALID_COMMAND,'Approval requires an authority version, decision and evidence reference.');
    }
    return result(true);
  }
  function createOfflineIntent(command,input){
    const valid=validateCommand(command);if(!valid.ok)return valid;
    if(!id(input?.intentId)||!iso(input?.queuedAt))return result(false,ERROR_CODES.INVALID_COMMAND,'The offline change is missing its identity or queue time.');
    return result(true,'','',{intent:{contractVersion:CONTRACT_VERSION,intentId:input.intentId,requestId:command.requestId,tenantId:command.tenantId,meetingId:command.meetingId,queuedAt:input.queuedAt,status:'queued',command:clone(command)}});
  }
  function validateOfflineIntent(intent){
    if(!plain(intent)||intent.contractVersion!==CONTRACT_VERSION||!id(intent.intentId)||!id(intent.requestId)||!id(intent.tenantId)||!id(intent.meetingId)||!iso(intent.queuedAt)||intent.status!=='queued'||hasSecret(intent)||!validateCommand(intent.command).ok||intent.requestId!==intent.command.requestId||intent.tenantId!==intent.command.tenantId||intent.meetingId!==intent.command.meetingId)return result(false,ERROR_CODES.INVALID_COMMAND,'The offline change is incomplete or unsafe.');
    return result(true);
  }
  function reconcileOfflineIntent(intent,response){
    const valid=validateOfflineIntent(intent);if(!valid.ok)return valid;
    if(!plain(response)||hasSecret(response)||!['accepted','conflict'].includes(response.status)||!Number.isInteger(response.serverRevision)||response.serverRevision<0)throw Error('The collaboration response is incomplete or unsafe.');
    if(response.status==='accepted')return {ok:true,status:'sent',serverRevision:response.serverRevision,requestId:intent.requestId};
    if(!text(response.reason,1000)||!plain(response.serverMeeting))throw Error('A conflict must preserve the server meeting and reason.');
    return {ok:true,status:'conflict',code:ERROR_CODES.CONFLICT,metadata:{resolution:'manual-review-required',reason:response.reason,clientCommand:clone(intent.command),serverMeeting:clone(response.serverMeeting),serverRevision:response.serverRevision}};
  }
  function validateEnvelope(body,requestId,tenantId){
    if(!plain(body)||body.contractVersion!==CONTRACT_VERSION||body.requestId!==requestId||body.tenantId!==tenantId||!Number.isInteger(body.revision)||body.revision<0||!plain(body.audit)||!id(body.audit.eventId)||!id(body.audit.actorUserId)||!iso(body.audit.at)||hasSecret(body))return result(false,ERROR_CODES.REMOTE_REQUEST_FAILED,'The collaboration service returned an invalid response.');
    return result(true,'','',{body});
  }
  function createRemoteApi(config={},options={}){
    const session=options.session,fetchImpl=options.fetchImpl||globalThis.fetch,status=()=>connectionStatus(config,session);
    const request=async(meeting,command)=>{const ready=status();if(!ready.ok){const error=Error(ready.message);error.code=ready.code;throw error}const authorized=authorizeCommand(session,meeting,command);if(!authorized.ok){const error=Error(authorized.message);error.code=authorized.code;throw error}let response;try{response=await fetchImpl(`${config.baseUrl.replace(/\/$/,'')}/api/v1/ppm/meetings/${encodeURIComponent(meeting.meetingId)}/commands`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.accessToken}`,'X-VESA-PPM-Contract':CONTRACT_VERSION,'Idempotency-Key':command.requestId},body:JSON.stringify(command)})}catch{const error=Error('The collaboration service could not be reached. Your local meeting is unchanged.');error.code=ERROR_CODES.REMOTE_REQUEST_FAILED;throw error}const body=await response.json();if(response.status===409)return reconcileOfflineIntent(createOfflineIntent(command,{intentId:`INTENT-${command.requestId}`,queuedAt:command.commandAt}).intent,body);if(!response.ok){const error=Error('The collaboration service did not accept the change. Your local meeting is unchanged.');error.code=ERROR_CODES.REMOTE_REQUEST_FAILED;throw error}const checked=validateEnvelope(body,command.requestId,session.tenantId);if(!checked.ok){const error=Error(checked.message);error.code=checked.code;throw error}return checked.body};
    return {status,sendCommand:request};
  }
  return Object.freeze({CONTRACT_VERSION,ROLES,ACTIONS,ERROR_CODES,connectionStatus,validateSession,canAccessMeeting,validateCommand,createCommand,authorizeCommand,createOfflineIntent,validateOfflineIntent,reconcileOfflineIntent,validateEnvelope,createRemoteApi});
});
