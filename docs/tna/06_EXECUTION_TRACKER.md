# 06 — TNA 360 Continuity, Execution Ledger, Full-Scope Checklist & Acceptance

**THIS FILE IS THE RESUMPTION SOURCE OF TRUTH FOR VS CODE CODEX.** Keep it in Git. Reconcile it with real code/commits/tests before advancing; do not mark boxes from confidence or narrative alone.

## A. Current execution snapshot — initial handover

| Field | Current value |
|---|---|
| Product | VESA TNA 360 — one program incorporating Phase 1 + Phase 2 + Phase 3 |
| Repository | `venkatbangla-boop/vesahost` |
| Deployment target | `/apps/tna/` under VESA App Centre |
| Specifications | This file plus root `AGENTS.md` and documents `01`–`05` |
| Design status | G03 scheduling implemented locally on feature branch; apparel operational engines/storage/report/cloud groups remain open |
| Implementation status | **G03 IMPLEMENTED LOCALLY / NOT DEPLOYED**; TNA shell, domain records, templates, draft wizard, validation and deterministic scheduling verified |
| Last accepted patch group | **G03 — Calendar, precedence and critical path** |
| Current patch group | **G04 — Apparel operational engines** |
| Production / cloud status | **NOT DEPLOYED / NOT VERIFIED** |
| External block | Cloud hosting/identity/database/notification providers/permissions not yet authorized or provisioned |
| Resume anchor | G03 accepted locally on `feature/tna360-continuous`; next checkpoint is G04 apparel operational engines |
| LAST COMPLETED ACTION | Implemented deterministic date-only calendar engine, graph validator, forward/backward schedule pass, float/critical path, negative-float evidence and UI schedule panel gated by explicit start/required dates |
| NEXT ACTION | Implement G04: commercial/material/approval/capacity/shipment engines, quantity conservation and fixture tests without inventing buyer approvals, LC dates, material release or production rates |

**Snapshot date:** 2026-10-10. The GitHub public repo/main and files were inspected at a documentation level; **Codex must directly inspect its checkout** before code writes. Never treat these notes as a completed local repo audit.

## B. Continuity protocol — what Codex must do each session

### Mandatory initial read/verification

