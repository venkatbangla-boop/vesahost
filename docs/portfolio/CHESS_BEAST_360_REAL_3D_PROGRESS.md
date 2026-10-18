## 2026-10-18 — TRUE sculpted model acceptance + smooth 3D motion (latest checkpoint)
- **Still NOT LIVE**; public \`main\` remains \`2a374c264b0700a2f044652da44ec417d8772a0e\`. Owner required close demo visual comparison before release. Do not silently promote WIP.
- [Real licensed 3D studio and special moves CI #39143503210](https://github.com/venkatbangla-boop/vesahost/actions/runs/39143503210) **2/2 SUCCESS**: genuine 12 Poly Haven sculpt shapes, 32 independent piece meshes, mouse/touch ray picking, 3D King/Rook castling, Queen promotion, undo, flipped board, switch 3D/2D, WebGL context-loss usable fallback. Android/desktop Chrome and emulated iPhone WebKit; 19 garment-app regression all PASS.
- [Smooth 3D animation CI #39144017401](https://github.com/venkatbangla-boop/vesahost/actions/runs/39144017401) **2/2 SUCCESS**: retain same 3D object on moves and castles, 140-ms subtle/188-ms expressive, Off instant, reduced-motion compliance; original chess/PDF/save/AI and 19 apps unchanged.
- **In-progress art pass** \`7efb5dbd\`, \`c52e4ed3\`, \`9e4ffe8b\`: desaturated walnut, darker lacquer frame, bounded tabletop, CSS bokeh studio ambience around a real WebGL scene, 45-degree orbit screenshot for manual comparison. Test run #39144427059 pending; **do not call it PASS until finished and screenshot inspected**.
- **Next uncompleted gates:** compare \`real-sculpted-cc0-diagonal-1440.png\` against owner-approved cinematic demo; verify WebGL/PBR offline restart on same device with network truly disconnected, then update \`CHESS_BEAST_360_REAL_3D_VISUAL_QA.md\`. Human physical device UAT not verified, exact pixel parity with generated photograph not claimed.
- **Continuity:** latest GitHub branch, workflows and this file are source of truth. Resume this exact art/offline acceptance gate, never redo prior accepted code or ask for old ZIP.

## NEW G3D-05 LICENSED SCULPTING PASS — GitHub-only checkpoint (2026-10-18)
**True source:** \`feature/chess-real-3d-mesh-20261018\`. **Stable public main:** \`2a374c264b0700a2f044652da44ec417d8772a0e\`. Realistic upgraded 3D is **NOT YET PUBLIC LIVE**.

- **Official CC0 asset downloaded, validated and COMMITTED to branch:** Poly Haven "Chess Set" sculpted by Riley Queen. The official Poly Haven API supplied a 1K glTF with 33 mesh nodes (board + 32 chess pieces), a 1.73 MB buffer, nine 1K PBR JPEG maps, official MD5s and manifest. Complete file bundle **6,983,829 bytes** and per-file SHA-256 manifest; **no runtime CDN**.
- **Offline files**: \`apps/chess-360/assets/real3d/chess_set_1k.gltf\`, \`chess_set.bin\`, \`textures/*.jpg\`, \`MANIFEST.json\`, \`LICENSE_CC0.txt\`. Reproducible build-time importer in \`tools/chess-real-3d-import.py\`, with 9 MB hard limit and licensed-source checks; [vendor CI evidence #39142051520](https://github.com/venkatbangla-boop/vesahost/actions/runs/39142051520) **SUCCESS**.
- **Pinned MIT renderer fully committed**: \`apps/chess-360/vendor/three.module.js\`, \`three.core.js\`, \`GLTFLoader.js\`, \`BufferGeometryUtils.js\`, \`THREE_LICENSE_MIT.txt\`; Three.js 0.180.0 from npm, local/no CDN; [vendor CI #39142524734](https://github.com/venkatbangla-boop/vesahost/actions/runs/39142524734) **SUCCESS**.
- **Actual prototype:** \`apps/chess-360/chess-real-3d-studio.mjs\` lazy-loads on explicit Real 3D ON, physically lit sculpted meshes, walnut/maple tactile board, soft shadows, 360 camera and perspective ray picking; \`index.html\` falls back automatically to the previously accepted custom WebGL and then 2D when necessary. Portable offline cache includes models and dependencies.
- **Pending mandatory proof:** Real browser Three.js load and screenshot parity under the updated \`tests/chess-real-3d-browser.cjs\`, then 3D capture/promotion/castling/flip/restore/context-loss, iPhone WebKit, 19-app regression, offline and visual comparison to approved demo. The pending CI run is not a PASS and **nothing has been merged into main**.
- **Do not skip the visual gate:** procedural first/second screenshots are distinctly below demo reference quality; sculpted licensed model must be inspected in browser after full load before promotion.
- **Exact next action:** check latest GH Actions \`Chess Beast 360 V2 acceptance\` for the branch, fix any Three imports or 3D scene rendering issue, retrieve \`real-sculpted-cc0-1440.png\` and mobile image, compare to provided original reference, then fix studio quality + synchronize full Chess rules. Commit and update this document. Only then consider guarded main.

# Chess Beast 360 — TRUE 3D Github continuation checkpoint
Last updated: 2026-10-18. Official requirements: [master blueprint](CHESS_BEAST_360_REAL_3D_MASTER_BLUEPRINT.md).

**Repo** \`venkatbangla-boop/vesahost\` | **feature branch** \`feature/chess-real-3d-mesh-20261018\`.
**Do not restart** previously accepted work. **Stable public main remains** \`2a374c264b0700a2f044652da44ec417d8772a0e\` — all original 20 routes are live; experimental true 3D is **NOT YET LIVE**.

## Status (only evidenced results)
| Gate | State | Evidence |
|---|---|---|
| G3D-00 GitHub blueprint, ownership, fallback contract | PASS | Master blueprint committed \`00fcdb50\`, tracker \`29a1a93a\` |
| G3D-01 independent true triangulated piece models and thick wood board | PASS | \`chess-real-3d-models.js\`, \`tests/chess-real-3d-models.cjs\`, six different solid XYZ shapes 12 color variations, 64 board tile extrusions; geometry PASS |
| G3D-02 actual offline WebGL rendering/lighting; no fake CSS pieces | Functional PASS (art pending) | \`chess-real-3d.js\`, pixel readback and 32 independent instances in Chromium desktop + mobile, iPhone WebKit PASS |
| G3D-03 360 mouse/touch orbit, real plane ray picks | PASS automated | Old camera driver emits events; new WebGL camera follows, no accidental chess moves, camera reset |
| G3D-04 synchronize authoritative engine | PASS focused paths; more cases pending | PvP four plies, real capture (piece count 31), Undo to 32; old full chess/Chess960/AI/clock/restore regression PASS |
| G3D-05 visual fidelity vs demo, WebGL on low-end/offline, iPhone Android manual | IN PROGRESS / NOT ACCEPTED | First screenshot is clearly less realistic than approved cinematic concept: board too small, camera top-down, ebony pieces too dark. Adaptive closer oblique camera, rim light and warmer wood patched and under CI recheck. Real physical devices not tested. |
| G3D-06 full acceptance, safe main and public Pages release | BLOCKED UNTIL VISUAL REVIEW | Feature branch only. Never claim real 3D live prematurely. |

## Files written/changed
- \`apps/chess-360/chess-real-3d-models.js\` — closed-style triangulated Y-up piece generators, independent pawn/rook/knight/bishop/queen/king and raised 8×8 board
- \`apps/chess-360/chess-real-3d.js\` — WebGL1 shader and scene, geometry buffers, diffuse/specular/wood, camera, ray interaction, safe 2D fallback
- \`apps/chess-360/chess-real-3d.css\` — true 3D overlay and user-facing controls
- \`apps/chess-360/index.html\` — visible Real 3D toggle, actual canvas and ChessEngine read-only rendering integration; existing DOM/ARIA 64 squares remain
- \`apps/chess-360/chess-orbit.js\` — camera events
- \`apps/chess-360/sw.js\` — all new static assets precached, preserves local vault/other apps
- \`tests/chess-real-3d-models.cjs\` and \`tests/chess-real-3d-browser.cjs\` — Node + real Chromium, WebKit tests; board-size visual threshold
- \`.github/workflows/chess-beast-v2.yml\` — CI gate includes true 3D, all existing Chess tests, and other 19 apps.

## Actual automated evidence
- [Feature source run #39139546965](https://github.com/venkatbangla-boop/vesahost/actions/runs/39139546965) **2 jobs SUCCESS**. Node six mesh bounds/vertex normals, 32 WebGL objects and GPU readPixels, 1440 & 390 Chromium, 390 iPhone WebKit, ray picking, mouse orbit, four-ply capture/undo, offline precache 14 assets, result/PDF, six AI tiers, old layout and 19 sibling apps.
- First run #39139418092 failed *test timing* on asynchronous camera reset; test awaited camera event and subsequent full run PASS.
- Original screenshot from PASS #39139546965 downloaded and **visually inspected**. Not accepted as final demo match; original snapshot had a narrow small board and extremely dark black pieces.
- Art pass commits \`8a7b36e5\` (camera/lighting), \`531b88b6\` (ambient), \`42a02fa6\` (visual occupancy and screenshots) passed [CI #39139998083](https://github.com/venkatbangla-boop/vesahost/actions/runs/39139998083) **2/2 SUCCESS**. Actual screenshot was downloaded and inspected. **Visual parity still FAILS**: polygonal pieces, flat gray ebony, artificial wood, missing PBR gloss/contact shadows/studio HDRI. See [exact visual QA verdict](CHESS_BEAST_360_REAL_3D_VISUAL_QA.md). Production main unchanged.

**Next uncompleted gate:** G3D-05 VISUAL ART FIDELITY. Prefer verifiably licensed CC0 actual GLB piece meshes + locally vendored PBR renderer while retaining current working WebGL + accessible 2D fallback. User asked for demo-equivalent visuals, not just a functional rotating checkerboard. Never represent this as released.

## Next exact steps
1. Read latest GitHub head and [visual QA comparison](CHESS_BEAST_360_REAL_3D_VISUAL_QA.md). Existing core implementation and six geometry meshes are complete/automated PASS. Do not rebuild those from scratch or publish current toy-quality mesh scene.
2. Download screenshot artifact of latest run; inspect \`chess-real-3d/real-3d-1440.png\`, \`real-3d-390.png\`, \`real-3d-starting-1440.png\`; compare manually with generated approved demo. If still small/dark/flat, improve mesh texture, wood, material smoothness, camera and studio ambience rather than falsely marking COMPLETE.
3. Add acceptance for promotion, castling, undo/redo/reload, both colors/flipped camera in real 3D, WebGL context loss and WebKit/Android mobile touch, including high-DPI performance. Keep old Chess regression passing.
4. Only when visual gate genuinely acceptable, full CI green and independent public byte parity verified: fast-forward/PR merge safely into main, monitor Pages and actual live screenshot; otherwise remain on feature branch. No force-push, no wiping saved games.
5. Update **this exact GitHub progress document** with new SHA and test results after each milestone. Do not rely on ChatGPT chat attachments, ask for old ZIP, restart previous apps, or instruct the user to do VS Code coding.
