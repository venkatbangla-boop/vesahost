/** A-G07 browser proof: current and legacy saved copies restore through the selected-file flow. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-12T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' })[path.extname(file)] || 'application/octet-stream';

function serve() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://vesa.test').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      response.writeHead(200, { 'Content-Type': mime(file), 'Cache-Control': 'no-store' });
      response.end(fs.readFileSync(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  return {
    server,
    start: () => new Promise(resolve => server.listen(0, '127.0.0.1', resolve)),
    stop: () => new Promise(resolve => server.close(resolve)),
  };
}

async function chooseSavedCopy(page, fixture) {
  const chooser = page.waitForEvent('filechooser');
  await page.locator('[data-action="import"]').first().click();
  await (await chooser).setFiles(fixture);
}

async function run() {
  const host = serve();
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vesa-aql-g07-'));
  const currentFile = path.join(fixtureDir, 'current-fictional.vesaproj');
  const legacyFile = path.join(fixtureDir, 'legacy-fictional.aqlproj');
  let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
    const page = await context.newPage();
    const pageErrors = [];
    const external = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
    const enter = page.locator('#vesa-enter');
    if (await enter.count()) await enter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);

    const current = await page.evaluate(async () => {
      const app = window.__vesaApp;
      await app.dispatch('demo', { dataset: { kind: 'apparel' } });
      const finding = app.p.defects[0];
      const carton = app.p.cartons.find(row => row.id === finding.cartonId);
      const unit = app.p.units.find(row => row.code === finding.sampleId);
      const line = app.p.orders.find(row => row.id === finding.lineId);
      if (!finding || !carton || !unit || !line || unit.cartonId !== carton.id || unit.identity?.lot !== SamplingEngine.groupKey(line, app.p.rules)) throw new Error('Fictional evidence-link source fixture is incomplete.');
      const evidence = [];
      for (const fixture of [
        { name: 'a-g07-general-evidence.txt', bytes: 'A-G07 fictional general evidence bytes', owner: 'general', role: 'context', caption: 'A-G07 fictional general restore fixture' },
        { name: 'a-g06-finding-evidence.txt', bytes: 'A-G06 fictional registered-piece finding evidence bytes', owner: finding.id, role: 'close-up', caption: `Registered piece ${unit.code}; carton ${carton.number}; finding ${finding.id}` },
        { name: 'a-g06-carton-evidence.txt', bytes: 'A-G06 fictional selected-carton evidence bytes', owner: carton.id, role: 'approved reference', caption: `Selected carton ${carton.number}; PO ${carton.po}; style ${carton.item}` },
        { name: 'a-g06-lot-evidence.txt', bytes: 'A-G06 fictional frozen-lot evidence bytes', owner: line.id, role: 'test result', caption: `Frozen lot ${unit.identity.lot}; line ${line.id}` },
      ]) evidence.push(await app.assets.add(new File([fixture.bytes], fixture.name, { type: 'text/plain' }), { owner: fixture.owner, role: fixture.role, caption: fixture.caption, key: true }));
      app.store.change('A-G07 fictional current-file fixture', project => {
        project.info.buyer = 'A-G07 Current Buyer - Fictional';
        project.info.factory = 'A-G07 Current Factory - Fictional';
        project.stageSuite = StageCatalog.fresh('inline');
        Object.assign(project.stageSuite, { orderKey: 'PO-G07-FICTIONAL', reference: 'FICTIONAL-CRITERIA-G07', approvedBy: 'Fictional Reviewer', sampling: 'Fictional coverage plan' });
        project.stageSuite.records.push({ id: 'STAGE-G07-FICTIONAL', module: 'inline', identity: 'SLOT-G07-FICTIONAL', date: '2026-10-12', shift: 'Day', line: 'LINE-G07', operation: 'Fictional operation', operator: 'Fictional operator', machine: 'MACHINE-G07', style: 'STYLE-G07', color: 'Blue', size: 'M', wip: '100', inspected: '20', defective: '1', occurrences: '1', defects: 'Fictional seam finding, 1, side seam', repair: '1', recheck: '1', passRepair: '1', containment: 'Fictional containment', stop: 'No', supervisor: 'Fictional supervisor', capa: 'CAPA-G07', reference: 'FICTIONAL-INLINE-CRITERIA-G07', status: 'Pass', note: 'Migration fixture only' });
        project.meta.locked = true;
        project.meta.lockedAt = '2026-10-12T00:00:00.000Z';
        project.rules.confirmed = true;
        project.review.confirmed = true;
        project.review.inspectorName = 'Fictional Inspector';
        project.review.inspectorSignature = 'data:image/png;base64,ZmFrZQ==';
        project.review.factoryName = 'Fictional Factory Signer';
        project.review.factorySignature = 'data:image/png;base64,ZmFrZQ==';
        project.review.signDate = '2026-10-12';
        project.scope.signature = 'fictional-scope-approval';
        project.planApproval.signature = 'fictional-plan-approval';
        project.measurementPlan.signature = 'fictional-measurement-approval';
        project.disposition.status = 'Released';
        project.disposition.basis = 'Fictional fixture only';
        project.assets.push(...evidence);
      });
      await app.autosave.flush();
      const source = JSON.parse(JSON.stringify(app.p));
      const records = await app.repository.list();
      return { pack: await ProjectTransfer.pack(app.p, app.assets), source, ids: records.map(record => record.id), expectedLot: unit.identity.lot };
    });
    fs.writeFileSync(currentFile, JSON.stringify(current.pack));

    await chooseSavedCopy(page, currentFile);
    await page.waitForFunction(sourceId => window.__vesaApp?.p?.meta?.parentId === sourceId, current.source.meta.id);
    const restoredCurrent = await page.evaluate(async sourceId => {
      const app = window.__vesaApp;
      await app.autosave.flush();
      const evidence = [];
      for (const meta of app.p.assets) {
        const record = await app.assets.get(meta.id);
        evidence.push({ meta: JSON.parse(JSON.stringify(meta)), text: await record.blob.text() });
      }
      return { project: JSON.parse(JSON.stringify(app.p)), ids: (await app.repository.list()).map(record => record.id), toast: document.getElementById('toast').textContent, evidence };
    }, current.source.meta.id);
    assert.notEqual(restoredCurrent.project.meta.id, current.source.meta.id, 'current copy must receive a fresh local identity');
    assert.equal(restoredCurrent.project.meta.parentId, current.source.meta.id, 'current copy must retain source provenance');
    assert.equal(restoredCurrent.project.info.buyer, current.source.info.buyer, 'current copy must retain buyer data');
    assert.equal(restoredCurrent.project.info.factory, current.source.info.factory, 'current copy must retain factory data');
    assert.deepEqual(restoredCurrent.project.orders, current.source.orders, 'current copy must retain order rows');
    assert.deepEqual(restoredCurrent.project.defects, current.source.defects, 'current copy must retain findings');
    assert.deepEqual(restoredCurrent.project.measurements, current.source.measurements, 'current copy must retain measurements');
    assert.deepEqual(restoredCurrent.project.cartons, current.source.cartons, 'current copy must retain selected-carton records');
    assert.deepEqual(restoredCurrent.project.units, current.source.units, 'current copy must retain registered piece and frozen lot identities');
    assert.deepEqual(restoredCurrent.project.stageSuite, current.source.stageSuite, 'current copy must retain the selected stage, criteria, checks and records');
    assert.equal(restoredCurrent.project.assets.length, 4, 'current copy must retain every linked evidence record');
    const sourceEvidence = new Map(current.source.assets.map(meta => [meta.name, meta]));
    const restoredEvidence = new Map(restoredCurrent.evidence.map(row => [row.meta.name, row]));
    const expectedBytes = new Map([
      ['a-g07-general-evidence.txt', 'A-G07 fictional general evidence bytes'],
      ['a-g06-finding-evidence.txt', 'A-G06 fictional registered-piece finding evidence bytes'],
      ['a-g06-carton-evidence.txt', 'A-G06 fictional selected-carton evidence bytes'],
      ['a-g06-lot-evidence.txt', 'A-G06 fictional frozen-lot evidence bytes'],
    ]);
    for (const [name, source] of sourceEvidence) {
      const restored = restoredEvidence.get(name);
      assert.ok(restored, `current copy lost ${name}`);
      assert.notEqual(restored.meta.id, source.id, `${name} must receive a fresh asset identity`);
      assert.deepEqual({ ...restored.meta, id: source.id }, source, `${name} metadata other than remapped identity changed`);
      assert.equal(restored.text, expectedBytes.get(name), `${name} verified bytes changed`);
    }
    const sourceFinding = current.source.defects[0];
    const sourceCarton = current.source.cartons.find(row => row.id === sourceFinding.cartonId);
    const sourceUnit = current.source.units.find(row => row.code === sourceFinding.sampleId);
    const sourceLine = current.source.orders.find(row => row.id === sourceFinding.lineId);
    assert.ok(sourceCarton?.selected && sourceUnit?.cartonId === sourceCarton.id, 'source finding lost its selected-carton relationship');
    assert.equal(sourceUnit.identity?.lot, current.expectedLot, 'source registered piece lost its frozen lot relationship');
    assert.equal(restoredEvidence.get('a-g06-finding-evidence.txt').meta.owner, sourceFinding.id, 'finding evidence lost its registered-piece/carton owner chain');
    assert.equal(restoredEvidence.get('a-g06-carton-evidence.txt').meta.owner, sourceCarton.id, 'carton evidence lost its selected-carton owner');
    assert.equal(restoredEvidence.get('a-g06-lot-evidence.txt').meta.owner, sourceLine.id, 'lot evidence lost its source-line owner');
    assert.ok(restoredEvidence.get('a-g06-lot-evidence.txt').meta.caption.includes(sourceUnit.identity.lot), 'lot evidence lost the frozen lot reference');
    assert.equal(restoredCurrent.project.meta.locked, false, 'current copy must be editable');
    assert.equal(restoredCurrent.project.rules.confirmed, false, 'current copy must require rule confirmation');
    assert.equal(restoredCurrent.project.review.confirmed, false, 'current copy must require review confirmation');
    assert.equal(restoredCurrent.project.review.inspectorSignature, '', 'current copy must clear inspector signature');
    assert.equal(restoredCurrent.project.review.factorySignature, '', 'current copy must clear factory signature');
    assert.equal(restoredCurrent.project.scope.signature, '', 'current copy must clear scope approval');
    assert.equal(restoredCurrent.project.planApproval.signature, '', 'current copy must clear plan approval');
    assert.equal(restoredCurrent.project.measurementPlan.signature, '', 'current copy must clear measurement approval');
    assert.equal(restoredCurrent.project.disposition.status, 'Not released', 'current copy must reset release disposition');
    assert.match(restoredCurrent.toast, /Imported as a separate draft/i, 'current copy must explain separate-draft behavior');
    assert.ok(current.ids.every(id => restoredCurrent.ids.includes(id)), 'current import must not replace existing local records');
    assert.ok(restoredCurrent.ids.includes(restoredCurrent.project.meta.id), 'current import must save the new draft independently');

    const legacy = {
      meta: { id: 'LEGACY-AQL-G07-FICTIONAL', reportId: 'LEGACY-G07-FICTIONAL' },
      inspection: { productCategory: 'Knit Top / T-Shirt / Polo', buyer: 'A-G07 Legacy Buyer - Fictional', factory: 'A-G07 Legacy Factory - Fictional', inspector: 'Legacy Fictional Inspector', date: '2026-10-12', measurementUnit: 'cm', type: 'Final random inspection' },
      orderLines: [{ po: 'PO-G07-FICTIONAL', style: 'STYLE-G07', description: 'Fictional knit top', color: 'Blue', size: 'M', orderQty: 1200, shipmentQty: 1000 }],
      aql: { level: 'II', major: '2.5', minor: '4.0', countBasis: 'Occurrences', lotMode: 'Combined' },
      defects: [{ id: 'LEGACY-DEFECT-G07', style: 'STYLE-G07', color: 'Blue', defect: 'Fictional seam finding', severity: 'Major', qty: 2, location: 'Side seam', comment: 'Migration fixture only' }],
      measurements: [{ id: 'LEGACY-MEASURE-G07', style: 'STYLE-G07', pom: 'Chest', spec: 50, minus: 1, plus: 1, actuals: '49.5,50.2,51.4', unit: 'cm', comment: 'Migration fixture only' }],
      productChecks: [{ id: 'LEGACY-CHECK-G07', name: 'Fictional workmanship review', status: 'fail', app: 'required', comment: 'Migration fixture only' }],
      capa: [{ issue: 'Fictional seam finding', action: 'Review fictional sample', owner: 'Fictional owner', due: '2026-10-20', verification: 'Pending' }],
      review: { comments: 'Fictional legacy public note' },
      unsupportedHistoricalField: { retained: 'archive-only-fictional-value' },
    };
    fs.writeFileSync(legacyFile, JSON.stringify(legacy));
    const idsBeforeLegacy = restoredCurrent.ids;

    await chooseSavedCopy(page, legacyFile);
    await page.waitForFunction(() => window.__vesaApp?.p?.info?.buyer === 'A-G07 Legacy Buyer - Fictional', null, { timeout: 10000 }).catch(async error => {
      const state = await page.evaluate(() => ({ parentId: window.__vesaApp?.p?.meta?.parentId, toast: document.getElementById('toast')?.textContent, dialogError: document.getElementById('dialogError')?.textContent }));
      throw new Error(`Legacy selected-file restore did not complete: ${JSON.stringify(state)}`, { cause: error });
    });
    const restoredLegacy = await page.evaluate(async () => {
      const app = window.__vesaApp;
      await app.autosave.flush();
      return { project: JSON.parse(JSON.stringify(app.p)), ids: (await app.repository.list()).map(record => record.id), toast: document.getElementById('toast').textContent };
    });
    assert.notEqual(restoredLegacy.project.meta.id, legacy.meta.id, 'legacy copy must receive a fresh local identity');
    assert.ok(restoredLegacy.project.meta.parentId && restoredLegacy.project.meta.parentId !== restoredLegacy.project.meta.id, 'legacy copy must retain its promoted-source lineage');
    assert.equal(restoredLegacy.project.info.buyer, legacy.inspection.buyer, 'legacy buyer must be promoted');
    assert.equal(restoredLegacy.project.info.factory, legacy.inspection.factory, 'legacy factory must be promoted');
    assert.equal(restoredLegacy.project.orders[0].po, legacy.orderLines[0].po, 'legacy order must be promoted');
    assert.equal(restoredLegacy.project.defects[0].name, legacy.defects[0].defect, 'legacy finding must be promoted');
    assert.equal(restoredLegacy.project.measurements[0].pom, legacy.measurements[0].pom, 'legacy measurement must be promoted');
    assert.equal(restoredLegacy.project.checks[0].status, 'fail', 'legacy check result must be promoted');
    assert.equal(restoredLegacy.project.legacyArchive.meta.id, legacy.meta.id, 'legacy archive must retain the historical source identity');
    assert.equal(restoredLegacy.project.legacyArchive.unsupportedHistoricalField.retained, 'archive-only-fictional-value', 'unsupported legacy data must remain in the archive');
    assert.ok(restoredLegacy.project.audit.some(event => event.action === 'Legacy project migrated' && event.detail?.source === legacy.meta.id), 'migration audit must retain the historical source identity');
    assert.ok(restoredLegacy.project.migrationWarnings.some(text => /Legacy data imported as a new DRAFT/i.test(text)), 'legacy copy must carry migration warnings');
    assert.equal(restoredLegacy.project.meta.locked, false, 'legacy copy must be editable');
    assert.equal(restoredLegacy.project.rules.confirmed, false, 'legacy copy must require rule confirmation');
    assert.equal(restoredLegacy.project.review.confirmed, false, 'legacy copy must require review confirmation');
    assert.equal(restoredLegacy.project.disposition.status, 'Not released', 'legacy copy must not inherit release authority');
    assert.match(restoredLegacy.toast, /Imported as a separate draft/i, 'legacy copy must explain separate-draft behavior');
    assert.ok(idsBeforeLegacy.every(id => restoredLegacy.ids.includes(id)), 'legacy import must not replace existing local records');
    assert.ok(restoredLegacy.ids.includes(restoredLegacy.project.meta.id), 'legacy import must save the migrated draft independently');

    await page.reload({ waitUntil: 'domcontentloaded' });
    const reenter = page.locator('#vesa-enter');
    if (await reenter.count()) await reenter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
    const durableCurrent = await page.evaluate(async id => {
      const app = window.__vesaApp;
      const row = await app.repository.get(id);
      const evidence = [];
      for (const meta of row.project.assets) {
        const record = await app.assets.get(meta.id);
        evidence.push({ meta: JSON.parse(JSON.stringify(meta)), text: await record.blob.text() });
      }
      return { project: JSON.parse(JSON.stringify(row.project)), evidence };
    }, restoredCurrent.project.meta.id);
    assert.deepEqual(durableCurrent.project, restoredCurrent.project, 'browser reload changed the restored current project or evidence links');
    assert.deepEqual(durableCurrent.evidence, restoredCurrent.evidence, 'browser reload changed restored evidence metadata or bytes');
    await page.locator('[data-action="saved"]').click();
    const reopenButton = page.locator(`[data-action="resume"][data-id="${restoredLegacy.project.meta.id}"]`).filter({ hasText: /^Open$/ });
    await reopenButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, restoredLegacy.project.meta.id);
    const reopened = await page.evaluate(() => ({ id: window.__vesaApp.p.meta.id, buyer: window.__vesaApp.p.info.buyer, legacySource: window.__vesaApp.p.legacyArchive?.meta?.id, disposition: window.__vesaApp.p.disposition.status }));
    assert.deepEqual(reopened, { id: restoredLegacy.project.meta.id, buyer: legacy.inspection.buyer, legacySource: legacy.meta.id, disposition: 'Not released' }, 'saved legacy draft must reopen intact after reload');
    assert.deepEqual(pageErrors, [], 'restore flow must have no uncaught page errors');
    assert.deepEqual(external, [], 'restore flow must make no external requests');
    await context.close();
    console.log('AQL A-G06/A-G07 browser restore passed: current + legacy imports, general/finding/carton/lot evidence ownership and exact bytes after reload, fresh identities, provenance, reset approvals, preserved records/archive, zero external requests/page errors');
  } finally {
    if (browser) await browser.close();
    await host.stop().catch(() => {});
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
