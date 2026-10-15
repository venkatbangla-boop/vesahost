# VESA 360 - ONE UNIVERSAL RESUME PROMPT (GITHUB FREE + LOCAL DATA)

## Permanent ChatGPT Work / GitHub connector resumption overlay (2026-10-15)

### GitHub Actions checkpoint discipline — verified October 15, 2026

- Source/verification code remains unchanged by this operational rule. Only the two branch-specific workflows have a **job-level** checkpoint guard. Normal intermediate development commits on `feature/tna360-continuous` and `feature/costing-360` yield an expected **SKIPPED** Actions result; this is **not a PASS or a failed test** and must never be used to advance release status.
- When an audited, coherent development patch and its tests are ready, commit a **final change matching that workflow's `on.push.paths` filter** with `[verify]` in the commit message, e.g. `test(tna): verify completed GMR-04 [verify]`. Wait for the resulting GitHub Actions job's **actual `success` conclusion**, inspect its SHA, steps and failures, then record exact evidence in `VESA_PROGRESS.md` and the current application's existing tracker. Do not assume a status is verified merely from a job that was skipped.
- Manual `workflow_dispatch` is also preserved in both YAML files, although GitHub exposes manual dispatch only when the workflow exists on the repository's default branch; TNA's feature-only workflow may require the `[verify]` push checkpoint instead. Do not use a fabricated API call or trigger a main deployment to work around that limitation.
- Example real proof: TNA full run [38678044093](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678044093) **SUCCESS** and intermediate run [38678152337](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678152337) **SKIPPED**; Costing full run [38678047770](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678047770) **SUCCESS** and intermediate run [38678156587](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678156587) **SKIPPED**.
- Keep every existing syntax/unit/domain/saved-copy/Excel/Playwright/PPM/AQL/shared-shell test intact. Do not remove real regression coverage to reduce email volume. The user's GitHub email-notification preferences are account-level settings and were **not modified**; workflow-only gating reduces avoidable failure-alert opportunities, not all GitHub correspondence.
- The `main` branch, Costing demo URL and Pages deployment are separate. Do not merge/redeploy TNA from a skipped run. Next actual application work remains **GMR-04 reviewed Excel import into a new draft**.


**This section supersedes VS Code-only and local-checkout assumptions below for ChatGPT Work sessions, while preserving the historical prompt.** For `NEXT`, `CONTINUE`, or `RESUME VESA 360`, inspect the live connected repository `venkatbangla-boop/vesahost` first: `main`, active branches, recent commits, CI results, `AGENTS.md`, `VESA_PROGRESS.md`, the current app's authoritative blueprints/tracker, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, and `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`. Prefer GitHub branch reads/writes and actual GitHub Actions proof if local checkout or cloud computer execution is unavailable. Do not claim to have executed local code from connector-only source reads.

**Current work-selection authority:** The maintained portfolio queue in `VESA_PROGRESS.md` takes precedence over the older three-app order in this historical prompt. Determine actual remaining work from branch source, reports, CI and acceptance gates; do not restart accepted milestones. Continue on a development branch with narrow audited patch groups, preserve all existing records, formulas and branch history, and update the existing trackers rather than creating alternatives. An external deployment or human-approval blocker does not block independent development of the next queue item.

**Evidence and release:** Use statuses `NOT STARTED`, `ACTIVE`, `CONDITIONAL`, `BLOCKED`, `DEVELOPMENT VERIFIED`, `DEMO LIVE`. A successful CI run establishes its stated test scope only. Never claim `DEMO LIVE` absent policy-compliant authorization plus actual public route/version verification. Browser-local login is not secure server authentication. No GitHub Pages commercial SaaS approval is implied by permission to commit source on a branch. If a push triggers CI, inspect and record its run ID, SHA, conclusion, missing checks and precise NEXT ACTION.

**Missing specifications:** Recover source handover ZIPs and the approved 15-app roadmap from repository or accessible attachments. If unavailable, keep unresolved blueprint items flagged; never invent business logic, acceptance criteria or fabricated PASS results.

---


**USE THIS SAME PROMPT whenever the Codex session stops, the computer restarts, a checkpoint ends, or you return after several days.** Paste the instructions below into VS Code Codex. Once the specs are correctly installed in your `vesahost` checkout, do not upload all ZIPs again for each resume.

