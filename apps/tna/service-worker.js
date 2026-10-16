/**
 * VESA TNA 360 scoped offline app shell — static public assets only.
 * Scope: /apps/tna/. The root VESA worker deliberately delegates TNA paths.
 * No browser-local order, approval, credentials or user data is ever cached.
 * Update CACHE_VERSION whenever a released static dependency changes.
 */
'use strict';
const CACHE_NAME='vesa-tna-static-v1-20261016-f42';
const ASSETS=Object.freeze([
  './','./index.html','./assets/tna.css?v=0.11.1',
  './src/domain.js?v=1.1.1',
  './src/scheduling.js?v=0.3.0',
  './src/operations.js?v=0.4.0',
  './vendor/xlsx.full.min.js?v=0.18.5',
  './src/cloud-contracts.js?v=0.11.0',
  './src/integration-references.js?v=0.10.0',
  './src/notification-rules.js?v=0.10.2',
  './src/storage.js?v=0.11.0',
  './src/reports.js?v=0.7.2',
  './src/import-review.js?v=0.1.0',
  './src/scenarios.js?v=0.8.0',
  './src/remote-api.js?v=0.11.0',
  './src/bootstrap.js?v=0.10.4',
  '/css/style.css',
  '/css/vesa-workspace.css?v=20261013-platform-g09',
  '/js/preferences.js?v=20261010-tna-g01',
  '/js/auth.js?v=20261010-tna-g01',
  '/js/vesa-workspace-shell.js?v=20261013-platform-g09',
  '/assets/vesa-logo-black.png',
  '/favicon.ico'
]);
const ROOT_URL=new URL('./',self.registration.scope);
const PUBLIC_CACHE_URLS=Object.freeze(ASSETS.map(path=>new URL(path,ROOT_URL).href));
const PERMITTED=new Set(PUBLIC_CACHE_URLS);
const ENTRY=new URL('./index.html',ROOT_URL).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache=>cache.addAll(PUBLIC_CACHE_URLS))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys
    .filter(key=>key.startsWith('vesa-tna-static-')&&key!==CACHE_NAME)
    .map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const requestURL=new URL(event.request.url);
  if(requestURL.origin!==ROOT_URL.origin)return;
  const target=event.request.mode==='navigate'&&
    (requestURL.pathname===ROOT_URL.pathname||
     requestURL.pathname===new URL('./index.html',ROOT_URL).pathname)?
      ENTRY:requestURL.href;
  // No wildcard / dynamic cache. Private API, record, report download or
  // other application requests MUST never pass through this static cache.
  if(!PERMITTED.has(target))return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
    const publicAsset=await cache.match(target);
    return publicAsset||fetch(event.request);
  }));
});
