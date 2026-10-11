# 06 — PPM 360 Continuous Execution Tracker, Gates, Tests & Resume State

**MANDATORY living ledger for VS Code Codex.** Update in Git after every verified patch. Do not fabricate a completed checkbox, percent, screenshot, test or push. Scope includes Phase 1+2+3; each gate is reversible and independently tested. External backend work may remain BLOCKED while other gates complete.

## Initial reality snapshot (handover creation: 2026-10-10)
| Field | Status |
|---|---|
| Repo | `venkatbangla-boop/vesahost`, default branch `main` (verify locally) |
| Product | PPM 360 rework at `/apps/ppm/`, one VESA UI with AQL/TNA |
| Specs | `apps/ppm/AGENTS.md` + `docs/ppm/01`–`06` |
| Original PPM app | Exists; multi-file JS, old header/sticky menu + complex domain |
| Source review | GitHub file-level static audit performed; NO live browser screenshot here |
| Last accepted implementation gate | **P-G06 — PPM saving, recovery, offline and update reliability** (`2f14e4a`; accepted locally, not deployed) |
| Status | `accepted locally` for P-G00 baseline through P-G06 saving/recovery/offline/update; P-G07 is active; no production deployment |
| Current gate | `P-G07 — PPM reports, four languages, print and accessibility` |
| LAST COMPLETED ACTION | Added the explicit additive PR01–PR10 catalogue and dedicated release, blocker, attendance/minutes and custom-evidence reports in `f881f0c`; all ten synthetic PDFs, immutable source, 390px selector and full PPM regressions pass |
| NEXT ACTION | Route every PR01–PR10 authored heading/label through LocaleService for EN/BN/HI/TA and prove all ten report modes preserve entered values before final print/zoom/theme accessibility QA |
| External blocker | Secured backend and cross-company role/approval credentials are not provisioned; clean-checkout reproduction still needs an intentional package/runtime setup because the repository has no package manifest |

## Universal session protocol
Read `apps/ppm/AGENTS.md` and this tracker; compare actual `git status`, commits, tests and screenshots with ledger. If there is a discrepancy, downgrade status and inspect before changing. Pick earliest *accepted-prerequisite* group, implement one small patch, run tests, verify other apps not broken, commit, append log, set next action. Any new/changed UI model must be measured against `VESA-UNIFORM-UI-v1` in document 04. Never directly push main without explicit release instruction.

## Gate sequence (one continuous rework program)
### P-G00 — Audit and accepted baseline (NO code edit before passing)
- [x] Repository root, branch, dirty tree, HEAD, installed instructions, tests/deps confirmed.
- [x] Directly inspect every currently scoped PPM, platform, service worker and test file; map ownership/state/call/dependencies.
- [x] Name exact in-scope/watched/frozen files and rollback posture; preserve the existing continuous feature branch.
- [x] Capture existing 168 checkpoint tuples, profile list, normal/abnormal readiness fixtures and V4/V5 saves.
- [x] Run current 3 PPM test suites; log command, versions, pass/fail; capture desktop/mobile baseline screenshots.
- [x] Record audit verdict `accepted` with evidence or `blocked` and exact missing prerequisite.

### P-G01 — One shared VESA shell platform gate (coordinate with AQL/TNA)
- [x] Audit root auth/preferences/App Centre and coordinate one common shell patch, not one per app.
- [x] Create/approve shared nav/theme interface; one sticky navigation region and correct return-to-Apps.
- [x] Verify root `/`, login, apps, admin, PPM, AQL and available TNA routes across devices before claiming platform accepted.
- [x] Existing app behavior, local accounts, preferences and identity unaffected.

### P-G02 — PPM adapter, home and toolbar cleanup
- [x] Replace PPM `#fileMenu` positional behavior with shared navigation adapter; no duplicate controls.
- [x] Home New/Continue/Open Saved/Practice/Open Saved Copy follows same layout as AQL/TNA.
- [x] Dashboard, summary cards and section nav scroll normally; no overlap 320/360/390/768/1280.
- [x] Show Save state from real repository, not a synthetic success label.
- [x] PPM domain and 168 checkpoint parity unchanged.

### P-G03 — PPM applicability, easy workflow, search and custom controls
- [x] Inline step-by-step help, next-action list, all relevant sections/filters available.
- [x] Product/process relevance, N/A, custom checkpoints/critical flags exactly preserved.
- [x] Buyer/market/manual authority text and status understood without technical jargon.

### P-G04 — Approvals, measurement, revision and decision explainability
- [x] Frozen GO/CONDITIONAL/HOLD parity passes for all synthetic cases.
- [x] Required approvals, excluded statuses, who/date/proof handled with no silent waiver.
- [x] POM boundaries, invalid data, unit, asymmetric tolerance tested and explained.
- [x] Controlled revision invalidates stale signoff; locked records safe.
- [x] Explain blocker/action/owner without inventing new buyer rules.

### P-G05 — Follow-ups, meeting minutes, evidence and amendment enhancements
- [x] Action ownership/aging/escalation and date-source rules.
- [x] Optional minutes/waivers/authority record with versioned compatibility.
- [x] Evidence links/attachment references and failed save protection (reference-only; no binary upload claim).
- [x] Amendment history and approvals/signature invalidation fully tested.

### P-G06 — Saving, recovery, offline and update reliability
- [x] Existing and new saved copies decode/reopen with no loss.
- [x] Corrupt/oversized/future data rejected atomically; previous draft preserved.
- [x] Offline first open and upgrade while old tab remains open.
- [x] Quota/browser-storage failures result in actionable rescue flow, not fake saved status.

### P-G07 — Reports, four languages, print and accessibility
- [x] Report PR01–PR10 coverage recorded; existing producer not broken.
- [ ] English/Bengali/Hindi/Tamil authored language views; user values unchanged.
- [ ] PDF/print readable, no missing font glyphs/rows, logo/brand/watermark correct.
- [ ] Keyboard, dialog, 200% zoom, 320px mobile, light/dark/other themes tested.

### P-G08 — TNA/AQL references and platform compatibility
- [ ] Verified record-reference adapters/identity mapping, no direct sibling store writes.
- [ ] PPM does not alter AQL Ac/Re or TNA forecast; no auto-authorized GO.
- [ ] Shared shell visual regression across all available apps passed.

### P-G09 — Secure server collaboration designs and guarded integration
- [ ] Tenant/actor/role/approval/audit API contracts & offline conflict design.
- [ ] Server-side integration tested only with authorized provider; otherwise explicit BLOCKED — EXTERNAL DEPENDENCY.
- [ ] No claim of secure multi-user while running static local login.

### P-G10 — Final acceptance & release gate
- [ ] Every P01–P52 feature has evidence-backed disposition; no silent omission.
- [ ] Full PPM tests; AQL tests; login/App Centre/TNA checks where available.
- [ ] Screenshot set 320/360/390/768/1024/1280/1440 and scroll/modal/report.
- [ ] Independent/user review of release behavior, backup migration and rollback.
- [ ] User expressly approved production deployment (otherwise do not deploy).
- [ ] After approved deploy, cache/version and live checks recorded with exact commit.

## Feature verification ledger — do not leave IDs silently unchecked
For each ID P01 through P52 defined in `01_AUDIT_MASTER_BLUEPRINT.md` record `accepted | conditional | blocked | rejected | not-started` and evidence link/command. A `PRESERVE` capability is not automatically complete until verified against the real baseline. Recommended machine-readable rows:
```text
FEATURE-ID | STATUS | GATE | TEST/SCREENSHOT/FILE | LAST VERIFIED COMMIT | COMMENTS
P01 | not-started | P-G00 | — | — | verify existing identity preservation
...
P52 | not-started | P-G10 | — | — | visual/device/a11y proof
```

## Mandatory test coverage checklist
- [ ] All 168 checkpoint IDs/profile guards/decision invariants.
- [ ] Approval, measurement, change review, finalized lock, duplicate/invalid ID.
- [ ] V4 and current V5 saved-copy + PDF report + offline upgrade.
- [ ] Mobile scroll, one-sticky-only, focus/mouse/touch/screen reader, languages/themes.
- [ ] No browser console/runtime errors, broken links or horizontal clipping.
- [ ] Never reset local buyer/factory records as a repair step.
- [ ] Rollback tested for shell-only change, no data schema destructive migration.

## Append-only progress log — fill during actual Codex execution
```text
TIME / TIMEZONE:
GATE / OBJECTIVE:
BRANCH / BEFORE SHA / AFTER SHA:
FILES CHANGED (EXACT):
FILES WATCHED/FROZEN (DIFF CHECK):
DOMAIN/SCHEMA CHANGE & MIGRATION:
TEST COMMANDS + OUTPUT/COUNTS:
BROWSER SCREENSHOTS / REPORT PATHS:
EVIDENCE FOR FEATURE IDs:
BLOCKERS / UNRESOLVED RISK:
REVIEWER / VERDICT (accepted|conditional|blocked|rejected|draft-only):
NEXT ACTION (ONE PRECISE STEP):
```

## Resume prompt
> Continue PPM 360 from actual Git HEAD and `apps/ppm/AGENTS.md` + `docs/ppm/06_EXECUTION_TRACKER.md`. Reconcile last accepted gate/commit with tests, then implement the earliest incomplete safe patch. Keep one VESA-UNIFORM-UI-v1 interface across PPM/AQL/TNA, preserve all 168 PPM checkpoints and saved copies, append evidence and NEXT ACTION, commit only passing work, never deploy without authorization.

## Current audit — P-G00 (2026-10-10, Asia/Dhaka)

This is an audit-only checkpoint; no PPM source, shared platform file, or test file was changed.

