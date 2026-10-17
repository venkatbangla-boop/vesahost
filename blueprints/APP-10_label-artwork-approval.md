# APP-10: VESA Label & Artwork Approval 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 11/15. **Wave:** W3. **Complexity:** M. **Route proposal:** `/apps/label-artwork-approval/`. **Proposed Git branch:** `feature/label-artwork-approval-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Controlled versions and review state for product labels, care/size labels, barcode artwork, print and embroidery files.

**Typical users:** Product developer, artwork coordinator and technical merchandiser.

**Own record types:** `ArtworkItem`, `ArtworkRevision`, `LabelSpecification`, `ReviewComment`, `ArtworkDecision`.

**Not responsible for:** Tech Pack full garment spec, regulatory labeling authority, buyer sample approvals or actual barcode scanner verification.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Style/colour/size, artwork type and target placement
- Artwork/document local file or references with size bounds
- Artwork dimensions, units, print method and colour references
- Barcode/GTIN number typed with evidence (do not allocate GS1 numbers)
- Wash care and fiber/country text from approved sources
- Revision date, submission, comments and evidence
- Reviewer/decision authority and effective version

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Create artwork/label item and its precise source spec
2. Attach revision with placement/dimensions and identity
3. Render safe offline preview from selected local file
4. Track comments/approval/rejection per revision
5. Compare versions while preserving original binary/source reference
6. Export controlled label/artwork review sheet

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Dimensions/units validation and repeat-size calculation only when specified
- Barcode checksum validation for given symbology, not ownership issuance
- Effective version requires explicit matching reviewer evidence
- Changing artwork revision invalidates dependent review status

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No auto buyer approval from internal inspection or file upload
- No assumption regulatory wash-care correctness
- Never issue live GS1 IDs or certify barcode scan
- Sanitize preview metadata; enforce file size/content types
- Keep public repo free of buyer artwork and copyrighted files

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Artwork/label specification sheet
- Version comparison
- Approval comments register
- Barcode validation summary
- Print/PDF approval draft

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Tech Pack owns spec measurement references
- Sampling & Approval owns combined PP/sample buyer approval
- AQL barcode comparison is inspection evidence only

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/label-artwork-approval/
  index.html
  assets/label-artwork-approval.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/artwork-revision.js
  src/domain/label-spec.js
  src/domain/review-state.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.label-artwork-approval.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Old revision remains unchanged after new version
- Invalid barcode/checksum shown as warning, not silently corrected
- Changed artwork forces explicit re-review

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Approved care-label content/regional rules
- Allowed artwork file types/size and retention
- Who can approve which category

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Artwork/label revision records and safe preview.
- **Phase 2 - Controlled operational depth:** Reviewed comments, checksum and approval provenance.
- **Phase 3 - Reporting and safe references:** Version comparison and controlled print/review outputs.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
