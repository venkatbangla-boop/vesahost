(function(root){
  'use strict';

  /**
   * GMR-11 R08 commercial/sourcing source-only report boundary.
   *
   * Owns no application state; reads the existing OrderPlan as an immutable
   * snapshot. "Recorded" never means bank-authenticated, QC passed, supplier
   * certified, or buyer-approved. A local commercial consent checkbox and
   * access reference are disclosure checks, NOT secure tenant authorization.
   * No source evidence identifiers, prices, comments or proof text are emitted.
   */
  class MaterialLcReport {
    static WORDS=Object.freeze({
      en:{
        asOf:'Commercial review as-of', consent:'I am authorized to review confidential commercial/sourcing material and LC information for this order. I will restrict circulation.',
        accessRef:'Commercial authority reference (checked locally, never exported)',
        selectReview:'Select a valid review date, confirm commercial-only use and enter an authority source reference.',
        title:'Material & LC',master:'Master LC',masterStatus:'Recorded Master LC status',
        masterDate:'Source-reported opened date',masterEvidence:'Master LC document reference recorded',
        masterWarning:'Master LC status/date/reference are user-reported. No bank authentication or available credit is verified.',
        masterUnknown:'Master LC date/status/evidence incomplete, disputed, future or not recorded.',
        masterCancelled:'Master LC cancelled or not applicable: historical opening must not imply active cover.',
        masterNotRequired:'Recorded not applicable; not independently verified.',
        b2b:'Supplier B2B LC',application:'B2B LC application date',opened:'B2B LC source opening date',
        b2bState:'B2B LC reported stage', b2bNone:'No source B2B LC milestone',
        applied:'Application recorded; OPENING NOT VERIFIED', openedReported:'Source opening recorded; bank verification NOT ESTABLISHED',
        notApplicable:'Source payment method does not call for B2B LC',b2bMissing:'B2B LC applicability or opening needs review',
        invalidLc:'Inconsistent, invalid or future LC dates/terms; do not infer an opened LC.',
        materials:'Materials / supplier sources',supplier:'Supplier',country:'Country',
        category:'Material category',ref:'Reference',payment:'Source payment method',
        masterRef:'Source Master LC association',required:'Source required quantity',
        unit:'Source unit',shortage:'Source-recorded shortage',booking:'Booking date',
        inHouse:'In-house date',qc:'QC date (outcome unknown)',
        materialState:'Material/source state',evidence:'Source references recorded',
        notReady:'Not independently verified as available / QC-passed for production.',
        noAutomatic:'No shortage was computed, no material release was inferred, and no supplier cost/LC amount is fabricated.',
        mismatch:'Unmatched units, missing evidence and unsupported source values remain Needs Information.',
        noData:'No material source records entered.',invalidQty:'Invalid or missing source quantities',
        invalidDate:'Invalid/future actual source dates withheld',
        noEvidence:'Source evidence missing; dates are not independently verified.',
        qcUnknown:'QC date recorded, pass/fail decision NOT verified',
        qcPending:'QC result not recorded',
        shortagePositive:'Shortage recorded; material must be reviewed',
        shortageZero:'Zero shortage source-recorded, not independently verified',
        shortageMissing:'Shortage not recorded',
        inHouseOnly:'In-house arrival reported, not a QC pass',
        source:'Source record (NOT independently authenticated)',
        taskHeading:'Fabric and trims milestones',
        task:'Activity',status:'Source task status',original:'Original finish',current:'Revised finish',
        forecast:'Recorded forecast finish',actual:'Evidenced actual finish',
        noTasks:'No applicable sourcing milestone source.',noActual:'An actual task date needs completed/approved status, source evidence and a valid date not after review.',
        noAccess:'This local confirmation is not secure role/tenant authorization. Share only through authorized channels.',
        notes:'Free-text factory remarks, LC document numbers, proof IDs, prices and internal commercial terms are omitted.',
        missing:'Needs Information'
      },
      bn:{
        asOf:'বাণিজ্যিক পর্যালোচনার তারিখ',consent:'আমি এই অর্ডারের গোপন সোর্সিং/LC তথ্য দেখার অনুমতিপ্রাপ্ত; অনুমতি ছাড়া শেয়ার করব না।',
        accessRef:'বাণিজ্যিক অনুমতির উৎস রেফারেন্স (রিপোর্টে থাকবে না)',
        selectReview:'সঠিক তারিখ, বাণিজ্যিক ব্যবহারের সম্মতি ও অনুমতির রেফারেন্স দিন।',
        title:'ম্যাটেরিয়াল ও LC',master:'মাস্টার LC',masterStatus:'রেকর্ডকৃত মাস্টার LC অবস্থা',
        masterDate:'উৎসে লেখা খোলার তারিখ',masterEvidence:'মাস্টার LC নথির রেফারেন্স আছে',
        masterWarning:'মাস্টার LC তথ্য ব্যবহারকারী লিখেছেন; ব্যাংক যাচাই বা ক্রেডিট নিশ্চিত নয়।',
        masterUnknown:'মাস্টার LC তারিখ/অবস্থা/প্রমাণ অসম্পূর্ণ বা যাচাই প্রয়োজন।',
        masterCancelled:'LC বাতিল/প্রযোজ্য নয়; আগের তারিখ মানে সক্রিয় LC নয়।',
        masterNotRequired:'প্রযোজ্য নয় বলে রেকর্ড, স্বাধীন যাচাই নেই।',
        b2b:'সাপ্লায়ার B2B LC',application:'B2B LC আবেদনের তারিখ',opened:'উৎসে LC খোলার তারিখ',
        b2bState:'B2B LC-এর রেকর্ডকৃত ধাপ',b2bNone:'B2B LC-এর তথ্য নেই',
        applied:'আবেদন রেকর্ড, খোলা যাচাই হয়নি',openedReported:'খোলা বলে রেকর্ড, ব্যাংক যাচাই হয়নি',
        notApplicable:'সোর্স পেমেন্ট পদ্ধতিতে B2B LC নেই',b2bMissing:'B2B LC-এর তথ্য/প্রযোজ্যতা যাচাই প্রয়োজন',
        invalidLc:'ভুল বা ভবিষ্যৎ LC তারিখ; খোলা হয়েছে ধরে নেবেন না।',
        materials:'ম্যাটেরিয়াল / সাপ্লায়ার',supplier:'সাপ্লায়ার',country:'দেশ',
        category:'ধরন',ref:'রেফারেন্স',payment:'পেমেন্ট পদ্ধতি',masterRef:'সম্পর্কিত মাস্টার LC',
        required:'রেকর্ডের প্রয়োজনীয় পরিমাণ',unit:'একক',shortage:'রেকর্ডকৃত ঘাটতি',
        booking:'বুকিং তারিখ',inHouse:'ইন-হাউস তারিখ',qc:'QC তারিখ (ফল অজানা)',
        materialState:'ম্যাটেরিয়াল অবস্থা',evidence:'উৎস রেফারেন্স আছে',
        notReady:'উৎপাদনের জন্য উপলব্ধ/QC পাস স্বাধীন যাচাই হয়নি।',
        noAutomatic:'ঘাটতি হিসাব, উৎপাদন ছাড় বা LC/দাম বানানো হয়নি।',
        mismatch:'অসম ইউনিট বা অজানা তথ্য Needs Information থাকবে।',noData:'ম্যাটেরিয়াল রেকর্ড নেই।',
        invalidQty:'ভুল/অসম্পূর্ণ পরিমাণ',invalidDate:'ভুল/ভবিষ্যৎ actual তারিখ লুকানো',
        noEvidence:'উৎস নথির প্রমাণ নেই; স্বাধীন যাচাই হয়নি।',
        qcUnknown:'QC তারিখ আছে; ফল নিশ্চিত নয়',qcPending:'QC ফল রেকর্ড নেই',
        shortagePositive:'ঘাটতি রেকর্ড, পর্যালোচনা দরকার',
        shortageZero:'শূন্য ঘাটতি রেকর্ড, যাচাই হয়নি',shortageMissing:'ঘাটতি রেকর্ড নেই',
        inHouseOnly:'ইন-হাউস রেকর্ড, QC পাস নয়',source:'উৎস রেকর্ড (স্বাধীন যাচাই নয়)',
        taskHeading:'ফ্যাব্রিক ও ট্রিমস মাইলস্টোন',task:'কাজ',status:'রেকর্ডের অবস্থা',
        original:'মূল শেষ',current:'সংশোধিত শেষ',forecast:'পূর্বাভাস',
        actual:'প্রমাণসহ actual',noTasks:'প্রযোজ্য সোর্সিং ধাপ নেই।',
        noActual:'Actual-এর জন্য সম্পন্ন অবস্থা, উৎস প্রমাণ ও সঠিক তারিখ লাগবে।',
        noAccess:'লোকাল সম্মতি সার্ভার-নিরাপত্তা নয়; অনুমোদিত চ্যানেলে শেয়ার করুন।',
        notes:'ফ্যাক্টরির মন্তব্য, LC নম্বর, প্রমাণের ID ও দাম নেই।',missing:'তথ্য প্রয়োজন'
      },
      hi:{
        asOf:'व्यावसायिक समीक्षा तारीख',consent:'मैं इस ऑर्डर की गोपनीय sourcing/LC जानकारी देखने के लिए अधिकृत हूँ और साझा सीमित रखूँगा।',
        accessRef:'व्यावसायिक अनुमति स्रोत रेफरेंस (रिपोर्ट में नहीं आएगा)',
        selectReview:'सही तारीख, व्यावसायिक पुष्टि और अनुमति रेफरेंस दर्ज करें।',
        title:'मटेरियल और LC',master:'मास्टर LC',masterStatus:'दर्ज मास्टर LC स्थिति',
        masterDate:'स्रोत में दर्ज खुलने की तारीख',masterEvidence:'मास्टर LC दस्तावेज रेफरेंस दर्ज',
        masterWarning:'मास्टर LC डेटा स्रोत में दर्ज है; बैंक सत्यापन/क्रेडिट साबित नहीं।',
        masterUnknown:'मास्टर LC तारीख/स्थिति/स्रोत अधूरा या जाँच योग्य है।',
        masterCancelled:'LC रद्द/लागू नहीं; पुरानी तारीख सक्रिय LC नहीं।',
        masterNotRequired:'लागू नहीं दर्ज है, स्वतंत्र सत्यापन नहीं।',
        b2b:'सप्लायर B2B LC',application:'B2B LC आवेदन तारीख',opened:'स्रोत में खुलने की तारीख',
        b2bState:'B2B LC दर्ज चरण',b2bNone:'B2B LC स्रोत नहीं',
        applied:'आवेदन दर्ज; खुलना सत्यापित नहीं',openedReported:'खुलना स्रोत में दर्ज; बैंक सत्यापन नहीं',
        notApplicable:'स्रोत भुगतान में B2B LC नहीं',b2bMissing:'B2B LC की आवश्यकता/खुलना जाँचें',
        invalidLc:'गलत या भविष्य की LC तारीख; खुला न मानें।',
        materials:'मटेरियल / सप्लायर',supplier:'सप्लायर',country:'देश',
        category:'प्रकार',ref:'रेफरेंस',payment:'दर्ज भुगतान तरीका',
        masterRef:'मास्टर LC संबंध',required:'दर्ज जरूरत मात्रा',unit:'इकाई',
        shortage:'दर्ज कमी',booking:'बुकिंग तारीख',inHouse:'इन-हाउस तारीख',
        qc:'QC तारीख (नतीजा अज्ञात)',materialState:'मटेरियल स्थिति',
        evidence:'स्रोत रेफरेंस दर्ज',notReady:'उत्पादन के लिए उपलब्ध/QC पास सत्यापित नहीं।',
        noAutomatic:'कोई कमी, रिलीज, LC मूल्य या कीमत अनुमान नहीं की गई।',
        mismatch:'अज्ञात यूनिट/तथ्य Needs Information रहेंगे।',noData:'मटेरियल रिकॉर्ड नहीं।',
        invalidQty:'गलत/अधूरी मात्रा',invalidDate:'गलत/भविष्य actual तारीख हटाई',
        noEvidence:'स्रोत प्रमाण नहीं; स्वतंत्र सत्यापन नहीं।',
        qcUnknown:'QC तारीख दर्ज; पास/फेल अज्ञात',qcPending:'QC नतीजा नहीं',
        shortagePositive:'कमी दर्ज; समीक्षा जरूरी',shortageZero:'शून्य कमी दर्ज, सत्यापन नहीं',
        shortageMissing:'कमी दर्ज नहीं',inHouseOnly:'इन-हाउस दर्ज, QC पास नहीं',
        source:'स्रोत रिकॉर्ड (स्वतंत्र सत्यापन नहीं)',taskHeading:'फैब्रिक/ट्रिम्स माइलस्टोन',
        task:'काम',status:'स्रोत स्थिति',original:'मूल खत्म',current:'संशोधित खत्म',
        forecast:'दर्ज पूर्वानुमान',actual:'प्रमाणित actual',
        noTasks:'स्रोत काम नहीं मिला।',noActual:'Actual के लिए पूरा स्टेटस, प्रमाण और वैध तारीख चाहिए।',
        noAccess:'लोकल पुष्टि सुरक्षित सर्वर अनुमति नहीं है; अधिकृत जगह साझा करें।',
        notes:'फैक्ट्री कमेंट, LC नंबर, प्रमाण ID, कीमत नहीं दिखेगी।',missing:'जानकारी चाहिए'
      },
      ta:{
        asOf:'Commercial review தேதி',consent:'இந்த order-ன் confidential sourcing/LC தகவலைப் பார்க்க அதிகாரம் உள்ளது; அங்கீகாரமின்றிப் பகிரமாட்டேன்.',
        accessRef:'Commercial authorization source reference (report-ல் சேராது)',
        selectReview:'Review தேதி, commercial consent மற்றும் authority reference தரவும்.',
        title:'Material & LC',master:'Master LC',masterStatus:'பதிவான Master LC நிலை',
        masterDate:'Source-ல் பதிவான opened தேதி',masterEvidence:'Master LC document reference உள்ளது',
        masterWarning:'Master LC தகவல் source பதிவு மட்டும்; bank authentication/credit verify செய்யப்படவில்லை.',
        masterUnknown:'Master LC status/date/evidence முழுமையாக இல்லை அல்லது சரிபார்க்க வேண்டும்.',
        masterCancelled:'Master LC cancel/not applicable; பழைய தேதி active LC என்பதல்ல.',
        masterNotRequired:'Not applicable என்று பதிவு; தனியாக verify செய்யவில்லை.',
        b2b:'Supplier B2B LC',application:'B2B LC application தேதி',opened:'Source-ல் B2B LC opened தேதி',
        b2bState:'பதிவான B2B LC நிலை',b2bNone:'B2B LC source பதிவு இல்லை',
        applied:'Application பதிவு; LC opened உறுதி இல்லை',
        openedReported:'LC opened source பதிவு; bank verification இல்லை',
        notApplicable:'Source payment method B2B LC அல்ல',
        b2bMissing:'B2B LC தேவையா/opened ஆகிறதா சரிபார்க்க வேண்டும்',
        invalidLc:'தவறான/எதிர்கால LC தேதி; opened என்று எடுத்துக்கொள்ள முடியாது.',
        materials:'Materials / Suppliers',supplier:'Supplier',country:'Country',
        category:'Material வகை',ref:'Reference',payment:'Payment method',
        masterRef:'Source Master LC தொடர்பு',required:'பதிவான தேவை அளவு',
        unit:'Unit',shortage:'Source shortage பதிவு',booking:'Booking தேதி',
        inHouse:'In-house தேதி',qc:'QC தேதி (result தெரியவில்லை)',
        materialState:'Material source நிலை',evidence:'Source references உள்ளன',
        notReady:'Production-க்கு material available/QC pass verify ஆகவில்லை.',
        noAutomatic:'Shortage கணக்கிடவோ material release/LC amount/price ஊகிக்கவோ இல்லை.',
        mismatch:'Unit/source தகவல் இல்லாவிட்டால் Needs Information.',
        noData:'Material source பதிவு இல்லை.',invalidQty:'தவறான/காணாத quantity',
        invalidDate:'தவறான/எதிர்கால actual தேதிகள் மறைக்கப்பட்டன.',
        noEvidence:'Source evidence இல்லை; தனியாக verify செய்யவில்லை.',
        qcUnknown:'QC தேதி பதிவு, pass/fail உறுதி இல்லை',qcPending:'QC result பதிவு இல்லை',
        shortagePositive:'Shortage பதிவு; review அவசியம்',
        shortageZero:'Zero shortage source பதிவு; verify இல்லை',
        shortageMissing:'Shortage பதிவு இல்லை',
        inHouseOnly:'In-house பதிவு, QC pass அல்ல',
        source:'Source பதிவு (தனியாக verify இல்லை)',
        taskHeading:'Fabric/Trims milestones',task:'Activity',status:'Source task status',
        original:'Original finish',current:'Revised finish',forecast:'Recorded forecast',
        actual:'ஆதாரத்துடன் actual finish',noTasks:'Sourcing milestones இல்லை',
        noActual:'Actual-க்கு completed/approved status, evidence, சரியான தேதி தேவை.',
        noAccess:'Local checkbox என்பது secure role authorization அல்ல; அனுமதித்த வழியில் மட்டும் பகிரவும்.',
        notes:'Factory remarks, LC numbers, proof IDs, prices காட்டப்படவில்லை.',
        missing:'Needs Information'
      }
    });
    static MILESTONES=Object.freeze({
      FP02:['Fabric supplier booking','ফ্যাব্রিক বুকিং','फैब्रिक बुकिंग','Fabric booking'],
      FP04:['Fabric B2B LC task','ফ্যাব্রিক B2B LC কাজ','फैब्रिक B2B LC काम','Fabric B2B LC task'],
      FP06:['Knitting/weaving start','নিটিং/বয়ন শুরু','निटिंग/बुनाई शुरू','Knitting/weaving start'],
      FP07:['Knitting/weaving finish','নিটিং/বয়ন শেষ','निटिंग/बुनाई पूर्ण','Knitting/weaving finish'],
      FP10:['Fabric dyeing/printing finish','ডাইং/প্রিন্ট শেষ','डाईंग/प्रिंट पूरा','Dyeing/printing finish'],
      FP12:['Fabric supplier QC task','ফ্যাব্রিক সরবরাহ QC কাজ','फैब्रिक सप्लायर QC','Fabric supplier QC'],
      FP15:['Fabric in-house','ফ্যাব্রিক ইন-হাউস','फैब्रिक इन-हाउस','Fabric in-house'],
      FP16:['Fabric incoming QC task','ফ্যাব্রিক ইনকামিং QC','फैब्रिक इनकमिंग QC','Fabric incoming QC'],
      FP17:['Fabric available for cutting gate','কাটিংয়ের ফ্যাব্রিক গেট','कटिंग हेतु फैब्रिक गेट','Cutting fabric gate'],
      TR05:['Trims supplier booking','ট্রিমস বুকিং','ट्रिम्स बुकिंग','Trims booking'],
      TR07:['Trims B2B LC task','ট্রিমস B2B LC কাজ','ट्रिम्स B2B LC काम','Trims B2B LC task'],
      TR08:['Trims production start','ট্রিমস উৎপাদন শুরু','ट्रिम्स उत्पादन शुरू','Trims production start'],
      TR09:['Trims production finish','ট্রিমস উৎপাদন শেষ','ट्रिम्स उत्पादन पूरा','Trims production finish'],
      TR10:['Trims supplier QC task','ট্রিমস QC কাজ','ट्रिम्स QC काम','Trims supplier QC'],
      TR12:['Trims in-house','ট্রিমস ইন-হাউস','ट्रिम्स इन-हाउस','Trims in-house'],
      TR13:['Trims QC/release gate','ট্রিমস QC/রিলিজ গেট','ट्रिम्स QC/रिलीज गेट','Trims QC/release gate']
    });
    static MASTER=new Set(['unknown','not-applicable','pending','opened','amended','cancelled']);
    static date(value){
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
      const d=new Date(value+'T00:00:00Z');
      return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value?value:null;
    }
    static text(value){return typeof value==='string'?value.trim():''}
    static nonnegative(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null}
    static actual(value,asOf){const d=this.date(value);return d&&d<=asOf?d:null}
    static anyEvidence(entry){
      return Array.isArray(entry?.evidenceRefs)&&entry.evidenceRefs.some(ref=>!!this.text(ref));
    }
    static taskRows(plan,asOf,lang,notes){
      const index=['en','bn','hi','ta'].indexOf(lang),rows=[],allowed=this.MILESTONES;
      const matched=new Set();
      for(const task of Array.isArray(plan?.tasks)?plan.tasks:[]){
        const ref=this.text(task?.templateRef);
        if(!Object.hasOwn(allowed,ref)||task?.applicability==='not-applicable'||matched.has(ref))continue;
        matched.add(ref);
        const dates=task.dates||{},sourceStatus=this.text(task.status)||'not-started';
        const actual=this.actual(dates.actualFinish,asOf);
        const accepted=['completed','approved'].includes(sourceStatus)&&Array.isArray(task.proofRefs)&&
          task.proofRefs.some(value=>this.text(value))&&actual;
        if(dates.actualFinish&&!accepted)notes.taskActuals++;
        rows.push({ref,title:allowed[ref][index],status:sourceStatus,
          original:this.date(dates.baselineFinish),
          current:this.date(dates.currentTargetFinish),
          forecast:this.date(dates.forecastFinish),
          actual:accepted?actual:null});
      }
      return rows.sort((a,b)=>a.ref.localeCompare(b.ref));
    }
    static project(plan,options={}){
      const lang=Object.hasOwn(this.WORDS,options.language)?options.language:'en';
      const labels=this.WORDS[lang],asOf=this.date(options.asOfDate);
      const consent=options.commercialConfirmed===true&&!!this.text(options.authorityRef);
      const empty={ready:false,asOfDate:null,labels,master:null,materials:[],milestones:[],
        counts:{materials:0,shortages:0,missingQc:0},warnings:[labels.selectReview]};
      if(!asOf||!consent)return empty;
      const notes={invalidDates:0,invalidQty:0,taskActuals:0,lcRisk:0};
      const masterSource=plan?.commitments||{};
      const status=this.text(masterSource.masterLcStatus)||'unknown';
      const declaredStatus=this.MASTER.has(status)?status:'unknown';
      const documentedOpening=this.actual(masterSource.masterLcOpenedOn,asOf);
      const hasMasterRef=!!this.text(masterSource.masterLcProofRef);
      const statusNeedsOpen=['opened','amended'].includes(declaredStatus);
      const documented=statusNeedsOpen&&!!documentedOpening&&hasMasterRef;
      const contradictory=(!this.MASTER.has(status))||
        (statusNeedsOpen&&!documented)||
        (declaredStatus==='not-applicable'&&!!this.text(masterSource.masterLcOpenedOn));
      if(this.text(masterSource.masterLcOpenedOn)&&!documentedOpening)notes.invalidDates++;
      if(contradictory)notes.lcRisk++;
      const master={
        status:declaredStatus,
        openedOn:documentedOpening||null,
        evidenceRecorded:hasMasterRef,
        sourceDocumented:documented,
        state:contradictory?labels.masterUnknown:
          declaredStatus==='cancelled'?labels.masterCancelled:
          declaredStatus==='not-applicable'?labels.masterNotRequired:
          statusNeedsOpen?labels.source:labels.masterUnknown
      };
      const materials=[],refs=new Set();
      for(const m of Array.isArray(plan?.materials)?plan.materials:[]){
        if(!m||typeof m!=='object')continue;
        const ref=this.text(m.materialId)||labels.missing;
        const id=ref.toLowerCase();
        if(refs.has(id)){notes.invalidQty++;continue;}
        refs.add(id);
        const rawDates=['bookingDate','b2bLcApplicationDate','b2bLcOpenDate','inHouseDate','QCDate'];
        const dates={};
        for(const key of rawDates){
          dates[key]=this.actual(m[key],asOf);
          if(this.text(m[key])&&!dates[key])notes.invalidDates++;
        }
        const quantity=this.nonnegative(m.requiredQty),shortage=this.nonnegative(m.shortageQty);
        if(m.requiredQty!=null&&quantity===null||m.shortageQty!=null&&shortage===null)notes.invalidQty++;
        const evidence=this.anyEvidence(m);
        const method=this.text(m.paymentMethod).toLowerCase();
        const needsB2b=['b2b-lc','b2b lc','back-to-back lc','back to back lc'].includes(method);
        const b2bContradiction=!!(dates.b2bLcOpenDate&&method&&!needsB2b);
        if(b2bContradiction)notes.lcRisk++;
        const b2bState=b2bContradiction?labels.invalidLc:
          dates.b2bLcOpenDate?labels.openedReported:
          dates.b2bLcApplicationDate?labels.applied:
          method&&!needsB2b?labels.notApplicable:
          needsB2b?labels.b2bMissing:labels.b2bNone;
        const qcState=dates.QCDate?labels.qcUnknown:labels.qcPending;
        const shortageState=shortage===null?labels.shortageMissing:
          shortage>0?labels.shortagePositive:labels.shortageZero;
        // Read materialReadiness() as an engine reference, NOT proof of QC pass;
        // its legacy date-based "ready" status is intentionally not promoted.
        materials.push({
          ref,category:this.text(m.category)||labels.missing,
          supplier:this.text(m.supplier)||labels.missing,
          country:this.text(m.country)||labels.missing,
          payment:this.text(m.paymentMethod)||labels.missing,
          masterLcAssociated:!!this.text(m.masterLcRef),
          requiredQty:quantity,unit:this.text(m.unit)||null,
          shortageQty:shortage,booking:dates.bookingDate,
          application:dates.b2bLcApplicationDate,
          b2bOpened:dates.b2bLcOpenDate,
          b2bState,sourceEvidenceRecorded:evidence,
          inHouse:dates.inHouseDate,qcDate:dates.QCDate,qcState,
          shortageState,readiness:labels.notReady
        });
      }
      materials.sort((a,b)=>a.category.localeCompare(b.category)||a.ref.localeCompare(b.ref));
      const milestones=this.taskRows(plan,asOf,lang,notes);
      const warnings=[labels.masterWarning,labels.notReady,labels.noAutomatic,
        labels.mismatch,labels.noActual,labels.noAccess,labels.notes];
      if(notes.invalidDates)warnings.push(labels.invalidDate+': '+notes.invalidDates);
      if(notes.invalidQty)warnings.push(labels.invalidQty+': '+notes.invalidQty);
      if(notes.lcRisk)warnings.push(labels.invalidLc+': '+notes.lcRisk);
      if(notes.taskActuals)warnings.push(labels.noActual+': '+notes.taskActuals);
      if(!materials.length)warnings.push(labels.noData);
      if(materials.some(m=>!m.sourceEvidenceRecorded))warnings.push(labels.noEvidence);
      return {ready:true,asOfDate:asOf,labels,master,materials,milestones,warnings,
        counts:{materials:materials.length,shortages:materials.filter(m=>m.shortageQty!==null&&m.shortageQty>0).length,
          missingQc:materials.filter(m=>!m.qcDate).length},
        disclosure:'operator-attested commercial/source-only, NOT authenticated banking or QC acceptance'};
    }
  }
  const api={WORDS:MaterialLcReport.WORDS,MILESTONES:MaterialLcReport.MILESTONES,
    project:(plan,options)=>MaterialLcReport.project(plan,options)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaMaterialLcReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
