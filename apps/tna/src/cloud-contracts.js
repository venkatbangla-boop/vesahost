(function(root){
  'use strict';

  // Purpose: define the browser/server contract boundary without pretending that
  // client-side checks are authorization. Access: local adapters and future API
  // clients. Inputs are plain DTOs; outputs are immutable validation results.
  // Side effects: none. Failure mode: stable error codes for user-safe handling.
  const CONTRACT_VERSION='VESA-TNA-CLOUD-1';
  const API_VERSION='v1';
  const MODES=Object.freeze({LOCAL:'local',CONNECTED:'connected'});
  const ROLES=Object.freeze(['system-admin','tenant-admin','agent-manager','factory-manager','merchandiser','buyer-reviewer','quality-reviewer','read-only']);
  const ENDPOINTS=Object.freeze({
    orders:'/api/v1/tna/orders',
    order:orderId=>`/api/v1/tna/orders/${encodeURIComponent(String(orderId||''))}`,
    baseline:orderId=>`${ENDPOINTS.order(orderId)}/baseline`,
    revisions:orderId=>`${ENDPOINTS.order(orderId)}/revisions`,
    approvals:orderId=>`${ENDPOINTS.order(orderId)}/approvals`,
    audit:orderId=>`${ENDPOINTS.order(orderId)}/audit`,
    attachments:orderId=>`${ENDPOINTS.order(orderId)}/attachments`,
    portfolio:'/api/v1/tna/portfolio',
    notificationSubscriptions:'/api/v1/tna/notifications/subscriptions',
    health:'/api/v1/tna/health'
  });
  const ERROR_CODES=Object.freeze({
    EXTERNAL_DEPENDENCY:'EXTERNAL_DEPENDENCY',
    INVALID_CONFIG:'INVALID_CONFIG',
    INVALID_SESSION:'INVALID_SESSION',
    TENANT_SCOPE_REQUIRED:'TENANT_SCOPE_REQUIRED',
    ORDER_SCOPE_REQUIRED:'ORDER_SCOPE_REQUIRED',
    EXPECTED_REVISION_REQUIRED:'EXPECTED_REVISION_REQUIRED',
    INVALID_COMMAND:'INVALID_COMMAND',
    REMOTE_REQUEST_FAILED:'REMOTE_REQUEST_FAILED'
  });
  const copy=value=>JSON.parse(JSON.stringify(value));
  const text=value=>String(value??'').trim();
  const nonEmpty=value=>text(value).length>0;
  const validId=value=>/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(text(value));
  const validFutureOrCurrentIso=value=>{const time=Date.parse(value);return typeof value==='string'&&Number.isFinite(time)&&time>Date.now();};
  function result(ok,errors=[],warnings=[]){return {ok,errors:[...errors],warnings:[...warnings]};}
  function normalizeConfig(input={}){return {enabled:input.enabled===true,baseUrl:text(input.baseUrl).replace(/\/+$/,''),provider:text(input.provider),configuredBy:text(input.configuredBy)}}
  function connectionStatus(config={},session=null){
    const normalized=normalizeConfig(config);
    if(!normalized.enabled||!normalized.baseUrl)return {mode:MODES.LOCAL,enabled:false,code:ERROR_CODES.EXTERNAL_DEPENDENCY,userMessage:'Connected collaboration is unavailable until an authorized provider, identity, database and storage are configured.'};
    if(!/^https:\/\//i.test(normalized.baseUrl)&&!/^http:\/\/localhost(?::\d+)?(?:\/|$)/i.test(normalized.baseUrl))return {mode:MODES.LOCAL,enabled:false,code:ERROR_CODES.INVALID_CONFIG,userMessage:'Connected collaboration configuration must use HTTPS; HTTP is permitted only for localhost testing.'};
    const sessionResult=validateSession(session);
    if(!sessionResult.ok)return {mode:MODES.LOCAL,enabled:false,code:ERROR_CODES.INVALID_SESSION,userMessage:'Connected collaboration requires a verified tenant session.'};
    return {mode:MODES.CONNECTED,enabled:true,code:'READY',userMessage:'Connected collaboration is configured for this tenant session.'};
  }
  function validateSession(session){
    const errors=[];
    if(!session||typeof session!=='object')return result(false,[ERROR_CODES.INVALID_SESSION]);
    if(!validId(session.tenantId))errors.push('tenantId is required.');
    if(!validId(session.userId))errors.push('userId is required.');
    if(!validId(session.membershipId))errors.push('membershipId is required.');
    if(!ROLES.includes(session.role))errors.push('role is not supported.');
    if(!validFutureOrCurrentIso(session.expiresAt))errors.push('expiresAt must be a valid timestamp.');
    if(!Array.isArray(session.orderIds)||!Array.isArray(session.factoryIds)||!Array.isArray(session.buyerIds))errors.push('Explicit order, factory and buyer scopes are required.');
    return result(!errors.length,errors);
  }
  function canAccessOrder(session,order){
    const sessionResult=validateSession(session);
    if(!sessionResult.ok)return {ok:false,code:ERROR_CODES.INVALID_SESSION};
    if(!order||text(order.tenantId)!==text(session.tenantId))return {ok:false,code:ERROR_CODES.TENANT_SCOPE_REQUIRED};
    const scopeMatch=session.orderIds.includes(order.orderId)||session.factoryIds.includes(order.factoryId)||session.buyerIds.includes(order.buyerId);
    return scopeMatch?{ok:true,code:'AUTHORIZED_SCOPE'}:{ok:false,code:ERROR_CODES.ORDER_SCOPE_REQUIRED};
  }
  function validateCommand(command){
    const errors=[];
    if(!command||typeof command!=='object')return result(false,[ERROR_CODES.INVALID_COMMAND]);
    if(command.contractVersion!==CONTRACT_VERSION)errors.push('Unsupported cloud contract version.');
    if(!validId(command.requestId))errors.push('requestId is required.');
    if(!validId(command.tenantId))errors.push('tenantId is required.');
    if(!validId(command.actorUserId))errors.push('actorUserId is required.');
    if(!nonEmpty(command.action))errors.push('action is required.');
    if(!Number.isInteger(command.expectedRevision)||command.expectedRevision<0)errors.push(ERROR_CODES.EXPECTED_REVISION_REQUIRED);
    if(!command.payload||typeof command.payload!=='object'||Array.isArray(command.payload))errors.push('payload must be an object.');
    return result(!errors.length,errors);
  }
  function createCommand(input={},session,order){
    const sessionResult=validateSession(session);
    if(!sessionResult.ok)return {ok:false,code:ERROR_CODES.INVALID_SESSION,errors:sessionResult.errors};
    if(order){const access=canAccessOrder(session,order);if(!access.ok)return {ok:false,code:access.code,errors:[access.code]};}
    const command={contractVersion:CONTRACT_VERSION,apiVersion:API_VERSION,requestId:text(input.requestId),tenantId:text(session.tenantId),actorUserId:text(session.userId),action:text(input.action),orderId:text(input.orderId||order?.orderId),expectedRevision:input.expectedRevision,payload:copy(input.payload||{})};
    const validation=validateCommand(command);
    return validation.ok?{ok:true,command}:{ok:false,code:ERROR_CODES.INVALID_COMMAND,errors:validation.errors};
  }
  const api={CONTRACT_VERSION,API_VERSION,MODES,ROLES,ENDPOINTS,ERROR_CODES,normalizeConfig,connectionStatus,validateSession,canAccessOrder,validateCommand,createCommand};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaCloudContracts=api;
})(typeof globalThis!=='undefined'?globalThis:this);
