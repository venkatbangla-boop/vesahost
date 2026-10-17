# VESA 360 — G4-W2 four-app UX releases and W3 continuation

**Verified date:** 2026-10-18. **Live application source:** `main` `818e4e0e6d71eb17e94ad6572d70d369adc7d8e0`. Public personal non-commercial synthetic-only demos: bank/buyer/QA/factory actions require independently supplied evidence. Current human UAT remains **1 PASS / 0 FAIL / 48 NOT TESTED**.

## Production architecture and scope

All new G4 changes reuse existing shared VESA shell and actual domain sections; none creates a new app, record schema, calculation or approval. New Home task cards instantiate the existing app-specific **read-only, fictional** practice fixture without storing buyer/bank/material/PO records. Four languages EN/BN/HI/TA; desktop/mobile 320/390/1440 real Chromium checks, 44px touch buttons and no page overflow. Root worker version changes only the cache namespace, preserving the corporate homepage.

| Application | Existing real workflow sections exposed | Original business owners unchanged | Feature CI |
|---|---|---|---|
| Purchase Order 360 | 7: summary, lines, buyer/factory, amendments, shipment/cancel, revisions, reports | `PurchaseOrderEngine/Store/Report` | [#39068429131 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068429131) |
| LC & Payment 360 | 9: summary, sourced terms, dated events, amendments, payment obligations, documents, settlements, charges, reports | `LCPolicyEngine` maturity, calendar, FX, settlement, `LCStore`, `LCReport` | [#39068957410 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068957410) |
| Sampling & Approval 360 | 7: summary, buyer categories, rounds, decisions, revisions, exceptions, reports | `SamplingEngine` explicit buyer decisions and stale revisions; independent `SamplingStore/Reports` | [#39069243357 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069243357) |
| Fabric & Trims 360 | 9: summary, materials, BOM requirements, supplier bookings, goods receipts/QC, allocations, reservations, exceptions, reports | `MaterialEngine` approved lot/shade QC, exact units, wastage/consumption, shortage and material store/reports | [#39069599067 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069599067) |

G4 first three app releases from W1 and Costing 360 remain valid. Costing's initial asynchronous workbook toast issue was resolved in a strict test-only follow-up `5db69c8d`. A later nondeterministic keyboard Enter assertion required waiting for the *actual native dialog* to open and Escape to close; no simulated click or bypass was introduced. The eventual correction is in `818e4e0e` together with the Fabric patch. [Independent feature Costing Chromium #39069599077 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069599077). Original Costing engine, XLSX, report and storage unchanged.

## Final independent main and public evidence

- `main` app-source commit `818e4e0e6d71eb17e94ad6572d70d369adc7d8e0`.
- Native app and sibling CI verified **SUCCESS**: [Fabric #39069704880](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704880), [Costing #39069704601](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704601), [Sampling #39069704619](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704619), [LC #39069704628](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704628), [PO #39069704755](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704755). Read-only practices did not store buyer decisions or goods receipts. Original source-backed Excel/PDF/print/save/reopen tests were retained.
- [GitHub Pages build/deploy #39069704546 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704546); [served public exact HTML-byte smoke #39069704632 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39069704632). This is a verified static personal demo, not permission or evidence for commercial SaaS or real customer records.
- Prior isolated app code commits: Purchase Order `89c6a138`, LC `878c2b16`, Sampling `76f4d4b6`, Fabric source `fa92192e`; final combined Fabric/Costing test correction `818e4e0e`. Source/app stages were audited before changes. Original `blueprints/APP-01..15`, integrity manifest, root `index.html`, `css/style.css`, `js/main.js`, assets and homepage not changed.

## Rollback, release limitation and next owner

Rollback by reverting only the app-owned guided workflow/CSS/locale/test deltas plus the matching root cache identity after a compatibility check. Never clear historical browser records. Local login and saved copies are not server-side security or cloud synchronization. No human buyer/bank/factory QA approval, test data are fictional; no supply lead times or business rules inferred.

**NEXT UNFINISHED: G4-W3 Production Tracker 360.** Review the actual main source, the immutable APP-09 blueprint, original daily output/WIP/capacity/delay/report/backups and real `apps/production-tracker/tests/browser-workflow.cjs`. First audit open-screen 7-section navigation, show one proven source-backed UX improvement (not arithmetic expansion), check desktop/mobile 320/390/1440, EN/BN/HI/TA, daily stage balances, historic sources, Excel/PDF, legacy saved copies and sibling regression. Then Shipment/Documentation, Factory/Vendor, Label/Artwork, W4, G5. Do not rebuild W1/W2 or copy AQL bulk as a fake feature benchmark.
