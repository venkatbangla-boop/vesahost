# 06 — AQL 360 Continuous Execution Tracker, 35-Area Matrix, Tests & Resume State

**DURABLE source of truth for VS Code Codex.** Exactly one ongoing program: Phase 1 (safe UI/foundation), Phase 2 (complete domain-quality rework), Phase 3 (secured integrations). Each gate is individually testable and reversible. A narrative, old report or checked box alone is not proof.

**Current scope overlay (2026-10-11):** `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` makes hosted identity/backend/database, remote collaboration and external notification delivery `DEFERRED_BY_SCOPE`. Sampling/Ac-Re provenance, stage behavior, reinspection history, local records, saved-copy recovery, reports and shared UX remain active; no carton-randomization policy may be invented.

**Free-only denominator:** 12 active gates; A-G10 is excluded. A-G09 and A-G12 retain one active local unit each while provider/deployment portions are deferred. Current accepted numerator: 3. See `docs/platform/VESA_GITHUB_FREE_ONLY_ELIGIBILITY.md`.

## Starting snapshot — 2026-10-10
| Field | Current reality |
|---|---|
| Repository | `venkatbangla-boop/vesahost`, branch `main` observed via GitHub (verify on local clone) |
| App URL | `/apps/aql/` |
| Source baseline | GitHub blob `b733dc700fce47aa04f1cd3f64c5e8f286d65512`, approx 11.7MB inline HTML |
| Known shell | Independent sidebar+topbar+dynamic sticky `#aqlReleaseMenu` |
| Existing test | `apps/aql/tests/release-contract.cjs` plus earlier engineering logs |
| Last accepted new rework gate | **A-G02** — AQL workflow parity accepted locally; no live deploy |
| Current verdict | `accepted` locally for A-G00, A-G01 and A-G02; the AQL unified-page v2 adapter closes the final application gap and shared U-G01 is accepted locally. A-G03 sampling/provenance and visible authorisation-entry slice are conditional pending approved carton-randomization fixtures; A-G04, A-G05, A-G06, A-G07, A-G08 and A-G09 have conditional fixture/source slices; provider services remain separate blockers. |
| Current gate | Shared U-G03/U-G06/U-G09 remain incomplete after accepted platform-page U-G04/U-G05/U-G07; **A-G03** remains policy-blocked and A-G06 evidence linkage remains the next independent AQL-domain slice. |
| LAST COMPLETED ACTION | Commit `a907fc7` removed the duplicate AQL entrance/internal brand, Settings and save owners, made workflow/context regions flow beneath the shared shell and refreshed the offline asset set. The final complete 83-command matrix passed in 1081.9 seconds after the recorded performance timing retries. |
| NEXT ACTION | Consolidate shared typography/colour/spacing/card/control tokens for U-G03, then run deeper U-G06 accessibility and U-G09 uniform review; do not change app domain rules or records. |
| Deferred / active blockers | Server-side identity/tenant store, cloud database, external notices and provider credentials are `DEFERRED_BY_SCOPE`; approved carton-randomization policy and real factory pilot remain active external evidence blockers |

### A-G01 unified-page v2 AQL adapter — accepted local slice; shared U-G01 accepted

FILE-LEVEL AUDIT: `ensureMenu` owns the AQL descriptor/callback handoff to `VesaWorkspaceShell`; `InspectionApp.render` owned a second internal brand/sidebar/topbar/Settings/save surface; `refreshChrome` owns actual local save status; the AQL service worker owns route-local and shared-shell offline assets. In scope: `apps/aql/index.html`, its route worker/cache contracts, one additive ownership browser test and continuity evidence. Frozen/out of scope: `SamplingEngine`, Ac/Re cells, `ResultEngine`, stage decisions, schemas/saved formats, inspection/evidence bytes, PPM/TNA runtime, public routes, providers and deployment. Risks: losing an existing command callback, hiding the only save state, stale offline shell assets, mobile overlap or mutating inspection data during preference changes. Verification: entrance/home/practice inspection at 320/360/390/768/1024/1280/1440 and 200% scale; exact single visible logo/header/six-menu/account/Settings/save ownership; mobile Menu/Escape/focus; File callback; preference immutability; no overflow, external requests or page errors; worker replacement and complete cross-app regression. Rollback: revert `a907fc7`; no record migration or browser-data cleanup is required, and the cache suffix rollback is self-contained.

```text
TIME / TIMEZONE: 2026-10-12 22:51 Asia/Dhaka
GATE / OBJECTIVE: A-G01 / shared U-G01 — adapt AQL entrance, Home and inspection chrome to the mandatory unified page shell without changing inspection rules or records
BRANCH / BASE COMMIT / RESULT COMMIT: feature/tna360-continuous / e010b49 / a907fc7
FILES CHANGED (EXACT): apps/aql/index.html; apps/aql/service-worker.js; apps/aql/tests/a-g01-unified-ui.cjs; apps/aql/tests/a-g07-worker-update.cjs; apps/aql/tests/release-contract.cjs
FROZEN / OUT OF SCOPE: SamplingEngine/Ac-Re/ResultEngine/stage formulas, ProjectSchema and saved formats, evidence/inspection records, sibling app source, public/Login/App Centre/Admin adaptation, providers and deployment
IMPLEMENTED / EVIDENCE: The shared shell mounts before AQL entry. The old entrance logo/top brand, internal VE brand row, duplicate Settings action and legacy save button are removed or compatibility-hidden; the platform save owner receives real AQL autosave state. Inspection context is a flowing section, desktop workflow steps are an inline horizontal region, mobile steps are non-fixed, duplicate floating tool launchers are hidden and the old release menu is disconnected. The service worker cache `vesa-aql-2026-10-12-8` includes the shared shell JS/CSS. The authenticated proof loads entrance, Home and a fictional practice inspection at seven widths, checks exactly one visible logo/sticky shell/ordered Home-File-Edit-View-Tools-Help system/Settings/Admin/Logout/save owner, verifies mobile Escape focus, File callback, 200% scale and byte-exact inspection preservation through Bengali/Pure Mono changes. Reviewed 390/1280 entrance, Home and inspection screenshots plus the 200% capture show no duplicate top-level chrome.
TEST COMMANDS + OUTPUT/COUNTS: focused AQL unified-shell browser PASS; A-G00 24/24, release contract, worker replacement/offline reopen and shared-shell contract PASS. Complete regression PASS using cached Playwright 1.64.0 and Chromium 1248: 83 commands / 1081.9s (51 automated, 19 browser, 12 syntax, 1 repository). The first full attempt and one isolated performance retry exceeded the 8s timing guard; a third isolated run passed at 5.21s and the final complete run passed at 6.85s. It includes current TNA domain/storage/security/report/browser suites, PPM 168-checkpoint/planning/recovery/40-PDF/report/update suites, all AQL sampling/stage/final/packing/measurement/import/quota/worker/report/reference suites, shared 390/1280 probes and git diff checking. Browser assertions report zero external requests and zero uncaught page errors; no failed assertion was waived.
VERDICT: accepted local AQL adapter slice and shared U-G01 accepted locally. Runtime `d64b32a` plus TNA `74657a8`, PPM `800d074` and AQL `a907fc7` now prove exact ownership across all three applications. Shared becomes 4/10, historical overall 56% and GitHub-Free-only 61%; no release/deployment is authorized.
NEXT ACTION (ONE PRECISE STEP): audit Login, App Centre and Admin against `VESA-UNIFIED-PAGE-SHELL-v2`, then select the first independently provable U-G03/U-G04/U-G05/U-G06/U-G07/U-G09 slice.
```

### A-G06 measurement specification/readings lifecycle — conditional slice accepted locally

FILE-LEVEL AUDIT: `ProjectSchema.measurement` defines the row; `MeasurementEngine` parses values and derives tolerance/OOT; `SampleRegistry` validates physical identities; `MeasurementPolicy` retains piece observations; `InspectionApp.measureDialog` owns visible specification/readings entry; `InsightReport.measurementTable` and `ReportComposer` render the report; repository/autosave owns durable reopen. In scope: one authenticated synthetic browser test and tracker evidence. Frozen/out of scope: `apps/aql/index.html`, all formulas and measurement policy, schemas/saved formats, service workers, sibling source, production data and deployment. Risks: inventing buyer acceptance, using unregistered identities, hiding the OOT, or presenting browser input as physical inspection. Verification: three registered measurement-only identities; visible 50 -1/+1 cm POM and 49/50/52 readings; visible matrix approval; exact one-OOT/FAIL engine and report rows; save/reload/reopen; reviewed 390px horizontal report viewport; zero external requests/page errors; complete cross-app regression. Rollback: revert `14aeb66` and the evidence-only commit; no runtime/data migration is involved.

```text
TIME / TIMEZONE: 2026-10-12 17:41 Asia/Dhaka
GATE / OBJECTIVE: A-G06 — prove explicit measurement specification, tolerance, unit, registered-piece readings and OOT report/reopen without changing policy
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 7b63ed3 / 14aeb66
FILES CHANGED (EXACT): apps/aql/tests/a-g06-measurement-browser.cjs; docs/tna/06_EXECUTION_TRACKER.md pre-code audit; this tracker and VESA_PROGRESS.md evidence follow
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, MeasurementEngine/MeasurementPolicy/MeasurementMatrix formulas, SamplingEngine/Ac-Re/ResultEngine, schemas/saved formats, workers, sibling source, production records, physical inspection, release/deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px Final workflow creates an explicitly fictional order and three registered measurement-only pieces through the audited state boundary, then uses the visible POM dialog to enter Chest width, specification 50 cm, -1/+1 cm tolerance, three required readings, exact piece IDs, actual values 49/50/52 and a fictional method/reference. The unchanged engine returns bounds 49–51, FAIL and exactly one OOT. The visible Measurement matrix dialog records required Chest width coverage for three pieces and a signed synthetic reviewer record without changing readings. The generated measurement report retains each piece, actual, deviation, unit and observation; AG06M-0003 stays 52 / +2 / OOT. Exact project state, engine result and observations survive Ctrl+S, reload and Home reopen. The draft remains unfinalised and Not released; no physical inspection, buyer policy or external approval is claimed.
TEST COMMANDS + OUTPUT/COUNTS: focused browser PASS repeatedly while tightening selectors/evidence capture. Complete cross-app regression PASS without retry: 80 commands / 679.4s (50 automated, 17 browser, 12 syntax, 1 repository), including current TNA/PPM/AQL, 40-PDF PPM report suite, AQL restore/import/quota/worker/report/reference/release, shared 390/1280 shell, syntax and `git diff --check`. Browser assertions report zero external requests and zero uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g06-measurement-report-mobile.png`; its mobile horizontal report viewport visibly shows actuals 49/50/52, deviations -1/0/2, unit cm and the retained OOT row without document overflow.
VERDICT: conditional — the A-G06 measurement POM/tolerance/actual/unit/report checklist item is accepted locally. A-G06 remains conditional for its evidence-link, CAPA/analytics, long-record/accessibility and physical-device/factory boundaries; gate scores and 35-area counts remain fixed.
NEXT ACTION (ONE PRECISE STEP): prove one authenticated evidence-link lifecycle: attach synthetic photo/document bytes to explicit registered piece/carton context, then save, portable-restore and reopen with exact owner/reference/bytes; do not infer physical inspection or external approval.
```

### A-G05 packing/barcode lifecycle audit — conditional slice accepted locally

FILE-LEVEL AUDIT: `StageQualityControls` owns packing-register duplicate/range reconciliation; `StageWorkspace` owns criteria and supporting-record dialogs; `PackingEngine`, `CartonIdentity` and `InspectionApp.cartonDialog` own carton applicability, barcode comparison and unique PO/style/local-carton identity; repository/autosave owns durable reopen. In scope: one authenticated synthetic browser test, the user-supplied numbered resume prompt and evidence trackers. Frozen/out of scope: `apps/aql/index.html`, packing rules, random selection, barcode-device APIs, sampling/Ac-Re/ResultEngine, schemas, workers, sibling source, production data and deployment. Risks: representing typed codes as scanner proof, treating a fixture range as buyer policy, or mutating accepted state after duplicate rejection. Verification: visible criteria/support/carton dialogs; duplicate/missing-range reasons then correction; equal typed barcode comparison; duplicate rejection; exact save/reload/reopen; reviewed 390px screenshot; zero external requests/page errors; complete cross-app regression. Rollback: revert `0c8c5e4` and the evidence-only commit; no runtime/data migration is involved.

```text
TIME / TIMEZONE: 2026-10-12 17:20 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove local packing-register range/duplicate guards and typed carton-barcode comparison without claiming randomization or device scanning
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / d825238 / 0c8c5e4
FILES CHANGED (EXACT): apps/aql/tests/a-g05-packing-barcode-browser.cjs; 02_UNIVERSAL_RESUME_PROMPT.md; docs/tna/06_EXECUTION_TRACKER.md pre-code audit; this tracker and VESA_PROGRESS.md evidence follow
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, PackingEngine/CartonIdentity/StageQualityControls rules, random selection, native barcode APIs, SamplingEngine/Ac-Re/ResultEngine, schemas/saved formats, workers, sibling source, production records, release/deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px workflow creates pre-final through the visible UI, enters an explicit fictional carton range 1–2 and adds packing-register identities 1, 1 and 3. The original evaluator visibly retains both `Duplicate carton: 1` and `Missing carton numbers: 2`; editing the duplicate record to 2 clears only those two guards while exact records 1/2/3 remain. Pack & site then records one selected carton with all five applicability decisions and matching typed expected/actual synthetic barcode `012345678905`; unchanged `PackingEngine` returns PASS. A second carton with the same PO/style/local identity is visibly rejected and leaves the accepted carton byte-for-value unchanged. Exact project state and PASS comparison survive local save, reload and Home reopen. No Random select or native scanner/device API is used.
TEST COMMANDS + OUTPUT/COUNTS: syntax and focused browser PASS. Complete cross-app regression PASS without retry: 79 commands / 766.8s (49 automated, 17 browser, 12 syntax, 1 repository), including current TNA/PPM/AQL, 40-PDF PPM report suite, AQL restore/import/quota/worker/report/reference/release, shared 390/1280 shell, syntax and `git diff --check`. Browser assertions report zero external requests and zero uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g05-packing-barcode-mobile.png`; matching expected/actual barcode fields are visible and the 390px viewport has no horizontal clipping. The numbered resume prompt content matches the existing canonical prompt apart from a conventional final newline.
VERDICT: conditional — local typed barcode comparison, packing range/duplicate guards and persistence are accepted. Area 26 and the combined loading/carton/barcode checklist remain conditional for approved carton-randomization policy and physical scanner/device evidence; scores and 35-area counts remain fixed.
NEXT ACTION (ONE PRECISE STEP): prove one authenticated measurement matrix/readings lifecycle with explicit synthetic specification, unit, tolerance, piece identity and OOT result through report/reopen; do not invent a buyer measurement policy.
```

### A-G05 Final Ac/Re boundary audit — conditional slice accepted locally

FILE-LEVEL AUDIT: `SamplingEngine` owns the frozen direct-cell lookup; `PlanApproval` signs its source; `SampleRegistry` owns inspected-piece identities; `ResultEngine` applies Critical/Major/Minor limits; `StageDecision` delegates Final and reinspection stages to the original result. In scope: one authenticated browser test and tracker/dashboard evidence. Frozen/out of scope: `apps/aql/index.html`, sampling cells, Ac/Re/ResultEngine logic, schemas/saved formats, service worker, sibling apps, production records and deployment. Risks: manufacturing buyer approval, omitting piece identity/severity, treating the acceptance boundary as overall release, or hiding unrelated pending controls. Verification: engine-derived level III / lot 90 / Major 1.5 plan; complete registered sample; visible Major findings at Ac and Re; exact local save/reload/reopen; 390px screenshot; zero external requests/page errors; complete cross-app regression. Rollback: revert `a59d618` and the evidence-only tracker/dashboard commit; no runtime or data migration is involved.

```text
TIME / TIMEZONE: 2026-10-12 16:58 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove an authenticated Final workmanship Ac/Re transition using a synthetic approved plan and explicit severity without changing the frozen engines
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 3831a3b / a59d618
FILES CHANGED (EXACT): apps/aql/tests/a-g05-final-boundary-browser.cjs; docs/tna/06_EXECUTION_TRACKER.md pre-code audit; this tracker and VESA_PROGRESS.md evidence follow
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, service worker, SamplingEngine/Ac-Re/ResultEngine, schemas/saved formats, other stages, sibling app source, production records, release/deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px flow creates Final through the visible dialog, then prepares an explicitly fictional signed plan through the audited store boundary. The unchanged engine returns code F, sample 20 and Major Ac=1/Re=2 for lot 90, level III and AQL 1.5. Twenty unique sample pieces are registered. The first Major finding entered through the visible defect dialog leaves the workmanship group PASS while the overall inspection honestly remains PENDING for closing controls; the second explicit Major finding makes the group FAIL and overall result NOT CONFORMED. Plan provenance, pending reasons, editable/unlocked state and Not released disposition remain unchanged. Exact project bytes, plan and counts survive local save, reload and Home reopen.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g05-final-boundary-browser.cjs` PASS; focused browser PASS. Complete cross-app regression PASS without retry: 78 commands / 635.1s (48 automated, 17 browser, 12 syntax, 1 repository), including TNA, PPM, AQL Q01-Q24/stage/restore/import/quota/worker/report/reference/release, shared 390/1280 shell, syntax and `git diff --check`. Browser assertions report zero external requests and zero uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g05-final-ac-re-boundary-mobile.png`; no horizontal clipping.
VERDICT: conditional — the A-G05 Final defect/severity result checklist item is accepted locally. It does not prove buyer approval, shipment release, physical-device/factory acceptance or the entire A-G05 gate; scores and 35-area counts remain fixed.
NEXT ACTION (ONE PRECISE STEP): prove one authenticated packing/barcode record lifecycle with explicitly entered synthetic codes, duplicate/range guards and exact save/reload/reopen; do not claim device scanning or approved carton randomization.
```

### A-G05 pre-final readiness/checkpoint audit — conditional slice accepted locally

FILE-LEVEL AUDIT: `PreFinalReadinessEngine` owns only explicit production/packing threshold comparison; `StageDecision.evaluate` separately requires every catalog checkpoint to be reviewed and preserves pending/failed reasons. For pre-final, `stageDecision` maps a complete failure-free stage to `READY FOR FINAL INSPECTION`, not final AQL acceptance. `StageWorkspace.check` records each actual Pass/Fail/N/A plus observation through `ProjectStore`, while repository autosave owns durability. In scope: extend `apps/aql/tests/a-g04-stage-browser.cjs` and, after proof, AQL/program trackers and the A-G05 pre-final checklist. Frozen/out of scope: `apps/aql/index.html`, readiness thresholds/policy, SamplingEngine/Ac-Re/ResultEngine, schemas/saved formats, final AQL decisions, shipment disposition, other stages, sibling apps, production data and deployment. Risks: treating passing percentages as complete readiness, bulk-filling checkpoints without visible review, confusing READY FOR FINAL INSPECTION with AQL pass/release, or losing observations on reopen. Verification: authenticated visible ready record remains PENDING with untouched checkpoints; individually review all pre-final checkpoints through dialogs; assert readiness-only decision, unlocked/not-released state, exact save/reload/reopen, 390px screenshot, zero network/page errors, focused and full regression. Rollback: revert additive test/tracker changes; disposable browser state is destroyed.

