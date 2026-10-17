# TNA 360 — G17 Personal-Demo Publication / Human Acceptance Gate

**Recorded:** 2026-10-17. **Status:** `PUBLIC RELEASE HOLD / TECHNICAL BRANCH DEMO ONLY`. This file is release evidence and scope control, not a request to publish, a human signature or a Pages compliance certification.

## Source of truth and accepted automated tests

- Repository `venkatbangla-boop/vesahost`. Development `feature/tna-merchandising-sheet`; last independently accepted technical source `0cebc1e1687fc4bd8e36537faa89521e24ef5b5b`, [G16 real disconnected Chromium and TNA/PPM/AQL CI #39050718169 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39050718169), [XLSX/PDF/offline browser artifact 12107801523](https://github.com/venkatbangla-boop/vesahost/actions/runs/39050718169/artifacts/12107801523).
- Prior technical releases within **feature only**: G13/M1 garment sheet / task and four-language headings; G14/M2 human-sourced separate baseline/current/forecast revisions and immutable confirmed baseline; G15/M3 real 4-sheet XLSX, formula-safety, isolated real Chromium print/PDF; G16/M4 offline reload with independent scoped worker, offline Excel, Save/Open, preserved old-app caches.
- `main` was `dae3aa42b5f24adc7805c7a67090e20916672dab` when the release audit began and is the current LIVE baseline until explicitly verified otherwise. Public `https://vesaent.com/apps/tna/` must **NOT** be described as already serving this feature branch.
- G17: finish four-language source-backed planning-date dialog, actual Chromium EN/BN/HI/TA, cache-busted version and offline regression. G17 status is `NOT ACCEPTED` before its own exact-sha CI success.
- The original 15 personal-demo portfolio apps and PPM/AQL domain/state/test contracts stay frozen. No existing browser records, server-backed identities or schemas are migrated or deleted.

## GitHub Pages eligibility and data policy

Authoritative published GitHub documents:
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features

GitHub Pages is primarily a public static showcase host, and its terms **do not allow** using Pages free hosting to run an online business, commercial transactions or commercial SaaS. It also should not host sensitive transactions. Personal noncommercial synthetic project showcases can be appropriate, but **this corporate-domain context does not automatically prove eligibility**. Product code being static, offline-capable, or in a public GitHub repository is insufficient. No Pages deployment of the TNA rework until its specific intended use is confirmed to be demonstrably noncommercial; seek GitHub Support guidance if the corporate use remains ambiguous. No real buyer/factory artwork, PO, bank LC, contact details, proprietary cost or photos, or production log should be committed to Pages or treated as permitted application data. Current browser-visible login is NOT secure server-side authentication and must not be represented otherwise.

## Human UAT and independent approval

`docs/uat/00_READ_ME_FIRST.md`, `01_TNA_LOCAL_UAT.md`, `05_RESULTS_AND_SIGNOFF.md` are the frozen human evidence source. Last verified 49 human rows = **1 PASS / 0 FAIL / 48 NOT TESTED**. Every TNA human row, **UAT-TNA-01..12, remains NOT TESTED**. Actual named tester, browser/device/reader, exact source commit, screenshot or reproducible output, any failures, and sign-off are mandatory. A synthetic Chromium artifact does not substitute for buyer/factory acceptance, local merchandise user feedback or real Excel desktop reader output.

Focused UAT risk: Can a Bangladesh knit/woven merchandiser find Buyer/Factory/Style/PO/LC/approvals/cutting/sewing/shipment and maintain source-backed dates in the new sheet without confusion? Can a human open saved copies, use all 4 languages, print 100+ rows without clipped data, understand that factory/LC/buyer decisions are **not** automated, and use a real mobile? This needs user confirmation, not a lab-only inferred PASS.

## Exact future publication decision gate (all required, sequential)

1. **Technical CI:** independent G17 exact head source Node/real Chromium/legacy sibling tests `SUCCESS`, no scope drift, genuine offline after reload, actual 4-sheet XLSX, print PDF and zero page errors.
2. **Human workflow UAT:** approved tester conducts UAT-TNA-01..12 with concrete proof, or explicitly documents which original app defects are open. Do not convert NOT TESTED to PASS without evidence.
3. **Hosting suitability:** confirm the entire requested use is personal noncommercial showcase only and eligible under GitHub's official Pages terms; otherwise keep commercial deployment on hold and use a separately authorized host (not assumed available).
4. **Release integration:** only after gates 1–3, compare exact `main` to accepted feature SHA; do not force-push. Build/test minimal merge without rebuilding sibling apps or changing original blueprints.
5. **Public proof:** require GitHub Pages successful deployment + byte-for-byte published HTML, versioned domain/controller/presenter/CSS, app-scoped worker, offline-registration and previous 15 live demo files, App Centre/shared scripts/old root cache. Verify personal-synthetic disclaimer and no real order data. A `LIVE` claim is prohibited until these independently pass.
6. **After release:** update `VESA_PROGRESS.md`, `VESA_RESUME_PROMPT.md`, G17 tracker, deployed SHA, exact CI and smoke links, exclusions and NEXT ACTION. Keep production approval `HOLD` unless new permissions/evidence exist.

**Current explicit verdict:** `NOT READY TO PUBLISH`, even when M1–M4 automatic tests pass. This is an evidence gate, not permission to restart TNA or block unrelated locally scoped defect fixes.

**Rollback:** preserve currently published TNA main asset versions and original service worker until a separate verified release; if a future public personal-demo release fails, revert its exact TNA-only integration/source cache registration without deleting PPM/AQL caches or user local records.
