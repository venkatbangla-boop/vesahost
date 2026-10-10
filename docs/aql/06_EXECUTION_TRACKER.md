# 06 — AQL 360 Continuous Execution Tracker, 35-Area Matrix, Tests & Resume State

**DURABLE source of truth for VS Code Codex.** Exactly one ongoing program: Phase 1 (safe UI/foundation), Phase 2 (complete domain-quality rework), Phase 3 (secured integrations). Each gate is individually testable and reversible. A narrative, old report or checked box alone is not proof.

## Starting snapshot — 2026-10-10
| Field | Current reality |
|---|---|
| Repository | `venkatbangla-boop/vesahost`, branch `main` observed via GitHub (verify on local clone) |
| App URL | `/apps/aql/` |
| Source baseline | GitHub blob `b733dc700fce47aa04f1cd3f64c5e8f286d65512`, approx 11.7MB inline HTML |
| Known shell | Independent sidebar+topbar+dynamic sticky `#aqlReleaseMenu` |
| Existing test | `apps/aql/tests/release-contract.cjs` plus earlier engineering logs |
| Last accepted new rework gate | **A-G00** — source-derived deterministic baseline accepted locally; no live deploy |
| Current verdict | `accepted` locally for the frozen baseline; browser reopen and provider services remain separate gates/blockers |
| Current gate | **A-G00** — inspect real local checkout; baseline and golden sampling fixtures |
| LAST COMPLETED ACTION | Source-derived deterministic runner passed Q01–Q24 plus portable round-trip invariants and the release contract |
| NEXT ACTION | Start A-G01: reconcile the shared VESA-UNIFORM-UI-v1 shell against AQL/PPM/TNA with route and mobile regression evidence; keep numeric sampling frozen |
| External blockers | Server-side identity/tenant store, cloud database, notices, provider credentials, real factory pilot |

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
- [ ] Reconcile shared `VESA-UNIFORM-UI-v1` contract with PPM/TNA and actual root app shell.
- [ ] Platform-owned patch delivers same official logo, global menu, theme tokens, user/settings, navigation.
- [ ] Max ONE sticky/fixed navigation region, correct mobile collapse, accessible focus and no duplicate CSS overrides.
- [ ] Root homepage/Login/Apps/Admin/PPM/AQL/future TNA smoke and absence of regressions.

### A-G02 — AQL menu adapter, home and novice workflow
- [ ] Remove AQL-specific sidebar/topbar/sticky menu conflict after common adapter verified.
- [ ] Preserve `InspectionApp.render`, `dispatch`, old step/stage routes, state and data.
- [ ] Home New/Continue/Open Saved/Practice/Open Saved Copy with correct saved states.
- [ ] Guided 6-step beginner mode and expert detail without hiding complete stage controls.
- [ ] No overlay at 320/360/390/768/1024/1280/1440.

### A-G03 — Sampling/counting/lot plan comprehensive audit
- [ ] All supported codes/levels/lot brackets/sample/Ac/Re match original fixtures.
- [ ] Unsupported cells, absent buyer policy and unknown schemes cannot pass.
- [ ] Allocation/checked sample and counting-basis edge cases Q01–Q11 pass.
- [ ] Introduce carton randomization reproducible algorithm/evidence only after separate requirements/fixtures.
- [ ] Plan reviewer, reference edition, approved source, revision and timing visible.

### A-G04 — Stage workflow A-Z: materials through production
- [ ] Incoming materials, fabric roll, shade, lab, cutting, IPC, inline, endline, monitor all tested.
- [ ] Material quantity, roll/lot, buyer manual, traceability, equipment/needle controls when required.
- [ ] 35 original areas audited with honest pass/partial/blocked evidence.
- [ ] Stage transitions and original observations preserved.

### A-G05 — Pre-final/final/rework/reinspection/load/supplier QA
- [ ] Prefinal readiness prerequisites and pending evidence cannot be bypassed.
- [ ] Final AQL defect/severity result matches approved plan and original engine.
- [ ] Rework/CAPA/reinspection creates linked history and never deletes prior failure.
- [ ] Loading/carton/barcode/seal/handover traceability complete where selected.
- [ ] Supplier QMS critical audit failure and factory denied acknowledgement remain blocked.

### A-G06 — Inspection evidence, measurements, CAPA, quality analytics
- [ ] Measurement POM/tolerance/actual/units validated and reported.
- [ ] Photos/documents and sample/lot/carton references link correctly and survive restore.
- [ ] CAPA ownership and closure verification with original finding chain.
- [ ] Quality analytics state numerator/denominator; missing data -> needs information, not fabricated result.
- [ ] Performance and accessibility for huge evidence/long records.

### A-G07 — Durable saving, portable HTML, import and offline worker
- [ ] Current/legacy portable saved inspection opens and preserves all selected stages/assets.
- [ ] Strict atomic import of project/master/sync with malice/duplicate/oversize tests.
- [ ] Quota, blocked IndexedDB, browser close/update and partial rescue modes honestly described.
- [ ] Old AQL tab update against service worker cache deletion risk tested/fixed if reproducible.
- [ ] Source extraction from 11.7MB only after verified fixture parity; no hurried whole-file rewrite.

### A-G08 — Reports, four languages, beginner copy and accessibility
- [ ] AR01–AR15 report variants validated against actual domain evidence (new ones additive).
- [ ] Bangla/Hindi/Tamil/English authored text; raw user values unchanged.
- [ ] Report screenshot/PDF review for 320px screens and print page clipping/fonts/brand.
- [ ] Real accessible controls: keyboard/zoom, focused modal, camera, save, open/report/share fallback.

### A-G09 — Shared data references and App Centre consistency
- [ ] Source-labeled PPM link / TNA milestone data with explicit IDs and versions.
- [ ] No PPM GO inferred from AQL; no TNA original date overwritten by inspection update.
- [ ] App Centre/login user preferences visible in SAME location and consistent across apps.
- [ ] Cross-app shared CSS/JS file impacts reviewed once, all sibling tests rerun.

### A-G10 — Server-side roles, collaboration, authorized approvals (provisioned only)
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
