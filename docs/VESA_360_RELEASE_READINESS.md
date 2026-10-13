# VESA 360 Release-Readiness Review

**Review date:** 2026-10-13
**Branch:** `feature/tna360-continuous`
**Local handoff candidate:** `85b4ac7` (latest runtime implementation: `55a8abd`)
**Decision:** **HOLD — not ready for production deployment**

This review reconciles the application execution trackers and the master dashboard. It authorizes no push, merge, deployment, DNS change, live App Centre route change, provider activation or production-data use.

## Current local handoff supplement — 2026-10-13

This supplement is the current handoff authority. The older `48ec023` review remains below as immutable historical context and must not be used as the current next-action list.

### Candidate and verified local status

| Item | Current evidence |
|---|---|
| Branch | `feature/tna360-continuous`; committed locally, not pushed or merged by this handoff |
| Local handoff SHA | `85b4ac7` — current accepted local implementation/test baseline; includes G12 recovery, final shared UX, AQL local analytics/stage reports, AR02/AR03/AR04/AR10/AR12/AR13/AR14 report evidence and the bounded full-history safety scan; not a deployed release |
| Latest runtime SHA | `55a8abd` — AQL bounded AR08 Cutting / IPC / Inline and AR09 Endline & Pre-Final Readiness reports with separate current-event rows, frozen DHU/defective/RFT/readiness calculations, preserved PENDING/NOT READY guards and explicit no-cross-stage/no-release boundaries; proportional AQL tests pass, while promotion to handoff baseline awaits the next meaningful full cross-app gate run. Preserves AR06/AR07 runtime `9689407`, AR14 `85b4ac7`, AR12 `bfe7f15`, AR10 `e393b6a`, AR02 `ac24f1c`, AR13 `c5920f0`, AR04 `31c3dee`, AR03 `a01caf3`, stage-report `1728ee9`, analytics `4a79280`, shared U-G09 `87f1e2a` and TNA risk/performance lineage `253672c`. |
| Regression | `node tests/vesa-g11-regression.cjs`: PASS, 88 commands / 921.7s, no retry; 53 automated, 22 browser, 12 syntax, 1 repository |
| Local TNA state | G00–G08 accepted; G10/G11 conditional local evidence; G12 local handoff proof complete but gate remains blocked from release |
| Shared UX state | U-G00–U-G09 accepted locally; physical screen-reader/device/factory acceptance remains external |
| Production state | Not staged, not deployed, not live-verified, not authorized |

### Clean local verification recipe

