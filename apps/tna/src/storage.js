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

  /**
   * R10 owns a read-only same-browser-user saved-order snapshot.
   * The anchor must be in this exact user storage bucket. Only compatible
   * saved records sharing anchor owner and tenant enter the result; no
   * autosave, practice, other profile key, network, source mutation, local
   * storage migration/write or unauthorized cross-tenant rollup is performed.
   * This is a local segregation safeguard, NOT server authentication.
   */
  class TnaLocalPortfolioReader {
    static snapshot(anchorRecordId,user){
      const result={scope:'same-user-local-saved',anchorRecordId:anchorRecordId||null,
        status:'unavailable',plans:[],savedCount:0,excludedCount:0};
      if(typeof anchorRecordId!=='string'||!anchorRecordId.trim()||
        typeof user!=='string'||!user.trim())return {...result,status:'anchor-required'};
      let raw,box;
      try{
        raw=localStorage.getItem(key(user));
        if(raw===null)return {...result,status:'anchor-not-saved'};
        if(enc(raw)>MAX_BYTES)return {...result,status:'unavailable'};
        box=JSON.parse(raw);
        if(!box||!Array.isArray(box.records)||
          (box.storageVersion&&box.storageVersion!==STORAGE_VERSION))
          return {...result,status:'unavailable'};
      }catch{return {...result,status:'unavailable'};}
      const records=box.records;
      const anchors=records.filter(item=>item?.recordId===anchorRecordId);
      if(anchors.length!==1)return {...result,status:'anchor-not-saved'};
      let anchor;
      try{
        if(anchors[0]?.plan?.recordId!==anchorRecordId)throw Error('record ID mismatch');
        anchor=migratePlan(anchors[0].plan).plan;
        if(anchor.mode==='practice'||!anchor.ownerUserId)throw Error('practice or no local owner');
      }catch{return {...result,status:'anchor-invalid'};}
      const plans=[],seen=new Set();
      for(const item of records){
        try{
          if(typeof item?.recordId!=='string'||seen.has(item.recordId))
            throw Error('missing / duplicate record');
          seen.add(item.recordId);
          if(item.plan?.recordId!==item.recordId)throw Error('record wrapper mismatch');
          const plan=migratePlan(item.plan).plan;
          if(plan.mode==='practice'||plan.ownerUserId!==anchor.ownerUserId||
            (plan.tenantId||null)!==(anchor.tenantId||null))
            throw Error('outside anchor local-owner/tenant scope');
          plans.push(plan);
        }catch{ /* Intentionally omit data; never expose another owner. */ }
      }
      const found=plans.some(plan=>plan.recordId===anchorRecordId);
      return {...result,status:found?'ok':'anchor-invalid',
        plans:found?plans:[],savedCount:records.length,
        excludedCount:records.length-(found?plans.length:0)};
    }
  }
  function portfolioSnapshot(anchorRecordId,user){
    return TnaLocalPortfolioReader.snapshot(anchorRecordId,user);
  }

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
   * Owns one extra Excel worksheet for R01 Master TNA, never for buyer R02.
   * Consumes read-only report projection; no local storage or business mutation.
   * Dates are Excel day serials with a civil-date format; unverified dates remain text.
   * Internal free-text notes and commercial values are deliberately excluded.
   */
  class TnaMasterWorkbookWriter {
    static dateValue(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return 'Needs Information';
      const epoch=Date.parse(value+'T00:00:00Z');
      return Number.isFinite(epoch)&&new Date(epoch).toISOString().slice(0,10)===value&&value>='1900-03-01'?Math.floor(epoch/86400000)+25569:'Needs Information';
    }

    /** Appends only sourced garment activity fields, leaving legacy sheets untouched. */
    static append(XLSX,workbook,model){
      if(model.reportId!=='R01'||model.masterTna?.schema!=='VESA-TNA-MASTER-1')return;
      const headings=['Stage','Ref','Activity','Responsible','Original baseline','Current target','Forecast finish','Actual finish','Calendar days late','Compared to','Status','Predecessor refs'];
      const rows=[headings,...(model.masterTna.rows||[]).map(task=>[
        safeCell(task.stage),safeCell(task.ref),safeCell(task.activity),safeCell(task.owner),
        this.dateValue(task.baseline),this.dateValue(task.target),this.dateValue(task.forecast),this.dateValue(task.actual),
        task.calendarDaysLate===null?'Needs Information':task.calendarDaysLate,
        safeCell(task.comparedTo||'Needs Information'),safeCell(task.status),safeCell(task.dependencies)
      ])];
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[25,11,46,23,18,18,18,18,20,16,20,30].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      for(let row=2;row<=rows.length;row++)for(const column of ['E','F','G','H']){
        const cell=sheet[column+row];
        if(cell&&cell.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,sheet,'Master TNA');
    }

  }
  /**
   * R03-only Factory Daily Action Excel writer for authorized departments.
   * Access: exportReportWorkbook(model), never direct buyer report generation.
   * Consumes immutable R03 projection, writes typed due-date/offset cells and
   * sanitized notes/evidence. Does not mutate or save a business plan.
   * Missing dates remain explicitly unknown and R02 stays without this sheet.
   */
  class TnaFactoryDailyWorkbookWriter {
    /** Keep untrusted spreadsheet text inert, including leading-space formulas. */
    static safeText(value){
      const raw=String(value??'');
      return /^\s*[=+\-@]/.test(raw)?"'"+raw:safeCell(raw);
    }

    /** Append every open task in a clearly named bucket, never fabricating a date. */
    static append(XLSX,workbook,model){
      const daily=model.factoryDailyAction;
      if(model.reportId!=='R03'||daily?.schema!=='VESA-TNA-DAILY-1')return;
      const order=['overdue','today','nextSeven','needsInformation','later'];
      const rows=[daily.labels.columns];
      for(const group of order){
        for(const item of daily.groups[group]||[]){
          rows.push([
            this.safeText(daily.labels.groups[group]),this.safeText(item.ref),
            this.safeText(item.title),this.safeText(item.owner),
            TnaMasterWorkbookWriter.dateValue(item.due),
            this.safeText(daily.labels.source[item.dateSource]||daily.labels.missing),
            item.calendarDaysFromToday===null?daily.labels.missing:item.calendarDaysFromToday,
            this.safeText(item.status),this.safeText(item.delayReason||daily.labels.missing),
            this.safeText(item.followupNote||daily.labels.missing),
            this.safeText(item.proofRefs?.length?item.proofRefs.join(' · '):daily.labels.missing)
          ]);
        }
      }
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[25,12,48,24,18,24,22,20,35,48,46].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      for(let row=2;row<=rows.length;row++)if(sheet['E'+row]?.t==='n')sheet['E'+row].z='yyyy-mm-dd';
      XLSX.utils.book_append_sheet(workbook,sheet,'Factory Daily Action');
    }

  }

  /**
   * R04 MANAGEMENT Excel adapter, only for an explicitly valid engine result.
   * Access: exportReportWorkbook(model) -> append. It retains the four common
   * worksheets and R01/R03 conditional reports. No source record mutation,
   * plan upgrades, workbook formulas or unverified delivery promises.
   */
  class TnaCriticalPathWorkbookWriter {
    /** Append source-proven float and date columns, or an explicit missing-input row. */
    static append(XLSX,workbook,model){
      const cpm=model.criticalPath;
      if(model.reportId!=='R04'||cpm?.schema!=='VESA-TNA-CPM-1')return;
      const header=cpm.labels.labels;
      const rows=[header];
      if(cpm.validity==='valid'){
        for(const task of cpm.rows){
          rows.push([
            TnaFactoryDailyWorkbookWriter.safeText(task.ref+' / '+task.stage),
            TnaFactoryDailyWorkbookWriter.safeText(task.activity),
            TnaFactoryDailyWorkbookWriter.safeText(task.owner),
            TnaMasterWorkbookWriter.dateValue(task.earlyStart),
            TnaMasterWorkbookWriter.dateValue(task.earlyFinish),
            TnaMasterWorkbookWriter.dateValue(task.lateFinish),
            task.totalFloat,task.freeFloat,task.isCritical?'Yes':'No',
            TnaFactoryDailyWorkbookWriter.safeText(task.status),
            TnaFactoryDailyWorkbookWriter.safeText(String(task.taskDuration)+' '+task.durationBasis),
            TnaFactoryDailyWorkbookWriter.safeText(task.predecessors.join(', ')||'—')
          ]);
        }
      }else rows.push([cpm.labels.unknown,
        TnaFactoryDailyWorkbookWriter.safeText([...cpm.missingInputs,...cpm.errors].join('; ')||cpm.labels.missing)]);
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[25,48,25,18,18,18,17,17,15,19,18,35].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      if(cpm.validity==='valid')for(let row=2;row<=rows.length;row++)for(const column of ['D','E','F']){
        const cell=sheet[column+row];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,sheet,'Critical Path');
    }
  }

  /**
   * R02 buyer-safe XLSX boundary. This writer only receives the allowlisted
   * model.buyerTna projection and NEVER reads a raw TNA plan, internal notes,
   * prices, supplier references or browser-local record IDs.
   * Access: exportReportWorkbook(model) when reportId==='R02'.
   * Creates four expected common sheets plus a typed Buyer Milestones sheet.
   * All untrusted strings remain inert spreadsheet text (including leading
   * whitespace formulas); no mutation, network call or automatic sharing.
   */
  class TnaBuyerWorkbookWriter {
    /** Excel formula injection guard for buyer-, title- and reference-sourced strings. */
    static text(value){
      const raw=String(value??'');
      return /^\s*[=+\-@]/.test(raw)?"'"+raw:raw;
    }

    /** Owner of all five export sheets; accepts only a validated R02 projection. */
    static export(XLSX,model){
      if(model.reportId!=='R02'||model.buyerTna?.schema!=='VESA-TNA-BUYER-1')
        throw new Error('Buyer milestone report information is missing.');
      const buyer=model.buyerTna,w=buyer.labels,book=XLSX.utils.book_new();
      const add=(name,rows,widths,filter=false)=>{
        const sheet=XLSX.utils.aoa_to_sheet(rows);
        sheet['!cols']=widths.map(wch=>({wch}));
        if(filter&&sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
        XLSX.utils.book_append_sheet(book,sheet,name);
        return sheet;
      };
      add('Report Summary',[
        ['Brand',this.text(model.brand)],
        ['Report ID','R02'],['Title',this.text(model.title)],
        ['Audience',this.text(model.audience)],['Language',this.text(model.language)],
        ['Generated',this.text(model.generatedAt)],['Timezone',this.text(model.timezone)],
        ['Revision',model.revision],['Target verification',this.text(buyer.targetVerification)],
        ['Recipient review required',this.text(buyer.notice)]
      ],[30,100]);
      const order=add('Order Summary',[
        ['Buyer','Style','PO','Quantity','Unit','Required Ex-Factory','Verification'],
        [this.text(buyer.order.buyer),this.text(buyer.order.style),
          this.text(buyer.order.po),typeof buyer.order.quantity==='number'?buyer.order.quantity:this.text(buyer.order.quantity),
          this.text(buyer.order.unit),
          TnaMasterWorkbookWriter.dateValue(buyer.order.requiredExFactory),
          this.text(buyer.targetVerification)]
      ],[26,28,24,16,12,23,44],true);
      if(order.F2?.t==='n')order.F2.z='yyyy-mm-dd';
      add('Report Activities',[
        ['Ref','Activity','Owner','Status','Baseline','Current','Forecast','Actual','Risk'],
        ...model.tasks.map(row=>[
          this.text(row.ref),this.text(row.title),this.text(row.owner),this.text(row.status),
          this.text(row.baseline),this.text(row.current),this.text(row.forecast),
          this.text(row.actual),this.text(row.risk)])
      ],[12,50,24,45,18,18,18,18,34],true);
      add('Report Notes',[
        ['Buyer-safe data gaps'],...buyer.warnings.map(item=>[this.text(item)]),
        [],['Before manually sharing'],[this.text(buyer.notice)],
        [],['Buyer responses requested in local record'],
        ...(buyer.requiredActions.length?buyer.requiredActions.map(row=>[
          this.text(row.ref+' / '+row.title+' — '+row.action)]):[[this.text(w.noAction)]])
      ],[110]);
      const milestones=add('Buyer Milestones',[
        w.cols,
        ...buyer.rows.map(row=>[
          this.text(row.ref),this.text(row.title),
          TnaMasterWorkbookWriter.dateValue(row.original),
          TnaMasterWorkbookWriter.dateValue(row.target),
          TnaMasterWorkbookWriter.dateValue(row.forecast),
          TnaMasterWorkbookWriter.dateValue(row.actual),
          this.text(row.statusLabel),this.text(row.buyerAction),
          this.text(row.explanation),this.text(row.targetVerification)
        ])
      ],[12,49,20,20,20,20,45,60,52,48],true);
      for(let row=2;row<=buyer.rows.length+1;row++){
        for(const column of ['C','D','E','F']){
          const cell=milestones[column+row];
          if(cell?.t==='n')cell.z='yyyy-mm-dd';
        }
      }
      return XLSX.write(book,{type:'buffer',bookType:'xlsx'});
    }

  }

  /**
   * R05 local merchandiser workbook owner, append-only to the existing TNA
   * report sheets. Access via exportReportWorkbook when weeklyTna exists.
   * Reads the pure weekly projection (not a plan or browser storage), writes
   * typed Excel civil dates and numeric delay, protects every text cell from
   * formula execution, and never claims agreement or external approval.
   */
  class TnaWeeklyWorkbookWriter {
    /** Append one full, source-derived record per section; duplicates are labeled. */
    static append(XLSX,book,model){
      const weekly=model.weeklyTna;
      if(model.reportId!=='R05'||weekly?.schema!=='VESA-TNA-WEEKLY-1')return;
      const l=weekly.labels;
      const keys=['completedThisWeek','completedPreviousWeek','missed','dueThisWeek',
        'dueNextWeek','approvalPending','recordedRecovery','needsInformation'];
      const columns=[
        l.columns[0],l.columns[1],'Stage',l.columns[2],l.columns[3],
        l.columns[4],l.columns[5],l.columns[6],l.columns[7],l.columns[8],
        l.columns[9],l.columns[10],l.columns[11],l.columns[12],'Data gap'
      ];
      const rows=[columns];
      if(weekly.validity!=='valid')rows.push([l.unknown,l.invalidClock]);
      else for(const key of keys)for(const task of weekly.groups[key]){
        rows.push([
          safeCell(l.sections[key]),safeCell(task.ref),safeCell(task.stage),
          safeCell(task.activity),safeCell(task.owner),
          TnaMasterWorkbookWriter.dateValue(task.original),
          TnaMasterWorkbookWriter.dateValue(task.target),
          TnaMasterWorkbookWriter.dateValue(task.forecast),
          TnaMasterWorkbookWriter.dateValue(task.actual),
          safeCell(task.status),task.lateDays===null?l.unknown:task.lateDays,
          safeCell(l.dueSource[task.dateSource]||l.unknown),
          safeCell(task.recoveryProposal||l.none),
          safeCell(task.recoveryAgreement||l.agreed),
          safeCell(task.issue||l.none)
        ]);
      }
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[25,12,25,48,25,19,19,19,19,22,21,25,48,32,50].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      for(let row=2;row<=rows.length;row++)for(const letter of ['F','G','H','I']){
        const cell=sheet[letter+row];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(book,sheet,'Weekly Actions');
    }
  }


  /**
   * R06 internal Delay & Recovery worksheet owner. No record edits or sending.
   * Uses the validated source-only report model; date cells remain typed,
   * formula-like user text is escaped, unsupported differences remain unknown.
   */
  class TnaDelayRecoveryWorkbookWriter {
    static append(XLSX,workbook,model){
      const delay=model.delayRecovery;
      if(model.reportId!=='R06'||delay?.schema!=='VESA-TNA-DELAY-1')return;
      const l=delay.labels,columns=l.columns;
      const rows=[columns];
      if(delay.validity!=='valid')rows.push([l.unknown,l.invalidClock]);
      else for(const row of delay.rows){
        rows.push([safeCell(row.ref),safeCell(row.activity),safeCell(row.assignedOwner),
          TnaMasterWorkbookWriter.dateValue(row.original),
          TnaMasterWorkbookWriter.dateValue(row.target),
          TnaMasterWorkbookWriter.dateValue(row.forecast),
          TnaMasterWorkbookWriter.dateValue(row.actual),
          row.varianceDays===null?l.unknown:row.varianceDays,
          safeCell(row.comparedTo||l.none),safeCell(row.status),
          safeCell(row.enteredCause||l.unknown),safeCell(l.unknown),
          safeCell(row.possibleDownstreamRefs.join(', ')||l.unknown),
          safeCell(row.recoveryProposal||l.unknown)]);
      }
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[14,52,28,20,20,20,20,19,24,22,44,27,36,44].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      for(let n=2;n<=rows.length;n++)for(const letter of ['D','E','F','G']){
        const cell=sheet[letter+n];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,sheet,'Delay & Recovery');
      const scenarioRows=[l.scenarioColumns];
      if(delay.validity==='valid')for(const item of delay.scenarios){
        scenarioRows.push([safeCell(item.name),safeCell(item.localState),
          TnaMasterWorkbookWriter.dateValue(item.baseForecast),
          TnaMasterWorkbookWriter.dateValue(item.optionForecast),
          item.workingDaysGained===null?l.unknown:item.workingDaysGained,
          safeCell(item.agreementLabel)]);
      }
      if(scenarioRows.length===1)scenarioRows.push([l.noScenarios]);
      const scenarioSheet=XLSX.utils.aoa_to_sheet(scenarioRows);
      scenarioSheet['!cols']=[38,52,21,21,27,40].map(wch=>({wch}));
      for(let n=2;n<=scenarioRows.length;n++)for(const letter of ['C','D']){
        const cell=scenarioSheet[letter+n];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,scenarioSheet,'Recovery Options');
    }
  }


  /**
   * R07 source-only typed production worksheets.
   * The limited buyer projection never produces the internal Operations sheet.
   * Rates and stage-end forecasts stay unknown without an approved source.
   */
  class TnaProductionWorkbookWriter {
    static append(XLSX,workbook,model){
      const production=model.productionStatus;
      if(model.reportId!=='R07'||production?.schema!=='VESA-TNA-PRODUCTION-1')return;
      const l=production.labels,cols=l.columns;
      const rows=[cols];
      if(production.validity!=='valid')rows.push([l.unknown,l.restrictedNotice]);
      else for(const stage of production.stageRows)rows.push([
        safeCell(stage.label),TnaMasterWorkbookWriter.dateValue(stage.startActual),
        TnaMasterWorkbookWriter.dateValue(stage.finishActual),
        TnaMasterWorkbookWriter.dateValue(stage.currentTarget),
        TnaMasterWorkbookWriter.dateValue(stage.forecastFinish),
        stage.completed===null?l.unknown:stage.completed,
        stage.input===null||stage.input===undefined?l.unknown:stage.input,
        stage.wip===null||stage.wip===undefined?l.unknown:stage.wip,
        stage.rejected===null||stage.rejected===undefined?l.unknown:stage.rejected,
        stage.reworked===null||stage.reworked===undefined?l.unknown:stage.reworked,
        stage.remainingWithinInput===null||stage.remainingWithinInput===undefined?l.unknown:stage.remainingWithinInput,
        safeCell(stage.unit||l.unitUnknown),safeCell(stage.quantityState||l.unknown),
        l.rateMissing,l.rateMissing
      ]);
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[21,18,18,18,18,23,17,17,15,15,23,17,48,29,29].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      for(let r=2;r<=rows.length;r++)for(const letter of ['B','C','D','E']){
        const cell=sheet[letter+r];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,sheet,'Production Stages');
      if(production.audience!=='internal-production-review')return;
      const operationRows=[l.operationColumns];
      for(const operation of production.operationRows){
        operationRows.push([safeCell(l.stages[operation.code]),safeCell(operation.operationId),
          safeCell(operation.lotId||l.unknown),
          ...['input','completed','rejected','reworked','wip','remaining'].map(key=>
            operation[key]===null?l.unknown:operation[key]),
          safeCell(operation.unit),safeCell(operation.sourceStatus)]);
      }
      if(operationRows.length===1)operationRows.push([l.noSource]);
      const details=XLSX.utils.aoa_to_sheet(operationRows);
      details['!cols']=[20,28,23,15,15,15,15,15,15,18,48].map(wch=>({wch}));
      if(details['!ref'])details['!autofilter']={ref:details['!ref']};
      XLSX.utils.book_append_sheet(workbook,details,'Recorded Operations');
    }
  }


  /**
   * R08 local sourcing workbook: separate genuine master/B2B LC dates, no
   * supplier prices, and no QC/release assertion based only on date entries.
   * Typed dates/counts use the existing XLSX adapter; all text is formula-safe.
   */
  class TnaMaterialLcWorkbookWriter {
    static append(XLSX,workbook,model){
      const m=model.materialLc;
      if(model.reportId!=='R08'||m?.schema!=='VESA-TNA-MATERIAL-LC-1')return;
      const l=m.labels;
      const rows=[l.columns];
      if(m.validity!=='valid')rows.push([l.unknown,l.rejected]);
      else if(!m.materials.length)rows.push([l.noMaterials]);
      else for(const item of m.materials)rows.push([
        safeCell(item.categoryLabel),safeCell(item.materialId),
        safeCell(item.supplier),safeCell(item.country),
        item.requiredQty===null?l.unknown:item.requiredQty,safeCell(item.unit),
        TnaMasterWorkbookWriter.dateValue(item.bookingDate),
        TnaMasterWorkbookWriter.dateValue(item.b2bApplicationDate),
        TnaMasterWorkbookWriter.dateValue(item.b2bOpenDate),
        TnaMasterWorkbookWriter.dateValue(item.inHouseDate),
        TnaMasterWorkbookWriter.dateValue(item.qcDate),
        item.shortageQty===null?l.unknown:item.shortageQty,
        safeCell(item.availabilityStatus)
      ]);
      const sheet=XLSX.utils.aoa_to_sheet(rows);
      sheet['!cols']=[21,24,34,18,18,14,19,19,19,19,20,18,44].map(wch=>({wch}));
      if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
      for(let r=2;r<=rows.length;r++)for(const letter of ['G','H','I','J','K']){
        const cell=sheet[letter+r];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,sheet,'Material & LC');
      const lc=[l.lcColumns];
      if(m.validity==='valid'){
        lc.push([safeCell(l.master),l.unknown,l.unknown,
          TnaMasterWorkbookWriter.dateValue(m.masterLc.enteredOpenedOn),safeCell(m.masterLc.status)]);
        for(const item of m.materials)lc.push([
          safeCell(l.opened),safeCell(item.materialId),
          TnaMasterWorkbookWriter.dateValue(item.b2bApplicationDate),
          TnaMasterWorkbookWriter.dateValue(item.b2bOpenDate),
          safeCell(item.b2bState)
        ]);
      }else lc.push([l.rejected]);
      const lcs=XLSX.utils.aoa_to_sheet(lc);
      lcs['!cols']=[29,28,21,21,48].map(wch=>({wch}));
      if(lcs['!ref'])lcs['!autofilter']={ref:lcs['!ref']};
      for(let r=2;r<=lc.length;r++)for(const letter of ['C','D']){
        const cell=lcs[letter+r];if(cell?.t==='n')cell.z='yyyy-mm-dd';
      }
      XLSX.utils.book_append_sheet(workbook,lcs,'LC Milestones');
    }
  }


  /**
   * R09 local Shipping Worksheets owner. Only consumes shipmentReadiness
   * source projection: no lot release, inspection decision, PPM/AQL write,
   * formula execution or external distribution. All dates are typed civil
   * Excel serials and all entered text is rendered as inert strings.
   */
  class TnaShipmentWorkbookWriter {
    static append(XLSX,workbook,model){
      const ship=model.shipmentReadiness;
      if(model.reportId!=='R09'||ship?.schema!=='VESA-TNA-SHIPMENT-1')return;
      const l=ship.labels,number=v=>v===null||v===undefined?l.unknown:v;
      const dated=v=>TnaMasterWorkbookWriter.dateValue(v);
      const add=(name,rows,widths,dateColumns=[])=>{
        const sheet=XLSX.utils.aoa_to_sheet(rows);
        sheet['!cols']=widths.map(wch=>({wch}));
        if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
        for(let r=2;r<=rows.length;r++)for(const letter of dateColumns){
          const cell=sheet[letter+r];if(cell?.t==='n')cell.z='yyyy-mm-dd';
        }
        XLSX.utils.book_append_sheet(workbook,sheet,name);
      };
      const lotRows=[l.lotHeaders];
      const dateRows=[l.dateHeaders];
      if(ship.validity==='restricted'){
        lotRows.push([l.restricted]);dateRows.push([l.restricted]);
      }else if(!ship.lots.length){
        lotRows.push([l.noLots]);dateRows.push([l.noLots]);
      }else for(const lot of ship.lots){
        lotRows.push([safeCell(lot.lotReference),safeCell(lot.localStatus),
          safeCell(lot.poAllocation||l.unknown),number(lot.plannedQty),
          number(lot.packedQty),number(lot.passedQty),number(lot.shippedQty),
          number(lot.remainingWithinLot),safeCell(lot.unit),
          safeCell(lot.bookingRef||l.unknown),safeCell(lot.inspectionRef||l.unknown),
          safeCell(lot.quantityState)]);
        dateRows.push([safeCell(lot.lotReference),dated(lot.requestedExFactory),
          dated(lot.currentExFactory),dated(lot.forecastExFactory),
          dated(lot.enteredActualExFactory),dated(lot.ETD),dated(lot.ETA),
          safeCell(lot.dateWarning)]);
      }
      add('Shipment Lots',lotRows,[27,22,31,17,17,17,18,18,12,32,32,49]);
      add('Shipment Dates',dateRows,[27,22,22,22,22,23,23,45],['B','C','D','E','F','G']);
      const milestoneRows=[l.gateHeaders];
      if(ship.validity==='restricted')milestoneRows.push([l.restricted]);
      else for(const gate of ship.gates)milestoneRows.push([
        safeCell(gate.ref),safeCell(gate.status),dated(gate.currentTarget),
        dated(gate.forecast),dated(gate.actualAsOf),safeCell(gate.evidenceState)]);
      add('Shipment Gates',milestoneRows,[23,25,22,22,22,54],['C','D','E']);
      const poRows=[l.allocationHeaders];
      if(ship.validity==='restricted')poRows.push([l.restricted]);
      else if(!ship.poAllocations.length)poRows.push([l.noLots]);
      else for(const alloc of ship.poAllocations)poRows.push([
        safeCell(alloc.lotRef),safeCell(alloc.po),
        number(alloc.quantity),safeCell(alloc.locallyReconciled?l.sourceQty:l.conflict)]);
      add('Shipment PO Allocation',poRows,[26,32,22,55]);
    }
  }


  /**
   * R10 portfolio XLSX writer accepts only an already-filtered internal
   * summary; no local storage reads, cross-profile joins or order mutations.
   * Dates and per-PO quantity remain typed only when independently recorded.
   * Dangerous spreadsheet-formula text is always escaped.
   */
  class TnaPortfolioWorkbookWriter {
    static append(XLSX,workbook,model){
      const portfolio=model.portfolio;
      if(model.reportId!=='R10'||portfolio?.schema!=='VESA-TNA-PORTFOLIO-1')return;
      const l=portfolio.labels,date=v=>TnaMasterWorkbookWriter.dateValue(v);
      const val=v=>v===null||v===undefined?l.unknown:v;
      const rows=[l.headers];
      const poRows=[l.poHeaders],actionRows=[l.actionHeaders];
      if(portfolio.validity!=='valid'){
        rows.push([safeCell(portfolio.validity==='restricted'?l.restricted:l.noAnchor)]);
        poRows.push([l.unknown]);actionRows.push([l.unknown]);
      }else{
        for(const order of portfolio.orders)rows.push([
          safeCell(order.buyer),safeCell(order.factory),safeCell(order.style),
          safeCell(order.pos.join(', ')||l.unknown),val(order.orderQty),
          safeCell(order.unit),val(order.revision),date(order.originalRequired),
          date(order.currentRequired),date(order.cpmForecast),
          date(order.recordedS04Actual),
          safeCell(order.cpmState),safeCell(order.nextAction?.activity||l.needAction),
          safeCell(order.risk)]);
        for(const po of portfolio.poRows)poRows.push([
          safeCell(po.buyer),safeCell(po.factory),safeCell(po.style),
          safeCell(po.po),val(po.allocatedQty),safeCell(po.unit),
          safeCell(po.sourceState)]);
        for(const action of portfolio.actions)actionRows.push([
          safeCell(action.po),safeCell(action.ref),safeCell(action.activity),
          safeCell(action.owner),date(action.due),safeCell(action.type),
          safeCell(action.status)]);
        if(rows.length===1)rows.push([l.empty]);
        if(poRows.length===1)poRows.push([l.empty]);
        if(actionRows.length===1)actionRows.push([l.needAction]);
      }
      const append=(name,data,widths,dateCols)=>{
        const sheet=XLSX.utils.aoa_to_sheet(data);
        sheet['!cols']=widths.map(wch=>({wch}));
        if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
        for(let i=2;i<=data.length;i++)for(const letter of dateCols){
          const cell=sheet[letter+i];if(cell?.t==='n')cell.z='yyyy-mm-dd';
        }
        XLSX.utils.book_append_sheet(workbook,sheet,name);
      };
      append('Portfolio Orders',rows,[30,29,25,34,22,13,14,22,22,23,23,19,45,45],['H','I','J','K']);
      append('Portfolio PO',poRows,[30,29,25,34,22,13,62],[]);
      append('Portfolio Actions',actionRows,[32,16,51,27,21,50,26],['E']);
    }
  }


  /**
   * R11 owns three typed, inert XLSX worksheets from the already-disclosed
   * approval projection. No formula execution, buyer sharing authorization,
   * source mutations or LC/PPM/AQL decision reclassification.
   */
  class TnaApprovalHistoryWorkbookWriter {
    static append(XLSX,workbook,model){
      const approval=model.approvalHistory;
      if(model.reportId!=='R11'||approval?.schema!=='VESA-TNA-APPROVAL-HISTORY-1')return;
      const l=approval.labels,date=v=>TnaMasterWorkbookWriter.dateValue(v);
      const safe=v=>safeCell(v===null||v===undefined||v===''?l.unknown:v);
      const records=[l.headings],rounds=[l.roundHeadings],events=[l.eventHeadings];
      if(approval.validity==='restricted'){
        records.push([l.external]);rounds.push([l.external]);events.push([l.external]);
      }else if(approval.validity==='valid'){
        for(const r of approval.records)records.push([
          safe(r.item),r.itemRevision===null?l.unknown:typeof r.itemRevision==='number'?
            r.itemRevision:safe(r.itemRevision),
          safe(r.requiredParty),date(r.submittedDate),date(r.receivedDate),
          date(r.decisionDate),safe(r.recordedResponse),safe(r.asOfStatus),
          safe(r.decidedBy),safe(r.reviewer),safe(r.evidenceRef),
          safe(r.waiverReason),safe(l.noAuthority),safe(r.linkedTasks.join(', ')||l.missingTasks)]);
        for(const r of approval.rounds)rounds.push([
          safe(r.item),r.sourceEntry,date(r.submittedDate),
          date(r.receivedDate),date(r.decisionDate),safe(r.recordedResponse),
          safe(r.decidedBy),safe(r.evidenceRef),safe(r.asOfStatus),safe(r.comments)]);
        for(const r of approval.revisions)events.push([
          safe(r.eventType),r.planRevision===null?l.unknown:r.planRevision,
          safe(r.timestamp),safe(r.actor),safe(r.relatedApproval),
          safe(r.reason),safe(l.notDecision)]);
        if(records.length===1)records.push([l.empty]);
        if(rounds.length===1)rounds.push([l.noRounds]);
        if(events.length===1)events.push([l.noEvents]);
      }else{
        records.push([l.invalid]);rounds.push([l.invalid]);events.push([l.invalid]);
      }
      const append=(name,data,widths,dateCols)=>{
        const sheet=XLSX.utils.aoa_to_sheet(data);
        sheet['!cols']=widths.map(wch=>({wch}));
        if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
        for(let i=2;i<=data.length;i++)for(const letter of dateCols){
          const cell=sheet[letter+i];if(cell?.t==='n')cell.z='yyyy-mm-dd';
        }
        XLSX.utils.book_append_sheet(workbook,sheet,name);
      };
      append('Approval Records',records,[32,19,32,18,18,18,21,65,30,30,40,47,54,32],['D','E','F']);
      append('Approval Rounds',rounds,[32,18,18,18,18,22,30,36,55,50],['C','D','E']);
      append('Approval Revisions',events,[34,18,27,30,34,60,57],[]);
    }
  }


  /**
   * R12 typed side-by-side Excel only from the already-projected local model.
   * Zero is distinct from unknown. Historic saved claims never become numeric
   * recalculated gains. User strings are Excel-formula-inert.
   */
  class TnaScenarioComparisonWorkbookWriter {
    static append(XLSX,workbook,model){
      const r=model.scenarioComparison;
      if(model.reportId!=='R12'||r?.schema!=='VESA-TNA-SCENARIO-COMPARISON-1')return;
      const l=r.labels,unknown=l.unknown;
      const date=v=>TnaMasterWorkbookWriter.dateValue(v);
      const value=v=>v===null||v===undefined||v===''?unknown:
        typeof v==='number'?v:safeCell(Array.isArray(v)?v.join(', '):v);
      const row=(name,base,a,b)=>[safeCell(name),value(base),value(a),value(b)];
      const a=r.options.find(x=>x.slot==='A'),b=r.options.find(x=>x.slot==='B');
      const col=(obj,attr)=>obj?.[attr]??null;
      const rows=[l.headers];
      if(r.validity==='restricted')rows.push([l.restricted]);
      else if(r.validity!=='valid')rows.push([l.noClock]);
      else{
        rows.push(row(l.select,l.base,a?.name||l.noSelection,b?.name||l.noSelection));
        rows.push(row(l.source,l.base,a?.statusLabel,b?.statusLabel));
        rows.push(row(l.original,date(r.originalRequired),null,null));
        rows.push(row(l.dateLabel,date(r.currentRequired),null,null));
        rows.push(row(l.forecast,date(r.base.forecastDate),
          date(a?.optionForecast),date(b?.optionForecast)));
        rows.push(row(l.sourceForecast+' — base',unknown,
          date(a?.recordedBaseForecast),date(b?.recordedBaseForecast)));
        rows.push(row(l.sourceForecast+' — option',unknown,
          date(a?.recordedOptionForecast),date(b?.recordedOptionForecast)));
        rows.push(row(l.gains,null,col(a,'workdaysGained'),col(b,'workdaysGained')));
        rows.push(row(l.critical,r.base.criticalRefs,a?.criticalRefs,b?.criticalRefs));
        rows.push(row(l.changed,null,a?.changedCriticalRefs,b?.changedCriticalRefs));
        rows.push(row(l.inputs,unknown,a?.inputs?.length||null,b?.inputs?.length||null));
        rows.push(row(l.revised,model.revision,col(a,'appliedRevision'),col(b,'appliedRevision')));
        rows.push(row(l.created,unknown,col(a,'localAppliedBy'),col(b,'localAppliedBy')));
        rows.push(row(l.reason,unknown,col(a,'localApplyReason'),col(b,'localApplyReason')));
        rows.push(row(l.limitations,l.unverified,l.unverified,l.unverified));
        rows.push(row(l.cost,l.noCost,l.noCost,l.noCost));
      }
      const inputs=[l.changes];
      for(const item of r.changes)inputs.push([
        safeCell(item.slot),safeCell(item.kind+': '+item.ref),
        value(item.before),value(item.after),safeCell(item.proof)]);
      if(inputs.length===1)inputs.push([r.validity==='restricted'?l.restricted:l.noScenario]);
      const gaps=[l.warnings];
      for(const option of r.options)if(option.status!=='calculated-local')
        gaps.push([safeCell(option.slot),safeCell(option.reason),safeCell(l.notCompared)]);
      for(const warning of r.warnings)gaps.push([l.base,safeCell(warning),safeCell(l.unverified)]);
      if(gaps.length===1)gaps.push([l.noScenario]);
      const add=(name,data,widths,dateCells=[])=>{
        const sheet=XLSX.utils.aoa_to_sheet(data);
        sheet['!cols']=widths.map(wch=>({wch}));
        if(sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};
        for(const address of dateCells){
          const cell=sheet[address];if(cell?.t==='n')cell.z='yyyy-mm-dd';
        }
        XLSX.utils.book_append_sheet(workbook,sheet,name);
      };
      add('Scenario Comparison',rows,[56,43,43,43],['B4','B5','B6','C6','D6','C7','D7','C8','D8']);
      add('Scenario Inputs',inputs,[20,48,30,30,60]);
      add('Scenario Warnings',gaps,[18,100,50]);
    }
  }

  function exportReportWorkbook(model){const XLSX=xlsxLib();if(!XLSX)throw new Error('Excel workbook parser is not bundled.');if(!model||model.schema!=='VESA-TNA-REPORT-1')throw new Error('Unsupported TNA report model.');if(model.reportId==='R02')return TnaBuyerWorkbookWriter.export(XLSX,model);const workbook=XLSX.utils.book_new();const addSheet=(name,rows,widths,filter=false)=>{const sheet=XLSX.utils.aoa_to_sheet(rows);sheet['!cols']=widths.map(wch=>({wch}));if(filter&&sheet['!ref'])sheet['!autofilter']={ref:sheet['!ref']};XLSX.utils.book_append_sheet(workbook,sheet,name);};const meta=[['Brand',safeCell(model.brand)],['Report ID',safeCell(model.reportId)],['Title',safeCell(model.title)],['Audience',safeCell(model.audience)],['Language',safeCell(model.language)],['Generated',safeCell(model.generatedAt)],['Timezone',safeCell(model.timezone)],['Revision',model.revision],['No fabrication note',safeCell(model.labels?.noFabrication)]];if(model.reportId==='R12'&&model.scenarioComparison){const c=model.scenarioComparison;meta.push(['Scenario as-of',safeCell(c.asOfDate||c.labels.unknown)],['Base CPM state',safeCell(c.base.validity)],['Recovery agreements verified','NO'],['Selected options',c.options.length],['Scenario caveat',safeCell(c.labels.notice)]);}if(model.reportId==='R11'&&model.approvalHistory){const a=model.approvalHistory;meta.push(['Approval as-of',safeCell(a.asOfDate||a.labels.unknown)],['Recorded approval count',a.counts.approvalRecords],['Independently verified approvals',0],['Approval disclosure',safeCell(a.warnings[0]||a.labels.unknown)]);}if(model.reportId==='R10'&&model.portfolio){const p=model.portfolio;meta.push(['Portfolio as-of date',safeCell(p.asOfDate||p.labels.unknown)],['Local portfolio scope',safeCell(p.scope||p.audience)],['Visible saved TNA records',p.counts?.visibleOrders??0],['Privacy note',safeCell(p.labels.notice)]);}if(model.reportId==='R09'&&model.shipmentReadiness){const s=model.shipmentReadiness;meta.push(['Shipment as-of date',safeCell(s.asOfDate||s.labels.unknown)],['Shipment audience',safeCell(s.audience)],['Release authorized','NO — independent verification required'],['Shipment source caution',safeCell(s.labels.basis)]);}if(model.reportId==='R08'&&model.materialLc){const m=model.materialLc;meta.push(['Material LC as-of',safeCell(m.asOfDate||m.labels.unknown)],['Commercial disclosure',safeCell(m.audience)],['LC source note',safeCell(m.labels.sourceWarning)]);}if(model.reportId==='R07'&&model.productionStatus){const p=model.productionStatus;meta.push(['Production as-of',safeCell(p.asOfDate||p.labels.unknown)],['Production source scope',safeCell(p.audience)],['Production disclosure',safeCell(p.warnings[0]||p.labels.unknown)]);}if(model.reportId==='R06'&&model.delayRecovery){const d=model.delayRecovery;meta.push(['Delay as-of date',safeCell(d.asOfDate||d.labels.unknown)],['Delay computation',safeCell(d.validity)],['Disclosure',safeCell(d.labels.disclosure)]);}if(model.reportId==='R05'&&model.weeklyTna){const w=model.weeklyTna;meta.push(['Weekly as-of date',safeCell(w.asOfDate||w.labels.unknown)],['Week basis',safeCell(w.labels.basis)],['Reporting scope',safeCell(w.labels.localAudience)],['Week range',safeCell(w.week?w.week.start+' to '+w.week.end:w.labels.unknown)]);}if(model.reportId==='R04'&&model.criticalPath){meta.push(['CPM state',safeCell(model.criticalPath.validity)],['Calendar provenance','Locally entered; independently unverified']);}if(model.reportId==='R03'&&model.factoryDailyAction){meta.push(['Action as-of date',safeCell(model.factoryDailyAction.asOfDate||'Needs Information')],['Due-date basis','7 calendar days; current target then recorded baseline']);}addSheet('Report Summary',meta,[24,96]);const orderRows=[['Buyer','Factory','Style','PO','Quantity','Unit','Required Ex-Factory'],[model.order.buyer,model.order.factory,model.order.style,model.order.po,model.order.quantity,model.order.unit,model.order.requiredExFactory].map(safeCell)];addSheet('Order Summary',orderRows,[28,28,24,20,14,10,22],true);const taskRows=[['Ref','Activity','Owner','Status','Baseline','Current','Forecast','Actual','Risk'],...(model.tasks||[]).map(task=>[task.ref,task.title,task.owner,task.status,task.baseline,task.current,task.forecast,task.actual,task.risk].map(safeCell))];addSheet('Report Activities',taskRows,[10,48,22,18,14,14,14,14,20],true);const warningRows=[['Warnings / Data gaps'],...((model.warnings&&model.warnings.length?model.warnings:['No validation warnings in this local draft.']).map(item=>[safeCell(item)])),[],['Fallback notes'],...(model.notes||[]).map(item=>[safeCell(item)])];addSheet('Report Notes',warningRows,[110]);TnaMasterWorkbookWriter.append(XLSX,workbook,model);TnaFactoryDailyWorkbookWriter.append(XLSX,workbook,model);TnaCriticalPathWorkbookWriter.append(XLSX,workbook,model);TnaWeeklyWorkbookWriter.append(XLSX,workbook,model);TnaDelayRecoveryWorkbookWriter.append(XLSX,workbook,model);TnaProductionWorkbookWriter.append(XLSX,workbook,model);TnaMaterialLcWorkbookWriter.append(XLSX,workbook,model);TnaShipmentWorkbookWriter.append(XLSX,workbook,model);TnaPortfolioWorkbookWriter.append(XLSX,workbook,model);TnaApprovalHistoryWorkbookWriter.append(XLSX,workbook,model);TnaScenarioComparisonWorkbookWriter.append(XLSX,workbook,model);return XLSX.write(workbook,{type:'buffer',bookType:'xlsx'});}
  const api={STORAGE_VERSION,FORMAT,MAX_BYTES,QUEUE_VERSION,QUEUE_MAX_ITEMS,QUEUE_MAX_BYTES,checksum,migratePlan,savePlan,listPlans,loadPlan,portfolioSnapshot,autosave,recoverAutosave,queueOfflineIntent,listOfflineIntents,updateOfflineIntent,reconcileOfflineIntent,exportCopy,importCopy,createHistory,pushHistory,undo,redo,importPreview,importWorkbookPreview,exportCsv,exportWorkbook,exportReportWorkbook,safeCell};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
