/** A-G08 browser proof: all stage report routes, clean sandbox preview and standalone print window. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const outputDir = path.join(root, 'output', 'playwright');
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

async function enterApp(page) {
  await page.goto(page.url() || 'about:blank', { waitUntil: 'domcontentloaded' }).catch(() => {});
  const enter = page.locator('#vesa-enter');
  if (await enter.count()) await enter.click();
  await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
}

async function run() {
  const host = serve(); let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(value => {
      try { localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)); } catch {}
      window.print = () => { document.documentElement.dataset.vesaPrintCalled = 'true'; };
    }, session);
    const pageErrors = [], consoleErrors = [], external = [];
    context.on('page', candidate => {
      candidate.on('pageerror', error => pageErrors.push(error.message));
      candidate.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    });
    context.on('request', request => {
      const url = request.url();
      if (!url.startsWith(base) && !/^(about:blank|data:|blob:)/.test(url)) external.push(url);
    });
    const page = await context.newPage();
    await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
    await enterApp(page);

    const catalogue = await page.evaluate(async () => {
      const app = window.__vesaApp;
      const rows = [];
      for (const [stage, definition] of Object.entries(StageCatalog.stages)) {
        const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
        p.meta.reportId = `A-G08-${stage.toUpperCase()}`;
        p.meta.revision = 2;
        p.info.kind = definition[0];
        p.info.buyer = stage === 'fabric' ? 'Buyer <script>alert(1)</script> & Fictional' : `A-G08 ${stage} Buyer - Fictional`;
        p.info.factory = 'A-G08 Factory - Fictional';
        p.info.inspector = 'A-G08 Inspector - Fictional';
        p.info.date = '2026-10-13';
        p.stageSuite = StageCatalog.fresh(stage);
        Object.assign(p.stageSuite, {
          orderKey: `PO-A-G08-${stage.toUpperCase()}`,
          reference: `FICTIONAL-${stage.toUpperCase()}-CRITERIA-REV-1`,
          approvedBy: 'Fictional criteria reviewer',
          sampling: 'Synthetic browser coverage only; no physical inspection claimed.'
        });
        p.stageSuite.checks[0].status = 'Pass';
        p.stageSuite.checks[0].note = 'Synthetic reviewed checkpoint.';
        const module = definition[1];
        const record = { id: `REC-${stage}`, module, identity: `A-G08-${stage}-RECORD`, reference: `FICTIONAL-${stage}-SOURCE`, status: 'Pass', note: 'Synthetic report-routing record.' };
        for (const field of StageCatalog.fields(module)) record[field.key] = '';
        record.identity = `A-G08-${stage}-RECORD`;
        p.stageSuite.records.push(record);
        p.capa.push({ id: `CA-${stage}`, issue: `A-G08 ${stage} fictional finding`, containment: 'Synthetic containment', cause: 'Synthetic cause', action: 'Synthetic action', owner: 'Fictional owner', due: '2026-10-20', status: 'Open', verification: '' });
        const before = JSON.stringify(p);
        const html = await ReportComposer.html(p, app.assets, p.report);
        rows.push({
          stage,
          title: definition[0],
          html,
          unchanged: before === JSON.stringify(p),
          final: StageCatalog.final(stage)
        });
      }
      return rows;
    });

    assert.equal(catalogue.length, 13, 'all 13 stage routes must produce reports');
    for (const row of catalogue) {
      assert.equal(row.unchanged, true, `${row.stage} report generation mutated its source project`);
      for (const expected of [row.title, `A-G08-${row.stage.toUpperCase()}`, 'VESA Enterprise Inc.', 'VESA report verification token']) {
        assert.ok(row.html.includes(expected), `${row.stage} report is missing ${expected}`);
      }
      assert.ok(/DRAFT(?: · NOT ISSUED| - NOT FINALISED)/.test(row.html), `${row.stage} report lost draft/not-issued status`);
      assert.ok(!/<script\b/i.test(row.html), `${row.stage} report contains executable script`);
      if (row.final) {
        assert.ok(row.html.includes('Inspection stage readiness'), `${row.stage} final-family report lacks stage readiness`);
        assert.ok(row.html.includes('Stage scope and readiness evidence'), `${row.stage} final-family report lacks stage records`);
      } else {
        for (const expected of ['Approved stage criteria', 'Stage checklist', 'Decision and unresolved issues', 'Corrective actions']) assert.ok(row.html.includes(expected), `${row.stage} report is missing ${expected}`);
        assert.ok(!row.html.includes('Sampling & acceptance'), `${row.stage} report leaked final-only sampling section`);
      }
    }
    const escaped = catalogue.find(row => row.stage === 'fabric').html;
    assert.ok(escaped.includes('Buyer &lt;script&gt;alert(1)&lt;/script&gt; &amp; Fictional'), 'stage report did not escape hostile buyer text');
    assert.ok(!escaped.includes('<script>alert(1)</script>'), 'stage report emitted hostile buyer markup');

    await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.meta.reportId = 'A-G08-LOADING-PREVIEW';
      p.meta.revision = 3;
      p.info.kind = StageCatalog.stages.loading[0];
      Object.assign(p.info, { buyer: 'A-G08 Preview Buyer - Fictional', factory: 'A-G08 Preview Factory - Fictional', inspector: 'A-G08 Preview Inspector - Fictional', date: '2026-10-13' });
      p.stageSuite = StageCatalog.fresh('loading');
      Object.assign(p.stageSuite, { orderKey: 'PO-A-G08-LOADING', reference: 'FICTIONAL-LOADING-CRITERIA-REV-1', approvedBy: 'Fictional criteria reviewer', sampling: 'Synthetic preview/print proof only.' });
      p.stageSuite.checks[0] = { ...p.stageSuite.checks[0], status: 'Pass', note: 'Synthetic empty-container review.' };
      p.stageSuite.records.push({ id: 'REC-A-G08-LOADING', module: 'loading', identity: 'CONT-A-G08-001', reference: 'FICTIONAL-LOADING-SOURCE', status: 'Pass', note: 'Synthetic loading report record.', expected: 100, loaded: 99, piecesExpected: 1000, piecesLoaded: 990, seal: '', before: '', after: '' });
      p.capa.push({ id: 'CA-A-G08-LOADING', issue: 'Fictional loading mismatch', containment: 'Hold synthetic handover', cause: 'Synthetic fixture', action: 'Reconcile fictional counts', owner: 'Fictional owner', due: '2026-10-20', status: 'Open', verification: '' });
      await app.setProject(p);
      app.step = 5;
      app.render();
    });
    await page.locator('#app [data-action="report"]:visible').first().click();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const iframe = page.locator('#reportFrame');
    assert.equal(await iframe.getAttribute('sandbox'), 'allow-same-origin allow-modals', 'report preview sandbox flags changed');
    const report = page.frameLocator('#reportFrame');
    await report.locator('body').filter({ hasText: 'Container Loading Inspection' }).waitFor({ state: 'visible' });
    const previewText = await report.locator('body').innerText();
    for (const expected of ['A-G08-LOADING-PREVIEW', 'PO-A-G08-LOADING', 'CONT-A-G08-001', 'LOADING NOT CONFORMED', 'Fictional loading mismatch', 'VESA report verification token']) assert.ok(previewText.includes(expected), `preview is missing ${expected}`);
    assert.equal(await report.locator('script').count(), 0, 'sandbox preview contains a script node');
    assert.equal(await report.locator('#criteria[role="region"][aria-label="Approved stage criteria table"][tabindex="0"]').count(), 1, 'contained report table is not a named keyboard-focusable region');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px preview causes page-level overflow');
    fs.mkdirSync(outputDir, { recursive: true });
    await page.screenshot({ path: path.join(outputDir, 'aql-a-g08-stage-report-390.png'), fullPage: true });

    const popupPromise = context.waitForEvent('page');
    await page.locator('#dialog [data-action="report-print"]').click();
    const popup = await popupPromise;
    await popup.waitForFunction(() => document.body?.innerText.includes('Container Loading Inspection'));
    await popup.waitForFunction(() => document.documentElement.dataset.vesaPrintCalled === 'true', null, { timeout: 3000 });
    const printText = await popup.locator('body').innerText();
    for (const expected of ['A-G08-LOADING-PREVIEW', 'CONT-A-G08-001', 'VESA report verification token']) assert.ok(printText.includes(expected), `print window is missing ${expected}`);
    assert.equal(await popup.locator('script').count(), 0, 'standalone print document contains a script node');
    const printGeometry = await popup.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')].map(element => ({ tag: element.tagName, id: element.id, className: String(element.className || ''), right: Math.ceil(element.getBoundingClientRect().right), width: Math.ceil(element.getBoundingClientRect().width) })).filter(row => row.right > document.documentElement.clientWidth + 1).sort((a, b) => b.right - a.right).slice(0, 8)
    }));
    assert.equal(printGeometry.scroll > printGeometry.client, false, `standalone print document overflows its viewport: ${JSON.stringify(printGeometry)}`);
    await popup.close();

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px preview causes page-level overflow');
    await page.screenshot({ path: path.join(outputDir, 'aql-a-g08-stage-report-1280.png'), fullPage: true });
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G08 STAGE REPORTS PASS: 13 stage routes, clean strict sandbox at 390/1280, standalone print() window; ${path.relative(root, outputDir)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
