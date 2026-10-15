(function(root){
  'use strict';
  const SUPPORTED_LANGUAGES=['en','bn','hi','ta'];
  const BRAND='VESA Enterprise Inc.';
  const REPORT_TYPES=[
    ['R01','masterTna','factoryAgent','Order, stages, activities, dates, owners, status, dependencies and revision.'],
    ['R02','buyerTna','buyerBrand','Buyer-facing milestones, required buyer actions, forecast and verified targets.'],
    ['R03','factoryDailyAction','departments','Today, overdue and next seven days with owners, reasons and proof references.'],
    ['R04','criticalPath','management','Controlling chains, float, forecast versus required ex-factory and violated gates.'],
    ['R05','weeklyTna','buyerAgentFactory','Completed, missed, next week, pending approvals and agreed recovery.'],
    ['R06','delayRecovery','management','Original/current/actual, waiting party, cause, affected tasks and scenarios.'],
    ['R07','productionStatus','productionBuyer','Cutting, sewing, finishing, packing, remaining quantity and projected end.'],
    ['R08','materialLc','commercialSourcing','Supplier, master/B2B LC, fabric/trims, shortages and QC readiness.'],
    ['R09','shipmentReadiness','qualityShipping','PP/PPM/inspection, packed quantity, booking, documents and lots.'],
    ['R10','portfolioMultiPo','managementAgent','Orders per buyer/factory, due dates, statuses, blockers and critical actions.'],
    ['R11','approvalHistory','buyerFactory','Review rounds, submissions, decisions, authority, evidence and revisions.'],
    ['R12','scenarioComparison','plannerManagement','Base versus recovery options, input differences and selected revision.']
  ];
  const I18N={
    en:{languageName:'English',headings:{order:'Order context',dates:'Date columns',tasks:'Activities',warnings:'Data gaps / cautions',actions:'Report actions',meta:'Report metadata'},labels:{brand:BRAND,generated:'Generated',timezone:'Timezone',audience:'Audience',revision:'Revision',baseline:'Baseline snapshots',buyer:'Buyer',factory:'Factory',style:'Style',po:'PO',quantity:'Quantity',status:'Status',owner:'Owner',forecast:'Forecast',required:'Required ex-factory',noFabrication:'No missing approval, date, quantity, rate or shipment result is fabricated. Blank source data stays marked as Needs Information.',shareFallback:'Native share is unavailable until a supported browser action is used; download or print the report instead.',printFallback:'Use browser print for the verified local route. Dedicated PDF generation remains conditional until a licensed local PDF renderer is verified.'},reports:{}},
    bn:{languageName:'বাংলা',headings:{order:'অর্ডার প্রসঙ্গ',dates:'তারিখ কলাম',tasks:'কার্যক্রম',warnings:'ডেটা ঘাটতি / সতর্কতা',actions:'রিপোর্ট অ্যাকশন',meta:'রিপোর্ট তথ্য'},labels:{brand:BRAND,generated:'তৈরি হয়েছে',timezone:'টাইমজোন',audience:'দর্শক',revision:'রিভিশন',baseline:'বেসলাইন স্ন্যাপশট',buyer:'Buyer',factory:'Factory',style:'Style',po:'PO',quantity:'Quantity',status:'Status',owner:'Owner',forecast:'Forecast',required:'Required ex-factory',noFabrication:'কোন approval, date, quantity, rate বা shipment result বানানো হয়নি। source data blank থাকলে Needs Information থাকবে।',shareFallback:'Supported browser action না থাকলে native share unavailable; report download বা print করুন।',printFallback:'Verified local route হিসেবে browser print ব্যবহার করুন। Licensed local PDF renderer verify না হওয়া পর্যন্ত dedicated PDF conditional থাকবে।'},reports:{}},
    hi:{languageName:'हिन्दी',headings:{order:'ऑर्डर संदर्भ',dates:'तारीख कॉलम',tasks:'गतिविधियां',warnings:'डेटा गैप / सावधानी',actions:'रिपोर्ट एक्शन',meta:'रिपोर्ट जानकारी'},labels:{brand:BRAND,generated:'बनाया गया',timezone:'टाइमज़ोन',audience:'दर्शक',revision:'रिविज़न',baseline:'बेसलाइन स्नैपशॉट',buyer:'Buyer',factory:'Factory',style:'Style',po:'PO',quantity:'Quantity',status:'Status',owner:'Owner',forecast:'Forecast',required:'Required ex-factory',noFabrication:'कोई approval, date, quantity, rate या shipment result बनाया नहीं गया है। खाली source data Needs Information रहेगा।',shareFallback:'Supported browser action के बिना native share unavailable है; report download या print करें।',printFallback:'Verified local route के लिए browser print इस्तेमाल करें। Licensed local PDF renderer verify होने तक dedicated PDF conditional रहेगा।'},reports:{}},
    ta:{languageName:'தமிழ்',headings:{order:'ஆர்டர் விவரம்',dates:'தேதி காலங்கள்',tasks:'செயல்பாடுகள்',warnings:'டேட்டா குறை / கவனம்',actions:'ரிப்போர்ட் செயல்கள்',meta:'ரிப்போர்ட் தகவல்'},labels:{brand:BRAND,generated:'உருவாக்கப்பட்டது',timezone:'டைம்சோன்',audience:'பார்வையாளர்',revision:'ரிவிஷன்',baseline:'பேஸ்லைன் snapshots',buyer:'Buyer',factory:'Factory',style:'Style',po:'PO',quantity:'Quantity',status:'Status',owner:'Owner',forecast:'Forecast',required:'Required ex-factory',noFabrication:'approval, date, quantity, rate அல்லது shipment result எதுவும் உருவாக்கிப் போடப்படவில்லை. காலியான source data Needs Information ஆகவே இருக்கும்.',shareFallback:'Supported browser action இல்லையெனில் native share கிடையாது; report download அல்லது print செய்யவும்.',printFallback:'Verified local route-க்கு browser print பயன்படுத்தவும். Licensed local PDF renderer verify ஆகும் வரை dedicated PDF conditional ஆகும்.'},reports:{}}
  };
  const titleTranslations={
    masterTna:['Master TNA','মাস্টার TNA','मास्टर TNA','மாஸ்டர் TNA'],buyerTna:['Buyer TNA','Buyer TNA','Buyer TNA','Buyer TNA'],factoryDailyAction:['Factory Daily Action','Factory Daily Action','Factory Daily Action','Factory Daily Action'],criticalPath:['Critical Path','Critical Path','Critical Path','Critical Path'],weeklyTna:['Weekly TNA','Weekly TNA','Weekly TNA','Weekly TNA'],delayRecovery:['Delay & Recovery','Delay & Recovery','Delay & Recovery','Delay & Recovery'],productionStatus:['Production Status','Production Status','Production Status','Production Status'],materialLc:['Material & LC','Material & LC','Material & LC','Material & LC'],shipmentReadiness:['Shipment Readiness','Shipment Readiness','Shipment Readiness','Shipment Readiness'],portfolioMultiPo:['Portfolio / Multi-PO','Portfolio / Multi-PO','Portfolio / Multi-PO','Portfolio / Multi-PO'],approvalHistory:['Approval History','Approval History','Approval History','Approval History'],scenarioComparison:['Scenario Comparison','Scenario Comparison','Scenario Comparison','Scenario Comparison']
  };
  const audienceTranslations={
    factoryAgent:['Factory + agent','Factory + agent','Factory + agent','Factory + agent'],buyerBrand:['Buyer / brand','Buyer / brand','Buyer / brand','Buyer / brand'],departments:['Departments','Departments','Departments','Departments'],management:['Management','Management','Management','Management'],buyerAgentFactory:['Buyer / agent / factory','Buyer / agent / factory','Buyer / agent / factory','Buyer / agent / factory'],productionBuyer:['Production / authorized buyer','Production / authorized buyer','Production / authorized buyer','Production / authorized buyer'],commercialSourcing:['Commercial / sourcing','Commercial / sourcing','Commercial / sourcing','Commercial / sourcing'],qualityShipping:['Quality / shipping','Quality / shipping','Quality / shipping','Quality / shipping'],managementAgent:['Management / agent','Management / agent','Management / agent','Management / agent'],buyerFactory:['Buyer / factory','Buyer / factory','Buyer / factory','Buyer / factory'],plannerManagement:['Planner / management','Planner / management','Planner / management','Planner / management']
  };
  const langIndex={en:0,bn:1,hi:2,ta:3};
  for(const [key,values] of Object.entries(titleTranslations))for(const lang of SUPPORTED_LANGUAGES)I18N[lang].reports[key]=values[langIndex[lang]];
  function lang(value){return SUPPORTED_LANGUAGES.includes(value)?value:'en'}
  function reportType(id){return REPORT_TYPES.find(([code])=>code===id)||REPORT_TYPES[0]}
  function titleFor(report,language){const [,key]=report;return I18N[language].reports[key]||I18N.en.reports[key]}
  function audienceFor(report,language){const key=report[2];return (audienceTranslations[key]||audienceTranslations.factoryAgent)[langIndex[language]]}
  function formatDateTime(value,language){try{return new Intl.DateTimeFormat(language==='bn'?'bn-BD':language==='hi'?'hi-IN':language==='ta'?'ta-IN':'en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return String(value||'')}}
  function orderContext(plan={}){return {buyer:plan.order?.buyerName||'Needs Information',factory:plan.order?.factoryName||'Needs Information',style:plan.order?.styles?.[0]?.styleNo||'Needs Information',po:plan.order?.poNumbers?.[0]||'Needs Information',quantity:plan.order?.totalQty??'Needs Information',unit:plan.order?.unit||'pcs',requiredExFactory:plan.commitments?.buyerRequiredExFactory||'Needs Information'}}
  function taskRows(plan={},limit=Infinity){return (plan.tasks||[]).slice(0,limit).map(task=>({ref:task.templateRef,title:task.title,owner:task.ownerParty,status:task.status,baseline:task.dates?.baselineFinish||'',current:task.dates?.currentTargetFinish||'',forecast:task.dates?.forecastFinish||'',actual:task.dates?.actualFinish||'',risk:task.riskStatus||'needs-information'}))}
  function warnings(plan={}){return [...(plan.unknownFields||[]).map(item=>'Missing: '+item),...(plan.validation?.warnings||[])]}
  function catalogue(language='en'){const l=lang(language);return REPORT_TYPES.map(report=>({id:report[0],title:titleFor(report,l),audience:audienceFor(report,l),scope:report[3]}))}


  /**
   * GMR-05 R02 buyer projection: explicit outward-facing ref allowlist.
   * NEVER copy source title/owner/notes/proof IDs, finance/LC/commercial data,
   * generic validation errors or unapproved custom source rows to a buyer.
   */
  const BUYER_REFS=Object.freeze({
    O05:['PO received','PO পাওয়া','PO प्राप्त हुआ','PO பெறப்பட்டது'],
    O11:['Delivery target review','ডেলিভারি লক্ষ্য যাচাই','डिलीवरी लक्ष्य समीक्षा','Delivery தேதி மதிப்பாய்வு'],
    D03:['Development sample submitted','ডেভেলপমেন্ট স্যাম্পল জমা','डेवलपमेंट सैंपल जमा','Development sample சமர்ப்பிப்பு'],
    D04:['Development sample comments','স্যাম্পল মন্তব্য','सैंपल टिप्पणियाँ','Development sample கருத்துகள்'],
    D05:['Fit sample submitted','ফিট স্যাম্পল জমা','फिट सैंपल जमा','Fit sample சமர்ப்பிப்பு'],
    D06:['Fit comments received','ফিট মন্তব্য পাওয়া','फिट टिप्पणियाँ मिलीं','Fit கருத்துகள் வந்தன'],
    D08:['Fit approval','ফিট অনুমোদন','फिट अनुमोदन','Fit approval'],
    D10:['Size-set sample submitted','সাইজ সেট স্যাম্পল জমা','साइज सेट सैंपल जमा','Size-set sample சமர்ப்பிப்பு'],
    D11:['Size-set decision','সাইজ সেট সিদ্ধান্ত','साइज सेट निर्णय','Size-set முடிவு'],
    D13:['PP sample submitted','PP স্যাম্পল জমা','PP सैंपल जमा','PP sample சமர்ப்பிப்பு'],
    D14:['PP sample decision','PP স্যাম্পল সিদ্ধান্ত','PP सैंपल निर्णय','PP sample முடிவு'],
    D15:['Artwork submitted','আর্টওয়ার্ক জমা','आर्टवर्क जमा','Artwork சமர்ப்பிப்பு'],
    D16:['Artwork decision','আর্টওয়ার্ক সিদ্ধান্ত','आर्टवर्क निर्णय','Artwork முடிவு'],
    D18:['Decoration approval','ডেকোরেশন অনুমোদন','डेकोरेशन अनुमोदन','Decoration approval'],
    D20:['Wash standard decision','ওয়াশ স্ট্যান্ডার্ড সিদ্ধান্ত','वॉश मानक निर्णय','Wash standard முடிவு'],
    FA03:['Lab dip submitted','ল্যাব ডিপ জমা','लैब डिप जमा','Lab dip சமர்ப்பிப்பு'],
    FA04:['Lab dip comments','ল্যাব ডিপ মন্তব্য','लैब डिप टिप्पणियाँ','Lab dip கருத்துகள்'],
    FA05:['Lab dip approval','ল্যাব ডিপ অনুমোদন','लैब डिप अनुमोदन','Lab dip approval'],
    FA06:['Fabric hand-feel approval','ফ্যাব্রিক হ্যান্ডফিল অনুমোদন','फैब्रिक हैंडफील अनुमोदन','Fabric hand-feel approval'],
    FA09:['Printed fabric decision','প্রিন্টেড ফ্যাব্রিক সিদ্ধান্ত','प्रिंटेड फैब्रिक निर्णय','Printed fabric முடிவு'],
    TR02:['Trim artwork confirmation','ট্রিম আর্টওয়ার্ক নিশ্চয়তা','ट्रिम आर्टवर्क पुष्टि','Trim artwork உறுதி'],
    TR04:['Trims approval','ট্রিম অনুমোদন','ट्रिम अनुमोदन','Trims approval'],
    Q07:['Final inspection performed','ফাইনাল ইন্সপেকশন সম্পন্ন','फाइनल निरीक्षण पूरा','Final inspection நடந்தது'],
    Q08:['Final inspection decision','ফাইনাল ইন্সপেকশন সিদ্ধান্ত','फाइनल निरीक्षण निर्णय','Final inspection முடிவு'],
    PK04:['Packing completed','প্যাকিং সম্পন্ন','पैकिंग पूरी','Packing முடிந்தது'],
    S04:['Ex-factory handover','এক্স-ফ্যাক্টরি হস্তান্তর','एक्स-फैक्ट्री हैंडओवर','Ex-factory ஒப்படைப்பு'],
    S06:['Shipment ETD','শিপমেন্ট ETD','शिपमेंट ETD','Shipment ETD'],
    S07:['Destination ETA','গন্তব্য ETA','गंतव्य ETA','Destination ETA']
  });
  const BUYER_WORDS=Object.freeze({
    en:{milestones:'Buyer milestones',actions:'Buyer actions',ref:'Ref',milestone:'Milestone',original:'Original',
      current:'Revised',forecast:'Forecast',actual:'Actual',status:'Source-reported status',
      action:'Action requested',verification:'Source check',confirmed:'Buyer-confirmed target',
      requested:'Required ex-factory',unknown:'Needs Information',followup:'Buyer response requested (source-reported)',
      recorded:'Source reference recorded; not independently verified',unverified:'Source-reported; not independently verified',
      noActions:'No buyer follow-up is explicitly recorded.',noMilestones:'No buyer-facing milestones recorded.',
      noForecast:'No forecast from a confirmed scheduling source.',noTarget:'Buyer-approved target has not been independently verified.',
      disclosure:'Review this source-reported TNA with the buyer; no approval or date is independently authenticated.'},
    bn:{milestones:'বায়ার মাইলস্টোন',actions:'বায়ারের কাজ',ref:'রেফারেন্স',milestone:'মাইলস্টোন',original:'মূল',
      current:'সংশোধিত',forecast:'পূর্বাভাস',actual:'বাস্তব',status:'উৎস অনুযায়ী অবস্থা',
      action:'প্রয়োজনীয় পদক্ষেপ',verification:'উৎস যাচাই',confirmed:'বায়ার নিশ্চিত লক্ষ্য',
      requested:'প্রয়োজনীয় এক্স-ফ্যাক্টরি',unknown:'তথ্য প্রয়োজন',followup:'বায়ারের জবাব প্রয়োজন (উৎস অনুযায়ী)',
      recorded:'উৎসের রেফারেন্স আছে; স্বাধীন যাচাই হয়নি',unverified:'উৎস অনুযায়ী; স্বাধীন যাচাই হয়নি',
      noActions:'বায়ারের কোনো ফলো-আপ স্পষ্টভাবে নথিভুক্ত নেই।',noMilestones:'বায়ারের মাইলস্টোন নেই।',
      noForecast:'নিশ্চিত শিডিউল থেকে পূর্বাভাস নেই।',noTarget:'বায়ার অনুমোদিত লক্ষ্য স্বাধীনভাবে যাচাই হয়নি।',
      disclosure:'বায়ারের সঙ্গে যাচাই করুন; অনুমোদন বা তারিখ স্বাধীনভাবে প্রমাণিত নয়।'},
    hi:{milestones:'बायर माइलस्टोन',actions:'बायर कार्रवाई',ref:'रेफरेंस',milestone:'माइलस्टोन',original:'मूल',
      current:'संशोधित',forecast:'पूर्वानुमान',actual:'वास्तविक',status:'स्रोत-दर्ज स्थिति',
      action:'आवश्यक कार्रवाई',verification:'स्रोत जाँच',confirmed:'बायर-पुष्ट लक्ष्य',
      requested:'आवश्यक एक्स-फैक्ट्री',unknown:'जानकारी चाहिए',followup:'बायर जवाब चाहिए (स्रोत-दर्ज)',
      recorded:'स्रोत रेफरेंस है; स्वतंत्र पुष्टि नहीं',unverified:'स्रोत में दर्ज; स्वतंत्र पुष्टि नहीं',
      noActions:'बायर फॉलो-अप स्पष्ट दर्ज नहीं है।',noMilestones:'बायर माइलस्टोन दर्ज नहीं हैं।',
      noForecast:'पुष्ट शेड्यूल का पूर्वानुमान नहीं है।',noTarget:'बायर-स्वीकृत लक्ष्य स्वतंत्र रूप से सत्यापित नहीं है।',
      disclosure:'बायर से जाँचें; तारीख या अनुमोदन का स्वतंत्र सत्यापन नहीं हुआ।'},
    ta:{milestones:'Buyer milestones',actions:'Buyer செயல்கள்',ref:'Ref',milestone:'Milestone',original:'முதல் திட்டம்',
      current:'திருத்திய தேதி',forecast:'Forecast',actual:'Actual',status:'Source பதிவான நிலை',
      action:'தேவையான செயல்',verification:'Source சரிபார்ப்பு',confirmed:'Buyer உறுதிசெய்த இலக்கு',
      requested:'Required ex-factory',unknown:'தகவல் தேவை',followup:'Buyer பதில் தேவை (source பதிவு)',
      recorded:'Source reference உள்ளது; தனியாகச் சரிபார்க்கவில்லை',unverified:'Source பதிவு; தனியாகச் சரிபார்க்கவில்லை',
      noActions:'Buyer follow-up தெளிவாகப் பதிவு செய்யப்படவில்லை.',noMilestones:'Buyer milestones பதிவு இல்லை.',
      noForecast:'உறுதிசெய்த schedule-ல் Forecast கிடைக்கவில்லை.',noTarget:'Buyer-approved target தனியாக verify செய்யப்படவில்லை.',
      disclosure:'Buyer-உடன் உறுதிசெய்யவும்; approval அல்லது date தனியாக verify செய்யப்படவில்லை.'}
  });
  const BUYER_STATUS=Object.freeze({
    'not-started':['Not started','শুরু হয়নি','शुरू नहीं','தொடங்கவில்லை'],
    'in-progress':['In progress','চলছে','चल रहा','நடக்கிறது'],
    submitted:['Submitted','জমা হয়েছে','जमा हुआ','சமர்ப்பிக்கப்பட்டது'],
    'awaiting-approval':['Awaiting decision','সিদ্ধান্তের অপেক্ষা','निर्णय की प्रतीक्षा','முடிவு காத்திருக்கிறது'],
    approved:['Approved (reported)','অনুমোদিত (উৎস অনুযায়ী)','अनुमोदित (दर्ज)','Approved (பதிவு)'],
    rejected:['Rejected (reported)','বাতিল (উৎস অনুযায়ী)','अस्वीकृत (दर्ज)','Rejected (பதிவு)'],
    blocked:['Blocked','আটকে আছে','रुका हुआ','தடை'],
    completed:['Completed (reported)','সম্পন্ন (উৎস অনুযায়ী)','पूरा (दर्ज)','Completed (பதிவு)'],
    waived:['Waived (reported)','ছাড় (উৎস অনুযায়ী)','छूट (दर्ज)','Waived (பதிவு)'],
    'not-applicable':['Not applicable','প্রযোজ্য নয়','लागू नहीं','பொருந்தாது']
  });
  function validBuyerDay(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const dt=new Date(value+'T00:00:00Z');
    return !Number.isNaN(dt.getTime())&&dt.toISOString().slice(0,10)===value?value:null;
  }
  function buyerProjection(plan,language){
    const words=BUYER_WORDS[language],i=langIndex[language],milestones=[],actions=[],used=new Set();
    for(const task of Array.isArray(plan?.tasks)?plan.tasks:[]){
      const ref=String(task?.templateRef||'');
      if(!Object.hasOwn(BUYER_REFS,ref)||used.has(ref))continue;
      used.add(ref);
      if(task.applicability==='not-applicable')continue;
      const d=task.dates||{},key=Object.hasOwn(BUYER_STATUS,task.status)?task.status:'not-started';
      const proofRecorded=Array.isArray(task.proofRefs)&&task.proofRefs.some(p=>typeof p==='string'&&p.trim());
      const needsBuyer=task.waitingFor==='buyer'&&!['completed','approved','waived','not-applicable'].includes(key);
      const row={ref,title:BUYER_REFS[ref][i],original:validBuyerDay(d.baselineFinish),
        current:validBuyerDay(d.currentTargetFinish),forecast:validBuyerDay(d.forecastFinish),
        actual:validBuyerDay(d.actualFinish),status:BUYER_STATUS[key][i],statusId:key,
        verification:proofRecorded?words.recorded:words.unverified,
        buyerAction:needsBuyer?words.followup:null};
      milestones.push(row);
      if(needsBuyer)actions.push({ref,title:row.title,request:words.followup,target:row.current||row.original});
    }
    const gaps=[];
    if(!milestones.length)gaps.push(words.noMilestones);
    if(!actions.length)gaps.push(words.noActions);
    if(!milestones.some(row=>row.forecast))gaps.push(words.noForecast);
    gaps.push(words.noTarget); // Local baseline/owner is NOT a verified buyer approval.
    return {labels:words,milestones,actions,gaps,sourceDisclosure:words.disclosure,
      requestedExFactory:validBuyerDay(plan?.commitments?.buyerRequiredExFactory),
      buyerConfirmedTarget:null};
  }

  /**
   * R01 source-owned garment table. Use the same pure master-sheet projection
   * as the onscreen planner to prevent silent date/row discrepancies. Never
   * include internal GSM, LC reference and follow-up fields in other audiences.
   * No schedule/approval calculation or storage writes happen in reports.
   */
  function garmentMasterSheet(plan,language,options={}){
    const projection=root.VesaTnaMerchandisingSheet||
      (typeof require==='function'?require('./merchandising-sheet.js'):null);
    if(!projection?.TnaMerchandisingSheet)throw new Error('Garment TNA report cannot be prepared until the local sheet is loaded.');
    const sheet=new projection.TnaMerchandisingSheet();
    const view=sheet.snapshot(plan,{language,scheduled:options.scheduled,asOfDate:options.asOfDate||''});
    const refById=new Map((plan?.tasks||[]).map(task=>[task.taskId,task.templateRef]));
    const predecessorMap=new Map();
    for(const edge of plan?.edges||[]){
      if(!predecessorMap.has(edge.successorTaskId))predecessorMap.set(edge.successorTaskId,[]);
      const ref=refById.get(edge.predecessorTaskId);
      if(ref)predecessorMap.get(edge.successorTaskId).push(ref);
    }
    const rows=view.rows.map(row=>({
      ref:row.ref,stage:row.stage,activity:row.title,owner:row.owner,
      planned:row.planned,revised:row.revised,forecast:row.forecast,actual:row.actual,
      delayDays:row.delayDays,status:row.status,waiting:row.waiting,
      proof:row.proof,remarks:row.remarks,
      predecessors:(predecessorMap.get(row.taskId)||[]).join(', ')
    }));
    return {
      labels:view.labels,columns:projection.COLUMNS.slice(),rows,
      order:{
        fabricSpec:plan?.order?.fabricSpec||plan?.order?.composition||null,
        fabricWeightGsm:plan?.order?.fabricWeightGsm??null,
        masterLcStatus:plan?.commitments?.masterLcStatus||null,
        masterLcOpenedOn:plan?.commitments?.masterLcOpenedOn||null,
        masterLcProofRef:plan?.commitments?.masterLcProofRef||null
      },
      sourceRevision:plan?.revision??0,
      baselineCount:(plan?.baselineSnapshots||[]).length,
      evidenceStatus:'Source references are user-entered and not independently verified.'
    };
  }
  /**
   * GMR-06 R03 factory daily actions are a READ-ONLY civil-calendar projection.
   * The operator MUST supply YYYY-MM-DD; browser clock/timezone never fills it.
   * Source finish dates are not verified commitments or factory working days.
   */
  const DAILY_CLOSED=new Set(['approved','completed','waived','not-applicable']);
  const DAILY_LABELS=Object.freeze({
    en:{asOf:'Review as-of date',selectDate:'Select a valid as-of date before preparing this report.',
      today:'Today',overdue:'Overdue',nextSeven:'Next 7 days',needsDate:'Needs Information — missing date',
      group:'Action window',ref:'Ref',activity:'Activity',department:'Responsible department',
      target:'Due / target',original:'Original plan',revised:'Revised target',forecast:'Recorded forecast',
      actual:'Actual finish',status:'Recorded status',waiting:'Waiting for',reason:'Recorded delay reason',
      followup:'Follow-up',recovery:'Recovery action',proof:'Evidence references',
      noActions:'No source-recorded actions in this section.',unknown:'Needs Information',
      source:'Source-entered details; owners, dates, evidence and approvals are not independently verified.',
      calendar:'Calendar-day windows only; factory holidays, shifts and capacity were not verified.',
      count:'Undated open activities',missingOwner:'Open activities without a recorded owner',
      dueMeaning:'An explicitly recorded revised finish takes precedence over original planned finish.',
      invalid:'An invalid source date cannot be classified and requires review.',
      completedToday:'Completed today (source-recorded)'},
    bn:{asOf:'পর্যালোচনার তারিখ',selectDate:'রিপোর্ট তৈরির আগে সঠিক পর্যালোচনার তারিখ বেছে নিন।',
      today:'আজ',overdue:'সময়সীমা পেরিয়েছে',nextSeven:'পরের ৭ দিন',needsDate:'তথ্য প্রয়োজন — তারিখ নেই',
      group:'কাজের সময়সীমা',ref:'রেফারেন্স',activity:'কাজ',department:'দায়িত্বপ্রাপ্ত বিভাগ',
      target:'লক্ষ্য তারিখ',original:'মূল পরিকল্পনা',revised:'সংশোধিত লক্ষ্য',forecast:'রেকর্ডকৃত পূর্বাভাস',
      actual:'বাস্তব শেষ',status:'রেকর্ডকৃত অবস্থা',waiting:'যার জন্য অপেক্ষা',reason:'বিলম্বের কারণ',
      followup:'ফলো-আপ',recovery:'রিকভারি কাজ',proof:'প্রমাণের রেফারেন্স',
      noActions:'এই অংশে উৎসে কোনো কাজ রেকর্ড নেই।',unknown:'তথ্য প্রয়োজন',
      source:'উৎসে লেখা তথ্য; বিভাগ, তারিখ ও অনুমোদন স্বাধীনভাবে যাচাই হয়নি।',
      calendar:'শুধু ক্যালেন্ডার দিন; কারখানার ছুটি, শিফট ও ক্ষমতা যাচাই হয়নি।',
      count:'তারিখবিহীন চলমান কাজ',missingOwner:'দায়িত্ব নির্ধারিত নয় এমন কাজ',
      dueMeaning:'উৎসে সংশোধিত শেষ তারিখ থাকলে মূল তারিখের আগে তা ব্যবহার হয়।',
      invalid:'ভুল উৎস তারিখ দিয়ে কাজের সময় নির্ধারণ করা যায় না।',
      completedToday:'আজ সম্পন্ন (উৎস অনুযায়ী)'},
    hi:{asOf:'समीक्षा की तारीख',selectDate:'रिपोर्ट बनाने से पहले सही समीक्षा तारीख चुनें।',
      today:'आज',overdue:'समय सीमा बीत गई',nextSeven:'अगले 7 दिन',needsDate:'जानकारी चाहिए — तारीख नहीं',
      group:'कार्रवाई अवधि',ref:'रेफरेंस',activity:'काम',department:'जिम्मेदार विभाग',
      target:'लक्ष्य तारीख',original:'मूल योजना',revised:'संशोधित लक्ष्य',forecast:'दर्ज पूर्वानुमान',
      actual:'वास्तविक समाप्ति',status:'दर्ज स्थिति',waiting:'किसके जवाब का इंतजार',reason:'दर्ज देरी का कारण',
      followup:'फॉलो-अप',recovery:'रिकवरी कार्रवाई',proof:'प्रमाण रेफरेंस',
      noActions:'इस भाग में कोई दर्ज कार्रवाई नहीं है।',unknown:'जानकारी चाहिए',
      source:'स्रोत में दर्ज; विभाग, तारीख या मंजूरी स्वतंत्र रूप से सत्यापित नहीं।',
      calendar:'केवल कैलेंडर दिन; फैक्ट्री छुट्टियाँ, शिफ्ट या क्षमता सत्यापित नहीं।',
      count:'बिना तारीख खुले काम',missingOwner:'बिना जिम्मेदार विभाग के काम',
      dueMeaning:'दर्ज संशोधित समाप्ति को मूल लक्ष्य से प्राथमिकता दी जाती है।',
      invalid:'गलत स्रोत तारीख के आधार पर काम तय नहीं किया जा सकता।',
      completedToday:'आज पूरा हुआ (दर्ज स्थिति)'},
    ta:{asOf:'Review தேதி',selectDate:'Report தயாரிக்க சரியான review தேதியைத் தேர்ந்தெடுக்கவும்.',
      today:'இன்று',overdue:'காலக்கெடு கடந்தது',nextSeven:'அடுத்த 7 நாட்கள்',
      needsDate:'தகவல் தேவை — தேதி இல்லை',group:'Action காலம்',ref:'Ref',activity:'வேலை',
      department:'பொறுப்பான துறை',target:'Due / target',original:'முதல் திட்டம்',
      revised:'திருத்திய இலக்கு',forecast:'பதிவான Forecast',actual:'Actual முடிவு',
      status:'பதிவான நிலை',waiting:'பதில் காத்திருப்பது',reason:'பதிவான தாமதக் காரணம்',
      followup:'Follow-up',recovery:'Recovery செயல்',proof:'ஆதார references',
      noActions:'இந்த பகுதியில் source-ல் பதிவு செய்த வேலை இல்லை.',unknown:'தகவல் தேவை',
      source:'Source பதிவுகள் மட்டுமே; owner, dates, evidence மற்றும் approval தனியாக verify செய்யவில்லை.',
      calendar:'Calendar நாட்கள் மட்டும்; factory விடுமுறை, shift, capacity verify செய்யப்படவில்லை.',
      count:'தேதி இல்லாத open வேலைகள்',missingOwner:'Owner பதிவு இல்லாத வேலைகள்',
      dueMeaning:'பதிவான revised finish இருந்தால் original finish-ஐவிட அதற்கு முன்னுரிமை.',
      invalid:'தவறான source தேதியால் வேலை காலத்தை நிர்ணயிக்க முடியாது.',
      completedToday:'இன்று முடிந்தது (source பதிவு)'}
  });
  // Presentation-only status translations. Stable status IDs stay in records
  // and generic report.tasks for all existing report consumers.
  const DAILY_STATUS=Object.freeze({
    en:{'not-started':'Not started','in-progress':'In progress',submitted:'Submitted',
      'awaiting-approval':'Awaiting approval',approved:'Approved (recorded)',rejected:'Rejected',
      blocked:'Blocked',completed:'Completed (recorded)',waived:'Waived','not-applicable':'Not applicable'},
    bn:{'not-started':'শুরু হয়নি','in-progress':'চলছে',submitted:'জমা হয়েছে',
      'awaiting-approval':'অনুমোদনের অপেক্ষা',approved:'অনুমোদিত (রেকর্ড)',rejected:'বাতিল',
      blocked:'আটকে আছে',completed:'সম্পন্ন (রেকর্ড)',waived:'ছাড়','not-applicable':'প্রযোজ্য নয়'},
    hi:{'not-started':'शुरू नहीं','in-progress':'काम चल रहा है',submitted:'जमा',
      'awaiting-approval':'अनुमोदन लंबित',approved:'अनुमोदित (दर्ज)',rejected:'अस्वीकृत',
      blocked:'रुका हुआ',completed:'पूरा (दर्ज)',waived:'छूट','not-applicable':'लागू नहीं'},
    ta:{'not-started':'தொடங்கவில்லை','in-progress':'நடக்கிறது',submitted:'சமர்ப்பிக்கப்பட்டது',
      'awaiting-approval':'Approval காத்திருக்கிறது',approved:'Approved (பதிவு)',
      rejected:'நிராகரிக்கப்பட்டது',blocked:'தடை',completed:'முடிந்தது (பதிவு)',
      waived:'விலக்கு','not-applicable':'பொருந்தாது'}
  });
  const dailyDay=value=>{
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const date=new Date(value+'T00:00:00Z');
    return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value?Math.floor(date.getTime()/86400000):null;
  };
  function factoryDailyProjection(plan,language,asOfDate){
    const labels=DAILY_LABELS[language],asOf=dailyDay(asOfDate);
    const sections={overdue:[],today:[],nextSeven:[],needsDate:[]};
    const initialWarnings=[labels.source,labels.calendar,labels.dueMeaning];
    if(asOf===null)return {
      ready:false,asOfDate:null,labels,sections,rows:[],counts:{overdue:0,today:0,nextSeven:0,needsDate:0},
      warnings:[labels.selectDate],undatedCount:0,missingOwnerCount:0
    };
    const warningsList=[...initialWarnings],rows=[];
    let missingOwnerCount=0,invalidCount=0;
    for(const task of Array.isArray(plan?.tasks)?plan.tasks:[]){
      if(task?.applicability==='not-applicable')continue;
      const status=String(task?.status||'not-started'),closed=DAILY_CLOSED.has(status);
      const dates=task?.dates||{},original=dailyDay(dates.baselineFinish);
      const revised=dailyDay(dates.currentTargetFinish),actual=dailyDay(dates.actualFinish);
      // An invalid explicit revised date is NOT silently replaced by the older plan.
      const hasRevised=dates.currentTargetFinish!==null&&dates.currentTargetFinish!==undefined&&dates.currentTargetFinish!=='';
      const due=hasRevised?revised:original;
      let window=null;
      if(closed){
        if(['completed','approved'].includes(status)&&actual===asOf)window='today';
      }else if(due===null){window='needsDate';if(hasRevised||dates.baselineFinish)invalidCount+=1;}
      else if(due<asOf)window='overdue';
      else if(due===asOf)window='today';
      else if(due<=asOf+7)window='nextSeven';
      if(!window)continue;
      const owner=String(task.ownerParty||'').trim();
      if(!owner)missingOwnerCount+=1;
      const row={
        group:window,ref:String(task.templateRef||''),activity:String(task.title||''),
        department:owner||null,status,
        statusDisplay:DAILY_STATUS[language][status]||labels.unknown,
        waiting:String(task.waitingFor||'')||null,
        original:original===null?null:dates.baselineFinish,
        revised:revised===null?null:dates.currentTargetFinish,
        forecast:dailyDay(dates.forecastFinish)===null?null:dates.forecastFinish,
        actual:actual===null?null:dates.actualFinish,
        due:due===null?null:hasRevised?dates.currentTargetFinish:dates.baselineFinish,
        reason:String(task.delayReason||'')||null,
        followup:String(task.followUpNote||'')||null,
        recovery:String(task.recoveryAction||'')||null,
        proof:Array.isArray(task.proofRefs)?task.proofRefs.filter(p=>typeof p==='string'&&p.trim()).join(', ')||null:null
      };
      sections[window].push(row);
      rows.push(row);
    }
    // Sort within each report window by sourced due civil day, with stable ref.
    for(const section of Object.values(sections))section.sort((a,b)=>
      String(a.due||'9999-12-31').localeCompare(String(b.due||'9999-12-31'))||
      a.ref.localeCompare(b.ref));
    const ordered=['overdue','today','nextSeven','needsDate'].flatMap(key=>sections[key]);
    if(invalidCount)warningsList.push(labels.invalid+' ('+invalidCount+')');
    if(missingOwnerCount)warningsList.push(labels.missingOwner+': '+missingOwnerCount);
    return {ready:true,asOfDate,labels,sections,rows:ordered,
      counts:Object.fromEntries(Object.entries(sections).map(([key,items])=>[key,items.length])),
      warnings:warningsList,undatedCount:sections.needsDate.length,missingOwnerCount};
  }

  function buildReportModel(plan,options={}){
    const l=lang(options.language),report=reportType(options.reportId||'R01');
    const generatedAt=options.generatedAt||new Date().toISOString();
    const buyer=report[0]==='R02'?buyerProjection(plan,l):null;
    const daily=report[0]==='R03'?factoryDailyProjection(plan,l,options.asOfDate||''):null;
    const order=orderContext(plan);
    if(buyer)order.factory=buyer.labels.unknown; // no internal factory identity on buyer exports
    const tasks=daily?daily.rows.map(row=>({ref:row.ref,title:row.activity,owner:row.department||'',
      status:row.status,baseline:row.original||'',current:row.revised||'',forecast:row.forecast||'',
      actual:row.actual||'',risk:'needs-information'})):buyer?buyer.milestones.map(row=>({
      ref:row.ref,title:row.title,owner:'',status:row.statusId,
      baseline:row.original||'',current:row.current||'',forecast:row.forecast||'',
      actual:row.actual||'',risk:'needs-information'
    })):taskRows(plan);
    return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:report[0],title:titleFor(report,l),
      language:l,languageName:I18N[l].languageName,audience:audienceFor(report,l),
      generatedAt,generatedLabel:formatDateTime(generatedAt,l),
      timezone:options.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'local',
      revision:plan?.revision??0,baselineSnapshots:(plan?.baselineSnapshots||[]).length,
      headings:I18N[l].headings,labels:I18N[l].labels,order,tasks,
      warnings:daily?daily.warnings:buyer?buyer.gaps:warnings(plan),
      notes:[I18N[l].labels.noFabrication,...(buyer?[buyer.sourceDisclosure]:[]),
        I18N[l].labels.printFallback,I18N[l].labels.shareFallback],
      masterSheet:report[0]==='R01'?garmentMasterSheet(plan,l,options):null,
      ...(buyer?{buyerTna:buyer}:{}),
      ...(daily?{factoryDaily:daily}:{}),
      source:{recordId:plan?.recordId||null,schemaVersion:plan?.schemaVersion||null,mode:plan?.mode||'unknown'}};
  }
  function assertLanguageCoverage(){const missing=[];for(const l of SUPPORTED_LANGUAGES){for(const report of REPORT_TYPES){if(!titleFor(report,l))missing.push(l+':'+report[0]);}for(const key of ['order','dates','tasks','warnings','actions','meta'])if(!I18N[l].headings[key])missing.push(l+':heading:'+key);for(const key of ['brand','generated','timezone','audience','revision','baseline','noFabrication','shareFallback','printFallback'])if(!I18N[l].labels[key])missing.push(l+':label:'+key);}return {ok:missing.length===0,missing}}
  const api={SUPPORTED_LANGUAGES,REPORT_TYPES,I18N,catalogue,buildReportModel,assertLanguageCoverage};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaReports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
