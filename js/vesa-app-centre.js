/*
 * App Centre explorer: display-only catalogue adapter.
 * Owner: app discovery, 19-route categorization, search, language labels and
 * keyboard-accessible filters. Never reads or writes domain records, auth
 * secrets, sibling storage or approval state. Existing catalogue owns routes.
 * Usage: new VesaAppCentreExplorer({catalogue,filters,search,clear,status,count}).mount()
 */
(function(global){
'use strict';
const ORDER=['en','bn','hi','ta'];
const GROUPS=Object.freeze([
 {id:'planning',members:['aql','ppm','tna','production-tracker']},
 {id:'orders',members:['costing','purchase-order','order-commission','lc-payment']},
 {id:'product',members:['product-development','tech-pack-spec','sampling-approval','fabric-trims','label-artwork-approval','fabric-supplier-comparison']},
 {id:'shipping',members:['packing-container','shipment-documentation','claims-disputes']},
 {id:'partners',members:['buyer-crm','factory-vendor']}
]);
const COPY=Object.freeze({
 en:{
  eyebrow:'YOUR WORKSPACES',title:'Find the right tool for the job',
  intro:'Planning, production, sourcing and reports in one organised place.',
  available:'Available applications',search:'Find an application',
  placeholder:'Search by app, task or report…',
  all:'All apps',showing:'Showing {shown} of {total} apps',
  clear:'Clear search',emptyTitle:'No applications found',
  emptyText:'Try another keyword or show all applications.',
  reset:'Show all apps',open:'Open workspace',
  groups:{planning:'Planning & quality',orders:'Orders & finance',
   product:'Product & sourcing',shipping:'Shipping & claims',partners:'Buyer & factory'}
 },
 bn:{
  eyebrow:'আপনার ওয়ার্কস্পেস',title:'কাজের জন্য সঠিক অ্যাপ বেছে নিন',
  intro:'পরিকল্পনা, উৎপাদন, সোর্সিং ও রিপোর্ট এক জায়গায়।',
  available:'উপলব্ধ অ্যাপ',search:'অ্যাপ খুঁজুন',
  placeholder:'অ্যাপ, কাজ বা রিপোর্ট খুঁজুন…',
  all:'সব অ্যাপ',showing:'{total}টির মধ্যে {shown}টি অ্যাপ দেখা যাচ্ছে',
  clear:'খোঁজা মুছুন',emptyTitle:'কোনো অ্যাপ পাওয়া যায়নি',
  emptyText:'অন্য শব্দ দিয়ে খুঁজুন অথবা সব অ্যাপ দেখুন।',
  reset:'সব অ্যাপ দেখুন',open:'অ্যাপ খুলুন',
  groups:{planning:'পরিকল্পনা ও মান',orders:'অর্ডার ও হিসাব',
   product:'পণ্য ও সোর্সিং',shipping:'শিপমেন্ট ও দাবি',partners:'বায়ার ও ফ্যাক্টরি'}
 },
 hi:{
  eyebrow:'आपके वर्कस्पेस',title:'अपने काम के लिए सही ऐप चुनें',
  intro:'प्लानिंग, प्रोडक्शन, सोर्सिंग और रिपोर्ट एक जगह।',
  available:'उपलब्ध ऐप',search:'ऐप खोजें',
  placeholder:'ऐप, काम या रिपोर्ट खोजें…',
  all:'सभी ऐप',showing:'{total} में से {shown} ऐप दिख रहे हैं',
  clear:'खोज साफ करें',emptyTitle:'कोई ऐप नहीं मिला',
  emptyText:'दूसरे शब्द से खोजें या सभी ऐप दिखाएँ।',
  reset:'सभी ऐप दिखाएँ',open:'ऐप खोलें',
  groups:{planning:'प्लानिंग और गुणवत्ता',orders:'ऑर्डर और वित्त',
   product:'प्रोडक्ट और सोर्सिंग',shipping:'शिपमेंट और क्लेम',partners:'बायर और फैक्ट्री'}
 },
 ta:{
  eyebrow:'உங்கள் வேலைப்பகுதி',title:'உங்கள் வேலைக்கான சரியான App-ஐத் தேர்ந்தெடுக்கவும்',
  intro:'Planning, production, sourcing, reports — எல்லாம் ஒரே இடத்தில்.',
  available:'கிடைக்கும் Apps',search:'App-ஐத் தேடுங்கள்',
  placeholder:'App, வேலை அல்லது report-ஐத் தேடுங்கள்…',
  all:'எல்லா Apps',showing:'மொத்தம் {total} Apps-ல் {shown} காட்டப்படுகின்றன',
  clear:'தேடலை நீக்கவும்',emptyTitle:'App கிடைக்கவில்லை',
  emptyText:'வேறு வார்த்தையில் தேடவும் அல்லது எல்லா Apps-ஐயும் பார்க்கவும்.',
  reset:'எல்லா Apps-ஐயும் பார்க்கவும்',open:'App திறக்கவும்',
  groups:{planning:'Planning & Quality',orders:'Orders & Finance',
   product:'Product & Sourcing',shipping:'Shipping & Claims',partners:'Buyer & Factory'}
 }
});
/* Short user-facing actions only. Neither task names nor translations create business approval. */
const SUMMARIES=Object.freeze({
 aql:['Check garment quality, selected cartons and inspection reports.','পোশাকের মান, কার্টন নির্বাচন ও পরিদর্শন রিপোর্ট দেখুন।','गारमेंट गुणवत्ता, कार्टन चयन और निरीक्षण रिपोर्ट देखें।','கார்மெண்ட் தரம், கார்ட்டன் தேர்வு, inspection report பார்க்கவும்.'],
 ppm:['Review pre-production readiness, checkpoints and follow-ups.','প্রি-প্রোডাকশন প্রস্তুতি, চেকপয়েন্ট ও ফলো-আপ দেখুন।','प्री-प्रोडक्शन तैयारी, चेकपॉइंट और फॉलो-अप देखें।','Production readiness, checkpoints, follow-up வேலைகளைப் பார்க்கவும்.'],
 tna:['Plan milestones, critical activities and order dates.','কাজের মাইলস্টোন, জরুরি কাজ ও অর্ডারের তারিখ পরিকল্পনা করুন।','माइलस्टोन, जरूरी काम और ऑर्डर की तारीखें प्लान करें।','Milestones, critical activities, ஆர்டர் தேதிகளைத் திட்டமிடவும்.'],
 'production-tracker':['Review daily line output, work in progress and revisions.','দৈনিক উৎপাদন, চলমান কাজ ও সংশোধন দেখুন।','दैनिक लाइन आउटपुट, चल रहा काम और सुधार देखें।','தினசரி output, WIP, திருத்தங்களைப் பார்க்கவும்.'],
 costing:['Prepare source-backed garment costing and draft FOB.','উৎসভিত্তিক গার্মেন্ট কস্টিং ও খসড়া FOB করুন।','स्रोत आधारित गारमेंट कॉस्टिंग और ड्राफ्ट FOB बनाएँ।','ஆதாரத்துடன் costing மற்றும் draft FOB தயாரிக்கவும்.'],
 'purchase-order':['Control PO lines, size quantities and version changes.','PO লাইন, সাইজ অনুযায়ী পরিমাণ ও পরিবর্তন দেখুন।','PO लाइन, साइज मात्रा और बदलाव नियंत्रित करें।','PO lines, size quantity, revision-களை நிர்வகிக்கவும்.'],
 'order-commission':['Track commission agreements, invoices and receipts.','কমিশন চুক্তি, ইনভয়েস ও প্রাপ্তি দেখুন।','कमीशन अनुबंध, इनवॉइस और रसीद देखें।','Commission agreement, invoice, receipt நிலையைப் பார்க்கவும்.'],
 'lc-payment':['Record LC terms, amendments, dates and payment evidence.','LC শর্ত, সংশোধন, তারিখ ও পেমেন্ট প্রমাণ রাখুন।','LC शर्तें, संशोधन, तारीख और भुगतान प्रमाण रखें।','LC terms, amendments, தேதிகள், payment evidence பதிவு செய்யவும்.'],
 'product-development':['Organise style ideas, colourways and proposal boards.','স্টাইল আইডিয়া, কালারওয়ে ও প্রস্তাব বোর্ড সাজান।','स्टाइल आइडिया, कलरवे और प्रस्ताव बोर्ड सँभालें।','Style ideas, colourways, proposal boards ஒழுங்குபடுத்தவும்.'],
 'tech-pack-spec':['Build size measurements, grading and controlled spec versions.','মাপ, গ্রেডিং ও স্পেকের সংস্করণ তৈরি করুন।','साइज माप, ग्रेडिंग और स्पेक संस्करण बनाएँ।','Size measurement, grading, spec revision தயாரிக்கவும்.'],
 'sampling-approval':['Follow sample rounds, submissions and decision records.','স্যাম্পল রাউন্ড, জমা দেওয়া ও সিদ্ধান্তের রেকর্ড দেখুন।','सैंपल राउंड, सबमिशन और निर्णय रिकॉर्ड देखें।','Sample rounds, submission, decision பதிவுகளைக் கண்காணிக்கவும்.'],
 'fabric-trims':['Track BOM, material bookings, receipts and shortages.','BOM, ম্যাটেরিয়াল বুকিং, রিসিপ্ট ও ঘাটতি দেখুন।','BOM, मटेरियल बुकिंग, रसीद और कमी देखें।','BOM, booking, receipts, shortages கண்காணிக்கவும்.'],
 'label-artwork-approval':['Compare label and artwork revisions with review records.','লেবেল ও আর্টওয়ার্ক সংশোধন এবং রিভিউ দেখুন।','लेबल और आर्टवर्क के संशोधन तथा रिव्यू देखें।','Label, artwork revision மற்றும் review பதிவுகளை ஒப்பிடவும்.'],
 'fabric-supplier-comparison':['Compare dated fabric offers using documented costs and terms.','তারিখসহ ফ্যাব্রিক অফার ও শর্ত তুলনা করুন।','दर्ज कीमतों और शर्तों पर फैब्रिक ऑफर तुलना करें।','Fabric offers-ஐ rate, terms அடிப்படையில் ஒப்பிடவும்.'],
 'packing-container':['Calculate carton packs, CBM and draft loading plans.','কার্টন প্যাক, CBM ও খসড়া লোড প্ল্যান হিসাব করুন।','कार्टन पैक, CBM और ड्राफ्ट लोड प्लान बनाएँ।','Carton pack, CBM, draft loading plan கணக்கிடவும்.'],
 'shipment-documentation':['Prepare draft shipping files, quantities and documents.','খসড়া শিপিং ফাইল, পরিমাণ ও নথি প্রস্তুত করুন।','ड्राफ्ट शिपिंग फाइल, मात्रा और दस्तावेज बनाएँ।','Draft shipping files, quantities, documents தயாரிக்கவும்.'],
 'claims-disputes':['Follow claim cases, source evidence and settlement records.','ক্লেইম মামলা, প্রমাণ ও নিষ্পত্তির রেকর্ড দেখুন।','क्लेम मामले, प्रमाण और निपटान रिकॉर्ड देखें।','Claim cases, evidence, settlement பதிவுகளைக் கண்காணிக்கவும்.'],
 'buyer-crm':['Manage buyer enquiries, opportunities and follow-ups locally.','বায়ার এনকোয়ারি, সুযোগ ও ফলো-আপ স্থানীয়ভাবে রাখুন।','बायर पूछताछ, अवसर और फॉलो-अप स्थानीय रूप से रखें।','Buyer enquiry, opportunity, follow-up-களை நிர்வகிக்கவும்.'],
 'factory-vendor':['Review factory sites, declared capacities and documents.','ফ্যাক্টরি সাইট, ঘোষিত সক্ষমতা ও নথি দেখুন।','फैक्ट्री साइट, घोषित क्षमता और दस्तावेज देखें।','Factory sites, declared capacity, documents பார்க்கவும்.']
});
class VesaAppCentreExplorer {
 constructor(options){
  if(!options || !options.catalogue || !options.filters || !options.search ||
     !options.clear || !options.status || !options.count)throw new TypeError('App Centre controls are required.');
  this.catalogue=options.catalogue;this.filters=options.filters;
  this.search=options.search;this.clear=options.clear;
  this.status=options.status;this.count=options.count;
  this.apps=(global.VesaAppCatalogue?.enabled?.()||[]).slice();
  this.active='all';this.term='';
  this.onInput=()=>{this.term=this.search.value.trim().toLocaleLowerCase();this.render();};
  this.onFilter=event=>{
   const button=event.target.closest?.('[data-app-group],[data-app-reset]');
   if(!button)return;
   if(button.hasAttribute('data-app-reset')){this.reset();return;}
   const group=button.dataset.appGroup;
   if(group==='all'||GROUPS.some(item=>item.id===group)){
    this.active=group;this.render();
   }
  };
  this.onLocale=()=>this.render();
  this.onClear=()=>this.reset();
 }
 static escape(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[char]));
 }
 static groupOf(id){
  return GROUPS.find(item=>item.members.includes(id))?.id||'other';
 }
 locale(){
  const code=global.VesaPrefs?.read?.()?.language||'en';
  return Object.hasOwn(COPY,code)?code:'en';
 }
 summary(app,code){
  const values=SUMMARIES[app.id];
  return values?.[ORDER.indexOf(code)]||values?.[0]||app.description||'';
 }
 reset(){
  this.active='all';this.term='';this.search.value='';
  this.render();this.search.focus();
 }
 mount(){
  this.search.addEventListener('input',this.onInput);
  this.clear.addEventListener('click',this.onClear);
  this.filters.addEventListener('click',this.onFilter);
  this.catalogue.addEventListener('click',this.onFilter);
  global.addEventListener('vesa-preferences-change',this.onLocale);
  this.render();
  return this;
 }
 render(){
  const code=this.locale(),copy=COPY[code],escape=VesaAppCentreExplorer.escape;
  document.querySelectorAll('[data-centre-copy]').forEach(node=>{
   const key=node.dataset.centreCopy;
   if(typeof copy[key]==='string')node.textContent=copy[key];
  });
  this.search.placeholder=copy.placeholder;
  this.search.setAttribute('aria-label',copy.search);
  this.count.textContent=String(this.apps.length);
  const matched=this.apps.filter(app=>{
   const group=VesaAppCentreExplorer.groupOf(app.id);
   const groupMatch=this.active==='all'||this.active===group;
   const haystack=[app.name,app.shortName,app.id,app.description,
    this.summary(app,code),COPY.en.groups[group],copy.groups[group]].join(' ').toLocaleLowerCase();
   return groupMatch&&(!this.term||haystack.includes(this.term));
  });
  this.filters.innerHTML=[{id:'all',members:this.apps},...GROUPS].map(group=>{
   const name=group.id==='all'?copy.all:copy.groups[group.id],count=group.id==='all'?this.apps.length:
    this.apps.filter(app=>VesaAppCentreExplorer.groupOf(app.id)===group.id).length;
   return '<button type="button" class="app-filter'+(this.active===group.id?' is-current':'')+
    '" data-app-group="'+escape(group.id)+'" aria-pressed="'+String(this.active===group.id)+'">'+
    escape(name)+' <span aria-hidden="true">'+count+'</span></button>';
  }).join('');
  const sections=GROUPS.map(group=>{
   const chosen=matched.filter(app=>VesaAppCentreExplorer.groupOf(app.id)===group.id);
   if(!chosen.length)return '';
   const heading=copy.groups[group.id];
   return '<section class="app-group" aria-labelledby="app-group-'+escape(group.id)+'">'+
    '<div class="app-group-heading"><h2 id="app-group-'+escape(group.id)+'">'+escape(heading)+
    '</h2><span>'+chosen.length+'</span></div><div class="app-grid">'+chosen.map(app=>{
     const name=app.name.replace(/^VESA\s+/i,'');
     const open=copy.open;
     return '<article class="app-tile" data-app-id="'+escape(app.id)+'">'+
      '<div class="app-tile-head"><span class="app-tile-short">'+escape(app.shortName)+'</span></div>'+
      '<h3 title="'+escape(app.name)+'">'+escape(name)+'</h3>'+
      '<p>'+escape(this.summary(app,code))+'</p>'+
      '<a class="app-tile-open" href="'+escape(app.route)+'" aria-label="'+escape(open)+' — '+escape(name)+'">'+
      '<span>'+escape(open)+'</span><span aria-hidden="true">↗</span></a></article>';
    }).join('')+'</div></section>';
  }).join('');
  this.catalogue.innerHTML=sections||(
   '<div class="app-empty"><h2>'+escape(copy.emptyTitle)+'</h2><p>'+escape(copy.emptyText)+
   '</p><button type="button" data-app-reset>'+escape(copy.reset)+'</button></div>');
  this.clear.hidden=!this.term&&this.active==='all';
  this.status.textContent=copy.showing.replace('{shown}',String(matched.length)).replace('{total}',String(this.apps.length));
 }
}
global.VesaAppCentreExplorer=VesaAppCentreExplorer;
})(window);
