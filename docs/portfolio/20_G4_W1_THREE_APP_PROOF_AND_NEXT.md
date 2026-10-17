# VESA 360 G4-W1 — First Three Real Workflow Discovery Releases

**Date:** 2026-10-18. **Source of truth:** GitHub `main` exact runtime SHA `405143c6da61134313af90dfa26e069f7a05a779`. Owner's scope: authenticated Login → App Centre → 19 apps. Public vesaent.com/ homepage files, corporate imagery, legal/SEO and root index.html **not modified**.

## Objective

Make existing business-domain functionality obvious and usable on desktop/mobile instead of a generic blank home screen. This is incremental professional usability engineering, **not** a claim all 19 apps are feature-complete. Original finance, production, quality and garment master data owners remain frozen. Use fictional examples only. All human UAT rows remain **1 PASS / 0 FAIL / 48 NOT TESTED**. No new externally approved business rules were invented.

## G4-W1-A — APP-01 Packing & Container

- Original eight hidden functional tabs: Summary, PO Quantities, Carton Specifications, Packing Configurations, Container Scenarios, Loading Reconciliation, Reports, Revision History.
- Home now provides eight legible practice-only deep links, 44px+ controls, desktop grid and mobile layout. One tap opens actual underlying panel; generated practice is never saved as real shipment evidence. Existing New/Continue/Open Saved/Save/Open/Report/PDF/XLSX remain. A long redundant notice became an accessible local-data disclosure.
- Frozen: `PackingMath`, `PackingStore`, `PackingReport`, CBM/loading checks, original lot/cargo signoffs and saved schema.
- Implemented `apps/packing-container/index.html`, one app-owned test and scoped root cache version update `vesa-v89-packing-workflow`. Source-level audit `docs/portfolio/17_PACKING_HOME_DISCOVERY_AUDIT.md`.
- Proved [feature CI #39064998221 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39064998221); [main CI #39065169029 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39065169029); [Pages #39065168246 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39065168246). Main SHA `d3683c85a0f9de92fa60d3e467e6bb6e7839d5bd`.
- Real screenshots checked for 320, 390 and 1440px; 24 stage transitions, Tamil, print, existing Packing/Commission/Platform regressions PASS.

## G4-W1-B — APP-02 Order & Commission

- Existing ten sections hidden before New/Practice: Summary, Agreement, PO/FOB, Exclusions, Earned Evidence, Invoices, Receipts, Deductions, Revisions and Reports.
- Home now has three subject-specific grouped **finance lifecycle lanes** with ten live deep links into the original synthetic commission fixture. EN/BN/HI/TA, desktop and touch screens. Saved records remain unaffected; no financial approval/settlement claim. Long duplicate warning remains available as a small disclosure.
- Frozen: rate, earned/invoiced/received/credit math, explicit commission/FX source policy, original immutable agreement revisions, XLSX/PDF, saved-copy schema.
- Code `apps/order-commission/index.html`, isolated test, scoped root cache `vesa-v90-commission-workbench`. Audit `docs/portfolio/18_COMMISSION_G4_WORKBENCH_AUDIT.md`.
- [Feature CI #39065541565 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39065541565), [main CI #39065702246 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39065702246), [Pages #39065701389 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39065701389). Main SHA `09c96ff5f59e43512dcb0b429623a37062592d0a`.
- Real screenshots inspected at 320/390/1440px; 30 stage clicks, four languages, old record/copy safety, PDF/XLSX and Packing/shell regressions PASS.

## G4-W1-C — APP-03 Tech Pack & Spec

- Existing six panels: Summary, Measurement Points, Size Grading, BOM & Construction, Revisions, Reports.
- Home now displays a **source-calculated fictional garment size chart**, directly invoking `GarmentSpecEngine.practice()` and `GarmentSpecEngine.project()`. The sample CHEST width flat/cm results are S `48.00`, M `50.00`, L `52.00`, derived from original fictional source-reviewed ±2cm fixture, **not a default buyer grade**. Six touch-sized buttons open the corresponding original practice panels.
- Frozen: fixed-decimal grade path and tolerances, flat/circumference source gating, POM IDs, report workbook/PDF, revision snapshots, saved-copy format. Fully reversible UI-only patch plus root cache refresh `vesa-v91-techpack-sizechart`. Audit `docs/portfolio/19_TECHPACK_G4_SIZECHART_AUDIT.md`.
- First candidate failed for duplicate local JS `projection` variable in newly inserted UI; source renamed only the preview variable, preserving original editor domain. Passing correction: [feature CI #39066029574 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39066029574), [main CI #39066179944 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39066179944), [Pages #39066179493 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39066179493). Main SHA `405143c6da61134313af90dfa26e069f7a05a779`.
- Real screenshot reviewed at 320/390/1440px, 18 panel transitions, EN/BN/HI/TA, immutable synthetic storage, original APP-03 domain & PDF/XLSX/browser plus APP-01/02, PPM/TNA/AQL sibling checks all PASS.

## Cross-app proof and risks

Original 15 app blueprints and SHA-256 integrity pass. Login, App Centre, Admin and other app routes remained unchanged. Root service-worker CACHE **namespace only** was advanced at each accepted release; no public homepage HTML/CSS/JS change. New UI is discoverability, not an additional shipping/container formula, guessed money rate, buyer-approved size grades or a secure backend. Existing source-dependent approvals from `docs/portfolio/10_OPEN_DECISIONS_REGISTER.md` remain pending. Human testers did not sign off these screens.

**Rollback:** each independently tested stage is one historical GitHub SHA and localized app-owned HTML delta plus cache version. Revert only the corresponding app/worker delta after compatibility review; never mutate stored financial or garment data.

## Exactly what remains and next action

- G4-W1 **Costing 360**: already contains a mature seven-sheet workbook, sourced no-margin engine, PDF/print and cross-app compatibility with a real Python Chromium end-to-end test. **Audit opened desktop/mobile UI and report readability before adding any feature**; do not rewrite its existing calculations, invent supplier rates or reconstruct a single-file app. Then return to APP-13 Purchase Order.
- G4-W2: Purchase Order, LC, Sampling & Approval, Fabric & Trims; deeper PO/LC source-backed exception journeys and explicit references.
- G4-W3: Production, Shipment & Documentation, Factory & Vendor, Label & Artwork.
- G4-W4: Buyer CRM, Fabric Supplier Comparison, Claims & Disputes, Product Development.
- G5: real interaction on all 19 pages/controls/dialogs/save+open, six responsive widths, performance/offline, EN/BN/HI/TA, PDF/XLSX correctness, with human acceptance recorded separately.
- AQL 11.78MB script is 90.94% embedded media URLs; cold-load profiler results at `docs/ux/03_AQL_G3_MOBILE_LOAD_PROFILE.md`. Any extraction or optimization is conditional on report/offline/asset-use mapping, never blind strip.
- Never touch public website homepage, original blueprints or immutable baseline business rules.

**When user writes `Continue`:** read this file, actual latest GitHub main + CI, `VESA_PROGRESS.md` and `VESA_RESUME_PROMPT.md`. Next = Costing opened-screen UX/depth audit; only modify an exact proven owned file after audit and test. Do not restart completed G3, Packing, Commission or TechPack improvements. No ZIP reupload needed.
