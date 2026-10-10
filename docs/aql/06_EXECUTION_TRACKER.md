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
| Last accepted new rework gate | **NONE** (handover/specification only) |
| Current verdict | `draft-only` — no AQL rework code or live deploy claimed |
| Current gate | **A-G00** — inspect real local checkout; baseline and golden sampling fixtures |
| LAST COMPLETED ACTION | 7-file AQL handover docs authored based on repo GitHub audit |
| NEXT ACTION | Put files at `apps/aql/AGENTS.md` and `docs/aql/`, open repo in VS Code, create feature branch, run G00 |
| External blockers | Server-side identity/tenant store, cloud database, notices, provider credentials, real factory pilot |

## Daily/new-session rule
At every Codex session: read `apps/aql/AGENTS.md` and this tracker; inspect `git status --short`, current branch/HEAD, last accepted commit and real test output. Reconcile the log before any new code. Read topic-specific document as required, then pick earliest incomplete unblocked gate, name exact change files/frozen files, test and record acceptance. Do not claim a feature finished while actual code/output differs. A current domain fixture change requires explicit review; don't turn a cosmetic issue into inspection-policy rewrite.

## End-to-end gate sequence
### A-G00 — Source audit, frozen numerical/portable baseline
- [ ] Verify local repo, branch, HEAD, dirty state, instructions and test dependencies.
- [ ] Directly inspect large `apps/aql/index.html`, service worker, tests, shared nav/auth files and engineering history.
- [ ] Record file-level in-scope/watched/frozen map, class/dependency graph, state lifecycle and rollback.
- [ ] Snapshot actual `SamplingEngine` lot/levels/sample/AQL cells and `ResultEngine` decisions with all Q01–Q24 fixtures.
- [ ] Verify existing six-step and 13-stage actions, basic save/open/portable copy, reports, login.
- [ ] Record desktop/320/390/tablet screenshots before redesign; source code review alone doesn't prove visible UI.
- [ ] Append G00 audit/proof and mark verdict; only then implement.

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
- [ ] Current `node apps/aql/tests/release-contract.cjs` remains green (is not sole proof).
- [ ] New sampling fixture tests exercise all actual supported/unsupported table paths.
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
