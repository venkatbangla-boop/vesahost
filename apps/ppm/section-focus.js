/*
 * PPM G3 task-first mobile navigation. Presentation state only.
 * No PPM record, checkpoint IDs, GO/HOLD, evidence, signatures,
 * storage, language data or print/export owners are altered here.
 *
 * All 168 source checkpoints remain mounted in the DOM. On phone widths the
 * active editor initially shows one work section at a time, with an explicit
 * "All sections" override. Selecting a normal section chip updates the
 * presentation before the existing PPM click handler scrolls to its target.
 * Search, filters and "next unreviewed" always restore every section.
 */
(function(){
  'use strict';
  const root=document.getElementById('sectionsRoot');
  const nav=document.getElementById('sectionNav');
  const holder=nav?.closest('.section-nav-wrap');
  if(!root||!nav||!holder)return;

  const mobile=window.matchMedia('(max-width: 767px)');
  const labels={
    en:{all:'All sections',focus:'Focus section',hint:'Change sections above, or show the full checklist'},
    bn:{all:'সব বিভাগ',focus:'একটি বিভাগ',hint:'উপরে বিভাগ বেছে নিন অথবা সম্পূর্ণ তালিকা দেখুন'},
    hi:{all:'सभी सेक्शन',focus:'एक सेक्शन',hint:'ऊपर सेक्शन चुनें या पूरी चेकलिस्ट देखें'},
    ta:{all:'அனைத்து பகுதிகள்',focus:'ஒரு பகுதி',hint:'மேலே பகுதியைத் தேர்ந்தெடுக்கவும் அல்லது முழுப் பட்டியலைப் பார்க்கவும்'}
  };
  const button=document.createElement('button');
  button.id='ppmSectionExpand';
  button.type='button';
  button.className='ppm-section-expand';
  button.hidden=true;
  button.setAttribute('aria-controls','sectionsRoot');
  holder.appendChild(button);

  let selected=null, expanded=false,wasEditor=false;
  const sections=()=>Array.from(root.children).filter(el=>el.classList.contains('section-card'));
  function editorOpen(){return !document.body.classList.contains('at-home')&&sections().length>0;}
  function language(){
    const code=String(window.app?.locale?.language||document.documentElement.lang||'en').slice(0,2).toLowerCase();
    return labels[code]?code:'en';
  }
  function update(){
    const editor=editorOpen();
    if(!editor&&wasEditor){selected=null;expanded=false;}
    wasEditor=editor;
    const sectionList=sections();
    const small=mobile.matches&&editor;
    if(small&&!expanded&&sectionList.length&&!sectionList.some(el=>el.id===selected))
      selected=sectionList[0].id;
    const focused=Boolean(small&&!expanded&&selected);
    document.body.classList.toggle('ppm-section-focus',focused);
    sectionList.forEach(el=>{
      el.classList.toggle('ppm-section-selected',focused&&el.id===selected);
    });
    nav.querySelectorAll('button[data-target]').forEach(el=>{
      const chosen=focused&&el.dataset.target===selected;
      el.classList.toggle('ppm-section-selected',chosen);
      el.setAttribute('aria-pressed',String(chosen));
    });
    const copy=labels[language()];
    button.hidden=!small;
    button.textContent=expanded?copy.focus:copy.all;
    button.title=copy.hint;
    button.setAttribute('aria-label',button.textContent);
    button.setAttribute('aria-pressed',String(expanded));
  }
  button.addEventListener('click',()=>{
    if(!mobile.matches||!editorOpen())return;
    expanded=!expanded;
    update();
    if(!expanded&&selected){
      const section=document.getElementById(selected);
      section?.scrollIntoView({behavior:'auto',block:'start'});
    }
  });
  // Capture phase ensures the original PPM controller sees a visible target
  // before it executes its existing scrollIntoView handler in bubbling phase.
  document.addEventListener('click',event=>{
    if(!mobile.matches||!editorOpen())return;
    const target=event.target.closest?.('#sectionNav [data-target]');
    if(target){
      const destination=sectionListTarget(target.dataset.target);
      if(destination){selected=destination.id;expanded=false;}
      else expanded=true; // POM/Actions/Release/Sign live below the source sections
      update();
      return;
    }
    if(event.target.closest?.('[data-filter],[data-mode],#jumpUnreviewed,#jumpActions')){
      expanded=true;
      update();
    }
  },true);
  function sectionListTarget(id){
    return sections().find(el=>el.id===id)||null;
  }
  document.addEventListener('focusin',event=>{
    if(event.target?.id==='checkpointSearch'&&mobile.matches&&editorOpen()){
      expanded=true;
      update();
    }
  },true);
  // The original controller rebuilds checkpoint DOM for garment profiles,
  // languages and loaded saved records. Reapply only view classes after that
  // change, never mutating or replacing a single saved PPM checkpoint.
  const changed=new MutationObserver(()=>update());
  changed.observe(root,{childList:true});
  new MutationObserver(()=>update()).observe(document.body,{
    attributes:true,attributeFilter:['class']
  });
  new MutationObserver(()=>update()).observe(document.documentElement,{
    attributes:true,attributeFilter:['lang']
  });
  if(typeof mobile.addEventListener==='function')mobile.addEventListener('change',update);
  else mobile.addListener(update);
  update();
})();
