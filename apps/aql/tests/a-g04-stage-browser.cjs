/** A-G04 browser proof: representative production/readiness stages persist losslessly. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g04-material-monitor-mobile.png');
const readinessOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-prefinal-not-ready-mobile.png');
const readyForFinalOutput = path.join(root, 'output', 'playwright', 'aql-a-g05-prefinal-ready-mobile.png');
const fabricOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-fabric-reject-hold-mobile.png');
const controlOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-equipment-needle-metal-mobile.png');
const competencyOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-inspector-competency-mobile.png');
const acknowledgementOutput = path.join(root, 'output', 'playwright', 'aql-a-g05-factory-acknowledgement-mobile.png');
const reinspectionOutput = path.join(root, 'output', 'playwright', 'aql-a-g05-rework-reinspection-mobile.png');
const finalReadinessOutput = path.join(root, 'output', 'playwright', 'aql-a-g05-final-readiness-pending-mobile.png');
const loadingEvidenceOutput = path.join(root, 'output', 'playwright', 'aql-a-g05-loading-evidence-mobile.png');
const traceabilityOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-compliance-custody-mobile.png');
const journeyOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-linked-stage-journey-mobile.png');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-12T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' })[path.extname(file)] || 'application/octet-stream';

function serve() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://vesa.test').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      response.writeHead(200, { 'Content-Type': mime(file), 'Cache-Control': 'no-store' });
      response.end(fs.readFileSync(file));
    } catch { response.writeHead(404).end(); }
  });
  return { server, start: () => new Promise(resolve => server.listen(0, '127.0.0.1', resolve)), stop: () => new Promise(resolve => server.close(resolve)) };
}

async function saveDialog(page) {
  await page.locator('#dialog [data-action="dialog-save"]').click();
  await page.waitForFunction(() => !document.getElementById('dialog').open);
}

async function createStage(page, fixture) {
  await page.locator('#app [data-action="new"]:visible').first().click();
  await page.locator('#dialog [name="stage"]').selectOption(fixture.stage);
  await page.locator('#dialog [name="buyer"]').fill(fixture.buyer);
  await page.locator('#dialog [name="factory"]').fill(fixture.factory);
  await page.locator('#dialog [name="inspector"]').fill(fixture.inspector);
  await page.locator('#dialog [name="orderKey"]').fill(fixture.orderKey);
  await saveDialog(page);
  await page.waitForFunction(stage => window.__vesaApp?.p?.stageSuite?.stage === stage, fixture.stage);

  await page.locator('[data-action="stage-criteria"]:visible').first().click();
  await page.locator('#dialog [name="reference"]').fill(fixture.reference);
  await page.locator('#dialog [name="approvedBy"]').fill(fixture.reviewer);
  await page.locator('#dialog [name="sampling"]').fill(fixture.coverage);
  await saveDialog(page);

  await page.locator(`[data-action="stage-record"][data-module="${fixture.module}"]:visible`).first().click();
  for (const [name, value] of Object.entries(fixture.record)) {
    const field = page.locator(`#dialog [name="${name}"]`);
    if (await field.evaluate(element => element.tagName === 'SELECT')) await field.selectOption(value);
    else await field.fill(String(value));
  }
  await saveDialog(page);
  await page.keyboard.press('Control+s');
  await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
  const saved = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) }; });
  assert.equal(saved.stageDecision, fixture.expectedResult || 'PENDING', `${fixture.stage} returned an unexpected stage decision`);
  if (fixture.expectedEngineResult) assert.equal(saved.result, fixture.expectedEngineResult, `${fixture.stage} result diverged from its stage decision`);
  if (fixture.expectedFailure) assert.ok(saved.failures.includes(fixture.expectedFailure), `${fixture.stage} did not retain its expected failure reason`);
  if (fixture.expectedPending) assert.ok(saved.pending.includes(fixture.expectedPending), `${fixture.stage} did not retain its expected pending reason`);
  await page.getByText(saved.stageDecision, { exact: true }).first().waitFor({ state: 'visible' });
  if (fixture.captureDecision) {
    fs.mkdirSync(path.dirname(readinessOutput), { recursive: true });
    await page.screenshot({ path: readinessOutput, fullPage: true });
  }
  assert.equal(saved.project.stageSuite.records.length, 1, `${fixture.stage} must save one stage record`);
  await page.locator('#app [data-action="home"]:visible').first().click();
  await page.waitForFunction(() => window.__vesaApp?.step === 'home');
  return saved;
}

async function reopen(page, saved) {
  await openProject(page, saved.id);
  const reopened = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p)));
  assert.deepEqual(reopened.stageSuite, saved.project.stageSuite, `${saved.project.stageSuite.stage} stage data changed after reload/reopen`);
  assert.equal(reopened.info.buyer, saved.project.info.buyer, 'buyer changed after reload/reopen');
  assert.equal(reopened.info.factory, saved.project.info.factory, 'factory changed after reload/reopen');
  await page.locator('#app [data-action="home"]:visible').first().click();
  await page.waitForFunction(() => window.__vesaApp?.step === 'home');
}

async function openProject(page, id) {
  let button = page.locator(`[data-action="resume"][data-id="${id}"]:visible`).first();
  if (!await button.count()) {
    await page.locator('#app [data-action="saved"]:visible').first().click();
    button = page.locator(`#dialog [data-action="resume"][data-id="${id}"]:visible`).first();
  }
  await button.click();
  await page.waitForFunction(projectId => window.__vesaApp?.p?.meta?.id === projectId, id);
}

async function addSupportingRecord(page, module, record) {
  await page.locator('[data-action="stage-support"]:visible').first().click();
  await page.locator(`#dialog [data-action="stage-require"][data-module="${module}"]`).click();
  await page.waitForFunction(() => !document.getElementById('dialog').open);
  await page.locator(`[data-action="stage-record"][data-module="${module}"]:visible`).first().click();
  for (const [name, value] of Object.entries(record)) {
    const field = page.locator(`#dialog [name="${name}"]`);
    if (await field.evaluate(element => element.tagName === 'SELECT')) await field.selectOption(value);
    else await field.fill(String(value));
  }
  await saveDialog(page);
}

async function run() {
  const host = serve(); let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
    const page = await context.newPage(); const pageErrors = [], external = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
    const enter = page.locator('#vesa-enter'); if (await enter.isVisible()) await enter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);

    const ipc = await createStage(page, {
      stage: 'ipc', module: 'ipc', buyer: 'A-G04 IPC Buyer - Fictional', factory: 'A-G04 IPC Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-IPC', reference: 'IPC-CRITERIA-REV-1', reviewer: 'Fictional IPC Reviewer', coverage: 'First 10 fictional pieces; fixture only',
      record: { identity: 'IPC-A-G04-001', style: 'STYLE-A-G04', line: 'LINE-A', quantity: 10, sample: 'PP-SAMPLE-A-G04', pattern: 'PATTERN-REV-1', construction: 'Fictional construction review', attachments: 'Machine setup A', risk: 'Fictional pilot risk', actions: 'Review before bulk', reference: 'IPC-CRITERIA-REV-1', status: 'Pass', note: 'Fictional browser fixture only' },
    });
    const cutting = await createStage(page, {
      stage: 'cutting', module: 'cutting', buyer: 'A-G04 Cutting Buyer - Fictional', factory: 'A-G04 Cutting Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-CUT', reference: 'CUT-CRITERIA-REV-1', reviewer: 'Fictional Cutting Reviewer', coverage: 'One fictional lay; fixture only',
      record: { identity: 'LAY-A-G04-001', relaxStart: '2026-10-12 08:00', relaxEnd: '2026-10-12 10:00', ply: 20, shade: 'SHADE-A', marker: 'MARKER-REV-1', ratio: '1:2:2:1', tension: 'Fictional check', endLoss: 0.5, panel: 'Fictional panel review', notches: 'Reviewed', pairing: 'Reviewed', numbering: 'Reviewed', quantity: 120, checked: 20, temperature: 150, pressure: 3, time: 12, defects: 'No fictional defect claimed', release: 'Pending checklist completion', reference: 'CUT-CRITERIA-REV-1', status: 'Pass', note: 'Fictional browser fixture only' },
    });
    const loading = await createStage(page, {
      stage: 'loading', module: 'loading', expectedResult: 'LOADING NOT CONFORMED', expectedEngineResult: 'NOT CONFORMED', buyer: 'A-G04 Loading Buyer - Fictional', factory: 'A-G04 Loading Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-LOAD', reference: 'LOAD-CRITERIA-REV-1', reviewer: 'Fictional Loading Reviewer', coverage: 'Fictional container count reconciliation; fixture only',
      record: { identity: 'CONT-A-G04-001', truck: 'TRUCK-FICTIONAL-01', seal: 'SEAL-FICTIONAL-01', condition: 'Fictional dry container check', cleanliness: 'Fictional clean observation', damage: 'No fictional damage claimed', expected: 100, loaded: 99, piecesExpected: 1000, piecesLoaded: 990, pallets: 10, sequence: 'Fictional sequence', random: 'CTN-001, CTN-050', start: '2026-10-12 08:00', end: '2026-10-12 09:00', environment: 'Fictional ambient condition', handover: 'Fictional driver handover', reference: 'LOAD-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate quantity mismatch and missing photos; must not conform' },
    });
    const audit = await createStage(page, {
      stage: 'audit', module: 'audit', expectedResult: 'NOT CONFORMED', expectedEngineResult: 'NOT CONFORMED', expectedFailure: 'AUDIT-A-G04-001: critical finding cannot pass without closure evidence', buyer: 'A-G04 Audit Buyer - Fictional', factory: 'A-G04 Audit Factory - Fictional', inspector: 'A-G04 Auditor - Fictional', orderKey: 'SUPPLIER-A-G04', reference: 'AUDIT-CRITERIA-REV-1', reviewer: 'Fictional Audit Reviewer', coverage: 'Fictional supplier QMS review; fixture only',
      record: { identity: 'AUDIT-A-G04-001', area: 'Traceability', criterion: 'AUDIT-CRITERIA-REV-1', observation: 'Deliberate fictional critical finding for guard evidence', severity: 'Critical', owner: 'Fictional Supplier Owner', due: '2026-10-20', capa: 'CAPA-A-G04-001', verification: 'Pending independent verification', reference: 'AUDIT-CRITERIA-REV-1', status: 'Pass', note: 'Critical finding cannot pass merely because the record review says Pass' },
    });
    const inline = await createStage(page, {
      stage: 'inline', module: 'inline', expectedResult: 'NOT CONFORMED', expectedEngineResult: 'NOT CONFORMED', expectedFailure: 'INLINE-A-G04-001: Recorded failure', buyer: 'A-G04 Inline Buyer - Fictional', factory: 'A-G04 Inline Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-INLINE', reference: 'INLINE-CRITERIA-REV-1', reviewer: 'Fictional Inline Reviewer', coverage: 'Fictional hourly line check; fixture only',
      record: { identity: 'INLINE-A-G04-001', date: '2026-10-12', shift: 'A', line: 'LINE-A', operation: 'OP-SEAM-01', operator: 'Fictional Operator', machine: 'MACHINE-FICTIONAL-01', style: 'STYLE-A-G04', color: 'BLUE', size: 'M', wip: 120, inspected: 50, defective: 3, occurrences: 4, defects: 'Fictional seam defect, 4 occurrences', repair: 3, recheck: 3, passRepair: 2, containment: 'Fictional containment recorded', stop: 'Yes', supervisor: 'Fictional Supervisor', capa: 'CAPA-INLINE-A-G04', reference: 'INLINE-CRITERIA-REV-1', status: 'Fail', note: 'Deliberate production failure; fixture only' },
    });
    const endline = await createStage(page, {
      stage: 'endline', module: 'endline', buyer: 'A-G04 Endline Buyer - Fictional', factory: 'A-G04 Endline Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-ENDLINE', reference: 'ENDLINE-CRITERIA-REV-1', reviewer: 'Fictional Endline Reviewer', coverage: 'Fictional endline sample; fixture only',
      record: { identity: 'ENDLINE-A-G04-001', date: '2026-10-12', shift: 'A', line: 'LINE-B', style: 'STYLE-A-G04', color: 'NAVY', size: 'L', inspected: 40, defective: 2, occurrences: 2, firstPass: 38, repair: 2, recheck: 2, passRepair: 2, defects: 'Two fictional first-pass defects', supervisor: 'Fictional Supervisor', capa: 'CAPA-ENDLINE-A-G04', reference: 'ENDLINE-CRITERIA-REV-1', status: 'Pass', note: 'Coherent fictional quantities; checklist deliberately unresolved' },
    });
    const prefinal = await createStage(page, {
      stage: 'prefinal', module: 'readiness', expectedResult: 'NOT READY', expectedEngineResult: 'NOT CONFORMED', expectedFailure: 'PREFINAL-A-G04-001: production below approved readiness threshold', captureDecision: true, buyer: 'A-G04 Prefinal Buyer - Fictional', factory: 'A-G04 Prefinal Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-PREFINAL', reference: 'PREFINAL-CRITERIA-REV-1', reviewer: 'Fictional Prefinal Reviewer', coverage: 'Fictional readiness gate; fixture only',
      record: { identity: 'PREFINAL-A-G04-001', production: 80, packed: 70, minProduction: 90, minPacked: 80, reference: 'PREFINAL-THRESHOLD-REV-1', shipment: 1000, packingRevision: 'PACK-REV-1', openIssues: 'Fictional production and packing below approved thresholds', declaration: 'Fictional factory declaration pending completion', previous: 'PREFINAL-PRIOR-FICTIONAL', status: 'Pass', note: 'Deliberate readiness failure; fixture only' },
    });
    const prefinalReady = await createStage(page, {
      stage: 'prefinal', module: 'readiness', buyer: 'A-G05 Prefinal Buyer - Fictional', factory: 'A-G05 Prefinal Factory - Fictional', inspector: 'A-G05 Prefinal Inspector - Fictional', orderKey: 'PO-A-G05-PREFINAL-READY', reference: 'PREFINAL-READY-CRITERIA-REV-1', reviewer: 'Fictional Prefinal Ready Reviewer', coverage: 'Fictional complete readiness review; fixture only',
      record: { identity: 'PREFINAL-READY-A-G05-001', production: 100, packed: 100, minProduction: 90, minPacked: 80, reference: 'PREFINAL-READY-THRESHOLD-REV-1', shipment: 1000, packingRevision: 'PACK-READY-REV-A-G05', openIssues: 'No fictional open issue claimed; checkpoints still require explicit review', declaration: 'Fictional factory readiness declaration only', previous: '', status: 'Pass', note: 'Passing percentages alone must remain pending until checkpoint review' },
    });
    const finalReadiness = await createStage(page, {
      stage: 'final', module: 'readiness', buyer: 'A-G05 Final Buyer - Fictional', factory: 'A-G05 Final Factory - Fictional', inspector: 'A-G05 Final Inspector - Fictional', orderKey: 'PO-A-G05-FINAL', reference: 'FINAL-CRITERIA-REV-1', reviewer: 'Fictional Final Reviewer', coverage: 'Fictional readiness evidence only; final AQL sampling remains unresolved',
      record: { identity: 'FINAL-READINESS-A-G05-001', production: 100, packed: 100, minProduction: 90, minPacked: 80, reference: 'FINAL-THRESHOLD-REV-1', shipment: 1000, packingRevision: 'PACK-REV-A-G05', openIssues: 'Buyer scope, sampling allocation, checks and sign-off remain unresolved', declaration: 'Fictional readiness declaration only; not shipment approval', previous: '', status: 'Pass', note: 'Ready percentages do not bypass the frozen final AQL engine' },
    });
    const incoming = await createStage(page, {
      stage: 'incoming', module: 'incoming', expectedPending: 'INCOMING-A-G04-001: inspected quantity exceeds received', buyer: 'A-G04 Incoming Buyer - Fictional', factory: 'A-G04 Incoming Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-INCOMING', reference: 'INCOMING-CRITERIA-REV-1', reviewer: 'Fictional Incoming Reviewer', coverage: 'Fictional incoming quantity reconciliation; fixture only',
      record: { identity: 'INCOMING-A-G04-001', path: 'Fabric', supplier: 'Fictional Mill', po: 'PO-A-G04-INCOMING', batch: 'BATCH-FICTIONAL-01', grn: 'GRN-FICTIONAL-01', invoice: 100, received: 100, inspected: 101, unit: 'metres', totalRolls: 10, receivedRolls: 10, sampledRolls: 2, weight: 200, length: 1000, width: 150, gsm: 180, construction: 'Fictional knit construction', shade: 'SHADE-A', lab: 'Pass', warehouse: 'Fictional dry storage', quarantine: 'HOLD-ZONE-A', approver: 'Fictional Release Reviewer', reference: 'INCOMING-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate inspected-over-received mismatch; must remain pending' },
    });
    const monitor = await createStage(page, {
      stage: 'monitor', module: 'monitor', expectedPending: 'MONITOR-A-G04-001: Packed quantity exceeds order', buyer: 'A-G04 Monitor Buyer - Fictional', factory: 'A-G04 Monitor Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-MONITOR', reference: 'MONITOR-CRITERIA-REV-1', reviewer: 'Fictional Monitor Reviewer', coverage: 'Fictional daily production reconciliation; fixture only',
      record: { identity: 'MONITOR-A-G04-001', date: '2026-10-12', style: 'STYLE-A-G04', order: 100, cut: 120, sew: 115, finish: 110, pack: 105, reject: 2, repair: 3, today: 25, planned: '2026-10-20', forecast: '2026-10-22', risk: 'Fictional output exceeds entered order and requires reconciliation', quality: 'Fictional stable trend', reference: 'MONITOR-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate packed-over-order balance mismatch; must remain pending' },
    });
    const fabric = await createStage(page, {
      stage: 'fabric', module: 'roll', buyer: 'A-G04 Fabric Buyer - Fictional', factory: 'A-G04 Fabric Factory - Fictional', inspector: 'A-G04 Inspector - Fictional', orderKey: 'PO-A-G04-FABRIC', reference: 'FABRIC-CRITERIA-REV-1', reviewer: 'Fictional Fabric Reviewer', coverage: 'One fictional roll plus shade and lab records; fixture only',
      record: { identity: 'ROLL-A-G04-001', mill: 'Fictional Mill', batch: 'DYELOT-FICTIONAL-01', ticket: 'TICKET-FICTIONAL-01', invoice: 1000, received: 1000, ticketLength: 1000, length: 1000, widthStart: 150, widthMiddle: 150, widthEnd: 150, basis: '100 m²', limit: 5, method: 'Approved fictional four-point method REV-1', sampling: 'One fictional roll selected', shade: 'SHADE-A', endShade: 'No fictional variation claimed', edgeShade: 'No fictional variation claimed', splices: 0, spliceLocations: 'None', selvedge: 'Fictional acceptable observation', handle: 'Matches fictional reference', odour: 'No fictional odour claimed', construction: 'Fictional knit construction', disposition: 'Accept', defects: '10,Oil,2,3', reference: 'FABRIC-CRITERIA-REV-1', status: 'Pass', note: 'Valid fictional roll record before supporting failures' },
    });
    await openProject(page, fabric.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, fabric.id);
    await addSupportingRecord(page, 'shade', { identity: 'SHADE-A-G04-001', standard: 'FICTIONAL-STANDARD-REV-1', labdip: 'LABDIP-FICTIONAL-01', light: 'D65', lot: 'DYELOT-FICTIONAL-01', shade: 'SHADE-A', component: 'Body', endShade: 'Fictional observation', edgeShade: 'Fictional observation', grade: 'Fictional grade', method: 'Approved fictional Delta E method', delta: 2.5, limit: 1.5, evaluator: 'Fictional Shade Reviewer', disposition: 'Reject', reference: 'SHADE-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate Delta E exceedance; fixture only' });
    await addSupportingRecord(page, 'lab', { identity: 'LAB-A-G04-001', lot: 'DYELOT-FICTIONAL-01', method: 'Fictional test method', revision: 'REV-1', buyer: 'A-G04 Fabric Buyer - Fictional', equipment: 'LAB-EQ-FICTIONAL-01', due: '2026-10-12', validUntil: '2026-10-20', external: 'LAB-REPORT-FICTIONAL-01', criterion: 'Fictional approved criterion', actual: 'Deliberate fictional failing result', testStatus: 'Fail', reviewer: 'Fictional Lab Reviewer', reference: 'LAB-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate laboratory failure; fixture only' });
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const fabricPending = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) }; });
    assert.equal(fabricPending.stageDecision, 'REJECT / HOLD', 'fabric supporting failures must visibly reject/hold the stage');
    assert.equal(fabricPending.result, 'NOT CONFORMED', 'fabric supporting failures must not conform');
    assert.ok(fabricPending.failures.includes('SHADE-A-G04-001: Delta E exceeds approved limit'), 'fabric shade failure reason is missing');
    assert.ok(fabricPending.failures.includes('LAB-A-G04-001: Laboratory test failed'), 'fabric laboratory failure reason is missing');
    assert.ok(fabricPending.pending.includes('Required laboratory evidence not attached: LAB-REPORT-FICTIONAL-01'), 'typed unattached laboratory report must remain pending');
    assert.deepEqual(fabricPending.project.stageSuite.requiredModules, ['shade', 'lab'], 'fabric supporting-register requirements changed');
    const rollBeforeLabEvidence = fabricPending.project.stageSuite.records.find(row => row.module === 'roll');
    const shadeBeforeLabEvidence = fabricPending.project.stageSuite.records.find(row => row.module === 'shade');
    const labBeforeEvidence = fabricPending.project.stageSuite.records.find(row => row.module === 'lab');

    await page.locator(`[data-action="evidence"][data-owner="${labBeforeEvidence.id}"]:visible`).click();
    await page.locator('#dialog [name="caption"]').fill('Synthetic laboratory report evidence; fixture only');
    await page.locator('#dialog [name="role"]').selectOption('test result');
    await page.locator('#dialog input[type="file"][multiple]').setInputFiles({
      name: 'synthetic-laboratory-report.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Synthetic A-G04 laboratory evidence. No buyer or production data.\n', 'utf8'),
    });
    await page.waitForFunction(() => window.__vesaApp?.modalContext?.assets?.length === 1);
    await saveDialog(page);
    const labAsset = await page.evaluate(async owner => {
      const meta = window.__vesaApp.p.assets.find(asset => asset.owner === owner && asset.name === 'synthetic-laboratory-report.txt');
      const record = meta ? await window.__vesaApp.assets.get(meta.id) : null;
      return { meta: meta && JSON.parse(JSON.stringify(meta)), text: record?.blob ? await record.blob.text() : '' };
    }, labBeforeEvidence.id);
    assert.ok(labAsset.meta?.id?.startsWith('ASSET-'), 'visible Evidence flow did not create a laboratory asset ID');
    assert.equal(labAsset.meta.kind, 'document', 'synthetic laboratory report must remain a document asset');
    assert.equal(labAsset.text, 'Synthetic A-G04 laboratory evidence. No buyer or production data.\n', 'attached laboratory evidence bytes changed');
    await page.locator(`[data-action="stage-record"][data-module="lab"][data-id="${labBeforeEvidence.id}"]:visible`).click();
    await page.locator('#dialog [name="external"]').fill(labAsset.meta.id);
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const fabricFinal = await page.evaluate(async assetId => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      const optionalCopy = JSON.parse(JSON.stringify(window.__vesaApp.p));
      optionalCopy.stageSuite.records.find(row => row.module === 'lab').external = '';
      const optional = ResultEngine.evaluate(optionalCopy);
      const record = await window.__vesaApp.assets.get(assetId);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text), optionalPending: optional.pending.map(item => item.text), assetText: await record.blob.text() };
    }, labAsset.meta.id);
    assert.ok(!fabricFinal.pending.some(reason => reason.startsWith('Required laboratory evidence not attached:')), 'exact laboratory asset binding did not clear its pending reason');
    assert.ok(!fabricFinal.optionalPending.some(reason => reason.startsWith('Required laboratory evidence not attached:')), 'blank optional external reference must remain backward-compatible');
    assert.ok(fabricFinal.failures.includes('SHADE-A-G04-001: Delta E exceeds approved limit'), 'shade failure disappeared after lab evidence attachment');
    assert.ok(fabricFinal.failures.includes('LAB-A-G04-001: Laboratory test failed'), 'laboratory failure disappeared after evidence attachment');
    assert.deepEqual(fabricFinal.project.stageSuite.records.find(row => row.module === 'roll'), rollBeforeLabEvidence, 'lab evidence binding changed the roll observation');
    assert.deepEqual(fabricFinal.project.stageSuite.records.find(row => row.module === 'shade'), shadeBeforeLabEvidence, 'lab evidence binding changed the shade observation');
    const labAfterEvidence = fabricFinal.project.stageSuite.records.find(row => row.module === 'lab');
    assert.deepEqual({ ...labAfterEvidence, external: labBeforeEvidence.external, updated: labBeforeEvidence.updated }, labBeforeEvidence, 'lab evidence binding changed fields other than the external report ID and audit timestamp');
    assert.equal(labAfterEvidence.external, labAsset.meta.id, 'laboratory external field did not retain the generated asset ID');
    assert.equal(fabricFinal.assetText, labAsset.text, 'saved laboratory evidence bytes changed');
    await page.getByText('REJECT / HOLD', { exact: true }).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: fabricOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    await openProject(page, ipc.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, ipc.id);
    await addSupportingRecord(page, 'competency', { identity: 'A-G04 Inspector - Fictional', skills: 'Fictional IPC workmanship review', categories: 'Fictional knit top', stages: 'ipc', training: '2026-10-01', evaluator: 'Fictional Competency Reviewer', expiry: '2026-10-11', authorization: 'Local assignment record only; not accreditation', reference: 'COMPETENCY-REV-1', status: 'Pass', note: 'Deliberately expired before correction' });
    const expiredCompetency = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { failures: evaluated.failures.map(item => item.text), warnings: evaluated.warnings.map(item => item.text) }; });
    assert.ok(expiredCompetency.failures.includes('A-G04 Inspector - Fictional: Expired expiry on inspection date'), 'expired competency review did not fail closed');
    assert.ok(!expiredCompetency.warnings.some(reason => reason.startsWith('Confirm assigned inspector competency')), 'matching inspector and stage produced an assignment warning');
    const competencyId = await page.evaluate(() => window.__vesaApp.p.stageSuite.records.find(row => row.module === 'competency').id);
    await page.locator(`[data-action="stage-record"][data-module="competency"][data-id="${competencyId}"]:visible`).click();
    await page.locator('#dialog [name="expiry"]').fill('2026-10-20');
    await page.locator('#dialog [name="note"]').fill('Fictional local assignment reviewed; not an accreditation claim');
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const ipcFinal = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      const wrongAssignment = JSON.parse(JSON.stringify(window.__vesaApp.p));
      wrongAssignment.stageSuite.records.find(row => row.module === 'competency').stages = 'cutting';
      const mismatched = ResultEngine.evaluate(wrongAssignment);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), failures: evaluated.failures.map(item => item.text), warnings: evaluated.warnings.map(item => item.text), mismatchWarnings: mismatched.warnings.map(item => item.text) };
    });
    assert.ok(!ipcFinal.failures.some(reason => reason.includes('Expired expiry on inspection date')), 'corrected competency expiry did not clear its failure');
    assert.ok(!ipcFinal.warnings.some(reason => reason.startsWith('Confirm assigned inspector competency')), 'valid assigned competency produced a warning');
    assert.ok(ipcFinal.mismatchWarnings.some(reason => reason.startsWith('Confirm assigned inspector competency')), 'wrong-stage competency did not produce an assignment warning');
    const competencyRecord = ipcFinal.project.stageSuite.records.find(row => row.module === 'competency');
    assert.equal(competencyRecord.identity, ipcFinal.project.info.inspector, 'competency identity does not match the assigned inspector');
    assert.equal(competencyRecord.expiry, '2026-10-20', 'corrected competency expiry was not retained');
    assert.equal(competencyRecord.authorization, 'Local assignment record only; not accreditation', 'competency limitation changed');
    await page.screenshot({ path: competencyOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    await openProject(page, audit.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, audit.id);
    await addSupportingRecord(page, 'acknowledgement', { identity: 'Fictional Factory Representative', designation: 'Fictional Quality Manager', received: 'No', agreement: 'Disagree', comments: 'Fictional findings not received; fixture only', statement: 'No VESA approval or shipment release is represented', signature: 'Fictional typed acknowledgement', timestamp: '2026-10-12 12:00', reference: 'ACKNOWLEDGEMENT-REV-1', status: 'Pass', note: 'A Pass review cannot override denied receipt' });
    const deniedAcknowledgement = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) }; });
    assert.ok(deniedAcknowledgement.pending.includes('Fictional Factory Representative: findings were not received'), 'denied factory receipt did not remain pending');
    assert.ok(deniedAcknowledgement.failures.includes('AUDIT-A-G04-001: critical finding cannot pass without closure evidence'), 'factory acknowledgement changed the original critical audit failure');
    const acknowledgementId = await page.evaluate(() => window.__vesaApp.p.stageSuite.records.find(row => row.module === 'acknowledgement').id);
    await page.locator(`[data-action="stage-record"][data-module="acknowledgement"][data-id="${acknowledgementId}"]:visible`).click();
    await page.locator('#dialog [name="received"]').selectOption('Yes');
    await page.locator('#dialog [name="agreement"]').selectOption('Partial');
    await page.locator('#dialog [name="comments"]').fill('Fictional findings received; response remains partial and is not VESA approval');
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const auditFinal = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) };
    });
    assert.ok(!auditFinal.pending.some(reason => reason.includes('findings were not received')), 'received acknowledgement did not clear only its denied-receipt reason');
    assert.ok(auditFinal.failures.includes('AUDIT-A-G04-001: critical finding cannot pass without closure evidence'), 'critical audit failure disappeared after acknowledgement edit');
    assert.equal(auditFinal.stageDecision, 'NOT CONFORMED', 'acknowledgement must not approve a critical supplier audit failure');
    const acknowledgementRecord = auditFinal.project.stageSuite.records.find(row => row.module === 'acknowledgement');
    assert.equal(acknowledgementRecord.received, 'Yes', 'factory receipt edit was not retained');
    assert.equal(acknowledgementRecord.agreement, 'Partial', 'partial factory response was not retained');
    assert.ok(acknowledgementRecord.statement.includes('No VESA approval'), 'acknowledgement limitation was not retained');
    await page.screenshot({ path: acknowledgementOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    await openProject(page, finalReadiness.id);
    const finalPending = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      return { result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text), finaliseIssues: ResultEngine.finaliseIssues(window.__vesaApp.p), project: JSON.parse(JSON.stringify(window.__vesaApp.p)) };
    });
    assert.equal(finalPending.result, 'PENDING', 'complete readiness percentages must not create a final AQL pass');
    assert.equal(finalPending.stageDecision, 'PENDING', 'final-stage decision must retain unresolved final AQL requirements');
    assert.deepEqual(finalPending.failures, [], 'fictional ready percentages created an unsupported final failure');
    assert.ok(!finalPending.pending.some(reason => reason.includes('below approved readiness threshold')), 'ready percentages failed their explicit readiness threshold');
    assert.ok(finalPending.pending.includes('Add at least one order / item line.'), 'missing final order identity did not remain pending');
    assert.ok(finalPending.pending.includes('Confirm buyer scope and sampling criteria with a reference.'), 'unapproved final sampling criteria did not remain pending');
    assert.ok(finalPending.finaliseIssues.includes('Confirm the closing review.'), 'closing review requirement is missing from finalisation issues');
    assert.ok(finalPending.finaliseIssues.includes('Inspector sign-off name is required.'), 'inspector sign-off requirement is missing from finalisation issues');
    await page.locator('[data-action="navigate"][data-step="5"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 5);
    await page.getByText('PENDING', { exact: true }).first().waitFor({ state: 'visible' });
    await page.getByText('Finalise this inspection', { exact: true }).click();
    await page.waitForTimeout(100);
    const blockedFinal = await page.evaluate(() => ({ locked: window.__vesaApp.p.meta.locked, result: ResultEngine.evaluate(window.__vesaApp.p).result, finaliseIssues: ResultEngine.finaliseIssues(window.__vesaApp.p), project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));
    assert.equal(blockedFinal.locked, false, 'unresolved final inspection was locked');
    assert.equal(blockedFinal.result, 'PENDING', 'blocked finalisation changed the frozen result');
    assert.deepEqual(blockedFinal.project.stageSuite, finalPending.project.stageSuite, 'blocked finalisation changed final-stage readiness evidence');
    assert.deepEqual(blockedFinal.finaliseIssues, finalPending.finaliseIssues, 'blocked finalisation changed unresolved approvals');
    await page.screenshot({ path: finalReadinessOutput, fullPage: true });
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const finalReadinessSaved = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));
    await page.locator('[data-action="navigate"][data-step="0"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 0);
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    await openProject(page, prefinalReady.id);
    const readyBeforeChecks = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      return { result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text), checks: JSON.parse(JSON.stringify(window.__vesaApp.p.stageSuite.checks)) };
    });
    assert.equal(readyBeforeChecks.stageDecision, 'PENDING', 'passing readiness percentages bypassed explicit pre-final checkpoint review');
    assert.deepEqual(readyBeforeChecks.failures, [], 'ready pre-final record created an unsupported failure');
    assert.ok(readyBeforeChecks.pending.includes('Production completion requires review / approved N/A reason'), 'unreviewed pre-final checkpoint did not remain pending');
    assert.ok(readyBeforeChecks.checks.every(check => check.status === 'Pending' && check.note === ''), 'fresh pre-final checkpoints were not pending');
    for (let index = 0; index < readyBeforeChecks.checks.length; index++) {
      await page.locator(`[data-action="stage-check"][data-index="${index}"]:visible`).last().click();
      await page.locator('#dialog [name="status"]').selectOption('Pass');
      await page.locator('#dialog [name="note"]').fill(`Fictional explicit review completed for ${readyBeforeChecks.checks[index].name}; fixture only`);
      await saveDialog(page);
    }
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const prefinalReadyFinal = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) };
    });
    assert.equal(prefinalReadyFinal.stageDecision, 'READY FOR FINAL INSPECTION', 'explicitly reviewed ready pre-final stage did not reach its readiness-only decision');
    assert.equal(prefinalReadyFinal.result, 'CONFORMED', 'completed pre-final requirements retained an unexplained blocker');
    assert.deepEqual(prefinalReadyFinal.failures, [], 'completed pre-final review retained a failure');
    assert.deepEqual(prefinalReadyFinal.pending, [], 'completed pre-final review retained a pending requirement');
    assert.ok(prefinalReadyFinal.project.stageSuite.checks.every(check => check.status === 'Pass' && check.note.includes('Fictional explicit review completed')), 'pre-final checkpoint observations were not retained');
    assert.equal(prefinalReadyFinal.project.meta.locked, false, 'readiness-only decision locked or finalised the inspection');
    assert.equal(prefinalReadyFinal.project.disposition.status, 'Not released', 'readiness-only decision created a shipment release');
    await page.getByText('READY FOR FINAL INSPECTION', { exact: true }).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: readyForFinalOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    await openProject(page, loading.id);
    const loadingId = await page.evaluate(() => window.__vesaApp.p.stageSuite.records.find(row => row.module === 'loading').id);
    const syntheticPhoto = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    for (const evidence of [
      { role: 'before', name: 'synthetic-empty-container.png', caption: 'Synthetic empty-container evidence; fixture only' },
      { role: 'after', name: 'synthetic-final-seal.png', caption: 'Synthetic final-seal evidence; fixture only' },
    ]) {
      await page.locator(`[data-action="evidence"][data-owner="${loadingId}"]:visible`).click();
      await page.locator('#dialog [name="caption"]').fill(evidence.caption);
      await page.locator('#dialog [name="role"]').selectOption(evidence.role);
      await page.locator('#dialog input[type="file"][multiple]').setInputFiles({ name: evidence.name, mimeType: 'image/png', buffer: syntheticPhoto });
      await page.waitForFunction(() => window.__vesaApp?.modalContext?.assets?.length === 1);
      await saveDialog(page);
    }
    await page.locator(`[data-action="stage-record"][data-module="loading"][data-id="${loadingId}"]:visible`).click();
    await page.locator('#dialog [name="loaded"]').fill('100');
    await page.locator('#dialog [name="piecesLoaded"]').fill('1000');
    await page.locator('#dialog [name="note"]').fill('Fictional quantities reconciled; before/after originals linked; random IDs remain recorded, not certified random');
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const loadingFinal = await page.evaluate(async ({ owner, expectedBytes }) => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      const assets = window.__vesaApp.p.assets.filter(asset => asset.owner === owner).sort((a, b) => a.role.localeCompare(b.role));
      const bytes = [];
      for (const asset of assets) bytes.push(Array.from(new Uint8Array(await (await window.__vesaApp.assets.get(asset.id)).blob.arrayBuffer())));
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text), assets: JSON.parse(JSON.stringify(assets)), bytes, expectedBytes };
    }, { owner: loadingId, expectedBytes: [...syntheticPhoto] });
    assert.equal(loadingFinal.stageDecision, 'PENDING', 'unreviewed loading checkpoints must remain pending after evidence and quantity reconciliation');
    assert.deepEqual(loadingFinal.failures, [], 'reconciled loading quantities retained a confirmed mismatch');
    assert.ok(!loadingFinal.pending.some(reason => reason.includes('photo not linked') || reason.includes('photo must belong')), 'owned before/after photo evidence did not clear loading photo requirements');
    assert.deepEqual(loadingFinal.assets.map(asset => asset.role), ['after', 'before'], 'loading evidence roles changed');
    assert.ok(loadingFinal.assets.every(asset => asset.kind === 'photo' && asset.owner === loadingId), 'loading evidence lost photo kind or record ownership');
    for (const bytes of loadingFinal.bytes) assert.deepEqual(bytes, loadingFinal.expectedBytes, 'original loading evidence bytes changed');
    const evaluatedLoadingRecord = await page.evaluate(id => StageReviewPolicy.withEvidence(window.__vesaApp.p, window.__vesaApp.p.stageSuite.records.find(row => row.id === id)), loadingId);
    assert.ok(evaluatedLoadingRecord.before.startsWith('ASSET-') && evaluatedLoadingRecord.after.startsWith('ASSET-'), 'loading record did not resolve owned before/after asset IDs');
    assert.equal(evaluatedLoadingRecord.seal, 'SEAL-FICTIONAL-01', 'final seal changed during evidence binding');
    assert.equal(evaluatedLoadingRecord.handover, 'Fictional driver handover', 'handover changed during evidence binding');
    assert.equal(evaluatedLoadingRecord.random, 'CTN-001, CTN-050', 'recorded carton IDs changed or were represented as generated randomization');
    await page.screenshot({ path: loadingEvidenceOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    await openProject(page, inline.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, inline.id);
    const originalInlineFinding = inline.project.stageSuite.records.find(row => row.module === 'inline');
    await page.locator('[data-action="stage-capa"]:visible').first().click();
    await page.locator('#dialog [data-action="stage-capa-add"]').click();
    const verifiedCapa = {
      identity: 'INLINE-A-G04-001 recorded failure',
      containment: 'Fictional affected pieces isolated for 100% screening',
      cause: 'Fictional seam guide setup variation',
      action: 'Fictional guide reset and one-piece recheck',
      owner: 'Fictional Production Quality Owner',
      due: '2026-10-13',
      verification: 'Independent fictional recheck recorded against the retained source finding',
      effectiveness: 'One identified fictional piece passed repair recheck',
      closure: '',
    };
    for (const [name, value] of Object.entries(verifiedCapa)) await page.locator(`#dialog [name="${name}"]`).fill(value);
    await page.locator('#dialog [name="status"]').selectOption('Verified');
    await page.locator('#dialog [data-action="dialog-save"]').click();
    await page.locator('#dialog [data-action="stage-capa-add"]').waitFor({ state: 'visible' });
    await page.locator('#dialog [data-action="dialog-close"]').click();
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const inlineWithCapa = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, failures: evaluated.failures.map(item => item.text) };
    });
    assert.equal(inlineWithCapa.result, 'NOT CONFORMED', 'verified CAPA must not rewrite the failed source decision');
    assert.ok(inlineWithCapa.failures.includes('INLINE-A-G04-001: Recorded failure'), 'verified CAPA removed the original inline failure');
    assert.deepEqual(inlineWithCapa.project.stageSuite.records.find(row => row.module === 'inline'), originalInlineFinding, 'CAPA changed the immutable source finding');
    assert.equal(inlineWithCapa.project.capa.length, 1, 'verified CAPA was not retained on the failed source event');
    assert.equal(inlineWithCapa.project.capa[0].status, 'Verified', 'CAPA verification status changed');
    assert.equal(inlineWithCapa.project.capa[0].verification, verifiedCapa.verification, 'CAPA verification evidence changed');
    const failedParentStored = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, inline.id);

    await page.locator('[data-action="stage-linked"]:visible').first().click();
    await page.locator('#dialog [name="stage"]').selectOption('rework');
    await page.locator('#dialog [name="inspector"]').fill('A-G05 Rework Inspector - Fictional');
    assert.equal(await page.locator('#dialog [name="orderKey"]').inputValue(), failedParentStored.stageSuite.orderKey, 'rework did not carry the failed order context');
    await saveDialog(page);
    await page.waitForFunction(parentId => window.__vesaApp?.p?.stageSuite?.parent === parentId, inline.id);
    const freshRework = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p)));
    assert.notEqual(freshRework.meta.id, inline.id, 'rework reused the failed event identity');
    assert.deepEqual(freshRework.stageSuite.records, [], 'rework copied the failed parent observation');
    assert.deepEqual(freshRework.capa, [], 'rework copied the parent CAPA instead of keeping it with the source failure');
    await page.locator('[data-action="stage-criteria"]:visible').first().click();
    await page.locator('#dialog [name="reference"]').fill('REWORK-CRITERIA-REV-1');
    await page.locator('#dialog [name="approvedBy"]').fill('Fictional Rework Reviewer');
    await page.locator('#dialog [name="sampling"]').fill('100% screening of one identified fictional piece');
    await page.locator('#dialog [name="expected"]').fill('1');
    await saveDialog(page);
    await page.locator('[data-action="stage-record"][data-module="rework"]:visible').first().click();
    const reworkRecord = { identity: 'REWORK-PIECE-A-G05-001', defect: 'Retained reference to INLINE-A-G04-001 seam failure', repairRequired: 'Yes', repair: 'Yes', rechecker: 'Fictional Independent Rechecker', recheck: 'Pass', disposition: 'Accept', batch: 'BATCH-FICTIONAL-A-G05', quantity: 1, reference: 'REWORK-CRITERIA-REV-1', status: 'Pass', note: 'Fictional corrected piece; source finding remains immutable' };
    for (const [name, value] of Object.entries(reworkRecord)) {
      const field = page.locator(`#dialog [name="${name}"]`);
      if (await field.evaluate(element => element.tagName === 'SELECT')) await field.selectOption(value);
      else await field.fill(String(value));
    }
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const reworkChild = await page.evaluate(() => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), pending: evaluated.pending.map(item => item.text) };
    });
    assert.equal(reworkChild.project.stageSuite.parent, inline.id, 'rework lost its failed parent link');
    assert.equal(reworkChild.project.stageSuite.records[0].identity, reworkRecord.identity, 'rework observation identity changed');
    assert.ok(!reworkChild.pending.includes('100% screening piece count must match approved target quantity'), 'one-piece rework did not satisfy the approved target');
    assert.deepEqual(await page.evaluate(async id => JSON.parse(JSON.stringify((await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id).project)), inline.id), failedParentStored, 'saving rework mutated the failed parent event');

    await page.locator('[data-action="stage-linked"]:visible').first().click();
    await page.locator('#dialog [name="stage"]').selectOption('reinspection');
    await page.locator('#dialog [name="inspector"]').fill('A-G05 Reinspection Inspector - Fictional');
    await saveDialog(page);
    await page.waitForFunction(parentId => window.__vesaApp?.p?.stageSuite?.parent === parentId, reworkChild.id);
    const freshReinspection = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p)));
    assert.notEqual(freshReinspection.meta.id, reworkChild.id, 'reinspection reused the rework event identity');
    assert.equal(freshReinspection.stageSuite.parent, reworkChild.id, 'reinspection lost the rework parent link');
    assert.deepEqual(freshReinspection.stageSuite.records, [], 'reinspection copied the rework observation');
    await page.locator('[data-action="stage-criteria"]:visible').first().click();
    await page.locator('#dialog [name="reference"]').fill('REINSPECTION-CRITERIA-REV-1');
    await page.locator('#dialog [name="approvedBy"]').fill('Fictional Reinspection Reviewer');
    await page.locator('#dialog [name="sampling"]').fill('Fresh fictional reinspection readiness observation; no pass inferred');
    await saveDialog(page);
    await page.locator('[data-action="stage-record"][data-module="readiness"]:visible').first().click();
    const reinspectionRecord = { identity: 'REINSPECTION-A-G05-001', production: 100, packed: 100, minProduction: 90, minPacked: 80, reference: 'REINSPECTION-CRITERIA-REV-1', shipment: 1000, packingRevision: 'PACK-REV-A-G05', openIssues: 'Final AQL sampling and approvals remain independently pending', declaration: 'Fictional readiness declaration only', previous: reworkChild.project.meta.reportId, status: 'Pass', note: 'Fresh child observation; no release or approval claimed' };
    for (const [name, value] of Object.entries(reinspectionRecord)) {
      const field = page.locator(`#dialog [name="${name}"]`);
      if (await field.evaluate(element => element.tagName === 'SELECT')) await field.selectOption(value);
      else await field.fill(String(value));
    }
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const reinspectionChild = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));
    assert.equal(reinspectionChild.project.stageSuite.records.length, 1, 'reinspection observation was not saved independently');
    assert.equal(reinspectionChild.project.stageSuite.records[0].identity, reinspectionRecord.identity, 'reinspection observation identity changed');
    assert.deepEqual(await page.evaluate(async id => JSON.parse(JSON.stringify((await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id).project)), reworkChild.id), reworkChild.project, 'saving reinspection mutated the rework event');
    assert.deepEqual(await page.evaluate(async id => JSON.parse(JSON.stringify((await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id).project)), inline.id), failedParentStored, 'saving reinspection mutated the failed source event');
    await page.locator('[data-action="stage-journey"]:visible').first().click();
    for (const reportId of [failedParentStored.meta.reportId, reworkChild.project.meta.reportId, reinspectionChild.project.meta.reportId]) await page.locator('#dialog').getByText(reportId, { exact: true }).waitFor({ state: 'visible' });
    await page.screenshot({ path: reinspectionOutput, fullPage: true });
    await page.locator('#dialog [data-action="dialog-close"]').click();
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    const parentStoredBefore = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, ipcFinal.id);
    await openProject(page, ipc.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, ipc.id);
    await page.locator('[data-action="stage-linked"]:visible').first().click();
    await page.locator('#dialog [name="stage"]').selectOption('endline');
    await page.locator('#dialog [name="inspector"]').fill('A-G04 Linked Inspector - Fictional');
    assert.equal(await page.locator('#dialog [name="buyer"]').inputValue(), parentStoredBefore.info.buyer, 'linked buyer context was not carried into the dialog');
    assert.equal(await page.locator('#dialog [name="factory"]').inputValue(), parentStoredBefore.info.factory, 'linked factory context was not carried into the dialog');
    assert.equal(await page.locator('#dialog [name="orderKey"]').inputValue(), parentStoredBefore.stageSuite.orderKey, 'linked order context was not carried into the dialog');
    await saveDialog(page);
    await page.waitForFunction(parentId => window.__vesaApp?.p?.stageSuite?.parent === parentId, ipc.id);
    const freshChild = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p)));
    assert.notEqual(freshChild.meta.id, ipc.id, 'linked inspection reused the parent identity');
    assert.equal(freshChild.stageSuite.stage, 'endline', 'linked inspection created the wrong stage');
    assert.equal(freshChild.stageSuite.parent, ipc.id, 'linked inspection lost its parent identity');
    assert.deepEqual(freshChild.stageSuite.records, [], 'linked inspection copied parent observations');
    assert.ok(freshChild.stageSuite.checks.every(check => check.status === 'Pending' && check.note === ''), 'linked inspection did not start with fresh checkpoints');
    await page.locator('[data-action="stage-criteria"]:visible').first().click();
    await page.locator('#dialog [name="reference"]').fill('LINKED-ENDLINE-CRITERIA-REV-1');
    await page.locator('#dialog [name="approvedBy"]').fill('Fictional Linked Reviewer');
    await page.locator('#dialog [name="sampling"]').fill('Fictional linked endline sample; fixture only');
    await saveDialog(page);
    await page.locator('[data-action="stage-record"][data-module="endline"]:visible').first().click();
    const linkedRecord = { identity: 'LINKED-ENDLINE-A-G04-001', date: '2026-10-12', shift: 'B', line: 'LINE-LINKED', style: 'STYLE-LINKED-A-G04', color: 'GREEN', size: 'S', inspected: 20, defective: 1, occurrences: 1, firstPass: 19, repair: 1, recheck: 1, passRepair: 1, defects: 'One fictional linked-stage observation', supervisor: 'Fictional Linked Supervisor', capa: 'CAPA-LINKED-A-G04', reference: 'LINKED-ENDLINE-CRITERIA-REV-1', status: 'Pass', note: 'Child-only observation; parent must remain unchanged' };
    for (const [name, value] of Object.entries(linkedRecord)) {
      const field = page.locator(`#dialog [name="${name}"]`);
      if (await field.evaluate(element => element.tagName === 'SELECT')) await field.selectOption(value);
      else await field.fill(String(value));
    }
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const linkedChild = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));
    assert.equal(linkedChild.project.stageSuite.records.length, 1, 'linked child observation was not saved independently');
    assert.equal(linkedChild.project.stageSuite.records[0].identity, linkedRecord.identity, 'linked child observation identity changed');
    const parentStoredAfter = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, ipc.id);
    assert.deepEqual(parentStoredAfter, parentStoredBefore, 'saving the linked child mutated the durable parent event');
    await page.locator('[data-action="stage-journey"]:visible').first().click();
    await page.locator('#dialog').getByText(parentStoredBefore.meta.reportId, { exact: true }).waitFor({ state: 'visible' });
    await page.locator('#dialog').getByText(linkedChild.project.meta.reportId, { exact: true }).waitFor({ state: 'visible' });
    await page.screenshot({ path: journeyOutput, fullPage: true });
    await page.locator('#dialog [data-action="dialog-close"]').click();
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');
    await openProject(page, incoming.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, incoming.id);
    await addSupportingRecord(page, 'compliance', { identity: 'COMPLIANCE-A-G04-001', revision: 'BUYER-MANUAL-REV-1', market: 'Fictional Market', product: 'Fictional knit top', age: 'Adult', report: 'COMPLIANCE-REPORT-FICTIONAL-01', expiry: '2026-10-20', artwork: 'ARTWORK-FICTIONAL-REV-1', reviewer: 'Fictional Compliance Reviewer', reference: 'COMPLIANCE-CRITERIA-REV-1', status: 'Pass', note: 'Report reference is recorded but evidence is deliberately unattached' });
    await addSupportingRecord(page, 'custody', { identity: 'SAMPLE-A-G04-001', kind: 'Lab', sealed: 'Yes', seal: 'SAMPLE-SEAL-FICTIONAL-01', recipient: 'Fictional Independent Lab', date: '2026-10-12', location: 'Fictional custody cabinet', return: 'Return after fictional review', photo: '', reference: 'CUSTODY-CRITERIA-REV-1', status: 'Pass', note: 'Fictional custody chain; no evidence attachment claimed' });
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const incomingPending = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) }; });
    assert.equal(incomingPending.stageDecision, 'PENDING', 'unattached compliance evidence must keep incoming inspection pending');
    assert.ok(incomingPending.pending.includes('Required compliance evidence not attached: COMPLIANCE-REPORT-FICTIONAL-01'), 'unattached compliance-report reason is missing');
    assert.deepEqual(incomingPending.project.stageSuite.requiredModules, ['compliance', 'custody'], 'traceability required-register order changed');
    const incomingBeforeEvidence = incomingPending.project.stageSuite.records.find(row => row.module === 'incoming');
    const custodyBeforeEvidence = incomingPending.project.stageSuite.records.find(row => row.module === 'custody');
    const complianceId = incomingPending.project.stageSuite.records.find(row => row.module === 'compliance').id;
    assert.equal(custodyBeforeEvidence.seal, 'SAMPLE-SEAL-FICTIONAL-01', 'custody seal was not retained');

    await page.locator(`[data-action="evidence"][data-owner="${complianceId}"]:visible`).click();
    await page.locator('#dialog [name="caption"]').fill('Synthetic compliance report evidence; fixture only');
    await page.locator('#dialog [name="role"]').selectOption('test result');
    await page.locator('#dialog input[type="file"][multiple]').setInputFiles({
      name: 'synthetic-compliance-report.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Synthetic A-G04 compliance evidence. No buyer or production data.\n', 'utf8'),
    });
    await page.waitForFunction(() => window.__vesaApp?.modalContext?.assets?.length === 1);
    await saveDialog(page);
    const attachedAsset = await page.evaluate(async owner => {
      const meta = window.__vesaApp.p.assets.find(asset => asset.owner === owner && asset.name === 'synthetic-compliance-report.txt');
      const record = meta ? await window.__vesaApp.assets.get(meta.id) : null;
      return { meta: meta && JSON.parse(JSON.stringify(meta)), text: record?.blob ? await record.blob.text() : '' };
    }, complianceId);
    assert.ok(attachedAsset.meta?.id?.startsWith('ASSET-'), 'visible Evidence flow did not create a generated asset ID');
    assert.equal(attachedAsset.meta.kind, 'document', 'synthetic compliance report must remain a document asset');
    assert.equal(attachedAsset.meta.role, 'test result', 'selected compliance evidence role was not retained');
    assert.equal(attachedAsset.text, 'Synthetic A-G04 compliance evidence. No buyer or production data.\n', 'attached compliance evidence bytes changed');

    await page.locator(`[data-action="stage-record"][data-module="compliance"][data-id="${complianceId}"]:visible`).click();
    await page.locator('#dialog [name="report"]').fill(attachedAsset.meta.id);
    await saveDialog(page);
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const incomingFinal = await page.evaluate(async assetId => {
      const evaluated = ResultEngine.evaluate(window.__vesaApp.p);
      const asset = window.__vesaApp.p.assets.find(row => row.id === assetId);
      const record = await window.__vesaApp.assets.get(assetId);
      return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text), asset: JSON.parse(JSON.stringify(asset)), assetText: await record.blob.text() };
    }, attachedAsset.meta.id);
    assert.equal(incomingFinal.stageDecision, 'PENDING', 'original incoming quantity mismatch must remain pending after evidence attachment');
    assert.ok(incomingFinal.pending.includes('INCOMING-A-G04-001: inspected quantity exceeds received'), 'original incoming quantity reason disappeared after evidence attachment');
    assert.ok(!incomingFinal.pending.some(reason => reason.startsWith('Required compliance evidence not attached:')), 'exact asset binding did not clear the compliance evidence reason');
    assert.deepEqual(incomingFinal.project.stageSuite.records.find(row => row.module === 'incoming'), incomingBeforeEvidence, 'evidence binding changed the incoming observation');
    assert.deepEqual(incomingFinal.project.stageSuite.records.find(row => row.module === 'custody'), custodyBeforeEvidence, 'evidence binding changed the custody observation');
    assert.equal(incomingFinal.project.stageSuite.records.find(row => row.module === 'compliance').report, attachedAsset.meta.id, 'compliance report field did not retain the generated asset ID');
    assert.equal(incomingFinal.asset.owner, complianceId, 'attached evidence lost its compliance-record owner');
    assert.equal(incomingFinal.assetText, attachedAsset.text, 'saved compliance evidence bytes changed');
    await page.getByText('PENDING', { exact: true }).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: traceabilityOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');
    await openProject(page, cutting.id);
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, cutting.id);
    await addSupportingRecord(page, 'equipment', { identity: 'EQUIPMENT-A-G04-001', name: 'Fictional metal detector', location: 'Fictional finishing area', expiry: '2026-10-11', verification: 'Fictional pre-use check recorded', investigation: 'Deliberately expired one day before inspection', affected: 'CUTTING-A-G04-001', history: 'Fictional calibration history', reference: 'EQUIPMENT-CRITERIA-REV-1', status: 'Pass', note: 'Pass review cannot override expired calibration' });
    await addSupportingRecord(page, 'needle', { identity: 'NEEDLE-A-G04-001', issued: 'Needle type DBX1', broken: 'Broken tip', recovered: 'No', machine: 'MACHINE-FICTIONAL-01', operator: 'Fictional Operator', isolated: 50, detected: 'No', release: '', fragments: '', reference: 'NEEDLE-CRITERIA-REV-1', status: 'Pass', note: 'Deliberately incomplete containment; fixture only' });
    await addSupportingRecord(page, 'metal', { identity: 'METAL-A-G04-001', machine: 'METAL-FICTIONAL-01', challenge: 'Fe 1.0 / Non-Fe 1.2 / SS 1.5', setting: 'SETTING-REV-1', start: 'Fail', middle: 'Pass', end: 'Pass', reject: 'PIECE-FICTIONAL-01', recheck: 'Pending independent recheck', operator: 'Fictional Metal Operator', reference: 'METAL-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate start challenge failure; fixture only' });
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const cuttingFinal = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) }; });
    assert.equal(cuttingFinal.stageDecision, 'NOT CONFORMED', 'material-control failures must not conform');
    assert.ok(cuttingFinal.failures.includes('EQUIPMENT-A-G04-001: Expired expiry on inspection date'), 'expired equipment failure reason is missing');
    assert.ok(cuttingFinal.failures.includes('METAL-A-G04-001: start challenge failed'), 'metal start-challenge failure reason is missing');
    assert.ok(cuttingFinal.pending.includes('NEEDLE-A-G04-001: Needle containment / supervisor release incomplete'), 'needle containment pending reason is missing');
    assert.deepEqual(cuttingFinal.project.stageSuite.requiredModules, ['equipment', 'needle', 'metal'], 'material-control required-register order changed');
    await page.getByText('NOT CONFORMED', { exact: true }).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: controlOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    const geometry = await page.evaluate(() => ({ inner: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(geometry.document <= geometry.inner && geometry.body <= geometry.inner, `mobile overflow: ${JSON.stringify(geometry)}`);

    await page.reload({ waitUntil: 'domcontentloaded' });
    const reenter = page.locator('#vesa-enter'); if (await reenter.isVisible()) await reenter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db && window.__vesaApp.step === 'home');
    await reopen(page, ipcFinal);
    await reopen(page, cuttingFinal);
    await reopen(page, loadingFinal);
    await reopen(page, auditFinal);
    await reopen(page, inlineWithCapa);
    await reopen(page, reworkChild);
    await reopen(page, reinspectionChild);
    await reopen(page, endline);
    await reopen(page, prefinal);
    await reopen(page, prefinalReadyFinal);
    await reopen(page, finalReadinessSaved);
    await reopen(page, incomingFinal);
    await reopen(page, monitor);
    await reopen(page, fabricFinal);
    await reopen(page, linkedChild);
    const parentAfterReload = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, ipc.id);
    assert.deepEqual(parentAfterReload, parentStoredBefore, 'reload/reopen changed the durable parent event');
    const failedParentAfterReload = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, inline.id);
    assert.deepEqual(failedParentAfterReload, failedParentStored, 'reload/reopen changed the failed source finding or CAPA');
    const loadingAssetsAfterReload = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id).project;
      const assets = row.assets.filter(asset => asset.owner === row.stageSuite.records.find(record => record.module === 'loading').id).sort((a, b) => a.role.localeCompare(b.role));
      const bytes = [];
      for (const asset of assets) bytes.push(Array.from(new Uint8Array(await (await window.__vesaApp.assets.get(asset.id)).blob.arrayBuffer())));
      return { assets, bytes };
    }, loadingFinal.id);
    assert.deepEqual(loadingAssetsAfterReload.assets, loadingFinal.assets, 'reload changed loading evidence metadata');
    assert.deepEqual(loadingAssetsAfterReload.bytes, loadingFinal.bytes, 'reload changed original loading evidence bytes');
    assert.deepEqual(pageErrors, [], 'stage lifecycle must have no uncaught page errors');
    assert.deepEqual(external, [], 'stage lifecycle must make no external requests');
    await context.close();
    console.log('AQL A-G04/A-G05 stage browser passed: pre-final percentages stay pending until all checkpoints are explicitly reviewed, then yield readiness only without lock/release; owned loading evidence; final fail-closed readiness; immutable failure/CAPA/rework/reinspection; exact reopen, 390px no overflow, zero external requests/page errors');
  } finally { if (browser) await browser.close(); await host.stop().catch(() => {}); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
