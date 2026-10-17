/** Personal demo release guard; never implies commercial Pages eligibility. */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['apps/packing-container/index.html','apps/order-commission/index.html','apps/tech-pack-spec/index.html','apps/purchase-order/index.html','apps/lc-payment/index.html','apps/sampling-approval/index.html','apps/fabric-trims/index.html']){
 const s=read(file);assert(s.includes('NON-COMMERCIAL PERSONAL DEMO.'));
 assert(s.includes('synthetic')||s.includes('Synthetic'));
 assert(s.includes('/js/auth.js')&&s.includes('/js/vesa-workspace-shell.js'));
}
const catalog=read('js/app-catalogue.js'),sw=read('service-worker.js');
assert.equal((catalog.match(/id:'packing-container'/g)||[]).length,1);
assert.equal((catalog.match(/id:'order-commission'/g)||[]).length,1);
assert.equal((catalog.match(/id:'tech-pack-spec'/g)||[]).length,1);
assert.equal((catalog.match(/id:'purchase-order'/g)||[]).length,1);
assert.equal((catalog.match(/id:'lc-payment'/g)||[]).length,1);
assert.equal((catalog.match(/id:'sampling-approval'/g)||[]).length,1);
assert.equal((catalog.match(/id:'fabric-trims'/g)||[]).length,1);
assert(sw.includes('vesa-v75-fabric-trims-personal-demo'));
for(const url of ['./apps/packing-container/','./apps/order-commission/',
 './apps/packing-container/index.html','./apps/order-commission/index.html',
 './apps/tech-pack-spec/','./apps/tech-pack-spec/index.html',
 './apps/purchase-order/','./apps/purchase-order/index.html',
 './apps/lc-payment/','./apps/lc-payment/index.html',
 './apps/sampling-approval/','./apps/sampling-approval/index.html',
 './apps/sampling-approval/assets/sampling-approval.css',
 './apps/sampling-approval/src/bootstrap.js',
 './apps/sampling-approval/src/domain/sampling-engine.js',
 './apps/sampling-approval/src/data/local-record-port.js',
 './apps/sampling-approval/src/reports/report-model.js',
 './apps/sampling-approval/src/i18n/app-copy.js',
 './apps/sampling-approval/src/application/workspace-controller.js',
 './apps/fabric-trims/','./apps/fabric-trims/index.html',
 './apps/fabric-trims/assets/fabric-trims.css',
 './apps/fabric-trims/src/bootstrap.js',
 './apps/fabric-trims/src/domain/material-engine.js',
 './apps/fabric-trims/src/data/local-record-port.js',
 './apps/fabric-trims/src/reports/report-model.js',
 './apps/fabric-trims/src/i18n/app-copy.js',
 './apps/fabric-trims/src/application/workspace-controller.js'])
 assert(sw.includes("'"+url+"'"));
console.log('VESA DEMO RELEASE SOURCE PASS: synthetic-only public disclaimer, exact catalogue routes, updated service-worker cache.');
