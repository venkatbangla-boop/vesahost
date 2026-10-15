/**
 * VESA TNA GMR-04A: reviewed Excel workbook -> entirely new LOCAL draft.
 *
 * Owner: pure staging/validation only. Does not read browser storage, change
 * an existing TNA, merge activities, sign baselines or execute formulas.
 * Caller retains this short-lived in-memory snapshot only until confirmation.
 *
 * Contract: .xlsx only; choose sheet, header, row, column mapping, date
 * notation, working/calendar basis and garment template explicitly.
 * Unsupported activity/dependency importing is disclosed and is not silently
 * treated as completed. Business records are created by existing TNA domain.
 */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaImportReview=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const XLSX=root.XLSX||(typeof require==='function'?require('../vendor/xlsx.full.min.js'):null);
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);
  const MAX_BYTES=2*1024*1024,MAX_SHEETS=20,MAX_ROWS=1500,MAX_COLUMNS=60;
  const FIELD_IDS=Object.freeze([
    'buyerName','factoryName','styleNo','poNumber','totalQty','buyerRequiredExFactory',
    'fabricSpec','fabricWeightGsm','orderConfirmedOn','buyerRequiredETD'
  ]);
  const REQUIRED=new Set(FIELD_IDS.slice(0,6));
  const DATE_FIELDS=new Set(['buyerRequiredExFactory','orderConfirmedOn','buyerRequiredETD']);
  const NUMBER_FIELDS=new Set(['totalQty','fabricWeightGsm']);
  const ALIASES=Object.freeze({
    buyerName:['buyer','buyer name','customer','customer name'],
    factoryName:['factory','factory name','manufacturer','manufacturer name'],
    styleNo:['style','style no','style number','style code'],
    poNumber:['po','po no','po number','order no','order number','purchase order'],
    totalQty:['quantity','qty','order qty','order quantity','total quantity','total qty','pcs'],
    buyerRequiredExFactory:['buyer required ex factory','required ex factory','ex factory','ex factory date','exfactory date','delivery date'],
    fabricSpec:['fabric','fabric details','fabric specification','fabric spec','fabric quality'],
    fabricWeightGsm:['gsm','fabric gsm','fabric weight gsm'],
    orderConfirmedOn:['order confirmed','order confirmation date','order confirmed on'],
    buyerRequiredETD:['etd','required etd','buyer required etd']
  });
  const FIELD_LABELS=Object.freeze({
    buyerName:'Buyer',factoryName:'Factory',styleNo:'Style',poNumber:'PO / Order',
    totalQty:'Order quantity',buyerRequiredExFactory:'Required ex-factory',
    fabricSpec:'Fabric details',fabricWeightGsm:'Fabric GSM',
    orderConfirmedOn:'Order confirmed on',buyerRequiredETD:'Required ETD'
  });
  const EN=Object.freeze({
    fields:FIELD_LABELS,
    title:'Review Excel before creating a new TNA',sheet:'Worksheet',header:'Header row',
    dataRow:'Order data row',date:'Date format',basis:'Lead-time basis',profile:'Garment template',
    map:'Match Excel columns',review:'Review proposed draft',confirm:'Create NEW local TNA draft',
    warning:'Only the selected order row is imported. Other rows, activities, approvals and dependency links are NOT imported at this stage.',
    noOverwrite:'Never replace an existing TNA. The new draft gets a separate record ID and an unsigned baseline.',
    duplicate:'A TNA with the same buyer, factory, PO and style already exists. This will be a separate record.',
    duplicateConsent:'I understand the matching order exists. Create another separate draft.',
    consent:'I have reviewed the columns, dates, source and missing activity links.',
    rows:'Rows in worksheet',unknown:'Unmapped columns',missing:'Needs Information'
  });
  const LOCALES=Object.freeze({
    en:EN,
    bn:{...EN,fields:{buyerName:'বায়ার',factoryName:'ফ্যাক্টরি',styleNo:'স্টাইল',poNumber:'PO / অর্ডার',
      totalQty:'অর্ডারের পরিমাণ',buyerRequiredExFactory:'এক্স-ফ্যাক্টরি তারিখ',fabricSpec:'কাপড়ের বিবরণ',
      fabricWeightGsm:'GSM',orderConfirmedOn:'অর্ডার নিশ্চিত হওয়ার তারিখ',buyerRequiredETD:'নির্ধারিত ETD'},
      warning:'শুধু নির্বাচিত অর্ডার সারি নতুন ড্রাফটে আসবে। অন্য সারি, অনুমোদন, কাজ ও পূর্ববর্তী কাজের সম্পর্ক এখন আমদানি হবে না।',
      noOverwrite:'পুরোনো TNA বদলানো হবে না। নতুন ড্রাফটের আলাদা নম্বর থাকবে; পুরোনো পরিকল্পনা অনুমোদিত নয়।',
      duplicate:'একই বায়ার, ফ্যাক্টরি, PO ও স্টাইলের TNA আগে থেকেই আছে। নতুনটি আলাদা ড্রাফট হবে।',
      rows:'ওয়ার্কশিটে কাজের সারি',missing:'তথ্য প্রয়োজন',
      title:'নতুন TNA তৈরির আগে Excel যাচাই',sheet:'ওয়ার্কশিট',header:'হেডার সারি',dataRow:'অর্ডার সারি',date:'তারিখের ফরম্যাট',basis:'লিড টাইম গণনা',profile:'পোশাকের ধরন',map:'Excel কলাম মিলিয়ে দেখুন',review:'নতুন ড্রাফট যাচাই',confirm:'নতুন TNA ড্রাফট তৈরি',consent:'কলাম, তারিখ, নথি ও বাদ পড়া কাজ যাচাই করেছি।',duplicateConsent:'একই অর্ডার আছে; তবুও আলাদা ড্রাফট তৈরি করুন।'},
    hi:{...EN,fields:{buyerName:'बायर',factoryName:'फैक्ट्री',styleNo:'स्टाइल',poNumber:'PO / ऑर्डर',
      totalQty:'ऑर्डर मात्रा',buyerRequiredExFactory:'एक्स-फैक्ट्री तारीख',fabricSpec:'फैब्रिक विवरण',
      fabricWeightGsm:'GSM',orderConfirmedOn:'ऑर्डर पुष्टि की तारीख',buyerRequiredETD:'तय ETD'},
      warning:'केवल चुनी गई ऑर्डर पंक्ति नया ड्राफ्ट बनेगी। अन्य पंक्तियाँ, अप्रूवल, गतिविधियाँ और निर्भरता अभी आयात नहीं होंगे।',
      noOverwrite:'पुराने TNA को बदला नहीं जाएगा; अलग ID वाला नया ड्राफ्ट बनेगा।',
      duplicate:'इस बायर, फैक्ट्री, PO और स्टाइल का TNA पहले से है; नया अलग रहेगा।',
      rows:'वर्कशीट की पंक्तियाँ',missing:'जानकारी चाहिए',
      title:'नया TNA बनाने से पहले Excel जाँचें',sheet:'वर्कशीट',header:'हेडर पंक्ति',dataRow:'ऑर्डर पंक्ति',date:'तारीख का फ़ॉर्मेट',basis:'लीड टाइम आधार',profile:'गारमेंट प्रकार',map:'Excel कॉलम मिलाएँ',review:'नया ड्राफ्ट जाँचें',confirm:'नया TNA ड्राफ्ट बनाएँ',consent:'कॉलम, तारीख, स्रोत और बची गतिविधियाँ जाँच ली हैं।',duplicateConsent:'मिलता-जुलता ऑर्डर है, अलग ड्राफ्ट बनाना है।'},
    ta:{...EN,fields:{buyerName:'Buyer',factoryName:'Factory',styleNo:'Style',poNumber:'PO / Order',
      totalQty:'Order அளவு',buyerRequiredExFactory:'Ex-factory தேதி',fabricSpec:'Fabric விவரம்',
      fabricWeightGsm:'GSM',orderConfirmedOn:'Order உறுதி தேதி',buyerRequiredETD:'ETD தேதி'},
      warning:'தேர்ந்தெடுத்த Order row மட்டும் புதிய draft-க்கு வரும். மற்ற rows, approvals, activities, dependencies இப்போது import ஆகாது.',
      noOverwrite:'பழைய TNA மாறாது; புதிய draft தனி ID-யுடன் உருவாகும்.',
      duplicate:'இதே Buyer, Factory, PO, Style-க்கு ஏற்கனவே TNA உள்ளது. புதியது தனி draft ஆகும்.',
      rows:'Worksheet வரிசைகள்',missing:'தகவல் தேவை',
      title:'புதிய TNA-க்கு முன் Excel சரிபார்ப்பு',sheet:'Worksheet',header:'Heading வரிசை',dataRow:'Order வரிசை',date:'தேதி முறை',basis:'Lead-time முறை',profile:'Garment வகை',map:'Excel columns பொருத்துக',review:'Draft சரிபார்க்க',confirm:'புதிய TNA draft உருவாக்க',consent:'Columns, dates, source, மீதமுள்ள activities சரிபார்த்தேன்.',duplicateConsent:'இந்த order ஏற்கனவே உள்ளது; தனிப் draft உருவாக்க ஒப்புக்கொள்கிறேன்.'}
  });
  const cleanHeader=s=>String(s??'').trim().toLowerCase().replace(/[_\-\/]+/g,' ').replace(/\s+/g,' ');
  const cellString=v=>String(v??'').trim();
  const dangerous=v=>typeof v==='string'&&(/^\s*[=+\-@]/.test(v)||/^\s*(?:javascript:|data:|vbscript:)/i.test(v)||/<\s*(?:script|iframe|object|svg)\b/i.test(v)||/\bon(?:error|load|click)\s*=/i.test(v));
  const civil=(year,month,day)=>{
    const y=Number(year),m=Number(month),d=Number(day);
    const utc=Date.UTC(y,m-1,d);
    if(!Number.isInteger(y)||y<1900||y>2199||!Number.isInteger(m)||!Number.isInteger(d))return null;
    const check=new Date(utc);
    return check.getUTCFullYear()===y&&check.getUTCMonth()===m-1&&check.getUTCDate()===d
      ?[y,String(m).padStart(2,'0'),String(d).padStart(2,'0')].join('-'):null;
  };
  function parseDate(value,format,date1904){
    if(value===''||value===null||value===undefined)return null;
    if(typeof value==='number'){
      if(format!=='excel')throw Error('Excel numeric date requires the explicit Excel date option.');
      const parsed=XLSX?.SSF?.parse_date_code(value,{date1904:!!date1904});
      const date=parsed&&civil(parsed.y,parsed.m,parsed.d);
      if(!date)throw Error('Excel date serial is invalid or out of supported range.');
      return date;
    }
    const text=cellString(value);
    if(dangerous(text))throw Error('Date contains a formula-like or unsafe text value.');
    if(format==='iso'){
      const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
      if(!match)throw Error('Date must use YYYY-MM-DD.');
      return civil(match[1],match[2],match[3])||(()=>{throw Error('Date is not a real calendar day.');})();
    }
    if(format==='dmy'||format==='mdy'){
      const match=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
      if(!match)throw Error('Date must use a four-digit year and explicit day/month order.');
      const date=format==='dmy'?civil(match[3],match[2],match[1]):civil(match[3],match[1],match[2]);
      if(!date)throw Error('Date is not a real calendar day.');
      return date;
    }
    throw Error('Choose the explicit source date format. No dates are guessed.');
  }
  function suggestMapping(headers){
    const names=headers.map(cleanHeader),used=new Set(),mapping={};
    for(const id of FIELD_IDS){
      const index=names.findIndex((value,i)=>value&&!used.has(i)&&ALIASES[id].includes(value));
      mapping[id]=index;
      if(index>=0)used.add(index);
    }
    return mapping;
  }

  /**
   * Header location is a suggestion only. Show the user the proposed sheet
   * and header and require a conscious review; never import automatically.
   */
  function suggestHeaderRow(snapshot,sheetName){
    const sheet=snapshot?.sheets?.[sheetName];
    if(!sheet)return {row:1,score:0};
    let best={row:1,score:0};
    for(let i=0;i<Math.min(sheet.rows.length,30);i++){
      const headers=(sheet.rows[i]||[]).map(cellString);
      const map=suggestMapping(headers);
      const score=FIELD_IDS.reduce((count,id)=>count+(map[id]>=0?(REQUIRED.has(id)?3:1):0),0);
      if(score>best.score)best={row:i+1,score};
    }
    return best;
  }
  function suggestWorksheet(snapshot){
    if(!snapshot?.sheetNames?.length)throw Error('Excel has no worksheet to review.');
    return snapshot.sheetNames.map(name=>({...suggestHeaderRow(snapshot,name),name}))
      .sort((a,b)=>b.score-a.score)[0];
  }
  function parseWorkbook(input,fileName=''){
    if(!/\.xlsx$/i.test(String(fileName)))throw Error('Choose a non-macro .xlsx workbook. Other formats are preview-only.');
    if(!XLSX)throw Error('The local Excel reader is missing.');
    const size=input instanceof ArrayBuffer?input.byteLength:(input?.byteLength??input?.length??0);
    if(!Number.isFinite(size)||size<=0||size>MAX_BYTES)throw Error('Excel file must be nonempty and no larger than 2 MB.');
    let workbook;
    try{workbook=XLSX.read(input,{type:input instanceof ArrayBuffer?'array':'buffer',cellFormula:true,cellNF:true,cellDates:false,bookVBA:true});}
    catch{throw Error('This file could not be read as a valid Excel workbook.');}
    if(workbook.vbaraw)throw Error('Macro-enabled workbooks are not allowed.');
    if(!workbook.SheetNames?.length||workbook.SheetNames.length>MAX_SHEETS)throw Error('Excel must contain 1–20 worksheets.');
    const sheets={};
    for(const name of workbook.SheetNames){
      const sheet=workbook.Sheets[name];
      if(!sheet)throw Error('Workbook contains a missing worksheet.');
      const region=sheet['!ref']?XLSX.utils.decode_range(sheet['!ref']):null;
      if(region&&(region.e.r>=MAX_ROWS||region.e.c>=MAX_COLUMNS))throw Error('Excel sheet exceeds the safe 1500-row or 60-column limit.');
      const formulaCells=[];
      for(const [address,cell] of Object.entries(sheet)){
        if(address.startsWith('!'))continue;
        if(cell?.f)formulaCells.push(address);
      }
      const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true,blankrows:true,range:0});
      if(rows.length>MAX_ROWS)throw Error('Excel sheet has too many rows.');
      sheets[name]={name,rows,formulaCells};
    }
    return {fileName:String(fileName).replace(/[<>]/g,'').slice(0,120),
      sheets,sheetNames:workbook.SheetNames.slice(),date1904:!!workbook.Workbook?.WBProps?.date1904};
  }
  function describe(snapshot,sheetName,headerRow=1){
    const sheet=snapshot?.sheets?.[sheetName];
    if(!sheet)throw Error('Choose a worksheet from the uploaded file.');
    const n=Number(headerRow);
    if(!Number.isInteger(n)||n<1||n>Math.min(30,sheet.rows.length))throw Error('Header row must exist within the first 30 lines.');
    const headers=(sheet.rows[n-1]||[]).map(cellString);
    if(!headers.some(Boolean))throw Error('Header row must contain column names.');
    const dataRows=sheet.rows.map((row,i)=>({line:i+1,values:row})).filter(item=>item.line>n&&item.values.some(v=>cellString(v)!==''));
    const mapping=suggestMapping(headers), mapped=new Set(Object.values(mapping).filter(v=>v>=0));
    const unrecognized=headers.map((h,i)=>!mapped.has(i)&&h?{index:i,name:h}:null).filter(Boolean);
    return {sheetName,headerRow:n,headers,dataRows,mapping,unrecognized,formulaCells:sheet.formulaCells};
  }
  function review(snapshot,settings,existingPlans=[]){
    const errors=[],warnings=[];
    let details;
    try{details=describe(snapshot,settings.sheetName,settings.headerRow);}catch(error){
      return {ready:false,errors:[error.message],warnings,details:null};
    }
    const mapping={};
    const seen=new Set();
    for(const field of FIELD_IDS){
      const value=settings.mapping&&Object.hasOwn(settings.mapping,field)?settings.mapping[field]:details.mapping[field];
      const idx=value===''||value===null||value===undefined?-1:Number(value);
      if(!Number.isInteger(idx)||idx < -1||idx>=details.headers.length){
        errors.push(field+': choose a valid Excel column.');mapping[field]=-1;continue;
      }
      if(idx>=0&&seen.has(idx))errors.push('One column cannot represent two different fields: '+field);
      if(idx>=0)seen.add(idx);
      if(idx<0&&REQUIRED.has(field))errors.push('Required column is missing: '+field);
      mapping[field]=idx;
    }
    if(details.formulaCells.length)errors.push('Excel formulas are not trusted. Remove formula cells from the selected worksheet.');
    const rowNo=Number(settings.recordRow);
    const selected=details.dataRows.find(entry=>entry.line===rowNo);
    if(!selected)errors.push('Select an actual order data row beneath the chosen header.');
    const input={};
    if(selected)for(const field of FIELD_IDS){
      const idx=mapping[field],raw=idx>=0?selected.values[idx]:'';
      if(raw!==''&&raw!==null&&raw!==undefined&&dangerous(raw)){errors.push(field+': formula-like or unsafe content was blocked.');continue;}
      if(NUMBER_FIELDS.has(field)){
        if(cellString(raw)===''){input[field]=null;continue;}
        const number=typeof raw==='number'?raw:/^\d+(?:\.\d+)?$/.test(cellString(raw))?Number(cellString(raw)):NaN;
        if(!Number.isFinite(number)||number<=0||(field==='totalQty'&&!Number.isInteger(number)))errors.push(field+': enter a positive valid number.');
        else input[field]=number;
        continue;
      }
      if(DATE_FIELDS.has(field)){
        try{input[field]=parseDate(raw,settings.dateFormat,snapshot.date1904);}
        catch(error){errors.push(field+': '+error.message);}
        continue;
      }
      const str=cellString(raw);
      if(str.length>500)errors.push(field+': imported cell is too long.');
      input[field]=str;
    }
    for(const field of ['buyerName','factoryName','styleNo','poNumber']){
      if(!input[field])errors.push(field+': required order identity is empty.');
    }
    if(!input.totalQty)errors.push('A valid total quantity is required.');
    if(!input.buyerRequiredExFactory)errors.push('A sourced buyer ex-factory date is required.');
    if(!['iso','dmy','mdy','excel'].includes(settings.dateFormat))errors.push('Choose explicit source date format.');
    if(!['calendar','working'].includes(settings.basis))errors.push('Choose calendar or working lead-time basis.');
    if(!domain?.TEMPLATE_PROFILES?.[settings.templateId])errors.push('Choose an approved garment template.');
    if(details.dataRows.length>1)warnings.push('This action selects only one order row; other order rows remain unimported.');
    if(details.unrecognized.length)warnings.push('Unmapped columns: '+details.unrecognized.map(x=>x.name).join(', '));
    warnings.push('Activities, statuses, approvals and predecessor links are NOT imported in this order-only review.');
    const canon=v=>cellString(v).toLowerCase().replace(/\s+/g,' ');
    const duplicate=Array.isArray(existingPlans)&&existingPlans.some(p=>
      canon(p?.order?.buyerName)===canon(input.buyerName)&&
      canon(p?.order?.factoryName)===canon(input.factoryName)&&
      canon(p?.order?.styles?.[0]?.styleNo)===canon(input.styleNo)&&
      canon(p?.order?.poNumbers?.[0])===canon(input.poNumber)
    );
    if(duplicate)warnings.push('Matching buyer + factory + style + PO already exists; this can only be a separate draft.');
    const ready=!errors.length;
    const proposal=ready?{
      ...input,leadTimeBasis:settings.basis,templateId:settings.templateId,
      buyerRequiredETD:input.buyerRequiredETD||undefined,
      importSource:{fileName:snapshot.fileName,sheetName:details.sheetName,headerRow:details.headerRow,recordRow:rowNo,
        mapping,dateFormat:settings.dateFormat,basis:settings.basis,sourceTrust:'user-reviewed-not-independent'}
    }:null;
    return {ready,errors,warnings,duplicate,details,proposal,mapping,selectedRow:rowNo};
  }
  function createNewDraft(checked,{ownerUserId}={}){
    if(!checked?.ready||!checked.proposal)throw Error('Review valid Excel columns and dates before confirmation.');
    const {importSource,...input}=checked.proposal;
    const plan=domain.createPlan(input,{ownerUserId:ownerUserId||'local-browser-user',mode:'local'});
    const validated=domain.validatePlan(plan);
    if(!validated.ok)throw Error(validated.errors.join('; '));
    const stamped=new Date().toISOString();
    plan.auditEvents.push({eventId:'import-'+plan.recordId,eventType:'reviewed-workbook-new-draft',
      actorId:ownerUserId||'local-browser-user',createdAt:stamped,details:{...importSource,
        skippedActivities:true,reviewedByUser:true,originalFileNotStored:true}});
    return plan;
  }
  return Object.freeze({
    FIELD_IDS,REQUIRED,DATE_FIELDS,NUMBER_FIELDS,ALIASES,LOCALES,
    parseWorkbook,suggestHeaderRow,suggestWorksheet,describe,review,createNewDraft,parseDate
  });
});
