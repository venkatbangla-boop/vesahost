# PPM 5 implementation contract

Baseline: f7a3d77 (V4.1.1), directly inspected apps/ppm/index.html, root service-worker.js, manifest.webmanifest, CNAME and deployment history. No AGENTS.md found. User authorized the combined V4/V5 implementation and GitHub deployment, excluding login.

## Audit and scope — accepted for implementation

The existing index owns schema, domain rules, IndexedDB persistence, controller, rendering and printing. Risks found: finalized state bypasses autosave; import trusts nested values and image URLs; demo persists as production; repeated rendering leaks signature/window listeners and observers; reset actions breaks ACTION linkage; report generation runs on every edit; root worker caches app navigations indefinitely.

Exact implementation scope: apps/ppm/index.html, core.js, workspace.js, record-services.js, report-service.js, languages.js, workspace.css, service-worker.js, manifest.webmanifest; vendor/pdf-lib.min.js and license; fonts/bengali.ttf, devanagari.ttf, tamil.ttf and OFL.txt; tests/regression.cjs; this report. Root service-worker.js receives only cache ownership and PPM navigation isolation changes. Marketing HTML/CSS/JS, domain/CNAME and login remain frozen.

## Structure and ownership

Browser frontend, event-driven stateful modular monolith. Domain-first within apps/ppm; no extra child folders beyond fonts, vendor and tests. Files use kebab-case, classes PascalCase. Existing classes remain in core.js; portable validation/history in record-services.js; canvas report pagination/PDF in report-service.js; sentence dictionaries in languages.js; V5Workspace extends the existing controller in workspace.js. UI calls controller, then domain rules and repository adapters. Domain rules never call UI. Static schema stays immutable; per-record custom sections are composed by RelevanceEngine. One active record, bounded undo history and ten recovery points. Serialized writes capture immutable snapshots. Demo never writes records. Changing records clears undo history and releases signature listeners. No backend, central feedback collector or cloud sync is implied.

## Patch groups and proof

1. Extract existing script; add strict import boundary, lifecycle fixes and record persistence/history. Verify legacy migration, malicious inputs, finalized lock, recovery and save failure.
2. Add home/menu, demo isolation, custom checkpoints, touch actions and sentence-only translation. Verify all master IDs have bn/hi/ta translations; preserve metadata and status codes.
3. Add bounded paginated reports, native sharing with download fallback, local feedback and app-scoped offline worker. Verify all report modes, multilingual PDF glyphs, offline load and old worker migration.
4. Run browser regression on desktop/mobile, inspect generated PDF and screenshots; deploy the exact tested commit and verify live version. Gate remains conditional until results are recorded.

Rollback: revert the release commit without deleting browser storage. V4 backups remain accepted; unknown future versions fail closed. Vendor dependencies remain local and licensed. No destructive migration of existing records.


## Verification evidence (2026-10-07)

Automated Chromium browser tests cover startup without phantom drafts, autosave/reload, all 168 master checkpoint translations in Bengali/Hindi/Tamil, preservation of user metadata, custom checkpoint counts and actions, undo/redo, finalized lock persistence, demo isolation, clean profile copies, malicious IDs/statuses/images/version rejection, legacy V4 import, invalid-import atomicity, durable recovery, section reset/undo, image/evidence/signature round-trip, PDF generation/download, CSV formula injection, cross-tab overwrite conflict, quota failure preventing navigation, mobile width and offline reload. Browser uncaught-error collection is empty on the passing run. Full/summary/checklist/action/evidence modes were exercised; the filled Bengali full report is 18 pages, dynamically paginated. Bengali, Hindi and Tamil PDF page renders were visually inspected. PDF image content is high-resolution raster and is not text searchable.

Baseline schema comparison: all 168 master checkpoint definitions and all garment profiles exactly match f7a3d77. Required intentional changes: signatures must include names/dates; Conditional GO requires written conditions and no pending decisions; finalize persists its lock. Import restores into a separate ID. User-defined text remains in the language entered. Static section/field labels and status codes stay English, as requested. New controllers and boundary services have ownership/lifecycle documentation; narrow utility functions and browser entry points remain outside classes.

Scope check: marketing application assets and CNAME unchanged; root worker only changes its cache name, restricts cache cleanup to marketing caches and delegates PPM requests. The PPM worker caches a coherent local bundle and waits for old clients to close before updating. PDF-lib and Noto fonts are bundled with licenses. Tests use only synthetic data.

Automated proof verdict: accepted for tested Chromium desktop/mobile-emulation workflows. Physical Android/iOS native share sheet behavior is browser/OS dependent and was not device-tested; an explicit download/manual-attachment fallback is available. Feedback is saved locally and downloaded at the user's request; there is no central collector, login or cloud sync. Those services are not represented as implemented. Revert the release commit to roll back code; do not clear IndexedDB.
