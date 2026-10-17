/* APP-11 strictly per-app/per-browser scoped records; never reads any sibling namespace. */
(function(root){
'use strict';
class BuyerCRMLocalStore{
 static prefix='vesa.buyer-crm.records.v1.';
 constructor(identity='local-browser-user'){this.key=BuyerCRMLocalStore.prefix+String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);}
 static validate(p){const result=root.VesaBuyerDirectory.validate(p);if(!result.ok)throw Error(result.errors.join('; '));}
 read(){let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Browser storage unavailable');}
  if(!raw)return[];let data;try{data=JSON.parse(raw);}catch{throw Error('Existing CRM data damaged; keep any saved copies before recovery');}
  if(data?.version!==root.VesaBuyerDirectory.version||!Array.isArray(data.records))throw Error('Unsupported CRM local records; existing data unchanged');
  return data.records;
 }
 list(){return this.read().map(x=>({id:x.id,name:x.header?.organizationName,territory:x.header?.territory,revision:x.revision,updatedAt:x.updatedAt}));}
 load(id){const found=this.read().find(x=>x.id===id);if(!found)return null;this.constructor.validate(found);return root.VesaBuyerDirectory.copy(found);}
 save(p){this.constructor.validate(p);const before=this.read(),prior=before.find(x=>x.id===p.id);
  if(prior&&Number.isSafeInteger(prior.revision)&&p.revision<prior.revision)throw Error('Older CRM copy cannot overwrite a newer revision');
  const text=JSON.stringify({version:root.VesaBuyerDirectory.version,records:[root.VesaBuyerDirectory.copy(p),...before.filter(x=>x.id!==p.id)]});
  if(text.length>2097152)throw Error('CRM browser storage limit reached; download saved copy first');
  try{root.localStorage.setItem(this.key,text);}catch{throw Error('Device storage save failed; earlier CRM records not intentionally erased');}
  return p.id;
 }
}
root.VesaBuyerCRMLocalStore=BuyerCRMLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=BuyerCRMLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
