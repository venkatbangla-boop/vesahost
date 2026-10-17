/* TNA M1: source-only garment merchandising master-sheet presenter.
 * Owner: this class renders an existing VesaTnaDomain plan; it NEVER changes
 * task dates, buyer approval, CPM, user storage, source evidence or an app sibling.
 * Caller supplies only user-selected as-of date and the unchanged scheduling-engine
 * result; calculated critical flags never substitute for a human approval.
 */
(function(root){
'use strict';
class VesaTnaMerchandisingSheet{
 static COPY=Object.freeze({
  en:{title:'Garment TNA Master Sheet',subtitle:'One order, every applicable activity. Dates and approvals need their original source.',
   buyer:'Buyer',factory:'Factory',po:'PO / Order',style:'Style',product:'Garment',fabric:'Fabric specification',
   gsm:'GSM',colour:'Colour / size',quantity:'Order quantity',lc:'Master LC opened',
   lcStatus:'LC evidence',exFactory:'Required ex-factory',shipment:'Required shipment ETD',
   remark:'Order remarks',notes:'Missing source stays Needs Information. LC date is a user entry, not bank authentication.',
   asOf:'As-of review date (user entered)',all:'All Activities',overdue:'Overdue',
   week:'Due Next 7 Days',buyerWait:'Waiting Buyer',localWait:'Waiting Local Office',
   factoryWait:'Waiting Factory',ontrack:'On Track',critical:'Critical Path',
   section:'Section / activity',owner:'Responsible party',baseline:'Baseline plan',
   target:'Current target',forecast:'Forecast',actual:'Actual',delay:'Delay (calendar days)',
   state:'Status',source:'Source / approval evidence',criticalCol:'Calculated critical',
   comment:'Remarks',edit:'Edit status',editDates:'Edit dates',unverified:'Needs Information',
   noRows:'No sourced activities match this filter.',notCalculated:'Not calculated',
   calculated:'Critical',noncritical:'Not critical',pending:'Evidence not supplied',
   total:'applicable activities',shown:'shown',noAsOf:'Enter an as-of date to use overdue / due-next-week filters.',
   localInfo:'Local office must be explicitly named as task owner; it cannot be assumed from merchandiser or factory roles.',
   draft:'DRAFT / SOURCE REVIEW REQUIRED — NOT A BUYER APPROVAL OR SHIPMENT RELEASE.',
   currentInfo:'Dates displayed as separate source fields; forecast is not an approved revised target. Edit activity uses the existing controlled status/actual dialog.',
   sizeMissing:'No colour/size breakdown entered',schedulingMissing:'Critical Path needs an explicit order start and buyer required ex-factory date.'},
  bn:{title:'গার্মেন্টস TNA মাস্টার শিট',subtitle:'একটি অর্ডারের সব প্রযোজ্য কাজ; তারিখ ও অনুমোদনের উৎস লাগবে।',
   buyer:'বায়ার',factory:'ফ্যাক্টরি',po:'PO / অর্ডার',style:'স্টাইল',product:'পোশাক',fabric:'ফ্যাব্রিক বিবরণ',
   gsm:'GSM',colour:'রং / সাইজ',quantity:'অর্ডার পরিমাণ',lc:'মাস্টার LC খোলা',
   lcStatus:'LC প্রমাণ',exFactory:'এক্স-ফ্যাক্টরি তারিখ',shipment:'শিপমেন্ট ETD',
   remark:'অর্ডার মন্তব্য',notes:'উৎস না থাকলে Needs Information; LC তারিখ ব্যাংকের সত্যায়ন নয়।',
   asOf:'পর্যালোচনার তারিখ (নিজে দিন)',all:'সব কাজ',overdue:'সময় পার হয়েছে',
   week:'আগামী ৭ দিনের কাজ',buyerWait:'বায়ারের অপেক্ষা',localWait:'লোকাল অফিসের অপেক্ষা',
   factoryWait:'ফ্যাক্টরির অপেক্ষা',ontrack:'অন ট্র্যাক',critical:'ক্রিটিক্যাল পাথ',
   section:'সেকশন / কাজ',owner:'দায়িত্বপ্রাপ্ত',baseline:'মূল পরিকল্পনা',
   target:'বর্তমান লক্ষ্য',forecast:'পূর্বাভাস',actual:'আসল তারিখ',delay:'দেরি (ক্যালেন্ডার দিন)',
   state:'অবস্থা',source:'উৎস / অনুমোদনের প্রমাণ',criticalCol:'গণনাকৃত ক্রিটিক্যাল',
   comment:'মন্তব্য',edit:'অবস্থা বদলান',editDates:'তারিখ বদলান',unverified:'Needs Information',
   noRows:'এই ফিল্টারে কোনো কাজ নেই।',notCalculated:'গণনা হয়নি',
   calculated:'ক্রিটিক্যাল',noncritical:'ক্রিটিক্যাল নয়',pending:'প্রমাণ নেই',
   total:'প্রযোজ্য কাজ',shown:'দেখানো',noAsOf:'দেরি ও আগামী সপ্তাহ দেখতে পর্যালোচনার তারিখ দিন।',
   localInfo:'কাজের মালিক হিসেবে লোকাল অফিস স্পষ্ট লেখা থাকতে হবে; অনুমান নয়।',
   draft:'খসড়া / উৎস যাচাই দরকার — বায়ার অনুমোদন বা শিপমেন্ট রিলিজ নয়।',
   currentInfo:'মূল/বর্তমান/পূর্বাভাস/আসল তারিখ আলাদা; পূর্বাভাস অনুমোদন নয়।',
   sizeMissing:'রং ও সাইজের বিবরণ নেই',schedulingMissing:'শুরুর তারিখ ও বায়ার এক্স-ফ্যাক্টরি তারিখ প্রয়োজন।'},
  hi:{title:'गारमेंट TNA मास्टर शीट',subtitle:'एक ऑर्डर के सभी लागू काम; तारीख और मंजूरी का स्रोत चाहिए।',
   buyer:'बायर',factory:'फैक्ट्री',po:'PO / ऑर्डर',style:'स्टाइल',product:'गारमेंट',fabric:'फैब्रिक विवरण',
   gsm:'GSM',colour:'रंग / साइज',quantity:'ऑर्डर मात्रा',lc:'मास्टर LC खुला',
   lcStatus:'LC प्रमाण',exFactory:'एक्स-फैक्ट्री तारीख',shipment:'शिपमेंट ETD',
   remark:'ऑर्डर टिप्पणी',notes:'स्रोत न हो तो Needs Information; LC तारीख बैंक सत्यापन नहीं है।',
   asOf:'समीक्षा की तारीख (खुद भरें)',all:'सभी काम',overdue:'देरी से',
   week:'अगले ७ दिन',buyerWait:'बायर के इंतजार में',localWait:'लोकल ऑफिस के इंतजार में',
   factoryWait:'फैक्ट्री के इंतजार में',ontrack:'समय पर',critical:'क्रिटिकल पाथ',
   section:'सेक्शन / काम',owner:'जिम्मेदार',baseline:'मूल योजना',
   target:'वर्तमान लक्ष्य',forecast:'पूर्वानुमान',actual:'वास्तविक',delay:'देरी (कैलेंडर दिन)',
   state:'स्थिति',source:'स्रोत / मंजूरी प्रमाण',criticalCol:'गणना किया क्रिटिकल',
   comment:'टिप्पणी',edit:'स्थिति बदलें',editDates:'तारीख बदलें',unverified:'Needs Information',
   noRows:'इस फिल्टर में काम नहीं मिले।',notCalculated:'गणना नहीं',
   calculated:'क्रिटिकल',noncritical:'क्रिटिकल नहीं',pending:'प्रमाण नहीं',
   total:'लागू काम',shown:'दिखाए',noAsOf:'देरी/अगले सप्ताह के लिए समीक्षा की तारीख भरें।',
   localInfo:'लोकल ऑफिस को स्पष्ट तौर पर मालिक लिखना होगा; अनुमान नहीं।',
   draft:'ड्राफ्ट / स्रोत जांच बाकी — बायर मंजूरी या शिपमेंट रिलीज नहीं।',
   currentInfo:'मूल/वर्तमान/पूर्वानुमान/वास्तविक तारीख अलग हैं; पूर्वानुमान मंजूरी नहीं।',
   sizeMissing:'रंग व साइज की जानकारी नहीं',schedulingMissing:'ऑर्डर शुरू और बायर एक्स-फैक्ट्री तारीख जरूरी।'},
  ta:{title:'கார்மெண்ட் TNA மாஸ்டர் ஷீட்',subtitle:'ஒரே ஆர்டரில் பொருந்தும் எல்லா வேலைகளும்; தேதி மற்றும் approval-க்கு ஆதாரம் தேவை.',
   buyer:'பையர்',factory:'ஃபேக்டரி',po:'PO / ஆர்டர்',style:'ஸ்டைல்',product:'கார்மெண்ட்',fabric:'ஃபேப்ரிக் விவரம்',
   gsm:'GSM',colour:'கலர் / சைஸ்',quantity:'ஆர்டர் எண்ணிக்கை',lc:'மாஸ்டர் LC திறந்த தேதி',
   lcStatus:'LC ஆதாரம்',exFactory:'எக்ஸ்-ஃபேக்டரி தேதி',shipment:'ஷிப்மெண்ட் ETD',
   remark:'ஆர்டர் குறிப்புகள்',notes:'ஆதாரம் இல்லாதது Needs Information; LC தேதி என்பது வங்கி உறுதிப்படுத்தல் அல்ல.',
   asOf:'ரிவியூ தேதி (நீங்கள் உள்ளிடவும்)',all:'எல்லா வேலைகளும்',overdue:'தாமதமானவை',
   week:'அடுத்த 7 நாட்கள்',buyerWait:'பையர் பதில் நிலுவை',localWait:'லோக்கல் ஆஃபீஸ் நிலுவை',
   factoryWait:'ஃபேக்டரி நிலுவை',ontrack:'சரியான நேரத்தில்',critical:'கிரிட்டிக்கல் பாத்',
   section:'பிரிவு / வேலை',owner:'பொறுப்பாளர்',baseline:'முதல் திட்டம்',
   target:'தற்போதைய இலக்கு',forecast:'ஃபோர்காஸ்ட்',actual:'நடந்த தேதி',delay:'தாமதம் (காலண்டர் நாள்)',
   state:'நிலை',source:'ஆதாரம் / ஒப்புதல்',criticalCol:'கணக்கிட்ட கிரிட்டிக்கல்',
   comment:'குறிப்புகள்',edit:'நிலை திருத்து',editDates:'தேதி திருத்து',unverified:'Needs Information',
   noRows:'இந்த ஃபில்டரில் வேலை இல்லை.',notCalculated:'கணக்கிடவில்லை',
   calculated:'கிரிட்டிக்கல்',noncritical:'கிரிட்டிக்கல் இல்லை',pending:'ஆதாரம் இல்லை',
   total:'பொருந்தும் வேலைகள்',shown:'காட்டியது',noAsOf:'தாமதம் / அடுத்த வாரம் பார்க்க ரிவியூ தேதியை உள்ளிடவும்.',
   localInfo:'Local office பொறுப்பை நேரடியாக பதிவு செய்ய வேண்டும்; ஊகிக்க முடியாது.',
   draft:'வரைவு / ஆதாரம் சரிபார்க்க வேண்டும் — பையர் approval அல்லது shipment release அல்ல.',
   currentInfo:'Baseline, target, forecast, actual தேதிகள் தனித்தனி; forecast என்பது approval அல்ல.',
   sizeMissing:'கலர் / சைஸ் விவரம் இல்லை',schedulingMissing:'ஆர்டர் தொடக்கமும் பையர் ex-factory தேதியும் தேவை.'}
 });
 static FILTERS=Object.freeze(['all','overdue','week','buyerWait','localWait','factoryWait','ontrack','critical']);
 static FACTORY_ROLES=new Set(['factory','cutting','sewing','finishing','packing','wash']);
 static esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 static date(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const n=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?value:null;
 }
 static day(value){const d=this.date(value);return d===null?null:Date.parse(d+'T00:00:00Z')/86400000;}
 static daysBetween(start,end){const a=this.day(start),b=this.day(end);return a===null||b===null?null:b-a;}
 static explicit(row,key){return this.date(row?.dates?.[key]);}
 static rows(plan,schedule){
  const valid=!!schedule&&schedule.validity==='valid'&&schedule.taskResults;
  return (plan?.tasks||[]).map((task,index)=>{
   const baseline=this.explicit(task,'baselineFinish');
   const target=this.explicit(task,'currentTargetFinish');
   const forecast=this.explicit(task,'forecastFinish');
   const actual=this.explicit(task,'actualFinish');
   const due=target||forecast||baseline;
   const delay=this.daysBetween(baseline,actual||forecast||target);
   const proof=Array.isArray(task.proofRefs)?task.proofRefs.filter(x=>typeof x==='string'&&x.trim()).join(' · '):'';
   const calculated=valid?schedule.taskResults[task.taskId]||null:null;
   return {task,index,baseline,target,forecast,actual,due,delay,proof,
    critical:calculated?calculated.isCritical===true:null};
  });
 }
 static filterRows(rows,kind,asOf){
  if(!this.FILTERS.includes(kind))kind='all';
  if(kind==='all')return rows;
  const asOfDay=this.day(asOf);
  return rows.filter(r=>{
   const task=r.task,owner=task.ownerParty;
   const open=!['approved','completed','waived','not-applicable'].includes(task.status);
   const day=this.day(r.due),diff=day===null||asOfDay===null?null:day-asOfDay;
   if(kind==='overdue')return open&&diff!==null&&diff<0;
   if(kind==='week')return open&&diff!==null&&diff>=0&&diff<=7;
   if(kind==='buyerWait')return owner==='buyer'&&['awaiting-approval','submitted','blocked'].includes(task.status);
   if(kind==='localWait')return owner==='local-office'&&open;
   if(kind==='factoryWait')return this.FACTORY_ROLES.has(owner)&&
    ['blocked','awaiting-approval','submitted','in-progress'].includes(task.status);
   if(kind==='ontrack')return task.riskStatus==='on-track';
   if(kind==='critical')return r.critical===true;
   return true;
  });
 }
 static render(plan,scheduled,options={}){
  const lang=['en','bn','hi','ta'].includes(options.language)?options.language:'en',t=this.COPY[lang];
  const kind=this.FILTERS.includes(options.filter)?options.filter:'all',asOf=this.date(options.asOf)||'';
  const rows=this.rows(plan,scheduled),visible=this.filterRows(rows,kind,asOf);
  const e=this.esc,display=v=>e(v===0?0:(v??t.unverified)),order=plan?.order||{},dates=plan?.commitments||{};
  const style=order.styles?.[0]||{},size=Array.isArray(order.colorSizeBreakdown)?order.colorSizeBreakdown:[];
  const field=(label,value)=>'<div class="tna-merch-field"><dt>'+e(label)+'</dt><dd>'+display(value||null)+'</dd></div>';
  const info=[
   [t.buyer,order.buyerName],[t.factory,order.factoryName],[t.po,order.poNumbers?.join(', ')],
   [t.style,style.styleNo],[t.product,order.construction||order.productProfile],
   [t.fabric,order.fabricSpec],[t.gsm,null],[t.quantity,
    order.totalQty===null||order.totalQty===undefined?null:String(order.totalQty)+' '+(order.unit||'pcs')],
   [t.lc,dates.masterLcOpenedOn],[t.lcStatus,dates.masterLcOpenedOn?'Date entered; bank source unverified':null],
   [t.exFactory,dates.buyerRequiredExFactory],[t.shipment,dates.buyerRequiredETD],
   [t.remark,order.commercialNotes]
  ];
  const tableRows=visible.map(r=>{
   const x=r.task,refs=r.proof||t.pending,comment=[x.delayReason,x.recoveryAction].filter(Boolean).join(' · ');
   return '<tr data-tna-sheet-task="'+e(x.taskId)+'"><td><strong>'+e(x.templateRef)+
    '</strong><span class="tna-merch-stage">'+e(x.stage||x.stageCode)+'</span><span>'+e(x.title)+'</span></td>'+
    '<td>'+display(x.ownerParty)+'</td><td>'+display(r.baseline)+'</td><td>'+display(r.target)+'</td>'+
    '<td>'+display(r.forecast)+'</td><td>'+display(r.actual)+'</td><td class="tna-merch-days">'+
    display(r.delay)+'</td><td>'+display(x.status)+'</td><td>'+display(refs)+'</td><td>'+
    (r.critical===null?e(t.notCalculated):r.critical?e(t.calculated):e(t.noncritical))+'</td>'+
    '<td>'+display(comment)+'</td><td class="tna-merch-actions"><button type="button" class="tna-mini-btn" data-edit-task-dates="'+
    e(x.taskId)+'">'+e(t.editDates)+'</button><button type="button" class="tna-mini-btn" data-edit-task="'+
    e(x.taskId)+'">'+e(t.edit)+'</button></td></tr>';
  }).join('');
  const filterLabel={all:t.all,overdue:t.overdue,week:t.week,buyerWait:t.buyerWait,
   localWait:t.localWait,factoryWait:t.factoryWait,ontrack:t.ontrack,critical:t.critical};
  const headings=[t.section,t.owner,t.baseline,t.target,t.forecast,t.actual,t.delay,
   t.state,t.source,t.criticalCol,t.comment,t.edit];
  return '<section class="tna-merch-sheet" aria-label="Garment merchandising master sheet" id="tnaMerchSheet">'+
   '<header class="tna-merch-header"><div><span class="tna-kicker">VESA TNA 360</span><h3>'+
   e(t.title)+'</h3><p>'+e(t.subtitle)+'</p></div><strong>'+rows.length+' '+e(t.total)+'</strong></header>'+
   '<dl class="tna-merch-order">'+info.map(([label,value])=>field(label,value)).join('')+'</dl>'+
   '<details class="tna-merch-sizes"><summary>'+e(t.colour)+' · '+size.length+'</summary>'+
   (size.length?'<ul>'+size.map(x=>'<li>'+e(x.color)+' / '+e(x.size)+' — '+
    display(x.quantity)+' '+e(order.unit||'pcs')+'</li>').join('')+'</ul>':
    '<p>'+e(t.sizeMissing)+'</p>')+'</details>'+
   '<p class="tna-note">'+e(t.notes)+'</p>'+
   '<div class="tna-merch-controls"><label>'+e(t.asOf)+
    ' <input type="date" id="tnaMerchAsOf" value="'+e(asOf)+'"></label>'+
   '<nav class="tna-merch-filters" aria-label="Master sheet filters">'+
   this.FILTERS.map(k=>'<button type="button" data-tna-merch-filter="'+k+
    '" aria-pressed="'+(kind===k?'true':'false')+'">'+e(filterLabel[k])+'</button>').join('')+
   '</nav></div><p class="tna-merch-count" role="status">'+visible.length+' '+e(t.shown)+
   ' / '+rows.length+' '+e(t.total)+'</p>'+
   (!asOf&&['overdue','week'].includes(kind)?'<p class="tna-note">'+e(t.noAsOf)+'</p>':'')+
   (kind==='localWait'?'<p class="tna-note">'+e(t.localInfo)+'</p>':'')+
   (!scheduled?'<p class="tna-note">'+e(t.schedulingMissing)+'</p>':'')+
   '<div class="tna-merch-scroll" role="region" tabindex="0" aria-label="Full garment TNA activity sheet">'+
   '<table class="tna-merch-table"><thead><tr>'+headings.map(h=>'<th scope="col">'+e(h)+'</th>').join('')+
   '</tr></thead><tbody>'+(visible.length?tableRows:'<tr><td colspan="12">'+e(t.noRows)+'</td></tr>')+
   '</tbody></table></div><p class="tna-note">'+e(t.currentInfo)+'</p>'+
   '<p class="tna-merch-warning">'+e(t.draft)+'</p></section>';
 }
}
root.VesaTnaMerchandisingSheet=VesaTnaMerchandisingSheet;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaTnaMerchandisingSheet;
})(typeof globalThis!=='undefined'?globalThis:this);
