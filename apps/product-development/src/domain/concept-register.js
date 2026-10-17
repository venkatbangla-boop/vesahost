/* APP-15 owns sourced draft product concepts, colourway proposals and requested work only.
 * No DOM, storage, external images, confirmed Tech Pack, buyer sample decision, price, PO or production approval.
 * Entry: UI/controller calls create/append/validate/summarize. All failed inputs preserve original records.
 */
(function(root){
'use strict';
class VesaProductConceptRegister{
 static version='VESA-PRODUCT-DEVELOPMENT-360-1';
 static format='VESA-PRODUCT-DEVELOPMENT-COPY-1';
 static draft='DRAFT PROPOSAL — NOT BUYER APPROVED / NOT PRODUCTION READY';
 static copy(p){return JSON.parse(JSON.stringify(p));}
 static text(v){return typeof v==='string'?v.trim():'';}
 static valid(v,n=240){return !!this.text(v)&&this.text(v).length<=n;}
 static optional(v,n=2000){return v===undefined||(typeof v==='string'&&v.length<=n);}
 static date(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v))return false;
  const t=Date.parse(v+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v;}
 static id(prefix='CONCEPT'){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static header(h){
  const e=[];
  for(const key of ['conceptName','category','season','market','sourceRef','reviewedBy'])
   if(!this.valid(h?.[key],350))e.push('Concept requires explicitly sourced '+key);
  if(!this.date(h?.reviewDate))e.push('Concept needs exact local source review date');
  for(const key of ['silhouette','brief','requestedBuyer'])
   if(!this.optional(h?.[key],4000))e.push('Concept text is oversized: '+key);
  return e;
 }
 static create(seed={}){
  const now=new Date().toISOString(),h={};
  for(const k of ['conceptName','category','season','market','sourceRef','reviewedBy','reviewDate','silhouette','brief','requestedBuyer'])
   h[k]=this.text(seed[k]);
  const record={version:this.version,id:this.id(),revision:0,createdAt:now,updatedAt:now,status:this.draft,
   header:h,originalHeader:this.copy(h),colourways:[],tasks:[],boards:[],revisions:[],decisions:[],audit:[]};
  const ok=this.validate(record);if(!ok.ok)throw Error(ok.errors.join('; '));return record;
 }
 static checkColourway(c){
  const e=[];
  for(const k of ['id','name','sourceRef','sourceDate','reviewedBy'])
   if(!this.valid(c?.[k],350))e.push('Colourway requires sourced '+k);
  if(!this.date(c?.sourceDate))e.push('Colourway source date must be exact');
  for(const k of ['colourRef','silhouette','materialProposal','notes'])
   if(!this.optional(c?.[k],1000))e.push('Colourway proposal oversized: '+k);
  if(this.text(c?.colourRef)&&!this.valid(c?.colourSourceRef,350))
   e.push('Supplied Pantone/colour reference requires independent source (never invented)');
  if(this.text(c?.materialProposal)&&!this.valid(c?.materialSourceRef,350))
   e.push('Proposed material needs source; no confirmed fabric ownership');
  return e;
 }
 static checkTask(t){
  const e=[];
  for(const k of ['id','description','sourceRef','reviewedBy'])
   if(!this.valid(t?.[k],400))e.push('Requested task requires '+k);
  if(!['fit','technical','sampling','material','other'].includes(t?.kind))
   e.push('Unknown requested work type');
  if(!this.date(t?.sourceDate))e.push('Requested work needs exact source date');
  if(t?.state!=='requested-not-approved')e.push('Requested task is NOT automatically accepted or completed');
  return e;
 }
 static validate(p){
  const e=[];
  if(!p||typeof p!=='object'||Array.isArray(p)||p.version!==this.version||
   !this.valid(p.id,180)||!Number.isSafeInteger(p.revision)||p.revision<0||
   !['colourways','tasks','boards','revisions','decisions','audit'].every(k=>Array.isArray(p[k])))
   return{ok:false,errors:['Unsupported versioned Product Development concept']};
  if(p.status!==this.draft)e.push('Concept must not infer buyer acceptance or production readiness');
  e.push(...this.header(p.header),...this.header(p.originalHeader));
  // M3 manual source snapshots are optional; M2 saved copies continue to validate without them.
  if(p.manualReferences!==undefined){
   if(!root.VesaProductReviewedReference)e.push('Source review engine unavailable');
   else e.push(...root.VesaProductReviewedReference.validateList(p));
  }
  const counts={colourways:120,tasks:200,boards:20,revisions:300,decisions:300,audit:1000};
  for(const [kind,max] of Object.entries(counts))if(p[kind].length>max)e.push(kind+' exceeds local source limits');
  const allIds=new Set();
  for(const kind of Object.keys(counts)){
   for(const row of p[kind]){
    if(!row||!this.valid(row.id,180)||allIds.has(row.id))e.push('Duplicate or missing immutable concept event ID: '+kind);
    else allIds.add(row.id);
   }
  }
  for(const item of p.colourways)e.push(...this.checkColourway(item));
  for(const item of p.tasks)e.push(...this.checkTask(item));
  if(!root.VesaProductBoardLayout)e.push('Product board layout/rights checker unavailable');
  else for(const b of p.boards)e.push(...root.VesaProductBoardLayout.check(b,p.colourways));
  if(!root.VesaProductRevisionHistory)e.push('Immutable concept review checker unavailable');
  else e.push(...root.VesaProductRevisionHistory.check(p));
  if(p.audit.length!==p.revision)e.push('Concept immutable event sequence length mismatch');
  for(let i=0;i<p.audit.length;i++)if(p.audit[i]?.revision!==i+1||!this.valid(p.audit[i]?.action,240)||
   !this.valid(p.audit[i]?.at,80)||!this.valid(p.audit[i]?.id,180))
   e.push('Concept historical audit gap or malformed event');
  try{if(JSON.stringify(p).length>2000000)e.push('Concept exceeds safe 2MB local browser record limit');}
  catch{e.push('Concept contains non-serializable data');}
  return{ok:e.length===0,errors:e};
 }
 static append(p,kind,data){
  const previous=this.validate(p);if(!previous.ok)throw Error(previous.errors.join('; '));
  const key={colourway:'colourways',board:'boards',task:'tasks'}[kind];
  if(!key)throw Error('Only proposal colourway, board or requested task may be appended');
  const item=this.copy({...data,id:data?.id||this.id(kind.toUpperCase())});
  const e=kind==='colourway'?this.checkColourway(item):kind==='task'?this.checkTask(item):
   root.VesaProductBoardLayout?.check(item,p.colourways)||['Board-layout checker missing'];
  if(e.length)throw Error(e.join('; '));
  const next=this.copy(p);next[key].push(item);next.revision++;
  next.updatedAt=new Date().toISOString();
  next.audit.push({id:this.id('AUDIT'),revision:next.revision,at:next.updatedAt,
   action:'Locally sourced draft '+kind+' added',recordId:item.id});
  const checked=this.validate(next);if(!checked.ok)throw Error(checked.errors.join('; '));
  return next;
 }
 static summarize(p){
  const v=this.validate(p);if(!v.ok)throw Error(v.errors.join('; '));
  const last=p.decisions[p.decisions.length-1]||null;
  return{status:last?.state||'draft',conceptName:p.header.conceptName,colourways:p.colourways.length,
   boards:p.boards.length,requestedTasks:p.tasks.length,revisions:p.revisions.length,
   lastDecisionId:last?.id||null,buyerApproved:false,technicalSpecApproved:false,
   commerciallyQuoted:false,productionReady:false,originalArtworkRightsAuthenticated:false};
 }
 static demo(){
  let p=this.create({conceptName:'DEMO COASTAL POLO CAPSULE',category:'POLO',
   season:'DEMO SPRING CONCEPT',market:'DEMO MARKET',sourceRef:'SYN FICTIONAL DESIGN BRIEF',
   reviewedBy:'SYN LOCAL PRODUCT DEVELOPER',reviewDate:'2026-10-17',
   silhouette:'SYN CLASSIC POLO',brief:'SYNTHETIC IDEA ONLY; NOT A TECH PACK'});
  p=this.append(p,'colourway',{id:'DEMO-CW-NAVY',name:'Demo Navy proposal',
   sourceRef:'SYN COLOUR CARD',sourceDate:'2026-10-17',reviewedBy:'SYN DESIGNER',
   materialProposal:'SYN COTTON PIQUE',materialSourceRef:'SYN MATERIAL IDEATION'});
  p=this.append(p,'board',{id:'DEMO-BOARD-1',title:'DEMO Style Direction',
   layout:'grid-2',aspect:'16:9',sourceRef:'SYN STYLE DIRECTION',sourceDate:'2026-10-17',
   reviewedBy:'SYN DESIGNER',cards:[{id:'DEMO-CARD-1',kind:'colourway',colourwayId:'DEMO-CW-NAVY',
   sourceRef:'SYN STYLE BOARD',position:1}]});
  return p;
 }
}
root.VesaProductConceptRegister=VesaProductConceptRegister;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaProductConceptRegister;
})(typeof globalThis!=='undefined'?globalThis:this);
