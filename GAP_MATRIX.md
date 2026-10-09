# VESA Release Gap Matrix

Date: 2026-10-09 (Asia/Dhaka)

This matrix records current repository and live-release evidence. It distinguishes implemented local/static release work from live authenticated App Centre requirements. Historical source notes and prompt text are not treated as proof of completion.

## App Centre Authentication Matrix

| ID | Requirement | Current file / route evidence | Current result | Local verification | Live verification | Status |
|---:|---|---|---|---|---|---|
| AC-01 | Website Login menu | `index.html` primary nav, header CTA, hero CTA, and footer link include `/login/`. | Visible Login entry added. | Inspected file and browser smoke. | Live home page shows Login link. | Implemented as static/local login |
| AC-02 | `/login/`, `/apps/`, `/admin/` routes | `login/index.html`, `apps/index.html`, `admin/index.html`. | Routes exist as static pages. | Browser smoke covers demo login/catalogue/admin. | Live HTTP 200 and browser smoke passed. | Implemented as static/local routes |
| AC-03 | Real server-side authentication | Static GitHub Pages deployment only; no server session validator. | No server-side auth. | Static source review. | Direct HTTP delivery remains public. | Not implemented |
| AC-04 | Protect app HTML/bundles before delivery | `/apps/aql/` and `/apps/ppm/` include `js/auth.js` browser guards. | Browser redirects logged-out users, but files are still delivered by the static host. | Local browser guard verified. | Live logged-out browser redirect passed; raw HTTP still returns app HTML. | Client-side guard only |
| AC-05 | Admin panel | `admin/index.html` supports local users, roles, block/reactivate, login history export. | Local browser admin panel added. | Browser smoke covers admin create user. | Live admin page opened after local admin login. | Implemented locally; no server account store |
| AC-06 | Login history, retention, export, backup | `js/auth.js` stores up to 500 local events; `admin/index.html` exports CSV. | Local browser history/export added. | Browser smoke and syntax checks. | Live admin session reached history/export page. | Implemented locally; no server backup |
| AC-07 | App Centre catalogue | `apps/index.html` lists AQL and PPM cards behind browser auth guard. | Catalogue added. | Browser smoke covers catalogue. | Live catalogue loaded after login. | Implemented as static/local catalogue |
| AC-08 | User-specific local data partitioning | PPM IndexedDB/local fallback/recovery and AQL main/master stores include `VesaAuth.userKey()`. | New saved local data is partitioned by authenticated user key. | Code review and app tests. | Live PPM session reported user key `info-vesaent-com`. | Implemented for new local data; PPM legacy records migrate on first authenticated load, AQL legacy public records are not auto-migrated |
| AC-09 | Authenticated host/proxy migration | `CNAME` and GitHub Pages static delivery unchanged. | No authenticated host cutover, by user direction. | Repository remains GitHub Pages static site. | Public host still serves static files. | Not implemented |
| AC-10 | Separate gap matrix file | `GAP_MATRIX.md`. | File present and updated. | File present. | Not a live user-facing route. | Implemented |
| AC-11 | Logged-out app URL denial | Browser guard redirects logged-out app navigation to `/login/`. | Browser-level denial added; direct raw file delivery still succeeds. | Local browser guard verified. | Live logged-out `/apps/ppm/` browser navigation redirected to `/login/?next=...`; raw HTTP still returns 200. | Client-side guard only |
| AC-12 | Native Android/Windows packages | AQL/PPM are browser apps with PWA/static assets. | No APK/AAB/MSIX. | No native package files found. | Not deployed. | Not implemented |
| AC-13 | Real factory/field pilot validation | No pilot files or acceptance evidence supplied. | Unverified. | No evidence in repo. | Not verifiable. | Not supplied |

## Original AQL 35-Area Matrix

