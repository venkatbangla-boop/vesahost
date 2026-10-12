/** A-G05 browser proof: an authenticated Final inspection preserves the frozen Major Ac/Re boundary. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright', 'aql-a-g05-final-ac-re-boundary-mobile.png');
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

async function openProject(page, id) {
  let button = page.locator(`[data-action="resume"][data-id="${id}"]:visible`).first();
  if (!await button.count()) {
    await page.locator('#app [data-action="saved"]:visible').first().click();
    button = page.locator(`#dialog [data-action="resume"][data-id="${id}"]:visible`).first();
  }
  await button.click();
  await page.waitForFunction(projectId => window.__vesaApp?.p?.meta?.id === projectId, id);
}

async function addMajorFinding(page, pieceId, name) {
  await page.locator('#app [data-action="add-defect"]:visible').first().click();
  await page.locator('#dialog [name="name"]').fill(name);
  await page.locator('#dialog [name="severity"]').selectOption('Major');
  await page.locator('#dialog [name="qty"]').fill('1');
  await page.locator('#dialog [name="sampleId"]').fill(pieceId);
  await page.locator('#dialog [name="location"]').fill('Front panel');
  await page.locator('#dialog [name="note"]').fill('Fictional A-G05 Ac/Re boundary observation; no production or buyer data.');
  await saveDialog(page);
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
    await page.locator('#dialog [name="buyer"]').fill('A-G05 Final Boundary Buyer - Fictional');
    await page.locator('#dialog [name="factory"]').fill('A-G05 Final Boundary Factory - Fictional');
    await page.locator('#dialog [name="inspector"]').fill('A-G05 Final Boundary Inspector - Fictional');
    await page.locator('#dialog [name="orderKey"]').fill('PO-A-G05-FINAL-BOUNDARY');
    await saveDialog(page);
    await page.waitForFunction(() => window.__vesaApp?.p?.stageSuite?.stage === 'final');

    const prepared = await page.evaluate(() => {
      const app = window.__vesaApp;
      app.store.change('Synthetic approved Final Ac/Re boundary fixture prepared', p => {
        const line = { ...ProjectSchema.order(), po: 'PO-A-G05-FINAL-BOUNDARY', item: 'STYLE-A-G05-BOUNDARY', description: 'Fictional Final AQL fixture only', color: 'NAVY', size: 'M', orderQty: 90, qty: 90, available: 90, allocated: 0, checked: 0, group: '', source: 'Synthetic browser fixture' };
        p.orders = [line];
        Object.assign(p.info, { kind: 'Final random inspection', production: 100, packed: 100, publicNote: 'Synthetic A-G05 boundary fixture only; not buyer approval or shipment release.' });
        Object.assign(p.rules, { groupBy: 'combined', basis: 'units', unitClass: 'highest', level: 'III', plan: 'reference', major: '1.5', minor: '6.5', critical: 0, confirmed: false, reference: 'FICTIONAL-A-G05-APPROVED-PLAN-REV-1', requirePhotos: false });
        p.stageSuite.reference = 'FICTIONAL-FINAL-CRITERIA-REV-1';
        p.stageSuite.approvedBy = 'Fictional Final Criteria Reviewer';
        p.stageSuite.sampling = 'Frozen level III direct-cell plan; 20 fictional pieces from a 90-piece lot';
        p.stageSuite.orderKey = line.po;
        p.scope.referenceRecord = 'FICTIONAL-PO-SPEC-PACKING-REV-1';
        p.scope.traceMode = 'full';
        p.scope.minimumCoverage = 0;
        p.scope.timing = 'manual';
        p.scope.timingReason = 'Synthetic browser fixture; no actual attendance claimed.';
        for (const key of Object.keys(ScopePolicy.LABELS)) p.scope.modules[key] = { mode: 'excluded', reason: 'Fictional A-G05 fixture; this module is not part of the isolated Ac/Re proof.' };
        ScopePolicy.approve(p, 'Fictional Scope Reviewer');
        const plan = SamplingEngine.plan(SamplingEngine.groups(p)[0], p.rules);
        line.allocated = plan.n;
        SampleRegistry.register(p, { lineId: line.id, count: plan.n, role: 'workmanship', prefix: 'AG05', sourceReason: 'Synthetic registered sample for isolated Ac/Re proof' });
        Object.assign(p.planApproval, { standard: 'Limited legacy normal reference', edition: 'Fictional A-G05 fixture revision', scheme: 'Single normal', reference: 'FICTIONAL-A-G05-APPROVED-SOURCE' });
        PlanApproval.approve(p, 'Fictional Plan Reviewer');
      }, { fixture: 'A-G05 Final Ac/Re boundary; fictional data only' });
      app.render();
      const p = app.p, group = SamplingEngine.groups(p)[0], plan = SamplingEngine.plan(group, p.rules), result = ResultEngine.evaluate(p);
      return { id: p.meta.id, lineId: p.orders[0].id, unitIds: p.units.map(unit => unit.code), plan, planApproval: JSON.parse(JSON.stringify(p.planApproval)), result: result.result, failures: result.failures.map(item => item.text), pending: result.pending.map(item => item.text), locked: p.meta.locked, disposition: p.disposition.status };
    });

    assert.deepEqual({ code: prepared.plan.code, n: prepared.plan.n, majorAc: prepared.plan.major, majorRe: prepared.plan.major + 1 }, { code: 'F', n: 20, majorAc: 1, majorRe: 2 }, 'frozen level III / lot 90 / Major 1.5 cell changed');
    assert.equal(prepared.unitIds.length, 20, 'complete inspected sample was not registered');
    assert.ok(prepared.planApproval.signature, 'synthetic plan approval signature is missing');
    assert.equal(prepared.result, 'PENDING', 'unresolved Final controls must remain pending before findings');
    assert.deepEqual(prepared.failures, [], 'zero-defect fixture must not have a workmanship failure');
    assert.equal(prepared.locked, false, 'fixture must remain an editable draft');
    assert.equal(prepared.disposition, 'Not released', 'fixture must not be released');

    await page.locator('#app [data-action="navigate"][data-step="2"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 2);
    await addMajorFinding(page, prepared.unitIds[0], 'Fictional major seam defect A');
    const atAc = await page.evaluate(() => {
      const p = window.__vesaApp.p, result = ResultEngine.evaluate(p), group = result.groups[0];
      return { result: result.result, groupResult: group.result, counts: group.counts, failures: result.failures.map(item => item.text), pending: result.pending.map(item => item.text), signature: p.planApproval.signature };
    });
    assert.equal(atAc.counts.Major, 1, 'first visible Major finding was not counted');
    assert.equal(atAc.groupResult, 'PASS', 'Major count at Ac=1 must pass the workmanship group');
    assert.equal(atAc.result, 'PENDING', 'closing controls must remain pending at the acceptance number');
    assert.ok(!atAc.failures.includes('Combined lot: workmanship acceptance limit exceeded.'), 'Ac=1 incorrectly failed workmanship');
    assert.equal(atAc.signature, prepared.planApproval.signature, 'visible finding entry changed approved plan provenance');

    await addMajorFinding(page, prepared.unitIds[1], 'Fictional major seam defect B');
    const atRe = await page.evaluate(() => {
      const p = window.__vesaApp.p, result = ResultEngine.evaluate(p), group = result.groups[0];
      return { project: JSON.parse(JSON.stringify(p)), result: result.result, groupResult: group.result, counts: group.counts, failures: result.failures.map(item => item.text), pending: result.pending.map(item => item.text), plan: group.plan, signature: p.planApproval.signature };
    });
    assert.equal(atRe.counts.Major, 2, 'second visible Major finding was not counted');
    assert.equal(atRe.groupResult, 'FAIL', 'Major count at Re=2 must fail the workmanship group');
    assert.equal(atRe.result, 'NOT CONFORMED', 'confirmed Re boundary must override pending controls');
    assert.ok(atRe.failures.includes('Combined lot: workmanship acceptance limit exceeded.'), 'explicit workmanship failure reason is missing');
    assert.deepEqual(atRe.pending, atAc.pending, 'the second finding must not hide or invent unrelated pending controls');
    assert.equal(atRe.signature, prepared.planApproval.signature, 'rejection changed approved plan provenance');
    assert.equal(atRe.project.meta.locked, false, 'NOT CONFORMED draft must remain unlocked before closing review');
    assert.equal(atRe.project.disposition.status, 'Not released', 'NOT CONFORMED draft must remain unreleased');

    await page.keyboard.press('Control+s');
    await page.waitForFunction(() => document.getElementById('saveState')?.textContent === 'Saved locally');
    await page.locator('#app [data-action="navigate"][data-step="5"]:visible').first().click();
    await page.waitForFunction(() => window.__vesaApp?.step === 5);
    await page.getByText('NOT CONFORMED', { exact: true }).first().waitFor({ state: 'visible' });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, 'Final boundary review overflows the 390px viewport');

    await page.reload({ waitUntil: 'domcontentloaded' });
    const enterAgain = page.locator('#vesa-enter'); if (await enterAgain.count()) await enterAgain.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
    if (await page.locator('#app [data-action="home"]:visible').count()) {
      await page.locator('#app [data-action="home"]:visible').first().click();
      await page.waitForFunction(() => window.__vesaApp?.step === 'home');
    }
    await openProject(page, prepared.id);
    const reopened = await page.evaluate(() => {
      const p = window.__vesaApp.p, result = ResultEngine.evaluate(p), group = result.groups[0];
      return { project: JSON.parse(JSON.stringify(p)), result: result.result, groupResult: group.result, counts: group.counts, failure: result.failures.map(item => item.text), plan: group.plan };
    });
    assert.deepEqual(reopened.project, atRe.project, 'Final project changed across local save/reload/reopen');
    assert.deepEqual({ code: reopened.plan.code, n: reopened.plan.n, major: reopened.plan.major }, { code: 'F', n: 20, major: 1 }, 'reopened frozen plan changed');
    assert.equal(reopened.counts.Major, 2, 'reopened explicit severity count changed');
    assert.equal(reopened.groupResult, 'FAIL', 'reopened workmanship boundary changed');
    assert.equal(reopened.result, 'NOT CONFORMED', 'reopened overall result changed');
    assert.ok(reopened.failure.includes('Combined lot: workmanship acceptance limit exceeded.'), 'reopened failure reason changed');
    assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    assert.deepEqual(external, [], `unexpected external requests: ${external.join(' | ')}`);
    console.log(`A-G05 FINAL BOUNDARY PASS: code F / n20 / Major Ac1-Re2; visible findings 1=PASS, 2=FAIL; ${path.relative(root, output)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
