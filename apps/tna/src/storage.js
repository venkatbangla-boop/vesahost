(function(root){
  'use strict';
  const STORAGE_VERSION='TNA360-STORAGE-0.5.0';
  const FORMAT='VESA-TNA';
  const MAX_BYTES=2*1024*1024;
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);
  const enc=value=>new TextEncoder().encode(value).length;
  const key=user=>`vesa.tna360.records.${user||'local-browser-user'}`;
  const autoKey=user=>`vesa.tna360.autosave.${user||'local-browser-user'}`;
  const safeJson=value=>JSON.stringify(value);
  function checksum(text){let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16);}
  function readBox(user){try{return JSON.parse(localStorage.getItem(key(user))||'{"records":[]}')}catch{return {records:[]}}}
  function writeBox(user,box){const text=safeJson(box);if(enc(text)>MAX_BYTES)throw new Error('TNA local store exceeds safe size limit.');const tmp=key(user)+'.tmp';localStorage.setItem(tmp,text);localStorage.setItem(key(user),localStorage.getItem(tmp));localStorage.removeItem(tmp);}
  function assertPlan(plan){if(!plan||plan.schemaVersion!==domain.SCHEMA_VERSION)throw new Error('Unsupported TNA plan schema.');const validation=domain.validatePlan(plan);if(!validation.ok)throw new Error(validation.errors.join('; '));}
  function savePlan(plan,user){assertPlan(plan);const box=readBox(user);const without=box.records.filter(item=>item.recordId!==plan.recordId);const saved={recordId:plan.recordId,updatedAt:new Date().toISOString(),buyer:plan.order.buyerName,style:plan.order.styles?.[0]?.styleNo,po:plan.order.poNumbers?.[0],plan};writeBox(user,{storageVersion:STORAGE_VERSION,records:[saved,...without]});return saved;}
  function listPlans(user){return readBox(user).records.map(({plan,...summary})=>summary);}
  function loadPlan(recordId,user){const found=readBox(user).records.find(item=>item.recordId===recordId);if(!found)return null;assertPlan(found.plan);return found.plan;}
  function autosave(plan,user){assertPlan(plan);localStorage.setItem(autoKey(user),safeJson({savedAt:new Date().toISOString(),plan}));return true;}
  function recoverAutosave(user){try{const box=JSON.parse(localStorage.getItem(autoKey(user))||'null');if(!box)return null;assertPlan(box.plan);return box;}catch{return null}}
  function exportCopy(plan){assertPlan(plan);const record=safeJson(plan);const payload={format:FORMAT,schemaVersion:plan.schemaVersion,storageVersion:STORAGE_VERSION,exportedAt:new Date().toISOString(),checksum:checksum(record),record:plan};return safeJson(payload);}
  function importCopy(text){if(enc(text)>MAX_BYTES)throw new Error('Saved copy is too large.');let payload;try{payload=JSON.parse(text)}catch{throw new Error('Saved copy is not valid JSON.');}if(payload.format!==FORMAT)throw new Error('Saved copy format is not VESA-TNA.');const recordText=safeJson(payload.record);if(payload.checksum!==checksum(recordText))throw new Error('Saved copy checksum does not match.');assertPlan(payload.record);return payload.record;}
  function createHistory(initial){return {past:[],present:initial,future:[]};}
  function pushHistory(history,next){return {past:[...history.past,history.present].slice(-50),present:next,future:[]};}
  function undo(history){if(!history.past.length)return history;const present=history.past.at(-1);return {past:history.past.slice(0,-1),present,future:[history.present,...history.future]};}
  function redo(history){if(!history.future.length)return history;const present=history.future[0];return {past:[...history.past,history.present],present,future:history.future.slice(1)};}
  function splitCsvLine(line){const cells=[];let cell='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){quoted=!quoted;continue;}if((ch===','||ch==='\t')&&!quoted){cells.push(cell);cell='';continue;}cell+=ch;}cells.push(cell);return cells.map(v=>v.trim());}
  function importPreview(text){if(enc(text)>MAX_BYTES)throw new Error('Import text is too large.');const lines=String(text||'').split(/\r?\n/).filter(Boolean);if(!lines.length)return {headers:[],rows:[],warnings:['No rows found.'],formulaCells:[],ambiguousDates:[]};const headers=splitCsvLine(lines[0]);const rows=lines.slice(1).map(splitCsvLine);const formulaCells=[],ambiguousDates=[];rows.forEach((row,r)=>row.forEach((cell,c)=>{if(/^[=+\-@]/.test(cell))formulaCells.push({row:r+2,column:headers[c]||c+1,value:cell});if(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(cell))ambiguousDates.push({row:r+2,column:headers[c]||c+1,value:cell});}));const lower=headers.map(h=>h.toLowerCase());const mapping={buyerName:lower.findIndex(h=>h.includes('buyer')),factoryName:lower.findIndex(h=>h.includes('factory')),styleNo:lower.findIndex(h=>h.includes('style')),poNumber:lower.findIndex(h=>h.includes('po')),totalQty:lower.findIndex(h=>h.includes('qty')||h.includes('quantity')),buyerRequiredExFactory:lower.findIndex(h=>h.includes('ex')&&h.includes('factory'))};return {headers,rows:rows.slice(0,10),mapping,formulaCells,ambiguousDates,warnings:[...formulaCells.map(cell=>`Formula-like cell blocked at ${cell.column} row ${cell.row}`),...ambiguousDates.map(cell=>`Ambiguous date requires mapping at ${cell.column} row ${cell.row}`)]};}
  function safeCell(value){const text=String(value??'');return /^[=+\-@]/.test(text)?`'${text}`:text;}
  function exportCsv(plan){assertPlan(plan);const row=[plan.order.buyerName,plan.order.factoryName,plan.order.styles?.[0]?.styleNo,plan.order.poNumbers?.[0],plan.order.totalQty,plan.commitments.buyerRequiredExFactory].map(safeCell);return ['Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory',row.join(',')].join('\n');}
  const api={STORAGE_VERSION,FORMAT,MAX_BYTES,checksum,savePlan,listPlans,loadPlan,autosave,recoverAutosave,exportCopy,importCopy,createHistory,pushHistory,undo,redo,importPreview,exportCsv,safeCell};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