```text
TIME / TIMEZONE: 2026-10-12 16:35 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove passing pre-final thresholds cannot bypass explicit checkpoint review and produce only a readiness decision
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 7218fa3 / f371834
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, readiness policy/thresholds, SamplingEngine/Ac-Re/ResultEngine, schemas/saved formats, final AQL, shipment disposition, sibling apps, production records and deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px workflow created a separate pre-final event with 100% production and packing against explicit fictional 90%/80% thresholds. Its readiness record passed, but all 11 untouched stage checkpoints kept the stage PENDING. Each checkpoint was then opened and visibly saved as Pass with its own synthetic observation. Only after all reviews did the stage return READY FOR FINAL INSPECTION with zero pending/failure reasons. The event stayed editable/unlocked and shipment disposition stayed Not released; exact readiness record and checkpoint observations survived save/reload/reopen. No Final AQL pass, buyer approval or release was inferred.
TEST COMMANDS + OUTPUT/COUNTS: syntax, focused authenticated browser and `git diff --check` PASS. Full AQL/shared regression PASS: 18 commands / 123.0s, including Q01-Q24, stage/35-area contracts, current+legacy restore, atomic and 200/280 MiB boundary imports, quota rescue/restart, worker replacement/offline reopen, reports/language, cross-app boundaries, release and shared shell. Zero external requests or uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g05-prefinal-ready-mobile.png`.
VERDICT: conditional — the pre-final readiness prerequisite/checkpoint lifecycle and its A-G05 checklist item are accepted locally. Completed approved Final AQL, barcode/device, randomization-policy and physical/factory acceptance remain open; gate scores and 35-area counts do not change.
NEXT ACTION (ONE PRECISE STEP): prove one authenticated Final AQL sample/result boundary with a synthetic approved plan and explicit defect severity while preserving the frozen SamplingEngine/Ac-Re/ResultEngine outputs.
```

### A-G05 loading evidence/reconciliation audit — conditional slice accepted locally

FILE-LEVEL AUDIT: the loading stage record owns container/truck/seal, carton and piece expected/loaded quantities, timing, random-ID note and handover. `InspectionApp.evidenceDialog` plus `AssetService` retains original local image bytes and explicit owner/role metadata. `StageReviewPolicy.withEvidence` derives hidden `before`/`after` links only from photo assets owned by that loading record with the exact roles; `LoadingInspectionEngine` owns quantity, seal, time, handover and photo requirements. In scope: extend `apps/aql/tests/a-g04-stage-browser.cjs` and, after proof, AQL/program trackers and area-13 evidence. Frozen/out of scope: `apps/aql/index.html`, service worker, SamplingEngine/Ac-Re, saved formats, carton-selection/randomization policy, barcode device APIs, other stages, sibling apps, production data and deployment. Risks: testing metadata without original bytes, attaching photos to the wrong owner/role, hiding quantity mismatches, changing seal/handover, or portraying typed carton IDs as randomized evidence. Verification: visible before/after image attachments, exact bytes/owner/roles, visible quantity correction, no photo/mismatch failure, retained PENDING checkpoints, exact save/reload/reopen bytes and fields, 390px screenshot, zero external requests/page errors, focused and full regression. Rollback: revert additive test/tracker changes; disposable browser data is destroyed.

```text
TIME / TIMEZONE: 2026-10-12 16:28 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove owned original before/after loading evidence, quantity reconciliation and retained seal/handover without claiming carton randomization
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 3ec7ced / f9cf172
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, service worker, SamplingEngine/Ac-Re, schemas/saved formats, random-carton policy/algorithm, barcode device APIs, other stages, sibling apps, production records and deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px workflow reopened the deliberately mismatched loading event, attached two synthetic PNG originals through the visible Evidence dialog with exact `before` and `after` roles owned by the loading record, then visibly reconciled 99/100 cartons and 990/1000 pieces to the recorded expectations. Exact bytes, generated asset IDs, photo kind, owner and roles survived save/reload/reopen. Evaluation derived the hidden record links from owned evidence; quantity/photo failures cleared while all nine unreviewed checkpoints kept the stage PENDING. Seal and driver handover stayed unchanged. Typed carton IDs remained explicitly recorded input and were not represented as generated or policy-approved randomization.
TEST COMMANDS + OUTPUT/COUNTS: syntax, focused authenticated browser and `git diff --check` PASS. Full AQL/shared regression PASS: 18 commands / 108.0s, including Q01-Q24, stage/35-area contracts, current+legacy restore, atomic and 200/280 MiB boundary imports, quota rescue/restart, worker replacement/offline reopen, reports/language, cross-app boundaries, release and shared shell. Zero external requests or uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g05-loading-evidence-mobile.png`.
VERDICT: conditional — loading evidence ownership, original bytes, quantity reconciliation and seal/handover durability are accepted locally. Area 13 remains conditional for barcode/device evidence and the missing approved carton-randomization policy; A-G05 and percentages do not change.
NEXT ACTION (ONE PRECISE STEP): prove authenticated pre-final ready thresholds remain PENDING until selected checkpoints/evidence are explicitly reviewed; do not change readiness policy, SamplingEngine or Ac/Re.
```

### A-G05 final-stage readiness/result audit — conditional slice accepted locally

FILE-LEVEL AUDIT: `StageCatalog.final` designates `final` and `reinspection`; `StageDecision.evaluate` delegates those projects to `FinalAQLInspectionEngine`, which calls the captured original `ResultEngine` before adding stage evidence. `ResultEngine.evaluate` independently owns order identity, buyer criteria, sample allocation/counting, findings, checks, measurements and packing blockers; `ResultEngine.finaliseIssues` additionally owns closing review and sign-off blockers. `InspectionApp.finalise` verifies evidence, rejects any remaining issues and locks only after a separate confirmation. In scope: extend `apps/aql/tests/a-g04-stage-browser.cjs` and, after proof, the AQL/program trackers and area-12 ledger status. Frozen/out of scope: `apps/aql/index.html`, service worker, SamplingEngine/Ac-Re/ResultEngine/FinalAQLInspectionEngine, schemas/saved formats, other stages, sibling apps, production records and deployment. Risks: mistaking readiness percentages for AQL conformance, hiding unresolved scope/sample/check approvals, or allowing a blocked finalisation to mutate/lock the draft. Verification: visible authenticated Final stage creation and readiness record, exact PENDING reasons, visible Review route and finalise attempt, unlocked unchanged stage snapshot, save/reload/reopen, 390px screenshot, zero external requests/page errors, focused test and full AQL/shared regression. Rollback: revert the additive test/tracker patch; disposable browser state is destroyed.

```text
TIME / TIMEZONE: 2026-10-12 16:21 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove Final-stage readiness evidence cannot bypass the frozen final AQL engine or lock an unresolved inspection
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / db89c20 / 7c85269
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, service worker, SamplingEngine/Ac-Re, ResultEngine/FinalAQLInspectionEngine, schemas/saved formats, other stages, sibling apps, production records and deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px workflow created Final Random Inspection through the visible stage dialog and recorded a readiness row with 100% production/packing against explicit 90%/80% fictional thresholds. Readiness passed its own threshold, but the original engine retained PENDING because no order line, approved buyer sampling criteria, completed checks or sign-off existed. The visible Review route showed the unresolved requirements; pressing Finalise did not lock the project, alter the PENDING result, change the stage snapshot or remove any finalisation issue. Exact stage data survived local save, page reload and reopen. No final pass, approval, release or buyer rule was inferred.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs`, focused authenticated browser and `git diff --check` PASS. Full AQL/shared regression PASS: 18 commands / 101.2s, including Q01-Q24, stage/35-area contracts, current+legacy restore, atomic and 200/280 MiB boundary imports, quota rescue/restart, worker replacement/offline reopen, reports/language, cross-app boundaries, release and shared shell. Zero external requests or uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g05-final-readiness-pending-mobile.png`.
VERDICT: conditional — audited local Final readiness/result blocking and area 12 are accepted locally. A completed approved final AQL inspection, loading evidence/barcode, carton-randomization policy and physical/factory acceptance remain open; A-G05 and percentages do not change.
NEXT ACTION (ONE PRECISE STEP): attach and bind synthetic before/after loading photos through the visible workflow, then prove seal/handover/quantity and exact reopen without inventing carton-randomization policy or changing SamplingEngine/Ac-Re.
```

### A-G05 failure → CAPA → rework → linked reinspection audit — conditional slice accepted locally

FILE-LEVEL AUDIT: `StageWorkspace.capaAdd` owns explicit CAPA entry and requires verification plus effectiveness evidence for a Verified record. `StageWorkspace.create(category,true)` creates a distinct child project, copies only order context, stores the active event ID in `stageSuite.parent`, and initializes fresh checks/records/CAPA state. `StageDecision` owns the rework target-count, one-piece, repair, recheck and disposition guards. `InspectionApp.saveNow` → `AutosaveService` → `LocalRepository` owns independent durable rows, while `StageWorkspace.journey` renders saved same-order lineage. In scope: extend `apps/aql/tests/a-g04-stage-browser.cjs` and, after objective proof, the AQL/program trackers and 35-area evidence counts. Frozen/out of scope: `apps/aql/index.html`, service worker, `SamplingEngine`/Ac-Re tables, schemas and saved formats, other stage decisions, sibling apps, production records, release/deployment. Compatibility risks: accidentally mutating the source finding while recording CAPA, copying observations/CAPA into a child, losing the direct parent chain, or treating readiness as a final approval. Verification: authenticated visible UI entry, repository deep equality before/after each child, exact parent pointers and independent records, visible three-event journey, reload/reopen, 390px screenshot, no external requests/page errors, focused test plus full AQL/shared matrix. Rollback: revert the additive test/tracker patch; disposable browser state is destroyed.

```text
TIME / TIMEZONE: 2026-10-12 16:08 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove a retained production failure, explicit verified CAPA, 100% one-piece rework and fresh linked reinspection as separate durable events
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 2e3a49c / 1abeae7
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html/runtime, service worker, SamplingEngine/Ac-Re, schemas/saved formats, unrelated stages, sibling apps, production records, release/deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px workflow reopened the deliberate inline failure, added a Verified CAPA with explicit containment/root cause/action/owner/verification/effectiveness, and proved the original NOT CONFORMED finding record did not change. New linked inspection then created a distinct rework child with the failed event as parent, exactly one independently identified repaired/rechecked/accepted piece matching the approved target, and no copied parent observation or CAPA. A second New linked inspection created a distinct reinspection child with the rework event as parent and one fresh readiness observation. Repository snapshots proved source and rework rows unchanged after each child save and after page reload; Order quality journey visibly listed all three report IDs/stages/results. Reinspection remained PENDING with unresolved final approvals, so no release or final pass was inferred.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs`, focused authenticated browser and `git diff --check` PASS. Final full AQL/shared regression PASS: 18 commands / 95.4s, including Q01-Q24, all stage/35-area contracts, current+legacy restore, strict atomic imports, 200/280 MiB boundary, quota rescue/restart, worker replacement/offline reopen, reports/language, cross-app boundaries, release and shared shell. Zero external requests or uncaught page errors. Visual evidence reviewed at `output/playwright/aql-a-g05-rework-reinspection-mobile.png`.
VERDICT: conditional — the local failure/CAPA/rework/reinspection chain and areas 11/19 are accepted locally. Final-stage lifecycle, loading evidence/barcode, approved carton-randomization policy and physical/factory acceptance remain open; A-G05 and percentages do not change.
NEXT ACTION (ONE PRECISE STEP): prove one authenticated final-stage readiness/result lifecycle while retaining the frozen final AQL engine and all unresolved approvals; do not change SamplingEngine/Ac-Re rules.
```

## Daily/new-session rule
At every Codex session: read `apps/aql/AGENTS.md` and this tracker; inspect `git status --short`, current branch/HEAD, last accepted commit and real test output. Reconcile the log before any new code. Read topic-specific document as required, then pick earliest incomplete unblocked gate, name exact change files/frozen files, test and record acceptance. Do not claim a feature finished while actual code/output differs. A current domain fixture change requires explicit review; don't turn a cosmetic issue into inspection-policy rewrite.

## End-to-end gate sequence
### A-G00 — Source audit, frozen numerical/portable baseline
- [x] Verify local repo, branch, HEAD, dirty state, instructions and test dependencies.
- [x] Directly inspect large `apps/aql/index.html`, service worker, tests, shared nav/auth files and engineering history.
- [x] Record file-level in-scope/watched/frozen map, class/dependency graph, state lifecycle and rollback.
- [x] Snapshot actual `SamplingEngine` lot/levels/sample/AQL cells and `ResultEngine` decisions with all Q01–Q24 fixtures.
- [x] Verify existing six-step and 13-stage actions, basic save/open/portable copy, reports, login.
- [x] Record desktop/320/390/tablet screenshots before redesign; source code review alone doesn't prove visible UI.
- [x] Append G00 audit/proof and mark verdict; only then implement.

### A-G01 — Common VESA shell platform (coordinate once)
- [x] Reconcile shared `VESA-UNIFORM-UI-v1` contract with PPM/TNA and actual root app shell.
- [x] Platform-owned patch delivers same official logo, global menu, theme tokens, user/settings, navigation; AQL entrance/Home/inspection v2 adapter proven in `a907fc7`.
- [x] Max ONE sticky/fixed navigation region, correct mobile collapse, accessible focus and no duplicate AQL top-level owner at seven widths and 200% scale.
- [x] Root homepage/Login/Apps/Admin/PPM/AQL/TNA smoke and absence of regressions are retained through U-G00 plus the current 83-command matrix; deeper shared-token/responsive review continues separately.

### A-G02 — AQL menu adapter, home and novice workflow
- [x] Remove AQL-specific sidebar/topbar/sticky menu conflict after common adapter verified (A-G01 browser matrix).
- [x] Preserve `InspectionApp.render`, `dispatch`, old step/stage routes, state and data through additive adapters and source checks.
- [x] Home New/Continue/Open Saved/Practice/Open Saved Copy with correct saved states — authenticated chooser, continuation, practice, copy and portable import proof.
- [x] Guided 6-step beginner mode and expert detail without hiding complete stage controls — six-step guide and 13-stage selector visible in browser.
- [x] No overlay at 320/360/390/768/1024/1280/1440 — overflow false at all tested widths; 1280/1440 use the same responsive path and prior shared-shell geometry evidence.

### A-G03 — Sampling/counting/lot plan comprehensive audit
- [x] All supported codes/levels/lot brackets/sample/Ac/Re match the frozen Q01 fixture and A-G03 boundary contract.
- [x] Unsupported cells, absent buyer policy and unknown schemes cannot pass; null cells remain explicit unsupported plans.
- [x] Allocation/checked sample and counting-basis edge cases Q01–Q11 pass through the A-G00 baseline and A-G03 allocation contract.
- [ ] Introduce carton randomization reproducible algorithm/evidence only after separate requirements/fixtures.
- [x] Plan reviewer, reference edition, approved source, revision and timing are visible and provenance approval is deterministic.

### A-G04 — Stage workflow A-Z: materials through production
- [x] Incoming materials, fabric roll, shade, lab, cutting, IPC, inline, endline and monitor have deterministic contracts plus authenticated create/save/reload/reopen evidence.
- [ ] Material quantity, roll/lot, buyer manual, traceability, equipment/needle controls when required.
- [x] All 35 original areas have an executable evidence-ledger row with honest `PROVEN_LOCAL`, `CONDITIONAL`, `DEFERRED_BY_SCOPE` or `BLOCKED_EXTERNAL` status; this audit does not convert conditional areas or A-G04 itself to accepted.
- [x] Linked-stage transition creates a fresh child event with explicit parent identity; the parent repository snapshot and original observations remain byte-for-byte unchanged through child save and reload.

**Compliance evidence-binding file audit — 2026-10-12:** `StageWorkspace.panel` exposes the existing Evidence command for each stage record; `InspectionApp.evidenceDialog` and `handleUpload` stage original local bytes through `AssetService`; `ProjectStore` and `LocalRepository` commit the referenced asset with the inspection; `StageDecision.evaluate` accepts compliance evidence only when the report field exactly matches a document name/ID or attached asset ID. In scope: extend only `apps/aql/tests/a-g04-stage-browser.cjs` plus tracker/dashboard evidence. Frozen: `apps/aql/index.html`, service workers, saved formats, SamplingEngine/Ac-Re, all stage decisions, PPM/TNA/shared runtime, remote services and production data. Risks are testing metadata without real bytes, binding the wrong generated ID, accidentally changing incoming/custody observations, or accepting the compliance record while the original quantity mismatch disappears. Verification: attach a small synthetic file through the visible Evidence dialog, read its generated ID, edit the visible compliance report field to that exact ID, prove only the missing-evidence reason clears, save/reload/reopen exact records and bytes, check 390px/no-network/no-page-error behavior, then run focused and full AQL/shared regression. Rollback reverts the additive test/docs group; the disposable browser context is destroyed.

**Laboratory evidence-reference file audit — 2026-10-12:** `StageDecision.record` already owns method/result completeness and explicit laboratory failure; the later `StageQualityControls` wrapper owns cross-record evidence-reference validation against `project.documents` and `project.assets`. The lab register's optional `external` field currently accepts a typed report reference without confirming local evidence, while the tracker explicitly keeps valid attached lab evidence open. In scope: add one conditional fail-closed guard only when `external` is populated, extend the authenticated fabric-stage test through the existing Evidence dialog and exact generated-ID binding, bump the AQL offline cache, and update exact cache/source contracts plus tracker/dashboard evidence. Frozen: SamplingEngine/Ac-Re, laboratory pass/fail rules, schemas/saved formats, all unrelated stage decisions, root/PPM/TNA/shared runtime, buyer methods/criteria and production records. Risks are making an optional lab record mandatory, clearing the deliberate lab/shade failures, stale offline HTML, metadata-only proof or loss of roll/shade observations. Verification: typed unattached reference remains pending; blank external remains backward-compatible; visible original-byte attachment and exact ID binding clear only that pending reason; laboratory/shade failures and exact roll/shade records survive save/reload/reopen; worker lifecycle, release contract, focused browser and full AQL/shared regression pass. Rollback reverts the runtime/test/cache/docs group; no data migration is involved.

**Inspector-competency lifecycle file audit — 2026-10-12:** `StageCatalog.modules/fields` owns the existing competency register shape; `StageDecision.record` plus `AuditEngine` owns expiry failure; `StageQualityControls` owns assigned-inspector/stage warnings; `StageWorkspace` and the existing repository save/reopen path own visible editing and durability. In scope: extend only `apps/aql/tests/a-g04-stage-browser.cjs` plus tracker/dashboard evidence. Frozen: `apps/aql/index.html`, service workers, schemas/saved formats, SamplingEngine/Ac-Re, all other stage decisions, PPM/TNA/shared runtime, production data and deployment. Risks are treating a private local assignment record as accreditation, testing only an in-memory object, losing the IPC parent snapshot or weakening expiry/assignment boundaries. Verification: visible create with an expired date fails closed; visible edit to a future date clears only that failure; an exact inspector/stage match has no competency warning while a wrong-stage immutable copy warns; the local-only/not-accreditation authorization survives save/reload/reopen; 390px screenshot, zero-network/page-error assertions and full AQL/shared regression pass. Rollback reverts the additive test/docs group; disposable browser data is destroyed.

**Factory-acknowledgement lifecycle file audit — 2026-10-12:** `StageCatalog.modules/fields` owns the acknowledgement register; the installed `StageDecision.evaluate` guard keeps `received=No` pending; supplier Critical failure remains independently owned by `AuditEngine`; `StageWorkspace`, `ProjectStore` and `LocalRepository` own visible edit/save/reopen. In scope: extend only `apps/aql/tests/a-g04-stage-browser.cjs` plus tracker/dashboard evidence. Frozen: runtime source, service workers, schemas/saved formats, SamplingEngine/Ac-Re, supplier critical-failure policy, PPM/TNA/shared runtime, production data and deployment. Risks are treating receipt/agreement as VESA approval, allowing a Pass review to hide denied receipt, or clearing the original critical audit finding. Verification: visible denied receipt stays pending despite record Pass; visible edit to received/partial clears only that pending reason; the Critical finding and NOT CONFORMED decision remain; explicit no-VESA-approval wording and exact record survive save/reload/reopen; 390px screenshot, zero-network/page-error assertions and full AQL/shared regression pass. Rollback reverts the additive test/docs group; disposable browser data is destroyed.

### A-G04 laboratory evidence binding — conditional slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 15:37 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — fail closed for a populated unattached laboratory report reference, then bind original local evidence bytes through the visible fabric-stage workflow
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / ed21815 / 8d75797
FILES CHANGED (EXACT): apps/aql/index.html; apps/aql/service-worker.js; apps/aql/tests/a-g04-stage-browser.cjs; apps/aql/tests/a-g07-worker-update.cjs; apps/aql/tests/release-contract.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: SamplingEngine/Ac-Re, laboratory pass/fail rules, saved formats, unrelated stage decisions, PPM/TNA/shared runtime, buyer methods/criteria, production records and deployment
IMPLEMENTED / EVIDENCE: A populated lab `external` reference now remains pending unless it exactly matches a local document name/ID or attached asset ID; a blank optional reference remains backward-compatible. The authenticated 390px test attaches an original synthetic text file through the real Evidence dialog, verifies its generated ASSET ID and exact bytes, binds that ID through the lab form and proves only the missing-evidence reason clears. The deliberate Delta E/shade rejection and laboratory Fail remain unchanged, and exact roll/shade/lab records plus asset bytes survive local save/reload/reopen. Cache revision 7 propagates the HTML guard.
TEST COMMANDS + OUTPUT/COUNTS: syntax, release contract and focused authenticated browser PASS; full AQL/shared regression PASS, 18 commands / 122.4s, including Q01-Q24, all 35-area/stage contracts, portable/current+legacy restore, atomic and 200/280 MiB boundary imports, quota rescue, worker replacement/offline reopen, reports/language, cross-app boundaries and shared shell. Zero external requests or uncaught page errors. `git diff --check` PASS. Visual evidence reviewed at output/playwright/aql-a-g04-fabric-reject-hold-mobile.png.
VERDICT: conditional — the laboratory evidence-reference slice is accepted locally. Broader stage-report review and physical/factory acceptance remain open; A-G04 and percentages do not change.
NEXT ACTION (ONE PRECISE STEP): prove the existing inspector-competency register through authenticated create/edit/save/reload/reopen with assigned-inspector, stage and expiry boundaries; retain the explicit local aid/not-accreditation limitation.
```

