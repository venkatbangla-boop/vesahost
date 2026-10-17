/* APP-14 local-only per-browser identity store. No AQL/PO/LC/Shipment reads or cloud sync. */
(function(root){
'use strict';
class VesaClaimsLocalStore{
 static prefix='vesa.claims-disputes.records.v1.';
 constructor(identity='local-browser-user'){this.key=this.constructor.prefix+
   String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);}
 static validate(p){const a=root.VesaClaimRegister.validate(p);if(!a.ok)throw Error(a.errors.join('; '));}
 read(){
  let text;try{text=root.localStorage.getItem(this.key);}catch{throw Error('Browser-local claims storage unavailable');}
  if(!text)return[];
  let data;try{data=JSON.parse(text);}catch{throw Error('Existing claim source damaged; no records deleted');}
  if(data?.version!==root.VesaClaimRegister.version||!Array.isArray(data.records))
   throw Error('Existing claims records use an unsupported version; no data deleted');
  return data.records;
 }
 list(){return this.read().map(p=>({id:p.id,caseNumber:p.header?.caseNumber,
  buyer:p.header?.buyer,revision:p.revision,updatedAt:p.updatedAt}));}
 load(id){const p=this.read().find(x=>x.id===id);if(!p)return null;
  this.constructor.validate(p);return root.VesaClaimRegister.copy(p);}
 save(p){
  this.constructor.validate(p);const previous=this.read(),matching=previous.find(x=>x.id===p.id);
  if(matching&&Number.isSafeInteger(matching.revision)&&p.revision<matching.revision)
   throw Error('Older local claim revision cannot replace latest saved source');
  const data=JSON.stringify({version:root.VesaClaimRegister.version,
   records:[root.VesaClaimRegister.copy(p),...previous.filter(x=>x.id!==p.id)]});
  if(data.length>2097152)throw Error('Claims local storage limit; download a saved copy first');
  try{root.localStorage.setItem(this.key,data);}catch{throw Error('Claim save failed; earlier browser records retained');}
  return p.id;
 }
}
root.VesaClaimsLocalStore=VesaClaimsLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimsLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
