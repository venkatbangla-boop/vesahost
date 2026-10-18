/*
 * SVGnest Marker Lab offline worker.
 * Scope: /apps/marker-lab/ only. Precaches locally vendored MIT source assets
 * once and serves network-free on subsequent loads. Other VESA apps, user
 * records, external URLs and sibling service workers are strictly out of scope.
 * Install fails closed on missing assets rather than claiming false offline.
 */
'use strict';
const CACHE = 'vesa-oss-marker-lab-v1-svgnest-1248dc21';
const ASSETS = [
 './', './index.html', './assets/marker-lab.css', './src/workspace-controller.js',
 './vendor/index.html', './vendor/style.css', './vendor/LICENSE.txt',
 './vendor/svgnest.js', './vendor/svgparser.js',
 './vendor/util/clipper.js', './vendor/util/domparser.js',
 './vendor/util/filesaver.js', './vendor/util/geometryutil.js',
 './vendor/util/matrix.js', './vendor/util/parallel.js',
 './vendor/util/pathsegpolyfill.js', './vendor/util/placementworker.js',
 './vendor/img/background.png','./vendor/img/close.svg',
 './vendor/img/code.svg','./vendor/img/download.svg',
 './vendor/img/logo.svg','./vendor/img/settings.svg',
 './vendor/img/spin.svg','./vendor/img/start.svg',
 './vendor/img/upload.svg','./vendor/img/zoomin.svg','./vendor/img/zoomout.svg',
 './vendor/font/latolatinfonts.css',
 './vendor/font/fonts/LatoLatin-Regular.woff2',
 './vendor/font/fonts/LatoLatin-Bold.woff2'
];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys
  .filter(key => key.startsWith('vesa-oss-marker-lab-') && key !== CACHE)
  .map(key => caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
 if(event.request.method !== 'GET') return;
 const url = new URL(event.request.url);
 if(url.origin !== self.location.origin || !url.pathname.startsWith('/apps/marker-lab/')) return;
 event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});