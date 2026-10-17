/* APP-08 portable copy checksum detects accidents, not forged identity/signatures. */
(function(root){
'use strict';
class FactoryVendorCopyCodec{
 static format='VESA-FACTORY-VENDOR-COPY-1';
 static maxLength=2097152;
 static hash(text){let x=2166136261;for(let i=0;i<text.length;i++){x^=text.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16).padStart(8,'0');}
 static validate(record){const E=root.VesaFactoryVendorProfile,a=E.validate(record);if(!a.ok)throw Error(a.errors.join('; '));}
 static encode(record){this.validate(record);const text=JSON.stringify(record);return JSON.stringify({format:this.format,hash:this.hash(text),exportedAt:new Date().toISOString(),record});}
 static decode(text){if(typeof text!=='string'||text.length>this.maxLength)throw Error('Saved vendor file exceeds the safe limit');
  let v;try{v=JSON.parse(text);}catch{throw Error('Saved vendor file is unreadable; existing records were not changed');}
  if(v?.format!==this.format||!v.record||v.hash!==this.hash(JSON.stringify(v.record)))
   throw Error('Saved vendor file altered/unsupported; existing records were not changed');
  this.validate(v.record);return root.VesaFactoryVendorProfile.clone(v.record);
 }
}
root.VesaFactoryVendorCopyCodec=FactoryVendorCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryVendorCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