| ID | Original requirement | Current file / class evidence | Baseline evidence | Repair or scope disposition | Test / result | Final status |
|---:|---|---|---|---|---|---|
| 1 | Inspection type drives workflow/result | `apps/aql/index.html`; stage routing and release shim. | Supplied AQL app contains stage routing and decision engines. | Selected contradiction and pending-state guards added by release shim. | `node apps/aql/tests/release-contract.cjs` passed; browser menu checks passed. | Fixed locally and live static |
| 2 | Full fabric roll inspection | `apps/aql/index.html`; fabric roll records and point-density logic. | Supplied app contains fabric roll records. | Preserved behavior; no sampling/table rewrite. | AQL contract passed. | Fixed/preserved |
| 3 | Lab system integration | `apps/aql/index.html`; lab/test records. | Lab records present in source. | External lab integration excluded; failed-complete behavior preserved from supplied app. | AQL contract passed for release guards. | Partial |
| 4 | Dedicated shade management | `apps/aql/index.html`; shade records. | Shade fields present. | Preserved behavior. | AQL contract passed. | Partial |
| 5 | Incoming fabric/accessories | `apps/aql/index.html`; incoming records. | Incoming records present. | Preserved behavior. | AQL contract passed. | Partial |
| 6 | Cutting workflow | `apps/aql/index.html`; cutting records. | Cutting records present. | Preserved behavior. | AQL contract passed. | Partial |
| 7 | Detailed inline process control | `apps/aql/index.html`; inline controls. | Inline records present. | Preserved behavior. | AQL contract passed. | Partial |
| 8 | Separate Inline and Endline | `apps/aql/index.html`; inline/endline stages. | Distinct stages present. | Preserved behavior. | AQL contract passed. | Partial |
| 9 | IPC / pilot / first output | `apps/aql/index.html`; IPC/pilot stage. | IPC/pilot stage present. | Preserved behavior. | AQL contract passed. | Partial |
| 10 | Pre-Final readiness | `apps/aql/index.html`; release menu/workflow guard. | Pre-final readiness labels and gates present. | Menu/accessibility improved around workflow; selected guards retained. | Browser menu checks passed at 320, 390, 768, 1280 widths. | Fixed locally and live static |
| 11 | 100% screening/rework | `apps/aql/index.html`; rework/screening records. | Rework path present. | Preserved behavior. | AQL contract passed. | Partial |
| 12 | Final readiness gate | `apps/aql/index.html`; final readiness and release shim. | Final gate present. | Patched selected stale/contradictory acceptance paths. | AQL contract passed. | Fixed locally and live static |
| 13 | Loading supervision | `apps/aql/index.html`; loading records and evidence fields. | Loading stage present. | Preserved role-linked evidence behavior. | AQL contract passed. | Partial |
| 14 | Production monitoring | `apps/aql/index.html`; production monitoring records. | Production monitoring present. | Preserved behavior. | AQL contract passed. | Partial |
| 15 | Supplier QMS audit | `apps/aql/index.html`; supplier audit guard. | Audit stage present. | Critical audit failure guard added. | AQL contract passed. | Fixed locally and live static |
| 16 | Master data integrated and durable | `apps/aql/index.html`; master data import guards. | Master apply/import exists. | Master IDs sanitized; imports made atomic where patched. | AQL contract passed. | Fixed locally and live static |
| 17 | Versioned buyer profiles | `apps/aql/index.html`; buyer profile fields. | Buyer profile fields present. | Preserved behavior; full versioned policy package not implemented. | AQL contract passed. | Partial |
| 18 | Linked order quality journey | `apps/aql/index.html`; order journey guard. | Order journey present. | Bad incomplete data guarded by supplied validation and release competency guard. | AQL contract passed. | Fixed locally and live static |
| 19 | One CAPA owner | `apps/aql/index.html`; CAPA collection. | CAPA present. | Preserved single CAPA path; no full workflow refactor. | AQL contract passed. | Partial |
| 20 | Complete sync and collaboration | `apps/aql/index.html`; sync pack import. | Sync packs present. | Project validation occurs before applying masters. Cloud collaboration excluded. | AQL contract passed. | Fixed for import atomicity; collaboration excluded |
| 21 | Authenticated inspector/supervisor roles | None server-side; offline names/signatures only. | Historical audit marked missing. | Replaced by Admin/User app access in master prompt, but not implemented. | Logged-out live apps return HTTP 200. | Not in this release |
| 22 | Inspector competency control | `apps/aql/index.html`; competency normalization. | Competency fields present; missing stages could crash. | Missing competency stages normalized before evaluation. | AQL contract passed. | Fixed locally and live static |
| 23 | Equipment control | `apps/aql/index.html`; equipment records. | Equipment controls present. | Preserved behavior. | AQL contract passed. | Partial |
| 24 | Needle and metal detection | `apps/aql/index.html`; metal traceability guard. | Needle/metal records present. | Selected metal traceability pending checks added. | AQL contract passed. | Fixed locally and live static |
| 25 | Market compliance matrix | `apps/aql/index.html`; compliance matrix. | Compliance fields present. | Legal applicability remains buyer/legal input. | AQL contract passed. | Partial |
| 26 | Packing-list intelligence | `apps/aql/index.html`; packing checks. | Packing checks present. | Preserved behavior. | AQL contract passed. | Partial |
| 27 | Sample custody centre | `apps/aql/index.html`; sample custody fields. | Sample custody present. | Preserved behavior. | AQL contract passed. | Partial |
| 28 | Factory acknowledgement | `apps/aql/index.html`; denied receipt guard. | Factory acknowledgement present. | Explicit denied receipt pending guard added. | AQL contract passed. | Fixed locally and live static |
| 29 | Advanced analytics | `apps/aql/index.html`; analytics. | Analytics present. | Preserved behavior. | AQL contract passed. | Partial |
| 30 | Counting-basis-safe analytics | `apps/aql/index.html`; quality intelligence. | Counting-basis analytics present. | Preserved behavior; no full analytics refactor. | AQL contract passed. | Partial |
| 31 | Stage-specific reports | `apps/aql/index.html`; report path and menu. | Stage reports present. | Report path preserved; plain report menu exposed. | Browser/static checks passed. | Fixed locally and live static |
| 32 | Remove visible Master/build numbering | `apps/aql/index.html`; release relabel shim. | Historical wording partially present. | Normal save/open/report flows relabelled to everyday wording. | Browser menu checks passed. | Fixed for release surface |
| 33 | Actual native Android/Windows app | No native build output. | Wrapper/native-readiness only. | Signed APK/AAB/MSIX excluded. | No native package tests. | Not in this release |
| 34 | Complete QA/regression suite | `apps/aql/tests/release-contract.cjs`; PPM tests. | Historical regression checks partial. | Release contract and browser checks added/run. | AQL contract, PPM regression/planning/update, browser smoke passed. | Fixed for current static release scope |
| 35 | Actual field validation | No pilot evidence. | Historical audit marked unverified. | Real inspectors/factory evidence not supplied. | No pilot test supplied. | Not in this release |

