# 04 — AQL 360 UX, VESA Uniform Visual Contract, Languages & Reports

**Contract ID:** `VESA-UNIFORM-UI-v1` — the following shared section MUST match the PPM package and be applied to future TNA. Product UI acceptance cannot pass while header/menu patterns are different. Screen mock descriptions are desired behavior, not a claim that the current repo implements them.

## Normative, app-independent VESA-UNIFORM-UI-v1 contract (must match across PPM/AQL/TNA)

**Core rule:** Same VESA product family on `/`, `/login/`, `/apps/`, `/apps/ppm/`, `/apps/aql/` and planned `/apps/tna/`. Business forms/engine outputs vary; chrome, navigation, human labels and interaction principles do not. Source: actual VESA logo in `/assets/vesa-logo-black.png` (and approved white variant), shared app preferences, public homepage VESA navy/ivory language. No Visa financial brand or invented logo.

### Global screen anatomy
```text
[ ONE CONSISTENT VESA WORKSPACE BAR ]                 (only sticky navigation region)
[ official VESA logo | App Centre > {PPM/AQL/TNA} | Home File Edit View Tools Help | Saved state | User ]
[ Page title + order/inspection identity ]           (flows with content; never separately frozen)
[ Primary task / Next action / status ]
[ Compact summary / filters ]                       (flows with content)
[ Section/stage navigation ]                        (flows with content; no competing fixed rail)
[ App-specific forms, tables and evidence ]
[ Powered by EGENVA / help / build detail ]         (footer or Help > About, not cluttering top)
```
- If existing `VesaAuth.renderUserBar()` remains separate, integrate or position it so the UI has **at most ONE sticky/fixed navigation region in total**. No independent fixed auth + fixed app header + fixed menus + frozen section tabs. One design owner sets offsets from actual measured height, not hardcoded `top: 65px`, `76px`, `0px` overrides. No overlap over fields, modal dialogs or keyboard.
- Desktop >=1200px: full nav labels. Tablet 768–1199px: compact menu/dropdown, same order. Mobile 320–767px: logo + app title + save indicator + one "Menu" control opening accessible single menu/drawer with Home/File/Edit/View/Tools/Help. All menus can be operated with touch, keyboard, Escape, focus return, accessible labels. Touch target >=44 CSS px. Never render six squeezed 11px buttons.
- Dashboard cards, quick metadata and section index are **not sticky**. Optional stage index uses the SAME collapsible component for all apps, rendered inline in mobile; no dedicated different AQL sidebar or PPM section-bar philosophy. AQL can show more stages and PPM more checkpoints inside the same component.
- Only user-requested dialogs overlay the page. On modal close, restore focus and state. Print views hide navigation and retain report title/date. No decorative ribbons or permanent training banners covering content; practice mode label appears inside content and report with obvious "Practice only" status.

### Design tokens & layout
- Derive brand colors from current root `/css/style.css` and theme configuration. Default theme: VESA navy / deep ink, ivory/light surfaces, restrained teal actions, gold only as focus/accent; no separate AQL blue UI and PPM dark-green UI. CSS variables scoped to `.vesa-workspace` and root theme variables, not global selectors with `!important` cascades.
- Honor existing five `VesaPrefs` appearance themes including dark/high-contrast variants; do not hard-code black text on dark theme. Use semantic tokens: `--vesa-bg`, `--vesa-surface`, `--vesa-text`, `--vesa-muted`, `--vesa-border`, `--vesa-brand`, `--vesa-action`, `--vesa-focus`, `--vesa-success`, `--vesa-warning`, `--vesa-danger`.
- Body text >=14px, form text >=14–16px, headings grouped; consistent 8px spacing scale, corner radii, card elevation, icon style and field heights. Use high-contrast status text **with** icons/text (not color alone). Work to WCAG 2.2 AA contrast and visible focus; accessible table captions, form label/error association.
- One uniform page-width strategy: readable content max ~1440px, responsive 1-column on mobile, 2/3-column grid only when there is room, horizontal scrolling only for truly tabular data with an alternative mobile card view. No clipped garment/image evidence, labels, signatures or report tables.
- Header, menus and cards align to the same horizontal gutters across all apps. Use the official VESA logo and consistent full company spelling `VESA Enterprise Inc.`; retain `Powered by EGENVA` where already present.

