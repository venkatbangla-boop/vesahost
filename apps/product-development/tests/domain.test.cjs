/* APP-15 M1 synthetic, pure concept and board rights/revision/decision boundary checks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'../src/domain'),c={Date,Math,JSON};c.globalThis=c;vm.createContext(c);
for(const name of ['concept-register.js','board-layout.js','revision-history.js'])
 vm.runInContext(fs.readFileSync(path.join(base,name),'utf8'),c,{filename:name});
const E=c.VesaProductConceptRegister,B=c.VesaProductBoardLayout,R=c.VesaProductRevisionHistory;
const seed={conceptName:'SYN CLASSIC TEE LINE',category:'TEE',season:'SYN SEASON',
 market:'SYN MARKET',sourceRef:'SYN OWNER DESIGN BRIEF',reviewedBy:'SYN DESIGNER',
 reviewDate:'2026-10-17',brief:'Proposal only; no measurements',silhouette:'SYN CLASSIC'};
let p=E.create(seed);
assert(E.validate(p).ok);assert.equal(p.status,E.draft);assert.equal(E.summarize(p).buyerApproved,false);
assert.throws(()=>E.create({...seed,reviewDate:'2026-02-30'}),/date/);
assert.throws(()=>E.create({...seed,sourceRef:''}),/sourceRef/);
const empty=JSON.stringify(p);
const colour={id:'SYN-CW-1',name:'SYN NAVY',sourceRef:'SYN COLOUR SKETCH',
 sourceDate:'2026-10-17',reviewedBy:'SYN REVIEWER',materialProposal:'SYN COTTON',
 materialSourceRef:'SYN LOCAL SOURCE'};
p=E.append(p,'colourway',colour);assert.equal(p.colourways.length,1);
assert.throws(()=>E.append(p,'colourway',{...colour,id:'SYN-CW-2',colourRef:'19-0000'}),/Pantone/);
assert.throws(()=>E.append(p,'colourway',colour),/Duplicate/);
const afterColour=JSON.stringify(p);
p=E.append(p,'task',{id:'SYN-TASK-1',kind:'fit',description:'SYN fit exploration',
 sourceRef:'SYN IDEA BRIEF',sourceDate:'2026-10-17',reviewedBy:'SYN DESIGNER',
 state:'requested-not-approved'});
assert.equal(p.tasks[0].state,'requested-not-approved');
const img={id:'SYN-IMAGE-1',kind:'image',sourceRef:'SYN RIGHTS LOG',position:1,
 rightsBasis:'self-created',rightsSourceRef:'SYN LOCAL ARTIST',localAssetRef:'SYN BROWSER FILE',
 objectFit:'contain',pixelWidth:1920,pixelHeight:1080,dataUrl:'data:image/png;base64,QUJDRA==',
 imageBytes:4,altText:'Synthetic mock visual'};
const board={id:'SYN-BOARD-1',title:'SYN STYLE BOARD',layout:'grid-2',aspect:'16:9',
 sourceRef:'SYN BOARD INSTRUCTION',sourceDate:'2026-10-17',reviewedBy:'SYN DESIGNER',
 cards:[{id:'SYN-CARD-N',kind:'note',text:'SYN INSPIRATION',sourceRef:'SYN BRIEF',position:1},
 {id:'SYN-CARD-C',kind:'colourway',colourwayId:colour.id,sourceRef:'SYN BRIEF',position:2}]};
assert.deepEqual(Array.from(B.plan(board,p.colourways).cards.map(x=>x.position)),[1,2]);
assert(B.check({...board,id:'BAD-BOARD',cards:[{...img,rightsSourceRef:''}]},p.colourways).length);
assert(B.check({...board,id:'BAD-BOARD',cards:[{...img,dataUrl:'https://buyer.example/private.png'}]},p.colourways).length);
assert(B.check({...board,id:'BAD-BOARD',cards:[{...img,pixelWidth:0}]},p.colourways).length);
assert(B.check({...board,id:'BAD-BOARD',cards:[{...img,imageBytes:5}]},p.colourways).length);
assert(!B.check({...board,cards:[img]},p.colourways).length);
assert(B.check({...board,cards:[img,{...img,id:'ANOTHER',position:1}]},p.colourways).length);
const huge={...img,imageBytes:350001,dataUrl:'data:image/png;base64,'+'A'.repeat(466668)};
assert(B.check({...board,cards:[huge]},p.colourways).length);
p=E.append(p,'board',board);assert.equal(p.boards.length,1);
assert.equal(p.revision,3);assert.equal(p.audit.length,3);
assert.throws(()=>E.append(p,'board',{...board,id:'SYN-BOARD-2',cards:[{...img,rightsBasis:'unknown'}]}),/rights/);
assert.equal(JSON.stringify(p).includes('SYN RIGHTS LOG'),false,'Rejected image never enters saved concept');
const beforeRevision=E.copy(p);
p=R.revise(p,{id:'SYN-REV-1',changes:{brief:'Source reviewed proposal update'},
 summary:'SYN user-requested direction',sourceRef:'SYN REV SOURCE',
 reviewedBy:'SYN DESIGNER',sourceDate:'2026-10-17'});
assert.equal(p.revisions[0].before.brief,seed.brief);
assert.equal(p.revisions[0].after.brief,'Source reviewed proposal update');
assert.equal(beforeRevision.header.brief,seed.brief,'Prior object/snapshot unchanged');
assert.throws(()=>R.revise(p,{changes:{price:'1.95'},sourceRef:'SYN',reviewedBy:'SYN',
 sourceDate:'2026-10-17',summary:'Try auto quote'}),/Only sourced concept/);
assert.throws(()=>R.decide(p,{id:'BAD-D',state:'approved',party:'buyer-claimed',actor:'SYN',
 sourceRef:'SYN',authorityRef:'SYN',comments:'SYN',decisionDate:'2026-10-17'}),/automatic/);
p=R.decide(p,{id:'SYN-DEC-1',state:'selected-for-next-draft',
 party:'buyer-claimed',actor:'SYN CLAIMED REVIEWER',sourceRef:'SYN MESSAGE',
 authorityRef:'SYN CLAIMED AUTHORITY',comments:'SYN review only',decisionDate:'2026-10-17'});
assert.equal(E.summarize(p).status,'selected-for-next-draft');
assert.equal(E.summarize(p).productionReady,false);
assert.equal(E.summarize(p).commerciallyQuoted,false);
assert.equal(p.status,E.draft);
const original=JSON.stringify(p);
const altered=E.copy(p);altered.revisions[0].before.brief='ERASED PRIOR SOURCE';
assert.equal(E.validate(altered).ok,false);
const hijack=E.copy(p);hijack.status='APPROVED BULK';
assert.equal(E.validate(hijack).ok,false);
const skipped=E.copy(p);skipped.audit.pop();
assert.equal(E.validate(skipped).ok,false);
const wrongBoard=E.copy(p);wrongBoard.boards[0].cards[1].colourwayId='PRIVATE-OTHER-STYLE';
assert.equal(E.validate(wrongBoard).ok,false);
assert.equal(JSON.stringify(p),original,'Invalid source/decision/board tests never rewrite original');
const demo=E.demo();assert(E.validate(demo).ok);assert.equal(E.summarize(demo).boards,1);
assert.equal(JSON.stringify(beforeRevision).includes('Source reviewed proposal update'),false);
assert.equal(JSON.stringify(E.copy(p)),JSON.stringify(p));
assert.notEqual(JSON.stringify(p),empty);
console.log('PRODUCT DEVELOPMENT M1 PASS: source-only draft concepts, Pantone/material evidence, local asset rights/aspect/size guards, immutable header revisions, manual proposal-only decisions, no buyer/spec/PO auto-approval and frozen-domain isolation.');