### A-G04 inspector competency lifecycle — conditional slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 15:43 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove the existing stage competency register through authenticated create/edit/save/reload/reopen with assignment and expiry boundaries
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / a78046a / f9907d5
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; apps/aql/tests/a-g04-35-area-matrix.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html, service workers, schemas/saved formats, SamplingEngine/Ac-Re, all other stage decisions, PPM/TNA/shared runtime, production data and deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px IPC workflow adds a fictional competency record for the exact assigned inspector and stage. Its expired review date first produces the existing fail-closed expiry reason; a visible edit moves the review date to the future and clears only that failure. An immutable wrong-stage copy produces the existing assignment warning, while the valid saved record produces none. Exact identity, stage, future expiry and `Local assignment record only; not accreditation` authorization survive local save/reload/reopen without changing the linked-parent preservation proof.
TEST COMMANDS + OUTPUT/COUNTS: syntax and focused authenticated browser PASS; full AQL/shared regression PASS, 18 commands / 89.0s, including Q01-Q24, all 35-area/stage contracts, portable/current+legacy restore, atomic and 200/280 MiB boundary imports, quota rescue, worker replacement/offline reopen, reports/language, cross-app boundaries and shared shell. Zero external requests or uncaught page errors. The post-ledger 35-area validator reports 22 PROVEN_LOCAL / 11 CONDITIONAL / 1 DEFERRED_BY_SCOPE / 1 BLOCKED_EXTERNAL. `git diff --check` PASS. Visual evidence reviewed at output/playwright/aql-a-g04-inspector-competency-mobile.png.
VERDICT: conditional — the inspector-competency local lifecycle slice and area 22 are accepted locally. This remains a browser-local assignment/training aid, not accreditation or provider-authenticated authorization; A-G04 and percentages do not change.
NEXT ACTION (ONE PRECISE STEP): prove the existing factory-acknowledgement register through authenticated create/edit/save/reload/reopen, retaining a denied receipt as pending and never treating acknowledgement as VESA approval.
```

### A-G05 factory acknowledgement lifecycle — conditional slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 15:49 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove denied factory receipt stays pending and later acknowledgement cannot override the original supplier Critical failure
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 8d49d1f / 4ebe87a
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; apps/aql/tests/a-g04-35-area-matrix.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html, service workers, schemas/saved formats, SamplingEngine/Ac-Re, supplier critical-failure policy, PPM/TNA/shared runtime, production data and deployment
IMPLEMENTED / EVIDENCE: The authenticated 390px supplier-audit workflow adds a fictional factory acknowledgement with `received=No` and record review Pass; the exact denied-receipt reason remains pending and the Critical audit failure remains. A visible edit records receipt with a Partial response and explicit `No VESA approval or shipment release is represented` wording. Only the denied-receipt pending reason clears; the supplier audit stays NOT CONFORMED, and exact audit/acknowledgement records survive local save/reload/reopen.
TEST COMMANDS + OUTPUT/COUNTS: syntax and focused authenticated browser PASS; full AQL/shared regression PASS, 18 commands / 90.6s, including Q01-Q24, all 35-area/stage contracts, portable/current+legacy restore, atomic and 200/280 MiB boundary imports, quota rescue, worker replacement/offline reopen, reports/language, cross-app boundaries and shared shell. Zero external requests or uncaught page errors. The post-ledger 35-area validator reports 23 PROVEN_LOCAL / 10 CONDITIONAL / 1 DEFERRED_BY_SCOPE / 1 BLOCKED_EXTERNAL. `git diff --check` PASS. Visual evidence reviewed at output/playwright/aql-a-g05-factory-acknowledgement-mobile.png.
VERDICT: conditional — the factory-acknowledgement local lifecycle and area 28 are accepted locally, and the A-G05 supplier-critical/denied-acknowledgement item is proven. Acknowledgement remains an unauthenticated browser-local record and never VESA approval; A-G05 and percentages do not change.
NEXT ACTION (ONE PRECISE STEP): prove one authenticated failure → rework/CAPA → linked reinspection chain with immutable parent findings and independent child observations; do not change SamplingEngine/Ac-Re rules.
```

### A-G04 compliance evidence binding — conditional slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 12:29 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — use the visible Evidence workflow to attach original synthetic compliance bytes, bind the generated asset ID and clear only the missing-evidence reason
BRANCH / BASE COMMIT / TEST COMMIT: feature/tna360-continuous / 1dd4e6e / 355f844
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md evidence follows
FROZEN / OUT OF SCOPE: apps/aql/index.html, service workers, saved formats, SamplingEngine/Ac-Re, stage decisions, PPM/TNA/shared runtime, remote services, buyer/legal policy and production records
IMPLEMENTED / EVIDENCE: The authenticated 390px test first proves the typed but unattached compliance report stays pending. It then opens the compliance record's real Evidence dialog, selects a small text file containing synthetic-only content, retains its original bytes and generated ASSET ID, chooses the test-result role, edits the visible compliance report field to that exact ID and saves locally. The compliance missing-evidence reason clears; the deliberate incoming inspected-over-received reason remains; incoming and custody records remain byte-for-value unchanged; asset owner, metadata and bytes survive reload/reopen. The refreshed screenshot visibly shows the generated asset ID/role and original pending quantity reason with no clipping.
TEST COMMANDS + OUTPUT/COUNTS: syntax PASS; focused authenticated browser PASS; full AQL/shared regression PASS, 18 commands / 98.6s, including Q01-Q24, A-G02–A-G09, portable/import/quota/worker/release and shared-shell contracts. Zero external requests or uncaught page errors. The post-documentation browser recheck was first invoked without the documented cached `NODE_PATH` and stopped before execution; the corrected environment-backed command passed. `git diff --check` PASS. Visual evidence reviewed at output/playwright/aql-a-g04-compliance-custody-mobile.png.
VERDICT: conditional — the compliance evidence-binding slice is accepted locally. Jurisdiction/applicability remains buyer/legal input, real factory acceptance remains external and A-G04 stays conditional; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): add the smallest fail-closed laboratory-report evidence-reference guard, then attach and bind a synthetic lab asset through the visible fabric-stage workflow without changing SamplingEngine/Ac-Re, saved formats or other stage decisions.
```

### A-G05 — Pre-final/final/rework/reinspection/load/supplier QA
- [x] Prefinal readiness prerequisites and pending evidence cannot be bypassed — passing thresholds remain PENDING until all 11 checkpoints are visibly reviewed; READY FOR FINAL INSPECTION remains unlocked and Not released through reopen.
- [x] Final AQL defect/severity result matches approved plan and original engine — authenticated code F / n20 / Major Ac1-Re2 browser proof with explicit piece IDs/severity and exact reopen.
- [x] Rework/CAPA/reinspection creates linked history and never deletes prior failure — authenticated three-event browser chain, repository deep-equality checks, visible journey and exact reload/reopen.
- [ ] Loading/carton/barcode/seal/handover traceability complete where selected.
- [x] Supplier QMS critical audit failure and factory denied acknowledgement remain blocked; authenticated browser evidence proves later partial acknowledgement does not clear the Critical failure or imply VESA approval.

### A-G06 — Inspection evidence, measurements, CAPA, quality analytics
- [x] Measurement POM/tolerance/actual/units validated and reported — authenticated explicit spec/matrix/piece-reading/OOT report and exact reopen proof in `14aeb66`.
- [ ] Photos/documents and sample/lot/carton references link correctly and survive restore.
- [ ] CAPA ownership and closure verification with original finding chain.
- [ ] Quality analytics state numerator/denominator; missing data -> needs information, not fabricated result.
- [ ] Performance and accessibility for huge evidence/long records.

### A-G07 — Durable saving, portable HTML, import and offline worker
- [x] Current/legacy portable saved inspection opens and preserves all selected stages/assets — deterministic current inline-stage + attachment-byte restore and legacy migration/reopen browser proof.
- [x] Strict atomic import of project/master/sync with malice/duplicate/oversize tests — selected-file browser proof covers duplicate project bytes, duplicate/prototype-key/5 MB+ masters, both invalid sync halves, exact local-state preservation and zero external requests/page errors.
- [x] Real-byte boundary rejection at 200 MiB decoded evidence and 280 MiB selected-file limits — disposable Chromium proof records time/memory and exact-state preservation; native/mobile device recovery remains external acceptance.
- [x] Quota, blocked IndexedDB, browser close/update and partial rescue modes honestly described — quota demotion, older durable-row preservation, partial-only verification, restart resume and worker update are proven; blocked/context-denied guidance remains source-contracted.
- [x] Old AQL tab update against service worker cache deletion risk tested/fixed if reproducible — failed install, two dirty old tabs, complete cache replacement and offline saved-record reopen are covered in a disposable browser lifecycle.

### A-G07 near-limit real-byte import probe — conditional, boundary evidence accepted locally

```text
TIME / TIMEZONE: 2026-10-12 09:54 Asia/Dhaka
GATE / OBJECTIVE: A-G07 — exercise the real browser file boundary near the 200 MB decoded-evidence and 280 MB selected-file limits, with bounded timing/memory telemetry and exact-state preservation
BRANCH / BASE COMMIT: feature/tna360-continuous / f542f95
FILE-LEVEL AUDIT: Selected projects route through #projectInput -> InspectionApp.importProject -> JSON parse -> ProjectTransfer.unpack -> attachment decode/hash/stage -> setProject/repository save. The outer selected-file limit is 280 MiB and the cumulative decoded evidence limit is 200 MiB. In scope: one additive raw-Playwright test under apps/aql/tests plus this tracker and VESA_PROGRESS.md evidence. Frozen/out of scope: apps/aql/index.html, ProjectTransfer/ProjectSchema/AssetService, SamplingEngine/Ac-Re tables, saved-format versions, service workers, PPM/TNA/shared runtime and every existing browser/user record. Compatibility risk is test-host resource pressure only; use a fresh context, generated temporary files, explicit timeouts, exact before/after snapshots and cleanup in finally. Verification: real file chooser rejection just above each boundary, expected user-visible error, unchanged project/repository/master/staged-asset state, zero external requests/page errors, recorded elapsed time and Chromium heap telemetry where exposed, followed by focused/full AQL regressions and git diff --check. Rollback: revert the additive test/docs commit; there is no application, schema, cache or data migration.
FILES CHANGED (EXACT): apps/aql/tests/a-g07-large-import-boundary.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: The additive raw-Playwright test streams a genuine 200 MiB+1 zero-byte attachment into a valid VESA360-PROJECT JSON file outside the repository; its selected-file size is 279,639,315 bytes (266.68 MiB), below the 280 MiB outer cap. Chromium parsed and decoded it, then displayed the existing 200 MB evidence-limit error in 9.323 seconds focused / 8.014 seconds full run. Precise browser heap rose from about 36 MiB to 969 MiB against a 3.04 GiB reported limit; Node peak RSS was 114–117 MiB. A sparse 293,601,281-byte (280 MiB+1) file then displayed the existing outer-limit error in 185 ms focused / 26 ms full run, before parsing. After both rejections, exact serialized active project, durable project IDs, in-memory/stored masters and pending/cache asset IDs matched the baseline. Temporary files and the fresh context were removed in finally.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g07-large-import-boundary.cjs` PASS. Focused real-browser run PASS. Full 16-command AQL/shared sequence PASS in 72.1 seconds: A-G00 Q01-Q24 plus portable invariants; A-G02 through A-G06; A-G07 portable/current+legacy restore/worker update/quota rescue/atomic imports/real-byte boundaries; A-G08; A-G09; release contract; shared workspace-shell contract. Browser assertions report zero uncaught page errors and zero external requests. `git diff --check` PASS.
VERDICT: conditional — the near-limit real-byte rejection slice is accepted locally. A-G07 remains conditional for physical/native-device recovery and field acceptance; this desktop Chromium measurement is a regression data point, not a production memory SLA.
NEXT ACTION (ONE PRECISE STEP): audit the A-G04 stage/35-area coverage matrix against the blueprint and current fixtures, then add the smallest independently testable missing stage contract without changing frozen SamplingEngine/Ac-Re or saved formats.
```

### A-G07 strict atomic selected-file imports — conditional, runtime boundary hardened

```text
TIME / TIMEZONE: 2026-10-12 00:34 Asia/Dhaka
GATE / OBJECTIVE: A-G07 — reject malicious, duplicate and oversized project/master/sync selections without partially replacing active or durable local state
BRANCH / SOURCE COMMIT: feature/tna360-continuous / 8af97b8
FILE-LEVEL AUDIT: Project input routes through InspectionApp.importProject -> ProjectTransfer.unpack -> setProject. Master input routed directly to a mutating QualityOSStore.import with no file limit and silent localStorage failure. Sync unpacked/staged project assets before validating its master half. In scope: apps/aql/index.html import boundaries and apps/aql/tests/a-g07-*.cjs/release-contract.cjs. Watched/frozen: ProjectSchema, ProjectTransfer format/version, SamplingEngine/Ac-Re tables, report decisions, PPM/TNA/shared runtime, service worker and all existing browser records. Compatibility risk was limited to rejecting structurally unsafe/non-scalar/duplicate master payloads that the app itself never exports. Rollback is revert 8af97b8; no schema, cache or record migration is involved.
FILES CHANGED (EXACT): apps/aql/index.html; apps/aql/tests/a-g07-atomic-import.cjs; apps/aql/tests/a-g07-browser-restore.cjs; apps/aql/tests/release-contract.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED: QualityOSStore now validates the complete master payload into a detached copy, bounds selected files to 5 MB, total records to 10,000 and rows to 64 KB, rejects unsupported/prototype keys, nested values, unsafe/duplicate identities, and restores memory when localStorage cannot commit. Master/sync file-change handlers route failures through the existing visible error owner. Sync validates masters before unpacking project assets, caps the selected pack at 280 MB, snapshots staged asset maps and master storage, and rolls both back on rejection. Existing VESA360-PROJECT, VESA360-QUALITYOS-MASTERS and VESA360-SYNC-PACK formats/versions remain unchanged. The prior restore test now selects the exact saved-work Open action when both Continue/Open share the record identity.
TEST COMMANDS + OUTPUT/COUNTS: Focused release, portable and atomic tests PASS. Full 15-command AQL/shared sequence PASS after one evidence-selector correction: A-G00 Q01-Q24 plus portable invariants; A-G02 through A-G06; A-G07 portable/current+legacy restore/worker update/quota rescue/atomic import; A-G08; A-G09; release contract; shared workspace-shell contract. `git diff --check` PASS. Browser assertions prove zero uncaught page errors and zero external requests.
BROWSER / DATA EVIDENCE: A fresh authenticated Chromium context on a disposable local origin selected synthetic files through #projectInput, #m50-master-import and #m50-sync-import. After each rejection, exact serialized project state, sorted durable project IDs, in-memory masters, localStorage master bytes, pending asset IDs and cache asset IDs matched the baseline. No production record, approval, release, deployment, external endpoint or user browser data was touched.
VERDICT: conditional — the strict project/master/sync atomic-rejection checklist item is accepted locally. A-G07 remains conditional for near-limit real-byte attachment performance and physical/native-device recovery; those are not inferred from synthetic rejection proof.
NEXT ACTION (ONE PRECISE STEP): run a bounded real-byte attachment import boundary probe near the 200 MB embedded / 280 MB selected-file caps in a disposable browser profile, recording memory/timing and exact state preservation without changing frozen formats.
```

