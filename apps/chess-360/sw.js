/**
 * Chess Beast 360 app-scoped offline service worker.
 *
 * Ownership: only /apps/chess-360/. The main VESA 360 root worker continues
 * owning other applications; no cross-app cache deletion, auth, or remote data.
 * Cached assets contain no game records, user names or credentials.
 *
 * Lifecycle: install -> atomically pre-cache static Chess shell -> activate
 * -> claim Chess scope -> serve identical assets offline. Old Chess versions
 * alone are garbage collected; localStorage saved games are untouched.
 */
'use strict';
class ChessBeastOfflineCache {
  static VERSION='chess-beast-v3-20261018-r3';
  static PREFIX='chess-beast-';
  static ASSETS=['./','./index.html','./chess-beast.css','./chess-beast-ui.js','./chess-ai-worker.js','./chess-report.js','./chess-match-experience.css','./chess-orbit.js','./chess-pro-ux.css'];
  static install(event) {
    event.waitUntil(
      caches.open(this.VERSION).then(cache=>cache.addAll(this.ASSETS))
        .then(()=>self.skipWaiting())
    );
  }
  static activate(event) {
    event.waitUntil(
      caches.keys().then(keys=>Promise.all(keys.filter(k=>
        k.startsWith(this.PREFIX)&&k!==this.VERSION).map(k=>caches.delete(k))
      )).then(()=>self.clients.claim())
    );
  }
  static fetch(event) {
    const request=event.request;
    if(request.method!=='GET')return;
    const url=new URL(request.url);
    if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
    event.respondWith(
      caches.open(this.VERSION).then(async cache=>{
        const cached=await cache.match(request,{ignoreSearch:true});
        if(cached)return cached;
        try{
          const response=await fetch(request);
          if(response.ok)await cache.put(request,response.clone());
          return response;
        }catch{
          if(request.mode==='navigate'){
            const fallback=await cache.match('./index.html');
            if(fallback)return fallback;
          }
          return new Response('Chess Beast is offline and this resource is not cached.',{
            status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}
          });
        }
      })
    );
  }
}
self.addEventListener('install',event=>ChessBeastOfflineCache.install(event));
self.addEventListener('activate',event=>ChessBeastOfflineCache.activate(event));
self.addEventListener('fetch',event=>ChessBeastOfflineCache.fetch(event));
