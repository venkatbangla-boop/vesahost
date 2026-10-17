# APP-11: VESA Buyer CRM 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 12/15. **Wave:** W4. **Complexity:** M. **Route proposal:** `/apps/buyer-crm/`. **Proposed Git branch:** `feature/buyer-crm-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Buyer organization profiles, contacts, enquiry/opportunity stages and owner-controlled follow-up activities.

**Typical users:** Sourcing/trading office and business development.

**Own record types:** `BuyerOrganization`, `ContactRecord`, `Enquiry`, `Opportunity`, `FollowUpTask`.

**Not responsible for:** Commercial quotation calculations, buyer PO master, external email delivery or remote shared contacts service.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Buyer organization name and territory
- Contact and role (only local/private when real)
- Enquiry category, style request and quantity as typed
- Opportunity stage, estimated value/currency as sourced
- Last interaction, planned follow-up and outcome
- Attachments/notes as limited local references
- Consent or privacy handling notes where applicable

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Add organization and contacts locally
2. Record enquiry and linked product request
3. Assign opportunity stage and review date
4. Create on-screen follow-up reminders
5. Attach quotation/PO reference when verified
6. Export pipeline and action summary

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Time-to-follow-up from explicit due dates
- Pipeline value only from verified entered values; stages never invent probability
- Deduplicate organization/contact using cautious human review, not silent merge

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No automated email/SMS scraping or marketing provider
- Do not publish personal contact data in GitHub fixtures
- No automatic conversion of enquiry to confirmed order
- Keep browser-only confidentiality limits explicit

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Buyer profile
- Enquiry register
- Opportunity pipeline
- Upcoming follow-ups
- Buyer product-interest summary

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Product Development owns proposal board
- Costing owns commercial quotation values
- Purchase Order owns confirmed order documents

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/buyer-crm/
  index.html
  assets/buyer-crm.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/buyer-directory.js
  src/domain/opportunity-state.js
  src/domain/followup-scheduler.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.buyer-crm.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- No hidden network requests
- Duplicate contacts flagged not silently merged
- Changing opportunity stage does not create PO

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Consent/contact-retention basis for real records
- Pipeline stage definitions
- Follow-up owner/date convention

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Local buyer directory with privacy guard.
- **Phase 2 - Controlled operational depth:** Enquiry/opportunity stages and follow-up dates.
- **Phase 3 - Reporting and safe references:** Pipeline report and explicit proposal/PO references.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**