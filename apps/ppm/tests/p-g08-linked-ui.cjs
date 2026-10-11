/**
 * P-G08 explicit Linked Records UI proof.
 * Access: NODE_PATH=<playwright package> CHROMIUM_PATH=<chromium> node this-file
 * Scope: synthetic local PPM only; no sibling storage/network or authorization claim.
 */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright');
const session = { email:'qa@vesaent.com', name:'QA User', role:'admin', userKey:'qa-vesaent-com', loginAt:'2026-10-11T00:00:00.000Z', expiresAt:'2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css':'text/css', '.html':'text/html', '.js':'application/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.webmanifest':'application/manifest+json', '.ico':'image/x-icon' })[path.extname(file)] || 'application/octet-stream';

async function run() {
  const workspaceSource = fs.readFileSync(path.join(root, 'apps/ppm/workspace.js'), 'utf8');
  const linkedSlice = workspaceSource.slice(workspaceSource.indexOf('linkedRecords(){'), workspaceSource.indexOf('amendmentMenu(){'));
  for (const forbidden of [/indexedDB/i, /XMLHttpRequest/i, /fetch\s*\(/i, /apps\/(?:tna|aql)/i]) assert.doesNotMatch(linkedSlice, forbidden);

  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://vesa.test').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      response.writeHead(200, { 'Content-Type':mime(file), 'Cache-Control':'no-store' });
      response.end(fs.readFileSync(file));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, headless:true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport:{ width:390, height:844 } });
  await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/ppm/`, { waitUntil:'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && app.record && document.querySelector('.vesa-workspace'));
    const localizedTitles = await page.evaluate(() => ['bn','hi','ta'].map(language => { const service=new LocaleService();service.set(language);return service.sentence('Linked Records','Linked Records'); }));
    assert.match(localizedTitles[0], /[\u0980-\u09ff]/);
    assert.match(localizedTitles[1], /[\u0900-\u097f]/);
    assert.match(localizedTitles[2], /[\u0b80-\u0bff]/);
    await page.evaluate(() => app.locale.set('en'));
    const baseline = await page.evaluate(async () => {
      await app.newRecord();
      Object.assign(app.record.meta, { style:'PG08-LINK-UI', po:'PO-PG08-LINK', buyer:'Synthetic Buyer', factory:'Synthetic Factory' });
      app.record.release = { decision:'HOLD', notes:'Synthetic unchanged release sentinel.' };
      app.renderAll();
      await app.save(true);
      app.menu('Tools');
      return { id:app.record.id, readiness:app.validation.readiness(app.record), release:JSON.parse(JSON.stringify(app.record.release)) };
    });
    await page.locator('[data-command="linked-records"]').click();
    await page.locator('#modalTitle').getByText('Linked Records').waitFor();
    assert.equal(await page.locator('#modalBackdrop .modal').getAttribute('role'), 'dialog');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'modalClose');

    await page.locator('#linkedSourceId').fill('TNA-ORDER-1001');
    await page.locator('#linkedSourceVersion').fill('REV-7');
    await page.locator('#linkedUpdatedAt').fill('2026-10-11T08:15');
    await page.locator('#linkedVerifiedBy').fill('Synthetic Planning Reviewer');
    await page.locator('#linkedVerifiedAt').fill('2026-10-11T09:15');
    await page.locator('#linkedMilestoneId').fill('MS-EX-FACTORY');
    await page.locator('#linkedStyle').fill('STYLE-TNA-1001');
    await page.locator('#linkedPo').fill('PO-TNA-1001');
    await page.locator('#linkedApprovedRevision').fill('APR-REV-3');
    await page.locator('#addLinkedRecord').click();
    await page.waitForFunction(() => app.record.linkedOrders.length === 1 && document.querySelectorAll('.linked-record-card').length === 1);

    await page.locator('#linkedSourceApp').selectOption('aql');
    assert.equal(await page.locator('#linkedTnaFields').isHidden(), true);
    assert.equal(await page.locator('#linkedAqlFields').isVisible(), true);
    await page.locator('#linkedSourceId').fill('AQL-INSPECTION-2002');
    await page.locator('#linkedSourceVersion').fill('R4');
    await page.locator('#linkedVerifiedBy').fill('Synthetic Quality Reviewer');
    await page.locator('#linkedVerifiedAt').fill('2026-10-11T09:25');
    await page.locator('#linkedStage').fill('Final Inspection');
    await page.locator('#linkedReportReference').fill('AQL-REPORT-2002');
    await page.locator('#linkedDecision').fill('NOT CONFORMED');
    await page.locator('#linkedDecisionAt').fill('2026-10-11T09:00');
    await page.locator('#addLinkedRecord').click();
    await page.waitForFunction(() => app.record.linkedOrders.length === 2 && document.querySelectorAll('.linked-record-card').length === 2 && document.getElementById('saveState').textContent.startsWith('Saved'));

    const added = await page.evaluate(() => ({
      readiness:app.validation.readiness(app.record), release:JSON.parse(JSON.stringify(app.record.release)),
      links:JSON.parse(JSON.stringify(app.record.linkedOrders)), doc:document.documentElement.scrollWidth, body:document.body.scrollWidth, inner:innerWidth,
      labelled:[...document.querySelectorAll('.linked-record-editor label')].every(label => label.control && label.textContent.trim()),
      modalName:document.getElementById('modalTitle').textContent
    }));
    assert.deepEqual(added.readiness, baseline.readiness);
    assert.deepEqual(added.release, baseline.release);
    assert.equal(added.links.length, 2);
    assert.equal(added.links[0].details.orderId, 'TNA-ORDER-1001');
    assert.equal(added.links[0].details.milestoneId, 'MS-EX-FACTORY');
    assert.equal(added.links[0].verifiedBy, 'Synthetic Planning Reviewer');
    assert.equal(added.links[1].details.inspectionId, 'AQL-INSPECTION-2002');
    assert.equal(added.links[1].details.recordVersion, 'R4');
    assert.equal(added.links[1].details.decision, 'NOT CONFORMED');
    assert.equal(added.labelled, true);
    assert.equal(added.modalName, 'Linked Records');
    assert.ok(added.doc <= added.inner && added.body <= added.inner, JSON.stringify(added));

    fs.mkdirSync(output, { recursive:true });
    await page.locator('#modalBackdrop .modal').evaluate(element => { element.scrollTop=0; });
    await page.locator('#modalBackdrop .modal').screenshot({ path:path.join(output, 'ppm-p-g08-linked-records-mobile-390.png') });
    const firstId = added.links[0].id;
    await page.reload({ waitUntil:'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && app.record?.id);
    await page.evaluate(recordId => app.openRecord(recordId).then(() => app.command('linked-records')), baseline.id);
    await page.waitForFunction(() => app.record.linkedOrders.length === 2 && document.querySelectorAll('.linked-record-card').length === 2);
    assert.match(await page.locator('.linked-record-list').textContent(), /MS-EX-FACTORY/);
    assert.match(await page.locator('.linked-record-list').textContent(), /AQL-INSPECTION-2002/);
    await page.locator(`[data-linked-remove="${firstId}"]`).click();
    await page.locator('#modalTitle').getByText('Remove this linked record?').waitFor();
    await page.locator('#confirmYes').click();
    await page.waitForFunction(() => app.record.linkedOrders.length === 1 && document.querySelectorAll('.linked-record-card').length === 1 && document.getElementById('saveState').textContent.startsWith('Saved'));

    await page.reload({ waitUntil:'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && app.record?.id);
    const reopened = await page.evaluate(async recordId => {
      await app.openRecord(recordId);
      const value={ readiness:app.validation.readiness(app.record), release:JSON.parse(JSON.stringify(app.record.release)), links:JSON.parse(JSON.stringify(app.record.linkedOrders)) };
      app.record.locked=true;
      await app.save(true);
      app.command('linked-records');
      return value;
    }, baseline.id);
    assert.deepEqual(reopened.readiness, baseline.readiness);
    assert.deepEqual(reopened.release, baseline.release);
    assert.equal(reopened.links.length, 1);
    assert.equal(reopened.links[0].sourceApp, 'aql');
    assert.equal(reopened.links[0].details.inspectionId, 'AQL-INSPECTION-2002');
    assert.equal(await page.locator('#addLinkedRecord').count(), 0);
    assert.equal(await page.locator('[data-linked-remove]').count(), 0);
    assert.match(await page.locator('#modalBody').textContent(), /read-only/i);
    assert.deepEqual(errors, []);
    console.log('PPM P-G08 linked UI passed: Tools entry, explicit TNA/AQL provenance, save/reopen/removal, locked review-only, 390px accessibility, invariant readiness/release and zero sibling access');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => { console.error(error); process.exitCode=1; });
