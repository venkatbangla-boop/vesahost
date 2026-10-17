/* APP-09 stage WIP is independent of other stages and factory-wide totals.
 * Missing opening is unknown, not zero; no unreviewed event is verified.
 */
(function(root){
'use strict';
class ProductionWipBalance {
 static calculate(opening,reviewedRows){
  const n=root.VesaProductionStageFlow;
  if(opening===null||opening===undefined)return {closing:null,opening:null,verifiedIn:null,verifiedOut:null,verifiedRejects:null,pending:'Opening WIP source missing'};
  if(!n.whole(opening))throw Error('Opening WIP must be a sourced whole quantity');
  let incoming=0,outgoing=0,rejected=0;
  for(const row of reviewedRows){
   if(row.status!=='locally-reviewed')throw Error('Unreviewed movement cannot change WIP');
   if(!n.whole(row.verifiedIn)||!n.whole(row.verifiedOut)||!n.whole(row.verifiedRejects))throw Error('Invalid sourced stage movement');
   incoming+=row.verifiedIn;outgoing+=row.verifiedOut;rejected+=row.verifiedRejects;
   if(![incoming,outgoing,rejected].every(Number.isSafeInteger))throw Error('Stage movement exceeds integer limits');
  }
  const closing=opening+incoming-outgoing-rejected;
  if(!Number.isSafeInteger(closing)||closing<0)throw Error('Source-backed stage WIP cannot become negative');
  return {closing,opening,verifiedIn:incoming,verifiedOut:outgoing,verifiedRejects:rejected,pending:null};
 }
 static targetBalance(sourceTarget,cumulativeGood){
  const n=root.VesaProductionStageFlow;
  if(sourceTarget===null||sourceTarget===undefined)return null;
  if(!n.whole(sourceTarget)||!n.whole(cumulativeGood))throw Error('Invalid sourced stage target/good output');
  return sourceTarget-cumulativeGood;
 }
}
root.VesaProductionWipBalance=ProductionWipBalance;
if(typeof module!=='undefined'&&module.exports)module.exports=ProductionWipBalance;
})(typeof globalThis!=='undefined'?globalThis:this);
