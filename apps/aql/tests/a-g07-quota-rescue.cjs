/** A-G07 browser proof: quota failure -> labelled partial rescue -> browser restart resume. */
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

async function launch(base, errors, external) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
  await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
  await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
  const enter = page.locator('#vesa-enter');
  if (await enter.count()) await enter.click();
  await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
  return { browser, context, page };
}

async function run() {
  const host = serve();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vesa-aql-quota-'));
  const rescuePath = path.join(tempDir, 'a-g07-partial-rescue.html');
  const errors = [];
  const external = [];
  let firstBrowser;
  let secondBrowser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    const first = await launch(base, errors, external);
    firstBrowser = first.browser;
    const page = first.page;

    const fixture = await page.evaluate(async () => {
      const app = window.__vesaApp;
      const project = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      project.info.buyer = 'A-G07 Pre-Quota Buyer - Fictional';
      project.info.factory = 'A-G07 Quota Factory - Fictional';
      await app.setProject(project);
      await app.autosave.flush();
      const saved = await app.repository.get(app.p.meta.id);

      app.store.change('A-G07 unsaved quota fixture', current => {
        current.info.buyer = 'A-G07 Quota Rescue Buyer - Fictional';
        current.info.publicNote = 'This fictional edit exists only in the failed-save tab until rescued.';
      });
      clearTimeout(app.autosave.timer);
      app.autosave.interval = 0;

      const draft = {
        id: 'DRAFT-A-G07-QUOTA-FICTIONAL',
        sequence: 1,
        projectId: app.p.meta.id,
        title: 'Fictional unfinished CAPA',
        route: { action: 'add-capa', dataset: {} },
        fields: [{ name: 'issue', type: 'text', value: 'Fictional unfinished quota-rescue issue' }],
        context: null,
        files: [],
        at: '2026-10-12T00:00:00.000Z',
      };
      app.companion.journal.remember(draft);
      app.companion.currentDraft = draft;
      app.companion.draftRevision++;
      app.companion.journal.recoveryIncomplete = true;
      app.companion.journal.errorName = 'QuotaExceededError';
      app.companion.journal.error = 'Fictional draft quota failure; in-session draft retained.';
      app.companion.draftError = app.companion.journal.error;

      const targetDb = app.repository.db;
      const originalRun = StorageIO.run;
      StorageIO.run = function(db, stores, mode, work, deadline) {
        if (db === targetDb && mode === 'readwrite' && Array.isArray(stores) && stores.includes('projects')) {
          return Promise.reject(StorageIO.error('QuotaExceededError', 'Fictional quota limit reached during project save.'));
        }
        return originalRun.call(this, db, stores, mode, work, deadline);
      };
      let failure = '';
      try { await app.autosave.flush(); } catch (error) { failure = `${error.name}: ${error.message}`; }
      finally { StorageIO.run = originalRun; }
      app.refreshChrome();
      return {
        id: app.p.meta.id,
        currentBuyer: app.p.info.buyer,
        savedBuyer: saved.project.info.buyer,
        failure,
        durable: app.repository.durable,
        dirty: app.autosave.dirty,
        errorName: app.repository.errorName,
        category: app.saveSafety.diagnosis().deviceDatabase.category,
        protected: app.saveSafety.needsProtection(),
      };
    });
    assert.equal(fixture.currentBuyer, 'A-G07 Quota Rescue Buyer - Fictional', 'failed-save tab must retain the latest edit');
    assert.equal(fixture.savedBuyer, 'A-G07 Pre-Quota Buyer - Fictional', 'failed write must not overwrite the last durable record');
    assert.match(fixture.failure, /QuotaExceededError.*quota limit/i, 'forced quota failure must propagate to the caller');
    assert.equal(fixture.durable, false, 'quota failure must demote the repository from durable mode');
    assert.equal(fixture.dirty, true, 'quota failure must keep the project dirty');
    assert.equal(fixture.errorName, 'QuotaExceededError', 'quota failure name must remain diagnostic');
    assert.equal(fixture.category, 'quota', 'quota failure must receive the actionable quota category');
    assert.equal(fixture.protected, true, 'unverified in-session work must keep departure protection active');
    const warning = await page.locator('#storage-health').innerText();
    assert.match(warning, /in-session work retained/i, 'quota UI must disclose retained in-session work');
    assert.match(warning, /Save inspection HTML/i, 'quota UI must direct the user to portable rescue');

    page.once('dialog', dialog => dialog.accept());
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-action="qc-portable"]').first().click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /PARTIAL-RESCUE/i, 'incomplete draft recovery must label the download as partial rescue');
    await download.saveAs(rescuePath);
    assert.ok(fs.statSync(rescuePath).size > 1000000, 'partial rescue must contain the portable application and inspection payload');
    const rescueText = fs.readFileSync(rescuePath, 'utf8');
    assert.match(rescueText, /PARTIAL RECOVERY SNAPSHOT|recovery/i, 'partial rescue must embed an incomplete-recovery warning');
    assert.ok(rescueText.includes('A-G07 Quota Rescue Buyer - Fictional'), 'partial rescue must contain the latest in-session project state');
    assert.ok(rescueText.includes('Fictional unfinished quota-rescue issue'), 'partial rescue must contain the available unfinished draft');

    await page.locator('[data-action="qc-save-centre"]').first().click();
    await page.locator('[data-qc-upload="verify-backup"]').setInputFiles(rescuePath);
    await page.waitForFunction(() => /explicitly partial rescue snapshot/i.test(document.getElementById('dialogError')?.textContent || ''));
    assert.equal(await page.evaluate(() => window.__vesaApp.saveSafety.externalCurrent()), false, 'partial rescue must not be accepted as a complete verified backup');
    assert.equal(await page.evaluate(() => window.__vesaApp.saveSafety.needsProtection()), true, 'partial rescue must not clear departure protection');
    console.log('PASS forced quota keeps latest state in-session, preserves older durable row and emits only an explicitly partial rescue');

    await first.context.close();
    await first.browser.close();
    firstBrowser = null;

    const second = await launch(base, errors, external);
    secondBrowser = second.browser;
    const restarted = second.page;
    assert.equal(await restarted.evaluate(async () => (await window.__vesaApp.repository.list()).length), 0, 'fresh restarted browser must not inherit the disposable device database');
    await restarted.locator('[data-action="qc-save-centre"]').first().click();
    await restarted.locator('[data-qc-upload="resume"]').setInputFiles(rescuePath);
    await restarted.waitForFunction(() => /Resume this inspection/i.test(document.getElementById('dialogTitle')?.textContent || ''));
    const resumeText = await restarted.locator('#dialogBody').innerText();
    assert.match(resumeText, /PARTIAL RECOVERY SNAPSHOT/i, 'restart preview must disclose partial recovery before resume');
    assert.match(resumeText, /A-G07 Quota Rescue Buyer - Fictional/i, 'restart preview must identify the rescued project');
    await restarted.locator('[data-action="qc-resume-file"]').click();
    await restarted.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, fixture.id);
    await restarted.waitForFunction(() => window.__vesaApp?.companion?.journal?.recoveryIncomplete === true);
    const resumed = await restarted.evaluate(() => {
      const app = window.__vesaApp;
      const drafts = app.companion.journal.available(app.p.meta.id);
      return {
        id: app.p.meta.id,
        buyer: app.p.info.buyer,
        note: app.p.info.publicNote,
        disposition: app.p.disposition.status,
        draftCount: drafts.length,
        draftValue: drafts[0]?.fields?.[0]?.value,
        recoveryIncomplete: app.companion.journal.recoveryIncomplete,
        rescueNote: app.companion.draftRescueNote,
        externalCurrent: app.saveSafety.externalCurrent(),
      };
    });
    assert.deepEqual(resumed, {
      id: fixture.id,
      buyer: 'A-G07 Quota Rescue Buyer - Fictional',
      note: 'This fictional edit exists only in the failed-save tab until rescued.',
      disposition: 'Not released',
      draftCount: 1,
      draftValue: 'Fictional unfinished quota-rescue issue',
      recoveryIncomplete: true,
      rescueNote: 'Some device drafts could not be verified. This rescue includes confirmed inspection records and only the unfinished drafts available in this tab. Fictional draft quota failure; in-session draft retained.',
      externalCurrent: false,
    }, 'restart resume must preserve current project/draft data while retaining the incomplete-recovery warning');
    assert.deepEqual(errors, [], 'quota/restart flow must have no uncaught page errors');
    assert.deepEqual(external, [], 'quota/restart flow must make no external requests');
    await second.context.close();
    await second.browser.close();
    secondBrowser = null;
    console.log('AQL A-G07 quota rescue passed: forced quota demotion, labelled partial HTML, rejected complete verification, full browser restart resume with warning');
  } finally {
    if (firstBrowser) await firstBrowser.close();
    if (secondBrowser) await secondBrowser.close();
    await host.stop().catch(() => {});
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
