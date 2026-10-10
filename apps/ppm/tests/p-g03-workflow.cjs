/**
 * P-G03 fixture/browser proof for the existing PPM applicability and easy-workflow contract.
 * Purpose: prove profile/process relevance, N/A/PENDING closure semantics, additive custom
 * checkpoints, search/filter controls, guidance and next-action navigation without changing
 * the frozen 168-checkpoint domain.
 * Access: node apps/ppm/tests/p-g03-workflow.cjs
 * Failure: stop P-G03; do not alter master identities or infer buyer-specific rules.
 */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-09T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' })[path.extname(file)] || 'application/octet-stream';

function domainFixture() {
  const context = vm.createContext({ console, crypto: require('crypto').webcrypto, structuredClone, Date, window: {}, document: {}, setTimeout, clearTimeout, atob });
  for (const file of ['core.js', 'planning-services.js', 'record-services.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'apps/ppm', file), 'utf8'), context, { filename: file });
  }
  const result = vm.runInContext(`(() => {
    const record = PpmRecordFactory.create();
    const relevance = new RelevanceEngine();
    const coverage = new CoverageEngine(relevance);
    const baseIds = Object.keys(record.statuses);
    const base = coverage.compute(record);
    record.meta.profile = 'tshirt';
    record.meta.construction = 'knit';
    record.meta.productClass = 'top';
    const tshirt = relevance.applicableItems(record).map(x => x.id);
    record.meta.processes = ['print'];
    const print = relevance.applicableItems(record).map(x => x.id);
    record.statuses.O01 = 'N/A';
    const na = coverage.compute(record);
    record.statuses.O01 = 'PENDING';
    const pending = coverage.compute(record);
    record.customCheckpoints = [{id:'CUST-PG03',section:'order',label:'Buyer-specific seam finish',hint:'Use the approved buyer instruction.',critical:true}];
    record.statuses['CUST-PG03'] = 'ACTION';
    const custom = coverage.compute(record);
    return {baseIds,base,tshirt,print,na,pending,custom,master:relevance.sections(record).reduce((n,s)=>n+s.items.length,0)};
  })()`, context);
  return JSON.parse(JSON.stringify(result));
}

function assertDomainFixture() {
  const fixture = domainFixture();
  assert.equal(fixture.baseIds.length, 168, 'fresh PPM must retain all 168 status identities');
  assert.equal(fixture.base.applicable, 113, 'blank profile keeps only universal controls applicable');
  assert.equal(fixture.base.reviewed, 0);
  assert.ok(fixture.tshirt.includes('GT01') && fixture.tshirt.includes('MK1'), 'T-shirt/knit relevance missing');
  assert.ok(!fixture.tshirt.includes('MW1'), 'woven-only checkpoint leaked into knit profile');
  assert.ok(fixture.print.includes('P01') && !fixture.print.includes('P03'), 'print process relevance is not isolated');
  assert.equal(fixture.na.closed, fixture.base.closed + 1, 'N/A must close an applicable checkpoint');
  assert.equal(fixture.na.pending, 0);
  assert.equal(fixture.pending.closed, fixture.base.closed, 'PENDING must not count closed');
  assert.equal(fixture.pending.pending, 1);
  assert.equal(fixture.custom.master, fixture.master, 'custom fixture must remain in the expanded master library');
  assert.equal(fixture.custom.master, 169, 'custom fixture must add one master item');
  assert.equal(fixture.custom.applicable, fixture.pending.applicable + 1, 'custom checkpoint must be applicable and additive');
  assert.equal(fixture.custom.actions, 1, 'ACTION custom checkpoint must create one open action signal');
}

async function run() {
  assertDomainFixture();
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
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/ppm/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && document.body.classList.contains('at-home'));
    await page.locator('#homeScreen [data-command="new"]').click();
    await page.waitForFunction(() => !document.body.classList.contains('at-home') && !!app.record);
    assert.equal(await page.locator('#masterCount').textContent(), '168');
    assert.equal(await page.evaluate(() => Object.keys(app.record.statuses).length), 168);
    assert.equal(await page.locator('#sectionNav .nav-chip').count(), 16, 'all eleven workflow sections plus supporting areas must be navigable');
    assert.ok(await page.locator('[data-knowledge="order"]').count() > 0, 'section guidance control missing');
    assert.equal(await page.locator('#jumpUnreviewed').count(), 1);
    assert.equal(await page.locator('#jumpActions').count(), 1);

    await page.locator('#knowledgeBtn').click();
    assert.equal(await page.locator('#modalBody .knowledge-box').count(), 11, 'knowledge must cover every workflow section');
    assert.match(await page.locator('#modalBody').textContent(), /ORDER, DOCUMENT/);
    assert.match(await page.locator('#modalBody').textContent(), /buyer/i);
    assert.match(await page.locator('#modalBody').textContent(), /market/i);
    assert.deepEqual(await page.locator('.checkpoint[data-id="O01"] .status-btn').allTextContents(), ['OK', 'ACTION', 'PENDING', 'N/A']);
    await page.evaluate(() => app.closeModal());
    await page.evaluate(() => app.command('guide'));
    assert.equal(await page.locator('#modalBody ol li').count(), 5, 'quick guide must expose the complete step sequence');
    await page.evaluate(() => app.closeModal());

    await page.locator('#garmentProfileSelect').selectOption('tshirt');
    await page.waitForFunction(() => app.record.meta.profile === 'tshirt');
    await page.evaluate(() => { app.record.meta.processes = ['print']; app.renderAll(); });
    assert.equal(await page.locator('.checkpoint[data-id="GT01"]').count(), 1);
    assert.equal(await page.locator('.checkpoint[data-id="MK1"]').count(), 1);
    assert.equal(await page.locator('.checkpoint[data-id="P01"]').getAttribute('data-hidden'), 'false');
    assert.equal(await page.locator('.checkpoint[data-id="P03"]').getAttribute('data-hidden'), 'true');

    await page.evaluate(() => app.setStatus('O01', 'N/A'));
    assert.equal(await page.evaluate(() => app.coverage.compute(app.record).closed), 1);
    assert.equal(await page.evaluate(() => app.coverage.compute(app.record).pending), 0);
    await page.evaluate(() => app.setStatus('O01', 'PENDING'));
    assert.equal(await page.evaluate(() => app.coverage.compute(app.record).closed), 0);
    assert.equal(await page.evaluate(() => app.coverage.compute(app.record).pending), 1);

    await page.locator('[data-filter="unreviewed"]').click();
    assert.ok(await page.locator('.checkpoint').evaluateAll(rows => rows.filter(row => getComputedStyle(row).display !== 'none').every(row => !row.querySelector('.status-btn.selected'))));
    await page.locator('[data-filter="critical"]').click();
    assert.ok(await page.locator('.checkpoint').evaluateAll(rows => rows.filter(row => getComputedStyle(row).display !== 'none').every(row => row.dataset.critical === '1')));
    await page.locator('[data-filter="all"]').click();
    await page.locator('#checkpointSearch').fill('neckline');
    assert.ok(await page.locator('.checkpoint').evaluateAll(rows => { const visible = rows.filter(row => getComputedStyle(row).display !== 'none'); return visible.length > 0 && visible.every(row => row.dataset.label.includes('neckline')); }));
    await page.locator('#checkpointSearch').fill('');
    await page.evaluate(() => app.setStatus('GT01', 'ACTION'));
    await page.locator('[data-filter="action"]').click();
    assert.equal(await page.locator('.checkpoint[data-id="GT01"]').evaluate(row => getComputedStyle(row).display !== 'none'), true);
    assert.equal(await page.evaluate(() => app.record.actions.filter(a => a.checkpointId === 'GT01').length), 1);
    await page.locator('[data-filter="all"]').click();

    await page.locator('[data-custom-add="order"]').click();
    await page.locator('#customLabel').fill('Buyer-specific seam finish');
    await page.locator('#customHint').fill('Use the approved buyer instruction.');
    await page.locator('#customCritical').check();
    await page.locator('#saveCustom').click();
    const customId = await page.evaluate(() => app.record.customCheckpoints.at(-1).id);
    assert.match(customId, /^CUST-/);
    assert.equal(await page.evaluate(() => app.coverage.compute(app.record).applicable), await page.evaluate(() => app.record.meta.profile === 'tshirt' ? app.relevance.applicableItems(app.record).length : 0));
    assert.equal(await page.locator(`.checkpoint[data-id="${customId}"]`).getAttribute('data-critical'), '1');
    await page.locator(`.checkpoint[data-id="${customId}"] [data-status="ACTION"]`).click();
    assert.equal(await page.evaluate(id => app.record.actions.filter(a => a.checkpointId === id).length, customId), 1);
    assert.equal(await page.locator('#jumpUnreviewed').count(), 1);
    assert.deepEqual(errors, []);
    console.log('PPM P-G03 workflow proof passed: 168 identities, profile/process relevance, N/A/PENDING semantics, guidance, section navigation, search/filter, next-action controls and additive critical custom checkpoint');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
