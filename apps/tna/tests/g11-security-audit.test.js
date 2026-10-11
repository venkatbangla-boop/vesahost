const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');

const local=new Map();
globalThis.localStorage={getItem:key=>local.has(key)?local.get(key):null,setItem:(key,value)=>local.set(key,String(value)),removeItem:key=>local.delete(key)};
globalThis.VesaTnaDomain=require('../src/domain.js');
globalThis.VesaTnaCloudContracts=require('../src/cloud-contracts.js');
const domain=globalThis.VesaTnaDomain;
const contracts=globalThis.VesaTnaCloudContracts;
const storage=require('../src/storage.js');
const {createRemoteApi}=require('../src/remote-api.js');

const hostile='<img src=x onerror="globalThis.__tnaXss=1"><script>globalThis.__tnaXss=2</script>';
const plan=domain.createPlan({templateId:'knit',buyerName:hostile,factoryName:'Factory',styleNo:'STYLE-SECURITY',poNumber:'PO-SECURITY',totalQty:500,buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'ALICE'});
storage.savePlan(plan,'ALICE');
assert.equal(storage.listPlans('ALICE').length,1,'G11 local storage should list the current local user record.');
assert.equal(storage.listPlans('BOB').length,0,'G11 local storage keys must partition another local user.');
assert.equal(storage.loadPlan(plan.recordId,'BOB'),null,'G11 another local user key must not load the record by guessed ID.');
assert.equal(storage.recoverAutosave('BOB'),null,'G11 autosave recovery must remain partitioned by local user key.');

const preview=storage.importPreview(`Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory\n${hostile},Factory,=HYPERLINK("bad"),PO,500,10/11/26`);
assert.equal(preview.formulaCells.length,1,'G11 text import preview must flag formula-like cells.');
assert.equal(preview.ambiguousDates.length,1,'G11 text import preview must flag ambiguous dates.');
assert.throws(()=>storage.importPreview('A'.repeat(storage.MAX_BYTES+1)),/large/i,'G11 oversized text imports must fail closed.');
assert.throws(()=>storage.importCopy('{"format":"VESA-TNA"}'),/record/i,'G11 malformed saved copies must fail closed with a user-safe validation error.');
assert.equal(storage.safeCell('=HYPERLINK("bad")').startsWith("'="),true,'G11 spreadsheet exports must neutralize formulas.');

const session={tenantId:'TENANT-1',userId:'USER-1',membershipId:'MEMBER-1',role:'tenant-admin',expiresAt:'2099-01-01T00:00:00.000Z',orderIds:['ORDER-1'],factoryIds:[],buyerIds:[],accessToken:'runtime-only-token'};
const order={tenantId:'TENANT-1',orderId:'ORDER-1',factoryId:'FACTORY-1',buyerId:'BUYER-1',revision:4};
assert.equal(contracts.canAccessOrder(session,{...order,tenantId:'TENANT-2'}).code,contracts.ERROR_CODES.TENANT_SCOPE_REQUIRED,'G11 cross-tenant record access must fail closed in the server policy contract.');
assert.equal(contracts.canAccessOrder({...session,orderIds:[]},order).code,contracts.ERROR_CODES.ORDER_SCOPE_REQUIRED,'G11 guessed record IDs without an authorized scope must fail closed.');
const safeCommand=contracts.createCommand({requestId:'REQ-SEC-1',action:'order.update',expectedRevision:4,payload:{note:'reviewed'}},session,order);
assert.equal(safeCommand.ok,true,'G11 scoped synthetic command should pass the provider-neutral contract.');
assert.equal(contracts.authorizeServerCommand({...session,role:'read-only'},order,safeCommand.command).code,'FORBIDDEN','G11 read-only roles must not update an order.');
for(const payload of [{accessToken:'leak'},{nested:{refreshToken:'leak'}},{authorization:'Bearer leak'},{apiKey:'leak'},{clientSecret:'leak'},{access_token:'leak'},{'api-key':'leak'},{'client.secret':'leak'},{password:'leak'}]){
  assert.equal(contracts.createCommand({requestId:'REQ-SEC-2',action:'order.update',expectedRevision:4,payload},session,order).ok,false,'G11 command payloads must reject credential-shaped fields recursively.');
}
assert.equal(contracts.validateAttachmentMetadata({name:'../buyer.pdf',mimeType:'application/pdf',size:10,visibility:'buyer'}).ok,false,'G11 traversal-like attachment names must fail closed.');
assert.equal(contracts.validateAttachmentMetadata({name:'buyer.html',mimeType:'text/html',size:10,visibility:'buyer'}).ok,false,'G11 active attachment MIME types must fail closed.');
assert.equal(contracts.validateAttachmentMetadata({name:'buyer.pdf',mimeType:'application/pdf',size:contracts.ATTACHMENT_MAX_BYTES+1,visibility:'buyer'}).ok,false,'G11 oversized attachment metadata must fail closed.');

