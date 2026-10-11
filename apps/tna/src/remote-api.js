(function(root){
  'use strict';
  const contracts=root.VesaTnaCloudContracts||(typeof require==='function'?require('./cloud-contracts.js'):null);
  if(!contracts)throw new Error('TNA cloud contracts are not loaded.');

  // Purpose: own the optional tenant-aware HTTP boundary. Access: application
  // services may create this adapter with runtime provider/session values.
  // Inputs are a provider config, transient verified session and injectable fetch;
  // outputs are parsed responses or stable user-safe errors. State is the current
  // session only. No token is logged or persisted by this adapter.
  function adapterError(code,message){const error=new Error(message);error.code=code;return error;}
  const PROTECTED_HEADERS=new Set(['authorization','content-type','idempotency-key','x-vesa-tna-contract','x-vesa-tna-tenant']);
  function createRemoteApi(config={},options={}){
    const normalized=contracts.normalizeConfig(config);
    const fetchImpl=options.fetchImpl||root.fetch;
    let session=options.session||null;
    function status(){return contracts.connectionStatus(normalized,session);}
    function setSession(next){const validation=contracts.validateSession(next);if(!validation.ok)throw adapterError(contracts.ERROR_CODES.INVALID_SESSION,'Connected collaboration requires a verified tenant session.');session=next;return status();}
    async function request(path,init={}){
      const current=status();
      if(!current.enabled)throw adapterError(current.code,current.userMessage);
      if(typeof fetchImpl!=='function')throw adapterError(contracts.ERROR_CODES.EXTERNAL_DEPENDENCY,'Connected collaboration is unavailable in this browser context.');
      const {requestId,...requestInit}=init;
      const callerHeaders=Object.fromEntries(Object.entries(requestInit.headers||{}).filter(([name])=>!PROTECTED_HEADERS.has(String(name).toLowerCase())));
      const headers={...callerHeaders,Accept:'application/json','Content-Type':'application/json','X-VESA-TNA-Contract':contracts.CONTRACT_VERSION,'X-VESA-TNA-Tenant':session.tenantId};
      if(session.accessToken)headers.Authorization=`Bearer ${session.accessToken}`;
      if(requestId)headers['Idempotency-Key']=requestId;
      let response;
      try{response=await fetchImpl(`${normalized.baseUrl}${path}`,{...requestInit,headers,credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer'});}catch(error){throw adapterError(contracts.ERROR_CODES.REMOTE_REQUEST_FAILED,'The connected service could not be reached. Local work remains available.');}
      if(!response?.ok)throw adapterError(contracts.ERROR_CODES.REMOTE_REQUEST_FAILED,`Connected service returned status ${Number(response?.status)||'unknown'}. Local work remains available.`);
      if(response.status===204)return null;
      try{return await response.json();}catch{throw adapterError(contracts.ERROR_CODES.REMOTE_REQUEST_FAILED,'Connected service returned an unreadable response. Local work remains available.');}
    }
    function listOrders(filters={}){const query=new URLSearchParams(Object.entries(filters).filter(([,value])=>value!==undefined&&value!==null&&String(value)!==''));return request(`${contracts.ENDPOINTS.orders}${query.toString()?`?${query}`:''}`,{method:'GET'});}
    function updateOrder(order,input={}){const command=contracts.createCommand({requestId:input.requestId,action:'order.update',orderId:order?.orderId,expectedRevision:input.expectedRevision,payload:input.payload||{}},session,order);if(!command.ok)throw adapterError(command.code,command.errors.join(' '));return request(contracts.ENDPOINTS.order(order.orderId),{method:'PATCH',requestId:command.command.requestId,body:JSON.stringify(command.command)});}
    async function health(){const payload=await request(contracts.ENDPOINTS.health,{method:'GET'});const validation=contracts.validateHealthResponse(payload);if(!validation.ok)throw adapterError(contracts.ERROR_CODES.REMOTE_REQUEST_FAILED,'Connected service returned an invalid health response. Local work remains available.');return payload;}
    function addAttachmentMetadata(order,input={}){const command=contracts.createCommand({requestId:input.requestId,action:'attachment.add',orderId:order?.orderId,expectedRevision:input.expectedRevision,payload:{attachment:input.attachment}},session,order);if(!command.ok)throw adapterError(command.code,command.errors.join(' '));return request(contracts.ENDPOINTS.attachments(order.orderId),{method:'POST',requestId:command.command.requestId,body:JSON.stringify(command.command)});}
    return Object.freeze({status,setSession,request,listOrders,updateOrder,health,addAttachmentMetadata});
  }
  const api={createRemoteApi};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaRemoteApi=api;
})(typeof globalThis!=='undefined'?globalThis:this);
