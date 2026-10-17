/* APP-12 browser-local source-only comparison, ONE shared VESA header.
 * No remote supplier or FX fetch, no inferred quality equivalence or PO approval.
 */
(function(root){
'use strict';
class VesaSupplierWorkspace{
 constructor(){
  this.main=document.getElementById('fsMain');this.dialog=document.getElementById('fsDialog');
  this.body=document.getElementById('fsDialogBody');this.file=document.getElementById('fsCopyFile');
  this.E=root.VesaSupplierQuote;this.G=root.VesaSupplierComparability;this.L=root.VesaSupplierLanded;
  this.C=root.VesaSupplierCopyCodec;this.T=root.VesaSupplierCopy;
  const u=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaSupplierLocalStore(u.email||'local-browser-user');
  this.current=null;this.section='summary';this.shell=null;this.previousFocus=null;
  this.asOf=new Date().toISOString().slice(0,10);
 }
 t(k){return this.T.t(k);}
 e(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 btn(action,key,primary=false,id='',disabled=false){return '<button type="button" class="fs-btn'+(primary?' primary':'')+'" data-action="'+this.e(action)+'"'+(id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+this.e(this.t(key))+'</button>';}
 field(k,required=false,type='text',wide=false,value=''){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+'</span><input type="'+this.e(type)+'" name="'+this.e(k)+'" value="'+this.e(value)+'"'+(required?' required':'')+' maxlength="350"></label>';}
 select(k,opts,wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+'</span><select name="'+this.e(k)+'">'+opts.map(([v,l])=>'<option value="'+this.e(v)+'">'+this.e(l)+'</option>').join('')+'</select></label>';}
 modal(title,html){
  this.previousFocus=document.activeElement;document.getElementById('fsDialogTitle').textContent=title;
  this.body.innerHTML=html;if(!this.dialog.open)this.dialog.showModal();
  this.dialog.addEventListener('close',()=>this.previousFocus?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,textarea,button')?.focus?.();
 }
 error(message){this.modal(this.t('errors'),'<p class="fs-warning" role="alert">'+this.e(message)+'</p>');}
 download(s,name){const url=URL.createObjectURL(new Blob([s],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
 start(){
  const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell){this.main.textContent='Shared VESA workspace unavailable';return;}
  const u=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{id:'fabric-supplier-comparison',
   name:'VESA Fabric & Supplier Comparison 360',route:'/apps/fabric-supplier-comparison/',
   contentTarget:'#fsMain',userLabel:u.name||u.email||'',userRole:u.role||'',savedState:'Browser-local'},
   callbacks:{menu:name=>this.menu(name)}});this.shell.mount();
  document.getElementById('fsDialogClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{
   const b=event.target.closest('[data-action]');if(!b)return;event.preventDefault();this.action(b.dataset.action,b.dataset.id||'');
  });
  this.dialog.addEventListener('submit',event=>{
   const form=event.target.closest('form[data-form]');if(!form)return;event.preventDefault();this.submit(form);
  });
  this.file.addEventListener('change',async()=>{
   const file=this.file.files?.[0];this.file.value='';if(!file)return;
   try{if(file.size>this.C.maxLength)throw Error('Source copy exceeds safe local size');
    const record=this.C.decode(await file.text());
    if(this.store.load(record.id)){
     record.id=this.E.id('FSR-COPY');record.revision++;record.updatedAt=new Date().toISOString();
     record.audit.push({revision:record.revision,at:record.updatedAt,
      action:'Opened separate local copy (original preserved)',recordId:record.id});
    }
    record.mode='local';this.store.save(record);this.current=record;this.section='summary';this.render();
    this.modal(this.t('upload'),'<p class="fs-note">A local copy was opened separately; earlier source data remains saved.</p>');
   }catch(err){this.error(err.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.VesaFabricSupplier360=this;this.render();
 }
 menu(name){
  const items={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
   File:[['save','save'],['download','download'],['upload','upload']],
   Edit:[['add-offer','addOffer'],['add-scenario','addScenario'],['add-decision','addDecision']],
   View:[['summary','summary'],['offers','offers'],['scenarios','scenarios'],['matrix','matrix'],['decisions','decisions'],['history','history'],['reports','reports']],
   Tools:[['asof','selectAsOf'],['matrix','showMatrix']],Help:[['help','help']]};
  this.modal(name,'<div class="fs-actions">'+(items[name]||[]).map(([a,k])=>'<button type="button" class="fs-btn" data-menu-action="'+this.e(a)+'">'+this.e(this.t(k))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-menu-action]').forEach(el=>el.onclick=()=>{this.dialog.close();this.action(el.dataset.menuAction);});
 }
 action(name,id=''){try{
  if(name==='home'){this.current=null;this.section='summary';this.render();return;}
  if(name==='new'){this.form('new');return;}
  if(name==='practice'){let p=this.E.create({article:'SYN PIQUE FABRIC',composition:'SYN 100% COTTON',
   gsm:'210',width:'68',widthUnit:'in',construction:'PIQUE',shrinkageBasis:'SYN LAB AFTER WASH',
   shrinkage:'4',sourceRef:'SYN TECH PACK',reviewedBy:'SYN QA',reviewDate:'2026-10-17',
   requestedTradeTerm:'FOB',requestedDeliveryTerm:'SYN DELIVERY POINT'});
   const offer=(id,price)=>({id,supplier:'SYN VENDOR '+id,article:p.requirement.article,
    composition:p.requirement.composition,gsm:p.requirement.gsm,width:p.requirement.width,
    widthUnit:'in',construction:p.requirement.construction,shrinkageBasis:p.requirement.shrinkageBasis,
    shrinkage:p.requirement.shrinkage,quoteRef:'SYN QUOTE '+id,quoteDate:'2026-10-16',validTo:'2026-11-30',
    unitPrice:price,currency:'USD',unit:'yd',moq:1000,moqUnit:'yd',leadDays:28,tradeTerm:'FOB',
    origin:'SYN PLACE',deliveryTerm:'SYN DELIVERY POINT',specSourceRef:'SYN SPEC',
    qualitySourceRef:'SYN LAB TEST',qualityEquivalence:'locally-reviewed-equivalent',
    qualityReviewedBy:'SYN REVIEW',qualityReviewDate:'2026-10-17',sourceRef:'SYN SOURCE QUOTE'});
   p=this.E.append(p,'offer',offer('SYN-Q1','1.2000'));
   p=this.E.append(p,'offer',offer('SYN-Q2','1.0500'));
   p.mode='practice';this.current=p;this.asOf='2026-10-17';this.section='matrix';this.render();return;}
  if(name==='continue'){const saved=this.store.list();if(!saved.length)throw Error(this.t('none'));this.action('load',saved[0].id);return;}
  if(name==='load'){const p=this.store.load(id);if(!p)throw Error('Supplier comparison not found on this device');this.current=p;this.section='summary';this.render();return;}
  if(name==='save'){if(!this.current||this.current.mode==='practice')throw Error('Open a local comparison (not Practice) before saving');this.store.save(this.current);this.render();return;}
  if(name==='download'){if(!this.current||this.current.mode==='practice')throw Error('Open a saved comparison before downloading');
   this.download(this.C.encode(this.current),'VESA-SUPPLIER-'+this.current.id+'.vesasup');return;}
  if(name==='upload'){this.file.click();return;}
  if(['summary','offers','scenarios','matrix','decisions','history','reports'].includes(name)){
   if(!this.current)throw Error('Open source comparison first');this.section=name;this.render();return;}
  if(name==='asof'){if(!this.current)throw Error('Open comparison first');this.form('asof');return;}
  if(name==='help'){this.modal(this.t('help'),'<p class="fs-warning">'+this.e(this.t('warning'))+'</p><p>'+this.e(this.t('noApproval'))+'</p>');return;}
  if(['add-offer','add-scenario','add-decision'].includes(name)){
   if(!this.current||this.current.mode==='practice')throw Error(this.t('practiceOnly'));
   this.form(name);return;}
 }catch(err){this.error(err.message);}}
 table(head,rows){return '<div class="fs-scroll"><table class="fs-table"><thead><tr>'+
   head.map(x=>'<th>'+this.e(x)+'</th>').join('')+'</tr></thead><tbody>'+
   rows.map(row=>'<tr>'+row.map(x=>'<td>'+this.e(x??this.t('needs'))+'</td>').join('')+'</tr>').join('')+
   '</tbody></table></div>';}
 render(){
  const e=v=>this.e(v??this.t('needs')),t=k=>e(this.t(k));
  const banner='<section class="fs-card"><h1>'+t('title')+'</h1><p class="fs-note">'+t('lead')+'</p>'+
   '<p class="fs-warning">'+t('notice')+'</p><p class="fs-note">NON-COMMERCIAL PERSONAL DEMO — SYNTHETIC SOURCE ONLY</p></section>';
  if(!this.current){let saved=[];try{saved=this.store.list();}catch(err){
   this.main.innerHTML=banner+'<section role="alert" class="fs-card fs-warning">'+e(err.message)+'</section>'+this.btn('upload','upload');return;}
   this.main.innerHTML=banner+'<section class="fs-card"><div class="fs-actions">'+this.btn('new','new',true)+
    this.btn('continue','continue')+this.btn('upload','upload')+this.btn('practice','practice')+'</div>'+
    '<h2>'+t('openRecords')+'</h2>'+(saved.length?saved.map(row=>
     '<div class="fs-record"><span><b>'+e(row.article)+'</b><small>'+e(row.composition)+' / Rev '+e(row.revision)+'</small></span>'+
     this.btn('load','open',false,row.id)+'</div>').join(''):'<p class="fs-note">'+t('none')+'</p>')+'</section>';
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,practice=p.mode==='practice',valid=this.E.validate(p);
  const tabs=['summary','offers','scenarios','matrix','decisions','reports','history'];
  this.main.innerHTML=banner+'<section class="fs-card"><h2>'+e(p.requirement.article)+' / '+e(p.requirement.gsm)+' GSM / '+e(p.requirement.width)+' '+e(p.requirement.widthUnit)+'</h2>'+
   '<p class="fs-note">'+(practice?t('practiceOnly'):t('localOnly'))+' / '+t('status')+'</p>'+
   '<div class="fs-actions">'+this.btn('home','back')+this.btn('save','save',true,'',practice)+this.btn('download','download',false,'',practice)+'</div></section>'+
   '<nav aria-label="Comparison sections" class="fs-tabs">'+tabs.map(k=>
    '<button type="button" class="fs-btn" data-action="'+k+'" aria-current="'+(this.section===k)+'">'+t(k)+'</button>').join('')+'</nav>'+
   (!valid.ok?'<section class="fs-card fs-warning" role="alert">'+e(valid.errors.join('; '))+'</section>':'')+this.panel(p,practice);
  this.shell?.setSavedState('saved');
 }
 panel(p,practice){
  const t=k=>this.t(k),e=v=>this.e(v??this.t('needs'));
  const title=(k,a,label)=>'<div class="fs-actions"><h2>'+e(t(k))+'</h2>'+(a?this.btn(a,label,true,'',practice):'')+'</div>';
  if(this.section==='summary'){
   const h=p.requirement;
   return '<section class="fs-card">'+title('summary','add-offer','addOffer')+
    this.table([t('article'),t('composition'),t('gsm'),t('width'),t('construction'),t('requestedTradeTerm')],
    [[h.article,h.composition,h.gsm,h.width+' '+h.widthUnit,h.construction,h.requestedTradeTerm]])+
    '<div class="fs-grid">'+[['offers',p.offers.length],['scenarios',p.scenarios.length],['decisions',p.decisions.length],['history',p.revision]].map(([k,n])=>
    '<div class="fs-stat"><strong>'+e(n)+'</strong><small>'+e(t(k))+'</small></div>').join('')+'</div>'+
    '<p class="fs-warning">'+e(t('warning'))+'</p></section>';
  }
  if(this.section==='offers')return '<section class="fs-card">'+title('offers','add-offer','addOffer')+
   this.table([t('supplier'),t('unitPrice'),t('currency'),t('unit'),t('gsm'),t('validTo'),t('tradeTerm'),t('leadDays'),t('sourceRef')],
   p.offers.map(o=>[o.supplier,o.unitPrice,o.currency,o.unit,o.gsm,o.validTo,o.tradeTerm,o.leadDays,o.sourceRef]))+'</section>';
  if(this.section==='scenarios')return '<section class="fs-card">'+title('scenarios','add-scenario','addScenario')+
   this.table([t('offerId'),t('asOfDate'),t('targetUnit'),t('targetCurrency'),t('landedInput'),t('status'),t('issues')],
   p.scenarios.map(s=>{const q=this.L.evaluate(p,s.id);return[s.offerId,s.asOfDate,s.targetUnit,s.targetCurrency,
    q.landedInput||null,q.status,(q.issues||[]).join('; ')||this.t('noAutomatic')];}))+'</section>';
  if(this.section==='matrix'){
   const matrix=this.G.matrix(p,this.asOf),comparisons=this.L.comparison(p,this.asOf);
   return '<section class="fs-card">'+title('matrix')+'<div class="fs-actions">'+this.btn('asof','selectAsOf')+
    '<span class="fs-note">'+e(this.asOf)+'</span></div>'+
    (!p.offers.length?'<p class="fs-warning">'+e(t('requireTwo'))+'</p>':'')+
    this.table([t('supplier'),t('unitPrice'),t('gsm'),t('tradeTerm'),t('status'),t('issues')],
    matrix.map(g=>{const o=p.offers.find(x=>x.id===g.offerId);return[
     o?.supplier||null,o?.unitPrice||null,o?.gsm||null,o?.tradeTerm||null,g.status,(g.issues||[]).join('; ')];}))+
    '<h2>'+e(t('landedInput'))+'</h2>'+this.table([t('supplier'),t('sourcePrice'),t('landedInput'),t('targetCurrency'),t('status')],
    [...comparisons.ranked,...comparisons.excluded].map(s=>[s.supplier,s.quotedInput||null,s.landedInput||null,s.targetCurrency,s.status]))+
    '<p class="fs-warning">'+e(t('noAutomatic'))+'</p></section>';
  }
  if(this.section==='decisions')return '<section class="fs-card">'+title('decisions','add-decision','addDecision')+
   this.table([t('offerId'),t('stage'),t('reviewer'),t('reviewDate'),t('sourceRef')],
   p.decisions.map(d=>[d.offerId,d.state,d.reviewer,d.reviewDate,d.sourceRef]))+
   '<p class="fs-warning">'+e(t('noApproval'))+'</p></section>';
  if(this.section==='reports')return '<section class="fs-card">'+title('reports')+'<p class="fs-warning">'+e(t('reportPlanned'))+'</p></section>';
  return '<section class="fs-card">'+title('history')+this.table(['Rev',t('reviewDate'),'Action','Evidence'],
   p.audit.map(a=>[a.revision,a.at,a.action,a.recordId||'']))+'</section>';
 }
 form(kind){
  const e=v=>this.e(v),t=k=>this.t(k),spec=['article','composition','gsm','width','construction','shrinkageBasis','shrinkage'];
  const wUnits=[['in','in'],['cm','cm'],['mm','mm']],units=[['yd','yd'],['m','m'],['kg','kg']];
  const pairs=this.current?.offers.map(x=>[x.id,x.supplier+' / '+x.id])||[];
  const yesNo=[['missing',t('missing')],['amount',t('amount')],['not-applicable',t('notApplicable')]];
  let body='';
  if(kind==='new')body=spec.map(k=>this.field(k,true)).join('')+this.select('widthUnit',wUnits)+
   this.field('sourceRef',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
   this.field('requestedTradeTerm',true)+this.field('requestedDeliveryTerm',true);
  if(kind==='add-offer')body=this.field('supplier',true)+this.field('quoteRef',true)+this.field('quoteDate',true,'date')+
   this.field('validTo',true,'date')+spec.map(k=>this.field(k,true)).join('')+this.select('widthUnit',wUnits)+
   this.field('unitPrice',true)+this.field('currency',true)+this.select('unit',units)+
   this.field('moq',true,'number')+this.select('moqUnit',units)+this.field('leadDays',true,'number')+
   this.field('tradeTerm',true)+this.field('origin',true)+this.field('deliveryTerm',true)+
   this.field('specSourceRef',true,'text',true)+this.field('qualitySourceRef',true,'text',true)+
   this.select('qualityEquivalence',[['needs-information',t('needs')],['locally-reviewed-equivalent',t('comparable')],['not-equivalent',t('notComparable')]],true)+
   this.field('qualityReviewedBy')+this.field('qualityReviewDate',false,'date')+this.field('sourceRef',true,'text',true);
  if(kind==='add-scenario'){
   if(!pairs.length)throw Error(this.t('requireTwo'));
   body=this.select('offerId',pairs,true)+this.field('asOfDate',true,'date')+
    this.select('targetUnit',units)+this.field('targetCurrency',true)+
    this.select('rounding',[['half-up-4','half-up-4'],['down-4','down-4']])+
    this.field('sourceRef',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date');
   for(const k of ['freight','duty','tax','lc']){
    body+='<h3 class="fs-subhead">'+e(t(k))+'</h3>'+
     this.select(k+'State',yesNo,true)+this.field(k+'Amount')+
     this.field(k+'SourceRef')+this.field(k+'ReviewedBy')+this.field(k+'ReviewDate',false,'date');
   }
   body+='<h3 class="fs-subhead">Optional User-Sourced FX Factor</h3>'+
    this.field('fxFromCurrency')+this.field('fxNumerator')+this.field('fxDenominator')+
    this.field('fxSourceRef',false,'text',true)+this.field('fxSourceDate',false,'date')+
    this.field('fxReviewedBy')+this.select('fxRounding',[['half-up-4','half-up-4'],['down-4','down-4']]);
   body+='<h3 class="fs-subhead">Optional Sourced Unit Ratio (No Automatic Conversion)</h3>'+
    this.select('conversionFromUnit',units)+this.field('conversionNumerator')+this.field('conversionDenominator')+
    this.field('conversionSourceRef',false,'text',true)+this.field('conversionReviewedBy')+
    this.field('conversionReviewDate',false,'date')+
    this.select('conversionRounding',[['half-up-4','half-up-4'],['down-4','down-4']])+
    this.field('measuredGsm')+this.field('measuredWidth')+
    this.select('conversionWidthUnit',wUnits)+this.field('measurementSourceRef',false,'text',true);
  }
  if(kind==='add-decision'){
   if(!pairs.length)throw Error('Enter a sourced supplier offer first');
   body=this.select('offerId',pairs,true)+this.select('state',[
    ['needs-information',t('needs')],['compare-further','Compare further'],
    ['internally-preferred-for-review','Internal follow-up only'],['not-comparable',t('notComparable')]],true)+
    this.field('reviewer',true)+this.field('reviewDate',true,'date')+this.field('sourceRef',true,'text',true);
  }
  if(kind==='asof')body=this.field('asOf',true,'date',true,this.asOf);
  if(!body)throw Error('Unknown source form');
  const title={new:'new','add-offer':'addOffer','add-scenario':'addScenario','add-decision':'addDecision',asof:'selectAsOf'}[kind];
  this.modal(this.t(title),'<form class="fs-form" data-form="'+e(kind)+'">'+body+
   '<div class="fs-actions wide"><button type="submit" class="fs-btn primary">'+e(t('submit'))+'</button></div></form>');
 }
 submit(form){
  const data=new FormData(form),get=k=>String(data.get(k)??'').trim(),kind=form.dataset.form;
  try{
   if(kind==='asof'){if(!this.E.date(get('asOf')))throw Error('Choose valid comparison date');this.asOf=get('asOf');this.section='matrix';}
   else if(kind==='new'){
    const base={};for(const k of ['article','composition','gsm','width','widthUnit','construction','shrinkageBasis','shrinkage',
     'sourceRef','reviewedBy','reviewDate','requestedTradeTerm','requestedDeliveryTerm'])base[k]=get(k);
    const record=this.E.create(base),existing=this.store.read();
    if(existing.some(x=>this.E.text(x.requirement?.article).toUpperCase()===this.E.text(base.article).toUpperCase()&&
     x.requirement?.sourceRef===base.sourceRef))throw Error('Possible duplicate source requirement; open saved comparison instead');
    this.store.save(record);this.current=record;this.section='summary';
   }else{
    if(!this.current||this.current.mode==='practice')throw Error(this.t('practiceOnly'));
    let input,recordKind;
    if(kind==='add-offer'){
     recordKind='offer';input={id:this.E.id('FS-OFFER')};
     for(const k of ['supplier','article','composition','gsm','width','widthUnit','construction',
      'shrinkageBasis','shrinkage','quoteRef','quoteDate','validTo','unitPrice','currency','unit',
      'tradeTerm','origin','deliveryTerm','specSourceRef','qualitySourceRef','qualityEquivalence',
      'qualityReviewedBy','qualityReviewDate','sourceRef'])input[k]=get(k);
     input.moq=Number(get('moq'));input.moqUnit=get('moqUnit');input.leadDays=Number(get('leadDays'));this.section='offers';
    }else if(kind==='add-scenario'){
     recordKind='scenario';input={id:this.E.id('FS-SCENARIO'),offerId:get('offerId'),asOfDate:get('asOfDate'),
      targetUnit:get('targetUnit'),targetCurrency:get('targetCurrency'),rounding:get('rounding'),
      reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate'),sourceRef:get('sourceRef'),charges:{}};
     for(const k of ['freight','duty','tax','lc']){
      const state=get(k+'State');if(state==='missing')continue;
      const charge={state,sourceRef:get(k+'SourceRef'),reviewedBy:get(k+'ReviewedBy'),reviewDate:get(k+'ReviewDate')};
      if(state==='amount'){charge.amount=get(k+'Amount');charge.currency=input.targetCurrency;charge.unit=input.targetUnit;}
      input.charges[k]=charge;
     }
     if(['fxFromCurrency','fxNumerator','fxDenominator','fxSourceRef','fxSourceDate','fxReviewedBy'].some(k=>get(k))){
      input.fx={fromCurrency:get('fxFromCurrency'),toCurrency:input.targetCurrency,numerator:get('fxNumerator'),
       denominator:get('fxDenominator'),sourceRef:get('fxSourceRef'),sourceDate:get('fxSourceDate'),
       reviewedBy:get('fxReviewedBy'),rounding:get('fxRounding')};
     }
     if(['conversionNumerator','conversionDenominator','conversionSourceRef','conversionReviewedBy','conversionReviewDate'].some(k=>get(k))){
      input.conversion={fromUnit:get('conversionFromUnit'),toUnit:input.targetUnit,
       numerator:get('conversionNumerator'),denominator:get('conversionDenominator'),
       sourceRef:get('conversionSourceRef'),reviewedBy:get('conversionReviewedBy'),
       reviewDate:get('conversionReviewDate'),rounding:get('conversionRounding'),
       measuredGsm:get('measuredGsm'),measuredWidth:get('measuredWidth'),
       widthUnit:get('conversionWidthUnit'),measurementSourceRef:get('measurementSourceRef')};
     }
     this.section='scenarios';
    }else if(kind==='add-decision'){
     recordKind='decision';input={id:this.E.id('FS-NOTE'),offerId:get('offerId'),state:get('state'),
      reviewer:get('reviewer'),reviewDate:get('reviewDate'),sourceRef:get('sourceRef')};this.section='decisions';
    }else throw Error('Unknown comparison entry');
    const next=this.E.append(this.current,recordKind,input);
    this.store.save(next);this.current=next;
   }
   this.dialog.close();this.render();
  }catch(err){let a=form.querySelector('[role=alert]');
   if(!a){a=document.createElement('p');a.className='wide fs-warning';a.setAttribute('role','alert');form.prepend(a);}
   a.textContent=err.message;
  }
 }
}
root.VesaSupplierWorkspace=VesaSupplierWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
