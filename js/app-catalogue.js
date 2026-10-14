(function(){
  'use strict';
  const apps=[
    {id:'aql',name:'Inspection Quality Suite',shortName:'AQL',description:'Final inspection, stage workflows, AQL sampling, evidence, quality records and reports.',route:'/apps/aql/',enabled:true,order:10,openLabelKey:'openAql'},
    {id:'ppm',name:'Pre-Production Meeting',shortName:'PPM',description:'Production readiness, approvals, measurement checks, change review and printable reports.',route:'/apps/ppm/',enabled:true,order:20,openLabelKey:'openPpm'},
    {id:'tna',name:'VESA TNA 360',shortName:'TNA',description:'Time & Action and critical path planning for apparel orders, materials, approvals, production and shipment readiness.',route:'/apps/tna/',enabled:true,order:30,openLabelKey:'openTna'},
    {id:'costing',name:'VESA Costing 360',shortName:'Costing',description:'Source-backed garment costing, no-margin FOB, fabric consumption, commissions and draft reports. Personal demo; locally saved.',route:'/apps/costing/',enabled:true,order:40,openLabelKey:'openCosting'}
  ];
  function enabled(){return apps.filter(app=>app.enabled).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name));}
  window.VesaAppCatalogue={apps,enabled};
})();
