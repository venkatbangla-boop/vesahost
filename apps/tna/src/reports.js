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


  /**
   * R07 Production Status owns a read-only source projection with four garment
   * production stages. It reads existing operations and milestone dates; it
   * neither fills unknown output nor modifies local records or rate engines.
   * Buyer mode is an independent allowlisted output, not the internal report
   * with fields redacted after serializing. Manual review is NOT server auth.
   */
  class TnaProductionStatusProjection {
    /** Fixed stage references are template milestone IDs, not task UUIDs. */
    static stages(){
      return [
        {code:'cut',types:['cut','cutting'],start:'C04',finish:'C06'},
        {code:'sew',types:['sew','sewing'],start:'P01',finish:'P03'},
        {code:'finish',types:['finish','finishing'],start:'P07',finish:'P08'},
        {code:'pack',types:['pack','packing'],start:'PK02',finish:'PK04'}
      ];
    }
    /** Keep authored labels in all four languages; entered values are never translated. */
    static labels(language){
      const words={
        en:{title:'Production stage status',unknown:'Needs Information',
          stages:{cut:'Cutting',sew:'Sewing',finish:'Finishing',pack:'Packing'},
          note:'Quantities are the latest locally entered operation snapshot, NOT accepted goods or historical as-of output. Capacity-only records with seeded zeros prove no production. Rates and projected finish need independent verified output/calendar evidence.',
          internalNotice:'INTERNAL PRODUCTION REVIEW ONLY. Check recipient permission before sharing. No inspection/PPM release or factory acceptance is inferred.',
          buyerNotice:'Buyer-facing copy contains only reviewed stage milestones and recorded outputs. Local review is not server authorization, buyer acceptance or shipment release.',
          restrictedNotice:'Buyer copy is withheld. Choose Buyer, tick reviewed permission, and enter its source reference. No order or factory details are exported before that review.',
          controlMode:'Production report audience',internalMode:'Internal production (restricted)',buyerMode:'Buyer reviewed copy (limited)',
          controlConsent:'I checked buyer recipient permission and reviewed the content',
          controlSource:'Permission source reference (required for buyer copy)',
          controlHelp:'This manual check is not secure authorization. Do not send without independent approval.',
          noSource:'No locally recorded output for this stage',
          invalidSource:'Invalid or unreconciled operation quantities; numbers withheld',
          mixedLots:'Several entries cannot be proven disjoint by lot and unit; no totals',
          localSource:'Locally recorded counts; not independently accepted',
          statusUnverified:'Milestone completion requires recorded actual date; no release is inferred',
          rateMissing:'Verified daily output and source-approved working calendar are unavailable',
          asOf:'Report as of',notAsOf:'Operation quantities are latest snapshot; date of each quantity update is unverified',
          columns:['Stage','Start recorded','Finish recorded','Current target','Forecast finish','Locally entered output','Entered input','Work in progress','Rejected','Reworked','Remainder within entered input','Unit','Evidence state','Verified output/day','Projected finish'],
          printColumns:['Stage','Start actual','End actual','Current target','Forecast','Recorded output','Entered input','Remainder','Unit','Source status','Projected end'],
          operationColumns:['Stage','Operation','Lot','Input','Output','Rejected','Rework','WIP','Remainder','Unit','Status'],
          orderHidden:'Not included in buyer copy',unitUnknown:'Unknown unit'},
        bn:{title:'উৎপাদন ধাপের অবস্থা',unknown:'তথ্য প্রয়োজন',
          stages:{cut:'কাটিং',sew:'সেলাই',finish:'ফিনিশিং',pack:'প্যাকিং'},
          note:'সংখ্যা স্থানীয়ভাবে লেখা সর্বশেষ তথ্য; অনুমোদিত পণ্য বা আগের দিনের উৎপাদন নয়। শুধু লাইন-ক্যাপাসিটির শূন্য সংখ্যা উৎপাদন প্রমাণ করে না। যাচাইকৃত রেট ও ক্যালেন্ডার না থাকলে শেষ তারিখ অজানা।',
          internalNotice:'শুধু অভ্যন্তরীণ উৎপাদন রিপোর্ট। অনুমতি ছাড়া পাঠাবেন না; PPM/ইন্সপেকশন ছাড়পত্র ধরে নেওয়া হয়নি।',
          buyerNotice:'ক্রেতার জন্য কেবল পর্যালোচিত ধাপ/উৎপাদন তথ্য। স্থানীয় পরীক্ষা সার্ভার অনুমোদন বা ক্রেতার স্বীকৃতি নয়।',
          restrictedNotice:'ক্রেতার রিপোর্ট বন্ধ। অনুমতি যাচাই ও সূত্র দিন; আগে অর্ডার তথ্য দেখানো হবে না।',
          controlMode:'রিপোর্ট প্রাপক',internalMode:'অভ্যন্তরীণ উৎপাদন',buyerMode:'পর্যালোচিত ক্রেতার কপি',
          controlConsent:'প্রাপকের অনুমতি ও বিষয়বস্তু যাচাই করেছি',controlSource:'অনুমতি সূত্র (প্রয়োজনীয়)',
          controlHelp:'এটি সার্ভারের নিরাপদ অনুমোদন নয়। স্বতন্ত্র সম্মতি ছাড়া পাঠাবেন না।',
          noSource:'উৎপাদনের তথ্য নেই',invalidSource:'অসামঞ্জস্যপূর্ণ উৎপাদন সংখ্যা — গোপন রাখা হয়েছে',
          mixedLots:'একাধিক লট আলাদা প্রমাণ নেই; মোট নয়',localSource:'স্থানীয় সংখ্যা; অনুমোদিত নয়',
          statusUnverified:'বাস্তব তারিখ ছাড়া কাজ সমাপ্ত প্রমাণ নয়',rateMissing:'যাচাইকৃত দৈনিক রেট/ক্যালেন্ডার নেই',
          asOf:'রিপোর্ট তারিখ',notAsOf:'পরিমাণ সর্বশেষ নথি; তারিখভিত্তিক ইতিহাস নয়',
          columns:['ধাপ','শুরু','শেষ','বর্তমান লক্ষ্য','পূর্বাভাস','দর্জ আউটপুট','ইনপুট','চলমান','বাতিল','রিওয়ার্ক','অবশিষ্ট ইনপুট','একক','প্রমাণ অবস্থা','দৈনিক রেট','শেষের পূর্বাভাস'],
          printColumns:['ধাপ','শুরু','শেষ','বর্তমান','পূর্বাভাস','আউটপুট','ইনপুট','অবশিষ্ট','একক','উৎস','শেষ'],
          operationColumns:['ধাপ','অপারেশন','লট','ইনপুট','আউটপুট','বাতিল','রিওয়ার্ক','চলমান','অবশিষ্ট','একক','অবস্থা'],
          orderHidden:'ক্রেতার রিপোর্টে নেই',unitUnknown:'একক জানা নেই'},
        hi:{title:'उत्पादन चरण स्थिति',unknown:'जानकारी चाहिए',
          stages:{cut:'कटिंग',sew:'सिलाई',finish:'फिनिशिंग',pack:'पैकिंग'},
          note:'मात्रा केवल स्थानीय नवीनतम प्रविष्टि है; स्वीकृत माल या पुराने दिन का उत्पादन नहीं। क्षमता की डिफॉल्ट शून्य मात्रा असली उत्पादन नहीं। सत्यापित रेट और कैलेंडर के बिना समाप्ति तारीख नहीं निकलेगी।',
          internalNotice:'केवल आंतरिक उत्पादन रिपोर्ट। अनुमति जाँचें; PPM/निरीक्षण रिलीज़ नहीं मानी गई।',
          buyerNotice:'खरीदार को केवल जाँचे गए चरण और दर्ज आउटपुट। स्थानीय समीक्षा सुरक्षित सर्वर अनुमति या खरीदार स्वीकृति नहीं है।',
          restrictedNotice:'खरीदार कॉपी रोकी गई। प्रापक अनुमति जाँचें और स्रोत लिखें; तब तक ऑर्डर जानकारी नहीं।',
          controlMode:'रिपोर्ट प्राप्तकर्ता',internalMode:'आंतरिक उत्पादन',buyerMode:'जाँची खरीदार कॉपी',
          controlConsent:'प्रापक अनुमति और सामग्री जाँची है',controlSource:'अनुमति स्रोत (अनिवार्य)',
          controlHelp:'यह सुरक्षित सर्वर अनुमति नहीं। स्वतंत्र स्वीकृति के बिना न भेजें।',
          noSource:'उत्पादन रिकॉर्ड नहीं',invalidSource:'अवैध / असंगत संख्या छिपाई गई',
          mixedLots:'लॉट अलग होने का प्रमाण नहीं; योग नहीं',localSource:'स्थानीय संख्या; स्वीकृत नहीं',
          statusUnverified:'असली तारीख के बिना पूरा होना पुष्ट नहीं',rateMissing:'सत्यापित दैनिक रेट या कैलेंडर नहीं',
          asOf:'रिपोर्ट तारीख',notAsOf:'मात्रा नवीनतम स्थिति है; पुरानी तारीख का हिसाब नहीं',
          columns:['चरण','शुरू','समाप्त','वर्तमान लक्ष्य','पूर्वानुमान','दर्ज आउटपुट','इनपुट','चलता काम','रिजेक्ट','रीवर्क','शेष इनपुट','इकाई','प्रमाण','दैनिक रेट','समाप्ति अनुमान'],
          printColumns:['चरण','शुरू','समाप्त','वर्तमान','पूर्वानुमान','आउटपुट','इनपुट','शेष','इकाई','स्रोत स्थिति','अनुमान'],
          operationColumns:['चरण','ऑपरेशन','लॉट','इनपुट','आउटपुट','रिजेक्ट','रीवर्क','WIP','शेष','इकाई','स्थिति'],
          orderHidden:'खरीदार कॉपी में नहीं',unitUnknown:'इकाई अज्ञात'},
        ta:{title:'உற்பத்தி நிலை அறிக்கை',unknown:'தகவல் தேவை',
          stages:{cut:'Cutting',sew:'Sewing',finish:'Finishing',pack:'Packing'},
          note:'எண்ணிக்கை கடைசியாக உள்ளூரில் பதிவானது மட்டும்; ஒப்புக்கொண்ட சரக்கோ பழைய தேதியின் output-ஓ அல்ல. Capacity-only default zero உண்மையான உற்பத்தி இல்லை. சரிபார்த்த தினசரி rate/calendar இல்லாமல் முடிவு தேதி கணிக்க முடியாது.',
          internalNotice:'உள் Production குழுவிற்கு மட்டும். பகிரும் முன் அனுமதி தேவை. PPM/AQL release உறுதி செய்யப்படவில்லை.',
          buyerNotice:'Buyer copy-யில் review செய்த stage/date/output மட்டும். Local review என்பது secure authorization அல்லது Buyer approval அல்ல.',
          restrictedNotice:'Buyer copy தடுக்கப்பட்டுள்ளது. அனுமதி பார்த்ததாகக் குறியிட்டு ஆதார reference கொடுக்க வேண்டும். அதுவரை order விவரம் வராது.',
          controlMode:'Report பெறுபவர்',internalMode:'உள் Production (கட்டுப்பாடு)',buyerMode:'Buyer-க்கு review செய்த copy',
          controlConsent:'Buyer பெறுநர் அனுமதியையும் விவரங்களையும் சரிபார்த்தேன்',
          controlSource:'அனுமதி ஆதார reference (கட்டாயம்)',
          controlHelp:'இந்த உள்ளூர் ஒப்புதல் secure server authorization அல்ல. தனியான approval இல்லாமல் அனுப்பாதீர்கள்.',
          noSource:'உற்பத்தி output பதிவு இல்லை',invalidSource:'தவறான / பொருந்தாத எண்ணிக்கை மறைக்கப்பட்டுள்ளது',
          mixedLots:'பல entries தனித்தனி lot என உறுதி இல்லை; மொத்தம் காட்ட முடியாது',localSource:'உள்ளூரில் பதிந்தது; வெளி ஒப்புதல் இல்லை',
          statusUnverified:'நிகழ்ந்த தேதி இல்லாமல் செயல் முடிந்தது என்று உறுதி இல்லை',rateMissing:'சரிபார்த்த daily rate/calendar இல்லை',
          asOf:'அறிக்கை நாள்',notAsOf:'Quantity கடைசி பதிவு மட்டும்; அன்றைய சரித்திர output அல்ல',
          columns:['நிலை','தொடங்கியது','முடிந்தது','இப்போதைய இலக்கு','எதிர்பார்ப்பு','பதிந்த output','உள்ளீடு','WIP','நிராகரிப்பு','Rework','உள்ளீட்டில் மீதி','அலகு','ஆதார நிலை','தினசரி output','முடிவு கணிப்பு'],
          printColumns:['நிலை','தொடக்கம்','முடிவு','இலக்கு','எதிர்பார்ப்பு','Output','Input','மீதி','அலகு','ஆதார நிலை','முடிவு'],
          operationColumns:['நிலை','செயல்','Lot','Input','Output','Reject','Rework','WIP','மீதி','அலகு','நிலை'],
          orderHidden:'Buyer copy-யில் இல்லை',unitUnknown:'அலகு தெரியவில்லை'}
      };
      return words[language]||words.en;
    }
    /** A date is historical actual only if that milestone was marked completed. */
    static milestone(plan,ref,asOfDay){
      const task=(Array.isArray(plan.tasks)?plan.tasks:[]).find(item=>item.templateRef===ref);
      const enteredActual=TnaMasterReportProjection.asDate(task?.dates?.actualFinish);
      const day=TnaMasterReportProjection.day(enteredActual);
      return {ref,actual:task?.status==='completed'&&day!==null&&day<=asOfDay?enteredActual:null,
        futureActual:task?.status==='completed'&&day!==null&&day>asOfDay,
        current:TnaMasterReportProjection.asDate(task?.dates?.currentTargetFinish),
        forecast:TnaMasterReportProjection.asDate(task?.dates?.forecastFinish),
        status:task?.status||'needs-information'};
    }
    /**
     * Treat zero-capacity placeholders as unknown rather than output=0.
     * Validate explicit operation snapshot numbers before invoking frozen
     * CAP-05 quantity conservation; never call a claimed completed unit an
     * accepted or shipment-passed unit without independent inspection proof.
     */
    static operation(op,code,labels){
      const fields=['qtyInput','qtyCompleted','qtyRejected','qtyReworked','qtyWip'];
      const hasEvidence=fields.some(key=>typeof op?.[key]==='number'&&op[key]>0)||
        (Array.isArray(op?.dailyActuals)&&op.dailyActuals.length>0);
      const unit=typeof op?.unit==='string'&&op.unit.trim()?op.unit.trim():null;
      const id=typeof op?.operationId==='string'?op.operationId:'';
      const lot=typeof op?.lotId==='string'?op.lotId.trim():'';
      const blank={code,operationId:id,lotId:lot,unit:unit||labels.unitUnknown,
        input:null,completed:null,rejected:null,reworked:null,wip:null,remaining:null,
        sourceStatus:labels.noSource,quantityValid:false};
      if(!hasEvidence)return blank;
      if(!unit||fields.some(key=>typeof op[key]!=='number'||!Number.isFinite(op[key])||op[key]<0||
        ((unit==='pcs'||unit==='piece'||unit==='pieces')&&!Number.isInteger(op[key])))){
        return {...blank,sourceStatus:labels.invalidSource};
      }
      const engine=root.VesaTnaOperations||(typeof require==='function'?require('./operations.js'):null);
      const checked=engine?.validateOperationQuantity?.(op);
      if(!checked?.ok||!Number.isFinite(checked.remainingQty)){
        return {...blank,sourceStatus:labels.invalidSource};
      }
      return {...blank,input:op.qtyInput,completed:op.qtyCompleted,rejected:op.qtyRejected,
        reworked:op.qtyReworked,wip:op.qtyWip,remaining:checked.remainingQty,
        sourceStatus:labels.localSource,quantityValid:true};
    }
    /** Combine only disjoint named lots with identical units and complete data. */
    static combined(rows,labels){
      if(!rows.length)return {state:labels.noSource,scope:'missing',input:null,completed:null,
        rejected:null,reworked:null,wip:null,remaining:null,unit:null};
      const allValid=rows.every(row=>row.quantityValid);
      const distinct=rows.length===1||rows.every(row=>row.lotId)&&
        new Set(rows.map(row=>row.lotId.toLowerCase())).size===rows.length;
      const sameUnit=rows.every(row=>row.unit===rows[0].unit);
      if(!allValid||!distinct||!sameUnit)return {state:allValid?labels.mixedLots:labels.invalidSource,
        scope:'unreconciled',input:null,completed:null,rejected:null,reworked:null,wip:null,
        remaining:null,unit:null};
      const sum=key=>rows.reduce((total,row)=>total+row[key],0);
      return {state:labels.localSource,scope:rows.length===1?'one-operation':'distinct-entered-lots',
        input:sum('input'),completed:sum('completed'),rejected:sum('rejected'),
        reworked:sum('reworked'),wip:sum('wip'),remaining:sum('remaining'),unit:rows[0].unit};
    }
    /** Make a fixed four-stage report from source records only, with unknown rate/finish. */
    static build(plan={},options={}){
      const labels=this.labels(options.language);
      const date=TnaWeeklyReportProjection.window(options)?.asOfDate||null;
      const blank={schema:'VESA-TNA-PRODUCTION-1',validity:'incomplete',
        audience:'internal-production-review',asOfDate:null,timezone:options.timezone||null,
        stageRows:[],operationRows:[],labels,
        counts:{stages:4,withRecordedOutput:0,needsQuantitySource:4,invalidOrOverlapping:0},
        verifiedRates:[],projectedStageEnds:[],warnings:[labels.note,labels.internalNotice]};
      if(!date)return {...blank,warnings:[labels.unknown,labels.internalNotice]};
      const asOfDay=TnaMasterReportProjection.day(date);
      const operations=Array.isArray(plan.operations)?plan.operations:[];
      const snapshots=Array.isArray(plan.baselineSnapshots)?plan.baselineSnapshots:[];
      const originalDates=new Map((Array.isArray(snapshots[0]?.taskDates)?snapshots[0].taskDates:[])
        .map(item=>[item.taskId,item.dates||{}]));
      const stageRows=[],allOperations=[];
      for(const def of this.stages()){
        const start=this.milestone(plan,def.start,asOfDay);
        const finish=this.milestone(plan,def.finish,asOfDay);
        const endTask=(Array.isArray(plan.tasks)?plan.tasks:[]).find(task=>task.templateRef===def.finish);
        const original=originalDates.get(endTask?.taskId);
        const baseline=TnaMasterReportProjection.asDate(original?.currentTargetFinish||original?.baselineFinish||null);
        const stageOps=operations.filter(item=>def.types.includes(String(item?.type||'').toLowerCase()))
          .map(item=>this.operation(item,def.code,labels));
        allOperations.push(...stageOps);
        const totals=this.combined(stageOps,labels);
        stageRows.push({code:def.code,label:labels.stages[def.code],startActual:start.actual,
          finishActual:finish.actual,completionAfterAsOf:finish.futureActual,
          confirmedBaseline:baseline,currentTarget:finish.current,forecastFinish:finish.forecast,
          taskStatus:finish.status,input:totals.input,completed:totals.completed,
          rejected:totals.rejected,reworked:totals.reworked,wip:totals.wip,
          remainingWithinInput:totals.remaining,unit:totals.unit,
          quantityState:totals.state,quantityScope:totals.scope,
          operationCount:stageOps.length,verifiedDailyOutput:null,projectedFinish:null});
      }
      return {...blank,validity:'valid',asOfDate:date,stageRows,operationRows:allOperations,
        counts:{stages:stageRows.length,
          withRecordedOutput:stageRows.filter(item=>item.completed!==null).length,
          needsQuantitySource:stageRows.filter(item=>item.quantityScope==='missing').length,
          invalidOrOverlapping:stageRows.filter(item=>item.quantityScope==='unreconciled').length},
        warnings:[labels.note,labels.internalNotice,labels.rateMissing]};
    }
    /**
     * Buyer mode can export only explicit allowlisted stage facts after a local
     * recipient review. Never include operation/lot IDs, factory, proof, source
     * record UUID, commercial notes, finance fields, rejected/WIP quantities
     * or internal free-text. A local checkbox is not independent authorization.
     */
    static buyer(plan={},options={}){
      const labels=this.labels(options.language);
      const allowed=options.recipientReviewed===true&&
        typeof options.authorizationSourceRef==='string'&&
        options.authorizationSourceRef.trim().length>0&&options.authorizationSourceRef.trim().length<=120;
      const blank={schema:'VESA-TNA-PRODUCTION-1',audience:'buyer-local-review',
        validity:'restricted',asOfDate:null,timezone:options.timezone||null,
        stageRows:[],operationRows:[],labels,
        counts:{stages:0,withRecordedOutput:0,needsQuantitySource:0,invalidOrOverlapping:0},
        verifiedRates:[],projectedStageEnds:[],warnings:[labels.restrictedNotice]};
      if(!allowed)return blank;
      const full=this.build(plan,options);
      if(full.validity!=='valid')return {...blank,warnings:[labels.unknown,labels.buyerNotice]};
      const rows=full.stageRows.map(row=>({code:row.code,label:row.label,
        startActual:row.startActual,finishActual:row.finishActual,
        currentTarget:row.currentTarget,forecastFinish:row.forecastFinish,
        completed:row.completed,unit:row.unit,quantityState:row.quantityState,
        verifiedDailyOutput:null,projectedFinish:null}));
      return {...blank,validity:'valid',asOfDate:full.asOfDate,stageRows:rows,
        counts:{stages:rows.length,withRecordedOutput:rows.filter(row=>row.completed!==null).length,
          needsQuantitySource:rows.filter(row=>row.completed===null).length,invalidOrOverlapping:0},
        warnings:[labels.buyerNotice,labels.rateMissing]};
    }
    /** Return a restricted/allowlisted model before common export adapters run. */
    static buyerReport(plan,report,language,generatedAt,timezone,options){
      const projection=this.buyer(plan,{...options,language,generatedAt,timezone});
      const source=projection.validity==='valid'?plan.order||{}:{};
      const safeQty=typeof source.totalQty==='number'&&Number.isFinite(source.totalQty)?
        source.totalQty:projection.labels.unknown;
      const order={
        buyer:typeof source.buyerName==='string'?source.buyerName:projection.labels.orderHidden,
        factory:projection.labels.orderHidden,
        style:typeof source.styles?.[0]?.styleNo==='string'?source.styles[0].styleNo:projection.labels.orderHidden,
        po:typeof source.poNumbers?.[0]==='string'?source.poNumbers[0]:projection.labels.orderHidden,
        quantity:safeQty,unit:typeof source.unit==='string'?source.unit:projection.labels.unitUnknown,
        requiredExFactory:projection.validity==='valid'?
          TnaMasterReportProjection.asDate(plan.commitments?.buyerRequiredExFactory)||projection.labels.unknown:
          projection.labels.orderHidden
      };
      const shared=I18N[language];
      return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:'R07',
        title:titleFor(report,language),language,languageName:shared.languageName,
        audience:'Buyer copy — local manual review, no server authorization',
        generatedAt,generatedLabel:formatDateTime(generatedAt,language),timezone,
        revision:projection.validity==='valid'?(plan.revision??0):0,baselineSnapshots:0,
        headings:shared.headings,labels:shared.labels,order,tasks:[],
        productionStatus:projection,warnings:projection.warnings.slice(),
        notes:[shared.labels.noFabrication,projection.validity==='valid'?
          projection.labels.buyerNotice:projection.labels.restrictedNotice],
        source:{recordId:null,schemaVersion:null,mode:'buyer-review-export'}};
    }
  }


  /**
   * R08 material/LC projection for INTERNAL commercial and sourcing staff.
   * LC applications, locally entered open dates, in-house dates and QC events
   * are separate facts. No rate, financing approval, supplier price, receipt,
   * bank authenticity or fabric cutting release is inferred.
   * Pure: accepts OrderPlan and civil report time; returns a new read-only model.
   */
  class TnaMaterialLcProjection {
    /** Fixed copy is translated; supplier-entered text is never changed. */
    static labels(language){
      const dict={
        en:{title:'Material & LC source register',unknown:'Needs Information',noMaterials:'No fabric/trims source records entered',
          internalNotice:'INTERNAL COMMERCIAL / SOURCING REVIEW ONLY. Supplier identities and LC details are restricted. No automatic buyer/factory sharing.',
          sourceWarning:'Entered master/B2B LC open dates are NOT independent bank authentication. Application is not opening; QCDate is not QC acceptance. A blank shortage is not zero. Do not release cutting from this report.',
          noPrice:'Supplier pricing, bank guarantees and commercial approvals are not included.',
          rejected:'External/buyer report not authorized; supplier, order and financing details are withheld.',
          master:'Master LC',fabric:'Fabric',trims:'Trims',other:'Other / accessory',
          recorded:'Locally recorded, independently unverified',future:'Entered event after report as-of; not yet evidenced',
          application:'B2B LC application',opened:'B2B LC open date (entered)',missing:'Not recorded',qcPending:'QC date alone does not prove acceptance',
          inHousePending:'In-house entry does not prove QC pass',shortageOpen:'Locally recorded shortage; action required',
          shortageZero:'Zero shortage entered locally; not independently verified',shortageUnknown:'Shortage not confirmed',
          columns:['Category','Material / source ID','Supplier','Country','Required Qty','Unit','Booking date','B2B application','B2B open date','In-house date','QC recorded date','Entered shortage','Availability / QC authority'],
          lcColumns:['LC type','Material ID / source','Application date','Entered open date','Evidence state'],
          asOf:'As of',buyerHidden:'Not included in external report'},
        bn:{title:'ম্যাটেরিয়াল ও LC নথি',unknown:'তথ্য প্রয়োজন',noMaterials:'ফ্যাব্রিক/ট্রিমস নথি নেই',
          internalNotice:'শুধু অভ্যন্তরীণ কমার্শিয়াল/সোর্সিং। সরবরাহকারী ও LC তথ্য সীমিত; অনুমতি ছাড়া পাঠাবেন না।',
          sourceWarning:'LC খোলার লেখা তারিখ ব্যাংক প্রমাণ নয়; আবেদন মানে LC খোলা নয়। QC তারিখ মানে অনুমোদন নয়; খালি ঘাটতি শূন্য নয়। এই রিপোর্ট থেকে কাটিং ছাড়পত্র নয়।',
          noPrice:'সরবরাহকারীর মূল্য/ব্যাংক গ্যারান্টি/কমার্শিয়াল অনুমোদন নেই।',
          rejected:'বাইরের রিপোর্ট অনুমোদিত নয়; সব উৎস/অর্ডার তথ্য গোপন।',
          master:'মাস্টার LC',fabric:'ফ্যাব্রিক',trims:'ট্রিমস',other:'অন্যান্য',
          recorded:'স্থানীয় নথি; স্বাধীনভাবে যাচাই হয়নি',future:'রিপোর্ট দিনের পরের তারিখ; নিশ্চিত নয়',
          application:'B2B আবেদন',opened:'B2B খোলার লেখা তারিখ',missing:'নথি নেই',qcPending:'QC তারিখ অনুমোদন নয়',
          inHousePending:'ইন-হাউস মানে QC অনুমোদন নয়',shortageOpen:'ঘাটতি লেখা আছে',shortageZero:'শূন্য ঘাটতি লেখা, যাচাই নয়',shortageUnknown:'ঘাটতির তথ্য নেই',
          columns:['শ্রেণি','ম্যাটেরিয়াল','সরবরাহকারী','দেশ','প্রয়োজনীয় পরিমাণ','একক','বুকিং','B2B আবেদন','B2B খোলা','ইন-হাউস','QC তারিখ','ঘাটতি','উপলব্ধতা/QC'],
          lcColumns:['LC ধরন','উৎস','আবেদন','খোলার লেখা তারিখ','প্রমাণ অবস্থা'],
          asOf:'তারিখ',buyerHidden:'বাইরের রিপোর্টে নেই'},
        hi:{title:'मटीरियल और LC रिकॉर्ड',unknown:'जानकारी चाहिए',noMaterials:'फैब्रिक/ट्रिम रिकॉर्ड नहीं',
          internalNotice:'केवल आंतरिक कमर्शियल/सोर्सिंग। सप्लायर और LC जानकारी गोपनीय; बिना अनुमति न भेजें।',
          sourceWarning:'दर्ज LC ओपन तारीख बैंक पुष्टि नहीं; आवेदन से LC नहीं खुलता। QC तारीख स्वीकृति नहीं; खाली शॉर्टेज शून्य नहीं। इस रिपोर्ट से कटिंग रिलीज़ नहीं।',
          noPrice:'सप्लायर कीमतें और बैंक/कमर्शियल मंजूरी शामिल नहीं।',
          rejected:'बाहरी कॉपी अधिकृत नहीं; स्रोत व ऑर्डर डेटा छिपाया गया।',
          master:'मास्टर LC',fabric:'फैब्रिक',trims:'ट्रिम्स',other:'अन्य',
          recorded:'स्थानीय रिकॉर्ड; स्वतंत्र सत्यापन नहीं',future:'रिपोर्ट के बाद की तारीख; पुष्ट नहीं',
          application:'B2B आवेदन',opened:'B2B खुलने की दर्ज तारीख',missing:'दर्ज नहीं',qcPending:'QC तारीख मंजूरी नहीं',
          inHousePending:'इन-हाउस QC पास नहीं',shortageOpen:'शॉर्टेज दर्ज है',shortageZero:'शून्य दर्ज, सत्यापित नहीं',shortageUnknown:'शॉर्टेज अज्ञात',
          columns:['श्रेणी','मटीरियल','सप्लायर','देश','जरूरी मात्रा','इकाई','बुकिंग','B2B आवेदन','B2B खुला','इन-हाउस','QC तारीख','शॉर्टेज','उपलब्धता/QC'],
          lcColumns:['LC प्रकार','स्रोत','आवेदन','खुलने की दर्ज तारीख','प्रमाण'],
          asOf:'तारीख',buyerHidden:'बाहरी रिपोर्ट में नहीं'},
        ta:{title:'Material & LC பதிவுகள்',unknown:'தகவல் தேவை',noMaterials:'Fabric/Trims பதிவு இல்லை',
          internalNotice:'Commercial/Sourcing உள் ஆய்வுக்கு மட்டும். Supplier மற்றும் LC விவரங்கள் தனிப்பட்டவை. அனுமதி இல்லாமல் பகிர வேண்டாம்.',
          sourceWarning:'பதிந்த LC opening தேதி என்பது வங்கியின் உறுதி அல்ல. Application என்பது LC open அல்ல. QC தேதி என்பது QC pass அல்ல. Shortage காலியாக இருந்தால் zero அல்ல. இதனால் cutting release கிடையாது.',
          noPrice:'Supplier price, bank guarantee மற்றும் Commercial approval இதில் இல்லை.',
          rejected:'வெளி Buyer அறிக்கைக்கு அனுமதி இல்லை; order/supplier/LC விவரம் மறைக்கப்பட்டது.',
          master:'Master LC',fabric:'Fabric',trims:'Trims',other:'Other',
          recorded:'உள்ளூர் பதிவு; வெளி சரிபார்ப்பு இல்லை',future:'Report தேதிக்குப் பிறகான பதிவு; உறுதி இல்லை',
          application:'B2B விண்ணப்பம்',opened:'B2B திறப்பு தேதி (பதிவு)',missing:'பதிவு இல்லை',qcPending:'QC தேதி மட்டும் QC pass அல்ல',
          inHousePending:'In-house பதிவு QC pass அல்ல',shortageOpen:'பதிந்த shortage உள்ளது',shortageZero:'Zero shortage பதிவானது; வெளி உறுதி இல்லை',shortageUnknown:'Shortage உறுதி இல்லை',
          columns:['வகை','Material ID','Supplier','நாடு','தேவையான அளவு','அலகு','Booking தேதி','B2B விண்ணப்பம்','B2B திறப்பு','In-house தேதி','QC தேதி','பதிந்த Shortage','Availability/QC ஆதாரம்'],
          lcColumns:['LC வகை','Material ID','விண்ணப்ப தேதி','திறந்ததாகப் பதிந்த தேதி','ஆதார நிலை'],
          asOf:'அறிக்கை தேதி',buyerHidden:'வெளி அறிக்கையில் இல்லை'}
      };
      return dict[language]||dict.en;
    }
    /** Strictly accept source civil dates; malformed/future values never prove receipt. */
    static civil(value,asOfDay){
      const recorded=TnaMasterReportProjection.asDate(value);
      const day=TnaMasterReportProjection.day(recorded);
      return {date:recorded,occurredAsOf:day!==null&&day<=asOfDay,
        future:day!==null&&day>asOfDay};
    }
    /** One material without default zero shortages, fake approvals or inferred LC. */
    static material(source,labels,asOfDay){
      const rawCategory=String(source?.category||'').toLowerCase();
      const category=rawCategory==='fabric'?'fabric':['trim','trims','accessory','accessories'].includes(rawCategory)?'trims':'other';
      const text=value=>typeof value==='string'&&value.trim()?value.trim():null;
      const typed=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
      const required=typed(source?.requiredQty),shortage=typed(source?.shortageQty);
      const booking=this.civil(source?.bookingDate,asOfDay),apply=this.civil(source?.b2bLcApplicationDate,asOfDay);
      const opened=this.civil(source?.b2bLcOpenDate,asOfDay),inHouse=this.civil(source?.inHouseDate,asOfDay);
      const qc=this.civil(source?.QCDate,asOfDay);
      // A stored QCDate represents a date, never an authorized QC decision.
      const qcStatus=qc.occurredAsOf?labels.qcPending:inHouse.occurredAsOf?
        labels.inHousePending:labels.unknown;
      const shortageStatus=shortage===null?labels.shortageUnknown:shortage>0?
        labels.shortageOpen:labels.shortageZero;
      return {category,categoryLabel:labels[category],materialId:text(source?.materialId)||labels.unknown,
        supplier:text(source?.supplier)||labels.unknown,country:text(source?.country)||labels.unknown,
        requiredQty:required,unit:text(source?.unit)||labels.unknown,
        bookingDate:booking.date,b2bApplicationDate:apply.date,b2bOpenDate:opened.date,
        inHouseDate:inHouse.date,qcDate:qc.date,shortageQty:shortage,
        shortageStatus,qcStatus,
        bankAuthenticated:false,qcAccepted:false,cuttingReleased:false,
        availabilityStatus:shortage===null?labels.shortageUnknown:
          shortage>0?labels.shortageOpen:qcStatus,
        b2bState:opened.occurredAsOf?labels.recorded:
          apply.occurredAsOf?labels.application:labels.missing,
        b2bOccurredAsOf:opened.occurredAsOf,
        openAfterAsOf:opened.future,bookingAfterAsOf:booking.future,
        sourceStatus:labels.recorded};
    }
    /** Consumes approved existing OrderPlan material/commitment field names only. */
    static build(plan={},options={}){
      const labels=this.labels(options.language);
      const date=TnaWeeklyReportProjection.window(options)?.asOfDate||null;
      const blank={schema:'VESA-TNA-MATERIAL-LC-1',validity:'incomplete',
        audience:'internal-commercial-sourcing',asOfDate:null,timezone:options.timezone||null,
        masterLc:{enteredOpenedOn:null,occurredAsOf:false,bankAuthenticated:false,
          status:labels.missing},materials:[],counts:{total:0,fabric:0,trims:0,other:0,
          lcApplications:0,enteredB2bOpens:0,missingShortage:0},
        labels,warnings:[labels.internalNotice,labels.sourceWarning,labels.noPrice]};
      if(!date)return {...blank,warnings:[labels.unknown,labels.internalNotice]};
      const asOfDay=TnaMasterReportProjection.day(date);
      const sourceLc=this.civil(plan.commitments?.masterLcOpenedOn,asOfDay);
      const list=(Array.isArray(plan.materials)?plan.materials:[])
        .map(item=>this.material(item,labels,asOfDay));
      const counts={total:list.length,
        fabric:list.filter(item=>item.category==='fabric').length,
        trims:list.filter(item=>item.category==='trims').length,
        other:list.filter(item=>item.category==='other').length,
        lcApplications:list.filter(item=>item.b2bApplicationDate).length,
        enteredB2bOpens:list.filter(item=>item.b2bOccurredAsOf).length,
        missingShortage:list.filter(item=>item.shortageQty===null).length};
      return {...blank,validity:'valid',asOfDate:date,materials:list,counts,
        masterLc:{enteredOpenedOn:sourceLc.date,occurredAsOf:sourceLc.occurredAsOf,
          bankAuthenticated:false,status:sourceLc.future?labels.future:
            sourceLc.occurredAsOf?labels.recorded:labels.missing},
        warnings:[labels.internalNotice,labels.sourceWarning,labels.noPrice,
          ...(list.length?[]:[labels.noMaterials])]};
    }
    /** Explicitly refuse external/Buyer model before shared report serializers run. */
    static blockedReport(report,language,generatedAt,timezone){
      const labels=this.labels(language),shared=I18N[language];
      return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:'R08',
        title:titleFor(report,language),language,languageName:shared.languageName,
        audience:'External material and LC distribution not authorized',
        generatedAt,generatedLabel:formatDateTime(generatedAt,language),timezone,
        revision:0,baselineSnapshots:0,headings:shared.headings,labels:shared.labels,
        order:{buyer:labels.buyerHidden,factory:labels.buyerHidden,style:labels.buyerHidden,
          po:labels.buyerHidden,quantity:labels.buyerHidden,unit:labels.buyerHidden,
          requiredExFactory:labels.buyerHidden},
        tasks:[],materialLc:{schema:'VESA-TNA-MATERIAL-LC-1',
          validity:'restricted',audience:'external-blocked',asOfDate:null,timezone,
          masterLc:{enteredOpenedOn:null,occurredAsOf:false,bankAuthenticated:false,status:labels.rejected},
          materials:[],counts:{total:0},labels,warnings:[labels.rejected]},
        warnings:[labels.rejected],notes:[labels.rejected],
        source:{recordId:null,schemaVersion:null,mode:'restricted-external'}};
    }
  }


  /**
   * R09 owns a read-only, local quality/shipping evidence register.
   * Input: existing shipmentLots, task milestones and optional local PPM/AQL
   * integration references. Output: recorded lot balances and unresolved gates;
   * no independent AQL pass, PPM GO, carrier confirmation, shipment release or
   * actual dispatch is inferred. Saved plans and calculation engines are frozen.
   * External audience is blocked BEFORE common task/order serialization.
   */
  class TnaShipmentReadinessProjection {
    /** Four-language fixed headings, never translate business-entered values. */
    static labels(language){
      const words={
        en:{title:'Shipment readiness — local source review',unknown:'Needs Information',
          notice:'INTERNAL QUALITY / SHIPPING ONLY. Entered packed, passed or shipped quantities and linked decisions are NOT independently verified release. Check recipient permission before sharing.',
          basis:'Lot quantities are the latest locally saved snapshots (zeros may be form defaults), NOT historical output as-of the report date. An entered booking reference is not a carrier confirmation. ETD/ETA are recorded date fields, not proven sailing or arrival.',
          hold:'Shipment release is NOT authorized by this report. Final AQL disposition, PPM/cutting approval, packing list, commercial documents and carrier confirmation require independent reviewed evidence.',
          noLots:'No shipment lots recorded',noMilestone:'Activity not in this garment template',
          noLinks:'No independently reviewed PPM/AQL outcome available',
          missingQty:'Missing or invalid quantity / PO allocation',
          sourceQty:'Locally recorded; not independently accepted',
          conflict:'Quantity, lot or PO reconciliation conflict — totals withheld',
          missingDates:'Required booking, documents or ex-factory evidence not recorded',
          entered:'Entered (not externally confirmed)',future:'Future entered actual; not as-of completion',
          notRelease:'Recorded decision; shipment release NOT verified',
          restricted:'External shipment report not authorized: no order, lot, buyer, factory or shipping information is disclosed.',
          refState:'Local reference identity/provenance only; NOT authenticated final inspection.',
          sections:{lots:'Lot quantity register',dates:'Lot shipping dates',gates:'Quality & document checkpoints',links:'Local PPM / AQL references'},
          lotHeaders:['Lot','Local status','PO allocation','Planned','Packed','Passed (entered)','Shipped (entered)','Balance vs planned','Unit','Booking reference','Inspection reference','Quantity source / gate'],
          dateHeaders:['Lot','Requested ex-factory','Current ex-factory','Forecast ex-factory','Entered actual ex-factory','ETD (type unverified)','ETA (type unverified)','Date warning'],
          gateHeaders:['Checkpoint','Record status','Current target','Forecast','Recorded actual as-of','Evidence / authority'],
          linkHeaders:['Source','Local reference state','Recorded decision','Release authority'],
          allocationHeaders:['Lot','PO','Allocated quantity','Reconciliation'],
          asOf:'As of',missing:'Not recorded',noAuthority:'Independent release authority not verified',
          actualUnverified:'Recorded task completion — evidence not independently reviewed',
          futureActual:'Task completion date is after report as-of',
          recordedStatus:'Locally entered status only',sourceIncomplete:'Source date / status not verified'},
        bn:{title:'শিপমেন্ট প্রস্তুতি — স্থানীয় নথি',unknown:'তথ্য প্রয়োজন',
          notice:'শুধু অভ্যন্তরীণ কোয়ালিটি/শিপিং। লেখা packed/passed/shipped বা লিংক করা সিদ্ধান্ত স্বাধীন অনুমোদন নয়। পাঠানোর আগে অনুমতি যাচাই করুন।',
          basis:'লট পরিমাণ সর্বশেষ স্থানীয় রেকর্ড, ঐ দিনের ইতিহাস নয়। বুকিং রেফারেন্স মানে ক্যারিয়ার নিশ্চিত নয়। ETD/ETA লিখিত তারিখ, বাস্তব যাত্রা নয়।',
          hold:'এই রিপোর্ট শিপমেন্ট ছাড়পত্র নয়। AQL, PPM, প্যাকিং তালিকা, ডকুমেন্ট ও ক্যারিয়ার প্রমাণ আলাদাভাবে যাচাই দরকার।',
          noLots:'কোন শিপমেন্ট লট নেই',noMilestone:'এই টেমপ্লেটে নেই',noLinks:'PPM/AQL স্বাধীন সিদ্ধান্ত যাচাই হয়নি',
          missingQty:'পরিমাণ/PO তথ্য নেই বা ভুল',sourceQty:'স্থানীয় রেকর্ড; অনুমোদিত নয়',
          conflict:'লট/PO/পরিমাণ মিলছে না — মোট দেখানো হয়নি',missingDates:'বুকিং/ডকুমেন্ট/এক্স-ফ্যাক্টরি প্রমাণ নেই',
          entered:'লেখা আছে, বাইরের নিশ্চিত নয়',future:'রিপোর্টের পরে বাস্তব তারিখ',notRelease:'সিদ্ধান্ত লেখা, ছাড়পত্র নয়',
          restricted:'বাইরে শিপমেন্ট রিপোর্ট অনুমোদিত নয়; অর্ডার/লট/কারখানা তথ্য গোপন।',
          refState:'স্থানীয় রেফারেন্স পরিচয়; AQL অনুমোদন নয়',
          sections:{lots:'লট পরিমাণ',dates:'শিপমেন্ট তারিখ',gates:'গুণমান ও ডকুমেন্ট',links:'স্থানীয় PPM/AQL রেফারেন্স'},
          lotHeaders:['লট','অবস্থা','PO বরাদ্দ','পরিকল্পিত','প্যাকড','পাস লেখা','শিপ লেখা','বাকি','একক','বুকিং রেফারেন্স','ইন্সপেকশন রেফারেন্স','উৎস/গেট'],
          dateHeaders:['লট','প্রয়োজনীয় এক্স-ফ্যাক্টরি','বর্তমান','পূর্বাভাস','লেখা বাস্তব','ETD','ETA','সতর্কতা'],
          gateHeaders:['চেকপয়েন্ট','লেখা অবস্থা','লক্ষ্য','পূর্বাভাস','বাস্তব তারিখ','প্রমাণ/অনুমতি'],
          linkHeaders:['উৎস','রেফারেন্স অবস্থা','লেখা সিদ্ধান্ত','ছাড়পত্র'],
          allocationHeaders:['লট','PO','বরাদ্দ','মিল'],
          asOf:'তারিখ',missing:'রেকর্ড নেই',noAuthority:'স্বাধীন ছাড়পত্র যাচাই হয়নি',
          actualUnverified:'সমাপ্ত লেখা; স্বতন্ত্র প্রমাণ নেই',futureActual:'রিপোর্টের পরে সমাপ্তি',recordedStatus:'স্থানীয় অবস্থা',sourceIncomplete:'উৎস প্রমাণ নেই'},
        hi:{title:'शिपमेंट तैयारी — स्थानीय रिकॉर्ड',unknown:'जानकारी चाहिए',
          notice:'केवल आंतरिक क्वालिटी/शिपिंग। दर्ज पैक/पास/शिप मात्रा या लिंक निर्णय स्वतंत्र रिलीज़ नहीं। भेजने से पहले अनुमति जाँचें।',
          basis:'लॉट मात्रा नवीनतम स्थानीय रिकॉर्ड है, पुरानी तारीख की मात्रा नहीं। बुकिंग रेफरेंस कैरियर पुष्टि नहीं; ETD/ETA दर्ज तारीखें हैं।',
          hold:'यह रिपोर्ट शिपमेंट रिलीज़ नहीं है। AQL, PPM, पैकिंग सूची, दस्तावेज़ और कैरियर साक्ष्य अलग चाहिए।',
          noLots:'कोई शिपमेंट लॉट नहीं',noMilestone:'टेम्पलेट में नहीं',noLinks:'PPM/AQL का स्वतंत्र निर्णय नहीं',
          missingQty:'मात्रा/PO जानकारी गलत या नहीं',sourceQty:'स्थानीय रिकॉर्ड; स्वीकृत नहीं',
          conflict:'लॉट/PO मात्रा मेल नहीं — कुल छिपाया',missingDates:'बुकिंग/दस्तावेज़/एक्स-फैक्टरी प्रमाण नहीं',
          entered:'दर्ज, बाहर से पुष्टि नहीं',future:'रिपोर्ट बाद की असली तारीख',notRelease:'दर्ज निर्णय; रिलीज़ नहीं',
          restricted:'बाहरी शिपमेंट रिपोर्ट की अनुमति नहीं; ऑर्डर/लॉट/फैक्ट्री जानकारी छिपाई गई।',
          refState:'स्थानीय रेफरेंस, अंतिम AQL अनुमति नहीं',
          sections:{lots:'लॉट मात्रा',dates:'शिपमेंट तारीखें',gates:'क्वालिटी और दस्तावेज़',links:'स्थानीय PPM/AQL रेफरेंस'},
          lotHeaders:['लॉट','स्थिति','PO आवंटन','योजना','पैक्ड','पास दर्ज','शिप दर्ज','शेष','इकाई','बुकिंग रेफरेंस','निरीक्षण रेफरेंस','स्रोत/गेट'],
          dateHeaders:['लॉट','जरूरी एक्स-फैक्टरी','वर्तमान','पूर्वानुमान','दर्ज असली','ETD','ETA','सावधानी'],
          gateHeaders:['चेकपॉइंट','दर्ज स्थिति','लक्ष्य','पूर्वानुमान','असली तारीख','प्रमाण/अनुमति'],
          linkHeaders:['स्रोत','स्थानीय रेफरेंस','दर्ज फैसला','रिलीज़'],
          allocationHeaders:['लॉट','PO','आवंटन','मिलान'],
          asOf:'रिपोर्ट तारीख',missing:'दर्ज नहीं',noAuthority:'स्वतंत्र रिलीज़ मंजूर नहीं',
          actualUnverified:'पूर्ण दर्ज; स्वतंत्र प्रमाण नहीं',futureActual:'रिपोर्ट के बाद पूरा',recordedStatus:'स्थानीय स्थिति',sourceIncomplete:'प्रमाण नहीं'},
        ta:{title:'Shipment Readiness — உள்ளூர் பதிவுகள்',unknown:'தகவல் தேவை',
          notice:'Quality / Shipping உள் ஆய்வுக்கு மட்டும். பதிவு செய்த Packed/Passed/Shipped அல்லது இணைக்கப்பட்ட PPM/AQL முடிவுகள் தானாக Shipment Release அல்ல. பகிரும் முன் அனுமதி பார்க்கவும்.',
          basis:'Lot எண்ணிக்கை கடைசியாக உள்ளூரில் பதிந்தது மட்டுமே; report நாளின் வரலாறு அல்ல. Booking reference என்பது carrier confirmation அல்ல. ETD/ETA பதிவு மட்டும்.',
          hold:'இந்த report Shipment Release அனுமதி அல்ல. Final AQL, PPM, packing list, shipping documents, carrier உறுதி தனியாகச் சரிபார்க்கப்பட வேண்டும்.',
          noLots:'Shipment lot பதிவாகவில்லை',noMilestone:'இந்த template-இல் checkpoint இல்லை',noLinks:'PPM/AQL முடிவுக்கு தனி உறுதி இல்லை',
          missingQty:'Quantity / PO allocation குறைவு அல்லது தவறு',sourceQty:'உள்ளூர் பதிவு; வெளி உறுதி இல்லை',
          conflict:'Lot / PO எண்ணிக்கை பொருந்தவில்லை — மொத்தம் மறைக்கப்பட்டது',
          missingDates:'Booking/Documents/Ex-factory ஆதாரம் பதிவு இல்லை',
          entered:'பதிவு; வெளி உறுதி இல்லை',future:'Report தேதிக்குப் பிந்தைய Actual',notRelease:'உள்ளூரில் பதிந்த நிலை; release உறுதி இல்லை',
          restricted:'வெளிப்புற Shipment report-க்கு அனுமதி இல்லை. Order, Lot, Factory தகவல் மறைக்கப்பட்டது.',
          refState:'உள்ளூர் reference மட்டும்; Final AQL ஒப்புதல் அல்ல',
          sections:{lots:'Lot எண்ணிக்கை',dates:'Shipment தேதிகள்',gates:'Quality / Document checkpoints',links:'உள்ளூர் PPM / AQL இணைப்புகள்'},
          lotHeaders:['Lot','பதிந்த நிலை','PO ஒதுக்கீடு','Planned','Packed','Passed பதிவு','Shipped பதிவு','மீதி','Unit','Booking Ref','Inspection Ref','ஆதாரம் / Gate'],
          dateHeaders:['Lot','கோரிய Ex-factory','இப்போதைய தேதி','Forecast','பதிந்த Actual','ETD','ETA','தேதி குறிப்பு'],
          gateHeaders:['செயல்','பதிந்த நிலை','Current','Forecast','Actual நாள்','ஆதாரம்'],
          linkHeaders:['ஆப்','உள்ளூர் Reference','பதிந்த முடிவு','Release ஆதாரம்'],
          allocationHeaders:['Lot','PO','ஒதுக்கீடு','பொருத்தம்'],
          asOf:'அறிக்கை தேதி',missing:'பதிவு இல்லை',noAuthority:'தனி Shipment Release ஆதாரம் இல்லை',
          actualUnverified:'முடிந்ததாகப் பதிந்தது; தனி உறுதி இல்லை',futureActual:'Report தேதிக்கு பின்னான Actual',recordedStatus:'பதிந்த நிலை மட்டும்',sourceIncomplete:'ஆதாரம் உறுதி இல்லை'}
      };
      return words[language]||words.en;
    }
    /** A checkpoint status alone is not an approved or inspected decision. */
    static gates(plan,asOfDay,labels){
      const refs=['PP08','PP10','Q06','Q07','Q08','PK04','PK05','S01','S02','S04','S06','S08'];
      const tasks=Array.isArray(plan.tasks)?plan.tasks:[];
      return refs.map(ref=>{
        const task=tasks.find(t=>t.templateRef===ref);
        const dates=task?.dates||{};
        const actual=TnaMasterReportProjection.asDate(dates.actualFinish);
        const actualDay=TnaMasterReportProjection.day(actual);
        const recordedCompletion=task?.status==='completed'&&actualDay!==null&&actualDay<=asOfDay;
        return {ref,status:typeof task?.status==='string'?task.status:labels.unknown,
          currentTarget:TnaMasterReportProjection.asDate(dates.currentTargetFinish),
          forecast:TnaMasterReportProjection.asDate(dates.forecastFinish),
          actualAsOf:recordedCompletion?actual:null,actualAfterAsOf:actualDay!==null&&actualDay>asOfDay,
          evidenceState:recordedCompletion?labels.actualUnverified:
            actualDay!==null&&actualDay>asOfDay?labels.futureActual:
              task?labels.sourceIncomplete:labels.noMilestone,
          verifiedDecision:false};
      });
    }
    /** A valid reference carries local verifier identity only, not AQL/PPM authority. */
    static integration(plan,labels){
      const lib=root.VesaTnaIntegrationReferences||
        (typeof require==='function'?require('./integration-references.js'):null);
      const refs=Array.isArray(plan.integrationReferences)?plan.integrationReferences:[];
      return ['ppm','aql'].map(type=>{
        const matches=refs.filter(r=>r?.sourceApp===type).map(ref=>
          lib?.assessReference?.(ref,plan)).filter(Boolean);
        const valid=matches.filter(item=>item.verified);
        return {source:type.toUpperCase(),referenceState:valid.length===1?
          labels.refState:valid.length>1?labels.conflict:labels.noLinks,
          recordedDecision:valid.length===1?valid[0].reference.recordedStatus:null,
          releaseAuthorityVerified:false,locallyMatched:valid.length===1};
      });
    }
    /** Strictly validate all lot numbers and PO allocations BEFORE calling engine. */
    static quantityAudit(plan,lots,labels){
      const orderQty=plan.order?.totalQty;
      const orderUnit=typeof plan.order?.unit==='string'?plan.order.unit.toLowerCase():'';
      const pieces=['pcs','piece','pieces'].includes(orderUnit);
      const numeric=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&(!pieces||Number.isInteger(v));
      const errors=[],identifiers=new Set();
      if(!numeric(orderQty)||orderQty<=0)errors.push(labels.missingQty);
      const allowedPos=new Set(Array.isArray(plan.order?.poNumbers)?plan.order.poNumbers:[]);
      const poRows=[];
      for(const lot of lots){
        const ref=typeof lot?.lotReference==='string'?lot.lotReference.trim():'';
        if(!ref||identifiers.has(ref.toLowerCase()))errors.push(labels.conflict);
        identifiers.add(ref.toLowerCase());
        for(const field of ['plannedQty','packedQty','passedQty','shippedQty'])
          if(!numeric(lot?.[field]))errors.push(labels.missingQty);
        const allocations=Array.isArray(lot?.poAllocation)?lot.poAllocation:[];
        if(!allocations.length)errors.push(labels.missingQty);
        let allocated=0;
        for(const a of allocations){
          if(typeof a?.poNumber!=='string'||!allowedPos.has(a.poNumber)||!numeric(a.qty))
            errors.push(labels.missingQty);
          else allocated+=a.qty;
          poRows.push({lotRef:ref||labels.unknown,
            po:typeof a?.poNumber==='string'?a.poNumber:labels.unknown,
            quantity:numeric(a?.qty)?a.qty:null,locallyReconciled:false});
        }
        if(numeric(lot?.plannedQty)&&allocated!==lot.plannedQty)errors.push(labels.conflict);
        if(numeric(lot?.plannedQty)&&lot.plannedQty<=0)errors.push(labels.missingQty);
        if(numeric(lot?.packedQty)&&numeric(lot?.plannedQty)&&lot.packedQty>lot.plannedQty)errors.push(labels.conflict);
        if(numeric(lot?.passedQty)&&numeric(lot?.packedQty)&&lot.passedQty>lot.packedQty)errors.push(labels.conflict);
        if(numeric(lot?.shippedQty)&&numeric(lot?.passedQty)&&lot.shippedQty>lot.passedQty)errors.push(labels.conflict);
      }
      if(errors.length)return {valid:false,errors:[...new Set(errors)],poRows,totals:null};
      const engine=root.VesaTnaOperations||
        (typeof require==='function'?require('./operations.js'):null);
      if(!engine?.reconcileShipmentLots)return {valid:false,errors:[labels.missingQty],poRows,totals:null};
      // Explicit false prevents a local AQL reference from being upgraded to release.
      const result=engine.reconcileShipmentLots(orderQty,lots,{inspectionPassed:false});
      const arithmeticErrors=(result.errors||[]).filter(message=>
        !message.includes('Shipment cannot be released without a verified final inspection pass.'));
      if(arithmeticErrors.length)return {valid:false,errors:arithmeticErrors,poRows,totals:null};
      return {valid:true,errors:(result.errors||[]).slice(),poRows:poRows.map(row=>({
        ...row,locallyReconciled:true})),
        totals:{orderQty:result.orderQty,planned:result.plannedQty,packed:result.packedQty,
          passed:result.passedQty,shipped:result.shippedQty,unallocated:result.unplannedQty,
          balanceAgainstOrder:result.remainingQty,wholeOrderPlanned:result.wholeOrderPlanned,
          wholeOrderShippedEntered:result.wholeOrderShipped},
        releaseAuthorized:false};
    }
    /** Keep source dates distinct; even "actual" requires independent handover proof. */
    static lotDates(lot,asOfDay,labels){
      const date=value=>TnaMasterReportProjection.asDate(value);
      const actual=date(lot.actualExFactory);
      const actualDay=TnaMasterReportProjection.day(actual);
      return {requestedExFactory:date(lot.requestedExFactory),
        currentExFactory:date(lot.currentExFactory),
        forecastExFactory:date(lot.forecastExFactory),
        enteredActualExFactory:actual,
        actualRecordedAsOf:actualDay!==null&&actualDay<=asOfDay,
        ETD:date(lot.ETD),ETA:date(lot.ETA),
        dateWarning:actualDay!==null&&actualDay>asOfDay?labels.future:
          actual?labels.entered:labels.missingDates};
    }
    /** Source rows are never silently discarded; invalid numbers are withheld. */
    static lots(plan,lots,asOfDay,labels,checked){
      const unit=typeof plan.order?.unit==='string'&&plan.order.unit.trim()?
        plan.order.unit.trim():labels.unknown;
      const validNumbers=checked.valid;
      return lots.map(lot=>{
        const text=v=>typeof v==='string'&&v.trim()?v.trim():null;
        const qty=v=>validNumbers&&typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
        return {lotReference:text(lot?.lotReference)||labels.unknown,
          localStatus:text(lot?.status)||labels.unknown,
          poAllocation:Array.isArray(lot?.poAllocation)?lot.poAllocation.filter(a=>
            typeof a?.poNumber==='string').map(a=>a.poNumber).join(', '):'',
          plannedQty:qty(lot?.plannedQty),packedQty:qty(lot?.packedQty),
          passedQty:qty(lot?.passedQty),shippedQty:qty(lot?.shippedQty),
          remainingWithinLot:validNumbers?lot.plannedQty-lot.shippedQty:null,
          unit,bookingRef:text(lot?.bookingRef),inspectionRef:text(lot?.inspectionRef),
          quantityState:validNumbers?labels.sourceQty:labels.conflict,
          ...this.lotDates(lot,asOfDay,labels),
          bookingConfirmed:false,inspectionPassedVerified:false,
          dispatchReleased:false,documentAcceptanceVerified:false};
      });
    }
    /** An independent recipient policy is unavailable; external mode fails closed. */
    static blockedReport(report,language,generatedAt,timezone){
      const labels=this.labels(language),shared=I18N[language];
      return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:'R09',
        title:titleFor(report,language),language,languageName:shared.languageName,
        audience:'External shipment report not authorized',
        generatedAt,generatedLabel:formatDateTime(generatedAt,language),timezone,
        revision:0,baselineSnapshots:0,headings:shared.headings,labels:shared.labels,
        order:{buyer:labels.restricted,factory:labels.restricted,style:labels.restricted,
          po:labels.restricted,quantity:labels.unknown,unit:labels.unknown,
          requiredExFactory:labels.unknown},tasks:[],
        shipmentReadiness:{schema:'VESA-TNA-SHIPMENT-1',validity:'restricted',
          audience:'external-blocked',asOfDate:null,timezone,lots:[],
          poAllocations:[],gates:[],integrations:[],totals:null,
          errors:[],labels,counts:{lotCount:0,reportedShippedQty:null},
          releaseAuthorized:false,externalDecisionsVerified:false,
          warnings:[labels.restricted]},
        warnings:[labels.restricted],notes:[labels.restricted],
        source:{recordId:null,schemaVersion:null,mode:'restricted-external'}};
    }
    /**
     * Produce an internal management snapshot. Never calculate a shipment
     * readiness PASS: even a coherent lot and locally linked CONFORMED
     * inspection lack trusted external authority on this static browser app.
     */
    static build(plan={},options={}){
      const labels=this.labels(options.language);
      const period=TnaWeeklyReportProjection.window(options);
      const blank={schema:'VESA-TNA-SHIPMENT-1',validity:'incomplete',
        audience:'internal-quality-shipping',timezone:options.timezone||null,
        asOfDate:null,lots:[],poAllocations:[],gates:[],integrations:[],
        totals:null,errors:[],labels,
        counts:{lotCount:0,reportedShippedQty:null},
        releaseAuthorized:false,externalDecisionsVerified:false,
        warnings:[labels.notice,labels.basis,labels.hold]};
      if(!period)return {...blank,warnings:[labels.unknown,labels.hold]};
      const lots=Array.isArray(plan.shipmentLots)?plan.shipmentLots:[];
      const checked=this.quantityAudit(plan,lots,labels);
      const rows=this.lots(plan,lots,period.today,labels,checked);
      const integrations=this.integration(plan,labels);
      const gates=this.gates(plan,period.today,labels);
      const totals=lots.length&&checked.valid?checked.totals:null;
      const warnings=[labels.notice,labels.basis,labels.hold,
        ...(!lots.length?[labels.noLots]:[]),...checked.errors];
      return {...blank,validity:checked.valid?'valid':'incomplete',
        asOfDate:period.asOfDate,lots:rows,poAllocations:checked.poRows,
        gates,integrations,totals,errors:checked.errors,
        counts:{lotCount:rows.length,reportedShippedQty:totals?.shipped??null},
        warnings:[...new Set(warnings)]};
    }
  }


  /**
   * R10 pure browser-local portfolio management report. Receives a snapshot
   * prepared by the storage adapter from one current browser-user key.
   * Verifies anchor, owner, tenant and IDs once more. Cannot discover other
   * users' plans or treat browser session visibility as server authorization.
   * Critical path forecast is populated ONLY through the existing R04
   * factory-calendar-confirmed CPM path; otherwise the next due action is
   * visibly NONCRITICAL and all invented forecasts remain unknown.
   */
  class TnaPortfolioProjection {
    static labels(language){
      const dict={
        en:{title:'Saved-order portfolio / Multi-PO',unknown:'Needs Information',
          notice:'INTERNAL MANAGEMENT / SOURCING REVIEW ONLY. Records are saved in this browser for the current local user. This is NOT secure cross-company permission or a shared cloud dashboard. Review recipients before any manual transfer.',
          basis:'Only compatible saved records for the same local owner and tenant as the open saved TNA appear. Unsaved edits and autosave drafts are excluded. Dates, task blockers, PO quantities and CPM calculation are distinct; no buyer-approved recovery, release or production rate is inferred.',
          noAnchor:'Save the current TNA with Save Now, then reopen it to prepare a saved-order portfolio.',
          unavailable:'Saved local order data could not be safely read. No portfolio totals or private records exported.',
          empty:'No saved orders match the selected filters.',excluded:'Some saved entries could not be included because their format or local scope differed; none were exported.',
          noCalendar:'CPM unavailable: user-confirmed factory calendar and valid scheduling data required.',
          taskNotCritical:'Next recorded due activity (criticality not verified)',
          critical:'Calculated controlling activity (locally confirmed calendar, not buyer promise)',
          needAction:'No open task with recorded due date',
          blocker:'Recorded blocker / pending approval',blocked:'Blocked (locally recorded)',
          overdue:'Buyer-required date passed; actual release unverified',late:'Locally calculated forecast beyond required date',
          planning:'Planning dates only; no delivery approval',unknownRisk:'Needs Information',
          actualNotice:'S04 completion is only a locally recorded ex-factory milestone, NOT independently authenticated dispatch.',
          noAllocation:'Multiple PO numbers: per-PO quantity allocation is not recorded. Order total must not be copied to each PO.',
          singlePo:'Single PO, local order total only; source not independently accepted',
          neutral:'Local saved-order portfolio',missing:'Not recorded',asOf:'As of',
          filters:['Buyer','Factory','PO','All saved local orders'],
          headers:['Buyer','Factory','Style','PO references','Order quantity','Unit','Revision','Original required date','Current required date','Calculated CPM finish','Recorded S04 as-of','Source status','Next action','Risk / blocker'],
          poHeaders:['Buyer','Factory','Style','PO','Allocated quantity','Unit','Source / allocation'],
          actionHeaders:['PO','Task ref','Activity','Owner','Current target','Action type','Local task status'],
          statuses:{blocked:'Blocked / rejected (local)',approval:'Awaiting approval (not independently verified)',
            due:'Due date next',critical:'Critical path calculated',unknown:'Not recorded'},
          scope:'Local profile only; source user is not secure server authorization',
          restricted:'External portfolio report is not authorized. No buyer, factory, PO, quantity, owner or task data is included.'},
        bn:{title:'সংরক্ষিত অর্ডার / একাধিক PO',unknown:'তথ্য প্রয়োজন',
          notice:'শুধু অভ্যন্তরীণ ব্যবস্থাপনা। এই ব্রাউজারের বর্তমান স্থানীয় ব্যবহারকারীর সংরক্ষিত অর্ডার। এটি নিরাপদ ক্লাউড অনুমোদন নয়।',
          basis:'খোলা অর্ডারের একই মালিক ও প্রতিষ্ঠানের সামঞ্জস্যপূর্ণ সংরক্ষিত রেকর্ড। সেভ না করা পরিবর্তন নেই। যাচাইকৃত ক্যালেন্ডার ছাড়া CPM অনুমান নেই।',
          noAnchor:'বর্তমান TNA Save Now দিয়ে সংরক্ষণ করে আবার খুলুন।',
          unavailable:'স্থানীয় অর্ডার নিরাপদে পড়া যায়নি; মোট দেখানো হয়নি।',
          empty:'নির্বাচিত ফিল্টারে কোনো অর্ডার নেই।',excluded:'কিছু রেকর্ডের উৎস বা মালিক আলাদা; এখানে আনা হয়নি।',
          noCalendar:'ফ্যাক্টরি ক্যালেন্ডার ও সঠিক পরিকল্পনার প্রমাণ নেই; CPM নেই।',
          taskNotCritical:'পরের নির্ধারিত কাজ (ক্রিটিক্যাল যাচাই হয়নি)',
          critical:'গণনাকৃত গুরুত্বপূর্ণ কাজ (স্থানীয় ক্যালেন্ডার)',needAction:'দারিখসহ বাকি কাজ নেই',
          blocker:'নথিভুক্ত বাধা / অনুমোদন অপেক্ষা',blocked:'স্থানীয় বাধা',
          overdue:'ক্রেতার তারিখ পেরিয়েছে; ছাড়পত্র যাচাই হয়নি',late:'গণনায় তারিখ ছাড়িয়ে গেছে',
          planning:'শুধু পরিকল্পনা; অনুমোদন নয়',unknownRisk:'তথ্য প্রয়োজন',
          actualNotice:'S04 স্থানীয় তারিখ; সত্যিকারের প্রেরণ নিশ্চিত নয়।',
          noAllocation:'একাধিক PO-তে আলাদা পরিমাণ নেই; একই মোট প্রতিটি PO-তে নয়।',
          singlePo:'একটি PO-র স্থানীয় মোট; স্বাধীন যাচাই নয়',
          neutral:'স্থানীয় সংরক্ষিত অর্ডার',missing:'দর্জ নেই',asOf:'তারিখ',
          filters:['ক্রেতা','কারখানা','PO','সব সংরক্ষিত অর্ডার'],
          headers:['ক্রেতা','কারখানা','স্টাইল','PO','অর্ডার পরিমাণ','একক','রিভিশন','মূল তারিখ','বর্তমান তারিখ','CPM শেষ','S04 বাস্তব লেখা','উৎস','পরবর্তী কাজ','ঝুঁকি'],
          poHeaders:['ক্রেতা','কারখানা','স্টাইল','PO','বরাদ্দ পরিমাণ','একক','পরিমাণ উৎস'],
          actionHeaders:['PO','কাজ নং','কাজ','দায়িত্ব','লক্ষ্য','কাজের ধরন','নথিভুক্ত অবস্থা'],
          statuses:{blocked:'বাধা / বাতিল',approval:'অনুমোদন বাকি',due:'পরের কাজ',critical:'গণনাকৃত গুরুত্বপূর্ণ',unknown:'রেকর্ড নেই'},
          scope:'শুধু স্থানীয় ব্যবহারকারীর রেকর্ড',restricted:'বাইরের রিপোর্টের অনুমতি নেই; অর্ডার তথ্য গোপন।'},
        hi:{title:'सहेजे गए ऑर्डर / मल्टी-PO',unknown:'जानकारी चाहिए',
          notice:'केवल आंतरिक प्रबंधन। इसी ब्राउज़र के स्थानीय उपयोगकर्ता के सहेजे आदेश; सुरक्षित क्लाउड अनुमति नहीं।',
          basis:'सिर्फ खुले आदेश के उसी मालिक और टेनेंट के सहेजे रिकॉर्ड। बिना सहेजे बदलाव नहीं। पुष्टि फैक्ट्री कैलेंडर के बिना CPM नहीं।',
          noAnchor:'वर्तमान TNA को Save Now करके फिर खोलें।',
          unavailable:'स्थानीय ऑर्डर सुरक्षित रूप से नहीं पढ़े जा सके।',
          empty:'चुने हुए फिल्टर में ऑर्डर नहीं।',excluded:'कुछ रिकॉर्ड अलग मालिक/रूप में थे; शामिल नहीं।',
          noCalendar:'पुष्ट फैक्ट्री कैलेंडर नहीं; CPM अनुपलब्ध।',
          taskNotCritical:'अगला दर्ज देय काम (क्रिटिकल अपुष्ट)',
          critical:'गणना से महत्वपूर्ण काम (स्थानीय कैलेंडर)',needAction:'तारीख वाला खुला काम नहीं',
          blocker:'दर्ज बाधा / स्वीकृति बाकी',blocked:'दर्ज बाधा',
          overdue:'खरीदार की तारीख बीत गई; रिलीज़ अपुष्ट',late:'स्थानीय अनुमान देर',
          planning:'सिर्फ योजना; स्वीकृति नहीं',unknownRisk:'जानकारी चाहिए',
          actualNotice:'S04 स्थानीय तारीख है; असली डिस्पैच प्रमाण नहीं।',
          noAllocation:'कई PO के लिए अलग मात्रा नहीं; कुल हर PO में नहीं जोड़ें।',
          singlePo:'एक PO का दर्ज कुल; अलग प्रमाण नहीं',
          neutral:'स्थानीय सहेजे ऑर्डर',missing:'दर्ज नहीं',asOf:'तारीख',
          filters:['खरीदार','फैक्ट्री','PO','सभी सहेजे आदेश'],
          headers:['खरीदार','फैक्ट्री','स्टाइल','PO','ऑर्डर मात्रा','इकाई','संशोधन','मूल तारीख','वर्तमान तारीख','CPM अंत','दर्ज S04','स्रोत स्थिति','अगला काम','जोखिम'],
          poHeaders:['खरीदार','फैक्ट्री','स्टाइल','PO','आवंटित मात्रा','इकाई','स्रोत'],
          actionHeaders:['PO','क्रम','काम','जिम्मेदार','वर्तमान लक्ष्य','कार्य प्रकार','दर्ज स्थिति'],
          statuses:{blocked:'बाधा / अस्वीकृत',approval:'स्वीकृति बाकी',due:'अगला देय',critical:'गणना से क्रिटिकल',unknown:'दर्ज नहीं'},
          scope:'सिर्फ स्थानीय उपयोगकर्ता',restricted:'बाहरी रिपोर्ट अधिकृत नहीं। ऑर्डर और काम छिपाए गए।'},
        ta:{title:'Saved Orders / Multi-PO',unknown:'தகவல் தேவை',
          notice:'Internal Management-க்கு மட்டும். இப்போதைய browser user-ன் Saved TNA மட்டும். இது secure cloud access அல்லது வேறு நிறுவன permission அல்ல. பகிரும் முன் அனுமதி பார்க்கவும்.',
          basis:'திறந்துள்ள saved TNA-வுடன் ஒரே owner/tenant கொண்ட பதிவுகள் மட்டும். Save செய்யாத மாற்றங்கள் இதில் இல்லை. உறுதியான Factory Calendar இல்லாமல் CPM கணிக்கப்படாது.',
          noAnchor:'இப்போதைய TNA-வை Save Now செய்து மீண்டும் open செய்யவும்.',
          unavailable:'உள்ளூர் saved orders-ஐ பாதுகாப்பாகப் படிக்க முடியவில்லை. மொத்தம் காட்டப்படாது.',
          empty:'தேர்ந்தெடுத்த filter-க்கு saved orders இல்லை.',excluded:'வேறு உரிமையாளர் / தவறான வடிவில் இருந்த பதிவுகள் சேர்க்கப்படவில்லை.',
          noCalendar:'Factory-confirmed calendar இல்லை; CPM கிடையாது.',
          taskNotCritical:'அடுத்த பதிவு செய்த due action (critical உறுதியில்லை)',
          critical:'உள்ளூர் calendar-இல் கணித்த critical action',needAction:'தேதியுடன் pending task இல்லை',
          blocker:'பதிந்த தடை / approval pending',blocked:'பதிந்த தடைகள்',
          overdue:'Buyer-required தேதி கடந்தது; release உறுதி இல்லை',late:'உள்ளூர் forecast தாமதம்',
          planning:'Planning மட்டும்; approval இல்லை',unknownRisk:'தகவல் தேவை',
          actualNotice:'S04 என்பது உள்ளூர் தேதி பதிவு மட்டுமே; உண்மை dispatch உறுதி அல்ல.',
          noAllocation:'பல PO-களுக்கு தனி quantity பதிவு இல்லை; மொத்தத்தை ஒவ்வொரு PO-க்கும் ஒதுக்கக் கூடாது.',
          singlePo:'ஒரு PO-வின் உள்ளூர் மொத்தம்; வெளி உறுதி இல்லை',
          neutral:'உள்ளூர் saved orders',missing:'பதிவு இல்லை',asOf:'அறிக்கை தேதி',
          filters:['Buyer','Factory','PO','அனைத்து saved orders'],
          headers:['Buyer','Factory','Style','PO','Order Qty','Unit','Revision','முதல் தேதி','Current தேதி','CPM முடிவு','பதிந்த S04','ஆதார நிலை','அடுத்த action','Risk'],
          poHeaders:['Buyer','Factory','Style','PO','ஒதுக்கிய qty','Unit','Qty ஆதாரம்'],
          actionHeaders:['PO','Task Ref','செயல்','பொறுப்பாளர்','Current due','Action வகை','பதிந்த நிலை'],
          statuses:{blocked:'பதிந்த தடை / reject',approval:'Approval pending',due:'அடுத்த due',critical:'கணிக்கப்பட்ட critical',unknown:'பதிவு இல்லை'},
          scope:'உள்ளூர் user record மட்டும்',restricted:'வெளி Portfolio report-க்கு அனுமதி இல்லை; எந்த Order/PO தகவலும் சேர்க்கப்படாது.'}
      };
      return dict[language]||dict.en;
    }
    /** Presentation-only due/critical action candidates from source statuses/dates. */
    static actionRows(plan,cpm,asOf,labels){
      const tasks=Array.isArray(plan.tasks)?plan.tasks:[];
      const closed=new Set(['completed','approved','waived','not-applicable']);
      const pending=tasks.filter(task=>!closed.has(task.status));
      const critical=new Set(cpm.validity==='valid'?
        cpm.rows.filter(row=>row.isCritical).map(row=>row.ref):[]);
      const rows=pending.map(task=>{
        const due=TnaMasterReportProjection.asDate(task.dates?.currentTargetFinish);
        const status=task.status||labels.unknown;
        const category=['blocked','rejected'].includes(status)?'blocked':
          ['submitted','awaiting-approval'].includes(status)?'approval':
            critical.has(task.templateRef)?'critical':'due';
        return {ref:task.templateRef||labels.unknown,
          activity:task.title||labels.unknown,owner:task.ownerParty||labels.unknown,
          due,status,type:labels.statuses[category],
          category,sourceCritical:critical.has(task.templateRef)};
      });
      const ordered=rows.slice().sort((a,b)=>{
        const priority={blocked:0,approval:1,critical:2,due:3};
        return priority[a.category]-priority[b.category]||
          (TnaMasterReportProjection.day(a.due)??Number.MAX_SAFE_INTEGER)-
          (TnaMasterReportProjection.day(b.due)??Number.MAX_SAFE_INTEGER)||
          a.ref.localeCompare(b.ref);
      });
      const next=ordered.find(a=>a.category==='critical')||
        ordered.find(a=>a.due!==null)||
        ordered[0]||null;
      return {all:ordered,next,blockers:ordered.filter(a=>['blocked','approval'].includes(a.category)),
        overdue:ordered.filter(a=>a.due!==null&&TnaMasterReportProjection.day(a.due)<asOf)};
    }
    /** Recheck the source snapshot scope before grouping by buyer/factory/PO. */
    static build(anchor={},options={}){
      const labels=this.labels(options.language);
      const window=TnaWeeklyReportProjection.window(options);
      const snapshot=options.portfolioSnapshot;
      const blank={schema:'VESA-TNA-PORTFOLIO-1',validity:'incomplete',audience:'local-management',
        asOfDate:null,timezone:options.timezone||null,orders:[],poRows:[],actions:[],labels,
        counts:{visibleOrders:0,visiblePoReferences:0,unverifiedCpm:0,recordedBlockers:0,excludedLocalRecords:0},
        scope:'same-user-local-saved',filter:{buyer:null,factory:null,po:null},
        warnings:[labels.notice,labels.basis],noExternalAuthority:true};
      if(!window)return {...blank,warnings:[labels.notice,labels.unknown]};
      if(!snapshot||snapshot.status!=='ok'||snapshot.scope!=='same-user-local-saved'||
        snapshot.anchorRecordId!==anchor.recordId||!Array.isArray(snapshot.plans)||
        !snapshot.plans.some(p=>p?.recordId===anchor.recordId))
        return {...blank,asOfDate:window.asOfDate,
          warnings:[labels.notice,snapshot?.status==='unavailable'?labels.unavailable:labels.noAnchor]};
      const same=plan=>plan&&plan.mode!=='practice'&&plan.ownerUserId===anchor.ownerUserId&&
        (plan.tenantId||null)===(anchor.tenantId||null)&&
        typeof plan.recordId==='string'&&plan.recordId.trim();
      const seen=new Set(),allowed=[];
      for(const plan of snapshot.plans){
        if(!same(plan)||seen.has(plan.recordId))continue;
        seen.add(plan.recordId);allowed.push(plan);
      }
      if(!allowed.some(p=>p.recordId===anchor.recordId))
        return {...blank,asOfDate:window.asOfDate,warnings:[labels.notice,labels.noAnchor]};
      const requested=options.portfolioFilter||{};
      const filter={buyer:typeof requested.buyer==='string'&&requested.buyer?requested.buyer:null,
        factory:typeof requested.factory==='string'&&requested.factory?requested.factory:null,
        po:typeof requested.po==='string'&&requested.po?requested.po:null};
      const selected=allowed.filter(p=>(!filter.buyer||p.order?.buyerName===filter.buyer)&&
        (!filter.factory||p.order?.factoryName===filter.factory)&&
        (!filter.po||(Array.isArray(p.order?.poNumbers)&&p.order.poNumbers.includes(filter.po))))
        .sort((a,b)=>(a.recordId===anchor.recordId?-1:b.recordId===anchor.recordId?1:0)||
          String(a.order?.buyerName||'').localeCompare(String(b.order?.buyerName||''))||
          String(a.order?.poNumbers?.[0]||'').localeCompare(String(b.order?.poNumbers?.[0]||'')));
      const orders=[],poRows=[],actions=[];
      for(const p of selected){
        const cpm=TnaCriticalPathProjection.build(p,{language:options.language});
        const tasks=this.actionRows(p,cpm,window.today,labels);
        const required=TnaMasterReportProjection.asDate(p.commitments?.buyerRequiredExFactory);
        const frozen=TnaMasterReportProjection.asDate(
          p.baselineSnapshots?.[0]?.commitments?.buyerRequiredExFactory);
        const s04=Array.isArray(p.tasks)?p.tasks.find(t=>t.templateRef==='S04'):null;
        const enteredActual=TnaMasterReportProjection.asDate(s04?.dates?.actualFinish);
        const actual= s04?.status==='completed'&&
          TnaMasterReportProjection.day(enteredActual)!==null&&
          TnaMasterReportProjection.day(enteredActual)<=window.today?enteredActual:null;
        const poList=Array.isArray(p.order?.poNumbers)?[...new Set(p.order.poNumbers.filter(x=>typeof x==='string'&&x.trim()))]:[];
        const buyer=p.order?.buyerName||labels.unknown,factory=p.order?.factoryName||labels.unknown;
        const style=p.order?.styles?.[0]?.styleNo||labels.unknown;
        const qty=typeof p.order?.totalQty==='number'&&Number.isFinite(p.order.totalQty)&&p.order.totalQty>=0?p.order.totalQty:null;
        const unit=p.order?.unit||labels.unknown;
        let risk=labels.unknownRisk;
        if(tasks.blockers.some(x=>x.category==='blocked'))risk=labels.blocked;
        else if(required&&TnaMasterReportProjection.day(required)<window.today&&!actual)risk=labels.overdue;
        else if(cpm.validity==='valid'&&cpm.workingDaysEarlyOrLate>0)risk=labels.late;
        else if(cpm.validity==='valid')risk=labels.planning;
        const next=tasks.next;
        orders.push({recordId:p.recordId,buyer,factory,style,pos:poList,
          orderQty:qty,unit,revision:Number.isInteger(p.revision)?p.revision:null,
          originalRequired:frozen,currentRequired:required,
          cpmForecast:cpm.validity==='valid'?cpm.forecastDate:null,
          cpmState:cpm.validity,
          recordedS04Actual:actual,
          risk,taskBlockers:tasks.blockers.length,
          nextAction:next?{...next,criticalBasis:next.sourceCritical&&cpm.validity==='valid'?
            labels.critical:labels.taskNotCritical}:null});
        for(const po of poList){
          poRows.push({recordId:p.recordId,buyer,factory,style,po,
            allocatedQty:poList.length===1?qty:null,unit,
            sourceState:poList.length===1?labels.singlePo:labels.noAllocation});
        }
        for(const action of tasks.all.filter(x=>['blocked','approval'].includes(x.category)).slice(0,6)){
          actions.push({recordId:p.recordId,po:poList.join(', ')||labels.unknown,...action});
        }
        if(next&&!tasks.blockers.some(a=>a.ref===next.ref))
          actions.push({recordId:p.recordId,po:poList.join(', ')||labels.unknown,
            ...next,type:next.criticalBasis});
      }
      const sourceOmitted=Number.isInteger(snapshot.excludedCount)&&snapshot.excludedCount>=0?
        snapshot.excludedCount:0;
      return {...blank,validity:'valid',asOfDate:window.asOfDate,filter,orders,poRows,actions,
        counts:{visibleOrders:orders.length,visiblePoReferences:poRows.length,
          unverifiedCpm:orders.filter(x=>x.cpmState!=='valid').length,
          recordedBlockers:orders.reduce((n,x)=>n+x.taskBlockers,0),
          excludedLocalRecords:sourceOmitted},
        warnings:[labels.notice,labels.basis,labels.actualNotice,
          ...(sourceOmitted?[labels.excluded]:[]),
          ...(selected.length?[]:[labels.empty]),
          ...(orders.some(x=>x.cpmState!=='valid')?[labels.noCalendar]:[]),
          ...(selected.some(p=>(p.order?.poNumbers||[]).length>1)?[labels.noAllocation]:[])]};
    }
    /** Fail closed for any external audience; no source data is ever returned. */
    static report(anchor,report,language,generatedAt,timezone,options){
      const labels=this.labels(language),external=options.audienceMode&&
        options.audienceMode!=='internal';
      const projection=external?{schema:'VESA-TNA-PORTFOLIO-1',validity:'restricted',
        audience:'external-blocked',asOfDate:null,timezone,orders:[],poRows:[],
        actions:[],counts:{visibleOrders:0,visiblePoReferences:0,unverifiedCpm:0,
          recordedBlockers:0,excludedLocalRecords:0},
        labels,warnings:[labels.restricted],noExternalAuthority:true}:
        this.build(anchor,{...options,language,generatedAt,timezone});
      const shared=I18N[language],text=external?labels.restricted:labels.neutral;
      return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:'R10',
        title:titleFor(report,language),language,languageName:shared.languageName,
        audience:external?'External portfolio report blocked':'Local management / agent (internal only)',
        generatedAt,generatedLabel:formatDateTime(generatedAt,language),
        timezone,revision:0,baselineSnapshots:0,headings:shared.headings,
        labels:shared.labels,
        order:{buyer:text,factory:text,style:text,po:text,
          quantity:projection.validity==='valid'?projection.counts.visibleOrders:labels.unknown,
          unit:'saved TNA records',requiredExFactory:labels.unknown},
        tasks:[],portfolio:projection,warnings:projection.warnings.slice(),
        notes:[shared.labels.noFabrication,labels.notice,labels.basis],
        source:{recordId:null,schemaVersion:null,mode:'same-user-local-saved-summary'}};
    }
  }

  function taskRows(plan={},limit=Infinity){return (plan.tasks||[]).slice(0,limit).map(task=>({ref:task.templateRef,title:task.title,owner:task.ownerParty,status:task.status,baseline:task.dates?.baselineFinish||'',current:task.dates?.currentTargetFinish||'',forecast:task.dates?.forecastFinish||'',actual:task.dates?.actualFinish||'',risk:task.riskStatus||'needs-information'}))}
  function warnings(plan={}){return [...(plan.unknownFields||[]).map(item=>'Missing: '+item),...(plan.validation?.warnings||[])]}
  function catalogue(language='en'){const l=lang(language);return REPORT_TYPES.map(report=>({id:report[0],title:titleFor(report,l),audience:audienceFor(report,l),scope:report[3]}))}
  function buildReportModel(plan,options={}){const l=lang(options.language);const report=reportType(options.reportId||'R01');const generatedAt=options.generatedAt||new Date().toISOString();const timezone=(report[0]==='R05'||report[0]==='R06'||report[0]==='R07'||report[0]==='R08'||report[0]==='R09'||report[0]==='R10')&&Object.prototype.hasOwnProperty.call(options,'timezone')?options.timezone:(options.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'local');if(report[0]==='R02')return TnaBuyerMilestoneProjection.report(plan,report,l,generatedAt,timezone);if(report[0]==='R10')return TnaPortfolioProjection.report(plan,report,l,generatedAt,timezone,options);if(report[0]==='R08'&&options.audienceMode&&options.audienceMode!=='internal')return TnaMaterialLcProjection.blockedReport(report,l,generatedAt,timezone);if(report[0]==='R09'&&options.audienceMode&&options.audienceMode!=='internal')return TnaShipmentReadinessProjection.blockedReport(report,l,generatedAt,timezone);if(report[0]==='R07'&&options.audienceMode==='buyer')return TnaProductionStatusProjection.buyerReport(plan,report,l,generatedAt,timezone,options);const daily=report[0]==='R03'?TnaFactoryDailyActionProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const weekly=report[0]==='R05'?TnaWeeklyReportProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const delay=report[0]==='R06'?TnaDelayRecoveryProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const production=report[0]==='R07'?TnaProductionStatusProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const materials=report[0]==='R08'?TnaMaterialLcProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;const shipment=report[0]==='R09'?TnaShipmentReadinessProjection.build(plan,{generatedAt,timezone,asOfDate:options.asOfDate,language:l}):null;return {schema:'VESA-TNA-REPORT-1',brand:BRAND,reportId:report[0],title:titleFor(report,l),language:l,languageName:I18N[l].languageName,audience:report[0]==='R09'?'Internal quality and shipping — restricted':report[0]==='R08'?'Internal commercial and sourcing — restricted':report[0]==='R07'?'Internal production review — restricted':report[0]==='R06'?'Local management review — no external sharing authorization':report[0]==='R05'?TnaWeeklyReportProjection.labels(l).localAudience:audienceFor(report,l),generatedAt,generatedLabel:formatDateTime(generatedAt,l),timezone,revision:plan?.revision??0,baselineSnapshots:(plan?.baselineSnapshots||[]).length,headings:I18N[l].headings,labels:I18N[l].labels,order:orderContext(plan),tasks:taskRows(plan),...(report[0]==='R01'?{masterTna:{schema:'VESA-TNA-MASTER-1',rows:TnaMasterReportProjection.rows(plan)}}:{}),...(daily?{factoryDailyAction:daily}:{}),...(weekly?{weeklyTna:weekly}:{}),...(delay?{delayRecovery:delay}:{}),...(production?{productionStatus:production}:{}),...(materials?{materialLc:materials}:{}),...(shipment?{shipmentReadiness:shipment}:{}),...(report[0]==='R04'?{criticalPath:TnaCriticalPathProjection.build(plan,{language:l})}:{}),warnings:[...warnings(plan),...(weekly?weekly.warnings:[]),...(delay?delay.warnings:[]),...(production?production.warnings:[]),...(materials?materials.warnings:[]),...(shipment?shipment.warnings:[])],notes:[I18N[l].labels.noFabrication,...(weekly?[weekly.labels.localNote]:[]),...(delay?[delay.labels.disclosure]:[]),...(production?[production.labels.internalNotice]:[]),...(materials?[materials.labels.internalNotice]:[]),...(shipment?[shipment.labels.notice]:[]),I18N[l].labels.printFallback,I18N[l].labels.shareFallback],source:{recordId:plan?.recordId||null,schemaVersion:plan?.schemaVersion||null,mode:plan?.mode||'unknown'}}}
  function assertLanguageCoverage(){const missing=[];for(const l of SUPPORTED_LANGUAGES){for(const report of REPORT_TYPES){if(!titleFor(report,l))missing.push(l+':'+report[0]);}for(const key of ['order','dates','tasks','warnings','actions','meta'])if(!I18N[l].headings[key])missing.push(l+':heading:'+key);for(const key of ['brand','generated','timezone','audience','revision','baseline','noFabrication','shareFallback','printFallback'])if(!I18N[l].labels[key])missing.push(l+':label:'+key);}return {ok:missing.length===0,missing}}
  const api={SUPPORTED_LANGUAGES,REPORT_TYPES,I18N,catalogue,buildReportModel,assertLanguageCoverage};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaReports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
