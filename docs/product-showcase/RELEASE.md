# Product showcase — integration and release record

## Objective and authorization
The owner approved the concrete homepage insertion, separate menu page and category popup with “Proceed live” on 2026-11-27. This narrowly authorizes the public homepage insertion discussed in this session; the older prohibition on changing the homepage during VESA 360 application redesign remains applicable to unrelated work.

## Baseline and audit verdict
- Repository: venkatbangla-boop/vesahost, main `9d5e9610d7176a557b0250e0a08eeb1c9f67824e`.
- Independent read-only integration audit: accepted for bounded implementation.
- Directly inspected: root AGENTS.md, index.html, css/style.css, js/main.js, service-worker.js, public intro assets, unified page and GitHub Free scope contracts; the reviewed Product Focus source and immutable 91-item catalogue.
- Existing Pages deployment was successful. Historical unrelated application QA failures are not acceptance evidence for this feature.

## Locked patch scope
Existing files: `index.html` (one menu link, one section after portfolio, category anchor wrappers, isolated host assets/dialog) and `service-worker.js` (cache version only).

New runtime files: `product-showcase/index.html`, `styles.css`, `catalogue.js`, `catalogue.json`, `director.js`, `garment-details.js`, `experience.js`, `bootstrap.js`, `host.css`, `host.js`, and `assets/<catalogue-id>.webp` for exactly M01–M34, L01–L29, K01–K28.

New verification files: `tests/product-showcase.test.cjs`, `tests/product-showcase-assets.py`, this release record, and feature-owned evidence under `docs/product-showcase/` if needed. Browser-only preview wrappers stay outside the repository.

Frozen: existing root stylesheet/main script; intro and all original images/videos; all apps/login/admin/auth/preferences/workspace code; contact/legal/SEO text; CNAME/DNS; workflows; original blueprints and application records.

## Ownership and structure contract
This is a static, event-driven public frontend. Feature-first folder ownership and kebab-case files follow the existing plain-JavaScript project. No server, purchase, account change, new hosting provider or data storage is required.

| Owner | File | State / dependencies / boundary |
| --- | --- | --- |
| GarmentCatalogue, CarouselState | catalogue.js | Immutable catalogue; selection only; no DOM or host state |
| SceneDirector | director.js | Three model layers, decode race tokens and short transforms; no catalogue mutations |
| GarmentDetails | garment-details.js | One main-model alpha mask and garment annotation; preserve reviewed mapping |
| MotionExperience | experience.js | Local controls, selection, user play preference, hover/focus/visibility holds; no global homepage handlers |
| ShowcaseBootstrap | bootstrap.js | Same-origin data loading, URL entry selection, embed messages, height reporting and cleanup |
| ShowcaseHost | host.js | Lazy inline frame, parent-owned modal, category routing, focus/scroll return and trusted message validation |
| Styles | styles.css / host.css | Frame-local viewer geometry / strictly feature-scoped parent placement |

Call flow: homepage category or expand action → ShowcaseHost → selected iframe route → ShowcaseBootstrap → MotionExperience → CarouselState, SceneDirector and GarmentDetails. Frame messages are accepted only from the expected same-origin window; no arbitrary URL/navigation or cross-frame state access. The parent owns the full-page dialog. The inline viewer is suspended while that dialog is open. Source records and image bytes remain unchanged; only embedded data URLs are externalized into exact WebP files.

## Compatibility gates
1. Source/asset parity: 91 unique IDs, groups 34/29/12/12/4, all WebP hashes identical to reviewed originals, real alpha and decoding.
2. Homepage preservation: removing the explicitly marked insertion and link wrappers recreates the baseline. All frozen tracked files remain byte-identical.
3. Functional: direct category URLs, next/previous/wrap, side-model selection, main-only details, all filters/search, pause/hover/keyboard holds, reduced motion and loading failures.
4. Integration: scroll-visible section, dedicated route, popup close/Escape/focus/scroll return, same-origin message guards, native link fallback and untouched intro.
5. Browser geometry: representative 320/360/390 mobile and tablet/desktop frames; header particularly 981–1180px; long garment titles; no horizontal overflow.
6. Independent verifier acceptance before publication. Feature branch, guarded non-force main update, exact-SHA Pages success and public served-byte/browser verification afterward.

## Cache and rollback
Bump the root cache version without changing its asset list, fetch policy or application exclusions. Do not preload all model images during service-worker installation. Returning clients receive the update through the service-worker lifecycle; an already-open page can require a reload.

Rollback: revert this bounded release and publish a newer cache identifier, preserving intervening changes. Never force-push main, clear user records or restore an obsolete cache name.

## Current gate
Prepublication source and browser gates: **accepted**. This record describes the tested release candidate; publication is verified separately against the exact GitHub Pages commit after the guarded main update.

Independent source verification passed after the BFCache fix, stale-image readiness fix and compact menu-label correction. Commands: `node tests/product-showcase.test.cjs`, `python tests/product-showcase-assets.py`, `node tests/vesa-blueprint-integrity.cjs`, `git diff --check`.

Real Chromium browser review covered desktop side-model selection, top details, expansion with current selection, category-specific L29/K25 popups, catalogue search, nested Escape behavior, standalone navigation and browser return. Responsive browsing-context checks covered 320/360/390px viewers, a390px homepage/menu/popup,768px tablet and981/1024/1100/1101/1180px headers. Closing the mobile popup returns focus and releases scroll. Header overlap found at981px was fixed by shortening only the new link at981–1100px; original navigation styling stays intact.

Evidence is in `evidence/`: source/asset/browser verification JSON, desktop/mobile/tablet screenshots and header geometry. These screenshots show the tested local release candidate, not a claim that the public deployment has already completed.

Material limits: representative AI-generated garment visuals, not verified inventory photography; existing source resolutions retained. Original alpha-aware top/bottom hit bands are preserved. CSS-sized browser checks are not certification on physical phones or every browser; no unmeasured FPS/performance claim is made. Historical unrelated business-application CI/human UAT remains outside this release.
