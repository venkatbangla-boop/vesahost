/** P-G09 pure collaboration boundary proof. No live provider or browser storage. */
const assert = require('assert/strict');
const contracts = require('../collaboration-contracts.js');

const session={tenantId:'TENANT-1',userId:'USER-1',membershipId:'MEM-1',role:'tenant-admin',expiresAt:'2099-01-01T00:00:00.000Z',meetingIds:['PPM-1'],factoryIds:['FACTORY-1'],buyerIds:['BUYER-1'],accessToken:'runtime-only-token'};
const meeting={meetingId:'PPM-1',tenantId:'TENANT-1',factoryId:'FACTORY-1',buyerId:'BUYER-1',revision:4};
const input={requestId:'REQ-1',action:'meeting.update',expectedRevision:4,commandAt:'2026-10-11T03:15:00.000Z',payload:{note:'Synthetic reviewed change.'}};

assert.equal(contracts.connectionStatus({},null).code,contracts.ERROR_CODES.EXTERNAL_DEPENDENCY);
assert.equal(contracts.connectionStatus({enabled:true,baseUrl:'http://example.test'},session).code,contracts.ERROR_CODES.INVALID_CONFIG);
assert.equal(contracts.validateSession(session).ok,true);
assert.equal(contracts.validateSession({...session,expiresAt:'2020-01-01T00:00:00.000Z'}).ok,false);
assert.equal(contracts.validateSession({...session,factoryIds:undefined}).ok,false);
assert.equal(contracts.canAccessMeeting(session,meeting).ok,true);
assert.equal(contracts.canAccessMeeting(session,{...meeting,tenantId:'TENANT-2'}).code,contracts.ERROR_CODES.FORBIDDEN);
assert.equal(contracts.canAccessMeeting({...session,meetingIds:[],factoryIds:[],buyerIds:[]},meeting).code,contracts.ERROR_CODES.FORBIDDEN);

const created=contracts.createCommand(input,session,meeting);
assert.equal(created.ok,true);
assert.deepEqual(created.command.payload,input.payload);
created.command.payload.note='Changed only inside command';
assert.equal(input.payload.note,'Synthetic reviewed change.');
assert.equal(contracts.authorizeCommand(session,meeting,created.command).ok,true);
assert.equal(contracts.authorizeCommand({...session,role:'read-only'},meeting,created.command).code,contracts.ERROR_CODES.FORBIDDEN);
assert.equal(contracts.authorizeCommand(session,{...meeting,revision:5},created.command).code,contracts.ERROR_CODES.CONFLICT);
assert.equal(contracts.validateCommand({...created.command,payload:{accessToken:'must-not-persist'}}).ok,false);

const approvalInput={requestId:'REQ-APPROVAL',action:'approval.submit',expectedRevision:4,commandAt:'2026-10-11T03:16:00.000Z',payload:{decision:'approved'}};
const approval=contracts.createCommand(approvalInput,session,meeting).command;
assert.equal(contracts.authorizeCommand(session,meeting,approval).code,contracts.ERROR_CODES.INVALID_COMMAND);
const evidenced=contracts.createCommand({...approvalInput,payload:{decision:'approved',authorityVersion:'AUTH-7',evidenceReference:'BUYER-EMAIL-22'}},session,meeting).command;
assert.equal(contracts.authorizeCommand(session,meeting,evidenced).ok,true);
assert.equal(contracts.authorizeCommand({...session,role:'ppm-editor'},meeting,evidenced).code,contracts.ERROR_CODES.FORBIDDEN);
const finalize=contracts.createCommand({...input,requestId:'REQ-FINAL',action:'meeting.finalize'},session,meeting).command;
assert.equal(contracts.authorizeCommand({...session,role:'ppm-editor'},meeting,finalize).code,contracts.ERROR_CODES.FORBIDDEN);

const intent=contracts.createOfflineIntent(created.command,{intentId:'INTENT-1',queuedAt:'2026-10-11T03:17:00.000Z'});
assert.equal(intent.ok,true);
assert.equal(contracts.validateOfflineIntent(intent.intent).ok,true);
assert.equal(Object.hasOwn(intent.intent,'accessToken'),false);
assert.equal(contracts.validateOfflineIntent({...intent.intent,accessToken:'must-not-persist'}).ok,false);
const accepted=contracts.reconcileOfflineIntent(intent.intent,{status:'accepted',serverRevision:5});
assert.deepEqual(accepted,{ok:true,status:'sent',serverRevision:5,requestId:'REQ-1'});
const conflict=contracts.reconcileOfflineIntent(intent.intent,{status:'conflict',serverRevision:6,reason:'The server meeting changed.',serverMeeting:{meetingId:'PPM-1',revision:6,release:{decision:'HOLD'}}});
assert.equal(conflict.status,'conflict');
assert.equal(conflict.metadata.resolution,'manual-review-required');
assert.equal(conflict.metadata.clientCommand.expectedRevision,4);
assert.equal(conflict.metadata.serverMeeting.revision,6);
assert.equal(intent.intent.status,'queued');
assert.throws(()=>contracts.reconcileOfflineIntent(intent.intent,{status:'conflict',serverRevision:6,reason:'Conflict',serverMeeting:{accessToken:'must-not-persist'}}),/unsafe/);

(async()=>{
  let calls=0;
  const disabled=contracts.createRemoteApi({}, {fetchImpl:async()=>{calls+=1}});
  await assert.rejects(disabled.sendCommand(meeting,created.command),error=>error.code===contracts.ERROR_CODES.EXTERNAL_DEPENDENCY);
  assert.equal(calls,0);

  let request;
  const connected=contracts.createRemoteApi({enabled:true,baseUrl:'https://api.example.test'}, {session,fetchImpl:async(url,init)=>{request={url,init};return {ok:true,status:200,json:async()=>({contractVersion:contracts.CONTRACT_VERSION,requestId:'REQ-1',tenantId:'TENANT-1',revision:5,audit:{eventId:'AUDIT-1',actorUserId:'USER-1',at:'2026-10-11T03:18:00.000Z'},data:{meetingId:'PPM-1'}})}}});
  const response=await connected.sendCommand(meeting,created.command);
  assert.equal(response.revision,5);
  assert.equal(request.url,'https://api.example.test/api/v1/ppm/meetings/PPM-1/commands');
  assert.equal(request.init.headers['Idempotency-Key'],'REQ-1');
  assert.equal(request.init.headers['X-VESA-PPM-Contract'],contracts.CONTRACT_VERSION);
  assert.equal(request.init.headers.Authorization,'Bearer runtime-only-token');
  assert.equal(JSON.parse(request.init.body).payload.note,'Changed only inside command');

  const conflicted=contracts.createRemoteApi({enabled:true,baseUrl:'https://api.example.test'}, {session,fetchImpl:async()=>({ok:false,status:409,json:async()=>({status:'conflict',serverRevision:7,reason:'Meeting revision changed.',serverMeeting:{meetingId:'PPM-1',revision:7}})})});
  const remoteConflict=await conflicted.sendCommand(meeting,created.command);
  assert.equal(remoteConflict.status,'conflict');
  assert.equal(remoteConflict.metadata.serverRevision,7);
  assert.equal(remoteConflict.metadata.clientCommand.requestId,'REQ-1');
  console.log('PPM P-G09 collaboration contract passed: tenant scope, roles, approval evidence, revisions, idempotency, token rejection, manual conflicts and disabled zero-network state');
})().catch(error=>{console.error(error);process.exitCode=1});
