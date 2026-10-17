# VESA 360 Premium Login & 19-App UX — Durable Execution Tracker

## 2026-10-18 — LATEST G3 VERIFIED CHECKPOINT

**Accepted release:** TNA active-order Master Sheet is now immediately accessible. Runtime `4a35070f2b6e17a69830db1c602c199ae95cc4a2`, feature Chromium/G13 [#39059962505 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059962505), main G3 [#39060152136 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39060152136), main TNA [#39060152231 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39060152231), Pages [#39060152341 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39060152341). Original G3 active-screen baseline [#39059572072 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059572072): 36 states / 60 screenshots / four viewport sizes, zero JS errors. The CSS-only TNA change retains 8 actions; all engines/save/print intact. **G3 overall is NOT finished.**

**EXACT NEXT = G3-PPM-02**, not G0/G1/G2/G3-TNA. Audit PPM section navigation, 168 checkpoints and editor mobile ~25,986px scroll and 773 under-44px heuristic before changing its UI. Keep one top shell, preserve PPM GO/HOLD, legacy records/reports/EN/BN/HI/TA, run PPM real Chromium+TNA/AQL sibling regressions. AQL 11.78MB profiling follows. Source/readiness: `docs/ux/02_G3_ACTIVE_WORKFLOW_AUDIT.md`.

**Public company homepage remains FROZEN.** Genuine human UAT still 1 PASS / 0 FAIL / 48 NOT TESTED. A bare `Continue` means resume from the latest actual GitHub SHA and this exact next action, not restart.

---


**Updated:** 2026-10-18
**Approved UX scope:** ONLY `/login/`, `/apps/`, `/admin/` and the 19 app paths. Public `/` homepage and all assets/content/SEO are permanently FROZEN for this project. Source rules: `docs/ux/00_PREMIUM_ADAPTIVE_MASTER_PROMPT.md`.
**Most recently published application code:** `1ef581fabe5a6aac03473eeb9c7bb33ce5cff43c` (G2 Admin); GitHub Pages #39059208861 SUCCESS. Recheck actual main when resuming.
**Next work:** G3, actual active TNA/PPM/AQL workflow review. Branch to be created safely from latest main.
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

## G2 — App Centre and Admin premium usability
**Status:** DONE IN MAIN for the personal showcase, with source-pinned browser evidence.

- **App Centre desktop fix:** old public company CSS inadvertently made two category sections share a row, squeezing cards/actions. Removed `/css/style.css` import from `/apps/`, kept the public stylesheet itself unchanged, and made category groups full-width. Initial branch Chromium [#39058181360 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39058181360), Pages [#39058323153 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39058323153).
- **Sibling compatibility correction:** generic card action `Open workspace` broke five app-specific label assertions. Restored existing localized app-specific link names without reverting the full-width premium card layout. Tested all five browser workflows together in [#39058838363 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39058838363); published source `5d12ca22758aac356b1063582ce17ca21c9b3c66`; main per-app suites and [Pages #39058970672 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39058970672).
- **Admin redesign:** existing `/admin/` unnecessarily imported company homepage CSS. Implemented standalone, theme-based `css/vesa-admin.css`, responsive form/users/history sections, familiar buttons/fields and mobile width. **All original JS handlers for Create User, role, Block/Reactivate, login history and CSV remain byte-for-byte unchanged.** Real screenshots inspected at desktop 1280 and phone 390 (artifact in #39058691029). Merged safely onto corrected App Centre main and passed isolated 19-app/sibling Chromium [#39059094672 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059094672). Promoted to main at `1ef581fabe5a6aac03473eeb9c7bb33ce5cff43c`; [Pages #39059208861 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059208861); [main App Centre browser #39059209116 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059209116). Separate external public HTTP byte probe not available.
- User's prohibited company homepage (`/`, root `index.html`, `css/style.css`, `js/main.js`, images/videos/SEO) **was never changed**. Only app/login/admin UI, independent tests and service worker asset-version namespace were modified.

**EXACT NEXT ACTION:** G3 — create isolated read-only Chromium screenshot / interaction / performance baseline for **active** TNA, PPM and AQL internal forms (not just first landing cards) at desktop 1440/1920 and phone 390/320. Compare screen density, field labels, button hierarchy, scroll lag, save/open/report and menu states. Use genuine synthetic fixtures and existing approved app test commands. Patch one proved presentation fault at a time after file-level ownership audit; preserve TNA CPM/G17/locale dates, PPM 168 and GO/HOLD, AQL SamplingEngine/Ac-Re/AR11, local saved-copy compatibility and print/offline. Do not touch the public homepage.

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
In any new chat, the user may write only **Continue**. Fetch actual GitHub branches/main/CI; read `AGENTS.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`, `docs/ux/00_PREMIUM_ADAPTIVE_MASTER_PROMPT.md` and THIS tracker. Resume at **G3, or the first actually unfinished gate after latest GitHub SHA**, not at the beginning, and do not change public homepage or previously completed app engines. Work one auditable patch at a time; test, commit, record exact SHA and next action, then proceed inside available session. Do not claim background execution.
