# VESA 360 - Latest Verified Repository and Recommended VS Code Folder Tree

**Prepared:** 2026-10-10 (Asia/Dhaka)
**Repository:** `venkatbangla-boop/vesahost`
**Published route family:** `https://vesaent.com/`
**Remote `main` HEAD inspected:** `3217e2d094377d4364050900ccf225571e4fdcdc` (`Complete uniform app experience pass`; committed 2026-10-09 18:39:36 UTC)
**Decision:** One extensible VESA App Centre and one reusable workspace UI standard; TNA/PPM/AQL are the CURRENT three apps. The architecture must support any number of future, independently owned apps without shared-UI rewrites.
**Read first:** `AGENTS.md`, `VESA_CONTINUITY_RULES.md`, `VESA_PROGRESS.md`, each app's `06_EXECUTION_TRACKER.md`.

> IMPORTANT: GitHub remote `main` is NOT guaranteed to match the local VS Code/Codex working tree. Local work may already have additional TNA code, uncommitted changes, or feature-branch commits. **Inspect local `git status`, branch, HEAD, and files before copying or modifying anything. Never overwrite the in-progress Codex implementation.**

## 1. Verified remote `main` - current relevant tree

The following paths were returned from the GitHub tree API at the HEAD above. Nonessential marketing images, favicon sizes, and bundled fonts are summarized rather than repeated; they must be preserved.

```text
vesahost/                                      [EXISTING remote main]
|-- .gitignore
|-- CNAME
|-- index.html                                 Website / public homepage
|-- service-worker.js                          Existing root PWA worker
|-- manifest.webmanifest
|-- APP_CENTRE_AUTH_STATUS.md
|-- AQL_RELEASE_STATUS.md
|-- GAP_MATRIX.md
|-- UI_CONSISTENCY.md
|-- README.md
|-- assets/                                    Existing VESA logos, website images, video
|-- css/
|   `-- style.css                              Shared public/login/App Centre stylesheet
|-- js/
|   |-- auth.js                                Browser-local login/session/UI bar
|   |-- preferences.js                         Languages and themes
|   |-- app-catalogue.js                       AQL and PPM catalogue entries
|   `-- main.js
|-- login/
|   `-- index.html
|-- admin/
|   `-- index.html
`-- apps/
    |-- index.html                             App Centre
    |-- aql/
    |   |-- index.html                         Large existing AQL HTML (~11.69 MB)
    |   |-- service-worker.js
    |   |-- ENGINEERING.md
    |   `-- tests/
    |       |-- apply-release-patch.cjs
    |       `-- release-contract.cjs
    `-- ppm/
        |-- index.html
        |-- core.js
        |-- languages.js
        |-- planning-services.js
        |-- planning-panel.js
        |-- record-services.js
        |-- report-service.js
        |-- workspace.js
        |-- workspace.css
        |-- service-worker.js
        |-- manifest.webmanifest
        |-- ENGINEERING.md
        |-- fonts/                              Preserve license and font files
        |-- vendor/                             Preserve bundled PDF library/license
        `-- tests/
            |-- regression.cjs
            |-- planning.cjs
            `-- update.cjs
```

**Not present in this verified remote `main` snapshot:** `apps/tna/`, the `docs/tna/`, `docs/ppm/`, `docs/aql/` specification folders, root `AGENTS.md`, and the master continuity/progress files. Those **have been supplied as handover packages** in this conversation, but may already be in the *local* Codex checkout. Do not interpret absence from `main` as permission to recreate or erase local work.

## 2. Recommended target tree - one VESA ecosystem

Legend: `[E]` existing on inspected remote `main`; `[H]` supplied in the Markdown handover packages (check local before placing); `[P]` proposed location, NOT created by this document; `[C]` conditional, build/deploy only after backend scope/provider approval. A directory can contain a mixture of existing and proposed files.