1. Read root `AGENTS.md` and this file. At first kickoff, read all `01`–`05`. For subsequent work, read the relevant subject docs only plus this ledger.
2. Confirm working directory points to repository root; run `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, inspect current relevant code and check for additional `AGENTS.md` overrides. Do not casually clobber preexisting user edits or unrelated branches.
3. Verify statuses/commit hashes/evidence here match code. If they disagree, lower the verdict, record the mismatch, and repair the smallest affected area before advancing.
4. Inspect in-scope **real files** at the file level and define affected ownership, call flow, state, exact files touched, out-of-scope paths, verification and rollback. An old summary is not a substitute.
5. Select the earliest unaccepted nonblocked patch group. Advance without repeated scope questions; ask only for genuine external-provider/security/business policy requirements.
6. After one logically complete patch group: run tests, record test command + output summary + browser screenshots where applicable; update task boxes *only when evidence exists*; append a work log row and precise NEXT ACTION; commit passing work when branch/permissions allow.
7. Do not jump to release or claim three phases done while blockers remain. If blocked by external cloud configuration, continue independent local features and document exactly what remains.

### Checkpoint content to append every patch group

```text
DATE/TIME (timezone):
PATCH GROUP / OBJECTIVE:
BRANCH / BASE COMMIT / RESULT COMMIT:
IN-SCOPE FILES MODIFIED:
OUT-OF-SCOPE FILES VERIFIED UNCHANGED:
DOMAIN / API / SCHEMA CONTRACT IMPACT:
TESTS COMMANDS + PASS/FAIL COUNTS / MANUAL UI EVIDENCE:
DATA MIGRATION / ROLLBACK:
FEATURE IDs PROVEN:
BLOCKERS / RISKS:
VERDICT: accepted | rejected | blocked | conditional
NEXT ACTION: <one exact next patch or external request>
```

If execution is interrupted **before** this block is updated, inspect `git diff`, prior commit, tests and set the actual status. Do not assume work saved in chat history or re-run code generation blindly.

## C. Gate definitions and approval authority

- `draft-only`: plan/spec exists; code/acceptance not proven.
- `accepted`: objective evidence and specified tests pass; compatibility remains intact. Can be internally verified for a patch, but production release additionally needs independent/user review.
- `conditional`: partially proven; name exactly what remains and do not mark final complete.
- `blocked`: cannot execute a particular task safely, missing external access/approval/prerequisite; isolate blocker and proceed with independent work if safe.
- `rejected`: patch failed tests/contracts; fix or roll back before building on it.

**Pre-code gate:** scope, file-level audit, ownership/dependency/state, affected and frozen files, tests and rollback recorded.  
**Implementation gate:** approved/defined patch group only, no unrelated edits.  
**Proof gate:** deterministic tests + UI/export/security checks, not just code review.  
**Release gate:** explicit user instruction, all safety/quality acceptance and live verification.

## D. One continuous execution sequence — G00 through G12

Each group is a checkpoint in **one unified project** (not permission to stop after the first three groups). Committing per group makes sessions resumable and defects reversible.

### G00 — Repository audit and scope map

- [x] Confirm correct repo/branch/current working tree and existing `AGENTS.md` rules.
- [x] Directly inspect `apps/index.html`, `js/app-catalogue.js`, `js/preferences.js`, `js/auth.js`, `/apps/ppm/` shell and linked modules, `/apps/aql/` entry/resources, existing styles/logo, tests/build/deployment config.
- [x] Record exact current ownership/dependency/state and file impact table.
- [x] Lock frozen interfaces for login/PPM/AQL and record regression tests.
- [x] Resolve naming/framework assumptions and provider-neutral architecture tree.
- [x] Create feature branch and committed baseline documents (do not modify main by surprise).
- [x] Record G00 gate and next step below.

### G01 — VESA shell and safe app registration

- [x] Create `/apps/tna/index.html` with consistent branding, login gate, App Centre and Home navigation.
- [x] Register TNA in `js/app-catalogue.js`; add `openTna` for all four languages in `js/preferences.js`.
- [x] Provide Home actions, app menus, appearance, responsive layout, honest error/loading states.
- [x] Verify PPM/AQL/login regression; do not publish nonfunctional app tile to live.

### G02 — Domain records and universal garment templates

- [x] Implement versioned order/task/approval/material/lot schemas; validate all required invariants.
- [x] Build full garment lifecycle/activity library in `02`; dynamic conditional profiles and custom task editing.
- [x] Implement revision history, immutable baseline, current targets vs actuals, authority/evidence and status transitions.
- [x] Complete new-order wizard with Quick/Full/Excel entry and clear unknown fields.
- [x] Fixture tests for knit, woven, denim, sweater, activewear, custom and special processes.

### G03 — Calendar, precedence and critical path

- [x] Implement explicit date-only and working/calendar-day arithmetic with holiday exceptions.
- [x] Implement graph validation, FS/SS/FF/SF relationship behavior, lag, cycles/conflicts, zero milestones.
- [x] Forward/backward plan, earliest/latest dates, free/total float, critical paths, negative float.
- [x] Ensure forecast separated from signed commitments and baseline.
- [x] Pass all CAL/GPH fixtures in `03`; reconcile hand-calculated October 2026 example.

### G04 — Apparel operational engines

- [ ] Master LC contractual lead vs PO vs fabric/trims B2B LC explicit anchors.
- [ ] Fabric/trims in-house/QC, approvals and buyer/local office authority gates.
- [ ] Quantity conservation, factory lines, cutting/sewing/wash/finish/pack stage capacities and WIP.
- [ ] Rolling forecasts, risk reasons, incomplete input handling and overallocated resources.
- [ ] Lot-specific booking/final inspection/ex-factory/ETD/ETA planning and actuals.
- [ ] Pass APR/COM/CAP/SHP fixtures in `03`.

### G05 — Local saving, backup, Excel import and migrations

- [ ] IndexedDB (or accepted equivalent) transaction-safe multiorder save/reopen/autosave/recovery.
- [ ] Save Now, Make Another Copy, Download/Open Saved Copy with schema and size validation.
- [ ] Undo/redo of draft changes, baseline revisions protected and export/import round-trip.
- [ ] Real Excel import mapping preview, ambiguous date detection, safe Excel export and macro/formula defenses.
- [ ] Simulated storage quota, corrupt backup, interrupted write and unsupported schema tests.

### G06 — Full workspaces, portfolio, Gantt, accessibility

- [ ] All screens in `04`, with dashboard, table, activity edit, materials, approvals, production, shipment, portfolio.
- [ ] Real Gantt + accessible table alternative; explain calculation inputs/risk.
- [ ] Desktop/mobile/tablet/keyboard/accessibility and all VESA menus.
- [ ] Today, overdue, next 7 days, action ownership, missing data and filtered multi-PO views.
- [ ] Practice example isolated from real records.

### G07 — Complete language/report system

- [ ] English, Bengali, Hindi, Tamil predefined sentences and report headings with non-mutating language change.
- [ ] Full R01–R12 reports, audience permissions, PDF/print, Excel and share fallback.
- [ ] Visual QA of real generated reports: page breaks, font glyphs, widths, dates, VESA logo/watermark if approved.
- [ ] Round-trip and formula safety; verify user-friendly file and menu wording.

### G08 — Recovery scenarios, advanced multiorder planning

- [ ] Scenario branches with immutable base, alternative capacities/calendars/routes, compare/apply-confirm.
- [ ] Shared factory-line capacity conflicts across orders, resource load, revised delivery analysis.
- [ ] Split shipment planning and order/lot quantity reconciliation.
- [ ] Advanced management filters, portfolio risk and provenance of forecast.
- [ ] Tests for scenario non-mutation, overlapping workloads and uncertainty.

### G09 — Phase 3 secure backend and collaboration

- [ ] Document user-approved hosting/identity/DB/storage/email provider and production security decisions; **if unavailable, mark remaining deployment BLOCKED rather than faking it**.
- [ ] Implement versioned tenant/order API contracts, schema migration and secure backend against chosen authorized runtime.
- [ ] Server-side auth, scope-level RBAC/ABAC, buyer/factory/private field isolation and audited approvals.
- [ ] Cross-user collaboration, expected-revision conflicts, conflict resolution, idempotency and offline draft queue.
- [ ] Private evidence storage, export/privacy handling, backups, provider health and error paths.
- [ ] Two-account cross-company allow/deny test proof with actual configured staging backend before claiming accepted/live.

### G10 — Integration links and notifications

- [ ] PPM and AQL reference matching and verified status mapping, without touching their release/inspection logic.
- [ ] Safe unavailable/unverified references and stale schema conditions.
- [ ] In-app action alerts from rules; permission-scoped notifications and quiet-hours/deduplication policies.
- [ ] Configured server-delivered notification channels, delivery receipts/retries and unsubscribe; if external provider missing, explicitly blocked—not 'sent'.
- [ ] Tests for false approval, double-send, unauthorized recipients and fail closed behavior.

### G11 — Full verification and stabilization

- [ ] Run deterministic tests from `03` + browser end-to-end suite and large portfolio performance tests.
- [ ] Test save/reopen across browser reload and schema changes; genuine Excel/PDF viewers; no clipped reports.
- [ ] Verify all 4 languages, keyboard/mobile/theme, as-of date and timezone invariants.
- [ ] Security audit: cross-tenant/IDOR, XSS/file imports, server permission checks, private attachments, no exposed secrets.
- [ ] Login/App Centre/PPM/AQL regression and console errors, standalone direct route, back links.
- [ ] Reconcile all F01–F50 and R01–R12 against actual code/evidence.
- [ ] Document external blockers precisely; no "all tests passed" without logs.

### G12 — Preview, production readiness and handoff

- [ ] Commit stable branch; include rollback instructions, migration dry run, backup/restore proof.
- [ ] Verify staging URL/app route, all assets, auth redirect, reports and critical path.
- [ ] Receive explicit user release authorization; record user decision.
- [ ] Deploy authorized tested build to repo `main`; verify live `https://vesaent.com/apps/tna/` and VESA App Centre tile.
- [ ] If cloud enabled, verify secure production API, real two-user sync and notification delivery.
- [ ] Capture SHA, deployed time, screenshots, test counts, known issues and support instructions.
- [ ] Final report accurately states `locally implemented`, `staging verified`, `production live`, or `blocked` for each capability.

