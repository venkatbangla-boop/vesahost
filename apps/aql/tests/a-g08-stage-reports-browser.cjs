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
  if (await enter.isVisible()) await enter.click();
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

    const samplingExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = app.controls.demo('apparel');
      p.meta.reportId = 'A-G08-AR03-SAMPLING';
      p.info.buyer = 'Buyer <North> & Fictional';
      p.info.date = '2026-10-13';
      await app.setProject(p);
      app.step = 5;
      app.render();
      const r = ResultEngine.evaluate(p);
      return {
        unchanged: JSON.stringify(app.p),
        groups: r.groups.map(g => ({ label: g.label, lot: g.lot, code: g.plan.code, required: g.plan.n, allocated: g.allocated, checked: g.checked, major: g.plan.major, minor: g.plan.minor, result: g.result })),
        plan: { standard: p.planApproval.standard, edition: p.planApproval.edition, reference: p.planApproval.reference }
      };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="report"]:visible').first().click();
    const samplingOption = page.locator('#dialog [name="preset"] option[value="sampling"]');
    assert.equal(await samplingOption.count(), 1, 'Report Studio is missing the AR03 sampling preset');
    assert.equal(await samplingOption.textContent(), 'Sampling plan & allocation', 'AR03 sampling preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('sampling');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const samplingFrame = page.frameLocator('#reportFrame');
    await samplingFrame.locator('h1').filter({ hasText: 'Sampling Plan & Allocation' }).waitFor({ state: 'visible' });
    const samplingText = await samplingFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR03-SAMPLING', 'Buyer <North> & Fictional', 'Sampling standard / edition', samplingExpected.plan.edition, samplingExpected.plan.reference, 'Required sample', 'Allocated', 'Checked', 'Issues / support', 'Sample allocation and quantity differences', 'Operational legacy reference only']) assert.ok(samplingText.includes(String(expected)), `AR03 preview is missing ${expected}`);
    for (const group of samplingExpected.groups) {
      for (const expected of [group.label, group.lot, group.code, group.required, group.allocated, group.checked, group.result]) assert.ok(samplingText.includes(String(expected)), `AR03 preview is missing group value ${expected}`);
    }
    assert.equal(await samplingFrame.locator('#sampling[role="region"][aria-label="Sampling & acceptance table"][tabindex="0"]').count(), 1, 'AR03 plan table is not a named keyboard-focusable region');
    assert.equal(await samplingFrame.locator('script').count(), 0, 'AR03 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, samplingExpected.unchanged), true, 'AR03 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR03 preview causes page-level overflow');
    const samplingHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    const samplingPage = await context.newPage();
    await samplingPage.setViewportSize({ width: 390, height: 844 });
    await samplingPage.setContent(samplingHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await samplingPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR03 report causes page-level overflow');
    await samplingPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar03-sampling-390.png'), fullPage: true });

    const unsupported = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.info, { buyer: 'Unsupported Plan Fixture - Fictional', factory: 'Fictional Factory', inspector: 'Fictional Inspector', date: '2026-10-13' });
      p.meta.reportId = 'A-G08-AR03-UNSUPPORTED';
      p.rules.reference = 'Fictional unsupported reference-cell probe';
      p.orders = [{ ...ProjectSchema.order(), po: 'PO-AR03-UNSUPPORTED', item: 'TS-UNSUPPORTED', color: 'Blue', size: 'M', qty: 8, orderQty: 8, allocated: 0, checked: 0 }];
      const before = JSON.stringify(p);
      const html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'sampling' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(unsupported.unchanged, true, 'unsupported AR03 report mutated its source project');
    assert.ok(unsupported.html.includes('This reference cell needs an arrow / unsupported plan. Enter a buyer-approved custom sample and all limits; no denominator is guessed.'), 'unsupported AR03 report lost the exact no-guess explanation');
    assert.ok(unsupported.html.includes('Unresolved'), 'unsupported AR03 report did not expose unresolved Ac/Re');
    assert.ok(unsupported.html.includes('PENDING'), 'unsupported AR03 report falsely passed');
    assert.ok(!/<script\b/i.test(unsupported.html), 'unsupported AR03 report contains executable script');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR03 preview causes page-level overflow');
    await samplingPage.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await samplingPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR03 report causes page-level overflow');
    await samplingPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar03-sampling-1280.png'), fullPage: true });
    await samplingPage.close();

    const defectExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo'), line = { ...ProjectSchema.order(), po: 'PO-A-G08-AR04', item: 'TS-AR04', color: 'Navy', size: 'M', orderQty: 90, qty: 90, available: 90 };
      Object.assign(p.info, { buyer: 'A-G08 AR04 Buyer - Fictional', factory: 'A-G08 AR04 Factory - Fictional', inspector: 'A-G08 AR04 Inspector - Fictional', date: '2026-10-13' });
      Object.assign(p.rules, { level: 'III', basis: 'occurrences', reference: 'FICTIONAL-AR04-COUNTING-BASIS-REV-1' });
      p.meta.reportId = 'A-G08-AR04-DEFECT-PARETO';
      p.orders = [line];
      const plan = SamplingEngine.plan(SamplingEngine.groups(p)[0], p.rules);
      line.allocated = plan.n;
      line.checked = plan.n;
      p.defects = [
        { id: 'D-AR04-1', lineId: line.id, name: 'Open seam', severity: 'Major', qty: 4, sampleId: '', location: 'Side seam', note: 'Fictional occurrence row A', internal: false, created: '2026-10-13T00:00:00.000Z' },
        { id: 'D-AR04-2', lineId: line.id, name: 'Open seam', severity: 'Major', qty: 2, sampleId: '', location: 'Armhole seam', note: 'Fictional occurrence row B', internal: false, created: '2026-10-13T00:00:00.000Z' },
        { id: 'D-AR04-3', lineId: line.id, name: 'Uncut / loose thread', severity: 'Minor', qty: 3, sampleId: '', location: 'Hem', note: 'Fictional occurrence row C', internal: false, created: '2026-10-13T00:00:00.000Z' },
        { id: 'D-AR04-4', lineId: line.id, name: 'Other <mark> & scratch', severity: 'Minor', qty: 1, sampleId: '', location: 'Front', note: 'Fictional user-entered category', internal: false, created: '2026-10-13T00:00:00.000Z' }
      ];
      await app.setProject(p);
      app.step = 5;
      app.render();
      return { unchanged: JSON.stringify(app.p), checked: plan.n };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="report"]:visible').first().click();
    const defectOption = page.locator('#dialog [name="preset"] option[value="defects"]');
    assert.equal(await defectOption.count(), 1, 'Report Studio is missing the AR04 defect preset');
    assert.equal(await defectOption.textContent(), 'Defect breakdown / Pareto', 'AR04 defect preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('defects');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const defectFrame = page.frameLocator('#reportFrame');
    await defectFrame.locator('h1').filter({ hasText: 'Defect Breakdown / Pareto' }).waitFor({ state: 'visible' });
    const defectText = await defectFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR04-DEFECT-PARETO', 'Counting basis: Defect occurrences', `Actual workmanship checked: ${defectExpected.checked}`, 'Recorded row quantity denominator: 10', '50.00 occurrences per 100 checked', 'Share of recorded row quantity', 'Cumulative share', 'no target, control limit or buyer KPI is inferred']) assert.ok(defectText.includes(String(expected)), `AR04 preview is missing ${expected}`);
    const defectRows = await defectFrame.locator('#defect-breakdown tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim())));
    assert.deepEqual(defectRows, [
      ['1', 'Sewing', 'Open seam', 'Major', '6', '2', '0', '60.00%', '60.00%'],
      ['2', 'Sewing', 'Uncut / loose thread', 'Minor', '3', '1', '0', '30.00%', '90.00%'],
      ['3', 'Other / user-entered', 'Other <mark> & scratch', 'Minor', '1', '1', '0', '10.00%', '100.00%']
    ], 'AR04 deterministic observed-category ordering or shares changed');
    assert.equal(await defectFrame.locator('#defect-breakdown[role="region"][aria-label="Defect breakdown / Pareto table"][tabindex="0"]').count(), 1, 'AR04 table is not a named keyboard-focusable region');
    assert.equal(await defectFrame.locator('script').count(), 0, 'AR04 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, defectExpected.unchanged), true, 'AR04 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR04 preview causes page-level overflow');
    const defectHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    const defectPage = await context.newPage();
    await defectPage.setViewportSize({ width: 390, height: 844 });
    await defectPage.setContent(defectHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await defectPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR04 report causes page-level overflow');
    await defectPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar04-defect-pareto-390.png'), fullPage: true });

    const boundaryCopy = await page.evaluate(async () => {
      const app = window.__vesaApp, unit = DomainValue.copy(app.p), zero = DomainValue.copy(app.p);
      unit.rules.basis = 'units';
      unit.rules.unitClass = 'highest';
      unit.defects = unit.defects.map((row, index) => ({ ...row, qty: 1, sampleId: `UNIT-AR04-${index + 1}` }));
      zero.orders[0].checked = 0;
      const beforeUnit = JSON.stringify(unit), beforeZero = JSON.stringify(zero);
      const unitHtml = await ReportComposer.html(unit, app.assets, { ...unit.report, preset: 'defects' });
      const zeroHtml = await ReportComposer.html(zero, app.assets, { ...zero.report, preset: 'defects' });
      return { unitHtml, zeroHtml, unchanged: beforeUnit === JSON.stringify(unit) && beforeZero === JSON.stringify(zero) };
    });
    assert.equal(boundaryCopy.unchanged, true, 'AR04 boundary reports mutated source projects');
    assert.ok(boundaryCopy.unitHtml.includes('Not calculated for nonconforming-unit basis'), 'AR04 unit-basis report emitted or omitted the wrong rate boundary');
    assert.ok(boundaryCopy.unitHtml.includes('name totals are not presented as a unique defective-unit percentage'), 'AR04 unit-basis caveat is missing');
    assert.ok(boundaryCopy.zeroHtml.includes('Undefined (no checked denominator)'), 'AR04 zero-denominator report invented an occurrence rate');
    assert.ok(!/<script\b/i.test(boundaryCopy.unitHtml + boundaryCopy.zeroHtml), 'AR04 boundary report contains executable script');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR04 preview causes page-level overflow');
    await defectPage.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await defectPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR04 report causes page-level overflow');
    await defectPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar04-defect-pareto-1280.png'), fullPage: true });
    await defectPage.close();

    const capaExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.info, { buyer: 'A-G08 AR13 Buyer - Fictional', factory: 'A-G08 AR13 Factory - Fictional', inspector: 'A-G08 AR13 Inspector - Fictional', date: '2026-10-13' });
      p.meta.reportId = 'A-G08-AR13-CAPA-TRACKER';
      p.capa = [
        { id: 'CA-AR13-OPEN', issue: 'Open <needle> & control issue', containment: 'Hold the fictional line', cause: '', action: 'Inspect the fictional affected batch', owner: 'Fictional QA owner', due: '2026-10-20', status: 'Open', verification: '', effectiveness: '', closure: '', reply: '' },
        { id: 'CA-AR13-VERIFIED', issue: 'Fictional seam recurrence', containment: 'Segregate fictional output', cause: 'Fictional guide wear', action: 'Replace guide and retrain operator', owner: 'Fictional line owner', due: '2026-10-19', status: 'Verified', verification: 'Fictional follow-up sample reviewed', effectiveness: 'No recurrence in the recorded fictional follow-up', closure: '', reply: 'Fictional follow-up sample reviewed' },
        { id: 'CA-AR13-CLOSED', issue: 'Fictional label mismatch', containment: 'Hold fictional labels', cause: 'Fictional artwork revision mismatch', action: 'Replace labels against recorded revision', owner: 'Fictional packing owner', due: '2026-10-18', status: 'Closed', verification: 'Fictional label comparison recorded', effectiveness: 'Recorded follow-up matched the fictional revision', closure: 'Fictional closure evidence reference CE-AR13-1', reply: 'Fictional label comparison recorded' },
        { id: 'CA-AR13-INCOMPLETE', issue: 'Legacy closed claim - fictional', containment: 'Legacy hold note', cause: 'Legacy cause note', action: 'Legacy action note', owner: 'Legacy fictional owner', due: '2026-10-17', status: 'Closed', verification: '', effectiveness: '', closure: '', reply: '' }
      ];
      await app.setProject(p);
      app.step = 5;
      app.render();
      return { unchanged: JSON.stringify(app.p) };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="report"]:visible').first().click();
    const capaOption = page.locator('#dialog [name="preset"] option[value="capa"]');
    assert.equal(await capaOption.count(), 1, 'Report Studio is missing the AR13 CAPA preset');
    assert.equal(await capaOption.textContent(), 'CAPA tracker', 'AR13 CAPA preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('capa');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const capaFrame = page.frameLocator('#reportFrame');
    await capaFrame.locator('h1').filter({ hasText: 'CAPA Tracker' }).waitFor({ state: 'visible' });
    const capaText = await capaFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR13-CAPA-TRACKER', 'CAPA records: 4', 'Unresolved: 2', 'Recorded verified (not closed): 1', 'Recorded closed: 1', 'RECORDED VERIFIED — NOT CLOSED', 'RECORDED CLOSED — NOT EXTERNAL APPROVAL', 'UNRESOLVED — recorded Closed; missing verification, effectiveness, closure evidence', 'does not constitute VESA, buyer, factory or external approval', 'Reinspection remains a separate recorded event']) assert.ok(capaText.includes(expected), `AR13 preview is missing ${expected}`);
    const capaRows = await capaFrame.locator('#capa tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim())));
    assert.deepEqual(capaRows, [
      ['Open <needle> & control issue', 'Hold the fictional line', '', 'Inspect the fictional affected batch', 'Fictional QA owner', '2026-10-20', 'Open', '', '', '', 'No selected evidence linked', 'UNRESOLVED — recorded Open; missing root cause'],
      ['Fictional seam recurrence', 'Segregate fictional output', 'Fictional guide wear', 'Replace guide and retrain operator', 'Fictional line owner', '2026-10-19', 'Verified', 'Fictional follow-up sample reviewed', 'No recurrence in the recorded fictional follow-up', '', 'No selected evidence linked', 'RECORDED VERIFIED — NOT CLOSED'],
      ['Fictional label mismatch', 'Hold fictional labels', 'Fictional artwork revision mismatch', 'Replace labels against recorded revision', 'Fictional packing owner', '2026-10-18', 'Closed', 'Fictional label comparison recorded', 'Recorded follow-up matched the fictional revision', 'Fictional closure evidence reference CE-AR13-1', 'No selected evidence linked', 'RECORDED CLOSED — NOT EXTERNAL APPROVAL'],
      ['Legacy closed claim - fictional', 'Legacy hold note', 'Legacy cause note', 'Legacy action note', 'Legacy fictional owner', '2026-10-17', 'Closed', '', '', '', 'No selected evidence linked', 'UNRESOLVED — recorded Closed; missing verification, effectiveness, closure evidence']
    ], 'AR13 exact lifecycle rows or non-inference review changed');
    assert.equal(await capaFrame.locator('#capa[role="region"][aria-label="CAPA tracker table"][tabindex="0"]').count(), 1, 'AR13 table is not a named keyboard-focusable region');
    assert.equal(await capaFrame.locator('#capa').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR13 wide table is not contained in its horizontal review region');
    assert.equal(await capaFrame.locator('script').count(), 0, 'AR13 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, capaExpected.unchanged), true, 'AR13 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR13 preview causes page-level overflow');
    const capaHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(capaHtml.includes('Open &lt;needle&gt; &amp; control issue'), 'AR13 report did not escape hostile issue text');
    assert.ok(!capaHtml.includes('Open <needle> & control issue'), 'AR13 report emitted hostile issue markup');
    const capaPage = await context.newPage();
    await capaPage.setViewportSize({ width: 390, height: 844 });
    await capaPage.setContent(capaHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await capaPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR13 report causes page-level overflow');
    await capaPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar13-capa-tracker-390.png'), fullPage: true });
    await capaPage.locator('#capa').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await capaPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar13-capa-tracker-390-right.png'), fullPage: true });

    const emptyCapa = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo'), before = JSON.stringify(p);
      const html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'capa' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(emptyCapa.unchanged, true, 'empty AR13 report mutated its source project');
    assert.ok(emptyCapa.html.includes('CAPA records:</b> 0') && emptyCapa.html.includes('This does not prove that no corrective action is required.'), 'empty AR13 report inferred a clean corrective-action state');
    assert.ok(!/<script\b/i.test(emptyCapa.html), 'empty AR13 report contains executable script');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR13 preview causes page-level overflow');
    await capaPage.setViewportSize({ width: 1280, height: 900 });
    await capaPage.locator('#capa').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await capaPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR13 report causes page-level overflow');
    await capaPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar13-capa-tracker-1280.png'), fullPage: true });
    await capaPage.close();

    const followupExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo'), line = { ...ProjectSchema.order(), po: 'PO-A-G08-AR02', item: 'TS-AR02', color: 'Black', size: 'L', orderQty: 100, qty: 100 };
      Object.assign(p.info, { buyer: 'A-G08 AR02 Buyer - Fictional', factory: 'A-G08 AR02 Factory - Fictional', inspector: 'A-G08 AR02 Inspector - Fictional', date: '2026-10-13' });
      p.meta.reportId = 'A-G08-AR02-FACTORY-FOLLOW-UP';
      p.orders = [line];
      p.defects = [
        { id: 'D-AR02-1', lineId: line.id, name: 'Open <seam> & edge', severity: 'Major', qty: 2, sampleId: 'PIECE-AR02-1', location: 'Side seam', note: 'Fictional source finding one', internal: false, created: '2026-10-13T00:00:00.000Z' },
        { id: 'D-AR02-2', lineId: line.id, name: 'Loose thread', severity: 'Minor', qty: 3, sampleId: 'PIECE-AR02-2', location: 'Hem', note: 'Fictional source finding two', internal: false, created: '2026-10-13T00:00:00.000Z' }
      ];
      p.capa = [
        { id: 'CA-AR02-OPEN', issue: 'Fictional seam follow-up', containment: 'Hold fictional output', cause: 'Fictional guide issue', action: 'Inspect guide and segregated output', owner: 'Fictional QA owner', due: '2026-10-20', status: 'Open', verification: '', effectiveness: '', closure: '', reply: '' },
        { id: 'CA-AR02-VERIFIED', issue: 'Fictional thread follow-up', containment: 'Trim and segregate fictional output', cause: 'Fictional trimming gap', action: 'Retrain fictional operator', owner: 'Fictional line owner', due: '2026-10-19', status: 'Verified', verification: 'Fictional follow-up sample reviewed', effectiveness: 'No recurrence in recorded fictional sample', closure: '', reply: 'Fictional follow-up sample reviewed' },
        { id: 'CA-AR02-CLAIM', issue: 'Legacy closed follow-up claim', containment: 'Legacy containment note', cause: 'Legacy cause note', action: 'Legacy action note', owner: 'Legacy fictional owner', due: '2026-10-18', status: 'Closed', verification: '', effectiveness: '', closure: '', reply: '' }
      ];
      await app.setProject(p);
      app.step = 5;
      app.render();
      return { unchanged: JSON.stringify(app.p) };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="report"]:visible').first().click();
    const followupOption = page.locator('#dialog [name="preset"] option[value="followup"]');
    assert.equal(await followupOption.count(), 1, 'Report Studio is missing the AR02 follow-up preset');
    assert.equal(await followupOption.textContent(), 'Factory quality follow-up', 'AR02 follow-up preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('followup');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const followupFrame = page.frameLocator('#reportFrame');
    await followupFrame.locator('h1').filter({ hasText: 'Factory Quality Follow-Up' }).waitFor({ state: 'visible' });
    const followupText = await followupFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR02-FACTORY-FOLLOW-UP', 'Source findings: 2', 'Corrective-action rows: 3', 'Unresolved action rows: 2', 'SOURCE FINDING — NOT CLOSED BY THIS REPORT', 'RECORDED VERIFIED — NOT CLOSED', 'UNRESOLVED — recorded Closed; missing verification, effectiveness, closure evidence', 'Similar wording does not create a link', 'do not prove factory acceptance, external approval or closure']) assert.ok(followupText.includes(expected), `AR02 preview is missing ${expected}`);
    const followupRows = await followupFrame.locator('#capa tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim())));
    assert.deepEqual(followupRows, [
      ['SOURCE FINDING', 'D-AR02-1', 'Open <seam> & edge', 'Major / quantity 2', 'Not recorded on finding row', 'Not recorded on finding row', 'Not recorded on finding row', 'Observed', 'No selected evidence linked', 'SOURCE FINDING — NOT CLOSED BY THIS REPORT'],
      ['SOURCE FINDING', 'D-AR02-2', 'Loose thread', 'Minor / quantity 3', 'Not recorded on finding row', 'Not recorded on finding row', 'Not recorded on finding row', 'Observed', 'No selected evidence linked', 'SOURCE FINDING — NOT CLOSED BY THIS REPORT'],
      ['CORRECTIVE ACTION', 'CA-AR02-OPEN', 'Fictional seam follow-up', 'Not applicable', 'Inspect guide and segregated output', 'Fictional QA owner', '2026-10-20', 'Open', 'No selected evidence linked', 'UNRESOLVED — recorded Open'],
      ['CORRECTIVE ACTION', 'CA-AR02-VERIFIED', 'Fictional thread follow-up', 'Not applicable', 'Retrain fictional operator', 'Fictional line owner', '2026-10-19', 'Verified', 'No selected evidence linked', 'RECORDED VERIFIED — NOT CLOSED'],
      ['CORRECTIVE ACTION', 'CA-AR02-CLAIM', 'Legacy closed follow-up claim', 'Not applicable', 'Legacy action note', 'Legacy fictional owner', '2026-10-18', 'Closed', 'No selected evidence linked', 'UNRESOLVED — recorded Closed; missing verification, effectiveness, closure evidence']
    ], 'AR02 exact source finding/action rows or lifecycle review changed');
    assert.equal(await followupFrame.locator('#capa[role="region"][aria-label="Factory quality follow-up table"][tabindex="0"]').count(), 1, 'AR02 table is not a named keyboard-focusable region');
    assert.equal(await followupFrame.locator('#capa').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR02 wide table is not contained in its horizontal review region');
    assert.equal(await followupFrame.locator('script').count(), 0, 'AR02 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, followupExpected.unchanged), true, 'AR02 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR02 preview causes page-level overflow');
    const followupHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(followupHtml.includes('Open &lt;seam&gt; &amp; edge') && !followupHtml.includes('Open <seam> & edge'), 'AR02 report did not safely escape hostile finding text');
    const followupPage = await context.newPage();
    await followupPage.setViewportSize({ width: 390, height: 844 });
    await followupPage.setContent(followupHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await followupPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR02 report causes page-level overflow');
    await followupPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar02-factory-follow-up-390.png'), fullPage: true });
    await followupPage.locator('#capa').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await followupPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar02-factory-follow-up-390-right.png'), fullPage: true });

    const emptyFollowup = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo'), before = JSON.stringify(p);
      const html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'followup' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(emptyFollowup.unchanged, true, 'empty AR02 report mutated its source project');
    assert.ok(emptyFollowup.html.includes('Source findings:</b> 0') && emptyFollowup.html.includes('This does not prove that no follow-up is required.'), 'empty AR02 report inferred that no follow-up is required');
    assert.ok(!/<script\b/i.test(emptyFollowup.html), 'empty AR02 report contains executable script');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR02 preview causes page-level overflow');
    await followupPage.setViewportSize({ width: 1280, height: 900 });
    await followupPage.locator('#capa').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await followupPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR02 report causes page-level overflow');
    await followupPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar02-factory-follow-up-1280.png'), fullPage: true });
    await followupPage.close();

    const chainExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const source = ProjectSchema.fresh('Knit Top / T-Shirt / Polo'), line = { ...ProjectSchema.order(), id: 'LINE-AR10', po: 'PO-A-G08-AR10', item: 'TS-AR10', color: 'Navy', size: 'M', orderQty: 100, qty: 100, allocated: 0, checked: 0 };
      Object.assign(source.meta, { id: 'SOURCE-EVENT-AR10', reportId: 'FAILED-REPORT-AR10', revision: 4 });
      Object.assign(source.info, { buyer: 'A-G08 AR10 Buyer - Fictional', factory: 'A-G08 AR10 Factory - Fictional', inspector: 'A-G08 AR10 Source Inspector - Fictional', date: '2026-10-12', kind: 'Failed source inspection' });
      source.orders = [line];
      source.defects = [{ id: 'D-AR10-SOURCE', lineId: line.id, name: 'Open <seam> & unsafe edge', severity: 'Critical', qty: 1, sampleId: 'PIECE-AR10-1', location: 'Side seam', note: 'Fictional failed source observation', internal: false, created: '2026-10-12T00:00:00.000Z' }];
      source.capa = [
        { id: 'CA-AR10-OPEN', issue: 'Fictional source containment', containment: 'Hold fictional source lot', cause: 'Fictional guide damage', action: 'Repair guide and segregate lot', owner: 'Fictional factory QA', due: '2026-10-13', status: 'Open', verification: '', effectiveness: '', closure: '', reply: '' },
        { id: 'CA-AR10-VERIFIED', issue: 'Fictional repair verification', containment: 'Retain fictional lot hold', cause: 'Fictional guide damage', action: 'Replace guide and sort lot', owner: 'Fictional factory owner', due: '2026-10-13', status: 'Verified', verification: 'Recorded fictional follow-up check', effectiveness: 'No recurrence in recorded fictional correction sample', closure: '', reply: 'Recorded fictional follow-up check' }
      ];
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.meta, { id: 'CURRENT-EVENT-AR10', reportId: 'REINSPECTION-REPORT-AR10', revision: 1 });
      Object.assign(p.info, { buyer: source.info.buyer, factory: source.info.factory, inspector: 'A-G08 AR10 Reinspection Inspector - Fictional', date: '2026-10-13', kind: 'Reinspection after rework' });
      p.orders = [{ ...line, id: 'LINE-AR10-CURRENT', allocated: 0, checked: 0 }];
      p.resubmission = { sourceProject: source.meta.id, sourceReport: source.meta.reportId, sourceRevision: source.meta.revision, sourceQty: 100, sourceFindings: 2, sourceSnapshot: source, lotReference: 'LOT-AR10-RESUBMITTED-REV-2', reason: '', owner: 'Fictional factory correction owner', completed: '2026-10-13', handled: 100, remaining: 95, replaced: 5, scrapped: 5, quantityReason: 'Five fictional pieces replaced after removal', verifiedBy: 'Fictional resubmission verifier', reference: 'CORRECTION-EVIDENCE-AR10', correctionScope: '100% fictional sorting and recorded guide repair' };
      p.reinspection = [
        { id: 'RE-AR10-CORRECTED', sourceId: 'D-AR10-SOURCE', sourceProject: source.meta.id, sourceReport: source.meta.reportId, sourceRevision: source.meta.revision, collection: 'defects', issue: 'Open <seam> & unsafe edge', original: source.defects[0], status: 'Corrected', note: 'No open seam observed in the current fictional verification', quantity: 100, method: 'Fresh independent visual reinspection', verifiedBy: 'Fictional reinspection verifier', verifiedAt: '2026-10-13', evidenceReference: 'REINSPECTION-EVIDENCE-AR10-1' },
        { id: 'RE-AR10-OPEN', sourceId: 'CA-AR10-OPEN', sourceProject: source.meta.id, sourceReport: source.meta.reportId, sourceRevision: source.meta.revision, collection: 'capa', issue: 'Fictional source containment remains open', original: source.capa[0], status: 'Not corrected', note: 'Recorded fictional obligation remains open', quantity: '', method: '', verifiedBy: '', verifiedAt: '', evidenceReference: '' }
      ];
      await app.setProject(p);
      app.step = 5;
      app.render();
      return { unchanged: JSON.stringify(app.p), sourceResult: ResultEngine.evaluate(source).result };
    });
    assert.equal(chainExpected.sourceResult, 'NOT CONFORMED', 'AR10 source fixture must retain a failed original result');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="report"]:visible').first().click();
    const chainOption = page.locator('#dialog [name="preset"] option[value="chain"]');
    assert.equal(await chainOption.count(), 1, 'Report Studio is missing the AR10 chain preset');
    assert.equal(await chainOption.textContent(), 'Rework / reinspection chain', 'AR10 chain preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('chain');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const chainFrame = page.frameLocator('#reportFrame');
    await chainFrame.locator('h1').filter({ hasText: 'Rework / Reinspection Chain' }).waitFor({ state: 'visible' });
    const chainText = await chainFrame.locator('body').innerText();
    for (const expected of ['FAILED-REPORT-AR10', 'REINSPECTION-REPORT-AR10', 'NOT CONFORMED', 'Frozen source result — never rewritten by this report', 'LOT-AR10-RESUBMITTED-REV-2', '100% fictional sorting and recorded guide repair', 'CA-AR10-VERIFIED', 'RECORDED VERIFIED — NOT CLOSED', 'RE-AR10-CORRECTED', 'RECORDED CORRECTED — SOURCE RESULT UNCHANGED', 'RE-AR10-OPEN', 'NOT CORRECTED — REMAINS OPEN', 'Similar wording never creates a link', 'does not erase or change the original failed result']) assert.ok(chainText.includes(expected), `AR10 preview is missing ${expected}`);
    const chainTables = chainFrame.locator('#chain table');
    assert.equal(await chainTables.count(), 4, 'AR10 chain must expose event, correction, CAPA and reconciliation tables');
    assert.deepEqual(await chainTables.nth(0).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim()))), [
      ['SOURCE EVENT', 'SOURCE-EVENT-AR10', 'FAILED-REPORT-AR10', 'R4', 'NOT CONFORMED', 'Frozen source result — never rewritten by this report'],
      ['CURRENT EVENT', 'CURRENT-EVENT-AR10', 'REINSPECTION-REPORT-AR10', 'R1', 'NOT CONFORMED', 'Independent current inspection result; not shipment release']
    ], 'AR10 event identity/result rows changed');
    assert.deepEqual(await chainTables.nth(1).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim()))), [[
      'LOT-AR10-RESUBMITTED-REV-2', '100% fictional sorting and recorded guide repair', 'Fictional factory correction owner', '2026-10-13', '100', '95', '5', '5', 'Five fictional pieces replaced after removal', 'Fictional resubmission verifier', 'CORRECTION-EVIDENCE-AR10'
    ]], 'AR10 correction/resubmission row changed');
    const reconciliationRows = await chainTables.nth(3).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim())));
    assert.deepEqual(reconciliationRows, [
      ['RE-AR10-CORRECTED', 'defects', 'D-AR10-SOURCE', 'SOURCE-EVENT-AR10', 'FAILED-REPORT-AR10', 'R4', 'Open <seam> & unsafe edge', 'Corrected', 'No open seam observed in the current fictional verification', 'Fresh independent visual reinspection', '100', 'Fictional reinspection verifier', '2026-10-13', 'REINSPECTION-EVIDENCE-AR10-1', 'RECORDED CORRECTED — SOURCE RESULT UNCHANGED'],
      ['RE-AR10-OPEN', 'capa', 'CA-AR10-OPEN', 'SOURCE-EVENT-AR10', 'FAILED-REPORT-AR10', 'R4', 'Fictional source containment remains open', 'Not corrected', 'Recorded fictional obligation remains open', '', 'Not recorded', '', '', '', 'NOT CORRECTED — REMAINS OPEN']
    ], 'AR10 exact reconciliation rows changed');
    assert.equal(await chainFrame.locator('#chain[role="region"][aria-label="Rework / reinspection chain table"][tabindex="0"]').count(), 1, 'AR10 tables are not in a named keyboard-focusable region');
    assert.equal(await chainFrame.locator('#chain').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR10 wide tables are not contained in their horizontal review region');
    assert.equal(await chainFrame.locator('script').count(), 0, 'AR10 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, chainExpected.unchanged), true, 'AR10 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR10 preview causes page-level overflow');
    const chainHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(chainHtml.includes('Open &lt;seam&gt; &amp; unsafe edge') && !chainHtml.includes('Open <seam> & unsafe edge'), 'AR10 report did not safely escape hostile source text');
    const chainPage = await context.newPage();
    await chainPage.setViewportSize({ width: 390, height: 844 });
    await chainPage.setContent(chainHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await chainPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR10 report causes page-level overflow');
    await chainPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar10-rework-reinspection-390.png'), fullPage: true });
    await chainPage.locator('#chain').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await chainPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar10-rework-reinspection-390-right.png'), fullPage: true });

    const brokenChain = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.resubmission.sourceProject = 'MISSING-SOURCE-AR10'; p.resubmission.sourceReport = 'MISSING-REPORT-AR10'; p.resubmission.sourceRevision = 2; p.resubmission.sourceFindings = 1;
      const before = JSON.stringify(p);
      const html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'chain' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(brokenChain.unchanged, true, 'AR10 broken-link report mutated its source project');
    assert.ok(!/<script\b/i.test(brokenChain.html), 'AR10 broken-link report contains executable script');
    assert.ok(brokenChain.html.includes('Frozen source snapshot is missing') && brokenChain.html.includes('Reconciliation count mismatch: 1 expected / 0 recorded') && brokenChain.html.includes('No linked reinspection rows are recorded. This does not prove that prior obligations were resolved.'), 'AR10 missing-link/count safeguards changed');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR10 preview causes page-level overflow');
    await chainPage.setViewportSize({ width: 1280, height: 900 });
    await chainPage.locator('#chain').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await chainPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR10 report causes page-level overflow');
    await chainPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar10-rework-reinspection-1280.png'), fullPage: true });
    await chainPage.close();

    const loadingExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.meta, { id: 'EVENT-AR12-LOADING', reportId: 'A-G08-AR12-CONTAINER-LOADING', revision: 2 });
      Object.assign(p.info, { buyer: 'A-G08 AR12 Buyer - Fictional', factory: 'A-G08 AR12 Factory - Fictional', inspector: 'A-G08 AR12 Inspector - Fictional', date: '2026-10-13', kind: 'Container Loading Inspection' });
      p.stageSuite = StageCatalog.fresh('loading');
      Object.assign(p.stageSuite, { orderKey: 'PO-A-G08-AR12', reference: 'LOADING-CRITERIA-AR12-REV-1', approvedBy: 'Fictional loading reviewer', sampling: 'Recorded container coverage only; no randomization method certified.' });
      p.stageSuite.checks = p.stageSuite.checks.map(check => ({ ...check, status: 'Pass', note: 'Fictional explicit checkpoint review.' }));
      p.stageSuite.records = [
        { id: 'LOAD-AR12-COMPLETE', module: 'loading', identity: 'CONT-AR12-001', truck: 'TRUCK-AR12-001', seal: 'SEAL-AR12-001', condition: 'Dry <container> & intact - fictional', cleanliness: 'Recorded clean observation', damage: 'No recorded water, odour or damage', expected: 60, loaded: 60, piecesExpected: 600, piecesLoaded: 600, pallets: 6, sequence: 'Front-to-rear fictional sequence', random: 'CTN-AR12-003, CTN-AR12-041', start: '2026-10-13 08:00', end: '2026-10-13 09:00', environment: 'Recorded ambient condition', handover: 'Typed fictional driver / forwarder handover', before: '', after: '', reference: 'LOADING-SOURCE-AR12-1', status: 'Pass', note: 'Recorded fields only; not physical acceptance.' },
        { id: 'LOAD-AR12-UNRESOLVED', module: 'loading', identity: 'CONT-AR12-002', truck: 'TRUCK-AR12-002', seal: 'SEAL-AR12-002', condition: 'Recorded dry condition', cleanliness: 'Recorded clean observation', damage: 'No recorded damage', expected: 40, loaded: 39, piecesExpected: 500, piecesLoaded: 490, pallets: 4, sequence: 'Fictional second-container sequence', random: 'CTN-AR12-072', start: '2026-10-13 10:00', end: '2026-10-13 11:00', environment: 'Recorded ambient condition', handover: 'Typed fictional handover pending reconciliation', before: '', after: '', reference: 'LOADING-SOURCE-AR12-2', status: 'Pass', note: 'Deliberate count and final-evidence gap; row status must not override it.' }
      ];
      const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='), char => char.charCodeAt(0));
      const descriptors = [];
      for (const evidence of [
        { owner: 'LOAD-AR12-COMPLETE', role: 'before', name: 'ar12-empty-1.png', caption: 'Fictional empty container one' },
        { owner: 'LOAD-AR12-COMPLETE', role: 'after', name: 'ar12-seal-1.png', caption: 'Fictional final seal one' },
        { owner: 'LOAD-AR12-UNRESOLVED', role: 'before', name: 'ar12-empty-2.png', caption: 'Fictional empty container two' }
      ]) descriptors.push(await app.assets.add(new File([png], evidence.name, { type: 'image/png' }), { ...evidence, key: true, internal: false }));
      p.assets.push(...descriptors);
      await app.setProject(p);
      app.step = 0;
      app.render();
      return { unchanged: JSON.stringify(app.p), ids: Object.fromEntries(descriptors.map(asset => [asset.owner + '-' + asset.role, asset.id])) };
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="stage-report"]:visible').first().click();
    const loadingOption = page.locator('#dialog [name="preset"] option[value="loading"]');
    assert.equal(await loadingOption.count(), 1, 'loading-stage Report Studio is missing the AR12 preset');
    assert.equal(await loadingOption.textContent(), 'Container loading', 'AR12 preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('loading');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const loadingFrame = page.frameLocator('#reportFrame');
    await loadingFrame.locator('h1').filter({ hasText: 'Container Loading' }).waitFor({ state: 'visible' });
    const loadingText = await loadingFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR12-CONTAINER-LOADING', 'Loading records: 2', 'Stage decision: LOADING NOT CONFORMED', 'Expected / loaded cartons: 100 / 99', 'Expected / loaded pieces: 1100 / 1090', 'Unresolved rows: 1', 'RECORDED COMPLETE — NOT HANDOVER OR RELEASE APPROVAL', 'UNRESOLVED — expected / loaded mismatch; piecesExpected / piecesLoaded mismatch; after is required; final seal evidence missing from report', 'Carton IDs are displayed exactly as entered', 'does not generate or certify random selection', 'do not prove physical custody transfer']) assert.ok(loadingText.includes(expected), `AR12 preview is missing ${expected}`);
    const loadingRows = await loadingFrame.locator('#container-loading tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim())));
    assert.deepEqual(loadingRows, [
      ['CONT-AR12-001', 'TRUCK-AR12-001', 'Dry <container> & intact - fictional', 'Recorded clean observation', 'No recorded water, odour or damage', '60', '60', '0', '600', '600', '0', '6', 'Front-to-rear fictional sequence', 'CTN-AR12-003, CTN-AR12-041', '2026-10-13 08:00', '2026-10-13 09:00', 'Recorded ambient condition', 'SEAL-AR12-001', 'Typed fictional driver / forwarder handover', 'LOADING-SOURCE-AR12-1', 'Pass', 'Recorded fields only; not physical acceptance.', `${loadingExpected.ids['LOAD-AR12-COMPLETE-before']} · Fictional empty container one`, `${loadingExpected.ids['LOAD-AR12-COMPLETE-after']} · Fictional final seal one`, 'RECORDED COMPLETE — NOT HANDOVER OR RELEASE APPROVAL'],
      ['CONT-AR12-002', 'TRUCK-AR12-002', 'Recorded dry condition', 'Recorded clean observation', 'No recorded damage', '40', '39', '-1', '500', '490', '-10', '4', 'Fictional second-container sequence', 'CTN-AR12-072', '2026-10-13 10:00', '2026-10-13 11:00', 'Recorded ambient condition', 'SEAL-AR12-002', 'Typed fictional handover pending reconciliation', 'LOADING-SOURCE-AR12-2', 'Pass', 'Deliberate count and final-evidence gap; row status must not override it.', `${loadingExpected.ids['LOAD-AR12-UNRESOLVED-before']} · Fictional empty container two`, 'Missing from this report', 'UNRESOLVED — expected / loaded mismatch; piecesExpected / piecesLoaded mismatch; after is required; final seal evidence missing from report']
    ], 'AR12 exact loading reconciliation rows changed');
    assert.equal(await loadingFrame.locator('#container-loading[role="region"][aria-label="Container loading reconciliation table"][tabindex="0"]').count(), 1, 'AR12 table is not a named keyboard-focusable region');
    assert.equal(await loadingFrame.locator('#container-loading').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR12 wide table is not contained in its horizontal review region');
    assert.equal(await loadingFrame.locator('script').count(), 0, 'AR12 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, loadingExpected.unchanged), true, 'AR12 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR12 preview causes page-level overflow');
    const loadingHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(loadingHtml.includes('Dry &lt;container&gt; &amp; intact - fictional') && !loadingHtml.includes('Dry <container> & intact - fictional'), 'AR12 report did not safely escape hostile condition text');
    const loadingPage = await context.newPage();
    await loadingPage.setViewportSize({ width: 390, height: 844 });
    await loadingPage.setContent(loadingHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await loadingPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR12 report causes page-level overflow');
    await loadingPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar12-container-loading-390.png'), fullPage: true });
    await loadingPage.locator('#container-loading').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await loadingPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar12-container-loading-390-right.png'), fullPage: true });

    const emptyLoading = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.stageSuite = StageCatalog.fresh('loading');
      const before = JSON.stringify(p), html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'loading' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(emptyLoading.unchanged, true, 'empty AR12 report mutated its source project');
    assert.ok(emptyLoading.html.includes('No loading records are recorded. This does not prove that loading, seal control or handover occurred.'), 'empty AR12 report inferred that loading or handover occurred');
    assert.ok(!/<script\b/i.test(emptyLoading.html), 'empty AR12 report contains executable script');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR12 preview causes page-level overflow');
    await loadingPage.setViewportSize({ width: 1280, height: 900 });
    await loadingPage.locator('#container-loading').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await loadingPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR12 report causes page-level overflow');
    await loadingPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar12-container-loading-1280.png'), fullPage: true });
    await loadingPage.close();

    const auditExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.meta, { id: 'EVENT-AR14-AUDIT', reportId: 'A-G08-AR14-SUPPLIER-AUDIT', revision: 3 });
      Object.assign(p.info, { buyer: 'A-G08 AR14 Buyer - Fictional', factory: 'A-G08 AR14 Supplier Site - Fictional', supplier: 'A-G08 AR14 Supplier - Fictional', inspector: 'A-G08 AR14 Auditor - Fictional', date: '2026-10-13', kind: 'Supplier Quality Audit' });
      p.stageSuite = StageCatalog.fresh('audit');
      Object.assign(p.stageSuite, { orderKey: 'SUPPLIER-A-G08-AR14', reference: 'FICTIONAL-AUDIT-SCOPE-AR14-REV-1', approvedBy: 'Fictional audit scope reviewer', sampling: 'Recorded local QMS observations only; no certification represented.' });
      p.stageSuite.checks = p.stageSuite.checks.map(check => ({ ...check, status: 'Pass', note: 'Fictional explicit system-area review.' }));
      p.stageSuite.records = [
        { id: 'AUDIT-AR14-MINOR', module: 'audit', identity: 'QMS-AR14-01', area: 'Document control', criterion: 'Fictional approved criterion revision A', observation: 'Controlled copy <revision> mismatch & recorded evidence', severity: 'Minor', owner: 'Fictional document owner', due: '2026-10-20', capa: 'CAPA-AR14-01', verification: 'Fictional local follow-up recorded', reference: 'AUDIT-SOURCE-AR14-01', status: 'Pass', note: 'Recorded review only; no certification.' },
        { id: 'AUDIT-AR14-CRITICAL', module: 'audit', identity: 'QMS-AR14-02', area: 'Needle control', criterion: 'Fictional approved critical-control criterion', observation: 'Critical control gap remains recorded', severity: 'Critical', owner: 'Fictional compliance owner', due: '2026-10-14', capa: 'CAPA-AR14-02', verification: 'Typed supplier statement only', reference: 'AUDIT-SOURCE-AR14-02', status: 'Pass', note: 'Deliberate Critical plus Pass conflict.' },
        { id: 'ACK-AR14-PARTIAL', module: 'acknowledgement', identity: 'Fictional Supplier Representative A', designation: 'Fictional Quality Manager', received: 'Yes', agreement: 'Partial', comments: 'Receipt recorded; one finding disputed', statement: 'Fictional corrective response pending evidence', signature: 'Fictional typed acknowledgement A', timestamp: '2026-10-13 12:00', reference: 'ACK-SOURCE-AR14-01', status: 'Pass', note: 'Receipt is not acceptance or approval.' },
        { id: 'ACK-AR14-DENIED', module: 'acknowledgement', identity: 'Fictional Supplier Representative B', designation: 'Fictional Operations Manager', received: 'No', agreement: 'Disagree', comments: 'Findings not received', statement: 'No accepted corrective response', signature: 'Fictional typed acknowledgement B', timestamp: '2026-10-13 12:30', reference: 'ACK-SOURCE-AR14-02', status: 'Pass', note: 'Deliberate denied receipt must remain unresolved.' }
      ];
      await app.setProject(p);
      app.step = 0;
      app.render();
      return { unchanged: JSON.stringify(app.p), decision: ResultEngine.evaluate(app.p).stageDecision };
    });
    assert.equal(auditExpected.decision, 'NOT CONFORMED', 'AR14 fixture must retain the supplier Critical failure');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="stage-report"]:visible').first().click();
    const auditOption = page.locator('#dialog [name="preset"] option[value="audit"]');
    assert.equal(await auditOption.count(), 1, 'audit-stage Report Studio is missing the AR14 preset');
    assert.equal(await auditOption.textContent(), 'Supplier quality audit', 'AR14 preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('audit');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const auditFrame = page.frameLocator('#reportFrame');
    await auditFrame.locator('h1').filter({ hasText: 'Supplier Quality Audit' }).waitFor({ state: 'visible' });
    const auditText = await auditFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR14-SUPPLIER-AUDIT', 'Audit findings: 2', 'Critical findings: 1', 'Acknowledgements: 2', 'Denied receipt: 1', 'Unresolved records: 2', 'Stage decision: NOT CONFORMED', 'RECORDED REVIEW — NOT CERTIFICATION OR CLOSURE', 'UNRESOLVED — critical finding cannot pass without closure evidence', 'RECORDED RESPONSE PARTIAL — NOT ACCEPTANCE OR APPROVAL', 'UNRESOLVED — findings were not received', 'similar wording does not create a link', 'does not prove finding closure, certification, supplier acceptance']) assert.ok(auditText.includes(expected), `AR14 preview is missing ${expected}`);
    const auditTables = auditFrame.locator('#supplier-audit table');
    assert.equal(await auditTables.count(), 2, 'AR14 report must keep audit findings and acknowledgements in separate tables');
    assert.deepEqual(await auditTables.nth(0).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim()))), [
      ['AUDIT-AR14-MINOR', 'QMS-AR14-01', 'Document control', 'Fictional approved criterion revision A', 'Controlled copy <revision> mismatch & recorded evidence', 'Minor', 'Fictional document owner', '2026-10-20', 'CAPA-AR14-01', 'Fictional local follow-up recorded', 'AUDIT-SOURCE-AR14-01', 'Pass', 'Recorded review only; no certification.', 'RECORDED REVIEW — NOT CERTIFICATION OR CLOSURE'],
      ['AUDIT-AR14-CRITICAL', 'QMS-AR14-02', 'Needle control', 'Fictional approved critical-control criterion', 'Critical control gap remains recorded', 'Critical', 'Fictional compliance owner', '2026-10-14', 'CAPA-AR14-02', 'Typed supplier statement only', 'AUDIT-SOURCE-AR14-02', 'Pass', 'Deliberate Critical plus Pass conflict.', 'UNRESOLVED — critical finding cannot pass without closure evidence']
    ], 'AR14 exact supplier-audit finding rows changed');
    assert.deepEqual(await auditTables.nth(1).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim()))), [
      ['ACK-AR14-PARTIAL', 'Fictional Supplier Representative A', 'Fictional Quality Manager', 'Yes', 'Partial', 'Receipt recorded; one finding disputed', 'Fictional corrective response pending evidence', 'Fictional typed acknowledgement A', '2026-10-13 12:00', 'ACK-SOURCE-AR14-01', 'Pass', 'Receipt is not acceptance or approval.', 'RECORDED RESPONSE PARTIAL — NOT ACCEPTANCE OR APPROVAL'],
      ['ACK-AR14-DENIED', 'Fictional Supplier Representative B', 'Fictional Operations Manager', 'No', 'Disagree', 'Findings not received', 'No accepted corrective response', 'Fictional typed acknowledgement B', '2026-10-13 12:30', 'ACK-SOURCE-AR14-02', 'Pass', 'Deliberate denied receipt must remain unresolved.', 'UNRESOLVED — findings were not received']
    ], 'AR14 exact factory-acknowledgement rows changed');
    assert.equal(await auditFrame.locator('#supplier-audit[role="region"][aria-label="Supplier audit and acknowledgement reconciliation table"][tabindex="0"]').count(), 1, 'AR14 tables are not in a named keyboard-focusable region');
    assert.equal(await auditFrame.locator('#supplier-audit').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR14 wide tables are not contained in their horizontal review region');
    assert.equal(await auditFrame.locator('script').count(), 0, 'AR14 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, auditExpected.unchanged), true, 'AR14 report generation mutated its source project');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '390px AR14 preview causes page-level overflow');
    const auditHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(auditHtml.includes('Controlled copy &lt;revision&gt; mismatch &amp; recorded evidence') && !auditHtml.includes('Controlled copy <revision> mismatch & recorded evidence'), 'AR14 report did not safely escape hostile audit text');
    const auditPage = await context.newPage();
    await auditPage.setViewportSize({ width: 390, height: 844 });
    await auditPage.setContent(auditHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await auditPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR14 report causes page-level overflow');
    await auditPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar14-supplier-audit-390.png'), fullPage: true });
    await auditPage.locator('#supplier-audit').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await auditPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar14-supplier-audit-390-right.png'), fullPage: true });

    const emptyAudit = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.stageSuite = StageCatalog.fresh('audit');
      const before = JSON.stringify(p), html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'audit' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(emptyAudit.unchanged, true, 'empty AR14 report mutated its source project');
    assert.ok(emptyAudit.html.includes('No supplier-audit findings are recorded. This does not prove that the supplier system was audited or found conforming.') && emptyAudit.html.includes('No factory acknowledgement is recorded. This does not prove receipt, agreement or supplier acceptance.'), 'empty AR14 report inferred audit completion or supplier acceptance');
    assert.ok(!/<script\b/i.test(emptyAudit.html), 'empty AR14 report contains executable script');

    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, '1280px AR14 preview causes page-level overflow');
    await auditPage.setViewportSize({ width: 1280, height: 900 });
    await auditPage.locator('#supplier-audit').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await auditPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR14 report causes page-level overflow');
    await auditPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar14-supplier-audit-1280.png'), fullPage: true });
    await auditPage.close();

    const fabricExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.meta, { id: 'EVENT-AR06-FABRIC', reportId: 'A-G08-AR06-FABRIC-ROLL', revision: 2 });
      Object.assign(p.info, { buyer: 'A-G08 AR06 Buyer - Fictional', factory: 'A-G08 AR06 Mill - Fictional', inspector: 'A-G08 AR06 Inspector - Fictional', date: '2026-10-13', kind: 'Fabric Roll Inspection' });
      p.stageSuite = StageCatalog.fresh('fabric');
      Object.assign(p.stageSuite, { orderKey: 'FABRIC-A-G08-AR06', reference: 'FICTIONAL-FABRIC-METHOD-AR06-REV-1', approvedBy: 'Fictional fabric-method reviewer', sampling: 'Two explicitly selected fictional rolls; no population acceptance represented.' });
      p.stageSuite.checks = p.stageSuite.checks.map(check => ({ ...check, status: 'Pass', note: 'Fictional explicit fabric-stage review.' }));
      p.stageSuite.records = [
        { id: 'ROLL-AR06-WITHIN', module: 'roll', identity: 'ROLL-AR06-001', mill: 'Fictional Mill A', batch: 'DYELOT-AR06-A', ticket: 'TICKET-AR06-001', invoice: 100, received: 100, ticketLength: 100, length: 100, widthStart: 150, widthMiddle: 149, widthEnd: 151, basis: '100 m²', limit: 5, method: 'Fictional approved four-point method revision A', sampling: 'Explicit roll one selection', shade: 'SHADE-A', endShade: 'Matched', edgeShade: 'Matched', splices: 0, spliceLocations: 'None recorded', selvedge: 'Recorded even', handle: 'Matched fictional reference', odour: 'None recorded', construction: 'Fictional knit construction', disposition: 'Accept', defects: '10, Hole <small>, 2, 4\n50, Stain & mark, 1, 2', defectReview: 'Complete', reference: 'ROLL-SOURCE-AR06-001', status: 'Pass', note: 'Recorded within the selected limit; not buyer acceptance.' },
        { id: 'ROLL-AR06-OVER', module: 'roll', identity: 'ROLL-AR06-002', mill: 'Fictional Mill A', batch: 'DYELOT-AR06-B', ticket: 'TICKET-AR06-002', invoice: 80, received: 80, ticketLength: 80, length: 80, widthStart: 140, widthMiddle: 140, widthEnd: 141, basis: '100 m²', limit: 3, method: 'Fictional approved four-point method revision A', sampling: 'Explicit roll two selection', shade: 'SHADE-B', endShade: 'Recorded variation', edgeShade: 'Recorded variation', splices: 1, spliceLocations: '42 m', selvedge: 'Recorded uneven section', handle: 'Review pending', odour: 'None recorded', construction: 'Fictional knit construction', disposition: 'Hold', defects: '20, Tear, 2, 4', defectReview: 'Complete', reference: 'ROLL-SOURCE-AR06-002', status: 'Pass', note: 'Deliberate density failure and Hold disposition.' }
      ];
      await app.setProject(p);
      app.step = 0;
      app.render();
      return { unchanged: JSON.stringify(app.p), decision: ResultEngine.evaluate(app.p).stageDecision };
    });
    assert.equal(fabricExpected.decision, 'REJECT / HOLD', 'AR06 fixture must retain the failed fabric-stage decision');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="stage-report"]:visible').first().click();
    const fabricOption = page.locator('#dialog [name="preset"] option[value="fabric-roll"]');
    assert.equal(await fabricOption.count(), 1, 'fabric-stage Report Studio is missing the AR06 preset');
    assert.equal(await fabricOption.textContent(), 'Fabric roll inspection', 'AR06 preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('fabric-roll');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const fabricFrame = page.frameLocator('#reportFrame');
    await fabricFrame.locator('h1').filter({ hasText: 'Fabric Roll Inspection' }).waitFor({ state: 'visible' });
    const fabricText = await fabricFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR06-FABRIC-ROLL', 'Roll records: 2', 'Recorded inspected length: 180 m', 'Assigned points: 10', 'Unresolved rolls: 1', 'Stage decision: REJECT / HOLD', 'RECORDED WITHIN SELECTED LIMIT — NOT BUYER ACCEPTANCE', 'UNRESOLVED — Fabric point density exceeds approved limit; Disposition requires release review', 'not garment AQL', 'does not choose the roll sample or grading method']) assert.ok(fabricText.includes(expected), `AR06 preview is missing ${expected}`);
    const fabricRows = await fabricFrame.locator('#fabric-roll tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim())));
    assert.deepEqual(fabricRows, [
      ['ROLL-AR06-WITHIN', 'ROLL-AR06-001', 'Fictional Mill A', 'DYELOT-AR06-A', 'TICKET-AR06-001', '100', '100', '100', '100', '150', '149', '151', '100 m²', '5', 'Fictional approved four-point method revision A', 'Explicit roll one selection', 'SHADE-A', 'Matched', 'Matched', '0', 'None recorded', 'Recorded even', 'Matched fictional reference', 'None recorded', 'Fictional knit construction', '10, Hole <small>, 2, 4 50, Stain & mark, 1, 2', '6', '4.027', 'Accept', 'ROLL-SOURCE-AR06-001', 'Pass', 'Recorded within the selected limit; not buyer acceptance.', 'RECORDED WITHIN SELECTED LIMIT — NOT BUYER ACCEPTANCE'],
      ['ROLL-AR06-OVER', 'ROLL-AR06-002', 'Fictional Mill A', 'DYELOT-AR06-B', 'TICKET-AR06-002', '80', '80', '80', '80', '140', '140', '141', '100 m²', '3', 'Fictional approved four-point method revision A', 'Explicit roll two selection', 'SHADE-B', 'Recorded variation', 'Recorded variation', '1', '42 m', 'Recorded uneven section', 'Review pending', 'None recorded', 'Fictional knit construction', '20, Tear, 2, 4', '4', '3.571', 'Hold', 'ROLL-SOURCE-AR06-002', 'Pass', 'Deliberate density failure and Hold disposition.', 'UNRESOLVED — Fabric point density exceeds approved limit; Disposition requires release review']
    ], 'AR06 exact fabric-roll reconciliation rows changed');
    assert.equal(await fabricFrame.locator('#fabric-roll[role="region"][aria-label="Fabric roll reconciliation table"][tabindex="0"]').count(), 1, 'AR06 table is not a named keyboard-focusable region');
    assert.equal(await fabricFrame.locator('#fabric-roll').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR06 wide table is not contained in its horizontal review region');
    assert.equal(await fabricFrame.locator('script').count(), 0, 'AR06 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, fabricExpected.unchanged), true, 'AR06 report generation mutated its source project');
    const fabricHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(fabricHtml.includes('Hole &lt;small&gt;') && fabricHtml.includes('Stain &amp; mark') && !fabricHtml.includes('Hole <small>'), 'AR06 report did not safely escape hostile roll text');
    const fabricPage = await context.newPage();
    await fabricPage.setViewportSize({ width: 390, height: 844 });
    await fabricPage.setContent(fabricHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await fabricPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR06 report causes page-level overflow');
    await fabricPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar06-fabric-roll-390.png'), fullPage: true });
    await fabricPage.locator('#fabric-roll').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await fabricPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar06-fabric-roll-390-right.png'), fullPage: true });

    const emptyFabric = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.stageSuite = StageCatalog.fresh('fabric');
      const before = JSON.stringify(p), html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'fabric-roll' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(emptyFabric.unchanged, true, 'empty AR06 report mutated its source project');
    assert.ok(emptyFabric.html.includes('No fabric-roll records are recorded. This does not prove that rolls were selected, inspected, graded or accepted.'), 'empty AR06 report inferred fabric inspection or acceptance');

    await fabricPage.setViewportSize({ width: 1280, height: 900 });
    await fabricPage.locator('#fabric-roll').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await fabricPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR06 report causes page-level overflow');
    await fabricPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar06-fabric-roll-1280.png'), fullPage: true });
    await fabricPage.close();

    const materialsExpected = await page.evaluate(async () => {
      const app = window.__vesaApp;
      app.closeDialog();
      const p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      Object.assign(p.meta, { id: 'EVENT-AR07-MATERIALS', reportId: 'A-G08-AR07-INCOMING-SHADE', revision: 2 });
      Object.assign(p.info, { buyer: 'A-G08 AR07 Buyer - Fictional', factory: 'A-G08 AR07 Factory - Fictional', inspector: 'A-G08 AR07 Inspector - Fictional', date: '2026-10-13', kind: 'Fabric / Accessories Incoming Inspection' });
      p.stageSuite = StageCatalog.fresh('incoming');
      Object.assign(p.stageSuite, { orderKey: 'MATERIAL-A-G08-AR07', reference: 'FICTIONAL-INCOMING-SCOPE-AR07-REV-1', approvedBy: 'Fictional incoming-scope reviewer', sampling: 'Explicit recorded incoming checks; no lot release represented.' });
      p.stageSuite.checks = p.stageSuite.checks.map(check => ({ ...check, status: 'Pass', note: 'Fictional explicit incoming-stage review.' }));
      p.stageSuite.records = [
        { id: 'INCOMING-AR07-COMPLETE', module: 'incoming', identity: 'LOT-AR07-001', path: 'Fabric', supplier: 'Fictional Mill A', po: 'PO-AR07-001', batch: 'BATCH-AR07-A', grn: 'GRN-AR07-001', invoice: 1000, received: 1000, inspected: 100, unit: 'metres', totalRolls: 10, receivedRolls: 10, sampledRolls: 2, weight: 200, length: 1000, width: 150, gsm: 180, construction: 'Fictional knit <construction>', shade: 'SHADE-A', lab: 'Pass', warehouse: 'Fictional dry storage', quarantine: 'Released area pending authority', approver: 'Fictional material reviewer', reference: 'INCOMING-SOURCE-AR07-001', status: 'Pass', note: 'Recorded check only; not material release.' },
        { id: 'INCOMING-AR07-FAILED', module: 'incoming', identity: 'LOT-AR07-002', path: 'Buttons', supplier: 'Fictional Trim Supplier', po: 'PO-AR07-002', batch: 'BATCH-AR07-B', grn: 'GRN-AR07-002', invoice: 500, received: 480, inspected: 490, unit: 'pieces', totalRolls: 0, receivedRolls: 0, sampledRolls: 0, weight: 20, length: 0, width: 0, gsm: 0, construction: 'Fictional trim specification', shade: 'BLACK', lab: 'Fail', warehouse: 'Fictional segregated storage', quarantine: 'HOLD-AR07', approver: 'Fictional material reviewer', reference: 'INCOMING-SOURCE-AR07-002', status: 'Pass', note: 'Deliberate inspected-over-received and laboratory failure.' },
        { id: 'SHADE-AR07-WITHIN', module: 'shade', identity: 'SHADE-AR07-001', standard: 'Fictional approved shade standard A', labdip: 'LABDIP-AR07-A', light: 'Fictional approved light source', lot: 'DYELOT-AR07-A', shade: 'SHADE-A', component: 'Body', endShade: 'Matched', edgeShade: 'Matched', grade: 'Recorded acceptable', method: 'Fictional approved method revision A', delta: 0.8, limit: 1, evaluator: 'Fictional shade evaluator', disposition: 'Accept', reference: 'SHADE-SOURCE-AR07-001', status: 'Pass', note: 'Recorded within selected limit; not buyer approval.' },
        { id: 'SHADE-AR07-OVER', module: 'shade', identity: 'SHADE-AR07-002', standard: 'Fictional approved shade standard A', labdip: 'LABDIP-AR07-B', light: 'Fictional approved light source', lot: 'DYELOT-AR07-B', shade: 'SHADE-B', component: 'Sleeve', endShade: 'Recorded variation', edgeShade: 'Recorded variation', grade: 'Review required', method: 'Fictional approved method revision A', delta: 1.5, limit: 1, evaluator: 'Fictional shade evaluator', disposition: 'Hold', reference: 'SHADE-SOURCE-AR07-002', status: 'Pass', note: 'Deliberate Delta E failure and Hold disposition.' }
      ];
      await app.setProject(p);
      app.step = 0;
      app.render();
      return { unchanged: JSON.stringify(app.p), decision: ResultEngine.evaluate(app.p).stageDecision };
    });
    assert.equal(materialsExpected.decision, 'NOT CONFORMED', 'AR07 fixture must retain incoming and shade failures');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-action="stage-report"]:visible').first().click();
    const materialsOption = page.locator('#dialog [name="preset"] option[value="materials"]');
    assert.equal(await materialsOption.count(), 1, 'incoming-stage Report Studio is missing the AR07 preset');
    assert.equal(await materialsOption.textContent(), 'Incoming materials / shade', 'AR07 preset label changed');
    await page.locator('#dialog [name="preset"]').selectOption('materials');
    await page.locator('#dialog [name="remember"]').uncheck();
    await page.locator('#dialog [data-action="report-preview"]').click();
    const materialsFrame = page.frameLocator('#reportFrame');
    await materialsFrame.locator('h1').filter({ hasText: 'Incoming Materials / Shade' }).waitFor({ state: 'visible' });
    const materialsText = await materialsFrame.locator('body').innerText();
    for (const expected of ['A-G08-AR07-INCOMING-SHADE', 'Incoming records: 2', 'Shade records: 2', 'Unresolved records: 2', 'Stage decision: NOT CONFORMED', 'RECORDED REVIEW — NOT MATERIAL RELEASE', 'UNRESOLVED — incoming laboratory failure; inspected quantity exceeds received', 'RECORDED REVIEW — NOT SHADE APPROVAL', 'UNRESOLVED — Delta E exceeds approved limit; Disposition requires release review', 'missing values remain undefined', 'does not prove buyer acceptance']) assert.ok(materialsText.includes(expected), `AR07 preview is missing ${expected}`);
    const materialTables = materialsFrame.locator('#incoming-materials table');
    assert.equal(await materialTables.count(), 2, 'AR07 report must keep incoming and shade records in separate tables');
    assert.deepEqual(await materialTables.nth(0).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim()))), [
      ['INCOMING-AR07-COMPLETE', 'LOT-AR07-001', 'Fabric', 'Fictional Mill A', 'PO-AR07-001', 'BATCH-AR07-A', 'GRN-AR07-001', '1000', '1000', '0', '100', '-900', 'metres', '10', '10', '2', '200', '1000', '150', '180', 'Fictional knit <construction>', 'SHADE-A', 'Pass', 'Fictional dry storage', 'Released area pending authority', 'Fictional material reviewer', 'INCOMING-SOURCE-AR07-001', 'Pass', 'Recorded check only; not material release.', 'RECORDED REVIEW — NOT MATERIAL RELEASE'],
      ['INCOMING-AR07-FAILED', 'LOT-AR07-002', 'Buttons', 'Fictional Trim Supplier', 'PO-AR07-002', 'BATCH-AR07-B', 'GRN-AR07-002', '500', '480', '-20', '490', '10', 'pieces', '0', '0', '0', '20', '0', '0', '0', 'Fictional trim specification', 'BLACK', 'Fail', 'Fictional segregated storage', 'HOLD-AR07', 'Fictional material reviewer', 'INCOMING-SOURCE-AR07-002', 'Pass', 'Deliberate inspected-over-received and laboratory failure.', 'UNRESOLVED — incoming laboratory failure; inspected quantity exceeds received']
    ], 'AR07 exact incoming-material rows changed');
    assert.deepEqual(await materialTables.nth(1).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.innerText.trim()))), [
      ['SHADE-AR07-WITHIN', 'SHADE-AR07-001', 'Fictional approved shade standard A', 'LABDIP-AR07-A', 'Fictional approved light source', 'DYELOT-AR07-A', 'SHADE-A', 'Body', 'Matched', 'Matched', 'Recorded acceptable', 'Fictional approved method revision A', '0.8', '1', 'Fictional shade evaluator', 'Accept', 'SHADE-SOURCE-AR07-001', 'Pass', 'Recorded within selected limit; not buyer approval.', 'RECORDED REVIEW — NOT SHADE APPROVAL'],
      ['SHADE-AR07-OVER', 'SHADE-AR07-002', 'Fictional approved shade standard A', 'LABDIP-AR07-B', 'Fictional approved light source', 'DYELOT-AR07-B', 'SHADE-B', 'Sleeve', 'Recorded variation', 'Recorded variation', 'Review required', 'Fictional approved method revision A', '1.5', '1', 'Fictional shade evaluator', 'Hold', 'SHADE-SOURCE-AR07-002', 'Pass', 'Deliberate Delta E failure and Hold disposition.', 'UNRESOLVED — Delta E exceeds approved limit; Disposition requires release review']
    ], 'AR07 exact shade-management rows changed');
    assert.equal(await materialsFrame.locator('#incoming-materials[role="region"][aria-label="Incoming materials and shade reconciliation table"][tabindex="0"]').count(), 1, 'AR07 tables are not in a named keyboard-focusable region');
    assert.equal(await materialsFrame.locator('#incoming-materials').evaluate(element => element.scrollWidth > element.clientWidth), true, 'AR07 wide tables are not contained in their horizontal review region');
    assert.equal(await materialsFrame.locator('script').count(), 0, 'AR07 preview contains a script node');
    assert.equal(await page.evaluate(expected => JSON.stringify(window.__vesaApp.p) === expected, materialsExpected.unchanged), true, 'AR07 report generation mutated its source project');
    const materialsHtml = await page.evaluate(() => window.__vesaApp.reportHtml);
    assert.ok(materialsHtml.includes('Fictional knit &lt;construction&gt;') && !materialsHtml.includes('Fictional knit <construction>'), 'AR07 report did not safely escape hostile material text');
    const materialsPage = await context.newPage();
    await materialsPage.setViewportSize({ width: 390, height: 844 });
    await materialsPage.setContent(materialsHtml, { waitUntil: 'domcontentloaded' });
    assert.equal(await materialsPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 390px AR07 report causes page-level overflow');
    await materialsPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar07-incoming-shade-390.png'), fullPage: true });
    await materialsPage.locator('#incoming-materials').evaluate(element => { element.scrollLeft = element.scrollWidth; });
    await materialsPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar07-incoming-shade-390-right.png'), fullPage: true });

    const emptyMaterials = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.stageSuite = StageCatalog.fresh('incoming');
      const before = JSON.stringify(p), html = await ReportComposer.html(p, app.assets, { ...p.report, preset: 'materials' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(emptyMaterials.unchanged, true, 'empty AR07 report mutated its source project');
    assert.ok(emptyMaterials.html.includes('No incoming-material records are recorded. This does not prove receipt, inspection, laboratory review or release.') && emptyMaterials.html.includes('No shade-management records are recorded. This does not prove shade consistency or approval.'), 'empty AR07 report inferred material inspection or shade approval');

    await materialsPage.setViewportSize({ width: 1280, height: 900 });
    await materialsPage.locator('#incoming-materials').evaluate(element => { element.scrollLeft = 0; });
    assert.equal(await materialsPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'standalone 1280px AR07 report causes page-level overflow');
    await materialsPage.screenshot({ path: path.join(outputDir, 'aql-a-g08-ar07-incoming-shade-1280.png'), fullPage: true });
    await materialsPage.close();

    const controlFixtures = [
      {
        stage: 'cutting', preset: 'production-control', label: 'Cutting / IPC / Inline', title: 'Cutting / IPC / Inline', section: 'production-control', reportId: 'A-G08-AR08-CUTTING', decision: 'CONFORMED', review: 'RECORDED REVIEW — NOT BULK OR SEWING RELEASE', metrics: ['Not applicable', 'Not applicable'],
        keys: ['identity','relaxStart','relaxEnd','ply','shade','marker','ratio','tension','endLoss','panel','notches','pairing','numbering','quantity','checked','temperature','pressure','time','defects','release'],
        record: { id:'AR08-CUT-ROW', module:'cutting', identity:'LAY-AR08-001', relaxStart:'08:00', relaxEnd:'10:00', ply:40, shade:'DYELOT-AR08-A', marker:'MARKER-AR08-R2', ratio:'2:2:1', tension:'Recorded aligned', endLoss:1.5, panel:'Chest +1 mm', notches:'Recorded complete', pairing:'Recorded paired', numbering:'SEQ-001-400', quantity:400, checked:40, temperature:'155 C', pressure:'3.2 bar', time:'12 seconds', defects:'Notch <review> & panel mark', release:'Recorded release entry only', reference:'CUT-AR08-SOURCE', status:'Pass', note:'Synthetic cutting row; no sewing release claim.' }
      },
      {
        stage: 'ipc', preset: 'production-control', label: 'Cutting / IPC / Inline', title: 'Cutting / IPC / Inline', section: 'production-control', reportId: 'A-G08-AR08-IPC', decision: 'CONFORMED', review: 'RECORDED REVIEW — NOT BULK OR SEWING RELEASE', metrics: ['Not applicable', 'Not applicable'],
        keys: ['identity','style','line','quantity','sample','pattern','construction','attachments','risk','actions'],
        record: { id:'AR08-IPC-ROW', module:'ipc', identity:'PILOT-AR08-001', style:'STYLE-AR08', line:'LINE-03', quantity:8, sample:'PP-AR08-R1', pattern:'PATTERN-AR08-R2', construction:'Recorded seam construction', attachments:'Folder A / guide B', risk:'Collar alignment', actions:'Adjust guide; verify first 8 pieces', reference:'IPC-AR08-SOURCE', status:'Pass', note:'Synthetic IPC row; no bulk approval claim.' }
      },
      {
        stage: 'inline', preset: 'production-control', label: 'Cutting / IPC / Inline', title: 'Cutting / IPC / Inline', section: 'production-control', reportId: 'A-G08-AR08-INLINE', decision: 'PENDING', review: 'UNRESOLVED — Occurrences cannot be less than defective units; repair exceeds defective', metrics: ['10.000', '12.000'],
        keys: ['identity','date','shift','line','operation','operator','machine','style','color','size','wip','inspected','defective','occurrences','defects','repair','recheck','passRepair','containment','stop','supervisor','capa'],
        record: { id:'AR08-INLINE-ROW', module:'inline', identity:'SLOT-AR08-10AM', date:'2026-10-13', shift:'A', line:'LINE-05', operation:'OP-210', operator:'Fictional operator', machine:'MC-AR08-05', style:'STYLE-AR08', color:'Navy', size:'M', wip:250, inspected:100, defective:12, occurrences:10, defects:'Seam <open> & skip stitch', repair:13, recheck:10, passRepair:9, containment:'Recorded bundle isolation', stop:'Yes', supervisor:'Fictional supervisor', capa:'CAPA-AR08-01', reference:'INLINE-AR08-SOURCE', status:'Pass', note:'Deliberate quantity inconsistency remains pending.' }
      },
      {
        stage: 'endline', preset: 'readiness-control', label: 'Endline & Pre-Final Readiness', title: 'Endline & Pre-Final Readiness', section: 'readiness-control', reportId: 'A-G08-AR09-ENDLINE', decision: 'PENDING', review: 'UNRESOLVED — First-pass accepted + defective must equal inspected; repair exceeds defective', metrics: ['12.000', '10.000', '89.000'],
        keys: ['identity','date','shift','line','style','color','size','inspected','defective','occurrences','firstPass','repair','recheck','passRepair','defects','supervisor','capa'],
        record: { id:'AR09-ENDLINE-ROW', module:'endline', identity:'END-AR09-1400', date:'2026-10-13', shift:'B', line:'LINE-07', style:'STYLE-AR09', color:'Black', size:'L', inspected:100, defective:10, occurrences:12, firstPass:89, repair:11, recheck:10, passRepair:9, defects:'Hem <open> & label issue', supervisor:'Fictional endline supervisor', capa:'CAPA-AR09-01', reference:'ENDLINE-AR09-SOURCE', status:'Pass', note:'Deliberate first-pass reconciliation issue.' }
      },
      {
        stage: 'prefinal', preset: 'readiness-control', label: 'Endline & Pre-Final Readiness', title: 'Endline & Pre-Final Readiness', section: 'readiness-control', reportId: 'A-G08-AR09-PREFINAL', decision: 'NOT READY', review: 'UNRESOLVED — production below approved readiness threshold', metrics: ['-10', '10', 'Not applicable'],
        keys: ['identity','production','packed','minProduction','minPacked','reference','shipment','packingRevision','openIssues','declaration','previous'],
        record: { id:'AR09-PREFINAL-ROW', module:'readiness', identity:'READY-AR09-001', production:80, packed:90, minProduction:90, minPacked:80, reference:'PREFINAL-THRESHOLD-AR09-R1', shipment:1000, packingRevision:'PL-AR09-R3', openIssues:'Open repair <25 pieces> & review', declaration:'Recorded factory declaration only', previous:'PREVIOUS-AR09-REPORT', status:'Pass', note:'Deliberate production threshold failure.', criterion:'unused' }
      }
    ];
    const controlHtml = {};
    for (const fixture of controlFixtures) {
      const observed = await page.evaluate(async fixture => {
        const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
        app.closeDialog();
        Object.assign(p.meta, { id:`EVENT-${fixture.reportId}`, reportId:fixture.reportId, revision:2 });
        Object.assign(p.info, { buyer:`${fixture.reportId} Buyer - Fictional`, factory:`${fixture.reportId} Factory - Fictional`, inspector:`${fixture.reportId} Inspector - Fictional`, date:'2026-10-13', kind:StageCatalog.stages[fixture.stage][0] });
        p.stageSuite = StageCatalog.fresh(fixture.stage);
        Object.assign(p.stageSuite, { orderKey:`ORDER-${fixture.reportId}`, reference:`CRITERIA-${fixture.reportId}`, approvedBy:'Fictional criteria reviewer', sampling:'Explicit fictional current-event coverage only.' });
        p.stageSuite.checks = p.stageSuite.checks.map(check=>({...check,status:'Pass',note:'Explicit fictional checkpoint review.'}));
        p.stageSuite.records=[fixture.record];
        await app.setProject(p); app.step=0; app.render(); app.reportDialog(fixture.preset);
        const option=[...app.dialog.querySelectorAll('[name="preset"] option')].find(node=>node.value===fixture.preset),before=JSON.stringify(app.p),html=await ReportComposer.html(app.p,app.assets,{...app.p.report,preset:fixture.preset}),doc=new DOMParser().parseFromString(html,'text/html'),section=doc.getElementById(fixture.section),row=[...section.querySelectorAll('tbody tr')[0].cells].map(cell=>cell.textContent.trim()),headers=[...section.querySelectorAll('thead th')].map(cell=>cell.textContent.trim());
        return { option:option?.textContent, html, row, headers, decision:ResultEngine.evaluate(app.p).stageDecision, unchanged:before===JSON.stringify(app.p), title:doc.querySelector('h1')?.textContent, scripts:doc.querySelectorAll('script').length };
      }, fixture);
      assert.equal(observed.option, fixture.label, `${fixture.stage} Report Studio preset is missing or renamed`);
      assert.equal(observed.title, fixture.title, `${fixture.stage} dedicated report title changed`);
      assert.equal(observed.decision, fixture.decision, `${fixture.stage} frozen stage decision changed`);
      assert.equal(observed.unchanged, true, `${fixture.stage} report generation mutated its source project`);
      assert.equal(observed.scripts, 0, `${fixture.stage} report contains a script node`);
      assert.deepEqual(observed.row.slice(1,1+fixture.keys.length), fixture.keys.map(key=>String(fixture.record[key])), `${fixture.stage} exact recorded field sequence changed`);
      assert.deepEqual(observed.row.slice(1+fixture.keys.length,1+fixture.keys.length+fixture.metrics.length), fixture.metrics, `${fixture.stage} existing calculated metrics changed`);
      assert.deepEqual(observed.row.slice(-4), [fixture.record.reference,fixture.record.status,fixture.record.note,fixture.review], `${fixture.stage} source/review reconciliation changed`);
      const hostile=Object.values(fixture.record).find(value=>typeof value==='string'&&/[<&>]/.test(value));
      if(hostile)assert.ok(observed.html.includes(hostile.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')), `${fixture.stage} hostile recorded text was not escaped`);
      assert.ok((observed.html.includes('only the copied current')&&observed.html.includes('never merged'))||observed.html.includes('does not read, combine or infer'), `${fixture.stage} report lost its independent-event boundary`);
      controlHtml[fixture.stage]=observed.html;
    }
    for (const [stage,id] of [['inline','production-control'],['prefinal','readiness-control']]) {
      const reportPage=await context.newPage();
      await reportPage.setViewportSize({width:390,height:844});
      await reportPage.setContent(controlHtml[stage],{waitUntil:'domcontentloaded'});
      assert.equal(await reportPage.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${stage} 390px report causes page-level overflow`);
      assert.equal(await reportPage.locator(`#${id}`).evaluate(element=>element.scrollWidth>element.clientWidth),true,`${stage} wide report is not contained in its review region`);
      await reportPage.screenshot({path:path.join(outputDir,`aql-a-g08-${stage}-390.png`),fullPage:true});
      await reportPage.locator(`#${id}`).evaluate(element=>{element.scrollLeft=element.scrollWidth;});
      await reportPage.screenshot({path:path.join(outputDir,`aql-a-g08-${stage}-390-right.png`),fullPage:true});
      await reportPage.setViewportSize({width:1280,height:900});
      await reportPage.locator(`#${id}`).evaluate(element=>{element.scrollLeft=0;});
      assert.equal(await reportPage.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${stage} 1280px report causes page-level overflow`);
      await reportPage.screenshot({path:path.join(outputDir,`aql-a-g08-${stage}-1280.png`),fullPage:true});
      await reportPage.close();
    }
    const emptyControls = await page.evaluate(async () => {
      const app=window.__vesaApp, output=[];
      for(const [stage,preset,text] of [['inline','production-control','No inline records are recorded. This does not prove that the stage was inspected, completed or released.'],['prefinal','readiness-control','No readiness records are recorded. This does not prove endline completion, pre-final readiness or approval.']]){const p=ProjectSchema.fresh('Knit Top / T-Shirt / Polo');p.stageSuite=StageCatalog.fresh(stage);const before=JSON.stringify(p),html=await ReportComposer.html(p,app.assets,{...p.report,preset});output.push({text,html,unchanged:before===JSON.stringify(p)});}return output;
    });
    for(const row of emptyControls){assert.equal(row.unchanged,true,'empty AR08/AR09 report mutated source');assert.ok(row.html.includes(row.text),'empty AR08/AR09 report inferred inspection, readiness or approval');}
    const shareFallback = await page.evaluate(async () => {
      const app=window.__vesaApp,before=JSON.stringify(app.p),downloads=[],shares=[],toasts=[],originalDownload=ProjectTransfer.download,originalToast=app.toast.bind(app);ProjectTransfer.download=(blob,name)=>downloads.push({name,blob});app.toast=message=>toasts.push(message);
      const set=(key,value)=>Object.defineProperty(navigator,key,{configurable:true,value});
      set('share',undefined);set('canShare',undefined);const unsupported=await app.dispatch('share',document.body),unsupportedBytes=await downloads.at(-1).blob.text();
      set('canShare',payload=>payload.files?.length===1&&payload.files[0].type==='text/html');set('share',async payload=>shares.push(payload));const supported=await app.dispatch('share',document.body);
      set('share',async()=>{const error=new Error('cancelled');error.name='AbortError';throw error;});const cancelled=await app.dispatch('share',document.body);
      set('share',async()=>{throw Error('device failure');});const failed=await app.dispatch('share',document.body),failedBytes=await downloads.at(-1).blob.text();
      ProjectTransfer.download=originalDownload;app.toast=originalToast;
      return {before,after:JSON.stringify(app.p),unsupported:{mode:unsupported.mode,name:unsupported.name,bytes:unsupportedBytes,html:unsupported.html},supported:{mode:supported.mode,name:supported.name},cancelled:cancelled.mode,failed:{mode:failed.mode,bytes:failedBytes,html:failed.html},downloads:downloads.map(row=>row.name),share:{title:shares[0]?.title,text:shares[0]?.text,name:shares[0]?.files?.[0]?.name,type:shares[0]?.files?.[0]?.type},toasts};
    });
    assert.equal(shareFallback.before,shareFallback.after,'Share Report changed the current inspection');
    assert.equal(shareFallback.unsupported.mode,'download','unsupported Web Share did not use download fallback');
    assert.equal(shareFallback.unsupported.bytes,shareFallback.unsupported.html,'download fallback bytes differ from generated report');
    assert.equal(shareFallback.supported.mode,'share','supported Web Share did not receive the report file');
    assert.deepEqual(shareFallback.share,{title:'VESA inspection report A-G08-AR09-PREFINAL',text:'Read-only VESA inspection report. Review the result and scope in the attached file.',name:'A-G08-AR09-PREFINAL-buyer.html',type:'text/html'},'Web Share file payload changed');
    assert.equal(shareFallback.cancelled,'cancelled','user cancellation did not remain cancellation');
    assert.equal(shareFallback.failed.mode,'download','failed Web Share did not use download fallback');
    assert.equal(shareFallback.failed.bytes,shareFallback.failed.html,'failed-share fallback bytes differ from generated report');
    assert.deepEqual(shareFallback.downloads,['A-G08-AR09-PREFINAL-buyer.html','A-G08-AR09-PREFINAL-buyer.html'],'share fallback download/cancellation count changed');
    for(const expected of ['report was downloaded','Report handed to the device share menu','Sharing cancelled','It was downloaded instead'])assert.ok(shareFallback.toasts.some(message=>message.includes(expected)),`Share Report feedback is missing ${expected}`);
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G08 STAGE/AR02/AR03/AR04/AR06/AR07/AR08/AR09/AR10/AR12/AR13/AR14 REPORTS PASS: 13 stage routes plus factory follow-up, sampling, Pareto, material-control, production/readiness, reinspection, loading, CAPA and supplier-audit reconciliation at 390/1280; ${path.relative(root, outputDir)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
