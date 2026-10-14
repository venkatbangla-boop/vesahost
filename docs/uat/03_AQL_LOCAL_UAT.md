# AQL 360 Local UAT Checklist

Tester: __________  Date/time/timezone: __________  Browser/device: __________  Commit: __________

Use a fictional inspection and actual test carton identifiers. A carton selection is not an inspection approval, buyer certification or shipment release.

| ID | Human test steps | Expected result | Status | Evidence / notes |
|---|---|---|---|---|
| UAT-AQL-01 | From App Centre open AQL and create a fictional inspection with order/style/lot identity. | One VESA header is visible; inspection identity remains exact across Setup/Plan/Inspect/Pack/Review. | NOT TESTED | |
| UAT-AQL-02 | Enter a supported lot/inspection level/AQL and review the calculated plan; also try an unsupported cell. | Supported sample size and Ac/Re match the frozen table; unsupported input stays pending and is never guessed. | NOT TESTED | |
| UAT-AQL-03 | Record sample pieces/findings so one fixture is below Re and another reaches Re. | Counts use the configured basis; PASS/FAIL/PENDING boundaries remain exact and selection alone changes no result. | NOT TESTED | |
| UAT-AQL-04 | Add actual eligible carton IDs using `001-005, CTN-007..CTN-009`; set required count to 4, inspector and source reference; leave manual selection empty and choose Auto Fill Remaining. | Eight eligible IDs are shown; four unique existing cartons are selected automatically without replacement; leading zeros remain; method is `automatic` and labelled internal uniform/not buyer-certified. | NOT TESTED | Capture selected IDs. |
| UAT-AQL-05 | Replace the selection manually with `002` and `CTN-008`, add a judgement reason, replacement reason and confirmation, then save manual selection. | Exactly those two eligible cartons are saved with origin `manual`; they are never described as random; previous automatic selection remains in history. | NOT TESTED | |
| UAT-AQL-06 | Replace again: manually choose `001`, set required count 4, add reason/confirmation and choose Auto Fill Remaining. | `001` remains manual; three different eligible cartons are automatic; no duplicate or nonexistent carton appears; method is `combined`. | NOT TESTED | |
| UAT-AQL-07 | Try a manual ID not in the eligible list, a required count above the universe, and replacement without confirmation/reason. | Each invalid action is blocked with readable guidance; the last valid selection and inspection evidence remain unchanged. | NOT TESTED | |
| UAT-AQL-08 | Choose buyer-approved policy without a reference, then return to internal uniform. | Buyer-approved mode refuses to save without a policy reference; internal mode remains explicitly non-certified and invents no buyer rule. | NOT TESTED | |
| UAT-AQL-09 | Save locally, reload/reopen, then download and reopen a saved copy. | Eligible universe, source, required count, method, selected IDs/origins, inspector/time/remarks and complete replacement history survive both paths. | NOT TESTED | |
| UAT-AQL-10 | Record an actual quantity/inspection time for a selected carton and leave another selected carton incomplete. | Actual inspected carton and completion status remain distinct; incomplete selection remains visible and cannot imply completed inspection. | NOT TESTED | |
| UAT-AQL-11 | Generate Standard buyer and relevant stage/packing reports; print/save PDF. | Report includes order/style/lot, source, eligible universe/count, policy/method, origin per carton, inspector/time/remarks, history and inspected completion; it states no buyer certification/approval/release. | NOT TESTED | |
| UAT-AQL-12 | Switch EN/BN/HI/TA guidance and report language. | Carton-selection guidance is present in all four languages; carton IDs, buyer values, decisions and evidence are unchanged. | NOT TESTED | |
| UAT-AQL-13 | Add a measurement OOT, finding/evidence and CAPA/reinspection link; save/reopen. | Original finding/result/evidence remain immutable and linked; correction/reinspection cannot rewrite the source event. | NOT TESTED | |
| UAT-AQL-14 | Disconnect the network after one successful load, reload the cached app and reopen the saved inspection. | App reopens locally with the saved record; no upload/sync claim appears. If the browser/device blocks offline use, record FAIL with details. | NOT TESTED | |
| UAT-AQL-15 | At 390px or a real phone, open Carton Selection, its history and report; navigate by keyboard. | Controls remain usable without page overflow; focus is visible; selected IDs/origins/history and report tables are readable. | NOT TESTED | |

AQL human verdict: `NOT TESTED` / `PASS` / `FAIL`  Tester signature: __________  Date: __________

