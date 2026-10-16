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
    masterTna:['Master TNA','মাস্টার TNA','मास्टर TNA','மாஸ்டர் TNA'],buyerTna:['Buyer TNA','ক্রেতার TNA','खरीदार TNA','Buyer TNA — வாங்குபவர் திட்டம்'],factoryDailyAction:['Factory Daily Action','ফ্যাক্টরি দৈনিক কাজ','फैक्ट्री दैनिक कार्य','தொழிற்சாலை தினசரி செயல்கள்'],criticalPath:['Critical Path','ক্রিটিকাল পাথ','क्रिटिकल पाथ','முக்கிய செயல்பாதை'],weeklyTna:['Weekly TNA','সাপ্তাহিক TNA','साप्ताहिक TNA','வாராந்திர TNA'],delayRecovery:['Delay & Recovery','Delay & Recovery','Delay & Recovery','Delay & Recovery'],productionStatus:['Production Status','Production Status','Production Status','Production Status'],materialLc:['Material & LC','Material & LC','Material & LC','Material & LC'],shipmentReadiness:['Shipment Readiness','Shipment Readiness','Shipment Readiness','Shipment Readiness'],portfolioMultiPo:['Portfolio / Multi-PO','Portfolio / Multi-PO','Portfolio / Multi-PO','Portfolio / Multi-PO'],approvalHistory:['Approval History','Approval History','Approval History','Approval History'],scenarioComparison:['Scenario Comparison','Scenario Comparison','Scenario Comparison','Scenario Comparison']
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
   * Pure, explicit buyer R02 disclosure boundary.
   * Access only through buildReportModel(...,{reportId:'R02'}), never from raw
   * saved copies. Inputs: existing milestone reference/status and typed dates.
   * Outputs: allowlisted buyer-facing milestone data with safe explanations.
   * Does not mutate records, reveal internal owners/free text/evidence IDs,
   * grant external verification or authorize transmission to any recipient.
   */
  class TnaBuyerMilestoneProjection {
    /**
     * Frozen allowlist of public garment milestones, matched by stable template
     * reference, not editable task title, owner or internal note. Context-specific
     * tasks appear only if already present in the selected garment template.
     * Tuple: reference, buyer-decision flag, EN, BN, HI, TA.
     */
    static definitions(){
      return [
        ['O05',false,'Purchase order received','ক্রয় আদেশ পাওয়া','खरीद आदेश प्राप्त','கொள்முதல் ஆணை பெறப்பட்டது'],
        ['O11',true,'Required delivery date review','নির্ধারিত ডেলিভারি তারিখ পর্যালোচনা','आवश्यक डिलीवरी तारीख समीक्षा','தேவையான டெலிவரி தேதி பரிசீலனை'],
        ['D03',false,'First sample submitted','প্রথম নমুনা জমা','पहला नमूना जमा','முதல் மாதிரி சமர்ப்பிப்பு'],
        ['D04',true,'First sample comments','প্রথম নমুনার মন্তব্য','पहले नमूने की टिप्पणी','முதல் மாதிரி கருத்து'],
        ['D05',false,'Fit sample submitted','ফিট নমুনা জমা','फिट नमूना जमा','ஃபிட் மாதிரி சமர்ப்பிப்பு'],
        ['D06',true,'Fit sample comments','ফিট নমুনার মন্তব্য','फिट नमूने की टिप्पणी','ஃபிட் மாதிரி கருத்து'],
        ['D08',true,'Fit approval','ফিট অনুমোদন','फिट अनुमोदन','ஃபிட் ஒப்புதல்'],
        ['D10',false,'Size-set submitted','সাইজ সেট জমা','साइज सेट जमा','சைஸ் செட் சமர்ப்பிப்பு'],
        ['D11',true,'Size-set response','সাইজ সেটের উত্তর','साइज सेट पर जवाब','சைஸ் செட் பதில்'],
        ['D13',false,'Pre-production sample submitted','পিপি নমুনা জমা','पीपी नमूना जमा','PP மாதிரி சமர்ப்பிப்பு'],
        ['D14',true,'Pre-production sample approval','পিপি নমুনার অনুমোদন','पीपी नमूना अनुमोदन','PP மாதிரி ஒப்புதல்'],
        ['D15',false,'Packaging artwork submitted','প্যাকেজিং নকশা জমা','पैकेजिंग डिजाइन जमा','பேக்கிங் ஆர்ட்வொர்க் சமர்ப்பிப்பு'],
        ['D16',true,'Packaging artwork approval','প্যাকেজিং নকশার অনুমোদন','पैकेजिंग डिजाइन अनुमोदन','பேக்கிங் ஆர்ட்வொர்க் ஒப்புதல்'],
        ['D17',false,'Print/embroidery strike-off submitted','প্রিন্ট/এমব্রয়ডারি স্ট্রাইক-অফ জমা','प्रिंट/कढ़ाई स्ट्राइक-ऑफ जमा','பிரிண்ட்/எம்பிராய்டரி மாதிரி சமர்ப்பிப்பு'],
        ['D18',true,'Print/embroidery approval','প্রিন্ট/এমব্রয়ডারি অনুমোদন','प्रिंट/कढ़ाई अनुमोदन','பிரிண்ட்/எம்பிராய்டரி ஒப்புதல்'],
        ['D19',false,'Wash standard submitted','ওয়াশ মানদণ্ড জমা','वॉश मानक जमा','வாஷ் தர மாதிரி சமர்ப்பிப்பு'],
        ['D20',true,'Wash standard approval','ওয়াশ মানদণ্ড অনুমোদন','वॉश मानक अनुमोदन','வாஷ் தர ஒப்புதல்'],
        ['FA03',false,'Lab dip submitted','ল্যাব ডিপ জমা','लैब डिप जमा','லேப் டிப் சமர்ப்பிப்பு'],
        ['FA04',true,'Lab dip comments','ল্যাব ডিপের মন্তব্য','लैब डिप की टिप्पणी','லேப் டிப் கருத்து'],
        ['FA05',true,'Lab dip approval','ল্যাব ডিপ অনুমোদন','लैब डिप अनुमोदन','லேப் டிப் ஒப்புதல்'],
        ['FA09',true,'Print/AOP color approval','প্রিন্ট/AOP রঙ অনুমোদন','प्रिंट/AOP रंग अनुमोदन','பிரிண்ட்/AOP நிற ஒப்புதல்'],
        ['TR02',true,'Label/artwork text confirmation','লেবেল/নকশা লেখা নিশ্চিতকরণ','लेबल/डिजाइन पाठ पुष्टि','லேபிள்/ஆர்ட்வொர்க் எழுத்து உறுதி'],
        ['TR04',true,'Trims approval','ট্রিম অনুমোদন','ट्रिम अनुमोदन','டிரிம்ஸ் ஒப்புதல்'],
        ['Q06',false,'Final inspection booked','চূড়ান্ত পরিদর্শন বুকিং','अंतिम निरीक्षण बुकिंग','இறுதி ஆய்வு முன்பதிவு'],
        ['Q08',false,'Final inspection decision recorded','চূড়ান্ত পরিদর্শনের সিদ্ধান্ত নথিভুক্ত','अंतिम निरीक्षण निर्णय दर्ज','இறுதி ஆய்வு முடிவு பதிவு'],
        ['PK04',false,'Packing completed','প্যাকিং সম্পন্ন','पैकिंग पूरी','பேக்கிங் நிறைவு'],
        ['S04',false,'Ex-factory handover','কারখানা থেকে পণ্য হস্তান্তর','एक्स-फैक्ट्री हैंडओवर','தொழிற்சாலையிலிருந்து சரக்கு ஒப்படைப்பு'],
        ['S06',false,'Departure (ETD)','যাত্রা (ETD)','प्रस्थान (ETD)','புறப்பாடு (ETD)'],
        ['S07',false,'Destination arrival (ETA)','গন্তব্যে আগমন (ETA)','गंतव्य आगमन (ETA)','சேரும் தேதி (ETA)']
      ];
    }


    /**
     * Only public report copy is localized. Buyer-entered order identifiers are
     * never translated; confidential free-text reasons are not projected at all.
     */
    static labels(language){
      const words={
        en:{unknown:'Needs Information',notShared:'Not included in buyer report',title:'Buyer TNA — reviewed milestones',
          cols:['Ref','Buyer milestone','Original plan','Current target','Forecast','Actual','Recorded status','Buyer response','Schedule explanation','Target verification'],
          planned:'Buyer review planned; no submission confirmed',requested:'Buyer response requested in local record; confirm request',
          recorded:'Buyer decision recorded locally; independently unverified',clarify:'Buyer clarification may be needed; confirm directly',
          noAction:'Milestone update; no buyer decision recorded',unverified:'Buyer confirmation not independently verified',shortVerification:'Not verified',missingLegend:'— means the date is not entered; all verification is pending independent confirmation.',
          noTarget:'Target date not entered',noForecast:'Forecast not entered',same:'Forecast equals entered target',later:'Forecast later than entered target by',earlier:'Forecast earlier than entered target by',days:'calendar days',
          required:'Required ex-factory as locally entered',headline:'Milestone status is locally recorded, not a buyer decision',
          review:'Review buyer identity, dates and authorized recipient before manually sending; this report does not authorize access or confirm approvals.',
          gapTarget:'Buyer-required ex-factory date is missing or invalid',gapForecast:'Ex-factory forecast was not entered',gapApproval:'No independently verified buyer target or approval supplied',
          gapMilestones:'Some buyer milestones have no recorded target/forecast',none:'No buyer milestones in this order'},
        bn:{unknown:'তথ্য প্রয়োজন',notShared:'Buyer রিপোর্টে অন্তর্ভুক্ত নয়',title:'Buyer TNA — পর্যালোচিত মাইলস্টোন',
          cols:['নং','ক্রেতার মাইলস্টোন','প্রথম পরিকল্পনা','বর্তমান লক্ষ্য','পূর্বাভাস','বাস্তব','নথিভুক্ত অবস্থা','ক্রেতার উত্তর','সময়ের ব্যাখ্যা','লক্ষ্য যাচাই'],
          planned:'ক্রেতার পর্যালোচনা পরিকল্পিত; জমা নিশ্চিত নয়',requested:'স্থানীয় রেকর্ডে উত্তর চাওয়া হয়েছে; ক্রেতার সঙ্গে যাচাই করুন',
          recorded:'সিদ্ধান্ত স্থানীয়ভাবে লেখা; স্বাধীনভাবে যাচাই হয়নি',clarify:'ক্রেতার ব্যাখ্যা প্রয়োজন হতে পারে; সরাসরি নিশ্চিত করুন',
          noAction:'অগ্রগতির তথ্য; ক্রেতার সিদ্ধান্ত নেই',unverified:'ক্রেতার নিশ্চিতকরণ স্বাধীনভাবে যাচাই হয়নি',shortVerification:'যাচাই হয়নি',missingLegend:'— মানে তারিখ দেওয়া হয়নি; স্বাধীন যাচাই বাকি।',
          noTarget:'লক্ষ্য তারিখ দেওয়া হয়নি',noForecast:'পূর্বাভাস দেওয়া হয়নি',same:'পূর্বাভাস ও লক্ষ্য এক',later:'লক্ষ্যের পরে পূর্বাভাস',earlier:'লক্ষ্যের আগে পূর্বাভাস',days:'ক্যালেন্ডার দিন',
          required:'স্থানীয়ভাবে লেখা এক্স-ফ্যাক্টরি তারিখ',headline:'স্থানীয় অগ্রগতি তথ্য ক্রেতার সিদ্ধান্ত নয়',
          review:'পাঠানোর আগে ক্রেতা, তারিখ এবং অনুমোদিত প্রাপক যাচাই করুন; রিপোর্ট অনুমোদন বা প্রবেশাধিকার দেয় না।',
          gapTarget:'প্রয়োজনীয় এক্স-ফ্যাক্টরি তারিখ নেই বা ভুল',gapForecast:'এক্স-ফ্যাক্টরি পূর্বাভাস দেওয়া হয়নি',gapApproval:'ক্রেতার অনুমোদিত লক্ষ্য/সিদ্ধান্তের স্বাধীন প্রমাণ নেই',
          gapMilestones:'কিছু মাইলস্টোনের লক্ষ্য/পূর্বাভাস নেই',none:'এই অর্ডারে ক্রেতার মাইলস্টোন নেই'},
        hi:{unknown:'जानकारी चाहिए',notShared:'खरीदार रिपोर्ट में शामिल नहीं',title:'Buyer TNA — जाँचे गए माइलस्टोन',
          cols:['क्रम','खरीदार माइलस्टोन','मूल योजना','वर्तमान लक्ष्य','पूर्वानुमान','वास्तविक','दर्ज स्थिति','खरीदार जवाब','समय का विवरण','लक्ष्य सत्यापन'],
          planned:'खरीदार समीक्षा नियोजित; जमा करने की पुष्टि नहीं',requested:'स्थानीय रिकॉर्ड में जवाब अपेक्षित; खरीदार से पुष्टि करें',
          recorded:'फैसला स्थानीय रूप से दर्ज; स्वतंत्र पुष्टि नहीं',clarify:'खरीदार से स्पष्टीकरण सीधे लें',
          noAction:'प्रगति सूचना; खरीदार का फैसला दर्ज नहीं',unverified:'खरीदार की मंजूरी का स्वतंत्र सत्यापन नहीं',shortVerification:'पुष्टि बाकी',missingLegend:'— का अर्थ तारीख दर्ज नहीं है; स्वतंत्र पुष्टि बाकी है।',
          noTarget:'लक्ष्य तारीख नहीं दी गई',noForecast:'पूर्वानुमान नहीं दिया गया',same:'पूर्वानुमान और लक्ष्य समान',later:'लक्ष्य से देरी का पूर्वानुमान',earlier:'लक्ष्य से पहले का पूर्वानुमान',days:'कैलेंडर दिन',
          required:'स्थानीय रिकॉर्ड में आवश्यक एक्स-फैक्ट्री तारीख',headline:'स्थानीय दर्ज स्थिति खरीदार की मंजूरी नहीं है',
          review:'भेजने से पहले खरीदार, तारीख और स्वीकृत प्राप्तकर्ता जाँचें; रिपोर्ट अनुमति या मंजूरी नहीं देती।',
          gapTarget:'आवश्यक एक्स-फैक्ट्री तारीख अनुपलब्ध/गलत',gapForecast:'एक्स-फैक्ट्री पूर्वानुमान नहीं दिया गया',gapApproval:'खरीदार लक्ष्य/मंजूरी का स्वतंत्र प्रमाण नहीं है',
          gapMilestones:'कुछ माइलस्टोन में लक्ष्य/पूर्वानुमान नहीं है',none:'इस ऑर्डर में खरीदार माइलस्टोन नहीं है'},
        ta:{unknown:'தகவல் தேவை',notShared:'Buyer அறிக்கையில் சேர்க்கப்படவில்லை',title:'Buyer TNA — சரிபார்க்க வேண்டிய மைல்ஸ்டோன்கள்',
          cols:['எண்','Buyer மைல்ஸ்டோன்','முதல் திட்டம்','தற்போதைய இலக்கு','எதிர்பார்ப்பு','நிகழ்ந்தது','பதிந்த நிலை','Buyer பதில்','தேதி விளக்கம்','இலக்கு உறுதி'],
          planned:'Buyer பரிசீலனை திட்டமிடப்பட்டது; அனுப்பியது உறுதியாகவில்லை',requested:'உள்ளூர் பதிவில் Buyer பதில் எதிர்பார்க்கப்படுகிறது; உறுதிசெய்க',
          recorded:'முடிவு உள்ளூரில் பதிந்துள்ளது; சுயாதீன உறுதி இல்லை',clarify:'Buyer விளக்கம் தேவைப்படலாம்; நேரடியாக உறுதிசெய்க',
          noAction:'முன்னேற்ற தகவல்; Buyer முடிவு பதியப்படவில்லை',unverified:'Buyer ஒப்புதல் சுயாதீனமாக உறுதிசெய்யப்படவில்லை',shortVerification:'உறுதி இல்லை',missingLegend:'— என்பது தேதி பதியப்படவில்லை; சுயாதீன உறுதி இன்னும் தேவை.',
          noTarget:'இலக்கு தேதி பதியப்படவில்லை',noForecast:'எதிர்பார்க்கும் தேதி பதியப்படவில்லை',same:'இலக்கும் எதிர்பார்ப்பும் ஒரே தேதி',later:'இலக்குக்குப் பின் எதிர்பார்ப்பு',earlier:'இலக்குக்கு முன் எதிர்பார்ப்பு',days:'காலண்டர் நாட்கள்',
          required:'உள்ளூர் பதிவில் உள்ள எக்ஸ்-ஃபேக்டரி தேதி',headline:'உள்ளூரில் பதிந்த நிலை Buyer ஒப்புதல் அல்ல',
          review:'அனுப்புவதற்கு முன் Buyer, தேதிகள் மற்றும் அனுமதிக்கப்பட்ட பெறுநரைச் சரிபார்க்கவும்; இந்த அறிக்கை அணுகல்/ஒப்புதல் அனுமதி வழங்காது.',
          gapTarget:'தேவையான எக்ஸ்-ஃபேக்டரி தேதி இல்லை அல்லது தவறு',gapForecast:'எக்ஸ்-ஃபேக்டரி எதிர்பார்ப்பு தேதி இல்லை',gapApproval:'Buyer இலக்கு அல்லது ஒப்புதலின் சுயாதீன ஆதாரம் இல்லை',
          gapMilestones:'சில மைல்ஸ்டோன்களுக்கு இலக்கு/எதிர்பார்ப்பு தேதி இல்லை',none:'இந்த ஆர்டரில் Buyer மைல்ஸ்டோன்கள் இல்லை'}
      };
      return words[language]||words.en;
    }


    /** Status values are deliberately described as local records, not buyer decisions. */
    static statusLabel(status,language,words){
      const states={
        en:{'not-started':'Not started in local record','in-progress':'In progress (locally recorded)',
          submitted:'Submitted (locally recorded)','awaiting-approval':'Response pending (locally recorded)',
          rejected:'Rejection recorded locally',blocked:'Blocked (locally recorded)',
          completed:'Completed (locally recorded)',waived:'Waiver recorded locally',
          'not-applicable':'Not applicable (locally recorded)'},
        bn:{'not-started':'স্থানীয় নথিতে শুরু হয়নি','in-progress':'চলছে (স্থানীয় নথি)',
          submitted:'জমা হয়েছে (স্থানীয় নথি)','awaiting-approval':'উত্তর বাকি (স্থানীয় নথি)',
          rejected:'প্রত্যাখ্যান স্থানীয় নথিতে',blocked:'আটকে আছে (স্থানীয় নথি)',
          completed:'সম্পন্ন (স্থানীয় নথি)',waived:'ছাড় (স্থানীয় নথি)',
          'not-applicable':'প্রযোজ্য নয় (স্থানীয় নথি)'},
        hi:{'not-started':'स्थानीय रिकॉर्ड में शुरू नहीं','in-progress':'कार्य जारी (स्थानीय रिकॉर्ड)',
          submitted:'जमा दर्ज (स्थानीय रिकॉर्ड)','awaiting-approval':'जवाब लंबित (स्थानीय रिकॉर्ड)',
          rejected:'अस्वीकृति स्थानीय रिकॉर्ड में',blocked:'रुका हुआ (स्थानीय रिकॉर्ड)',
          completed:'पूरा दर्ज (स्थानीय रिकॉर्ड)',waived:'छूट स्थानीय रिकॉर्ड में',
          'not-applicable':'लागू नहीं (स्थानीय रिकॉर्ड)'},
        ta:{'not-started':'உள்ளூர் பதிவில் தொடங்கவில்லை','in-progress':'நடைபெறுகிறது (உள்ளூர் பதிவு)',
          submitted:'சமர்ப்பிப்பு பதிவானது','awaiting-approval':'பதில் நிலுவையில் உள்ளது (உள்ளூர் பதிவு)',
          rejected:'நிராகரிப்பு உள்ளூரில் பதிந்துள்ளது',blocked:'தடைப்பட்டது (உள்ளூர் பதிவு)',
          completed:'நிறைவடைந்தது (உள்ளூர் பதிவு)',waived:'விலக்கு உள்ளூரில் பதிந்துள்ளது',
          'not-applicable':'பொருந்தாது (உள்ளூர் பதிவு)'}
      };
      return status==='approved'?words.recorded:(states[language]||states.en)[status]||words.unknown;
    }

    /** Exactly one locally recorded buyer action: never assert an actual request was delivered. */
    static action(status,isBuyerDecision,words){
      if(!isBuyerDecision)return words.noAction;
      if(status==='submitted'||status==='awaiting-approval')return words.requested;
      if(status==='approved'||status==='waived')return words.recorded;
      if(status==='rejected'||status==='blocked')return words.clarify;
      return words.planned;
    }

    /** Difference is civil-calendar days, never manufacturing working-day claims. */
    static comparison(target,forecast,words){
      if(!target)return words.noTarget;
      if(!forecast)return words.noForecast;
      const offset=TnaMasterReportProjection.day(forecast)-TnaMasterReportProjection.day(target);
      if(offset===0)return words.same;
      return (offset>0?words.later:words.earlier)+' '+Math.abs(offset)+' '+words.days;
    }

    /**
     * Allowlist-bounded R02 projection, containing no arbitrary factory notes,
     * customer/supplier prices, saved record IDs, approval proof strings or
     * unreviewed validation warnings. No recipient authorization is inferred.
     * Output is deterministic given the same saved plan and language.
     */
    static build(plan={},language='en'){
      const words=TnaBuyerMilestoneProjection.labels(language),index=langIndex[language]??0;
      const allowed=new Map(TnaBuyerMilestoneProjection.definitions().map(item=>[item[0],item]));
      const snapshots=Array.isArray(plan.baselineSnapshots)?plan.baselineSnapshots:[];
      const first=snapshots[0]||null;
      const datesByTask=new Map((Array.isArray(first?.taskDates)?first.taskDates:[]).map(item=>[item.taskId,item.dates||{}]));
      const rows=[];
      for(const task of plan.tasks||[]){
        const definition=allowed.get(task.templateRef);
        if(!definition||!['milestone','gate'].includes(task.taskKind))continue;
        const previous=datesByTask.get(task.taskId)||{};
        const original=TnaMasterReportProjection.asDate(previous.currentTargetFinish||previous.baselineFinish);
        const target=TnaMasterReportProjection.asDate(task.dates?.currentTargetFinish);
        const forecast=TnaMasterReportProjection.asDate(task.dates?.forecastFinish);
        const completed=task.status==='completed';
        const actual=completed?TnaMasterReportProjection.asDate(task.dates?.actualFinish):null;
        const status=typeof task.status==='string'?task.status:'not-started';
        const buyerAction=TnaBuyerMilestoneProjection.action(status,definition[1],words);
        rows.push({
          ref:definition[0],title:definition[index+2],original,target,forecast,actual,
          statusLabel:TnaBuyerMilestoneProjection.statusLabel(status,language,words),
          buyerAction,explanation:TnaBuyerMilestoneProjection.comparison(target,forecast,words),
          targetVerification:words.shortVerification,
          actionPending:Boolean(definition[1]&&['submitted','awaiting-approval','rejected','blocked'].includes(status))
        });
      }
      const request=TnaMasterReportProjection.asDate(plan.commitments?.buyerRequiredExFactory);
      const shipment=rows.find(item=>item.ref==='S04');
      const forecastExFactory=shipment?.forecast||null;
      const actualExFactory=shipment?.actual||null;
      const publicWarnings=[words.gapApproval];
      if(!request)publicWarnings.push(words.gapTarget);
      if(!forecastExFactory)publicWarnings.push(words.gapForecast);
      if(rows.some(item=>!item.target||!item.forecast))publicWarnings.push(words.gapMilestones);
      if(rows.length===0)publicWarnings.push(words.none);
      const rawQuantity=plan.order?.totalQty;
      const quantity=Number.isSafeInteger(rawQuantity)&&rawQuantity>0?rawQuantity:words.unknown;
      const order={
        buyer:typeof plan.order?.buyerName==='string'&&plan.order.buyerName.trim()?plan.order.buyerName:words.unknown,
        factory:words.notShared,
        style:typeof plan.order?.styles?.[0]?.styleNo==='string'&&plan.order.styles[0].styleNo.trim()?plan.order.styles[0].styleNo:words.unknown,
        po:typeof plan.order?.poNumbers?.[0]==='string'&&plan.order.poNumbers[0].trim()?plan.order.poNumbers[0]:words.unknown,
        quantity,unit:plan.order?.unit==='sets'?'sets':'pcs',
        requiredExFactory:request||words.unknown
      };
      return {schema:'VESA-TNA-BUYER-1',audience:'buyer-preview-needs-recipient-review',
        labels:words,order,rows,requiredActions:rows.filter(row=>row.actionPending).map(row=>({
          ref:row.ref,title:row.title,action:row.buyerAction
        })),forecastExFactory,actualExFactory,
        verifiedTarget:null,targetVerification:words.unverified,
        targetDateSource:words.required,
        warnings:publicWarnings,
        notice:words.review,
        locallyRecorded:words.headline};
    }


    /**
     * Build the complete R02 export model by allowlist rather than stripping
     * unsafe fields from the unrestricted general model afterwards. Internal
     * record IDs, factory name, raw warnings, notes, owners and evidence are
     * never assigned to this model, even for JSON Download Report.
     */
    static report(plan,report,language,generatedAt,timezone){
      const buyer=TnaBuyerMilestoneProjection.build(plan,language);
      const shared=I18N[language],tasks=buyer.rows.map(row=>({
        ref:row.ref,title:row.title,owner:row.actionPending?'Buyer review':'Milestone update',
        status:row.statusLabel,baseline:row.original||'',current:row.target||'',
        forecast:row.forecast||'',actual:row.actual||'',risk:buyer.labels.unverified
      }));
      return {
        schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:'R02',
        title:titleFor(report,language),language,languageName:shared.languageName,
        audience:audienceFor(report,language),generatedAt,
        generatedLabel:formatDateTime(generatedAt,language),timezone,
        revision:plan?.revision??0,baselineSnapshots:Array.isArray(plan?.baselineSnapshots)?plan.baselineSnapshots.length:0,
        headings:shared.headings,labels:shared.labels,order:buyer.order,tasks,
        buyerTna:buyer,warnings:buyer.warnings.slice(),
        notes:[shared.labels.noFabrication,buyer.notice,shared.labels.printFallback,shared.labels.shareFallback],
        source:{recordId:null,schemaVersion:null,mode:'buyer-review-export'}
      };
    }
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

  /**
   * Owns the MANAGEMENT-ONLY R04 Critical Path projection, using the frozen
   * VesaTnaScheduling engine verbatim. Access: buildReportModel(...,{reportId:'R04'}).
   * Does not mutate orders, infer working-week/holiday inputs or promise delivery.
   * It fails closed if any used factory calendar is not explicitly user-confirmed,
   * if the project dates are absent/invalid, or if graph/duration proof is missing.
   * Local user calendar confirmation is not independently verified factory evidence.
   */
  class TnaCriticalPathProjection {
    /** Localized human-facing headings; source references and entered values remain unmodified. */
    static labels(language){
      const words={
        en:{unknown:'Needs Information',title:'Critical Path — planning calculation',missing:'Required scheduling inputs are missing or invalid.',
          noZero:'No zero or negative float controlling chain under this deadline.',noViolations:'No required-date violation in this dependency and calendar model.',asOf:'Scheduling start',required:'Required ex-factory',forecast:'Calculated finish',buffer:'Working-day difference (+late / −early)',
          paths:'Controlling task chains (zero/negative float)',violations:'Required-date conflicts',
          note:'A planning calculation based on locally entered calendar and task durations, not a buyer-approved delivery promise. Production capacity and approval release require separate evidence.',
          labels:['Ref / Stage','Activity','Responsible','Early start','Early finish','Late finish','Total float','Free float','Critical','Status','Duration basis','Predecessors']},
        bn:{unknown:'তথ্য প্রয়োজন',title:'ক্রিটিকাল পাথ — পরিকল্পনার হিসাব',missing:'সময়সূচির প্রয়োজনীয় তথ্য পাওয়া যায়নি।',
          noZero:'এই নির্ধারিত তারিখে শূন্য বা ঋণাত্মক ফ্লোটের কাজ নেই।',noViolations:'লেখা সময়সূচিতে প্রয়োজনীয় তারিখের বাধা নেই।',asOf:'পরিকল্পনা শুরু',required:'প্রয়োজনীয় এক্স-ফ্যাক্টরি',forecast:'হিসাবের সমাপ্তি',buffer:'কর্মদিবসের পার্থক্য (+দেরি / −আগে)',
          paths:'নিয়ন্ত্রণকারী কার্যক্রম',violations:'ডেলিভারি তারিখের বাধা',
          note:'স্থানীয়ভাবে লেখা ক্যালেন্ডার ও কাজের সময় দিয়ে হিসাব। ক্রেতার অনুমোদিত ডেলিভারি প্রতিশ্রুতি নয়।',
          labels:['নং / ধাপ','কার্যক্রম','দায়িত্ব','শুরু','শেষ','শেষ সীমা','মোট ফ্লোট','ফ্রি ফ্লোট','গুরুত্বপূর্ণ','অবস্থা','সময় ভিত্তি','আগের কাজ']},
        hi:{unknown:'जानकारी चाहिए',title:'क्रिटिकल पाथ — योजना गणना',missing:'शेड्यूल बनाने के लिए जरूरी जानकारी नहीं है।',
          noZero:'इस तारीख के लिए शून्य या ऋणात्मक फ्लोट श्रृंखला नहीं है।',noViolations:'दर्ज शेड्यूल में आवश्यक तारीख की बाधा नहीं है।',asOf:'योजना शुरू',required:'आवश्यक एक्स-फैक्ट्री',forecast:'गणना की समाप्ति',buffer:'कार्यदिवस अंतर (+देरी / −पहले)',
          paths:'समय नियंत्रित करने वाली कार्य श्रृंखला',violations:'आवश्यक तारीख की बाधाएं',
          note:'स्थानीय कैलेंडर और कार्य अवधि से गणना; खरीदार की मंजूर डिलीवरी गारंटी नहीं।',
          labels:['क्रम / चरण','कार्य','जिम्मेदार','जल्दी शुरू','जल्दी समाप्ति','अंतिम समाप्ति','कुल फ्लोट','मुक्त फ्लोट','महत्वपूर्ण','स्थिति','अवधि आधार','पिछला कार्य']},
        ta:{unknown:'தகவல் தேவை',title:'முக்கிய செயல்பாதை — திட்டக் கணக்கு',missing:'கணக்கிடத் தேவையான வேலைநாள் அல்லது தேதி தகவல் இல்லை.',
          noZero:'இந்த முடிவுத் தேதியில் பூஜ்ஜியம் / எதிர்மறை மிதவை செயல்தொடர் இல்லை.',noViolations:'பதிந்த திட்டத்தில் தேதியை மீறும் முரண்பாடு இல்லை.',asOf:'திட்டத் தொடக்கம்',required:'தேவையான எக்ஸ்-ஃபேக்டரி',forecast:'கணிக்கப்பட்ட முடிவு',buffer:'வேலைநாள் வித்தியாசம் (+தாமதம் / −முன்னதாக)',
          paths:'முடிவை நிர்ணயிக்கும் செயல்தொடர்',violations:'தேதி முரண்பாடுகள்',
          note:'உள்ளூரில் பதிந்த calendar மற்றும் task duration அடிப்படையிலான திட்டக் கணக்கு; buyer ஒப்புதல் பெற்ற delivery உறுதி அல்ல.',
          labels:['எண் / நிலை','செயல்','பொறுப்பு','முன் தொடக்கம்','முன் முடிவு','கடைசி முடிவு','மொத்த மிதவை','இடைவெளி மிதவை','முக்கியம்','நிலை','கால அளவு','முந்தைய செயல்']}
      };
      return words[language]||words.en;
    }

    /** A factory calendar must be explicitly sourced; synthetic fallbacks are prohibited. */
    static checkedCalendar(calendar){
      if(!calendar||calendar.source!=='user-confirmed'||!String(calendar.sourceReference||'').trim())return false;
      const week=calendar.workingWeek;
      if(!Array.isArray(week)||!week.length||new Set(week).size!==week.length||
        week.some(day=>!Number.isInteger(day)||day<0||day>6))return false;
      if(typeof calendar.timezone!=='string'||!calendar.timezone.trim())return false;
      if(!Array.isArray(calendar.holidays)||!Array.isArray(calendar.shutdowns))return false;
      try{new Intl.DateTimeFormat('en-US',{timeZone:calendar.timezone});}
      catch{return false;}
      const dates=[...(calendar.holidays||[]),...(calendar.shutdowns||[])];
      return dates.every(day=>TnaMasterReportProjection.day(day)!==null);
    }

    /** Build a read-only management summary from the real engine, never an estimated fallback. */
    static build(plan={},options={}){
      const words=TnaCriticalPathProjection.labels(options.language);
      const missing=[],errors=[],tasks=Array.isArray(plan.tasks)?plan.tasks:[];
      const engine=root.VesaTnaScheduling||(typeof require==='function'?require('./scheduling.js'):null);
      const startCandidates=[['orderConfirmedOn','Order confirmed'],['poReceivedOn','PO received']];
      const startItem=startCandidates.find(([key])=>Boolean(plan.commitments?.[key]));
      const startDate=startItem?plan.commitments[startItem[0]]:null;
      const requiredDate=plan.commitments?.buyerRequiredExFactory||null;
      if(!startItem||TnaMasterReportProjection.day(startDate)===null)missing.push('Valid order confirmed / PO received start date');
      if(TnaMasterReportProjection.day(requiredDate)===null)missing.push('Valid buyer-required ex-factory date');
      if(!tasks.length)missing.push('Garment TNA activities');
      if(!Array.isArray(plan.edges))missing.push('Task dependency graph');
      const calendars=Array.isArray(plan.calendars)?plan.calendars:[];
      const usedIds=[...new Set(['default',...tasks.map(task=>task.calendarId||'default')])];
      for(const task of tasks){
        if(task.durationUnits===null||task.durationUnits===''||!Number.isFinite(Number(task.durationUnits))||Number(task.durationUnits)<0||!['working','calendar'].includes(task.durationBasis))missing.push('Valid duration and date basis for '+(task.templateRef||task.taskId));
      }
      for(const id of usedIds){
        const calendar=calendars.find(item=>item.calendarId===id);
        if(!TnaCriticalPathProjection.checkedCalendar(calendar))missing.push('User-confirmed working calendar for '+id);
      }
      if(!engine?.schedule)missing.push('Existing VESA scheduling engine');
      const empty={schema:'VESA-TNA-CPM-1',audience:'management',validity:'incomplete',
        planningStart:startDate,startSource:startItem?.[1]||null,requiredDate,forecastDate:null,
        workingDaysEarlyOrLate:null,criticalPaths:[],rows:[],constraintViolations:[],
        missingInputs:missing,errors,engineVersion:engine?.ENGINE_VERSION||null,labels:words,
        calendarSource:'local user-entered / not independently verified'};
      if(missing.length)return empty;
      let calculated;
      try{
        const primary=calendars.find(item=>item.calendarId==='default')||calendars[0];
        calculated=engine.schedule(tasks,plan.edges,{
          calendar:primary,calendars,startDate,requiredDate,nearCriticalDays:0
        });
      }catch(error){
        return {...empty,validity:'invalid',errors:[String(error?.message||'Scheduling calculation failed.')]};
      }
      if(calculated.validity!=='valid'){
        return {...empty,validity:calculated.validity,missingInputs:[...missing,...(calculated.missingInputs||[])],
          errors:calculated.errors||[],engineVersion:calculated.engineVersion||empty.engineVersion};
      }
      const refs=new Map(tasks.map(task=>[task.taskId,task.templateRef||'Needs Information']));
      const rows=tasks.map(task=>{
        const result=calculated.taskResults[task.taskId];
        return {ref:task.templateRef||'—',stage:task.stage||words.unknown,
          activity:task.title||words.unknown,owner:task.ownerParty||words.unknown,
          earlyStart:result.earlyStart,earlyFinish:result.earlyFinish,
          lateStart:result.lateStart,lateFinish:result.lateFinish,
          totalFloat:result.floatDays,freeFloat:result.freeFloatDays,
          isCritical:result.isCritical,taskDuration:task.durationUnits,
          durationBasis:task.durationBasis||'working',status:task.status||words.unknown,
          predecessors:result.blockingPredecessors.map(id=>refs.get(id)||words.unknown)};
      });
      const paths=(calculated.project.criticalPaths||[]).map(path=>path.map(id=>refs.get(id)||words.unknown));
      return {...empty,validity:'valid',forecastDate:calculated.project.forecastDate,
        workingDaysEarlyOrLate:calculated.project.workingDaysEarlyOrLate,
        rows,criticalPaths:paths,constraintViolations:calculated.constraintViolations||[],
        missingInputs:calculated.missingInputs||[],errors:calculated.errors||[],
        engineVersion:calculated.engineVersion||empty.engineVersion};
    }
  }

  /**
   * R05 LOCAL-ONLY Weekly TNA report owner.
   * Access: buildReportModel(plan,{reportId:'R05',generatedAt,timezone,asOfDate}).
   * Inputs: recorded task statuses and baseline/target/forecast/actual finish,
   * plus optional raw task recoveryAction that remains a PROPOSAL.
   * Output: immutable ISO-Monday/Sunday civil-week groups and explicit unknowns.
   * No plan mutations, approval inference, recipient authorization, committed
   * recovery or cloud delivery. Invalid timezone/as-of fails closed.
   */
  class TnaWeeklyReportProjection {
    /**
     * One translation dictionary is used by source projection, XLSX headers and
     * print previews; typed garment values are never translated or overwritten.
     */
    static labels(language){
      const all={
        en:{localAudience:'Local merchandiser review — not authorized for buyer/factory distribution',
          localNote:'Internal local working report. Do not send to buyer, factory or agent without reviewing recipient authority and removing restricted information.',
          title:'Weekly merchandising follow-up',asOf:'As of',timezone:'Timezone',basis:'ISO Monday–Sunday calendar weeks (not factory working days)',
          sections:{completedThisWeek:'Completed this week (recorded actual)',completedPreviousWeek:'Completed previous week (recorded actual)',missed:'Past due as of today',dueThisWeek:'Still due this week',dueNextWeek:'Due next week',approvalPending:'Approval / buyer response pending (local status)',recordedRecovery:'Recorded recovery proposals — agreement not verified',needsInformation:'Open tasks needing due date / completion evidence'},
          columns:['Group','Ref','Activity','Owner','Original baseline','Current target / due','Forecast','Recorded actual','Status','Calendar days late','Date source','Recovery proposal','Agreement'],
          none:'No recorded items',unknown:'Needs Information',agreed:'Agreement not verified',approvalNote:'A task marked submitted or awaiting approval does not prove the buyer received it or approved it.',
          recoveryNote:'An entered recovery action or locally applied scenario is not an agreed buyer/factory recovery. No external agreement has been verified.',
          dueSource:{current:'Current target',baseline:'Confirmed baseline',taskBaseline:'Recorded baseline',none:'No due date'},
          weekNow:'Current week',weekPrevious:'Previous week',weekNext:'Next week',outside:'Later open actions (not shown)',earlier:'Earlier completed actions (not shown)',
          invalidClock:'Valid report timezone and as-of date required; weekly classification is unavailable.',
          unknownDue:'Open tasks have no valid recorded due date.',missingActual:'A completed status has no valid actual finish date on or before the as-of date.',
          reviewNotice:'Review internal data and recipient permission before manual sharing. This report does not create buyer sign-off or an agreed recovery.',
          asOfBasis:'Civil dates in the stated report timezone; the weekly boundary is Monday 00:00 through Sunday 23:59.',
          count:'items'},
        bn:{localAudience:'স্থানীয় মার্চেন্ডাইজার পর্যালোচনা — ক্রেতা/কারখানায় পাঠানোর অনুমতি নয়',
          localNote:'শুধু স্থানীয় অভ্যন্তরীণ কাজের প্রতিবেদন। অনুমোদিত প্রাপক যাচাই না করে পাঠাবেন না।',
          title:'সাপ্তাহিক মার্চেন্ডাইজিং ফলো-আপ',asOf:'তারিখ',timezone:'টাইমজোন',basis:'সোমবার–রবিবার ক্যালেন্ডার সপ্তাহ (কারখানার কাজের দিন নয়)',
          sections:{completedThisWeek:'এই সপ্তাহে সম্পন্ন (বাস্তব তারিখ)',completedPreviousWeek:'গত সপ্তাহে সম্পন্ন',missed:'আজ পর্যন্ত সময় পেরিয়েছে',dueThisWeek:'এই সপ্তাহে বাকি',dueNextWeek:'পরের সপ্তাহে বাকি',approvalPending:'অনুমোদন / ক্রেতার উত্তর বাকি (স্থানীয় অবস্থা)',recordedRecovery:'নথিভুক্ত পুনরুদ্ধার প্রস্তাব — সম্মতি যাচাই হয়নি',needsInformation:'তারিখ / সমাপ্তির প্রমাণ প্রয়োজন'},
          columns:['দল','নং','কাজ','দায়িত্ব','মূল পরিকল্পনা','বর্তমান লক্ষ্য','পূর্বাভাস','বাস্তব','অবস্থা','বিলম্ব দিন','তারিখ উৎস','পুনরুদ্ধার প্রস্তাব','সম্মতি'],
          none:'নথিভুক্ত নেই',unknown:'তথ্য প্রয়োজন',agreed:'সম্মতি যাচাই হয়নি',approvalNote:'জমা বা অনুমোদন অপেক্ষায় থাকা কাজ ক্রেতার প্রাপ্তি বা অনুমোদনের প্রমাণ নয়।',
          recoveryNote:'স্থানীয়ভাবে প্রয়োগ করা পরিকল্পনাও ক্রেতা/কারখানার সম্মতি নয়। স্বতন্ত্র সম্মতির প্রমাণ নেই।',
          dueSource:{current:'বর্তমান লক্ষ্য',baseline:'নিশ্চিত মূল পরিকল্পনা',taskBaseline:'নথিভুক্ত মূল পরিকল্পনা',none:'শেষ তারিখ নেই'},
          weekNow:'এই সপ্তাহ',weekPrevious:'গত সপ্তাহ',weekNext:'পরের সপ্তাহ',outside:'পরবর্তী খোলা কাজ (দেখানো হয়নি)',earlier:'আগের সম্পন্ন কাজ (দেখানো হয়নি)',
          invalidClock:'বৈধ টাইমজোন এবং প্রতিবেদনের তারিখ দরকার।',unknownDue:'কিছু কাজের নির্ভরযোগ্য শেষ তারিখ নেই।',missingActual:'সম্পন্ন অবস্থার সঠিক বাস্তব শেষ তারিখ নেই।',
          reviewNotice:'পাঠানোর আগে অনুমোদিত প্রাপক যাচাই করুন; এটি ক্রেতার অনুমোদন বা সম্মতি নয়।',
          asOfBasis:'প্রতিবেদনের টাইমজোনে ক্যালেন্ডার তারিখ; সোমবার থেকে রবিবার।',count:'টি'},
        hi:{localAudience:'स्थानीय मर्चेंडाइज़र समीक्षा — खरीदार/फैक्ट्री को भेजने की अनुमति नहीं',
          localNote:'केवल स्थानीय आंतरिक कार्य रिपोर्ट। प्राप्तकर्ता की अनुमति जाँचने से पहले न भेजें।',
          title:'साप्ताहिक मर्चेंडाइजिंग फॉलो-अप',asOf:'तारीख',timezone:'समय क्षेत्र',basis:'सोमवार–रविवार कैलेंडर सप्ताह (फैक्ट्री कार्यदिवस नहीं)',
          sections:{completedThisWeek:'इस सप्ताह पूरे (वास्तविक तारीख)',completedPreviousWeek:'पिछले सप्ताह पूरे',missed:'आज तक देरी',dueThisWeek:'इस सप्ताह देय',dueNextWeek:'अगले सप्ताह देय',approvalPending:'अनुमोदन / खरीदार जवाब लंबित (स्थानीय स्थिति)',recordedRecovery:'दर्ज रिकवरी प्रस्ताव — सहमति सत्यापित नहीं',needsInformation:'देय तारीख / पूरा होने का प्रमाण चाहिए'},
          columns:['समूह','क्रम','कार्य','जिम्मेदार','मूल योजना','वर्तमान लक्ष्य','पूर्वानुमान','वास्तविक','स्थिति','देरी दिन','तारीख स्रोत','रिकवरी प्रस्ताव','सहमति'],
          none:'दर्ज नहीं',unknown:'जानकारी चाहिए',agreed:'सहमति सत्यापित नहीं',approvalNote:'जमा/अनुमोदन की प्रतीक्षा का अर्थ खरीदार ने पाया या मंजूर किया नहीं है।',
          recoveryNote:'स्थानीय रिकवरी बदलाव खरीदार/फैक्ट्री की सहमति नहीं है; स्वतंत्र प्रमाण नहीं है।',
          dueSource:{current:'वर्तमान लक्ष्य',baseline:'पुष्ट मूल योजना',taskBaseline:'दर्ज मूल योजना',none:'देय तारीख नहीं'},
          weekNow:'यह सप्ताह',weekPrevious:'पिछला सप्ताह',weekNext:'अगला सप्ताह',outside:'बाद के खुले काम (दिखाए नहीं)',earlier:'पहले पूरे काम (दिखाए नहीं)',
          invalidClock:'मान्य रिपोर्ट टाइमज़ोन और तारीख चाहिए।',unknownDue:'कुछ खुले कामों की मान्य देय तारीख नहीं है।',missingActual:'पूर्ण स्थिति के लिए मान्य वास्तविक तारीख नहीं है।',
          reviewNotice:'भेजने से पहले प्राप्तकर्ता अनुमति की जाँच करें; यह खरीदार की स्वीकृति नहीं है।',
          asOfBasis:'रिपोर्ट के टाइमज़ोन में कैलेंडर तारीख; सोमवार से रविवार।',count:'कार्य'},
        ta:{localAudience:'உள்ளூர் Merchandiser ஆய்வு — Buyer/Factory-க்கு அனுப்ப அனுமதி இல்லை',
          localNote:'உள்ளூர் உள்பயன்பாட்டு அறிக்கை மட்டுமே. பெறுநர் அனுமதியைச் சரிபார்க்காமல் பகிர வேண்டாம்.',
          title:'வாராந்திர Merchandising Follow-up',asOf:'தேதி',timezone:'நேர மண்டலம்',basis:'திங்கள்–ஞாயிறு காலண்டர் வாரம் (Factory வேலை நாட்கள் அல்ல)',
          sections:{completedThisWeek:'இந்த வாரம் முடிந்தவை (பதிந்த உண்மை தேதி)',completedPreviousWeek:'முந்தைய வாரம் முடிந்தவை',missed:'இன்றுவரை தாமதமானவை',dueThisWeek:'இந்த வாரம் முடிக்க வேண்டியவை',dueNextWeek:'அடுத்த வாரம் முடிக்க வேண்டியவை',approvalPending:'ஒப்புதல் / Buyer பதில் நிலுவை (உள்ளூர் பதிவு)',recordedRecovery:'பதிந்த Recovery திட்டங்கள் — ஒப்புதல் உறுதி இல்லை',needsInformation:'தேதி / முடிவின் ஆதாரம் தேவை'},
          columns:['பிரிவு','எண்','செயல்','பொறுப்பு','முதல் திட்டம்','தற்போதைய இலக்கு','எதிர்பார்ப்பு','நிகழ்ந்தது','நிலை','தாமத நாட்கள்','தேதி ஆதாரம்','Recovery திட்டம்','ஒப்புதல்'],
          none:'பதிவு இல்லை',unknown:'தகவல் தேவை',agreed:'ஒப்புதல் உறுதி இல்லை',approvalNote:'Submitted அல்லது Awaiting Approval என்பதால் Buyer பெற்றார்/ஒப்புதல் அளித்தார் என்று அர்த்தமில்லை.',
          recoveryNote:'உள்ளூரில் மாற்றிய Recovery திட்டம் Buyer/Factory ஒப்புதல் அல்ல. சுயாதீன ஒப்புதல் ஆதாரம் இல்லை.',
          dueSource:{current:'தற்போதைய இலக்கு',baseline:'உறுதிசெய்த முதல் திட்டம்',taskBaseline:'பதிந்த அடிப்படை தேதி',none:'முடிவு தேதி இல்லை'},
          weekNow:'இந்த வாரம்',weekPrevious:'முந்தைய வாரம்',weekNext:'அடுத்த வாரம்',outside:'பின்னர் வரும் செயல்கள் (காட்டப்படவில்லை)',earlier:'முந்தைய முடிந்த செயல்கள் (காட்டப்படவில்லை)',
          invalidClock:'சரியான Report நேர மண்டலம் மற்றும் தேதி தேவை.',unknownDue:'சில செயல்களுக்கு சரியான முடிவு தேதி இல்லை.',missingActual:'முடிந்தது என்ற நிலைக்கு சரியான நிகழ்ந்த தேதி இல்லை.',
          reviewNotice:'பகிர்வதற்கு முன் பெறுநர் அனுமதியைச் சரிபார்க்கவும்; இது Buyer ஒப்புதல் அல்ல.',
          asOfBasis:'Report நேர மண்டலத்தின் காலண்டர் தேதிகள்; திங்கள் முதல் ஞாயிறு.',count:'செயல்கள்'}
      };
      return all[language]||all.en;
    }


    /**
     * Report civil weeks are fixed ISO Monday–Sunday intervals, not production
     * working weeks. UTC civil-day arithmetic avoids DST and local date shifts.
     * A malformed timezone or timestamp returns null, never a guessed period.
     */
    static window(options={}){
      const timezone=options.timezone;
      if(typeof timezone!=='string'||!timezone.trim())return null;
      try{new Intl.DateTimeFormat('en-US',{timeZone:timezone});}catch{return null;}
      const asOfDate=TnaFactoryDailyActionProjection.asOfDate(
        options.generatedAt,timezone,options.asOfDate);
      const today=TnaMasterReportProjection.day(asOfDate);
      if(today===null)return null;
      const weekday=new Date(today*86400000).getUTCDay();
      const monday=today-((weekday+6)%7);
      const iso=day=>new Date(day*86400000).toISOString().slice(0,10);
      return {asOfDate,timeBasis:'ISO-Monday-Sunday-civil',timezone,
        today,previousStart:today===null?null:iso(monday-7),previousEnd:iso(monday-1),
        weekStart:iso(monday),weekEnd:iso(monday+6),nextStart:iso(monday+7),
        nextEnd:iso(monday+13),previousStartDay:monday-7,weekStartDay:monday,
        nextStartDay:monday+7,nextEndDay:monday+13};
    }


    /**
     * Pure source projection with explicit as-of and immutable baseline dates.
     * Returns six actionable groups plus undated work; one task can appear in
     * multiple topical groups (e.g. overdue and pending approval). Counts are
     * per section, never summed as unique task totals.
     *
     * COMPLETED uses status+actual date <= as-of. A later actual cannot imply
     * the task was already complete in a past snapshot. The report does not
     * have an agreement-authority schema: recorded recovery stays unverified.
     */
    static build(plan={},options={}){
      const labels=TnaWeeklyReportProjection.labels(options.language);
      const window=TnaWeeklyReportProjection.window(options);
      const keys=['completedThisWeek','completedPreviousWeek','missed','dueThisWeek',
        'dueNextWeek','approvalPending','recordedRecovery','needsInformation'];
      const groups=Object.fromEntries(keys.map(key=>[key,[]]));
      const blank={schema:'VESA-TNA-WEEKLY-1',audience:'local-merchandiser-review',
        validity:'incomplete',asOfDate:null,timezone:options.timezone||null,
        timeBasis:'ISO-Monday-Sunday-civil',week:null,groups,
        counts:Object.fromEntries(keys.map(key=>[key,0])),
        uniqueTaskCount:0,excludedLaterOpen:0,excludedEarlierCompleted:0,
        missingInputs:[labels.invalidClock],warnings:[labels.invalidClock],
        verifiedRecoveryAgreements:[],labels};
      if(!window)return blank;
      const first=Array.isArray(plan.baselineSnapshots)?plan.baselineSnapshots[0]:null;
      const originals=new Map((Array.isArray(first?.taskDates)?first.taskDates:[])
        .map(item=>[item.taskId,item.dates||{}]));
      const closure=new Set(['approved','waived','not-applicable']);
      let laterOpen=0,earlierComplete=0,missingDue=0,missingActual=0;
      const tasks=Array.isArray(plan.tasks)?plan.tasks:[];
      for(const task of tasks){
        const sourceDates=task.dates||{},original=originals.get(task.taskId)||{};
        const rawOriginal=original.currentTargetFinish||original.baselineFinish||null;
        const originalDate=TnaMasterReportProjection.asDate(rawOriginal);
        const rawTarget=sourceDates.currentTargetFinish||null;
        const target=TnaMasterReportProjection.asDate(rawTarget);
        const forecast=TnaMasterReportProjection.asDate(sourceDates.forecastFinish);
        const recordedActual=TnaMasterReportProjection.asDate(sourceDates.actualFinish);
        const baselineWithoutSnapshot=TnaMasterReportProjection.asDate(sourceDates.baselineFinish);
        const dueCandidate=rawTarget?target:rawOriginal?originalDate:baselineWithoutSnapshot;
        const dateSource=rawTarget?'current':rawOriginal?'baseline':
          sourceDates.baselineFinish?'taskBaseline':'none';
        const status=typeof task.status==='string'?task.status:'not-started';
        const actualDay=TnaMasterReportProjection.day(recordedActual);
        const dueDay=TnaMasterReportProjection.day(dueCandidate);
        const completedAsOf=status==='completed'&&actualDay!==null&&actualDay<=window.today;
        const lateDays=dueDay===null||dueDay>=window.today?null:window.today-dueDay;
        const row={ref:task.templateRef||'—',stage:task.stage||labels.unknown,
          activity:task.title||labels.unknown,owner:task.ownerParty||labels.unknown,
          original:originalDate,target,forecast,actual:recordedActual,status,
          due:dueCandidate||null,dateSource,lateDays,issue:null,
          recoveryProposal:null,recoveryAgreement:null};
        if(status==='completed'){
          if(completedAsOf){
            if(actualDay>=window.weekStartDay)groups.completedThisWeek.push(row);
            else if(actualDay>=window.previousStartDay)groups.completedPreviousWeek.push(row);
            else earlierComplete++;
          }else{
            missingActual++;
            groups.needsInformation.push({...row,issue:labels.missingActual});
          }
        }
        if(!closure.has(status)&&!completedAsOf&&status!=='completed'){
          if(dueDay===null){
            missingDue++;
            groups.needsInformation.push({...row,issue:labels.unknownDue});
          }else if(dueDay<window.today)groups.missed.push(row);
          else if(dueDay<=TnaMasterReportProjection.day(window.weekEnd))groups.dueThisWeek.push(row);
          else if(dueDay>=window.nextStartDay&&dueDay<=window.nextEndDay)groups.dueNextWeek.push(row);
          else laterOpen++;
        }
        // Task approval status is only a local request/pending indication;
        // it does not prove an external buyer actually received the submission.
        if(['submitted','awaiting-approval'].includes(status)&&
          (task.taskKind==='gate'||task.ownerParty==='buyer')){
          groups.approvalPending.push(row);
        }
        // Scenario application is an internal plan revision, not buyer agreement.
        if(typeof task.recoveryAction==='string'&&task.recoveryAction.trim()){
          groups.recordedRecovery.push({...row,recoveryProposal:task.recoveryAction.trim(),
            recoveryAgreement:labels.agreed});
        }
      }
      for(const key of keys)groups[key].sort((a,b)=>{
        const x=TnaMasterReportProjection.day(a.due),y=TnaMasterReportProjection.day(b.due);
        return (x===null?Number.MAX_SAFE_INTEGER:x)-(y===null?Number.MAX_SAFE_INTEGER:y)||
          String(a.ref).localeCompare(String(b.ref));
      });
      const counts=Object.fromEntries(keys.map(key=>[key,groups[key].length]));
      const warnings=[labels.approvalNote,labels.recoveryNote,labels.reviewNotice];
      if(missingDue)warnings.push(labels.unknownDue+' ('+missingDue+')');
      if(missingActual)warnings.push(labels.missingActual+' ('+missingActual+')');
      const week={previousStart:window.previousStart,previousEnd:window.previousEnd,
        start:window.weekStart,end:window.weekEnd,
        nextStart:window.nextStart,nextEnd:window.nextEnd};
      return {...blank,validity:'valid',asOfDate:window.asOfDate,timezone:window.timezone,
        week,counts,groups,uniqueTaskCount:tasks.length,
        excludedLaterOpen:laterOpen,excludedEarlierCompleted:earlierComplete,
        missingInputs:[],warnings};
    }


  }


  /**
   * R06 Delay & Recovery: immutable management-only view of recorded local facts.
   * Access: buildReportModel(...,{reportId:'R06',timezone,asOfDate}).
   * Inputs: frozen original task dates, current/forecast/actual source dates,
   * typed dependency edges, entered delay notes and audited scenario branches.
   * Output: a local as-of comparison, never a buyer/factory-accepted recovery.
   * No task, schema, order, browser storage or acceptance rule is modified.
   */
  class TnaDelayRecoveryProjection {
    /** Presentation labels are localized; business-entered text is unchanged. */
    static labels(language){
      const all={
        en:{title:'Delay & Recovery — local management review',disclosure:'Internal management only. Verify recipient permission before sharing. A local scenario or note is NOT an agreed buyer/factory recovery.',
          unknown:'Needs Information',asOf:'As of',overview:'Recorded task date movement',scenarioHeading:'Locally recorded recovery options',noScenarios:'No source-recorded scenario options',
          columns:['Ref','Activity','Assigned owner','Confirmed original','Current target','Forecast finish','Actual finish','Variance days','Compared against','Status','Entered cause (unverified)','Waiting party','Direct next tasks (effect unverified)','Recovery proposal'],
          scenarioColumns:['Scenario','Local evidence state','Original forecast','Option forecast','Source change in working days','External agreement'],
          localApplied:'Applied locally — buyer/factory agreement unverified',previewOnly:'Preview/unverified — not applied',notAgreed:'Not independently verified',
          current:'Current target',actual:'Recorded actual',forecast:'Recorded forecast',none:'No supported finish',
          missingOriginal:'No confirmed original baseline',missingDue:'No current/confirmed due date',missingActual:'Completed status lacks as-of actual proof',futureActual:'Actual finish is later than report as-of',missingComparison:'No comparable original and observed finish',
          note:'Calendar-day variances use confirmed original finish against source actual (completed as-of) or recorded forecast (open). Negative is earlier. Assigned owner is NOT verified waiting party. Direct successors do not prove impact. No independent recovery approval authority is recorded.',
          invalidClock:'Valid as-of date and timezone required; delay figures are unavailable.',count:'activities'},
        bn:{title:'বিলম্ব ও পুনরুদ্ধার — স্থানীয় ব্যবস্থাপনা পর্যালোচনা',disclosure:'শুধু অভ্যন্তরীণ ব্যবস্থাপনা। পাঠানোর আগে প্রাপকের অনুমতি যাচাই করুন। স্থানীয় পরিকল্পনা ক্রেতা/কারখানার সম্মতি নয়।',
          unknown:'তথ্য প্রয়োজন',asOf:'তারিখ',overview:'নথিভুক্ত কাজ ও তারিখ পরিবর্তন',scenarioHeading:'স্থানীয় পুনরুদ্ধার বিকল্প',noScenarios:'পুনরুদ্ধার পরিকল্পনা নেই',
          columns:['নং','কার্যক্রম','দায়িত্ব','নিশ্চিত মূল তারিখ','বর্তমান লক্ষ্য','পূর্বাভাস','বাস্তব শেষ','পার্থক্য দিন','তুলনার ভিত্তি','অবস্থা','লেখা কারণ (অযাচাইকৃত)','অপেক্ষমাণ পক্ষ','পরবর্তী কাজ (প্রভাব অযাচাইকৃত)','পুনরুদ্ধার প্রস্তাব'],
          scenarioColumns:['পরিকল্পনা','স্থানীয় অবস্থা','আগের পূর্বাভাস','নতুন পূর্বাভাস','কর্মদিবসের পরিবর্তন','বাহ্যিক সম্মতি'],
          localApplied:'স্থানীয়ভাবে প্রয়োগ — সম্মতি যাচাই হয়নি',previewOnly:'প্রস্তাব/যাচাই হয়নি',notAgreed:'স্বাধীনভাবে যাচাই হয়নি',
          current:'বর্তমান লক্ষ্য',actual:'নথিভুক্ত বাস্তব',forecast:'নথিভুক্ত পূর্বাভাস',none:'যাচাইকৃত সমাপ্তি নেই',
          missingOriginal:'নিশ্চিত মূল তারিখ নেই',missingDue:'বর্তমান/নিশ্চিত শেষ তারিখ নেই',missingActual:'সম্পন্ন অবস্থায় বাস্তব তারিখ নেই',futureActual:'প্রতিবেদনের পরে বাস্তব তারিখ',missingComparison:'তুলনাযোগ্য তারিখ নেই',
          note:'ক্যালেন্ডার দিনের হিসাব। দায়িত্বপ্রাপ্ত ব্যক্তি অপেক্ষমাণ পক্ষের প্রমাণ নয়। পরবর্তী কাজের প্রভাব নিশ্চিত নয়। বাইরের সম্মতির প্রমাণ নেই।',
          invalidClock:'সঠিক তারিখ ও টাইমজোন প্রয়োজন।',count:'কাজ'},
        hi:{title:'देरी और रिकवरी — स्थानीय प्रबंधन समीक्षा',disclosure:'केवल आंतरिक प्रबंधन। भेजने से पहले प्राप्तकर्ता की अनुमति जाँचें। स्थानीय योजना खरीदार/फैक्ट्री की सहमति नहीं है।',
          unknown:'जानकारी चाहिए',asOf:'तारीख',overview:'दर्ज काम और तारीख के बदलाव',scenarioHeading:'दर्ज रिकवरी विकल्प',noScenarios:'कोई दर्ज विकल्प नहीं',
          columns:['क्रम','कार्य','जिम्मेदार','पुष्ट मूल तारीख','वर्तमान लक्ष्य','पूर्वानुमान','वास्तविक अंत','अंतर दिन','तुलना आधार','स्थिति','दर्ज कारण (अपुष्ट)','किसकी प्रतीक्षा','अगले काम (प्रभाव अपुष्ट)','रिकवरी प्रस्ताव'],
          scenarioColumns:['विकल्प','स्थानीय स्थिति','मूल पूर्वानुमान','विकल्प पूर्वानुमान','कार्यदिवस में अंतर','बाहरी सहमति'],
          localApplied:'स्थानीय रूप से लागू — सहमति अपुष्ट',previewOnly:'प्रस्ताव/अपुष्ट',notAgreed:'स्वतंत्र पुष्टि नहीं',
          current:'वर्तमान लक्ष्य',actual:'दर्ज वास्तविक',forecast:'दर्ज पूर्वानुमान',none:'समर्थित अंत नहीं',
          missingOriginal:'पुष्ट मूल तारीख नहीं',missingDue:'पुष्ट अंतिम तारीख नहीं',missingActual:'पूर्ण स्थिति लेकिन वास्तविक तारीख नहीं',futureActual:'रिपोर्ट के बाद वास्तविक तारीख',missingComparison:'तुलना योग्य तारीख नहीं',
          note:'अंतर कैलेंडर दिनों का है। जिम्मेदार व्यक्ति प्रतीक्षारत पक्ष का प्रमाण नहीं है। अगले काम का प्रभाव पुष्ट नहीं। बाहरी सहमति का प्रमाण नहीं है।',
          invalidClock:'वैध तारीख और टाइमज़ोन जरूरी।',count:'कार्य'},
        ta:{title:'தாமதம் & Recovery — உள்ளூர் நிர்வாக ஆய்வு',disclosure:'உள் நிர்வாகத்திற்கு மட்டும். பகிரும் முன் பெறுநர் அனுமதி தேவை. உள்ளூரில் மாற்றியது Buyer/Factory ஒப்புதல் அல்ல.',
          unknown:'தகவல் தேவை',asOf:'தேதி',overview:'பதிவான செயல்கள் மற்றும் தேதி மாற்றம்',scenarioHeading:'பதிவான Recovery திட்டங்கள்',noScenarios:'Recovery திட்டம் பதிவாகவில்லை',
          columns:['எண்','செயல்','பொறுப்பாளர்','உறுதியான முதல் தேதி','தற்போதைய இலக்கு','எதிர்பார்ப்பு','நிகழ்ந்த முடிவு','வித்தியாச நாட்கள்','ஒப்பீட்டு ஆதாரம்','நிலை','பதிவான காரணம் (சரிபார்க்கவில்லை)','காத்திருக்கும் தரப்பு','அடுத்த செயல்கள் (பாதிப்பு உறுதியில்லை)','Recovery யோசனை'],
          scenarioColumns:['திட்டம்','உள்ளூர் பதிவு நிலை','முதல் எதிர்பார்ப்பு','மாற்று எதிர்பார்ப்பு','வேலைநாள் வித்தியாசம்','வெளி ஒப்புதல்'],
          localApplied:'உள்ளூரில் பயன்படுத்தப்பட்டது — ஒப்புதல் உறுதி இல்லை',previewOnly:'யோசனை / உறுதி இல்லை',notAgreed:'தனியாகச் சரிபார்க்கவில்லை',
          current:'தற்போதைய இலக்கு',actual:'பதிந்த உண்மை',forecast:'பதிந்த எதிர்பார்ப்பு',none:'உறுதியான முடிவு இல்லை',
          missingOriginal:'உறுதியான முதல் தேதி இல்லை',missingDue:'இலக்கு தேதி இல்லை',missingActual:'முடிந்த நிலைக்கு உண்மை தேதி இல்லை',futureActual:'அறிக்கை தேதிக்குப் பிந்தைய முடிவு',missingComparison:'ஒப்பிடும் தேதிகள் இல்லை',
          note:'வித்தியாசம் காலண்டர் நாட்கள். பொறுப்பாளர் என்பது காத்திருக்கும் தரப்பின் ஆதாரம் அல்ல. அடுத்த செயல்களில் பாதிப்பு உறுதி இல்லை. Buyer/Factory ஒப்புதல் ஆதாரம் இல்லை.',
          invalidClock:'சரியான தேதி மற்றும் நேர மண்டலம் தேவை.',count:'செயல்கள்'}
      };
      return all[language]||all.en;
    }
    /** Only a validated IANA zone plus source or supplied civil date can classify delay. */
    static clock(options){
      if(typeof options.timezone!=='string'||!options.timezone.trim())return null;
      try{new Intl.DateTimeFormat('en-US',{timeZone:options.timezone});}catch{return null;}
      const asOf=TnaFactoryDailyActionProjection.asOfDate(options.generatedAt,options.timezone,options.asOfDate);
      return TnaMasterReportProjection.day(asOf)===null?null:asOf;
    }
    /** Read immutable scenario lineage without inferring external acceptance. */
    static scenarioRows(plan,labels){
      const events=Array.isArray(plan.revisionEvents)?plan.revisionEvents:[];
      const branches=Array.isArray(plan.scenarioBranches)?plan.scenarioBranches:[];
      return branches.map(branch=>{
        const applied=branch?.status==='applied'&&branch.baseRecordId===plan.recordId&&
          events.some(event=>event.eventType==='scenario-applied'&&event.details?.scenarioId===branch.scenarioId);
        return {name:String(branch?.name||labels.unknown),scenarioId:String(branch?.scenarioId||labels.unknown),
          locallyApplied:applied,localState:applied?labels.localApplied:labels.previewOnly,
          baseForecast:TnaMasterReportProjection.asDate(branch?.baseForecastDate),
          optionForecast:TnaMasterReportProjection.asDate(branch?.scenarioForecastDate),
          workingDaysGained:typeof branch?.workingDaysGained==='number'&&Number.isFinite(branch.workingDaysGained)?branch.workingDaysGained:null,
          externalAgreement:null,agreementLabel:labels.notAgreed};
      });
    }
    /** Project all garment tasks, including unknowns; never drop records for missing dates. */
    static build(plan={},options={}){
      const labels=this.labels(options.language),asOfDate=this.clock(options);
      const blank={schema:'VESA-TNA-DELAY-1',audience:'local-management-review',
        validity:'incomplete',asOfDate:null,timezone:options.timezone||null,
        basis:'civil-calendar-days',rows:[],scenarios:[],labels,
        counts:{total:0,overdue:0,positiveVariance:0,enteredCauses:0,missingOriginal:0,missingDue:0,missingActual:0,localScenarioApplications:0},
        verifiedExternalAgreements:[],warnings:[labels.invalidClock,labels.disclosure]};
      if(!asOfDate)return blank;
      const today=TnaMasterReportProjection.day(asOfDate);
      const originalSnapshot=Array.isArray(plan.baselineSnapshots)?plan.baselineSnapshots[0]:null;
      const originals=new Map((Array.isArray(originalSnapshot?.taskDates)?originalSnapshot.taskDates:[])
        .map(row=>[row.taskId,row.dates||{}]));
      const tasks=Array.isArray(plan.tasks)?plan.tasks:[];
      const ids=new Map(tasks.map(task=>[task.taskId,task.templateRef||labels.unknown]));
      const edges=Array.isArray(plan.edges)?plan.edges:[];
      const rows=tasks.map(task=>{
        const dates=task.dates||{},source=originals.get(task.taskId);
        const original=TnaMasterReportProjection.asDate(source?.currentTargetFinish||source?.baselineFinish||null);
        const target=TnaMasterReportProjection.asDate(dates.currentTargetFinish);
        const forecast=TnaMasterReportProjection.asDate(dates.forecastFinish);
        const actual=TnaMasterReportProjection.asDate(dates.actualFinish);
        const actualDay=TnaMasterReportProjection.day(actual);
        const status=typeof task.status==='string'?task.status:'needs-information';
        const closed=['completed','approved','waived','not-applicable'].includes(status);
        const verifiedAsOfActual=status==='completed'&&actualDay!==null&&actualDay<=today;
        const observed=verifiedAsOfActual?actual:status!=='completed'?forecast:null;
        const difference=original&&observed?
          TnaMasterReportProjection.day(observed)-TnaMasterReportProjection.day(original):null;
        const rawDue=dates.currentTargetFinish?dates.currentTargetFinish:
          source?.currentTargetFinish||source?.baselineFinish||null;
        const due=TnaMasterReportProjection.asDate(rawDue);
        const overdue=!closed&&TnaMasterReportProjection.day(due)!==null&&
          TnaMasterReportProjection.day(due)<today;
        const missingActual=status==='completed'&&!verifiedAsOfActual;
        const cause=typeof task.delayReason==='string'&&task.delayReason.trim()?task.delayReason.trim():null;
        const recovery=typeof task.recoveryAction==='string'&&task.recoveryAction.trim()?task.recoveryAction.trim():null;
        const affected=edges.filter(edge=>edge.predecessorTaskId===task.taskId&&ids.has(edge.successorTaskId))
          .map(edge=>ids.get(edge.successorTaskId));
        const gaps=[];
        if(!original)gaps.push(labels.missingOriginal);
        if(!due)gaps.push(labels.missingDue);
        if(missingActual)gaps.push(actualDay!==null&&actualDay>today?labels.futureActual:labels.missingActual);
        if(difference===null)gaps.push(labels.missingComparison);
        return {ref:task.templateRef||labels.unknown,taskId:task.taskId,
          activity:task.title||labels.unknown,stage:task.stage||labels.unknown,
          assignedOwner:task.ownerParty||labels.unknown,original,target,forecast,actual,
          due,actualAsOf:verifiedAsOfActual,varianceDays:difference,
          comparedTo:verifiedAsOfActual?labels.actual:status!=='completed'&&forecast?labels.forecast:null,
          status,overdue,enteredCause:cause,waitingParty:null,
          possibleDownstreamRefs:[...new Set(affected)],recoveryProposal:recovery,
          agreementVerified:false,gaps};
      });
      const scenarios=this.scenarioRows(plan,labels);
      const counts={total:rows.length,overdue:rows.filter(row=>row.overdue).length,
        positiveVariance:rows.filter(row=>row.varianceDays>0).length,
        enteredCauses:rows.filter(row=>row.enteredCause).length,
        missingOriginal:rows.filter(row=>!row.original).length,
        missingDue:rows.filter(row=>!row.due).length,
        missingActual:rows.filter(row=>row.status==='completed'&&!row.actualAsOf).length,
        localScenarioApplications:scenarios.filter(row=>row.locallyApplied).length};
      return {...blank,validity:'valid',asOfDate,rows,scenarios,counts,
        warnings:[labels.disclosure,labels.note]};
    }
  }

  function taskRows(plan={},limit=Infinity){return (plan.tasks||[]).slice(0,limit).map(task=>({ref:task.templateRef,title:task.title,owner:task.ownerParty,status:task.status,baseline:task.dates?.baselineFinish||'',current:task.dates?.currentTargetFinish||'',forecast:task.dates?.forecastFinish||'',actual:task.dates?.actualFinish||'',risk:task.riskStatus||'needs-information'}))}
  function warnings(plan={}){return [...(plan.unknownFields||[]).map(item=>'Missing: '+item),...(plan.validation?.warnings||[])]}
  function catalogue(language='en'){const l=lang(language);return REPORT_TYPES.map(report=>({id:report[0],title:titleFor(report,l),audience:audienceFor(report,l),scope:report[3]}))}
  function buildReportModel(plan,options={}){const l=lang(options.language);const report=reportType(options.reportId||'R01');const generatedAt=options.generatedAt||new Date().toISOString();const timezone=(report[0]==='R05'||report[0]==='R06')&&Object.prototype.hasOwnProperty.call(options,'timezone')?options.timezone:(options.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'local');if(report[0]==='R02')return TnaBuyerMilestoneProjection.report(plan,report,l,generatedAt,timezone);const daily=report[0]==='R03'?TnaFactoryDailyActionProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const weekly=report[0]==='R05'?TnaWeeklyReportProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const delay=report[0]==='R06'?TnaDelayRecoveryProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:report[0],title:titleFor(report,l),language:l,languageName:I18N[l].languageName,audience:report[0]==='R06'?'Local management review — no external sharing authorization':report[0]==='R05'?TnaWeeklyReportProjection.labels(l).localAudience:audienceFor(report,l),generatedAt,generatedLabel:formatDateTime(generatedAt,l),timezone,revision:plan?.revision??0,baselineSnapshots:(plan?.baselineSnapshots||[]).length,headings:I18N[l].headings,labels:I18N[l].labels,order:orderContext(plan),tasks:taskRows(plan),...(report[0]==='R01'?{masterTna:{schema:'VESA-TNA-MASTER-1',rows:TnaMasterReportProjection.rows(plan)}}:{}),...(daily?{factoryDailyAction:daily}:{}),...(weekly?{weeklyTna:weekly}:{}),...(delay?{delayRecovery:delay}:{}),...(report[0]==='R04'?{criticalPath:TnaCriticalPathProjection.build(plan,{language:l})}:{}),warnings:[...warnings(plan),...(weekly?weekly.warnings:[]),...(delay?delay.warnings:[])],notes:[I18N[l].labels.noFabrication,...(weekly?[weekly.labels.localNote]:[]),...(delay?[delay.labels.disclosure]:[]),I18N[l].labels.printFallback,I18N[l].labels.shareFallback],source:{recordId:plan?.recordId||null,schemaVersion:plan?.schemaVersion||null,mode:plan?.mode||'unknown'}}}
  function assertLanguageCoverage(){const missing=[];for(const l of SUPPORTED_LANGUAGES){for(const report of REPORT_TYPES){if(!titleFor(report,l))missing.push(l+':'+report[0]);}for(const key of ['order','dates','tasks','warnings','actions','meta'])if(!I18N[l].headings[key])missing.push(l+':heading:'+key);for(const key of ['brand','generated','timezone','audience','revision','baseline','noFabrication','shareFallback','printFallback'])if(!I18N[l].labels[key])missing.push(l+':label:'+key);}return {ok:missing.length===0,missing}}
  const api={SUPPORTED_LANGUAGES,REPORT_TYPES,I18N,catalogue,buildReportModel,assertLanguageCoverage};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaReports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
