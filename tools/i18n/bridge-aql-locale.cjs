/**
 * VESA AQL Spanish language-owner bridge.
 *
 * This build-only patcher touches one audited guide language picker and the
 * guide-language preference write. AQL inspection engines, quantities, report
 * calculations, saved evidence, CSS and other workflows remain byte-identical.
 * Access: node tools/i18n/bridge-aql-locale.cjs apply on the feature checkout
 * after the 5-language dictionaries have been inserted into AQL index.html.
 *
 * Inputs: tracked AQL index.html + shared five-language preference API.
 * Outputs: two narrowly scoped language-only source replacements.
 * State: no runtime state in this script; at runtime VesaPrefs remains the sole
 * language owner, while the AQL guide still uses its existing locale property.
 * Failure: stop on missing markers or absent authored Spanish source dictionary.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');

class VesaAqlLocaleBridge {
 static FILE=path.resolve(__dirname,'../../apps/aql/index.html');
 static replaceOne(content,needle,value){
  const count=content.split(needle).length-1;
  if(count!==1)throw new Error('AQL language scope drift: '+needle.slice(0,95)+' count='+count);
  return content.replace(needle,value);
 }
 static apply(){
  let source=fs.readFileSync(this.FILE,'utf8');
  if(!source.includes("static REPORT_LANG=Object.freeze({")||
     !source.includes("KnowledgeAcademy.LABELS")||
     !source.includes("VesaPrefs")&& !source.includes("../../js/preferences.js")){
    throw Error('AQL source language anchors missing');
  }
  const picker="[['en','English'],['ta','Tamil'],['bn','Bangla'],['hi','Hindi']]";
  source=this.replaceOne(source,picker,"[['en','English'],['ta','Tamil'],['bn','Bangla'],['hi','Hindi'],['es','Español']]");
  const write="try{localStorage.setItem('vesa-guide-language',this.language);}catch{}return this.guide();";
  const changed="try{if(globalThis.VesaPrefs?.write){globalThis.VesaPrefs.write({...globalThis.VesaPrefs.read(),language:this.language});}localStorage.setItem('vesa-guide-language',this.language);}catch{}return this.guide();";
  source=this.replaceOne(source,write,changed);
  fs.writeFileSync(this.FILE,source);
  console.log('AQL_GLOBAL_LANGUAGE_BRIDGE_PASS Spanish guide picker, global shared preference, no inspection engine changes');
 }
}
if(process.argv[2]!=='apply')throw Error('Usage: node tools/i18n/bridge-aql-locale.cjs apply');
VesaAqlLocaleBridge.apply();
