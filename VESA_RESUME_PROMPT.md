# VESA 360 - ONE UNIVERSAL RESUME PROMPT (GITHUB FREE + LOCAL DATA)


## Latest verified TNA checkpoint — GMR-06 R03 Factory Daily Action (2026-10-15)

**TNA overall ACTIVE / CONDITIONAL. R03 bounded functionality: DEVELOPMENT VERIFIED, not DEMO LIVE.** Real checkout [Actions #38693428330](https://github.com/venkatbangla-boop/vesahost/actions/runs/38693428330) on exact source/test SHA `193515d8228419d5000a027ca7d1aa6f7a59f8aa` completed **SUCCESS**: **67/67 direct Node tests PASS, zero failures**, older domain/scheduling/storage/report and PPM 168 checkpoint and AQL Ac/Re regressions PASS, plus real Chromium authenticated TNA/R03 preview, explicit as-of date gate, Excel, JSON, landscape printed PDF, desktop/mobile viewport and original local saved-record immutability PASS. GMR-04A/B/C, GMR-05 R02 privacy and R01 factory-master XLSX/PDF regressions PASS. Shared Login/App Centre/Admin seven-width/200%-scale/navigation/keyboard and TNA 390/1280 shell browser checks PASS. No external network requests or reported page errors in those browser fixtures.

**New behavior and ownership:** `apps/tna/src/reports.js` exposes an R03-only `factoryDaily` read-only projection requiring a strictly valid user-selected YYYY-MM-DD **as-of date** (never defaults from the computer clock). Open dated tasks are partitioned by the recorded current finish if supplied (otherwise original baseline finish) into `overdue` (strictly before as-of), `today` (same day), `nextSeven` (days +1 through +7 inclusive), or `needsDate` (missing/invalid date). Activities recorded completed/approved with actual finish matching as-of show under Today, not Overdue; completed earlier and >7-day future open tasks are not mislabeled as today's action. Invalid explicit revised date never silently falls back to baseline. Source-only department/owner, waiting party, delay reason, follow-up, recovery, proof refs, status ID and original/revised/forecast/actual distinctions are preserved. Display status and section labels are localized EN/BN/HI/TA; stable record/report IDs are unchanged. Source owner, buyer approval, factory holidays, calendar basis and capacity are **not independently verified**; unknown fields stay Needs Information. The factory report is an internal operational audience, NOT buyer-safe R02.

`apps/tna/src/storage.js` requires a ready review-date projection before any R03 workbook export. It retains four common existing worksheets and adds true typed-date `Factory Daily Actions` and `Missing Action Dates` sheets, with a typed review-as-of field and data-gap counts in Report Summary. Source text is spreadsheet-formula-escaped. `apps/tna/src/bootstrap.js` adds a date control visible ONLY when R03 selected and blocks preview exports, print/share/download unless the explicitly selected date is valid; the R03 preview has two linked readable parts for each section, reusing the existing single VESA report dialog. Scoped CSS, index asset versions, root service-worker cache, prior G07/G13/G17 compatibility tests and the EXISTING GitHub Actions workflow updated. New tests: `apps/tna/tests/g18-factory-daily-report.test.js` and `g18-factory-daily-report-browser.cjs`. **Frozen untouched:** domain.js, scheduling.js, saved-copy schema and migrations, PPM/AQL engines, Login/App Centre, R01/R02 model/privacy contracts, R04-R12 specialized audience work, public `main`, and website.

**Verification history:** Earlier [run #38693234239](https://github.com/venkatbangla-boop/vesahost/actions/runs/38693234239) showed **65/67 direct Node PASS, 2 FAIL**: the prior R02 test still demanded old generic R03 list parity, and R03 missing-date Excel cells used a hard-coded English placeholder instead of the selected language. The prior test was kept for R01/R02/R04-R12 and new G18 controls R03; new R03-only date cells were localized. Final run #38693428330 passed 67/67 and all browser tests. The failed and skipped intermediate workflows are NOT acceptance evidence. Container GitHub DNS was unavailable; the authoritative tests were run by GitHub Actions on the actual repository checkout.

**Outstanding human/release gates:** Real factory merchandiser/buyer UAT, independently checked business dates and factory calendars, external Excel desktop/Indic PDF viewer proof, R04-R12 specialized reports, Pages hosting eligibility and authorized demo release remain open. GitHub Actions notification emails remain the account owner's preference, not changed through repository files.

**PRECISE NEXT ACTION — GMR-07 R04 Critical Path Report:** Source-audit `apps/tna/src/reports.js`, `apps/tna/src/scheduling.js`, `apps/tna/src/operations.js`, `apps/tna/src/storage.js`, report dialog and `docs/tna/03_SCHEDULING_ENGINES.md` for proper CPM critical-chain, total/free float, required ex-factory versus feasible finish, buffers and violated gates. Build a read-only, honest R04 specialized model and true Excel/print audience with explicit calendar/source validity gating; never fabricate critical tasks or float when schedule constraints are insufficient. Test knit/woven feasible and infeasible source cases, missing calendar/duration, old report parity, EN/BN/HI/TA, real Excel/PDF/browser, PPM/AQL. After R04, proceed R05-R12 and human UAT. **Next portfolio app after full TNA acceptance: Packing & Container 360.**

---



## Latest verified TNA checkpoint — GMR-05 R02 Buyer TNA Report (2026-10-15)

**TNA overall ACTIVE / CONDITIONAL; bounded R02 DEVELOPMENT VERIFIED, not DEMO LIVE.** Actual GitHub checkout [Actions #38691336291](https://github.com/venkatbangla-boop/vesahost/actions/runs/38691336291) on exact source/test SHA 533c262dfc60668004469f4785fca501f93f643f completed SUCCESS. **62/62 Node tests PASS, zero failures**; real Chromium R02 preview, JSON, typed XLSX and PDF print, mobile and original saved-record integrity PASS. TNA G01/G02/G03/G05/G07, R01 full workbook/PDF, GMR-04A/B/C imports, 168 frozen PPM checkpoints, AQL baseline/sampling and shared Login/App Centre seven-width/200%-scale browser regression also PASS.

**Source and ownership:** apps/tna/src/reports.js now owns a deny-by-default R02 buyer-only milestone/action projection based on explicitly allowed canonical garment references. It never copies raw task titles, owner details, factory comments, internal FOB, LC proof IDs or generic private validation messages. An actionable buyer follow-up requires the recorded waitingFor=buyer state on an incomplete permitted milestone; being owned by buyer alone does not create a claimed action. Date columns original/revised/forecast/actual are kept separate. Model tasks preserve stable status IDs while outward R02-specific display texts are translated in English/Bengali/Hindi/Tamil. All approvals/statuses are source-reported rather than independently authenticated; absent externally verified buyer delivery decisions mean buyerConfirmedTarget remains null and display Needs Information. Factory identity is hidden in the R02 order model. The R02 standalone JSON cannot expose internal plan details.

apps/tna/src/storage.js uses ONLY the sanitized report model, retains the four established workbooks sheets and adds buyer-only typed Buyer Milestones / Buyer Actions for R02. apps/tna/src/bootstrap.js builds two-part accessible milestone preview plus action list and keeps the existing VESA dialog/print flow. Scoped assets/tna.css, index.html versions and offline service-worker.js refreshed. New g17-buyer-tna-report.test.js and g17-buyer-tna-report-browser.cjs prove private marker non-disclosure, typed dates, Excel formula escaping, browser PDF, mobile, and unchanged original orders. Existing g07-reports.test.js, g13-merchandising-report-parity.test.js and original TNA verification workflow updated. Frozen untouched: domain.js, scheduling.js, saved-copy schema and migrations, PPM/AQL, login, main and website.

**Red/green trail:** Initial run 38690958302 passed 62/62 direct Node cases but legacy G07 failed because the R02 generic report status had changed to localized text. Restored stable status ID while keeping localized buyer display. Run 38691105217 passed direct and buyer XLSX/PDF/browser checks, but new browser-only test forgot to restore screen media after printing and timed out reopening R01 controls; fixed with explicit screen restoration/visibility proof. Final run 38691336291 fully successful. Do not call earlier failed/skipped runs green. Local container could not DNS-resolve GitHub, so authoritative proof used actual GitHub Actions checkout, not a simulated local checkout.

**Current remaining limitations:** R02 is a locally generated, user-reviewed buyer report, not a verified external buyer approval or secure backend role. Buyer/factory UAT, desktop Excel and physical PDF font validation, TNA R03 through R12 audience-specific reports and separate release authorization remain pending. Owner-level GitHub Actions email notification setting is unchanged.

**PRECISE NEXT ACTION — GMR-06 R03 Factory Daily Action:** Inspect R03 current generic model and owner/status/dates/waiting/proof/reason data sources in reports.js, exportReportWorkbook, bootstrap report dialog and the approved reporting contract. Build a practical, source-backed Today / Overdue / Next Seven Days view with explicitly selected as-of date; show recorded department owner, reason, follow-up and evidence references. Never infer dates, capacity, factory holidays or accountability where unknown. R01/R02 and R04-R12 remain untouched; verify EN/BN/HI/TA, genuine Excel, Chromium print, storage regression and PPM/AQL. Next portfolio app after full TNA acceptance is Packing & Container 360.

---


## Latest verified TNA checkpoint — GMR-04C custom activities and advanced dependencies (2026-10-15)

**Overall TNA status: ACTIVE / CONDITIONAL. GMR-04C bounded scope: DEVELOPMENT VERIFIED, NOT DEMO LIVE.** Actual repository checkout [GitHub Actions #38689143880](https://github.com/venkatbangla-boop/vesahost/actions/runs/38689143880), source/test SHA 7f6e53241b06ff7faba7d7e2b6d923b29ba80e79, completed **SUCCESS** with **56/56 direct Node tests, 0 failures**, and real authenticated Chromium XLSX workflow PASS. GMR-04A order-only import, GMR-04B approved task FS/0 import and GMR-04C custom activity with explicit Stage/Task Kind, SS/FF/SF, signed lag/lead and basis, new unsigned draft, old saved order unchanged, browser saved-copy round trip/reload and mobile all PASS. TNA G02/G03/G05/G07, R01 workbook/PDF, PPM 168 frozen checkpoints, AQL sampling and Login/App Centre/mobile shared shell regression also PASS.

**Exact delivered scope:** apps/tna/src/activity-import.js maps a new custom row only upon an explicit __CUSTOM__ review decision, with source Activity Ref, bounded nonempty title, Stage from domain.STAGE_LABELS and Task Kind work/milestone/gate. Custom stable template reference CUSTOM-<stage>-<source-ref> is attached to domain.addCustomTask's normal 1.1.0 task. Source Predecessors retain legacy O01;O02 only after FS/0 consent or accept advanced per-edge O01|SS|2|working; D05|FF|-1|calendar after separate relationship/basis consent. A signed negative lag is a sourced lead and is marked allowLead. Imported edges never infer the original default sequential chain. Formula/unsafe, missing, duplicate, self-linked and cyclic source graph and unevidenced completion/approval are rejected before persistence; previously saved/signed plans are immutable and one new draft can receive activities only once. Every date/evidence/calendar assumption is user-reviewed, not independently authenticated.

**Files changed and rollback boundary:** apps/tna/src/activity-import.js, bootstrap.js, index.html, assets/import-review.css, root service-worker.js; new g16-advanced-activity-import.test.js and g16-advanced-activity-import-browser.cjs; small old GMR-04B browser row-selector adjustment; expanded existing .github/workflows/tna-merchandising-verification.yml. Preserve all earlier history. Frozen untouched: domain.js, scheduling.js, storage.js, reports.js, saved-copy schema, PPM/AQL engines, login, main and public website. Revert only this feature-branch patch if necessary, no force push or clearing local records. The earlier CI #38688987344 had 56/56 Node PASS but a **browser test-only count mismatch** after adding a second predecessor-detail table. The test was scoped to its first activity table; final CI #38689143880 passed. Skipped intermediate commits are not acceptance proof.

**Limitations:** A workbook imports a user-selected single order row and one activity sheet into a new unsigned record; no multiple-PO automation, authenticated external approval, verified factory holiday calendar or human business UAT. Explicit mixed precedences do not validate independent external contractual guarantees, and source data cannot be treated as real buyer decisions merely because it imported. GitHub Actions email setting is still owner-controlled.

**PRECISE NEXT ACTION — GMR-05 R02 Buyer TNA audience report:** Audit apps/tna/src/reports.js R01–R12 report models, apps/tna/src/storage.js XLSX output, apps/tna/src/bootstrap.js report preview and docs/tna/04_UX_LOCALIZATION_REPORTS.md section 9. Current R02 exposes a generic task listing rather than a source-filtered buyer milestone/action view. Implement real buyer-visible milestones, required buyer actions, source-backed verified targets vs forecasts and gap explanations while never leaking internal commercial / LC source / factory-only notes or pricing. Do not silently upgrade R03–R12. Test EN/BN/HI/TA, actual XLSX/Chromium print and previous R01/PPM/AQL shared-shell regressions. Then R03–R12 and factory/buyer human UAT. Next approved app after TNA acceptance: Packing & Container 360.

---


## Latest verified checkpoint — TNA GMR-04B Excel activities and dependencies (2026-10-15)

**Status:** TNA garment-merchandising rework is `ACTIVE / CONDITIONAL`. **GMR-04B, bounded approved template-activity and explicit FS/0 Excel import: DEVELOPMENT VERIFIED.** The genuine repository-checkout [GitHub Actions run #38687479231](https://github.com/venkatbangla-boop/vesahost/actions/runs/38687479231), source/test SHA `1b58af86da92ca644915f6c37159201d1723f9fc`, completed **SUCCESS**: **44/44** direct Node tests pass, existing TNA scheduling/storage/migration/report and PPM/AQL sampling checks pass, actual Chromium GMR-04A **and** GMR-04B real .xlsx upload/mapping/consent/save/reopen/mobile pass, R01 full workbook/PDF and shared VESA/Costing routes pass. GitHub Actions test history includes a failed previous SHA `da0013df29442aefd3f44fe8ef8b3c457dfb3d4d` (43/44) that revealed a real second-import guard weakness; source corrected before this green run. Never count that earlier failed run as PASS.

**Exact new functionality:** A separate selected activity worksheet is user-mapped to known profile-specific TNA template references. Dates keep original/revised/actual Start/Finish distinction; owner, waiting party, source evidence, responsible authority, duration and status are validated from actual Excel values. The importer detects duplicate/unmatched activities, unknown predecessors, cyclic graph, invalid dates/formulas and unevidenced decision/completion claims. It explicitly requires review that bare predecessor references mean **Finish-to-Start, zero lag**. Unknown durations and activities absent from the worksheet remain unknown/unstarted, not fabricated. The existing generated template dependency chain is replaced by only the reviewed Excel edges when this mode is selected. Local save creates a distinct **unsigned** draft; original records and signed baselines are never modified or silently overwritten. A one-time guard blocks applying the same activity import twice to a draft. Order-only GMR-04A remains available unchanged.

**File-level patch and ownership:** Added `apps/tna/src/activity-import.js` as pure workbook review + new-draft application service. Updated `apps/tna/src/bootstrap.js` for opt-in mapped review and two consent gates, `apps/tna/index.html` and `service-worker.js` for bundled assets, `apps/tna/assets/import-review.css` for responsive activity preview, the same existing CI YAML, and added `apps/tna/tests/g15-activity-import.test.js` and `g15-activity-import-browser.cjs`. No alteration to `apps/tna/src/domain.js`, `scheduling.js`, `storage.js`, `reports.js`, the TNA 1.1.0 record/copy format, original PPM/AQL rules, authentication, `main`, or the live Pages route. Roll back this feature-branch patch normally without deleting local records; never force push or re-baseline.

**Still unsupported / not silently accepted:** Automatic creation of unknown/custom TNA activities from an arbitrary spreadsheet, dependency relations SS/FF/SF or nonzero lag, multi-order Excel import, external approval authentication, true factory calendar validation and human merchandiser testing. Those remain **CONDITIONAL**; desktop Excel and production-user UAT are not verified. The user's GitHub Actions email notification preference was not changed by the repository connector and requires the owner account setting described in the previous checkpoint.

**PRECISE NEXT ACTION:** **GMR-04C** — audit authoritatively how new custom TNA activities and explicit SS/FF/SF / nonzero-lag relationships can be imported from a user-reviewed workbook without changing signed baselines or previous records. Add a source-backed explicit relationship mapping, custom-row identity and full graph/copy/browser tests; do not assume every workbook supports advanced dependencies. Then address the still pending R02–R12 audience-specific reports, real factory/buyer UAT and release authorization. **Next portfolio application after accepted TNA: Packing & Container 360.**

---



## GitHub Actions failure-email policy — owner preference pending (2026-10-15)

**Cause confirmed:** GitHub automatically sent the user's GitHub Actions run-failure emails for individual verification attempts (e.g. source SHAs `9367558`, `364131e`, `0c92a3b`). These are historical failed checks superseded by GMR-04A [successful run 38679689378](https://github.com/venkatbangla-boop/vesahost/actions/runs/38679689378) at `b088ea79e4fe273c4d23b9bd8af949e034046748`. Local VS Code test failures do not by themselves generate GitHub Actions emails, whereas sending an early `[verify]` commit to GitHub did. The workflow checkpoint gating reduces automatic CI jobs but **cannot turn off GitHub's account-level email preference**.

**Actual notification OFF instruction:** The **owner** must open https://github.com/settings/notifications on their signed-in GitHub account, go to **System → Actions**, choose **Don't notify**, then **Save**. This is the officially supported Actions notification control: https://docs.github.com/en/subscriptions-and-notifications/how-tos/managing-github-actions-notifications. Do **not** choose `Email` or `Only notify for failed workflows`. The current repository connector cannot change personal GitHub notification preferences; **owner setting NOT CHANGED / awaiting confirmation**, and no claim that all future emails are already disabled is authorized. Other repository/security/conversation emails are separate preferences; do not mute all GitHub email unnecessarily.

**Permanent engineering behavior:** Keep the existing `[verify]` job gate and full TNA/Costing/AQL/PPM tests. Prefer actual local/Work-checkout Node, syntax and browser tests *before* the single final, path-matching `[verify]` checkpoint for a coherent patch group. Avoid using repeated `[verify]` commits as an interactive debugger while simple checks are possible. If no local checkout/browser execution is available, disclose that limitation, push an explicitly conditional patch only after static review, and never count `SKIPPED` or `FAILURE` as `PASS`. Fix true failures and re-run proper CI when needed. **Never use `continue-on-error`, fake-green checks, removal of test triggers or disabled tests to suppress emails.** GitHub run statuses stay visible in Actions after email is turned off.

**Exact scope:** Documentation clarification only; no application source, tests, workflow YAML, notification preference, `main` or public demo changed. TNA GMR-04A remains DEVELOPMENT VERIFIED; NEXT = **GMR-04B complete reviewed Excel activity/dependency import into a NEW draft**, then reports/human acceptance.

---


## Permanent ChatGPT Work / GitHub connector resumption overlay (2026-10-15)

### GitHub Actions checkpoint discipline — verified October 15, 2026

- Source/verification code remains unchanged by this operational rule. Only the two branch-specific workflows have a **job-level** checkpoint guard. Normal intermediate development commits on `feature/tna360-continuous` and `feature/costing-360` yield an expected **SKIPPED** Actions result; this is **not a PASS or a failed test** and must never be used to advance release status.
- When an audited, coherent development patch and its tests are ready, commit a **final change matching that workflow's `on.push.paths` filter** with `[verify]` in the commit message, e.g. `test(tna): verify completed GMR-04 [verify]`. Wait for the resulting GitHub Actions job's **actual `success` conclusion**, inspect its SHA, steps and failures, then record exact evidence in `VESA_PROGRESS.md` and the current application's existing tracker. Do not assume a status is verified merely from a job that was skipped.
- Manual `workflow_dispatch` is also preserved in both YAML files, although GitHub exposes manual dispatch only when the workflow exists on the repository's default branch; TNA's feature-only workflow may require the `[verify]` push checkpoint instead. Do not use a fabricated API call or trigger a main deployment to work around that limitation.
- Example real proof: TNA full run [38678044093](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678044093) **SUCCESS** and intermediate run [38678152337](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678152337) **SKIPPED**; Costing full run [38678047770](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678047770) **SUCCESS** and intermediate run [38678156587](https://github.com/venkatbangla-boop/vesahost/actions/runs/38678156587) **SKIPPED**.
- Keep every existing syntax/unit/domain/saved-copy/Excel/Playwright/PPM/AQL/shared-shell test intact. Do not remove real regression coverage to reduce email volume. The user's GitHub email-notification preferences are account-level settings and were **not modified**; workflow-only gating reduces avoidable failure-alert opportunities, not all GitHub correspondence.
- The `main` branch, Costing demo URL and Pages deployment are separate. Do not merge/redeploy TNA from a skipped run. Next actual application work remains **GMR-04B reviewed Excel activity/dependency import into a new draft**; GMR-04A order-row review is already verified.


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
