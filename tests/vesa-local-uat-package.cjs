const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const uat=path.join(root,'docs','uat');
const files=['00_READ_ME_FIRST.md','01_TNA_LOCAL_UAT.md','02_PPM_LOCAL_UAT.md','03_AQL_LOCAL_UAT.md','04_SHARED_UI_LOCAL_UAT.md','05_RESULTS_AND_SIGNOFF.md','06_AUTOMATED_EVIDENCE.md'];
const text=name=>fs.readFileSync(path.join(uat,name),'utf8');
for(const name of files)assert.ok(fs.existsSync(path.join(uat,name)),`Missing UAT package file: ${name}`);

const readme=text(files[0]);
for(const marker of ['py -m http.server 4173 --bind 127.0.0.1','http://127.0.0.1:4173/login/','admin@vesa','Password: `vesa`','PASS','FAIL','NOT TESTED','HOLD'])assert.ok(readme.includes(marker),`UAT startup/status marker missing: ${marker}`);

const checks={
  '01_TNA_LOCAL_UAT.md':12,
  '02_PPM_LOCAL_UAT.md':12,
  '03_AQL_LOCAL_UAT.md':15,
  '04_SHARED_UI_LOCAL_UAT.md':10,
};
const statusCounts={PASS:0,FAIL:0,'NOT TESTED':0};
for(const [name,count] of Object.entries(checks)){
  const body=text(name),rows=[...body.matchAll(/^\| UAT-[A-Z]+-\d+ \|.+\| (PASS|FAIL|NOT TESTED) \|/gm)];
  assert.equal(rows.length,count,`${name} must contain ${count} human checklist rows`);
  for(const row of rows)statusCounts[row[1]]++;
  assert.ok(body.includes('Expected result')&&body.includes('Evidence / notes'),`${name} must retain expected-result and evidence columns`);
}

const aql=text('03_AQL_LOCAL_UAT.md');
for(const marker of ['Automatic','manual','Auto Fill Remaining','combined','without replacement','leading zeros','replacement','history','saved copy','inspected','report','not buyer-certified'])assert.ok(aql.toLowerCase().includes(marker.toLowerCase()),`AR11 human UAT marker missing: ${marker}`);
const results=text('05_RESULTS_AND_SIGNOFF.md');
const total=results.match(/^\| Total \| (\d+) \| (\d+) \| (\d+) \|/m);
assert.ok(total,'UAT results total row is missing');
assert.deepEqual(total.slice(1).map(Number),[statusCounts.PASS,statusCounts.FAIL,statusCounts['NOT TESTED']],'UAT results total must match all human checklist rows');
assert.equal(Object.values(statusCounts).reduce((sum,value)=>sum+value,0),49,'UAT status counts must total 49');
assert.ok(results.includes('PRODUCTION HOLD')&&results.includes('HOSTING-POLICY BLOCKED'), 'UAT sign-off must retain production HOLD and the current hosting-policy blocker');
console.log(`VESA local UAT package passed: human results PASS=${statusCounts.PASS}, FAIL=${statusCounts.FAIL}, NOT TESTED=${statusCounts['NOT TESTED']} with startup, AR11, evidence and HOLD boundaries`);
