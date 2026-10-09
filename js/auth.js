(function(){
  'use strict';

  const STORE_KEY='vesa.appcentre.auth.v1';
  const SESSION_KEY='vesa.appcentre.session.v1';
  const DEFAULT_ADMIN='info@vesaent.com';

  const cleanEmail=value=>String(value||'').trim().toLowerCase();
  const safeText=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const userKey=email=>cleanEmail(email).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'user';
  const now=()=>new Date().toISOString();

  function readStore(){
    try{
      const store=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
      if(store&&Array.isArray(store.users))return store;
    }catch{}
    return {createdAt:now(),users:[],events:[],apps:{ppm:true,aql:true}};
  }
  function writeStore(store){
    localStorage.setItem(STORE_KEY,JSON.stringify(store));
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
    if(String(password||'').length<6)throw Error('Password must be at least 6 characters.');
    const store=readStore();
    if(store.users.some(u=>u.email===id))throw Error('This user already exists.');
    const s=salt();
    store.users.push({email:id,name:String(name||id).trim(),role,blocked:false,salt:s,passwordHash:await digest(password,s),createdAt:now(),reset:false});
    writeStore(store);
    writeEvent('user-created',id,role);
  }
  async function setupAdmin(password){
    const store=readStore();
    if(store.users.length)throw Error('Setup is already complete.');
    await createUser({email:DEFAULT_ADMIN,name:'VESA Admin',password,role:'admin'});
  }
  async function login(email,password){
    const id=cleanEmail(email);
    const store=readStore();
    const user=store.users.find(u=>u.email===id);
    if(!user){writeEvent('login-failed',id,'unknown-user');throw Error('User ID or password is not correct.');}
    if(user.blocked){writeEvent('login-failed',id,'blocked');throw Error('This user is blocked.');}
    const ok=await digest(password,user.salt)===user.passwordHash;
    if(!ok){writeEvent('login-failed',id,'bad-password');throw Error('User ID or password is not correct.');}
    const s={email:user.email,name:user.name,role:user.role,userKey:userKey(user.email),loginAt:now(),expiresAt:new Date(Date.now()+8*60*60*1000).toISOString()};
    localStorage.setItem(SESSION_KEY,JSON.stringify(s));
    writeEvent('login-success',id);
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
  function isSetupComplete(){
    return readStore().users.length>0;
  }
  function currentUserKey(){
    return session()?.userKey||'public';
  }
  function renderUserBar(target=document.body){
    ensureBarStyle();
    const s=session();
    if(!s)return;
    const bar=document.createElement('div');
    bar.className='app-user-bar';
    bar.innerHTML=`<span>${safeText(s.name||s.email)}</span><a href="/apps/">App Centre</a>${s.role==='admin'?'<a href="/admin/">Admin</a>':''}<button type="button">Logout</button>`;
    bar.querySelector('button').onclick=()=>{logout();location.href='/login/';};
    target.prepend(bar);
  }
  function ensureBarStyle(){
    if(document.getElementById('vesa-auth-bar-style'))return;
    const style=document.createElement('style');
    style.id='vesa-auth-bar-style';
    style.textContent='.app-user-bar{position:sticky;top:0;z-index:9999;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:9px 14px;background:#071A35;color:#fff;font:700 13px/1.3 system-ui,-apple-system,Segoe UI,sans-serif}.app-user-bar a,.app-user-bar button{color:#fff;border:1px solid rgba(255,255,255,.3);background:transparent;border-radius:999px;padding:7px 11px;font:inherit;text-decoration:none;cursor:pointer}@media(max-width:700px){.app-user-bar{position:relative;justify-content:flex-start;flex-wrap:wrap}}';
    document.head.append(style);
  }

  window.VesaAuth={STORE_KEY,SESSION_KEY,DEFAULT_ADMIN,safeText,readStore,writeStore,session,setupAdmin,login,logout,requireAuth,requireAdmin,isSetupComplete,createUser,userKey:currentUserKey,writeEvent,renderUserBar};
  const script=document.currentScript;
  if(script?.dataset.authGuard==='app'){
    requireAuth();
    if(script.dataset.authBar==='true')window.addEventListener('DOMContentLoaded',()=>renderUserBar());
  }
})();
