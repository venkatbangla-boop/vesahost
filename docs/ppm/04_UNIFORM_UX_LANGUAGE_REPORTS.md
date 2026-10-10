# 04 — PPM 360 UX, VESA Uniform Visual Contract, Languages & Reports

**Contract ID:** `VESA-UNIFORM-UI-v1` — the following shared section MUST match the AQL package and be applied to future TNA. Product UI acceptance cannot pass while header/menu patterns are different. Screen mock descriptions are desired behavior, not a claim that the current repo implements them.

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

## PPM-only screen plan (same shell; PPM content)
1. **Home:** New PPM, Continue Last PPM, Open Saved PPM, Practice Example, Open Saved Copy, Recent PPMs; no fake test-specific build messages, standalone intro after login not required unless approved.
2. **Meeting Overview:** buyer/factory/style/PO, selected product/processes, PP sample/ref/date, meeting participants, completeness, blocker count, last saved.
3. **Meeting Sections:** inline section list, search, incomplete-only and critical-only filter; reveal contextual guidance on request. Avoid showing all 168 checkpoints at once by default.
4. **Approvals:** required vs optional, approved/pending/rejected/exempt with who/when/proof; clear current status per submission and revision.
5. **Measurements:** exact POM/spec/unit/allowed below/above/actual with visible result and reason; never silently auto-convert.
6. **Actions / Follow-Up:** owner/due/status/evidence; next-action strip. A closed action does not imply a released order.
7. **Change Review:** controlled diff, impacted approvals/signatures, why re-review is necessary, revision acknowledgement.
8. **Release / Signatures:** GO/CONDITIONAL GO/HOLD reason; cannot approve via color-only button; visible finalization and read-only lock.
9. **Reports:** one report builder with required export formats and buyer/factory views.

## Progressive-disclosure rule
On screen show only the next meaningful actions and unreviewed/blocked counts. Expert mode may expand all checkpoint categories. Avoid jargon such as `engine`, `schema`, `JSON`, `indexDB`, `profile migration`, and `import raw` in ordinary UI. A child/first-time user should understand **what they need to fill, why, and what comes next**, but do not hide actual business restrictions.

## PPM report matrix
| ID | Title | Must contain |
|---|---|---|
| PR01 | Full PPM Meeting Report | order/meeting identity, relevant controls, remarks, approvals, measurements, actions, release, participants, signatures |
| PR02 | One-Page Buyer Summary | PO/style/date, status, blockers, pending buyer approvals, release decision, outstanding actions |
| PR03 | Factory Action List | owners, due dates, criticality, issue/action/status/evidence references |
| PR04 | Approval Register | each required flag, status, submit/approve references/dates/people, explanation when exempt |
| PR05 | Measurement Check Report | spec, tolerances, actual, valid result, unit, POM, remarks |
| PR06 | Change & Revision Report | original controlled baseline, changed fields, impact, reviewer, time and signoff invalidation |
| PR07 | Production Release Decision | GO/CONDITIONAL/HOLD rationale, conditions, approvers, signed record version |
| PR08 | Management Blocker Summary | blocked sections/checkpoints, next owner/action, pending time |
| PR09 | Attendance & Minutes | roles, names, meeting date, decisions, action assignment (when supplied) |
| PR10 | Custom Checkpoint & Evidence | additive user-defined controls and evidence references, source/revision |

Existing report paths must retain their data and semantics. New reports should be additive, clearly optional and independently tested. Print/PDF: VESA logo, page number, generated timestamp, `Powered by EGENVA`, company, PO/style/factory, current vs finalized state, high-resolution evidence, Bangla/Hindi/Tamil glyph QA, safe page breaks and no cropped last row. Do not claim digital signatures are independently authenticated.

## UI tests unique to PPM
- Create/continue/save/edit/close/reopen without losing unsaved last field; disabled actions explain why.
- 168 applicable checkpoints remain reachable via same universal section-navigation component, screen-reader and keyboard.
- Modal overlay/menu interactions never change a finalized record.
- Measurement comparison and validation status unchanged by theme/language/mobile width.
- A long notes field, two-row approval register, evidence image and signature canvas stay fully accessible at 320px; printable full report has no clipped bottom labels.
- Practice data visibly labelled and not presented as buyer-approved.

**Hand-off note:** root `UI_CONSISTENCY.md` currently documents an earlier style-only cleanup. Treat this newer contract as proposed V2 target; codex must audit/reconcile it and change the root document only in a separately approved platform patch.
