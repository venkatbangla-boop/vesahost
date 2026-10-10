# 04 — VESA UX, Screens, Languages, Saved Files & Reporting Contract

**Design baseline:** inspect live repository source for `/login/`, `/apps/`, `/apps/ppm/` and `/apps/aql/` before styling. Reuse existing VESA Enterprise Inc. branding/logo source and appearance preferences; don't introduce a separate TNA site or invent a substitute logo. PPM is navigation/interaction reference, **not** a source of TNA-specific checkpoints or release policies.

## 1. Global application shell

- Site route: login → App Centre → TNA 360; within TNA provide visible `App Centre` / `Home` navigation and working back behavior without losing unsaved edits.
- Desktop: compact branded header, useful order identity, save state, intuitive top menus `HOME / FILE / EDIT / VIEW / TOOLS / HELP`, main navigation, content area, unobtrusive contextual guidance.
- Mobile: responsive compact header, accessible main-menu drawer, vertically stacked screens and activity cards, safe sticky actions, no clipped garment/order fields; no hover-only features. Avoid displaying all technical menus/language options simultaneously or duplicating top navigation bars.
- Appearance: reuse website preference/theme contract (currently `js/preferences.js`), clear contrast, familiar primary/secondary/danger actions, persisted selection. Theme changes may alter colors/font/density but must not change saved business data.
- Language: `English`, `বাংলা`, `हिन्दी`, `தமிழ்`; selection belongs in a predictable settings/menu area, not sprawling top-level controls.
- Home should load fast and never silently create a production order. Training sample is clearly distinct and must never appear in real portfolio or export as approved business evidence.

## 2. Home page content (exact primary actions)

1. **New TNA** — quick/full/template/import creation choices.
2. **Continue Last TNA** — only if a recoverable actual record exists; otherwise explain why disabled.
3. **Open Saved TNA** — list stored orders, filter by buyer/factory/PO/style/updated date.
4. **Practice Example** — representative filled but clearly labeled training TNA; easy discard/reset.
5. **Open Saved Copy** — choose a previously downloaded VESA TNA backup, validate, preview and confirm.
6. **All Orders** — view authorized orders and high-level risks; in local mode indicate this browser only.

Recent cards show buyer/factory, style/PO, last edited date, original/forecast shipment dates (if known), risk/unknown status and next action. Never show `0 tasks`, `Approved` or green merely because record is blank.

## 3. Guided New TNA wizard

**Step A — Order identity:** Buyer, factory, brand, agent, PO, style, quantity/unit, destination/market, ex-factory commitment, ship mode/terms. Save draft even with incomplete data.

**Step B — Product & processes:** choose garment family and profile; choose fabric local/imported, printing, embroidery, washing, dyeing, coating, subcontracting. Show "What is included?" before creating tasks; allow add/delete with a reason.

**Step C — Scheduling inputs:** factory working days/calendar, planned lead/actual LC anchor if applicable, relevant supplier and production capacity, approval responsible party and turnaround if documented. Blank means unknown, not zero.

**Step D — Preview:** display proposed activities, required missing fields, dependency warnings and draft schedule without confirming buyer/factory promises.

**Step E — Confirm baseline:** user verifies sources and dates, optionally records reviewer and reason; freeze version 1 as immutable historical baseline.

Offer **Quick Plan** (essential fields with later expansion), **Full Plan** (all optional commercial/production fields), **Import Existing TNA** (map and preview an Excel sheet), and **Duplicate Existing**. Avoid giant forms and excessive modal dialogs.

## 4. Primary workspace navigation

