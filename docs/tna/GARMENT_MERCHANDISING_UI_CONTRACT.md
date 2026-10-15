# TNA 360 — Garment Merchandiser Sheet UI Contract (GMR-01)

**Authority:** `docs/tna/GARMENT_MERCHANDISING_REWORK_QUEUE.md`, original TNA docs 01–06 and mandatory `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`. This is a UI contract and gap ledger, **not a competing execution tracker**. Status is **ACTIVE / CONDITIONAL** until CI and genuine business-user acceptance.



## GMR-03 R01 master report and native Excel parity — verified 2026-10-15

**Actual evidence:** GitHub Actions [run #38627693400](https://github.com/venkatbangla-boop/vesahost/actions/runs/38627693400) on source SHA **0551569dae24e88a9e58b70fcb5f0b2df202263d**, SUCCESS. Node GMR-01/02/03 sheet, domain, report/export source suites: **23 pass, 0 fail**. Existing TNA domain, CPM, saved-copy migration, G07 multilingual R01–R12 catalogue/report verification, PPM 168-checkpoint baseline and AQL sampling checks PASS. Actual Chromium: original/edited TNA local save/reopen, R01 source-backed Excel download, 101 task rows in a genuine workbook, 9-page printed PDF opened in browser PDF viewer, no tested report overflow; cross-app Login/App Centre/PPM/AQL/TNA UI and mobile/zoom regression PASS.

**Exact R01 boundary:** apps/tna/src/reports.js uses the same pure TnaMerchandisingSheet.snapshot() projection as the UI; it adds a source-backed masterSheet only to R01 (factory/agent master). Order GSM, Master LC status/date/proof, 13 master activity columns (includes predecessors), baseline/target/forecast/actual, owner/waiting, delay, approval/source and follow-up are kept separate. The four existing Excel worksheets and 12 report IDs remain; R01 appends a fifth native worksheet, **Master TNA**, with properly typed numeric quantities/GSM/calendar-day delays and Excel date cells. Spreadsheet formula-like text, including leading whitespace before operators, is escaped; the original source plan remains immutable.

**Readable PDF:** R01 browser preview shows all task rows in two related, repeat-header tables rather than shrinking 13 columns into unreadable print. Real Chromium browser printing produced a multipage PDF and opened it in its PDF viewer. EN/BN/HI/TA labels are carried through the source projection. This is genuine browser print, **not a new dedicated PDF generation engine or signed business report**.

**Audience boundary:** R02–R12 retain their prior four-sheet export and receive no newly introduced raw LC proof, GSM, waiting party or factory follow-up master data from R01. The original report models are not yet fully specialized for each audience; DO NOT claim verified buyer confidentiality or cloud enforced permissions. Browser-local login is not server-side security.

**Changed code/test boundaries:** apps/tna/src/reports.js, storage.js (export writer and formula escaping only), bootstrap.js (R01 preview), assets/tna.css, index.html and root service-worker.js. Existing G07 asset pin test and G11 artifact-viewer workbook expectation were updated, GMR-02 real browser test extended for authentic R01 Excel/PDF, new apps/tna/tests/g13-merchandising-report-parity.test.js added, same GitHub workflow expanded. **Frozen:** TNA domain.js, scheduling.js, signed baseline revisions, saved copy schema and migrations, PPM/AQL engines, VESA header/auth/catalogue, main. Revert these feature-branch patches if acceptance evidence regresses; never reset actual saved records.

**Unfinished rework:** The completed GMR-03 slice covers R01 only. Source-backed R02–R12 report-specific actions, a reviewed Excel TNA import mapping/commit workflow (currently preview-only), dedicated print/font visual UAT in Bengali/Tamil, genuine desktop Excel/LibreOffice opening, factory buyer/practical merchandiser trials and hosting/release approval remain NOT VERIFIED.

**Precise NEXT ACTION:** GMR-04 — audit storage.importWorkbookPreview(), current Excel import dialog and original mapping/validation spec; implement a safe reviewed Excel import into a NEW DRAFT only, with sheet selection, explicit column/date-basis mapping, duplicate/formula/cyclic reference rejection, preview and explicit confirm. Preserve old draft/saved copies and existing 1.1.0 schema, and test actual knit/woven Excel files. Do not turn preview into silent overwrite.

---

## GMR-02 evidence-backed extension — 2026-10-15

**Verification:** [GitHub Actions #38626121298](https://github.com/venkatbangla-boop/vesahost/actions/runs/38626121298), real checkout source/test SHA 616428ae175dd5720816f4d9b793c276c21f673c — **SUCCESS**. Combined garment unit suite 18/18 PASS, real Chromium activity/order forms, source-failure atomicity, local save/reopen, four languages, mobile, TNA scheduling/storage/report/saved-copy migration and PPM/AQL/shared-shell regression passed. This proves GMR-02 development behavior only, **not human UAT or public rework deployment**.

**Backward-compatible optional plan additions:** order.fabricWeightGsm (positive number or null), commitments.masterLcStatus (unknown, not-applicable, pending, opened, amended, cancelled), commitments.masterLcProofRef, task.waitingFor, task.followUpNote. Existing commitments.masterLcOpenedOn, task dates.baselineFinish/currentTargetFinish/actualFinish and audit/revision events are reused. OrderPlan schema version 1.1.0 and the VESA-TNA saved-copy codec stay unchanged; older records missing optional fields validate, load and round-trip without synthetic backfilling.

**Domain-owned commands:**
- reviseMerchandisingOrder(): GSM must be a documented positive number. Master LC opened/amended requires real opening date and source document; no date/status is inferred from PO or fabric/trims B2B LC. A historical actual LC opening is immutable once baseline is confirmed; first opening after baseline is allowed with evidence.
- reviseMerchandisingTask(): owner and explicit waiting party, planned/revised/actual dates, status and evidence are validated as one atomic clone before autosave. A confirmed original planned baseline cannot be overwritten. Revised target requires reason, source and named authorizing party; user-entered authority is not independently verified. First actual requires completed/approved status plus evidence; later actual corrections require a separate authorized process. Status-approved/waived/rejected transitions require supporting authority/evidence, while ordinary in-progress updates keep prior status-only usability.
- Both reject stale expectedRevision and invalid dates, append revision/audit provenance, keep factual delay reason separate from follow-up notes, and preserve the original plan on failure.

**UI:** One in-sheet Edit order details action and existing shared Edit Order menu; individual Update buttons open a source-validated garment form. Four-language labels and mobile styling use the existing single VESA shell. Practice edits never enter real autosave. No PPM/AQL/status/CPM/baseline code is changed.

**GMR-02 source boundary:** Changed apps/tna/src/domain.js, apps/tna/src/bootstrap.js, apps/tna/src/merchandising-sheet.js, apps/tna/assets/merchandising-sheet.css, apps/tna/index.html, service-worker.js, prior sheet version test, and the same CI workflow. Added apps/tna/tests/g12-merchandising-edits.test.js and apps/tna/tests/g12-merchandising-edits-browser.cjs. Kept apps/tna/src/storage.js, scheduling.js, reports.js, PPM/AQL, auth, catalogue and main frozen. Rollback by reverting only GMR-02 feature-branch commits; no browser data deletion or schema migration needed.

**Next gap (GMR-03):** Genuine garment Excel and report parity is missing. Existing report/summary workbook only partially presents task fields; GSM, Master LC evidence, waiting party, source, planned/revised dates and follow-up comments are not all represented. Preserve R01–R12 report identities, review audience fields, import safety and data typing before changing exports. Excel **import** is still preview-only and must not be described as a completed commit/mapping flow. Factory/user UAT remains NOT TESTED.

---


## GMR-04A — checked Excel order-row new-draft workflow, 2026-10-15

**Verified:** [real GitHub Actions #38679689378](https://github.com/venkatbangla-boop/vesahost/actions/runs/38679689378), source/test SHA `b088ea79e4fe273c4d23b9bd8af949e034046748`, **SUCCESS**. The job ran 33/33 Node direct checks and genuine Chromium read/preview/map/confirm/duplicate/save/reload flows, plus frozen TNA/PPM/AQL and shared-shell tests. Source data remained unchanged after opening an import preview, and old saved plan unchanged after new imported plan was saved. This is **DEVELOPMENT VERIFIED** only for a **single selected workbook order-row** import.

**Scope:** Local .xlsx uploads only, source size/sheet/row/column bounds, whole-sheet formula rejection, no macro execution, explicit sheet/header/data-row selection, field mappings, civil date source notation (ISO/DMY/MDY/Excel serial) plus lead-time working/calendar basis and approved garment template. Header suggestions are review prompts, not trusted automatic mapping; users can edit them. Duplicate order identity gets an extra consent step and never merges/overwrites old orders. The domain builds an unsigned distinct 1.1.0 draft with default blank template activity dates/status, user-review audit provenance and no file storage; previous TNA saved-copy readers and scheduled calculations are unchanged. UI explicitly warns other order rows, activity approvals and predecessor/dependency rows are **NOT** imported. English/Bengali/Hindi/Tamil localize key import-field labels.

**Files owned:** `apps/tna/src/import-review.js` (new pure workbook reader/validator), `apps/tna/assets/import-review.css` (new scoped responsive fields), bootstrap (in-memory review + explicit confirmation to existing `storage.savePlan`), index asset links, root service-worker asset inventory, `g14-reviewed-excel-import.test.js`, `g14-reviewed-excel-import-browser.cjs`, existing CI step. **Not changed:** TNA domain/scheduling/storage/report contracts, PPM, AQL, public main/Costing, local record schemas.

**Remaining required scope:** GMR-04B — full workbook activity/date/status/dependency import with user-reviewed match/merge into a **new** TNA draft, unrecognized/missing task mapping, rejection of cycles/formulas/unsupported approvals and baseline changes. GMR-04A does **not** certify this. Source acceptance and full human UAT are still pending. See original `docs/tna/06_EXECUTION_TRACKER.md` for the single authoritative checklist and precise NEXT ACTION.

---

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
