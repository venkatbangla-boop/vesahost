/* APP-07 browser scoped storage and portable checksum recovery (not a signature). */
(function(root){
'use strict';
class ShipmentStore {
 static prefix='vesa.shipment-documentation.records.v1.';
 constructor(user='local-browser-user'){
  this.key=ShipmentStore.prefix+String(user).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);
 }
 static engine(){if(!root.VesaShipmentEngine)throw Error('Shipment domain missing.');return root.VesaShipmentEngine;}
 static validate(p){const x=this.engine().analyze(p);if(!x.ok)throw Error(x.errors.join('\n'));return x;}
 static hash(text){let hash=2166136261;for(let i=0;i<text.length;i++){
  hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,'0');}
 read(){
  let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Local device storage unavailable.');}
  if(!raw)return [];
  let data;try{data=JSON.parse(raw);}catch{throw Error('Existing local records damaged. Preserve before recovery.');}
  if(data?.version!==ShipmentStore.engine().version||!Array.isArray(data.records))
   throw Error('Unsupported local shipment version. Previous records were not erased.');
  return data.records;
 }
 list(){return this.read().map(x=>({id:x.id,poNo:x.header.poNo,invoiceNo:x.header.invoiceNo,
  updatedAt:x.updatedAt,revision:x.revision}));}
 load(id){const p=this.read().find(x=>x.id===id);
  if(!p)return null;ShipmentStore.validate(p);return ShipmentStore.engine().copy(p);}
 save(p){
  ShipmentStore.validate(p);const items=[ShipmentStore.engine().copy(p),...this.read().filter(x=>x.id!==p.id)];
  const encoded=JSON.stringify({version:ShipmentStore.engine().version,records:items});
  if(encoded.length>2097152)throw Error('Shipment local storage limit reached. Download saved copy.');
  const tmp=this.key+'.tmp';
  try{root.localStorage.setItem(tmp,encoded);root.localStorage.setItem(this.key,encoded);}
  catch{throw Error('Device save failed. Existing shipment records were not intentionally cleared.');}
  finally{try{root.localStorage.removeItem(tmp);}catch{}}
  return p.id;
 }
 static encode(p){ShipmentStore.validate(p);const text=JSON.stringify(p);
  return JSON.stringify({format:this.engine().format,checksum:this.hash(text),
   exportedAt:new Date().toISOString(),record:p});}
 static decode(text){
  if(typeof text!=='string'||text.length>2097152)throw Error('Saved shipment file too large or missing.');
  const data=JSON.parse(text);
  if(data?.format!==this.engine().format||!data.record||
    data.checksum!==this.hash(JSON.stringify(data.record)))
   throw Error('Saved shipment file altered/unsupported. Existing copies remain unchanged.');
  this.validate(data.record);return this.engine().copy(data.record);
 }
}
root.VesaShipmentStore=ShipmentStore;
if(typeof module!=='undefined'&&module.exports)module.exports=ShipmentStore;
})(typeof globalThis!=='undefined'?globalThis:this);