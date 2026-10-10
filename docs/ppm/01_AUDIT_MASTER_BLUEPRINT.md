# 01 — PPM 360 Audit, Product Blueprint & Coverage Register

**Product:** VESA Enterprise Inc. — Universal Apparel Pre-Production Meeting 360. **Repo:** `venkatbangla-boop/vesahost`, `main` observed 2026-10-10. **Route:** `/apps/ppm/`. **Document state:** `draft-only` implementation blueprint; NO code modified by this handover. **User objective:** AQL, PPM and TNA share one clean, obvious VESA interface; improve PPM without breaking what already works.

## Evidence read directly from GitHub
- `apps/ppm/index.html` (272,655 bytes): current logo/head, app-specific header, dashboard, section navigation, inline base CSS, script wiring.
- `apps/ppm/workspace.js` (~45.8 KB): `V5Workspace` creates `#fileMenu` (`HOME/FILE/EDIT/VIEW/TOOLS/HELP`) after the app topbar; owns home, autosave queue, menus, language, finalized-record protection, update workflow.
- `apps/ppm/workspace.css` (~9.4 KB): sticky `#fileMenu` offset by auth/header; narrow-width rule resets top to `0`; home and section layouts.
- `apps/ppm/core.js` (~98 KB): 168 checkpoint definitions in `SECTION_SCHEMA`, 18+ category/profile options, `RelevanceEngine`, `CoverageEngine`, `ValidationEngine`, `PpmRepository`, `FormRenderer`, `AppController`, signatures/evidence and report builders.
- `apps/ppm/planning-services.js`, `planning-panel.js`: `ApprovalRegister`, `MeasurementCheck`, `ChangeReviewEngine`, `PlanningService`, `MeetingControls`.
- `apps/ppm/record-services.js`: versioned `BackupCodec`, `RecordHistory`, `RecoveryRepository`; strict PPM import and local recovery.
- `apps/ppm/report-service.js`, `languages.js`, `service-worker.js`, tests `regression.cjs`, `planning.cjs`, `update.cjs`.
- Shared `js/auth.js`, `js/preferences.js`, `js/app-catalogue.js`, `apps/index.html`, `css/style.css`, root `UI_CONSISTENCY.md`, `APP_CENTRE_AUTH_STATUS.md`, `GAP_MATRIX.md`.
- `UI_CONSISTENCY.md` confirms prior cosmetic unification; app shells remain structurally different. Code audit ≠ a fresh live-browser screenshot test. HTTPS live pages were not accessible to this handover environment; VS Code Codex must run browser tests locally.

## Findings and audit verdict
| ID | Evidence / risk | Redesign response | Priority |
|---|---|---|---|
| P-A01 | PPM injects `#fileMenu` after its own topbar; AQL injects `#aqlReleaseMenu` into a different shell | One shared VESA command bar component with identical menu order | Critical |
| P-A02 | PPM has topbar + dashboard + section-nav + sticky menu, and mobile offsets change | Max one sticky navigation region; normal document flow for summary/section navigation; scroll/overlap tests | Critical |
| P-A03 | PPM owns local theme/language mapping; shared `VesaPrefs` also exists | Centralize chrome preference behavior without rewriting translated checkpoint identifiers or user fields | High |
| P-A04 | Deep checkpoint / release logic is already implemented | Frozen checkpoint + decisions golden tests; improve explainability instead of rewriting semantics | Critical |
| P-A05 | Backup, recovery and update mechanics support stored customer records | Data compatibility and offline upgrade tests BEFORE any refactor | Critical |
| P-A06 | Multiple small UI controls and technical terms may overwhelm novices | Progressive disclosure, simple status/copy, guide text, clear next action | High |
| P-A07 | Static client-side auth cannot securely isolate buyer/factory data across companies | Do not claim server authorization; design actual secured backend separately | Critical |
| P-A08 | Cross-app PPM/AQL/TNA data transfer unverified | Record-reference mapping with explicit consent; do not auto-release from another app | High |

**Gate verdict: `draft-only` for implementation.** Actual VS Code checkout, branch, repository HEAD, local baseline tests, browser captures and patch approval must be recorded at G00. The current code was directly inspected via GitHub; no live UI screenshot parity is claimed.

## User roles
Factory merchandiser, production supervisor, technician/pattern master, fabric and trims supplier/QC, buyer/brand, buying agent, quality manager, factory management and auditor. Same authenticated VESA app family; PPM may show role-sensitive details only when actual authorization is available. Otherwise one honest local/offline user scope.

## End-to-end PPM workflow
Choose New / Continue / Open Saved / Practice / Open Saved Copy → capture order + buyer rules → choose product profile and applicable processes → load current tech pack/BOM/spec revisions → meeting attendance → review dynamic 168-core checkpoint library and custom additions → record evidence, approval names, measurements, concerns and owners → assess GO / CONDITIONAL GO / HOLD via EXISTING domain rules → acknowledge changed scope and collect fresh signatures → finalize/read-only snapshot → prepare buyer/factory/action reports → portable backup/reopen → revision and reopened controlled session without falsifying prior signoff.

## Full functional register (all IDs must be assessed, not automatically called missing)
`PRESERVE` means prove existing parity; `IMPROVE` means implement when tests/approval allow; `FUTURE-SERVER` means genuine external backend gating.

