# VESA 360 — Costing G4 / Purchase Order G4 independent proof and next checkpoint

**Recorded:** 2026-10-18. **Verified running app source:** `main` `89c6a1385dd7d9d7a56e7ca827e19959cfea561c`. Both releases are **ACCEPTED (synthetic personal-demo use only)** after GitHub feature CI, main CI, Pages deployment and public exact-source byte comparison. No buyer/factory/bank or human UAT approval is inferred.

## Source-audit findings and exact ownership

| File | Owner / responsibility | Decision |
|---|---|---|
| `apps/costing/index.html` | Costing UI within a standalone source; engine, saved-copy and report modules are frozen | G4 changed only touch targets, keyboard focus and commission comparison scrolling |
| `apps/costing/tests/costing_real_e2e.py` | Actual Chromium integration | Added 320/390/1440 controls and mobile comparison proof; fixed async uploaded-XLSX toast test race with explicit wait |
| `apps/purchase-order/index.html` | `PurchaseOrderWorkspace` UI/controller, inline locale and style | Added read-only section discovery; `PurchaseOrderEngine`, `PurchaseOrderStore` and `PurchaseOrderReport` byte-identical to baseline |
| `apps/purchase-order/tests/browser-workflow.cjs` | Real Chromium 9-sheet workbook, A4 PDF, revision, save/open and corruption proof | Extended seven task transitions, no-storage preview, 320/390/1440 geometry/screenshots and four-language home, retaining all original assertions |
| `.github/workflows/purchase-order.yml` | PO CI owner | Scoped feature and main CI proof |
| `service-worker.js`, `tests/personal-demo-release.cjs` | Shared root static asset cache version and its assertion only | Advanced version to `vesa-v93-po-g4-guided-workflow`; no homepage source edit |

**Watched, unchanged:** shared shell/auth/preferences/catalgoue, original 15 blueprint files+manifest, TNA G13–G17, PPM 168 checkpoints, AQL sampling/Ac-Re, financial calculations and browser stored record schema. Root `index.html`, `css/style.css`, `js/main.js`, company media, SEO/legal/contact unchanged.

## Costing regression acceptance

Initial app patch `c639d75080366c0f58f174de16ea99e6c75d0003` proved mobile comparison and original workflows on feature CI [#39067755909](https://github.com/venkatbangla-boop/vesahost/actions/runs/39067755909); original Costing `main` rerun [#39067861054](https://github.com/venkatbangla-boop/vesahost/actions/runs/39067861054) failed one **asynchronous DOM notification test**, not the verified calculation tests: immediate assertion ran before the Excel file change handler displayed the explicit reject toast. The failure was not ignored. The isolated test-only fix `5db69c8d5df004e701de599f5dfaba69fac11cc8` waits for the actual error text while preserving its reject/unchanged-record assertion. [Feature CI #39068109392 PASS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068109392); [main CI #39068215719 PASS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068215719); [Pages #39068215618 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068215618); [served bytes #39068215783 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068215783).

## Purchase Order workflow proof

PO already owned source-based style/colour/size lines, reconciliation, factory comparison, dated amendment acknowledgments, sourced shipment/cancellation ledgers, signed PO revisions, reviewed reference export, browser-local saved copies and **nine exact Excel worksheets**. The home entry previously exposed New, Continue, Open Copy and Practice, but not the actual seven controlled work sections. The fix reveals **Summary / Style–Colour–Size / Buyer vs Factory / Amendments / Shipment & Cancellation / Revisions / Reports** as localized task cards. Each link instantiates the original `PurchaseOrderEngine.demo()` **read-only** fixture and enters the genuine existing panel without a record save or buyer/factory approval. No new costing or PO rule was invented.

**Verified PR-free feature branch:** `feature/po-g4-guided-workflow` code SHA `89c6a1385dd7d9d7a56e7ca827e19959cfea561c`. [Feature CI #39068429131 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068429131), [main PO #39068490712 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068490712), [main Costing #39068490710 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068490710), [Packing sibling #39068490802 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068490802), [Pages #39068490316 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068490316), [public exact PO HTML matching checked-out main #39068490729 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39068490729). Feature Chromium screenshots available in its GitHub Actions artifact. Synthetic browser assertions are not physical-device or human acceptance.

## Compatibility, rollback, next owner

**Compatibility verdict: ACCEPTED for scoped personal-demo UI; human UAT remains 1 PASS / 0 FAIL / 48 NOT TESTED.** No cloud storage or real approvals. Browser-local records must be deliberately backed up; local login is not secure server authentication. No public website homepage edits, no other app schemas or calculations changed.

**Rollback:** revert the isolated Costing UI/cache/test patch and/or the separate PO UI/cache/test commit after checking local-record compatibility; no blanket domain rollback and never clear the browser record store. The original Engine/Store/Report bodies can be compared byte-for-byte across the PO commit.

**EXACT NEXT: G4-W2 LC & Payment 360.** Read `blueprints/APP-05_lc-payment.md`, `apps/lc-payment/index.html`, its original domain and browser tests. The existing app owns nine sections — summary, LC terms, dated events, amendments, obligations, documents, settlements, charges, and reports — with explicit source/maturity and bank evidence. Audit Home-to-workflow visibility and date/document exception reporting, then one smallest reversible UI-only improvement **if proven**. Preserve `LCPolicyEngine`, original settlement arithmetic, agreed calendar/source policy, no bank action, local saved copies, native Excel/PDF and multilingual UI. After LC continue Sampling & Approval, Fabric & Trims, W3/W4 and full G5 interaction coverage.
