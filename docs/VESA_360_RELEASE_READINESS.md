# VESA 360 Release-Readiness Review

**Review date:** 2026-10-11
**Branch:** `feature/tna360-continuous`
**Evidence baseline:** `48ec023`
**Decision:** **HOLD — not ready for production deployment**

This review reconciles the application execution trackers and the master dashboard. It authorizes no push, merge, deployment, DNS change, live App Centre route change, provider activation or production-data use.

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
