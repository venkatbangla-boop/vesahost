
'use strict';
/**
 * VESA PPM 360 single-file application.
 * Purpose: own the offline-first universal apparel pre-production meeting workflow in one portable HTML file.
 * Ownership: UI rendering, PPM domain state, relevance rules, readiness validation, local persistence, photo compression,
 * signatures, JSON portability, and print preparation. It intentionally does not replace buyer manuals, statutory
 * requirements, laboratory standards, or final inspection procedures; those remain external governing references.
 * Access: open this file in a modern browser. AppController is the only orchestration entry point.
 * State: one active PPM record plus persisted drafts. Record mutations flow through AppController so autosave and
 * dashboard calculations remain synchronized. No server or network dependency is required.
 */

const APP_VERSION='5.0.0';
const STATUS_VALUES=['OK','ACTION','PENDING','N/A'];
const PROCESS_OPTIONS=[
  ['print','Print'],['embroidery','Embroidery'],['heatTransfer','Heat Transfer'],['garmentWash','Garment Wash'],
  ['garmentDye','Garment Dye'],['denimEffects','Denim Effects / Laser'],['bonding','Bonding / No-sew'],
  ['seamSeal','Seam Sealing'],['coating','Coating / Lamination'],['fusing','Fusing'],['quilting','Quilting / Padding'],
  ['specialFinish','Special Finish']
];
const GARMENT_PROFILES=[
  {id:'',label:'Select profile',product:'',construction:'',productClass:'',summary:'Universal core only; choose a profile to activate style-specific checks.'},
  {id:'tshirt',label:'T-shirt - Knit',product:'T-shirt',construction:'knit',productClass:'top',summary:'Neck rib, shoulder, sleeve/hem, knit recovery and twist controls.'},
  {id:'polo',label:'Polo - Knit',product:'Polo shirt',construction:'knit',productClass:'top',summary:'Collar/cuff, placket, buttons and knit recovery controls.'},
  {id:'shirt',label:'Shirt - Woven',product:'Shirt',construction:'woven',productClass:'top',summary:'Collar/cuff/placket, fusing, buttonhole and pattern-matching controls.'},
  {id:'hoodie',label:'Hoodie - Knit',product:'Hoodie',construction:'knit',productClass:'top',summary:'Hood, drawcord/zip, pocket, rib recovery and heavy-knit assembly controls.'},
  {id:'sweatshirt',label:'Sweatshirt - Knit',product:'Sweatshirt',construction:'knit',productClass:'top',summary:'Neck/cuff/hem rib, seam recovery and shape controls.'},
  {id:'trouser',label:'Trouser / Pant - Woven',product:'Trouser / Pant',construction:'woven',productClass:'bottom',summary:'Waistband, fly, pocket, crotch/seat seam and leg balance controls.'},
  {id:'shorts',label:'Shorts - Woven',product:'Shorts',construction:'woven',productClass:'bottom',summary:'Waistband, fly/pocket, inseam, hem and leg-opening controls.'},
  {id:'jeans',label:'Jeans - Denim',product:'Jeans',construction:'denim',productClass:'bottom',summary:'Rivet/tack, wash shade, crocking, leg twist and post-wash measurement controls.'},
  {id:'dress',label:'Dress',product:'Dress',construction:'woven',productClass:'dress',summary:'Drape, lining/zip, waist seam, symmetry and hem balance controls.'},
  {id:'skirt',label:'Skirt',product:'Skirt',construction:'woven',productClass:'dress',summary:'Waistband, zip/vent, lining, hem and hang-balance controls.'},
  {id:'jacket',label:'Jacket / Outerwear',product:'Jacket / Outerwear',construction:'other',productClass:'outerwear',summary:'Shell/lining/padding, closure, pocket and optional protective-process controls.'},
  {id:'active_top',label:'Activewear Top',product:'Activewear Top',construction:'knit',productClass:'activewear',summary:'Stretch/recovery, seam stretch and specified performance controls.'},
  {id:'active_bottom',label:'Activewear Bottom / Legging',product:'Activewear Bottom / Legging',construction:'knit',productClass:'activewear',summary:'Waistband/gusset, opacity where specified, stretch/recovery and seam performance controls.'},
  {id:'sweater',label:'Sweater / Fully Fashioned',product:'Sweater',construction:'sweater',productClass:'top',summary:'Yarn/gauge, panel dimensions, linking and shape-stability controls.'},
  {id:'intimate',label:'Intimate / Lingerie',product:'Intimate / Lingerie',construction:'knit',productClass:'intimate',summary:'Elastic/strap/hardware, skin-contact seam and stretch-recovery controls.'},
  {id:'kids_tshirt',label:'Kids T-shirt - Knit',product:'Kids T-shirt',construction:'knit',productClass:'kids',summary:'T-shirt construction plus buyer/market child-product safety controls.'},
  {id:'uniform',label:'Uniform / Workwear',product:'Uniform / Workwear',construction:'woven',productClass:'uniform',summary:'Functional pockets, reinforcement and specified visibility/protective components.'},
  {id:'custom',label:'Custom / Other',product:'',construction:'',productClass:'other',summary:'No style assumptions; construction, product group and processes are selected manually.'}
];
const PROFILE_MAP=Object.fromEntries(GARMENT_PROFILES.map(x=>[x.id,x]));
const POM_PRESETS={
  tshirt:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Sleeve Opening','Bottom Opening','Neck Width','Front Neck Drop'],
  polo:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Sleeve Opening','Bottom Opening','Collar Length','Placket Length'],
  shirt:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Collar','Cuff','Across Back','Bottom Opening'],
  hoodie:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Cuff Opening','Bottom Rib','Hood Height','Hood Width'],
  sweatshirt:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Cuff Opening','Bottom Rib','Neck Width','Front Neck Drop'],
  trouser:['Waist','Hip','Front Rise','Back Rise','Inseam','Outseam','Thigh','Leg Opening'],
  shorts:['Waist','Hip','Front Rise','Back Rise','Inseam','Outseam','Thigh','Leg Opening'],
  jeans:['Waist','Hip','Front Rise','Back Rise','Inseam','Outseam','Thigh','Leg Opening'],
  dress:['Body Length','1/2 Chest','Waist','Hip','Shoulder','Armhole','Bottom Opening','Front Neck Drop'],
  skirt:['Waist','Hip','Front Length','Back Length','Bottom Opening','Waistband Height','Vent Length'],
  jacket:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Cuff Opening','Bottom Opening','Across Back','Hood/Collar'],
  active_top:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Bottom Opening','Neck Width','Front Neck Drop'],
  active_bottom:['Waist','Hip','Front Rise','Back Rise','Inseam','Outseam','Thigh','Leg Opening'],
  sweater:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Cuff Opening','Bottom Opening','Neck Width'],
  intimate:['Under Bust / Waist','Cup / Front Width','Strap Length','Elastic Length','Side Seam','Bottom / Leg Opening'],
  kids_tshirt:['Body Length','1/2 Chest','Shoulder','Sleeve Length','Sleeve Opening','Bottom Opening','Neck Width','Front Neck Drop'],
  uniform:['Body Length / Outseam','Chest / Waist','Hip','Shoulder','Sleeve / Inseam','Opening','Pocket Position','Critical Functional POM']
};
const PARTICIPANT_ROLES=['Merchandising','Factory QA / QC','Technical / Pattern','Fabric / Textile QA','Store / Warehouse','Cutting','Production / Sewing','Line QC / End-line QC','IE / Planning','Sample Room','Maintenance','Print / Embroidery / Wash','Finishing / Packing','Lab / Testing','Buyer / Buying QA'];
const EVIDENCE_SLOTS=[['ppSample','PP / Sealed Sample'],['fabricShade','Fabric / Shade'],['trims','Trims / Labels'],['construction','Construction / Operation'],['decoration','Print / Embroidery / Wash'],['packing','Packing / Barcode'],['defect','Risk / Defect'],['other','Other Evidence']];
const SIGNATURE_ROLES=[['factory','Factory Authorized Person'],['agent','Agent / Inspection Representative'],['vesa','VESA Enterprise Inc.'],['buyer','Buyer / Buying QA (if applicable)']];

