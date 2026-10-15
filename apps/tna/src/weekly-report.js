(function(root){
  'use strict';

  /**
   * R05 buyer-safe weekly report owner. This module reads an existing TNA plan
   * without editing its activities, scheduling engine, approvals or saved copy.
   * Only allowlisted garment milestones and explicitly buyer-shareable recovery
   * confirmations may leave this boundary. A report date is never inferred.
   */
  class WeeklyTnaReport {
    static EXTRA=Object.freeze({
      PP06:['PPM scheduled','পিপিএম নির্ধারিত','PPM निर्धारित','PPM திட்டமிட்டது'],
      C04:['Cutting started','কাটিং শুরু','कटिंग शुरू','Cutting தொடக்கம்'],
      C06:['Cutting completed','কাটিং সম্পন্ন','कटिंग पूरी','Cutting முடிந்தது'],
      P01:['Sewing started','সেলাই শুরু','सिलाई शुरू','Sewing தொடக்கம்'],
      P03:['Sewing completed','সেলাই সম্পন্ন','सिलाई पूरी','Sewing முடிந்தது'],
      P07:['Finishing started','ফিনিশিং শুরু','फिनिशिंग शुरू','Finishing தொடக்கம்'],
      P08:['Finishing completed','ফিনিশিং সম্পন্ন','फिनिशिंग पूरी','Finishing முடிந்தது'],
      PK02:['Packing started','প্যাকিং শুরু','पैकिंग शुरू','Packing தொடக்கம்'],
      Q06:['Final inspection booked','ফাইনাল ইন্সপেকশন বুকড','अंतिम निरीक्षण बुक','Final inspection பதிவு']
    });

    static WORDS=Object.freeze({
      en:{weekStart:'Week starting',weekEnd:'Week ending',reviewDate:'Review as-of date',
        selectDates:'Select valid week start, week end (seven calendar days) and review as-of date on or after the start.',
        completed:'Completed this week',missed:'Missed this week',nextWeek:'Next week due',
        approvals:'Outstanding approvals',recoveries:'Separately confirmed recovery',
        noRows:'No source-recorded activity in this section.',unknown:'Needs Information',
        ref:'Ref',activity:'Activity',status:'Source-reported status',original:'Original',
        revised:'Revised',forecast:'Forecast',actual:'Actual',due:'Due date',
        action:'Buyer-safe agreed action',agreementDate:'Agreement date',authority:'Confirmed by',
        source:'Source-entered status/dates only; no buyer decision independently authenticated.',
        calendar:'Seven calendar days; no factory working calendar or production capacity assumed.',
        asOf:'Missed means open and due by the selected review date, not a future commitment.',
        missing:'Open buyer-facing milestones without a valid due date',
        recoveryNotice:'Recovery notes alone are NOT proof of agreement; only separately reviewed, evidenced, share-approved entries are shown.',
        badRecovery:'A selected recovery needs a valid source milestone, buyer-safe summary, confirmation party, evidence reference and agreement date no later than review date.',
        shareLabel:'I reviewed the separate recovery agreement and approve this buyer-safe wording.',
        sourceRef:'Agreement evidence reference (review only; not included in report)',
        agreementProof:'User-reviewed source reference recorded; not independently verified.',
        noApproval:'An owner field alone is not proof of buyer approval.',
        invalid:'Invalid or missing source dates are not silently replaced.'},
      bn:{weekStart:'সপ্তাহের শুরু',weekEnd:'সপ্তাহের শেষ',reviewDate:'পর্যালোচনার তারিখ',
        selectDates:'সঠিক সপ্তাহের শুরু, সাত দিনের শেষ ও শুরু থেকে পর্যালোচনার তারিখ বেছে নিন।',
        completed:'এই সপ্তাহে সম্পন্ন',missed:'এই সপ্তাহে সময় পেরিয়েছে',nextWeek:'পরের সপ্তাহের কাজ',
        approvals:'অনুমোদন বাকি',recoveries:'আলাদাভাবে নিশ্চিত রিকভারি',
        noRows:'এই অংশে উৎসে কোনো কাজ রেকর্ড নেই।',unknown:'তথ্য প্রয়োজন',
        ref:'রেফারেন্স',activity:'কাজ',status:'উৎসের অবস্থা',original:'মূল',
        revised:'সংশোধিত',forecast:'পূর্বাভাস',actual:'বাস্তব',due:'লক্ষ্য তারিখ',
        action:'বায়ারকে জানানোর সম্মত কাজ',agreementDate:'সম্মতির তারিখ',authority:'নিশ্চিত করেছেন',
        source:'শুধু উৎসে লেখা অবস্থা ও তারিখ; বায়ারের সিদ্ধান্ত স্বাধীনভাবে যাচাই হয়নি।',
        calendar:'সাত ক্যালেন্ডার দিন; কারখানার ছুটি বা উৎপাদন ক্ষমতা অনুমান করা হয়নি।',
        asOf:'নির্বাচিত তারিখের মধ্যে বাকি কাজই সময় পেরিয়েছে; ভবিষ্যৎ নয়।',
        missing:'তারিখ নেই এমন খোলা বায়ার কাজ',
        recoveryNotice:'রিকভারি নোট মানেই সম্মতি নয়; আলাদা যাচাই ও প্রমাণ ছাড়া দেখানো হবে না।',
        badRecovery:'সম্মত রিকভারির জন্য কাজ, প্রকাশযোগ্য বিবরণ, পক্ষ, প্রমাণ ও সঠিক তারিখ চাই।',
        shareLabel:'আলাদা রিকভারি সম্মতি যাচাই করেছি এবং বায়ারকে জানানোর বিবরণ অনুমোদন করছি।',
        sourceRef:'সম্মতির প্রমাণের রেফারেন্স (রিপোর্টে প্রকাশ হবে না)',
        agreementProof:'উৎসের রেফারেন্স রিভিউ করা; স্বাধীন যাচাই হয়নি।',
        noApproval:'শুধু দায়িত্বপ্রাপ্ত পক্ষের নাম বায়ার অনুমোদন নয়।',
        invalid:'উৎসের ভুল বা ফাঁকা তারিখ অনুমান করে পূরণ হয় না।'},
      hi:{weekStart:'सप्ताह शुरू',weekEnd:'सप्ताह समाप्त',reviewDate:'समीक्षा तारीख',
        selectDates:'सही सप्ताह शुरू/अंत (सात दिन) और शुरू के बाद की समीक्षा तारीख चुनें।',
        completed:'इस सप्ताह पूरा',missed:'इस सप्ताह चूका',nextWeek:'अगले सप्ताह देय',
        approvals:'अनुमोदन बाकी',recoveries:'अलग से पुष्टि की गई रिकवरी',
        noRows:'इस भाग में स्रोत पर कोई काम दर्ज नहीं।',unknown:'जानकारी चाहिए',
        ref:'रेफरेंस',activity:'काम',status:'स्रोत-दर्ज स्थिति',original:'मूल',
        revised:'संशोधित',forecast:'पूर्वानुमान',actual:'वास्तविक',due:'देय तारीख',
        action:'बायर-सुरक्षित सहमत कार्रवाई',agreementDate:'सहमति तारीख',authority:'पुष्टि करने वाला',
        source:'सिर्फ स्रोत में दर्ज तारीख और स्थिति; बायर निर्णय स्वतंत्र रूप से सत्यापित नहीं।',
        calendar:'सात कैलेंडर दिन; फैक्ट्री छुट्टियाँ या क्षमता अनुमान नहीं।',
        asOf:'चूका केवल वह खुला काम जो चयनित समीक्षा तारीख तक देय था।',
        missing:'बिना तारीख के खुले बायर माइलस्टोन',
        recoveryNotice:'रिकवरी नोट को सहमति न मानें; अलग समीक्षा और प्रमाण आवश्यक।',
        badRecovery:'सहमति के लिए स्रोत माइलस्टोन, सुरक्षित विवरण, पक्ष, प्रमाण और सही तारीख जरूरी है।',
        shareLabel:'अलग रिकवरी सहमति जाँची और बायर को देने वाला विवरण मंजूर किया।',
        sourceRef:'सहमति प्रमाण रेफरेंस (रिपोर्ट में नहीं दिखेगा)',
        agreementProof:'स्रोत प्रमाण की समीक्षा दर्ज; स्वतंत्र जाँच नहीं हुई।',
        noApproval:'सिर्फ मालिक/जिम्मेदार पक्ष का नाम बायर मंजूरी नहीं।',
        invalid:'गलत या खाली तारीख का अनुमान नहीं लगाया गया।'},
      ta:{weekStart:'வாரத் தொடக்கம்',weekEnd:'வார முடிவு',reviewDate:'Review தேதி',
        selectDates:'சரியான ஏழு நாள் தொடக்கம், முடிவு மற்றும் அதற்குப் பிறகான review தேதியைத் தேர்ந்தெடுக்கவும்.',
        completed:'இந்த வாரம் முடிந்தவை',missed:'இந்த வாரம் தவறியவை',nextWeek:'அடுத்த வாரம் Due',
        approvals:'Approval காத்திருப்பவை',recoveries:'தனியாக உறுதிசெய்த Recovery',
        noRows:'இந்தப் பகுதியில் பதிவு செய்த வேலை இல்லை.',unknown:'தகவல் தேவை',
        ref:'Ref',activity:'வேலை',status:'Source பதிவு நிலை',original:'முதல் திட்டம்',
        revised:'திருத்தியது',forecast:'Forecast',actual:'Actual',due:'Due தேதி',
        action:'Buyer-க்கு பகிர ஏற்ற ஒப்புக்கொண்ட செயல்',agreementDate:'ஒப்புதல் தேதி',authority:'உறுதி செய்தவர்',
        source:'பதிவான தேதிகளும் நிலைகளும் மட்டும்; buyer முடிவு தனியாக சரிபார்க்கப்படவில்லை.',
        calendar:'ஏழு calendar நாட்கள்; factory விடுமுறை அல்லது capacity ஊகிக்கப்படவில்லை.',
        asOf:'Review தேதிக்குள் முடியாத வேலை மட்டும் missed; எதிர்கால வேலை அல்ல.',
        missing:'Due date இல்லாத திறந்த buyer milestones',
        recoveryNotice:'Recovery note மட்டும் ஒப்புதல் இல்லை; தனி ஆதாரமும் share அனுமதியும் தேவை.',
        badRecovery:'Recovery-க்கு milestone, buyer-safe விவரம், ஒப்புதல் party, source மற்றும் தேதி தேவை.',
        shareLabel:'தனி recovery ஒப்புதலை மதிப்பாய்வு செய்து buyer-க்கு பகிரும் விவரத்தை ஏற்கிறேன்.',
        sourceRef:'ஒப்புதல் ஆதார reference (report-ல் காட்டாது)',
        agreementProof:'Source reference review பதிவு; தனியாக verify செய்யவில்லை.',
        noApproval:'Owner பெயர் மட்டும் buyer approval அல்ல.',
        invalid:'தவறான / காலியான தேதியை ஊகித்து நிரப்பமாட்டோம்.'}
    });

    static DAY(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
      const date=new Date(value+'T00:00:00Z');
      return Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value
        ?null:Math.floor(date.getTime()/86400000);
    }

    static project(plan,options={}){
      const language=['en','bn','hi','ta'].includes(options.language)?options.language:'en';
      const labels=this.WORDS[language],languageIndex=['en','bn','hi','ta'].indexOf(language);
      const start=this.DAY(options.weekStart),end=this.DAY(options.weekEnd),asOf=this.DAY(options.reviewDate);
      const sections={completed:[],missed:[],nextWeek:[],approvals:[],recoveries:[]};
      const empty={ready:false,weekStart:null,weekEnd:null,reviewDate:null,labels,sections,
        rows:[],counts:{completed:0,missed:0,nextWeek:0,approvals:0,recoveries:0},
        candidates:[],missingDueCount:0,warnings:[labels.selectDates]};
      if(start===null||end===null||asOf===null||end-start!==6||asOf<start)return empty;
      const safe=new Map();
      for(const row of Array.isArray(options.buyerMilestones)?options.buyerMilestones:[]){
        if(!row?.ref||safe.has(row.ref))continue;
        safe.set(row.ref,{ref:row.ref,title:row.title,statusId:row.statusId,status:row.status,
          original:row.original,current:row.current,forecast:row.forecast,actual:row.actual,
          buyerAction:row.buyerAction||null});
      }
      const sources=new Map();
      for(const task of Array.isArray(plan?.tasks)?plan.tasks:[]){
        const ref=String(task?.templateRef||'');
        if(!ref||sources.has(ref)||task.applicability==='not-applicable')continue;
        sources.set(ref,task);
        if(!Object.hasOwn(this.EXTRA,ref)||safe.has(ref))continue;
        const status=String(task.status||'not-started');
        safe.set(ref,{ref,title:this.EXTRA[ref][languageIndex],statusId:status,
          status:typeof options.statusFor==='function'?options.statusFor(status):status,
          original:this.DAY(task.dates?.baselineFinish)===null?null:task.dates.baselineFinish,
          current:this.DAY(task.dates?.currentTargetFinish)===null?null:task.dates.currentTargetFinish,
          forecast:this.DAY(task.dates?.forecastFinish)===null?null:task.dates.forecastFinish,
          actual:this.DAY(task.dates?.actualFinish)===null?null:task.dates.actualFinish,
          buyerAction:null});
      }
      const warnings=[labels.source,labels.calendar,labels.asOf,labels.recoveryNotice,labels.noApproval];
      const closed=new Set(['approved','completed','waived','not-applicable']);
      const candidateRefs=new Set(),candidates=[];
      let missingDueCount=0,invalidCount=0;
      for(const row of safe.values()){
        const task=sources.get(row.ref);
        if(!task)continue;
        const original=task.dates?.baselineFinish,revised=task.dates?.currentTargetFinish;
        const hasRevised=revised!==undefined&&revised!==null&&revised!=='';
        const rawDue=hasRevised?revised:original;
        const due=this.DAY(rawDue);
        const actual=this.DAY(row.actual),status=row.statusId;
        const item={group:'',ref:row.ref,title:row.title,statusId:status,status:row.status,
          original:row.original||null,revised:row.current||null,forecast:row.forecast||null,
          actual:row.actual||null,due:due===null?null:rawDue,request:row.buyerAction||null,
          agreementDate:null,publicAction:null,confirmedBy:null,evidenceRecorded:null};
        if((status==='completed'||status==='approved')&&actual!==null&&actual>=start&&actual<=end&&actual<=asOf)
          sections.completed.push({...item,group:'completed'});
        if(!closed.has(status)){
          if(due===null){missingDueCount+=1;if(rawDue)invalidCount+=1;}
          if(due!==null&&due>=start&&due<=end&&due<=asOf)
            sections.missed.push({...item,group:'missed'});
          if(due!==null&&due>=end+1&&due<=end+7)
            sections.nextWeek.push({...item,group:'nextWeek'});
          if(status==='awaiting-approval'||row.buyerAction)
            sections.approvals.push({...item,group:'approvals'});
        }
        if(typeof task.recoveryAction==='string'&&task.recoveryAction.trim()){
          candidateRefs.add(row.ref);
          candidates.push({ref:row.ref,title:row.title});
        }
      }
      if(invalidCount)warnings.push(labels.invalid+' ('+invalidCount+')');
      if(missingDueCount)warnings.push(labels.missing+': '+missingDueCount);
      const reviewRows=Array.isArray(options.recoveryConfirmations)?options.recoveryConfirmations:[];
      let invalidRecovery=false;
      const seen=new Set();
      for(const review of reviewRows){
        const ref=String(review?.ref||'');
        if(!review?.shareApproved||seen.has(ref)||!candidateRefs.has(ref)){invalidRecovery=true;continue;}
        const action=String(review.publicAction||'').trim(),party=String(review.confirmedBy||'').trim();
        const evidence=String(review.evidenceRef||'').trim(),agreedOn=String(review.agreedOn||'');
        const day=this.DAY(agreedOn);
        if(!action||action.length>240||!party||party.length>120||
          !evidence||evidence.length>180||day===null||day>asOf){
          invalidRecovery=true;continue;
        }
        seen.add(ref);
        const row=safe.get(ref);
        sections.recoveries.push({group:'recoveries',ref,title:row.title,statusId:row.statusId,
          status:row.status,original:row.original,revised:row.current,forecast:row.forecast,
          actual:row.actual,due:null,request:null,agreementDate:agreedOn,publicAction:action,
          confirmedBy:party,evidenceRecorded:labels.agreementProof});
      }
      if(invalidRecovery)warnings.push(labels.badRecovery);
      for(const section of Object.values(sections))
        section.sort((a,b)=>String(a.due||a.agreementDate||'9999-12-31').localeCompare(
          String(b.due||b.agreementDate||'9999-12-31'))||a.ref.localeCompare(b.ref));
      const ready=!invalidRecovery;
      const counts=Object.fromEntries(Object.entries(sections).map(([key,rows])=>[key,rows.length]));
      return {ready,weekStart:options.weekStart,weekEnd:options.weekEnd,reviewDate:options.reviewDate,
        labels,sections,rows:ready?['completed','missed','nextWeek','approvals','recoveries'].flatMap(key=>sections[key]):[],
        counts,candidates,missingDueCount,warnings};
    }
  }

  const api={project:(plan,options)=>WeeklyTnaReport.project(plan,options),
    WORDS:WeeklyTnaReport.WORDS,EXTRA:WeeklyTnaReport.EXTRA};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaWeeklyReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
