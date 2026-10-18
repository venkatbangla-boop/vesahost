/* The original 10-second film must finish before the already-rendered homepage is revealed. */
(function(){
  'use strict';
  const root=document.documentElement;
  const overlay=document.getElementById('vesaHomeIntro');
  const video=document.getElementById('vesaIntroVideo');
  const recovery=document.getElementById('vesaIntroRecovery');
  const action=document.getElementById('vesaIntroAction');
  const message=document.getElementById('vesaIntroMessage');
  const sound=document.getElementById('vesaIntroSound');
  const soundIcon=document.getElementById('vesaIntroSoundIcon');
  const soundLabel=document.getElementById('vesaIntroSoundLabel');
  if(!overlay||!video){root.classList.remove('vesa-intro-pending');return;}
  const background=[document.querySelector('header.site-header'),document.querySelector('main'),document.querySelector('footer.site-footer')].filter(Boolean);
  background.forEach(node=>{node.inert=true;});
  let completed=false,recoveryMode='',safetyTimer;
  video.playsInline=true;
  video.loop=false;
  video.playbackRate=1;
  video.volume=.85;

  function syncSound(){
    const on=!video.muted&&video.volume>0;
    if(sound){
      sound.setAttribute('aria-label',on?'Mute welcome film':'Turn on welcome film music');
      sound.setAttribute('aria-pressed',String(on));
      sound.title=on?'Mute music':'Turn on music';
    }
    if(soundIcon)soundIcon.textContent=on?'🔊':'🔇';
    if(soundLabel)soundLabel.textContent=on?'Music On':'Music Off';
  }
  function release(){
    overlay.remove();root.classList.remove('vesa-intro-pending');
    background.forEach(node=>{node.inert=false;});
  }
  function finish(){
    if(completed||!video.ended)return;
    completed=true;clearTimeout(safetyTimer);
    overlay.classList.remove('is-paused','is-error');
    overlay.classList.add('is-exiting');
    overlay.setAttribute('aria-hidden','true');
    // Retain the very last frame through the fade to avoid revealing content too early.
    setTimeout(release,matchMedia('(prefers-reduced-motion: reduce)').matches?170:980);
  }
  function showRecovery(mode){
    if(completed)return;
    recoveryMode=mode;
    overlay.classList.toggle('is-error',mode==='error');
    overlay.classList.toggle('is-paused',mode==='paused');
    if(recovery)recovery.hidden=false;
    if(message)message.textContent=mode==='error'?'The welcome film could not load.':'Tap to continue playing the complete welcome film.';
    if(action)action.textContent=mode==='error'?'Open VESA website':'Play welcome film';
  }
  function openSiteOnlyIfUnavailable(){
    if(completed)return;
    completed=true;clearTimeout(safetyTimer);
    release();
  }
  function playWithMuteFallback(){
    if(completed)return;
    const attempt=video.play();
    if(!attempt||typeof attempt.then!=='function')return;
    attempt.then(()=>{
      overlay.classList.remove('is-paused','is-error');recoveryMode='';
      syncSound();
    }).catch(()=>{
      // Chrome / Safari block audible autoplay without a user gesture.
      // Always prioritize starting the film immediately, muted if necessary.
      video.muted=true;syncSound();
      const retry=video.play();
      if(retry&&typeof retry.then==='function'){
        retry.then(()=>{overlay.classList.remove('is-paused','is-error');recoveryMode='';})
          .catch(()=>showRecovery('paused'));
      }
    });
  }
  if(sound)sound.addEventListener('click',()=>{
    if(completed)return;
    // This direct user gesture can enable audio even when audible autoplay was blocked.
    video.muted=!video.muted;
    syncSound();
    if(video.paused&&!video.ended)playWithMuteFallback();
  });
  if(action)action.addEventListener('click',()=>{
    if(recoveryMode==='error')openSiteOnlyIfUnavailable();
    else playWithMuteFallback();
  });
  video.addEventListener('volumechange',syncSound);
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
    overlay.classList.add('is-playing');
  });
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden&&!completed&&video.paused&&!video.ended&&recoveryMode!=='error')playWithMuteFallback();
  });
  // Prefer soundtrack ON where browsers allow it; immediately fall back to muted playback otherwise.
  video.muted=false;
  syncSound();
  playWithMuteFallback();
})();