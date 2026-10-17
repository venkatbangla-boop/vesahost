# APP-03: VESA Tech Pack & Spec 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 3/15. **Wave:** W1. **Complexity:** L. **Route proposal:** `/apps/tech-pack-spec/`. **Proposed Git branch:** `feature/tech-pack-spec-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Versioned garment specification, POM definitions, size grading, tolerance, BOM references and change comparison.

**Typical users:** Product developer, technical merchandiser and factory technical team.

**Own record types:** `StyleSpecification`, `SizeChart`, `MeasurementPoint`, `GradingRule`, `ConstructionNote`, `SpecRevision`.

**Not responsible for:** Buyer sample approval decision, costing engine, production sign-off or laboratory accreditation.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- Style/fabric/season/gender/category identifiers and source reference
- Master base size, size range, POM code/description/location
- Actual body or garment measurements with unit cm/in, flat or circumference basis
- Size grade increments by POM and size transition
- Positive and negative tolerance independently defined
- Sketch/photo reference and revision source (local only)
- Construction, fabric, trims and packing instruction references
- Approver/revision/effective date as recorded evidence, not inferred

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Create spec from an explicit garment profile and source tech pack
2. Define size chart and measurement basis/units
3. Apply only approved per-POM size grading
4. Compare base, proposed and approved revisions
5. Generate measurement tolerance sheet and revision log
6. Export the exact values for factory review

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- target_size_value = explicitly_approved_base_value + sum(approved_grades_along_size_path)
- lower_bound = target - approved_minus_tolerance; upper_bound = target + approved_plus_tolerance
- Conversion between cm and inch must preserve specified precision and flat/circumference basis
- Compare revisions field-by-field, preserving previous approved snapshots

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No universal grading assumption or invented tolerance
- Do not infer flat-to-circumference unless POM basis explicitly defined
- Record unit conversions and rounding choices
- Duplicate POM IDs/sizes and missing source rejected
- Technical approval not equivalent to PP/sample approval
- Do not copy proprietary uploaded tech packs into public repository

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Measurement specification chart
- Grading sheet
- Tolerance matrix
- BOM/construction review
- Revision comparison
- Print/PDF/Excel spec

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Sampling & Approval records sample comments and external buyer decision
- Costing 360 uses verified BOM/measurement snapshot, not live internal reads
- Label & Artwork Approval references artwork or care-label spec revisions

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/tech-pack-spec/
  index.html
  assets/tech-pack-spec.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/pom-model.js
  src/domain/grading-engine.js
  src/domain/tolerance-policy.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.tech-pack-spec.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Asymmetric tolerance tests with approved data
- Roundtrip cm/in and flat/circumference boundary tests
- Revision comparison preserves approved baseline
- S-XXL and plus-size cases with explicit grades, no universal defaults

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Buyer-specific POM master and grading increments
- Accepted rounding/decimal display per unit
- Flat/circumference measurements and knit/stretch adjustment policy

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Versioned base-size measurement chart and POM.
- **Phase 2 - Controlled operational depth:** Authorized grading, tolerance and revision comparison.
- **Phase 3 - Reporting and safe references:** Multi-style templates and safe reviewed exports.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**
