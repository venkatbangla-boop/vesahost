/* APP-08 local Factory Vendor workspace; all global header/menu/account owned by VESA shared shell.
 * All documents and capacities are unverified source declarations, not compliance statements.
 */
(function(root){
'use strict';
class FactoryVendorWorkspace{
 constructor(){
  this.main=document.getElementById('fvMain');this.dialog=document.getElementById('fvDialog');
  this.body=document.getElementById('fvDialogBody');this.file=document.getElementById('fvCopyFile');
  this.E=root.VesaFactoryVendorProfile;this.C=root.VesaFactoryCertificationEvidence;
  this.Match=root.VesaFactoryCapabilityMatcher;this.Codec=root.VesaFactoryVendorCopyCodec;this.T=root.VesaFactoryVendorCopy;
  const user=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaFactoryVendorLocalStore(user.email||'local-browser-user');
  this.current=null;this.section='summary';this.shell=null;this.focusBefore=null;
  this.asOf=new Date().toISOString().slice(0,10);
 }
 t(key){return this.T.t(key);}
 e(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 btn(action,label,primary=false,id='',disabled=false){return '<button class="fv-btn'+(primary?' primary':'')+'" type="button" data-action="'+this.e(action)+'"'+(id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+this.e(this.t(label))+'</button>';}
 field(key,value='',type='text',attrs='',wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(key))+'</span><input type="'+this.e(type)+'" name="'+this.e(key)+'" value="'+this.e(value)+'" '+attrs+'></label>';}
 choose(key,values,selected='',wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(key))+'</span><select name="'+this.e(key)+'">'+values.map(([value,label])=>'<option value="'+this.e(value)+'"'+(String(value)===String(selected)?' selected':'')+'>'+this.e(label)+'</option>').join('')+'</select></label>';}
 number(key,value='',required=false){return this.field(key,value,'number','min="0" max="100000000" step="1"'+(required?' required':''));}
 modal(title,content){this.focusBefore=document.activeElement;document.getElementById('fvDialogTitle').textContent=title;this.body.innerHTML=content;
  if(!this.dialog.open)this.dialog.showModal();this.dialog.addEventListener('close',()=>this.focusBefore?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,button')?.focus?.();}
 error(message){this.modal(this.t('errors'),'<p class="fv-warning" role="alert">'+this.e(message)+'</p>');}
 start(){const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;if(!Shell){this.main.textContent='Shared VESA workspace unavailable';return;}
  const user=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{id:'factory-vendor',name:'VESA Factory & Vendor 360',
   route:'/apps/factory-vendor/',contentTarget:'#fvMain',userLabel:user.name||user.email||'',
   userRole:user.role||'',savedState:'Browser-local'},callbacks:{menu:name=>this.menu(name)}});this.shell.mount();
  document.getElementById('fvDialogClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;event.preventDefault();this.action(b.dataset.action,b.dataset.id||'');});
  this.dialog.addEventListener('submit',event=>{const form=event.target.closest('form[data-form]');if(!form)return;event.preventDefault();this.submit(form);});
  this.file.addEventListener('change',async()=>{const file=this.file.files?.[0];this.file.value='';if(!file)return;
   try{if(file.size>this.Codec.maxLength)throw Error('Saved vendor file is too large');
    const p=this.Codec.decode(await file.text());if(this.store.load(p.id)){
     p.id=this.E.id('FVD-COPY');p.audit.push({revision:p.revision,at:new Date().toISOString(),action:'Separate saved vendor copy recovered'});
    }p.mode='local';this.store.save(p);this.current=p;this.section='summary';this.render();
    this.modal(this.t('upload'),'<p class="fv-note">Saved vendor copy opened separately; your earlier reviews remain unchanged.</p>');
   }catch(error){this.error(error.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());root.VesaFactoryVendor360=this;this.render();
 }
 menu(name){const menu={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
  File:[['save','save'],['download','download'],['upload','upload']],
  Edit:[['add-site','addSite'],['add-capability','addCapability'],['add-certificate','addCertificate'],['add-review','addReview'],['add-performance','addPerformance']],
  View:[['summary','summary'],['sites','sites'],['capabilities','capabilities'],['documents','documents'],['onboarding','onboarding'],['performance','performance'],['history','history']],
  Tools:[['report','report']],Help:[['help','help']]};
  this.modal(name,'<div class="fv-actions">'+(menu[name]||[]).map(([action,label])=>'<button type="button" class="fv-btn" data-dialog-action="'+this.e(action)+'">'+this.e(this.t(label))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-dialog-action]').forEach(x=>x.onclick=()=>{this.dialog.close();this.action(x.dataset.dialogAction);});
 }
 download(text,name,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1300);}
 action(name,id=''){try{
  if(name==='home'){this.current=null;this.section='summary';this.render();return;}
  if(name==='new'){this.form('new');return;}
  if(name==='practice'){let p=this.E.create({vendorName:'SYNTHETIC VENDOR',country:'BD',sourceRef:'SYNTHETIC DECLARATION'});
   p=this.E.append(p,'site',{id:'SITE-DEMO',siteName:'SYNTHETIC SITE',country:'BD',process:'Knitwear',sourceRef:'SYNTHETIC SITE DECLARATION'});
   p.mode='practice';this.current=p;this.section='summary';this.render();return;}
  if(name==='continue'){const list=this.store.list();if(!list.length)throw Error(this.t('none'));this.action('load',list[0].id);return;}
  if(name==='load'){const p=this.store.load(id);if(!p)throw Error('Saved vendor record not found');this.current=p;this.section='summary';this.render();return;}
  if(name==='save'){if(!this.current||this.current.mode==='practice')throw Error('Open a local vendor record first');this.store.save(this.current);this.render();return;}
  if(name==='download'){if(!this.current||this.current.mode==='practice')throw Error('Open a saved local vendor record first');
   this.download(this.Codec.encode(this.current),'VESA-FACTORY-'+this.current.id+'.vesavendor','application/json');return;}
  if(name==='upload'){this.file.click();return;}
  if(['summary','sites','capabilities','documents','onboarding','performance','reports','history'].includes(name)){
   if(!this.current)throw Error('Open a vendor record first');this.section=name;this.render();return;}
  if(name==='report'){if(!this.current)throw Error('Open a vendor record first');this.section='reports';this.render();return;}
  if(name==='help'){this.modal(this.t('help'),'<p class="fv-warning">'+this.e(this.t('warning'))+'</p><p>'+this.e(this.t('noApproval'))+'</p>');return;}
  if(['add-site','add-capability','add-certificate','add-review','add-performance'].includes(name)){
   if(!this.current||this.current.mode==='practice')throw Error('Open a saved vendor record for editing');this.form(name);return;}
 }catch(error){this.error(error.message);}}
 table(headers,rows){return '<div class="fv-scroll"><table class="fv-table"><thead><tr>'+headers.map(h=>'<th>'+this.e(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+this.e(v??this.t('needs'))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 render(){const e=v=>this.e(v??this.t('needs')),t=k=>this.e(this.t(k));
  const banner='<section class="fv-card"><h1>'+t('title')+'</h1><p class="fv-note">'+t('lead')+'</p><p class="fv-warning">'+t('notice')+'</p></section>';
  if(!this.current){let saved=[];try{saved=this.store.list();}catch(error){this.main.innerHTML=banner+'<p class="fv-warning" role="alert">'+e(error.message)+'</p>'+this.btn('upload','upload');return;}
   this.main.innerHTML=banner+'<section class="fv-card"><div class="fv-actions">'+this.btn('new','new',true)+this.btn('continue','continue')+this.btn('upload','upload')+this.btn('practice','practice')+'</div><h2>'+t('openRecords')+'</h2>'+
    (saved.length?saved.map(x=>'<div class="fv-record"><span><b>'+e(x.vendorName)+'</b> · '+e(x.country)+'<small>Revision '+e(x.revision)+'</small></span>'+this.btn('load','open',false,x.id)+'</div>').join(''):'<p class="fv-note">'+t('none')+'</p>')+'</section>';this.shell?.setSavedState('unsaved');return;}
  const p=this.current,practice=p.mode==='practice',review=this.E.validate(p);
  const tabs=['summary','sites','capabilities','documents','onboarding','performance','reports','history'];
  this.main.innerHTML=banner+'<section class="fv-card"><h2>'+e(p.header.vendorName)+' · '+e(p.header.country)+'</h2><p class="fv-note">'+(practice?'SYNTHETIC PRACTICE':t('localOnly'))+' · '+t('status')+'</p>'+
   '<div class="fv-actions">'+this.btn('home','back')+this.btn('save','save',true,'',practice)+this.btn('download','download',false,'',practice)+this.btn('report','report')+'</div></section>'+
   '<nav class="fv-tabs" aria-label="Factory & Vendor sections">'+tabs.map(tab=>'<button type="button" class="fv-btn" data-action="'+tab+'" aria-current="'+(this.section===tab)+'">'+t(tab)+'</button>').join('')+'</nav>'+
   (!review.ok?'<section class="fv-card" role="alert"><p class="fv-warning">'+e(review.errors.join('; '))+'</p></section>':'')+this.panel(p,practice);
  this.shell?.setSavedState('saved');
 }
 panel(p,practice){const t=k=>this.t(k),e=v=>this.e(v??this.t('needs')),can=!practice;
  const head=(section,action,label)=>'<div class="fv-actions"><h2>'+e(t(section))+'</h2>'+(action?this.btn(action,label,true,'',!can):'')+'</div>';
  if(this.section==='summary')return '<section class="fv-card"><div class="fv-actions">'+this.btn('add-site','addSite',true,'',!can)+this.btn('add-capability','addCapability',false,'',!can)+this.btn('add-certificate','addCertificate',false,'',!can)+'</div><div class="fv-grid">'+
   [['sites',p.sites.length],['capabilities',p.capabilities.length],['documents',p.certificates.length],['onboarding',p.reviews.length],['performance',p.performance.length]].map(([k,v])=>'<div class="fv-stat"><strong>'+e(v)+'</strong><small>'+e(t(k))+'</small></div>').join('')+'</div><p class="fv-warning">'+e(t('warning'))+'</p></section>';
  if(this.section==='sites')return '<section class="fv-card">'+head('sites','add-site','addSite')+this.table([t('siteName'),t('country'),t('process'),t('sourceRef')],p.sites.map(x=>[x.siteName,x.country,x.process,x.sourceRef]))+'</section>';
  if(this.section==='capabilities')return '<section class="fv-card">'+head('capabilities','add-capability','addCapability')+this.table([t('siteId'),t('category'),t('declaredMonthlyCapacity'),t('unit'),t('asOfDate'),t('capacitySourceRef')],p.capabilities.map(x=>[p.sites.find(s=>s.id===x.siteId)?.siteName,x.category,x.declaredMonthlyCapacity,x.unit,x.asOfDate,x.capacitySourceRef]))+'<p class="fv-warning">'+e(t('notCert'))+'</p></section>';
  if(this.section==='documents')return '<section class="fv-card">'+head('documents','add-certificate','addCertificate')+this.table([t('siteId'),t('scheme'),t('issuer'),t('expiryDate'),t('documentStatus'),'Date-only state'],p.certificates.map(x=>[p.sites.find(s=>s.id===x.siteId)?.siteName,x.scheme,x.issuer,x.expiryDate,x.documentStatus,this.C.dateState(x,this.asOf).dateState]))+'<p class="fv-warning">'+e(t('warning'))+'</p></section>';
  if(this.section==='onboarding')return '<section class="fv-card">'+head('onboarding','add-review','addReview')+this.table([t('siteId'),t('reviewer'),t('reviewDate'),t('checklistRef'),t('internalOutcome')],p.reviews.map(x=>[p.sites.find(s=>s.id===x.siteId)?.siteName,x.reviewer,x.reviewDate,x.checklistRef,x.internalOutcome]))+'</section>';
  if(this.section==='performance')return '<section class="fv-card">'+head('performance','add-performance','addPerformance')+this.table([t('siteId'),t('metric'),t('periodFrom'),t('periodTo'),t('numerator'),t('denominator'),t('sourceRef')],p.performance.map(x=>[p.sites.find(s=>s.id===x.siteId)?.siteName,x.metric,x.periodFrom,x.periodTo,x.numerator,x.denominator,x.sourceRef]))+'</section>';
  if(this.section==='reports')return '<section class="fv-card">'+head('reports')+'<p class="fv-warning">'+e(t('reportPlanned'))+'</p><p>'+e(t('noApproval'))+'</p></section>';
  return '<section class="fv-card">'+head('history')+this.table(['Revision','Action','Date/Time','Evidence ID'],p.audit.map(x=>[x.revision,x.action,x.at,x.recordId]))+'<p class="fv-note">'+e(t('noApproval'))+'</p></section>';
 }
 form(kind){const h=this.current?.header||{},e=x=>this.e(x),f=(key,required=true,type='text',wide=false)=>this.field(key,'',type,(required?'required ':'')+'maxlength="250"',wide);
  const begin='<form class="fv-form" data-form="'+e(kind)+'">',end='<div class="wide fv-actions"><button type="submit" class="fv-btn primary">'+e(this.t('submit'))+'</button></div></form>';
  const sites=this.current?.sites||[],options=sites.map(x=>[x.id,x.siteName+' / '+x.country]);let body='';
  if(kind==='new')for(const key of ['vendorName','country','sourceRef'])body+=f(key,true,'text',key==='sourceRef');
  else{
   if(kind!=='add-site'){
    if(!options.length)throw Error('Record factory site first');body+=this.choose('siteId',options,options[0][0]);
   }
   if(kind==='add-site')for(const key of ['siteName','country','process','sourceRef'])body+=f(key,true,'text',key==='sourceRef');
   if(kind==='add-capability'){
    for(const key of ['category','unit'])body+=f(key);body+=this.number('declaredMonthlyCapacity');
    body+=f('asOfDate',true,'date')+f('sourceRef',true,'text',true)+f('capacitySourceRef',false,'text',true)+f('reviewedBy')+f('reviewDate',true,'date');
    body+=this.number('moq')+this.number('leadDays')+f('leadDaysSource',false);
   }
   if(kind==='add-certificate'){
    for(const key of ['scheme','issuer','documentRef','sourceRef'])body+=f(key,true,'text',key==='sourceRef');
    body+=f('issueDate',true,'date')+f('expiryDate',true,'date')+f('reviewedBy')+f('reviewDate',true,'date');
    body+=this.choose('documentStatus',[['document-supplied','Document supplied (NOT VERIFIED)'],['source-unconfirmed','Source not confirmed'],['document-rejected','Document rejected']]);
   }
   if(kind==='add-review'){
    for(const key of ['reviewer','checklistRef','sourceRef'])body+=f(key,true,'text',key==='sourceRef');
    body+=f('reviewDate',true,'date')+this.choose('internalOutcome',[['needs-information','Needs information'],['internal-reviewed','Reviewed internally (NOT BUYER APPROVAL)'],['hold','Internal HOLD']]);
   }
   if(kind==='add-performance'){
    for(const key of ['metric','unit','sourceRef','reviewer'])body+=f(key,true,'text',key==='sourceRef');
    body+=f('periodFrom',true,'date')+f('periodTo',true,'date')+f('reviewDate',true,'date')+
     this.number('numerator','',true)+this.number('denominator','',true);
   }
  }
  const headings={'new':'new','add-site':'addSite','add-capability':'addCapability','add-certificate':'addCertificate','add-review':'addReview','add-performance':'addPerformance'};
  this.modal(this.t(headings[kind]||'new'),begin+body+end);
 }
 submit(form){const get=k=>String(new FormData(form).get(k)??'').trim(),kind=form.dataset.form;
  const opt=k=>get(k)===''?null:Number(get(k));const required=k=>Number(get(k));
  try{
   if(kind==='new'){const next=this.E.create({vendorName:get('vendorName'),country:get('country'),sourceRef:get('sourceRef')});next.mode='local';
    const check=this.E.validate(next);if(!check.ok)throw Error(check.errors.join('; '));this.store.save(next);this.current=next;this.section='summary';
   }else{
    if(!this.current||this.current.mode==='practice')throw Error('Practice is read only');
    const id=this.E.id('FVD-'+kind.replace('add-','').toUpperCase()),siteId=get('siteId');let entry;
    if(kind==='add-site')entry={id,siteName:get('siteName'),country:get('country'),process:get('process'),sourceRef:get('sourceRef')};
    else if(kind==='add-capability')entry={id,siteId,category:get('category'),unit:get('unit'),declaredMonthlyCapacity:opt('declaredMonthlyCapacity'),
     asOfDate:get('asOfDate'),sourceRef:get('sourceRef'),capacitySourceRef:get('capacitySourceRef'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate'),
     moq:opt('moq'),leadDays:opt('leadDays'),leadDaysSource:get('leadDaysSource')};
    else if(kind==='add-certificate')entry={id,siteId,scheme:get('scheme'),issuer:get('issuer'),documentRef:get('documentRef'),sourceRef:get('sourceRef'),
     issueDate:get('issueDate'),expiryDate:get('expiryDate'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate'),documentStatus:get('documentStatus')};
    else if(kind==='add-review')entry={id,siteId,reviewer:get('reviewer'),checklistRef:get('checklistRef'),sourceRef:get('sourceRef'),
     reviewDate:get('reviewDate'),internalOutcome:get('internalOutcome')};
    else if(kind==='add-performance')entry={id,siteId,metric:get('metric'),unit:get('unit'),sourceRef:get('sourceRef'),reviewer:get('reviewer'),
     periodFrom:get('periodFrom'),periodTo:get('periodTo'),reviewDate:get('reviewDate'),numerator:required('numerator'),denominator:required('denominator')};
    else throw Error('Unsupported vendor form');
    const mapped={'add-site':'site','add-capability':'capability','add-certificate':'certificate','add-review':'review','add-performance':'performance'};
    const proposed=this.E.append(this.current,mapped[kind],entry);this.store.save(proposed);this.current=proposed;
   }
   this.dialog.close();this.render();
  }catch(error){let alert=form.querySelector('[role=alert]');if(!alert){alert=document.createElement('p');alert.className='wide fv-warning';alert.setAttribute('role','alert');form.prepend(alert);}alert.textContent=error.message;}
 }
}
root.VesaFactoryVendorWorkspace=FactoryVendorWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
