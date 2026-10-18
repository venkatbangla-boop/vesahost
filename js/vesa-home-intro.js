/* Play the complete 10-second VESA welcome film before revealing the already-loaded homepage. */
(function(){
  'use strict';
  const root=document.documentElement;
  const overlay=document.getElementById('vesaHomeIntro');
  const video=document.getElementById('vesaIntroVideo');
  const recovery=document.getElementById('vesaIntroRecovery');
  const action=document.getElementById('vesaIntroAction');
  const message=document.getElementById('vesaIntroMessage');
  if(!overlay||!video){root.classList.remove('vesa-intro-pending');return;}
  const background=[
    document.querySelector('header.site-header'),
    document.querySelector('main'),
    document.querySelector('footer.site-footer')
  ].filter(Boolean);
  background.forEach(node=>{node.inert=true;});
  let completed=false,recoveryMode='',safetyTimer;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.loop=false;
  video.playbackRate=1;

  function finish(){
    if(completed||!video.ended)return;
    completed=true;
    clearTimeout(safetyTimer);
    overlay.classList.remove('is-paused','is-error');
    overlay.classList.add('is-exiting');
    overlay.setAttribute('aria-hidden','true');
    // Keep the cover visible throughout its transition; removing the class early would flash.
    setTimeout(()=>{
      overlay.remove();
      root.classList.remove('vesa-intro-pending');
      background.forEach(node=>{node.inert=false;});
    },matchMedia('(prefers-reduced-motion: reduce)').matches?170:1000);
  }
  function showRecovery(mode){
    if(completed)return;
    recoveryMode=mode;
    overlay.classList.toggle('is-error',mode==='error');
    overlay.classList.toggle('is-paused',mode==='paused');
    if(recovery)recovery.hidden=false;
    if(message)message.textContent=mode==='error'
      ?'The welcome film could not load.'
      :'Tap to play the complete VESA welcome film.';
    if(action)action.textContent=mode==='error'?'Open VESA website':'Play welcome film';
  }
  function openSiteOnlyIfUnavailable(){
    if(completed)return;
    completed=true;
    clearTimeout(safetyTimer);
    overlay.remove();
    root.classList.remove('vesa-intro-pending');
    background.forEach(node=>{node.inert=false;});
  }
  function playFilm(){
    if(completed)return;
    const attempt=video.play();
    if(attempt&&typeof attempt.then==='function'){
      attempt.then(()=>{
        overlay.classList.remove('is-paused','is-error');
        recoveryMode='';
      }).catch(()=>showRecovery('paused'));
    }
  }
  if(action)action.addEventListener('click',()=>{
    if(recoveryMode==='error')openSiteOnlyIfUnavailable();
    else playFilm();
  });
  video.addEventListener('ended',finish);
  video.addEventListener('error',()=>showRecovery('error'));
  video.addEventListener('stalled',()=>{
    clearTimeout(safetyTimer);
    safetyTimer=setTimeout(()=>{
      if(!completed&&!video.ended&&video.readyState<3)showRecovery('paused');
    },10000);
  });
  video.addEventListener('playing',()=>{
    clearTimeout(safetyTimer);
    overlay.classList.remove('is-paused');
  });
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden&&!completed&&video.paused&&!video.ended&&recoveryMode!=='error')playFilm();
  });
  playFilm();
})();