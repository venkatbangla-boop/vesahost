
const navToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
function closeMobileNav(){
  if(navLinks){ navLinks.classList.remove('open'); }
  document.body.classList.remove('mobile-nav-open');
  if(navToggle){ navToggle.setAttribute('aria-expanded','false'); }
}
if(navToggle && navLinks){
  navToggle.setAttribute('aria-expanded','false');
  navToggle.addEventListener('click',()=>{
    const open = navLinks.classList.toggle('open');
    document.body.classList.toggle('mobile-nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

document.querySelectorAll('.nav-links a').forEach(link=>{
  link.addEventListener('click', closeMobileNav);
});
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeMobileNav(); });

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
    }
  })
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const counterObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target,10);
    let start = 0;
    const duration = 1500;
    const step = ts => {
      if(!el._start) el._start = ts;
      const progress = Math.min((ts - el._start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value + (el.dataset.suffix || '');
      if(progress < 1){requestAnimationFrame(step)}
      else {el.textContent = target + (el.dataset.suffix || '')}
    };
    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  })
},{threshold:.45});
document.querySelectorAll('.counter').forEach(el=>counterObserver.observe(el));

const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }
  })
},{threshold:.45});
sections.forEach(sec=>sectionObserver.observe(sec));


// V16 cinematic motion layer
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const doc = document.documentElement;
  const progress = document.querySelector('.scroll-progress');

  function updateProgress(){
    if(!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  if(!prefersReduced && !isCoarse){
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let x = window.innerWidth/2, y = window.innerHeight/2;
    let rx = x, ry = y;
    document.body.classList.add('cursor-ready');
    window.addEventListener('pointermove', e => { x=e.clientX; y=e.clientY; }, {passive:true});
    function cursorLoop(){
      rx += (x-rx)*0.18;
      ry += (y-ry)*0.18;
      if(dot){ dot.style.left=x+'px'; dot.style.top=y+'px'; }
      if(ring){ ring.style.left=rx+'px'; ring.style.top=ry+'px'; }
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);
    document.querySelectorAll('a,button,.portfolio-card,.country-card,.case-card,.insight-card,.why,.step').forEach(el=>{
      el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('.btn').forEach(btn=>{
      btn.addEventListener('pointermove', e=>{
        const r=btn.getBoundingClientRect();
        btn.style.setProperty('--btn-x', ((e.clientX-r.left)/r.width*100)+'%');
        btn.style.setProperty('--btn-y', ((e.clientY-r.top)/r.height*100)+'%');
      });
      btn.addEventListener('pointerleave',()=>{btn.style.transform='';});
    });

    const tilt = document.querySelector('.hero-card');
    if(tilt){
      tilt.addEventListener('pointermove', e=>{
        const r=tilt.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width;
        const py=(e.clientY-r.top)/r.height;
        const rotateY=(px-.5)*-8;
        const rotateX=(py-.5)*8;
        tilt.style.transform=`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        tilt.style.setProperty('--mx', (px*100)+'%');
        tilt.style.setProperty('--my', (py*100)+'%');
      });
      tilt.addEventListener('pointerleave',()=>{
        tilt.style.transform='rotateX(0) rotateY(0) scale(1)';
        tilt.style.setProperty('--mx','50%');
        tilt.style.setProperty('--my','50%');
      });
    }
  }

  if(!prefersReduced){
    const canvas = document.getElementById('ambient-canvas');
    if(canvas){
      const ctx = canvas.getContext('2d');
      let w,h,dpr,particles=[];
      let mouse={x:-9999,y:-9999};
      const count = Math.min(70, Math.max(28, Math.floor(window.innerWidth/22)));
      function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.width = Math.floor(window.innerWidth*dpr);
        h = canvas.height = Math.floor(window.innerHeight*dpr);
        canvas.style.width = window.innerWidth+'px';
        canvas.style.height = window.innerHeight+'px';
        particles = Array.from({length:count},()=>({
          x:Math.random()*w,
          y:Math.random()*h,
          vx:(Math.random()-.5)*0.18*dpr,
          vy:(Math.random()-.5)*0.18*dpr,
          r:(Math.random()*1.6+0.7)*dpr
        }));
      }
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', e=>{mouse.x=e.clientX*dpr; mouse.y=e.clientY*dpr;}, {passive:true});
      resize();
      function loop(){
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle='rgba(199,161,90,.58)';
        for(const p of particles){
          p.x += p.vx; p.y += p.vy;
          if(p.x<0||p.x>w) p.vx *= -1;
          if(p.y<0||p.y>h) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        }
        for(let i=0;i<particles.length;i++){
          for(let j=i+1;j<particles.length;j++){
            const a=particles[i], b=particles[j];
            const dx=a.x-b.x, dy=a.y-b.y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<150*dpr){
              ctx.strokeStyle=`rgba(11,31,58,${(1-dist/(150*dpr))*0.10})`;
              ctx.lineWidth=.8*dpr;
              ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
            }
          }
          const p=particles[i];
          const mdx=p.x-mouse.x, mdy=p.y-mouse.y;
          const md=Math.sqrt(mdx*mdx+mdy*mdy);
          if(md<210*dpr){
            ctx.strokeStyle=`rgba(199,161,90,${(1-md/(210*dpr))*0.24})`;
            ctx.lineWidth=1*dpr;
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke();
          }
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    }
  }
})();


// V20 panel spotlight variables and video fallback
(function(){
  const spotlightItems = document.querySelectorAll('.panel,.portfolio-card,.country-card,.case-card,.insight-card,.why,.step,.ai-item');
  spotlightItems.forEach(el=>{
    el.addEventListener('pointermove', e=>{
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', ((e.clientX-r.left)/r.width*100)+'%');
      el.style.setProperty('--mouse-y', ((e.clientY-r.top)/r.height*100)+'%');
    }, {passive:true});
  });
  const heroVideo = document.querySelector('.hero-video');
  if(heroVideo){
    heroVideo.addEventListener('error', ()=>{
      const poster = heroVideo.getAttribute('poster');
      if(!poster) return;
      const img = document.createElement('img');
      img.className = heroVideo.className.replace('hero-video','').trim() || 'hero-image';
      img.src = poster;
      img.alt = 'Premium apparel sourcing poster image';
      heroVideo.replaceWith(img);
    });
  }
})();

// V30 compact sticky header and premium nav movement
(function(){
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav-premium');
  const links = document.querySelectorAll('.nav-premium a');
  function syncHeader(){
    document.body.classList.toggle('header-scrolled', window.scrollY > 18);
  }
  window.addEventListener('scroll', syncHeader, {passive:true});
  syncHeader();
  links.forEach(link=>{
    link.addEventListener('click', ()=>{
      if(nav){nav.classList.remove('open')}
      if(navToggle){navToggle.setAttribute('aria-expanded','false')}
      document.body.classList.remove('mobile-nav-open');
    });
  });
})();
