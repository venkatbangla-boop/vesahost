# VESA 360 Premium Login & 19-App UX — Durable Execution Tracker

**Updated:** 2026-10-18
**Approved UX scope:** ONLY `/login/`, `/apps/`, `/admin/` and the 19 app paths. Public `/` homepage and all assets/content/SEO are permanently FROZEN for this project. Source rules: `docs/ux/00_PREMIUM_ADAPTIVE_MASTER_PROMPT.md`.
**Last verified main (G1):** `0cc389a25beb8f426017eda3afd24c63200a98f6`; recheck latest main before release.
**Development branch:** `feature/premium-app-centre-desktop` (G2).
**Demo login already implemented in js/auth.js:** `user@vesa` / `vesa` (synthetic public user, NOT admin). No change to `js/auth.js` needed.

## G0 — Correct scope and retain original screenshots
**Status:** COMPLETE. Latest app-only Chromium inventory [#39057142785](https://github.com/venkatbangla-boop/vesahost/actions/runs/39057142785) PASS, 147 screenshots / 59 viewport cases / zero failed cases; public homepage excluded. 153-image earlier audit is historical only.
- First baseline CI #39056484795 completed SUCCESS: 153 screenshots, 61 viewport samples, zero failed views. **Historical only**: included the public homepage and initial/scroll positions, not active forms.
- Future UI screenshot collector never navigates to public `/`. Count verified: 22 routes × 2 sizes × 3 positions + 5 edge routes = **147** captures.
- New scoped program prompt rewrites old homepage-redesign request to EXPLICIT NO CHANGE. No root site runtime changed.

## G1 — Premium, functional Login
**Status:** VERIFIED + MAIN PUBLISHED for personal showcase. [Chromium/WebKit CI #39057737377 PASS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39057737377), [main login CI #39057891299 PASS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39057891299), [main Pages #39057891010 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39057891010). Main SHA `0cc389a25beb8f426017eda3afd24c63200a98f6`; desktop/mobile Chromium and WebKit screenshots actually inspected.
**Files expected:** `login/index.html`, new `css/vesa-login.css`; `service-worker.js` cache entry/version only; `tests/personal-demo-release.cjs` cache assertion; new `tests/vesa-premium-login.cjs`; new `.github/workflows/vesa-premium-login.yml`.
**Frozen:** public `index.html`, `css/style.css`, `js/main.js`, all public website assets/SEO and all 19 app engines and auth store.
**Visual direction:** mature navy + ivory, desktop two-column entrance and dedicated right form area; lightweight, no hero video/images. Phone single-column clean login, 44+px touch targets, visible public demo details, correctly spaced forms and buttons.
**Functional contract:** show existing demo `user@vesa`/`vesa`, prefill for one-click login via `VesaAuth.login`; preserve editing, Show/Hide, failed-login feedback, locale/theme and safe `next` to any enabled app. No invalid external redirects.
**Verification:** JavaScript check, fresh isolated Chromium at 320/360/390/768/1024/1280/1440/1920, five themes, EN/BN/HI/TA, skip link/focus, wrong password, one-click real login/session/logout, deep-link + external next, minimum 44px touch; existing platform/accessibility/uniform/domain tests.
**Rollback:** abandon feature branch or revert only login-owned files/worker asset update. No force push.

## G2 — App Centre & Admin premium usability
**Status:** APP CENTRE DESKTOP PATCHED on `feature/premium-app-centre-desktop`; awaiting independent Chromium proof and release. Admin remains NOT STARTED.
- Real desktop screenshot from app-only inventory showed public-home `css/style.css` leaking a two-column `.app-catalogue` grid, squeezing six cards side by side and wrapping app-button labels.
- App Centre-only patch removes the home stylesheet link, explicitly makes each category full-width and standardizes localized card action to `Open workspace`. It changes only the App Centre-owned HTML/CSS/JS, root cache namespace/asset URLs and related regression assertions. Root homepage source/code/images remain unchanged. Workflow CI started at [#39058181360](https://github.com/venkatbangla-boop/vesahost/actions/runs/39058181360); check actual conclusion before main promotion.
- **EXACT NEXT ACTION:** complete Chromium visual/sibling CI for G2, inspect desktop screenshot, fast-forward main only if PASS and verify Pages. Then audit and redesign `/admin/` (not the company homepage), followed by G3 TNA/PPM/AQL active workflow UX.

## G3 — TNA / PPM / AQL active-workflow redesign
**Status:** NOT STARTED
- Focus heavily on opened inspection/PPM/TNA tables and real form states, not splash pages. Preserve CPM, 168 checkpoints and sampling Ac/Re. Profile AQL 11.8 MB before claiming performance causes.

## G4 — Remaining 16 apps
**Status:** NOT STARTED
- Use task-specific layouts; preserve original domain calculations, locale, reports, saved copies.

## G5 — Final 19-app interactive coverage and performance
**Status:** NOT STARTED
- Cover genuine forms/buttons/links/dialogs/exports and device widths with Playwright/screenshots and measured scroll/render metrics, then safe sequential main promotion + Pages verification.

## Durable CONTINUE command
In any new chat, the user may write only **Continue**. Fetch actual GitHub branches/main/CI; read `AGENTS.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`, `docs/ux/00_PREMIUM_ADAPTIVE_MASTER_PROMPT.md` and THIS tracker. Resume at **G2, or the first actually unfinished gate after latest GitHub SHA**, not at the beginning, and do not change public homepage or previously completed app engines. Work one auditable patch at a time; test, commit, record exact SHA and next action, then proceed inside available session. Do not claim background execution.
