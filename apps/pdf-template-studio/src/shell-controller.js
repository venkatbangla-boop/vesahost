/*
 * Pdf Studio shell adapter. Owns only VESA shell, iframe readiness and offline
 * lifecycle; never reads or modifies pdfme user templates or garment records.
 * Entry: new VesaPdfStudioShell(document).mount().
 */
class VesaPdfStudioShell{
  constructor(doc){
    this.doc=doc;this.frame=doc.getElementById('pdfStudioEditor');
    this.status=doc.getElementById('pdfStudioState');
    if(!this.frame||!this.status)throw new Error('PDF Studio layout missing');
    this.ready=false;
  }
  /** Mount exactly one platform-owned header; keep editor toolbar within iframe. */
  mount(){
    const session=window.VesaAuth.session();
    this.shell=new window.VesaWorkspaceShell.VesaWorkspaceShell({
      root:this.doc.body,descriptor:{
        id:'pdf-template-studio',name:'PDF Template Studio',route:'/apps/pdf-template-studio/',
        savedState:'Download templates to your device',
        userLabel:session?.name||session?.email||'',userRole:session?.role||''
      },callbacks:{menu:name=>this.menu(name)}
    });
    this.shell.mount();
    this.frame.addEventListener('load',()=>this.onFrameLoad());
    return this;
  }
  /** Check inner designer readiness before registering the isolated worker. */
  async onFrameLoad(){
    try{
      const d=this.frame.contentDocument;
      if(!d?.getElementById('designer'))throw new Error('Designer frame unavailable');
      await new Promise((resolve,reject)=>{
        const end=Date.now()+20000;
        const poll=()=>{
          if(d.getElementById('status')?.textContent==='Local PDF designer ready.')return resolve();
          if(Date.now()>end)return reject(new Error('PDF designer timeout'));
          setTimeout(poll,120);
        };poll();
      });
      this.ready=true;this.status.textContent='Local PDF designer ready.';
      if('serviceWorker' in navigator&&window.isSecureContext){
        try{await navigator.serviceWorker.register('/apps/pdf-template-studio/service-worker.js',{scope:'/apps/pdf-template-studio/'});}
        catch{this.status.textContent+=' Offline caching is not verified on this device.';}
      }
    }catch{this.ready=false;this.status.textContent='PDF designer could not open. Check local files or browser support.';}
  }
  /** Route universal menus without duplicating pdfme toolbar or saving records. */
  menu(name){
    if(name==='Edit')return this.shell.openSettings();
    if(name==='Home')return this.doc.getElementById('pdfStudioMain').scrollIntoView();
    if(name==='Help')return this.doc.getElementById('pdfStudioHelp').scrollIntoView();
    this.frame.focus();
  }
}