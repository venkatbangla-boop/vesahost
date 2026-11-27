# Product showcase: approved category navigation and 30-image expansion

## Objective and authorization

The owner approved the reviewed top category navigation and exactly 30 proposed
images, then explicitly requested publication: “Approved and proceed with balance
images make and put in live all”. This is a single website feature release, not a
VESA application redesign. No further conversational publication gate is needed.

## Accepted baseline

- Repository: `venkatbangla-boop/vesahost`.
- Fetched `origin/main`: `0bcb37bf722eab4ce03d7560a7b693aa21468f74`.
- Worktree was clean before this patch.
- The previously reviewed standalone proposal has 91 unchanged catalogue assets.
- The approved additions are K29–K38 Boys, K39–K48 Girls, K49–K58 Baby.
- Resulting group counts: Men 34, Ladies 29, Boys 22, Girls 22, Baby 14; total 121.
- Existing first-visit intro behavior, applications, language settings, storage,
  company content, branding and layout outside this feature remain frozen.

## Direct audit and exact file impact

| File | Owner and state | Change / boundary |
|---|---|---|
| `product-showcase/catalogue.js` | Immutable catalogue, pure carousel index | Accept exact 121-item coverage; adopt approved mixed All presentation; retain canonical individual group order. |
| `product-showcase/catalogue.json` | Reviewed item/asset metadata | Append 30 new records; keep all original 91 records identical. |
| `product-showcase/category-navigation.js` | New CategoryNavigation; open group, hover timer, focus, selection notifications | Adopt reviewed disclosure owner; explicitly map every new product to a garment family. |
| `product-showcase/experience.js` | Existing MotionExperience; selection and playback holds | Adopt reviewed nav integration; this owner remains the only selection/playback authority. |
| `product-showcase/index.html` | Viewer-local markup and versioned dependency order | Move the single category nav above stage, add chevrons/flyout, remove review-only banner, keep all existing detail hooks. |
| `product-showcase/styles.css` | Viewer-local geometry | Adopt approved menu styling; preserve intrinsic inline-frame height and mobile scrolling. Product/native portrait display may use explicit frame metadata without editing source pixels. |
| `product-showcase/bootstrap.js` | Manifest fetch, routes, parent messages | Version manifest; validate 121 records; retain nested-menu Escape; do not ship portable-review embedded-data adapters. |
| `product-showcase/host.js` | Homepage iframe/modal bridge | Extend validated K IDs through K58 only. Origin/source checks, scroll/focus restoration, intro inert protection unchanged. |
| `product-showcase/garment-details.js` | Inspection zones and alpha mask | Append reviewed annotations for new images; support explicit product-only/full-outfit metadata. Existing 91 annotations and hit/label behavior stay unchanged. |
| `product-showcase/director.js` | Image decode, stage, existing transitions | Correct product-only alternative text and native portrait framing if required by generated canvases; no animation or selection rewrite. |
| `product-showcase/assets/K29.webp` through `K58.webp` | Generated garment visuals | Thirty individually generated images; native transparency retained. No composite sheets; underwear/nappy cover/sleep bag are unworn single-product visuals. |
| `index.html` | Existing public homepage | Only change its existing category-example counter 91 to 121 and the version of the existing showcase host script. No new homepage layout/content changes. |
| `service-worker.js` | Existing cache lifecycle | Advance cache identity only; preserve policy, intro cache request and all application exclusions. |
| `tests/product-showcase.test.cjs` | Independent bounded Node verification | Extend counts/routes; distinguish approved expansion from frozen original source; preserve existing boundary/interaction scenarios. |
| `tests/product-showcase-assets.py` | Read-only asset verification | Verify all 121 unique images; retain the immutable reconstruction hash for the original91; check native alpha and dimensions for additions. |
| `tests/product-showcase-category.test.cjs` | Independent disclosure verification | Verify complete family coverage, hover/no selection, keyboard/close behavior and playback isolation. |
| `docs/product-showcase/CATEGORY_RANGE_EXPANSION.md` and `docs/product-showcase/kids-expansion/` | Evidence, image provenance, approved plan and checkpoints | Durable implementation, quality, independent acceptance and release evidence; no customer data or credentials. |

