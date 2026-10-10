# 03 — AQL Calculation Owners, Safety Rules, Golden Parity & Numeric Testing

## Actual source owners (from latest GitHub blob)
| Class/owner | Responsibility | Freeze/change limit |
|---|---|---|
| `SamplingEngine` | legacy lot-code, level, sample n and AQL Ac lookups | Freeze arrays/cells/schemes until independently approved |
| `AllocationEngine` | allocate sample to lot/subgroups | Freeze counts and rounding semantics |
| `MeasurementEngine` | point/spec/actual/tolerances | No invented POM/spec tolerance |
| `ResultEngine` | core pass/fail/pending and blocking reason logic | Never change while modifying UI |
| `PlanApproval` | plan source/criteria acceptance | No invisible auto approval |
| `PackingEngine` | packing/carton/order calculations | All counts traceable to input |
| `ReinspectionService` | immutable prior failures and linked reinspection | Never delete original result |
| `FabricInspectionEngine`, `InlineQualityEngine`, `PreFinalReadinessEngine` | stage-specific quality/blocked handling | Preserve required stage checks |
| `FinalAQLInspectionEngine`, `StageDecision` | final/stage outcome coordination | Never shortcut core ResultEngine |
| `AuditEngine`, `StageQualityControls` | supplier and needle/metal/calibration/compliance references | Market applicability from buyer/manual |
| `LocalRepository`, `StorageIO`, `SaveSafety`, `PortableInspection` | durable save/reopen; rescue copies/verification | No false saved flag or destructive migration |
| `ReportComposer`, `StageReport`, `ShipmentReport`, `CompanionReport` | read-only evidence-based reporting | Reports agree with underlying outcome |

## Essential sampling freeze: exact current arrays
Current `SamplingEngine` defines codes `A B C D E F G H J K L M N P Q R`; sample sizes `[2,3,5,8,13,20,32,50,80,125,200,315,500,800,1250,2000]`; inspection levels `S-1..S-4`, `I`,`II`,`III`; legacy AQL options `0.65,1.0,1.5,2.5,4.0,6.5`. A number of acceptance (`AC`) cells are deliberately `null` (unsupported), not zero. It explicitly says this is **not a fully licensed ISO 2859-1:2026 implementation** and custom/tightened/reduced plans need buyer-specified data. Codex must extract complete actual arrays/methods and freeze them as fixtures; don't republish standards tables without a rights/accuracy review.

## Calculations and guards
- Determine lot/sample group only using explicit approved grouping rule. For each group: validated lot `N`, code/plan source, required sample `n`, allocated `a`, checked `c`, observed defect counts by selected basis and severity. If `a != n` or `c != n`, return a pending reason even if observed counts are low.
- For selected buyer-approved single-sampling plan, an `Ac` is max accepted count; compare to exact `Re` according to the existing validated plan. Do not synthesize `Re` for unsupported cells or incompatible scheme. Use original `ResultEngine` truth table as authoritative baseline, then independently verify buyer sources before policy changes.
- Explicit critical defect rule must be read from buyer profile/current app; do NOT globally assume critical Ac=0 unless that is the selected policy.
- If buyer plan uses defective *pieces* vs *defects*, count each once per defined basis. A colour/size count cannot be reinterpreted as whole-lot compliance.
- Inspection timeline may have production/packing readiness rules; final result requires all selected inputs/authorities, including lab/evidence when required. Pending/failed stage cannot be green because a checkbox is filled.
- Fabric 4-point inspection uses separate roll-length/width/points grading method; do NOT route through finished garment AQL pass threshold. No hidden area/unit conversions.
- Quantity reconciliation must show order vs packed vs sampled, missing cartons, excess and random carton evidence, not fudge missing quantities.
-
- Empty, negative, overflow, decimal where integer required, `NaN`, repeated sample ID or mismatched lot must fail validation gracefully. No coercion to zero/pass.
- Signing/finalizing/locking must not occur without actually verified required fields; trial exercise must never convert to real inspection silently.
- Reinspection is a new event; the parent failed event/report and CAPA survive; later accepted result must not rewrite old failure.

