# VESA 360 - Master Continuity Rules for VS Code Codex

**Program:** VESA TNA 360 + VESA PPM 360 + VESA AQL 360 + One VESA User Experience
**Repository:** `venkatbangla-boop/vesahost`
**Work location:** The user's local VS Code repository; do not treat this handover as deployed code.
**Program control files (repository root):** `VESA_CONTINUITY_RULES.md`, `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`.

## 1. Outcome and boundaries

Build and verify **all specified Phase 1 + Phase 2 + Phase 3 work** for TNA, PPM, and AQL as ONE coordinated program. Continue automatically from one safe, accepted local development checkpoint to the next *while the Codex session is running*. The user does not need to type `continue` after ordinary completed checkpoints.

**This is not an unattended always-on job.** Codex cannot independently relaunch VS Code, log in again, renew expired sessions, obtain unavailable credentials, or work after its environment closes. The SAME prompt in `VESA_RESUME_PROMPT.md` restarts the workflow using committed repository state and `VESA_PROGRESS.md`. Never claim background execution or a guaranteed uninterrupted run.

## 2. Canonical documents and required location

| Scope | Instructions | Specification/continuation tracker |
|---|---|---|
| Program | `VESA_CONTINUITY_RULES.md` + `VESA_PROGRESS.md` | Both stay at repo root |
| TNA | root `AGENTS.md` (preserve existing TNA rules) | `docs/tna/01_MASTER_BLUEPRINT.md` through `docs/tna/06_EXECUTION_TRACKER.md` |
| PPM | `apps/ppm/AGENTS.md` | `docs/ppm/01_AUDIT_MASTER_BLUEPRINT.md` through `docs/ppm/06_EXECUTION_TRACKER.md` |
| AQL | `apps/aql/AGENTS.md` | `docs/aql/01_AUDIT_MASTER_BLUEPRINT.md` through `docs/aql/06_EXECUTION_TRACKER.md` |
| Unified UX | `VESA-UNIFORM-UI-v1` in PPM and AQL `04_UNIFORM_UX_LANGUAGE_REPORTS.md` | `VESA_PROGRESS.md` S01-S10 |

The local repository may have newer changes than the handover. **Actual source, Git state and proven tests always take precedence over an old snapshot.** Do not overwrite a changed `AGENTS.md`, any tracker, existing saved data or an in-progress user's files with a ZIP copy. Merge only missing instructions and reconcile conflicts explicitly. If a spec package is absent, report it; proceed with independently safe audited work, and request the missing package only when truly required.

## 3. Same visual system, separate business rules

All pages `/login/`, `/apps/`, `/apps/tna/`, `/apps/ppm/`, `/apps/aql/` must feel like ONE VESA product. Use the authorized VESA Enterprise Inc. logo, shared theme tokens, responsive layout, the same ordered Home/File/Edit/View/Tools/Help menu, straightforward Save/Open/Report labels, and one coherent sticky header/navigation region at most. No duplicated floating menus, independently frozen filter bars, overlapped fields, or inconsistent placement on mobile. Put advanced options inside their relevant sections and give novice-friendly guidance without showing internal format/database/developer terms.

**Never mix domain logic:** TNA owns planning and Critical Path; PPM owns pre-production meeting, 168 existing master checkpoint identities, GO/CONDITIONAL GO/HOLD, sign-off, and approval conditions; AQL owns sampling tables, lot formation, Ac/Re, defect calculations, inspections, CAPA and audit records. Redesign **navigation and presentation** without silently changing buyer-approved or source-defined acceptance rules. No fake approvals, invented sampling cells, fabricated lead times or automatic GO/PASS.

Only one platform owner changes shared `js/auth.js`, `js/preferences.js`, `js/app-catalogue.js`, `css/style.css`, global shell/worker or common menus at a time. Shared UI edits require full sibling-app regression. Reuse one approved shared UI contract rather than adding new app-specific CSS overrides.

## 4. Mandatory start / resume sequence (every session)

1. Confirm correct repository, remote, branch, HEAD, current working tree and any uncommitted user changes. Never reset, clean, force-push or overwrite unknown changes.
2. Read this file and `VESA_PROGRESS.md`, root `AGENTS.md`, current app's nested `AGENTS.md` if any, and the relevant `docs/{tna,ppm,aql}/06_EXECUTION_TRACKER.md` files. Read detail specs for the active work item.
3. Reconcile every existing ACCEPTED status against real code, actual test output, Git commits, screenshots and saved-file evidence; correct stale or optimistic records. Existing apps being live does not prove rework complete.
4. Determine the most advanced safe **unfinished checkpoint** already in progress. Finish/test/commit it first before switching workstreams. Do not restart existing TNA implementation when the user already has an active TNA Codex run.
5. Before each code patch: inspect actual affected files, identify in/out-of-scope files, frozen rules, owners, call flow/state, risk, tests and rollback. Implement only the audited approved patch group. Never fabricate missing acceptance evidence.
6. After each checkpoint: run real tests and rendered/mobile/menu/save/open/report checks where relevant. Update the app's `06_EXECUTION_TRACKER.md`, then `VESA_PROGRESS.md` with current checkpoint, gate verdict, test command/result, commit SHA, blockers, progress percentages and ONE explicit NEXT ACTION. Commit coherent verified changes safely on a feature branch.
7. Without prompting the user at every routine checkpoint, continue with the next safe item. For missing external credentials/provider/service, record BLOCKED - EXTERNAL DEPENDENCY and advance to other independent work. Pause only for genuine approval, unresolved destructive/data-risk conflicts, missing critical specifications, or environment/session termination.