```text
vesahost/
|-- AGENTS.md                                   [H] Root Codex instruction - merge, never replace
|-- VESA_CONTINUITY_RULES.md                    [H] Whole-program resume and quality rules
|-- VESA_PROGRESS.md                            [H] ONE-CLICK progress (% verified / remaining)
|-- VESA_RESUME_PROMPT.md                       [H] Reusable next-session prompt
|-- VESA_360_RECOMMENDED_FOLDER_TREE.md         [P] This folder-ownership reference
|
|-- index.html                                  [E] Website - preserve
|-- CNAME                                       [E] DNS - preserve
|-- service-worker.js                           [E] Root worker - coordinated changes only
|-- manifest.webmanifest                        [E]
|-- UI_CONSISTENCY.md                           [E] Existing UI history / baseline
|-- APP_CENTRE_AUTH_STATUS.md                   [E] Browser-auth limitation notes
|-- AQL_RELEASE_STATUS.md                       [E] Prior AQL release evidence
|-- GAP_MATRIX.md                               [E] Prior issue/evidence matrix
|-- assets/                                     [E] Official VESA logos and existing assets
|
|-- css/
|   |-- style.css                               [E] Site/Login/App Centre CSS
|   `-- vesa-workspace.css                      [P] ONE shared app shell/token/menu system
|-- js/
|   |-- main.js                                 [E]
|   |-- auth.js                                 [E] Existing local session adapter
|   |-- preferences.js                          [E] One language/theme choice contract
|   |-- app-catalogue.js                        [E] Central registry of current/future enabled apps; only activate verified routes
|   `-- vesa-workspace-shell.js                 [P] ONE shell/menu controller; NO domain rules
|
|-- login/
|   `-- index.html                              [E]
|-- admin/
|   `-- index.html                              [E]
|
|-- apps/
|   |-- index.html                              [E] ONE App Centre for ALL present and future apps
|   |
|   |-- tna/                                    [P; may exist in local Codex branch]
|   |   |-- index.html                          [P] Sole /apps/tna/ HTML entry
|   |   |-- service-worker.js                   [P] Scoped offline bundle; only if audited
|   |   |-- assets/
|   |   |   |-- tna.css                         [P] TNA-only form/process styling
|   |   |   `-- print.css                       [P] TNA-only print treatment
|   |   |-- src/
|   |   |   |-- bootstrap.js                    [P] Startup / dependency composition
|   |   |   |-- application/
|   |   |   |   |-- tna-controller.js           [P] Orchestration / command boundary
|   |   |   |   |-- commands.js                 [P] Command validation
|   |   |   |   |-- session-state.js            [P] Active record/revision/dirty lifecycle
|   |   |   |   `-- portfolio-controller.js    [P] Multi-PO orchestration
|   |   |   |-- domain/
|   |   |   |   |-- record-model.js              [P] Record invariants / baseline
|   |   |   |   |-- template-policy.js          [P] Knit/Woven/Denim applicability
|   |   |   |   |-- calendar-engine.js          [P] Holidays / working days
|   |   |   |   |-- graph-validator.js          [P] Cycle/dependency safety
|   |   |   |   |-- schedule-engine.js          [P] Forward/backward planning
|   |   |   |   |-- critical-path-engine.js     [P] CPM / float
|   |   |   |   |-- capacity-engine.js          [P] Output/capacity planning
|   |   |   |   |-- commercial-engine.js        [P] LC/material deadlines
|   |   |   |   |-- approval-engine.js          [P] Approvals / evidence
|   |   |   |   |-- risk-engine.js              [P] Blockers / delay risk
|   |   |   |   |-- scenario-engine.js          [P] Recovery simulation
|   |   |   |   `-- quantity-engine.js          [P] PO/shipment balances
|   |   |   |-- templates/
|   |   |   |   |-- activity-library.js         [P] Universal garment TNA activities
|   |   |   |   `-- product-profiles.js         [P] Selected product/processes
|   |   |   |-- data/
|   |   |   |   |-- indexeddb-repository.js     [P] Local durable records
|   |   |   |   |-- backup-codec.js             [P] Safe versioned copies
|   |   |   |   |-- migration-registry.js       [P] Versioned migration rules
|   |   |   |   `-- remote-api-adapter.js       [C] Disabled until secure API ready
|   |   |   |-- ui/
|   |   |   |   |-- home-screen.js               [P] Common shell adaptation
|   |   |   |   |-- order-wizard.js              [P] Nontechnical setup flow
|   |   |   |   |-- dashboard-screen.js         [P] Today's actions/risks
|   |   |   |   |-- tna-grid.js                 [P] Activity planner
|   |   |   |   |-- timeline-screen.js          [P] Gantt/timeline
|   |   |   |   |-- critical-path-screen.js     [P] CPM explanation
|   |   |   |   `-- portfolio-screen.js         [P] Buyer/factory/PO overview
|   |   |   |-- reports/
|   |   |   |   |-- report-models.js             [P] Read-only audience-specific reports
|   |   |   |   |-- excel-importer.js           [P] Preview/validate import
|   |   |   |   |-- excel-exporter.js           [P] Safe workbook export
|   |   |   |   `-- pdf-exporter.js             [P] Locally licensed exporter
|   |   |   |-- i18n/
|   |   |   |   |-- en.js                        [P]
|   |   |   |   |-- bn.js                        [P]
|   |   |   |   |-- hi.js                        [P]
|   |   |   |   `-- ta.js                        [P]
|   |   |   `-- integrations/
|   |   |       `-- ppm-aql-links.js            [P] Reference-based integration only
|   |   |-- tests/                              [P] Scheduling, storage, UI, reports, integrations
|   |   `-- fixtures/                           [P] Synthetic examples only
|   |
|   |-- ppm/                                    [E] Retain existing organization initially
|   |   |-- AGENTS.md                          [H] Scoped instructions, merge safely
|   |   |-- index.html                         [E]
|   |   |-- core.js                            [E] 168 checkpoint/domain owner
|   |   |-- planning-services.js               [E] Approvals/measurement/change engines
|   |   |-- planning-panel.js                  [E] PPM user interface controls
|   |   |-- record-services.js                 [E] Save/backup/recovery
|   |   |-- report-service.js                  [E] Reports
|   |   |-- languages.js                       [E] Guidance translations
|   |   |-- workspace.js                       [E] UI/workspace controller
|   |   |-- workspace.css                      [E] PPM-specific styles
|   |   |-- service-worker.js                  [E] Coherent offline cache
|   |   |-- ENGINEERING.md                     [E]
|   |   |-- tests/                             [E] Existing regression/planning/update tests
|   |   |-- fonts/                             [E] Preserve existing licensed fonts
|   |   `-- vendor/                            [E] Preserve existing licensed dependencies
|   |
|   `-- aql/                                    [E] Keep existing huge file until parity proven
|       |-- AGENTS.md                          [H] Scoped instructions, merge safely
|       |-- index.html                         [E] Existing ~11.69 MB application
|       |-- service-worker.js                  [E]
|       |-- ENGINEERING.md                     [E]
|       |-- tests/                             [E] Existing contract + patch utility
|       |   |-- release-contract.cjs           [E]
|       |   |-- apply-release-patch.cjs        [E] DO NOT run blindly
|       |   |-- sampling-regression.test.cjs   [P] Numeric parity
|       |   |-- inspection-flows.test.cjs      [P] Inspector actions/decisions
|       |   `-- offline-restore.test.cjs       [P] Save/open/cache proof
|       |-- domain/                            [P] ONLY after sampling parity tests
|       |   |-- sampling-engine.js             [P] Sampling tables and Ac/Re
|       |   |-- result-engine.js               [P] Pass/fail logic
|       |   `-- stage-policy.js                [P] Inspection workflow policy
|       |-- services/                          [P] ONLY after data contract parity
|       |   |-- repository-adapter.js          [P]
|       |   |-- portable-backup.js             [P]
|       |   `-- report-adapter.js              [P]
|       `-- ui/                                [P] Shared-shell adapter first
|           `-- aql-workspace-adapter.js       [P]
|
|-- docs/                                       [H] Developer specifications; not app runtime
|   |-- platform/
|   |   |-- VESA_UNIFIED_UI_CONTRACT.md         [P] ONE canonical cross-app UX contract
|   |   |-- INTEGRATION_ACCEPTANCE.md           [P] Cross-app UI/security/release proof
|   |   `-- APP_ONBOARDING_CONTRACT.md          [P] Checklist for adding unlimited future app types
|   |-- tna/
|   |   |-- 01_MASTER_BLUEPRINT.md              [H]
|   |   |-- 02_DOMAIN_WORKFLOWS_DATA.md        [H]
|   |   |-- 03_SCHEDULING_ENGINES.md            [H]
|   |   |-- 04_UX_LOCALIZATION_REPORTS.md      [H]
|   |   |-- 05_ARCHITECTURE_SECURITY_INTEGRATIONS.md [H]
|   |   `-- 06_EXECUTION_TRACKER.md            [H]
|   |-- ppm/
|   |   |-- 01_AUDIT_MASTER_BLUEPRINT.md        [H]
|   |   |-- 02_DOMAIN_WORKFLOWS_DATA.md        [H]
|   |   |-- 03_ENGINE_RULES_COMPATIBILITY.md   [H]
|   |   |-- 04_UNIFORM_UX_LANGUAGE_REPORTS.md  [H]
|   |   |-- 05_ARCHITECTURE_SECURITY_INTEGRATION.md [H]
|   |   `-- 06_EXECUTION_TRACKER.md            [H]
|   `-- aql/
|       |-- 01_AUDIT_MASTER_BLUEPRINT.md        [H]
|       |-- 02_DOMAIN_WORKFLOWS_DATA.md        [H]
|       |-- 03_ENGINE_RULES_COMPATIBILITY.md   [H]
|       |-- 04_UNIFORM_UX_LANGUAGE_REPORTS.md  [H]
|       |-- 05_ARCHITECTURE_SECURITY_INTEGRATION.md [H]
|       `-- 06_EXECUTION_TRACKER.md            [H]
|
|-- tests/                                      [P] Current and future app integration/visual regression suite
|   `-- integration/
|       |-- app-centre-routes.spec.cjs          [P] Login -> Apps -> each tool
|       |-- vesa-shell-parity.spec.cjs          [P] Shared menus, sticky regions, mobile
|       `-- cross-app-save-restore.spec.cjs     [P] Each domain isolated / survives changes
|
`-- services/                                   [C] NOT a GitHub Pages backend
    `-- tna-api/                                [C] Separately hosted/provisioned auth API
        |-- src/                               [C] auth, orders, approvals, audit, notifications
        `-- tests/                             [C] Tenant/permission/sync/concurrency proof
```

