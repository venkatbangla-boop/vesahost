# TNA 360 — Garment Merchandising Sheet Rework M0 Source Audit

**Date:** 2026-10-17; **status: M0 DRAFT/CONDITIONAL**, no new sheet has been implemented or verified yet. Controlling request is `docs/tna/GARMENT_MERCHANDISING_REWORK_QUEUE.md` (user priority, 2026-10-14). Controlling contracts: `AGENTS.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`, `docs/tna/06_EXECUTION_TRACKER.md` and the UAT package.

## Direct source audit and dependency/ownership map

| File inspected at latest `main` | Direct observations, owner/state boundaries and risk | Classification |
|---|---|---|
| `apps/tna/index.html` | One VESA shell, app-owned modular source scripts, CSS/query versions. Safe release entry point; do not duplicate top header. | WATCHED; later asset cache/version change only after proven UI patch |
| `apps/tna/src/bootstrap.js` | Current `render()` builds prominent hero/status and separate New/Save/Continue action cards and sections; `ensureWorkspaceShell()` supplies shared six menus. Contains an `Order master` summary and menu-specific TNA Planner/Timeline/Critical Path/Reports. Presentation/entry navigation only may be added without changing order schema. | UI OWNER; candidate in-scope after narrow function/handler audit |
| `apps/tna/assets/tna.css` | Current hero large 2.45–5rem, fixed-background visual and large cards; `tna-commandbar` has an adapted non-sticky override. Add merchandiser sheet/table styles with responsive scrolling, no second fixed toolbar. | UI STYLE OWNER; candidate in-scope |
| `apps/tna/src/domain.js` | Stable `TNA360-ORDERPLAN-1.1.0` owns buyer/PO/style fields, 100+ garment activities, LC/fit/PP/lab dip/fabric/trims/cut/sew/shipment and source-backed status/IDs. Any view must READ existing model, not guess missing rates or overwrite task dates. | FROZEN |
| `apps/tna/src/scheduling.js` | Working-calendar and critical-path calculations, civil date helpers and working-day semantics. Never reimplement CPM logic in a table presenter. | FROZEN |
| `apps/tna/src/storage.js` | `TNA360-STORAGE-0.5.0`, versioned browser-specific local records, portable migration, autosave/offline intent. Previous copies must remain compatible; no silent recovery/reset or new storage key. | FROZEN |
| `apps/tna/src/reports.js` | Typed report model with R01–R12 and source/no-fabrication/four-language report contracts. Native spreadsheet and print parity cannot be claimed without independent proof. | FROZEN initially; WATCHED |
| `apps/tna/tests/g11-garment-scenarios.test.js` | Knit, imported woven and denim/wash synthetic scenarios cover exact forecast/critical path; preservation required. | FROZEN baseline/test guard |
| `apps/tna/tests/g07-reports.test.js` | R01–R12, workbook sheets, language/report integration. Do not regress. | FROZEN baseline/test guard |

## Exact intended user-visible master sheet (draft requirement interpretation)

One familiar apparel sourcing **order header**: Buyer, Factory, PO/Order, Style, Garment/category, Fabric details/GSM, Color/Size and Qty, LC date/status, Ex-factory and Shipment, Comments. One full-width table with explicitly source-backed rows in common garment order: Order confirmation → Master LC/B2B LC → Fabric/Trims booking/arrival → Lab dip/Fit/PP approval → Knitting/Weaving → Dyeing/finishing → Cutting → Sewing → Packing → Inspection → Ex-factory → Shipment. Existing domain refs and applicability must drive rows; don't invent missing holidays/dates or buyer-specific approvals.

**Columns:** Section / Activity, Responsible party, Planned/Baseline, Forecast/Revised, Actual, Delay Days, Source/Approval state, Critical and Remarks. **Quick filters:** Overdue, Due This Week, Waiting Buyer, Waiting Local Office, Waiting Factory, On Track, Critical. Where original source lacks an approval authority or date, show `Needs Information`; no invented 60-day commitments for Mexico and Bangladesh. Never conflate deadline risk with computed critical path or buyer approval with local factory work completion.

## M1 bounded patch plan / pre-code gate

**Current verdict: CONDITIONAL — implementation NOT yet authorized by this audit alone.** Before editing, inspect the exact `bootstrap.js` view/menu event and task model construction ranges and existing UI/browser tests directly. Then lock a patch group: `apps/tna/src/bootstrap.js` (new, non-destructive sheet section and view command), `apps/tna/assets/tna.css` (table presentation), NEW focused synthetic `apps/tna/tests/g13-merchandising-sheet.cjs`, and this audit/tracker; `apps/tna/index.html` only if a verified cache version bump is necessary. All domain/calc/storage/report and sibling AQL/PPM files frozen. Do not use a new JS renderer without an approved class/state owner or import.

**Acceptance requires:** exact source ID→column mapping, baseline/revised/actual never overwritten, real domain scheduling remains owner of critical path, unreadable values as Needs Information, meaningful garment statuses, 320–1440px and EN/BN/HI/TA real Chromium, local saved-copy test, no duplicate shell, knit/woven/denim fixtures and every affected TNA/PPM/AQL test. User's 12 TNA human checklist rows remain `NOT TESTED`; no automated screenshot can change their status. Rollback revert only new presenter/style/tests; original plans and previous public route unchanged.

**Precise next action:** inspect exact state/menu/task and mock data flows inside `bootstrap.js` to complete M1 patch scope/placement before code; implement only after the new baseline is confirmed in GitHub and independent tests are available.
