/* APP-04 small lifecycle initializer. One VESA workspace instance only. */
(function(root){
 'use strict';
 const open=()=>{if(!root.VesaSamplingWorkspace)throw Error('Sampling workspace missing.');
  root.VesaSampling360=new root.VesaSamplingWorkspace();
  root.VesaSampling360.start();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',open,{once:true});
 else open();
})(typeof globalThis!=='undefined'?globalThis:this);
