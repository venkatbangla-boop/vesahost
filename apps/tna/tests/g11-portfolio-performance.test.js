const os=require('os');
const {performance}=require('perf_hooks');
globalThis.VesaTnaScheduling=require('../src/scheduling.js');
globalThis.VesaTnaOperations=require('../src/operations.js');
const domain=require('../src/domain.js');
const scenarios=require('../src/scenarios.js');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const PORTFOLIO_SIZE=250;
const FULL_BUDGET_MS=8000;
const FILTER_BUDGET_MS=1000;
const base=domain.createPlan({templateId:'knit',buyerName:'Synthetic Performance Buyer',factoryName:'Synthetic Performance Factory',styleNo:'STYLE-PERF-000',poNumber:'PO-PERF-000',totalQty:1000,orderConfirmedOn:'2026-10-10',buyerRequiredExFactory:'2027-03-31'},{ownerUserId:'synthetic-performance'});
const plans=Array.from({length:PORTFOLIO_SIZE},(_,index)=>{
  const plan=JSON.parse(JSON.stringify(base)),suffix=String(index).padStart(3,'0');
  plan.recordId=`TNA-PERF-${suffix}`;
  plan.order.styles=[{...plan.order.styles[0],styleNo:`STYLE-PERF-${suffix}`}];
  plan.order.poNumbers=[`PO-PERF-${suffix}`];
  plan.operations=[{operationId:`OP-PERF-${suffix}`,datedCapacityEntries:[{resourceId:`LINE-${index%25}`,date:`2026-11-${String(index%20+1).padStart(2,'0')}`,allocatedLines:2,availableLines:10}]}];
  return plan;
});
const before=JSON.stringify(plans[0]);

scenarios.portfolioSummary(plans.slice(0,5));
const runs=[];
let summary;
for(let index=0;index<3;index++){
  const start=performance.now();
  summary=scenarios.portfolioSummary(plans);
  runs.push(performance.now()-start);
}
const sorted=[...runs].sort((a,b)=>a-b),median=sorted[1];
assert(summary.accessibleOrderCount===PORTFOLIO_SIZE,`G11 portfolio must return all ${PORTFOLIO_SIZE} synthetic orders.`);
assert(summary.orders.every((order,index)=>order.recordId===`TNA-PERF-${String(index).padStart(3,'0')}`),'G11 portfolio ordering/identity must remain deterministic.');
assert(summary.orders.every(order=>order.forecastStatus==='calculated'),'G11 large portfolio must retain calculated forecast status.');
assert(JSON.stringify(plans[0])===before,'G11 portfolio calculation must not mutate source plans.');
assert(median<FULL_BUDGET_MS,`G11 ${PORTFOLIO_SIZE}-order median ${median.toFixed(1)}ms exceeded ${FULL_BUDGET_MS}ms guardrail.`);

const filterStart=performance.now(),filtered=scenarios.portfolioSummary(plans,{po:'PO-PERF-249'}),filterMs=performance.now()-filterStart;
assert(filtered.accessibleOrderCount===1&&filtered.orders[0].recordId==='TNA-PERF-249','G11 filtered large portfolio must return the exact requested PO.');
assert(filterMs<FILTER_BUDGET_MS,`G11 filtered portfolio ${filterMs.toFixed(1)}ms exceeded ${FILTER_BUDGET_MS}ms guardrail.`);

console.log(`TNA G11 portfolio performance passed: ${PORTFOLIO_SIZE} orders / ${base.tasks.length*PORTFOLIO_SIZE} tasks · runs ${runs.map(value=>value.toFixed(1)).join('/')}ms · median ${median.toFixed(1)}ms · filtered ${filterMs.toFixed(1)}ms · Node ${process.version} · ${process.platform}/${process.arch} · ${os.cpus()[0]?.model||'CPU unavailable'} · ${Math.round(os.totalmem()/1073741824)}GiB RAM`);
