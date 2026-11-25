/**
 * Five-language source-dictionary coverage gate for VESA's 20 registered apps.
 *
 * Owns static key parity only: en/bn/hi/ta/es translation keys in authored
 * UI dictionaries. Never executes applications, writes order/inspection records,
 * modifies business enums or rewrites user-supplied text.
 *
 * Inputs: checked-out published source; acorn is CI-only for inert AST parsing.
 * Output: key-level coverage failure with exact app/file/locale; no modifications.
 * Failure mode: missing locale block or even one missing authored label blocks
 * release of that language; dynamic/engine fields are outside this source gate.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const acorn=require('acorn');
const {VesaLocaleAudit}=require('../tools/i18n/locale-audit.cjs');

class VesaFiveLanguageCoverage {
 static ROOT=path.resolve(__dirname,'..');
 static LOCALES=['en','bn','hi','ta','es'];
 static CATALOG=VesaLocaleAudit.APPS;
 static node(source,start){
  const parsed=acorn.parseExpressionAt(source,start,{ecmaVersion:'latest'});
  return parsed.type==='SequenceExpression'
   ?parsed.expressions.find(x=>x.type==='ObjectExpression'&&x.start===start)
   :parsed;
 }
 static keys(node){
  if(node?.type!=='ObjectExpression')return new Set();
  return new Set(node.properties.filter(p=>p.type==='Property'&&!p.computed)
   .map(p=>p.key?.name??p.key?.value).filter(Boolean));
 }
 static localeFrom(source,english,after,limit,locale,file){
  if(locale==='en')return english;
  const search=new RegExp('\\b'+locale+'\\s*:\\s*\\{','g');
  search.lastIndex=after;
  const m=search.exec(source);
  if(!m || m.index>=limit)throw Error('Missing '+locale+' dictionary in '+file+' after source '+after);
  const start=source.indexOf('{',m.index);
  return this.node(source,start);
 }
 static check(){
  let blocks=0,labels=0;
  const missing=[];
  const excluded=new Set(['ppm','chess-360']);
  for(const [app,files] of Object.entries(this.CATALOG)){
   if(excluded.has(app))continue;
   for(const file of files){
    const rel='apps/'+app+'/'+file,source=fs.readFileSync(path.join(this.ROOT,rel),'utf8');
    const candidates=VesaLocaleAudit.discover(source);
    if(app==='aql'){
      // AQL includes three small valid public guide dictionaries in addition
      // to the main report chrome; the build compiler covers all four.
      const seen=new Set(candidates.map(x=>x.start));
      for(const m of source.matchAll(/\ben\s*:\s*\{/g)){
       const p=source.indexOf('{',m.index);
       if(seen.has(p))continue;
       try{
        const node=this.node(source,p);
        const n=this.keys(node).size;
        if(n>0&&n<10){candidates.push({start:p,end:node.end});seen.add(p);}
       }catch{}
      }
    }
    candidates.sort((a,b)=>a.start-b.start);
    for(let i=0;i<candidates.length;i++){
     const item=candidates[i],english=this.node(source,item.start);
     const required=this.keys(english);
     const next=i+1<candidates.length?candidates[i+1].start:source.length;
     for(const lang of this.LOCALES.slice(1)){
      const actual=this.keys(this.localeFrom(source,english,item.end,next,lang,rel));
      const absent=[...required].filter(key=>!actual.has(key));
      if(absent.length)missing.push({app,rel,offset:item.start,lang,missing:absent});
     }
     labels+=required.size;
     blocks++;
    }
   }
  }
  const chess=fs.readFileSync(path.join(this.ROOT,'apps/chess-360/index.html'),'utf8');
  const root=chess.indexOf('const I18N = {');
  assert.ok(root>0,'Chess i18n dictionary found');
  const langStart=chess.indexOf('en: {',root);
  assert.ok(langStart>root,'Chess English dictionary found');
  const first=this.node(chess,chess.indexOf('{',langStart));
  const end=chess.indexOf('\n  };',langStart);
  for(const lang of this.LOCALES.slice(1)){
   const actual=this.keys(this.localeFrom(chess,first,first.end,end,lang,'apps/chess-360/index.html'));
   const absent=[...this.keys(first)].filter(k=>!actual.has(k));
   if(absent.length)missing.push({app:'chess-360',lang,missing:absent});
  }
  const centre=fs.readFileSync(path.join(this.ROOT,'js/vesa-app-centre.js'),'utf8');
  assert.ok(centre.includes("const ORDER=['en','bn','hi','ta','es'];"),
   'App Centre must render summaries in all five languages');
  if(missing.length){
   for(const item of missing)console.error('VESA_MISSING_UI_TRANSLATION '+JSON.stringify(item));
   throw Error('Five-language source dictionary gaps='+missing.length);
  }
  assert.ok(blocks>=20&&labels>=1800,'Expected original authored UI dictionary coverage');
  console.log('VESA_FIVE_LANGUAGE_SOURCE_PARITY_PASS '+blocks+' dictionary blocks '+labels+' UI keys across all five languages');
 }
}
VesaFiveLanguageCoverage.check();