## E. Master feature completion list F01–F50

**Instructions:** Check **only** after code exists, tests pass and evidence is recorded in section H. A function present in a template/mock does not satisfy secure cloud acceptance. IDs are defined in `01_MASTER_BLUEPRINT.md`.

| Feature group | Checklist (all initially open) |
|---|---|
| Entry & template | F01, F02, F03, F04, F05, F06, F35 |
| Scheduling | F07, F08, F09, F10, F11, F15, F16, F25 |
| Commercial & manufacturing | F12, F13, F14, F20, F21, F23, F48 |
| Tracking & intelligence | F17, F18, F19, F22, F24, F32, F47 |
| Files & UX | F26, F27, F28, F29, F30, F31, F33, F34, F41, F42, F44 |
| Cloud & quality | F36, F37, F38, F39, F40, F43, F45, F46, F49, F50 |

- [x] F01 App Centre integration
- [x] F02 Home actions
- [x] F03 Quick/Full/Import creation
- [x] F04 Universal product templates
- [x] F05 Conditional/custom activities
- [ ] F06 Complete order master
- [x] F07 Immutable baseline
- [x] F08 Forward scheduling
- [x] F09 Backward scheduling
- [x] F10 Working calendars
- [x] F11 Critical Path and float
- [ ] F12 Materials & LC milestones
- [ ] F13 Approval and reviewer authority
- [ ] F14 Production capacity and WIP
- [x] F15 Separate dates, audit and revisions
- [x] F16 Dependency graph / lag
- [ ] F17 Daily follow-up and next 7 days
- [ ] F18 Explainable risk and blocker ownership
- [ ] F19 Recovery scenarios
- [ ] F20 Shipment readiness
- [ ] F21 Split shipments
- [ ] F22 Multiorder portfolio
- [ ] F23 Department-specific views
- [ ] F24 Role-based views and required security
- [ ] F25 Gantt / timeline
- [ ] F26 Reports R01–R12
- [ ] F27 Valid Excel import/export
- [ ] F28 PDF / Print / Share fallback
- [ ] F29 Local save/reopen/autosave
- [ ] F30 Portable safe backup and migration
- [ ] F31 Draft undo and reviewed changes
- [ ] F32 Filtering/search/status
- [ ] F33 Complete four-language UI
- [x] F34 Responsive VESA appearance
- [x] F35 Safe practice sample
- [ ] F36 In-app and configured background alerts
- [ ] F37 Tenant-aware cloud data model and server enforcement
- [ ] F38 Live collaboration and conflict handling
- [ ] F39 Verified reviewer approval invitations
- [ ] F40 Verified PPM/AQL links
- [ ] F41 Excel import compatibility and mapping
- [ ] F42 Offline and performance verification
- [ ] F43 Security and data privacy proof
- [ ] F44 Usable plain-language help
- [ ] F45 Test/QA/regression/release evidence
- [ ] F46 Scheduled reminders with deduplication
- [ ] F47 Scenario revision history
- [ ] F48 Shared resource load balancing
- [ ] F49 Versioned integration contracts
- [ ] F50 Audit/retention/export governance

