/**
 * Read-only locale audit for VESA's registered 20 applications.
 *
 * Ownership: UI dictionary discovery; app engines and user-entered records are never
 * executed, read or modified. Reads repository source on the GitHub Actions checkout
 * and reports authored English dictionary coverage. No network or browser state.
 *
 * Usage: node tools/i18n/locale-audit.cjs
 * Dependencies: acorn (CI dev-only, never shipped to website).
 * Failure mode: fail closed if any referenced app/source is absent or ambiguous.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const acorn=require('acorn');

class VesaLocaleAudit {
 static ROOT=path.resolve(__dirname,'../..');
 static APPS=Object.freeze({
  aql:['index.html'],
  'buyer-crm':['src/i18n/app-copy.js'],
  'chess-360':['index.html'],
  'claims-disputes':['src/i18n/app-copy.js'],
  costing:['index.html'],
  'fabric-supplier-comparison':['src/i18n/app-copy.js'],
  'fabric-trims':['src/i18n/app-copy.js'],
  'factory-vendor':['src/i18n/app-copy.js'],
  'label-artwork-approval':['src/i18n/app-copy.js'],
  'lc-payment':['index.html'],
  'order-commission':['index.html'],
  'packing-container':['index.html'],
  ppm:['languages.js','index.html','core.js','workspace.js'],
  'product-development':['src/i18n/app-copy.js'],
  'production-tracker':['src/i18n/app-copy.js'],
  'purchase-order':['index.html'],
  'sampling-approval':['src/i18n/app-copy.js'],
  'shipment-documentation':['src/i18n/app-copy.js'],
  'tech-pack-spec':['index.html'],
  tna:['src/bootstrap.js']
 });
 static source(app,file){return fs.readFileSync(path.join(this.ROOT,'apps',app,file),'utf8');}
 static propertyName(node){return node?.key?.name??node?.key?.value??null;}
 static stringProperties(node){
  if(node?.type!=='ObjectExpression')return [];
  return node.properties.filter(p=>p.type==='Property').map(p=>{
   const value=p.value?.type==='Literal'?p.value.value:
    p.value?.type==='TemplateLiteral'&&p.value.expressions.length===0?p.value.quasis[0].value.cooked:null;
   return {key:this.propertyName(p),value};
  }).filter(x=>x.key && typeof x.value==='string' && x.value.trim());
 }
 static discover(s){
  const patterns=[/\ben\s*:\s*\{/g,/\bconst\s+en\s*=\s*\{/g,/\bconst\s+EN\s*=\s*\{/g];
  const seen=new Set(),out=[];
  for(const pattern of patterns){let match;
   while((match=pattern.exec(s))!==null){
    const offset=s.indexOf('{',match.index);
    if(seen.has(offset))continue;
    seen.add(offset);
    try{
     const node=acorn.parseExpressionAt(s,offset,{ecmaVersion:'latest'});
     const object=node.type==='SequenceExpression'?node.expressions.find(x=>x.type==='ObjectExpression'&&x.start===offset):node;
     const props=this.stringProperties(object);
     if(props.length>=10)out.push({start:offset,end:object.end,values:props});
     pattern.lastIndex=object.end;
    }catch{continue;}
   }
  }
  return out.sort((a,b)=>a.start-b.start);
 }
 static run(){
  const result={};
  const keys=Object.keys(this.APPS);
  assert.equal(keys.length,20,'registered 20-app scope must remain fixed');
  for(const app of keys){
   const entries=[];
   let srcLength=0;
   for(const file of this.APPS[app]){
    const s=this.source(app,file);srcLength+=s.length;
    for(const block of this.discover(s))entries.push({file,keys:block.values.length,start:block.start,
      sample:block.values.slice(0,3).map(v=>v.key+':'+v.value.slice(0,26))});
   }
   result[app]={files:this.APPS[app],sourceBytes:srcLength,blocks:entries,
    dictionaryFields:entries.reduce((n,b)=>n+b.keys,0)};
  }
  const sum=Object.values(result).reduce((n,z)=>n+z.dictionaryFields,0);
  console.log('VESA_LANGUAGE_AUDIT 20 apps '+sum+' source dictionary fields');
  for(const [app,v] of Object.entries(result))console.log('UI_DICTIONARY '+app+' '+v.dictionaryFields+' '+v.blocks.map(b=>b.file+':'+b.keys).join(','));
  console.log('VESA_LANGUAGE_AUDIT_JSON '+JSON.stringify(result));
  assert.ok(sum>25,'No authored UI dictionaries found; parser extraction regression');
 }
}
module.exports={VesaLocaleAudit};
if(require.main===module)VesaLocaleAudit.run();
