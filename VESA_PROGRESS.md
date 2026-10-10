# VESA 360 - MASTER PROGRESS DASHBOARD

This is the single human dashboard for the VESA 360 program. It is updated from repository evidence, app execution trackers and passing tests. Only ACCEPTED gates count toward percentages; CONDITIONAL, ACTIVE, BLOCKED, REJECTED and NOT STARTED count as zero.

## A. Program at a glance

| Field | Current saved value |
|---|---|
| **OVERALL VERIFIED** | **14%** |
| **REMAINING** | **86%** |
| **TNA 360** | **46%** - accepted gates 6 / 13 |
| **PPM 360** | **0%** - accepted gates 0 / 11 |
| **AQL 360** | **0%** - accepted gates 0 / 13 |
| **ONE VESA SHARED UX** | **0%** - accepted gates 0 / 10 |
| Program stage | TNA in-progress checkpoint must be completed first, then shared VESA UI contract, then remaining TNA/PPM/AQL gates |
| Active gate | **TNA G06 - Full workspaces, portfolio, Gantt, accessibility** |
| Current subtask / subchecks | Continue G06: reconcile remaining primary workspace views from spec 04, add final accessibility/menu evidence matrix, then decide G06 acceptance |
| Last ACCEPTED gate | **TNA G05 - Local saving, backup, Excel import and migrations** |
| Last tested commit SHA | 0e28d2c |
| Last update (UTC) | 2026-10-10 06:58:15 UTC |
| Live release authorized? | **NO - do not push main/deploy production/DNS without explicit user authorization** |
| Status authority | Git commits + real tests + each app's `06_EXECUTION_TRACKER.md` |

## B. Checkpoint completion score - fixed formula

Accepted gate counts: TNA t / 13, PPM p / 11, AQL a / 13, Shared s / 10.

```text
TNA%     = ROUND(100 * t / 13)
PPM%     = ROUND(100 * p / 11)
AQL%     = ROUND(100 * a / 13)
Shared%  = ROUND(100 * s / 10)
OVERALL% = ROUND(30 * t / 13 + 30 * p / 11 + 30 * a / 13 + 10 * s / 10)
BALANCE% = 100 - OVERALL%

Current counted gates: t=6, p=0, a=0, s=0.
```

## C. Application gate checklist

### TNA 360 - 13 gates, 30% of program

| Gate | Work area | Status | Evidence / commit |
|---|---|---|---|
| G00 | Existing repository audit + scope | ACCEPTED | a220db9; docs/tna tracker; baseline syntax/AQL contract/diff-check evidence |
| G01 | App registration + VESA shell | ACCEPTED | f089480; /apps/tna/ auth shell, App Centre tile, browser smoke |
| G02 | Garment templates + schema | ACCEPTED | 94a7105; g02-domain.test.js; 12 profiles, 126 lifecycle activities |
| G03 | Calendar + dependency CPM | ACCEPTED | 56e0856; g03-scheduling.test.js; CAL/GPH fixtures and CPM-01 |
| G04 | LC, materials, capacity, shipment math | ACCEPTED | 4d36b2c; g04-operations.test.js; COM/APR/CAP/SHP fixtures |
| G05 | Local save/reopen + Excel import/export | ACCEPTED | c6050d7; visible save/reload/open, backup validation, storage recovery, XLSX preview/export and formula defenses tested |
| G06 | Workspaces, Gantt, dashboard | ACTIVE | Next checkpoint |
| G07 | Four languages + reports | NOT STARTED | - |
| G08 | Recovery, scenarios + multiorder | NOT STARTED | - |
| G09 | Secure backend + multiuser | BLOCKED | External provider/identity/database/storage not authorized/provisioned |
| G10 | PPM/AQL links + notifications | BLOCKED | External notification provider not authorized; local reference adapters pending |
| G11 | All-regression stabilization | NOT STARTED | - |
| G12 | Release readiness + authorized deploy | BLOCKED | Requires explicit user production authorization |

### PPM 360 - 11 gates, 30% of program

| Gate | Work area | Status | Evidence / commit |
|---|---|---|---|
| P-G00 | Baseline audit, 168 checkpoint parity | NOT STARTED | PPM docs imported; real local audit not accepted yet |
| P-G01 | Common shared VESA shell | NOT STARTED | - |
| P-G02 | PPM Home/menu/navigation | NOT STARTED | - |
| P-G03 | Checkpoints, applicability, workflow | NOT STARTED | - |
| P-G04 | Approvals, measurements, revision, decisions | NOT STARTED | - |
| P-G05 | Actions, minutes, evidence, amendments | NOT STARTED | - |
| P-G06 | Offline save/restore/update | NOT STARTED | - |
| P-G07 | Reports, translations, accessible UX | NOT STARTED | - |
| P-G08 | TNA/AQL reference integration | NOT STARTED | - |
| P-G09 | Secured collaboration where provisioned | BLOCKED | External server/identity provider not authorized |
| P-G10 | Full acceptance and release authorization | BLOCKED | Requires accepted prior gates and release authorization |

### AQL 360 - 13 gates, 30% of program

