/** A-G04 browser proof: representative production/readiness stages persist losslessly. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g04-material-monitor-mobile.png');
const readinessOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-prefinal-not-ready-mobile.png');
const fabricOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-fabric-reject-hold-mobile.png');
const controlOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-equipment-needle-metal-mobile.png');
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
  const button = page.locator(`[data-action="resume"][data-id="${saved.id}"]:visible`).first();
  await button.click();
  await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, saved.id);
  const reopened = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p)));
  assert.deepEqual(reopened.stageSuite, saved.project.stageSuite, `${saved.project.stageSuite.stage} stage data changed after reload/reopen`);
  assert.equal(reopened.info.buyer, saved.project.info.buyer, 'buyer changed after reload/reopen');
  assert.equal(reopened.info.factory, saved.project.info.factory, 'factory changed after reload/reopen');
  await page.locator('#app [data-action="home"]:visible').first().click();
  await page.waitForFunction(() => window.__vesaApp?.step === 'home');
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
    const enter = page.locator('#vesa-enter'); if (await enter.count()) await enter.click();
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
    await page.locator(`[data-action="resume"][data-id="${fabric.id}"]:visible`).first().click();
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, fabric.id);
    await addSupportingRecord(page, 'shade', { identity: 'SHADE-A-G04-001', standard: 'FICTIONAL-STANDARD-REV-1', labdip: 'LABDIP-FICTIONAL-01', light: 'D65', lot: 'DYELOT-FICTIONAL-01', shade: 'SHADE-A', component: 'Body', endShade: 'Fictional observation', edgeShade: 'Fictional observation', grade: 'Fictional grade', method: 'Approved fictional Delta E method', delta: 2.5, limit: 1.5, evaluator: 'Fictional Shade Reviewer', disposition: 'Reject', reference: 'SHADE-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate Delta E exceedance; fixture only' });
    await addSupportingRecord(page, 'lab', { identity: 'LAB-A-G04-001', lot: 'DYELOT-FICTIONAL-01', method: 'Fictional test method', revision: 'REV-1', buyer: 'A-G04 Fabric Buyer - Fictional', equipment: 'LAB-EQ-FICTIONAL-01', due: '2026-10-12', validUntil: '2026-10-20', external: 'LAB-REPORT-FICTIONAL-01', criterion: 'Fictional approved criterion', actual: 'Deliberate fictional failing result', testStatus: 'Fail', reviewer: 'Fictional Lab Reviewer', reference: 'LAB-CRITERIA-REV-1', status: 'Pass', note: 'Deliberate laboratory failure; fixture only' });
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const fabricFinal = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text) }; });
    assert.equal(fabricFinal.stageDecision, 'REJECT / HOLD', 'fabric supporting failures must visibly reject/hold the stage');
    assert.equal(fabricFinal.result, 'NOT CONFORMED', 'fabric supporting failures must not conform');
    assert.ok(fabricFinal.failures.includes('SHADE-A-G04-001: Delta E exceeds approved limit'), 'fabric shade failure reason is missing');
    assert.ok(fabricFinal.failures.includes('LAB-A-G04-001: Laboratory test failed'), 'fabric laboratory failure reason is missing');
    assert.deepEqual(fabricFinal.project.stageSuite.requiredModules, ['shade', 'lab'], 'fabric supporting-register requirements changed');
    await page.getByText('REJECT / HOLD', { exact: true }).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: fabricOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');

    const parentStoredBefore = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, ipc.id);
    await page.locator(`[data-action="resume"][data-id="${ipc.id}"]:visible`).first().click();
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
    await page.locator(`[data-action="resume"][data-id="${incoming.id}"]:visible`).first().click();
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, incoming.id);
    await addSupportingRecord(page, 'compliance', { identity: 'COMPLIANCE-A-G04-001', revision: 'BUYER-MANUAL-REV-1', market: 'Fictional Market', product: 'Fictional knit top', age: 'Adult', report: 'COMPLIANCE-REPORT-FICTIONAL-01', expiry: '2026-10-20', artwork: 'ARTWORK-FICTIONAL-REV-1', reviewer: 'Fictional Compliance Reviewer', reference: 'COMPLIANCE-CRITERIA-REV-1', status: 'Pass', note: 'Report reference is recorded but evidence is deliberately unattached' });
    await addSupportingRecord(page, 'custody', { identity: 'SAMPLE-A-G04-001', kind: 'Lab', sealed: 'Yes', seal: 'SAMPLE-SEAL-FICTIONAL-01', recipient: 'Fictional Independent Lab', date: '2026-10-12', location: 'Fictional custody cabinet', return: 'Return after fictional review', photo: '', reference: 'CUSTODY-CRITERIA-REV-1', status: 'Pass', note: 'Fictional custody chain; no evidence attachment claimed' });
    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const incomingFinal = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text), pending: evaluated.pending.map(item => item.text) }; });
    assert.equal(incomingFinal.stageDecision, 'PENDING', 'unattached compliance evidence must keep incoming inspection pending');
    assert.ok(incomingFinal.pending.includes('Required compliance evidence not attached: COMPLIANCE-REPORT-FICTIONAL-01'), 'unattached compliance-report reason is missing');
    assert.deepEqual(incomingFinal.project.stageSuite.requiredModules, ['compliance', 'custody'], 'traceability required-register order changed');
    assert.equal(incomingFinal.project.stageSuite.records.find(row => row.module === 'custody').seal, 'SAMPLE-SEAL-FICTIONAL-01', 'custody seal was not retained');
    await page.getByText('PENDING', { exact: true }).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: traceabilityOutput, fullPage: true });
    await page.locator('#app [data-action="home"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 'home');
    await page.locator(`[data-action="resume"][data-id="${cutting.id}"]:visible`).first().click();
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
    const reenter = page.locator('#vesa-enter'); if (await reenter.count()) await reenter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db && window.__vesaApp.step === 'home');
    await reopen(page, ipc);
    await reopen(page, cuttingFinal);
    await reopen(page, loading);
    await reopen(page, audit);
    await reopen(page, inline);
    await reopen(page, endline);
    await reopen(page, prefinal);
    await reopen(page, incomingFinal);
    await reopen(page, monitor);
    await reopen(page, fabricFinal);
    await reopen(page, linkedChild);
    const parentAfterReload = await page.evaluate(async id => {
      const row = (await window.__vesaApp.repository.list()).find(item => item.project?.meta?.id === id);
      return JSON.parse(JSON.stringify(row.project));
    }, ipc.id);
    assert.deepEqual(parentAfterReload, parentStoredBefore, 'reload/reopen changed the durable parent event');
    assert.deepEqual(pageErrors, [], 'stage lifecycle must have no uncaught page errors');
    assert.deepEqual(external, [], 'stage lifecycle must make no external requests');
    await context.close();
    console.log('AQL A-G04 stage browser passed: independent linked parent/child plus nine stage lifecycles and supporting registers, exact reopen, honest fail-closed outcomes, 390px no overflow, zero external requests/page errors');
  } finally { if (browser) await browser.close(); await host.stop().catch(() => {}); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
