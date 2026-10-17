# VESA 360 - Single Repository Architecture and Code Placement Contract

## 1. Project shape (verified vs planned)

- **Verified current form:** Static browser-first, multi-page HTML/CSS/JavaScript application collection; existing GitHub repository; each app may use browser-local storage and optional locally scoped service worker.
- **Target architecture model:** **Domain-first modular monolith in one public-source repository**, with one shared presentation shell and independently owned app domains.
- **Runtime/event shape:** Browser request/event-driven UI, local calculation and manual import/export, offline-capable where tested. No server process, public API or persistent always-on service.
- **State:** Each browser device/profile owns its own local records. GitHub tracks source/tests only, never private production or buyer records.
- **Deployment:** Existing static publishing can host only approved personal/demo content subject to current host terms. This roadmap does not publish any new app.
- **Language:** Existing plain JavaScript with standalone `*.cjs` Node tests; do not introduce TypeScript, npm dependencies, webpack or a paid build system without independent justification and approval.

## 2. Required existing owners - read, reuse, do not replace

| Repository path | Owner / role | This portfolio may do |
|---|---|---|
| `AGENTS.md` | Most recent root instructions | Read; add a short reference only if no conflict. |
| `VESA_RESUME_PROMPT.md` | Current whole-program resume | Read and preserve. New portfolio has a separate resume prompt. |
| `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` | Current free/browser-local scope | Read, respect existing constraints. |
| `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` | Strict one-VESA UI contract | Read before page changes; one shared header. |
| `js/vesa-workspace-shell.js` | One header, menus, settings and app identity | Reuse API; don't fork or duplicate. |
| `css/vesa-workspace.css` | Shared appearance tokens/layout | Reuse; app CSS should be domain-scoped. |
| `js/preferences.js` | EN/BN/HI/TA and theme preference | Register one app label across all four languages. |
| `js/app-catalogue.js` | Canonical App Centre entries | Register one **verified, approved** route at a time. |
| `js/auth.js` | Existing browser-session convenience | Never represent as server security or real tenant isolation. |
| `apps/tna/`, `apps/ppm/`, `apps/aql/` | Frozen app-specific domains | Read contracts/tests; never wholesale rewrite during new-app build. |
| `templates/vesa-next-app/` | Existing example only, NOT deployed | Inspect/copy selectively after app-specific structure approval. |

## 3. Proposed parent/child placement

```text
vesahost/                                  (existing single repository)
  AGENTS.md                                (existing, preserve)
  VESA_RESUME_PROMPT.md                    (existing, preserve)
  docs/
    platform/                              (existing platform contracts)
    roadmap/                               (install these plan docs under here)
      00_READ_ME_FIRST.md
      01_MASTER_PORTFOLIO_ROADMAP.md
      ...
      blueprints/APP-01_packing-container.md
      ...
      blueprints/APP-15_product-development.md
  js/
    vesa-workspace-shell.js                 (existing platform shell)
    preferences.js                         (existing platform preference owner)
    app-catalogue.js                       (existing platform registry)
  css/
    vesa-workspace.css                      (existing platform tokens)
  apps/
    index.html                             (existing App Centre)
    tna/                                   (existing, preserve)
    ppm/                                   (existing, preserve)
    aql/                                   (existing, preserve)
    costing/                               (separate handover; only if integrated later)
    <one-approved-new-app>/                (create when app is approved)
      index.html
      assets/<slug>.css
      src/
        bootstrap.js
        application/workspace-controller.js
        domain/<app-domain>.js
        domain/<app-policy>.js
        data/local-record-port.js
        data/saved-copy-codec.js
        reports/report-model.js
        i18n/app-copy.js
      tests/
        domain.test.cjs
        save-reopen.test.cjs
        browser-workflow.cjs
  templates/
    vesa-next-app/                          (existing, untouched starter)
  tests/                                    (existing platform/regression)
```

**No actual app folders are created by the roadmap.** The common per-app child directories are a proposed scalable template, not a command to restructure working TNA/PPM/AQL files. Use existing ownership if a target app already exists.

## 4. Domain ownership and module placement

