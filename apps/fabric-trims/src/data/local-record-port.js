/* APP-06 material records remain in browser-local scoped storage.
 * Saved-copy hash guards corruption only. No remote sync or financial authority.
 */
(function(root){
'use strict';
class FabricStore {
 static keyPrefix='vesa.fabric-trims.records.v1.';
 constructor(user='local-browser-user'){
  this.key=FabricStore.keyPrefix+String(user).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,100);
 }
 static engine(){if(!root.VesaFabricEngine)throw Error('Fabric engine missing.');return root.VesaFabricEngine;}
 static validate(p){const calc=FabricStore.engine().calculate(p);
  if(!calc.ok)throw Error(calc.errors.join('\n'));return calc;}
 static hash(value){let code=2166136261;for(let i=0;i<value.length;i++){
  code^=value.charCodeAt(i);code=Math.imul(code,16777619);}
  return (code>>>0).toString(16).padStart(8,'0');
 }
 read(){let raw;try{raw=root.localStorage.getItem(this.key);}
  catch{throw Error('Browser local storage unavailable.');}
  if(!raw)return [];
  let box;try{box=JSON.parse(raw);}catch{throw Error('Local material record damaged; no records were erased.');}
  if(box.version!==FabricStore.engine().version||!Array.isArray(box.records))
   throw Error('Unsupported saved material record version; existing data preserved.');
  return box.records;
 }
 list(){return this.read().map(p=>({id:p.id,poNo:p.header.poNo,style:p.header.style,
  revision:p.revision,updatedAt:p.updatedAt}));}
 load(id){const p=this.read().find(x=>x.id===id);if(!p)return null;FabricStore.validate(p);
  return FabricStore.engine().copy(p);}
 save(p){
  FabricStore.validate(p);
  const next=JSON.stringify({version:FabricStore.engine().version,
   records:[FabricStore.engine().copy(p),...this.read().filter(x=>x.id!==p.id)]});
  if(next.length>2097152)throw Error('Saved material records exceed safe local quota. Download a saved copy.');
  try{root.localStorage.setItem(this.key+'.tmp',next);root.localStorage.setItem(this.key,next);}
  catch{throw Error('Unable to save on this device. Previous data was not intentionally removed.');}
  finally{try{root.localStorage.removeItem(this.key+'.tmp');}catch{}}
  return p.id;
 }
 static encode(p){this.validate(p);const text=JSON.stringify(p);
  return JSON.stringify({format:this.engine().format,checksum:this.hash(text),
   record:p,savedAt:new Date().toISOString()});
 }
 static decode(text){
  if(typeof text!=='string'||text.length>2097152)throw Error('Saved material copy missing/oversize.');
  const box=JSON.parse(text);
  if(box?.format!==this.engine().format||!box.record||
    box.checksum!==this.hash(JSON.stringify(box.record)))
   throw Error('Saved material copy altered/unsupported; existing records unchanged.');
  this.validate(box.record);return this.engine().copy(box.record);
 }
}
root.VesaFabricStore=FabricStore;
if(typeof module!=='undefined'&&module.exports)module.exports=FabricStore;
})(typeof globalThis!=='undefined'?globalThis:this);
