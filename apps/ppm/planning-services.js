'use strict';
/** Meeting controls domain. Owns approval readiness, numeric comparisons and reviewed
 * content snapshots. Called by workspace/codec/report owners; never reads DOM, storage
 * or network. All thresholds and required flags come from the user's buyer documents. */
class ApprovalRegister {
  static labels=['PP sample','Fabric','Shade / colour','Trims','Print / embroidery','Packing'];
  /** Create an explicitly added pending approval, required by default until user changes it. */
  static create(label=''){return {id:'APR-'+crypto.randomUUID(),label,required:true,status:'Pending',approvedBy:'',date:'',reference:'',notes:'',photo:'',photoRevision:''}}
  /** Return a readable gap for a user-selected required item. No assumed buyer approval. */
  gap(a){if(!a.required)return '';if(!a.label.trim())return 'Enter an approval name.';if(a.status==='Not needed')return a.notes.trim()||a.reference.trim()?'':'Explain why this approval is not needed.';if(a.status!=='Approved')return 'Approval is still pending or rejected.';if(!a.approvedBy.trim()||!a.date)return 'Record who approved it and the approval date.';if(!a.reference.trim()&&!a.photo)return 'Add an approval reference or proof photo.';return ''}
  /** Read required approval gaps; optional rows remain available as supporting records. */
  readiness(record){return (record.approvals||[]).map(a=>({label:a.label||'Unnamed approval',message:this.gap(a)})).filter(a=>a.message)}
}

/** Numeric measurement comparison owner. Access via planning.measurements.compare(row).
 * Unit is explicit; no conversion, buyer defaults or rounding before acceptance. Missing
 * and invalid values never pass. Legacy free-text specs remain intact for manual review. */
class MeasurementCheck {
  /** Accept finite nonnegative decimal numbers only; never strip units or parse partial text. */
  number(text){const t=String(text??'').trim();if(!/^\d+(?:\.\d+)?$|^\.\d+$/.test(t))return null;const n=Number(t);return Number.isFinite(n)&&n<=1000000?n:null}
  /** Return result/bounds/difference from one row; unknown unit/tolerance cannot pass. */
  compare(m){const base={status:'Not checked',difference:null,low:null,high:null};if(!String(m.actual||'').trim())return base;const spec=this.number(m.spec),actual=this.number(m.actual);let minus,plus;if(String(m.tolMinus||'').trim()||String(m.tolPlus||'').trim()){minus=this.number(m.tolMinus);plus=this.number(m.tolPlus)}else{const tolerance=String(m.tol||'').trim().replace(/^(?:±|\+\s*\/\s*-|\+\s*-|\+\s*−)\s*/,'');minus=plus=this.number(tolerance)}if(!['cm','in'].includes(m.unit)||spec===null||actual===null||minus===null||plus===null)return {...base,status:'Check entries'};const low=spec-minus,high=spec+plus,difference=actual-spec,eps=Number.EPSILON*Math.max(1,spec,actual,low,high)*8;return {status:actual>=low-eps&&actual<=high+eps?'Within tolerance':'Outside tolerance',difference,low,high}}
  /** Only explicitly required comparisons gate release; untouched legacy POMs stay optional. */
  gaps(record){return record.measurements.map((m,i)=>({label:m.pom||'Measurement '+(i+1),result:this.compare(m),required:!!m.checkRequired})).filter(x=>x.required&&x.result.status!=='Within tolerance')}
  display(n){return n===null?'—':String(Number(n.toFixed(6)))}
}

/** Controlled revision comparison. Owns one baseline and ten bounded review entries in
 * record.changeReview. Access: workspace mutations compare; explicit reviewed button
 * advances the baseline. No signature or repository mutation happens inside this owner. */
