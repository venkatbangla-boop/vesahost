# Homepage intro — first visit only

## Objective, baseline and authority
The owner reported repeated playback on refresh and section URLs, then authorized “Fix and livr”. This patch changes only intro eligibility and publishes through the existing repository/Pages route. Baseline main is `f847ae5fbe2b2a5c502be25f4d1efc8b6e7376f5`.

The preceding read-only audit reproduced `/#portfolio` refresh opening the welcome film. Public index/intro-script bytes matched this baseline. The early head unconditionally set the pending class, the deferred controller always played, and no persistent visit record existed. Root AGENTS.md, current Free-only/UI contracts and the applicable tracker were inspected. Historical freezes for unrelated app redesign do not override this explicit homepage-intro repair authorization. App trackers and business workflows remain outside this patch.

## Locked file impact and ownership
| Path | Responsibility and permitted change |
| --- | --- |
| `index.html` | Early `HomeIntroVisitGate` owns the first-visit decision and one persistent boolean. It records the visit before display and exposes the current document decision via a named root dataset attribute. Remove declarative video autoplay, use non-preloading media, and advance only the intro script URL. |
| `js/vesa-home-intro.js` | Existing bounded page-entry closure retains original film, sound, Skip and fade handling. Consume the early decision before making content inert or starting playback; exit on section navigation or page departure. No broader controller rewrite. |
| `service-worker.js` | Advance cache identity and the exact versioned intro script precache request only. Fetch policy, application exclusions and every other entry stay frozen. |
| `tests/vesa-home-intro-once.cjs` | New class-owned Node fixtures verify actual head/controller sources, persistent visits, refresh/deep links, blocked storage, lifecycle cleanup and exact source preservation. No browser automation in this file. |
| `tests/product-showcase.test.cjs` | Only necessary compatibility adaptation for the explicitly authorized intro patch; retain all showcase runtime, catalogue, host and original-source preservation checks. Do not broadly exempt future changes. |
| `docs/website/INTRO_FIRST_VISIT_RELEASE.md` | This audit, scope, verification and release record. Optional feature-owned JSON evidence may be added under `docs/website/intro-first-visit/`. |

Frozen: original video/poster/GIF bytes, intro CSS, root main JS/styles, showcase runtime/assets, login/auth/preferences, all apps/business calculations/storage, DNS, workflows and original blueprints.

## Structure and state contract
This remains the existing buildless, event-driven public frontend. No new runtime folder or framework. Kebab-case files retain their existing `js/`, `tests/` and `docs/website/` owners.

Call flow: early HTML gate → root decision → existing intro page entry → original controls/release. The gate is class-owned. The existing self-contained page entry remains a narrow native DOM startup exception; unrelated legacy functions are not refactored. No dependency on apps, authentication, showcase state or saved records is introduced.

Stable preference key: `vesa.home.intro.seen.v1`. A successful first write precedes any display/playback; later deployments must not rename this key just to replay the film. First section-link visits also record the visit. Reload/back-forward navigation and same-origin return navigation bypass playback. Unavailable/read-only storage fails open to the homepage. The per-document decision avoids rereading the just-written flag and suppressing the permitted first playback.

The flag is local to an origin/browser profile and contains no identity or viewing analytics. It cannot retroactively identify pre-fix visitors. Clearing site data or a new/private profile can create fresh state. Simultaneous first navigation in independent tabs is not claimed to be a cross-tab transaction.

## Approved patch plan and gates
One reversible patch group: first-visit eligibility. Audit and scope: **accepted**; implementation/publication are expressly authorized by the owner. Root implements the three runtime files; a separate agent owns tests/compatibility; independent review accepts or rejects the resulting patch.

Verification: first bare homepage visit, first section-link visit, normal completion, Skip, refresh mid-film, subsequent reload/visit/new tab, same-origin return, storage read/write failure, URL/scroll preservation, content unlocking, untouched film/sound/fade and showcase actions. Use bounded Node fixtures plus real CUA browser interactions in a managed preview. Existing login/source integrity and relevant showcase checks must pass. Verify exact-SHA Pages deployment and public served bytes after guarded non-force main update.

Rollback: revert only this bounded patch and publish a newer cache version. Preserve the existing preference key and other browser records; never clear user storage or force-push main.

## Execution and verification
The three runtime changes are implemented. The existing intro closure is retained; only eligibility and lifecycle exits change. No runtime folders, new UI controls, dependency packages or APIs were added. Intro CSS/media and all showcase/application runtime files remain byte-identical to the baseline.

Real Chromium CUA review used the managed preview and a local-only reset page. That page resets only the new intro key and uses referrer-free links for first-visit cases; it is outside the repository and is never published. Observed checks:

- Fresh bare homepage: the original video plays; the current document decision is `play` and intro script is v4.
- Refresh while the intro is active: no overlay, decision `skip`, main content not inert.
- Fresh `/#portfolio`: no intro. Refresh retains the section URL and scrolls to portfolio (observed section top 58.48 px beneath the header region).
- New tab in the same browser: homepage directly, no intro.
- First intro then Skip then reload: homepage directly, no intro.
- Natural playback: actual media time advanced, `paused` was false, and overlay detached after the film/fade without a forced media event.
- Section navigation during the active film: `/#contact` releases the overlay and content while the original per-document decision stays `play`.
- Showcase menu, return Home and Ladies L29 category popup continue to work; returning Home has no intro.

Node verification covers the actual inline gate/controller in bounded fixtures; it does not pretend to be a real DOM renderer. Tests include source preservation, unavailable storage, same-origin return, reload/back, completion/Skip, late playback promises and navigation during the final fade. Separate real-browser evidence covers visible behavior. Physical devices and other browser engines are not claimed.

Independent final source acceptance: **accepted**. A separate reviewer read the final runtime/test changes and reran all 36 intro scenarios, the full showcase suite, login GIF static proof, original blueprint integrity, JavaScript syntax and whitespace checks. Exact reconstruction and pinned source hashes matched the browser-tested candidate. The required approval for publication is the owner's “Fix and livr”.

Publication uses a new feature branch and guarded non-force updates. Exact-SHA Pages success, unchanged public source hashes and public refresh/section behavior are checked after promotion; no future deployment result is predeclared in this candidate record.
