/** A-G07 browser proof: worker replacement never reloads open tabs or touches records. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const originalWorker = fs.readFileSync(path.join(root, 'apps/aql/service-worker.js'), 'utf8');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-12T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' })[path.extname(file)] || 'application/octet-stream';

class WorkerServer {
  constructor() { this.release = 'old'; }
  worker() {
    const cache = `vesa-aql-test-${this.release}`;
    let source = originalWorker.replace(/vesa-aql-2026-10-14-25/g, cache);
    if (this.release === 'broken') source = source.replace("  './service-worker.js',", "  './service-worker.js',\n  './missing-install-fixture.js',");
    return Buffer.from(source);
  }
  async start() {
    this.server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://vesa.test').pathname);
      if (pathname === '/apps/aql/service-worker.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store' });
        return response.end(this.worker());
      }
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
    await new Promise(resolve => this.server.listen(0, '127.0.0.1', resolve));
    this.base = `http://127.0.0.1:${this.server.address().port}`;
  }
  async stop() { await new Promise(resolve => this.server.close(resolve)); }
}

async function enter(page, base) {
  await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
  const button = page.locator('#vesa-enter');
  if (await button.count()) await button.click();
  await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);
}

async function waitForInstall(page, terminal) {
  return page.evaluate(async terminalState => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
    const worker = registration.installing;
    if (!worker) return registration.active?.state || 'none';
    if (worker.state === terminalState) return worker.state;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Worker did not reach ${terminalState}; last state ${worker.state}`)), 15000);
      worker.addEventListener('statechange', () => {
        if (worker.state === terminalState) { clearTimeout(timeout); resolve(worker.state); }
        if (worker.state === 'redundant' && terminalState !== 'redundant') { clearTimeout(timeout); reject(new Error('Worker became redundant')); }
      });
    });
  }, terminal);
}

async function createUnsaved(page, buyer) {
  return page.evaluate(async value => {
    const app = window.__vesaApp;
    const project = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
    project.info.factory = 'A-G07 Worker Factory - Fictional';
    await app.setProject(project);
    clearTimeout(app.autosave.timer);
    app.autosave.interval = 0;
    app.store.change('A-G07 unsaved worker-update fixture', project => { project.info.buyer = value; });
    clearTimeout(app.autosave.timer);
    return { id: app.p.meta.id, buyer: app.p.info.buyer, dirty: app.autosave.dirty };
  }, buyer);
}

async function run() {
  const host = new WorkerServer();
  let browser;
  try {
    await host.start();
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'allow' });
    await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
    const errors = [];
    const external = [];
    const attach = page => {
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (!request.url().startsWith(host.base)) external.push(request.url()); });
    };

    const first = await context.newPage();
    attach(first);
    await enter(first, host.base);
    await first.waitForFunction(() => !!navigator.serviceWorker.controller);
    await first.waitForFunction(() => caches.keys().then(keys => keys.includes('vesa-aql-test-old')));
    const firstDraft = await createUnsaved(first, 'A-G07 First Unsaved Buyer - Fictional');
    assert.equal(firstDraft.dirty, true, 'first old tab must contain an unsaved edit');

    const second = await context.newPage();
    attach(second);
    await enter(second, host.base);
    await second.waitForFunction(() => !!navigator.serviceWorker.controller);
    const secondDraft = await createUnsaved(second, 'A-G07 Second Unsaved Buyer - Fictional');
    assert.equal(secondDraft.dirty, true, 'second old tab must contain an unsaved edit');

    host.release = 'broken';
    assert.equal(await waitForInstall(first, 'redundant'), 'redundant', 'incomplete worker install must become redundant');
    const failedCaches = await first.evaluate(() => caches.keys());
    assert.ok(failedCaches.includes('vesa-aql-test-old'), 'failed install must retain the complete old cache');
    assert.ok(failedCaches.includes('vesa-aql-test-broken'), 'failed install may leave an inert partial cache for later activation cleanup');
    assert.equal(await first.evaluate(() => window.__vesaApp.p.info.buyer), firstDraft.buyer, 'failed install must retain first-tab unsaved state');
    assert.equal(await second.evaluate(() => window.__vesaApp.p.info.buyer), secondDraft.buyer, 'failed install must retain second-tab unsaved state');
    console.log('PASS incomplete AQL worker installation retains old cache and two unsaved tabs');

    host.release = 'new';
    await first.evaluate(() => {
      window.aqlWorkerChanged = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.aqlWorkerChanged = true; });
    });
    await second.evaluate(() => {
      window.aqlWorkerChanged = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.aqlWorkerChanged = true; });
    });
    await first.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
    await first.waitForFunction(() => window.aqlWorkerChanged === true);
    await second.waitForFunction(() => window.aqlWorkerChanged === true);
    await first.waitForFunction(() => caches.keys().then(keys => keys.includes('vesa-aql-test-new') && !keys.includes('vesa-aql-test-old')));
    assert.equal(await first.evaluate(() => window.__vesaApp.p.info.buyer), firstDraft.buyer, 'successful update must not reload or replace first-tab unsaved state');
    assert.equal(await second.evaluate(() => window.__vesaApp.p.info.buyer), secondDraft.buyer, 'successful update must not reload or replace second-tab unsaved state');
    assert.equal(await first.evaluate(() => window.__vesaApp.autosave.dirty), true, 'first tab must remain explicitly dirty after worker replacement');
    assert.equal(await second.evaluate(() => window.__vesaApp.autosave.dirty), true, 'second tab must remain explicitly dirty after worker replacement');
    console.log('PASS complete AQL worker replacement deletes old shell cache without reloading or mutating open unsaved tabs');

    await first.evaluate(async () => { await window.__vesaApp.autosave.flush(); });
    await context.setOffline(true);
    await first.reload({ waitUntil: 'domcontentloaded' });
    const reenter = first.locator('#vesa-enter');
    if (await reenter.count()) await reenter.click();
    await first.waitForFunction(() => !!window.__vesaApp?.repository?.db);
    await first.locator('[data-action="saved"]').click();
    const saved = first.locator(`#dialog[open] [data-action="resume"][data-id="${firstDraft.id}"]`);
    await saved.evaluate(button => button.click());
    await first.waitForFunction(id => window.__vesaApp?.p?.meta?.id === id, firstDraft.id, { timeout: 10000 }).catch(async error => {
      const state = await first.evaluate(() => ({ id: window.__vesaApp?.p?.meta?.id, toast: document.getElementById('toast')?.textContent, dialogError: document.getElementById('dialogError')?.textContent }));
      throw new Error(`Offline saved-record reopen did not complete: ${JSON.stringify(state)}`, { cause: error });
    });
    assert.equal(await first.evaluate(() => window.__vesaApp.p.info.buyer), firstDraft.buyer, 'saved first-tab edit must reopen from IndexedDB while offline');
    assert.deepEqual(await first.evaluate(() => caches.keys()), ['vesa-aql-test-new'], 'offline reopen must use the complete new shell cache');
    await context.setOffline(false);
    assert.deepEqual(errors, [], 'worker update flow must have no uncaught page errors');
    assert.deepEqual(external, [], 'worker update flow must make no external requests');
    await context.close();
    console.log('AQL A-G07 worker update passed: failed install rollback, two old unsaved tabs preserved, old cache safely replaced, saved draft reopened offline');
  } finally {
    if (browser) await browser.close();
    await host.stop().catch(() => {});
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
