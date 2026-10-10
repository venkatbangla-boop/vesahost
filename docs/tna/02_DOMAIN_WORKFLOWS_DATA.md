# 02 — Apparel Domain Workflows, Universal Templates & Data Contracts

**Purpose:** one canonical garment-order vocabulary/data model. Scheduling, UI, import, report and cloud adapters all use these contracts. Avoid coupling apparel business logic to DOM, storage or specific vendors.

## 1. Scope axes — a UNIVERSAL TNA is configurable, not one giant checklist

Select independently, then generate an applicable task graph:

1. **Product construction:** knit, woven, denim, fully fashioned sweater, specialized/other.
2. **Product silhouette:** T-shirt, polo, hoodie, sweatshirt, jogger, woven shirt, trouser, short, jean, dress, skirt, jacket/outerwear, activewear top/bottom, kidswear, underwear/lingerie, uniform/workwear, custom.
3. **Fabric supply route:** local ready fabric / local manufactured / imported finished fabric / imported greige or yarn / garment-dyed / customer-supplied. Multiple fabric types allowed.
4. **Material provenance:** nominated or non-nominated fabric/trims suppliers, local/foreign, supplier lead times and commercial gates.
5. **Decoration / process options:** screen/digital print, allover print, embroidery, applique, heat transfer, sublimation, enzyme/stone/garment wash, garment dye, laser/denim effects, bonding, seam-seal, coating, fusing, quilting, padding, finishing, specialist test.
6. **Market and compliance:** destination(s), buyer manual revision, applicable standards and evidence supplied by user. Kids/product-safety requirements are never guessed by geography.
7. **Factory model:** in-house, subcontracted, split production, multiple factories/lines, shared capacity.
8. **Delivery model:** single or multiple POs, ex-factory, FOB/other Incoterms, vessel/air, multiple shipment lots, required inspection lead time.
9. **Approval authority:** buyer, nominated local office, factory, independent lab or multiple sequential reviewers; verified allowed sign-off chain.
10. **Calendar basis:** working or calendar days; specific workdays, exceptions, timezone, factory/supplier calendars.

Template rules must produce selected applicable tasks and a default **dependency shape**, not guessed target dates or buyer requirements. A custom template and manually added/removed task need audit/reason. Show hidden inapplicable choices only on request.

## 2. Canonical order lifecycle and task-library IDs

Task IDs below are stable **template references**, not database record IDs. Each added instance gets a unique generated record ID. Missing inputs show `Needs Information`. A task may be optional by profile/process/market.

### Stage A — Order / commercial (O)

| ID | Milestone/activity | Key dependency / caveat |
|---|---|---|
| O01 | Enquiry / inquiry received | Informational start, optional |
| O02 | Costing & consumption confirmation | Approved inputs only |
| O03 | Price / FOB agreement | Commercial record |
| O04 | Tech pack / BOM revision received | Track exact revision |
| O05 | PO receipt | May be separate from order confirmation |
| O06 | Order acceptance and agreed ship terms | Buyer evidence |
| O07 | Proforma invoice issue / sign-off | Not equal to LC opening |
| O08 | Master LC requested | If LC route applicable |
| O09 | Master LC opened / authenticated | Contractual lead-time anchor **only if agreed** |
| O10 | Deposit / TT milestone | If payment route applicable |
| O11 | Buyer delivery baseline confirmed | Ex-factory vs ETD vs DC dates distinguished |
| O12 | TNA reviewed and baseline confirmed | Immutable first version |

### Stage B — Product development and approvals (D)

| ID | Activity | Notes |
|---|---|---|
| D01 | Development tech pack check | Revision identity |
| D02 | Pattern / block development | Construction-specific |
| D03 | Proto / first sample submit | If needed |
| D04 | Proto comments received | Separate receive from submit |
| D05 | Fit sample submit | Track size/version |
| D06 | Fit comments received | Buyer/local authority |
| D07 | Re-fit / revised sample | Conditional on feedback |
| D08 | Fit approval recorded | Evidence and reviewer |
| D09 | Graded pattern / size-set prep | Applicable |
| D10 | Size-set/size-run submit | Applicable |
| D11 | Size-set comments/approval | Explicit |
| D12 | PP sample start | Pre-production approval |
| D13 | PP sample submit | Submission event |
| D14 | PP sample approval or written waiver | Waiver authorized + reason |
| D15 | Packaging artwork / label artwork submission | Buyer approval path |
| D16 | Packaging / label artwork approval | Buyer instructions |
| D17 | Print/embroidery strike-off submission | If process selected |
| D18 | Print/embroidery approval | If selected |
| D19 | Wash standard / shade standard submit | If selected |
| D20 | Wash standard approval | If selected |

