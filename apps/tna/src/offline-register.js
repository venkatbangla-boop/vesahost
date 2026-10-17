'use strict';
/**
 * TNA G16 offline bootstrap. Owns only an app-scoped static worker
 * registration, not login, storage, data sync, or a background task.
 * A denied/insecure registration does not block online TNA workflows.
 */
class TnaOfflineRegistration {
  static start(){
    if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
    navigator.serviceWorker.register('/apps/tna/service-worker.js',{
      scope:'/apps/tna/',updateViaCache:'none'
    }).catch(()=>{/* Browser-online TNA remains available; never claim offline ready. */});
  }
}
if(document.readyState==='complete')TnaOfflineRegistration.start();
else window.addEventListener('load',()=>TnaOfflineRegistration.start(),{once:true});