## Golden fixtures and edge-case verification matrix
| ID | Case | Expected |
|---|---|---|
| Q01 | Every supported actual lot/cell in current chart | Match exact pre-refactor sample, Ac/Re values |
| Q02 | Each null cell and unavailable tightened/reduced plan | Explicit cannot calculate / needs approved table; no pass |
| Q03 | Lot boundary 8/9/15/16, etc. | Exact existing boundaries, no accidental off-by-one |
| Q04 | Zero/negative/fractional qty where invalid | Explain error, do not calculate acceptance |
| Q05 | Mixed groupBy color/size/style with missing ID | No partial misleading combined result |
| Q06 | Sum allocated != sample n | Pending and explanatory remainder |
| Q07 | Checked count < sample n | Pending even with zero defect |
| Q08 | Critical severity defect vs buyer policy | Exact validated critical gate, not generic assertion |
| Q09 | Major count == Ac, == Re | Correct boundary pass/fail per policy and basis |
| Q10 | Two defects on one physical piece | Correct specified defective-piece or defect basis |
| Q11 | Invalid duplicate carton/sample ID | Reject or flag traceability; preserve source |
| Q12 | Fabric width/length and 4-point grading | Verified buyer method and numeric unit |
| Q13 | Final pass requested with pending lab/test/reference | Block according to selected required rule |
| Q14 | Failure -> CAPA -> repaired quantity -> independent reinspection | Parent record and failure never erased |
| Q15 | Supplier critical audit failure or denied acknowledgement | No false pass/complete |
| Q16 | Project/master/sync pack malformed or repeated data | Atomic rejection; existing saved record unaffected |
| Q17 | Corrupt/oversized inspection saved copy | Friendly failure; original remains untouched |
| Q18 | IndexedDB unavailable/quota failure during save | Unsaved warning + valid export/rescue flow |
| Q19 | Offline service worker upgrade with old open tabs | No mix of old HTML/new logic; unsaved work protected |
| Q20 | Reports for Pass / Fail / Pending / Reinspection | Numbers/reasons match one immutable source snapshot |
| Q21 | Random carton selection deterministic seed/revision | Reproducible picks, manual override history preserved |
| Q22 | Chart/dashboard with missing denominator | Needs Data; not infinity/NaN/0% pass |
| Q23 | Long notes/photos/signature and 4 Indic/English language renders | No clipped/missing data in screen and PDF |
| Q24 | UI-only theme/menu/header update | Domain output and portable export hashes/semantic parity |

## Upgrade technique for 11.7MB source
1. Before touching file, snapshot the exact Git blob, extract baseline scripts/CSS/classes and create golden fixture runner using browser or VM harness. Avoid giant string replacement as a permanent repair.
2. First install one shared shell adapter that **delegates** existing `InspectionApp.dispatch`, preserves `InspectionApp.render` semantics and does not shadow domain classes or instantiate a second app.
3. Only once reliable behavioral tests pass, separate pure owners/large embedded assets into named files with one controlled patch per group and service worker version lock. Keep `file://` behavior only if user-approved supported route; hosted GitHub Pages and offline fallback are the required gates.
4. Avoid recursive monkey-patch layering; retain a single orchestration owner and teardown hooks. Use migration tests when changing imports, `VESA_MASTER_SOURCE` or portable HTML snapshots.
5. Any proposed improvement that touches `SamplingEngine` or ResultEngine requires a distinct policy validation gate, published source/edition/buyer instruction, golden result comparison and independent quality-owner signoff. Without it, leave numeric behavior unchanged.

## Current code caveats and validation scope
Older release docs report some items `partial`; don't mark them fixed from static source presence. `release-contract.cjs` checks selected source contracts but alone is insufficient to establish mathematical correctness or UI parity. Add robust Playwright real workflow regression and split domain tests; record exact pass/fail and screenshots. The 11.7MB file and service worker are real; runtime performance must be measured on representative devices. No claim is made that this packet executed the app or changed AQL acceptance tables.
