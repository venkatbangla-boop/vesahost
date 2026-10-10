# 01 — VESA TNA 360 Master Product Blueprint

**Product:** VESA TNA 360 — Universal Apparel Time & Action / Critical Path Management  
**Parent system:** VESA Enterprise Inc. website at `https://vesaent.com/`, login → App Centre → `/apps/tna/`  
**Repository:** `venkatbangla-boop/vesahost` (`main` currently the published default branch)  
**Status:** prepared specification for Codex implementation, not an authorization to deploy or a claim that the app exists.  
**Full delivery scope:** Phase 1 + Phase 2 + Phase 3, one cohesive implementation program. See execution tracker for evidence and remaining work.

## A. Product objective and non-negotiable outcomes

Replace fragmented spreadsheet follow-up with a practical apparel order-planning and execution workspace. It must enable a novice merchandiser to: (1) create a realistic TNA from an order and a suitable product template; (2) record who must act and by when; (3) see what is late, blocked or critical; (4) calculate likely shipment impact using explicit dependencies and validated inputs; (5) update progress; (6) save/reopen; (7) give an understandable buyer/factory/agent report; (8) track several orders; and, after secure backend is configured, (9) collaborate with authorized users on the same records.

**Not:** a static HTML table, generic project-management clone, opaque AI guesser, separate microsite, or a PPM/AQL copy. **Yes:** a garment-native, trustworthy, maintainable app whose scheduling output can be explained and reproduced.

### Success criteria

- User selects product/process/location calendar and enters PO, buyer, factory, style, quantity and shipment constraints; TNA template yields editable task set with clearly marked missing inputs.
- User can create, duplicate, edit, filter, group, search, validate, baseline, revise, save, recover, import/export and print a real order without losing records.
- Critical Path is driven by calculated dependencies and calendars, not by arbitrary red status or every overdue task. An overdue noncritical activity must remain distinct from a critical one.
- Baseline, approved/current target, forecast and actual dates are never collapsed into one field. Changes are audited, with reason and actor.
- Production and shipment estimates only appear when necessary inputs exist and are usable. Missing prerequisites yield `Needs Information` rather than confident-looking invented dates.
- Factory, buyer and sourcing-agent views use the same underlying records, with role-appropriate visibility and evidence.
- Existing `/login/`, `/apps/`, `/apps/ppm/`, `/apps/aql/` paths remain functional and visually coherent.
- Phase-3 cloud collaboration is claimed as LIVE only when authenticated infrastructure, access controls, end-to-end tests and user-authorized deployment exist.

## B. Personas and their daily jobs

| Persona | Main questions | Primary screen | Required actions |
|---|---|---|---|
| Factory merchandiser | What is due today; which approvals/materials are pending? | My Actions + TNA Planner | Update status, submission dates, comments, proof, owner, recovery |
| Factory planner / IE | Can the lines finish the balance on time? | Capacity & Production | Configure available lines, outputs, calendars, daily actuals and forecast |
| Commercial / materials | Are master/B2B LC and purchase milestones on schedule? | Materials & Commercial | Update milestones, supplier response, in-house and QC dates |
| Factory management | Which POs require management help? | Portfolio + Risks | Filter by factory, owner, late tasks and shipment confidence |
| Buyer/brand | Will goods ship on confirmed date? What do we need to approve? | Buyer Summary | Read permitted milestones, comments, approve/reject if authorized |
| Buying house/agent | Which factory/PO is at risk and who needs follow-up? | Portfolio + Critical Path | Manage cross-factory views, owner responsibility and evidence |
| Quality team | Can PPM and inspection proceed? | Quality / Readiness | Link verified PPM/AQL records; input relevant gate milestones |
| Shipping/logistics | Is booking/inspection/documents/ex-factory on time? | Shipment | Update booking, packing, ex-factory, ETD, document readiness |
| System admin | Who can access which buyer/factory records? | Administration (backend only) | Invite/disable users; scope rights; review security/audit events |

Permissions are actual backend-enforced rights in cloud mode. A browser-only "role view" is a presentation convenience, never security.

## C. Complete feature catalogue / traceability IDs

These IDs appear again in `06_EXECUTION_TRACKER.md`. No feature is silently excluded when an implementation group changes.

