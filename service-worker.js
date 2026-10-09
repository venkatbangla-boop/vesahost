const CACHE='vesa-v41-hide-app-menus';
const ASSETS=[
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './login/',
  './login/index.html',
  './apps/',
  './apps/index.html',
  './admin/',
  './admin/index.html',
  './llms.txt',
  './css/style.css',
  './js/main.js',
  './js/auth.js',
  './js/preferences.js',
  './manifest.webmanifest',
  './favicon.ico',
  './favicon-32x32.png',
  './favicon-48x48.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './assets/hero-video-poster.jpg',
  './assets/hero-background-loop.mp4',
  './assets/hero-background-loop.webm',
  './assets/hero-cinematic.jpg',
  './assets/vesa-logo.png',
  './assets/vesa-logo-black.png',
  './assets/vesa-logo-white.png',
  './assets/egenva-icon.png',
  './assets/egenva-logo-white.png',
  './assets/founder-venkatesh.jpg',
  './assets/portfolio-men.jpg',
  './assets/portfolio-ladies.jpg',
  './assets/portfolio-kids.jpg',
  './assets/service-factory.jpg',
  './assets/service-qc.jpg',
  './assets/insight-sourcing.jpg',
  './assets/insight-product.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => /^vesa-v\d+-/.test(key) && key !== CACHE ? caches.delete(key) : null))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // App folders own their versioned offline bundles; root cache must not serve stale app HTML.
  const path = new URL(event.request.url).pathname;
  if (path.startsWith('/apps/ppm') || path.startsWith('/apps/aql')) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      if (response.ok && event.request.url.startsWith(self.location.origin)) {
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
