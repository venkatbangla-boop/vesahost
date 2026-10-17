# APP-12 Fabric & Supplier Comparison 360 — Execution Tracker

## 2026-10-17 — M0 SOURCE-OF-TRUTH AND FILE-LEVEL AUDIT, M1 SCOPE LOCK

**Baseline:** `main` `0df3c2d0ba5ad34c921b01c3b01772b8ef67f4e2`, immediately after the independently verified APP-11 Buyer CRM personal-demo publication. Exact original `blueprints/APP-12_fabric-supplier-comparison.md` is already permanently committed in repo (priority 13/15, W4) with source-preserved 15-app integrity manifest; never ask user to upload ZIP again. No pre-existing feature branch/folder `apps/fabric-supplier-comparison/`, no code search result for `vesa.fabric-supplier-comparison.records.v1`. Created `feature/fabric-supplier-comparison-360` from latest main; no previous apps restarted.

**Repository policy consulted:** `AGENTS.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`, original APP-12 blueprint, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`. Existing related live source directly inspected: `apps/fabric-trims/src/domain/material-engine.js` and `tests/domain.test.cjs`, `apps/factory-vendor/src/domain/capability-matcher.js`, `apps/costing/index.html`, `templates/vesa-next-app/README.md`. Nothing in the existing system approves guessing garment FOB, duty, FX, physical inventory or supplier certification.

### File-level ownership, dependency, lifecycle and risk map

| Exact file | Current owner / entering & leaving calls, data and scope |
|---|---|
| `blueprints/APP-12_fabric-supplier-comparison.md` + `docs/portfolio/*` | Original requirements and ownership matrix, read-only **FROZEN**; M1 cannot change. |
| `apps/fabric-trims/src/domain/material-engine.js` | Owns real BOM, booked/received QA lots/stock, sourced conversions. Comparison may later accept only user-reviewed immutable snapshot, no direct import/cross-write. **FROZEN**. |
| `apps/costing/index.html` | Owns final garment cost/margin/FOB and its source FX. APP-12 must never overwrite or calculate commercial FOB. **FROZEN**. |
| `apps/factory-vendor/src/domain/capability-matcher.js` | Owns sourced vendor/site claims, not actual certification. APP-12 quote evaluation does not establish compliance. **FROZEN**. |
| `js/auth.js`, `js/vesa-workspace-shell.js`, `css/vesa-workspace.css`, `templates/vesa-next-app/*` | Only future shared navigation/bootstrap references. **WATCHED** unchanged M1. |
| `apps/fabric-supplier-comparison/src/domain/quote-normalization.js` | **NEW M1** pure canonical sourced material requirement and dated per-unit quote record with exact arbitrary-decimal arithmetic and explicit documented conversions. No DOM/local storage/remote FX. |
| `apps/fabric-supplier-comparison/src/domain/comparability-gate.js` | **NEW M1** pure exact spec equivalence on composition/GSM/width+unit/construction/shrinkage basis, quotation validity, MOQ/lead/term match. Null/noncomparable blocks rankings. |
| `apps/fabric-supplier-comparison/src/domain/landed-scenario.js` | **NEW M1** pure source-charged per-unit landed input scenario (freight, duty, tax, LC components), documented FX with explicit date and rounding. No automatic vendor purchase or taxes/duty assumption. |
| `apps/fabric-supplier-comparison/tests/domain.test.cjs` | **NEW M1** 100% synthetic normal and negative cases: no imaginary FX/conversion/charges, invalid/expired quote, incomparable fabric, explicit amount math, append-only revisions, no vendor approval. |
| `.github/workflows/fabric-supplier-comparison.yml` | **NEW M1** feature-only Node + original 15-blueprint manifest + all existing app regressions, no public release. |
| `docs/fabric-supplier-comparison/01_EXECUTION_TRACKER.md` | This durable approved M0/M1 record and exact verified CI NEXT action. |

**Architecture/record flow:** future shared VESA shell → app-only controller → NEW three pure engines → future app-only `vesa.fabric-supplier-comparison.records.v1` browser storage and source-only reports. Every supply quote owns sourceRef, date, validity, sample spec and explicit unit. M1 no provider calls. No sibling localStorage, browser tokens, real supplier/buyer records, cloud sync, pushed secrets, official FX source.

**M0 verdict: ACCEPTED for M1 file group only.** User-specific fabric conversion approvals, quotation/Incoterm applicability, measured weight+width basis, shrinkage tolerance and official charges/freight/FX remain **Needs Information** unless an actual human-supplied source is recorded. M1 will support same-typed-unit direct price, explicitly source-recorded positive rational unit conversion only (cross-dimensional conversion requires documented fabric GSM/width/quality basis). Specs/terms not provably equivalent must remain `NOT COMPARABLE`; missing logistics/charge applicability keeps landed status `NEEDS INFORMATION`; expired supplier offer never becomes a winning recommendation. No approval inferred from top-ranked price.

**M1 SINGLE reversible patch:** only NEW three pure modules, one synthetic test, feature CI and this tracker. Exact `APP-12` names above; `main` and every sibling source remain unchanged. Entry constructors cannot guess supplier, quote validity, MOQ/lead time, land charges, currency or fabric equivalence. BigInt and bounded decimal inputs prevent floating rounding and injection. Test compatibility against Fabric & Trims, Costing, PO, Buyer CRM, Artwork, Factory, Production, Shipment, LC, TNA, PPM, AQL and full 15-app source integrity. No public route until separate M2/M3/M4 proof. **Rollback:** revert APP-12 M1 feature commits, never clear/alter saved existing app records.

**PRECISE NEXT ACTION:** implement M1 engines and synthetic CI in locked group, independently verify exact commit SHA; if pass, M2 single-shell 4-language browser-local workspace, then M3 source reports, M4 conditional personal non-commercial publication with exact public deployment validation. Original blueprint ZIP never needs reattachment.