**Future app placement rule:** A new approved application gets `apps/<new-app-slug>/index.html`, app-owned modules/storage/tests and, if needed, `docs/<new-app-slug>/` and `apps/<new-app-slug>/AGENTS.md`. `<new-app-slug>` is a naming example, NOT an actual directory. Do NOT pre-create unused app folders. Do NOT create a `future-apps` catch-all. The existing three app paths remain stable.

**Technical simplification:** This tree is an ownership **target**, not an instruction to scaffold all files now. Additional TNA screens listed in `docs/tna/05_ARCHITECTURE_SECURITY_INTEGRATIONS.md` remain in scope; place them inside the same `apps/tna/src/ui/` family when their owning checkpoint is reached. Same for AQL extracted modules: leave the giant current HTML unchanged until numeric and backup parity tests are accepted.

## 3. Exact documentation package mapping

Install Markdown sources into their designated paths **only if missing**, or carefully merge with newer local versions:

| Supplied package | Source -> target |
|---|---|
| `VESA_TNA360_7_MD_Files.zip` | `AGENTS.md` at root; six `docs/tna/*.md` files |
| `VESA_PPM360_Rework_7_MD_Files.zip` | `apps/ppm/AGENTS.md`; six `docs/ppm/*.md` files |
| `VESA_AQL360_Rework_7_MD_Files.zip` | `apps/aql/AGENTS.md`; six `docs/aql/*.md` files |
| `VESA_360_MASTER_CONTINUITY_KIT.zip` | `VESA_PROGRESS.md`, `VESA_CONTINUITY_RULES.md`, `VESA_RESUME_PROMPT.md` at root |
| This folder-tree handover | Root `VESA_360_RECOMMENDED_FOLDER_TREE.md` (optional to commit, useful in VS Code) |

