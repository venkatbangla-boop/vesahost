# 05 — Engineering Architecture, Ownership, Security, Integrations & Deployment

This is the **architecture contract** for Codex, not a claim that the repository is already production ready. Inspect the actual working tree before implementation. Static frontend and secure collaboration backend are distinct runtimes; one TNA product may use both.

## 1. Project shape and architecture decision

- **Project type:** existing GitHub Pages website extended by a feature-first browser application; eventually a modular full-stack application for authorized collaboration.
- **Runtime modes:** single browser runtime for offline/local TNA; optional second authenticated API/server/database runtime for Phase 3 cloud. Hybrid offline/event-driven and request-driven server; stateful records; frontend vanilla JavaScript/HTML/CSS matching current repo; server language/provider chosen only after repo audit and user-authorized infrastructure decision.
- **Primary organization:** **domain-first within the TNA feature**. Maintain `index.html` entry page at `/apps/tna/`; use organized local scripts/styles rather than a single unreviewable 200k-line script. Browser may serve HTML from GitHub Pages. A single HTML entry is compatible with many private local modules.
- **Why:** TNA has complicated calendars/dependencies/revisions separate from UI, and future backend reuses validated domain contracts. Do not put calculations inside form event handlers, repository adapters or report templates.
- **Forbidden:** cross-module mutable globals, hidden write-through to PPM/AQL, circular dependencies, `utils`/`misc` dumping grounds, hard-coded buyer/factory standards, automatic silent schema migration, fake authenticated APIs, production secrets in any committed file.
- **Trigger to split further:** measured module size/ownership overlap, server execution needs, security boundary, or portfolio performance—not fashion alone.

## 2. Actual VESA repository surfaces known at blueprint time

Verify these paths on the current checkout, including any later changes:

- `index.html` — corporate homepage; **freeze** unless an approved change requires it.
- `login/index.html` and `js/auth.js` — existing login and client-side account/session logic; a browser-local gate is **not** adequate server authorization. Do not disturb unrelated login behavior casually.
- `apps/index.html` — App Centre; populates catalogue dynamically when catalogue module is enabled.
- `js/app-catalogue.js` — existing AQL + PPM catalogue registration; add TNA entry with `id:tna`, correct order, `route:'/apps/tna/'`, localized open label key and enabled state only after route exists.
- `js/preferences.js` — existing four language labels and theme preferences; add `openTna` and required app-centre captions for en/bn/hi/ta; preserve previous app labels and tokens.
- `apps/ppm/index.html` + linked `workspace.js`, `core.js`, `record-services.js`, `planning-services.js`, `languages.js`, etc. — inspect for VESA visual conventions, home and save flow; **do not modify PPM domain calculations** to build TNA.
- `apps/aql/` — treat as existing independent route; inspect actual files/asset loading and live behavior before relying on it; do not overwrite or copy unverified AQL source.
- `assets/vesa-logo-black.png`, `css/style.css` — existing design assets; confirm paths/usage, never replace with unrelated logos.

The repo is public, so **never commit confidential real-order records, buyer contact data, keys, tokens or uploaded attachments**.

## 3. Proposed module/folder structure

This is an initial scaffold contract. During G0 audit, reconcile existing naming/routing and record necessary justified changes in tracker before creating folders.