**No removal of any F ID without explicit user-approved scope change recorded below.** If cloud provisioning is pending, cloud-related IDs stay unchecked with external blocker evidence; locally testable parts can have granular proof in section H.

## F. Report acceptance list R01–R12

- [ ] R01 Master TNA PDF + Excel
- [ ] R02 Buyer TNA, protected field visibility
- [ ] R03 Factory Daily Action
- [ ] R04 Critical Path report
- [ ] R05 Weekly follow-up
- [ ] R06 Delay & Recovery report
- [ ] R07 Production Status
- [ ] R08 Material & LC
- [ ] R09 Shipment Readiness
- [ ] R10 Portfolio / Multi-PO
- [ ] R11 Approval history / evidence
- [ ] R12 Scenario comparison

Mandatory for each report: generated date/as-of, buyer/factory/style/PO as permitted, original/current/forecast/actual distinctions, accurate units/dates, VESA logo/branding, readable multi-page output, saved version provenance, no leakage to unauthorized viewers.

## G. Test/evidence coverage checklist

### Pure domain fixtures from `03_SCHEDULING_ENGINES.md`

- [ ] CAL-01 to CAL-05 (working days, holidays, timezone/leap/milestones)
- [ ] GPH-01 to GPH-09 (graph, all supported relations, float, missing inputs, conflicts)
- [ ] COM-01 and COM-02 (LC anchors, B2B separation)
- [ ] APR-01 to APR-03 (approval, local authority, resubmission)
- [ ] CAP-01 to CAP-05 (capacity, WIP, shared resource and quantity integrity)
- [ ] SHP-01 and SHP-02 (partial shipments / inspection hold)
- [ ] SCN-01 and SCN-02 (scenario preview vs approved revision)
- [ ] RSK-01 and RSK-02 (unknown and multiple risk reasons)
- [ ] PERF-01 (large plan/no stale state)

