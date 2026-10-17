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
console.log('VESA BLUEPRINT INTEGRITY PASS: 28 original SHA-256 entries, 15 original app blueprints, APP-09 available, no ZIP/chat attachment required.');
