/**
 * VESA TNA GMR-07 R04 Critical Path report projection.
 * READ ONLY. The existing scheduling engine owns CPM calculations.
 * This layer approves a deliberately bounded FS/0, single-calendar model.
 * Advanced mixed dependencies, actuals, site-capacity/fixed constraints and
 * unsourced calendars must never be advertised as a verified critical path.
 */
(function(root){
  'use strict';
  const scheduling=root.VesaTnaScheduling||(typeof require==='function'?require('./scheduling.js'):null);
  const WEEK=Object.freeze({
    'mon-fri':{workingWeek:[1,2,3,4,5],title:'Monday–Friday'},
    'sun-thu':{workingWeek:[0,1,2,3,4],title:'Sunday–Thursday'},
    'sat-thu':{workingWeek:[0,1,2,3,4,6],title:'Saturday–Thursday'},
    'all-days':{workingWeek:[0,1,2,3,4,5,6],title:'All seven days'}
  });
  const WORDS=Object.freeze({
    en:{heading:'Critical Path — reviewed model',start:'Source start milestone',required:'Buyer-required ex-factory',
      week:'Reviewed working week',exceptions:'Reviewed holiday / shutdown dates (YYYY-MM-DD, commas or new lines)',
      dates:'Review the order start and required ex-factory dates.',
      confirmCalendar:'I reviewed the selected working week and every holiday / shutdown (blank means explicitly none).',
      confirmDurations:'I reviewed every included activity duration and working-day basis, including original template values.',
      confirmEdges:'I reviewed each activity dependency, including the S04 ex-factory handover chain.',
      confirmEndpoint:'I checked the buyer-required ex-factory source date (not independently buyer-authenticated).',
      threshold:'Optional near-critical float threshold (working days)',unknown:'Needs Information',
      first:'Order confirmed on',second:'PO received on',
      model:'Source-reviewed planning model only — not verified factory capacity, fixed actuals or buyer authorization.',
      controls:'CPM unavailable until the required source/review gates are satisfied.',
      headingDrivers:'Driving chain(s)',headingRows:'CPM activity dates and float',headingGates:'Recorded gate issues',
      task:'Activity',ref:'Ref',owner:'Owner',es:'Earliest start',ef:'Earliest finish',
      ls:'Latest start',lf:'Latest finish',tf:'Total float (workdays)',
      ff:'Free float (workdays)',driver:'Drives ex-factory',status:'Recorded status',
      forecast:'Calculated ex-factory',margin:'Buffer / slip (working days)',
      source:'Source reference',gate:'Gate',reason:'Recorded issue',
      none:'None recorded',warning:'Needs review',yes:'Yes',no:'No',
      notProduction:'Model excludes independent capacity, customs, material arrivals and unentered constraints.',
      allSupported:'Only FS with zero lag, working-day durations and one selected reviewed calendar supported for verified R04.',
      noEndpoint:'No S04 ex-factory handover task in the selected TNA.',
      noStart:'Select a real source start date and its event.',
      noDue:'Buyer required ex-factory date is missing or invalid.',
      noWeek:'Select and confirm a reviewed working week and holiday list.',
      noReview:'Confirm task durations, dependencies and required ex-factory source.',
      noCPM:'CPM engine is not available.',
      unsupported:'Unsupported dependency / calendar / fixed-date constraint: CPM not calculated.',
      disconnected:'Pre-ex-factory tasks missing from the S04 dependency chain.',
      missingDuration:'Missing or unsupported activity duration.',
      actuals:'Existing actual dates require an actual-aware CPM engine; no invented forecast.',
      split:'Split shipment endpoints need per-lot CPM; do not use one S04 result.',
      version:'Engine/source revision',negative:'Delivery date exceeds reviewed constraint by',
      endpoint:'S04 ex-factory handover',sourceCheck:'Calendar and durations were reviewed by the operator, not externally authenticated.'},
    bn:{heading:'ক্রিটিক্যাল পাথ — যাচাই করা মডেল',start:'উৎসের শুরুর তারিখ',required:'বায়ারের এক্স-ফ্যাক্টরি লক্ষ্য',
      week:'যাচাই করা কাজের সপ্তাহ',exceptions:'ছুটি / বন্ধের তারিখ (YYYY-MM-DD)',
      dates:'শুরুর এবং এক্স-ফ্যাক্টরি উৎস তারিখ পর্যালোচনা করুন।',
      confirmCalendar:'সপ্তাহ ও সব ছুটি / বন্ধের তারিখ যাচাই করেছি; ফাঁকা মানে কোনো ছুটি নেই।',
      confirmDurations:'সব কার্যক্রমের সময়সীমা এবং কাজের দিনের ভিত্তি যাচাই করেছি।',
      confirmEdges:'সব নির্ভরশীল কাজ এবং S04 হ্যান্ডওভার চেইন যাচাই করেছি।',
      confirmEndpoint:'বায়ারের এক্স-ফ্যাক্টরি উৎস তারিখ যাচাই করেছি (স্বাধীন অনুমোদন নয়)।',
      threshold:'ঐচ্ছিক কাছাকাছি ক্রিটিক্যাল সীমা (কাজের দিন)',unknown:'তথ্য প্রয়োজন',
      first:'অর্ডার নিশ্চিত',second:'PO পাওয়া',
      model:'উৎস-পর্যালোচিত পরিকল্পনা মাত্র — যাচাইকৃত উৎপাদন ক্ষমতা বা বায়ার অনুমোদন নয়।',
      controls:'প্রয়োজনীয় উৎস ও পর্যালোচনা ছাড়া CPM পাওয়া যাবে না।',
      headingDrivers:'নিয়ন্ত্রণকারী চেইন',headingRows:'CPM তারিখ ও ফ্লোট',headingGates:'গেট সমস্যা',
      task:'কাজ',ref:'রেফারেন্স',owner:'দায়িত্ব',es:'সর্বপ্রথম শুরু',ef:'সর্বপ্রথম শেষ',
      ls:'শেষ সম্ভাব্য শুরু',lf:'শেষ সম্ভাব্য শেষ',tf:'মোট ফ্লোট (কাজের দিন)',
      ff:'ফ্রি ফ্লোট (কাজের দিন)',driver:'এক্স-ফ্যাক্টরি নিয়ন্ত্রণ',status:'দর্জ অবস্থা',
      forecast:'গণনাকৃত এক্স-ফ্যাক্টরি',margin:'বাফার / বিলম্ব (কাজের দিন)',
      source:'উৎস',gate:'গেট',reason:'দর্জ সমস্যা',none:'রেকর্ড নেই',
      warning:'যাচাই প্রয়োজন',yes:'হ্যাঁ',no:'না',
      notProduction:'স্বাধীন উৎপাদন ক্ষমতা, শুল্ক ও উপকরণ আগমনের বাধা এই মডেলে নেই।',
      allSupported:'FS শূন্য lag, কাজের দিনের duration ও একটি যাচাই করা ক্যালেন্ডারই সমর্থিত।',
      noEndpoint:'এই TNA তে S04 হস্তান্তর নেই।',noStart:'উৎসের শুরুর তারিখ বেছে নিন।',
      noDue:'এক্স-ফ্যাক্টরি তারিখ নেই বা ভুল।',noWeek:'কাজের সপ্তাহ ও ছুটি যাচাই করুন।',
      noReview:'Duration, dependency ও ডেলিভারি উৎস নিশ্চিত করুন।',noCPM:'CPM ইঞ্জিন নেই।',
      unsupported:'অসমর্থিত dependency/calendar/fixed-date: CPM করা হয়নি।',
      disconnected:'S04 চেইনে আগের কাজ সংযুক্ত নেই।',missingDuration:'Duration নেই বা অসমর্থিত।',
      actuals:'Actual তারিখ আছে; actual-aware CPM ছাড়া অনুমান নয়।',
      split:'Split shipment-এর জন্য lot অনুযায়ী CPM প্রয়োজন।',
      version:'ইঞ্জিন/রিভিশন',negative:'টার্গেট অতিক্রান্ত',endpoint:'S04 এক্স-ফ্যাক্টরি',
      sourceCheck:'অপারেটর ক্যালেন্ডার ও duration দেখেছেন; স্বাধীন যাচাই নয়।'},
    hi:{heading:'क्रिटिकल पाथ — समीक्षा मॉडल',start:'स्रोत प्रारंभ दिन',required:'बायर एक्स-फैक्ट्री लक्ष्य',
      week:'जाँचा हुआ कार्य सप्ताह',exceptions:'छुट्टियाँ / बंदी तारीख (YYYY-MM-DD)',
      dates:'ऑर्डर प्रारंभ और एक्स-फैक्ट्री स्रोत तारीख देखें।',
      confirmCalendar:'कार्य सप्ताह और सभी छुट्टियाँ जाँची; खाली का अर्थ कोई छुट्टी नहीं।',
      confirmDurations:'सभी कार्य अवधि और कार्य-दिन आधार की समीक्षा की।',
      confirmEdges:'सभी निर्भर कार्य और S04 हैंडओवर चेन की समीक्षा की।',
      confirmEndpoint:'बायर एक्स-फैक्ट्री स्रोत तारीख जाँची (स्वतंत्र मंजूरी नहीं)।',
      threshold:'वैकल्पिक नियर-क्रिटिकल सीमा (कार्य दिन)',unknown:'जानकारी चाहिए',
      first:'ऑर्डर पुष्टि दिन',second:'PO प्राप्त दिन',
      model:'स्रोत-समीक्षित योजना; सत्यापित उत्पादन क्षमता या बायर मंजूरी नहीं।',
      controls:'स्रोत और समीक्षा पुष्टि के बिना CPM उपलब्ध नहीं।',
      headingDrivers:'नियंत्रक चेन',headingRows:'CPM दिन और फ्लोट',headingGates:'गेट समस्याएँ',
      task:'कार्य',ref:'रेफरेंस',owner:'जिम्मेदार',es:'सबसे पहले शुरू',ef:'सबसे पहले खत्म',
      ls:'सबसे बाद शुरू',lf:'सबसे बाद खत्म',tf:'कुल फ्लोट (कार्य दिन)',
      ff:'फ्री फ्लोट (कार्य दिन)',driver:'एक्स-फैक्ट्री नियंत्रक',status:'दर्ज स्थिति',
      forecast:'गणना एक्स-फैक्ट्री',margin:'बफर / देरी (कार्य दिन)',
      source:'स्रोत',gate:'गेट',reason:'दर्ज समस्या',none:'कुछ दर्ज नहीं',
      warning:'समीक्षा आवश्यक',yes:'हाँ',no:'नहीं',
      notProduction:'वास्तविक क्षमता, कस्टम और सामग्री आगमन बाधाएँ इसमें नहीं हैं।',
      allSupported:'FS शून्य lag, कार्य-दिन अवधि और एक समीक्षा कैलेंडर ही समर्थित।',
      noEndpoint:'TNA में S04 हैंडओवर नहीं है।',noStart:'स्रोत प्रारंभ दिन चुनें।',
      noDue:'एक्स-फैक्ट्री तारीख नहीं या गलत।',noWeek:'कार्य सप्ताह और छुट्टियाँ जाँचें।',
      noReview:'Duration, dependency, लक्ष्य स्रोत की पुष्टि करें।',noCPM:'CPM इंजन नहीं है।',
      unsupported:'असमर्थित dependency/calendar/fixed-date: CPM उपलब्ध नहीं।',
      disconnected:'S04 चेन में पहले के कार्य नहीं हैं।',missingDuration:'अवधि गायब या असमर्थित।',
      actuals:'Actual तारीख है; actual-aware CPM के बिना अनुमान नहीं।',
      split:'Split shipment के लिए प्रति लॉट CPM चाहिए।',
      version:'इंजन/रिविज़न',negative:'टार्गेट से देरी',endpoint:'S04 एक्स-फैक्ट्री',
      sourceCheck:'कैलेंडर और अवधि की ऑपरेटर ने समीक्षा की; स्वतंत्र जाँच नहीं।'},
    ta:{heading:'Critical Path — review செய்த model',start:'Source ஆரம்ப தேதி',required:'Buyer required ex-factory',
      week:'Review செய்த working week',exceptions:'Holiday / shutdown தேதிகள் (YYYY-MM-DD)',
      dates:'Order start மற்றும் ex-factory source தேதிகளை review செய்யவும்.',
      confirmCalendar:'Working week, holiday/shutdown எல்லாம் பார்த்தேன்; காலியாக இருந்தால் விடுமுறை இல்லை.',
      confirmDurations:'எல்லா task duration மற்றும் working-day basis-ஐ review செய்தேன்.',
      confirmEdges:'Dependencies மற்றும் S04 handover chain-ஐ review செய்தேன்.',
      confirmEndpoint:'Buyer required ex-factory source தேதியை review செய்தேன் (buyer signed approval அல்ல).',
      threshold:'Optional near-critical float (working days)',unknown:'தகவல் தேவை',
      first:'Order confirmed date',second:'PO received date',
      model:'Source-review planning model; verified factory capacity அல்லது buyer approval அல்ல.',
      controls:'Source மற்றும் review உறுதி இல்லாமல் CPM கணக்கிட முடியாது.',
      headingDrivers:'Controlling chain(s)',headingRows:'CPM தேதிகள் / float',headingGates:'Recorded gate issues',
      task:'Activity',ref:'Ref',owner:'பொறுப்பாளர்',es:'Earliest start',ef:'Earliest finish',
      ls:'Latest start',lf:'Latest finish',tf:'Total float (workdays)',
      ff:'Free float (workdays)',driver:'Ex-factory control',status:'பதிவான நிலை',
      forecast:'Calculated ex-factory',margin:'Buffer / late (working days)',
      source:'Source',gate:'Gate',reason:'பதிவான சிக்கல்',none:'பதிவில்லை',
      warning:'Review தேவை',yes:'ஆம்',no:'இல்லை',
      notProduction:'Factory capacity, customs, material arrival போன்ற constraints இந்த model-ல் இல்லை.',
      allSupported:'FS/zero lag, working-day durations, ஒரு review calendar மட்டுமே supported.',
      noEndpoint:'இந்த TNA-ல் S04 handover இல்லை.',noStart:'உண்மையான source start event-ஐ தேர்வுசெய்யவும்.',
      noDue:'Buyer ex-factory date இல்லை/தவறு.',noWeek:'Working week மற்றும் holidays review செய்யவும்.',
      noReview:'Duration, dependencies, ex-factory source உறுதிசெய்யவும்.',noCPM:'CPM engine இல்லை.',
      unsupported:'Unsupported dependency/calendar/fixed dates: CPM காட்டப்படாது.',
      disconnected:'S04 chain-ல் தேவையான tasks இணைக்கப்படவில்லை.',
      missingDuration:'Task duration இல்லை அல்லது unsupported.',
      actuals:'Actual dates உள்ளன; actual-aware CPM இல்லாமல் கணிப்பு செய்யமாட்டோம்.',
      split:'Split shipment இருந்தால் ஒவ்வொரு lot-க்கும் தனி CPM வேண்டும்.',
      version:'Engine/source revision',negative:'Delivery target தாண்டியது',endpoint:'S04 ex-factory handover',
      sourceCheck:'Calendar மற்றும் durations operator review செய்தவை; independent verify அல்ல.'}
  });
  const lang=v=>WORDS[v]?v:'en';
  const date=value=>{
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const t=new Date(value+'T00:00:00Z');
    return Number.isNaN(t.getTime())||t.toISOString().slice(0,10)!==value?null:value;
  };
  const blank=value=>value===null||value===undefined||String(value).trim()==='';
  function project(plan,options={}){
    const locale=lang(options.language),labels=WORDS[locale],review=options.review||{};
    const warnings=[],missing=[],disallowed=[];
    const result={ready:false,labels,confidence:'unavailable',missingInputs:missing,
      warnings,unsupported:disallowed,rows:[],criticalChains:[],driverTaskRefs:[],
      gateIssues:[],dependencies:[],review:{},requiredDate:null,startDate:null,
      forecastDate:null,bufferWorkdays:null,workingWeek:null,exceptionDates:[],
      engineVersion:scheduling?.ENGINE_VERSION||null,inputRevision:plan?.revision??0,
      endpointRef:'S04',modelScope:'FS-zero-lag-single-calendar-pre-exfactory-only'};
    if(!scheduling?.schedule){missing.push(labels.noCPM);return result;}
    const startField=['orderConfirmedOn','poReceivedOn'].includes(review.startAnchor)?review.startAnchor:null;
    const start=startField?date(plan?.commitments?.[startField]):null;
    const required=date(plan?.commitments?.buyerRequiredExFactory);
    const week=WEEK[review.weekKey];
    if(!start)missing.push(labels.noStart);
    if(!required)missing.push(labels.noDue);
    if(start&&required&&required<start)missing.push(labels.dates);
    if(!week||!review.calendarConfirmed)missing.push(labels.noWeek);
    if(!review.durationsReviewed||!review.dependenciesReviewed||!review.endpointReviewed)missing.push(labels.noReview);
    const exceptionsString=String(review.exceptionDates||'').trim();
    const values=exceptionsString?exceptionsString.split(/[\s,;]+/).filter(Boolean):[];
    if(values.length>150||values.some(x=>!date(x))||new Set(values).size!==values.length)
      missing.push(labels.noWeek+' (exception date list invalid or duplicate)');
    const near=blank(review.nearCriticalDays)?null:Number(review.nearCriticalDays);
    if(near!==null&&(!Number.isInteger(near)||near<0||near>60))
      missing.push(labels.threshold+' (0–60)');
    const tasks=Array.isArray(plan?.tasks)?plan.tasks:[],edges=Array.isArray(plan?.edges)?plan.edges:[];
    const endpoint=tasks.find(task=>task.templateRef==='S04');
    if(!endpoint)missing.push(labels.noEndpoint);
    if((plan?.shipmentLots||[]).length)disallowed.push(labels.split);
    if((plan?.constraints||[]).length)disallowed.push(labels.unsupported+' (fixed constraints)');
    const graph=scheduling.validateGraph(tasks,edges);
    if(!graph.ok)disallowed.push(...graph.errors);
    if(!graph.ok||!endpoint||missing.length||disallowed.length)return result;
    const taskMap=new Map(tasks.map(task=>[task.taskId,task]));
    const incoming=new Map(tasks.map(task=>[task.taskId,[]]));
    for(const e of edges)incoming.get(e.successorTaskId).push(e);
    const includedIds=new Set(),stack=[endpoint.taskId];
    while(stack.length){
      const id=stack.pop();
      if(includedIds.has(id))continue;
      includedIds.add(id);
      for(const e of incoming.get(id)||[])stack.push(e.predecessorTaskId);
    }
    const subset=tasks.filter(task=>includedIds.has(task.taskId));
    const subsetEdges=edges.filter(edge=>includedIds.has(edge.predecessorTaskId)&&includedIds.has(edge.successorTaskId));
    const orphan=tasks.filter(task=>task.applicability!=='not-applicable'&&task.stageCode!=='S'&&!includedIds.has(task.taskId));
    if(orphan.length)disallowed.push(labels.disconnected+': '+orphan.slice(0,8).map(x=>x.templateRef).join(', '));
    for(const task of subset){
      if(!Number.isInteger(task.durationUnits)||task.durationUnits<0||task.durationUnits>3650||task.durationBasis!=='working')
        disallowed.push(labels.missingDuration+': '+task.templateRef);
      if(task.calendarId!=='default'||task.applicability==='not-applicable'||task.scheduleMode!=='calculated')
        disallowed.push(labels.unsupported+': '+task.templateRef);
      if(task.dates&&['actualStart','actualFinish'].some(key=>!!task.dates[key]))
        disallowed.push(labels.actuals+': '+task.templateRef);
    }
    for(const e of subsetEdges){
      if(e.relation!=='FS'||e.lagUnits!==0||!['working',null,undefined,''].includes(e.lagBasis)||e.allowLead)
        disallowed.push(labels.unsupported+': '+(taskMap.get(e.predecessorTaskId)?.templateRef||'?')+
          '→'+(taskMap.get(e.successorTaskId)?.templateRef||'?'));
    }
    if(disallowed.length)return result;
    const calendar={calendarId:'default',name:week.title,workingWeek:[...week.workingWeek],
      holidays:[...values],shutdowns:[],revision:0};
    let relative,driving;
    try{
      relative=scheduling.schedule(subset,subsetEdges,{calendar,startDate:start,requiredDate:required,
        nearCriticalDays:near==null?0:near});
      driving=scheduling.schedule(subset,subsetEdges,{calendar,startDate:start,
        nearCriticalDays:near==null?0:near});
    }catch(e){disallowed.push(labels.unsupported+' ('+String(e.message).slice(0,150)+')');return result;}
    if(relative.validity!=='valid'||driving.validity!=='valid'){
      disallowed.push(...relative.errors,...relative.missingInputs,...driving.errors,...driving.missingInputs);
      return result;
    }
    // Relative schedule critical chains may be empty when the required
    // deadline has slack. The deadline-independent run reveals the drivers.
    const driverChains=driving.project.criticalPaths.map(ids=>ids.map(id=>taskMap.get(id)?.templateRef||id));
    const drivers=new Set(driving.project.criticalPaths.flat());
    const rows=subset.map(task=>{
      const row=relative.taskResults[task.taskId];
      return {ref:task.templateRef,taskId:task.taskId,title:task.title,
        owner:task.ownerParty||null,status:task.status,
        earlyStart:row.earlyStart,earlyFinish:row.earlyFinish,
        lateStart:row.lateStart,lateFinish:row.lateFinish,
        totalFloat:row.floatDays,freeFloat:row.freeFloatDays,
        drivesExFactory:drivers.has(task.taskId),
        nearCritical:near!==null&&row.floatDays>0&&row.floatDays<=near,
        requiredGate:!!task.isRequiredGate,source:'reviewed-duration-and-FS-dependency'};
    });
    const issues=subset.filter(task=>task.isRequiredGate&&
      (['blocked','rejected','awaiting-approval'].includes(task.status)||
       task.status==='approved'&&!(task.proofRefs||[]).some(ref=>String(ref||'').trim())))
      .map(task=>({ref:task.templateRef,title:task.title,status:task.status,
        reason:task.status==='approved'?'Approved status lacks source proof.':
          'Required gate still has an unresolved recorded status.'}));
    const margin=relative.project.workingDaysEarlyOrLate;
    warnings.push(labels.model,labels.notProduction,labels.sourceCheck,labels.allSupported);
    if(issues.length)warnings.push(labels.headingGates+': '+issues.length);
    if(margin>0)warnings.push(labels.negative+' '+margin+' '+labels.tf);
    return {...result,ready:true,confidence:'operator-reviewed-model-only',startDate:start,
      requiredDate:required,forecastDate:relative.project.forecastDate,
      bufferWorkdays:-margin,workingWeek:week.title,exceptionDates:values,
      startSource:startField,rows,criticalChains:driverChains,
      driverTaskRefs:[...new Set(driverChains.flat())],dependencies:subsetEdges.map(edge=>({
        from:taskMap.get(edge.predecessorTaskId).templateRef,
        to:taskMap.get(edge.successorTaskId).templateRef,relation:'FS',
        lagUnits:0,lagBasis:'working'})),
      gateIssues:issues,
      nearCriticalThreshold:near,
      review:{startSource:startField,workingWeekKey:review.weekKey,calendarConfirmed:true,
        durationConfirmed:true,dependenciesConfirmed:true,endpointSourceConfirmed:true,
        exceptionsCount:values.length},
      warnings,missingInputs:[],unsupported:[],
      validity:'source-reviewed'};
  }
  const api={WEEK,WORDS,project};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaCriticalPath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
