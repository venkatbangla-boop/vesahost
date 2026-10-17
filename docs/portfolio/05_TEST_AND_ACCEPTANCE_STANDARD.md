# VESA 360 - Standard Quality Gates for Each New Application

## Gate identifiers and verdicts

Track each proposed app with **APP-G00** through **APP-G09**. Do not count `DRAFT`, `ACTIVE`, `CONDITIONAL`, `BLOCKED`, `DEFERRED_BY_SCOPE` as accepted. Never mark human UAT passed solely from automation.

| Gate | Required proof | Examples of unacceptable shortcuts |
|---|---|---|
| APP-G00 Audit and owner | Real file audit, dependencies, frozen contracts, reviewed patch plan | README-only review or guesses about current branch |
| APP-G01 Model and rules | Explicit versioned model, pure deterministic calculations and boundary fixtures | Invented rates, buyer approvals or measurement units |
| APP-G02 UI shell and menus | ONE header, ordered six menus, mobile/keyboard and language selection | Duplicated app logo/navigation |
| APP-G03 Main workflow | Browser proof of create/edit/validate/rollback/last state | Click-through with no saved result |
| APP-G04 Local persistence | Save, reload, reopen and controlled copies, app-specific isolated keys | Browser-state loss or overwriting a valid record on corrupt import |
| APP-G05 Reports and exports | Immutable escaped report with complete source units, local workbook/print where specified | Draft presented as signed certificate, unsafe spreadsheet cell |
| APP-G06 Cross-app boundary | Proven manual readonly references and no sibling-store mutation | Reading foreign IndexedDB/localStorage namespace directly |
| APP-G07 Languages and accessibility | EN/BN/HI/TA authored text, desktop/mobile sizes, keyboard/focus and contrast | Translated buyer/source values or clipped tables |
| APP-G08 Full regression | Existing TNA/PPM/AQL and app-specific affected tests; zero fabricated PASS | Rerunning only a screenshot smoke and claiming full parity |
| APP-G09 Handoff/release posture | Exact SHA, status, logs, rollback and demo/public release decision | Deployed without authorization or unverified site cache state |

## Minimum synthetic fixture matrix

1. Fully populated valid sample with explicit source and units.
2. Missing required business data; downstream calculations show `Needs Information` not zero/guessed result.
3. Zero, negative, decimal, oversized and duplicate quantities where invalid.
4. Currency/unit mismatch and non-comparable data.
5. Boundary rates, dates, tolerances, rounding and large quantities as relevant.
6. Revision then reopen; immutable previous revision.
7. Invalid/future/schema-mismatch/over-limit saved copy; atomic unchanged existing record.
8. Unicode/Tamil/Bengali/Hindi text, special characters and spreadsheet-formula payloads.
9. 320, 390, 768 and 1280 pixel layout + keyboard Tab/Shift-Tab/Escape/visible focus; 200% zoom on shared shell boundary.
10. Offline reload and service-worker update only where app has an audited SW scope.
11. No external data-upload network requests; no real customer or confidential buyer fixtures.
12. Cross-app reference imported once, stale/unknown revision flagged and original source untouched.

## Automated evidence vs human acceptance

- **Automated PASS**: A named code/browsertest with exact command, fixture, SHA, result and log/screenshots collected by Codex.
- **Human PASS**: An actual person checked the behavior and provided evidence/sign-off; no false conversion from automation.
- **Physical/buyer/bank/compliance acceptance**: External source evidence only when approved/available; for personal demo this may stay untested and clearly labelled without endlessly blocking unrelated development.
- Evidence belongs under ignored local test output or dedicated safe synthetic fixture directories; screenshot filenames must not contain buyer names or private records.
- Keep 49 existing VESA human UAT rows truthful (user's last known status: 1 PASS / 0 FAIL / 48 NOT TESTED); don't overwrite historic results while developing new apps.

## Efficient verification cadence

- After small local change: most relevant deterministic fixtures + short browser smoke for the changed surface.
- After domain gate: broader app tests and reference contract checks.
- After shared platform assets, schema migration or release decision: full relevant cross-app test matrix, once after the accepted baseline is stable.
- If a process runs slowly, inspect which test is running, collect timing and do not blindly rerun unchanged failures.
- A failed test requires a precise failure report and smallest reviewed patch; not a wholesale app rewrite.

## Release labels

- `DRAFT` - requirement proposal only; cannot imply built functionality.
- `LOCAL_VERIFIED` - domain/workflow/browser/local saved-copy tests passed, not human factory approval.
- `DEMO_RELEASE_READY` - technical + source/privacy checks passed and specific demo publishing approval obtained.
- `DEMO_PUBLISHED` - exact route, SHA and actual live site/asset/cache smoke verified.
- `BUSINESS_APPROVED` - forbidden unless independently supported by real business-owner/buyer/factory evidence.

## Required test summary output

```text
APP: <id + slug>
SCOPE: <exact files>
BASELINE: <before SHA>
CANDIDATE: <after SHA>
GATES: G00..G09 with accepted/conditional/blocker
AUTOMATED: <command + result>
BROWSER: <routes, viewport, saved-copy, screenshots>
HUMAN: PASS/FAIL/NOT TESTED (truthful)
REGRESSIONS: <TNA/PPM/AQL/shared impact and tests>
DEPLOY: NOT AUTHORIZED / READY / DEMO PUBLISHED
ROLLBACK: <precise plan>
NEXT: <single practical task>
```