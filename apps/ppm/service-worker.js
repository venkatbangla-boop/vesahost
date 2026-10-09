'use strict';
/** Owns PPM static bundles only. Installation must finish before activation. Open
 * windows are never reloaded; their exact old versioned assets remain available.
 * Navigations receive one installed bundle, including offline. No record access. */
class PpmAssetWorker {
  static VERSION='5.1.5';
  static CACHE='vesa-ppm-'+PpmAssetWorker.VERSION+'-shell-3';
  static async install(){const cache=await caches.open(this.CACHE);await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));await self.skipWaiting()}
  static async activate(){await self.clients.claim()}
  /** Versioned old requests use exact cache keys, never another release's script. */
  static async respond(request){
    const cache=await caches.open(this.CACHE),url=new URL(request.url);
    if(request.mode==='navigate'&&url.pathname.startsWith('/apps/ppm/'))return cache.match('./index.html');
    const current=await cache.match(request);if(current)return current;
    if(url.pathname.startsWith('/apps/ppm/')&&url.searchParams.has('v')){
      for(const key of await caches.keys())if(key.startsWith('vesa-ppm-')&&key!==this.CACHE){const old=await (await caches.open(key)).match(request);if(old)return old}
    }
    return fetch(request);
  }
}
const FILES=['./','./index.html','./core.js?v=5.1.5','./workspace.js?v=5.1.5','./planning-services.js?v=5.1.5','./planning-panel.js?v=5.1.5','./record-services.js?v=5.1.5','./report-service.js?v=5.1.5','./languages.js?v=5.1.5','./workspace.css?v=5.1.5','./vendor/pdf-lib.min.js?v=5.1.5','./fonts/bengali.ttf','./fonts/devanagari.ttf','./fonts/tamil.ttf','./manifest.webmanifest','../../assets/vesa-logo-black.png','../../js/auth.js','../../js/preferences.js'];
self.addEventListener('install',event=>event.waitUntil(PpmAssetWorker.install()));
self.addEventListener('activate',event=>event.waitUntil(PpmAssetWorker.activate()));
self.addEventListener('message',event=>{if(event.data?.type==='PPM_VERSION')event.ports[0]?.postMessage(PpmAssetWorker.VERSION)});
self.addEventListener('fetch',event=>{if(event.request.method==='GET'&&new URL(event.request.url).origin===location.origin)event.respondWith(PpmAssetWorker.respond(event.request))});
