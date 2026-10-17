/* APP-11 one shared VESA shell and app-owned content. */
(function(root){
'use strict';
function start(){try{new root.VesaBuyerCRMWorkspace().start();}
 catch(error){const node=document.getElementById('crmMain');if(node)node.textContent='CRM could not open on this device. Please reload.';console.error('CRM startup failed',error.message);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(typeof globalThis!=='undefined'?globalThis:this);
