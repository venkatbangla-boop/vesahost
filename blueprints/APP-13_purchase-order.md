# APP-13: VESA Purchase Order 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 4/15. **Wave:** W2. **Complexity:** L. **Route proposal:** `/apps/purchase-order/`. **Proposed Git branch:** `feature/purchase-order-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Version-controlled PO commercial quantities, style/colour/size allocations, official amendments and buyer/factory order references.

**Typical users:** Buyer/merchandiser/order controller.

**Own record types:** `PurchaseOrder`, `POLine`, `PORevision`, `POAmendment`, `POAcknowledgement`.

**Not responsible for:** TNA critical dates, commission ledger, buyer CRM contact detail, factory manufacturing completion or banking settlements.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- PO number, issuer, buyer, factory/ship-to references
- Currency, Incoterm, order date and agreed shipment window
- Style/colour/size lines with quantity and unit FOB from actual source
- Size ratio and carton/pack terms as explicit buyer order references
- PO revision ID, amendments, requester/approved authority
- Cancellation/partial shipment references
- Document hash/reference and acknowledgment date

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Enter PO header and validated style/colour/size lines
2. Reconcile line totals against approved PO summary
3. Create immutable revised PO on amendment
4. Mark amendment acknowledged only with explicit evidence
5. Generate current vs previous order change report
6. Offer reviewed PO snapshot to downstream apps

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- PO_line_value = line_qty * sourced_unit_price using selected rounding
- PO_total = sum(validated line values) per currency
- Revision difference by style/colour/size and dates
- Unshipped balance from explicit linked shipment references only

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No PO approval or signature inferred from data entry
- No overwrite of signed/acknowledged revision
- Reject duplicate style/colour/size lines unless intentional split identifiers
- No currency mixing or inferred incoterms
- Do not auto-import existing TNA PO into canonical register without reviewed migration

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- PO summary
- Style/colour/size breakup
- PO amendment report
- Buyer vs factory confirmation sheet
- PO version comparison
- Excel/print/PDF draft

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- TNA retains its scheduling order state; linked PO references are immutable reviewed snapshots
- Packing, Order & Commission, LC and Shipment consume versioned PO references
- Buyer CRM only supplies external buyer ID reference

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/purchase-order/
  index.html
  assets/purchase-order.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/po-contract.js
  src/domain/quantity-matrix.js
  src/domain/revision-ledger.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.purchase-order.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Three-colour/five-size duplicate/quantity checks
- Revised PO does not alter prior version or linked snapshots
- Safe missing-PO/pending state on unrelated apps

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Canonical PO authority when TNA and PO app both hold order fields
- Rounding and cancellation/shortfall policy
- Source document acceptance/effective revision

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Versioned PO header and style-size lines.
- **Phase 2 - Controlled operational depth:** Revisions/amendments and signed source preservation.
- **Phase 3 - Reporting and safe references:** Reviewed typed downstream PO reference exports.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
