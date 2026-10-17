# VESA 360 - Consolidated Roadmap for 15 Additional Applications

## Executive decision

Build a **single-repository, domain-first, browser-only modular web application suite** behind the existing VESA App Centre. Keep existing TNA, PPM, AQL and their frozen behaviors intact. **Costing 360 is tracked separately** using its existing handover and is NOT one of the 15 apps in this plan.

The objective is to reduce repeated Excel/email work without creating 15 conflicting masters for buyer, order, price, inspection or shipment data. Phased execution is favored over a single enormous Codex build.

## A. Existing / proposed portfolio

| Layer | Current verified or proposed scope | Rule |
|---|---|---|
| Existing foundation | `login/`, `apps/` App Centre, `admin/`, `js/vesa-workspace-shell.js`, `css/vesa-workspace.css` | Reuse only ONE shared top header/menus. No new central auth service. |
| Existing business app | TNA 360 | Owns scheduling, calendar/critical path, milestones and planning order state; don't mutate formulas. |
| Existing business app | PPM 360 | Owns 168 checkpoints, meeting approvals, GO/HOLD and evidence; don't infer approvals. |
| Existing business app | AQL 360 | Owns inspection, sampling/Ac-Re, AR11 random/manual carton selection and quality records. |
| Separately specified | Costing 360 | Owns complete garment cost/FOB costing; use provided external costing handover, not a duplicate from this roadmap. |
| This package | Fifteen proposed apps | Each has an isolated domain, typed readonly references and browser-local records. |

**Portfolio planning baseline (2026-10-14):** `main=3217e2d`, `feature/tna360-continuous=e3f4851`, `298 ahead / 0 behind`. This is a source audit snapshot, not a deployment claim; local Codex MUST verify actual state before use.

## B. Prioritized app catalogue

| Rank | ID | App name | Wave | Relative complexity | Canonical responsibility |
|---:|---|---|---|---|---|
|  1 | APP-01 | Packing & Container 360 | W1 | L | Cartonization plans, pack configurations, pallet/container space planning and calculated loading scenarios |
|  2 | APP-02 | Order & Commission 360 | W1 | M | Agent/trading office commission agreements, accrual/earned balances, invoices and commission collections against verified order values |
|  3 | APP-03 | Tech Pack & Spec 360 | W1 | L | Versioned garment specification, POM definitions, size grading, tolerance, BOM references and change comparison |
|  4 | APP-13 | Purchase Order 360 | W2 | L | Version-controlled PO commercial quantities, style/colour/size allocations, official amendments and buyer/factory order references |
|  5 | APP-05 | LC & Payment 360 | W2 | L | Documentary credit references, payment obligations, maturity calculations from explicit terms, settlement events and exceptions |
|  6 | APP-04 | Sampling & Approval 360 | W2 | M | Submission rounds, sample schedules, comments, request-for-revision and explicit source-backed buyer/factory approvals |
|  7 | APP-06 | Fabric & Trims 360 | W2 | L | Material BOM demand, purchase/booking references, inbound receipt, allocations, shortages and material-readiness evidence |
|  8 | APP-07 | Shipment & Documentation 360 | W3 | L | Draft shipment file, packing list and commercial/shipping document preparation, document status and quantity reconciliation |
|  9 | APP-09 | Production Tracker 360 | W3 | L | Daily stage-specific output, WIP, line capacity actuals, rework and shortfall explanations |
| 10 | APP-08 | Factory & Vendor 360 | W3 | M | Factory/supplier identity records, declared capability/capacity, audit-document evidence, onboarding status and performance snapshots |
| 11 | APP-10 | Label & Artwork Approval 360 | W3 | M | Controlled versions and review state for product labels, care/size labels, barcode artwork, print and embroidery files |
| 12 | APP-11 | Buyer CRM 360 | W4 | M | Buyer organization profiles, contacts, enquiry/opportunity stages and owner-controlled follow-up activities |
| 13 | APP-12 | Fabric & Supplier Comparison 360 | W4 | M | Sourced material supplier offers and a comparable, provenance-rich landed-input comparison, without automatically selecting vendor |
| 14 | APP-14 | Claims & Disputes 360 | W4 | M | Commercial/quality/short-shipment case records, requests, evidence and explicit settlement/rejection history |
| 15 | APP-15 | Product Development 360 | W4 | M | Style concepts, seasonal capsules, design boards, colourways, material direction and proposal-stage revision history |

Ranks indicate proposed order of work, **not** number of days or a warranty of completion. W1 is immediately valuable even before the full platform exists; W2 provides upstream order/material/approval records; W3 adds production/shipping/vendor detail; W4 is broader management and intelligence.

