/** A-G06 browser proof: explicit POM specification, registered-piece readings, OOT report and durable reopen. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g06-measurement-report-mobile.png');
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

async function fillDialog(page, values) {
  for (const [name, value] of Object.entries(values)) {
    const field = page.locator(`#dialog [name="${name}"]`);
    if (await field.evaluate(element => element.tagName === 'SELECT')) await field.selectOption(String(value));
    else await field.fill(String(value));
  }
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

    await page.locator('#app [data-action="new"]:visible').first().click();
    await page.locator('#dialog [name="stage"]').selectOption('final');
    await page.locator('#dialog [name="buyer"]').fill('A-G06 Measurement Buyer - Fictional');
    await page.locator('#dialog [name="factory"]').fill('A-G06 Measurement Factory - Fictional');
    await page.locator('#dialog [name="inspector"]').fill('A-G06 Measurement Inspector - Fictional');
    await page.locator('#dialog [name="orderKey"]').fill('PO-A-G06-MEASUREMENT');
    await saveDialog(page);

    const prepared = await page.evaluate(() => {
      const app = window.__vesaApp;
      let unitIds = [];
      app.store.change('Synthetic measurement fixture prepared', p => {
        const line = { ...ProjectSchema.order(), po: 'PO-A-G06-MEASUREMENT', item: 'STYLE-A-G06-MEASURE', description: 'Fictional measurement lifecycle fixture only', color: 'NAVY', size: 'M', orderQty: 90, qty: 90, available: 90, allocated: 0, checked: 0, group: '', source: 'Synthetic browser fixture' };
        p.orders = [line];
        p.scope.modules.measurements = { mode: 'required', reason: '' };
        p.scope.referenceRecord = 'FICTIONAL-A-G06-SCOPE-REV-1';
        p.rules.measurementRule = 'any';
        p.rules.measurementRequired = true;
        p.rules.reference = 'FICTIONAL-A-G06-MEASUREMENT-RULE-REV-1';
        unitIds = SampleRegistry.register(p, { lineId: line.id, count: 3, role: 'measurement', prefix: 'AG06M', sourceReason: 'Synthetic measurement-only pieces; no physical inspection claimed' }).map(unit => unit.code);
      }, { fixture: 'A-G06 measurement lifecycle; fictional data only' });
      app.render();
      return { id: app.p.meta.id, lineId: app.p.orders[0].id, unitIds };
    });
    assert.deepEqual(prepared.unitIds, ['AG06M-0001', 'AG06M-0002', 'AG06M-0003']);

    await page.locator('#app [data-action="navigate"][data-step="3"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 3);
    await page.locator('#app [data-action="add-measure"]:visible').first().click();
    await fillDialog(page, {
      pom: 'Chest width',
      lineId: prepared.lineId,
      spec: 50,
      minus: 1,
      plus: 1,
      unit: 'cm',
      required: 3,
      specRef: 'FICTIONAL-SPEC-A-G06-REV-1',
      sampleIds: prepared.unitIds.join(', '),
      inputMode: 'actual',
      actuals: '49, 50, 52',
      method: 'Fictional approved flat-measure datum points; browser test only.'
    });
    await saveDialog(page);

    const measured = await page.evaluate(() => {
      const p = window.__vesaApp.p, row = p.measurements[0], result = MeasurementEngine.evaluate(row, p.rules);
      return { row: JSON.parse(JSON.stringify(row)), result, observations: MeasurementPolicy.observations(p).map(o => ({ piece: o.piece, actual: o.actual, deviation: o.deviation, oot: o.oot })) };
    });
    assert.deepEqual({ result: measured.result.result, oot: measured.result.oot, min: measured.result.min, max: measured.result.max }, { result: 'FAIL', oot: 1, min: 49, max: 51 });
    assert.deepEqual(measured.observations, [
      { piece: 'AG06M-0001', actual: 49, deviation: -1, oot: false },
      { piece: 'AG06M-0002', actual: 50, deviation: 0, oot: false },
      { piece: 'AG06M-0003', actual: 52, deviation: 2, oot: true }
    ]);
    await page.locator(`[data-measure-result="${measured.row.id}"]`).filter({ hasText: '1 OOT' }).waitFor({ state: 'visible' });

    await page.locator('#app [data-action="ship-matrix"]:visible').first().click();
    await fillDialog(page, {
      reference: 'FICTIONAL-SPEC-A-G06-REV-1',
      [`mode_${prepared.lineId}`]: 'required',
      [`count_${prepared.lineId}`]: 3,
      [`poms_${prepared.lineId}`]: 'Chest width',
      [`reason_${prepared.lineId}`]: '',
      reviewer: 'Fictional Measurement Matrix Reviewer'
    });
    await page.locator('#dialog [name="approveMatrix"]').check();
    await saveDialog(page);
    const approved = await page.evaluate(() => ({ plan: JSON.parse(JSON.stringify(window.__vesaApp.p.measurementPlan)), issues: MeasurementMatrix.issues(window.__vesaApp.p), overall: ResultEngine.evaluate(window.__vesaApp.p) }));
    assert.ok(approved.plan.signature, 'visible matrix approval did not record its signature');
    assert.deepEqual(approved.issues, [], 'approved measurement matrix still has validation issues');
    assert.ok(approved.overall.failures.some(item => item.text === 'Chest width: measurement acceptance failed.'), 'OOT did not remain an explicit overall failure');

    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const saved = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));

    await page.locator('#app [data-action="navigate"][data-step="5"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 5);
    await page.locator('#app [data-action="report"]:visible').first().click();
    await page.locator('#dialog [name="preset"]').selectOption('measurements');
    await page.locator('#dialog [data-action="report-preview"]').click();
    const report = page.frameLocator('#reportFrame');
    await report.locator('body').filter({ hasText: 'Dimensions - actuals and deviations' }).waitFor({ state: 'visible' });
    const reportText = await report.locator('body').innerText();
    for (const expected of ['PO-A-G06-MEASUREMENT', 'STYLE-A-G06-MEASURE', 'Chest width', 'AG06M-0001', 'AG06M-0002', 'AG06M-0003', '49', '50', '52', 'cm', 'OOT', 'Within tolerance']) assert.ok(reportText.includes(expected), `measurement report is missing ${expected}`);
    const reportRows = await report.locator('table tr').allTextContents();
    assert.ok(reportRows.some(row => row.includes('AG06M-0003') && row.includes('52') && row.includes('OOT')), 'report does not retain the OOT piece/value/result on one row');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await report.locator('#measurements').evaluate(section => { section.scrollLeft = section.scrollWidth; });
    await report.locator('#measurements').screenshot({ path: output });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, 'measurement report dialog overflows the 390px viewport');
    const reportOverflow = await report.locator('body').evaluate(body => body.scrollWidth > body.clientWidth);
    assert.equal(reportOverflow, false, 'measurement report content overflows its mobile iframe');
    await page.locator('#dialog [data-action="dialog-close"]').click();

    await page.reload({ waitUntil: 'domcontentloaded' });
    const enterAgain = page.locator('#vesa-enter'); if (await enterAgain.count()) await enterAgain.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
    if (await page.locator('#app [data-action="home"]:visible').count()) {
      await page.locator('#app [data-action="home"]:visible').first().click();
      await page.waitForFunction(() => window.__vesaApp?.step === 'home');
    }
    await openProject(page, saved.id);
    const reopened = await page.evaluate(() => {
      const p = window.__vesaApp.p, row = p.measurements[0];
      return { project: JSON.parse(JSON.stringify(p)), result: MeasurementEngine.evaluate(row, p.rules), observations: MeasurementPolicy.observations(p).map(o => ({ piece: o.piece, actual: o.actual, deviation: o.deviation, oot: o.oot })) };
    });
    assert.deepEqual(reopened.project, saved.project, 'measurement project changed across local save/reload/reopen');
    assert.deepEqual({ result: reopened.result.result, oot: reopened.result.oot }, { result: 'FAIL', oot: 1 }, 'reopened measurement result changed');
    assert.deepEqual(reopened.observations, measured.observations, 'reopened piece-level observations changed');
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G06 MEASUREMENT PASS: explicit 50 -1/+1 cm spec, registered 49/50/52 readings, one OOT in report, exact reopen; ${path.relative(root, output)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
