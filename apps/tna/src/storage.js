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
    if(model.reportId==='R04'&&!model.criticalPath?.ready)
      throw new Error(model.criticalPath?.labels?.controls||'Review the critical-path source assumptions before downloading.');
    if(model.reportId==='R05'&&!model.weeklyTna?.ready)
      throw new Error(model.weeklyTna?.labels?.selectDates||'Select the weekly report dates before downloading.');
    if(model.reportId==='R06'&&!model.delayRecovery?.ready)
      throw new Error(model.delayRecovery?.labels?.selectReview||'Review internal report access and select a valid date.');
    if(model.reportId==='R07'&&!model.productionStatus?.ready)
      throw new Error(model.productionStatus?.labels?.selectReview||'Choose authorized production report audience and valid date.');
    if(model.reportId==='R08'&&!model.materialLcReport?.ready)
      throw new Error(model.materialLcReport?.labels?.selectReview||'Select a commercial review date and authorization.');
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
    // R04: source-reviewed, single-calendar FS/0 CPM projection only.
    // Never recompute schedule inside the serializer, and never export
    // fabricated float, anchors or gate release.
    if(model.reportId==='R04'){
      const cpm=model.criticalPath,t=cpm.labels;
      const cell=value=>safeCell(value==null||value===''?t.unknown:value);
      const headings=[t.ref,t.task,t.owner,t.status,t.es,t.ef,t.ls,t.lf,t.tf,t.ff,t.driver];
      const actionRows=[headings,...cpm.rows.map(row=>[
        cell(row.ref),cell(row.title),cell(row.owner),cell(row.status),
        dateCell(row.earlyStart),dateCell(row.earlyFinish),
        dateCell(row.lateStart),dateCell(row.lateFinish),
        numberCell(row.totalFloat),numberCell(row.freeFloat),
        cell(row.drivesExFactory?t.yes:t.no)
      ])];
      addSheet('Critical Path',actionRows,[13,57,26,21,18,18,18,18,18,18,22],true);
      const edges=[['Predecessor','Successor','Relation','Lag (workdays)'],
        ...cpm.dependencies.map(edge=>[
          cell(edge.from),cell(edge.to),cell(edge.relation),numberCell(edge.lagUnits)
        ])];
      addSheet('Predecessor Links',edges,[20,20,14,23],true);
      const gateRows=[[t.ref,t.task,t.status,t.reason],
        ...(cpm.gateIssues.length?cpm.gateIssues.map(item=>[
          cell(item.ref),cell(item.title),cell(item.status),cell(item.reason)
        ]):[[cell(t.none),'','','']])];
      addSheet('Gate Issues',gateRows,[14,56,22,69],true);
      const facts=[
        [t.start,dateCell(cpm.startDate)],
        [t.source,cell(cpm.startSource)],
        [t.required,dateCell(cpm.requiredDate)],
        [t.forecast,dateCell(cpm.forecastDate)],
        [t.margin,numberCell(cpm.bufferWorkdays)],
        [t.week,cell(cpm.workingWeek)],
        [t.exceptions,cell(cpm.exceptionDates.join(', ')||t.none)],
        [t.headingDrivers,cell(cpm.criticalChains.map(chain=>chain.join(' → ')).join(' ; ')||t.unknown)],
        [t.version,cell(cpm.engineVersion)+' / '+numberCell(cpm.inputRevision)],
        [t.model,cell(cpm.confidence)],
        [t.notProduction,cell(t.sourceCheck)]
      ];
      addSheet('CPM Review',facts,[40,104]);
      const metaSheet=workbook.Sheets['Report Summary'];
      const metaRows=XLSX.utils.sheet_to_json(metaSheet,{header:1,raw:true});
      metaRows.push([cell(t.required),dateCell(cpm.requiredDate)],
        [cell(t.forecast),dateCell(cpm.forecastDate)],
        [cell(t.margin),numberCell(cpm.bufferWorkdays)],
        [cell(t.week),cell(cpm.workingWeek)]);
      workbook.Sheets['Report Summary']=XLSX.utils.aoa_to_sheet(metaRows,{dateNF:'yyyy-mm-dd'});
      workbook.Sheets['Report Summary']['!cols']=[{wch:28},{wch:98}];
    }
    // R05: strictly buyer-safe, reviewed weekly sections. A source recovery
    // note is never automatically labelled as an agreement; the report model
    // exposes only separately attested safe wording, not raw source remarks.
    if(model.reportId==='R05'){
      const weekly=model.weeklyTna,words=weekly.labels;
      const show=value=>safeCell(value==null||value===''?words.unknown:value);
      const typedDate=value=>value==null||value===''?show(words.unknown):dateCell(value);
      const headings=[words.weekStart,words.ref,words.activity,words.status,
        words.original,words.revised,words.forecast,words.actual,words.due,words.action];
      const actionRows=[headings];
      for(const key of ['completed','missed','nextWeek','approvals']){
        const rows=weekly.sections[key]||[];
        if(!rows.length){actionRows.push([show(words[key]),show(words.noRows)]);continue;}
        for(const row of rows)actionRows.push([
          show(words[key]),show(row.ref),show(row.title),show(row.status),
          typedDate(row.original),typedDate(row.revised),
          typedDate(row.forecast),typedDate(row.actual),typedDate(row.due),
          show(row.request)
        ]);
      }
      addSheet('Weekly TNA',actionRows,[31,15,50,24,19,19,19,19,19,56],true);
      const recoveryRows=[[words.ref,words.activity,words.action,
        words.agreementDate,words.authority,words.source],
        ...(weekly.sections.recoveries.length?weekly.sections.recoveries.map(row=>[
          show(row.ref),show(row.title),show(row.publicAction),typedDate(row.agreementDate),
          show(row.confirmedBy),show(row.evidenceRecorded)
        ]):[[show(words.noRows)]])];
      addSheet('Confirmed Recovery',recoveryRows,[15,50,72,21,37,70],true);
      const summary=workbook.Sheets['Report Summary'];
      const summaryRows=XLSX.utils.sheet_to_json(summary,{header:1,raw:true});
      summaryRows.push([show(words.weekStart),typedDate(weekly.weekStart)],
        [show(words.weekEnd),typedDate(weekly.weekEnd)],
        [show(words.reviewDate),typedDate(weekly.reviewDate)],
        [show(words.missing),numberCell(weekly.missingDueCount)]);
      workbook.Sheets['Report Summary']=XLSX.utils.aoa_to_sheet(summaryRows,{dateNF:'yyyy-mm-dd'});
      workbook.Sheets['Report Summary']['!cols']=[{wch:31},{wch:100}];
    }
    // R06 internal management only: serialise the already reviewed read-only
    // adapter. Do not access plan, recalculate CPM/throughput, invent agreement
    // status or emit private approval proof identifiers from hidden source.
    if(model.reportId==='R06'){
      const report=model.delayRecovery,t=report.labels;
      const val=value=>safeCell(value==null||value===''?t.unknown:value);
      const typedDate=value=>value==null||value===''?val(t.unknown):dateCell(value);
      const num=value=>value==null?val(t.unknown):numberCell(value);
      const yes=value=>val(value?'Yes (source recorded)':'Not recorded');
      const dateRows=[[
        t.ref,t.task,t.owner,t.status,t.original,t.current,t.forecast,t.actual,t.due,
        t.targetChange,t.forecastChange,t.actualChange,t.indicators
      ],...report.issues.map(item=>[
        val(item.ref),val(item.title),val(item.owner),val(item.status),
        typedDate(item.original),typedDate(item.current),typedDate(item.forecast),
        typedDate(item.actual),typedDate(item.due),num(item.targetChangeDays),
        num(item.forecastChangeDays),num(item.actualChangeDays),
        val(item.indicators.join(' / '))
      ])];
      addSheet('Delay Actions',dateRows,[14,58,25,24,18,18,18,18,18,20,20,20,62],true);
      const followRows=[[t.ref,t.task,t.waiting,t.cause,t.recovery,t.linked,t.evidence],
        ...report.issues.map(item=>[
          val(item.ref),val(item.title),val(item.waiting),val(item.cause),
          val(item.recovery),val(item.successors.join(', ')),yes(item.evidenceRecorded)
        ])];
      addSheet('Delay Follow-up',followRows,[13,51,24,75,75,51,26],true);
      const dependencies=[[t.ref,t.linked,t.source],
        ...report.issues.flatMap(item=>item.successors.map(ref=>[
          val(item.ref),val(ref),val(t.linkedCaution)
        ]))];
      if(dependencies.length===1)dependencies.push([val(t.noIssues)]);
      addSheet('Dependency Links',dependencies,[16,17,100],true);
      const scenarioRows=[[
        t.scenario,t.scenarioState,t.created,t.applied,t.baseRevision,
        'Duration changes','Route changes','Calendar changes','Capacity changes',t.affected
      ],...report.scenarios.map(item=>[
        val(item.name),val(item.state),val(item.createdAt),val(item.appliedAt),
        num(item.baseRevision),numberCell(item.counts.durationAdjustments),
        numberCell(item.counts.routeChanges),numberCell(item.counts.calendarChanges),
        numberCell(item.counts.capacityChanges),val(item.relatedRefs.join(', '))
      ])];
      if(scenarioRows.length===1)scenarioRows.push([val(t.noScenarios)]);
      addSheet('Recovery Scenarios',scenarioRows,[55,22,27,27,17,20,20,20,20,47],true);
      const approvalRows=[[
        t.approval,t.approvalState,t.response,t.submitted,t.decision,t.authority,t.proof,t.related
      ],...report.approvals.map(item=>[
        val(item.item),val(item.state),val(item.response),typedDate(item.submitted),
        typedDate(item.decision),yes(item.authorityRecorded),yes(item.evidenceRecorded),
        val(item.relatedRefs.join(', '))
      ])];
      if(approvalRows.length===1)approvalRows.push([val(t.noApprovals)]);
      addSheet('Approval Records',approvalRows,[57,25,24,20,20,34,34,50],true);
      const summary=workbook.Sheets['Report Summary'];
      const summaryRows=XLSX.utils.sheet_to_json(summary,{header:1,raw:true});
      summaryRows.push([val(t.asOf),typedDate(report.asOfDate)],
        [val(t.headingIssues),numberCell(report.counts.issues)],
        [val(t.overdue),numberCell(report.counts.overdue)],
        [val(t.blocked),numberCell(report.counts.blocked)],
        [val(t.noTarget),numberCell(report.counts.missingTarget)],
        [val(t.headingScenarios),numberCell(report.counts.scenario)],
        [val(t.headingApprovals),numberCell(report.counts.approval)],
        [val(t.consentNotAccess),val(t.source)]);
      workbook.Sheets['Report Summary']=XLSX.utils.aoa_to_sheet(summaryRows,{dateNF:'yyyy-mm-dd'});
      workbook.Sheets['Report Summary']['!cols']=[{wch:55},{wch:106}];
    }
    // R07 source-only production report. Typed quantities/dates are taken ONLY
    // from its audience-filtered projection. No plan, factory notes, commercial
    // source, private evidence or unaudited aggregate is read by this exporter.
    if(model.reportId==='R07'){
      const p=model.productionStatus,t=p.labels;
      const txt=value=>safeCell(value===null||value===undefined||value===''?t.unknown:value);
      const num=value=>value===null||value===undefined?txt(t.unknown):numberCell(value);
      const date=value=>value?dateCell(value):txt(t.unknown);
      const stages=[[t.stage,t.ref,t.status,t.original,t.current,t.sourceForecast,
        t.start,t.actual,t.required,t.completed,t.remaining,t.unit,t.rate,t.days,t.projected],
        ...p.stages.map(item=>[
          txt(item.title),txt(item.endRef),txt(item.status),date(item.original),
          date(item.revised),date(item.forecast),date(item.actualStart),
          date(item.actualFinish),num(item.required),num(item.completed),
          num(item.remaining),txt(item.unit),num(item.rate),num(item.days),
          date(item.projectedFinish)
        ])];
      addSheet('Production Stages',stages,[26,16,24,20,20,23,20,20,19,19,19,13,22,25,23],true);
      const events=[[t.stage,t.ref,t.milestone,t.actual],
        ...p.milestones.map(item=>[txt(item.stage),txt(item.ref),
          txt(item.kind==='start'?t.start:t.actual),date(item.date)])];
      addSheet('Production Events',events,[30,18,32,22],true);
      if(p.mode==='internal'){
        const operationRows=[[t.operation,t.stage,t.lot,t.qtyInput,t.qtyDone,
          t.rejected,t.reworked,t.wip,t.unaccounted,t.unit,t.quantityState],
          ...(p.operations.length?p.operations.map(op=>[
            txt(op.ref),txt(op.stage),txt(op.lot),num(op.input),
            num(op.completed),num(op.rejected),num(op.reworked),num(op.wip),
            num(op.unaccounted),txt(op.unit),txt(op.sourceState)
          ]):[[txt(t.noSource)]])];
        addSheet('Operation Snapshots',operationRows,[31,28,23,17,17,17,17,17,22,14,64],true);
      }
      const rows=XLSX.utils.sheet_to_json(workbook.Sheets['Report Summary'],
        {header:1,raw:true});
      rows.push([txt(t.asOf),date(p.asOfDate)],[txt(t.audience),txt(model.audience)],
        [txt(t.stage),numberCell(p.counts.stages)],
        [txt(t.noSource),numberCell(p.counts.missingQuantity)],
        [txt(t.missingRate),numberCell(p.counts.missingRate)],
        [txt(t.noAccess),txt(t.source)]);
      workbook.Sheets['Report Summary']=XLSX.utils.aoa_to_sheet(rows,{dateNF:'yyyy-mm-dd'});
      workbook.Sheets['Report Summary']['!cols']=[{wch:57},{wch:108}];
    }
    // R08: private report only from the gated, read-only material projection.
    // Excel numbers and ISO dates retain real types, while LC evidence IDs,
    // source remarks, account numbers and supplier prices never enter the model.
    if(model.reportId==='R08'){
      const report=model.materialLcReport,t=report.labels;
      const value=x=>safeCell(x===null||x===undefined||x===''?t.missing:x);
      const qty=x=>x===null||x===undefined?value(t.missing):numberCell(x);
      const date=x=>x?dateCell(x):value(t.missing);
      const yes=x=>value(x?'Yes (source-recorded)':'Not recorded');
      const m=report.master;
      const masterRows=[
        [t.masterStatus,t.masterDate,t.masterEvidence,t.materialState],
        [value(m.status),date(m.openedOn),yes(m.evidenceRecorded),value(m.state)],
        [],[value(t.masterWarning)]
      ];
      addSheet('Master LC Review',masterRows,[29,22,35,102]);
      const matRows=[[
        t.ref,t.category,t.supplier,t.country,t.payment,t.masterRef,
        t.required,t.unit,t.shortage,t.booking,t.application,t.opened,
        t.b2bState,t.inHouse,t.qc,t.materialState,t.evidence
      ],...(report.materials.length?report.materials.map(row=>[
        value(row.ref),value(row.category),value(row.supplier),value(row.country),
        value(row.payment),yes(row.masterLcAssociated),
        qty(row.requiredQty),value(row.unit),qty(row.shortageQty),
        date(row.booking),date(row.application),date(row.b2bOpened),
        value(row.b2bState),date(row.inHouse),date(row.qcDate),
        value([row.qcState,row.shortageState,row.readiness].join(' · ')),
        yes(row.sourceEvidenceRecorded)
      ]):[[value(t.noData)]])];
      addSheet('Material Sources',matRows,[23,25,40,20,24,29,23,14,22,21,23,24,66,22,22,87,32],true);
      const tasks=[[t.ref,t.task,t.status,t.original,t.current,t.forecast,t.actual],
        ...(report.milestones.length?report.milestones.map(row=>[
          value(row.ref),value(row.title),value(row.status),
          date(row.original),date(row.current),date(row.forecast),date(row.actual)
        ]):[[value(t.noTasks)]])];
      addSheet('Sourcing Milestones',tasks,[16,52,24,22,22,23,23],true);
      const summary=XLSX.utils.sheet_to_json(workbook.Sheets['Report Summary'],
        {header:1,raw:true});
      summary.push([value(t.asOf),date(report.asOfDate)],
        [value(t.materials),numberCell(report.counts.materials)],
        [value(t.shortagePositive),numberCell(report.counts.shortages)],
        [value(t.qcPending),numberCell(report.counts.missingQc)],
        [value(t.noAccess),value(t.masterWarning)]);
      workbook.Sheets['Report Summary']=XLSX.utils.aoa_to_sheet(summary,{dateNF:'yyyy-mm-dd'});
      workbook.Sheets['Report Summary']['!cols']=[{wch:53},{wch:108}];
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
