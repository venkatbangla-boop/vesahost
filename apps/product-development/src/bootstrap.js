/* APP-15 one existing VESA workspace shell and local-only Product Development controller. */
(function(root){
'use strict';
function start(){
 try{new root.VesaProductWorkspace().start();}
 catch(error){const node=document.getElementById('pdMain');
  if(node)node.textContent='Product Development workspace could not open on this device. Please reload.';
  console.error('Product Development startup unavailable:',error.message);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})(typeof globalThis!=='undefined'?globalThis:this);
