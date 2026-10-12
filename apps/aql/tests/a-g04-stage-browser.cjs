/** A-G04 browser proof: representative production/readiness stages persist losslessly. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g04-production-readiness-mobile.png');
const readinessOutput = path.join(root, 'output', 'playwright', 'aql-a-g04-prefinal-not-ready-mobile.png');
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
  const saved = await page.evaluate(() => { const evaluated = ResultEngine.evaluate(window.__vesaApp.p); return { id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: evaluated.result, stageDecision: evaluated.stageDecision, failures: evaluated.failures.map(item => item.text) }; });
  assert.equal(saved.stageDecision, fixture.expectedResult || 'PENDING', `${fixture.stage} returned an unexpected stage decision`);
  if (fixture.expectedEngineResult) assert.equal(saved.result, fixture.expectedEngineResult, `${fixture.stage} result diverged from its stage decision`);
  if (fixture.expectedFailure) assert.ok(saved.failures.includes(fixture.expectedFailure), `${fixture.stage} did not retain its expected failure reason`);
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

    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    const geometry = await page.evaluate(() => ({ inner: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(geometry.document <= geometry.inner && geometry.body <= geometry.inner, `mobile overflow: ${JSON.stringify(geometry)}`);

    await page.reload({ waitUntil: 'domcontentloaded' });
    const reenter = page.locator('#vesa-enter'); if (await reenter.count()) await reenter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db && window.__vesaApp.step === 'home');
    await reopen(page, ipc);
    await reopen(page, cutting);
    await reopen(page, loading);
    await reopen(page, audit);
    await reopen(page, inline);
    await reopen(page, endline);
    await reopen(page, prefinal);
    assert.deepEqual(pageErrors, [], 'stage lifecycle must have no uncaught page errors');
    assert.deepEqual(external, [], 'stage lifecycle must make no external requests');
    await context.close();
    console.log('AQL A-G04 stage browser passed: IPC + cutting + loading + supplier-audit + inline + endline + pre-final UI create/criteria/record/save/reload/reopen, exact values, honest pending/failure/readiness outcomes, 390px no overflow, zero external requests/page errors');
  } finally { if (browser) await browser.close(); await host.stop().catch(() => {}); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