```text
AGENTS.md                            # durable Codex instructions
index.html                            # existing; preserve
login/index.html                      # existing; preserve unless separately approved
apps/index.html                       # existing App Centre; preserve behavior
apps/ppm/...                          # existing PPM; out of scope for TNA internals
apps/aql/...                          # existing AQL; out of scope for TNA internals
apps/tna/
  index.html                          # sole TNA entry route
  assets/
    tna.css                           # app styling and responsive design
    print.css                         # printable layouts
  src/
    bootstrap.js                      # startup, gate and dependency composition
    application/
      tna-controller.js               # one command/orchestration owner
      commands.js                     # typed command shapes and validation entry
      session-state.js                # active record, dirty flag, immutable snapshots
      portfolio-controller.js         # authorized aggregate query orchestration
    domain/
      record-model.js                 # schema/invariants, revisions
      template-policy.js              # conditional garment profiles
      calendar-engine.js              # explicit civil-day calendar arithmetic
      graph-validator.js              # edge validation, DAG
      schedule-engine.js              # earliest/latest schedule with dependencies
      critical-path-engine.js         # float, controlling paths
      capacity-engine.js              # garment stage throughput / WIP
      commercial-engine.js            # contract/LC/material events
      approval-engine.js              # evidence and gate transitions
      risk-engine.js                  # risk labels / explanations
      scenario-engine.js              # compare/revision fork
      quantity-engine.js              # lot/order balance invariants
      notification-rules.js           # trigger evaluations, not external delivery
    templates/
      activity-library.js             # stable template references from doc 02
      product-profiles.js             # applicable task conditions
      sample-order.js                 # conspicuous practice fixture only
    data/
      indexeddb-repository.js         # local transactional record store
      backup-codec.js                 # versioned safe import/export
      migration-registry.js           # explicit saved-copy migrations
      remote-api-adapter.js           # disabled unless authenticated backend configured
      sync-coordinator.js             # version/concurrency and conflict strategy
    ui/
      home-screen.js
      app-shell.js
      order-wizard.js
      dashboard-screen.js
      tna-grid.js
      activity-editor.js
      timeline-screen.js
      critical-path-screen.js
      materials-screen.js
      approvals-screen.js
      production-screen.js
      shipment-screen.js
      scenarios-screen.js
      portfolio-screen.js
      reports-screen.js
      feedback-dialogs.js
    reports/
      report-models.js                # audience-specific plain data
      excel-importer.js               # preview/map/validate
      excel-exporter.js               # typed safe workbook
      pdf-exporter.js                 # locally bundled library or verified print path
      print-renderer.js
    i18n/
      en.js
      bn.js
      hi.js
      ta.js
      translator.js
    integrations/
      ppm-aql-links.js                # identity checks & safe verified linking
      cloud-contracts.js              # versioned remote DTOs/event shapes
  vendor/                             # only audited, license-checked runtime deps
  tests/
    domain/*.test.js
    storage/*.test.js
    integrations/*.test.js
    ui/*.spec.js
  fixtures/                           # synthetic, never buyer-private
services/
  tna-api/                             # create only when backend scope authorized
    src/
      auth/                            # server-side identity and authorization
      orders/                          # TNA command/query handlers
      approvals/                       # verified actor decisions
      collaboration/                   # revision + conflict + audit
      notifications/                   # scheduled delivery & deduplication
      integrations/                    # signed external provider adapters
      persistence/                     # tenant-aware DB/object storage
    tests/                             # API/RBAC/tenant isolation tests
js/
  app-catalogue.js                     # targeted TNA registration
  preferences.js                       # targeted localized labels
css/style.css                          # existing design baseline; change only if approved
docs/tna/                             # six living specs + progress (see root AGENTS)
  01_MASTER_BLUEPRINT.md
  02_DOMAIN_WORKFLOWS_DATA.md
  03_SCHEDULING_ENGINES.md
  04_UX_LOCALIZATION_REPORTS.md
  05_ARCHITECTURE_SECURITY_INTEGRATIONS.md
  06_EXECUTION_TRACKER.md
```

This tree is **proposed code placement**, not code already created. Exact technical file count can evolve after accepted G0 audit. The *handover package* intentionally contains exactly seven Markdown files, including root `AGENTS.md`.

## 4. Ownership map

