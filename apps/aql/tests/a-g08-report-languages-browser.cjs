/** A-G08 browser proof: central EN/BN/HI/TA preference renders honest localized report chrome only. */
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(root, 'output', 'playwright');
const session = { email: 'qa@vesaent.com', name: 'QA User', role: 'admin', userKey: 'qa-vesaent-com', loginAt: '2026-10-14T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z' };
const mime = file => ({ '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' })[path.extname(file)] || 'application/octet-stream';
const expected = {
  en: ['Report chrome: English.', 'DRAFT - NOT FINALISED'],
  bn: ['রিপোর্টের লিখিত নির্দেশনা: বাংলা।', 'খসড়া — চূড়ান্ত নয়'],
  hi: ['रिपोर्ट की लिखित सूचना: हिन्दी।', 'मसौदा — अंतिम नहीं'],
  ta: ['அறிக்கையின் எழுதப்பட்ட வழிகாட்டல்: தமிழ்.', 'வரைவு — இறுதியல்ல'],
};

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

async function openSettings(page) {
  const user = page.locator('[data-vesa-user]');
  if (!await user.isVisible()) await page.locator('[data-vesa-mobile-menu]').click();
  await user.click();
  const settings = page.locator('[data-vesa-settings]');
  await settings.waitFor({ state: 'visible' });
  return settings;
}

async function run() {
  const host = serve(); let browser;
  try {
    await host.start();
    const base = `http://127.0.0.1:${host.server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(value => { try { localStorage.setItem('vesa.appcentre.session.v1', JSON.stringify(value)); } catch {} }, session);
    const errors = [], external = [];
    context.on('page', page => page.on('pageerror', error => errors.push(error.stack || error.message)));
    context.on('request', request => { if (!request.url().startsWith(base) && !/^(about:blank|data:|blob:)/.test(request.url())) external.push(request.url()); });
    const page = await context.newPage();
    await page.goto(`${base}/apps/aql/`, { waitUntil: 'domcontentloaded' });
    const enter = page.locator('#vesa-enter'); if (await enter.count()) await enter.click();
    await page.waitForFunction(() => !!window.__vesaApp?.repository?.db);

    const source = await page.evaluate(async () => {
      const app = window.__vesaApp, p = app.controls.demo('apparel');
      p.meta.reportId = 'A-G08-LANGUAGE-REPORT';
      p.info.buyer = 'Buyer <North> বাংলা हिन्दी தமிழ்';
      p.info.factory = 'Factory & User Value';
      p.orders[0].po = 'PO-USER-<42>';
      p.defects[0].name = 'User finding & <unchanged>';
      await app.setProject(p);
      app.step = 5; app.render();
      return JSON.stringify(app.p);
    });

    fs.mkdirSync(output, { recursive: true });
    for (const language of ['en', 'bn', 'hi', 'ta']) {
      const settings = await openSettings(page);
      await settings.locator('[data-pref-language]').selectOption(language);
      await settings.locator('footer button').click();
      assert.equal(await page.evaluate(() => JSON.stringify(window.__vesaApp.p)), source, `${language}: central preference mutated inspection data`);

      await page.evaluate(() => window.__vesaApp.reportDialog());
      assert.equal(await page.locator('#dialog [name="language"]').inputValue(), language, `${language}: Report Studio did not inherit central language`);
      await page.locator('#dialog [data-action="report-preview"]').click();
      const frame = page.frameLocator('#reportFrame');
      await frame.locator('body').waitFor({ state: 'visible' });
      assert.equal(await frame.locator('html').getAttribute('lang'), language, `${language}: standalone report language is wrong`);
      assert.equal(await frame.locator('html').getAttribute('data-visual-report'), 'classic', `${language}: report appearance decoration was lost`);
      const text = await frame.locator('body').innerText();
      for (const value of [...expected[language], 'Technical headings and source terms remain in English', 'Buyer <North> বাংলা हिन्दी தமிழ்', 'Factory & User Value', 'PO-USER-<42>', 'User finding & <unchanged>', 'NOT CONFORMED', 'Sampling & acceptance']) assert.ok(text.includes(value), `${language}: report is missing exact value/text: ${value}`);
      assert.equal(await frame.locator('script').count(), 0, `${language}: report contains executable script`);
      assert.equal(await page.evaluate(() => JSON.stringify(window.__vesaApp.p)), source, `${language}: report generation mutated inspection data`);
      const geometry = await frame.locator('html').evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      assert.equal(geometry.scroll > geometry.client, false, `${language}: report page overflows at 390px`);
      await page.screenshot({ path: path.join(output, `aql-a-g08-report-language-${language}-390.png`), fullPage: true });
      await frame.locator('.sheet').screenshot({ path: path.join(output, `aql-a-g08-report-language-${language}-document-390.png`) });
      await page.keyboard.press('Escape');
    }

    const stage = await page.evaluate(async () => {
      const app = window.__vesaApp, p = ProjectSchema.fresh('Knit Top / T-Shirt / Polo');
      p.meta.reportId = 'A-G08-LANGUAGE-STAGE';
      p.info.buyer = 'Stage Buyer বাংলা हिन्दी தமிழ்';
      p.stageSuite = StageCatalog.fresh('cutting');
      p.stageSuite.orderKey = 'PO-STAGE-USER';
      const before = JSON.stringify(p);
      const html = await ReportComposer.html(p, app.assets, { ...p.report, language: 'ta', preset: 'production-control' });
      return { html, unchanged: before === JSON.stringify(p) };
    });
    assert.equal(stage.unchanged, true, 'Tamil stage report mutated its source');
    assert.ok(stage.html.includes('<html lang="ta">') && stage.html.includes(expected.ta[0]) && stage.html.includes('Stage Buyer বাংলা हिन्दी தமிழ்') && stage.html.includes('Approved stage criteria'), 'stage report lost language boundary or exact technical/user values');

    await page.setViewportSize({ width: 1280, height: 900 });
    const settings = await openSettings(page); await settings.locator('[data-pref-language]').selectOption('bn'); await settings.locator('footer button').click();
    await page.evaluate(() => window.__vesaApp.reportDialog()); await page.locator('#dialog [data-action="report-preview"]').click();
    const desktop = page.frameLocator('#reportFrame'); await desktop.locator('body').waitFor({ state: 'visible' });
    assert.equal(await desktop.locator('html').evaluate(element => element.scrollWidth > element.clientWidth), false, 'Bengali report overflows at 1280px');
    await page.screenshot({ path: path.join(output, 'aql-a-g08-report-language-bn-1280.png'), fullPage: true });
    await desktop.locator('.sheet').screenshot({ path: path.join(output, 'aql-a-g08-report-language-bn-document-1280.png') });
    assert.deepEqual(errors, [], 'four-language report browser run has page errors');
    assert.deepEqual(external, [], 'four-language report browser run made external requests');
    console.log('AQL A-G08 four-language rendered report browser checks passed');
  } finally {
    if (browser) await browser.close();
    await host.stop();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