### A-G07 portable transfer and save-safety contract — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:24 Asia/Dhaka
GATE / OBJECTIVE: A-G07 — prove portable project decoding, attachment integrity/identity handling and degraded-storage safety boundaries before any persistence rewrite
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / da8d124 / f4b6a28
FILES CHANGED (EXACT): apps/aql/tests/a-g07-portable-safety.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, LocalRepository, ProjectTransfer, service workers, saved data and all PPM/TNA/shared files; no application/persistence source changed
IMPLEMENTED: Added fixture-only decode checks for valid/malformed embedded attachments and source guards for format/version/budget/duplicate/integrity/size validation, fresh imported identities, final-sign-off reset, quota/blocked-storage classification, cached-record preservation, explicit backup guidance and restore-as-new-draft behavior.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g07-portable-safety.cjs` PASS; `node apps/aql/tests/a-g06-evidence-analytics.cjs` PASS; `node apps/aql/tests/a-g05-readiness-rework.cjs` PASS; `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — deterministic portable/safety contracts are locally proven; complete current/legacy import, close/reopen, worker-update, rescue and real-device evidence remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then run browser close/reopen or selected-file verification for one portable inspection without clearing local data.
```
- [ ] Source extraction from 11.7MB only after verified fixture parity; no hurried whole-file rewrite.

### A-G08 — Reports, four languages, beginner copy and accessibility
- [ ] AR01–AR15 report variants validated against actual domain evidence (new ones additive).
- [ ] Bangla/Hindi/Tamil/English authored text; raw user values unchanged.
- [ ] Report screenshot/PDF review for 320px screens and print page clipping/fonts/brand.
- [ ] Real accessible controls: keyboard/zoom, focused modal, camera, save, open/report/share fallback.

### A-G08 report, language and accessibility contract — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:27 Asia/Dhaka
GATE / OBJECTIVE: A-G08 — prove report escaping/safety, supported report variants, four-language guided copy and accessibility markers before any report rewrite
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 3b2097a / e3a616e
FILES CHANGED (EXACT): apps/aql/tests/a-g08-reports-language.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, ReportComposer, SamplingEngine, ResultEngine, saved data and all PPM/TNA/shared files; no application/report source changed
IMPLEMENTED: Added fixture-only checks that report table cells escape user text, image URLs accept only supported data images, the eight report presets remain available, the 12 guided tasks retain four language label sets, raw user values stay untouched, and report preview/print/accessibility/language preference markers remain present. The existing boundary that full technical interpretation remains English is preserved and not overstated as full report translation.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g08-reports-language.cjs` PASS; `node apps/aql/tests/a-g07-portable-safety.cjs` PASS; `node apps/aql/tests/a-g06-evidence-analytics.cjs` PASS; `node apps/aql/tests/a-g05-readiness-rework.cjs` PASS; `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — deterministic report/language/accessibility contracts are locally proven; AR01-AR15 domain-backed outputs, four-language rendered reports, 320px/print review, keyboard/zoom/focus and share fallback remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then run authenticated browser report preview/print and language-switch evidence on a disposable synthetic inspection without exporting or releasing it.
```

### A-G09 — Shared data references and App Centre consistency
- [ ] Source-labeled PPM link / TNA milestone data with explicit IDs and versions.
- [ ] No PPM GO inferred from AQL; no TNA original date overwritten by inspection update.
- [ ] App Centre/login user preferences visible in SAME location and consistent across apps.

### A-G09 shared references and cross-app boundaries — conditional, no live integration claimed

```text
TIME / TIMEZONE: 2026-10-10 21:28 Asia/Dhaka
GATE / OBJECTIVE: A-G09 — prove shared catalogue/preferences and explicit PPM/TNA reference boundaries before any integration adapter is enabled
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / ec7932b / 2e86d05
FILES CHANGED (EXACT): apps/aql/tests/a-g09-cross-app-boundaries.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, js/app-catalogue.js, js/preferences.js, apps/ppm/index.html, apps/tna/index.html, saved data and all domain engines; no application/integration source changed
IMPLEMENTED: Added fixture-only checks for AQL/PPM/TNA catalogue routes, shared language preference keys/events, documented InspectionRef/ReportRef contracts, explicit authorized-lookup/no-auto-GO boundaries, separate-date preservation, offline separate-draft import and no direct PPM/TNA local-storage namespace reads from AQL.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g09-cross-app-boundaries.cjs` PASS; `node apps/aql/tests/a-g08-reports-language.cjs` PASS; `node apps/aql/tests/a-g07-portable-safety.cjs` PASS; `node apps/aql/tests/a-g06-evidence-analytics.cjs` PASS; `node apps/aql/tests/a-g05-readiness-rework.cjs` PASS; `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — local route/catalogue/preferences and non-interference contracts are proven; no server-backed PPM/TNA link, tenant authorization, source-record lookup or two-account verification is claimed.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then run authenticated cross-app route/preferences regression without applying any synthetic external record.
```
- [ ] Cross-app shared CSS/JS file impacts reviewed once, all sibling tests rerun.

### A-G10 — Server-side roles, collaboration, authorized approvals — `DEFERRED_BY_SCOPE`
- [ ] API, tenant authorization, audit, optimistic concurrency and offline queue designs.
- [ ] Real server-backed sync enabled only with authorized backend/secrets/hosting; else BLOCKED EXTERNAL.
- [ ] Never call static local login secure multiuser or local entered signature externally verified.

### A-G11 — Full code, data and visual regression gate
- [ ] Every A01–A60 requirement evidence-backed, 35 historical areas reviewed with true status.
- [ ] Q01–Q24 deterministic and browser tests pass after changes; no invalid pass.
- [ ] Login, PPM, TNA (if exists), root App Centre, uniform shell screenshots pass.
- [ ] No console errors, wrong reports, data-loss imports, broken service workers, hidden menus.
- [ ] Independent inspection-domain review, security review and real-device/field tests documented.

### A-G12 — Explicit user release gate
- [ ] User approved main deployment and exact scope after review.
- [ ] Coherent Git commit, built assets, backup, release notes and rollback identified.
- [ ] Deploy only after acceptance. Test actual website/phone flows and cache after deployment.
- [ ] Record exact live URL/commit/timestamp, unresolved external dependencies and remaining caveats.

## Coverage ledger — 60 requirements + 35 legacy areas
Each feature ID A01–A60 is initially `not-started / unverified for this rework`, even if existing baseline implements part of it. Each must carry `CURRENT-SOURCE-EVIDENCE`, `VERDICT`, `GATE`, `TEST`, `SHA`, `NOTE`. 35 original areas numbered 01–35 in doc 01 must also have `existing | partial | absent | blocked`, supported by direct code/fixture evidence and required follow-up. Do not silently shrink these registers.

### Original 35-area evidence matrix — audited 2026-10-12

`PROVEN_LOCAL` means the stated local contract has direct deterministic and/or authenticated-browser evidence. It does not mean field acceptance, provider services or the whole AQL gate is complete. `CONDITIONAL` retains the named missing proof. The validator in `apps/aql/tests/a-g04-35-area-matrix.cjs` freezes IDs, status vocabulary and evidence/gap completeness.

<!-- AQL_35_AREA_MATRIX_START -->
| ID | Area | Verdict | Current evidence | Remaining work / boundary |
|---|---|---|---|---|
| 01 | Inspection-type routing and results | PROVEN_LOCAL | `a-g04-stage.cjs`, `a-g04-stage-browser.cjs`: 13 routes, decisions and reopen | none for audited local contract |
| 02 | Fabric roll quality | PROVEN_LOCAL | roll density fixture plus authenticated roll record and defect map | none for audited local contract |
| 03 | Laboratory test records | CONDITIONAL | lab fail/pending rules, browser reopen and original-byte evidence attachment with exact generated-ID binding | broader complete stage/report review remains |
| 04 | Shade/colour management | PROVEN_LOCAL | Delta E limit/reject fixture and browser supporting register | none for audited local contract |
| 05 | Incoming material/accessory inspection | PROVEN_LOCAL | incoming identity, quantity guard, compliance/custody and reopen | none for audited local contract |
| 06 | Cutting quality | PROVEN_LOCAL | cutting field contract, browser record and material-control registers | none for audited local contract |
| 07 | Inline quality control | PROVEN_LOCAL | frequency/operation/count guards and explicit failing browser record | none for audited local contract |
| 08 | Endline quality | PROVEN_LOCAL | separate first-pass/count reconciliation and browser records | none for audited local contract |
| 09 | IPC/pilot/first production | PROVEN_LOCAL | first-output field contract and authenticated IPC parent record | none for audited local contract |
| 10 | Pre-final readiness | PROVEN_LOCAL | approved-threshold failures and visible NOT READY workspace | none for audited local contract |
| 11 | 100% screening/rework | PROVEN_LOCAL | authenticated one-piece target, repair/recheck/disposition and linked reinspection history | none for audited local contract |
| 12 | Final readiness | PROVEN_LOCAL | authenticated Final stage records ready percentages but remains PENDING and unlocked while original engine approvals are unresolved | none for audited local blocking contract |
| 13 | Loading supervision | CONDITIONAL | authenticated exact-byte before/after owned photos, reconciled carton/piece counts, retained seal/handover and exact reopen | barcode/device evidence and approved carton-randomization policy remain |
| 14 | Production monitoring | PROVEN_LOCAL | output/balance guards and authenticated monitor reopen | none for audited local contract |
| 15 | Supplier audit / QMS | PROVEN_LOCAL | critical finding cannot pass and coherent browser NOT CONFORMED decision | none for audited local contract |
| 16 | Master data | PROVEN_LOCAL | `a-g07-atomic-import.cjs`: bounded sanitized atomic master import | none for audited local contract |
| 17 | Buyer profiles / instructions | CONDITIONAL | plan provenance plus versioned compliance/manual reference fields | approved real buyer instruction/evidence fixture remains |
| 18 | Order journey | PROVEN_LOCAL | linked parent/child browser proof and visible journey IDs/results | none for audited local contract |
| 19 | CAPA | PROVEN_LOCAL | authenticated retained finding → verified CAPA → rework → reinspection chain with exact reopen | none for audited local contract |
| 20 | Sync packs | PROVEN_LOCAL | strict two-half validation, rollback and selected-file rejection | none for audited local contract |
| 21 | Offline names/signatures vs roles | PROVEN_LOCAL | local-login limitation and non-authenticated signature language are explicit | secure provider identity is outside local scope |
| 22 | Competency / training | PROVEN_LOCAL | authenticated create/edit/save/reload/reopen, exact inspector/stage assignment warning and fail-closed expiry; copy remains explicit local aid/not accreditation | none for audited local contract |
| 23 | Equipment/calibration | PROVEN_LOCAL | expired calibration produces a confirmed browser failure and reopens | none for audited local contract |
| 24 | Needle/metal control | PROVEN_LOCAL | containment pending and challenge failure browser records reopen | none for audited local contract |
| 25 | Compliance / destination rules | CONDITIONAL | versioned reference fields plus visible original-byte attachment and exact generated-asset binding/reopen | buyer/legal jurisdiction and applicability review remain |
| 26 | Packing & barcode | CONDITIONAL | packing reconciliation/duplicate/range source guards | approved carton randomization, barcode and browser evidence remain |
| 27 | Sample custody | PROVEN_LOCAL | sealed sample, recipient/date/location/return/reference reopen exactly | none for audited local contract |
| 28 | Factory acknowledgement | PROVEN_LOCAL | authenticated denied-receipt pending guard, visible partial-response edit, explicit no-VESA-approval wording and exact save/reload/reopen | none for audited local contract |
| 29 | Analytics dashboards | CONDITIONAL | numerator/source-basis and missing-denominator contracts pass | authenticated dashboard and large-record usability remain |
| 30 | Counting-basis analytics | PROVEN_LOCAL | Q10 highest-severity versus each-defect basis and denominator guards | none for audited local contract |
| 31 | Stage reports | CONDITIONAL | escaped stage report composition and rendered generic A4 evidence | complete stage/report catalogue, print and sandbox review remain |
| 32 | Friendly menu/copy | PROVEN_LOCAL | A-G02 workflow plus four-language guidance and responsive shell evidence | none for audited local contract |
| 33 | Native wrappers | DEFERRED_BY_SCOPE | Free-only contract keeps optional signed APK/Windows packages outside active scope | revisit only after explicit request and free local tooling proof |
| 34 | Regression tests | PROVEN_LOCAL | Q01-Q24 plus A-G02–A-G09, browser, import, worker and shell suites | continue rerunning after affected patches |
| 35 | Real factory pilot | BLOCKED_EXTERNAL | no synthetic test is represented as factory acceptance | requires user-arranged physical-device and real-factory review |
<!-- AQL_35_AREA_MATRIX_END -->

### Suggested progress table format
```text
ID | EXISTING EVIDENCE | REQUIRED REWORK | STATUS | TEST OR SCREENSHOT | COMMIT
A01 | current home flow | uniform novice actions | not-started | — | —
...
A60 | factory pilot not supplied | field acceptance | blocked external | — | —
```

## Minimum automation suite (run after affected groups)
- [x] Current `node apps/aql/tests/release-contract.cjs` remains green (is not sole proof).
- [x] New sampling fixture tests exercise all actual supported/unsupported table paths.
- [ ] Browser flows 6-step plus 13-stage and saved/reopen/reinspection.
- [ ] Existing PPM `node apps/ppm/tests/regression.cjs`, `planning.cjs`, `update.cjs` when shared platform changes.
- [ ] App Centre/login/admin, theme+language persistence and security limitations reconfirmed.
- [ ] Mobile/tablet/desktop screenshots, scroll/menu overlay checks and report exports.
- [ ] No destructive local record cleanup; explicit rollback proof.

## Append-only patch journal
```text
TIME/TIMEZONE:
GATE / OBJECTIVE:
BEFORE SHA / AFTER SHA / BRANCH:
EXACT MODIFIED FILES:
FROZEN/WATCHED PATHS VERIFIED:
SAMPLING / COUNTING / SCHEMA IMPACT:
SYNTHETIC FIXTURES / EXECUTED TESTS (COMMAND + RESULT):
BROWSER SCREENSHOT/REPORT EVIDENCE PATHS:
FEATURE IDs AND 35-AREA ITEMS REVIEWED:
OPEN RISKS / BLOCKED EXTERNAL SERVICE:
REVIEWER / VERDICT: draft-only | accepted | conditional | blocked | rejected
NEXT ACTION (specific and limited):
```

## Session resume command text
> Resume VESA AQL Quality Centre 360 from real repository HEAD and `apps/aql/AGENTS.md` + `docs/aql/06_EXECUTION_TRACKER.md`. Reconcile prior gates against actual passing fixtures and browser output. Then implement next incomplete safe group; keep all existing sampling/Ac-Re/inspection/reinspection/export behavior frozen unless independently verified and approved. Maintain the same VESA-UNIFORM-UI-v1 shell as PPM/TNA. Record tests and exact NEXT ACTION; commit passing work; never deploy without explicit user approval.

## Current audit — A-G00 (2026-10-10, Asia/Dhaka)

This is an audit-only checkpoint; no AQL source, worker, shared platform file, sampling table or test file was changed.

- Repository evidence: root `F:/download temp browser/vesahost-release-work`, branch `feature/tna360-continuous`, clean tree before this tracker entry, HEAD `bda6836`, Node `v24.13.1`, npm `11.8.0`. The continuous feature branch is preserved; no AQL-only branch or source rewrite was created.
- File ownership and lifecycle: `apps/aql/index.html` is the single-page owner containing the UI, `SamplingEngine`, `ResultEngine`, `InspectionApp`, `LocalRepository`/`ProjectStore` adapters, embedded report/asset logic, stage catalog and the release/UI shim; `apps/aql/service-worker.js` owns the scoped cache and offline fetch path; `apps/aql/tests/release-contract.cjs` owns the current static contract checks; `js/auth.js` and `js/preferences.js` own browser auth/preferences; root `service-worker.js` excludes AQL and PPM from the root cache. `AQL_RELEASE_STATUS.md`, `GAP_MATRIX.md`, and `apps/aql/ENGINEERING.md` are historical/release-boundary evidence, not replacements for current tests.
- Frozen/in-scope paths: `apps/aql/index.html`, `apps/aql/service-worker.js`, `apps/aql/tests/release-contract.cjs`, root `service-worker.js`, `js/auth.js`, `js/preferences.js`, and the source-derived sampling/decision output. Watched compatibility paths: `/login/`, `/apps/`, `/admin/`, `/apps/ppm/`, `/apps/tna/`, and shared preference/cache contracts. Rollback posture: revert the future A-G00 fixture-only commit; never clear IndexedDB/localStorage or alter numeric tables as an audit repair.
- Baseline contract: `node apps/aql/tests/release-contract.cjs` — **PASS** (`AQL release contract checks passed`). The test validates the release patch marker, Home/File/Edit/View/Tools/Help menu, plain-language save/report actions, EN/BN/HI/TA guidance labels, practice isolation, import hardening, scoped worker cache and root worker exclusions.
- Browser baseline: Playwright CLI `0.1.22` against a disposable local server with documented demo account `admin@vesa` / `vesa`. The live page exposed `InspectionApp.STEPS.length = 6`, `StageCatalog.stages` count `13`, `SamplingEngine`, `ResultEngine` and `LocalRepository`. A synthetic Final Random Inspection was created with buyer/factory/inspector/order values; `saveNow()` persisted one repository row and `backup()` completed with `VE-20261010-785ED6-R0.vesaproj`. Screenshots: `output/playwright/aql-ag00-desktop-home.png`, `aql-ag00-mobile-home-390.png`, `aql-ag00-mobile-home-320.png`, `aql-ag00-desktop-editor.png`, `aql-ag00-tablet-editor-768.png`, `aql-ag00-mobile-editor-320.png`. Console query: `Errors: 0, Warnings: 0`. Visual inspection confirms the current single sticky/desktop shell plus mobile bottom navigation; this is baseline evidence, not uniform-shell acceptance.
- Source-derived sampling snapshot captured in browser at HEAD `bda6836`: codes `A B C D E F G H J K L M N P Q R`; sizes `2,3,5,8,13,20,32,50,80,125,200,315,500,800,1250,2000`; 15 lot brackets ending with `Infinity -> R`; levels `S-1,S-2,S-3,S-4,I,II,III`; AQLs `0.65,1.0,1.5,2.5,4.0,6.5`; complete `SamplingEngine.AC` map including deliberate `null` unsupported cells. Empty-project `ResultEngine.evaluate` returned `PENDING` with 20 explicit pending reasons, no failures, and no accepted result. Numeric behavior remains frozen and unmodified.
- Missing prerequisite: the repository contains the Q01–Q24 requirement matrix in `docs/aql/03_ENGINE_RULES_COMPATIBILITY.md`, but no checked-in Q01–Q24 executable fixture set/runner. The current release contract is not numeric parity proof and does not cover portable reopen/reinspection or every AQL cell. Exact fixture capture and a deterministic runner are therefore still open.
- Verdict: **BLOCKED — BASELINE FIXTURE PREREQUISITE** for A-G00 acceptance. The local static contract and browser baseline are proven, but AQL rework must not begin until the frozen source-derived fixture and Q01–Q24 cases are committed and pass.

