const CACHE = 'vesa-aql-2026-10-13-19';
const ASSETS = [
  './',
  './index.html',
  './service-worker.js',
  '../../js/auth.js?v=20261010-uniform',
  '../../js/preferences.js?v=20261010-uniform',
  '../../js/vesa-workspace-shell.js?v=20261013-platform-g09',
  '../../css/vesa-workspace.css?v=20261013-platform-g09'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => key.startsWith('vesa-aql-') && key !== CACHE ? caches.delete(key) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const shared = ['/js/auth.js','/js/preferences.js','/js/vesa-workspace-shell.js','/css/vesa-workspace.css'].includes(url.pathname);
  if (!url.pathname.startsWith('/apps/aql/') && !shared) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && url.origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(shared ? event.request : './index.html')))
  );
});
