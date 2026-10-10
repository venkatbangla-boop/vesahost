# 02 — PPM 360 Domain Workflows, Checkpoints & Data Ownership

## Principle: this is a meeting and pre-production readiness tool, not a substitute for buyer authorization
Keep PPM decision evidence separate from TNA planned dates and AQL inspection outcome. A PPM meeting may be conducted when information is incomplete; a production GO may NOT be falsely granted just to close a form. `GO`, `CONDITIONAL GO`, `HOLD`, internal `OK/ACTION/PENDING/N/A`, and new display labels retain existing machine-readable semantics.

## Representative role journeys
1. **Factory merchandising:** order identity, current tech pack/BOM, approvals, material ETA and risks; complete details and assign actions.
2. **Technical/QA:** inspect spec/POM, pilot/size-set references, workmanship defects, safety and testing evidence.
3. **Production:** readiness of equipment, operators, attachments, line plan, cutting and first output; do not bypass blocking approval.
4. **Buyer/agent:** summary of decisions, obligations and evidence; no silent externally binding waiver.
5. **Management:** blockers, ownership, pending required approvals, release rationale, revision diff.

## Existing 168 checkpoints — mapping rule
Read `SECTION_SCHEMA` directly in `apps/ppm/core.js`; extract ID, section, label, critical, hint and relevance dependencies into a **baseline fixture** before moving any UI. Do not reproduce 168 hand-typed rules into a second owner. The following broad groups are functional coverage categories, NOT an alternative authoritative enumeration:
- Order/document/approval controls and obsolete-techpack suppression.
- Technical/pattern/fit/graded size/measurements and first-output controls.
- Fabric/yarn/chemical/finish/lot/shade/quality and testing.
- Trims, label/care/origin, barcode, packaging, print/embroidery/wash requirements.
- Cutting, sewing, machinery, special process and operator/line preparation.
- Sample custody, quality/inspection plan, supplier and compliance reference.
- Workmanship, safety/traceability, production instruction, QA/QC handoff, meeting signoff.

## Process/profile engine contract
Source of truth is `GARMENT_PROFILES`, `PROCESS_OPTIONS`, `SECTION_SCHEMA`, RelevanceEngine and CoverageEngine. Product and selected processes filter visible checkpoint groups. Any `N/A` must be explainable and must not erase historical answers. Custom/other profile remains supported; choice to add custom checkpoints must be explicit. Do NOT assume `kids` safety claims, lab methods or fabric composition without buyer/market inputs.

## Data record — conceptual typed shape (map to actual `PpmRecordFactory`; NOT a mandatory storage rewrite)
```text
PpmRecord {
  id, version, createdAt, updatedAt, locked, training,
  meta: { buyer, factory, style, po, profile, product, fabric, quantity,
          deliveryDate, ppmDate, market, construction, processes,
          techPackRev, measurementRev, bomRev, ppSampleRef, ... },
  statuses: Map<CheckpointID, ExistingStatus>,
  remarks: Map<CheckpointID, UserText>,
  customCheckpoints: [{id,section,label,hint,critical}],
  participants: {role:{present,name}},
  measurements: [{pom,spec,tol,tolMinus,tolPlus,unit,actual,checkRequired,method,risk}],
  approvals: [{id,label,required,status,approvedBy,date,reference,notes,photo,photoRevision}],
  actions: [{id,checkpointId,issue,action,owner,dueDate,evidence,status}],
  changeReview: {baseline,history}, signatures, photos, release, ui, lastBackupAt
}
```
Actual keys, import format, bounds, and enums must be confirmed in current `PpmRecordFactory` and `BackupCodec`. Never store derived dashboard labels as authoritative statuses. Stable checkpoint IDs prevent translation changes from corrupting data.

## New optional enhancement schemas — additive + versioned only
- `meetingMinutes`: chairedBy, agenda, decisions, notes, acknowledgedAt, attachmentsRefs.
- `exceptions`: ID, checkpointId, buyerPolicyRef, scope, accountableParty, authorizedBy, authorityType, approvedDate, evidence, permittedUntil, status. **Cannot override a blocking policy automatically**.
- `actionEscalation`: actionId, escalationLevel, escalationOwner, reason, time, nextReviewDate; no fake notification sent flag.
- `linkedOrders`: explicit IDs for optional TNA/AQL references, sourceApp, sourceRecordId, sourceVersion/updatedAt, verifiedBy, verifiedAt, mappingPolicy.
- `meetingVersions`: immutable finalized snapshots, parent ID, amendment reason, approvals invalidated, signedAt.

Each enhancement should be optional for legacy imports, bounded, validated, portable in backups and ignored safely by old tools where format permits; any incompatible major schema requires migration and future-version rejection handling. Never mutate or delete old records as a migration shortcut.

## Lifecycle + lock state
`new draft -> editing -> ready for decision -> GO / CONDITIONAL GO / HOLD decision -> required signatures -> finalized locked -> controlled amendment / new meeting revision`. Not a single linear gate for every product; use existing relevance engine. Meeting remains reviewable even while HOLD. A locked record must remain read-only across fields, imported images, shortcuts and hidden controls; use explicit unlock/revision rules.

## Action status
Existing `Open`, `In Progress`, `Closed` must be retained. Closure requires supporting action/evidence and should not silently change checkpoint `ACTION` to `OK`; ownership changes and due date revisions keep historical explanation. For future collaboration, separate task owner from buyer approval authority.

## User language
Translate only app-authored explanatory sentences, menu labels and report headings. Never translate style/PO number, user remarks, technical values, status IDs, inspection classifications, literal buyer names or uploaded artwork. English, Bangla, Hindi, Tamil. Provide fallback for untranslated sentences; log developer-only coverage tests rather than visible untranslated strings.

## Representative PPM test scenarios
Knit basic tee; knit polo with collar changes; woven shirt with fusing; denim trouser with wash; activewear with special stretch-related buyer requirements; kidswear with required market safety reference; imported China fabric with Bangladesh production; 60-day-from-LC planning as an *explicit TNA-linked* condition, not a PPM invented approval; buyer/BD office approval authority split; rejected PP sample; blocked required proof; revised techpack after signatures; storage quota failure; training draft isolated from production.

## Domain definition of done
Every scenario must show exactly applicable core controls, preserve required unanswered controls as blockers, give clear decisions and reason list, save/open without loss, and produce user-readable reports. Show `Needs Information` rather than fake green progress when records are incomplete.
