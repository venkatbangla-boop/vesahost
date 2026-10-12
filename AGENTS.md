# VESA TNA 360 — Repository Instructions for VS Code Codex

> Scope: `venkatbangla-boop/vesahost`, default branch `main`; target `/apps/tna/`; VESA Enterprise Inc. This file belongs at the **repository root**. It is a small navigation and governance file, not the entire specification.

## Current platform-scope authority

Read `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` before selecting work. It is the current user-approved platform contract and takes precedence over older documents **only** where they require a paid/external backend, cloud database, provider identity, remote synchronization, or external notification delivery. Those items are retained historically and marked `DEFERRED_BY_SCOPE`; frozen TNA/PPM/AQL rules, local data safety, tests, and accepted evidence remain unchanged.

## Mandatory unified page contract

Before creating or changing **any** page, screen, app, dialog, viewer or top-level navigation, read `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`. It is the current user-approved interpretation of One VESA UX and applies to existing and future routes. Every authenticated workspace has exactly one visible VESA logo, one header/navigation owner, one app identity, one user/account area, one Settings entry, one save-state message and one ordered `Home / File / Edit / View / Tools / Help` command system. Never stack a global auth bar with an app header, repeat logo/user/logout/settings controls, or introduce an app-specific fixed/sticky menu/sidebar. New pages must register with and reuse the shared shell/tokens; app code owns only domain content and callbacks. Shared-shell acceptance requires cross-route desktop/tablet/mobile/zoom/keyboard screenshots and DOM checks, plus TNA/PPM/AQL regressions.

## One continuous project, seven durable documents

Implement **all capabilities described for Phase 1 + Phase 2 + Phase 3** as one cohesive product, in tested, reversible patch groups. Do not interpret the phases as permission to omit advanced functionality. The documents are the source of truth:

1. `docs/tna/01_MASTER_BLUEPRINT.md` — user value, all capabilities, role flows, and acceptance boundaries.
2. `docs/tna/02_DOMAIN_WORKFLOWS_DATA.md` — apparel workflows, dynamic templates, record schema, statuses and revisions.
3. `docs/tna/03_SCHEDULING_ENGINES.md` — exact date, CPM, capacity, forecast, delay and scenario calculations.
4. `docs/tna/04_UX_LOCALIZATION_REPORTS.md` — VESA UI parity, screens, language, accessibility, exports.
5. `docs/tna/05_ARCHITECTURE_SECURITY_INTEGRATIONS.md` — folder contracts, dependencies, persistence, security, backend, PPM/AQL links.
6. `docs/tna/06_EXECUTION_TRACKER.md` — **living progress ledger**, tests, evidence, blockers, next action, full scope checklist.

Read `06_EXECUTION_TRACKER.md` at the start of **every new Codex task or resumed session**. Read only the relevant detailed documents for the workstream being changed; read all six at project kickoff and before final acceptance. The user-approved scope is all three phases together.

## Startup / resumption protocol — mandatory

1. Confirm the workspace is actually the `vesahost` repository. Inspect `git status --short`, branch, current commit, relevant files, existing instructions, and available test/build commands.
2. Read `06_EXECUTION_TRACKER.md`; find last **accepted** patch, current status, unresolved issues and explicit `NEXT ACTION`. Cross-check against commits and actual code. Never assume a checked box proves code exists.
3. Before changing code, directly inspect the specific existing files, map ownership/call flow/state, name exact in-scope and out-of-scope paths, compatibility risks, verification, and rollback. Record the short file-level audit in the tracker.
4. Pick the **next incomplete patch group**, implement within its defined scope, run its objective tests, inspect UI when applicable, and report an evidence-backed verdict: `accepted`, `rejected`, `blocked`, or `conditional`.
5. After each group, update the tracker with exact file paths, commit SHA (if committed), commands/results, checkboxes that were actually proven, blockers, and `NEXT ACTION`. Preserve the change log rather than rewriting its history.
6. Commit coherent, tested groups on a feature branch; do not commit secrets, credentials, private buyer data, generated backups, or broken code. Do not deploy to `main` until all required release gates pass and the user authorizes production publication.
7. On an interrupted session, resume from repository evidence + tracker. Do not restart, duplicate engines, overwrite completed modules, or silently skip work.

**Progress rule:** an untested feature remains incomplete. If a change only partially works, keep status `conditional` or `blocked` with precise missing proof. No invented percentages, dates, test results or deployment claims.

## Existing VESA invariants

