const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output', 'playwright');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-09T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const apps = [
  { id: 'ppm', route: '/apps/ppm/', ready: () => typeof app !== 'undefined' && !!document.querySelector('.vesa-workspace') },
  { id: 'aql', route: '/apps/aql/', ready: () => !!document.querySelector('.vesa-workspace') },
  { id: 'tna', route: '/apps/tna/', ready: () => !!document.querySelector('.vesa-workspace') },
];
const widths = [390, 1280];

function assertPage(condition, message) { assert.ok(condition, message); }
function mime(file) {
  return ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' })[path.extname(file)] || 'application/octet-stream';
}

class MatrixServer {
  async start() {
    this.server = http.createServer((request, response) => {
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
    await new Promise(resolve => this.server.listen(0, '127.0.0.1', resolve));
    this.base = `http://127.0.0.1:${this.server.address().port}`;
  }
  async stop() { await new Promise(resolve => this.server.close(resolve)); }
}

async function inspectPage(page, app, width) {
  await page.waitForFunction(app.ready, null, { timeout: 30000 });
  const shell = page.locator('.vesa-workspace');
  assertPage(await shell.count() === 1, `${app.id}@${width}: exactly one shared workspace shell`);
  assert.deepEqual(await shell.locator('[data-vesa-menu]').allTextContents(), ['Home', 'File', 'Edit', 'View', 'Tools', 'Help'], `${app.id}@${width}: menu order`);
  const result = await page.evaluate(() => {
    const positions = ['.app-user-bar', '.vesa-workspace', '#fileMenu', '.aql-release-menu', '.tna-commandbar', '.topbar', '.sidebar'].map(selector => {
      const el = document.querySelector(selector);
      return { selector, present: !!el, position: el ? getComputedStyle(el).position : '' };
    });
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, positions, lang: document.documentElement.lang, links: { home: document.querySelector('.vesa-workspace__brand')?.getAttribute('href'), app: document.querySelector('.vesa-workspace__app')?.getAttribute('href'), apps: document.querySelector('.app-user-bar a[href="/apps/"]')?.getAttribute('href') } };
  });
  assertPage(result.documentWidth <= width + 1 && result.bodyWidth <= width + 1, `${app.id}@${width}: no horizontal page overflow (${result.documentWidth}/${result.bodyWidth})`);
  assert.equal(result.links.home, '/', `${app.id}@${width}: shared logo returns home`);
  assert.equal(result.links.app, app.route, `${app.id}@${width}: app breadcrumb returns to app route`);
  assert.equal(result.links.apps, '/apps/', `${app.id}@${width}: auth bar returns to App Centre`);
  const activeSticky = result.positions.filter(item => item.present && (item.position === 'sticky' || item.position === 'fixed'));
  assert.deepEqual(activeSticky.map(item => item.selector), ['.vesa-workspace'], `${app.id}@${width}: one sticky navigation region`);

  if (width <= 767) {
    const mobile = page.locator('[data-vesa-mobile-menu]');
    assertPage(await mobile.count() === 1, `${app.id}@${width}: one mobile Menu control`);
    assertPage((await mobile.boundingBox()).height >= 44, `${app.id}@${width}: mobile Menu touch target`);
    await mobile.click();
    assert.equal(await shell.getAttribute('data-menu-open'), 'true', `${app.id}@${width}: Menu opens`);
    assert.equal(await page.evaluate(() => document.activeElement?.matches('[data-vesa-menu]')), true, `${app.id}@${width}: Menu focuses first item`);
    await page.keyboard.press('Escape');
    assert.equal(await shell.getAttribute('data-menu-open'), 'false', `${app.id}@${width}: Escape closes Menu`);
    assert.equal(await page.evaluate(() => document.activeElement?.matches('[data-vesa-mobile-menu]')), true, `${app.id}@${width}: focus returns to Menu`);
  } else {
    assertPage(await shell.locator('[data-vesa-user]').count() === 1, `${app.id}@${width}: shared Settings control`);
    await shell.locator('[data-vesa-user]').click();
    const settings = page.locator('[data-vesa-settings]');
    await settings.waitFor({ state: 'visible' });
    assertPage(await settings.locator('[data-pref-language]').count() === 1, `${app.id}@${width}: central language control`);
    assertPage(await settings.locator('[data-pref-theme]').count() === 1, `${app.id}@${width}: central appearance control`);
    await settings.locator('[data-pref-language]').selectOption('bn');
    await page.waitForFunction(() => document.documentElement.lang === 'bn' && VesaPrefs.read().language === 'bn');
    await settings.locator('[data-pref-theme]').selectOption('pure-mono');
    await page.waitForFunction(() => document.documentElement.dataset.vesaTheme === 'pure-mono' && VesaPrefs.read().theme === 'pure-mono');
    await settings.locator('footer button').click();
    await settings.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.activeElement?.matches('[data-vesa-user]')), true, `${app.id}@${width}: settings focus returns`);
  }
  return result;
}

async function run() {
  const server = new MatrixServer();
  fs.mkdirSync(output, { recursive: true });
  await server.start();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
  const evidence = [];
  try {
    for (const app of apps) for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      await context.addInitScript(value => localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)), session);
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(`${server.base}${app.route}`, { waitUntil: 'domcontentloaded' });
      if (app.id === 'aql') {
        const enter = page.locator('#vesa-enter');
        if (await enter.count()) await enter.click();
      }
      const result = await inspectPage(page, app, width);
      await page.screenshot({ path: path.join(output, `vesa-p-g01-${app.id}-${width}.png`), fullPage: true });
      assert.deepEqual(pageErrors, [], `${app.id}@${width}: no uncaught browser errors`);
      evidence.push({ app: app.id, width, lang: result.lang, pageErrors: pageErrors.length });
      await context.close();
      console.log(`PASS ${app.id}@${width} shared shell, settings/menu, focus, overflow and console`);
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log(`VESA P-G01 shared-shell matrix passed: ${evidence.length}/6 authenticated local browser probes at 390/1280px`);
}

run().catch(error => { console.error(error); process.exitCode = 1; });
