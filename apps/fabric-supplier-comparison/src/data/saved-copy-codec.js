/* APP-12 portable checksum detects accidental file alteration, NOT encryption, signing or supplier authenticity. */
(function(root){
'use strict';
class VesaSupplierCopyCodec{
 static format='VESA-FABRIC-SUPPLIER-COPY-1';
 static maxLength=2097152;
 static hash(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16).padStart(8,'0');}
 static validate(p){const a=root.VesaSupplierQuote.validate(p);if(!a.ok)throw Error(a.errors.join('; '));}
 static encode(p){this.validate(p);const record=JSON.stringify(p);return JSON.stringify({format:this.format,hash:this.hash(record),exportedAt:new Date().toISOString(),record:p});}
 static decode(s){if(typeof s!=='string'||s.length>this.maxLength)throw Error('Saved supplier source exceeds safe browser file size');
  let data;try{data=JSON.parse(s);}catch{throw Error('Saved supplier source is unreadable; earlier data unchanged');}
  if(data?.format!==this.format||!data.record||
   data.hash!==this.hash(JSON.stringify(data.record)))throw Error('Saved supplier source altered/unsupported; earlier data unchanged');
  this.validate(data.record);return root.VesaSupplierQuote.copy(data.record);
 }
}
root.VesaSupplierCopyCodec=VesaSupplierCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
