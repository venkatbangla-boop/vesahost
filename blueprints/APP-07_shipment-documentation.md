# APP-07: VESA Shipment & Documentation 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 8/15. **Wave:** W3. **Complexity:** L. **Route proposal:** `/apps/shipment-documentation/`. **Proposed Git branch:** `feature/shipment-documentation-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Draft shipment file, packing list and commercial/shipping document preparation, document status and quantity reconciliation.

**Typical users:** Shipping merchandiser and commercial-document controller.

**Own record types:** `ShipmentFile`, `ShippingDocument`, `DocumentVersion`, `PackingListSnapshot`, `DispatchReference`.

**Not responsible for:** Physical carton packing calculations, AQL release, freight booking portal, customs execution or bank LC adjudication.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Approved PO/style/lot/party/shipping references
- Packing snapshot with carton IDs/counts and item breakdown
- Invoice quantity, unit price, currency and source reference
- Container/booking/vessel/port/ETD/ETA as entered
- Declared gross/net weights and CBM from verified sources
- Country-of-origin/HS/reference fields from authority
- Document status, revision and reviewer
- Carrier/bank/forwarder acknowledgment separately captured

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Create shipment file from an order reference
2. Attach approved packing snapshot
3. Prepare draft packing list, invoice and document checklist
4. Reconcile packed, shipped and invoiced quantities
5. Track draft/sent/acknowledged/revised document states
6. Print/export controlled versioned documents

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Total shipped pcs reconciles to selected order/shipment lots
- Invoice amount = sourced shipped units * contract unit price per line
- CBM and weights from approved packing snapshot, not recomputed silently
- Unknown legal/compliance data remains draft/needs information

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- Do not call draft invoice a signed legal/customs original
- Do not infer vessel, booking or customs release
- Prevent duplicate carton/lot in same shipment line
- Invoice and packing quantity mismatch is flagged
- AQL decision stays readonly from manual reference

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Draft commercial invoice
- Packing list
- Shipment document checklist
- ETD/ETA tracker
- Document revision log
- Shipment discrepancy report

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Packing & Container owns packing plan quantities
- Purchase Order owns PO commercial snapshot
- AQL final result is reference only; LC & Payment references document submission

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/shipment-documentation/
  index.html
  assets/shipment-documentation.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/document-model.js
  src/domain/shipment-reconciliation.js
  src/domain/version-ledger.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.shipment-documentation.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Mixed styles/multiple partial shipments without double counting
- Revised packing snapshots retain previous versions
- Missing customs/BL information keeps draft

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Required country/buyer document list
- Invoice rounding/tax/trade term authority
- When shipment file can be marked dispatched

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Shipment file and draft document checklist.
- **Phase 2 - Controlled operational depth:** Invoice/packing reconciliation with manual approved snapshot.
- **Phase 3 - Reporting and safe references:** Versioned documents and partial-shipment exceptions.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**