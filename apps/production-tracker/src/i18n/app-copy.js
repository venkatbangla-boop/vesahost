/* APP-09 UI copy only; never translate factory records, evidence or identifiers. */
(function(root){
'use strict';
const en={
 title:'Production Tracker 360',lead:'Daily production, stage-wise WIP and documented corrections',
 notice:'PERSONAL NON-COMMERCIAL DEMO. Synthetic information only. This is not a buyer approval, AQL acceptance or factory-certified production record.',
 warning:'Missing source remains Needs Information. Cutting, sewing and finishing outputs are separate; do not add them together as finished pieces.',
 new:'New Production Record',continue:'Continue Last',open:'Open Saved',practice:'Practice Example',back:'All Records',
 save:'Save Now',download:'Download Saved Copy',upload:'Open Saved Copy',report:'Prepare Report',help:'Help',
 summary:'Summary',daily:'Daily Output',wip:'Stage WIP',targets:'Source Targets',history:'Revision History',
 openRecords:'Saved Production Records',none:'No saved production records on this device',
 header:'Production Order Source',addDaily:'Record Daily Stage Output',correct:'Record Correction',
 addOpening:'Add Opening WIP Source',addTarget:'Add Source Target',reviseTarget:'Revise Source Target',
 locallyReviewedGood:'Locally Reviewed Good',sourceTarget:'Source Target',remaining:'Remaining',
 stage:'Stage',line:'Production Line',lot:'Lot',unit:'Unit',date:'Day',shift:'Shift',
 good:'Good Output',verifiedIn:'Verified In',verifiedOut:'Verified Out',verifiedRejects:'Verified Rejects',rework:'Rework (not netted)',
 sourceRef:'Source document reference',actor:'Recorded by',status:'Evidence status',
 reviewedBy:'Locally reviewed by',reviewDate:'Local review date',reviewSource:'Local review document',
 handoffRef:'Incoming/handoff evidence',outRef:'Outgoing transfer evidence',rejectRef:'Rejected units evidence',
 correctionReason:'Correction reason',correctionSource:'Correction document',
 poNo:'PO number',style:'Style',colour:'Colour',size:'Size',factory:'Factory',
 quantity:'Source target quantity',declaredAuthority:'Target declared by',sourceDate:'Source date',
 amendmentReason:'Target revision reason',amendmentSource:'Target amendment evidence',
 opening:'Source opening WIP',recorded:'Recorded (unreviewed)',reviewed:'Locally reviewed source',
 current:'Current',previous:'Previous version',pieces:'Pieces',draft:'Draft / Needs Information',
 close:'Close',submit:'Save Source Record',errors:'Please review this information',
 needs:'Needs Information',localOnly:'Browser-local copy',saved:'Saved on this device',
 reportPlanned:'Draft reporting and TNA reference are covered by the following verified release phase; this workspace never automatically approves goods.',
 noApproval:'Local recording is not third-party production verification, TNA milestone completion, PPM GO or AQL release.'
};
const translated={
 ta:{title:'Production Tracker 360',lead:'தினசரி உற்பத்தி, Stage WIP மற்றும் திருத்தப் பதிவுகள்',new:'புதிய Production பதிவு',continue:'கடைசிப் பதிவு திற',open:'Saved பதிவு திற',practice:'பயிற்சி உதாரணம்',back:'அனைத்துப் பதிவுகள்',save:'இப்போது சேமி',download:'Saved Copy பதிவிறக்கு',upload:'Saved Copy திற',report:'Report தயாரி',help:'உதவி',summary:'சுருக்கம்',daily:'தினசரி உற்பத்தி',wip:'Stage WIP',targets:'Source Targets',history:'திருத்த வரலாறு',openRecords:'சேமித்த Production பதிவுகள்',none:'இந்த சாதனத்தில் பதிவு இல்லை',header:'Order விவரங்கள்',addDaily:'தினசரி Output பதிவு',correct:'திருத்தம் பதிவு',addOpening:'Opening WIP சேர்',addTarget:'Target சேர்',reviseTarget:'Target திருத்து',locallyReviewedGood:'சரிபார்த்த Good Pieces',sourceTarget:'ஆதார Target',remaining:'மீதம்',stage:'உற்பத்தி Stage',line:'Production Line',date:'தேதி',shift:'Shift',good:'Good Output',verifiedIn:'உள்ளே வந்தது',verifiedOut:'வெளியே சென்றது',verifiedRejects:'Reject Pieces',sourceRef:'ஆதார ஆவணம்',reviewedBy:'சரிபார்த்தவர்',reviewDate:'சரிபார்த்த தேதி',reviewSource:'சரிபார்ப்பு ஆவணம்',opening:'Opening WIP',sourceDate:'ஆதார தேதி',noApproval:'இந்த உள்ளூர் பதிவு Buyer/AQL/PPM அங்கீகாரம் அல்ல.'},
 bn:{title:'প্রোডাকশন ট্র্যাকার ৩৬০',lead:'দৈনিক উৎপাদন, স্টেজ WIP ও সংশোধনের ইতিহাস',new:'নতুন প্রোডাকশন রেকর্ড',continue:'শেষটি খুলুন',open:'সেভ রেকর্ড খুলুন',practice:'অনুশীলন উদাহরণ',back:'সব রেকর্ড',save:'এখন সেভ',download:'সেভ কপি ডাউনলোড',upload:'সেভ কপি খুলুন',report:'রিপোর্ট তৈরি',help:'সহায়তা',summary:'সারাংশ',daily:'দৈনিক উৎপাদন',wip:'স্টেজ WIP',targets:'উৎস টার্গেট',history:'সংশোধন ইতিহাস',openRecords:'সেভ প্রোডাকশন রেকর্ড',none:'এই ডিভাইসে রেকর্ড নেই',header:'অর্ডার তথ্য',addDaily:'দৈনিক আউটপুট যোগ',correct:'সংশোধন যোগ',addOpening:'ওপেনিং WIP যোগ',addTarget:'টার্গেট যোগ',reviseTarget:'টার্গেট সংশোধন',locallyReviewedGood:'পর্যালোচিত ভালো পিস',sourceTarget:'উৎস টার্গেট',remaining:'বাকি',stage:'উৎপাদন ধাপ',line:'লাইন',date:'তারিখ',shift:'শিফট',good:'ভালো আউটপুট',verifiedIn:'যাচাইকৃত ইন',verifiedOut:'যাচাইকৃত আউট',verifiedRejects:'যাচাইকৃত রিজেক্ট',sourceRef:'উৎস নথি',reviewedBy:'পর্যালোচক',reviewDate:'পর্যালোচনা তারিখ',reviewSource:'পর্যালোচনা নথি',opening:'ওপেনিং WIP',sourceDate:'উৎস তারিখ',noApproval:'স্থানীয় রেকর্ড ক্রেতা বা AQL অনুমোদন নয়।'},
 hi:{title:'प्रोडक्शन ट्रैकर 360',lead:'दैनिक उत्पादन, स्टेज WIP और सुधार का रिकॉर्ड',new:'नया प्रोडक्शन रिकॉर्ड',continue:'पिछला खोलें',open:'सेव रिकॉर्ड खोलें',practice:'अभ्यास उदाहरण',back:'सभी रिकॉर्ड',save:'अभी सेव',download:'सेव कॉपी डाउनलोड',upload:'सेव कॉपी खोलें',report:'रिपोर्ट बनाएं',help:'मदद',summary:'सारांश',daily:'दैनिक उत्पादन',wip:'स्टेज WIP',targets:'स्रोत लक्ष्य',history:'सुधार इतिहास',openRecords:'सेव प्रोडक्शन रिकॉर्ड',none:'इस डिवाइस पर रिकॉर्ड नहीं',header:'ऑर्डर विवरण',addDaily:'दैनिक आउटपुट दर्ज करें',correct:'सुधार दर्ज करें',addOpening:'शुरुआती WIP दर्ज करें',addTarget:'लक्ष्य दर्ज करें',reviseTarget:'लक्ष्य सुधारें',locallyReviewedGood:'समीक्षित अच्छे पीस',sourceTarget:'स्रोत लक्ष्य',remaining:'शेष',stage:'उत्पादन चरण',line:'लाइन',date:'तारीख',shift:'शिफ्ट',good:'अच्छा आउटपुट',verifiedIn:'सत्यापित इन',verifiedOut:'सत्यापित आउट',verifiedRejects:'सत्यापित रिजेक्ट',sourceRef:'स्रोत दस्तावेज़',reviewedBy:'समीक्षक',reviewDate:'समीक्षा तिथि',reviewSource:'समीक्षा दस्तावेज़',opening:'शुरुआती WIP',sourceDate:'स्रोत तिथि',noApproval:'स्थानीय रिकॉर्ड खरीदार या AQL स्वीकृति नहीं है।'}
};
class ProductionCopy{
 static language(){return root.VesaPrefs?.read?.()?.language||'en';}
 static t(key){return translated[this.language()]?.[key]||en[key]||key;}
}
root.VesaProductionCopy=ProductionCopy;
})(typeof globalThis!=='undefined'?globalThis:this);