**Permanent scope decision:** VESA is a static, browser-first collection of applications using local VS Code/Git, the user's existing GitHub Free repository, and local browser/device records. No separate cloud subscription, remotely hosted application database, external authentication provider, paid hosting, live collaboration backend, SMS/email service or other third-party infrastructure is authorized.

---

## RESUME THE EXISTING VESA 360 PROGRAM - DO NOT RESTART

Work in my **CURRENT LOCAL VS Code checkout** of `venkatbangla-boop/vesahost`. Continue **TNA 360, PPM 360, AQL 360, and the ONE extensible VESA design platform**. Preserve all completed work and all safe locally achievable Phase 1/2/3 requirements. Build future apps only when their requirements are approved.

### 1. Load instructions in the correct priority

Before changing code, verify `git remote -v`, branch, HEAD, `git status`, uncommitted work, recent commits, test commands and actual source. Do not assume the GitHub `main` branch reflects the newer local development branch.

Read, in order:

1. Root `AGENTS.md`, including the most recent valid scope-change instructions.
2. `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` (the permanent scope contract). If not installed there, find the provided `VESA_GITHUB_FREE_ONLY_SCOPE.md` and safely install it after checking for existing/newer files; do not pretend a missing file was read.
3. `VESA_CONTINUITY_RULES.md`, `VESA_PROGRESS.md`, and `VESA_360_RECOMMENDED_FOLDER_TREE.md` where present.
4. `docs/tna/06_EXECUTION_TRACKER.md`, `docs/ppm/06_EXECUTION_TRACKER.md`, `docs/aql/06_EXECUTION_TRACKER.md`, and available shared-UX tracker.
5. Relevant `apps/ppm/AGENTS.md`, `apps/aql/AGENTS.md`, and the full blueprint/specification for the current gate.

**Conflict rule:** The GitHub-Free-only contract takes precedence over older documents **only** for excluded cloud, provider, hosting, security and collaboration scope. It does **not** override frozen garment calculations, inspection rules, measurements, decisions, save formats, acceptance requirements, or data safety.

### 2. Recover exactly where work stopped

Compare the latest `ACCEPTED` checkpoint to real source, Git commits and test output. Reconcile any stale tracking status. Identify the specific in-progress gate, partial edits and the ONE next safe action. Resume that work first. **Never reset, clean, force-push, delete records, overwrite newer files or reimplement completed work.**

### 3. Mandatory Free-only architecture

- GitHub hosts **source code/version history**, not user-entered PPM, AQL or TNA business records. Do not use GitHub issues, repository APIs, Actions artifacts or GitHub Pages as a customer-data database.
- The applications run calculations in the browser; save/reopen on that browser/device using the existing approved IndexedDB/localStorage implementation. Provide fully tested **Download Saved Copy**, **Open Saved Copy**, **Prepare Report**, **Print/PDF**, and local Excel export where specified.
- Never silently upload real orders, inspections, buyer/customer data, employee identities, evidence, signatures, passwords or API tokens to GitHub, public assets, test fixtures or logs. Use synthetic data for tests.
- Preserve offline capability and backwards-compatible saved-copy readers; never clear browser storage as a fix. Explain plainly that device/browser cleanup can lose local records, so user-downloaded backups are essential.
- Before any page/UI work, read `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`. Maintain exactly one visible VESA logo, one top-level header/navigation owner, one app identity/account/Settings/save-state area and one ordered six-menu shell (Home/File/Edit/View/Tools/Help) across Login/App Centre/Admin/TNA/PPM/AQL and every future page. Never stack auth and app headers or recreate app-specific fixed menus. Use shared tokens, responsive behavior, user-friendly wording and English/Bengali/Hindi/Tamil guidance without changing business data.
- Preserve PPM's 168 checkpoint identities, decisions, signatures and measurement rules; AQL's frozen sampling tables/Ac-Re/inspection acceptance and evidence; TNA's calendar/true critical path/baseline/history and operational calculations.
- Existing browser-only login may remain as a **local convenience**, but never call it secure server-side authentication or claim the published static source is inaccessible without login.

### 4. Defer cloud-only requirements without destroying work

Treat previously proposed backend, external identity, remote database, provider-side roles/tenant enforcement, live multiuser co-editing, cloud sync, external SMS/email/push notification, paid CI/services and commercial SaaS deployment as `DEFERRED_BY_SCOPE`, **not failed tasks and not completed tasks**. Do not build, purchase, connect, activate or require those services. Keep dormant audited adapters only if retaining them is less risky than deleting them; do not represent them as active features.

