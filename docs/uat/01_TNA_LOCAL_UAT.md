# TNA 360 Local UAT Checklist

Tester: __________  Date/time/timezone: __________  Browser/device: __________  Commit: __________

Use one fictional apparel order. Preserve its original baseline, forecast, actuals and history as separate values.

| ID | Human test steps | Expected result | Status | Evidence / notes |
|---|---|---|---|---|
| UAT-TNA-01 | From App Centre open TNA, then use Home and App Centre navigation. | TNA opens under one VESA header; navigation returns correctly without duplicate logo/menu/account controls. | NOT TESTED | |
| UAT-TNA-02 | Create a full-entry fictional order with buyer/style/PO, quantities, start and ex-factory dates. | Required fields are understandable; entered identity and quantities remain exact after moving between screens. | NOT TESTED | |
| UAT-TNA-03 | Choose a garment template, edit dependencies/calendars, and calculate the plan. | Activities, working dates, milestones and critical path recalculate; missing inputs stay visible and are not guessed. | NOT TESTED | |
| UAT-TNA-04 | Record separate baseline, forecast and actual dates, then revise one forecast with a reason. | Original baseline and actual evidence remain unchanged; revision/audit history records the change and reason. | NOT TESTED | |
| UAT-TNA-05 | Enter material, approval, capacity and shipment facts including one deliberate shortage or late input. | Readiness/risk panels explain the actual blocker; no approval, production rate, holiday or shipment commitment is fabricated. | NOT TESTED | |
| UAT-TNA-06 | Save locally, reload the page, choose Continue/Open Saved and reopen the order. | The same order, calculations, history and evidence reopen; save-state wording accurately shows local-browser storage. | NOT TESTED | |
| UAT-TNA-07 | Download a saved copy, create another harmless draft, then open the saved copy. | Import preview identifies the copy; successful reopen preserves data, while the other local record is not silently overwritten. | NOT TESTED | |
| UAT-TNA-08 | Export the workbook/report, open the XLSX in the available desktop reader, and print/save one report as PDF. | Workbook sheets and report are readable; typed values are exact; no formula executes from text; PDF has no clipped tables. | NOT TESTED | Record reader/version. |
| UAT-TNA-09 | Switch English, Bengali, Hindi and Tamil plus one light and one dark theme. | Authored UI/report labels change; user-entered values, identifiers, dates and calculations do not change. | NOT TESTED | |
| UAT-TNA-10 | At 390px/mobile or a real phone, use Menu, keyboard focus, Settings and an order dialog. | No horizontal page overflow; visible focus and Escape/return behavior work; the shared header remains the only fixed navigation owner. | NOT TESTED | |
| UAT-TNA-11 | Add explicit PPM/AQL reference IDs and review local in-app due alerts. | References remain display/provenance records only; alerts appear only in-app and do not claim external delivery or change sibling decisions. | NOT TESTED | |
| UAT-TNA-12 | Open Practice Example and try Save/Download as business evidence. | Practice is clearly labelled and isolated; it cannot be mistaken for or saved as a production record. | NOT TESTED | |

TNA human verdict: `NOT TESTED` / `PASS` / `FAIL`  Tester signature: __________  Date: __________

