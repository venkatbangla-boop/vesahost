# VESA Unified Page and Workspace Contract

**Status:** Mandatory platform contract for every existing and future VESA browser page  
**Contract ID:** `VESA-UNIFIED-PAGE-SHELL-v2`  
**Approved direction:** 2026-10-12  
**Applies to:** `/`, `/login/`, `/apps/`, `/admin/`, `/apps/tna/`, `/apps/ppm/`, `/apps/aql/`, every nested screen/dialog/report entry point, and every future app or page.

This document reconciles `UI_CONSISTENCY.md`, the TNA/PPM/AQL UX specifications and the current rendered application. It is the durable interpretation of “One VESA User Experience.” If an older UI document permits a separate authenticated bar plus an app header, this contract wins for page-shell and visual-duplication decisions. It does not override any TNA, PPM or AQL business rule.

## 1. Non-negotiable outcome

Moving between VESA pages must feel like moving between sections of one product, not between unrelated websites. A page may have different domain content, but it must not invent its own top-level brand, navigation, account controls, spacing system or responsive behavior.

Every authenticated application viewport has:

1. **one VESA logo;**
2. **one top-level header/navigation region;**
3. **one application identity/breadcrumb;**
4. **one user/account area;**
5. **one Settings entry;**
6. **one save-state message;**
7. **one ordered `Home / File / Edit / View / Tools / Help` command system.**

“One” means one rendered, visible owner—not two visually similar rows and not a hidden legacy row that can reappear at another breakpoint.

## 2. Required page anatomy

```text
[ONE SHARED VESA HEADER]
[logo | App Centre > current app/page | Home File Edit View Tools Help | save state | Settings/Admin/Logout]

[FLOWING PAGE CONTENT — never another site/app header]
[page title + record/order/inspection identity]
[status / next action]
[inline section or stage navigation]
[app-owned forms, tables, evidence and reports]

[shared footer / Help > About attribution]
```

- The shared header is the only sticky/fixed top-level navigation region.
- Page titles, summaries, filters, stage tabs and record identities flow with content and do not reproduce the logo, account name, Settings, Logout or the universal six menus.
- Domain navigation may exist inside content, but it uses one shared inline/collapsible component and never becomes a second global header, sidebar philosophy or sticky rail.
- `Powered by EGENVA` belongs in the footer, About/help, splash content where no authenticated shell is present, or reports—not as repeated top chrome.

## 3. Route-specific rules

### Public home and login

- A logged-out page may use one standalone VESA brand treatment because the authenticated workspace header is absent.
- Login must not render an additional application header beneath its own brand panel.
- After authentication, the destination replaces the login chrome; it does not stack another brand bar under it.

### App Centre and Admin

- Use the same platform header, gutters, typography, cards, dialogs and account-control placement.
- App cards come from the registered catalogue. A new app must not create a separate landing-site design.

### TNA, PPM, AQL and future workspaces

- Mount the same shared header owner exactly once.
- The app supplies descriptor text, save state and command callbacks; it does not create another logo/user/logout/settings/header row.
- A home, welcome or empty-state panel may show the app name and purpose, but must not repeat the official logo or simulate a second site header while the shared header is visible.
- Legacy menus may remain in source only while migration is in progress; they must be disconnected/removed once their actions are adapted, and tests must prove they cannot reappear at any supported width.

### Dialogs, viewers and reports

- Dialogs inherit shared tokens, label alignment, button order, focus/escape/return behavior and mobile sizing.
- In-app viewers use the same page gutters and must not add another account/navigation bar.
- Printable/downloadable reports may include the official VESA report logo and report header; the interactive workspace header is excluded from print. This report branding is not a duplicate application shell.

## 4. Central ownership

| Concern | Sole owner | App responsibility |
|---|---|---|
| Authenticated header, logo, breadcrumb, account controls | `js/vesa-workspace-shell.js` with `js/auth.js` session adapter | Supply app descriptor and allowed callbacks |
| Shared layout, tokens, breakpoints, menus, dialogs | `css/vesa-workspace.css` plus approved root theme tokens | Use shared classes/tokens; no competing global reset/header CSS |
| Language/theme preferences | `js/preferences.js` through the shared Settings entry | Translate app-authored text; preserve entered values and IDs |
| App registration | `js/app-catalogue.js` | Register route, title, description and capabilities |
| Domain screens and decisions | TNA/PPM/AQL app owner | Preserve its own calculations, schemas, records and approvals |

Only one platform patch group may change shared shell/auth/preferences/catalogue assets at a time. App adapters follow after the platform patch. Never fix duplication with independent per-app `top`, `z-index`, `display:none` or `!important` patches that can diverge later.

## 5. Shared visual system

- Use the approved VESA navy/ivory family and semantic tokens for surface, text, muted text, border, action, focus, success, warning and danger.
- Use one spacing scale, page gutter system, content maximum width, card radius/elevation, field height, button hierarchy and icon style.
- Header/content left edges align across Login, App Centre, Admin, TNA, PPM and AQL.
- Body/form text remains readable; status never relies on colour alone; keyboard focus remains visible.
- User-facing copy uses plain task language. Routine screens do not expose JSON, CSV, IndexedDB, schema, runtime, stack traces or internal test names.
- English, Bengali, Hindi and Tamil presentation changes labels/guidance only; it never translates user data or mutates identifiers/business decisions.

