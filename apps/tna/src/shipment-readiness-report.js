(function(root){
  'use strict';
  /**
   * GMR-12 R09: a read-only, quality/shipping-only source projection.
   * Owns no domain state, shipment release, or PPM/AQL authority. The local
   * review checkbox is disclosure acknowledgement, not server authorization.
   */
  class ShipmentReadinessReport {
    static WORDS={
      en:{title:'Shipment Readiness',asOf:'Quality/shipping review date',
        consent:'I am authorized to review internal quality/shipping information and will restrict its circulation.',
        accessRef:'Quality/shipping authority source reference (not exported)',
        selectReview:'Select a valid quality/shipping date, confirm restricted use and enter an authority source reference.',
        lots:'Shipment lots',allocations:'PO allocations',milestones:'Quality and shipping milestones',
        links:'Linked PPM / AQL records',summary:'Source quantity reconciliation',
        ref:'Lot / activity',po:'PO',qty:'Quantity',planned:'Planned',packed:'Packed',
        passed:'Passed (source)',shipped:'Shipped (source)',unit:'Unit',state:'Source state',
        requested:'Requested ex-factory',current:'Revised ex-factory',forecast:'Forecast ex-factory',
        actual:'Reported actual ex-factory',etd:'Recorded ETD',eta:'Recorded ETA',
        booking:'Booking reference recorded',inspection:'Inspection reference recorded',
        status:'Task status',original:'Original',sourceActual:'Source task actual',
        app:'Source app',decision:'Recorded status',yes:'Yes (not verified)',no:'Not recorded',
        missing:'Needs Information',noLots:'No shipment lots recorded.',noLinks:'No PPM/AQL references recorded.',
        noTasks:'No applicable quality/shipping milestones recorded.',
        noSummary:'Invalid/missing quantities, units or PO allocations: whole-order totals withheld.',
        noClearance:'PPM GO, AQL CONFORMED, booking, packing and inspection dates do not independently authorize shipment.',
        noDispatch:'Ex-factory, shipped, ETD and ETA are source-entered, not carrier-confirmed movements.',
        noEvidence:'Source evidence identifiers, booking numbers, prices and private remarks are omitted.',
        noAccess:'Local consent is NOT secure role/tenant authorization.',
        sourceOnly:'Quantities and references are source-reported, not independently authenticated.',
        invalid:'Invalid or incomplete lot, date or evidence source records'},
      bn:{title:'শিপমেন্ট প্রস্তুতি',asOf:'কোয়ালিটি / শিপিং পর্যালোচনার তারিখ',
        consent:'আমি অভ্যন্তরীণ কোয়ালিটি/শিপিং তথ্য দেখার অনুমতিপ্রাপ্ত; অনুমতি ছাড়া শেয়ার করব না।',
        accessRef:'অনুমতির উৎস রেফারেন্স (রিপোর্টে থাকবে না)',
        selectReview:'সঠিক তারিখ, সীমিত ব্যবহারের সম্মতি ও অনুমতির রেফারেন্স দিন।',
        lots:'শিপমেন্ট লট',allocations:'PO বরাদ্দ',milestones:'কোয়ালিটি / শিপিং কাজ',
        links:'সংযুক্ত PPM / AQL',summary:'রেকর্ডকৃত পরিমাণ মিলিয়ে দেখা',
        ref:'লট / কাজ',po:'PO',qty:'পরিমাণ',planned:'পরিকল্পিত',packed:'প্যাক করা',
        passed:'পাস রেকর্ড',shipped:'শিপড রেকর্ড',unit:'একক',state:'রেকর্ড অবস্থা',
        requested:'চাওয়া এক্স-ফ্যাক্টরি',current:'সংশোধিত এক্স-ফ্যাক্টরি',forecast:'পূর্বাভাস এক্স-ফ্যাক্টরি',
        actual:'রেকর্ডের এক্স-ফ্যাক্টরি',etd:'রেকর্ড ETD',eta:'রেকর্ড ETA',
        booking:'বুকিং রেফারেন্স আছে',inspection:'পরিদর্শন রেফারেন্স আছে',
        status:'কাজের অবস্থা',original:'মূল',sourceActual:'প্রমাণসহ কাজের তারিখ',
        app:'উৎস অ্যাপ',decision:'রেকর্ড অবস্থা',yes:'আছে (যাচাই নয়)',no:'রেকর্ড নেই',
        missing:'তথ্য প্রয়োজন',noLots:'শিপমেন্ট লট নেই।',noLinks:'PPM/AQL রেফারেন্স নেই।',
        noTasks:'প্রাসঙ্গিক কাজ নেই।',noSummary:'পরিমাণ/একক/PO বরাদ্দ অসম্পূর্ণ; মোট দেখানো হয়নি।',
        noClearance:'PPM GO, AQL CONFORMED, বুকিং বা প্যাকিং শিপমেন্ট অনুমোদন নয়।',
        noDispatch:'শিপড, এক্স-ফ্যাক্টরি, ETD/ETA পরিবহন কর্তৃপক্ষ যাচাই করেনি।',
        noEvidence:'গোপন প্রমাণ, বুকিং নম্বর, মূল্য ও মন্তব্য বাদ দেওয়া হয়েছে।',
        noAccess:'স্থানীয় সম্মতি নিরাপদ সার্ভার অনুমতি নয়।',
        sourceOnly:'সব পরিমাণ উৎসে রেকর্ড, স্বাধীন যাচাই নয়।',
        invalid:'ভুল বা অসম্পূর্ণ লট/তারিখ/প্রমাণ'},
      hi:{title:'शिपमेंट तैयारी',asOf:'क्वालिटी / शिपिंग समीक्षा तारीख',
        consent:'मैं आंतरिक क्वालिटी/शिपिंग डेटा देखने को अधिकृत हूं और बिना अनुमति साझा नहीं करूंगा।',
        accessRef:'अधिकार स्रोत संदर्भ (रिपोर्ट में नहीं जाएगा)',
        selectReview:'सही तारीख, सीमित उपयोग की पुष्टि और अधिकार संदर्भ दर्ज करें।',
        lots:'शिपमेंट लॉट',allocations:'PO आवंटन',milestones:'क्वालिटी / शिपिंग कार्य',
        links:'लिंक PPM / AQL',summary:'दर्ज मात्रा मिलान',
        ref:'लॉट / कार्य',po:'PO',qty:'मात्रा',planned:'नियोजित',packed:'पैक',
        passed:'दर्ज पास',shipped:'दर्ज शिप्ड',unit:'इकाई',state:'दर्ज स्थिति',
        requested:'अनुरोधित एक्स-फैक्टरी',current:'संशोधित एक्स-फैक्टरी',forecast:'अनुमानित एक्स-फैक्टरी',
        actual:'दर्ज एक्स-फैक्टरी',etd:'दर्ज ETD',eta:'दर्ज ETA',
        booking:'बुकिंग संदर्भ दर्ज',inspection:'निरीक्षण संदर्भ दर्ज',
        status:'कार्य स्थिति',original:'मूल',sourceActual:'प्रमाणयुक्त कार्य तारीख',
        app:'स्रोत ऐप',decision:'दर्ज स्थिति',yes:'दर्ज (सत्यापित नहीं)',no:'दर्ज नहीं',
        missing:'जानकारी चाहिए',noLots:'शिपमेंट लॉट दर्ज नहीं।',noLinks:'PPM/AQL संदर्भ नहीं।',
        noTasks:'संबंधित कार्य नहीं।',noSummary:'मात्रा/इकाई/PO आवंटन अधूरा; कुल रोका गया।',
        noClearance:'PPM GO, AQL CONFORMED, बुकिंग या पैकिंग से शिपमेंट मंजूरी सिद्ध नहीं होती।',
        noDispatch:'शिप्ड, एक्स-फैक्टरी, ETD/ETA को वाहक ने सत्यापित नहीं किया।',
        noEvidence:'निजी साक्ष्य, बुकिंग नंबर, मूल्य और टिप्पणियां हटा दी गईं।',
        noAccess:'स्थानीय सहमति सुरक्षित सर्वर अनुमति नहीं है।',
        sourceOnly:'मात्रा स्रोत में दर्ज है, स्वतंत्र सत्यापन नहीं।',
        invalid:'अमान्य या अधूरा लॉट/तारीख/प्रमाण'},
      ta:{title:'Shipment தயார்நிலை',asOf:'Quality / shipping மதிப்பாய்வு தேதி',
        consent:'உள்ளக quality/shipping தகவலைப் பார்க்க அனுமதி உள்ளது; அனுமதியின்றி பகிரமாட்டேன்.',
        accessRef:'அனுமதி ஆதாரம் (ரிப்போர்ட்டில் சேராது)',
        selectReview:'சரியான தேதி, கட்டுப்படுத்தப்பட்ட பயன்பாட்டு ஒப்புதல், அனுமதி ஆதாரம் அளிக்கவும்.',
        lots:'Shipment lot-கள்',allocations:'PO ஒதுக்கீடு',milestones:'Quality / shipping செயல்கள்',
        links:'இணைக்கப்பட்ட PPM / AQL',summary:'மூல அளவு சரிபார்ப்பு',
        ref:'Lot / செயல்பாடு',po:'PO',qty:'அளவு',planned:'திட்டம்',packed:'Pack செய்தது',
        passed:'Pass பதிவு',shipped:'Shipped பதிவு',unit:'அலகு',state:'பதிவு நிலை',
        requested:'கோரிய ex-factory',current:'திருத்திய ex-factory',forecast:'கணிப்பு ex-factory',
        actual:'பதிவான ex-factory',etd:'பதிவான ETD',eta:'பதிவான ETA',
        booking:'Booking ஆதாரம் உள்ளது',inspection:'Inspection ஆதாரம் உள்ளது',
        status:'செயல் நிலை',original:'முதல் தேதி',sourceActual:'ஆதாரமுள்ள actual',
        app:'ஆதார ஆப்',decision:'பதிவான நிலை',yes:'உள்ளது (தனி உறுதி இல்லை)',no:'பதிவு இல்லை',
        missing:'தகவல் தேவை',noLots:'Shipment lot இல்லை.',noLinks:'PPM/AQL இணைப்பு இல்லை.',
        noTasks:'தொடர்புடைய செயல்பாடு இல்லை.',noSummary:'அளவு/அலகு/PO ஒதுக்கீடு முழுமையில்லை; மொத்தம் காட்டப்படாது.',
        noClearance:'PPM GO, AQL CONFORMED, booking, packing மட்டும் shipment அனுமதி அல்ல.',
        noDispatch:'Shipped, ex-factory, ETD/ETA transport மூலம் சரிபார்க்கப்படவில்லை.',
        noEvidence:'தனிப்பட்ட ஆதாரங்கள், booking எண்கள், விலை, remarks வெளியிடப்படவில்லை.',
        noAccess:'Browser ஒப்புதல் பாதுகாப்பான server permission அல்ல.',
        sourceOnly:'அளவுகள் மூலப்பதிவு மட்டுமே; நேரடி உறுதி அல்ல.',
        invalid:'தவறான/முழுமையற்ற lot, தேதி அல்லது ஆதாரம்'}
    };
    static REFS=Object.freeze({
      PP08:'PPM decision',Q06:'Final inspection booking',Q07:'Inspection performed',
      Q08:'Final inspection disposition',PK04:'Packing complete',
      PK05:'Packing list and barcode',S01:'Freight booking',
      S02:'Shipping documents review',S03:'Ex-factory preparation',
      S04:'Ex-factory handover',S05:'Customs/terminal',S06:'ETD update',
      S07:'ETA update',S08:'Document submission',S09:'Balance shipment follow-up'
    });
    static text(v){return typeof v==='string'?v.trim():''}
    static num(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null}
    static date(v){
      if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;
      const d=new Date(v+'T00:00:00Z');
      return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v?v:null;
    }
    static actual(v,asOf){const d=this.date(v);return d&&d<=asOf?d:null}
    static proof(v){return Array.isArray(v)&&v.some(x=>!!this.text(x))}
    static project(plan,opts={}){
      const lang=Object.hasOwn(this.WORDS,opts.language)?opts.language:'en';
      const labels=this.WORDS[lang],asOf=this.date(opts.asOfDate);
      const empty={ready:false,asOfDate:null,labels,lots:[],allocations:[],
        milestones:[],links:[],summary:null,warnings:[labels.selectReview]};
      if(!asOf||opts.qualityConfirmed!==true||!this.text(opts.authorityRef))return empty;
      const warnings=[labels.noClearance,labels.noDispatch,labels.noEvidence,
        labels.noAccess,labels.sourceOnly];
      const milestones=[],seen=new Set();
      for(const t of Array.isArray(plan?.tasks)?plan.tasks:[]){
        const ref=this.text(t?.templateRef);
        if(!Object.hasOwn(this.REFS,ref)||seen.has(ref)||t?.applicability==='not-applicable')continue;
        seen.add(ref);
        const dates=t.dates||{},proved=this.proof(t.proofRefs);
        const actual=this.actual(dates.actualFinish,asOf);
        if(dates.actualFinish&&!actual||actual&&(!proved||!['completed','approved'].includes(t.status)))warnings.push(labels.invalid+': '+ref);
        milestones.push({ref,title:this.REFS[ref],status:this.text(t.status)||'not-started',
          original:this.date(dates.baselineFinish),current:this.date(dates.currentTargetFinish),
          forecast:this.date(dates.forecastFinish),
          actual:proved&&['completed','approved'].includes(t.status)?actual:null,proofRecorded:proved});
      }
      const links=[],linked=Array.isArray(plan?.integrationReferences)?plan.integrationReferences:[];
      const statuses={ppm:['GO','CONDITIONAL GO','HOLD','UNSET'],
        aql:['CONFORMED','NOT CONFORMED','PENDING','UNRESOLVED']};
      for(const item of linked){
        const app=this.text(item?.sourceApp).toLowerCase();
        if(!Object.hasOwn(statuses,app))continue;
        const reported=this.text(item.recordedStatus).toUpperCase();
        links.push({app:app.toUpperCase(),recordedStatus:statuses[app].includes(reported)?reported:'UNRESOLVED'});
      }
      const lots=[],allocations=[],ids=new Set(),unit=this.text(plan?.order?.unit)||'pcs';
      let valid=true;
      for(const source of Array.isArray(plan?.shipmentLots)?plan.shipmentLots:[]){
        const ref=this.text(source?.lotReference||source?.lotId),id=ref.toLowerCase();
        const p=this.num(source?.plannedQty),pk=this.num(source?.packedQty);
        const ps=this.num(source?.passedQty),sh=this.num(source?.shippedQty);
        const quantitiesOk=p!==null&&pk!==null&&ps!==null&&sh!==null&&pk<=p&&ps<=pk&&sh<=ps;
        const localUnit=this.text(source?.unit)||unit;
        const items=Array.isArray(source?.poAllocation)?source.poAllocation:[];
        let allocated=0,allocationsOk=items.length>0;
        const pos=new Set();
        for(const item of items){
          const po=this.text(item?.poNumber),qty=this.num(item?.qty);
          if(!po||qty===null||pos.has(po.toLowerCase()))allocationsOk=false;
          if(po)pos.add(po.toLowerCase());
          if(qty!==null)allocated+=qty;
          allocations.push({lot:ref||null,po:po||null,qty});
        }
        if(!quantitiesOk||!allocationsOk||allocated!==p||!ref||ids.has(id)||localUnit!==unit){
          valid=false;warnings.push(labels.invalid+': '+(ref||labels.missing));
        }
        ids.add(id);
        const sourceDates={};
        for(const key of ['requestedExFactory','currentExFactory','forecastExFactory','actualExFactory','ETD','ETA']){
          sourceDates[key]=key==='actualExFactory'?this.actual(source[key],asOf):this.date(source[key]);
          if(this.text(source[key])&&!sourceDates[key])warnings.push(labels.invalid+': '+(ref||labels.missing)+' '+key);
        }
        const actual=sh!==null&&sh>0?sourceDates.actualExFactory:null;
        lots.push({ref:ref||null,unit:localUnit,planned:p,packed:pk,passed:ps,shipped:sh,
          requested:sourceDates.requestedExFactory,current:sourceDates.currentExFactory,
          forecast:sourceDates.forecastExFactory,actual,etd:sourceDates.ETD,eta:sourceDates.ETA,
          bookingRecorded:!!this.text(source?.bookingRef),
          inspectionRecorded:!!this.text(source?.inspectionRef),
          state:'Source-reported only'});
      }
      let summary=null;
      const orderQty=this.num(plan?.order?.totalQty);
      if(valid&&lots.length&&orderQty!==null&&orderQty>0){
        const totals=lots.reduce((sum,x)=>{
          for(const key of ['planned','packed','passed','shipped'])sum[key]+=x[key];
          return sum;
        },{planned:0,packed:0,passed:0,shipped:0});
        if(totals.planned<=orderQty&&totals.shipped<=orderQty)
          summary={ordered:orderQty,unit,...totals,unplanned:orderQty-totals.planned,
            unshipped:orderQty-totals.shipped,sourceOnly:true};
      }
      if(!summary)warnings.push(labels.noSummary);
      if(!lots.length)warnings.push(labels.noLots);
      return {ready:true,labels,asOfDate:asOf,lots,allocations,milestones,links,summary,
        warnings,disclosure:'Quality/shipping source review only; no verified release'};
    }
  }
  const api={WORDS:ShipmentReadinessReport.WORDS,REFS:ShipmentReadinessReport.REFS,
    project:(plan,opts)=>ShipmentReadinessReport.project(plan,opts)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaShipmentReadinessReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
