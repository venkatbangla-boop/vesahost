# 02 — AQL 360 Domain Workflows, Inspection Stages & Data Schema

## Universal quality-workspace philosophy
This is an inspection tool for apparel/garment quality first, while preserving existing general buyer/product profiles. The user selects an inspection type and buyer-approved plan. AQL is an acceptance sampling **method**, not a guarantee that a shipment is compliant or legally certified. Pass/Fail/Pending and evidence must follow validated selected buyer rules. Never substitute PPM release or TNA schedule for inspection acceptance.

## End-user journeys
- **Factory QC**: select incoming/fabric/cutting/inline/endline/prefinal/rework, take measurements and photos, assign containment/CAPA, prepare factory follow-up.
- **External inspector**: validate buyer rules/lot identities/packing list, draw sample, enter findings, apply existing Ac/Re/critical rules, sign/report with integrity controls.
- **Buyer/Agent**: view summarized results, stage readiness, unresolved risk, reinspection chain and evidence; no unverified signature authenticity claim.
- **Warehouse/loading**: reconcile cartons, labels, random sample, container/seal, shipment note; loading pass is not automatic final AQL pass.
- **Supplier/auditor**: audit QMS/critical control, incoming lots, lab/calibration and CAPA with proper references.

## Existing 6-step primary flow
`Setup -> Samples -> Inspect -> Measure -> Pack & site -> Review`. Preserve all existing action semantics, selected stage context and current persisted identifiers even if the UI presentation becomes simpler. Main stepper is not a new inspection standard.

## Full existing 13-stage `StageCatalog` workflow
1. `incoming` — Fabric / Accessories Incoming Inspection: supplier, PO/material, received qty, sampling, warehouse/lab, quarantine/release.
2. `fabric` — Fabric Roll Inspection: roll ID, grading, dimensions, shade, labs.
3. `ipc` — Initial production/first output: pattern, approval, machine, fit, workmanship, pilot risk.
4. `cutting` — Cutting Quality Audit: relaxation, spreading, markers, shade, plies, bundle, fusing, release.
5. `inline` — Inline Inspection: sampling frequency, operation, containment, repairs, supervisor.
6. `endline` — Endline Inspection: workmanship/measurement/labels/repair/quantity.
7. `prefinal` — Pre-Final Inspection: production/packing/reference/lab/needle/packing readiness.
8. `final` — Final Random Inspection: frozen lot/packing, approved sample, independent sample and result.
9. `rework` — 100% Screening / Rework: original failures remain; repair/recheck coverage.
10. `reinspection` — linked independent reinspection with previous report/failure and new controlled sampling.
11. `loading` — Container Loading Inspection: container condition, cartons, handling, seal/handover.
12. `monitor` — Production Monitoring: output, balance, quality trend, delay/subcontract risk.
13. `audit` — Supplier Quality Audit: organization, documents, calibration, production QA, CAPA, traceability.

### Stage activation
Every stage is linked to order/lot/reference record but has a separate inspection event ID, criteria version, observation set, actual sampling and result. Users may inspect only the stages they need; no global forced 13-stage pass. For failed final result, reinspection must create **new** event and retain prior failure. Reference attachments can be reused by reference ID only with explicit lineage, not as overwritten originals.

## Sampling data model — conceptual mapping; confirm actual source schema
```text
InspectionEvent {
  id, type, stage, createdAt, inspectedAt, inspectorName, localUser,
  order: {buyer,factory,style,po,destination,quantity,sizeColorLines,packingListRevision},
  policy: {buyerManual,tableSource,edition,scheme,inspectionLevel,
           aqlCritical,aqlMajor,aqlMinor,lotFormation,countingBasis,
           requiredEvidence,selectedReinspectionPolicy,reviewer,approvedAt},
  groups: [{lotKey,lotQuantity,sampleCode,sampleRequired,sampleAllocated,
            sampleChecked,perSeverityAcRe,planIssues}],
  cartons: [{factoryCartonNumber,thirdPartyCartonNumber,packingListRef,
             quantity,lot,randomSelectionAudit}],
  findings: [{findingId,stageId,lotKey,sampleOrPieceId,defectCode,severity,
              qty,countingBasis,location,notes,evidenceIds}],
  measurements: [{pom,unit,spec,tolerance,actual,checkStatus,method}],
  approvals, labResults, fabricRolls, shadeLots, packingChecks,
  stageEvidence, signoffs, riskActions, capa,
  outcome: {computedState,blockingReasons,criteriaVersion,reviewedBy},
  chain: {parentEventId,priorOutcome,repairEventIds},
  backups, attachments, schemaVersion, revision
}
```
The real AQL app has many existing object names, stores and embedded assets. This model is not permission to rewrite storage; Codex must inspect `ProjectStore`, `SamplingEngine`, `StageCatalog`, `LocalRepository` and portable serializers and build a **data mapping table** before any migrations.

## Defects, counting and denominators
- Severity groups: Critical/Major/Minor as defined by buyer/manual source, not by generic guessed examples. Defect count vs defective-piece count requires explicit basis. Multiple defects on one piece are not necessarily multiple defective pieces.
- Sample allocation: sum allocated by eligible lot/color/size/group equals selected approved plan; sum inspected/checked equals approved required sample before result can be final. Missing group identifiers or mixed incompatible lot bases = needs information.
- Ac/Re: if approved plan returns unsupported (`null`) cells, no acceptance or 'zero allowed by default' inference. Preserve current result engine and approved mapping unless separately audited and proven.
- Random carton sampling: random numbers independent of manual preference, with reproducible seed/date/operator/packing-list version; flag duplicates, missing cartons and mismatch factory vs third-party IDs. Manual override recorded with reason, never masquerade as random.
- Packing quantity: reconcile PO/order, packed, inspected, shortage/excess, cartons/pieces per carton, ratio and spot-check numbers. Never infer unknown cartons.

## Data validity and traceability
AQA valid states include `Not started`, `In progress`, `Pending/Blocked`, `Pass`, `Fail`, `Not Applicable` as existing domain enums permit. This list describes user-facing labels; **do not overwrite source enums**. Every auto-calculated result points to selected plan version, counting basis, lot identity and input evidence. Save signatures/photos with explicit provenance, device limitations and no fake verification. False/pending field remains pending; avoid passing on empty denominator.

## CAPA/rework/inspection history
Defect finding original is immutable, even if repaired or corrected; corrective events have their own times and approvals. Reinspection refers to original inspection and corrective action but uses current approved sampling/instructions and new measured findings. Analytics should show first-pass vs post-rework, without erasing original failure or improving historical pass rates silently.

## Optional improvements (all guarded by buyer/standard source)
Photo checklist, carton randomization preview, evidence completeness, sample breakdown dashboard, defect Pareto, root cause/action tracker, combined multi-PO quality trend, missing-info diagnosis, role-based handoff, import spreadsheet mapping, simple inspection wizard. Do not implement an unsupported scientific/legal test or a switching scheme not supplied by the buyer/manual.

## Fixtures to build before refactor
Final normal level II legacy supported plan; unsupported/null AQL cell; lot grouping by style/color/size; allocation mismatch; missing sample count; critical defect; major=Ac; major=Re; multiple defects per piece; exact buyer counting basis; sample identification; incomplete packing list; overlapping carton IDs; fabric roll shortage/4-point method (only where selected); pending lab fail; IPC first output; prefinal blocked; final fail -> CAPA -> reinspection; confirmed good loading seal; disabled storage; invalid sync pack; demo isolation. Never contain real customer data in fixtures.
