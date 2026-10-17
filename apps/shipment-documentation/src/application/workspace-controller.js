/* APP-07 local logistics workspace. The VESA shared shell is the only
 * logo/header/account/menu/settings owner. No sibling private record reads.
 */
(function(root){
'use strict';
class ShipmentWorkspace {
 // The app controller owns stage navigation. Source approvals remain domain-owned.
 static steps=Object.freeze([
  ['summary','hintSummary'],['invoice','hintInvoice'],['packing','hintPacking'],
  ['dispatches','hintDispatches'],['documents','hintDocuments'],
  ['transport','hintTransport'],['revisions','hintRevisions'],['reports','hintReports']
 ]);
 constructor(){
  this.main=document.getElementById('sdMain');
  this.dialog=document.getElementById('sdDialog');
  this.body=document.getElementById('sdDialogBody');
  this.copyFile=document.getElementById('sdFile');
  this.refFile=document.getElementById('sdReferenceFile');
  this.E=root.VesaShipmentEngine;this.S=root.VesaShipmentStore;
  this.R=root.VesaShipmentReports;this.C=root.VesaShipmentCopy;
  this.current=null;this.section='summary';this.dirty=false;this.shell=null;
  this.asOf=new Date().toISOString().slice(0,10);this.focus=null;
  this.refTarget='';this.pendingRef=null;
  const session=root.VesaAuth?.session?.()||{};
  this.store=new this.S(String(session.email||'local-browser-user'));
 }
 tr(k){return this.C.t(k);}
 e(x){return this.R.safe(x);}
 button(action,label,primary=false,id=null,disabled=false){
  return '<button type="button" class="sd-btn'+(primary?' primary':'')+
   '" data-action="'+this.e(action)+'"'+(id?' data-id="'+this.e(id)+'"':'')+
   (disabled?' disabled':'')+'>'+this.e(this.tr(label))+'</button>';
 }
 field(k,v='',type='text',attrs='',wide=false){
  return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.tr(k))+'</span>'+
   '<input type="'+this.e(type)+'" name="'+this.e(k)+'" value="'+this.e(v??'')+
   '" '+attrs+'></label>';
 }
 choose(k,options,selected='',wide=false){
  return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.tr(k))+
   '</span><select name="'+this.e(k)+'">'+options.map(([v,label])=>
    '<option value="'+this.e(v)+'"'+(String(v)===String(selected)?' selected':'')+
    '>'+this.e(label)+'</option>').join('')+'</select></label>';
 }
 note(k,v=''){return '<label class="wide"><span>'+this.e(this.tr(k))+
   '</span><textarea name="'+this.e(k)+'" maxlength="600">'+this.e(v)+'</textarea></label>';}
 check(k,v=false){return '<label class="wide sd-check"><input type="checkbox" name="'+this.e(k)+
   '"'+(v?' checked':'')+'><span>'+this.e(this.tr(k))+'</span></label>';}
 popup(title,body){
  this.focus=document.activeElement;
  document.getElementById('sdDialogTitle').textContent=title;
  this.body.innerHTML=body;
  if(!this.dialog.open)this.dialog.showModal();
  this.dialog.addEventListener('close',()=>this.focus?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,button')?.focus?.();
 }
 error(text){this.popup('Please review','<p class="sd-alert" role="alert">'+this.e(text)+'</p>');}
 start(){
  const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell){this.main.textContent='VESA shared workspace unavailable.';return;}
  const session=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,
   descriptor:{id:'shipment-documentation',name:'VESA Shipment & Documentation 360',
    route:'/apps/shipment-documentation/',contentTarget:'#sdMain',
    userLabel:session.name||session.email||'',userRole:session.role||'',
    savedState:'Unsaved changes'},callbacks:{menu:name=>this.menu(name)}});
  this.shell.mount();
  document.getElementById('sdClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',e=>{
   const b=e.target.closest('[data-action]');if(!b)return;
   e.preventDefault();this.action(b.dataset.action,b.dataset.id);
  });
  this.dialog.addEventListener('submit',e=>{
   const form=e.target.closest('form[data-form]');if(!form)return;
   e.preventDefault();this.submit(form);
  });
  this.copyFile.addEventListener('change',async()=>{
   const file=this.copyFile.files?.[0];this.copyFile.value='';if(!file)return;
   try{
    if(file.size>2097152)throw Error('Shipment saved copy exceeds safe size.');
    const p=this.S.decode(await file.text());
    if(this.store.load(p.id)){
     p.id=this.E.id('SHIP-COPY');
     p.audit.push({at:new Date().toISOString(),revision:p.revision,
       action:'Portable shipment copy restored separately'});
    }
    p.mode='local';this.store.save(p);this.current=p;this.section='summary';this.dirty=false;this.render();
    this.popup(this.tr('upload'),'<p>Saved shipment opened without overwriting your original records or historical document versions.</p>');
   }catch(error){this.error(error.message);}
  });
  this.refFile.addEventListener('change',async()=>{
   const file=this.refFile.files?.[0];this.refFile.value='';if(!file)return;
   try{
    if(!this.current||this.current.mode==='practice')throw Error('Open a local shipment before linking a source.');
    if(file.size>200000)throw Error('Referenced source file exceeds safe size.');
    const ref=JSON.parse(await file.text());
    if(!this.E.validRef(ref)||!ref)throw Error('Reviewed source requires a typed app, record, revision, date and snapshot.');
    const match={po:/purchase order/i,packing:/packing.*container/i,
     aql:/aql|inspection/i,lc:/lc.*payment/i}[this.refTarget];
    if(!match||!match.test(ref.sourceApp))throw Error('Please select the correct exporting VESA source application.');
    this.pendingRef=this.E.copy(ref);this.form('ref-confirm');
   }catch(error){this.error(error.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.addEventListener('beforeunload',e=>{if(this.dirty&&this.current?.mode==='local'){
   e.preventDefault();e.returnValue='';}});
  this.render();
 }
 menu(name){
  const groups={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
   File:[['save','save'],['download','download'],['upload','upload'],['open','open']],
   Edit:[['header','header'],['add-line','addLine'],['add-carton','addCarton'],
    ['review-packing','packingReview']],
   View:[['summary','summary'],['invoice','invoice'],['packing','packing'],
    ['dispatches','dispatches'],['documents','documents']],
   Tools:[['report','report'],['add-dispatch','addDispatch'],['add-document','addDocument'],
    ['transport-entry','editTransport'],['reference-select','reference'],['reference-export','exportReference'],
    ['complete-ledger','completeLedger']],
   Help:[['help','help'],['practice','practice']]};
  this.popup(name,'<div class="sd-actions">'+(groups[name]||[]).map(([action,key])=>
   '<button class="sd-btn" type="button" data-dialog-action="'+this.e(action)+'">'+
    this.e(this.tr(key))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-dialog-action]').forEach(b=>b.onclick=()=>{
   this.dialog.close();this.action(b.dataset.dialogAction);});
 }
 action(action,id){
  try{
   if(action==='home'||action==='open'){
    this.current=null;this.section='summary';this.dirty=false;this.render();return;
   }
   if(action==='new'){this.form('new');return;}
   if(action==='preview'){
     if(this.current||!ShipmentWorkspace.steps.some(([step])=>step===id))
      throw Error('Return to All Shipments for a valid practice step.');
     this.current=this.E.demo();this.section=id;this.dirty=false;this.render();return;
    }
    if(action==='practice'){this.current=this.E.demo();this.section='summary';this.dirty=false;this.render();return;}
   if(action==='continue'){
    const list=this.store.list();if(!list.length)throw Error('No saved shipment record on this device.');
    this.action('open-record',list[0].id);return;
   }
   if(action==='open-record'){
    const p=this.store.load(id);if(!p)throw Error('Saved shipment record not found.');
    this.current=p;this.section='summary';this.dirty=false;this.render();return;
   }
   if(action==='upload'){this.copyFile.click();return;}
   if(action==='save'){
    if(!this.current||this.current.mode==='practice')throw Error('Practice is read-only.');
    this.store.save(this.current);this.dirty=false;this.render();return;
   }
   if(action==='download'){
    if(!this.current||this.current.mode==='practice')throw Error('Open a local shipment.');
    this.download(this.S.encode(this.current),'VESA-SHIPMENT-'+this.current.id+'.vesaship','application/json');return;
   }
   if(['summary','invoice','packing','dispatches','documents','transport','revisions','reports'].includes(action)){
    if(!this.current)throw Error('Create or open a shipment.');
    this.section=action;this.render();return;
   }
   if(action==='report'){
    if(!this.current)throw Error('Create or open a shipment.');
    this.section='reports';this.render();return;
   }
   if(action==='excel'){this.excel();return;}
   if(action==='print'){if(!this.current)throw Error('Open shipment file.');
    this.section='reports';this.render();root.print();return;}
   if(action==='help'){
    this.popup(this.tr('help'),'<p class="sd-alert">'+this.e(this.tr('notice'))+'</p>'+
      '<p>'+this.e(this.tr('warning'))+'</p>'+
      '<p>'+this.e(this.tr('reportNotice'))+'</p>');return;
   }
   if(['header','add-line','add-carton','review-packing','add-dispatch','add-document',
    'transport-entry','complete-ledger','reference-select','reference-export','asof'].includes(action)){
    if(!this.current)throw Error('Open shipment before editing.');
    this.form(action,id);return;
   }
  }catch(e){this.error(e.message);}
 }
 mutate(label,fn){
  if(!this.current||this.current.mode!=='local')throw Error('Practice example is read-only.');
  const next=this.E.copy(this.current);
  fn(next);next.revision++;next.updatedAt=new Date().toISOString();
  next.audit.push({at:next.updatedAt,revision:next.revision,action:label});
  this.S.validate(next);this.store.save(next);this.current=next;this.dirty=false;this.render();
 }
 download(data,name,type){
  const blob=data instanceof Blob?data:new Blob([data],{type});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download=name;
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
 }
 table(headers,rows){
  const e=v=>this.e(v??this.tr('needs'));
  return '<div class="sd-scroll"><table class="sd-table"><thead><tr>'+
   headers.map(x=>'<th>'+e(x)+'</th>').join('')+'</tr></thead><tbody>'+
   rows.map(row=>'<tr>'+row.map(value=>'<td>'+value+'</td>').join('')+'</tr>').join('')+
   '</tbody></table></div>';
 }
 /**
  * Render app-only workflow discovery from the original fictional shipment.
  * No storage, AQL, customs, carrier, buyer or bank approval is produced.
  */
 journey(t){
  const cards=ShipmentWorkspace.steps.map(([step,hint],index)=>
   '<article class="sd-journey-card"><span class="sd-journey-step">'+String(index+1).padStart(2,'0')+
   '</span><h3>'+t(step)+'</h3><p>'+t(hint)+'</p>'+
   '<button class="sd-btn" type="button" data-action="preview" data-id="'+this.e(step)+
   '" aria-label="'+t('journeyOpen')+' · '+t(step)+'">'+t('journeyOpen')+'</button></article>');
  return '<section class="sd-card" aria-labelledby="sdJourneyTitle"><h2 id="sdJourneyTitle">'+t('journeyTitle')+
   '</h2><p class="sd-note">'+t('journeyLead')+'</p><div class="sd-journey">'+cards.join('')+'</div></section>';
 }
 render(){
  const e=v=>this.e(v??this.tr('needs')),t=k=>e(this.tr(k));
  const banner='<section class="sd-card"><h1>'+t('title')+'</h1><p class="sd-note">'+
   t('lead')+'</p><p class="sd-alert">'+t('notice')+'</p></section>';
  if(!this.current){
   const saved=this.store.list();
   this.main.innerHTML=banner+'<section class="sd-card"><div class="sd-actions">'+
    this.button('new','new',true)+this.button('continue','continue')+
    this.button('upload','upload')+this.button('practice','practice')+'</div>'+
    '<h2>'+t('openRecords')+'</h2>'+
    (saved.length?saved.map(s=>'<div class="sd-record"><span><b>'+e(s.poNo)+'</b> · '+
       e(s.invoiceNo)+'<small>Revision '+e(s.revision)+'</small></span>'+
       this.button('open-record','open',false,s.id)+'</div>').join(''):
      '<p class="sd-note">'+t('none')+'</p>')+'</section>'+this.journey(t);
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,cal=this.E.analyze(p,this.asOf),practice=p.mode==='practice';
  const tabs=ShipmentWorkspace.steps.map(([step])=>step);
  this.main.innerHTML=banner+'<section class="sd-card"><h2>'+e(p.header.poNo)+' · '+e(p.header.invoiceNo)+
   '</h2><p class="sd-note">'+e(p.header.buyer)+' · '+e(p.header.currency)+
    ' · '+(practice?'SYNTHETIC PRACTICE':t('localOnly'))+'</p>'+
    '<div class="sd-actions">'+this.button('home','back')+
    this.button('save','save',true,null,practice)+
    this.button('download','download',false,null,practice)+
    this.button('report','report')+
    this.button('reference-export','exportReference',false,null,practice)+'</div></section>'+
    '<nav class="sd-tabs" aria-label="Shipment domain sections">'+tabs.map(section=>
      '<button class="sd-btn" type="button" data-action="'+section+
       '" aria-current="'+(this.section===section)+'">'+t(section)+'</button>').join('')+'</nav>'+
    (cal.errors.length?'<section class="sd-card" role="alert"><h2>Source errors</h2><ul>'+
      cal.errors.map(error=>'<li>'+e(error)+'</li>').join('')+'</ul></section>':'')+
    this.panel(this.section,p,cal);
  this.shell?.setSavedState(this.dirty?'unsaved':'saved');
 }
 panel(section,p,cal){
  const e=v=>this.e(v??this.tr('needs')),t=k=>e(this.tr(k)),mut=p.mode==='local',
    title=(k,button)=>'<div class="sd-actions"><h2>'+t(k)+'</h2>'+button+'</div>',
    tile=(v,k)=>'<div class="sd-tile"><strong>'+e(v)+'</strong><small>'+t(k)+'</small></div>';
  if(section==='summary')return '<section class="sd-card">'+title('summary',
    this.button('header','header',false,null,!mut))+
   '<div class="sd-grid">'+tile(cal.invoiceQty,'invoicePieces')+
    tile(cal.invoiceAmount+' '+p.header.currency,'invoiceValue')+
    tile(cal.packingQty,'packingPieces')+tile(cal.cartonCount,'cartons')+
    tile(cal.dispatchedQty,'dispatched')+tile(cal.release,'sourceHold')+'</div>'+
    '<div class="sd-actions">'+this.button('add-line','addLine',false,null,!mut)+
      this.button('add-carton','addCarton',false,null,!mut)+
      this.button('review-packing','packingReview',false,null,!mut)+
      this.button('reference-select','reference',false,null,!mut)+
      this.button('asof','asOf')+'</div>'+
    '<p class="sd-note">'+t('warning')+'</p>'+
    (cal.notes.length?'<ul>'+cal.notes.map(n=>'<li>'+e(n)+'</li>').join('')+'</ul>':'')+
    '</section>';
  if(section==='invoice')return '<section class="sd-card">'+title('invoice',
    this.button('add-line','addLine',false,null,!mut))+
    this.table([this.tr('poLineRef'),this.tr('style'),this.tr('colour'),this.tr('size'),
     this.tr('lot'),this.tr('pieces'),this.tr('unitPrice'),this.tr('invoiceValue'),
     this.tr('invoiceSource')],p.lines.map(l=>{
      const a=cal.dispatchLines.find(x=>x.lineId===l.id)||{};
      return [e(l.poLineRef),e(l.style),e(l.colour),e(l.size),e(l.lot),
       e(l.pieces),e(l.unitPrice),e(a.amount),e(l.invoiceSource)];
     }))+'<p class="sd-note">'+t('differences')+'</p></section>';
  if(section==='packing')return '<section class="sd-card">'+title('packing',
    this.button('add-carton','addCarton',false,null,!mut)+
    this.button('review-packing','packingReview',false,null,!mut))+
    this.table([this.tr('cartonId'),this.tr('line'),this.tr('pieces'),this.tr('netKg'),
     this.tr('grossKg'),this.tr('cbm'),this.tr('sourceRef')],p.packing.map(c=>[
     e(c.cartonId),e(p.lines.find(l=>l.id===c.lineId)?.poLineRef),e(c.pieces),
     e(c.netKg),e(c.grossKg),e(c.cbm),e(c.sourceRef)]))+
    '<p class="sd-note">'+(cal.latestPackingReviewed?'Latest reviewed snapshot matches draft':
      'Needs another reviewed packing snapshot')+'</p></section>';
  if(section==='dispatches')return '<section class="sd-card">'+title('dispatches',
    this.button('add-dispatch','addDispatch',false,null,!mut))+
    this.table([this.tr('line'),this.tr('pieces'),this.tr('date'),this.tr('carrierRef'),
     this.tr('actor'),this.tr('sourceRef')],p.dispatches.map(d=>[
     e(p.lines.find(l=>l.id===d.lineId)?.poLineRef),e(d.pieces),e(d.date),
     e(d.carrierRef),e(d.actor),e(d.sourceRef)]))+'</section>';
  if(section==='documents')return '<section class="sd-card">'+title('documents',
    this.button('add-document','addDocument',false,null,!mut))+
    this.table([this.tr('kind'),this.tr('versionNo'),this.tr('status'),this.tr('documentRef'),
     this.tr('date'),this.tr('actor'),this.tr('ackEvidence')],p.documents.map(d=>[
      e(d.kind),e(d.versionNo),e(d.status),e(d.documentRef),e(d.date),e(d.actor),
      e(d.ackEvidence)]))+'<p class="sd-note">'+t('warning')+'</p></section>';
  if(section==='transport')return '<section class="sd-card">'+title('transport',
    this.button('transport-entry','editTransport',false,null,!mut)+
    this.button('complete-ledger','completeLedger',false,null,!mut))+
    this.table(['Transport / compliance source field','Entered value'],
      Object.entries({...p.transport,originCountry:p.header.originCountry,
       originEvidence:p.header.originEvidence,hsCode:p.header.hsCode,
       hsEvidence:p.header.hsEvidence,ledgerComplete:p.header.ledgerComplete,
       ledgerSource:p.header.ledgerSource}).map(([k,v])=>[e(k),e(v)]))+'</section>';
  if(section==='revisions')return '<section class="sd-card">'+title('revisions',
    this.button('review-packing','packingReview',false,null,!mut))+
    this.table([this.tr('revisionId'),this.tr('reviewer'),this.tr('reviewDate'),
      this.tr('controlCartons'),this.tr('controlPieces'),this.tr('sourceRef')],
     p.packingSnapshots.map(s=>[
      e(s.revisionId),e(s.reviewer),e(s.reviewedDate),e(s.cartonCount),e(s.controlPieces),
      e(s.sourceRef)]))+'<h3>'+t('documents')+'</h3>'+
    this.table([this.tr('kind'),this.tr('versionNo'),this.tr('status'),
      this.tr('parentId'),this.tr('sourceRef')],p.documents.map(d=>[
      e(d.kind),e(d.versionNo),e(d.status),e(d.parentId),e(d.sourceRef)]))+'</section>';
  if(section==='reports')return '<section class="sd-card"><div class="sd-actions">'+
    this.button('excel','excel',true)+this.button('print','print')+
    this.button('reference-export','exportReference',false,null,!mut)+'</div>'+
    this.R.html(p,cal)+'</section>';
  return '<section class="sd-card">'+t('none')+'</section>';
 }
 form(kind,id){
  const p=this.current,t=k=>this.tr(k),e=v=>this.e(v);
  const begin='<form class="sd-form" data-form="'+e(kind)+'">'+
   '<input type="hidden" name="target" value="'+e(id||'')+'">';
  const finish='<div class="wide sd-actions"><button type="submit" class="sd-btn primary">'+
   e(t('save'))+'</button></div></form>';
  let body='',heading=t(kind);
  if(kind==='new'||kind==='header'){
   const h=kind==='new'?{}:p.header;
   body=this.field('poNo',h.poNo,'text','required maxlength="100"')+
    this.field('buyer',h.buyer,'text','required maxlength="130"')+
    this.field('shipper',h.shipper,'text','required maxlength="140"')+
    this.field('consignee',h.consignee,'text','required maxlength="140"')+
    this.field('invoiceNo',h.invoiceNo,'text','required maxlength="100"')+
    this.field('currency',h.currency,'text','required pattern="[A-Z]{3}" maxlength="3"')+
    this.field('incoterm',h.incoterm,'text','required maxlength="70"')+
    this.field('sourceRef',h.sourceRef,'text','required maxlength="180"',true)+
    this.field('invoiceControl',h.invoiceControl,'text','inputmode="decimal"')+
    this.field('invoiceControlSource',h.invoiceControlSource,'text','maxlength="180"')+
    this.field('invoiceDate',h.invoiceDate,'date')+
    this.field('originCountry',h.originCountry,'text','maxlength="90"')+
    this.field('originEvidence',h.originEvidence,'text','maxlength="180"')+
    this.field('hsCode',h.hsCode,'text','maxlength="90"')+
    this.field('hsEvidence',h.hsEvidence,'text','maxlength="180"',true);
  }else if(kind==='add-line'){
   body=this.field('poLineRef','','text','required maxlength="160"')+
    this.field('style','','text','required maxlength="120"')+
    this.field('colour','','text','required maxlength="90"')+
    this.field('size','','text','required maxlength="70"')+
    this.field('lot','','text','required maxlength="90"')+
    this.field('pieces','','number','required min="1" step="1"')+
    this.field('unitPrice','','text','required inputmode="decimal"')+
    this.choose('rounding',[['','Choose documented cent rounding'],
      ['line-half-up-2','Line total, nearest 2dp half-up'],
      ['line-down-2','Line total, round down 2dp']],'')+
    this.field('invoiceSource','','text','required maxlength="180"',true);
  }else if(kind==='add-carton'){
   if(!p.lines.length)throw Error('Add a sourced PO invoice line before its physical cartons.');
   body=this.choose('line',p.lines.map(l=>[l.id,
     l.poLineRef+' / '+l.style+' / '+l.colour+' / '+l.size+' / '+l.lot]),p.lines[0].id,true)+
    this.field('cartonId','','text','required maxlength="100"')+
    this.field('pieces','','number','required min="1" step="1"')+
    this.field('netKg','','text','required inputmode="decimal"')+
    this.field('grossKg','','text','required inputmode="decimal"')+
    this.field('cbm','','text','required inputmode="decimal"')+
    this.field('sourceRef','','text','required maxlength="180"',true);
  }else if(kind==='review-packing'){
   if(!p.packing.length)throw Error('Enter physical cartons and their source values first.');
   body='<p class="wide sd-alert">Enter the original reviewed packing control totals. These are not guessed from the draft.</p>'+
    this.field('revisionId','','text','required maxlength="120"')+
    this.field('reviewer','','text','required maxlength="130"')+
    this.field('reviewDate','','date','required')+
    this.field('sourceRef','','text','required maxlength="180"')+
    this.field('controlCartons','','number','required min="1" step="1"')+
    this.field('controlPieces','','number','required min="1" step="1"')+
    this.field('controlNetKg','','text','required inputmode="decimal"')+
    this.field('controlGrossKg','','text','required inputmode="decimal"')+
    this.field('controlCbm','','text','required inputmode="decimal"');
  }else if(kind==='add-dispatch'){
   if(!p.lines.length||!p.packing.length)
    throw Error('Create invoice line and carton evidence before recording actual dispatch.');
   body=this.choose('line',p.lines.map(l=>[l.id,
    l.poLineRef+' / '+l.lot]),p.lines[0].id,true)+
    this.field('pieces','','number','required min="1" step="1"')+
    this.field('dispatchDate','','date','required')+
    this.field('carrierRef','','text','required maxlength="180"')+
    this.field('actor','','text','required maxlength="140"')+
    this.field('sourceRef','','text','required maxlength="180"',true);
  }else if(kind==='add-document'){
   const possible=[['invoice','Commercial invoice'],['packing-list','Packing list'],
    ['bl','Bill of lading'],['certificate-origin','Certificate of origin'],
    ['inspection','Inspection'],['export-declaration','Export declaration'],
    ['other','Buyer-defined other']];
   body=this.choose('kind',possible,'invoice')+
    this.field('versionNo','','number','required min="1" step="1"')+
    this.choose('status',[['draft','Draft / unsigned'],['sent','Sent with actual source'],
     ['acknowledged','Acknowledged with separate authority'],
     ['revised','Version revised']], 'draft')+
    this.field('documentRef','','text','required maxlength="180"')+
    this.field('date','','date','required')+
    this.field('actor','','text','required maxlength="120"')+
    this.field('sourceRef','','text','required maxlength="180"')+
    this.choose('parentId',[['','No prior version'],
      ...p.documents.map(d=>[d.id,d.kind+' V'+d.versionNo+' '+d.documentRef])],'')+
    this.field('ackActor','','text','maxlength="130"')+
    this.field('ackDate','','date')+
    this.field('ackEvidence','','text','maxlength="180"',true);
  }else if(kind==='transport-entry'){
   const t=p.transport;
   body=this.field('bookingRef',t.bookingRef,'text','maxlength="180"')+
    this.field('bookingSource',t.bookingSource,'text','maxlength="180"')+
    this.field('carrier',t.carrier,'text','maxlength="130"')+
    this.field('vessel',t.vessel,'text','maxlength="130"')+
    this.field('portLoad',t.portLoad,'text','maxlength="130"')+
    this.field('portDischarge',t.portDischarge,'text','maxlength="130"')+
    this.field('etd',t.etd,'date')+this.field('eta',t.eta,'date')+
    this.choose('dateBasis',[['','No sourced calendar'],['calendar','Calendar'],
      ['business','Source-defined business calendar']],t.dateBasis)+
    this.field('dateSource',t.dateSource,'text','maxlength="180"')+
    this.field('blRef',t.blRef,'text','maxlength="180"')+
    this.field('blSource',t.blSource,'text','maxlength="180"')+
    this.field('transportDispatchDate',t.dispatchDate,'date')+
    this.field('transportDispatchSource',t.dispatchSource,'text','maxlength="180"')+
    this.field('transportActor',t.actor,'text','maxlength="120"');
  }else if(kind==='complete-ledger'){
   body='<p class="wide sd-alert">This controls unshipped quantity visibility only. Do not tick unless all source dispatch events are recorded.</p>'+
    this.check('completeLedger',p.header.ledgerComplete)+
    this.field('ledgerSource',p.header.ledgerSource,'text','maxlength="180"',true);
  }else if(kind==='asof'){
   body=this.field('asOf',this.asOf,'date','required');
  }else if(kind==='reference-select'){
   body='<p class="wide sd-alert">'+e(t('sourceNotice'))+'</p>'+
    this.choose('sourceType',[['po','Purchase Order 360'],['packing','Packing & Container 360'],
     ['aql','AQL 360'],['lc','LC & Payment 360']],'po');
  }else if(kind==='ref-confirm'){
   if(!this.pendingRef)throw Error('Choose a reviewed source file first.');
   body='<p class="wide sd-alert">'+e(t('sourceNotice'))+'</p>'+
    '<p class="wide">'+e(this.pendingRef.sourceApp)+' / '+e(this.pendingRef.recordId)+
      ' / '+e(this.pendingRef.revisionId)+'</p>'+
    this.field('localReviewer','','text','required maxlength="120"')+
    this.field('localReviewDate','','date','required')+
    this.check('confirm',false);
  }else if(kind==='reference-export'){
   body='<p class="wide sd-alert">A read-only local status reference; never a bank, carrier, customs or buyer release.</p>'+
    this.field('localReviewer','','text','required maxlength="120"')+
    this.field('localReviewDate','','date','required')+
    this.check('confirm',false);
  }else throw Error('Unknown shipment form.');
  this.popup(heading,begin+body+finish);
 }
 submit(form){
  const data=Object.fromEntries(new FormData(form).entries());
  const get=k=>this.E.text(data[k]),checked=k=>form.querySelector('[name="'+k+'"]')?.checked===true,
   kind=form.dataset.form;
  try{
   if(kind==='asof'){
    if(!this.E.date(get('asOf')))throw Error('Choose a valid date.');
    this.asOf=get('asOf');this.dialog.close();this.render();return;
   }
   if(kind==='reference-select'){
    this.refTarget=get('sourceType');this.dialog.close();this.refFile.click();return;
   }
   if(kind==='new'){
    const keys=['poNo','buyer','shipper','consignee','invoiceNo','currency','incoterm','sourceRef',
      'invoiceControl','invoiceControlSource','invoiceDate','originCountry','originEvidence','hsCode','hsEvidence'];
    const p=this.E.create(Object.fromEntries(keys.map(key=>[key,get(key)])));
    this.S.validate(p);this.store.save(p);
    this.current=p;this.section='invoice';this.dirty=false;
   }else if(kind==='header'){
    this.mutate('Source invoice/commercial header manually revised',p=>{
     const keys=['poNo','buyer','shipper','consignee','invoiceNo','currency','incoterm','sourceRef',
      'invoiceControl','invoiceControlSource','invoiceDate','originCountry','originEvidence','hsCode','hsEvidence'];
     if((p.lines.length||p.documents.length)&&
      ['poNo','currency','invoiceNo'].some(k=>p.header[k]!==get(k)))
      throw Error('Cannot overwrite original PO number, invoice identity or currency after source line/documents are recorded.');
     Object.assign(p.header,Object.fromEntries(keys.map(k=>[k,get(k)])));
    });
   }else if(kind==='add-line'){
    this.mutate('New source-priced shipment invoice line appended',p=>{
     p.lines.push({id:this.E.id('SHIP-LINE'),poLineRef:get('poLineRef'),style:get('style'),
      colour:get('colour'),size:get('size'),lot:get('lot'),pieces:Number(get('pieces')),
      unitPrice:get('unitPrice'),rounding:get('rounding'),invoiceSource:get('invoiceSource')});
    });
   }else if(kind==='add-carton'){
    this.mutate('Physical carton breakdown entered from packing source',p=>{
     p.packing.push({id:this.E.id('CTN'),cartonId:get('cartonId'),lineId:get('line'),
      pieces:Number(get('pieces')),netKg:get('netKg'),grossKg:get('grossKg'),
      cbm:get('cbm'),sourceRef:get('sourceRef')});
    });
   }else if(kind==='review-packing'){
    this.mutate('Immutable dated reviewed packing version documented',p=>{
     p.packingSnapshots.push({id:this.E.id('PACK'),revisionId:get('revisionId'),
      reviewer:get('reviewer'),reviewedDate:get('reviewDate'),sourceRef:get('sourceRef'),
      cartonCount:Number(get('controlCartons')),controlPieces:Number(get('controlPieces')),
      controlNetKg:get('controlNetKg'),controlGrossKg:get('controlGrossKg'),
      controlCbm:get('controlCbm'),cartons:this.E.copy(p.packing)});
    });
   }else if(kind==='add-dispatch'){
    this.mutate('Actual dispatch source recorded independently from invoice draft',p=>{
     p.dispatches.push({id:this.E.id('DISP'),lineId:get('line'),
      pieces:Number(get('pieces')),date:get('dispatchDate'),
      carrierRef:get('carrierRef'),actor:get('actor'),sourceRef:get('sourceRef')});
    });
   }else if(kind==='add-document'){
    this.mutate('Append-only shipping document version and local authority evidence recorded',p=>{
     p.documents.push({id:this.E.id('DOC'),kind:get('kind'),versionNo:Number(get('versionNo')),
      status:get('status'),documentRef:get('documentRef'),date:get('date'),
      actor:get('actor'),sourceRef:get('sourceRef'),parentId:get('parentId'),
      ackActor:get('ackActor'),ackDate:get('ackDate'),ackEvidence:get('ackEvidence')});
    });
   }else if(kind==='transport-entry'){
    this.mutate('Manually source-labelled carrier and transport fields updated',p=>{
     Object.assign(p.transport,{bookingRef:get('bookingRef'),bookingSource:get('bookingSource'),
      carrier:get('carrier'),vessel:get('vessel'),portLoad:get('portLoad'),
      portDischarge:get('portDischarge'),etd:get('etd'),eta:get('eta'),
      dateBasis:get('dateBasis'),dateSource:get('dateSource'),
      blRef:get('blRef'),blSource:get('blSource'),
      dispatchDate:get('transportDispatchDate'),
      dispatchSource:get('transportDispatchSource'),actor:get('transportActor')});
    });
   }else if(kind==='complete-ledger'){
    this.mutate('Reviewed dispatch completeness source changed',p=>{
     p.header.ledgerComplete=checked('completeLedger');
     p.header.ledgerSource=get('ledgerSource');
    });
   }else if(kind==='ref-confirm'){
    if(!this.pendingRef||!checked('confirm')||!get('localReviewer')||
      !this.E.date(get('localReviewDate')))
     throw Error('Local independent reviewer, date and source confirmation are required.');
    const reference=this.E.copy(this.pendingRef),target=this.refTarget;
    reference.localReview={verifiedBy:get('localReviewer'),verifiedAt:get('localReviewDate')};
    this.mutate('Separately reviewed typed '+target+' reference attached',p=>{
     const key={po:'poReference',packing:'packingReference',aql:'aqlReference',lc:'lcReference'}[target];
     if(!key)throw Error('Unrecognized reference owner.');
     p.header[key]=reference;
    });
    this.pendingRef=null;this.refTarget='';
   }else if(kind==='reference-export'){
    const reference=this.E.reviewedReference(this.current,{
     checked:checked('confirm'),verifiedBy:get('localReviewer'),
     verifiedAt:get('localReviewDate')},this.asOf);
    this.download(JSON.stringify(reference,null,2),
     'VESA-SHIPMENT-REVIEWED-'+reference.recordId+'-'+reference.revisionId+'.json','application/json');
    this.dialog.close();return;
   }
   this.dialog.close();this.render();
  }catch(e){
   let el=form.querySelector('[role=alert]');
   if(!el){el=document.createElement('p');el.className='sd-alert wide';
    el.setAttribute('role','alert');form.prepend(el);}
   el.textContent=e.message;
  }
 }
 excel(){
  if(!this.current)throw Error('Open shipment file first.');
  const XLSX=root.XLSX;if(!XLSX?.utils?.book_new)throw Error('Local Excel module unavailable.');
  const rows=this.R.sheets(this.current,this.E.analyze(this.current,this.asOf));
  const wb=XLSX.utils.book_new();
  for(const [name,values] of Object.entries(rows)){
   const matrix=this.R.excelRows(name,values),sheet=XLSX.utils.aoa_to_sheet(matrix);
   sheet['!cols']=values[0].map(()=>({wch:27}));
   XLSX.utils.book_append_sheet(wb,sheet,name.slice(0,31));
  }
  const bytes=XLSX.write(wb,{bookType:'xlsx',type:'array',compression:true});
  this.download(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
   'VESA-SHIPMENT-'+this.current.id+'.xlsx',
   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 }
}
root.VesaShipmentWorkspace=ShipmentWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
