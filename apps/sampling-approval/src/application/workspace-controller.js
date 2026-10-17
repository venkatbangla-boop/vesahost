/* APP-04 controller: manual evidence entry and local-only workflow.
 * Shared VESA shell is sole owner of global logo, six menus and settings.
 * Domain is pure; every mutation goes through validated atomic SamplingStore.
 */
(function(root){
'use strict';
class SamplingWorkspace {
 // This controller alone owns the task order and synthetic preview navigation.
 static steps=Object.freeze(['summary','categories','rounds','decisions','revisions','exceptions','reports']);
 constructor(){
  this.main=document.getElementById('saMain');
  this.dialog=document.getElementById('saDialog');
  this.body=document.getElementById('saDialogBody');
  this.copyFile=document.getElementById('saFile');
  this.referenceFile=document.getElementById('saReferenceFile');
  this.E=root.VesaSamplingEngine;this.S=root.VesaSamplingStore;
  this.R=root.VesaSamplingReports;this.C=root.VesaSamplingCopy;
  this.current=null;this.section='summary';this.dirty=false;this.shell=null;
  this.asOf=new Date().toISOString().slice(0,10);
  this.focus=null;this.refTarget='';this.pendingRef=null;
  const session=root.VesaAuth?.session?.()||{};
  this.store=new this.S(String(session.email||'local-browser-user'));
 }
 t(k){return this.C.t(k);}
 escape(s){return this.R.safe(s);}
 field(k,v='',type='text',attrs='',wide=false){
  return '<label class="'+(wide?'wide':'')+'"><span>'+this.escape(this.t(k))+'</span>'+
   '<input name="'+this.escape(k)+'" type="'+this.escape(type)+'" value="'+this.escape(v??'')+
   '" '+attrs+'></label>';
 }
 choice(k,items,v='',wide=false){
  return '<label class="'+(wide?'wide':'')+'"><span>'+this.escape(this.t(k))+'</span>'+
   '<select name="'+this.escape(k)+'">'+items.map(([value,name])=>
    '<option value="'+this.escape(value)+'"'+(String(v)===String(value)?' selected':'')+'>'+
     this.escape(name)+'</option>').join('')+'</select></label>';
 }
 note(k,v=''){return '<label class="wide"><span>'+this.escape(this.t(k))+'</span>'+
   '<textarea name="'+this.escape(k)+'" maxlength="480">'+this.escape(v)+'</textarea></label>';}
 check(k,on=false){return '<label class="wide sa-check"><input type="checkbox" name="'+this.escape(k)+
   '"'+(on?' checked':'')+'><span>'+this.escape(this.t(k))+'</span></label>';}
 popup(title,html){
  this.focus=document.activeElement;document.getElementById('saDialogTitle').textContent=title;
  this.body.innerHTML=html;
  if(!this.dialog.open)this.dialog.showModal();
  this.dialog.addEventListener('close',()=>this.focus?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,button')?.focus?.();
 }
 warn(message){this.popup('Please review','<p class="sa-alert" role="alert">'+this.escape(message)+'</p>');}
 start(){
  const Shared=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shared){this.main.textContent='VESA shared workspace shell unavailable.';return;}
  const session=root.VesaAuth?.session?.()||{};
  this.shell=new Shared({root:document.body,
   descriptor:{id:'sampling-approval',name:'VESA Sampling & Approval 360',
     route:'/apps/sampling-approval/',contentTarget:'#saMain',
     userLabel:session.name||session.email||'',userRole:session.role||'',
     savedState:'Unsaved changes'},callbacks:{menu:name=>this.menu(name)}});
  this.shell.mount();
  document.getElementById('saClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{
   const item=event.target.closest('[data-action]');if(!item)return;
   event.preventDefault();this.action(item.dataset.action,item.dataset.id);
  });
  this.dialog.addEventListener('submit',event=>{
   const form=event.target.closest('form[data-form]');if(!form)return;
   event.preventDefault();this.submit(form);
  });
  this.copyFile.addEventListener('change',async()=>{
   const file=this.copyFile.files?.[0];this.copyFile.value='';if(!file)return;
   try{
    if(file.size>2097152)throw Error('Saved sample copy exceeds safe size.');
    const p=this.S.decode(await file.text());
    if(this.store.load(p.id)){
     p.id=this.E.id('SREQ-COPY');
     p.audit.push({at:new Date().toISOString(),revision:p.revision,action:'Portable sampling copy imported separately'});
    }
    p.mode='local';this.store.save(p);this.current=p;this.section='summary';this.dirty=false;this.render();
    this.popup(this.t('upload'),'<p>Saved copy opened as a separate record when needed. Older rounds and decisions were retained.</p>');
   }catch(error){this.warn(error.message);}
  });
  this.referenceFile.addEventListener('change',async()=>{
   const file=this.referenceFile.files?.[0];this.referenceFile.value='';if(!file)return;
   try{
    if(!this.current||this.current.mode!=='local')throw Error('Open a local request before attaching source.');
    if(file.size>160000)throw Error('Reviewed source file is too large.');
    const value=JSON.parse(await file.text());
    if(!this.E.referenceValid(value))throw Error('Review file must have a documented application, record, revision, date, reviewer and snapshot.');
    if(this.refTarget==='tech'&&!/tech/i.test(value.sourceApp))
     throw Error('Please use a Tech Pack source reference for tech revision.');
    if(this.refTarget==='po'&&!/purchase order/i.test(value.sourceApp))
     throw Error('Please use a Purchase Order source reference for PO.');
    if(this.refTarget==='artwork'&&!/artwork/i.test(value.sourceApp))
     throw Error('Please use a Label / Artwork source reference for artwork.');
    this.pendingRef=this.E.copy(value);
    this.form('ref-confirm');
   }catch(error){this.warn(error.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.addEventListener('beforeunload',event=>{if(this.dirty&&this.current?.mode==='local'){
   event.preventDefault();event.returnValue='';}});
  this.render();
 }
 menu(name){
  const groups={Home:[['home','home'],['new','new'],['continue','continue'],['practice','practice']],
   File:[['save','save'],['download','download'],['upload','upload'],['open','open']],
   Edit:[['header','header'],['category','addCategory'],['round','addRound'],['decision','addDecision']],
   View:[['summary','summary'],['categories','categories'],['rounds','rounds'],
    ['decisions','decisions'],['exceptions','exceptions']],
   Tools:[['report','report'],['revision','addRevision'],['asof','asOf'],
    ['reference-export','exportRef'],['reference-file','reference']],
   Help:[['help','help'],['practice','practice']]};
  this.popup(name,'<div class="sa-actions">'+(groups[name]||[]).map(([action,label])=>
   '<button type="button" class="sa-btn" data-dialog-action="'+this.escape(action)+'">'+
    this.escape(this.t(label))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-dialog-action]').forEach(button=>button.onclick=()=>{
   this.dialog.close();this.action(button.dataset.dialogAction);});
 }
 action(name,id){
  try{
   if(name==='home'||name==='open'){this.current=null;this.section='summary';this.dirty=false;this.render();return;}
   if(name==='preview'){
     if(this.current||!SamplingWorkspace.steps.includes(id))throw Error('Return to All Requests for practice steps.');
     this.current=this.E.demo();this.section=id;this.dirty=false;this.render();return;
    }
    if(name==='new'){this.form('new');return;}
   if(name==='practice'){this.current=this.E.demo();this.section='summary';this.dirty=false;this.render();return;}
   if(name==='continue'){
    const list=this.store.list();if(!list.length)throw Error('No saved sampling record in this browser.');
    this.action('open-record',list[0].id);return;
   }
   if(name==='open-record'){
    const p=this.store.load(id);if(!p)throw Error('Saved sampling record not found.');
    this.current=p;this.section='summary';this.dirty=false;this.render();return;
   }
   if(name==='upload'){this.copyFile.click();return;}
   if(name==='save'){
    if(!this.current||this.current.mode==='practice')throw Error('Practice is read-only.');
    this.store.save(this.current);this.dirty=false;this.render();return;
   }
   if(name==='download'){
    if(!this.current||this.current.mode==='practice')throw Error('Open a local sampling record.');
    this.download(this.S.encode(this.current),'VESA-SAMPLING-'+this.current.id+'.vesasampling','application/json');return;
   }
   if(['summary','categories','rounds','decisions','revisions','exceptions','reports'].includes(name)){
    if(!this.current)throw Error('Open a sampling request first.');
    this.section=name;this.render();return;
   }
   if(name==='report'){if(!this.current)throw Error('Open a sampling request.');
    this.section='reports';this.render();return;}
   if(name==='excel'){this.excel();return;}
   if(name==='print'){if(!this.current)throw Error('Open a record.');
    this.section='reports';this.render();root.print();return;}
   if(name==='help'){
    this.popup(this.t('help'),'<p class="sa-alert">'+this.escape(this.t('notice'))+'</p>'+
     '<p>'+this.escape(this.t('warning'))+'</p><p>'+this.escape(this.t('reportNotice'))+'</p>'+
     '<p>'+this.escape(this.t('noCalendar'))+'</p>');return;
   }
   if(name==='reference-file'){
    if(!this.current||this.current.mode==='practice')throw Error('Open a local sample request.');
    this.form('reference-select');return;
   }
   if(['new','header','category','round','dispatch','receipt','decision','revision','asof','reference-export'].includes(name)){
    if(name!=='new'&&!this.current)throw Error('Open a sample request.');
    this.form(name,id);return;
   }
  }catch(e){this.warn(e.message);}
 }
 mutate(label,handler){
  if(!this.current||this.current.mode!=='local')throw Error('Practice example is read-only.');
  const p=this.E.copy(this.current);handler(p);p.revision++;p.updatedAt=new Date().toISOString();
  p.audit.push({action:label,revision:p.revision,at:p.updatedAt});
  this.S.validate(p);this.store.save(p);this.current=p;this.dirty=false;this.render();
 }
 download(data,name,mime){
  const blob=data instanceof Blob?data:new Blob([data],{type:mime});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 journey(t){
  const cards=SamplingWorkspace.steps.map((name,index)=>{
   const hint='journey'+name.charAt(0).toUpperCase()+name.slice(1);
   return '<article class="sa-journey-card"><span class="sa-journey-step">'+String(index+1).padStart(2,'0')+
    '</span><h3>'+t(name)+'</h3><p>'+t(hint)+'</p>'+
    '<button type="button" class="sa-btn" data-action="preview" data-id="'+this.escape(name)+
    '" aria-label="'+t('journeyOpen')+' · '+t(name)+'">'+t('journeyOpen')+'</button></article>';
  });
  return '<section class="sa-card" aria-labelledby="saJourneyTitle"><h2 id="saJourneyTitle">'+t('journeyTitle')+
   '</h2><p class="sa-note">'+t('journeyLead')+'</p><div class="sa-journey">'+cards.join('')+'</div></section>';
 }
 render(){
  const e=x=>this.escape(x),t=x=>e(this.t(x));
  const title='<section class="sa-card"><h1>'+t('title')+'</h1>'+
   '<p class="sa-note">'+t('lead')+'</p><p class="sa-alert">'+t('notice')+'</p></section>';
  if(!this.current){
   const list=this.store.list();
   this.main.innerHTML=title+'<section class="sa-card"><div class="sa-actions">'+
    this.button('new','new',true)+this.button('continue','continue')+
    this.button('upload','upload')+this.button('practice','practice')+'</div>'+
    '<h2>'+t('allRequests')+'</h2>'+
    (list.length?list.map(x=>'<div class="sa-record"><span><b>'+e(x.poNo)+'</b> · '+e(x.style)+
     '<small>Revision '+e(x.revision)+'</small></span>'+this.button('open-record','open',false,x.id)+'</div>').join(''):
      '<p class="sa-note">'+t('none')+'</p>')+'</section>'+this.journey(t);
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,calc=this.E.summarize(p,this.asOf),practice=p.mode==='practice';
  const tabs=SamplingWorkspace.steps;
  this.main.innerHTML=title+'<section class="sa-card"><h2>'+e(p.header.poNo)+' · '+e(p.header.style)+
   '</h2><p class="sa-note">'+e(p.header.buyer)+' · '+e(p.header.factory)+' · '+
    (practice?t('practiceOnly'):t('saveState'))+'</p><div class="sa-actions">'+
    this.button('home','back')+this.button('save','save',true,null,practice)+
    this.button('download','download',false,null,practice)+this.button('report','report')+
    this.button('reference-export','exportRef',false,null,practice)+'</div></section>'+
   '<nav class="sa-tabs" aria-label="Sampling workflow sections">'+tabs.map(tab=>
    '<button class="sa-btn" type="button" data-action="'+tab+'" aria-current="'+(tab===this.section)+'">'+
      t(tab)+'</button>').join('')+'</nav>'+
   (calc.errors.length?'<section class="sa-card" role="alert"><h2>Please review source records</h2><ul>'+
      calc.errors.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul></section>':'')+
   this.panel(this.section,p,calc);
  this.shell?.setSavedState(this.dirty?'unsaved':'saved');
 }
 button(action,label,primary=false,id=null,disabled=false){
  return '<button class="sa-btn'+(primary?' primary':'')+'" type="button" data-action="'+
   this.escape(action)+'"'+(id?' data-id="'+this.escape(id)+'"':'')+
   (disabled?' disabled':'')+'>'+this.escape(this.t(label))+'</button>';
 }
 table(head,rows){
  const e=v=>this.escape(v??this.t('needs'));
  return '<div class="sa-scroll"><table class="sa-table"><thead><tr>'+
   head.map(x=>'<th>'+e(x)+'</th>').join('')+'</tr></thead><tbody>'+
   rows.map(row=>'<tr>'+row.map(cell=>'<td>'+cell+'</td>').join('')+'</tr>').join('')+
   '</tbody></table></div>';
 }
 panel(section,p,calc){
  const e=x=>this.escape(x??this.t('needs')),t=k=>e(this.t(k)),mut=p.mode!=='practice',
    actions=(buttons)=>'<div class="sa-actions"><h2>'+t(section)+'</h2>'+buttons+'</div>';
  const current=id=>calc.statuses.find(x=>x.categoryId===id)||{};
  const tile=(value,label)=>'<div class="sa-tile"><strong>'+e(value)+'</strong><small>'+t(label)+'</small></div>';
  if(section==='summary'){
   return '<section class="sa-card"><div class="sa-actions"><h2>'+t('summary')+'</h2>'+
    this.button('header','edit',false,null,!mut)+
    this.button('asof','asOf')+'</div>'+
    '<div class="sa-grid">'+tile(calc.totalRequests,'categories')+tile(calc.rounds,'totalRounds')+
      tile(calc.buyerApproved,'approval')+tile(calc.stale,'stale')+
      tile(calc.overdue,'overdue')+tile(calc.unresolved,'unresolved')+'</div>'+
    '<p class="sa-note">'+t('asOf')+': '+e(this.asOf)+' · '+t('warning')+'</p>'+
    '<div class="sa-actions">'+this.button('category','addCategory',false,null,!mut)+
      this.button('round','addRound',false,null,!mut)+
      this.button('reference-file','reference',false,null,!mut)+'</div>'+
    (calc.notes.length?'<ul>'+calc.notes.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>':'')+
    '</section>';
  }
  if(section==='categories')return '<section class="sa-card">'+actions(this.button('category','addCategory',false,null,!mut))+
    this.table([this.t('categoryName'),this.t('required'),this.t('status'),
      this.t('latest'),this.t('categorySource'),this.t('buyerAuthority'),this.t('action')],
     p.categories.map(c=>[e(c.name),e(c.required?this.t('yes'):this.t('no')),
      e(this.C.status(current(c.id).status)),e(current(c.id).round),
      e(c.sourceRef),e(c.buyerAuthority),this.button('round','addRound',false,c.id,!mut)]))+
    '<p class="sa-note">'+t('warning')+'</p></section>';
  if(section==='rounds')return '<section class="sa-card">'+actions(this.button('round','addRound',false,null,!mut))+
    this.table([this.t('category'),this.t('roundNo'),this.t('physicalId'),this.t('colour'),this.t('size'),
      this.t('quantity'),this.t('due'),this.t('sentDate'),this.t('receivedDate'),this.t('action')],
     p.rounds.map(r=>[e(p.categories.find(c=>c.id===r.categoryId)?.name),e(r.round),
      e(r.physicalId),e(r.colour),e(r.size),e(r.quantity),e(r.requiredDate),e(r.sentDate),e(r.receivedDate),
      (r.sentDate?'':this.button('dispatch','dispatch',false,r.id,!mut))+
      (r.sentDate&&!r.receivedDate?this.button('receipt','receipt',false,r.id,!mut):'')+
      this.button('decision','addDecision',false,r.id,!mut)+
      this.button('revision','addRevision',false,r.id,!mut)]))+
    '<p class="sa-note">'+t('reportNotice')+'</p></section>';
  if(section==='decisions')return '<section class="sa-card">'+actions(this.button('decision','addDecision',false,null,!mut))+
    this.table([this.t('physicalId'),this.t('decisionStatus'),this.t('decisionParty'),
      this.t('actor'),this.t('decisionDate'),this.t('comments'),this.t('decisionEvidence')],
     p.decisions.map(d=>[e(p.rounds.find(r=>r.id===d.roundId)?.physicalId),e(d.status),
      e(d.party),e(d.actor),e(d.date),e(d.comments),e(d.evidence)]))+
    '<p class="sa-note">'+t('warning')+'</p></section>';
  if(section==='revisions')return '<section class="sa-card">'+actions(this.button('revision','addRevision',false,null,!mut))+
    this.table([this.t('revisionFrom'),this.t('revisionBy'),this.t('revisionDate'),
      this.t('revisionReason'),this.t('revisionEvidence'),this.t('nextRound')],
     p.revisionRequests.map(v=>[e(p.rounds.find(r=>r.id===v.fromRoundId)?.physicalId),e(v.requestedBy),
      e(v.date),e(v.reason),e(v.evidence),e(p.rounds.find(r=>r.id===v.nextRoundId)?.physicalId)]))+'</section>';
  if(section==='exceptions')return '<section class="sa-card">'+actions('')+
   this.table([this.t('category'),this.t('status'),this.t('requiredFlag'),this.t('overdue'),
      this.t('stale'),this.t('due'),this.t('evidence')],
    calc.statuses.map(s=>[e(s.category),e(this.C.status(s.status)),
      e(s.required?this.t('yes'):this.t('no')),
      e(s.overdue===null?this.t('needs'):s.overdue?this.t('yes'):this.t('no')),
      e(s.stale?this.t('yes'):this.t('no')),e(s.requiredDate),e(s.issue)]))+
   '<p class="sa-note">'+t('noCalendar')+'</p></section>';
  if(section==='reports')return '<section class="sa-card"><div class="sa-actions">'+
   this.button('excel','excel',true)+this.button('print','print')+
   this.button('reference-export','exportRef',false,null,!mut)+'</div>'+
   this.R.html(p,calc)+'</section>';
  return '<section class="sa-card">'+t('none')+'</section>';
 }
 form(kind,id){
  const p=this.current,t=k=>this.t(k),e=k=>this.escape(k);
  const opener='<form class="sa-form" data-form="'+e(kind)+'">'+
   '<input type="hidden" name="target" value="'+e(id||'')+'">';
  const closer='<div class="wide sa-actions"><button class="sa-btn primary" type="submit">'+
   e(t('save'))+'</button></div></form>';
  let content='',title=t(kind),data={};
  const choice=(name,items,v='',wide=false)=>this.choice(name,items,v,wide);
  if(kind==='new'||kind==='header'){
   data=kind==='header'?p.header:{};
   content=this.field('buyer',data.buyer,'text','required maxlength="130"')+
    this.field('poNo',data.poNo,'text','required maxlength="100"')+
    this.field('style',data.style,'text','required maxlength="100"')+
    this.field('factory',data.factory,'text','required maxlength="130"')+
    this.field('requirementsSource',data.requirementsSource,'text','required maxlength="180"',true)+
    this.field('currentTechRevision',data.currentTechRevision,'text','maxlength="100"')+
    this.field('currentTechSource',data.currentTechSource,'text','maxlength="180"')+
    this.field('currentArtworkRevision',data.currentArtworkRevision,'text','maxlength="100"')+
    this.field('currentArtworkSource',data.currentArtworkSource,'text','maxlength="180"',true);
  }else if(kind==='category'){
   content=this.field('categoryName','','text','required maxlength="100"')+
    this.field('categorySource','','text','required maxlength="180"')+
    this.field('buyerAuthority','','text','required maxlength="140"')+
    this.check('requiredFlag',false);
  }else if(kind==='round'){
   if(!p?.categories?.length)throw Error('Enter buyer-defined category first.');
   const active=p.categories.find(c=>c.id===id)||p.categories[0];
   const previous=p.rounds.filter(r=>r.categoryId===active.id);
   const next=previous.length?Math.max(...previous.map(r=>r.round))+1:1;
   content=choice('category',p.categories.map(c=>[c.id,c.name]),active.id)+
    this.field('roundNo',next,'number','required min="1" step="1" max="1000"')+
    this.field('physicalId','','text','required maxlength="120"')+
    this.field('colour','','text','required maxlength="90"')+
    this.field('size','','text','required maxlength="70"')+
    this.field('quantity','','number','required min="1" step="1"')+
    this.field('requestDate','','date','required')+
    this.field('requiredDate','','date')+
    choice('calendarBasis',[['','Choose only if buyer defines date basis'],
       ['calendar','Calendar days'],['business','Business-day plan (source only)']],'')+
    this.field('calendarSource','','text','maxlength="180"')+
    this.field('techRevision',p.header.currentTechRevision,'text','maxlength="100"')+
    this.field('techSource',p.header.currentTechSource,'text','maxlength="180"')+
    this.field('artworkRevision',p.header.currentArtworkRevision,'text','maxlength="100"')+
    this.field('artworkSource',p.header.currentArtworkSource,'text','maxlength="180"');
  }else if(kind==='dispatch'||kind==='receipt'){
   const r=p?.rounds?.find(r=>r.id===id);
   if(!r)throw Error('Select an existing submitted sample.');
   if(kind==='dispatch'&&r.sentDate)throw Error('Existing dispatch evidence must not be silently overwritten.');
   if(kind==='receipt'&&(!r.sentDate||r.receivedDate))
    throw Error('Record dispatch first; do not overwrite an existing buyer receipt.');
   content='<p class="wide sa-note">'+e(r.physicalId)+' · Round '+e(r.round)+'</p>'+
    this.field(kind==='dispatch'?'sentDate':'receivedDate','','date','required')+
    this.field(kind==='dispatch'?'dispatchSource':'receiptSource','','text',
      'required maxlength="180"',true);
  }else if(kind==='decision'){
   if(!p?.rounds?.length)throw Error('Create a sample round before recording buyer comments.');
   content=choice('physicalId',p.rounds.map(r=>[r.id,
    (p.categories.find(c=>c.id===r.categoryId)?.name||'?')+' / R'+r.round+' / '+r.physicalId]),id||p.rounds.at(-1).id,true)+
    choice('decisionStatus',[['needs-information','Needs Information'],['commented','Commented'],
      ['rejected','Rejected'],['approved','Approved with written evidence']],'needs-information')+
    choice('decisionParty',[['buyer','Buyer (source required)'],['factory','Factory'],
      ['technical','Technical team']],'buyer')+
    this.field('actor','','text','required maxlength="130"')+
    this.field('decisionDate','','date','required')+
    this.field('authority','','text','required maxlength="180"')+
    this.field('decisionEvidence','','text','required maxlength="180"')+
    this.field('fileRef','','text','maxlength="170"')+
    this.note('comments');
  }else if(kind==='revision'){
   if(!p?.rounds?.length)throw Error('Create a sample round before requesting revision.');
   content=choice('revisionFrom',p.rounds.map(r=>[r.id,r.physicalId+' / R'+r.round]),
     id||p.rounds.at(-1).id)+
    this.field('revisionReason','','text','required maxlength="240"')+
    this.field('revisionBy','','text','required maxlength="130"')+
    this.field('revisionDate','','date','required')+
    this.field('revisionEvidence','','text','required maxlength="180"')+
    choice('nextRound',[['','Not resubmitted yet'],
      ...p.rounds.map(r=>[r.id,r.physicalId+' / R'+r.round])],'');
  }else if(kind==='asof'){content=this.field('asOf',this.asOf,'date','required');}
  else if(kind==='reference-select'){
   content='<p class="wide sa-note">'+e(t('sourceNotice'))+'</p>'+
    choice('sourceType',[['po','Purchase Order'],['tech','Tech Pack'],['artwork','Label & Artwork']],'tech');
  }else if(kind==='ref-confirm'){
   if(!this.pendingRef)throw Error('Select reviewed reference file first.');
   content='<p class="wide sa-alert">'+e(t('sourceNotice'))+'</p>'+
    '<p class="wide">'+e(this.pendingRef.sourceApp)+' · '+e(this.pendingRef.recordId)+
     ' · '+e(this.pendingRef.revisionId)+'</p>'+
    this.field('reviewer','','text','required maxlength="130"')+
    this.field('reviewDate','','date','required')+this.check('reviewed',false);
  }else if(kind==='reference-export'){
   content='<p class="wide sa-alert">'+e(t('exported'))+'</p>'+
    this.field('reviewer','','text','required maxlength="130"')+
    this.field('reviewDate','','date','required')+this.check('reviewed',false);
  }else throw Error('Unknown sampling form.');
  this.popup(title,opener+content+closer);
 }
 submit(form){
  const fields=Object.fromEntries(new FormData(form).entries()),
   get=k=>this.E.text(fields[k]),yes=k=>form.querySelector('[name="'+k+'"]')?.checked===true,
   kind=form.dataset.form,id=get('target');
  try{
   if(kind==='asof'){
    if(!this.E.date(get('asOf')))throw Error('Choose a valid as-of date.');
    this.asOf=get('asOf');this.dialog.close();this.render();return;
   }
   if(kind==='reference-select'){
    this.refTarget=get('sourceType');this.dialog.close();this.referenceFile.click();return;
   }
   if(kind==='new'){
    const p=this.E.create({buyer:get('buyer'),poNo:get('poNo'),style:get('style'),factory:get('factory'),
     requirementsSource:get('requirementsSource'),currentTechRevision:get('currentTechRevision'),
     currentTechSource:get('currentTechSource'),currentArtworkRevision:get('currentArtworkRevision'),
     currentArtworkSource:get('currentArtworkSource')});
    this.S.validate(p);this.store.save(p);this.current=p;this.section='categories';this.dirty=false;
   }else if(kind==='header'){
    this.mutate('Source revisions and buyer request details updated',p=>{
     Object.assign(p.header,{buyer:get('buyer'),poNo:get('poNo'),style:get('style'),
      factory:get('factory'),requirementsSource:get('requirementsSource'),
      currentTechRevision:get('currentTechRevision'),currentTechSource:get('currentTechSource'),
      currentArtworkRevision:get('currentArtworkRevision'),currentArtworkSource:get('currentArtworkSource')});
    });
   }else if(kind==='category'){
    this.mutate('Buyer-defined sample requirement added with source',p=>{
     p.categories.push({id:this.E.id('CAT'),name:get('categoryName'),sourceRef:get('categorySource'),
       buyerAuthority:get('buyerAuthority'),required:yes('requiredFlag')});
    });
   }else if(kind==='round'){
    this.mutate('Physical sample round registered without inferred approval',p=>{
     p.rounds.push({id:this.E.id('ROUND'),categoryId:get('category'),round:Number(get('roundNo')),
      physicalId:get('physicalId'),colour:get('colour'),size:get('size'),
      quantity:Number(get('quantity')),requestDate:get('requestDate'),
      requiredDate:get('requiredDate'),calendarBasis:get('calendarBasis'),
      calendarSource:get('calendarSource'),sentDate:'',dispatchSource:'',receivedDate:'',
      receiptSource:'',techRevision:get('techRevision'),techSource:get('techSource'),
      artworkRevision:get('artworkRevision'),artworkSource:get('artworkSource')});
    });
   }else if(kind==='dispatch'||kind==='receipt'){
    this.mutate(kind==='dispatch'?'Evidence-backed sample dispatch recorded':'Evidence-backed buyer sample receipt recorded',p=>{
     const r=p.rounds.find(x=>x.id===id);if(!r)throw Error('Round missing.');
     if(kind==='dispatch'){
      if(r.sentDate)throw Error('Dispatch already recorded; historical evidence may not be overwritten.');
      r.sentDate=get('sentDate');r.dispatchSource=get('dispatchSource');
     }else{
      if(!r.sentDate||r.receivedDate)throw Error('Buyer receipt must follow dispatch and cannot be overwritten.');
      r.receivedDate=get('receivedDate');r.receiptSource=get('receiptSource');
     }
    });
   }else if(kind==='decision'){
    this.mutate('Explicit source-backed decision/comment appended',p=>{
     p.decisions.push({id:this.E.id('DEC'),roundId:get('physicalId'),status:get('decisionStatus'),
       party:get('decisionParty'),actor:get('actor'),date:get('decisionDate'),
       authority:get('authority'),evidence:get('decisionEvidence'),
       comments:get('comments'),fileRef:get('fileRef')});
    });
   }else if(kind==='revision'){
    this.mutate('Historical sample revision request appended',p=>{
     p.revisionRequests.push({id:this.E.id('REQREV'),fromRoundId:get('revisionFrom'),
      reason:get('revisionReason'),requestedBy:get('revisionBy'),
      date:get('revisionDate'),evidence:get('revisionEvidence'),nextRoundId:get('nextRound')});
    });
   }else if(kind==='ref-confirm'){
    if(!this.pendingRef||!yes('reviewed')||!get('reviewer')||!this.E.date(get('reviewDate')))
     throw Error('Explicit local reviewer, date and checked source evidence required.');
    const ref=this.E.copy(this.pendingRef),target=this.refTarget;
    ref.localReview={verifiedBy:get('reviewer'),verifiedAt:get('reviewDate')};
    if(!this.E.referenceValid(ref))throw Error('Reference source and reviewer are incomplete.');
    this.mutate('Explicit immutable '+target+' reference attached from manually reviewed file',p=>{
     const names={po:'poReference',tech:'techReference',artwork:'artworkReference'};
     if(!names[target])throw Error('Unknown reference type.');
     p.header[names[target]]=ref;
    });
    this.pendingRef=null;this.refTarget='';
   }else if(kind==='reference-export'){
    const review={verifiedBy:get('reviewer'),verifiedAt:get('reviewDate'),checked:yes('reviewed')};
    const reference=this.E.reviewedReference(this.current,review,this.asOf);
    this.download(JSON.stringify(reference,null,2),
     'VESA-SAMPLING-REVIEWED-'+reference.recordId+'-'+reference.revisionId+'.json','application/json');
    this.dialog.close();return;
   }
   this.dialog.close();this.render();
  }catch(error){
   let box=form.querySelector('[role=alert]');
   if(!box){box=document.createElement('p');box.className='sa-alert wide';
    box.setAttribute('role','alert');form.prepend(box);}
   box.textContent=error.message;
  }
 }
 excel(){
  if(!this.current)throw Error('Open a sampling request.');
  const XLSX=root.XLSX;
  if(!XLSX?.utils?.book_new)throw Error('Local Excel library unavailable.');
  const p=this.current,calc=this.E.summarize(p,this.asOf),sheets=this.R.rows(p,calc);
  const book=XLSX.utils.book_new();
  for(const [name,rows] of Object.entries(sheets)){
   const matrix=this.R.excelRows(name,rows),sheet=XLSX.utils.aoa_to_sheet(matrix);
   sheet['!cols']=rows[0].map(()=>({wch:28}));
   XLSX.utils.book_append_sheet(book,sheet,name.slice(0,31));
  }
  const data=XLSX.write(book,{bookType:'xlsx',type:'array',compression:true});
  this.download(new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
   'VESA-SAMPLING-'+p.id+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 }
}
root.VesaSamplingWorkspace=SamplingWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