### Order and setup
- [ ] P01 `PRESERVE` Buyer, factory, style, PO, delivery date, destination, quantity, sizes and colours identity.
- [ ] P02 `IMPROVE` Fast/Full meeting modes with equal persisted results and simple terminology.
- [ ] P03 `PRESERVE` Knit, woven, denim, sweater, activewear, kidswear, outerwear, uniform, custom profiles.
- [ ] P04 `PRESERVE` Process applicability: print, embroidery, transfers, washes, bonding, fusing, seam seal, coating, etc.
- [ ] P05 `PRESERVE` Tech pack, sample, measurement and BOM revisions; stale reference highlighting.
- [ ] P06 `IMPROVE` Meeting agenda, participant list, responsibility assignment and meeting time.
- [ ] P07 `IMPROVE` Guided preflight: what must be available before PPM starts.
- [ ] P08 `IMPROVE` Buyer/market compliance references as inputs, never hard-coded universal acceptance.

### Core technical and production readiness
- [ ] P09 `PRESERVE` All 168 existing checkpoint IDs, wording and critical/applicability values.
- [ ] P10 `PRESERVE` Relevance/cutoff decisions by profile and selected process.
- [ ] P11 `PRESERVE` Technical construction, fit, pattern, grading, measurement, seam allowances.
- [ ] P12 `PRESERVE` Fabric, yarn, shade, quantity, width, weight, testing and in-house status.
- [ ] P13 `PRESERVE` Trims, labels, print/embroidery/wash, packing/artwork readiness.
- [ ] P14 `PRESERVE` Machine/line readiness, pilot sample/first output, production capacity inputs.
- [ ] P15 `IMPROVE` Buyer/factory/local office delegated approval authority notes.
- [ ] P16 `IMPROVE` Critical blocker summaries by owner, due date and evidence.
- [ ] P17 `IMPROVE` Extra/custom checkpoint authoring with stable IDs and scope.
- [ ] P18 `IMPROVE` Section guidance and context-specific beginner help.

### Approval, measurements, actions and decision
- [ ] P19 `PRESERVE` Approval register with required flags, status, approver, date, proof/ref.
- [ ] P20 `PRESERVE` POM comparison for explicit unit, spec, tolerance, actual and asymmetric ±.
- [ ] P21 `PRESERVE` Numeric invalid/absent inputs never silently pass.
- [ ] P22 `PRESERVE` GO / CONDITIONAL GO / HOLD validation and explicit release authority.
- [ ] P23 `PRESERVE` Signature capture, attendee names/dates, signoff read-only lock.
- [ ] P24 `PRESERVE` Scope/revision comparison; material changes clear old signatures/release.
- [ ] P25 `PRESERVE` Action tracker owner/date/status/evidence and closed item criteria.
- [ ] P26 `IMPROVE` Explain each blocker in everyday terms and show next action.
- [ ] P27 `IMPROVE` Exception/waiver register requiring explicit responsible authority and evidence.
- [ ] P28 `IMPROVE` Changed agreement / re-open meeting without overwriting prior decision history.
- [ ] P29 `IMPROVE` Optional meeting minutes and downloadable action ownership summary.

### Evidence, usability, saving and reports
- [ ] P30 `PRESERVE` Photos and proof refs linked to relevant checkpoint/approval.
- [ ] P31 `PRESERVE` No corrupted image restore or stale signature image race.
- [ ] P32 `PRESERVE` Local autosave / Save Now / multi-record reopen.
- [ ] P33 `PRESERVE` Download Saved Copy / Open Saved Copy / Make Another Copy.
- [ ] P34 `PRESERVE` V4/V5 data compatibility, schema 1/2 and strict import boundaries.
- [ ] P35 `PRESERVE` Offline coherent service worker update; never erase customer records.
- [ ] P36 `IMPROVE` Recent records, search and filters, last-saved badge.
- [ ] P37 `IMPROVE` New/Continue/Open Saved/Practice home parity with AQL/TNA.
- [ ] P38 `IMPROVE` VESA shared header and one logical nav bar; same across apps.
- [ ] P39 `IMPROVE` Mobile 320/360/390/768 and desktop 1280+ UI reflow.
- [ ] P40 `IMPROVE` No duplicate frozen menu/section/dashboard toolbars.
- [ ] P41 `IMPROVE` Everyday labels, no raw file format/database/error terms in normal UI.
- [ ] P42 `PRESERVE` English/Bengali/Hindi/Tamil explanatory localization without editing user input.
- [ ] P43 `PRESERVE` Existing full, release, action and planning report semantics.
- [ ] P44 `IMPROVE` Buyer summary, factory action report, print/PDF layout and Excel if feasible.
- [ ] P45 `IMPROVE` Report print break, logo/watermark, labels, provenance, version.
- [ ] P46 `IMPROVE` Error/recovery instructions and safe fallback when browser storage fails.

### Integrations and management
- [ ] P47 `IMPROVE` Traceable TNA milestone link without rewriting another app's dates.
- [ ] P48 `IMPROVE` Traceable AQL inspection/quality reference without auto approving production.
- [ ] P49 `FUTURE-SERVER` Authenticated buyer/factory/agent roles and per-tenant authorization.
- [ ] P50 `FUTURE-SERVER` Central shared records, conflicts, approvals, audit, notifications.
- [ ] P51 `IMPROVE` App Centre links and resume session flow consistent across all three apps.
- [ ] P52 `IMPROVE` Independent performance/accessibility/visual regression evidence.

## Scope, non-goals and priority
Immediate business result: one understandable PPM with all existing core behavior intact. Priority 1: frozen baseline + uniform UI + data safety. Priority 2: controlled workflows, readable blockers and better reports. Priority 3: verified app references and secure collaboration only after external provider setup. Do NOT quietly change sample approval thresholds, machine/market rules, buyer manuals, numerical tolerances, or release policy; submit a separate tested requirement and versioned migration proposal.
