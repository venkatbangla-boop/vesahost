# VESA UI Consistency Upgrade

Date: 2026-10-10

## Evidence-backed inventory

Current implemented routes are `/`, `/login/`, `/apps/`, `/admin/`, `/apps/aql/` and `/apps/ppm/`. The public website uses the strongest VESA visual reference: cream/light surfaces, navy text, rounded navigation, large editorial hero, VESA logo and EGENVA attribution. Login, Apps and Admin already share `/css/style.css`, `/js/preferences.js` and `/js/auth.js`. AQL and PPM are self-contained browser workspaces with local storage, reports and offline service workers.

Observed differences before this pass:

- Login had no password visibility control and accepted any same-origin `next` route, including routes outside the signed-in app area.
- App cards were hardcoded in `apps/index.html`; there was no small reusable app catalogue entry list for future apps.
- AQL and PPM contained their own workspace menu patterns. Earlier cleanup hid them completely, which avoided the ugly duplicate bars but conflicted with the requirement that Home, File, Edit, View, Tools and Help remain reachable inside workspaces.
- PPM's legacy menu used fixed positioning at the browser top, which could visually compete with the authenticated VESA shell.
- AQL's release menu was force-hidden by guard CSS, so the workspace actions existed in code but were not visible/reachable through the common menu labels.
- Language/theme preferences were intentionally visible only on `/login/`; showing them again inside AQL/PPM caused inconsistent and crowded headers.

## Chosen design rules

- Public VESA homepage remains the visual source: cream surface, navy text, rounded controls, VESA logo and compact high-contrast buttons.
- Signed-in pages use the shared authenticated shell from `VesaAuth.renderUserBar()`: VESA logo, user name, Apps, Admin where allowed and Logout.
- `/login/` is the single visible place for language and theme selection. AQL/PPM consume the preferences without showing duplicate selectors.
- Workspace actions stay reachable, but use a compact branded command bar below the app header instead of a large unrelated browser-like strip.
- App data remains local to the browser and existing per-user namespaces. This pass does not add cloud storage, telemetry, DNS, backend auth or schema migration.
- Reports and domain engines remain app-owned; styling changes must not change AQL/PPM calculations, decisions, save formats or imports.

## Files in scope

- `login/index.html` — safe login return path and password visibility toggle.
- `js/auth.js` — authenticated shell height measurement for sticky app headers.
- `js/app-catalogue.js` — enabled app catalogue for AQL and PPM.
- `apps/index.html` — renders enabled catalogue entries while preserving fallback cards.
- `css/style.css` — login password toggle styling and catalogue safeguards.
- `apps/aql/index.html` — removes forced hide from the AQL workspace menu and applies the compact VESA command-bar styling.
- `apps/ppm/workspace.css` — makes the PPM workspace menu compact, branded and sticky below the VESA/app header.
- `service-worker.js`, `apps/aql/service-worker.js`, `apps/ppm/service-worker.js` — cache version bumps so deployed browsers do not mix old/new UI bundles.

## Verification checklist

- Website to Login to Apps to AQL/PPM works with authenticated demo users.
- Logged-out direct access to `/apps/`, `/apps/aql/` and `/apps/ppm/` redirects to `/login/` with a safe internal return path.
- User access to `/admin/` redirects back to `/apps/`; admin access opens Admin.
- Login, Apps, Admin, AQL and PPM share the VESA shell and no longer show duplicate language/theme selectors inside app workspaces.
- AQL and PPM keep Home, File, Edit, View, Tools and Help reachable in order through compact workspace command bars.
- PPM/AQL scripts parse and existing release/regression checks pass where dependencies are available.
- Service worker cache names are bumped for root, AQL and PPM.

## Remaining limitations

This is still a static browser demo with local browser authentication and local records. It is not server-side authentication and it does not prove Android/Windows native packaging or physical field-pilot validation.
