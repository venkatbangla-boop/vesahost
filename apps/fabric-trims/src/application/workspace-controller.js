/* Fabric & Trims 360 local workflow controller. Domain and reports remain pure.
 * VESA shared workspace shell owns global menu, logo, Settings and account state.
 */
(function(root){
'use strict';
class FabricWorkspace{
 // One app controller owns the nine read-only task links; material source rules remain independent.
 static steps=Object.freeze([
  ['summary','openShortages'],['materials','totalItems'],['requirements','demand'],
  ['bookings','addBooking'],['receipts','qaReview'],['allocations','allocationQty'],
  ['reservations','reservationQty'],['exceptions','openShortages'],['reports','report']
 ]);
 constructor(){
  this.main=document.getElementById('ftMain');
  this.dialog=document.getElementById('ftDialog');
  this.body=document.getElementById('ftDialogBody');
  this.copyFile=document.getElementById('ftFile');
  this.referenceFile=document.getElementById('ftReferenceFile');
  this.E=root.VesaFabricEngine;this.S=root.VesaFabricStore;
  this.R=root.VesaFabricReports;this.C=root.VesaFabricCopy;
  this.current=null;this.section='summary';this.dirty=false;this.shell=null;
  this.asOf=new Date().toISOString().slice(0,10);
  this.focus=null;this.refTarget='';this.pendingRef=null;
  const session=root.VesaAuth?.session?.()||{};
  this.store=new this.S(String(session.email||'local-browser-user'));
 }
 t(k){return this.C.t(k);}
 esc(k){return this.R.htmlSafe(k);}
 input(name,value='',type='text',attrs='',wide=false){
  return '<label class="'+(wide?'wide':'')+'"><span>'+this.esc(this.t(name))+'</span>'+
   '<input name="'+this.esc(name)+'" type="'+this.esc(type)+'" value="'+this.esc(value??'')+
   '" '+attrs+'></label>';
 }
 select(name,options,value='',wide=false){
  return '<label class="'+(wide?'wide':'')+'"><span>'+this.esc(this.t(name))+'</span><select name="'+this.esc(name)+'">'+
   options.map(([key,label])=>'<option value="'+this.esc(key)+'"'+(String(key)===String(value)?' selected':'')+'>'+
   this.esc(label)+'</option>').join('')+'</select></label>';
 }
 note(name,value=''){
  return '<label class="wide"><span>'+this.esc(this.t(name))+'</span>'+
   '<textarea name="'+this.esc(name)+'" maxlength="440">'+this.esc(value)+'</textarea></label>';
 }
 check(name,on=false){
  return '<label class="wide ft-check"><input type="checkbox" name="'+this.esc(name)+'"'+
    (on?' checked':'')+'><span>'+this.esc(this.t(name))+'</span></label>';
 }
 popup(title,body){
  this.focus=document.activeElement;document.getElementById('ftDialogTitle').textContent=title;
  this.body.innerHTML=body;if(!this.dialog.open)this.dialog.showModal();
  this.dialog.addEventListener('close',()=>this.focus?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,button')?.focus?.();
 }
 error(text){this.popup('Please review','<p role="alert" class="ft-alert">'+this.esc(text)+'</p>');}
 start(){
  const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell){this.main.textContent='VESA shared workspace unavailable.';return;}
  const session=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,
   descriptor:{id:'fabric-trims',name:'VESA Fabric & Trims 360',route:'/apps/fabric-trims/',
     contentTarget:'#ftMain',userLabel:session.name||session.email||'',userRole:session.role||'',
     savedState:'Unsaved changes'},callbacks:{menu:name=>this.menu(name)}});
  this.shell.mount();
  document.getElementById('ftClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',e=>{
   const btn=e.target.closest('[data-action]');if(!btn)return;
   e.preventDefault();this.action(btn.dataset.action,btn.dataset.id);
  });
  this.dialog.addEventListener('submit',e=>{
   const form=e.target.closest('form[data-form]');if(!form)return;
   e.preventDefault();this.submit(form);
  });
  this.copyFile.addEventListener('change',async()=>{
   const file=this.copyFile.files?.[0];this.copyFile.value='';if(!file)return;
   try{
    if(file.size>2097152)throw Error('Saved material copy exceeds safe size.');
    const p=this.S.decode(await file.text());
    if(this.store.load(p.id)){p.id=this.E.id('MAT-COPY');
     p.audit.push({at:new Date().toISOString(),revision:p.revision,action:'Material saved copy imported separately'});}
    p.mode='local';this.store.save(p);this.current=p;this.section='summary';this.dirty=false;
    this.render();this.popup(this.t('upload'),'<p>Saved copy opened separately. Existing receipt and allocation history remains unchanged.</p>');
   }catch(error){this.error(error.message);}
  });
  this.referenceFile.addEventListener('change',async()=>{
   const file=this.referenceFile.files?.[0];this.referenceFile.value='';if(!file)return;
   try{
    if(!this.current||this.current.mode!=='local')throw Error('Open a real local material register.');
    if(file.size>200000)throw Error('Reviewed source file exceeds safe size.');
    const ref=JSON.parse(await file.text());
    if(!this.E.validRef(ref))throw Error('Reference needs a reviewed source and immutable revision.');
    if(this.refTarget==='tech'&&!/tech/i.test(ref.sourceApp))
      throw Error('Tech specification requires its own Tech Pack source reference.');
    if(this.refTarget==='po'&&!/purchase order/i.test(ref.sourceApp))
      throw Error('PO must be linked to a Purchase Order reference.');
    this.pendingRef=this.E.copy(ref);this.form('ref-confirm');
   }catch(e){this.error(e.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.addEventListener('beforeunload',e=>{if(this.dirty&&this.current?.mode==='local'){
    e.preventDefault();e.returnValue='';}});
  this.render();
 }
 menu(name){
  const groups={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
   File:[['save','save'],['download','download'],['upload','upload'],['open','open']],
   Edit:[['header','header'],['item','addItem'],['requirement','addRequirement'],
     ['booking','addBooking'],['receipt','addReceipt']],
   View:[['summary','summary'],['materials','materials'],['requirements','requirements'],
     ['receipts','receipts'],['exceptions','exceptions']],
   Tools:[['report','report'],['allocation','addAllocation'],['reservation','addReservation'],
     ['reference-select','reference'],['reference-export','exportRef'],['asof','asOf']],
   Help:[['help','help'],['practice','practice']]};
  this.popup(name,'<div class="ft-actions">'+(groups[name]||[]).map(([action,label])=>
   '<button class="ft-btn" type="button" data-dialog-action="'+this.esc(action)+'">'+
    this.esc(this.t(label))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-dialog-action]').forEach(btn=>btn.onclick=()=>{
    this.dialog.close();this.action(btn.dataset.dialogAction);});
 }
 action(action,id){
  try{
   if(action==='home'||action==='open'){
    this.current=null;this.section='summary';this.dirty=false;this.render();return;
   }
   if(action==='preview'){
     if(this.current||!FabricWorkspace.steps.some(([step])=>step===id))throw Error('Return to All Registers for practice.');
     this.current=this.E.sample();this.section=id;this.dirty=false;this.render();return;
    }
    if(action==='new'){this.form('new');return;}
   if(action==='practice'){
    this.current=this.E.sample();this.section='summary';this.dirty=false;this.render();return;
   }
   if(action==='continue'){
    const list=this.store.list();if(!list.length)throw Error('No material register saved on this device.');
    this.action('open-record',list[0].id);return;
   }
   if(action==='open-record'){
    const p=this.store.load(id);if(!p)throw Error('Saved material register not found.');
    this.current=p;this.section='summary';this.dirty=false;this.render();return;
   }
   if(action==='upload'){this.copyFile.click();return;}
   if(action==='download'){
    if(!this.current||this.current.mode==='practice')throw Error('Open a real material register.');
    this.download(this.S.encode(this.current),'VESA-MATERIAL-'+this.current.id+'.vesafabric','application/json');return;
   }
   if(action==='save'){
    if(!this.current||this.current.mode==='practice')throw Error('Practice example cannot be saved as real data.');
    this.store.save(this.current);this.dirty=false;this.render();return;
   }
   if(['summary','materials','requirements','bookings','receipts','allocations','reservations','exceptions','reports'].includes(action)){
    if(!this.current)throw Error('Create/open a material register.');
    this.section=action;this.render();return;
   }
   if(action==='report'){if(!this.current)throw Error('Create/open a material register.');
    this.section='reports';this.render();return;}
   if(action==='excel'){this.excel();return;}
   if(action==='print'){if(!this.current)throw Error('Open a material register.');
    this.section='reports';this.render();root.print();return;}
   if(action==='reference-select'){this.form('reference-select');return;}
   if(action==='help'){
    this.popup(this.t('help'),'<p class="ft-alert">'+this.esc(this.t('notice'))+'</p>'+
     '<p>'+this.esc(this.t('warning'))+'</p><p>'+this.esc(this.t('reportNotice'))+'</p>');return;
   }
   if(['header','item','requirement','booking','receipt','qa-review','allocation','reservation',
     'asof','reference-export'].includes(action)){this.form(action,id);return;}
  }catch(e){this.error(e.message);}
 }
 mutate(label,change){
  if(!this.current||this.current.mode!=='local')throw Error('Practice example is read-only.');
  const copy=this.E.copy(this.current);change(copy);copy.revision++;
  copy.updatedAt=new Date().toISOString();copy.audit.push({action:label,revision:copy.revision,at:copy.updatedAt});
  this.S.validate(copy);this.store.save(copy);this.current=copy;this.dirty=false;this.render();
 }
 download(data,name,mime){
  const blob=data instanceof Blob?data:new Blob([data],{type:mime});
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
 }
 button(action,label,primary=false,id=null,disabled=false){
  return '<button type="button" class="ft-btn'+(primary?' primary':'')+
    '" data-action="'+this.esc(action)+'"'+(id?' data-id="'+this.esc(id)+'"':'')+
    (disabled?' disabled':'')+'>'+this.esc(this.t(label))+'</button>';
 }
 table(headers,rows){
  const e=v=>this.esc(v??this.t('needs'));
  return '<div class="ft-scroll"><table class="ft-table"><thead><tr>'+
    headers.map(x=>'<th>'+e(x)+'</th>').join('')+'</tr></thead><tbody>'+
    rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+
    '</tbody></table></div>';
 }
 journey(t){
  const cards=FabricWorkspace.steps.map(([step,hint],index)=>
   '<article class="ft-journey-card"><span class="ft-journey-step">'+String(index+1).padStart(2,'0')+
   '</span><h3>'+t(step)+'</h3><p>'+t(hint)+'</p>'+
   '<button type="button" class="ft-btn" data-action="preview" data-id="'+this.esc(step)+
   '" aria-label="'+t('journeyOpen')+' · '+t(step)+'">'+t('journeyOpen')+'</button></article>');
  return '<section class="ft-card" aria-labelledby="ftJourneyTitle"><h2 id="ftJourneyTitle">'+t('journeyTitle')+
   '</h2><p class="ft-note">'+t('journeyLead')+'</p><div class="ft-journey">'+cards.join('')+'</div></section>';
 }
 render(){
  const e=x=>this.esc(x),t=k=>e(this.t(k));
  const heading='<section class="ft-card"><h1>'+t('title')+'</h1><p class="ft-note">'+t('lead')+
    '</p><p class="ft-alert">'+t('notice')+'</p></section>';
  if(!this.current){
   const records=this.store.list();
   this.main.innerHTML=heading+'<section class="ft-card"><div class="ft-actions">'+
    this.button('new','new',true)+this.button('continue','continue')+
    this.button('upload','upload')+this.button('practice','practice')+'</div>'+
    '<h2>'+t('open')+'</h2>'+
    (records.length?records.map(r=>'<div class="ft-record"><span><b>'+e(r.poNo)+'</b> · '+e(r.style)+
     '<small>Revision '+e(r.revision)+'</small></span>'+this.button('open-record','open',false,r.id)+'</div>').join(''):
      '<p class="ft-note">'+t('none')+'</p>')+'</section>'+this.journey(t);
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,x=this.E.calculate(p,this.asOf),practice=p.mode==='practice';
  const sections=FabricWorkspace.steps.map(([step])=>step);
  this.main.innerHTML=heading+'<section class="ft-card"><h2>'+e(p.header.poNo)+' · '+e(p.header.style)+
    '</h2><p class="ft-note">'+e(p.header.buyer)+' · '+e(p.header.factory)+' · '+
      (practice?'SYNTHETIC PRACTICE':t('save'))+'</p><div class="ft-actions">'+
    this.button('home','back')+this.button('save','save',true,null,practice)+
    this.button('download','download',false,null,practice)+this.button('report','report')+
    this.button('reference-export','exportRef',false,null,practice)+'</div></section>'+
    '<nav class="ft-tabs" aria-label="Material workflow sections">'+sections.map(tab=>
     '<button class="ft-btn" data-action="'+tab+'" type="button" aria-current="'+(tab===this.section)+'">'+
       t(tab)+'</button>').join('')+'</nav>'+
    (x.errors.length?'<section class="ft-card" role="alert"><h2>Source discrepancy</h2><ul>'+
      x.errors.map(s=>'<li>'+e(s)+'</li>').join('')+'</ul></section>':'')+
    this.panel(this.section,p,x);
  this.shell?.setSavedState(this.dirty?'unsaved':'saved');
 }
 panel(section,p,x){
  const e=v=>this.esc(v??this.t('needs')),t=k=>e(this.t(k)),mut=p.mode==='local',
    title=(label,button)=>'<div class="ft-actions"><h2>'+t(label)+'</h2>'+button+'</div>',
    tile=(v,label)=>'<div class="ft-tile"><strong>'+e(v)+'</strong><small>'+t(label)+'</small></div>';
  if(section==='summary'){
   return '<section class="ft-card">'+title('summary',this.button('header','edit',false,null,!mut))+
    '<div class="ft-grid">'+tile(p.items.length,'totalItems')+
    tile(p.requirements.length,'demand')+tile(p.bookings.length,'bookings')+
    tile(p.receipts.length,'receipts')+tile(x.outstanding,'openShortages')+
    tile(x.missingQA,'unapproved')+'</div>'+
    '<p class="ft-note">'+t('warning')+'</p>'+
    '<div class="ft-actions">'+this.button('item','addItem',false,null,!mut)+
      this.button('requirement','addRequirement',false,null,!mut)+
      this.button('booking','addBooking',false,null,!mut)+
      this.button('reference-select','reference',false,null,!mut)+'</div>'+
    (x.notes.length?'<ul>'+x.notes.map(s=>'<li>'+e(s)+'</li>').join('')+'</ul>':'')+
    '</section>';
  }
  if(section==='materials')return '<section class="ft-card">'+title('materials',
    this.button('item','addItem',false,null,!mut))+
    this.table([this.t('description'),this.t('kind'),this.t('unit'),this.t('composition'),
     this.t('gsm'),this.t('width'),this.t('sourceRef')],p.items.map(item=>[
      e(item.description),e(item.kind),e(item.unit),e(item.composition),
      e(item.gsm),e(item.width?item.width+' '+item.widthUnit:null),e(item.sourceRef)]))+'</section>';
  if(section==='requirements')return '<section class="ft-card">'+title('requirements',
    this.button('requirement','addRequirement',false,null,!mut))+
    this.table([this.t('item'),this.t('colour'),this.t('size'),this.t('approvedRequired'),
      this.t('demand'),this.t('openShortages'),this.t('status'),this.t('sourceRef')],
     x.requirementsStatus.map(req=>[e(p.items.find(a=>a.id===req.itemId)?.description),
      e(req.colour),e(req.size),e(req.approved),e(req.consumptionEstimate),
      e(req.shortage),e(req.readiness),e(req.source)]))+
    '<p class="ft-note">'+t('reportNotice')+'</p></section>';
  if(section==='bookings')return '<section class="ft-card">'+title('bookings',
    this.button('booking','addBooking',false,null,!mut))+
    this.table([this.t('item'),this.t('supplier'),this.t('bookingRef'),this.t('orderedQty'),
     this.t('unit'),this.t('committedDate'),this.t('lot'),this.t('shade'),this.t('sourceRef')],
    p.bookings.map(book=>[e(p.items.find(a=>a.id===book.itemId)?.description),
      e(book.supplier),e(book.bookingRef),e(book.orderedQty),e(book.unit),e(book.committedDate),
      e(book.lot),e(book.shade),e(book.sourceRef)]))+'</section>';
  if(section==='receipts')return '<section class="ft-card">'+title('receipts',
    this.button('receipt','addReceipt',false,null,!mut))+
    this.table([this.t('receiptRef'),this.t('qty'),this.t('rejected'),this.t('lot'),
     this.t('shade'),this.t('qaStatus'),this.t('netAvailable'),this.t('sourceRef'),this.t('qaReview')],
    p.receipts.map(rec=>{
     const status=x.receiptBalances.find(q=>q.receiptId===rec.id)||{};
     return [e(rec.receiptRef),e(rec.qty),e(rec.rejected),e(rec.lot),e(rec.shade),
      e(rec.qaStatus),e(status.netAvailable),e(rec.sourceRef),
      rec.qaStatus==='pending'?this.button('qa-review','qaReview',false,rec.id,!mut):'Review history retained'];
    }))+'</section>';
  if(section==='allocations')return '<section class="ft-card">'+title('allocations',
    this.button('allocation','addAllocation',false,null,!mut))+
    this.table([this.t('receipt'),this.t('requirement'),this.t('allocationQty'),
      this.t('unit'),this.t('date'),this.t('sourceRef')],p.allocations.map(a=>[
      e(p.receipts.find(r=>r.id===a.receiptId)?.receiptRef),
      e(p.requirements.find(r=>r.id===a.requirementId)?.colour),
      e(a.qty),e(a.unit),e(a.date),e(a.sourceRef)]))+'</section>';
  if(section==='reservations')return '<section class="ft-card">'+title('reservations',
    this.button('reservation','addReservation',false,null,!mut))+
    this.table([this.t('receipt'),this.t('otherPo'),this.t('reservationQty'),this.t('date'),
      this.t('sourceRef')],p.reservations.map(a=>[
      e(p.receipts.find(r=>r.id===a.receiptId)?.receiptRef),e(a.otherPo),e(a.qty),
      e(a.date),e(a.sourceRef)]))+'</section>';
  if(section==='exceptions')return '<section class="ft-card">'+title('exceptions','')+
    '<h3>'+t('openShortages')+'</h3>'+
    this.table([this.t('colour'),this.t('size'),this.t('approvedRequired'),
     this.t('allocationQty'),this.t('openShortages'),this.t('status')],
    x.requirementsStatus.map(r=>[e(r.colour),e(r.size),e(r.approved),e(r.confirmed),
      e(r.shortage),e(r.readiness)]))+
    '<h3>'+t('netAvailable')+'</h3>'+
    this.table([this.t('receiptRef'),this.t('lot'),this.t('shade'),this.t('netAvailable'),
     this.t('qaStatus')],x.receiptBalances.map(r=>[
      e(r.receiptRef),e(r.lot),e(r.shade),e(r.netAvailable),e(r.qaStatus)]))+
    '<h3>'+t('committedDate')+'</h3>'+
    this.table([this.t('supplier'),this.t('committedDate'),this.t('status')],
      x.deliveryExceptions.map(d=>[e(d.supplier),e(d.commit),e(d.status)]))+
    '<p class="ft-note">'+t('reportNotice')+'</p></section>';
  if(section==='reports')return '<section class="ft-card"><div class="ft-actions">'+
    this.button('excel','excel',true)+this.button('print','print')+
    this.button('reference-export','exportRef',false,null,!mut)+'</div>'+
    this.R.html(p,x)+'</section>';
  return '<section class="ft-card">'+t('none')+'</section>';
 }
 form(kind,id){
  const p=this.current,t=k=>this.t(k),e=v=>this.esc(v);
  const start='<form class="ft-form" data-form="'+e(kind)+'">'+
   '<input type="hidden" name="target" value="'+e(id||'')+'">';
  const end='<div class="wide ft-actions"><button class="ft-btn primary" type="submit">'+
    e(t('save'))+'</button></div></form>';
  let body='',heading=t(kind);
  if(kind==='new'||kind==='header'){
   const v=kind==='new'?{}:p.header;
   body=this.input('poNo',v.poNo,'text','required maxlength="100"')+
    this.input('style',v.style,'text','required maxlength="100"')+
    this.input('buyer',v.buyer,'text','required maxlength="130"')+
    this.input('factory',v.factory,'text','required maxlength="130"')+
    this.input('bomRevision',v.bomRevision,'text','required maxlength="100"')+
    this.input('bomSource',v.bomSource,'text','required maxlength="180"',true)+
    this.input('requiredDate',v.requiredDate,'date')+
    this.select('calendarBasis',[['','No buyer calendar documented'],['calendar','Calendar days'],
     ['business','Business days (no day-count until policy sourced)']],v.calendarBasis)+
    this.input('calendarSource',v.calendarSource,'text','maxlength="180"');
  }else if(kind==='item'){
   body=this.select('kind',[['','Choose documented material type'],['fabric','Fabric'],
     ['trims','Trims'],['packaging','Packaging'],['other','Other']],'')+
    this.input('description','','text','required maxlength="170"')+
    this.input('unit','','text','required maxlength="16"')+
    this.input('composition','','text','maxlength="110"')+
    this.input('gsm','','text','inputmode="decimal"')+
    this.input('width','','text','inputmode="decimal"')+
    this.select('widthUnit',[['','Select if width provided'],['in','Inches'],['cm','Centimeters']],'')+
    this.input('construction','','text','maxlength="100"')+
    this.input('sourceRef','','text','required maxlength="180"',true);
  }else if(kind==='requirement'){
   if(!p.items.length)throw Error('Enter a sourced material first.');
   body=this.select('item',p.items.map(i=>[i.id,i.description+' / '+i.unit]),p.items[0].id)+
    this.input('colour','','text','required maxlength="80"')+
    this.input('size','','text','required maxlength="70"')+
    this.input('approvedRequired','','text','required inputmode="decimal"')+
    this.input('sourceRef','','text','required maxlength="180"')+
    this.input('orderPieces','','number','min="1" step="1"')+
    this.input('consumptionPerPiece','','text','inputmode="decimal"')+
    this.input('consumptionSource','','text','maxlength="180"')+
    this.input('wastagePct','','text','inputmode="decimal"')+
    this.input('wastageSource','','text','maxlength="180"')+
    this.select('demandRounding',[['','Choose only from approved source'],
      ['down-4','Round down to 4 decimals'],['half-up-4','Nearest 4 decimals']],'')+
    this.input('targetLot','','text','maxlength="90"')+
    this.input('targetShade','','text','maxlength="90"');
  }else if(kind==='booking'){
   if(!p.items.length)throw Error('Enter material master first.');
   body=this.select('item',p.items.map(i=>[i.id,i.description+' / '+i.unit]),p.items[0].id)+
    this.input('supplier','','text','required maxlength="150"')+
    this.input('bookingRef','','text','required maxlength="180"')+
    this.input('sourceRef','','text','required maxlength="180"')+
    this.input('orderedQty','','text','required inputmode="decimal"')+
    this.input('unit',p.items[0].unit,'text','required maxlength="16"')+
    this.input('committedDate','','date')+
    this.input('actualDate','','date')+
    this.input('actualSource','','text','maxlength="180"')+
    this.input('lot','','text','maxlength="100"')+
    this.input('shade','','text','maxlength="100"')+
    this.input('conversionNumerator','','text','inputmode="decimal"')+
    this.input('conversionDenominator','','text','inputmode="decimal"')+
    this.input('conversionSource','','text','maxlength="180"')+
    this.select('conversionRounding',[['','Written unit rounding policy'],['down-4','Round down 4 decimals'],
      ['half-up-4','Nearest 4 decimals']],'');
  }else if(kind==='receipt'){
   if(!p.bookings.length)throw Error('Create supplier booking first.');
   body=this.select('bookingRef',p.bookings.map(b=>[b.id,b.bookingRef+' / '+b.unit]),id||p.bookings[0].id)+
    this.input('receiptRef','','text','required maxlength="180"')+
    this.input('date','','date','required')+
    this.input('qty','','text','required inputmode="decimal"')+
    this.input('rejected','0.0000','text','required inputmode="decimal"')+
    this.input('lot','','text','required maxlength="100"')+
    this.input('shade','','text','required maxlength="100"')+
    this.select('qaStatus',[['pending','Pending QC'],['approved','Approved from dated QA document'],
      ['rejected','Rejected from QA evidence']],'pending')+
    this.input('qaSource','','text','maxlength="180"')+
    this.input('qaActor','','text','maxlength="100"')+
    this.input('qaDate','','date')+
    this.input('sourceRef','','text','required maxlength="180"',true);
  }else if(kind==='qa-review'){
   const rc=p.receipts.find(r=>r.id===id);
   if(!rc||rc.qaStatus!=='pending')throw Error('QC review is only allowed for pending receipt.');
   body='<p class="wide ft-note">'+e(rc.receiptRef)+' · '+e(rc.lot)+' / '+e(rc.shade)+'</p>'+
    this.select('qaStatus',[['','Choose sourced QC outcome'],['approved','QA Approved'],
      ['rejected','QA Rejected']],'')+
    this.input('qaDate','','date','required')+
    this.input('qaActor','','text','required maxlength="100"')+
    this.input('qaSource','','text','required maxlength="180"',true);
  }else if(kind==='allocation'){
   if(!p.receipts.length||!p.requirements.length)
    throw Error('Allocation needs both BOM requirement and goods receipt.');
   body=this.select('receipt',p.receipts.map(r=>[r.id,r.receiptRef+' / '+r.lot+' / '+r.shade]),id||p.receipts[0].id)+
    this.select('requirement',p.requirements.map(r=>[r.id,
      (p.items.find(i=>i.id===r.itemId)?.description||'Material')+' / '+r.colour+' / '+r.size]),p.requirements[0].id)+
    this.input('allocationQty','','text','required inputmode="decimal"')+
    this.input('date','','date','required')+
    this.input('sourceRef','','text','required maxlength="180"',true);
  }else if(kind==='reservation'){
   if(!p.receipts.length)throw Error('Reserve only actually received QA-released material.');
   body=this.select('receipt',p.receipts.map(r=>[r.id,r.receiptRef+' / '+r.lot+' / '+r.shade]),id||p.receipts[0].id)+
    this.input('otherPo','','text','required maxlength="100"')+
    this.input('reservationQty','','text','required inputmode="decimal"')+
    this.input('date','','date','required')+
    this.input('sourceRef','','text','required maxlength="180"',true);
  }else if(kind==='reference-select'){
   body='<p class="wide ft-note">'+e(t('sourceNotice'))+'</p>'+
    this.select('sourceType',[['tech','Tech Pack'],['po','Purchase Order']],'tech');
  }else if(kind==='ref-confirm'){
   if(!this.pendingRef)throw Error('Choose a sourced reference first.');
   body='<p class="wide ft-alert">'+e(t('sourceNotice'))+'</p>'+
    '<p class="wide">'+e(this.pendingRef.sourceApp)+' · '+e(this.pendingRef.recordId)+' · '+e(this.pendingRef.revisionId)+'</p>'+
    this.input('reviewer','','text','required maxlength="100"')+
    this.input('reviewDate','','date','required')+this.check('reviewed',false);
  }else if(kind==='reference-export'){
   body='<p class="wide ft-alert">'+e(t('reportNotice'))+'</p>'+
    this.input('reviewer','','text','required maxlength="100"')+
    this.input('reviewDate','','date','required')+this.check('reviewed',false);
  }else if(kind==='asof'){body=this.input('asOf',this.asOf,'date','required');}
  else throw Error('Unknown material form.');
  this.popup(heading,start+body+end);
 }
 submit(form){
  const values=Object.fromEntries(new FormData(form).entries()),
   get=k=>this.E.trim(values[k]),checked=k=>form.querySelector('[name="'+k+'"]')?.checked===true,
   kind=form.dataset.form,id=get('target');
  try{
   if(kind==='asof'){if(!this.E.date(get('asOf')))throw Error('Choose a valid calendar date.');
    this.asOf=get('asOf');this.dialog.close();this.render();return;}
   if(kind==='reference-select'){
    this.refTarget=get('sourceType');this.dialog.close();this.referenceFile.click();return;
   }
   if(kind==='new'){
    const p=this.E.create(Object.fromEntries(['poNo','style','buyer','factory','bomRevision',
     'bomSource','requiredDate','calendarBasis','calendarSource'].map(k=>[k,get(k)])));
    this.S.validate(p);this.store.save(p);this.current=p;this.section='materials';this.dirty=false;
   }else if(kind==='header'){
    this.mutate('Approved BOM reference changed; existing bookings and receipts preserved',p=>{
     Object.assign(p.header,Object.fromEntries(['poNo','style','buyer','factory',
      'bomRevision','bomSource','requiredDate','calendarBasis','calendarSource'].map(k=>[k,get(k)])));
    });
   }else if(kind==='item'){
    this.mutate('Sourced material master item added',p=>{
     p.items.push({id:this.E.id('ITEM'),kind:get('kind'),description:get('description'),
      composition:get('composition'),gsm:get('gsm'),width:get('width'),widthUnit:get('widthUnit'),
      construction:get('construction'),unit:get('unit'),sourceRef:get('sourceRef')});
    });
   }else if(kind==='requirement'){
    this.mutate('Signed BOM material requirement recorded',p=>{
     const item=p.items.find(i=>i.id===get('item'));
     if(!item)throw Error('Choose the material whose purchase unit is documented.');
     p.requirements.push({id:this.E.id('REQ'),itemId:item.id,colour:get('colour'),size:get('size'),
      unit:item.unit,bomRevision:p.header.bomRevision,approvedRequired:get('approvedRequired'),
      sourceRef:get('sourceRef'),orderPieces:get('orderPieces')?Number(get('orderPieces')):null,
      consumptionPerPiece:get('consumptionPerPiece'),consumptionSource:get('consumptionSource'),
      wastagePct:get('wastagePct'),wastageSource:get('wastageSource'),
      demandRounding:get('demandRounding'),targetLot:get('targetLot'),targetShade:get('targetShade')});
    });
   }else if(kind==='booking'){
    this.mutate('Sourced supplier booking recorded',p=>{
     const item=p.items.find(i=>i.id===get('item'));if(!item)throw Error('Material reference missing.');
     const conversion=(get('unit')!==item.unit&&get('conversionNumerator')&&get('conversionDenominator'))?
      {fromUnit:get('unit'),toUnit:item.unit,numerator:get('conversionNumerator'),
       denominator:get('conversionDenominator'),sourceRef:get('conversionSource'),
       rounding:get('conversionRounding')}:null;
     p.bookings.push({id:this.E.id('BOOK'),itemId:item.id,supplier:get('supplier'),
      bookingRef:get('bookingRef'),sourceRef:get('sourceRef'),unit:get('unit'),
      orderedQty:get('orderedQty'),committedDate:get('committedDate'),
      actualDate:get('actualDate'),actualSource:get('actualSource'),
      lot:get('lot'),shade:get('shade'),conversion});
    });
   }else if(kind==='receipt'){
    this.mutate('Goods receipt entered with independent QC status',p=>{
     const book=p.bookings.find(b=>b.id===get('bookingRef'));
     if(!book)throw Error('Choose documented supplier booking.');
     p.receipts.push({id:this.E.id('GRN'),bookingId:book.id,receiptRef:get('receiptRef'),
      date:get('date'),qty:get('qty'),rejected:get('rejected'),unit:book.unit,
      lot:get('lot'),shade:get('shade'),qaStatus:get('qaStatus'),qaSource:get('qaSource'),
      qaActor:get('qaActor'),qaDate:get('qaDate'),sourceRef:get('sourceRef')});
    });
   }else if(kind==='qa-review'){
    this.mutate('Separate dated QA review recorded without erasing prior receipt',p=>{
     const rc=p.receipts.find(r=>r.id===id);
     if(!rc||rc.qaStatus!=='pending')throw Error('Only pending receipt may receive first QA source review.');
     if(!['approved','rejected'].includes(get('qaStatus')))
      throw Error('Choose documented QA approval or rejection.');
     p.audit.push({at:new Date().toISOString(),receiptId:rc.id,
      priorQA:{status:rc.qaStatus,source:rc.qaSource,actor:rc.qaActor,date:rc.qaDate},
      action:'Preserved prior receipt QC state before sourced decision'});
     Object.assign(rc,{qaStatus:get('qaStatus'),qaSource:get('qaSource'),
      qaActor:get('qaActor'),qaDate:get('qaDate')});
    });
   }else if(kind==='allocation'){
    this.mutate('Receipt-specific order material allocation recorded',p=>{
     const rc=p.receipts.find(r=>r.id===get('receipt')),
      req=p.requirements.find(r=>r.id===get('requirement'));
     if(!rc||!req)throw Error('Choose receipt and BOM requirement.');
     p.allocations.push({id:this.E.id('ALLOC'),receiptId:rc.id,requirementId:req.id,
      qty:get('allocationQty'),unit:req.unit,date:get('date'),sourceRef:get('sourceRef')});
    });
   }else if(kind==='reservation'){
    this.mutate('Other-order reservation kept separate from this PO allocation',p=>{
     const rc=p.receipts.find(r=>r.id===get('receipt'));
     const book=rc&&p.bookings.find(b=>b.id===rc.bookingId);
     const item=book&&p.items.find(i=>i.id===book.itemId);
     if(!rc||!item)throw Error('Receipt/booking not found.');
     p.reservations.push({id:this.E.id('RES'),receiptId:rc.id,
      otherPo:get('otherPo'),qty:get('reservationQty'),unit:item.unit,
      date:get('date'),sourceRef:get('sourceRef')});
    });
   }else if(kind==='ref-confirm'){
    if(!this.pendingRef||!checked('reviewed')||!get('reviewer')||!this.E.date(get('reviewDate')))
     throw Error('Manual evidence review is required.');
    const ref=this.E.copy(this.pendingRef),target=this.refTarget;
    ref.localReview={verifiedBy:get('reviewer'),verifiedAt:get('reviewDate')};
    this.mutate('Reviewed immutable '+target+' material reference added',p=>{
     const field={po:'poReference',tech:'techReference'}[target];
     if(!field)throw Error('Unsupported manual source type.');p.header[field]=ref;
    });
    this.refTarget='';this.pendingRef=null;
   }else if(kind==='reference-export'){
    const ref=this.E.reviewedReference(this.current,{
     verifiedBy:get('reviewer'),verifiedAt:get('reviewDate'),checked:checked('reviewed')},this.asOf);
    this.download(JSON.stringify(ref,null,2),
     'VESA-MATERIAL-REVIEWED-'+ref.recordId+'-'+ref.revisionId+'.json','application/json');
    this.dialog.close();return;
   }
   this.dialog.close();this.render();
  }catch(error){
   let box=form.querySelector('[role=alert]');
   if(!box){box=document.createElement('p');box.className='ft-alert wide';
    box.setAttribute('role','alert');form.prepend(box);}
   box.textContent=error.message;
  }
 }
 excel(){
  if(!this.current)throw Error('Open material register first.');
  const XLSX=root.XLSX;if(!XLSX?.utils?.book_new)throw Error('Local Excel library unavailable.');
  const sheets=this.R.sheets(this.current,this.E.calculate(this.current,this.asOf));
  const book=XLSX.utils.book_new();
  for(const [name,rows] of Object.entries(sheets)){
   const ws=XLSX.utils.aoa_to_sheet(this.R.excelRows(name,rows));
   ws['!cols']=rows[0].map(()=>({wch:26}));
   XLSX.utils.book_append_sheet(book,ws,name.slice(0,31));
  }
  const binary=XLSX.write(book,{bookType:'xlsx',type:'array',compression:true});
  this.download(new Blob([binary],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
    'VESA-MATERIAL-'+this.current.id+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 }
}
root.VesaFabricWorkspace=FabricWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