| Parent / module | Owns | Inputs / outputs | State lifecycle | Forbidden responsibilities |
|---|---|---|---|---|
| `src/domain/` | Schema, rules, graph/calendars, CPM, production, risk, scenarios | Plain immutable records → deterministic results/errors | Stateless per invocation | DOM, window.localStorage, HTTP, user interaction, PDF |
| `src/application/` | User command coordination, validation, recompute and commit | UI commands → validated record transitions/save | One active session/controller, explicit dispose | Inventing domain rules, raw DB queries in UI |
| `src/templates/` | Product profile/activity library | Profile/process flags → candidate task graph | Immutable versioned definitions | Guessing buyer-required standards/lead times |
| `src/data/` | Local storage, backup codec, remote sync port | Versioned record commands → durable persisted output/conflict | Connection init/close, migration transaction, rollback | Making business/approval decisions |
| `src/ui/` | Semantic screens, form state, keyboard interactions, explanation display | View model → UI and commands | Mount/unmount, event cleanup, temporary edit draft | Scheduling formulas, direct database writes |
| `src/reports/` | Audience-specific view models, Excel/PDF/import/print | Validated record/read model → export | Stateless per export; memory/file cleanup | Changing live records, bypassing permissions |
| `src/i18n/` | Localized predefined strings and UI language selection | String key + locale → safe sentence | Local preference only | Translating user data / changing status IDs |
| `src/integrations/` | PPM/AQL reference normalization and versioned API DTOs | Verified identifiers → link state | No implicit external writes | Modifying PPM or AQL internals |
| `services/tna-api/` | Trusted identity, tenant/order RBAC, persistence, audit, shared updates, reminders | Authenticated HTTP/worker command → validated mutation | Server connection/queue lifecycle | Trusting client role flags as authorization |

### Rules for dependency direction

`UI → application → domain`. `application → repository port` implemented by `data` adapters; `reports → validated read models/domain value objects`; `templates → domain schema` only; `backend controller → application/domain → repository port → database adapter`. Domain must not import UI, browser APIs, framework-only infrastructure or backend SDK. Sibling screens communicate via application commands, not direct mutation of one another. No circular imports. The only cross-app link is a versioned integration adapter.

### Canonical call flows

**Local edit:** button/form → `TnaController.handle(command)` → validate permitted transition → pure domain engine(s) → versioned active state → local repository transaction → recompute view models → refresh UI/Save status.

**Report:** button → authorized read snapshot → report model with audience filtering → export renderer → user-requested download/share; no record mutations.

**Cloud edit:** client auth session → HTTPS request → server identity + tenant/order authorization → validated application command → schema/domain checks → DB transaction (optimistic expected revision) → immutable audit record/event → response/update subscription → local cache refresh/conflict resolution.

**Alert:** server scheduled worker → tenant-scoped policy eval → idempotency/dedupe → provider send → delivery log. When backend provider is absent, local UI shows due tasks; it must **not** claim background notifications.

## 5. File naming / placement rules

- Folders and JS/CSS filenames `kebab-case`; exported class names `PascalCase`; local variables/commands `camelCase`; constants `UPPER_SNAKE_CASE`; test file `*.test.js` (pure/unit) and `*.spec.js` (browser e2e).
- Keep one primary class/responsibility per stateful module; separate pure policies from adapters and rendering.
- Important classes/interfaces must explain purpose, owner, access path, inputs/outputs, state, side effects, failure modes, lifecycle, and brief usage example (comments should be technical and durable, not vague).
- Place functions with the owner of their data and invariant; do not create unowned global helper islands.
- No cross-app modifications to PPM/AQL source to share code unless separate reviewed refactor proves compatibility.
- Future cloud backend can be implemented in its own runtime language if justified and separately validated; frontend contracts remain versioned.

## 6. Browser record lifecycle and offline posture

1. **Bootstrap:** check compatible runtime/browser, VESA route/auth UI gate, initialize theme/language, open local storage, validate schema version, list existing records without manufacturing a new PO.
2. **Open:** load record with validation, migrate copy only under controlled transaction, establish revision token, compute derived state from current as-of.
3. **Edit:** work on explicit staged snapshot; validate and commit via one controller; do not mutate a frozen baseline or global profile definition.
4. **Autosave:** serialized/debounced transactional writes. Show honest success/error; a failed write leaves user-visible unsaved state and options to download backup.
5. **Recover:** bounded snapshot history/previous good copy, validate before restore, require confirmation. Never automatically choose corrupt newest snapshot.
6. **Close/switch:** flush changes or warn, release subscriptions, cancel stale computations, dispose listeners and local handles. User must be able to reopen after reload.
7. **Offline cache:** service worker only after verified asset versioning/update migration and correct scope; no false guarantee that first visit works offline. IndexedDB stores data; service worker caches code/assets, not authenticating private cloud documents.

Storage mode must be explicit: `Local — this browser` vs `Connected — synchronized`. Do not call local data encrypted/secure by default. Client data at rest is subject to browser/device security.

