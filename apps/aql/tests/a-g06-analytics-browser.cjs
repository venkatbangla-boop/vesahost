/** A-G06 browser proof: authenticated portfolio analytics over a large fictional local history. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-13T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
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

async function seedHistory(page) {
  return page.evaluate(async () => {
    const app = window.__vesaApp;
    const clone = value => JSON.parse(JSON.stringify(value));
    const finalTemplate = (basis, buyer, factory, checked, count) => {
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      const line = { ...ProjectSchema.order(), id: 'LINE-FIXTURE', po: 'PO-A-G06-ANALYTICS', item: 'STYLE-A-G06', color: 'NAVY', size: 'M', orderQty: 100, qty: 100, available: 100, allocated: checked, checked };
      Object.assign(p.info, { buyer, factory, inspector: 'Fictional Analytics Inspector', date: '2026-10-13' });
      Object.assign(p.rules, { basis, reference: 'FICTIONAL-ANALYTICS-BASIS-REV-1', confirmed: true });
      p.orders = [line];
      p.defects = count ? [{ id: 'DEFECT-FIXTURE', lineId: line.id, name: 'Fictional seam observation', severity: 'Minor', qty: count, sampleId: basis === 'units' ? 'PIECE-FIXTURE-0001' : '', location: '', note: 'Synthetic analytics fixture only', internal: false, created: '2026-10-13T00:00:00.000Z' }] : [];
      p.stageSuite = StageCatalog.fresh('final');
      return p;
    };
    const inlineTemplate = () => {
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.info, { buyer: 'Fictional Buyer C', factory: 'Fictional Factory C', inspector: 'Fictional Analytics Inspector', date: '2026-10-13' });
      p.stageSuite = StageCatalog.fresh('inline');
      p.stageSuite.records = [{ id: 'STAGE-FIXTURE', module: 'inline', identity: 'INLINE-FIXTURE', inspected: 50, occurrences: 5, status: 'Pass' }];
      return p;
    };
    const templates = {
      occurrences: finalTemplate('occurrences', 'Fictional Buyer A', 'Fictional Factory A', 20, 2),
      units: finalTemplate('units', 'Fictional Buyer B', 'Fictional Factory B', 10, 1),
      inline: inlineTemplate(),
      missing: finalTemplate('occurrences', 'Fictional Buyer D', 'Fictional Factory D', 0, 1),
    };
    const rows = [];
    const add = (template, amount, prefix) => {
      for (let index = 0; index < amount; index++) {
        const project = clone(template);
        project.meta.id = `${prefix}-${String(index + 1).padStart(4, '0')}`;
        project.meta.reportId = `VE-${prefix}-${String(index + 1).padStart(4, '0')}`;
        project.meta.updated = `2026-10-13T00:${String(index % 60).padStart(2, '0')}:00.000Z`;
        rows.push({ id: project.meta.id, project, version: `SAVE-${prefix}-${index + 1}`, history: [] });
      }
    };
    add(templates.occurrences, 300, 'AG06-OCC');
    add(templates.units, 150, 'AG06-UNIT');
    add(templates.inline, 100, 'AG06-INLINE');
    add(templates.missing, 50, 'AG06-ZERO');
    await new Promise((resolve, reject) => {
      const tx = app.repository.db.transaction('projects', 'readwrite');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Synthetic history transaction aborted.'));
      const store = tx.objectStore('projects');
      for (const row of rows) store.put(row);
    });
    const digest = async records => {
      const ordered = records.slice().sort((a, b) => a.id.localeCompare(b.id));
      const bytes = new TextEncoder().encode(JSON.stringify(ordered));
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('');
    };
    const stored = await StorageIO.read(app.repository.db, 'projects', null, true, 12000);
    return { count: stored.length, digest: await digest(stored) };
  });
}

async function storedState(page) {
  return page.evaluate(async () => {
    const rows = await StorageIO.read(window.__vesaApp.repository.db, 'projects', null, true, 12000);
    rows.sort((a, b) => a.id.localeCompare(b.id));
    const bytes = new TextEncoder().encode(JSON.stringify(rows));
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return { count: rows.length, digest: [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('') };
  });
}

async function probe(browser, base, width) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
  const page = await context.newPage();
  const pageErrors = [], external = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
  await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
  const enter = page.locator('#vesa-enter');
  if (await enter.isVisible()) await enter.click();
  await page.waitForFunction(() => !!window.__vesaApp?.repository?.db && document.querySelector('[data-vesa-menu="Tools"]'));

  const before = await seedHistory(page);
  assert.equal(before.count, 600, `${width}: synthetic saved-history count changed`);

  const tools = page.locator('[data-vesa-menu="Tools"]');
  if (!await tools.isVisible()) await page.locator('[data-vesa-mobile-menu]').click();
  await tools.click();
  await page.locator('#dialog [data-aql-menu-action="quality"]').click();
  await page.locator('#dialog [data-action="qc-m50-analytics"]').waitFor({ state: 'visible' });
  const started = Date.now();
  await page.locator('#dialog [data-action="qc-m50-analytics"]').click();
  await page.locator('#dialogTitle').filter({ hasText: 'Quality analytics by stage and counting basis' }).waitFor({ state: 'visible' });
  const renderMs = Date.now() - started;
  assert.ok(renderMs < 8000, `${width}: 600-record analytics took ${renderMs}ms`);

  const table = page.locator('#dialog table');
  const headings = await table.locator('thead th').allTextContents();
  assert.deepEqual(headings.map(value => value.trim()), ['Stage / buyer / factory / basis', 'Inspections', 'Checked units', 'Count', 'Occurrences per 100 checked']);
  const rows = await table.locator('tbody tr').evaluateAll(elements => elements.map(row => [...row.cells].map(cell => cell.textContent.trim())));
  assert.deepEqual(rows, [
    ['inline | Fictional Buyer C | Fictional Factory C | Stage records', '100', '5000', '500', 'Not combined'],
    ['final | Fictional Buyer A | Fictional Factory A | occurrences', '300', '6000', '600', '10.00'],
    ['final | Fictional Buyer B | Fictional Factory B | units', '150', '1500', '150', 'Not combined'],
    ['final | Fictional Buyer D | Fictional Factory D | occurrences', '50', '0', '50', 'Not combined'],
  ], `${width}: visible analytics groups or numerator/denominator output changed`);
  const copy = await page.locator('#dialogBody').innerText();
  assert.ok(copy.includes('Nonconforming-unit severity totals are not presented as a unique defective-unit percentage.'), `${width}: counting-basis limitation is missing`);

  const geometry = await page.evaluate(() => {
    const dialog = document.getElementById('dialog');
    const body = document.getElementById('dialogBody');
    const table = body.querySelector('table');
    const scroller = body.querySelector('.m50-analytics-table');
    const rect = dialog.getBoundingClientRect();
    return {
      dialogLeft: rect.left,
      dialogRight: rect.right,
      viewport: innerWidth,
      pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      contained: scroller.scrollWidth >= table.scrollWidth && scroller.clientWidth <= body.clientWidth,
      deliberatelyScrollable: scroller.scrollWidth > scroller.clientWidth,
      scrollerName: scroller.getAttribute('aria-label'),
      scrollerTabIndex: scroller.tabIndex,
      tableRows: table.tBodies[0].rows.length,
      dialogName: dialog.getAttribute('aria-labelledby'),
    };
  });
  assert.ok(geometry.dialogLeft >= 0 && geometry.dialogRight <= geometry.viewport + 1, `${width}: analytics dialog is outside the viewport`);
  assert.equal(geometry.pageOverflow, false, `${width}: analytics creates page-level horizontal overflow`);
  assert.equal(geometry.contained, true, `${width}: wide analytics table is not contained by its scroll region`);
  if (width === 390) assert.equal(geometry.deliberatelyScrollable, true, '390: analytics table does not provide deliberate horizontal scrolling');
  assert.equal(geometry.scrollerName, 'Saved inspection analytics table', `${width}: analytics scroll region lost its accessible name`);
  assert.equal(geometry.scrollerTabIndex, 0, `${width}: analytics scroll region is not keyboard focusable`);
  assert.equal(geometry.tableRows, 4, `${width}: aggregated dashboard rendered an unbounded row per inspection`);
  assert.equal(geometry.dialogName, 'dialogTitle', `${width}: analytics dialog lost its accessible name`);

  fs.mkdirSync(output, { recursive: true });
  await page.locator('#dialog').screenshot({ path: path.join(output, `aql-a-g06-analytics-${width}.png`) });
  if (width === 390) {
    const scrollLeft = await page.locator('.m50-analytics-table').evaluate(element => {
      element.scrollLeft = element.scrollWidth;
      return element.scrollLeft;
    });
    assert.ok(scrollLeft > 0, '390: analytics scroll region did not move to the numeric columns');
    await page.locator('.m50-analytics-table').screenshot({ path: path.join(output, 'aql-a-g06-analytics-390-metrics.png') });
  }
  const after = await storedState(page);
  assert.deepEqual(after, before, `${width}: read-only analytics changed saved project bytes`);
  assert.deepEqual(pageErrors, [], `${width}: page errors: ${pageErrors.join(' | ')}`);
  assert.deepEqual(external, [], `${width}: unexpected external requests: ${external.join(' | ')}`);
  await context.close();
  return renderMs;
}

async function run() {
  const host = serve(); let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const mobileMs = await probe(browser, base, 390);
    const desktopMs = await probe(browser, base, 1280);
    console.log(`A-G06 ANALYTICS PASS: 600 saved inspections -> 4 basis-safe groups, exact numerator/denominator output, zero-denominator suppression, immutable records; mobile=${mobileMs}ms desktop=${desktopMs}ms`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
