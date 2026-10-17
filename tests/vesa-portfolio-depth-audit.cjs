'use strict';
/** Full-source, static and read-only portfolio depth inventory.
 * Counts are NOT feature acceptance; all domain records remain untouched. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output','portfolio-depth-audit');
const ids=['aql','ppm','tna','costing','packing-container','order-commission',
'tech-pack-spec','purchase-order','lc-payment','sampling-approval','fabric-trims',
'shipment-documentation','production-tracker','factory-vendor','label-artwork-approval',
'buyer-crm','fabric-supplier-comparison','claims-disputes','product-development'];
const size=p=>fs.statSync(p).size;
const relative=p=>path.relative(root,p).replaceAll(path.sep,'/');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 const p=path.join(dir,e.name);return e.isDirectory()?walk(p):e.isFile()?[p]:[];});}
function uniq(arr){return [...new Set(arr)].sort();}
function section(md,header){
 const i=md.indexOf(header);if(i<0)return '';
 let text=md.slice(i+header.length);const n=text.search(/\n## /);
 return (n<0?text:text.slice(0,n)).trim();}
function markers(s){const m={
 pdf:/\b(?:pdf-lib|jsPDF|pdfmake|PDFDocument|window\.print|\.pdf\b)/i,
 excel:/\b(?:XLSX|\.xlsx|sheet_to_json|ExcelJS)\b/i,
 csv:/\bcsv\b/i,localStorage:/\blocalStorage\b/,
 indexedDB:/\bindexedDB\b/,fileUpload:/\b(?:FileReader|type=["']file["']|file\.text)\b/i,
 fileDownload:/\b(?:createObjectURL|\.download\s*=|download=)\b/i,
 offline:/\b(?:serviceWorker|caches\.open|offline)\b/i,
 localization:/\b(?:language|translations|bengali|tamil|hindi|localization|i18n)\b/i,
 calculation:/\b(?:calculate|compute|formula|evaluate|reconcile)\b/i,
 approval:/\b(?:approval|review|signoff|sign-off|accepted|rejected)\b/i,
 version:/\b(?:revision|version|baseline|amendment|history)\b/i,
 reference:/\b(?:sourceRef|linkedRecord|reference|snapshot|provenance)\b/i};
 return Object.fromEntries(Object.entries(m).map(([k,r])=>[k,r.test(s)]));}
function profile(id){
 const dir=path.join(root,'apps',id);
 const files=walk(dir),source=files.filter(p=>!p.includes('/tests/')&&!p.includes('/vendor/')&&/\.(js|cjs|css|html)$/.test(p));
 const tests=files.filter(p=>p.includes('/tests/')&&/\.(js|cjs)$/.test(p));
 const contents=source.map(p=>fs.readFileSync(p,'utf8'));
 const combined=contents.join('\n');
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
 const styles=[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)];
 const durls=[...html.matchAll(/data:([\w.+/-]+);base64,([A-Za-z0-9+/=\r\n]{120,})/gi)];
 const lines=html.split(/\r?\n/);
 const longest=lines.map((s,i)=>({line:i+1,bytes:Buffer.byteLength(s)})).sort((a,b)=>b.bytes-a.bytes).slice(0,5);
 const b64=[...html.matchAll(/[A-Za-z0-9+/]{2048,}={0,2}/g)].map(z=>z[0].length).sort((a,b)=>b-a);
 const cn=uniq([...combined.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)\s*(?:extends\s+[\w$.]+)?\s*\{/g)].map(z=>z[1]));
 const types=uniq([...combined.matchAll(/\b[A-Z][a-zA-Z]+(?:Engine|Controller|Repository|Report|Service|Ledger|Validator|Codec|Store|Model|Factory|Renderer)\b/g)].map(z=>z[0]));
 const reportIds=uniq([...combined.matchAll(/\b(?:AR\d{2}|PR\d{2}|R\d{2})\b/g)].map(z=>z[0]));
 const bpFile=fs.readdirSync(path.join(root,'blueprints')).find(x=>x.endsWith('_'+id+'.md'));
 const blueprint=bpFile?fs.readFileSync(path.join(root,'blueprints',bpFile),'utf8'):'';
 return {
  id,htmlBytes:size(path.join(dir,'index.html')),
  files:files.length,totalBytes:files.reduce((n,p)=>n+size(p),0),
  sourceFiles:source.map(p=>({path:relative(p),bytes:size(p)})),
  testFiles:tests.length,
  browserTests:tests.filter(p=>/require\(['"]playwright['"]\)/.test(fs.readFileSync(p,'utf8'))).length,
  classNames:cn,engineLikeTypes:types.slice(0,110),reportIdentifiers:reportIds,
  markers:markers(combined),
  html:{
   scriptBlocks:scripts.length,
   inlineScriptBytes:scripts.reduce((n,a)=>n+Buffer.byteLength(a[2]),0),
   styleBlocks:styles.length,
   inlineStyleBytes:styles.reduce((n,a)=>n+Buffer.byteLength(a[1]),0),
   scriptSizes:scripts.map((a,i)=>({block:i+1,bytes:Buffer.byteLength(a[2])}))
      .sort((a,b)=>b.bytes-a.bytes).slice(0,12),
   dataUrls:durls.length,dataUrlBytes:durls.reduce((n,a)=>n+Buffer.byteLength(a[0]),0),
   largeBase64Runs:b64.length,largestBase64Runs:b64.slice(0,10),
   longestLines:longest,lineCount:lines.length,
   buttons:(html.match(/<button\b/gi)||[]).length,
   inputs:(html.match(/<input\b/gi)||[]).length,
   selects:(html.match(/<select\b/gi)||[]).length,
   textareas:(html.match(/<textarea\b/gi)||[]).length,
   linkedScripts:scripts.filter(z=>/\bsrc=/.test(z[1])).map(z=>z[1].match(/src=["']([^"']+)/)?.[1]).filter(Boolean)
  },
  blueprint:bpFile||null,
  blueprintEngine:section(blueprint,'## 4. Calculation, policy and state engine').slice(0,2400),
  blueprintOutputs:section(blueprint,'## 6. Required output and reports').slice(0,2400),
  blueprintOpenRules:section(blueprint,'## 10. Open domain approvals / no-guess policy').slice(0,1500)
 };
}
assert.equal(ids.length,19);
const apps=ids.map(profile),aql=apps[0];fs.mkdirSync(out,{recursive:true});
const summary={sha:process.env.GITHUB_SHA||'local',apps:apps.length,
 aql:{htmlBytes:aql.htmlBytes,scriptBytes:aql.html.inlineScriptBytes,
  styleBytes:aql.html.inlineStyleBytes,dataUrlBytes:aql.html.dataUrlBytes,
  dataUrls:aql.html.dataUrls,base64Runs:aql.html.largeBase64Runs,
  classes:aql.classNames.length,scripts:aql.html.scriptBlocks,
  longestLines:aql.html.longestLines,largestScripts:aql.html.scriptSizes},
 table:apps.map(x=>({app:x.id,indexKB:Math.round(x.htmlBytes/1024),
  totalKB:Math.round(x.totalBytes/1024),sourceFiles:x.sourceFiles.length,
  tests:x.testFiles,browserTests:x.browserTests,
  classes:x.classNames.length,reportRefs:x.reportIdentifiers.length,
  inputTags:x.html.inputs,buttonTags:x.html.buttons,
  pdfMarker:x.markers.pdf,excelMarker:x.markers.excel,blueprint:x.blueprint}))};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({
 note:'Read-only static source scanner. A token or report identifier is not an end-to-end feature PASS.',
 summary,apps},null,2));
console.log('DEPTH_SUMMARY '+JSON.stringify(summary));
for(const x of apps)console.log('APP_DEPTH '+JSON.stringify({
 id:x.id,classes:x.classNames.slice(0,45),engineTypes:x.engineLikeTypes.slice(0,30),
 source:x.sourceFiles.map(f=>f.path),features:x.markers,reportIds:x.reportIdentifiers
}));
console.log('AQL_SOURCE_BREAKDOWN '+JSON.stringify({
 sourceBytes:aql.htmlBytes,scripts:aql.html.scriptSizes,
 styles:aql.html.inlineStyleBytes,dataUrlBytes:aql.html.dataUrlBytes,
 largeBase64:aql.html.largestBase64Runs,
 engineClasses:aql.classNames.slice(0,100),longestLines:aql.html.longestLines}));