| ID | Capability | Outcome / acceptance surface |
|---|---|---|
| F01 | App Centre integration | App tile, consistent login/back navigation, route `/apps/tna/` |
| F02 | Welcome/Home | New TNA, Continue Last, Open Saved, Practice Example, Open Saved Copy, All Orders |
| F03 | Quick/Full/Import start | Simple guided creation and advanced fields, no form overload |
| F04 | Universal templates | Knits, woven, denim, sweaters, outerwear, activewear, intimate, kids, uniforms, custom |
| F05 | Conditional activities | Relevant operations only; custom additions and overrides |
| F06 | Order master | Buyer/factory/PO/style/qty/size/color/market/incoterms/ports/target dates |
| F07 | Baseline planning | Explicit freeze of original target with revision control |
| F08 | Forward scheduling | Start-side earliest feasible dates and prerequisites |
| F09 | Backward scheduling | Calculate latest feasible activity dates from contractual deadline |
| F10 | Working calendars | Weekly off, local holidays, shutdowns, optional per-activity calendars |
| F11 | CPM | Real critical dependencies, float, near-critical, negative float |
| F12 | Material / LC timeline | Master LC, supplier B2B LC, fabric/trims, import, test, in-house, hold |
| F13 | Approval tracker | Submit, revise, comments, responsible approval authority and evidence |
| F14 | Production capacity | Stage throughput, lines, efficiency/SMV mode, WIP, daily remaining forecast |
| F15 | Date/version history | Original/current/forecast/actual, changes, reasons, sign-off |
| F16 | Task dependencies | Multiple predecessors, lag, blockers, validation, parallel tasks |
| F17 | Daily follow-up | Today, overdue, next 7 days, pending buyer/factory/supplier actions |
| F18 | Risk explanation | Reasons/impact/constraints; no invented responsibility |
| F19 | Recovery alternatives | Capacity increase, overlap, resequencing, alternate resource, scenario compare |
| F20 | Shipment readiness | Quality/packing/booking/ship milestones with explicit gates |
| F21 | Split/partial shipment | Batch/quantity/date allocation with full quantity reconciliation |
| F22 | Portfolio | Many orders, buyer/factory/PO filtering, combined risks, own tasks |
| F23 | Department views | Merchandising, commercial, fabric, trim, cutting, sewing, QA, packing, shipping |
| F24 | Role views | Buyer, factory, agent, quality, management; verified permissions online |
| F25 | Gantt/timeline | Daily/weekly timeline, activity dependencies and calculated risk |
| F26 | Readable reports | Master, buyer, factory, critical, weekly, delay, capacity, readiness, multi-PO |
| F27 | Excel export/import | Versioned template, validated import preview/mapping, safe cell writing |
| F28 | PDF/print/share | Page-safe output, VESA branding, explanations, share fallback |
| F29 | Local storage | Autosave, explicit save, reopen, drafts, recovery snapshots |
| F30 | Backup portability | Download / Open Saved Copy, schema validation, safe migrations |
| F31 | Undo / controlled changes | Undo draft edits where practical; protected baseline and signed revisions |
| F32 | Search/filter/status | Fast find tasks by stage, owner, deadline, status, buyer, PO |
| F33 | Localization | English, Bengali, Hindi, Tamil UI/sentence translations, stable IDs |
| F34 | Appearance/responsiveness | Same VESA shell/themes, touch-friendly mobile/tablet/desktop |
| F35 | Practice mode | Representative sample order segregated from real production data |
| F36 | Alerts | In-app conditions immediately; email/web/push only if configured & authorized |
| F37 | Tenant-aware cloud model | Company/buyer/factory membership and order-level authorization |
| F38 | Live collaboration | Optimistic locking, audit trail, conflict handling, record change visibility |
| F39 | Approval invitations | Restricted reviewer access; true approval event with accountable actor |
| F40 | PPM/AQL references | Verified links/identity match; no automatic GO based on TNA status |
| F41 | Import compatibility | Excel TNA familiar workflows; no overwrite until mapping reviewed |
| F42 | Performance/offline | Quick startup, large TNA efficiency, no mandatory runtime network for local mode |
| F43 | Security/privacy | Safe import, escaping, no secrets client-side, backend auth checks |
| F44 | Documentation/help | Plain language explanations, tooltips, error recovery, no developer jargon |
| F45 | Test/release gates | Deterministic calculations, end-to-end reports, regression and release proof |
| F46 | Configurable reminders | Owner/timezone/date rules, deduplication, server delivery where available |
| F47 | Scenario history | What-if forks not altering the approved baseline until confirmed |
| F48 | Workload balance | Line/capacity conflicts among concurrently active orders; explain uncertainty |
| F49 | Integration contracts | Versioned API and event contracts; safe imports when other records are absent |
| F50 | Audit/retention | Who changed what and when; rights, exports, retention controls in cloud mode |

All 50 items are part of the overall scope. F37–F40, F46, F49, F50 require external infrastructure for honest online production delivery; local versions must not masquerade as multiuser.

## D. Primary user journeys

### Journey 1 — create a normal T-shirt TNA

New TNA → choose Knit T-shirt → enter buyer, factory, style, PO, quantity, sizes/colors and delivery target → select relevant print/embroidery/wash, imported/local fabric and production locations → configure calendars/lead times → see missing inputs → preview milestone graph and suggested dates → confirm original baseline → manage task updates → view actual vs forecast → export buyer report.

### Journey 2 — factory says 60 days from LC

