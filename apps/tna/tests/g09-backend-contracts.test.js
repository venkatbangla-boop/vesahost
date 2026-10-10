const fs = require('fs');
const path = require('path');
const contracts = require('../src/cloud-contracts.js');
const { createRemoteApi } = require('../src/remote-api.js');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const root = path.resolve(__dirname, '..', '..', '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const index = read('apps/tna/index.html');
const worker = read('service-worker.js');

assert(index.includes('./src/cloud-contracts.js?v=0.9.0') && index.includes('./src/remote-api.js?v=0.9.0'), 'G09 route must load the versioned cloud modules.');
assert(worker.includes('./apps/tna/src/cloud-contracts.js') && worker.includes('./apps/tna/src/remote-api.js'), 'G09 offline cache must include only the local contract modules.');

const session = {
  tenantId: 'TENANT-1', userId: 'USER-1', membershipId: 'MEM-1', role: 'tenant-admin',
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  orderIds: ['ORDER-1'], factoryIds: ['FACTORY-1'], buyerIds: ['BUYER-1'], accessToken: 'runtime-only-token'
};
const order = { orderId: 'ORDER-1', tenantId: 'TENANT-1', factoryId: 'FACTORY-1', buyerId: 'BUYER-1' };

assert(contracts.ENDPOINTS.order('ORDER/1') === '/api/v1/tna/orders/ORDER%2F1', 'G09 order endpoint must be versioned and encoded.');
const localStatus = contracts.connectionStatus({}, null);
assert(localStatus.mode === contracts.MODES.LOCAL && localStatus.code === contracts.ERROR_CODES.EXTERNAL_DEPENDENCY, 'G09 absent provider must remain local and externally blocked.');
const insecureStatus = contracts.connectionStatus({ enabled: true, baseUrl: 'http://example.test' }, session);
assert(insecureStatus.code === contracts.ERROR_CODES.INVALID_CONFIG, 'G09 public HTTP provider must be rejected.');
assert(contracts.validateSession(session).ok, 'G09 valid tenant session should pass shape validation.');
assert(!contracts.validateSession({ ...session, expiresAt: new Date(Date.now() - 1000).toISOString() }).ok, 'G09 expired session must fail closed.');
assert(!contracts.validateSession({ ...session, factoryIds: undefined }).ok, 'G09 session without explicit scopes must fail closed.');
assert(contracts.canAccessOrder(session, order).ok, 'G09 matching tenant and factory scope should pass advisory access check.');
assert(!contracts.canAccessOrder(session, { ...order, tenantId: 'TENANT-2' }).ok, 'G09 cross-tenant access must fail closed.');
assert(!contracts.canAccessOrder({ ...session, factoryIds: [], buyerIds: [], orderIds: [] }, order).ok, 'G09 missing explicit order/factory/buyer scope must fail closed.');
assert(!contracts.validateCommand({ contractVersion: contracts.CONTRACT_VERSION, requestId: 'REQ-1', tenantId: 'TENANT-1', actorUserId: 'USER-1', action: 'order.update', payload: {} }).ok, 'G09 writes must require expectedRevision.');
const command = contracts.createCommand({ requestId: 'REQ-1', action: 'order.update', expectedRevision: 2, payload: { note: 'verified change' } }, session, order);
assert(command.ok && command.command.tenantId === 'TENANT-1' && command.command.expectedRevision === 2, 'G09 command must carry tenant, actor and optimistic revision.');
command.command.payload.note = 'changed in test';
assert(command.command.payload.note === 'changed in test', 'G09 command payload should be independently copied.');
assert(contracts.authorizeServerCommand(session, order, command.command).ok, 'G09 server policy model should allow an in-scope tenant-admin update.');
assert(contracts.authorizeServerCommand({ ...session, role: 'read-only' }, order, command.command).code === 'FORBIDDEN', 'G09 server policy model must deny read-only writes.');
const approval = contracts.createCommand({ requestId: 'REQ-APPROVAL', action: 'approval.submit', expectedRevision: 2, payload: { approvalDecision: 'approved' } }, session, order);
assert(approval.ok && contracts.authorizeServerCommand(session, order, approval.command).code === 'APPROVAL_EVIDENCE_REQUIRED', 'G09 approvals must require authority and evidence.');
const evidencedApproval = contracts.createCommand({ requestId: 'REQ-APPROVAL-2', action: 'approval.submit', expectedRevision: 2, payload: { approvalDecision: 'approved', authorityVersion: 'AUTH-1', evidenceReference: 'EVID-1' } }, session, order);
assert(evidencedApproval.ok && contracts.authorizeServerCommand(session, order, evidencedApproval.command).ok, 'G09 evidenced approval should pass the contract policy model.');
assert(contracts.validateAttachmentMetadata({ name: 'inspection.pdf', mimeType: 'application/pdf', size: 2048, sha256: 'a'.repeat(64), visibility: 'factory' }).ok, 'G09 valid private attachment metadata should pass.');
assert(!contracts.validateAttachmentMetadata({ name: '../secret.pdf', mimeType: 'application/pdf', size: 2048, visibility: 'factory' }).ok, 'G09 unsafe attachment names must fail closed.');
const intent = contracts.createOfflineIntent(command.command, { intentId: 'INTENT-1', queuedAt: '2026-10-10T09:00:00.000Z' });
assert(intent.ok && intent.intent.status === 'queued' && !Object.prototype.hasOwnProperty.call(intent.intent, 'accessToken'), 'G09 offline intent must be queued without tokens.');
assert(!contracts.validateOfflineIntent({ ...intent.intent, tenantId: 'TENANT-2' }).ok, 'G09 offline intent tenant mismatch must fail closed.');

(async()=>{
  let calls = 0;
  const disabled = createRemoteApi({}, { fetchImpl: async()=>{ calls += 1; } });
  try { await disabled.listOrders(); throw new Error('G09 disabled adapter unexpectedly called remote list.'); } catch (error) { assert(error.code === contracts.ERROR_CODES.EXTERNAL_DEPENDENCY, 'G09 disabled adapter must expose the external dependency blocker.'); }
  assert(calls === 0, 'G09 disabled adapter must make zero network calls.');

  let request;
  const connected = createRemoteApi({ enabled: true, baseUrl: 'https://api.example.test' }, {
    session,
    fetchImpl: async(url, init) => { request = { url, init }; return { ok: true, status: 200, json: async()=>({ data: [] }) }; }
  });
  assert(connected.status().mode === contracts.MODES.CONNECTED, 'G09 configured runtime session should enter connected adapter mode.');
  const response = await connected.listOrders({ factoryId: 'FACTORY-1' });
  assert(response.data.length === 0, 'G09 adapter should return the parsed provider response.');
  assert(request.url === 'https://api.example.test/api/v1/tna/orders?factoryId=FACTORY-1', 'G09 adapter must use the versioned tenant API path.');
  assert(request.init.headers['X-VESA-TNA-Contract'] === contracts.CONTRACT_VERSION, 'G09 adapter must send the contract version.');
  assert(request.init.headers.Authorization === 'Bearer runtime-only-token', 'G09 adapter must use a runtime token without logging or persisting it.');
  console.log('TNA G09 backend contract checks passed');
})().catch(error=>{ console.error(error); process.exitCode=1; });
