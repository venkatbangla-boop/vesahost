const CACHE_NAME='vesa-final-v12-approved-cache-v1';
const ASSETS=[
  "./",
  "./index.html",
  "./css/style.css",
  "./js/main.js",
  "./manifest.webmanifest",
  "./assets/vesa-logo-black.png",
  "./assets/vesa-logo-white.png",
  "./assets/vesa-icon-black.png",
  "./assets/egenva-logo-white.png",
  "./assets/founder-venkatesh-selvaraj.jpg",
  "./assets/founder-venkatesh-square.jpg",
  "./assets/hero-approved-v12.jpg",
  "./assets/portfolio-mens-approved-v12.jpg",
  "./assets/portfolio-ladies-approved-v12.jpg",
  "./assets/portfolio-kids-approved-v12.jpg",
  "./assets/bangladesh-production-approved-v12.jpg",
  "./assets/product-development-approved-v12.jpg",
  "./assets/quality-shipment-approved-v12.jpg",
  "./assets/design-review-approved-v12.jpg",
  "./assets/case-bangladesh-program-v12.jpg",
  "./assets/case-development-program-v12.jpg",
  "./assets/case-quality-program-v12.jpg",
  "./assets/insight-bangladesh-v12.jpg",
  "./assets/insight-india-v12.jpg",
  "./assets/insight-moq-v12.jpg",
  "./assets/insight-compliance-v12.jpg",
  "./assets/og-vesa-v12.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate', event => {event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))));self.clients.claim();});
self.addEventListener('fetch', event => {if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match('./index.html'))));});
