# APP-01 Packing & Container 360 — M0 Repository and Source Audit

**Date:** 2026-10-15  
**Verdict:** **DRAFT-ONLY / BUSINESS BLUEPRINT ACCESS BLOCKED**. Audit findings are not implementation or release proof.  
**Repository:** `venkatbangla-boop/vesahost`; `feature/tna360-continuous` head `057cc4e875c79ba325763db43654870f9633a747` at M0 start. Stable `main=33865558ab918cfa84fe08c66ccf77b65e1139a3`; separate `feature/costing-360=93ccae55d39fd0c35034c5175d7cfe09a75dd721`; recheck all branch heads before implementation.  
**Last accepted runtime:** TNA R12 source/test `3e1941742a7c33340d3574034e8fc6c0f785167c`, [Actions #38730219795](https://github.com/venkatbangla-boop/vesahost/actions/runs/38730219795) SUCCESS; 119/119 Node tests, real R12 browser and existing TNA/PPM/AQL mobile/desktop browser regressions PASS. That is **not APP-01 evidence**.

## Controlling specifications / available source

- `AGENTS.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md` and `docs/tna/06_EXECUTION_TRACKER.md`: actual accepted TNA branch continuity and release hold.
- `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`: shared one-header/menu owner, only one save state and Settings, Home/File/Edit/View/Tools/Help, four languages and mobile accessibility.
- `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`: browser-local records and manual copies only; no paid provider, remote secured roles/database or claim that public GitHub Pages provides private commercial SaaS hosting.
- Original project Library source `01_MASTER_PORTFOLIO_ROADMAP.md` was indexed and inspected for its explicit 15 additional apps: APP-01 Packing & Container 360 is first-ranked in W1; **Costing 360 is separately specified**. Original indexed `08_CODEX_NEXT_APP_BUILD_PROMPT.md` directs APP-01 M0→M1→M2→M3→M4 and requires the dedicated blueprint and minimum business-rule approval; `04_WAVES_DEPENDENCIES_AND_RELEASE.md` defines independent local milestones.
- **Missing exact dedicated source:** `blueprints/APP-01_packing-container.md` does not appear in the inspected 353-path TNA Git tree or accessible indexed Library search. Source `VESA_360_15_APP_MASTER_ROADMAP_HANDOVER.zip` exists as a Library listing, but its raw bytes could not be materialized here and its indexed text cannot be read as ZIP content. Do not silently reconstruct or assert this blueprint was reviewed.

## Direct file-level audit and ownership

| Path | Owner / data flow | Class / action |
|---|---|---|
| `js/app-catalogue.js` | App Centre route descriptors (AQL, PPM, TNA, Costing currently registered) | **WATCHED.** Add APP-01 route only after tested app M4 and independent approved registration patch. |
| `js/vesa-workspace-shell.js`, `css/vesa-workspace.css` | Sole authenticated app header, account, menus, save-state, controls | **FROZEN.** APP-01 renders only domain content/commands through existing shell. |
| `js/preferences.js`, `js/auth.js` | Four-language theme/settings; local convenience login, not server authorization | **FROZEN.** Avoid preference/auth edits until scoped later integration proof. |
| `apps/tna/src/domain.js`, `apps/tna/src/scenarios.js`, `apps/tna/src/storage.js` | OrderPlan, scheduling, local records under `vesa.tna360.*` | **FROZEN.** No direct sibling storage reads/changes. Only explicit reviewed read-only references. |
| `apps/ppm/index.html` / PPM modules | 168 meeting checkpoints, release decisions, saved local meeting evidence | **FROZEN.** Packing never infers PPM GO/HOLD or overrides PPM evidence. |
| `apps/aql/index.html` / AQL modules | Sampling, Ac/Re, carton choice, inspection and quality decision | **FROZEN.** Packing never supplies inspection acceptance or changes quality rules. |
| `feature/costing-360` / existing Costing ownership | Separate garment costing, consumption, FOB and margin programme | **WATCHED / FROZEN.** Never duplicate costing or mix competing branches. |
| `apps/packing-container/` | **NOT PRESENT** in audited feature branch; no app runtime exists | **NOT IN SCOPE** until exact blueprint recovered and M1 patch authorised. |
| `docs/roadmap/APP-01_M0_SOURCE_AND_SCOPE_AUDIT.md` | This source/ownership ledger only | **IN SCOPE FOR CURRENT DOCS PATCH**. No runtime, schema or storage change. |

**Call/dependency direction (proposed only):** shared app shell/prefs/catalogue → future APP-01 UI → future APP-01 application/domain/data/report adapters. Each future app-local storage namespace and record format must be independently specified and versioned. TNA/PPM/AQL/Costing records remain frozen and must not be used as a hidden shared database. No source-to-source copy, implicit approval, remote sync, third-party hosting or credentials.

## What is actually specified so far

The indexed roadmap and reusable next-app prompt authorize the *category* of work: typed garment/style/colour/size, solid/mixed packing/assortment plans; input carton dimensions/units; mathematical CBM, entered payload/space planning, manually sourced pallet/container values; report/print and portable browser-local records; explicit read-only order references; four-language VESA UI. They **do not** establish actual container interior dimensions, buyer pack ratio, legal loading limits, pallet stacking efficiency, physical fit, commercial weight allowances, or independently verified shipment quantities. Such dependent outputs must remain **Needs Information** until their exact approved policy/source is entered. Mathematical volume fit is not proof of safe physical loadability.

## Patch gates and rollback

- **M0:** Partially audited, business-spec source unresolved. Current patch touches this docs-only audit file. No app code, route/catalogue, JS/CSS, PPM/AQL/TNA/Costing logic, service worker, deployment or live customer information.
- **M1 (blocked):** Do not implement domain/schema/unit conversions until the dedicated blueprint is accessible and exact accept/reject policies are resolved. Follow M1 pure-engine validation/negative unit tests afterward.
- **M2/M3/M4 (not started):** Local workspace/save/recovery → reports/manual refs → Chromium/cross-app proof and controlled release handoff. No public main merge or commercial SaaS deployment without a new explicit release decision.
- **Rollback:** Revert this documentation commit if provenance/ownership requires correction; keep TNA R12 verified source and all accepted PPM/AQL/Costing behavior unchanged. Do not force-push or delete feature branches.

**ONE PRECISE NEXT ACTION:** Locate and read the original **`blueprints/APP-01_packing-container.md`** from an authorized raw-byte copy of `VESA_360_15_APP_MASTER_ROADMAP_HANDOVER.zip` or another exact user attachment; compare it with the indexed roadmap and current app ownership. Then define a gated M1 patch plan/branch from an approved tested base. Until then **APP-01 remains DRAFT-ONLY; not implemented or verified**.
