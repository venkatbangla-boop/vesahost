# APP-11 Buyer CRM 360 — Execution Tracker

## 2026-10-17 — M0 original blueprint/source/privacy audit

**Repository baseline:** current `main` `4bb14c7892624379db6381deebf633aca05c501e`, immediately after independently verified APP-10 personal-demo Pages + source bytes. Dedicated feature `feature/buyer-crm-360` created from this exact head. Original approved source `blueprints/APP-11_buyer-crm.md` priority 12/15 W4; `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `AGENTS.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` and `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` inspected. Live repo had **no** `apps/buyer-crm/` and code search found no `vesa.buyer-crm.records.v1` key; do not restart/overwrite a prior CRM.

**Ownership and data flow:** Buyer CRM owns local organization, optional privately entered contacts, source-labelled enquiries and non-authoritative opportunities plus on-screen follow-up tasks. Costing alone owns quotations/margins/FOB; Purchase Order owns binding buyer PO revisions; Product Development owns proposals; TNA owns critical dates; external email/SMS/data-sync providers are out of scope. An enquiry/opportunity must NOT become a confirmed PO based on its stage. Contacts entered here are browser-local (later), **not securely stored server-side**. No private real contacts or commercial buyers in public tests or git.

### Exact M1 file impact / caller-callee-state map

| File / module | Actual owner, dependencies, state, risk and classification |
|---|---|
| `blueprints/APP-11_buyer-crm.md`, `docs/portfolio/*`, `AGENTS.md` | Original immutable approved requirements, authoritative scope. **FROZEN**, read-only. |
| `apps/factory-vendor/src/domain/vendor-profile.js` and `src/data/local-record-port.js` | Existing precedent for pure immutable source history and per-user local storage, no interface link to Buyer CRM. **FROZEN**. |
| `apps/order-commission/tests/domain.test.cjs` and PO/Costing engines | Prior commercial/financial source owner; CRM may refer only via later explicit manual review; never calculate commission or confirmed FOB in CRM. **FROZEN**. |
| `js/auth.js`, `js/vesa-workspace-shell.js`, `css/vesa-workspace.css`, `templates/vesa-next-app/*` | Shared login/menu/branding and reference scaffold only. **WATCHED**, untouched M1. |
| `apps/buyer-crm/src/domain/buyer-directory.js` | **NEW M1** source-bound org/contact/enquiry record and immutable event history; contact privacy/consent evidence flag, cautious duplicate warnings, not silent merges. Pure JS no browser or sibling reads. |
| `apps/buyer-crm/src/domain/opportunity-state.js` | **NEW M1** source-labelled, date-bound stage evidence and exact entered currency/amount; do not assume stage probability or exchange/FOB values; no confirmed PO inference. Pure JS. |
| `apps/buyer-crm/src/domain/followup-scheduler.js` | **NEW M1** explicit due date/owner/outcome and as-of local planning view, no background message/email/SMS. Pure JS. |
| `apps/buyer-crm/tests/domain.test.cjs` | **NEW M1** synthetic fixtures for contacts, cautious duplicates, stage evidence and money provenance, due dates, immutable corrections and no hidden auto order/marketing. |
| `.github/workflows/buyer-crm.yml` | **NEW M1** Node/15-blueprint/sibling regression gates on feature only. No public route. |
| `docs/buyer-crm/01_EXECUTION_TRACKER.md` | This continuing exact SHA/CI evidence and NEXT ACTION. |

**M1 architecture/call direction:** future single shared VESA shell → dedicated CRM controller → pure BuyerDirectory/OpportunityState/FollowupScheduler → future CRM-only versioned browser store `vesa.buyer-crm.records.v1` and future draft report. Do not read other app localStorage, use backend/cloud/hidden providers or commit personal data. File status `local-source-unverified` never business approval.

**M0 audit verdict: accepted for scoped source-only M1.** Unknown consent/retention basis for real contact data, opportunity stage ontology, cross-currency valuation and followup owner calendar remain **Needs Information**. M1 allows only source-entered stage text/amounts and explicit owner+due date without guessing conversion probabilities or legally valid consent.

**M1 patch group, test and rollback:** exactly three new pure-domain modules, one synthetic Node test, this tracker and one feature-only CI. Test date/amount/currency without rounding/coercion; prevent duplicate organization/contact and duplicate enquiry IDs without silent merge, reject unsourced pipeline values or inferred order approval, preserve previous event versions, compute due dates by explicitly provided as-of, never issue notification. Run canonical SHA256, full existing Label/Factory/Production/Shipment/Fabric/Sampling/LC/PO/Packing/Commission/TechPack/TNA/PPM/AQL Node baseline and shared shell. Rollback by reverting M1 branch commits only; no modifications to main or existing apps. M1 accepted only on independent GitHub CI success.

**PRECISE NEXT ACTION:** implement M1 three pure modules and tests, then independent CI proof. After accepted M1, M2 shared-shell EN/BN/HI/TA local Save/Open; M3 reports/reference snapshots; M4 actual Chromium and *conditional* personal non-commercial demo. Do not ask for original ZIP; all 15 are permanent in GitHub.
