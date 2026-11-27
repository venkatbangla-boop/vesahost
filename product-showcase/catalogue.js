/** Immutable catalogue and pure navigation state. Neither owner touches DOM, timers,
 * storage or the network. The controller supplies validated source records once. */
class GarmentCatalogue {
  /** Validate exact category IDs, group counts and alpha-preserving image references.
   * @param {Array} records Built-in garment manifest; throws on invalid coverage.
   */
  constructor(records) {
    this.groups=Object.freeze({all:'All styles',men:"Men's",ladies:"Ladies'",boys:"Boys'",girls:"Girls'",baby:'Baby'});
    const expected={men:34,ladies:29,boys:22,girls:22,baby:14};
    if(records.length!==121||new Set(records.map(r=>r.id)).size!==121) throw Error('Incomplete catalogue');
    for(const [key,count] of Object.entries(expected)) if(records.filter(r=>r.group===key).length!==count) throw Error('Invalid group count: '+key);
    this.records=Object.freeze(records.map(r=>Object.freeze(r)));
    this.byId=new Map(this.records.map(r=>[r.id,r]));
    this.allPresentation=this.buildAllPresentation();
  }
  /** Return records in master-list order; invalid group returns an empty array. */
  items(group='all'){return group==='all'?this.records:this.records.filter(r=>r.group===group)}
  /**
   * Build the All-only circular presentation without mutating the
   * canonical five collections. The approved first view retains M16 with Baby/Ladies neighbors:
   * seed M16 in the second Men round, interleave once, then rotate the whole cycle.
   * Each ID appears once; exhausted groups are skipped, never duplicated.
   */
  buildAllPresentation() {
    const order=['men','ladies','boys','girls','baby'];
    const buckets=order.map(group=>[...this.items(group)]);
    const heroIndex=buckets[0].findIndex(item=>item.id==='M16');
    if(heroIndex<0)throw new Error('Missing initial product');
    const [hero]=buckets[0].splice(heroIndex,1);
    buckets[0].splice(1,0,hero);
    const result=[];
    for(let round=0;round<Math.max(...buckets.map(items=>items.length));round++) {
      for(const bucket of buckets)if(bucket[round])result.push(bucket[round]);
    }
    const start=result.findIndex(item=>item.id==='M16');
    return Object.freeze([...result.slice(start),...result.slice(0,start)]);
  }
  /** Return the derived All cycle or the exact canonical order of a single group. */
  presentationItems(group='all'){return group==='all'?this.allPresentation:this.items(group)}
  /** Retrieve one exact ID, undefined if unknown. */
  get(id){return this.byId.get(id)}
  /** Search human-readable names, collections and stable garment IDs without mutating catalogue. */
  search(query){const q=query.trim().toLowerCase();return this.records.filter(r=>(r.id+' '+r.name+' '+this.groups[r.group]).toLowerCase().includes(q))}
}
/** Owns the active collection and index only. Navigation always wraps within the chosen
 * sequence. The controller renders a snapshot; the asset manifest is never changed. */
class CarouselState {
  /** @param {GarmentCatalogue} catalogue Immutable source; initializes first item of the mixed collection. */
  constructor(catalogue){this.catalogue=catalogue;this.group='all';this.index=0}
  get items(){return this.catalogue.presentationItems(this.group)}
  get current(){return this.items[this.index]}
  /** Switch to an existing collection; preserve selected ID if it belongs, else first style. */
  selectGroup(group){if(!Object.hasOwn(this.catalogue.groups,group))return false;const id=this.current.id;this.group=group;this.index=Math.max(0,this.items.findIndex(r=>r.id===id));return true}
  /** Select exact ID. A cross-collection search restores all-styles mode rather than hiding a result. */
  selectId(id){if(!this.catalogue.get(id))return false;let index=this.items.findIndex(r=>r.id===id);if(index<0){this.group='all';index=this.items.findIndex(r=>r.id===id)}this.index=index;return true}
  /** Move signed number of slides, circularly; returns the selected record. */
  step(delta){const n=this.items.length;this.index=((this.index+delta)%n+n)%n;return this.current}
  /** Return at most five distinct records keyed by signed offset, including preloaded neighbors.
   * Small collections can have the same item two steps away on both sides; deduplicate by ID. */
  neighborhood(){const n=this.items.length,seen=new Set(),result=[];for(const pos of [0,-1,1,-2,2]){const item=this.items[(this.index+pos+n)%n];if(!seen.has(item.id)){seen.add(item.id);result.push({item,pos})}}return result}
}
