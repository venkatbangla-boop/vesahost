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
| Last accepted implementation gate | **P-G04 — PPM approvals, measurement, revision and decision explainability** (`979fec4`; accepted locally, not deployed) |
| Status | `accepted locally` for P-G00 baseline through P-G04 approvals/measurement/revision/decision explainability; P-G05 is next; no production deployment |
| Current gate | `P-G05 — PPM follow-ups, meeting minutes, evidence and amendment enhancements` |
| LAST COMPLETED ACTION | Added the additive P-G05 follow-up schema and strict legacy-safe codec for meeting minutes, explicit exceptions/authority, action escalation/date-source metadata and bounded non-recursive full-record amendment snapshots; all PPM gates, planning, update and browser regression remain green |
| NEXT ACTION | Add a pure P-G05 follow-up service for explicit aging/date-source calculation and controlled amendment creation that snapshots the finalized parent and invalidates copied approvals/signatures, with unit tests before UI wiring |
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
- [ ] Action ownership/aging/escalation and date-source rules.
- [ ] Optional minutes/waivers/authority record with versioned compatibility.
- [ ] Evidence links/attachments and failed upload/save protection.
- [ ] Amendment history and approvals/signature invalidation fully tested.

### P-G06 — Saving, recovery, offline and update reliability
- [ ] Existing and new saved copies decode/reopen with no loss.
- [ ] Corrupt/oversized/future data rejected atomically; previous draft preserved.
- [ ] Offline first open and upgrade while old tab remains open.
- [ ] Quota/browser-storage failures result in actionable rescue flow, not fake saved status.

### P-G07 — Reports, four languages, print and accessibility
- [ ] Report PR01–PR10 coverage recorded; existing producer not broken.
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
