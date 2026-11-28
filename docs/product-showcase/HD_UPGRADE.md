# VESA showcase HD zoom release candidate

Baseline: ad73eccf57c281d6c9a0595bc01d1c2f1c95502c. User approved publication after verification and accepted the separate 20 fallback upscales. Preserve all original 121 catalogue records and WebPs, all original homepage/intro and apps, and the existing zoom interaction.

## Bounded patch
- product-showcase/hd-assets: exactly M01-M34, L01-L29, K01-K28, each a source-limited alpha-aware Lanczos 2x/3x upscale, lossless WebP. Native K29-K58 retained. No model or garment regeneration. A canonical digest of the 91 decoded visible RGBA images was independently computed from the approved ZIP: 28fe6451b378f3cf2a7d3f2a1d554807bd319ab5d686cbcec9ac2a6ce5106a77. Fully transparent RGB is normalized; encoder byte differences are not visible-pixel changes.
- ProductZoom owns on-demand HD loading and a single exact-original fallback on failure. No new storage, network origin, layout, selection or gesture state. Viewer HTML changes the zoom script cache key only. Root service worker changes its cache identity only; no fetch policy, app exclusions or precache changes.
- Original asset test retains the exact original digest; add an independent HD pixel digest test. Scope verifier adds only exact HD paths and named files. Existing desktop/mobile/homepage browser tests extend HD route, decode, native asset, fallback, full 4x and lazy-load proof.

The GitHub staging workflow is temporary and must not enter the release tree. It creates a candidate commit with the baseline as its sole parent and checks source, original and HD assets, real desktop/mobile/iframe flows. Non-force publication is allowed only after that exact candidate passes and the main head is rechecked. Revert the single bounded commit and advance cache identity on rollback. After publication independently verify Pages deployment and served bytes; no live claim in advance.

Upscaling does not restore unknown fabric detail. Touch emulation is not physical Android signoff. The historical 20 earlier HD archive payloads were inaccessible; their originals remain intact.
