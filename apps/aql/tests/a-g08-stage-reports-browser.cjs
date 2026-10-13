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
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G08 STAGE/AR03/AR04 REPORTS PASS: 13 stage routes plus sampling and denominator-safe defect Pareto proof at 390/1280; ${path.relative(root, outputDir)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
