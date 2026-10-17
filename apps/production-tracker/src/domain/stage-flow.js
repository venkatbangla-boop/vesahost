/* APP-09: source-linked production identity and strict observation fields.
 * No implicit shift, conversion, quality release, stage movement or target approval.
 */
(function(root){
'use strict';
class ProductionStageFlow {
 static version='VESA-PROD-360-1';
 static stages=Object.freeze(['cutting','sewing','finishing','packing']);
 static text(v){return typeof v==='string'?v.trim():'';}
 static date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
  const t=Date.parse(v+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===v;}
 static whole(v){return Number.isSafeInteger(v)&&v>=0&&v<=100000000;}
 static id(prefix='PROD'){return prefix+'-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
 static copy(v){return JSON.parse(JSON.stringify(v));}
 static axis(r){return [r.stage,r.line,r.lot,r.unit].join('\u001f');}
 static dayKey(r){return [this.axis(r),r.date,r.shift].join('\u001f');}
 static validAxis(r){return this.stages.includes(r?.stage)&&['line','lot','unit'].every(k=>this.text(r[k]));}
 static errorsHeader(h){const e=[];
  for(const k of ['poNo','style','colour','size','lot','factory','unit','sourceRef'])
   if(!this.text(h?.[k]))e.push('Missing sourced production header: '+k);
  return e;
 }
 static errorsObservation(o){const e=[];
  if(!this.text(o?.id))e.push('Observation identity missing');
  if(!this.validAxis(o)||!this.date(o?.date)||!this.text(o?.shift))e.push('Stage, line, lot, unit, day and shift must be explicit');
  for(const k of ['good','verifiedIn','verifiedOut','verifiedRejects','rework'])
   if(!this.whole(o?.[k]))e.push('Whole nonnegative sourced quantity required: '+k);
  if(!this.text(o?.sourceRef)||!this.text(o?.actor))e.push('Source and observer are required');
  if(!['recorded','locally-reviewed'].includes(o?.status))e.push('Invalid local evidence state');
  if(o?.status==='locally-reviewed'&&(!this.text(o.reviewedBy)||!this.date(o.reviewDate)||!this.text(o.reviewSource)))
   e.push('Local review needs separate reviewer, date and evidence');
  if(o?.verifiedIn>0&&!this.text(o.handoffRef))e.push('Verified input needs an explicit incoming source/handoff');
  if(o?.verifiedOut>0&&!this.text(o.outRef))e.push('Verified output needs an explicit outgoing document');
  if(o?.verifiedRejects>0&&!this.text(o.rejectRef))e.push('Rejected units need separately sourced disposition');
  if(o?.supersedes&&(!this.text(o.correctionReason)||!this.text(o.correctionSource)))
   e.push('Correction must include a reason and dated source');
  if(o?.date&&!this.date(o.date))e.push('Observation date invalid');
  return e;
 }
 static errorsOpening(o){const e=[];
  if(!this.validAxis(o)||!this.whole(o?.opening)||!this.text(o?.sourceRef)||!this.text(o?.reviewedBy)||!this.date(o?.reviewDate))
   e.push('Opening WIP requires stage, line, lot, unit, whole quantity and dated reviewed source');
  return e;
 }
 static errorsTarget(t){const e=[];
  if(!this.validAxis(t)||!this.whole(t?.quantity)||!this.text(t?.sourceRef)||
   !this.text(t?.declaredAuthority)||!this.date(t?.sourceDate)||!this.text(t?.reviewedBy)||!this.date(t?.reviewDate))
   e.push('Stage target needs exact scope, quantity and sourced dated declaration/review');
  return e;
 }
}
root.VesaProductionStageFlow=ProductionStageFlow;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionStageFlow;
})(typeof globalThis!=='undefined'?globalThis:this);