### A-G00 worklog entry

```text
TIME / TIMEZONE: 2026-10-10 19:52 Asia/Dhaka
GATE / OBJECTIVE: A-G00 — source audit, frozen numerical/portable baseline
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / bda6836 / pending tracker commit
FILES CHANGED (EXACT): docs/aql/06_EXECUTION_TRACKER.md only; output/playwright/aql-ag00-*.png and .vesaproj are ignored local evidence
FILES WATCHED/FROZEN (DIFF CHECK): apps/aql/index.html, apps/aql/service-worker.js, apps/aql/tests/release-contract.cjs, root service-worker.js, js/auth.js, js/preferences.js; no source diff
DOMAIN/SCHEMA CHANGE & MIGRATION: none; sampling/Ac-Re tables untouched
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/release-contract.cjs` PASS; browser source capture = 16 codes, 16 sample sizes, 15 lot brackets, 7 levels, 6 AQLs, complete AC map; six-step/13-stage, local save and portable download verified
BROWSER SCREENSHOTS / REPORT PATHS: output/playwright/aql-ag00-desktop-home.png; aql-ag00-mobile-home-390.png; aql-ag00-mobile-home-320.png; aql-ag00-desktop-editor.png; aql-ag00-tablet-editor-768.png; aql-ag00-mobile-editor-320.png; console Errors 0 Warnings 0
EVIDENCE FOR FEATURE IDs: A-G00 audit only; A01–A60 and 35-area matrix remain not-started/unverified for rework
BLOCKERS / UNRESOLVED RISK: no checked-in Q01–Q24 executable fixtures/runner; release contract is not numeric parity or portable-reopen proof; real provider/pilot remains external
REVIEWER / VERDICT (accepted|conditional|blocked|rejected|draft-only): blocked
NEXT ACTION (ONE PRECISE STEP): add a fixture-only deterministic runner from current source without changing sampling behavior, cover Q01–Q24 and portable round-trip, then rerun A-G00
```

### A-G00 deterministic baseline runner acceptance

```text
TIME / TIMEZONE: 2026-10-10 20:18 Asia/Dhaka
GATE / OBJECTIVE: A-G00 — freeze the current AQL numerical, decision and portable baseline before any rework
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 5956a8b / 53e52e3
FILES CHANGED (EXACT): apps/aql/tests/a-g00-baseline.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN (DIFF CHECK): apps/aql/index.html, apps/aql/service-worker.js, root service-worker.js, js/auth.js, js/preferences.js; no application source, sampling table or worker change
DOMAIN/SCHEMA CHANGE & MIGRATION: none; runner extracts the shipped pure owners at test time and keeps all numeric cells, Ac/Re rules, identities and saved data unchanged
FIXTURE COVERAGE: Q01 exact codes/sizes/lot bands/levels/AQL/Ac map; Q02 null cells and unavailable plan; Q03 boundary lots; Q04 invalid quantities; Q05 missing group; Q06 allocation remainder; Q07 checked shortfall; Q08 critical policy; Q09 Ac/Re boundaries; Q10 defective-piece basis; Q11 duplicate identity; Q12 fabric arithmetic; Q13 required test pending; Q14 retained CAPA/reinspection; Q15 acknowledgement/audit guards; Q16 malformed portable/sync rejection contracts; Q17 size limits; Q18 save rescue; Q19 worker upgrade; Q20 Pass/Fail/Pending reports; Q21 reproducible no-replacement selection under fixed entropy; Q22 missing denominator; Q23 long multilingual note round-trip; Q24 UI/semantic parity
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g00-baseline.cjs` PASS — Q01 through Q24 PASS; `AQL A-G00 deterministic baseline passed: 24/24 fixtures plus portable round-trip invariants`; `node apps/aql/tests/release-contract.cjs` PASS — `AQL release contract checks passed`
BROWSER SCREENSHOTS / REPORT PATHS: reused baseline evidence `output/playwright/aql-ag00-desktop-home.png`, `aql-ag00-mobile-home-390.png`, `aql-ag00-mobile-home-320.png`, `aql-ag00-desktop-editor.png`, `aql-ag00-tablet-editor-768.png`, `aql-ag00-mobile-editor-320.png`; console Errors 0 Warnings 0; browser baseline also saved one local record and downloaded `.vesaproj`
EVIDENCE FOR FEATURE IDs: A-G00 sampling/decision/portable baseline; Q01–Q24 runner is committed; A01–A60 and 35-area matrix remain not-started/unverified for rework
BLOCKERS / UNRESOLVED RISK: browser close/reopen/reinspection remains a later acceptance gate; server-side identity/tenant store, cloud database, notices, provider credentials and real factory pilot remain external; PPM Playwright dependency remains unresolved
REVIEWER / VERDICT (accepted|conditional|blocked|rejected|draft-only): accepted locally — no production deploy or provider approval claimed
NEXT ACTION (ONE PRECISE STEP): begin A-G01 shared VESA-UNIFORM-UI-v1 reconciliation using the already captured root/App Centre/PPM/TNA route evidence; keep AQL sampling and ResultEngine output frozen
```

### A-G01 shell audit — conditional, implementation not yet accepted

```text
TIME / TIMEZONE: 2026-10-10 20:29 Asia/Dhaka
GATE / OBJECTIVE: A-G01 — compare one VESA-UNIFORM-UI-v1 shell against real AQL, PPM and TNA routes before a platform-owned change
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / d05caf1 / 95dc754
FILES CHANGED (EXACT): docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md; browser evidence under output/playwright/ (ignored)
FILES WATCHED/FROZEN: apps/aql/index.html, apps/aql/service-worker.js, apps/ppm/*, apps/tna/*, css/style.css, js/auth.js, js/preferences.js, js/app-catalogue.js; no source change in this audit
LIVE GEOMETRY AT 1280-PROBE: AQL editor = authenticated sticky bar 73px + sidebar sticky top 0px + app topbar sticky top 73px / 76px + `#aqlReleaseMenu` sticky top 149px / 52px; PPM editor = authenticated sticky bar 73px + app `.topbar` sticky + `#fileMenu` sticky top 138px / 54px + dashboard + `.section-nav-wrap` sticky + `.left-rail` sticky + fixed footer; TNA = authenticated sticky bar 73px + `.tna-commandbar` sticky top 73px / 58px. This violates the one-sticky-navigation-region contract even though all three routes rendered.
TEST COMMANDS + OUTPUT/COUNTS: Playwright CLI against `http://127.0.0.1:4173`: authenticated AQL/PPM/TNA navigation PASS; console errors/warnings 0 on each route; screenshots captured at 1280 and 390 widths. PPM editor retained 168 checkpoint surface; no data reset was performed.
BROWSER SCREENSHOTS / REPORT PATHS: `output/playwright/a-g01-aql-home-1280.png`, `a-g01-aql-editor-1280.png`, `a-g01-aql-home-390.png`, `a-g01-ppm-editor-1280.png`, `a-g01-ppm-home-390.png`, `a-g01-tna-home-1280.png`, `a-g01-tna-home-390.png`; one earlier AQL/PPM home screenshot was overwritten by the corrected named capture, no production artifacts added
FROZEN BUSINESS RULES / ROLLBACK: no sampling, ResultEngine, 168 checkpoint identity, TNA dates, local records, auth or worker code may change in the platform patch; rollback is revert of the future shared-shell commit, with app-specific menus restored only after browser proof
VERDICT: conditional — route and visual audit complete, but A-G01 is not accepted because the shared shell does not yet exist and PPM’s committed browser suites still cannot resolve `playwright`
NEXT ACTION (ONE PRECISE STEP): define and implement one platform-owned shell contract/adapter patch (`css/vesa-workspace.css` plus `js/vesa-workspace-shell.js` only if direct source audit proves the insertion points), then run source checks plus authenticated AQL/PPM/TNA desktop/mobile geometry and cross-app regression before changing any app menu

### A-G01 platform contract — conditional, adapter not yet accepted

```text
SCOPE / FROZEN RULES:
The platform owns only the descriptor-driven shell contract, shared semantic tokens, universal menu order, save-state vocabulary and measured shell height. AQL sampling, `ResultEngine`, inspection records, reports, PPM checkpoint identities and TNA scheduling remain untouched. The platform asset must not branch on an exact app id or write application records.

FILES CHANGED:
`css/vesa-workspace.css`, `js/vesa-workspace-shell.js`, `tests/vesa-workspace-shell-contract.cjs`, and script/style registration in `apps/aql/index.html`, `apps/ppm/index.html`, `apps/tna/index.html`.

BRANCH / BEFORE SHA / AFTER SHA:
`feature/tna360-continuous` / `53a1ee2` / `51d10ec`

EVIDENCE:
`node --check js/vesa-workspace-shell.js`; `node tests/vesa-workspace-shell-contract.cjs`; `node apps/aql/tests/a-g00-baseline.cjs` (Q01–Q24 plus portable round-trip invariants); `node apps/aql/tests/release-contract.cjs`; `git diff --check` all passed. Authenticated Playwright CLI smoke against a disposable local server loaded `/apps/aql/`, `/apps/ppm/` and `/apps/tna/` with zero console errors; requested shared CSS/JS assets returned successfully. No shell adapter was mounted, so the competing existing regions remain and A-G01 is not accepted.

VERDICT:
CONDITIONAL — platform contract is loadable and tested, but visible one-region parity still requires the AQL adapter and then sibling adapter/regression work.

NEXT ACTION (ONE PRECISE STEP): adapt AQL's existing `Home/File/Edit/View/Tools/Help` callbacks to the neutral shell, preserve old routes/state, hide only the redundant AQL chrome after callback wiring is proven, and capture 390/1280 geometry plus console/focus evidence.
```

### A-G01 AQL adapter — conditional, sibling adapters remain

```text
SCOPE / FROZEN RULES:
Use the platform shell for AQL's existing menu callbacks only. Keep AQL's six-step navigation, inspection state, sampling/Ac-Re decisions, reports and service worker behavior unchanged. The AQL sidebar and content title remain available as non-sticky app content; only competing sticky/global menu regions are demoted or removed.

FILES CHANGED:
`apps/aql/index.html` only.

BRANCH / BEFORE SHA / AFTER SHA:
`feature/tna360-continuous` / `01e9d77` / `ff1ae17`

EVIDENCE:
`node tests/vesa-workspace-shell-contract.cjs`; `node apps/aql/tests/a-g00-baseline.cjs` (Q01–Q24 plus portable round-trip invariants); `node apps/aql/tests/release-contract.cjs`; `git diff --check` passed. Authenticated Playwright CLI smoke against the disposable local server verified the shared banner and six menu buttons, File callback opened the existing AQL dialog, desktop geometry reported one sticky `.vesa-workspace` at 64px while the auth bar/sidebar/topbar were non-sticky and `#aqlReleaseMenu` was absent, and the 390px probe reported overflow false with the shared Menu drawer opening Home/File/Edit/View/Tools/Help. Console errors were 0.

VERDICT:
CONDITIONAL — AQL adapter is locally verified, but A-G01 cannot be accepted until PPM and TNA use the same shared shell and the cross-app matrix passes. PPM's existing browser suites remain blocked by missing `playwright`.

NEXT ACTION (ONE PRECISE STEP): record the cross-app acceptance evidence below, then begin A-G02 AQL workflow parity without altering frozen sampling/decision rules.
```

### A-G01 final shared acceptance — accepted locally, not deployed

```text
BRANCH / ACCEPTED SHA: `feature/tna360-continuous` / `bb431ae` (app adapters; platform contract `51d10ec`; ledger reconciliation follows)

ACCEPTANCE EVIDENCE:
Node: shell contract, TNA G01–G09 suite, AQL A-G00 Q01–Q24 plus portable invariants, AQL release contract, syntax checks for AQL/PPM/TNA and `git diff --check` all passed. PPM `regression.cjs` remains an explicit environment blocker at `Cannot find module 'playwright'` and is not represented as passed.

Authenticated Playwright CLI matrix against a disposable local server: at 1280px AQL, PPM and TNA each reported `scrollWidth <= innerWidth`; AQL/PPM/TNA reported exactly one sticky/fixed element, `.vesa-workspace`; PPM rendered 168 `.checkpoint` elements; TNA had no `.tna-commandbar`. At 390px all three reported overflow false, six shared menu items, mobile Menu open, focus returned to Home, and console errors/warnings 0. File callbacks opened existing AQL, PPM and TNA dialogs. Root homepage console errors were 0; unauthenticated `/apps/` and `/admin/` preserved login redirects.

VERDICT: ACCEPTED LOCALLY — A-G01 shell and sibling adapter contract are proven in the current feature branch. This does not accept PPM P-G00, secure backend services or production release authorization.

NEXT ACTION (ONE PRECISE STEP): begin A-G02 AQL workflow parity audit, starting with New/Continue/Open Saved/Practice/Open Saved Copy and the six-step novice/expert flow; do not alter frozen sampling/decision rules.
```

### A-G02 workflow parity — accepted locally, not deployed

```text
TIME / TIMEZONE: 2026-10-10 20:43 Asia/Dhaka
GATE / OBJECTIVE: A-G02 — make the AQL home actions and beginner six-step path real without changing inspection policy
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 0ccd0db / 9608914
FILES CHANGED (EXACT): apps/aql/index.html; apps/aql/tests/a-g02-workflow.cjs; css/vesa-workspace.css
FROZEN/WATCHED PATHS VERIFIED: SamplingEngine codes, sizes, lot bands, levels and AC/null cells; ResultEngine, StageCatalog, ProjectSchema, service worker, PPM 168 checkpoints, TNA scheduling and local saved records were not rewritten. The safe-area correction only fixes left/right inset order in the shared shell.
IMPLEMENTED: additive AQL_G02 workflow adapter adds explicit New Inspection, Continue Last, Open Saved, Practice Example and Open Saved Copy home actions; a local saved-record chooser; Continue Last selection by latest saved timestamp; editable-copy lineage with a new identity, unlocked draft state and cleared sign-off/release approvals; practice copies remain under PRACTICE identity; and a six-step “What should I check next?” guide for the standard workflow. Existing 13-stage paths are excluded from the guide and remain visible through StageWorkspace/Tools.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g02-workflow.cjs` PASS; all six inline AQL scripts parsed with `vm.Script`; `node apps/aql/tests/release-contract.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS — Q01-Q24 plus portable invariants; `node tests/vesa-workspace-shell-contract.cjs` PASS; all TNA G01-G09 tests PASS; `git diff --check` PASS.
BROWSER / DATA EVIDENCE: Authenticated Playwright CLI against disposable `http://127.0.0.1:4173`: Home exposed New Inspection, Continue Last, Open Saved, Practice Example and Open Saved Copy; Open Saved showed the empty-state chooser; Practice showed the fictional banner and six-step guide; Continue Last reopened the saved practice record; File → Make Another Copy produced a new `PRACTICE-*` identity with `parentId`, separate report ID, unlocked review draft and original retained; Open Saved Copy uploaded `.playwright-cli/VE-20261010-785ED6-R0.vesaproj` and opened a non-practice imported draft; Start stage inspection displayed all 13 stage options. Editor guide viewport checks at 320, 360, 390, 768, 1024, 1280 and 1440 each reported overflow false; the 1440 probe also reported `.vesa-workspace` sticky and the 1280/390 shared-shell matrix remains clean. Mobile 390 shared Menu opened six items, focus returned to Home, and console errors/warnings were 0. Browser and local server were closed; no repository/browser user data was cleared.
FEATURE IDs / AREAS: A01, A42, A44 and A59 source-level workflow handling; AQL six-step/13-stage route compatibility reviewed. Browser acceptance is proven locally; full device-level field acceptance remains later.
BLOCKERS / UNRESOLVED RISK: PPM baseline still lacks resolvable Node `playwright`; secure provider services, credentials, physical pilot and production authorization remain external blockers. Full device-level field acceptance remains later.
REVIEWER / VERDICT: accepted locally — no production deploy or provider approval claimed.
NEXT ACTION (ONE PRECISE STEP): begin A-G03 comprehensive sampling/counting/lot-plan audit; keep `SamplingEngine`, Ac/Re/null-cell behavior and Q01-Q24 fixtures unchanged until any policy-impact change has separate approval.
```

### A-G03 sampling and provenance audit slice — conditional, policy unchanged

```text
TIME / TIMEZONE: 2026-10-10 20:47 Asia/Dhaka
GATE / OBJECTIVE: A-G03 — verify frozen sampling boundaries, unsupported cells, allocation guards and plan provenance without changing inspection policy
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 1f4193b / 9d489a0
FILES CHANGED (EXACT): apps/aql/tests/a-g03-sampling.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html SamplingEngine, AllocationEngine, ResultEngine, PlanApproval and all inspection records; no application/domain source or numeric table changed
IMPLEMENTED: fixture-only VM contract extracts shipped pure owners and checks every frozen code/level/AQL/sample array, all 15 lot bands and transitions, null-cell unsupported behavior, largest-remainder allocation and oversize guards, required plan reviewer/source/edition/revision approval, deterministic signature/timestamp and visible timing/provenance fields. A-G00 Q01-Q11 remains the decision/counting evidence; no carton-randomization policy was invented.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g03-sampling.cjs` PASS; `git diff --check` PASS. Prior accepted A-G00 Q01-Q24, AQL release, shared-shell and TNA suites remain green.
BROWSER / DATA EVIDENCE: No new browser or saved-record mutation was performed for this fixture-only slice. The A-G02 browser run already proved the shared responsive shell; the separate A-G03 entry-point/dialog review is recorded below.
BLOCKERS / UNRESOLVED RISK: carton-randomization requirements/fixtures are not approved; no licensed standards claim is made; PPM Playwright dependency, secure provider services, physical pilot and production authorization remain external blockers.
REVIEWER / VERDICT: conditional — frozen numerical/provenance contract is tested locally, but A-G03 comprehensive acceptance requires approved carton-randomization requirements/fixtures and browser field review.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture and run reproducible seeded carton-selection evidence; do not modify SamplingEngine cells meanwhile.
```

### A-G03 browser field review — conditional, no policy or release data change

