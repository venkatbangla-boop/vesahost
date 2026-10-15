# TNA 360 — Garment-Merchandising Rework Request

**Priority (user directive, 2026-10-14):** **NEXT AFTER COSTING 360** — ahead of Packing & Container 360 and the additional app portfolio. User rejects the current TNA front end as unnatural, technical and unlike a textile/apparel merchandiser's actual Time & Action / Critical Path sheet.

**Scope:** Rework **TNA presentation, entry flows, terminology, forms, tracking and reporting** to reflect everyday Bangladesh garment sourcing, factory, local office and buyer follow-up. Keep the existing source-backed date logic, schema migrations and reliable scheduling/CPM functions until compared against real merchandising cases. This is a change request, **not implementation, completion, approval, or verified UAT**.

## What a garment merchandiser should see

- One familiar TNA master sheet/card view: Buyer, Factory, Order/PO No, Style No, Garment, Fabric Details, GSM, Color/Size, Order Qty, LC Date/Status, Ex-Factory, Shipment and Remarks.
- Editable activity rows in realistic order: order confirmation, master LC / B2B LC, fabric + trims booking and arrival, lab dip, fit sample, PP sample, buyer/local approval, knitting/weaving, dyeing/finishing, cutting, sewing, finishing/packing, inspection, ex-factory and handover/shipment. Knit/woven applicability is explicit.
- Columns: Section/Activity, Responsible Party, Planned Date, Revised/Forecast Date, Actual Date, Days Delay, Status, Approval/Source, Remarks. Original confirmed target never silently overwritten.
- At-a-glance actions: Overdue, Due This Week, Waiting Buyer, Waiting Local Office, Waiting Factory, On Track, Critical Activities, Recovery Decision. Plain factory terms; no software-engineering jargon or decorative sci-fi dashboards.
- Critical Path should reflect real dependencies and dates; separate calculated critical status from user-entered urgency; show why the deadline is affected. If dates/lead times/approvals are missing, show Needs Information, not invented dates.
- Printable/shareable garment TNA sheet, Excel import/export compatible with a normal merchandiser workbook, simple Save/Open/Copy, mobile use and shared VESA UI/languages.
- Local Bangladesh office-approval vs Mexico buyer-approval authority must be explicit for lead-time promises. Never claim an automatic 60-day schedule unless source dates and approvals support it.

## Rework execution and acceptance

1. After Costing release, inspect actual `apps/tna/` source, existing domain/CPM specs, fixtures, data migrations and existing TNA reports.
2. Compare current interface to one realistic knit order and one woven order, with real-world merchandising field/row expectations (synthetic fixtures only). If original field order or example sheet is missing, document the gap, do not guess buyer-specific rules.
3. Define a compact garment TNA UI contract and obtain objective field/column/workflow acceptance before changing business logic.
4. Apply independent reversible UI changes while preserving source-backed calculators, baseline/current/forecast/actual, dependencies, historical records, and PPM/AQL integrations.
5. Prove: genuine garment merchandiser usability; sample/date/LC/material activities; critical path correctness; owner and approval status; Excel sheet and print parity; browser save/open; EN/BN/HI/TA; unified VESA shell; regression tests.
6. Mark `TNA REWORK DEMO LIVE` only after public route/version verification, user acceptance where necessary, and honest outstanding gaps.

**Priority queue:** (1) Complete Costing 360, (2) TNA 360 Garment Merchandising Rework, (3) Packing & Container 360, (4) Order & Commission 360, then remaining approved roadmap.

**Current status:** **QUEUED / NOT STARTED**. No TNA source changes authorized by this tracker alone.


## GitHub Work source audit checkpoint — 2026-10-15 (CONDITIONAL)

- **Branch:** `feature/tna-merchandising-rework`, created from `main`. Source inspected through connected GitHub; cloud/local checkout and runnable browser tests were not available in this session. **Policy reviewed; implementation files directly inspected** (bootstrap, domain, scheduling and storage). No feature implementation or PASS is asserted by this audit.
- **Observed gap:** `apps/tna/src/bootstrap.js` renders a calculation-oriented dashboard first; `workspacePanel()` defaults to timeline, caps visible workspace rows at 24 and Gantt rows at 10; `planPanel()` places the editable list after scheduling, readiness, alerts, scenarios and shipments and labels it "First activities", showing just the first 12. That diverges from the approved familiar master-sheet-first merchandising request. Source-backed data and reporting paths must be preserved.
- **File ownership:** `bootstrap.js` owns TNA presentation, event wiring, view/filter state; `domain.js` owns garment activity templates and immutable plan validation; `scheduling.js` owns CPM/calendar dates; `storage.js` owns local records, migrations, copies and workbook conversion. The first patch must affect presentation only, **not** the three latter owners or shared platform assets.
- **First narrow patch group (not yet implemented):** Make the full activity follow-up sheet the primary workspace view, with scroll/pagination or filter access to every editable activity, clear column headers and truthful unknown-date statuses. Retain the existing timeline, Gantt and filters as optional views. Do not compute delays, approval authority or critical status from absent inputs. Preserve the current `data-edit-task` controls and storage format.
- **In scope for first implementation:** `apps/tna/src/bootstrap.js`, only necessary TNA-specific CSS, and dedicated TNA browser/contract tests after direct inspection. **Frozen:** `domain.js`, `scheduling.js`, `storage.js`, PPM/AQL engines, app catalogue, VESA shared shell, records and production routes.
- **Verification gate:** Actual browser checks for complete activity accessibility and edit action, two synthetic knit/woven workflows, missing-date behavior, 390/1280 responsive views, four languages, saved-copy reopen, CPM invariants and relevant TNA/PPM/AQL regressions. No such new tests were executed at this documentation checkpoint.
- **Rollback:** revert the first UI-only commit if any of those proofs fails. No schema or storage migration is authorized.
- **Verdict:** CONDITIONAL — source-level audit completed, not a rework acceptance or deployment.
- **NEXT ACTION:** inspect entire TNA source/style/test entrypoints on this branch, implement the smallest master-sheet-first UI slice in `bootstrap.js` and TNA CSS, run real browser/regression tests, then update this ledger and `VESA_PROGRESS.md` with exact SHA and evidence. Next portfolio app remains Packing & Container 360.