- Repository evidence: root `F:/download temp browser/vesahost-release-work`, branch `feature/tna360-continuous`, clean tree before this tracker entry, HEAD `8b06f6f`, Node `v24.13.1`, npm `11.8.0`, `npx` available. The existing continuous feature branch is preserved; no PPM-only branch was created.
- File ownership audit: `apps/ppm/core.js` owns `PROCESS_OPTIONS`, `GARMENT_PROFILES`, `SECTION_SCHEMA`, `RelevanceEngine`, `CoverageEngine`, `ValidationEngine`, `PpmRecordFactory`, repository/backup/report/domain orchestration and `AppController`; `workspace.js` owns `V5Workspace` shell/workspace mutation, menus, language and finalized-record guard; `planning-services.js`, `record-services.js`, `planning-panel.js`, `report-service.js` own planning/record/report adapters; `index.html`, `languages.js`, `workspace.css` own markup/localized content/styles; `service-worker.js` owns cache/update behavior. `tests/regression.cjs`, `tests/planning.cjs`, and `tests/update.cjs` own the current browser/domain/update regression suites and all require the `playwright` Node module before execution.
- Frozen/in-scope paths for the next P-G00 completion: `apps/ppm/core.js`, `apps/ppm/index.html`, `apps/ppm/languages.js`, `apps/ppm/planning-panel.js`, `apps/ppm/planning-services.js`, `apps/ppm/record-services.js`, `apps/ppm/report-service.js`, `apps/ppm/service-worker.js`, `apps/ppm/workspace.css`, `apps/ppm/workspace.js`, and `apps/ppm/tests/*.cjs`. Watched compatibility paths: root auth/App Centre, shared preferences, `/apps/aql/`, `/apps/tna/`; no shared-shell or domain edits are in scope for this audit. Rollback posture: revert the future P-G00 test/fixture-only commit; do not reset or clear local records.
- Runtime source capture: a VM load of `core.js`, `planning-services.js`, and `record-services.js` reported `APP_VERSION=5.1.5`, `168` master tuples across the 11 sections, `19` profile IDs (including the blank universal and `custom` entries), `12` process IDs, and a fresh record with version `5.1.5`, independent status/remark maps, approvals, change-review, measurement, action, photo, signature, release and UI state. This confirms the source counts; the required committed tuple/V4/V5 fixture is still open.
- Baseline suites attempted from the clean checkout:
  - `node apps/ppm/tests/regression.cjs` — **BLOCKED before execution**: `Cannot find module 'playwright'`.
  - `node apps/ppm/tests/planning.cjs` — **BLOCKED before execution**: `Cannot find module 'playwright'`.
  - `node apps/ppm/tests/update.cjs` — **BLOCKED before execution**: `Cannot find module 'playwright'`.
  - `npx --yes --package playwright -c "node apps/ppm/tests/regression.cjs"` — same unresolved module error; no dependency was added to the repository.
- Browser baseline captured with Playwright CLI `0.1.22` against a disposable local server, authenticated only with the repository’s documented demo account (`admin@vesa` / `vesa`): `output/playwright/ppm-pg00-desktop-home.png`, `ppm-pg00-mobile-home.png`, `ppm-pg00-desktop-editor.png`, `ppm-pg00-mobile-editor.png`. Desktop and mobile pages rendered; CLI console query reported `Errors: 0, Warnings: 0`. Visual inspection found the existing mobile section strip clips horizontally (`TECHNICA...`); this is baseline evidence for a later UX gate, not a P-G00 change.
- Verdict: **BLOCKED — ENVIRONMENT DEPENDENCY** for P-G00 acceptance. The repository/domain audit and screenshot baseline are captured, but the gate cannot be accepted until the existing suites run and the durable tuple/V4/V5 fixture evidence is committed. No PPM behavior is claimed accepted.

### P-G00 worklog entry

```text
TIME / TIMEZONE: 2026-10-10 19:48 Asia/Dhaka
GATE / OBJECTIVE: P-G00 — local clone audit and baseline proof
BRANCH / BEFORE SHA / AFTER SHA: feature/tna360-continuous / 8b06f6f / pending tracker commit
FILES CHANGED (EXACT): docs/ppm/06_EXECUTION_TRACKER.md only; output/playwright baseline artifacts are ignored local evidence
FILES WATCHED/FROZEN (DIFF CHECK): all apps/ppm source, worker and tests listed above; no source diff
DOMAIN/SCHEMA CHANGE & MIGRATION: none
TEST COMMANDS + OUTPUT/COUNTS: VM source audit = 168 tuples, 19 profiles, 12 processes; 3 PPM suites blocked by missing `playwright`; transient npx retry same error; Node v24.13.1 / npm 11.8.0
BROWSER SCREENSHOTS / REPORT PATHS: output/playwright/ppm-pg00-desktop-home.png; ppm-pg00-mobile-home.png; ppm-pg00-desktop-editor.png; ppm-pg00-mobile-editor.png; console Errors 0 Warnings 0
EVIDENCE FOR FEATURE IDs: P-G00 audit only; P01–P52 remain not-started pending accepted baseline
BLOCKERS / UNRESOLVED RISK: missing resolvable Playwright Node dependency; committed exact tuple/V4/V5 fixture not yet captured; baseline mobile horizontal clipping observed
REVIEWER / VERDICT (accepted|conditional|blocked|rejected|draft-only): blocked
NEXT ACTION (ONE PRECISE STEP): make the existing PPM test dependency resolvable without changing repository behavior, rerun the 3 suites, then commit the exact 168-tuple and V4/V5 baseline fixture
```

### P-G00 dependency probe

```text
TIME / TIMEZONE: 2026-10-10 19:49 Asia/Dhaka
GATE / OBJECTIVE: P-G00 — attempt non-mutating Playwright dependency resolution
COMMANDS + RESULT: `npm exec --yes --package=playwright -- node -e "require.resolve('playwright')"` — MODULE_NOT_FOUND; `npx --yes -p playwright node -e "require.resolve('playwright')"` — MODULE_NOT_FOUND
FILES CHANGED: none; no package manifest, lockfile, node_modules or application file added
VERDICT: BLOCKED — ENVIRONMENT DEPENDENCY remains. The existing PPM suites cannot be run until a resolvable Playwright Node dependency is intentionally provisioned.
NEXT ACTION: provision/approve the test dependency in the workspace, then rerun regression.cjs, planning.cjs and update.cjs without altering PPM behavior.

### P-G01 shared shell adapter slice — conditional, P-G00 remains blocked

```text
SCOPE / FROZEN RULES:
Use the already committed neutral VESA workspace shell. PPM remains the sole owner of the 168 checkpoint identities, applicability, GO/CONDITIONAL GO/HOLD decisions, signatures, save/recovery and reports. This adapter only routes existing menu callbacks and demotes competing sticky regions; it does not rewrite PPM records or claim P-G00 acceptance.

FILES CHANGED:
`apps/ppm/workspace.js`, `apps/ppm/workspace.css`.

BRANCH / BEFORE SHA / AFTER SHA:
`feature/tna360-continuous` / `8ba9b8a` / `1592b75`

EVIDENCE:
`node --check apps/ppm/workspace.js`; `node tests/vesa-workspace-shell-contract.cjs`; `node apps/aql/tests/a-g00-baseline.cjs`; `node apps/aql/tests/release-contract.cjs`; `git diff --check` passed. The existing `node apps/ppm/tests/regression.cjs` still stops before test execution with `Cannot find module 'playwright'`, so P-G00 remains BLOCKED. Authenticated Playwright CLI smoke against a disposable local server verified PPM home and editor, shared File callback opening the existing PPM menu, 168 rendered `.checkpoint` elements, desktop/mobile overflow false, one sticky `.vesa-workspace`, and static PPM topbar/section navigation/rail/footer. Console errors were 0.

VERDICT:
CONDITIONAL — PPM's visible shell adapter is locally verified without changing checkpoint data, but P-G01 shared acceptance still needs TNA adapter and cross-app geometry/regression; P-G00's missing dependency remains an explicit blocker.

NEXT ACTION (ONE PRECISE STEP): adapt TNA's existing commandbar/menu actions to `VesaWorkspaceShell`, preserve TNA dates and local records, demote its competing sticky commandbar, then rerun authenticated 390/1280 smoke across AQL/PPM/TNA.
```

### P-G00 baseline completion — accepted locally, no production deployment

```text
TIME / TIMEZONE: 2026-10-10 22:29 Asia/Dhaka
GATE / OBJECTIVE: P-G00 — lock the actual 168-checkpoint PPM baseline, durable current/V4 save contract and repeatable browser/domain/update proof
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 080b2a8 / e05da03
FILES CHANGED (EXACT): apps/ppm/tests/p-g00-baseline.cjs; apps/ppm/tests/regression.cjs; apps/ppm/tests/update.cjs
FILES WATCHED/FROZEN: all PPM runtime/domain/worker files, PPM saved records, shared auth/preferences/catalogue, AQL, TNA and shell runtime; no PPM behavior, checkpoint identity, GO/CONDITIONAL GO/HOLD rule or saved customer record changed
DOMAIN / SCHEMA IMPACT: fixture-only. The new runner locks 168 checkpoint tuples by SHA-256 `4248a7bf5154583c813c50998b3d281d7879e6ba80eb275f5a05a4b2b65df3ad`, 19 profile IDs, 12 process options, current `V5.1.5` schema-2 wrapper, V4.1.1 additive migration, a fresh 168-status record and the existing training baseline (`TS-SAMPLE-001`, HOLD). Regression selectors now call the existing `app.changeLanguage()` API after the shared shell removed the obsolete `#fileMenu .language-select` surface; update waits now require async `app.record` restoration before assertions.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/ppm/tests/p-g00-baseline.cjs` PASS; with cached local Playwright `1.64.0` resolved only through explicit `NODE_PATH` and installed Chromium `chromium-1248` passed `node apps/ppm/tests/regression.cjs` (all named checks, including Bengali/Hindi/Tamil PDF, CSV formula defense, cross-tab guard, offline reload and no uncaught errors), `node apps/ppm/tests/planning.cjs` (16 checks) and `node apps/ppm/tests/update.cjs` (7 lifecycle checks); `node --check apps/ppm/tests/p-g00-baseline.cjs` PASS; prior PPM baseline screenshots remain `output/playwright/ppm-pg00-{desktop-home,mobile-home,desktop-editor,mobile-editor}.png` with console Errors 0 / Warnings 0; `git diff --check` PASS.
ROLLBACK: revert `e05da03` to remove only the fixture/test compatibility patch; no runtime data migration or browser-store cleanup is required.
EVIDENCE FOR FEATURE IDS: P-G00 baseline only; P01–P52 remain unaccepted pending later gates.
BLOCKERS / UNRESOLVED RISK: The package is not declared in a repository manifest, so a clean checkout needs an intentional Playwright/runtime setup before reproducing these commands; the existing mobile section-strip clipping remains baseline evidence for a later UX gate. Secure backend/role credentials remain external.
REVIEWER / VERDICT: accepted locally — P-G00 baseline is repeatably proven in this workspace; no production or secure multi-user claim.
NEXT ACTION (ONE PRECISE STEP): reconcile P-G01's existing PPM adapter with the AQL/TNA 390/1280 shared-shell matrix, including central settings/language behavior, focus, overflow and console checks, without changing the 168-checkpoint domain.
```

