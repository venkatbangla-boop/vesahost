# PPM 360 Local UAT Checklist

Tester: __________  Date/time/timezone: __________  Browser/device: __________  Commit: __________

Use a fictional pre-production meeting. Do not alter the frozen 168 checkpoint identities or treat a local signature as authenticated external approval.

| ID | Human test steps | Expected result | Status | Evidence / notes |
|---|---|---|---|---|
| UAT-PPM-01 | From App Centre open PPM; exercise New, Continue, Open Saved, Practice and Open Saved Copy. | Each entry path is distinct, understandable and opens the intended local record without duplicate VESA chrome. | NOT TESTED | |
| UAT-PPM-02 | Choose representative product/profile/process options and inspect checkpoint counts. | Applicable checkpoints change by approved profile/process rules while all frozen identities remain available and traceable. | NOT TESTED | |
| UAT-PPM-03 | Search/filter checkpoints, open guidance, mark a required item pending, and use next-action navigation. | Required/PENDING/N/A semantics remain clear; unresolved required work cannot silently disappear. | NOT TESTED | |
| UAT-PPM-04 | Enter approval evidence and one measurement inside tolerance plus one outside tolerance. | Actuals remain separate from specification; decision blockers identify missing/failed evidence without inventing approval. | NOT TESTED | |
| UAT-PPM-05 | Produce GO/HOLD behavior, then try controlled CONDITIONAL GO only with its required authority/reason. | Decision rules fail closed; conditional release is visibly qualified and ordinary missing evidence cannot become GO. | NOT TESTED | |
| UAT-PPM-06 | Record minutes, an owner/due action and evidence; reload and reopen. | Minutes/actions/evidence and aging/escalation context persist exactly. | NOT TESTED | |
| UAT-PPM-07 | Finalize a fictional meeting, initiate a controlled amendment and change a material field. | Immutable finalized snapshot remains; current child sign-off is invalidated and amendment history names the reason. | NOT TESTED | |
| UAT-PPM-08 | Save locally, reload, reopen, download a saved copy and restore it as a separate record. | Current and restored records remain distinguishable; signatures, decisions, photos and evidence survive compatible restore. | NOT TESTED | |
| UAT-PPM-09 | Attempt one malformed or clearly wrong saved file while a good meeting is open. | Import fails with readable guidance and the good open/local record remains unchanged. | NOT TESTED | |
| UAT-PPM-10 | Generate reports in English, Bengali, Hindi and Tamil; inspect mobile preview and print/save PDF. | Authored labels translate, entered values remain exact, fonts render, and tables/footer/page markers are not clipped. | NOT TESTED | |
| UAT-PPM-11 | Add explicit TNA and AQL references, save/reopen, then remove one. | Source app/ID/version/date/status/verifier provenance persists; no sibling storage is read and PPM readiness/release is unchanged. | NOT TESTED | |
| UAT-PPM-12 | At 320–390px or a real phone, use Menu, Settings, a modal and keyboard focus/Escape. | No horizontal overflow; focus is visible and returns correctly; one shared VESA header/menu/save owner remains. | NOT TESTED | |

PPM human verdict: `NOT TESTED` / `PASS` / `FAIL`  Tester signature: __________  Date: __________

