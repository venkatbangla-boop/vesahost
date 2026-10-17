/* APP-15 M3 source-only Tech Pack draft reference and safe visual board/Excel/PDF report model tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),m=new Map(),localStorage={
 getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v))};
const ctx={module:{exports:{}},Date,Math,JSON,localStorage};ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['src/domain/concept-register.js','src/domain/board-layout.js','src/domain/revision-history.js',
 'src/domain/reviewed-reference.js','src/data/saved-copy-codec.js','src/data/local-record-port.js',
 'src/reports/report-model.js'])
 vm.runInContext(fs.readFileSync(path.join(base,name),'utf8'),ctx,{filename:name});
const E=ctx.VesaProductConceptRegister,L=ctx.VesaProductBoardLayout,Ref=ctx.VesaProductReviewedReference,
 Report=ctx.VesaProductReportModel,C=ctx.VesaProductCopyCodec,Store=ctx.VesaProductLocalStore;
let p=E.demo(),legacy=C.encode(p);
assert.equal(C.decode(legacy).manualReferences,undefined,'M2 copies remain supported');
const source={sourceApp:'VESA Tech Pack & Spec 360',recordType:'TechPackDraft',recordId:'SYN-TECH-1',
 revisionId:'R1',sourceDate:'2026-10-17',verifiedBy:'SYN TECH TEAM',
 verifiedAt:'2026-10-17T08:00:00Z',
 displaySnapshot:{style:'SYN STYLE-1',proposedConceptId:p.id,draftOnly:true,buyerApproved:false,
  productionReady:false,priceConfirmed:false}};
assert(Ref.sourceValid(source));assert(Ref.matches(source,p));
const reviewer={localReviewer:'SYN LOCAL DESIGNER',localReviewDate:'2026-10-17',identityConfirmed:true};
assert.throws(()=>Ref.append(p,{...source,recordType:'ApprovedProductionSpec'},reviewer),/matching user-reviewed/);
assert.throws(()=>Ref.append(p,{...source,displaySnapshot:{...source.displaySnapshot,proposedConceptId:'ANOTHER-CONCEPT'}},reviewer),/matching user-reviewed/);
assert.throws(()=>Ref.append(p,{...source,displaySnapshot:{...source.displaySnapshot,buyerApproved:true}},reviewer),/matching user-reviewed/);
assert.throws(()=>Ref.append(p,source,{...reviewer,identityConfirmed:false}),/matching user-reviewed/);
const original=JSON.stringify(p),store=new Store('synthetic-product@example.invalid');store.save(p);
p=Ref.append(p,source,reviewer);assert.equal(p.manualReferences.length,1);
assert.equal(E.summarize(p).buyerApproved,false);assert.equal(E.summarize(p).productionReady,false);
assert.throws(()=>Ref.append(p,source,reviewer),/Duplicate source draft revision/);
assert.equal(JSON.stringify(C.decode(legacy)),original);
const bad=E.copy(p);bad.manualReferences[0].source.displaySnapshot.proposedConceptId='FORGED-STYLE';
assert.equal(E.validate(bad).ok,false);assert.throws(()=>store.save(bad),/Tech Pack draft link/);
const before=JSON.stringify(store.load(E.copy(C.decode(legacy)).id));
assert.equal(JSON.stringify(store.load(C.decode(legacy).id)),before);
const card={id:'SYN-LOCAL-IMAGE',kind:'image',position:1,sourceRef:'SYN SELF CREATED SKETCH',
 rightsBasis:'self-created',rightsSourceRef:'SYN OWNER LOCAL DRAWING',
 localAssetRef:'syn-drawing.png',objectFit:'contain',pixelWidth:1280,pixelHeight:720,
 imageBytes:4,dataUrl:'data:image/png;base64,QUJDRA==',
 altText:'SYN proposal shape',caption:'SYN hypothetical shape'};
const board={id:'SYN-BOARD-IMAGE',title:'SYN VISUAL DESIGN BOARD',
 layout:'single',aspect:'16:9',sourceRef:'SYN LOCAL STYLE IDEA',
 sourceDate:'2026-10-17',reviewedBy:'SYN DESIGNER',cards:[card]};
assert.deepEqual(Array.from(L.check(board,p.colourways)),[]);
p=E.append(p,'board',board);assert.equal(p.boards.length,2);
const values=Report.rows(p);
assert.equal(values['Colourway Matrix'][1][1],'Demo Navy proposal');
assert.equal(values['Manually Reviewed Tech Pack Drafts'].length,2);
assert.equal(values['Style Development Board'].length,3);
assert.equal(values['Board Cards and Image Evidence'].length,3);
assert.equal(Report.excelRows('Style Development Board',values['Style Development Board'])[2][6],1);
assert.equal(Report.safe('=HYPERLINK("bad")'),"'=HYPERLINK(\"bad\")");
assert.equal(Report.safe('@command'),"'@command");
const evil=E.copy(p);evil.header.brief='<script>alert(1)</script>';
// A sourced revision must preserve the original brief; so put HTML injection into a valid new sourced entry.
const injection=E.append(p,'colourway',{id:'SYN-XSS-COLOUR',name:'<img src=x onerror=1>',
 sourceRef:'=HYPERLINK("malicious")',sourceDate:'2026-10-17',reviewedBy:'SYN TEST'});
const html=Report.html(injection);
assert(html.includes('&lt;img src=x onerror=1&gt;')&&!html.includes('<img src=x onerror=1>'));
assert(html.includes('DRAFT BUYER PROPOSAL ONLY')&&html.includes('NOT AUTHENTICATED'));
assert(html.includes('data:image/png;base64,QUJDRA=='),'Only validated locally embedded image is included');
const injectionRows=Report.rows(injection)['Colourway Matrix'];
assert.equal(Report.excelRows('Colourway Matrix',injectionRows)[2][1],'<img src=x onerror=1>');
assert.equal(Report.excelRows('Colourway Matrix',injectionRows)[2][7],'2026-10-17');
assert.equal(Report.excelRows('Colourway Matrix',injectionRows)[2][0],'SYN-XSS-COLOUR');
const sourceRow=Report.excelRows('Colourway Matrix',injectionRows)[2];
assert.equal(sourceRow[0],'SYN-XSS-COLOUR');
assert.equal(Report.safe('=DANGER'),"'=DANGER");
assert.equal(Report.html(p).includes('No bank payment'),false);
assert.equal(E.validate(p).ok,true);
console.log('PRODUCT DEVELOPMENT M3 DRAFT REPORT/SOURCE PASS: typed manual Tech Pack draft identity, optional M2 copy, rights-bound local image board, append-only images, escaped HTML, formula-safe Excel and no buyer/bulk approval.');
