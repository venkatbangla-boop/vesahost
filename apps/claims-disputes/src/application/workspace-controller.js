/* APP-14 one global VESA shell; app-owned browser-local claims and explicit evidence.
 * The controller never fetches AQL, Shipment, PO, bank, email, SMS or external FX.
 */
(function(root){
'use strict';
class VesaClaimsWorkspace{
 constructor(){
  this.main=document.getElementById('clmMain');this.dialog=document.getElementById('clmDialog');
  this.body=document.getElementById('clmDialogBody');this.file=document.getElementById('clmCopyFile');
  this.E=root.VesaClaimRegister;this.M=root.VesaClaimExposure;this.S=root.VesaClaimSettlementHistory;
  this.C=root.VesaClaimsCopyCodec;this.T=root.VesaClaimsCopy;
  const u=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaClaimsLocalStore(u.email||'local-browser-user');
  this.current=null;this.section='summary';this.shell=null;this.previousFocus=null;
 }
 t(k){return this.T.t(k);}
 e(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 btn(action,key,primary=false,id='',disabled=false){return'<button type="button" class="clm-btn'+(primary?' primary':'')+
  '" data-action="'+this.e(action)+'"'+(id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+
  this.e(this.t(key))+'</button>';}
 field(k,required=false,type='text',wide=false,value=''){return'<label class="'+(wide?'wide':'')+'"><span>'+
  this.e(this.t(k))+'</span><input type="'+this.e(type)+'" name="'+this.e(k)+'" value="'+this.e(value)+
  '"'+(required?' required':'')+' maxlength="700"></label>';}
 select(k,values,wide=false){return'<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(k))+
  '</span><select name="'+this.e(k)+'">'+values.map(([v,label])=>'<option value="'+this.e(v)+'">'+this.e(label)+'</option>').join('')+'</select></label>';}
 modal(title,html){
  this.previousFocus=document.activeElement;
  document.getElementById('clmDialogTitle').textContent=title;
  this.body.innerHTML=html;if(!this.dialog.open)this.dialog.showModal();
  this.dialog.addEventListener('close',()=>this.previousFocus?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,textarea,button')?.focus?.();
 }
 error(message){this.modal(this.t('invalid'),'<p class="clm-warning" role="alert">'+this.e(message)+'</p>');}
 download(content,name){const u=URL.createObjectURL(new Blob([content],{type:'application/json'}));
  const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1500);
 }
 start(){
  const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell)throw Error('Shared VESA navigation unavailable');
  const u=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{id:'claims-disputes',
   name:'VESA Claims & Disputes 360',route:'/apps/claims-disputes/',contentTarget:'#clmMain',
   userLabel:u.name||u.email||'',userRole:u.role||'',savedState:'Browser-local'},
   callbacks:{menu:n=>this.menu(n)}});this.shell.mount();
  document.getElementById('clmDialogClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{
   const btn=event.target.closest('[data-action]');if(!btn)return;
   event.preventDefault();this.action(btn.dataset.action,btn.dataset.id||'');
  });
  this.dialog.addEventListener('submit',event=>{
   const f=event.target.closest('form[data-form]');if(!f)return;event.preventDefault();this.submit(f);
  });
  this.file.addEventListener('change',async()=>{
   const file=this.file.files?.[0];this.file.value='';if(!file)return;
   try{if(file.size>this.C.maxLength)throw Error('Saved case file exceeds 2 MB safety limit');
    const record=this.C.decode(await file.text());
    if(this.store.load(record.id)){
     record.id=this.E.id('CASE-COPY');record.revision++;record.updatedAt=new Date().toISOString();
     record.audit.push({revision:record.revision,at:record.updatedAt,
      action:'Opened separate locally reviewed source copy; original preserved',recordId:record.id});
    }
    record.mode='local';this.store.save(record);this.current=record;this.section='summary';this.render();
    this.modal(this.t('upload'),'<p class="clm-muted">Source copy opened separately. Other cases remain on this device.</p>');
   }catch(err){this.error(err.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.VesaClaims360=this;this.render();
 }
 menu(name){
  const menu={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
   File:[['save','save'],['download','download'],['upload','upload']],
   Edit:[['add-finding','addFinding'],['add-evidence','addEvidence'],['add-response','addResponse'],
    ['add-agreement','addAgreement'],['add-settlement','addSettlement'],['add-decision','addDecision']],
   View:[['summary','summary'],['findings','findings'],['evidence','evidence'],['responses','responses'],
    ['agreements','agreements'],['settlements','settlements'],['decisions','decisions'],['history','history'],['reports','reports']],
   Tools:[['summary','summary'],['reports','reports']],Help:[['help','help']]};
  this.modal(name,'<div class="clm-actions">'+(menu[name]||[]).map(([a,k])=>'<button type="button" class="clm-btn" data-menu-action="'+this.e(a)+'">'+this.e(this.t(k))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-menu-action]').forEach(x=>x.onclick=()=>{this.dialog.close();this.action(x.dataset.menuAction);});
 }
 action(name,id=''){try{
  if(name==='home'){this.current=null;this.section='summary';this.render();return;}
  if(name==='new'){this.form('new');return;}
  if(name==='practice'){
   let p=this.E.create({caseNumber:'SYN-CLAIM-001',buyer:'SYN BUYER',supplier:'SYN SUPPLIER',
    poNo:'SYN-PO-10',shipmentRef:'SYN SHIPMENT-2',claimCategory:'SYN ALLEGED SHORT SHIPMENT',
    openedDate:'2026-10-17',sourceRef:'SYN CASE REGISTER',allegationSummary:'SYN quantity discrepancy for review',
    reviewedBy:'SYN MERCHANDISER',reviewDate:'2026-10-17'});
   p=this.E.append(p,'finding',{id:'SYN-F1',category:'SHORT SHIPMENT',description:'SYN CARTON COUNT VARIANCE',
    affectedQty:10,quantityUnit:'pieces',sourceRef:'SYN PACKING NOTE',sourceDate:'2026-10-17',
    reviewedBy:'SYN QA',reviewDate:'2026-10-17',valueReviewState:'locally-reviewed-claim-value',
    allegedAmount:'120.00',currency:'USD',amountSourceRef:'SYN CLAIM VALUE SOURCE',
    amountReviewedBy:'SYN FINANCE',amountReviewDate:'2026-10-17'});
   p.mode='practice';this.current=p;this.section='summary';this.render();return;
  }
  if(name==='continue'){const list=this.store.list();if(!list.length)throw Error(this.t('none'));this.action('load',list[0].id);return;}
  if(name==='load'){const p=this.store.load(id);if(!p)throw Error('Saved claim not found on this device');
   this.current=p;this.section='summary';this.render();return;}
  if(name==='save'){if(!this.current||this.current.mode==='practice')throw Error(this.t('practiceOnly'));
   this.store.save(this.current);this.render();return;}
  if(name==='download'){if(!this.current||this.current.mode==='practice')throw Error(this.t('practiceOnly'));
   this.download(this.C.encode(this.current),'VESA-CLAIM-'+this.current.id+'.vesaclaim');return;}
  if(name==='upload'){this.file.click();return;}
  if(['summary','findings','evidence','responses','agreements','settlements','decisions','reports','history'].includes(name)){
   if(!this.current)throw Error('Open a claim case first');this.section=name;this.render();return;}
  if(name==='help'){this.modal(this.t('help'),'<p class="clm-warning">'+this.e(this.t('warning'))+'</p>'+
   '<p>'+this.e(this.t('noApproval'))+'</p><p>'+this.e(this.t('noEmail'))+'</p>');return;}
  if(['add-finding','add-evidence','add-response','add-agreement','add-settlement','add-decision'].includes(name)){
   if(!this.current||this.current.mode==='practice')throw Error(this.t('practiceOnly'));
   this.form(name);return;}
 }catch(err){this.error(err.message);}}
 table(head,rows){return'<div class="clm-scroll"><table class="clm-table"><thead><tr>'+
  head.map(x=>'<th>'+this.e(x)+'</th>').join('')+'</tr></thead><tbody>'+
  rows.map(row=>'<tr>'+row.map(v=>'<td>'+this.e(v===undefined||v===null||v===''?this.t('needs'):v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 render(){
  const e=v=>this.e(v??this.t('needs')),t=k=>e(this.t(k));
  const banner='<section class="clm-card"><h1>'+t('title')+'</h1><p class="clm-muted">'+t('lead')+'</p>'+
   '<p class="clm-warning">'+t('notice')+'</p><p class="clm-muted">NON-COMMERCIAL PERSONAL DEMO — SYNTHETIC SOURCE ONLY</p></section>';
  if(!this.current){
   let entries=[];try{entries=this.store.list();}catch(err){this.main.innerHTML=banner+
    '<section role="alert" class="clm-card clm-warning">'+e(err.message)+'</section>'+this.btn('upload','upload');return;}
   this.main.innerHTML=banner+'<section class="clm-card"><div class="clm-actions">'+
    this.btn('new','new',true)+this.btn('continue','continue')+this.btn('upload','upload')+
    this.btn('practice','practice')+'</div><h2>'+t('openRecords')+'</h2>'+
    (entries.length?entries.map(x=>'<div class="clm-record"><span><b>'+e(x.caseNumber)+
     '</b><small>'+e(x.buyer)+' / Rev '+e(x.revision)+'</small></span>'+this.btn('load','open',false,x.id)+
     '</div>').join(''):'<p class="clm-muted">'+t('none')+'</p>')+'</section>';
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,practice=p.mode==='practice',checked=this.E.validate(p),
   status=checked.ok?this.E.localStatus(p):{state:'Needs Information'};
  const tabs=['summary','findings','evidence','responses','agreements','settlements','decisions','reports','history'];
  this.main.innerHTML=banner+'<section class="clm-card"><h2>'+e(p.header.caseNumber)+
   ' — '+e(p.header.claimCategory)+'</h2><p class="clm-muted">'+e(p.header.buyer)+' / '+
   e(p.header.supplier)+' / '+t('state')+': '+e(status.state)+'</p>'+
   '<p class="clm-warning">'+t('status')+' / '+(practice?t('practiceOnly'):t('localOnly'))+'</p>'+
   '<div class="clm-actions">'+this.btn('home','back')+this.btn('save','save',true,'',practice)+
   this.btn('download','download',false,'',practice)+'</div></section>'+
   '<nav class="clm-tabs" aria-label="Claims sections">'+tabs.map(k=>'<button type="button" class="clm-btn" data-action="'+k+
    '" aria-current="'+(this.section===k)+'">'+t(k)+'</button>').join('')+'</nav>'+
   (!checked.ok?'<section class="clm-card clm-warning" role="alert">'+e(checked.errors.join('; '))+'</section>':'')+
   this.panel(p,practice);
  this.shell?.setSavedState('saved');
 }
 panel(p,practice){
  const t=k=>this.t(k),e=v=>this.e(v??this.t('needs'));
  const head=(key,action,label)=>'<div class="clm-actions"><h2>'+e(t(key))+'</h2>'+
   (action?this.btn(action,label,true,'',practice):'')+'</div>';
  if(this.section==='summary'){
   const a=this.M.summarize(p),s=this.S.reconcile(p),status=this.E.localStatus(p);
   return'<section class="clm-card">'+head('summary','add-finding','addFinding')+
    '<div class="clm-grid">'+[['findings',p.findings.length],['evidence',p.evidence.length],
      ['responses',p.responses.length],['state',status.state]].map(([k,v])=>
     '<div class="clm-stat"><strong>'+e(v)+'</strong><small>'+e(t(k))+'</small></div>').join('')+'</div>'+
    '<h2>'+e(t('claimedExposure'))+'</h2>'+this.table([t('currency'),t('claimedExposure'),t('notLiability')],
      a.byCurrency.map(x=>[x.currency,x.sourceReviewedAllegedExposure,'YES']))+
    '<p class="clm-muted">'+e(t('unknown'))+': '+e(a.unknownFindings.length)+'</p>'+
    '<h2>'+e(t('balance'))+'</h2>'+this.table([t('currency'),t('agreedTotal'),t('localActual'),t('balance')],
      s.byAgreement.map(x=>[x.currency,x.agreedSourceAmount,x.sourceReviewedActualReceipts,
       x.outstandingAgainstDocumentedAgreement]))+
    '<p class="clm-warning">'+e(t('warning'))+'</p></section>';
  }
  if(this.section==='findings')return'<section class="clm-card">'+head('findings','add-finding','addFinding')+
   this.table([t('category'),t('description'),t('affectedQty'),t('allegedAmount'),t('currency'),
    t('valueReviewState'),t('sourceRef')],p.findings.map(f=>[
    f.category,f.description,f.affectedQty,f.allegedAmount||null,f.currency||null,f.valueReviewState,f.sourceRef]))+'</section>';
  if(this.section==='evidence')return'<section class="clm-card">'+head('evidence','add-evidence','addEvidence')+
   this.table([t('sourceApp'),t('recordType'),t('recordId'),t('revisionId'),t('evidenceSummary'),t('sourceRef')],
    p.evidence.map(x=>[x.sourceApp,x.recordType,x.recordId,x.revisionId,x.summary,x.sourceRef]))+'</section>';
  if(this.section==='responses')return'<section class="clm-card">'+head('responses','add-response','addResponse')+
   this.table([t('party'),t('receivedDate'),t('stance'),t('responseSummary'),t('sourceRef')],
    p.responses.map(x=>[x.party,x.receivedDate,x.stance,x.summary,x.sourceRef]))+'</section>';
  if(this.section==='agreements')return'<section class="clm-card">'+head('agreements','add-agreement','addAgreement')+
   this.table(['ID',t('agreedAmount'),t('currency'),t('agreementDate'),t('externalAuthorityRef'),t('sourceRef')],
    p.agreements.map(x=>[x.id,x.agreedAmount,x.currency,x.agreementDate,x.externalAuthorityRef,x.sourceRef]))+'</section>';
  if(this.section==='settlements')return'<section class="clm-card">'+head('settlements','add-settlement','addSettlement')+
   this.table([t('agreementId'),t('kind'),t('amount'),t('currency'),t('actualReceiptRef'),t('sourceRef')],
    p.settlements.map(x=>[x.agreementId,x.kind,x.amount,x.currency,x.actualReceiptRef||null,x.sourceRef]))+
   '<p class="clm-warning">'+e(t('noApproval'))+'</p></section>';
  if(this.section==='decisions')return'<section class="clm-card">'+head('decisions','add-decision','addDecision')+
   this.table([t('newState'),t('decisionDate'),t('decisionSourceRef'),t('externalAuthorityRef')],
    p.decisions.map(x=>[x.newState,x.decisionDate,x.decisionSourceRef,x.externalAuthorityRef||null]))+'</section>';
  if(this.section==='reports')return'<section class="clm-card">'+head('reports')+
   '<p class="clm-warning">'+e(t('reportPlanned'))+'</p></section>';
  return'<section class="clm-card">'+head('history')+
   this.table(['Rev','Timestamp','Action','Source ID'],p.audit.map(x=>[x.revision,x.at,x.action,x.recordId||null]))+'</section>';
 }
 form(kind){
  const e=v=>this.e(v),t=k=>this.t(k);
  let body='';
  if(kind==='new')body=['caseNumber','buyer','supplier','poNo','shipmentRef','claimCategory'].map(k=>this.field(k,true)).join('')+
   this.field('openedDate',true,'date')+this.field('sourceRef',true,'text',true)+
   this.field('allegationSummary',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date');
  if(kind==='add-finding')body=this.field('category',true)+this.field('description',true,'text',true)+
   this.field('affectedQty',true,'number')+this.field('quantityUnit',true)+
   this.field('sourceRef',true,'text',true)+this.field('sourceDate',true,'date')+
   this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
   this.select('valueReviewState',[['needs-information',t('needs')],
    ['locally-reviewed-claim-value','Locally entered with separate amount evidence']],true)+
   this.field('allegedAmount')+this.field('currency')+this.field('amountSourceRef')+
   this.field('amountReviewedBy')+this.field('amountReviewDate',false,'date');
  if(kind==='add-evidence')body=this.field('sourceApp',true)+this.field('recordType',true)+
   this.field('recordId',true)+this.field('revisionId',true)+
   this.field('sourceRef',true,'text',true)+this.field('evidenceSummary',true,'text',true)+
   this.field('sourceDate',true,'date')+this.field('reviewedBy',true)+this.field('reviewDate',true,'date');
  if(kind==='add-response')body=this.field('party',true)+this.field('responseSummary',true,'text',true)+
   this.field('receivedDate',true,'date')+this.field('sourceRef',true,'text',true)+
   this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
   this.select('stance',[['pending','Pending'],['disputed',t('disputed')],
    ['proposed','Proposed'],['acknowledged-receipt-only','Acknowledged receipt only']]);
  if(kind==='add-agreement')body=this.field('agreedAmount',true)+this.field('currency',true)+
   this.field('agreementDate',true,'date')+this.field('sourceRef',true,'text',true)+
   this.field('externalAuthorityRef',true)+this.field('externallyNamedParty',true)+
   this.field('reviewedBy',true)+this.field('reviewDate',true,'date');
  if(kind==='add-settlement'){
   if(!this.current?.agreements.length)throw Error('Record an independently evidenced agreement first');
   body=this.select('agreementId',this.current.agreements.map(x=>[x.id,x.id+' / '+x.currency]),true)+
    this.select('kind',[['draft-credit',t('draft')],['documented-receipt',t('actual')]],true)+
    this.field('amount',true)+this.field('currency',true)+this.field('recordedDate',true,'date')+
    this.field('sourceRef',true,'text',true)+this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
    this.field('actualReceiptRef')+this.field('receiptReviewedBy')+this.field('receiptReviewDate',false,'date');
  }
  if(kind==='add-decision')body=this.select('newState',[['open','Open'],['in-review','In review'],
   ['agreed','Agreed (documentary)'],['rejected','Rejected (documentary)'],['closed','Closed (documentary)']],true)+
   this.field('decisionDate',true,'date')+this.field('decisionSourceRef',true,'text',true)+
   this.field('reviewedBy',true)+this.field('reviewDate',true,'date')+
   this.field('externalAuthorityRef')+this.field('externallyNamedParty')+
   this.select('closureBasis',[['','Not closing'],['documented-settlement','Documented settlement'],
    ['documented-rejection','Documented rejection'],['documented-withdrawal','Documented withdrawal']],true);
  if(!body)throw Error('Unsupported source-entry form');
  const name={new:'new','add-finding':'addFinding','add-evidence':'addEvidence',
   'add-response':'addResponse','add-agreement':'addAgreement','add-settlement':'addSettlement',
   'add-decision':'addDecision'}[kind];
  this.modal(this.t(name),'<form class="clm-form" data-form="'+e(kind)+'">'+body+
   '<div class="wide clm-actions"><button class="clm-btn primary" type="submit">'+e(t('submit'))+'</button></div></form>');
 }
 submit(form){
  const data=new FormData(form),get=k=>String(data.get(k)??'').trim(),kind=form.dataset.form;
  try{
   if(kind==='new'){
    const h={};for(const k of ['caseNumber','buyer','supplier','poNo','shipmentRef','claimCategory',
     'openedDate','sourceRef','allegationSummary','reviewedBy','reviewDate'])h[k]=get(k);
    const p=this.E.create(h);
    if(this.store.read().some(x=>x.header?.caseNumber.toUpperCase()===h.caseNumber.toUpperCase()&&
     x.header?.buyer.toUpperCase()===h.buyer.toUpperCase()))
     throw Error('Possible duplicate case for this buyer; please open saved case first');
    this.store.save(p);this.current=p;this.section='summary';
   }else{
    if(!this.current||this.current.mode==='practice')throw Error(this.t('practiceOnly'));
    const entry={id:this.E.id('CLM-SOURCE')},maps={
     'add-finding':['category','description','quantityUnit','sourceRef','sourceDate','reviewedBy','reviewDate',
      'valueReviewState','allegedAmount','currency','amountSourceRef','amountReviewedBy','amountReviewDate'],
     'add-evidence':['sourceApp','recordType','recordId','revisionId','sourceRef','sourceDate','reviewedBy','reviewDate'],
     'add-response':['party','receivedDate','sourceRef','reviewedBy','reviewDate','stance'],
     'add-agreement':['currency','agreedAmount','agreementDate','sourceRef','externalAuthorityRef',
      'externallyNamedParty','reviewedBy','reviewDate'],
     'add-settlement':['agreementId','kind','amount','currency','recordedDate','sourceRef','reviewedBy','reviewDate',
      'actualReceiptRef','receiptReviewedBy','receiptReviewDate'],
     'add-decision':['newState','decisionDate','decisionSourceRef','reviewedBy','reviewDate',
      'externalAuthorityRef','externallyNamedParty','closureBasis']
    };
    if(!maps[kind])throw Error('Unknown claim event type');
    for(const k of maps[kind])entry[k]=get(k);
    if(kind==='add-finding')entry.affectedQty=Number(get('affectedQty'));
    if(kind==='add-evidence')entry.summary=get('evidenceSummary');
    if(kind==='add-response')entry.summary=get('responseSummary');
    if(kind==='add-agreement')entry.authorityState='outside-party-evidence-entered-locally';
    if(kind==='add-finding'&&entry.valueReviewState==='needs-information')entry.allegedAmount=null;
    const type=kind.slice(4);
    const proposed=this.E.append(this.current,type,entry);
    this.store.save(proposed);this.current=proposed;
    this.section={finding:'findings',evidence:'evidence',response:'responses',agreement:'agreements',
     settlement:'settlements',decision:'decisions'}[type]||'summary';
   }
   this.dialog.close();this.render();
  }catch(err){
   let n=form.querySelector('[role=alert]');
   if(!n){n=document.createElement('p');n.className='wide clm-warning';n.setAttribute('role','alert');form.prepend(n);}
   n.textContent=err.message;
  }
 }
}
root.VesaClaimsWorkspace=VesaClaimsWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