`VESA_PPM_AQL360_Rework_14_MD_Combined.zip` is an alternate combined source for PPM + AQL, **not an additional 14 files to import twice**. The whole program has 21 app Markdown handover files (7 per app) + 3 master continuity Markdown files. This tree document is supplemental.

## 4. Module ownership / responsibilities (single writer where shared)

| Module | Owns | Inputs -> outputs / persistent state | Must NOT own |
|---|---|---|---|
| `js/vesa-workspace-shell.js`, `css/vesa-workspace.css` [P] | One navigation system, VESA branding, shared appearance/menu order, responsive shell | App descriptor + navigation callbacks -> visible shell; initializes/disposes event listeners once | TNA schedule, PPM GO/HOLD, AQL Ac/Re |
| Existing `js/auth.js`, `js/preferences.js`, `js/app-catalogue.js` | Browser-local session, preferences, extensible app registry/App Centre links | Local browser session/theme state; validated app descriptors determine visible cards; existing flows preserved | Production server-side security, app domain logic, unsupported routes |
| `apps/tna/src/application` | TNA commands and active record lifecycle | Validated edits -> immutable/versioned record -> repository adapters | Domain formulas in UI handlers |
| `apps/tna/src/domain` | Working-day, dependency, CPM, capacity, risk, approvals, shipment calculation rules | Explicit input values -> deterministic outputs; no persistent mutable globals | DOM, storage, network, invented defaults |
| `apps/tna/src/data` | IndexedDB/save/backup/version migration/sync boundary | Versioned read/writes; initialization/rollback/backups | Calculating CPM or silently resolving conflicts |
| `apps/ppm/core.js`, `planning-services.js` | Current PPM checkpoint/decision/approval/measurement rules | PPM meeting -> controlled statuses/signatures and reports | AQL sampling or TNA timelines |
| `apps/ppm/workspace.js`, `record-services.js` | PPM UI orchestration and record recovery | Save queue/locked record/recovery lifecycle | Global shared shell policy copies |
| `apps/aql/index.html` then audited extracted modules | Sampling/inspection/release stages, records, reports | Preserve existing stored data and numerical decisions | Replacing Ac/Re tables for cosmetic improvements |
| `docs/*`, `VESA_PROGRESS.md` | Specification, engineering evidence, completion status and NEXT ACTION | Human-readable Git-controlled progress; never private records | Runtime customer data, access tokens, false release claims |
| `tests/integration` | Cross-app shell and route parity | Synthetic data and browser proofs | Actual buyer/factory approval certification |
| `services/tna-api` [C] | Trusted multi-user identity, tenant/order permissions, audit, server notifications | Authorized server events, database, queue lifecycle | Secret tokens in public site or client-only authorization |

