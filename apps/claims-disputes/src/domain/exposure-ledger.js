/* APP-14 alleged exposure only, exact cents by source-entered ISO-style currency.
 * NOT admitted liability, a debit note, accounts receivable, official FX or supplier settlement.
 */
(function(root){
'use strict';
class VesaClaimExposure{
 static parse(v,allowZero=false){
  if(typeof v!=='string'||!/^(?:0|[1-9]\d{0,10})(?:\.\d{1,2})?$/.test(v))return null;
  const [w,d='']=v.split('.');const cents=BigInt(w)*100n+BigInt(d.padEnd(2,'0'));
  return cents===0n&&!allowZero?null:cents;
 }
 static fmt(v){if(typeof v!=='bigint')return null;return(v/100n).toString()+'.'+(v%100n).toString().padStart(2,'0');}
 static currency(v){return typeof v==='string'&&/^[A-Z]{3}$/.test(v);}
 static findingErrors(f){
  const E=root.VesaClaimRegister,errors=[];
  for(const k of ['id','category','description','quantityUnit','sourceRef','reviewedBy'])
   if(!E.valid(f?.[k],1000))errors.push('Finding requires documented '+k);
  if(!Number.isSafeInteger(f?.affectedQty)||f.affectedQty<1||f.affectedQty>1000000000)
   errors.push('Claim quantity requires source-entered positive integer pieces/cartons and exact unit');
  if(!E.date(f?.sourceDate)||!E.date(f?.reviewDate))
   errors.push('Finding needs dated allegation source and human review date');
  if(!['needs-information','locally-reviewed-claim-value'].includes(f?.valueReviewState))
   errors.push('Finding claimed value must be locally sourced or Needs Information');
  if(f?.valueReviewState==='locally-reviewed-claim-value'){
   if(this.parse(f?.allegedAmount)===null||!this.currency(f?.currency)||
    !E.valid(f?.amountSourceRef)||!E.valid(f?.amountReviewedBy)||!E.date(f?.amountReviewDate))
    errors.push('Documented alleged value needs exact amount, separate source and dated local money review');
  }else if(f?.allegedAmount!==null&&f?.allegedAmount!==undefined&&f?.allegedAmount!=='')
   errors.push('Unreviewed allegation must not carry an assumed monetary amount');
  if(f?.liabilityAdmitted===true||f?.AQLOverridden===true||f?.buyerApproved===true)
   errors.push('An alleged claim cannot admit liability, overwrite AQL or certify buyer decision');
  return errors;
 }
 static summarize(record){
  const E=root.VesaClaimRegister,valid=E.validate(record);
  if(!valid.ok)throw Error(valid.errors.join('; '));
  const grouped=new Map(),missing=[];
  for(const f of record.findings){
   if(f.valueReviewState!=='locally-reviewed-claim-value'){
    missing.push({findingId:f.id,category:f.category,reason:'Alleged value Needs Information',
     notSupplierLiability:true});continue;}
   const num=this.parse(f.allegedAmount);if(num===null)throw Error('Invalid locally reviewed alleged amount');
   grouped.set(f.currency,(grouped.get(f.currency)||0n)+num);
  }
  return{byCurrency:[...grouped].map(([currency,value])=>({
   currency,sourceReviewedAllegedExposure:this.fmt(value),
   notAdmittedLiability:true,notAgreedSettlement:true,notBookedReceivable:true,
   noForeignExchangeConversion:true})),
   unknownFindings:missing,officialLiability:null,notAQLApproval:true,notSettlement:true,
   noCrossCurrencyAddition:true};
 }
}
root.VesaClaimExposure=VesaClaimExposure;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaClaimExposure;
})(typeof globalThis!=='undefined'?globalThis:this);
