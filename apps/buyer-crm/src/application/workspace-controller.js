/* APP-11 Browser-only CRM. One shared VESA shell, explicit source, no email/SMS/PO conversion. */
(function(root){
'use strict';
class BuyerCRMWorkspace{
 constructor(){
  this.main=document.getElementById('crmMain');this.dialog=document.getElementById('crmDialog');
  this.body=document.getElementById('crmDialogBody');this.file=document.getElementById('crmCopyFile');
  this.E=root.VesaBuyerDirectory;this.O=root.VesaCRMOpportunityState;this.F=root.VesaCRMFollowupScheduler;
  this.C=root.VesaBuyerCRMCopyCodec;this.T=root.VesaBuyerCRMCopy;
  const user=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaBuyerCRMLocalStore(user.email||'local-browser-user');
  this.current=null;this.section='summary';this.shell=null;this.focusBefore=null;
  this.asOf=new Date().toISOString().slice(0,10);
 }
 t(k){return this.T.t(k);}
 e(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 btn(action,key,primary=false,id='',disabled=false){return '<button class="crm-btn'+(primary?' primary':'')+'" data-action="'+this.e(action)+'" type="button"'+(id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+this.e(this.t(key))+'</button>';}
 field(k,required=false,type='text',wide=false,value=''){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+'</span><input name="'+this.e(k)+'" type="'+this.e(type)+'" value="'+this.e(value)+'"'+(required?' required':'')+' maxlength="300"></label>';}
 select(k,opts,wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+'</span><select name="'+this.e(k)+'">'+opts.map(([v,l])=>'<option value="'+this.e(v)+'">'+this.e(l)+'</option>').join('')+'</select></label>';}
 textarea(k){return '<label class="wide"><span>'+this.e(this.t(k))+'</span><textarea name="'+this.e(k)+'" maxlength="800"></textarea></label>';}
 modal(title,html){this.focusBefore=document.activeElement;document.getElementById('crmDialogTitle').textContent=title;this.body.innerHTML=html;
  if(!this.dialog.open)this.dialog.showModal();this.dialog.addEventListener('close',()=>this.focusBefore?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,textarea,button')?.focus?.();}
 error(message){this.modal(this.t('errors'),'<p class="crm-warning" role="alert">'+this.e(message)+'</p>');}
 download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1400);}
 start(){const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell){this.main.textContent='Shared VESA shell unavailable';return;}
  const user=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{id:'buyer-crm',name:'VESA Buyer CRM 360',route:'/apps/buyer-crm/',
   contentTarget:'#crmMain',userLabel:user.name||user.email||'',userRole:user.role||'',savedState:'Browser-local'},
   callbacks:{menu:name=>this.menu(name)}});this.shell.mount();
  document.getElementById('crmDialogClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;event.preventDefault();this.action(b.dataset.action,b.dataset.id||'');});
  this.dialog.addEventListener('submit',event=>{const f=event.target.closest('form[data-form]');if(!f)return;event.preventDefault();this.submit(f);});
  this.file.addEventListener('change',async()=>{const file=this.file.files?.[0];this.file.value='';if(!file)return;
   try{if(file.size>this.C.maxLength)throw Error('Saved CRM file is too large');
    const p=this.C.decode(await file.text());if(this.store.load(p.id)){
     p.id=this.E.id('BUY-COPY');p.revision++;p.updatedAt=new Date().toISOString();
     p.audit.push({revision:p.revision,at:p.updatedAt,action:'Separate saved CRM copy restored',recordId:p.id});
    }
    p.mode='local';this.store.save(p);this.current=p;this.section='summary';this.render();
    this.modal(this.t('upload'),'<p class="crm-note">'+this.e(this.t('openedCopy'))+'</p>');
   }catch(err){this.error(err.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.VesaBuyerCRM360=this;this.render();
 }
 menu(name){const groups={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
  File:[['save','save'],['download','download'],['upload','upload']],
  Edit:[['add-contact','addContact'],['add-enquiry','addEnquiry'],['add-opportunity','addOpportunity'],['add-stage','addStage'],['add-followup','addFollowup']],
  View:[['summary','summary'],['contacts','contacts'],['enquiries','enquiries'],['pipeline','pipeline'],['followups','followups'],['history','history'],['reports','reports']],
  Tools:[['asof','setAsOf'],['report','report']],Help:[['help','help']]};
  this.modal(name,'<div class="crm-actions">'+(groups[name]||[]).map(([action,k])=>'<button class="crm-btn" type="button" data-menu-action="'+this.e(action)+'">'+this.e(this.t(k))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-menu-action]').forEach(b=>b.onclick=()=>{this.dialog.close();this.action(b.dataset.menuAction);});
 }
 action(name,id=''){try{
  if(name==='home'){this.current=null;this.section='summary';this.render();return;}
  if(name==='new'){this.form('new');return;}
  if(name==='practice'){let p=this.E.create({organizationName:'SYNTHETIC BUYER',territory:'SYNTHETIC TERRITORY',sourceRef:'SYNTHETIC DIRECTORY SOURCE'});
   p=this.E.append(p,'enquiry',{id:'SYN-ENQ',category:'SYN POLO',styleRequest:'SYN-STYLE',sourceRef:'SYN QUOTE REQUEST',sourceDate:'2026-10-17',requestedQuantity:1000,unit:'pieces'});
   p.mode='practice';this.current=p;this.section='summary';this.render();return;}
  if(name==='continue'){const saved=this.store.list();if(!saved.length)throw Error(this.t('none'));this.action('load',saved[0].id);return;}
  if(name==='load'){const p=this.store.load(id);if(!p)throw Error('CRM record not found on this device');this.current=p;this.section='summary';this.render();return;}
  if(name==='save'){if(!this.current||this.current.mode==='practice')throw Error('Open local CRM record before saving');this.store.save(this.current);this.render();return;}
  if(name==='download'){if(!this.current||this.current.mode==='practice')throw Error('Open a local CRM record before downloading');
   this.download(this.C.encode(this.current),'VESA-BUYER-CRM-'+this.current.id+'.vesacrm');return;}
  if(name==='upload'){this.file.click();return;}
  if(['summary','contacts','enquiries','pipeline','followups','history','reports'].includes(name)){
   if(!this.current)throw Error('Open a local CRM record');this.section=name;this.render();return;}
  if(name==='report'){if(!this.current)throw Error('Open a local CRM record');this.section='reports';this.render();return;}
  if(name==='asof'){this.form('asof');return;}
  if(name==='help'){this.modal(this.t('help'),'<p class="crm-warning">'+this.e(this.t('warning'))+'</p><p>'+this.e(this.t('noApproval'))+'</p>');return;}
  if(['add-contact','add-enquiry','add-opportunity','add-stage','add-followup'].includes(name)){
   if(!this.current||this.current.mode==='practice')throw Error('Open a saved local CRM record for editing');this.form(name);return;}
 }catch(err){this.error(err.message);}}
 table(headers,rows){return '<div class="crm-scroll"><table class="crm-table"><thead><tr>'+headers.map(k=>'<th>'+this.e(k)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+this.e(v??this.t('needs'))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 render(){const e=v=>this.e(v??this.t('needs')),t=k=>e(this.t(k));
  const banner='<section class="crm-card"><h1>'+t('title')+'</h1><p class="crm-note">'+t('lead')+'</p><p class="crm-warning">'+t('notice')+'</p></section>';
  if(!this.current){let saved=[];try{saved=this.store.list();}catch(err){this.main.innerHTML=banner+'<p class="crm-warning" role="alert">'+e(err.message)+'</p>'+this.btn('upload','upload');return;}
   this.main.innerHTML=banner+'<section class="crm-card"><div class="crm-actions">'+this.btn('new','new',true)+this.btn('continue','continue')+this.btn('upload','upload')+this.btn('practice','practice')+'</div><h2>'+t('openRecords')+'</h2>'+
    (saved.length?saved.map(v=>'<div class="crm-record"><span><b>'+e(v.name)+'</b> / '+e(v.territory)+'<small>Rev '+e(v.revision)+'</small></span>'+this.btn('load','open',false,v.id)+'</div>').join(''):'<p class="crm-note">'+t('none')+'</p>')+'</section>';
   this.shell?.setSavedState('unsaved');return;}
  const p=this.current,practice=p.mode==='practice',checked=this.E.validate(p);
  const tabs=['summary','contacts','enquiries','pipeline','followups','reports','history'];
  this.main.innerHTML=banner+'<section class="crm-card"><h2>'+e(p.header.organizationName)+' / '+e(p.header.territory)+'</h2><p class="crm-note">'+(practice?'SYNTHETIC PRACTICE':t('localOnly'))+' / '+t('status')+'</p>'+
   '<div class="crm-actions">'+this.btn('home','back')+this.btn('save','save',true,'',practice)+this.btn('download','download',false,'',practice)+'</div></section>'+
   '<nav class="crm-tabs" aria-label="Buyer CRM sections">'+tabs.map(k=>'<button class="crm-btn" type="button" data-action="'+k+'" aria-current="'+(this.section===k)+'">'+t(k)+'</button>').join('')+'</nav>'+
   (!checked.ok?'<section class="crm-card crm-warning" role="alert">'+e(checked.errors.join('; '))+'</section>':'')+this.panel(p,practice);
  this.shell?.setSavedState('saved');
 }
 panel(p,practice){const t=k=>this.t(k),e=v=>this.e(v??this.t('needs'));
  const head=(k,act,label)=>'<div class="crm-actions"><h2>'+e(t(k))+'</h2>'+(act?this.btn(act,label,true,'',practice):'')+'</div>';
  if(this.section==='summary')return '<section class="crm-card"><div class="crm-actions">'+this.btn('add-contact','addContact',true,'',practice)+this.btn('add-enquiry','addEnquiry',false,'',practice)+this.btn('add-opportunity','addOpportunity',false,'',practice)+'</div><div class="crm-grid">'+
   [['contacts',p.contacts.length],['enquiries',p.enquiries.length],['pipeline',p.opportunities.length],['followups',p.followups.length]].map(([k,n])=>'<div class="crm-stat"><strong>'+e(n)+'</strong><small>'+e(t(k))+'</small></div>').join('')+'</div><p class="crm-warning">'+e(t('warning'))+'</p></section>';
  if(this.section==='contacts')return '<section class="crm-card">'+head('contacts','add-contact','addContact')+
   this.table([t('contactName'),t('role'),t('email'),t('consentStatus'),t('privacySourceRef'),t('sourceRef')],p.contacts.map(x=>[x.contactName,x.role,x.email||null,x.consentStatus,x.privacySourceRef,x.sourceRef]))+'</section>';
  if(this.section==='enquiries')return '<section class="crm-card">'+head('enquiries','add-enquiry','addEnquiry')+
   this.table([t('category'),t('styleRequest'),t('requestedQuantity'),t('unit'),t('sourceDate'),t('sourceRef')],p.enquiries.map(x=>[x.category,x.styleRequest,x.requestedQuantity,x.unit,x.sourceDate,x.sourceRef]))+'</section>';
  if(this.section==='pipeline'){const totals=this.O.pipeline(p);
   return '<section class="crm-card">'+head('pipeline','add-opportunity','addOpportunity')+'<div class="crm-actions">'+this.btn('add-stage','addStage',false,'',practice)+'</div>'+
    this.table([t('opportunity'),t('stage'),t('amount'),t('currency'),t('sourceRef'),t('reviewDate')],p.opportunities.map(x=>[x.id,this.O.latestStage(p,x.id)?.stage,x.amount??null,x.currency??null,x.stageSourceRef,x.reviewDate]))+
    '<p class="crm-warning">'+e(t('pipelineNotice'))+'</p>'+
    this.table([t('currency'),t('sourcedTotal'),t('authority')],totals.byCurrency.map(x=>[x.currency,x.sourceAmount,'NOT ORDERS/REVENUE']))+'</section>';}
  if(this.section==='followups')return '<section class="crm-card">'+head('followups','add-followup','addFollowup')+
   '<div class="crm-actions">'+this.btn('asof','setAsOf')+'<span class="crm-note">'+e(this.asOf)+'</span></div>'+
   this.table([t('linkType'),t('owner'),t('dueDate'),t('followupState'),t('sourceRef')],this.F.evaluate(p,this.asOf).map(f=>[f.linkType,f.owner,f.dueDate,f.localState,f.sourceRef]))+
   '<p class="crm-warning">'+e(t('followupNotice'))+'</p></section>';
  if(this.section==='reports')return '<section class="crm-card">'+head('reports')+'<p class="crm-warning">'+e(t('reportPlanned'))+'</p></section>';
  return '<section class="crm-card">'+head('history')+this.table(['Rev','Action','Date','Evidence'],p.audit.map(a=>[a.revision,a.action,a.at,a.recordId||'']))+'</section>';
 }
 form(kind){const e=v=>this.e(v),t=k=>this.t(k);
  let body='',opts=this.current?.enquiries?.map(x=>[x.id,x.category+' / '+x.id])||[],o=this.current?.opportunities?.map(x=>[x.id,x.stage+' / '+x.id])||[];
  if(kind==='new')body=this.field('organizationName',true)+this.field('territory',true)+this.field('sourceRef',true,'text',true);
  if(kind==='add-contact')body=this.field('contactName',true)+this.field('role',true)+this.field('email',false,'email')+this.field('phone')+
   this.field('sourceRef',true,'text',true)+this.field('privacySourceRef',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
   this.select('consentStatus',[['needs-information','Needs information'],['local-consent-evidence-recorded','Local evidence recorded (NOT LEGAL CONSENT VERIFICATION)'],['source-says-no-consent','Source says no consent']],true)+this.textarea('notes');
  if(kind==='add-enquiry')body=this.field('category',true)+this.field('styleRequest')+this.field('requestedQuantity',false,'number')+
   this.field('unit')+this.field('sourceDate',true,'date')+this.field('sourceRef',true,'text',true);
  if(kind==='add-opportunity'){if(!opts.length)throw Error('Create a sourced enquiry first');
   body=this.select('enquiryId',opts,true)+this.field('stage',true)+this.field('stageSourceRef',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
   this.field('amount')+this.field('currency')+this.field('amountSourceRef',false,'text',true)+this.field('amountReviewedBy')+this.field('amountReviewDate',false,'date');}
  if(kind==='add-stage'){if(!o.length)throw Error('Create a sourced opportunity first');
   body=this.select('opportunityId',o,true)+this.field('stage',true)+this.field('sourceRef',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date');}
  if(kind==='add-followup'){
   const links=[...opts.map(x=>['enquiry|'+x[0],'Enquiry '+x[1]]),...o.map(x=>['opportunity|'+x[0],'Opportunity '+x[1]])];
   if(!links.length)throw Error('Create an enquiry or opportunity first');
   body=this.select('linkedItem',links,true)+this.field('owner',true)+this.field('dueDate',true,'date')+this.field('createdDate',true,'date')+this.field('sourceRef',true,'text',true)+
    this.select('followupStatus',[['open','Open'],['done','Done with source'],['cancelled','Cancelled with source']])+
    this.field('closedDate',false,'date')+this.field('outcomeSourceRef',false,'text',true);
  }
  if(kind==='asof')body=this.field('asOf',true,'date',true,this.asOf);
  if(!body)throw Error('Unknown CRM form type');
  const labels={new:'new','add-contact':'addContact','add-enquiry':'addEnquiry','add-opportunity':'addOpportunity','add-stage':'addStage','add-followup':'addFollowup',asof:'setAsOf'};
  this.modal(this.t(labels[kind]),'<form class="crm-form" data-form="'+e(kind)+'">'+body+
   '<div class="wide crm-actions"><button class="crm-btn primary" type="submit">'+e(t('submit'))+'</button></div></form>');
 }
 submit(form){const fd=new FormData(form),get=k=>String(fd.get(k)??'').trim(),kind=form.dataset.form;
  try{
   if(kind==='asof'){if(!this.E.date(get('asOf')))throw Error('Choose a real date');this.asOf=get('asOf');}
   else if(kind==='new'){
    const p=this.E.create({organizationName:get('organizationName'),territory:get('territory'),sourceRef:get('sourceRef')});
    const dup=this.E.potentialDuplicateOrganization(this.store.read(),p.header);
    if(dup.length)throw Error('Possible duplicate organization needs human review; choose existing record first');
    this.store.save(p);this.current=p;this.section='summary';
   }else{
    if(!this.current||this.current.mode==='practice')throw Error('Practice is read-only');
    let entry=null,sourceKind=null;
    const id=this.E.id('CRM-'+kind.replace('add-','').toUpperCase());
    if(kind==='add-contact'){sourceKind='contact';entry={id,contactName:get('contactName'),role:get('role'),email:get('email'),phone:get('phone'),notes:get('notes'),
     sourceRef:get('sourceRef'),privacySourceRef:get('privacySourceRef'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate'),consentStatus:get('consentStatus')};this.section='contacts';}
    else if(kind==='add-enquiry'){sourceKind='enquiry';entry={id,category:get('category'),styleRequest:get('styleRequest'),sourceRef:get('sourceRef'),sourceDate:get('sourceDate'),
     requestedQuantity:get('requestedQuantity')===''?null:Number(get('requestedQuantity')),unit:get('unit')};this.section='enquiries';}
    else if(kind==='add-opportunity'){sourceKind='opportunity';entry={id,enquiryId:get('enquiryId'),stage:get('stage'),stageSourceRef:get('stageSourceRef'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate'),
     amount:get('amount')||null,currency:get('currency'),amountSourceRef:get('amountSourceRef'),amountReviewedBy:get('amountReviewedBy'),amountReviewDate:get('amountReviewDate')};this.section='pipeline';}
    else if(kind==='add-stage'){sourceKind='stage';entry={id,opportunityId:get('opportunityId'),stage:get('stage'),sourceRef:get('sourceRef'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate')};this.section='pipeline';}
    else if(kind==='add-followup'){const link=get('linkedItem').split('|');sourceKind='followup';entry={id,linkType:link[0],linkId:link[1],owner:get('owner'),sourceRef:get('sourceRef'),
     createdDate:get('createdDate'),dueDate:get('dueDate'),status:get('followupStatus'),closedDate:get('closedDate'),outcomeSourceRef:get('outcomeSourceRef')};this.section='followups';}
    else throw Error('Unknown CRM source action');
    const proposed=this.E.append(this.current,sourceKind,entry);this.store.save(proposed);this.current=proposed;
   }
   this.dialog.close();this.render();
  }catch(err){let a=form.querySelector('[role=alert]');if(!a){a=document.createElement('p');a.className='wide crm-warning';a.setAttribute('role','alert');form.prepend(a);}a.textContent=err.message;}
 }
}
root.VesaBuyerCRMWorkspace=BuyerCRMWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
