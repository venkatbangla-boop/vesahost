# Chess Beast 360 — 3D Demo vs Real Playable App: Final Visual QA
Updated 2026-10-18. GitHub is the only durable work source.

## Tested candidate
- Feature branch: feature/chess-real-3d-mesh-20261018
- Original safe public main: 2a374c264b0700a2f044652da44ec417d8772a0e
- Source: licensed Poly Haven CC0 sculpted Staunton assets (six forms, white/black, 32 separate 3D instances); Three.js 0.180.0 MIT, vendored; nine 1K PBR textures; offline cached. The existing ChessEngine is authoritative.
- Real browser CI: https://github.com/venkatbangla-boop/vesahost/actions/runs/39145797620 **2/2 SUCCESS** (Chess, and original 19 garment app journeys).
- Updated release-test CI: https://github.com/venkatbangla-boop/vesahost/actions/runs/39146318601 **2/2 SUCCESS** (new public byte-parity assertions + all Chess/other-app regression).
- Fully disconnected offline reload: https://github.com/venkatbangla-boop/vesahost/actions/runs/39146313404 **PASS** (30 service-worker assets, 12 sculpt prototypes and 32 live pieces after reload).
- **Permanent actual visual evidence committed to this repository**, not a generated stand-in:
  - [1440px Showcase](chess-real-3d-images/showcase-1440.png) from actual Chromium Playwright rendering.
  - [1440px alternate 45-degree](chess-real-3d-images/diagonal-1440.png).
  - [390px mobile](chess-real-3d-images/mobile-390.png).
  - Provenance README in the image folder; verified screenshot source run 39145797620. Rendered with synthetic data only.

## Side-by-side criteria vs approved cinematic example
| Goal | Real app evidence | Result |
|---|---|---|
| Independently modeled solid pawn, rook, knight, bishop, queen, king (white/black) | 12 licensed PBR prototypes, 32 positioned instances, curved silhouettes and light/shadow | FUNCTIONAL + VISUAL PASS |
| Board thickness, carved pieces, realistic wood | Physically modeled frame and thick 3D surface, polished ivory/ebony and walnut/maple tiles | VISUAL CLOSE, different texture pattern |
| Rotatable 360 camera and clickable pieces | Drag mouse/touch with deliberate Rotate ON, Spin 45, Reset and Showcase presets; pixel readback and projection pick tested | PASS |
| True playable game, not rendered still | Core ChessEngine standard/960, capture, castling, promotion, undo, PDF, save/resume, AI preserved, full tests | PASS |
| Desktop/mobile uncluttered HUD | Unified VESA left/right dock, controls under board; 320-2040px and simulated iPhone WebKit | PASS automated |
| "Showcase" camera like reference | One-click camera tilt48 orbit10 spin8; source screenshot committed to GitHub | CLOSE camera perspective, not identical |
| Cinematic photography/plant, HDRI studio background, soft DOF | GPU PBR lights, CSS vignette, contact shadows; no separate photoreal room image | PARTIAL — not an exact reproduction |
| Reference image's decorative lower six-piece gallery | Actual pieces inspectable through rotating game board; no redundant decorative strip taking play area | INTENTIONAL DIFFERENCE |
| Native real Android and iPhone UAT | Only Playwright Chrome and iPhone WebKit emulation tested | NOT YET VERIFIED |

## Release decision
**Production-safe opt-in feature candidate.** The new Real 3D button is OFF by default. Existing 2D remains immediately playable; custom WebGL and 2D are independent fallback paths; no changed chess rules or saved-game format. Automated technical gates pass. Human art judgment should not be mislabeled as literal pixel-perfect demo replication: scenery and gallery differ. If the owner rejects this art approximation, revert *new production files* to the known baseline using an ordinary rollback commit; do not force-push or remove saved games.

No image in this folder is displayed as fake chess pieces in app runtime. It exists only for comparing ACTUAL WebGL outputs with the promotional mockup.

## Completed gates / original history
Original procedural WebGL art failed visual review because shapes looked blocky and lacked reflectance. That code was retained solely as fallback. Licensed CC0 sculpted models with PBR textures materially improved the live 3D pieces; the camera was iterated through straight, 45-degree and Showcase perspectives. This document replaces the former procedural-only failure verdict while keeping the unmet photoreal staging criteria explicit.
