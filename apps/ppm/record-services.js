'use strict';
/** PPM portability and recovery boundary. Depends on core record/schema classes only.
 * No DOM rendering or network writes. External backups are rebuilt from known fields;
 * unknown keys never enter domain state. V4 records are migrated without overwriting originals. */
class BackupCodec {
  static MAX_BYTES = 24 * 1024 * 1024;
  /** Decode a legacy record or versioned envelope. Throws before any state mutation. */
  decode(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('This saved copy could not be opened. Choose a PPM copy downloaded from this app.');
    if (input.format && (input.format !== 'VESA-PPM' || input.schema !== 1)) throw Error('This saved copy cannot be opened by this app. Check that you chose a PPM saved copy.');
    const v = input.format ? input.record : input;
    if (!v || !v.meta || !v.statuses || typeof v.id !== 'string' || !/^PPM-[A-Za-z0-9_-]{1,100}$/.test(v.id)) throw Error('This is not a complete PPM saved copy. Choose another saved copy.');
    if (v.version && !/^[45]\./.test(v.version)) throw Error('This saved copy needs a newer app. Check for updates and try again.');
    const r=PpmRecordFactory.create(); r.id=v.id; r.version=APP_VERSION;
    r.createdAt=this.dateTime(v.createdAt); r.updatedAt=this.dateTime(v.updatedAt); r.locked=this.bool(v.locked); r.training=this.bool(v.training);
    for(const k of Object.keys(r.meta)) if(k!=='processes' && v.meta[k]!==undefined) r.meta[k]=this.string(v.meta[k], k==='specialInstruction'?5000:500);
    r.meta.processes=this.array(v.meta.processes||[],PROCESS_OPTIONS.length).map(x=>this.enum(x,PROCESS_OPTIONS.map(p=>p[0])));
    this.enum(r.meta.profile,GARMENT_PROFILES.map(p=>p.id));
    this.enum(r.meta.construction,['','knit','woven','denim','sweater','other']);
    this.enum(r.meta.productClass,['','top','bottom','dress','outerwear','activewear','intimate','kids','uniform','other']);
    r.customCheckpoints=this.array(v.customCheckpoints||[],100).map(c=>({id:this.id(c.id,'CUST-'),section:this.enum(c.section,SECTION_SCHEMA.map(s=>s.id)),label:this.string(c.label,500),hint:this.string(c.hint||'',1500),critical:this.bool(c.critical)}));
    const ids=[...Object.keys(r.statuses),...r.customCheckpoints.map(c=>c.id)];
    if(new Set(ids).size!==ids.length)throw Error('This saved copy contains repeated checkpoints. Choose another saved copy.');
    for(const id of ids){r.statuses[id]=this.enum(v.statuses[id]||'',['',...STATUS_VALUES]);r.remarks[id]=this.string(v.remarks?.[id]||'',5000)}
    for(const role of PARTICIPANT_ROLES){const p=v.participants?.[role];if(p)r.participants[role]={present:this.bool(p.present),name:this.string(p.name||'',200)}}
    r.measurements=this.array(v.measurements||[],100).map(m=>Object.fromEntries(Object.keys(PpmRecordFactory.measurement()).map(k=>[k,this.string(m[k]||'',500)])));
    r.actions=this.array(v.actions||[],300).map(a=>({id:this.id(a.id),checkpointId:this.enum(a.checkpointId,ids),issue:this.string(a.issue||'',1000),action:this.string(a.action||'',5000),owner:this.string(a.owner||'',200),dueDate:this.date(a.dueDate||''),evidence:this.string(a.evidence||'',2000),status:this.enum(a.status,['Open','In Progress','Closed'])}));
    if(new Set(r.actions.map(a=>a.id)).size!==r.actions.length||new Set(r.actions.map(a=>a.checkpointId)).size!==r.actions.length)throw Error('This saved copy contains repeated actions. Choose another saved copy.');
    r.photos={style:this.image(v.photos?.style||''),evidence:{}};
    for(const [id] of EVIDENCE_SLOTS)r.photos.evidence[id]=this.image(v.photos?.evidence?.[id]||'');
    r.signatures={};for(const [id] of SIGNATURE_ROLES){const q=v.signatures?.[id];if(q)r.signatures[id]={image:this.image(q.image||''),name:this.string(q.name||'',200),designation:this.string(q.designation||'',200),date:this.date(q.date||''),time:this.string(q.time||'',10)}}
    r.release={decision:this.enum(v.release?.decision||'',['','GO','CONDITIONAL GO','HOLD']),notes:this.string(v.release?.notes||'',5000)};
    r.ui={mode:this.enum(v.ui?.mode||'fast',['fast','full']),filter:this.enum(v.ui?.filter||'all',['all','unreviewed','action','critical']),search:this.string(v.ui?.search||'',200),hideNA:this.bool(v.ui?.hideNA)};
    r.lastBackupAt=v.lastBackupAt?this.dateTime(v.lastBackupAt):'';
    // Reconstruct missing ACTION links from old backups; never turn a missing action into closure.
    const tracker=new ActionTrackerManager(); for(const s of new RelevanceEngine().sections(r))for(const i of s.items)if(r.statuses[i[0]]==='ACTION'&&!r.actions.some(a=>a.checkpointId===i[0]))tracker.sync(r,i[0],i[1],'ACTION');
    return r;
  }
  /** Validate raster bytes, not executable URLs. Actual decoding is checked before import commit. */
  image(v){if(v==='')return '';if(typeof v!=='string'||v.length>3*1024*1024||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v))throw Error('A photo in this saved copy could not be opened. Try another saved copy.');const b=atob(v.split(',')[1]);if(!(b.startsWith('\x89PNG\r\n\x1a\n')||b.startsWith('\xff\xd8\xff')||(b.startsWith('RIFF')&&b.slice(8,12)==='WEBP')))throw Error('A photo in this saved copy could not be opened. Try another saved copy.');return v}
  /** Decode images with a pixel limit before changing active record; rejects corrupt raster bytes. */
  async verifyImages(r){for(const src of [r.photos.style,...Object.values(r.photos.evidence),...Object.values(r.signatures).map(s=>s.image)].filter(Boolean)){const img=await new ImageService().load(src);if(img.naturalWidth*img.naturalHeight>40000000)throw Error('A photo in this saved copy is too large. Try a copy with smaller photos.')}}
  string(v,max){if(typeof v!=='string'||v.length>max)throw Error('Some text in this saved copy could not be opened. Choose another saved copy.');return v}
  array(v,max){if(!Array.isArray(v)||v.length>max)throw Error('This saved copy contains too many or incomplete entries. Choose another saved copy.');return v}
  enum(v,values){if(!values.includes(v))throw Error('Some details in this saved copy could not be opened. Choose another saved copy.');return v}
  bool(v){if(v===undefined)return false;if(typeof v!=='boolean')throw Error('Some details in this saved copy could not be opened. Choose another saved copy.');return v}
  id(v,prefix=''){if(typeof v!=='string'||!v.startsWith(prefix)||!/^[A-Za-z0-9_-]{1,120}$/.test(v))throw Error('This saved copy has missing or incorrect meeting details. Choose another saved copy.');return v}
  date(v){if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('A date in this saved copy could not be read. Choose another saved copy.');return this.string(v,10)}
  dateTime(v){if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))throw Error('A saved date in this copy could not be read. Choose another saved copy.');return v}
  encode(r){return JSON.stringify({format:'VESA-PPM',schema:1,exportedAt:new Date().toISOString(),record:r},null,2)}
}

