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
| NEXT ACTION | Copy package into repo, inspect current Git HEAD/files, baseline code/tests, lock change scope and proceed P-G00 |
| External blocker | Secured backend and cross-company role/approval credentials not provisioned |

## Universal session protocol
Read `apps/ppm/AGENTS.md` and this tracker; compare actual `git status`, commits, tests and screenshots with ledger. If there is a discrepancy, downgrade status and inspect before changing. Pick earliest *accepted-prerequisite* group, implement one small patch, run tests, verify other apps not broken, commit, append log, set next action. Any new/changed UI model must be measured against `VESA-UNIFORM-UI-v1` in document 04. Never directly push main without explicit release instruction.

## Gate sequence (one continuous rework program)
### P-G00 — Audit and accepted baseline (NO code edit before passing)
- [ ] Repository root, branch, dirty tree, HEAD, installed instructions, tests/deps confirmed.
- [ ] Directly inspect every impacted PPM, platform, service worker and test file; map ownership/state/call/dependencies.
- [ ] Name exact in-scope/watched/frozen files and rollback posture; create feature branch.
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
