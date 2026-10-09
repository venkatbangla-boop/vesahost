# VESA App Centre Auth Status

Date: 2026-10-09 (Asia/Dhaka)

## Current Verdict

The App Centre authentication scope is not complete. The repository currently deploys a public GitHub Pages static site. GitHub Pages can serve the marketing site and static apps, but it cannot enforce server-side login before protected HTML, JavaScript bundles, service workers, or app assets are delivered.

Logged-out live URL check on 2026-10-09:

| Route | Result | Meaning |
|---|---:|---|
| `https://vesaent.com/apps/aql/` | HTTP 200, 11,686,887 bytes | App content is publicly reachable. |
| `https://vesaent.com/apps/ppm/` | HTTP 200, 272,507 bytes | App content is publicly reachable. |

Because those routes return content without authentication, direct app URL protection is not complete and must not be claimed.

## Requested App Centre Scope

| # | Requirement | Current Status | Evidence / Blocker | Next Action |
|---:|---|---|---|---|
| 1 | Website `Login` menu | Not implemented | Marketing navigation has no Login item. Adding a visible login link before real auth would be misleading unless it points to a setup-blocked page. | Add only after the protected host/login route exists, or add a clearly labelled setup page if the owner wants a public notice. |
| 2 | `/login/`, `/apps/`, `/admin/` routes | Not implemented | No route folders or server routing exist. | Implement on authenticated host. `/login/` redirects to the identity provider, `/apps/` shows the catalogue, `/admin/` checks Admin capability. |
| 3 | Real server-side authentication | Not implemented | Static GitHub Pages cannot validate sessions before serving files. | Use an identity-aware proxy or authenticated host. |
| 4 | Direct app URL protection before HTML/bundle delivery | Not implemented | Logged-out requests to `/apps/aql/` and `/apps/ppm/` return HTTP 200 app content. | Move protected apps away from public GitHub Pages delivery or gate them at the edge/origin before response. |
| 5 | Admin panel for users, blocking, resets, sessions | Not implemented | No account database, server API, or admin UI exists. | Requires private account/session store and server functions. |
| 6 | Login history, retention, export, backup | Not implemented | No login event API or private storage exists. | Store narrow auth events server-side and export CSV/JSON with formula-injection protection. |
| 7 | App Centre catalogue | Not implemented | Existing app routes are direct public routes. | Build catalogue after session identity is available. |
| 8 | User-specific local data partitioning by authenticated user ID | Not implemented | PPM/AQL currently use local browser storage without authenticated user identity. | Pass stable authenticated user ID to apps and namespace IndexedDB/local draft keys. |
| 9 | Authenticated hosting/proxy migration or DNS cutover | Not implemented | Current custom domain serves GitHub Pages. | Prepare provider setup and DNS changes for review before cutover. |
| 10 | Full `GAP_MATRIX.md` as separate file | Implemented in this repository update | Separate file added. | Keep updated as auth implementation proceeds. |
| 11 | Live verification that logged-out users cannot open app URLs | Failing | Logged-out live checks return HTTP 200 for both apps. | Re-test after authenticated host cutover. |
| 12 | Native Android/Windows packages | Not implemented | Browser apps include wrapper/native-readiness notes only. | Separate platform signing/build pipeline required. |
| 13 | Real factory/field pilot validation | Not supplied | No pilot evidence, users, devices, factory acceptance records, screenshots, or field sign-off supplied. | Run a real pilot and attach acceptance evidence. |

## Recommended Auth Architecture

Recommended direction: Cloudflare Access plus Cloudflare Pages/Workers for protected app delivery, with D1 or KV for minimal account metadata and login-history records if the built-in identity data is not enough for the admin panel.

Rationale:

- Cloudflare Access is an identity-aware proxy that checks each request against Access policies before allowing the application request through. Official documentation: `https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/`
- The Cloudflare Pages Access plugin can validate Access JWT assertions in Pages Functions and return 403 for failed validation. Official documentation: `https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/`
- Workers KV currently includes a free tier with daily limits and 1 GB storage on the Workers Free plan. Official pricing page: `https://developers.cloudflare.com/workers/platform/pricing/`
- D1 can be used for structured account/login-event tables, but Free plan limits must be respected. Official FAQ: `https://developers.cloudflare.com/d1/reference/faq/`

Important limitation: using Cloudflare in front of the current GitHub Pages origin is not enough if the GitHub Pages default origin still publicly serves `/apps/aql/` and `/apps/ppm/`. The protected app bundles must be removed from any public bypass origin or served only from an authenticated host.

## Safe Implementation Sequence

1. Create a protected hosting target for app routes and keep the marketing site public.
2. Move `/apps/aql/` and `/apps/ppm/` delivery behind Access before returning app HTML/assets.
3. Add `/login/`, `/apps/`, `/admin/`, and logout routes on the authenticated host.
4. Add account/session/admin APIs and a private account/login-event store.
5. Pass a stable authenticated user ID into PPM/AQL and partition local storage by that ID.
6. Add Login to the public website only when the login route is real and tested.
7. Disable or remove public bypass delivery for protected app routes.
8. Verify logged-out direct app URLs, app assets, service workers, legacy aliases, and public-origin bypasses fail closed.
9. Publish rollback steps and DNS changes for owner review before cutover.

## Completion Boundary

The static AQL/PPM release is complete and deployed. The App Centre authentication release is not complete until a real authenticated host or proxy is connected and live checks prove logged-out requests cannot receive protected app content.
