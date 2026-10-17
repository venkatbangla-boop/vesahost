"""VESA Costing 360: real checked-out Login -> App Centre -> Costing browser proof.

Run from a complete repository checkout. All test data are synthetic and local.
Requires Python Playwright and a locally installed Chromium browser.
"""
import base64
import os
import threading
import zipfile
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@contextmanager
def http_repository():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=5)


def require(predicate, label):
    if not predicate:
        raise AssertionError(label)
    print("PASS", label, flush=True)


def record_snapshot(page):
    return page.evaluate("""() => {
      const key = Object.keys(localStorage).find(k => k.startsWith('vesa.costing360.records.v1.'));
      return key ? JSON.parse(localStorage.getItem(key)).records : [];
    }""")


def change_language(page, language):
    page.evaluate("""lang => {
      const next = window.VesaPrefs.write({...window.VesaPrefs.read(), language:lang});
      window.VesaPrefs.apply(next);
      window.dispatchEvent(new Event('vesa-preferences-change'));
    }""", language)


def make_input_workbook(page, margin):
    """Use the REAL vendored SheetJS code and ORIGINAL embedded seven-sheet template."""
    encoded = page.evaluate("""margin => {
      const X = window.XLSX;
      if (!X || typeof X.read !== 'function' || typeof X.write !== 'function')
        throw Error('Real vendored XLSX runtime not loaded');
      const src = document.getElementById('costingExcelTemplate').textContent.replace(/\\s+/g, '');
      const bytes = Uint8Array.from(atob(src), ch => ch.charCodeAt(0));
      const wb = X.read(bytes, {type:'array'});
      if (!wb.Sheets.STYLE_INPUT || !wb.Sheets.COST_LINES || wb.SheetNames.length !== 7)
        throw Error('Original seven-sheet costing template unavailable');
      const style = wb.Sheets.STYLE_INPUT, lines = wb.Sheets.COST_LINES;
      const cells = {
        C7:'SYNTHETIC-STYLE-25', C8:'SYNTHETIC BUYER', C9:'SYNTHETIC FACTORY',
        C10:'Cotton jersey T-shirt', C11:'Bangladesh', C12:1000,
        C13:'China', C14:'100% cotton jersey', C15:180, C16:'GSM',
        C17:120, C18:4, C19:'IN_FOB', C20:margin, C21:'QUOTE-REV-06', C22:'SYNTHETIC TEST ONLY'
      };
      Object.entries(cells).forEach(([a,v]) => {style[a] = {t:typeof v === 'number' ? 'n':'s', v};});
      const values = ['FAB','FABRIC','SYNTHETIC BODY FABRIC','PER_PIECE',0.22,'kg',5,4,'USD',1,'TEST-QUOTE-001',''];
      'ABCDEFGHIJKL'.split('').forEach((c,i) => {lines[c+'7'] = {t:typeof values[i] === 'number'?'n':'s', v:values[i]};});
      return X.write(wb, {bookType:'xlsx', type:'base64', compression:true});
    }""", margin)
    return base64.b64decode(encoded)


def upload_for_command(page, command, path):
    page.locator('.vesa-workspace__nav [data-vesa-menu="File"]').click()
    with page.expect_file_chooser(timeout=12000) as handle:
        page.locator(f'.costing-dialog [data-cmd="{command}"]').click()
    handle.value.set_files(str(path))