/** Owns bounded in-session undo and redo. Controller calls reset on record switches and
 * capture after mutation. Snapshots are deep copies, capped at 30 or 32 MB combined. */
class RecordHistory {
  constructor(){this.states=[];this.index=-1}
  reset(r){this.states=[JSON.stringify(r)];this.index=0}
  capture(r){const raw=JSON.stringify(r);if(raw===this.states[this.index])return;this.states.splice(this.index+1);this.states.push(raw);while(this.states.length>30||this.states.length>1&&this.states.reduce((n,x)=>n+x.length,0)>32*1024*1024)this.states.shift();this.index=this.states.length-1}
  move(delta){const i=this.index+delta;if(i<0||i>=this.states.length)return null;this.index=i;return JSON.parse(this.states[i])}
}

/** Persistent recovery snapshots, separate from production records and active-ID index.
 * Own database and bounded per-record storage. Failures propagate for visible warning;
 * main-record autosave remains independent. No silent claim of recovery in memory-only mode. */
class RecoveryRepository {
  constructor(){this.db=null;this.last=new Map()}
  async init(){this.db=await new Promise((resolve,reject)=>{const q=indexedDB.open('vesa-ppm-recovery',1);q.onupgradeneeded=()=>q.result.createObjectStore('snapshots',{keyPath:'key'});q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
  async list(id){if(!this.db)return [];return new Promise((resolve,reject)=>{const q=this.db.transaction('snapshots').objectStore('snapshots').getAll();q.onsuccess=()=>resolve(q.result.filter(x=>x.record.id===id).sort((a,b)=>b.at-a.at));q.onerror=()=>reject(q.error)})}
  /** Called after durable save. At most once/minute unless a destructive operation forces it. */
  async save(record,force=false){if(!this.db)throw Error('Earlier saved versions are unavailable');if(!force&&Date.now()-(this.last.get(record.id)||0)<60000)return;const rows=await this.list(record.id),at=Date.now();await new Promise((resolve,reject)=>{const tx=this.db.transaction('snapshots','readwrite'),s=tx.objectStore('snapshots');s.put({key:`${record.id}:${at}`,at,record:U.clone(record)});for(const x of rows.slice(9))s.delete(x.key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});this.last.set(record.id,at)}
}
