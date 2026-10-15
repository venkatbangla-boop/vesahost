(function(root){
  'use strict';
  const operations=root.VesaTnaOperations||(typeof require==='function'?require('./operations.js'):null);

  /**
   * GMR-10 R07. Pure source projection owner: no writes, date estimates,
   * implicit capacity, role authentication or recomputation of signed plans.
   * Audience consent is a local disclosure acknowledgement, NOT access control.
   * Canonical milestones alone enter buyer output; factory-only operation rows,
   * comments, rejects, WIP, proof IDs, supplier/LC and FOB never do.
   */
  class ProductionStatusReport {
    static STAGES=Object.freeze([
      {key:'cutting',kind:'cut',start:'C04',update:'C05',end:'C06',
        titles:['Cutting','কাটিং','कटिंग','Cutting']},
      {key:'sewing',kind:'sew',start:'P01',update:'P02',end:'P03',
        titles:['Sewing','সেলাই','सिलाई','Sewing']},
      {key:'finishing',kind:'finish',start:'P07',update:'P08',end:'P08',
        titles:['Finishing','ফিনিশিং','फिनिशिंग','Finishing']},
      {key:'packing',kind:'pack',start:'PK02',update:'PK03',end:'PK04',
        titles:['Packing','প্যাকিং','पैकिंग','Packing']}
    ]);
    static WORDS=Object.freeze({
      en:{
        asOf:'Review as-of date',audience:'Report audience',choose:'Select audience',
        internal:'Internal production',buyer:'Authorized buyer-safe',
        internalConsent:'I reviewed this internal report and will restrict factory-only information to authorized production personnel.',
        buyerConsent:'I reviewed these source milestones and have permission to share ONLY the buyer-safe production summary for this order.',
        buyerReference:'Authorization source reference (checked, never exported)',
        selectReview:'Select a valid review date, audience and required disclosure confirmation before preparing R07.',
        selectBuyer:'Buyer-safe release also needs a nonempty authorization source reference.',
        noAccess:'Local consent is NOT secure role authentication; do not treat the browser as buyer authorization.',
        source:'Source-reported stage events and quantities, not independently verified production or buyer acceptance.',
        noRate:'Verified daily output, full capacity and a reviewed working calendar are absent; no factory throughput or completion date is inferred.',
        notActual:'No actual date without recorded completion status, dated source and evidence reference.',
        noBalance:'Balance is calculated only from evidenced matching-unit stage required and completed quantities; it is NOT automatically an order balance.',
        noLotAggregation:'Operations and shipment lots are not added together or treated as accepted stage output.',
        noSource:'No source-backed stage output or completion proof recorded.',unknown:'Needs Information',
        ref:'Source ref',stage:'Stage',milestone:'Milestone',status:'Source status',
        original:'Original finish',current:'Revised finish',forecast:'Recorded forecast finish',
        actual:'Evidenced actual finish',start:'Evidenced actual start',required:'Stage required',
        completed:'Stage completed (recorded)',remaining:'Stage balance (calculated)',
        unit:'Unit',rate:'Reviewed daily rate',days:'Rate-based working days (not end date)',
        projected:'Calculated completion date',sourceForecast:'Source-entered stage forecast',
        operation:'Operation',lot:'Lot',qtyInput:'Input',qtyDone:'Completed',
        rejected:'Rejected',reworked:'Reworked',wip:'WIP',
        unaccounted:'Unaccounted operation input',quantityState:'Operation source state',
        internalOnly:'Operation details are factory-internal and are excluded from buyer exports.',
        buyerOnly:'Buyer output contains canonical stages and reviewed milestone facts only.',
        invalidQty:'Invalid or mismatched quantities withheld',invalidDate:'Invalid or future actual dates withheld',
        missingProof:'Some recorded actual dates or quantities lack a source proof reference.',
        missingRate:'No separately confirmed and evidenced daily rate for all stages.',
        unvalidated:'All output figures are source-recorded; evidence IDs are not embedded in this report.',
        rateCaution:'A verified rate yields only estimated working DAYS, not a delivery date without checked calendars, lot overlap and gates.',
        statusNotStarted:'Not started',statusProgress:'In progress',statusSubmitted:'Submitted',
        statusAwaiting:'Awaiting approval',statusApproved:'Approved (source)',
        statusRejected:'Rejected',statusBlocked:'Blocked',
        statusCompleted:'Completed (source)',statusWaived:'Waived',statusNA:'Not applicable'
      },
      bn:{
        asOf:'পর্যালোচনার তারিখ',audience:'রিপোর্টের পাঠক',choose:'পাঠক বেছে নিন',
        internal:'অভ্যন্তরীণ উৎপাদন',buyer:'অনুমোদিত বায়ার সারাংশ',
        internalConsent:'অভ্যন্তরীণ তথ্য শুধু অনুমোদিত উৎপাদন টিমে রাখব।',
        buyerConsent:'এই অর্ডারের শুধু বায়ার-উপযোগী উৎপাদন সারাংশ ভাগ করার অনুমতি আছে।',
        buyerReference:'অনুমতির উৎস রেফারেন্স (রিপোর্টে থাকবে না)',
        selectReview:'সঠিক তারিখ, পাঠক এবং প্রয়োজনীয় সম্মতি বেছে নিন।',
        selectBuyer:'বায়ার রিপোর্টের জন্য অনুমতির রেফারেন্স লিখুন।',
        noAccess:'এই সম্মতি নিরাপদ সার্ভার অনুমোদন নয়।',source:'উৎসে লেখা উৎপাদন তথ্য, স্বাধীন যাচাই হয়নি।',
        noRate:'যাচাই করা দৈনিক আউটপুট/ক্যালেন্ডার নেই; শেষ তারিখ অনুমান নয়।',
        notActual:'সমাপ্তির অবস্থা, তারিখ ও প্রমাণ ছাড়া actual দেখানো হবে না।',
        noBalance:'প্রমাণসহ একই ইউনিটের required ও completed থেকে balance; পুরো অর্ডারের নয়।',
        noLotAggregation:'অপারেশন ও শিপমেন্ট লট যোগ করে তৈরি পণ্য বলা হয় না।',
        noSource:'এই ধাপে উৎস-প্রমাণ নেই।',unknown:'তথ্য প্রয়োজন',
        ref:'উৎস রেফারেন্স',stage:'ধাপ',milestone:'মাইলস্টোন',status:'উৎসের অবস্থা',
        original:'মূল শেষ',current:'সংশোধিত শেষ',forecast:'রেকর্ডকৃত পূর্বাভাস',
        actual:'প্রমাণসহ actual শেষ',start:'প্রমাণসহ শুরু',required:'ধাপের প্রয়োজন',
        completed:'ধাপে সম্পন্ন',remaining:'ধাপের বাকি',unit:'একক',rate:'যাচাই করা দৈনিক হার',
        days:'আনুমানিক কর্মদিবস',projected:'হিসাবের শেষ তারিখ',sourceForecast:'উৎসের পূর্বাভাস',
        operation:'অপারেশন',lot:'লট',qtyInput:'ইনপুট',qtyDone:'সম্পন্ন',rejected:'বাতিল',
        reworked:'পুনঃকাজ',wip:'চলমান',unaccounted:'অবশিষ্ট ইনপুট',
        quantityState:'অপারেশনের উৎস',internalOnly:'অপারেশন বিবরণ বায়ার রিপোর্টে নেই।',
        buyerOnly:'শুধু অনুমোদিত প্রকাশযোগ্য মাইলস্টোন দেখানো হয়েছে।',
        invalidQty:'ভুল/অমিল পরিমাণ প্রকাশ হয়নি',invalidDate:'ভুল/ভবিষ্যতের actual তারিখ বাদ',
        missingProof:'কিছু actual/quantity-র প্রমাণ নেই।',missingRate:'সব ধাপে নিশ্চিত দৈনিক হার নেই।',
        unvalidated:'উৎসের তথ্য; প্রমাণের আইডি রিপোর্টে নেই।',
        rateCaution:'হার থেকে কর্মদিবস, শেষ তারিখ নয়।',
        statusNotStarted:'শুরু হয়নি',statusProgress:'চলমান',statusSubmitted:'জমা',
        statusAwaiting:'অনুমোদন বাকি',statusApproved:'অনুমোদিত (উৎস)',
        statusRejected:'বাতিল',statusBlocked:'আটকে আছে',
        statusCompleted:'সম্পন্ন (উৎস)',statusWaived:'ছাড়',statusNA:'প্রযোজ্য নয়'
      },
      hi:{
        asOf:'समीक्षा तारीख',audience:'रिपोर्ट पाठक',choose:'पाठक चुनें',
        internal:'आंतरिक उत्पादन',buyer:'अनुमोदित बायर सारांश',
        internalConsent:'फैक्ट्री की आंतरिक जानकारी सिर्फ अनुमति वाले उत्पादन कर्मियों तक रखूँगा।',
        buyerConsent:'इस ऑर्डर का केवल बायर-सुरक्षित उत्पादन सारांश साझा करने की अनुमति है।',
        buyerReference:'अनुमति स्रोत रेफरेंस (रिपोर्ट में नहीं आएगा)',
        selectReview:'सही तारीख, पाठक और जरूरी पुष्टि चुनें।',
        selectBuyer:'बायर के लिए अनुमति स्रोत रेफरेंस आवश्यक है।',
        noAccess:'लोकल पुष्टि सुरक्षित सर्वर अनुमति नहीं है।',
        source:'स्रोत में दर्ज उत्पादन; स्वतंत्र सत्यापन नहीं।',
        noRate:'सत्यापित दैनिक आउटपुट/कैलेंडर नहीं; खत्म होने की तारीख अनुमान नहीं।',
        notActual:'स्थिति, तारीख और प्रमाण के बिना actual नहीं।',
        noBalance:'प्रमाणित समान यूनिट के required-completed से balance, जरूरी नहीं पूरे ऑर्डर का।',
        noLotAggregation:'ऑपरेशन और शिपमेंट लॉट दो बार नहीं गिने जाते।',
        noSource:'इस चरण का स्रोत प्रमाण नहीं।',unknown:'जानकारी चाहिए',
        ref:'स्रोत रेफरेंस',stage:'चरण',milestone:'माइलस्टोन',status:'दर्ज स्थिति',
        original:'मूल समाप्ति',current:'संशोधित समाप्ति',forecast:'दर्ज पूर्वानुमान',
        actual:'प्रमाणित वास्तविक समाप्ति',start:'प्रमाणित वास्तविक शुरू',
        required:'आवश्यक मात्रा',completed:'दर्ज तैयार',remaining:'चरण में बाकी',
        unit:'इकाई',rate:'जाँची दैनिक दर',days:'दर आधारित कार्यदिवस',
        projected:'हिसाब की समाप्ति तारीख',sourceForecast:'दर्ज पूर्वानुमान',
        operation:'ऑपरेशन',lot:'लॉट',qtyInput:'इनपुट',qtyDone:'पूर्ण',rejected:'रिजेक्ट',
        reworked:'रीवर्क',wip:'WIP',unaccounted:'बिना हिसाब इनपुट',
        quantityState:'ऑपरेशन स्रोत स्थिति',internalOnly:'आंतरिक ऑपरेशन जानकारी बायर को नहीं दी जाती।',
        buyerOnly:'केवल बायर-सुरक्षित माइलस्टोन और तथ्य दिखते हैं।',
        invalidQty:'अमान्य/बेमेल मात्रा नहीं दिखाई',invalidDate:'गलत/भविष्य actual नहीं दिखाया',
        missingProof:'कुछ actual/मात्राओं के स्रोत प्रमाण नहीं।',
        missingRate:'सभी चरणों के सत्यापित दैनिक दर उपलब्ध नहीं।',
        unvalidated:'सिर्फ स्रोत रिकॉर्ड; प्रमाण ID शामिल नहीं।',
        rateCaution:'कार्यदिवस का अनुमान आखिरी तारीख नहीं।',
        statusNotStarted:'शुरू नहीं',statusProgress:'काम जारी',statusSubmitted:'जमा',
        statusAwaiting:'मंजूरी बाकी',statusApproved:'स्वीकृत (स्रोत)',
        statusRejected:'अस्वीकृत',statusBlocked:'रुका',
        statusCompleted:'पूरा (स्रोत)',statusWaived:'छूट',statusNA:'लागू नहीं'
      },
      ta:{
        asOf:'Review தேதி',audience:'Report பார்ப்பவர்',choose:'Audience தேர்வு',
        internal:'Internal production',buyer:'அனுமதிக்கப்பட்ட Buyer summary',
        internalConsent:'Factory-internal விவரங்களை அனுமதிக்கப்பட்ட production குழுவுக்கு மட்டுமே பகிர்வேன்.',
        buyerConsent:'இந்த order-ன் buyer-safe production summary பகிர அனுமதி உள்ளது என்று உறுதிசெய்கிறேன்.',
        buyerReference:'Buyer authorization source reference (report-ல் சேராது)',
        selectReview:'சரியான review தேதி, audience மற்றும் பகிர்வு ஒப்புதலைத் தேர்ந்தெடுக்கவும்.',
        selectBuyer:'Buyer report-க்கு authorization source reference அவசியம்.',
        noAccess:'இந்த checkbox secure server authorization அல்ல.',
        source:'Source-ல் பதிவான production விவரங்கள்; தனியாக verify செய்யப்படவில்லை.',
        noRate:'Verified daily output / calendar இல்லை; finish date ஊகிக்கப்படவில்லை.',
        notActual:'Status, தேதி, ஆதாரம் இல்லாமல் actual காட்டமாட்டோம்.',
        noBalance:'ஆதாரத்துடன் matching-unit required/completed இருந்தால்தான் stage balance; order balance அல்ல.',
        noLotAggregation:'Operations மற்றும் shipment lots ஒன்றாகச் சேர்க்கப்படவில்லை.',
        noSource:'இந்த stage-க்கு source proof இல்லை.',unknown:'தகவல் தேவை',
        ref:'Source ref',stage:'Stage',milestone:'Milestone',status:'Source status',
        original:'Original finish',current:'Revised finish',forecast:'Recorded forecast finish',
        actual:'ஆதாரத்துடன் Actual finish',start:'ஆதாரத்துடன் Actual start',required:'Stage required',
        completed:'பதிவான Stage completed',remaining:'Stage balance',unit:'Unit',
        rate:'Review செய்த daily rate',days:'Rate-based working days',projected:'Calculated finish date',
        sourceForecast:'Source-entered forecast',operation:'Operation',lot:'Lot',
        qtyInput:'Input',qtyDone:'Completed',rejected:'Rejected',reworked:'Reworked',wip:'WIP',
        unaccounted:'Operation input balance',quantityState:'Operation source status',
        internalOnly:'Operation details buyer report-ல் சேராது.',
        buyerOnly:'Buyer-க்கு ஏற்ற source milestones மட்டும்.',
        invalidQty:'தவறான / mismatch quantity மறைக்கப்பட்டது',
        invalidDate:'தவறான அல்லது எதிர்கால actual தேதி மறைக்கப்பட்டது',
        missingProof:'சில actual / quantity-க்கு source proof இல்லை.',
        missingRate:'Verified daily rate எல்லா stage-க்கும் இல்லை.',
        unvalidated:'Source பதிவு மட்டும்; proof ID வெளியிடப்படாது.',
        rateCaution:'Rate மூலமான working days என்பது delivery date அல்ல.',
        statusNotStarted:'தொடங்கவில்லை',statusProgress:'நடந்து கொண்டிருக்கிறது',statusSubmitted:'சமர்ப்பித்தது',
        statusAwaiting:'Approval காத்திருக்கிறது',statusApproved:'Approved (source)',
        statusRejected:'Rejected',statusBlocked:'Blocked',
        statusCompleted:'Completed (source)',statusWaived:'Waived',statusNA:'பொருந்தாது'
      }
    });
    static STATUS=Object.freeze({
      'not-started':'statusNotStarted','in-progress':'statusProgress',
      'submitted':'statusSubmitted','awaiting-approval':'statusAwaiting',
      'approved':'statusApproved','rejected':'statusRejected','blocked':'statusBlocked',
      'completed':'statusCompleted','waived':'statusWaived','not-applicable':'statusNA'
    });
    static date(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
      const d=new Date(value+'T00:00:00Z');
      return Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==value?null:value;
    }
    static number(value){
      return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
    }
    static text(value){return typeof value==='string'?value.trim():''}
    static hasProof(task){return Array.isArray(task?.proofRefs)&&task.proofRefs.some(v=>this.text(v).length>0)}
    static eventDate(task,asOf){
      const status=this.text(task?.status);
      if(!['completed','approved'].includes(status)||!this.hasProof(task))return null;
      const date=this.date(task?.dates?.actualFinish)||this.date(task?.dates?.actualStart);
      return date&&date<=asOf?date:null;
    }
    static stageRows(plan,definition,asOf,language,mode,notes){
      const tasks=Array.isArray(plan?.tasks)?plan.tasks:[];
      const taskFor=ref=>tasks.find(x=>x?.templateRef===ref&&x.applicability!=='not-applicable')||null;
      const startTask=taskFor(definition.start),finishTask=taskFor(definition.end),outputTask=taskFor(definition.update);
      const label=this.WORDS[language],ix=['en','bn','hi','ta'].indexOf(language);
      const stageName=definition.titles[ix];
      const original=this.date(finishTask?.dates?.baselineFinish);
      const revised=this.date(finishTask?.dates?.currentTargetFinish);
      const forecast=this.date(finishTask?.dates?.forecastFinish);
      const start=this.eventDate(startTask,asOf);
      const actual=this.eventDate(finishTask,asOf);
      const dates=[startTask,finishTask].filter(Boolean);
      if(dates.some(t=>t.dates?.actualFinish&&!this.eventDate(t,asOf)))notes.invalidDate++;
      const proof=this.hasProof(outputTask);
      const required=this.number(outputTask?.quantity?.required);
      const completed=this.number(outputTask?.quantity?.completed);
      const unit=this.text(outputTask?.quantity?.unit);
      const orderUnit=this.text(plan?.order?.unit)||'pcs';
      const matching=unit===orderUnit;
      const coherent=required!==null&&completed!==null&&completed<=required&&matching;
      if(!coherent&&((outputTask?.quantity?.required??null)!==null||
        (outputTask?.quantity?.completed??null)!==null))notes.invalidQty++;
      if(coherent&&!proof)notes.missingProof++;
      const quantityReady=coherent&&proof;
      // Buyer disclosure cannot even reveal operation anomaly counts.
      const ops=mode==='internal'?(Array.isArray(plan?.operations)?plan.operations:[])
        .filter(op=>this.text(op?.type)===definition.kind):[];
      const details=[];
      for(const op of ops){
        const entered=[op.qtyInput,op.qtyCompleted,op.qtyRejected,op.qtyReworked,op.qtyWip]
          .some(v=>typeof v==='number'&&v!==0)||
          !!this.text(op.qtyEvidenceRef)||
          (Array.isArray(op.dailyActuals)&&op.dailyActuals.length>0);
        if(!entered)continue; // capacity-only placeholder zeros are NOT production evidence
        const checked=operations?.validateOperationQuantity?.(op)||{ok:false};
        const valid=checked.ok&&['qtyInput','qtyCompleted','qtyRejected','qtyReworked','qtyWip']
          .every(key=>this.number(op[key])!==null)&&
          (this.text(op.unit)||orderUnit)===orderUnit;
        if(!valid)notes.invalidQty++;
        if(mode==='internal')details.push({
          ref:this.text(op.operationId)||label.unknown,
          stage:stageName,lot:this.text(op.lotId)||null,
          input:valid?op.qtyInput:null,completed:valid?op.qtyCompleted:null,
          rejected:valid?op.qtyRejected:null,reworked:valid?op.qtyReworked:null,
          wip:valid?op.qtyWip:null,
          unaccounted:valid?checked.remainingQty:null,
          unit:valid?orderUnit:null,sourceState:valid?label.unvalidated:label.invalidQty
        });
      }
      let rate=null,days=null;
      // Existing accepted engine is used ONLY with explicit reviewed source
      // rate, a dated evidence ref and a single whole-order operation snapshot.
      if(mode==='internal'&&quantityReady&&ops.length===1&&
        required===this.number(plan?.order?.totalQty)&&!this.text(ops[0].lotId)){
        const op=ops[0];
        const date=this.date(op.rateAsOfDate);
        const value=this.number(op.verifiedDailyOutput);
        if(op.rateReviewed===true&&this.text(op.rateEvidenceRef)&&date&&date<=asOf&&
          value!==null&&value>0&&(this.text(op.unit)||orderUnit)===orderUnit){
          const result=operations?.verifiedRateDays?.({
            plannedQty:required,completedQty:completed,verifiedDailyOutput:value
          });
          if(result?.status==='calculated'){
            rate=result.verifiedDailyOutput;
            days=result.workingDays;
          }
        }
      }
      const progress={
        key:definition.key,title:stageName,ref:definition.end||label.unknown,
        startRef:definition.start,endRef:definition.end,outputRef:definition.update,
        statusId:this.text(finishTask?.status)||'not-started',
        status:label[this.STATUS[this.text(finishTask?.status)]]||label.unknown,
        actualStart:start,actualFinish:actual,original,revised,forecast,
        required:quantityReady?required:null,completed:quantityReady?completed:null,
        remaining:quantityReady?required-completed:null,
        unit:quantityReady?orderUnit:null,rate,days,
        projectedFinish:null, // no implicit working calendar/lot overlap/quality gate
        reported:!!(startTask||finishTask||outputTask),
        operations:mode==='internal'?details:[]};
      if(!quantityReady)notes.missingQuantity++;
      if(rate===null)notes.missingRate++;
      if(!start&&!actual&&!forecast)notes.missingStageSource++;
      return progress;
    }
    static project(plan,options={}){
      const lang=Object.hasOwn(this.WORDS,options.language)?options.language:'en';
      const labels=this.WORDS[lang],asOf=this.date(options.asOfDate);
      const mode=['internal','buyer'].includes(options.mode)?options.mode:null;
      const buyer=mode==='buyer';
      const consent=buyer?options.buyerShareConfirmed===true&&!!this.text(options.authorizationRef):
        mode==='internal'&&options.internalConfirmed===true;
      const empty={ready:false,labels,asOfDate:null,mode:null,stages:[],milestones:[],
        operations:[],counts:{stages:0,missingQuantity:0,missingRate:0},warnings:[labels.selectReview]};
      if(!asOf||!mode||!consent){
        if(buyer&&options.buyerShareConfirmed===true&&!this.text(options.authorizationRef))
          empty.warnings.push(labels.selectBuyer);
        return empty;
      }
      const notes={invalidQty:0,invalidDate:0,missingProof:0,
        missingRate:0,missingQuantity:0,missingStageSource:0};
      const result=this.STAGES.map(d=>this.stageRows(plan,d,asOf,lang,mode,notes));
      const milestones=result.flatMap(stage=>[
        {stage:stage.title,ref:stage.startRef,kind:'start',date:stage.actualStart},
        {stage:stage.title,ref:stage.endRef,kind:'finish',date:stage.actualFinish}
      ]);
      const operationRows=mode==='internal'?result.flatMap(stage=>stage.operations):[];
      const warnings=[labels.source,labels.notActual,labels.noBalance,
        labels.noLotAggregation,labels.noRate,labels.noAccess,
        buyer?labels.buyerOnly:labels.internalOnly];
      if(notes.invalidQty)warnings.push(labels.invalidQty+': '+notes.invalidQty);
      if(notes.invalidDate)warnings.push(labels.invalidDate+': '+notes.invalidDate);
      if(notes.missingProof)warnings.push(labels.missingProof+': '+notes.missingProof);
      if(notes.missingQuantity)warnings.push(labels.noSource+': '+notes.missingQuantity);
      if(notes.missingRate)warnings.push(labels.missingRate+': '+notes.missingRate);
      return {ready:true,mode,asOfDate:asOf,labels,stages:result,
        milestones,operations:operationRows,counts:{
          stages:result.length,missingQuantity:notes.missingQuantity,
          missingRate:notes.missingRate,invalidQty:notes.invalidQty
        },warnings,
        authorization:buyer?'operator-attested buyer scope':'operator-attested internal scope'};
    }
  }
  const api={STAGES:ProductionStatusReport.STAGES,WORDS:ProductionStatusReport.WORDS,
    project:(plan,options)=>ProductionStatusReport.project(plan,options)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaProductionStatusReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