### P-G01 shared shell completion — accepted locally, no production deployment

```text
TIME / TIMEZONE: 2026-10-10 23:15 Asia/Dhaka
GATE / OBJECTIVE: P-G01 — prove one VESA shell, central settings/language/theme behavior, mobile keyboard behavior and cross-app geometry without changing PPM domain rules
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 02fbb81 / 582cd34
FILES CHANGED (EXACT): js/vesa-workspace-shell.js; css/vesa-workspace.css; tests/vesa-workspace-shell-contract.cjs; tests/vesa-shared-shell-matrix.cjs; apps/ppm/tests/update.cjs
FILES WATCHED/FROZEN: PPM core/planning/record/report engines, all 168 checkpoint tuples and decisions, saved records, AQL SamplingEngine/Ac-Re rules, TNA date/history engines, auth identity and App Centre routes; no domain or saved-data migration changed
IMPLEMENTED: The platform shell now opens one app-neutral `data-vesa-settings` dialog using central `VesaPrefs` language/theme controls, restores focus when closed, and handles mobile Menu Escape/focus return. The matrix runner serves the real repository, authenticates with the existing browser-local session fixture, checks shell/menu/route links, one sticky navigation region, 390/1280 overflow, settings language/theme persistence, mobile focus and uncaught errors, and captures six ignored screenshots. The PPM update test waits for restored `app.record` and `APP_VERSION` after explicit worker activation.
TEST COMMANDS + OUTPUT/COUNTS: `node tests/vesa-workspace-shell-contract.cjs` PASS; `node tests/vesa-shared-shell-matrix.cjs` PASS 6/6 authenticated local probes at 390/1280 for PPM/AQL/TNA with console errors 0; screenshots `output/playwright/vesa-p-g01-{ppm,aql,tna}-{390,1280}.png`; PPM `regression.cjs` PASS all named checks, `planning.cjs` PASS 16 checks and `update.cjs` PASS 7 lifecycle checks after wait hardening, all under cached Playwright 1.64.0 + Chromium 1248; all TNA G01-G09 tests PASS; all AQL A-G00/A-G02-A-G09 and release-contract suites PASS; `node --check tests/vesa-shared-shell-matrix.cjs` PASS; `git diff --check` PASS.
ROLLBACK: revert `582cd34` to remove the shared settings/focus/matrix/test patch; no PPM runtime record migration or browser-store cleanup is required.
EVIDENCE FOR FEATURE IDS: P-G01 shared shell only; P-G02-P-G10 remain unaccepted pending later gates. Shared U-G02 theme/language controller evidence is recorded in the root dashboard separately.
BLOCKERS / UNRESOLVED RISK: Playwright is not declared in a repository package manifest, so clean-checkout reproduction needs intentional dependency/runtime provisioning; secure backend/role credentials, physical pilot and production authorization remain external blockers. This is local browser authentication, not secure multi-user proof.
REVIEWER / VERDICT: accepted locally — shared shell/settings/focus behavior and sibling regression matrix are repeatably proven in this workspace; no production or secure multi-user claim.
NEXT ACTION (ONE PRECISE STEP): audit P-G02 PPM Home/menu/navigation, align its home choices and real repository save state with the shared shell, and preserve all 168 checkpoint identities and decisions.
```

### P-G02 explicit saved-meeting home action — conditional sub-slice

```text
TIME / TIMEZONE: 2026-10-10 23:25 Asia/Dhaka
GATE / OBJECTIVE: P-G02 — make Open Saved PPM an explicit shared-contract home/File action backed by the real PPM repository
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 8133fbb / c3830fc
FILES CHANGED (EXACT): apps/ppm/workspace.js; apps/ppm/languages.js; apps/ppm/tests/p-g02-home.cjs
FILES WATCHED/FROZEN: PPM 168 checkpoint tuples, GO/CONDITIONAL GO/HOLD decisions, approvals, measurements, saved-copy codec, service worker, AQL/TNA/shared platform files; no domain rule or migration changed
IMPLEMENTED: Added an explicit Open Saved PPM home card and File-menu action, a repository-backed chooser that saves the active production meeting before listing records and reopens the selected record through the existing codec/repository path, plus Bengali saved-meeting guidance. Practice, Continue Last, Open Saved Copy, recent rows and existing Saved Work remain intact.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/ppm/tests/p-g02-home.cjs` PASS (explicit New/Open Saved/Practice/Open Saved Copy choices, saved reopen, Bengali hint and File handler); PPM `regression.cjs` PASS all named checks including PDF/CSV/offline/no errors, `planning.cjs` PASS 16 checks, `update.cjs` PASS 7 lifecycle checks, P-G00 baseline PASS (168 tuples/19 profiles/12 processes/V4-V5), shared shell contract PASS, syntax and `git diff --check` PASS; browser proof used cached Playwright 1.64.0 + Chromium 1248 at 1280px.
ROLLBACK: revert `c3830fc` to remove only the explicit home/File chooser and its fixture; existing recent-list and saved-copy behavior remains in the prior commit.
EVIDENCE FOR FEATURE IDS: P-G02 home-choice/saved-reopen sub-slice only; P-G02 remains conditional until the full 320/360/390/768/1280 editor/section-navigation and real shared save-state review is complete.
BLOCKERS / UNRESOLVED RISK: Full small-width/editor geometry and shared saved-indicator synchronization remain open; clean-checkout Playwright package provisioning, secure backend/role credentials, physical pilot and production authorization remain external/setup blockers.
REVIEWER / VERDICT: conditional — the explicit saved action is locally proven and sibling PPM suites remain green; the complete gate is not claimed.
NEXT ACTION (ONE PRECISE STEP): run the P-G02 width matrix at 320/360/390/768/1280 through home and editor, inspect section-navigation overlap/scroll and bind the shared saved indicator to actual PPM save outcomes.
```

### P-G02 Home/menu/navigation completion — accepted locally, no production deployment

```text
TIME / TIMEZONE: 2026-10-10 23:32 Asia/Dhaka
GATE / OBJECTIVE: P-G02 — prove shared home choices, saved-meeting navigation, normal editor geometry and real repository save-state vocabulary
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 5535b9d / d1ad724
FILES CHANGED (EXACT): apps/ppm/workspace.js; apps/ppm/tests/p-g02-home.cjs
FILES WATCHED/FROZEN: all 168 checkpoint identities/statuses, profile/process relevance, GO/CONDITIONAL GO/HOLD decisions, saved-copy codec, AQL/TNA/shared domain engines; no policy or migration changed
IMPLEMENTED: Explicit PPM home choices now include New, Continue Last when applicable, Open Saved PPM, Practice/Training and Open Saved Copy. Open Saved PPM and File use a real repository-backed chooser that saves the active production record before listing and reopens through the existing codec. The PPM adapter mirrors existing save outcomes into the shared `Saving…`, `Unsaved changes`, `Saved on this device` and failure vocabulary.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/ppm/tests/p-g02-home.cjs` PASS at 320/360/390/768/1280 home/editor probes, saved/unsaved/saved shell state, static section navigation, Bengali hint, repository reopen and File handler; PPM `regression.cjs` PASS all named checks including PDF/CSV/offline/no errors; `planning.cjs` PASS 16 checks; `update.cjs` PASS 7 lifecycle checks; P-G00 baseline PASS 168 tuples/19 profiles/12 processes/V4-V5; shared contract and syntax checks PASS; `git diff --check` PASS; cached Playwright 1.64.0 + Chromium 1248 used only in disposable browser contexts.
ROLLBACK: revert `d1ad724` plus prior `c3830fc`/`5535b9d` P-G02 commits to remove the additive chooser/state adapter; no saved-record migration or browser-store cleanup is required.
EVIDENCE FOR FEATURE IDS: P-G02 accepted locally; P-G03-P-G10 remain unaccepted pending later gates.
BLOCKERS / UNRESOLVED RISK: Clean-checkout Playwright package provisioning, secure backend/role credentials, physical pilot and production authorization remain external/setup blockers; this is not secure multi-user proof.
REVIEWER / VERDICT: accepted locally — P-G02 is proven in the local browser/runtime matrix with sibling PPM suites green; no production deployment claim.
NEXT ACTION (ONE PRECISE STEP): audit P-G03 applicability, easy workflow, search and custom controls while preserving all 168 checkpoint identities and additive custom-checkpoint rules.
```

### P-G03 applicability/workflow completion — accepted locally, no production deployment

