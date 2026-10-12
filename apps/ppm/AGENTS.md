# VESA PPM 360 — Scoped Codex Instructions

**Location when installed:** `apps/ppm/AGENTS.md` inside `venkatbangla-boop/vesahost`. This is a nested instruction file for PPM only. It MUST NOT overwrite the repository-root `AGENTS.md` from TNA or another project. Repository-wide instructions still apply. Product: **VESA Enterprise Inc. — PPM 360**, URL `/apps/ppm/`.

## Start every fresh / resumed Codex session
1. Verify repo root, branch, `git status --short`, HEAD SHA, and current relevant source/tests. Preserve uncommitted work; create an isolated `feature/ppm-360-uniform-rework` branch or a uniquely named successor if already present.
2. Read `docs/ppm/06_EXECUTION_TRACKER.md` FIRST; at kickoff read all six PPM documents. Cross-check the last accepted milestone against actual commits and test evidence; a checked box is not proof.
3. Audit actual files before writing: exact paths, ownership, imports, state, call flow, frozen contracts, regression tests, rollback, and in/out scope. Use `01_AUDIT_MASTER_BLUEPRINT.md` as initial **documentation**, not as a replacement for the local audit.
4. Select next incomplete milestone, make one narrow reversible change group, execute real tests and viewport/report checks, record evidence and commit. Update `06_EXECUTION_TRACKER.md` with pass/fail, file list, commit SHA and precise NEXT ACTION.
5. If interrupted, reconcile `git diff`, last commit, tests, and tracker. Continue; do not restart, copy the entire application, or repeatedly add cosmetic override styles.

## Complete one program, not disconnected phases
Phase 1 = preserve+unify; Phase 2 = audited PPM functionality and usability; Phase 3 = safe integration/collaboration. All are in scope, but every gate needs evidence. External identity/backend/email credentials may block a specific live capability. Record honest `BLOCKED — EXTERNAL DEPENDENCY`; continue independent work, never pretend it is operational.

## Read these six specifications
- `docs/ppm/01_AUDIT_MASTER_BLUEPRINT.md`: evidence, problems and full PPM feature register.
- `docs/ppm/02_DOMAIN_WORKFLOWS_DATA.md`: garment PPM checkpoint/workflow/data contract.
- `docs/ppm/03_ENGINE_RULES_COMPATIBILITY.md`: readiness, applicability, approvals, measurements, signoff, save/restore invariants.
- `docs/ppm/04_UNIFORM_UX_LANGUAGE_REPORTS.md`: exact VESA universal visual and interaction contract.
- `docs/ppm/05_ARCHITECTURE_SECURITY_INTEGRATION.md`: ownership, file impacts, auth, shared shell, PWA, TNA/AQL links.
- `docs/ppm/06_EXECUTION_TRACKER.md`: durable gates, checkboxes, testing, blockers, resumption.

## Frozen invariants — non-negotiable without separately accepted proof
- Keep all 168 existing checkpoint IDs, meanings, critical flags and garment-profile applicability unless an explicit approved change can prove migration/parity. Never remove checkpoints merely to simplify screens.
- Preserve accepted PPM statuses and GO / CONDITIONAL GO / HOLD decisions, validation, signature invalidation, required approvals, tolerances, evidence, reports, versioned backups, and stored records. Never turn missing information into `OK`/`GO`.
- User-entered values, buyer-specific specs, approval authority and timestamps must not be automatically invented or translated. Original baseline and reviewed changes stay auditable.
- Do not clear IndexedDB/localStorage to fix a bug or use a service worker update that breaks saved-copy reopen. Take synthetic backup fixtures and verify round-trip first.
- Existing `/login/`, `/apps/`, `/apps/aql/`, future `/apps/tna/`, public home, logo, and Powered by EGENVA attribution must not be broken. Do not publish proprietary data, credentials or buyer files.

## ONE VESA visual contract shared with AQL and TNA
Read and follow `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` before any PPM page/UI work; it is the mandatory v2 interpretation of the `VESA-UNIFORM-UI-v1` material in `04_UNIFORM_UX_LANGUAGE_REPORTS.md`. Exactly one visible top-level shell owner, logo, identity/account area, Settings/save state and command system are allowed—never a global auth bar plus PPM header/menu. No additional independently frozen dashboard/section bars; use shared spacing, tokens, controls, status indicators, menu order and mobile behavior. If a shared file is required, create one separately audited **platform patch**, not competing app-specific modifications. Keep domain-specific internal forms but not a new navigation philosophy. Language/theme choices must not clutter every app header.

## Architecture
Existing browser-first modular JavaScript app. Domain rules remain in pure/read-only validation/planning owners; one workspace orchestrator; repositories own storage; reports own export; common shell owns navigation only. No circular dependencies, cross-app direct database writes, or a new uncontrolled giant app file. Document class purpose, ownership, inputs, output, failure and lifecycle. Tests must exercise frozen parity.

## Evidence, authority and publication
A change is `accepted` only with repeatable test evidence and independent/user review for high-stakes decisions; otherwise `conditional`, `blocked`, `rejected`, or `draft-only`. Commit tested groups to a feature branch. Do NOT push `main`/deploy without explicit user authorization. Browser-local static login is NOT server-grade authentication. An offline UI view is NOT real-time cross-company collaboration.

## Paste as the first VS Code Codex prompt
> Rework VESA PPM 360 end to end under `apps/ppm/`, using the six `docs/ppm/*.md` files and this scoped `AGENTS.md`. Start with real repository audit G00 and frozen behavioral tests. Build the ONE VESA-UNIFORM-UI-v1 shell shared with AQL/TNA; preserve all PPM domain and saved-data rules; complete Phase 1+2+3 as gated, tested continuous work. Update `docs/ppm/06_EXECUTION_TRACKER.md` after every gate. No invented approvals, no unverified success, no unrelated edits, no production deploy without my approval.

## Paste as the RESUME prompt
> Resume PPM 360 from `docs/ppm/06_EXECUTION_TRACKER.md` and real Git evidence. Read `apps/ppm/AGENTS.md`, inspect the latest accepted patch and tests, then continue the next incomplete gate. Preserve domain behavior, cross-app UI parity and stored records. Append actual test evidence and NEXT ACTION. Do not start over.
