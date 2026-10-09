# AQL Release Status

Date: 2026-10-09 (Asia/Dhaka)

## Repository

- Working repository: `F:\download temp browser\vesahost-release-work`
- Remote: `https://github.com/venkatbangla-boop/vesahost.git`
- Branch: `main`
- Base inspected: `f106c36 Reload PPM bundle assets during installation to avoid stale browser HTML`
- `git fetch origin main`: completed before edits.

## Inspected Attachments

| File | Status | Notes |
|---|---|---|
| `F:\download temp browser\aql project.zip` | inspected | Extracted outside repo to `F:\download temp browser\AQL-release-inputs`. |
| `aql project/VESA_Inspection_Quality_Suite_Fixed-1.html` | inspected | 11,673,462 bytes; SHA-256 `DAD139B12BA11157769D382CCBEB7FA060A7C1F86ECB608E8453ECFE49FA5DD2`. |
| `aql project/VESA_A_to_Z_Gap_and_Security_Audit.md` | inspected | 23,758 bytes; SHA-256 `22FA6DCAD3AF5A8EE31476B05B48CBCEF358A33BD7A88BD7288C42D8F9FABEED`. |
| Screenshot attachment | missing | No screenshot path was supplied in this run. |
| GIF attachment | missing | No GIF path was supplied in this run. |

## Changed File Scope

- `apps/aql/index.html`
- `apps/aql/service-worker.js`
- `apps/aql/ENGINEERING.md`
- `apps/aql/tests/apply-release-patch.cjs`
- `apps/aql/tests/release-contract.cjs`
- `apps/ppm/workspace.css`
- `apps/ppm/index.html`
- `apps/ppm/service-worker.js`
- `service-worker.js`
- `AQL_RELEASE_STATUS.md`

## Gap Matrix

| Gap ID | Evidence in Source | Change Needed | Verification | Status |
|---|---|---|---|---|
| 1 | Stage routing and decision engines present. | Guard misleading stage pass states. | Release shim adds selected contradiction/pending guards; static and browser checks passed. | fixed |
| 2 | Fabric roll records and point-density logic present. | Preserve behavior. | Source preserved; no sampling/table rewrites. | fixed |
| 3 | Lab records present. | Preserve failed-complete behavior from supplied app. | Source preserved; external lab integration not added. | partial |
| 4 | Shade records present. | Preserve behavior. | Source preserved. | partial |
| 5 | Incoming records present. | Preserve behavior. | Source preserved. | partial |
| 6 | Cutting records present. | Preserve behavior. | Source preserved. | partial |
| 7 | Inline controls present. | Preserve behavior. | Source preserved. | partial |
| 8 | Inline/endline stages present. | Preserve behavior. | Source preserved. | partial |
| 9 | IPC/pilot stage present. | Preserve behavior. | Source preserved. | partial |
| 10 | Pre-final readiness present. | Improve menu/accessibility around workflow. | Browser menu checks passed. | fixed |
| 11 | Rework/screening present. | Preserve behavior. | Source preserved. | partial |
| 12 | Final readiness gate present. | Invalidate/avoid stale acceptance where patched. | Release shim keeps report/menu paths and selected decision guards. | fixed |
| 13 | Loading stage/evidence present. | Preserve role-linked evidence behavior. | Source preserved. | partial |
| 14 | Production monitoring present. | Preserve behavior. | Source preserved. | partial |
| 15 | Supplier audit present. | Block critical audit pass contradiction. | Release shim adds critical-audit failure guard. | fixed |
| 16 | Master data present. | Sanitize IDs and avoid partial import. | Release shim hardens master IDs and atomic import. | fixed |
| 17 | Buyer profile fields present. | Preserve behavior. | Source preserved. | partial |
| 18 | Order journey present. | Guard bad incomplete data. | Supplied validation plus release competency guard. | fixed |
| 19 | CAPA present. | Preserve single CAPA path. | Source preserved. | partial |
| 20 | Sync packs present. | Avoid partial master commit before project validation. | Release shim validates project before applying masters. | fixed |
| 21 | Offline names/signatures only. | Authenticated roles need external identity service. | Documented in engineering notes. | not in this release |
| 22 | Competency record present. | Stop missing `stages` crash. | Release shim normalizes missing competency stages before evaluation. | fixed |
| 23 | Equipment controls present. | Preserve behavior. | Source preserved. | partial |
| 24 | Needle/metal records present. | Require metal traceability fields. | Release shim adds selected metal pending checks. | fixed |
| 25 | Compliance matrix present. | Legal applicability remains buyer/legal input. | Documented limitation. | partial |
| 26 | Packing checks present. | Preserve behavior. | Source preserved. | partial |
| 27 | Sample custody present. | Preserve behavior. | Source preserved. | partial |
| 28 | Factory acknowledgement present. | Explicit denied receipt must not look complete. | Release shim adds denied-receipt pending guard. | fixed |
| 29 | Analytics present. | Preserve behavior. | Source preserved. | partial |
| 30 | Counting-basis analytics present. | Preserve behavior. | Source preserved. | partial |
| 31 | Stage reports present. | Preserve report path and expose plain report menu. | Browser and static checks passed. | fixed |
| 32 | Build/master wording partially present. | Plain everyday labels requested. | Release shim relabels normal save/open/report flows. | fixed |
| 33 | Native wrapper only. | Signed Android/Windows packages are outside this web release. | Documented limitation. | not in this release |
| 34 | Regression checks present historically. | Add release contract/browser checks. | `release-contract.cjs` and Playwright checks passed. | fixed |
| 35 | Real field validation not supplied. | Pilot requires real inspectors/factory evidence. | Documented limitation. | not in this release |

## Tests Run

- `node apps\aql\tests\release-contract.cjs` - passed.
- Playwright/Chromium real browser checks - passed for AQL and PPM at 320, 390, 768, and 1280 CSS-pixel widths after scrolling; Home/File/Edit/View/Tools/Help visible and clickable.
- Playwright console check - passed with 0 warnings and 0 errors in the tested flow.

## Last Completed Result

AQL app implemented at `/apps/aql/`; PPM menu cache/version and sticky visibility updated. Final pre-push checks are pending.
