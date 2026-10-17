# APP-04: VESA Sampling & Approval 360 - Technical Blueprint

**Status:** DRAFT / PROPOSED, not implemented or published. **Priority:** 6/15. **Wave:** W2. **Complexity:** M. **Route proposal:** `/apps/sampling-approval/`. **Proposed Git branch:** `feature/sampling-approval-360`.

## 1. Owner, user and non-goals

**Canonical domain owner:** Submission rounds, sample schedules, comments, request-for-revision and explicit source-backed buyer/factory approvals.

**Typical users:** Sample coordinator, merchandiser, technical team.

**Own record types:** `SampleRequest`, `SampleRound`, `SubmissionRecord`, `ApprovalDecision`, `RevisionRequest`.

**Not responsible for:** Tech Pack measurement master, PPM release logic, TNA date engine or label artwork binary master.

### Source-of-truth rule
This application owns its specific records only. Any data from TNA, PPM, AQL, Costing, or another future app must enter through a clearly labelled, immutable **manual reference or explicit reviewed local saved-copy import**. Never read sibling app private localStorage/IndexedDB data directly; never silently update sibling decisions.

## 2. Functional fields and data requirements

- PO/style and linked tech-spec revision
- Sample category (fit/size-set/PP/lab dip/strike-off/etc): buyer-defined enum
- Submission date, required date and evidence references
- Sample colour/size/qty and physical sample ID
- Buyer comments, corrections and resubmission round
- Approver identity/date/authority source
- Decision: submitted/commented/approved/rejected/needs information
- Evidence receipt and optional local file reference

All fields must specify source/provenance and `Needs Information` whenever missing. Use durable IDs, revision, `asOf`/entered dates and explicit units/currency where applicable. Do not invent buyer rules, quotes, certifications or approved dates.

## 3. UI user journey (one shared VESA shell)

1. Register required sample category based on buyer plan
2. Create submission round and bind exact tech/artwork revision
3. Record dispatch/receipt and buyer comments
4. Record explicit approval or rejection with provenance
5. Request revised sample preserving previous decision
6. Export approval matrix and history for TNA/PPM reference

Menus remain **Home / File / Edit / View / Tools / Help**, supplied only by the existing VESA shared shell. Internal app sections should be inline/responsive, not a duplicate top menu. Provide New, Continue, Open Saved, Practice Example, Save Now, Download Saved Copy, Open Saved Copy, Prepare Report, Print/Save PDF and Help where relevant to this app.

## 4. Calculation, policy and state engine

- Approval status is only explicit, never inferred from elapsed time
- Current-effective approval points to latest documented compatible revision
- Overdue is calculated only when required date and chosen calendar basis exist
- Stale approvals become review-needed if linked source revision changes

These are planning formulas/guardrails, not approved buyer-specific commercial terms. Pure, deterministic core domain functions must be independently tested with explicit fixtures before UI integration.

## 5. Validation, evidence and immutable history

- No auto-approved sample; no factory-self-approval claimed as buyer approval
- Sample category applicability depends on approved buyer requirements
- Never overwrite earlier round/comments/evidence
- Draft or unverified approver cannot release PPM GO
- Unknown dates/authority remain pending

Saved records are versioned, browser-local, and must survive save/reload/reopen and portable-copy restore. Rejections must be atomic. Finalized/revised evidence must be retained as historical snapshots, not overwritten. Every report must label draft vs approved facts accurately.

## 6. Required output and reports

- Sample submission tracker
- Approval/comment sheet
- Revision and overdue list
- Approval evidence register
- Exportable reference snapshot for TNA/PPM

Report generation may use browser print/PDF and locally available permitted workbook libraries. Escape entered text; protect spreadsheet cells beginning with `=`, `+`, `-` or `@`; preserve value/unit/currency provenance. Never claim a generated report represents third-party certification, customs/bank release or buyer sign-off unless exact supporting evidence exists.

## 7. Cross-app contracts

- Tech Pack provides immutable spec-revision reference
- Label & Artwork provides artwork-revision reference
- TNA shows milestone reference, PPM checks evidence without auto-GO

Reference-only message shape: {`sourceApp`, `recordType`, `recordId`, `revisionId`, `sourceDate`, `verifiedBy`, `verifiedAt`, `displaySnapshot`}. Imported objects are local, bounded, reviewable, source-labelled and never remote-synced.

## 8. Application module blueprint

```text
apps/sampling-approval/
  index.html
  assets/sampling-approval.css
  src/bootstrap.js
  src/application/workspace-controller.js
  src/domain/submission-register.js
  src/domain/approval-provenance.js
  src/domain/revision-rules.js
  src/data/local-record-port.js
  src/data/saved-copy-codec.js
  src/reports/report-model.js
  src/i18n/app-copy.js
  tests/domain.test.cjs
  tests/save-reopen.test.cjs
  tests/browser-workflow.cjs
```

**Ownership and dependency direction:** UI/bootstrap -> application controller -> pure domain modules; application -> storage/report ports; infrastructure adapters implement ports. Domain must not import HTML, DOM, browser storage, or any sibling domain. App-specific records use a versioned key prefix `vesa.sampling-approval.records.v1` only after confirming no existing collisions. No service worker unless actual scoped offline/cache-recovery testing justifies it.

## 9. Verification and acceptance candidates

- Multiple rounds and stale-revision invalidation
- Missing approver keeps status pending
- Reject then resubmit never erases original rejection

Additional mandatory tests: malformed/oversize/corrupt restore leaves existing records untouched; print/Excel injection defenses; four languages (EN/BN/HI/TA) preserve entered values; 320/390/768/1280 responsive checks; keyboard focus/labels; reload/offline cache where implemented; zero hidden network requests; screenshot evidence captured by Codex automation without demanding user screenshots.

## 10. Open domain approvals / no-guess policy

- Buyer sample categories/approval authorities
- Relevant working calendar/time-window source
- Required evidence fields for valid approval

Until the responsible user supplies these requirements, keep the affected calculations/approvals **PENDING / Needs Information** and build all independent screens, validations and draft exports safely. Do not generate fabricated data to force a PASS.

## 11. Three application delivery phases

- **Phase 1 - Basic useful workflow:** Submission register and sample status history.
- **Phase 2 - Controlled operational depth:** Approval/rejection/revision rounds and evidence provenance.
- **Phase 3 - Reporting and safe references:** Linked Tech Pack/PPM/TNA references and exception reporting.

## 12. Build plan

- **M0 - audit/scope:** Inspect the latest repo branch and full feature files; freeze app owner and explicit file impact; verify the existing next-app starter.
- **M1 - data/domain:** Record types, pure calculations, validation, synthetic deterministic fixtures, safe legacy posture.
- **M2 - local workflow:** Shared UI adapter, four languages, local CRUD, controlled status, no hidden provider calls.
- **M3 - outputs/integration:** Bounded import/export, reports, reviewed reference snapshots, mobile/keyboard.
- **M4 - verification/handoff:** Focused tests, actual browser proof, sibling regression and release decision. No implicit `main` push.

**Do not modify TNA, PPM or AQL domain engines, frozen data contracts or other unrelated app logic while building this app.**