### Stage C — Fabric approvals (FA)

| ID | Activity |
|---|---|
| FA01 | Yarn/fabric quality selection / specification confirmation |
| FA02 | Lab dip / shade standard prepared |
| FA03 | Lab dip submitted |
| FA04 | Lab dip comments / resubmission |
| FA05 | Lab dip approved |
| FA06 | Fabric hand-feel / construction sample approval |
| FA07 | Fabric testing submission |
| FA08 | Lab results received / reviewed |
| FA09 | Strike-off / AOP approval if applicable |
| FA10 | Fabric bulk-release authorization |

### Stage D — Fabric procurement / manufacturing (FP)

| ID | Activity |
|---|---|
| FP01 | Fabric consumption and required quantity confirmed |
| FP02 | Yarn / fabric PO or nominated supplier booking |
| FP03 | Fabric B2B LC application (if required) |
| FP04 | Fabric B2B LC opened (if required) |
| FP05 | Yarn in-house / availability |
| FP06 | Knitting / weaving start (profile-dependent) |
| FP07 | Knitting / weaving completion |
| FP08 | Greige inspection / relaxation (applicable route) |
| FP09 | Dyeing / printing start |
| FP10 | Dyeing / printing finish |
| FP11 | Finishing, width/GSM/shrinkage control |
| FP12 | Supplier bulk fabric final inspection |
| FP13 | Export / import paperwork, customs (if imported) |
| FP14 | Fabric dispatch / transit |
| FP15 | Fabric arrival / in-house |
| FP16 | In-house fabric inspection / shrinkage / shade grouping |
| FP17 | Fabric available for cutting release |

For imported finished fabric skip manufacture stages; for local greige route make the applicable stages explicit. Import milestones are conditional on route and country, not automatic.

### Stage E — Trims and accessories (TR)

| ID | Activity |
|---|---|
| TR01 | BOM / trim specification confirmation |
| TR02 | Trim artwork, label text, barcode confirmation |
| TR03 | Trim submission / fit check |
| TR04 | Trim buyer/local-office approval |
| TR05 | Trims purchase / supplier booking |
| TR06 | Trims B2B LC application if required |
| TR07 | Trims B2B LC opening if required |
| TR08 | Trims manufacture start |
| TR09 | Trims production complete |
| TR10 | Supplier trims testing / inspection |
| TR11 | Shipping / transit / customs if required |
| TR12 | Trims in-house |
| TR13 | Trims inspection & issue to production |
| TR14 | Extra trims / shortage replenishment if required |

### Stage F — Pre-production readiness (PP)

| ID | Activity |
|---|---|
| PP01 | Approved pattern, tech pack, BOM verified |
| PP02 | Fit / PP / trim / fabric / print / wash required approvals verified |
| PP03 | Garment performance / GPT test when required |
| PP04 | Pilot / trial cut / shrinkage plan |
| PP05 | Size set / pre-production trial |
| PP06 | PPM scheduled |
| PP07 | PPM completed with issues/actions |
| PP08 | PPM decision verified through explicit record/evidence |
| PP09 | Critical PPM action closure if required |
| PP10 | Production / cutting release authorized |

TNA cannot invent a PPM "GO" or interpret a date alone as authority. If verified release evidence is missing, keep gate pending, not auto-complete.

### Stage G — Cutting / preparations (C)

| ID | Activity |
|---|---|
| C01 | Fabric allocation, rolls/shade grouping |
| C02 | Relaxation / spreading plan (where applicable) |
| C03 | Marker / ratio / lay approval |
| C04 | Pilot cutting or cutting start |
| C05 | Cutting output update |
| C06 | Cutting complete for lot |
| C07 | Panel inspection / bundling |
| C08 | Print / embroidery / panel processing issue |
| C09 | Print / embroidery / panel processing return |
| C10 | Ready panels available to sewing |

### Stage H — Sewing, wash, finishing (P)

