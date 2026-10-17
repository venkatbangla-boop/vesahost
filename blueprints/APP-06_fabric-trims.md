# APP-06: VESA Fabric & Trims 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 7/15. **Wave:** W2. **Complexity:** L. **Route proposal:** `/apps/fabric-trims/`. **Proposed Git branch:** `feature/fabric-trims-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Material BOM demand, purchase/booking references, inbound receipt, allocations, shortages and material-readiness evidence.

**Typical users:** Sourcing merchandiser, material controller and procurement planner.

**Own record types:** `MaterialItem`, `MaterialRequirement`, `MaterialBooking`, `GoodsReceipt`, `MaterialAllocation`.

**Not responsible for:** Vendor master, fabric quote comparison, external warehouse inventory, TNA scheduling, supplier certification or product costing margin.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Style/PO/colour size reference and approved BOM revision
- Fabric/trims description, composition, width/GSM/construction or units
- Required consumption, purchase unit and wastage from authorized source
- Supplier quotation/booking ID and committed delivery date
- Quantity ordered, received, rejected and allocated by lot/shade
- Quality/release status backed by evidence reference
- Shipment reference, batch/lot and update timestamps
- Unit conversion factor (e.g. yd/m/kg/pcs) with explicit basis

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Import approved BOM/material requirements as a reviewed snapshot
2. Create bookings per supplier/material/colour/lot
3. Record incoming receipts and QC disposition
4. Reconcile allocated vs available by order/style
5. Flag shortages, late supply and unverified conversions
6. Export materials readiness references to TNA/PPM

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- net_available = received_approved - allocated - reserved_to_other_orders
- shortage = max(0, approved_required - confirmed_available_for_order)
- delivery_variance = actual_or_forecast_date - approved_required_date using sourced calendar
- Material conversions require given width, weight and other factors; no implicit yard-to-kg

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No negative stock or double allocation under same receipt identity
- Different lot/shade cannot be silently pooled
- Received is not automatically QA-approved
- BOM revision must not rewrite actual purchase history
- No default wastage/consumption or delivery assumptions

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Material booking register
- Fabric/trims consumption vs requirement
- Shortage and readiness dashboard
- Receipt/lot/shade reconciliation
- Supplier delivery exceptions
- Order-level material summary

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Tech Pack owns material specifications/BOM reference
- Fabric & Supplier Comparison owns quotations/selection analysis
- TNA consumes readiness milestones, Costing consumes price/consumption snapshot

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/fabric-trims/
  index.html
  assets/fabric-trims.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/material-demand.js
  src/domain/booking-ledger.js
  src/domain/lot-allocation.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.fabric-trims.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Partial receipts, shortage and reservation conflict
- Shade-lot separation and duplicate receipt rejection
- Pending QC prevents approved available balance

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Quantity units and lot/shade control policy
- Allocation priority and rejection/disposition authority
- BOM/consumption revision precedence

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** BOM demand and supplier booking register.
- **Phase 2 - Controlled operational depth:** Receipt/lot QC status and order allocation.
- **Phase 3 - Reporting and safe references:** Shortage dashboard and approved TNA references.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
