const CACHE='vesa-v23-mobile-drawer';
const ASSETS=[
  "./",
  "./index.html",
  "./css/style.css",
  "./js/main.js",
  "./manifest.webmanifest",
  "./assets/hero-cinematic.jpg",
  "./assets/hero-loop.webm",
  "./assets/hero-loop.mp4",
  "./assets/vesa-logo.png",
  "./assets/vesa-logo-black.png",
  "./assets/vesa-logo-white.png",
  "./assets/egenva-icon.png",
  "./assets/egenva-logo-white.png",
  "./assets/founder-venkatesh.jpg",
  "./assets/portfolio-men.jpg",
  "./assets/portfolio-ladies.jpg",
  "./assets/portfolio-kids.jpg",
  "./assets/service-factory.jpg",
  "./assets/service-qc.jpg",
  "./assets/insight-sourcing.jpg",
  "./assets/insight-product.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/favicon.png"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE ? caches.delete(key) : null))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