### W1 - High-impact working tools

1. **APP-01 Packing & Container 360:** actual carton dimensions, assortment, CBM, shipment loading estimates; no invented container capacity.
2. **APP-02 Order & Commission 360:** contract-based commission (e.g. 2/3/4 percent only when entered), earned vs invoiced vs received; no duplicate PO master.
3. **APP-03 Tech Pack & Spec 360:** accurate POM/grading/tolerance, revision history; no universal grading guesses.

### W2 - Material/financial/approval controls

4. **APP-13 Purchase Order 360:** canonical versioned commercial PO source once designed/migrated; do not alter existing TNA plan order silently.
5. **APP-05 LC & Payment 360:** LC obligations, B2B/fabric LC, maturity and documentation; no bank API.
6. **APP-04 Sampling & Approval 360:** actual submitted/approved/rejected sample records; TNA/PPM reference-only.
7. **APP-06 Fabric & Trims 360:** requirements, orders, receipts, allocations and shortages; independent of Costing.

### W3 - Factory execution and shipping documentation

8. **APP-07 Shipment & Documentation 360:** document/packing/shipping reconciliation; Packing owns cartonization.
9. **APP-09 Production Tracker 360:** daily stage output and WIP; TNA still owns planned milestones.
10. **APP-08 Factory & Vendor 360:** factory capabilities/certificates are sourced declarations until verified.
11. **APP-10 Label & Artwork Approval 360:** versioned artwork/label reviews; no regulatory approval inferred.

### W4 - Business development / selection / claims

12. **APP-11 Buyer CRM 360:** buyer contacts, enquiries and local follow-up; privacy-sensitive.
13. **APP-12 Fabric & Supplier Comparison 360:** supplier rate/provenance comparison, not a second Costing engine.
14. **APP-14 Claims & Disputes 360:** claim/evidence/settlement cases; AQL result immutable.
15. **APP-15 Product Development 360:** product proposals and boards; Tech Pack owns actual garment specification.

## C. What should remain in the existing applications instead of being rebuilt?

- TNA keeps critical-path calculations, planned material milestones, LC dates as status references and order scheduling; do not add a second TNA timeline in another app.
- PPM keeps preproduction meeting checklists and GO/HOLD logic; sample approval app only supplies a documented reference.
- AQL keeps sampling plans/Ac-Re, all inspection decisions, AR11 internal-uniform/manual/combined carton selection, CAPA and source quality evidence; do not relocate these into Packing/Claims.
- Costing 360 keeps garment fabric consumption, cost sheets, FOB and margin calculations; Fabric Supplier Comparison supplies a selected/approved material-offer snapshot only.
- Existing common shell owns theme, language, authentication-convenience UI, menus and App Centre registration. No app may render a second top-level VESA header.

## D. Business benefit vs implementation risk

| Theme | Value hypothesis | Main implementation risk |
|---|---|---|
| Packing/CBM | Removes repeated manual carton/container Excel work | Real loadability depends on verified interior dimensions, pallets, stacking and weight |
| Commission | Makes expected/paid/outstanding more visible | Different commission contracts and payment evidence cannot be invented |
| Tech pack | Consistent measurement sheets and grading | POM basis, plus-size and tolerances vary by buyer/style |
| LC | Helps track documentary obligations and dates | Bank term conventions and authority are source-dependent |
| Vendor | Consolidates supplier profile and expiry documents | Certification is not established by a file name or typed claim |
| CRM | Tracks buyer opportunities locally | Public GitHub and browser-only data model are unsuitable for confidential production data |

## E. Definition of complete for every proposed app

An application is not counted as implemented merely because a README, feature flag or `apps/<slug>/index.html` exists. It must have:

1. Exact accepted domain scope and canonical record ownership.
2. Source-backed requirements and resolved calculation policies for enabled workflows.
3. Tested pure calculations, validation/negative fixtures and no guessed values.
4. Reusable VESA UI shell, four-language guidance, visible state and mobile keyboard behavior.
5. Versioned, isolated browser-local records and fail-closed saved-copy restoration.
6. At least one end-to-end representative workflow, locally generated report and automated browser proof.
7. Scoped regression and no drift in TNA/PPM/AQL/Costing/other app contracts.
8. A clear handoff: exact Git/test SHA, locally verified vs user untested, known limits, rollback and optional separately authorized personal-demo release.

See the 15 app-specific `blueprints/` files for detailed field, state, business-rule and test requirements.