/* APP-07 one shared-shell workspace entry per document lifecycle. */
(function(root){
'use strict';
function start(){
 if(!root.VesaShipmentWorkspace)throw Error('Shipment & Documentation workspace unavailable.');
 root.VesaShipment360=new root.VesaShipmentWorkspace();root.VesaShipment360.start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})(typeof globalThis!=='undefined'?globalThis:this);