| Layer | Inputs | Outputs | State | Forbidden behavior |
|---|---|---|---|---|
| `src/domain/` | Immutable validated plain data | Derived calculations, warnings, explicit decisions | None / pure functions | DOM, storage, network, import of sibling domain source |
| `src/application/` | User commands, typed domain ports and current draft | Validated transitions, view state, save/report requests | Active record + unsaved/revision state | Reimplementation of formula in UI, direct sibling store reads |
| `src/data/` | Schema-versioned records and backups | Saved/loaded validated snapshots | App-specific browser storage only | Cross-app mutation, remote uploads, silent destructive migration |
| `src/reports/` | Immutable reviewed records | Print/export-safe read-only report model | None | Recalculating buyer approvals or changing source record |
| `src/i18n/` | Text keys + selected platform language | Authored app copy | No business state | Translating user-entered IDs, prices, dates or status data |
| `src/bootstrap.js` | Platform shell/auth-convenience and app dependencies | Mounted application | Short-lived page-session wiring | Second global header, global DOM mutation of other apps |
| Existing shared platform | App descriptor, label and callbacks | Single VESA UX / App Centre | UI preference only | Business computation or private app-specific data storage |

## 5. Naming rules

- Folder/route names: `kebab-case`; keep URLs stable after release.
- JavaScript source: lowercase `kebab-case.js`, except honor existing naming conventions already in the repo.
- Existing global IIFEs: namespace `Vesa<DomainName>` only if no ES module transition is approved; never create ambiguous `window.app` collisions.
- Pure function names: `camelCase`, clear units in values or field names: `lengthCm`, `weightKg`, `amountUsd`, `dateIso`.
- Storage keys: `vesa.<app-slug>.records.v<major>`, with collision check and user/profile scoping appropriate to existing repo.
- Tests: `<domain>.test.cjs` or `<domain>-browser.cjs` matching existing Node/Playwright conventions.
- Data versions: explicit `schemaVersion` + migration registry; original `recordId`/revision linkage never discarded.
- Avoid dumping-ground folders `common`, `utils`, `misc`, `helpers`; platform helpers require clear ownership and cross-app proof.

## 6. Dependency direction and call flow

```text
User action / local selected saved copy
            |
            v
Existing VESA shell -> app bootstrap -> app controller
                                         |
                        +----------------+----------------+
                        |                                 |
                   pure domain                       local-data port
                   engine/rules                   IndexedDB/localStorage
                        |                                 |
                        +---------------> read-only reports
                                             |
                                      print / workbook / PDF
```

- Allowed: app UI -> app controller -> pure domain; controller -> app-specific storage/report adapters; app shell -> descriptor/callback only.
- Allowed cross-app: explicit user-reviewed serialized snapshot/reference -> validated import at destination.
- Forbidden: direct sibling `localStorage` keys, peer app private globals, circular imports, domain -> UI, automatic cross-app authority, hidden remote API or credentials, inferred GO/SHIP/APPROVE.

## 7. State, lifecycle and failure boundaries

- On create: generate an app-scoped record ID and a `schemaVersion`, populate unknown business fields as `null` or `Needs Information`.
- On edit: clone validated state; record dirty/saving/saved/failed visibly in the shared shell. Keep uncommitted draft available on write failure.
- On save: bounded validated local write, preferably atomic staging/revision; don't clear original on quota failure.
- On reopen: verify schema version, references and amounts; display old versions via tested migration only.
- On portable import: validate format/version/size/identity, avoid prototype keys and spreadsheet formula injection, stage before commit, don't overwrite on failure.
- On logout/browser clear: warn that data is device/profile-local; user-downloaded saved copy is the independent recovery path.
- On service-worker update: test dirty-tab preservation, fail-safe cache switch and old saved-copy compatibility before registration.
- On external network: default **none** for app records. Local user-approved `mailto:` contact is separate from browser storage; no background uploads.
- On approvals: only explicitly recorded actor/time/authority from source evidence; never infer from demo admin login.

## 8. Criteria for an intentional architectural split later

Do not create microservices now. Reconsider repository boundaries ONLY when a measured issue arises: independent release cadence materially conflicts; published static bundle approaches relevant provider limits; strict confidentiality/security requires a genuine approved backend; cross-app API contracts stabilize and create independent teams; or a domain genuinely needs a different runtime. This is a future proposal, not an authorization to buy infrastructure.