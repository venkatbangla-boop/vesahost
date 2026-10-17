# VESA 360 - 15-App Master Portfolio Handover

**Created:** 2026-10-14. **Nature:** proposal/technical blueprint package, NOT an application build. **Audience:** VS Code Codex, software reviewer and VESA project owner.

## Read these first

1. `01_MASTER_PORTFOLIO_ROADMAP.md` - priorities, 15 apps, current vs proposed system.
2. `02_PLATFORM_STRUCTURE_CONTRACT.md` - exact single-repository domain architecture, code placement, state and UI owner.
3. `03_CROSS_APP_DATA_OWNERSHIP.md` - source of truth and how records may be linked without any cloud backend.
4. `04_WAVES_DEPENDENCIES_AND_RELEASE.md` - delivery phases, dependency gates and branch/release procedure.
5. `05_TEST_AND_ACCEPTANCE_STANDARD.md` - deterministic quality gates, automated screenshots, genuine human-UAT distinction.
6. `blueprints/APP-01_...md` through `blueprints/APP-15_...md` - individual detailed app technical blueprints.
7. `06_GOVERNANCE_AND_SCOPE.md` - personal demo-only, browser-local/no business-data upload, no scope creep.
8. `07_CODEX_INSTALL_AND_PLAN_PROMPT.md` - one-time Codex handoff to reconcile the package with the real checkout.
9. `08_CODEX_NEXT_APP_BUILD_PROMPT.md` - reusable prompt to build ONE chosen app after approval.
10. `09_CODEX_RESUME_PROMPT.md` - recovery prompt that preserves the repo's newer instructions.
11. `10_OPEN_DECISIONS_REGISTER.md`, `11_MASTER_EXECUTION_TRACKER_TEMPLATE.md`, `12_MACHINE_READABLE_ROADMAP_DRAFT.json`.

## Important status boundaries

- Existing deployed/main app situation must be checked live by Codex; remote inspected in this planning turn: `main` at `3217e2d`, feature branch `feature/tna360-continuous` at `e3f4851`, 298 commits ahead and zero behind. **Never assume these SHAs remain current.**
- Existing current domain applications on that feature branch: TNA, PPM, AQL; the platform provides shared Login, App Centre and UI shell. All three are preserved.
- Costing 360 has its **own separate handover package**. It is NOT counted among the 15 additional apps below and is not claimed to be integrated into the repository.
- These 15 apps are **DRAFT/PROPOSED**. No folders, routes, user data, tests or deployments have been changed by this handover. The local VS Code checkout remains the execution authority.
- The project owner identifies the intended use as **personal, non-commercial development/demo**. This is not an assertion of secure login, buyer approval or live factory rollout. Evaluate actual public site presentation and GitHub Pages terms before publication.

## Simple execution choices

**To load only the roadmap into VS Code:** Attach/extract this folder, run `07_CODEX_INSTALL_AND_PLAN_PROMPT.md`. It must inspect actual files, install only non-conflicting docs and report any overlap. No 15-app mega-build.

**To start the first new app:** After selecting APP-01 (or another approved app), use `08_CODEX_NEXT_APP_BUILD_PROMPT.md` and the matching blueprint. This instruction requires a file-level audit, a scoped patch plan and tests before code changes.

**If Codex session stops:** Use `09_CODEX_RESUME_PROMPT.md` without replacing `VESA_RESUME_PROMPT.md` or the current repo AGENTS governance.

## Files included

- **15 individual app blueprints**, one for each proposed additional application.
- Portfolio, architecture, ownership, dependency/release, testing, governance, prompts, decisions, progress template and machine-readable metadata.
- No real customer files, buyer confidential tech packs, user passwords, bank information, cloud credentials or actual production data.
