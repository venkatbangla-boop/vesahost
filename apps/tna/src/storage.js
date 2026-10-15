(function(root){
  'use strict';
  const STORAGE_VERSION='TNA360-STORAGE-0.5.0';
  const FORMAT='VESA-TNA';
  const MAX_BYTES=2*1024*1024;
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);
  const contracts=root.VesaTnaCloudContracts||(typeof require==='function'?require('./cloud-contracts.js'):null);
  const enc=value=>new TextEncoder().encode(value).length;
  const key=user=>`vesa.tna360.records.${user||'local-browser-user'}`;
  const autoKey=user=>`vesa.tna360.autosave.${user||'local-browser-user'}`;
  const queueKey=user=>`vesa.tna360.offline-intents.${user||'local-browser-user'}`;
  const QUEUE_VERSION='TNA360-OFFLINE-QUEUE-0.1.0';
  const QUEUE_MAX_ITEMS=100;
  const QUEUE_MAX_BYTES=512*1024;
  const safeJson=value=>JSON.stringify(value);
  const copy=value=>JSON.parse(JSON.stringify(value));
  const PLAN_MIGRATIONS=Object.freeze({
    'TNA360-ORDERPLAN-1.0.0':plan=>({...copy(plan),schemaVersion:'TNA360-ORDERPLAN-1.1.0',integrationReferences:Array.isArray(plan.integrationReferences)?copy(plan.integrationReferences):[]})
  });
  function checksum(text){let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16);}
  function readBox(user){try{const box=JSON.parse(localStorage.getItem(key(user))||'{"records":[]}');if(box.storageVersion&&box.storageVersion!==STORAGE_VERSION)throw new Error('Unsupported TNA local storage version.');return Array.isArray(box.records)?box:{records:[]};}catch(error){if(error.message&&error.message.includes('Unsupported TNA local storage version'))throw error;return {records:[]}}}
  function writeBox(user,box){const text=safeJson(box);if(enc(text)>MAX_BYTES)throw new Error('TNA local store exceeds safe size limit.');const tmp=key(user)+'.tmp';try{localStorage.setItem(tmp,text);localStorage.setItem(key(user),localStorage.getItem(tmp));}catch(error){try{localStorage.removeItem(tmp)}catch{}throw new Error('Unable to save TNA locally. Browser storage may be full or blocked.');}finally{try{localStorage.removeItem(tmp)}catch{}}}
  function assertPlan(plan){if(!plan||plan.schemaVersion!==domain.SCHEMA_VERSION)throw new Error('Unsupported TNA plan schema.');const validation=domain.validatePlan(plan);if(!validation.ok)throw new Error(validation.errors.join('; '));}
  function migratePlan(plan){if(!plan||typeof plan!=='object')throw new Error('Unsupported TNA plan schema.');const sourceVersion=plan.schemaVersion;let migrated=copy(plan),steps=0;while(migrated.schemaVersion!==domain.SCHEMA_VERSION){const migration=PLAN_MIGRATIONS[migrated.schemaVersion];if(!migration||steps++>10)throw new Error('Unsupported TNA plan schema.');migrated=migration(migrated);}assertPlan(migrated);return {plan:migrated,migrated:sourceVersion!==migrated.schemaVersion,fromVersion:sourceVersion,toVersion:migrated.schemaVersion};}
  function savePlan(plan,user){assertPlan(plan);const box=readBox(user);const without=box.records.filter(item=>item.recordId!==plan.recordId);const saved={recordId:plan.recordId,updatedAt:new Date().toISOString(),buyer:plan.order.buyerName,style:plan.order.styles?.[0]?.styleNo,po:plan.order.poNumbers?.[0],plan};writeBox(user,{storageVersion:STORAGE_VERSION,records:[saved,...without]});return saved;}
  function listPlans(user){return readBox(user).records.map(({plan,...summary})=>summary);}
  function loadPlan(recordId,user){const box=readBox(user);const index=box.records.findIndex(item=>item.recordId===recordId);if(index<0)return null;const result=migratePlan(box.records[index].plan);if(result.migrated){const records=box.records.slice();records[index]={...records[index],plan:result.plan};writeBox(user,{storageVersion:STORAGE_VERSION,records});}return result.plan;}
  function autosave(plan,user){assertPlan(plan);localStorage.setItem(autoKey(user),safeJson({savedAt:new Date().toISOString(),plan}));return true;}
  function recoverAutosave(user){try{const box=JSON.parse(localStorage.getItem(autoKey(user))||'null');if(!box)return null;const result=migratePlan(box.plan);const recovered={...box,plan:result.plan};if(result.migrated)localStorage.setItem(autoKey(user),safeJson(recovered));return recovered;}catch{return null}}
  function containsKey(value,keyName){if(!value||typeof value!=='object')return false;if(Object.prototype.hasOwnProperty.call(value,keyName))return true;return Array.isArray(value)?value.some(item=>containsKey(item,keyName)):Object.values(value).some(item=>containsKey(item,keyName));}
  function readOfflineQueue(user){try{const box=JSON.parse(localStorage.getItem(queueKey(user))||`{"queueVersion":"${QUEUE_VERSION}","intents":[]}`);if(box.queueVersion!==QUEUE_VERSION)throw new Error('Unsupported TNA offline queue version.');return Array.isArray(box.intents)?box.intents:[];}catch(error){if(error.message&&error.message.includes('Unsupported TNA offline queue version'))throw error;return [];}}
  function writeOfflineQueue(user,intents){const text=safeJson({queueVersion:QUEUE_VERSION,intents});if(enc(text)>QUEUE_MAX_BYTES)throw new Error('Offline intent queue exceeds safe size limit.');try{localStorage.setItem(queueKey(user),text);}catch{throw new Error('Unable to save offline intent queue. Browser storage may be full or blocked.');}}
  function queueOfflineIntent(intent,user){if(!contracts?.validateOfflineIntent)throw new Error('TNA cloud contracts are not loaded.');const validation=contracts.validateOfflineIntent(intent);if(!validation.ok)throw new Error(validation.errors.join('; '));if(containsKey(intent,'accessToken'))throw new Error('Offline intents must not contain access tokens.');const queue=readOfflineQueue(user);const existing=queue.find(item=>item.intentId===intent.intentId);if(existing){if(JSON.stringify(existing.command)!==JSON.stringify(intent.command))throw new Error('Offline intent ID is already used for a different command.');return existing;}if(queue.length>=QUEUE_MAX_ITEMS)throw new Error('Offline intent queue is full. Review or resolve queued work before adding another item.');const stored=copy(intent);writeOfflineQueue(user,[stored,...queue]);return stored;}
  function listOfflineIntents(user){return readOfflineQueue(user).map(copy);}
  function updateOfflineIntent(intentId,status,user,metadata={}){if(!contracts?.OFFLINE_STATUSES?.includes(status))throw new Error('Offline intent status is not supported.');const queue=readOfflineQueue(user);const index=queue.findIndex(item=>item.intentId===intentId);if(index<0)throw new Error('Offline intent was not found.');const next={...queue[index],status,updatedAt:new Date().toISOString(),metadata:copy(metadata||{})};const updated=queue.slice();updated[index]=next;writeOfflineQueue(user,updated);return copy(next);}
  function reconcileOfflineIntent(intentId,serverResult,user){if(!contracts?.reconcileOfflineIntent)throw new Error('TNA cloud contracts are not loaded.');const queue=readOfflineQueue(user);const current=queue.find(item=>item.intentId===intentId);if(!current)throw new Error('Offline intent was not found.');const resolution=contracts.reconcileOfflineIntent(current,serverResult);if(!resolution.ok)throw new Error(resolution.errors.join('; '));return updateOfflineIntent(intentId,resolution.status,user,resolution.metadata);}
  function exportCopy(plan){assertPlan(plan);const record=safeJson(plan);const payload={format:FORMAT,schemaVersion:plan.schemaVersion,storageVersion:STORAGE_VERSION,exportedAt:new Date().toISOString(),checksum:checksum(record),record:plan};return safeJson(payload);}
  function importCopy(text){if(enc(text)>MAX_BYTES)throw new Error('Saved copy is too large.');let payload;try{payload=JSON.parse(text)}catch{throw new Error('Saved copy is not valid JSON.');}if(payload.format!==FORMAT)throw new Error('Saved copy format is not VESA-TNA.');if(!payload.record||typeof payload.record!=='object'||Array.isArray(payload.record))throw new Error('Saved copy record is missing or invalid.');if(!payload.schemaVersion||payload.schemaVersion!==payload.record.schemaVersion)throw new Error('Saved copy schema metadata does not match its record.');if(typeof payload.checksum!=='string'||!payload.checksum)throw new Error('Saved copy checksum is missing.');const recordText=safeJson(payload.record);if(payload.checksum!==checksum(recordText))throw new Error('Saved copy checksum does not match.');return migratePlan(payload.record).plan;}
  function createHistory(initial){return {past:[],present:initial,future:[]};}
  function pushHistory(history,next){return {past:[...history.past,history.present].slice(-50),present:next,future:[]};}
  function undo(history){if(!history.past.length)return history;const present=history.past.at(-1);return {past:history.past.slice(0,-1),present,future:[history.present,...history.future]};}
  function redo(history){if(!history.future.length)return history;const present=history.future[0];return {past:[...history.past,history.present],present,future:history.future.slice(1)};}
  function splitCsvLine(line){const cells=[];let cell='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){quoted=!quoted;continue;}if((ch===','||ch==='\t')&&!quoted){cells.push(cell);cell='';continue;}cell+=ch;}cells.push(cell);return cells.map(v=>v.trim());}
  function xlsxLib(){if(root.XLSX)return root.XLSX;if(typeof require==='function')return require('../vendor/xlsx.full.min.js');return null;}
  function importPreview(text){if(enc(text)>MAX_BYTES)throw new Error('Import text is too large.');const lines=String(text||'').split(/\r?\n/).filter(Boolean);if(!lines.length)return {headers:[],rows:[],warnings:['No rows found.'],formulaCells:[],ambiguousDates:[]};const headers=splitCsvLine(lines[0]);const rows=lines.slice(1).map(splitCsvLine);const formulaCells=[],ambiguousDates=[];rows.forEach((row,r)=>row.forEach((cell,c)=>{if(/^[=+\-@]/.test(cell))formulaCells.push({row:r+2,column:headers[c]||c+1,value:cell});if(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(cell))ambiguousDates.push({row:r+2,column:headers[c]||c+1,value:cell});}));const lower=headers.map(h=>h.toLowerCase());const mapping={buyerName:lower.findIndex(h=>h.includes('buyer')),factoryName:lower.findIndex(h=>h.includes('factory')),styleNo:lower.findIndex(h=>h.includes('style')),poNumber:lower.findIndex(h=>h.includes('po')),totalQty:lower.findIndex(h=>h.includes('qty')||h.includes('quantity')),buyerRequiredExFactory:lower.findIndex(h=>h.includes('ex')&&h.includes('factory'))};return {headers,rows:rows.slice(0,10),mapping,formulaCells,ambiguousDates,warnings:[...formulaCells.map(cell=>`Formula-like cell blocked at ${cell.column} row ${cell.row}`),...ambiguousDates.map(cell=>`Ambiguous date requires mapping at ${cell.column} row ${cell.row}`)]};}
  function importWorkbookPreview(input,fileName='workbook.xlsx'){const name=String(fileName||'').toLowerCase();if(name.endsWith('.xlsm'))throw new Error('Macro-enabled Excel workbooks are not accepted. Save a clean .xlsx copy first.');const bytes=input instanceof ArrayBuffer?input.byteLength:(input?.byteLength||input?.length||0);if(bytes>MAX_BYTES)throw new Error('Workbook is too large.');const XLSX=xlsxLib();if(!XLSX)throw new Error('Excel workbook parser is not bundled.');let workbook;try{workbook=XLSX.read(input,{type:input instanceof ArrayBuffer?'array':'buffer',cellFormula:true,cellDates:false});}catch{throw new Error('Workbook could not be read. Use a valid .xlsx file.');}if(workbook.vbaraw)throw new Error('Macro-enabled Excel workbooks are not accepted. Save a clean .xlsx copy first.');const sheetName=workbook.SheetNames[0];if(!sheetName)return {headers:[],rows:[],warnings:['No worksheets found.'],formulaCells:[],ambiguousDates:[]};const sheet=workbook.Sheets[sheetName];const formulaCells=[];const range=sheet['!ref']?XLSX.utils.decode_range(sheet['!ref']):null;if(range){for(let row=range.s.r;row<=Math.min(range.e.r,20);row++){for(let col=range.s.c;col<=range.e.c;col++){const address=XLSX.utils.encode_cell({r:row,c:col});const cell=sheet[address];if(cell?.f)formulaCells.push({row:row+1,column:address,value:'formula blocked'});}}}const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false,defval:''});const text=rows.map(row=>row.map(cell=>String(cell??'').replace(/[\t\r\n]+/g,' ')).join('\t')).join('\n');const preview=importPreview(text);preview.workbook={sheetName,rowCount:Math.max(0,rows.length-1),parser:'xlsx@0.18.5'};preview.formulaCells=[...formulaCells,...preview.formulaCells];preview.warnings=[...formulaCells.map(cell=>`Formula cell blocked at ${cell.column}`),...preview.warnings];return preview;}
  function safeCell(value){const text=String(value??'');return /^\s*[=+\-@]/.test(text)?`'${text}`:text;}
  function exportCsv(plan){assertPlan(plan);const row=[plan.order.buyerName,plan.order.factoryName,plan.order.styles?.[0]?.styleNo,plan.order.poNumbers?.[0],plan.order.totalQty,plan.commitments.buyerRequiredExFactory].map(safeCell);return ['Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory',row.join(',')].join('\n');}
  function exportWorkbook(plan){assertPlan(plan);const XLSX=xlsxLib();if(!XLSX)throw new Error('Excel workbook parser is not bundled.');const rows=[['Buyer','Factory','Style','PO','Quantity','Buyer Required Ex-Factory'],[plan.order.buyerName,plan.order.factoryName,plan.order.styles?.[0]?.styleNo,plan.order.poNumbers?.[0],plan.order.totalQty,plan.commitments.buyerRequiredExFactory].map(safeCell),[],['Record ID',safeCell(plan.recordId)],['Schema',safeCell(plan.schemaVersion)],['Exported At',new Date().toISOString()]];const workbook=XLSX.utils.book_new();const sheet=XLSX.utils.aoa_to_sheet(rows);XLSX.utils.book_append_sheet(workbook,sheet,'TNA Summary');return XLSX.write(workbook,{type:'buffer',bookType:'xlsx'});}

  /**
   * The approved R01 report alone carries factory/internal garment details.
   * The four established sheets and IDs are retained. R01 adds a fully typed
   * Master TNA worksheet sourced from the same read-only on-screen projection.
   * Values beginning with formula operators (after whitespace) are escaped.
   * Report generation is read-only and never mutates a local plan.
   */
  function exportReportWorkbook(model){
    const XLSX=xlsxLib();
    if(!XLSX)throw new Error('Excel workbook parser is not bundled.');
    if(!model||model.schema!=='VESA-TNA-REPORT-1')throw new Error('Unsupported TNA report model.');
    if(model.reportId==='R03'&&!model.factoryDaily?.ready)
      throw new Error(model.factoryDaily?.labels?.selectDate||'Select a valid review date before downloading this report.');
    const workbook=XLSX.utils.book_new();
    const addSheet=(name,rows,widths,filter=false)=>{
      const sheet=XLSX.utils.aoa_to_sheet(rows,{dateNF:'yyyy-mm-dd'});
      sheet['!cols']=widths.map(wch=>({wch}));
      if(filter&&sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      XLSX.utils.book_append_sheet(workbook,sheet,name);
    };
    const numberCell=value=>typeof value==='number'&&Number.isFinite(value)?value:safeCell(value);
    const dateCell=value=>{
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return safeCell(value||'Needs Information');
      const parsed=new Date(value+'T00:00:00Z');
      return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value
        ?parsed:safeCell(value);
    };
    const meta=[
      ['Brand',safeCell(model.brand)],['Report ID',safeCell(model.reportId)],
      ['Title',safeCell(model.title)],['Audience',safeCell(model.audience)],
      ['Language',safeCell(model.language)],['Generated',safeCell(model.generatedAt)],
      ['Timezone',safeCell(model.timezone)],['Revision',numberCell(model.revision)],
      ['No fabrication note',safeCell(model.labels?.noFabrication)]
    ];
    addSheet('Report Summary',meta,[24,96]);
    const orderRows=[
      ['Buyer','Factory','Style','PO','Quantity','Unit','Required Ex-Factory'],
      [safeCell(model.order.buyer),safeCell(model.order.factory),safeCell(model.order.style),
       safeCell(model.order.po),numberCell(model.order.quantity),
       safeCell(model.order.unit),dateCell(model.order.requiredExFactory)]
    ];
    if(model.reportId==='R01'&&model.masterSheet){
      const order=model.masterSheet.order;
      orderRows.push([],['Fabric details',safeCell(order.fabricSpec||'Needs Information')],
        ['Fabric GSM',numberCell(order.fabricWeightGsm??'Needs Information')],
        ['Master LC status',safeCell(order.masterLcStatus||'Needs Information')],
        ['Master LC opened',dateCell(order.masterLcOpenedOn)],
        ['Master LC evidence',safeCell(order.masterLcProofRef||'Needs Information')],
        ['Evidence status',safeCell(model.masterSheet.evidenceStatus)]);
    }
    addSheet('Order Summary',orderRows,[28,28,24,20,14,10,22],true);
    const taskRows=[
      ['Ref','Activity','Owner','Status','Baseline','Current','Forecast','Actual','Risk'],
      ...(model.tasks||[]).map(task=>[task.ref,task.title,task.owner,task.status,
        task.baseline,task.current,task.forecast,task.actual,task.risk].map(safeCell))
    ];
    addSheet('Report Activities',taskRows,[10,48,22,18,14,14,14,14,20],true);

    // R02 is constructed solely from the sanitized buyer-facing model.
    // Never read source OrderPlan here: hidden LC, costing and internal details
    // cannot be inferred from a user-facing worksheet.
    if(model.reportId==='R02'){
      if(!model.buyerTna||!Array.isArray(model.buyerTna.milestones)||
        !Array.isArray(model.buyerTna.actions)||!model.buyerTna.labels)
        throw new Error('Buyer report must be reviewed before Excel download.');
      const buyer=model.buyerTna,l=buyer.labels;
      const show=value=>value==null||value===''?l.unknown:safeCell(value);
      const rows=[[l.ref,l.milestone,l.original,l.current,l.forecast,l.actual,
        l.status,l.action,l.verification],
        ...buyer.milestones.map(row=>[
          safeCell(row.ref),safeCell(row.title),dateCell(row.original),
          dateCell(row.current),dateCell(row.forecast),dateCell(row.actual),
          safeCell(row.status),show(row.buyerAction),safeCell(row.verification)
        ])];
      addSheet('Buyer Milestones',rows,[12,45,18,18,18,18,28,45,52],true);
      const actions=[[l.ref,l.milestone,l.action,l.current],
        ...buyer.actions.map(row=>[safeCell(row.ref),safeCell(row.title),
          safeCell(row.request),dateCell(row.target)])];
      if(!buyer.actions.length)actions.push([l.unknown,safeCell(l.noActions),l.unknown,l.unknown]);
      actions.push([], [l.requested,dateCell(buyer.requestedExFactory)],
        [l.confirmed,show(buyer.buyerConfirmedTarget)]);
      addSheet('Buyer Actions',actions,[24,44,51,25]);
    }

    // R03 read-only factory operational audience; dates remain genuine typed
    // Excel calendar dates and all source text remains formula-escaped.
    if(model.reportId==='R03'){
      const daily=model.factoryDaily,labels=daily.labels;
      const txt=value=>safeCell(value==null||value===''?labels.unknown:value);
      const typedDate=value=>value==null||value===''?txt(labels.unknown):dateCell(value);
      const windows=['overdue','today','nextSeven'];
      const headers=[labels.group,labels.ref,labels.activity,labels.department,
        labels.target,labels.original,labels.revised,labels.forecast,labels.actual,
        labels.status,labels.waiting,labels.reason,labels.followup,labels.recovery,labels.proof];
      const rowCells=row=>[
        txt(labels[row.group]),txt(row.ref),txt(row.activity),txt(row.department),
        typedDate(row.due),typedDate(row.original),typedDate(row.revised),
        typedDate(row.forecast),typedDate(row.actual),txt(row.statusDisplay),txt(row.waiting),
        txt(row.reason),txt(row.followup),txt(row.recovery),txt(row.proof)
      ];
      const actions=[headers];
      for(const window of windows){
        const items=daily.sections[window];
        if(items.length)actions.push(...items.map(rowCells));
        else actions.push([txt(labels[window]),txt(labels.noActions)]);
      }
      addSheet('Factory Daily Actions',actions,
        [20,14,53,25,18,18,18,18,18,21,21,54,54,54,39],true);
      const dateGaps=[headers,...daily.sections.needsDate.map(rowCells)];
      if(!daily.sections.needsDate.length)dateGaps.push([txt(labels.needsDate),txt(labels.noActions)]);
      addSheet('Missing Action Dates',dateGaps,
        [25,14,53,25,18,18,18,18,18,21,21,54,54,54,39],true);
      // Append as-of review date after static report identity fields.
      const summary=workbook.Sheets['Report Summary'];
      const XLSXRows=XLSX.utils.sheet_to_json(summary,{header:1,raw:true});
      XLSXRows.push([txt(labels.asOf),dateCell(daily.asOfDate)],
        [txt(labels.count),numberCell(daily.undatedCount)],
        [txt(labels.missingOwner),numberCell(daily.missingOwnerCount)]);
      workbook.Sheets['Report Summary']=XLSX.utils.aoa_to_sheet(XLSXRows,{dateNF:'yyyy-mm-dd'});
      workbook.Sheets['Report Summary']['!cols']=[{wch:27},{wch:96}];
    }
    if(model.reportId==='R01'&&model.masterSheet){
      const l=model.masterSheet.labels||{};
      const h=[l.stage||'Section',l.activity||'Activity',l.owner||'Responsible party',
        l.planned||'Planned',l.revised||'Revised',l.forecast||'Forecast',
        l.actual||'Actual',l.delay||'Days delay',l.status||'Status',
        l.waiting||'Waiting for',l.proof||'Approval / source',
        l.remarks||'Remarks','Predecessors'];
      const masterRows=[h,...model.masterSheet.rows.map(row=>[
        safeCell(row.stage),safeCell(row.activity),safeCell(row.owner),
        dateCell(row.planned),dateCell(row.revised),dateCell(row.forecast),
        dateCell(row.actual),numberCell(row.delayDays??'Needs Information'),
        safeCell(l.statuses?.[row.status]||row.status),
        safeCell(row.waiting||'Needs Information'),safeCell(row.proof||'Not recorded'),
        safeCell(row.remarks||'Not recorded'),safeCell(row.predecessors||'')
      ])];
      addSheet('Master TNA',masterRows,[23,53,21,17,17,17,17,15,20,21,30,56,26],true);
    }
    const warnings=model.warnings?.length?model.warnings:['No validation warnings in this local draft.'];
    const warningRows=[['Warnings / Data gaps'],...warnings.map(item=>[safeCell(item)]),[],
      ['Fallback notes'],...(model.notes||[]).map(item=>[safeCell(item)])];
    addSheet('Report Notes',warningRows,[110]);
    return XLSX.write(workbook,{type:'buffer',bookType:'xlsx'});
  }
  const api={STORAGE_VERSION,FORMAT,MAX_BYTES,QUEUE_VERSION,QUEUE_MAX_ITEMS,QUEUE_MAX_BYTES,checksum,migratePlan,savePlan,listPlans,loadPlan,autosave,recoverAutosave,queueOfflineIntent,listOfflineIntents,updateOfflineIntent,reconcileOfflineIntent,exportCopy,importCopy,createHistory,pushHistory,undo,redo,importPreview,importWorkbookPreview,exportCsv,exportWorkbook,exportReportWorkbook,safeCell};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
