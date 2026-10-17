# APP-08: VESA Factory & Vendor 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 10/15. **Wave:** W3. **Complexity:** M. **Route proposal:** `/apps/factory-vendor/`. **Proposed Git branch:** `feature/factory-vendor-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Factory/supplier identity records, declared capability/capacity, audit-document evidence, onboarding status and performance snapshots.

**Typical users:** Sourcing office vendor manager and factory liaison.

**Own record types:** `VendorProfile`, `FactorySite`, `CapabilityStatement`, `CertificationEvidence`, `VendorReview`.

**Not responsible for:** External compliance certification, inspection final sign-off, actual factory output or buyer commercial contact CRM.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Factory legal/display name, site/contacts (local/private if real)
- Country/site process and product capability
- Declared monthly capacity with product basis and as-of date
- MOQ, lead time and compliance certificate reference
- Issuer, certification validity dates and documentary evidence
- Buyer onboarding checklist and reviewer
- Historical typed performance metrics with source/period
- Risk comments and review status

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Create vendor/site record from factual supplied information
2. Attach declared manufacturing categories and capacity claims
3. Record document/evidence and expiration alerts
4. Perform internal onboarding checklist without certifying vendor
5. Compare capability and historical performance snapshots
6. Export vendor profile and pending-document list

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Certificate expiration alerts from explicit issue/expiry dates
- Capability eligibility only when category, site and review evidence match
- Capacity is declared/reference, not guaranteed allocation
- Vendor performance metrics require defined periods and denominators

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- Do not invent BSCI/WRAP/ISO status or accreditation
- No auto-approved factory from a self-declaration
- Real names/contact data must not enter public fixtures or Git history
- No overwriting earlier compliance snapshots

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Factory/vendor profile
- Capability comparison
- Document expiry register
- Onboarding checklist
- Periodic performance dashboard

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Purchase Order may reference approved vendor ID
- Buyer CRM owns buyer contacts
- Production Tracker records actual production, not declared factory capacity

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/factory-vendor/
  index.html
  assets/factory-vendor.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/vendor-profile.js
  src/domain/certification-evidence.js
  src/domain/capability-matcher.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.factory-vendor.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Expired evidence does not claim compliant
- Factory site separation and duplicate vendor matching
- Declared vs verified capacity clearly labelled

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Approval criteria and evidence authority
- What site/product capacity means in each category
- Privacy retention and real-contact handling policy

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Vendor/site and declared capabilities.
- **Phase 2 - Controlled operational depth:** Certification/evidence expiry and onboarding review.
- **Phase 3 - Reporting and safe references:** Period-specific performance and capability comparison.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