def main():
    require((ROOT / 'js/vesa-workspace-shell.js').is_file(), 'Original shared shell exists in full checkout')
    require((ROOT / 'js/auth.js').is_file(), 'Original local login adapter exists in full checkout')
    require((ROOT / 'js/vendor/xlsx.full.min.js').is_file(), 'Licensed offline XLSX asset exists')
    require((ROOT / 'apps/costing/index.html').is_file(), 'Costing HTML exists in full checkout')

    with TemporaryDirectory(prefix='vesa-costing-ci-') as raw_dir, http_repository() as base, sync_playwright() as p:
        tmp = Path(raw_dir)
        args = ['--no-sandbox','--disable-dev-shm-usage']
        executable = os.environ.get('CHROMIUM_EXECUTABLE')
        browser = p.chromium.launch(headless=True, executable_path=executable or None, args=args)
        context = browser.new_context(viewport={'width':1280,'height':850}, accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(15000)
        errors, off_origin = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda req: off_origin.append(req.url) if not req.url.startswith(base+'/') and not req.url.startswith('data:') and not req.url.startswith('blob:') else None)

        page.goto(base+'/apps/costing/', wait_until='domcontentloaded')
        page.wait_for_url('**/login/?*', timeout=18000)
        require('next=' in page.url, 'Costing deep link requires local login')
        page.locator('#email').fill('user@vesa')
        page.locator('#password').fill('vesa')
        page.locator('#loginForm button[type=submit]').click()
        page.wait_for_url('**/apps/costing/', timeout=18000)
        require(page.locator('h1').first.text_content().strip()=='VESA Costing 360', 'Login returns to requested Costing route')
        require(page.locator('.vesa-workspace').count()==1 and page.locator('.app-user-bar').count()==0, 'Exactly one shared VESA header, no duplicate auth bar')
        menu_order=page.locator('.vesa-workspace__nav [data-vesa-menu]').evaluate_all('(xs)=>xs.map(x=>x.dataset.vesaMenu)')
        require(menu_order==['Home','File','Edit','View','Tools','Help'], 'Shared six-menu order')

        page.goto(base+'/apps/', wait_until='domcontentloaded')
        app_tile=page.locator('.app-catalogue a[href="/apps/costing/"]')
        page.wait_for_timeout(350)
        if app_tile.count() != 1:
            detail = page.evaluate("""() => ({url:location.href, catalogue:window.VesaAppCatalogue?.apps?.map(a => ({id:a.id,route:a.route})), cards:[...document.querySelectorAll('.app-catalogue a')].map(a=>({href:a.getAttribute('href'),label:a.textContent})), source:[...document.scripts].map(s=>s.src).filter(Boolean), appCentreHTML:document.getElementById('appCatalogue')?.innerHTML.slice(0,1500)})""")
            raise AssertionError('App Centre Costing tile missing: '+repr(detail)+'; JS errors '+repr(errors))
        require(app_tile.count()==1, 'App Centre registers exactly one Costing 360 tile')
        app_tile.click()
        page.wait_for_url('**/apps/costing/', timeout=18000)
        require(page.locator('.vesa-workspace').count()==1 and page.locator('.app-user-bar').count()==0, 'App Centre -> Costing keeps one global shell')

        page.locator('button[data-cmd="practice"]').click()
        require('1.655200' in page.locator('#costingCurrentSummary').inner_text(), 'Synthetic garment FOB fixtures preserve tested arithmetic')
        page.locator('button[data-cmd="save"]').click()
        snapshot=record_snapshot(page)
        require(len(snapshot)==1, 'First synthetic costing saved in isolated browser storage')

        # UI-only G4 proof: real touch targets and a contained keyboard-accessible
        # comparison grid, without changing the fixture, storage or prices.
        for width in (320, 390, 1440):
            page.set_viewport_size({'width':width,'height':850})
            page.locator('button[data-section="lines"]').click()
            sizes = page.evaluate("""() => {
              const tabs = [...document.querySelectorAll('.costing-section-tabs button')];
              const remove = [...document.querySelectorAll('.costing-line-remove')];
              const table = document.querySelector('.costing-table-scroll');
              return {
                minTabHeight:Math.min(...tabs.map(el => el.getBoundingClientRect().height)),
                minRemoveWidth:Math.min(...remove.map(el => el.getBoundingClientRect().width)),
                minRemoveHeight:Math.min(...remove.map(el => el.getBoundingClientRect().height)),
                tableHasSideScroll:table.scrollWidth>table.clientWidth,
                overflow:document.documentElement.scrollWidth>window.innerWidth+2
              };
            }""")
            require(sizes['minTabHeight'] >= 44 and sizes['minRemoveWidth'] >= 44
                    and sizes['minRemoveHeight'] >= 44,
                    f'{width}px real Costing tabs and remove actions offer 44px touch targets')
            require(sizes['tableHasSideScroll'] and not sizes['overflow'],
                    f'{width}px wide Cost Lines table scrolls locally without page overflow')
        page.set_viewport_size({'width':390,'height':850})
        page.locator('button[data-section="commission"]').click()
        page.locator('button[data-cmd="commissionCompare"]').click()
        region = page.locator('.costing-dialog[open] .costing-table-scroll')
        require(region.count()==1 and region.get_attribute('tabindex')=='0',
                'Commission comparison uses one keyboard-focusable table viewport')
        grid = region.evaluate("""node => ({
          regionWidth:node.getBoundingClientRect().width,
          scrollWidth:node.scrollWidth,
          viewportWidth:window.innerWidth,
          documentOverflow:document.documentElement.scrollWidth>window.innerWidth+2
        })""")
        require(grid['scrollWidth']>grid['regionWidth']
                and grid['regionWidth']<grid['viewportWidth'] and not grid['documentOverflow'],
                '390px commission table scrolls inside its dialog rather than off-screen')
        page.locator('.costing-dialog button[data-cmd="dismiss"]').click()
        page.set_viewport_size({'width':1280,'height':850})
        page.locator('button[data-section="lines"]').click()

        with page.expect_download(timeout=20000) as dl:
            page.locator('button[data-cmd="xlsxExport"]').click()
        report_file=tmp/'synthetic-report.xlsx'
        dl.value.save_as(report_file)
        with zipfile.ZipFile(report_file) as z:
            require('xl/workbook.xml' in z.namelist() and len([x for x in z.namelist() if x.startswith('xl/worksheets/sheet')])>=6, 'Real vendored XLSX exports a readable multi-sheet workbook')

        page.locator('.vesa-workspace__nav [data-vesa-menu="File"]').click()
        with page.expect_download() as dt:
            page.locator('.costing-dialog [data-cmd="template"]').click()
        template_file=tmp/'Costing-Input-Template.xlsx';dt.value.save_as(template_file)
        with zipfile.ZipFile(template_file) as z:
            require('xl/workbook.xml' in z.namelist(), 'Original seven-sheet Excel input template downloads')
        page.locator('.costing-dialog [data-cmd="dismiss"]').click()

        bad=tmp/'invalid-margin.xlsx';bad.write_bytes(make_input_workbook(page,6))
        upload_for_command(page,'xlsxImport',bad)
        # The upload handler imports the XLSX asynchronously; wait for the exact
        # validation result rather than racing the file-reader/DOM notification.
        page.wait_for_function("() => { const node = document.querySelector('#costingToast'); return node && !node.hidden && node.textContent.includes('Margin % must be 0'); }", timeout=12000)
        require('Margin % must be 0' in page.locator('#costingToast').inner_text(), 'Non-zero Excel margin fails closed')
        require(len(record_snapshot(page))==1, 'Invalid Excel import leaves prior saved record intact')

        good=tmp/'approved-no-margin.xlsx';good.write_bytes(make_input_workbook(page,0))
        upload_for_command(page,'xlsxImport',good)
        page.locator('input[data-style="styleNo"]').wait_for(timeout=15000)
        require(page.locator('input[data-style="styleNo"]').input_value()=='SYNTHETIC-STYLE-25', 'Real XLSX import maps style fields correctly')
        recs=record_snapshot(page)
        new=[r for r in recs if r['style']['styleNo']=='SYNTHETIC-STYLE-25']
        require(len(recs)==2 and len(new)==1 and new[0]['style'].get('quotationSourceRevision')=='QUOTE-REV-06', 'Imported workbook remains a separate source-revisioned record')

        page.locator('button[data-section="reports"]').click()
        require(all(page.locator(f'button[data-report="CR{i:02d}"]').count()==1 for i in range(1,8)), 'All seven draft report actions exist')
        with page.expect_popup() as popup:
            page.locator('button[data-report="CR01"]').click()
        report=popup.value
        require('NOT BUYER APPROVED' in report.content(), 'Draft report never implies buyer approval')
        report.close()

        # Every approved draft report must download with its own identity and
        # the explicit non-approval warning; none can silently become a quote.
        for report_id in (f'CR{n:02d}' for n in range(1, 8)):
            with page.expect_download(timeout=20000) as report_download:
                page.locator(f'button[data-report-download="{report_id}"]').click()
            report_path = tmp / f'{report_id}-draft.html'
            report_download.value.save_as(report_path)
            report_text = report_path.read_text(encoding='utf-8')
            require(report_id in report_text and 'NOT BUYER APPROVED' in report_text,
                    f'{report_id} native report download remains a labelled draft')
        with page.expect_popup() as print_preview:
            page.locator('button[data-report="CR07"]').click()
        printable = print_preview.value
        pdf_bytes = printable.pdf(format='A4', print_background=True)
        require(pdf_bytes.startswith(b'%PDF-') and len(pdf_bytes) > 1000,
                'Chromium renders the source and approval report as an A4 PDF')
        printable.close()

        with page.expect_download() as dc:
            page.locator('#costingMain button[data-cmd="download"]').click()
        backup=tmp/'synthetic-record.vesacost';dc.value.save_as(backup)
        require(backup.stat().st_size>100, 'Saved-copy file downloaded locally')
        upload_for_command(page,'copy',backup)
        page.locator('input[data-style="styleNo"]').wait_for(timeout=12000)
        recs=record_snapshot(page)
        source_id=new[0]['recordId']
        require(len(recs)==3 and len({r['recordId'] for r in recs})==3, 'Restored saved copy is a new record; old records preserved')
        require(any(r.get('importedFromRecordId')==source_id for r in recs), 'Saved-copy restore retains original-record reference')

        # A broken selected file must never replace or delete valid local records.
        before_corruption = record_snapshot(page)
        invalid_copy = tmp / 'damaged-copy.vesacost'
        invalid_copy.write_text('This is not a VESA saved copy.', encoding='utf-8')
        upload_for_command(page, 'copy', invalid_copy)
        require(record_snapshot(page) == before_corruption,
                'Invalid saved-copy import preserves all previously saved costings')

        # Use the actual shared Settings controls, not a mocked preferences bar.
        settings_button = page.locator('.vesa-workspace [data-vesa-user]')
        settings_button.click()
        page.locator('.vesa-settings-dialog [data-pref-theme]').select_option('midnight-mono')
        require(page.locator('html').get_attribute('data-dark') == 'true',
                'Actual VESA Settings applies the shared dark theme')
        require(record_snapshot(page) == before_corruption,
                'Theme switching does not change any saved source or quotation')
        page.locator('.vesa-settings-dialog [data-pref-theme]').select_option('clear-blue')
        require(page.locator('html').get_attribute('data-dark') == 'false',
                'Actual VESA Settings restores the shared light theme')
        page.locator('.vesa-settings-dialog button[aria-label="Close settings"]').click()
        require(not page.locator('.vesa-settings-dialog[open]').count(),
                'Settings closes without a second workspace owner')

        # Enter/Escape must reach the real shared File menu and close its dialog.
        file_menu = page.locator('.vesa-workspace__nav [data-vesa-menu="File"]')
        file_menu.focus()
        file_menu.press('Enter')
        require(page.locator('.costing-dialog[open]').count() == 1,
                'Keyboard Enter opens the shared File command dialog')
        page.keyboard.press('Escape')
        require(page.locator('.costing-dialog[open]').count() == 0,
                'Keyboard Escape dismisses the File command dialog')

        for lang in ('bn','hi','ta','en'):
            change_language(page,lang)
            require(page.locator('h1').count()>=1 and page.locator('.vesa-workspace').count()==1, f'{lang.upper()} mode keeps the unified workspace')
        for width in (320,390,640,768,1024,1280):
            page.set_viewport_size({'width':width,'height':850})
            page.locator('button[data-section="style"]').click()
            overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth+2')
            require(not overflow,f'No document-level overflow at {width}px')
        page.set_viewport_size({'width':390,'height':850})
        mobile_menu = page.locator('[data-vesa-mobile-menu]')
        mobile_menu.click()
        require(mobile_menu.get_attribute('aria-expanded') == 'true',
                'Mobile shared menu opens with accessible expanded state')
        page.keyboard.press('Escape')
        require(mobile_menu.get_attribute('aria-expanded') == 'false',
                'Escape closes mobile menu and resets accessible expanded state')
        require(record_snapshot(page) == before_corruption,
                'Reports, settings, languages and viewport changes preserve records')
        # Check the actual root service-worker update on a disposable profile.
        # This catches stale App Centre scripts and missing offline Excel assets.
        page.evaluate("""async () => {
          await navigator.serviceWorker.register('/service-worker.js');
          await navigator.serviceWorker.ready;
        }""")
        page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
        # Compare against the actual checkout's worker version instead of the
        # obsolete Costing launch cache from a previous release.
        import re
        cache_match = re.search(r"const CACHE='([^']+)'", (ROOT / 'service-worker.js').read_text(encoding='utf-8'))
        require(cache_match is not None, 'Root worker declares a versioned local cache')
        require(page.evaluate("(name) => caches.keys().then(keys => keys.includes(name))", cache_match.group(1)),
                'Active root cache matches this Costing candidate and App Centre release')

        context.set_offline(True)
        page.goto(base+'/apps/', wait_until='domcontentloaded', timeout=25000)
        page.locator('.app-catalogue a[href="/apps/costing/"]').wait_for(timeout=12000)
        require(page.locator('.app-catalogue a[href="/apps/costing/"]').count()==1,
                'Offline App Centre still shows exactly one Costing card')
        page.locator('.app-catalogue a[href="/apps/costing/"]').click()
        page.locator('button[data-cmd="resume"]').wait_for(timeout=12000)
        page.locator('button[data-cmd="resume"]').click()
        require(record_snapshot(page)==before_corruption,
                'Offline Costing reopens the same saved synthetic records')
        page.locator('button[data-section="reports"]').click()
        with page.expect_download(timeout=30000) as offline_download:
            page.locator('#costingMain button[data-cmd="xlsxExport"]').nth(1).click()
        offline_workbook=tmp/'offline-draft.xlsx'
        offline_download.value.save_as(offline_workbook)
        with zipfile.ZipFile(offline_workbook) as workbook:
            require('xl/workbook.xml' in workbook.namelist(),
                    'Vendored Excel export works offline after real service-worker installation')
        context.set_offline(False)

        require(not off_origin,'No external network requests during local-only workflow')
        require(not errors,'No uncaught browser JavaScript errors')
        context.close();browser.close()
    print('VESA_COSTING_REAL_INTEGRATION_ACCEPTANCE: PASS',flush=True)


if __name__=='__main__':
    main()