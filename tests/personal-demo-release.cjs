/** Personal demo release guard; never implies commercial Pages eligibility. */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['apps/packing-container/index.html','apps/order-commission/index.html','apps/tech-pack-spec/index.html','apps/purchase-order/index.html','apps/lc-payment/index.html','apps/sampling-approval/index.html','apps/fabric-trims/index.html','apps/shipment-documentation/index.html','apps/production-tracker/index.html','apps/factory-vendor/index.html','apps/label-artwork-approval/index.html','apps/buyer-crm/index.html','apps/fabric-supplier-comparison/index.html','apps/claims-disputes/index.html']){
 const s=read(file);assert(s.includes('NON-COMMERCIAL PERSONAL DEMO.'));
 assert(s.includes('synthetic')||s.includes('Synthetic'));
 assert(s.includes('/js/auth.js')&&s.includes('/js/vesa-workspace-shell.js'));
}
const product=read('apps/product-development/index.html');
assert(product.includes('personal non-commercial synthetic-only demo'));
assert(product.includes('/js/auth.js')&&product.includes('/js/vesa-workspace-shell.js'));
assert(product.includes('./src/domain/concept-register.js'));
assert(read('apps/product-development/src/application/workspace-controller.js').includes('NON-COMMERCIAL PERSONAL DEMO — SYNTHETIC IDEAS ONLY'));
const productPrefs=read('js/preferences.js');
assert.equal((productPrefs.match(/openProductDevelopment:/g)||[]).length,4,'App Centre must show Product Development in all four languages');
const catalog=read('js/app-catalogue.js'),sw=read('service-worker.js');
assert.equal((catalog.match(/id:'packing-container'/g)||[]).length,1);
assert.equal((catalog.match(/id:'order-commission'/g)||[]).length,1);
assert.equal((catalog.match(/id:'tech-pack-spec'/g)||[]).length,1);
assert.equal((catalog.match(/id:'purchase-order'/g)||[]).length,1);
assert.equal((catalog.match(/id:'lc-payment'/g)||[]).length,1);
assert.equal((catalog.match(/id:'sampling-approval'/g)||[]).length,1);
assert.equal((catalog.match(/id:'fabric-trims'/g)||[]).length,1);
assert.equal((catalog.match(/id:'shipment-documentation'/g)||[]).length,1);
assert.equal((catalog.match(/id:'production-tracker'/g)||[]).length,1);
assert.equal((catalog.match(/id:'factory-vendor'/g)||[]).length,1);
assert.equal((catalog.match(/id:'label-artwork-approval'/g)||[]).length,1);
assert.equal((catalog.match(/id:'buyer-crm'/g)||[]).length,1);
assert.equal((catalog.match(/id:'fabric-supplier-comparison'/g)||[]).length,1);
assert.equal((catalog.match(/id:'claims-disputes'/g)||[]).length,1);
assert.equal((catalog.match(/id:'product-development'/g)||[]).length,1);
assert(catalog.includes("route:'/apps/product-development/'")&&catalog.includes("order:190,openLabelKey:'openProductDevelopment'"));
assert(sw.includes('vesa-v99-factory-g4-guided-practice'));
assert(sw.includes("'./css/vesa-login.css?v=20261018-login-r1'"));
assert(sw.includes("'./css/vesa-admin.css?v=20261018-admin-r1'"));
assert(sw.includes("'./css/vesa-app-centre.css?v=20261018-u02'"));
assert(sw.includes("'./js/vesa-app-centre.js?v=20261018-u03'"));
for(const url of ['./apps/product-development/','./apps/product-development/index.html','./apps/product-development/assets/product-development.css','./apps/product-development/src/bootstrap.js','./apps/product-development/src/domain/concept-register.js','./apps/product-development/src/domain/board-layout.js','./apps/product-development/src/domain/revision-history.js','./apps/product-development/src/domain/reviewed-reference.js','./apps/product-development/src/data/saved-copy-codec.js','./apps/product-development/src/data/local-record-port.js','./apps/product-development/src/reports/report-model.js','./apps/product-development/src/i18n/app-copy.js','./apps/product-development/src/application/workspace-controller.js','./apps/packing-container/','./apps/order-commission/',
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
 './apps/fabric-trims/src/application/workspace-controller.js',
 './apps/shipment-documentation/','./apps/shipment-documentation/index.html',
 './apps/shipment-documentation/assets/shipment-documentation.css',
 './apps/shipment-documentation/src/bootstrap.js',
 './apps/shipment-documentation/src/domain/shipment-engine.js',
 './apps/shipment-documentation/src/data/local-record-port.js',
 './apps/shipment-documentation/src/reports/report-model.js',
 './apps/shipment-documentation/src/i18n/app-copy.js',
 './apps/shipment-documentation/src/application/workspace-controller.js',
 './apps/production-tracker/','./apps/production-tracker/index.html',
 './apps/production-tracker/assets/production-tracker.css',
 './apps/production-tracker/src/bootstrap.js',
 './apps/production-tracker/src/domain/stage-flow.js',
 './apps/production-tracker/src/domain/wip-balance.js',
 './apps/production-tracker/src/domain/reviewed-reference.js',
 './apps/production-tracker/src/domain/daily-output-ledger.js',
 './apps/production-tracker/src/data/saved-copy-codec.js',
 './apps/production-tracker/src/data/local-record-port.js',
 './apps/production-tracker/src/reports/report-model.js',
 './apps/production-tracker/src/i18n/app-copy.js',
 './apps/production-tracker/src/application/workspace-controller.js',
 './apps/factory-vendor/','./apps/factory-vendor/index.html',
 './apps/factory-vendor/assets/factory-vendor.css',
 './apps/factory-vendor/src/bootstrap.js',
 './apps/factory-vendor/src/domain/vendor-profile.js',
 './apps/factory-vendor/src/domain/certification-evidence.js',
 './apps/factory-vendor/src/domain/capability-matcher.js',
 './apps/factory-vendor/src/domain/reviewed-reference.js',
 './apps/factory-vendor/src/data/saved-copy-codec.js',
 './apps/factory-vendor/src/data/local-record-port.js',
 './apps/factory-vendor/src/reports/report-model.js',
 './apps/factory-vendor/src/i18n/app-copy.js',
 './apps/factory-vendor/src/application/workspace-controller.js',
 './apps/label-artwork-approval/','./apps/label-artwork-approval/index.html',
 './apps/label-artwork-approval/assets/label-artwork-approval.css',
 './apps/label-artwork-approval/src/bootstrap.js',
 './apps/label-artwork-approval/src/domain/label-spec.js',
 './apps/label-artwork-approval/src/domain/artwork-revision.js',
 './apps/label-artwork-approval/src/domain/review-state.js',
 './apps/label-artwork-approval/src/domain/reviewed-reference.js',
 './apps/label-artwork-approval/src/data/saved-copy-codec.js',
 './apps/label-artwork-approval/src/data/local-record-port.js',
 './apps/label-artwork-approval/src/reports/report-model.js',
 './apps/label-artwork-approval/src/i18n/app-copy.js',
 './apps/label-artwork-approval/src/application/workspace-controller.js',
 './apps/buyer-crm/','./apps/buyer-crm/index.html',
 './apps/buyer-crm/assets/buyer-crm.css',
 './apps/buyer-crm/src/bootstrap.js',
 './apps/buyer-crm/src/domain/buyer-directory.js',
 './apps/buyer-crm/src/domain/opportunity-state.js',
 './apps/buyer-crm/src/domain/followup-scheduler.js',
 './apps/buyer-crm/src/domain/reviewed-reference.js',
 './apps/buyer-crm/src/data/saved-copy-codec.js',
 './apps/buyer-crm/src/data/local-record-port.js',
 './apps/buyer-crm/src/reports/report-model.js',
 './apps/buyer-crm/src/i18n/app-copy.js',
 './apps/buyer-crm/src/application/workspace-controller.js',
'./apps/fabric-supplier-comparison/',
'./apps/fabric-supplier-comparison/index.html',
'./apps/fabric-supplier-comparison/assets/fabric-supplier-comparison.css',
'./apps/fabric-supplier-comparison/src/bootstrap.js',
'./apps/fabric-supplier-comparison/src/domain/quote-normalization.js',
'./apps/fabric-supplier-comparison/src/domain/comparability-gate.js',
'./apps/fabric-supplier-comparison/src/domain/landed-scenario.js',
'./apps/fabric-supplier-comparison/src/domain/reviewed-reference.js',
'./apps/fabric-supplier-comparison/src/data/saved-copy-codec.js',
'./apps/fabric-supplier-comparison/src/data/local-record-port.js',
'./apps/fabric-supplier-comparison/src/reports/report-model.js',
'./apps/fabric-supplier-comparison/src/i18n/app-copy.js',
'./apps/fabric-supplier-comparison/src/application/workspace-controller.js',
'./apps/claims-disputes/',
'./apps/claims-disputes/index.html',
'./apps/claims-disputes/assets/claims-disputes.css',
'./apps/claims-disputes/src/bootstrap.js',
'./apps/claims-disputes/src/domain/claim-register.js',
'./apps/claims-disputes/src/domain/exposure-ledger.js',
'./apps/claims-disputes/src/domain/settlement-history.js',
'./apps/claims-disputes/src/domain/reviewed-reference.js',
'./apps/claims-disputes/src/data/saved-copy-codec.js',
'./apps/claims-disputes/src/data/local-record-port.js',
'./apps/claims-disputes/src/reports/report-model.js',
'./apps/claims-disputes/src/i18n/app-copy.js',
'./apps/claims-disputes/src/application/workspace-controller.js'])
 assert(sw.includes("'"+url+"'"));
console.log('VESA DEMO RELEASE SOURCE PASS: synthetic-only public disclaimer, exact catalogue routes, updated service-worker cache.');
