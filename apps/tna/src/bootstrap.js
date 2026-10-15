(function(){
  'use strict';

  const STORE_KEY='vesa.tna360.local.v1';
  const SUPPORTED_LANGUAGES=['en','bn','hi','ta'];
  const COPY={
    en:{app:'VESA TNA 360',tag:'Universal Apparel Time & Action',title:'Plan every order without guessing.',lead:'Create garment-native critical paths, keep original/current/forecast/actual dates separate, and record what is still unknown.',mode:'Local — this browser',modeText:'Domain records, garment templates, local save/reopen, backup and safe Excel preview are active in this browser. Reports continue in later checkpoints.',saved:'Ready',new:'New TNA',newText:'Create a validated draft from quick, full or staged Excel-entry inputs. Required unknowns remain visible.',continue:'Continue Last TNA',continueText:'Open the latest saved local TNA when one exists in this browser.',open:'Open Saved TNA',openText:'Choose from saved local TNA records in this browser.',practice:'Practice Example',practiceText:'Opens a clearly marked training preview. It is not a production order.',copy:'Open Saved Copy',copyText:'Open a checksum-protected VESA-TNA JSON backup after validation.',orders:'All Orders',ordersText:'Shows browser-local orders now; connected multi-company lists require approved backend.',home:'HOME',file:'FILE',edit:'EDIT',view:'VIEW',tools:'TOOLS',help:'HELP',appCentre:'App Centre',menuTitle:'TNA actions',unavailable:'This action is scheduled for a later TNA checkpoint and is not marked complete yet.',cloud:'Connected collaboration is blocked until a server provider, identity, database, storage and notification sender are authorized.',offlineWork:'Offline work',offlineWorkText:'Review changes held in this browser. Nothing is sent until verified connected collaboration is configured.',offlineWorkEmpty:'No offline changes are waiting in this browser.',offlineWorkPending:'{count} offline change(s) are held for review.',offlineWorkReview:'Review offline work',offlineQueued:'Waiting',offlineSent:'Sent for review',offlineConflicts:'Needs conflict review',offlineRejected:'Rejected locally',offlineWorkError:'Offline work status is unavailable in this browser.',offlineConflictNote:'This change needs an explicit reviewed resolution; no automatic merge was performed.',offlineOrderChange:'Order change',offlineApprovalChange:'Approval review',offlineOtherChange:'Offline change',recent:'Recent local work',empty:'No production TNA records are saved in this browser.',next:'Next implementation checkpoint',nextText:'G03 will add calendar and critical-path calculations. G02 only creates validated draft records and templates; it does not invent dates.',privacy:'Business data remains local in this browser until a verified backend is configured.',workspace:'Draft workspace',template:'Template',unknown:'Needs Information',tasks:'Tasks',baseline:'Baseline',validation:'Validation',notSaved:'Draft is not saved yet. Use Save TNA to keep it in this browser.',quick:'Quick entry',full:'Full entry',excel:'Excel entry',createDraft:'Create draft',templateLibrary:'Template library',save:'Save TNA',saveText:'Save the current draft locally in this browser.',download:'Download Saved Copy',downloadText:'Create a checksum-protected portable backup file.',savedCopy:'Saved copy',importPreview:'Import preview',xlsxBlocked:'Choose a clean .xlsx workbook for mapping preview, or paste CSV/TSV text below. Macro-enabled files are rejected and formulas are flagged before any TNA is created.'},
    bn:{app:'VESA TNA 360',tag:'Universal Apparel Time & Action',title:'অনুমান ছাড়া প্রতিটি order plan করুন.',lead:'Garment critical path তৈরি করুন, original/current/forecast/actual date আলাদা রাখুন এবং কোন input unknown তা দেখান.',mode:'Local — এই browser',modeText:'এই G01 shell authenticated local work-এর জন্য প্রস্তুত. Domain engine, saving এবং reports পরের checkpoint-এ সম্পন্ন হবে.',saved:'Ready',new:'New TNA',newText:'Quick, full এবং import creation এখানে খুলবে. G02 validated order model এবং templates যোগ করবে.',continue:'Continue Last TNA',continueText:'এই browser-এ saved local TNA নেই.',open:'Open Saved TNA',openText:'G05 storage implement হলে local order list দেখাবে.',practice:'Practice Example',practiceText:'Training preview খুলবে. এটি production order নয়.',copy:'Open Saved Copy',copyText:'Backup validation G05-এ planned. Invalid file safely reject হবে.',orders:'All Orders',ordersText:'এখন browser-local orders দেখাবে; connected multi-company list-এর জন্য approved backend দরকার.',home:'HOME',file:'FILE',edit:'EDIT',view:'VIEW',tools:'TOOLS',help:'HELP',appCentre:'App Centre',menuTitle:'TNA actions',unavailable:'এই action পরের TNA checkpoint-এর জন্য scheduled; complete বলা হচ্ছে না.',cloud:'Server provider, identity, database, storage এবং notification sender authorize না হওয়া পর্যন্ত connected collaboration blocked.',offlineWork:'Offline work',offlineWorkText:'এই browser-এ রাখা পরিবর্তন review করুন. Verified connected collaboration না হওয়া পর্যন্ত কিছু পাঠানো হবে না.',offlineWorkEmpty:'এই browser-এ review-এর জন্য offline change নেই.',offlineWorkPending:'Review-এর জন্য {count}টি offline change রাখা আছে.',offlineWorkReview:'Offline work review করুন',offlineQueued:'অপেক্ষমাণ',offlineSent:'Review-এর জন্য পাঠানো হয়েছে',offlineConflicts:'Conflict review দরকার',offlineRejected:'এই browser-এ rejected',offlineWorkError:'এই browser-এ offline work status পাওয়া যাচ্ছে না.',offlineConflictNote:'এই change-এর জন্য explicit reviewed resolution দরকার; automatic merge করা হয়নি.',offlineOrderChange:'Order change',offlineApprovalChange:'Approval review',offlineOtherChange:'Offline change',recent:'Recent local work',empty:'এই browser-এ production TNA record save নেই.',next:'Next implementation checkpoint',nextText:'G02 versioned records, universal garment templates এবং New TNA wizard যোগ করবে; PPM/AQL logic বদলাবে না.',privacy:'Verified backend configure না হওয়া পর্যন্ত business data এই browser-এই local থাকবে.'},
    hi:{app:'VESA TNA 360',tag:'Universal Apparel Time & Action',title:'हर order को बिना guess किए plan करें.',lead:'Garment critical path बनाएं, original/current/forecast/actual dates अलग रखें, और unknown inputs साफ दिखाएं.',mode:'Local — इस browser',modeText:'यह G01 shell authenticated local work के लिए तैयार है. Domain engines, saving और reports बाद के checkpoints में पूरे होंगे.',saved:'Ready',new:'New TNA',newText:'Quick, full और import creation यहीं खुलेगा. G02 validated order model और templates जोड़ेगा.',continue:'Continue Last TNA',continueText:'इस browser में saved local TNA अभी नहीं है.',open:'Open Saved TNA',openText:'G05 storage के बाद local order list दिखेगी.',practice:'Practice Example',practiceText:'Training preview खुलेगा. यह production order नहीं है.',copy:'Open Saved Copy',copyText:'Backup validation G05 में planned है. Invalid files safely reject होंगी.',orders:'All Orders',ordersText:'अभी browser-local orders दिखेंगे; connected multi-company lists के लिए approved backend चाहिए.',home:'HOME',file:'FILE',edit:'EDIT',view:'VIEW',tools:'TOOLS',help:'HELP',appCentre:'App Centre',menuTitle:'TNA actions',unavailable:'यह action अगले TNA checkpoint के लिए scheduled है; इसे complete नहीं बताया गया है.',cloud:'Server provider, identity, database, storage और notification sender authorize होने तक connected collaboration blocked है.',offlineWork:'Offline work',offlineWorkText:'इस browser में रखे changes को review करें. Verified connected collaboration configure होने तक कुछ नहीं भेजा जाएगा.',offlineWorkEmpty:'इस browser में review के लिए offline changes नहीं हैं.',offlineWorkPending:'Review के लिए {count} offline change(s) रखे हैं.',offlineWorkReview:'Offline work review करें',offlineQueued:'Waiting',offlineSent:'Review के लिए भेजा गया',offlineConflicts:'Conflict review चाहिए',offlineRejected:'Locally rejected',offlineWorkError:'इस browser में offline work status उपलब्ध नहीं है.',offlineConflictNote:'इस change के लिए explicit reviewed resolution चाहिए; automatic merge नहीं किया गया.',offlineOrderChange:'Order change',offlineApprovalChange:'Approval review',offlineOtherChange:'Offline change',recent:'Recent local work',empty:'इस browser में production TNA records saved नहीं हैं.',next:'Next implementation checkpoint',nextText:'G02 versioned records, universal garment templates और New TNA wizard जोड़ेगा; PPM/AQL logic नहीं बदलेगा.',privacy:'Verified backend configure होने तक business data इसी browser में local रहेगा.'},
    ta:{app:'VESA TNA 360',tag:'Universal Apparel Time & Action',title:'Guess இல்லாமல் ஒவ்வொரு order-ஐயும் plan பண்ணுங்கள்.',lead:'Garment critical path உருவாக்கி, original/current/forecast/actual dates-ஐ தனியாக வைத்து, unknown inputs-ஐ தெளிவாக காட்டும்.',mode:'Local — இந்த browser',modeText:'இந்த G01 shell authenticated local work-க்கு ready. Domain engines, saving, reports அடுத்த checkpoints-ல் complete ஆகும்.',saved:'Ready',new:'New TNA',newText:'Quick, full, import creation இங்கே open ஆகும். G02 validated order model மற்றும் templates சேர்க்கும்.',continue:'Continue Last TNA',continueText:'இந்த browser-ல் saved local TNA இன்னும் இல்லை.',open:'Open Saved TNA',openText:'G05 storage வந்த பிறகு local order list தெரியும்.',practice:'Practice Example',practiceText:'Training preview open ஆகும். இது production order இல்லை.',copy:'Open Saved Copy',copyText:'Backup validation G05-ல் planned. Invalid files safely reject ஆகும்.',orders:'All Orders',ordersText:'இப்போது browser-local orders மட்டும்; connected multi-company list-க்கு approved backend வேண்டும்.',home:'HOME',file:'FILE',edit:'EDIT',view:'VIEW',tools:'TOOLS',help:'HELP',appCentre:'App Centre',menuTitle:'TNA actions',unavailable:'இந்த action அடுத்த TNA checkpoint-க்கு scheduled; complete என்று mark செய்யவில்லை.',cloud:'Server provider, identity, database, storage, notification sender authorize ஆகும் வரை connected collaboration blocked.',offlineWork:'Offline work',offlineWorkText:'இந்த browser-ல் வைத்துள்ள changes-ஐ review செய்யுங்கள். Verified connected collaboration configure ஆகும் வரை எதுவும் அனுப்பப்படாது.',offlineWorkEmpty:'இந்த browser-ல் review செய்ய offline changes இல்லை.',offlineWorkPending:'Review-க்கு {count} offline change(s) வைத்துள்ளோம்.',offlineWorkReview:'Offline work-ஐ review செய்யுங்கள்',offlineQueued:'Waiting',offlineSent:'Review-க்கு அனுப்பப்பட்டது',offlineConflicts:'Conflict review தேவை',offlineRejected:'Locally rejected',offlineWorkError:'இந்த browser-ல் offline work status கிடைக்கவில்லை.',offlineConflictNote:'இந்த change-க்கு explicit reviewed resolution தேவை; automatic merge செய்யப்படவில்லை.',offlineOrderChange:'Order change',offlineApprovalChange:'Approval review',offlineOtherChange:'Offline change',recent:'Recent local work',empty:'இந்த browser-ல் production TNA records save இல்லை.',next:'Next implementation checkpoint',nextText:'G02 versioned records, universal garment templates, New TNA wizard சேர்க்கும்; PPM/AQL logic மாற்றாது.',privacy:'Verified backend configure ஆகும் வரை business data இந்த browser-லேயே local இருக்கும்.'}
  };

  const PLAIN_COPY={
    en:{modeText:'Plan, save, reopen, back up and report from this browser.',newText:'Start with a quick order, a full order, or a reviewed spreadsheet.',continueText:'Open the most recently saved order in this browser.',openText:'Choose an order saved in this browser.',copyText:'Open a protected portable copy after it passes safety checks.',ordersText:'Review orders saved in this browser. Shared company lists are not available in local mode.',unavailable:'This action is not available yet.',cloud:'Sharing with other people is not available in this local version. Nothing is sent from this browser.',next:'Help and guidance',nextText:'Use Help for short instructions, garment-planning terms and recovery steps.',privacy:'Business information stays in this browser unless you choose to download a copy.',xlsxBlocked:'Choose a clean Excel workbook or paste table text. Workbooks with macros are not accepted, and formula cells are flagged before an order is created.'},
    bn:{modeText:'এই browser-এ plan করুন, save করুন, আবার খুলুন, backup নিন এবং report তৈরি করুন।',newText:'Quick order, full order অথবা review করা spreadsheet দিয়ে শুরু করুন।',continueText:'এই browser-এ সর্বশেষ save করা order খুলুন।',openText:'এই browser-এ save করা order বেছে নিন।',copyText:'নিরাপত্তা যাচাইয়ের পরে একটি protected portable copy খুলুন।',ordersText:'এই browser-এ save করা order দেখুন। Local mode-এ shared company list পাওয়া যাবে না।',unavailable:'এই কাজটি এখনো পাওয়া যাচ্ছে না।',cloud:'এই local version থেকে অন্য মানুষের সঙ্গে share করা যাবে না। এই browser থেকে কিছু পাঠানো হয় না।',next:'সহায়তা ও নির্দেশনা',nextText:'ছোট নির্দেশনা, garment planning-এর শব্দ এবং recovery step-এর জন্য Help খুলুন।',privacy:'আপনি copy download না করলে business information এই browser-এই থাকে।',xlsxBlocked:'একটি clean Excel workbook বেছে নিন অথবা table text paste করুন। Macro-সহ workbook নেওয়া হবে না, এবং order তৈরির আগে formula cell চিহ্নিত হবে।'},
    hi:{modeText:'इस browser में plan बनाएं, save करें, दोबारा खोलें, backup लें और report तैयार करें।',newText:'Quick order, full order या जाँची हुई spreadsheet से शुरू करें।',continueText:'इस browser में सबसे हाल में save किया गया order खोलें।',openText:'इस browser में save किया गया order चुनें।',copyText:'सुरक्षा जाँच के बाद protected portable copy खोलें।',ordersText:'इस browser में save किए गए order देखें। Local mode में shared company list उपलब्ध नहीं है।',unavailable:'यह काम अभी उपलब्ध नहीं है।',cloud:'इस local version से दूसरे लोगों के साथ share नहीं किया जा सकता। इस browser से कुछ नहीं भेजा जाता।',next:'सहायता और निर्देश',nextText:'छोटे निर्देश, garment planning के शब्द और recovery steps के लिए Help खोलें।',privacy:'जब तक आप copy download नहीं करते, business information इसी browser में रहती है।',xlsxBlocked:'Clean Excel workbook चुनें या table text paste करें। Macro वाला workbook स्वीकार नहीं होगा और order बनाने से पहले formula cells दिखाए जाएंगे।'},
    ta:{modeText:'இந்த browser-ல் plan செய்து, save செய்து, மீண்டும் திறந்து, backup எடுத்து, report தயாரிக்கலாம்.',newText:'Quick order, full order அல்லது சரிபார்த்த spreadsheet மூலம் தொடங்குங்கள்.',continueText:'இந்த browser-ல் கடைசியாக save செய்த order-ஐ திறக்கவும்.',openText:'இந்த browser-ல் save செய்த order-ஐ தேர்ந்தெடுக்கவும்.',copyText:'பாதுகாப்புச் சோதனை முடிந்த பிறகு protected portable copy-ஐ திறக்கவும்.',ordersText:'இந்த browser-ல் save செய்த order-களை பார்க்கவும். Local mode-ல் shared company list கிடைக்காது.',unavailable:'இந்த செயல் இன்னும் கிடைக்கவில்லை.',cloud:'இந்த local version-ல் மற்றவர்களுடன் share செய்ய முடியாது. இந்த browser-லிருந்து எதுவும் அனுப்பப்படாது.',next:'உதவி மற்றும் வழிகாட்டல்',nextText:'சுருக்கமான வழிமுறைகள், garment planning சொற்கள் மற்றும் recovery steps-க்கு Help-ஐ திறக்கவும்.',privacy:'நீங்கள் copy download செய்யாத வரை business information இந்த browser-லேயே இருக்கும்.',xlsxBlocked:'Clean Excel workbook-ஐ தேர்ந்தெடுக்கவும் அல்லது table text-ஐ paste செய்யவும். Macro உள்ள workbook ஏற்கப்படாது; order உருவாக்கும் முன் formula cells காட்டப்படும்.'}
  };

  const MENUS={
    home:['Home','App Centre','All Orders'],
    file:['New TNA','Open Saved TNA','Save Now','Make Another Copy','Download Saved Copy','Open Saved Copy','Import Excel TNA'],
    edit:['Undo','Redo','Edit Order','Add Activity','Edit Dependencies','Revise Target','Review Changes'],
    view:['Dashboard','TNA Planner','Timeline','Critical Path','Due Today','All Orders','Appearance / Language'],
    tools:['Recalculate Dates','Check Missing Information','Production Capacity','Shipment Lots','Recovery Scenarios','Linked Records','Offline Work','Prepare Report','Download Report','Print Report','Share Report'],
    help:['How to Use','Glossary','Example','About','Data & Backup Help']
  };
  const HELP_TOPICS={
    en:{
      how:{label:'How to Use',title:'Plan an order',intro:'Start with what you know. Missing facts stay clearly marked until you enter them.',items:['Choose New TNA and use Quick entry for the essential order details or Full entry for ports, dates and color/size quantities.','Review Needs Information and enter only confirmed dates, approvals, quantities and production rates.','Save the order in this browser, then use reports or a portable copy when you need to share it manually.']},
      glossary:{label:'Glossary',title:'Planning terms',intro:'These words have the same meaning throughout TNA.',items:['Needs Information — a required fact has not been entered or verified.','Baseline — the approved original plan kept for comparison.','Forecast — the latest calculated likely date from entered facts.','Actual — a date or quantity that really happened and was recorded.','Critical path — the chain of work that controls the forecast finish date.']},
      example:{label:'Example',title:'Try a safe example',intro:'Practice Example opens training data and is clearly separated from production orders.',items:['Return to the home cards and choose Practice Example.','Explore tasks, risks, reports and recovery options without saving a production record.','Create a New TNA when you are ready to enter a real order.']},
      about:{label:'About',title:'About VESA TNA 360',intro:'This workspace plans apparel orders and keeps original, current, forecast and actual dates separate.',items:['Your work is saved only in this browser unless you download a portable copy.','Connected multi-company sharing and automatic message delivery are not active in local mode.','TNA never creates buyer approvals, factory rates or shipment promises for you.']},
      backup:{label:'Data & Backup Help',title:'Save, reopen and recover',intro:'Use these steps if an order or file does not open as expected.',items:['Choose Save TNA before closing the browser, then use Open Saved TNA to reopen it.','Choose Download Saved Copy to keep a portable backup in a folder you control.','If a saved copy is rejected, keep the current order open, choose the original VESA saved copy again, and do not edit the file contents.','If an Excel import is rejected, remove macros and formulas, save a clean workbook, then preview it again.','If saving fails because browser space is full, download copies of important orders before clearing any browser data.']}
    },
    bn:{
      how:{label:'কীভাবে ব্যবহার করবেন',title:'একটি order plan করুন',intro:'যা নিশ্চিত জানেন তা দিয়ে শুরু করুন। বাকি তথ্য না দেওয়া পর্যন্ত স্পষ্টভাবে চিহ্নিত থাকবে।',items:['New TNA বেছে নিন। জরুরি তথ্যের জন্য Quick entry, আর port, date ও color/size quantity-এর জন্য Full entry ব্যবহার করুন।','Needs Information দেখুন এবং শুধু নিশ্চিত date, approval, quantity ও production rate লিখুন।','এই browser-এ order save করুন। প্রয়োজন হলে report বা portable copy দিয়ে হাতে share করুন।']},
      glossary:{label:'শব্দের অর্থ',title:'Planning-এর শব্দ',intro:'TNA-র সব জায়গায় এই শব্দগুলোর একই অর্থ।',items:['Needs Information — প্রয়োজনীয় তথ্য লেখা বা যাচাই করা হয়নি।','Baseline — তুলনার জন্য রাখা অনুমোদিত original plan।','Forecast — লেখা তথ্য থেকে হিসাব করা সর্বশেষ সম্ভাব্য date।','Actual — সত্যিই ঘটে যাওয়া এবং record করা date বা quantity।','Critical path — যে কাজের chain forecast finish date নিয়ন্ত্রণ করে।']},
      example:{label:'উদাহরণ',title:'নিরাপদ example দেখুন',intro:'Practice Example training data খোলে এবং production order থেকে আলাদা থাকে।',items:['Home card-এ ফিরে Practice Example বেছে নিন।','Production record save না করে task, risk, report ও recovery option দেখুন।','Real order লিখতে প্রস্তুত হলে New TNA তৈরি করুন।']},
      about:{label:'এই app সম্পর্কে',title:'VESA TNA 360 সম্পর্কে',intro:'এই workspace apparel order plan করে এবং original, current, forecast ও actual date আলাদা রাখে।',items:['Portable copy download না করলে কাজ শুধু এই browser-এ save থাকে।','Local mode-এ multi-company sharing ও automatic message চালু নেই।','TNA buyer approval, factory rate বা shipment promise নিজে তৈরি করে না।']},
      backup:{label:'Data ও backup সহায়তা',title:'Save, reopen ও recover',intro:'Order বা file ঠিকভাবে না খুললে এই ধাপগুলো অনুসরণ করুন।',items:['Browser বন্ধ করার আগে Save TNA বেছে নিন, পরে Open Saved TNA দিয়ে খুলুন।','নিজের folder-এ backup রাখতে Download Saved Copy বেছে নিন।','Saved copy reject হলে current order খোলা রাখুন, original VESA copy আবার বেছে নিন এবং file-এর লেখা বদলাবেন না।','Excel import reject হলে macro ও formula সরিয়ে clean workbook save করে আবার preview করুন।','Browser-এর জায়গা শেষ হয়ে save fail হলে browser data clear করার আগে গুরুত্বপূর্ণ order-এর copy download করুন।']}
    },
    hi:{
      how:{label:'कैसे उपयोग करें',title:'Order plan करें',intro:'जो जानकारी पक्की है उससे शुरू करें। बाकी जानकारी भरने तक साफ दिखाई देगी।',items:['New TNA चुनें। जरूरी जानकारी के लिए Quick entry और port, date तथा color/size quantity के लिए Full entry उपयोग करें।','Needs Information देखें और केवल पक्की date, approval, quantity तथा production rate भरें।','Order को इस browser में save करें। जरूरत पर report या portable copy से हाथ से share करें।']},
      glossary:{label:'शब्दों का अर्थ',title:'Planning के शब्द',intro:'TNA में इन शब्दों का अर्थ हर जगह एक जैसा है।',items:['Needs Information — जरूरी जानकारी भरी या जाँची नहीं गई है।','Baseline — तुलना के लिए सुरक्षित approved original plan।','Forecast — भरी गई जानकारी से निकली सबसे नई संभावित date।','Actual — सच में हुई और record की गई date या quantity।','Critical path — कामों की वह chain जो forecast finish date तय करती है।']},
      example:{label:'उदाहरण',title:'सुरक्षित example देखें',intro:'Practice Example training data खोलता है और production order से अलग रहता है।',items:['Home cards पर लौटकर Practice Example चुनें।','Production record save किए बिना tasks, risks, reports और recovery options देखें।','Real order भरने के लिए तैयार होने पर New TNA बनाएं।']},
      about:{label:'इस app के बारे में',title:'VESA TNA 360 के बारे में',intro:'यह workspace apparel order plan करता है और original, current, forecast तथा actual dates अलग रखता है।',items:['Portable copy download न करने तक काम केवल इस browser में save रहता है।','Local mode में multi-company sharing और automatic messages चालू नहीं हैं।','TNA buyer approval, factory rate या shipment promise अपने आप नहीं बनाता।']},
      backup:{label:'Data और backup सहायता',title:'Save, reopen और recover',intro:'Order या file सही तरह न खुले तो ये steps अपनाएं।',items:['Browser बंद करने से पहले Save TNA चुनें, फिर Open Saved TNA से खोलें।','अपने folder में backup रखने के लिए Download Saved Copy चुनें।','Saved copy reject हो तो current order खुला रखें, original VESA copy फिर चुनें और file का content न बदलें।','Excel import reject हो तो macros और formulas हटाकर clean workbook save करें, फिर preview करें।','Browser की जगह भरने से save fail हो तो browser data clear करने से पहले जरूरी orders की copies download करें।']}
    },
    ta:{
      how:{label:'எப்படி பயன்படுத்துவது',title:'Order-ஐ plan செய்யுங்கள்',intro:'உறுதியாக தெரிந்த தகவல்களுடன் தொடங்குங்கள். மற்ற தகவல்கள் உள்ளிடும் வரை தெளிவாகக் குறிக்கப்படும்.',items:['New TNA-ஐ தேர்வு செய்யுங்கள். முக்கிய விவரங்களுக்கு Quick entry; port, date, color/size quantity-க்கு Full entry பயன்படுத்துங்கள்.','Needs Information-ஐ பார்த்து உறுதியான date, approval, quantity, production rate மட்டும் உள்ளிடுங்கள்.','Order-ஐ இந்த browser-ல் save செய்யுங்கள். தேவைப்பட்டால் report அல்லது portable copy மூலம் கைமுறையாக share செய்யுங்கள்.']},
      glossary:{label:'சொற்களின் பொருள்',title:'Planning சொற்கள்',intro:'TNA முழுவதும் இந்த சொற்களுக்கு ஒரே பொருள்.',items:['Needs Information — தேவையான தகவல் உள்ளிடப்படவில்லை அல்லது சரிபார்க்கப்படவில்லை.','Baseline — ஒப்பிடுவதற்காக வைத்திருக்கும் approved original plan.','Forecast — உள்ளிடப்பட்ட தகவல்களிலிருந்து கணக்கிடப்பட்ட புதிய சாத்தியமான date.','Actual — உண்மையில் நடந்ததும் record செய்யப்பட்டதும் ஆன date அல்லது quantity.','Critical path — forecast finish date-ஐ கட்டுப்படுத்தும் வேலைகளின் chain.']},
      example:{label:'உதாரணம்',title:'பாதுகாப்பான example-ஐ பாருங்கள்',intro:'Practice Example training data-ஐ திறக்கும்; production order-லிருந்து தனியாக இருக்கும்.',items:['Home cards-க்கு திரும்பி Practice Example-ஐ தேர்வு செய்யுங்கள்.','Production record save செய்யாமல் tasks, risks, reports, recovery options-ஐ பாருங்கள்.','Real order உள்ளிடத் தயாரானதும் New TNA உருவாக்குங்கள்.']},
      about:{label:'இந்த app பற்றி',title:'VESA TNA 360 பற்றி',intro:'இந்த workspace apparel order-ஐ plan செய்து original, current, forecast, actual dates-ஐ தனியாக வைத்திருக்கும்.',items:['Portable copy download செய்யாத வரை வேலை இந்த browser-ல் மட்டும் save ஆகும்.','Local mode-ல் multi-company sharing மற்றும் automatic messages இயங்காது.','TNA buyer approval, factory rate அல்லது shipment promise-ஐ தானாக உருவாக்காது.']},
      backup:{label:'Data மற்றும் backup உதவி',title:'Save, reopen மற்றும் recover',intro:'Order அல்லது file சரியாக திறக்கவில்லை என்றால் இந்த steps-ஐ பின்பற்றுங்கள்.',items:['Browser-ஐ மூடும் முன் Save TNA தேர்வு செய்து, பின்னர் Open Saved TNA மூலம் திறக்கவும்.','உங்கள் folder-ல் backup வைக்க Download Saved Copy தேர்வு செய்யவும்.','Saved copy reject ஆனால் current order-ஐ திறந்தே வைத்து original VESA copy-ஐ மீண்டும் தேர்வு செய்யவும்; file content-ஐ மாற்ற வேண்டாம்.','Excel import reject ஆனால் macros மற்றும் formulas-ஐ நீக்கி clean workbook save செய்து மீண்டும் preview செய்யவும்.','Browser இடம் நிரம்பி save fail ஆனால் browser data clear செய்வதற்கு முன் முக்கிய orders-ன் copies-ஐ download செய்யவும்.']}
    }
  };

  const state={dialog:null,language:'en',currentPlan:null,workspaceFilter:{owner:null,stage:null},workspaceView:'timeline',portfolioFilter:{buyer:null,factory:null,po:null},merchandisingFilter:'all',merchandisingAsOf:'',merchandisingRecordId:null,scenarioDraft:null,scenarioPreview:null,importSession:null};
  const domain=globalThis.VesaTnaDomain;
  const scheduling=globalThis.VesaTnaScheduling;
  const operations=globalThis.VesaTnaOperations;
  const storage=globalThis.VesaTnaStorage;
  const reports=globalThis.VesaTnaReports;
  const scenarios=globalThis.VesaTnaScenarios;
  const integrations=globalThis.VesaTnaIntegrationReferences;
  const notifications=globalThis.VesaTnaNotificationRules;
  const text=key=>(PLAIN_COPY[state.language]||PLAIN_COPY.en)[key]||(COPY[state.language]||COPY.en)[key]||PLAIN_COPY.en[key]||COPY.en[key]||key;
  const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function userKey(){return globalThis.VesaAuth?.userKey?.()||'local-browser-user'}
  function readRecords(){try{return storage?storage.listPlans(userKey()):((JSON.parse(localStorage.getItem(STORE_KEY)||'null')?.records)||[])}catch{return []}}
  function offlineSummary(){try{const items=storage?.listOfflineIntents?.(userKey())||[];return {items,total:items.length,queued:items.filter(item=>item.status==='queued').length,conflicts:items.filter(item=>item.status==='conflict').length,rejected:items.filter(item=>item.status==='rejected').length};}catch{return {items:[],total:0,queued:0,conflicts:0,rejected:0,error:true};}}
  function offlineWorkPanel(summary){const message=summary.error?text('offlineWorkError'):summary.total?text('offlineWorkPending').replace('{count}',String(summary.total)):text('offlineWorkEmpty');return `<div class="tna-panel tna-offline-panel"><h2>${esc(text('offlineWork'))}</h2><p>${esc(message)}</p><div class="tna-dashboard-grid"><article><b>${esc(summary.queued)}</b><span>${esc(text('offlineQueued'))}</span></article><article><b>${esc(summary.conflicts)}</b><span>${esc(text('offlineConflicts'))}</span></article><article><b>${esc(summary.rejected)}</b><span>${esc(text('offlineRejected'))}</span></article></div><p class="tna-note">${esc(text('offlineWorkText'))}</p><button type="button" class="tna-btn secondary" data-offline-work>${esc(text('offlineWorkReview'))}</button></div>`;}
  function readSavedPlans(records){return (records||[]).map(record=>{try{return storage?.loadPlan?.(record.recordId,userKey())||null}catch{return null}}).filter(Boolean)}
  function language(){const pref=globalThis.VesaPrefs?.read?.().language||document.documentElement.lang||'en';return SUPPORTED_LANGUAGES.includes(pref)?pref:'en'}
  function actionCard(key,secondary=false,disabled=false){return `<article class="tna-action-card"><h2>${esc(text(key))}</h2><p>${esc(text(key+'Text'))}</p><button type="button" class="${secondary?'secondary':''}" data-action="${esc(key)}" ${disabled?'disabled':''}>${esc(text(key))}</button></article>`}
  function templateOptions(selected='knit'){return Object.values(domain?.TEMPLATE_PROFILES||{}).map(t=>`<option value="${esc(t.id)}" ${t.id===selected?'selected':''}>${esc(t.name)}</option>`).join('')}
  function field(name,label,type='text',value='',required=false){return `<label><span>${esc(label)}${required?' *':''}</span><input name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" ${required?'required':''}></label>`}
  function selectField(name,label,options,value=''){return `<label><span>${esc(label)}</span><select name="${esc(name)}">${options.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`}
  function textareaField(name,label,placeholder='',rows=5){return `<label class="tna-wide"><span>${esc(label)}</span><textarea name="${esc(name)}" rows="${esc(rows)}" placeholder="${esc(placeholder)}"></textarea></label>`}
  function compareCivil(a,b){if(!a||!b||!scheduling?.toDay)return 0;return scheduling.toDay(a)-scheduling.toDay(b)}
  function planSchedule(plan){const start=plan?.commitments?.orderConfirmedOn||plan?.commitments?.poReceivedOn;const required=plan?.commitments?.buyerRequiredExFactory;if(!plan||!scheduling||!start||!required)return null;const result=scheduling.schedule(plan.tasks,plan.edges,{calendar:plan.calendars[0],calendars:plan.calendars,startDate:start,requiredDate:required,asOfDate:start,nearCriticalDays:3});return result.validity==='valid'?result:null}
  function taskDate(task,scheduled){return task.dates?.actualFinish||task.dates?.currentTargetFinish||task.dates?.forecastFinish||task.dates?.baselineFinish||scheduled?.taskResults?.[task.taskId]?.earlyFinish||null}
  function workspaceData(plan){const scheduled=planSchedule(plan);const asOf=plan.commitments.orderConfirmedOn||plan.commitments.poReceivedOn||null;const rows=plan.tasks.map(task=>({task,date:taskDate(task,scheduled),result:scheduled?.taskResults?.[task.taskId]||null}));const completed=new Set(['completed','approved','waived','not-applicable']);const openRows=rows.filter(row=>!completed.has(row.task.status));const overdue=asOf?openRows.filter(row=>row.date&&compareCivil(row.date,asOf)<0):[];const dueToday=asOf?openRows.filter(row=>row.date&&compareCivil(row.date,asOf)===0):[];const nextSeven=asOf?openRows.filter(row=>row.date&&compareCivil(row.date,asOf)>0&&compareCivil(row.date,scheduling.shiftDate(asOf,7,plan.calendars[0],'calendar'))<=0):[];const critical=scheduled?rows.filter(row=>row.result?.isCritical):[];const ownerCounts=plan.tasks.reduce((acc,task)=>{acc[task.ownerParty]=(acc[task.ownerParty]||0)+1;return acc},{});return {scheduled,asOf,rows,overdue,dueToday,nextSeven,critical,ownerCounts};}
  function portfolioPanel(records){const plans=arguments[1]||[];
    if(!scenarios)return '<div class="tna-panel"><h2>Portfolio</h2><p class="tna-note">Portfolio engine is not loaded.</p></div>';
    const filter=state.portfolioFilter||{};
    const summary=scenarios.portfolioSummary(plans,filter);
    const buyers=[...new Set(plans.map(plan=>plan.order?.buyerName).filter(Boolean))].slice(0,8);
    const factories=[...new Set(plans.map(plan=>plan.order?.factoryName).filter(Boolean))].slice(0,8);
    const poRefs=[...new Set(plans.flatMap(plan=>plan.order?.poNumbers||[]).filter(Boolean))];
    const rows=summary.orders.slice(0,10).map(order=>`<div role="row"><span>${esc(order.style||'Untitled TNA')}</span><span>${esc(order.buyer||'Buyer unknown')} · ${esc(order.factory||'Factory unknown')}</span><span>${esc(order.po||'PO unknown')}</span><span>${esc(order.forecastDate||'Needs Information')} · ${esc(order.risk)}</span></div>`).join('');
    const conflicts=summary.capacity.conflicts.map(item=>`${item.resourceId} on ${item.date}: over by ${item.overAllocatedBy} line(s)`).join(' · ');
    return `<div class="tna-panel tna-portfolio-advanced"><h2>Portfolio & shared capacity</h2><div class="tna-dashboard-grid"><article><b>${esc(summary.accessibleOrderCount)}</b><span>Local orders in view</span></article><article><b>${esc(poRefs.length)}</b><span>PO references</span></article><article><b>${esc(summary.conflictCount)}</b><span>Capacity conflicts</span></article><article><b>${esc(summary.orders.filter(order=>order.risk==='delayed').length)}</b><span>Delayed forecasts</span></article><article><b>${esc(summary.orders.filter(order=>order.risk==='needs-information').length)}</b><span>Needs Information</span></article></div><p class="tna-note">${conflicts?`Shared capacity warning: ${esc(conflicts)}`:'No shared capacity conflict is present in the entered local records.'} Forecast rows retain source revision and engine provenance. Portfolio is browser-local until authenticated backend storage is provisioned. Connected multi-company access remains blocked until an authenticated backend is provisioned.</p><h3>Management filters</h3><div class="tna-stage-chips">${buyers.map(buyer=>`<button type="button" data-portfolio-buyer="${esc(buyer)}" aria-pressed="${filter.buyer===buyer?'true':'false'}">Buyer · ${esc(buyer)}</button>`).join('')}${factories.map(factory=>`<button type="button" data-portfolio-factory="${esc(factory)}" aria-pressed="${filter.factory===factory?'true':'false'}">Factory · ${esc(factory)}</button>`).join('')}${poRefs.slice(0,8).map(po=>`<button type="button" data-portfolio-po="${esc(po)}" aria-pressed="${filter.po===po?'true':'false'}">PO · ${esc(po)}</button>`).join('')}<button type="button" data-clear-portfolio="true">Clear filters</button></div>${summary.orders.length?`<div class="tna-task-table tna-portfolio-table" role="table" aria-label="Local multi-PO portfolio proof">${rows}</div>`:'<p>No saved local order details are available for this portfolio view.</p>'}</div>`;
  }
  function workspacePanel(plan){const data=workspaceData(plan);const filter=state.workspaceFilter||{};const view=state.workspaceView||'timeline';const statusCounts=plan.tasks.reduce((acc,task)=>{acc[task.status]=(acc[task.status]||0)+1;return acc},{});const ownerOptions=Object.keys(data.ownerCounts).slice(0,8);const stageOptions=Object.entries(domain.STAGE_LABELS).filter(([stage])=>plan.tasks.some(task=>task.stageCode===stage));const baseRows=data.rows.filter(row=>(!filter.owner||row.task.ownerParty===filter.owner)&&(!filter.stage||row.task.stageCode===filter.stage));const viewRows=view==='today'?baseRows.filter(row=>data.dueToday.includes(row)||data.nextSeven.includes(row)):view==='critical'?baseRows.filter(row=>row.result?.isCritical):baseRows;const datedRows=viewRows.filter(row=>row.date).slice(0,24);const visibleRows=(datedRows.length?datedRows:viewRows.slice(0,24));const ganttRows=visibleRows.slice(0,10);const activeFilter=[filter.owner?`Owner ${filter.owner}`:null,filter.stage?`Stage ${filter.stage}`:null].filter(Boolean).join(' · ')||'All activities';const viewButtons=[['table','Table'],['timeline','Timeline (Gantt)'],['today','Today / Next 7 Days'],['critical','Critical Only']];return `<section class="tna-workspace-grid" aria-label="TNA dashboard and timeline"><div class="tna-panel"><span class="tna-kicker">Dashboard</span><h3>Action view</h3><div class="tna-dashboard-grid"><article><b>${esc(data.dueToday.length)}</b><span>Due today</span></article><article><b>${esc(data.overdue.length)}</b><span>Overdue</span></article><article><b>${esc(data.nextSeven.length)}</b><span>Next 7 days</span></article><article><b>${esc(data.critical.length)}</b><span>Critical path</span></article></div><p class="tna-note">${data.asOf?`As-of date uses explicit order start ${esc(data.asOf)}. No hidden current-date assumption is used.`:'Enter an explicit order start date to activate due-today, overdue and next-7-day filters.'}</p><p class="tna-note">Active timeline filter: ${esc(activeFilter)} · ${esc(viewRows.length)} visible activities · View ${esc(view)}.</p><h4>Workspace views</h4><div class="tna-stage-chips">${viewButtons.map(([key,label])=>`<button type="button" data-workspace-view="${esc(key)}" aria-pressed="${view===key?'true':'false'}">${esc(label)}</button>`).join('')}</div><h4>Owner filters</h4><div class="tna-stage-chips">${ownerOptions.map(owner=>`<button type="button" data-filter-owner="${esc(owner)}" aria-pressed="${filter.owner===owner?'true':'false'}">${esc(owner)} · ${esc(data.ownerCounts[owner])}</button>`).join('')}</div><h4>Stage filters</h4><div class="tna-stage-chips">${stageOptions.map(([stage,label])=>`<button type="button" data-filter-stage="${esc(stage)}" aria-pressed="${filter.stage===stage?'true':'false'}">${esc(stage)} · ${esc(label)}</button>`).join('')}<button type="button" data-clear-filters="true">Clear filters</button></div></div><div class="tna-panel"><span class="tna-kicker">Timeline</span><h3>${esc(viewButtons.find(([key])=>key===view)?.[1]||'Timeline')}</h3>${data.scheduled&&view!=='table'?`<div class="tna-gantt" aria-hidden="true">${ganttRows.map(row=>`<span style="--tna-bar:${Math.min(100,Math.max(8,(row.result?.floatDays??0)+12))}%"><i>${esc(row.task.templateRef)}</i></span>`).join('')}</div>`:view==='table'?'<p class="tna-note">Table view keeps all calculated date and risk details in text form.</p>':`<p class="tna-note">Timeline needs explicit start and buyer required ex-factory dates. It will not invent dates.</p>`}<div class="tna-task-table tna-timeline-table" role="table" aria-label="Accessible TNA timeline table filtered view">${visibleRows.length?visibleRows.map(row=>`<div role="row"><span>${esc(row.task.templateRef)}</span><span>${esc(row.task.title)}</span><span>${esc(row.task.ownerParty)}</span><span>${esc(row.date||'Needs date')}</span><span>${esc(row.result?.risk||row.task.riskStatus||'needs-information')}</span></div>`).join(''):`<div role="row"><span>No activities match the active filter or view.</span></div>`}</div></div></section>`}
  function currentPlanSaved(plan){return !!plan&&readRecords().some(record=>record.recordId===plan.recordId)}
  function notificationPanel(plan){
    const asOfDate=plan?.commitments?.orderConfirmedOn||plan?.commitments?.poReceivedOn||'';
    if(!notifications)return '';
    if(!asOfDate)return '<section class="tna-panel" aria-label="In-app action alerts"><h3>In-app action alerts</h3><p class="tna-note">Enter an explicit order start or PO received date to evaluate due actions. No current date is guessed.</p></section>';
    const alerts=notifications.buildInAppAlerts(plan,{asOfDate,upcomingDays:7}),counts=alerts.reduce((out,alert)=>{out[alert.rule]=(out[alert.rule]||0)+1;return out},{});
    return `<section class="tna-panel" aria-label="In-app action alerts"><h3>In-app action alerts</h3><div class="tna-dashboard-grid"><article><b>${esc(counts['blocked-action']||0)}</b><span>Blocked</span></article><article><b>${esc(counts['overdue-action']||0)}</b><span>Overdue</span></article><article><b>${esc(counts['due-today']||0)}</b><span>Due today</span></article><article><b>${esc(counts['upcoming-action']||0)}</b><span>Next 7 days</span></article></div>${alerts.length?`<div class="tna-list">${alerts.slice(0,8).map(alert=>`<article data-tna-alert="${esc(alert.rule)}"><b>${esc(alert.templateRef)} · ${esc(alert.title)}</b><p>${esc(alert.message)}</p><small>Owner ${esc(alert.ownerParty)} · ${esc(alert.severity)} · as of ${esc(alert.asOfDate)}</small></article>`).join('')}</div>`:'<p>No due or blocked actions for the explicit as-of date.</p>'}<p class="tna-note">Visible only while this TNA is open. No email, push, SMS or WhatsApp was sent; external delivery remains blocked until an authorized provider and recipient permissions are verified.</p></section>`;
  }
  function orderMasterPanel(plan){
    const order=plan.order||{},commitments=plan.commitments||{},breakdown=order.colorSizeBreakdown||[];
    const rows=breakdown.map(row=>`<div role="row"><span>${esc(row.color)}</span><span>${esc(row.size)}</span><span>${esc(row.quantity)} ${esc(order.unit||'pcs')}</span></div>`).join('');
    return `<section aria-label="Order master"><h3>Order master</h3><div class="tna-report-grid"><span>Market: ${esc(order.destinationMarket||'Needs Information')}</span><span>Loading port: ${esc(order.portOfLoading||'Needs Information')}</span><span>Discharge port: ${esc(order.portOfDischarge||'Needs Information')}</span><span>Terms: ${esc(order.incoterm||'Needs Information')}</span><span>Shipment: ${esc(order.shipmentMethod||'Needs Information')}</span><span>Size range: ${esc(order.styles?.[0]?.sizeRange||'Needs Information')}</span><span>Required ETD: ${esc(commitments.buyerRequiredETD||'Needs Information')}</span><span>Required ETA: ${esc(commitments.buyerRequiredETA||'Needs Information')}</span><span>Destination date: ${esc(commitments.destinationRequiredDate||'Needs Information')}</span></div>${rows?`<div class="tna-task-table tna-order-breakdown" role="table" aria-label="Color and size breakdown"><div role="row"><b>Color</b><b>Size</b><b>Quantity</b></div>${rows}</div>`:'<p class="tna-note">Color / size breakdown is Needs Information.</p>'}</section>`;
  }
  // Source-safe TNA sheet projection only: status/date changes stay with domain.
  function merchandisingPanel(plan){
    if(!globalThis.VesaTnaMerchandisingSheet?.TnaMerchandisingSheet)
      return '<section class="tna-panel"><h3>Garment TNA sheet unavailable</h3><p>Existing TNA data and calculations are unchanged.</p></section>';
    const sheet=new globalThis.VesaTnaMerchandisingSheet.TnaMerchandisingSheet();
    return sheet.render(plan,{language:state.language,filter:state.merchandisingFilter,asOfDate:state.merchandisingAsOf,scheduled:planSchedule(plan)});
  }
  function planPanel(plan){if(!plan)return `<div class="tna-panel"><h2>${esc(text('templateLibrary'))}</h2><p>${esc(text('notSaved'))}</p><p>${Object.values(domain?.TEMPLATE_PROFILES||{}).map(t=>esc(t.name)).join(' · ')}</p></div>`;
    const warnings=plan.validation?.warnings||[];const errors=plan.validation?.errors||[];const unknown=plan.unknownFields||[];const savedNote=plan.mode==='practice'?'Practice example is isolated from real production records and cannot be saved as a production TNA.':currentPlanSaved(plan)?'Saved locally in this browser.':'Draft is not saved yet. Use Save TNA to keep it in this browser.';
    const stageCounts=plan.tasks.reduce((acc,task)=>{acc[task.stageCode]=(acc[task.stageCode]||0)+1;return acc},{});
    return `<div class="tna-panel tna-plan-panel"><div class="tna-plan-head"><div><span class="tna-kicker">${esc(text('workspace'))}</span><h2>${esc(plan.order.styles[0]?.styleNo||'Untitled TNA')} · ${esc(plan.order.buyerName||'Buyer unknown')}</h2><p>${esc(plan.order.factoryName||'Factory unknown')} · ${esc(plan.order.poNumbers[0]||'PO unknown')} · ${esc(plan.order.totalQty??'Qty unknown')} ${esc(plan.order.unit)}</p></div><span class="tna-status-pill">${esc((domain.TEMPLATE_PROFILES[plan.templateId]||{}).name||plan.templateId)}</span></div>
      <div class="tna-metrics"><b>${plan.tasks.length}</b><span>${esc(text('tasks'))}</span><b>${plan.baselineSnapshots.length}</b><span>${esc(text('baseline'))}</span><b>${unknown.length+warnings.length+errors.length}</b><span>${esc(text('validation'))}</span></div>
      <p class="tna-note">${esc(savedNote)}</p>
      ${merchandisingPanel(plan)}
      ${orderMasterPanel(plan)}
      ${unknown.length?`<h3>${esc(text('unknown'))}</h3><ul>${unknown.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}
      ${errors.length?`<h3>Errors</h3><ul>${errors.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}
      ${warnings.length?`<h3>Warnings</h3><ul>${warnings.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}
      ${schedulePanel(plan)}
      ${operationsPanel(plan)}
      ${readinessPanel(plan)}
      ${notificationPanel(plan)}
      ${workspacePanel(plan)}
      ${scenarioPanel(plan)}
      ${splitShipmentPanel(plan)}
      <h3>Stages</h3><div class="tna-stage-chips">${Object.entries(stageCounts).map(([stage,count])=>`<span>${esc(stage)} · ${count}</span>`).join('')}</div>
      <h3>First activities</h3><div class="tna-task-table tna-activity-table" role="table" aria-label="Editable draft TNA activities">${plan.tasks.slice(0,12).map(task=>`<div role="row"><span>${esc(task.templateRef)}</span><span>${esc(task.title)}</span><span>${esc(task.ownerParty)}</span><span>${esc(task.status)}</span><span><button class="tna-mini-btn" type="button" data-edit-task="${esc(task.taskId)}">Edit activity</button></span></div>`).join('')}</div></div>`}
  function openOfflineWork(){const summary=offlineSummary();if(summary.error)return openDialog(text('offlineWork'),`<p>${esc(text('offlineWorkError'))}</p><p class="tna-note">${esc(text('offlineWorkText'))}</p>`);const statusLabel=status=>status==='conflict'?text('offlineConflicts'):status==='rejected'?text('offlineRejected'):status==='sent'?text('offlineSent'):text('offlineQueued');const actionLabel=action=>action==='order.update'?text('offlineOrderChange'):action==='approval.submit'?text('offlineApprovalChange'):text('offlineOtherChange');const rows=summary.items.map(item=>`<article><b>${esc(actionLabel(item.command?.action))}</b><p>${esc(statusLabel(item.status))}</p>${item.status==='conflict'?`<p class="tna-note">${esc(text('offlineConflictNote'))}</p>`:''}</article>`).join('');openDialog(text('offlineWork'),`${summary.total?`<div class="tna-list">${rows}</div>`:`<p>${esc(text('offlineWorkEmpty'))}</p>`}<p class="tna-note">${esc(text('offlineWorkText'))}</p>`);}
  function ensureWorkspaceShell(){
    if(window.__tnaWorkspaceShell||!window.VesaWorkspaceShell)return;
    const shell=new VesaWorkspaceShell.VesaWorkspaceShell({
      root:document.body,
      descriptor:{id:'tna-time-action',name:text('app'),route:'/apps/tna/',userLabel:globalThis.VesaAuth?.session?.()?.name||'',userRole:globalThis.VesaAuth?.session?.()?.role||''},
      callbacks:{menu:name=>openMenu(name.toLowerCase()),settings:()=>openMenu('view')}
    });
    shell.mount();
    const auth=document.querySelector('.app-user-bar');if(auth)auth.after(shell.element);
    document.body.classList.add('tna-vesa-adapted');
    window.__tnaWorkspaceShell=shell;
  }
  function render(){state.language=language();ensureWorkspaceShell();
    if(state.currentPlan&&state.merchandisingRecordId!==state.currentPlan.recordId){
      state.merchandisingRecordId=state.currentPlan.recordId;
      state.merchandisingFilter='all';
      state.merchandisingAsOf='';
    }
    if(!state.currentPlan)state.merchandisingRecordId=null;
const records=readRecords();const offline=offlineSummary();const portfolioPlans=readSavedPlans(records);if(state.currentPlan&&!portfolioPlans.some(plan=>plan.recordId===state.currentPlan.recordId))portfolioPlans.unshift(state.currentPlan);const root=document.getElementById('tnaMain');root.innerHTML=`
    <section class="tna-hero">
      <div class="tna-hero-card"><span class="tna-kicker">${esc(text('tag'))}</span><h1>${esc(text('title'))}</h1><p class="tna-lead">${esc(text('lead'))}</p><p class="tna-note">${esc(text('privacy'))}</p></div>
      <aside class="tna-status-card"><span class="tna-status-pill">${esc(text('mode'))}</span><p class="tna-muted">${esc(text('modeText'))}</p><p class="tna-muted">${esc(text('cloud'))}</p></aside>
    </section>
    ${state.currentPlan?planPanel(state.currentPlan):''}
    <section class="tna-grid" aria-label="TNA home actions">
      ${actionCard('new')}${actionCard('save',true,!state.currentPlan)}${actionCard('continue',true,records.length===0)}${actionCard('open',true)}${actionCard('download',true,!state.currentPlan)}${actionCard('copy',true)}${actionCard('practice',true)}${actionCard('orders',true)}
    </section>
    <section class="tna-two">
      ${offlineWorkPanel(offline)}
      <div class="tna-panel"><h2>${esc(text('recent'))}</h2><div class="tna-list">${records.length?records.map(r=>`<article><b>${esc(r.style||'Untitled TNA')}</b><p>${esc(r.buyer||'Buyer unknown')} · ${esc(r.po||'PO unknown')} · ${esc(r.updatedAt||'No saved time')}</p></article>`).join(''):`<article>${esc(text('empty'))}</article>`}</div></div>
      ${portfolioPanel(records,portfolioPlans)}
    </section>
    ${state.currentPlan?'':planPanel(state.currentPlan)}
    <p class="tna-footer-note">VESA Enterprise Inc. · Powered by EGENVA · ${esc(text('mode'))}</p>
    <dialog class="tna-dialog" id="tnaDialog"><div class="tna-dialog-head"><h2 id="tnaDialogTitle"></h2><button type="button" aria-label="Close">×</button></div><div class="tna-dialog-body" id="tnaDialogBody"></div></dialog>`;
    state.dialog=document.getElementById('tnaDialog');state.dialog.querySelector('button').onclick=()=>state.dialog.close();
    window.__tnaWorkspaceShell?.setSavedState(state.currentPlan?(currentPlanSaved(state.currentPlan)?'saved':'unsaved'):'saved');
    root.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>openAction(btn.dataset.action));
    root.querySelectorAll('[data-offline-work]').forEach(btn=>btn.onclick=openOfflineWork);
    root.querySelectorAll('[data-filter-owner]').forEach(btn=>btn.onclick=()=>{state.workspaceFilter={...(state.workspaceFilter||{}),owner:btn.dataset.filterOwner||null};render();});
    root.querySelectorAll('[data-filter-stage]').forEach(btn=>btn.onclick=()=>{state.workspaceFilter={...(state.workspaceFilter||{}),stage:btn.dataset.filterStage||null};render();});
    root.querySelectorAll('[data-clear-filters]').forEach(btn=>btn.onclick=()=>{state.workspaceFilter={owner:null,stage:null};render();});
    root.querySelectorAll('[data-workspace-view]').forEach(btn=>btn.onclick=()=>{state.workspaceView=btn.dataset.workspaceView||'timeline';render();});
    root.querySelectorAll('[data-tna-sheet-filter]').forEach(input=>input.onchange=()=>{
      state.merchandisingFilter=input.value;
      render();
      document.getElementById('tnaMerchSheet')?.scrollIntoView({behavior:'auto',block:'start'});
    });
    root.querySelectorAll('[data-tna-sheet-asof]').forEach(input=>input.onchange=()=>{
      state.merchandisingAsOf=input.value;
      render();
      document.getElementById('tnaMerchSheet')?.scrollIntoView({behavior:'auto',block:'start'});
    });
    root.querySelectorAll('[data-portfolio-buyer]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={...(state.portfolioFilter||{}),buyer:btn.dataset.portfolioBuyer||null};render();});
    root.querySelectorAll('[data-portfolio-factory]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={...(state.portfolioFilter||{}),factory:btn.dataset.portfolioFactory||null};render();});
    root.querySelectorAll('[data-portfolio-po]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={...(state.portfolioFilter||{}),po:btn.dataset.portfolioPo||null};render();});
    root.querySelectorAll('[data-clear-portfolio]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={buyer:null,factory:null,po:null};render();});
    root.querySelectorAll('[data-open-capacity]').forEach(btn=>btn.onclick=openCapacityEntry);
    root.querySelectorAll('[data-add-shipment-lot]').forEach(btn=>btn.onclick=openShipmentLotEntry);
    const scenarioForm=document.getElementById('tnaScenarioForm');if(scenarioForm)scenarioForm.onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());state.scenarioDraft={...data,durationUnits:Number(data.durationUnits),verifiedDailyOutput:data.verifiedDailyOutput};state.scenarioPreview=scenarios.previewScenario(state.currentPlan,{name:data.name,durationAdjustments:[{taskId:data.taskId,durationUnits:Number(data.durationUnits),reason:data.name}],capacity:data.verifiedDailyOutput?{plannedQty:state.currentPlan.order.totalQty,completedQty:0,verifiedDailyOutput:Number(data.verifiedDailyOutput)}:undefined},{actorId:userKey()});render();};
    root.querySelectorAll('[data-apply-scenario]').forEach(btn=>btn.onclick=openScenarioApply);
    root.querySelectorAll('[data-edit-task]').forEach(btn=>btn.onclick=()=>openTaskEdit(btn.dataset.editTask));
    root.querySelectorAll('[data-tna-order-details]').forEach(btn=>btn.onclick=openOrderDetails);
  }
  function openDialog(title,body){document.getElementById('tnaDialogTitle').textContent=title;document.getElementById('tnaDialogBody').innerHTML=body;if(!state.dialog.open)state.dialog.showModal();}
  function openHelp(action){const id=String(action).replace(/^help-/,'');const topic=(HELP_TOPICS[state.language]||HELP_TOPICS.en)[id]||HELP_TOPICS.en[id];if(!topic)return;openDialog(topic.title,`<article data-help-topic="${esc(id)}"><p>${esc(topic.intro)}</p><ol>${topic.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ol></article>`);}
  function openMenu(name){const help=HELP_TOPICS[state.language]||HELP_TOPICS.en;const items=name==='help'?Object.entries(help).map(([id,item])=>({action:`help-${id}`,label:item.label})):(MENUS[name]||[]).map(item=>({action:item,label:item}));const note=name==='file'?'Save, reopen and protected backup are available here. Excel preview rejects macros and warns about formulas.':name==='help'?(help.how?.intro||HELP_TOPICS.en.how.intro):text('unavailable');openDialog(text('menuTitle')+' · '+text(name),`<div class="menu-grid">${items.map(item=>`<button class="tna-btn secondary" type="button" data-menu-action="${esc(item.action)}">${esc(item.label)}</button>`).join('')}</div><p class="tna-note">${esc(note)}</p>`);document.querySelectorAll('[data-menu-action]').forEach(btn=>btn.onclick=()=>{const action=btn.dataset.menuAction;if(action.startsWith('help-'))return openHelp(action);if(action==='New TNA')return openWizard('quick');if(action==='Open Saved TNA')return openSavedList();if(action==='Save Now')return saveNow();if(action==='Make Another Copy'||action==='Download Saved Copy')return downloadCopy();if(action==='Open Saved Copy')return openSavedCopyDialog();if(action==='Import Excel TNA')return openImportPreview();if(action==='Add Activity')return openCustomTask();if(action==='Edit Order')return openOrderDetails();if(action==='Production Capacity')return openCapacityEntry();if(action==='Shipment Lots')return openShipmentLotEntry();if(action==='Linked Records')return openLinkedRecords();if(action==='Recovery Scenarios'){document.getElementById('tnaScenarioForm')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return state.dialog?.close();}if(action==='Offline Work')return openOfflineWork();if(['Prepare Report','Download Report','Print Report','Share Report'].includes(action))return openReportPanel(action);return openDialog(action,`<p>${esc(text('unavailable'))}</p>`);});}
  function openAction(action){if(action==='new')return openWizard('quick');if(action==='practice')return createPractice();if(action==='save')return saveNow();if(action==='continue')return continueLast();if(action==='open'||action==='orders')return openSavedList();if(action==='copy')return openSavedCopyDialog();if(action==='download')return downloadCopy();openDialog(text(action)||action,`<p>${esc(text(action+'Text')||text('unavailable'))}</p><p class="tna-note">${esc(text('unavailable'))}</p>`);}
  function openWizard(mode){const isFull=mode==='full';const body=`<form class="tna-wizard" id="tnaWizard">
      <div class="tna-tabs"><button type="button" data-wizard-tab="quick" class="${mode==='quick'?'active':''}">${esc(text('quick'))}</button><button type="button" data-wizard-tab="full" class="${mode==='full'?'active':''}">${esc(text('full'))}</button><button type="button" data-wizard-tab="excel" class="${mode==='excel'?'active':''}">${esc(text('excel'))}</button></div>
      ${mode==='excel'?excelEntry():standardEntry(isFull)}
      <p class="tna-note">${esc(mode==='excel'?'Review the matched columns before creating an order. Formula cells are flagged and no existing order is overwritten.':'Missing buyer, factory, style, PO, quantity or ex-factory date will stay marked as Needs Information. Full entry accepts one Color | Size | Quantity row per line. No dates, ports or quantities are guessed.')}</p>
      <button class="tna-btn" type="submit">${esc(text('createDraft'))}</button></form>`;
    openDialog(text('new'),body);
    document.querySelectorAll('[data-wizard-tab]').forEach(btn=>btn.onclick=()=>openWizard(btn.dataset.wizardTab));
    document.getElementById('tnaWizard').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());data.processFlags=Array.from(event.currentTarget.querySelectorAll('[name="processFlags"]:checked')).map(input=>input.value);state.currentPlan=domain.createPlan(data,{ownerUserId:userKey()});if(storage)storage.autosave(state.currentPlan,userKey());state.dialog.close();render();};
  }
  function standardEntry(isFull){return `<div class="tna-form-grid">
      ${selectField('templateId','Product template',Object.values(domain.TEMPLATE_PROFILES).map(t=>[t.id,t.name]),'knit')}
      ${field('buyerName','Buyer','text','',true)}${field('factoryName','Factory','text','',true)}${field('styleNo','Style','text','',true)}${field('poNumber','PO / order reference','text','',true)}${field('totalQty','Total quantity','number','',true)}${field('buyerRequiredExFactory','Buyer required ex-factory','date','',true)}
      ${isFull?`${field('orderConfirmedOn','Explicit start / order confirmed date','date')}${field('poReceivedOn','PO received date','date')}${field('brand','Brand')}${field('destinationMarket','Destination / market')}${field('portOfLoading','Port of loading')}${field('portOfDischarge','Port of discharge')}${field('buyerRequiredETD','Buyer required ETD','date')}${field('buyerRequiredETA','Buyer required ETA','date')}${field('destinationRequiredDate','Destination required date','date')}${field('fabricSpec','Fabric specification')}${selectField('fabricRoute','Fabric route',[['unknown','Unknown'],['local-ready','Local ready fabric'],['local-manufactured','Local manufactured'],['imported-finished','Imported finished'],['imported-greige','Imported greige / yarn']], 'unknown')}${field('techPackRevision','Tech pack revision')}${field('composition','Composition')}${field('sizeRange','Size range')}${field('incoterm','Incoterm')}${field('shipmentMethod','Shipment method')}${textareaField('colorSizeBreakdown','Color / size breakdown','Navy | S | 250\nNavy | M | 350')}`:''}
    </div><fieldset class="tna-checks"><legend>Conditional processes</legend>${[['print','Print'],['embroidery','Embroidery'],['aop','AOP / strike-off'],['wash','Wash / garment dye'],['performance','Performance test']].map(([v,l])=>`<label><input type="checkbox" name="processFlags" value="${esc(v)}"> ${esc(l)}</label>`).join('')}</fieldset>`}
  function excelEntry(){return `<div class="tna-form-grid">${field('buyerName','Buyer from sheet')}${field('factoryName','Factory from sheet')}${field('styleNo','Style from sheet')}${field('poNumber','PO from sheet')}${field('totalQty','Quantity from sheet','number')}${field('buyerRequiredExFactory','Ex-factory from sheet','date')}${selectField('templateId','Template mapping',Object.values(domain.TEMPLATE_PROFILES).map(t=>[t.id,t.name]),'custom')}</div><label class="tna-wide"><span>Reviewed import notes / unmatched columns</span><textarea name="commercialNotes" rows="5" placeholder="Paste header mapping notes here. This does not overwrite any existing TNA."></textarea></label>`}
  function createPractice(){state.currentPlan=domain.createPlan({templateId:'denim',buyerName:'Training Buyer',factoryName:'Training Factory',styleNo:'DENIM-PRACTICE',poNumber:'TRAINING-PO',totalQty:1200,buyerRequiredExFactory:'2026-11-30',processFlags:['wash'],fabricRoute:'local-manufactured'},{mode:'practice',ownerUserId:'practice'});render();}
  function schedulePanel(plan){if(!scheduling)return '';
    const start=plan.commitments.orderConfirmedOn||plan.commitments.poReceivedOn;
    const required=plan.commitments.buyerRequiredExFactory;
    if(!start||!required)return `<h3>Schedule</h3><p class="tna-note">Schedule unavailable: enter an explicit start date and buyer required ex-factory date. No date is invented from PO or today.</p>`;
    const result=scheduling.schedule(plan.tasks,plan.edges,{calendar:plan.calendars[0],calendars:plan.calendars,startDate:start,requiredDate:required,asOfDate:start});
    if(result.validity!=='valid')return `<h3>Schedule</h3><p class="tna-note">Schedule unavailable: ${esc([...result.missingInputs,...result.errors].join(', '))}</p>`;
    return `<h3>Schedule</h3><div class="tna-stage-chips"><span>Forecast · ${esc(result.project.forecastDate)}</span><span>${result.project.workingDaysEarlyOrLate>0?'Late':'Float'} · ${esc(result.project.workingDaysEarlyOrLate)} working day(s)</span><span>Critical chains · ${esc(result.project.criticalPaths.length)}</span></div><p class="tna-note">Calculated forecast only. Baseline/current/actual dates are not overwritten.</p>`;
  }
  function operationsPanel(plan){if(!operations)return '';
    const cap=operations.verifiedRateDays({plannedQty:plan.order.totalQty,completedQty:0,verifiedDailyOutput:null});
    const commercial=operations.compareCommercial(plan.commitments,plan.materials,plan.calendars[0]);
    return `<h3>Operational checks</h3><div class="tna-stage-chips"><span>Contract lead · ${esc(commercial.lead.status)}</span><span>Capacity · ${esc(cap.status)}</span><span>Material gates · ${esc(plan.materials.length||'none entered')}</span></div><p class="tna-note">Capacity, material release, approvals and shipment release fail closed until verified inputs/evidence are entered. No LC date, approval, QC release or production rate is guessed.</p>`;
  }
  function statusCounts(items,key='status'){return items.reduce((acc,item)=>{const value=item[key]||'needs-information';acc[value]=(acc[value]||0)+1;return acc},{})}
  function countLine(counts,order){return order.map(key=>`${key}: ${counts[key]||0}`).join(' · ')}
  function readinessPanel(plan){if(!operations)return '';
    const materials=plan.materials||[];
    const approvals=plan.approvals||[];
    const operationRows=plan.operations||[];
    const lots=plan.shipmentLots||[];
    const commercial=operations.compareCommercial(plan.commitments,materials,plan.calendars[0]);
    const materialStates=materials.map(material=>operations.materialReadiness(material));
    const materialCounts=statusCounts(materialStates);
    const approvalStates=approvals.map(approval=>operations.approvalState(approval));
    const approvalCounts=statusCounts(approvalStates);
    const capacity=operations.verifiedRateDays({plannedQty:plan.order.totalQty,completedQty:0,verifiedDailyOutput:null});
    const operationResults=operationRows.map(op=>operations.validateOperationQuantity(op));
    const operationErrors=operationResults.filter(result=>!result.ok);
    const shipment=operations.shipmentSummary(plan.order.totalQty,lots,{status:'not-entered'});
    const shipmentErrors=[...shipment.errors];
    if(!lots.length)shipmentErrors.push('No shipment lots entered; final inspection pass is required before release.');
    const materialMessage=materials.length?countLine(materialCounts,['ready','blocked','needs-information']):'No material records entered; material readiness remains needs-information.';
    const approvalMessage=approvals.length?countLine(approvalCounts,['approved','waived','pending','blocked','rejected','needs-information']):'No approval submissions entered; approvals cannot be assumed.';
    const capacityMessage=capacity.status==='calculated'?`${capacity.remainingQty} remaining qty · ${capacity.workingDays} verified working day(s)`: 'Verified daily output is missing; capacity remains needs-information.';
    const shipmentMessage=shipmentErrors.length?shipmentErrors.join(' '):`${shipment.shippedQty} shipped · ${shipment.remainingQty} remaining · final inspection pass recorded.`;
    return `<section class="tna-readiness-grid" aria-label="TNA readiness workspaces">
      <article class="tna-readiness-card"><span class="tna-kicker">Materials & Commercial</span><h3>Materials & Commercial</h3><div class="tna-readiness-list"><span>Contract lead · ${esc(commercial.lead.status)}</span><span>Master LC · ${esc(commercial.masterLcOpenedOn||'not entered')}</span><span>B2B LC milestones · ${esc(commercial.b2bLcMilestones.length)}</span><span>Buyer/contract differences · ${esc(commercial.discrepancies.length)}</span></div><p class="tna-note">${esc(materialMessage)}</p></article>
      <article class="tna-readiness-card"><span class="tna-kicker">Approvals</span><h3>Approvals</h3><div class="tna-readiness-list"><span>Total approval records · ${esc(approvals.length)}</span><span>Approved · ${esc(approvalCounts.approved||0)}</span><span>Pending/blocked · ${esc((approvalCounts.pending||0)+(approvalCounts.blocked||0)+(approvalCounts.rejected||0)+(approvalCounts['needs-information']||0))}</span></div><p class="tna-note">${esc(approvalMessage)}</p></article>
      <article class="tna-readiness-card"><span class="tna-kicker">Production & Capacity</span><h3>Production & Capacity</h3><div class="tna-readiness-list"><span>Operation rows · ${esc(operationRows.length)}</span><span>Quantity errors · ${esc(operationErrors.length)}</span><span>Capacity status · ${esc(capacity.status)}</span></div><p class="tna-note">${esc(capacityMessage)} No production rate is guessed.</p><button class="tna-btn secondary" type="button" data-open-capacity="true">Enter reviewed capacity</button></article>
      <article class="tna-readiness-card"><span class="tna-kicker">Shipment & Readiness</span><h3>Shipment & Readiness</h3><div class="tna-readiness-list"><span>Lots · ${esc(lots.length)}</span><span>Passed qty · ${esc(shipment.passedQty)}</span><span>Shipped qty · ${esc(shipment.shippedQty)}</span><span>Remaining qty · ${esc(shipment.remainingQty)}</span></div><p class="tna-note">${esc(shipmentMessage)}</p></article>
    </section>`;
  }
  function splitShipmentPanel(plan){
    if(!operations?.reconcileShipmentLots)return '';
    const result=operations.reconcileShipmentLots(plan.order?.totalQty,plan.shipmentLots||[],{inspectionPassed:plan.finalInspectionDecision?.status==='passed'});
    const messages=[...(result.errors||[]),...(result.warnings||[])];
    const lotRows=(plan.shipmentLots||[]).map(lot=>`<div role="row"><span>${esc(lot.lotReference||lot.lotId||'Unnamed lot')}</span><span>${esc(lot.plannedQty)} planned · ${esc(lot.packedQty||0)} packed · ${esc(lot.passedQty||0)} passed</span><span>${esc(lot.shippedQty||0)} shipped · ${esc(lot.remainingQty??Math.max(0,Number(lot.plannedQty||0)-Number(lot.shippedQty||0)))} remaining</span><span>${esc(lot.ETD||'ETD not entered')} / ${esc(lot.ETA||'ETA not entered')}</span></div>`).join('');
    return `<section class="tna-advanced-grid" aria-label="Split shipment reconciliation"><article class="tna-panel"><span class="tna-kicker">Shipment quantities</span><h3>Split shipment reconciliation</h3><div class="tna-dashboard-grid"><article><b>${esc(result.plannedQty)}</b><span>Planned lots</span></article><article><b>${esc(result.passedQty)}</b><span>Passed</span></article><article><b>${esc(result.shippedQty)}</b><span>Shipped</span></article><article><b>${esc(result.remainingQty??'Needs Information')}</b><span>Remaining</span></article></div><p class="tna-note">${messages.length?esc(messages.join(' ')):result.wholeOrderShipped?'Whole order shipped from reconciled lots.':'Lots are balanced so far; the order remains open until the full quantity is shipped.'}</p>${lotRows?`<div class="tna-task-table tna-lot-table" role="table" aria-label="Entered shipment lots"><div role="row"><span>Lot</span><span>Planned / packed / passed</span><span>Shipped / remaining</span><span>ETD / ETA</span></div>${lotRows}</div>`:'<p>No shipment lots entered yet.</p>'}<button class="tna-btn secondary" type="button" data-add-shipment-lot="true">Add shipment lot</button></article></section>`;
  }
  function scenarioPanel(plan){
    if(!scenarios)return '';
    const taskOptions=plan.tasks.filter(task=>Number(task.durationUnits)>0).slice(0,40);
    const fallback=taskOptions[0]||plan.tasks[0];
    const draft=state.scenarioDraft&&taskOptions.some(task=>task.taskId===state.scenarioDraft.taskId)?state.scenarioDraft:{name:'Verified recovery option',taskId:fallback?.taskId||'',durationUnits:fallback?.durationUnits||0,verifiedDailyOutput:''};
    const preview=state.scenarioPreview?.branch?.baseRecordId===plan.recordId&&state.scenarioPreview?.branch?.baseRevision===plan.revision?state.scenarioPreview:null;
    const taskLabel=task=>`${task.templateRef} · ${task.title}`;
    const result=preview?.branch;
    const gained=result?.workingDaysGained;
    return `<section class="tna-advanced-grid" aria-label="Recovery scenarios"><article class="tna-panel tna-scenario-panel"><span class="tna-kicker">Recovery & scenarios</span><h3>Compare a recovery option</h3><p class="tna-note">Preview changes against revision ${esc(plan.revision)}. The accepted TNA and baseline stay unchanged until you explicitly confirm an apply reason.</p><form id="tnaScenarioForm" class="tna-form-grid"><label><span>Scenario name</span><input name="name" value="${esc(draft.name)}"></label><label><span>Activity to adjust</span><select name="taskId">${taskOptions.map(task=>`<option value="${esc(task.taskId)}" ${task.taskId===draft.taskId?'selected':''}>${esc(taskLabel(task))}</option>`).join('')}</select></label><label><span>Candidate duration</span><input name="durationUnits" type="number" min="0" step="1" value="${esc(draft.durationUnits)}"></label><label><span>Verified daily output (optional)</span><input name="verifiedDailyOutput" type="number" min="0" step="1" value="${esc(draft.verifiedDailyOutput)}"></label><div class="tna-wide"><button class="tna-btn" type="submit">Preview recovery option</button></div></form>${result?`<div class="tna-scenario-result"><h4>${esc(result.name)}</h4><div class="tna-dashboard-grid"><article><b>${esc(result.baseForecastDate||'Needs Information')}</b><span>Base forecast</span></article><article><b>${esc(result.scenarioForecastDate||'Needs Information')}</b><span>Scenario forecast</span></article><article><b>${esc(gained==null?'Needs Information':gained)}</b><span>Working days gained (+ earlier)</span></article><article><b>${esc(result.changedCriticalTaskIds.length)}</b><span>Critical tasks changed</span></article></div><p class="tna-note">${result.violations.length?`Needs review: ${esc(result.violations.join(' '))}`:`Preview is feasible from the entered inputs. Forecast provenance: revision ${esc(result.forecastProvenance.inputRevision)} · ${esc(result.forecastProvenance.engineVersion||'schedule unavailable')}.`}</p><p>Critical chain before: ${esc(result.comparison.criticalTaskIdsBefore.join(', ')||'none')}<br>Critical chain after: ${esc(result.comparison.criticalTaskIdsAfter.join(', ')||'none')}<br>Shared resource conflicts: ${esc(result.comparison.resourceConflictsBefore)} → ${esc(result.comparison.resourceConflictsAfter)}</p><button class="tna-btn" type="button" data-apply-scenario="true">Apply this scenario as a new revision</button></div>`:'<p class="tna-note">No scenario preview yet. Enter only verified changes; blank capacity remains Needs Information.</p>'}</article></section>`;
  }
  function openCapacityEntry(){
    if(!state.currentPlan)return openDialog('Enter reviewed capacity','<p>Create or open a TNA draft before entering capacity.</p>');
    if(state.currentPlan.mode==='practice')return openDialog('Enter reviewed capacity','<p>Practice example is isolated and cannot receive production capacity evidence.</p>');
    const operationTypes=[['cut','Cutting'],['sew','Sewing'],['wash','Wash'],['finish','Finish'],['pack','Packing'],['inspect','Inspection']];
    openDialog('Enter reviewed capacity',`<form class="tna-wizard" id="tnaCapacityEntry"><div class="tna-form-grid">${selectField('operationType','Operation type',operationTypes,'sew')}${field('operationId','Existing operation ID (optional)')}${field('resourceId','Factory line / resource','text','',true)}${field('date','Capacity date','date','',true)}${field('allocatedLines','Allocated lines','number','',true)}${field('availableLines','Available lines','number','',true)}${field('lotId','Lot reference (optional)')}${field('unit','Unit','text',state.currentPlan.order?.unit||'pcs')}</div><p class="tna-note">Enter only a reviewed line and date. An entry above available lines is saved as an explicit conflict for management review; no production rate or capacity is inferred.</p><button class="tna-btn" type="submit">Record capacity entry</button></form>`);
    document.getElementById('tnaCapacityEntry').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());const result=domain.addCapacityEntry(state.currentPlan,{type:data.operationType,operationId:data.operationId,resourceId:data.resourceId,date:data.date,allocatedLines:data.allocatedLines,availableLines:data.availableLines,lotId:data.lotId,unit:data.unit},{actorId:userKey()});if(!result.ok)return openDialog('Enter reviewed capacity',`<p>${esc(result.error||(result.errors||[]).join(' '))}</p>`);state.currentPlan=result.plan;state.scenarioPreview=null;if(storage)storage.autosave(state.currentPlan,userKey());state.dialog.close();render();openDialog('Capacity entry recorded',`<p>Reviewed capacity was recorded as revision ${esc(result.plan.revision)}.</p>${result.warnings?.length?`<p class="tna-note">${esc(result.warnings.join(' '))}</p>`:'<p>No same-plan entry conflict was detected.</p>'}`);};
  }
  function openShipmentLotEntry(){
    if(!state.currentPlan)return openDialog('Add shipment lot','<p>Create or open a TNA draft before adding shipment lots.</p>');
    if(state.currentPlan.mode==='practice')return openDialog('Add shipment lot','<p>Practice example is isolated and cannot receive production shipment evidence.</p>');
    const defaultPo=state.currentPlan.order?.poNumbers?.[0]||'';
    openDialog('Add shipment lot',`<form class="tna-wizard" id="tnaShipmentLotEntry"><div class="tna-form-grid">${field('lotReference','Lot reference','text','',true)}${field('poNumber','PO allocation','text',defaultPo,true)}${field('plannedQty','Planned quantity','number','',true)}${field('packedQty','Packed quantity','number','0')}${field('passedQty','Passed quantity','number','0')}${field('shippedQty','Shipped quantity','number','0')}${field('requestedExFactory','Requested ex-factory','date')}${field('currentExFactory','Current ex-factory','date')}${field('forecastExFactory','Forecast ex-factory','date')}${field('ETD','ETD','date')}${field('ETA','ETA','date')}${field('destinationReceipt','Destination receipt','date')}${field('shipmentMethod','Shipment method','text',state.currentPlan.order?.shipmentMethod||'')}${field('bookingRef','Booking reference')}${field('inspectionRef','Inspection reference')}${selectField('status','Lot status',[['open','Open'],['packed','Packed'],['ready','Ready for shipment'],['partial','Partially shipped'],['shipped','Shipped'],['hold','On hold']],'open')}</div><p class="tna-note">Lot quantities must reconcile in order: packed ≤ planned, passed ≤ packed, shipped ≤ passed. Shipment release still requires a separately verified final inspection pass; this form never creates that approval.</p><button class="tna-btn" type="submit">Record shipment lot</button></form>`);
    document.getElementById('tnaShipmentLotEntry').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());const result=domain.addShipmentLot(state.currentPlan,data,{actorId:userKey()});if(!result.ok)return openDialog('Add shipment lot',`<p>${esc(result.error||(result.errors||[]).join(' '))}</p>`);state.currentPlan=result.plan;state.scenarioPreview=null;if(storage)storage.autosave(state.currentPlan,userKey());state.dialog.close();render();openDialog('Shipment lot recorded',`<p>Lot ${esc(result.lot.lotReference)} was recorded as revision ${esc(result.plan.revision)}.</p><p class="tna-note">The split-shipment totals were recomputed locally. Final inspection approval remains separate and was not inferred.</p>`);};
  }
  function openScenarioApply(){
    if(!state.currentPlan||!state.scenarioPreview?.branch)return openDialog('Apply scenario','<p>Preview a recovery option before applying it.</p>');
    openDialog('Confirm scenario revision',`<form class="tna-wizard" id="tnaScenarioApply"><p>This creates a new local revision and keeps the original baseline snapshots. It does not claim buyer approval or cloud collaboration.</p>${state.scenarioPreview.branch.violations.length?`<p class="tna-note">Review first: ${esc(state.scenarioPreview.branch.violations.join(' '))}</p>`:''}<label class="tna-wide"><span>Revision reason *</span><textarea name="reason" rows="4" required placeholder="Explain the verified recovery decision"></textarea></label><label><input type="checkbox" name="confirm" required> I confirm this scenario should create a new revision.</label><button class="tna-btn" type="submit">Confirm and apply</button></form>`);
    document.getElementById('tnaScenarioApply').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());const result=scenarios.applyScenario(state.currentPlan,state.scenarioPreview.branch,{actorId:userKey(),reason:data.reason,confirm:data.confirm==='on'});if(!result.ok)return openDialog('Apply scenario',`<p>${esc(result.error)}</p>`);state.currentPlan=result.plan;if(storage)storage.autosave(state.currentPlan,userKey());state.scenarioPreview=null;state.scenarioDraft=null;render();openDialog('Scenario applied',`<p>Recovery option applied as revision ${esc(result.plan.revision)}. Baseline snapshots remain preserved.</p>`);};
  }

  /**
   * TNA garment follow-up forms are application-owned, not a parallel business
   * engine. Commands call pure domain revisions, then validated browser autosave.
   * Existing records and unsigned/confirmed date distinctions are preserved.
   */
  function merchandisingLabels(){
    const labels=globalThis.VesaTnaMerchandisingSheet?.LANGUAGES||{};
    return labels[state.language]||labels.en||{};
  }
  function applyMerchandisingEdit(result){
    const errorNode=document.getElementById('tnaEditError');
    if(!result?.ok){
      if(errorNode)errorNode.textContent=result?.error||'Changes could not be checked. No data was modified.';
      return;
    }
    if(result.unchanged){state.dialog.close();render();return;}
    try{
      // Practice changes may be explored, but must not enter the real autosave.
      if(storage&&result.plan.mode!=='practice')storage.autosave(result.plan,userKey());
      state.currentPlan=result.plan;
      state.dialog.close();
      render();
    }catch(error){
      if(errorNode)errorNode.textContent='Save failed. Your original TNA is unchanged. '+String(error?.message||'Browser storage unavailable.');
    }
  }
  function openOrderDetails(){
    if(!state.currentPlan)return openDialog('Edit Order','<p>Create or open an order first.</p>');
    const plan=state.currentPlan,order=plan.order||{},commit=plan.commitments||{},t=merchandisingLabels();
    const body='<form class="tna-wizard" id="tnaOrderDetails">'+
      '<p>'+esc(t.warning)+'</p><div class="tna-form-grid">'+
      field('fabricWeightGsm',t.gsm,'number',order.fabricWeightGsm??'')+
      selectField('masterLcStatus',t.lcStatus,domain.MASTER_LC_STATUSES.map(item=>[item,item.replace(/-/g,' ')]),commit.masterLcStatus||'unknown')+
      field('masterLcOpenedOn',t.lc,'date',commit.masterLcOpenedOn||'')+
      field('masterLcProofRef',t.lcRef,'text',commit.masterLcProofRef||'')+
      field('sourceRef',t.sourceRef)+field('reason',t.reason)+
      '</div><p class="tna-note">'+esc(t.calendarHelp)+'</p>'+
      '<p id="tnaEditError" role="alert" aria-live="assertive"></p>'+
      '<button class="tna-btn" type="submit">'+esc(t.saveOrder)+'</button></form>';
    openDialog(t.editOrder,body);
    const revision=plan.revision;
    document.getElementById('tnaOrderDetails').onsubmit=event=>{
      event.preventDefault();
      const data=Object.fromEntries(new FormData(event.currentTarget).entries());
      applyMerchandisingEdit(domain.reviseMerchandisingOrder(state.currentPlan,data,{
        actorId:userKey(),expectedRevision:revision
      }));
    };
  }
  function openTaskEdit(taskId){
    if(!state.currentPlan)return openDialog('Edit Activity','<p>Create or open a TNA draft first.</p>');
    const plan=state.currentPlan,task=plan.tasks.find(item=>item.taskId===taskId);
    if(!task)return openDialog('Edit Activity','<p>Activity not found in this order.</p>');
    const t=merchandisingLabels(),dates=task.dates||{};
    const waitingOptions=[['',t.missing],['buyer',t.filters.buyer],
      ['local-office',t.filters.local],['factory',t.filters.factory],
      ['fabric-supplier','Fabric supplier'],['trim-supplier','Trims supplier'],
      ['merchant','Merchandising'],['logistics','Shipping / Logistics']];
    const authorityOptions=[['',t.missing],['buyer','Buyer'],['local-office','Bangladesh local office'],
      ['factory','Factory'],['other','Other (source required)']];
    const body='<form class="tna-wizard" id="tnaTaskEdit">'+
      '<p><b>'+esc(task.templateRef)+'</b> · '+esc(task.title)+'</p>'+
      '<div class="tna-form-grid">'+
      selectField('nextStatus',t.status,domain.STATUSES.map(item=>[item,t.statuses[item]||item]),task.status)+
      field('ownerParty',t.owner,'text',task.ownerParty||'')+
      selectField('waitingFor',t.waiting,waitingOptions,task.waitingFor||'')+
      field('plannedDate',t.planned,'date',dates.baselineFinish||'')+
      field('revisedDate',t.revised,'date',dates.currentTargetFinish||'')+
      field('actualDate',t.actual,'date',dates.actualFinish||'')+
      field('evidenceRef',t.proof)+
      field('sourceRef',t.sourceRef)+
      selectField('authorityParty',t.authority,authorityOptions,'')+
      field('reason',t.reason)+
      '</div><p class="tna-note">'+esc(t.dateLegend)+' '+esc(t.warning)+'</p>'+
      '<p id="tnaEditError" role="alert" aria-live="assertive"></p>'+
      '<button class="tna-btn" type="submit">'+esc(t.saveActivity)+'</button></form>';
    openDialog(t.update,body);
    const revision=plan.revision;
    document.getElementById('tnaTaskEdit').onsubmit=event=>{
      event.preventDefault();
      const data=Object.fromEntries(new FormData(event.currentTarget).entries());
      applyMerchandisingEdit(domain.reviseMerchandisingTask(state.currentPlan,taskId,data,{
        actorId:userKey(),expectedRevision:revision
      }));
    };
  }
  function openCustomTask(){if(!state.currentPlan)return openDialog('Add Activity',`<p>Create a draft TNA first, then add custom checkpoints to that draft.</p>`);
    openDialog('Add Activity',`<form class="tna-wizard" id="tnaCustomTask"><div class="tna-form-grid">${field('title','Activity title','text','',true)}${selectField('stageCode','Stage',Object.entries(domain.STAGE_LABELS).map(([k,v])=>[k,`${k} · ${v}`]),'O')}${field('ownerParty','Owner party','text','merchant')}${field('durationUnits','Duration units','number','0')}</div><p class="tna-note">Custom activities are added as optional draft checkpoints with audit history. They do not change baseline snapshots silently.</p><button class="tna-btn" type="submit">Add Activity</button></form>`);
    document.getElementById('tnaCustomTask').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());const result=domain.addCustomTask(state.currentPlan,data,{actorId:globalThis.VesaAuth?.userKey?.()||'local-browser-user'});if(result.ok){state.currentPlan=result.plan;state.dialog.close();render();}else openDialog('Add Activity',`<p>${esc(result.error||(result.errors||[]).join(', '))}</p>`);};
  }
  function linkedRecordCards(){
    const refs=state.currentPlan?.integrationReferences||[];
    if(!refs.length)return '<p id="tnaLinkedEmpty">No PPM or AQL reference is linked. Add a manually verified reference below.</p>';
    return `<div class="tna-list">${refs.map(ref=>`<article data-linked-reference="${esc(ref.id)}"><b>${esc(ref.sourceApp.toUpperCase())} · ${esc(ref.sourceRecordId)}</b><p>${esc(integrations.displayStatus(ref))}</p><p>Schema ${esc(ref.sourceSchema)} · version ${esc(ref.sourceVersion||'not recorded')}</p><p>Verified by ${esc(ref.verifiedBy)} · ${esc(ref.verifiedAt)}</p><p class="tna-note">Buyer ${esc(ref.orderIdentity.buyer)} · Factory ${esc(ref.orderIdentity.factory)} · PO ${esc(ref.orderIdentity.po)} · Style ${esc(ref.orderIdentity.style)}</p><div class="menu-grid"><a class="tna-btn secondary" href="${esc(ref.route)}">Open ${esc(ref.sourceApp.toUpperCase())}</a><button class="tna-btn secondary" type="button" data-remove-linked="${esc(ref.id)}">Remove reference</button></div></article>`).join('')}</div>`;
  }
  function openLinkedRecords(){
    if(!integrations)return openDialog('Linked Records','<p>Integration reference checks are not loaded.</p>');
    if(!state.currentPlan)return openDialog('Linked Records','<p>Create or open a TNA before adding references.</p>');
    if(state.currentPlan.mode==='practice')return openDialog('Linked Records','<p>Practice examples cannot be linked as business evidence.</p>');
    const identity=integrations.orderIdentity(state.currentPlan),policy=integrations.SOURCE_POLICIES.ppm;
    openDialog('Linked Records',`${linkedRecordCards()}<section aria-labelledby="tnaLinkEditorTitle"><h3 id="tnaLinkEditorTitle">Add a verified reference</h3><p class="tna-note">Enter details shown on the source record. This reference does not copy another app's saved information or create an approval.</p><form class="tna-wizard" id="tnaLinkedRecordForm"><div class="tna-form-grid">${selectField('sourceApp','Source app',[['ppm','PPM'],['aql','AQL']],'ppm')}${field('sourceRecordId','Source record ID','text','',true)}${field('sourceSchema','Record format','text',policy.schema,true)}${field('sourceVersion','Source version','text','',true)}${selectField('recordedStatus','Recorded source status',policy.statuses.map(value=>[value,value]),'UNSET')}${field('verifiedBy','Verified by','text','',true)}${field('verifiedAt','Verification time','datetime-local','',true)}${field('buyer','Buyer identity','text',identity.buyer,true)}${field('factory','Factory identity','text',identity.factory,true)}${field('po','PO identity','text',identity.po,true)}${field('style','Style identity','text',identity.style,true)}</div><button class="tna-btn" type="submit">Add verified reference</button><p id="tnaLinkedStatus" role="status" aria-live="polite"></p></form></section>`);
    const source=document.querySelector('[name="sourceApp"]'),schema=document.querySelector('[name="sourceSchema"]'),status=document.querySelector('[name="recordedStatus"]');
    source.onchange=()=>{const next=integrations.SOURCE_POLICIES[source.value];schema.value=next.schema;status.innerHTML=next.statuses.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');};
    document.getElementById('tnaLinkedRecordForm').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries()),result=integrations.attachReference(state.currentPlan,{id:`REF-${data.sourceApp.toUpperCase()}-${Date.now().toString(36)}`,sourceApp:data.sourceApp,sourceRecordId:data.sourceRecordId,sourceSchema:data.sourceSchema,sourceVersion:data.sourceVersion,recordedStatus:data.recordedStatus,verifiedBy:data.verifiedBy,verifiedAt:data.verifiedAt,orderIdentity:{buyer:data.buyer,factory:data.factory,po:data.po,style:data.style}},{actorId:userKey()});const output=document.getElementById('tnaLinkedStatus');if(!result.ok){output.textContent=result.error;return;}try{storage.savePlan(result.plan,userKey());state.currentPlan=result.plan;openLinkedRecords();}catch(error){output.textContent=error.message;}};
    document.querySelectorAll('[data-remove-linked]').forEach(button=>button.onclick=()=>{if(!window.confirm('Remove this reference from the TNA? The source record will not be changed.'))return;const result=integrations.removeReference(state.currentPlan,button.dataset.removeLinked,{actorId:userKey()});if(!result.ok)return openDialog('Linked Records',`<p>${esc(result.error)}</p>`);try{storage.savePlan(result.plan,userKey());state.currentPlan=result.plan;openLinkedRecords();}catch(error){openDialog('Linked Records',`<p>${esc(error.message)}</p>`);}});
  }
  function continueLast(){const records=readRecords();if(!records.length)return openSavedList();return loadSavedRecord(records[0].recordId);}
  function openSavedList(){const records=readRecords();const body=records.length?`<div class="tna-list">${records.map(record=>`<article><b>${esc(record.style||'Untitled TNA')}</b><p>${esc(record.buyer||'Buyer unknown')} · ${esc(record.po||'PO unknown')} · ${esc(record.updatedAt||'No saved time')}</p><button class="tna-btn secondary" type="button" data-open-record="${esc(record.recordId)}">Open this TNA</button></article>`).join('')}</div>`:`<p>${esc(text('empty'))}</p><p class="tna-note">Create a New TNA, then use Save TNA to make it appear here.</p>`;openDialog('Open Saved TNA',body);document.querySelectorAll('[data-open-record]').forEach(btn=>btn.onclick=()=>loadSavedRecord(btn.dataset.openRecord));}
  function loadSavedRecord(recordId){try{const plan=storage.loadPlan(recordId,userKey());if(!plan)return openDialog('Open Saved TNA','<p>Saved TNA not found in this browser.</p>');state.currentPlan=plan;render();openDialog('Open Saved TNA',`<p>Opened local TNA.</p><p><b>${esc(plan.order.styles?.[0]?.styleNo||'Untitled TNA')}</b> · ${esc(plan.order.buyerName||'Buyer unknown')} · ${esc(plan.order.poNumbers?.[0]||'PO unknown')}</p>`);}catch(error){openDialog('Open Saved TNA',`<p>${esc(error.message)}</p>`);}}
  function openSavedCopyDialog(){openDialog(text('savedCopy'),`<p>Paste a VESA TNA saved copy below, or choose the saved copy from your computer.</p><label class="tna-wide"><span>Saved copy contents</span><textarea id="tnaSavedCopyText" rows="8" placeholder="Paste the saved copy here"></textarea></label><input id="tnaSavedCopyFile" type="file" accept=".json,.tna,application/json"><div class="menu-grid"><button class="tna-btn" type="button" data-import-copy="paste">Open pasted copy</button><button class="tna-btn secondary" type="button" data-import-copy="file">Open selected file</button></div><p class="tna-note">The copy is checked for the correct VESA TNA format, size and integrity before it is saved locally. Your current order stays open if the check fails.</p>`);document.querySelector('[data-import-copy="paste"]').onclick=()=>importSavedCopyText(document.getElementById('tnaSavedCopyText').value);document.querySelector('[data-import-copy="file"]').onclick=()=>{const file=document.getElementById('tnaSavedCopyFile').files?.[0];if(!file)return openDialog(text('savedCopy'),'<p>Select a VESA TNA saved copy first.</p>');const reader=new FileReader();reader.onload=()=>importSavedCopyText(String(reader.result||''));reader.onerror=()=>openDialog(text('savedCopy'),'<p>The selected file could not be read. Choose the original saved copy and try again.</p>');reader.readAsText(file);};}
  function importSavedCopyText(value){try{const plan=storage.importCopy(value);state.currentPlan=plan;const saved=storage.savePlan(plan,userKey());render();openDialog(text('savedCopy'),`<p>Saved copy opened and saved locally.</p><p><b>${esc(saved.style||'Untitled TNA')}</b> · ${esc(saved.po||'PO unknown')}</p>`);}catch(error){openDialog(text('savedCopy'),`<p>${esc(error.message)}</p>`);}}
  function reportOptions(){return reports.catalogue(state.language).map(item=>`<option value="${esc(item.id)}">${esc(item.id)} · ${esc(item.title)} · ${esc(item.audience)}</option>`).join('')}
  function reportModel(reportId,extra={}){return reports.buildReportModel(state.currentPlan,{reportId,language:state.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,...extra})}
  function markReportPrint(){document.body.classList.add('tna-printing-report');const clear=()=>document.body.classList.remove('tna-printing-report');window.addEventListener('afterprint',clear,{once:true});setTimeout(clear,2000);}

  /**
   * R01 only: split the 13-column XLSX master into two printable, repeated
   * header tables so every dated fact and evidence field remains legible.
   * This reads the same validated model as the workbook; never edits a plan.
   */
  function masterReportPreview(model){
    const master=model.masterSheet,t=master.labels||{},o=master.order||{};
    const cell=value=>esc(value===null||value===undefined||value===''?t.missing||'Needs Information':value);
    let html='<section class="tna-report-master" aria-label="Complete garment master TNA">';
    html+='<h3>'+esc(t.title||'Garment Master TNA')+'</h3>';
    html+='<div class="tna-report-master-facts">'+[
      [t.fabric||'Fabric',o.fabricSpec],
      [t.gsm||'GSM',o.fabricWeightGsm],
      [t.lcStatus||'Master LC status',o.masterLcStatus],
      [t.lc||'Master LC opened',o.masterLcOpenedOn],
      [t.lcRef||'LC source',o.masterLcProofRef]
    ].map(pair=>'<span><b>'+esc(pair[0])+':</b> '+cell(pair[1])+'</span>').join('')+'</div>';
    const tables=[
      {
        headings:[t.stage||'Section',t.activity||'Activity',t.owner||'Owner',
          t.planned||'Planned',t.revised||'Revised',t.forecast||'Forecast',t.actual||'Actual'],
        values:row=>[row.stage,row.activity,row.owner,row.planned,row.revised,row.forecast,row.actual]
      },
      {
        headings:[t.activity||'Activity',t.delay||'Days delay',t.status||'Status',
          t.waiting||'Waiting for',t.proof||'Approval/source',
          t.remarks||'Remarks','Predecessors'],
        values:row=>[row.activity,row.delayDays,t.statuses?.[row.status]||row.status,
          row.waiting,row.proof,row.remarks,row.predecessors]
      }
    ];
    for(const [index,definition] of tables.entries()){
      html+='<div class="tna-report-master-scroll"><table class="tna-report-master-table" data-tna-report-part="'+(index+1)+'">';
      html+='<thead><tr>'+definition.headings.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>';
      for(const row of master.rows)html+='<tr>'+definition.values(row).map(cellValue=>'<td>'+cell(cellValue)+'</td>').join('')+'</tr>';
      html+='</tbody></table></div>';
    }
    html+='<p class="tna-note">'+esc(master.evidenceStatus)+'</p>';
    return html+'</section>';
  }
  // Buyer report preview must consume sanitized R02 model only, not the plan.
  function buyerReportPreview(data){
    const t=data.labels,cell=value=>esc(value==null||value===''?t.unknown:value);
    const tables=[
      {heads:[t.ref,t.milestone,t.original,t.current,t.forecast,t.actual],
       cells:row=>[row.ref,row.title,row.original,row.current,row.forecast,row.actual]},
      {heads:[t.ref,t.status,t.action,t.verification],
       cells:row=>[row.ref,row.status,row.buyerAction,row.verification]}
    ];
    let html='<section class="tna-report-buyer" aria-label="'+esc(t.milestones)+'">';
    html+='<h3>'+esc(t.milestones)+'</h3><p class="tna-note">'+esc(data.sourceDisclosure)+'</p>';
    for(const [index,table] of tables.entries()){
      html+='<div class="tna-report-buyer-scroll"><table class="tna-report-buyer-table" data-buyer-part="'+(index+1)+'"><thead><tr>'+
        table.heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>';
      for(const row of data.milestones)html+='<tr>'+table.cells(row).map(v=>'<td>'+cell(v)+'</td>').join('')+'</tr>';
      if(!data.milestones.length)html+='<tr><td colspan="'+table.heads.length+'">'+esc(t.noMilestones)+'</td></tr>';
      html+='</tbody></table></div>';
    }
    html+='<h3>'+esc(t.actions)+'</h3>';
    if(data.actions.length){
      html+='<div class="tna-report-buyer-scroll"><table class="tna-report-buyer-table"><thead><tr>'+
        [t.ref,t.milestone,t.action,t.current].map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>';
      for(const action of data.actions)html+='<tr>'+[
        action.ref,action.title,action.request,action.target
      ].map(v=>'<td>'+cell(v)+'</td>').join('')+'</tr>';
      html+='</tbody></table></div>';
    }else html+='<p>'+esc(t.noActions)+'</p>';
    html+='<div class="tna-report-grid">'+
      '<span>'+esc(t.requested)+': '+cell(data.requestedExFactory)+'</span>'+
      '<span>'+esc(t.confirmed)+': '+cell(data.buyerConfirmedTarget)+'</span></div></section>';
    return html;
  }
  // R03 local factory-only report. No guessed review date and no plan writes.
  function dailyReportPreview(data){
    const t=data.labels,show=value=>esc(value==null||value===''?t.unknown:value);
    let html='<section class="tna-report-daily" aria-label="'+esc(t.activity)+'">';
    if(!data.ready)return html+'<p role="status" class="tna-note">'+esc(t.selectDate)+'</p></section>';
    html+='<h3>'+esc(t.asOf)+': '+show(data.asOfDate)+'</h3>';
    html+='<p class="tna-note">'+esc(t.source)+' '+esc(t.calendar)+'</p>';
    for(const key of ['overdue','today','nextSeven','needsDate']){
      const rows=data.sections[key]||[];
      html+='<section class="tna-report-daily-section" data-daily-group="'+esc(key)+'">';
      html+='<h3>'+esc(t[key])+' · '+rows.length+'</h3>';
      if(!rows.length)html+='<p>'+esc(t.noActions)+'</p>';
      else{
        const parts=[
          {head:[t.ref,t.activity,t.department,t.target,t.original,t.revised,t.forecast,t.actual],
            values:row=>[row.ref,row.activity,row.department,row.due,row.original,row.revised,row.forecast,row.actual]},
          {head:[t.ref,t.status,t.waiting,t.reason,t.followup,t.recovery,t.proof],
            values:row=>[row.ref,row.status,row.waiting,row.reason,row.followup,row.recovery,row.proof]}
        ];
        for(const [index,part] of parts.entries()){
          html+='<div class="tna-report-daily-scroll"><table class="tna-report-daily-table" data-daily-part="'+(index+1)+'"><thead><tr>'+
            part.head.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>';
          html+=rows.map(row=>'<tr>'+part.values(row).map(value=>'<td>'+show(value)+'</td>').join('')+'</tr>').join('');
          html+='</tbody></table></div>';
        }
      }
      html+='</section>';
    }
    html+='<p class="tna-note">'+esc(t.dueMeaning)+'</p>';
    html+='</section>';
    return html;
  }
  function reportPreviewHtml(model){
    const order=model.order;
    let html='<article class="tna-report-preview"><h2>'+esc(model.title)+'</h2>';
    html+='<p><b>'+esc(model.brand)+'</b> · '+esc(model.reportId)+' · '+esc(model.audience)+'</p>';
    html+='<p>'+esc(model.labels.generated)+': '+esc(model.generatedLabel)+' · '+esc(model.labels.timezone)+': '+esc(model.timezone)+' · '+esc(model.labels.revision)+': '+esc(model.revision)+'</p>';
    html+='<h3>'+esc(model.headings.order)+'</h3><div class="tna-report-grid">';
    html+=[
      [model.labels.buyer,order.buyer],...(model.buyerTna?[]:[[model.labels.factory,order.factory]]),
      [model.labels.style,order.style],[model.labels.po,order.po],
      [model.labels.quantity,String(order.quantity)+' '+String(order.unit)],
      [model.labels.required,order.requiredExFactory]
    ].map(([label,value])=>'<span>'+esc(label)+': '+esc(value)+'</span>').join('')+'</div>';
    if(model.factoryDaily)html+=dailyReportPreview(model.factoryDaily);
    else if(model.buyerTna)html+=buyerReportPreview(model.buyerTna);
    else if(model.masterSheet)html+=masterReportPreview(model);
    else{
      html+='<h3>'+esc(model.headings.tasks)+'</h3><div class="tna-task-table tna-report-table" role="table" aria-label="TNA report activity preview">';
      html+=(model.tasks||[]).map(task=>'<div role="row"><span>'+esc(task.ref)+'</span><span>'+esc(task.title)+'</span><span>'+esc(task.owner)+'</span><span>'+esc(task.status)+'</span><span>'+esc(task.forecast||task.actual||task.current||task.baseline||'Needs Information')+'</span></div>').join('')+'</div>';
    }
    html+='<h3>'+esc(model.headings.warnings)+'</h3>';
    html+=model.warnings.length?'<ul>'+model.warnings.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>':'<p>No validation warnings in this local draft.</p>';
    html+='<p class="tna-note">'+esc(model.notes.join(' '))+'</p></article>';
    return html;
  }
  function openReportPanel(action='Prepare Report'){
    if(!reports)return openDialog('Reports','<p>Reports are temporarily unavailable. Keep the order open and try again.</p>');
    if(!state.currentPlan)return openDialog('Reports','<p>Create or open a TNA before preparing reports.</p>');
    if(state.currentPlan.mode==='practice')return openDialog('Reports','<p>Practice example reports are preview-only and cannot be used as business evidence.</p>');
    const first=reports.catalogue(state.language)[0];
    const dailyWords=reportModel('R03').factoryDaily.labels;
    openDialog('Reports',
      '<div class="tna-form-grid">'+
      '<label><span>Report type</span><select id="tnaReportType">'+reportOptions()+'</select></label>'+
      '<label><span>Language</span><input readonly value="'+esc(state.language)+'"></label>'+
      '<label id="tnaReportAsOfWrap" hidden><span>'+esc(dailyWords.asOf)+'</span>'+
        '<input id="tnaReportAsOf" type="date" aria-required="true"></label></div>'+
      '<p id="tnaReportGate" role="status" aria-live="polite" class="tna-note"></p>'+
      '<div class="menu-grid">'+
      '<button class="tna-btn" type="button" data-report-action="preview">Preview report</button>'+
      '<button class="tna-btn secondary" type="button" data-report-action="download">Download report data</button>'+
      '<button class="tna-btn secondary" type="button" data-report-action="excel">Download report Excel</button>'+
      '<button class="tna-btn secondary" type="button" data-report-action="print">Print report</button>'+
      '<button class="tna-btn secondary" type="button" data-report-action="share">Share fallback</button></div>'+
      '<div id="tnaReportPreview">'+reportPreviewHtml(reportModel(first.id))+'</div>');
    const type=document.getElementById('tnaReportType');
    const review=document.getElementById('tnaReportAsOf');
    const reviewWrap=document.getElementById('tnaReportAsOfWrap');
    const gate=document.getElementById('tnaReportGate');
    const currentModel=()=>reportModel(type.value,type.value==='R03'?{asOfDate:review.value}:{});
    const update=()=>{
      reviewWrap.hidden=type.value!=='R03';
      const model=currentModel();
      gate.textContent=model.factoryDaily&&!model.factoryDaily.ready?model.factoryDaily.labels.selectDate:'';
      document.getElementById('tnaReportPreview').innerHTML=reportPreviewHtml(model);
      return model;
    };
    type.onchange=update;
    review.onchange=update;
    review.oninput=update;
    document.querySelectorAll('[data-report-action]').forEach(btn=>btn.onclick=()=>{
      const model=currentModel();
      // All R03 exports, print and share are blocked until a valid explicit date.
      if(model.factoryDaily&&!model.factoryDaily.ready)return update();
      if(btn.dataset.reportAction==='preview')return update();
      if(btn.dataset.reportAction==='print'){update();markReportPrint();return window.print();}
      if(btn.dataset.reportAction==='share')return openDialog('Share fallback',
        '<p>'+esc(model.labels.shareFallback)+'</p>'+
        '<p>A shared link is unavailable in local mode. Download the report and share it through an approved channel.</p>');
      if(btn.dataset.reportAction==='excel'){
        try{
          const data=storage.exportReportWorkbook(model);
          const blob=new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
          const url=URL.createObjectURL(blob),link=document.createElement('a');
          link.href=url;
          link.download=('vesa-tna-'+model.reportId+'-'+model.order.style+'.xlsx').replace(/[^a-z0-9_.-]+/gi,'-');
          document.body.appendChild(link);link.click();link.remove();
          setTimeout(()=>URL.revokeObjectURL(url),1000);return;
        }catch(error){return openDialog('Download report Excel','<p>'+esc(error.message)+'</p>');}
      }
      const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;
      link.download=('vesa-tna-'+model.reportId+'-'+model.order.style+'.json').replace(/[^a-z0-9_.-]+/gi,'-');
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  // Excel selection is short-lived, in-memory and isolated from saved TNA
  // records. This first reviewed import supports order-level rows only.
  function importWords(){
    const langs=globalThis.VesaTnaImportReview?.LOCALES||{};
    return langs[state.language]||langs.en||{};
  }
  function importReviewError(message){
    const node=document.getElementById('tnaImportReviewFeedback')||document.getElementById('tnaImportPreviewResult');
    if(node)node.textContent=String(message||'Review could not be completed.');
  }
  function startExcelReview(file,bytes){
    try{
      const importer=globalThis.VesaTnaImportReview;
      if(!importer?.parseWorkbook)throw Error('Excel review is unavailable. The selected file was not saved.');
      const snapshot=importer.parseWorkbook(bytes,file.name);
      const suggested=importer.suggestWorksheet(snapshot);
      const suggestedActivity=globalThis.VesaTnaActivityImport?.suggestSheet(snapshot,suggested.name);
      state.importSession={snapshot,activitySettings:{enabled:false,sheetName:suggestedActivity?.name||suggested.name,
        headerRow:suggestedActivity?.headerRow||1,dateFormat:'iso',durationBasis:'working',
        fsZeroConfirmed:false,advancedLinksConfirmed:false,mapping:null,rowBindings:{}},settings:{
        sheetName:suggested.name,headerRow:suggested.row,recordRow:suggested.row+1,dateFormat:'iso',
        basis:'calendar',templateId:'knit',mapping:null
      },reviewed:null};
      renderWorkbookMapping();
    }catch(error){state.importSession=null;importReviewError(error.message);}
  }
  function renderWorkbookMapping(){
    const session=state.importSession,importer=globalThis.VesaTnaImportReview,t=importWords();
    const activityImport=globalThis.VesaTnaActivityImport,at=activityImport?.LABELS?.[state.language]||activityImport?.LABELS?.en;
    const activitySettings=session?.activitySettings;
    const rootNode=document.getElementById('tnaImportPreviewResult');
    if(!rootNode||!session||!importer)return;
    const setting=session.settings,snap=session.snapshot;
    let details;
    try{details=importer.describe(snap,setting.sheetName,setting.headerRow);}
    catch(error){importReviewError(error.message);return;}
    if(!setting.mapping)setting.mapping={...details.mapping};
    if(!details.dataRows.some(row=>row.line===Number(setting.recordRow)))
      setting.recordRow=details.dataRows[0]?.line||'';
    const htmlOptions=(items,current)=>items.map(([v,label])=>
      '<option value="'+esc(v)+'" '+(String(v)===String(current)?'selected':'')+'>'+esc(label)+'</option>').join('');
    const mapFields=importer.FIELD_IDS.map(id=>{
      const choices=[[-1,t.missing||'Not mapped'],...details.headers.map((value,index)=>
        [index,(index+1)+': '+(value||'Unnamed column')])];
      return '<label><span>'+esc(t.fields?.[id]||id.replace(/([A-Z])/g,' $1'))+'</span><select name="map-'+esc(id)+'">'+
        htmlOptions(choices,setting.mapping[id]??-1)+'</select></label>';
    }).join('');
    const allRows=details.dataRows.map(item=>[item.line,'Row '+item.line+' · '+item.values.slice(0,6).join(' | ').slice(0,115)]);
    const preview=details.dataRows.slice(0,4).map(item=>
      '<tr><th scope="row">'+esc(item.line)+'</th><td>'+item.values.map(x=>esc(String(x??''))).join(' | ')+'</td></tr>').join('');
    // GMR-04B is explicitly opt-in. GMR-04A order-only imports continue
    // unchanged unless the user selects an activity worksheet and mapping.
    let activityFields='';
    if(activityImport&&activitySettings?.enabled){
      let activityDesc=null;
      try{activityDesc=activityImport.describe(snap,activitySettings);}catch(error){
        activityFields='<p role="alert">'+esc(error.message)+'</p>';
      }
      if(activityDesc){
        if(!activitySettings.mapping)activitySettings.mapping={...activityDesc.mapping};
        const mapCols=activityImport.FIELD_IDS.map(id=>{
          const options=[[-1,at.missing],...activityDesc.info.headers.map((head,index)=>[index,(index+1)+': '+(head||'Unnamed')])];
          return '<label><span>'+esc(id.replace(/([A-Z])/g,' $1'))+'</span><select name="activity-map-'+esc(id)+'">'+
            htmlOptions(options,activitySettings.mapping[id]??-1)+'</select></label>';
        }).join('');
        activityFields='<h4>'+esc(at.mapping)+'</h4><div class="tna-form-grid">'+mapCols+'</div>'+
          '<p class="tna-note">'+esc(at.count)+': '+activityDesc.info.dataRows.length+'</p>';
      }
      activityFields='<div class="tna-form-grid">'+
        selectField('activitySheetName',at.sheet,snap.sheetNames.map(name=>[name,name]),activitySettings.sheetName)+
        field('activityHeaderRow',at.header,'number',activitySettings.headerRow,true)+
        selectField('activityDateFormat',at.date,[['iso','YYYY-MM-DD'],['dmy','DD/MM/YYYY'],['mdy','MM/DD/YYYY'],['excel','Excel date serial']],activitySettings.dateFormat)+
        selectField('activityDurationBasis',at.basis,[['working','Working days; factory calendar unverified'],['calendar','Calendar days']],activitySettings.durationBasis)+
        '</div>'+activityFields+
        '<label><input type="checkbox" name="fsZeroConfirmed" '+(activitySettings.fsZeroConfirmed?'checked':'')+'> '+esc(at.dependency)+'</label>'+
        '<label><input type="checkbox" name="advancedLinksConfirmed" '+(activitySettings.advancedLinksConfirmed?'checked':'')+'> '+esc(at.advanced)+'</label>'+
        '<p class="tna-note">'+esc(at.format)+'</p>'+
        '<p class="tna-note">'+esc(at.tip)+'</p>';
    }
    rootNode.innerHTML='<form id="tnaWorkbookMapping" class="tna-import-stage">'+
      '<h3>'+esc(t.title)+'</h3>'+
      '<p class="tna-note">'+esc(activitySettings?.enabled?'Review both the order row and all activity/dependency rows before creating a NEW draft.':t.warning)+'</p>'+ 
      '<p class="tna-note">'+esc(t.rows)+': '+details.dataRows.length+'</p>'+
      '<div class="tna-form-grid">'+
      selectField('sheetName',t.sheet,snap.sheetNames.map(name=>[name,name]),setting.sheetName)+
      field('headerRow',t.header,'number',setting.headerRow,true)+
      selectField('recordRow',t.dataRow,allRows,setting.recordRow)+
      selectField('dateFormat',t.date,[['iso','YYYY-MM-DD'],['dmy','DD/MM/YYYY'],['mdy','MM/DD/YYYY'],['excel','Excel number/date serial']],setting.dateFormat)+
      selectField('basis',t.basis,[['calendar','Calendar days'],['working','Working days (calendar unverified)']],setting.basis)+
      selectField('templateId',t.profile,Object.values(domain.TEMPLATE_PROFILES).map(v=>[v.id,v.name]),setting.templateId)+
      '</div><h4>'+esc(t.map)+'</h4><div class="tna-form-grid">'+mapFields+'</div>'+
      '<div class="tna-import-row-preview" tabindex="0"><table><thead><tr><th>Row</th><th>Workbook cells (preview only)</th></tr></thead><tbody>'+
      (preview||'<tr><td colspan="2">No order rows were found.</td></tr>')+'</tbody></table></div>'+
      '<p class="tna-note">'+esc(t.noOverwrite)+'</p>'+ 
      (activityImport?'<label><input type="checkbox" name="includeActivities" '+(activitySettings?.enabled?'checked':'')+'> '+esc(at.include)+'</label>':'')+
      activityFields+
      (activitySettings?.enabled?'':'<p class="tna-note">Activities and dependencies are NOT imported in Order-only mode.</p>')+
      '<button type="submit" class="tna-btn">'+esc(t.review)+'</button></form>'+
      '<div id="tnaWorkbookDecision"></div><p id="tnaImportReviewFeedback" role="alert" aria-live="polite"></p>';
    const form=document.getElementById('tnaWorkbookMapping');
    const collect=()=>{
      const data=Object.fromEntries(new FormData(form).entries()),mapping={};
      for(const fieldId of importer.FIELD_IDS)mapping[fieldId]=Number(data['map-'+fieldId]);
      return {sheetName:data.sheetName,headerRow:Number(data.headerRow),recordRow:Number(data.recordRow),
        dateFormat:data.dateFormat,basis:data.basis,templateId:data.templateId,mapping};
    };
    const collectActivity=()=>{
      const data=new FormData(form),prior=session.activitySettings,activityMap={};
      for(const id of activityImport?.FIELD_IDS||[])activityMap[id]=Number(data.get('activity-map-'+id)??prior.mapping?.[id]??-1);
      const hasActivityControls=!!form.querySelector('[name="activity-map-activityRef"]');
      return {enabled:data.has('includeActivities'),
        sheetName:String(data.get('activitySheetName')||prior.sheetName),
        headerRow:Number(data.get('activityHeaderRow')||prior.headerRow),
        dateFormat:String(data.get('activityDateFormat')||prior.dateFormat),
        durationBasis:String(data.get('activityDurationBasis')||prior.durationBasis),
        fsZeroConfirmed:data.has('fsZeroConfirmed'),advancedLinksConfirmed:data.has('advancedLinksConfirmed'),
        mapping:hasActivityControls?activityMap:prior.mapping,rowBindings:{...prior.rowBindings}};
    };
    form.onchange=event=>{
      session.settings=collect();
      session.activitySettings=collectActivity();
      session.reviewed=null;session.activityReviewed=null;
      document.getElementById('tnaWorkbookDecision').innerHTML='';
      const key=event.target.name;
      if(['sheetName','headerRow','includeActivities','activitySheetName','activityHeaderRow'].includes(key)){
        if(key==='sheetName')session.settings.headerRow=importer.suggestHeaderRow(snap,session.settings.sheetName).row;
        if(key==='sheetName'||key==='headerRow'){session.settings.mapping=null;session.settings.recordRow='';}
        if(key==='activitySheetName'){
          const best=activityImport.suggestSheet(snap,session.settings.sheetName);
          session.activitySettings.headerRow=best?.name===session.activitySettings.sheetName?best.headerRow:1;
        }
        if(['activitySheetName','activityHeaderRow'].includes(key)){
          session.activitySettings.mapping=null;session.activitySettings.rowBindings={};
        }
        renderWorkbookMapping();
      }
    };
    form.onsubmit=event=>{
      event.preventDefault();
      session.settings=collect();
      const plans=readRecords();
      const checked=importer.review(snap,session.settings,plans);
      session.reviewed=checked;
      session.activitySettings=collectActivity();
      const activityCheck=session.activitySettings.enabled&&activityImport?
        activityImport.review(snap,checked,session.activitySettings):null;
      session.activityReviewed=activityCheck;
      const activeReady=!session.activitySettings.enabled||!!activityCheck?.ready;
      const complete=checked.ready&&activeReady;
      const activityRows=activityCheck?.rows||[];
      const edgeTitle=activityCheck?.advancedEdgeCount?
        activityCheck.edgeCount+' '+at.links:activityCheck?.edgeCount+' FS/0 links';
      const edgeDetails=activityCheck?.edges?.length?'<div class="tna-import-row-preview" tabindex="0"><table><thead><tr><th>Successor</th><th>'+esc(at.links)+'</th></tr></thead><tbody>'+
        activityCheck.edges.map(edge=>'<tr><td>'+esc(edge.target)+'</td><td>'+esc(edge.source)+' → '+esc(edge.relation)+' / '+esc(edge.lagUnits)+' '+esc(edge.lagBasis)+(edge.allowLead?' (reviewed lead)':'')+'</td></tr>').join('')+
        '</tbody></table></div>':'';
      const activitySummary=activityCheck?'<section aria-label="Reviewed Excel activities"><h4>'+esc(at.preview)+
        ' · '+activityRows.length+' · '+esc(edgeTitle)+'</h4>'+
        '<div class="tna-import-row-preview" tabindex="0"><table><thead><tr><th>Row</th><th>Source ref / Mapped task / Dates / Status / Predecessors</th></tr></thead><tbody>'+
        activityRows.map(row=>'<tr><th scope="row">'+esc(row.line)+'</th><td>'+esc(row.sourceKey)+' → '+esc(row.targetRef||at.missing)+
          ' · '+esc(row.title)+' · '+esc(row.dates.plannedFinish||t.missing)+' / '+esc(row.dates.revisedFinish||t.missing)+
          ' / '+esc(row.dates.actualFinish||t.missing)+' · '+esc(row.status)+' · '+esc(row.predecessors.join(', ')||'No predecessor')+
          '</td></tr>').join('')+'</tbody></table></div>'+
        edgeDetails+
        (activityCheck.customRows?.length?'<p class="tna-note">'+esc(at.customCount)+': '+esc(activityCheck.customRows.length)+'. Review their sourced Stage and Task Kind.</p>':'')+
        (activityCheck.missingTemplateRefs?.length?'<p class="tna-note">'+esc(activityCheck.missingTemplateRefs.length)+
          ' template tasks have no Excel source and remain unstarted/unscheduled.</p>':'')+
        '</section>':'';
      const unmatchedHtml=activityCheck?.unmatched?.length?'<div class="tna-form-grid">'+
        activityCheck.unmatched.map(row=>{
          const plan=domain.createPlan(checked.proposal,{ownerUserId:'preview'});
          const options=[['',at.missing],['__CUSTOM__',at.custom],...plan.tasks.map(task=>[task.templateRef,task.templateRef+' · '+task.title])];
          return '<label>'+esc(at.bind)+' · '+esc(row.line)+' '+esc(row.sourceKey)+' '+esc(row.title)+
            '<select data-activity-bind-line="'+esc(row.line)+'">'+htmlOptions(options,session.activitySettings.rowBindings[row.line]||'')+
            '</select></label>';
        }).join('')+'</div>':'';
      const errors=[...checked.errors,...(activityCheck?.errors||[])].map(e=>'<li>'+esc(e)+'</li>').join('');
      const warnings=[...checked.warnings.filter(w=>!session.activitySettings.enabled||!w.includes('NOT imported')),...(activityCheck?.warnings||[])].map(w=>'<li>'+esc(w)+'</li>').join('');
      const summary=checked.ready?[
        ['Buyer',checked.proposal.buyerName],['Factory',checked.proposal.factoryName],
        ['Style',checked.proposal.styleNo],['PO',checked.proposal.poNumber],
        ['Quantity',checked.proposal.totalQty],['Ex-factory',checked.proposal.buyerRequiredExFactory],
        ['Template',checked.proposal.templateId],['Lead-time basis',checked.proposal.leadTimeBasis]
      ].map(item=>'<p><b>'+esc(item[0])+':</b> '+esc(item[1])+'</p>').join(''):'';
      const consent=complete?'<label><input type="checkbox" id="tnaWorkbookConsent"> '+esc(t.consent)+'</label>'+
        (session.activitySettings.enabled?'<label><input type="checkbox" id="tnaWorkbookActivityConsent"> '+esc(at.confirmation)+'</label>':'')+
        (checked.duplicate?'<label><input type="checkbox" id="tnaWorkbookDuplicateConsent"> '+esc(t.duplicateConsent)+'</label>':'')+
        '<button type="button" class="tna-btn" id="tnaWorkbookConfirm">'+esc(t.confirm)+'</button>':'';
      const node=document.getElementById('tnaWorkbookDecision');
      node.innerHTML='<h4>Review result</h4>'+summary+activitySummary+unmatchedHtml+
        (errors?'<ul class="tna-import-errors">'+errors+'</ul>':'')+
        (warnings?'<ul class="tna-import-warnings">'+warnings+'</ul>':'')+consent;
      node.querySelectorAll('[data-activity-bind-line]').forEach(select=>select.onchange=()=>{
        session.activitySettings.rowBindings[select.dataset.activityBindLine]=select.value;
        session.activityReviewed=null;
        node.querySelector('#tnaWorkbookConfirm')?.remove();
        importReviewError('Activity mapping changed. Select Review proposed draft again to validate all activities.');
      });
      const button=document.getElementById('tnaWorkbookConfirm');
      if(button)button.onclick=()=>{
        if(!document.getElementById('tnaWorkbookConsent')?.checked)
          return importReviewError('Review the source and check the confirmation before creating the new draft.');
        if(session.activitySettings.enabled&&!document.getElementById('tnaWorkbookActivityConsent')?.checked)
          return importReviewError('Confirm the full activity and dependency review before importing.');
        if(checked.duplicate&&!document.getElementById('tnaWorkbookDuplicateConsent')?.checked)
          return importReviewError('Confirm that the matching existing order must remain separate.');
        try{
          // Re-review at confirmation so a changed local record cannot turn a
          // duplicate into a silent merge. No existing record is ever edited.
          const fresh=importer.review(snap,session.settings,readRecords());
          if(!fresh.ready)throw Error(fresh.errors.join('; '));
          if(fresh.duplicate&&!document.getElementById('tnaWorkbookDuplicateConsent')?.checked)
            throw Error('Matching existing order requires separate acknowledgement.');
          let draft=importer.createNewDraft(fresh,{ownerUserId:userKey()});
          if(session.activitySettings.enabled){
            const finalActivity=activityImport.review(snap,fresh,session.activitySettings);
            if(!finalActivity.ready)throw Error(finalActivity.errors.join('; '));
            draft=activityImport.applyToNewDraft(draft,finalActivity,{ownerUserId:userKey()});
          }
          if(readRecords().some(row=>row.recordId===draft.recordId))throw Error('New record ID conflicts with an existing saved order.');
          // savePlan is the only persistent write: a new stable ID is required.
          const saved=storage.savePlan(draft,userKey());
          try{storage.autosave(draft,userKey());}catch(error){
            // An autosave failure does not erase the already saved new record.
            state.currentPlan=draft;state.importSession=null;render();
            return openDialog('New TNA saved',
              '<p>New draft saved locally, but automatic recovery could not be refreshed. Download a Saved Copy before leaving.</p>');
          }
          state.currentPlan=draft;
          state.importSession=null;
          state.dialog.close();
          render();
          openDialog('New TNA created',
            '<p>A separate, unsigned TNA draft was saved locally. Existing orders were not replaced.</p>'+
            '<p><b>'+esc(saved.style||'New style')+'</b> · '+esc(saved.po||'New PO')+'</p>'+
            (session.activitySettings.enabled?'<p>Reviewed Excel activities and explicitly selected predecessor relations are included. Other template tasks remain unverified; source references and calendars require business review.</p>':
              '<p>Activity/dependency rows were not imported (Order-only). Review the task sheet.</p>')+
            '<p>Download a saved copy before leaving this device.</p>');
        }catch(error){importReviewError(error.message);}
      };
    };
  }
  function openImportPreview(){
    state.importSession=null;
    openDialog('Import Excel TNA',
      '<p>Choose a local Excel workbook. Review the sheet, headers, dates and order details before creating a separate draft.</p>'+
      '<input id="tnaWorkbookFile" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,.tsv,text/csv,text/tab-separated-values">'+
      '<label class="tna-wide"><span>Pasted table preview (not importable yet)</span>'+
      '<textarea id="tnaImportText" rows="6" placeholder="Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory"></textarea></label>'+
      '<div class="menu-grid"><button class="tna-btn" type="button" data-import-preview="text">Preview pasted text</button>'+
      '<button class="tna-btn secondary" type="button" data-import-preview="file">Review selected file</button></div>'+
      '<div id="tnaImportPreviewResult"></div>');
    document.querySelector('[data-import-preview="text"]').onclick=()=>{
      state.importSession=null;
      try{renderImportPreview(storage.importPreview(document.getElementById('tnaImportText').value));}
      catch(error){renderImportError(error.message);}
    };
    document.querySelector('[data-import-preview="file"]').onclick=()=>{
      const file=document.getElementById('tnaWorkbookFile').files?.[0];
      if(!file)return renderImportError('Choose an Excel workbook first.');
      const lower=file.name.toLowerCase();
      if(!lower.endsWith('.xlsx')){
        if(lower.endsWith('.xlsm'))return renderImportError('Files with macros are not allowed. Save as a clean .xlsx file.');
        return renderImportError('Text files can only be previewed here. Choose a .xlsx workbook to create a reviewed new draft.');
      }
      const reader=new FileReader();
      reader.onerror=()=>renderImportError('This local Excel workbook could not be read.');
      reader.onload=()=>startExcelReview(file,reader.result);
      reader.readAsArrayBuffer(file);
    };
  }
  function renderImportPreview(preview){document.getElementById('tnaImportPreviewResult').innerHTML=`<h3>${esc(text('importPreview'))}</h3>${preview.workbook?`<p>Workbook sheet: ${esc(preview.workbook.sheetName)} · rows: ${esc(preview.workbook.rowCount)} · parser: ${esc(preview.workbook.parser)}</p>`:''}<p>Headers: ${esc(preview.headers.join(' · ')||'none')}</p><p>Rows previewed: ${esc(preview.rows.length)}</p>${preview.warnings.length?`<ul>${preview.warnings.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'<p>No import warnings found in the preview.</p>'}<p class="tna-note">Preview only. Creating or updating production TNAs from spreadsheets requires a reviewed mapping step and does not overwrite existing TNA records.</p>`;}
  function renderImportError(message){document.getElementById('tnaImportPreviewResult').innerHTML=`<p>${esc(message)}</p>`;}
  function saveNow(){if(!state.currentPlan)return openDialog('Save TNA','<p>Create or open a TNA draft before saving.</p>');if(state.currentPlan.mode==='practice')return openDialog('Save TNA','<p>Practice example is isolated and cannot be saved into real production records.</p>');try{const saved=storage.savePlan(state.currentPlan,userKey());render();openDialog('Save TNA',`<p>Saved locally in this browser.</p><p><b>${esc(saved.style||'Untitled TNA')}</b> · ${esc(saved.po||'PO unknown')}</p>`);}catch(error){openDialog('Save TNA',`<p>${esc(error.message)}</p>`);}}
  function downloadCopy(){if(!state.currentPlan)return openDialog('Download Saved Copy','<p>Create or open a TNA draft before downloading a saved copy.</p>');if(state.currentPlan.mode==='practice')return openDialog('Download Saved Copy','<p>Practice example cannot be exported as business evidence. Create a real TNA first.</p>');try{const text=storage.exportCopy(state.currentPlan);const name=`vesa-tna-${(state.currentPlan.order.styles?.[0]?.styleNo||state.currentPlan.recordId||'copy').replace(/[^a-z0-9_-]+/gi,'-')}.json`;if(typeof Blob!=='undefined'&&document.createElement){const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}openDialog('Download Saved Copy',`<p>Portable copy prepared and checksum protected.</p><p>File name: <b>${esc(name)}</b></p><textarea readonly rows="6">${esc(text.slice(0,1200))}</textarea>`);}catch(error){openDialog('Download Saved Copy',`<p>${esc(error.message)}</p>`);}}
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.dialog?.open)state.dialog.close();});
  window.addEventListener('vesa-preferences-change',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
