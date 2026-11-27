/**
 * Source-only public VESA website audit.
 * Owner: SiteIntegrityAudit validates the checked-out static site; it does not
 * mutate pages, credentials, browser storage, customer data or live deployment.
 * Run: node tests/vesa-site-integrity.cjs (also via GitHub Actions).
 * Exact app/asset existence and home navigation are checked against repo bytes.
 * Runtime behaviors require separate browser/UI tests; this cannot certify them.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

/** Validate the public route inventory and local asset references without network side effects. */
class SiteIntegrityAudit {
  /** Bind repository-root files and collect evidence; no global mutable state. */
  constructor(root) {
    this.root=root;this.faults=[];this.warnings=[];this.references=0;this.routes=[];
    this.routeNames=['','login/','admin/','apps/','product-showcase/','privacy.html','terms.html',
      ...['aql','ppm','tna','costing','packing-container','order-commission','tech-pack-spec','purchase-order',
      'lc-payment','sampling-approval','fabric-trims','shipment-documentation','production-tracker',
      'factory-vendor','label-artwork-approval','buyer-crm','fabric-supplier-comparison',
      'claims-disputes','product-development','chess-360'].map(name=>'apps/'+name+'/')];
  }
  /** Convert one public page route to its repository HTML entrypoint. */
  entry(route){return route.endsWith('/')||route===''?route+'index.html':route}
  /** Determine local URLs from real src/href attributes, retaining the source tag for evidence. */
  links(html){
    const results=[];
    for(const tag of html.matchAll(/<(script|link|img|a)\b[^>]*>/gi)){
      const match=tag[0].match(/\b(?:src|href)\s*=\s*(['"])(.*?)\1/i);
      // Inline app JavaScript can contain HTML template literals, not actual
      // asset URLs. Exclude interpolated bindings to avoid false missing-file reports.
      if(match&&!match[2].includes('${')&&!match[2].startsWith("'+"))results.push({tag:tag[1].toLowerCase(),value:match[2].replace(/&amp;/g,'&')});
    }
    return results;
  }
  /** Map a static URL to local filesystem only; don't chase external or dynamic routes. */
  resolve(route,href){
    if(!href||/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(href))return null;
    const url=href.split(/[?#]/)[0];if(!url)return null;
    const base=url.startsWith('/')?'':path.posix.dirname('/'+this.entry(route)).slice(1)+'/';
    const relative=path.posix.normalize(base+url.replace(/^\//,''));
    if(relative.startsWith('../')||relative==='..')return {invalid:true,path:relative};
    return {path:relative.endsWith('/')?relative+'index.html':relative};
  }
  /** One pass across every public entrypoint and its linked first-party assets. */
  run(){
    for(const route of this.routeNames){
      const entry=this.entry(route),full=path.join(this.root,entry);
      if(!fs.existsSync(full)){this.faults.push('Missing route: /'+route);continue}
      this.routes.push('/'+route);
      const html=fs.readFileSync(full,'utf8');
      if(!/<html\b/i.test(html))this.faults.push('Missing HTML root: '+entry);
      if(!/<meta\s+name=["']viewport["']/i.test(html))this.warnings.push('No viewport meta: '+entry);
      for(const link of this.links(html)){
        const dest=this.resolve(route,link.value);
        if(!dest)continue;
        this.references++;
        if(dest.invalid){this.faults.push('Path traversal ref: '+entry+' -> '+link.value);continue}
        const present=fs.existsSync(path.join(this.root,dest.path));
        if(present)continue;
        if(link.tag==='script'||link.tag==='link'&&/\.(?:css|js|webmanifest)(?:[?#]|$)/i.test(link.value))
          this.faults.push('Missing resource: '+entry+' -> '+link.value);
        else if(link.tag==='img')this.warnings.push('Image not found in repository: '+entry+' -> '+link.value);
        else this.warnings.push('Unresolved link: '+entry+' -> '+link.value);
      }
    }
    // Detect broken homepage hash navigation from actual markup, without changing it.
    const home=fs.readFileSync(path.join(this.root,'index.html'),'utf8');
    const ids=new Set([...home.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(x=>x[1]));
    for(const anchor of this.links(home).filter(x=>x.tag==='a')){
      const match=anchor.value.match(/^(?:\/|(?:index\.html)?)#([^?#]+)$/);
      if(match&&!ids.has(decodeURIComponent(match[1])))this.warnings.push('Homepage anchor not found: '+anchor.value);
    }
    const summary={verdict:this.faults.length?'failed':'accepted',checkedRoutes:this.routes.length,
      localReferences:this.references,faults:this.faults,warnings:this.warnings};
    process.stdout.write(JSON.stringify(summary,null,2)+'\n');
    assert.equal(this.faults.length,0,'Static route or required asset failures');
    return summary;
  }
}
new SiteIntegrityAudit(path.resolve(__dirname,'..')).run();
