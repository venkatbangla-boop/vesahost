# VESA Costing 360 - Build / Acceptance Log

**Source of requirements:** `VESA_COSTING_360_VSCODE_HANDOVER.zip` and its ten Costing blueprint documents. Separate 15-app master roadmap is a *planning reference*, not a claim that other applications are built.

**Status:** `CONDITIONAL - FEATURE BRANCH ONLY`. Not public demo live; no claims of human/factory/buyer approval. Last verified GitHub branch commit should be checked before continuing.

## Ownership and boundaries

- `apps/costing/index.html`: single HTML page containing Costing's pure calculations, local storage, report logic, UI and synthetic training fixture.
- `apps/costing/tests/costing.test.cjs`: deterministic contract tests.
- `js/app-catalogue.js`: one app descriptor for `/apps/costing/`.
- `js/preferences.js`: four language App Centre labels.
- Shared `js/vesa-workspace-shell.js`, `css/vesa-workspace.css`, auth and VESA UI contracts remain unchanged.
- Existing TNA, PPM and AQL data/calculations, CNAME, root service worker, homepage and login remain unchanged.

## Calculations and safeguards

- Cost line USD/pc = input quantity * (1+waste%) * input rate / input units per USD; PER_ORDER charges divide by order pieces.
- No-margin FOB policy, with explicit NONE / IN_FOB / SEPARATE commission.
- Invalid or missing rate, unit, quantity, FX, source or commission-policy evidence blocks complete user quote.
- Knit cut area × approved GSM / 1000; woven approved marker ÷ garments; documented waste/shrink, no fabricated consumption from GSM alone.
- Alternative sourced fabric offers, revision snapshots, browser-local saved copies, 7 synthetic draft report variants, and CSV/Excel flows.
- Evidence is self-entered and not independent buyer/factory certification. Demo fixtures contain no real names, rates or orders.
- A landed additional charge in alternative offers is shown for comparison but cannot be applied directly to replace the cost line; add separate sourced commercial/landed cost lines.
- Full workbook import/export requires the checked-in TNA local Excel vendor library; no runtime CDN or uploading data.

## Resume verification (2026-10-14, current session)

- GitHub branch `feature/costing-360` now contains the full 7-sheet template as embedded source in `apps/costing/index.html` and the licensed offline spreadsheet library at `js/vendor/xlsx.full.min.js` with `js/vendor/xlsx.LICENSE.txt`. Existing TNA vendor copy stays unchanged.
- **21/21** source ZIP tests PASS; **10/10** independent single-HTML domain tests PASS.
- Browser smoke in a **mocked shared-shell environment**: **15/15** checks PASS, not a substitute for real platform route testing.
- Browser workbook-template Download: original 7-sheet `VESA_COSTING_INPUT_TEMPLATE.xlsx` downloaded byte-for-byte; SHA256 `18fc62add140ef575cab8e48e49fad37288b7509902faf29d831acda1afcce7f`.
- New HTML/Excel/vendor assets committed to feature branch. Actual third-party XLSX library **runtime import/export of a populated workbook**, real VESA auth/shell, keyboard/zoom/theme, print reports and live deployment still need direct verification. These gates remain conditional, not accepted.
- User-approved queue changed: **after Costing, TNA garment-merchandiser rework**, then Packing & Container, Order & Commission and other applications. Canonical request: `docs/tna/GARMENT_MERCHANDISING_REWORK_QUEUE.md`.
- **Current release verdict: CONDITIONAL — DO NOT MARK DEMO LIVE.** No public URL or branch merge claim.

## Verified development evidence (2026-10-14)

- Supplied standalone costing source Node suite: **21 PASS / 0 FAIL**.
- Generated single-HTML Node domain, quote, provenance, import-schema, backup and reports suite: **10 PASS / 0 FAIL**.
- Browser rendered-content automation, with a minimal simulated VESA header/auth/preference environment: **15 PASS / 0 FAIL** including quote formulas, auto-save and reload, restore, source offers, revisions, report, calculation tool, EN/BN/TA, layout at 320/390/768/1280 and JS error console.
- This was **a simulated shared shell, not a fully verified login/App Centre/actual GitHub Pages environment**. It cannot count as shared-platform integration acceptance.
- C-G00–C-G09 core workflow coverage is conditional pending actual deployment/runtime and complete workbook import/export, theme/zoom/keyboard/reports checks. **C-G10 release gate not accepted**.
- Human UAT remains unperformed for new Costing app. Existing VESA human UAT status is not changed.

## Release conditions / Next exact action

1. Run `node --test apps/costing/tests/costing.test.cjs` on a fresh checkout and verify against the tested source candidate.
2. Run local HTTP browser login → App Centre → Costing with actual shared scripts and VESA theme controls. Confirm no duplicate nav, no overflow, native downloads and local offline recovery.
3. Validate workbook Excel input against supplied 7-sheet template and the bundled vendor library, including safe rejection of macros/formula-bearing inputs and invalid data.
4. Test real source-ledger/offer provenance, unapproved quote state, all 7 reports, 4 language menus and saved-copy failure paths.
5. Run focused TNA/PPM/AQL/shared-shell tests, security/source scan and full relevant cross-app regression on release candidate.
6. Only after acceptance, safely fast-forward or merge into main for personal non-commercial demo (if actual hosting terms permit), and verify live version/URL before marking `DEMO LIVE`.
7. Next application after Costing: **TNA 360 Garment Merchandising Rework** (see queued source request), then APP-01 Packing & Container 360.

**Rollback:** feature branch can be discarded without changing main; after publication revert the exact app/catalogue/locale commits without clearing any browser records.

## Continued focused verification — 2026-10-14

- Corrected the repository-relative Node test path and committed the 11th Excel no-margin / source-revision regression test; local command `node --test apps/costing/tests/costing.test.cjs` **11 PASS, 0 FAIL** (on the reconstructed Costing app source and tests).
- Strict browser fixture test **PASS**: saved-copy download/restore as a separate record; invalid 6% imported workbook margin rejected without changing prior records; valid 0%-margin workbook accepted with style `SOURCE-STYLE-25` and source revision `QUOTE-REV-06` preserved; missing commission policy evidence surfaced. Tests ran against synthetic records and a simulated VESA shared shell, **not** a complete fresh repository browser flow.
- Source audit confirms centralized VESA `js/vesa-workspace-shell.js`, catalog, preferences, auth and CSS are separately owned. No changes to TNA, PPM or AQL runtime files. `main` stays unchanged for this checkpoint.
- **Release verdict: CONDITIONAL**. Still requires full true HTTP route test using real shared assets, real XLSX vendor runtime round-trip, cross-app regression, and policy-compliant hosting/live verification. No `DEMO LIVE` claim.
- **NEXT ACTION:** obtain the actual complete repo as a runnable local checkout or supported Work cloud-computer runtime, run real Login -> App Centre -> Costing browser integration with the checked-in licensed XLSX bundle, remediate any failures, then execute release acceptance; after Costing, proceed to the queued TNA garment merchandising rework.