## 5. Program-wide execution order

This is one **program**, not three disconnected redeployments:

- **A. Recover and finish the current in-flight task:** do not interrupt an already running TNA checkpoint or overwrite its changes. Preserve existing branch and accepted tests.
- **B. Fix the common UI contract:** audit the existing App Centre/login/PPM/AQL shell and source of the approved uniform UI standard. Define owner, shared assets, adaptation plan, tests and rollback once. Do not start two independent shell rewrites.
- **C. TNA 360:** finish all applicable G00-G12 plus F01-F50 and R01-R12 evidence. If G09/G10 live collaboration or G12 production release needs external authorization, leave exact blockers and continue other independent work.
- **D. PPM 360:** perform P-G00 through P-G10, preserve approved PPM data/decisions/backup formats, add shared visual adapter, close P01-P52 with proof.
- **E. AQL 360:** perform A-G00 through A-G12, baseline-test the huge current AQL source before structural changes, preserve SamplingEngine/Ac-Re rules and existing inspections, close AQL feature register and 35-area matrix.
- **F. Shared S01-S10:** verify one visual shell, common menus, responsive/four-language accessibility, routes, safe reporting, browser save/reopen, theme parity and all three apps together. Apply targeted, audited repairs and rerun regressions.
- **G. Final readiness:** attach evidence, unresolved blockers, accurate percentages, rollback information and explicit release decision. Production push/deployment requires user's separate permission.

The above is an **execution priority**, not permission to blindly advance through failing dependencies. If a later step is independent, continue that step and mark the blocked predecessor honestly.

## 6. Gate states and percentage policy

Track one state for each gate in `VESA_PROGRESS.md`: `NOT STARTED`, `ACTIVE`, `ACCEPTED`, `CONDITIONAL`, `BLOCKED`, `REJECTED`.

Only `ACCEPTED` after file-level audit + objective test evidence earns completion credit; a commit, a pretty screen, a checked box or a code draft alone does not. Status is not interchangeable with actual production deployment.

Use **fixed gate-count weighting** so a new session calculates the exact same score:

- TNA: 13 gates (`G00`-`G12`), **30 total program points**.
- PPM: 11 gates (`P-G00`-`P-G10`), **30 total program points**.
- AQL: 13 gates (`A-G00`-`A-G12`), **30 total program points**.
- One VESA UI / integration: 10 gates (`S01`-`S10`), **10 total program points**.

`Overall % = ROUND(30 * acceptedTNA / 13 + 30 * acceptedPPM / 11 + 30 * acceptedAQL / 13 + 10 * acceptedShared / 10)`.
`Balance % = 100 - Overall %`.
`App % = ROUND(100 * acceptedAppGates / totalAppGates)`.

Always count source gate IDs once; never double count sub-checklists. These are **verified checkpoint scores, not labor hours or effort estimates**. If repository evidence has not yet been inspected, show `NOT MEASURED / RECONCILIATION REQUIRED`, not an invented 0% or 90%. Accepted gates can be downgraded when regression proves a failure; recalculate accordingly. BLOCKED gates do not earn completion credit. Mark blocked externally dependent work precisely and do not claim 100% while required gates remain blocked.

## 7. One-click dashboard contract

`VESA_PROGRESS.md` is the single page the user clicks after one day or two days away. After each accepted checkpoint, update at minimum:

- Overall verified %, remaining %, each app's %, common visual %.
- Current program stage and the exact *ACTIVE* gate.
- Last accepted gate, commit SHA, UTC date/time, tests and result.
- Current blockers and concrete setup needed.
- ONE NEXT ACTION with exact file/owner/test path.
- All per-gate statuses and the last five checkpoint log entries.

Do not use a running session's chat history as the only tracker. Durable data belongs in Git-controlled files. Never store personal user data, buyer records, credentials or tokens in progress files, fixtures or a public Git repo.

## 8. Security and release limits

The existing static GitHub Pages login is only a browser-local gate, **not secure hosted multi-tenant authentication**. Actual factory/buyer collaboration, server notifications and role-based data isolation require a provisioned, authorized backend and independent security testing. It is acceptable to complete safe contracts/adapters/tests locally and mark external deployment blocked. Never say a backend is live without verifiable two-account server tests.

Normal, scoped, reversible local coding and test commits are authorized by this program request; do not take it as permission to change buyer/quality policies, delete records, expose secrets, alter unrelated products, pay for services, or push/deploy to the public `main` branch without explicit user release approval. Never claim a complete program while required tasks remain untested or blocked.

## 9. End-of-session checkpoint text

When the session must end, update and save `VESA_PROGRESS.md` and the active app tracker first if possible, then report exactly:

`Overall verified: X% | Balance: Y% | TNA: T% | PPM: P% | AQL: A% | Shared: S%`
`Last accepted: [gate] [commit] [test result]`
`Current/blocked: [gate] [reason]`
`NEXT ACTION: [one exact action]`
`Resume: paste VESA_RESUME_PROMPT.md`.

If interrupted before the last tracker write, the next session MUST reconcile the working tree and tests rather than trust the stale dashboard.