## 7. Cloud collaboration contract (Phase 3 requirements)

**GitHub Pages CANNOT host an authenticated private API, secure database, outbound email scheduler or authorization rules by itself.** The actual collaboration backend must be separately deployed/provisioned under a trusted provider chosen/approved by the user. Do not select a paid vendor or create keys without authorization. Cloud mode is feature-gated until end-to-end verified.

Minimum backend entities/rights:

- `Tenant / Organization`, `User`, `Membership`, `Role`, `Buyer`, `Factory`, `Order`, `Task`, `Revision`, `Approval`, `ShipmentLot`, `Attachment`, `AuditEvent`, `NotificationPolicy`, `DeliveryAttempt`.
- Roles and scoped rights: system/tenant admin, agent manager, factory manager/merchandiser, buyer reviewer, quality reviewer, read-only. Roles cannot alone grant access; enforce **both** tenant membership and explicit order/factory/buyer scopes server-side.
- User onboarding/invitations with expiration/revocation; verified login/session with MFA option through selected identity provider; no production hard-coded demo credentials.
- Per-record optimistic concurrency (`expectedRevision`, `etag`), conflict detection, merge/manual resolution policy; never silently last-write-wins on approvals/baselines.
- Approval event signed by authenticated reviewer with current authority/version; no approval on mere button click by unauthorized client.
- Server timestamps, append-only audit trails / tamper-evident retention as architecture permits; never delete required approval evidence silently.
- Attachments in private object storage, MIME/size validation, malware-scan policy as feasible, short-lived authorized downloads; don't store buyer-private PDFs in GitHub repo.
- Data ownership, export/deletion/retention rules decided with user and applicable law; backups and restore drills; server alerts idempotent and deduplicated.
- HTTPS, scoped CORS for `vesaent.com`, CSRF defenses appropriate to auth mechanism, content-security policy, XSS escaping, rate limiting, input constraints, logs without personal/commercial secrets, dependency patching.
- Financial/commercial notes and pricing isolated from buyer/other factories unless explicitly authorized.

**Minimum API surface** (versioned, choose actual REST path with backend implementation):

```text
GET    /api/v1/tna/orders?filters=...          # authorized list
POST   /api/v1/tna/orders                      # validated creation
GET    /api/v1/tna/orders/{id}                 # authorized read
PATCH  /api/v1/tna/orders/{id}                 # expectedRevision required
POST   /api/v1/tna/orders/{id}/baseline        # authorized confirm
POST   /api/v1/tna/orders/{id}/revisions       # controlled target change
POST   /api/v1/tna/orders/{id}/approvals       # reviewer identity + proof
GET    /api/v1/tna/orders/{id}/audit           # scoped history
POST   /api/v1/tna/orders/{id}/attachments     # authorized upload contract
GET    /api/v1/tna/portfolio                   # access-filtered summary
POST   /api/v1/tna/notifications/subscriptions # user opt-in / scope
GET    /api/v1/tna/health                      # operational readiness
```

Every write validates tenant + order + field-level rights on server, schema, expected revision and domain invariant. Query responses must filter confidential fields before serialization. Non-2xx errors are user-friendly in UI but observable for engineers. No sensitive details in public error payloads.

### Offline + online conflict strategy

Local/offline edits queue as intent commands with unique IDs and base revision. Upon reconnection, server validates per command; accepted commands update local revision, rejected/conflicting commands stay in a visible "Needs review" queue with both versions. Approvals/released baselines **cannot** be auto-merged. Duplicate retries must be idempotent. No silent synchronization from unauthenticated user/browser.

### Provider decision gate

Before LIVE Phase 3, user must approve: identity provider, hosting/API runtime, DB/object storage, domain/subdomain & DNS, email/notification provider and permitted senders, roles/tenants, data-region and retention/security policy, deployment credentials and cost controls. Implement mock/service-contract tests without these but mark production collaboration `BLOCKED — EXTERNAL DEPENDENCY`, not complete. No silent paid subscriptions.

## 8. PPM/AQL coexistence and integration

