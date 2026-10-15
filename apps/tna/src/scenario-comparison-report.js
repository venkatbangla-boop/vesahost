(function(root){
  'use strict';
  const scenarios=root.VesaTnaScenarios||(typeof require==='function'?require('./scenarios.js'):null);
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);

  /**
   * GMR-15 R12: safe, read-only CURRENT-revision what-if comparison.
   *
   * Ownership: no changes to the canonical OrderPlan, scheduling engines,
   * signed baselines, candidate application or scenario history. Builds two
   * explicit duration-only options from the SAME revision using the existing
   * verified preview engine and keeps user-entered input distinctions.
   *
   * Do not silently equate a local scenario revision, a preview or a
   * calculated schedule with factory feasibility or buyer acceptance.
   * Browser-only audience acknowledgement is not server authorization.
   */
  class ScenarioComparisonReport {
    static EN=Object.freeze({
      title:'Scenario Comparison',asOf:'Planner review date',
      consent:'I am authorized to review this internal planner/management scenario report and will restrict sharing.',
      calendar:'I reviewed the entered order calendar, holidays and source dependencies; missing inputs remain uncertain.',
      authority:'Planner authority source reference (not exported)',
      select:'Choose a valid review date, planner permission, calendar review, authority reference and both explicitly entered options A/B.',
      heading:'Base order compared with two recovery options',
      base:'Current order base',a:'Recovery A',b:'Recovery B',
      activityA:'Option A activity',activityB:'Option B activity',
      durationA:'Option A duration (working/calendar units as recorded)',
      durationB:'Option B duration (working/calendar units as recorded)',
      ref:'Activity ref',task:'Source activity',initial:'Base duration',changed:'Option duration',
      units:'Source duration basis',revision:'Current input revision',
      original:'Recorded original baselines',forecast:'Calculated forecast',
      required:'Buyer-required ex-factory',gain:'Source engine working-day difference',
      critical:'Critical task references',changedCritical:'Changed critical references',
      conflicts:'Source capacity conflict count',status:'Calculation status',
      inputs:'Explicit candidate input differences',paths:'Reported critical-chain changes',
      recorded:'Historical locally applied scenarios',sourceRev:'Source base revision',
      appliedRev:'Recorded local revision',recordedOn:'Applied source date (UTC)',
      local:'Locally applied (not buyer approval)',none:'No matching applied-scenario revision records.',
      unknown:'Needs Information',unavailable:'Unverified / unavailable',
      calculated:'Calculated from entered source (not factory-confirmed)',
      notCalculated:'Calculation not available from entered dates or calendar',
      sourceOnly:'Source forecasts come from the existing local scenario engine; no independent factory/calendar/capacity confirmation.',
      noProof:'The comparison does NOT independently authenticate buyer approval, cost savings, overtime, extra factory lines or shipment readiness.',
      noMutation:'Alternatives A and B are review-only. The original order, source revision, baseline and previously applied scenarios are unchanged.',
      sameBase:'Both alternatives are calculated from the SAME saved/current input revision, not from one another.',
      noHistory:'Unselected previews are not stored as approved decisions. History lists only source-applied branches with matching local revision events.',
      noPath:'Changing critical references are template task IDs from engine output, not proof of a certified critical chain.',
      noAccess:'Local confirmation is not secure server-side planner/tenant authorization.',
      badInput:'Options must identify applicable order activities and valid, explicitly entered whole-number durations, without fabricated values.',
      badSource:'Scenario engine could not validate this source order; no comparison or workbook is available.',
      asOfCaution:'The review date controls recorded history display; candidate dates are current-revision projections, NOT historical as-of snapshots.',
      scheduleMissing:'One or more base/candidate forecasts could not be computed from the actual source inputs.',
      capacityMissing:'No verified alternative production rate/capacity is supplied in this report; no rate improvement is inferred.',
      calendarUnconfigured:'The source calendar is not factory-verified; apparent dates remain planning-only.',
      historyMismatch:'Source scenario entry without matching applied revision evidence was omitted.',
      noChanged:'An option does not change its selected base duration; the comparison is shown without inventing savings.'
    });
    static WORDS=Object.freeze({
      en:ScenarioComparisonReport.EN,
      bn:{...ScenarioComparisonReport.EN,
        title:'রিকভারি বিকল্প তুলনা',asOf:'পরিকল্পনা পর্যালোচনার তারিখ',
        consent:'এই অভ্যন্তরীণ planner/management রিপোর্ট দেখার অনুমতি আছে; অনুমতি ছাড়া শেয়ার করব না।',
        calendar:'অর্ডারের calendar, holidays ও dependencies পর্যালোচনা করেছি; তথ্য কম থাকলে অনিশ্চিত থাকবে।',
        authority:'পরিকল্পনা অনুমতির উৎস রেফারেন্স (রিপোর্টে থাকবে না)',
        select:'সঠিক তারিখ, অনুমতি, calendar যাচাই, authority ও A/B দুটি স্পষ্ট বিকল্প বেছে নিন।',
        heading:'বর্তমান অর্ডার বনাম দুটি রিকভারি বিকল্প',
        base:'বর্তমান অর্ডার',a:'রিকভারি A',b:'রিকভারি B',
        activityA:'বিকল্প A কাজ',activityB:'বিকল্প B কাজ',
        durationA:'বিকল্প A সময়',durationB:'বিকল্প B সময়',
        ref:'কাজের রেফারেন্স',task:'উৎস কাজ',initial:'মূল সময়',changed:'বিকল্প সময়',
        units:'সময়ের ভিত্তি',revision:'বর্তমান সংশোধন',
        original:'মূল বেসলাইন',forecast:'গণিতের পূর্বাভাস',
        required:'Buyer চাওয়া ex-factory',gain:'গণিতের কার্যদিবস পার্থক্য',
        critical:'Critical কাজ',changedCritical:'পরিবর্তিত Critical কাজ',
        conflicts:'উৎস capacity সমস্যা',status:'গণনার অবস্থা',
        inputs:'বিকল্পের পরিবর্তিত ইনপুট',paths:'Critical path পরিবর্তন',
        recorded:'পূর্বে স্থানীয়ভাবে প্রয়োগ করা বিকল্প',sourceRev:'আগের সংশোধন',
        appliedRev:'স্থানীয় সংশোধন',recordedOn:'প্রয়োগের তারিখ (UTC)',
        local:'স্থানীয়ভাবে প্রয়োগ (buyer approval নয়)',none:'প্রমাণসহ প্রয়োগ করা বিকল্প নেই।',
        unknown:'তথ্য প্রয়োজন',unavailable:'যাচাই হয়নি / নেই',
        calculated:'উৎস থেকে গণিত (factory যাচাই নয়)',
        notCalculated:'উৎস তথ্য দিয়ে হিসাব করা যায়নি',
        sourceOnly:'উৎসের scenario engine-এ গণিত; factory/calendar/capacity স্বাধীন যাচাই নয়।',
        noProof:'Buyer অনুমোদন, খরচ বাঁচা, overtime, factory line বা shipment readiness নিশ্চিত করা হয়নি।',
        noMutation:'A/B শুধু তুলনা; মূল অর্ডার, revision ও baseline বদলায়নি।',
        sameBase:'A/B দুটিই একই বর্তমান revision থেকে, একে অন্য থেকে নয়।',
        noHistory:'পূর্বের preview-কে অনুমোদন বলা হয়নি; কেবল audit-সহ প্রয়োগগুলি ইতিহাসে আছে।',
        noPath:'Critical refs engine-এর output; প্রত্যয়িত critical chain নয়।',
        noAccess:'Browser সম্মতি নিরাপদ server permission নয়।',
        badInput:'A/B কাজে বৈধ source activity এবং স্পষ্ট পূর্ণসংখ্যা দিন।',
        badSource:'উৎস অর্ডার থেকে scenario গণনা সম্ভব নয়।',
        asOfCaution:'Review date ইতিহাসের জন্য; forecast বর্তমান revision থেকে, অতীত snapshot নয়।',
        scheduleMissing:'উৎস তথ্য থেকে কিছু forecast পাওয়া যায়নি।',
        capacityMissing:'যাচাই করা নতুন production rate/capacity নেই; অনুমান করা হয়নি।',
        calendarUnconfigured:'Factory calendar যাচাই হয়নি; তারিখ planning-only।',
        historyMismatch:'প্রমাণ ছাড়া scenario ইতিহাস থেকে বাদ দেওয়া হয়েছে।',
        noChanged:'বিকল্পে সময় পরিবর্তন হয়নি; সাশ্রয় অনুমান করা হয়নি।'
      },
      hi:{...ScenarioComparisonReport.EN,
        title:'रिकवरी विकल्प तुलना',asOf:'प्लानर समीक्षा तारीख',
        consent:'यह आंतरिक planner/management रिपोर्ट देखने का अधिकार है; बिना अनुमति साझा नहीं करूंगा।',
        calendar:'ऑर्डर कैलेंडर, छुट्टियां और dependencies जाँची हैं; कमी अनिश्चित रहेगी।',
        authority:'प्लानर अनुमति स्रोत रेफरेंस (रिपोर्ट में नहीं जाएगा)',
        select:'सही तारीख, अनुमति, कैलेंडर समीक्षा, प्राधिकारी और दोनों A/B विकल्प दर्ज करें।',
        heading:'मौजूदा ऑर्डर बनाम दो रिकवरी विकल्प',
        base:'मौजूदा ऑर्डर',a:'रिकवरी A',b:'रिकवरी B',
        activityA:'विकल्प A गतिविधि',activityB:'विकल्प B गतिविधि',
        durationA:'विकल्प A अवधि',durationB:'विकल्प B अवधि',
        ref:'कार्य रेफरेंस',task:'स्रोत गतिविधि',initial:'मूल अवधि',changed:'विकल्प अवधि',
        units:'अवधि आधार',revision:'वर्तमान रिवीजन',
        original:'मूल बेसलाइन',forecast:'गणित पूर्वानुमान',
        required:'Buyer एक्स-फैक्टरी तारीख',gain:'कार्यदिवस का अंतर',
        critical:'Critical गतिविधियां',changedCritical:'बदली Critical गतिविधियां',
        conflicts:'दर्ज क्षमता समस्या',status:'गणना स्थिति',
        inputs:'विकल्प इनपुट में बदलाव',paths:'Critical path बदलाव',
        recorded:'दर्ज स्थानीय लागू विकल्प',sourceRev:'स्रोत रिवीजन',
        appliedRev:'दर्ज स्थानीय रिवीजन',recordedOn:'लागू तारीख (UTC)',
        local:'स्थानीय लागू (buyer मंजूरी नहीं)',none:'प्रमाणयुक्त लागू विकल्प नहीं।',
        unknown:'जानकारी चाहिए',unavailable:'अप्रमाणित / अनुपलब्ध',
        calculated:'दर्ज स्रोत से गणित (factory पुष्टि नहीं)',
        notCalculated:'उपलब्ध जानकारी से गणना नहीं',
        sourceOnly:'स्थानीय scenario engine के पूर्वानुमान; फैक्टरी/कैलेंडर/क्षमता स्वतंत्र पुष्ट नहीं।',
        noProof:'Buyer मंजूरी, लागत बचत, overtime, नई लाइन या shipment readiness सिद्ध नहीं।',
        noMutation:'A/B केवल समीक्षा; मूल ऑर्डर/रिवीजन/बेसलाइन बदले नहीं।',
        sameBase:'दोनों विकल्प उसी मौजूदा रिवीजन से, एक-दूसरे से नहीं।',
        noHistory:'पुराने preview अनुमोदन नहीं; केवल audit-सहित लागू विकल्प दिखते हैं।',
        noPath:'Critical रेफरेंस गणित के हैं, प्रमाणित chain नहीं।',
        noAccess:'Browser पुष्टि सुरक्षित server अनुमति नहीं।',
        badInput:'A/B के लिए वैध गतिविधि और स्पष्ट पूरी अवधि दें।',
        badSource:'स्रोत ऑर्डर से scenario गणना उपलब्ध नहीं।',
        asOfCaution:'समीक्षा तारीख इतिहास के लिए; forecast मौजूदा रिवीजन का है।',
        scheduleMissing:'सभी forecast स्रोत से नहीं निकले।',
        capacityMissing:'सत्यापित नई उत्पादन क्षमता नहीं; अनुमान नहीं।',
        calendarUnconfigured:'Factory कैलेंडर असत्यापित; तारीख केवल प्लानिंग।',
        historyMismatch:'प्रमाण बिना स्थानीय scenario इतिहास छोड़ दिया।',
        noChanged:'अवधि नहीं बदली; बचत अनुमान नहीं किया।'
      },
      ta:{...ScenarioComparisonReport.EN,
        title:'Recovery விருப்ப ஒப்பீடு',asOf:'Planner மதிப்பாய்வு தேதி',
        consent:'இந்த planner/management உள்ளக report-ஐப் பார்க்க அனுமதி உள்ளது; அனுமதியின்றிப் பகிரமாட்டேன்.',
        calendar:'Order calendar, விடுமுறைகள், dependencies பார்த்தேன்; விடுபட்டவை உறுதியற்றதாகவே இருக்கும்.',
        authority:'Planner அனுமதி ஆதாரம் (report-ல் வராது)',
        select:'சரியான தேதி, அனுமதி, calendar ஆய்வு, authority, A/B இரண்டு விருப்பங்களையும் தேர்வு செய்யவும்.',
        heading:'தற்போதைய order மற்றும் இரண்டு Recovery விருப்பங்கள்',
        base:'தற்போதைய order',a:'Recovery A',b:'Recovery B',
        activityA:'விருப்பம் A வேலை',activityB:'விருப்பம் B வேலை',
        durationA:'விருப்பம் A காலம்',durationB:'விருப்பம் B காலம்',
        ref:'செயல் குறிப்பு',task:'மூலச் செயல்',initial:'முதல் காலம்',changed:'விருப்ப காலம்',
        units:'கால அளவு',revision:'தற்போதைய revision',
        original:'முதல் baseline',forecast:'கணிக்கப்பட்ட forecast',
        required:'Buyer கேட்ட ex-factory',gain:'Working day வித்தியாசம்',
        critical:'Critical செயல்கள்',changedCritical:'மாறிய Critical செயல்கள்',
        conflicts:'பதிவான capacity மோதல்',status:'கணக்கீட்டு நிலை',
        inputs:'விருப்ப உள்ளீட்டு மாற்றம்',paths:'Critical path மாற்றங்கள்',
        recorded:'முன்பு local-ஆகப் பயன்படுத்திய விருப்பம்',sourceRev:'மூல revision',
        appliedRev:'Local revision',recordedOn:'பயன்படுத்திய தேதி (UTC)',
        local:'Local-ஆகப் பயன்படுத்தப்பட்டது; buyer approval அல்ல',none:'ஆதாரமுள்ள applied விருப்பம் இல்லை.',
        unknown:'தகவல் தேவை',unavailable:'சரிபார்க்கப்படவில்லை / இல்லை',
        calculated:'மூலத்திலிருந்து கணக்கீடு; factory உறுதி அல்ல',
        notCalculated:'மூல தகவலால் கணிக்க முடியவில்லை',
        sourceOnly:'உள்ளக scenario engine கணிப்பு; factory/calendar/capacity தனியாக verify செய்யவில்லை.',
        noProof:'Buyer approval, விலைச் சேமிப்பு, overtime, factory line, shipment readiness உறுதி அல்ல.',
        noMutation:'A/B ஒப்பீடு மட்டுமே; original order, revision, baseline மாறாது.',
        sameBase:'A/B இரண்டும் ஒரே தற்போதைய revision-லிருந்து கணக்கிடப்பட்டவை.',
        noHistory:'பழைய preview approval அல்ல; audit உள்ள applied record மட்டுமே history.',
        noPath:'Critical refs engine கணிப்பு; உறுதியான critical chain அல்ல.',
        noAccess:'Browser ஒப்புதல் பாதுகாப்பான server permission அல்ல.',
        badInput:'A/B-க்கு சரியான source task மற்றும் தெளிவான முழு எண் duration தரவும்.',
        badSource:'மூல order-ல் scenario கணக்கிட முடியவில்லை.',
        asOfCaution:'Review தேதி history-க்கு மட்டும்; forecast தற்போதைய revision, பழைய snapshot அல்ல.',
        scheduleMissing:'மூலத் தரவில் சில forecasts கணிக்க முடியவில்லை.',
        capacityMissing:'Verified புதிய capacity இல்லை; ஊகிக்கவில்லை.',
        calendarUnconfigured:'Factory calendar verify ஆகவில்லை; தேதிகள் planning-only.',
        historyMismatch:'ஆதாரமில்லாத scenario history காட்டப்படாது.',
        noChanged:'Duration மாறவில்லை; savings ஊகிக்கவில்லை.'
      }
    });
    static day(x){
      if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))return null;
      const parsed=new Date(x+'T00:00:00Z');
      return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===x?x:null;
    }
    static text(x){return typeof x==='string'?x.trim():''}
    static integer(x){
      if(typeof x!=='string'&&!Number.isInteger(x))return null;
      const raw=String(x);
      if(!/^(0|[1-9][0-9]{0,3})$/.test(raw))return null;
      const n=Number(raw);
      return Number.isInteger(n)&&n>=0&&n<=3650?n:null;
    }
    static candidates(plan){
      const library=new Map((domain?.ACTIVITY_LIBRARY||[]).map(a=>[a.templateRef,a.title]));
      return (Array.isArray(plan?.tasks)?plan.tasks:[]).filter(t=>
        this.text(t?.taskId)&&this.text(t?.templateRef)&&t?.applicability!=='not-applicable'&&
        typeof t.durationUnits==='number'&&Number.isInteger(t.durationUnits)&&t.durationUnits>=0)
        .map(t=>({id:t.taskId,ref:t.templateRef,title:library.get(t.templateRef)||t.templateRef,
          duration:Number(t.durationUnits),basis:t.durationBasis||'working'}));
    }
    static criticalRefs(source,lookup){
      if(!Array.isArray(source))return [];
      return [...new Set(source.map(id=>lookup.get(id)).filter(Boolean))].sort();
    }
    static appliedHistory(plan,asOf){
      const accepted=(Array.isArray(plan?.revisionEvents)?plan.revisionEvents:[])
        .filter(event=>event?.eventType==='scenario-applied'&&event.details?.scenarioId&&
          Number.isInteger(event.revision)&&event.revision>=0);
      const rows=[],seen=new Set(),missing=0;
      for(const [index,branch] of (Array.isArray(plan?.scenarioBranches)?plan.scenarioBranches:[]).entries()){
        if(!branch||branch.status!=='applied'||!this.text(branch.scenarioId))continue;
        const stamp=this.text(branch.appliedAt);
        const time=/^\d{4}-\d{2}-\d{2}T/.test(stamp)&&/(?:Z|[+-]\d{2}:\d{2})$/.test(stamp)?Date.parse(stamp):NaN;
        const date=Number.isFinite(time)?new Date(time).toISOString().slice(0,10):null;
        if(!date||date>asOf)continue;
        const event=accepted.find(e=>{
          const recorded=this.text(e.createdAt);
          const valid=/^\d{4}-\d{2}-\d{2}T/.test(recorded)&&/(?:Z|[+-]\d{2}:\d{2})$/.test(recorded);
          const time=valid?Date.parse(recorded):NaN;
          const day=Number.isFinite(time)?new Date(time).toISOString().slice(0,10):null;
          return e.details.scenarioId===branch.scenarioId&&
            Number(e.details.baseRevision)===Number(branch.baseRevision)&&
            day!==null&&day<=asOf;
        });
        if(!event||seen.has(branch.scenarioId)){missing++;continue}
        seen.add(branch.scenarioId);
        rows.push({position:index+1,baseRevision:Number.isInteger(branch.baseRevision)?branch.baseRevision:null,
          appliedRevision:event.revision,appliedOn:date,status:'applied-local'});
      }
      return {rows,missing};
    }
    static project(plan={},options={}){
      const language=Object.hasOwn(this.WORDS,options.language)?options.language:'en';
      const labels=this.WORDS[language],asOf=this.day(options.asOfDate);
      const empty={ready:false,labels,asOfDate:null,options:[],history:[],
        base:null,alternatives:[],summary:null,warnings:[labels.select]};
      const choices=this.candidates(plan),byId=new Map(choices.map(c=>[c.id,c]));
      const a=byId.get(options.taskIdA),b=byId.get(options.taskIdB);
      const durationA=this.integer(options.durationA),durationB=this.integer(options.durationB);
      if(!asOf||plan?.mode==='practice'||options.plannerConfirmed!==true||
        options.calendarReviewed!==true||!this.text(options.authorityRef)||
        !a||!b||durationA===null||durationB===null)return empty;
      if(!scenarios?.previewScenario)return {...empty,warnings:[labels.badSource]};
      let viewA,viewB;
      try{
        const info={actorId:'r12-readonly',createdAt:options.generatedAt||'2026-10-15T00:00:00Z'};
        const make=(name,choice,duration)=>scenarios.previewScenario(plan,{
          name,durationAdjustments:[{taskId:choice.id,durationUnits:duration,reason:'R12 candidate review'}]
        },info);
        viewA=make('Recovery A',a,durationA);
        viewB=make('Recovery B',b,durationB);
      }catch{return {...empty,warnings:[labels.badSource]}}
      if(!viewA?.ok||!viewB?.ok)return {...empty,warnings:[labels.badSource]};
      const refLookup=new Map(choices.map(c=>[c.id,c.ref]));
      const interpret=(result,name,choice,duration)=>{
        const branch=result.branch,cmp=branch.comparison||{};
        const status=branch.scenarioScheduleStatus==='calculated'&&
          branch.baseScheduleStatus==='calculated'&&!branch.violations.length?'calculated':'unverified';
        return {name,task:choice.ref,baseDuration:choice.duration,optionDuration:duration,
          basis:choice.basis,baseRevision:Number.isInteger(branch.baseRevision)?branch.baseRevision:null,
          forecast:this.day(branch.scenarioForecastDate),
          gained:Number.isFinite(branch.workingDaysGained)?branch.workingDaysGained:null,
          baseCriticalRefs:this.criticalRefs(cmp.criticalTaskIdsBefore,refLookup),
          criticalRefs:this.criticalRefs(cmp.criticalTaskIdsAfter,refLookup),
          changedCriticalRefs:this.criticalRefs(branch.changedCriticalTaskIds,refLookup),
          conflicts:Number.isInteger(cmp.resourceConflictsAfter)?cmp.resourceConflictsAfter:null,
          status,violations:branch.violations.length,
          provenance:{scenarioEngine:this.text(branch.engineVersion),
            scheduleEngine:this.text(branch.forecastProvenance?.engineVersion),
            inputRevision:Number.isInteger(branch.forecastProvenance?.inputRevision)?
              branch.forecastProvenance.inputRevision:null}};
      };
      const A=interpret(viewA,'A',a,durationA),B=interpret(viewB,'B',b,durationB);
      const baseDate=this.day(viewA.branch.baseForecastDate),target=this.day(plan?.commitments?.buyerRequiredExFactory);
      const history=this.appliedHistory(plan,asOf);
      const warnings=[labels.sourceOnly,labels.noProof,labels.noMutation,labels.sameBase,
        labels.noHistory,labels.noPath,labels.noAccess,labels.asOfCaution,
        labels.capacityMissing];
      if(!baseDate||!A.forecast||!B.forecast)warnings.push(labels.scheduleMissing);
      if(plan?.calendars?.[0]?.source==='user-not-configured')warnings.push(labels.calendarUnconfigured);
      if(history.missing)warnings.push(labels.historyMismatch);
      if(A.optionDuration===a.duration||B.optionDuration===b.duration)warnings.push(labels.noChanged);
      return {ready:true,labels,asOfDate:asOf,
        base:{revision:Number.isInteger(plan?.revision)?plan.revision:null,
          baselineSnapshots:Array.isArray(plan?.baselineSnapshots)?plan.baselineSnapshots.length:0,
          required:target,forecast:baseDate,criticalRefs:A.baseCriticalRefs},
        alternatives:[A,B],history:history.rows,
        summary:{sourceRevision:Number.isInteger(plan?.revision)?plan.revision:null,
          AversusB:'Same base revision',bothCalculated:A.status==='calculated'&&B.status==='calculated',
          locallyAppliedHistory:history.rows.length},
        warnings,disclosure:'Current revision, two local duration-only what-if variants, no buyer approval or capacity guarantee'};
    }
  }
  const api={WORDS:ScenarioComparisonReport.WORDS,
    project:(plan,options)=>ScenarioComparisonReport.project(plan,options)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaScenarioComparisonReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
