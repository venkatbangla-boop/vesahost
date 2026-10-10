/**
 * P-G05 rendered follow-up proof.
 * Access: NODE_PATH=<playwright package> CHROMIUM_PATH=<chromium> node this-file
 * Scope: local synthetic record only; no notification, authority or production claim.
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
    await page.evaluate(async () => {
      await app.newRecord();
      app.record.meta.style = 'PG05-FOLLOWUP-UI';
      app.record.meta.po = 'PO-PG05-UI';
      app.record.statuses.O05 = 'ACTION';
      app.record.actions = [{ id:'ACT-PG05-UI', checkpointId:'O05', issue:'Buyer comment remains open.', action:'Confirm disposition with buyer.', owner:'Merchandising', dueDate:'2026-10-10', evidence:'Buyer comment log', status:'In Progress' }];
      app.renderAll();
      app.mutate(false);
      await app.save(true);
      app.command('follow-up');
    });
    await page.locator('#modalTitle').getByText('Follow-Up').waitFor();
    await page.locator('#minutesChair').fill('QA Lead');
    await page.locator('#minutesAgenda').fill('Open buyer comments');
    await page.locator('#minutesDecisions').fill('Hold O05 pending buyer disposition.');
    await page.locator('#minutesNotes').fill('No release override.');
    await page.locator('[data-plan-action="save-minutes"]').click();
    await page.locator('#followupReviewDate').fill('2026-10-12');
    await page.locator('#followupDateSource').fill('Buyer comment log dated 11 Oct 2026');
    await page.locator('[data-plan-action="calculate-aging"]').click();
    assert.match(await page.locator('#followupAgeResult').textContent(), /Overdue · 2 calendar days overdue · Source: Buyer comment log/);
    await page.locator('#escalationLevel').fill('Level 1');
    await page.locator('#escalationOwner').fill('Merchandising Manager');
    await page.locator('#escalationTime').fill('2026-10-12T10:30');
    await page.locator('#escalationNextReview').fill('2026-10-13');
    await page.locator('#escalationReason').fill('Buyer response overdue.');
    await page.locator('[data-plan-action="add-escalation"]').click();
    await page.waitForFunction(() => app.record.actionEscalation.length === 1);
    assert.match(await page.locator('#modalBody').textContent(), /No notification was sent|Recorded escalations/);
    await page.evaluate(() => app.save(true));
    const id = await page.evaluate(() => app.record.id);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && app.record && document.querySelector('.vesa-workspace'));
    await page.evaluate(async recordId => { await app.openRecord(recordId); app.command('follow-up'); }, id);
    await page.locator('#minutesChair').waitFor();
    assert.equal(await page.locator('#minutesChair').inputValue(), 'QA Lead');
    assert.equal(await page.locator('#minutesDecisions').inputValue(), 'Hold O05 pending buyer disposition.');
    assert.match(await page.locator('#modalBody').textContent(), /Level 1 · Merchandising Manager/);
    const geometry = await page.evaluate(() => ({ inner: innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, records: app.record.actionEscalation.length, source: app.record.actionEscalation[0].dateSource, modalLayer: Number(getComputedStyle(document.getElementById('modalBackdrop')).zIndex), shellLayer: Number(getComputedStyle(document.querySelector('.vesa-workspace')).zIndex) }));
    assert.ok(geometry.doc <= 391 && geometry.body <= 391, `390px follow-up must not overflow (${geometry.doc}/${geometry.body})`);
    assert.ok(geometry.modalLayer > geometry.shellLayer, `follow-up dialog must render above the shared shell (${geometry.modalLayer}/${geometry.shellLayer})`);
    assert.equal(geometry.records, 1);
    assert.equal(geometry.source, 'Buyer comment log dated 11 Oct 2026');
    fs.mkdirSync(output, { recursive: true });
    await page.screenshot({ path: path.join(output, 'ppm-p-g05-followup-mobile-390.png') });
    assert.deepEqual(errors, []);
    console.log('PPM P-G05 follow-up UI passed: minutes, explicit aging, escalation, save/reopen, 390px overflow and console');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
