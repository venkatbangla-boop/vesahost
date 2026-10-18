/**
 * VESA 360 first-party attribution regression.
 *
 * Owner: the shared EGENVA brand contract and App Centre copy, not any app's
 * domain controller. Call with `node tests/vesa-egenva-branding.cjs`.
 * Inputs: checked-in first-party text files; output: assertions and one status.
 * Side effects: none. No saved inspections, chess-engine code, or user records
 * are loaded or written. Historical documents and third-party media are frozen.
 */
'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const childProcess=require('node:child_process');

class VesaBrandingRegression {
  static ROOT=path.resolve(__dirname,'..');
  static OFFICIAL_CREDIT='Powered by EGENVA';
  static SAFE_NON_BRAND_USES=new Set(['EXPERIENCE','INTELLIGENCE']);
  static ALIASES=/\b(?:ajan(?:va|ba)|ejenva|egen(?:ba|wa|na)|egnova|egenova|eganva|egnva|eigenva)\b/gi;
  static ATTRIBUTIONS=/\bpowered\s+by\b/gi;

  static files(){
    const names=childProcess.execFileSync('git',['ls-files','-z'],{
      cwd:this.ROOT,encoding:'utf8'
    }).split('\0').filter(Boolean);
    const text=/\.(?:html?|js|cjs|mjs|css|md|json|yml|yaml|svg|txt|xml|py|webmanifest|sh)$/i;
    const history=/^(?:docs|blueprints|templates|tests|\.github)\//;
    return names.filter(file=>text.test(file)&&!history.test(file)&&
      !/(?:^|\/)tests?\//.test(file)&&!/(?:^|\/)vendor\//.test(file));
  }

  static inspect(){
    const issues=[],files=this.files();
    let credits=0,bytes=0;
    for(const file of files){
      let source=fs.readFileSync(path.join(this.ROOT,file),'utf8');
      bytes+=Buffer.byteLength(source,'utf8');
      source=source.replace(/data:[\w.+/-]+;base64,[A-Za-z0-9+/=]{500,}/g,'[IMMUTABLE_MEDIA]');
      const failure=(reason,at)=>{
        const line=(source.slice(0,at).match(/\n/g)||[]).length+1;
        issues.push(file+':'+line+' '+reason);
      };
      for(const found of source.matchAll(this.ALIASES))failure('Misspelled brand '+found[0],found.index);
      for(const found of source.matchAll(this.ATTRIBUTIONS)){
        credits++;
        const next=source.slice(found.index+found[0].length,found.index+found[0].length+160)
          .replace(/^(?:\s|<[^>]+>|&nbsp;|&#\d+;)+/g,'');
        const token=next.match(/^([A-Za-z]+)/)?.[1]?.toUpperCase()||'';
        if((token!=='EGENVA'&&!this.SAFE_NON_BRAND_USES.has(token))||
          (token==='EGENVA'&&!next.startsWith('EGENVA')))
          failure('Unexpected attribution after Powered by: '+token,found.index);
      }
    }
    assert.ok(files.some(f=>f==='apps/chess-360/index.html'),'Original chess app not scanned');
    assert.ok(files.some(f=>f==='apps/aql/index.html'),'AQL app not scanned');
    assert.ok(files.some(f=>f==='apps/ppm/index.html'),'PPM app not scanned');
    assert.ok(files.some(f=>f==='apps/tna/src/bootstrap.js'),'TNA app not scanned');
    assert.deepEqual(issues,[],'Brand spelling or powered-by attribution drift');
    const catalogue=fs.readFileSync(path.join(this.ROOT,'js/app-catalogue.js'),'utf8');
    const centre=fs.readFileSync(path.join(this.ROOT,'js/vesa-app-centre.js'),'utf8');
    assert.equal(catalogue.split(this.OFFICIAL_CREDIT).length-1,1,'Single catalogue Chess attribution');
    assert.equal(centre.split(this.OFFICIAL_CREDIT).length-1,4,'EN/BN/HI/TA Chess attribution');
    assert.ok(fs.readFileSync(path.join(this.ROOT,'apps/index.html'),'utf8')
      .includes('v=20261018-egenva-v2'),'Versioned App Centre must fetch corrected copy');
    const worker=fs.readFileSync(path.join(this.ROOT,'service-worker.js'),'utf8');
    assert.ok(worker.includes('vesa-v109-egenva-credit'),'Root offline cache must rotate');
    const chess=fs.readFileSync(path.join(this.ROOT,'apps/chess-360/index.html'));
    const sha=crypto.createHash('sha256').update(chess).digest('hex');
    assert.equal(sha,'06c82b0515826e0a5d62cd89b368fcf0431bee75fe41e753213afa8b16c7441c',
      'Supplied Chess file must remain byte-for-byte unchanged');
    console.log('EGENVA_BRANDING_PASS '+JSON.stringify({
      filesScanned:files.length,bytesScanned:bytes,credits,
      correctedChessLocales:4,wrongBrandMatches:issues.length,
      chessSourceSha256:sha
    }));
  }
}

VesaBrandingRegression.inspect();
