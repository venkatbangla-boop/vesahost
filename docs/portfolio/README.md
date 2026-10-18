# VESA 360 — Permanent 15-App Blueprint Library

**Source of truth:** `venkatbangla-boop/vesahost`, not an old chat attachment, cached progress percentage or an individual VS Code session.

This directory preserves the **original handover text, unedited**, from the user-provided 15-App Master Roadmap package. The 15 exact technical specifications live in the repository-root [`blueprints/`](../../blueprints/) folder so every new Work/Codex session can open its next app directly.

**Latest implementation proof:** [28_G5_FORM_QA_WAVE_C.md](28_G5_FORM_QA_WAVE_C.md) — Buyer CRM, Supplier, Claims and Product Development active-form Node/Chromium QA PASS. All 15 portfolio apps have initial G5 active-form coverage, but final TNA/PPM/AQL core and human/native-device UAT remain. **NEXT G5-17 TNA critical path and real editable screen audit**. Earlier: [27 G5 Wave B](27_G5_FORM_QA_WAVE_B.md), [26 G5 Wave A](26_G5_FORM_QA_WAVE_A.md).

## Reliable lookup for every new session

1. Confirm real `main` and feature HEADs, latest CI and `VESA_PROGRESS.md`. The newest verified NEXT ACTION controls which app to work on; historical next actions do not.
2. Read `AGENTS.md`, `VESA_RESUME_PROMPT.md`, `docs/platform/VESA_UNIFIED_UI_CONTRACT.md` and `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`.
3. Run `node tests/vesa-blueprint-integrity.cjs`. This validates the original document SHA-256 hashes, all 15 blueprints, and the downloadable repository ZIP.
4. Read the named source file. For the active G5-17 TNA: read `apps/tna/`, its original approved source, frozen baselines and `apps/tna/tests/g01...g16`. Read this folder's `01_MASTER_PORTFOLIO_ROADMAP.md`, `02_PLATFORM_STRUCTURE_CONTRACT.md`, `03_CROSS_APP_DATA_OWNERSHIP.md`, `04_WAVES_DEPENDENCIES_AND_RELEASE.md` and `05_TEST_AND_ACCEPTANCE_STANDARD.md` as needed.
5. Resume the *existing* feature and last verified patch group; preserve prior accepted apps, keep tests and evidence truthful, advance automatically when verified.

**Fallback when a file is unexpectedly missing:** `git fetch origin`, then `git show origin/main:blueprints/APP-01_packing-container.md`, and `git log --all -- blueprints/APP-01_packing-container.md`. Search known GitHub branches/commits before treating it as lost. A separate original ZIP and individually indexed copy also live in personal ChatGPT Library folder `/VESA_360_Approved_Master_Handover/`. Library access may depend on the connected account; this public repository is the primary source. Only request a reupload when repository history and authorized backups have actually failed.

## Provenance and file integrity

- Original received ZIP SHA-256: `8daef867196c6fd423f63b01c796e52a3c8a2fdb52346a4bbefd6e24beae3c8e` (the earlier handover and newly reattached ZIP have identical hashes).
- Original integrity manifest: `13_FILE_INTEGRITY_SHA256.json`; **28 original files** are enumerated, and this manifest itself is the 29th original text file.
- Repo source files: 14 under `docs/portfolio/` (including the manifest), 15 under `blueprints/`.
- `VESA_360_15_APP_MASTER_ROADMAP_REPOSITORY_COPY.zip` is a **newly repacked, uncompressed ZIP** made from the exact verified original source texts, to make a GitHub-hosted download available. **Its binary SHA-256 is not the SHA-256 of the originally uploaded compressed ZIP.** CI verifies each of the 29 unpacked files against its canonical source plus checksum / CRC. The actual original compressed ZIP is preserved separately in private Library.
- `tests/vesa-blueprint-integrity.cjs` and `.github/workflows/vesa-blueprint-integrity.yml` reject missing/changed sources before further acceptance. Original blueprints and manifest are **frozen documents**; add implementation notes outside these files.

## Approval and privacy boundary

Original source blueprints are technical plans, not claims that every app is complete. Never add real buyer PO, factory documents, personal contact information, private prices, signatures, banking details, or credentials to this public GitHub repository or test fixtures. Published GitHub Pages demos remain synthetic, personal and non-commercial. Do not let the new portfolio docs override frozen TNA/PPM/AQL business decisions or the current GitHub Free hosting scope.