### Universal menu structure (same order, same behavior)
| Menu | Universal action model | App-specific items go inside |
|---|---|---|
| Home | App Home; Back to App Centre | New PPM / New Inspection / New TNA |
| File | New; Continue Last; Open Saved; Save Now; Make Another Copy; Download Saved Copy; Open Saved Copy; Prepare Report; Download Report; Print Report; Share Report | Only actions actually supported |
| Edit | Undo/Redo where safe; edit controls; revert unsaved edits | PPM amend meeting / AQL revision or reinspection / TNA baseline revision |
| View | Dashboard; Sections/Stages; filters; show blocked; report preview | Related app-specific view filters |
| Tools | The business tools owned by current app | No PPM-only checkpoints in AQL or AQL tables in PPM |
| Help | How to start; glossary; about; where data is saved; export tips | Contextual app guidance |
- Menu actions must have a real handler; hide/disable unsupported actions with an honest reason. No placeholder controls. Do not leak technical words like JSON, CSV, IndexedDB, runtime, schema, stack trace, database, server error, SW, or developer console into routine screens. Internal backups remain versioned/structured.
- Exactly one Save state vocabulary: `Saving…`, `Saved on this device`, `Unsaved changes`, `Could not save — download a saved copy`. Do not call a pending download "securely backed up" until file/restore verified.
- Consistent record-home choices: **New / Continue Last / Open Saved / Practice Example / Open Saved Copy**, plus Search Recent if available. Practice must never overwrite live records. Use plain words in confirmation/error messages and provide clear next action.
- Login/appearance/language controls belong to the central VESA user/Settings experience; no duplicate selectors on every app topbar. Support English, বাংলা, हिन्दी, தமிழ் for app-authored sentences. Language changes must not rewrite user-entered values, buyer instructions, IDs, numeric rules or approval evidence.

### Shared cross-app implementation, not duplicated CSS patches
- Preferred platform files after direct audit and patch acceptance: **new** `css/vesa-workspace.css` (scoped design tokens/layout) and **new** `js/vesa-workspace-shell.js` (shell, menus, measured layout, navigation, optional app adapter). Existing shared files to inspect, NOT automatically overwrite: `css/style.css`, `js/auth.js`, `js/preferences.js`, `js/app-catalogue.js`, `apps/index.html`, `UI_CONSISTENCY.md`.
- Business-owned adapters expose generic capabilities (`new`, `continue`, `save`, `open`, `prepareReport`, `help`, `navigateToSection`, `savedState`) but never receive data policy from the shell. AQL remains sampling owner; PPM remains meeting/release owner; TNA remains timeline owner.
- Coordinate exactly ONE platform PR/change group for common assets, then one PPM adapter group and one AQL adapter group. Avoid concurrent agents separately changing `css/style.css` or root auth/preferences. If another branch changed a shared file, rebase and re-run all three app tests before merging. A future TNA implementation MUST adopt the same contract.

### Screen acceptance
A single shared browser acceptance suite must compare logo, header geometry, menu order/position, saved indicator, breadcrumb/return to App Centre, Help, language/theme, mobile drawer, focus, dialog, print exclusion and scrollbar behavior for AQL/PPM/TNA. Test widths 320, 360, 390, 768, 1024, 1280, 1440; portrait, landscape, long-screen scroll, touch, keyboard, zoom 200%, different theme. Capture real screenshots. **Pass only with no overlapping sticky regions and no covered inputs.** Use one shared UI baseline; app content intentionally differs.

### Not a security claim
Static GitHub Pages + client-side login do not provide true private delivery of HTML/assets or cross-company server authorization. Keep personal/customer records local by default, never write them into public GitHub, and scope live collaboration separately behind authenticated backend before any buyer access.