| ID | Activity |
|---|---|
| P01 | Sewing line allocation / input date |
| P02 | Sewing daily output, WIP and balance |
| P03 | Sewing completion for lot |
| P04 | Garment wash / dye / finishing start (if selected) |
| P05 | Garment wash / dye / finishing complete |
| P06 | Measurement / inline / midline quality checks |
| P07 | Finishing, trimming, ironing start |
| P08 | Finishing / ironing complete |
| P09 | Rework / repair / shortage replenishment (if required) |
| P10 | Packed-garment readiness |

### Stage I — Quality, packing, shipment (Q, PK, S)

| ID | Activity |
|---|---|
| Q01 | Fabric IQC / accessories IQC verified |
| Q02 | Inline inspection (if required) |
| Q03 | Midline inspection (if required) |
| Q04 | Final testing / laboratory submission (if required) |
| Q05 | Final laboratory results / hold resolution |
| Q06 | Final inspection booking |
| Q07 | Final inspection performed |
| Q08 | Verified final inspection decision / required disposition |
| PK01 | Folding / labels / packing materials readiness |
| PK02 | Packing start |
| PK03 | Packing output update |
| PK04 | Packing complete per lot |
| PK05 | Carton/pallet packing list / barcode verification |
| S01 | Freight forwarder / vessel / air booking |
| S02 | Shipping marks / carton dimension and documents verified |
| S03 | Ex-factory preparation |
| S04 | Ex-factory actual handover |
| S05 | Customs / handover / terminal acceptance (as applicable) |
| S06 | ETD planned / updated / actual (not ex-factory) |
| S07 | ETA / destination arrival if contracted and verified |
| S08 | Documents submitted / accepted |
| S09 | Short shipment / balance order follow-up |
| S10 | Commercial/order closure and lesson notes |

This is an **activity library**, not an obligation to show all rows. Conditional relevance, ordering, owners and baseline constraints must be editable with visible audit.

## 3. Template profiles and conditions

| Template | Core stages | Additional standard candidates | Must not force |
|---|---|---|---|
| Knit T-shirt / polo | O,D,FA,FP,TR,PP,C,P,Q,PK,S | Yarn/knitting/dyeing, rib/collar & wash checks | Woven fusing unless selected |
| Hoodie/jogger/sweatshirt | Knit base | Heavy fabric/rib, extra seam, fleece process | Denim wash unless selected |
| Woven shirts/shorts/trousers | All core | Weaving route if supplied, fusing, pattern/stripe checks | Knitting |
| Jeans/denim | All core | Fabric shade, wash approval, laser/stone wash, post-wash QC | Generic knit-only tasks |
| Sweater / fully fashioned | O,D,TR,PP,P,Q,PK,S + yarn | Yarn/gauge/panel knitting/linking/washing | Standard fabric cutting by default |
| Dress/skirt | Woven/knit per construction | Lining, zip, component matching, drape | Automatic denim route |
| Jacket / outerwear | Construction-specific | Lining, padding, seam-seal/coating, functional QC | Irrelevant sportswear tests |
| Activewear | Construction-specific | Recovery, stretch, opacity/performance tests if specified | Unapproved numeric test limits |
| Kidswear | Construction-specific | Buyer/market child-safety tasks if documented | Assumed regulatory requirements |
| Intimates | Construction-specific | Elastic/hardware, skin-contact components | Generic trouser route |
| Uniform/workwear | Construction-specific | Reinforcement, specified functional testing | Unapproved safety rating |
| Custom | Explicit choice | Any activity from library | Guessed applicability |

Template records should be versioned. Users may add their own checkpoints, reorder display, edit durations, link predecessors, mark `not needed` with a reason, save new templates. Retain IDs for calculation; display ordering does not determine dependencies.

## 4. Canonical data model (logical, independent of storage)

### Top-level OrderPlan

