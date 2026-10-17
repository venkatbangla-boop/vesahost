# APP-14: VESA Claims & Disputes 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 14/15. **Wave:** W4. **Complexity:** M. **Route proposal:** `/apps/claims-disputes/`. **Proposed Git branch:** `feature/claims-disputes-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Commercial/quality/short-shipment case records, requests, evidence and explicit settlement/rejection history.

**Typical users:** Quality manager, merchandiser and trading-office finance.

**Own record types:** `ClaimCase`, `ClaimFinding`, `ClaimEvidence`, `ClaimResponse`, `ClaimSettlement`.

**Not responsible for:** AQL inspection result, legal/arbitration service, banking chargeback execution or PO amendment owner.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Buyer/supplier/PO/shipment/AQL typed references
- Claim category and alleged affected quantities
- Documented damages/value/currency and source
- Finding description, evidence references and dates
- Responsible party and response timeline
- Settlement terms/credit/debit reference
- Status: open/in-review/agreed/rejected/closed with authority

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Open claim linked to frozen evidence source
2. Register each finding and claimed quantities/value
3. Record supplier/buyer correspondence summary
4. Track action owner and proposed settlement
5. Record explicit acceptance/rejection and settlement evidence
6. Generate case summary and unresolved exposure

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Claimed exposure = sum(verified claim-line values) by currency
- Settled balance = agreed claim amount - recorded settlement amount, only for approved claim
- AQL failed inspection remains immutable even after claim closure

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No automatic liability admission from inspection failure
- No legal/financial advice or auto settlement
- Protect original claim and correspondence snapshots
- Do not mark payment occurred from credit note draft
- Ambiguous responsibility stays pending

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Claim case report
- Evidence index
- Outstanding claim exposure
- Supplier response tracker
- Settlement record and change history

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- AQL provides inspection result/reference, never mutable from Claims
- Shipment provides shortage/dispatch evidence reference
- Order & Commission and LC payments remain separate ledgers

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/claims-disputes/
  index.html
  assets/claims-disputes.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/claim-register.js
  src/domain/exposure-ledger.js
  src/domain/settlement-history.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.claims-disputes.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Claims do not rewrite AQL original record
- Disputed vs agreed values distinct
- Partial settlement never silently closes full case

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Who can approve or close claims
- Evidence threshold for monetary exposure
- Treatment of disputed/settled/cancelled amounts

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Case register, source evidence links and alleged exposure.
- **Phase 2 - Controlled operational depth:** Responses, status transitions and review history.
- **Phase 3 - Reporting and safe references:** Agreed settlement and case balance reconciliation.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**