/**
 * R08 restricted Material/LC source, semantic separation and typed XLSX proof.
 * Synthetic only: no supplier prices, customer records or bank confirmations.
 * Run: node apps/tna/tests/r08-material-lc.test.js
 */
const assert=require('node:assert/strict');
const domain=require('../src/domain.js');
const reports=require('../src/reports.js');
const storage=require('../src/storage.js');
const XLSX=require('../vendor/xlsx.full.min.js');

class TnaMaterialLcProof {
  static plan(templateId){
    const plan=domain.createPlan({templateId,buyerName:'Synthetic Buyer',
      factoryName:'Synthetic Factory',styleNo:'R08-STYLE',poNumber:'SYN-PO-R08',
      totalQty:1000,orderConfirmedOn:'2026-10-01',masterLcOpenedOn:'2026-10-10',
      buyerRequiredExFactory:'2026-12-20'},{ownerUserId:'r08-synthetic'});
    plan.materials=[
      {materialId:'FAB-1',category:'fabric',supplier:'   =SUM(1,2)',country:'China',
        requiredQty:1200,unit:'kg',bookingDate:'2026-10-08',
        b2bLcApplicationDate:'2026-10-12',b2bLcOpenDate:null,
        inHouseDate:'2026-10-14',QCDate:null,shortageQty:30,
        quotedPrice:99999,remarks:'PRIVATE QUOTED PRICE DO NOT SHARE'},
      {materialId:'TR-1',category:'trims',supplier:'Sample trim supplier',
        country:'Bangladesh',requiredQty:1000,unit:'pcs',bookingDate:'2026-10-11',
        b2bLcApplicationDate:'2026-10-12',b2bLcOpenDate:'2026-10-15',
        inHouseDate:'2026-10-15',QCDate:'2026-10-16',shortageQty:null,
        pricePerUnit:555},
      {materialId:'FAB-2',category:'fabric',supplier:'Second supplier',
        country:'China',requiredQty:500,unit:'kg',bookingDate:'2026-10-09',
        b2bLcApplicationDate:null,b2bLcOpenDate:'2026-10-20',
        inHouseDate:null,QCDate:'2026-10-21',shortageQty:0}
    ];
    return plan;
  }
  static run(){
    for(const templateId of ['knit','denim']){
      const plan=this.plan(templateId),unchanged=JSON.stringify(plan);
      const opts={reportId:'R08',language:'en',
        generatedAt:'2026-10-16T05:00:00.000Z',timezone:'Asia/Dhaka',asOfDate:'2026-10-16'};
      const model=reports.buildReportModel(plan,opts),m=model.materialLc;
      assert.equal(m.schema,'VESA-TNA-MATERIAL-LC-1');
      assert.equal(m.validity,'valid');
      assert.equal(m.materials.length,3);
      assert.equal(m.counts.fabric,2);
      assert.equal(m.counts.trims,1);
      assert.equal(m.masterLc.enteredOpenedOn,'2026-10-10');
      assert.equal(m.masterLc.bankAuthenticated,false);
      assert.equal(m.masterLc.occurredAsOf,true);
      assert.equal(m.materials[0].b2bApplicationDate,'2026-10-12');
      assert.equal(m.materials[0].b2bOpenDate,null,'Application is NOT LC open.');
      assert.equal(m.materials[0].b2bState,m.labels.application);
      assert.equal(m.materials[0].shortageQty,30);
      assert.equal(m.materials[0].qcAccepted,false);
      assert.equal(m.materials[0].cuttingReleased,false);
      assert.equal(m.materials[1].b2bOccurredAsOf,true);
      assert.equal(m.materials[1].qcDate,'2026-10-16');
      assert.equal(m.materials[1].shortageQty,null,'Blank must remain unknown, not default zero.');
      assert.equal(m.materials[1].qcAccepted,false,'A QC date is not QC acceptance.');
      assert.equal(m.materials[2].b2bOccurredAsOf,false,'Future entered LC date not opened as of.');
      assert.equal(m.materials[2].openAfterAsOf,true);
      assert.equal(m.materials[2].shortageQty,0);
      assert(m.materials.every(row=>!row.bankAuthenticated&&!row.cuttingReleased));
      assert(!JSON.stringify(m).includes('PRIVATE QUOTED PRICE'));
      assert(!JSON.stringify(m).includes('99999'));
      assert(!JSON.stringify(m).includes('555'));
      for(const language of ['en','bn','hi','ta']){
        const other=reports.buildReportModel(plan,{...opts,language}).materialLc;
        assert.equal(other.counts.total,3);
        assert(other.labels.sourceWarning&&other.labels.lcColumns.length===5);
      }
      const invalid=reports.buildReportModel(plan,{...opts,timezone:''}).materialLc;
      assert.equal(invalid.validity,'incomplete');
      assert.equal(invalid.materials.length,0);
      const empty=reports.buildReportModel({...plan,materials:[]},opts).materialLc;
      assert.equal(empty.validity,'valid');
      assert.equal(empty.materials.length,0);
      assert(empty.warnings.includes(empty.labels.noMaterials));
      const blocked=reports.buildReportModel(plan,{...opts,audienceMode:'buyer'});
      assert.equal(blocked.materialLc.validity,'restricted');
      assert.deepEqual(blocked.materialLc.materials,[]);
      assert.equal(blocked.tasks.length,0);
      const blockedText=JSON.stringify(blocked);
      for(const token of ['Synthetic Buyer','Synthetic Factory','Sample trim supplier',
        'FAB-1','R08-STYLE','99999','PRIVATE QUOTED PRICE']){
        assert(!blockedText.includes(token),'External source data leak '+token);
      }
      const wb=XLSX.read(storage.exportReportWorkbook(model),{type:'buffer',cellNF:true,cellFormula:true});
      assert.deepEqual(wb.SheetNames,['Report Summary','Order Summary','Report Activities','Report Notes','Material & LC','LC Milestones']);
      const sheet=wb.Sheets['Material & LC'];
      assert.equal(sheet.E2.t,'n');
      assert.equal(sheet.E2.v,1200);
      assert.equal(sheet.L2.t,'n');
      assert.equal(sheet.L2.v,30);
      assert.equal(sheet.L3.t,'s','Absent shortage must be text, not numeric zero.');
      assert.equal(sheet.G2.t,'n');
      assert.equal(sheet.G2.z,'yyyy-mm-dd');
      assert.equal(sheet.H2.t,'n');
      assert.equal(sheet.I2.t,'s','Application cannot be converted to opened date.');
      assert(sheet.C2.v.startsWith("'"),'Supplier formula must be inert text.');
      const lc=wb.Sheets['LC Milestones'];
      assert.equal(lc.D2.t,'n','Master open date cell typed but bank status unverified.');
      assert.equal(lc.C3.t,'n','B2B application typed.');
      assert.equal(lc.D3.t,'s','Blank B2B open remains unknown.');
      for(const x of Object.values(wb.Sheets))assert(!Object.values(x).some(c=>c?.f));
      const ext=XLSX.read(storage.exportReportWorkbook(blocked),{type:'buffer'});
      assert(!JSON.stringify(ext.Sheets).includes('Synthetic Factory'));
      assert(!JSON.stringify(ext.Sheets).includes('FAB-1'));
      assert.equal(JSON.stringify(plan),unchanged,'Report must never update source plan.');
      const older=reports.buildReportModel(plan,{...opts,reportId:'R07'});
      assert(!older.materialLc,'R07 model must remain isolated.');
    }
    console.log('TNA R08 PASS: knit/denim master vs B2B, application vs opening, QC date/no approval, typed shortages, future dates, no prices, EN/BN/HI/TA, restricted external, safe Excel and source immutability.');
  }
}
TnaMaterialLcProof.run();