- `schemaVersion`, `recordId` (opaque stable UUID), `createdAt`, `updatedAt`, `revision`, `mode` (local/cloud/practice), `recordStatus`.
- `tenantId` (cloud), `ownerUserId`, `visibilityPolicyId`, `permissionsSnapshot` for display only; authorization checked server-side.
- `order`: `buyerId/name`, `brand`, `factoryId/name`, `vendor/sourcingAgent`, `poNumbers[]`, `styles[]`, `productProfile`, `construction`, `destinationMarket`, `fabricSpec`, `processFlags[]`, `techPackRevision`, `buyerManualRevision`, `composition`, `colorSizeBreakdown[]`, `totalQty`, `unit` (pcs/sets etc), `incoterm`, `shipmentMethod`, `currency`, `commercialNotes`.
- `commitments`: `orderConfirmedOn`, `poReceivedOn`, `masterLcOpenedOn`, `leadTimeAnchor` (explicit enum), `leadTimeBasis` (calendar/working), `contractualLeadDays` optional, `buyerRequiredExFactory`, `buyerRequiredETD`, `buyerRequiredETA`, `destinationRequiredDate`; each has source/evidence and an optional distinct timezone/calendar policy.
- `calendars[]`, `selectedCalendarIds`, `templateId`, `templateVersion`.
- `tasks[]`, `edges[]`, `approvals[]`, `materials[]`, `suppliers[]`, `operations[]`, `quantityLedger[]`, `shipmentLots[]`, `constraints[]`.
- `baselineSnapshots[]` immutable plan history; `revisionEvents[]`, `auditEvents[]`, `evidenceReferences[]`, `scenarioBranches[]`, `notificationPolicies[]`.
- `uiPreferences` optional (per-user and not part of authoritative commercial domain).

### Task instance

Required: unique `taskId`, stable `templateRef` optional, `title`, `stage`, `taskKind` (work/milestone/gate), `applicability` (required/optional/waived/not-applicable), `ownerParty`, `ownerUserId` optional, `calendarId`, `durationUnits`, `durationBasis` (working/calendar), `scheduleMode` (calculated/fixed/external), `progressMethod` (manual/quantity/milestone), `status`.

Dates **never share one mutable property**:

```json
{
  "taskId": "<generated-uuid>",
  "templateRef": "FP15",
  "title": "Fabric in-house",
  "stage": "fabric-procurement",
  "taskKind": "milestone",
  "ownerParty": "fabric-supplier",
  "durationUnits": 0,
  "durationBasis": "working",
  "calendarId": "<configured-calendar-id>",
  "dates": {
    "baselineStart": null,
    "baselineFinish": null,
    "currentTargetStart": null,
    "currentTargetFinish": null,
    "forecastStart": null,
    "forecastFinish": null,
    "actualStart": null,
    "actualFinish": null
  },
  "status": "not-started",
  "quantity": {"required": null, "completed": null, "unit": "pcs"},
  "proofRefs": [],
  "delayReason": "",
  "recoveryAction": "",
  "riskOverrideReason": null,
  "isRequiredGate": true,
  "lastChangedBy": null,
  "lastChangedAt": null
}
```

Template defaults must not be treated as confirmed factual dates. Dates as `YYYY-MM-DD` for scheduling only, user-visible display localized separately. Audit timestamps as timezone-aware ISO strings. Never rely on `new Date('YYYY-MM-DD')` timezone conversion for calendar-day arithmetic; use a date-only library or well-tested UTC components.

### Dependency edge

`{edgeId, predecessorTaskId, successorTaskId, relation: FS|SS|FF|SF, lagUnits, lagBasis, calendarPolicy}`. Support multiple inbound/outbound edges. Detect self-links, duplicate, missing, cyclic edges; reject invalid graphs before any schedule is replaced. A link is not an approval: gates also require successful applicable evidence/status.

### Approval instance

`approvalId, itemName, revision, partyRequiredToApprove, authorizedReviewerId/party, delegatedLocalOfficeAllowed (explicit), submittedDate, receivedDate, responseStatus, decisionDate, decidedBy, evidenceRef, agreedTurnaroundDays (optional), returnComments, resubmissionSequence[], requiredForTaskIds[]`. A single submission date cannot imply approved. Waiver needs a reason and authorized decision.

### Materials and commercial events

`materialId, category (fabric/trims/accessory), supplier, country, requiredQty, unit, bookingDate, supplierLeadTimeBasis, paymentMethod, masterLcRef (if applicable), b2bLcApplicationDate, b2bLcOpenDate, inHouseDate, QCDate, shortageQty, reservedForLotIds, remarks, evidenceRefs`. Supplier B2B LC exists only if applicable; master LC and B2B LCs are different events.

### Production operations and quantities

`operationId, type (cut/sew/wash/finish/pack etc), lotId, qtyInput, qtyCompleted, qtyRejected, qtyReworked, qtyWip, unit, availableLines, calendarId, datedCapacityEntries[], dailyActuals[], efficiencyModel, smvOrSam, overtimePolicy, dependencies[]`. Count units consistently and avoid double-counting rework. Distinguish planned capacity, actual output and user-confirmed forecast rate.

