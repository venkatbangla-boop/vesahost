# VESA AQL G3 — Actual Chromium Cold-Load and Scroll Profile

Date: 2026-10-18. **Audit only; no AQL code, sampling/Ac-Re, records, reports, service worker or UI has been changed.** Root public homepage remains frozen.

Source is the exact released 11,783,142-byte \`apps/aql/index.html\`. This source contains 294 embedded Base64 media URLs (291 PNG, three JPEG, 10,715,539 bytes, 90.94% of raw HTML) and 99 declared JavaScript classes, including stage, decision, evidence, quality and report modules. [Complete source inventory CI #39063360880 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39063360880).

## Executed proof

[Chromium lab #39063920076 SUCCESS](https://github.com/venkatbangla-boop/vesahost/actions/runs/39063920076): clean Chromium context for each of four runs, local no-store HTTP server streaming exact HTML bytes, synthetic browser-only logged-in QA fixture. Actually opened AQL, selected the fictional Apparel Practice Example and scrolled its inspection through six scroll positions. Captured 390px and 1440px screenshots, DOM load/paint, long-task observer and heap readings. Existing AQL SamplingEngine/AR11 Node guard and real Chromium unified-shell verification PASS. Zero JavaScript page errors and no horizontal page overflow.

| Lab reading | 390px, 4× artificial CPU slowdown | 1440px, 1× CPU |
|---|---:|---:|
| Runs | 2 | 2 |
| HTML response-end | 475–479 ms | 148–151 ms |
| DOM content loaded | 1,169–1,189 ms | 315–320 ms |
| Synthetic inspection ready after click path | 1,779–1,832 ms | 544–572 ms |
| First-contentful paint | ~272 ms | 108–112 ms |
| Cumulative observed long tasks | 646–659 ms | 112–114 ms |
| Largest observed long task | 491–499 ms | 112–114 ms |
| JS heap used during inspection | ~58 MB | ~58 MB |
| DOM elements in synthetic apparel inspection | 564 | 564 |
| Actual image elements in inspection DOM | 2 | 2 |
| Document height in current inspection | 4,745px | 2,997px |

**Interpretation:** This is a reproducible **source startup-cost signal**, consistent with a large image-embedded monolith. The 291 inline PNG payloads far exceed the two actual DOM image elements observed in one sample inspection, but this alone does **not prove** the other PNGs are unused: they may serve reports, exports, galleries, other modes or offline cases. Repeated scroll 2-rAF samples were ~30–35 ms but are **not an INP or real input-latency benchmark**, and should not be marketed as smooth device performance.

**Limits:** Localhost uncompressed transfers, Chromium synthetic throttling, GitHub hosted Linux runner; not the actual Pages CDN, not Android/iOS physical battery/memory, not a browser camera/report-heavy fixture. The four cases do not establish statistical performance improvement because no production change was made.

## Source/architecture options and change authorization

1. **Exact asset/dependency audit (NEXT P1):** inspect where the 291 PNG literals are referenced in the 11.4 MB script, which appear only in specific report/gallery views and which must always be accessible offline. Produce a path/owner/use-case map before changing bytes.
2. **Safety candidates:** move rarely-used evidence/report templates to correctly versioned static files; load on the click requiring them, keep same quality and avoid image-data proliferation. Preserve exact report/PDF output, AQL result and older saved records. Network bytes might move to more requests, not automatically shrink; tune only after BEFORE/AFTER trace.
3. **Potential quick gain constraint:** only two repeated media occurrences, ~226 KB possible raw dedup. Do not launch a blind 10 MB dedup/refactor. Prefer measured, app-scoped reversible media extraction over changing the sampling engine.
4. **Regression gate:** existing AQL 35 area/60 requirement controls, Ac/Re and AR11, PPM/TNA and browser-local offline, actual PDF report output, language UI, saved copies/import; real Chromium 320/390/768/1280/1440/1920 and print, same synthetic fixture and same CPU/network lab before/after. Only release if exactly measured and compatibility passed.

**Verdict:** \`accepted\` as read-only source/cold-load/inspection audit; \`conditional\` for any future media optimization. **No app runtime defect or enhancement release claimed.**

## Portfolio next action

User requests AQL-grade workflow depth, not 12MB copied into other apps. The app-by-app implementation plan is \`docs/portfolio/16_AQL_DEPTH_BENCHMARK_AND_19_APP_WORKPLAN.md\`. **Continue at G4-W1 Packing & Container:** code owner \`apps/packing-container/index.html\`, report/math/store behavior frozen, existing 8 editor modules (\`summary, order, cartons, packs, containers, loads, reports, revision\`) hidden behind New/Practice on the home screen. Read the exact original APP-01 blueprint, current tests and real open/preview interactions; work on making those real capabilities discoverable, not adding made-up container loadability rules. Re-run original Packing domain and browser, plus App Centre, offline asset and 19-route sibling tests. No public homepage edit.
