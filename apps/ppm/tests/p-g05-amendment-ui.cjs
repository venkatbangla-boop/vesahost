/**
 * P-G05 controlled amendment UI proof.
 * Access: NODE_PATH=<playwright package> CHROMIUM_PATH=<chromium> node this-file
 * Scope: synthetic finalized local record only; no buyer authorization or production claim.
 */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-11T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css':'text/css', '.html':'text/html', '.js':'application/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.webmanifest':'application/manifest+json', '.ico':'image/x-icon' })[path.extname(file)] || 'application/octet-stream';

async function run() {
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
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/ppm/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && app.record && document.querySelector('.vesa-workspace'));
    const parent = await page.evaluate(async () => {
      await app.newRecord();
      Object.assign(app.record.meta, { style:'PG05-AMENDMENT-UI', po:'PO-PG05-AMEND', buyer:'Synthetic Buyer', factory:'Synthetic Factory' });
      app.record.approvals = [{ id:'APR-PP-UI', label:'PP sample', required:true, status:'Approved', approvedBy:'Buyer QA', date:'2026-10-10', reference:'PP-APPROVED-R1', notes:'Synthetic proof.', photo:'', photoRevision:'REV-PP-1' }];
      app.record.signatures = { factory:{ image:'', name:'Factory signer', designation:'QA', date:'2026-10-10', time:'14:00' } };
      app.record.release = { decision:'GO', notes:'Synthetic finalized parent decision.' };
      app.record.meetingMinutes.acknowledgedAt = '2026-10-10T14:00:00.000Z';
      app.record.locked = true;
      app.renderAll();
      await app.save(true);
      const value = {
        id: app.record.id,
        locked: app.record.locked,
        release: JSON.parse(JSON.stringify(app.record.release)),
        signatures: JSON.parse(JSON.stringify(app.record.signatures)),
        approvals: JSON.parse(JSON.stringify(app.record.approvals)),
        acknowledgedAt: app.record.meetingMinutes.acknowledgedAt
      };
      app.command('amend');
      return value;
    });
    await page.locator('#modalTitle').getByText('Controlled Amendment / Version History').waitFor();
    await page.locator('#amendmentReason').fill('BOM revision changed after the finalized meeting.');
    await page.locator('#amendmentTime').fill('2026-10-11T02:00');
    await page.locator('#createAmendment').click();
    await page.waitForFunction(() => document.getElementById('toast').textContent.includes('Confirm that fresh release'));
    assert.deepEqual(await page.evaluate(() => ({ locked:app.record.locked, versions:app.record.meetingVersions.length, release:app.record.release.decision })), { locked:true, versions:0, release:'GO' });
    await page.locator('#amendmentConfirmed').check();
    await page.locator('#createAmendment').click();
    await page.waitForFunction(() => !app.record.locked && app.record.meetingVersions.length === 1 && document.getElementById('saveState').textContent.startsWith('Saved'));
    await page.locator('#modalTitle').getByText('Controlled Amendment / Version History').waitFor();
    const child = await page.evaluate(() => {
      const version = app.record.meetingVersions[0];
      return {
        id: app.record.id,
        locked: app.record.locked,
        release: JSON.parse(JSON.stringify(app.record.release)),
        signatures: JSON.parse(JSON.stringify(app.record.signatures)),
        approval: JSON.parse(JSON.stringify(app.record.approvals[0])),
        acknowledgedAt: app.record.meetingMinutes.acknowledgedAt,
        version: {
          parentId: version.parentId,
          reason: version.amendmentReason,
          invalidated: JSON.parse(JSON.stringify(version.approvalsInvalidated)),
          snapshotLocked: version.snapshot.locked,
          snapshotRelease: JSON.parse(JSON.stringify(version.snapshot.release)),
          snapshotSignatures: JSON.parse(JSON.stringify(version.snapshot.signatures)),
          snapshotApprovals: JSON.parse(JSON.stringify(version.snapshot.approvals)),
          snapshotAcknowledgedAt: version.snapshot.meetingMinutes.acknowledgedAt,
          nestedVersions: version.snapshot.meetingVersions.length,
          frozen: Object.isFrozen(version.snapshot)
        }
      };
    });
    assert.equal(child.id, parent.id);
    assert.equal(child.locked, false);
    assert.deepEqual(child.release, { decision:'', notes:'' });
    assert.deepEqual(child.signatures, {});
    assert.equal(child.approval.status, 'Pending');
    assert.equal(child.approval.approvedBy, '');
    assert.equal(child.approval.date, '');
    assert.equal(child.approval.reference, '');
    assert.equal(child.approval.photoRevision, '');
    assert.equal(child.acknowledgedAt, '');
    assert.equal(child.version.parentId, '');
    assert.equal(child.version.reason, 'BOM revision changed after the finalized meeting.');
    assert.deepEqual(child.version.invalidated, ['APR-PP-UI']);
    assert.equal(child.version.snapshotLocked, parent.locked);
    assert.deepEqual(child.version.snapshotRelease, parent.release);
    assert.deepEqual(child.version.snapshotSignatures, parent.signatures);
    assert.deepEqual(child.version.snapshotApprovals, parent.approvals);
    assert.equal(child.version.snapshotAcknowledgedAt, parent.acknowledgedAt);
    assert.equal(child.version.nestedVersions, 0);
    assert.equal(child.version.frozen, true);
    assert.match(await page.locator('.amendment-history').textContent(), /Prior finalized version 1/);
    assert.match(await page.locator('.amendment-history').textContent(), /Recorded decision: GO · 1 approval requires fresh evidence/);
    const id = child.id;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && app.record && document.querySelector('.vesa-workspace'));
    await page.evaluate(async recordId => { await app.openRecord(recordId); app.command('amend'); }, id);
    await page.locator('.amendment-history .planning-item').waitFor();
    const reopened = await page.evaluate(() => ({ locked:app.record.locked, release:app.record.release.decision, signatures:Object.keys(app.record.signatures).length, approvalStatus:app.record.approvals[0].status, approvalReference:app.record.approvals[0].reference, versions:app.record.meetingVersions.length, parentId:app.record.meetingVersions[0].parentId, snapshotDecision:app.record.meetingVersions[0].snapshot.release.decision, snapshotFrozen:Object.isFrozen(app.record.meetingVersions[0].snapshot), nestedVersions:app.record.meetingVersions[0].snapshot.meetingVersions.length, modalLayer:Number(getComputedStyle(document.getElementById('modalBackdrop')).zIndex), shellLayer:Number(getComputedStyle(document.querySelector('.vesa-workspace')).zIndex), doc:document.documentElement.scrollWidth, body:document.body.scrollWidth }));
    assert.deepEqual(reopened, { locked:false, release:'', signatures:0, approvalStatus:'Pending', approvalReference:'', versions:1, parentId:'', snapshotDecision:'GO', snapshotFrozen:true, nestedVersions:0, modalLayer:11000, shellLayer:10000, doc:390, body:390 });
    fs.mkdirSync(output, { recursive: true });
    await page.locator('#modalBackdrop .modal').screenshot({ path: path.join(output, 'ppm-p-g05-amendment-history-mobile-390.png') });
    assert.deepEqual(errors, []);
    console.log('PPM P-G05 amendment UI passed: guarded confirmation, immutable finalized snapshot, cleared child sign-off, save/reopen, visible history, 390px overflow and console');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
