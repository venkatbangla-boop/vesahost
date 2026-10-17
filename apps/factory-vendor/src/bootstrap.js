/* APP-08 — only VESA shared shell; no second top-level header. */
(function(root){
'use strict';
function start(){try{new root.VesaFactoryVendorWorkspace().start();}
 catch(error){const main=document.getElementById('fvMain');if(main)main.textContent='Factory workspace could not open. Check this device and reload.';console.error('Factory startup blocked',error.message);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(typeof globalThis!=='undefined'?globalThis:this);
