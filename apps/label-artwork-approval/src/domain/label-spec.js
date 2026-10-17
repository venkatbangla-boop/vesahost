/* APP-10 pure source-bound label and artwork technical fields; no regulatory approval.
 * Validation never allocates GS1 IDs or assumes a readable/scannable printed barcode.
 */
(function(root){
'use strict';
class VesaLabelSpec {
 static text(v){return typeof v==='string'?v.trim():'';}
 static number(v){
  if(!['string','number'].includes(typeof v))return null;
  const s=String(v).trim();
  if(!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,3})?$/.test(s))return null;
  const x=Number(s);return Number.isFinite(x)&&x>0&&x<=100000?x:null;
 }
 static barcodeStatus(entry){
  if(!entry||typeof entry!=='object'||Array.isArray(entry))
   return{valid:null,warning:'Barcode number Needs Information; no GS1 ID allocated',notScannerCertified:true};
  const kind=this.text(entry.symbology).toLowerCase(),
   len=({'gtin-8':8,'upc-a':12,'ean-13':13,'gtin-14':14})[kind],
   code=this.text(entry.value);
  if(!len||!/^[0-9]+$/.test(code)||code.length!==len)
   return{valid:false,warning:'Barcode length/digits do not match declared symbology',notScannerCertified:true};
  let sum=0;
  for(let i=len-2,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=Number(code[i])*weight;
  const expected=(10-sum%10)%10;
  const valid=Number(code[len-1])===expected;
  return {valid,expectedCheckDigit:String(expected),
   warning:valid?'Mod-10 check digit matches; GS1 ownership and printed scan NOT verified':'Invalid supplied barcode check digit; source must correct number',
   notScannerCertified:true,gs1OwnershipVerified:false};
 }
 static check(spec){
  const errors=[];
  if(!spec||typeof spec!=='object'||Array.isArray(spec))return['Label/artwork dimensions require a sourced object'];
  const width=spec.width,height=spec.height;
  const anyDim=(width!==undefined&&width!==null&&width!=='')||(height!==undefined&&height!==null&&height!=='');
  if(anyDim){
   if(this.number(width)===null||this.number(height)===null||
     !['mm','cm','in'].includes(this.text(spec.unit)))
    errors.push('Dimensions require positive width and height with exact mm/cm/in unit; no default conversion');
   if(!this.text(spec.dimensionSourceRef))errors.push('Dimensions require original source evidence');
  }
  if(spec.repeatCount!==undefined&&spec.repeatCount!==null&&spec.repeatCount!==''){
   if(!Number.isSafeInteger(spec.repeatCount)||spec.repeatCount<1||spec.repeatCount>10000||
      !this.text(spec.repeatSourceRef))
     errors.push('Repeat count requires positive whole number and named source');
  }
  for(const key of ['method','colourRef','washCareText','fiberText','countryText','contentSourceRef']){
   if(spec[key]!==undefined&&(typeof spec[key]!=='string'||spec[key].length>4000))
    errors.push('Label source content oversized or invalid: '+key);
  }
  if(['washCareText','fiberText','countryText'].some(k=>this.text(spec[k]))&&!this.text(spec.contentSourceRef))
   errors.push('Care/fiber/country text requires explicit approved-source reference; no inferred legal accuracy');
  if(spec.barcode!==undefined&&spec.barcode!==null){
   if(!spec.barcode||typeof spec.barcode!=='object'||Array.isArray(spec.barcode)||
     !this.text(spec.barcode.sourceRef)||this.text(spec.barcode.sourceRef).length>250)
    errors.push('Typed barcode requires sourced artwork/number evidence');
   else if(this.barcodeStatus(spec.barcode).warning.startsWith('Barcode length/digits'))
    errors.push('Barcode format requires exactly matching GTIN-8, UPC-A, EAN-13 or GTIN-14 digits');
   // A wrong check digit is a visible WARNING, not automatic correction or deletion.
  }
  return errors;
 }
 static describe(spec){
  const report={unit:this.text(spec?.unit)||null,width:this.number(spec?.width),height:this.number(spec?.height),
   repeatCount:Number.isSafeInteger(spec?.repeatCount)?spec.repeatCount:null,
   containsUnverifiedCareText:['washCareText','fiberText','countryText'].some(k=>!!this.text(spec?.[k])),
   regulatoryVerified:false};
  if(spec?.barcode)report.barcode=this.barcodeStatus(spec.barcode);
  return report;
 }
}
root.VesaLabelSpec=VesaLabelSpec;
if(typeof module!=='undefined'&&module.exports)module.exports=VesaLabelSpec;
})(typeof globalThis!=='undefined'?globalThis:this);
