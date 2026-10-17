/* APP-04 local-only atomic repository and checksum portable saved copy.
 * Hash detects accidental alteration, not a digital buyer signature or authentication.
 */
(function(root){
'use strict';
class SamplingStore {
 static KEY='vesa.sampling-approval.records.v1.';
 constructor(user='local-browser-user'){
  this.key=SamplingStore.KEY+String(user).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,100);
 }
 static engine(){if(!root.VesaSamplingEngine)throw Error('Sampling engine unavailable.');
  return root.VesaSamplingEngine;}
 static validate(p){const result=SamplingStore.engine().validate(p);
  if(!result.ok)throw Error(result.errors.join('\n'));return result;
 }
 static hash(text){let x=2166136261;for(let i=0;i<text.length;i++){
   x^=text.charCodeAt(i);x=Math.imul(x,16777619);}
  return (x>>>0).toString(16).padStart(8,'0');
 }
 read(){
  let text;try{text=root.localStorage.getItem(this.key);}catch{throw Error('Local browser storage unavailable.');}
  if(!text)return [];
  let data;try{data=JSON.parse(text);}catch{throw Error('Local records appear damaged; download/copy your existing data before resetting.');}
  if(data?.version!==SamplingStore.engine().version||!Array.isArray(data.records))
    throw Error('Unsupported saved version; original local records have not been cleared.');
  return data.records;
 }
 list(){return this.read().map(p=>({id:p.id,poNo:p.header.poNo,style:p.header.style,
   updatedAt:p.updatedAt,revision:p.revision}));}
 load(id){const p=this.read().find(r=>r.id===id);
  if(!p)return null;SamplingStore.validate(p);return SamplingStore.engine().copy(p);
 }
 save(p){
  SamplingStore.validate(p);
  const existing=this.read();
  const payload=JSON.stringify({version:SamplingStore.engine().version,records:[SamplingStore.engine().copy(p),...existing.filter(x=>x.id!==p.id)]});
  if(payload.length>2097152)throw Error('Local saved records exceed safe limit. Download a saved copy.');
  const tmp=this.key+'.tmp';
  try{
    root.localStorage.setItem(tmp,payload);
    root.localStorage.setItem(this.key,payload);
  }catch{throw Error('Local save failed. Existing entries were not intentionally erased.');}
  finally{try{root.localStorage.removeItem(tmp);}catch{}}
  return p.id;
 }
 static encode(p){
  this.validate(p);
  const content=JSON.stringify(p);
  return JSON.stringify({format:SamplingStore.engine().format,checksum:this.hash(content),
    savedAt:new Date().toISOString(),record:p});
 }
 static decode(text){
  if(typeof text!=='string'||text.length>2097152)throw Error('Saved sample copy is missing or too large.');
  const data=JSON.parse(text);
  if(data?.format!==SamplingStore.engine().format||!data.record||
    this.hash(JSON.stringify(data.record))!==data.checksum)
    throw Error('Saved sample copy altered/unsupported; existing records were not replaced.');
  this.validate(data.record);return SamplingStore.engine().copy(data.record);
 }
}
root.VesaSamplingStore=SamplingStore;
if(typeof module!=='undefined'&&module.exports)module.exports=SamplingStore;
})(typeof globalThis!=='undefined'?globalThis:this);
