const CACHE='vesa-v76-shipment-documentation-personal-demo';
const ASSETS=[
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './login/',
  './login/index.html',
  './apps/',
  './apps/index.html',
  './apps/costing/',
  './apps/costing/index.html',
  './apps/packing-container/',
  './apps/packing-container/index.html',
  './apps/order-commission/',
  './apps/order-commission/index.html',
  './apps/tech-pack-spec/',
  './apps/tech-pack-spec/index.html',
  './apps/purchase-order/',
  './apps/purchase-order/index.html',
  './apps/lc-payment/',
  './apps/lc-payment/index.html',
  './apps/sampling-approval/',
  './apps/sampling-approval/index.html',
  './apps/sampling-approval/assets/sampling-approval.css',
  './apps/sampling-approval/src/bootstrap.js',
  './apps/sampling-approval/src/domain/sampling-engine.js',
  './apps/sampling-approval/src/data/local-record-port.js',
  './apps/sampling-approval/src/reports/report-model.js',
  './apps/sampling-approval/src/i18n/app-copy.js',
  './apps/sampling-approval/src/application/workspace-controller.js',
  './apps/fabric-trims/',
  './apps/fabric-trims/index.html',
  './apps/fabric-trims/assets/fabric-trims.css',
  './apps/fabric-trims/src/bootstrap.js',
  './apps/fabric-trims/src/domain/material-engine.js',
  './apps/fabric-trims/src/data/local-record-port.js',
  './apps/fabric-trims/src/reports/report-model.js',
  './apps/fabric-trims/src/i18n/app-copy.js',
  './apps/fabric-trims/src/application/workspace-controller.js',
  './apps/shipment-documentation/',
  './apps/shipment-documentation/index.html',
  './apps/shipment-documentation/assets/shipment-documentation.css',
  './apps/shipment-documentation/src/bootstrap.js',
  './apps/shipment-documentation/src/domain/shipment-engine.js',
  './apps/shipment-documentation/src/data/local-record-port.js',
  './apps/shipment-documentation/src/reports/report-model.js',
  './apps/shipment-documentation/src/i18n/app-copy.js',
  './apps/shipment-documentation/src/application/workspace-controller.js',
  './apps/tna/',
  './apps/tna/index.html',
  './apps/tna/assets/tna.css',
  './apps/tna/src/domain.js',
  './apps/tna/src/scheduling.js',
  './apps/tna/src/operations.js',
  './apps/tna/vendor/xlsx.full.min.js',
  './apps/tna/vendor/xlsx.LICENSE.txt',
  './apps/tna/src/cloud-contracts.js',
  './apps/tna/src/integration-references.js',
  './apps/tna/src/notification-rules.js',
  './apps/tna/src/storage.js',
  './apps/tna/src/reports.js',
  './apps/tna/src/scenarios.js',
  './apps/tna/src/remote-api.js',
  './apps/tna/src/bootstrap.js',
  './admin/',
  './admin/index.html',
  './llms.txt',
  './css/style.css',
  './css/vesa-workspace.css?v=20261013-platform-g09',
  './css/vesa-workspace.css',
  './js/main.js',
  './js/auth.js',
  './js/preferences.js',
  './js/preferences.js?v=20261015-costing-demo',
  './js/vesa-workspace-shell.js?v=20261013-platform-g09',
  './js/vesa-workspace-shell.js',
  './js/app-catalogue.js',
  './js/app-catalogue.js?v=20261015-costing-demo',
  './js/vendor/xlsx.full.min.js',
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
  if (path.startsWith('/apps/ppm') || path.startsWith('/apps/aql') || path.startsWith('/apps/tna')) return;
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
