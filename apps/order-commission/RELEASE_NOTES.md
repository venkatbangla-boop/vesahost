# APP-02 Order & Commission 360 — Local Verification Handover

**Branch:** `feature/order-commission-360` (derived from APP-01 development). **Verified app source:** `c20f4fa483db6a53fa2978ceccb020185a68cf37`. **Evidence:** [GitHub Actions #38926604880 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/38926604880), synthetically generated browser assets `app02-synthetic-browser`. **Status:** DEVELOPMENT VERIFIED, release CONDITIONAL / NOT DEMO LIVE. No public/main update.

**Blueprint:** user-uploaded `VESA_360_15_APP_MASTER_ROADMAP_HANDOVER(1).zip` → `blueprints/APP-02_order-commission.md`, SHA256 `bd2643c8ffa4fa2375304921bfbb3d80ae2ca93a7b6f779b4c94995fe7d4bac7`.

**Owner:** `apps/order-commission/index.html` single HTML UI + pure money/commission, source-port, report classes. `apps/order-commission/tests/domain.test.cjs` and `browser-workflow.cjs`. Central registry `js/app-catalogue.js` and four `js/preferences.js` open labels. No remote app-data sync. Private local key `vesa.order-commission.records.v1.<user>` and format `VESA-OC360-COPY-1`.

**Proof:** source/rate cannot default; synthetic explicit 2/3/4 rates; exact 4-decimal FOB, two-decimal contract rounding, contract exclusions, separate earned/issued/received/adjustments, dated overdue from entered due dates, source-provenance FX, overpayment blocked, historical agreement snapshot and issued invoice retained, local save and duplicate-ID portable restore, malformed/corrupted-copy atomicity, real typed workbook/print PDF, app-centre one header, EN/BN/HI/TA, 320/390/768 and no HTTP outside local assets. App-01, TNA G02/G05, PPM168, AQL24 plus sampling, shell pass in exact run.

**Not approved:** cross-device real finance custody/security, bank settlement, buyer/factory commission acceptance, native devices/accessibility/human UAT, commercial Pages release. Supplier/contract rates and earned payment decisions are never fabricated.

**NEXT:** APP-03 Tech Pack & Spec 360 from exact approved original ZIP blueprint. Keep this code/scope intact; rollback by reverting feature commits, not by clearing local records or altering main.