## AQL-only screen model (same shared shell; only content differs)
1. **Home:** New Inspection, Continue Last Inspection, Open Saved Inspection, Practice Example, Open Saved Copy, recent inspections and actual save state.
2. **Inspection Setup:** buyer, factory, order/PO/style, inspection stage, reference/approved buyer manual, packing-list revision, quantity, scheme and counting basis.
3. **Sampling Plan:** selected group by, selected approved table/edition/level/AQL, sample n, alloc by lot/color/size, unsupported cell guidance, complete/incomplete indicator.
4. **Inspect:** defect form, Critical/Major/Minor, defect location, sample/carton/piece ID, evidence and follow-up.
5. **Measure:** POM/spec/unit/tolerance/actual comparisons, record exceptions; do not introduce generic buyer spec defaults.
6. **Packing & Site:** carton numbering and random selection, size ratio/labels/barcodes, shipment packing reconciliations and loading when selected.
7. **Stages / Quality Controls:** 13 predefined stages inside the SAME inline stage navigator component as PPM's 168-checkpoint section navigator. Permit filtering relevant steps and search.
8. **Review:** ready/pending/rejected reasons, Ac/Re, approvals, date, inspector, locking and independent reinspection links.
9. **CAPA / Analytics:** failed findings, correction, follow-up, stage trend and counts (named basis) without misrepresenting pass rates.
10. **Reports:** one unified report builder: buyer/factory/inspector output with evidence and decisions traceable to the record.

## How beginner users should experience AQL
Do not start with 35 tool menu items or raw numerical table on the first screen. Show a guided wizard (`Set up inspection -> Confirm sample -> Check products -> Record defects -> Review result -> Prepare report`). A novice should see `What should I check next?` with a concise reason. Expert users can open exact sampling/detail tables through View/Tools. A missing policy source is **Needs information**, never a silent default.

## AQL 15-report register
| ID | Title | Required content |
|---|---|---|
| AR01 | Buyer Final Inspection | order, lot, sampling source/edition, sample, Ac/Re, defects, conclusion, approvals, references |
| AR02 | Factory Quality Follow-Up | findings, corrective actions, owners, status and evidence |
| AR03 | Sampling Plan & Allocation | selected buyer plan, group/lot code, allocated vs checked, unsupported explanation |
| AR04 | Defect Breakdown / Pareto | severity, counts, denominator/basis, observed categories, no invented KPI |
| AR05 | Measurement Report | POM, unit, spec/tolerance, actual, comparison |
| AR06 | Fabric Roll Inspection | roll/lot, area/width/length, points, approved grading method, outcome |
| AR07 | Incoming Materials / Shade | material/lot, quantity, checks and containment |
| AR08 | Cutting / IPC / Inline | selected stage snapshots, workmanship, first output and issues |
| AR09 | Endline & Pre-Final Readiness | packing/measurement/lab/needle readiness and pending actions |
| AR10 | Rework / Reinspection Chain | original failed report, corrective event, independent reinspection reference |
| AR11 | Packing / Carton Random Selection | factory/third-party carton IDs, packing list reference, method/seed, discrepancies |
| AR12 | Container Loading | container condition, carton count, seal, photos, handover |
| AR13 | CAPA Tracker | issue/root cause/action/evidence/verification, unresolved items |
| AR14 | Supplier Quality Audit | QMS observations, critical controls, corrective follow-up |
| AR15 | Management Quality Dashboard | multi-order stage/status/quality trends with explicit count basis and completeness |

Stage-specific reports must preserve source outcome logic; new summaries are read-only. Support Download Report, Print Report, Share Report with browser share detection/download fallback. PDF/print should use official VESA company spelling/logo, Powered by EGENVA attribution where existing, page number/time, source policy and record version, reasonable evidence image size/quality, valid Bengali/Hindi/Tamil fonts, full signature/QR/reference where actually available. Never label a locally typed signature as cryptographically verified.

## AQL UI/browser regression checklist
- At 320/360/390px long scroll: no AQL floating sidebar/menubar sits over fields; all menus via one accessible drawer, forms and camera controls usable.
- At 768/1280/1440px: same brand/layout as PPM and TNA, no duplicate top bar, no different menu alignment.
- Native evidence picker/preview/zoom overlays don't collide with VESA shell; modal close restores focus.
- Practice inspection has visible fictional banner inside content/report, never accidentally stored as production proof.
- AQL sampling source, code letter, sample n, Ac/Re and result remain identical when theme/language changes.
- Sampling invalid input and failed save produce clear human message with actionable options, not developer exceptions.
- iOS/Android share or file picker differences have a reliable supported download fallback; do not claim devices tested without device evidence.

**Platform handoff:** root `UI_CONSISTENCY.md` documents earlier cleanup but not this fully unified model. Apply any new shared files in one audited platform patch first, then app adapters. The whole shared normative section above should match the PPM document verbatim in content.