### Browser/file/role checks

- [x] Direct route `/apps/tna/` and auth redirect; App Centre links work
- [x] Existing login, App Centre, PPM, AQL regression
- [x] TNA Home/new/recent/practice/offline paths
- [ ] Save → browser reload → reopen exact values
- [ ] Corrupt/oversize/version-mismatch backup safely rejected
- [x] Baseline cannot be altered by editing forecast/actual
- [ ] Excel import preview/mapping, Excel export and formula safety
- [ ] Actual PDF, print and share fallback tests
- [ ] Bengali/Hindi/Tamil translation and glyph rendering
- [ ] Mobile/tablet/desktop, zoom, keyboard/screen-reader semantics
- [ ] Backend requires auth; unauthorized/cross-tenant reads/writes rejected
- [ ] Two distinct users sync with correct conflict resolution (real staging)
- [ ] Browser offline queue conflict and reconnection resolution
- [ ] No fabricated notification delivery; server notification dedupe
- [ ] Public GitHub history/deployed assets contain no secrets/private PO data

**Evidence pattern:** `tests/<specific test name>`, command or CI run, browser/version, screenshot/report path, pass count and date. Do not create screenshots/links that do not exist.

## H. File-level audit / change and proof journal — append, never erase

### G00 file-level audit table (to be filled by Codex after direct inspection)

