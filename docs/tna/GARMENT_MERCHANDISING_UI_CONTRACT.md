# TNA 360 — Garment Merchandiser Sheet UI Contract (GMR-01)

**Authority:** `docs/tna/GARMENT_MERCHANDISING_REWORK_QUEUE.md`, original TNA docs 01–06 and mandatory `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`. This is a UI contract and gap ledger, **not a competing execution tracker**. Status is **ACTIVE / CONDITIONAL** until CI and genuine business-user acceptance.

## Practical screen / data ownership

On opening a local order, one full, familiar garment **Time & Action Master Sheet** appears before secondary Home cards and advanced dashboards. Existing single VESA shared header and File/Edit/View/Tools/Help menus remain authoritative. The sheet uses one row per actual `plan.tasks[]` member (no first-12 sample or fake task), in the original library's stable activity order, for knit and woven.

| Garment field / sheet column | Actual source, and truthfulness |
|---|---|
| Buyer / Factory / PO / Style | `order.buyerName`, `factoryName`, `poNumbers[]`, `styles[0].styleNo` |
| Garment, fabric, color/size, order qty | `order.construction`, `fabricSpec` or `composition`, `colorSizeBreakdown[]` / `sizeRange`, `totalQty/unit` |
| GSM | Not present in current canonical `OrderPlan` input contract; displays `Needs Information`. Do not infer GSM from a text description |
| LC date / status | Actual `commitments.masterLcOpenedOn`; status needs explicit typed source and remains `Needs Information` otherwise. Never equate B2B and master LC |
| Ex-factory / shipment | `buyerRequiredExFactory` and `buyerRequiredETD`, **not** interchangeable |
| Section / Activity / Responsible | `task.stageCode/title/ownerParty`; no fake status from owner identity |
| Planned / Revised / Forecast / Actual | `task.dates.baselineFinish/currentTargetFinish/forecastFinish/actualFinish` kept separate. Calculated early finish appears as forecast only if current calendar source and scheduling result are confirmed/valid |
| Days delay | Nonnegative **calendar-day** comparison of actual or evidence-backed forecast versus explicitly stored revised target, else baseline. Unknown target/forecast remains `Needs Information` |
| Status / Approval/Source / Remarks | Recorded `task.status`, `proofRefs[]`, `delayReason` and `recoveryAction` only. No approval is inferred from an expected date |
| Update | Existing `openTaskEdit` → `domain.updateTaskStatus` → autosave path. No new parallel editor, storage adapter, record or migration |

**Follow-up filters:** All, Overdue, Due This Week (Monday–Sunday), Waiting Buyer, Waiting Local Office, Waiting Factory, On Track, Critical. Due/overdue require a **manually chosen review/as-of civil date**; waiting filters require a recorded explicit `task.waitingFor` field, and do not infer owner-party as an assigned hold. Critical/on-track filters require a valid schedule from a confirmed factory calendar. Missing evidence is visibly flagged, not silently shown as healthy.

**Four languages:** English, Bengali, Hindi and Tamil localize sheet labels/filters/status wording. Buyer/factory names, free-text remarks, status IDs, civil dates and saved records are unchanged by language switching.

**Responsive:** Desktop table with scrollable columns, mobile same task rows displayed as accessible activity cards. No additional fixed header, re-skin, duplicate VESA logo or external network call. Print shows real rows and hides edit buttons; native report/export engines remain untouched.

## Scope / next unimplemented rework items

GMR-01 is intentionally **presentation + existing task-status edit only**, not completed garment rework. The current OrderPlan does not have an approved standalone GSM property or master LC status; there is no safe pre-existing command to edit planned/revised/actual dates, owner, waiting party or approval authority with baseline/evidence checks. Those require the **next independently audited domain/application command patch**, explicit source mapping, schema/migration test, saved-copy and Excel parity, and factory/merchandiser UAT. Current reports, XLSX flows, scheduled critical path and backup records retain prior behavior and should not be called newly accepted by this UI patch.

GMR-01 read-only code owns `apps/tna/src/merchandising-sheet.js` and scoped CSS `apps/tna/assets/merchandising-sheet.css`. `apps/tna/src/bootstrap.js` only wires filters and delegates Update to the existing activity editor. `index.html` loads the modules in the established order, `service-worker.js` inventories the new static files, and `.github/workflows/tna-merchandising-verification.yml` covers proof. Existing `domain.js`, `scheduling.js`, `storage.js`, `reports.js`, PPM, AQL, catalogue, auth and user datasets are explicitly **frozen**.

**Rollback:** revert GMR-01 feature commits and the new static files on `feature/tna360-continuous` before any main merge. No browser data deletion, migration, scheme change, pricing or re-baselining is permitted.

**Release:** This rework is never `DEMO LIVE` merely because existing TNA already has a public route. Independent testing, owner release authorization, hosting suitability and exact public route/version verification remain required.
