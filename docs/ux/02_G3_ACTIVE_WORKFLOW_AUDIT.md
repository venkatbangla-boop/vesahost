# VESA 360 G3 — Active Workflow Evidence and TNA Release

Updated: 2026-10-18. Last verified runtime code SHA: 4a35070f2b6e17a69830db1c602c199ae95cc4a2.

User scope is only /login/, /apps/, /admin/ and 19 application routes. The public vesaent.com/ company homepage, root index.html, css/style.css, js/main.js, imagery, SEO, legal pages and content are permanently FROZEN. All test records are fictional. This report is engineering proof, NOT human UAT.

## 1. Actual code ownership and audit scope

- TNA: apps/tna/src/bootstrap.js owns screen rendering and sets body.tna-has-active-order when a plan is open. apps/tna/src/merchandising-sheet.js owns Master Sheet content. apps/tna/assets/tna.css owns its appearance. Domain, scheduling, reports, storage, baseline and G13–G17 rules remain frozen.
- PPM: apps/ppm/index.html owns its inline UI presentation and editor controller; master checkpoint identities and status decisions remain frozen. It displays 168 master checkpoints.
- AQL: apps/aql/index.html owns entrance, home, inspection state; its sampling Ac/Re, stages, reports and old records are frozen.
- The read-only test added in this checkpoint is tests/vesa-g3-active-ux-audit.cjs, with CI in .github/workflows/vesa-g3-active-ux-audit.yml. It uses a fresh synthetic browser session for every route/viewport; captures screenshots and lab metrics as downloadable CI artifacts. No confidential user/order data or homepage URL used.

## 2. BEFORE real Chromium audit

Independent synthetic workflow [CI #39059572072 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059572072) generated 60 screenshots from 36 actual page states at 320, 390, 1440 and 1920px. States: TNA wizard -> 101-row sheet -> date edit; PPM New -> editor -> guide; AQL entrance -> home -> fictional apparel inspection. Zero JavaScript runtime exceptions; NOT a full human functionality certification.

Observed 390px problems:
- TNA open Master Sheet: public-style landing hero / eight large Home action cards / offline and recent sections precede the actual order. Document height ~28,821px.
- PPM active editor: ~25,986px high; 3,647 elements. A screen heuristic counted ~773 visible interactive elements under 44px height; this is an audit indicator, not a claim every item has a touch accessibility failure.
- AQL inspection opened correctly, but the standalone HTML source is 11,783,142 bytes. Do not infer real scroll lag or user INP from file size. ResourceTiming resource totals omit the HTML document's inline code bytes.

## 3. G3-TNA-01 verified patch — active work comes first

Only runtime edit: apps/tna/assets/tna.css. Scope is screen media AND existing body.tna-has-active-order class. It hides the decorative home hero while an order is open, compacts all eight ORIGINAL New/Save/Continue/Open/Backup/Practice/Orders actions into one horizontal 44px+ row, and puts the original TNA plan identity and Master Sheet immediately below. Recent/offline areas remain in the DOM after the working area, not deleted. Print/PDF CSS, calculations, dates, local saved copies, translations, domains, app logo/navigation, and G13–G17 engines remain unchanged. Rollback is reverting this stylesheet's appended scoped block.

Actual top-of-viewport before/after screenshots show the original marketing page replaced with usable order/worksheet context.

| Viewport | Before document height | After document height |
| --- | ---: | ---: |
| Phone 390px | 28,821px | 27,487px |
| Phone 320px | 30,559px | 29,181px |
| Desktop 1440px | 17,874px | 17,489px |
| Desktop 1920px | 17,883px | 17,498px |

Page-level horizontal overflow: none. All eight original actions retained, 44px+ rendered buttons. The benefit is improved first-screen usability; do NOT claim the lab long-task variations establish field performance gains.

Verified independent real Chromium/Node proof:
- [Feature #39059962505 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39059962505): 60 edited-screen captures, the original G13 Save/Open, dates, EN/BN/HI/TA, XLSX/PDF/print, and TNA shell browser checks, plus core TNA/PPM/AQL Node baselines.
- [Main G3 Chromium #39060152136 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39060152136).
- [Main TNA G13–G17 CI #39060152231 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39060152231).
- [Main GitHub Pages #39060152341 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39060152341).

Verdict: ACCEPTED only for this reversible TNA visual patch, not full TNA/PPM/AQL/19-app feature acceptance. Existing genuine human UAT baseline remains 1 PASS, 0 FAIL, 48 NOT TESTED.

## 4. NEXT — G3-PPM-02

Inspect actual PPM navigation, filtering, 168 checkpoints, status buttons, notes, editor mode, Saved/Open, reports and print. An extremely long mobile form and tiny actions are the top UX issue. Find an independently reversible task-first presentation without changing checkpoint identity, GO/HOLD, saved record schema, translations, buyer rules, printable full report or TNA/AQL siblings. Prefer active-section/progressive disclosure only if the original PPM controller permits it without breaking test contracts. Do not add a second sticky app header. Measure scroll and paint on actual browser sessions before claiming performance gain.

After PPM, profile AQL 11.78MB HTML main-document transfer/decode and live inspection scroll before compression or bundle extraction; no changes to AQL Ac/Re/AR11 engine.

Permanent CONTINUE rule: Read actual main SHA and CI, AGENTS.md, VESA_PROGRESS.md, VESA_RESUME_PROMPT.md, docs/ux/00_PREMIUM_ADAPTIVE_MASTER_PROMPT.md and docs/ux/01_PREMIUM_UX_EXECUTION_TRACKER.md. Resume G3-PPM-02; never restart TNA or touch public homepage.