- Use common order keys plus explicit record reference, schema version and confirmation state. Match buyer + factory + PO + style with conflict resolution; don't assume PO alone is globally unique.
- Phase 1: copy or manual link of verified PPM/AQL references, open existing app route, read-only status if trustworthy exported record available.
- Phase 2: shared typed integration contracts and import/adapters; display `Not linked` / `Reference unverified` when unavailable.
- Phase 3: authorized API integration only where an actual authenticated endpoint exists. Must not scrape private client browser storage or treat URL presence as approval.
- TNA records a PP/PPM readiness gate and final inspection gate separately; PPM release/AQL sample-acceptance rules are not replaced. AQL test/inspection result is never inferred just because an activity is past due or completed.

## 9. External services / notifications

In-app reminders can run while the browser app is open; reliable background email/push/WhatsApp require supported APIs, opt-in, contact verification, user approval, server scheduler, dedupe, quiet-hours and audit logs. Start with a provider-independent outbox contract; no credential in client scripts. If Google Calendar or other external provider is later integrated, request proper consent and map source-of-truth rules. Never automatically message buyers with incorrect risk forecasts.

## 10. Test & operational boundaries

- **Pure tests:** Node or equivalent to run `CalendarEngine`, `ScheduleEngine`, `CriticalPathEngine`, `CapacityEngine`, `RiskEngine` with deterministic fixtures from doc 03. Pin/package exact tool versions and lock files when adding dev dependencies.
- **Browser end-to-end:** run local HTTP server of actual `index.html`; verify mobile/desktop flow, accurate file import/export, save/reopen, online/offline toggles, localization, keyboard interactions, print and app-routing. Use Playwright or equivalent if available; record command/browser versions/results.
- **Security:** tests for authorization at API and data-query layers including IDOR/cross-tenant read/write, unauthorized approval, expired/revoked links, CSRF/session misuse, sanitized export/import, malicious attachment, unexpected schema versions and replayed commands.
- **Regression:** visit login, App Centre, PPM, AQL routes before/after. Capture console/network errors and screenshots. Do not accept visually attractive but broken calculations.
- **Observability:** technical logs accessible to engineers only, user-readable errors, no token/private-order data in telemetry; define failure alerts and backup restore procedures before cloud release.
- **Rollback:** feature branch for TNA, release branch/commit recorded in tracker, reversible catalogue registration, versioned migrations and data backup before backend schema updates.

## 11. Deployment and release contract

1. Build in a TNA feature branch; snapshot accepted working `main` and existing app behavior.
2. Implement within reviewed patch groups; commit only passing groups; do not force-push or rewrite unrelated history.
3. Verify `http://localhost/.../apps/tna/` with correct relative assets and auth navigation. Test against a hosted preview if available.
4. Test release candidate across browsers/device sizes; versioned local data migration, reports, all domain acceptance fixtures.
5. If Phase 3 backend is configured, run staging API/DB/RBAC/sync tests and prove secure remote collaboration between two distinct accounts. A mocked API is not sufficient for live claim.
6. Verify no buyer data/secrets committed, no hardcoded production API secrets, and license/security review of vendors.
7. Request explicit user authorization before publishing to `main` / production. Verify the actual live `https://vesaent.com/apps/tna/` response, asset integrity, login App Centre link and PPM/AQL regression.
8. Record deployment hash, dates, preview/live URLs, QA results and rollback procedure in `06_EXECUTION_TRACKER.md`.

## 12. Unresolved engineering risks (cannot be concealed)

- Existing site client-side authentication may be suitable for UX gating but **not** private B2B cloud access. Security upgrade needs approved separate server provider and compatible login plan.
- Backend provider and credentials are not specified in this handover; secure collaboration is therefore an implementation target with a provision/deployment gate, not guaranteed live now.
- Existing PPM/AQL may change while Codex works; each changed surface requires direct inspection. Avoid assumptions from prior chat descriptions.
- Excel/PDF library selection, performance and offline asset strategy need license, bundle and runtime validation; cannot assume CDN use is safe/offline.
- No factory-specific calendars, standard times, efficiency, holidays or buyer acceptance rules are authorized defaults. All must come from explicit user entry, sources or reviewed template data.
- Multi-company visibility and data retention requirements need written authorization before storing real commercial records centrally.