| Exact path | Responsibility, state & dependencies observed | In/out of scope | Risk / compatibility contract | Verification / rollback |
|---|---|---|---|---|
| `apps/index.html` | Shared App Centre page loads `preferences.js`, `auth.js`, `app-catalogue.js`; renders enabled catalogue entries after `VesaAuth.requireAuth()` and `VesaAuth.renderUserBar()`. | In scope for adding TNA tile only. | Preserve existing AQL/PPM cards, auth redirect and user bar; do not publish a dead app tile. | Rollback by reverting catalogue/App Centre patch; verify `/apps/` after login. |
| `js/app-catalogue.js` | Small client-side catalogue currently contains enabled AQL and PPM with order, route, text and i18n label keys. | In scope for adding TNA entry. | Preserve AQL/PPM order and existing labels; disabled/future apps must not appear. | `node -c js/app-catalogue.js`; browser App Centre check. |
| `js/preferences.js` | Owns global language/theme preferences, labels for login/App Centre/AQL/PPM and preference propagation keys. | In scope for `openTna` and TNA shell labels only. | Preserve existing storage keys and four-language behavior; do not expose duplicate controls inside apps. | `node -c js/preferences.js`; language selection smoke. |
| `js/auth.js` | Browser-local demo auth/session/user bar with local login events; not server security. | Frozen except using its existing guard/render APIs. | TNA must use `data-auth-guard="app"`; do not claim server-side auth or weaken existing `/login/`, `/admin/`, PPM/AQL checks. | `node -c js/auth.js`; direct-route login redirect browser check. |
| `apps/ppm/*` | Existing self-contained PPM 360 app with app-scoped service worker, compact HOME/FILE/EDIT/VIEW/TOOLS/HELP menu, local storage, report/update tests requiring Playwright package. | Out of scope except regression verification. | No PPM domain/schema/menu changes for TNA; preserve worker cache and PPM record compatibility. | Existing tests: `apps/ppm/tests/*.cjs` need local `playwright`; browser smoke is fallback evidence. |
| `apps/aql/*` | Existing self-contained AQL/Quality Centre with auth guard, welcome gate, AQL menu, service worker and release-contract test. | Out of scope except regression verification. | Do not edit AQL engine or report logic for TNA; TNA links only through verified references later. | `node apps/aql/tests/release-contract.cjs`; browser smoke. |
| `apps/tna/*` | New app route does not exist in repo at G00. | In scope from G01 onward. | Must isolate storage namespace by authenticated user key and not share PPM/AQL schemas. | New tests under `apps/tna/tests/`; route/browser checks. |
| `service-worker.js` | Root static cache serves public/login/apps/admin assets and intentionally excludes AQL/PPM app folders. | In scope for TNA cache ownership decision. | Do not let root worker serve stale app bundles across app-owned workers. Add TNA route deliberately. | `node -c service-worker.js`; route reload checks. |
| `services/tna-api/*` | No backend service exists. Phase 3 cloud is external-provider gated. | Future/provisioned scope only; not required for local G01. | Server collaboration/notifications stay `BLOCKED — EXTERNAL DEPENDENCY` until provider and secrets are authorized. | Future server tests; no production claim before staging proof. |

### Accepted patch work log

