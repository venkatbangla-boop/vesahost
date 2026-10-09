# VESA App Centre Auth Status

Date: 2026-10-09 (Asia/Dhaka)

## Current Verdict

A static/local App Centre login flow has now been implemented because the requested path is to avoid Cloudflare or another authenticated edge host. It adds a visible website Login button, `/login/`, `/apps/`, `/admin/`, local browser users, local login history export, app catalogue cards, browser redirects for logged-out users, and local data partitioning by authenticated user key.

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
| 11 | Live verification that logged-out users cannot open app URLs | Pending deployment verification | Local browser guard is in place; raw HTTP delivery remains public by design of the static host. | Re-test after deployment. |
| 12 | Native Android/Windows packages | Not implemented | No APK/AAB/MSIX build pipeline or signed packages. | Separate platform build/signing work. |
| 13 | Real factory/field pilot validation | Not supplied | No pilot acceptance evidence supplied. | Run field pilot and attach evidence. |

## First-Use Behavior

On first visit to `/login/` in a browser, the site asks to create the local admin password for `info@vesaent.com`. After setup, admins can add local users from `/admin/`. These accounts live in that browser's localStorage, so another device or browser needs its own setup unless a server-side account store is added later.

## Completion Boundary

The current implementation satisfies the requested no-Cloudflare static/local App Centre flow. It does not satisfy a true protected-host release gate, because direct app file delivery cannot be blocked by client-side JavaScript on a public static host.