### Shipment lots

`lotId, lotReference, plannedQty, packedQty, passedQty, shippedQty, remainingQty, factory, requestedExFactory, currentExFactory, forecastExFactory, actualExFactory, ETD, ETA, destinationReceipt, shipmentMethod, bookingRef, inspectionRef, poAllocation[], status`. Full order totals must reconcile. Do not equate ETD, ETA and ex-factory.

### Immutable baseline / revisions

A baseline is a signed/confirmed snapshot with plan version, actor, timestamp, date assumptions and reason. It may be superseded by **new** approved revision, never silently mutated. Computed forecasts have provenance (`calculatedAt`, engine version, input revision) and are reproducible. Add operations for create/revise/approve/restore, with validated preconditions.

## 5. Status contracts

**Task status:** `not-started`, `in-progress`, `submitted`, `awaiting-approval`, `approved`, `rejected`, `blocked`, `completed`, `waived`, `not-applicable`. Different task kinds allow different transitions. Approval task `approved` requires authorized evidence; milestone `completed` requires actual date/user confirmation; `waived` requires reason/authority; `not-applicable` requires applicability explanation. No backward status mutation after locked approval except a new controlled revision.

**Computed risk status (separate field):** `on-track`, `at-risk`, `delayed`, `blocked`, `needs-information`. Do not use task progress status as a synonym for risk.

**Project summary:** not-started, active, on-track, at-risk, forecast-late, completed, closed, on-hold; must derive from effective commitments and explicit business conditions, not cosmetic percentages.

## 6. Role visibility and privacy

- Define information groups: public-to-authorized-buyer milestones, internal-factory remarks, sourcing-agent commercial notes, restricted finance/price/LC fields, production capacity, evidence attachments.
- Factory may only access their own authorized orders in cloud mode; buyer sees authorized PO subset; agent sees contracted companies; admins see only their tenant. Do not assume all buyer/factory users should see financial values.
- Every cloud mutation records actor ID, tenant, order, time, before/after or delta, reason where applicable, and request ID. Corrections append audit entries; never quietly delete someone else's change.
- Offline-local records belong to the local browser profile; these are **not multiuser-shared** and not secure cross-device isolation.

## 7. Import and migration rules

- Excel imports are **staged**: upload → detect sheets/headers/date formats → column mapping preview → show unmatched/invalid tasks → propose dependency mapping → explicit confirm import into a **new** record or reviewed merge. Never overwrite existing TNA just because PO/style matches.
- Protect formulas and spreadsheet data: do not execute macros, formula cells or embedded scripts as trusted logic; warn if imported value is formula-derived or unsupported. Export text values safely to prevent formula injection.
- Versioned native saved copy includes `format: VESA-TNA`, schema version, record content and checksum as appropriate. Reject oversize/malformed/untrusted data before writing to active state; support explicit migrations and old backups.
- On PPM/AQL linkage, compare buyer + factory + style + PO where available and require explicit disambiguation when identifiers collide.

## 8. Mandatory edge cases to model

1. One PO multiple styles; one style multiple POs; same style reused next season; duplicate PO across buyers.
2. Split shipments; parallel lines; subcontract processes; one resource shared by multiple orders.
3. Required approval rejected twice; late comments; waived requirement with written authority.
4. Local office approvals vs overseas buyer approvals; turnaround not provided.
5. Fabric booked before fit approval; parallel tasks; material readiness blocks cutting.
6. LC not opened, PO exists; both LC and buyer ex-factory commitments differ.
7. Friday/Saturday weekend vs Sunday off vs 7-day factory; country-specific holidays entered manually.
8. Midnight timezone crossing; daylight saving for users in other countries, dates remain date-only.
9. Partial packing, final-inspection hold, shortage/rework, shipped partial order not complete.
10. Missing duration, missing capacity, negative progress, overallocation, supplier unknown, import errors.
11. Task dependency cycle or missing predecessor; date constraint contradiction; contract date earlier than feasible finish.
12. Two cloud users editing same revision; offline local edits conflict with server; rejection must preserve both drafts.
13. Long task names in Bengali/Tamil; special characters in buyer/style; multiline comments and export.
14. Existing PPM/AQL record missing, duplicated or version-incompatible — display unverified link instead of invented result.

**Next document:** `03_SCHEDULING_ENGINES.md` defines what every engine calculates and how it proves correctness.