const SECTION_SCHEMA=[
 {id:'order',title:'01 · ORDER, DOCUMENT & APPROVAL CONTROL',knowledge:['Use one current source of truth for tech pack, BOM and measurement spec; obsolete versions should not remain on the production floor.','Record buyer-specific acceptance, inspection and legal requirements instead of assuming a default AQL or market standard.','Any unresolved approval must have an owner and due date before bulk release.'],items:[
  ['O01','Buyer, style, PO/order reference, quantity, color/size breakdown, delivery and destination are confirmed.',1],
  ['O02','Latest tech pack revision/date is controlled and obsolete versions are removed from use.',1,'One current revision prevents construction and measurement drift.'],
  ['O03','Current BOM / trim card and component specifications are available and aligned with the tech pack.',1],
  ['O04','Current measurement specification, tolerance and measuring method are available.',1],
  ['O05','Fit, development, salesman/sample and buyer comments are consolidated; open comments are clearly identified.',0],
  ['O06','Approval matrix is reviewed: PP sample, fabric, color, trims, print/embroidery/wash and packaging approvals as applicable.',1],
  ['O07','Applicable buyer manual, destination-market product safety / labeling / compliance requirements are identified.',1,'Record the governing buyer or market requirement; do not substitute a generic standard.'],
  ['O08','Inspection method, buyer-required AQL/sample plan and inspection booking requirements are confirmed.',0,'Use the buyer-agreed sampling plan; no default AQL is assumed.'],
  ['O09','Approved / sealed PP sample or written PP waiver is available as the workmanship reference.',1],
  ['O10','PPM attendees, decision owners and escalation contacts are identified.',0]
 ]},
 {id:'technical',title:'02 · TECHNICAL, FIT, PATTERN & SAMPLE CONTROL',knowledge:['Lock construction method, pattern revision and critical measurements before bulk.','Use the smallest and largest sizes to expose grading and balance risks.','Pilot/first-output approval should prove the actual production method, not only sample-room workmanship.'],items:[
  ['T01','Style construction is agreed: neckline/collar, placket, sleeve, cuff, pocket, seam, hem and all design details.',1],
  ['T02','Previous sample comments are physically verified on the PP / sealed sample.',1],
  ['T03','Fit, balance, silhouette and garment symmetry are accepted for intended product and size range.',1],
  ['T04','Final master pattern, grading rule and revision identification are controlled.',1],
  ['T05','Seam allowances, notches, drill marks, match points and placement marks are confirmed.',0],
  ['T06','Pattern includes approved shrinkage / process allowance for wash, relaxation, bonding or finishing where required.',1],
  ['T07','Critical POMs, tolerances and measuring landmarks are identified for line control.',1],
  ['T08','Size set / size run / pilot requirement and representative sizes/colors are defined.',0],
  ['T09','Largest and smallest sizes are reviewed for grading, proportion, component fit and construction risk.',0],
  ['T10','Workmanship reference and defect classification expectations are understood by production and QC.',1],
  ['T11','Difficult operations have mock-up / folder / template / jig requirement confirmed before line start.',0],
  ['T12','First output approval plan is defined using actual bulk material, machines and operators.',1]
 ]},
 {id:'material',title:'03 · FABRIC / YARN / MATERIAL CONTROL',knowledge:['Material behavior drives pattern, cutting, sewing and finished measurements.','Shade/lot segregation, dimensional stability and usable width must be known before cutting.','Product-specific tests only apply when required by buyer, material type or intended performance.'],items:[
  ['M01','Fabric / yarn composition, construction and approved quality reference are confirmed.',1],
  ['M02','Fabric weight (GSM/oz), yarn count or gauge is checked against the approved requirement.',1],
  ['M03','Usable width / open width / tubular dia is confirmed for marker and consumption planning.',0],
  ['M04','Bulk material quantity in-house versus requirement, shortage/excess and pending arrivals are reviewed.',1],
  ['M05','Fabric / yarn inspection status and accepted/rejected/hold quantity are reviewed.',1],
  ['M06','Dye lot / shade lot / yarn lot and shade segregation method are approved.',1],
  ['M07','Handfeel, surface appearance, finish, luster and approved shade standard are available for comparison.',0],
  ['M08','Dimensional change / shrinkage in relevant directions is known and reflected in pattern/process control.',1,'Dimensional change after laundering or processing affects finished measurements.'],
  ['M09','Colorfastness / rubbing / crocking / migration risks are reviewed where required by buyer or product use.',0],
  ['M10','Bow, skew, distortion, defects and material appearance risks are reviewed.',0],
  ['M11','Material storage, conditioning and relaxation requirements before cutting are defined.',1],
  ['M12','Lot traceability from material receipt through cutting / bundling is defined.',0],
  ['M13','Approved subcontract / material source and required certification or traceability documents are available where applicable.',0],
  ['MK1','Knit spirality / skew and garment twist risk are reviewed, including after-wash result where applicable.',1,'','knit'],
  ['MK2','Knit stretch / recovery / growth is confirmed for body fabric, rib, collar and cuff as applicable.',1,'','knit'],
  ['MK3','Rib / collar / cuff GSM, shade, width, stretch and recovery match the approved standard.',0,'','knit'],
  ['MW1','Woven construction / density (e.g., EPI/PPI where specified), bow/skew and handle are confirmed.',0,'','woven'],
  ['MW2','Plaid / stripe repeat, nap, pile or directional face requirements are defined for cutting and matching.',0,'','woven'],
  ['MD1','Denim shade blanket / lot continuity and pre-wash vs approved wash shade strategy are confirmed.',1,'','denim'],
  ['MD2','Denim skew / leg twist and dry/wet crocking risks are reviewed where required.',1,'','denim'],
  ['MS1','Sweater yarn composition/count, yarn lot, gauge and approved swatch/handfeel are confirmed.',1,'','sweater'],
  ['MS2','Sweater panel dimensions / relaxation behavior and linking compatibility are confirmed.',1,'','sweater'],
  ['MO1','Shell, lining, interlining/padding/insulation specifications and compatibility are confirmed.',1,'','',null,'outerwear'],
  ['MA1','Performance fabric stretch/recovery and specified functional properties are confirmed before bulk.',1,'','',null,'activewear']
 ]},
 {id:'trims',title:'04 · TRIMS, LABELS & PRODUCT-SAFETY CONTROL',knowledge:['Verify trims against the approved BOM, not only by appearance.','Functional attachments need suitable strength/function checks when required.','Kidswear and destination-market safety controls must follow the applicable buyer/legal standard.'],items:[
  ['R01','Sewing thread specification, color, ticket/count and availability are confirmed.',0],
  ['R02','Main, size, care/content and country-of-origin labels: wording, quality, size, placement and orientation are confirmed.',1],
  ['R03','Buttons, zippers, snaps, hooks, rivets, buckles and other fasteners match approved specification and function.',1],
  ['R04','Elastic, drawcord, tape, twill tape, binding, cord ends and related trims match approved specification.',0],
  ['R05','Decorative trims, badges, patches, appliqué and branding components are approved.',0],
  ['R06','Bulk trim quantity in-house versus requirement, shortage and arrival date are reviewed.',1],
  ['R07','Trim color / shade / plating / finish matching is approved against garment standard.',0],
  ['R08','Attachment strength / pull / function testing requirement is identified for applicable trims.',0],
  ['R09','Metal component, sharp point/edge, chemical/RSL or other buyer/market safety controls are identified where applicable.',1],
  ['R10','Broken needle / metal detection requirement and affected product/process are defined.',1],
  ['RK1','Kidswear drawcord/cord, small-part and attachment safety requirements are specifically reviewed.',1,'','',null,'kids']
 ]},
 {id:'cutting',title:'05 · CUTTING, FUSING & PREPARATION CONTROL',knowledge:['Cutting controls must preserve shade lot, direction and pattern accuracy.','Relaxation and spreading tension are common causes of dimensional distortion in stretch/knit materials.','Fusing parameters should be proven on bulk materials before mass production.'],items:[
  ['C01','Required fabric conditioning / relaxation is completed and recorded before spreading.',1],
  ['C02','Spreading method, ply height, tension and face/direction rules are defined.',1],
  ['C03','Dye lot / shade lot segregation is maintained through spreading, cutting and bundling.',1],
  ['C04','Face/back, grain/wale, nap, pile and one-way direction are controlled as applicable.',0],
  ['C05','Stripe / plaid / engineered pattern matching rules are defined where applicable.',0],
  ['C06','Marker, size ratio and consumption assumptions are aligned with PO and usable material width.',0],
  ['C07','Cut panel accuracy, notches, drill marks and component pairing checks are defined.',1],
  ['C08','Panel numbering / bundling / bundle ticket method preserves size, shade and traceability.',1],
  ['C09','Cut-panel inspection, defect replacement and re-cut authorization process are defined.',0],
  ['C10','Fusing/interlining temperature, pressure, time, peel/appearance and shrinkage compatibility are approved where applicable.',1,'','', ['fusing']],
  ['C11','Pre-cut or laser / special cutting templates and placement references are approved where applicable.',0]
 ]},
 {id:'sewing',title:'06 · SEWING / ASSEMBLY / CONSTRUCTION CONTROL',knowledge:['Actual line setup should reproduce the approved sample with bulk materials and production equipment.','Needle, thread, stitch and feed settings should prevent seam damage, puckering, waviness and failure.','Identify bottleneck and high-defect operations before ramp-up.'],items:[
  ['S01','Operation breakdown / sequence is aligned with approved construction and production method.',1],
  ['S02','Required machines, attachments, folders, guides, templates and spare capacity are available.',1],
  ['S03','Needle type/point/size is suitable for material and product; needle damage risk is controlled.',1],
  ['S04','Stitch type, seam type, SPI, thread combination and seam allowance are defined at critical operations.',1],
  ['S05','Thread tension, presser pressure, feed and relevant machine settings are established on bulk material.',0],
  ['S06','Critical operations and likely defect-generating operations are identified for enhanced QC.',1],
  ['S07','Seam appearance criteria cover puckering, roping, waviness, skipped/broken stitches and open seams.',1],
  ['S08','Seam strength / seam stretch / slippage requirement is identified where applicable.',0],
  ['S09','Matching, symmetry, alignment and pair-part controls are defined.',0],
  ['S10','Reinforcement / bartack / backtack / stress-point requirements are confirmed.',0],
  ['S11','Repair/rework method, segregation and re-inspection process are defined.',0],
  ['S12','Broken needle control and missing-fragment escalation process are understood on the line.',1],
  ['SK1','Differential feed / stretch control and seam recovery are set to prevent knit waviness and growth.',1,'','knit'],
  ['SS1','Sweater linking, seam/linking tension and needle-line appearance standards are confirmed.',1,'','sweater'],
  ['SO1','Lining, padding/insulation, quilting and component alignment method are confirmed.',1,'','',null,'outerwear'],
  ['SB1','Bonded/no-sew seam preparation, adhesive, temperature/pressure/time and peel appearance are approved.',1,'','',['bonding']],
  ['ST1','Seam sealing / tape width, machine setting, adhesion and leak-test requirement are approved where applicable.',1,'','',['seamSeal']]
 ]},
 {id:'process',title:'07 · DECORATION, WASH & SPECIAL PROCESS CONTROL',knowledge:['Use approved physical artwork/process standards for placement, color and appearance.','Special-process settings must be validated on bulk material and rechecked after wash/finishing.','Outsourced processes need approved subcontractor, lot traceability and transport/handling control.'],items:[
  ['P00','Special process requirement is identified; applicable approval standard, supplier and control method are clear (or confirmed N/A).',0],
  ['P01','Print artwork, size, placement, color and technique match approved standard.',1,'','',['print']],
  ['P02','Print ink/material, curing parameters, handfeel and adhesion/wash performance requirement are confirmed.',1,'','',['print']],
  ['P03','Embroidery artwork, size, placement, thread colors, density/backing and appearance are approved.',1,'','',['embroidery']],
  ['P04','Heat-transfer artwork, placement, temperature/time/pressure and adhesion/appearance are approved.',1,'','',['heatTransfer']],
  ['P05','Garment wash standard, recipe/process route, shade, handfeel and visual effect are approved.',1,'','',['garmentWash']],
  ['P06','Garment-dye batch, shade standard, recipe/process and lot control are defined.',1,'','',['garmentDye']],
  ['P07','Denim effect standard (wash/laser/whisker/resin/abrasion as applicable) and placement consistency are approved.',1,'','',['denimEffects']],
  ['P08','Coating / lamination or special finish process parameters and appearance/function requirements are approved.',1,'','',['coating','specialFinish']],
  ['P09','Special-process subcontractor approval, capacity, traceability and handover/transport controls are confirmed.',0,'','',['print','embroidery','heatTransfer','garmentWash','garmentDye','denimEffects','bonding','seamSeal','coating','quilting','specialFinish']],
  ['P10','Post-process measurement, shrinkage/distortion and appearance are verified against requirement.',1,'','',['print','embroidery','heatTransfer','garmentWash','garmentDye','denimEffects','bonding','seamSeal','coating','quilting','specialFinish']]
 ]},
 {id:'quality',title:'08 · QUALITY, TESTING & COMPLIANCE CONTROL',knowledge:['Inspection frequency and acceptance rules should come from the buyer/quality manual.','Pending or failed tests need disposition, owner and deadline before release.','Keep test/calibration evidence traceable to style, lot and date.'],items:[
  ['Q01','Inline, end-line and final inspection plan, checkpoints and responsible QA/QC are confirmed.',1],
  ['Q02','Critical / Major / Minor defect classification follows the buyer-approved quality standard.',1],
  ['Q03','Buyer-required final inspection sampling / AQL plan is recorded; no generic default is substituted.',1],
  ['Q04','Measurement inspection frequency and size/color coverage are defined for production.',1],
  ['Q05','Fabric / garment laboratory test matrix and required reports are reviewed for this style.',1],
  ['Q06','Any failed or pending test has written disposition, action owner and closure date.',1],
  ['Q07','Dimensional stability, skew/twist and post-laundering appearance requirements are reviewed where applicable.',0],
  ['Q08','Buyer RSL / chemical / product-safety requirements and required evidence are identified.',1],
  ['Q09','Metal detection / detector calibration and frequency are defined where required.',0],
  ['Q10','Measuring tools / scales / relevant inspection equipment calibration status is acceptable.',0],
  ['Q11','First-output, inline, end-line and final quality records / photo evidence format are agreed.',0],
  ['Q12','Lot, bundle, operator or process traceability needed for defect investigation is defined.',0],
  ['Q13','Functional performance requirement (water resistance, stretch, moisture, insulation, etc.) is confirmed when specified.',0]
 ]},
 {id:'finishing',title:'09 · FINISHING, PACKING & LOGISTICS CONTROL',knowledge:['Packing should be checked against PO/buyer instructions at style, color, size and carton level.','Barcode/ticket scan verification prevents manual labeling errors.','Final measurements and appearance should be checked after all heat/wash/finishing processes.'],items:[
  ['F01','Thread trimming, stain removal, cleaning and pressing/ironing method are confirmed.',0],
  ['F02','Pressing/finishing temperature or steam risk is controlled for material, print, transfer and trims.',0],
  ['F03','Final garment measurement method and checkpoints after finishing are confirmed.',1],
  ['F04','Final appearance standard covers shape, symmetry, neckline, sleeve/leg matching, seams, hem and silhouette.',1],
  ['F05','Shade sorting / acceptable lot mixing rule is defined for finished goods.',0],
  ['F06','Folding, tissue/board, hanger, individual/master polybag and presentation method are approved.',1],
  ['F07','Size/color assortment and pack ratio match PO / buyer requirement.',1],
  ['F08','Barcode/UPC, price ticket, hangtag and stickers: content, placement and scan verification are confirmed.',1],
  ['F09','Carton quality, dimensions, gross/net weight and sealing method are confirmed.',1],
  ['F10','Shipping marks, carton numbering, packing list and carton count control are confirmed.',1],
  ['F11','Moisture control / desiccant / mold prevention requirements are defined where applicable.',0],
  ['F12','Finished-goods audit / packing audit and hold-release process are defined before shipment.',1]
 ]},
 {id:'planning',title:'10 · PLANNING, IE, CAPACITY & TNA CONTROL',knowledge:['PPM should convert technical decisions into dates, owners and production capacity.','Capacity and special-machine constraints should be resolved before line loading.','Inspection booking and ex-factory dates need enough buffer for corrective action.'],items:[
  ['L01','TNA milestones are reviewed against ex-factory / shipment date and current approval/material status.',1],
  ['L02','Material in-house dates and shortages are aligned with cutting / sewing start plan.',1],
  ['L03','Line allocation, planned start date, capacity and manpower are confirmed.',1],
  ['L04','Operator skill and training requirement for critical operations are identified.',0],
  ['L05','Machine requirement versus operation breakdown is checked and availability confirmed.',1],
  ['L06','IE target, line balancing, ramp-up plan and likely bottlenecks are reviewed.',0],
  ['L07','Subcontract / special-process lead time and transport time are included in the production plan.',0],
  ['L08','Daily output target, quality gate timing and recovery plan for slippage are agreed.',0],
  ['L09','QA/QC manpower and inspection coverage are available for planned production volume.',0],
  ['L10','Final inspection booking, packing completion, ex-factory and forwarder/warehouse handover dates are aligned.',1],
  ['L11','Contingency / escalation plan exists for critical material, approval, capacity or quality risk.',0]
 ]},
 {id:'release',title:'11 · BULK READINESS & CLOSURE CONTROL',knowledge:['Bulk release is a gate, not a ceremonial signature.','A GO decision requires closed blockers and controlled documents/materials/methods.','Conditional GO should state exact conditions, owner, due date and evidence.'],items:[
  ['B01','Latest approved tech pack / spec / BOM are controlled at production location.',1],
  ['B02','Approved PP / sealed sample or authorized waiver is available.',1],
  ['B03','Bulk fabric/yarn and key trims are approved/released with material risks understood.',1],
  ['B04','Pattern, grading, shrinkage/process allowance and critical measurements are locked.',1],
  ['B05','Cutting/sewing/special-process method and first-output approval plan are locked.',1],
  ['B06','Packing, labeling, barcode, carton and destination requirements are clear.',1],
  ['B07','All unresolved points have owner, due date, required evidence and escalation path.',1],
  ['B08','Written conditional approval exists for any permitted open condition before bulk starts.',1],
  ['B09','Bulk release decision is recorded as GO / CONDITIONAL GO / HOLD with authorized sign-off.',1]
 ]}
];

