# APP-15: VESA Product Development 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 15/15. **Wave:** W4. **Complexity:** M. **Route proposal:** `/apps/product-development/`. **Proposed Git branch:** `feature/product-development-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Style concepts, seasonal capsules, design boards, colourways, material direction and proposal-stage revision history.

**Typical users:** Fashion/product developer, sourcing office and merchandising team.

**Own record types:** `ProductConcept`, `DevelopmentBoard`, `ColourwayProposal`, `DesignRevision`, `ConceptDecision`.

**Not responsible for:** Final technical measurements, approved sample decisions, live buyer quotation price or original artwork compliance approval.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Concept name, category, season and intended market
- Inspiration/style/image references kept local with rights noted
- Proposed colourways, silhouettes and materials
- Optional Pantone/colour reference when user supplied
- Requested fit/technical/sampling tasks
- Concept version, presentation notes and review outcome

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Create draft development concept
2. Add colourway/material and style reference cards
3. Assemble one/multiple proposal boards
4. Record proposed revisions and buyer comments
5. Promote selected concept to an explicitly linked Tech Pack draft
6. Export presentation-ready boards without implying order approval

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Concept status and revision only; no automatic production/commercial calculation
- Linked spec/quote references are reviewed snapshots
- Product image placement and aspect constraints follow user-provided assets and permissions

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- Do not treat moodboard as final tech pack
- Never copy private buyer artwork publicly
- No invented Pantone, MOQ, price or bulk approval
- Local image-size budget/format validation

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Style development board
- Colourway matrix
- Collection line sheet
- Concept revision comparison
- Buyer proposal presentation/PDF

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Tech Pack owns measurements and spec revisions
- Label & Artwork owns production print assets and label approvals
- Costing and Buyer CRM references only after source data exists

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/product-development/
  index.html
  assets/product-development.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/concept-register.js
  src/domain/board-layout.js
  src/domain/revision-history.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.product-development.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Proposal stays draft until explicit decision
- Revision history and original reference images preserved
- Synthetic demo images only for public fixtures

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Approved image/material sources and licenses
- Required board templates and artwork dimensions
- Concept-to-techpack promotion criteria

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Concept registry, colourway/style cards.
- **Phase 2 - Controlled operational depth:** Board layouts with local media/revision records.
- **Phase 3 - Reporting and safe references:** Concept selection and explicit Tech Pack promotion.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**