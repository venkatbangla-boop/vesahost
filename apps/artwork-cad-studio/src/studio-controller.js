/**
 * SVG Studio owns one content iframe and delegates global navigation to VESA.
 * No application data or buyer files are sent to remote services.
 */
class VesaArtworkStudio {
  constructor(doc) {
    this.doc = doc;
    this.frame = doc.getElementById('svgEditFrame');
    this.status = doc.getElementById('artworkStatus');
    this.ready = false;
  }
  /** Mount platform shell and watch the locally installed editor frame. */
  mount() {
    const s = window.VesaAuth.session();
    const Shell = window.VesaWorkspaceShell.VesaWorkspaceShell;
    this.shell = new Shell({
      root: this.doc.body,
      descriptor: {id:'artwork-cad-studio',name:'Artwork & SVG Studio',route:'/apps/artwork-cad-studio/',savedState:'Download SVG files to your device',userLabel:s?.name||s?.email||'',userRole:s?.role||''},
      callbacks:{menu:name=>this.menu(name)}
    });
    this.shell.mount();
    this.frame.addEventListener('load',()=>this.loaded());
    return this;
  }
  /**
   * Resolve only when the actual SVG drawing canvas exists, not merely its
   * placeholder #container. Upstream initializes asynchronously after load.
   * Lifecycle: one observer per iframe navigation, disposed on ready/timeout.
   */
  async waitUntilEditorReady() {
    const frameDoc = this.frame.contentDocument;
    if (!frameDoc) throw new Error('Local SVG editor document unavailable');
    const hasDrawingCanvas = () => !!frameDoc.querySelector('#svgcanvas');
    if (hasDrawingCanvas()) return;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error('SVG editor canvas initialization timed out'));
      }, 20000);
      const observer = new MutationObserver(() => {
        if (!hasDrawingCanvas()) return;
        clearTimeout(timer);
        observer.disconnect();
        resolve();
      });
      observer.observe(frameDoc.documentElement, {childList:true,subtree:true});
      if (hasDrawingCanvas()) {
        clearTimeout(timer);
        observer.disconnect();
        resolve();
      }
    });
  }

  /** Verify usable drawing UI before claiming readiness or offline caching. */
  async loaded() {
    this.ready = false;
    try {
      await this.waitUntilEditorReady();
      this.ready = true;
      this.status.textContent = 'Local SVG drawing editor loaded. Use the toolbar.';
      if ('serviceWorker' in navigator && window.isSecureContext) {
        try {
          await navigator.serviceWorker.register('/apps/artwork-cad-studio/service-worker.js', {scope:'/apps/artwork-cad-studio/'});
        } catch {
          this.status.textContent += ' Offline access is not yet verified.';
        }
      }
    } catch {
      this.status.textContent = 'Editor did not initialize. The local assets or browser compatibility need checking.';
    }
  }
  /** Universal menu actions do not duplicate the embedded editor controls. */
  menu(name) {
    if(name==='Edit') return this.shell.openSettings();
    if(name==='Help') return this.doc.getElementById('artworkHelp').scrollIntoView();
    if(name==='Home') return this.doc.getElementById('artworkMain').scrollIntoView();
    this.frame.focus();
  }
}