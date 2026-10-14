# Automated Evidence Supporting Local UAT

Automated evidence reduces regression risk but does not change any human checklist row from `NOT TESTED`.

## Accepted baseline before package preparation

- Runtime: AQL AR11 `abc465d`.
- Tested content: `accf1c8`.
- Complete boundary: 94/94 commands in 949.6 seconds without retry — 59 automated, 22 browser, 12 syntax and 1 repository check.
- Current documentation HEAD before this package: `182cf52`; worktree was clean.

## AR11 focused evidence repeated for this preparation

| Command | Result | Proven boundary |
|---|---|---|
| `node apps/aql/tests/a-g03-ar11-carton-selection.cjs` | PASS | Ranges/leading zeros, unique manual/internal-uniform/combined selection, deterministic fixtures, replacement history and policy guard |
| `node apps/aql/tests/a-g03-ar11-carton-selection-browser.cjs` | PASS | Visible combined/manual workflow, Auto Fill Remaining, inspected status, history, local/portable reopen, EN/BN/HI/TA guidance and 390/1280 printable report |
| `node apps/aql/tests/a-g03-sampling.cjs` | PASS | Frozen sampling/provenance contract remains unchanged |
| `node apps/aql/tests/a-g08-reports-language.cjs` | PASS | All AR01–AR15 report registrations and four-language/report/accessibility source contract |
| `node apps/aql/tests/release-contract.cjs` | PASS | AQL release/cache/schema safety contract |

## Evidence limits

No automated check proves human usability, physical carton access, buyer certification, actual scanner/printer behavior, screen-reader acceptance, factory custody, server security, remote collaboration or production authorization. Record those only in `05_RESULTS_AND_SIGNOFF.md` after real evidence exists.

## Final package boundary

- Clean tested commit: `0bd6582`.
- `node tests/vesa-g11-regression.cjs`: PASS, 95/95 commands in 899.9 seconds without retry.
- Classification: 60 automated, 22 browser, 12 syntax and 1 repository check.
- The new package contract passed with all 49 human rows still `NOT TESTED`.
- No runtime, schema, business rule, saved record, provider or deployment changed in the UAT package patch.

