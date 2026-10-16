/**
 * F42 static TNA offline bundle contract: every runtime entry asset is cached
 * exactly, no external URL/user data, distinct worker scope and no root changes.
 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const html=fs.readFileSync(path.join(root,'apps/tna/index.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'apps/tna/service-worker.js'),'utf8');
const code=fs.readFileSync(path.join(root,'apps/tna/src/bootstrap.js'),'utf8');
const rootWorker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const self={registration:{scope:'http://localhost:4500/apps/tna/'},
  location:{origin:'http://localhost:4500'},addEventListener(){}};
const sandbox={self,URL,Set,Object};
const assets=vm.runInNewContext(worker+'\nASSETS',{...sandbox});
const names=[...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)]
  .map(row=>row[1]).filter(link=>!link.startsWith('#'));
assert.equal(new Set(assets).size,assets.length,'Static assets must have unique keys.');
for(const link of names)assert(assets.includes(link),'Offline shell missing HTML dependency '+link);
assert(assets.includes('./index.html'));assert(assets.includes('/assets/vesa-logo-black.png'));
assert(assets.every(link=>!/^https?:\/\//.test(link)));
assert(worker.includes("if(!PERMITTED.has(target))return"),'Dynamic/private URLs must bypass the public static cache.');
for(const forbidden of ['localStorage','indexedDB','records.qa-','Bearer ','/api/private'])assert(!worker.includes(forbidden),'Forbidden private data in worker: '+forbidden);
assert(rootWorker.includes("path.startsWith('/apps/tna')"),'Root worker must delegate TNA to its own scope.');
assert(code.includes("navigator.serviceWorker.register('./service-worker.js'"),'App must register its scoped offline owner.');
console.log('TNA F42 ASSET CONTRACT PASS: all HTML dependencies, scoped source-only cache and root-worker isolation.');
