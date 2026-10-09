(function(){
  'use strict';

  const STORE_KEY='vesa.appcentre.auth.v1';
  const SESSION_KEY='vesa.appcentre.session.v1';
  const DEFAULT_ADMIN='admin@vesa';
  const DEMO_PASSWORD='vesa';
  const DEMO_USERS=[
    {email:'admin@vesa',name:'VESA Admin',role:'admin',blocked:false,demo:true,createdAt:'2026-10-09T00:00:00.000Z'},
    {email:'user@vesa',name:'VESA User',role:'user',blocked:false,demo:true,createdAt:'2026-10-09T00:00:00.000Z'}
  ];

  const cleanEmail=value=>String(value||'').trim().toLowerCase();
  const safeText=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const userKey=email=>cleanEmail(email).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'user';
  const now=()=>new Date().toISOString();

  function normalizeStore(store){
    const base=store&&typeof store==='object'?store:{};
    const saved=Array.isArray(base.users)?base.users:[];
    const savedWithoutDemo=saved.filter(u=>!DEMO_USERS.some(d=>d.email===cleanEmail(u.email)));
    return {createdAt:base.createdAt||now(),users:[...DEMO_USERS,...savedWithoutDemo],events:Array.isArray(base.events)?base.events:[],apps:base.apps||{ppm:true,aql:true}};
  }
  function readStore(){
    try{return normalizeStore(JSON.parse(localStorage.getItem(STORE_KEY)||'null'));}catch{return normalizeStore(null);}
  }
  function writeStore(store){
    const normalized=normalizeStore(store);
    localStorage.setItem(STORE_KEY,JSON.stringify({...normalized,users:normalized.users.filter(u=>!u.demo)}));
  }
  function session(){
    try{
      const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
      if(!s||!s.email||!s.expiresAt)return null;
      if(Date.now()>Date.parse(s.expiresAt)){logout('expired');return null;}
      return s;
    }catch{return null;}
  }
  function writeEvent(type,email,detail=''){
    const store=readStore();
    store.events.unshift({type,email:cleanEmail(email),detail,at:now(),agent:navigator.userAgent.slice(0,180)});
    store.events=store.events.slice(0,500);
    writeStore(store);
  }
  async function digest(text,salt){
    const data=new TextEncoder().encode(`${salt}:${text}`);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function salt(){
    const bytes=new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function createUser({email,name,password,role='user'}){
    const id=cleanEmail(email);
    if(!id)throw Error('Enter a user ID or email.');
    if(DEMO_USERS.some(u=>u.email===id))throw Error('This built-in user already exists.');
    if(String(password||'').length<6)throw Error('Password must be at least 6 characters.');
    const store=readStore();
    if(store.users.some(u=>u.email===id))throw Error('This user already exists.');
    const s=salt();
    store.users.push({email:id,name:String(name||id).trim(),role,blocked:false,salt:s,passwordHash:await digest(password,s),createdAt:now(),reset:false});
    writeStore(store);
    writeEvent('user-created',id,role);
  }
  async function setupAdmin(){return true;}
  async function login(email,password){
    const id=cleanEmail(email);
    const store=readStore();
    const user=store.users.find(u=>u.email===id);
    if(!user){writeEvent('login-failed',id,'unknown-user');throw Error('User ID or password is not correct.');}
    if(user.blocked){writeEvent('login-failed',id,'blocked');throw Error('This user is blocked.');}
    const ok=user.demo?String(password||'')===DEMO_PASSWORD:await digest(password,user.salt)===user.passwordHash;
    if(!ok){writeEvent('login-failed',id,'bad-password');throw Error('User ID or password is not correct.');}
    const s={email:user.email,name:user.name,role:user.role,userKey:userKey(user.email),loginAt:now(),expiresAt:new Date(Date.now()+8*60*60*1000).toISOString()};
    localStorage.setItem(SESSION_KEY,JSON.stringify(s));
    writeEvent('login-success',id,user.demo?'built-in-user':'local-user');
    return s;
  }
  function logout(reason='logout'){
    let s=null;
    try{s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{}
    if(s?.email)writeEvent(reason,s.email);
    localStorage.removeItem(SESSION_KEY);
  }
  function requireAuth(){
    const s=session();
    if(s)return s;
    const next=encodeURIComponent(location.pathname+location.search+location.hash);
    location.replace(`/login/?next=${next}`);
    return null;
  }
  function requireAdmin(){
    const s=requireAuth();
    if(!s)return null;
    if(s.role!=='admin'){
      location.replace('/apps/');
      return null;
    }
    return s;
  }
  function isSetupComplete(){return true;}
  function currentUserKey(){return session()?.userKey||'public';}
  function renderUserBar(target=document.body){
    ensureBarStyle();
    const s=session();
    if(!s)return;
    const bar=document.createElement('div');
    bar.className='app-user-bar';
    const appCentre=globalThis.VesaPrefs?.label?.('appCentre')||'App Centre';
    const admin=globalThis.VesaPrefs?.label?.('admin')||'Admin';
    const logoutText=globalThis.VesaPrefs?.label?.('logout')||'Logout';
    const displayName=String(s.name||s.email).replace(/\bDemo\s+/ig,'').replace(/\s+Demo\b/ig,'').trim();
    bar.innerHTML=`<a class="auth-bar-brand" href="/" aria-label="VESA home"><img src="/assets/vesa-logo-black.png" alt="VESA"></a><span class="auth-bar-spacer"></span><span class="auth-bar-user">${safeText(displayName||s.email)}</span><a href="/apps/">${safeText(appCentre)}</a>${s.role==='admin'?`<a href="/admin/">${safeText(admin)}</a>`:''}<button type="button">${safeText(logoutText)}</button>`;
    bar.querySelector('button').onclick=()=>{logout();location.href='/login/';};
    target.prepend(bar);
  }
  function ensureBarStyle(){
    if(document.getElementById('vesa-auth-bar-style'))return;
    const style=document.createElement('style');
    style.id='vesa-auth-bar-style';
    style.textContent='.app-user-bar{position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:12px;padding:10px 18px;background:rgba(248,244,237,.96);color:#071A35;border-bottom:1px solid rgba(7,26,53,.08);box-shadow:0 18px 45px rgba(7,26,53,.08);backdrop-filter:blur(18px);font:800 13px/1.3 Inter,system-ui,-apple-system,Segoe UI,sans-serif}.app-user-bar .auth-bar-brand{display:flex;align-items:center;border:0;background:transparent;padding:0}.app-user-bar .auth-bar-brand img{width:142px;max-height:52px;object-fit:contain}.app-user-bar .auth-bar-spacer{flex:1}.app-user-bar .auth-bar-user{white-space:nowrap}.app-user-bar a:not(.auth-bar-brand),.app-user-bar button{color:#071A35;border:1px solid rgba(7,26,53,.16);background:rgba(255,255,255,.54);border-radius:999px;padding:9px 13px;font:inherit;text-decoration:none;cursor:pointer}.app-user-bar button{background:#071A35;color:#fff;border-color:#071A35}@media(max-width:700px){.app-user-bar{position:relative;justify-content:flex-start;flex-wrap:wrap}.app-user-bar .auth-bar-spacer{display:none}.app-user-bar .auth-bar-brand img{width:120px}}';
    document.head.append(style);
  }

  window.VesaAuth={STORE_KEY,SESSION_KEY,DEFAULT_ADMIN,DEMO_USERS,DEMO_PASSWORD,safeText,readStore,writeStore,session,setupAdmin,login,logout,requireAuth,requireAdmin,isSetupComplete,createUser,userKey:currentUserKey,writeEvent,renderUserBar};
  const script=document.currentScript;
  if(script?.dataset.authGuard==='app'){
    requireAuth();
    if(script.dataset.authBar==='true')window.addEventListener('DOMContentLoaded',()=>renderUserBar());
  }
})();
