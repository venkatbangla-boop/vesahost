(function(root){
  'use strict';

  const CONTRACT_VERSION='TNA360-INTEGRATION-REFERENCE-1';
  const MAX_REFERENCES=30;
  const SOURCE_POLICIES=Object.freeze({
    ppm:Object.freeze({schema:'VESA-PPM:2',route:'/apps/ppm/',statuses:['GO','CONDITIONAL GO','HOLD','UNSET']}),
    aql:Object.freeze({schema:'VESA360-PROJECT:1',route:'/apps/aql/',statuses:['CONFORMED','NOT CONFORMED','PENDING','UNRESOLVED']})
  });
  const copy=value=>JSON.parse(JSON.stringify(value));
  const clean=(value,max=200)=>{const text=String(value??'').trim();if(text.length>max)throw new Error('Integration reference text exceeds its safe length.');return text};
  const key=value=>{const text=clean(value);if(!/^[A-Za-z0-9._:-]{1,200}$/.test(text))throw new Error('Integration reference has a missing or invalid identifier.');return text};
  const dateTime=value=>{const text=clean(value,50);if(!text||!Number.isFinite(Date.parse(text)))throw new Error('Integration reference has an invalid verification time.');return new Date(text).toISOString()};
  const identityValue=value=>clean(value,300).toLocaleLowerCase('en-US');

  function orderIdentity(plan){
    return {
      buyer:clean(plan?.order?.buyerName,300),
      factory:clean(plan?.order?.factoryName,300),
      po:clean(plan?.order?.poNumbers?.[0],300),
      style:clean(plan?.order?.styles?.[0]?.styleNo,300)
    };
  }

  function normalizeReference(input){
    if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Integration reference must be a structured record.');
    const sourceApp=clean(input.sourceApp,20).toLowerCase();
    const policy=SOURCE_POLICIES[sourceApp];
    if(!policy)throw new Error('Integration reference source must be PPM or AQL.');
    const sourceSchema=clean(input.sourceSchema,100);
    const recordedStatus=clean(input.recordedStatus,50).toUpperCase()||policy.statuses.at(-1);
    if(!policy.statuses.includes(recordedStatus))throw new Error('Integration reference contains an unsupported source status.');
    const identity=input.orderIdentity;
    if(!identity||typeof identity!=='object'||Array.isArray(identity))throw new Error('Integration reference requires buyer, factory, PO and style identity.');
    const normalized={
      id:key(input.id),contractVersion:CONTRACT_VERSION,sourceApp,sourceRecordId:key(input.sourceRecordId),
      sourceSchema,sourceVersion:clean(input.sourceVersion,100),sourceUpdatedAt:input.sourceUpdatedAt?dateTime(input.sourceUpdatedAt):'',
      recordedStatus,verifiedBy:clean(input.verifiedBy,200),verifiedAt:input.verifiedAt?dateTime(input.verifiedAt):'',
      orderIdentity:{buyer:clean(identity.buyer,300),factory:clean(identity.factory,300),po:clean(identity.po,300),style:clean(identity.style,300)},
      route:policy.route
    };
    if(Boolean(normalized.verifiedBy)!==Boolean(normalized.verifiedAt))throw new Error('Integration reference must keep verifier and verification time together.');
    return normalized;
  }

  function assessReference(input,plan){
    if(!input)return {state:'unavailable',verified:false,message:'No PPM or AQL reference is linked.'};
    let reference;
    try{reference=normalizeReference(input)}catch(error){return {state:'invalid',verified:false,message:error.message};}
    const policy=SOURCE_POLICIES[reference.sourceApp];
    if(reference.sourceSchema!==policy.schema)return {state:'stale-schema',verified:false,reference,message:`${reference.sourceApp.toUpperCase()} reference schema is unsupported or stale.`};
    if(!reference.verifiedBy||!reference.verifiedAt)return {state:'unverified',verified:false,reference,message:'Reference exists but has no recorded verifier and verification time.'};
    const target=orderIdentity(plan),mismatches=Object.keys(target).filter(field=>!target[field]||!reference.orderIdentity[field]||identityValue(target[field])!==identityValue(reference.orderIdentity[field]));
    if(mismatches.length)return {state:'identity-conflict',verified:false,reference,mismatches,message:`Reference identity does not match TNA ${mismatches.join(', ')}.`};
    return {state:'verified-reference',verified:true,reference,message:'Reference identity, schema and verifier provenance match this TNA.'};
  }

  function displayStatus(reference){
    const value=normalizeReference(reference);
    if(value.sourceApp==='ppm')return value.recordedStatus==='GO'?'PPM recorded GO':value.recordedStatus==='CONDITIONAL GO'?'PPM recorded CONDITIONAL GO':value.recordedStatus==='HOLD'?'PPM recorded HOLD':'PPM decision not recorded';
    return value.recordedStatus==='CONFORMED'?'AQL recorded CONFORMED':value.recordedStatus==='NOT CONFORMED'?'AQL recorded NOT CONFORMED':value.recordedStatus==='PENDING'?'AQL decision pending':'AQL decision unresolved';
  }

  function attachReference(plan,input,context={}){
    if(!plan||typeof plan!=='object'||Array.isArray(plan))return {ok:false,error:'A valid TNA plan is required.'};
    const assessment=assessReference(input,plan);
    if(!assessment.verified)return {ok:false,error:assessment.message,state:assessment.state,mismatches:assessment.mismatches||[]};
    const current=Array.isArray(plan.integrationReferences)?plan.integrationReferences:[];
    if(current.length>=MAX_REFERENCES)return {ok:false,error:'This TNA already has the maximum 30 integration references.'};
    if(current.some(item=>item.id===assessment.reference.id||item.sourceApp===assessment.reference.sourceApp&&item.sourceRecordId===assessment.reference.sourceRecordId))return {ok:false,error:'This source record is already linked.'};
    const changedAt=context.changedAt?dateTime(context.changedAt):new Date().toISOString();
    const next=copy(plan);
    next.integrationReferences=[...current,assessment.reference];
    next.revision=Number.isInteger(next.revision)?next.revision+1:1;
    next.updatedAt=changedAt;
    next.auditEvents=Array.isArray(next.auditEvents)?next.auditEvents:[];
    next.auditEvents.push({eventId:key(context.eventId||`audit-link-${Date.now().toString(36)}`),eventType:'integration-reference-linked',actorId:clean(context.actorId||'local-browser-user',200),createdAt:changedAt,details:{referenceId:assessment.reference.id,sourceApp:assessment.reference.sourceApp,sourceRecordId:assessment.reference.sourceRecordId,recordedStatus:assessment.reference.recordedStatus}});
    return {ok:true,plan:next,reference:copy(assessment.reference),displayStatus:displayStatus(assessment.reference)};
  }

  const api={CONTRACT_VERSION,MAX_REFERENCES,SOURCE_POLICIES,orderIdentity,normalizeReference,assessReference,displayStatus,attachReference};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaIntegrationReferences=api;
})(typeof globalThis!=='undefined'?globalThis:this);