```text
TIME / TIMEZONE: 2026-10-10 17:43 UTC / 2026-10-10 23:43 Asia/Dhaka
GATE / OBJECTIVE: P-G03 — prove PPM profile/process applicability, N/A/PENDING meaning, novice guidance, search/filter navigation and additive custom controls without changing the 168-checkpoint domain
BRANCH / BEFORE SHA / EVIDENCE SHA: feature/tna360-continuous / f4fd405 / d3ff016
FILES CHANGED (EXACT): apps/ppm/tests/p-g03-workflow.cjs; docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md (ledger-only updates follow in the recording commit)
FILES WATCHED/FROZEN: apps/ppm/core.js relevance/coverage/action engines, all 168 checkpoint tuples and statuses, profile/process catalogue, GO/CONDITIONAL GO/HOLD decisions, saved records/codecs, AQL/TNA/shared shell and buyer-specific authority rules; no runtime/domain migration changed
IMPLEMENTED / PROVEN: The fixture layer executes the actual RelevanceEngine, CoverageEngine and PpmRecordFactory and proves 168 fresh status identities, universal-only blank-profile scope, T-shirt/knit versus woven relevance, print-only process relevance, N/A closed-count semantics, PENDING open-count semantics, and one critical custom checkpoint added without replacing master items. The browser layer proves 11 section knowledge panels, five-step Quick Guide, buyer/market guidance text, all four status buttons, 16 navigation chips, next-unreviewed/open-actions controls, search, unreviewed/action/critical filters, and a custom ACTION checkpoint with a linked action.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/ppm/tests/p-g03-workflow.cjs` PASS; `node apps/ppm/tests/p-g03-workflow.cjs` PASS; `node apps/ppm/tests/p-g00-baseline.cjs` PASS (168 tuples, 19 profiles, 12 processes, V4/V5); `node apps/ppm/tests/regression.cjs` PASS (all named checks including multilingual PDF, CSV formula defense, cross-tab guard, offline reload and no uncaught errors); `node apps/ppm/tests/planning.cjs` PASS (16); `node apps/ppm/tests/update.cjs` PASS (7); `node apps/ppm/tests/p-g02-home.cjs` PASS; `git diff --check` PASS. Browser proof used cached Playwright 1.64.0 + Chromium 1248 through explicit NODE_PATH/CHROMIUM_PATH in a disposable local server/context.
ROLLBACK: revert `d3ff016` and this ledger-recording commit to remove only the P-G03 fixture and acceptance documentation; no PPM runtime data migration or browser-store cleanup is required.
BLOCKERS / UNRESOLVED RISK: Clean-checkout Playwright package provisioning still needs an intentional manifest/setup; secure backend/role credentials, physical pilot and production authorization remain external blockers. This gate is local proof, not secure multi-user or production approval.
REVIEWER / VERDICT: ACCEPTED locally — P-G03 is repeatably proven against actual source and browser behavior; no production deployment claim.
NEXT ACTION (ONE PRECISE STEP): audit P-G04 GO/CONDITIONAL GO/HOLD parity, required approvals, POM measurement boundaries, controlled revision invalidation and blocker/action explainability with synthetic fixtures before changing runtime code.
```

### P-G04 approvals/decision completion — accepted locally, no production deployment

```text
TIME / TIMEZONE: 2026-10-10 17:49 UTC / 2026-10-10 23:49 Asia/Dhaka
GATE / OBJECTIVE: P-G04 — prove frozen release decisions, explicit approval evidence, POM measurement boundaries, controlled revision invalidation and everyday blocker/action explanations against actual PPM owners
BRANCH / BEFORE SHA / EVIDENCE SHA: feature/tna360-continuous / 1477237 / 979fec4
FILES CHANGED (EXACT): apps/ppm/tests/p-g04-decisions.cjs; docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md (ledger-only updates follow in the recording commit)
FILES WATCHED/FROZEN: `ValidationEngine`, `ApprovalRegister`, `MeasurementCheck`, `ChangeReviewEngine`, `PlanningService`, all 168 checkpoint identities and statuses, GO/CONDITIONAL GO/HOLD semantics, signatures, saved records/codecs, AQL/TNA/shared shell and buyer-specific rules; no runtime/domain migration changed
IMPLEMENTED / PROVEN: The fixture composes actual source owners and proves complete records are GO-ready, HOLD remains recordable, a non-critical ACTION with owner/due/action/conditions is CONDITIONAL GO only, critical/open/unowned actions block release, required approvals need status/approver/date/reference or a recorded Not needed explanation, inclusive asymmetric tolerance boundaries work, blank/invalid/unit-mismatched values do not pass, a controlled BOM revision is visible in the diff and clears stale GO/signatures, and readiness exposes missing field plus checkpoint/action identifiers for next-step explanation. Existing planning/browser tests additionally prove read-only finalized forms and the rendered approval/measurement/change-review flows.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/ppm/tests/p-g04-decisions.cjs` PASS; `node apps/ppm/tests/p-g04-decisions.cjs` PASS; `node apps/ppm/tests/planning.cjs` PASS (16); `node apps/ppm/tests/regression.cjs` PASS (all named checks including reports, multilingual PDF, CSV formula defense, cross-tab guard, offline reload and no uncaught errors); `node apps/ppm/tests/p-g03-workflow.cjs` PASS; `git diff --check` PASS. Browser tests used cached Playwright 1.64.0 + Chromium 1248 through explicit NODE_PATH/CHROMIUM_PATH in disposable local contexts.
ROLLBACK: revert `979fec4` and this ledger-recording commit to remove only the P-G04 fixture and acceptance documentation; no PPM runtime data migration or browser-store cleanup is required.
BLOCKERS / UNRESOLVED RISK: Clean-checkout Playwright package provisioning still needs an intentional manifest/setup; secure backend/role credentials, physical pilot and production authorization remain external blockers. Local evidence does not prove cryptographic buyer authorization or secure multi-user release.
REVIEWER / VERDICT: ACCEPTED locally — P-G04 is repeatably proven against actual domain/UI owners; no production deployment claim.
NEXT ACTION (ONE PRECISE STEP): audit P-G05 action ownership/aging/escalation, meeting minutes/waiver compatibility, evidence linkage/save protection and amendment history without inventing notifications or external authority.
```

### P-G05 existing follow-up sub-slice — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-10 17:52 UTC / 2026-10-10 23:52 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — audit currently shipped follow-up, evidence and bounded-history behavior without misrepresenting absent Phase-2 enhancement schemas as complete
BRANCH / BEFORE SHA / EVIDENCE SHA: feature/tna360-continuous / 316323d / 3c5d2ed
FILES CHANGED (EXACT): apps/ppm/tests/p-g05-followups.cjs; docs/ppm/06_EXECUTION_TRACKER.md (ledger recording follows in the next commit)
FILES WATCHED/FROZEN: PPM action tracker, photo/evidence fields, `ChangeReviewEngine`, `RecordHistory`, `BackupCodec`, all 168 checkpoint identities/statuses, approval/signature/release rules and existing saved records; no runtime schema or UI behavior changed
PROVEN: Existing ACTION creates one linked action; owner, due date, corrective action, evidence and Open/In Progress/Closed status survive; checkpoint closure closes its linked action without rewriting the checkpoint status; photo evidence, reviewer-attributed change history and bounded undo round-trip through the current codec/history owners.
EXPLICIT GAPS: Current source has no `meetingMinutes`, `actionEscalation`/date-source or `meetingVersions` fields. Therefore action aging/escalation, minutes/authority waiver compatibility and immutable amendment snapshots are not claimed or counted as accepted.
TEST COMMANDS + OUTPUT/COUNTS: `node --check apps/ppm/tests/p-g05-followups.cjs` PASS; `node apps/ppm/tests/p-g05-followups.cjs` PASS; existing PPM `planning.cjs` PASS (16), `regression.cjs` PASS (all named checks), P-G03 PASS, and `git diff --check` PASS in the same cached Playwright 1.64.0 + Chromium 1248 workspace runtime.
ROLLBACK: revert `3c5d2ed` and this ledger-recording commit to remove only the conditional fixture and evidence; no PPM runtime data migration or browser-store cleanup is required.
BLOCKERS / UNRESOLVED RISK: P-G05 cannot be accepted until the additive/versioned enhancement contract is implemented and tested. Secure backend notifications/roles remain external and must not be faked; clean-checkout Playwright provisioning and production authorization remain separate blockers.
REVIEWER / VERDICT: CONDITIONAL — existing follow-up/evidence/history sub-slice is proven; the full P-G05 gate remains active because the explicit enhancement schemas are absent.
NEXT ACTION (ONE PRECISE STEP): design the smallest additive/versioned P-G05 enhancement contract for meeting minutes, explicit authority/waiver records, action date-source/escalation metadata and immutable amendment snapshots; add decode/round-trip guards before any UI change.
```

### P-G05 additive follow-up contract — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-10 17:58 UTC / 2026-10-10 23:58 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — add a portable, legacy-safe data contract before exposing new follow-up controls in the UI
BRANCH / BEFORE SHA / EVIDENCE SHA: feature/tna360-continuous / 9c5cca6 / cca87c2
FILES CHANGED (EXACT): apps/ppm/core.js; apps/ppm/record-services.js; apps/ppm/tests/p-g05-followups.cjs; docs/ppm/06_EXECUTION_TRACKER.md (ledger recording follows in the next commit)
FILES WATCHED/FROZEN: all 168 checkpoint IDs/status meanings; `CoverageEngine` and release decisions; existing action/approval/signature/photo/change-history owners; envelope schema 2 and V4/current import support; no UI, notification, backend or buyer-policy behavior changed
PROVEN: Fresh and direct legacy records receive follow-up schema 1 defaults. Meeting minutes and attachment references, explicit exception/authority records, escalation metadata with an explicit date source, and up to ten full normalized non-recursive meeting snapshots survive saved-copy round-trip. Unknown follow-up versions, oversized/repeated references, invalid checkpoint/action links, duplicate exceptions, nested snapshots and missing/out-of-order version parents are rejected before activation. Exception status changes do not alter checkpoint coverage/readiness, and no notification-sent field is admitted.
TEST COMMANDS + OUTPUT/COUNTS: `node --check` for core/record-services/P-G05 PASS; P-G00 PASS (168 identities, V4/current migration); P-G02 home PASS; P-G03 PASS; P-G04 PASS; P-G05 PASS; planning PASS (16); update PASS (7 named checks); full regression PASS (persistence, four-language data preservation, recovery, portable evidence/signatures, all PDF modes, CSV safety, cross-tab/save failure, 390px mobile, offline reload, zero uncaught browser errors); `git diff --check` PASS. Browser tests used the previously recorded cached Playwright 1.64.0 + Chromium 1248 runtime; no dependency files changed.
ROLLBACK: revert `cca87c2` and this ledger commit. Existing saved records need no cleanup because the new fields are additive and missing fields default safely.
BLOCKERS / UNRESOLVED RISK: This contract alone does not provide user-facing minutes/authority controls, calculate action aging, upload attachments, protect failed attachment saves, create amendments, or enforce append-only snapshot/signature invalidation. Secure notifications/roles remain external and are not claimed. P-G05 stays CONDITIONAL and does not increase percentages.
REVIEWER / VERDICT: CONDITIONAL — the additive/versioned contract and portability guard are proven; the full workflow and UI acceptance conditions remain open.
NEXT ACTION (ONE PRECISE STEP): add a pure follow-up service for explicit aging/date-source calculation and controlled amendment creation that snapshots a finalized parent and invalidates copied approvals/signatures, with unit tests before UI wiring.
```

