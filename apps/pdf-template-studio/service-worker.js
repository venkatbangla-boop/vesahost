/* Scoped offline cache for the PDF Template Studio pilot.
 * Owns PDF Studio URLs only; never caches other VESA apps or user documents.
 * Offline installation is conditional on a complete generated asset manifest.
 */
'use strict';
const CACHE='vesa-pdf-studio-pilot-v1';
const PREFIX='/apps/pdf-template-studio/';
class PdfStudioOfflineCache {
  static async install() {
    const res=await fetch(PREFIX+'offline-manifest.json',{cache:'no-store'});
    if(!res.ok)throw Error('Missing PDF Studio manifest');
    const manifest=await res.json();
    if(!Array.isArray(manifest.files)||manifest.files.length<8||manifest.files.length>120)throw Error('Invalid manifest');
    const paths=[...new Set(manifest.files.map(path=>{
      const url=new URL(path,self.location.origin+PREFIX);
      if(url.origin!==self.location.origin||!url.pathname.startsWith(PREFIX))throw Error('Out-of-scope asset');
      return url.href;
    }))];
    const cache=await caches.open(CACHE);
    try {await cache.addAll(paths);} catch(err){await caches.delete(CACHE);throw err;}
  }
}
self.addEventListener('install',event=>event.waitUntil(PdfStudioOfflineCache.install().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(PREFIX))return;
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
