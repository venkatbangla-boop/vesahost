(function(root){
  'use strict';
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);
  const operations=root.VesaTnaOperations||(typeof require==='function'?require('./operations.js'):null);

  /**
   * GMR-14 / R11 approval-source-history projection.
   *
   * Owns report-only output. It does NOT create/approve submissions, change
   * a task status, amend a baseline, authenticate a named reviewer or write a
   * saved record. Buyer rows are limited to the existing R02 allowlist;
   * source item names, private reviewers, comments, evidence IDs and the
   * free-text contents of revision events never cross this boundary.
   *
   * Lifecycle: explicit report date, audience and consent, plus an authority
   * reference supplied by the operator. These are browser-local disclosure
   * controls, not server authorization. All dates are strict civil dates.
   */
  class ApprovalHistoryReport {
    static EN=Object.freeze({
      title:'Approval History',asOf:'Review as-of date',audience:'Report audience',
      buyer:'Buyer-facing',factory:'Internal factory',
      consentBuyer:'I have permission to share only the screened buyer-facing approval history and will review the recipient.',
      consentFactory:'I have permission to review this order’s internal factory approval history and will restrict circulation.',
      authority:'Disclosure authority source reference (never exported)',
      selectReview:'Select a valid review date, buyer/factory audience, matching consent and a source reference before showing approval history.',
      records:'Recorded approval decisions',rounds:'Source resubmission entries',
      revisions:'Recorded task-status revisions',pending:'Current pending / rejected checkpoints',
      context:'Approval source context',ref:'Activity ref',item:'Approval checkpoint',
      seq:'Source sequence position',revision:'TNA revision',submitted:'Submitted',
      received:'Received',decision:'Decision date',response:'Source response',
      assessed:'Local documentation check',authorityRecorded:'Decision authority recorded',
      evidenceRecorded:'Evidence reference recorded',linked:'Linked milestones',
      eventDate:'Recorded on (UTC)',event:'Revision event',status:'Source task status',
      required:'Required approving party',reviewAsOf:'Reviewed as-of',
      yes:'Recorded (unverified)',no:'Not recorded',missing:'Needs Information',
      noRecords:'No source approval records for this audience or review date.',
      noRounds:'No source resubmission sequence entries.',
      noRevisions:'No source task-status revisions are recorded.',
      noPending:'No open approval checkpoints are recorded.',
      sourceOnly:'Source-recorded only; not independently authenticated buyer or factory approval.',
      noClearance:'Submission, proof reference or task-approved status alone is NOT an authorized buyer decision.',
      noPrivacy:'Private names/reviewer IDs, evidence identifiers, return comments, prices, LC and internal remarks are excluded.',
      noPermission:'Browser consent is NOT secure server-side buyer/factory or tenant authorization.',
      noRoundProof:'Sequence position is the source array position, NOT an independently confirmed submission round number.',
      noEventProof:'Task revisions show LOCAL recorded statuses, not authenticated approval decisions.',
      missingFields:'Missing/invalid/future dates or decision authority were treated as Needs Information.',
      hiddenFuture:'Future-dated submission/decision entries were withheld from this as-of view.',
      invalidLinks:'Unlinked source approvals are never included in the buyer-facing report.',
      incomplete:'Needs Information',pendingState:'Pending (source)',
      approvedState:'Approved (source check only)',
      rejectedState:'Rejected (source check only)',
      waivedState:'Waived (source check only)',
      sourceSubmitted:'Submitted (source)',
      future:'Not in as-of review',unknown:'Needs Information',
      taskUpdate:'Task status update, not decision',
      noBuyerLinked:'No buyer-facing linked milestones recorded.',
      noOfficialRound:'An entry in the source resubmission array has incomplete fields; no outcome is inferred.'
    });
    static WORDS=Object.freeze({
      en:ApprovalHistoryReport.EN,
      bn:{...ApprovalHistoryReport.EN,
        title:'অনুমোদনের ইতিহাস',asOf:'পর্যালোচনার তারিখ',audience:'রিপোর্টের পাঠক',
        buyer:'বায়ারের জন্য',factory:'কারখানার অভ্যন্তরীণ',
        consentBuyer:'শুধু বায়ারের উপযোগী যাচাই করা অনুমোদনের ইতিহাস শেয়ার করার অনুমতি আছে; প্রাপক যাচাই করব।',
        consentFactory:'এই অর্ডারের অভ্যন্তরীণ অনুমোদনের ইতিহাস দেখার অনুমতি আছে; অনুমতি ছাড়া শেয়ার করব না।',
        authority:'শেয়ার করার অনুমতির উৎস রেফারেন্স (রিপোর্টে থাকবে না)',
        selectReview:'সঠিক তারিখ, buyer/factory পাঠক, সম্মতি ও অনুমতির রেফারেন্স না দিলে তথ্য দেখানো হবে না।',
        records:'রেকর্ডকৃত সিদ্ধান্ত',rounds:'পুনরায় জমার উৎস রেকর্ড',
        revisions:'কাজের অবস্থার পরিবর্তন',pending:'অপেক্ষমাণ / বাতিল চেকপয়েন্ট',
        context:'উৎসের তথ্য',ref:'কাজের রেফারেন্স',item:'অনুমোদনের বিষয়',
        seq:'উৎস তালিকার ক্রম',revision:'TNA সংশোধন',submitted:'জমার তারিখ',
        received:'প্রাপ্তির তারিখ',decision:'সিদ্ধান্তের তারিখ',response:'উৎসে লেখা উত্তর',
        assessed:'স্থানীয় নথি যাচাই',authorityRecorded:'সিদ্ধান্তদাতার তথ্য আছে',
        evidenceRecorded:'প্রমাণের রেফারেন্স আছে',linked:'সংযুক্ত মাইলস্টোন',
        eventDate:'নথির তারিখ (UTC)',event:'সংশোধনের ধরন',status:'উৎসে কাজের অবস্থা',
        required:'অনুমোদনদাতা পক্ষ',reviewAsOf:'পর্যালোচনার তারিখ',
        yes:'রেকর্ড আছে (যাচাই নয়)',no:'রেকর্ড নেই',missing:'তথ্য প্রয়োজন',
        noRecords:'এই পাঠকের জন্য অনুমোদনের রেকর্ড নেই।',
        noRounds:'পুনরায় জমার রেকর্ড নেই।',noRevisions:'কাজের অবস্থা পরিবর্তনের রেকর্ড নেই।',
        noPending:'অপেক্ষমাণ অনুমোদন নেই।',
        sourceOnly:'উৎসে লেখা তথ্য; বায়ার বা কারখানার অনুমোদন স্বাধীনভাবে যাচাই হয়নি।',
        noClearance:'জমা, প্রমাণ বা task approved মানেই বায়ারের অনুমোদন নয়।',
        noPrivacy:'ব্যক্তিগত পরিচয়, প্রমাণ নম্বর, মন্তব্য, দাম ও LC বাদ দেওয়া হয়েছে।',
        noPermission:'Browser-এর সম্মতি নিরাপদ server permission নয়।',
        noRoundProof:'উৎস তালিকার ক্রম নিশ্চিত অনুমোদন রাউন্ড নম্বর নয়।',
        noEventProof:'Task revision স্থানীয় অবস্থা, স্বাধীন সিদ্ধান্ত নয়।',
        missingFields:'ভুল/অনুপস্থিত/ভবিষ্যৎ তারিখ বা অনুমতি Needs Information।',
        hiddenFuture:'ভবিষ্যতের জমা ও সিদ্ধান্ত পর্যালোচনা থেকে বাদ দেওয়া হয়েছে।',
        invalidLinks:'সংযুক্ত buyer milestone ছাড়া buyer report-এ অনুমোদন দেখানো হয় না।',
        incomplete:'তথ্য প্রয়োজন',pendingState:'অপেক্ষমাণ (উৎস)',
        approvedState:'অনুমোদিত (উৎস যাচাই)',rejectedState:'বাতিল (উৎস যাচাই)',
        waivedState:'ছাড় (উৎস যাচাই)',sourceSubmitted:'জমা (উৎস)',
        future:'এই তারিখের মধ্যে নয়',unknown:'তথ্য প্রয়োজন',
        taskUpdate:'Task status পরিবর্তন; সিদ্ধান্ত নয়',noBuyerLinked:'Buyer milestone নেই।',
        noOfficialRound:'পুনঃজমার তথ্য অসম্পূর্ণ; ফলাফল অনুমান করা হয়নি।'
      },
      hi:{...ApprovalHistoryReport.EN,
        title:'अनुमोदन इतिहास',asOf:'समीक्षा तारीख',audience:'रिपोर्ट पाठक',
        buyer:'बायर के लिए',factory:'आंतरिक फैक्टरी',
        consentBuyer:'केवल जांची गई बायर-उपयुक्त अनुमोदन जानकारी साझा करने का अधिकार है; प्राप्तकर्ता जांचूंगा।',
        consentFactory:'आंतरिक फैक्टरी अनुमोदन इतिहास देखने का अधिकार है; बिना अनुमति साझा नहीं करूंगा।',
        authority:'शेयर अनुमति का स्रोत संदर्भ (रिपोर्ट में नहीं जाएगा)',
        selectReview:'सही तारीख, buyer/factory पाठक, पुष्टि और अनुमति संदर्भ दें।',
        records:'दर्ज अनुमोदन निर्णय',rounds:'दोबारा भेजने की दर्ज प्रविष्टियां',
        revisions:'कार्य स्थिति में संशोधन',pending:'लंबित / अस्वीकृत कार्य',
        context:'स्रोत संदर्भ',ref:'कार्य रेफरेंस',item:'अनुमोदन विषय',
        seq:'स्रोत क्रम',revision:'TNA संशोधन',submitted:'जमा तारीख',
        received:'प्राप्ति',decision:'निर्णय तारीख',response:'दर्ज जवाब',
        assessed:'स्थानीय दस्तावेज जांच',authorityRecorded:'निर्णय प्राधिकारी दर्ज',
        evidenceRecorded:'प्रमाण रेफरेंस दर्ज',linked:'संबद्ध माइलस्टोन',
        eventDate:'दर्ज दिन (UTC)',event:'बदलाव',status:'दर्ज कार्य स्थिति',
        required:'अनुमोदन पक्ष',reviewAsOf:'समीक्षा तारीख',
        yes:'दर्ज (असत्यापित)',no:'दर्ज नहीं',missing:'जानकारी चाहिए',
        noRecords:'इस पाठक के लिए अनुमोदन रिकॉर्ड नहीं।',
        noRounds:'दोबारा जमा करने का रिकॉर्ड नहीं।',noRevisions:'कार्य बदलाव नहीं।',
        noPending:'लंबित अनुमोदन नहीं।',
        sourceOnly:'स्रोत में दर्ज; बायर या फैक्टरी अनुमोदन स्वतंत्र सत्यापित नहीं।',
        noClearance:'जमा, प्रमाण या task approved से बायर मंजूरी सिद्ध नहीं होती।',
        noPrivacy:'निजी पहचान, प्रमाण नंबर, टिप्पणी, मूल्य और LC नहीं दिए गए।',
        noPermission:'स्थानीय पुष्टि सुरक्षित सर्वर अनुमति नहीं है।',
        noRoundProof:'स्रोत का क्रम आधिकारिक अनुमोदन राउंड नहीं।',
        noEventProof:'Task revision स्थानीय स्थिति है, प्रमाणित निर्णय नहीं।',
        missingFields:'गायब/गलत/भविष्य तारीख या प्राधिकारी के लिए जानकारी चाहिए।',
        hiddenFuture:'भविष्य की जमा/निर्णय तारीखें रोकी गईं।',
        invalidLinks:'Buyer milestone के बिना बायर रिपोर्ट में रिकॉर्ड नहीं दिखेगा।',
        incomplete:'जानकारी चाहिए',pendingState:'लंबित (स्रोत)',
        approvedState:'मंजूर (स्रोत जांच)',rejectedState:'अस्वीकृत (स्रोत जांच)',
        waivedState:'छूट (स्रोत जांच)',sourceSubmitted:'जमा (स्रोत)',
        future:'समीक्षा से बाद में',unknown:'जानकारी चाहिए',
        taskUpdate:'Task status बदलाव, निर्णय नहीं',noBuyerLinked:'Buyer milestone दर्ज नहीं।',
        noOfficialRound:'पुनःजमा रिकॉर्ड अधूरा; नतीजा नहीं माना गया।'
      },
      ta:{...ApprovalHistoryReport.EN,
        title:'Approval வரலாறு',asOf:'மதிப்பாய்வு தேதி',audience:'ரிப்போர்ட் பார்வையாளர்',
        buyer:'Buyer-க்கு',factory:'Factory உள்ளகப் பயன்பாடு',
        consentBuyer:'Buyer-க்கு ஏற்ற approval வரலாற்றைப் பகிர அனுமதி உள்ளது; பெறுபவரை சரிபார்ப்பேன்.',
        consentFactory:'இந்த order-ன் உள்ளக factory approval பதிவைப் பார்க்க அனுமதி உள்ளது; அனுமதியின்றி பகிரமாட்டேன்.',
        authority:'பகிர்வு அனுமதி ஆதாரம் (ரிப்போர்ட்டில் வராது)',
        selectReview:'சரியான தேதி, buyer/factory பார்வையாளர், ஒப்புதல், அனுமதி ஆதாரம் கொடுக்கவும்.',
        records:'பதிவான approval முடிவுகள்',rounds:'மறுசமர்ப்பிப்பு பதிவுகள்',
        revisions:'Task நிலை மாற்ற வரலாறு',pending:'காத்திருக்கும் / நிராகரித்த செயல்கள்',
        context:'மூல ஆவண விவரம்',ref:'செயல் குறிப்பு',item:'Approval செயல்',
        seq:'மூல வரிசை',revision:'TNA திருத்தம்',submitted:'சமர்ப்பித்த தேதி',
        received:'பெற்ற தேதி',decision:'முடிவு தேதி',response:'பதிவான பதில்',
        assessed:'உள்ளக ஆவணச் சோதனை',authorityRecorded:'முடிவளிப்பவர் பதிவு',
        evidenceRecorded:'ஆதாரக் குறிப்பு உள்ளது',linked:'இணைந்த செயல்கள்',
        eventDate:'பதிவு தேதி (UTC)',event:'திருத்த வகை',status:'மூல task நிலை',
        required:'ஒப்புதல் தர வேண்டியவர்',reviewAsOf:'மதிப்பாய்வு தேதி',
        yes:'பதிவு உள்ளது (தனி உறுதி இல்லை)',no:'பதிவு இல்லை',missing:'தகவல் தேவை',
        noRecords:'இந்த பார்வையாளருக்கான approval பதிவு இல்லை.',
        noRounds:'மறுசமர்ப்பிப்பு பதிவு இல்லை.',noRevisions:'Task மாற்றப் பதிவு இல்லை.',
        noPending:'காத்திருக்கும் approval இல்லை.',
        sourceOnly:'மூலப்பதிவு மட்டுமே; buyer/factory approval தனியாகச் சரிபார்க்கப்படவில்லை.',
        noClearance:'சமர்ப்பிப்பு, proof அல்லது task approved மட்டும் buyer அனுமதி அல்ல.',
        noPrivacy:'தனிப்பட்ட அடையாளம், proof எண், remarks, விலை, LC வெளியிடப்படவில்லை.',
        noPermission:'Browser ஒப்புதல் பாதுகாப்பான server permission அல்ல.',
        noRoundProof:'மூல வரிசை உறுதியான official approval round எண் அல்ல.',
        noEventProof:'Task revision உள்ளக பதிவு; தனிச் சரிபார்த்த முடிவு அல்ல.',
        missingFields:'விடுபட்ட/தவறான/எதிர்கால தேதி, authority Needs Information.',
        hiddenFuture:'எதிர்கால சமர்ப்பிப்பு/முடிவுகள் மறைக்கப்பட்டன.',
        invalidLinks:'Buyer milestone இணைப்பில்லாதவை buyer report-ல் மறைக்கப்படும்.',
        incomplete:'தகவல் தேவை',pendingState:'காத்திருப்பு (source)',
        approvedState:'Approved (மூலச் சோதனை)',rejectedState:'Rejected (மூலச் சோதனை)',
        waivedState:'Waived (மூலச் சோதனை)',sourceSubmitted:'Submitted (மூலம்)',
        future:'மதிப்பாய்வு தேதிக்குப் பின்னர்',unknown:'தகவல் தேவை',
        taskUpdate:'Task நிலை மாற்றம்; approval முடிவு அல்ல',noBuyerLinked:'Buyer milestones இல்லை.',
        noOfficialRound:'மறுசமர்ப்பிப்பு விவரம் முழுமையில்லை; முடிவு ஊகிக்கப்படவில்லை.'
      }
    });
    static DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
    static FINAL=new Set(['approved','rejected','waived']);
    static AWAITING=new Set(['submitted','awaiting-approval','rejected']);
    static text(x){return typeof x==='string'?x.trim():''}
    static day(x){
      if(typeof x!=='string'||!this.DATE_RE.test(x))return null;
      const date=new Date(x+'T00:00:00Z');
      return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===x?x:null;
    }
    static shownDay(x,asOf){const date=this.day(x);return date&&date<=asOf?date:null}
    static status(x){const supported=new Set(['not-started','submitted','awaiting-approval','approved','rejected','waived','blocked','in-progress','completed','not-applicable']);return supported.has(x)?x:'needs-information'}
    static mappedTasks(plan,mode,buyerMilestones){
      const eligible=new Map();
      const buyer=new Map((Array.isArray(buyerMilestones)?buyerMilestones:[]).map(m=>[m.ref,m.title]));
      const canon=new Map((domain?.ACTIVITY_LIBRARY||[]).map(x=>[x.templateRef,x.title]));
      for(const t of Array.isArray(plan?.tasks)?plan.tasks:[]){
        const ref=this.text(t?.templateRef);
        if(!ref||!this.text(t?.taskId)||eligible.has(t.taskId))continue;
        if(mode==='buyer'&&!buyer.has(ref))continue;
        // Raw task titles never leave source, even in factory mode; factory
        // custom rows display only source ref, not unreviewed private text.
        const title=buyer.get(ref)||canon.get(ref)||ref;
        eligible.set(t.taskId,{ref,title,status:this.status(t.status)});
      }
      return eligible;
    }
    static evidence(x){return !!this.text(x?.evidenceRef)}
    static authority(x){return !!(this.text(x?.decidedBy)||this.text(x?.authorizedReviewerId)||
      this.text(x?.authorizedReviewerParty)||this.text(x?.authorizedParty)||
      x?.delegatedLocalOfficeAllowed===true)}
    static assessment(record,asOf,labels){
      const submission=this.shownDay(record?.submittedDate,asOf);
      const received=this.shownDay(record?.receivedDate,asOf);
      const decided=this.shownDay(record?.decisionDate,asOf);
      const recorded=this.status(record?.responseStatus);
      const reviewed=operations?.approvalState?.(record)||{status:'needs-information'};
      const complete=!!submission&&!!decided&&decided>=submission&&
        (!record?.receivedDate||(!!received&&received>=submission&&received<=decided))&&
        this.evidence(record)&&this.authority(record);
      let status=labels.incomplete;
      if(recorded==='approved'&&reviewed.status==='approved'&&complete)status=labels.approvedState;
      else if(recorded==='rejected'&&reviewed.status==='rejected'&&submission&&decided&&decided>=submission)
        status=labels.rejectedState;
      else if(recorded==='waived'&&reviewed.status==='waived'&&complete)
        status=labels.waivedState;
      else if(submission&&!decided&&(!record?.decisionDate)&&!this.FINAL.has(recorded))
        status=labels.pendingState;
      const futureDecision=!!this.day(record?.decisionDate)&&record?.decisionDate>asOf;
      const response=futureDecision?labels.future:recorded==='needs-information'?labels.missing:recorded;
      const invalid=!!record?.submittedDate&&!submission||
        !!record?.decisionDate&&!decided||
        !!record?.receivedDate&&!received||
        (this.FINAL.has(recorded)&&status===labels.incomplete);
      return {submitted:submission,received,decision:decided,status,response,
        authorityRecorded:this.authority(record),evidenceRecorded:this.evidence(record),
        invalid,futureDecision};
    }
    static approvalRows(plan,options,tasks,labels){
      const records=[],rounds=[],stats={invalid:0,hidden:0,unlinked:0};
      const refsByTask=new Map([...tasks].map(([id,x])=>[id,x]));
      for(const [index,record] of (Array.isArray(plan?.approvals)?plan.approvals:[]).entries()){
        if(!record||typeof record!=='object'||!this.text(record.approvalId)){stats.invalid++;continue}
        const linked=[...new Set((Array.isArray(record.requiredForTaskIds)?record.requiredForTaskIds:[])
          .map(id=>refsByTask.get(id)).filter(Boolean).map(x=>x.ref))];
        if(options.mode==='buyer'&&!linked.length){stats.unlinked++;continue}
        if(record.submittedDate&&this.day(record.submittedDate)>options.asOfDate){stats.hidden++;continue}
        const title=linked.map(ref=>[...tasks.values()].find(t=>t.ref===ref)?.title||ref).join(' · ')||
          (options.mode==='factory'?labels.item+' '+(index+1):labels.missing);
        const fields=this.assessment(record,options.asOfDate,labels);
        if(fields.invalid)stats.invalid++;
        records.push({sequence:index+1,title,refs:linked.join(', ')||labels.missing,
          revision:Number.isInteger(record.revision)&&record.revision>=0?record.revision:null,
          submitted:fields.submitted,received:fields.received,decision:fields.decision,
          response:fields.response,assessment:fields.status,
          authorityRecorded:fields.authorityRecorded,evidenceRecorded:fields.evidenceRecorded});
        const sequence=Array.isArray(record.resubmissionSequence)?record.resubmissionSequence:[];
        for(const [j,round] of sequence.entries()){
          if(round?.submittedDate&&this.day(round.submittedDate)>options.asOfDate){stats.hidden++;continue}
          const evaluated=this.assessment(round,options.asOfDate,labels);
          if(evaluated.invalid||!round||typeof round!=='object')stats.invalid++;
          rounds.push({sourceRecord:index+1,sequencePosition:j+1,title,refs:linked.join(', ')||labels.missing,
            submitted:evaluated.submitted,received:evaluated.received,decision:evaluated.decision,
            response:evaluated.response,assessment:evaluated.status,
            authorityRecorded:evaluated.authorityRecorded,evidenceRecorded:evaluated.evidenceRecorded});
        }
      }
      return {records,rounds,stats};
    }
    static revisionRows(plan,tasks,options,labels){
      const rows=[],seen=new Set();
      const allowedTypes=new Set(['task-status-changed','merchandising-task-revised']);
      for(const item of Array.isArray(plan?.revisionEvents)?plan.revisionEvents:[]){
        if(!allowedTypes.has(item?.eventType)||!item?.details)continue;
        const task=tasks.get(item.details.taskId);
        if(!task)continue;
        const candidate=item.eventType==='task-status-changed'?item.details.nextStatus:
          item.details.changes?.status?.after;
        const status=this.status(candidate);
        if(!['submitted','awaiting-approval','approved','rejected','waived'].includes(status))continue;
        const timestamp=this.text(item.createdAt);
        const validStamp=/^\d{4}-\d{2}-\d{2}T/.test(timestamp)&&/(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp);
        const parsed=validStamp?Date.parse(timestamp):NaN;
        const date=Number.isFinite(parsed)?new Date(parsed).toISOString().slice(0,10):null;
        if(!date||date>options.asOfDate)continue;
        const revision=Number.isInteger(item.revision)&&item.revision>=0?item.revision:null;
        const key=[item.eventId,task.ref,date,status].join('|');
        if(seen.has(key))continue;seen.add(key);
        rows.push({ref:task.ref,title:task.title,sourceStatus:status,
          loggedAt:date,revision,event:labels.taskUpdate});
      }
      return rows.sort((a,b)=>a.loggedAt.localeCompare(b.loggedAt)||a.ref.localeCompare(b.ref));
    }
    static project(plan={},options={}){
      const language=Object.hasOwn(this.WORDS,options.language)?options.language:'en';
      const labels=this.WORDS[language],asOfDate=this.day(options.asOfDate);
      const mode=options.mode==='buyer'||options.mode==='factory'?options.mode:null;
      const ready=!!asOfDate&&!!mode&&!!this.text(options.authorityRef)&&
        (mode==='buyer'?options.buyerShareConfirmed===true:options.factoryConfirmed===true)&&
        plan?.mode!=='practice';
      const empty={ready:false,mode:null,asOfDate:null,labels,records:[],rounds:[],
        revisions:[],pending:[],counts:null,warnings:[labels.selectReview]};
      if(!ready)return empty;
      const tasks=this.mappedTasks(plan,mode,options.buyerMilestones);
      const {records,rounds,stats}=this.approvalRows(plan,{mode,asOfDate},tasks,labels);
      const revisions=this.revisionRows(plan,tasks,{asOfDate},labels);
      const pending=[...tasks.values()].filter(t=>this.AWAITING.has(t.status))
        .map(x=>({ref:x.ref,title:x.title,status:x.status}));
      const warnings=[labels.sourceOnly,labels.noClearance,labels.noPrivacy,
        labels.noPermission,labels.noRoundProof,labels.noEventProof];
      if(!records.length)warnings.push(labels.noRecords);
      if(!rounds.length)warnings.push(labels.noRounds);
      if(!revisions.length)warnings.push(labels.noRevisions);
      if(stats.invalid)warnings.push(labels.missingFields);
      if(stats.hidden)warnings.push(labels.hiddenFuture);
      if(stats.unlinked&&mode==='buyer')warnings.push(labels.invalidLinks);
      return {ready:true,mode,asOfDate,labels,records,rounds,revisions,pending,
        counts:{records:records.length,roundEntries:rounds.length,
          revisions:revisions.length,pending:pending.length,uncertain:stats.invalid},
        warnings,disclosure:'Only local source history; not independent approval authentication'};
    }
  }
  const api={WORDS:ApprovalHistoryReport.WORDS,
    project:(plan,options)=>ApprovalHistoryReport.project(plan,options)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaApprovalHistoryReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
