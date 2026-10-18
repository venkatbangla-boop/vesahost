# LC & Payment 360 — Verified Personal Demo Release 2026-10-17

## 2026-10-18 G5-06 LC/Payment actual form QA — PASS

**Test/CI-only** `1fd22dc7352279361bedc55af0650c2d4d828ee1`: New LC, BL Event and Payment Obligation first field/keyboard focus and Escape return; 320px actual header dialog and 1440px viewport. Original documented calendar-day maturity, amendments, discrepancies, bank charges, settlement proof, Excel/PDF and portable records preserved by [feature Node/Chromium #39113583452 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39113583452) and [main LC #39113661620 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39113661620). Nothing executes bank payment or certifies LC liability. [Wave proof](../../docs/portfolio/26_G5_FORM_QA_WAVE_A.md).

---


**Source:** Original uploaded ZIP `blueprints/APP-05_lc-payment.md` SHA256 `62cfb0a766cb91a7fddeb9aa7c6674df5168c4fb30698d20a8874c745522b994`. **Deployed commit:** `7f97dcce857f88002f775e79e850a426b0f073ec` (**no force push**). [CI #39014733870 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39014733870), [Pages #39014795905 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39014795905), [exact public HTML #39014796423 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39014796423). Route https://vesaent.com/apps/lc-payment/.

**Owner:** `apps/lc-payment/index.html` classes `LCPolicyEngine`, `LCStore`, `LCReport`, `LCWorkspace`; `apps/lc-payment/tests/domain.test.cjs`, `browser-workflow.cjs`; `.github/workflows/lc-payment.yml`. Stored browser key `vesa.lc-payment.records.v1.<user>` version `VESA-LCPAY360-1`; portable `.vesalc` checksum-only (no authentication). Local scope, no remote APIs, no real records transmitted.

**Proof:** source-gated master/B2B/fabric LC and original/approved amendment math, exact 2dp money; mandatory event/start inclusion/day convention and reviewed weekend/holiday calendar before business-day maturity; unknown event yields no maturity; independent bank document statuses and linked amount discrepancies; payable/receivable, settlement/credit/reversal/FX source; separate charges; overdue as-of only sourced maturity; reviewed two-stage PO reference JSON import, real XLSX/PDF, backup corruption rejection, EN/BN/HI/TA, 320/390/768/1280, zero external requests. Prior PO/Packing/Commission/Tech Pack/TNA/PPM/AQL domain tests verified by CI.

**Status:** **DEMO LIVE** for personal non-commercial synthetic-only demonstration. Never treat browser login as secure bank auth or entered LC status as bank-approved; actual settlement/FX/customer information, native devices, legal/customs/bank authority and commercial hosting remain **CONDITIONAL / BLOCKED**. Rollback by reverting LC-specific commit from main while preserving unrelated app records and prior commits; do not clear local files.

**NEXT:** Sampling & Approval 360 `feature/sampling-approval-360` from approved blueprint.
