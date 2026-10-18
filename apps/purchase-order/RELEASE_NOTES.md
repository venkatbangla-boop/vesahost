# VESA Purchase Order 360 — personal demo release handover (2026-10-17)

## 2026-10-18 G5-05 Purchase Order header/line form QA — PASS

**Test/CI-only** `32c7c4df1b8ad231129727bb2c2624958ce6a2fa`: real New PO header and source-line field focus, Escape-to-opener, 320px dialog/1440px viewport, complete original immutable amendment/factory confirmation/partial shipment, Excel/PDF and portable recovery in [feature Chromium #39113459538](https://github.com/venkatbangla-boop/vesahost/actions/runs/39113459538) and [main #39113519026](https://github.com/venkatbangla-boop/vesahost/actions/runs/39113519026), both SUCCESS. [Pages #39113518998](https://github.com/venkatbangla-boop/vesahost/actions/runs/39113518998) and [public-byte #39113519075](https://github.com/venkatbangla-boop/vesahost/actions/runs/39113519075) SUCCESS. No change to PO authority, currency, amendment or shipment calculations. [Wave proof](../../docs/portfolio/26_G5_FORM_QA_WAVE_A.md).

---


**Approved original blueprint:** user-uploaded ZIP `blueprints/APP-13_purchase-order.md`; `PurchaseOrder` only, not canonical TNA scheduling owner. **Verified release:** `923d4efe5dc06bc1f96f2450fe2d9baf52c75157`, full [PO/sibling Node and Chromium #39013704496 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39013704496). **Public:** [Pages #39013774121](https://github.com/venkatbangla-boop/vesahost/actions/runs/39013774121) and [exact PO served HTML #39013774130](https://github.com/venkatbangla-boop/vesahost/actions/runs/39013774130) SUCCESS; https://vesaent.com/apps/purchase-order/.

**Owners:** `apps/purchase-order/index.html` class-owned pure PO engine, local store, report and controller; `tests/domain.test.cjs`, `tests/browser-workflow.cjs`, `.github/workflows/purchase-order.yml`. Shared App Centre registry, language prefs, static cache-v72, main live-smoke route guard. Version `VESA-PO360-PLAN-1`, local key `vesa.purchase-order.records.v1.<user>`, portable `.vesapo` checksum; read-only reviewed downstream JSON reference shape `sourceApp,recordType,recordId,revisionId,sourceDate,verifiedBy,verifiedAt,displaySnapshot`. Legacy saved records without the optional factory statement remain supported.

**Verification:** Sourced 4 decimal FOB + explicit per-line rounding, buyer control amount/qty HOLD until reconciled, signed snapshots unaffected by draft edits, intentional split-ID uniqueness, separate factory statement rather than inferred ACK, source-dated amendment acceptance, over-shipping/cancellation controls and source-complete ledger, size/colour/quantity/value/date revision differences, signature-review-gated historical PO reference, Excel/PDF, corrupt copy atomicity, EN/BN/HI/TA, 320/390/768/1280, zero network calls. PPM/AQL/TNA/Costing/Packing/Commission/Tech Pack sibling regressions pass per CI.

**Status:** DEMO LIVE, **non-commercial synthetic personal demonstration only**. Production banking/order security, external signatures and actual factory acceptance unverified and cannot be claimed. No real buyer order or payment data should be entered. Rollback to prior `main` `9c9471e9bfc5f2ed2a8d782a8bcb66c848f6d3f4` via reversible git revert of PO release without clearing client-side local records.

**NEXT:** LC & Payment 360 based on original `APP-05_lc-payment.md`, then next approved application.
