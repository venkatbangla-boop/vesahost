# VESA 360 — PREMIUM ADAPTIVE EXPERIENCE: TOTAL SITE & 19-APP REFORM

**Owner direction, 2026-10-18:** Fully redesign the public \`vesaent.com\` website and improve every real workspace in the VESA 360 19-application suite. Desktop currently does not feel like premium software; mobile appearance is better but mobile scroll/load can lag. Avoid a generic repeated AI-generated-looking card template. First explain the chosen visual direction and what is being preserved. Compare real rendered screenshots before replacing working UI.

**Repository:** \`venkatbangla-boop/vesahost\`. **Personal showcase, synthetic/local data** is permanently confirmed; do not waste further user time re-litigating it. Do not request old ZIPs or paid services. Never invent a customer/factory approval.

**Historical accepted baseline when this plan was written:** main \`7f3e49f7fd404efe5aa6332540ec52d49e4c75a9\`; App Centre U1 and TNA G17 personal preview already merged and Pages-green. On execution use actual newest main/CI, NOT the historical SHA as current truth.

## 1. Outcome — professional software on BOTH desktop and phone

A) \`/\` — **premium apparel company homepage**: fresh editorial design from a clean layout, clear apparel imagery and sourcing story, elegant navigation, credible services/countries/categories, buyer inquiry, footer/legal/SEO. Remove needless scattered sections, gimmicky cursors, distracting background canvas/scroll effects, unrelated repetitious copy. Use video only where optional, measurable, reduced-motion accessible and not blocking load. Reuse authentic pre-approved images and truthful content from the existing source. Preserve legitimate contact information and page metadata, anchor/deep links or redirect them, sitemap/canonical and key legal pages. Do **NOT** replace it with a fake SaaS dashboard or simply delete the site.

B) \`/login/\`, \`/apps/\`, \`/admin/\` — **premium product entrance**. One clean VESA brand, uncluttered login, grouped App Centre with fast search, useful app descriptions, user guidance and clear next action. Site home and app interface can have different layouts but matching type, color and logo.

C) All 19 routes under \`/apps/\` — **professional adaptive application shell**. Reuse one branded authenticated header/navigation/account/save status, but allow five clearly differentiated domain compositions:
- **Precision Workbench** (Costing, Purchase Order, Order Commission, LC Payment, Fabric Supplier Comparison): compact rich grids/tables, in-place filters, forms, keyboard productivity, right detail inspector on wide desktop.
- **Control Tower** (TNA, Production Tracker, Shipment Documentation): status and actionable priorities, milestones, timeline/Gantt/stages, contextual details and progress.
- **Studio / Review** (Product Development, Tech Pack Spec, Sampling Approval, Label Artwork Approval): large draft/revision previews, comparison, version provenance, edit/review panel.
- **Field Workflow** (AQL, PPM, Factory Vendor): clear progress, single next checkpoint, touch-friendly decisions, grouped checks, sticky mobile bottom actions only if they do not overlap content.
- **Operations & Logistics** (Packing Container, Fabric Trims, Buyer CRM, Claims Disputes): focused forms, records, references, tables and justified calculations.
Each application is a working product, not a static mockup. The visual component contract is consistent; the content layout is NOT mindlessly identical.

## 2. Visual concept: "VESA Precision / Editorial Enterprise"

Public home: mature editorial composition, restrained ivory/navy and warm neutral surfaces, premium garment photography, purposeful whitespace, confident typography and no AI-style floating blobs/bento gimmicks. Brand credibility first, not decoration.

Apps desktop: denser-but-legible professional SaaS workbench, 12-column responsive grid where beneficial, collapsible app/navigation rail (where architecture permits), top command bar, clear breadcrumb/context, data-dense tables with pinned identifiers and a detail panel, understated panels and dividers. At 1440–1920 px actually USE horizontal space rather than presenting a narrow mobile card column in the center. Primary actions are prominent but not enormous pill buttons. Use 3 heights: compact desktop control ~36–40 CSS px, comfortable ~40–44, touch target minimum ~44 on mobile. Secondary/tertiary/icon-only actions are correctly distinguished, with accessible names. Use only one primary CTA per logical group.

Apps mobile: 320–430 px one-column task-first screens, bottom action area only where necessary, 44+ CSS px touch targets, sheet-style dialogs, progressive disclosure, filter drawers, compact step/progress indicator, only the fields needed for current step, keyboard-safe and safe-area-aware. NO full-page horizontal scroll or multi-megabyte DOM churn. iOS WebKit and Android Chromium feel natural while remaining accessible responsive web/PWA.

Components: consistent 4/8 px spacing rhythm, real readable typography and 1.4–1.65 line heights, 12–16 px controlled radii (avoid one huge radius everywhere), deliberate status/contrast, zebra or line-divided data grids as appropriate, accessible focus ring, sensible skeletons/empty/error states, undo/confirm feedback, responsive charts, subtle transitions only for affordances, reduced motion respected. No ornamental moving backgrounds over working forms. EN / BN / HI / TA with proper font fallback and no truncation of long translations; data values, IDs and formulas must not be translated.

## 3. Step ZERO — actual visual and performance inventory, NOT guessing

Before editing any runtime file:
1. Read \`AGENTS.md\`, \`VESA_PROGRESS.md\`, \`VESA_RESUME_PROMPT.md\`, \`docs/platform/VESA_UNIFIED_UI_CONTRACT.md\`, original 15 blueprints and current app trackers. Also read \`docs/portfolio/15_PERSONAL_DEMO_UX_FINISH_PROMPT.md\` and this document.
2. Inspect the actual homepage, login, App Centre, admin and **all 19 app directories, screen states, form types, buttons, links, dialogs, exported reports and available samples**. Catalog all visible routes/actions; do not confuse source existence with a reachable feature.
3. Use GitHub Actions + Playwright Chromium with **synthetic browser-local fixture only**, no real customer login or records. Browser session test context must be isolated per route; record errors and exceptions. Capture **150+ screenshots across initial, scrolled and representative active/form/report states**, at desktop 1440/1920, tablet 768/1024, Android 390 and iPhone 375/390; cover 320 and 200% zoom edge cases. More screenshots are required if 150 do not cover materially distinct screens.
4. For EVERY screenshot write a machine-readable manifest with route, screen state, viewport/device, browser engine, source SHA, timestamp, file path and test status. Store screenshots as CI artifact (not in repo code). Generate contact sheets for actual visual review. Do not state they were personally reviewed until images have actually been inspected.
5. Inspect every reachable link, action, step, saved record, form, filter, modal, upload, printing, export and language toggle; test keyboard tab flow, focus trap/escape and iOS/Android touch equivalent. Record each issue with route, selector, current screenshot ID, expected result, owner and severity.
6. Use Lighthouse/Chrome DevTools/PerformanceObserver/Playwright traces as appropriate. Record per-route document/asset sizes, FCP/LCP/CLS lab indicators, JS long tasks/TBT, heap/DOM size, scroll jank, paint/layout counts, CPU cost on 4x throttling, requests, cache/SW overhead, page errors and real offline load. INP requires interactions/field data; do not pretend plain screenshots prove INP.
7. Distinguish documented byte sizes from root causes: currently AQL has approximately **11.8 MB HTML**; public \`css/style.css\` approximately **95 KB**; homepage has looping video, canvas, scroll/cursor effects; PPM has large inline CSS and language bundles. These are **audit hotspots**, not confirmed root causes until profiling.

## 4. Exact redesign and optimization sequence

**PHASE 0 — Baseline and design lock:** visual/performance matrix with actual screenshots, click-path audit and three coherent prototype compositions. Show full desktop 1440 and phone 390 for the *same* page and a difficult long-form page. Choose the VESA Precision / Editorial Enterprise direction as default; allow owner to revise before bulk runtime changes.

**PHASE 1 — Public website REBUILD in isolation:** redo layout from scratch for \`/\` (not merely colors or one more CSS override), preserve factual approved copy and SEO/contact/legal/asset licensing, remove gimmick effects, optional lightweight still-first hero, compressed responsive images, mobile/desktop/focus tests and stable contact journey. Build in a reversible branch; compare before/after and measure user interaction. No site deletion before the replacement works.

**PHASE 2 — Shared platform shell + components:** audited semantic tokens, desktop/phone behavior, buttons, fields, status chips, dialogs, form sections, tabs, tables, save state, error/empty states, menu and focus. Preserve one logo, one actual header and Home/File/Edit/View/Tools/Help. Avoid sitewide wildcard selectors that break app/domain print output. Avoid endless \`!important\` stacking. Snapshot multiple sibling apps before touching shared styles.

**PHASE 3 — Three showcase app redesigns first:** TNA (timeline + Master Sheet), AQL (large inspection workflow), PPM (168 controls). Proof must include complex domain states, desktop and mobile, all languages, old saved copy compatibility, Excel/PDF/print/offline. Do not change CPM, baseline rules, PPM GO/HOLD, AQL Ac/Re, sample selection or their approved engines.

**PHASE 4 — Remaining 16 apps in functional groups:** the app controller may reorganize presentation but preserve all data, formulas, cross-app reviewed snapshot references and reports. No silent placeholder/removed feature. Use small commits and branch gates by app family.

**PHASE 5 — Real performance work:** prioritize measured AQL first-load and scroll; assess safe extraction of inline images/libraries, lazy load, pagination/virtualization, batched DOM updates, defer noncritical work, heavy shadow/blur/background removal, reduce video/motion, compressed assets and cache correctness. Treat the existing 11.8-MB AQL as a business-rule-preservation migration; do not split it blindly or lose offline support. Keep zero actual data loss.

**PHASE 6 — Acceptance and release:** exact screenshots before/after, visual diff, UI/a11y keyboard/mobile tests, Node/domain regressions + real Chromium/WebKit where executable, offline/cross-app/save-copy tests, serving of actual release bytes from Pages and rollback. Merge only independently verified personal-showcase changes into \`main\`; keep records/screenshots/artifacts traceable. Never manufacture human UAT results.

## 5. Measurable acceptance targets

- At 1440, 1600 and 1920 px, intentional desktop layout: no absurd empty center margins, oversized mobile-style buttons or tiny fonts; task-critical data and actions are visible without repeated scrolling.
- At 320, 360, 390, 430, 768, 1024, 1440 and 1920 px: no page-level horizontal overflow, clipped buttons/labels/dialogs, disappearing critical actions, overlapping fixed bars or broken focus. 200% zoom usable.
- Desktop forms use aligned label/field grid and clear focus hierarchy; mobile switches to a single logical flow. Inputs and touch controls meet platform-appropriate sizes.
- All navigable controls actually work or are explicitly, truthfully labeled unavailable. No false “ready”, fake approval, dead save or print controls.
- Lighthouse/Web Vitals guide targets: LCP <=2.5 s, CLS <=0.1, INP <=200 ms **when measured appropriately under realistic conditions**; lab TBT and main-thread long tasks tracked, not confused with real-user INP. Prioritize smooth scrolling (~55–60 fps goal on representative mid-range Android) and a meaningful reduction from captured AQL baseline. Do not invent compliance scores.
- No cross-app record leakage; local Save/Open remains backward-compatible; EN/BN/HI/TA labels preserve data. Print/PDF/XLSX tested across representative flows.
- Zero unexamined screenshot/CI failures. Keep screenshots out of Git and privacy-safe.

## 6. Delivery contract

After each small accepted patch, report concisely in Tamil:
- **FINDING:** the exact screen/issue and screenshot ID
- **FIXED:** files and visual/functional change
- **TEST:** Node/Chromium/WebKit + actual metrics, with CI links and any failures
- **LIVE:** merged SHA + real GitHub Pages/HTTP evidence, if actually deployed
- **NEXT:** one precise next action/owner

Set permanent owner instruction once: personal noncommercial synthetic showcase only. Do not repeatedly raise the same topic. Do not claim future background work; advance within the available session. Never ask for the old ZIP. Never replace an approved calculation with a guessed one. Do not refactor working code to appear busy. A premium visual is an outcome demonstrated through actual screen evidence, not a string such as "ultimate" in CSS comments.

## 7. Starter invocation

> Resume VESA 360 from latest GitHub main. Read this \`docs/ux/00_PREMIUM_ADAPTIVE_MASTER_PROMPT.md\`. First explain the chosen look in Tamil, then run the complete Playwright visual + performance baseline and produce screenshot evidence for all 19 apps and the public website. Design the new premium public homepage and desktop/mobile Precision Workbench prototypes in an isolated branch. Do not change any completed business engine, release without verified tests, or replace good mobile UI with a desktop-only layout. Continue through site, shell, high-complexity apps, remaining apps, performance and final release until all actionable work is complete. Keep the user informed with exact progress, not generic explanations.

**First safe next action:** run the reproducible existing-source Chromium screenshot inventory. Review the screenshots, label genuine design issues, then propose exact file-level patch scope for a desktop-first public website prototype. Runtime remains frozen until this baseline is complete.