| Screen | Required content | User actions |
|---|---|---|
| Dashboard | Risk metrics, today, overdue, next 7 days, pending decisions, forecast vs commitment | Jump to actionable records |
| Order Details | Buyer/factory/PO/style, construction, material route, quantity, ship dates and source | Edit draft / create controlled revision |
| TNA Planner | Grouped activities with owner, dates, actual/status, dependency, evidence | Add/edit/filter/group/bulk follow-up |
| Critical Path | Controlling activities, total/free float, delivery endpoint, Gantt/graph, reasons | Inspect impact and dependencies |
| Materials & LC | Fabric/trims supplier schedule, LC and availability, quality release | Update milestone, shortage, evidence |
| Approvals | Fit, PP, lab dip, trims, print/wash, delegated authority, revision rounds | Submit/record decision/rework |
| Production | Line assignments, cutting/sewing/wash/finish/pack outputs, WIP, balance | Update daily progress and capacity |
| Shipment | Lot-level packing, inspection, booking, documents, ex-factory/ETD/ETA | Track evidence and lots |
| Recovery & Scenarios | Proposed changes, days saved, changed constraints/critical chain | Save scenario, compare, explicitly apply |
| All Orders | Buyer/factory/PO filters, due shipments, owner, aggregate risks | Open authorized order |
| Reports | Report type, audience, filters, print preview | Prepare/Download/Print/Share |

Keep a clear way to reach Activity Details from any warning, and a breadcrumb to restore previous list/filters. Advanced controls in collapsible panels; basic users never need to understand dependencies to mark today's completed action.

## 5. Main TNA Planner display columns

`Stage | Activity | Owner | Baseline Date | Current Target | Forecast | Actual | Duration | Status | Risk | Notes/Proof | More`

On desktop allow selective columns, comfortable horizontal scroll, sticky first activity column and date header; on mobile render cards with activity, dates, owner/status and an `Update` button. User can switch between **Table**, **Timeline (Gantt)**, **Today/Next 7 Days**, and **Critical Only** views.

Interactions:

- Add task, clone task, assign owner, adjust time/duration, link dependencies, change applicability with reason; protect required critical gates.
- Status transition has validation; mark complete requires actual date and relevant evidence policy.
- Edit current target requires explicit change request/reason/authorization if locked. Forecast is computed and read-only; one cannot type an "Actual" in place of forecast.
- Show where a field came from: `entered by user`, `imported`, `calculated` or `confirmed by reviewer`.
- Undo/redo supported for draft local edits without erasing audit; irreversible signed operations require a correction event.
- Group by stage, owner, buyer/factory, week, material category, criticality. Search handles localized display labels and raw PO/ID safely.

## 6. Gantt, CPM and risk visuals

- Draw readable activity bars for baseline (subtle), current target (outlined), forecast (prominent), actual progress (solid). Legend always visible; users need not distinguish color alone.
- Show weekend/holiday bands and dependency connectors; horizontally scrollable with zoom by week/month. Date labels should render accurately independent of client timezone.
- Highlight controlling chain(s), near-critical and overdue separately. A task can be overdue but noncritical, and critical but not overdue.
- Clicking a task explains why it controls a deadline: predecessor chain, next gate, total/free float, unknown assumptions, baseline/current/forecast comparison.
- Keyboard accessible table/list alternative to any SVG/canvas Gantt. Print report provides explanatory tabular route if chart can't fit.
- Browser cannot truthfully offer exact future ETA if carrier/transit details are missing; use placeholder with explanation.

## 7. Dashboard measures / risk text

Show only grounded metrics with denominators and tooltip definitions:

- Active orders with reliable committed date.
- On-track, at-risk, forecast-late, blocked, needs information.
- Tasks due today, overdue, next 7 working/calendar days (label basis).
- Waiting on buyer/factory/supplier/agent, based on recorded `waitingFor` party.
- Critical path length and available buffer, if schedule complete.
- Approved revisions since last report, with actor and date.
- Overall cutting/sewing/finishing/packing: quantity/denominator from real ledger, never fabricated percentages.

A missing quantity, approval, calendar or capacity uses `Needs Information` with a direct link to the input. Provide simple explanations such as `Fabric approval is pending` instead of `Constraint validation error F-03`.

## 8. File menus — nontechnical language (required)

| Menu | Commands |
|---|---|
| HOME | Home, App Centre, All Orders |
| FILE | New TNA, Open Saved TNA, Save Now, Make Another Copy, Download Saved Copy, Open Saved Copy, Import Excel TNA |
| EDIT | Undo, Redo, Edit Order, Add Activity, Edit Dependencies, Revise Target, Review Changes |
| VIEW | Dashboard, TNA Planner, Timeline, Critical Path, Due Today, All Orders, Appearance/Language if existing site convention |
| TOOLS | Recalculate Dates, Check Missing Information, Production Capacity, Recovery Scenarios, Prepare Report, Download Report, Print Report, Share Report |
| HELP | How to Use, Glossary, Example, About, Data & Backup Help |