### P-G05 follow-up workflow service — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-10 18:03 UTC / 2026-10-11 00:03 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — implement deterministic action-aging and controlled-amendment semantics behind the validated additive contract
BRANCH / BEFORE SHA / EVIDENCE SHA: feature/tna360-continuous / 685b37f / de75446
FILES CHANGED (EXACT): apps/ppm/planning-services.js; apps/ppm/record-services.js; apps/ppm/tests/p-g05-followups.cjs; docs/ppm/06_EXECUTION_TRACKER.md (ledger recording follows in the next commit)
FILES WATCHED/FROZEN: all checkpoint identities/statuses; GO/CONDITIONAL GO/HOLD validation; user-entered calendars and authority; parent records; existing saved-copy contract; no UI, notification, backend or external calendar behavior added
PROVEN: Calendar-day aging reports signed days from due date only when a source is named. Working-day aging counts only explicitly supplied working dates and rejects missing source, duplicate/out-of-range dates or a calendar range that does not cover both due/review dates. A controlled amendment requires a finalized parent and reason/time, leaves the parent untouched, stores a frozen full-record snapshot without recursive history, chains parent version IDs, reopens a draft, clears release/signatures/minutes acknowledgement and resets copied approval proof to Pending. First and second amendments and saved-copy reopen retain frozen snapshots and valid parent linkage.
TEST COMMANDS + OUTPUT/COUNTS: P-G05 PASS; P-G04 PASS; P-G00 PASS (168 identities and migration); planning PASS (16); full browser regression PASS including persistence, localization, recovery, all PDF modes, mobile, offline and zero uncaught browser errors; `node --check` and `git diff --check` PASS. Browser tests used the existing cached Playwright 1.64.0 + Chromium 1248 runtime; no dependency files changed.
ROLLBACK: revert `de75446` and this ledger commit. The prior additive fields and saved records remain valid; no browser data cleanup is required.
BLOCKERS / UNRESOLVED RISK: No rendered controls invoke these services yet. Attachment upload/save failure protection, authority UI, amendment confirmation/history UI and end-to-end signature invalidation remain unproven. Secure notification delivery remains an external dependency and is not represented by local flags. P-G05 remains CONDITIONAL and percentages do not increase.
REVIEWER / VERDICT: CONDITIONAL — deterministic service behavior is proven in isolation and regression-safe; user workflows and rendered evidence are still required.
NEXT ACTION (ONE PRECISE STEP): wire one accessible Follow-up workspace for meeting minutes and action aging/escalation with an explicit date source, then prove save/reopen and 390px behavior before adding authority/amendment controls.
```

### P-G05 pre-code file audit — accessible follow-up workspace

```text
TIME / TIMEZONE: 2026-10-11 10:00 Asia/Dhaka
PATCH OBJECTIVE: expose the already validated minutes and action-aging/escalation contract through one accessible modal, then prove repository save/reopen and 390px behavior
IN-SCOPE FILES: apps/ppm/planning-panel.js (single meeting-controls/modal owner); apps/ppm/workspace.js (finite Tools/command route only); apps/ppm/workspace.css (follow-up modal layout); apps/ppm/tests/p-g05-followup-ui.cjs (real browser flow); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: apps/ppm/core.js checkpoint identities/statuses; ValidationEngine and GO/CONDITIONAL GO/HOLD; approval/signature/release rules; record-services.js schema/codec; PPM service worker; apps/aql/**; apps/tna/**; shared auth/catalogue/preferences/shell; no notification, upload, backend or buyer-authority claim
OWNERSHIP / CALL FLOW / STATE: Tools or MEETING CHECKS command -> MeetingControls follow-up modal -> bounded field validation -> existing FollowUpService.aging() for explicitly sourced calendar-day calculation -> workspace.mutate() -> existing history/autosave/repository -> codec-backed reopen. Escalation records remain evidence supplied by the user; the UI never marks a notification sent.
COMPATIBILITY RISKS: locked meetings must stay read-only; imported/user text must be escaped; language changes must not alter entered values; missing due/review date or source must fail closed; repeated renders must dispose modal listeners; small screens must not overflow; save/reopen must retain minutes and escalation metadata.
VERIFICATION: syntax; P-G05 domain fixture; new authenticated Playwright browser flow at 390px including minutes, aging, escalation, save/reopen and console/overflow assertions; P-G00/P-G04 and existing PPM planning/regression suites; shared-shell contract; git diff --check.
ROLLBACK: revert the UI/test/tracker patch. Additive follow-up fields already exist and need no migration or browser-data deletion.
PRE-CODE VERDICT: approved for the smallest reversible P-G05 UI slice; authority/waiver, attachment failure and amendment controls remain explicitly out of this patch.
```

### P-G05 accessible follow-up workspace — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-10 18:14 UTC / 2026-10-11 00:14 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — expose minutes and explicitly sourced action aging/escalation through the real PPM workspace and prove local save/reopen on mobile
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / c42e10f / 6c1b666
FILES CHANGED (EXACT): apps/ppm/planning-panel.js; apps/ppm/workspace.js; apps/ppm/workspace.css; apps/ppm/tests/p-g05-followup-ui.cjs; docs/ppm/06_EXECUTION_TRACKER.md
FILES WATCHED/FROZEN: PPM core.js and record-services.js; all 168 checkpoint IDs/statuses; GO/CONDITIONAL GO/HOLD validation; approvals/signatures/release; PPM service worker; AQL/TNA/shared platform files; no schema, notification, upload, authority or amendment behavior changed
IMPLEMENTED / PROVEN: Follow-Up is reachable from MEETING CHECKS and Tools. It records bounded optional minutes, calculates signed calendar-day aging only from an entered review date plus named source, and stores user-entered escalation level/owner/reason/time/next-review/source while explicitly stating that no notification or waiver approval occurred. Locked records render disabled controls. User-entered values are escaped. The existing workspace mutation/history/autosave and repository/codec path preserves minutes and escalation evidence after reload/reopen.
TEST COMMANDS + OUTPUT/COUNTS: P-G00 baseline PASS (168 tuples/19 profiles/12 processes/V4-current migration); P-G04 PASS; P-G05 domain PASS; planning PASS (16); full regression PASS (persistence, EN/BN/HI/TA data preservation, recovery, PDFs, CSV defense, cross-tab/save failure, 390px, offline bundle, zero uncaught errors); shared shell contract PASS; P-G05 UI PASS; planning-panel/workspace syntax PASS; git diff --check PASS. Browser runtime: cached Playwright 1.64.0 + Chromium 1248 through explicit workspace paths.
BROWSER / VISUAL EVIDENCE: authenticated synthetic local record at 390x844 entered minutes, calculated 2 calendar days overdue from `Buyer comment log dated 11 Oct 2026`, recorded one escalation, saved, reloaded and reopened with values intact; document/body width <=391; console errors 0. Visual inspection found the shared z=10000 shell initially painted over the legacy z=100 dialog; app-scoped modal z=11000 fixed it and the test now asserts modal layer > shell layer. Screenshot: ignored local `output/playwright/ppm-p-g05-followup-mobile-390.png`.
ROLLBACK: revert 6c1b666. The prior additive follow-up fields remain valid; no saved-record migration or browser-data deletion is needed.
FEATURE EVIDENCE: P25 existing action ownership/status plus P29 minutes/action-follow-up slice; P27 authority/waiver UI, P30/P31 attachment failure protection and P28 controlled amendment UI remain incomplete.
BLOCKERS / UNRESOLVED RISK: working-day rules are domain-tested but this first UI intentionally exposes only calendar days; authority/waiver controls, attachment references/upload failure, amendment confirmation/history, full four-language authored-copy parity and secure notification delivery remain open. Secure notifications/roles are external and no send flag exists.
REVIEWER / VERDICT: CONDITIONAL — the action ownership/aging/escalation/date-source checklist item is proven locally, but P-G05 remains active and earns no additional gate percentage.
NEXT ACTION (ONE PRECISE STEP): add explicit exception/waiver authority-record controls to Follow-Up and prove save/reopen plus unchanged CoverageEngine/readiness before implementing attachment and amendment UI.
```

### P-G05 pre-code file audit — authority/exception evidence controls

```text
TIME / TIMEZONE: 2026-10-11 00:16 Asia/Dhaka
PATCH OBJECTIVE: expose the existing bounded exception schema as an evidence-only authority record without allowing it to change checkpoint status, coverage, readiness or release
IN-SCOPE FILES: apps/ppm/planning-panel.js (Follow-Up modal and finite mutation owner); apps/ppm/workspace.css (only if the new form needs responsive styling); apps/ppm/tests/p-g05-followup-ui.cjs (browser round-trip and non-override proof); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: apps/ppm/core.js and record-services.js schemas; all checkpoint IDs/statuses; CoverageEngine/ValidationEngine and GO/CONDITIONAL GO/HOLD; approvals/signatures/release; attachment bytes/uploads; amendment creation; notifications; AQL/TNA/shared files
OWNERSHIP / CALL FLOW / STATE: Follow-Up modal -> bounded required evidence fields linked to an existing checkpoint -> append to record.exceptions -> workspace.mutate/autosave -> existing repository/codec reopen. The form records who/what/source only; it never authenticates that person or calls coverage/release mutation.
RISKS / GUARDS: imported/user values escaped; require explicit checkpoint, policy/source, scope, accountable party, named authorizer, authority type, approval date and evidence; bound records to 100; locked record disabled; no `notificationSent`, no status rewrite, no automatic waiver; compare coverage/readiness before and after in browser.
VERIFICATION / ROLLBACK: extend the authenticated 390px P-G05 test with add/save/reload/reopen and exact before/after coverage/readiness equality; visually inspect authority record; rerun P-G05 domain, P-G04, syntax, shared shell and full PPM regression as proportionate. Revert the UI/test/tracker commit; no migration or stored-data deletion.
PRE-CODE VERDICT: approved for an additive conditional P-G05 sub-slice; attachments and controlled amendments stay open.
```

### P-G05 authority/exception evidence controls — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-10 18:20 UTC / 2026-10-11 00:20 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — expose the existing versioned exception schema without creating an automatic waiver or changing release readiness
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 7835517 / d1f9872
FILES CHANGED (EXACT): apps/ppm/planning-panel.js; apps/ppm/tests/p-g05-followup-ui.cjs; docs/ppm/06_EXECUTION_TRACKER.md
FILES WATCHED/FROZEN: core.js/record-services.js schema; all 168 checkpoints/statuses; CoverageEngine/ValidationEngine; GO/CONDITIONAL GO/HOLD; approvals/signatures/release; uploads, amendments, notifications; AQL/TNA/shared files
IMPLEMENTED / PROVEN: Follow-Up accepts one of the actual applicable checkpoint IDs plus explicit buyer policy/source, scope, accountable party, named authorizer, authority type, approval date, optional expiry, status and evidence reference. Values are bounded/escaped, records are capped at 100 and locked records are disabled. Copy explicitly says this is supplied evidence only and does not approve a waiver, change a checkpoint or release production.
TEST COMMANDS + OUTPUT/COUNTS: P-G00 baseline PASS; P-G04 PASS; P-G05 domain PASS; planning PASS 16; full browser regression PASS including four-language data preservation, all PDF modes, CSV defense, cross-tab/save failure, mobile/offline and zero uncaught errors; P-G05 UI PASS; shared shell PASS; syntax/diff checks PASS. Cached Playwright 1.64.0 + Chromium 1248.
BROWSER / VISUAL EVIDENCE: authenticated 390px synthetic record added O05 authority evidence, asserted exact serialized CoverageEngine and ValidationEngine results plus O05 ACTION/release equality before/after, saved/reloaded/reopened the record and verified every evidence field. Screenshot visually reviewed: ignored local `output/playwright/ppm-p-g05-authority-mobile-390.png`.
ROLLBACK: revert d1f9872. Existing schema remains compatible; no saved-data cleanup or migration.
FEATURE EVIDENCE: P27 exception/authority record plus P29 minutes are now locally proven; this remains evidence capture, not authenticated buyer authority.
BLOCKERS / UNRESOLVED RISK: attachment references/upload failure, controlled amendment confirmation/history UI and full authored-copy localization remain open. Secure identity/authority and notifications remain external.
REVIEWER / VERDICT: CONDITIONAL — the optional minutes/waiver/authority compatibility checklist item is proven locally, but P-G05 remains active and earns no percentage until all gate items pass.
NEXT ACTION (ONE PRECISE STEP): add bounded meeting attachment-reference controls and simulate a failed repository save to prove the record stays open with visible unsaved state before controlled amendment UI.
```

### P-G05 pre-code file audit — attachment references and failed-save protection

```text
TIME / TIMEZONE: 2026-10-11 01:34 Asia/Dhaka
PATCH OBJECTIVE: expose the existing bounded meetingMinutes.attachmentsRefs contract and prove a repository write failure does not close the Follow-Up dialog, discard the in-memory reference or claim that it was saved
IN-SCOPE FILES: apps/ppm/planning-panel.js (Follow-Up attachment-reference form/list and persistence feedback owner); apps/ppm/tests/p-g05-followup-ui.cjs (browser round-trip plus forced repository-failure proof); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: apps/ppm/core.js and record-services.js schema/codec; attachment bytes, upload/network/object storage and malware scanning; all 168 checkpoint IDs/statuses; CoverageEngine/ValidationEngine; GO/CONDITIONAL GO/HOLD; approvals/signatures/release; amendments; notifications; service workers; AQL/TNA/shared files
OWNERSHIP / CALL FLOW / STATE: Follow-Up modal -> bounded unique text reference -> existing meetingMinutes.attachmentsRefs -> workspace.mutate/history/autosave -> explicit queued workspace.save(true) -> PpmRepository. On rejection, V5Workspace.save keeps the active in-memory record and maps SAVE FAILED to the shared shell failure vocabulary; the modal adds an action-oriented unsaved warning and remains open.
COMPATIBILITY RISKS / GUARDS: reference-only UI must not imply file upload or authenticity; reject blank/duplicate/over-30/over-1000-character references; escape rendered values; locked meetings stay disabled; a failed save must not roll back or silently retry into a false-success assertion; successful save/reload/reopen must preserve the reference through the existing codec.
VERIFICATION / ROLLBACK: extend the authenticated 390px P-G05 browser flow with add/save/reload/reopen, then force repo.save rejection while adding a second reference and assert open modal, retained in-memory reference, visible SAVE FAILED/shared-shell failure, and persisted pre-failure record unchanged; rerun P-G05 domain/UI, P-G00/P-G04/planning/full regression/shared-shell/syntax/diff checks. Revert the UI/test/tracker patch; no data migration or browser-store deletion.
PRE-CODE VERDICT: approved for one additive conditional P-G05 sub-slice; actual attachment upload and controlled amendment UI remain separate work.
```

### P-G05 attachment references and failed-save protection — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-10 19:39 UTC / 2026-10-11 01:39 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — expose bounded meeting attachment references without implying file upload, and fail visibly without discarding active work or overwriting the last durable record
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / c3aa9ab / 2e0d718
FILES CHANGED (EXACT): apps/ppm/planning-panel.js; apps/ppm/tests/p-g05-followup-ui.cjs; docs/ppm/06_EXECUTION_TRACKER.md
FILES WATCHED/FROZEN: core.js/record-services.js schema and codec; attachment bytes/upload/network/object storage; all 168 checkpoints/statuses; CoverageEngine/ValidationEngine; GO/CONDITIONAL GO/HOLD; approvals/signatures/release; amendments; notifications; service workers; AQL/TNA/shared files
IMPLEMENTED / PROVEN: Follow-Up now records/removes up to 30 unique escaped references of at most 1,000 characters, labels the control as reference-only with no upload, disables it for locked records and performs an explicit queued local save. A successful reference round-trips through reload/reopen. With repo.save forced to reject, the dialog remains open, the new reference remains in active memory, the prior durable record remains byte-logically unchanged, local state reads SAVE FAILED, the shared shell reads `Could not save — download a saved copy`, and action-oriented copy tells the user the reference remains open.
TEST COMMANDS + OUTPUT/COUNTS: syntax checks PASS; P-G00 baseline PASS (168 tuples/19 profiles/12 processes/V4-current migration); P-G04 PASS; P-G05 domain PASS; P-G05 UI PASS; planning PASS 16; update PASS 7 lifecycle checks; full browser regression PASS including persistence, EN/BN/HI/TA data preservation, recovery, all PDF modes, CSV defense, cross-tab/save failure, mobile/offline and zero uncaught errors; shared-shell contract PASS; git diff --check PASS. Cached Playwright 1.64.0 + Chromium 1248.
BROWSER / VISUAL EVIDENCE: authenticated 390px synthetic record saved/reopened `DOC-PPM-204 · approved-minutes-R2.pdf`; forced failure retained `FAILED-SAVE-REF · buyer-comment-13.pdf` only in the open active record while persisted refs stayed at one. The rendered reference-only/failure panel was visually inspected, overflow stayed within 391px and console errors were zero. Screenshot: ignored local `output/playwright/ppm-p-g05-attachments-failed-save-mobile-390.png`.
ROLLBACK: revert 2e0d718. Existing records remain compatible; no saved-data cleanup or migration.
FEATURE EVIDENCE: P30 reference linkage and P31 failed-save/stale-state protection are locally proven for this reference-only workflow; binary upload, authenticity, remote object storage and malware scanning are not claimed.
BLOCKERS / UNRESOLVED RISK: controlled amendment confirmation/history UI and full authored-copy localization remain open. Secure identity/authority, remote attachments and notifications remain external.
REVIEWER / VERDICT: CONDITIONAL — the evidence-reference/failed-save checklist item is proven locally, but P-G05 remains active and earns no percentage until controlled amendments and remaining gate acceptance pass.
NEXT ACTION (ONE PRECISE STEP): add controlled amendment confirmation/history UI for a finalized meeting; prove immutable parent snapshot/linkage, cleared release/signatures/approval proof, draft save/reopen and visible prior-version history.
```

### P-G05 pre-code file audit — controlled amendment confirmation and history

```text
TIME / TIMEZONE: 2026-10-11 01:42 Asia/Dhaka
PATCH OBJECTIVE: expose the already tested FollowUpService.amend workflow through Edit, require an explicit reason/time/confirmation, and show prior finalized meeting history without unlocking or overwriting the parent in place
IN-SCOPE FILES: apps/ppm/workspace.js (finite Edit command, active-record transition, save and history UI owner); apps/ppm/tests/p-g05-amendment-ui.cjs (authenticated finalized-parent/create/save/reload/reopen proof); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: planning-services.js and record-services.js tested service/codec contracts; all 168 checkpoints/statuses; CoverageEngine/ValidationEngine and decision rules; approval policy; service workers; reports/localization beyond the new bounded copy; attachment upload; notifications; AQL/TNA/shared files
OWNERSHIP / CALL FLOW / STATE: Edit -> controlled amendment dialog -> validate reason/time/explicit acknowledgement -> save finalized parent -> PlanningService.followups.amend(parent snapshot) -> workspace.activate(child draft) -> set optimistic save stamp to the saved parent revision -> queued repository save -> visible version history. Domain service owns frozen snapshot/link/invalidation semantics; workspace owns transition/persistence/rendering only.
COMPATIBILITY RISKS / GUARDS: command must reject an unlocked parent, a missing reason/time or absent confirmation; save failure before transition leaves the parent active; parent business evidence must survive in a non-recursive frozen snapshot; active child must clear release, signatures, minutes acknowledgement and approval proof; rendered history escapes reasons; ten-version codec bound remains unchanged; reload/reopen must preserve links.
VERIFICATION / ROLLBACK: new 390px Playwright flow with a synthetic finalized parent, rejected unconfirmed attempt, successful amendment, exact parent-snapshot/child invalidation assertions, durable reload/reopen and visible history; rerun P-G05/P-G04/P-G00/planning/full regression/update/shared-shell/syntax/diff checks. Revert workspace/test/tracker patch; no migration or saved-data deletion.
PRE-CODE VERDICT: approved for the final functional P-G05 sub-slice; authored-copy four-language parity remains a separate acceptance check.
```

### P-G05 pre-code file audit — follow-up and amendment language parity

```text
TIME / TIMEZONE: 2026-10-11 01:55 Asia/Dhaka
PATCH OBJECTIVE: route every app-authored P-G05 follow-up, authority, attachment and controlled-amendment label/message through the existing LocaleService in English, Bengali, Hindi and Tamil while preserving entered values and domain identifiers exactly
IN-SCOPE FILES: apps/ppm/languages.js (sentence-only dictionary owner); apps/ppm/planning-panel.js (P-G05 rendered copy owner); apps/ppm/workspace.js (amendment/menu copy owner); apps/ppm/tests/p-g05-localization.cjs (dictionary/render/data-preservation proof); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: all 168 checkpoint translations/IDs/statuses; user-entered buyer/style/PO/minutes/reasons/references; GO/CONDITIONAL GO/HOLD and approval/exception status identifiers; domain engines, schemas/codecs, reports, workers, shared files, AQL and TNA
OWNERSHIP / CALL FLOW / STATE: central language preference -> LocaleService.sentence -> escaped P-G05 render helpers/toasts; changing language rerenders authored UI only and never calls mutate/save or rewrites the record
COMPATIBILITY RISKS / GUARDS: dictionaries contain plain text only; interpolated translations are escaped; entered text and identifiers retain byte-logical values; locale switching must not create history/save changes; 390px Indic copy must not overflow; missing keys must fail the explicit coverage test instead of silently earning acceptance
VERIFICATION / ROLLBACK: source key completeness plus authenticated 390px EN/BN/HI/TA follow-up/amendment render, script detection, entered-value equality, stable record serialization, overflow/console checks; rerun P-G05 amendment/follow-up/domain, P-G04/P-G00/planning/full regression/update/shared-shell/syntax/diff. Revert language/UI/test/tracker patch; no record migration or saved-data deletion.
PRE-CODE VERDICT: approved as the remaining independently safe P-G05 acceptance slice.
```

### P-G05 controlled amendment workspace — conditional, gate remained active

```text
TIME / TIMEZONE: 2026-10-10 19:52 UTC / 2026-10-11 01:52 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — expose controlled amendments through Edit without unlocking or overwriting the finalized parent
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 151335d / 578a1ad
FILES CHANGED (EXACT): apps/ppm/workspace.js; apps/ppm/tests/p-g05-amendment-ui.cjs; docs/ppm/06_EXECUTION_TRACKER.md
IMPLEMENTED / PROVEN: a finalized meeting requires reason, valid time and explicit acknowledgement before the pure amendment service creates an editable child; the prior GO decision, signatures, approval proof and acknowledgement remain in a frozen non-recursive snapshot; the child clears release/signatures/approval proof, save/reopens and displays escaped prior-version history. The ten-version bound and finalized-parent guard remain intact.
TEST COMMANDS + OUTPUT/COUNTS: P-G05 amendment UI PASS at 390px; P-G05 domain PASS; P-G04 PASS; P-G00 PASS (168 tuples/19 profiles/12 processes); planning PASS 16; update PASS 7; full regression PASS; P-G05 prior UI PASS; shared shell PASS 6/6; syntax and diff checks PASS. Cached Playwright 1.64.0 + Chromium 1248.
BROWSER / VISUAL EVIDENCE: `output/playwright/ppm-p-g05-amendment-history-mobile-390.png` visually reviewed; readable history, no clipping/overlap, document/body width 390 and console errors zero.
ROLLBACK: revert `578a1ad`; no schema migration or saved-data deletion.
REVIEWER / VERDICT: CONDITIONAL — functional P-G05 amendment requirements pass, but authored P-G05 EN/BN/HI/TA copy parity remained before gate acceptance.
NEXT ACTION: route all P-G05 authored follow-up/amendment copy through LocaleService and prove language switching cannot mutate entered values or stable IDs.
```

### P-G05 follow-up/amendment localization and gate acceptance

```text
TIME / TIMEZONE: 2026-10-10 20:02 UTC / 2026-10-11 02:02 Asia/Dhaka
GATE / OBJECTIVE: P-G05 — complete four-language authored-copy parity and accept the full follow-up, minutes, evidence and amendment gate
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / 578a1ad / 8e9bdee
FILES CHANGED (EXACT): apps/ppm/languages.js; apps/ppm/planning-panel.js; apps/ppm/workspace.js; apps/ppm/tests/p-g05-localization.cjs; docs/ppm/06_EXECUTION_TRACKER.md
IMPLEMENTED / PROVEN: every P-G05 follow-up, aging/escalation, authority, reference and amendment label/message uses the existing sentence-only LocaleService. Authenticated EN/BN/HI/TA rendering preserves entered multilingual minutes/reasons/references, O05, Active, GO and the byte-logical record. A regression found the general translator could restore the initial age prompt after a calculation; `data-live-result` now protects that computed evidence and the original follow-up UI test passes again.
TEST COMMANDS + OUTPUT/COUNTS: P-G05 localization PASS (four locales, complete required keys, stable serialized record, 390px, zero console errors); amendment UI PASS; follow-up UI PASS; P-G05 domain PASS; P-G04 PASS; P-G00 PASS; planning PASS 16; update PASS 7; full regression PASS including multilingual PDF/CSV defense/cross-tab/save failure/offline/no uncaught errors; shared shell PASS 6/6; syntax and `git diff --check` PASS.
BROWSER / VISUAL EVIDENCE: Bengali and Tamil amendment screenshots `output/playwright/ppm-p-g05-amendment-{bn,ta}-390.png` visually reviewed; headings, safety copy and history are readable with no horizontal overflow while the user-entered multilingual reason remains unchanged.
ROLLBACK: revert `8e9bdee`, then `578a1ad` if the amendment UI must also be removed; additive follow-up schema remains compatible and no stored-data cleanup is needed.
BLOCKERS / UNRESOLVED RISK: reference-only attachments do not claim binary upload/authenticity/object storage; secure authority/notifications remain external. These do not invalidate the locally scoped P-G05 acceptance conditions.
REVIEWER / VERDICT: ACCEPTED LOCALLY — all four P-G05 checklist items have executable domain/browser evidence; no secure-provider or production-deployment claim.
NEXT ACTION (ONE PRECISE STEP): audit P-G06 existing/new saved-copy decode/reopen and atomic corrupt/oversized/future rejection coverage against the actual codec/repository/import UI, then add only the first missing executable recovery proof.
```

### P-G06 pre-code file audit — atomic import, recovery and quota rescue proof

```text
TIME / TIMEZONE: 2026-10-11 02:08 Asia/Dhaka
PATCH OBJECTIVE: close the first P-G06 evidence gap with one browser fixture proving current/V4 saved-copy activation, atomic rejection of malformed/future/oversized/corrupt-image copies, recovery-as-new-draft and actionable repository-failure rescue without changing persistence code
IN-SCOPE FILES: apps/ppm/tests/p-g06-recovery.cjs (new authenticated local browser proof); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: PpmRepository, BackupCodec, RecoveryRepository, workspace import/save implementation, service worker/version strings, all 168 checkpoint/domain rules, P-G05 history, reports, language dictionaries, shared/AQL/TNA files and real customer copies
OWNERSHIP / CALL FLOW / STATE: file input -> workspace size/JSON boundary -> BackupCodec whitelist -> async raster verification -> save current record -> assign new ID -> activate/save; recovery menu -> save current -> codec decode snapshot -> new unlocked ID/cleared release/signatures -> repository; queued save failure -> retained active state + last durable record + visible rescue copy action
COMPATIBILITY RISKS / GUARDS: every invalid import must leave active and durable records unchanged; valid imports must never overwrite source IDs; no test may delete browser records; corrupt raster bytes must reject before activation; forced storage failure must be restored within the disposable context; synthetic data only
VERIFICATION / ROLLBACK: new 390px P-G06 browser test plus P-G00/P-G05/planning/regression/update/shared-shell/syntax/diff checks. Revert the test/tracker patch only; no runtime or stored-data migration.
PRE-CODE VERDICT: approved as a test-only P-G06 slice; coherent bundle-version advancement remains a separate audited step before full gate acceptance.
```

### P-G06 recovery/offline/update completion — accepted locally, no production deployment

```text
TIME / TIMEZONE: 2026-10-11 01:59 UTC / 2026-10-11 07:59 Asia/Dhaka
GATE / OBJECTIVE: P-G06 — prove saved-copy compatibility, atomic rejection, recovery-as-new-draft, storage-failure rescue and coherent offline update behavior without changing runtime persistence or domain rules
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / b7ad8aa / 2f14e4a
FILES CHANGED (EXACT): apps/ppm/tests/p-g06-recovery.cjs; docs/ppm/06_EXECUTION_TRACKER.md
FILES WATCHED/FROZEN: apps/ppm/core.js; apps/ppm/record-services.js; apps/ppm/workspace.js; apps/ppm/service-worker.js; all 168 checkpoints/statuses; GO/CONDITIONAL GO/HOLD; P-G05 history; reports; languages; shared/AQL/TNA files; no runtime source, schema, worker version or saved record changed
IMPLEMENTED / PROVEN: authenticated 390px browser fixture preserves semantic style/action/minutes/reference data through current schema-2 import under a fresh ID and migrates a V4 record to V5 defaults. Malformed JSON, future schema, oversized bytes and corrupt raster signatures leave both the active meeting and durable source unchanged. A named earlier snapshot opens as a new unlocked draft with cleared release/signatures while its parent remains durable. Forced repository failure retains unsaved memory, preserves the prior durable record, sets local/shared failure states and exposes Download Saved Copy. Existing update coverage proves incomplete installs retain the old worker, old tabs/assets remain coherent, legacy readers reject newer saves until upgrade, the new bundle reopens offline, failed/changed saves block reload and explicit Save & Update preserves the latest meeting.
TEST COMMANDS + OUTPUT/COUNTS: `node apps/ppm/tests/p-g06-recovery.cjs` PASS; `update.cjs` PASS 7; `planning.cjs` PASS 16; `regression.cjs` PASS all named persistence/import/recovery/report/language/mobile/offline/error checks; P-G00 PASS (168 tuples/19 profiles/12 processes/current+V4); P-G04 PASS; all P-G05 domain/UI/amendment/localization suites PASS; shared-shell contract PASS; PPM runtime/test syntax checks PASS; `git diff --check` PASS. Browser runtime: cached Playwright 1.64.0 + Chromium 1248 in disposable contexts.
BROWSER / DATA EVIDENCE: 390px test asserts document/body width at most 391px and zero uncaught page errors. Synthetic records only; no browser data deletion, customer copy, production release or deployment.
ROLLBACK: revert `2f14e4a`; only the executable test and its pre-code audit are removed, with no runtime migration or stored-data cleanup.
FEATURE EVIDENCE: P31 corrupt-image/stale-state import guard, P32 local save/reopen, P33 saved-copy/open-as-new behavior, P34 V4/current schema and strict import boundaries, P35 coherent offline update, and P46 storage-failure rescue are locally proven for this gate.
BLOCKERS / UNRESOLVED RISK: clean-checkout Playwright provisioning remains an environment setup requirement because the repository has no package manifest; secure provider services and production authorization remain external. Real customer/private copies were not used.
REVIEWER / VERDICT: ACCEPTED LOCALLY — all four P-G06 checklist items have repeatable browser evidence and the full proportional PPM regression set is green; no production or server-security claim.
NEXT ACTION (ONE PRECISE STEP): audit ReportService and current browser suites against PR01–PR10, then add the first missing executable P-G07 report/language/print/accessibility proof without changing frozen PPM domain rules.
```

### P-G07 pre-code file audit — PR01–PR10 report catalogue and semantic coverage

```text
TIME / TIMEZONE: 2026-10-11 02:08 UTC / 2026-10-11 08:08 Asia/Dhaka
PATCH OBJECTIVE: add an explicit additive PR01–PR10 report catalogue and dedicated report modes for release, blockers, attendance/minutes and custom-checkpoint evidence while preserving every existing report mode and record byte-logically
IN-SCOPE FILES: apps/ppm/report-service.js (read-only report catalogue/render owner); apps/ppm/workspace.js (report selector only); apps/ppm/tests/p-g07-reports.cjs (authenticated synthetic browser/PDF proof); docs/ppm/06_EXECUTION_TRACKER.md
OUT-OF-SCOPE / FROZEN: core.js, planning-services.js, record-services.js, all 168 checkpoint IDs/statuses, relevance/coverage/validation and GO/CONDITIONAL GO/HOLD rules, P-G05 history, repository/backup/recovery, service worker, shared/AQL/TNA files, user-entered values and real records
OWNERSHIP / CALL FLOW / STATE: File/Reports selector -> existing explicit Prepare/Print action -> ReportService clones the active record -> existing deterministic relevance/coverage/planning readers -> transient canvases/PDF bytes. The report catalogue owns only labels/mode routing; it cannot mutate or authorize the meeting.
COMPATIBILITY RISKS / GUARDS: retain legacy `full`, `summary`, `actions`, `checklist`, `evidence`, `approvals`, `measurements` and `changes` modes for old callers; new report modes show `Not recorded` rather than inventing authority/source/time; escape or canvas-render entered text; preserve formula-safe CSV; no report generation may change serialized record state.
VERIFICATION / ROLLBACK: generate all PR01–PR10 PDFs from one bounded synthetic record, assert required page families and immutable serialized source, verify the 390px selector exposes ten IDs with zero page errors, rerun planning/regression/P-G06/shared-shell/syntax/diff checks. Revert report/UI/test/tracker commit; no migration or saved-data deletion.
PRE-CODE VERDICT: approved as an additive conditional P-G07 report-coverage slice; full four-language authored headings, print visual/glyph QA and keyboard/zoom/theme acceptance remain separate before gate acceptance.
```

### P-G07 PR01–PR10 report catalogue and semantic coverage — conditional, gate remains active

```text
TIME / TIMEZONE: 2026-10-11 02:08 UTC / 2026-10-11 08:08 Asia/Dhaka
GATE / OBJECTIVE: P-G07 — expose every specified PPM report as an additive read-only mode and prove required page families without breaking the existing producer
BRANCH / BEFORE SHA / RESULT SHA: feature/tna360-continuous / ad0670c / f881f0c
FILES CHANGED (EXACT): apps/ppm/report-service.js; apps/ppm/workspace.js; apps/ppm/tests/p-g07-reports.cjs; docs/ppm/06_EXECUTION_TRACKER.md
FILES WATCHED/FROZEN: core.js, planning-services.js, record-services.js, all 168 checkpoint IDs/statuses, relevance/coverage/validation and release rules, P-G05 history, repository/backup/recovery, worker, shared/AQL/TNA files and saved records
IMPLEMENTED / PROVEN: Added immutable PR01–PR10 catalogue routing to the existing report owner. Existing `full`, `summary`, `actions`, `approvals`, `measurements`, `changes`, `checklist` and `evidence` callers remain valid. PR07 release shows decision/rationale/version/signers plus an honest offline-authentication note; PR08 shows actual critical/approval/measurement/action blockers without invented pending time; PR09 renders attendance/minutes/actions/references; PR10 renders additive custom checkpoints and linked evidence and states when source/revision was not recorded. Full PR01 includes these new read-only sections. Every page now includes a generated timestamp in addition to existing VESA identity, draft/final state, page number, watermark and Powered by EGENVA.
TEST COMMANDS + OUTPUT/COUNTS: `p-g07-reports.cjs` PASS for PR01–PR10 PDF bytes/required page families/immutable serialized source/390px selector/zero page errors; P-G00 PASS (168 tuples/19 profiles/12 processes/current+V4); P-G06 PASS; planning PASS 16; regression PASS including 24-page full PDF, Bengali all modes, Hindi/Tamil action PDFs, download, CSV formula defense, cross-tab/save failure, mobile/offline/no uncaught errors; update PASS 7; shared-shell contract PASS; syntax and `git diff --check` PASS. Cached Playwright 1.64.0 + Chromium 1248.
BROWSER / VISUAL EVIDENCE: visually reviewed ignored `output/playwright/ppm-p-g07-report-catalogue-390.png`; report selector and five actions are readable with no clipping/overlap, and document/body widths remain within 391px.
ROLLBACK: revert `f881f0c`; additive report modes and test are removed with no schema migration or stored-data cleanup.
FEATURE EVIDENCE: P43 existing report semantics remain executable; P44 now has explicit buyer/action/approval/measurement/change/release/blocker/minutes/custom report modes; P45 page identity/timestamp/page count/watermark/provenance shell is executable. Four-language authored report headings and final visual print/accessibility acceptance remain open.
BLOCKERS / UNRESOLVED RISK: reports honestly show missing source/revision rather than inventing it; no independently authenticated signature claim. Full EN/BN/HI/TA authored-heading parity, all-mode glyph screenshots/print review, keyboard traversal, 200% zoom, 320px and theme matrix remain before acceptance.
REVIEWER / VERDICT: CONDITIONAL — PR01–PR10 structural/data coverage and existing-producer compatibility are locally proven; P-G07 earns no percentage until remaining language/print/accessibility checks pass.
NEXT ACTION (ONE PRECISE STEP): route every PR01–PR10 authored heading and row label through LocaleService in EN/BN/HI/TA, then generate all ten modes per language and assert entered buyer/style/PO/minutes/action/custom values plus serialized record remain unchanged.
```

### P-G07 pre-code file audit — four-language authored report copy

```text
TIME / TIMEZONE: 2026-10-11 02:14 UTC / 2026-10-11 08:14 Asia/Dhaka
PATCH OBJECTIVE: route PR01–PR10 catalogue titles, page headings, row labels and standard explanatory report copy through the existing sentence-only LocaleService in EN/BN/HI/TA without translating entered values or stable domain identifiers
IN-SCOPE FILES: apps/ppm/languages.js (authored report dictionary owner); apps/ppm/report-service.js (read-only translated report renderer); apps/ppm/tests/p-g07-reports.cjs (four-language catalogue/render/value-preservation proof); docs/ppm/06_EXECUTION_TRACKER.md; VESA_PROGRESS.md after proof
OUT-OF-SCOPE / FROZEN: core.js, planning-services.js, record-services.js, workspace.js report command behavior, all 168 checkpoint IDs/statuses, GO/CONDITIONAL GO/HOLD, buyer/style/PO/minutes/actions/custom text, schemas/repositories/workers, shared/AQL/TNA files and saved records
OWNERSHIP / CALL FLOW / STATE: central language preference -> LocaleService.sentence -> ReportService catalogue/page/row authored copy -> transient canvas/PDF. Checkpoint descriptions continue through LocaleService.checkpoint; entered values and IDs bypass translation; report generation reads a clone and cannot persist.
COMPATIBILITY RISKS / GUARDS: English remains the dictionary key/fallback; every required report key must have bn/hi/ta coverage; translated labels must not become lookup keys for domain state; page continuation labels and missing-value guidance are authored copy; status/record/checkpoint IDs remain exact; language switching must leave serialized record and save state unchanged.
VERIFICATION / ROLLBACK: expand the P-G07 browser proof to require complete report-key coverage, render all ten modes in each language, detect the expected Indic script in catalogue/page/row authored text, assert multilingual entered values and stable IDs remain exact, and rerun P-G00/P-G06/planning/regression/update/shared-shell/syntax/diff. Revert language/report/test/tracker patch; no migration or stored-data cleanup.
PRE-CODE VERDICT: approved as the second conditional P-G07 slice; final print visual/glyph, keyboard, 200% zoom, 320px and theme acceptance remain separate.
```
