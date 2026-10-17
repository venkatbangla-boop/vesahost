# APP-09 Production Tracker 360 — Execution Tracker

## 2026-10-17 — M2 Chromium local workspace checkpoint (accepted)

**Verified development commit** `11239d42ec0b6fb4782281b46151bb467d23fb2a`; [GitHub Actions #39021964916 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39021964916). Real Chromium workflow covers source-defined Production order, reviewed opening WIP, stage target, day/shift actual and immutable correction, duplicate atomic rejection, local Save/Reload/Continue, portable `.vesaprod` restore and corrupted-copy isolation, EN/BN/HI/TA and 320/360/390/640/768/1024/1280/1440 CSS px with no page-wide overflow or foreign network requests. Pure domain and all established sibling regression tests passed. One shared top VESA shell, no App Centre/catalogue/service-worker release and no private customer data.

**M2 owned files:** `apps/production-tracker/index.html`, `assets/production-tracker.css`, `src/bootstrap.js`, `src/application/workspace-controller.js`, `src/data/local-record-port.js`, `src/data/saved-copy-codec.js`, `src/i18n/app-copy.js`, `tests/save-reopen.test.cjs`, `tests/browser-workflow.cjs`, development workflow. Previous M1 pure domain is unchanged.

**Proof verdict:** M2 `accepted` for synthetic local workflow, not for actual factory definitions, commercial use, native 200% device zoom or final shipping/quality authority. A synthetic source can only mean locally reviewed evidence, not buyer-approved goods.

**M3 exact next patch / ownership:** `apps/production-tracker/src/domain/reviewed-reference.js` (new pure typed source validator), `apps/production-tracker/src/reports/report-model.js` (new draft-only safe HTML/workbook model), `apps/production-tracker/src/application/workspace-controller.js`, `apps/production-tracker/index.html`, `apps/production-tracker/tests/report-reference.test.cjs`, `apps/production-tracker/tests/browser-workflow.cjs`, `.github/workflows/production-tracker.yml`. Allow separate explicitly verified read-only TNA/PO references copied from user's local source file, never read or write sibling storage. Preserve old `.vesaprod` decoder and old records with optional references. Excel must escape formula cells and keep numerical counts numeric; printable report must label source-only status. No change to `apps/tna`, `apps/aql`, `apps/ppm`, global shell, service worker, or other released apps. Test Node/Chromium report/reference round-trip, tampered input rejection, old copy backward compatibility, regression. Rollback by reverting this M3 patch group.

**CURRENT NEXT ACTION:** Finish bounded M3 report/manual reference patch, verify, then M4 full release eligibility/UAT assessment. No public APP-09 deploy until actual Chromium final and separate Pages suitability checks.

---

## 2026-10-17 — M1 pure domain verification checkpoint (accepted)

**Commit:** `45b08317b0c8b649381b7858d35a2a708d1ae01e`. [Actual GitHub Actions #39021308588 — SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39021308588) for Node syntax, `tests/domain.test.cjs`, canonical blueprint SHA-256/ZIP, next-app starter, Shipment/Fabric/Sampling/LC/PO/Packing/Commission/TechPack domain tests, TNA G02/G05, PPM baseline, AQL baseline and sampling, shared VESA shell contract.

**M1 files directly implemented and tested:**
- `apps/production-tracker/src/domain/stage-flow.js`: explicit PO/style/colour/size/lot/factory/source, production stage, date/shift/line/unit and review/evidence constraints.
- `apps/production-tracker/src/domain/wip-balance.js`: stage-only `opening + locally reviewed in - locally reviewed out - locally reviewed rejects`, negative source balances fail; missing opening and target remain `null`.
- `apps/production-tracker/src/domain/daily-output-ledger.js`: immutable append-and-revise source evidence, duplicate-day/shift prevention, source target amendment chain, stage-specific good totals and draft-only status; unreviewed observations never become verified output or movement.
- `apps/production-tracker/tests/domain.test.cjs`: synthetic multi-line/day, cutting and sewing separate, stale/invalid corrections, atomic failure, source target revisions and no AQL/TNA release.
- `.github/workflows/production-tracker.yml`: Node M1 and sibling verification on this feature branch only.

**Drift:** No changes to any previous app, `js/app-catalogue.js`, global shell, auth, local storage or real third-party records. This does **not** verify user-specific definitions of good/rework/shift-close, physical goods, browser Save/Open or any commercial release.

**Verdict:** M1 `accepted` for narrow pure-domain technical scope based on independent CI. M2 `not started`; full app `conditional` until local/browser and third-party gates.

**PRECISE NEXT ACTION:** M2 file-level audit and implement `apps/production-tracker/index.html`, `assets/production-tracker.css`, `src/bootstrap.js`, `src/application/workspace-controller.js`, `src/data/local-record-port.js` and `src/data/saved-copy-codec.js`, `src/i18n/app-copy.js`. Reuse shared shell, versioned isolated browser storage and checksum-verified saved copies. Verify real Chromium creating stage daily records, local save/reopen, corrupt-copy atomicity, EN/BN/HI/TA and 320/390/768/1280. Do not register in public App Centre or call M2 complete until proven.

---

## 2026-10-17 — M0 file-level source audit

**Objective:** Resume approved APP-09 after permanent original blueprint recovery. Source: `blueprints/APP-09_production-tracker.md`, original SHA256 `f1e03a4069e294df90101888e74a24777e38a17303667837b3d54262224cfd06`. Baseline `main` `10d11ba3cda6fdeb8dc40c5413a2aa667ed08f08`, audited `feature/production-tracker-360` at same documentation checkpoint. Repository source CI #39020959490 and Pages #39020959600 SUCCESS. No APP-09 runtime app previously existed; GitHub code search found no `vesa.production-tracker.records.v1` storage key.

### Controlling policy and frozen acceptance
- `AGENTS.md`, `docs/portfolio/02_PLATFORM_STRUCTURE_CONTRACT.md`, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` and `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`.
- Single shared VESA shell and EN/BN/HI/TA. TNA plans/CPM, PPM 168 checks, AQL Ac/Re and all existing Costing/Packing/Commission/TechPack/PO/LC/Sampling/Fabric/Shipment records are **frozen**.
- There is no accepted factory definition of good pieces, rework/reject accounting, unit conversion, shift close, capacity or target approval. The domain may record explicitly reviewed source facts and report independent arithmetic, but must not claim official approval, efficiency or GO/SHIP.

### Exact file ownership impact map

| Path | Ownership and state | Incoming → outgoing call flow / dependencies | Risk and scope |
|---|---|---|---|
| `blueprints/APP-09_production-tracker.md` | Frozen user-approved requirements | Read-only into scope/planning | **FROZEN**, never edit |
| `templates/vesa-next-app/*` | Reusable platform examples, not published | M2 adapter reads examples, no runtime dependency | **WATCHED**, never copy placeholder as live |
| `apps/shipment-documentation/src/domain/shipment-engine.js` | Separate logistics source, existing records | Future manual reference only, no private local reads | **FROZEN**, do not edit |
| `apps/fabric-trims/src/domain/material-engine.js` | Separate fabric source, existing records | Future manual reference only | **FROZEN**, do not edit |
| `js/vesa-workspace-shell.js`, `css/vesa-workspace.css` | One global UI/header owner | Future APP-09 controller delegates menus/account/theme | **FROZEN**, no APP-09 shell duplication |
| `apps/production-tracker/src/domain/stage-flow.js` | Proposed new stage/source schema/validation | Pure calls from controller and domain ledger; browser-independent | **M1 IN SCOPE** |
| `apps/production-tracker/src/domain/wip-balance.js` | Proposed pure balance/target computation | Called by daily-output-ledger; no DOM, no storage | **M1 IN SCOPE** |
| `apps/production-tracker/src/domain/daily-output-ledger.js` | Proposed source-specific output records, revision lifecycle | Uses stage-flow and WIP pure functions, return projections | **M1 IN SCOPE** |
| `apps/production-tracker/tests/domain.test.cjs` | Deterministic synthetic acceptance | Node loads pure domain modules; no app or private state | **M1 IN SCOPE** |
| `.github/workflows/production-tracker.yml` | Proposed branch-only Node and sibling regression gate | GitHub Action checks code and current frozen baselines | **M1 IN SCOPE** |
| `docs/production-tracker/01_EXECUTION_TRACKER.md` | Durable M0/M1 ledger | Latest accepted patch/evidence and explicit NEXT ACTION | **M0/M1 IN SCOPE** |

### Lifecycle and call flow
No existing APP-09 stored record is read or rewritten. Future command path: shared shell/input → APP-09 controller → new pure `stage-flow` validator + `daily-output-ledger` revision guard → `wip-balance` projections → app-only record port → UI / local reports. Cross-app references must be reviewed, copied, bounded and read-only. No direct access to another app's localStorage and no generated physical/buyer approval.

### Gated patch plan and rollback
**M0** audit accepted for file placement/ownership; no business-runtime claims. **M1** one reversible group: the three new pure `src/domain/*.js` files, `tests/domain.test.cjs`, `.github/workflows/production-tracker.yml` and this tracker only. Validate explicit source/date/line/shift/lot, duplicate handling, append-only corrections, stage-separated sums, missing target as `null`, WIP overflow rejection, no global or sibling writes, sibling Node regressions. Do **not** register a public route, service worker, App Centre or local record store in M1. Roll back M1 commit if domain CI fails; original 15 blueprints and all previous released apps remain untouched.

**M2 (not accepted yet):** `apps/production-tracker/index.html`, `assets/production-tracker.css`, controller, i18n and isolated local store/codecs; verify browser-native save/reopen, checksum, keys and languages. **M3:** explicit manual TNA/PO references and draft XLSX/PDF. **M4:** full Chromium responsive/screenshots and TNA/PPM/AQL sibling checks; separately review non-commercial Pages eligibility.

**CURRENT GATE:** M0 ownership/scope `accepted`; M1 technical implementation `in progress`, not yet verified.

**PRECISE NEXT ACTION:** Add M1 pure modules and synthetic domain test, run CI, record SHA/evidence. After M1 verified, proceed M2 without asking for a duplicate ZIP or repeating completed apps.
