/**
 * Reproducible local VESA regression orchestrator for TNA G11 preparation.
 * Read-only with respect to application/source data. Browser suites may refresh
 * ignored screenshots under output/playwright.
 *
 * PowerShell prerequisite example:
 *   $env:NODE_PATH='<playwright node_modules>'
 *   $env:CHROMIUM_PATH='<chromium executable>'
 *   node tests/vesa-g11-regression.cjs
 */
const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');

const root=path.resolve(__dirname,'..');
const node=process.execPath;
const started=Date.now();
const results=[];
const rel=file=>path.relative(root,file).replace(/\\/g,'/');
const files=(dir,pattern)=>fs.readdirSync(path.join(root,dir)).filter(name=>pattern.test(name)).sort().map(name=>path.join(root,dir,name));

function run(category,label,command,args){
  const at=Date.now();
  const attempts=category==='browser'?2:1;
  let result,usedAttempts=0;
  for(let attempt=1;attempt<=attempts;attempt++){
    usedAttempts=attempt;
    result=spawnSync(command,args,{cwd:root,env:process.env,encoding:'utf8',stdio:'pipe',timeout:240000});
    if(!result.error&&result.status===0)break;
    if(attempt<attempts)console.warn(`[RETRY] ${category} · ${label} after isolated first-attempt failure; final evidence will retain this retry.`);
  }
  const seconds=((Date.now()-at)/1000).toFixed(1);
  if(result.error||result.status!==0){
    process.stderr.write(result.stdout||'');
    process.stderr.write(result.stderr||'');
    throw new Error(`[FAIL] ${category} · ${label} (${seconds}s) · ${command} ${args.join(' ')}`+(result.error?` · ${result.error.message}`:''));
  }
  const last=(result.stdout||'').trim().split(/\r?\n/).filter(Boolean).at(-1)||'completed';
  results.push({category,label,seconds:Number(seconds),evidence:last,retried:usedAttempts>1});
  console.log(`[PASS] ${category} · ${label} (${seconds}s) · ${last}`);
}

function preflight(){
  try{require.resolve('playwright');}catch{throw new Error('Playwright is unavailable. Set NODE_PATH to the installed Playwright node_modules directory.');}
  if(!process.env.CHROMIUM_PATH||!fs.existsSync(process.env.CHROMIUM_PATH))throw new Error('CHROMIUM_PATH must point to the installed Chromium executable.');
  console.log(`VESA G11 local regression · Node ${process.version} · Chromium ${process.env.CHROMIUM_PATH}`);
}

function main(){
  preflight();
  for(const file of files('apps/tna/tests',/\.test\.js$/))run('automated','TNA '+path.basename(file),node,[rel(file)]);
  run('browser','TNA G10 mobile workflow',node,['apps/tna/tests/g10-linked-ui.cjs']);
  run('browser','TNA F06 complete order master',node,['apps/tna/tests/g11-f06-order-master.cjs']);
  run('browser','TNA F44 localized help and recovery',node,['apps/tna/tests/g11-f44-help.cjs']);
  run('browser','TNA G11 saved-copy/report artifacts',node,['apps/tna/tests/g11-artifact-viewers.cjs']);
  run('browser','TNA G11 language/accessibility/timezone matrix',node,['apps/tna/tests/g11-localization-accessibility.cjs']);
  run('browser','TNA G11 hostile-value/import rendering',node,['apps/tna/tests/g11-security-ui.cjs']);
  run('browser','TNA G11 login/App Centre/direct routes',node,['apps/tna/tests/g11-route-regression.cjs']);
  run('browser','TNA unified one-shell ownership',node,['apps/tna/tests/g11-unified-shell-browser.cjs']);

  const ppm=files('apps/ppm/tests',/\.cjs$/);
  for(const file of ppm)run(/(?:ui|home|recovery|reports|regression|planning|update)/.test(path.basename(file))?'browser':'automated','PPM '+path.basename(file),node,[rel(file)]);

  const aql=files('apps/aql/tests',/\.cjs$/).filter(file=>path.basename(file)!=='apply-release-patch.cjs');
  for(const file of aql)run('automated','AQL '+path.basename(file),node,[rel(file)]);

  run('automated','shared workspace shell contract',node,['tests/vesa-workspace-shell-contract.cjs']);
  run('automated','local UAT package contract',node,['tests/vesa-local-uat-package.cjs']);
  run('browser','shared accessibility matrix',node,['tests/vesa-accessibility.cjs']);
  run('browser','shared final uniform experience',node,['tests/vesa-uniform-experience.cjs']);
  run('browser','shared Login/App Centre/Admin page matrix',node,['tests/vesa-platform-pages.cjs']);
  run('browser','shared 390/1280 shell matrix',node,['tests/vesa-shared-shell-matrix.cjs']);
  for(const file of [...files('apps/tna/src',/\.js$/),path.join(root,'service-worker.js')])run('syntax',rel(file),node,['--check',rel(file)]);
  run('repository','git diff --check','git',['diff','--check']);

  const counts=results.reduce((out,row)=>{out[row.category]=(out[row.category]||0)+1;return out},{});
  console.log(`VESA G11 regression PASS · ${results.length} commands · ${((Date.now()-started)/1000).toFixed(1)}s · ${Object.entries(counts).map(([key,value])=>`${key}=${value}`).join(' · ')}`);
  console.log('Evidence classification: automated/browser/syntax/repository only; no physical factory, real-device, provider-security or production acceptance is claimed.');
}

try{main();}catch(error){console.error(error.message);process.exitCode=1;}
