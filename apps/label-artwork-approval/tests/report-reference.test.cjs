/* APP-10 M3: source-local artwork reports and typed reference evidence; synthetic only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),mem=new Map();
const storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v))};
const ctx={module:{exports:{}},Date,Math,JSON,localStorage:storage};ctx.globalThis=ctx;vm.createContext(ctx);
for(const p of ['domain/label-spec.js','domain/artwork-revision.js','domain/review-state.js',
 'domain/reviewed-reference.js','data/saved-copy-codec.js','data/local-record-port.js','reports/report-model.js'])
 vm.runInContext(fs.readFileSync(path.join(base,'src',p),'utf8'),ctx,{filename:p});
const E=ctx.VesaArtworkRevision,Review=ctx.VesaArtworkReviewState,Ref=ctx.VesaArtworkReviewedReference,
 Copy=ctx.VesaArtworkCopyCodec,Store=ctx.VesaArtworkLocalStore,R=ctx.VesaArtworkReportModel;
let record=E.create({style:'SYN-STYLE-10',colour:'Navy',size:'M',itemType:'care-label',placement:'left neck',sourceRef:'SYN INPUT SPEC'});
record=E.appendRevision(record,{id:'SOURCE-REV-1',sourceDate:'2026-10-16',sourceRef:'SYN REV 1',artworkRef:'SYN FILE 1',
 spec:{width:'4',height:'5',unit:'cm',dimensionSourceRef:'SYN SIZE SOURCE',
 barcode:{symbology:'ean-13',value:'4006381333932',sourceRef:'SYN GTIN EVIDENCE'}}});
record=Review.append(record,'decision',{id:'DEC-1',revisionId:'SOURCE-REV-1',reviewer:'SYN CONTACT',
 reviewerRole:'buyer',authorityRef:'SYN COMMUNICATION',sourceRef:'SYN REVIEW MAIL',reviewDate:'2026-10-17',decision:'buyer-approval-evidence-recorded'});
record=E.appendRevision(record,{id:'SOURCE-REV-2',sourceDate:'2026-10-17',sourceRef:'SYN REVISED SOURCE',artworkRef:'SYN FILE 2',
 spec:{width:'42',height:'55',unit:'mm',dimensionSourceRef:'SYN DIMENSION SOURCE',washCareText:'SYN CARE INFO',contentSourceRef:'SYN CARE DOC'}});
assert.equal(Review.effective(record).revisionId,'SOURCE-REV-2');
assert.match(Review.effective(record).status,/PENDING/,'Prior buyer source cannot approve newest revision');
assert.equal(Copy.decode(Copy.encode(record)).manualReferences,undefined,'Old M2 backup remains supported');
const common={sourceDate:'2026-10-16',verifiedAt:'2026-10-17T08:00:00Z',verifiedBy:'SYN LOCAL SOURCE REVIEWER',
 displaySnapshot:{style:'SYN-STYLE-10',colour:'Navy',size:'M',evidenceOnly:true}};
const tech={...common,sourceApp:'VESA Tech Pack & Spec 360',recordType:'SpecRevision',recordId:'SPEC-1',revisionId:'R2'};
const sampling={...common,sourceApp:'VESA Sampling & Approval 360',recordType:'SamplingApprovalRegister',recordId:'SAMPLE-1',revisionId:'R3'};
const check={localReviewer:'SYN INTERNAL REVIEWER',localReviewDate:'2026-10-17',identityConfirmed:true};
assert(Ref.sourceValid(tech,'tech'));assert(Ref.sourceValid(sampling,'sampling'));
assert(!Ref.sourceValid(tech,'sampling'));assert(!Ref.sourceValid({...sampling,recordType:'Other'},'sampling'));
assert.throws(()=>Ref.append(record,'tech',{...tech,displaySnapshot:{style:'OTHER-STYLE'}},check),/Matching source style/);
assert.throws(()=>Ref.append(record,'tech',tech,{...check,identityConfirmed:false}),/Matching source style/);
record=Ref.append(record,'tech',tech,check);
record=Ref.append(record,'sampling',sampling,check);
assert.equal(record.manualReferences.length,2);
assert.throws(()=>Ref.append(record,'tech',tech,check),/Duplicate locally reviewed source revision/);
assert.equal(E.validate(record).ok,true);
const saved=Copy.encode(record),restored=Copy.decode(saved);
assert.equal(restored.manualReferences[1].source.recordId,'SAMPLE-1');
const store=new Store('synthetic-artwork@invalid.example');store.save(record);
const original=JSON.stringify(store.load(record.id));
const tampered=E.copy(record);tampered.manualReferences[0].source.displaySnapshot.style='OTHER';
assert.equal(E.validate(tampered).ok,false);
assert.throws(()=>store.save(tampered),/Manual Tech Pack\/Sampling source/);
const forged=JSON.parse(saved);forged.record.manualReferences[1].localReviewDate='2026-02-30';
forged.hash=Copy.hash(JSON.stringify(forged.record));
assert.throws(()=>Copy.decode(JSON.stringify(forged)),/Manual Tech Pack\/Sampling source/);
assert.throws(()=>Copy.decode(saved.replace('SPEC-1','COUNTERFEIT')),/altered\/unsupported/);
assert.equal(JSON.stringify(store.load(record.id)),original,'Bad source import cannot overwrite user records');
const rows=R.rows(record);
assert(rows['Artwork Versions'].length===3);
assert(rows['Version Differences'].length>1);
assert.match(rows['Artwork Versions'][1][11],/Invalid supplied barcode/);
assert.equal(rows['Manual Read-Only Sources'].length,3);
assert.equal(rows['Source and Status'].find(r=>r[0]==='Buyer authority independently verified')[1],'NO');
assert.equal(R.excelRows('Artwork Versions',rows['Artwork Versions'])[1][5],4,'Width must remain numeric in XLSX');
assert.equal(R.excelRows('Artwork Versions',rows['Artwork Versions'])[1][6],5);
assert.equal(R.excelRows('Artwork Versions',rows['Artwork Versions'])[2][5],42);
assert.equal(R.safeExcel('=HYPERLINK("bad")'),"'=HYPERLINK(\"bad\")");
assert.equal(R.safeExcel('@bad'),"'@bad");
const evil=E.copy(record);evil.header.placement='<img src=x onerror=alert(1)>';
const html=R.html(evil);
assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert(!html.includes('<img src=x'));
assert(html.includes('DRAFT / SOURCE REVIEW ONLY')&&html.includes('GS1 ownership'));
console.log('ARTWORK M3 REPORT/REFERENCE PASS: M2 copy support, exact typed Tech Pack/Sampling source guards, style/date/duplicate rejection, intact record on tamper, label-version and barcode-warning comparison, safe numeric/formula Excel and escaped draft report.');