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
| Last accepted implementation gate | **NONE in this handover** |
| Status | `draft-only` — new PPM rework NOT implemented or deployed by this packet |
| Current gate | `P-G00 — local clone audit and baseline proof` |
| LAST COMPLETED ACTION | Documentation packet authored, with GitHub-file evidence |
| NEXT ACTION | Keep P-G00 explicitly blocked until its Playwright dependency and durable tuple/V4/V5 fixture are resolved; the independent P-G01 shell adapter slice is now recorded and must be reconciled with AQL/TNA before shared acceptance |
| External blocker | Secured backend and cross-company role/approval credentials not provisioned |

## Universal session protocol
Read `apps/ppm/AGENTS.md` and this tracker; compare actual `git status`, commits, tests and screenshots with ledger. If there is a discrepancy, downgrade status and inspect before changing. Pick earliest *accepted-prerequisite* group, implement one small patch, run tests, verify other apps not broken, commit, append log, set next action. Any new/changed UI model must be measured against `VESA-UNIFORM-UI-v1` in document 04. Never directly push main without explicit release instruction.

## Gate sequence (one continuous rework program)
### P-G00 — Audit and accepted baseline (NO code edit before passing)
- [x] Repository root, branch, dirty tree, HEAD, installed instructions, tests/deps confirmed.
- [x] Directly inspect every currently scoped PPM, platform, service worker and test file; map ownership/state/call/dependencies.
- [x] Name exact in-scope/watched/frozen files and rollback posture; preserve the existing continuous feature branch.
- [ ] Capture existing 168 checkpoint tuples, profile list, normal/abnormal readiness fixtures and V4/V5 saves.
- [ ] Run current 3 PPM test suites; log command, versions, pass/fail; capture desktop/mobile baseline screenshots.
- [ ] Record audit verdict `accepted` with evidence or `blocked` and exact missing prerequisite.

### P-G01 — One shared VESA shell platform gate (coordinate with AQL/TNA)
- [ ] Audit root auth/preferences/App Centre and coordinate one common shell patch, not one per app.
- [ ] Create/approve shared nav/theme interface; one sticky navigation region and correct return-to-Apps.
- [ ] Verify root `/`, login, apps, admin, PPM, AQL and available TNA routes across devices before claiming platform accepted.
- [ ] Existing app behavior, local accounts, preferences and identity unaffected.

### P-G02 — PPM adapter, home and toolbar cleanup
- [ ] Replace PPM `#fileMenu` positional behavior with shared navigation adapter; no duplicate controls.
- [ ] Home New/Continue/Open Saved/Practice/Open Saved Copy follows same layout as AQL/TNA.
- [ ] Dashboard, summary cards and section nav scroll normally; no overlap 320/360/390/768/1280.
- [ ] Show Save state from real repository, not a synthetic success label.
- [ ] PPM domain and 168 checkpoint parity unchanged.

### P-G03 — PPM applicability, easy workflow, search and custom controls
- [ ] Inline step-by-step help, next-action list, all relevant sections/filters available.
- [ ] Product/process relevance, N/A, custom checkpoints/critical flags exactly preserved.
- [ ] Buyer/market/manual authority text and status understood without technical jargon.

### P-G04 — Approvals, measurement, revision and decision explainability
- [ ] Frozen GO/CONDITIONAL/HOLD parity passes for all synthetic cases.
- [ ] Required approvals, excluded statuses, who/date/proof handled with no silent waiver.
- [ ] POM boundaries, invalid data, unit, asymmetric tolerance tested and explained.
- [ ] Controlled revision invalidates stale signoff; locked records safe.
- [ ] Explain blocker/action/owner without inventing new buyer rules.

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
```
