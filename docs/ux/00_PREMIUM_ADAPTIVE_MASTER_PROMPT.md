# VESA 360 — PREMIUM APP WORKSPACE REDESIGN / PERMANENT AUTO-RESUME

**Latest owner correction (2026-10-18) overrides every earlier UX prompt: DO NOT CHANGE \`vesaent.com/\` HOMEPAGE.** This is the main, non-negotiable design-scope rule. The public home, all its sections/anchors/text, company imagery/video, SEO, contact/legal pages, and public CSS are outside the UX redesign. Do NOT schedule, prototype, screenshot, rewrite, delete, retheme, optimize or publish a homepage change as part of this program. Only the login and authenticated application experience is in scope.

**In scope only:** \`/login/\`, \`/apps/\`, \`/admin/\` and the 19 existing routes under \`/apps/<app>/\`, including their real menus, page states, forms, controls, reports and offline behavior. A root service-worker cache list may be modified minimally if necessary to ensure a login-specific asset refresh, but the actual public homepage files/assets/runtime must remain byte-identical. \`css/style.css\`, \`index.html\`, \`js/main.js\`, root hero images/videos, SEO/content, \`privacy.html\` and \`terms.html\` are **FROZEN**.

**Repository:** \`venkatbangla-boop/vesahost\`; source of truth = latest real GitHub commit, CI and progress files. Personal-showcase synthetic/demo records only. No new paid infrastructure; no real confidential buyer, bank, factory, personnel or other private records. Never repeat the business-use discussion or request the old blueprint ZIP.

## First priority — premium Login and verified public demo access

GitHub \`js/auth.js\` ALREADY defines synthetic demo **user ID \`user@vesa\` and password \`vesa\`** (lowercase), with the user role. Never invent a variant, rewrite the genuine underlying account store or expose any other credential. The owner has authorized displaying these existing public-demo details prominently on the Login page and making the login usable in **one click**. Keep the standard login form, username editing, Show/Hide password and failure feedback; prefill the demo values clearly, and use VesaAuth.login normally to preserve existing local event/session semantics. Neither a hardcoded link that skips VesaAuth nor a second unrelated login flow is acceptable.

Redesign Login completely: one logo, premium desktop split-panel workspace entrance (balanced page geometry, mature VESA navy/ivory/blue family, sharp hierarchy, professionally sized buttons and inputs), and a compact Android/iOS-friendly single-column mobile sign-in. 5 existing themes must work, as must EN, BN, HI, TA. Do not load the 95 KB company homepage stylesheet just to style the login. Use a dedicated scoped Login stylesheet, leaving the rest of the site untouched. The user should instantly understand what to press and see the built-in demo account.

Check that \`?next=/apps/<any of the 19>/\` returns to the intended allowed app; reject external/off-site return URLs and do not leak admin-only pages to the demo user. Keep local sessions, App Centre and existing logout behavior.

## Other application designs — mature, adaptive, not generic AI cards

- **Desktop (1280–1920 px):** dense-but-readable professional SaaS workbenches, clear side/navigation hierarchy where appropriate, 36–44px desktop button heights with strong primary/secondary/tertiary difference, important data/form controls above the fold, justified wide-screen utilization.
- **Mobile (320–430 px):** one task at a time, 44px+ touch targets, no accidental sideways scroll, safe area and keyboard-safe forms, no pointless nested scrolling, responsive table/card adaptations, quick action reachability. Native-inspired interaction, NOT a fake screenshot of Android/iOS.
- **Workflow-specific visual patterns:** Precision Workbench (Costing/PO/LC/Commission/Supplier Comparison); Control Tower (TNA/Production/Shipment); Studio & Review (Tech Pack/Sampling/Product Development/Label); Quality Field Flow (AQL/PPM/Factory); Operations (Packing/Fabric Trims/Buyer CRM/Claims).
- Shared design tokens, app shell, focus patterns, form/step language, statuses, typography and colors; **not** identical card counts/headers for unrelated work.
- Preserve ALL approved calculations, revisions/baselines, TNA/PPM/AQL engines, local saved-copy compatibility, multilingual behavior, Excel/PDF/print, and synthetic-only data. Avoid adding new features that invent sourcing or approval rules.

## Visual and performance assessment — do real work with Playwright

Run the existing GitHub Actions Chromium scripts; build additional Playwright user-journey tests as needed. Use synthetic local session fixtures (not real logins). Record desktop and phone screenshots for Login + App Centre + Admin + ALL 19 apps. Include active/filled forms, actual pages or tab states, save/reopen, reports, dialog and menu states, not just 19 initial splash screens. Use 320/360/390/430/768/1024/1280/1440/1920 and zoom 200%; save screenshot manifest and aggregate contact sheets as CI artifacts, not into shipped public code. Inspect real screenshots and name visual defects before patching. Collect per-route time-to-render, long tasks, scroll lag, DOM/asset size; distinguish measured problems from assumptions. AQL \`index.html\` is ~11.8 MB: profile; do not blindly compress/rewrite Ac/Re or take away offline functionality.

Existing visual inventory history: Playwright Chromium [#39056484795](https://github.com/venkatbangla-boop/vesahost/actions/runs/39056484795) created **153 synthetic screenshots successfully**, but it also included the public homepage under an OLD incorrect scope and mostly captured initial/scroll positions. Use it only as historical visual evidence. Never include the public homepage in follow-up runs. Do not call that initial-only collection a comprehensive inspection of buttons/forms/reports. Follow-up collector must be login/apps only.

## Sequence with strict patch/safety boundaries

**G0 — corrected program scope and continuity:** adjust this prompt, UX tracker and screenshot inventory to EXCLUDE public homepage; record current GitHub main SHA. No runtime app/business changes.

**G1 — premium Login screen:** inspect \`login/index.html\`, \`js/auth.js\`, \`js/preferences.js\`, current root style/service-worker and platform browser tests. Change only login markup, new scoped \`css/vesa-login.css\`, read-only tests/workflow, and root SW cache entries needed for fresh Login asset serving. Source defaults \`user@vesa\`/\`vesa\`; real form login and safely validated next-route. Run real Chromium desktop/mobile login, single visible logo, 5 themes, EN/BN/HI/TA, focus, submit, wrong password, safe redirects, App Centre sibling screens and relevant Node/AQL/PPM/TNA baselines.

**G2 — App Centre + Admin premium visual polish:** use user workflow screenshots (not just initial states). Retain all 19 catalogue links, App Centre Search and Filters. Patch only app entry and admin-owned presentation; shared platform shell stays frozen until audited separately.

**G3 — TNA/PPM/AQL production-like UX:** review real active forms, long scrolling and editing, correct fast paths, responsive/table behavior, offline/save/export and previous controlled domain rules. Patch independently per app after tests.

**G4 — remaining 16 application UX:** domain-specific forms/data density/actions/mobile flow, section navigation, EN/BN/HI/TA, accessible buttons, responsive dialogs, every working feature reachable. No wholesale rebuild.

**G5 — performance + regression + completion:** source-specific measured fixes including large AQL asset path; benchmark mobile scroll, preserve local data and offline. Report exact real screenshots and independent CI, then safe main promotion/Pages verification and rollback plan. Homepage files always untouched.

## Important continuity mechanism

Read \`AGENTS.md\`, \`VESA_PROGRESS.md\`, \`VESA_RESUME_PROMPT.md\`, \`docs/platform/VESA_UNIFIED_UI_CONTRACT.md\`, this document and \`docs/ux/01_PREMIUM_UX_EXECUTION_TRACKER.md\` at the start of **every new ChatGPT chat/Work session**. GitHub is the persistent checkpoint, not this chat. A bare **“Continue” or “NEXT”** means: fetch latest actual main/development branch/Actions, read tracker \`LAST COMPLETED / TEST / IN PROGRESS / BLOCKED / EXACT NEXT ACTION\`, resume the first actionable incomplete item at exact file/branch, run tests, commit, then advance to next item during available session. Do not restart the master plan, overwrite finished code, ask the user to recopy this prompt, or repeatedly ask permission for the already approved UI direction. Never claim ongoing background work outside an active Work session.

**Reporting in concise Tamil only:** current screenshots finding, patch files, Node/Chromium CI results, deployed exact SHA, and one precise next action. Mark \`verified\` only when the evidence exists. Any design change should be practical and visibly premium, not “AI-powered” decorative fluff.

**CURRENT WORK RIGHT NOW:** G0/G1/G2 and TNA G3-TNA-01 are complete. Released TNA active Master Sheet first-screen improvement code `4a35070f2b6e17a69830db1c602c199ae95cc4a2`, real Chromium/G13/G17 and main Pages SUCCESS. 60 real active TNA/PPM/AQL synthetic workflow screenshots and outstanding PPM/AQL findings are recorded in `docs/ux/02_G3_ACTIVE_WORKFLOW_AUDIT.md`. **EXACT NEXT: G3-PPM-02** inspect 168-checkpoint mobile editor navigation, text and 44px targets, develop one small reversible focus/scroll usability improvement preserving GO/HOLD, saved-copy schema, print and TNA/AQL. Then measure AQL 11.78MB document performance. Public company homepage FROZEN. On `Continue`, fetch latest actual main, CI, trackers and advance from PPM — never restart.
