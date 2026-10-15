(function(root){
 'use strict';
 /**
  * GMR-13 R10: management/agent portfolio projection of explicitly selected,
  * browser-local saved OrderPlans. Read-only; no schedule, source status,
  * shipment, approval or storage mutation. Authority input is a local
  * disclosure acknowledgment, NOT backend authorization.
  */
 class PortfolioReport {
  static EN=Object.freeze({
   title:'Portfolio / Multi-PO',asOf:'Management review date',
   consent:'I am authorized to review these selected internal buyer/factory orders and will restrict circulation.',
   authority:'Management authorization source reference (never exported)',
   select:'Choose saved orders, valid review date, management-use confirmation and authority reference.',
   choose:'Choose saved orders for this report',empty:'No saved production orders available.',
   noSelection:'Select at least one SAVED order; none is selected automatically.',
   cannotRead:'Selected saved orders could not be validated. Review the saved copies first.',
   onlyOne:'Only one order selected: this is not a multiple-order comparison.',
   orders:'Selected order records',groups:'Buyer / factory counts',actions:'Priority follow-ups (source only)',
   record:'Record ID',buyer:'Buyer',factory:'Factory',style:'Styles',po:'PO references',
   qty:'Entire order qty',unit:'Unit',status:'Recorded status',revision:'Revision',
   due:'Buyer-required ex-factory',forecast:'S04 forecast (recorded)',actual:'S04 actual (evidenced source)',
   blocked:'Blocked/rejected tasks',waiting:'Awaiting approval tasks',state:'Source review state',
   activity:'Standard activity',ref:'Activity ref',target:'Source target date',window:'Review window',
   type:'Group type',groupName:'Group',count:'Record count',missing:'Needs Information',
   overdue:'Past due in source',today:'Due as of review',soon:'Next 7 calendar days',
   later:'Later',undated:'Date missing',blockedWindow:'Blocked in source',
   pastDue:'Required date passed; release NOT verified',sourceOnly:'Source status, NOT independently confirmed',
   noActions:'No applicable open standard activities recorded.',noDates:'Missing/invalid source dates were not invented.',
   noQty:'Multiple PO references do NOT imply per-PO allocations or duplicated quantities.',
   noCpm:'Priority follows source task status and dated targets; NOT calculated cross-order critical path, capacity or agreed recovery.',
   noShip:'Forecast, S04 actual and order status do NOT establish physical shipment, buyer approval or inspection pass.',
   noPrivate:'No prices, LC, internal free-text remarks, private evidence IDs or proof document numbers are exported.',
   noAccess:'Browser-local review confirmation is NOT secure management/tenant authorization.',
   noCloud:'Only individually selected saved records in the active browser profile are included.',
   invalid:'Some orders have invalid identities or duplicate selected records.'
  });
  static WORDS=Object.freeze({
   en:PortfolioReport.EN,
   bn:{...PortfolioReport.EN,title:'পোর্টফোলিও / মাল্টি PO',asOf:'ম্যানেজমেন্ট পর্যালোচনার তারিখ',
    consent:'এই নির্বাচিত অর্ডারগুলি অভ্যন্তরীণ ব্যবহারের জন্য দেখার অনুমতি আছে; অনুমতি ছাড়া শেয়ার করব না।',
    authority:'ম্যানেজমেন্ট অনুমতির উৎস রেফারেন্স (রিপোর্টে থাকবে না)',
    select:'সেভ করা অর্ডার, সঠিক তারিখ, অনুমতি ও উৎস রেফারেন্স বেছে নিন।',
    choose:'রিপোর্টের জন্য সেভ করা অর্ডার বেছে নিন',empty:'সেভ করা production order নেই।',
    orders:'নির্বাচিত অর্ডার',groups:'Buyer / Factory সংখ্যা',actions:'উৎস অনুযায়ী পরবর্তী কাজ',
    record:'রেকর্ড',qty:'পুরো অর্ডার পরিমাণ',unit:'একক',status:'রেকর্ড অবস্থা',revision:'সংশোধন',
    due:'Buyer নির্ধারিত ex-factory',forecast:'রেকর্ডকৃত S04 পূর্বাভাস',actual:'প্রমাণসহ S04 বাস্তব',
    blocked:'অবরুদ্ধ / বাতিল কাজ',waiting:'অনুমোদনের অপেক্ষা',state:'উৎসের অবস্থা',
    activity:'কাজ',ref:'কাজের রেফারেন্স',target:'লক্ষ্য তারিখ',window:'সময়সীমা',
    type:'গ্রুপের ধরন',groupName:'গ্রুপ',count:'রেকর্ড সংখ্যা',missing:'তথ্য প্রয়োজন',
    noAccess:'Browser-এর সম্মতি নিরাপদ server অনুমতি নয়।',
    noCpm:'অগ্রাধিকার উৎসের কাজ ও তারিখ থেকে; cross-order critical path নয়।',
    noShip:'S04 তারিখ/পূর্বাভাস শিপমেন্ট বা অনুমোদনের নিশ্চিত প্রমাণ নয়।',
    noPrivate:'গোপন প্রমাণ, মন্তব্য, দাম এবং LC তথ্য বাদ দেওয়া হয়েছে।'},
   hi:{...PortfolioReport.EN,title:'पोर्टफोलियो / मल्टी PO',asOf:'मैनेजमेंट समीक्षा तारीख',
    consent:'इन चुने हुए ऑर्डरों की आंतरिक समीक्षा के लिए अधिकृत हूं; बिना अनुमति साझा नहीं करूंगा।',
    authority:'मैनेजमेंट अनुमति स्रोत संदर्भ (रिपोर्ट में नहीं जाएगा)',
    select:'सेव ऑर्डर, तारीख, अनुमति की पुष्टि और स्रोत संदर्भ चुनें।',
    choose:'रिपोर्ट के लिए सेव ऑर्डर चुनें',empty:'सेव प्रोडक्शन ऑर्डर नहीं हैं।',
    orders:'चुने हुए ऑर्डर',groups:'Buyer / Factory गिनती',actions:'स्रोत के अगले कार्य',
    record:'रिकॉर्ड',qty:'पूरे ऑर्डर की मात्रा',unit:'इकाई',status:'दर्ज स्थिति',revision:'रिवीजन',
    due:'Buyer एक्स-फैक्टरी तारीख',forecast:'दर्ज S04 पूर्वानुमान',actual:'साक्ष्ययुक्त S04 वास्तविक',
    blocked:'रुके / अस्वीकृत कार्य',waiting:'मंजूरी का इंतजार',state:'दर्ज स्थिति',
    activity:'कार्य',ref:'कार्य संदर्भ',target:'लक्ष्य तारीख',window:'समीक्षा अवधि',
    type:'समूह प्रकार',groupName:'समूह',count:'रिकॉर्ड संख्या',missing:'जानकारी चाहिए',
    noAccess:'स्थानीय पुष्टि सुरक्षित सर्वर अनुमति नहीं है।',
    noCpm:'अगले कार्य स्रोत की तारीख से; cross-order critical path नहीं।',
    noShip:'S04 तारीख या पूर्वानुमान से शिपमेंट/मंजूरी सत्यापित नहीं होती।',
    noPrivate:'निजी साक्ष्य, मूल्य, LC और टिप्पणियां नहीं दी गईं।'},
   ta:{...PortfolioReport.EN,title:'Portfolio / Multi-PO',asOf:'Management மதிப்பாய்வு தேதி',
    consent:'தேர்ந்தெடுத்த ஆர்டர்களின் உள்ளக தகவலைப் பார்க்க அனுமதி உள்ளது; அனுமதியின்றிப் பகிரமாட்டேன்.',
    authority:'Management அனுமதி ஆதாரம் (ரிப்போர்ட்டில் வராது)',
    select:'Saved ஆர்டர்கள், மதிப்பாய்வு தேதி, அனுமதி ஒப்புதல், ஆதாரம் தேர்வு செய்யவும்.',
    choose:'ரிப்போர்ட்டுக்கான saved ஆர்டர்களைத் தேர்ந்தெடு',empty:'Saved production order இல்லை.',
    orders:'தேர்ந்தெடுத்த ஆர்டர்கள்',groups:'Buyer / factory எண்ணிக்கை',actions:'மூலப் பதிவின் அடுத்த செயல்கள்',
    record:'பதிவு',qty:'முழு order அளவு',unit:'அலகு',status:'பதிவு நிலை',revision:'திருத்தம்',
    due:'Buyer கேட்ட ex-factory',forecast:'S04 கணிப்பு பதிவு',actual:'ஆதாரமுள்ள S04 actual',
    blocked:'தடை / நிராகரிக்கப்பட்ட வேலை',waiting:'Approval காத்திருப்பு',state:'மூலப் பதிவு நிலை',
    activity:'செயல்',ref:'செயல் குறிப்பு',target:'இலக்கு தேதி',window:'மதிப்பாய்வு காலம்',
    type:'குழு வகை',groupName:'குழு',count:'பதிவு எண்ணிக்கை',missing:'தகவல் தேவை',
    noAccess:'Browser ஒப்புதல் பாதுகாப்பான server permission அல்ல.',
    noCpm:'அடுத்த செயல்கள் பதிவான தேதி அடிப்படை; cross-order critical path அல்ல.',
    noShip:'S04 தேதி/கணிப்பு உண்மையான shipment அல்லது approval உறுதி அல்ல.',
    noPrivate:'தனிப்பட்ட ஆதாரங்கள், remarks, விலை, LC விவரங்கள் வெளியிடப்படாது.'}
  });
  // No editable title, factory remark or restricted evidence enters ACTION_NAMES.
  static ACTION_NAMES=Object.freeze({
   O11:'Buyer delivery baseline',D08:'Fit approval',D14:'PP sample decision',
   FA05:'Lab dip decision',FP15:'Fabric in-house',TR12:'Trims in-house',
   PP08:'PPM decision',PP10:'Cutting authorization',C06:'Cutting complete',
   P03:'Sewing complete',Q08:'Final inspection decision',PK04:'Packing complete',
   S01:'Freight booking',S04:'Ex-factory handover',S08:'Shipping documents'
  });
  static CLOSED=new Set(['completed','approved','waived','not-applicable']);
  static text(value,max=160){return typeof value==='string'?value.trim().slice(0,max):''}
  static date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
   const parsed=new Date(value+'T00:00:00Z');
   return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value?value:null}
  static qty(value){return typeof value==='number'&&Number.isFinite(value)&&value>0?value:null}
  static window(date,asOf){
   if(!date)return 'undated';
   const days=Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(asOf+'T00:00:00Z'))/86400000);
   return days<0?'overdue':days===0?'today':days<=7?'soon':'later';
  }
  static row(plan,asOf,labels){
   const order=plan.order||{},commit=plan.commitments||{},recordId=this.text(plan.recordId,140);
   const buyer=this.text(order.buyerName)||labels.missing;
   const factory=this.text(order.factoryName)||labels.missing;
   const styles=Array.isArray(order.styles)?order.styles.map(item=>this.text(item?.styleNo)).filter(Boolean):[];
   const pos=Array.isArray(order.poNumbers)?[...new Set(order.poNumbers.map(x=>this.text(x)).filter(Boolean))]:[];
   const due=this.date(commit.buyerRequiredExFactory);
   const shipment=Array.isArray(plan.tasks)?plan.tasks.find(t=>t?.templateRef==='S04'):null;
   const forecast=this.date(shipment?.dates?.forecastFinish),datedActual=this.date(shipment?.dates?.actualFinish);
   const proof=Array.isArray(shipment?.proofRefs)&&shipment.proofRefs.some(x=>!!this.text(x));
   const actual=datedActual&&datedActual<=asOf&&['approved','completed'].includes(shipment?.status)&&proof?datedActual:null;
   const tasks=Array.isArray(plan.tasks)?plan.tasks:[];
   const blockers=tasks.filter(x=>x?.applicability!=='not-applicable'&&['blocked','rejected'].includes(x?.status));
   const waiting=tasks.filter(x=>x?.applicability!=='not-applicable'&&x.status==='awaiting-approval');
   const seen=new Set(),actions=[];
   for(const task of tasks){
    const ref=this.text(task?.templateRef,12);
    if(!Object.hasOwn(this.ACTION_NAMES,ref)||seen.has(ref)||task?.applicability==='not-applicable'||this.CLOSED.has(task?.status))continue;
    seen.add(ref);
    const raw=task?.dates?.currentTargetFinish||task?.dates?.baselineFinish;
    const target=this.date(raw);
    const window=['blocked','rejected'].includes(task.status)?'blockedWindow':this.window(target,asOf);
    actions.push({recordId,ref,title:this.ACTION_NAMES[ref],
     status:this.text(task.status,40)||'not-started',target,window});
   }
   const weight={blockedWindow:0,overdue:1,today:2,soon:3,later:4,undated:5};
   actions.sort((a,b)=>weight[a.window]-weight[b.window]||
    String(a.target||'9999-12-31').localeCompare(String(b.target||'9999-12-31'))||
    a.ref.localeCompare(b.ref));
   const state=blockers.length?labels.blockedWindow:due&&due<asOf&&!actual?labels.pastDue:!due?labels.undated:labels.sourceOnly;
   const quantity=this.qty(order.totalQty),revision=Number.isInteger(plan.revision)&&plan.revision>=0?plan.revision:null;
   const sourceStatus=this.text(plan.recordStatus,30)||labels.missing;
   return {recordId,buyer,factory,styles:styles.join(', ')||labels.missing,
    po:pos.join(', ')||labels.missing,poCount:pos.length,
    quantity,unit:this.text(order.unit,20)||labels.missing,status:sourceStatus,revision,
    due,forecast,actual,blocked:blockers.length,waiting:waiting.length,state,
    actions:actions.slice(0,5),moreActions:Math.max(0,actions.length-5),
    datesMissing:!due||(!!shipment?.dates?.forecastFinish&&!forecast)};
  }
  static groups(rows,labels){
   const output=[];
   for(const [type,key] of [[labels.buyer,'buyer'],[labels.factory,'factory']]){
    const counts=new Map();
    for(const row of rows)counts.set(row[key],(counts.get(row[key])||0)+1);
    for(const [name,count] of [...counts].sort((a,b)=>a[0].localeCompare(b[0])))output.push({type,name,count});
   }
   return output;
  }
  static project(plans=[],opts={}){
   const language=Object.hasOwn(this.WORDS,opts.language)?opts.language:'en';
   const labels=this.WORDS[language],asOfDate=this.date(opts.asOfDate);
   const ids=Array.isArray(opts.selectedIds)?opts.selectedIds:[];
   const empty={ready:false,labels,asOfDate:null,orders:[],groups:[],actions:[],
    summary:null,warnings:[labels.select]};
   if(!asOfDate||opts.managementConfirmed!==true||!this.text(opts.authorityRef,200)||
    !ids.length||ids.length>250||ids.some(x=>!this.text(x,140))||new Set(ids).size!==ids.length)return empty;
   const sources=Array.isArray(plans)?plans:[];
   if(sources.length!==ids.length||new Set(sources.map(x=>x?.recordId)).size!==sources.length||
    sources.some(p=>!p||p.mode==='practice'||!this.text(p.recordId,140)||!ids.includes(p.recordId)||
     !p.order||!Array.isArray(p.tasks)))return {...empty,warnings:[labels.cannotRead]};
   const orders=sources.map(p=>this.row(p,asOfDate,labels));
   const actions=orders.flatMap(o=>o.actions),groups=this.groups(orders,labels);
   const warnings=[labels.sourceOnly,labels.noCpm,labels.noQty,labels.noShip,
    labels.noPrivate,labels.noAccess,labels.noCloud];
   if(orders.length===1)warnings.push(labels.onlyOne);
   if(orders.some(o=>o.datesMissing))warnings.push(labels.noDates);
   return {ready:true,labels,asOfDate,orders,groups,actions,warnings,
    summary:{orders:orders.length,poReferences:orders.reduce((sum,o)=>sum+o.poCount,0),
     buyers:new Set(orders.map(o=>o.buyer)).size,factories:new Set(orders.map(o=>o.factory)).size,
     blockedOrders:orders.filter(o=>o.blocked>0).length,
     waitingApprovalOrders:orders.filter(o=>o.waiting>0).length},
    disclosure:'Local selected record sources only; no external authorization'};
  }
 }
 const api={WORDS:PortfolioReport.WORDS,ACTION_NAMES:PortfolioReport.ACTION_NAMES,
  project:(plans,options)=>PortfolioReport.project(plans,options)};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.VesaTnaPortfolioReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
