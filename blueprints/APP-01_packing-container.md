# APP-01: VESA Packing & Container 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 1/15. **Wave:** W1. **Complexity:** L. **Route proposal:** `/apps/packing-container/`. **Proposed Git branch:** `feature/packing-container-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Cartonization plans, pack configurations, pallet/container space planning and calculated loading scenarios.

**Typical users:** Merchandiser, packing planner and shipment coordinator.

**Own record types:** `CartonSpecification`, `PackingConfiguration`, `PackingPlan`, `ContainerLoadScenario`, `LoadingLine`.

**Not responsible for:** AQL carton inspection/selection, carrier booking, shipping documents, warehouse inventory or real-world loading sign-off.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- PO/style/color/size reference and piece quantities: source-approved integers
- Carton ID/number ranges: strings preserving leading zeros
- Pieces per carton and assortment ratio: integers validated against order quantities
- Carton dimensions L/W/H: numeric with explicit cm/mm/in unit
- Net/gross carton weights: numeric with explicit kg/lb unit
- Container type and internal dimensions/payload: verified source, never assumed
- Optional pallet dimensions/stacking and orientation constraints: sourced values
- Tolerance/headroom, stacking/loadability constraints: user-approved policy

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Create packing plan from verified PO reference and size/colour breakup
2. Define packing variants: solid colour/size or mixed assortment
3. Calculate packed pieces/cartons and unresolved balances
4. Preview per-carton CBM and total gross weight using explicit units
5. Choose verified container constraints and compare scenarios
6. Record actual manual loading reconciliation without claiming physical fit

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- volume_m3 = length_m * width_m * height_m, after explicit unit conversion
- cartons_needed = ceil(pieces_to_pack / approved_pieces_per_carton), only for homogeneous cartons
- packed_pieces = sum(carton_count * pieces_per_carton) with assortment-line reconciliation
- total_cbm = sum(carton_count * carton_cbm), no automatic packing-efficiency assumption
- total_gross_weight = sum(carton_count * actual_gross_weight)
- Flag geometric volume eligibility separately from feasible real loading; do not assert fit from CBM alone

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No negative/zero dimensions or pieces-per-carton
- No overshipment or invented size/colour allocation
- Duplicate carton identifiers and overlapping ranges rejected
- Mixed-carton composition totals must equal declared carton contents
- No automatic approval of loading, custody or dispatch
- Container internal sizes, doorway, usable volume and payload require source confirmation

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Packing configuration sheet
- Carton list with composition
- CBM/weight summary
- Container scenario comparison
- Packing balance report
- Draft load-plan print/PDF and local workbook

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Purchase Order 360 snapshot as source quantity reference
- Shipment & Documentation 360 consumes a user-approved packing snapshot
- AQL may reference verified carton IDs only; AR11 randomization stays in AQL

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/packing-container/
  index.html
  assets/packing-container.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/cartonization-policy.js
  src/domain/volume-engine.js
  src/domain/load-scenario-engine.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.packing-container.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- 20ft/40ft/40HC demo scenarios with supplied dimensions, no built-in guessed capacities
- Mixed assortment and partial pack reconciliations
- Carton IDs retain leading zeros through import, save and report
- Overweight/overpacked/unverified-container states stay blocked

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Container equipment data source and permitted container catalogue
- Carton handling/stacking and gross-weight policies
- Whether packing ratios are mandated per buyer/style

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Single-style carton master, exact CBM/weight, saved copies.
- **Phase 2 - Controlled operational depth:** Mixed colour/size ratios, overpack guards, multiple pack versions.
- **Phase 3 - Reporting and safe references:** Source-backed container scenario and loading report.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
