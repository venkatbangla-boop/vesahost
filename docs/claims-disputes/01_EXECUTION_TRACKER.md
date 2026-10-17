# APP-14 Claims & Disputes 360 — Execution Tracker

## 2026-10-17 — M1 PURE-DOMAIN ACCEPTED; M2 LOCAL BROWSER WORKSPACE PATCH LOCK

**M1 verdict: ACCEPTED only for synthetic source-bound pure claims/settlement engines.** Exact code `2d2272bee941c15d1c309384f480924f2aa7463a`, [independent Node/blueprint/all frozen app CI #39041474256 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39041474256). Source-only ClaimRegister/Exposure/SettlementHistory assert no automatic AQL rewrite, liability admission, buyer acceptance, bank payment or auto-closed claims. Exact currency-by-currency alleged value; unknown separated; drafted credit not settled; local agreement + source-reviewed partial receipt leaves balance and case unchanged. No new public route, no real buyer/private data.

### M2 single controlled patch and directly inspected caller/state map

**Baseline ownership:** original APP-14 technical blueprint, `js/vesa-workspace-shell.js` and shared UI contract reviewed; directly inspected `apps/fabric-supplier-comparison/index.html`, `src/bootstrap.js`, `src/data/local-record-port.js`, `src/data/saved-copy-codec.js`, `tests/browser-workflow.cjs`. APP-12 is FROZEN reference precedent. UI uses existing one VESA global header/menu; only app-specific source and status sections. Browser-auth convenience is NOT server authentication. No private AQL/PO/Shipment/LC/Commission storage read.

**M2 EXACT files:** NEW `apps/claims-disputes/index.html`, `assets/claims-disputes.css`, `src/bootstrap.js`, `src/application/workspace-controller.js`, `src/data/local-record-port.js`, `src/data/saved-copy-codec.js`, `src/i18n/app-copy.js`, `tests/save-reopen.test.cjs`, `tests/browser-workflow.cjs`; MODIFY ONLY `.github/workflows/claims-disputes.yml` and this tracker. No changes to M1 pure calculations, root catalogue/prefs/shared shell/service worker or siblings.

**Dependency and data flow:** global VESA shell/auth/menu → app-only controller → APP-14 three independently tested pure domains → `vesa.claims-disputes.records.v1.` browser-only local store and v1 portable checksummed copies; app-owned DOM pages case header, findings/claimed source, read-only evidence, correspondence, agreement, draft credit vs receipt, human explicit case decision, history, practice. All user-sourced, no external messages, no automatic bank/legal/QA approval; sensitive real data must not be entered for synthetic demo. Reports/Excel/PDF and typed reviewed sibling snapshots postponed to M3.

**Verification:** Node local device identity isolation, old-revision overwrite refusal, forged/oversize/corrupt portable copy atomic rejection and separate copy restore. Real GitHub Chromium creates synthetic case, two alleged findings, documented/unknown currency, AQL reference source, supplier dispute, agreement/draft/partial receipt, checks no automatic closure; local saved copies/restore, EN/BN/HI/TA, focus/keyboard/mobiles 320–1440 and zero external requests. Repeat 15-original manifest and complete all old-app regressions. **Rollback:** revert M2 app-only files without touching frozen apps or existing browser copies. **M2 acceptance:** independent GitHub CI must PASS at specific SHA, never inferred.

**CURRENT NEXT ACTION:** implement and push exact M2 scope; then prove Chromium/Node. After accepted, separately lock M3 draft case reports and typed reviewed evidence sources.

---

## 2026-10-17 — M0 original blueprint/source audit and bounded M1 scope

**Baseline:** verified APP-12 personal-demo main `9275e7852edc4bb14cbfb4162817c25223a57fd0` (release code `fb4a4e75145322d7994a515b416f9364e70a1e4d`, live Pages/byte CI PASS). Original frozen `blueprints/APP-14_claims-disputes.md` W4 priority **14/15** (APP-13 Purchase Order was already completed). Branch `feature/claims-disputes-360` created at baseline only after confirming no earlier feature branch, folder or `vesa.claims-disputes.records.v1` code hits. No need for owner to reattach ZIP; all 15 original plans and sha manifest are committed.

**Mandatory policy:** read `AGENTS.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` and APP-14 original. Records are source-only, non-commercial synthetic demos, browser-local, no server, legal or bank settlement services.

### File-level audit and ownership/caller/state map

| Exact repository file | Role, direction, touched state, risk/class |
|---|---|
| `blueprints/APP-14_claims-disputes.md`, `docs/portfolio/*`, `AGENTS.md` | Canonical unmodified requirements/ownership. **FROZEN**. |
| `apps/aql/index.html` (11.8 MB single file), `apps/aql/tests/a-g09-cross-app-boundaries.cjs`, `apps/aql/ENGINEERING.md` | AQL owns the original inspection result, selected cartons and report references. AQL source is too large for GitHub contents API direct text retrieval; separately inspected actual A-G09 assertions and module engineering policies. Claims never reads/modifies AQL private browser stores or overwrites inspection outcome. **FROZEN**. |
| `apps/shipment-documentation/src/domain/shipment-engine.js` | Shipment owner of dispatch, invoice/carton reconciliations and draft shipping evidence. Claims will accept later manually selected read-only source proof only. Never modify shipping ledger. **FROZEN**. |
| `apps/purchase-order/index.html` | Commercial PO revisions and quantities owned by PO; claims cannot amend or declare a signed buyer order from an alleged deficiency. **FROZEN**. |
| `apps/order-commission/index.html`, `apps/lc-payment/index.html` | Commission and banking/payment state separately owned; Claims cannot register bank settlement as booked accounting receipt without locally reviewed actual source. **FROZEN**. |
| `js/auth.js`, `js/vesa-workspace-shell.js`, `css/vesa-workspace.css`, `templates/vesa-next-app/README.md` | Future single global app header and local browser data precedent. **WATCHED** only (not M1). |
| `apps/claims-disputes/src/domain/claim-register.js` | **NEW M1** source-only case header, allegation finding/evidence/response, dated human decisions and append-only immutable provenance. No automatic admission/PO rewrite. Pure JS, no DOM/localStorage. |
| `apps/claims-disputes/src/domain/exposure-ledger.js` | **NEW M1** exact BigInt cents: sourced alleged claim lines by exact currency only; unknowns separated; not a liability, revenue, receipt or FX estimate. |
| `apps/claims-disputes/src/domain/settlement-history.js` | **NEW M1** explicit dated externally claimed agreement source and locally source-reviewed actual receipt; separate proposed credit note; partial balance never auto closes a case. No legal/banking certification. |
| `apps/claims-disputes/tests/domain.test.cjs` | **NEW M1** synthetic no mutation, missing evidence, multiple currencies, disputed/agreed separation, no AQL edits, partial settlement and no hidden confirmation. |
| `.github/workflows/claims-disputes.yml` | **NEW M1** Actions original 15-blueprint + pure Node + all sibling regressions. No public route in M1. |
| `docs/claims-disputes/01_EXECUTION_TRACKER.md` | This exact scope and later externally independently verified SHA/test evidence and NEXT ACTION. |

**Call and dependency direction M1:** future global VESA shell → Claims-only controller → pure `ClaimRegister` /`ClaimExposure`/`ClaimSettlementHistory` → later versioned Claims-only browser storage and draft reports. Other app integration **manual read-only typed source**, not current private sibling localStorage. AQL inspection/Shipment/PO/LC ledger remain their original source owners. No auto supplier/buyer correspondence, legal advice, actual bank credit, buyer rejection approval or carrier/QA release.

**Scope/gate:** M0 verdict **ACCEPTED for bounded M1 domain-only patch**. User-specific authority to agree/reject/close, sign settlement, value foreign currency, decide liability or confirm payment remains `Needs Information`. Build only explicit local source-labelled claims and human-entered documentary authority claims, not third-party verified statements. Enforce open/in-review/agreed/rejected/closed only through append-only dated source events, never due-date/AQL inference. M1 exact files are 3 new domains + 1 test + feature CI + this tracker, nothing else. Rollback by reverting M1 feature-only commits; main and all existing saved browser records untouched. Verification independent GitHub CI (synthetic exact positive/negative arithmetic, date/spec/source/immutable event guards and comprehensive earlier tests) must succeed before M1 acceptance.

**PRECISE NEXT ACTION:** implement M1 source-domain, run independent CI at exact GitHub SHA; if accepted, audit and lock M2 single-shell four-language local Save/Open and real Chromium; M3 explicit reviewed references, draft report/Excel/PDF; M4 conditional personal noncommercial demo with actual public byte check. Never request missing ZIP again.
