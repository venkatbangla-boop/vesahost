/* APP-11 source review and private draft reporting contract. All data synthetic. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),mem=new Map(),localStorage={
 getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))
};
const env={module:{exports:{}},localStorage,Date,Math,JSON,BigInt};env.globalThis=env;vm.createContext(env);
const load=n=>vm.runInContext(fs.readFileSync(path.join(base,n),'utf8'),env,{filename:n});
for(const n of ['src/domain/buyer-directory.js','src/domain/opportunity-state.js','src/domain/followup-scheduler.js',
 'src/domain/reviewed-reference.js','src/data/saved-copy-codec.js','src/data/local-record-port.js','src/reports/report-model.js'])load(n);
const E=env.VesaBuyerDirectory,O=env.VesaCRMOpportunityState,Ref=env.VesaCRMReviewedReference,
 C=env.VesaBuyerCRMCopyCodec,S=env.VesaBuyerCRMLocalStore,R=env.VesaCRMReportModel;
let p=E.create({organizationName:'SYN BUYER CO',territory:'BD',sourceRef:'SYN BUYER DIRECTORY'});p.mode='local';
p=E.append(p,'contact',{id:'CONTACT-1',contactName:'SYN CONTACT',role:'SYN SOURCING MANAGER',
 sourceRef:'SYN CONTACT REGISTER',privacySourceRef:'SYN PRIVACY REVIEW',
 reviewedBy:'SYN LOCAL REVIEWER',reviewDate:'2026-10-17',consentStatus:'needs-information',
 email:'contact@example.invalid'});
p=E.append(p,'enquiry',{id:'ENQUIRY-1',category:'Knit Polo',sourceRef:'SYN ENQUIRY',
 styleRequest:'SYN-STYLE-1',sourceDate:'2026-10-16',requestedQuantity:1000,unit:'pieces'});
p=E.append(p,'opportunity',{id:'OPPORTUNITY-1',enquiryId:'ENQUIRY-1',stage:'Source costing requested',
 stageSourceRef:'SYN STAGE SOURCE',reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',
 amount:'1250.50',currency:'USD',amountSourceRef:'SYN COST BASIS',
 amountReviewedBy:'SYN FINANCE',amountReviewDate:'2026-10-17'});
p=E.append(p,'followup',{id:'FOLLOWUP-1',linkType:'opportunity',linkId:'OPPORTUNITY-1',
 owner:'SYN OWNER',dueDate:'2026-10-16',createdDate:'2026-10-15',sourceRef:'SYN FOLLOWUP',
 status:'open',closedDate:'',outcomeSourceRef:''});
const old=C.encode(p);
assert.equal(C.decode(old).manualReferences,undefined,'Old M2 saved copy opens without modification');
const po={sourceApp:'VESA Purchase Order 360',recordType:'PurchaseOrder',recordId:'SYN-PO-1',
 revisionId:'R2',sourceDate:'2026-10-16',verifiedBy:'SYN PO REVIEWER',verifiedAt:'2026-10-17T07:00:00Z',
 displaySnapshot:{buyer:'SYN BUYER CO',poNo:'SYN-PO-1',sourceOnly:true}};
const quote={sourceApp:'VESA Costing 360',recordType:'CostingQuoteSnapshot',recordId:'SYN-QUOTE-1',
 revisionId:'R1',sourceDate:'2026-10-16',verifiedBy:'SYN QUOTE CHECKER',verifiedAt:'2026-10-17',
 displaySnapshot:{buyer:'SYN BUYER CO',style:'SYN POLO',value:'1250.50',currency:'USD',
  manualOnly:true,notCostingAppExport:true}};
const review={localReviewer:'SYN LOCAL REVIEWER',localReviewDate:'2026-10-17',identityConfirmed:true};
assert(Ref.sourceValid(po,'po'));assert(!Ref.sourceValid(po,'costing'));
assert(Ref.sourceValid(quote,'costing'));assert(!Ref.sourceValid(quote,'po'));
assert(!Ref.sourceValid({...po,sourceApp:'not PO approval'},'po'));
assert.throws(()=>Ref.append(p,'po',{...po,displaySnapshot:{buyer:'WRONG BUYER'}},review),/Exact matching buyer/);
assert.throws(()=>Ref.append(p,'po',po,{...review,identityConfirmed:false}),/identity confirmation/);
assert.throws(()=>Ref.append(p,'po',po,{...review,localReviewDate:'2026-02-30'}),/date/);
const original=JSON.stringify(p);
p=Ref.append(p,'po',po,review);
p=Ref.append(p,'costing',quote,review);
assert.equal(p.manualReferences.length,2);assert.equal(p.revision,7);
assert.throws(()=>Ref.append(p,'po',po,review),/Duplicate local source revision/);
assert.equal(p.status,'LOCAL SOURCE ONLY — NOT BUYER-APPROVED PO');
const store=new S('synthetic@invalid.example');store.save(p);
const stored=JSON.stringify(store.load(p.id));
const tampered=E.copy(p);tampered.manualReferences[0].source.displaySnapshot.buyer='WRONG BUYER';
assert.equal(E.validate(tampered).ok,false);
assert.throws(()=>store.save(tampered),/Local source must match exact buyer/);
const fake=JSON.parse(C.encode(p));fake.record.manualReferences[0].source.revisionId='FORGED';
assert.throws(()=>C.decode(JSON.stringify(fake)),/altered\/unsupported/);
const signed=JSON.parse(C.encode(p));signed.record.manualReferences[0].source.displaySnapshot.buyer='OTHER';signed.hash=C.hash(JSON.stringify(signed.record));
assert.throws(()=>C.decode(JSON.stringify(signed)),/Local source must match exact buyer/);
assert.equal(JSON.stringify(store.load(p.id)),stored);
assert.equal(JSON.stringify(C.decode(old)),original,'Legacy pre-reference original remains source identical');
const rows=R.rows(p,'2026-10-17');
assert.equal(rows['Buyer Enquiries'][1][3],1000);
assert.equal(rows['Source Opportunity Pipeline'][1][6],'1250.50');
assert.equal(rows['Source Amounts by Currency'][1][0],'USD');
assert.equal(rows['Source Amounts by Currency'][1][1],'1250.50');
assert.equal(rows['Local Follow-up Calendar'][1][7],'overdue');
assert.equal(rows['Manual Read-Only References'].length,3);
assert.equal(rows['Private Contact Register'][1][6],'needs-information');
assert.equal(R.excelRows('Buyer Enquiries',rows['Buyer Enquiries'])[1][3],1000);
assert.equal(R.excelRows('Source Amounts by Currency',rows['Source Amounts by Currency'])[1][1],1250.50);
assert.equal(R.excelRows('Local Follow-up Calendar',rows['Local Follow-up Calendar'])[1][6],-1);
assert.equal(R.excelCell('=HYPERLINK("bad")'),"\'=HYPERLINK(\"bad\")");
assert.equal(R.excelCell('@cmd'),"'@cmd");
const evil=E.copy(p);evil.header.organizationName='<img src=x onerror=1>';
const html=R.html(evil,'2026-10-17');
assert(html.includes('&lt;img src=x onerror=1&gt;')&&!html.includes('<img src=x'));
assert(html.includes('NOT confirmed purchase orders'));assert(html.includes('NO EMAIL/SMS SENT')===false);
assert.throws(()=>R.rows(p,'2026-02-30'),/exact as-of date/);
assert.equal(JSON.stringify(p.contacts[0]),JSON.stringify(JSON.parse(original).contacts[0]));
console.log('BUYER CRM M3 REPORT/REF PASS: old saved copies, verified buyer PO/manual quote references, duplicate/wrong-buyer/corrupt atomic reject, private source reports, Excel formula and numeric typing, as-of follow-ups with no external delivery.');