```text
TIME / TIMEZONE: 2026-10-10 20:51 Asia/Dhaka
GATE / OBJECTIVE: A-G03 — confirm the live AQL setup exposes stage choice and honest missing-plan/timing guards
EVIDENCE: Authenticated Playwright CLI against disposable `http://127.0.0.1:4173` created a synthetic local Final Random Inspection draft with buyer/factory/inspector/PO labels. The live setup exposed all 13 inspection stages, showed `Verify the actual per-lot sample, Ac/Re and counting basis; approve its source in Sampling authorisation.` and `Finish the inspection session before final review, or document actual manual timing in the scope.` in Decision review, and retained the pending result rather than passing an unapproved plan. After a fresh reload, the console query returned Errors 0 / Warnings 0.
LIMITATION: The approved carton-randomization requirements/fixtures are still unavailable, so the fixture/source contract remains the primary A-G03 proof. Browser and disposable server were closed without clearing browser data; the synthetic draft was not exported or released.
VERDICT: conditional — live pending guards, 13-stage choice and direct Sampling authorisation dialog entry/field visibility are proven; approved carton-randomization requirements/fixtures remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture and run reproducible seeded carton-selection evidence; keep SamplingEngine cells frozen.
```

### A-G03 visible Sampling authorisation entry point — conditional, policy unchanged

```text
TIME / TIMEZONE: 2026-10-10 20:58 Asia/Dhaka
GATE / OBJECTIVE: A-G03 — expose and verify a stable live entry point for plan provenance before approval
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / e7aff20 / af5b49a
FILES CHANGED (EXACT): apps/aql/index.html; apps/aql/tests/a-g03-sampling.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FROZEN BUSINESS RULES: SamplingEngine, AllocationEngine, ResultEngine, PlanApproval numeric cells, inspection records and saved browser data were not changed; no approval was submitted.
IMPLEMENTED: Added visible `Sampling authorisation` actions to the Setup buyer-criteria panel and Sampling Plan heading, with a source assertion in the fixture-only A-G03 contract test.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
BROWSER / DATA EVIDENCE: Authenticated Playwright CLI against disposable `http://127.0.0.1:4173` opened Samples 02 / PLAN for a synthetic local Final Random Inspection draft. The page showed visible `Sampling authorisation` actions in the heading and Insight/coverage card; the dialog showed lot/code/sample and Ac/Re/source columns plus Standard / buyer table name, Edition / revision, Approved table / instruction source, Project sampling criteria reference, Reviewer who verified each plan, verification checkbox and Approve plan. Console query returned Errors 0 / Warnings 0. No approval was submitted, no browser data was cleared, and the synthetic draft was not exported or released; browser and disposable server were closed.
VERDICT: conditional — stable entry point and provenance fields are locally proven; approved carton-randomization requirements/fixtures remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture and test reproducible seed/date/operator/packing-list-version evidence without changing frozen SamplingEngine cells.
```

### A-G04 stage workflow contract and browser slice — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:06 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove the existing stage catalog and material/production workflow guards before any domain rewrite
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / b0eaed5 / fe56432
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, SamplingEngine, ResultEngine, stage records, saved data and all PPM/TNA/shared files; no application/domain source changed
IMPLEMENTED: Added a fixture-only VM contract for the 13 StageCatalog entries, their main modules and pending-first checklists; incoming/roll/shade/lab/IPC/cutting/inline/endline/readiness/monitor field definitions; clean record evaluation; inline and endline reconciliation; fabric density, shade tolerance, laboratory, readiness and production-balance guards; clean conforming and explicit failed-checkpoint stage decisions; unsupported-stage rejection; and required stage workspace source markers.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
BROWSER / DATA EVIDENCE: Authenticated Playwright CLI against disposable `http://127.0.0.1:4174` created a synthetic local Fabric Roll Inspection draft. The stage selector exposed all 13 stages; the rendered workspace showed `Fabric Roll Inspection`, the stage-native six-step navigation, five named fabric checkpoints, `Fabric rolls` stage register, pending decision reasons and an actionable `Complete stage criteria` next step. Console Errors 0 / Warnings 0. No record was exported, released or approved; browser and disposable server were closed without clearing data.
VERDICT: conditional — the existing stage catalog, pure guards and one representative browser stage are proven locally; full A-G04 35-area evidence, every material/production stage and field-device review remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then extend A-G04 with the next representative stage-record fixture without changing frozen AQL tables.
```

### A-G04 stage decision extension — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:11 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — extend fixture coverage from field metadata to clean/failing stage decisions
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 2aa4dc6 / bbaf38b
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FROZEN BUSINESS RULES: no `apps/aql/index.html` source, SamplingEngine cell, Ac/Re rule, saved record or shared/sibling file changed
IMPLEMENTED: Added deterministic contract cases for shade Delta E failure, clean inline and incoming stages reaching CONFORMED, a failed checkpoint remaining NOT CONFORMED, a clean fabric stage retaining ACCEPT, metal challenge failure and needle containment pending; existing A-G04 material/production record guards remain covered.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — decision-guard coverage is locally proven, but full A-G04 35-area/stage matrix and field-device review remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then cover the next untested stage-specific record without changing frozen AQL tables.
```

### A-G07 current/legacy selected-file restore — conditional, application source unchanged

```text
TIME / TIMEZONE: 2026-10-12 00:15 Asia/Dhaka
GATE / OBJECTIVE: A-G07 — prove current and legacy saved-copy restore through the real file chooser, including selected stage state, evidence bytes, safe identity/approval reset, non-destructive local persistence and reload/reopen
BRANCH / SOURCE HEAD: feature/tna360-continuous / 3239ca4
FILES CHANGED (EXACT): apps/aql/tests/a-g07-browser-restore.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, ProjectTransfer, ProjectSchema, SamplingEngine, saved-format version, service worker, PPM/TNA/shared files and production browser data; no application/domain source or existing record was changed
IMPLEMENTED: Added a reproducible raw-Playwright browser contract using a fresh isolated context and temporary fictional files. A current-format project with an explicit inline stage record and text evidence was selected through the app file chooser; the imported draft retained buyer/factory/order/finding/measurement/stage data and exact evidence bytes while remapping the attachment identity, assigning a fresh project identity, retaining source lineage, unlocking the draft, clearing scope/plan/measurement/review approvals and resetting disposition to Not released. A synthetic legacy file was then selected through the same UI; mapped buyer/factory/order/finding/measurement/check/CAPA data, migration warnings, full legacyArchive and historical source audit were retained in a separate draft. All earlier local record IDs survived both imports. After reload, Open Saved + keyboard Enter reopened the exact migrated identity with its archived legacy source and Not released state intact.
TEST COMMANDS + OUTPUT/COUNTS: Focused `node apps/aql/tests/a-g07-browser-restore.cjs` PASS after the final fixture extension. Full sequence PASS without retry: `a-g00-baseline.cjs` (Q01-Q24 plus portable invariants), `a-g02-workflow.cjs`, `a-g03-sampling.cjs`, `a-g04-stage.cjs`, `a-g05-readiness-rework.cjs`, `a-g06-evidence-analytics.cjs`, `a-g07-portable-safety.cjs`, `a-g07-browser-restore.cjs`, `a-g08-reports-language.cjs`, `a-g09-cross-app-boundaries.cjs`, `release-contract.cjs`, `tests/vesa-workspace-shell-contract.cjs`; `git diff --check` PASS. Browser assertions also proved zero uncaught page errors and zero external requests.
BROWSER / DATA EVIDENCE: Disposable HTTP server and Chromium context only; temporary `.vesaproj`/`.aqlproj` fixtures were removed in `finally`. No repository/browser user data was cleared, no production record was opened, and no approval, release, external export or network request occurred.
LIMITATIONS / UNRESOLVED RISK: This accepts the current/legacy selected-stage/asset restore subcheck, not the complete A-G07 gate. Strict import guards have deterministic source/fixture coverage, but service-worker old-tab update/cache deletion, forced quota/rescue across a browser restart, very large real attachments and real-device recovery remain open.
REVIEWER / VERDICT: conditional — the selected-file restore/reload slice is accepted locally and repeatable; A-G07 remains conditional for its remaining worker/rescue/device evidence.
NEXT ACTION (ONE PRECISE STEP): audit the AQL old-tab/service-worker cache-update risk in disposable browser contexts and add a reproducible test without clearing user records or changing SamplingEngine/saved-format contracts.
```

### A-G07 service-worker old-tab lifecycle — conditional, worker source unchanged

```text
TIME / TIMEZONE: 2026-10-12 00:21 Asia/Dhaka
GATE / OBJECTIVE: A-G07 — determine whether current AQL cache cleanup strands open tabs or loses unsaved/saved work, including incomplete installation and offline reopen
BRANCH / SOURCE HEAD: feature/tna360-continuous / c8f9f45
FILES CHANGED (EXACT): apps/aql/tests/a-g07-worker-update.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/service-worker.js, apps/aql/index.html, all IndexedDB records, saved formats, SamplingEngine, PPM/TNA/shared files and production browser data; no application, worker or domain source changed
IMPLEMENTED: Added a reproducible raw-Playwright worker lifecycle using a disposable origin and dynamic test-only worker responses. Two open AQL tabs held different unsaved fictional projects with autosave paused. A deliberately incomplete replacement became redundant, retained the complete active old cache and both dirty in-memory records, and left only an inert partial cache. A complete replacement then claimed both tabs and removed the old/partial AQL caches without navigation, reload, dirty-state loss or record mutation. After explicitly saving one draft, offline reload used the complete new cache and reopened the exact IndexedDB identity and buyer value.
RISK VERDICT: The documented cache deletion is observable, but stranding/data loss was not reproducible for the current monolithic AQL bundle: install must complete before activation cleanup, open documents already contain the application code, activation does not reload windows, and record storage is not touched. This evidence does not generalize to a future extracted/lazy-loaded bundle; any extraction must version assets or retain compatible prior caches and rerun this contract.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g07-worker-update.cjs` PASS: incomplete install rollback; two old unsaved tabs preserved through complete replacement; old/partial caches removed after complete install; saved draft reopened offline. Browser assertions also prove explicit dirty state before save, exact saved identity/value after reopen, zero uncaught page errors and zero external requests. Full AQL/shared regression sequence is recorded after this journal update.
BROWSER / DATA EVIDENCE: Fresh Playwright browser context and disposable HTTP origin only; worker/cache/IndexedDB state disappeared with the context. No user browser store, production record, external export, approval, release or network service was touched.
LIMITATIONS / UNRESOLVED RISK: A-G07 still needs forced quota/degraded-storage rescue across restart, very large real attachments, master/sync selected-file malice/atomicity expansion and real-device recovery. An incomplete install can leave an inert partial cache until a later complete activation; it does not replace the active worker or delete the complete old cache.
REVIEWER / VERDICT: conditional — the old-tab/current-worker cache-deletion subcheck is accepted locally without a worker source change; the overall A-G07 gate remains conditional.
NEXT ACTION (ONE PRECISE STEP): audit and run the A-G07 forced-quota/degraded-storage rescue flow across a disposable browser restart without clearing existing records or changing SamplingEngine/saved-format contracts.
```

### A-G07 forced-quota partial rescue and browser restart — conditional, application source unchanged

```text
TIME / TIMEZONE: 2026-10-12 00:26 Asia/Dhaka
GATE / OBJECTIVE: A-G07 — prove that a failed quota write cannot overwrite the last durable project, cannot be reported as saved, and can produce only an explicitly incomplete portable rescue that remains incomplete after a full browser restart
BRANCH / SOURCE HEAD: feature/tna360-continuous / 7b5beae
FILES CHANGED (EXACT): apps/aql/tests/a-g07-quota-rescue.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, LocalRepository, StorageIO, SaveSafety, DraftJournal, PortableInspection, ProjectTransfer, service worker, SamplingEngine, saved formats, PPM/TNA/shared files and production browser data; no application/domain source changed
IMPLEMENTED: Added a reproducible raw-Playwright quota/rescue lifecycle with two separately launched browser processes. The first browser saved a fictional baseline, retained a newer project edit and unfinished CAPA draft in memory, then injected a bounded `QuotaExceededError` at the project transaction. Assertions prove the repository demoted to in-session mode, remained dirty, classified the quota cause, kept departure protection, did not overwrite the older durable record and rendered portable-rescue guidance. The user-facing Save inspection HTML action required confirmation and downloaded a `PARTIAL-RESCUE` snapshot containing the latest project and available draft. Selecting that file in Verify saved HTML was rejected as a complete backup and did not clear departure protection. After closing the complete first browser, a fresh second browser with no inherited device database selected the rescue through Save centre; preview disclosed `PARTIAL RECOVERY SNAPSHOT`, exact project identity/current values and the available draft reopened, and recovery remained incomplete/unverified.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g07-quota-rescue.cjs` PASS. Expanded full sequence PASS without retry: `a-g00-baseline.cjs` (Q01-Q24 plus portable invariants), `a-g02-workflow.cjs`, `a-g03-sampling.cjs`, `a-g04-stage.cjs`, `a-g05-readiness-rework.cjs`, `a-g06-evidence-analytics.cjs`, `a-g07-portable-safety.cjs`, `a-g07-browser-restore.cjs`, `a-g07-worker-update.cjs`, `a-g07-quota-rescue.cjs`, `a-g08-reports-language.cjs`, `a-g09-cross-app-boundaries.cjs`, `release-contract.cjs`, `tests/vesa-workspace-shell-contract.cjs`; `git diff --check` PASS. Browser assertions also prove zero uncaught page errors and zero external requests.
BROWSER / DATA EVIDENCE: Disposable server, two fresh Chromium processes and a temporary rescue path outside the repository. The rescue file and browser profiles were removed during cleanup. No existing browser data was cleared, no production record was opened and no approval, release, deployment or external request occurred.
LIMITATIONS / UNRESOLVED RISK: The quota path was deterministically injected at the real repository transaction boundary; physical disk exhaustion and native/mobile shutdown still require device acceptance. Blocked/context-denied behavior has deterministic source coverage but was not reproduced through an actual browser policy denial here. A-G07 still needs selected-file atomicity expansion for master/sync malicious, duplicate and oversize fixtures plus large real-attachment/device review.
REVIEWER / VERDICT: conditional — the quota/degraded-storage/partial-rescue/restart subcheck is accepted locally; overall A-G07 remains conditional.
NEXT ACTION (ONE PRECISE STEP): audit and extend A-G07 strict atomic selected-file rejection across project, master and sync imports using malicious/duplicate/oversize synthetic fixtures; preserve all existing local records and frozen formats.
```

### A-G08 four-language Settings and rendered A4 report review — conditional, source unchanged

