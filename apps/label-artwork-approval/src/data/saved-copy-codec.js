/* APP-10 local checksum catches accidental changes, not tamper-proof signatures. */
(function(root){
'use strict';
class ArtworkCopyCodec{
 static format='VESA-LABEL-ARTWORK-COPY-1';
 static maxLength=2097152;
 static hash(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16).padStart(8,'0');}
 static validate(p){const E=root.VesaArtworkRevision,a=E.validate(p);if(!a.ok)throw Error(a.errors.join('; '));}
 static encode(p){this.validate(p);const json=JSON.stringify(p);return JSON.stringify({format:this.format,hash:this.hash(json),exportedAt:new Date().toISOString(),record:p});}
 static decode(text){if(typeof text!=='string'||text.length>this.maxLength)throw Error('Saved artwork copy exceeds safe size limit');
  let v;try{v=JSON.parse(text);}catch{throw Error('Saved artwork copy is unreadable; existing records unchanged');}
  if(v?.format!==this.format||!v.record||v.hash!==this.hash(JSON.stringify(v.record)))
   throw Error('Saved artwork copy altered/unsupported; existing records unchanged');
  this.validate(v.record);return root.VesaArtworkRevision.copy(v.record);
 }
}
root.VesaArtworkCopyCodec=ArtworkCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=ArtworkCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
