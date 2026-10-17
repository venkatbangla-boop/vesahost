# APP-09: VESA Production Tracker 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 9/15. **Wave:** W3. **Complexity:** L. **Route proposal:** `/apps/production-tracker/`. **Proposed Git branch:** `feature/production-tracker-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Daily stage-specific output, WIP, line capacity actuals, rework and shortfall explanations.

**Typical users:** Factory production planner, merchandising team and production coordinator.

**Own record types:** `ProductionOrderReference`, `LineDailyOutput`, `StageBalance`, `ProductionException`, `OutputRevision`.

**Not responsible for:** TNA master milestones/CPM, PPM approval, AQL defect acceptance or factory capability onboarding.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- PO/style/colour/size/lot and factory/line reference
- Approved order and cut quantities for comparison
- Day, shift, production stage and unit basis
- Opening WIP, output, rework, rejects and transfer events
- Target per day and planned capacity from explicit source
- Previous stage handoff reference and evidence
- Correction/revision reason, owner and timestamp

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Register order/line production plan reference
2. Enter daily cutting/sewing/finishing/packing observations
3. Check duplicate day/line/stage submissions
4. Compute stage progress and WIP under approved movement rules
5. Highlight behind-schedule and invalid balances
6. Export daily output summary or TNA milestone reference

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Per-stage cumulative_good = sum(approved_distinct_daily_good_outputs)
- Stage WIP = opening + verified_in - verified_out - verified_rejects, by defined unit
- Balance = approved_stage_target - cumulative_good for that stage
- Do not sum cutting+sewing+finishing outputs as total finished goods
- Efficiency needs a stated denominator; do not manufacture standard minutes

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No double counting a piece through multiple stages
- Never turn production output into final AQL acceptance
- Prevent negative/duplicate revisions and unmatched stage transfers
- Missing data stays pending, not 100% complete
- Source target amendments require history

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Daily production report
- Stage WIP and balances
- Target vs actual trend
- Line/shift exception report
- Factory progress reference for TNA

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- TNA owns plan/critical dates and consumes verified production snapshots
- Purchase Order owns PO quantity revisions
- AQL owns inspection/defect outcomes, not production totals

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/production-tracker/
  index.html
  assets/production-tracker.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/stage-flow.js
  src/domain/wip-balance.js
  src/domain/daily-output-ledger.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.production-tracker.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Partial outputs and multi-line/day without double count
- Correction history immutable
- Mismatch between stage handoff and received quantities flagged

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Definition of good units, rework/reject, transfer and shift close
- Measurement unit by stage and line
- Target revision approval

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Daily stage/line output register.
- **Phase 2 - Controlled operational depth:** WIP transfer/rework and target reconciliation.
- **Phase 3 - Reporting and safe references:** Trend dashboard and TNA reference snapshots.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**