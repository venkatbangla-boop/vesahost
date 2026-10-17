/* APP-09 browser-only isolated records. Never accesses sibling app storage. */
(function(root){
'use strict';
class ProductionLocalStore {
 static prefix='vesa.production-tracker.records.v1.';
 constructor(identity='local-browser-user'){
  this.key=ProductionLocalStore.prefix+String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,108);
 }
 static engine(){if(!root.VesaProductionDailyLedger)throw Error('Production domain unavailable');return root.VesaProductionDailyLedger;}
 static check(record){const a=this.engine().validate(record);if(!a.ok)throw Error(a.errors.join('; '));}
 read(){let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Local production storage unavailable');}
  if(!raw)return [];
  let o;try{o=JSON.parse(raw);}catch{throw Error('Existing saved production data appears damaged; no records were erased');}
  if(o?.version!==root.VesaProductionStageFlow.version||!Array.isArray(o.records))
   throw Error('Unsupported saved production version; existing records were not erased');
  return o.records;
 }
 list(){return this.read().map(x=>({id:x.id,poNo:x.header?.poNo,style:x.header?.style,updatedAt:x.updatedAt,revision:x.revision}));}
 load(id){const x=this.read().find(y=>y.id===id);if(!x)return null;
  ProductionLocalStore.check(x);return JSON.parse(JSON.stringify(x));
 }
 save(record){ProductionLocalStore.check(record);
  const all=this.read(),current=all.find(x=>x.id===record.id);
  if(current&&Number.isSafeInteger(current.revision)&&record.revision<current.revision)
   throw Error('Older production revision cannot overwrite a newer local record');
  const next=JSON.stringify({version:root.VesaProductionStageFlow.version,records:[JSON.parse(JSON.stringify(record)),...all.filter(x=>x.id!==record.id)]});
  if(next.length>2097152)throw Error('Local production storage capacity reached; download a saved copy');
  try{root.localStorage.setItem(this.key,next);}catch{throw Error('Device storage failed; keep a downloaded saved copy');}
  return record.id;
 }
}
root.VesaProductionLocalStore=ProductionLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
