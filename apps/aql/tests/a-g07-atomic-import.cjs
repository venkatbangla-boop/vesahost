/** A-G07 browser proof: rejected project/master/sync files leave all local state unchanged. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
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

async function snapshot(page) {
  return page.evaluate(async () => {
    const app = window.__vesaApp;
    const quality = app.companion.master50;
    return {
      project: JSON.stringify(app.p),
      projectIds: (await app.repository.list()).map(row => row.id).sort(),
      masters: JSON.stringify(quality.masters.memory),
      storedMasters: localStorage.getItem(QualityOSStore.KEY),
      pending: [...app.assets.pending.keys()].sort(),
      cache: [...app.assets.cache.keys()].sort(),
    };
  });
}

async function expectUnchanged(page, before, label) {
  await page.waitForTimeout(100);
  const after = await snapshot(page);
  assert.deepEqual(after, before, `${label} changed project, repository, masters, or staged assets`);
}

async function run() {
  const host = serve(); let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
    const page = await context.newPage(); const pageErrors = [], external = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
    const enter = page.locator('#vesa-enter'); if (await enter.count()) await enter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);

    const fixtures = await page.evaluate(async () => {
      const app = window.__vesaApp;
      const project = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      project.info.buyer = 'A-G07 Atomic Buyer - Fictional';
      project.info.factory = 'A-G07 Atomic Factory - Fictional';
      await app.setProject(project); await app.autosave.flush();
      app.companion.master50 ??= new Master50QualityOS(app.companion);
      const quality = app.companion.master50;
      quality.masters.upsert('buyers', { id: 'BUYER-G07-BASE', name: 'A-G07 Existing Buyer - Fictional', market: 'Test', reference: 'BASELINE' });
      const evidence = await app.assets.add(new File(['A-G07 atomic evidence'], 'atomic.txt', { type: 'text/plain' }), { owner: 'general', caption: 'Fictional atomic fixture', key: true });
      app.store.change('Add atomic import fixture evidence', current => current.assets.push(evidence));
      await app.autosave.flush();
      const pack = await ProjectTransfer.pack(app.p, app.assets);
      const duplicateProject = JSON.parse(JSON.stringify(pack)); duplicateProject.files.push(JSON.parse(JSON.stringify(duplicateProject.files[0])));
      const validMasters = quality.masters.export();
      const duplicateMasters = { format: 'VESA360-QUALITYOS-MASTERS', version: 1, data: { buyers: [{ id: 'DUP-G07', name: 'First' }, { id: 'DUP-G07', name: 'Second' }], factories: [], styles: [] } };
      const syncBadMasters = { format: 'VESA360-SYNC-PACK', version: 1, projectPack: pack, masters: duplicateMasters };
      const syncBadProject = { format: 'VESA360-SYNC-PACK', version: 1, projectPack: duplicateProject, masters: validMasters };
      return { duplicateProject, duplicateMasters, syncBadMasters, syncBadProject };
    });
    const baseline = await snapshot(page);

    await page.locator('#projectInput').setInputFiles({ name: 'duplicate.vesaproj', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixtures.duplicateProject)) });
    await page.waitForFunction(() => /Duplicate embedded file identities/i.test(document.getElementById('toast')?.textContent || ''));
    await expectUnchanged(page, baseline, 'duplicate project rejection');

    await page.evaluate(() => window.__vesaApp.companion.master50.mastersView('buyers'));
    await page.locator('#m50-master-import').setInputFiles({ name: 'duplicate.vesamaster', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixtures.duplicateMasters)) });
    await page.waitForFunction(() => /Duplicate master identity/i.test(document.getElementById('dialogError')?.textContent || ''));
    await expectUnchanged(page, baseline, 'duplicate master rejection');

    const malicious = '{"format":"VESA360-QUALITYOS-MASTERS","version":1,"data":{"buyers":[],"factories":[],"styles":[],"__proto__":{"polluted":true}}}';
    await page.locator('#m50-master-import').setInputFiles({ name: 'malicious.vesamaster', mimeType: 'application/json', buffer: Buffer.from(malicious) });
    await page.waitForFunction(() => /unsupported data section/i.test(document.getElementById('dialogError')?.textContent || ''));
    assert.equal(await page.evaluate(() => ({}).polluted), undefined, 'malicious master input polluted Object.prototype');
    await expectUnchanged(page, baseline, 'malicious master rejection');

    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1, 0x20);
    await page.locator('#m50-master-import').setInputFiles({ name: 'oversized.vesamaster', mimeType: 'application/json', buffer: oversized });
    await page.waitForFunction(() => /5 MB file limit/i.test(document.getElementById('dialogError')?.textContent || ''));
    await expectUnchanged(page, baseline, 'oversized master rejection');

    await page.evaluate(() => window.__vesaApp.companion.master50.connected());
    await page.locator('#m50-sync-import').setInputFiles({ name: 'invalid-master.vesasync', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixtures.syncBadMasters)) });
    await page.waitForFunction(() => /Duplicate master identity/i.test(document.getElementById('dialogError')?.textContent || ''));
    await expectUnchanged(page, baseline, 'sync invalid-master rejection');

    await page.locator('#m50-sync-import').setInputFiles({ name: 'invalid-project.vesasync', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixtures.syncBadProject)) });
    await page.waitForFunction(() => /Duplicate embedded file identities/i.test(document.getElementById('dialogError')?.textContent || ''));
    await expectUnchanged(page, baseline, 'sync invalid-project rejection');

    assert.deepEqual(pageErrors, [], 'atomic selected-file rejection must not cause uncaught page errors');
    assert.deepEqual(external, [], 'atomic selected-file rejection must make no external requests');
    await context.close();
    console.log('AQL A-G07 atomic import passed: duplicate project, duplicate/malicious/oversized master, and both invalid sync halves preserved all local state');
  } finally { if (browser) await browser.close(); await host.stop().catch(() => {}); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