## 5. Architecture contract (what Codex must preserve)

- **Project shape:** current public GitHub Pages + stateful offline-capable JavaScript apps (modular-monolith frontend, user-action/event-driven). Future TNA secure collaboration is a **separately deployed** authenticated service, not a GitHub Pages subdirectory doing backend work.
- **Chosen structure:** feature/domain-first inside `apps/tna`, incremental domain extraction inside `apps/aql` only after full numerical parity, and **retain PPM's verified present modules**. Platform shell is a narrow owned cross-app capability, not a generic `shared/` or `utils/` folder.
- **Naming:** kebab-case directories and `.js/.css` files; `PascalCase` classes for stateful owners; `*.test.cjs` or existing `.cjs` integration tests; stable IDs stay unchanged; no unapproved file renames. `.md` filenames use the supplied names for exact tracker references.
- **Allowed dependency flow:** `UI -> app controller/application -> domain policies -> repository contracts -> adapter`; read-only reports consume snapshots; platform shell depends on common UI contracts and callback interfaces only. Domain NEVER depends on UI, browser APIs or infrastructure. No circular imports. No direct PPM -> AQL private storage or AQL -> TNA private model access.
- **Canonical call:** user action -> one shared visible command UI -> app-specific controller -> validation -> domain engine -> versioned record -> app-owned save adapter -> dashboard/report re-render. Future backend: API handler -> auth/tenant permission -> application/domain -> database adapter -> audited response.
- **State/lifecycle:** each app owns its own active record/dirty state/user-local namespace. IndexedDB, backup formats, audit/revisions and offline worker updates are application-owned. Shared shell owns navigation event listener setup/disposal, not saved customer content. Never clear browser data to fix an update. Immutable baselines and unchanged historical approvals. Multi-tab concurrency must warn or detect version conflicts where supported.
- **Future apps:** shared platform/shell is app-neutral. Never branch globally on only `tna|ppm|aql`; use an explicit app descriptor and an app-local adapter. New app registration requires an audited, ready route, correct branding, tests and release gate. No dormant cards or empty scaffold folders.
- **UI:** exactly one coherent VESA user/session bar + one consistent application command region (avoid multiple independent sticky/fixed menu bars). Common `HOME / FILE / EDIT / VIEW / TOOLS / HELP` order. Internal domain tabs may be horizontally scrollable or collapsible; do not freeze every section. Same VESA logo, menu spacing, common responsive breakpoints, colors, language/theme preferences (en/bn/hi/ta), save/report language and mobile ergonomics. Domain content may differ.
- **Quality:** inspect real relevant files FIRST, list change-set paths and frozen paths, prove numerical/data parity with synthetic fixtures, test save->reopen->recovery and offline update before refactoring or publishing. Never assume a visually matching app is numerically correct.
- **Security:** current GitHub Pages browser login cannot protect raw app assets nor provide server-verified tenant isolation. Phase 3 cloud features require separately authorized provider/infrastructure. External-blocked work may be documented and safe adapters tested; do not claim live security, scheduled alerts or sync without proof.

