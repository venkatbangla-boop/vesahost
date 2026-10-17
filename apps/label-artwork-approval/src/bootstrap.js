/* APP-10 uses the existing VESA workspace shell, no duplicated top chrome. */
(function(root){
'use strict';
function start(){try{new root.VesaArtworkWorkspace().start();}
 catch(error){const main=document.getElementById('laMain');if(main)main.textContent='Artwork workspace could not open. Check this device and reload.';
  console.error('Artwork startup blocked',error.message);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(typeof globalThis!=='undefined'?globalThis:this);
