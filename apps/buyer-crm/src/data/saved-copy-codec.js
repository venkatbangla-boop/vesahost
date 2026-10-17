/* APP-11 portable local copy checksum is accidental-change detection, NOT encryption/signature. */
(function(root){
'use strict';
class BuyerCRMCopyCodec{
 static format='VESA-BUYER-CRM-COPY-1';static maxLength=2097152;
 static hash(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16).padStart(8,'0');}
 static validate(p){const a=root.VesaBuyerDirectory.validate(p);if(!a.ok)throw Error(a.errors.join('; '));}
 static encode(p){this.validate(p);const body=JSON.stringify(p);return JSON.stringify({format:this.format,hash:this.hash(body),exportedAt:new Date().toISOString(),record:p});}
 static decode(s){if(typeof s!=='string'||s.length>this.maxLength)throw Error('Saved Buyer CRM file exceeds local limit');
  let x;try{x=JSON.parse(s);}catch{throw Error('Saved Buyer CRM file is unreadable; existing data unchanged');}
  if(x?.format!==this.format||!x.record||x.hash!==this.hash(JSON.stringify(x.record)))throw Error('Saved Buyer CRM file altered/unsupported; existing data unchanged');
  this.validate(x.record);return root.VesaBuyerDirectory.copy(x.record);
 }
}
root.VesaBuyerCRMCopyCodec=BuyerCRMCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=BuyerCRMCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