## Current Verification Summary

- Static App Centre login implementation added and deployed: `/login/`, `/apps/`, `/admin/`, two built-in demo users, browser session guard, local admin view, local login-history CSV export, AQL/PPM catalogue links, and user-key local data partitioning.
- Client-side browser guard result: local and live logged-out browser navigation redirects to `/login/` before the app UI initializes.
- Server-side auth result: still not implemented, because the current GitHub Pages/static host delivers HTML and bundles before any browser script can run.
- `node apps/aql/tests/release-contract.cjs`: passed.
- `node apps/ppm/tests/regression.cjs` with Playwright Chromium: passed.
- `node apps/ppm/tests/planning.cjs` with Playwright Chromium: passed.
- `node apps/ppm/tests/update.cjs` with Playwright Chromium: passed.
- Local App Centre browser smoke: passed.
- Live HTTP checks: `/`, `/login/`, `/apps/`, `/admin/`, `/js/auth.js`, `/apps/ppm/`, and `/apps/aql/` returned HTTP 200.
- Live App Centre browser smoke: passed for home Login link, logged-out PPM redirect, demo credential login, PPM open after login, catalogue, and admin page.
- Unified design/language layer: local browser smoke passed for Login theme/language selection, App Centre carry-over, PPM language/version sync, and AQL language preference sync.
