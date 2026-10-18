/*
 * VESA Artwork Studio offline cache.
 * Owner: this isolated art workspace only; uses a pinned local manifest created
 * by the vendor workflow. It must not cache business records or sibling apps.
 * On incomplete install, fails closed and leaves the previous cache untouched.
 */
'use strict';
const CACHE = 'vesa-oss-svg-studio-v1-c44f061d';
const SCOPE = '/apps/artwork-cad-studio/';
const SHARED = new Set([
 '/js/preferences.js','/js/auth.js','/js/vesa-workspace-shell.js',
 '/css/vesa-workspace.css','/assets/vesa-logo-black.png','/favicon.ico'
]);
/** Accept only this app's URLs and a fixed set of shared VESA shell assets. */
class ArtworkAssetPolicy {
 static url(value) {
  const url = new URL(value, self.registration.scope);
  if (url.origin !== self.location.origin ||
      !(url.pathname.startsWith(SCOPE) || SHARED.has(url.pathname))) {
   throw new Error('Unsafe offline asset URL');
  }
  return url.href;
 }
 static async manifest() {
  const response = await fetch('./offline-manifest.json', {cache:'no-store'});
  if (!response.ok) throw new Error('Offline manifest missing');
  const json = await response.json();
  if (!Array.isArray(json.files) || json.files.length < 50 ||
      json.files.length > 600) throw new Error('Invalid offline asset manifest');
  return [...new Set(json.files.map(ArtworkAssetPolicy.url))];
 }
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const urls=await ArtworkAssetPolicy.manifest();
  const cache=await caches.open(CACHE);
  try {
   await cache.addAll(urls.map(url=>new Request(url,{cache:'reload'})));
  } catch(error) {
   await caches.delete(CACHE);
   throw error;
  }
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('vesa-oss-svg-studio-')&&k!==CACHE)
    .map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin ||
    !(url.pathname.startsWith(SCOPE)||SHARED.has(url.pathname)))return;
 event.respondWith((async()=>{
  const hit=await caches.match(event.request);
  if(hit)return hit;
  try{return await fetch(event.request);}
  catch(error){
   if(event.request.mode==='navigate'&&url.pathname.startsWith(SCOPE)){
    const fallback=await caches.match(new URL('./index.html',self.registration.scope).href);
    if(fallback)return fallback;
   }
   throw error;
  }
 })());
});