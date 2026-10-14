/** A-G09 browser proof: explicit local PPM/TNA references persist without sibling access or decision/date mutation. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g09-local-references-mobile.png');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-14T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
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

async function openProject(page, id) {
  let button = page.locator(`[data-action="resume"][data-id="${id}"]:visible`).first();
  if (!await button.count()) {
    await page.locator('#app [data-action="saved"]:visible').first().click();
    button = page.locator(`#dialog [data-action="resume"][data-id="${id}"]:visible`).first();
  }
  await button.click();
  await page.waitForFunction(projectId => window.__vesaApp?.p?.meta?.id === projectId, id);
}

async function openReferences(page) {
  const tools = page.locator('[data-vesa-menu="Tools"]');
  if (!await tools.isVisible()) await page.locator('[data-vesa-mobile-menu]').click();
  await tools.click();
  await page.locator('#dialog [data-aql-menu-action="quality"]:visible').click();
  await page.locator('#dialog [data-action="qc-m50-references"]:visible').click();
  await page.locator('#dialog').filter({ hasText: 'PPM / TNA sibling references' }).waitFor({ state: 'visible' });
}

async function addReference(page, values) {
  await page.locator('#dialog [data-action="qc-m50-reference-add"]:visible').click();
  await page.locator('#m50-ref-app').selectOption(values.sourceApp);
  await page.locator('#m50-ref-record').fill(values.sourceRecordId);
  await page.locator('#m50-ref-version').fill(values.sourceVersion || '');
  await page.locator('#m50-ref-source-date').fill(values.sourceUpdatedAt);
  await page.locator('#m50-ref-verifier').fill(values.verifiedBy);
  await page.locator('#m50-ref-verified-date').fill(values.verifiedAt);
  await page.locator('#m50-ref-status').fill(values.recordedStatus);
  await page.locator('#m50-ref-note').fill(values.note);
  await page.locator('#dialog [data-action="qc-m50-reference-save"]:visible').click();
}

async function readInvariant(page) {
  return page.evaluate(() => {
    const project = window.__vesaApp.p;
    return JSON.parse(JSON.stringify({ info: project.info, rules: project.rules, review: project.review, disposition: project.disposition, stageSuite: project.stageSuite, result: ResultEngine.evaluate(project) }));
  });
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
    await page.locator('#dialog [name="stage"]').selectOption('prefinal');
    await page.locator('#dialog [name="buyer"]').fill('A-G09 Fictional Buyer');
    await page.locator('#dialog [name="factory"]').fill('A-G09 Fictional Factory');
    await page.locator('#dialog [name="inspector"]').fill('A-G09 Fictional Inspector');
    await page.locator('#dialog [name="orderKey"]').fill('PO-A-G09-LOCAL');
    await saveDialog(page);
    await page.waitForFunction(() => window.__vesaApp?.p?.stageSuite?.stage === 'prefinal');
    await openReferences(page);
    const before = await readInvariant(page);

    await addReference(page, { sourceApp: 'ppm', sourceRecordId: 'PPM-FICTIONAL-001', sourceVersion: '', sourceUpdatedAt: '2026-10-10', verifiedBy: 'Fictional Local Reviewer', verifiedAt: '2026-10-14', recordedStatus: 'Sample pending', note: 'Synthetic local contract evidence only.' });
    await page.locator('#dialogError').filter({ hasText: 'Source record ID, version, source date, verifier and verification date are required.' }).waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => window.__vesaApp.p.companion.qualityOS.references.length), 0, 'invalid reference changed the project');
    await page.locator('#m50-ref-version').fill('REV-7');
    await page.locator('#dialog [data-action="qc-m50-reference-save"]:visible').click();
    await page.locator('#dialog').filter({ hasText: 'PPM-FICTIONAL-001' }).waitFor({ state: 'visible' });

    await addReference(page, { sourceApp: 'tna', sourceRecordId: 'TNA-FICTIONAL-009', sourceVersion: 'V3', sourceUpdatedAt: '2026-10-12', verifiedBy: 'Fictional Milestone Reviewer', verifiedAt: '2026-10-14', recordedStatus: 'Final inspection milestone planned', note: 'Typed milestone display only; original TNA dates remain in TNA.' });
    await page.locator('#dialog').filter({ hasText: 'TNA-FICTIONAL-009' }).waitFor({ state: 'visible' });
    const after = { invariant: await readInvariant(page), refs: await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p.companion.qualityOS.references))) };
    assert.deepEqual(after.invariant, before, 'sibling references changed AQL decision, approval, release or date state');
    assert.deepEqual(after.refs.map(row => [row.sourceApp, row.sourceRecordId, row.sourceVersion, row.sourceUpdatedAt, row.recordedStatus]), [
      ['ppm', 'PPM-FICTIONAL-001', 'REV-7', '2026-10-10', 'Sample pending'],
      ['tna', 'TNA-FICTIONAL-009', 'V3', '2026-10-12', 'Final inspection milestone planned']
    ]);
    await page.locator('#dialog').filter({ hasText: 'does not read sibling-app storage' }).waitFor({ state: 'visible' });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'reference workflow overflows the 390px viewport');
    await page.locator('#dialog [data-action="dialog-close"]').click();

    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    const saved = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, project: JSON.parse(JSON.stringify(window.__vesaApp.p)) }));
    await page.reload({ waitUntil: 'domcontentloaded' });
    const enterAgain = page.locator('#vesa-enter'); if (await enterAgain.count()) await enterAgain.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
    if (await page.locator('#app [data-action="home"]:visible').count()) await page.locator('#app [data-action="home"]:visible').first().click();
    await openProject(page, saved.id);
    assert.deepEqual(await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p))), saved.project, 'referenced project changed across local save/reload/reopen');
    await openReferences(page);
    await page.locator('#dialog [data-action="qc-m50-reference-remove"]').filter({ hasText: 'PPM-FICTIONAL-001' }).click();
    const remaining = await page.evaluate(() => JSON.parse(JSON.stringify(window.__vesaApp.p.companion.qualityOS.references)));
    assert.deepEqual(remaining.map(row => row.sourceRecordId), ['TNA-FICTIONAL-009'], 'visible removal did not preserve the unrelated reference');
    assert.deepEqual(await readInvariant(page), before, 'reference removal changed AQL decision, approval, release or date state');
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G09 LINKED UI PASS: bounded PPM/TNA references, rejected invalid input, immutable decision/date state, exact reopen, visible removal; ${path.relative(root, output)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
