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
    tools:['Recalculate Dates','Factory Working Calendar','Check Missing Information','Production Capacity','Shipment Lots','Recovery Scenarios','Linked Records','Offline Work','Prepare Report','Download Report','Print Report','Share Report'],
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

  const state={dialog:null,language:'en',currentPlan:null,workspaceFilter:{owner:null,stage:null},workspaceView:'timeline',portfolioFilter:{buyer:null,factory:null,po:null},scenarioDraft:null,scenarioPreview:null};
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
  /**
   * Read-only garment activity columns. Owns no plan mutations, saved records or
   * approval decisions; all values come from existing TNA domain sources.
   */
  class GarmentTnaActivityView {
    /** Compare civil finish dates only, never guessed calendar dates or working-day rules. */
    static lateCalendarDays(task,language){
      const target=task.dates?.currentTargetFinish||task.dates?.baselineFinish;
      const actual=task.dates?.actualFinish;
      const observed=actual||task.dates?.forecastFinish;
      const words={
        en:{missing:'Needs dates',actual:'actual',forecast:'forecast'},
        bn:{missing:'তারিখ প্রয়োজন',actual:'বাস্তব',forecast:'পূর্বাভাস'},
        hi:{missing:'तारीख चाहिए',actual:'वास्तविक',forecast:'पूर्वानुमान'},
        ta:{missing:'தேதிகள் தேவை',actual:'நிகழ்ந்தது',forecast:'எதிர்பார்ப்பு'}
      }[language]||{missing:'Needs dates',actual:'actual',forecast:'forecast'};
      if(!target||!observed||!scheduling?.toDay||!scheduling?.fromDay)return words.missing;
      try{
        const a=scheduling.toDay(target),b=scheduling.toDay(observed);
        if(scheduling.fromDay(a)!==target||scheduling.fromDay(b)!==observed)return words.missing;
        return String(Math.max(0,b-a))+' ('+words[actual?'actual':'forecast']+')';
      }catch{return words.missing;}
    }
    /** Show only approval instances explicitly linked to this task and their recorded reviewers. */
    static approvalSource(plan,task,language){
      const linked=(plan.approvals||[]).filter(approval=>Array.isArray(approval.requiredForTaskIds)&&approval.requiredForTaskIds.includes(task.taskId));
      if(!linked.length)return ({en:'Needs Information',bn:'তথ্য প্রয়োজন',hi:'जानकारी चाहिए',ta:'தகவல் தேவை'})[language]||'Needs Information';
      return linked.map(approval=>{
        const decision=operations?.approvalState?.(approval)?.status||'needs-information';
        const requested=approval.partyRequiredToApprove||'Party not recorded';
        const reviewer=approval.decidedBy||approval.authorizedReviewerId||'Reviewer not recorded';
        const evidence=approval.evidenceRef||'Evidence missing';
        return [requested,decision,reviewer,evidence].join(' · ');
      }).join(' | ');
    }
    /** Display the last actual status-change reason for this task, not an invented remark. */
    static recordedNote(plan,task){
      const events=plan.revisionEvents||[];
      const note=events.slice().reverse().find(event=>event.details?.taskId===task.taskId&&typeof event.details.reason==='string'&&event.details.reason.trim());
      return note?.details.reason||'—';
    }

    /** Returns matched garment sheet headings in all four platform languages. */
    static headers(language){
      const labels={
        en:['Ref','Activity','Responsible','Target finish','Forecast finish','Actual finish','Calendar days late','Status','Approval / source','Recorded note','Delay reason','Follow up'],
        bn:['নং','কাজ','দায়িত্ব','লক্ষ্য সমাপ্তি','পূর্বাভাস সমাপ্তি','বাস্তব সমাপ্তি','বিলম্ব (দিন)','অবস্থা','অনুমোদন / সূত্র','নথিবদ্ধ মন্তব্য','বিলম্বের কারণ','ফলো-আপ'],
        hi:['क्रम','कार्य','जिम्मेदार','लक्षित समाप्ति','अनुमानित समाप्ति','वास्तविक समाप्ति','देरी (दिन)','स्थिति','अनुमोदन / स्रोत','दर्ज टिप्पणी','देरी का कारण','फॉलो-अप'],
        ta:['எண்','செயல்பாடு','பொறுப்பு','இலக்கு முடிவு','எதிர்பார்க்கும் முடிவு','உண்மை முடிவு','தாமத நாட்கள்','நிலை','ஒப்புதல் / ஆதாரம்','பதிந்த குறிப்பு','தாமதக் காரணம்','தொடர்ச்சி']
      };
      return labels[language]||labels.en;
    }
    /** One task row owns one Edit action; mobile labels reuse the exact column dictionary. */
    static renderCells(plan,task,language){
      const labels=this.headers(language);
      const values=[
        task.templateRef,task.title,task.ownerParty||'—',
        task.dates?.currentTargetFinish||task.dates?.baselineFinish||'—',
        task.dates?.forecastFinish||'—',task.dates?.actualFinish||'—',
        this.lateCalendarDays(task,language),task.status||'—',
        this.approvalSource(plan,task,language),this.recordedNote(plan,task),
        task.delayReason||'—',null
      ];
      const edits={en:'Edit',bn:'সম্পাদনা',hi:'संपादित करें',ta:'திருத்து'};
      return values.map((value,index)=>{
        const label='<small class="tna-sheet-cell-label">'+esc(labels[index])+'</small>';
        if(index===values.length-1){
          return '<span role="cell">'+label+'<button class="tna-mini-btn" type="button" data-edit-task="'+esc(task.taskId)+'" aria-label="Edit '+esc(task.title)+'">'+esc(edits[language]||edits.en)+'</button></span>';
        }
        return '<span role="cell">'+label+esc(value)+'</span>';
      }).join('');
    }

  }
  function planPanel(plan){if(!plan)return `<div class="tna-panel"><h2>${esc(text('templateLibrary'))}</h2><p>${esc(text('notSaved'))}</p><p>${Object.values(domain?.TEMPLATE_PROFILES||{}).map(t=>esc(t.name)).join(' · ')}</p></div>`;
    const warnings=plan.validation?.warnings||[];const errors=plan.validation?.errors||[];const unknown=plan.unknownFields||[];const savedNote=plan.mode==='practice'?'Practice example is isolated from real production records and cannot be saved as a production TNA.':currentPlanSaved(plan)?'Saved locally in this browser.':'Draft is not saved yet. Use Save TNA to keep it in this browser.';
    const stageCounts=plan.tasks.reduce((acc,task)=>{acc[task.stageCode]=(acc[task.stageCode]||0)+1;return acc},{});
    return `<div class="tna-panel tna-plan-panel"><div class="tna-plan-head"><div><span class="tna-kicker">${esc(text('workspace'))}</span><h2>${esc(plan.order.styles[0]?.styleNo||'Untitled TNA')} · ${esc(plan.order.buyerName||'Buyer unknown')}</h2><p>${esc(plan.order.factoryName||'Factory unknown')} · ${esc(plan.order.poNumbers[0]||'PO unknown')} · ${esc(plan.order.totalQty??'Qty unknown')} ${esc(plan.order.unit)}</p></div><span class="tna-status-pill">${esc((domain.TEMPLATE_PROFILES[plan.templateId]||{}).name||plan.templateId)}</span></div>
      <div class="tna-metrics"><b>${plan.tasks.length}</b><span>${esc(text('tasks'))}</span><b>${plan.baselineSnapshots.length}</b><span>${esc(text('baseline'))}</span><b>${unknown.length+warnings.length+errors.length}</b><span>${esc(text('validation'))}</span></div>
      <p class="tna-note">${esc(savedNote)}</p>
      ${orderMasterPanel(plan)}
      ${TnaFactoryCalendarEditor.summary(plan,state.language)}
      <section class="tna-master-activities" aria-label="Garment TNA activity master sheet"><h3>${esc(({en:'Garment TNA — Activity Follow-up Sheet',bn:'গার্মেন্টস TNA — কার্যক্রম ফলো-আপ',hi:'गारमेंट TNA — कार्य फॉलो-अप',ta:'ஆடை TNA — செயல்பாடு தொடர்ச்சி'})[state.language])}</h3><p class="tna-note">${esc(({en:'All activities appear below. Missing dates or approval evidence remain unconfirmed.',bn:'সব কাজ নিচে দেখানো হয়েছে। অনুপস্থিত তারিখ বা অনুমোদন নিশ্চিত নয়।',hi:'सभी कार्य नीचे हैं। अनुपलब्ध तारीख या अनुमोदन अपुष्ट है।',ta:'அனைத்து செயல்களும் கீழே உள்ளன. இல்லாத தேதிகள் அல்லது ஒப்புதல்கள் உறுதிப்படுத்தப்படவில்லை.'})[state.language])}</p><div class="tna-sheet-scroll"><div class="tna-task-table tna-activity-table" role="table" aria-label="Editable garment TNA activity sheet"><div role="row" class="tna-activity-heading">${GarmentTnaActivityView.headers(state.language).map(label=>`<b role="columnheader">${esc(label)}</b>`).join('')}</div>${plan.tasks.map(task=>`<div role="row">${GarmentTnaActivityView.renderCells(plan,task,state.language)}</div>`).join('')}</div></div></section>
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
</div>`}
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
  function render(){state.language=language();ensureWorkspaceShell();const records=readRecords();const offline=offlineSummary();const portfolioPlans=readSavedPlans(records);if(state.currentPlan&&!portfolioPlans.some(plan=>plan.recordId===state.currentPlan.recordId))portfolioPlans.unshift(state.currentPlan);const root=document.getElementById('tnaMain');root.innerHTML=`
    <section class="tna-hero">
      <div class="tna-hero-card"><span class="tna-kicker">${esc(text('tag'))}</span><h1>${esc(text('title'))}</h1><p class="tna-lead">${esc(text('lead'))}</p><p class="tna-note">${esc(text('privacy'))}</p></div>
      <aside class="tna-status-card"><span class="tna-status-pill">${esc(text('mode'))}</span><p class="tna-muted">${esc(text('modeText'))}</p><p class="tna-muted">${esc(text('cloud'))}</p></aside>
    </section>
    <section class="tna-grid" aria-label="TNA home actions">
      ${actionCard('new')}${actionCard('save',true,!state.currentPlan)}${actionCard('continue',true,records.length===0)}${actionCard('open',true)}${actionCard('download',true,!state.currentPlan)}${actionCard('copy',true)}${actionCard('practice',true)}${actionCard('orders',true)}
    </section>
    <section class="tna-two">
      ${offlineWorkPanel(offline)}
      <div class="tna-panel"><h2>${esc(text('recent'))}</h2><div class="tna-list">${records.length?records.map(r=>`<article><b>${esc(r.style||'Untitled TNA')}</b><p>${esc(r.buyer||'Buyer unknown')} · ${esc(r.po||'PO unknown')} · ${esc(r.updatedAt||'No saved time')}</p></article>`).join(''):`<article>${esc(text('empty'))}</article>`}</div></div>
      ${portfolioPanel(records,portfolioPlans)}
    </section>
    ${planPanel(state.currentPlan)}
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
    root.querySelectorAll('[data-portfolio-buyer]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={...(state.portfolioFilter||{}),buyer:btn.dataset.portfolioBuyer||null};render();});
    root.querySelectorAll('[data-portfolio-factory]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={...(state.portfolioFilter||{}),factory:btn.dataset.portfolioFactory||null};render();});
    root.querySelectorAll('[data-portfolio-po]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={...(state.portfolioFilter||{}),po:btn.dataset.portfolioPo||null};render();});
    root.querySelectorAll('[data-clear-portfolio]').forEach(btn=>btn.onclick=()=>{state.portfolioFilter={buyer:null,factory:null,po:null};render();});
    root.querySelectorAll('[data-open-capacity]').forEach(btn=>btn.onclick=openCapacityEntry);
    root.querySelectorAll('[data-add-shipment-lot]').forEach(btn=>btn.onclick=openShipmentLotEntry);
    const scenarioForm=document.getElementById('tnaScenarioForm');if(scenarioForm)scenarioForm.onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());state.scenarioDraft={...data,durationUnits:Number(data.durationUnits),verifiedDailyOutput:data.verifiedDailyOutput};state.scenarioPreview=scenarios.previewScenario(state.currentPlan,{name:data.name,durationAdjustments:[{taskId:data.taskId,durationUnits:Number(data.durationUnits),reason:data.name}],capacity:data.verifiedDailyOutput?{plannedQty:state.currentPlan.order.totalQty,completedQty:0,verifiedDailyOutput:Number(data.verifiedDailyOutput)}:undefined},{actorId:userKey()});render();};
    root.querySelectorAll('[data-apply-scenario]').forEach(btn=>btn.onclick=openScenarioApply);
    root.querySelectorAll('[data-edit-task]').forEach(btn=>btn.onclick=()=>openTaskEdit(btn.dataset.editTask));
    root.querySelectorAll('[data-edit-calendar]').forEach(btn=>btn.onclick=()=>TnaFactoryCalendarEditor.open());
  }
  function openDialog(title,body){document.getElementById('tnaDialogTitle').textContent=title;document.getElementById('tnaDialogBody').innerHTML=body;if(!state.dialog.open)state.dialog.showModal();}
  function openHelp(action){const id=String(action).replace(/^help-/,'');const topic=(HELP_TOPICS[state.language]||HELP_TOPICS.en)[id]||HELP_TOPICS.en[id];if(!topic)return;openDialog(topic.title,`<article data-help-topic="${esc(id)}"><p>${esc(topic.intro)}</p><ol>${topic.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ol></article>`);}
  function openMenu(name){const help=HELP_TOPICS[state.language]||HELP_TOPICS.en;const items=name==='help'?Object.entries(help).map(([id,item])=>({action:`help-${id}`,label:item.label})):(MENUS[name]||[]).map(item=>({action:item,label:item==='Factory Working Calendar'?TnaFactoryCalendarEditor.copy(state.language).title:item}));const note=name==='file'?'Save, reopen and protected backup are available here. Excel preview rejects macros and warns about formulas.':name==='help'?(help.how?.intro||HELP_TOPICS.en.how.intro):text('unavailable');openDialog(text('menuTitle')+' · '+text(name),`<div class="menu-grid">${items.map(item=>`<button class="tna-btn secondary" type="button" data-menu-action="${esc(item.action)}">${esc(item.label)}</button>`).join('')}</div><p class="tna-note">${esc(note)}</p>`);document.querySelectorAll('[data-menu-action]').forEach(btn=>btn.onclick=()=>{const action=btn.dataset.menuAction;if(action.startsWith('help-'))return openHelp(action);if(action==='New TNA')return openWizard('quick');if(action==='Open Saved TNA')return openSavedList();if(action==='Save Now')return saveNow();if(action==='Make Another Copy'||action==='Download Saved Copy')return downloadCopy();if(action==='Open Saved Copy')return openSavedCopyDialog();if(action==='Import Excel TNA')return openImportPreview();if(action==='Factory Working Calendar')return TnaFactoryCalendarEditor.open();if(action==='Add Activity')return openCustomTask();if(action==='Production Capacity')return openCapacityEntry();if(action==='Shipment Lots')return openShipmentLotEntry();if(action==='Linked Records')return openLinkedRecords();if(action==='Recovery Scenarios'){document.getElementById('tnaScenarioForm')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return state.dialog?.close();}if(action==='Offline Work')return openOfflineWork();if(['Prepare Report','Download Report','Print Report','Share Report'].includes(action))return openReportPanel(action);return openDialog(action,`<p>${esc(text('unavailable'))}</p>`);});}
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
   * Owns the localized in-dialog follow-up form and its local save lifecycle.
   * Domain validation remains in VesaTnaDomain; status/approval editor is separate.
   * The caller is openTaskEdit(taskId), never a new platform header or route.
   */
  /**
   * Browser-local persistence owner for validated activity edits.
   * Both editors use the same autosave/named-record transaction.
   * Practice plans stay isolated; failures must not replace in-memory state.
   */
  class TnaLocalEditPersistence {
    static commit(nextPlan,previousPlan){
      if(previousPlan.mode==='practice')return;
      if(!storage?.autosave)throw new Error('Local saving is unavailable');
      storage.autosave(nextPlan,userKey());
      if(currentPlanSaved(previousPlan))storage.savePlan(nextPlan,userKey());
    }
  }
  /**
   * Owns one in-workspace factory working-calendar form in the shared VESA shell.
   * Access: calendar card or Tools > Factory Working Calendar, never a new page.
   * Reads the current plan; writes only via domain.updateFactoryCalendar and the
   * established TnaLocalEditPersistence transaction. No cloud request or guessed
   * weekdays/timezone. If validation or browser storage fails the dialog stays
   * open and the in-memory plan is unchanged. Saved copies remain v1.1 compatible.
   */
  class TnaFactoryCalendarEditor {
    /** The UI dictionary localizes labels only; factory-entered strings stay intact. */
    static copy(language){
      const words={
        en:{title:'Factory Working Calendar',status:'Calendar status',missing:'Needs Information — factory calendar not entered',recorded:'Factory calendar recorded by local user (not independently verified)',change:'Review / Update Calendar',
          description:'Enter the factory working days and non-working dates from a documented source. No default working week is assumed. A buyer delivery calculation must not treat unconfirmed calendar dates as verified.',
          name:'Calendar name',zone:'IANA timezone',week:'Working days (choose all that apply)',holidays:'Holidays (one YYYY-MM-DD date per line)',shutdowns:'Factory shutdown dates (one YYYY-MM-DD per line)',
          source:'Factory document or source reference',reason:'Reason for this entry / revision',confirm:'I have checked these calendar entries against the factory source.',
          save:'Save Factory Calendar',sourceLabel:'Source',daysLabel:'Working days',zoneLabel:'Timezone',datesLabel:'Holidays / shutdowns',none:'None recorded',
          failed:'Could not save this factory calendar in this browser. Check available storage and retry.',
          days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']},
        bn:{title:'কারখানার কাজের ক্যালেন্ডার',status:'ক্যালেন্ডারের অবস্থা',missing:'তথ্য প্রয়োজন — কাজের ক্যালেন্ডার দেওয়া হয়নি',recorded:'স্থানীয় ব্যবহারকারীর দেওয়া ক্যালেন্ডার (স্বাধীনভাবে যাচাই করা হয়নি)',change:'ক্যালেন্ডার দেখুন / পরিবর্তন করুন',
          description:'কারখানার নথি দেখে কাজের দিন এবং ছুটি লিখুন। কোনো সপ্তাহের দিন ধরে নেওয়া হয়নি। অযাচাইকৃত ক্যালেন্ডারকে নিশ্চিত ডেলিভারি তারিখ ধরা যাবে না।',
          name:'ক্যালেন্ডারের নাম',zone:'IANA টাইমজোন',week:'কাজের দিনগুলি বাছুন',holidays:'ছুটির দিন (প্রতি লাইনে YYYY-MM-DD)',shutdowns:'কারখানা বন্ধের তারিখ (প্রতি লাইনে YYYY-MM-DD)',
          source:'কারখানার নথি / উৎস',reason:'লেখার বা পরিবর্তনের কারণ',confirm:'কারখানার উৎস দেখে তথ্য যাচাই করেছি।',
          save:'ক্যালেন্ডার সেভ করুন',sourceLabel:'উৎস',daysLabel:'কাজের দিন',zoneLabel:'টাইমজোন',datesLabel:'ছুটি / বন্ধ',none:'নথিভুক্ত নয়',
          failed:'এই ব্রাউজারে সেভ হয়নি। স্টোরেজ দেখে আবার চেষ্টা করুন।',
          days:['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার']},
        hi:{title:'फैक्ट्री कार्य कैलेंडर',status:'कैलेंडर की स्थिति',missing:'जानकारी चाहिए — फैक्ट्री कैलेंडर दर्ज नहीं है',recorded:'स्थानीय उपयोगकर्ता का दर्ज कैलेंडर (स्वतंत्र सत्यापन नहीं हुआ)',change:'कैलेंडर देखें / बदलें',
          description:'फैक्ट्री के दस्तावेज से कार्य-दिन, छुट्टियां और बंद तारीखें दर्ज करें। कोई सप्ताह तय नहीं माना गया है। अपुष्ट कैलेंडर से डिलीवरी का वादा न करें।',
          name:'कैलेंडर का नाम',zone:'IANA समय क्षेत्र',week:'कार्य दिवस चुनें',holidays:'छुट्टियां (प्रत्येक पंक्ति YYYY-MM-DD)',shutdowns:'फैक्ट्री बंद तारीखें (प्रत्येक पंक्ति YYYY-MM-DD)',
          source:'फैक्ट्री दस्तावेज / स्रोत',reason:'दर्ज या बदलने का कारण',confirm:'फैक्ट्री के स्रोत से यह जानकारी जांची है।',
          save:'फैक्ट्री कैलेंडर सेव करें',sourceLabel:'स्रोत',daysLabel:'कार्य दिवस',zoneLabel:'समय क्षेत्र',datesLabel:'छुट्टियां / बंद',none:'दर्ज नहीं',
          failed:'इस ब्राउज़र में सेव नहीं हुआ। स्टोरेज जांचकर दोबारा कोशिश करें।',
          days:['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार']},
        ta:{title:'தொழிற்சாலை வேலை நாட்காட்டி',status:'நாட்காட்டி நிலை',missing:'தகவல் தேவை — தொழிற்சாலை நாட்காட்டி பதியப்படவில்லை',recorded:'உள்ளூர் பயனர் பதிவு செய்த நாட்காட்டி (சுயாதீனமாகச் சரிபார்க்கப்படவில்லை)',change:'நாட்காட்டியைப் பார்க்க / மாற்ற',
          description:'தொழிற்சாலை ஆவணத்தைப் பார்த்து வேலை நாட்கள், விடுமுறை மற்றும் மூடல் தேதிகளை உள்ளிடுங்கள். எந்த வாரநாட்களும் இயல்பாக நிரப்பப்படவில்லை. உறுதிசெய்யாத நாட்காட்டியைக் கொண்டு delivery வாக்குறுதி அளிக்கக் கூடாது.',
          name:'நாட்காட்டி பெயர்',zone:'IANA நேர மண்டலம்',week:'வேலை நாட்களைத் தேர்ந்தெடுக்கவும்',holidays:'விடுமுறைகள் (வரிக்கு ஒரு YYYY-MM-DD)',shutdowns:'தொழிற்சாலை மூடல் தேதிகள் (வரிக்கு ஒரு YYYY-MM-DD)',
          source:'தொழிற்சாலை ஆவண / ஆதாரக் குறிப்பு',reason:'பதிவு / மாற்றக் காரணம்',confirm:'தொழிற்சாலை ஆதாரத்தைப் பார்த்து விவரங்களைச் சரிபார்த்தேன்.',
          save:'வேலை நாட்காட்டியைச் சேமி',sourceLabel:'ஆதாரம்',daysLabel:'வேலை நாட்கள்',zoneLabel:'நேர மண்டலம்',datesLabel:'விடுமுறை / மூடல்',none:'பதிவு இல்லை',
          failed:'Browser-ல் சேமிக்க முடியவில்லை. Storage-ஐச் சரிபார்த்து மீண்டும் முயலவும்.',
          days:['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி']}
      };
      return words[language]||words.en;
    }

    /** A small status panel near Order Master; display data only when user-entered. */
    static summary(plan,language){
      const w=this.copy(language);
      const cal=plan.calendars?.find(item=>item.calendarId==='default');
      const valid=cal?.source==='user-confirmed'&&Array.isArray(cal.workingWeek)&&cal.workingWeek.length>0;
      const days=valid?cal.workingWeek.map(day=>w.days[day]).join(', '):w.none;
      const dateCounts=valid?String(cal.holidays?.length||0)+' / '+String(cal.shutdowns?.length||0):w.none;
      return '<section class="tna-panel tna-calendar-panel" aria-label="'+esc(w.title)+'">'+
        '<h3>'+esc(w.title)+'</h3><p class="tna-note">'+esc(w.status)+': '+esc(valid?w.recorded:w.missing)+'</p>'+
        (valid?'<p>'+esc(w.daysLabel)+': '+esc(days)+' · '+esc(w.zoneLabel)+': '+esc(cal.timezone||w.none)+'</p>'+
          '<p>'+esc(w.datesLabel)+': '+esc(dateCounts)+' · '+esc(w.sourceLabel)+': '+esc(cal.sourceReference||w.none)+'</p>':'')+
        '<button class="tna-btn secondary" type="button" data-edit-calendar>'+esc(w.change)+'</button></section>';
    }

    /** A reviewed, explicit factory calendar: unconfigured plans start with no checked days. */
    static open(){
      if(!state.currentPlan)return openDialog('Factory Working Calendar','<p>Create or open a TNA before entering factory working days.</p>');
      if(state.currentPlan.mode==='practice')return openDialog('Factory Working Calendar','<p>Practice orders cannot be recorded as a confirmed factory calendar.</p>');
      const w=this.copy(state.language),cal=state.currentPlan.calendars?.find(item=>item.calendarId==='default');
      const entered=cal?.source==='user-confirmed';
      const weekdays=[1,2,3,4,5,6,0].map(day=>'<label><input type="checkbox" name="workingWeek" value="'+day+'" '+(entered&&cal.workingWeek?.includes(day)?'checked':'')+'> '+esc(w.days[day])+'</label>').join('');
      const holidays=entered?(cal.holidays||[]).join('\n'):'';
      const shutdowns=entered?(cal.shutdowns||[]).join('\n'):'';
      const body='<section class="tna-calendar-editor"><p class="tna-note">'+esc(w.description)+'</p>'+
        '<form class="tna-wizard" id="tnaCalendarForm">'+
        '<div class="tna-form-grid">'+field('name',w.name,'text',entered?cal.name||'':'',true)+
        field('timezone',w.zone,'text',entered?cal.timezone||'':'',true)+
        field('sourceReference',w.source,'text',entered?cal.sourceReference||'':'',true)+'</div>'+
        '<fieldset class="tna-checks tna-calendar-days"><legend>'+esc(w.week)+'</legend>'+weekdays+'</fieldset>'+
        '<label class="tna-wide"><span>'+esc(w.holidays)+'</span><textarea name="holidays" rows="3" placeholder="YYYY-MM-DD">'+esc(holidays)+'</textarea></label>'+
        '<label class="tna-wide"><span>'+esc(w.shutdowns)+'</span><textarea name="shutdowns" rows="3" placeholder="YYYY-MM-DD">'+esc(shutdowns)+'</textarea></label>'+
        '<label class="tna-wide"><span>'+esc(w.reason)+' *</span><textarea name="reason" rows="2" maxlength="800" required></textarea></label>'+
        '<label class="tna-calendar-confirm"><input name="confirmed" type="checkbox" required> '+esc(w.confirm)+'</label>'+
        '<p role="alert" data-tna-calendar-error></p><button class="tna-btn" type="submit">'+esc(w.save)+'</button>'+
        '</form></section>';
      openDialog(w.title,body);
      const form=document.getElementById('tnaCalendarForm');
      form.onsubmit=event=>{
        event.preventDefault();
        const input=Object.fromEntries(new FormData(form).entries());
        const dates=value=>String(value||'').split(/[\r\n,]+/).map(item=>item.trim()).filter(Boolean);
        const values={name:input.name,timezone:input.timezone,sourceReference:input.sourceReference,
          workingWeek:[...form.querySelectorAll('input[name="workingWeek"]:checked')].map(node=>Number(node.value)),
          holidays:dates(input.holidays),shutdowns:dates(input.shutdowns),reason:input.reason,
          confirmed:form.querySelector('input[name="confirmed"]').checked};
        const result=domain.updateFactoryCalendar(state.currentPlan,values,{actorId:userKey()});
        const message=form.querySelector('[data-tna-calendar-error]');
        if(!result.ok){message.textContent=result.error;return;}
        try{TnaLocalEditPersistence.commit(result.plan,state.currentPlan);}
        catch{message.textContent=w.failed;return;}
        state.currentPlan=result.plan;state.dialog.close();render();
      };
    }
  }

  class GarmentTnaFollowupEditor {
    static labels(language){
      const copy={
        en:['Update activity follow-up','Responsible party','Current target finish','Forecast finish','Follow-up note / reason','Save follow-up','No dates or approval are assumed. Save Now keeps a named copy.'],
        bn:['কাজের ফলো-আপ আপডেট','দায়িত্বপ্রাপ্ত পক্ষ','বর্তমান লক্ষ্য সমাপ্তি','পূর্বাভাস সমাপ্তি','ফলো-আপ মন্তব্য / কারণ','ফলো-আপ সেভ','তারিখ বা অনুমোদন অনুমান করা হয় না।'],
        hi:['कार्य फॉलो-अप अपडेट','जिम्मेदार पक्ष','वर्तमान लक्ष्य समाप्ति','अनुमानित समाप्ति','फॉलो-अप टिप्पणी / कारण','फॉलो-अप सेव करें','तारीख और अनुमोदन का अनुमान नहीं लगाया जाता।'],
        ta:['செயல்பாடு தொடர்ச்சி புதுப்பிப்பு','பொறுப்பான தரப்பு','தற்போதைய இலக்கு முடிவு','எதிர்பார்க்கும் முடிவு','தொடர்ச்சி குறிப்பு / காரணம்','தொடர்ச்சியைச் சேமி','தேதி அல்லது ஒப்புதலை ஊகிக்க மாட்டோம்.']
      };
      return copy[language]||copy.en;
    }
    /** Renders a second, independent form; existing approval/status form stays intact. */
    static render(task,language){
      const words=this.labels(language);
      return '<section class="tna-followup-editor" aria-label="'+esc(words[0])+'">'+
        '<h3>'+esc(words[0])+'</h3>'+
        '<form class="tna-wizard" id="tnaFollowupEdit">'+
          '<div class="tna-form-grid">'+
            field('ownerParty',words[1],'text',task.ownerParty||'',true)+
            field('currentTargetFinish',words[2],'date',task.dates?.currentTargetFinish||'')+
            field('forecastFinish',words[3],'date',task.dates?.forecastFinish||'')+
          '</div>'+
          '<label class="tna-wide"><span>'+esc(words[4])+' *</span><textarea name="note" rows="3" maxlength="800" required></textarea></label>'+
          '<p class="tna-note">'+esc(words[6])+'</p>'+
          '<p role="alert" data-tna-followup-error></p>'+
          '<button class="tna-btn" type="submit">'+esc(words[5])+'</button>'+
        '</form></section>';
    }

    /**
     * Saves validated local records, preserving the existing status editor.
     * On storage failure the dialog remains open and the active plan is unchanged.
     */
    static bind(taskId){
      const form=document.getElementById('tnaFollowupEdit');
      if(!form)return;
      form.onsubmit=event=>{
        event.preventDefault();
        const values=Object.fromEntries(new FormData(form).entries());
        const result=domain.updateTaskFollowup(state.currentPlan,taskId,values,{actorId:userKey()});
        const error=form.querySelector('[data-tna-followup-error]');
        if(!result.ok){error.textContent=result.error;return;}
        try{
          TnaLocalEditPersistence.commit(result.plan,state.currentPlan);
        }catch{
          error.textContent='Could not save this update in the browser. Check available storage and retry.';
          return;
        }
        state.currentPlan=result.plan;
        state.dialog.close();render();
      };
    }

  }
  function openTaskEdit(taskId){if(!state.currentPlan)return openDialog('Edit Activity','<p>Create or open a TNA draft before editing activities.</p>');const task=state.currentPlan.tasks.find(item=>item.taskId===taskId);if(!task)return openDialog('Edit Activity','<p>Activity not found in this draft.</p>');openDialog('Edit Activity',`<form class="tna-wizard" id="tnaTaskEdit"><p><b>${esc(task.templateRef)}</b> · ${esc(task.title)}</p><div class="tna-form-grid">${selectField('nextStatus','Status',domain.STATUSES.map(status=>[status,status]),task.status)}${field('actualDate','Actual finish date','date')}${field('evidenceRef','Evidence reference')}${field('reason','Reason / note')}</div><p class="tna-note">Choose Completed only with the actual finish date, Approved only with evidence, and Waived only with a reason. The original approved plan stays unchanged.</p><button class="tna-btn" type="submit">Save activity edit</button><p role="alert" id="tnaStatusSaveError"></p></form>${GarmentTnaFollowupEditor.render(task,state.language)}`);document.getElementById('tnaTaskEdit').onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget).entries());const result=domain.updateTaskStatus(state.currentPlan,taskId,data.nextStatus,{actualDate:data.actualDate,evidenceRef:data.evidenceRef,reason:data.reason,actorId:userKey()});if(result.ok){try{TnaLocalEditPersistence.commit(result.plan,state.currentPlan);}catch{document.getElementById('tnaStatusSaveError').textContent='Unable to save this edit in this browser. Check storage and retry.';return;}state.currentPlan=result.plan;state.dialog.close();render();}else openDialog('Edit Activity',`<p>${esc(result.error)}</p>`);};GarmentTnaFollowupEditor.bind(taskId);}
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
  function reportModel(reportId){return reports.buildReportModel(state.currentPlan,{reportId,language:state.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone})}
  function markReportPrint(){document.body.classList.add('tna-printing-report');const clear=()=>document.body.classList.remove('tna-printing-report');window.addEventListener('afterprint',clear,{once:true});setTimeout(clear,2000);}
  /**
   * R01 factory/agent print view owner. Accessed by reportPreviewHtml only.
   * Displays separate source-derived civil dates and predecessors; never changes
   * saved data, infers approvals, or exports restricted follow-up notes.
   * Other report IDs keep their previous compact view.
   */
  class TnaMasterPrintView {
    static labels(language){
      const translations={
        en:['Ref / Stage','Activity','Responsible','Original baseline','Current target','Forecast','Actual','Late days','Status','Depends on','— means Needs Information. Delay uses calendar days and the recorded actual or forecast.','Master TNA activity report'],
        bn:['নং / ধাপ','কাজ','দায়িত্ব','মূল পরিকল্পনা','বর্তমান লক্ষ্য','পূর্বাভাস','বাস্তব','বিলম্ব (দিন)','অবস্থা','আগের কাজ','— অর্থ তথ্য প্রয়োজন। বিলম্ব ক্যালেন্ডারের দিনে গণনা করা।','মাস্টার TNA কাজের প্রতিবেদন'],
        hi:['क्रम / चरण','कार्य','जिम्मेदार','मूल योजना','वर्तमान लक्ष्य','पूर्वानुमान','वास्तविक','देरी (दिन)','स्थिति','पिछला कार्य','— का अर्थ जानकारी चाहिए। देरी कैलेंडर दिनों में है।','मास्टर TNA कार्य रिपोर्ट'],
        ta:['எண் / நிலை','செயல்பாடு','பொறுப்பு','முதல் திட்டம்','தற்போதைய இலக்கு','எதிர்பார்ப்பு','நிகழ்ந்தது','தாமத நாட்கள்','நிலை','முந்தைய செயல்','— என்பது தகவல் தேவை. தாமதம் காலண்டர் நாட்களில் கணக்கிடப்பட்டுள்ளது.','மாஸ்டர் TNA செயல்பாட்டு அறிக்கை']
      };
      return translations[language]||translations.en;
    }
    /** Preserve all non-R01 preview fields and their prior priority order. */
    static compact(model){
      return '<div class="tna-task-table tna-report-table" role="table" aria-label="TNA report activity preview">'+
        (model.tasks||[]).map(task=>'<div role="row"><span>'+esc(task.ref)+'</span><span>'+esc(task.title)+'</span><span>'+
          esc(task.owner)+'</span><span>'+esc(task.status)+'</span><span>'+
          esc(task.forecast||task.actual||task.current||task.baseline||'Needs Information')+'</span></div>').join('')+
        '</div>';
    }
    /** All R01 dates remain distinct, with an explicit unknown-data legend. */
    static render(model){
      if(model.reportId!=='R01'||model.masterTna?.schema!=='VESA-TNA-MASTER-1')return this.compact(model);
      const labels=this.labels(model.language);
      const header='<thead><tr>'+labels.slice(0,10).map(value=>'<th scope="col">'+esc(value)+'</th>').join('')+'</tr></thead>';
      const basis={
        en:{actual:'actual',forecast:'forecast'},bn:{actual:'বাস্তব',forecast:'পূর্বাভাস'},
        hi:{actual:'वास्तविक',forecast:'पूर्वानुमान'},ta:{actual:'நிகழ்ந்தது',forecast:'எதிர்பார்ப்பு'}
      }[model.language]||{actual:'actual',forecast:'forecast'};
      const rows=(model.masterTna.rows||[]).map(task=>{
        const delay=task.calendarDaysLate===null?'—':String(task.calendarDaysLate)+' ('+(basis[task.comparedTo]||'—')+')';
        const cells=[task.activity,task.owner,task.baseline||'—',task.target||'—',task.forecast||'—',task.actual||'—',delay,task.status,task.dependencies];
        return '<tr><td class="tna-report-master-ref"><strong>'+esc(task.ref)+'</strong><small>'+esc(task.stage)+'</small></td>'+
          cells.map(value=>'<td>'+esc(value)+'</td>').join('')+'</tr>';
      }).join('');
      return '<div class="tna-master-print">'+
        '<p class="tna-report-master-legend">'+esc(labels[10])+'</p>'+
        '<div class="tna-report-master-scroll" tabindex="0" aria-label="'+esc(labels[11])+'">'+
        '<table class="tna-report-master-table"><colgroup>'+
        ['9%','24%','12%','8%','8%','8%','8%','7%','9%','7%'].map(width=>'<col style="width:'+width+'">').join('')+
        '</colgroup>'+header+'<tbody>'+rows+'</tbody></table></div></div>';
    }

  }
  /**
   * R03 factory-department preview and print owner.
   * Called only from reportPreviewHtml for report R03; reads a typed projection.
   * Never changes plan, renders buyer data, or invents dates/approval authority.
   * Rows are escaped; work with confirmed as-of date, or show Needs Information.
   */
  class TnaFactoryDailyPrintView {
    /** Render one source-backed task row; notes and proof text stay escaped. */
    static taskRow(item,daily){
      const labels=daily.labels;
      const proof=item.proofRefs?.length?item.proofRefs.join(' · '):labels.missing;
      const days=item.calendarDaysFromToday===null?labels.missing:String(item.calendarDaysFromToday);
      const due=item.due||labels.missing;
      const source=labels.source[item.dateSource]||labels.missing;
      return '<tr>'+
        '<td><strong>'+esc(item.ref)+'</strong><small>'+esc(item.stage)+'</small><div>'+esc(item.title)+'</div></td>'+
        '<td>'+esc(item.owner)+'</td>'+
        '<td>'+esc(due)+'<small>'+esc(source)+'</small></td>'+
        '<td>'+esc(days)+'</td>'+
        '<td>'+esc(item.status)+'</td>'+
        '<td><div><strong>'+esc(labels.columns[8])+':</strong> '+esc(item.delayReason||labels.missing)+'</div>'+
        '<div><strong>'+esc(labels.columns[9])+':</strong> '+esc(item.followupNote||labels.missing)+'</div>'+
        '<div><strong>'+esc(labels.columns[10])+':</strong> '+esc(proof)+'</div></td></tr>';
    }

    /**
     * Present actionable overdue/today/seven-day/missing-date groups.
     * Later work is explicitly counted but omitted from this daily print list;
     * the complete open-task data remains in the R03 Excel worksheet.
     */
    static render(model){
      const daily=model.factoryDailyAction;
      if(daily?.schema!=='VESA-TNA-DAILY-1')return '<p>Factory Daily Action needs information.</p>';
      const labels=daily.labels;
      const order=['overdue','today','nextSeven','needsInformation'];
      const head=[labels.columns[1]+' / '+labels.columns[2],labels.columns[3],
        labels.columns[4],labels.columns[6],labels.columns[7],labels.columns[8]+' / '+labels.columns[10]];
      const header='<thead><tr>'+head.map(value=>'<th scope="col">'+esc(value)+'</th>').join('')+'</tr></thead>';
      const summary=order.concat('later').map(group=>'<span><strong>'+esc(labels.groups[group])+':</strong> '+esc(daily.counts[group]||0)+'</span>').join('');
      const sections=order.map(group=>{
        const items=daily.groups[group]||[];
        if(!items.length)return '';
        return '<section class="tna-daily-section"><h4>'+esc(labels.groups[group])+' ('+esc(items.length)+')</h4>'+
          '<div class="tna-daily-scroll"><table class="tna-daily-report-table">'+header+
          '<tbody>'+items.map(item=>this.taskRow(item,daily)).join('')+'</tbody></table></div></section>';
      }).join('');
      return '<div class="tna-factory-daily-preview" aria-label="Factory Daily Action">'+
        '<p class="tna-daily-report-note">'+esc(labels.asOf)+': '+esc(daily.asOfDate||labels.missing)+
        ' · '+esc(model.timezone||labels.missing)+' · '+esc(labels.basis)+'</p>'+
        '<div class="tna-daily-summary">'+summary+'</div>'+
        '<p class="tna-daily-report-note">'+esc(labels.note)+'</p>'+
        (sections||'<p>'+esc(labels.missing)+'</p>')+'</div>';
    }


  }

  /**
   * Read-only management R04 print preview, owned by the existing report dialog.
   * Access: reportPreviewHtml(model), not a new route or navigation system.
   * An incomplete user calendar / dependency graph shows gaps, never invented
   * float or buyer delivery promises. All entered source fields are HTML-escaped.
   */
  class TnaCriticalPathPrintView {
    /** Render one translated warning list, keeping missing facts actionable. */
    static gaps(cpm){
      const issues=[...(cpm.missingInputs||[]),...(cpm.errors||[])];
      return '<section class="tna-cpm-unavailable"><h3>'+esc(cpm.labels.unknown)+'</h3><p>'+esc(cpm.labels.missing)+'</p>'+
        '<ul>'+issues.map(issue=>'<li>'+esc(issue)+'</li>').join('')+'</ul>'+
        '<p class="tna-note">'+esc(cpm.labels.note)+'</p></section>';
    }
    /** Report the exact engine path/float output with a conservative audience note. */
    static render(model){
      const cpm=model.criticalPath;
      if(cpm?.schema!=='VESA-TNA-CPM-1')return '<p>Needs Information — CPM projection is unavailable.</p>';
      if(cpm.validity!=='valid')return this.gaps(cpm);
      const l=cpm.labels;
      const head=l.labels.slice(0,10);
      const displayed=[head[0],head[1],head[2],head[3],head[4],head[5],head[6],head[7],head[8],head[9]];
      const header='<thead><tr>'+displayed.map(item=>'<th scope="col">'+esc(item)+'</th>').join('')+'</tr></thead>';
      const rows=(cpm.rows||[]).map(row=>'<tr>'+
        '<td><strong>'+esc(row.ref)+'</strong><small>'+esc(row.stage)+'</small></td>'+
        [row.activity,row.owner,row.earlyStart,row.earlyFinish,row.lateFinish,
          String(row.totalFloat)+' ('+row.durationBasis+')',String(row.freeFloat)+' ('+row.durationBasis+')',row.isCritical?'Yes':'No',row.status]
          .map(item=>'<td>'+esc(item)+'</td>').join('')+'</tr>').join('');
      const chains=cpm.criticalPaths.length?
        '<ol>'+cpm.criticalPaths.map(path=>'<li>'+esc(path.join(' → '))+'</li>').join('')+'</ol>':
        '<p>'+esc(l.noZero)+'</p>';
      const conflicts=cpm.constraintViolations.length?
        '<ul>'+cpm.constraintViolations.map(item=>'<li>'+esc(item.explanation||item.type)+'</li>').join('')+'</ul>':
        '<p>'+esc(l.noViolations)+'</p>';
      return '<section class="tna-cpm-print" aria-label="'+esc(l.title)+'">'+
        '<p class="tna-note">'+esc(l.note)+'</p><div class="tna-cpm-summary">'+
        '<span><b>'+esc(l.asOf)+':</b> '+esc(cpm.planningStart)+' ('+esc(cpm.startSource||'—')+')</span>'+
        '<span><b>'+esc(l.required)+':</b> '+esc(cpm.requiredDate)+'</span>'+
        '<span><b>'+esc(l.forecast)+':</b> '+esc(cpm.forecastDate)+'</span>'+
        '<span><b>'+esc(l.buffer)+':</b> '+esc(cpm.workingDaysEarlyOrLate)+'</span></div>'+
        '<h3>'+esc(l.paths)+'</h3>'+chains+
        '<h3>'+esc(l.violations)+'</h3>'+conflicts+
        '<div class="tna-cpm-scroll"><table class="tna-cpm-table">'+header+'<tbody>'+rows+'</tbody></table></div>'+
        '</section>';
    }
  }

  /**
   * One read-only buyer milestone print/preview owner for report R02.
   * Called only by the existing report-preview dispatcher. It consumes the
   * redacted R02 model; it cannot read local storage, actual plan, approvals,
   * internal free-text evidence or recipient permissions. All text is escaped.
   * An explicit notice prevents print/PDF being mistaken for buyer sign-off.
   */
  class TnaBuyerPrintView {
    /** Separate known buyer-facing milestones from unrestricted activity tables. */
    static render(model){
      const buyer=model.buyerTna;
      if(buyer?.schema!=='VESA-TNA-BUYER-1')return '<p>Needs Information — buyer milestones unavailable.</p>';
      const w=buyer.labels;
      const heads=w.cols.slice(0,10);
      const header='<thead><tr>'+heads.map(value=>'<th scope="col">'+esc(value)+'</th>').join('')+'</tr></thead>';
      const body=buyer.rows.map(row=>{
        const cells=[row.ref,row.title,row.original||'—',row.target||'—',
          row.forecast||'—',row.actual||'—',row.statusLabel,
          row.buyerAction,row.explanation,row.targetVerification];
        return '<tr>'+cells.map(value=>'<td>'+esc(value)+'</td>').join('')+'</tr>';
      }).join('');
      const actions=buyer.requiredActions.length?
        '<ol>'+buyer.requiredActions.map(row=>'<li><strong>'+esc(row.ref)+' · '+esc(row.title)+
          '</strong>: '+esc(row.action)+'</li>').join('')+'</ol>':
        '<p>'+esc(w.noAction)+'</p>';
      return '<section class="tna-buyer-report" aria-label="'+esc(w.title)+'">'+
        '<p class="tna-buyer-review-note" role="note">'+esc(buyer.notice)+'</p>'+
        '<p class="tna-note">'+esc(buyer.locallyRecorded)+'</p>'+
        '<p class="tna-note tna-buyer-date-legend">'+esc(w.missingLegend)+'</p>'+
        '<div class="tna-buyer-summary">'+
          '<span><strong>'+esc(w.required)+':</strong> '+esc(buyer.order.requiredExFactory)+'</span>'+
          '<span><strong>'+esc(w.cols[4]+':')+'</strong> '+esc(buyer.forecastExFactory||w.unknown)+'</span>'+
          '<span><strong>'+esc(w.cols[9]+':')+'</strong> '+esc(buyer.targetVerification)+'</span>'+
        '</div>'+
        '<h3>'+esc(w.title)+'</h3>'+
        '<div class="tna-buyer-scroll" tabindex="0"><table class="tna-buyer-milestone-table">'+header+
          '<tbody>'+body+'</tbody></table></div>'+
        '<h3>'+esc(w.cols[7])+' ('+esc(buyer.requiredActions.length)+')</h3>'+actions+
      '</section>';
    }
  }

  function reportPreviewHtml(model){return `<article class="tna-report-preview"><h2>${esc(model.title)}</h2><p><b>${esc(model.brand)}</b> · ${esc(model.reportId)} · ${esc(model.audience)}</p><p>${esc(model.labels.generated)}: ${esc(model.generatedLabel)} · ${esc(model.labels.timezone)}: ${esc(model.timezone)} · ${esc(model.labels.revision)}: ${esc(model.revision)}</p><h3>${esc(model.headings.order)}</h3><div class="tna-report-grid"><span>${esc(model.labels.buyer)}: ${esc(model.order.buyer)}</span><span>${esc(model.labels.factory)}: ${esc(model.order.factory)}</span><span>${esc(model.labels.style)}: ${esc(model.order.style)}</span><span>${esc(model.labels.po)}: ${esc(model.order.po)}</span><span>${esc(model.labels.quantity)}: ${esc(model.order.quantity)} ${esc(model.order.unit)}</span><span>${esc(model.labels.required)}: ${esc(model.order.requiredExFactory)}</span></div><h3>${esc(model.headings.tasks)}</h3>${model.reportId==='R02'?TnaBuyerPrintView.render(model):model.reportId==='R03'?TnaFactoryDailyPrintView.render(model):model.reportId==='R04'?TnaCriticalPathPrintView.render(model):TnaMasterPrintView.render(model)}<h3>${esc(model.headings.warnings)}</h3>${model.warnings.length?`<ul>${model.warnings.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'<p>No validation warnings in this local draft.</p>'}<p class="tna-note">${esc(model.notes.join(' '))}</p></article>`}
  function openReportPanel(action='Prepare Report'){if(!reports)return openDialog('Reports','<p>Reports are temporarily unavailable. Keep the order open and try again.</p>');if(!state.currentPlan)return openDialog('Reports','<p>Create or open a TNA before preparing reports.</p>');if(state.currentPlan.mode==='practice')return openDialog('Reports','<p>Practice example reports are preview-only and cannot be used as business evidence.</p>');const first=reports.catalogue(state.language)[0];openDialog('Reports',`<div class="tna-form-grid"><label><span>Report type</span><select id="tnaReportType">${reportOptions()}</select></label><label><span>Language</span><input readonly value="${esc(state.language)}"></label></div><div class="menu-grid"><button class="tna-btn" type="button" data-report-action="preview">Preview report</button><button class="tna-btn secondary" type="button" data-report-action="download">Download report data</button><button class="tna-btn secondary" type="button" data-report-action="excel">Download report Excel</button><button class="tna-btn secondary" type="button" data-report-action="print">Print report</button><button class="tna-btn secondary" type="button" data-report-action="share">Share fallback</button></div><div id="tnaReportPreview">${reportPreviewHtml(reportModel(first.id))}</div>`);const update=()=>{document.getElementById('tnaReportPreview').innerHTML=reportPreviewHtml(reportModel(document.getElementById('tnaReportType').value));};document.getElementById('tnaReportType').onchange=update;document.querySelectorAll('[data-report-action]').forEach(btn=>btn.onclick=()=>{const model=reportModel(document.getElementById('tnaReportType').value);if(btn.dataset.reportAction==='preview')return update();if(btn.dataset.reportAction==='print'){update();markReportPrint();return window.print();}if(btn.dataset.reportAction==='share')return openDialog('Share fallback',`<p>${esc(model.labels.shareFallback)}</p><p>A shared link is unavailable in local mode. Download the report and share it through an approved channel.</p>`);if(btn.dataset.reportAction==='excel'){try{const data=storage.exportReportWorkbook(model);const blob=new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`vesa-tna-${model.reportId}-${model.order.style}.xlsx`.replace(/[^a-z0-9_.-]+/gi,'-');document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}catch(error){return openDialog('Download report Excel',`<p>${esc(error.message)}</p>`);}}const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`vesa-tna-${model.reportId}-${model.order.style}.json`.replace(/[^a-z0-9_.-]+/gi,'-');document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});}
  function openImportPreview(){openDialog('Import Excel TNA',`<p>${esc(text('xlsxBlocked'))}</p><input id="tnaWorkbookFile" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,.tsv,text/csv,text/tab-separated-values"><label class="tna-wide"><span>Pasted table preview</span><textarea id="tnaImportText" rows="8" placeholder="Buyer,Factory,Style,PO,Quantity,Buyer Required Ex-Factory"></textarea></label><div class="menu-grid"><button class="tna-btn" type="button" data-import-preview="text">Preview pasted text</button><button class="tna-btn secondary" type="button" data-import-preview="file">Preview selected file</button></div><div id="tnaImportPreviewResult"></div>`);document.querySelector('[data-import-preview="text"]').onclick=()=>renderImportPreview(storage.importPreview(document.getElementById('tnaImportText').value));document.querySelector('[data-import-preview="file"]').onclick=()=>{const file=document.getElementById('tnaWorkbookFile').files?.[0];if(!file)return renderImportError('Select an Excel workbook or pasted table first.');const lower=file.name.toLowerCase();const reader=new FileReader();reader.onerror=()=>renderImportError('The selected file could not be read. Choose the original file and try again.');if(lower.endsWith('.xlsx')){reader.onload=()=>{try{renderImportPreview(storage.importWorkbookPreview(reader.result,file.name));}catch(error){renderImportError(error.message);}};reader.readAsArrayBuffer(file);return;}if(lower.endsWith('.xlsm'))return renderImportError('Excel workbooks with macros are not accepted. Save a clean workbook without macros and try again.');reader.onload=()=>{try{renderImportPreview(storage.importPreview(String(reader.result||'')));}catch(error){renderImportError(error.message);}};reader.readAsText(file);};}
  function renderImportPreview(preview){document.getElementById('tnaImportPreviewResult').innerHTML=`<h3>${esc(text('importPreview'))}</h3>${preview.workbook?`<p>Workbook sheet: ${esc(preview.workbook.sheetName)} · rows: ${esc(preview.workbook.rowCount)} · parser: ${esc(preview.workbook.parser)}</p>`:''}<p>Headers: ${esc(preview.headers.join(' · ')||'none')}</p><p>Rows previewed: ${esc(preview.rows.length)}</p>${preview.warnings.length?`<ul>${preview.warnings.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'<p>No import warnings found in the preview.</p>'}<p class="tna-note">Preview only. Creating or updating production TNAs from spreadsheets requires a reviewed mapping step and does not overwrite existing TNA records.</p>`;}
  function renderImportError(message){document.getElementById('tnaImportPreviewResult').innerHTML=`<p>${esc(message)}</p>`;}
  function saveNow(){if(!state.currentPlan)return openDialog('Save TNA','<p>Create or open a TNA draft before saving.</p>');if(state.currentPlan.mode==='practice')return openDialog('Save TNA','<p>Practice example is isolated and cannot be saved into real production records.</p>');try{const saved=storage.savePlan(state.currentPlan,userKey());render();openDialog('Save TNA',`<p>Saved locally in this browser.</p><p><b>${esc(saved.style||'Untitled TNA')}</b> · ${esc(saved.po||'PO unknown')}</p>`);}catch(error){openDialog('Save TNA',`<p>${esc(error.message)}</p>`);}}
  function downloadCopy(){if(!state.currentPlan)return openDialog('Download Saved Copy','<p>Create or open a TNA draft before downloading a saved copy.</p>');if(state.currentPlan.mode==='practice')return openDialog('Download Saved Copy','<p>Practice example cannot be exported as business evidence. Create a real TNA first.</p>');try{const text=storage.exportCopy(state.currentPlan);const name=`vesa-tna-${(state.currentPlan.order.styles?.[0]?.styleNo||state.currentPlan.recordId||'copy').replace(/[^a-z0-9_-]+/gi,'-')}.json`;if(typeof Blob!=='undefined'&&document.createElement){const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}openDialog('Download Saved Copy',`<p>Portable copy prepared and checksum protected.</p><p>File name: <b>${esc(name)}</b></p><textarea readonly rows="6">${esc(text.slice(0,1200))}</textarea>`);}catch(error){openDialog('Download Saved Copy',`<p>${esc(error.message)}</p>`);}}
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.dialog?.open)state.dialog.close();});
  window.addEventListener('vesa-preferences-change',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