- Routing: `/login/` → `/apps/` (App Centre) → `/apps/tna/`. Register TNA in `js/app-catalogue.js` and the relevant localized `js/preferences.js` labels. Keep homepage, PPM, AQL and login behavior intact.
- Existing reference: `/apps/ppm/` for VESA Enterprise Inc. branding, welcome/home navigation, `HOME / FILE / EDIT / VIEW / TOOLS / HELP`, ergonomic Save/Open/Report actions, appearance and four languages. Inspect actual current source; never copy PPM-only quality checkpoints into TNA.
- Application identity: **VESA TNA 360 — Universal Apparel Time & Action + Critical Path**; route `/apps/tna/` and public asset paths relative to this route. One `index.html` entry page with maintainable local CSS/JS modules is allowed; no independent site layout.
- Accessible, responsive desktop/tablet/mobile UX; nontechnical user copy; no raw database/JSON/CSV terminology or stack traces in routine screens. English, Bengali, Hindi and Tamil sentence/UI translations. Never translate user-entered values or mutate domain identifiers when changing language.
- Preserve original baseline, target, forecast, actual, history and evidence independently. Do not overwrite original approval/deadline dates to make KPIs look green. Never manufacture a buyer approval, lead time, production rate, holiday, compliance rule or shipment commitment.
- AQL and PPM are separate domains. Their rules/statuses must not be rewritten or automatically inferred from TNA; any link requires verified record reference and explicit mapping.
- Exports and imported files are untrusted. Sanitize HTML, bound input sizes and prevent spreadsheet formula injection. Use locally bundled, license-checked dependencies; no mandatory runtime CDN or API calls for offline planning.

## Architecture / implementation rules

- Browser-first modular frontend, domain-first structure. **Domain calculations** are pure, deterministic and independently testable; application services orchestrate; adapters own IndexedDB/local backup/backend; UI owns rendering. No circular dependency, hidden global mutable state, monolithic function piles or generic `utils` dumping ground.
- Use descriptive classes for stateful owners, explicit immutable schemas, purpose/access/input/output/failure comments for important interfaces, and unit tests for every scheduling formula.
- Canonical flow: UI command → controller → validation → domain engine → versioned record state → repository adapter → recompute dashboard/reports. Backend: authenticated request → tenant/order authorization → validated application command → domain → persistence → audited response.
- Implement all three stages continuously **with gates**, not as three disconnected apps. Re-evaluate after tests and preserve accepted contracts.

## Security / platform boundaries

GitHub Pages is static. The existing browser-local login cannot by itself provide secure cross-company access, centralized collaboration or trusted server notifications. Under the current GitHub-Free/local-only contract, provider-backed Phase 3 deployment is `DEFERRED_BY_SCOPE`; never expose tokens, use production demo credentials, claim cloud synchronization, or treat client-side role hiding as authorization.

Preserve already-audited provider-neutral contracts and safe disabled/offline states where removal would add risk, but do not build, connect, purchase, or require a hosted backend, external identity, cloud database, or notification provider. Mark those historical requirements `DEFERRED_BY_SCOPE`, continue every local/browser-native requirement, and **do not falsely mark secure multiuser collaboration or commercial SaaS hosting complete**. Never guess provider credentials or alter unrelated systems.

## Final acceptance / output

The project can be declared production complete only after every applicable check in `06_EXECUTION_TRACKER.md` has linked test evidence, route checks, save/reopen/recovery proof, representative apparel scenario results, security verification, multilingual/mobile review, regression checks for PPM/AQL, and explicit release approval. Report precisely what is live vs developed locally vs external-provider blocked.

## Initial Codex prompt (paste into VS Code once)

> Implement VESA TNA 360 end-to-end across all three phases as ONE continuous scope. Begin by reading the root AGENTS.md and all six `docs/tna/*.md` specifications, then audit the real repository. Use `06_EXECUTION_TRACKER.md` as the durable checklist and progress journal. Follow the patch groups in order, test each group, update progress after every group, and resume automatically from the next uncompleted group. Preserve existing VESA login, App Centre, PPM and AQL behavior. Do not invent data, skip checkboxes, pretend that unconfigured backend collaboration works, or deploy to production before acceptance. Give concise evidence-based updates and identify only genuine external blockers.

## Resume prompt (paste for every new session)

> Continue VESA TNA 360 from the real repository state. Read AGENTS.md and `docs/tna/06_EXECUTION_TRACKER.md`, inspect the last accepted commit/tests and only the relevant specification files. Reconcile the checklist against code, fix unfinished or failing work, then proceed with the next uncompleted group. Preserve all earlier verified functions; update the progress ledger and commit tested work. Do not restart or reduce scope.
