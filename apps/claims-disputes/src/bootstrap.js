/* APP-14 shared VESA shell with locally saved source-only claim cases. */
(function(root){
'use strict';
function start(){try{new root.VesaClaimsWorkspace().start();}
 catch(error){const node=document.getElementById('clmMain');if(node)node.textContent='Claims workspace could not open on this device. Please reload.';console.error('Claims startup failed',error.message);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(typeof globalThis!=='undefined'?globalThis:this);
