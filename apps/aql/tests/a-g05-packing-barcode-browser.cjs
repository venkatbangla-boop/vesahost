/** A-G05 browser proof: typed packing/barcode observations and stage carton-range guards remain explicit and durable. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g05-packing-barcode-mobile.png');
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

async function addStagePacking(page, values) {
  await page.locator('[data-action="stage-record"][data-module="packing"]:visible').first().click();
  await fillDialog(page, values);
  await saveDialog(page);
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

const stageRecord = identity => ({
  identity,
  po: 'PO-A-G05-PACK-BARCODE',
  style: 'STYLE-A-G05-PACK',
  colour: 'NAVY',
  size: 'M',
  quantity: identity === '3' ? 10 : 20,
  replacement: '',
  resealed: 'Yes',
  sampled: `Synthetic carton ${identity}; typed identity only`,
  ratio: 'M:20',
  reference: 'FICTIONAL-PACKING-LIST-REV-1',
  status: 'Pass',
  note: 'Synthetic packing-register observation; no randomization or scanner use claimed.'
});

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
    await page.locator('#dialog [name="stage"]').selectOption('prefinal');
    await page.locator('#dialog [name="buyer"]').fill('A-G05 Packing Buyer - Fictional');
    await page.locator('#dialog [name="factory"]').fill('A-G05 Packing Factory - Fictional');
    await page.locator('#dialog [name="inspector"]').fill('A-G05 Packing Inspector - Fictional');
    await page.locator('#dialog [name="orderKey"]').fill('PO-A-G05-PACK-BARCODE');
    await saveDialog(page);
    await page.waitForFunction(() => window.__vesaApp?.p?.stageSuite?.stage === 'prefinal');

    await page.locator('[data-action="stage-criteria"]:visible').first().click();
    await fillDialog(page, {
      reference: 'FICTIONAL-PACKING-LIST-REV-1',
      approvedBy: 'Fictional Packing Criteria Reviewer',
      sampling: 'Explicit fixture range 1–2; test evidence only, not a buyer carton-selection rule.',
      cartonFirst: 1,
      cartonLast: 2
    });
    await saveDialog(page);

    await page.locator('[data-action="stage-support"]:visible').first().click();
    await page.locator('#dialog [data-action="stage-require"][data-module="packing"]').click();
    await page.waitForFunction(() => !document.getElementById('dialog').open);
    await addStagePacking(page, stageRecord('1'));
    await addStagePacking(page, stageRecord('1'));
    await addStagePacking(page, stageRecord('3'));

    const guarded = await page.evaluate(() => {
      const result = ResultEngine.evaluate(window.__vesaApp.p);
      return { pending: result.pending.map(item => item.text), ids: window.__vesaApp.p.stageSuite.records.filter(row => row.module === 'packing').map(row => ({ id: row.id, identity: row.identity })) };
    });
    assert.ok(guarded.pending.includes('Duplicate carton: 1'), 'duplicate packing-register identity was not reported');
    assert.ok(guarded.pending.includes('Missing carton numbers: 2'), 'explicit range gap was not reported');

    const duplicateId = guarded.ids[1].id;
    await page.locator(`[data-action="stage-record"][data-module="packing"][data-id="${duplicateId}"]:visible`).first().click();
    await page.locator('#dialog [name="identity"]').fill('2');
    await saveDialog(page);
    const corrected = await page.evaluate(() => {
      const result = ResultEngine.evaluate(window.__vesaApp.p);
      return { pending: result.pending.map(item => item.text), records: JSON.parse(JSON.stringify(window.__vesaApp.p.stageSuite.records.filter(row => row.module === 'packing'))) };
    });
    assert.ok(!corrected.pending.some(text => text.startsWith('Duplicate carton:')), 'duplicate guard did not clear after visible correction');
    assert.ok(!corrected.pending.some(text => text.startsWith('Missing carton numbers:')), 'range guard did not clear after visible correction');
    assert.deepEqual(corrected.records.map(row => row.identity).sort(), ['1', '2', '3'], 'packing identities changed unexpectedly');

    await page.locator('#app [data-action="navigate"][data-step="4"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 4);
    await page.locator('#app [data-action="add-carton"]:visible').first().click();
    await fillDialog(page, {
      po: 'PO-A-G05-PACK-BARCODE',
      number: 'CTN-BARCODE-01',
      item: 'STYLE-A-G05-PACK',
      scope_quantity: 'required', expectedQty: 20, actualQty: 20,
      scope_barcode: 'required', expectedBarcode: '012345678905', actualBarcode: '012345678905',
      scope_ratio: 'required', expectedRatio: 'M:20', actualRatio: 'M:20',
      scope_mark: 'required', expectedMark: 'FICTIONAL-MARK-01', actualMark: 'FICTIONAL-MARK-01',
      scope_condition: 'required', condition: 'PASS',
      note: 'Typed synthetic values compared locally; no scanner or random-selection claim.'
    });
    await saveDialog(page);
    const cartonPass = await page.evaluate(() => {
      const carton = window.__vesaApp.p.cartons[0];
      return { carton: JSON.parse(JSON.stringify(carton)), result: PackingEngine.evaluate(carton) };
    });
    assert.equal(cartonPass.result.result, 'PASS', 'equal typed barcode and packing observations did not pass their selected comparisons');
    assert.equal(cartonPass.carton.expectedBarcode, '012345678905');
    assert.equal(cartonPass.carton.actualBarcode, '012345678905');
    assert.ok(cartonPass.carton.inspectedAt, 'observed carton did not retain inspection time');

    await page.locator('#app [data-action="add-carton"]:visible').first().click();
    await fillDialog(page, { po: 'PO-A-G05-PACK-BARCODE', number: 'CTN-BARCODE-01', item: 'STYLE-A-G05-PACK' });
    await page.locator('#dialog [data-action="dialog-save"]').click();
    await page.locator('#dialogError').filter({ hasText: 'Duplicate PO/style/local-carton identity.' }).waitFor({ state: 'visible' });
    const afterRejectedDuplicate = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p.cartons)));
    assert.deepEqual(afterRejectedDuplicate, [cartonPass.carton], 'rejected duplicate carton changed accepted carton state');
    await page.locator('#dialog [data-action="dialog-close"]').click();

    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const saved = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));
    await page.locator('#app [data-action="edit-carton"]:visible').first().click();
    await page.locator('#dialog [name="actualBarcode"]').waitFor({ state: 'visible' });
    await page.locator('#dialog [name="actualBarcode"]').scrollIntoViewIfNeeded();
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, 'packing/barcode dialog overflows the 390px viewport');
    await page.locator('#dialog [data-action="dialog-close"]').click();

    await page.reload({ waitUntil: 'domcontentloaded' });
    const enterAgain = page.locator('#vesa-enter'); if (await enterAgain.count()) await enterAgain.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
    if (await page.locator('#app [data-action="home"]:visible').count()) {
      await page.locator('#app [data-action="home"]:visible').first().click();
      await page.waitForFunction(() => window.__vesaApp?.step === 'home');
    }
    await openProject(page, saved.id);
    const reopened = await page.evaluate(() => ({ project: JSON.parse(JSON.stringify(window.__vesaApp.p)), cartonResult: PackingEngine.evaluate(window.__vesaApp.p.cartons[0]) }));
    assert.deepEqual(reopened.project, saved.project, 'packing/barcode project changed across local save/reload/reopen');
    assert.equal(reopened.cartonResult.result, 'PASS', 'reopened carton comparison changed');
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G05 PACKING/BARCODE PASS: visible duplicate/range guards, typed barcode comparison, rejected duplicate preservation, exact reopen; ${path.relative(root, output)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
