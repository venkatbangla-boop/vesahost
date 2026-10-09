# VESA App Centre Auth Status

Date: 2026-10-09 (Asia/Dhaka)

## Current Verdict

A static/local App Centre login flow has now been implemented and deployed because the requested path is to avoid Cloudflare or another authenticated edge host. It adds a visible website Login button, `/login/`, `/apps/`, `/admin/`, two built-in demo users, local login history export, app catalogue cards, browser redirects for logged-out users, and local data partitioning by authenticated user key.

This is still not real server-side authentication. GitHub Pages/static hosting serves protected HTML, JavaScript, service workers, and app assets before browser JavaScript can redirect. Therefore direct raw HTTP access to app files remains possible until the apps move behind a server-side auth boundary.

## Requested App Centre Scope

| # | Requirement | Current Status | Evidence / Limit | Next Action |
|---:|---|---|---|---|
| 1 | Website `Login` menu | Implemented | `index.html` includes Login in nav/header/hero/footer. | Verify after deployment. |
| 2 | `/login/`, `/apps/`, `/admin/` routes | Implemented as static routes | Route folders and pages added. | Verify after deployment. |
| 3 | Real server-side authentication | Not implemented | Static GitHub Pages has no server session validation. | Requires authenticated host/proxy if this becomes required later. |
| 4 | Direct app URL protection before HTML/bundle delivery | Client-side guard only | AQL/PPM include `js/auth.js`; logged-out browsers redirect, but raw files are still delivered. | Server-side protection requires a non-static auth boundary. |
| 5 | Admin panel for users, blocking, resets, sessions | Implemented locally | Admin page creates users and blocks/reactivates them in browser localStorage. Password reset is handled by creating/updating local accounts, not a server reset flow. | Add server account store if needed later. |
| 6 | Login history, retention, export, backup | Implemented locally | Up to 500 local auth events are retained and exportable as CSV. No server backup exists. | Add server/event backup if needed later. |
| 7 | App Centre catalogue | Implemented | `/apps/` lists AQL and PPM. | Verify after deployment. |
| 8 | User-specific local data partitioning by authenticated user ID | Implemented for new data | PPM and AQL storage keys/databases use the authenticated user key. PPM imports legacy public records on first authenticated load for the user; AQL legacy public records are not auto-migrated. | Add migration tool only if legacy browser data must be moved. |
| 9 | Authenticated hosting/proxy migration or DNS cutover | Not implemented by request | No Cloudflare/auth host cutover. | No action unless server-side protection is later required. |
| 10 | Full `GAP_MATRIX.md` as separate file | Implemented | Separate file exists and is updated. | Keep updated. |
| 11 | Live verification that logged-out users cannot open app URLs | Verified for browser redirect; raw HTTP remains public | Live logged-out `/apps/ppm/` browser navigation redirected to `/login/?next=...`; raw HTTP delivery remains public by design of the static host. | Use authenticated hosting later if raw HTTP denial is required. |
| 12 | Native Android/Windows packages | Not implemented | No APK/AAB/MSIX build pipeline or signed packages. | Separate platform build/signing work. |
| 13 | Real factory/field pilot validation | Not supplied | No pilot acceptance evidence supplied. | Run field pilot and attach evidence. |


## Live Verification on 2026-10-09

- HTTP 200 confirmed for `/`, `/login/`, `/apps/`, `/admin/`, `/js/auth.js`, `/apps/ppm/`, and `/apps/aql/`.
- Clean-browser smoke passed: home Login link, logged-out direct PPM redirect to `/login/`, demo credential login, PPM open after login, catalogue load, and admin page access.
- Direct raw HTTP requests to AQL/PPM still return app content, which confirms this is a browser login flow rather than server-side protection.

## Unified Visual and Language Layer

The demo App Centre now has a shared browser preference layer for appearance and language. Login, App Centre, Admin, PPM, and AQL load the shared preference script. The shared language preference writes through to AQL guidance (`vesa-guide-language`) and PPM sentence guidance (`vesa.ppm.language`). The shared appearance preference writes through to the AQL appearance preference document and maps common theme tokens into PPM.

Current language scope is English, Tamil, Bengali, and Hindi. It translates App Centre shell controls and syncs app guidance language; it does not translate every technical form label or user-entered data.

## First-Use Behavior

The demo login accepts two built-in credentials: `admin@vesa` / `vesa` and `user@vesa` / `vesa`. Login history is retained in that browser's localStorage and can be viewed/exported from `/admin/` by the demo admin. No GitHub write-back exists on the static host, because that would require a protected server-side token or GitHub App.

## Completion Boundary

The current implementation satisfies the requested no-Cloudflare static/local App Centre flow. It does not satisfy a true protected-host release gate, because direct app file delivery cannot be blocked by client-side JavaScript on a public static host.
