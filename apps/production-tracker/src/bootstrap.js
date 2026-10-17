/* APP-09: no secondary header or hidden provider calls. */
(function(root){
'use strict';
function boot(){try{const app=new root.VesaProductionWorkspace();app.start();}
 catch(error){const el=document.getElementById('ptMain');if(el)el.textContent='Production workspace unavailable. Please check this browser and reload.';console.error('Production workspace setup blocked:',error.message);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
