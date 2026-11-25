(function(){
  'use strict';

  const KEY='vesa.app.preferences.v1';
  const AQL_KEY='vesa360-personal-appearance-v1';
  const LANG_KEYS=['vesa.app.language','vesa-guide-language','vesa.ppm.language'];
  const THEMES={
    'clear-blue':{name:'Clear Blue',note:'White / blue',dark:false,canvas:'#f3f6fa',paper:'#ffffff',surface:'#eef3f9',ink:'#17263d',muted:'#526176',line:'#cbd6e4',accent:'#244fd6',soft:'#eaf0ff',on:'#ffffff',sidebar:'#071a35',sideInk:'#ffffff',sideMuted:'#c8d6e3',sideActive:'#132b4b',sideAccent:'#7ea6ff',field:'#ffffff'},
    'pure-mono':{name:'Pure Mono',note:'White / black',dark:false,canvas:'#f3f3f3',paper:'#ffffff',surface:'#eeeeef',ink:'#202124',muted:'#585b62',line:'#c9cbcf',accent:'#202124',soft:'#e9e9eb',on:'#ffffff',sidebar:'#111316',sideInk:'#f2f4f7',sideMuted:'#c9ccd2',sideActive:'#2b2f34',sideAccent:'#ffffff',field:'#ffffff'},
    'midnight-mono':{name:'Midnight Mono',note:'Black / white',dark:true,canvas:'#101214',paper:'#191c20',surface:'#252a31',ink:'#f2f4f7',muted:'#b4bdc9',line:'#48515e',accent:'#f0f2f5',soft:'#303741',on:'#14171a',sidebar:'#0b0d10',sideInk:'#e3e8ee',sideMuted:'#aeb9c8',sideActive:'#2b333e',sideAccent:'#f0f2f5',field:'#14181e'},
    'forest-yellow':{name:'Forest Yellow',note:'Deep green / yellow',dark:true,canvas:'#0e211b',paper:'#173128',surface:'#203d31',ink:'#f4f7ed',muted:'#bfcec4',line:'#4c6758',accent:'#f5d66f',soft:'#394633',on:'#223221',sidebar:'#091b15',sideInk:'#e5eddb',sideMuted:'#b9cbbb',sideActive:'#324534',sideAccent:'#f5d66f',field:'#10271f'},
    'warm-ivory':{name:'Warm Ivory',note:'Ivory / walnut',dark:false,canvas:'#f4f0e7',paper:'#fffcf6',surface:'#eee8dc',ink:'#302a23',muted:'#6d6153',line:'#d7cbb9',accent:'#765338',soft:'#eee3d6',on:'#fffdf8',sidebar:'#3b332b',sideInk:'#f5ebdb',sideMuted:'#d0c0ac',sideActive:'#544638',sideAccent:'#ffdfb7',field:'#fffefb'}
  };
  const DEFAULT={theme:'clear-blue',language:'en',density:'comfortable',font:'modern'};
  const LABELS={
    en:{language:'Language',appearance:'Appearance',theme:'Theme',login:'Login',userId:'User ID',password:'Password',loginHelp:'Enter your user ID and password to open the App Centre.',appCentre:'App Centre',choose:'Choose Your Workspace',chooseText:'Open the approved VESA tools for local forms, calculations, saved copies and reports.',openAql:'Open AQL',openPpm:'Open PPM',openTna:'Open TNA',admin:'Admin',logout:'Logout',saved:'Preferences saved for this browser.',openCosting:'Open Costing',openPacking:'Open Packing',openCommission:'Open Commission',openTechSpec:'Open Tech Pack',openPurchaseOrder:'Open Purchase Order',openLC:'Open LC & Payment',openSampling:'Open Sampling',openFabricTrims:'Open Fabric & Trims',openShipment:'Open Shipment & Docs',openProduction:'Open Production',openFactoryVendor:'Open Factory & Vendor',openLabelArtwork:'Open Label & Artwork',openBuyerCRM:'Open Buyer CRM',openFabricSupplier:'Open Fabric & Supplier Comparison',openClaims:'Open Claims & Disputes',openProductDevelopment:'Open Product Development',openChess:'Open Chess'},
    es:{language:'Idioma',appearance:'Apariencia',theme:'Tema',login:'Iniciar sesión',userId:'ID de usuario',password:'Contraseña',loginHelp:'Introduce tus datos para abrir el centro de aplicaciones.',appCentre:'Centro de aplicaciones',choose:'Elige tu espacio de trabajo',chooseText:'Abre las herramientas de VESA para formularios, cálculos, copias guardadas e informes.',openAql:'Abrir AQL',openPpm:'Abrir PPM',openTna:'Abrir TNA',admin:'Administración',logout:'Cerrar sesión',saved:'Preferencias guardadas en este navegador.',openCosting:'Abrir costos',openPacking:'Abrir embalaje',openCommission:'Abrir comisiones',openTechSpec:'Abrir ficha técnica',openPurchaseOrder:'Abrir órdenes de compra',openLC:'Abrir LC y pagos',openSampling:'Abrir muestras',openFabricTrims:'Abrir telas y accesorios',openShipment:'Abrir envíos y documentos',openProduction:'Abrir producción',openFactoryVendor:'Abrir fábricas y proveedores',openLabelArtwork:'Abrir etiquetas y diseños',openBuyerCRM:'Abrir clientes',openFabricSupplier:'Abrir comparación de telas',openClaims:'Abrir reclamaciones',openProductDevelopment:'Abrir desarrollo de producto',openChess:'Abrir ajedrez'},
    ta:{language:'மொழி',appearance:'தோற்றம்',theme:'நிறத்தோற்றம்',login:'உள்நுழைவு',userId:'பயனர் ஐடி',password:'கடவுச்சொல்',loginHelp:'செயலி மையத்தைத் திறக்க பயனர் ஐடி மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',appCentre:'செயலி மையம்',choose:'பணியிடத்தைத் தேர்வு செய்யவும்',chooseText:'படிவங்கள், கணக்கீடுகள், சேமித்த நகல்கள் மற்றும் அறிக்கைகளுக்கான VESA கருவிகளைத் திறக்கவும்.',openAql:'AQL திறக்கவும்',openPpm:'PPM திறக்கவும்',openTna:'TNA திறக்கவும்',admin:'நிர்வாகம்',logout:'வெளியேறு',saved:'இந்த உலாவியில் விருப்பங்கள் சேமிக்கப்பட்டன.',openCosting:'Costing திறக்கவும்',openPacking:'Packing திறக்கவும்',openCommission:'Commission திறக்கவும்',openTechSpec:'Tech Pack திறக்கவும்',openPurchaseOrder:'Purchase Order திறக்கவும்',openLC:'LC & Payment திறக்கவும்',openSampling:'Sampling திறக்கவும்',openFabricTrims:'Fabric & Trims திறக்கவும்',openShipment:'Shipment & Docs திறக்கவும்',openProduction:'Production திறக்கவும்',openFactoryVendor:'Factory & Vendor திறக்கவும்',openLabelArtwork:'Label & Artwork திறக்கவும்',openBuyerCRM:'Buyer CRM திறக்கவும்',openFabricSupplier:'Fabric & Supplier Comparison திறக்கவும்',openClaims:'Claims & Disputes திறக்கவும்',openProductDevelopment:'Product Development திறக்கவும்',openChess:'Chess திறக்கவும்'},
    bn:{language:'ভাষা',appearance:'চেহারা',theme:'থিম',login:'লগইন',userId:'ব্যবহারকারী আইডি',password:'পাসওয়ার্ড',loginHelp:'অ্যাপ কেন্দ্র খুলতে ব্যবহারকারী আইডি ও পাসওয়ার্ড দিন।',appCentre:'অ্যাপ কেন্দ্র',choose:'কর্মক্ষেত্র নির্বাচন করুন',chooseText:'ফর্ম, হিসাব, সংরক্ষিত কপি ও রিপোর্টের জন্য VESA টুল খুলুন।',openAql:'AQL খুলুন',openPpm:'PPM খুলুন',openTna:'TNA খুলুন',admin:'প্রশাসন',logout:'লগ আউট',saved:'এই ব্রাউজারে পছন্দ সংরক্ষিত হয়েছে।',openCosting:'Costing খুলুন',openPacking:'Packing খুলুন',openCommission:'কমিশন খুলুন',openTechSpec:'টেক প্যাক খুলুন',openPurchaseOrder:'PO খুলুন',openLC:'LC ও পেমেন্ট খুলুন',openSampling:'স্যাম্পলিং খুলুন',openFabricTrims:'ফ্যাব্রিক ও ট্রিমস খুলুন',openShipment:'শিপমেন্ট ও নথি খুলুন',openProduction:'প্রোডাকশন খুলুন',openFactoryVendor:'ফ্যাক্টরি ও ভেন্ডর খুলুন',openLabelArtwork:'লেবেল ও আর্টওয়ার্ক খুলুন',openBuyerCRM:'বায়ার CRM খুলুন',openFabricSupplier:'ফ্যাব্রিক ও সাপ্লায়ার তুলনা খুলুন',openClaims:'ক্লেইম ও বিরোধ খুলুন',openProductDevelopment:'প্রোডাক্ট ডেভেলপমেন্ট খুলুন',openChess:'চেস খুলুন'},
    hi:{language:'भाषा',appearance:'रूप',theme:'थीम',login:'लॉगिन',userId:'यूज़र आईडी',password:'पासवर्ड',loginHelp:'ऐप केंद्र खोलने के लिए यूज़र आईडी और पासवर्ड दर्ज करें।',appCentre:'ऐप केंद्र',choose:'कार्यक्षेत्र चुनें',chooseText:'फ़ॉर्म, गणना, सहेजी गई प्रतियों और रिपोर्ट के लिए VESA उपकरण खोलें।',openAql:'AQL खोलें',openPpm:'PPM खोलें',openTna:'TNA खोलें',admin:'प्रशासन',logout:'लॉग आउट',saved:'इस ब्राउज़र में प्राथमिकताएँ सहेजी गईं।',openCosting:'Costing खोलें',openPacking:'Packing खोलें',openCommission:'कमीशन खोलें',openTechSpec:'टेक पैक खोलें',openPurchaseOrder:'Purchase Order खोलें',openLC:'LC व पेमेंट खोलें',openSampling:'सैंपलिंग खोलें',openFabricTrims:'फैब्रिक और ट्रिम्स खोलें',openShipment:'शिपमेंट और दस्तावेज़ खोलें',openProduction:'प्रोडक्शन खोलें',openFactoryVendor:'फैक्ट्री और वेंडर खोलें',openLabelArtwork:'लेबल और आर्टवर्क खोलें',openBuyerCRM:'बायर CRM खोलें',openFabricSupplier:'फैब्रिक और सप्लायर तुलना खोलें',openClaims:'दावे व विवाद खोलें',openProductDevelopment:'प्रोडक्ट डेवलपमेंट खोलें',openChess:'शतरंज खोलें'},
  };
  // Shared, authored interface wording only; never pass order/user fields to ui().
  const UI_LANGUAGES=['en','bn','hi','ta','es'];
  const PLATFORM_COPY=new Map([
  [
    "Home",
    "হোম",
    "होम",
    "முகப்பு",
    "Inicio"
  ],
  [
    "File",
    "ফাইল",
    "फ़ाइल",
    "கோப்பு",
    "Archivo"
  ],
  [
    "Edit",
    "সম্পাদনা",
    "संपादित करें",
    "திருத்து",
    "Editar"
  ],
  [
    "View",
    "দেখুন",
    "देखें",
    "பார்வை",
    "Ver"
  ],
  [
    "Tools",
    "টুলস",
    "उपकरण",
    "கருவிகள்",
    "Herramientas"
  ],
  [
    "Help",
    "সহায়তা",
    "सहायता",
    "உதவி",
    "Ayuda"
  ],
  [
    "Settings",
    "সেটিংস",
    "सेटिंग्स",
    "அமைப்புகள்",
    "Configuración"
  ],
  [
    "Close",
    "বন্ধ করুন",
    "बंद करें",
    "மூடு",
    "Cerrar"
  ],
  [
    "Close settings",
    "সেটিংস বন্ধ করুন",
    "सेटिंग्स बंद करें",
    "அமைப்புகளை மூடு",
    "Cerrar configuración"
  ],
  [
    "Menu",
    "মেনু",
    "मेनू",
    "பட்டியல்",
    "Menú"
  ],
  [
    "Skip to main content",
    "মূল বিষয়বস্তুতে যান",
    "मुख्य सामग्री पर जाएँ",
    "முதன்மை உள்ளடக்கத்திற்குச் செல்",
    "Ir al contenido principal"
  ],
  [
    "VESA home",
    "VESA হোম",
    "VESA होम",
    "VESA முகப்பு",
    "Inicio de VESA"
  ],
  [
    "Current VESA workspace",
    "বর্তমান VESA কর্মক্ষেত্র",
    "वर्तमान VESA कार्यक्षेत्र",
    "தற்போதைய VESA பணியிடம்",
    "Espacio de trabajo actual de VESA"
  ],
  [
    "VESA workspace menu",
    "VESA কর্মক্ষেত্র মেনু",
    "VESA कार्यक्षेत्र मेनू",
    "VESA பணியிடப் பட்டியல்",
    "Menú del espacio de trabajo de VESA"
  ],
  [
    "App Centre",
    "অ্যাপ কেন্দ্র",
    "ऐप केंद्र",
    "செயலி மையம்",
    "Centro de aplicaciones"
  ],
  [
    "Admin",
    "প্রশাসন",
    "प्रशासन",
    "நிர்வாகம்",
    "Administración"
  ],
  [
    "Logout",
    "লগ আউট",
    "लॉग आउट",
    "வெளியேறு",
    "Cerrar sesión"
  ],
  [
    "Saving…",
    "সংরক্ষণ হচ্ছে…",
    "सहेज रहे हैं…",
    "சேமிக்கப்படுகிறது…",
    "Guardando…"
  ],
  [
    "Saved on this device",
    "এই ডিভাইসে সংরক্ষিত",
    "इस डिवाइस पर सहेजा गया",
    "இந்த சாதனத்தில் சேமிக்கப்பட்டது",
    "Guardado en este dispositivo"
  ],
  [
    "Unsaved changes",
    "অসংরক্ষিত পরিবর্তন",
    "न सहेजे गए बदलाव",
    "சேமிக்காத மாற்றங்கள்",
    "Cambios sin guardar"
  ],
  [
    "Could not save — download a saved copy",
    "সংরক্ষণ করা যায়নি — একটি কপি ডাউনলোড করুন",
    "सहेजा नहीं जा सका — एक प्रति डाउनलोड करें",
    "சேமிக்க முடியவில்லை — நகலைப் பதிவிறக்கவும்",
    "No se pudo guardar — descarga una copia"
  ],
  [
    "Local browser only",
    "শুধু এই ব্রাউজারে",
    "केवल इस ब्राउज़र में",
    "இந்த உலாவியில் மட்டும்",
    "Solo en este navegador"
  ],
  [
    "Language and appearance apply to this browser. Saved records and entered values are unchanged.",
    "ভাষা ও চেহারা এই ব্রাউজারে প্রযোজ্য। সংরক্ষিত রেকর্ড ও দেওয়া মান অপরিবর্তিত থাকবে।",
    "भाषा और रूप इस ब्राउज़र पर लागू हैं। सहेजे गए रिकॉर्ड और दर्ज मान नहीं बदलेंगे।",
    "மொழியும் தோற்றமும் இந்த உலாவிக்குப் பொருந்தும். சேமித்த பதிவுகளும் உள்ளிட்ட மதிப்புகளும் மாறாது.",
    "El idioma y la apariencia se aplican a este navegador. Los registros guardados y los valores introducidos no cambian."
  ],
  [
    "Change language at Login",
    "লগইন পৃষ্ঠায় ভাষা পরিবর্তন করুন",
    "लॉगिन पेज पर भाषा बदलें",
    "உள்நுழைவு பக்கத்தில் மொழியை மாற்றவும்",
    "Cambiar idioma en el inicio de sesión"
  ],
  [
    "WORKSPACE SETTINGS",
    "কর্মক্ষেত্র সেটিংস",
    "कार्यक्षेत्र सेटिंग्स",
    "பணியிட அமைப்புகள்",
    "CONFIGURACIÓN DEL ESPACIO DE TRABAJO"
  ],
  [
    "User Access",
    "ব্যবহারকারীর প্রবেশাধিকার",
    "उपयोगकर्ता पहुँच",
    "பயனர் அணுகல்",
    "Acceso de usuarios"
  ],
  [
    "Add users, manage local access and review the login activity stored on this device.",
    "ব্যবহারকারী যোগ করুন, স্থানীয় প্রবেশাধিকার পরিচালনা করুন এবং এই ডিভাইসের লগইন কার্যক্রম দেখুন।",
    "उपयोगकर्ता जोड़ें, स्थानीय पहुँच प्रबंधित करें और इस डिवाइस की लॉगिन गतिविधि देखें।",
    "பயனர்களைச் சேர்த்து, உள்ளூர் அணுகலை நிர்வகித்து, இந்த சாதனத்தின் உள்நுழைவுச் செயல்பாட்டைப் பார்க்கவும்.",
    "Añade usuarios, gestiona el acceso local y revisa la actividad de inicio de sesión de este dispositivo."
  ],
  [
    "User administration",
    "ব্যবহারকারী প্রশাসন",
    "उपयोगकर्ता प्रशासन",
    "பயனர் நிர்வாகம்",
    "Administración de usuarios"
  ],
  [
    "Add a user",
    "ব্যবহারকারী যোগ করুন",
    "उपयोगकर्ता जोड़ें",
    "பயனரைச் சேர்க்கவும்",
    "Añadir usuario"
  ],
  [
    "Create a login for someone who uses this browser.",
    "এই ব্রাউজার ব্যবহারকারীর জন্য লগইন তৈরি করুন।",
    "इस ब्राउज़र के उपयोगकर्ता के लिए लॉगिन बनाएँ।",
    "இந்த உலாவியைப் பயன்படுத்துபவருக்கு உள்நுழைவை உருவாக்கவும்.",
    "Crea un inicio de sesión para quien utiliza este navegador."
  ],
  [
    "Name",
    "নাম",
    "नाम",
    "பெயர்",
    "Nombre"
  ],
  [
    "User ID / email",
    "ব্যবহারকারী আইডি / ইমেইল",
    "यूज़र आईडी / ईमेल",
    "பயனர் ஐடி / மின்னஞ்சல்",
    "ID de usuario / correo"
  ],
  [
    "Password",
    "পাসওয়ার্ড",
    "पासवर्ड",
    "கடவுச்சொல்",
    "Contraseña"
  ],
  [
    "Role",
    "ভূমিকা",
    "भूमिका",
    "பங்கு",
    "Rol"
  ],
  [
    "User",
    "ব্যবহারকারী",
    "उपयोगकर्ता",
    "பயனர்",
    "Usuario"
  ],
  [
    "Create User",
    "ব্যবহারকারী তৈরি করুন",
    "उपयोगकर्ता बनाएँ",
    "பயனரை உருவாக்கவும்",
    "Crear usuario"
  ],
  [
    "Users",
    "ব্যবহারকারীরা",
    "उपयोगकर्ता",
    "பயனர்கள்",
    "Usuarios"
  ],
  [
    "This browser",
    "এই ব্রাউজার",
    "यह ब्राउज़र",
    "இந்த உலாவி",
    "Este navegador"
  ],
  [
    "Login History",
    "লগইন ইতিহাস",
    "लॉगिन इतिहास",
    "உள்நுழைவு வரலாறு",
    "Historial de inicio de sesión"
  ],
  [
    "Download CSV",
    "CSV ডাউনলোড করুন",
    "CSV डाउनलोड करें",
    "CSV பதிவிறக்கவும்",
    "Descargar CSV"
  ],
  [
    "A local activity log for this device. Download a copy when needed.",
    "এই ডিভাইসের স্থানীয় কার্যক্রমের লগ। প্রয়োজনে একটি কপি ডাউনলোড করুন।",
    "इस डिवाइस की स्थानीय गतिविधि का लॉग। आवश्यकता होने पर एक प्रति डाउनलोड करें।",
    "இந்த சாதனத்தின் உள்ளூர் செயல்பாட்டுப் பதிவு. தேவைப்படும்போது நகலைப் பதிவிறக்கவும்.",
    "Registro local de actividad de este dispositivo. Descarga una copia cuando sea necesario."
  ],
  [
    "Built-in",
    "বিল্ট-ইন",
    "अंतर्निहित",
    "உள்ளமைக்கப்பட்டது",
    "Integrado"
  ],
  [
    "Blocked",
    "অবরুদ্ধ",
    "अवरुद्ध",
    "தடுக்கப்பட்டது",
    "Bloqueado"
  ],
  [
    "Reactivate",
    "পুনরায় সক্রিয় করুন",
    "फिर सक्रिय करें",
    "மீண்டும் செயல்படுத்து",
    "Reactivar"
  ],
  [
    "Block",
    "ব্লক করুন",
    "ब्लॉक करें",
    "தடு",
    "Bloquear"
  ],
  [
    "No login history yet.",
    "এখনও লগইন ইতিহাস নেই।",
    "अभी कोई लॉगिन इतिहास नहीं है।",
    "இன்னும் உள்நுழைவு வரலாறு இல்லை.",
    "Todavía no hay historial de inicio de sesión."
  ],
  [
    "User created.",
    "ব্যবহারকারী তৈরি হয়েছে।",
    "उपयोगकर्ता बनाया गया।",
    "பயனர் உருவாக்கப்பட்டது.",
    "Usuario creado."
  ],
  [
    "Enter a user ID or email.",
    "ব্যবহারকারী আইডি বা ইমেইল দিন।",
    "यूज़र आईडी या ईमेल दर्ज करें।",
    "பயனர் ஐடி அல்லது மின்னஞ்சலை உள்ளிடவும்.",
    "Introduce un ID de usuario o correo."
  ],
  [
    "This built-in user already exists.",
    "এই বিল্ট-ইন ব্যবহারকারী ইতিমধ্যে আছে।",
    "यह अंतर्निहित उपयोगकर्ता पहले से मौजूद है।",
    "இந்த உள்ளமைக்கப்பட்ட பயனர் ஏற்கனவே உள்ளார்.",
    "Este usuario integrado ya existe."
  ],
  [
    "Password must be at least 6 characters.",
    "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
    "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.",
    "La contraseña debe tener al menos 6 caracteres."
  ],
  [
    "This user already exists.",
    "এই ব্যবহারকারী ইতিমধ্যে আছে।",
    "यह उपयोगकर्ता पहले से मौजूद है।",
    "இந்த பயனர் ஏற்கனவே உள்ளார்.",
    "Este usuario ya existe."
  ],
  [
    "User ID or password is not correct.",
    "ব্যবহারকারী আইডি বা পাসওয়ার্ড ভুল।",
    "यूज़र आईडी या पासवर्ड सही नहीं है।",
    "பயனர் ஐடி அல்லது கடவுச்சொல் தவறானது.",
    "El ID de usuario o la contraseña no son correctos."
  ],
  [
    "This user is blocked.",
    "এই ব্যবহারকারী অবরুদ্ধ।",
    "यह उपयोगकर्ता अवरुद्ध है।",
    "இந்த பயனர் தடுக்கப்பட்டுள்ளார்.",
    "Este usuario está bloqueado."
  ]
].map(row=>[row[0],row]));
  function ui(source){const row=PLATFORM_COPY.get(source);return row?.[UI_LANGUAGES.indexOf(read().language)]||source;}
  function isLogin(){return /^\/login(?:\/|$)/.test(window.location?.pathname||'');}
  const clean=value=>String(value||'').trim();
  function getItem(key){try{return localStorage.getItem(key)}catch{return null}}
  function setItem(key,value){try{localStorage.setItem(key,value)}catch{}}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
  function aqlSeed(){const raw=readJson(AQL_KEY);return raw&&raw.version===1&&raw.settings?raw.settings:null}
  function normalize(value){
    const seed=aqlSeed()||{};
    const v=value&&typeof value==='object'?value:{};
    const lang=clean(v.language||getItem('vesa.app.language')||getItem('vesa-guide-language')||getItem('vesa.ppm.language')||DEFAULT.language);
    return {theme:THEMES[v.theme]?v.theme:(THEMES[seed.theme]?seed.theme:DEFAULT.theme),language:['en','ta','bn','hi','es'].includes(lang)?lang:DEFAULT.language,density:['compact','comfortable','touch'].includes(v.density)?v.density:(['compact','comfortable','touch'].includes(seed.density)?seed.density:DEFAULT.density),font:['modern','classic','spacious','editorial'].includes(v.font)?v.font:(['modern','classic','spacious','editorial'].includes(seed.font)?seed.font:DEFAULT.font)};
  }
  // The nested saved Login choice outranks app-local compatibility keys.
  function read(){const raw=readJson(KEY);return normalize({...raw,language:raw?.settings?.language||raw?.language});}
  function write(settings){const s=normalize(settings);if(!isLogin())s.language=read().language;setItem(KEY,JSON.stringify({version:1,settings:s,updatedAt:new Date().toISOString()}));// The login-selected locale is the sole preference for every application (no English shadow value).
    // Language metadata only: never modify any order, inspection, user record or saved-copy payload.
    LANG_KEYS.forEach(k=>setItem(k,s.language));setItem(AQL_KEY,JSON.stringify({version:1,settings:{theme:s.theme,followDevice:false,font:s.font,text:'standard',density:s.density,layout:'guided',striping:true,stickyColumns:true,motion:'system',reportStyle:'classic',reportFont:'classic',reportSize:'standard',reportSpacing:'comfortable',reportAccent:'blue'}}));return s;}
  function tokens(theme){const t=THEMES[theme]||THEMES[DEFAULT.theme];return {'--canvas':t.canvas,'--paper':t.paper,'--look-surface':t.surface,'--ink':t.ink,'--muted':t.muted,'--line':t.line,'--blue':t.accent,'--blue-light':t.soft,'--look-on-accent':t.on,'--look-sidebar':t.sidebar,'--look-side-ink':t.sideInk,'--look-side-muted':t.sideMuted,'--look-side-active':t.sideActive,'--look-side-accent':t.sideAccent,'--look-field':t.field,'--navy':t.sidebar,'--navy2':t.sideActive,'--teal':t.accent,'--teal2':t.accent,'--gold':t.accent,'--cream':t.canvas,'--ice':t.surface,'--ok':t.dark?'#9ce7c2':'#12633f','--okbg':t.dark?'#193b2c':'#e9f6ef','--action':t.dark?'#ffbdc9':'#a22643','--actionbg':t.dark?'#42222d':'#fceef1','--pending':t.dark?'#ffe09d':'#81520c','--pendingbg':t.dark?'#3d311a':'#fff4df','--shadow':t.dark?'0 16px 52px #0000003b':'0 14px 42px #2537560d'};}
  function fontStack(font){return ({modern:'"Segoe UI",Arial,system-ui,sans-serif',classic:'Arial,Helvetica,sans-serif',spacious:'Verdana,Geneva,sans-serif',editorial:'Arial,Helvetica,sans-serif'}[font]||'"Segoe UI",Arial,system-ui,sans-serif');}
  function apply(input){const s=normalize(input||read());const t=THEMES[s.theme],root=document.documentElement;root.dataset.vesaTheme=s.theme;root.dataset.dark=String(t.dark);root.dataset.density=s.density;root.lang=s.language;for(const [k,v] of Object.entries(tokens(s.theme)))root.style.setProperty(k,v);root.style.setProperty('--ui',fontStack(s.font));root.style.setProperty('--heading-font',s.font==='editorial'?'Georgia,"Times New Roman",serif':fontStack(s.font));document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t.canvas);return s;}
  function label(key){const s=read();const value=(LABELS[s.language]||LABELS.en)[key]||LABELS.en[key]||key;return ui(value);}
  function translate(){const dict=LABELS[read().language]||LABELS.en;document.querySelectorAll('[data-vesa-ui]').forEach(el=>{el.textContent=ui(el.dataset.vesaUi);});document.querySelectorAll('[data-vesa-ui-aria]').forEach(el=>{el.setAttribute('aria-label',ui(el.dataset.vesaUiAria));});document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(dict[key])el.textContent=label(key);});document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const key=el.dataset.i18nPlaceholder;if(dict[key])el.setAttribute('placeholder',dict[key]);});}
  function notifyApps(s){try{if(globalThis.app?.locale?.set){globalThis.app.locale.set(s.language);globalThis.app.render?.();}}catch{}}
  function controls(){return `<div class="vesa-pref-controls" data-vesa-pref-controls><label><span data-i18n="language">${label('language')}</span><select data-pref-language${isLogin()?'':' disabled'}><option value="en">English</option><option value="ta">Tamil</option><option value="bn">Bengali</option><option value="hi">Hindi</option><option value="es">Spanish</option></select>${isLogin()?'':`<a href="/login/?language=1">${ui('Change language at Login')}</a>`}</label><label><span data-i18n="theme">${label('theme')}</span><select data-pref-theme>${Object.entries(THEMES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label></div>`;}
  function wire(root=document){root.querySelectorAll('[data-pref-language]').forEach(el=>{el.value=read().language;el.disabled=!isLogin();el.onchange=()=>{if(!isLogin()){el.value=read().language;return;}const s=write({...read(),language:el.value});apply(s);translate();syncControls();notifyApps(s);window.dispatchEvent(new CustomEvent('vesa-preferences-change',{detail:s}));};});root.querySelectorAll('[data-pref-theme]').forEach(el=>{el.value=read().theme;el.onchange=()=>{const s=write({...read(),theme:el.value});apply(s);translate();syncControls();notifyApps(s);window.dispatchEvent(new CustomEvent('vesa-preferences-change',{detail:s}));};});}
  function syncControls(){document.querySelectorAll('[data-pref-language]').forEach(el=>el.value=read().language);document.querySelectorAll('[data-pref-theme]').forEach(el=>el.value=read().theme);}
  function mount(){apply(write(read()));translate();document.querySelectorAll('[data-vesa-preferences]').forEach(el=>{if(!el.querySelector('[data-vesa-pref-controls]')){el.insertAdjacentHTML('beforeend',controls());wire(el);}});}
  window.VesaPrefs={KEY,THEMES,LABELS,read,write,apply,label,ui,translate,controls,wire,mount};
  apply(read());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