class ChangeReviewEngine {
  static metaLabels={factory:'Factory',buyer:'Buyer',style:'Style',po:'PO / Order',profile:'Garment profile',product:'Product',orderQty:'Order quantity',ppmDate:'Meeting date',deliveryDate:'Delivery date',market:'Market',construction:'Construction',productClass:'Product group',sizeRange:'Size range',fabricComposition:'Fabric composition',fabricStructure:'Fabric structure',fabricWeight:'Fabric weight',fabricWidth:'Fabric width',colorways:'Colours / shade',techPackRev:'Tech pack revision',measurementRev:'Measurement revision',bomRev:'Trim card revision',ppSampleRef:'PP sample reference',aqlRef:'Inspection reference',washFinish:'Wash / finish',locationLine:'Location / line',specialInstruction:'Special instructions',processes:'Processes'};
  static measureFields=['pom','spec','tol','unit','actual','tolMinus','tolPlus','checkRequired','method','risk'];
  static customFields=['section','label','hint','critical'];
  static approvalFields=['label','required','status','approvedBy','date','reference','notes','photoRevision'];
  static fieldLabels={pom:'Point of measure',spec:'Spec',tol:'Tolerance',unit:'Unit',actual:'Sample actual',tolMinus:'Allowed below',tolPlus:'Allowed above',checkRequired:'Required check',method:'Method',risk:'Risk',label:'Name',required:'Required',status:'Status',approvedBy:'Approved by',date:'Approval date',reference:'Approval reference',notes:'Notes',photoRevision:'Proof photo',section:'Section',hint:'Guidance',critical:'Critical check'};
  static empty(){return {baseline:null,history:[]}}
  /** A canonical flat snapshot prevents order-only process changes and excludes images. */
  snapshot(r){const values={};for(const k of Object.keys(ChangeReviewEngine.metaLabels))values['meta.'+k]=Array.isArray(r.meta[k])?[...r.meta[k]].sort().join(', '):String(r.meta[k]||'');r.measurements.forEach((m,i)=>{if(!Object.values(m).some(Boolean))return;for(const k of ChangeReviewEngine.measureFields)values[`measurement.${i}.${k}`]=typeof m[k]==='boolean'?(m[k]?'Yes':'No'):String(m[k]||'')});for(const a of r.approvals||[])for(const k of ChangeReviewEngine.approvalFields)values[`approval.${a.id}.${k}`]=typeof a[k]==='boolean'?(a[k]?'Yes':'No'):String(a[k]||'');for(const c of r.customCheckpoints||[])for(const k of ChangeReviewEngine.customFields)values[`custom.${c.id}.${k}`]=typeof c[k]==='boolean'?(c[k]?'Yes':'No'):String(c[k]||'');return Object.keys(values).sort().map(key=>({key,value:values[key]}))}
  label(key,r){const [kind,id,field]=key.split('.');if(kind==='meta')return ChangeReviewEngine.metaLabels[id]||'Meeting detail';if(kind==='custom'){const c=(r.customCheckpoints||[]).find(c=>c.id===id);return `${c?.label||'Custom checkpoint'} · ${ChangeReviewEngine.fieldLabels[field]||'Detail'}`}if(kind==='measurement')return `Measurement ${Number(id)+1} · ${ChangeReviewEngine.fieldLabels[field]||'Detail'}`;const a=(r.approvals||[]).find(a=>a.id===id);return `${a?.label||'Approval'} · ${ChangeReviewEngine.fieldLabels[field]||'Detail'}`}
  impact(key){if(key.startsWith('custom.'))return SECTION_SCHEMA.map(s=>s.id);if(key.startsWith('measurement.')||/meta\.(measurementRev|techPackRev)/.test(key))return ['technical','quality'];if(key.startsWith('approval.')||/meta\.(bomRev|ppSampleRef)/.test(key))return ['order','trims','quality'];if(/meta\.(fabric|colorways)/.test(key))return ['material','cutting','sewing'];if(/meta\.(profile|construction|processes|productClass|washFinish)/.test(key))return SECTION_SCHEMA.map(s=>s.id);return ['order','planning']}
  /** Return controlled old/new values since the named point, including additions/removals. */
  diff(r){const base=r.changeReview?.baseline;if(!base)return [];const old=new Map(base.values.map(x=>[x.key,x.value])),now=new Map(this.snapshot(r).map(x=>[x.key,x.value]));return [...new Set([...old.keys(),...now.keys()])].sort().filter(k=>(old.get(k)||'')!==(now.get(k)||'')).map(key=>({key,label:this.label(key,r),before:old.get(key)||'',after:now.get(key)||'',sections:this.impact(key)}))}
  /** Advance only after UI has obtained the named review/acknowledgement. History explicitly
   * keeps the first thirty differences plus total count; the current baseline is complete. */
  review(r,reviewer,note=''){const changes=this.diff(r),at=new Date().toISOString();r.changeReview||=ChangeReviewEngine.empty();r.changeReview.history.push({at,reviewer,note,count:changes.length,changes:changes.slice(0,30).map(({key,label,before,after})=>({key,label,before,after}))});r.changeReview.history=r.changeReview.history.slice(-10);r.changeReview.baseline={at,reviewer,values:this.snapshot(r)}}
}

/** Integration owner injected into ValidationEngine. Computes additive gates only; old
 * records with no selected controls keep original validation behavior. Invalidation is
 * called by workspace before saving edits, so stale approval cannot survive a mutation. */
class PlanningService {
  constructor(){this.approvals=new ApprovalRegister();this.measurements=new MeasurementCheck();this.changes=new ChangeReviewEngine()}
  /** Add missing optional controls on activation/mutation; never infer approval/tolerance. */
  ensure(r){r.approvals||=[];r.changeReview||=ChangeReviewEngine.empty();r.measurements.forEach(m=>{for(const [k,v] of Object.entries({actual:'',unit:'',tolMinus:'',tolPlus:'',checkRequired:false}))if(m[k]===undefined)m[k]=v})}
  /** Combine three pure readiness results for the existing release validation owner. */
  readiness(r){const approvals=this.approvals.readiness(r),measurements=this.measurements.gaps(r),changes=this.changes.diff(r);return {ready:!approvals.length&&!measurements.length&&!changes.length,approvals,measurements,changes}}
  /** Clear stale GO/signatures while differences remain; retain HOLD. Returns whether stale
   * sign-off existed, allowing workspace to clear canvases and display one useful notice. */
  invalidate(r){if(!this.changes.diff(r).length)return false;const stale=!!Object.keys(r.signatures).length||['GO','CONDITIONAL GO'].includes(r.release.decision);r.signatures={};if(r.release.decision!=='HOLD')r.release.decision='';return stale}
}
