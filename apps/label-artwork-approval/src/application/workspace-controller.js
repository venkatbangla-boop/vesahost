/* APP-10 browser-local artwork source workspace. ONE shared VESA shell only.
 * Never uploads preview/source files, issues GS1 numbers or grants buyer approval.
 */
(function(root){
'use strict';
class ArtworkWorkspace{
 constructor(){
  this.main=document.getElementById('laMain');this.dialog=document.getElementById('laDialog');
  this.body=document.getElementById('laDialogBody');this.file=document.getElementById('laCopyFile');
  this.previewFile=document.getElementById('laPreviewFile');
  this.E=root.VesaArtworkRevision;this.L=root.VesaLabelSpec;this.D=root.VesaArtworkReviewState;
  this.C=root.VesaArtworkCopyCodec;this.T=root.VesaArtworkCopy;
  const session=root.VesaAuth?.session?.()||{};
  this.store=new root.VesaArtworkLocalStore(session.email||'local-browser-user');
  this.current=null;this.section='summary';this.shell=null;this.focusBefore=null;this.preview=null;
 }
 t(k){return this.T.t(k);}
 e(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 button(action,key,primary=false,id='',disabled=false){return '<button type="button" class="la-btn'+(primary?' primary':'')+'" data-action="'+this.e(action)+'"'+(id?' data-id="'+this.e(id)+'"':'')+(disabled?' disabled':'')+'>'+this.e(this.t(key))+'</button>';}
 field(key,required=false,type='text',wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(key))+'</span><input name="'+this.e(key)+'" type="'+this.e(type)+'"'+(required?' required':'')+' maxlength="250"></label>';}
 select(key,opts,wide=false){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(key))+'</span><select name="'+this.e(key)+'">'+opts.map(([v,l])=>'<option value="'+this.e(v)+'">'+this.e(l)+'</option>').join('')+'</select></label>';}
 textarea(key,wide=true){return '<label class="'+(wide?'wide':'')+'"><span>'+this.e(this.t(key))+'</span><textarea maxlength="4000" name="'+this.e(key)+'"></textarea></label>';}
 showModal(title,html){this.focusBefore=document.activeElement;document.getElementById('laDialogTitle').textContent=title;this.body.innerHTML=html;
  if(!this.dialog.open)this.dialog.showModal();this.dialog.addEventListener('close',()=>this.focusBefore?.focus?.(),{once:true});
  this.body.querySelector('input:not([type=hidden]),select,textarea,button')?.focus?.();}
 error(s){this.showModal(this.t('errors'),'<p class="la-warning" role="alert">'+this.e(s)+'</p>');}
 clearPreview(){if(this.preview?.url)URL.revokeObjectURL(this.preview.url);this.preview=null;}
 async acceptPreview(file){
  if(file.size<4||file.size>1048576)throw Error(this.t('fileTooLarge'));
  const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const png=header.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>header[i]===x);
  const jpeg=header[0]===255&&header[1]===216&&header[2]===255;
  if(!((png&&file.type==='image/png')||(jpeg&&file.type==='image/jpeg')))throw Error(this.t('unsupportedImage'));
  this.clearPreview();this.preview={url:URL.createObjectURL(file),name:file.name,size:file.size};
  this.section='preview';this.render();
 }
 start(){const Shell=root.VesaWorkspaceShell?.VesaWorkspaceShell;
  if(!Shell){this.main.textContent='VESA shared workspace unavailable';return;}
  const user=root.VesaAuth?.session?.()||{};
  this.shell=new Shell({root:document.body,descriptor:{id:'label-artwork-approval',name:'VESA Label & Artwork Approval 360',
   route:'/apps/label-artwork-approval/',contentTarget:'#laMain',userLabel:user.name||user.email||'',
   userRole:user.role||'',savedState:'Browser-local'},callbacks:{menu:name=>this.menu(name)}});this.shell.mount();
  document.getElementById('laDialogClose').onclick=()=>this.dialog.close();
  this.main.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;
   event.preventDefault();this.action(button.dataset.action,button.dataset.id||'');});
  this.dialog.addEventListener('submit',event=>{const form=event.target.closest('form[data-form]');if(!form)return;
   event.preventDefault();this.submit(form);});
  this.file.addEventListener('change',async()=>{const file=this.file.files?.[0];this.file.value='';if(!file)return;
   try{if(file.size>this.C.maxLength)throw Error('Saved artwork copy exceeds safe size limit');
    const p=this.C.decode(await file.text());if(this.store.load(p.id)){
     p.id=this.E.id('ART-COPY');p.revision++;p.updatedAt=new Date().toISOString();
     p.audit.push({revision:p.revision,at:p.updatedAt,action:'Restored separate local saved copy',recordId:p.id});
    }this.store.save(p);this.clearPreview();this.current=p;this.section='summary';this.render();
    this.showModal(this.t('upload'),'<p class="la-note">Local saved copy opened; earlier source records preserved.</p>');
   }catch(err){this.error(err.message);}
  });
  this.previewFile.addEventListener('change',async()=>{const file=this.previewFile.files?.[0];this.previewFile.value='';if(!file)return;
   try{await this.acceptPreview(file);}catch(err){this.error(err.message);}
  });
  root.addEventListener('vesa-preferences-change',()=>this.render());
  root.addEventListener('beforeunload',()=>this.clearPreview());
  root.VesaArtwork360=this;this.render();
 }
 menu(name){const groups={Home:[['home','back'],['new','new'],['continue','continue'],['practice','practice']],
  File:[['save','save'],['download','download'],['upload','upload']],
  Edit:[['add-revision','addRevision'],['add-comment','addComment'],['add-decision','addDecision']],
  View:[['summary','summary'],['revisions','revisions'],['reviews','reviews'],['preview','preview'],['reports','reports'],['history','history']],
  Tools:[['preview-select','selectPreview'],['preview-clear','clearPreview']],Help:[['help','help']]};
  this.showModal(name,'<div class="la-actions">'+(groups[name]||[]).map(([id,key])=>'<button type="button" class="la-btn" data-dialog-action="'+this.e(id)+'">'+this.e(this.t(key))+'</button>').join('')+'</div>');
  this.body.querySelectorAll('[data-dialog-action]').forEach(x=>x.onclick=()=>{this.dialog.close();this.action(x.dataset.dialogAction);});
 }
 download(s,name,type){const url=URL.createObjectURL(new Blob([s],{type})),a=document.createElement('a');a.href=url;a.download=name;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1400);}
 action(name,id=''){try{
  if(name==='home'){this.current=null;this.clearPreview();this.section='summary';this.render();return;}
  if(name==='new'){this.form('new');return;}
  if(name==='practice'){let p=this.E.create({style:'SYN STYLE',colour:'Navy',size:'M',itemType:'label',placement:'inside neck',sourceRef:'SYN SPEC'});
   p=this.E.appendRevision(p,{id:'SYN-REV-1',sourceDate:'2026-10-17',artworkRef:'SYN ARTWORK FILE',sourceRef:'SYN FILE SOURCE',
    spec:{width:'4',height:'5',unit:'cm',dimensionSourceRef:'SYN MEASURED SPEC',barcode:{symbology:'ean-13',value:'4006381333932',sourceRef:'SYN NUMBER'}}});
   p.mode='practice';this.current=p;this.clearPreview();this.section='summary';this.render();return;}
  if(name==='continue'){const list=this.store.list();if(!list.length)throw Error(this.t('none'));this.action('load',list[0].id);return;}
  if(name==='load'){const p=this.store.load(id);if(!p)throw Error('Saved artwork not found');this.current=p;this.section='summary';this.clearPreview();this.render();return;}
  if(name==='save'){if(!this.current||this.current.mode==='practice')throw Error('Open a local artwork record first');this.store.save(this.current);this.render();return;}
  if(name==='download'){if(!this.current||this.current.mode==='practice')throw Error('Open a saved artwork record first');
   this.download(this.C.encode(this.current),'VESA-ARTWORK-'+this.current.id+'.vesaart','application/json');return;}
  if(name==='upload'){this.file.click();return;}
  if(['summary','revisions','reviews','preview','reports','history'].includes(name)){
   if(!this.current)throw Error('Open an artwork record first');this.section=name;this.render();return;}
  if(name==='preview-select'){if(!this.current)throw Error('Open an artwork record');this.previewFile.click();return;}
  if(name==='preview-clear'){this.clearPreview();this.section='preview';this.render();return;}
  if(name==='help'){this.showModal(this.t('help'),'<p class="la-warning">'+this.e(this.t('warning'))+'</p><p>'+this.e(this.t('noApproval'))+'</p>');return;}
  if(['add-revision','add-comment','add-decision'].includes(name)){
   if(!this.current||this.current.mode==='practice')throw Error('Practice is read only');this.form(name);return;}
 }catch(err){this.error(err.message);}}
 table(headers,rows){return '<div class="la-scroll"><table class="la-table"><thead><tr>'+headers.map(h=>'<th>'+this.e(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+this.e(v??this.t('needs'))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 render(){const t=k=>this.e(this.t(k)),e=v=>this.e(v??this.t('needs'));
  const banner='<section class="la-card"><h1>'+t('title')+'</h1><p class="la-note">'+t('lead')+'</p><p class="la-warning">'+t('notice')+'</p></section>';
  if(!this.current){let saved=[];try{saved=this.store.list();}catch(err){this.main.innerHTML=banner+'<section class="la-card" role="alert">'+e(err.message)+'</section>'+this.button('upload','upload');return;}
   this.main.innerHTML=banner+'<section class="la-card"><div class="la-actions">'+this.button('new','new',true)+this.button('continue','continue')+
    this.button('upload','upload')+this.button('practice','practice')+'</div><h2>'+t('openRecords')+'</h2>'+
    (saved.length?saved.map(x=>'<div class="la-record"><span><b>'+e(x.style)+'</b> / '+e(x.itemType)+'<small>Revision '+e(x.revision)+'</small></span>'+this.button('load','open',false,x.id)+'</div>').join(''):'<p class="la-note">'+t('none')+'</p>')+'</section>';
   this.shell?.setSavedState('unsaved');return;
  }
  const p=this.current,practice=p.mode==='practice',analysis=this.E.validate(p);
  const tabs=['summary','revisions','reviews','preview','reports','history'];
  this.main.innerHTML=banner+'<section class="la-card"><h2>'+e(p.header.style)+' / '+e(p.header.colour)+' / '+e(p.header.size)+'</h2><p class="la-note">'+(practice?'SYNTHETIC PRACTICE':t('localOnly'))+' / '+t('status')+'</p>'+
   '<div class="la-actions">'+this.button('home','back')+this.button('save','save',true,'',practice)+this.button('download','download',false,'',practice)+'</div></section>'+
   '<nav class="la-tabs" aria-label="Artwork sections">'+tabs.map(k=>'<button type="button" class="la-btn" data-action="'+k+'" aria-current="'+(this.section===k)+'">'+t(k)+'</button>').join('')+'</nav>'+
   (!analysis.ok?'<section class="la-card la-warning" role="alert">'+e(analysis.errors.join('; '))+'</section>':'')+this.panel(p,practice);
  this.shell?.setSavedState('saved');
 }
 panel(p,practice){const t=k=>this.t(k),e=v=>this.e(v??this.t('needs'));const can=!practice;
  const header=(key,act,label)=>'<div class="la-actions"><h2>'+e(t(key))+'</h2>'+(act?this.button(act,label,true,'',!can):'')+'</div>';
  const state=this.D.effective(p);
  if(this.section==='summary')return '<section class="la-card"><div class="la-actions">'+this.button('add-revision','addRevision',true,'',!can)+this.button('add-comment','addComment',false,'',!can)+this.button('add-decision','addDecision',false,'',!can)+'</div>'+
   '<div class="la-grid">'+[['revisions',p.revisions.length],['reviews',p.comments.length+p.decisions.length],['history',p.revision]].map(([k,v])=>'<div class="la-stat"><strong>'+e(v)+'</strong><small>'+e(t(k))+'</small></div>').join('')+'</div>'+
   '<p class="la-warning">'+e(state.status)+' / '+e(t('noApproval'))+'</p></section>';
  if(this.section==='revisions')return '<section class="la-card">'+header('revisions','add-revision','addRevision')+
   this.table(['Rev','Date',t('artworkRef'),t('sourceRef'),t('width'),t('height'),t('unit'),t('barcodeWarning')],p.revisions.map(v=>[v.number,v.sourceDate,v.artworkRef,v.sourceRef,v.spec?.width,v.spec?.height,v.spec?.unit,v.spec?.barcode?this.L.barcodeStatus(v.spec.barcode).warning:'Needs Information']))+
   '<p class="la-warning">'+e(t('warning'))+'</p></section>';
  if(this.section==='reviews')return '<section class="la-card">'+header('reviews')+'<div class="la-actions">'+this.button('add-comment','addComment',true,'',!can)+this.button('add-decision','addDecision',false,'',!can)+'</div>'+
   this.table([t('revisionId'),t('reviewer'),t('reviewerRole'),t('reviewDate'),'Evidence / State',t('sourceRef')],
    [...p.comments.map(c=>[c.revisionId,c.reviewer,c.reviewerRole,c.reviewDate,c.comment,c.sourceRef]),...p.decisions.map(d=>[d.revisionId,d.reviewer,d.reviewerRole,d.reviewDate,d.decision,d.sourceRef])])+
   '<p class="la-warning">'+e(state.status)+' / '+e(t('noApproval'))+'</p></section>';
  if(this.section==='preview')return '<section class="la-card">'+header('preview')+'<p class="la-warning">'+e(t('previewNotice'))+'</p><div class="la-actions">'+this.button('preview-select','selectPreview',true)+this.button('preview-clear','clearPreview')+'</div>'+
   (this.preview?'<p class="la-note">'+e(this.preview.name)+' ('+e(this.preview.size)+' bytes)</p><img class="la-preview" alt="Temporary local image preview" src="'+e(this.preview.url)+'">':'<p class="la-note">'+e(t('previewEmpty'))+'</p>')+'</section>';
  if(this.section==='reports')return '<section class="la-card">'+header('reports')+'<p class="la-warning">'+e(t('reportPlanned'))+'</p><p>'+e(t('noApproval'))+'</p></section>';
  return '<section class="la-card">'+header('history')+this.table(['Revision','Action','Time','Evidence ID'],p.audit.map(a=>[a.revision,a.action,a.at,a.recordId||'']))+'</section>';
 }
 form(kind){const e=v=>this.e(v),t=k=>this.t(k),begin='<form class="la-form" data-form="'+e(kind)+'">',end='<div class="wide la-actions"><button type="submit" class="la-btn primary">'+e(t('submit'))+'</button></div></form>';
  let body='';
  if(kind==='new'){
   body+=this.field('style',true)+this.field('colour',true)+this.field('size',true);
   body+=this.select('itemType',[['label','Label'],['care-label','Care Label'],['barcode','Barcode'],['print','Print'],['embroidery','Embroidery'],['other','Other']]);
   body+=this.field('placement',true)+this.field('sourceRef',true,'text',true);
  }else if(kind==='add-revision'){
   body+=this.field('artworkRef',true)+this.field('sourceDate',true,'date')+this.field('sourceRef',true,'text',true);
   body+=this.field('width')+this.field('height')+this.select('unit',[['mm','mm'],['cm','cm'],['in','in']]);
   body+=this.field('dimensionSourceRef',false,'text',true)+this.field('method')+this.field('colourRef');
   body+=this.field('repeatCount')+this.field('repeatSourceRef',false,'text',true);
   body+=this.textarea('washCareText')+this.textarea('fiberText')+this.textarea('countryText')+this.field('contentSourceRef',false,'text',true);
   body+=this.select('symbology',[['','No barcode'],['gtin-8','GTIN-8'],['upc-a','UPC-A'],['ean-13','EAN-13'],['gtin-14','GTIN-14']]);
   body+=this.field('barcodeValue')+this.field('barcodeSourceRef',false,'text',true)+this.textarea('notes');
  }else{
   const revisions=this.current?.revisions||[];
   if(!revisions.length)throw Error('Create a sourced artwork revision first');
   body+=this.select('revisionId',revisions.map(x=>[x.id,'Version '+x.number+' / '+x.artworkRef]));
   body+=this.field('reviewer',true)+this.select('reviewerRole',[['internal','Internal'],['factory','Factory'],['buyer','Buyer (source claim)']]);
   body+=this.field('reviewDate',true,'date')+this.field('sourceRef',true,'text',true);
   if(kind==='add-comment')body+=this.textarea('comment');
   else if(kind==='add-decision'){
    body+=this.select('decision',[['needs-information','Needs Information'],['changes-required','Changes Required'],['internal-reviewed','Internal Reviewed (NOT buyer approval)'],['buyer-approval-evidence-recorded','Buyer approval EVIDENCE recorded (NOT independently verified)']],true);
    body+=this.field('authorityRef',false,'text',true);
   }
  }
  const label=({new:'new','add-revision':'addRevision','add-comment':'addComment','add-decision':'addDecision'})[kind]||'new';
  this.showModal(this.t(label),begin+body+end);
 }
 submit(form){const fd=new FormData(form),get=k=>String(fd.get(k)??'').trim();const kind=form.dataset.form;
  try{
   if(kind==='new'){
    const p=this.E.create({style:get('style'),colour:get('colour'),size:get('size'),itemType:get('itemType'),placement:get('placement'),sourceRef:get('sourceRef')});
    const a=this.E.validate(p);if(!a.ok)throw Error(a.errors.join('; '));this.store.save(p);this.current=p;this.section='summary';
   }else{
    if(!this.current||this.current.mode==='practice')throw Error('Practice is read only');let next;
    if(kind==='add-revision'){
     const spec={width:get('width'),height:get('height'),unit:get('unit'),dimensionSourceRef:get('dimensionSourceRef'),
      method:get('method'),colourRef:get('colourRef'),washCareText:get('washCareText'),fiberText:get('fiberText'),
      countryText:get('countryText'),contentSourceRef:get('contentSourceRef')};
     if(get('repeatCount')){spec.repeatCount=Number(get('repeatCount'));spec.repeatSourceRef=get('repeatSourceRef');}
     if(get('symbology'))spec.barcode={symbology:get('symbology'),value:get('barcodeValue'),sourceRef:get('barcodeSourceRef')};
     next=this.E.appendRevision(this.current,{id:this.E.id('AR-REV'),sourceDate:get('sourceDate'),artworkRef:get('artworkRef'),
      sourceRef:get('sourceRef'),notes:get('notes'),spec});this.section='revisions';
    }else if(kind==='add-comment'){
     next=this.D.append(this.current,'comment',{id:this.E.id('AR-COM'),revisionId:get('revisionId'),reviewer:get('reviewer'),
      reviewerRole:get('reviewerRole'),reviewDate:get('reviewDate'),sourceRef:get('sourceRef'),comment:get('comment')});this.section='reviews';
    }else if(kind==='add-decision'){
     next=this.D.append(this.current,'decision',{id:this.E.id('AR-DEC'),revisionId:get('revisionId'),reviewer:get('reviewer'),
      reviewerRole:get('reviewerRole'),reviewDate:get('reviewDate'),sourceRef:get('sourceRef'),decision:get('decision'),authorityRef:get('authorityRef')});this.section='reviews';
    }else throw Error('Unsupported artwork form');
    this.store.save(next);this.current=next;
   }
   this.dialog.close();this.render();
  }catch(err){let alert=form.querySelector('[role=alert]');if(!alert){alert=document.createElement('p');alert.className='wide la-warning';alert.setAttribute('role','alert');form.prepend(alert);}alert.textContent=err.message;}
 }
}
root.VesaArtworkWorkspace=ArtworkWorkspace;
})(typeof globalThis!=='undefined'?globalThis:this);
