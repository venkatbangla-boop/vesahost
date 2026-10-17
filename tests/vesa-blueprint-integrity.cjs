/** Verify the committed 2026-10-14 VESA 15-app source handover without chat uploads.
 * Run: node tests/vesa-blueprint-integrity.cjs
 * This is a repository-only provenance check; it never imports app/browser data.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'docs/portfolio/13_FILE_INTEGRITY_SHA256.json');
assert(fs.existsSync(manifestPath),'Missing committed 15-app original manifest');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.equal(manifest.algorithm,'sha256');
const entries=Object.entries(manifest.entries||{});
assert.equal(entries.length,28,'Expected exact original handover entries');
assert.equal(manifest.fileCount,28);
const blueprints=new Set();
for(const [relative,expected] of entries){
 assert(/^[A-Za-z0-9_./-]+$/.test(relative)&&!relative.startsWith('/')&&!relative.split('/').includes('..'),'Unsafe manifest path');
 assert(/^[a-f0-9]{64}$/.test(expected),'Invalid SHA256 in manifest: '+relative);
 const at=path.join(root,relative.startsWith('blueprints/')?relative:'docs/portfolio/'+relative);
 assert(fs.existsSync(at),'Missing canonical repository source: '+relative);
 const current=crypto.createHash('sha256').update(fs.readFileSync(at)).digest('hex');
 assert.equal(current,expected,'Original ZIP SHA-256 mismatch: '+relative);
 if(relative.startsWith('blueprints/APP-'))blueprints.add(relative);
}
assert.equal(blueprints.size,15,'Exactly 15 original application blueprints required');
assert(blueprints.has('blueprints/APP-09_production-tracker.md'),'Production Tracker original blueprint missing');
const app=fs.readFileSync(path.join(root,'blueprints/APP-09_production-tracker.md'),'utf8');
assert(app.includes('Stage WIP = opening + verified_in - verified_out - verified_rejects'));
assert(app.includes('M0 - audit/scope'));
// The convenient ZIP in git is repacked from the exact original text bytes,
// not a claim of byte-for-byte identity with the original compressed ZIP.
const zip=fs.readFileSync(path.join(root,'docs/portfolio/VESA_360_15_APP_MASTER_ROADMAP_REPOSITORY_COPY.zip'));
const prefix='VESA_360_15_APP_MASTER_ROADMAP/';
const included=new Set();
const expectedNames=new Set([...entries.map(([relative])=>prefix+relative),prefix+'13_FILE_INTEGRITY_SHA256.json']);
let offset=0;
function crc32(bytes){
 let c=0xffffffff;
 for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}
 return (c^0xffffffff)>>>0;
}
while(offset+30<=zip.length && zip.readUInt32LE(offset)===0x04034b50){
 assert.equal(zip.readUInt16LE(offset+8),0,'Repo ZIP entries must be stored without compression for deterministic reading');
 const size=zip.readUInt32LE(offset+18),nameLen=zip.readUInt16LE(offset+26),extraLen=zip.readUInt16LE(offset+28);
 const name=zip.subarray(offset+30,offset+30+nameLen).toString('utf8');
 assert(expectedNames.has(name),'Unexpected file inside master ZIP: '+name);
 assert(!included.has(name),'Duplicate file inside master ZIP: '+name);
 const bytes=zip.subarray(offset+30+nameLen+extraLen,offset+30+nameLen+extraLen+size);
 const relative=name.slice(prefix.length);
 const at=path.join(root,relative.startsWith('blueprints/')?relative:'docs/portfolio/'+relative);
 assert(bytes.equals(fs.readFileSync(at)),'Repacked ZIP file differs from canonical original: '+relative);
 assert.equal(crc32(bytes),zip.readUInt32LE(offset+14),'Repacked ZIP CRC mismatch: '+relative);
 included.add(name);
 offset+=30+nameLen+extraLen+size;
}
assert.equal(included.size,29,'The repository ZIP must include all 29 handover texts');
assert.equal(zip.readUInt32LE(offset),0x02014b50,'Repacked ZIP central directory missing');
assert.equal(zip.readUInt32LE(zip.length-22),0x06054b50,'Repacked ZIP end record missing');
assert.equal(zip.readUInt16LE(zip.length-12),29,'Repacked ZIP directory count mismatch');
console.log('VESA BLUEPRINT INTEGRITY PASS: 28 original SHA-256 entries, 15 original app blueprints, 29 readable ZIP files, APP-09 available, no chat attachment required.');
