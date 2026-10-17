(function(){
  'use strict';
  const apps=[
    {id:'aql',name:'Inspection Quality Suite',shortName:'AQL',description:'Final inspection, stage workflows, AQL sampling, evidence, quality records and reports.',route:'/apps/aql/',enabled:true,order:10,openLabelKey:'openAql'},
    {id:'ppm',name:'Pre-Production Meeting',shortName:'PPM',description:'Production readiness, approvals, measurement checks, change review and printable reports.',route:'/apps/ppm/',enabled:true,order:20,openLabelKey:'openPpm'},
    {id:'tna',name:'VESA TNA 360',shortName:'TNA',description:'Time & Action and critical path planning for apparel orders, materials, approvals, production and shipment readiness.',route:'/apps/tna/',enabled:true,order:30,openLabelKey:'openTna'},
    {id:'costing',name:'VESA Costing 360',shortName:'Costing',description:'Source-backed garment costing, no-margin FOB, fabric consumption, commissions and draft reports. Personal demo; locally saved.',route:'/apps/costing/',enabled:true,order:40,openLabelKey:'openCosting'},
    {id:'packing-container',name:'VESA Packing & Container 360',shortName:'Packing',description:'Personal non-commercial demo (synthetic data only): carton packing, CBM, sourced container comparison and draft reports.',route:'/apps/packing-container/',enabled:true,order:50,openLabelKey:'openPacking'},
    {id:'order-commission',name:'VESA Order & Commission 360',shortName:'Commission',description:'Personal non-commercial demo (synthetic data only): sourced commission agreements, earned/invoice/receipt records and draft reports.',route:'/apps/order-commission/',enabled:true,order:60,openLabelKey:'openCommission'},
    {id:'tech-pack-spec',name:'VESA Tech Pack & Spec 360',shortName:'Tech Pack',description:'Personal non-commercial demo (synthetic data only): sourced garment POM sizes, grades, tolerances, BOM and revision reports.',route:'/apps/tech-pack-spec/',enabled:true,order:70,openLabelKey:'openTechSpec'},
    {id:'purchase-order',name:'VESA Purchase Order 360',shortName:'Purchase Order',description:'Personal non-commercial demo (synthetic only): sourced PO lines, reconciled controls, separate factory confirmation, signed-source revisions and draft reports.',route:'/apps/purchase-order/',enabled:true,order:80,openLabelKey:'openPurchaseOrder'}
  ];
  function enabled(){return apps.filter(app=>app.enabled).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name));}
  window.VesaAppCatalogue={apps,enabled};
})();
