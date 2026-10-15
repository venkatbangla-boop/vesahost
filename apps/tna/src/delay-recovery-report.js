(function(root){
  'use strict';
  const operations=root.VesaTnaOperations||(typeof require==='function'?require('./operations.js'):null);

  /**
   * GMR-09 R06 management-only report boundary.
   * Owned state: none. Reads current OrderPlan and its recorded scenarios,
   * approvals and dependency references; never writes or schedules. The
   * review date and management-only acknowledgement are explicit inputs.
   * A dependency link is not a verified downstream delay, and local source
   * approval or scenario application is not an authenticated buyer agreement.
   */
  class DelayRecoveryReport {
    static WORDS=Object.freeze({
      en:{
        asOf:'Management review as-of date',consent:'I understand this internal management report contains factory notes and is NOT for buyer or general factory distribution.',
        selectReview:'Choose a valid review date and confirm management-only use before preparing R06.',
        source:'Internal source records only; owners, causes, approvals and dates are not independently verified.',
        calendar:'Day changes use calendar days only, not reviewed factory workdays, CPM or capacity.',
        linkedCaution:'Direct successor links show graph relationships only; no downstream impact or delay is proven.',
        scenarioCaution:'Applied means a LOCAL TNA revision, not buyer approval. Scenario forecast/capacity claims are not accepted here.',
        approvalCaution:'Approval status is derived from existing local evidence checks, not independently authenticated buyer consent.',
        headingIssues:'Recorded delay and recovery attention',headingLinks:'Direct dependencies (impact not verified)',
        headingScenarios:'Recorded recovery scenarios',headingApprovals:'Source approval records',
        noIssues:'No source-supported delay or recovery attention found for this review date.',
        noScenarios:'No persisted recovery scenarios recorded.',noApprovals:'No approval records entered.',
        unknown:'Needs Information',ref:'Ref',task:'Activity',owner:'Owner',status:'Recorded status',
        original:'Original finish',current:'Revised finish',forecast:'Recorded forecast finish',actual:'Actual finish',
        due:'Source due',indicators:'Observed source indicators',waiting:'Waiting for',cause:'Recorded cause',
        recovery:'Proposed recovery (NOT agreed)',linked:'Successor references',sourceEntry:'Source recorded',
        targetChange:'Current minus original (calendar days)',forecastChange:'Forecast minus target (calendar days)',
        actualChange:'Actual minus target (calendar days)',evidence:'Proof reference recorded',
        scenario:'Scenario name',scenarioState:'Local scenario state',created:'Recorded on',
        applied:'Locally applied on',baseRevision:'Base revision',adjustments:'Recorded changes',
        affected:'Source-linked activities',approval:'Approval item',approvalState:'Local review state',
        response:'Source response',submitted:'Submitted',decision:'Decision date',
        authority:'Decision party recorded',proof:'Evidence recorded',related:'Related task refs',
        noTarget:'Relevant activities without a valid source target',
        missingReason:'Blocked/rejected activities without a recorded delay reason',
        invalidDate:'Invalid source date(s) require review',
        invalidLink:'Unresolved source dependency or scenario references require review',
        dateConflict:'An actual finish was entered without a completed/approved activity status.',
        overdue:'Open and overdue as of review',blocked:'Blocked/rejected in source',
        moved:'Revised target later than original',forecastSlip:'Forecast later than current target',
        actualLate:'Actual after recorded target',recorded:'Delay/recovery note recorded',
        undated:'Relevant activity missing date',
        noInfo:'No independent impact, buyer agreement or factory capacity proof is generated.',
        consentNotAccess:'This acknowledgement is not a server authorization system. Restrict distribution manually.'
      },
      bn:{
        asOf:'ম্যানেজমেন্ট পর্যালোচনার তারিখ',consent:'এই রিপোর্টে অভ্যন্তরীণ ফ্যাক্টরি তথ্য আছে; বায়ার বা সাধারণ ফ্যাক্টরি বিতরণের জন্য নয়।',
        selectReview:'সঠিক পর্যালোচনার তারিখ বেছে নিন এবং শুধু ম্যানেজমেন্টে ব্যবহারের বিষয়টি নিশ্চিত করুন।',
        source:'শুধু অভ্যন্তরীণ উৎস তথ্য; কারণ, অনুমোদন ও তারিখ স্বাধীনভাবে যাচাই হয়নি।',
        calendar:'শুধু ক্যালেন্ডার দিন; ফ্যাক্টরি কর্মদিবস, CPM বা ক্ষমতার হিসাব নয়।',
        linkedCaution:'পরবর্তী কাজের লিংক সম্পর্ক দেখায়; প্রকৃত ক্ষতি বা বিলম্ব প্রমাণ নয়।',
        scenarioCaution:'Applied মানে স্থানীয় TNA রিভিশন; বায়ার অনুমোদন নয়। Scenario পূর্বাভাস যাচাই হয়নি।',
        approvalCaution:'অনুমোদন স্থানীয় নথির ভিত্তিতে; বায়ারের স্বাধীন সম্মতি নয়।',
        headingIssues:'রেকর্ডকৃত বিলম্ব ও রিকভারি',headingLinks:'সরাসরি নির্ভরশীল কাজ (প্রভাব যাচাই হয়নি)',
        headingScenarios:'রেকর্ডকৃত রিকভারি বিকল্প',headingApprovals:'উৎসের অনুমোদনের তথ্য',
        noIssues:'এই তারিখে উৎসভিত্তিক বিলম্বের তথ্য নেই।',noScenarios:'রেকর্ডকৃত রিকভারি বিকল্প নেই।',
        noApprovals:'অনুমোদনের রেকর্ড নেই।',unknown:'তথ্য প্রয়োজন',ref:'রেফারেন্স',task:'কাজ',
        owner:'দায়িত্বপ্রাপ্ত',status:'রেকর্ডকৃত অবস্থা',original:'মূল শেষ',current:'সংশোধিত শেষ',
        forecast:'রেকর্ডকৃত পূর্বাভাস',actual:'বাস্তব শেষ',due:'উৎসের লক্ষ্য',indicators:'উৎসের ইঙ্গিত',
        waiting:'যার জন্য অপেক্ষা',cause:'রেকর্ডকৃত কারণ',recovery:'প্রস্তাবিত রিকভারি (সম্মতি নয়)',
        linked:'পরবর্তী কাজ',sourceEntry:'উৎসে রেকর্ড',targetChange:'মূল থেকে লক্ষ্য পরিবর্তন (দিন)',
        forecastChange:'লক্ষ্য থেকে পূর্বাভাস পার্থক্য (দিন)',actualChange:'লক্ষ্য থেকে বাস্তব পার্থক্য (দিন)',
        evidence:'প্রমাণের রেফারেন্স আছে',scenario:'বিকল্পের নাম',scenarioState:'স্থানীয় অবস্থা',
        created:'রেকর্ডের তারিখ',applied:'স্থানীয় প্রয়োগের তারিখ',baseRevision:'মূল রিভিশন',
        adjustments:'পরিবর্তনের সংখ্যা',affected:'সম্পর্কিত কাজ',approval:'অনুমোদনের কাজ',
        approvalState:'স্থানীয় যাচাই',response:'উৎসের উত্তর',submitted:'জমা',
        decision:'সিদ্ধান্তের তারিখ',authority:'সিদ্ধান্তের পক্ষ',proof:'প্রমাণ আছে',related:'সম্পর্কিত কাজ',
        noTarget:'লক্ষ্য তারিখহীন প্রাসঙ্গিক কাজ',missingReason:'কারণবিহীন আটকে থাকা কাজ',
        invalidDate:'ভুল উৎস তারিখ যাচাই প্রয়োজন',invalidLink:'অজানা dependency/scenario লিংক যাচাই প্রয়োজন',
        dateConflict:'সম্পন্ন/অনুমোদিত অবস্থা ছাড়া বাস্তব তারিখ রেকর্ড।',
        overdue:'পর্যালোচনায় সময় পেরিয়েছে',blocked:'আটকে আছে/বাতিল',moved:'সংশোধিত লক্ষ্য পিছিয়েছে',
        forecastSlip:'পূর্বাভাস লক্ষ্য ছাড়িয়েছে',actualLate:'বাস্তবে দেরি',recorded:'বিলম্ব/রিকভারি নোট আছে',
        undated:'তারিখহীন কাজ',noInfo:'যাচাই ছাড়া প্রভাব, বায়ারের সম্মতি বা সক্ষমতা দেখানো হয়নি।',
        consentNotAccess:'এই সম্মতি নিরাপদ সার্ভার অনুমতি নয়; বিতরণ সীমিত রাখুন।'
      },
      hi:{
        asOf:'प्रबंधन समीक्षा तारीख',consent:'यह आंतरिक प्रबंधन रिपोर्ट है; फैक्ट्री जानकारी बायर या सामान्य फैक्ट्री वितरण के लिए नहीं।',
        selectReview:'सही समीक्षा तारीख और केवल प्रबंधन उपयोग की पुष्टि करें।',
        source:'केवल अंदरूनी स्रोत रिकॉर्ड; कारण, मंजूरी और तारीख स्वतंत्र सत्यापित नहीं।',
        calendar:'सिर्फ कैलेंडर दिन; फैक्ट्री कार्यदिवस, CPM या क्षमता नहीं।',
        linkedCaution:'सीधे अगली गतिविधि का लिंक प्रभाव या वास्तविक देरी का प्रमाण नहीं।',
        scenarioCaution:'Applied केवल स्थानीय TNA संशोधन है, बायर मंजूरी नहीं; पूर्वानुमान अप्रमाणित है।',
        approvalCaution:'मंजूरी स्थानीय प्रमाण जाँच से है, स्वतंत्र बायर सहमति नहीं।',
        headingIssues:'दर्ज देरी और रिकवरी',headingLinks:'सीधे जुड़े अगले काम (प्रभाव अप्रमाणित)',
        headingScenarios:'दर्ज रिकवरी विकल्प',headingApprovals:'स्रोत अनुमोदन रिकॉर्ड',
        noIssues:'इस समीक्षा तारीख को कोई स्रोत-आधारित समस्या नहीं।',noScenarios:'कोई दर्ज रिकवरी विकल्प नहीं।',
        noApprovals:'कोई अनुमोदन रिकॉर्ड नहीं।',unknown:'जानकारी चाहिए',ref:'रेफरेंस',task:'काम',
        owner:'जिम्मेदार',status:'दर्ज स्थिति',original:'मूल समाप्ति',current:'संशोधित समाप्ति',
        forecast:'दर्ज पूर्वानुमान',actual:'वास्तविक समाप्ति',due:'दर्ज लक्ष्य',indicators:'स्रोत संकेत',
        waiting:'किसके जवाब का इंतजार',cause:'दर्ज कारण',recovery:'प्रस्तावित रिकवरी (सहमति नहीं)',
        linked:'अगले काम',sourceEntry:'स्रोत-दर्ज',targetChange:'संशोधित - मूल (कैलेंडर दिन)',
        forecastChange:'पूर्वानुमान - लक्ष्य (दिन)',actualChange:'वास्तविक - लक्ष्य (दिन)',
        evidence:'प्रमाण रेफरेंस मौजूद',scenario:'विकल्प का नाम',scenarioState:'स्थानीय स्थिति',
        created:'दर्ज तारीख',applied:'स्थानीय लागू तारीख',baseRevision:'मूल रिविजन',
        adjustments:'दर्ज बदलाव',affected:'जुड़े काम',approval:'अनुमोदन कार्य',
        approvalState:'स्थानीय समीक्षा',response:'दर्ज जवाब',submitted:'जमा किया',
        decision:'निर्णय तारीख',authority:'निर्णय देने वाला',proof:'प्रमाण मौजूद',related:'संबंधित काम',
        noTarget:'बिना लक्ष्य के संबंधित काम',missingReason:'बिना दर्ज कारण के रुके काम',
        invalidDate:'गलत स्रोत तारीख जाँचें',invalidLink:'अज्ञात लिंक्स जाँचें',
        dateConflict:'पूरा/मंजूर दर्ज किए बिना वास्तविक तारीख मौजूद।',
        overdue:'समीक्षा तारीख तक देरी',blocked:'रुका/अस्वीकृत',moved:'लक्ष्य आगे बढ़ा',
        forecastSlip:'पूर्वानुमान लक्ष्य से देर',actualLate:'वास्तविक लक्ष्य से देर',
        recorded:'देरी/रिकवरी नोट दर्ज',undated:'बिना तारीख काम',
        noInfo:'बिना पुष्टि कोई प्रभाव, बायर सहमति या क्षमता नहीं जोड़ी गयी।',
        consentNotAccess:'यह सहमति सर्वर पर अनुमति नहीं देती; रिपोर्ट सीमित साझा करें।'
      },
      ta:{
        asOf:'Management review தேதி',consent:'இது internal management report; factory குறிப்புகள் உள்ளதால் buyer அல்லது பொது factory பகிர்வுக்கு அல்ல.',
        selectReview:'சரியான review தேதியைத் தேர்ந்தெடுத்து management-only பயன்பாட்டை உறுதிசெய்யவும்.',
        source:'Internal source பதிவுகள் மட்டும்; காரணம், approval, தேதிகள் தனியாக verify செய்யப்படவில்லை.',
        calendar:'Calendar நாட்கள் மட்டும்; factory working days, CPM, capacity கணக்கிடவில்லை.',
        linkedCaution:'நேரடி அடுத்த வேலையின் link மட்டும்; downstream delay நிரூபிக்கப்படவில்லை.',
        scenarioCaution:'Applied என்றால் local TNA revision; buyer approval அல்ல. Scenario forecast verify செய்யப்படவில்லை.',
        approvalCaution:'Approval என்பது local evidence check; buyer ஒப்புதல் தனியாக சரிபார்க்கப்படவில்லை.',
        headingIssues:'பதிவான தாமதங்கள் மற்றும் Recovery',headingLinks:'நேரடி இணைப்பு (impact உறுதியாக இல்லை)',
        headingScenarios:'பதிவான Recovery options',headingApprovals:'Source approval பதிவுகள்',
        noIssues:'இந்த review தேதிக்கு source அடிப்படையிலான தாமதம் எதுவும் இல்லை.',
        noScenarios:'பதிவான Recovery scenario இல்லை.',noApprovals:'Approval பதிவுகள் இல்லை.',
        unknown:'தகவல் தேவை',ref:'Ref',task:'வேலை',owner:'பொறுப்பாளர்',status:'பதிவான நிலை',
        original:'Original முடிவு',current:'Revised முடிவு',forecast:'Forecast முடிவு',
        actual:'Actual முடிவு',due:'Source இலக்கு',indicators:'Source குறிப்புகள்',
        waiting:'பதில் காத்திருப்பது',cause:'பதிவான காரணம்',
        recovery:'பரிந்துரைத்த Recovery (ஒப்புக்கொள்ளவில்லை)',linked:'அடுத்து இணைந்த வேலைகள்',
        sourceEntry:'Source பதிவு',targetChange:'Revised - original (calendar நாட்கள்)',
        forecastChange:'Forecast - target (நாட்கள்)',actualChange:'Actual - target (நாட்கள்)',
        evidence:'ஆதாரம் பதிவு',scenario:'Scenario பெயர்',scenarioState:'Local நிலை',
        created:'பதிவான தேதி',applied:'உள்ளூரில் பயன்படுத்திய தேதி',baseRevision:'Base revision',
        adjustments:'பதிவான மாற்றங்கள்',affected:'தொடர்புள்ள வேலைகள்',approval:'Approval வேலை',
        approvalState:'Local review நிலை',response:'Source பதில்',submitted:'சமர்ப்பிப்பு',
        decision:'முடிவு தேதி',authority:'முடிவெடுத்தவர்',proof:'ஆதாரம் உள்ளது',
        related:'தொடர்புடைய வேலைகள்',noTarget:'இலக்கு தேதி இல்லாத வேலைகள்',
        missingReason:'காரணம் பதிவு இல்லாத blocked வேலைகள்',invalidDate:'தவறான source தேதி சரிபார்க்கவும்',
        invalidLink:'தவறான dependency/scenario link சரிபார்க்கவும்',
        dateConflict:'Completed/approved இல்லாமல் Actual தேதி பதிவு செய்திருக்கிறது.',
        overdue:'Review தேதியளவில் overdue',blocked:'Blocked / rejected',
        moved:'Revised இலக்கு தள்ளியது',forecastSlip:'Forecast தாமதம்',
        actualLate:'Actual தாமதம்',recorded:'Delay/Recovery குறிப்பு பதிவு',
        undated:'தேதி இல்லாத வேலை',noInfo:'Verified impact, buyer ஒப்புதல் அல்லது capacity ஊகிக்கப்படவில்லை.',
        consentNotAccess:'இந்த checkbox server permission அல்ல; report-ஐ அனுமதியுடன் மட்டும் பகிரவும்.'
      }
    });
    static CLOSED=new Set(['approved','completed','waived','not-applicable']);
    static day(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
      const date=new Date(value+'T00:00:00Z');
      return Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value?null:Math.floor(date.getTime()/86400000);
    }
    static date(value){return this.day(value)===null?null:value}
    static string(value){return typeof value==='string'?value.trim():''}
    static numbered(value){return typeof value==='number'&&Number.isFinite(value)?value:null}

    /**
     * Calculate only source-to-source CIVIL-calendar variance; absence of either
     * endpoint is null, not zero, and no working-calendar assumptions are made.
     */
    static difference(later,earlier){
      const a=this.day(later),b=this.day(earlier);
      return a===null||b===null?null:a-b;
    }
    static project(plan,options={}){
      const language=Object.hasOwn(this.WORDS,options.language)?options.language:'en';
      const labels=this.WORDS[language],day=this.day(options.asOfDate);
      const empty={ready:false,asOfDate:null,labels,issues:[],scenarios:[],approvals:[],
        counts:{issues:0,overdue:0,blocked:0,scenario:0,approval:0,missingTarget:0},
        warnings:[labels.selectReview]};
      if(day===null||options.managementConfirmed!==true)return empty;
      const tasks=Array.isArray(plan?.tasks)?plan.tasks:[],byId=new Map();
      for(const task of tasks)if(task&&task.taskId&&!byId.has(task.taskId))
        byId.set(task.taskId,task);
      const successorMap=new Map();
      let brokenLinks=0,invalidDates=0,missingTarget=0,missingReason=0,actualConflict=0;
      for(const edge of Array.isArray(plan?.edges)?plan.edges:[]){
        if(!byId.has(edge?.predecessorTaskId)||!byId.has(edge?.successorTaskId)){
          brokenLinks+=1;continue;
        }
        const list=successorMap.get(edge.predecessorTaskId)||[];
        list.push(String(byId.get(edge.successorTaskId).templateRef||''));successorMap.set(edge.predecessorTaskId,list);
      }
      const issues=[];
      for(const task of tasks){
        if(!task||task.applicability==='not-applicable')continue;
        const dates=task.dates||{},status=this.string(task.status)||'not-started';
        const rawOriginal=dates.baselineFinish,rawRevised=dates.currentTargetFinish;
        const hasRevised=rawRevised!==null&&rawRevised!==undefined&&rawRevised!=='';
        const original=this.date(rawOriginal),current=this.date(rawRevised),
          forecast=this.date(dates.forecastFinish),actual=this.date(dates.actualFinish);
        const rawDue=hasRevised?rawRevised:rawOriginal;
        const due=this.date(rawDue);
        const closed=this.CLOSED.has(status),indicators=[];
        const cause=this.string(task.delayReason),recovery=this.string(task.recoveryAction);
        const originalChange=this.difference(current,original),
          forecastChange=this.difference(forecast,due),
          actualChange=this.difference(actual,due);
        if(!closed&&due&&this.day(due)<day)indicators.push(labels.overdue);
        if(['blocked','rejected'].includes(status))indicators.push(labels.blocked);
        if(originalChange!==null&&originalChange>0)indicators.push(labels.moved);
        if(forecastChange!==null&&forecastChange>0)indicators.push(labels.forecastSlip);
        if(['completed','approved'].includes(status)&&actualChange!==null&&actualChange>0)
          indicators.push(labels.actualLate);
        if(cause||recovery)indicators.push(labels.recorded);
        if(!indicators.length)continue;
        if(due===null){missingTarget+=1;indicators.push(labels.undated);}
        if(['blocked','rejected'].includes(status)&&!cause)missingReason+=1;
        if(dates.actualFinish&&actual===null)invalidDates+=1;
        if(rawDue&&due===null)invalidDates+=1;
        if(rawOriginal&&original===null&&rawOriginal!==rawDue)invalidDates+=1;
        if(rawRevised&&current===null&&rawRevised!==rawDue)invalidDates+=1;
        if(dates.forecastFinish&&!forecast)invalidDates+=1;
        if(dates.actualFinish&&!['completed','approved'].includes(status))actualConflict+=1;
        issues.push({
          ref:this.string(task.templateRef)||labels.unknown,title:this.string(task.title)||labels.unknown,
          owner:this.string(task.ownerParty)||null,status,indicators,
          original,current,forecast,actual,due,waiting:this.string(task.waitingFor)||null,
          cause:cause||null,recovery:recovery||null,
          targetChangeDays:originalChange,forecastChangeDays:forecastChange,actualChangeDays:actualChange,
          successors:[...new Set(successorMap.get(task.taskId)||[])].sort(),
          evidenceRecorded:Array.isArray(task.proofRefs)&&task.proofRefs.some(x=>this.string(x))
        });
      }
      issues.sort((a,b)=>String(a.due||'9999-12-31').localeCompare(String(b.due||'9999-12-31'))||
        a.ref.localeCompare(b.ref));
      const scenarios=[];
      for(const branch of Array.isArray(plan?.scenarioBranches)?plan.scenarioBranches:[]){
        if(!branch?.scenarioId||branch.baseRecordId!==plan.recordId)continue;
        const changes=branch.changes||{},related=new Set();
        const adjustments=['durationAdjustments','routeChanges','calendarChanges','capacityChanges'];
        const quantities=Object.fromEntries(adjustments.map(key=>[key,Array.isArray(changes[key])?changes[key].length:0]));
        for(const key of ['durationAdjustments','routeChanges'])
          for(const change of Array.isArray(changes[key])?changes[key]:[]){
            const t=byId.get(change?.taskId);
            if(t)related.add(String(t.templateRef||labels.unknown));
            else brokenLinks+=1;
          }
        scenarios.push({
          name:this.string(branch.name)||labels.unknown,scenarioId:String(branch.scenarioId),
          state:this.string(branch.status)||labels.unknown,
          createdAt:this.string(branch.createdAt)||null,
          appliedAt:branch.status==='applied'?this.string(branch.appliedAt)||null:null,
          baseRevision:this.numbered(branch.baseRevision),
          counts:quantities,relatedRefs:[...related].sort(),
          disclosure:labels.scenarioCaution
        });
      }
      scenarios.sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))||
        a.scenarioId.localeCompare(b.scenarioId));
      const approvals=[];
      for(const record of Array.isArray(plan?.approvals)?plan.approvals:[]){
        if(!record||!record.approvalId)continue;
        const observed=operations?.approvalState?.(record)||{status:'needs-information'};
        const related=[];
        for(const id of Array.isArray(record.requiredForTaskIds)?record.requiredForTaskIds:[]){
          const t=byId.get(id);
          if(t)related.push(this.string(t.templateRef)||labels.unknown);
          else brokenLinks+=1;
        }
        const invalid=(record.submittedDate&&!this.date(record.submittedDate))||
          (record.decisionDate&&!this.date(record.decisionDate));
        if(invalid)invalidDates+=1;
        approvals.push({
          item:this.string(record.itemName)||labels.unknown,
          state:String(observed.status||'needs-information'),response:this.string(record.responseStatus)||null,
          submitted:this.date(record.submittedDate),decision:this.date(record.decisionDate),
          authorityRecorded:!!(this.string(record.decidedBy)||this.string(record.authorizedReviewerId)||
            record.delegatedLocalOfficeAllowed===true),
          evidenceRecorded:!!this.string(record.evidenceRef),
          relatedRefs:[...new Set(related)].sort(),disclosure:labels.approvalCaution
        });
      }
      approvals.sort((a,b)=>a.item.localeCompare(b.item));
      const warnings=[labels.source,labels.calendar,labels.linkedCaution,labels.scenarioCaution,
        labels.approvalCaution,labels.consentNotAccess,labels.noInfo];
      if(missingTarget)warnings.push(labels.noTarget+': '+missingTarget);
      if(missingReason)warnings.push(labels.missingReason+': '+missingReason);
      if(invalidDates)warnings.push(labels.invalidDate+': '+invalidDates);
      if(brokenLinks)warnings.push(labels.invalidLink+': '+brokenLinks);
      if(actualConflict)warnings.push(labels.dateConflict+': '+actualConflict);
      return {ready:true,asOfDate:options.asOfDate,labels,issues,scenarios,approvals,warnings,
        counts:{issues:issues.length,overdue:issues.filter(x=>x.indicators.includes(labels.overdue)).length,
          blocked:issues.filter(x=>x.indicators.includes(labels.blocked)).length,
          scenario:scenarios.length,approval:approvals.length,missingTarget}};
    }
  }
  const api={WORDS:DelayRecoveryReport.WORDS,
    project:(plan,options)=>DelayRecoveryReport.project(plan,options)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaDelayRecoveryReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
