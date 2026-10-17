# APP-05: VESA LC & Payment 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 5/15. **Wave:** W2. **Complexity:** L. **Route proposal:** `/apps/lc-payment/`. **Proposed Git branch:** `feature/lc-payment-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Documentary credit references, payment obligations, maturity calculations from explicit terms, settlement events and exceptions.

**Typical users:** Commercial merchandiser, finance and import-export documentation team.

**Own record types:** `LCRegister`, `Amendment`, `PaymentObligation`, `PaymentEvent`, `BankDocumentChecklist`.

**Not responsible for:** Banking execution, FX market source, legal certification, commission receivable master or live bank-account access.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Master/B2B/fabric LC identifiers and parties
- Currency, approved LC amount, amendments and validity
- Sight/usance days and start-event definition as approved contract
- Date inputs: opening/BL/acceptance/maturity, sourced
- Invoice/documents/shipment references and conditions
- Settlement/debit/credit transaction records manually entered
- LC terms documentary checklist and status
- Bank charges, FX, calendar conventions from verified source

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Register LC and its approved term sheet
2. Record amendments without destroying prior originals
3. Calculate provisional maturity from chosen event and day convention
4. Record bank documents submitted/accepted/discrepant
5. Record settlements and remaining obligations
6. Generate due-date, document and outstanding reports

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- maturity_date = approved_start_event_date + agreed_days under explicit calendar convention
- current_LC_amount = original_amount + approved_amendments
- open_obligation = agreed_payable - verified_settlement, keeping credit notes explicit
- Flag discrepancies between LC, invoice and documents without inventing bank adjudication

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No assumed 60/90/120 day terms; every obligation has its own source
- No automatic real-world payment or banking API
- No FX conversion unless documented
- No assumption of calendar vs business days
- No legal/banking authority/guarantee claimed
- Amendments and payments preserve audit history

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- LC register
- Amendment and maturity calendar
- Document discrepancy checklist
- Payable/receivable list
- Overdue and cash-flow forecast
- LC payment report

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Purchase Order supplies explicit PO amount/party snapshot
- TNA consumes LC milestone status only
- Order & Commission owns separate commission receivables

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/lc-payment/
  index.html
  assets/lc-payment.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/lc-amendment-ledger.js
  src/domain/maturity-engine.js
  src/domain/payment-reconciliation.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.lc-payment.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Different 60/90/120-day examples only from explicit synthetic terms
- Amended LC value is version-correct
- Unknown BL/acceptance date produces no invented maturity
- Partial settlements and multiple currencies guarded

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Start event and date/calendar day convention for each usance
- Bank/document status authority and amendment workflow
- Exchange-rate source and bank-charge allocation

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** LC register and explicit term schema.
- **Phase 2 - Controlled operational depth:** Amendment, maturity, document discrepancy tracking.
- **Phase 3 - Reporting and safe references:** Manual settlement reconciliation and overdue view.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
