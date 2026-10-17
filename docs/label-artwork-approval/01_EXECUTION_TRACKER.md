# APP-10 Label & Artwork Approval 360 — Execution Tracker

## 2026-10-17 — M0 original blueprint and actual repository ownership audit

**Baseline and scope:** `main` `a45b476ddf615753d8c4c0d5e6038f450d1c81bf` after verified Factory demo release and original permanent `blueprints/APP-10_label-artwork-approval.md`. This rank-11/W3 app had no `apps/label-artwork-approval/` folder and no `vesa.label-artwork-approval.records.v1` storage key on GitHub. `feature/label-artwork-approval-360` created directly from latest main; never overwrite prior released apps. Read `AGENTS.md`, root `VESA_RESUME_PROMPT.md`, `docs/portfolio/03_CROSS_APP_DATA_OWNERSHIP.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md`, `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`.

**Source-to-owner boundaries:** Tech Pack & Spec owns garment POM, tolerance, grading; Sampling & Approval owns buyer sample decisions and rounds; AQL owns inspection; TNA owns critical path. This app owns only labelled/printed artwork, label specifications, revision/evidence/comments and *locally recorded* source review. No direct sibling browser storage, no automatic Tech Pack/sample approval, no fabricated GS1 allocation, wash care legality or buyer sign-off. All real customer artwork binaries/files remain private browser-local, never in this public repo. Browser login is not server-side secure access.

### File-level impact map and call/state flow

| Directly inspected source or proposed file | Owner, incoming/outgoing state, risk and scope |
|---|---|
| `blueprints/APP-10_label-artwork-approval.md`, `docs/portfolio/*` | Original user-approved requirements and SHA256. **FROZEN** read-only. |
| `apps/tech-pack-spec/index.html` | Existing source of garment specification, label/reference fields; may supply explicit locally reviewed source reference only. **FROZEN**. |
| `apps/sampling-approval/src/domain/sampling-engine.js` | Separate sample round and buyer approval decisions; do not import/mutate. **FROZEN**. |
| `apps/aql/`, `apps/ppm/`, `apps/tna/` | Existing quality, GO/HOLD, critical dates/owner state. **FROZEN**. |
| `js/vesa-workspace-shell.js`, `css/vesa-workspace.css`, `js/auth.js`, `templates/vesa-next-app/*` | Only shared top menu/account and reference examples; **WATCHED**; not M1 app files. |
| `apps/label-artwork-approval/src/domain/artwork-revision.js` | **NEW M1** immutable style/colour/size/placement record, revisions and source provenance. Pure, no DOM. |
| `apps/label-artwork-approval/src/domain/label-spec.js` | **NEW M1** dimensions/units/repeat only when fully sourced; supplied GTIN checksum warnings, never allocate barcode numbers or certify scan. |
| `apps/label-artwork-approval/src/domain/review-state.js` | **NEW M1** revision-specific comments and explicit independent source-reviewed decisions, no automatic buyer/sample approval. |
| `apps/label-artwork-approval/tests/domain.test.cjs` | **NEW M1** deterministic synthetic tests: immutable old revision, new revision invalidates old decision, GTIN bad checksum warning, no automatic effective state. |
| `.github/workflows/label-artwork-approval.yml` | **NEW M1** branch-only source, Node/domain and frozen adjacent sibling regressions. |
| `docs/label-artwork-approval/01_EXECUTION_TRACKER.md` | This durable M0/M1 file-scope, proof, exact SHA/NEXT. |

**Dependency direction:** M2 future shared shell / controller → isolated `ArtworkRevision` + `LabelSpec` + `ReviewState` pure domain → future local saved-copy store + report adapters. No backend or sibling localStorage reads. Existing TNA/PPM/AQL/TechPack/Sampling are separate read-only owners.

**Unresolved (Needs Information):** category-specific buyer reviewer authority, legal wash care/content, actual GS1 licencing, safe file MIME/bytes/retention. M1 will not assume any of these; file previews/attachments and official-effective status remain deferred.

### M0 verdict / M1 single reversible patch

**M0 ownership and narrow M1 file scope: accepted.** Build only three new pure modules + one domain test + one CI + this tracker. Record explicit source for each revision, dimensions as entered unit (no unsourced cross-unit conversion), optional GTIN-8/12/13/14 mod-10 validator reporting **warning** rather than issuing or repairing codes. Status must stay local/source-review-only. Append-only revision and reviewer-evidence audit; new versions never copy old decisions. Limit sizes/counts and reject duplicate IDs.

**Verification:** original 15 blueprints SHA256, syntax and synthetic tests including malformed source/duplicate/version mismatch, buyer-evidence provenance and non-automatic approval, all existing Factory/Production/Shipment/Fabric/Sampling/LC/PO/Packing/Commission/TechPack/TNA/PPM/AQL baseline checks, no shared shell changes. **Rollback:** revert only this M1 feature patch; no main/promote or customer migrations. **Next after independent M1 SUCCESS:** M2 single-shell local CRUD, safe browser-only preview after MIME/size policy review, versioned saved copies, four languages and real Chromium. M3 reports/version comparisons, then M4 release conditional.

**CURRENT GATE:** M0 accepted; M1 not yet verified. **PRECISE NEXT ACTION:** implement M1 domain and prove GitHub CI; do not ask owner to upload the original 15-app ZIP again.
