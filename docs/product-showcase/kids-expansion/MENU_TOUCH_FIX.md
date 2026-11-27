# Product menu touch selection repair

## Objective and accepted baseline

Repair the owner's reported Android tap failure in the published product showcase.
The category disclosure opens, but selecting Baby Short or Baby Dress can close
the menu without changing the product, after which autoplay continues.

Baseline: `ac18bcfb532658cc739bba24194a4978ecb29d14` on `main`, verified by fetch.
The repository is clean at the start. The owner previously authorized completing
and publishing this showcase; this repair remains inside that approved feature.

## Audit evidence and cause

The actual category navigation, controller, scene director, bootstrap, viewer
markup, cache owner and existing category/release tests were directly inspected.
The governing root instructions, shared page contract and free-only scope remain
in force. Existing static GitHub Pages hosting and feature ownership are retained.

`CategoryNavigation.start()` schedules its `focusout` decision in a microtask,
ignores the next focus target, and checks `document.activeElement` while native
focus transfer may still be in progress. Touch pointer exit leaves
`pointerInside=false`; a transient outside active element then closes the menu.
The following delegated item click is rejected because the disclosure is closed.
The close notification releases the autoplay hold. An independent fixture run
reproduced zero selection callbacks for an internal transfer to K28.

The existing desktop browser selects K28 correctly. Earlier mobile-width tests
did not model the touch focus event sequence; width checks alone were insufficient.
The image files and catalogue IDs are not the source of this lost-click defect.

## File-level impact and patch scope

| Path | Owner / inputs and outputs | Change and risk |
|---|---|---|
| `product-showcase/category-navigation.js` | Disclosure, DOM focus/pointer events, one close timer; emits validated selection and open-state callbacks | Preserve internal focus transfers; defer fallback until focus settles. Cancel the existing timer on focus/close/destroy. No new shared state. |
| `product-showcase/experience.js` | Sole selected-product and play preference owner; consumes navigation callbacks and drives director/details | Explicit menu selection pauses autoplay and resets elapsed progress; Play remains the resume command. Default URL/host/neighbor selection behavior stays intact. |
| `product-showcase/index.html` | Existing viewer markup and ordered deferred script loading | Version only the two repaired scripts so old cached source is not reused. |
| `service-worker.js` | Existing root static cache identity | Advance cache identity only; preserve routing, precache and storage policy byte-for-byte. |
| `tests/product-showcase-category.test.cjs` | Independent bounded DOM/controller verifier | Add native-order focus/tap and manual-selection pause regressions. |
| `tests/product-showcase.test.cjs` | Frozen original release parity verifier | Update the expected cache constant only; retain exact baseline reconstruction. |
| `docs/product-showcase/kids-expansion/MENU_TOUCH_FIX.md` | Feature audit, scope, verification and continuation record | Record the repair and evidence; never claim a device or live result before verification. |

Frozen: homepage HTML, all121 assets, catalogue records/order, styles, garment
annotations, scene animation/image owner, bootstrap protocol/routes, host popup
bridge, intro-video logic, all apps/auth/languages/business records and blueprints.

## Structure and call flow

Keep the existing bounded frontend feature under `product-showcase/`; no folders,
classes, dependencies or global state are added. Native tap/focus →
`CategoryNavigation` → `MotionExperience.select(..., {pause:true})` → existing
`CarouselState` and `SceneDirector`. Navigation owns only its cancellable close
timer. MotionExperience alone changes `playing` and elapsed slideshow progress.
No persistence, network endpoint, image transformation or parent API changes.
Existing kebab-case modules, PascalCase owners and mirrored test paths remain.

## Verification and rollback plan

1. Prove the previous handler fails internal touch focus transfer before applying
   the fix; verify K27/K28 and every category in the repaired event fixture.
2. Verify null focus destination, genuine outside focus, Escape, outside pointer,
   hover/focus bridge and destruction cleanup.
3. Verify selected-product identity and durable pause for changed and same-item
   selection; explicit Play resumes; route/host selection keeps its prior default.
4. Run both existing showcase Node gates, frozen source/intro checks and diff check.
5. Inspect repaired menu selection in browser at desktop and mobile widths, in
   standalone and embedded use. Record exact test scope; emulation is not an
   Android physical-device certification.
6. Obtain independent patch review, then publish with a non-forced main update
   guarded by the exact expected baseline. Verify Pages success, live source bytes
   and live Baby Short / Baby Dress selection.

Rollback: revert only this patch while retaining the baseline catalogue and assets;
use a newer cache identity for a rollback so stale source is not reintroduced.

## Gates

- Audit: **accepted** for the named feature files; independent reproduction agrees.
- Scope/implementation authorization: **accepted** under the owner's approved
  live-showcase task and current bug report.
- Execution and independent source compatibility proof: **accepted**.
- Production publication/live verification: this is the pre-publication source
  record. Resolve the GitHub Pages run for the commit containing this patch and
  compare public bytes before treating it as live; do not republish a successful
  deployment merely because this immutable source snapshot predates its result.

## Executed proof

Both `node tests/product-showcase-category.test.cjs` and
`node tests/product-showcase.test.cjs` pass, independently repeated by a reviewer.
`git diff --check` is clean. The new tests exercise the registered production
handlers and the actual controller start callback, select method and Play toggle.
All121 internal touch-focus transfers plus an All/K28 selection pass; null focus
destination, real focus exit, Escape/outside dismissal and teardown timer reentry
also pass. The same tests reject baseline `ac18bcf` independently for its lost
internal tap and its unpaused manual selection. Existing121 route/catalogue,
parent/iframe guards and36 intro scenarios continue to pass.

Browser preview evidence:

| Surface | Observed result |
|---|---|
| Desktop standalone | Baby Short K27 selected through menu; correct WebP; menu closed; playback paused. |
| 390 CSS px viewer | Baby Dress K28 image complete and visible; paused across a dwell longer than six seconds. |
| 320 CSS px viewer | Baby Short K27 selected and paused; menu dismissed. |
| Homepage inline | Baby Dress K28 selected; mode remains inline; paused. |
| Homepage popup | Baby Short K27 selected; mode remains modal; paused; popup closes normally. |
| Explicit Play | Playing state resumed, and an active390px viewer advanced from K28 through the Baby collection to K53. |

The browser checks use Chromium with actual desktop clicks and320/390px iframe
viewports. Native touch event ordering is covered separately in the event fixture.
Physical Android testing is not claimed. Chromium DevTools device emulation was
unavailable under its organization policy; no control or policy was bypassed.

Only the two repaired script URLs advance to `20261127-5`; immutable dependencies
remain at their existing versions. Cache identity becomes
`vesa-v126-showcase-menu-touch`; its policy is unchanged. The root homepage and
all121 catalogue/image bytes are unchanged from `ac18bcf`.
