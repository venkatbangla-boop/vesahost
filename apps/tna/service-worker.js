'use strict';
/**
 * TNA G16 isolated static asset worker.
 *
 * Owner: offline read-only bundle for /apps/tna/ and the exact shared assets
 * that its index.html requires. App plans, approval decisions, user data and
 * external URLs are NEVER intercepted or stored. PPM/AQL/root caches are frozen.
 *
 * Lifecycle: install fetches the complete versioned bundle atomically;
 * activation claims TNA windows but leaves old TNA bundle caches for still-open
 * older versioned tabs; a failed installation preserves the previous worker.
 * This is an offline personal synthetic demo, not server-side authentication.
 */
class TnaOfflineBundle {
  static VERSION='20261018-g3-sheet-first-v1';
  static CACHE='vesa-tna-'+TnaOfflineBundle.VERSION;
  static FILES=Object.freeze([
    './',
    './index.html',
    './service-worker.js',
    './assets/tna.css?v=0.12.2-g3-sheet-first',
    './src/domain.js?v=1.1.2-merch-g16',
    './src/scheduling.js?v=0.3.0',
    './src/operations.js?v=0.4.0',
    './vendor/xlsx.full.min.js?v=0.18.5',
    './src/cloud-contracts.js?v=0.11.0',
    './src/integration-references.js?v=0.10.0',
    './src/notification-rules.js?v=0.10.2',
    './src/storage.js?v=0.11.0',
    './src/merchandising-sheet.js?v=0.3.1-merch-g17',
    './src/reports.js?v=0.7.2',
    './src/scenarios.js?v=0.8.0',
    './src/remote-api.js?v=0.11.0',
    './src/bootstrap.js?v=0.12.1-merch-g17',
    './src/offline-register.js?v=0.1.0-merch-g16',
    '../../favicon.ico',
    '../../assets/vesa-logo-black.png',
    '../../assets/hero-video-poster.jpg',
    '../../assets/hero-cinematic.jpg',
    '../../css/style.css',
    '../../css/vesa-workspace.css?v=20261013-platform-g09',
    '../../js/preferences.js?v=20261010-tna-g01',
    '../../js/auth.js?v=20261010-tna-g01',
    '../../js/vesa-workspace-shell.js?v=20261013-platform-g09'
  ]);
  static absolute(relative){return new URL(relative,self.registration.scope).href;}
  /**
   * Complete fetch-or-abort: partial cache contents never become a working
   * release. A broken offline install leaves any older active worker untouched.
   */
  static async install(){
    const cache=await caches.open(this.CACHE);
    try{
      const requests=this.FILES.map(file=>new Request(this.absolute(file),{cache:'reload'}));
      await cache.addAll(requests);
      await self.skipWaiting();
    }catch(error){
      await caches.delete(this.CACHE);
      throw error;
    }
  }
  /**
   * Preserve old TNA named caches (if any), but never alter root, PPM or AQL
   * namespaces. That protects older exact-version tab requests and user data.
   */
  static async activate(){await self.clients.claim();}
  /**
   * Respond only to exact static bundle URLs or TNA home navigation. All other
   * same-origin requests keep normal network behavior and are not cached.
   * Unknown offline assets fail closed with 503 rather than unrelated HTML.
   */
  static async respond(request){
    const url=new URL(request.url),home=this.absolute('./'),index=this.absolute('./index.html');
    const homeNavigation=request.mode==='navigate'&&(url.pathname===new URL(home).pathname||url.pathname===new URL(index).pathname);
    const cacheKey=homeNavigation?index:url.href;
    const allowed=homeNavigation||this.FILES.some(file=>this.absolute(file)===cacheKey);
    if(!allowed)return fetch(request);
    const cache=await caches.open(this.CACHE);
    const current=await cache.match(cacheKey);
    if(current)return current;
    const older=(await caches.keys()).filter(key=>key.startsWith('vesa-tna-')&&key!==this.CACHE);
    for(const key of older.reverse()){
      const response=await (await caches.open(key)).match(cacheKey);
      if(response)return response;
    }
    try{return await fetch(request);}
    catch{return new Response('TNA offline bundle asset unavailable.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  }
}
self.addEventListener('install',event=>event.waitUntil(TnaOfflineBundle.install()));
self.addEventListener('activate',event=>event.waitUntil(TnaOfflineBundle.activate()));
self.addEventListener('message',event=>{
  if(event.data?.type==='TNA_VERSION')event.ports?.[0]?.postMessage(TnaOfflineBundle.VERSION);
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(TnaOfflineBundle.respond(event.request));
});
