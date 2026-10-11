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
  const RIGHTS=Object.freeze({
    'system-admin':['*'],
    'tenant-admin':['*'],
    'agent-manager':['order.read','order.create','order.update','revision.create','shipment.update','attachment.add','portfolio.read'],
    'factory-manager':['order.read','order.update','revision.create','shipment.update','attachment.add','portfolio.read'],
    merchandiser:['order.read','order.create','order.update','revision.create','shipment.update','attachment.add','portfolio.read'],
    'buyer-reviewer':['order.read','approval.submit','attachment.add','portfolio.read'],
    'quality-reviewer':['order.read','approval.submit','attachment.add'],
    'read-only':['order.read','portfolio.read']
  });
  const ACTION_RIGHTS=Object.freeze({'order.read':'order.read','order.create':'order.create','order.update':'order.update','revision.create':'revision.create','shipment.update':'shipment.update','approval.submit':'approval.submit','baseline.confirm':'approval.submit','attachment.add':'attachment.add','portfolio.read':'portfolio.read'});
  const ATTACHMENT_MAX_BYTES=25*1024*1024;
  const ATTACHMENT_MIME_TYPES=Object.freeze(['application/pdf','image/jpeg','image/png','text/plain','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
  const OFFLINE_STATUSES=Object.freeze(['queued','sent','conflict','rejected']);
  const RECONCILIATION_STATUSES=Object.freeze(['accepted','conflict','rejected']);
  const HEALTH_STATUSES=Object.freeze(['ok','degraded','unavailable']);
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
  const validIso=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
  const SENSITIVE_FIELD_NAMES=Object.freeze(['accesstoken','refreshtoken','authorization','password','apikey','clientsecret']);
  const normalizeFieldName=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
  const containsSensitiveField=value=>{if(!value||typeof value!=='object')return false;return Object.entries(value).some(([key,item])=>SENSITIVE_FIELD_NAMES.includes(normalizeFieldName(key))||containsSensitiveField(item));};
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
    if(containsSensitiveField(command.payload))errors.push('Command payloads must not contain tokens, credentials or authorization fields.');
    return result(!errors.length,errors);
  }
  function hasRight(session,action){const rights=RIGHTS[session?.role]||[];const required=ACTION_RIGHTS[action];return !!required&&(rights.includes('*')||rights.includes(required));}
  function validateAttachmentMetadata(attachment){
    const errors=[];
    if(!attachment||typeof attachment!=='object')return result(false,['attachment metadata is required.']);
    if(!nonEmpty(attachment.name)||/[\\/\0]/.test(String(attachment.name)))errors.push('attachment name must be a safe file name.');
    if(!ATTACHMENT_MIME_TYPES.includes(text(attachment.mimeType)))errors.push('attachment MIME type is not allowed.');
    if(!Number.isInteger(attachment.size)||attachment.size<1||attachment.size>ATTACHMENT_MAX_BYTES)errors.push('attachment size is outside the allowed bound.');
    if(attachment.sha256&&!/^[a-f0-9]{64}$/i.test(String(attachment.sha256)))errors.push('attachment sha256 must be a hexadecimal digest.');
    if(!['buyer','factory','internal'].includes(text(attachment.visibility)))errors.push('attachment visibility is not supported.');
    return result(!errors.length,errors);
  }
  function validateHealthResponse(payload){
    const errors=[];
    if(!payload||typeof payload!=='object'||Array.isArray(payload))return result(false,['Health response must be an object.']);
    if(payload.contractVersion!==CONTRACT_VERSION)errors.push('Health response contract version is unsupported.');
    if(!HEALTH_STATUSES.includes(text(payload.status)))errors.push('Health response status is not supported.');
    if(!validIso(payload.checkedAt))errors.push('Health response checkedAt must be a valid timestamp.');
    return result(!errors.length,errors);
  }
  function authorizeServerCommand(session,order,command){
    const sessionResult=validateSession(session);
    if(!sessionResult.ok)return {ok:false,code:ERROR_CODES.INVALID_SESSION,errors:sessionResult.errors};
    const commandResult=validateCommand(command);
    if(!commandResult.ok)return {ok:false,code:ERROR_CODES.INVALID_COMMAND,errors:commandResult.errors};
    if(command.tenantId!==session.tenantId)return {ok:false,code:ERROR_CODES.TENANT_SCOPE_REQUIRED,errors:[ERROR_CODES.TENANT_SCOPE_REQUIRED]};
    const access=canAccessOrder(session,order);
    if(!access.ok)return {ok:false,code:access.code,errors:[access.code]};
    if(!hasRight(session,command.action))return {ok:false,code:'FORBIDDEN',errors:['The verified role does not grant this action.']};
    if(command.action==='approval.submit'||command.action==='baseline.confirm'){
      if(!validId(command.payload.authorityVersion)||!nonEmpty(command.payload.evidenceReference))return {ok:false,code:'APPROVAL_EVIDENCE_REQUIRED',errors:['Approval authority version and evidence reference are required.']};
    }
    if(command.action==='attachment.add'){
      const attachmentResult=validateAttachmentMetadata(command.payload.attachment);
      if(!attachmentResult.ok)return {ok:false,code:'INVALID_ATTACHMENT',errors:attachmentResult.errors};
    }
    return {ok:true,code:'AUTHORIZED',audit:createAuditEnvelope(session,command)};
  }
  function createAuditEnvelope(session,command){return {contractVersion:CONTRACT_VERSION,eventId:text(command.requestId),tenantId:text(session.tenantId),actorUserId:text(session.userId),action:text(command.action),orderId:text(command.orderId),expectedRevision:command.expectedRevision,recordedAt:new Date().toISOString()};}
  function createOfflineIntent(command,input={}){
    const validation=validateCommand(command);
    if(!validation.ok)return {ok:false,code:ERROR_CODES.INVALID_COMMAND,errors:validation.errors};
    const intent={contractVersion:CONTRACT_VERSION,intentId:text(input.intentId||command.requestId),requestId:command.requestId,tenantId:command.tenantId,actorUserId:command.actorUserId,baseRevision:command.expectedRevision,status:'queued',queuedAt:text(input.queuedAt)||new Date().toISOString(),command:copy(command)};
    const intentValidation=validateOfflineIntent(intent);
    return intentValidation.ok?{ok:true,intent}:{ok:false,code:'INVALID_OFFLINE_INTENT',errors:intentValidation.errors};
  }
  function validateOfflineIntent(intent){
    const errors=[];
    if(!intent||intent.contractVersion!==CONTRACT_VERSION)errors.push('Unsupported offline intent contract.');
    if(!validId(intent?.intentId)||!validId(intent?.requestId))errors.push('Offline intent IDs are required.');
    if(!validId(intent?.tenantId)||!validId(intent?.actorUserId))errors.push('Offline intent tenant and actor are required.');
    if(!Number.isInteger(intent?.baseRevision)||intent.baseRevision<0)errors.push('Offline intent baseRevision is required.');
    if(!OFFLINE_STATUSES.includes(intent?.status))errors.push('Offline intent status is not supported.');
    const commandResult=validateCommand(intent?.command);
    if(!commandResult.ok)errors.push(...commandResult.errors);
    if(intent?.command?.requestId!==intent?.requestId||intent?.command?.tenantId!==intent?.tenantId)errors.push('Offline intent command identity does not match its envelope.');
    if(containsSensitiveField(intent))errors.push('Offline intents must never contain tokens, credentials or authorization fields.');
    return result(!errors.length,errors);
  }
  function reconcileOfflineIntent(intent,serverResult={}){
    const intentValidation=validateOfflineIntent(intent);
    if(!intentValidation.ok)return {ok:false,code:'INVALID_OFFLINE_INTENT',errors:intentValidation.errors};
    const status=text(serverResult.status);
    const errors=[];
    if(!RECONCILIATION_STATUSES.includes(status))errors.push('Server reconciliation status is not supported.');
    if(containsSensitiveField(serverResult))errors.push('Server reconciliation results must not contain tokens, credentials or authorization fields.');
    if(!Number.isInteger(serverResult.serverRevision)||serverResult.serverRevision<0)errors.push('Server reconciliation revision is required.');
    if(status==='rejected'&&!nonEmpty(serverResult.reason))errors.push('Rejected offline intents require a reason.');
    if(status==='conflict'&&(!nonEmpty(serverResult.reason)||!serverResult.serverRecord||typeof serverResult.serverRecord!=='object'||Array.isArray(serverResult.serverRecord)))errors.push('Conflicts require a reason and the server version for review.');
    if(errors.length)return {ok:false,code:'INVALID_RECONCILIATION',errors};
    const metadata={resolution:'manual-review-required',serverRevision:serverResult.serverRevision,reason:text(serverResult.reason),serverRecord:serverResult.serverRecord?copy(serverResult.serverRecord):null,clientCommand:copy(intent.command)};
    return {ok:true,status:status==='accepted'?'sent':status,metadata};
  }
  function createCommand(input={},session,order){
    const sessionResult=validateSession(session);
    if(!sessionResult.ok)return {ok:false,code:ERROR_CODES.INVALID_SESSION,errors:sessionResult.errors};
    if(order){const access=canAccessOrder(session,order);if(!access.ok)return {ok:false,code:access.code,errors:[access.code]};}
    const command={contractVersion:CONTRACT_VERSION,apiVersion:API_VERSION,requestId:text(input.requestId),tenantId:text(session.tenantId),actorUserId:text(session.userId),action:text(input.action),orderId:text(input.orderId||order?.orderId),expectedRevision:input.expectedRevision,payload:copy(input.payload||{})};
    const validation=validateCommand(command);
    return validation.ok?{ok:true,command}:{ok:false,code:ERROR_CODES.INVALID_COMMAND,errors:validation.errors};
  }
  const api={CONTRACT_VERSION,API_VERSION,MODES,ROLES,RIGHTS,ACTION_RIGHTS,ENDPOINTS,ERROR_CODES,ATTACHMENT_MAX_BYTES,ATTACHMENT_MIME_TYPES,OFFLINE_STATUSES,RECONCILIATION_STATUSES,HEALTH_STATUSES,SENSITIVE_FIELD_NAMES,normalizeConfig,connectionStatus,validateSession,canAccessOrder,validateCommand,createCommand,hasRight,validateAttachmentMetadata,validateHealthResponse,authorizeServerCommand,createAuditEnvelope,createOfflineIntent,validateOfflineIntent,reconcileOfflineIntent};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaCloudContracts=api;
})(typeof globalThis!=='undefined'?globalThis:this);