/* Style-specific smart controls are composed into the universal master library once at startup.
 * They supplement - never replace - the universal checkpoints, so every profile retains the same core PPM gate. */
const PROFILE_CHECKPOINTS={
  technical:[
    ['GT01','T-shirt neckline/rib type, finished neck dimensions, stretch/recovery and neckline seam/topstitch method are approved.',1,'','','',['tshirt','kids_tshirt']],
    ['GP01','Polo collar/cuff construction, dimensions, stretch/recovery and stripe/tipping orientation are approved.',1,'','','',['polo']],
    ['GP02','Polo placket length/width, button/buttonhole positions, pocket position (if any) and reinforcement are approved.',1,'','','',['polo']],
    ['GSH01','Shirt collar/stand, cuff, placket, yoke and interlining/fusing construction are approved.',1,'','','',['shirt']],
    ['GH01','Hood shape/overlap, drawcord/eyelet or zipper, pocket position and reinforcement are approved.',1,'','','',['hoodie']],
    ['GSW01','Sweatshirt neck/cuff/hem rib dimensions, recovery and body-rib balance are approved.',1,'','','',['sweatshirt']],
    ['GBT01','Bottom waistband, fly/closure, pocket construction, crotch/seat seam and stress-point reinforcement are approved.',1,'','','',['trouser','shorts','jeans']],
    ['GD01','Dress neckline/closure, lining if any, waist seam, drape, symmetry and hem balance are approved.',1,'','','',['dress']],
    ['GSK01','Skirt waistband, closure/zip, vent, lining if any, hem and hang balance are approved.',1,'','','',['skirt']],
    ['GJK01','Outerwear shell/lining/padding, closure/placket, pocket, hood/collar, cuff and hem system are approved.',1,'','','',['jacket']],
    ['GA01','Activewear stretch direction, body coverage/opacity where specified, seam stretch and movement-fit risks are approved.',1,'','','',['active_top','active_bottom']],
    ['GI01','Intimate/lingerie elastic, strap, hook-eye/closure, cup/underwire if applicable and skin-contact seam/edge construction are approved.',1,'','','',['intimate']],
    ['GU01','Uniform/workwear functional pockets, reinforcement points and specified visibility/protective components are approved.',1,'','','',['uniform']]
  ],
  material:[
    ['GT02','T-shirt body fabric and neck rib are checked together for shade, shrinkage, recovery and spirality/twist compatibility.',1,'','','',['tshirt','kids_tshirt']],
    ['GJ01','Jeans/denim approved wash shade range, dry/wet crocking risk and leg-twist risk are defined before bulk.',1,'','','',['jeans']],
    ['GA02','Activewear fabric stretch/recovery and any specified moisture, opacity or performance requirement have an approved test plan.',1,'','','',['active_top','active_bottom']]
  ],
  cutting:[
    ['GSH02','Shirt stripe/check matching and alignment rules are defined for fronts, pockets, yokes, collars/cuffs where applicable.',0,'','','',['shirt']],
    ['GJ02','Jeans/denim panel direction, shade/lot segregation and wash-sensitive component pairing are controlled.',1,'','','',['jeans']]
  ],
  sewing:[
    ['GT03','T-shirt shoulder seam/tape, sleeve/armhole and sleeve/bottom hem methods are set to prevent seam stretch, waviness and twisting.',1,'','','',['tshirt','kids_tshirt']],
    ['GSH03','Shirt collar/cuff turning, topstitch, buttonhole/button and placket operations have approved method and guides/templates where needed.',1,'','','',['shirt']],
    ['GH02','Hoodie hood/body joining, pocket attachment, zipper if any and rib joining are controlled for symmetry and distortion.',1,'','','',['hoodie']],
    ['GBT02','Bottom waistband, fly, pocket, crotch/seat seam, belt-loop and hem operations have approved reinforcement and sequence.',1,'','','',['trouser','shorts','jeans']],
    ['GJK02','Outerwear lining/padding/quilting alignment and closure installation are controlled; seam sealing applies only when specified.',1,'','','',['jacket']],
    ['GA03','Activewear seam type/needle/thread and feed settings meet specified stretch without popping, chafing or excessive growth.',1,'','','',['active_top','active_bottom']]
  ],
  quality:[
    ['GJ03','Jeans post-wash measurements, shade range, abrasion/effect placement and leg-twist results are checked against the approved standard.',1,'','','',['jeans']],
    ['GA04','Activewear functional claims are tested only to the buyer/spec requirement; test method and acceptance criteria are recorded.',1,'','','',['active_top','active_bottom']],
    ['GK01','Kids product safety checks required by buyer/destination market are identified for cords, small parts, attachments and labeling.',1,'','','',['kids_tshirt']]
  ]
};
for(const [sectionId,items] of Object.entries(PROFILE_CHECKPOINTS)){
  const section=SECTION_SCHEMA.find(x=>x.id===sectionId); if(section)section.items.push(...items);
}

/** Utility-only pure helpers. Domain behavior lives in classes below. */
const U={
  clone:v=>JSON.parse(JSON.stringify(v)),
  uid:()=>`PPM-${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
  esc:s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
  debounce:(fn,ms=300)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}},
  today:()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`} ,
  nowTime:()=>new Date().toTimeString().slice(0,5),
  percent:(a,b)=>b?Math.round(a*100/b):0
};

/**
 * Owns the canonical PPM record shape and safe default creation.
 * Access: AppController creates records through this class only.
 * State: returned records are mutable application state; schema constants remain immutable.
 */
class PpmRecordFactory{
  static create(){
    const statuses={},remarks={},participants={};
    SECTION_SCHEMA.forEach(s=>s.items.forEach(i=>{statuses[i[0]]='';remarks[i[0]]=''}));
    PARTICIPANT_ROLES.forEach(r=>participants[r]={present:false,name:''});
    return {id:U.uid(),version:APP_VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),locked:false,
      meta:{factory:'',buyer:'',style:'',po:'',profile:'',product:'',orderQty:'',ppmDate:U.today(),deliveryDate:'',market:'',construction:'',productClass:'',sizeRange:'',fabricComposition:'',fabricStructure:'',fabricWeight:'',fabricWidth:'',colorways:'',techPackRev:'',measurementRev:'',bomRev:'',ppSampleRef:'',aqlRef:'',washFinish:'',locationLine:'',specialInstruction:'',processes:[]},
      statuses,remarks,participants,measurements:Array.from({length:6},()=>PpmRecordFactory.measurement()),actions:[],photos:{style:'',evidence:{}},signatures:{},release:{decision:'',notes:''},ui:{mode:'fast',filter:'all',search:''}
    };
  }
  static measurement(){return {pom:'',spec:'',tol:'',method:'',risk:'',remark:''}}
}

/**
 * Decides which master checkpoints apply to the selected product construction/class/processes.
 * Inputs: immutable schema + active record metadata. Output: boolean relevance; no persistence side effects.
 */
class RelevanceEngine{
  /** Compose record-owned custom items without changing the immutable master schema. */
  sections(record){return SECTION_SCHEMA.map(s=>({...s,items:[...s.items,...(record.customCheckpoints||[]).filter(c=>c.section===s.id).map(c=>[c.id,c.label,c.critical?1:0,c.hint||''])]}))}

  applies(item,record){
    const construction=item[4],processes=item[5],rawProductClass=item[6],profiles=item[7]||(Array.isArray(rawProductClass)?rawProductClass:null),productClass=Array.isArray(rawProductClass)?null:rawProductClass;
    if(construction && construction!==record.meta.construction)return false;
    if(processes && !processes.some(p=>record.meta.processes.includes(p)))return false;
    if(productClass && productClass!==record.meta.productClass)return false;
    if(profiles && !profiles.includes(record.meta.profile))return false;
    return true;
  }
  applicableItems(record){return this.sections(record).flatMap(s=>s.items.filter(i=>this.applies(i,record)).map(i=>({section:s,...this.itemObject(i)})))}
  itemObject(i){const rawProductClass=i[6],profiles=i[7]||(Array.isArray(rawProductClass)?rawProductClass:null);return {id:i[0],label:i[1],critical:!!i[2],hint:i[3]||'',construction:i[4]||null,processes:i[5]||null,productClass:Array.isArray(rawProductClass)?null:(rawProductClass||null),profiles:profiles||null}}
}

/**
 * Computes review coverage, closure readiness, section scores and blockers from the active record.
 * Closure counts OK/N/A and ACTION items whose linked action is Closed; PENDING never counts closed.
 */
class CoverageEngine{
  constructor(relevance){this.relevance=relevance}
  compute(record){
    const items=this.relevance.applicableItems(record);let reviewed=0,closed=0,pending=0,actions=0,criticalBlockers=0;
    for(const x of items){const st=record.statuses[x.id];if(st)reviewed++;if(st==='PENDING')pending++;if(st==='ACTION')actions++;
      const action=record.actions.find(a=>a.checkpointId===x.id);const isClosed=st==='OK'||st==='N/A'||(st==='ACTION'&&action&&action.status==='Closed');if(isClosed)closed++;
      if(x.critical&&(!st||st==='PENDING'||(st==='ACTION'&&!(action&&action.status==='Closed'))))criticalBlockers++;
    }
    return {master:this.relevance.sections(record).reduce((n,s)=>n+s.items.length,0),applicable:items.length,reviewed,closed,pending,actions,criticalBlockers,coverage:U.percent(reviewed,items.length),closure:U.percent(closed,items.length)};
  }
  section(record,section){const items=(this.relevance.sections(record).find(s=>s.id===section.id)||section).items.filter(i=>this.relevance.applies(i,record));let reviewed=0;for(const i of items)if(record.statuses[i[0]])reviewed++;return {applicable:items.length,reviewed,coverage:U.percent(reviewed,items.length)}}
}

