# 05 — AQL 360 Architecture, Huge-File Refactor Safety, Security & Cross-App Scope

## Project shape and chosen architecture
**Current:** browser-first, event-driven, stateful JavaScript PWA in one large `apps/aql/index.html` (~11.69MB), app service worker and tests; GitHub Pages static multi-app site. **Target:** domain-first modular client with shared VESA workspace platform and optional separately hosted authenticated backend. Refactor incrementally, no blank-slate replacement. Keep byte-preserved current export/reopen compatibility until verified migrations are accepted.

## Parent folders and ownership target
```text
repo/
  apps/
    aql/
      AGENTS.md                       [this scoped Codex instruction]
      index.html                      [existing route/entry and initially frozen domain]
      service-worker.js               [existing offline shell/asset lifecycle]
      ENGINEERING.md                  [existing evidence notes]
      tests/
        release-contract.cjs          [existing smoke contract]
        apply-release-patch.cjs       [existing patch utility; audit before use]
        sampling-regression.test.cjs  [proposed NEW pure numeric golden fixtures]
        inspection-flows.test.cjs     [proposed NEW browser state/decision/return]
        offline-restore.test.cjs      [proposed NEW storage/cache/backup]
      domain/                         [proposed later, only after parity tests]
        sampling-engine.js
        result-engine.js
        stage-policy.js
        inspection-record.js
      services/                       [proposed later, only after parity tests]
        repository-adapter.js
        portable-backup.js
        report-adapter.js
      ui/                             [proposed later, only after parity tests]
        aql-workspace-adapter.js
        inspection-views.js
    ppm/                              [frozen for AQL-only patches]
    tna/                              [separate future, shared visual contract]
    index.html                        [existing App Centre]
  css/
    style.css                         [existing marketing/login/app centre]
    vesa-workspace.css                [proposed NEW common UI shell]
  js/
    auth.js preferences.js app-catalogue.js [existing shared platform]
    vesa-workspace-shell.js           [proposed NEW shared shell/controller]
  docs/aql/01...06.md                  [this specification/continuity set]
  UI_CONSISTENCY.md                   [existing common review; planned reconciliation]
```
`domain/services/ui` proposals are not required to appear immediately; avoid shifting the 11.7MB file into many new files before proof. Names kebab-case, stateful owners PascalCase, tests `.test.cjs`, no generic dumping `utils` folder and no circular imports.

## File-level impact classification (verify against current checkout)
| Path | Current owner | Class / change disposition |
|---|---|---|
| `apps/aql/index.html` | entire quality UI, rules, embedded assets, AQL menu patch | IN-SCOPE after fixtures; first shell adapter, later extracted modules |
| `apps/aql/service-worker.js` | app cache/version | IN-SCOPE later; old-tab/offline safety gate mandatory |
| `apps/aql/ENGINEERING.md` | release audit/proof log | IN-SCOPE append, do not erase history |
| `apps/aql/tests/release-contract.cjs` | current static contract | IN-SCOPE extend existing; preserve historic checks |
| `apps/aql/tests/apply-release-patch.cjs` | release patch generation utility | WATCH; audit against monolith before reuse; no blind re-patch |
| `AQL_RELEASE_STATUS.md`, `GAP_MATRIX.md` | historical gap/evidence | WATCH; update evidence only, not fabricated fixed status |
| `css/style.css`, `js/auth.js`, `js/preferences.js`, `js/app-catalogue.js`, `apps/index.html`, `UI_CONSISTENCY.md` | shared platform | WATCH; edit only platform-owned accepted patch with other apps tested |
| `apps/ppm/*`, `apps/tna/*`, marketing `index.html`, CNAME | sibling/marketing | FROZEN on AQL patch |

## Domain / application / UI / persistence / integration boundaries
- `domain` owns sampling, allocation, measurable inspection/defect/packing/decision/quality rules. Pure deterministic calculation with explicit source criteria; no DOM, HTTP, IndexedDB, CSS or direct reporting.
- `application`/`InspectionApp` owns active inspection, stage transitions, versioned state snapshots, command authorization and call flow; no duplicate singleton. General flow `UI event -> app command -> validated domain result -> one state mutation -> durable repository write -> report read-only render`.
- `ui` owns forms, drawer, guides, evidence viewer and shared-shell adapters; cannot directly mutate stored domain state.
- `infrastructure` owns IndexedDB connection, asset compression/verification, portable HTML/project import/export, save fallback and service worker. Typed interfaces separate from domain; fail-safe read-only state when storage does not work.
- `report` owns snapshot serialization and print/PDF with original approved criteria/decision, not independent AQL calculation.
- `external integration` owns server connectors; no cross-app `localStorage` reads or direct AQL table rewrites by PPM/TNA.

## AQL monolith migration strategy
1. Determine current full tree, scripts, embedded blobs, external/relative dependencies and direct load order; archive baseline source SHA + representative output fixtures on feature branch without bundling customer evidence.
2. First change **only navigation/render ownership** via a single common VESA adapter. Remove duplicate `aql-release-*` bars and CSS overrides after the shared adapter has identical actions and browser tests. Avoid tweaking domain prototypes in same patch.
3. Add pure numeric/domain tests on existing classes, browser end-to-end tests for six main steps + 13 stages and saved copy. Record performance baseline (first load, DOM ready, memory where tool allows).
4. If extraction is justified, extract one domain owner at a time with exact API facade; update `index.html` load order and AQL cache manifest; verify offline mode, fast/slow devices, old tabs and portable export. Keep legacy records readable; reject unrecognized future versions without mutation.
5. Local PWA self-update must not silently force-refresh an unsaved inspection. Current AQL worker deletes prior cache names after activation; test/repair old-tab compatibility without clearing local customer stores.
6. Do not change AQL domain values while polishing CSS or opening a more attractive home page. Every numerical change gets a separately approved `policy-impact` migration/proof.

## Security and collaboration truth
Static browser login on public GitHub Pages can redirect a logged-out viewer but cannot protect raw HTML/file access. Local user keys partition browser records only, not a secure tenant boundary. Real buyer/factory collaborative access requires authenticated backend, tenant and order authorization, server-side roles, audit logs, safe file storage, signed approvals and conflict resolution. No API token/client secret in GitHub Pages; no fake scheduled email alerts. Offline-generated approvals remain local/unverified until true server validation, when available. Consent-controlled PPM/TNA links use stable opaque IDs and source record versions, not hidden data mutation.

## External integration contracts (Phase 3)
- `InspectionRef = {tenantId, orderId, sourceApp:'aql', inspectionId, stageId, revision, outcome, generatedAt, verifiedAt, verifierId}`.
- `ReportRef = {type, inspectionId, version, audience, hashOrReference, approvedBy}`; hashes are integrity aids, not digital signatures.
- PPM can view AQL result only through explicit authorized lookup, not auto-mark sample approval. TNA may reflect a final-inspection actual date if verified, but not overwrite original baseline or claim shipment readiness without other gates.
- Synchronization must use idempotency key, optimistic concurrency/version, conflict UI, explicit ownership and revoke paths; storage offline remains truthful as "not synced".

## Version/rollback and frozen tests
Shared UI changes scoped through one accepted platform patch, followed by app-only patches. Snapshot backed-up fixture before migration, import/reopen tests before/after, store previous cache data for still open tabs as needed, no destructive database changes. Failing release: revert code/worker version and retain backups, never wipe IndexedDB. Some browser/device behaviors cannot be proven until native field pilot; do not claim otherwise. If module extraction adds network asset requests, verify offline cache coherency and file:// support only as a declared supported capability.