const repo=path.resolve(__dirname,'../../..');
const textExtensions=new Set(['.cjs','.css','.html','.js','.json','.md','.mjs','.toml','.txt','.yaml','.yml']);
const tracked=execFileSync('git',['ls-files','-z'],{cwd:repo,encoding:'utf8'}).split('\0').filter(Boolean);
const secretPatterns=[
  ['private key',new RegExp(['-----BEGIN ','(?:RSA |EC |OPENSSH )?','PRIVATE',' KEY-----'].join(''))],
  ['GitHub token',/github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{30,}/],
  ['AWS access key',/AKIA[0-9A-Z]{16}/],
  ['Google API key',/AIza[0-9A-Za-z_-]{30,}/],
  ['Stripe live key',/sk_live_[0-9A-Za-z]{16,}/],
  ['Slack token',/xox[baprs]-[0-9A-Za-z-]{10,}/]
];
const secretHits=[];
for(const relative of tracked){
  if(!textExtensions.has(path.extname(relative).toLowerCase())||relative.includes('/vendor/'))continue;
  const source=fs.readFileSync(path.join(repo,relative),'utf8');
  for(const [kind,pattern] of secretPatterns)if(pattern.test(source))secretHits.push(`${relative}: ${kind}`);
}
assert.deepEqual(secretHits,[],'G11 tracked text files must not contain high-confidence committed secrets.');

(async()=>{
  let calls=0;
  const disabled=createRemoteApi({}, {fetchImpl:async()=>{calls+=1;}});
  await assert.rejects(()=>disabled.listOrders(),error=>error.code===contracts.ERROR_CODES.EXTERNAL_DEPENDENCY);
  assert.equal(calls,0,'G11 disabled provider mode must perform zero network requests.');

  let request;
  const connected=createRemoteApi({enabled:true,baseUrl:'https://api.example.test'}, {session,fetchImpl:async(url,init)=>{request={url,init};return {ok:true,status:200,json:async()=>({data:[]})};}});
  await connected.request('/api/v1/tna/orders',{method:'GET',headers:{authorization:'Bearer attacker','x-vesa-tna-tenant':'TENANT-2','x-vesa-tna-contract':'OLD','content-type':'text/plain'},credentials:'include',cache:'force-cache',redirect:'follow',referrerPolicy:'origin'});
  assert.equal(request.init.headers.Authorization,'Bearer runtime-only-token','G11 caller headers must not override the runtime authorization token.');
  assert.equal(request.init.headers['X-VESA-TNA-Tenant'],'TENANT-1','G11 caller headers must not override the verified tenant.');
  assert.equal(request.init.headers['X-VESA-TNA-Contract'],contracts.CONTRACT_VERSION,'G11 caller headers must not override the contract version.');
  assert.equal(request.init.headers['Content-Type'],'application/json','G11 caller headers must not override the JSON content type.');
  assert.equal(request.init.credentials,'omit');assert.equal(request.init.cache,'no-store');assert.equal(request.init.redirect,'error');assert.equal(request.init.referrerPolicy,'no-referrer');
  console.log(`TNA G11 local security audit passed: user-key partition, import/export guards, tenant/role/attachment contracts, protected request headers, zero-network disabled mode, ${tracked.length} tracked-file secret inventory`);
})().catch(error=>{console.error(error);process.exitCode=1;});
