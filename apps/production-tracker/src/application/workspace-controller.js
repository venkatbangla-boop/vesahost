/* APP-09 M2: browser-only production workspace. The shared VESA shell
 * owns the only logo, global menus, Settings and account region.
 */
(function(root){
'use strict';
class ProductionWorkspace {
 // App-owned, existing panel order. Source accounting belongs to the daily ledger.
 static steps=Object.freeze([
  ['summary','hintSummary'],['daily','hintDaily'],['wip','hintWip'],
  ['targets','hintTargets'],['references','hintReferences'],
  ['reports','hintReports'],['history','hintHistory']
 ]);
 constructor(){
  this.host=document.getElementById('ptMain');this.dialog=document.getElementById('ptDialog');
  this.body=document.getElementById('ptDialogBody');this.file=document.getElementById('ptCopyFile');
  this.refFile=document.getElementById('ptReferenceFile');this.refKind='po';this.pendingRef=null;this.Ref=root.VesaProductionReviewedReference;this.R=root.VesaProductionReportModel;
  this.E=root.VesaProductionStageFlow;this.L=root.VesaProductionDailyLedger;
  this.C=root.VesaProductionCopyCodec;this.T=root.VesaProductionCopy;
  const user=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaProductionLocalStore(user.email||'local-browser-user');
  this.current=null;this.section='summary';this.shell=null;this.focusBefore=null;
 }
 t(k){return this.T.t(k);}
 e(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 btn(a,k,primary=false,id='',disabled=false){return '<button class="pt-button'+(primary?' primary':'')+'" type="button" data-action="'+this.e(a)+'"'+
  (id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+this.e(this.t(k))+'</button>';}
 field(k,value='',type='text',extra='',wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+'</span><input name="'+this.e(k)+
  '" type="'+this.e(type)+'" value="'+this.e(value)+'" '+extra+'></label>';}
 select(k,opts,selected='',wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+'</span><select name="'+this.e(k)+'">'+opts.map(([v,name])=>
  '<option value="'+this.e(v)+'"'+(String(v)===String(selected)?' selected':'')+'>'+this.e(name)+'</option>').join('')+'</select></label>';}
 qty(k,v='',extra=''){return this.field(k,v,'number','min="0" max="100000000" step="1" required '+extra);}
 modal(heading,markup){this.focusBefore=document.activeElement;
  document.getElementById('ptDialogTitle').textContent=heading;this.body.innerHTML=markup;
  if(!this.dialog.open)this.dialog.showModal();
  this.body.querySelector('input:not([type=hidden]),select,button')?.focus?.();
 }
 error(msg){this.modal(this.t('errors'),'<p class="pt-warning" role="alert">'+this.e(msg)+'</p>');}
 start(){const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell){this.host.textContent='Shared VESA workspace unavailable';return;}
  const user=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{id:'production-tracker',name:'VESA Production Tracker 360',
   route:'/apps/production-tracker/',contentTarget:'#ptMain',userLabel:user.name||user.email||'',
   userRole:user.role||'',savedState:'Browser-local'},callbacks:{menu:name=>this.menu(name)}});
  this.shell.mount();document.getElementById('ptDialogClose').onclick=()=>this.dialog.close();
  this.dialog.addEventListener('close',()=>this.focusBefore?.focus?.());
  this.host.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;
   event.preventDefault();this.action(b.dataset.action,b.dataset.id||'');});
  this.dialog.addEventListener('submit',event=>{const form=event.target.closest('form[data-form]');if(!form)return;
   event.preventDefault();this.submit(form);});
  this.file.addEventListener('change',async()=>{const uploaded=this.file.files?.[0];this.file.value='';if(!uploaded)return;
   try{if(uploaded.size>this.C.maxLength)throw Error('Saved copy exceeds safe device size');
    const p=this.C.decode(await uploaded.text());
    if(this.store.load(p.id)){p.id=this.E.id('PROD-COPY');p.audit.push({at:new Date().toISOString(),revision:p.revision,action:'Recovered separate saved copy'});}
    p.mode='local';this.store.save(p);this.current=p;this.section='summary';this.render();
    this.modal(this.t('upload'),'<p class="pt-note">Production copy was opened separately without overwriting earlier source versions.</p>');
   }catch(error){this.error(error.message);}
  });
  this.refFile.addEventListener('change',async()=>{
   const file=this.refFile.files?.[0];this.refFile.value='';if(!file)return;
   try{if(file.size>120000)throw Error('Local reviewed source file exceeds 120 KB');
    const ref=JSON.parse(await file.text());if(!this.Ref.sourceValid(ref,this.refKind))throw Error('Wrong source owner or incomplete typed locally reviewed reference');
    this.pendingRef=this.Ref.copy(ref);this.form('source-confirm');
   }catch(error){this.error(error.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.VesaProduction360=this;
  this.render();
 }
 menu(name){const groups={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
  File:[['save','save'],['download','download'],['upload','upload'],['open','open']],
  Edit:[['daily-form','addDaily'],['opening-form','addOpening'],['target-form','addTarget']],
  View:[['summary','summary'],['daily','daily'],['wip','wip'],['targets','targets'],['references','references'],['reports','reports'],['history','history']],
  Tools:[['report','report'],['excel','excel'],['print','print'],['reference-select','referenceSelect'],['reference-export','referenceExport']],Help:[['help','help']]};
  this.modal(name,'<div class="pt-actions">'+(groups[name]||[]).map(([id,label])=>'<button type="button" class="pt-button" data-dialog-action="'+this.e(id)+'">'+this.e(this.t(label))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-dialog-action]').forEach(b=>b.onclick=()=>{this.dialog.close();this.action(b.dataset.dialogAction);});
 }
 action(name,id=''){try{
  if(name==='home'||name==='open'){this.current=null;this.section='summary';this.render();return;}
  if(name==='new'){this.form('new');return;}
  if(name==='practice'||name==='preview'){
   if(name==='preview'&&(this.current||!ProductionWorkspace.steps.some(([step])=>step===id)))
    throw Error('Return to All Records to choose a valid practice step');
   this.current=this.practiceExample();
   this.section=name==='practice'?'summary':id;this.render();return;
  }
  if(name==='continue'){const list=this.store.list();if(!list.length)throw Error(this.t('none'));this.action('load',list[0].id);return;}
  if(name==='load'){const p=this.store.load(id);if(!p)throw Error('Saved production record not found');this.current=p;this.section='summary';this.render();return;}
  if(name==='upload'){this.file.click();return;}
  if(name==='save'){if(!this.current||this.current.mode==='practice')throw Error('Open a local record before saving');this.store.save(this.current);this.render();return;}
  if(name==='download'){if(!this.current||this.current.mode==='practice')throw Error('Open a local production record');const data=this.C.encode(this.current);
   const link=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));link.href=url;
   link.download='VESA-PRODUCTION-'+this.current.id+'.vesaprod';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);return;}
  if(['summary','daily','wip','targets','references','reports','history'].includes(name)){if(!this.current)throw Error('Open a production record');this.section=name;this.render();return;}
  if(name==='report'){if(!this.current)throw Error('Open a production record');this.section='reports';this.render();return;}
  if(name==='excel'){this.excel();return;}
  if(name==='print'){if(!this.current)throw Error('Open a production record');this.section='reports';this.render();root.print();return;}
  if(name==='reference-select'||name==='reference-export'){if(!this.current||this.current.mode==='practice')throw Error('Open a local production record');this.form(name);return;}
  if(name==='help'){this.modal(this.t('help'),'<p class="pt-warning">'+this.e(this.t('warning'))+'</p><p>'+this.e(this.t('noApproval'))+'</p>');return;}
  if(['daily-form','opening-form','target-form','correct-form','revise-target-form'].includes(name)){
   if(!this.current||this.current.mode==='practice')throw Error('Open a local production record');this.form(name,id);return;}
 }catch(e){this.error(e.message);}}
 excel(){if(!this.current)throw Error('Open a production record');if(!root.XLSX)throw Error('Excel workbook library is unavailable');
  const analysis=this.L.validate(this.current);if(!analysis.ok)throw Error(analysis.errors.join('; '));
  const book=root.XLSX.utils.book_new();for(const [name,rows] of Object.entries(this.R.rows(this.current,analysis))){
   const sheet=root.XLSX.utils.aoa_to_sheet(this.R.excelRows(name,rows));root.XLSX.utils.book_append_sheet(book,sheet,name.slice(0,31));
  }root.XLSX.writeFile(book,'VESA-PRODUCTION-'+this.current.id+'.xlsx');}
 downloadData(data,name,type){const file=new Blob([data],{type}),url=URL.createObjectURL(file),a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1400);}
 mutate(fn){if(!this.current||this.current.mode==='practice')throw Error('Practice example is read-only');
  const proposed=fn(this.current);this.store.save(proposed);this.current=proposed;this.render();}
 table(headers,rows){return '<div class="pt-scroll"><table class="pt-table"><thead><tr>'+headers.map(x=>'<th>'+this.e(x)+'</th>').join('')+
  '</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}

 /**
  * Create an unsaved, fictional production walkthrough using the original
  * append-only ledger and validation. This controller owns presentation data,
  * not WIP/target/approval arithmetic. Failure is explicit, never persisted.
  * Cutting uses a correction and target revision; sewing intentionally has no
  * opening-WIP source and one unreviewed observation (both stay unresolved).
  */
 practiceExample(){
  const cut={stage:'cutting',line:'DEMO-CUT-L1',lot:'DEMO-LOT-A',unit:'pieces'};
  const sew={stage:'sewing',line:'DEMO-SEW-L2',lot:'DEMO-LOT-A',unit:'pieces'};
  let record=this.L.create({poNo:'DEMO-PO-360',style:'DEMO-POLO',colour:'Navy',
   size:'M',lot:'DEMO-LOT-A',factory:'SYNTHETIC FACTORY',unit:'pieces',
   sourceRef:'SYNTHETIC SIGNED PRODUCTION PLAN — NOT A REAL ORDER'});
  record.mode='practice';
  record=this.L.appendOpening(record,{...cut,opening:0,
   sourceRef:'SYNTHETIC CUTTING OPENING WIP SHEET',
   reviewedBy:'SYNTHETIC LOCAL REVIEWER',reviewDate:'2026-10-17'});
  const firstTarget={...cut,id:'DEMO-TARGET-C1',quantity:120,
   sourceRef:'SYNTHETIC CUTTING STAGE PLAN 120',
   declaredAuthority:'SYNTHETIC PRODUCTION PLAN OWNER',sourceDate:'2026-10-14',
   reviewedBy:'SYNTHETIC LOCAL REVIEWER',reviewDate:'2026-10-17'};
  record=this.L.appendTarget(record,firstTarget);
  record=this.L.appendTarget(record,{...firstTarget,id:'DEMO-TARGET-C2',quantity:130,
   sourceRef:'SYNTHETIC REVISED CUTTING TARGET 130',
   supersedes:firstTarget.id,amendmentReason:'SYNTHETIC TARGET REVISION',
   amendmentSource:'SYNTHETIC WRITTEN TARGET CHANGE'});
  record=this.L.appendTarget(record,{...sew,id:'DEMO-TARGET-S1',quantity:95,
   sourceRef:'SYNTHETIC SEWING TARGET PLAN 95',
   declaredAuthority:'SYNTHETIC PRODUCTION PLAN OWNER',sourceDate:'2026-10-14',
   reviewedBy:'SYNTHETIC LOCAL REVIEWER',reviewDate:'2026-10-17'});
  const firstCut={...cut,id:'DEMO-CUT-OBS-1',date:'2026-10-15',shift:'Day',
   good:60,verifiedIn:65,verifiedOut:60,verifiedRejects:2,rework:3,
   status:'locally-reviewed',actor:'SYNTHETIC SHIFT RECORDER',
   sourceRef:'SYNTHETIC CUTTING DAILY SHEET 1',
   reviewedBy:'SYNTHETIC LOCAL REVIEWER',reviewDate:'2026-10-17',
   reviewSource:'SYNTHETIC SIGNED LOCAL REVIEW',
   handoffRef:'SYNTHETIC CUTTING IN RECORD',
   outRef:'SYNTHETIC CUTTING OUT RECORD',
   rejectRef:'SYNTHETIC CUTTING REJECTION SHEET'};
  record=this.L.appendObservation(record,firstCut);
  record=this.L.appendObservation(record,{...firstCut,id:'DEMO-CUT-OBS-2',
   good:55,verifiedOut:55,sourceRef:'SYNTHETIC REVISED DAILY SHEET 1',
   supersedes:firstCut.id,correctionReason:'SYNTHETIC PIECES RECOUNT',
   correctionSource:'SYNTHETIC CORRECTED TALLY'});
  record=this.L.appendObservation(record,{...firstCut,id:'DEMO-CUT-OBS-3',
   date:'2026-10-17',good:30,verifiedIn:35,verifiedOut:30,verifiedRejects:1,
   rework:1,sourceRef:'SYNTHETIC CUTTING DAILY SHEET 2'});
  const firstSew={...sew,id:'DEMO-SEW-OBS-1',date:'2026-10-16',shift:'Day',
   good:40,verifiedIn:42,verifiedOut:40,verifiedRejects:1,rework:1,
   status:'locally-reviewed',actor:'SYNTHETIC SHIFT RECORDER',
   sourceRef:'SYNTHETIC SEWING DAILY SHEET 1',
   reviewedBy:'SYNTHETIC LOCAL REVIEWER',reviewDate:'2026-10-17',
   reviewSource:'SYNTHETIC SEWING REVIEW',
   handoffRef:'SYNTHETIC SEWING IN RECORD',
   outRef:'SYNTHETIC SEWING OUT RECORD',
   rejectRef:'SYNTHETIC SEWING REJECTION SHEET'};
  record=this.L.appendObservation(record,firstSew);
  record=this.L.appendObservation(record,{...firstSew,id:'DEMO-SEW-OBS-2',
   date:'2026-10-17',good:20,verifiedIn:0,verifiedOut:0,verifiedRejects:0,
   rework:0,status:'recorded',sourceRef:'SYNTHETIC UNREVIEWED SEWING ENTRY',
   reviewedBy:'',reviewDate:'',reviewSource:'',handoffRef:'',outRef:'',rejectRef:''});
  const check=this.L.validate(record);
  if(!check.ok)throw Error('Fictional production example invalid: '+check.errors.join('; '));
  return record;
 }
 /**
  * Render one link per genuine production section. Practice preview never
  * triggers submit, allocation, local storage writes, or sibling app access.
  */
 journey(t){
  const cards=ProductionWorkspace.steps.map(([step,hint],index)=>
   '<article class="pt-journey-card"><span class="pt-journey-step">'+String(index+1).padStart(2,'0')+
   '</span><h3>'+t(step)+'</h3><p>'+t(hint)+'</p>'+
   '<button type="button" class="pt-button" data-action="preview" data-id="'+this.e(step)+
   '" aria-label="'+t('journeyOpen')+' · '+t(step)+'">'+t('journeyOpen')+'</button></article>');
  return '<section class="pt-card" aria-labelledby="ptJourneyTitle"><h2 id="ptJourneyTitle">'+t('journeyTitle')+
   '</h2><p class="pt-note">'+t('journeyLead')+'</p><div class="pt-journey">'+cards.join('')+'</div></section>';
 }
 render(){const e=x=>this.e(x??this.t('needs')),t=x=>e(this.t(x));
  const banner='<section class="pt-card"><h1>'+t('title')+'</h1><p class="pt-note">'+t('lead')+'</p><p class="pt-warning">'+t('notice')+'</p></section>';
  if(!this.current){let saved=[];try{saved=this.store.list();}catch(err){this.host.innerHTML=banner+'<p class="pt-warning" role="alert">'+e(err.message)+'</p>'+this.btn('upload','upload');return;}
   this.host.innerHTML=banner+'<section class="pt-card"><div class="pt-actions">'+this.btn('new','new',true)+this.btn('continue','continue')+this.btn('upload','upload')+this.btn('practice','practice')+'</div><h2>'+t('openRecords')+'</h2>'+
    (saved.length?saved.map(v=>'<div class="pt-record"><span><b>'+e(v.poNo)+'</b> · '+e(v.style)+'<small>Rev '+e(v.revision)+'</small></span>'+this.btn('load','open',false,v.id)+'</div>').join(''):'<p class="pt-note">'+t('none')+'</p>')+'</section>'+this.journey(t);
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,analysis=this.L.validate(p),practice=p.mode==='practice';
  const tabs=ProductionWorkspace.steps.map(([step])=>step);
  this.host.innerHTML=banner+'<section class="pt-card"><h2>'+e(p.header.poNo)+' · '+e(p.header.style)+' · '+e(p.header.colour)+'</h2><p class="pt-note">'+e(p.header.factory)+' · '+e(p.header.lot)+' · '+e(p.header.unit)+' · '+(practice?'SYNTHETIC PRACTICE':t('localOnly'))+'</p>'+
   '<div class="pt-actions">'+this.btn('home','back')+this.btn('save','save',true,'',practice)+this.btn('download','download',false,'',practice)+this.btn('report','report')+this.btn('excel','excel')+this.btn('reference-export','referenceExport',false,'',practice)+'</div></section>'+
   '<nav class="pt-tabs" aria-label="Production sections">'+tabs.map(tab=>'<button class="pt-button" type="button" data-action="'+tab+'" aria-current="'+(tab===this.section)+'">'+t(tab)+'</button>').join('')+'</nav>'+
   (!analysis.ok?'<section class="pt-card" role="alert"><h2>'+t('errors')+'</h2><p>'+analysis.errors.map(e).join('; ')+'</p></section>':'')+
   this.panel(p,analysis,practice);
  this.shell?.setSavedState('saved');
 }
 panel(p,a,practice){const e=x=>this.e(x??this.t('needs')),t=x=>e(this.t(x)),can=!practice;
  const tile=(value,label)=>'<div class="pt-metric"><strong>'+e(value)+'</strong><small>'+t(label)+'</small></div>';
  if(this.section==='summary')return '<section class="pt-card"><div class="pt-actions">'+this.btn('daily-form','addDaily',true,'',!can)+this.btn('opening-form','addOpening',false,'',!can)+this.btn('target-form','addTarget',false,'',!can)+'</div><div class="pt-grid">'+
   tile(a.groups.length,'stage')+
   tile(a.activeCount,'daily')+tile(p.stageTargets.length,'targets')+'</div><p class="pt-warning">'+t('warning')+'</p><p class="pt-note">'+t('noApproval')+'</p></section>';
  if(this.section==='daily')return '<section class="pt-card"><div class="pt-actions"><h2>'+t('daily')+'</h2>'+this.btn('daily-form','addDaily',true,'',!can)+'</div>'+
   this.table([this.t('date'),this.t('shift'),this.t('stage'),this.t('line'),this.t('good'),this.t('status'),this.t('sourceRef'),this.t('correct')],p.observations.map(o=>[
    e(o.date),e(o.shift),e(o.stage),e(o.line),e(o.good),e(o.status),e(o.sourceRef),can?this.btn('correct-form','correct',false,o.id):t('draft')]))+'</section>';
  if(this.section==='wip')return '<section class="pt-card"><div class="pt-actions"><h2>'+t('wip')+'</h2>'+this.btn('opening-form','addOpening',true,'',!can)+'</div>'+
   this.table([this.t('stage'),this.t('line'),this.t('lot'),this.t('opening'),this.t('verifiedIn'),this.t('verifiedOut'),this.t('verifiedRejects'),'Closing WIP'],a.groups.map(g=>[
    e(g.stage),e(g.line),e(g.lot),e(g.wip.opening),e(g.wip.verifiedIn),e(g.wip.verifiedOut),e(g.wip.verifiedRejects),e(g.wip.closing)]))+'</section>';
  if(this.section==='targets')return '<section class="pt-card"><div class="pt-actions"><h2>'+t('targets')+'</h2>'+this.btn('target-form','addTarget',true,'',!can)+'</div>'+
   this.table([this.t('stage'),this.t('line'),this.t('sourceTarget'),this.t('locallyReviewedGood'),this.t('remaining'),this.t('sourceRef'),this.t('reviseTarget')],a.groups.map(g=>[
    e(g.stage),e(g.line),e(g.sourceTarget),e(g.locallyReviewedGood),e(g.remaining),e(g.targetProvenance),can&&p.stageTargets.some(s=>this.E.axis(s)===this.E.axis(g))?this.btn('revise-target-form','reviseTarget',false,this.targetForGroup(g)?.id):t('needs')]))+'</section>';
  if(this.section==='references')return '<section class="pt-card"><div class="pt-actions"><h2>'+t('references')+'</h2>'+this.btn('reference-select','referenceSelect',true,'',!can)+this.btn('reference-export','referenceExport',false,'',!can)+'</div>'+
   '<p class="pt-warning">'+t('sourceNotice')+'</p>'+this.table([t('sourceType'),t('sourceApp'),t('sourceRecord'),t('localReviewer'),t('localReviewDate')],(p.manualReferences||[]).map(r=>[
    e(r.kind.toUpperCase()),e(r.source.sourceApp),e(r.source.recordId),e(r.localReviewer),e(r.localReviewDate)]))+'</section>';
  if(this.section==='reports')return '<section class="pt-card"><div class="pt-actions">'+this.btn('excel','excel',true)+this.btn('print','print')+'</div>'+this.R.html(p,a)+'</section>';
  return '<section class="pt-card"><h2>'+t('history')+'</h2>'+this.table(['Rev','Action','Source','ID'],p.audit.map(row=>[
   e(row.revision),e(row.action),e(row.at),e(row.recordId)]))+'<p class="pt-note">'+t('noApproval')+'</p></section>';
 }
 targetForGroup(group){return [...this.current.stageTargets].reverse().find(t=>this.E.axis(t)===this.E.axis(group));}
 form(kind,id=''){const e=x=>this.e(x),t=x=>this.t(x),begin='<form class="pt-form" data-form="'+e(kind)+'" data-item="'+e(id)+'">',end='<div class="wide pt-actions"><button type="submit" class="pt-button primary">'+e(t('submit'))+'</button></div></form>';
  let heading=t(({new:'new','opening-form':'addOpening','target-form':'addTarget',
   'revise-target-form':'reviseTarget','correct-form':'correct','reference-select':'referenceSelect',
   'source-confirm':'referenceSelect','reference-export':'referenceExport'})[kind]||'addDaily'),body='';
  const h=this.current?.header||{},oldRow=kind==='correct-form'?this.current.observations.find(o=>o.id===id):null;
  const priorTarget=kind==='revise-target-form'?this.current.stageTargets.find(o=>o.id===id):null;
  if(kind==='reference-select'){
   body='<p class="wide pt-warning">'+e(t('sourceNotice'))+'</p>'+this.select('sourceType',[['po','VESA Purchase Order 360'],['tna','VESA TNA 360']],'po');
  }else if(kind==='source-confirm'){
   if(!this.pendingRef)throw Error('Choose a source file first');
   body='<p class="wide pt-warning">'+e(t('sourceNotice'))+'</p><p class="wide">'+e(this.pendingRef.sourceApp)+' / '+e(this.pendingRef.recordId)+' / '+e(this.pendingRef.revisionId)+'</p>'+
    this.field('localReviewer','','text','required maxlength="180"')+this.field('localReviewDate','','date','required');
  }else if(kind==='reference-export'){
   const analysis=this.L.validate(this.current);if(!analysis.groups.length)throw Error('No stage observation for local export');
   body='<p class="wide pt-warning">'+e(t('sourceNotice'))+'</p>'+this.select('groupIndex',analysis.groups.map((g,i)=>[String(i),g.stage+' / '+g.line+' / '+g.lot]),'0')+
    this.field('verifiedBy','','text','required maxlength="180"')+this.field('verifiedAt','','date','required');
  }else if(kind==='new'){
   for(const field of ['poNo','style','colour','size','lot','factory','unit','sourceRef'])body+=this.field(field,'','text','required maxlength="180"',field==='sourceRef');
  }else{
   const source=oldRow||priorTarget||{},axis=source.stage?source:{stage:'cutting',line:'',lot:h.lot||'',unit:h.unit||''};
   body+=this.select('stage',this.E.stages.map(s=>[s,s]),axis.stage);
   body+=this.field('line',axis.line,'text','required maxlength="120"');
   body+=this.field('lot',axis.lot,'text','required maxlength="120"');
   body+=this.field('unit',axis.unit,'text','required maxlength="80"');
   if(kind==='opening-form'){
    body+=this.qty('opening')+this.field('sourceRef','','text','required maxlength="200"',true)+
     this.field('reviewedBy','','text','required maxlength="120"')+this.field('reviewDate','','date','required');
   }else if(kind==='target-form'||kind==='revise-target-form'){
    body+=this.qty('quantity',priorTarget?.quantity??'')+
     this.field('sourceRef',priorTarget?.sourceRef||'','text','required maxlength="200"',true)+
     this.field('declaredAuthority',priorTarget?.declaredAuthority||'','text','required maxlength="120"')+
     this.field('sourceDate',priorTarget?.sourceDate||'','date','required')+
     this.field('reviewedBy',priorTarget?.reviewedBy||'','text','required maxlength="120"')+
     this.field('reviewDate',priorTarget?.reviewDate||'','date','required');
    if(priorTarget)body+=this.field('amendmentReason','','text','required maxlength="200"')+this.field('amendmentSource','','text','required maxlength="200"');
   }else{
    body+=this.field('date',source.date||'','date','required')+this.field('shift',source.shift||'','text','required maxlength="100"');
    for(const name of ['good','verifiedIn','verifiedOut','verifiedRejects','rework'])body+=this.qty(name,source[name]??'');
    body+=this.select('status',[['recorded',t('recorded')],['locally-reviewed',t('reviewed')]],source.status||'recorded');
    for(const name of ['sourceRef','actor','reviewedBy','reviewSource','handoffRef','outRef','rejectRef'])
     body+=this.field(name,source[name]||'','text',(name==='sourceRef'||name==='actor'?'required ':'')+'maxlength="200"',name==='sourceRef');
    body+=this.field('reviewDate',source.reviewDate||'','date');
    if(oldRow)body+=this.field('correctionReason','','text','required maxlength="200"')+this.field('correctionSource','','text','required maxlength="200"');
   }
  }
  this.modal(heading,begin+body+end);
 }
 submit(form){const data=Object.fromEntries(new FormData(form).entries()),get=name=>String(data[name]??'').trim(),kind=form.dataset.form,item=form.dataset.item;
  try{
   if(kind==='reference-select'){
    this.refKind=get('sourceType');this.dialog.close();this.refFile.click();return;
   }
   if(kind==='source-confirm'){
    const src=this.pendingRef;if(!src)throw Error('Choose a local source file first');
    this.mutate(p=>this.Ref.append(p,this.refKind,src,{localReviewer:get('localReviewer'),localReviewDate:get('localReviewDate')}));this.pendingRef=null;
   }else if(kind==='reference-export'){
    const ref=this.Ref.exportStage(this.current,get('groupIndex'),{verifiedBy:get('verifiedBy'),verifiedAt:get('verifiedAt')});
    this.downloadData(JSON.stringify(ref,null,2),'VESA-PRODUCTION-STAGE-REFERENCE-'+this.current.id+'.json','application/json');
   }else if(kind==='new'){
    const h=Object.fromEntries(['poNo','style','colour','size','lot','factory','unit','sourceRef'].map(k=>[k,get(k)]));
    const p=this.L.create(h);p.mode='local';const check=this.L.validate(p);if(!check.ok)throw Error(check.errors.join('; '));
    this.store.save(p);this.current=p;this.section='summary';
   }else if(kind==='opening-form'){
    const o={stage:get('stage'),line:get('line'),lot:get('lot'),unit:get('unit'),opening:Number(get('opening')),
     sourceRef:get('sourceRef'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate')};
    this.mutate(p=>this.L.appendOpening(p,o));
   }else if(kind==='target-form'||kind==='revise-target-form'){
    const t={stage:get('stage'),line:get('line'),lot:get('lot'),unit:get('unit'),id:this.E.id('TARGET'),quantity:Number(get('quantity')),
     sourceRef:get('sourceRef'),declaredAuthority:get('declaredAuthority'),sourceDate:get('sourceDate'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate')};
    if(kind==='revise-target-form'){t.supersedes=item;t.amendmentReason=get('amendmentReason');t.amendmentSource=get('amendmentSource');}
    this.mutate(p=>this.L.appendTarget(p,t));
   }else if(kind==='daily-form'||kind==='correct-form'){
    const o={stage:get('stage'),line:get('line'),lot:get('lot'),unit:get('unit'),id:this.E.id('OBS'),date:get('date'),shift:get('shift'),
     good:Number(get('good')),verifiedIn:Number(get('verifiedIn')),verifiedOut:Number(get('verifiedOut')),
     verifiedRejects:Number(get('verifiedRejects')),rework:Number(get('rework')),sourceRef:get('sourceRef'),actor:get('actor'),
     status:get('status'),reviewedBy:get('reviewedBy'),reviewDate:get('reviewDate'),reviewSource:get('reviewSource'),
     handoffRef:get('handoffRef'),outRef:get('outRef'),rejectRef:get('rejectRef')};
    if(kind==='correct-form'){o.supersedes=item;o.correctionReason=get('correctionReason');o.correctionSource=get('correctionSource');}
    this.mutate(p=>this.L.appendObservation(p,o));
   }else throw Error('Unsupported production form');
   this.dialog.close();this.render();
  }catch(error){let alert=form.querySelector('[role=alert]');if(!alert){alert=document.createElement('p');alert.className='wide pt-warning';alert.setAttribute('role','alert');form.prepend(alert);}alert.textContent=error.message;}
 }
}
root.VesaProductionWorkspace=ProductionWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
