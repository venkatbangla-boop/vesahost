/* APP-15 versioned local portable Product Development copy; checksum only, NOT artwork rights proof.
 * Caller must choose a file; rejection never changes prior device records or calls another application.
 */
(function(root){
'use strict';
class VesaProductCopyCodec{
 static format='VESA-PRODUCT-DEVELOPMENT-COPY-1';
 static maxLength=2097152;
 static hash(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16).padStart(8,'0');}
 static checked(p){const e=root.VesaProductConceptRegister.validate(p);if(!e.ok)throw Error(e.errors.join('; '));}
 static encode(p){this.checked(p);const content=JSON.stringify(p);
  const result=JSON.stringify({format:this.format,hash:this.hash(content),savedAt:new Date().toISOString(),record:p});
  if(result.length>this.maxLength)throw Error('Portable concept copy exceeds local 2MB limit');
  return result;
 }
 static decode(content){
  if(typeof content!=='string'||!content||content.length>this.maxLength)
   throw Error('Saved concept copy missing or exceeds 2MB local safety limit');
  let data;try{data=JSON.parse(content);}catch{throw Error('Unrecognized concept copy; earlier records untouched');}
  if(data?.format!==this.format||!data.record||data.hash!==this.hash(JSON.stringify(data.record)))
   throw Error('Altered or unsupported concept saved copy rejected; earlier records untouched');
  this.checked(data.record);return root.VesaProductConceptRegister.copy(data.record);
 }
}
root.VesaProductCopyCodec=VesaProductCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
