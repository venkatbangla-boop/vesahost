# APP-08 Factory & Vendor 360 — Execution Tracker

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
