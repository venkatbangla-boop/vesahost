
const navToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if(navToggle){
  navToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));
}

document.querySelectorAll('.nav-links a').forEach(link=>{
  link.addEventListener('click',()=>navLinks.classList.remove('open'));
});

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
