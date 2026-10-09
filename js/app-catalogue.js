(function(){
  'use strict';
  const apps=[
    {id:'aql',name:'Inspection Quality Suite',shortName:'AQL',description:'Final inspection, stage workflows, AQL sampling, evidence, quality records and reports.',route:'/apps/aql/',enabled:true,order:10,openLabelKey:'openAql'},
    {id:'ppm',name:'Pre-Production Meeting',shortName:'PPM',description:'Production readiness, approvals, measurement checks, change review and printable reports.',route:'/apps/ppm/',enabled:true,order:20,openLabelKey:'openPpm'}
  ];
  function enabled(){return apps.filter(app=>app.enabled).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name));}
  window.VesaAppCatalogue={apps,enabled};
})();