Desktop menu should be keyboard/narrow-screen accessible; close on escape/outside click and avoid hover-only submenus. All action labels must match actual behavior. Do **not** show `JSON`, `CSV`, `IndexedDB`, schema versions, source stack traces, developer test names or internal task IDs in routine screens. It is okay for downloaded files to have a technical extension without exposing it as UI jargon.

### Save semantics

- **Autosave** after validated edits, with visible `Saved` or `Save failed` status. Never lie about storage success.
- **Save Now** flushes current record transaction and reports success only after acknowledged save.
- **Make Another Copy** creates a distinct user-confirmed record/copy; never overwrite original silently.
- **Download Saved Copy** exports a versioned self-contained backup for external safekeeping.
- **Open Saved Copy** verifies format/schema/filesize, previews buyer/PO/date/record ID, imports only after confirmation; preserve existing current record on failure.
- **Continue Last** must recover the exact last saved record or offer recovery version selection.
- **Data Recovery** show recent safe snapshots with date/record context. Retain reasonable bounded history, handle quota/private browsing failure and instructions for backup.
- Warning before leaving or closing with unsaved changes, subject to browser constraints. Service worker cache updates must not corrupt persisted records.
- Do not rely on a plain browser download as proof of cloud backup.

## 9. Report library and fields

| Report ID | Name | Audience | Minimum fields |
|---|---|---|---|
| R01 | Master TNA | Factory + agent | Order, 12 stages, all activities, baseline/current/forecast/actual, owners, status, dependencies, revision |
| R02 | Buyer TNA | Buyer/brand | PO/style/qty, buyer-facing milestones, required buyer actions, forecast, explanations, verified target |
| R03 | Factory Daily Action | Departments | Today/overdue/next 7 days with owners, follow-ups, reasons, proof references |
| R04 | Critical Path | Management | Controlling chain(s), float, forecast vs required ex-factory, buffers, violated gates, legend |
| R05 | Weekly TNA | Buyer/agent/factory | This week completed, missed, next week, pending approvals and agreed recovery |
| R06 | Delay & Recovery | Management | Original/current/actual, party waiting for, cause, affected tasks, scenarios and approvals |
| R07 | Production Status | Production/buyer as authorized | Cutting, sewing, finishing, packing, dates, remaining qty, throughput and projected end |
| R08 | Material & LC | Commercial/sourcing | Supplier, master/B2B LC, fabric/trims production/availability, shortage, required QC |
| R09 | Shipment Readiness | Quality/shipping | PP/PPM/inspection, packed/allocated quantity, booking, documents, lot-wise ex-factory/ETD |
| R10 | Portfolio/Multi-PO | Management/agent | Orders per buyer/factory, due dates, statuses, blockers, critical next actions |
| R11 | Approval History | Buyer/factory | Review rounds, submission, decisions, approved authority, evidence and revisions |
| R12 | Scenario Comparison | Planner/management | Base vs recovery A/B, input differences, changed critical path, feasibility and selected revision |

Every report must show: **VESA Enterprise Inc.** brand, report title, unique record/order context, generated as-of date/timezone, audience, schedule input revision, original/current/forecast/actual distinction, data-gap warnings, a no-fabrication note where applicable and page number on printable pages. Document version and original baseline must remain visible on revisions. Include original permission requirements for restricted finance fields and supplier pricing.

PDF: clear landscape planning tables with repeatable headers, wrapped long buyer/style text, page breaks, readable diagram legends, no clipped text/images. Print CSS is not a substitute for verifying generated downloadable PDF if promised. Print from browser must render a reliable report route. PDF library must be bundled locally with valid license; no required external CDN.

Excel: genuine `.xlsx` export with worksheet(s) such as Order Summary, Master TNA, Approvals, Materials, Production, Shipment Lots, Revision History, Critical Path and optional Report Notes. Ensure dates and quantities have correct types. User-facing "Download Excel" is fine; don't show internal parser names. Multiple worksheets do not alter the **seven project documentation files** requirement.

