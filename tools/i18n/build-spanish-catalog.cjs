/**
 * VESA five-language source compiler: extract authored English UI dictionaries and
 * install generated static Spanish dictionaries without touching domain state.
 *
 * Ownership: build-time locale source adaptation only; the 20 live app engines retain
 * their own rendering, storage, reports, approvals and business rules.
 * Access: node tools/i18n/build-spanish-catalog.cjs collect|apply|verify
 * Inputs: checked-out source at apps/* and generated output/i18n/es-catalog.json.
 * Outputs: staged source-language insertions (apply), deterministic coverage logs.
 * State: ephemeral local CI files only. No browser/user records, API calls or secrets.
 * Failure mode: abort on stale source hash, missing language map, malformed dictionary,
 * or unsupported AST. Existing four languages are not modified.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const acorn=require('acorn');
const {VesaLocaleAudit}=require('./locale-audit.cjs');

class VesaSpanishCatalogCompiler {
 static ROOT=VesaLocaleAudit.ROOT;
 static OUT=path.join(this.ROOT,'output','i18n');
 static EXCLUDE=new Set(['ppm','chess-360']); // PPM uses checkpoint IDs; Chess already has es labels.
 static sha(s){return crypto.createHash('sha256').update(s,'utf8').digest('hex');}
 static propertyName(p){return p?.key?.type==='Identifier'?p.key.name:p?.key?.value??null;}
 /**
  * Convert authored English literal UI copy to inert JSON. Never evaluate source
  * code, execute data formulas or include variable expressions/record values.
  * Nested instruction groups and string arrays retain their original key paths.
  */
 static literals(node){
  if(node?.type==='Literal'){
   return typeof node.value==='string'||typeof node.value==='number'||typeof node.value==='boolean'?node.value:undefined;
  }
  if(node?.type==='TemplateLiteral'&&node.expressions.length===0){
   return node.quasis.map(q=>q.value.cooked).join('');
  }
  if(node?.type==='ArrayExpression'){
   const items=node.elements.map(el=>this.literals(el));
   return items.every(x=>x!==undefined)?items:undefined;
  }
  if(node?.type==='ObjectExpression'){
   const out={};
   for(const prop of node.properties){
    if(prop.type!=='Property'||prop.computed)continue;
    const key=this.propertyName(prop),value=this.literals(prop.value);
    if(key!==null&&value!==undefined)out[String(key)]=value;
   }
   return out;
  }
  return undefined;
 }
 static deepCount(value){
  if(typeof value==='string')return 1;
  if(Array.isArray(value))return value.reduce((s,v)=>s+this.deepCount(v),0);
  if(value&&typeof value==='object')return Object.values(value).reduce((s,v)=>s+this.deepCount(v),0);
  return 0;
 }
 /**
  * Collect stable source slices by app and file. The scanner returns only English
  * literal UI dictionaries (never saved user data); output is consumed by offline
  * Argos translation on CI. AQL's small authored guide dictionaries also count.
  */
 static collect(){
  fs.mkdirSync(this.OUT,{recursive:true});
  const catalog={version:1,language:'es',base:process.env.GITHUB_SHA||'checkout',
   entries:[],createdFrom:'authored-app-ui-source-only'};
  for(const [app,files] of Object.entries(VesaLocaleAudit.APPS)){
   if(this.EXCLUDE.has(app))continue;
   for(const file of files){
    const rel=path.posix.join('apps',app,file),full=path.join(this.ROOT,rel);
    const source=fs.readFileSync(full,'utf8');
    const found=VesaLocaleAudit.discover(source);
    // Locate any short English report/guide dictionaries within AQL as well.
    if(app==='aql'){
     // Existing audit has 36-key report chrome. Below-10-key maps are discovered
     // by parsing their isolated object starts, excluding any record/source values.
     const seen=new Set(found.map(b=>b.start));
     for(const m of source.matchAll(/\ben\s*:\s*\{/g)){
      const offset=source.indexOf('{',m.index);
      if(seen.has(offset))continue;
      try{
       const parsed=acorn.parseExpressionAt(source,offset,{ecmaVersion:'latest'});
       const object=parsed.type==='SequenceExpression'?parsed.expressions.find(n=>n.type==='ObjectExpression'&&n.start===offset):parsed;
       const data=this.literals(object);
       if(data&&this.deepCount(data)>0&&this.deepCount(data)<10){
        found.push({start:offset,end:object.end});seen.add(offset);
       }
      }catch{}
     }
    }
    for(const block of found){
     const parsed=acorn.parseExpressionAt(source,block.start,{ecmaVersion:'latest'});
     const object=parsed.type==='SequenceExpression'?parsed.expressions.find(n=>n.type==='ObjectExpression'&&n.start===block.start):parsed;
     if(object?.type!=='ObjectExpression')throw Error('Not a UI dictionary '+rel+'@'+block.start);
     const english=this.literals(object);
     const count=this.deepCount(english);
     if(count<1)continue;
     const head=source.slice(Math.max(0,block.start-45),block.start);
     const kind=/\bconst\s+(?:en|EN)\s*=\s*$/.test(head)?'constant':'property';
     catalog.entries.push({app,file:rel,kind,offset:block.start,
       blockHash:this.sha(source.slice(object.start,object.end)),
       fileHash:this.sha(source),english,count});
    }
   }
  }
  const count=catalog.entries.reduce((n,e)=>n+e.count,0);
  if(catalog.entries.length<15||count<1700)throw Error('Incomplete English dictionary extraction '+catalog.entries.length+' blocks '+count+' fields');
  const target=path.join(this.OUT,'en-catalog.json');
  fs.writeFileSync(target,JSON.stringify(catalog,null,2)+'\n');
  console.log('VESA_SPANISH_SOURCE_COLLECTED '+catalog.entries.length+' blocks '+count+' English UI literals in '+new Set(catalog.entries.map(e=>e.app)).size+' app owners');
  return catalog;
 }
 static insertionsFor(entry,translated,source){
  const block=VesaLocaleAudit.discover(source).find(b=>b.start===entry.offset);
  let end;
  if(block)end=block.end;
  else{
   const parsed=acorn.parseExpressionAt(source,entry.offset,{ecmaVersion:'latest'});
   const object=parsed.type==='SequenceExpression'?parsed.expressions.find(n=>n.type==='ObjectExpression'&&n.start===entry.offset):parsed;
   end=object?.end;
  }
  if(!end||this.sha(source.slice(entry.offset,end))!==entry.blockHash){
   throw Error('Stale dictionary input '+entry.file+' offset='+entry.offset);
  }
  const target=JSON.stringify(translated);
  if(entry.kind==='property')return {at:end,text:',es:'+target};
  // Standalone const en/EN is followed by its translated-languages map.
  const tail=source.slice(end);
  const re=/\bconst\s+[A-Za-z_$][\w$]*\s*=\s*\{\s*(?:ta|bn|hi)\s*:/;
  const match=re.exec(tail);
  if(!match)throw Error('No sibling language dictionary found for '+entry.file);
  const local=match.index+match[0].indexOf('{')+1;
  const at=end+local;
  return {at,text:'es:'+target+','};
 }
 /**
  * Apply generated Spanish literal dictionaries by insertion only. Source
  * checksums prove no simultaneous main/source drift. The action is idempotent
  * only at the checked-out CI baseline; reruns on already localized source fail.
  */
 static apply(){
  const en=JSON.parse(fs.readFileSync(path.join(this.OUT,'en-catalog.json'),'utf8'));
  const es=JSON.parse(fs.readFileSync(path.join(this.OUT,'es-catalog.json'),'utf8'));
  if(en.version!==1||es.version!==1||es.language!=='es')throw Error('Locale catalog contract mismatch');
  if(es.entries.length!==en.entries.length)throw Error('Translated block count differs from English');
  const grouped=new Map();
  for(let i=0;i<en.entries.length;i++){
   const src=en.entries[i],tr=es.entries[i];
   if(src.file!==tr.file||src.offset!==tr.offset||src.count!==tr.count){
    throw Error('Translation source drift at block '+i);
   }
   if(!grouped.has(src.file))grouped.set(src.file,[]);
   grouped.get(src.file).push({src,tr});
  }
  let files=0;
  for(const [rel,entries] of grouped){
   const full=path.join(this.ROOT,rel);
   let source=fs.readFileSync(full,'utf8');
   const hash=entries[0].src.fileHash;
   if(entries.some(e=>e.src.fileHash!==hash)||this.sha(source)!==hash){
    throw Error('Language source file changed during build: '+rel);
   }
   // Later source offsets are inserted first so every earlier AST offset remains valid.
   const edits=entries.map(({src,tr})=>this.insertionsFor(src,tr.spanish,source)).sort((a,b)=>b.at-a.at);
   if(edits.some((v,i)=>i>0&&v.at===edits[i-1].at))throw Error('Duplicate insertion '+rel);
   for(const patch of edits)source=source.slice(0,patch.at)+patch.text+source.slice(patch.at);
   fs.writeFileSync(full,source);
   files++;
   console.log('VESA_ES_DICTIONARY_ADDED '+rel+' '+entries.length+' blocks');
  }
  if(files<14)throw Error('Too few localized app source files: '+files);
  console.log('VESA_SPANISH_INSERTION_READY '+files+' language-only source files');
 }
}
const action=process.argv[2];
if(action==='collect')VesaSpanishCatalogCompiler.collect();
else if(action==='apply')VesaSpanishCatalogCompiler.apply();
else throw Error('Usage: node tools/i18n/build-spanish-catalog.cjs collect|apply');