/**
 * Enforces release gate rules without assuming buyer-specific quality thresholds.
 * GO requires full review, all applicable items closed, no critical blocker, key header fields, and signatures.
 * CONDITIONAL GO permits open ACTION items only when they have owner, due date and a documented action.
 */
class ValidationEngine{
  constructor(relevance,coverage){this.relevance=relevance;this.coverage=coverage}
  keyFields(record){const required=[['Factory',record.meta.factory],['Buyer',record.meta.buyer],['Style',record.meta.style],['PPM date',record.meta.ppmDate],['Construction',record.meta.construction],['Tech pack revision',record.meta.techPackRev]];return required.filter(x=>!String(x[1]||'').trim()).map(x=>x[0])}
  actionGaps(record){return record.actions.filter(a=>a.status!=='Closed'&&(!a.owner||!a.dueDate||!a.action)).map(a=>a.checkpointId||a.issue)}
  signatureCount(record){return SIGNATURE_ROLES.filter(([id])=>{const s=record.signatures[id];return s?.image&&s.name?.trim()&&s.date}).length}
  readiness(record){const c=this.coverage.compute(record),missing=this.keyFields(record),gaps=this.actionGaps(record),sigs=this.signatureCount(record);return {
    coverage100:c.coverage===100,closure100:c.closure===100,noCritical:c.criticalBlockers===0,headerComplete:missing.length===0,actionsControlled:gaps.length===0,hasSignoff:sigs>=2,
    go:c.coverage===100&&c.closure===100&&c.criticalBlockers===0&&missing.length===0&&sigs>=2,
    conditional:c.coverage===100&&c.pending===0&&c.criticalBlockers===0&&missing.length===0&&gaps.length===0&&sigs>=2&&!!record.release.notes.trim(),
    missing,gaps,sigs,c
  }}
}

/**
 * Persists complete PPM records locally. IndexedDB is primary because it tolerates image/signature data better;
 * localStorage is a transparent fallback for restrictive file:// browser contexts.
 * Failure behavior: quota/security failures reject to caller; AppController surfaces a visible save warning and keeps in-memory state.
 */
