# APP-02: VESA Order & Commission 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 2/15. **Wave:** W1. **Complexity:** M. **Route proposal:** `/apps/order-commission/`. **Proposed Git branch:** `feature/order-commission-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Agent/trading office commission agreements, accrual/earned balances, invoices and commission collections against verified order values.

**Typical users:** Trading office director, finance and merchandiser.

**Own record types:** `CommissionAgreement`, `CommissionLine`, `CommissionInvoice`, `CommissionReceipt`, `CommissionReconciliation`.

**Not responsible for:** Master buyer PO revisions, bank LC obligations, buyer/factory settlement ledger, or entire general ledger.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Buyer, factory, PO and style as explicit typed references
- Commission agreement ID, effective date/version and approved terms
- Currency, commission basis and included/excluded charges: explicit agreement
- FOB quantity and unit price OR authoritative FOB line total: sourced values
- Percentage rate and rounding convention: approved per agreement
- Earned/invoiced/received amounts, date and transaction reference
- Deductions/credit notes and ownership: documented
- Exchange conversions: explicit rate, rate date and source

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Register a commission agreement version
2. Link an order/PO reference without creating a competing PO master
3. Calculate expected commission using approved value and basis
4. Post earned status only against defined business milestone/evidence
5. Issue draft commission statement/invoice
6. Record receipts/adjustments and reconcile open balance

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- commission_base = approved_FOB_basis adjusted only by explicit contract exclusions
- gross_commission = commission_base * approved_percent / 100
- outstanding = approved_earned - received - contractually_valid_adjustments
- Compare contract agreement revisions without retroactive silent recalculation
- Currency conversion runs only with explicit rate source, date and target currency

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No default 2%, 3% or 4% unless explicitly set in agreement
- No posting received > available balance without flagged overpayment
- Do not treat expected commission as already earned or paid
- Forbid mixed currencies without explicit conversion
- Invoice/cancellation/revision history immutable where finalized
- Cannot silently derive payment terms from TNA or PO

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Buyer/factory commission report
- PO-wise expected vs earned vs received
- Outstanding/overdue tracker
- Commission invoice draft
- Receipt reconciliation
- Excel/print/PDF ledger

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- TNA/PO references provide readonly context
- LC & Payment 360 handles LC/bank/factory payment obligations, not commission ledger
- Buyer CRM holds contact information; no direct private store reads

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/order-commission/
  index.html
  assets/order-commission.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/agreement-policy.js
  src/domain/commission-engine.js
  src/domain/receivable-ledger.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.order-commission.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Separate 2%, 3%, 4% as synthetic rate tests without defaulting any buyer
- Partial payment and multiple currency guard tests
- Revision preserves original invoice amount and audit trail
- Expected/earned/received totals stay separately reported

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Commission basis: total FOB, shipped FOB, invoiced FOB or received FOB
- Earned milestone and due-date convention
- Rounding by PO line/contract/invoice and treatment of credits

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Sourced agreement and expected commission by PO.
- **Phase 2 - Controlled operational depth:** Earned/invoiced/received ledger with adjustments and history.
- **Phase 3 - Reporting and safe references:** Aging dashboard, version comparisons and statements.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
