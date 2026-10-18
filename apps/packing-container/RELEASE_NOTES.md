# APP-01 Packing & Container 360 — Verified Local Handover (2026-10-16)

## 2026-10-18 G5-02 actual editable-dialog focus — LIVE

New Plan and Edit Carton dialogs focus their first source field; Escape returns to the launching button at mobile 320px. App-only patch `95e6fe110e1fd2c7bda0e13dd5d56bf211b75ccb`, [feature Chromium #39112448733](https://github.com/venkatbangla-boop/vesahost/actions/runs/39112448733), [main Packing #39112515743](https://github.com/venkatbangla-boop/vesahost/actions/runs/39112515743), [Pages #39112515653](https://github.com/venkatbangla-boop/vesahost/actions/runs/39112515653), [public exact bytes #39112515781](https://github.com/venkatbangla-boop/vesahost/actions/runs/39112515781) SUCCESS. Pure CBM/carton/physical-load restrictions, report and portable schema frozen. Next wave audit: [G5 evidence](../../docs/portfolio/26_G5_FORM_QA_WAVE_A.md).

---


## Source and ownership
The approved original `blueprints/APP-01_packing-container.md` (SHA256 `85d1df576bbad7fca869c87f10467b401711147e3d7ac3db888737b23d8230fd`) came from the user-provided 15-app handover ZIP. Code owner `apps/packing-container/index.html` (single editable application HTML), regression owner `apps/packing-container/tests/`, VESA central integration `js/app-catalogue.js`, `js/preferences.js`; shared shell untouched. Stored records are `vesa.packing-container.records.v1.<user>`, version `VESA-PACK360-PLAN-1`; portable file `.vesapack` version `VESA-PACK360-COPY-1`. No network upload.

## Exact verified evidence
- Feature branch `feature/packing-container-360`; code SHA `85134e1161f1c1a2b230ecf1f3722f133ab225d6`, [Actions run #38923195233](https://github.com/venkatbangla-boop/vesahost/actions/runs/38923195233) **SUCCESS**. GitHub runner Node22 / real Chromium; artifact `app01-synthetic-evidence` contains local test images/XLSX/portable saved copy and PDF.
- `node apps/packing-container/tests/domain.test.cjs` synthetic PASS: source/unit/CBM math, carton rounding, solid/mixed/partial, IDs, overship, duplicate/overlap, double-loaded cartons, validated date, absent/invalid container, weights, bad portable import, formula-injection encoding.
- `node apps/packing-container/tests/browser-workflow.cjs` synthetic PASS: login → App Centre route, one shared header, create/edit/save/reload, immutable locally frozen snapshot, named source container and loads, real typed workbook and print PDF, backup restore as copy, corrupted copy atomic rejection, responsive 320/390/768, language EN/BN/HI/TA, no remote requests.
- Sibling regression: TNA G02/G05, PPM P-G00 (168), AQL A-G00 (24) + A-G03 sampling, shared shell baseline PASS. Tests do NOT claim physical container loading or Buyer sign-off.

## Gate verdicts
| Gate | Verdict | Note |
|---|---|---|
| APP-G00–G05 | DEVELOPMENT VERIFIED locally | Source audit; pure math; real UI; copies; typed Excel and PDF |
| APP-G06 | CONDITIONAL | Typed manual reference exists; future Purchase Order 360 approved interchange pending |
| APP-G07 | CONDITIONAL | EN/BN/HI/TA and main viewport sizes pass; native devices, zoom, screen-reader, human UAT pending |
| APP-G08 | DEVELOPMENT VERIFIED for run scope | TNA G02/G05, PPM/AQL and shell regressions; entire full-platform suite not implied |
| APP-G09 | CONDITIONAL | This handover and SHA committed; production/demo publishing neither authorized nor verified |

## Outstanding source dependent decisions
Actual permitted container catalogue, internal/door dimensions/payload source, stacking/pallet/equipment policy, buyer-specific packing ratios, physical trial loading, human app acceptance. Unsupported decisions remain `Needs Information`. No wholesale changes to TNA, PPM, AQL, Costing, DNS or main. Rollback: revert APP-01 changes on feature branch, preserving unaffected existing branch histories.

**NEXT:** APP-02 Order & Commission 360 from the full original `blueprints/APP-02_order-commission.md`; avoid invented commission percentages, basis, income/earned milestones and FX assumptions.
