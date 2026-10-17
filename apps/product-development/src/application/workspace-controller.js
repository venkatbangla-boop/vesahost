/* APP-15 one shared VESA shell and Product-Dev-only local proposal actions.
 * No sibling storage access, external image retrieval, emails, final Tech Pack, buyer or PO mutation.
 * All forms are explicit human source entries; revisions/decisions use the independent pure engines.
 */
(function(root){
'use strict';
class VesaProductWorkspace{
 constructor(){
  this.main=document.getElementById('pdMain');
  this.dialog=document.getElementById('pdDialog');
  this.body=document.getElementById('pdDialogBody');
  this.file=document.getElementById('pdSavedFile');
  this.E=root.VesaProductConceptRegister;
  this.R=root.VesaProductRevisionHistory;
  this.B=root.VesaProductBoardLayout;
  this.C=root.VesaProductCopyCodec;
  this.T=root.VesaProductCopy;
  const session=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaProductLocalStore(session.email||'local-browser-user');
  this.current=null;this.practice=false;this.section='summary';this.shell=null;this.previousFocus=null;
 }
 t(key){return this.T.t(key);}
 e(value){return String(value??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 btn(action,key,primary=false,id='',disabled=false){
  return'<button type="button" class="pd-btn'+(primary?' primary':'')+'" data-action="'+this.e(action)+
   '"'+(id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+this.e(this.t(key))+'</button>';
 }
 field(name,required=false,type='text',wide=false,value=''){
  const a=' name="'+this.e(name)+'"'+(required?' required':'')+'';
  return'<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(name))+'</span>'+
   (type==='textarea'?'<textarea'+a+' maxlength="4000">'+this.e(value)+'</textarea>':
   '<input type="'+this.e(type)+'"'+a+' value="'+this.e(value)+'" maxlength="4000">')+'</label>';
 }
 select(name,options,required=false,wide=false){
  return'<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(name))+'</span>'+
   '<select name="'+this.e(name)+'"'+(required?' required':'')+'><option value="">'+this.e(this.t('choose'))+
   '</option>'+options.map(([value,label])=>'<option value="'+this.e(value)+'">'+this.e(label)+'</option>').join('')+
   '</select></label>';
 }
 modal(title,html){
  this.previousFocus=document.activeElement;
  document.getElementById('pdDialogTitle').textContent=title;
  this.body.innerHTML=html;
  if(!this.dialog.open)this.dialog.showModal();
  this.dialog.addEventListener('close',()=>this.previousFocus?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,textarea,button')?.focus?.();
 }
 error(message){this.modal(this.t('invalid'),'<p class="pd-warning" role="alert">'+this.e(message)+'</p>');}
 start(){
  const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell)throw Error('Shared VESA workspace is unavailable');
  const s=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{
   id:'product-development',name:'VESA Product Development 360',route:'/apps/product-development/',
   contentTarget:'#pdMain',userLabel:s.name||s.email||'',userRole:s.role||'',savedState:'Browser-local'},
   callbacks:{menu:name=>this.menu(name)}});
  this.shell.mount();
  document.getElementById('pdDialogClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{
   const btn=event.target.closest('[data-action]');if(!btn)return;
   event.preventDefault();this.action(btn.dataset.action,btn.dataset.id||'');
  });
  this.dialog.addEventListener('submit',event=>{
   const form=event.target.closest('form[data-form]');if(!form)return;
   event.preventDefault();this.submit(form);
  });
  this.file.addEventListener('change',async()=>{
   const file=this.file.files?.[0];this.file.value='';if(!file)return;
   try{
    if(file.size>this.C.maxLength)throw Error('Saved copy exceeds 2MB safety limit');
    let record=this.C.decode(await file.text());
    if(this.store.load(record.id)){
     record=this.E.copy(record);record.id=this.E.id('CONCEPT-COPY');
     record.revision++;record.updatedAt=new Date().toISOString();
     record.audit.push({id:this.E.id('AUDIT'),revision:record.revision,at:record.updatedAt,
      action:'Separate local saved copy opened; original preserved',recordId:record.id});
    }
    this.store.save(record);this.current=record;this.practice=false;this.section='summary';this.render();
    this.modal(this.t('upload'),'<p class="pd-muted">'+this.e(this.t('saved'))+'</p>');
   }catch(err){this.error(err.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.VesaProduct360=this;this.render();
 }
 menu(name){
  const actions={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
   File:[['save','save'],['download','download'],['upload','upload'],['copy','copy']],
   Edit:[['add-colourway','addColourway'],['add-task','addTask'],['add-board','addBoard'],
    ['revise','revise'],['decide','decide']],
   View:[['summary','summary'],['colourways','colourways'],['tasks','tasks'],['boards','boards'],
    ['revisions','revisions'],['decisions','decisions'],['history','history']],
   Tools:[['summary','summary'],['download','download']],Help:[['help','help']]};
  this.modal(name,'<div class="pd-actions">'+(actions[name]||[]).map(([action,key])=>
   '<button type="button" class="pd-btn" data-menu-action="'+this.e(action)+'">'+this.e(this.t(key))+
   '</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-menu-action]').forEach(b=>b.onclick=()=>{
   this.dialog.close();this.action(b.dataset.menuAction);});
 }
 download(content,filename){const u=URL.createObjectURL(new Blob([content],{type:'application/json'}));
  const a=document.createElement('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1500);
 }
 action(name,id=''){
  try{
   if(name==='home'){this.current=null;this.practice=false;this.section='summary';this.render();return;}
   if(name==='new'){this.form('new');return;}
   if(name==='practice'){this.current=this.E.demo();this.practice=true;this.section='summary';this.render();return;}
   if(name==='continue'){const list=this.store.list();
    if(!list.length)throw Error(this.t('none'));this.action('load',list[0].id);return;}
   if(name==='load'){const record=this.store.load(id);if(!record)throw Error(this.t('none'));
    this.current=record;this.practice=false;this.section='summary';this.render();return;}
   if(name==='save'){this.editable();this.store.save(this.current);this.render();return;}
   if(name==='copy'){
    this.editable();const p=this.E.copy(this.current);p.id=this.E.id('CONCEPT-COPY');
    p.revision++;p.updatedAt=new Date().toISOString();p.audit.push({id:this.E.id('AUDIT'),
     revision:p.revision,at:p.updatedAt,action:'Manual separate local concept copy',recordId:p.id});
    this.store.save(p);this.current=p;this.render();return;
   }
   if(name==='download'){this.editable();
    this.download(this.C.encode(this.current),'VESA-PRODUCT-'+this.current.id+'.vesaproduct');return;}
   if(name==='upload'){this.file.click();return;}
   if(['summary','colourways','tasks','boards','revisions','decisions','history'].includes(name)){
    if(!this.current)throw Error(this.t('none'));this.section=name;this.render();return;}
   if(['add-colourway','add-task','add-board','revise','decide'].includes(name)){
    this.editable();this.form(name);return;}
   if(name==='help'){this.modal(this.t('help'),'<p class="pd-warning">'+this.e(this.t('warning'))+
    '</p><p>'+this.e(this.t('rightsNotice'))+'</p><p>'+this.e(this.t('reportPlanned'))+'</p>');}
  }catch(err){this.error(err.message);}
 }
 editable(){if(!this.current||this.practice)throw Error(this.t('practiceOnly'));}
 form(kind){
  const f=(name,req=false,type='text',wide=false,value='')=>this.field(name,req,type,wide,value);
  const sel=(name,opts,req=false,wide=false)=>this.select(name,opts,req,wide);
  const a=[];
  if(kind==='new'){
   for(const k of ['conceptName','category','season','market','sourceRef','reviewedBy'])
    a.push(f(k,true));
   a.push(f('reviewDate',true,'date'));
   a.push(f('silhouette'));a.push(f('requestedBuyer'));
   a.push(f('brief',false,'textarea',true));
  }
  if(kind==='add-colourway'){
   a.push(f('name',true));a.push(f('sourceRef',true));a.push(f('sourceDate',true,'date'));
   a.push(f('reviewedBy',true));a.push(f('colourRef'));a.push(f('colourSourceRef'));
   a.push(f('silhouette'));a.push(f('materialProposal'));a.push(f('materialSourceRef'));
   a.push(f('notes',false,'textarea',true));
  }
  if(kind==='add-task'){
   a.push(sel('kind',['fit','technical','sampling','material','other'].map(v=>[v,v]),true));
   a.push(f('description',true));a.push(f('sourceRef',true));a.push(f('sourceDate',true,'date'));
   a.push(f('reviewedBy',true));
  }
  if(kind==='add-board'){
   a.push(f('titleBoard',true));
   a.push(sel('layout',[['single','Single card'],['grid-2','Two columns'],['grid-3','Three columns']],true));
   a.push(sel('aspect',[['16:9','16:9'],['4:3','4:3'],['1:1','1:1']],true));
   a.push(f('sourceRef',true));a.push(f('sourceDate',true,'date'));a.push(f('reviewedBy',true));
   a.push(f('boardNote',false,'textarea',true));
   a.push(sel('boardColourway',this.current.colourways.map(c=>[c.id,c.name]),false,true));
  }
  if(kind==='revise'){
   a.push(f('brief',false,'textarea',true,this.current.header.brief));
   a.push(f('silhouette',false,'text',false,this.current.header.silhouette));
   a.push(f('sourceRef',true));a.push(f('sourceDate',true,'date'));
   a.push(f('reviewedBy',true));a.push(f('comments',true,'textarea',true));
  }
  if(kind==='decide'){
   a.push(sel('state',[['review-requested',this.t('reviewRequested')],
    ['changes-requested',this.t('changesRequested')],
    ['selected-for-next-draft',this.t('selectedDraft')],
    ['rejected-proposal',this.t('rejectedProposal')]],true));
   a.push(sel('party',[['internal','Internal'],['buyer-claimed','Buyer-claimed'],
    ['factory-claimed','Factory-claimed']],true));
   a.push(f('actor',true));a.push(f('authorityRef',true));a.push(f('sourceRef',true));
   a.push(f('decisionDate',true,'date'));a.push(f('comments',true,'textarea',true));
  }
  if(!a.length)throw Error('Unrecognized local concept form');
  this.modal(this.t(kind==='new'?'new':{
   'add-colourway':'addColourway','add-task':'addTask','add-board':'addBoard',
   revise:'revise',decide:'decide'}[kind]),
   '<form data-form="'+this.e(kind)+'"><div class="pd-form">'+a.join('')+'</div>'+
    '<div class="pd-actions"><button class="pd-btn primary" type="submit">'+this.e(this.t('submit'))+
    '</button></div></form>');
 }
 submit(form){
  const kind=form.dataset.form,values=Object.fromEntries(new FormData(form).entries());
  try{
   let next;
   if(kind==='new')next=this.E.create(values);
   else{
    this.editable();
    if(kind==='add-colourway')next=this.E.append(this.current,'colourway',values);
    else if(kind==='add-task')next=this.E.append(this.current,'task',{
     ...values,state:'requested-not-approved'});
    else if(kind==='add-board'){
     const cards=[];
     if(values.boardNote.trim())cards.push({id:this.E.id('BOARD-NOTE'),kind:'note',
      text:values.boardNote,sourceRef:values.sourceRef,position:cards.length+1});
     if(values.boardColourway)cards.push({id:this.E.id('BOARD-CW'),kind:'colourway',
      colourwayId:values.boardColourway,sourceRef:values.sourceRef,position:cards.length+1});
     next=this.E.append(this.current,'board',{title:values.titleBoard,layout:values.layout,
      aspect:values.aspect,sourceRef:values.sourceRef,sourceDate:values.sourceDate,
      reviewedBy:values.reviewedBy,cards});
    }else if(kind==='revise')next=this.R.revise(this.current,{
     changes:{brief:values.brief,silhouette:values.silhouette},sourceRef:values.sourceRef,
     sourceDate:values.sourceDate,reviewedBy:values.reviewedBy,summary:values.comments});
    else if(kind==='decide')next=this.R.decide(this.current,values);
    else throw Error('Unrecognized Product Development edit');
   }
   this.store.save(next);this.current=next;this.practice=false;
   this.section=kind==='new'?'summary':
    {'add-colourway':'colourways','add-task':'tasks','add-board':'boards',
     revise:'revisions',decide:'decisions'}[kind]||'summary';
   this.dialog.close();this.render();
  }catch(err){this.error(err.message);}
 }
 table(head,rows){
  return'<div class="pd-scroll" role="region" aria-label="Product development records" tabindex="0">'+
   '<table class="pd-table"><thead><tr>'+head.map(x=>'<th>'+this.e(x)+'</th>').join('')+
   '</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+this.e(v===null||v===undefined||v===''?this.t('needs'):v)+
   '</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 }
 render(){
  const e=v=>this.e(v??this.t('needs')),t=k=>this.e(this.t(k));
  const banner='<section class="pd-card"><h1>'+t('title')+'</h1><p class="pd-muted">'+t('lead')+'</p>'+
   '<p class="pd-warning">'+t('notice')+'</p>'+
   '<p class="pd-muted">NON-COMMERCIAL PERSONAL DEMO — SYNTHETIC IDEAS ONLY</p></section>';
  if(!this.current){
   let saved;try{saved=this.store.list();}catch(err){
    this.main.innerHTML=banner+'<section class="pd-card pd-warning" role="alert">'+e(err.message)+
     '</section>'+this.btn('upload','upload');this.shell?.setSavedState('failed');return;}
   this.main.innerHTML=banner+'<section class="pd-card"><div class="pd-actions">'+
    this.btn('new','new',true)+this.btn('continue','continue')+this.btn('upload','upload')+
    this.btn('practice','practice')+'</div><h2>'+t('savedRecords')+'</h2>'+
    (saved.length?saved.map(item=>'<div class="pd-record"><span><strong>'+e(item.name)+
     '</strong><small>'+e(item.season)+' / Rev '+e(item.revision)+'</small></span>'+
     this.btn('load','openTitle',false,item.id)+'</div>').join(''):
     '<p class="pd-muted">'+t('none')+'</p>')+'</section>';
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,check=this.E.validate(p);
  const summary=check.ok?this.E.summarize(p):{status:'Needs Information'};
  const tabs=['summary','colourways','tasks','boards','revisions','decisions','history'];
  this.main.innerHTML=banner+'<section class="pd-card"><h2>'+e(p.header.conceptName)+
   '</h2><p class="pd-muted">'+e(p.header.category)+' / '+e(p.header.season)+
   ' / '+t('status')+': '+e(summary.status)+'</p>'+
   '<p class="pd-warning">'+(this.practice?t('practiceOnly'):t('localOnly'))+
   ' · '+t('noApproval')+'</p><div class="pd-actions">'+this.btn('home','back')+
   this.btn('save','save',true,'',this.practice)+this.btn('download','download',false,'',this.practice)+
   this.btn('copy','copy',false,'',this.practice)+'</div></section>'+
   '<nav class="pd-tabs" aria-label="Product development sections">'+tabs.map(k=>
    '<button type="button" class="pd-btn" data-action="'+k+'" aria-current="'+(this.section===k)+'">'+
    t(k)+'</button>').join('')+'</nav>'+
   (!check.ok?'<section class="pd-card pd-warning" role="alert">'+e(check.errors.join('; '))+'</section>':'')+
   this.panel(p,summary);
  this.shell?.setSavedState(this.practice?'unsaved':'saved');
 }
 panel(p,summary){
  const e=v=>this.e(v??this.t('needs')),t=k=>this.e(this.t(k)),disabled=this.practice;
  const top=(title,action,key)=>'<div class="pd-actions"><h2>'+t(title)+'</h2>'+
   (action?this.btn(action,key,true,'',disabled):'')+'</div>';
  if(this.section==='summary')return'<section class="pd-card">'+top('summary','add-colourway','addColourway')+
   '<div class="pd-grid">'+[['colourways',p.colourways.length],['boards',p.boards.length],
    ['tasks',p.tasks.length],['revision',p.revision]].map(([k,v])=>
    '<div class="pd-stat"><strong>'+e(v)+'</strong><small>'+t(k)+'</small></div>').join('')+'</div>'+
   '<p><strong>'+t('brief')+':</strong> '+e(p.header.brief)+'</p>'+
   '<p><strong>'+t('sourceRef')+':</strong> '+e(p.header.sourceRef)+'</p>'+
   '<p class="pd-warning">'+t('warning')+'</p></section>';
  if(this.section==='colourways')return'<section class="pd-card">'+top('colourways','add-colourway','addColourway')+
   this.table([t('name'),t('colourRef'),t('materialProposal'),t('sourceRef'),t('sourceDate')],
    p.colourways.map(x=>[x.name,x.colourRef||null,x.materialProposal||null,x.sourceRef,x.sourceDate]))+'</section>';
  if(this.section==='tasks')return'<section class="pd-card">'+top('tasks','add-task','addTask')+
   this.table([t('kind'),t('description'),t('state'),t('sourceRef')],
    p.tasks.map(x=>[x.kind,x.description,x.state,x.sourceRef]))+'</section>';
  if(this.section==='boards')return'<section class="pd-card">'+top('boards','add-board','addBoard')+
   (p.boards.length?p.boards.map(b=>'<div class="pd-board"><h3>'+e(b.title)+'</h3>'+
    '<p class="pd-muted">'+e(b.layout)+' · '+e(b.aspect)+' · '+e(b.sourceRef)+'</p>'+
    '<div class="pd-board-cards">'+b.cards.map(c=>'<div class="pd-board-card">'+
     (c.kind==='note'?e(c.text):c.kind==='colourway'?e(p.colourways.find(x=>x.id===c.colourwayId)?.name):
      e(this.t('rightsNotice')))+'</div>').join('')+'</div></div>').join(''):
    '<p class="pd-muted">'+t('none')+'</p>')+
   '<p class="pd-warning">'+t('rightsNotice')+'</p></section>';
  if(this.section==='revisions')return'<section class="pd-card">'+top('revisions','revise','revise')+
   this.table([t('revision'),t('sourceDate'),t('comments'),t('sourceRef')],
    p.revisions.map(r=>[r.number,r.sourceDate,r.summary,r.sourceRef]))+'</section>';
  if(this.section==='decisions')return'<section class="pd-card">'+top('decisions','decide','decide')+
   this.table([t('state'),t('party'),t('actor'),t('decisionDate'),t('sourceRef')],
    p.decisions.map(x=>[x.state,x.party,x.actor,x.decisionDate,x.sourceRef]))+
   '<p class="pd-warning">'+t('noApproval')+'</p></section>';
  return'<section class="pd-card">'+top('history')+
   this.table([t('revision'),t('sourceDate'),t('description')],
    p.audit.map(x=>[x.revision,x.at,x.action]))+'</section>';
 }
}
root.VesaProductWorkspace=VesaProductWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
