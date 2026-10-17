/* APP-09 portable browser copy; checksum catches accidental tampering,
 * it is NOT a digital signature, server identity or access control.
 */
(function(root){
'use strict';
class ProductionCopyCodec {
 static format='VESA-PRODUCTION-360-COPY-1';
 static maxLength=2097152;
 static hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
 static validate(record){const L=root.VesaProductionDailyLedger;if(!L)throw Error('Production domain unavailable');const result=L.validate(record);if(!result.ok)throw Error(result.errors.join('; '));}
 static encode(record){this.validate(record);const raw=JSON.stringify(record);return JSON.stringify({format:this.format,hash:this.hash(raw),exportedAt:new Date().toISOString(),record});}
 static decode(text){if(typeof text!=='string'||text.length>this.maxLength)throw Error('Production saved copy exceeds safe size');
  let env;try{env=JSON.parse(text);}catch{throw Error('Saved copy is not readable; original records remain unchanged');}
  if(env?.format!==this.format||!env.record||env.hash!==this.hash(JSON.stringify(env.record)))
   throw Error('Saved production copy altered/unsupported; original records remain unchanged');
  this.validate(env.record);return JSON.parse(JSON.stringify(env.record));
 }
}
root.VesaProductionCopyCodec=ProductionCopyCodec;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionCopyCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
