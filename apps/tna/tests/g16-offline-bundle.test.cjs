/**
 * TNA G16 offline static-bundle source audit. No network or GitHub API call.
 * The worker must cover exact HTML/CSS/runtime resources, never app records,
 * and must not change root/PPM/AQL cache ownership.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
class TnaOfflineManifestAudit {
  static root=path.resolve(__dirname,'../../..');
  static read(p){return fs.readFileSync(path.join(this.root,p),'utf8');}
  static run(){
    const scope='https://vesaent.com/apps/tna/';
    const workerCode=this.read('apps/tna/service-worker.js');
    const RegistrationCode=this.read('apps/tna/src/offline-register.js');
    const html=this.read('apps/tna/index.html');
    const sandbox={
      URL,Request,Response,caches:{},fetch:()=>{},
      self:{
        registration:{scope},
        location:{origin:'https://vesaent.com'},
        addEventListener:()=>{},
        clients:{claim:async()=>{}},
        skipWaiting:async()=>{}
      }
    };
    const Worker=vm.runInNewContext(workerCode+'\nTnaOfflineBundle;',sandbox);
    assert.equal(Worker.CACHE,'vesa-tna-20261017-g16-merch-v1');
    assert(Worker.FILES.length>=25,'Fully specified offline dependency set');
    const urls=Worker.FILES.map(asset=>new URL(asset,scope).href);
    const cacheSet=new Set(urls);
    assert.equal(cacheSet.size,urls.length,'No duplicate or ambiguous cache keys');
    for(const asset of urls){
      const url=new URL(asset);
      assert.equal(url.origin,'https://vesaent.com');
      const local=path.join(this.root,url.pathname.replace(/^\/+/,''));
      assert(fs.existsSync(local)||url.pathname==='/apps/tna/','Missing offline asset '+url.pathname);
    }
    // The release must version-bump every modified M1-M3 TNA source, not
    // allow old browser-cache queries to load a mismatched domain/controller.
    const markers=['./assets/tna.css?v=0.12.0-merch-g16',
      './src/domain.js?v=1.1.2-merch-g16',
      './src/merchandising-sheet.js?v=0.3.0-merch-g16',
      './src/bootstrap.js?v=0.12.0-merch-g16',
      './src/offline-register.js?v=0.1.0-merch-g16'];
    for(const marker of markers)assert(html.includes(marker));
    const hrefs=[...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
      .map(x=>x[1]).filter(x=>x&&!x.startsWith('#')&&!x.startsWith('data:'));
    for(const href of hrefs){
      const full=new URL(href,scope).href;
      assert(cacheSet.has(full),'Index HTML dependency not precached: '+full);
    }
    for(const css of ['apps/tna/assets/tna.css','css/style.css']){
      const contents=this.read(css);
      const cssBase=new URL('/'+css,'https://vesaent.com');
      for(const x of contents.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)){
        const url=new URL(x[1],cssBase).href;
        assert(cacheSet.has(url),'CSS background dependency not precached: '+url);
      }
    }
    assert(cacheSet.has('https://vesaent.com/assets/vesa-logo-black.png'));
    assert(RegistrationCode.includes("scope:'/apps/tna/'"));
    assert(RegistrationCode.includes("updateViaCache:'none'"));
    assert(workerCode.includes("return fetch(request)")&&workerCode.includes("status:503"));
    assert(!/\b(localStorage|indexedDB|sessionStorage|postMessage\s*\(\s*plan|eval\s*\()/i.test(workerCode));
    assert(!workerCode.includes('caches.delete(key)')&&
      !workerCode.includes("vesa-v83-product-development-personal-demo"));
    assert(!workerCode.includes("'/apps/aql/'")&&!workerCode.includes("'/apps/ppm/'"));
    console.log('TNA G16 OFFLINE ASSET MANIFEST PASS: '+urls.length+
      ' exact same-origin static resources; audited HTML/CSS dependency graph,'+
      ' versioned changed files, TNA-only scope, no root/PPM/AQL cache deletion.');
  }
}
TnaOfflineManifestAudit.run();
