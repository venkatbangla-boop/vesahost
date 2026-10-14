(function(root){
  'use strict';

  const SCHEMA_VERSION='TNA360-ORDERPLAN-1.1.0';
  const TEMPLATE_VERSION='2026.10.g02';
  const DATE_KEYS=['baselineStart','baselineFinish','currentTargetStart','currentTargetFinish','forecastStart','forecastFinish','actualStart','actualFinish'];
  const STATUSES=['not-started','in-progress','submitted','awaiting-approval','approved','rejected','blocked','completed','waived','not-applicable'];
  const RISK_STATUSES=['on-track','at-risk','delayed','blocked','needs-information'];
  // User-declared commercial milestones and follow-up parties are not inferred
  // from the task owner or a nominal approval/delivery date.
  const MASTER_LC_STATUSES=Object.freeze(['unknown','not-applicable','pending','opened','amended','cancelled']);
  const WAITING_PARTIES=Object.freeze(['','buyer','local-office','factory','fabric-supplier','trim-supplier','merchant','logistics']);
  const STAGE_LABELS={
    O:'Order / commercial',D:'Product development and approvals',FA:'Fabric approvals',FP:'Fabric procurement / manufacturing',
    TR:'Trims and accessories',PP:'Pre-production readiness',C:'Cutting / preparations',P:'Sewing, wash, finishing',
    Q:'Quality',PK:'Packing',S:'Shipment'
  };
  const rawActivities=[
    ['O01','Enquiry / inquiry received','O','milestone','merchant',0],['O02','Costing & consumption confirmation','O','gate','merchant',0],['O03','Price / FOB agreement','O','gate','commercial',0],['O04','Tech pack / BOM revision received','O','milestone','buyer',0],['O05','PO receipt','O','milestone','buyer',0],['O06','Order acceptance and agreed ship terms','O','gate','merchant',0],['O07','Proforma invoice issue / sign-off','O','milestone','commercial',0],['O08','Master LC requested','O','milestone','commercial',0,'lc'],['O09','Master LC opened / authenticated','O','gate','commercial',0,'lc'],['O10','Deposit / TT milestone','O','milestone','commercial',0,'tt'],['O11','Buyer delivery baseline confirmed','O','gate','buyer',0],['O12','TNA reviewed and baseline confirmed','O','gate','merchant',0],
    ['D01','Development tech pack check','D','work','technical',1],['D02','Pattern / block development','D','work','technical',3],['D03','Proto / first sample submit','D','milestone','sample-room',0],['D04','Proto comments received','D','milestone','buyer',0],['D05','Fit sample submit','D','milestone','sample-room',0],['D06','Fit comments received','D','milestone','buyer',0],['D07','Re-fit / revised sample','D','work','sample-room',2],['D08','Fit approval recorded','D','gate','buyer',0],['D09','Graded pattern / size-set prep','D','work','technical',2],['D10','Size-set/size-run submit','D','milestone','sample-room',0],['D11','Size-set comments/approval','D','gate','buyer',0],['D12','PP sample start','D','work','sample-room',1],['D13','PP sample submit','D','milestone','sample-room',0],['D14','PP sample approval or written waiver','D','gate','buyer',0],['D15','Packaging artwork / label artwork submission','D','milestone','merchant',0],['D16','Packaging / label artwork approval','D','gate','buyer',0],['D17','Print/embroidery strike-off submission','D','milestone','processor',0,'decoration'],['D18','Print/embroidery approval','D','gate','buyer',0,'decoration'],['D19','Wash standard / shade standard submit','D','milestone','processor',0,'wash'],['D20','Wash standard approval','D','gate','buyer',0,'wash'],
    ['FA01','Yarn/fabric quality selection / specification confirmation','FA','gate','fabric-team',0],['FA02','Lab dip / shade standard prepared','FA','work','fabric-supplier',2],['FA03','Lab dip submitted','FA','milestone','fabric-supplier',0],['FA04','Lab dip comments / resubmission','FA','milestone','buyer',0],['FA05','Lab dip approved','FA','gate','buyer',0],['FA06','Fabric hand-feel / construction sample approval','FA','gate','buyer',0],['FA07','Fabric testing submission','FA','milestone','lab',0],['FA08','Lab results received / reviewed','FA','gate','lab',0],['FA09','Strike-off / AOP approval if applicable','FA','gate','buyer',0,'aop'],['FA10','Fabric bulk-release authorization','FA','gate','fabric-team',0],
    ['FP01','Fabric consumption and required quantity confirmed','FP','gate','fabric-team',0],['FP02','Yarn / fabric PO or nominated supplier booking','FP','milestone','fabric-team',0],['FP03','Fabric B2B LC application if required','FP','milestone','commercial',0,'fabric-lc'],['FP04','Fabric B2B LC opened if required','FP','gate','commercial',0,'fabric-lc'],['FP05','Yarn in-house / availability','FP','milestone','fabric-supplier',0,'yarn'],['FP06','Knitting / weaving start','FP','milestone','fabric-supplier',0,'manufacture'],['FP07','Knitting / weaving completion','FP','milestone','fabric-supplier',0,'manufacture'],['FP08','Greige inspection / relaxation','FP','work','fabric-supplier',1,'greige'],['FP09','Dyeing / printing start','FP','milestone','fabric-supplier',0,'dyeing'],['FP10','Dyeing / printing finish','FP','milestone','fabric-supplier',0,'dyeing'],['FP11','Finishing, width/GSM/shrinkage control','FP','work','fabric-supplier',1,'manufacture'],['FP12','Supplier bulk fabric final inspection','FP','gate','fabric-team',0,'manufacture'],['FP13','Export / import paperwork, customs','FP','work','logistics',3,'imported'],['FP14','Fabric dispatch / transit','FP','milestone','logistics',0],['FP15','Fabric arrival / in-house','FP','milestone','factory',0],['FP16','In-house fabric inspection / shrinkage / shade grouping','FP','work','quality',1],['FP17','Fabric available for cutting release','FP','gate','factory',0],
    ['TR01','BOM / trim specification confirmation','TR','gate','merchant',0],['TR02','Trim artwork, label text, barcode confirmation','TR','gate','buyer',0],['TR03','Trim submission / fit check','TR','milestone','trim-supplier',0],['TR04','Trim buyer/local-office approval','TR','gate','buyer',0],['TR05','Trims purchase / supplier booking','TR','milestone','merchant',0],['TR06','Trims B2B LC application if required','TR','milestone','commercial',0,'trim-lc'],['TR07','Trims B2B LC opening if required','TR','gate','commercial',0,'trim-lc'],['TR08','Trims manufacture start','TR','milestone','trim-supplier',0],['TR09','Trims production complete','TR','milestone','trim-supplier',0],['TR10','Supplier trims testing / inspection','TR','gate','quality',0],['TR11','Shipping / transit / customs if required','TR','work','logistics',2,'imported-trims'],['TR12','Trims in-house','TR','milestone','factory',0],['TR13','Trims inspection & issue to production','TR','gate','quality',0],['TR14','Extra trims / shortage replenishment if required','TR','work','merchant',2,'shortage'],
    ['PP01','Approved pattern, tech pack, BOM verified','PP','gate','technical',0],['PP02','Fit / PP / trim / fabric / print / wash approvals verified','PP','gate','merchant',0],['PP03','Garment performance / GPT test when required','PP','gate','lab',0,'performance'],['PP04','Pilot / trial cut / shrinkage plan','PP','work','factory',1],['PP05','Size set / pre-production trial','PP','work','factory',1],['PP06','PPM scheduled','PP','milestone','merchant',0],['PP07','PPM completed with issues/actions','PP','milestone','merchant',0],['PP08','PPM decision verified through explicit record/evidence','PP','gate','merchant',0],['PP09','Critical PPM action closure if required','PP','gate','merchant',0],['PP10','Production / cutting release authorized','PP','gate','factory',0],
    ['C01','Fabric allocation, rolls/shade grouping','C','work','cutting',1],['C02','Relaxation / spreading plan','C','work','cutting',1,'relaxation'],['C03','Marker / ratio / lay approval','C','gate','technical',0],['C04','Pilot cutting or cutting start','C','milestone','cutting',0],['C05','Cutting output update','C','work','cutting',1],['C06','Cutting complete for lot','C','milestone','cutting',0],['C07','Panel inspection / bundling','C','gate','quality',0],['C08','Print / embroidery / panel processing issue','C','milestone','processor',0,'decoration'],['C09','Print / embroidery / panel processing return','C','milestone','processor',0,'decoration'],['C10','Ready panels available to sewing','C','gate','sewing',0],
    ['P01','Sewing line allocation / input date','P','milestone','sewing',0],['P02','Sewing daily output, WIP and balance','P','work','sewing',1],['P03','Sewing completion for lot','P','milestone','sewing',0],['P04','Garment wash / dye / finishing start','P','milestone','wash',0,'wash'],['P05','Garment wash / dye / finishing complete','P','milestone','wash',0,'wash'],['P06','Measurement / inline / midline quality checks','P','gate','quality',0],['P07','Finishing, trimming, ironing start','P','milestone','finishing',0],['P08','Finishing / ironing complete','P','milestone','finishing',0],['P09','Rework / repair / shortage replenishment','P','work','factory',1,'shortage'],['P10','Packed-garment readiness','P','gate','packing',0],
    ['Q01','Fabric IQC / accessories IQC verified','Q','gate','quality',0],['Q02','Inline inspection if required','Q','gate','quality',0],['Q03','Midline inspection if required','Q','gate','quality',0],['Q04','Final testing / laboratory submission if required','Q','milestone','lab',0,'performance'],['Q05','Final laboratory results / hold resolution','Q','gate','lab',0,'performance'],['Q06','Final inspection booking','Q','milestone','quality',0],['Q07','Final inspection performed','Q','milestone','quality',0],['Q08','Verified final inspection decision / required disposition','Q','gate','quality',0],
    ['PK01','Folding / labels / packing materials readiness','PK','gate','packing',0],['PK02','Packing start','PK','milestone','packing',0],['PK03','Packing output update','PK','work','packing',1],['PK04','Packing complete per lot','PK','milestone','packing',0],['PK05','Carton/pallet packing list / barcode verification','PK','gate','packing',0],
    ['S01','Freight forwarder / vessel / air booking','S','milestone','logistics',0],['S02','Shipping marks / carton dimension and documents verified','S','gate','logistics',0],['S03','Ex-factory preparation','S','work','logistics',1],['S04','Ex-factory actual handover','S','milestone','logistics',0],['S05','Customs / handover / terminal acceptance','S','milestone','logistics',0],['S06','ETD planned / updated / actual','S','milestone','logistics',0],['S07','ETA / destination arrival if contracted and verified','S','milestone','logistics',0],['S08','Documents submitted / accepted','S','gate','commercial',0],['S09','Short shipment / balance order follow-up','S','work','merchant',1,'shortage'],['S10','Commercial/order closure and lesson notes','S','milestone','merchant',0]
  ];
  const ACTIVITY_LIBRARY=rawActivities.map(([templateRef,title,stageCode,taskKind,ownerParty,durationUnits,condition])=>Object.freeze({
    templateRef,title,stageCode,stage:STAGE_LABELS[stageCode],taskKind,ownerParty,durationUnits,durationBasis:'working',condition:condition||null
  }));
  const stageSet={
    all:['O','D','FA','FP','TR','PP','C','P','Q','PK','S'],
    sweater:['O','D','FA','FP','TR','PP','P','Q','PK','S']
  };
  const TEMPLATE_PROFILES=Object.freeze({
    knit:Object.freeze({id:'knit',name:'Knit T-shirt / polo',construction:'knit',version:TEMPLATE_VERSION,stages:stageSet.all,include:['yarn','manufacture','dyeing','relaxation'],defaultFlags:['lab-dip']}),
    hoodie:Object.freeze({id:'hoodie',name:'Hoodie / jogger / sweatshirt',construction:'knit-heavy',version:TEMPLATE_VERSION,stages:stageSet.all,include:['yarn','manufacture','dyeing','relaxation'],defaultFlags:['lab-dip','performance']}),
    woven:Object.freeze({id:'woven',name:'Woven shirts / shorts / trousers',construction:'woven',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation'],defaultFlags:['lab-dip']}),
    denim:Object.freeze({id:'denim',name:'Jeans / denim',construction:'denim',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','dyeing','wash','relaxation'],defaultFlags:['wash','lab-dip']}),
    sweater:Object.freeze({id:'sweater',name:'Sweater / fully fashioned',construction:'fully-fashioned',version:TEMPLATE_VERSION,stages:stageSet.sweater,include:['yarn','manufacture','dyeing'],exclude:['C01','C02','C03','C04','C05','C06','C07','C10'],defaultFlags:[]}),
    dress:Object.freeze({id:'dress',name:'Dress / skirt',construction:'mixed',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation'],defaultFlags:['lab-dip']}),
    outerwear:Object.freeze({id:'outerwear',name:'Jacket / outerwear',construction:'outerwear',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation','performance'],defaultFlags:['performance']}),
    activewear:Object.freeze({id:'activewear',name:'Activewear',construction:'stretch',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation','performance'],defaultFlags:['performance','lab-dip']}),
    kidswear:Object.freeze({id:'kidswear',name:'Kidswear',construction:'kidswear',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation','performance'],defaultFlags:['performance']}),
    intimates:Object.freeze({id:'intimates',name:'Intimates',construction:'intimates',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation','performance'],defaultFlags:['performance']}),
    uniform:Object.freeze({id:'uniform',name:'Uniform / workwear',construction:'workwear',version:TEMPLATE_VERSION,stages:stageSet.all,include:['manufacture','relaxation','performance'],defaultFlags:['performance']}),
    custom:Object.freeze({id:'custom',name:'Custom',construction:'custom',version:TEMPLATE_VERSION,stages:stageSet.all,include:[],defaultFlags:[]})
  });
  const clone=value=>JSON.parse(JSON.stringify(value));
  const clean=value=>String(value??'').trim();
  function normalizeColorSizeBreakdown(value){
    const source=Array.isArray(value)?value:String(value??'').split(/\r?\n/).filter(line=>clean(line));
    const rows=[],errors=[],seen=new Set();
    if(source.length>500)errors.push('Color / size breakdown cannot exceed 500 rows.');
    source.slice(0,500).forEach((item,index)=>{
      const parts=Array.isArray(value)?[item?.color,item?.size,item?.quantity]:String(item).split(/\s*[|\t,]\s*/);
      const color=clean(parts[0]),size=clean(parts[1]),quantity=Number(parts[2]);
      if(parts.length!==3||!color||!size||!Number.isInteger(quantity)||quantity<=0){
        errors.push(`Color / size row ${index+1} must contain Color | Size | positive whole quantity.`);
        return;
      }
      if(color.length>100||size.length>100){errors.push(`Color / size row ${index+1} exceeds 100 characters.`);return;}
      const key=`${color.toLocaleLowerCase()}\u0000${size.toLocaleLowerCase()}`;
      if(seen.has(key)){errors.push(`Color / size row ${index+1} duplicates ${color} / ${size}.`);return;}
      seen.add(key);rows.push({color,size,quantity});
    });
    return {rows,errors};
  }
  const makeId=prefix=>prefix+'-'+(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36));
  const now=()=>new Date().toISOString();
  function flagsFrom(input){return Array.from(new Set([...(input.processFlags||[]),...(TEMPLATE_PROFILES[input.templateId]?.defaultFlags||[])].map(clean).filter(Boolean)));}
  function isIncluded(activity,profile,flags,input){
    if(!profile.stages.includes(activity.stageCode))return false;
    if(profile.exclude?.includes(activity.templateRef))return false;
    if(!activity.condition)return true;
    if(profile.include.includes(activity.condition))return true;
    if(flags.includes(activity.condition))return true;
    if(activity.condition==='imported')return input.fabricRoute==='imported-finished'||input.fabricRoute==='imported-greige';
    if(activity.condition==='greige')return input.fabricRoute==='imported-greige'||input.fabricRoute==='local-manufactured';
    if(activity.condition==='fabric-lc')return input.fabricPayment==='b2b-lc';
    if(activity.condition==='trim-lc')return input.trimPayment==='b2b-lc';
    if(activity.condition==='imported-trims')return input.trimRoute==='imported';
    if(activity.condition==='decoration')return flags.some(flag=>['print','embroidery','heat-transfer','sublimation','decoration'].includes(flag));
    if(activity.condition==='wash')return flags.some(flag=>['wash','garment-dye','denim-wash'].includes(flag));
    if(activity.condition==='aop')return flags.includes('aop');
    if(activity.condition==='shortage')return false;
    return false;
  }
  function buildTasks(input){
    const profile=TEMPLATE_PROFILES[input.templateId]||TEMPLATE_PROFILES.custom;
    const flags=flagsFrom({...input,templateId:profile.id});
    return ACTIVITY_LIBRARY.filter(activity=>isIncluded(activity,profile,flags,input)).map((activity,index)=>({
      taskId:makeId('task'),
      templateRef:activity.templateRef,
      title:activity.title,
      stage:activity.stage,
      stageCode:activity.stageCode,
      taskKind:activity.taskKind,
      applicability:'required',
      ownerParty:activity.ownerParty,
      waitingFor:'',
      ownerUserId:null,
      calendarId:'default',
      durationUnits:activity.durationUnits,
      durationBasis:activity.durationBasis,
      scheduleMode:'calculated',
      progressMethod:activity.taskKind==='milestone'?'milestone':'manual',
      status:'not-started',
      dates:Object.fromEntries(DATE_KEYS.map(key=>[key,null])),
      quantity:{required:null,completed:null,unit:input.unit||'pcs'},
      proofRefs:[],
      delayReason:'',
      recoveryAction:'',
      riskOverrideReason:null,
      riskStatus:'needs-information',
      isRequiredGate:activity.taskKind==='gate',
      displayOrder:index+1,
      lastChangedBy:null,
      lastChangedAt:null
    }));
  }
  function requiredUnknowns(input){
    const checks={buyerName:'Buyer',factoryName:'Factory',styleNo:'Style',poNumber:'PO / order reference',totalQty:'Total quantity',buyerRequiredExFactory:'Buyer required ex-factory date'};
    return Object.entries(checks).filter(([key])=>!clean(input[key])).map(([,label])=>label);
  }
  function createPlan(input={},context={}){
    const template=TEMPLATE_PROFILES[input.templateId]||TEMPLATE_PROFILES.custom;
    const createdAt=now();
    const flags=flagsFrom({...input,templateId:template.id});
    const poNumbers=clean(input.poNumber)?[clean(input.poNumber)]:[];
    const breakdown=normalizeColorSizeBreakdown(input.colorSizeBreakdown);
    const colorways=[...new Set(breakdown.rows.map(row=>row.color))];
    const styles=clean(input.styleNo)?[{styleNo:clean(input.styleNo),description:clean(input.styleDescription),colorways,sizeRange:clean(input.sizeRange)}]:[];
    const tasks=buildTasks({...input,templateId:template.id,processFlags:flags});
    const edges=tasks.slice(1).map((task,index)=>({edgeId:makeId('edge'),predecessorTaskId:tasks[index].taskId,successorTaskId:task.taskId,relation:'FS',lagUnits:0,lagBasis:'working',calendarPolicy:'successor'}));
    const plan={
      schemaVersion:SCHEMA_VERSION,recordId:makeId('tna'),createdAt,updatedAt:createdAt,revision:0,mode:context.mode||'local',recordStatus:'draft',
      tenantId:context.tenantId||null,ownerUserId:context.ownerUserId||'local-browser-user',visibilityPolicyId:'local-private',permissionsSnapshot:{mode:'local-browser-only'},
      order:{buyerId:null,buyerName:clean(input.buyerName),brand:clean(input.brand),factoryId:null,factoryName:clean(input.factoryName),vendor:clean(input.vendor),sourcingAgent:clean(input.sourcingAgent),poNumbers,styles,productProfile:template.id,construction:clean(input.construction)||template.construction,destinationMarket:clean(input.destinationMarket),portOfLoading:clean(input.portOfLoading),portOfDischarge:clean(input.portOfDischarge),fabricSpec:clean(input.fabricSpec),fabricWeightGsm:input.fabricWeightGsm===''||input.fabricWeightGsm==null?null:Number(input.fabricWeightGsm),fabricRoute:clean(input.fabricRoute)||'unknown',trimRoute:clean(input.trimRoute)||'unknown',processFlags:flags,techPackRevision:clean(input.techPackRevision),buyerManualRevision:clean(input.buyerManualRevision),composition:clean(input.composition),colorSizeBreakdown:breakdown.rows,totalQty:input.totalQty===''||input.totalQty==null?null:Number(input.totalQty),unit:clean(input.unit)||'pcs',incoterm:clean(input.incoterm),shipmentMethod:clean(input.shipmentMethod),currency:clean(input.currency),commercialNotes:clean(input.commercialNotes)},
      commitments:{orderConfirmedOn:clean(input.orderConfirmedOn)||null,poReceivedOn:clean(input.poReceivedOn)||null,masterLcOpenedOn:clean(input.masterLcOpenedOn)||null,masterLcStatus:clean(input.masterLcStatus)||'unknown',masterLcProofRef:clean(input.masterLcProofRef),leadTimeAnchor:clean(input.leadTimeAnchor)||'unknown',leadTimeBasis:clean(input.leadTimeBasis)||'calendar',contractualLeadDays:input.contractualLeadDays?Number(input.contractualLeadDays):null,buyerRequiredExFactory:clean(input.buyerRequiredExFactory)||null,buyerRequiredETD:clean(input.buyerRequiredETD)||null,buyerRequiredETA:clean(input.buyerRequiredETA)||null,destinationRequiredDate:clean(input.destinationRequiredDate)||null},
      calendars:[{calendarId:'default',name:'Default order calendar',weekendDays:[],holidays:[],source:'user-not-configured'}],
      selectedCalendarIds:['default'],templateId:template.id,templateVersion:template.version,tasks,edges,approvals:[],materials:[],suppliers:[],operations:[],quantityLedger:[],shipmentLots:[],constraints:[],baselineSnapshots:[],revisionEvents:[],auditEvents:[{eventId:makeId('audit'),eventType:'created-draft',actorId:context.ownerUserId||'local-browser-user',createdAt,details:{unknownFields:requiredUnknowns(input),templateId:template.id}}],evidenceReferences:[],scenarioBranches:[],integrationReferences:[],notificationPolicies:[],uiPreferences:{}
    };
    plan.unknownFields=requiredUnknowns(input);
    const validation=validatePlan(plan,{inputErrors:breakdown.errors});
    plan.validation=validation;
    return plan;
  }
  function validatePlan(plan,options={}){
    const errors=[...(options.inputErrors||[])],warnings=[];
    if(plan.schemaVersion!==SCHEMA_VERSION)errors.push('Unsupported TNA schema version.');
    if(!clean(plan.recordId))errors.push('Missing recordId.');
    if(!STATUSES.includes(plan.tasks?.[0]?.status||'not-started'))warnings.push('Task statuses will be checked per task.');
    if(!plan.order?.buyerName)warnings.push('Buyer is missing.');
    if(!plan.order?.factoryName)warnings.push('Factory is missing.');
    if(!plan.order?.styles?.length)warnings.push('Style is missing.');
    if(!plan.order?.poNumbers?.length)warnings.push('PO / order reference is missing.');
    if(plan.order?.totalQty!=null && (!(Number.isFinite(plan.order.totalQty)) || plan.order.totalQty<=0))errors.push('Total quantity must be a positive number.');
    const gsm=plan.order?.fabricWeightGsm;
    if(gsm!==null&&gsm!==undefined&&(!Number.isFinite(gsm)||gsm<=0))errors.push('Fabric GSM must be a positive, documented number.');
    const lcStatus=plan.commitments?.masterLcStatus;
    if(lcStatus!==null&&lcStatus!==undefined&&!MASTER_LC_STATUSES.includes(lcStatus))errors.push('Invalid Master LC status.');
    const lcDate=plan.commitments?.masterLcOpenedOn;
    if(lcDate&&!validDateOnly(lcDate))errors.push('Master LC opened date must use a valid YYYY-MM-DD date.');
    if(['opened','amended'].includes(lcStatus)&&(!lcDate||!clean(plan.commitments?.masterLcProofRef)))errors.push('Opened or amended Master LC requires an actual date and source reference.');
    if(lcStatus==='not-applicable'&&lcDate)errors.push('Master LC cannot be marked not applicable while an opened date is recorded.');
    const breakdown=normalizeColorSizeBreakdown(plan.order?.colorSizeBreakdown||[]);
    errors.push(...breakdown.errors);
    if(breakdown.rows.length&&Number.isFinite(plan.order?.totalQty)){
      const breakdownQty=breakdown.rows.reduce((sum,row)=>sum+row.quantity,0);
      if(breakdownQty!==plan.order.totalQty)warnings.push(`Color / size breakdown totals ${breakdownQty}, not the order quantity ${plan.order.totalQty}.`);
    }
    if(!plan.commitments?.buyerRequiredExFactory)warnings.push('Buyer required ex-factory date is missing.');
    const taskIds=new Set();
    for(const task of plan.tasks||[]){
      if(taskIds.has(task.taskId))errors.push('Duplicate taskId: '+task.taskId);
      taskIds.add(task.taskId);
      if(!ACTIVITY_LIBRARY.some(activity=>activity.templateRef===task.templateRef) && !String(task.templateRef||'').startsWith('CUSTOM'))errors.push('Unknown templateRef: '+task.templateRef);
      if(!STATUSES.includes(task.status))errors.push('Invalid status for '+task.title);
      if(task.waitingFor!==undefined&&!WAITING_PARTIES.includes(task.waitingFor))errors.push('Invalid waiting party for '+task.title);
      if(!RISK_STATUSES.includes(task.riskStatus))warnings.push('Invalid or missing risk status for '+task.title);
      for(const key of DATE_KEYS)if(!(key in (task.dates||{})))errors.push('Task date field missing '+key+' for '+task.title);
    }
    for(const edge of plan.edges||[]){
      if(edge.predecessorTaskId===edge.successorTaskId)errors.push('Dependency cannot link a task to itself.');
      if(!taskIds.has(edge.predecessorTaskId)||!taskIds.has(edge.successorTaskId))errors.push('Dependency references a missing task.');
    }
    const operationIds=new Set();
    let totalCapacityEntries=0;
    for(const operation of plan.operations||[]){
      if(!clean(operation.operationId))errors.push('Operation is missing operationId.');
      if(operationIds.has(operation.operationId))errors.push('Duplicate operationId: '+operation.operationId);
      operationIds.add(operation.operationId);
      const entryKeys=new Set();
      for(const entry of operation.datedCapacityEntries||[]){
        totalCapacityEntries+=1;
        const key=[clean(entry.resourceId),clean(entry.date)].join('|');
        if(!clean(entry.resourceId)||!validDateOnly(entry.date))errors.push('Capacity entry requires a valid resource and date.');
        if(entryKeys.has(key))errors.push('Duplicate capacity entry for '+key+'.');
        entryKeys.add(key);
        for(const keyName of ['allocatedLines','availableLines'])if(!isNonNegativeNumber(entry[keyName]))errors.push('Capacity '+keyName+' must be a non-negative number.');
        if(isNonNegativeNumber(entry.allocatedLines)&&isNonNegativeNumber(entry.availableLines)&&Number(entry.allocatedLines)>Number(entry.availableLines))warnings.push('Capacity entry exceeds available lines for '+key+'.');
      }
    }
    if(totalCapacityEntries>0&&!(plan.operations||[]).length)errors.push('Capacity entries require an operation record.');
    const lotReferences=new Set();
    let plannedLots=0;
    for(const lot of plan.shipmentLots||[]){
      const reference=clean(lot.lotReference||lot.lotId);
      if(!reference)errors.push('Shipment lot requires a lot reference.');
      const normalized=reference.toLowerCase();
      if(lotReferences.has(normalized))errors.push('Duplicate shipment lot reference: '+reference);
      lotReferences.add(normalized);
      const quantities=['plannedQty','packedQty','passedQty','shippedQty'].map(key=>Number(lot[key]));
      if(quantities.some(value=>!Number.isFinite(value)||value<0))errors.push('Shipment lot quantities must be non-negative numbers.');
      const [planned,packed,passed,shipped]=quantities;
      if(Number.isFinite(planned))plannedLots+=planned;
      if(Number.isFinite(packed)&&Number.isFinite(planned)&&packed>planned)errors.push(reference+': packed quantity exceeds planned quantity.');
      if(Number.isFinite(passed)&&Number.isFinite(packed)&&passed>packed)errors.push(reference+': passed quantity exceeds packed quantity.');
      if(Number.isFinite(shipped)&&Number.isFinite(passed)&&shipped>passed)errors.push(reference+': shipped quantity exceeds passed quantity.');
      for(const key of ['requestedExFactory','currentExFactory','forecastExFactory','actualExFactory','ETD','ETA'])if(clean(lot[key])&&!validDateOnly(lot[key]))errors.push(reference+': '+key+' must use YYYY-MM-DD.');
      const allocations=Array.isArray(lot.poAllocation)?lot.poAllocation:[];
      if(allocations.length&&allocations.reduce((sum,item)=>sum+Number(item.qty||0),0)!==planned)errors.push(reference+': PO allocation must equal planned quantity.');
    }
    if(plan.order?.totalQty!=null&&Number.isFinite(Number(plan.order.totalQty))&&plannedLots>Number(plan.order.totalQty))errors.push('Planned shipment lots exceed the ordered quantity.');
    return {ok:errors.length===0,errors,warnings};
  }
  function validDateOnly(value){
    const date=clean(value);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
    const parsed=new Date(date+'T00:00:00Z');
    return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===date;
  }
  function isNonNegativeNumber(value){const number=Number(value);return Number.isFinite(number)&&number>=0;}
  function freezeBaseline(plan,context={}){
    const validation=validatePlan(plan);
    if(!validation.ok)return {ok:false,errors:validation.errors,plan};
    if(plan.unknownFields?.length)return {ok:false,errors:['Baseline cannot be confirmed while required fields are unknown: '+plan.unknownFields.join(', ')],plan};
    const timestamp=now();
    const next=clone(plan);
    next.baselineSnapshots=[...(next.baselineSnapshots||[]),{baselineId:makeId('baseline'),revision:next.revision,confirmedBy:context.actorId||next.ownerUserId,confirmedAt:timestamp,reason:clean(context.reason)||'Initial baseline confirmation',taskDates:next.tasks.map(task=>({taskId:task.taskId,templateRef:task.templateRef,dates:clone(task.dates)})),commitments:clone(next.commitments)}];
    next.revisionEvents=[...(next.revisionEvents||[]),{eventId:makeId('revision'),eventType:'baseline-confirmed',revision:next.revision,actorId:context.actorId||next.ownerUserId,createdAt:timestamp,reason:clean(context.reason)||'Initial baseline confirmation'}];
    next.auditEvents=[...(next.auditEvents||[]),{eventId:makeId('audit'),eventType:'baseline-confirmed',actorId:context.actorId||next.ownerUserId,createdAt:timestamp}];
    next.recordStatus='baselined';
    next.updatedAt=timestamp;
    return {ok:true,plan:next};
  }
  function updateTaskStatus(plan,taskId,nextStatus,context={}){
    if(!STATUSES.includes(nextStatus))return {ok:false,error:'Invalid status.'};
    const next=clone(plan),task=next.tasks.find(item=>item.taskId===taskId);
    if(!task)return {ok:false,error:'Task not found.'};
    if(nextStatus==='approved'&&!context.evidenceRef)return {ok:false,error:'Approval requires evidenceRef.'};
    if(nextStatus==='completed'&&!context.actualDate)return {ok:false,error:'Completion requires actualDate.'};
    if(nextStatus==='waived'&&!context.reason)return {ok:false,error:'Waiver requires reason.'};
    task.status=nextStatus;
    if(nextStatus==='completed')task.dates.actualFinish=context.actualDate;
    if(context.evidenceRef)task.proofRefs.push(context.evidenceRef);
    task.lastChangedBy=context.actorId||next.ownerUserId;
    task.lastChangedAt=now();
    next.updatedAt=task.lastChangedAt;
    next.revisionEvents.push({eventId:makeId('revision'),eventType:'task-status-changed',revision:next.revision,actorId:task.lastChangedBy,createdAt:task.lastChangedAt,details:{taskId,nextStatus,reason:clean(context.reason)}});
    return {ok:true,plan:next};
  }
  function addCustomTask(plan,input={},context={}){
    const title=clean(input.title);
    if(!title)return {ok:false,error:'Custom activity requires a title.'};
    const stageCode=STAGE_LABELS[input.stageCode]?input.stageCode:'O';
    const timestamp=now();
    const next=clone(plan);
    const task={
      taskId:makeId('task'),templateRef:'CUSTOM-'+stageCode,title,stage:STAGE_LABELS[stageCode],stageCode,taskKind:input.taskKind||'work',applicability:'optional',
      ownerParty:clean(input.ownerParty)||'merchant',waitingFor:'',ownerUserId:null,calendarId:'default',durationUnits:Number(input.durationUnits||0),durationBasis:input.durationBasis||'working',scheduleMode:'calculated',progressMethod:'manual',status:'not-started',
      dates:Object.fromEntries(DATE_KEYS.map(key=>[key,null])),quantity:{required:null,completed:null,unit:next.order?.unit||'pcs'},proofRefs:[],delayReason:'',recoveryAction:'',riskOverrideReason:null,riskStatus:'needs-information',isRequiredGate:false,displayOrder:(next.tasks?.length||0)+1,lastChangedBy:context.actorId||next.ownerUserId,lastChangedAt:timestamp
    };
    next.tasks.push(task);
    next.revisionEvents.push({eventId:makeId('revision'),eventType:'custom-task-added',revision:next.revision,actorId:task.lastChangedBy,createdAt:timestamp,details:{taskId:task.taskId,title:task.title}});
    next.auditEvents.push({eventId:makeId('audit'),eventType:'custom-task-added',actorId:task.lastChangedBy,createdAt:timestamp,details:{taskId:task.taskId}});
    next.updatedAt=timestamp;
    next.validation=validatePlan(next);
    return {ok:next.validation.ok,plan:next,errors:next.validation.errors};
  }
  /*
   * Purpose: record one reviewed dated capacity input without mutating the source plan.
   * Access: local controller or an authorized application service; callers supply explicit
   * operation type/resource/date/line counts. Output: cloned plan plus warnings for overlap.
   * Failure: malformed or duplicate entries are rejected; no rate or capacity is guessed.
   */
  function addCapacityEntry(plan,input={},context={}){
    if(!plan||!Array.isArray(plan.operations))return {ok:false,error:'Capacity entry requires a valid TNA plan.'};
    const resourceId=clean(input.resourceId||input.lineId);
    const date=clean(input.date);
    const operationType=clean(input.type||input.operationType);
    const allocatedLines=Number(input.allocatedLines);
    const availableLines=Number(input.availableLines);
    if(!resourceId)return {ok:false,error:'Capacity entry requires a reviewed resource or line.'};
    if(!validDateOnly(date))return {ok:false,error:'Capacity entry date must use YYYY-MM-DD.'};
    if(!operationType&&!clean(input.operationId))return {ok:false,error:'New capacity entries require an operation type.'};
    if(!isNonNegativeNumber(input.allocatedLines)||!isNonNegativeNumber(input.availableLines))return {ok:false,error:'Allocated and available lines must be non-negative numbers.'};
    const next=clone(plan);
    let operation=next.operations.find(item=>clean(item.operationId)===clean(input.operationId));
    if(!operation){
      operation={operationId:clean(input.operationId)||makeId('operation'),type:operationType||'unknown',lotId:clean(input.lotId)||null,qtyInput:0,qtyCompleted:0,qtyRejected:0,qtyReworked:0,qtyWip:0,unit:clean(input.unit)||next.order?.unit||'pcs',availableLines:null,calendarId:clean(input.calendarId)||'default',datedCapacityEntries:[],dailyActuals:[],efficiencyModel:null,smvOrSam:null,overtimePolicy:null,dependencies:[]};
      next.operations.push(operation);
    } else if(operationType&&clean(operation.type)&&clean(operation.type)!==operationType){
      return {ok:false,error:'The existing operation type cannot be changed by a capacity entry.'};
    }
    const duplicate=(operation.datedCapacityEntries||[]).some(entry=>clean(entry.resourceId)===resourceId&&clean(entry.date)===date);
    if(duplicate)return {ok:false,error:'A capacity entry for this operation, resource and date already exists.'};
    const timestamp=clean(context.createdAt)||now();
    const entry={capacityEntryId:makeId('capacity'),resourceId,date,allocatedLines,availableLines,calendarId:clean(input.calendarId)||operation.calendarId||'default',source:'reviewed-local',recordedBy:clean(context.actorId)||next.ownerUserId,recordedAt:timestamp};
    operation.datedCapacityEntries=[...(operation.datedCapacityEntries||[]),entry];
    const overlaps=next.operations.flatMap(item=>(item.datedCapacityEntries||[]).filter(other=>clean(other.resourceId)===resourceId&&clean(other.date)===date)).length-1;
    const warnings=[];
    if(allocatedLines>availableLines)warnings.push('This entry exceeds the available lines for the date and will appear as a capacity conflict.');
    if(overlaps>0)warnings.push('Another operation already uses this resource and date; portfolio capacity review is required.');
    next.revision=(Number(next.revision)||0)+1;
    next.updatedAt=timestamp;
    next.revisionEvents=[...(next.revisionEvents||[]),{eventId:makeId('revision'),eventType:'capacity-entry-recorded',revision:next.revision,actorId:entry.recordedBy,createdAt:timestamp,details:{operationId:operation.operationId,resourceId,date,allocatedLines,availableLines}}];
    next.auditEvents=[...(next.auditEvents||[]),{eventId:makeId('audit'),eventType:'capacity-entry-recorded',actorId:entry.recordedBy,createdAt:timestamp,details:{operationId:operation.operationId,capacityEntryId:entry.capacityEntryId}}];
    next.validation=validatePlan(next);
    if(!next.validation.ok)return {ok:false,error:next.validation.errors.join(' '),errors:next.validation.errors};
    return {ok:true,plan:next,entry,warnings:[...warnings,...next.validation.warnings]};
  }
  /*
   * Purpose: add one reviewed split-shipment lot while preserving quantity and PO allocation.
   * Access: local controller or an authorized application service; no inspection decision is inferred.
   * Output: cloned plan with lot-level dates/evidence fields and revision/audit history.
   * Failure: invalid lot quantities, duplicate references or over-order totals are rejected.
   */
  function addShipmentLot(plan,input={},context={}){
    if(!plan||!Array.isArray(plan.shipmentLots))return {ok:false,error:'Shipment lot entry requires a valid TNA plan.'};
    const totalQty=Number(plan.order?.totalQty);
    const lotReference=clean(input.lotReference||input.lotId);
    const plannedQty=Number(input.plannedQty);
    const packedQty=input.packedQty===''||input.packedQty==null?0:Number(input.packedQty);
    const passedQty=input.passedQty===''||input.passedQty==null?0:Number(input.passedQty);
    const shippedQty=input.shippedQty===''||input.shippedQty==null?0:Number(input.shippedQty);
    if(!Number.isFinite(totalQty)||totalQty<=0)return {ok:false,error:'Enter a positive order quantity before adding shipment lots.'};
    if(!lotReference)return {ok:false,error:'Shipment lot requires a lot reference.'};
    if(!Number.isFinite(plannedQty)||plannedQty<=0||![packedQty,passedQty,shippedQty].every(isNonNegativeNumber))return {ok:false,error:'Shipment lot quantities must be valid non-negative numbers, with planned quantity above zero.'};
    if(packedQty>plannedQty)return {ok:false,error:'Packed quantity cannot exceed planned quantity.'};
    if(passedQty>packedQty)return {ok:false,error:'Passed quantity cannot exceed packed quantity.'};
    if(shippedQty>passedQty)return {ok:false,error:'Shipped quantity cannot exceed passed quantity.'};
    if((plan.shipmentLots||[]).some(lot=>clean(lot.lotReference||lot.lotId).toLowerCase()===lotReference.toLowerCase()))return {ok:false,error:'A shipment lot with this reference already exists.'};
    const existingPlanned=(plan.shipmentLots||[]).reduce((sum,lot)=>sum+Number(lot.plannedQty||0),0);
    if(existingPlanned+plannedQty>totalQty)return {ok:false,error:'Planned shipment lots cannot exceed the ordered quantity.'};
    const dateKeys=['requestedExFactory','currentExFactory','forecastExFactory','actualExFactory','ETD','ETA'];
    for(const key of dateKeys)if(clean(input[key])&&!validDateOnly(input[key]))return {ok:false,error:key+' must use YYYY-MM-DD.'};
    let poAllocation=Array.isArray(input.poAllocation)?input.poAllocation.map(item=>({poNumber:clean(item.poNumber),qty:Number(item.qty)})):[];
    if(!poAllocation.length&&clean(input.poNumber))poAllocation=[{poNumber:clean(input.poNumber),qty:plannedQty}];
    if(!poAllocation.length)return {ok:false,error:'Shipment lot requires a PO allocation or PO number.'};
    if(poAllocation.some(item=>!item.poNumber||!isNonNegativeNumber(item.qty)))return {ok:false,error:'PO allocation requires a PO reference and non-negative quantity.'};
    if(poAllocation.reduce((sum,item)=>sum+item.qty,0)!==plannedQty)return {ok:false,error:'PO allocation must equal the planned lot quantity.'};
    const timestamp=clean(context.createdAt)||now();
    const next=clone(plan);
    const lot={lotId:makeId('lot'),lotReference,plannedQty,packedQty,passedQty,shippedQty,remainingQty:plannedQty-shippedQty,factory:clean(input.factory)||next.order?.factoryName||'',requestedExFactory:clean(input.requestedExFactory)||null,currentExFactory:clean(input.currentExFactory)||null,forecastExFactory:clean(input.forecastExFactory)||null,actualExFactory:clean(input.actualExFactory)||null,ETD:clean(input.ETD)||null,ETA:clean(input.ETA)||null,destinationReceipt:clean(input.destinationReceipt)||null,shipmentMethod:clean(input.shipmentMethod)||next.order?.shipmentMethod||'',bookingRef:clean(input.bookingRef)||null,inspectionRef:clean(input.inspectionRef)||null,poAllocation,status:clean(input.status)||'open'};
    next.shipmentLots.push(lot);
    next.revision=(Number(next.revision)||0)+1;
    next.updatedAt=timestamp;
    const actorId=clean(context.actorId)||next.ownerUserId;
    next.revisionEvents=[...(next.revisionEvents||[]),{eventId:makeId('revision'),eventType:'shipment-lot-recorded',revision:next.revision,actorId,createdAt:timestamp,details:{lotId:lot.lotId,lotReference,plannedQty,shippedQty}}];
    next.auditEvents=[...(next.auditEvents||[]),{eventId:makeId('audit'),eventType:'shipment-lot-recorded',actorId,createdAt:timestamp,details:{lotId:lot.lotId,lotReference,poAllocation}}];
    next.validation=validatePlan(next);
    if(!next.validation.ok)return {ok:false,error:next.validation.errors.join(' '),errors:next.validation.errors};
    return {ok:true,plan:next,lot,warnings:next.validation.warnings};
  }

  /**
   * Update the signed-source commercial facts displayed by the garment sheet.
   *
   * Ownership: TNA domain only. Inputs are user-entered evidence references,
   * not independently authenticated buyer approvals. Result is an immutable
   * clone with audit/revision history; failures leave the caller's plan intact.
   * Historical snapshots and contract dates are never rewritten by this action.
   * Schema version stays 1.1.0 because every added property is optional; old
   * portable copies and records are valid without filling any new property.
   */
  function reviseMerchandisingOrder(plan,input={},context={}){
    if(!plan||!plan.order||!plan.commitments)return {ok:false,error:'Open an existing TNA order first.'};
    if(context.expectedRevision!==undefined&&Number(context.expectedRevision)!==Number(plan.revision))return {ok:false,error:'Order changed since this form was opened. Reopen details before saving.'};
    const next=clone(plan),previous=plan.commitments,oldOrder=plan.order;
    const before={
      fabricWeightGsm:oldOrder.fabricWeightGsm??null,
      masterLcStatus:previous.masterLcStatus??'unknown',
      masterLcOpenedOn:previous.masterLcOpenedOn||null,
      masterLcProofRef:previous.masterLcProofRef||''
    };
    const after={...before};
    if(Object.prototype.hasOwnProperty.call(input,'fabricWeightGsm')){
      if(input.fabricWeightGsm===''||input.fabricWeightGsm==null)after.fabricWeightGsm=null;
      else if(!Number.isFinite(Number(input.fabricWeightGsm))||Number(input.fabricWeightGsm)<=0)return {ok:false,error:'Enter a positive, documented fabric GSM or leave it blank.'};
      else after.fabricWeightGsm=Number(input.fabricWeightGsm);
    }
    if(Object.prototype.hasOwnProperty.call(input,'masterLcStatus')){
      after.masterLcStatus=clean(input.masterLcStatus)||'unknown';
      if(!MASTER_LC_STATUSES.includes(after.masterLcStatus))return {ok:false,error:'Choose a supported Master LC status.'};
    }
    if(Object.prototype.hasOwnProperty.call(input,'masterLcOpenedOn')){
      after.masterLcOpenedOn=clean(input.masterLcOpenedOn)||null;
      if(after.masterLcOpenedOn&&!validDateOnly(after.masterLcOpenedOn))return {ok:false,error:'Enter a real Master LC opened date (YYYY-MM-DD).'};
    }
    if(Object.prototype.hasOwnProperty.call(input,'masterLcProofRef')){
      after.masterLcProofRef=clean(input.masterLcProofRef);
      if(after.masterLcProofRef.length>240)return {ok:false,error:'Source reference is too long.'};
    }
    const changes={};
    for(const key of Object.keys(after))if(after[key]!==before[key])changes[key]={before:before[key],after:after[key]};
    if(!Object.keys(changes).length)return {ok:true,plan,unchanged:true};
    const reason=clean(input.reason),source=clean(input.sourceRef);
    if(!reason)return {ok:false,error:'Explain why the garment or LC details changed.'};
    if(!source)return {ok:false,error:'Enter the source document or approval reference.'};
    if(before.masterLcOpenedOn!==after.masterLcOpenedOn&&plan.baselineSnapshots?.length)
      return {ok:false,error:'Confirmed baseline LC opening date is locked. Use a separately authorized correction.'};
    if(['opened','amended'].includes(after.masterLcStatus)&&(!after.masterLcOpenedOn||!after.masterLcProofRef))
      return {ok:false,error:'Opened or amended Master LC requires an actual date and its document reference.'};
    if(after.masterLcStatus==='not-applicable'&&after.masterLcOpenedOn)
      return {ok:false,error:'An opened Master LC date cannot also be marked Not Applicable.'};
    next.order.fabricWeightGsm=after.fabricWeightGsm;
    next.commitments.masterLcStatus=after.masterLcStatus;
    next.commitments.masterLcOpenedOn=after.masterLcOpenedOn;
    next.commitments.masterLcProofRef=after.masterLcProofRef;
    const validation=validatePlan(next);
    if(!validation.ok)return {ok:false,error:validation.errors.join('; ')};
    const stamped=now(),actorId=clean(context.actorId)||next.ownerUserId;
    next.revision=(Number(next.revision)||0)+1;
    next.updatedAt=stamped;
    next.validation=validation;
    next.revisionEvents.push({eventId:makeId('revision'),eventType:'merchandising-order-revised',revision:next.revision,actorId,createdAt:stamped,details:{changes,reason,sourceRef:source,sourceVerification:'user-entered-unverified'}});
    next.auditEvents.push({eventId:makeId('audit'),eventType:'merchandising-order-revised',actorId,createdAt:stamped,details:{fields:Object.keys(changes),sourceRef:source}});
    return {ok:true,plan:next,changes};
  }

  /**
   * Apply a single atomic activity follow-up. Date-only validation and source
   * checks precede all edits. A confirmed original baseline or evidenced actual
   * finish is immutable; a revised working target needs reason, source and
   * named authorizing party. Existing updateTaskStatus() remains compatible.
   */
  function reviseMerchandisingTask(plan,taskId,input={},context={}){
    if(!plan||!Array.isArray(plan.tasks))return {ok:false,error:'Open a TNA order first.'};
    if(context.expectedRevision!==undefined&&Number(context.expectedRevision)!==Number(plan.revision))return {ok:false,error:'TNA changed since this activity was opened. Reopen it before saving.'};
    const original=plan.tasks.find(item=>item.taskId===taskId);
    if(!original)return {ok:false,error:'Activity not found.'};
    const next=clone(plan),task=next.tasks.find(item=>item.taskId===taskId);
    const previousDates=original.dates||{};
    const status=clean(input.nextStatus??original.status);
    const owner=clean(input.ownerParty??original.ownerParty);
    const waiting=clean(input.waitingFor??original.waitingFor??'');
    const planned=clean(input.plannedDate??previousDates.baselineFinish)||null;
    const revised=clean(input.revisedDate??previousDates.currentTargetFinish)||null;
    const actual=clean(input.actualDate??previousDates.actualFinish)||null;
    const evidence=clean(input.evidenceRef),reason=clean(input.reason),source=clean(input.sourceRef);
    const authority=clean(input.authorityParty);
    if(!STATUSES.includes(status))return {ok:false,error:'Choose a supported activity status.'};
    if(!owner||owner.length>120)return {ok:false,error:'Responsible party must be entered (maximum 120 characters).'};
    if(!WAITING_PARTIES.includes(waiting))return {ok:false,error:'Choose a supported waiting party.'};
    for(const [label,date] of [['planned',planned],['revised',revised],['actual',actual]])if(date&&!validDateOnly(date))
      return {ok:false,error:'Enter a valid '+label+' date in YYYY-MM-DD format.'};
    if(evidence.length>240||source.length>240||authority.length>120||reason.length>600)
      return {ok:false,error:'Reason, source or authority entry is too long.'};
    const changes={};
    function delta(key,before,after){if(before!==after)changes[key]={before:before??null,after:after??null};}
    delta('status',original.status,status);
    delta('ownerParty',original.ownerParty,owner);
    delta('waitingFor',original.waitingFor||'',waiting);
    delta('baselineFinish',previousDates.baselineFinish||null,planned);
    delta('currentTargetFinish',previousDates.currentTargetFinish||null,revised);
    delta('actualFinish',previousDates.actualFinish||null,actual);
    const editedKeys=Object.keys(changes);
    if(!editedKeys.length&&!evidence)return {ok:true,plan,unchanged:true};
    if(!reason)return {ok:false,error:'Enter a reason or follow-up note for this activity change.'};
    if(changes.baselineFinish&&((plan.baselineSnapshots||[]).length||plan.recordStatus!=='draft'))
      return {ok:false,error:'Original planned date is confirmed and cannot be overwritten.'};
    if(changes.currentTargetFinish&&(!source||!authority))
      return {ok:false,error:'A revised target requires an evidence source and the authorizing party.'};
    if(changes.actualFinish&&previousDates.actualFinish)
      return {ok:false,error:'Recorded actual completion is immutable. Use a separately reviewed correction.'};
    if(changes.actualFinish&&(!evidence||!['completed','approved'].includes(status)))
      return {ok:false,error:'An actual finish date needs completion or approval status and evidence.'};
    if(changes.status&&status==='approved'&&(!evidence||!authority))
      return {ok:false,error:'Approval requires a new evidence reference and authorized party.'};
    if(changes.status&&status==='completed'&&(!actual||!evidence))
      return {ok:false,error:'Completion requires an actual date and evidence reference.'};
    if(changes.status&&['waived','not-applicable'].includes(status)&&(!authority||!evidence))
      return {ok:false,error:'Waiver or N/A requires its authorized party and source evidence.'};
    if(changes.status&&status==='rejected'&&!evidence)
      return {ok:false,error:'A rejected activity needs a decision reference.'};
    task.status=status;task.ownerParty=owner;task.waitingFor=waiting;
    task.dates.baselineFinish=planned;
    task.dates.currentTargetFinish=revised;
    task.dates.actualFinish=actual;
    if(evidence&&!task.proofRefs.includes(evidence))task.proofRefs.push(evidence);
    if(reason)task.delayReason=reason;
    const validation=validatePlan(next);
    if(!validation.ok)return {ok:false,error:validation.errors.join('; ')};
    const stamped=now(),actorId=clean(context.actorId)||next.ownerUserId;
    task.lastChangedBy=actorId;task.lastChangedAt=stamped;
    next.updatedAt=stamped;next.revision=(Number(next.revision)||0)+1;
    next.validation=validation;
    next.revisionEvents.push({eventId:makeId('revision'),eventType:'merchandising-task-revised',revision:next.revision,actorId,createdAt:stamped,details:{taskId,changes,reason,sourceRef:source,authorityParty:authority,sourceVerification:'user-entered-unverified'}});
    next.auditEvents.push({eventId:makeId('audit'),eventType:'merchandising-task-revised',actorId,createdAt:stamped,details:{taskId,fields:editedKeys}});
    return {ok:true,plan:next,changes};
  }

  const api={SCHEMA_VERSION,TEMPLATE_VERSION,DATE_KEYS,STATUSES,RISK_STATUSES,MASTER_LC_STATUSES,WAITING_PARTIES,STAGE_LABELS,ACTIVITY_LIBRARY,TEMPLATE_PROFILES,normalizeColorSizeBreakdown,createPlan,validatePlan,freezeBaseline,updateTaskStatus,reviseMerchandisingOrder,reviseMerchandisingTask,addCustomTask,addCapacityEntry,addShipmentLot};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaDomain=api;
})(typeof globalThis!=='undefined'?globalThis:this);
