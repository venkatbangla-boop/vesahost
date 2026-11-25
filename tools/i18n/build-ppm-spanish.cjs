/**
 * VESA PPM UI Spanish-only presentation catalog.
 *
 * Ownership: static source translation for PPM labels and checkpoint descriptions.
 * Usage: node tools/i18n/build-ppm-spanish.cjs collect|apply from repository root.
 * Inputs: PPM-authored JavaScript literal English text and offline translated JSON.
 * Outputs: a language-only map in languages.js; no records, inspection decisions,
 * measurements, calculations or saved-copy formats are changed.
 * State: ephemeral source AST and JSON. Fail if source contract drifts.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const acorn=require('acorn');
class VesaPPMSpanishCatalog {
 static ROOT=path.resolve(__dirname,'../..');
 static OUT=path.join(this.ROOT,'output','i18n');
 static FILES=['apps/ppm/core.js','apps/ppm/workspace.js','apps/ppm/languages.js','apps/ppm/report-service.js','apps/ppm/planning-panel.js','apps/ppm/record-services.js'];
 static isEnglishText(value){
  return typeof value==='string'&&value.length>=4&&value.length<=540
   &&/[A-Za-z]{2}/.test(value)
   && !/[অ-য়ऀ-ॿ஀-௿]/.test(value)
   && !/[<>{};]|https?:\/\/|^(?:[.#/\w-]+)$/.test(value)
   && !/^[A-Z][A-Z0-9._/+-]{2,}$/.test(value)
   && (!/^[a-z][a-zA-Z0-9]*$/.test(value)||['Home','File','Edit','View','Tools','Help','Save','Open','Date','Buyer','Factory','Report','Pending'].includes(value));
 }
 static englishStrings(){
  const phrases=new Set();
  for(const file of this.FILES){
   const source=fs.readFileSync(path.join(this.ROOT,file),'utf8');
   const parsed=acorn.parse(source,{ecmaVersion:'latest',sourceType:'script'});
   const queue=[parsed];
   while(queue.length){
    const n=queue.pop();
    if(!n||typeof n!=='object')continue;
    if(n.type==='Literal'&&this.isEnglishText(n.value))phrases.add(n.value);
    if(n.type==='TemplateLiteral'&&n.expressions?.length===0){
     const v=n.quasis.map(q=>q.value.cooked).join('');
     if(this.isEnglishText(v))phrases.add(v);
    }
    for(const [k,v] of Object.entries(n)){
     if(['start','end','loc','raw','regex','value'].includes(k))continue;
     if(Array.isArray(v)){
      for(const child of v)if(child&&typeof child==='object')queue.push(child);
     }else if(v&&typeof v==='object'){
      queue.push(v);
     }
    }
   }
   if(file.endsWith('languages.js')){
    const match=source.match(/const PPM_UI_SENTENCES=\`([\s\S]*?)\`;/);
    if(!match)throw Error('PPM_UI_SENTENCES source missing');
    for(const row of match[1].trim().split('\n')){
     const first=row.split('|')[0].trim();
     if(this.isEnglishText(first))phrases.add(first);
    }
   }
  }
  return [...phrases].sort();
 }
 static collect(){
  const phrases=this.englishStrings();
  if(phrases.length<100||phrases.length>5000)throw Error('Unexpected PPM UI phrase inventory '+phrases.length);
  fs.mkdirSync(this.OUT,{recursive:true});
  fs.writeFileSync(path.join(this.OUT,'ppm-en.json'),JSON.stringify({version:1,phrases},null,2)+'\n');
  console.log('PPM_ENGLISH_UI_COLLECTED '+phrases.length+' literal source phrases');
 }
 static apply(){
  const file=path.join(this.ROOT,'apps/ppm/languages.js');
  let content=fs.readFileSync(file,'utf8');
  const translated=JSON.parse(fs.readFileSync(path.join(this.OUT,'ppm-es.json'),'utf8'));
  const original=JSON.parse(fs.readFileSync(path.join(this.OUT,'ppm-en.json'),'utf8'));
  if(translated.version!==1||translated.language!=='es'||translated.phrases.length!==original.phrases.length)
   throw Error('PPM Spanish catalog not aligned to English source');
  const dictionary=Object.fromEntries(original.phrases.map((x,i)=>[x,translated.phrases[i]]));
  const header='class LocaleService {';
  if(content.split(header).length!==2)throw Error('PPM LocaleService ownership changed');
  content=content.replace(header,'/* Spanish static UI phrase map; English keys are source literals only. */\nconst PPM_ES_TEXT=Object.freeze('+JSON.stringify(dictionary)+');\n'+header);
  const old="constructor(){try{this.language=localStorage.getItem('vesa.ppm.language')||'en'}catch{this.language='en'}if(!['en','bn','hi','ta'].includes(this.language))this.language='en'}";
  const newer="constructor(){try{this.language=globalThis.VesaPrefs?.read?.().language||localStorage.getItem('vesa.ppm.language')||'en'}catch{this.language='en'}if(!['en','bn','hi','ta','es'].includes(this.language))this.language='en'}";
  if(content.split(old).length!==2)throw Error('PPM constructor no longer has reviewed language contract');
  content=content.replace(old,newer);
  const oldSet="set(language){if(!['en','bn','hi','ta'].includes(language))return;this.language=language;try{localStorage.setItem('vesa.ppm.language',language)}catch{}document.documentElement.lang=language}";
  const newSet="set(language){if(!['en','bn','hi','ta','es'].includes(language))return;this.language=language;try{localStorage.setItem('vesa.ppm.language',language);if(globalThis.VesaPrefs?.write){globalThis.VesaPrefs.write({...globalThis.VesaPrefs.read(),language});}}catch{}document.documentElement.lang=language}";
  if(content.split(oldSet).length!==2)throw Error('PPM setter no longer has reviewed language contract');
  content=content.replace(oldSet,newSet);
  const oldTranslate="checkpoint(id,english){return PPM_SENTENCES[id]?.[this.language]||english}\n sentence(key,english){return PPM_SENTENCES[key]?.[this.language]||english}";
  const newTranslate="checkpoint(id,english){return this.language==='es'?(PPM_ES_TEXT[english]||english):(PPM_SENTENCES[id]?.[this.language]||english)}\n sentence(key,english){return this.language==='es'?(PPM_ES_TEXT[english]||english):(PPM_SENTENCES[key]?.[this.language]||english)}";
  if(content.split(oldTranslate).length!==2)throw Error('PPM locale translation contract no longer exact');
  content=content.replace(oldTranslate,newTranslate);
  fs.writeFileSync(file,content);
  console.log('PPM_ES_TRANSLATION_INSERTED '+original.phrases.length+' UI phrases, no PPM engine changes');
 }
}
const command=process.argv[2];
if(command==='collect')VesaPPMSpanishCatalog.collect();
else if(command==='apply')VesaPPMSpanishCatalog.apply();
else throw Error('Expected collect|apply');
