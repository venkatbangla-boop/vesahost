/* APP-12 pure source-bound supplier offer and requirement records.
 * No browser, sibling data access, external FX, fabric conversion assumptions or supplier approval.
 */
(function(root){
'use strict';
class VesaSupplierQuote{
 static version='VESA-FABRIC-SUPPLIER-360-1';
 static format='VESA-FABRIC-SUPPLIER-COPY-1';
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static text(v){return typeof v==='string'?v.trim():'';}
 static valid(v,max=260){return !!this.text(v)&&this.text(v).length<=max;}
 static date(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v))return false;
  const n=Date.parse(v+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===v;}
 static id(p='FSQ'){return p+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static parse(v,nonzero=true){
  if(typeof v!=='string'||!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,4})?$/.test(v))return null;
  const [whole,decimal='']=v.split('.'),n=BigInt(whole)*10000n+BigInt(decimal.padEnd(4,'0'));
  return n===0n&&nonzero?null:n;
 }
 static fmt(n){if(typeof n!=='bigint')return null;return(n/10000n).toString()+'.'+(n%10000n).toString().padStart(4,'0');}
 static unit(v){return ['yd','m','kg'].includes(v);}
 static currency(v){return typeof v==='string'&&/^[A-Z]{3}$/.test(v);}
 static dims(s){
  const errors=[];
  for(const k of ['article','composition','gsm','width','widthUnit','construction','shrinkageBasis','shrinkage','sourceRef'])
   if(!this.valid(s?.[k],350))errors.push('Fabric specification requires sourced '+k);
  for(const k of ['gsm','width','shrinkage'])if(this.parse(s?.[k],k!=='shrinkage')===null)
   errors.push('Sourced fabric '+k+' needs exact four-decimal numeric value');
  if(!['cm','in','mm'].includes(s?.widthUnit))errors.push('Fabric width requires exact mm/cm/in unit; no implicit conversion');
  return errors;
 }
 static create(seed={}){
  const now=new Date().toISOString();
  return{version:this.version,id:this.id('FSR'),revision:0,createdAt:now,updatedAt:now,
   status:'INTERNAL SOURCE COMPARISON — NO SUPPLIER APPROVAL',
   requirement:{article:this.text(seed.article),composition:this.text(seed.composition),
    gsm:this.text(seed.gsm),width:this.text(seed.width),widthUnit:this.text(seed.widthUnit),
    construction:this.text(seed.construction),shrinkageBasis:this.text(seed.shrinkageBasis),
    shrinkage:this.text(seed.shrinkage),sourceRef:this.text(seed.sourceRef),
    reviewedBy:this.text(seed.reviewedBy),reviewDate:this.text(seed.reviewDate),
    requestedTradeTerm:this.text(seed.requestedTradeTerm),requestedDeliveryTerm:this.text(seed.requestedDeliveryTerm)},
   offers:[],scenarios:[],decisions:[],audit:[]};
 }
 static checkOffer(o){
  const errors=[];
  for(const k of ['id','supplier','article','composition','gsm','width','widthUnit','construction',
   'shrinkageBasis','shrinkage','quoteRef','specSourceRef','qualitySourceRef','currency',
   'unit','tradeTerm','origin','deliveryTerm','sourceRef'])
   if(!this.valid(o?.[k],350))errors.push('Supplier offer requires source '+k);
  if(!this.date(o?.quoteDate)||!this.date(o?.validTo)||o.validTo<o.quoteDate)
   errors.push('Offer requires bounded dated quotation and valid-to window');
  if(this.parse(o?.unitPrice)===null)errors.push('Offer requires exact positive per-unit source price');
  if(!this.currency(o?.currency)||!this.unit(o?.unit))errors.push('Offer requires declared 3-letter currency and yd/m/kg unit');
  if(!Number.isSafeInteger(o?.moq)||o.moq<1||o.moq>1000000000||!this.unit(o?.moqUnit))
   errors.push('Offer requires sourced positive MOQ and exact unit');
  if(!Number.isSafeInteger(o?.leadDays)||o.leadDays<0||o.leadDays>3650)
   errors.push('Supplier lead time needs nonnegative dated-source days');
  errors.push(...this.dims(o));
  return errors;
 }
 static conversion(amount,fromUnit,toUnit,c){
  if(typeof amount!=='bigint')return{value:null,status:'NEEDS INFORMATION',reason:'Missing source price'};
  if(!this.unit(fromUnit)||!this.unit(toUnit))return{value:null,status:'NOT COMPARABLE',reason:'Unsupported declared unit'};
  if(fromUnit===toUnit)return{value:amount,status:'COMPARABLE',basis:'IDENTICAL SOURCE UNIT'};
  if(!c||c.fromUnit!==fromUnit||c.toUnit!==toUnit||!this.valid(c.sourceRef)||
    !this.valid(c.reviewedBy)||!this.date(c.reviewDate)||
    !['half-up-4','down-4'].includes(c.rounding))
   return{value:null,status:'NEEDS INFORMATION',reason:'No independently sourced unit factor/rounding'};
  const numerator=this.parse(c.numerator),denominator=this.parse(c.denominator);
  if(numerator===null||denominator===null)return{value:null,status:'NEEDS INFORMATION',reason:'Invalid sourced positive factor'};
  // Mass versus length is never implicitly inferred from GSM/width. Require measurement evidence for any such ratio.
  if([fromUnit,toUnit].includes('kg')&&(!this.valid(c.measuredGsm)||!this.valid(c.measuredWidth)||
    !['mm','cm','in'].includes(c.widthUnit)||!this.valid(c.measurementSourceRef)||
    this.parse(c.measuredGsm)===null||this.parse(c.measuredWidth)===null))
   return{value:null,status:'NOT COMPARABLE',reason:'Mass/length conversion missing measured GSM, width and documentary basis'};
  const product=amount*numerator,ratio=product/denominator,rem=product%denominator;
  return{value:c.rounding==='half-up-4'&&rem*2n>=denominator?ratio+1n:ratio,
   status:'COMPARABLE',basis:'SOURCE ENTERED RATIO ONLY',sourceRef:c.sourceRef,reviewDate:c.reviewDate};
 }
 static validate(p){
  const errors=[];
  if(!p||p.version!==this.version||!this.valid(p.id,180)||
    !Number.isSafeInteger(p.revision)||p.revision<0||
    !['offers','scenarios','decisions','audit'].every(k=>Array.isArray(p[k])))
   return{ok:false,errors:['Unsupported supplier comparison version or record']};
  if(p.status!=='INTERNAL SOURCE COMPARISON — NO SUPPLIER APPROVAL')errors.push('No automatic supplier selection or compliance certification');
  // M3 optional local human-reviewed source snapshots. Old M2 records remain unchanged and valid.
  if(p.manualReferences!==undefined){
   if(!root.VesaSupplierReviewedReference)errors.push('Reviewed supplier comparison source validator unavailable');
   else errors.push(...root.VesaSupplierReviewedReference.validateList(p));
  }
  errors.push(...this.dims(p.requirement));
  for(const k of ['reviewedBy','reviewDate','requestedTradeTerm','requestedDeliveryTerm'])
   if(!this.valid(p.requirement?.[k],350))errors.push('Requirement needs sourced review or term '+k);
  if(!this.date(p.requirement?.reviewDate))errors.push('Requirement review needs exact date');
  const unique=new Set(),offers=new Set();
  try{if(JSON.stringify(p).length>2097152)errors.push('Supplier comparison document too large');}
  catch{errors.push('Supplier comparison source not serializable');}
  if(p.offers.length>300||p.scenarios.length>1500||p.decisions.length>1500||p.audit.length>5000)
   errors.push('Comparison source item count exceeds safe bound');
  for(const o of p.offers){
   errors.push(...this.checkOffer(o));if(unique.has(o?.id))errors.push('Duplicate supplier source identity');
   unique.add(o?.id);offers.add(o?.id);
  }
  for(const sc of p.scenarios){
   if(!root.VesaSupplierLanded)errors.push('Landed scenario validator missing');
   else errors.push(...root.VesaSupplierLanded.checkScenario(sc,offers));
   if(unique.has(sc?.id))errors.push('Duplicate supplier scenario ID');unique.add(sc?.id);
  }
  for(const d of p.decisions){
   for(const k of ['id','offerId','reviewer','sourceRef'])if(!this.valid(d?.[k],350))
    errors.push('Internal selection note needs '+k);
   if(!offers.has(d?.offerId)||!this.date(d?.reviewDate)||
    !['needs-information','compare-further','internally-preferred-for-review','not-comparable'].includes(d?.state)||
    d?.supplierApproved===true||d?.purchasePlaced===true)errors.push('Internal review cannot auto-select/approve supplier or place PO');
   if(unique.has(d?.id))errors.push('Duplicate supplier selection event ID');unique.add(d?.id);
  }
  if(p.audit.length!==p.revision)errors.push('Supplier source audit sequence invalid');
  for(let i=0;i<p.audit.length;i++)if(p.audit[i]?.revision!==i+1||
    !this.valid(p.audit[i]?.action)||!this.valid(p.audit[i]?.at,100))errors.push('Invalid immutable supplier event sequence');
  return{ok:errors.length===0,errors};
 }
 static append(p,kind,input){
  const arr={offer:'offers',scenario:'scenarios',decision:'decisions'}[kind];
  if(!arr)throw Error('Unknown comparison record type');
  const prior=this.validate(p);if(!prior.ok)throw Error(prior.errors.join('; '));
  const next=this.copy(p),entry=this.copy({...input,id:input?.id||this.id('FS-'+kind.toUpperCase())});
  next[arr].push(entry);next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({revision:next.revision,at:next.updatedAt,action:'Locally sourced '+kind+' added (no purchase approval)',recordId:entry.id});
  const after=this.validate(next);if(!after.ok)throw Error(after.errors.join('; '));
  return next;
 }
}
root.VesaSupplierQuote=VesaSupplierQuote;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaSupplierQuote;
})(typeof globalThis!=='undefined'?globalThis:this);
