/** A-G07 browser proof: real near-limit selected files fail closed without replacing local state. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const MiB = 1024 * 1024;
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

function writeAll(fd, value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  let offset = 0;
  while (offset < buffer.length) offset += fs.writeSync(fd, buffer, offset, buffer.length - offset);
}

function writeZeroAttachmentProject(file, project, attachmentBytes) {
  const assetId = 'ASSET-G07-REAL-BYTES';
  const source = JSON.parse(JSON.stringify(project));
  source.assets.push({ id: assetId, name: 'a-g07-real-bytes.bin', type: 'application/octet-stream', size: attachmentBytes, kind: 'document', owner: 'general', caption: 'Synthetic boundary bytes', key: false, internal: false, hash: '' });
  const fd = fs.openSync(file, 'w');
  try {
    writeAll(fd, `{"format":"VESA360-PROJECT","version":1,"project":${JSON.stringify(source)},"files":[{"id":"${assetId}","data":"data:application/octet-stream;base64,`);
    const fullGroups = Math.floor(attachmentBytes / 3);
    let chars = fullGroups * 4;
    const chunk = Buffer.alloc(4 * MiB, 0x41);
    while (chars > 0) {
      const count = Math.min(chars, chunk.length);
      writeAll(fd, chunk.subarray(0, count));
      chars -= count;
    }
    const remainder = attachmentBytes % 3;
    if (remainder === 1) writeAll(fd, 'AA==');
    else if (remainder === 2) writeAll(fd, 'AAA=');
    writeAll(fd, '"}]}');
  } finally {
    fs.closeSync(fd);
  }
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

async function heap(page) {
  return page.evaluate(() => performance.memory ? {
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit,
  } : null);
}

function startNodeRssProbe() {
  let peak = process.memoryUsage().rss;
  const timer = setInterval(() => { peak = Math.max(peak, process.memoryUsage().rss); }, 50);
  return () => { clearInterval(timer); return peak; };
}

async function expectUnchanged(page, before, label) {
  await page.waitForTimeout(100);
  assert.deepEqual(await snapshot(page), before, `${label} changed project, repository, masters, or staged assets`);
}

async function run() {
  const host = serve();
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vesa-aql-g07-large-'));
  const decodedLimitFile = path.join(fixtureDir, 'decoded-over-200mib.vesaproj');
  const selectedLimitFile = path.join(fixtureDir, 'selected-over-280mib.vesaproj');
  let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--enable-precise-memory-info'] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
    const page = await context.newPage();
    page.setDefaultTimeout(240000);
    const pageErrors = [], external = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
    const enter = page.locator('#vesa-enter'); if (await enter.count()) await enter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);

    const source = await page.evaluate(async () => {
      const app = window.__vesaApp;
      const project = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      project.info.buyer = 'A-G07 Boundary Buyer - Fictional';
      project.info.factory = 'A-G07 Boundary Factory - Fictional';
      await app.setProject(project); await app.autosave.flush();
      app.companion.master50 ??= new Master50QualityOS(app.companion);
      app.companion.master50.masters.upsert('buyers', { id: 'BUYER-G07-BOUNDARY', name: 'A-G07 Boundary Buyer - Fictional', market: 'Test', reference: 'BOUNDARY' });
      return JSON.parse(JSON.stringify(app.p));
    });
    const baseline = await snapshot(page);

    const decodedBytes = 200 * MiB + 1;
    writeZeroAttachmentProject(decodedLimitFile, source, decodedBytes);
    const decodedFileBytes = fs.statSync(decodedLimitFile).size;
    assert.ok(decodedFileBytes < 280 * MiB, 'decoded-limit fixture must remain below the selected-file limit');
    const heapBeforeDecoded = await heap(page);
    const stopDecodedRss = startNodeRssProbe();
    const decodedStarted = performance.now();
    await page.locator('#projectInput').setInputFiles(decodedLimitFile);
    await page.waitForFunction(() => /Project exceeds the 200 MB import limit/i.test(document.getElementById('toast')?.textContent || ''));
    const decodedElapsedMs = Math.round(performance.now() - decodedStarted);
    const decodedNodePeakRss = stopDecodedRss();
    const heapAfterDecoded = await heap(page);
    await expectUnchanged(page, baseline, 'decoded evidence limit rejection');
    fs.rmSync(decodedLimitFile, { force: true });

    const selectedBytes = 280 * MiB + 1;
    const selectedFd = fs.openSync(selectedLimitFile, 'w');
    fs.ftruncateSync(selectedFd, selectedBytes);
    fs.closeSync(selectedFd);
    const heapBeforeSelected = await heap(page);
    const stopSelectedRss = startNodeRssProbe();
    const selectedStarted = performance.now();
    await page.locator('#projectInput').setInputFiles(selectedLimitFile);
    await page.waitForFunction(() => /Project import exceeds 280 MB file limit/i.test(document.getElementById('toast')?.textContent || ''));
    const selectedElapsedMs = Math.round(performance.now() - selectedStarted);
    const selectedNodePeakRss = stopSelectedRss();
    const heapAfterSelected = await heap(page);
    await expectUnchanged(page, baseline, 'selected file limit rejection');

    assert.deepEqual(pageErrors, [], 'large boundary rejection must not cause uncaught page errors');
    assert.deepEqual(external, [], 'large boundary rejection must make no external requests');
    const evidence = {
      decodedEvidenceBytes: decodedBytes,
      decodedSelectedFileBytes: decodedFileBytes,
      decodedElapsedMs,
      decodedNodePeakRss,
      heapBeforeDecoded,
      heapAfterDecoded,
      selectedFileBytes: selectedBytes,
      selectedElapsedMs,
      selectedNodePeakRss,
      heapBeforeSelected,
      heapAfterSelected,
    };
    await context.close();
    console.log(`AQL A-G07 large import boundary passed: ${JSON.stringify(evidence)}`);
  } finally {
    if (browser) await browser.close();
    await host.stop().catch(() => {});
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
