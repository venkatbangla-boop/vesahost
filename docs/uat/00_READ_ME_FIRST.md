# VESA 360 Local User Acceptance Testing

This package is for human testing of the existing GitHub-Free/browser-local VESA 360 candidate. It does not authorize production publication, certify buyer rules, or replace physical factory/device review.

**Preparation-source note:** the requested `VESA_360_FINAL_LOCAL_ACCEPTANCE_PREPARATION.md` attachment was not present in the repository or available attachment directory during preparation. This package therefore implements the complete instructions in the user request plus the repository scope/UI contracts and application trackers. Reconcile any additional attachment-only requirement if that file is supplied later.

## Candidate identity

| Item | Value |
|---|---|
| Branch | `feature/tna360-continuous` |
| Source baseline before this package | `182cf52` |
| Latest application runtime | AQL AR11 `abc465d`; other application runtime lineage remains in `docs/VESA_360_RELEASE_READINESS.md` |
| Last complete automated baseline before this package | `accf1c8` — 94/94 commands in 949.6s without retry |
| Storage | This browser profile/device only, plus user-downloaded saved copies |
| Release state | **HOLD — no push, deployment, DNS change or production-data use is authorized** |

## Before testing

1. Use a test browser profile and synthetic/anonymized records only.
2. Download saved copies of any important existing local records. Do not clear browser storage or service-worker data.
3. Close other local servers using port `4173`, or choose another unused port and substitute it in the URL.
4. Do not open the HTML files with `file://`; the applications require a local HTTP origin.

## Open the local website

Open PowerShell and run:

```powershell
Set-Location -LiteralPath 'F:\download temp browser\vesahost-release-work'
py -m http.server 4173 --bind 127.0.0.1
```

Keep that terminal open. In Chrome or Edge, open:

`http://127.0.0.1:4173/login/`

Local demonstration login:

- User ID: `admin@vesa`
- Password: `vesa`

After login, the App Centre is at `http://127.0.0.1:4173/apps/`. Use its TNA, PPM and AQL cards. Direct authenticated routes are `/apps/tna/`, `/apps/ppm/` and `/apps/aql/`.

To stop the local website, return to PowerShell and press `Ctrl+C` once.

## Recording rules

Every human row starts as `NOT TESTED`. Change it only to:

- `PASS`: the stated expected result was personally observed and evidence was recorded.
- `FAIL`: the observed result differs; add a defect ID and preserve screenshots/files.
- `NOT TESTED`: not performed, interrupted, or evidence is insufficient.

Never convert automated evidence into a human `PASS`. Record screenshots by test ID, for example `UAT-AQL-06-combined.png`. Do not place real buyer, employee or production data in Git.

## Test order

1. [Shared UI checklist](04_SHARED_UI_LOCAL_UAT.md)
2. [TNA checklist](01_TNA_LOCAL_UAT.md)
3. [PPM checklist](02_PPM_LOCAL_UAT.md)
4. [AQL checklist](03_AQL_LOCAL_UAT.md), including all AR11 modes
5. [Results and sign-off](05_RESULTS_AND_SIGNOFF.md)

## Local acceptance exit rule

Local UAT may be signed `PASS` only when every mandatory human row is `PASS`, every failure has been resolved and retested, saved-copy recovery is demonstrated, and the exact tested commit is recorded. Production readiness remains `HOLD` until separately authorized and all named external acceptance gaps are resolved or explicitly accepted by the responsible owner.