| Time | Group | Branch / SHA | Files changed | Tests / evidence | Verdict | Next action |
|---|---|---|---|---|---|---|
| 2026-10-10 | documentation handover only | not committed in repo | seven Markdown docs generated for copying | file creation/zip verification pending | draft-only | G00 |
| 2026-10-10 10:15 Asia/Dhaka | G00 repository audit and scope map | `feature/tna360-continuous` / `a220db9` | `AGENTS.md`, `docs/tna/*.md`, tracker audit updates | Read all six docs; inspected `apps/index.html`, `js/app-catalogue.js`, `js/preferences.js`, `js/auth.js`, PPM/AQL/service workers/tests; baseline syntax checks, AQL release contract and `git diff --check` passed before commit | accepted | G01 app shell and safe registration |
| 2026-10-10 11:21 Asia/Dhaka | G01 VESA shell and safe app registration | `feature/tna360-continuous` / `HEAD after G01 commit` | `apps/tna/index.html`, `apps/tna/assets/tna.css`, `apps/tna/src/bootstrap.js`, `apps/tna/tests/g01-shell.test.js`, `js/app-catalogue.js`, `js/preferences.js`, `service-worker.js`, tracker evidence | PASS: `node -c js/app-catalogue.js`; `node -c js/preferences.js`; `node -c js/auth.js`; `node -c service-worker.js`; `node -c apps/tna/src/bootstrap.js`; `node apps/tna/tests/g01-shell.test.js`; `node apps/aql/tests/release-contract.cjs`; `git diff --check`. Browser PASS via Playwright CLI on local server: logged-out `/apps/tna/` redirected to `/login/?next=%2Fapps%2Ftna%2F`; login `admin@vesa` opened TNA; App Centre showed AQL/PPM/TNA; TNA 390px and 1280px overflow=false; AQL/PPM opened with 0 console errors. Production not deployed. | accepted | G02 domain records and universal garment templates |
| 2026-10-10 11:32 Asia/Dhaka | G02 domain records and universal garment templates | `feature/tna360-continuous` / `HEAD after G02 commit` | `apps/tna/src/domain.js`, `apps/tna/src/bootstrap.js`, `apps/tna/assets/tna.css`, `apps/tna/index.html`, `apps/tna/tests/g01-shell.test.js`, `apps/tna/tests/g02-domain.test.js`, `service-worker.js`, tracker evidence | PASS: `node -c js/app-catalogue.js`; `node -c js/preferences.js`; `node -c js/auth.js`; `node -c service-worker.js`; `node -c apps/tna/src/domain.js`; `node -c apps/tna/src/bootstrap.js`; `node apps/tna/tests/g01-shell.test.js`; `node apps/tna/tests/g02-domain.test.js`; `node apps/aql/tests/release-contract.cjs`; `git diff --check`. Browser PASS via Playwright CLI on local server: login opened `/apps/tna/`; New TNA quick draft created `STYLE-100` with 105 knit tasks, stage chips and separate validation count; `window.VesaTnaDomain` exposed 12 profiles and 126 library activities; 390px overflow=false; Excel-entry tab displayed staged-import/G05 workbook parsing warning; console errors=0. No production deploy. | accepted | G03 calendar, precedence and critical path |
| 2026-10-10 11:40 Asia/Dhaka | G03 calendar, precedence and critical path | `feature/tna360-continuous` / `HEAD after G03 commit` | `apps/tna/src/scheduling.js`, `apps/tna/src/bootstrap.js`, `apps/tna/index.html`, `apps/tna/tests/g01-shell.test.js`, `apps/tna/tests/g03-scheduling.test.js`, `service-worker.js`, tracker evidence | PASS: `node -c js/app-catalogue.js`; `node -c js/preferences.js`; `node -c js/auth.js`; `node -c service-worker.js`; `node -c apps/tna/src/domain.js`; `node -c apps/tna/src/scheduling.js`; `node -c apps/tna/src/bootstrap.js`; `node apps/tna/tests/g01-shell.test.js`; `node apps/tna/tests/g02-domain.test.js`; `node apps/tna/tests/g03-scheduling.test.js`; `node apps/aql/tests/release-contract.cjs`; `git diff --check`. Fixtures: CAL-01/02/05 and GPH-01/02/03/06 passed; CPM-01 A/B/C/D exact October 2026 dates and holiday slip 1 working day passed. Browser PASS via Playwright CLI on local server: full-entry draft with explicit `2026-10-12` start and `2026-11-30` ex-factory displayed forecast `2027-03-08`, late 70 working days, 1 critical chain; no console errors; 390px overflow=false; baseline/current/actual not overwritten. No production deploy. | accepted | G04 apparel operational engines |

### Open blockers and decisions

| ID | State | Required action / owner | Downstream impact |
|---|---|---|---|
| B01 | External configuration missing | User authorizes secure cloud/API+DB provider, identity, data residency and storage | G09 live collaboration |
| B02 | External configuration missing | User authorizes sender/domain/provider/opt-ins for scheduled alerts | G10 server notification delivery |
| B03 | Verified for G00 | Repo surfaces, PPM/AQL assets and available tests inspected on `feature/tna360-continuous` | G00 gate closed; keep running regressions after TNA changes |
| B04 | Not yet verified | Verify local spreadsheet/PDF dependencies, license and fonts | G05/G07 exports |
| B05 | Business configuration to be collected per order | Real calendar, buyer approvals, supplier and factory production lead/rates | Per-order reliable calculated forecast, not application code acceptance |

