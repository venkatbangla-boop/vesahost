/* APP-07 Shipment & Documentation: owned draft file, lot/carton and document ledger.
 * Pure arithmetic. No bank, carrier, customs or external buyer decision is inferred.
 * All cross-app data must be manually reviewed and copied; no sibling private reads.
 */
(function(root){
'use strict';
class ShipmentEngine {
 static version='VESA-SHIPDOC360-1';
 static format='VESA-SHIPDOC360-COPY-1';
 static text(v){return String(v??'').trim();}
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static id(kind){return kind+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static date(v){
  if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
  const t=Date.parse(v+'T00:00:00Z');
  return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v;
 }
 static decimal(v,precision=2,zero=false){
  if(!['number','string'].includes(typeof v))return null;
  const match=this.text(v).match(new RegExp('^(\\d{1,12})(?:\\.(\\d{1,'+precision+'}))?$'));
  if(!match)return null;
  const n=BigInt(match[1])*10n**BigInt(precision)+BigInt((match[2]||'').padEnd(precision,'0'));
  return !zero&&n===0n?null:n;
 }
 static display(n,precision=2){
  if(n===null||n===undefined)return null;
  const scale=10n**BigInt(precision),a=n<0n?-n:n;
  return (n<0n?'-':'')+String(a/scale)+'.'+String(a%scale).padStart(precision,'0');
 }
 static lineAmount(pieces,unitPrice,rounding){
  if(!Number.isSafeInteger(pieces)||pieces<1)return null;
  const price=this.decimal(unitPrice,4);
  if(price===null||!['line-half-up-2','line-down-2'].includes(rounding))return null;
  const n=BigInt(pieces)*price,div=100n;
  return rounding==='line-half-up-2'?(n+div/2n)/div:n/div;
 }
 static validRef(ref){
  return ref==null||(
   typeof ref==='object'&&!Array.isArray(ref)&&
   ['sourceApp','recordType','recordId','revisionId','verifiedBy'].every(k=>this.text(ref[k]))&&
   this.date(ref.sourceDate)&&this.date(ref.verifiedAt)&&
   ref.displaySnapshot&&typeof ref.displaySnapshot==='object'&&
   JSON.stringify(ref).length<=200000);
 }
 static create(seed={},practice=false){
  const time=new Date().toISOString();
  return {version:this.version,id:this.id('SHIP'),revision:0,mode:practice?'practice':'local',
   createdAt:time,updatedAt:time,
   header:{poNo:this.text(seed.poNo),buyer:this.text(seed.buyer),shipper:this.text(seed.shipper),
    consignee:this.text(seed.consignee),invoiceNo:this.text(seed.invoiceNo),
    currency:this.text(seed.currency),incoterm:this.text(seed.incoterm),
    sourceRef:this.text(seed.sourceRef),originCountry:this.text(seed.originCountry),
    originEvidence:this.text(seed.originEvidence),hsCode:this.text(seed.hsCode),
    hsEvidence:this.text(seed.hsEvidence),invoiceDate:this.text(seed.invoiceDate),
    invoiceControl:this.text(seed.invoiceControl),invoiceControlSource:this.text(seed.invoiceControlSource),
    ledgerComplete:false,ledgerSource:'',poReference:null,packingReference:null,aqlReference:null,lcReference:null},
   transport:{bookingRef:'',bookingSource:'',carrier:'',vessel:'',portLoad:'',
    portDischarge:'',etd:'',eta:'',dateBasis:'',dateSource:'',
    blRef:'',blSource:'',dispatchDate:'',dispatchSource:'',actor:''},
   lines:[],packing:[],packingSnapshots:[],dispatches:[],documents:[],audit:[]};
 }
 static demo(){
  const p=this.create({poNo:'DEMO-PO-SHIP',buyer:'SYNTHETIC BUYER',
   shipper:'SYNTHETIC FACTORY',consignee:'SYNTHETIC DESTINATION',
   invoiceNo:'DEMO-INV-001',currency:'USD',incoterm:'FOB',
   sourceRef:'DEMO BUYER DOCUMENT REQUIREMENTS',originCountry:'Bangladesh',
   originEvidence:'SYNTHETIC COO DRAFT',hsCode:'DEMO HS CODE',
   hsEvidence:'SYNTHETIC CLASSIFICATION REVIEW',invoiceDate:'2026-10-11',
   invoiceControl:'125.00',invoiceControlSource:'SYNTHETIC INVOICE CONTROL'},true);
  p.lines=[{id:'L1',poLineRef:'DEMO-PO-LINE-M',style:'DEMO-TEE',colour:'Navy',
   size:'M',lot:'LOT-A',pieces:50,unitPrice:'2.5000',
   invoiceSource:'SYNTHETIC PO PRICE',rounding:'line-half-up-2'}];
  p.packing=[
   {id:'C1',cartonId:'CTN-001',lineId:'L1',pieces:20,netKg:'8.000',grossKg:'8.800',
    cbm:'0.0440',sourceRef:'SYNTHETIC PACKING PLAN'},
   {id:'C2',cartonId:'CTN-002',lineId:'L1',pieces:30,netKg:'11.000',grossKg:'12.000',
    cbm:'0.0660',sourceRef:'SYNTHETIC PACKING PLAN'}];
  p.packingSnapshots=[{id:'PACK-1',revisionId:'PACK-REV1',sourceRef:'SYNTHETIC PACKING APPROVAL',
   reviewer:'SYNTHETIC SHIPPING REVIEWER',reviewedDate:'2026-10-12',
   cartonCount:2,controlPieces:50,controlNetKg:'19.000',controlGrossKg:'20.800',
   controlCbm:'0.1100',cartons:this.copy(p.packing)}];
  p.dispatches=[{id:'DISP-1',lineId:'L1',pieces:20,date:'2026-10-13',
   carrierRef:'SYNTHETIC DISPATCH NOTE',sourceRef:'SYNTHETIC WAREHOUSE RELEASE',
   actor:'SYNTHETIC DISPATCH MANAGER'}];
  p.documents=[{id:'DOC1',kind:'invoice',versionNo:1,status:'draft',
   documentRef:'DEMO-INVOICE-V1',sourceRef:'SYNTHETIC INVOICE FILE',
   actor:'SYNTHETIC MERCHANDISER',date:'2026-10-12',
   parentId:'',ackActor:'',ackDate:'',ackEvidence:''}];
  return p;
 }
 static analyze(p,asOf=''){
  const errors=[],notes=[],unknown='Needs Information';
  if(!p||p.version!==this.version||!p.header||!p.transport||
   !['lines','packing','packingSnapshots','dispatches','documents','audit'].every(k=>Array.isArray(p[k])))
   return {ok:false,errors:['Unsupported shipment record.'],notes};
  if(!this.text(p.id)||!Number.isSafeInteger(p.revision)||p.revision<0||
    JSON.stringify(p).length>2097152)errors.push('Invalid shipment saved record/revision/size.');
  const h=p.header;
  if(['poNo','buyer','shipper','consignee','invoiceNo','currency','incoterm','sourceRef'].some(k=>!this.text(h[k]))||
   !/^[A-Z]{3}$/.test(h.currency||''))
   errors.push('PO/parties/invoice/currency/incoterm and requirement document are mandatory.');
  if(h.invoiceDate&&!this.date(h.invoiceDate))errors.push('Invoice date must be a real calendar date.');
  if(this.text(h.originCountry)&&!this.text(h.originEvidence))
   errors.push('Declared origin requires an explicit authority source.');
  if(this.text(h.hsCode)&&!this.text(h.hsEvidence))
   errors.push('HS classification requires an explicit authority source.');
  if(h.ledgerComplete&&!this.text(h.ledgerSource))
   errors.push('Complete shipment ledger declaration requires a reviewed source.');
  if(this.text(h.invoiceControl)&&(!this.text(h.invoiceControlSource)||
     this.decimal(h.invoiceControl,2,true)===null))
   errors.push('Declared invoice control amount needs a valid sourced two-decimal value.');
  for(const ref of [h.poReference,h.packingReference,h.aqlReference,h.lcReference])
   if(!this.validRef(ref))errors.push('Cross-app source needs independently reviewed typed record and revision.');
  const t=p.transport;
  if((this.text(t.bookingRef)&&!this.text(t.bookingSource))||
   (this.text(t.blRef)&&!this.text(t.blSource))||
   ((t.etd||t.eta)&&(!this.text(t.dateSource)||!['calendar','business'].includes(t.dateBasis)))||
   (t.etd&&!this.date(t.etd))||(t.eta&&!this.date(t.eta))||
   (t.dispatchDate&&(!this.date(t.dispatchDate)||!this.text(t.dispatchSource)||!this.text(t.actor))))
   errors.push('Transport dates/booking/BL require their own carrier source and author.');
  const ids=new Set(),uniq=(o,label)=>{
   if(!this.text(o?.id)||ids.has(o.id))errors.push('Duplicate or missing '+label+' ID.');
   ids.add(o?.id);
  };
  const lines=new Map(),cartonsByLine=new Map(),lineCents=new Map(),packTotals=new Map();
  let invoiceCents=0n,invoiceQty=0;
  for(const line of p.lines){
   uniq(line,'shipment invoice line');
   if(!this.text(line.style)||!this.text(line.colour)||!this.text(line.size)||
    !this.text(line.lot)||!this.text(line.poLineRef)||!this.text(line.invoiceSource)||
    !Number.isSafeInteger(line.pieces)||line.pieces<1||line.pieces>100000000)
    errors.push('Invoice line needs sourced PO line, style/colour/size/lot and whole-piece quantity.');
   const cost=this.lineAmount(line.pieces,line.unitPrice,line.rounding);
   if(cost===null)errors.push('Invoice unit price and explicit cent rounding missing/invalid.');
   if(lines.has(line.id))errors.push('Shipment line ID repeated.');
   lines.set(line.id,line);cartonsByLine.set(line.id,0);
   invoiceQty+=Number.isSafeInteger(line.pieces)?line.pieces:0;
   if(cost!==null){invoiceCents+=cost;lineCents.set(line.id,cost);}
  }
  if(!Number.isSafeInteger(invoiceQty)||invoiceQty>1000000000)errors.push('Invoice total pieces exceed supported limit.');
  const control=this.text(h.invoiceControl)?this.decimal(h.invoiceControl,2,true):null;
  const invoiceValueMatched=control!==null&&p.lines.length>0&&control===invoiceCents;
  if(!invoiceValueMatched)notes.push('HOLD: source invoice amount not yet reconciled to all entered PO lines.');
  const cartonIDs=new Set(),cartonIdSet=new Set(),sum={net:0n,gross:0n,cbm:0n,qty:0};
  for(const c of p.packing){
   uniq(c,'carton row');
   if(!this.text(c.cartonId)||cartonIdSet.has(this.text(c.cartonId).toLowerCase()))
    errors.push('Duplicate/missing physical carton identity.');
   cartonIdSet.add(this.text(c.cartonId).toLowerCase());
   if(!lines.has(c.lineId)||!Number.isSafeInteger(c.pieces)||c.pieces<1||c.pieces>1000000||
    !this.text(c.sourceRef))errors.push('Carton requires an invoice lot line, piece count and packing source.');
   const net=this.decimal(c.netKg,3,true),gross=this.decimal(c.grossKg,3,true),
     cbm=this.decimal(c.cbm,4,true);
   if(net===null||gross===null||cbm===null||gross<net)
    errors.push('Carton weights/CBM require separately declared nonnegative kg/m³ source values.');
   else{sum.net+=net;sum.gross+=gross;sum.cbm+=cbm;}
   if(lines.has(c.lineId)&&Number.isSafeInteger(c.pieces))
    cartonsByLine.set(c.lineId,(cartonsByLine.get(c.lineId)||0)+c.pieces);
   if(Number.isSafeInteger(c.pieces))sum.qty+=c.pieces;
  }
  if(sum.qty>invoiceQty)errors.push('Packed quantity exceeds shipment invoice line quantity.');
  for(const [id,n] of cartonsByLine){const line=lines.get(id);
   if(line&&n>line.pieces)errors.push('Lot line '+id+' packing exceeds sourced invoice pieces.');
  }
  const snapshots=new Map();
  for(const snap of p.packingSnapshots){
   uniq(snap,'packing source version');
   if(!this.text(snap.revisionId)||!this.text(snap.sourceRef)||
     !this.text(snap.reviewer)||!this.date(snap.reviewedDate)||
     !Array.isArray(snap.cartons)||!Number.isSafeInteger(snap.cartonCount)||
     snap.cartonCount!==snap.cartons.length)
    errors.push('Snapshot needs source reviewer, date, full list and carton-count control.');
   if(snapshots.has(snap.revisionId))errors.push('Duplicate packing snapshot revision.');
   snapshots.set(snap.revisionId,snap);
   let net=0n,gross=0n,cbm=0n,pcs=0;const names=new Set();
   for(const c of snap.cartons||[]){
    if(names.has(this.text(c.cartonId).toLowerCase()))
      errors.push('Packing snapshot contains duplicated physical carton identity.');
    names.add(this.text(c.cartonId).toLowerCase());
    if(!lines.has(c.lineId)||!Number.isSafeInteger(c.pieces)||c.pieces<1)
      errors.push('Packing snapshot carton source needs real invoice line and pieces.');
    const a=this.decimal(c.netKg,3,true),b=this.decimal(c.grossKg,3,true),d=this.decimal(c.cbm,4,true);
    if(a===null||b===null||d===null||b<a||!this.text(c.sourceRef))
      errors.push('Packing version has missing carton dimension source.');
    else{net+=a;gross+=b;cbm+=d;pcs+=c.pieces;}
   }
   if(snap.controlPieces!==pcs||this.decimal(snap.controlNetKg,3,true)!==net||
     this.decimal(snap.controlGrossKg,3,true)!==gross||
     this.decimal(snap.controlCbm,4,true)!==cbm)
    errors.push('Packed carton counts, pieces, net/gross weight or CBM differ from explicit source controls.');
  }
  if(p.packingSnapshots.length){
   const latest=p.packingSnapshots.at(-1);
   if(JSON.stringify(latest.cartons)!==JSON.stringify(p.packing))
    notes.push('Packing draft changed after last reviewed snapshot; documents require another reviewed version.');
  }
  const dispatched=new Map(),dispatchIds=new Set();
  for(const d of p.dispatches){
   uniq(d,'actual dispatch');if(!lines.has(d.lineId)||
    !Number.isSafeInteger(d.pieces)||d.pieces<1||!this.date(d.date)||
    !this.text(d.sourceRef)||!this.text(d.actor)||!this.text(d.carrierRef))
    errors.push('Dispatch requires lot line, positive actual pieces, carrier and dated source.');
   dispatched.set(d.lineId,(dispatched.get(d.lineId)||0)+(Number.isSafeInteger(d.pieces)?d.pieces:0));
  }
  const dispatchLines=p.lines.map(line=>{
   const sent=dispatched.get(line.id)||0,packed=cartonsByLine.get(line.id)||0;
   if(sent>line.pieces)errors.push('Actual dispatch exceeds selected PO invoice line.');
   if(sent>packed)errors.push('Dispatched pieces exceed documented packed cartons for lot.');
   return {lineId:line.id,style:line.style,colour:line.colour,size:line.size,lot:line.lot,
    invoiced:line.pieces,packed,dispatched:sent,amount:this.display(lineCents.get(line.id)??null),
    unshipped:h.ledgerComplete?line.pieces-sent:null,source:line.invoiceSource};
  });
  const kindVersion=new Set(),documentIds=new Map(),documentsByKind=new Map();
  for(const d of p.documents){
   uniq(d,'shipping document version');
   if(!['invoice','packing-list','bl','certificate-origin','inspection',
      'export-declaration','other'].includes(d.kind)||
     !['draft','sent','acknowledged','revised'].includes(d.status)||
     !Number.isSafeInteger(d.versionNo)||d.versionNo<1||
     !this.text(d.documentRef)||!this.text(d.sourceRef)||!this.text(d.actor)||!this.date(d.date))
    errors.push('Document versions require a kind, revision, actor, date and written evidence.');
   const key=d.kind+':'+d.versionNo;
   if(kindVersion.has(key))errors.push('Duplicate document kind/version.');
   kindVersion.add(key);documentIds.set(d.id,d);
   if(!documentsByKind.has(d.kind))documentsByKind.set(d.kind,[]);
   documentsByKind.get(d.kind).push(d);
   if(d.status==='acknowledged'&&(!this.text(d.ackActor)||!this.date(d.ackDate)||
     !this.text(d.ackEvidence)))
    errors.push('Carrier/forwarder/bank acknowledgment requires separate sourced actor/date/document.');
  }
  for(const d of p.documents){
   if(d.parentId&&(!documentIds.has(d.parentId)||documentIds.get(d.parentId).kind!==d.kind||
    documentIds.get(d.parentId).versionNo>=d.versionNo))
    errors.push('Revised document requires a prior version of same type.');
  }
  const currentDocuments=[...documentsByKind.entries()].map(([kind,ds])=>{
   const latest=[...ds].sort((a,b)=>b.versionNo-a.versionNo)[0];
   return {kind,versionNo:latest.versionNo,status:latest.status,
    date:latest.date,documentRef:latest.documentRef,ack:latest.status==='acknowledged'};
  });
  const packingMatched=p.lines.length>0&&p.packing.length>0&&
   dispatchLines.every(l=>l.invoiced===l.packed);
  const incompleteRef=!h.poReference||!h.packingReference||!h.aqlReference||!h.lcReference;
  const shipmentEvidence=Boolean(t.blRef&&t.blSource&&t.bookingRef&&t.bookingSource&&
   t.dispatchDate&&t.dispatchSource&&t.actor);
  const complianceSource=Boolean(h.originCountry&&h.originEvidence&&h.hsCode&&h.hsEvidence);
  const latestMatches=Boolean(p.packingSnapshots.length&&
   JSON.stringify(p.packingSnapshots.at(-1).cartons)===JSON.stringify(p.packing));
  const release='DRAFT / NEEDS INFORMATION';
  if(incompleteRef)notes.push('External order, packing, quality and bank/app documents must be explicitly reviewed; no sibling approvals inferred.');
  if(!complianceSource)notes.push('Country of origin / HS legal authority remains Needs Information.');
  if(!shipmentEvidence)notes.push('Booking, B/L and documented actual dispatch remain Needs Information; do not claim shipped status.');
  if(packingMatched&&!latestMatches)notes.push('Packed quantity may reconcile, but current packing version is not reviewed.');
  if(this.date(asOf)&&t.etd&&t.eta&&t.dateBasis==='calendar'&&t.eta<t.etd)
   notes.push('ETD after ETA; verify source date and carrier schedule.');
  return {ok:errors.length===0,errors,notes,currency:h.currency,
   invoiceQty,invoiceAmount:this.display(invoiceCents),invoiceValueMatched,
   packingQty:sum.qty,cartonCount:p.packing.length,
   declaredNetKg:this.display(sum.net,3),declaredGrossKg:this.display(sum.gross,3),
   declaredCbm:this.display(sum.cbm,4),
   packingMatched,latestPackingReviewed:latestMatches,
   dispatchedQty:[...dispatched.values()].reduce((a,b)=>a+b,0),
   dispatchedEvidenceCount:p.dispatches.length,dispatchLines,
   currentDocuments,packingRevisions:p.packingSnapshots.length,
   complianceSource,shipmentEvidence,release,
   asOf:this.date(asOf)?asOf:null};
 }
 static reviewedReference(p,review,asOf=''){
  const x=this.analyze(p,asOf);
  if(!x.ok||review?.checked!==true||!this.text(review?.verifiedBy)||!this.date(review?.verifiedAt))
   throw Error('Valid source record and explicit dated local review required.');
  const snapshot={poNo:p.header.poNo,buyer:p.header.buyer,shipper:p.header.shipper,
   consignee:p.header.consignee,invoiceNo:p.header.invoiceNo,
   invoiceValue:x.invoiceAmount,invoiceCurrency:x.currency,invoicePieces:x.invoiceQty,
   packingPieces:x.packingQty,cartonCount:x.cartonCount,
   declaredNetKg:x.declaredNetKg,declaredGrossKg:x.declaredGrossKg,
   declaredCbm:x.declaredCbm,invoiceValueMatched:x.invoiceValueMatched,
   packingMatched:x.packingMatched,latestPackingReviewed:x.latestPackingReviewed,
   shipmentStatus:x.release,shipmentEvidence:x.shipmentEvidence,
   dispatchPieces:x.dispatchedQty,dispatchEvidenceCount:x.dispatchedEvidenceCount,
   documents:x.currentDocuments,
   notAQLRelease:true,notBankAcceptance:true,notCustomsRelease:true,
   locallyReviewedOnly:true};
  return {sourceApp:'VESA Shipment & Documentation 360',recordType:'ShipmentFile',
   recordId:p.id,revisionId:String(p.revision),sourceDate:p.updatedAt.slice(0,10),
   verifiedBy:this.text(review.verifiedBy),verifiedAt:review.verifiedAt,
   displaySnapshot:snapshot};
 }
}
root.VesaShipmentEngine=ShipmentEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=ShipmentEngine;
})(typeof globalThis!=='undefined'?globalThis:this);