## 6. Safe install / migration order - no existing code moves required

1. Open your REAL local `vesahost` folder in VS Code. Run `git status --short`, `git branch --show-current`, `git log -1 --oneline`, `git remote -v`, and inspect existing `AGENTS.md`, `docs/`, and `apps/tna/` if present. Preserve all uncommitted work.
2. Finish/verify the already running Codex checkpoint before integrating new instructions. Never forcibly stop, reset or checkout over uncommitted work.
3. Merge the three handover packages and continuity kit **without overwriting newer local files**. Keep one root `AGENTS.md` (from TNA), scoped `apps/ppm/AGENTS.md`, and scoped `apps/aql/AGENTS.md`.
4. Let Codex reconcile `VESA_PROGRESS.md` against actual existing source and test evidence. The existing GitHub `main` snapshot does **not** justify a numeric progress percentage for the more recent local workspace.
5. Audit the shared shell/menu ownership once, then implement a single platform patch with cross-app screenshots/tests. Establish `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` only after reconciling current `UI_CONSISTENCY.md` and the PPM/AQL `04_...UX...md` documents.
6. Continue TNA gates and PPM/AQL gates from each current tracker, with safe, separately testable patches. Do not simultaneously rewrite common `js/auth.js`, `js/preferences.js`, `css/style.css`, or root service worker from two app sessions.
7. Test `/login/`, `/apps/`, `/apps/tna/`, `/apps/ppm/`, `/apps/aql/`, report generation, original saved-copy compatibility, one-navigation layout at 320/390/768/1280 CSS px, bilingual/Indic guidance, and offline cache upgrade.
8. Preserve previous Git commits and a safe rollback point. Push/deploy to public `main` **only with explicit user release authorization**; do not run a destructive cache/database cleanup.

## 7. Future-app extension contract (MANDATORY)

**Scope boundary:** TNA, PPM and AQL are the first three applications, **not the maximum or hard-coded allowed set**. The exact number, names and business domains of future apps are unknown. Keep future app types and count open-ended, but do not build speculative applications or pre-create empty app folders.

### Future app registration

