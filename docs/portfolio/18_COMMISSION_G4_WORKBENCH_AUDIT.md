# G4-W1 APP-02 — Commission Workbench Discovery Audit and Small Patch

Baseline: `main` `d3683c85a0f9de92fa60d3e467e6bb6e7839d5bd` (Packing G4 released).
Authority: `blueprints/APP-02_order-commission.md`, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, `apps/order-commission/tests/{domain.test,browser-workflow}.cjs`.

## Objective and exact file-level ownership

Source examination shows APP-02 already contains the actual `CommissionDomain`, `CommissionMoney`, `CommissionStore`, `CommissionReport` and `CommissionWorkspace` owners, 10 internal sections (Summary, Agreement, PO/FOB Lines, Exclusions, Earned Evidence, Invoices, Receipts, Deductions, Revisions, Reports), local XLSX and print/PDF. A synthetic `CommissionDomain.demo()` exists. The existing home lists New/Continue/Open/Practice and local records, but it does not disclose the ten real workflow steps before creating or opening a record.

| Exact path | Responsibility and state | Modification decision |
|---|---|---|
| `apps/order-commission/index.html` | All APP-02 source in one HTML: `CommissionWorkspace.render()` owns home DOM; `action(action,id)` routes UI events. Domain money, immutable agreement revisions, saved-copy schema and reports are separate classes in same file | **IN SCOPE ONLY:** home-only grouped workflow labels, direct fictional practice links, app-owned CSS; domain/record/report class byte spans **FROZEN** |
| `apps/order-commission/tests/domain.test.cjs` | Existing deterministic expected/earned/received/adjustment/currency/basis/revision proof | **FROZEN: run unchanged** |
| `apps/order-commission/tests/browser-workflow.cjs` | Real Chromium EN/BN/HI/TA, versioned agreement, XLSX/PDF, import/corruption, all device sizes | **FROZEN: run unchanged** |
| `apps/order-commission/tests/workflow-discovery-browser.cjs` | New synthetic real-click testing of all ten existing sections, record immutability, mobile/desktop/print/preferences | **IN SCOPE** |
| `service-worker.js` and `tests/personal-demo-release.cjs` | Existing root offline APP-02 HTML cache and version test | **IN SCOPE:** cache namespace version only, no change to assets list/public HTML |
| `.github/workflows/vesa-commission-g4-desk.yml` | Node/Chromium sibling guarded CI | **IN SCOPE** |
| `docs/portfolio/18_COMMISSION_G4_WORKBENCH_AUDIT.md` | This audit, scope, proof and rollback | **IN SCOPE** |
| Shared shell, company home, other 18 apps, source blueprints, APP-02 finance engine and signed records | Sole independent owner outside this cosmetic presentation patch | **FROZEN** |

## User task / call flow

`/apps/order-commission/` → shared VESA header mounts once → `CommissionWorkspace.render()` shows the entry screen → the delegated `#commissionMain` click handler invokes `action()` → validated `preview-<approved section>` will load `CommissionDomain.demo()` only → existing `render()` displays the requested one of ten approved working stages. `Save/Download` stays disabled for practice records. A home/back action restores the original home without modifying local commission record keys.

Current finance stage and report interfaces must not be duplicated or silently expanded. Commission rate/milestone, recognized FOB, invoice, receipts and currency conversions still require explicitly sourced business values, not assumptions.

## Locked patch group COMMISSION-G4-01

- Replace the repeatedly expanded long explanatory warning with a compact disclosure retaining exactly the prior caution text, still readable on request. This is non-business UI only.
- Add a **financial lifecycle desk** to Home: three horizontally arranged workflow lanes rather than generic card tiles, covering all ten existing step labels. Each step is a keyboard-accessible 44px+ button that opens that specific section of the fictional practice fixture. Add clear grouping/help copy in EN/BN/HI/TA. No read/write of user record on preview actions.
- Preserve existing New/Continue/Open Saved Copy/Practice, local saved list, Save/Open, all menu integrations and record/report/calculation class functionality.
- Run original domain/Chromium APP-02, Packing sibling, App Centre/one-header, and new lifecycle evidence at 320/390/1440. Require no overflow or unexpected records, all ten steps and clean translation.
- Bump root service-worker namespace for prior APP-02 HTML cache, but do not touch home assets or company homepage.
- Rollback: revert only presentation/CSS/action preview additions and SW version; no saved user data is altered.

**Verdict:** accepted as a strictly reversible app-owned presentation/discoverability patch. New earned-income/commission basis algorithms, automatic invoicing, user emails or external finance functions are **NOT AUTHORIZED** by this patch and need source/business approvals. Genuine human UAT remains pending.