class PpmRepository{
  constructor(){this.db=null;this.fallback=false;this.memoryOnly=false;this.memory=new Map();this.dbName='vesa-ppm360';this.store='records'}
  async init(){
    try{const k='vesa.ppm.storage.test';localStorage.setItem(k,'1');localStorage.removeItem(k)}catch(e){this.memoryOnly=true}
    if(!('indexedDB'in window)||!window.indexedDB){this.fallback=true;return}
    try{this.db=await new Promise((resolve,reject)=>{const q=indexedDB.open(this.dbName,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(this.store))q.result.createObjectStore(this.store,{keyPath:'id'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});}catch(e){this.fallback=true}
  }
  getActiveId(){if(this.memoryOnly)return this.memory.get('__active__')||null;try{return localStorage.getItem('vesa.ppm.active')}catch(e){return null}}
  setActiveId(id){if(this.memoryOnly){this.memory.set('__active__',id);return}try{localStorage.setItem('vesa.ppm.active',id)}catch(e){}}
  async save(record){record.updatedAt=new Date().toISOString();if(this.fallback){if(this.memoryOnly){this.memory.set(record.id,U.clone(record));return}localStorage.setItem(`vesa.ppm.${record.id}`,JSON.stringify(record));this._index(record);return}return new Promise((resolve,reject)=>{const tx=this.db.transaction(this.store,'readwrite');tx.objectStore(this.store).put(U.clone(record));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
  async get(id){if(!id)return null;if(this.fallback){if(this.memoryOnly)return U.clone(this.memory.get(id)||null);const raw=localStorage.getItem(`vesa.ppm.${id}`);return raw?JSON.parse(raw):null}return new Promise((resolve,reject)=>{const q=this.db.transaction(this.store).objectStore(this.store).get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}
  async list(){if(this.fallback){if(this.memoryOnly)return [...this.memory.values()].filter(v=>v&&typeof v==='object'&&v.id).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));return JSON.parse(localStorage.getItem('vesa.ppm.index')||'[]').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}return new Promise((resolve,reject)=>{const q=this.db.transaction(this.store).objectStore(this.store).getAll();q.onsuccess=()=>resolve((q.result||[]).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));q.onerror=()=>reject(q.error)})}
  async remove(id){if(this.fallback){if(this.memoryOnly){this.memory.delete(id);return}localStorage.removeItem(`vesa.ppm.${id}`);const idx=JSON.parse(localStorage.getItem('vesa.ppm.index')||'[]').filter(x=>x.id!==id);localStorage.setItem('vesa.ppm.index',JSON.stringify(idx));return}return new Promise((resolve,reject)=>{const tx=this.db.transaction(this.store,'readwrite');tx.objectStore(this.store).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
  _index(r){if(this.memoryOnly)return;const k='vesa.ppm.index';let idx=JSON.parse(localStorage.getItem(k)||'[]').filter(x=>x.id!==r.id);idx.push({id:r.id,updatedAt:r.updatedAt,style:r.meta.style,buyer:r.meta.buyer,factory:r.meta.factory});localStorage.setItem(k,JSON.stringify(idx.slice(-40)))}
}

/**
 * Owns image compression for style/evidence photos before persistence.
 * Side effect: reads local user-selected image bytes and returns an in-memory JPEG data URL; files are never uploaded.
 */
class ImageService{
  async compress(file,max=1400,quality=.76){if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw new Error('Select a JPEG, PNG or WebP image up to 12 MB.');const data=await this.read(file);const img=await this.load(data);if(img.naturalWidth*img.naturalHeight>40000000)throw new Error('Image exceeds 40 megapixels.');const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));c.getContext('2d',{alpha:false}).drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',quality)}
  read(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
  load(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Image could not be read.'));i.src=src})}
}

/**
 * Maintains checkpoint-driven actions so ACTION status cannot disappear from follow-up tracking.
 * State mutation: adds linked action on ACTION, marks it Closed when checkpoint later becomes OK/N/A.
 */
class ActionTrackerManager{
  sync(record,checkpointId,label,status){let a=record.actions.find(x=>x.checkpointId===checkpointId);if(status==='ACTION'){if(!a){a={id:`A-${checkpointId}`,checkpointId,issue:label,action:'',owner:'',dueDate:'',evidence:'',status:'Open'};record.actions.push(a)}else if(a.status==='Closed')a.status='Open'}else if(a&&['OK','N/A'].includes(status)&&a.status!=='Closed'){a.status='Closed'}}
  reset(record){record.actions=[]}
}

/**
 * Owns pointer-driven signature capture and restoration for one signatory card.
 * Side effect: mutates only its canvas while drawing; AppController receives the final PNG data URL on stroke end.
 */
class SignaturePad{
  constructor(canvas,onChange){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onChange=onChange;this.drawing=false;this.last=null;this.resize();this.abort=new AbortController();const options={signal:this.abort.signal};window.addEventListener('resize',U.debounce(()=>this.resize(),150),options);canvas.addEventListener('pointerdown',e=>this.start(e),options);canvas.addEventListener('pointermove',e=>this.move(e),options);window.addEventListener('pointerup',()=>this.end(),options)}
  resize(){const rect=this.canvas.getBoundingClientRect();if(!rect.width)return;const dpr=Math.max(1,devicePixelRatio||1),old=this.canvas.toDataURL();this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);this.ctx.scale(dpr,dpr);this.ctx.lineWidth=2;this.ctx.lineCap='round';this.ctx.strokeStyle='#17324a';if(old.length>30)this.restore(old)}
  /** Release canvas/window listeners before rebuilding signatories. */
  dispose(){this.abort.abort()}
  point(e){const r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  start(e){if(document.body.classList.contains('locked'))return;this.drawing=true;this.last=this.point(e);this.canvas.setPointerCapture?.(e.pointerId)}
  move(e){if(!this.drawing)return;const p=this.point(e);this.ctx.beginPath();this.ctx.moveTo(this.last.x,this.last.y);this.ctx.lineTo(p.x,p.y);this.ctx.stroke();this.last=p}
  end(){if(!this.drawing)return;this.drawing=false;this.onChange(this.canvas.toDataURL('image/png'))}
  clear(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.onChange('')}
  restore(src){if(!src)return;const i=new Image();i.onload=()=>{const r=this.canvas.getBoundingClientRect();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(i,0,0,r.width,r.height)};i.src=src}
}

/**
 * Renders schema-driven sections and reusable controls. It owns DOM composition only; business decisions remain in engines.
 * Inputs: schema + current record snapshots. Outputs: DOM nodes/events; no direct persistence.
 */
class FormRenderer{
  constructor(relevance,coverage){this.relevance=relevance;this.coverage=coverage}
  renderNav(record){const nav=document.getElementById('sectionNav');nav.innerHTML='';for(const s of this.relevance.sections(record)){const sc=this.coverage.section(record,s);const b=document.createElement('button');b.className='nav-chip';b.dataset.target=s.id;b.innerHTML=`${U.esc(s.title.replace(/^\d+ · /,''))}<span class="badge">${sc.reviewed}/${sc.applicable}</span>`;nav.appendChild(b)}for(const x of [['measurements-section','POM'],['actions-section','Actions'],['evidence-section','Evidence'],['release-section','Release'],['signatures-section','Sign']]){const b=document.createElement('button');b.className='nav-chip';b.dataset.target=x[0];b.textContent=x[1];nav.appendChild(b)}}
  renderSections(record){const root=document.getElementById('sectionsRoot');root.innerHTML='';for(const s of this.relevance.sections(record)){const sc=this.coverage.section(record,s);const sec=document.createElement('section');sec.className='section-card';sec.id=s.id;sec.innerHTML=`<div class="section-head"><h2>${U.esc(s.title)}</h2><div class="section-meta"><span class="section-score" data-section-score="${s.id}">${sc.reviewed}/${sc.applicable} reviewed</span><button class="section-tool" data-knowledge="${s.id}">KNOWLEDGE</button><button class="section-tool" data-reset="${s.id}">RESET</button></div></div><div class="section-knowledge" data-knowledge-body="${s.id}"><ul>${s.knowledge.map(k=>`<li>${U.esc(k)}</li>`).join('')}</ul></div><div class="checklist"></div>`;const list=sec.querySelector('.checklist');for(const raw of s.items){const item=this.relevance.itemObject(raw);const applies=this.relevance.applies(raw,record);const row=document.createElement('article');row.className='checkpoint';row.dataset.id=item.id;row.dataset.section=s.id;row.dataset.hidden=applies?'false':'true';row.dataset.critical=item.critical?'1':'0';row.dataset.label=item.label.toLowerCase();const st=record.statuses[item.id]||'';const note=record.remarks[item.id]||'';const smart=(item.construction||item.processes||item.productClass||item.profiles);row.innerHTML=`<div class="cp-main"><div class="cp-num">${U.esc(item.id)}</div><div><div class="cp-title">${U.esc(item.label)} ${item.hint?`<button class="hint-btn" data-hint="${item.id}" title="Why this matters">i</button>`:''}</div><div class="cp-tags">${item.critical?'<span class="tag critical">Critical</span>':''}${smart?'<span class="tag smart">Smart</span>':''}</div>${item.hint?`<div class="cp-hint" data-hint-body="${item.id}">${U.esc(item.hint)}</div>`:''}</div></div><div class="cp-control"><div class="status-buttons">${STATUS_VALUES.map(v=>`<button class="status-btn ${st===v?'selected':''}" data-status="${v}">${v}</button>`).join('')}</div><button class="remark-toggle" data-remark-toggle="${item.id}">${note?'Edit note':'Add note'}</button><div class="cp-remark ${(note||st==='ACTION'||st==='PENDING')?'show':''}" data-remark-body="${item.id}"><textarea data-remark="${item.id}" placeholder="Decision / evidence / reference...">${U.esc(note)}</textarea></div></div>`;list.appendChild(row)}root.appendChild(sec)}}
}


/**
 * Builds a presentation-first, read-only print report from the active record.
 * Ownership: print-only composition and pagination groups. It never mutates the PPM record.
 * Access: AppController.preparePrint() rebuilds #printReport immediately before browser print/save-PDF.
 * Failure behavior: missing optional values render as em dashes; no buyer-specific acceptance rule is invented.
 */
class PrintReportBuilder{
  constructor(relevance,coverage,validation){this.relevance=relevance;this.coverage=coverage;this.validation=validation}
  profileLabel(record){return PROFILE_MAP[record.meta.profile]?.label||record.meta.product||'Universal / Custom'}
  header(record,page,total,title){const logo=document.querySelector('.brand-logo')?.src||'';return `<div class="pr-head"><div class="pr-brand"><img src="${logo}" alt="VESA"><div><h1>VESA Enterprise Inc. - PPM 360</h1><p>${U.esc(title)}</p></div></div><div class="pr-record"><b>${U.esc(record.meta.style||'STYLE NOT SET')}</b><br>${U.esc(record.id)}<br>Page ${page} of ${total}</div></div>`}
  footer(record,page,total){return `<div class="pr-footer"><span class="pr-powered">Powered by EGENVA</span><span>${U.esc(record.meta.factory||'Factory not set')} · ${U.esc(record.meta.buyer||'Buyer not set')}</span><span>Page ${page} of ${total}</span></div>`}
  status(st){const key=st==='OK'?'ok':st==='ACTION'?'action':st==='PENDING'?'pending':st==='N/A'?'na':'open';return `<span class="pr-status-pill pr-${key}">${U.esc(st||'OPEN')}</span>`}
  section(record,section){const items=section.items.filter(i=>this.relevance.applies(i,record));const rows=items.map(raw=>{const x=this.relevance.itemObject(raw),st=record.statuses[x.id]||'',note=record.remarks[x.id]||'';return `<tr><td class="pr-ref"><b>${U.esc(x.id)}</b></td><td>${U.esc(x.label)}${note?`<span class="pr-note">${U.esc(note)}</span>`:''}</td><td class="pr-risk">${x.critical?'Critical':'Normal'}</td><td class="pr-status">${this.status(st)}</td></tr>`}).join('');return `<div class="pr-section"><h2>${U.esc(section.title)} · ${items.length} applicable</h2><table class="pr-table"><thead><tr><th class="pr-ref">Ref</th><th>Checkpoint / confirmation</th><th class="pr-risk">Risk</th><th class="pr-status">Status</th></tr></thead><tbody>${rows}</tbody></table></div>`}
  meta(record){const fields=[['Factory',record.meta.factory],['Buyer / Customer',record.meta.buyer],['Style No.',record.meta.style],['PO / Order Ref.',record.meta.po],['Garment Profile',this.profileLabel(record)],['Product / Garment',record.meta.product],['Order Qty',record.meta.orderQty],['PPM Date',record.meta.ppmDate],['Delivery / Ex-Factory',record.meta.deliveryDate],['Destination / Market',record.meta.market],['Construction',record.meta.construction],['Product Group',record.meta.productClass],['Size Range',record.meta.sizeRange],['Fabric / Yarn',record.meta.fabricComposition],['Structure / Weave / Gauge',record.meta.fabricStructure],['GSM / Weight / Yarn Count',record.meta.fabricWeight],['Usable Width / Dia',record.meta.fabricWidth],['Colorways / Shade Ref.',record.meta.colorways],['Tech Pack Rev.',record.meta.techPackRev],['Measurement Rev.',record.meta.measurementRev],['BOM / Trim Card Rev.',record.meta.bomRev],['PP / Sealed Sample',record.meta.ppSampleRef],['Inspection / AQL Ref.',record.meta.aqlRef],['Wash / Finish',record.meta.washFinish],['PPM Location / Line',record.meta.locationLine]];return fields.map(([k,v])=>`<div class="pr-meta"><small>${U.esc(k)}</small><span>${U.esc(v||'—')}</span></div>`).join('')}
  pom(record){const rows=record.measurements.filter(x=>Object.values(x).some(Boolean)).map((x,i)=>`<tr><td>${i+1}</td><td>${U.esc(x.pom)}</td><td>${U.esc(x.spec)}</td><td>${U.esc(x.tol)}</td><td>${U.esc(x.method)}</td><td>${U.esc(x.risk)}</td><td>${U.esc(x.remark)}</td></tr>`).join('')||'<tr><td colspan="7">No POM rows recorded.</td></tr>';return `<div class="pr-section pr-pom"><h2>CRITICAL POM / MEASUREMENT CONTROL</h2><table class="pr-table"><thead><tr><th>#</th><th>POM</th><th>Spec</th><th>Tol.</th><th>Method</th><th>Risk</th><th>Remark</th></tr></thead><tbody>${rows}</tbody></table></div>`}
  actions(record){const rows=record.actions.map((a,i)=>`<tr><td>${i+1}</td><td>${U.esc(a.checkpointId||'')}</td><td>${U.esc(a.issue)}</td><td>${U.esc(a.action)}</td><td>${U.esc(a.owner)}</td><td>${U.esc(a.dueDate)}</td><td>${U.esc(a.status)}</td></tr>`).join('')||'<tr><td colspan="7">No tracked actions.</td></tr>';return `<div class="pr-section pr-actions"><h2>ACTION TRACKER</h2><table class="pr-table"><thead><tr><th>#</th><th>Ref</th><th>Issue</th><th>Action</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`}
  signatures(record){return SIGNATURE_ROLES.map(([id,label])=>{const s=record.signatures[id]||{};return `<div class="pr-sign"><h3>${U.esc(label)}</h3><div class="pr-sign-meta">${U.esc(s.name||'Name: —')} · ${U.esc(s.designation||'Designation: —')} · ${U.esc(s.date||'Date: —')} ${U.esc(s.time||'')}</div><div class="pr-sign-img">${s.image?`<img src="${s.image}" alt="Signature">`:'<span>Signature not recorded</span>'}</div></div>`}).join('')}
  evidence(record){return EVIDENCE_SLOTS.map(([id,label])=>{const src=record.photos.evidence?.[id];return `<div class="pr-evidence-item"><div class="img">${src?`<img src="${src}" alt="${U.esc(label)}">`:'<span>No photo</span>'}</div><b>${U.esc(label)}</b></div>`}).join('')}
  build(record){const c=this.coverage.compute(record),r=this.validation.readiness(record),sections=Object.fromEntries(SECTION_SCHEMA.map(s=>[s.id,s]));const pairs=[['order','technical'],['material','trims'],['cutting','sewing'],['process','quality'],['finishing','planning']];const total=9,pages=[];let page=1;
    const processes=PROCESS_OPTIONS.filter(([id])=>record.meta.processes.includes(id)).map(([,x])=>x);const participants=Object.entries(record.participants).filter(([,x])=>x.present).map(([role,x])=>`${role}${x.name?` - ${x.name}`:''}`);
    pages.push(`<section class="pr-page">${this.header(record,page,total,'Universal Apparel Pre-Production Meeting - Executive Record')}<div class="pr-metrics">${[['Profile',this.profileLabel(record)],['Applicable',c.applicable],['Coverage',c.coverage+'%'],['Closure',c.closure+'%'],['Critical blockers',c.criticalBlockers],['Release',record.release.decision||'Not decided']].map(([a,b])=>`<div class="pr-metric"><small>${U.esc(a)}</small><b>${U.esc(b)}</b></div>`).join('')}</div><div class="pr-cover-grid"><div class="pr-card"><h2>STYLE / ORDER / APPROVAL SNAPSHOT</h2><div class="pr-meta-grid">${this.meta(record)}</div><h2 style="margin-top:3mm">Processes</h2><div class="pr-processes">${processes.length?processes.map(x=>`<span class="pr-chip">${U.esc(x)}</span>`).join(''):'None selected'}</div><h2 style="margin-top:3mm">Meeting Participants</h2><div class="pr-participants">${participants.length?participants.map(x=>`• ${U.esc(x)}`).join('<br>'):'No participants marked present.'}</div>${record.meta.specialInstruction?`<h2 style="margin-top:3mm">Special Buyer / Meeting Instruction</h2><div class="pr-participants">${U.esc(record.meta.specialInstruction)}</div>`:''}</div><div class="pr-card"><h2>APPROVED STYLE / PP SAMPLE</h2><div class="pr-photo">${record.photos.style?`<img src="${record.photos.style}" alt="Style photo">`:'<span>No style photo attached</span>'}</div><h2 style="margin-top:3mm">Readiness Snapshot</h2><div class="pr-readiness">Review coverage: <b>${c.coverage}%</b><br>Closure: <b>${c.closure}%</b><br>Critical blockers: <b>${c.criticalBlockers}</b><br>Open actions: <b>${record.actions.filter(a=>a.status!=='Closed').length}</b><br>Header complete: <b>${r.headerComplete?'YES':'NO'}</b><br>Signatures recorded: <b>${r.sigs}</b></div></div></div>${this.footer(record,page,total)}</section>`);page++;
    for(const [a,b] of pairs){pages.push(`<section class="pr-page">${this.header(record,page,total,'PPM Control Detail')}<div class="pr-two">${this.section(record,sections[a])}${this.section(record,sections[b])}</div>${this.footer(record,page,total)}</section>`);page++}
    const rel=this.section(record,sections.release);pages.push(`<section class="pr-page">${this.header(record,page,total,'Bulk Readiness, Measurements & Actions')}<div class="pr-release"><div><div class="pr-card"><h2>Release Decision</h2><div class="pr-release-decision">${U.esc(record.release.decision||'NOT DECIDED')}</div><div class="pr-participants">${U.esc(record.release.notes||'No release condition note recorded.')}</div></div><div style="margin-top:2.5mm">${rel}</div></div><div>${this.pom(record)}<div style="margin-top:2.5mm">${this.actions(record)}</div></div></div>${this.footer(record,page,total)}</section>`);page++;
    pages.push(`<section class="pr-page">${this.header(record,page,total,'Photo / Evidence Record')}<div class="pr-card"><h2>PHOTO / EVIDENCE HUB</h2><div class="pr-evidence">${this.evidence(record)}</div></div>${this.footer(record,page,total)}</section>`);page++;
    pages.push(`<section class="pr-page">${this.header(record,page,total,'Authorization & Sign-off')}<div class="pr-card"><h2>AUTHORIZATION & SIGN-OFF</h2><div class="pr-signatures">${this.signatures(record)}</div></div>${this.footer(record,page,total)}</section>`);
    return pages.join('');
  }
}

/**
 * Produces a clearly labelled training record so users can learn the workflow without inventing buyer data.
 * Access: Record Tools -> Load T-shirt Demo. The demo is always created as a new draft and can be reset/deleted.
 */
class DemoDataBuilder{
  constructor(relevance){this.relevance=relevance}
  build(){const r=PpmRecordFactory.create();Object.assign(r.meta,{factory:'DEMO FACTORY - TRAINING ONLY',buyer:'DEMO BUYER',style:'TS-DEMO-001',po:'DEMO-PO',profile:'tshirt',product:'T-shirt',orderQty:'12000',ppmDate:U.today(),market:'Demo market',construction:'knit',productClass:'top',sizeRange:'S-XXL',fabricComposition:'100% Cotton Jersey',fabricStructure:'Single Jersey',fabricWeight:'180 GSM',fabricWidth:'Demo bulk width',colorways:'Black / White / Navy',techPackRev:'DEMO-R3',measurementRev:'DEMO-M2',bomRev:'DEMO-B2',ppSampleRef:'DEMO-PP-APPROVED',aqlRef:'Per buyer quality manual',washFinish:'Bio wash',locationLine:'Training room / Line 1',specialInstruction:'DEMO RECORD - training use only. Do not use these values for production.',processes:['print']});for(const x of this.relevance.applicableItems(r))r.statuses[x.id]='OK';r.statuses.M06='ACTION';r.remarks.M06='Demo: shade-band approval to be closed before cutting.';r.actions=[{id:'A-M06',checkpointId:'M06',issue:'Dye lot / shade lot / yarn lot and shade segregation method are approved.',action:'Approve shade band and segregate rolls by approved shade group.',owner:'Fabric QA',dueDate:U.today(),evidence:'Approved shade band / roll grouping record',status:'Open'}];r.measurements=(POM_PRESETS.tshirt||[]).map(p=>({pom:p,spec:'Buyer spec',tol:'Buyer tolerance',method:'Approved measuring method',risk:'',remark:''}));r.participants['Merchandising']={present:true,name:'Demo Merchandiser'};r.participants['Factory QA / QC']={present:true,name:'Demo QA Manager'};r.participants['Technical / Pattern']={present:true,name:'Demo Technician'};r.participants['Production / Sewing']={present:true,name:'Demo Production Manager'};r.release={decision:'HOLD',notes:'Demo HOLD until shade-band action is closed.'};return r}
}

/**
 * Central application orchestrator. All user mutations route through this owner to keep UI, validation and autosave coherent.
 * Dependencies are injected so persistence, rules, rendering and media handling remain independently replaceable.
 */
class AppController{
  constructor(repo,relevance,coverage,validation,renderer,images,actions){this.repo=repo;this.relevance=relevance;this.coverage=coverage;this.validation=validation;this.renderer=renderer;this.images=images;this.actions=actions;this.printBuilder=null;this.demoBuilder=null;this.record=null;this.signaturePads=new Map();this.saveDebounced=U.debounce(()=>this.save(),350);this.toastTimer=null;this.activeFilter='all'}
  async start(){await this.repo.init();const last=this.repo.getActiveId();this.record=await this.repo.get(last)||PpmRecordFactory.create();this.repo.setActiveId(this.record.id);this.ensureCompatibility();this.buildStatic();this.renderAll();this.bindGlobal();await this.save()}
  ensureCompatibility(){const fresh=PpmRecordFactory.create();this.record.meta={...fresh.meta,...(this.record.meta||{})};this.record.statuses={...fresh.statuses,...(this.record.statuses||{})};this.record.remarks={...fresh.remarks,...(this.record.remarks||{})};this.record.participants={...fresh.participants,...(this.record.participants||{})};this.record.measurements=this.record.measurements?.length?this.record.measurements:fresh.measurements;this.record.actions=this.record.actions||[];this.record.photos=this.record.photos||fresh.photos;this.record.photos.evidence=this.record.photos.evidence||{};this.record.signatures=this.record.signatures||{};this.record.release={...fresh.release,...(this.record.release||{})};this.record.ui={...fresh.ui,...(this.record.ui||{})}}
  buildStatic(){this.renderProfileOptions();this.renderProcesses();this.renderParticipants();this.renderEvidence();this.renderSignatures()}
  renderAll(){this.renderer.renderSections(this.record);this.renderer.renderNav(this.record);this.populateBindings();this.renderMeasurements();this.renderActions();this.renderPhoto();this.restoreSignatures();this.applyUiMode();this.updateDashboard();this.updateProfileScope();this.updateLock();this.bindDynamic()}
  populateBindings(){document.querySelectorAll('[data-bind]').forEach(el=>{const [root,key]=el.dataset.bind.split('.');const obj=this.record[root];if(obj&&key in obj)el.value=obj[key]??''})}
  renderProfileOptions(){const sel=document.getElementById('garmentProfileSelect');if(sel)sel.innerHTML=GARMENT_PROFILES.map(p=>`<option value="${U.esc(p.id)}">${U.esc(p.label)}</option>`).join('')}
  renderProcesses(){const box=document.getElementById('processList');box.innerHTML=PROCESS_OPTIONS.map(([id,label])=>`<button class="process-chip ${this.record?.meta?.processes?.includes(id)?'active':''}" data-process="${id}">${label}</button>`).join('');const pp=document.getElementById('processPrintSummary');if(pp){const selected=PROCESS_OPTIONS.filter(([id])=>this.record?.meta?.processes?.includes(id)).map(([,label])=>label);pp.textContent=selected.length?selected.join(' · '):'None selected'}}
  renderParticipants(){const box=document.getElementById('participantGrid');box.innerHTML=PARTICIPANT_ROLES.map(r=>`<div class="participant"><input type="checkbox" data-participant-present="${U.esc(r)}"><input type="text" data-participant-name="${U.esc(r)}" placeholder="${U.esc(r)} name"><small>${U.esc(r)}</small></div>`).join('')}
  renderEvidence(){const g=document.getElementById('evidenceGrid');g.innerHTML=EVIDENCE_SLOTS.map(([id,label])=>`<div class="evidence-slot"><div class="evidence-preview" data-evidence-preview="${id}">${this.record?.photos?.evidence?.[id]?`<img src="${this.record.photos.evidence[id]}" alt="${U.esc(label)}">`:'No photo'}</div><div class="evidence-foot"><b>${U.esc(label)}</b><button data-evidence-add="${id}">ADD / REPLACE</button><button data-evidence-remove="${id}">REMOVE</button><input type="file" accept="image/*" data-evidence-input="${id}"></div></div>`).join('')}
  renderSignatures(){const g=document.getElementById('signatureGrid');g.innerHTML=SIGNATURE_ROLES.map(([id,label])=>`<div class="signature-card" data-signature-card="${id}"><h3>${U.esc(label)}</h3><div class="sig-fields"><input data-sig-name="${id}" placeholder="Name"><input data-sig-designation="${id}" placeholder="Designation"></div><div class="sig-pad-wrap"><canvas class="sig-pad" data-sig-canvas="${id}"></canvas><div class="sig-actions"><button data-sig-clear="${id}">CLEAR</button></div></div><div class="sig-date"><input type="date" data-sig-date="${id}"><input type="time" data-sig-time="${id}"></div></div>`).join('')}
  bindGlobal(){
    document.addEventListener('input',e=>{if(e.target.matches('[data-bind]'))this.setBinding(e.target);if(e.target.matches('[data-participant-name]')){this.record.participants[e.target.dataset.participantName].name=e.target.value;this.mutate()}if(e.target.matches('[data-remark]')){this.record.remarks[e.target.dataset.remark]=e.target.value;this.mutate(false)}});
    document.addEventListener('change',e=>{if(e.target.matches('[data-bind]'))this.setBinding(e.target);if(e.target.matches('[data-participant-present]')){this.record.participants[e.target.dataset.participantPresent].present=e.target.checked;this.mutate()}if(e.target.matches('[data-measure]'))this.updateMeasurement(e.target);if(e.target.matches('[data-action-field]'))this.updateAction(e.target);if(e.target.matches('[data-sig-name],[data-sig-designation],[data-sig-date],[data-sig-time]'))this.updateSignatureMeta(e.target)});
    document.addEventListener('click',e=>this.handleClick(e));
    document.getElementById('stylePhotoInput').addEventListener('change',e=>this.handleStylePhoto(e));
    document.getElementById('checkpointSearch').addEventListener('input',e=>{this.record.ui.search=e.target.value;this.applyFilter();this.saveDebounced()});
    document.getElementById('importInput').addEventListener('change',e=>this.importJson(e));
    window.addEventListener('beforeprint',()=>this.preparePrint());window.addEventListener('pagehide',()=>this.save());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')this.save()});
  }
  bindDynamic(){this.restoreParticipants();this.restoreProcesses();this.initSignaturePads();this.bindEvidenceInputs();this.updateNavActive()}
  setBinding(el){const [root,key]=el.dataset.bind.split('.');if(this.record[root]&&key in this.record[root]){this.record[root][key]=el.value;if(root==='meta'&&key==='profile')this.applyProfileDefaults(el.value);document.querySelectorAll(`[data-bind="${root}.${key}"]`).forEach(peer=>{if(peer!==el&&peer.value!==this.record[root][key])peer.value=this.record[root][key]??''});if(root==='meta'&&['profile','construction','productClass'].includes(key)){this.renderer.renderSections(this.record);this.renderer.renderNav(this.record);this.populateBindings();this.bindDynamic();this.applyFilter()}this.updateProfileScope();this.mutate()}}
  applyProfileDefaults(profileId){const p=PROFILE_MAP[profileId];if(!p)return;if(p.product)this.record.meta.product=p.product;if(p.construction)this.record.meta.construction=p.construction;if(p.productClass)this.record.meta.productClass=p.productClass;this.toast(profileId?`${p.label} smart scope activated.`:'Universal core scope selected.')}
  updateProfileScope(){const el=document.getElementById('profileScopeIntel');if(!el)return;const p=PROFILE_MAP[this.record.meta.profile]||PROFILE_MAP[''];const c=this.coverage.compute(this.record),profileItems=this.relevance.applicableItems(this.record).filter(x=>x.profiles?.includes(this.record.meta.profile)).length;el.innerHTML=`<div><strong>${U.esc(p.label||'Universal / Custom')} smart scope</strong><span>${U.esc(p.summary||'Universal apparel controls remain active.')} Construction and process selections add their own relevant checks.</span></div><div class="scope-count">${c.applicable} applicable · ${profileItems} profile-specific</div>`}
  applyPomPreset(){const preset=POM_PRESETS[this.record.meta.profile];if(!preset?.length){this.toast('No POM preset for this profile. Add style-relevant POMs manually.');return}this.openConfirm('Load POM preset?',`This replaces the current POM rows with ${preset.length} common point names. Specs and tolerances remain blank/controlled by buyer documents.`,()=>{this.record.measurements=preset.map(p=>({pom:p,spec:'',tol:'',method:'',risk:'',remark:''}));this.renderMeasurements();this.mutate();})}
  mutate(rerender=true){if(this.record.locked)return;this.updateDashboard();if(rerender)this.updateSectionScores();this.setSaveState('Saving…');this.saveDebounced()}
  async save(){try{await this.repo.save(this.record);this.repo.setActiveId(this.record.id);this.setSaveState(`Saved ${new Date().toTimeString().slice(0,5)}`)}catch(e){this.setSaveState('Save failed');this.toast('Autosave could not write to browser storage. Export JSON now to protect the record.')}}
  setSaveState(t){document.getElementById('saveState').textContent=t}
  handleClick(e){const btn=e.target.closest('button');if(!btn)return;
    if(btn.dataset.status){this.setStatus(btn.closest('.checkpoint').dataset.id,btn.dataset.status);return}
    if(btn.dataset.hint){document.querySelector(`[data-hint-body="${btn.dataset.hint}"]`)?.classList.toggle('show');return}
    if(btn.dataset.remarkToggle){document.querySelector(`[data-remark-body="${btn.dataset.remarkToggle}"]`)?.classList.toggle('show');return}
    if(btn.dataset.knowledge){document.querySelector(`[data-knowledge-body="${btn.dataset.knowledge}"]`)?.classList.toggle('show');return}
    if(btn.dataset.reset){this.confirmResetSection(btn.dataset.reset);return}
    if(btn.dataset.resetSpecial){this.confirmResetSpecial(btn.dataset.resetSpecial);return}
    if(btn.dataset.process){this.toggleProcess(btn.dataset.process);return}
    if(btn.dataset.target){document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(btn.dataset.release){this.setRelease(btn.dataset.release);return}
    if(btn.dataset.evidenceAdd){btn.parentElement.querySelector('input[type=file]').click();return}
    if(btn.dataset.evidenceRemove){this.record.photos.evidence[btn.dataset.evidenceRemove]='';this.renderEvidence();this.bindEvidenceInputs();this.mutate();return}
    if(btn.dataset.sigClear){this.signaturePads.get(btn.dataset.sigClear)?.clear();return}
    if(btn.dataset.mode){document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('active',x===btn));this.record.ui.mode=btn.dataset.mode;this.applyUiMode();this.mutate();return}
    if(btn.dataset.filter){document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===btn));this.activeFilter=btn.dataset.filter;this.record.ui.filter=this.activeFilter;this.applyFilter();this.saveDebounced();return}
    switch(btn.id){case'addStylePhoto':case'mobileAddStylePhoto':document.getElementById('stylePhotoInput').click();break;case'removeStylePhoto':this.record.photos.style='';this.renderPhoto();this.mutate();break;case'addMeasurementRow':this.record.measurements.push(PpmRecordFactory.measurement());this.renderMeasurements();this.mutate();break;case'draftsBtn':this.openDrafts();break;case'knowledgeBtn':this.openKnowledge();break;case'moreBtn':this.openTools();break;case'printBtn':this.preparePrint();window.print();break;case'pomPresetBtn':this.applyPomPreset();break;case'resetAllBtn':this.confirmResetAll();break;case'finalizeBtn':this.toggleFinalize();break;case'jumpUnreviewed':this.jumpUnreviewed();break;case'jumpActions':document.getElementById('actions-section').scrollIntoView({behavior:'smooth'});break;case'modalClose':this.closeModal();break;}}
  setStatus(id,status){if(this.record.locked)return;const item=this.relevance.applicableItems(this.record).find(x=>x.id===id)||SECTION_SCHEMA.flatMap(s=>s.items.map(i=>({...this.relevance.itemObject(i),section:s}))).find(x=>x.id===id);this.record.statuses[id]=status;this.actions.sync(this.record,id,item?.label||id,status);const row=document.querySelector(`.checkpoint[data-id="${id}"]`);row?.querySelectorAll('.status-btn').forEach(b=>b.classList.toggle('selected',b.dataset.status===status));const note=row?.querySelector('.cp-remark');if(['ACTION','PENDING'].includes(status)){note?.classList.add('show');setTimeout(()=>note?.querySelector('textarea')?.focus(),50)}else if(!this.record.remarks[id])note?.classList.remove('show');this.renderActions();this.updateDashboard();this.updateSectionScores();this.mutate(false);if(this.record.ui.mode==='fast'&&['OK','N/A'].includes(status))this.autoAdvance(row)}
  autoAdvance(row){const rows=[...document.querySelectorAll('.checkpoint')].filter(r=>r.dataset.hidden!=='true'&&getComputedStyle(r).display!=='none');const idx=rows.indexOf(row);const next=rows.slice(idx+1).find(r=>!this.record.statuses[r.dataset.id]);if(next)setTimeout(()=>next.scrollIntoView({behavior:'smooth',block:'center'}),120)}
  toggleProcess(id){if(this.record.locked)return;const a=this.record.meta.processes;const ix=a.indexOf(id);ix>=0?a.splice(ix,1):a.push(id);this.restoreProcesses();this.renderer.renderSections(this.record);this.renderer.renderNav(this.record);this.bindDynamic();this.updateDashboard();this.applyFilter();this.mutate(false)}
  applyUiMode(){document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===(this.record.ui.mode||'fast')));this.activeFilter=this.record.ui.filter||'all';document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===this.activeFilter));document.getElementById('checkpointSearch').value=this.record.ui.search||'';this.applyFilter()}
  applyFilter(){const q=(this.record.ui.search||'').trim().toLowerCase(),filter=this.activeFilter||'all';document.querySelectorAll('.checkpoint').forEach(row=>{const applies=row.dataset.hidden!=='true',id=row.dataset.id,st=this.record.statuses[id],text=row.dataset.label;let show=applies&&(!q||text.includes(q)||id.toLowerCase().includes(q));if(filter==='unreviewed')show=show&&!st;if(filter==='action')show=show&&(st==='ACTION'||st==='PENDING');if(filter==='critical')show=show&&row.dataset.critical==='1';row.style.display=show?'grid':'none'})}
  updateDashboard(){const c=this.coverage.compute(this.record),r=this.validation.readiness(this.record);document.getElementById('metricApplicable').textContent=c.applicable;document.getElementById('metricClosed').textContent=c.closed;document.getElementById('metricPending').textContent=c.pending;document.getElementById('metricActions').textContent=c.actions;document.getElementById('metricBlockers').textContent=c.criticalBlockers;document.getElementById('coverageRing').style.setProperty('--p',`${c.coverage}%`);document.getElementById('coverageRingText').textContent=`${c.coverage}%`;document.getElementById('coverageLabel').textContent=`${c.coverage}%`;document.getElementById('closureLabel').textContent=`${c.closure}%`;document.getElementById('masterCount').textContent=c.master;document.getElementById('openActionCount').textContent=this.record.actions.filter(a=>a.status!=='Closed').length;document.getElementById('releaseLabel').textContent=this.record.release.decision||'Not decided';document.getElementById('recordIdLabel').textContent=this.record.id.slice(0,18);document.getElementById('scopeTitle').textContent=(PROFILE_MAP[this.record.meta.profile]?.label||'Universal PPM Scope');document.getElementById('scopeSub').textContent=`${c.applicable} applicable of ${c.master} master checks · ${c.closed} closed`;this.updateProfileScope();document.getElementById('actionSectionScore').textContent=`${this.record.actions.filter(a=>a.status!=='Closed').length} open`;this.updateReadiness(r);this.updatePrintSummary()}
  updateSectionScores(){SECTION_SCHEMA.forEach(s=>{const sc=this.coverage.section(this.record,s);const el=document.querySelector(`[data-section-score="${s.id}"]`);if(el)el.textContent=`${sc.reviewed}/${sc.applicable} reviewed`});this.renderer.renderNav(this.record)}
  updateReadiness(r){const list=[['100% review coverage',r.coverage100],['All critical blockers closed',r.noCritical],['Required header fields complete',r.headerComplete],['Open actions have owner + date + action',r.actionsControlled],['At least 2 authorized signatures',r.hasSignoff]];document.getElementById('readinessList').innerHTML=list.map(([t,ok])=>`<li><span>${t}</span><b class="${ok?'pass':'fail'}">${ok?'READY':'OPEN'}</b></li>`).join('');const score=document.getElementById('readinessScore');score.textContent=r.go?'GO ready':r.conditional?'Conditional ready':'Not ready';document.querySelectorAll('.release-btn').forEach(b=>b.classList.toggle('selected',b.dataset.release===this.record.release.decision))}
  setRelease(v){if(this.record.locked)return;const r=this.validation.readiness(this.record);if(v==='GO'&&!r.go){this.openValidation('GO',r);return}if(v==='CONDITIONAL GO'&&!r.conditional){this.openValidation('CONDITIONAL GO',r);return}this.record.release.decision=v;this.mutate();this.updateDashboard();this.toast(`${v} recorded.`)}
  openValidation(target,r){const issues=[];if(target==='CONDITIONAL GO'&&!this.record.release.notes.trim())issues.push('Written release conditions are required.');if(target==='CONDITIONAL GO'&&r.c.pending)issues.push('PENDING decisions must be resolved.');if(!r.coverage100)issues.push('Review coverage is not 100%.');if(target==='GO'&&!r.closure100)issues.push('Open ACTION/PENDING items remain.');if(!r.noCritical)issues.push(`${r.c.criticalBlockers} critical blocker(s) remain.`);if(!r.headerComplete)issues.push(`Missing header: ${r.missing.join(', ')}.`);if(!r.actionsControlled)issues.push('Open actions are missing owner, due date or action.');if(!r.hasSignoff)issues.push('At least two authorized signatures with names and dates are required.');this.openModal(`${target} not ready`,`<p style="margin-top:0">Close these items before release:</p><ul>${issues.map(x=>`<li>${U.esc(x)}</li>`).join('')}</ul><p style="color:#667483;font-size:11px">HOLD can be recorded at any time. Buyer/authorized written conditions govern any Conditional GO.</p>`)}
  renderMeasurements(){const b=document.getElementById('measurementBody');b.innerHTML=this.record.measurements.map((m,i)=>`<tr><td>${i+1}</td>${['pom','spec','tol','method'].map(k=>`<td><input data-measure="${i}.${k}" value="${U.esc(m[k])}"></td>`).join('')}<td><select data-measure="${i}.risk"><option value=""></option>${['Critical','Major','Minor'].map(x=>`<option ${m.risk===x?'selected':''}>${x}</option>`).join('')}</select></td><td><input data-measure="${i}.remark" value="${U.esc(m.remark)}"></td><td><button class="row-del" data-measure-delete="${i}">×</button></td></tr>`).join('');b.querySelectorAll('[data-measure-delete]').forEach(btn=>btn.onclick=()=>{if(this.record.locked)return;this.record.measurements.splice(Number(btn.dataset.measureDelete),1);if(!this.record.measurements.length)this.record.measurements.push(PpmRecordFactory.measurement());this.renderMeasurements();this.mutate()})}
  updateMeasurement(el){const [i,k]=el.dataset.measure.split('.');this.record.measurements[Number(i)][k]=el.value;this.mutate(false)}
  renderActions(){const body=document.getElementById('actionBody'),mobile=document.getElementById('actionMobile');if(!this.record.actions.length){body.innerHTML='<tr><td colspan="7">No checkpoint actions yet. Select ACTION on a checkpoint to create one automatically.</td></tr>';mobile.innerHTML='<div class="action-mobile">No checkpoint actions yet.</div>';return}body.innerHTML=this.record.actions.map((a,i)=>`<tr><td>${i+1}</td><td>${U.esc(a.issue)}</td><td><input data-action-field="${i}.action" value="${U.esc(a.action)}"></td><td><input data-action-field="${i}.owner" value="${U.esc(a.owner)}"></td><td><input type="date" data-action-field="${i}.dueDate" value="${U.esc(a.dueDate)}"></td><td><input data-action-field="${i}.evidence" value="${U.esc(a.evidence)}"></td><td><select data-action-field="${i}.status">${['Open','In Progress','Closed'].map(x=>`<option ${a.status===x?'selected':''}>${x}</option>`).join('')}</select></td></tr>`).join('');mobile.innerHTML=this.record.actions.map((a,i)=>`<div class="action-mobile"><b>${i+1}. ${U.esc(a.issue)}</b><textarea data-action-field="${i}.action" placeholder="Decision / action">${U.esc(a.action)}</textarea><input data-action-field="${i}.owner" value="${U.esc(a.owner)}" placeholder="Owner"><input type="date" data-action-field="${i}.dueDate" value="${U.esc(a.dueDate)}"><input data-action-field="${i}.evidence" value="${U.esc(a.evidence)}" placeholder="Evidence / ref"><select data-action-field="${i}.status">${['Open','In Progress','Closed'].map(x=>`<option ${a.status===x?'selected':''}>${x}</option>`).join('')}</select></div>`).join('')}
  updateAction(el){const [i,k]=el.dataset.actionField.split('.');const a=this.record.actions[Number(i)];if(!a)return;a[k]=el.value;if(k==='status'&&el.value==='Closed'&&a.checkpointId&&this.record.statuses[a.checkpointId]==='ACTION'){/* Preserve ACTION status for traceability; closure metric reads linked action. */}this.mutate(false);this.updateDashboard()}
  renderPhoto(){for(const id of ['stylePhotoBox','mobileStylePhotoBox']){const b=document.getElementById(id);if(!b)continue;b.innerHTML=this.record.photos.style?`<img src="${this.record.photos.style}" alt="Style photo">`:'<div class="photo-placeholder"><b>Add approved style / PP sample</b><span>Tap below to open camera or gallery</span></div>'}}
  async handleStylePhoto(e){const f=e.target.files?.[0];if(!f)return;try{this.record.photos.style=await this.images.compress(f);this.renderPhoto();this.mutate();this.toast('Style photo added.')}catch(err){this.toast(err.message)}finally{e.target.value=''}}
  bindEvidenceInputs(){document.querySelectorAll('[data-evidence-input]').forEach(inp=>inp.onchange=async e=>{const id=inp.dataset.evidenceInput,f=e.target.files?.[0];if(!f)return;try{this.record.photos.evidence[id]=await this.images.compress(f,1200,.72);this.renderEvidence();this.bindEvidenceInputs();this.mutate();this.toast('Evidence photo added.')}catch(err){this.toast(err.message)}finally{e.target.value=''}})}
  restoreProcesses(){document.querySelectorAll('[data-process]').forEach(b=>b.classList.toggle('active',this.record.meta.processes.includes(b.dataset.process)))}
  restoreParticipants(){PARTICIPANT_ROLES.forEach(r=>{const p=this.record.participants[r]||{present:false,name:''};const c=document.querySelector(`[data-participant-present="${CSS.escape(r)}"]`),n=document.querySelector(`[data-participant-name="${CSS.escape(r)}"]`);if(c)c.checked=p.present;if(n)n.value=p.name})}
  initSignaturePads(){for(const pad of this.signaturePads.values())pad.dispose();this.signaturePads.clear();document.querySelectorAll('[data-sig-canvas]').forEach(c=>{const id=c.dataset.sigCanvas,pad=new SignaturePad(c,img=>{if(this.record.locked)return;this.record.signatures[id]=this.record.signatures[id]||{};this.record.signatures[id].image=img;if(img){this.record.signatures[id].date=this.record.signatures[id].date||U.today();this.record.signatures[id].time=this.record.signatures[id].time||U.nowTime();this.restoreSignatureMeta(id)}this.mutate()});this.signaturePads.set(id,pad);const img=this.record.signatures[id]?.image;if(img)setTimeout(()=>pad.restore(img),60)});this.restoreSignatureMeta()}
  restoreSignatures(){setTimeout(()=>{for(const [id,pad] of this.signaturePads){const img=this.record.signatures[id]?.image;if(img)pad.restore(img)}},80)}
  restoreSignatureMeta(only){SIGNATURE_ROLES.filter(([id])=>!only||id===only).forEach(([id])=>{const s=this.record.signatures[id]||{};const n=document.querySelector(`[data-sig-name="${id}"]`),d=document.querySelector(`[data-sig-designation="${id}"]`),da=document.querySelector(`[data-sig-date="${id}"]`),t=document.querySelector(`[data-sig-time="${id}"]`);if(n)n.value=s.name||'';if(d)d.value=s.designation||'';if(da)da.value=s.date||'';if(t)t.value=s.time||''})}
  updateSignatureMeta(el){const attr=[...el.attributes].find(a=>a.name.startsWith('data-sig-')&&a.name!=='data-sig-canvas');if(!attr)return;const id=attr.value,key=attr.name.replace('data-sig-','');this.record.signatures[id]=this.record.signatures[id]||{};this.record.signatures[id][key]=el.value;this.mutate(false)}
  confirmResetSection(sectionId){const sec=this.relevance.sections(this.record).find(s=>s.id===sectionId);this.openConfirm(`Reset ${sec.title}?`,'Only statuses and notes in this section will be cleared.',()=>{sec.items.forEach(i=>{this.record.statuses[i[0]]='';this.record.remarks[i[0]]=''});this.record.actions=this.record.actions.filter(a=>!sec.items.some(i=>i[0]===a.checkpointId));this.renderAll();this.mutate();})}
  confirmResetSpecial(which){const map={measurements:()=>{this.record.measurements=Array.from({length:6},()=>PpmRecordFactory.measurement());},actions:()=>{this.record.actions=[];for(const x of this.relevance.applicableItems(this.record))if(this.record.statuses[x.id]==='ACTION')this.actions.sync(this.record,x.id,x.label,'ACTION')},evidence:()=>this.record.photos.evidence={},release:()=>this.record.release={decision:'',notes:''},signatures:()=>this.record.signatures={}};this.openConfirm(`Reset ${which}?`,'This clears only this area.',()=>{map[which]();this.renderAll();this.mutate()})}
  confirmResetAll(){this.openConfirm('Reset the entire PPM?','All filled values, photos, signatures, statuses and actions in this active record will be cleared.',()=>{const id=this.record.id,createdAt=this.record.createdAt;this.record=PpmRecordFactory.create();this.record.id=id;this.record.createdAt=createdAt;this.renderAll();this.mutate()})}
  toggleFinalize(){if(this.record.locked){this.openConfirm('Unlock this finalized PPM?','Use only for an authorized correction. The record will return to editable Draft status.',()=>{this.record.locked=false;this.updateLock();this.mutate()});return}const r=this.validation.readiness(this.record);if(!this.record.release.decision){this.openModal('Release decision required','<p>Select GO, CONDITIONAL GO or HOLD before finalizing.</p>');return}if(this.record.release.decision==='GO'&&!r.go){this.openValidation('GO',r);return}if(this.record.release.decision==='CONDITIONAL GO'&&!r.conditional){this.openValidation('CONDITIONAL GO',r);return}this.openConfirm('Finalize this PPM?','The form will become read-only until explicitly unlocked. Print / PDF remains available.',()=>{this.record.locked=true;this.updateLock();this.save();this.toast('PPM finalized.')})}
  updateLock(){document.body.classList.toggle('locked',!!this.record.locked);document.getElementById('finalizeBtn').textContent=this.record.locked?'UNLOCK DRAFT':'FINALIZE PPM';document.getElementById('lockStatus').textContent=this.record.locked?'Finalized':'Draft'}
  jumpUnreviewed(){const row=[...document.querySelectorAll('.checkpoint')].find(r=>r.dataset.hidden!=='true'&&!this.record.statuses[r.dataset.id]&&getComputedStyle(r).display!=='none');if(row)row.scrollIntoView({behavior:'smooth',block:'center'});else this.toast('All currently visible applicable checkpoints are reviewed.')}
  updateNavActive(){this.navObserver?.disconnect();const sections=[...document.querySelectorAll('.section-card')];const observer=new IntersectionObserver(entries=>{const top=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!top)return;document.querySelectorAll('.nav-chip').forEach(b=>b.classList.toggle('active',b.dataset.target===top.target.id))},{rootMargin:'-25% 0px -65% 0px'});this.navObserver=observer;sections.forEach(s=>observer.observe(s))}
  preparePrint(){if(!this.printBuilder)this.printBuilder=new PrintReportBuilder(this.relevance,this.coverage,this.validation);const root=document.getElementById('printReport');root.innerHTML=this.printBuilder.build(this.record);root.setAttribute('aria-hidden','false')}
  updatePrintSummary(){this.preparePrint()}
  async openDrafts(){const rows=await this.repo.list();this.openModal('Saved PPM Drafts',rows.length?rows.map(r=>`<div class="draft-item"><div><strong>${U.esc(r.meta?.style||'Untitled style')} · ${U.esc(r.meta?.buyer||'No buyer')}</strong><small>${U.esc(r.meta?.factory||'No factory')} · Updated ${new Date(r.updatedAt).toLocaleString()} · ${r.locked?'Finalized':'Draft'}</small></div><div class="draft-actions"><button data-open-draft="${r.id}">OPEN</button><button class="delete" data-delete-draft="${r.id}">DELETE</button></div></div>`).join(''):'<p>No saved records yet.</p>');document.querySelectorAll('[data-open-draft]').forEach(b=>b.onclick=async()=>{this.record=await this.repo.get(b.dataset.openDraft);this.repo.setActiveId(this.record.id);this.ensureCompatibility();this.buildStatic();this.renderAll();this.closeModal()});document.querySelectorAll('[data-delete-draft]').forEach(b=>b.onclick=async()=>{if(b.dataset.deleteDraft===this.record.id){this.toast('Open record cannot be deleted.');return}await this.repo.remove(b.dataset.deleteDraft);this.openDrafts()})}
  openTools(){this.openModal('Record Tools',`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="soft-btn" id="newRecordTool">NEW PPM</button><button class="soft-btn" id="duplicateTool">DUPLICATE CURRENT</button><button class="soft-btn" id="exportTool">EXPORT JSON</button><button class="soft-btn" id="importTool">IMPORT JSON</button><button class="soft-btn" id="printTool2">PRINT / PDF</button><button class="soft-btn" id="demoTool">LOAD T-SHIRT DEMO</button><button class="danger-btn" id="resetTool">RESET ACTIVE</button></div><p style="font-size:10px;color:#6c7c88;margin-bottom:0">Autosave is local to this browser/device. JSON export is the portable backup between devices.</p>`);document.getElementById('newRecordTool').onclick=()=>this.newRecord();document.getElementById('duplicateTool').onclick=()=>this.duplicateRecord();document.getElementById('exportTool').onclick=()=>this.exportJson();document.getElementById('importTool').onclick=()=>document.getElementById('importInput').click();document.getElementById('printTool2').onclick=()=>{this.closeModal();this.preparePrint();window.print()};document.getElementById('demoTool').onclick=()=>this.loadDemo();document.getElementById('resetTool').onclick=()=>{this.closeModal();this.confirmResetAll()}}
  openKnowledge(){this.openModal('PPM 360 Knowledge',`<div class="knowledge-grid"><div class="knowledge-box"><h3>Coverage vs Closure</h3><p><b>Coverage</b> = applicable checkpoints reviewed. <b>Closure</b> = OK/N/A plus ACTION items whose tracker action is closed. A meeting can reach 100% coverage and still have open actions.</p></div><div class="knowledge-box"><h3>Universal + Smart Scope</h3><p>Universal controls always remain. Garment Profile adds style-specific checks; Construction adds knit/woven/denim/sweater checks; selected processes add print, embroidery, wash, bonding, seam-seal and other process controls.</p></div><div class="knowledge-box"><h3>Status Meaning</h3><ul><li>OK: verified and acceptable</li><li>ACTION: deviation/risk needs tracked correction</li><li>PENDING: evidence/decision not yet available</li><li>N/A: genuinely not applicable to this style</li></ul></div><div class="knowledge-box"><h3>Release Logic</h3><p>GO is blocked until review/closure is complete. Conditional GO requires controlled open actions. Buyer/brand requirements and written approvals always govern.</p></div><div class="knowledge-box"><h3>Material Risk</h3><p>Dimensional stability, shade/lot, usable width, defects and material behavior should feed pattern, cutting, sewing and finishing decisions.</p></div><div class="knowledge-box"><h3>Evidence & Test Logic</h3><p>Use photos for approved sample, shade, trims, construction, decoration, packing and defects. Product/material-specific tests should come from buyer/specification requirements; the app does not invent a generic pass limit.</p></div><div class="knowledge-box"><h3>Why the Scope Changes</h3><p>A T-shirt activates T-shirt + knit controls; a woven shirt activates shirt + woven controls. Optional processes only appear when selected. Universal order, technical, quality, packing, planning and release gates remain common to all apparel.</p></div></div>`)}
  loadDemo(){this.openConfirm('Load T-shirt demo record?','A new training-only PPM will be created. Your current record is saved first.',async()=>{await this.save();if(!this.demoBuilder)this.demoBuilder=new DemoDataBuilder(this.relevance);this.record=this.demoBuilder.build();this.repo.setActiveId(this.record.id);this.buildStatic();this.renderAll();this.closeModal();await this.save();this.toast('Training demo loaded. Use New PPM or Reset when finished.')})}
  async newRecord(){await this.save();this.record=PpmRecordFactory.create();this.repo.setActiveId(this.record.id);this.buildStatic();this.renderAll();this.closeModal();await this.save();this.toast('New PPM created.')}
  async duplicateRecord(){const copy=U.clone(this.record);copy.id=U.uid();copy.createdAt=new Date().toISOString();copy.updatedAt=copy.createdAt;copy.locked=false;copy.release={decision:'',notes:''};copy.signatures={};this.record=copy;this.repo.setActiveId(copy.id);this.buildStatic();this.renderAll();this.closeModal();await this.save();this.toast('Current PPM duplicated as a new draft.')}
  exportJson(){const blob=new Blob([JSON.stringify(this.record,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`VESA_PPM_${(this.record.meta.style||'STYLE').replace(/[^a-z0-9_-]+/gi,'_')}_${this.record.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);this.toast('Portable JSON backup exported.')}
  async importJson(e){const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data.id||!data.meta||!data.statuses)throw new Error('Not a valid VESA PPM record.');this.record=data;this.ensureCompatibility();this.repo.setActiveId(this.record.id);this.buildStatic();this.renderAll();await this.save();this.toast('PPM record imported.')}catch(err){this.toast(err.message)}finally{e.target.value='';this.closeModal()}}
  openConfirm(title,message,onYes){this.openModal(title,`<p>${U.esc(message)}</p><div style="display:flex;justify-content:flex-end;gap:8px"><button class="soft-btn" id="confirmNo">CANCEL</button><button class="danger-btn" id="confirmYes">CONFIRM</button></div>`);document.getElementById('confirmNo').onclick=()=>this.closeModal();document.getElementById('confirmYes').onclick=()=>{this.closeModal();onYes()}}
  openModal(title,html){document.getElementById('modalTitle').textContent=title;document.getElementById('modalBody').innerHTML=html;document.getElementById('modalBackdrop').classList.add('show')}
  closeModal(){document.getElementById('modalBackdrop').classList.remove('show')}
  toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
}

