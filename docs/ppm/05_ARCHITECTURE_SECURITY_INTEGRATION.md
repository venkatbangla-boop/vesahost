# 05 — PPM 360 Architecture, Ownership, Scope, Offline Safety & Integrations

## Project classification and structure choice
**Current:** stateful client-side JavaScript/PWA modular monolith, event-driven UI, single browser runtime plus service worker, GitHub Pages static host. **Target:** domain-first browser modular monolith with shared VESA workspace UI/platform; optional separately deployed authenticated backend for multi-tenant collaboration. Do NOT replace existing functioning code with a framework rebuild without a migration and parity case.

## Parent ownership and child placement (target contract)
```text
repo/
  apps/
    ppm/
      AGENTS.md                        [this Codex scoped instruction]
      index.html                        [existing entry; preserve route]
      core.js                           [existing PpmRecordFactory + engines]
      planning-services.js              [existing approvals/POM/changes]
      planning-panel.js                 [existing meeting UI controls]
      record-services.js                [existing backup/recovery]
      report-service.js                 [existing PPM reports]
      languages.js                      [existing translation texts]
      workspace.js                      [existing UI orchestrator/adapter]
      workspace.css                     [existing app-specific form styles]
      service-worker.js                 [existing coherent offline app bundle]
      tests/                             [existing + new parity cases]
      vendor/ fonts/ manifest.webmanifest [preserved licensed assets]
    aql/                                [frozen for PPM app patches]
    tna/                                [future, separate workstream]
    index.html                          [existing App Centre]
  css/
    style.css                           [existing site/login/app centre; watched]
    vesa-workspace.css                  [proposed NEW common platform shell]
  js/
    auth.js                             [existing local session; watched]
    preferences.js                      [existing themes/languages; watched]
    app-catalogue.js                    [existing app catalogue; watched]
    vesa-workspace-shell.js             [proposed NEW one common shell]
  docs/ppm/01...06.md                   [this six-doc specification & tracker]
  UI_CONSISTENCY.md                    [existing audit; platform patch only]
```
The `vesa-workspace*` files are proposals, not evidence of present code. Avoid additional folders until ownership justifies them. If PPM grows, separate domain classes only after old exports and regression tests prove parity.

## File impact plan and protection
| File | Ownership/current role | Scope | Change policy |
|---|---|---|---|
| `apps/ppm/index.html` | app entry, base CSS/DOM/script list | IN-SCOPE after G00 | Replace only redundant shell bits after baseline/screenshots |
| `apps/ppm/workspace.css` | PPM UI and current sticky menu | IN-SCOPE | Remove scattered overrides, use scoped common tokens |
| `apps/ppm/workspace.js` | meeting controller, menus/home | IN-SCOPE | Adapt to shared menu; protect save/lock logic |
| `apps/ppm/core.js` | checkpoint/domain/store | FROZEN initially | Only isolated proven bug fixes/approved enhancements |
| `apps/ppm/planning-services.js` | approvals, POM, diff | FROZEN initially | Tests and feature-specific domain gate |
| `apps/ppm/record-services.js` | backup/recovery/version | WATCH/FROZEN | Change only with versioned migration proof |
| `apps/ppm/report-service.js` | reports/PDF | IN-SCOPE later | Append reports, never recompute release differently |
| `apps/ppm/languages.js` | authored sentence localization | IN-SCOPE later | UI wording only; preserve values/identifiers |
| `apps/ppm/service-worker.js` | bundle lifecycle | IN-SCOPE last per release | Coherent version & offline update proof |
| `apps/ppm/tests/*.cjs` | synthetic QA | IN-SCOPE | Add parity + UI + domain verification |
| `css/style.css`, `js/auth.js`, `js/preferences.js`, `apps/index.html`, `js/app-catalogue.js` | platform | WATCH | Change ONCE through separate platform patch with cross-app tests |
| `apps/aql/*`, `apps/tna/*`, CNAME, marketing homepage, customer records | other domains | FROZEN | No changes in PPM-only patch |

## Canonical dependency/call direction
`UI -> VesaWorkspaceShell adapter -> V5Workspace -> PPM domain classes -> PpmRepository/BackupCodec adapters -> persisted versioned state -> report composer/read-only view`. Domain **cannot** import UI, service worker, auth bar or network code. Common shell knows no PPM checkpoint/result rules. Reports read a snapshot and never mutate it. Sibling apps communicate only through stable referenced IDs/API boundaries with explicit adapters and authorization; no cross-app private store poking.

## Initialization, lifecycle and error handling
- Shared shell creates/disposes listeners once, uses delegated event handling, avoids multiple menus after rerender.
- Workspace owns active PPM draft, save-queue/generation, locked state, undo/redo and view; database adapter owns durable writes/recovery; signature image generation/restore must cancel stale callbacks.
- Separate client/user namespaces when local; do not equate browser local partition with server security. On logout keep records protected only according to actual local capabilities; explain shared-device risk.
- Service worker should cache exact coherent asset versions; preserve old tabs and bytes until safe upgrade; update only with Save & Update flow. Never cache user personal documents as public static assets.
- Log technical exceptions privately/dev-only, show action-oriented errors; redact personal data and don't add telemetry absent authorization.

## Future secure collaboration (phase 3, external provisioning required)
Propose tenant identity and server-side authorization for buyers/factories/agents; server audit of meeting revision, explicit approver role, signatures evidence, approval tokens, document handling, notifications and conflict resolution. Design endpoint contract first; preserve local offline readiness. Offline PPM may prepare a draft, but server-authoritative approvals need online verification and optimistic concurrency; never overwrite remote change silently. Real secure access cannot be implemented solely using existing GitHub Pages local login.

## TNA/AQL integration without coupling domain engines
- TNA record reference `orderId/style/po`, associated milestone ID and last-known approved revision; PPM can export a verified readiness milestone, but TNA must not infer finished production solely from PPM status.
- AQL link `inspectionId/stage/recordVersion`, report reference, actual inspection decision and controlled timestamps. AQL must not auto-sign a PPM meeting; PPM must not auto-change AQL Ac/Re.
- Future secure synchronization: mapped immutable event + source ID + timestamp + actor + tenant + idempotency key; reconciliation shows conflicts rather than silent overwrites. Keep local fallback explicitly non-synced.

## Release gates and rollback
No unreviewed production edits. Baseline snapshots, golden fixture parity, staging screenshot set, full domain/export tests, QA from another reviewer, explicit user release. Roll back code by reverting feature commit and bundle pointer, **never clear IndexedDB or backup copies**. If complex shared shell work affects other apps, block PPM acceptance until AQL/TNA UI consistency and login regressions pass. Risk notes: AQL 11.7MB monolith and service worker own menu CSS separately, root local demo auth is not secure, mobile browser storage quota/device exports vary.
