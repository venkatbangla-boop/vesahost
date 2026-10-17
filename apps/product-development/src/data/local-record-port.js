/* APP-15 browser-only per-user Product Development record adapter.
 * No backend, network, sibling app storage, remote asset fetch or automatic buyer/TechPack approval.
 * Failed validation and malformed local records never trigger data erasure.
 */
(function(root){
'use strict';
class VesaProductLocalStore{
 static prefix='vesa.product-development.records.v1.';
 constructor(identity='local-browser-user'){
  this.key=VesaProductLocalStore.prefix+
   String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);
 }
 static checked(record){const v=root.VesaProductConceptRegister.validate(record);
  if(!v.ok)throw Error(v.errors.join('; '));}
 read(){
  let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Local concept storage is unavailable');}
  if(!raw)return[];
  let data;try{data=JSON.parse(raw);}catch{throw Error('Local saved concepts appear damaged; records were NOT deleted');}
  if(data?.version!==root.VesaProductConceptRegister.version||!Array.isArray(data.records))
   throw Error('Unsupported local concept record version; existing records were NOT cleared');
  return data.records;
 }
 list(){return this.read().map(p=>({id:p.id,name:p.header?.conceptName,
  season:p.header?.season,revision:p.revision,updatedAt:p.updatedAt}));}
 load(id){const row=this.read().find(p=>p.id===id);if(!row)return null;
  this.constructor.checked(row);return root.VesaProductConceptRegister.copy(row);}
 save(p){
  this.constructor.checked(p);const previous=this.read(),old=previous.find(x=>x.id===p.id);
  if(old&&old.revision>p.revision)throw Error('Older concept revision cannot replace latest local copy');
  if(old&&old.revision===p.revision&&JSON.stringify(old)!==JSON.stringify(p))
   throw Error('Different same-version concept cannot overwrite existing source');
  const newData=JSON.stringify({version:root.VesaProductConceptRegister.version,
   records:[root.VesaProductConceptRegister.copy(p),...previous.filter(x=>x.id!==p.id)]});
  if(newData.length>2097152)throw Error('Browser concept storage full; download a saved copy first');
  try{root.localStorage.setItem(this.key,newData);}catch{throw Error('Concept save failed; existing device records retained');}
  return p.id;
 }
}
root.VesaProductLocalStore=VesaProductLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
