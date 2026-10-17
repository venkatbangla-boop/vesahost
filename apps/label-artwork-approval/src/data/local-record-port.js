/* APP-10 isolated browser-local artwork records; no other application storage reads. */
(function(root){
'use strict';
class ArtworkLocalStore{
 static prefix='vesa.label-artwork-approval.records.v1.';
 constructor(identity='local-browser-user'){this.key=ArtworkLocalStore.prefix+String(identity).trim().replace(/[^A-Za-z0-9-]/g,'-').slice(0,110);}
 static E(){if(!root.VesaArtworkRevision)throw Error('Artwork domain engine unavailable');return root.VesaArtworkRevision;}
 static validate(p){const a=this.E().validate(p);if(!a.ok)throw Error(a.errors.join('; '));}
 read(){let raw;try{raw=root.localStorage.getItem(this.key);}catch{throw Error('Device artwork storage unavailable');}
  if(!raw)return[];let data;try{data=JSON.parse(raw);}catch{throw Error('Artwork storage is damaged. Preserve your saved copies');}
  if(data?.version!==this.constructor.E().version||!Array.isArray(data.records))throw Error('Unsupported artwork storage; existing copies not erased');
  return data.records;
 }
 list(){return this.read().map(p=>({id:p.id,style:p.header?.style,itemType:p.header?.itemType,revision:p.revision,updatedAt:p.updatedAt}));}
 load(id){const p=this.read().find(x=>x.id===id);if(!p)return null;this.constructor.validate(p);return this.constructor.E().copy(p);}
 save(p){this.constructor.validate(p);const prior=this.read(),old=prior.find(x=>x.id===p.id);
  if(old&&Number.isSafeInteger(old.revision)&&p.revision<old.revision)throw Error('Older artwork evidence cannot replace a newer local revision');
  const json=JSON.stringify({version:this.constructor.E().version,records:[this.constructor.E().copy(p),...prior.filter(x=>x.id!==p.id)]});
  if(json.length>2097152)throw Error('Artwork storage is full; download a saved copy');
  try{root.localStorage.setItem(this.key,json);}catch{throw Error('Artwork save failed; older evidence was not intentionally removed');}
  return p.id;
 }
}
root.VesaArtworkLocalStore=ArtworkLocalStore;
if(typeof module!=='undefined'&&module.exports)module.exports=ArtworkLocalStore;
})(typeof globalThis!=='undefined'?globalThis:this);