## 6. Responsive contract

| Width | Required behavior |
|---|---|
| `>=1200px` | One full shared header with six ordered menus and one account area. |
| `768–1199px` | Same owner and order in compact form; no second row introduced as a shortcut. |
| `320–767px` | Logo, app/page identity, save state and one accessible Menu control; the drawer contains universal commands and account actions. |

- Touch targets are at least 44 CSS px where practical.
- Menus support touch, keyboard, Escape, outside-click and focus return.
- No horizontal page overflow, covered fields, overlapping sticky regions or clipped dialogs at 320, 360, 390, 768, 1024, 1280 and 1440 CSS px or 200% zoom.
- Long tables may scroll inside a labelled table viewport and need a usable mobile/card alternative when the task is not inherently tabular.

## 7. Explicit duplication prohibitions

A page fails this contract if any supported state or breakpoint shows:

- two VESA logos in application chrome;
- global auth bar plus separate app header;
- user name or role in more than one top-level region;
- Settings, Admin, Logout, App Centre or Home duplicated as competing controls;
- two visible universal menu systems;
- independently sticky app menu, section tabs, filter bar or sidebar competing with the shared header;
- different global menu order, button vocabulary or save-state wording between apps;
- a splash/welcome layer that makes the authenticated workspace look like a second website;
- local CSS that visually hides duplication without removing duplicate ownership/accessibility nodes.

## 8. Mandatory checklist for every new page/app

Before implementation:

- [ ] Register route and app/page descriptor with the existing catalogue/shell.
- [ ] Identify the shared shell owner and confirm the page will not render another logo/header/account/menu system.
- [ ] Reuse shared tokens, gutters, typography, controls, dialogs, responsive breakpoints and Settings/preferences.
- [ ] Define only the domain-specific content/navigation the page owns.
- [ ] Record save/open/report behavior, accessibility, translations, data sensitivity, rollback and tests.

Before acceptance:

- [ ] Compare Login → App Centre → page and TNA ↔ PPM ↔ AQL transitions visually.
- [ ] Prove exactly one visible logo/header/account/menu owner in DOM and screenshot evidence.
- [ ] Test 320/360/390/768/1024/1280/1440, portrait/landscape where available, 200% zoom, keyboard and touch-equivalent interaction.
- [ ] Test all supported themes and English/Bengali/Hindi/Tamil without changing saved business data.
- [ ] Prove menus, save state, Settings, App Centre, Admin (when authorized) and Logout have one working path.
- [ ] Prove dialogs/viewers/reports do not overlap or reintroduce a shell.
- [ ] Run TNA, PPM, AQL and shared-shell regressions before accepting any shared UI change.

A new page is **not accepted** when these checks are absent, even if its domain feature works.

### Permanent owner rule — visual uniformity and `DEMO LIVE` gate (2026-10-14)

This contract is the permanent visual standard for **all existing and future VESA applications**. Every interface change must first read and follow this contract. Reuse the shared VESA header, CSS, navigation, English/Bengali/Hindi/Tamil language system, theme, and common buttons, forms, tables, typography, spacing, save actions and responsive patterns. App-specific content may differ, but global visual ownership and presentation must not diverge.

Before marking an application **`DEMO LIVE`**:

1. Automatically inspect and compare its desktop, tablet and mobile rendered screens with the approved VESA reference screens; fix observed UI drift and record the verification outcome.
2. Verify its relevant working menus, forms, save/reopen, reports and app-specific functionality without altering TNA, PPM or AQL domain calculations merely to standardize visuals.
3. Verify the **actual publicly served route and version** after deployment. A passing local test, Git commit or push alone is not proof that the demo is live.

If required evidence is absent, record **`DEMO NOT YET VERIFIED`** rather than claiming `DEMO LIVE`. Preserve the existing regression, data-safety and release-authorization requirements.

## 9. Current regression and migration boundary

The 2026-10-12 rendered audit reopened the prior shared-header acceptance: TNA visibly contains a global authenticated bar plus a second app header, each with a VESA logo and repeated identity/navigation controls. PPM contains its legacy home branding plus the global authenticated bar and shared workspace bar. AQL uses a separate branded entrance beneath the authenticated bar and has additional app-specific navigation after entry. These are implementation defects, not the approved target.

Migration order:

1. inventory every top-level/sticky owner and callback on Login, App Centre, Admin, TNA, PPM and AQL;
2. define the one shared shell DOM/API and central tokens;
3. adapt TNA without touching scheduling/data behavior;
4. adapt PPM without touching its 168 checkpoints or GO/HOLD rules;
5. adapt AQL without touching SamplingEngine/Ac-Re/stage decisions;
6. remove/disconnect legacy duplicate chrome;
7. run the complete cross-app visual, functional and persistence regression;
8. accept the uniform experience only after reviewed screenshots and DOM ownership checks pass.

## 10. Safety and rollback

- Shell changes never authorize modifications to domain formulas, approvals, schemas, saved formats, user records or provider boundaries.
- Preserve routes and deep links. Do not clear local browser data to make a layout change work.
- Patch in reversible groups: platform shell/tokens, then one adapter per app, then cleanup.
- If an adapter fails, revert that group while keeping the previous app usable; do not ship half-integrated duplicate bars.
- Production deployment remains separately authorized.