```text
TIME / TIMEZONE: 2026-10-12 00:01 Asia/Dhaka
GATE / OBJECTIVE: A-G08 — verify the real Settings language path, saved-value immutability, 320px report preview and rendered A4 output without changing inspection policy
BRANCH / SOURCE HEAD: feature/tna360-continuous / 7708672
FILES CHANGED: docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md; ignored screenshots under output/playwright
FILES WATCHED/FROZEN: apps/aql/index.html, SamplingEngine, ResultEngine, ReportComposer, saved formats, service workers and all PPM/TNA/shared runtime files; no application source changed
FROZEN BUSINESS RULES: no sampling/Ac-Re cell, result rule, buyer policy, report model, saved schema or production record changed. The browser used only a fictional Practice Example; no approval, finalisation, shipment release, share or production export occurred.
IMPLEMENTED / REVIEWED: Authenticated Playwright CLI opened the fictional apparel Practice Example and generated the existing Standard buyer report. The preview retained `NOT CONFORMED`, 48/80 checked, one major finding, the 55.4 cm out-of-tolerance reading, PO/style quantities, fictional-training/non-certificate warnings and `Not released`. At 320x844 the page width stayed within the viewport (`documentElement`/body 305 CSS px for `innerWidth` 320) and the 222px preview frame remained readable. A print-media A4 PDF rendered as four pages (203,576 bytes); Chromium PDF-viewer inspection of pages 1 and 4 showed intact logo, watermark, headings, tables, signature caveat, verification token and footer without clipping. The real Settings control switched guidance through Tamil, Hindi, Bengali and English; EN was restored, and reopening the saved practice record preserved `VE-20261011-43F707`, buyer `Sample Buyer - Fictional`, factory `Sample Quality Site` and `NOT CONFORMED` exactly.
TEST COMMANDS + OUTPUT/COUNTS: `a-g00-baseline.cjs` PASS Q01-Q24 plus portable invariants; AQL A-G02 through A-G09 contract suites PASS; `release-contract.cjs` PASS; shared `vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS. Eleven commands completed without retry after the evidence patch.
BROWSER / CONSOLE EVIDENCE: Reviewed `output/playwright/aql-a-g08-report-mobile-320-20261011.png`, `aql-a-g08-pdf-viewer-first-20261011.png` and `aql-a-g08-pdf-viewer-page4-20261011.png`. Report preview reproducibly emitted two sandbox errors because scripts in `about:srcdoc` are blocked without `allow-scripts`; after reopening the record the ordinary workspace reported zero errors/warnings. Clean preview-console acceptance is not claimed.
VERDICT: conditional — four-language guidance, saved-value stability, mobile preview and four-page print layout are locally proven. Full AR01-AR15 output coverage, complete keyboard/200% zoom/screen-reader/share fallback, clean preview console, real-device/factory review and approved carton-randomization evidence remain open.
NEXT ACTION (ONE PRECISE STEP): audit and run the A-G07 current/legacy selected-file restore flow in a disposable browser profile without clearing existing records or changing SamplingEngine/saved-format contracts.
```

### A-G05 browser session and separate reinspection slice — conditional, synthetic practice only

```text
TIME / TIMEZONE: 2026-10-10 22:06 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — observe carton/session controls, retained failure state and separate reinspection creation on a disposable fictional inspection
BRANCH / SOURCE HEAD: feature/tna360-continuous / df62cec
FILES CHANGED (EXACT): docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, SamplingEngine, ResultEngine, StageCatalog, ReinspectionService, saved data and all PPM/TNA/shared files; no application/domain source changed
FROZEN BUSINESS RULES: no AQL sampling/Ac-Re cell, result rule, PPM checkpoint identity, TNA calculation or production inspection record changed. No release, export, approval or browser-data clear was performed.
IMPLEMENTED / REVIEWED: Authenticated Playwright against disposable `http://127.0.0.1:4179` opened the fictional apparel Practice Example. Pack & site exposed the carton register with CTN-021 and CTN-045 selected/PASS, a `Random select` action and audit-recording guidance. Starting then finishing the inspection produced `FINISHED`, one active minute and audit history entries for session start/finish. Review showed the original fictional report `VE-20261010-4B7D16 / R0` as `NOT CONFORMED` with 48/80 inspected, one major finding and shipment `Not released`. Accepting `New reinspection event` created a separate fresh draft `VE-20261010-5733F4 / R0` with `PENDING`, 0/80 inspected, zero findings, 29 remaining and fresh scope/plan verification fields; the original failure remained unchanged in the prior view.
TEST COMMANDS + OUTPUT/COUNTS: A-G05 browser evidence was paired with the previously recorded green fixture/contract suites: `a-g05-readiness-rework.cjs`, `a-g04-stage.cjs`, `a-g03-sampling.cjs`, `a-g02-workflow.cjs`, `a-g00-baseline.cjs` (Q01-Q24 plus portable invariants), `release-contract.cjs`, shared shell contract, all TNA G01-G09 tests and `git diff --check` PASS. PPM `regression.cjs`, `planning.cjs` and `update.cjs` remain blocked before execution by `Cannot find module 'playwright'`.
BROWSER / DATA EVIDENCE: Browser and exact disposable server were closed/stopped after observation. No production record, approval, release or external export was created; all values were fictional practice data.
VERDICT: conditional — carton/session controls and separate reinspection creation are observed locally, but full loading/reinspection carry-forward, rework/CAPA linkage, stage matrix, device review and approved carton-randomization requirements remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then extend A-G05 browser evidence through loading, prior-finding carry-forward and resubmission without changing frozen SamplingEngine tables.
```

### A-G06/A-G07/A-G08 browser evidence chain — conditional, synthetic practice only

```text
TIME / TIMEZONE: 2026-10-10 21:58 Asia/Dhaka
GATE / OBJECTIVE: A-G06/A-G07/A-G08 — verify one measurement/evidence/CAPA chain, local reopen, portable backup, report preview, shared-language preference and mobile keyboard boundaries without changing inspection policy
BRANCH / SOURCE HEAD: feature/tna360-continuous / d6824e9
FILES CHANGED: docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md; ignored output/playwright/aql-a-g06-g08-mobile-390.png
FROZEN BUSINESS RULES: no AQL application source, SamplingEngine/Ac-Re cell, report model, PPM checkpoint identity, TNA calculation or production inspection record changed. All browser data was a disposable fictional Practice Example; no approval, finalisation, shipment release or external export was submitted.
IMPLEMENTED / REVIEWED: Authenticated Playwright CLI opened an apparel Practice Example, navigated to Measure and Review, retained the fictional 55.4 cm out-of-tolerance reading and `NOT CONFORMED` result after reload/Continue, added a fictional verified CAPA row, and rendered that measurement/CAPA history in Report studio preview. The page exposed `Print / Save PDF` and `Export HTML`; the intentional sandboxed report iframe emitted two script-blocked console errors, so clean preview-console acceptance is not claimed. `Download Saved Copy` produced `VE-20261010-7EEDE5-R0.vesaproj` at 47,360 bytes and the app reported that unfinished drafts are not included in that JSON backup. The shared Login preference control was changed to Bengali; App Centre rendered Bengali labels and AQL View guidance rendered Bengali while inspection labels and user-entered values stayed unchanged. At 390x844, document/body scroll widths were 375 CSS px versus innerWidth 390; one Tab reached `Skip to workspace` with `rgb(36, 79, 214) solid 3px` focus.
TEST COMMANDS + OUTPUT/COUNTS: AQL `a-g00-baseline.cjs` PASS Q01-Q24 plus portable invariants; `a-g02-workflow.cjs`, `a-g03-sampling.cjs`, `a-g04-stage.cjs`, `a-g05-readiness-rework.cjs`, `a-g06-evidence-analytics.cjs`, `a-g07-portable-safety.cjs`, `a-g08-reports-language.cjs`, `a-g09-cross-app-boundaries.cjs`, `release-contract.cjs` PASS; shared `node tests/vesa-workspace-shell-contract.cjs` PASS; all TNA `g01`-`g09` tests PASS; `git diff --check` PASS. PPM `regression.cjs`, `planning.cjs` and `update.cjs` remain blocked before execution by `Cannot find module 'playwright'`.
BROWSER / DATA EVIDENCE: Disposable local server `http://127.0.0.1:4178`; screenshot `output/playwright/aql-a-g06-g08-mobile-390.png` (58,350 bytes). Browser and server were closed; no browser-data clear, production export, release or approval occurred. The synthetic Practice Example remains explicitly non-production.
BLOCKERS / UNRESOLVED RISK: A-G03 still requires an approved carton-randomization requirement/fixture and seeded selection evidence; A-G05/A-G06/A-G07/A-G08 still need full device/restore/large-record/print-PDF/keyboard/zoom/four-language/share review. PPM Playwright dependency, secure provider services, physical pilot and production authorization remain external blockers.
REVIEWER / VERDICT: conditional — the representative browser chain and safety boundaries are observed locally; this evidence does not accept any gate or claim live collaboration/production readiness.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then run reproducible seeded carton-selection evidence while keeping SamplingEngine cells frozen; after that, complete the remaining A-G05-A-G08 device/report review.
```

### A-G08 authenticated report preview and guidance browser review — conditional, no inspection release

```text
TIME / TIMEZONE: 2026-10-10 21:41 Asia/Dhaka
GATE / OBJECTIVE: A-G08 — inspect report preview, plain-language report actions and guidance-language rendering on a disposable synthetic inspection
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / b557b08 / aa3e641
FILES CHANGED (EXACT): docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FROZEN BUSINESS RULES: no AQL application source, report model, sampling table, inspection record, saved browser data, PPM checkpoint identity or TNA calculation changed; no report export or release was submitted.
IMPLEMENTED / REVIEWED: Authenticated Playwright CLI against disposable `http://127.0.0.1:4176` opened an apparel `Practice Example` and used `File → Prepare Report → Preview`. The rendered preview showed the fictional training / non-certificate banner and `Print / Save PDF` plus `Export HTML` actions. `View` guidance was then switched through the existing preference event path to Bengali; the guidance sentence rendered Bengali while inspection labels and user data stayed unchanged.
TEST COMMANDS + OUTPUT/COUNTS: available AQL fixture suite `a-g00-baseline.cjs`, `a-g02-workflow.cjs`, `a-g03-sampling.cjs`, `a-g04-stage.cjs`, `a-g05-readiness-rework.cjs`, `a-g06-evidence-analytics.cjs`, `a-g07-portable-safety.cjs`, `a-g08-reports-language.cjs` and `a-g09-cross-app-boundaries.cjs` passed before this browser-only review; `git diff --check` remains required after the documentation patch.
BROWSER / DATA EVIDENCE: Screenshots were captured under ignored `output/playwright/aql-a-g08-*.png`. The report iframe emitted two console errors stating that script execution was blocked because the document is sandboxed without `allow-scripts`; these are expected from the intentional sandbox boundary but prevent a zero-console-error verdict for the preview. No export, release, approval or browser-data clear occurred; the browser and disposable server were closed.
VERDICT: conditional — report preview and Bengali guidance rendering are observed, but full four-language UI parity, print/PDF visual output, mobile/keyboard/zoom review, share fallback and clean sandboxed-preview console evidence remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then repeat A-G08 with a true preference-control language switch and print/PDF/mobile/keyboard review without changing frozen AQL tables.
```

### A-G08 mobile layout and keyboard focus browser sub-slice — conditional, no inspection release

```text
TIME / TIMEZONE: 2026-10-10 21:45 Asia/Dhaka
GATE / OBJECTIVE: A-G08 — check responsive width and keyboard focus on a disposable synthetic inspection
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / b94c996 / c521cc6
FILES CHANGED (EXACT): docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FROZEN BUSINESS RULES: no AQL application source, report model, sampling table, inspection record, saved browser data, PPM checkpoint identity or TNA calculation changed.
BROWSER / DATA EVIDENCE: Authenticated Playwright CLI against disposable `http://127.0.0.1:4177` opened the fictional apparel practice inspection at 390×844. `document.documentElement.scrollWidth`, `document.body.scrollWidth` and `innerWidth` each returned 390. One Tab move reached a visible `Saved locally` button; computed outline was `rgb(36, 79, 214) solid 3px`. Screenshot was captured at ignored `output/playwright/aql-a-g08-mobile-390.png`. No export, release, approval or browser-data clear occurred; browser and disposable server were closed.
VERDICT: conditional — the tested mobile width and initial keyboard focus are locally proven; full keyboard traversal, zoom, print/PDF, true preference-control language switching, four-language UI parity and report sandbox console review remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then complete the remaining A-G08 print/PDF and preference-control language checks without changing frozen AQL tables.
```

### A-G05 readiness, rework, reinspection and loading contract — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:20 Asia/Dhaka
GATE / OBJECTIVE: A-G05 — prove existing pre-final, rework, reinspection, loading and supplier-QA guard contracts before any domain rewrite
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / a86e498 / 5baf64a
FILES CHANGED (EXACT): apps/aql/tests/a-g05-readiness-rework.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, SamplingEngine, ResultEngine, StageCatalog, ReinspectionService, saved data and all PPM/TNA/shared files; no application/domain source changed
IMPLEMENTED: Added fixture-only VM checks for pre-final readiness thresholds, incomplete and accepted rework records, carton/piece loading mismatches and complete loading, plus source contracts for new reinspection events, retained original defects, final AQL delegation, CAPA verification, supplier critical-audit failure and denied acknowledgement guards.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g05-readiness-rework.cjs` PASS; `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — pure record guards and source-preservation markers are locally proven; browser reinspection/CAPA/loading evidence, full A-G05 chain, field-device review and real inspection data remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then run a browser rework/reinspection or loading slice without changing frozen AQL tables.
```

