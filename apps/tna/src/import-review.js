/**
 * VESA TNA G08 staged, local-only spreadsheet import.
 * This module owns source parsing, human column review, task/dependency
 * reconciliation and explicit creation of a NEW draft. It NEVER imports a
 * baseline, authenticates an approval, merges by PO/style or writes implicitly.
 * Domain owns plan validation; storage owns persistence and portable copies.
 */
(function(root){
  'use strict';
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);
  const storage=root.VesaTnaStorage||(typeof require==='function'?require('./storage.js'):null);
  const MAX_BYTES=2*1024*1024,MAX_SHEETS=12,MAX_ROWS=250,MAX_COLUMNS=32;
  const ORDER_KEYS=['buyerName','factoryName','styleNo','poNumber','totalQty',
    'buyerRequiredExFactory','orderConfirmedOn','unit'];
  const TASK_KEYS=['taskRef','activity','stage','owner','baselineFinish',
    'currentTargetFinish','actualFinish','durationUnits','durationBasis',
    'status','predecessor','notes'];
  const ALIASES=Object.freeze({
    buyerName:['buyer','buyername','customer'],factoryName:['factory','factoryname','manufacturer'],
    styleNo:['style','styleno','stylenumber','stylecode'],
    poNumber:['po','ponumber','poref','poreference','purchaseorder','orderreference'],
    totalQty:['quantity','totalquantity','totalqty','orderqty','qty','totalpieces'],
    buyerRequiredExFactory:['buyerrequiredexfactory','requiredexfactory','exfactory',
      'exfactorydate','buyerdeliverydate','requireddate'],
    orderConfirmedOn:['orderconfirmed','orderconfirmedon','orderdate','orderconfirmationdate'],
    unit:['unit','uom'],
    taskRef:['ref','taskref','taskcode','activityref','activitycode'],
    activity:['activity','activityname','task','taskname','action','activitydescription'],
    stage:['stage','stagecode','section'],owner:['owner','responsible','responsibility','department'],
    baselineFinish:['baseline','baselinefinish','originaldue','originalfinish'],
    currentTargetFinish:['current','currentfinish','currenttargetfinish','target',
      'targetfinish','duedate','plannedfinish','planneddate'],
    actualFinish:['actual','actualfinish','actualdate','completeddate'],
    durationUnits:['duration','durationunits','days','leaddays'],
    durationBasis:['durationbasis','daybasis','workingcalendarbasis'],
    status:['status','taskstatus'],predecessor:['predecessor','predecessors','depends',
      'dependency','dependsupon','precedingactivity'],
    notes:['notes','remarks','comment','comments','factorynotes']
  });
  const COPY={
    en:{blankTemplate:'Download blank full-task Excel template',currentTemplate:'Download current TNA as Excel',templateType:'Garment type for blank template',templateNotice:'Fill and review the Excel file. Approved or completed statuses are not copied.',intro:'Choose a file, review the sheets, match columns and activities, then confirm a NEW saved TNA. Your open order and other saved copies will not be replaced.',
      sheet:'Order details sheet',tasksheet:'Activity sheet',none:'No activity sheet — order details only',
      row:'Header row',format:'Source date format',template:'Garment template',
      unit:'Order quantity unit',basis:'Activity day basis',
      dep:'Dependency handling',relation:'Source dependency relation',
      templateDep:'Use template links (not from workbook)',sourceDep:'Use reviewed predecessor column',
      noDep:'No task links; review later',
      map:'Map workbook columns',order:'Order details',tasks:'Activity details',
      review:'Review mapping',create:'Create New Draft',accept:'I checked the mapping, dates, quantities and activities. Create a separate local draft without changing saved orders.',
      ignored:'Extra columns not imported',unmatched:'Match unmatched activities',
      skip:'Ignore this source row (reviewed)',custom:'Add a custom activity',
      reviewNeeded:'Select task match or explicitly ignore this row',
      conflicts:'Similar saved PO/style exists. Creating a new draft will not overwrite it.',
      empty:'No recognized rows. Check sheet and header selections.',
      unsafe:'Formula, unsafe link or script content is blocked; use a clean file.',
      fail:'Review the highlighted issues before creating a new draft.',
      ready:'Ready to create a NEW draft; no import has been saved yet.',
      applied:'New TNA draft saved locally. Existing saved orders were not changed.',
      note:'Imported dates and statuses are local source entries, not independently confirmed buyer approval or a frozen baseline.',
      from:'Source',mapped:'Mapped',unmapped:'Do not import',
      summary:'Review summary',headers:'Detected columns',rows:'Source rows',issues:'Issues',
      warnings:'Review notes',matched:'Matched activities',unmatchedCount:'Unmatched activities',
      existing:'Existing saved orders',loaded:'File reviewed in memory only',
      errors:'Please check the selected file and try again.'},
    bn:{blankTemplate:'সব কাজসহ খালি TNA Excel ডাউনলোড',currentTemplate:'বর্তমান TNA Excel-এ নিন',templateType:'খালি ফর্মের পোশাকের ধরন',templateNotice:'Excel পূরণ করে যাচাই করুন। Approved/Completed অবস্থা কপি হয় না।',intro:'ফাইল বেছে sheet ও column মিলিয়ে দেখুন। নিশ্চিত করার পর শুধু নতুন TNA draft তৈরি হবে; পুরোনো order বদলাবে না।',
      sheet:'অর্ডারের sheet',tasksheet:'কাজের sheet',none:'কাজের sheet নেই',row:'শিরোনামের সারি',
      format:'তারিখের ধরন',template:'পোশাকের ধরন',unit:'পরিমাণের একক',basis:'কাজের দিনের ধরন',
      dep:'কাজের সম্পর্ক',relation:'পূর্ববর্তী কাজের সম্পর্ক',templateDep:'Template-এর কাজের সংযোগ',
      sourceDep:'ফাইলের predecessor ব্যবহার',noDep:'সংযোগ পরে দেখব',
      map:'Column মিলিয়ে দেখুন',order:'অর্ডার',tasks:'কাজ',
      review:'মিলিয়ে দেখুন',create:'নতুন TNA Draft তৈরি করুন',
      accept:'আমি কলাম, তারিখ ও পরিমাণ দেখেছি। পুরোনো অর্ডার না বদলে নতুন draft তৈরি করুন।',
      ignored:'অতিরিক্ত column নেওয়া হয়নি',unmatched:'না মেলা কাজের সিদ্ধান্ত নিন',
      skip:'এই সারি বাদ দিন',custom:'নতুন custom কাজ যোগ',reviewNeeded:'কাজের মিল বেছে নিন',
      conflicts:'একই PO/Style আগে আছে; নতুন draft পুরোনোটি বদলাবে না।',
      empty:'সারি পাওয়া যায়নি',unsafe:'Formula/unsafe link বন্ধ; পরিষ্কার ফাইল ব্যবহার করুন।',
      fail:'নতুন draft-এর আগে সমস্যা ঠিক করুন।',ready:'নতুন draft-এর জন্য প্রস্তুত; এখনো save হয়নি।',
      applied:'নতুন draft এই browser-এ save হয়েছে; পুরোনো order বদলায়নি।',
      note:'Imported approval ও তারিখ স্থানীয় নথি; বাইরের অনুমোদন নয়।',
      from:'উৎস',mapped:'মিলানো',unmapped:'নেওয়া হবে না',summary:'পর্যালোচনা',
      headers:'Column',rows:'সারি',issues:'সমস্যা',warnings:'নোট',
      matched:'মেলা কাজ',unmatchedCount:'না মেলা কাজ',existing:'আগের order',
      loaded:'ফাইল শুধু preview',errors:'ফাইল আবার পরীক্ষা করুন।'},
    hi:{blankTemplate:'सभी कामों के साथ खाली TNA Excel',currentTemplate:'मौजूदा TNA Excel में लें',templateType:'खाली फॉर्म का गारमेंट प्रकार',templateNotice:'Excel भरकर जाँचें। Approved/Completed स्थिति कॉपी नहीं होती।',intro:'फाइल और शीट चुनकर कॉलम व कार्य जाँचें। पुष्टि के बाद केवल नया TNA draft बनेगा; पुराने ऑर्डर नहीं बदलेंगे।',
      sheet:'ऑर्डर शीट',tasksheet:'गतिविधि शीट',none:'गतिविधि शीट नहीं',row:'हेडर पंक्ति',
      format:'तारीख फॉर्मेट',template:'गारमेंट टेम्पलेट',unit:'मात्रा इकाई',
      basis:'काम के दिन',dep:'कार्य निर्भरता',relation:'निर्भरता प्रकार',
      templateDep:'टेम्पलेट लिंक उपयोग',sourceDep:'फाइल predecessor उपयोग',
      noDep:'कोई लिंक नहीं, बाद में देखें',map:'कॉलम मिलान',order:'ऑर्डर',tasks:'गतिविधियाँ',
      review:'मिलान जाँचें',create:'नया TNA Draft बनाएँ',
      accept:'मैंने कॉलम, तारीख और मात्रा जाँची है। पुराने ऑर्डर बदले बिना नया ड्राफ्ट बनाएँ।',
      ignored:'अतिरिक्त कॉलम नहीं लिए',unmatched:'अज्ञात गतिविधियों का मिलान',
      skip:'इस पंक्ति को छोड़ें',custom:'कस्टम काम जोड़ें',
      reviewNeeded:'गतिविधि का मिलान चुनें',conflicts:'इसी PO/Style का रिकॉर्ड है; नया draft अलग होगा।',
      empty:'कोई पहचानी पंक्ति नहीं',unsafe:'Formula/unsafe link बंद; साफ फाइल दें।',
      fail:'नया ड्राफ्ट बनाने से पहले समस्याएँ ठीक करें।',
      ready:'नया draft तैयार है; अभी सेव नहीं हुआ।',
      applied:'नया TNA draft ब्राउज़र में सेव हुआ; पुराने ऑर्डर नहीं बदले।',
      note:'स्थानीय तारीख/approval बाहरी सत्यापन नहीं।',from:'स्रोत',mapped:'मिलान',
      unmapped:'न लें',summary:'समीक्षा',headers:'कॉलम',rows:'पंक्ति',
      issues:'समस्याएँ',warnings:'ध्यान दें',matched:'मिले काम',
      unmatchedCount:'अनजाने काम',existing:'पुराने ऑर्डर',
      loaded:'सिर्फ preview',errors:'फाइल जाँचें।'},
    ta:{blankTemplate:'அனைத்து Tasks உடன் Blank Excel Template',currentTemplate:'தற்போதைய TNA-வை Excel-ஆக எடு',templateType:'Blank template Garment வகை',templateNotice:'Excel நிரப்பி review செய்யவும். Approved/Completed நிலை copy ஆகாது.',intro:'Excel file-இல் sheet, column, tasks-ஐ review செய்யுங்கள். Confirm செய்த பிறகு புதிய TNA Draft மட்டும் உருவாகும்; பழைய orders மாறாது.',
      sheet:'Order விவர sheet',tasksheet:'Activity sheet',none:'Activity sheet இல்லை — Order மட்டும்',
      row:'Header இருக்கும் வரிசை',format:'Source தேதி வடிவம்',template:'Garment template',
      unit:'Order quantity unit',basis:'Task நாள் கணக்கு',
      dep:'Task predecessor link',relation:'Dependency வகை',
      templateDep:'Template link-ஐ வைத்திரு (Excel source அல்ல)',
      sourceDep:'Excel-ல் உள்ள predecessor-ஐப் பயன்படுத்து',
      noDep:'Task link வேண்டாம்; பிறகு review',
      map:'Excel columns-ஐ match செய்யுங்கள்',order:'Order விவரங்கள்',tasks:'Activity விவரங்கள்',
      review:'Mapping சரிபார்',create:'புதிய TNA Draft உருவாக்கு',
      accept:'Columns, dates, quantity, tasks பார்த்துவிட்டேன். பழைய saved orders மாற்றாமல் தனியாக புதிய draft உருவாக்கவும்.',
      ignored:'Import செய்யாத கூடுதல் columns',unmatched:'பொருந்தாத activities-ஐ match செய்யுங்கள்',
      skip:'இந்த row வேண்டாம் (reviewed)',custom:'புதிய custom task சேர்க்கவும்',
      reviewNeeded:'Task-ஐ match அல்லது ignore செய்யுங்கள்',
      conflicts:'இதே PO/Style ஏற்கெனவே உள்ளது; புதிய draft பழையதை மாற்றாது.',
      empty:'சரியான rows இல்லை. Sheet/header தேர்வைப் பாருங்கள்.',
      unsafe:'Formula / unsafe link / script அனுமதி இல்லை. சுத்தமான file கொடுங்கள்.',
      fail:'புதிய draft உருவாக்க முன் பிழைகளைச் சரிசெய்யவும்.',
      ready:'புதிய draft உருவாக்கத் தயார். இன்னும் save செய்யவில்லை.',
      applied:'புதிய TNA Draft browser-இல் save ஆனது. பழைய orders மாற்றப்படவில்லை.',
      note:'Imported dates/status உள்ளூர் source பதிவுகள் மட்டுமே; Buyer approval அல்லது frozen baseline உறுதி அல்ல.',
      from:'Source',mapped:'Matched',unmapped:'Import வேண்டாம்',
      summary:'Review சுருக்கம்',headers:'Columns',rows:'Source rows',issues:'பிழைகள்',
      warnings:'Review குறிப்புகள்',matched:'பொருந்திய tasks',
      unmatchedCount:'பொருந்தாத tasks',existing:'Saved Orders',
      loaded:'File preview மட்டும்',errors:'File சரிபார்த்து மீண்டும் முயற்சி செய்யுங்கள்.'}
  };
  const normalized=value=>String(value??'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const clean=value=>String(value??'').trim();
  const bytes=value=>new TextEncoder().encode(String(value||'')).length;
  const isUnsafe=value=>typeof value==='string'&&
    (/^\s*[=+\-@]/.test(value)||/\bjavascript\s*:|\bdata\s*:\s*text\/html|<\s*script\b|onerror\s*=/i.test(value));
  const iso=value=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const d=new Date(value+'T00:00:00Z');
    return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?value:null;
  };
  const addUnique=(array,item)=>{if(item&&!array.includes(item))array.push(item);};
  const mapValue=(row,map,key)=>{
    const col=map?.[key];
    return Number.isInteger(col)&&col>=0&&col<row.length?row[col]:'';
  };
  const dataCell=(row,map,key)=>clean(mapValue(row,map,key));
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);

  /** File-bound, memory-only owner: no network, storage or active-plan access. */
  class TnaImportSourceReader {
    static strings(language){return COPY[language]||COPY.en;}
    static parseDelimited(text,fileName='pasted table'){
      if(typeof text!=='string'||bytes(text)>MAX_BYTES)throw Error('Source is empty or exceeds 2 MB.');
      const sample=text.replace(/^\uFEFF/,'');
      if(!sample.trim())throw Error('No worksheet rows were found.');
      const first=sample.split(/\r?\n/)[0];
      const sep=(first.match(/\t/g)||[]).length>(first.match(/,/g)||[]).length?'\t':',';
      const rows=[],row=[];let quoted=false,cell='';
      const pushCell=()=>{row.push(cell.trim());cell='';if(row.length>MAX_COLUMNS)throw Error('Too many columns (limit 32).');};
      const pushRow=()=>{pushCell();if(row.some(x=>x!=='')){rows.push(row.slice());if(rows.length>MAX_ROWS)throw Error('Too many rows (limit 250).');}row.length=0;};
      for(let i=0;i<sample.length;i++){
        const char=sample[i];
        if(char==='"'){
          if(quoted&&sample[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
        }else if(char===sep&&!quoted)pushCell();
        else if((char==='\n'||char==='\r')&&!quoted){
          if(char==='\r'&&sample[i+1]==='\n')i++;
          pushRow();
        }else cell+=char;
        if(cell.length>8192)throw Error('Source cell exceeds 8192 characters.');
      }
      if(quoted)throw Error('Unclosed quoted cell in source.');
      if(row.length||cell)pushRow();
      return this.stage([{name:'Pasted table',rows}],fileName,'text');
    }
    static fromWorkbook(input,fileName='source.xlsx'){
      const name=clean(fileName).toLowerCase();
      if(!name.endsWith('.xlsx')||name.endsWith('.xlsm'))
        throw Error('Choose a macro-free .xlsx workbook.');
      const byteLength=input instanceof ArrayBuffer?input.byteLength:input?.byteLength||input?.length||0;
      if(!byteLength||byteLength>MAX_BYTES)throw Error('Workbook is empty or exceeds 2 MB.');
      const XLSX=root.XLSX||(typeof require==='function'?require('../vendor/xlsx.full.min.js'):null);
      if(!XLSX)throw Error('Local Excel reader is unavailable.');
      let workbook;
      try{workbook=XLSX.read(input,{type:input instanceof ArrayBuffer?'array':'buffer',cellFormula:true,cellDates:false});}
      catch{throw Error('Excel file could not be read. Use a clean .xlsx workbook.');}
      if(workbook.vbaraw||!workbook.SheetNames?.length||
        workbook.SheetNames.length>MAX_SHEETS)throw Error('Workbook is unsupported or exceeds the 12-sheet limit.');
      const sheets=workbook.SheetNames.map(name=>{
        const sheet=workbook.Sheets[name];
        const range=sheet?.['!ref']?XLSX.utils.decode_range(sheet['!ref']):null;
        if(range&&(range.e.r>=MAX_ROWS||range.e.c>=MAX_COLUMNS||
          range.s.r<0||range.s.c<0))
          throw Error('Worksheet is too large: up to 250 rows and 32 columns.');
        if(range)for(let r=range.s.r;r<=range.e.r;r++)
          for(let c=range.s.c;c<=range.e.c;c++){
            const cell=sheet[XLSX.utils.encode_cell({r,c})];
            if(cell?.f||cell?.t==='e')throw Error('Formula or Excel error cell found: save a values-only workbook.');
            if(cell?.l?.Target&&isUnsafe(String(cell.l.Target)))
              throw Error('Unsafe worksheet link; choose a clean file.');
          }
        const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:true,defval:'',
          blankrows:true}).slice(0,MAX_ROWS);
        return {name,rows:rows.map(row=>row.slice(0,MAX_COLUMNS))};
      });
      return this.stage(sheets,fileName,'xlsx');
    }
    static stage(sheets,fileName,kind){
      if(!Array.isArray(sheets)||!sheets.length||sheets.length>MAX_SHEETS)
        throw Error('No supported worksheet was found.');
      for(const sheet of sheets){
        if(sheet.rows.length>MAX_ROWS||sheet.rows.some(row=>row.length>MAX_COLUMNS))
          throw Error('Source has more rows or columns than the safe limit.');
        for(const row of sheet.rows)for(const v of row){
          if(typeof v==='string'&&v.length>8192)throw Error('Source cell is too long.');
          if(isUnsafe(v))throw Error('Formula-looking or unsafe source value found. Review a clean copy.');
        }
      }
      return {schema:'VESA-TNA-IMPORT-STAGE-1',kind,fileName:clean(fileName).slice(0,200),
        sheets};
    }
    static headings(sheet,headerRow){
      const row=sheet?.rows?.[headerRow-1];
      return Array.isArray(row)?row.map(v=>clean(v).slice(0,120)):[];
    }
    static mapping(headings,keys){
      const names=headings.map(normalized);
      const map={};
      for(const key of keys){
        const aliases=ALIASES[key]||[];
        const found=names.findIndex(name=>aliases.includes(name));
        map[key]=found>=0?found:-1;
      }
      return map;
    }
    static locate(source,keys){
      let best={sheet:0,row:1,score:-1};
      for(const [index,sheet] of source.sheets.entries()){
        for(let row=1;row<=Math.min(10,sheet.rows.length);row++){
          const headings=this.headings(sheet,row);
          const map=this.mapping(headings,keys);
          const score=Object.values(map).filter(col=>col>=0).length;
          if(score>best.score)best={sheet:index,row,score};
        }
      }
      return best;
    }
    static suggested(source){
      const order=this.locate(source,ORDER_KEYS),task=this.locate(source,TASK_KEYS);
      return {orderSheet:order.sheet,orderHeaderRow:order.row,
        taskSheet:task.score>=2?task.sheet:-1,taskHeaderRow:task.row,
        orderMap:this.mapping(this.headings(source.sheets[order.sheet],order.row),ORDER_KEYS),
        taskMap:task.score>=2?this.mapping(this.headings(source.sheets[task.sheet],task.row),TASK_KEYS):{}};
    }
    static parseDate(raw,format){
      if(raw===null||raw===undefined||raw==='')return null;
      if(typeof raw==='string'&&iso(raw.trim()))return raw.trim();
      if((typeof raw==='number'||/^\d+(\.\d+)?$/.test(clean(raw)))&&format==='excel'){
        const num=Number(raw);
        if(!Number.isInteger(num)||num<61||num>2958465)return null;
        const day=new Date(Date.UTC(1899,11,30)+num*86400000);
        return iso(day.toISOString().slice(0,10));
      }
      const s=clean(raw);
      const match=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
      if(!match||!['dmy','mdy'].includes(format))return null;
      const year=match[3],month=String(Number(format==='dmy'?match[2]:match[1])).padStart(2,'0');
      const day=String(Number(format==='dmy'?match[1]:match[2])).padStart(2,'0');
      return iso(year+'-'+month+'-'+day);
    }
  }

  /** Map source columns to one new TNA order, and reconcile activity rows. */
  class TnaImportDraftReviewer {
    static review(stage,opts={},context={}){
      const errors=[],warnings=[],unmatched=[],rowProof=[];
      if(stage?.schema!=='VESA-TNA-IMPORT-STAGE-1'||!domain?.createPlan||!domain?.validatePlan)
        return {ok:false,errors:['Import source or TNA domain is unavailable.'],warnings,
          unmatched,rowProof,plan:null};
      const ownerUserId=clean(context.ownerUserId);
      if(!ownerUserId)return {ok:false,errors:['Current local user is required.'],warnings,
        unmatched,rowProof,plan:null};
      const orderSheet=stage.sheets[Number(opts.orderSheet)],taskSheet=
        opts.taskSheet==null||Number(opts.taskSheet)<0?null:stage.sheets[Number(opts.taskSheet)];
      if(!orderSheet){errors.push('Select an order details sheet.');return {ok:false,errors,warnings,unmatched,rowProof,plan:null};}
      const orderRow=Number(opts.orderHeaderRow)||1,taskRow=Number(opts.taskHeaderRow)||1;
      const oh=TnaImportSourceReader.headings(orderSheet,orderRow),
        th=taskSheet?TnaImportSourceReader.headings(taskSheet,taskRow):[];
      const om=opts.orderMap||TnaImportSourceReader.mapping(oh,ORDER_KEYS),
        tm=opts.taskMap||TnaImportSourceReader.mapping(th,TASK_KEYS);
      const validMap=(map,headings,keys)=>{
        for(const key of keys)if(map[key]!==undefined&&map[key]!==-1&&
          (!Number.isInteger(map[key])||map[key]>=headings.length||map[key]<-1))
          errors.push('Invalid mapped column: '+key);
        const selected=keys.filter(k=>Number.isInteger(map[k])&&map[k]>=0);
        const cols=selected.map(k=>map[k]);
        if(new Set(cols).size!==cols.length)errors.push('One source column was mapped to several different fields.');
      };
      validMap(om,oh,ORDER_KEYS);
      if(taskSheet)validMap(tm,th,TASK_KEYS);
      const required=['buyerName','factoryName','styleNo','poNumber','totalQty','buyerRequiredExFactory'];
      for(const field of required)if(!Number.isInteger(om[field])||om[field]<0)
        errors.push('Map the order column: '+field);
      const format=opts.dateFormat||'iso';
      if(!['iso','dmy','mdy','excel'].includes(format))errors.push('Choose an explicit source date format.');
      const templateId=opts.templateId;
      if(!domain.TEMPLATE_PROFILES?.[templateId])errors.push('Select a supported garment template.');
      const unit=clean(opts.unit||'pcs');
      if(!/^(pcs|sets|dozen|kg|meters|yards)$/.test(unit))errors.push('Choose a supported order unit.');
      const orderValues={};
      const orderRows=orderSheet.rows.slice(orderRow).filter(row=>row.some(v=>clean(v)));
      const inconsistent=new Set();
      for(const row of orderRows)for(const field of ORDER_KEYS){
        const value=dataCell(row,om,field);
        if(!value)continue;
        if(own(orderValues,field)&&clean(orderValues[field])!==value)inconsistent.add(field);
        else orderValues[field]=value;
      }
      for(const key of inconsistent)errors.push('More than one order value for '+key+
        ' — split separate orders into separate reviewed imports.');
      for(const key of required)if(!clean(orderValues[key]))errors.push('Missing order value: '+key);
      const qty=clean(orderValues.totalQty).replace(/,/g,'');
      if(qty&&!/^\d+$/.test(qty))errors.push('Order quantity must be a positive whole number.');
      const quantity=Number(qty);
      if(qty&&(!Number.isSafeInteger(quantity)||quantity<=0))
        errors.push('Order quantity is outside the accepted range.');
      const requiredDate=TnaImportSourceReader.parseDate(orderValues.buyerRequiredExFactory,format);
      if(clean(orderValues.buyerRequiredExFactory)&&!requiredDate)
        errors.push('Buyer required ex-factory has an invalid or unreviewed date.');
      const start=TnaImportSourceReader.parseDate(orderValues.orderConfirmedOn||'',format);
      if(clean(orderValues.orderConfirmedOn)&&!start)errors.push('Order confirmed date needs review.');
      const orderInput={templateId,buyerName:orderValues.buyerName||'',
        factoryName:orderValues.factoryName||'',styleNo:orderValues.styleNo||'',
        poNumber:orderValues.poNumber||'',totalQty:qty?quantity:null,
        buyerRequiredExFactory:requiredDate||'',orderConfirmedOn:start||'',unit};
      // A new UUID-like record is generated by domain, never keyed by PO/style.
      let plan=domain.createPlan(orderInput,{ownerUserId});
      if(plan.validation?.errors?.length)errors.push(...plan.validation.errors);
      const dependencyMode=opts.dependencyMode||'';
      if(taskSheet&&!['template','source','none'].includes(dependencyMode))
        errors.push('Choose how to handle activity dependency links.');
      const basis=opts.durationBasis||'working';
      if(!['working','calendar'].includes(basis))errors.push('Choose task duration day basis.');
      const relation=opts.relation||'FS';
      if(!['FS','SS','FF','SF'].includes(relation))errors.push('Choose a supported predecessor relation.');
      const sourceRows=[],sourceToTask=new Map(),claimedTaskIds=new Set(),
        taskProof=[],overrides=opts.taskOverrides||{};
      if(taskSheet){
        if(tm.taskRef<0&&tm.activity<0)errors.push('Map Activity reference or title.');
        for(let i=taskRow;i<taskSheet.rows.length;i++){
          const row=taskSheet.rows[i];
          if(!row?.some(v=>clean(v)))continue;
          const ref=dataCell(row,tm,'taskRef'),title=dataCell(row,tm,'activity');
          if(!ref&&!title){
            if(row.some(v=>clean(v)))addUnique(warnings,
              'Source row '+(i+1)+' has no activity reference/title; it will not become a task.');
            continue;
          }
          sourceRows.push({row,rowNumber:i+1,ref,title});
        }
        if(sourceRows.length>180)errors.push('Too many imported activities (limit 180).');
        const refNames=new Map();
        for(const t of plan.tasks)refNames.set(normalized(t.templateRef),t);
        for(const [i,item] of sourceRows.entries()){
          const {row,rowNumber,ref,title}=item;
          const key=String(rowNumber),manual=overrides[key];
          let target=null;
          if(typeof manual==='string'&&manual.startsWith('ref:'))
            target=plan.tasks.find(t=>t.templateRef===manual.slice(4))||null;
          else if(manual==='ignore'){
            rowProof.push({row:rowNumber,sourceRef:ref||title,status:'ignored'});continue;
          }else if(manual==='custom'){
            if(!title){errors.push('Custom task needs an activity title at row '+rowNumber);continue;}
            const stageCode=dataCell(row,tm,'stage').toUpperCase();
            const created=domain.addCustomTask(plan,{
              title,stageCode:domain.STAGE_LABELS[stageCode]?stageCode:'O',
              ownerParty:dataCell(row,tm,'owner')||'merchant',
              durationBasis:basis,durationUnits:0
            },{actorId:ownerUserId});
            if(!created.ok){errors.push('Cannot add custom task at row '+rowNumber);continue;}
            plan=created.plan;
            target=plan.tasks[plan.tasks.length-1];
            target.templateRef='CUSTOM-IMPORT-'+rowNumber;
          }else{
            if(ref)target=refNames.get(normalized(ref))||null;
            if(!target&&title){
              const matching=plan.tasks.filter(task=>
                normalized(task.title)===normalized(title));
              if(matching.length===1)target=matching[0];
            }
          }
          if(!target){
            unmatched.push({row:rowNumber,ref,title:title||ref});
            errors.push('Match or explicitly ignore source activity at row '+rowNumber);
            continue;
          }
          if(claimedTaskIds.has(target.taskId)){
            errors.push('Duplicate activity mapped to '+target.templateRef+' at row '+rowNumber);
            continue;
          }
          claimedTaskIds.add(target.taskId);
          const read=(k)=>dataCell(row,tm,k);
          const duration=read('durationUnits');
          if(duration){
            if(!/^\d+$/.test(duration)||!Number.isSafeInteger(Number(duration))||Number(duration)>3650)
              errors.push('Invalid task duration at row '+rowNumber);
            else target.durationUnits=Number(duration);
          }
          const rowBasis=read('durationBasis').toLowerCase();
          if(rowBasis&&!['working','calendar'].includes(rowBasis))
            errors.push('Unrecognized duration basis at row '+rowNumber);
          else target.durationBasis=rowBasis||basis;
          const status=read('status').toLowerCase();
          if(status){
            if(!['not-started','in-progress','submitted','awaiting-approval','blocked','rejected'].includes(status))
              errors.push('Approval/completion status at row '+rowNumber+
                ' requires separate verified action; do not import as a release.');
            else target.status=status;
          }
          const owner=read('owner');
          if(owner)target.ownerParty=owner.slice(0,120);
          const stageValue=read('stage');
          if(stageValue&&normalized(stageValue)!==normalized(target.stage)&&
            normalized(stageValue)!==normalized(target.stageCode))
            addUnique(warnings,'Row '+rowNumber+' stage differs from template; source stage not silently applied.');
          for(const [key,domainKey] of [['baselineFinish','baselineFinish'],
            ['currentTargetFinish','currentTargetFinish'],['actualFinish','actualFinish']]){
            const raw=mapValue(row,tm,key);
            if(raw===''||raw===null||raw===undefined)continue;
            const parsed=TnaImportSourceReader.parseDate(raw,format);
            if(!parsed)errors.push('Invalid '+key+' at row '+rowNumber+
              '; choose a compatible date format.');
            else target.dates[domainKey]=parsed;
          }
          const note=read('notes');
          if(note)target.importSourceNote=note.slice(0,1000);
          target.importSource={sheet:taskSheet.name.slice(0,100),
            row:rowNumber,reference:(ref||title).slice(0,120)};
          taskProof.push({row:rowNumber,ref:ref||target.templateRef,
            taskId:target.taskId,title:target.title,sourcePredecessor:read('predecessor')});
          if(ref){
            const id=normalized(ref);
            if(sourceToTask.has(id))errors.push('Duplicate source activity ref at row '+rowNumber);
            else sourceToTask.set(id,target.taskId);
          }
          rowProof.push({row:rowNumber,sourceRef:ref||title,
            targetRef:target.templateRef,status:manual==='custom'?'custom':'matched'});
        }
        if(dependencyMode==='none')plan.edges=[];
        if(dependencyMode==='template')addUnique(warnings,
          'Template dependency links were kept; they did not come from the workbook.');
        if(dependencyMode==='source'){
          if(!Number.isInteger(tm.predecessor)||tm.predecessor<0)
            errors.push('Map the predecessor column before using source task links.');
          const lookup=new Map(plan.tasks.map(t=>[normalized(t.templateRef),t.taskId]));
          for(const [ref,id] of sourceToTask)lookup.set(ref,id);
          const edges=[],seen=new Set();
          for(const item of taskProof){
            const parts=item.sourcePredecessor.split(/[;,|]/).map(clean).filter(Boolean);
            for(const token of parts){
              const from=lookup.get(normalized(token)),to=item.taskId;
              if(!from){errors.push('Unknown predecessor "'+token+'" at row '+item.row);continue;}
              if(from===to){errors.push('An activity cannot depend on itself (row '+item.row+').');continue;}
              const key=from+'|'+to;
              if(seen.has(key)){errors.push('Repeated predecessor link at row '+item.row);continue;}
              seen.add(key);
              edges.push({edgeId:'import-edge-'+edges.length,predecessorTaskId:from,
                successorTaskId:to,relation,lagUnits:0,lagBasis:basis,
                calendarPolicy:'successor'});
            }
          }
          const graph=new Map(plan.tasks.map(t=>[t.taskId,[]]));
          for(const e of edges)graph.get(e.predecessorTaskId)?.push(e.successorTaskId);
          const gray=new Set(),black=new Set();
          const loop=id=>{
            if(gray.has(id))return true;
            if(black.has(id))return false;
            gray.add(id);
            for(const successor of graph.get(id)||[])if(loop(successor))return true;
            gray.delete(id);black.add(id);return false;
          };
          if(plan.tasks.some(task=>loop(task.taskId)))errors.push('Imported task dependencies contain a cycle.');
          if(!errors.some(x=>x.includes('predecessor')||x.includes('cycle')))plan.edges=edges;
        }
        if(taskProof.some(item=>{
          const t=plan.tasks.find(x=>x.taskId===item.taskId);
          return t?.dates?.baselineFinish||t?.dates?.actualFinish;
        }))addUnique(warnings,'Recorded original/actual task dates are unverified source values; no baseline was frozen.');
      }
      const existing=(Array.isArray(context.existing)?context.existing:[])
        .filter(item=>normalized(item.po)===normalized(plan.order.poNumbers[0])&&
          normalized(item.style)===normalized(plan.order.styles[0]?.styleNo));
      if(existing.length)addUnique(warnings,'Similar saved PO/style exists. New draft only; no merge or overwrite.');
      const chosenOrderCols=new Set(Object.values(om).filter(c=>Number.isInteger(c)&&c>=0));
      const chosenTaskCols=new Set(Object.values(tm).filter(c=>Number.isInteger(c)&&c>=0));
      const extraOrder=oh.filter((_,i)=>!chosenOrderCols.has(i)&&oh[i]);
      const extraTask=taskSheet?th.filter((_,i)=>!chosenTaskCols.has(i)&&th[i]):[];
      if(extraOrder.length||extraTask.length)addUnique(warnings,
        'Unmapped columns stay outside the draft: '+[...extraOrder,...extraTask].join(', ').slice(0,500));
      plan.importReview={sourceType:stage.kind,fileName:stage.fileName,
        orderSheet:orderSheet.name,activitySheet:taskSheet?.name||null,
        orderHeaderRow:orderRow,activityHeaderRow:taskSheet?taskRow:null,
        format,dependencyMode:taskSheet?dependencyMode:'none',
        sourceTaskRows:sourceRows.length,
        matchedTaskRows:rowProof.filter(p=>p.status!=='ignored').length,
        ignoredTaskRows:rowProof.filter(p=>p.status==='ignored').length,
        unverifiedAuthority:true,
        notice:'Imported values are locally reviewed claims. No frozen baseline, verified approval, capacity or shipment release inferred.'};
      const validation=domain.validatePlan(plan);
      errors.push(...validation.errors);
      return {ok:errors.length===0&&unmatched.length===0,
        errors,warnings,unmatched,rowProof,plan,
        headers:{order:oh,activity:th},existingCount:existing.length,
        summary:{sourceRows:orderRows.length,sourceTaskRows:sourceRows.length,
          matched:rowProof.filter(p=>p.status==='matched'||p.status==='custom').length,
          ignored:rowProof.filter(p=>p.status==='ignored').length,
          extraOrder,extraTask},source:stage.fileName};
    }
    /** Explicit single-action local save, never an implicit stage or PO merge. */
    static commitNewDraft(review,options={}){
      if(options.confirm!==true)throw Error('Confirm the reviewed NEW draft first.');
      if(!review?.ok||!review.plan||!storage?.savePlan||!storage?.listPlans)
        throw Error('Import review has unresolved errors or storage is unavailable.');
      const user=clean(options.user);
      if(!user||user!==review.plan.ownerUserId||review.plan.mode==='practice')
        throw Error('Local profile does not match the reviewed draft.');
      const existing=storage.listPlans(user);
      if(existing.some(entry=>entry.recordId===review.plan.recordId))
        throw Error('New draft record ID already exists; re-review without overwriting.');
      const verified=domain.validatePlan(review.plan);
      if(!verified.ok)throw Error('New draft validation failed: '+verified.errors.join(' '));
      const saved=storage.savePlan(review.plan,user);
      const restored=storage.loadPlan(saved.recordId,user);
      if(!restored||restored.recordId!==saved.recordId)
        throw Error('Saved draft could not be reopened; keep your source workbook.');
      return {saved,plan:restored};
    }
  }
  const api=Object.freeze({SCHEMA:'VESA-TNA-IMPORT-STAGE-1',ORDER_KEYS,TASK_KEYS,
    labels:TnaImportSourceReader.strings,
    parseText:TnaImportSourceReader.parseDelimited.bind(TnaImportSourceReader),
    parseWorkbook:TnaImportSourceReader.fromWorkbook.bind(TnaImportSourceReader),
    suggested:TnaImportSourceReader.suggested.bind(TnaImportSourceReader),
    headings:TnaImportSourceReader.headings.bind(TnaImportSourceReader),
    mapping:TnaImportSourceReader.mapping.bind(TnaImportSourceReader),
    review:TnaImportDraftReviewer.review.bind(TnaImportDraftReviewer),
    commitNewDraft:TnaImportDraftReviewer.commitNewDraft.bind(TnaImportDraftReviewer)});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaImportReview=api;
})(typeof globalThis!=='undefined'?globalThis:this);
