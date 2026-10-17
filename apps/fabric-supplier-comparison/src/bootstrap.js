/* APP-12 one VESA global header, one browser-local fabric supplier controller. */
(function(root){
'use strict';
function start(){try{new root.VesaSupplierWorkspace().start();}
 catch(error){const node=document.getElementById('fsMain');if(node)node.textContent='Supplier comparison could not open on this device. Please reload.';console.error('Supplier app startup failed',error.message);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(typeof globalThis!=='undefined'?globalThis:this);
