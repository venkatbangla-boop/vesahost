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
  /** Keep state local; missing assets remain an explicit failure. */
  async loaded() {
    this.ready = !!this.frame.contentDocument?.getElementById('container');
    this.status.textContent = this.ready ? 'Local editor loaded. Use the drawing toolbar.' : 'Editor files are not yet available.';
    if(this.ready && 'serviceWorker' in navigator && window.isSecureContext) {
      try { await navigator.serviceWorker.register('/apps/artwork-cad-studio/service-worker.js',{scope:'/apps/artwork-cad-studio/'}); }
      catch { this.status.textContent += ' Offline access is not confirmed.'; }
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