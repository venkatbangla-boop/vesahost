/**
 * GMR-04B/C: reviewed Excel activity/dependency mapping + NEW DRAFT apply.
 * The approved OrderPlan schema, signed baseline and existing saved records
 * are not edited. No workbook formula, decision or approval is trusted.
 */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VesaTnaActivityImport=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const orderImporter=root.VesaTnaImportReview||(typeof require==='function'?require('./import-review.js'):null);
  const domain=root.VesaTnaDomain||(typeof require==='function'?require('./domain.js'):null);
  const scheduling=root.VesaTnaScheduling||(typeof require==='function'?require('./scheduling.js'):null);
  const FIELD_IDS=Object.freeze([
    'activityRef','title','ownerParty','waitingFor','plannedStart','plannedFinish',
    'revisedStart','revisedFinish','actualStart','actualFinish','durationUnits',
    'status','evidenceRef','authorityParty','sourceRef','predecessors','remarks',
    'stageCode','taskKind'
  ]);
  const DATE_FIELDS=Object.freeze(['plannedStart','plannedFinish','revisedStart','revisedFinish','actualStart','actualFinish']);
  const ALIASES=Object.freeze({
    activityRef:['ref','activity ref','activity reference','template ref','task ref','activity code','task code','tna ref'],
    title:['activity','activity name','task','task name','description','activity description'],
    ownerParty:['owner','responsible','responsible party','assigned to','responsibility'],
    waitingFor:['waiting for','waiting','hold with','waiting party'],
    plannedStart:['planned start','plan start','baseline start','original start'],
    plannedFinish:['planned finish','planned','baseline','baseline finish','original date','original finish','planned date'],
    revisedStart:['revised start','current start','target start'],
    revisedFinish:['revised','revised finish','current target','current target finish','target date','revised date'],
    actualStart:['actual start','started on'],
    actualFinish:['actual','actual finish','actual date','completed on','finished on'],
    durationUnits:['duration','duration days','days','duration units'],
    status:['status','activity status','task status'],
    evidenceRef:['proof','evidence','proof reference','approval reference','document ref'],
    authorityParty:['approved by','authority','approval authority','authorizing party'],
    sourceRef:['date change source','source reference','source document','revision source'],
    predecessors:['predecessors','predecessor','depends on','dependency refs','dependency'],
    remarks:['remarks','notes','comments','follow up','follow up note'],
    stageCode:['stage','stage code','tna stage','section code','activity stage'],
    taskKind:['task kind','activity kind','task type','activity type']
  });
  const LABELS=Object.freeze({
    en:{title:'Review Excel activities and dependencies',sheet:'Activity worksheet',header:'Activity header row',
      date:'Activity date format',basis:'Activity duration basis',mapping:'Map activity columns',
      include:'Also import Excel activities and predecessor links',tip:'Source references must match a template activity or be explicitly mapped. Only explicitly entered predecessors become links.',
      dependency:'Predecessor references are interpreted as Finish-to-Start with 0 lag; confirm this matches the source workbook.',
      bind:'Match unmatched activity',missing:'Needs mapping',status:'Import status',
      pending:'Unmatched activities cannot be silently discarded.',preview:'Review every activity',count:'Source activity rows',
      confirmation:'I reviewed the activity rows, evidence, dates and FS/0 predecessor interpretation.',
      empty:'An activity worksheet must contain at least one data row.',
      custom:'Create a new custom activity using sourced Stage and Task Kind',
      advanced:'I checked the explicit relation, signed lag and day basis in every advanced predecessor link.',
      format:'Predecessors: O01 for reviewed FS/0, or O01|SS|2|working; D05|FF|-1|calendar for individually sourced links.',
      links:'Reviewed dependency links',customCount:'New custom activities'},
    bn:{title:'Excel-এর কাজ ও পূর্ববর্তী কাজ যাচাই',sheet:'কাজের ওয়ার্কশিট',header:'কাজের হেডার সারি',
      date:'কাজের তারিখ ফরম্যাট',basis:'কাজের সময়ের ভিত্তি',mapping:'কাজের কলাম মিলিয়ে দেখুন',
      include:'Excel-এর কাজ ও পূর্ববর্তী কাজের লিংকও নিন',tip:'প্রতিটি কাজের রেফারেন্স টেমপ্লেটের সঙ্গে মিলতে হবে; অনুপস্থিত কাজ বাদ দেওয়া হবে না।',
      dependency:'আগের কাজগুলো FS ও শূন্য বিরতি হিসাবে ধরা হবে; উৎস দেখে নিশ্চিত করুন।',
      bind:'কাজ মিলিয়ে দেখুন',missing:'মিল পাওয়া যায়নি',status:'ইমপোর্ট অবস্থা',
      pending:'না-মেলা কাজ গোপনে বাদ দেওয়া যাবে না।',preview:'সব কাজ যাচাই',count:'কাজের সারি',
      confirmation:'কাজ, প্রমাণ, তারিখ ও FS/0 সম্পর্ক যাচাই করেছি।',empty:'কাজের ওয়ার্কশিটে সারি থাকা প্রয়োজন।',custom:'সোর্সে থাকা Stage ও Task Kind দিয়ে নতুন কাস্টম কাজ তৈরি করুন',advanced:'প্রতিটি উন্নত লিংকের relation, lag ও দিনের ভিত্তি যাচাই করেছি।',format:'Predecessors: O01 (FS/0) অথবা O01|SS|2|working; D05|FF|-1|calendar',links:'যাচাই করা কাজের লিংক',customCount:'নতুন কাস্টম কাজ'},
    hi:{title:'Excel गतिविधियाँ और निर्भरता जाँचें',sheet:'गतिविधि वर्कशीट',header:'गतिविधि हेडर पंक्ति',
      date:'गतिविधि तारीख फॉर्मेट',basis:'अवधि का आधार',mapping:'गतिविधि कॉलम मिलाएँ',
      include:'Excel की गतिविधियाँ और पहले के कामों के लिंक भी आयात करें',
      tip:'हर गतिविधि को टेम्पलेट से मिलाएँ; अनपहचानी गतिविधियाँ चुपचाप नहीं हटेंगी।',
      dependency:'पहले के कार्य FS और शून्य अंतर से जुड़े हैं; स्रोत देखकर पुष्टि करें।',
      bind:'अनमेल गतिविधि मिलाएँ',missing:'मैपिंग चाहिए',status:'आयात स्थिति',
      pending:'बिना मिलान के कार्यों को छोड़ा नहीं जाएगा।',preview:'सभी गतिविधियाँ जाँचें',count:'गतिविधि पंक्तियाँ',
      confirmation:'गतिविधियाँ, प्रमाण, तारीखें और FS/0 संबंध जाँच लिए हैं।',empty:'वर्कशीट में कम से कम एक गतिविधि चाहिए।',custom:'स्रोत के Stage और Task Kind से नई कस्टम गतिविधि बनाएँ',advanced:'हर उन्नत लिंक का relation, lag और दिन आधार जाँच लिया है।',format:'Predecessors: O01 (FS/0) या O01|SS|2|working; D05|FF|-1|calendar',links:'जाँचे हुए कार्य लिंक',customCount:'नई कस्टम गतिविधियाँ'},
    ta:{title:'Excel Activities மற்றும் Dependencies சரிபார்ப்பு',sheet:'Activity worksheet',header:'Activity heading row',
      date:'Activity தேதி முறை',basis:'Activity duration முறை',mapping:'Activity columns பொருத்துக',
      include:'Excel activities மற்றும் predecessor links-ஐயும் import செய்ய',
      tip:'ஒவ்வொரு activity reference-ம் template-க்கு match ஆக வேண்டும். Match ஆகாததை மறைத்து விடமாட்டோம்.',
      dependency:'Predecessors FS / zero lag எனப் பொருள் கொள்ளப்படும்; Excel source-ஐச் சரிபார்த்து ஒப்புக்கொள்ளுங்கள்.',
      bind:'பொருந்தாத activity-ஐ match செய்க',missing:'Mapping தேவை',status:'Import நிலை',
      pending:'Unmatched activities தானாக விடப்படாது.',preview:'அனைத்து Activities சரிபார்க்க',count:'Activity வரிசைகள்',
      confirmation:'Activities, ஆதாரம், தேதிகள், FS/0 dependencies சரிபார்த்தேன்.',empty:'Activity worksheet-ல் குறைந்தது ஒரு row தேவை.',custom:'Excel Stage + Task Kind கொண்டு புதிய custom activity உருவாக்கு',advanced:'ஒவ்வொரு advanced link relation, signed lag, day basis சரிபார்த்தேன்.',format:'Predecessors: O01 (FS/0) அல்லது O01|SS|2|working; D05|FF|-1|calendar',links:'சரிபார்த்த dependency links',customCount:'புதிய custom activities'}
  });
  const STR=v=>String(v??'').trim();
  const normalized=v=>STR(v).toLowerCase().replace(/\s+/g,' ').replace(/[_\-\/]+/g,' ');
  const unsafe=v=>typeof v==='string'&&(/^\s*[=+@]/.test(v)||/^\s*-[^\d]/.test(v)||
    /^\s*(?:javascript:|vbscript:|data:)/i.test(v)||/<\s*(?:script|iframe|object|svg)\b/i.test(v)||/\bon(?:error|click|load)\s*=/i.test(v));
  const ID=v=>STR(v).toUpperCase();
  const validRef=ref=>/^[A-Z0-9][A-Z0-9._-]{0,59}$/.test(ref);
  /**
   * Predecessor formats:
   * - O01; O02 is the historic, separately confirmed FS/0 mapping.
   * - O01|SS|2|working; O02|FF|-1|calendar keeps each relationship,
   *   signed lag (negative means source-authorized lead), and basis separate.
   * No relation, duration, source link or lead is invented.
   */
  function parseLinks(value,basis){
    if(!STR(value))return [];
    const links=[],seen=new Set();
    for(const raw of STR(value).split(/[;,]/)){
      const segments=raw.trim().split('|').map(STR);
      const ref=ID(segments[0]);
      if(!validRef(ref))throw Error('Invalid predecessor reference. Use a nonempty Activity Ref.');
      if(seen.has(ref))throw Error('Duplicate predecessor reference in one activity.');
      seen.add(ref);
      if(segments.length===1){
        if(!['calendar','working'].includes(basis))throw Error('Choose a reviewed duration basis for plain predecessors.');
        links.push({source:ref,relation:'FS',lagUnits:0,lagBasis:basis,allowLead:false,mode:'legacy'});
        continue;
      }
      if(segments.length!==4)throw Error('Advanced predecessor must be REF|FS/SS/FF/SF|signed days|working/calendar.');
      const relation=ID(segments[1]),lagString=segments[2],lagBasis=segments[3].toLowerCase();
      if(!['FS','SS','FF','SF'].includes(relation))throw Error('Unsupported dependency relation; use FS, SS, FF or SF.');
      if(!/^[+-]?\d{1,4}$/.test(lagString))throw Error('Advanced dependency must give an explicit whole-day signed lag.');
      const lagUnits=Number(lagString);
      if(!Number.isInteger(lagUnits)||Math.abs(lagUnits)>3650)throw Error('Dependency lag/lead must be between -3650 and 3650 days.');
      if(!['calendar','working'].includes(lagBasis))throw Error('Advanced dependency must specify working or calendar basis.');
      links.push({source:ref,relation,lagUnits,lagBasis,allowLead:lagUnits<0,mode:'advanced'});
    }
    return links;
  }
  const fieldsLookup=headers=>{
    const used=new Set(),mapping={};
    for(const id of FIELD_IDS){
      const found=headers.findIndex((h,i)=>!used.has(i)&&ALIASES[id].includes(normalized(h)));
      mapping[id]=found;
      if(found>=0)used.add(found);
    }
    return mapping;
  };
  function suggestSheet(snapshot,orderSheet){
    if(!snapshot?.sheetNames?.length)return null;
    let best=null;
    for(const name of snapshot.sheetNames){
      if(name===orderSheet)continue;
      const sheet=snapshot.sheets?.[name];
      for(let index=0;index<Math.min(sheet?.rows?.length||0,30);index++){
        const mapping=fieldsLookup(sheet.rows[index]||[]);
        const score=(mapping.activityRef>=0?4:0)+(mapping.title>=0?4:0)+
          (mapping.plannedFinish>=0?2:0)+(mapping.status>=0?1:0)+(mapping.predecessors>=0?2:0);
        if(!best||score>best.score)best={name,headerRow:index+1,score};
      }
    }
    return best;
  }
  function describe(snapshot,settings){
    const info=orderImporter.describe(snapshot,settings.sheetName,settings.headerRow);
    const mapping=fieldsLookup(info.headers),actual={};
    const used=new Set(),errors=[];
    for(const key of FIELD_IDS){
      const val=settings.mapping&&Object.hasOwn(settings.mapping,key)?settings.mapping[key]:mapping[key];
      const index=val===''||val==null?-1:Number(val);
      if(!Number.isInteger(index)||index < -1||index>=info.headers.length)errors.push(key+': invalid Excel column.');
      if(index>=0&&used.has(index))errors.push('Excel column mapped more than once: '+key);
      if(index>=0)used.add(index);
      actual[key]=index;
    }
    if(actual.activityRef<0)errors.push('Activity reference column is required.');
    if(actual.predecessors<0)errors.push('Predecessor column is required (blank cells mean no predecessors).');
    if(info.formulaCells?.length)errors.push('Formula cells in the selected activity sheet are not trusted.');
    if(!info.dataRows.length)errors.push('No activity rows below the heading.');
    return {info,mapping:actual,errors};
  }
  /**
   * Pure all-row review. Unmatched activities never silently become template
   * facts. __CUSTOM__ is a user-only binding that requires sourced Stage/Kind.
   * validateGraph proves cycle/reference integrity before any local write.
   */
  function review(snapshot,orderReview,settings={}){
    const errors=[],warnings=[],rows=[],unmatched=[],bound=new Map();
    if(!orderReview?.ready||!orderReview.proposal)return {ready:false,errors:['Complete the valid order review first.'],warnings,rows,unmatched};
    if(!domain?.createPlan||!scheduling?.validateGraph||!orderImporter)return {ready:false,errors:['Local TNA engine is unavailable.'],warnings,rows,unmatched};
    const proposal=orderReview.proposal;
    if(!['iso','dmy','mdy','excel'].includes(settings.dateFormat))errors.push('Choose the activity source date format.');
    if(!['calendar','working'].includes(settings.durationBasis))errors.push('Choose a reviewed activity duration basis.');
    if(settings.sheetName===proposal.importSource?.sheetName)errors.push('Activity rows must come from a separate reviewed worksheet, not the order heading.');
    let d;
    try{d=describe(snapshot,settings);}catch(error){return {ready:false,errors:[error.message],warnings,rows,unmatched};}
    errors.push(...d.errors);
    const example=domain.createPlan(proposal,{ownerUserId:'import-preview',mode:'local'});
    const eligible=new Map(example.tasks.map(task=>[ID(task.templateRef),task]));
    const titles=new Map();
    for(const task of example.tasks){const title=normalized(task.title);titles.set(title,[...(titles.get(title)||[]),task.templateRef]);}
    const seenKeys=new Set(),selectedTargets=new Set(),customRows=[];
    for(const row of d.info.dataRows){
      const label='Excel row '+row.line+': ';
      const get=id=>{const idx=d.mapping[id];return idx>=0?row.values[idx]:'';};
      const sourceKey=ID(get('activityRef')),title=STR(get('title'));
      if(!validRef(sourceKey))errors.push(label+'Activity Ref is required (letters/digits, dots, hyphens only).');
      if(seenKeys.has(sourceKey))errors.push(label+'Duplicate Excel Activity Ref '+sourceKey);
      seenKeys.add(sourceKey);
      for(const key of FIELD_IDS){
        const value=get(key);
        if(unsafe(value))errors.push(label+key+' contains formula-like or unsafe text.');
        if(STR(value).length>600)errors.push(label+key+' exceeds 600 characters.');
      }
      const explicit=ID(settings.rowBindings?.[row.line]||'');
      const isCustom=explicit==='__CUSTOM__';
      const exact=eligible.has(sourceKey)?sourceKey:'';
      const matches=titles.get(normalized(title))||[];
      const suggested=exact||(matches.length===1?ID(matches[0]):'');
      const stageCode=ID(get('stageCode')),taskKind=STR(get('taskKind')).toLowerCase();
      let targetRef=isCustom?'CUSTOM-'+stageCode+'-'+sourceKey:(explicit||suggested);
      if(isCustom){
        if(exact)errors.push(label+'Existing template activity cannot be replaced with custom.');
        if(!validRef(sourceKey)||!title||title.length>180)errors.push(label+'Custom activity needs a valid unique source reference and title (up to 180 characters).');
        if(!Object.hasOwn(domain.STAGE_LABELS,stageCode))errors.push(label+'Custom activity requires an approved, sourced Stage code.');
        if(!['work','milestone','gate'].includes(taskKind))errors.push(label+'Custom activity requires a sourced Task Kind (work, milestone or gate).');
        if(customRows.length>=150)errors.push('No more than 150 new custom activities may be reviewed in one import.');
        customRows.push({line:row.line,sourceKey,stageCode,taskKind,targetRef});
      }else if(!targetRef||!eligible.has(targetRef)){
        unmatched.push({line:row.line,sourceKey,title,suggestedRef:suggested,targetRef:''});
        errors.push(label+'Unmatched activity '+(sourceKey||title)+'. Select its template reference or explicitly Create Custom with sourced Stage and Task Kind.');
      }
      if(explicit&&!isCustom&&!eligible.has(explicit))errors.push(label+'Selected template reference is not in this garment profile.');
      if(selectedTargets.has(targetRef))errors.push(label+'Two Excel activities map to template '+targetRef+'.');
      selectedTargets.add(targetRef);
      if(exact&&!isCustom&&title&&normalized(title)!==normalized(eligible.get(exact).title))
        warnings.push(label+'Excel title differs from the mapped template title; original template title remains unchanged.');
      const dates={};
      for(const field of DATE_FIELDS){
        try{dates[field]=orderImporter.parseDate(get(field),settings.dateFormat,snapshot.date1904);}
        catch(error){errors.push(label+field+': '+error.message);dates[field]=null;}
      }
      for(const [start,finish] of [['plannedStart','plannedFinish'],['revisedStart','revisedFinish'],['actualStart','actualFinish']]){
        if(dates[start]&&dates[finish]&&dates[start]>dates[finish])errors.push(label+start+' is after '+finish+'.');
      }
      const durationText=STR(get('durationUnits'));let durationUnits=null;
      if(durationText){
        const number=typeof get('durationUnits')==='number'?get('durationUnits'):
          /^\d+$/.test(durationText)?Number(durationText):NaN;
        if(!Number.isInteger(number)||number<0||number>3650)errors.push(label+'Duration must be 0–3650 whole days, or blank when unknown.');
        else durationUnits=number;
      }else warnings.push(label+'Duration is unknown; calculations will require a reviewed duration.');
      const rawStatus=STR(get('status')).toLowerCase().replace(/\s+/g,'-');
      const status=rawStatus==='n/a'?'not-applicable':rawStatus||'not-started';
      if(!domain.STATUSES.includes(status))errors.push(label+'Unknown activity status '+status);
      const ownerParty=STR(get('ownerParty')),waitingFor=STR(get('waitingFor')).toLowerCase().replace(/\s+/g,'-');
      const evidenceRef=STR(get('evidenceRef')),authorityParty=STR(get('authorityParty')),sourceRef=STR(get('sourceRef')),remarks=STR(get('remarks'));
      if(waitingFor&&!domain.WAITING_PARTIES.includes(waitingFor))errors.push(label+'Unknown waiting party.');
      if(!ownerParty)warnings.push(label+'Owner was not supplied; displayed as unassigned, not inferred.');
      if(['approved','waived','not-applicable'].includes(status)&&(!evidenceRef||!authorityParty))
        errors.push(label+'Approval/waiver requires evidence and authorizing party.');
      if(status==='rejected'&&!evidenceRef)errors.push(label+'Rejected status needs decision evidence.');
      if(status==='completed'&&(!dates.actualFinish||!evidenceRef))errors.push(label+'Completed task needs actual finish and evidence.');
      if(dates.actualFinish&&!['completed','approved'].includes(status))errors.push(label+'Actual finish requires completed/approved status.');
      if(dates.actualStart&&status==='not-started')errors.push(label+'Actual start conflicts with Not Started status.');
      if((dates.revisedStart||dates.revisedFinish)&&(!sourceRef||!authorityParty))
        errors.push(label+'Revised date requires source reference and authorizing party.');
      if((dates.actualStart||dates.actualFinish)&&!evidenceRef)errors.push(label+'Actual date requires evidence reference.');
      let predecessorLinks=[];
      try{predecessorLinks=parseLinks(get('predecessors'),settings.durationBasis);}
      catch(error){errors.push(label+error.message);}
      const predecessors=predecessorLinks.map(link=>link.source);
      const imported={line:row.line,sourceKey,title,targetRef,isCustom,stageCode,taskKind,
        ownerParty,waitingFor,status,dates,durationUnits,evidenceRef,authorityParty,sourceRef,
        remarks,predecessors,predecessorLinks};
      rows.push(imported);bound.set(sourceKey,imported);
    }
    const edges=[],seenPairs=new Set();
    for(const row of rows)for(const link of row.predecessorLinks){
      const previous=bound.get(link.source),pair=link.source+'|'+row.sourceKey;
      if(!previous||!previous.targetRef)errors.push('Excel row '+row.line+': unknown/unmapped predecessor '+link.source);
      else if(link.source===row.sourceKey)errors.push('Excel row '+row.line+': activity cannot depend on itself.');
      if(seenPairs.has(pair))errors.push('Duplicate predecessor/successor connection '+pair);
      seenPairs.add(pair);
      edges.push({source:link.source,target:row.sourceKey,relation:link.relation,
        lagUnits:link.lagUnits,lagBasis:link.lagBasis,allowLead:link.allowLead,mode:link.mode});
    }
    const legacyEdges=edges.filter(edge=>edge.mode==='legacy').length,advancedEdges=edges.length-legacyEdges;
    if(legacyEdges&&!settings.fsZeroConfirmed)errors.push('Confirm that each plain predecessor means Finish-to-Start with zero lag.');
    if(advancedEdges&&!settings.advancedLinksConfirmed)
      errors.push('Confirm all explicit dependency relations, signed lags and working/calendar bases.');
    const allTasks=[...example.tasks,...customRows.map(custom=>({taskId:'import-preview-'+custom.line,templateRef:custom.targetRef}))];
    const idOf=new Map(allTasks.map(task=>[ID(task.templateRef),task.taskId]));
    const tentative=edges.filter(edge=>bound.get(edge.source)?.targetRef&&bound.get(edge.target)?.targetRef)
      .map(edge=>({predecessorTaskId:idOf.get(bound.get(edge.source).targetRef),
        successorTaskId:idOf.get(bound.get(edge.target).targetRef),
        relation:edge.relation,lagUnits:edge.lagUnits,lagBasis:edge.lagBasis,allowLead:edge.allowLead}));
    const graph=scheduling.validateGraph(allTasks,tentative);
    if(!graph.ok)errors.push(...graph.errors);
    if(!rows.length)errors.push('Select an activity sheet with at least one row.');
    const missingTemplateRefs=[...eligible.keys()].filter(key=>!selectedTargets.has(key));
    if(missingTemplateRefs.length)warnings.push(missingTemplateRefs.length+' template activities were not in Excel and stay unstarted/unverified.');
    if(advancedEdges)warnings.push('Advanced relations and signed leads are source-reviewed, not independently confirmed factory calendar constraints.');
    return {ready:errors.length===0,errors,warnings,rows,edges,unmatched,customRows,
      settings:{sheetName:settings.sheetName,headerRow:settings.headerRow,mapping:d.mapping,
        dateFormat:settings.dateFormat,durationBasis:settings.durationBasis,fsZeroConfirmed:!!settings.fsZeroConfirmed,
        advancedLinksConfirmed:!!settings.advancedLinksConfirmed,rowBindings:{...settings.rowBindings}},
      templateId:proposal.templateId,missingTemplateRefs,edgeCount:tentative.length,
      advancedEdgeCount:advancedEdges,legacyEdgeCount:legacyEdges,reviewedAt:new Date().toISOString()};
  }
  /**
   * Atomically build a separate draft. Domain.addCustomTask owns task shapes;
   * this adapter owns sourceRefs and explicit precedence only. Existing plans
   * and any signed or already imported plan cannot enter this function.
   */
  function applyToNewDraft(plan,reviewed,context={}){
    if(!reviewed?.ready||!Array.isArray(reviewed.rows)||!reviewed.rows.length)throw Error('Reviewed activity rows are required.');
    if(!plan||plan.recordStatus!=='draft'||plan.templateId!==reviewed.templateId||
      plan.baselineSnapshots?.length||plan.revision!==0||plan.mode==='practice'||
      !plan.auditEvents?.some(event=>event.eventType==='reviewed-workbook-new-draft')||
      plan.auditEvents.some(event=>event.eventType==='reviewed-workbook-activities-new-draft'))
      throw Error('Excel activities may be applied only once to a new, unsigned matching TNA draft.');
    let next=JSON.parse(JSON.stringify(plan));
    const actorId=context.ownerUserId||next.ownerUserId;
    const refToTask=new Map(next.tasks.map(task=>[ID(task.templateRef),task]));
    const sourceToTask=new Map(),customSources=[];
    for(const row of reviewed.rows){
      let task=refToTask.get(row.targetRef);
      if(row.isCustom){
        if(task||!row.targetRef?.startsWith('CUSTOM-')||!row.title||
          !Object.hasOwn(domain.STAGE_LABELS,row.stageCode)||!['work','milestone','gate'].includes(row.taskKind))
          throw Error('Custom Excel activity must have a uniquely reviewed source ID, Stage and Task Kind.');
        const added=domain.addCustomTask(next,{title:row.title,stageCode:row.stageCode,
          taskKind:row.taskKind,ownerParty:row.ownerParty||'merchant',
          durationUnits:row.durationUnits??0,durationBasis:reviewed.settings.durationBasis},{actorId});
        if(!added.ok)throw Error((added.errors||[added.error]).join('; '));
        next=added.plan;
        task=next.tasks.at(-1);
        task.templateRef=row.targetRef;
        task.taskKind=row.taskKind;
        task.isRequiredGate=row.taskKind==='gate';
        refToTask.set(row.targetRef,task);
        customSources.push(row.sourceKey);
      }
      if(!task)throw Error('Source activity is not in this garment template: '+row.targetRef);
      if(sourceToTask.has(row.sourceKey))throw Error('Duplicate imported source reference.');
      sourceToTask.set(row.sourceKey,task);
      task.ownerParty=row.ownerParty;
      task.waitingFor=row.waitingFor;
      task.status=row.status;
      task.durationUnits=row.durationUnits;
      task.durationBasis=reviewed.settings.durationBasis;
      for(const [key,from] of [['baselineStart','plannedStart'],['baselineFinish','plannedFinish'],
        ['currentTargetStart','revisedStart'],['currentTargetFinish','revisedFinish'],
        ['actualStart','actualStart'],['actualFinish','actualFinish']])task.dates[key]=row.dates[from]||null;
      task.proofRefs=row.evidenceRef?[row.evidenceRef]:[];
      task.followUpNote=row.remarks;
      task.importSourceRef=row.sourceKey;
      task.lastChangedBy=actorId;
      task.lastChangedAt=next.updatedAt;
    }
    const edges=[];
    for(const reviewedEdge of reviewed.edges||[]){
      const from=sourceToTask.get(reviewedEdge.source),to=sourceToTask.get(reviewedEdge.target);
      if(!from||!to)throw Error('Unmapped predecessor in reviewed Excel.');
      edges.push({edgeId:'import-edge-'+from.taskId+'-'+to.taskId+'-'+reviewedEdge.relation,
        predecessorTaskId:from.taskId,successorTaskId:to.taskId,relation:reviewedEdge.relation,
        lagUnits:reviewedEdge.lagUnits,lagBasis:reviewedEdge.lagBasis,
        ...(reviewedEdge.allowLead?{allowLead:true}:{}),calendarPolicy:'successor'});
    }
    // Intentionally replaces the autogenerated linear default chain.
    next.edges=edges;
    const graph=scheduling.validateGraph(next.tasks,next.edges);
    if(!graph.ok)throw Error(graph.errors.join('; '));
    const validity=domain.validatePlan(next);
    if(!validity.ok)throw Error(validity.errors.join('; '));
    const time=new Date().toISOString();
    next.updatedAt=time;
    next.auditEvents.push({eventId:'activity-import-'+next.recordId,
      eventType:'reviewed-workbook-activities-new-draft',createdAt:time,actorId,
      details:{sheet:reviewed.settings.sheetName,headerRow:reviewed.settings.headerRow,
        rowCount:reviewed.rows.length,edgeCount:edges.length,customSources,
        advancedEdgeCount:reviewed.advancedEdgeCount||0,
        omittedTemplateCount:reviewed.missingTemplateRefs.length,
        interpretation:reviewed.advancedEdgeCount?'explicit-per-edge-relations-and-signed-lags':'explicit-FS-zero-lag',
        dateFormat:reviewed.settings.dateFormat,durationBasis:reviewed.settings.durationBasis,
        evidenceTrust:'user-reviewed-unverified',originalFileNotStored:true}});
    const first=next.auditEvents.find(event=>event.eventType==='reviewed-workbook-new-draft');
    if(first)first.details.skippedActivities=false;
    next.validation=validity;
    return next;
  }
  return Object.freeze({FIELD_IDS,DATE_FIELDS,ALIASES,LABELS,suggestSheet,describe,parseLinks,review,applyToNewDraft});
});