Record negotiated `contractual lead time` **starting from actual/confirmed master LC opening**; capture the buyer's own ship date independently; record supplier B2B LCs separately; choose working or calendar-day basis explicitly; calculate permitted contract date and feasibility; show buyer date vs contract date discrepancy with evidence; mark uncertain estimates as unknown. Do not silently use PO date as LC opening date.

### Journey 3 — approvals routed through local or overseas office

Each approval stores reviewer party, approval authority, whether local Bangladesh office sign-off is permitted, submission date, agreed turnaround if known, response, comment rounds and approval evidence. If Mexico buyer approval is required, the planner must consider that timeline; user can replan only with authorization/evidence. Approval never becomes completed only because an expected date passed.

### Journey 4 — one material delays cutting

Fabric route, trims route and PP sample/PPM route run in parallel. Cutting depends on actually required gates. A late fabric task on a non-controlling route might not affect shipment; a late PP approval may. Display exact predecessor chain, affected downstream dates, number of days and possible recovery. No automatic "blame" assignment.

### Journey 5 — mid-production capacity drop

Factory updates completed units and new verified available capacity. Forecast recomputes remaining production days, downstream finishing/packing/inspection and target risk. Present alternatives as simulations; approving a change produces a new dated revision but never deletes baseline.

### Journey 6 — split shipment

Order quantity is split into shipment lots with separate capacity, packaging, inspection, ex-factory, ETD and possibly ETA. Partial completion must not mark entire order shipped. Quantity allocated to lots plus unallocated amount must reconcile to order quantity, with explicit permitted tolerances.

### Journey 7 — multi-factory buying office

User views all **authorized** factory orders; filters late shipments, owners awaiting action, next seven days; buyer report hides factory-private internal notes when policy says so. Cross-tenant data must never leak.

### Journey 8 — interrupted browser / VS Code work

TNA UI: autosave, manual Save, recover snapshots, Download Saved Copy, validate Open Saved Copy and restore without erasing a good record. Codex development: root `AGENTS.md` plus `06_EXECUTION_TRACKER.md` provide deterministic continuation across sessions and commits.

## E. Standard terms (must remain consistent)

- **TNA:** Time & Action milestones and supporting tasks.
- **Critical Path:** date-controlling chain through valid dependencies/calendars.
- **Float:** permitted delay without impact to constrained project completion, as calculated; zero/negative values require caveats.
- **Baseline:** confirmed historical original plan, immutable until explicitly versioned.
- **Current Target:** approved revised commitment/working target, not auto-forecast.
- **Forecast:** computation from current evidence; not an approval.
- **Actual:** evidenced observed start/end date.
- **Required Ex-Factory:** committed factory-release deadline, separate from ETD, ETA and customer DC delivery.
- **Blocker:** unfulfilled mandatory prerequisite or explicit hold.
- **Conditional:** applicable only after required data or reviewer confirmation; distinct from `Approved`.
- **N/A:** explicitly excluded by rule or user reason, never a quiet fallback for missing data.
- **Completion:** percentage based on documented quantity/activity progress policy; no automatic 100% based solely on calendar date.

## F. Nonfunctional standards

- Browser-first; no mandatory internet for previously installed local-capable app and basic work when browser storage/assets available. Never promise offline mode without service-worker/offline refresh tests.
- Human first: large touch targets, readable typography, keyboard support, screen-reader labels, low-clutter display, responsive tables/cards.
- Repeatable math: deterministic date calculations, stable locale/timezone interpretation, replayable test fixtures; no implicit working-day assumptions.
- Strong data integrity: validation, transactional saves, versioning, import preview, backup check, recovery fallback, partial-file failure handling.
- Performance: test with small (20–80 tasks), medium (~300), and large (~2,000 tasks) orders/portfolios; measure rather than claim arbitrary performance. Virtualize grids if needed.
- Tenant/security: browser-local login only guards navigation, not a secure API; prohibit cross-company rights without a server-backed identity and authorization system.
- Easy audit: every risk label should have an explanation, inputs and source activity references.

## G. Explicit exclusions / blockers, not missing features

These are not permission to skip the scope:

1. **No invented factory performance or buyer standards:** user must enter or import real, explicitly sourced values.
2. **No fake integration:** unconfigured email/WhatsApp, buyer portal, cloud SSO, shipping/carrier or PPM/AQL APIs remain visibly not connected with tested adapter contracts.
3. **No premature production deployment:** feature branch, verified acceptance, security review and explicit user release instruction.
4. **No forced single cloud vendor:** select/provision provider with user consent; write provider-independent domain contracts first.
5. **No audit erasure:** expected dates and revision reasons are part of the permanent activity history.

## H. Documents, ownership and precedence

`AGENTS.md` sets execution rules; this file sets what to build; `02` defines allowable data/workflows; `03` defines calculations; `04` defines visible behavior; `05` sets technical/security boundaries; `06` tracks proven completion. If a contradiction appears, log the precise conflict in `06`, preserve existing functionality, and resolve the contract before editing affected code. Never invent a missing requirement and mark it approved.
