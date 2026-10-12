/** A-G04 browser proof: IPC and cutting stages create, save, reload and reopen losslessly. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g04-ipc-cutting-mobile.png');
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
    if (name === 'status') await field.selectOption(value);
    else await field.fill(String(value));
  }
  await saveDialog(page);
  await page.keyboard.press('Control+s');
  await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
  const saved = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)), result: ResultEngine.evaluate(window.__vesaApp.p).stageDecision }));
  assert.equal(saved.result, 'PENDING', `${fixture.stage} must remain pending while its explicit checklist is unresolved`);
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

    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    const geometry = await page.evaluate(() => ({ inner: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(geometry.document <= geometry.inner && geometry.body <= geometry.inner, `mobile overflow: ${JSON.stringify(geometry)}`);

    await page.reload({ waitUntil: 'domcontentloaded' });
    const reenter = page.locator('#vesa-enter'); if (await reenter.count()) await reenter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db && window.__vesaApp.step === 'home');
    await reopen(page, ipc);
    await reopen(page, cutting);
    assert.deepEqual(pageErrors, [], 'IPC/cutting lifecycle must have no uncaught page errors');
    assert.deepEqual(external, [], 'IPC/cutting lifecycle must make no external requests');
    await context.close();
    console.log('AQL A-G04 stage browser passed: IPC + cutting UI create/criteria/record/save/reload/reopen, exact stage values, pending honesty, 390px no overflow, zero external requests/page errors');
  } finally { if (browser) await browser.close(); await host.stop().catch(() => {}); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
