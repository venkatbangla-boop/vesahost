# VESA AQL 360 — Scoped Codex Instructions

**Install at:** `apps/aql/AGENTS.md` in `venkatbangla-boop/vesahost`. Scoped ONLY to AQL. Never overwrite root `AGENTS.md` for TNA or another product; obey higher/repo-wide instructions. Product: **VESA Enterprise Inc. — AQL Quality Centre 360**, URL `/apps/aql/`.

## Codex start and resume contract
1. Confirm local repo, Git HEAD/branch/dirty state, existing instructions, actual files, tests and checked-in documentation. Create an isolated `feature/aql-360-uniform-rework` branch (or reuse an existing approved branch), never overwrite user changes.
2. Read `docs/aql/06_EXECUTION_TRACKER.md` FIRST at each session. At initial session read all six specs `docs/aql/01`–`06` and current `apps/aql/ENGINEERING.md`/`AQL_RELEASE_STATUS.md`/`GAP_MATRIX.md`; do not mistake earlier release summaries for a complete current proof.
3. Do a pre-code **file-level** audit: ownership, file inventory, dependencies, call flow, state, precise changed/frozen files, tests and rollback. Freeze source-derived sampling/decision fixtures before touching the huge HTML.
4. Implement the earliest safe incomplete gate on a reviewable feature branch; run domain + browser + portable backup + cross-app navigation tests; update execution tracker with accurate test evidence and precise NEXT ACTION; commit verified change group.
5. If interrupted, compare tracker with `git status`, HEAD, last patch, tests, data fixtures, then resume from the next incomplete gate. No copy-paste giant AQL reimplementation, no silent lost feature, no superficial pile of `!important` CSS.

## One continuous Phase 1 + 2 + 3 scope
Phase 1: safe baseline, VESA visual unification, menus and data integrity. Phase 2: systematic inspection-domain quality improvements, 35-area gap review, report clarity and robust tests. Phase 3: connected, properly authorized workflows and verified PPM/TNA record references. Implement in gated sequence. External server provider/identity/secrets may block *live* deployment; record `BLOCKED — EXTERNAL DEPENDENCY` and complete other independent work. Never fake a cloud feature.

## Mandatory six documents
- `docs/aql/01_AUDIT_MASTER_BLUEPRINT.md` — actual repo audit, original 35-area register, complete AQL feature list.
- `docs/aql/02_DOMAIN_WORKFLOWS_DATA.md` — stage workflow, sampling/defect/inspection data and manual policies.
- `docs/aql/03_ENGINE_RULES_COMPATIBILITY.md` — frozen SamplingEngine, counting decisions, evidence and save safety.
- `docs/aql/04_UNIFORM_UX_LANGUAGE_REPORTS.md` — identical `VESA-UNIFORM-UI-v1` contract and AQL-specific views/reports.
- `docs/aql/05_ARCHITECTURE_SECURITY_INTEGRATION.md` — 11.7MB HTML refactor strategy, storage/worker/security and cross-app architecture.
- `docs/aql/06_EXECUTION_TRACKER.md` — living acceptance ledger, test matrix, checkpoint/resume plan.

## Critical freeze list
- **NEVER silently modify** the current `SamplingEngine` lot-to-code mapping, sample sizes, AQL cells, null/unsupported combinations, scheme/inspection levels, buyer custom criteria or numeric rounding. Baseline code is NOT automatically a licensed/official complete standards implementation; preserve unless separately validated/licensed/accepted.
- Keep `Ac/Re` decision, Major/Minor/Critical counting bases, lot formation, sample allocation, specimen identity, stage evidence, report traceability, final/prefinal gating, reinspection history, CAPA, packing/carton and loading evidence.
- Preserve all existing final/inline/endline/fabric/cutting/supplier audit/production/QMS workflows and historical observations. A reinspection must never erase prior failed findings.
- Keep existing portable inspection format, project backups, offline recovery, assets, signatures, internal pictures and 2026 release safeguards. Never clear IndexedDB or pretend a failed save succeeded.
- Preserve app-specific domain depth even while menus, home, colors, typography, navigation, language and report chrome become visually identical to PPM and TNA.
- Never invent buyer-defined AQL value, sample size, lab tests, market compliance laws, defect grading, inspection outcome or pass certificate.

## Shared VESA UX, not duplicate independent designs
Read and follow `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` before any AQL page/UI work; it is the mandatory v2 interpretation of `VESA-UNIFORM-UI-v1` in doc 04. Exactly one visible top-level shell owner, logo, identity/account area, Settings/save state and command system are allowed—never a global auth bar plus AQL entrance/header/menu. Use shared spacing/fonts/menus, a mobile single Menu control and no independently frozen AQL sidebar/menu ribbons. Shared `css/vesa-workspace.css` and `js/vesa-workspace-shell.js` are owned by one approved PLATFORM patch; AQL adapters consume the shell without knowing PPM/TNA domain. Four languages translate authored UI sentences, never records.

## Ownership & lifecycle
Use domain-first modular JS; retain `InspectionApp`, `SamplingEngine`, `ResultEngine`, stage and repository/companion owners. Extract large-file code **incrementally after equivalence tests**. UI -> application controller -> deterministic domain services -> storage adapters; report reads a frozen snapshot. No circular dependencies, hidden cross-app writes, destructive migration, or multiple uncontrolled prototype monkey-patches. Document durable state, listeners and failure modes for new classes.

## Security and deployment
Current GitHub Pages login is local/client-side, not protected static HTTP or secure tenant authorization. Never place customer evidence/credentials in the public repo. A secure multi-company platform requires server-side credentials, storage, authorization and audit; no real notifications without provisioned provider. Work on feature branch, independent proof before `accepted`; do not push `main`/deploy without explicit user authorization. Keep named simulated/demonstration records separate from customer inspections.

## First VS Code Codex prompt
> Rework VESA AQL Quality Centre 360 end to end. Start by reading `apps/aql/AGENTS.md`, all six `docs/aql/*.md` and the existing engineering/release/gap files. Audit the current 11.7MB AQL HTML and freeze its sampling, Ac/Re, evidence, portable records and existing stage rules with tests. Implement the shared VESA-UNIFORM-UI-v1 shell with PPM/TNA consistency and no redundant fixed menus. Complete all Phase 1+2+3 improvements as gated, reversible patches, update `docs/aql/06_EXECUTION_TRACKER.md` after every tested group, and preserve PPM/TNA/login. No invented inspection policy or unverified completion. Do not deploy without approval.

## Resume prompt
> Resume AQL rework from actual Git evidence and `docs/aql/06_EXECUTION_TRACKER.md`. Read `apps/aql/AGENTS.md`, verify last accepted gate against code/tests, preserve current Ac/Re/inspection decisions and saved records, implement the earliest next incomplete safe gate, run all relevant regressions, append proof and NEXT ACTION; never start over.
