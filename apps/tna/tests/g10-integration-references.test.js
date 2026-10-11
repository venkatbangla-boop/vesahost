const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const domain=require('../src/domain.js');
const links=require('../src/integration-references.js');
const storage=require('../src/storage.js');

const plan=domain.createPlan({templateId:'knit',buyerName:'Synthetic Buyer',factoryName:'Synthetic Factory',styleNo:'STYLE-G10',poNumber:'PO-G10',totalQty:1200,buyerRequiredExFactory:'2026-12-20'});
const ppm={id:'REF-PPM-G10',sourceApp:'ppm',sourceRecordId:'PPM-G10',sourceSchema:'VESA-PPM:2',sourceVersion:'5.1.5',sourceUpdatedAt:'2026-10-11T04:00:00.000Z',recordedStatus:'GO',verifiedBy:'Synthetic Reviewer',verifiedAt:'2026-10-11T04:01:00.000Z',orderIdentity:{buyer:'Synthetic Buyer',factory:'Synthetic Factory',po:'PO-G10',style:'STYLE-G10'}};
const aql={id:'REF-AQL-G10',sourceApp:'aql',sourceRecordId:'VE-20261011-G10',sourceSchema:'VESA360-PROJECT:1',sourceVersion:'R0',recordedStatus:'NOT CONFORMED',verifiedBy:'Synthetic QA',verifiedAt:'2026-10-11T04:02:00.000Z',orderIdentity:{buyer:'Synthetic Buyer',factory:'Synthetic Factory',po:'PO-G10',style:'STYLE-G10'}};

assert(links.assessReference(null,plan).state==='unavailable','G10 must expose an unavailable reference state.');
assert(links.assessReference({...ppm,verifiedBy:'',verifiedAt:''},plan).state==='unverified','G10 must not treat an unverified reference as verified.');
assert(links.assessReference({...ppm,sourceSchema:'VESA-PPM:99'},plan).state==='stale-schema','G10 must fail closed for stale source schemas.');
const conflict=links.assessReference({...ppm,orderIdentity:{...ppm.orderIdentity,po:'OTHER-PO'}},plan);
assert(conflict.state==='identity-conflict'&&conflict.mismatches.includes('po'),'G10 must report a common-order identity conflict.');

const linkedPpm=links.attachReference(plan,ppm,{actorId:'synthetic-user',eventId:'audit-link-ppm-g10',changedAt:'2026-10-11T04:03:00.000Z'});
assert(linkedPpm.ok&&linkedPpm.displayStatus==='PPM recorded GO','G10 should retain a verified PPM status as display-only source evidence.');
assert(Array.isArray(plan.integrationReferences)&&plan.integrationReferences.length===0&&plan.revision===0,'G10 linking must not mutate its input plan.');
assert(linkedPpm.plan.tasks.every((task,index)=>task.status===plan.tasks[index].status),'G10 PPM GO must never approve or complete a TNA task.');
const linkedAql=links.attachReference(linkedPpm.plan,aql,{actorId:'synthetic-user',eventId:'audit-link-aql-g10',changedAt:'2026-10-11T04:04:00.000Z'});
assert(linkedAql.ok&&linkedAql.displayStatus==='AQL recorded NOT CONFORMED','G10 should retain an AQL result without replacing AQL inspection logic.');
assert(linkedAql.plan.tasks.every((task,index)=>task.status===plan.tasks[index].status),'G10 AQL status must never infer a TNA task or shipment decision.');
assert(!links.attachReference(linkedAql.plan,ppm).ok,'G10 must reject a duplicate source record.');

const localStore=new Map();
globalThis.localStorage={getItem:key=>localStore.has(key)?localStore.get(key):null,setItem:(key,value)=>localStore.set(key,String(value)),removeItem:key=>localStore.delete(key)};
storage.savePlan(linkedAql.plan,'G10-USER');
const reopened=storage.loadPlan(linkedAql.plan.recordId,'G10-USER');
assert(reopened.integrationReferences.length===2,'G10 integration references must survive local save/reopen.');
assert(reopened.integrationReferences[0].sourceRecordId==='PPM-G10'&&reopened.integrationReferences[1].sourceRecordId==='VE-20261011-G10','G10 save/reopen must preserve exact source identities.');
assert(reopened.auditEvents.filter(event=>event.eventType==='integration-reference-linked').length===2,'G10 links must retain their local audit events.');
const removed=links.removeReference(reopened,'REF-PPM-G10',{actorId:'synthetic-user',eventId:'audit-unlink-ppm-g10',changedAt:'2026-10-11T04:05:00.000Z'});
assert(removed.ok&&removed.plan.integrationReferences.length===1&&removed.plan.integrationReferences[0].sourceApp==='aql','G10 must remove only the explicitly selected reference.');
assert(reopened.integrationReferences.length===2,'G10 removal must not mutate the input plan.');
assert(removed.plan.auditEvents.at(-1).eventType==='integration-reference-removed','G10 removal must retain an audit event.');

const source=String(links.attachReference);
assert(!/localStorage|indexedDB|fetch\(|XMLHttpRequest|\.release\s*=|\.disposition\s*=/.test(source),'G10 integration owner must not read sibling stores, call the network or write release/disposition fields.');
console.log('TNA G10 integration reference checks passed');