| Gate | Work area | Status | Evidence / commit |
|---|---|---|---|
| A-G00 | Inspect large AQL source and freeze sampling baseline | NOT STARTED | AQL docs imported; real local audit not accepted yet |
| A-G01 | Common shared VESA shell | NOT STARTED | - |
| A-G02 | Audit workflow parity | NOT STARTED | - |
| A-G03 | Sampling/statistical engine parity | NOT STARTED | - |
| A-G04 | Defects, scoring, evidence | NOT STARTED | - |
| A-G05 | AQL local save/restore/export | NOT STARTED | - |
| A-G06 | Reports, translations, accessibility | NOT STARTED | - |
| A-G07 | Dashboards and review flow | NOT STARTED | - |
| A-G08 | TNA/PPM reference integration | NOT STARTED | - |
| A-G09 | Stabilization/regression | NOT STARTED | - |
| A-G10 | Secured collaboration where provisioned | BLOCKED | External server/identity provider not authorized |
| A-G11 | Final acceptance hardening | NOT STARTED | - |
| A-G12 | Release authorization | BLOCKED | Requires accepted prior gates and release authorization |

### ONE VESA SHARED UX - 10 gates, 10% of program

| Gate | Work area | Status | Evidence / commit |
|---|---|---|---|
| U-G00 | Shared route/audit map | NOT STARTED | Prior UI work exists, but no formal VESA-UNIFORM-UI-v1 gate accepted yet |
| U-G01 | Shared header/nav/auth surface | NOT STARTED | - |
| U-G02 | Shared theme/language controller | NOT STARTED | - |
| U-G03 | Shared typography/color/background tokens | NOT STARTED | - |
| U-G04 | Shared App Centre card pattern | NOT STARTED | - |
| U-G05 | Shared mobile/tablet behavior | NOT STARTED | - |
| U-G06 | Shared accessibility checks | NOT STARTED | - |
| U-G07 | Shared regression protection for Login/App Centre/AQL/PPM/TNA | NOT STARTED | - |
| U-G08 | Shared documentation and rollback plan | NOT STARTED | - |
| U-G09 | Accepted uniform experience review | NOT STARTED | - |

## D. Active dependencies and blockers

| Area | Status | What is needed |
|---|---|---|
| Production deploy / DNS / main push | BLOCKED | Explicit user authorization after release gates pass |
| Cloud identity, database, object storage, notifications | BLOCKED | Provisioned provider, credentials, tenant policy and deployment target |
| True server-side app URL protection | BLOCKED for static GitHub Pages | Authenticated hosting/proxy or server route gate |
| Real XLSX workbook parsing | CLOSED LOCALLY FOR G05 | Bundled Apache-2.0 SheetJS `xlsx@0.18.5` for local workbook preview/export; report/PDF visual review remains G07 |

## E. Work journal

| Time (UTC) | App/gate | Verdict | Evidence |
|---|---|---|---|
| 2026-10-10 06:09:46 UTC | Program continuity | CONDITIONAL | Imported continuity, PPM and AQL spec packages without overwriting newer TNA tracker; root AGENTS already matched incoming TNA instructions. Specs/dashboard commit pending tests. |
| 2026-10-10 | TNA G05 | CONDITIONAL | bcb25a9 added local storage adapter and safety tests; visible Save/Open proof and XLSX dependency decision remain. |
| 2026-10-10 06:29:54 UTC | TNA G05 | ACCEPTED | Completed visible Save/Open flows, checksum backup, quota/oversize/unsupported-schema safety, local `xlsx@0.18.5` preview/export, macro/formula defenses, Playwright save/reload/open and CSV preview smoke. |
| 2026-10-10 06:37:00 UTC | TNA G06 | CONDITIONAL | First workspace slice added: portfolio panel, dashboard action metrics, owner/stage filters, Gantt preview and accessible timeline table. Node regressions and Playwright full-entry/mobile smoke passed; remaining G06 workspace sections/accessibility matrix still open. |
| 2026-10-10 06:51:12 UTC | TNA G06 | CONDITIONAL | f1b05fb added readiness workspace panels for materials/commercial, approvals, production/capacity and shipment/readiness using existing TNA operations only. PASS: syntax suite for shared/TNA JS; G01-G06 node tests; AQL release contract; git diff --check. Browser PASS via Playwright CLI: login as admin@vesa, create full-entry TNA with explicit start/ex-factory, readiness panels visible, keyboard Tab focus moved, 768px tablet, 512px zoom-equivalent and 390px mobile overflow=false, console errors=0. G06 remains open for interactive filter behavior, multi-PO portfolio proof and final accessibility matrix. |
| 2026-10-10 06:58:15 UTC | TNA G06 | CONDITIONAL | 0e28d2c added real owner/stage filter interactions, local multi-PO portfolio proof and domain-backed activity edit controls. PASS: full syntax suite for shared/TNA JS; G01-G06 node tests; AQL release contract; `git diff --check`. Browser PASS via Playwright CLI: login as admin@vesa, save two local PO records, portfolio table showed both PO references, owner/stage filters and clear filters updated visible timeline, activity edit completed a task with actual date, keyboard focus moved, 390px overflow=false, console errors=0. G06 remains open for final spec-04 workspace reconciliation and accessibility/menu evidence matrix. |
| 2026-10-10 | TNA G04 | ACCEPTED | 4d36b2c operational engines tested with g04-operations.test.js. |
| 2026-10-10 | TNA G03 | ACCEPTED | 56e0856 scheduling engine tested with g03-scheduling.test.js. |
| 2026-10-10 | TNA G02 | ACCEPTED | 94a7105 domain records/templates tested with g02-domain.test.js. |
| 2026-10-10 | TNA G01 | ACCEPTED | f089480 app shell and route smoke verified. |
| 2026-10-10 | TNA G00 | ACCEPTED | a220db9 repository audit and scope map committed. |

## F. NEXT ACTION

Continue **TNA G06**: reconcile remaining primary workspace views from `docs/tna/04_UX_LOCALIZATION_REPORTS.md`, add final accessibility/menu evidence matrix, then decide whether G06 can be accepted. Do not deploy production.
