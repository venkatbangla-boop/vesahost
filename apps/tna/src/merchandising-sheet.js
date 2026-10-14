/**
 * Garment master-sheet UI owner. The only inputs are a read-only TNA plan,
 * a previously validated scheduling result and view-only filter preferences.
 * This module never edits plans, dates, approvals, saved copies or sibling apps.
 * The existing bootstrap activity editor remains the only update entry point.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaMerchandisingSheet=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const FILTERS=['all','overdue','week','buyer','local','factory','on-track','critical'];
  const COLUMNS=['stage','activity','owner','planned','revised','forecast','actual','delay','status','proof','remarks','update'];
  const COMPLETE=new Set(['completed','approved','waived','not-applicable']);
  const STAGES={O:'Order / Commercial',D:'Samples / Approvals',FA:'Fabric Approval',FP:'Fabric Booking / Production',TR:'Trims',PP:'Pre-production',C:'Cutting',P:'Sewing / Finishing',Q:'Quality',PK:'Packing',S:'Shipment'};
  const LANGUAGES={
    en:{editOrder:'Edit order details',waiting:'Waiting for',authority:'Authorizing party',sourceRef:'Source document / reference',reason:'Reason for change',saveActivity:'Save activity changes',saveOrder:'Save order details',warning:'Only documented facts are entered; a named party or reference is not independently verified.',lcRef:'Master LC source reference',title:'Garment Time & Action Master Sheet',intro:'Follow up order, materials, approvals, production and shipment together.',buyer:'Buyer',factory:'Factory',po:'PO / Order',style:'Style',garment:'Garment',fabric:'Fabric details',gsm:'GSM',colors:'Color / Size',quantity:'Order quantity',lc:'Master LC opened',lcStatus:'LC status',exFactory:'Required ex-factory',shipment:'Required ETD',orderNote:'Order remarks',asOf:'Review as-of date',filter:'Show activities',missing:'Needs Information',none:'Not recorded',count:'Activities shown',of:'of',update:'Update',stage:'Section',activity:'Activity',owner:'Responsible party',planned:'Planned / baseline',revised:'Revised / target',forecast:'Forecast',actual:'Actual',delay:'Days delay',status:'Status',proof:'Approval / source',remarks:'Remarks',noRows:'No activities match this view.',dateHelp:'Choose a review date to see overdue and this-week work.',calendarHelp:'Factory calendar is not confirmed. Calculated forecast and critical path remain unverified.',dateLegend:'Original plan, revised target, forecast and actual are separate. Missing dates are never guessed.',filters:{all:'All activities',overdue:'Overdue',week:'Due this week',buyer:'Waiting buyer',local:'Waiting local office',factory:'Waiting factory','on-track':'On track',critical:'Critical activities'},statuses:{'not-started':'Not started','in-progress':'In progress',submitted:'Submitted','awaiting-approval':'Awaiting approval',approved:'Approved',rejected:'Rejected',blocked:'Blocked',completed:'Completed',waived:'Waived','not-applicable':'Not applicable'}},
    bn:{editOrder:'অর্ডারের বিবরণ পরিবর্তন',waiting:'কার অপেক্ষায়',authority:'অনুমোদনের দায়িত্বে',sourceRef:'নথি / রেফারেন্স',reason:'পরিবর্তনের কারণ',saveActivity:'কাজের পরিবর্তন সংরক্ষণ',saveOrder:'অর্ডারের বিবরণ সংরক্ষণ',warning:'শুধু নথিভুক্ত তথ্য লিখুন; নাম বা রেফারেন্স স্বাধীনভাবে যাচাই করা হয় না।',lcRef:'মাস্টার LC রেফারেন্স',title:'গার্মেন্টস টাইম অ্যান্ড অ্যাকশন মাস্টার শিট',intro:'অর্ডার, কাপড়, অনুমোদন, উৎপাদন ও শিপমেন্টের কাজ একসাথে দেখুন।',buyer:'বায়ার',factory:'ফ্যাক্টরি',po:'PO / অর্ডার',style:'স্টাইল',garment:'পোশাক',fabric:'কাপড়ের বিবরণ',gsm:'GSM',colors:'রং / সাইজ',quantity:'অর্ডার পরিমাণ',lc:'মাস্টার LC খোলা',lcStatus:'LC অবস্থা',exFactory:'এক্স-ফ্যাক্টরি তারিখ',shipment:'ETD তারিখ',orderNote:'অর্ডার মন্তব্য',asOf:'পর্যালোচনার তারিখ',filter:'কাজ বেছে দেখুন',missing:'তথ্য প্রয়োজন',none:'পাওয়া যায়নি',count:'দেখানো কাজ',of:'মোট',update:'আপডেট',stage:'বিভাগ',activity:'কাজ',owner:'দায়িত্ব',planned:'মূল পরিকল্পনা',revised:'সংশোধিত লক্ষ্য',forecast:'পূর্বাভাস',actual:'বাস্তব',delay:'বিলম্ব (দিন)',status:'অবস্থা',proof:'অনুমোদন / সূত্র',remarks:'মন্তব্য',noRows:'এই বাছাইয়ে কাজ পাওয়া যায়নি।',dateHelp:'বিলম্ব বা এই সপ্তাহের কাজ দেখতে তারিখ নির্বাচন করুন।',calendarHelp:'ফ্যাক্টরির ক্যালেন্ডার নিশ্চিত নয়; পূর্বাভাস ও ক্রিটিক্যাল পাথ যাচাই হয়নি।',dateLegend:'মূল পরিকল্পনা, সংশোধিত, পূর্বাভাস ও বাস্তব তারিখ আলাদা। তারিখ অনুমান করা হয় না।',filters:{all:'সব কাজ',overdue:'বিলম্বিত',week:'এই সপ্তাহে',buyer:'বায়ারের অপেক্ষায়',local:'লোকাল অফিসের অপেক্ষায়',factory:'ফ্যাক্টরির অপেক্ষায়','on-track':'সময়সূচিতে',critical:'ক্রিটিক্যাল কাজ'},statuses:{'not-started':'শুরু হয়নি','in-progress':'চলছে',submitted:'জমা দেওয়া','awaiting-approval':'অনুমোদনের অপেক্ষায়',approved:'অনুমোদিত',rejected:'প্রত্যাখ্যাত',blocked:'আটকে আছে',completed:'সম্পন্ন',waived:'ছাড় দেওয়া','not-applicable':'প্রযোজ্য নয়'}},
    hi:{editOrder:'ऑर्डर विवरण बदलें',waiting:'किसके इंतज़ार में',authority:'अनुमोदन करने वाला',sourceRef:'दस्तावेज़ / रेफरेंस',reason:'बदलाव का कारण',saveActivity:'कार्य बदलाव सेव करें',saveOrder:'ऑर्डर विवरण सेव करें',warning:'केवल दर्ज तथ्य लिखें; नाम या रेफरेंस अलग से सत्यापित नहीं हैं।',lcRef:'मास्टर LC रेफरेंस',title:'गारमेंट टाइम एंड एक्शन मास्टर शीट',intro:'ऑर्डर, फैब्रिक, अप्रूवल, प्रोडक्शन और शिपमेंट एक साथ देखें।',buyer:'बायर',factory:'फैक्ट्री',po:'PO / ऑर्डर',style:'स्टाइल',garment:'गारमेंट',fabric:'फैब्रिक विवरण',gsm:'GSM',colors:'रंग / साइज़',quantity:'ऑर्डर मात्रा',lc:'मास्टर LC खुला',lcStatus:'LC स्थिति',exFactory:'एक्स-फैक्ट्री तारीख',shipment:'ETD तारीख',orderNote:'ऑर्डर टिप्पणी',asOf:'समीक्षा की तारीख',filter:'काम चुनकर देखें',missing:'जानकारी चाहिए',none:'दर्ज नहीं',count:'दिखाए काम',of:'कुल',update:'अपडेट',stage:'विभाग',activity:'काम',owner:'जिम्मेदार',planned:'मूल प्लान',revised:'संशोधित लक्ष्य',forecast:'फोरकास्ट',actual:'वास्तविक',delay:'देरी (दिन)',status:'स्थिति',proof:'अनुमोदन / स्रोत',remarks:'टिप्पणी',noRows:'इस चयन में कोई काम नहीं।',dateHelp:'देरी और इस सप्ताह के काम देखने के लिए समीक्षा तारीख चुनें।',calendarHelp:'फैक्ट्री कैलेंडर की पुष्टि नहीं; फोरकास्ट और क्रिटिकल पाथ अभी सत्यापित नहीं।',dateLegend:'मूल लक्ष्य, संशोधित, फोरकास्ट और वास्तविक तारीखें अलग हैं; तारीखें नहीं गढ़ी जातीं।',filters:{all:'सभी काम',overdue:'देरी',week:'इस सप्ताह',buyer:'बायर की प्रतीक्षा',local:'लोकल ऑफिस की प्रतीक्षा',factory:'फैक्ट्री की प्रतीक्षा','on-track':'समय पर',critical:'क्रिटिकल काम'},statuses:{'not-started':'शुरू नहीं','in-progress':'चल रहा है',submitted:'सबमिट किया','awaiting-approval':'मंजूरी लंबित',approved:'मंजूर',rejected:'अस्वीकृत',blocked:'रुका हुआ',completed:'पूरा',waived:'छूट','not-applicable':'लागू नहीं'}},
    ta:{editOrder:'Order விவரம் திருத்த',waiting:'யாருக்காக காத்திருக்கிறது',authority:'அனுமதி வழங்கும் தரப்பு',sourceRef:'ஆதார ஆவணம் / Reference',reason:'மாற்றக் காரணம்',saveActivity:'Activity மாற்றங்களை Save செய்ய',saveOrder:'Order விவரங்களை Save செய்ய',warning:'ஆதாரத்துடன் பதிவிடவும்; தரப்பு பெயர் அல்லது reference தனியாக சரிபார்க்கப்படவில்லை.',lcRef:'Master LC ஆதார reference',title:'Garment Time & Action Master Sheet',intro:'Buyer, factory, fabric, approval, production, shipment வேலைகளை ஒரே sheet-ல் பார்க்கலாம்.',buyer:'Buyer',factory:'Factory',po:'PO / Order',style:'Style',garment:'Garment',fabric:'Fabric விவரம்',gsm:'GSM',colors:'நிறம் / Size',quantity:'Order அளவு',lc:'Master LC திறந்த தேதி',lcStatus:'LC நிலை',exFactory:'Ex-factory தேதி',shipment:'ETD தேதி',orderNote:'Order குறிப்புகள்',asOf:'சரிபார்க்கும் தேதி',filter:'வேலை தேர்வு',missing:'தகவல் தேவை',none:'பதிவாகவில்லை',count:'காண்பிக்கும் வேலைகள்',of:'மொத்தம்',update:'புதுப்பிக்க',stage:'பிரிவு',activity:'வேலை',owner:'பொறுப்பாளர்',planned:'அசல் தேதி',revised:'திருத்திய இலக்கு',forecast:'எதிர்பார்ப்பு',actual:'நடந்த தேதி',delay:'தாமத நாட்கள்',status:'நிலை',proof:'Approval / ஆதாரம்',remarks:'குறிப்புகள்',noRows:'இந்தத் தேர்வில் வேலைகள் இல்லை.',dateHelp:'தாமதம் / இந்த வார வேலைகளைப் பார்க்க சரிபார்க்கும் தேதியைத் தேர்வு செய்யவும்.',calendarHelp:'Factory calendar உறுதி செய்யப்படவில்லை; forecast, critical path இன்னும் சரிபார்க்கப்படவில்லை.',dateLegend:'Planned, revised, forecast, actual தேதிகள் தனித்தனியாக இருக்கும்; தேதிகளை ஊகிக்க மாட்டோம்.',filters:{all:'அனைத்தும்',overdue:'தாமதம்',week:'இந்த வாரம்',buyer:'Buyer காத்திருப்பு',local:'Local office காத்திருப்பு',factory:'Factory காத்திருப்பு','on-track':'நேரத்திற்குள்',critical:'Critical வேலைகள்'},statuses:{'not-started':'தொடங்கவில்லை','in-progress':'நடக்கிறது',submitted:'சமர்ப்பித்தது','awaiting-approval':'Approval காத்திருப்பு',approved:'ஒப்புதல்',rejected:'நிராகரிப்பு',blocked:'தடை',completed:'முடிந்தது',waived:'விலக்கு','not-applicable':'பொருந்தாது'}}
  };
  const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const missing=value=>value===null||value===undefined||value==='';
  const civil=value=>{
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const [y,m,d]=value.split('-').map(Number),time=Date.UTC(y,m-1,d);
    return new Date(time).toISOString().slice(0,10)===value?Math.floor(time/86400000):null;
  };
  const safeDate=value=>civil(value)===null?null:value;
  const calendarConfirmed=plan=>Array.isArray(plan?.calendars)&&plan.calendars.some(c=>c&&c.source&&c.source!=='user-not-configured');
  class TnaMerchandisingSheet {
    /**
     * Build view facts without changing plan state. "Waiting" filters require
     * an explicitly entered waitingFor party; no owner or approval is invented.
     */
    snapshot(plan,options={}){
      const labels=LANGUAGES[options.language]||LANGUAGES.en;
      const filter=FILTERS.includes(options.filter)?options.filter:'all',asOf=civil(options.asOfDate||'');
      const scheduled=calendarConfirmed(plan)&&options.scheduled?.validity==='valid'?options.scheduled:null;
      const tasks=Array.isArray(plan?.tasks)?plan.tasks:[];
      const rows=tasks.map((task,index)=>{
        const dates=task.dates||{},proofs=Array.isArray(task.proofRefs)?task.proofRefs.filter(Boolean):[];
        const planned=safeDate(dates.baselineFinish),revised=safeDate(dates.currentTargetFinish);
        const computed=scheduled?.taskResults?.[task.taskId];
        const forecast=safeDate(dates.forecastFinish)||safeDate(computed?.earlyFinish);
        const actual=safeDate(dates.actualFinish),target=revised||planned,targetDay=civil(target);
        const compareDay=civil(actual||forecast);
        const delayDays=targetDay!==null&&compareDay!==null?Math.max(0,compareDay-targetDay):null;
        const status=task.status||'not-started',open=!COMPLETE.has(status);
        const day=civil(target),weekday=asOf===null?null:(new Date(asOf*86400000).getUTCDay()||7);
        const endOfWeek=asOf===null?null:asOf+7-weekday;
        const waiting=String(task.waitingFor||'').toLowerCase();
        return {taskId:String(task.taskId||''),ref:String(task.templateRef||''),title:String(task.title||''),
          stage:STAGES[task.stageCode]||task.stage||task.stageCode||labels.missing,
          owner:String(task.ownerParty||''),status,planned,revised,forecast,actual,delayDays,
          proof:proofs.join(', '),remarks:[task.followUpNote,task.delayReason,task.recoveryAction].filter(Boolean).join(' / '),
          waiting,overdue:open&&asOf!==null&&day!==null&&day<asOf,
          week:open&&asOf!==null&&day!==null&&day>=asOf&&day<=endOfWeek,
          critical:!!(scheduled&&computed?.isCritical),
          onTrack:!!(scheduled&&targetDay!==null&&civil(forecast)!==null&&civil(forecast)<=targetDay&&!['blocked','rejected'].includes(status)),
          index};
      });
      const selected=rows.filter(row=>{
        if(filter==='overdue')return row.overdue;
        if(filter==='week')return row.week;
        if(filter==='buyer')return row.waiting==='buyer';
        if(filter==='local')return ['local-office','bangladesh-office'].includes(row.waiting);
        if(filter==='factory')return row.waiting==='factory';
        if(filter==='critical')return row.critical;
        if(filter==='on-track')return row.onTrack;
        return true;
      });
      const count=key=>rows.filter(x=>x[key]).length;
      return {labels,rows,selected,filter,asOfDate:options.asOfDate||'',hasAsOf:asOf!==null,hasConfirmedCalendar:!!scheduled,
        counts:{total:rows.length,overdue:count('overdue'),week:count('week'),
          buyer:rows.filter(x=>x.waiting==='buyer').length,
          local:rows.filter(x=>['local-office','bangladesh-office'].includes(x.waiting)).length,
          factory:rows.filter(x=>x.waiting==='factory').length,critical:count('critical'),onTrack:count('onTrack')}};
    }
    /**
     * Render the complete (not first-12) apparel TNA in a scrollable table;
     * mobile CSS presents the same rows as cards. Only user-supplied facts
     * and verified calculations appear. data-edit-task routes to bootstrap.
     */
    render(plan,options={}){
      const view=this.snapshot(plan,options),t=view.labels,order=plan?.order||{},commit=plan?.commitments||{},style=order.styles?.[0]||{};
      const breakdown=Array.isArray(order.colorSizeBreakdown)?order.colorSizeBreakdown:[];
      const value=x=>esc(missing(x)?t.missing:x);
      const fields=[
        ['buyer',order.buyerName],['factory',order.factoryName],['po',order.poNumbers?.join(', ')],
        ['style',style.styleNo],['garment',order.construction||order.productProfile],
        ['fabric',order.fabricSpec||order.composition],['gsm',order.fabricWeightGsm],
        ['colors',breakdown.length?breakdown.map(x=>String(x.color||'')+' / '+String(x.size||'')).join(', '):style.sizeRange],
        ['quantity',missing(order.totalQty)?null:String(order.totalQty)+' '+(order.unit||'pcs')],
        ['lc',commit.masterLcOpenedOn],['lcStatus',commit.masterLcStatus],
        ['exFactory',commit.buyerRequiredExFactory],['shipment',commit.buyerRequiredETD],
        ['orderNote',order.commercialNotes]
      ];
      let html='<section class="tna-merch-panel" id="tnaMerchSheet" aria-label="Garment merchandising TNA master sheet">';
      html+='<div class="tna-merch-heading"><div><h3>'+esc(t.title)+'</h3><p>'+esc(t.intro)+'</p><button type="button" class="tna-mini-btn" data-tna-order-details>'+esc(t.editOrder)+'</button></div><span>'+esc(t.count)+': '+view.selected.length+' '+esc(t.of)+' '+view.counts.total+'</span></div>';
      html+='<dl class="tna-merch-order">'+fields.map(x=>'<div><dt>'+esc(t[x[0]])+'</dt><dd>'+value(x[1])+'</dd></div>').join('')+'</dl>';
      html+='<div class="tna-merch-controls"><label>'+esc(t.asOf)+'<input type="date" data-tna-sheet-asof value="'+esc(view.asOfDate)+'"></label>';
      html+='<label>'+esc(t.filter)+'<select data-tna-sheet-filter>'+FILTERS.map(k=>'<option value="'+k+'" '+(k===view.filter?'selected':'')+'>'+esc(t.filters[k])+'</option>').join('')+'</select></label></div>';
      const metrics=[
        [t.filters.overdue,view.hasAsOf?view.counts.overdue:t.missing],[t.filters.week,view.hasAsOf?view.counts.week:t.missing],
        [t.filters.buyer,view.counts.buyer],[t.filters.local,view.counts.local],[t.filters.factory,view.counts.factory],
        [t.filters['on-track'],view.hasConfirmedCalendar?view.counts.onTrack:t.missing],
        [t.filters.critical,view.hasConfirmedCalendar?view.counts.critical:t.missing]
      ];
      html+='<div class="tna-merch-counts">'+metrics.map(x=>'<span><b>'+esc(x[1])+'</b> '+esc(x[0])+'</span>').join('')+'</div>';
      html+='<p class="tna-merch-note">'+esc(t.dateLegend)+'</p>';
      if(!view.hasAsOf)html+='<p class="tna-merch-note">'+esc(t.dateHelp)+'</p>';
      if(!view.hasConfirmedCalendar)html+='<p class="tna-merch-note">'+esc(t.calendarHelp)+'</p>';
      html+='<div class="tna-merch-scroll" role="region" tabindex="0" aria-label="'+esc(t.title)+'"><table class="tna-merch-table"><thead><tr>'+COLUMNS.map(k=>'<th scope="col">'+esc(t[k])+'</th>').join('')+'</tr></thead><tbody>';
      for(const row of view.selected){
        const cell=(name,content)=>'<td data-label="'+esc(t[name])+'">'+content+'</td>';
        html+='<tr data-tna-ref="'+esc(row.ref)+'">';
        html+=cell('stage',esc(row.stage))+cell('activity','<strong>'+esc(row.title)+'</strong>')+cell('owner',value(row.owner));
        html+=cell('planned',value(row.planned))+cell('revised',value(row.revised))+cell('forecast',value(row.forecast))+cell('actual',value(row.actual));
        html+=cell('delay',row.delayDays===null?esc(t.missing):String(row.delayDays));
        html+=cell('status',esc(t.statuses[row.status]||row.status)+(row.critical?' (Critical)':''));
        html+=cell('proof',row.proof?esc(row.proof):esc(t.none))+cell('remarks',row.remarks?esc(row.remarks):esc(t.none));
        html+=cell('update','<button type="button" class="tna-mini-btn" data-edit-task="'+esc(row.taskId)+'" aria-label="'+esc(t.update+' '+row.title)+'">'+esc(t.update)+'</button>')+'</tr>';
      }
      if(!view.selected.length)html+='<tr><td colspan="'+COLUMNS.length+'">'+esc(t.noRows)+'</td></tr>';
      return html+'</tbody></table></div></section>';
    }
  }
  return Object.freeze({TnaMerchandisingSheet,LANGUAGES,FILTERS,COLUMNS});
});
