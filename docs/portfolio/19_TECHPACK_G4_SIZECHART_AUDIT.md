# G4-W1 APP-03 Tech Pack — Measurement-led Home audit

Code baseline: `main` `09c96ff5f59e43512dcb0b429623a37062592d0a`. Controlling: `blueprints/APP-03_tech-pack-spec.md`, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, existing APP-03 `domain.test.cjs` and `browser-workflow.cjs`.

## File-level evidence

| Path | Ownership, call flow and risk | Scope |
|---|---|---|
| `apps/tech-pack-spec/index.html` | Single-file app. `GarmentSpecEngine.practice()` owns **fictional** size S/M/L chest POM, reviewed demo grading and tolerance. `GarmentSpecEngine.project()` computes exact demo POM targets/limits; `TechSpecWorkspace.render()` owns Home and 6 active sections (`summary,poms,grades,bom,revisions,reports`). `action()` already opens Practice Example and section nav. Engine, persistence and Reports are separate owners inside same HTML. | **In scope only:** Home-only preview of the EXISTING computed sample + 6 direct practice sections, collapse redundant disclaimer, app-specific size-table CSS and localization. Frozen math/record/report class source spans. |
| `apps/tech-pack-spec/tests/domain.test.cjs` | Fixed-decimal grading, tolerance, approved source, flat/circ basis, old copies | **FROZEN; execute unchanged** |
| `apps/tech-pack-spec/tests/browser-workflow.cjs` | Real POM, grading, report PDF/XLSX, save/reopen, EN/BN/HI/TA, no guessed values | **FROZEN; execute unchanged** |
| `apps/tech-pack-spec/tests/sizechart-discovery-browser.cjs` | New test: real DOM synthetic projection, 6 stages, 320/390/1440, no storage changes, local print | **In scope** |
| `service-worker.js`, `tests/personal-demo-release.cjs` | Current root cache of APP-03 unchanged HTML can serve an older version after deployment | **In scope:** cache name rotation only |
| `.github/workflows/vesa-techpack-g4-chart.yml` | Node original engine and real Chromium plus Packing/Commission siblings | **In scope** |
| `docs/portfolio/19_TECHPACK_G4_SIZECHART_AUDIT.md` | This audit, immutable scope and next action | **In scope** |
| Public company homepage, shared shell, AQL, PPM, TNA, all real garments and 16 other apps | Different owners, no cross-app storage dependencies | **FROZEN** |

## Original screen deficiency and approved behavior

Home currently shows only New, Continue, Open Saved Copy, Practice, saved records and a long explanatory banner; **all six working stages and the actual size/POM calculation are invisible until clicking Practice/New**. A simple user cannot see that actual measurement sizing and grading functions exist, leading to the “empty app” problem.

This change must **not invent size specs**. The only home measurement demo is derived from `GarmentSpecEngine.practice()` → `GarmentSpecEngine.project()` using the already-reviewed fictional S/M/L + chest-flat 50cm M base with synthetic ± tolerances and signed ±2cm size transitions. Show source and fictional/practice labels. Do not claim these are buyer or garment-industry approved sizes. If source checks fail, show `Needs Information`, never made-up values.

**Patch plan TECHPACK-G4-01:** responsive actual computed specimen size table plus six distinct task buttons linking to `practice` in exactly one clicked active section, all four languages and 44px touch targets. Real records remain untouched, buttons Save/Download remain disabled for practice. Preserve all paths to New, Continue, Open Copy, XLSX, PDF, revisions. No new grading rules or tech pack import API.

**Verification:** real Chromium 320/390/1440 synthetic computed S/M/L, 18 deep links, four-language labels, print-only output exclusion, no localStorage record changes and no horizontal overflow; original APP-03 domain+browser and APP-01/02 siblings plus TNA/PPM/AQL Node tests. Require CI PASS and screenshot inspection before optional main promotion. Rollback only Home/presentation/cache version. Human UAT stays NOT TESTED.

**Verdict:** accepted as a narrowly bounded **existing-feature discoverability** enhancement. Additional POM/buyer grading policies, image artwork upload and real buyer approval are conditional on their own source/authority.