Share: trigger browser native share only on explicit user click when supported, otherwise provide generated report download. Cloud shared links require authenticated access, expiry/revocation where configured, and tenant/order checks.

## 10. Excel import / template behavior

User workflow:

1. Choose an existing Excel file. Show sheet names and detected header row, record count and preview.
2. Map columns: activity, stage, owner, baseline/target/actual, duration, status, predecessor, notes, buyer/factory/PO/style.
3. Explicitly choose date format and working/calendar basis; detect ambiguous dates instead of guessing.
4. Show duplicates, invalid values, dependencies not found, missing required identities and conflict with existing saved orders.
5. Allow editing mappings; import into new draft first. Never merge into an approved baseline without reviewed revision operation.
6. Show import summary, unrecognized extra columns, and a recoverable error if unsupported workbook.
7. Export the current version as an Excel template for familiar factory workflows.

Security: treat workbook content as untrusted; no macro execution; set limits; sanitize display; escape formulas in exports (values beginning `=`, `+`, `-`, `@`, and leading whitespace when relevant) without corrupting legitimate numeric typed cells. Reject potentially dangerous URL/script payloads. Preserve raw imported note as data, never render as HTML.

## 11. Language specification

Translate: UI labels, predefined template display names, how-to instructions, sentence-level guidance, risk explanations, validation prompts, report headings and menu items. **Do not translate** typed buyer/factory names, free-text comments, part numbers, units, reference IDs, numeric formulas, dates stored in ISO or uploaded evidence. Use stable translation IDs and an English fallback with a visible missing-string test failure.

Dictionary keys should map the same underlying concept in `en`, `bn`, `hi`, `ta`. Mark translated help in an explicit per-string catalogue, not through naive whole-page replacement. Do not mutate statuses or template IDs as a side effect of changing language. Choose date formatting based on display locale while preserving date-only domain values. Verify Bengali/Tamil font rendering in PDF/print; if a library/font cannot embed needed scripts, use tested browser printing or document the fallback without broken glyphs.

Suggested semantic writing rule: most instructions should be one short, plain sentence; don't use English developer jargon in Bengali/Hindi/Tamil guidance unless it is a familiar commercial term. Names of keyboard shortcuts may be localized but their behavior stays identical.

## 12. Accessibility / mobile / print QA

- At least 44×44 CSS pixel touch targets for frequent actions when practical; sufficient focus indicators and contrast; never color-only signaling.
- Actual `<label>` for inputs, correct table headers and live-region save/errors; role/dialog focus trap and Escape behavior; keyboard-accessible file/menu operations.
- Preserve input values when switching tabs, language and theme; no accidental form reset.
- Mobile sizes around 360px, 390px and tablet 768px; wide desktop; test zoom at 200%, long PO/styles and Bengali/Tamil wrapping.
- Empty/saving/error/offline states are designed, not left as developer exceptions.
- Prevent horizontal overflow of page itself while permitting deliberate scroll inside large table/timeline containers.
- Print reports use repeated headers and safe page breaks; color print optional but labels fully descriptive in monochrome.

## 13. Evidence-based UI acceptance walkthrough

- From `/login/`, login then App Centre → TNA; logo, menus, theme and language consistent with current VESA site.
- Create Quick TNA; leave some unknown fields; see `Needs Information` rather than false green dates.
- Confirm baseline; change approval delay; compare original/current/forecast/actual; inspect explanation.
- Switch to Bengali, Hindi and Tamil; entries and computations remain identical; no cropped buttons.
- Save; reload; Continue Last; Save Copy; Open valid/invalid copy; prove no data loss.
- Practice Example is unmistakable and cannot enter production dashboard unnoticed.
- Import Excel, review mapping, export Excel and all promised reports; verify in Excel/PDF viewers.
- Open mobile view, use menus, dates, keyboard/tab navigation and print preview.
- Trigger app behavior on unsupported share or blocked popup; visible fallback, not false success.

Every completed UX feature should have a screenshot or test trace in the progress tracker. Described UI elements are specifications, not proof they are already implemented.
