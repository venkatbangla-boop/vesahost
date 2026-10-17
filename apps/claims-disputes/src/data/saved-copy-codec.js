/* APP-14 portable source copy checksum catches accident, not signature, security or legal proof. */
(function(root){
'use strict';
class VesaClaimsCopyCodec{
 static format='VESA-CLAIMS-DISPUTES-COPY-1';static maxLength=2097152;
 static hash(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16).padStart(8,'0');}
 static validate(p){const test=root.VesaClaimRegister.validate(p);if(!test.ok)throw Error(test.errors.join('; '));}
 static encode(p){this.validate(p);const value=JSON.stringify(p);return JSON.stringify({format:this.format,
  hash:this.hash(value),exportedAt:new Date().toISOString(),record:p});}
 static decode(content){
  if(typeof content!=='string'||content.length>this.maxLength)throw Error('Saved claim source file exceeds safety limit');
  let data;try{data=JSON.parse(content);}catch{throw Error('Unrecognized saved claim copy; original browser records unchanged');}
  if(data?.format!==this.format||!data.record||data.hash!==this.hash(JSON.stringify(data.record)))
   throw Error('Altered/unsupported Claims saved copy rejected; original records unchanged');
  this.validate(data.record);return root.VesaClaimRegister.copy(data.record);
 }
}
root.VesaClaimsCopyCodec=VesaClaimsCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimsCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
