/* APP-06 fabric workflow entrypoint, one mounted VESA workspace. */
(function(root){
'use strict';
const start=()=>{if(!root.VesaFabricWorkspace)throw Error('Fabric workspace unavailable.');
 root.VesaFabric360=new root.VesaFabricWorkspace();
 root.VesaFabric360.start();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})(typeof globalThis!=='undefined'?globalThis:this);
