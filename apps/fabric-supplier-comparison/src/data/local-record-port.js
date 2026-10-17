/* APP-12 isolated per-session-browser local material-offer store. No cloud/sibling app records. */
(function(root){
'use strict';
class VesaSupplierLocalStore{
 static prefix='vesa.fabric-supplier-comparison.records.v1.';
 constructor(identity='local-browser-user'){this.key=this.constructor.prefix+String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);}
 static E(){if(!root.VesaSupplierQuote)throw Error('Fabric supplier domain missing');return root.VesaSupplierQuote;}
 static validate(p){const a=this.E().validate(p);if(!a.ok)throw Error(a.errors.join('; '));}
 read(){let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Browser-local supplier storage unavailable');}
  if(!raw)return[];let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('Existing supplier copies damaged; no records cleared');}
  if(parsed?.version!==this.constructor.E().version||!Array.isArray(parsed.records))
   throw Error('Unsupported existing supplier records; download copies before recovery');
  return parsed.records;
 }
 list(){return this.read().map(p=>({id:p.id,article:p.requirement?.article,composition:p.requirement?.composition,
   revision:p.revision,updatedAt:p.updatedAt}));}
 load(id){const p=this.read().find(x=>x.id===id);if(!p)return null;this.constructor.validate(p);
  return this.constructor.E().copy(p);}
 save(p){this.constructor.validate(p);const old=this.read(),prev=old.find(x=>x.id===p.id);
  if(prev&&Number.isSafeInteger(prev.revision)&&p.revision<prev.revision)
   throw Error('Older supplier source cannot overwrite newer saved revision');
  const body=JSON.stringify({version:this.constructor.E().version,
    records:[this.constructor.E().copy(p),...old.filter(x=>x.id!==p.id)]});
  if(body.length>2097152)throw Error('Browser storage limit reached; download a saved copy first');
  try{root.localStorage.setItem(this.key,body);}catch{throw Error('Device save failed; existing supplier source remains stored');}
  return p.id;
 }
}
root.VesaSupplierLocalStore=VesaSupplierLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
