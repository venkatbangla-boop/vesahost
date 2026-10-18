# Chess Beast 360 — Real WebGL vs Approved Demo (Visual QA)
Date 2026-10-18. **Verdict: FUNCTIONAL PASS, VISUAL PARITY NOT ACCEPTED.** Do not promote to main solely from automated geometry/pixel tests.

## Exact evidence
- True WebGL feature branch: \`feature/chess-real-3d-mesh-20261018\`.
- Full current code/regression on [Actions run #39139998083](https://github.com/venkatbangla-boop/vesahost/actions/runs/39139998083): **2 jobs SUCCESS** (Chess, and original 19 VESA apps). Screenshot artifact **chess-beast-v2-mobile-desktop-synthetic-screens**, including \`chess-real-3d/real-3d-starting-1440.png\`, \`real-3d-1440.png\` and \`real-3d-390.png\`.
- Earlier geometry/render run [#39139546965](https://github.com/venkatbangla-boop/vesahost/actions/runs/39139546965) PASS but screenshots examined and rejected due tiny board and black pieces blending into background. Second art pass [#39139998083](https://github.com/venkatbangla-boop/vesahost/actions/runs/39139998083) also visually inspected.
- Approved reference: owner-supplied ChatGPT-generated 16:9 cinematic mockup, "Chess Beast 360", polished wooden angled board with individually carved ivory/ebony pieces, studio lighting, realistic shadows/reflections, sidebars. This is **reference artwork**, never actual playable UI or code.

## Comparison of current actual screenshot against approved visual
| Requirement | Actual browser screenshot | Judgment |
|---|---|---|
| Real solid pieces, not flat SVG icons | 32 objects, six independently triangulated geometries (King 3954, Queen 11736, Knight 4572 vertices per type), directional lighting. Pieces rotate correctly with camera | TECHNICAL PASS |
| 3D wooden board depth and 360 camera | Raised 64 squares, thick frame, genuine perspective projection, functional mouse/touch orbit | TECHNICAL PASS |
| Camera filling central area | First pass too small; second pass wider and closer, foreground covers most board canvas | IMPROVED; PARTIAL |
| Physical-quality sculpted Staunton silhouettes | Current procedural knight/rook/crown have conspicuous polygonal/blocky edges; demo shows carved realistic shapes | VISUAL FAIL |
| Ivory and ebony PBR reflections | Second pass brighter, ebony readable but matte/gray vs photo-real glossy black; ivory cartoon-like | VISUAL FAIL |
| Natural walnut/maple grain | Procedural wavy stripes visible, unlike photographic wood fibers and veneer | VISUAL FAIL |
| Contact shadows and studio environment | Basic 2D shadow discs and radial-gradient ambience; demo has detailed ambient shadows, blurred photography, highlights and environment reflections | VISUAL FAIL |
| Original app functionality | Engine, save/resume, AI, move picking/capture/undo, PDF, 2D fallback, offline, 19 siblings PASS | FUNCTIONAL PASS |
| Mobile actual native devices | Android Chrome and iPhone WebKit **emulation** tested; physical-device hand testing absent | NOT VERIFIED |

## Approval / release decision
**Keep experimental source on feature branch. Stable production GitHub main stays at \`2a374c264b0700a2f044652da44ec417d8772a0e\`.** No production revert is required because real-3D experiment has **never been released** to main.

## Exact next art gate (no more fake image generation)
1. Locate verifiably licensed (ideally CC0) **actual 3D GLB meshes** for all six chess pieces, white and black material variants. Prefer local offline assets; verify license file/source in GitHub and documented redistribution rights; no silent reuse of an unlicensed demo image/model.
2. Vendor required MIT-licensed real-time PBR renderer **locally** (e.g. pinned Three.js) and integrate 12 piece materials with clearcoat/roughness/metalness + wood texture and physically plausible lights/shadow maps. Use current tested WebGL as reliable fallback if GLB fails. Preserve original 2D.
3. Draw live game state for 32 distinct piece model instances, preserve picks and legal chess engine input. Do not deploy render-only mockup.
4. Compare 1440 desktop and 390 mobile screenshot to demo; prioritize sculpted knight/crown, glossy ebony, ivory depth, wood realism, contact shadows, fill ratio, clean left/right sidebars. Review images manually and only claim equivalent if genuinely close.
5. Repeat dedicated real 3D tests, all Chess feature tests, all 19 sibling app regressions, offline packaging and public SHA-256 parity **on final main SHA** before promotion. Roll back via new commit if public regression, never force reset or remove saved data.

## Sources and optional licensed asset candidates (not yet shipped)
- Poly Haven chess set referenced by external 3D projects as **CC0**: validate canonical license and model file before vendoring.
- Khronos glTF sample asset chess set: validate specific model license before using; Khronos sample repo alone is not blanket image/model rights.
- Third-party GLB marketplaces: verify original author, CC0 evidence and exact file hash; don't depend on CDNs at runtime.
All online candidates are **research only**, not imported, tested, approved or licensed merely by appearing in search results.
