/* APP-08 app-specific local records; never reads other apps or uploads vendor data. */
(function(root){
'use strict';
class FactoryVendorLocalStore{
 static prefix='vesa.factory-vendor.records.v1.';
 constructor(identity='local-browser-user'){this.key=FactoryVendorLocalStore.prefix+String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);}
 static E(){if(!root.VesaFactoryVendorProfile)throw Error('Factory domain missing');return root.VesaFactoryVendorProfile;}
 static validate(record){const a=this.E().validate(record);if(!a.ok)throw Error(a.errors.join('; '));}
 read(){let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Device storage unavailable');}
  if(!raw)return[];let data;try{data=JSON.parse(raw);}catch{throw Error('Existing vendor data damaged: preserve saved copy before recovery');}
  if(data?.version!==this.constructor.E().version||!Array.isArray(data.records))throw Error('Unsupported saved vendor version; existing data not erased');
  return data.records;
 }
 list(){return this.read().map(x=>({id:x.id,vendorName:x.header?.vendorName,country:x.header?.country,updatedAt:x.updatedAt,revision:x.revision}));}
 load(id){const x=this.read().find(z=>z.id===id);if(!x)return null;this.constructor.validate(x);return this.constructor.E().clone(x);}
 save(record){this.constructor.validate(record);const existing=this.read(),prior=existing.find(x=>x.id===record.id);
  if(prior&&Number.isSafeInteger(prior.revision)&&record.revision<prior.revision)
   throw Error('Older vendor evidence cannot overwrite newer local review');
  const body=JSON.stringify({version:this.constructor.E().version,records:[this.constructor.E().clone(record),...existing.filter(x=>x.id!==record.id)]});
  if(body.length>2097152)throw Error('Device storage full: download saved copy before continuing');
  try{root.localStorage.setItem(this.key,body);}catch{throw Error('Device save failed. Existing vendor records were not intentionally cleared');}
  return record.id;
 }
}
root.VesaFactoryVendorLocalStore=FactoryVendorLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=FactoryVendorLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
