# REUSABLE VS CODE CODEX PROMPT: Build ONE Selected VESA App

**Before starting:** Approve the selected app ID and its minimum viable business rules. Example default selection: APP-01 Packing & Container 360. You can substitute any one app from `blueprints/`.

## INSTRUCTION START

Continue the existing VESA repository safely. The next selected app is **APP-01 Packing & Container 360**. Read `docs/roadmap/01_MASTER_PORTFOLIO_ROADMAP.md`, `02_PLATFORM_STRUCTURE_CONTRACT.md`, `03_CROSS_APP_DATA_OWNERSHIP.md`, and `blueprints/APP-01_packing-container.md`. Do not build the other 14 apps this run.

M0 AUDIT - verify current local branch, HEAD/status, active/accepted work, actual `apps/` and shared UI/source file owners, release posture, current Test/Costing program instructions. Inspect every code file this app would modify or depend on. Provide exact in-scope/out-of-scope map, calls, storage, compatibility risks and rollback before any new code.

STRUCTURE - use domain-first browser-only modular architecture. Prefer `apps/packing-container/` with `src/domain/`, `src/application/`, `src/data/`, `src/reports/`, `src/i18n/`, assets and tests, but inspect existing repo first and do not duplicate an existing owner. Confirm exact file names in a staged patch plan. Reuse existing `templates/vesa-next-app/` selectively, not blindly.

BUSINESS - implement typed explicit garment/style/colour/size packing plans, carton dimension/weight units, solid/mixed pack counts, mathematical CBM/payload guards and truthful physical-fit disclaimers. Never assume sizes/capacity of a container, buyer packing ratio, carton count or stacking efficiency. Leave dependent outputs as Needs Information until user provides source-approved inputs.

UI - one VESA shared shell and ordered Home/File/Edit/View/Tools/Help menus, no duplicate header. Use existing central theme/preferences, four-language authored guidance, mobile and keyboard behavior, familiar Save Now, Download Saved Copy, Open Saved Copy, Prepare Report and Print buttons.

LOCAL RECORDS - versioned unique IDs in isolated browser storage, atomic invalid saved-copy rejection, fail-safe quota and recoverable unsaved draft. No API/cloud/database, no sibling app direct store reads, no production records in GitHub. Cross-app PO/Shipment/AQL interactions are explicit user-selected read-only snapshot references only.

DELIVERY - work through small safe M1..M4 milestones: pure data/domain -> app workflow and storage -> reports/manual refs -> browser/cross-app verification and handoff. After each patch group, run proportionate tests and commit verified work locally. Do not run 95+ command full regression after each small change; run it when a release/contract boundary warrants it. Use synthetic demos; take automatic Playwright screenshots and log evidence yourself; do not ask me to manually screenshot each check.

NO HALLUCINATION - do not mark missing buyer approval, true container fit, factory load test or real-device human UAT as PASSED. Distinguish local software evidence from external physical acceptance. Freeze existing TNA/PPM/AQL domains and Costing engine. Do not fabricate business rates or records.

RELEASE - register the app in the existing catalogue only after its route, local save, reports and shell behavior pass. No production `main` merge, public push or deploy unless explicit authorization for that release is already present and the actual site is suited to the intended personal demo; provide exact commit/destination/rollback record.

PROGRESS - update new app tracker and `docs/roadmap/11_MASTER_EXECUTION_TRACKER_TEMPLATE.md` copied to a living execution log only for genuinely accepted gates. Preserve previous program scores. If business input blocks a narrow calculation, continue safe other work without hiding the unknown.

FINISH - tell me: accepted functions, exact tests, current branch/SHA, local route, saved-copy/report status, remaining independent input, and NEXT precise safe step. Do not stop at just a blueprint: after the pre-code audit and scope gate, implement the authorized scoped changes and verify.

## INSTRUCTION END

**If selecting another app**, replace BOTH the APP-01 ID/name and matching blueprint filename. Never blindly use APP-01 formulas for another domain.