TNA: complete local/manual PPM/AQL references and on-screen due notices; finish independently testable regression, not provider-only tests.

PPM: complete remaining local acceptance/report/UI/saved-record tests; do not require the external provider/two-account cloud proof of old P-G09 for free-only completion.

AQL: continue full locally testable sampling, stages, evidence, reinspection, reports, saved copies and usability. Never invent carton randomization or buyer sampling rules; classify absent required business input accurately.

Shared VESA UX: complete consistent shell, App Centre, theme/language, accessibility, responsive layout and cross-app regression. All apps must remain independent in domain logic and local records.

### 5. Run an audit-first, tested patch loop

For each next safe change: inspect the exact files; identify current ownership, dependency direction and state; list in-scope/frozen files; define verification and rollback; implement a **small reversible patch**; run actual unit/contract, browser, saved-copy and regression tests relevant to the patch; record an honest `ACCEPTED`, `CONDITIONAL`, `BLOCKED`, or `DEFERRED_BY_SCOPE` status. Only accept checkpoints backed by evidence. Commit verified changes safely to the existing local development branch. Do not assume passing a subset of tests proves a full gate.

Do not modify production `main`, publish a public development branch, change DNS or deploy until I explicitly approve it. Verify GitHub Pages terms and the intended actual business use before proposing public commercial hosting. GitHub Pages size headroom does not equal permission for commercial SaaS or server security.

### 6. One live progress file, two truthful percentage views

After each verified checkpoint, update the app tracker and `VESA_PROGRESS.md` with:

- **HISTORICAL FULL-SCOPE progress:** preserve the original full-program gate baseline and its recorded values for comparison (for example, 55% overall was the earlier recorded value); do not rewrite history.
- **CURRENT GITHUB-FREE-ONLY progress:** count only **audited, explicitly eligible, independently verified active requirements** under the same TNA 30% / PPM 30% / AQL 30% / shared UX 10% weighting. Document the eligible denominator/subrequirements and the formula. Do not automatically count cloud-only excluded work as done or drop mixed gates without splitting local/provider portions.
- Completion and remaining percentages for TNA, PPM, AQL and Shared UX, or **NOT YET RECALCULATED** until eligibility/evidence reconciliation is complete.
- Last ACCEPTED gate and tested commit SHA, actual tests run, CURRENT TASK, blockers, DEFERRED_BY_SCOPE items, timestamp and exactly ONE NEXT ACTION.

**Never invent a higher percentage** merely because cloud scope has been removed. Deferred requirements should not be counted as passed.

### 7. Continue automatically within this active Codex session

Finish the interrupted safe checkpoint, update progress, then continue with the next independently achievable checkpoint **without asking for routine "continue" messages** while this Codex session and tools remain active. Work through TNA, PPM, AQL and unified UI until the **GitHub-Free-only locally achievable scope** has passed its verifications, or an actual necessary approval/requirement is missing. If an optional provider-only task is unavailable, defer it and move to other local work.

If the session/time/context ends: finish the smallest safe unit if possible, commit verified work, update Git/progress/tracker evidence and write ONE exact NEXT ACTION. A later session will use **this same resume prompt**; the assistant cannot automatically restart after VS Code closes/logs out.

### 8. End-of-turn progress line

Report briefly:

`FREE-ONLY VERIFIED __% | FREE-ONLY REMAINING __% | TNA __% | PPM __% | AQL __% | SHARED __% | HISTORICAL FULL-SCOPE __% | LAST ACCEPTED <gate/commit> | ACTIVE <gate> | NEXT <action> | DEFERRED <items> | BLOCKERS <actual active blockers>`

If the free-only baseline is not yet verified, write `FREE-ONLY VERIFIED: NOT YET RECALCULATED` rather than guessing.

**Start by reconciling the real local branch and the permanent GitHub-Free-only scope, then execute the next audited, safe, locally achievable task. Do not stop at producing a plan.**

---

**One-time setup:** Save this file as `02_UNIVERSAL_RESUME_PROMPT.md`. Install the separately provided `VESA_GITHUB_FREE_ONLY_SCOPE.md` under `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md` and reference it from root `AGENTS.md` without overwriting newer instructions. Thereafter, use this exact same prompt whenever you need to resume.
