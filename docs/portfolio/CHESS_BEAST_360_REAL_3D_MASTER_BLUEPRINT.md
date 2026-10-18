# Chess Beast 360 — REAL 3D Board & Individual Piece Models
**Source of truth: GitHub only** · 2026-10-18 · Owner-approved product direction
**Repository** \`venkatbangla-boop/vesahost\` · **App** \`apps/chess-360/\`
**Baseline (verified deployed)** \`2a374c264b0700a2f044652da44ec417d8772a0e\`
**Feature branch** \`feature/chess-real-3d-mesh-20261018\`
**Status**: Approved blueprint; implement safely in phases, updating \`docs/portfolio/CHESS_BEAST_360_REAL_3D_PROGRESS.md\` after every verified checkpoint.

## 0. User requirement (do not reinterpret)
The provided 16:9 concept image depicts a *real, volumetric* chess board, not merely a CSS-tilted image. Build a game: every one of the 32 pieces must be a distinct solid 3D mesh instance (six piece classes each for white/black), independent depth, specular material, lighting, perspective, contact shadows and proper rotations. Board must show thickness, edge wood, alternating walnut/maple squares. Drag with mouse or touch to orbit 360 degrees; keep a useful overhead view, reset camera, flip perspective and click/tap moves. Match the demo image visually as far as an offline WebGL browser can render it. **A generated image is only visual reference and must never replace the interactive board.**

## 1. Architectural decision and constraints
- **Preserve** the existing ChessEngine, six AI tiers, worker, legal moves, selection, clock, history, Chess960, variants, puzzles, PGN/FEN, save/reload, offline vault, PDF, accessibility, responsive sidebars and all original 19 VESA applications.
- Feature-flag enhanced **Real 3D** as an additive optional renderer. Default stays stable, accessible **2D** for instant loading and unsupported devices. Revert button must return to 2D without resetting match state or clocks.
- First implementation: **locally self-contained WebGL** with procedurally generated, separately instantiated board/piece triangle meshes (offline, zero CDN/runtime account/dependency). A renderer abstraction leaves the door open for future vetted, locally vendored Three.js + Blender-exported GLB replacements; **do not pretend procedural meshes are Blender models**.
- Optional future \`assets/chess-3d/*.glb\` set from genuine licensed/procedural Blender exports only if actually produced, rights checked, bytes committed and offline caching/tests passing. Never store empty placeholder GLBs.
- All 3D files are committed **in repository**. No separate server, paid plugin, SaaS or forced local VS Code workflow; GitHub Free and GitHub Pages static scope only. Local saved games remain local.
- A WebGL failure/context loss must fail-soft back to playable 2D, not blank screen. Respect prefers-reduced-motion and battery/device pixel ratio limits.
- Source gameplay state is **the existing ChessEngine only**, not a second chess engine or modified chess rules. 3D scene reads current \`engine.board[64]\` and move hints; it has no authority to change clocks/save/match result. Input routes to existing \`onSquareClick(sq)\` using projection/raycast or original accessible DOM grid.
- Never claim exact pixel match to cinematic image until comparison screenshots are produced and evaluated. The concept image has studio photography/DOF that a light procedural renderer may not fully match; record residual difference honestly.

## 2. Piece meshes — real volumetric assets
12 identifiable 3D variants (six silhouettes × white/black materials):
| Type | Geometric 3D construction | Visual recognition |
|---|---|---|
| Pawn | tapered revolving shaft, sphere cap, stepped circular base | round head |
| Rook | column and crenellated turret/castle rim | four battlements |
| Knight | true **extruded 3D horse-head silhouette**, mane/ears/muzzle/eye on both sides, bevel-like depth | horse facing forward |
| Bishop | lathed tapered mitre, ornamental slit/collar and sphere finial | bishop mitre |
| Queen | fluted body, open crown with distinct raised tips and finials | crown |
| King | tall stem, crown collar, vertical and horizontal intersecting cross volume | cross |
Every piece instance has its own model transform and material assignment, volume and physically meaningful shading (vertex normals, diffuse/specular), contact shadow under base, selectable square reference, testable object identity. High-quality geometry should remain clear at mobile sizes. Use indexed triangles and draw calls batched by material/mesh where possible. Capture removes actual mesh instance, promotion switches mesh type, castling moves both pieces, history/undo/redo syncs all.

## 3. Board/camera
- 8×8 solid board with separate square top, edge skirt, subtle dark wood frame/border and alternating warm walnut/maple. Dedicated highlight quads for selected, last move, legal destinations, check; arrows OFF by default.
- Correct perspective matrix with world-space z-up/y-up choice documented; orthographic/top-down view option; yaw unrestricted modulo 360, tilt clamped 15–75deg to keep surface visible, zoom safe.
- Camera always frames all 64 squares and chess pieces: no clipping at 320,390,768,1024,1366,1440,2040 CSS pixels and Chrome 67/100/125/200% effective layouts; responsive DPR cap ≤2, low-end quality toggle if necessary.
- Distinguish interactions: "Rotate board" mode intentionally captures drag so it never makes a move; "Move pieces" mode uses the original click/tap and keyboard grid; accessible controls for rotate left/right, tilt and reset. Camera angle persists independently of saved chess records. Support flip board correctly.
- Show 3D controls in a **discoverable** left navigation option and accessible toolbar directly below board. No hidden controls tucked away in a collapsed Appearance menu only.

## 4. Integration boundaries
- New \`apps/chess-360/chess-real-3d.js\`: self-contained renderer, piece geometry generators, scene lifecycle, sync from board, error/context-loss fallback, diagnostics. No inline remote script/CDN.
- New \`apps/chess-360/chess-real-3d.css\`: canvas overlay, camera docking/piece shadow/fallback, responsive display.
- Minimal, explicit changes to \`index.html\`: load files, add toggle/feedback + connect renderer to \`renderBoard\`, flip, existing 3D toggle and camera events. Original DOM 64-square chessboard remains keyboard-accessible under 3D overlay; retain non-3D view when WebGL unavailable.
- Adjust \`chess-orbit.js\` to emit camera events while keeping existing public contract and persistence key \`chess_beast_orbit_camera_v1\`. Disable CSS-only perspective transform while real WebGL mode is active.
- \`sw.js\`: bump chess-only cache; pre-cache new static assets. No deleting other app caches, user games or root service worker data.
- Do not touch TNA/PPM/AQL calculations or other apps.

## 5. Interaction and performance acceptance
- Real browser verification (Chromium & WebKit iPhone emulation) assert canvas WebGL context and **32 independent mesh instances** at starting FEN, material colors, unique square mapping, >0 non-coplanar 3D dimensions for each type, especially Knight and King.
- Verify a legal move changes 3D scene at same FEN/ply; capture reduces count; promotion creates correct type; castling includes rook; undo/redo, Chess960 and saved restore re-render, no mismatch; white/black flipped board coordinates.
- Mouse/touch 360 orbit changes projected geometry and camera state while board and all pieces remain visible; reset returns saved initial pose; no accidental chess move during orbit.
- Game completion popup, PDF, save/resume and all six AI tiers unchanged. No alert in console, input dead zones, blank canvas; loss of WebGL context gracefully reverts to usable 2D.
- Measure startup/long-task frame timing vs Chess V2 baseline and test at 320,390,768,1024,1200,1366,1440,2040 + WebKit iPhone, Android Chrome emulation; physical device UAT **UNVERIFIED** until actually performed.
- Take screenshots of live UI & model closeups; visually compare against approved generated 3D mockup. Record which aesthetic details match (wood, ivory/ebony, silhouette, shadows, depth, controls, layouts), and gaps (image is a cinematic render with HDRI/background); don't falsify percentages or claim exact match.
- All sibling 19-app automated tests and GitHub Pages/public SHA-256 byte parity must PASS before main promotion. If regression, **do not publish**; keep stable main and fix feature branch. If post-publish regression, use fast-forward restore commit of stable source (not force push and never wipe saved records).

## 6. Order of execution and acceptance gates
1. G3D-00 current code audit + this blueprint + immutable stable \`main\` SHA (in GitHub) ✅ baseline documented.
2. G3D-01 procedural solid mesh library (board and six types) + Node unit checks + true per-piece 3D geometry.
3. G3D-02 WebGL scene with lights/shadows/materials, 2D fallback and WebGL context recovery; 32 visible pieces.
4. G3D-03 orbit camera, accessible controls and interaction separation; keyboard, touch & mouse.
5. G3D-04 synchronise live ChessEngine state, captures, promotions, Chess960, history/undo, AI; keep clocks/results intact.
6. G3D-05 responsive, offline service worker, performance, accessibility and actual browser screenshots. Compare demo aesthetic honestly.
7. G3D-06 independent Chess + 19-app regressions, exact public bytes, release note, safe non-force main & Pages deployment. **Human/native device sign-off remains separate.**

## 7. Continuity instructions (for next ChatGPT Work/GitHub session)
1. Get actual GitHub \`main\`, branch \`feature/chess-real-3d-mesh-20261018\`, Actions runs; use latest actual SHA, not a stale summary.
2. Read \`AGENTS.md\`, \`VESA_RESUME_PROMPT.md\`, \`docs/portfolio/CHESS_BEAST_360_REAL_3D_MASTER_BLUEPRINT.md\` and \`docs/portfolio/CHESS_BEAST_360_REAL_3D_PROGRESS.md\` first. Resume the **first incomplete gate**, do not rewrite completed gates or re-request uploads.
3. Keep changes on feature branch while incomplete. Commit each validated milestone, update progress document with commits, passed/failed tests and exact next step. Protect other 19 apps.
4. Do not infer that conversations stay running in the background. Work resumes on a subsequent message/session from committed GitHub state; no manual VS Code/Codex steps should be requested.
5. Only claim "LIVE" if GitHub Pages deployment and independent public-browser SHA-256 parity on the final main SHA succeeded.

### Chosen technical path vs original demo suggestion
Blender/Three.js/GLB are suitable for a photoreal asset polish pass, but *not a requirement for a functional true 3D model*. A deterministic locally committed WebGL mesh generator produces actual volumetric objects without external dependencies. The visual comparison gate is still required. If a future GLB art pass is genuinely made, record the provenance/rights, 12+ assets, sizes, export settings, and mobile/offline measurements. Never replace a working app with a static screenshot.