1. New apps are added as `apps/<app-slug>/index.html` with independently owned `domain/`, `application/`, `ui/`, `data/`, `reports/`, `tests/` only as justified by real app requirements. Domain-first ownership, no empty decorative subfolders.
2. Register approved apps through the central `js/app-catalogue.js` registry; use validated descriptors: stable `id` and unique route, display name, description, ordering, enabled/ready status, translation keys, optional icon/capability metadata. Never expose a new card until its route and login guard have passed smoke tests.
3. App Centre must render the registered enabled apps rather than needing HTML or layout rewrites for each addition. `js/vesa-workspace-shell.js` (if adopted) and `css/vesa-workspace.css` remain neutral; they receive app identity and callbacks as configuration. They must not hard-code an exact app count or a three-app switch statement.
4. Each app owns its own computation, validation, data schema, reports, storage namespace, service worker scope, migrations, and fixtures. New features must not alter existing TNA/PPM/AQL calculation or acceptance rules.
5. Future apps inherit VESA logo/colors, responsive shell, Home/File/Edit/View/Tools/Help menus, task-language save/open/report actions, language preference en/bn/hi/ta, accessible controls, app switch/navigation, and safe offline/update behavior where relevant. Domain content, forms and required approvals vary by app.
6. `js/auth.js` remains a browser-local demo/session adapter on the current static site, NOT secure server authorization. Multi-user/tenant access for future apps requires separately approved server-side identity and access control.
7. At onboarding, define route and owner, review data sensitivity, record format/version, imports/backups, reports, offline boundary, translations, tests, rollback and the exact files changed. Include new cross-app visual regression coverage and catalogue navigation check.
8. Do not change historical progress percentages retroactively when adding a **new approved project**. `VESA_PROGRESS.md` tracks the current release scope (TNA/PPM/AQL/shared shell) and lists additional apps under `FUTURE BACKLOG — NOT IN CURRENT %`. Once a future app is approved, open a new release baseline/weighting with explicit scope, date and prior baseline preserved.
9. Do not publish automatically or display mock applications as real. Existing app routes remain stable; all added domains and external backend connectors require their own release gates.

**Example only (DO NOT CREATE):**

```text
vesahost/
  apps/
    index.html                  # dynamic App Centre from approved registry
    tna/                        # current
    ppm/                        # current
    aql/                        # current
    <new-app-slug>/             # created ONLY when next app is approved
      index.html
      domain/                   # add ONLY if the app needs it
      application/
      ui/
      data/
      tests/
  docs/
    platform/
      APP_ONBOARDING_CONTRACT.md # proposed reusable onboarding checklist
    <new-app-slug>/             # approved future app specifications/tracker
```

### Onboarding gate for EVERY future app

`idea -> requirements -> file-level audit -> scope lock -> architecture/owner map -> isolated implementation -> golden domain tests -> save/restore compatibility -> shared UI parity -> security/access review -> stage review -> explicit production authorization -> catalogue enabled`.

No completed gate = no claim of deployment readiness. Preserve app-independent shared services even if only three apps are currently active.

## 8. Unresolved risks and status

- **Remote/local mismatch:** latest remote `main` lacks TNA/docs; local active Codex may be ahead. Reconcile first.
- **AQL size/monolith:** `apps/aql/index.html` is ~11.69 MB. Moving rules without golden tests risks inspecting correctly but calculating wrong.
- **PPM stored records:** 168 checkpoint identities, saved-copy versions, signature invalidation and worker-update behavior must remain compatible.
- **UI drift:** PPM and AQL have historically separate command bars; enforce ONE contract and one owned implementation, not repeated CSS patches.
- **Cloud availability:** GitHub Pages cannot supply real secure buyer/factory tenant collaboration; `services/tna-api` remains conditional until an authenticated provider and staging test environment are approved.
- **Progress source:** `VESA_PROGRESS.md` has `NOT MEASURED` until local Codex reconciles real code and tests. Do not invent percentages. Keep unknown future apps outside the current release completion denominator.

**This document is a proposal and install map.** It does not report that files or modules marked `[P]` or `[C]` have been created, tested or deployed.