Do not convert an external blocker into a fabricated successful feature. Do not block independent features while awaiting a provider selection.

### Architecture / product decisions register

| ID | Decision | Status | Impact |
|---|---|---|---|
| D01 | One `/apps/tna/index.html` entry with modular assets | Proposed | Website integration |
| D02 | 3 phases in one program, independently tested groups | Adopted by handover intent | Continuity |
| D03 | Original dates immutable and separate from current/forecast/actual | Required | Record and CPM models |
| D04 | No invented durations/calendars/approvals/standards | Required | Every computation |
| D05 | Offline local first + honest cloud feature gate | Required | Security and correctness |
| D06 | No direct PPM/AQL domain edits for TNA | Required unless separate authorized refactor | Compatibility |
| D07 | User authorizes provider choices / final production deploy | Pending | G09/G12 |

For architecture changes append D08+ with reason and affected docs/feature tests. Do not alter signed decisions or the blueprint silently.

## I. Definition of DONE — ALL three phases

A claim of **"TNA 360 completed and live"** requires every item below:

- [ ] Feature register F01–F50 all accepted, including cloud-dependent features backed by real verified services, not mocks.
- [ ] G00–G12 recorded with scope, positive acceptance verdicts and commit/release evidence.
- [ ] R01–R12 export tests and visual reviews passed; readable in supported locale/device/browser configurations.
- [ ] Exact deterministic scheduling fixture calculations proven; full garment scenarios and real data validation rules used.
- [ ] Every normal user data path works: create → save → resume → revision → report → reopen backup → recover.
- [ ] Security gate: actual backend access enforcement, tenant isolation, attachment policies and confidential field filtering verified in staging and production (if cloud feature claimed).
- [ ] Confirmed original TNA/approval/AQL/PPM historical evidence cannot be overwritten or falsified.
- [ ] `vesaent.com/apps/tna/` live link and App Centre tile work; regression for existing apps passed; user authorized publication.
- [ ] Final summary includes release SHA, live/staging URL, known limitations, proof locations, recovery and rollback steps.

If one item is missing, report **"partially completed"** with the exact checklist entries and blockers. Do not downgrade the scope or mark a feature "not applicable" merely because it is difficult.

## J. Human-friendly VS Code starter / resumption prompts

### First time (one paste after copying all seven files)

> Build VESA TNA 360 across all three phases as one complete continuous project. Open AGENTS.md and docs/tna/01 through 06. First audit this repository and create a safe TNA feature branch; do not edit code without exact impact scope. Then implement the G00–G12 patch groups in docs/tna/06_EXECUTION_TRACKER.md, testing each, updating checkboxes/evidence/NEXT ACTION and committing verified groups. Preserve VESA website login, App Centre, PPM and AQL. Implement no fake approvals, guessed planning inputs or sham cloud services. Finish every independently achievable feature; if cloud provision or external access is genuinely missing, record the precise blocker and continue safe independent work. No production deploy without my explicit instruction.

### Any later session (one paste)

> Continue exactly from AGENTS.md and docs/tna/06_EXECUTION_TRACKER.md. Compare the tracker with current git commits, working tree and tests. Recover the last incomplete group without losing earlier verified work, inspect the relevant specification docs, implement and test the next scoped changes, update evidence and NEXT ACTION in the tracker. Do not restart, duplicate code, forget any of the 50 features or falsely claim that unconfigured cloud collaboration is live.

## K. Final implementation summary template (Codex fills only with proof)

```text
VESA TNA 360 — implementation result
Repository / branch / commit:
Published route and verification:
Accepted patch groups:
Features proven / unproven (F IDs):
Tests executed / pass/fail counts and evidence paths:
Baseline/forecast/capacity CPM fixture results:
Report formats / verified reader results:
4-language and responsive evidence:
PPM/AQL/login regression outcome:
Cloud collaboration actual provider/status:
Security / notification actual status:
Known blocked external prerequisites:
Data backup & rollback method:
Next safe action or final acceptance verdict:
```
