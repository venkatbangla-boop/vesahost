/** Final One VESA transition review across platform pages and representative app states. */
const assert=require('assert/strict');
const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const output=path.join(root,'output','playwright');
const widths=[390,768,1280];
const menuOrder=['Home','File','Edit','View','Tools','Help'];
const session={email:'qa@vesaent.com',name:'QA User',role:'admin',userKey:'qa-vesaent-com',loginAt:'2026-10-13T00:00:00.000Z',expiresAt:'2099-01-01T00:00:00.000Z'};
const store={version:1,users:[{email:'qa@vesaent.com',name:'QA User',role:'admin',salt:'fixture',passwordHash:'fixture',blocked:false,demo:true,createdAt:'2026-10-13T00:00:00.000Z'}],events:[]};
const states=[
  {id:'login',route:'/login/',public:true,ready:()=>!!document.querySelector('#loginForm')},
  {id:'apps',route:'/apps/',name:'Workspaces',ready:()=>!!document.querySelector('#appCatalogue .app-tile')},
  {id:'admin',route:'/admin/',name:'Admin',ready:()=>!!document.querySelector('.admin-grid')},
  {id:'tna',route:'/apps/tna/',name:'VESA TNA 360',ready:()=>!!document.querySelector('#tnaMain')},
  {id:'ppm-editor',route:'/apps/ppm/',name:'Pre-Production Meeting',ready:()=>typeof app!=='undefined'&&document.body.classList.contains('at-home'),setup:async page=>{await page.locator('#homeScreen [data-command="new"]').click();await page.waitForFunction(()=>!document.body.classList.contains('at-home'));}},
  {id:'aql-inspection',route:'/apps/aql/',name:'Inspection Quality Suite',ready:()=>!!document.querySelector('#vesa-enter'),setup:async page=>{await page.locator('#vesa-enter').click();await page.waitForFunction(()=>!!window.__vesaApp&&!document.getElementById('app').hidden);await page.locator('[data-action="demo-menu"]').first().click();await page.locator('[data-action="demo"][data-kind="apparel"]').click();await page.waitForFunction(()=>window.__vesaApp?.p?.meta?.demo===true);}}
];
const mime=file=>({'.css':'text/css','.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream';

function server(){return http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://vesa.test').pathname);let file=path.resolve(root,`.${pathname}`);if(!file.startsWith(root+path.sep))return response.writeHead(403).end();try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');response.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});}

async function probe(browser,base,state,width){
  const context=await browser.newContext({viewport:{width,height:900}});
  if(!state.public)await context.addInitScript(({session,store})=>{localStorage.setItem('vesa.appcentre.session.v1',JSON.stringify(session));localStorage.setItem('vesa.appcentre.store.v1',JSON.stringify(store));},{session,store});
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
  await page.goto(`${base}${state.route}`,{waitUntil:'domcontentloaded'});await page.waitForFunction(state.ready,null,{timeout:30000});if(state.setup)await state.setup(page);
  const evidence=await page.evaluate(({isPublic})=>{
    const visible=node=>{const style=getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length};
    const shell=document.querySelector('.vesa-workspace'),label=shell?.querySelector('.vesa-workspace__app-label'),current=shell?.querySelector('.vesa-workspace__app-current');
    const sticky=['.vesa-workspace','.app-user-bar','.tna-commandbar','#fileMenu','.aql-release-menu','.topbar','.sidebar'].filter(selector=>{const node=document.querySelector(selector);return node&&visible(node)&&['sticky','fixed'].includes(getComputedStyle(node).position);});
    const boxes=shell?[...shell.querySelectorAll('.vesa-workspace__brand,.vesa-workspace__breadcrumb,.vesa-workspace__nav,.vesa-workspace__saved,.vesa-workspace__user-label,[data-vesa-user],[data-vesa-admin],[data-vesa-logout],[data-vesa-mobile-menu]')].filter(visible).map(node=>{const box=node.getBoundingClientRect();return {name:node.getAttribute('data-vesa-user')!==null?'settings':node.getAttribute('data-vesa-admin')!==null?'admin':node.getAttribute('data-vesa-logout')!==null?'logout':node.className,left:box.left,right:box.right};}):[];
    return {logos:[...document.querySelectorAll('img[alt*="VESA"],.vesa-workspace__brand img')].filter(visible).length,shells:document.querySelectorAll('.vesa-workspace').length,legacy:document.querySelectorAll('.app-user-bar').length,menus:shell?[...shell.querySelectorAll('[data-vesa-menu]')].map(node=>node.textContent.trim()):[],current:current?.textContent.trim(),title:current?.getAttribute('title'),label:{overflow:label?getComputedStyle(label).textOverflow:'',scroll:label?.scrollWidth||0,client:label?.clientWidth||0},boxes,sticky,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,public:isPublic};
  },{isPublic:!!state.public});
  assert.equal(evidence.logos,1,`${state.id}@${width}: one visible VESA logo`);
  assert.ok(evidence.documentWidth<=width+1&&evidence.bodyWidth<=width+1,`${state.id}@${width}: no horizontal overflow`);
  if(state.public){assert.equal(evidence.shells,0,`${state.id}@${width}: no authenticated shell`);assert.deepEqual(evidence.sticky,[],`${state.id}@${width}: no competing sticky owner`);}
  else{
    assert.equal(evidence.shells,1,`${state.id}@${width}: one shared shell`);assert.equal(evidence.legacy,0,`${state.id}@${width}: no legacy auth owner`);assert.deepEqual(evidence.menus,menuOrder,`${state.id}@${width}: shared menu order`);assert.equal(evidence.current,state.name,`${state.id}@${width}: exact app identity`);assert.equal(evidence.title,state.name,`${state.id}@${width}: full app identity remains discoverable`);assert.deepEqual(evidence.sticky,['.vesa-workspace'],`${state.id}@${width}: one sticky top-level owner`);
    assert.ok(evidence.boxes.every(box=>box.left>=-1&&box.right<=width+1),`${state.id}@${width}: every visible shared control stays in the viewport (${JSON.stringify(evidence.boxes)})`);
    if(width<=900){assert.equal(evidence.label.overflow,'ellipsis',`${state.id}@${width}: constrained identity uses an ellipsis`);if(width===390&&['ppm-editor','aql-inspection'].includes(state.id))assert.ok(evidence.label.scroll>evidence.label.client,`${state.id}@${width}: long identity is meaningfully truncated`);}
    else assert.ok(evidence.label.scroll<=evidence.label.client,`${state.id}@${width}: desktop identity is complete`);
  }
  await page.screenshot({path:path.join(output,`vesa-uniform-${state.id}-${width}.png`)});
  assert.deepEqual(errors,[],`${state.id}@${width}: no page errors`);assert.deepEqual(external,[],`${state.id}@${width}: no external requests`);
  await context.close();
}

async function run(){
  fs.mkdirSync(output,{recursive:true});const web=server();await new Promise(resolve=>web.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${web.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  try{for(const width of widths)for(const state of states)await probe(browser,base,state,width);}finally{await browser.close();await new Promise(resolve=>web.close(resolve));}
  console.log('VESA uniform experience passed: Login/App Centre/Admin/TNA/PPM editor/AQL inspection at 390/768/1280, one owner/order/identity, meaningful mobile ellipsis, no overflow/external requests/page errors');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
