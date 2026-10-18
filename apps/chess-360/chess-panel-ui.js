/**
 * Chess Beast 360 — board-first sidebars (no external dependency).
 *
 * Keeps all original IDs, listeners and saved-data formats intact.
 * Secondary coach/analysis modules are moved into one explicit details drawer;
 * visual DOM nodes are reparented, never cloned.
 */
(function(){
  'use strict';
  const $=(id)=>document.getElementById(id);
  const body=document.body;
  const panel=$('rightSidebarDrawer');
  const left=$('btnHideLeftPanel');
  const reopen=$('btnShowLeftPanel');
  const mobile=$('btnMobileMore');
  const rightToggle=$('btnToggleRightDrawer');
  const rightHandle=$('btnEdgeDrawerHandle');
  const leftKey='chess_beast_left_collapsed_v1';
  const rightKey='chess_beast_right_collapsed_v1';
  const safeGet=(key)=>{try{return localStorage.getItem(key)==='true';}catch{return false;}};
  const safeSet=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
  const afterLayout=()=>requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));

  // Repair layout without replacing game data or action nodes.
  const gameTab=$('tabPlay');
  const moveList=$('movesScrollBox')?.closest('.form-group');
  const optional=document.createElement('details');
  optional.id='chessLearningDetails';
  optional.className='chess-learning-details';
  const summary=document.createElement('summary');
  summary.textContent='Learning & advanced analysis';
  summary.title='Open coach, advantage graph, opening practice and optional game modes';
  const extra=document.createElement('div');
  extra.className='chess-learning-content';
  const extras=[
    'mainCategorySwitcher','.universal-tier-strip','#chessWinningIdeaCard',
    '#playHubQuickCards','.career-bar','#companionPetCard',
    '.coach-card','.production-matrix','.telemetry-grid','.graph-wrap'
  ];
  if(gameTab&&moveList&&gameTab.contains(moveList)){
    extras.forEach(selector=>{
      const node=selector.startsWith('#')||selector.startsWith('.')?
        gameTab.querySelector(selector):$(selector);
      if(node)extra.appendChild(node);
    });
    optional.append(summary,extra);
    gameTab.append(moveList,optional);
    moveList.classList.add('chess-primary-history');
    const status=gameTab.querySelector('.status-banner');
    if(status)status.classList.add('chess-primary-status');
    gameTab.classList.add('chess-game-reworked');
  }
  function syncLearning(){
    const focused=body.classList.contains('chess-quiet-mode');
    if(gameTab?.contains(optional))optional.open=!focused;
  }
  syncLearning();

  // Only four readable primary action buttons; niche study tools are folded away.
  const footer=panel?.querySelector('.right-dock-footer');
  const primary=footer?.querySelector('.board-controls');
  const auxiliary=footer?.querySelector('.vision-controls');
  if(footer&&primary&&auxiliary){
    const assess=$('btnAnalyzeNow');
    const advanced=document.createElement('details');
    advanced.id='chessMoreTools';
    advanced.className='chess-more-tools';
    const label=document.createElement('summary');
    label.textContent='More tools';
    label.setAttribute('aria-label','Expand or collapse additional analysis and drawing tools');
    const content=document.createElement('div');
    content.className='chess-more-tools-content';
    if(assess){
      assess.classList.add('chess-assess-tool');
      content.appendChild(assess);
    }
    content.appendChild(auxiliary);
    advanced.append(label,content);
    footer.appendChild(advanced);
  }

  const tabs=[...panel.querySelectorAll('.tabs-header [data-tab]')];
  const view=$('tabLevels')?.querySelector('[data-tab="tabKnowledge"]');
  const refreshTabs=()=>{
    const active=panel.querySelector('.tab-content.active')?.id;
    tabs.forEach(tab=>{
      const on=tab.dataset.tab===active || (active==='tabKnowledge' && tab.dataset.tab==='tabLevels');
      tab.classList.toggle('active',on);
      tab.setAttribute('aria-selected',String(on));
      tab.tabIndex=on?0:-1;
    });
    if(view)view.setAttribute('aria-current',active==='tabKnowledge'?'page':'false');
  };
  tabs.forEach(tab=>{
    tab.setAttribute('role','tab');
    tab.addEventListener('click',()=>{refreshTabs();panel?.querySelector('.tab-content.active')?.scrollTo({top:0});});
    tab.addEventListener('keydown',event=>{
      if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft'&&event.key!=='Home'&&event.key!=='End')return;
      event.preventDefault();
      const ix=tabs.indexOf(tab);
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
        (ix+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      tabs[next].focus();tabs[next].click();
    });
  });
  view?.addEventListener('click',refreshTabs);
  panel?.setAttribute('aria-label','Chess game, settings and saved matches');
  refreshTabs();

  function updateLeft(collapsed,save=true){
    body.classList.toggle('chess-left-hidden',collapsed);
    const header=document.querySelector('.topbar');
    if(header)header.setAttribute('aria-hidden',String(collapsed));
    if(reopen){reopen.hidden=!collapsed;reopen.setAttribute('aria-expanded',String(!collapsed));}
    if(left)left.setAttribute('aria-expanded',String(!collapsed));
    if(save)safeSet(leftKey,collapsed);
    afterLayout();
  }
  left?.addEventListener('click',()=>updateLeft(true));
  reopen?.addEventListener('click',()=>updateLeft(false));
  function syncRight(){
    const collapsed=body.classList.contains('drawer-collapsed');
    if(panel){panel.setAttribute('aria-hidden',String(collapsed));panel.inert=collapsed;}
    if(rightHandle){rightHandle.setAttribute('aria-expanded',String(!collapsed));rightHandle.setAttribute('aria-label',collapsed?'Show game panel':'Hide game panel');}
    if(rightToggle)rightToggle.setAttribute('aria-expanded',String(!collapsed));
    safeSet(rightKey,collapsed);
  }
  [rightToggle,rightHandle,$('btnCollapseDrawerInside')].forEach(btn=>btn?.addEventListener('click',syncRight));
  if(safeGet(rightKey)&&!body.classList.contains('drawer-collapsed'))rightToggle?.click();
  syncRight();
  if(safeGet(leftKey))updateLeft(true,false);

  mobile?.addEventListener('click',()=>{
    const open=body.classList.toggle('chess-mobile-menu-open');
    mobile.setAttribute('aria-expanded',String(open));
    mobile.textContent=open?'✕ Close tools':'☰ More tools';
    if(open)document.querySelector('.utility-ribbon')?.scrollIntoView({block:'nearest'});
    afterLayout();
  });

  // An explicit, optional learning mode exposes detail panels; no clutter by default.
  const mutation=new MutationObserver(()=>{
    syncLearning();
    refreshTabs();
  });
  mutation.observe(body,{attributes:true,attributeFilter:['class']});
  $('btnQuietMode')?.addEventListener('click',syncLearning);
  $('btnApplyCustomize')?.addEventListener('click',syncLearning);
  $('btnCustomizeDefaults')?.addEventListener('click',()=>{});
  // Recenter after small-screen orientation changes without changing saved camera angle.
  window.addEventListener('orientationchange',afterLayout);
  window.__chessPanelDiagnostics=()=>({
    leftHidden:body.classList.contains('chess-left-hidden'),
    rightHidden:body.classList.contains('drawer-collapsed'),
    mobileMenuOpen:body.classList.contains('chess-mobile-menu-open'),
    learningOpen:optional.open,
    tabs:tabs.map(t=>({name:t.textContent.trim(),selected:t.getAttribute('aria-selected')})),
    moveHistoryUnderGame:!!(moveList&&gameTab&&moveList.parentElement===gameTab),
    extraToolsFolded:!!$('chessMoreTools')&&!$('chessMoreTools').open
  });
})();
