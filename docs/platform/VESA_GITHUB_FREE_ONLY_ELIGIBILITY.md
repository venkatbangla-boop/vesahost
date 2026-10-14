# VESA 360 — GitHub-Free-only Eligibility Baseline

**Baseline date:** 2026-10-11

**Scope authority:** `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`

**Historical baseline retained:** 55% under the original 13/11/13/10 full-scope gate formula.

## Counting rule

The current view keeps the fixed program weights: TNA 30%, PPM 30%, AQL 30%, Shared UX 10%. Within each app, the denominator contains only gates with an independently testable GitHub-Free/browser-local outcome. A gate earns numerator credit only when that active local outcome is fully `ACCEPTED` in the existing tracker.

Provider-only gates are `DEFERRED_BY_SCOPE`: they are excluded from both numerator and denominator and are never relabeled accepted. Dormant provider-neutral contracts may remain for safety/history but earn no credit. For a mixed gate, the provider component is deferred while the local component remains one active gate unit; its existing `CONDITIONAL`, `BLOCKED`, or `NOT STARTED` status earns zero.

## TNA eligibility — 12 active gates, 9 accepted

| Gate | Free-only disposition | Counted status | Evidence boundary |
|---|---|---|---|
| G00 | ACTIVE | ACCEPTED | Repository/scope audit |
| G01 | ACTIVE | ACCEPTED | Local app registration and shared shell |
| G02 | ACTIVE | ACCEPTED | Local schemas/templates |
| G03 | ACTIVE | ACCEPTED | Browser-local scheduling/CPM |
| G04 | ACTIVE | ACCEPTED | Browser-local operational engines |
| G05 | ACTIVE | ACCEPTED | Local save/reopen/manual saved copy/XLSX |
| G06 | ACTIVE | ACCEPTED | Local workspaces/portfolio/accessibility |
| G07 | ACTIVE | ACCEPTED | Local languages/reports/print/download |
| G08 | ACTIVE | ACCEPTED | Local recovery/scenarios/multiorder planning |
| G09 | DEFERRED_BY_SCOPE | EXCLUDED | Hosted identity/API/database/object storage/remote collaboration; dormant zero-network contracts retained without credit |
| G10 | ACTIVE — LOCAL SLICE ONLY | CONDITIONAL | Manual typed PPM/AQL references and in-app alerts stay active; external delivery is deferred |
| G11 | ACTIVE | CONDITIONAL | Local full-regression/stabilization evidence is incomplete |
| G12 | ACTIVE — LOCAL SLICE ONLY | BLOCKED | Local readiness/limitations/rollback remain active; public commercial deployment is deferred and any production action remains unauthorized |

`TNA free-only = ROUND(100 × 9 / 12) = 75%`.

## PPM eligibility — 10 active gates, 9 accepted

| Gate | Free-only disposition | Counted status | Evidence boundary |
|---|---|---|---|
| P-G00 | ACTIVE | ACCEPTED | 168-checkpoint and saved-copy baseline |
| P-G01 | ACTIVE | ACCEPTED | Shared shell |
| P-G02 | ACTIVE | ACCEPTED | Local home/menu/navigation |
| P-G03 | ACTIVE | ACCEPTED | Checkpoint/applicability workflow |
| P-G04 | ACTIVE | ACCEPTED | Local approvals/measurements/revisions/decisions |
| P-G05 | ACTIVE | ACCEPTED | Local actions/minutes/evidence/amendments |
| P-G06 | ACTIVE | ACCEPTED | Local save/recovery/offline/update |
| P-G07 | ACTIVE | ACCEPTED | Local reports/languages/accessibility |
| P-G08 | ACTIVE | ACCEPTED | Manual typed TNA/AQL references |
| P-G09 | DEFERRED_BY_SCOPE | EXCLUDED | Hosted identity/API/database/audit/remote collaboration; dormant zero-network contracts retained without credit |
| P-G10 | ACTIVE — LOCAL SLICE ONLY | CONDITIONAL / LOCAL HANDOFF PROVEN | Feature ledger, full cross-app matrix, responsive/report evidence, saved-record posture, backup/rollback and HOLD are complete locally; independent physical/assistive review remains external and production authorization/deployment is outside current execution scope |

`PPM free-only = ROUND(100 × 9 / 10) = 90%`.

## AQL eligibility — 12 active gates, 9 accepted