Run from the repository root on Windows PowerShell with Node.js and the already installed Playwright/Chromium paths adjusted for the verifying machine:

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
$env:NODE_PATH='<playwright node_modules directory>'
$env:CHROMIUM_PATH='<Chromium executable>'
node apps/tna/tests/g12-local-handoff.test.js
node tests/vesa-g11-regression.cjs
git diff --check
```

Expected candidate facts: branch `feature/tna360-continuous`; accepted full-matrix handoff baseline `85b4ac7` and latest proportionally tested runtime SHA `55a8abd`, or a later documentation-only evidence commit; the G12 test reports lossless current restore, `1.0.0` migration, corrupt-restore preservation and 13 offline assets; the final shared transition matrix covers six states at 390/768/1280; AQL analytics proves 600 local saved records at 390/1280; AQL stage reports prove all 13 routes plus a clean strict sandbox and standalone print-window composition; AR03 proves supported and unsupported sampling-plan allocation reports at 390/1280; AR04 proves denominator-safe observed-category Pareto output with occurrence, nonconforming-unit and zero-checked safeguards at 390/1280; AR13 proves complete recorded CAPA lifecycle rows, honest unresolved/verified-not-closed/recorded-closed review and empty/incomplete safeguards at 390/1280; AR02 proves separate immutable source-finding/action rows with explicit no-link/no-acceptance boundaries at 390/1280; AR10 proves exact frozen-source/current event identity and result, correction quantities/evidence, source CAPA and linked reinspection reconciliation with missing/mismatch safeguards at 390/1280; AR12 proves exact loading counts/variance, recorded seal/handover, owned before/final evidence and mismatch/missing safeguards at 390/1280 without certifying randomization, custody or release; AR14 proves separate exact supplier-audit/acknowledgement rows, immutable Critical and denied-receipt guards, empty-state honesty and explicit no-certification/no-acceptance boundaries at 390/1280; AR06/AR07 prove exact frozen fabric-roll calculations and separate incoming/shade quantity/decision rows with no-AQL/no-release boundaries; AR08/AR09 prove separate current-event cutting/IPC/inline/endline/pre-final rows, frozen DHU/defective/RFT/readiness outputs and preserved PENDING/NOT READY guards at 390/1280 under focused proportional tests. The full-history safety check must cover every reachable text blob in bounded batches. Promote a later runtime to the handoff baseline only after a clean meaningful gate-boundary full matrix.

### Migration and backup/restore rehearsal

- `apps/tna/tests/g12-local-handoff.test.js` creates a synthetic order with baseline, actual, history, evidence and complete order-master fields.
- A current `1.1.0` portable copy restores byte-for-byte to the same plan.
- A synthetic `1.0.0` copy migrates to `1.1.0` without changing identity, dates, baseline, revision/audit history or evidence, and without inventing ports or color/size quantities.
- A corrupt restore is rejected while the previously saved good record remains exactly unchanged.
- The tested `/apps/tna/` entry references 13 route-local assets, all present in the `vesa-v68-platform-g09` offline bundle.
- This is synthetic local proof. Representative anonymized business copies still require owner-controlled staging rehearsal before any release authorization.

### Safe rollback and recovery

1. Before any future staging update, use **Save TNA** and **Download Saved Copy** for every important local order. Store those files outside the browser profile.
2. Never clear browser storage, delete the service-worker data, or overwrite the only surviving order as a rollback technique.
3. If a future code candidate fails, keep saved copies untouched and use a normal `git revert <sha>` on the exact offending commit. Do not use `git reset --hard` against the shared workspace.
4. The TNA runtime lineage is F06 `a554282`, F44 `3291786`, calendar `f233a25`, graph `910753e`, then risk/performance `253672c`; shared runtime acceptance continues through U-G06 `94414c2` and U-G09 `87f1e2a`; AQL analytics presentation/offline evidence continues at `4a79280`, stage-report/sandbox/print-window evidence at `1728ee9`, AR03 sampling allocation at `a01caf3`, AR04 defect Pareto at `31c3dee`, AR13 CAPA Tracker at `c5920f0`, AR02 factory follow-up at `ac24f1c`, AR10 rework/reinspection chain at `e393b6a`, AR12 Container Loading at `bfe7f15`, AR14 Supplier Quality Audit at `85b4ac7`, AR06/AR07 material-control reports at `9689407`, then AR08/AR09 production/readiness reports at `55a8abd`. The bounded history-test repair is `5e3c99b`. Revert only the exact offending commit; any runtime revert must be followed by proportional tests and, when a cached asset changes, an offline-cache version review; run the full matrix at the next meaningful gate boundary.
5. If a saved copy is rejected, leave the current good order open and retry with the original unedited VESA saved copy. A failed import must not replace the current record.
6. No rollback is presently required because nothing in this handoff was staged or deployed.

### Known issues and support handoff

- Microsoft Excel desktop-reader inspection remains unproven; SheetJS round-trip evidence is not a substitute.
- Real phones/tablets, independent screen-reader review, physical factory acceptance and representative anonymized business-record rehearsal remain external evidence gaps.
- Hosted identity, tenant enforcement, database/object storage, remote synchronization, server-side audit/retention and external message delivery are `DEFERRED_BY_SCOPE` and not live.
- AQL still requires an approved carton-randomization policy/fixture; no rule may be invented.
- Production merge/deploy/DNS/App Centre activation requires an explicit user decision naming the approved SHA and rollback window.
- Support should begin with `AGENTS.md`, `VESA_PROGRESS.md`, each app tracker, this runbook, then the failing command/log. Preserve the user’s saved copies and record the exact branch/SHA before troubleshooting.

### Current handoff verdict

`LOCALLY TESTED / HOLD`. The independently achievable TNA G12 migration, backup/restore, asset-inventory, rollback and support handoff work is complete, and all ten shared UX gates are accepted locally. Staging verification, production publication, provider functions and external acceptance are blocked or unauthorized. The scope-normalized checkpoint score changes only through the separately audited progress/eligibility ledgers; no production-readiness claim changes.

## Historical review at `48ec023` — retained, not current

## 1. Evidence basis and limits

- Counted progress uses only fully `ACCEPTED` gates under the fixed 30/30/30/10 formula. `CONDITIONAL`, `BLOCKED` and `NOT STARTED` gates receive no credit.
- Automated evidence means committed deterministic/source-contract suites. Browser evidence means an authenticated local Chromium workflow against a disposable local server. Visual evidence means retained screenshots or rendered output reviewed locally. None of these substitutes for independent factory acceptance, real-device acceptance, two-account server authorization proof or production approval.
- This is a documentation-only readiness review. Runtime files, frozen PPM checkpoint identities, AQL sampling/Ac-Re tables and decisions, TNA planning data, saved records, service workers and live routes are out of scope.
- Rollback is the single documentation commit that introduces this file and updates `VESA_PROGRESS.md`; no application rollback is required.

## 2. Verified-gate position

| Area | Accepted | Verified % | Independently verified locally | Incomplete or blocked |
|---|---:|---:|---|---|
| TNA 360 | 9 / 13 | 69% | G00–G08: shell, templates/schema, deterministic scheduling and operations, local persistence/XLSX, workspaces, four-language reports, recovery/scenarios/multi-order | G09 conditional local collaboration contracts; G10 local PPM/AQL references and alerts incomplete and provider notifications blocked; G11 regression stabilization not started; G12 release blocked |
| PPM 360 | 9 / 11 | 82% | P-G00–P-G08: frozen 168-checkpoint baseline, shared shell, navigation, decision/approval safeguards, follow-up/history, recovery/update behavior, reports and bounded TNA/AQL references | P-G09 secure collaboration blocked on provisioned server/identity; P-G10 ledger complete but conditional because P49/P50 are blocked and P52 lacks independent assistive-technology/performance/physical-device acceptance |
| AQL 360 | 3 / 13 | 23% | A-G00–A-G02: frozen sampling baseline, shared shell and audit-workflow parity | A-G03–A-G09 have only conditional slices; approved carton-randomization policy/fixtures are absent; A-G10 server security blocked; A-G11 not started; A-G12 release blocked |
| Shared VESA UX | 3 / 10 | 30% | U-G00–U-G02: route/auth map, common six-menu header and central language/theme controller | U-G03–U-G09 typography/tokens, App Centre cards, responsive/accessibility matrices, cross-app regression documentation and uniform-experience acceptance remain unaccepted |

**Program result:** 55% verified, 45% remaining. The current public site and deployed applications must remain unchanged.

## 3. What is independently verified

### TNA

- Deterministic templates, date/calendar/CPM calculations, material/commercial/capacity/shipment operations and critical-path behavior have committed unit evidence.
- Local save/reopen, bounded recovery and workbook import/export defenses have authenticated local browser evidence.
- Workspace, scenario, portfolio and report workflows have local desktop/mobile and four-language evidence through G08.
- G09 proves only local contracts and a disabled/offline-safe adapter. It does not prove secure multiuser collaboration.

### PPM

- The frozen 168 checkpoint identities and planning profile/process baselines are covered by committed fixtures.
- Local workflows through P-G08 have deterministic and browser regression evidence, including GO/HOLD safeguards, signatures/approval invalidation, amendments, recovery, reports and reference-only TNA/AQL links.
- The P01–P52 ledger contains exactly 52 unique rows. P01–P48 and P51 are accepted locally; P49/P50 remain externally blocked and P52 remains conditional.

### AQL

- The shipped sampling arrays, Ac/Re map, Q01–Q24 decisions and portable semantic round-trip baseline are frozen by A-G00 tests.
- The common shell and the existing audit entry/workflow parity are accepted through A-G02.
- Later evidence demonstrates useful local slices, but it does not satisfy whole-gate acceptance and must not alter the frozen sampling rules or existing acceptance decisions.

### Shared VESA UX

- Authenticated local route checks cover Login, App Centre, Admin, AQL, PPM and TNA.
- AQL, PPM and TNA share the Home/File/Edit/View/Tools/Help shell, mobile menu behavior, central language/theme preferences and protected-route behavior through U-G02.

## 4. Missing verification

- A reproducible clean-checkout install/run recipe and complete release-SHA matrix for every Node and browser suite.
- TNA G10 local reference and alert workflows, notification failure safety, then G11 full regression including large portfolios, timezone boundaries, four languages, accessibility, responsive layouts and sibling-app protection.
- PPM two-account tenant/role/IDOR verification against an authorized HTTPS service, plus independent screen-reader, broad performance and physical-device review.
- AQL approved carton-randomization requirements and fixtures; complete 35-area/stage coverage; full pre-final/rework/reinspection/loading chain; durable close/reopen and service-worker upgrade; large evidence/measurement/CAPA records; four-language print/PDF/mobile/zoom/accessibility; full A-G11 regression.
- Shared U-G03–U-G09 acceptance across typography/colors/backgrounds, App Centre cards, desktop/tablet/mobile, keyboard/screen-reader/contrast/zoom, rollback documentation and uniform visual review.
- Independent factory acceptance with representative but non-customer test records.

## 5. Saved-record upgrade posture

| App | Current evidence | Upgrade conclusion | Staging proof still required |
|---|---|---|---|
| TNA | G05 and G08 cover local save/reopen, guarded backup/recovery, workbook exchange and later scenarios | Existing local records are expected to remain non-destructively reopenable under the tested schemas; server synchronization is not active | Import/reopen representative anonymized saved copies on the exact release bundle, verify history/baseline/actuals remain unchanged, exercise quota/rescue and retain rollback backups |
| PPM | P-G06 covers current/V4 and schema 1/2 reopen, malformed/future/oversize rejection, recovery-as-new-draft, quota rescue and old-tab update behavior | Compatibility is strong locally and no destructive migration is authorized; it is not yet staging-approved | Produce one coherent versioned release bundle, then rehearse old-tab/offline/update/reopen with representative anonymized copies and all 168 identities/signatures/decisions preserved |
| AQL | A-G00/A-G07 conditionally cover portable semantic round-trip and guarded import | Baseline portability is proven, but complete legacy/current record, attachment/evidence and worker-update survival is not | Close/reopen representative records, restore evidence assets, verify reinspection lineage and frozen decisions, test failed/quota recovery and upgrade across the exact staged worker bundle |

No staging or production procedure may clear browser storage. Backups must be taken first, imports must be bounded and validated, and recovery must create a new draft rather than overwrite the only surviving record.

## 6. Safe internal staging preview prerequisites

1. User-authorized private staging destination or local packaged preview; do not use the public repository branch as a backup without explicit authorization.
2. A pinned release candidate SHA and coherent asset/service-worker version, built from a clean checkout with recorded dependency versions and commands.
3. Synthetic or explicitly anonymized apparel records only; no credentials, customer records, buyer data or production tokens in Git or browser fixtures.
4. Isolated staging origin and service-worker scope so the existing public site and deployed applications cannot be replaced or contaminated.
5. Pre-upgrade exports, post-upgrade reopen checks and a documented rollback to the previous static bundle and saved-copy format.
6. Supported browser/device matrix, keyboard and screen-reader review, mobile/tablet visual review, offline/update/recovery rehearsal, multilingual reports and cross-app regression.
7. Disabled and clearly labelled collaboration/notification controls until an authorized provider is provisioned. A local preview must not imply server security or live synchronization.

## 7. Requirements before production authorization

- Every applicable TNA, PPM, AQL and Shared gate is accepted with linked evidence; no conditional gate is counted as complete.
- An authorized HTTPS backend provides identity, tenant isolation, role enforcement, database/object storage, audit integrity, idempotency/conflict behavior and notification delivery. Two real test accounts must prove permitted access and denied cross-tenant/IDOR paths.
- Security review covers authentication/session handling, authorization, XSS/untrusted import, attachment boundaries, secret handling, rate/size limits and audit retention.
- Exact release-SHA regression covers PPM's 168 checkpoints, all frozen AQL sampling/Ac-Re fixtures and decisions, TNA baseline/history/CPM calculations, four-language reports, accessibility, responsive layouts, offline recovery and service-worker upgrades.
- Representative anonymized saved records survive the staged upgrade with documented backup and rollback.
- Physical/factory pilot and named acceptance owners sign off outstanding usability, workflow and device evidence.
- The user explicitly authorizes the production SHA, destination, App Centre activation and rollback window. Only then may a controlled merge/deploy/DNS or live-route change be considered.

## 8. Release decision and next local work

**HOLD.** No production deployment or public development-branch push is authorized.

The next independently safe work is TNA G10: add bounded, typed local PPM/AQL reference validation and explicit unavailable/unverified/stale states without reading sibling storage or changing PPM/AQL logic. Then prepare TNA G11 regression, continue AQL conditional gates without inventing carton randomization, and audit Shared U-G03 against the current common shell.
