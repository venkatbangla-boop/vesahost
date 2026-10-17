# APP-08 Factory & Vendor 360 — Execution Tracker

## 2026-10-17 — M2 Chromium local workflow accepted; M3 patch group scope locked

**M2 verdict: ACCEPTED for synthetic browser-local workflow, NOT commercial/buyer compliance.** Accepted commit `d7827c33841bf0732fe201b4acd25c36c08d11ba`; [independent GitHub Actions #39024684663 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39024684663). Node checks for local store, checksum/corrupt/oversize copies, isolation by user, duplicate/older revision refusal, domain, existing Production/Shipment/Fabric/Sampling/LC/PO/Packing/Commission/TechPack/TNA/PPM/AQL passed. Actual Chromium created synthetic vendor, factory site, date-only expired certificate, independently sourced capacity, internal review and performance, showed no approved certification, rejected duplicate site atomically, saved/reopened/downloaded/restored separately, rejected tampered portable copy with no writes, switched EN/BN/HI/TA without business-data changes, tested 320/360/390/640/768/1024/1280/1440 viewport widths and keyboard Escape focus; zero outside requests. CI #39024565518 initially failed because the browser script looked for an edit button on the Documents tab instead of Onboarding; test-only correction passed full run. No Factory App Centre link or public release yet.

**M3 objective:** safe source-only factory/vendor profile, capability comparison, certificate date/expiry register, internal onboarding pending list and period-specific performance export, plus optional manually reviewed typed read-only PO/Production references. No self-certified compliance, no assumed capacity allocation, no transformation of Production actuals or PO master. Source docs remain frozen.

**M3 exact file-level scope / dependency and state map:**
- `apps/factory-vendor/src/domain/reviewed-reference.js` NEW: typed bounded JSON ref validation and duplicate/identity mismatch guards; only called by Factory controller + Factory profile validator. Optional `manualReferences` append-only source snapshots, not source app authority.
- `apps/factory-vendor/src/reports/report-model.js` NEW: pure escaped HTML and safe workbook table rows, source date states/as-of, declared capacities as `DECLARED ONLY`, period denominator metrics and date-only expiration alerts; no business state mutation.
- `apps/factory-vendor/src/domain/vendor-profile.js` WATCHED/M3 IN SCOPE only to validate optional `manualReferences`, preserving previously created source-only records.
- `apps/factory-vendor/index.html` IN SCOPE loads approved locally bundled XLSX runtime and new reference/report modules.
- `apps/factory-vendor/src/application/workspace-controller.js` IN SCOPE adds manual source file selection/local reviewer, read-only list, Prepare Report/Download Excel/Print Save PDF and safe independent local reference handling.
- `apps/factory-vendor/src/i18n/app-copy.js`, `assets/factory-vendor.css` IN SCOPE only localized labels and print semantics.
- `apps/factory-vendor/tests/report-reference.test.cjs`, `tests/browser-workflow.cjs`, `.github/workflows/factory-vendor.yml` IN SCOPE to prove malformed/tampered/oversized reference rejects, legacy .vesavendor backward compatibility, numeric Excel/formula injection, date-only document alerts, typed read-only PO/Production refs, browser PDF, regression and zero hidden network.
- `docs/factory-vendor/01_EXECUTION_TRACKER.md` IN SCOPE updated with exact patch tests, SHA and NEXT.

**FROZEN:** Other completed applications including Production/TNA/PPM/AQL, original `blueprints/`, `docs/portfolio/`, global `js/vesa-workspace-shell.js`/preferences/auth/catalogue, `service-worker.js`, user saved record keys and JSON exports. Optional reference field is backward-compatible: existing data without it continues to validate and restore. Do NOT require real factory names, employee contact data or accreditation. All new source-only evidence must be locally reviewed by an explicit human-labelled reviewer and never claim official approval.

**Proof/rollback gate:** Node source + report tests, real Chromium Save/Open/reference/Excel/PDF/4 languages/responsive, all sibling baselines, no global headers added. Revert M3 commits if CI fails. M3 accepted only by independent PASS at exact SHA; M4 separate App Centre/Pages/public-source verification conditional personal demo only.

**PRECISE NEXT ACTION:** Implement this M3 patch, run GitHub CI, accept or repair; then audit/apply M4 release integration without asking to reattach 15-app ZIP.

---

## 2026-10-17 — M1 source-only Factory engine VERIFIED

**M1 accepted for isolated pure-domain technical scope.** Exact feature code `011f87c218daf7017b121d6ec2d815e61598380f`; [actual GitHub Actions #39024016996 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39024016996). Pure `apps/factory-vendor/src/domain/vendor-profile.js`, `certification-evidence.js`, `capability-matcher.js`, and `tests/domain.test.cjs` implemented: sourced site identity, category/site monthly *declared* capacity and MOQ/lead documents, source document issuer/dates/expiry comparisons, internal-only onboarding reviews, historical performance periods with sourced numerator/denominator and immutable audit revisions. Synthetic tests reject duplicate sites/documents, missing or unmatched site/capacity source, expired evidence masquerading as compliance, fake certification outcomes, invalid dates or unmatched performance ratios. Original 15-blueprint integrity, Production/Shipment/Fabric/Sampling/LC/PO/Packing/Commission/TechPack/TNA/PPM/AQL and shared-shell Node baselines passed. No public app route, certificate authority, personal contact data or business production claim.

**M2 bounded scope and precise NEXT:** `apps/factory-vendor/index.html`, `assets/factory-vendor.css`, `src/bootstrap.js`, `src/application/workspace-controller.js`, `src/data/local-record-port.js`, `src/data/saved-copy-codec.js`, `src/i18n/app-copy.js`, `tests/save-reopen.test.cjs`, `tests/browser-workflow.cjs`, `.github/workflows/factory-vendor.yml` and this tracker only. Read original `blueprints/APP-08_factory-vendor.md`. Use ONE shared VESA shell, 4 language labels, browser-local scoped vendor records, versioned portable saved copies, synthetic practice, no real private contacts, no external calls, no catalogue registration until M4. Actual Chromium must verify site/capability/cert/review and Save/Open/corrupt-copy atomicity plus 320–1440 responsive. Roll back only M2 if failed; previous M1 domain, legacy apps and original blueprints remain frozen. No buyer/factory accreditation criteria invented; expired/inside-period date result is never authority verification. M3 will own draft reports/Excel/PDF and local typed refs; M4 final gates before personal demo.

---

## 2026-10-17 — M0 ORIGINAL BLUEPRINT AND REPOSITORY AUDIT

**Objective and accepted baseline:** Continue canonical rank-10 APP-08 from original, immutable `blueprints/APP-08_factory-vendor.md` in live `main` `ec0728ce30a8d33b1579488846ec9600fbc2797c`. Previous Production Tracker release source `2b060a027776ee7ab7a2355ed8f1ca493529a0cf`, final Pages/live source CI #39023609518/#39023609761 SUCCESS. This branch, `feature/factory-vendor-360`, was created from the latest main tracker commit. Never restart or modify other completed apps. Root `AGENTS.md`, `VESA_RESUME_PROMPT.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/portfolio/05_TEST_AND_ACCEPTANCE_STANDARD.md` are controlling.

**Observed source:** GitHub apps root has no `apps/factory-vendor/`; branch-scoped source search shows no `vesa.factory-vendor.records.v1` key. Verified `templates/vesa-next-app/README.md` is reference-only and cannot be published as a placeholder. Inspected existing Production daily-output ledger and separate app storage ownership; Factory must not calculate actual production or read any sibling localStorage. The original blueprint exists in committed repository; no ZIP upload needed.

### Exact file ownership and dependency matrix

| File or group | Owner / caller and callee / state | Scope and risk |
|---|---|---|
| `blueprints/APP-08_factory-vendor.md` and `docs/portfolio/*` | Frozen user-approved requirements and original SHA256 manifest | **FROZEN**, read-only provenance |
| `js/vesa-workspace-shell.js`, `css/vesa-workspace.css`, `js/auth.js` | Shared menu/account; later APP-08 adapter delegates to shell | **FROZEN**; do not implement another header |
| `apps/production-tracker/src/domain/daily-output-ledger.js` | Owns actual stage/shift output; may consume only independently reviewed vendor ID reference | **FROZEN**; never convert factory claimed capacity into verified output |
| `apps/ppm/`, `apps/aql/`, `apps/tna/`, all eight prior portfolio apps, Costing | Previous data, approvals, quality and TNA ownership | **FROZEN**; no sibling local storage access |
| `templates/vesa-next-app/*` | Startup platform examples only | **WATCHED**, do not publish or mutate |
| `apps/factory-vendor/src/domain/vendor-profile.js` | New immutable vendor/site/capability/review records and revisions, no DOM | **M1 IN SCOPE**; pure entry validation and no real contacts |
| `apps/factory-vendor/src/domain/certification-evidence.js` | New source-only issue/expiry document state, not a certification authority | **M1 IN SCOPE**; reject invented BSCI/WRAP/ISO approval |
| `apps/factory-vendor/src/domain/capability-matcher.js` | New site/category/source capacity matching; comparison is not eligibility approval | **M1 IN SCOPE** |
| `apps/factory-vendor/tests/domain.test.cjs` | Synthetic deterministic tests and mutated-source atomic failure | **M1 IN SCOPE** |
| `.github/workflows/factory-vendor.yml` | New gated Node domain/legacy sibling CI on feature branch | **M1 IN SCOPE** |
| `docs/factory-vendor/01_EXECUTION_TRACKER.md` | Current evidence, last accepted SHA, precise NEXT ACTION | **M0/M1 IN SCOPE** |

### Dependency/call/state path

Future one-header UI → factory-vendor controller → pure `VendorProfile` / `CertificationEvidence` / `CapabilityMatcher` → future app-only saved-copy port → browser-local records and draft reports. No remote provider, buyer contacts, real private factory names or credentials in git. Independent reports may show declared quantities with source, date and product/site basis but must never imply guaranteed production capacity. Certificate dates/issuers are evidence, not certification: expired/unknown means no positive compliance assertion. Onboarding is INTERNAL REVIEW, never buyer acceptance or PPM GO.

### M0 verdict / reversible M1 patch plan

**M0 verdict: accepted for architecture and file-level scope.** Unresolved actual approval criteria, unit-specific capacity, certificate authority and personal data retention remain **PENDING / Needs Information**. M1 may implement source-only declared facts and dated evidence without claiming approval.

**M1 patch group:** exactly the three proposed pure domain files, one app-specific Node test, one feature CI and this tracker. Implement versioned vendor record with site scope, duplicate site guards, certified-date evaluation (date status only), capability category/units + declared capacity from documented source, onboarding review history, typed period/denominator metrics. Disallow unsupported numeric conversions, missing source and unsigned approval; reject errors atomically, keep history. Run canonical `node tests/vesa-blueprint-integrity.cjs`, Factory domain tests, all current Production, Shipment, Fabric, Sampling, LC, PO, Packing, Commission, Tech Pack, TNA, PPM, AQL and shared shell baseline tests. Do not register App Centre, static public route, service worker, local storage or print UI in M1.

**Rollback:** revert only M1 feature commits; existing main/source contracts unchanged. M1 accept only on independent successful GitHub CI.

**PRECISE NEXT ACTION:** Write/test M1 new pure domain modules on `feature/factory-vendor-360`, push and verify actual CI. Then M2 app-local UI/storage/4 languages, M3 reports/source refs, M4 Chromium/sibling + conditional synthetic personal-demo release. Auto-advance without requesting original ZIP again.
