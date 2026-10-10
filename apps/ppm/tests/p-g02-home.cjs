const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-09T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' })[path.extname(file)] || 'application/octet-stream';

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
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/apps/ppm/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof app !== 'undefined' && document.body.classList.contains('at-home'));
    assert.equal(await page.locator('#homeScreen [data-command="new"]').count(), 1);
    assert.equal(await page.locator('#homeScreen [data-command="open-saved"]').count(), 1);
    assert.equal(await page.locator('#homeScreen [data-command="demo"]').count(), 1);
    assert.equal(await page.locator('#homeScreen [data-command="restore"]').count(), 1);
    assert.equal(await page.locator('#homeScreen [data-command="continue"]').count(), 0);
    await page.locator('#homeScreen [data-command="new"]').click();
    await page.locator('#quickStyle').fill('P-G02-HOME-001');
    await page.locator('#quickFactory').fill('QA Factory');
    await page.locator('#quickBuyer').fill('QA Buyer');
    await page.waitForTimeout(700);
    await page.evaluate(async () => app.save(true));
    await page.waitForFunction(() => document.querySelector('.vesa-workspace__saved')?.textContent === 'Saved on this device');
    const recordId = await page.evaluate(() => app.record.id);
    await page.evaluate(async () => { await app.save(true); await app.home(); });
    await page.waitForFunction(() => document.body.classList.contains('at-home'));
    await page.locator('#homeScreen [data-command="open-saved"]').click();
    await page.locator('[data-open-saved]').waitFor();
    assert.equal(await page.locator('[data-open-saved]').count(), 1);
    await page.locator('[data-open-saved]').click();
    await page.waitForFunction(id => !document.body.classList.contains('at-home') && app.record.id === id, recordId);
    assert.equal(await page.locator('#quickStyle').inputValue(), 'P-G02-HOME-001');
    await page.locator('#quickFactory').fill('QA Factory Pending');
    await page.waitForFunction(() => ['Saving…', 'Unsaved changes'].includes(document.querySelector('.vesa-workspace__saved')?.textContent));
    await page.evaluate(async () => app.save(true));
    await page.waitForFunction(() => document.querySelector('.vesa-workspace__saved')?.textContent === 'Saved on this device');
    for (const width of [320, 360, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => app.home());
      await page.waitForFunction(() => document.body.classList.contains('at-home'));
      const homeGeometry = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, actionCount: document.querySelectorAll('#homeScreen .home-cards [data-command]').length }));
      assert.ok(homeGeometry.documentWidth <= width + 1 && homeGeometry.bodyWidth <= width + 1, `home ${width}px overflow`);
      assert.equal(homeGeometry.actionCount, 5, `home ${width}px shared choices`);
      await page.evaluate(() => app.showEditor());
      await page.waitForFunction(() => !document.body.classList.contains('at-home'));
      const editorGeometry = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, sectionPosition: getComputedStyle(document.querySelector('.section-nav-wrap')).position }));
      assert.ok(editorGeometry.documentWidth <= width + 1 && editorGeometry.bodyWidth <= width + 1, `editor ${width}px overflow`);
      assert.equal(editorGeometry.sectionPosition, 'static', `editor ${width}px section navigation should scroll normally`);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => app.home());
    await page.waitForFunction(() => document.body.classList.contains('at-home'));
    await page.evaluate(() => app.changeLanguage('bn'));
    assert.match(await page.locator('[data-sentence="savedHint"]').textContent(), /[\u0980-\u09ff]/);
    await page.locator('[data-vesa-menu="File"]').click();
    assert.equal(await page.locator('#modalBody').getByRole('button', { name: 'Open Saved PPM' }).count(), 1);
    assert.deepEqual(errors, []);
    console.log('PPM P-G02 home proof passed: explicit New/Open Saved/Practice/Open Saved Copy choices, repository-backed saved reopen, Bengali home hint and File handler');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
