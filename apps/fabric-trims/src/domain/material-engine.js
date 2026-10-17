/* Fabric & Trims 360 — source-bound material demand, lot receipts and allocation.
 * No assumed supplier delivery, wastage, unit conversion or QA release.
 * Domain has zero dependencies on DOM, sibling apps or browser storage.
 */
(function(root){
'use strict';
class FabricEngine{
 static version='VESA-FABRIC-TRIMS-1';
 static format='VESA-FABRIC-TRIMS-COPY-1';
 static trim(x){return String(x??'').trim();}
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static id(prefix){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static parse(v,precision=4,zero=false){
  if(!['string','number'].includes(typeof v))return null;
  const m=this.trim(v).match(new RegExp('^(\\d{1,12})(?:\\.(\\d{1,'+precision+'}))?$'));
  if(!m)return null;
  const n=BigInt(m[1])*10n**BigInt(precision)+BigInt((m[2]||'').padEnd(precision,'0'));
  return n===0n&&!zero?null:n;
 }
 static qty(n){if(n==null)return null;const abs=n<0n?-n:n;
  return (n<0n?'-':'')+(abs/10000n)+'.'+(abs%10000n).toString().padStart(4,'0');}
 static date(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const t=Date.parse(s+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===s;}
 static dateDiff(from,to){if(!this.date(from)||!this.date(to))return null;
  return (Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86400000;}
 static validRef(ref){return ref==null||(
  typeof ref==='object'&&!Array.isArray(ref)&&
  ['sourceApp','recordType','recordId','revisionId','verifiedBy'].every(k=>this.trim(ref[k]))&&
  this.date(ref.sourceDate)&&this.date(ref.verifiedAt)&&
  ref.displaySnapshot&&typeof ref.displaySnapshot==='object'&&JSON.stringify(ref).length<200000);
 }
 static convert(amount,from,to,conversion){
  if(amount===null)return null;
  if(from===to)return amount;
  if(!conversion||conversion.fromUnit!==from||conversion.toUnit!==to||
    !this.trim(conversion.sourceRef)||!['down-4','half-up-4'].includes(conversion.rounding))
   return null;
  const numerator=this.parse(conversion.numerator,4),
   denominator=this.parse(conversion.denominator,4);
  if(numerator===null||denominator===null)return null;
  const n=amount*numerator,div=denominator;
  return conversion.rounding==='half-up-4'?(n+div/2n)/div:n/div;
 }
 static demand(req){
  if(!Number.isSafeInteger(req.orderPieces)||req.orderPieces<1||
    !this.trim(req.consumptionSource)||!this.trim(req.wastageSource)||
    !['down-4','half-up-4'].includes(req.demandRounding))return null;
  const consumption=this.parse(req.consumptionPerPiece),wastage=this.parse(req.wastagePct,4,true);
  if(consumption===null||wastage===null||wastage>1000000n)return null;
  const raw=BigInt(req.orderPieces)*consumption*(1000000n+wastage);
  const result=raw/1000000n,rem=raw%1000000n;
  return req.demandRounding==='half-up-4'&&rem>=500000n?result+1n:result;
 }
 static create(seed={},practice=false){
  const now=new Date().toISOString();
  return {version:this.version,id:this.id('MAT'),revision:0,mode:practice?'practice':'local',
   createdAt:now,updatedAt:now,
   header:{poNo:this.trim(seed.poNo),style:this.trim(seed.style),
    buyer:this.trim(seed.buyer),factory:this.trim(seed.factory),
    bomRevision:this.trim(seed.bomRevision),bomSource:this.trim(seed.bomSource),
    requiredDate:this.trim(seed.requiredDate),calendarBasis:this.trim(seed.calendarBasis),
    calendarSource:this.trim(seed.calendarSource),techReference:null,poReference:null},
   items:[],requirements:[],bookings:[],receipts:[],allocations:[],reservations:[],audit:[]};
 }
 static sample(){
  const p=this.create({poNo:'DEMO-PO-100',style:'DEMO-TEE',buyer:'SYNTHETIC BUYER',
   factory:'SYNTHETIC FACTORY',bomRevision:'BOM-V1',bomSource:'SYNTHETIC SIGNED BOM',
   requiredDate:'2026-11-15',calendarBasis:'calendar',calendarSource:'DEMO DELIVERY CALENDAR'},true);
  p.items.push({id:'FAB1',kind:'fabric',description:'SYNTHETIC 100% COTTON JERSEY',
   composition:'100% cotton',gsm:'180',width:'68',widthUnit:'in',construction:'Single Jersey',
   unit:'kg',sourceRef:'SYNTHETIC TECH PACK'});
  p.requirements.push({id:'REQ1',itemId:'FAB1',colour:'Navy',size:'M',unit:'kg',
   approvedRequired:'560.0000',sourceRef:'SYNTHETIC BUYER BOM',
   bomRevision:'BOM-V1',orderPieces:1000,consumptionPerPiece:'0.5500',
   consumptionSource:'SYNTHETIC CONSUMPTION SHEET',wastagePct:'2.0000',
   wastageSource:'SYNTHETIC BUYER WASTAGE',demandRounding:'half-up-4',
   targetLot:'LOT-A',targetShade:'NAVY-1'});
  p.bookings.push({id:'BOOK1',itemId:'FAB1',supplier:'SYNTHETIC SUPPLIER',
   bookingRef:'SYNTHETIC PURCHASE REF',sourceRef:'SYNTHETIC SUPPLIER ACK',
   unit:'kg',orderedQty:'600.0000',committedDate:'2026-11-10',lot:'LOT-A',
   shade:'NAVY-1',conversion:null});
  p.receipts.push({id:'RC1',bookingId:'BOOK1',receiptRef:'SYNTHETIC GRN',
   date:'2026-11-08',qty:'400.0000',rejected:'10.0000',unit:'kg',
   lot:'LOT-A',shade:'NAVY-1',qaStatus:'approved',qaSource:'SYNTHETIC QA RELEASE',
   qaActor:'SYNTHETIC QA',qaDate:'2026-11-09',sourceRef:'SYNTHETIC GRN SOURCE'});
  p.allocations.push({id:'ALLOC1',receiptId:'RC1',requirementId:'REQ1',
   qty:'300.0000',unit:'kg',date:'2026-11-09',sourceRef:'SYNTHETIC ORDER ALLOCATION'});
  return p;
 }
 static calculate(p,asOf=''){
  const errors=[],notes=[];
  if(!p||p.version!==this.version||!p.header||
   !['items','requirements','bookings','receipts','allocations','reservations','audit']
    .every(k=>Array.isArray(p[k])))
   return {ok:false,errors:['Unsupported material record.'],notes};
  if(!this.trim(p.id)||!Number.isSafeInteger(p.revision)||p.revision<0||
    JSON.stringify(p).length>2097152)errors.push('Invalid material record/revision/size.');
  const h=p.header;
  if(['poNo','style','buyer','factory','bomRevision','bomSource'].some(k=>!this.trim(h[k])))
   errors.push('Material register needs PO, style, buyer, factory, signed BOM revision and source.');
  if(h.requiredDate&&(!this.date(h.requiredDate)||
    !['calendar','business'].includes(h.calendarBasis)||!this.trim(h.calendarSource)))
   errors.push('Approved material due date requires an explicit calendar type and source.');
  for(const ref of [h.techReference,h.poReference])
   if(!this.validRef(ref))errors.push('Manual cross-app material source is incomplete.');
  const ids=new Set(),uniq=(x,label)=>{
   if(!this.trim(x?.id)||ids.has(x.id))errors.push('Duplicate or missing '+label+' ID.');
   ids.add(x?.id);
  };
  const items=new Map(),requirements=new Map(),bookings=new Map(),receipts=new Map();
  for(const item of p.items){
   uniq(item,'material');items.set(item.id,item);
   if(!['fabric','trims','packaging','other'].includes(item.kind)||
     !this.trim(item.description)||!this.trim(item.unit)||!this.trim(item.sourceRef))
    errors.push('Item needs explicit type, identity, purchase unit and specification source.');
   if(item.gsm&&this.parse(item.gsm,2)===null)errors.push('GSM must be a positive sourced value.');
   if(item.width&&(this.parse(item.width,2)===null||!['cm','in'].includes(item.widthUnit)))
     errors.push('Fabric width must be sourced with explicit cm or inch unit.');
  }
  for(const req of p.requirements){
   uniq(req,'BOM requirement');requirements.set(req.id,req);
   const item=items.get(req.itemId),approved=this.parse(req.approvedRequired);
   if(!item||!this.trim(req.colour)||!this.trim(req.size)||!this.trim(req.sourceRef)||
     !this.trim(req.bomRevision)||approved===null||req.unit!==item?.unit)
    errors.push('Approved BOM requirement needs item, colour, size, matching unit and positive quantity source.');
   const estimate=this.demand(req);
   if((this.trim(req.consumptionPerPiece)||this.trim(req.wastagePct))&&estimate===null)
    notes.push('HOLD: source consumption/wastage/rounding policy incomplete for requirement '+req.id);
   if(estimate!==null&&approved!==null&&estimate!==approved)
    notes.push('HOLD: calculated consumption differs from approved BOM demand for '+req.id);
   if(req.bomRevision!==h.bomRevision)notes.push('BOM requirement '+req.id+' needs review against current BOM revision.');
  }
  for(const booking of p.bookings){
   uniq(booking,'booking');bookings.set(booking.id,booking);
   const item=items.get(booking.itemId);
   if(!item||!this.trim(booking.supplier)||!this.trim(booking.bookingRef)||
     !this.trim(booking.sourceRef)||this.parse(booking.orderedQty)===null||
     !this.trim(booking.unit))errors.push('Booking needs documented supplier, reference, material, source, quantity and unit.');
   if(booking.committedDate&&!this.date(booking.committedDate))
    errors.push('Supplier committed date must be an actual source date.');
   if(booking.actualDate&&(!this.date(booking.actualDate)||!this.trim(booking.actualSource)))
    errors.push('Actual delivery date cannot be used without separate dated receipt/source.');
   if(item&&booking.unit!==item.unit&&this.convert(10000n,booking.unit,item.unit,booking.conversion)===null)
    notes.push('HOLD: supplier quantity unit conversion needs sourced factor and rounding.');
  }
  const receivedPerBooking=new Map(),allApproved=new Map();
  for(const receipt of p.receipts){
   uniq(receipt,'receipt');receipts.set(receipt.id,receipt);
   const book=bookings.get(receipt.bookingId),q=this.parse(receipt.qty),rejected=this.parse(receipt.rejected,4,true);
   if(!book||!this.trim(receipt.receiptRef)||!this.date(receipt.date)||
      !this.trim(receipt.sourceRef)||!this.trim(receipt.lot)||!this.trim(receipt.shade)||
      !['pending','approved','rejected'].includes(receipt.qaStatus)||q===null||rejected===null||
      (q!==null&&rejected>q)||receipt.unit!==book?.unit)
    errors.push('Receipt needs unique evidence, lot/shade, quantity, matching booking unit and valid QC disposition.');
   if(p.receipts.some(x=>x!==receipt&&x.receiptRef===receipt.receiptRef))
    errors.push('Duplicate goods receipt document identity.');
   if(receipt.qaStatus==='approved'&&(!this.trim(receipt.qaSource)||
     !this.trim(receipt.qaActor)||!this.date(receipt.qaDate)))
    errors.push('Released material requires independent dated QA reviewer and evidence.');
   if(book&&q!==null)receivedPerBooking.set(book.id,(receivedPerBooking.get(book.id)||0n)+q);
   const item=book&&items.get(book.itemId);
   const released=receipt.qaStatus==='approved'&&q!==null&&rejected!==null?q-rejected:0n;
   const converted=item?this.convert(released,receipt.unit,item.unit,book.conversion):null;
   allApproved.set(receipt.id,converted);
   if(receipt.qaStatus==='approved'&&converted===null)
    notes.push('HOLD: approved lot '+receipt.lot+' cannot be counted without sourced unit conversion.');
  }
  for(const book of p.bookings){
   const total=receivedPerBooking.get(book.id)||0n,ordered=this.parse(book.orderedQty);
   if(ordered!==null&&total>ordered)errors.push('Receipts exceed documented booking '+book.bookingRef);
  }
  const allocationsByReceipt=new Map(),reservationsByReceipt=new Map(),allocatedByRequirement=new Map();
  for(const a of p.allocations){
   uniq(a,'allocation');
   const rc=receipts.get(a.receiptId),book=rc&&bookings.get(rc.bookingId),
    req=requirements.get(a.requirementId),q=this.parse(a.qty);
   if(!rc||!req||!book||req.itemId!==book.itemId||q===null||
     a.unit!==req.unit||!this.date(a.date)||!this.trim(a.sourceRef))
    errors.push('Allocation needs released receipt, same material requirement, unit, date and written source.');
   if(rc&&req&&((req.targetLot&&req.targetLot!==rc.lot)||
      (req.targetShade&&req.targetShade!==rc.shade)))
    errors.push('Lot/shade mismatch; never pool fabric shades automatically.');
   if(rc&&rc.qaStatus!=='approved')errors.push('Received fabric is not available before explicit QA release.');
   if(rc&&q!==null)allocationsByReceipt.set(rc.id,(allocationsByReceipt.get(rc.id)||0n)+q);
   if(req&&q!==null)allocatedByRequirement.set(req.id,(allocatedByRequirement.get(req.id)||0n)+q);
  }
  for(const reserve of p.reservations){
   uniq(reserve,'reservation');const rc=receipts.get(reserve.receiptId),q=this.parse(reserve.qty);
   const book=rc&&bookings.get(rc.bookingId),item=book&&items.get(book.itemId);
   if(!rc||q===null||!this.trim(reserve.otherPo)||
      reserve.otherPo===h.poNo||!this.trim(reserve.sourceRef)||!this.date(reserve.date)||
      reserve.unit!==item?.unit)
    errors.push('Other-order reservation needs actual receipt, separate PO, quantity, date and evidence.');
   if(rc&&rc.qaStatus!=='approved')errors.push('Unreleased receipt cannot be reserved.');
   if(rc&&q!==null)reservationsByReceipt.set(rc.id,(reservationsByReceipt.get(rc.id)||0n)+q);
  }
  const receiptBalances=p.receipts.map(rc=>{
   const book=bookings.get(rc.bookingId),item=book&&items.get(book.itemId),
    approved=allApproved.get(rc.id),allocated=allocationsByReceipt.get(rc.id)||0n,
    reserved=reservationsByReceipt.get(rc.id)||0n;
   if(approved!==null&&approved!==undefined&&allocated+reserved>approved)
    errors.push('Negative stock or double allocation/reservation against receipt '+rc.receiptRef);
   if((approved===null||approved===undefined)&&(allocated+reserved)>0n)
    errors.push('Cannot allocate stock before documented conversion and QA release.');
   return {receiptId:rc.id,receiptRef:rc.receiptRef,itemId:item?.id||null,
    lot:rc.lot,shade:rc.shade,unit:item?.unit||null,
    approved:approved===null||approved===undefined?null:this.qty(approved),
    allocated:this.qty(allocated),otherReserved:this.qty(reserved),
    netAvailable:approved===null||approved===undefined?null:this.qty(approved-allocated-reserved),
    qaStatus:rc.qaStatus,source:rc.sourceRef};
  });
  const requirementsStatus=p.requirements.map(req=>{
   const target=this.parse(req.approvedRequired),confirmed=allocatedByRequirement.get(req.id)||0n,
    raw=target===null?null:target>confirmed?target-confirmed:0n,
    estimate=this.demand(req),stale=req.bomRevision!==h.bomRevision,
    mismatch=target!==null&&estimate!==null&&target!==estimate;
   if(target!==null&&confirmed>target)
    errors.push('Allocated order quantity exceeds approved requirement '+req.id);
   return {requirementId:req.id,itemId:req.itemId,colour:req.colour,size:req.size,
    unit:req.unit,approved:target===null?null:this.qty(target),confirmed:this.qty(confirmed),
    shortage:raw===null?null:this.qty(raw),consumptionEstimate:estimate===null?null:this.qty(estimate),
    staleBom:stale,readiness:(stale||mismatch)?'review-needed':raw===0n?'allocated':'shortage',
    targetLot:req.targetLot||null,targetShade:req.targetShade||null,source:req.sourceRef};
  });
  const deliveryExceptions=p.bookings.map(b=>{
   let variance=null,status='Needs Information';
   const refDate=h.requiredDate,compareDate=b.actualDate||b.committedDate;
   if(this.date(refDate)&&h.calendarBasis==='calendar'&&this.trim(h.calendarSource)&&this.date(compareDate)){
    variance=this.dateDiff(refDate,compareDate);
    status=variance>0?'Late':variance<0?'Before deadline':'On deadline';
   }
   return {bookingId:b.id,supplier:b.supplier,commit:b.committedDate||null,
     comparedDate:compareDate||null,varianceDays:variance,status};
  });
  return {ok:errors.length===0,errors,notes,
   receiptBalances,requirementsStatus,deliveryExceptions,
   outstanding:requirementsStatus.filter(x=>x.shortage!==null&&x.shortage!=='0.0000').length,
   missingQA:p.receipts.filter(x=>x.qaStatus!=='approved').length};
 }
 static reviewedReference(p,review,asOf=''){
  const calc=this.calculate(p,asOf);
  if(!calc.ok)throw Error(calc.errors.join('\n'));
  if(!review?.checked||!this.trim(review.verifiedBy)||!this.date(review.verifiedAt))
   throw Error('Independent local source review and date required for material reference.');
  return {sourceApp:'VESA Fabric & Trims 360',recordType:'MaterialReadiness',
   recordId:p.id,revisionId:String(p.revision),sourceDate:p.updatedAt.slice(0,10),
   verifiedBy:this.trim(review.verifiedBy),verifiedAt:review.verifiedAt,
   displaySnapshot:{poNo:p.header.poNo,style:p.header.style,
    bomRevision:p.header.bomRevision,source:p.header.bomSource,
    lines:calc.requirementsStatus.map(x=>({...x})),receipts:calc.receiptBalances.map(x=>({...x})),
    localReviewOnly:true,notTnaCompletion:true,notPPMGo:true,externalQAReleaseNotAuthenticated:true}};
 }
}
root.VesaFabricEngine=FabricEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=FabricEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