| Gate | Free-only disposition | Counted status | Evidence boundary |
|---|---|---|---|
| A-G00 | ACTIVE | ACCEPTED | Frozen numerical/portable baseline |
| A-G01 | ACTIVE | ACCEPTED | Shared shell |
| A-G02 | ACTIVE | ACCEPTED | Local workflow parity |
| A-G03 | ACTIVE | CONDITIONAL | Sampling provenance is partial; approved carton-randomization policy remains missing and must not be invented |
| A-G04 | ACTIVE | ACCEPTED | All locally implementable stage/register, decision, evidence-binding, traceability and reopen requirements pass; buyer/legal authority, approved randomization and physical field evidence remain separate external inputs |
| A-G05 | ACTIVE | ACCEPTED | Local pre-final/final, immutable rework/reinspection, owned loading evidence, quantity/seal/handover records, packing guards, typed barcode and supplier-failure boundaries pass; AR11 policy and physical scanner/custody/factory acceptance remain external |
| A-G06 | ACTIVE | ACCEPTED | Local measurement/report/reopen, finding/carton/lot-owned evidence restore, immutable CAPA/source chain, 600-record accessible analytics and bounded large-file/long-output evidence pass; physical capture/device/factory acceptance is external |
| A-G07 | ACTIVE | ACCEPTED | Current/legacy restore, atomic project/master/sync rejection, real 200/280 MiB boundaries, quota rescue/restart and failed-install/old-tab/offline worker lifecycle pass locally; physical/native-device field acceptance is external |
| A-G08 | ACTIVE | CONDITIONAL | Four-language authored report chrome, five-page A4 rendering and share fallback pass locally; AR11 approved randomization policy and physical/device/printer/screen-reader/factory/buyer acceptance remain incomplete |
| A-G09 | ACTIVE — LOCAL SLICE ONLY | ACCEPTED | Explicit local PPM/TNA record IDs, versions, dates, status/milestone and verifier provenance pass visible save/reopen/removal without changing AQL decisions/dates or reading sibling storage; server lookup/tenant/two-account verification is deferred |
| A-G10 | DEFERRED_BY_SCOPE | EXCLUDED | Hosted roles/authorization/API/database/remote collaboration |
| A-G11 | ACTIVE | ACCEPTED | Clean `f5095b6` expanded matrix passes 91/91 commands across code/data/browser/visual/offline/sibling/shared boundaries |
| A-G12 | ACTIVE — LOCAL SLICE ONLY | BLOCKED | Local readiness/limitations/rollback remain active; public production authorization/deployment is outside current execution scope |

`AQL free-only = ROUND(100 × 9 / 12) = 75%`.

## Shared UX eligibility — 10 active gates, 10 accepted

All U-G00 through U-G09 outcomes are browser-local and remain active. The 2026-10-12 rendered audit reopened U-G01 as `CONDITIONAL`; the subsequent shared runtime and TNA/PPM/AQL adapter sequence (`d64b32a`, `74657a8`, `800d074`, `a907fc7`) removed the stacked authenticated/app chrome and proved exact one-shell ownership across all three applications. Commit `082493d` then moved App Centre/Admin onto the same shell, retained Login's single logged-out brand treatment, proved catalogue cards and responsive behavior at seven widths plus 200% scale, and made that platform-page matrix a mandatory full-regression command. Commit `c3da3b0` connects all five approved appearance palettes to one semantic typography/colour/background/spacing/gutter/card/control system, with all-theme contrast and rendered light/dark proof. Commit `94414c2` adds and proves the shared first-focus skip path, dynamic visible-main targeting, current/save semantics, reduced-motion behavior and exact root/PPM/AQL offline shell assets across six routes at 390/1280. Commit `87f1e2a` completes the final uniform transition review across Login/App Centre/Admin/TNA/PPM Editor/AQL Inspection at 390/768/1280 and repairs hard-clipped long mobile identities. All ten U-G00–U-G09 units are accepted locally. Physical screen-reader/device/factory and production acceptance are not inferred from the browser/DOM proof.

`Shared free-only = ROUND(100 × 10 / 10) = 100%`.

## Weighted result

```text
ROUND(
  30 × 9/12 +
  30 × 9/10 +
  30 × 9/12 +
  10 × 10/10
) = ROUND(82) = 82%
```

**FREE-ONLY VERIFIED: 82%**

**FREE-ONLY REMAINING: 18%**

This 82% is a scope-normalized checkpoint score, not elapsed effort, production readiness, secure-hosting approval, or proof that deferred features exist. The original 2026-10-11 baseline was 60%; dated reassessments through 2026-10-13 add the accepted shared gates, and the 2026-10-14 reassessment adds A-G04/A-G05/A-G06/A-G07/A-G09/A-G11 only after their current local contracts passed focused evidence checks and the clean expanded 91-command gate-boundary matrix. Historical values remain recorded in their dated tracker entries.