## Dependency and state flow

Native JSON/individual WebPs → immutable GarmentCatalogue → CategoryNavigation
(browsing only) → MotionExperience (selection/playback) → SceneDirector and
GarmentDetails. ShowcaseBootstrap alone bridges routes/messages; ShowcaseHost
alone controls parent dialog, inline visibility and restored focus/scroll.
No provider, dependency, authentication or persistent browser-state expansion.

## Risks found and bounded handling

1. The old host rejects K29 onward; both host and child coverage must advance.
2. The old detail map throws for unknown IDs; every new asset needs a verified
   garment annotation before it becomes selectable.
3. The reviewed local CSS used viewport height; the live inline frame must retain
   intrinsic height to avoid a resize-feedback loop.
4. Cached HTML/manifests can expose different catalogue sizes. Advance the same
   feature dependency version and service-worker cache identity together.
5. New native PNGs contain transparent padding and some have maximum alpha254;
   preserve alpha rather than fabricating opacity. Verify actual website display.
6. Historical release tests freeze an earlier patch. Update the current showcase
   acceptance boundary explicitly, and separately re-run the unchanged intro
   behavior scenarios plus original intro source hashes.

## Patch group and verification

One group: approved category-navigation and 30-asset range expansion. Before main
promotion: all30 images visually reviewed; asset/count/route/annotation/menu source
checks; unchanged91 reconstruction; frozen baseline files; original intro gate and
controller hashes/behavior; desktop and 320/390px mobile browser checks; homepage
inline and popup interactions. Another agent reviews source independently of the
implementer. Verify the actual Pages deployment and served catalogue/assets after
publication; a push alone is not a live-success claim.

## Rollback

Revert this single feature commit on main through an ordinary non-force commit.
Retain all previous intro and application work. No data migration or browser
storage clearing is involved.

## Gate status

- Audit: **accepted**; actual target files and their tested baseline were read.
- Scope/authorization: **accepted**; limited to the exact paths above.
- Implementation: **accepted**;30 native assets,121 catalogue records and complete category/annotation coverage.
- Independent source/asset/browser proof: **accepted**; see `kids-expansion/` evidence. Root independently reviewed the agent-authored test additions.
- Publication: **authorized and ready**; final main promotion and actual Pages/live verification follow this commit.

## Final pre-publication evidence

- All30 individual native1024×1536 assets passed generator and independent visual
  review. WebP encoding preserved every alpha value exactly; no source pixel edits,
  crops or resizing. Four unworn product images are explicitly labelled.
- All121 catalogue assets are unique and decode with alpha; the original91
  metadata/image reconstruction digest remains unchanged. New30 WebPs total
  4,282,092bytes; the121 assets total7,596,050bytes. Only active/neighbor images are
  decoded for the stage, not the full collection on startup.
- The three targeted gates pass. They cover all121 annotation updates and item
  selections, pure navigation and search, menu lifecycle/playback isolation,
  parent/child origin guards, popup restoration and the unchanged intro behavior.
- Final browser proof confirms desktop/model/product framing,320/390px layouts,
  hover/tap menu selection, stable homepage inline height, popup K58 routing,
  nested Escape and close/focus restoration. These are browser observations,
  not a claim of physical-device or all-engine certification.
- The preview exposed duplicated Product/Product copy on unworn views. It is
  corrected to Product/Unworn view. Final dependency version20261127-4 and cache
  identityvesa-v125-showcase-121 prevent the intermediate preview bytes from being
  reused. No service-worker routing or storage policy changed.
- Existing repository-wide app workflows already include failures at baseline
  0bcb37b; this feature does not modify those applications or claim their suite
  passes. The baseline Pages deployment succeeded. The new Pages run must be
  checked independently after promotion.
