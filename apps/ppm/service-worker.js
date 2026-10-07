'use strict';
/** Owns only PPM static assets. Record data stays in IndexedDB, never in this cache.
 * Install is atomic; navigation uses the installed bundle so HTML/JS cannot mix versions.
 * Updates wait for old tabs to close; a new version never interrupts an active meeting. */
const CACHE='vesa-ppm-5.0.0';
const FILES=['./','./index.html','./core.js?v=5.0.0','./workspace.js?v=5.0.0','./record-services.js?v=5.0.0','./report-service.js?v=5.0.0','./languages.js?v=5.0.0','./workspace.css?v=5.0.0','./vendor/pdf-lib.min.js?v=5.0.0','./fonts/bengali.ttf','./fonts/devanagari.ttf','./fonts/tamil.ttf','./manifest.webmanifest','../../assets/vesa-logo-black.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('vesa-ppm-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;if(event.request.mode==='navigate'&&new URL(event.request.url).pathname.startsWith('/apps/ppm/'))return cache.match('./index.html');return fetch(event.request)}))});