### A-G06 measurement, evidence, CAPA and analytics contract — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:23 Asia/Dhaka
GATE / OBJECTIVE: A-G06 — prove measurement tolerance, evidence-link, CAPA and quality-analytics contracts before any domain rewrite
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 6ae5acd / 8d8127a
FILES CHANGED (EXACT): apps/aql/tests/a-g06-evidence-analytics.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FILES WATCHED/FROZEN: apps/aql/index.html, SamplingEngine, ResultEngine, saved data and all PPM/TNA/shared files; no application/domain source changed
IMPLEMENTED: Added fixture-only VM checks for in-tolerance PASS, out-of-tolerance FAIL, malformed-reading PENDING, approved additional-reading handling and retained raw tokens. Added source guards for visible units, numerator/denominator analytics, missing-denominator safeguards, local-history limitations, evidence/document asset remapping, sample/lot/carton identity, CAPA ownership/closure evidence, bounded records and evidence-card limits.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g06-evidence-analytics.cjs` PASS; `node apps/aql/tests/a-g05-readiness-rework.cjs` PASS; `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — deterministic measurement and source contracts are locally proven; full asset restore, CAPA history, analytics denominator fixtures, huge-record performance, accessibility and rendered report review remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then run browser restore/report evidence for one measurement, document, finding, CAPA and carton chain without changing frozen AQL tables.
```

### A-G04 35-area evidence reconciliation — conditional, audit accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:41 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — reconcile every original area in the master blueprint to current source/test/browser evidence with an executable honest-status ledger
BRANCH / BASE COMMIT: feature/tna360-continuous / 60df064 (tested browser commit 30fd383)
TEST COMMIT: f1541e1
FILE-LEVEL AUDIT: `docs/aql/01_AUDIT_MASTER_BLUEPRINT.md` owns the immutable 01–35 area list; this tracker owns durable evidence/status; existing A-G00 and A-G02–A-G09 suites own specific contracts. In scope: one 35-row tracker matrix, one additive Node validator and VESA_PROGRESS evidence. Frozen/out of scope: all application/runtime source, service workers, SamplingEngine/Ac-Re, schemas/formats, existing test semantics, sibling apps, production records and release. Risks are missing/duplicating an area, treating conditional proof as acceptance, hiding the carton-policy/factory blockers or counting deferred wrappers as passed. Verification: exact IDs 01–35, approved verdict vocabulary/counts, nonempty evidence/gaps, fixed area 26/33/35 boundaries, focused validator, full matrix and diff check. Rollback: revert the additive test/docs group; no runtime/data/cache change exists.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-35-area-matrix.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Added a durable 35-row matrix mapped one-for-one to `01_AUDIT_MASTER_BLUEPRINT.md`. Every row records a constrained verdict, current committed evidence and an explicit remaining-work/scope boundary. The additive validator requires sequential unique IDs 01–35, nonempty evidence/boundary text, the exact honest count split (21 PROVEN_LOCAL, 12 CONDITIONAL, 1 DEFERRED_BY_SCOPE, 1 BLOCKED_EXTERNAL), and fixed policy-sensitive treatment: packing/carton stays conditional without approved randomization, native wrappers stay deferred under the Free-only contract, and factory pilot stays externally blocked. The audit marks the A-G04 35-area-review checklist item complete but does not accept A-G04 or increase any score.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-35-area-matrix.cjs` PASS; focused matrix validator PASS; expanded 18-command AQL/shared matrix PASS in 88.1 seconds, including A-G00 Q01-Q24, A-G02–A-G09, linked-stage browser lifecycle, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Existing browser assertions remain zero uncaught page errors and zero external requests.
VERDICT: conditional — the 35-area audit itself is accepted locally and executable. A-G04 remains conditional because 12 areas still name local evidence gaps, area 35 requires external field acceptance, and area 33 is deferred by scope; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): use the visible compliance-record Evidence flow with a small synthetic local asset, bind the exact generated asset ID into the compliance report field, save/reload/reopen and prove only the unattached-evidence reason clears while all original incoming/custody observations remain unchanged.
```

### A-G04 linked-stage parent/child lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:36 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove visible linked-stage creation preserves the durable parent event and starts an independent child observation set
BRANCH / BASE COMMIT: feature/tna360-continuous / ec6aab9 (tested browser commit 4e403bb)
TEST COMMIT: 30fd383
FILE-LEVEL AUDIT: StageWorkspace.create(category,true) owns linked creation: it reads the active event, initializes ProjectSchema.fresh, sets a new identity, copies buyer/factory/order context, stores the old meta.id in stageSuite.parent, creates fresh check/record state and copies only order lines under fresh IDs. StageWorkspace.journey reads repository snapshots by orderKey and renders parent/result lineage. InspectionApp.saveNow → AutosaveService → LocalRepository owns each independent durable row. In scope: extend apps/aql/tests/a-g04-stage-browser.cjs and both trackers. Frozen/out of scope: apps/aql/index.html/runtime, service workers, SamplingEngine/Ac-Re, schemas/formats, other stage rules, sibling apps, production records and release. Risks are accidentally comparing only active memory, copying parent observations, overwriting the parent row, or confusing same-order context with shared mutable state. Verification: repository snapshot before/after child save, visible New linked inspection dialog, fresh child identity/checks/records, explicit child record, exact parent pointer, visible journey, reload/reopen of both, 390px/no-network/no-page-error/full matrix. Rollback: revert additive test/docs; disposable browser state is destroyed.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Reopened the saved IPC event and captured its complete durable repository project before using the visible New linked inspection action. The dialog retained the explicit buyer/factory/order context; selecting Endline created a different project ID with `stageSuite.parent` equal to the IPC ID, zero copied records, and all fresh Pending checkpoints. After entering separate criteria and one coherent child-only endline observation, Ctrl+S persisted the child while a second repository read proved the entire parent project object byte-for-byte unchanged. Order quality journey visibly listed both report IDs/stages/results; after full page reload both exact parent and child reopened, and the durable parent still deep-equalled its pre-child snapshot. No observation, record ID or approval was inferred or copied.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser lifecycle PASS; full 17-command AQL/shared matrix PASS in 103.2 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-linked-stage-journey-mobile.png.
VERDICT: conditional — linked-stage transition/original-observation preservation is accepted locally and the fourth A-G04 checklist item is proven. A-G04 remains conditional for the explicit 35-area evidence reconciliation, incomplete compliance attachment/other material-control acceptance, physical-device review and field acceptance; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): reconcile all 35 original AQL areas in `docs/aql/01_AUDIT_MASTER_BLUEPRINT.md` against committed code/tests/browser evidence, record each honest proven/conditional/blocked/deferred status, and add only the smallest missing deterministic contract needed to make the matrix auditable without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 compliance/custody browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:29 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove compliance-reference and sample-custody traceability through required supporting registers and exact reopen
BRANCH / BASE COMMIT: feature/tna360-continuous / 27f9c9a (tested browser commit 32007b0)
TEST COMMIT: 4e403bb
FILE-LEVEL AUDIT: StageWorkspace support/require/record owns explicit compliance/custody activation and values; StageQualityControls requires compliance revision/market/product/report/reviewer and checks the report against documents/assets; AuditEngine checks evidence expiry; StageDecision keeps missing evidence pending; LocalRepository/Home Resume own persistence. In scope: additive browser fixture/assertions and both trackers. Frozen/out of scope: runtime source/workers, SamplingEngine/Ac-Re, schemas/formats, other rules, sibling apps, production records and release. Risks are confusing a typed report reference with attached evidence, mutating the earlier incoming snapshot, or claiming a clean custody row resolves missing compliance evidence. Verification: real 390px support dialogs, exact unattached-report reason, exact requiredModules/records, visible PENDING, reload/reopen, screenshot/no-overflow/network/page errors, full matrix. Rollback: revert test/docs; disposable browser state is destroyed.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Reopened the incoming event and used the real Add supporting register flow to require a Market evidence matrix and Sample custody. The compliance record includes buyer-manual revision, market, product, report identity, future expiry, artwork and reviewer, but deliberately attaches no matching document/asset; the exact `Required compliance evidence not attached` reason remains pending. The custody record includes Lab kind, sealed Yes, exact seal, recipient/date/location/return metadata and Pass review without claiming a photo. The test asserts exact requiredModules order, exact missing-evidence reason, exact custody seal, visible PENDING decision and byte-for-value three-record stageSuite reopen after Ctrl+S/reload. The reviewed workspace shows both passing register cards while nine open requirements—including the unattached report—remain visible, with no horizontal clipping.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser lifecycle PASS; full 17-command AQL/shared matrix PASS in 90.3 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-compliance-custody-mobile.png.
VERDICT: conditional — the compliance/custody browser slice is accepted locally. A-G04 remains conditional because the compliance evidence is intentionally absent, linked-stage transition/original-observation proof and remaining 35-area evidence are open, and physical-device/field acceptance is external; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): use the visible New linked inspection workflow to create a child stage from an existing saved event, then prove parent lineage, fresh child observations, unchanged parent bytes and exact reload/reopen without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 equipment/needle/metal browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:25 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove required equipment, broken-needle and metal-detection supporting registers fail closed and persist exactly
BRANCH / BASE COMMIT: feature/tna360-continuous / 809a264 (tested browser commit 39bd7f0)
TEST COMMIT: 32007b0
FILE-LEVEL AUDIT: StageWorkspace.support/require/record owns explicit register activation and values; AuditEngine checks record expiry against inspection date; StageDecision.record owns needle containment and ProductionInspectionEngine owns metal challenge guards; the installed wrapper additionally requires metal machine/operator/piece/setting; StageDecision preserves failure precedence; LocalRepository/Home Resume own persistence. In scope: extend the additive browser test and both trackers. Frozen/out of scope: application/runtime code, workers, SamplingEngine/Ac-Re, schemas/formats, other rules, sibling apps, production records and release. Risks are mutating the earlier cutting fixture without updating its expected reopen snapshot, missing exact late-wrapper requirements, and claiming a Pass review overrides confirmed failures. Verification: real support dialogs; expired equipment, unrecovered needle, failed metal challenge; exact reasons/requiredModules/visible decision; reload/reopen; screenshot/no-overflow/network/page errors; full matrix. Rollback: revert test/docs; disposable browser state is destroyed.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Reopened the previously saved cutting event and used the real Add supporting register flow to require Equipment control, Broken needle register and Metal detection log. The equipment record is explicitly one day expired; the needle record says fragments not recovered, metal detection not completed and has no supervisor release; the metal record has a failed start challenge while all late-wrapper identity/setting/operator fields are present. The test asserts requiredModules order `equipment, needle, metal`, exact expired-equipment and failed-challenge reasons, exact needle-containment pending reason, engine/visible NOT CONFORMED decision, and byte-for-value stageSuite reopen after Ctrl+S/reload. The reviewed workspace shows 13 open requirements, 2 confirmed failures, FAIL/PENDING/FAIL register cards and all reasons without horizontal clipping.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser lifecycle PASS; full 17-command AQL/shared matrix PASS in 83.3 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-equipment-needle-metal-mobile.png.
VERDICT: conditional — the equipment/needle/metal browser slice is accepted locally. A-G04 remains conditional for compliance/custody traceability, remaining 35-area evidence, physical-device review and field acceptance; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): extend authenticated A-G04 evidence through compliance and sample-custody supporting registers, proving missing compliance evidence and custody identity fail closed and exact save/reload/reopen without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 fabric shade/lab browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:22 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove the fabric main record plus required shade and laboratory supporting registers through authenticated create/save/reload/reopen
BRANCH / BASE COMMIT: feature/tna360-continuous / d0143b1 (tested browser commit 060d646)
TEST COMMIT: 39bd7f0
FILE-LEVEL AUDIT: StageCatalog defines fabric→roll and shade/lab fields; StageWorkspace.support/require explicitly makes a supporting register mandatory before StageWorkspace.record saves values; FabricInspectionEngine owns roll density and laboratory guards while StageDecision.record owns Delta E; StageDecision maps confirmed fabric failures to REJECT / HOLD; LocalRepository/Home Resume own exact persistence. In scope: additive browser-test helpers/fixtures and both trackers. Frozen/out of scope: apps/aql/index.html, service workers, SamplingEngine/Ac-Re, schemas/formats, runtime rules, sibling apps, production records and release. Risks are accidentally bypassing the real support dialog, saving an invalid roll fixture, or testing computed state without proving visible REJECT / HOLD and exact reopen. Verification: real 390px support dialogs; valid roll plus deliberate shade Delta E and lab failures; exact requiredModules/records/reasons/visible decision; reload/reopen; screenshots; no overflow/network/page errors; full matrix. Rollback: revert test/docs; disposable browser state is destroyed.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Added an authenticated 390px fabric event with a valid roll saved through the real record dialog, then used Add supporting register → Shade management and Laboratory matrix so both modules are explicitly required. The shade record deliberately records Delta E 2.5 against approved maximum 1.5 and a Reject disposition; the lab record deliberately records a Fail result with method/revision/criterion/actual/reviewer. The test asserts requiredModules remains exactly `shade, lab`, exact Delta E and laboratory failure reasons remain present, engine result is NOT CONFORMED, specialized visible decision is REJECT / HOLD, and the complete three-record stageSuite plus identity values survive Ctrl+S, reload and Home reopen. The reviewed workspace visibly shows a passing roll, failing shade/lab cards, three confirmed failures, open checklist requirements and no horizontal clipping.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser lifecycle PASS; full 17-command AQL/shared matrix PASS in 72.8 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-fabric-reject-hold-mobile.png.
VERDICT: conditional — the fabric roll/shade/lab browser slice is accepted locally and the first A-G04 checklist item is now proven. A-G04 remains conditional for material-control/traceability and remaining 35-area evidence, physical-device review and field acceptance; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): extend authenticated A-G04 evidence through required equipment, broken-needle and metal-detection supporting registers, proving fail-closed decisions and exact save/reload/reopen without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 incoming/monitor browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:19 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — extend the authenticated 390px create/save/reload/reopen lifecycle to incoming-material and production-monitoring stages with explicit quantity/balance guards
BRANCH / BASE COMMIT: feature/tna360-continuous / 7c533d0 (tested browser commit 52cede7)
TEST COMMIT: 060d646
FILE-LEVEL AUDIT: StageCatalog owns incoming/monitor form definitions; StageWorkspace owns visible create/criteria/record commands; StageQualityControls owns incoming quantity/lab guards; ProductionInspectionEngine owns monitor flow/balance guards; StageDecision owns failure-over-pending precedence; LocalRepository/Home Resume own durable reopen. In scope: extend apps/aql/tests/a-g04-stage-browser.cjs and update both trackers. Frozen/out of scope: apps/aql/index.html, service workers, SamplingEngine/Ac-Re, ProjectSchema/saved formats, other stage rules, sibling apps, production records and release actions. Risks are numeric fixture coercion, losing the exact pending reason, treating incomplete quantity reconciliation as conforming, selector drift and record mutation. Verification: real 390px forms, exact incoming inspected>received and monitor packed>order reasons, visible PENDING decisions, exact reopen, no overflow/network/page errors, screenshots, full regression and diff checks. Rollback: revert the additive test/docs group; disposable browser data is destroyed.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Extended the real 390px create/criteria/record/Ctrl+S/reload/Home-reopen sequence with two fictional records and added exact pending-reason assertions. Incoming material records 101 inspected against 100 received with explicit supplier/PO/batch/GRN/lab/warehouse/approver fields; it remains visibly PENDING with `INCOMING-A-G04-001: inspected quantity exceeds received`. Production monitoring records 105 packed against an order of 100 with cumulative flow values and dates; it remains visibly PENDING with `MONITOR-A-G04-001: Packed quantity exceeds order`. All nine accumulated stage events render their calculated decisions before leaving the workspace and reopen with exact stageSuite plus buyer/factory values. The reviewed Home screenshot shows nine separate saved drafts and no horizontal clipping.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser lifecycle PASS; full 17-command AQL/shared matrix PASS in 76.2 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-material-monitor-mobile.png.
VERDICT: conditional — the incoming/monitor browser lifecycle slice is accepted locally. A-G04 remains conditional for fabric shade/lab supporting-register browser evidence, remaining 35-area evidence, physical-device review and field acceptance; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): extend authenticated A-G04 fabric-stage evidence through shade and laboratory supporting registers, proving their fail-closed record decisions and exact save/reload/reopen without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 inline/endline/pre-final browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:15 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — extend the authenticated 390px create/save/reload/reopen lifecycle to inline, endline and pre-final stages with explicit production failure and readiness evidence
BRANCH / BASE COMMIT: feature/tna360-continuous / f752143 (tested source commit 78f33f5)
TEST COMMIT: 52cede7
FILE-LEVEL AUDIT: StageCatalog owns the inline/endline/readiness form definitions; StageWorkspace owns visible create/criteria/record dialogs; InlineQualityEngine and PreFinalReadinessEngine add deterministic record issues; StageDecision preserves failure precedence and specialized pre-final vocabulary; ProjectStore/saveNow/AutosaveService/LocalRepository/Home Resume own durable identity. In scope: extend apps/aql/tests/a-g04-stage-browser.cjs and update the AQL/master trackers. Frozen/out of scope: apps/aql/index.html, service workers, SamplingEngine/Ac-Re, ProjectSchema/saved formats, all other stage rules, sibling apps, production data and release actions. Risks are selector drift, incoherent numeric fixture values, treating pending checklist work as approval, or losing precise record values across reopen. Verification: real 390px dialogs with explicit fictional values; deliberate inline record failure, coherent endline counts, below-threshold pre-final failure; exact engine/stage decisions and failure reasons; exact reopen; screenshot/no-overflow/no-network/no-page-error assertions; full matrix and diff checks. Rollback: revert the additive test/docs patch; disposable browser storage is destroyed after execution.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Extended the real 390px stage-create/criteria/record/Ctrl+S/reload/Home-reopen flow with three fictional events. Inline records an explicit Fail plus coherent inspected/defective/occurrence/repair values and remains NOT CONFORMED with its exact recorded-failure reason. Endline records coherent first-pass + defective = inspected and repair/recheck values, while honestly staying PENDING because its checklist is unresolved. Pre-final records production 80% and packing 70% against explicitly approved 90%/80% thresholds; engine result is NOT CONFORMED and specialized stage decision is visibly NOT READY, with both threshold failures and all unresolved checklist requirements shown. The test requires each calculated decision to be visible before leaving the workspace and verifies all seven accumulated stageSuite objects plus buyer/factory values reopen byte-for-value. Reviewed screenshots show the seven-record mobile Home and the detailed NOT READY workspace without horizontal clipping.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser lifecycle PASS twice (second run includes visible-decision assertion and pre-final screenshot); full 17-command AQL/shared matrix PASS in 69.9 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-production-readiness-mobile.png and output/playwright/aql-a-g04-prefinal-not-ready-mobile.png.
VERDICT: conditional — the inline/endline/pre-final browser lifecycle slice is accepted locally. A-G04 remains conditional for remaining stage-family/35-area browser evidence, physical-device review and field acceptance; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): extend the disposable-browser A-G04 lifecycle to incoming-material and production-monitoring stages, proving explicit quantity/balance guards and exact save/reload/reopen without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 loading/supplier-audit browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:11 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — extend the authenticated 390px create/save/reload/reopen lifecycle to loading and supplier-audit stages while proving their honest failure guards
BRANCH / BASE COMMIT: feature/tna360-continuous / c46f42d (last tested runtime/evidence commit 7b05a98)
SOURCE COMMIT: 78f33f5
FILE-LEVEL AUDIT: StageWorkspace.create owns stage selection and event identity; criteria/record dialogs route values through ProjectStore; StageDecision/LoadingInspectionEngine and the installed supplier critical-audit wrapper own the visible outcome; saveNow/AutosaveService/LocalRepository and Home Resume own persistence/reopen. Initial test-only scope was expanded after the real browser exposed a product defect: the late audit wrapper added a failure and recomputed `result`, but retained the earlier PENDING `stageDecision`. In scope: apps/aql/index.html wrapper decision synchronization, its release-patch mirror, apps/aql/service-worker.js cache revision, exact related contracts/browser test and both trackers. Frozen/out of scope: SamplingEngine/Ac-Re, ProjectSchema/saved formats, all other stage rules, root/PPM/TNA/shared runtime, production browser data and release actions. Risks are changing stage-specific vocabulary, stale offline HTML, hiding unresolved requirements or mutating reopened records. Verification: real mobile dialogs with explicit fictional values, both engine and visible decisions, retained exact failure reason, exact saved/reopened stageSuite values, worker lifecycle, no overflow/external requests/page errors, visual screenshot review, full regressions and diff checks. Rollback: revert the source/test/docs group and cache revision; the disposable context and synthetic records are destroyed after execution.
FILES CHANGED (EXACT): apps/aql/index.html; apps/aql/service-worker.js; apps/aql/tests/a-g04-stage-browser.cjs; apps/aql/tests/a-g07-worker-update.cjs; apps/aql/tests/apply-release-patch.cjs; apps/aql/tests/release-contract.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: Extended the authenticated 390px lifecycle to a fictional loading event with deliberate carton/piece mismatches and missing before/after evidence, and a fictional supplier audit with a Critical finding deliberately marked Pass. The first audit run exposed stale visible PENDING state despite a newly added failure and NOT CONFORMED engine result. The smallest compatibility-wrapper correction now recomputes the existing stage-specific decision after late guards; the browser asserts internal result, user-visible decision and exact critical-failure text. Loading reports LOADING NOT CONFORMED, audit reports NOT CONFORMED, IPC/cutting remain honestly PENDING, and all four exact stageSuite objects plus buyer/factory values survive explicit save, reload and Home reopen. The AQL cache changed to `vesa-aql-2026-10-12-6` so offline clients receive the corrected HTML. The reviewed 390px screenshot shows four saved drafts, two nonconformances, local-only guidance and no horizontal clipping.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; `node --check apps/aql/service-worker.js` PASS; focused browser lifecycle PASS; full 17-command AQL/shared matrix PASS in 67.2 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import/worker suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-stage-lifecycle-mobile.png.
VERDICT: conditional — the loading/supplier-audit browser lifecycle and decision-coherence fix are accepted locally. A-G04 remains conditional for remaining stage-family browser evidence, physical-device review and field acceptance; percentages do not change.
NEXT ACTION (ONE PRECISE STEP): extend the disposable-browser A-G04 lifecycle to inline, endline and pre-final stages, proving a deliberate production defect/failure, pre-final readiness blockers and exact save/reload/reopen without altering frozen SamplingEngine/Ac-Re rules.
```

### A-G04 IPC/cutting browser lifecycle — conditional, browser slice accepted locally

```text
TIME / TIMEZONE: 2026-10-12 10:03 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — prove real authenticated 390px create, criteria, record, explicit save, reload and reopen for IPC and cutting stages
BRANCH / BASE COMMIT: feature/tna360-continuous / b4d81fe
FILE-LEVEL AUDIT: StageWorkspace.create owns explicit stage selection and new event identity; StageWorkspace.criteria/record route modal form values through ProjectStore; InspectionApp.saveNow -> AutosaveService -> LocalRepository owns durable save; Home recent-record Resume reopens the saved identity. In scope: one additive raw-Playwright A-G04 test plus tracker/dashboard evidence. Frozen/out of scope: apps/aql/index.html, all stage/domain/sampling rules, saved formats, workers, PPM/TNA/shared runtime, production browser data and release actions. Risks are selector drift, dialog timing and accidental inference of buyer approval; use explicit fictional values, leave unresolved checklists pending, assert exact saved record bytes/identity, viewport overflow and zero external requests/page errors. Verification: focused browser test, full AQL/shared matrix, syntax and git diff checks. Rollback: revert the additive test/docs patch; disposable browser storage is destroyed with its context.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage-browser.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: The additive raw-Playwright test uses the visible mobile controls and real StageWorkspace dialogs to create separate fictional IPC and cutting events, enter explicit criteria/reviewer/coverage, add stage-specific records, invoke Ctrl+S, reload the app and reopen each exact durable identity from Home. Exact stageSuite objects and buyer/factory values survive reload/reopen; both events remain PENDING because their checklists were deliberately not fabricated. The 390px page has no horizontal overflow, and the reviewed screenshot shows two separate pending saved records plus local-backup guidance.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage-browser.cjs` PASS; focused browser run PASS after correcting two test-only hidden/duplicate mobile selectors; full expanded 17-command AQL/shared matrix PASS in 57.2 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import suites, release contract and shared shell contract; `git diff --check` PASS. Browser assertions report zero uncaught page errors and zero external requests. Visual evidence reviewed at output/playwright/aql-a-g04-ipc-cutting-mobile.png.
VERDICT: conditional — the IPC/cutting browser lifecycle slice is accepted locally. A-G04 remains conditional for remaining stage-family browser evidence, physical-device review and field acceptance.
NEXT ACTION (ONE PRECISE STEP): extend the same disposable-browser A-G04 lifecycle evidence to loading and supplier-audit stages, including honest pending/failure guards and exact reopen, without changing frozen domain rules.
```

### A-G04 complete stage/register contract — conditional, pure matrix accepted locally

```text
TIME / TIMEZONE: 2026-10-12 09:58 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — reconcile all 13 stage routes and all 21 shipped register definitions, then prove the smallest missing deterministic stage guards without changing runtime/domain source
BRANCH / BASE COMMIT: feature/tna360-continuous / 3441219
FILE-LEVEL AUDIT: StageCatalog owns 13 stage-to-main-register mappings and 21 register schemas; StageDecision plus its fabric, inline, readiness, loading, production and audit engines return pure pending/failure metrics. The existing A-G04 test covers all route names but only 13 register schemas and lacks all-stage missing-register, rework target/original-failure, loading reconciliation/evidence and expired-equipment assertions. In scope: apps/aql/tests/a-g04-stage.cjs plus tracker/dashboard evidence. Frozen/out of scope: apps/aql/index.html, SamplingEngine/Ac-Re, ProjectSchema/saved formats, A-G03 carton policy, service workers, PPM/TNA/shared runtime and browser records. Verification: pure A-G04 test, full AQL/shared regression, syntax and git diff checks. Rollback: revert the test/docs patch; no application or data migration is involved.
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
IMPLEMENTED / EVIDENCE: The existing pure fixture now freezes all 21 register keys/field definitions, not only the prior 13. Every one of the 13 stage routes is evaluated without its required main register and must remain pending with the exact missing-register reason. Deterministic guards now prove incomplete repair/independent recheck/one-piece traceability, approved 100% screening target reconciliation, carton and piece loading mismatch, missing seal, and expired equipment calibration. A complete one-piece rework record reaches CONFORMED; no buyer rule or observation is invented.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/aql/tests/a-g04-stage.cjs` PASS; focused `node apps/aql/tests/a-g04-stage.cjs` PASS; full 16-command AQL/shared matrix PASS in 68.8 seconds, including A-G00 Q01-Q24, A-G02 through A-G09, all A-G07 browser/storage/import suites, release contract and shared shell contract; `git diff --check` PASS. The repeated real-byte probe remained inside its guardrails (200 MiB+1 decoded rejection in 9.264 seconds; 280 MiB+1 selected-file rejection in 33 ms) with exact-state assertions passing.
VERDICT: conditional — the complete pure stage/register matrix slice is accepted locally. A-G04 remains conditional for authenticated browser create/edit/save/reopen coverage across the stage families, physical-device review and full field acceptance.
NEXT ACTION (ONE PRECISE STEP): add authenticated disposable-browser A-G04 evidence for IPC and cutting stage create/save/reload/reopen at 390px, without changing SamplingEngine/Ac-Re, saved formats or production data.
```

### A-G04 material-control extension — conditional, domain source unchanged

```text
TIME / TIMEZONE: 2026-10-10 21:15 Asia/Dhaka
GATE / OBJECTIVE: A-G04 — cover incoming-stage absence, needle containment and metal challenge evidence
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / b26e822 / f22f675
FILES CHANGED (EXACT): apps/aql/tests/a-g04-stage.cjs; docs/aql/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md
FROZEN BUSINESS RULES: no `apps/aql/index.html` source, SamplingEngine cell, Ac/Re rule, saved record or shared/sibling file changed
IMPLEMENTED: Added fixture cases for the required `needle`, `metal` and `equipment` field definitions; a failed metal challenge; incomplete needle containment/release; missing incoming-material register remaining pending; and a complete incoming-material stage reaching CONFORMED.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/aql/tests/a-g04-stage.cjs` PASS; `node apps/aql/tests/a-g03-sampling.cjs` PASS; `node apps/aql/tests/a-g02-workflow.cjs` PASS; `node apps/aql/tests/a-g00-baseline.cjs` PASS (Q01-Q24 plus portable invariants); `node apps/aql/tests/release-contract.cjs` PASS; `node tests/vesa-workspace-shell-contract.cjs` PASS; `git diff --check` PASS.
VERDICT: conditional — material-control and incoming-stage guard coverage is locally proven, but full A-G04 35-area/stage matrix and field-device review remain open.
NEXT ACTION (ONE PRECISE STEP): obtain or document the approved carton-randomization requirement/fixture for active A-G03, then cover the next untested stage-specific record without changing frozen AQL tables.
```
