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
    masterTna:['Master TNA','মাস্টার TNA','मास्टर TNA','மாஸ்டர் TNA'],buyerTna:['Buyer TNA','Buyer TNA','Buyer TNA','Buyer TNA'],factoryDailyAction:['Factory Daily Action','ফ্যাক্টরি দৈনিক কাজ','फैक्ट्री दैनिक कार्य','தொழிற்சாலை தினசரி செயல்கள்'],criticalPath:['Critical Path','Critical Path','Critical Path','Critical Path'],weeklyTna:['Weekly TNA','Weekly TNA','Weekly TNA','Weekly TNA'],delayRecovery:['Delay & Recovery','Delay & Recovery','Delay & Recovery','Delay & Recovery'],productionStatus:['Production Status','Production Status','Production Status','Production Status'],materialLc:['Material & LC','Material & LC','Material & LC','Material & LC'],shipmentReadiness:['Shipment Readiness','Shipment Readiness','Shipment Readiness','Shipment Readiness'],portfolioMultiPo:['Portfolio / Multi-PO','Portfolio / Multi-PO','Portfolio / Multi-PO','Portfolio / Multi-PO'],approvalHistory:['Approval History','Approval History','Approval History','Approval History'],scenarioComparison:['Scenario Comparison','Scenario Comparison','Scenario Comparison','Scenario Comparison']
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
  /**
   * Read-only Master TNA business projection for the factory/agent R01 report.
   * Takes a TNA plan and records real task dependencies and entered date facts.
   * Never updates source plans, infers approvals, or exports internal free-text notes.
   * All date differences are civil calendar days; absent inputs stay unknown.
   */
  class TnaMasterReportProjection {
    /** A strict civil-date parser avoiding browser timezone or invalid-day coercion. */
    static day(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
      const epoch=Date.parse(value+'T00:00:00Z');
      return Number.isFinite(epoch)&&new Date(epoch).toISOString().slice(0,10)===value?Math.floor(epoch/86400000):null;
    }

    /** Project every task in stable order, keeping the first confirmed snapshot immutable. */
    static rows(plan={}){
      const tasks=plan.tasks||[],edges=plan.edges||[];
      const frozen=plan.baselineSnapshots?.[0];
      const baselineDates=new Map((frozen?.taskDates||[]).map(item=>[item.taskId,item.dates]));
      const refs=new Map(tasks.map(task=>[task.taskId,task.templateRef||null]));
      return tasks.map(task=>{
        const dates=task.dates||{},original=baselineDates.get(task.taskId);
        const baseline=this.asDate(original?.currentTargetFinish||original?.baselineFinish||null);
        const target=this.asDate(dates.currentTargetFinish);
        const forecast=this.asDate(dates.forecastFinish);
        const actual=this.asDate(dates.actualFinish);
        const anchor=target||baseline,observed=actual||forecast;
        const start=this.day(anchor),end=this.day(observed);
        const dependencies=edges.filter(edge=>edge.successorTaskId===task.taskId).map(edge=>refs.get(edge.predecessorTaskId)||'Needs Information');
        return {stage:task.stage||'Needs Information',ref:task.templateRef||'—',
          activity:task.title||'Needs Information',owner:task.ownerParty||'Needs Information',
          baseline,target,forecast,actual,
          calendarDaysLate:start===null||end===null?null:Math.max(0,end-start),
          comparedTo:actual?'actual':forecast?'forecast':null,
          status:task.status||'needs-information',dependencies:dependencies.join(', ')||'—'};
      });
    }
    /** Empty or invalid source dates remain unknown, never converted to zero. */
    static asDate(value){return this.day(value)===null?null:value;}

  }
  /**
   * Source-only R03 Factory Daily Action projection for internal departments.
   * Access: buildReportModel(plan,{reportId:'R03',generatedAt,timezone,asOfDate}).
   * Inputs are saved task targets, statuses, owners, evidence and recorded notes.
   * Returns grouped read-only rows. No plan mutation, inferred approval, calendar
   * capacity promise, external sharing or new saved-copy schema is permitted.
   * A missing/invalid date or timezone becomes Needs Information, never overdue.
   */
  class TnaFactoryDailyActionProjection {
    /**
     * Determine the report's civil "today" in the stated IANA timezone.
     * An explicit asOfDate is testable/reproducible; malformed input fails closed.
     * Does not mutate dates or silently substitute UTC for an invalid timezone.
     */
    static asOfDate(generatedAt,timezone,override){
      if(override!==undefined){
        return TnaMasterReportProjection.day(override)!==null?override:null;
      }
      const instant=new Date(generatedAt);
      if(!Number.isFinite(instant.getTime())||typeof timezone!=='string')return null;
      try{
        const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(instant);
        const partsByType=Object.fromEntries(parts.map(part=>[part.type,part.value]));
        const date=[partsByType.year,partsByType.month,partsByType.day].join('-');
        return TnaMasterReportProjection.day(date)!==null?date:null;
      }catch{return null;}
    }

    /** One four-language dictionary shared by the R03 screen and Excel export. */
    static labels(language){
      const dictionaries={
        en:{groups:{overdue:'Overdue',today:'Due today',nextSeven:'Next 7 calendar days',needsInformation:'Needs date',later:'Later than 7 days'},
          columns:['Due group','Ref','Activity','Responsible','Due finish','Date source','Calendar days from today','Status','Delay reason','Follow-up note','Evidence refs'],
          source:{'current-target':'Current target','baseline-finish':'Baseline finish',missing:'Needs Information'},
          note:'Daily action uses recorded target finish or baseline finish. Seven days means calendar days, not working days. Completed, approved, waived and not-applicable tasks are excluded.',
          basis:'Calendar-day basis',asOf:'As of',missing:'Needs Information'},
        bn:{groups:{overdue:'সময় পার হয়েছে',today:'আজ শেষ দিন',nextSeven:'পরের ৭ ক্যালেন্ডার দিন',needsInformation:'তারিখ প্রয়োজন',later:'৭ দিনের পরে'},
          columns:['সময়কাল','নং','কার্যক্রম','দায়িত্ব','শেষ তারিখ','তারিখের উৎস','আজ থেকে দিন','অবস্থা','বিলম্বের কারণ','ফলো-আপ মন্তব্য','প্রমাণ সূত্র'],
          source:{'current-target':'বর্তমান লক্ষ্য','baseline-finish':'মূল পরিকল্পনা',missing:'তথ্য প্রয়োজন'},
          note:'নথিভুক্ত লক্ষ্য বা মূল সমাপ্তির তারিখ ব্যবহৃত হয়েছে। পরবর্তী ৭ দিন ক্যালেন্ডার দিন, কর্মদিবস নয়। সম্পন্ন এবং অনুমোদিত কাজ বাদ দেওয়া হয়েছে।',
          basis:'ক্যালেন্ডার দিন',asOf:'তারিখ',missing:'তথ্য প্রয়োজন'},
        hi:{groups:{overdue:'समय से देर',today:'आज देय',nextSeven:'अगले ७ कैलेंडर दिन',needsInformation:'तारीख चाहिए',later:'७ दिनों के बाद'},
          columns:['समूह','क्रम','कार्य','जिम्मेदार','देय समाप्ति','तारीख का स्रोत','आज से दिन','स्थिति','देरी का कारण','फॉलो-अप टिप्पणी','प्रमाण संदर्भ'],
          source:{'current-target':'वर्तमान लक्ष्य','baseline-finish':'मूल योजना',missing:'जानकारी चाहिए'},
          note:'दर्ज लक्ष्य या मूल समाप्ति तारीख ली गई है। अगले ७ दिन कैलेंडर दिन हैं, कार्यदिवस नहीं। पूर्ण और स्वीकृत कार्य शामिल नहीं हैं।',
          basis:'कैलेंडर दिन',asOf:'तारीख',missing:'जानकारी चाहिए'},
        ta:{groups:{overdue:'காலம் கடந்தது',today:'இன்று முடிக்க வேண்டும்',nextSeven:'அடுத்த 7 காலண்டர் நாட்கள்',needsInformation:'தேதி தேவை',later:'7 நாட்களுக்கு பிறகு'},
          columns:['பிரிவு','எண்','செயல்','பொறுப்பு','முடிவு தேதி','தேதி ஆதாரம்','இன்றிலிருந்து நாட்கள்','நிலை','தாமதக் காரணம்','தொடர்ச்சி குறிப்பு','ஆதாரங்கள்'],
          source:{'current-target':'தற்போதைய இலக்கு','baseline-finish':'முதல் திட்டம்',missing:'தகவல் தேவை'},
          note:'பதிவான இலக்கு அல்லது ஆரம்ப முடிவு தேதி மட்டும் பயன்படுத்தப்படுகிறது. அடுத்த 7 நாட்கள் காலண்டர் நாட்கள்; வேலை நாட்கள் அல்ல. முடிந்த, அங்கீகரிக்கப்பட்ட செயல்கள் சேர்க்கப்படவில்லை.',
          basis:'காலண்டர் நாட்கள்',asOf:'தேதி',missing:'தகவல் தேவை'}
      };
      return dictionaries[language]||dictionaries.en;
    }

    /**
     * Map recorded tasks into an as-of calendar action queue.
     * Inputs: plan and explicit report timestamp/timezone; returns a new object.
     * Side effects: none. Invalid dates/timezones and unassigned owners remain
     * visible as missing information. Closed task statuses are counted, not due.
     */
    static build(plan={},options={}){
      const asOfDate=this.asOfDate(options.generatedAt,options.timezone,options.asOfDate);
      const today=TnaMasterReportProjection.day(asOfDate);
      const labels=this.labels(options.language);
      const groups={overdue:[],today:[],nextSeven:[],needsInformation:[],later:[]};
      const closed=new Set(['completed','approved','waived','not-applicable']);
      const events=Array.isArray(plan.revisionEvents)?plan.revisionEvents:[];
      let excludedClosed=0;
      for(const task of plan.tasks||[]){
        if(closed.has(task.status)){excludedClosed++;continue;}
        const hasCurrent=Boolean(task.dates?.currentTargetFinish);
        const hasBaseline=Boolean(task.dates?.baselineFinish);
        const raw=hasCurrent?task.dates.currentTargetFinish:hasBaseline?task.dates.baselineFinish:null;
        const due=TnaMasterReportProjection.asDate(raw);
        const source=hasCurrent?'current-target':hasBaseline?'baseline-finish':'missing';
        const dueDay=TnaMasterReportProjection.day(due);
        const difference=today===null||dueDay===null?null:dueDay-today;
        const bucket=difference===null?'needsInformation':difference<0?'overdue':difference===0?'today':difference<=7?'nextSeven':'later';
        const recorded=events.slice().reverse().find(item=>item.details?.taskId===task.taskId&&typeof item.details.reason==='string'&&item.details.reason.trim());
        const reason=typeof task.delayReason==='string'&&task.delayReason.trim()?task.delayReason.trim():null;
        const note=recorded?.details.reason||null;
        const proofRefs=(Array.isArray(task.proofRefs)?task.proofRefs:[]).filter(ref=>typeof ref==='string'&&ref.trim()).map(ref=>ref.trim());
        groups[bucket].push({bucket,ref:task.templateRef||'—',title:task.title||labels.missing,
          owner:task.ownerParty||labels.missing,status:task.status||labels.missing,
          due,dateSource:source,calendarDaysFromToday:difference,delayReason:reason,
          followupNote:note,proofRefs,stage:task.stage||labels.missing});
      }
      for(const bucket of ['overdue','today','nextSeven','needsInformation','later']){
        groups[bucket].sort((a,b)=>(a.calendarDaysFromToday??0)-(b.calendarDaysFromToday??0));
      }
      const counts=Object.fromEntries(Object.entries(groups).map(([key,rows])=>[key,rows.length]));
      return {schema:'VESA-TNA-DAILY-1',audience:'internal-departments',asOfDate,
        timezone:options.timezone||null,timeBasis:'calendar-days',horizonDays:7,labels,counts,
        totalOpen:Object.values(counts).reduce((sum,count)=>sum+count,0),excludedClosed,groups};
    }

  }

  function taskRows(plan={},limit=Infinity){return (plan.tasks||[]).slice(0,limit).map(task=>({ref:task.templateRef,title:task.title,owner:task.ownerParty,status:task.status,baseline:task.dates?.baselineFinish||'',current:task.dates?.currentTargetFinish||'',forecast:task.dates?.forecastFinish||'',actual:task.dates?.actualFinish||'',risk:task.riskStatus||'needs-information'}))}
  function warnings(plan={}){return [...(plan.unknownFields||[]).map(item=>'Missing: '+item),...(plan.validation?.warnings||[])]}
  function catalogue(language='en'){const l=lang(language);return REPORT_TYPES.map(report=>({id:report[0],title:titleFor(report,l),audience:audienceFor(report,l),scope:report[3]}))}
  function buildReportModel(plan,options={}){const l=lang(options.language);const report=reportType(options.reportId||'R01');const generatedAt=options.generatedAt||new Date().toISOString();const timezone=options.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'local';const daily=report[0]==='R03'?TnaFactoryDailyActionProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:report[0],title:titleFor(report,l),language:l,languageName:I18N[l].languageName,audience:audienceFor(report,l),generatedAt,generatedLabel:formatDateTime(generatedAt,l),timezone,revision:plan?.revision??0,baselineSnapshots:(plan?.baselineSnapshots||[]).length,headings:I18N[l].headings,labels:I18N[l].labels,order:orderContext(plan),tasks:taskRows(plan),...(report[0]==='R01'?{masterTna:{schema:'VESA-TNA-MASTER-1',rows:TnaMasterReportProjection.rows(plan)}}:{}),...(daily?{factoryDailyAction:daily}:{}),warnings:warnings(plan),notes:[I18N[l].labels.noFabrication,I18N[l].labels.printFallback,I18N[l].labels.shareFallback],source:{recordId:plan?.recordId||null,schemaVersion:plan?.schemaVersion||null,mode:plan?.mode||'unknown'}}}
  function assertLanguageCoverage(){const missing=[];for(const l of SUPPORTED_LANGUAGES){for(const report of REPORT_TYPES){if(!titleFor(report,l))missing.push(l+':'+report[0]);}for(const key of ['order','dates','tasks','warnings','actions','meta'])if(!I18N[l].headings[key])missing.push(l+':heading:'+key);for(const key of ['brand','generated','timezone','audience','revision','baseline','noFabrication','shareFallback','printFallback'])if(!I18N[l].labels[key])missing.push(l+':label:'+key);}return {ok:missing.length===0,missing}}
  const api={SUPPORTED_LANGUAGES,REPORT_TYPES,I18N,catalogue,buildReportModel,assertLanguageCoverage};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaReports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
