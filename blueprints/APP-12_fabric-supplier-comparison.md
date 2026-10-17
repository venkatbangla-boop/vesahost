# APP-12: VESA Fabric & Supplier Comparison 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 13/15. **Wave:** W4. **Complexity:** M. **Route proposal:** `/apps/fabric-supplier-comparison/`. **Proposed Git branch:** `feature/fabric-supplier-comparison-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Sourced material supplier offers and a comparable, provenance-rich landed-input comparison, without automatically selecting vendor.

**Typical users:** Fabric sourcing and costing merchandiser.

**Own record types:** `MaterialRequirementSnapshot`, `SupplierOffer`, `ComparisonScenario`, `ComparisonDecision`.

**Not responsible for:** Canonical product BOM, material stock/booking, official FX provider, final garment Costing FOB, vendor compliance approval.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Fabric article, composition/GSM/width/construction/shrinkage basis
- Offer supplier/validity/MOQ/lead time and currency
- Unit price per yard/metre/kg with explicit width/weight basis
- Trade term, origin and delivery term
- Verified transport/duty/tax/LC charges separately sourced
- Exchange-rate value, source and date
- Quality/test/compliance equivalence notes

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Build approved specification requirement snapshot
2. Enter two or more dated supplier quotes
3. Normalize comparable units only when conversion information exists
4. Calculate scenario cost from sourced components
5. Flag non-comparable construction/quality/trade terms
6. Review and export ranked/conditional comparison without automatic purchase decision

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- unit_normalization uses explicit fabric weight, width and measurement data
- comparative_landed_input = sourced_offer_price + sourced_applicable_logistics_and_charges
- Currency conversion requires chosen dated exchange rate
- Comparison status is NOT COMPARABLE when specs/units/terms mismatch

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No scraped or guessed China/BD/India current rates
- No fabricated duties, freight or assumptions
- Do not rank incompatible GSM/width/composition as cost-only winners
- Supplier recommendation is internal analysis, not compliance approval
- Offer valid-to and quote revision retained

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Supplier quotation comparison
- Price-per-unit normalized matrix
- Landed input scenario
- MOQ/lead-time differences
- Open information gaps

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Tech Pack owns material specification source
- Fabric & Trims owns booking/receipt
- Costing 360 consumes an explicit approved comparison snapshot

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/fabric-supplier-comparison/
  index.html
  assets/fabric-supplier-comparison.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/quote-normalization.js
  src/domain/comparability-gate.js
  src/domain/landed-scenario.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.fabric-supplier-comparison.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Non-comparable quotes flagged
- No silent FX or unit conversion
- Expired offer and missing freight remain explicit unknown

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Which conversions are valid for fabrics and widths
- Applicable landed-cost terms by Incoterm/country
- Specification deviation acceptance criteria

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Dated supplier offer records and spec match.
- **Phase 2 - Controlled operational depth:** Approved unit/currency/landed scenario normalization.
- **Phase 3 - Reporting and safe references:** Revision-aware comparison reports and Costing snapshot.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**